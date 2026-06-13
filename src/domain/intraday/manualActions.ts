import {
  getManualActionByDisplayName,
  manualActionIds,
  manualActionValues,
  type ManualActionId,
  type ManualActionValue
} from "../balancing/manualActionValues";
import { runDefaults } from "../balancing/runDefaults";
import { applyIntradayStatUpdate, clamp, clampIntradayState, type IntradayState } from "./intradayState";

export interface ManualActionResult {
  readonly state: IntradayState;
  readonly action: ManualActionValue | null;
  readonly applied: boolean;
  readonly budgetDelta: number;
  readonly reason: "applied" | "paused" | "cooldown" | "insufficient_budget" | "no_position" | "unknown_action";
}

export const manualActions = Object.values(manualActionValues);

const acquisitionPricePremiumPercent = 6;

export function getManualActionDisplayNames(): readonly string[] {
  return manualActions.map((action) => action.displayName);
}

export function isManualActionId(value: string): value is ManualActionId {
  return manualActionIds.includes(value as ManualActionId);
}

export function resolveManualActionId(actionIdOrDisplayName: string): ManualActionId | null {
  if (isManualActionId(actionIdOrDisplayName)) {
    return actionIdOrDisplayName;
  }

  return getManualActionByDisplayName(actionIdOrDisplayName)?.id ?? null;
}

export function areManualActionsAvailable(state: IntradayState): boolean {
  return !state.isPaused;
}

export function canUseManualAction(state: IntradayState, actionId: ManualActionId): boolean {
  if (!areManualActionsAvailable(state)) {
    return false;
  }

  if (state.manualActionCooldowns[actionId] > 0) {
    return false;
  }

  if (actionId === "position_settlement" && state.holdingRatio <= 0) {
    return false;
  }

  return state.budget + getManualActionBudgetDelta(state, actionId) >= 0;
}

export function useManualAction(state: IntradayState, actionIdOrDisplayName: string): ManualActionResult {
  const actionId = resolveManualActionId(actionIdOrDisplayName);

  if (!actionId) {
    return {
      state,
      action: null,
      applied: false,
      budgetDelta: 0,
      reason: "unknown_action"
    };
  }

  const action = manualActionValues[actionId];

  if (state.isPaused) {
    return {
      state,
      action,
      applied: false,
      budgetDelta: 0,
      reason: "paused"
    };
  }

  if (state.manualActionCooldowns[actionId] > 0) {
    return {
      state,
      action,
      applied: false,
      budgetDelta: 0,
      reason: "cooldown"
    };
  }

  if (actionId === "position_settlement" && state.holdingRatio <= 0) {
    return {
      state,
      action,
      applied: false,
      budgetDelta: 0,
      reason: "no_position"
    };
  }

  const budgetDelta = getManualActionBudgetDelta(state, actionId);

  if (state.budget + budgetDelta < 0) {
    return {
      state,
      action,
      applied: false,
      budgetDelta: 0,
      reason: "insufficient_budget"
    };
  }

  const nextState = applyIntradayStatUpdate(
    {
      ...state,
      budget: state.budget + budgetDelta,
      lastManualActionId: action.id,
      manualActionCooldowns: {
        ...state.manualActionCooldowns,
        [action.id]: action.cooldownSec
      },
      activeManualActionEffects: [
        ...state.activeManualActionEffects,
        {
          actionId: action.id,
          remainingSec: action.cooldownSec,
          totalSec: action.cooldownSec
        }
      ]
    },
    {}
  );

  return {
    state: nextState,
    action,
    applied: true,
    budgetDelta,
    reason: "applied"
  };
}

export function tickManualActionCooldowns(state: IntradayState, seconds: number = runDefaults.intradayDurationSec): IntradayState {
  if (state.isPaused) {
    return state;
  }

  const cooldowns = Object.fromEntries(
    manualActionIds.map((actionId) => [actionId, Math.max(0, state.manualActionCooldowns[actionId] - seconds)])
  ) as Record<ManualActionId, number>;
  const effectDelta = {
    marketPressure: 0,
    marketLiquidity: 0,
    personalParticipation: 0,
    holdingRatio: 0,
    surveillance: 0,
    volatility: 0
  };
  const activeManualActionEffects = state.activeManualActionEffects.flatMap((effect) => {
    const action = manualActionValues[effect.actionId];
    const appliedSeconds = Math.min(seconds, effect.remainingSec);
    const fraction = effect.totalSec > 0 ? appliedSeconds / effect.totalSec : 1;
    const remainingSec = Math.max(0, effect.remainingSec - seconds);
    const cardMultiplier = getActionEffectMultiplier(state, effect.actionId);
    const surveillanceMultiplier = getActionSurveillanceMultiplier(state, effect.actionId);

    const pressureBonus = effect.actionId === "liquidity_supply" ? state.liquiditySupplyPressureBonus : 0;

    effectDelta.marketPressure += (action.marketPressureDelta + pressureBonus) * cardMultiplier * fraction;
    effectDelta.marketLiquidity += action.marketLiquidityDelta * cardMultiplier * fraction;
    effectDelta.personalParticipation += action.personalParticipationDelta * cardMultiplier * fraction;
    effectDelta.holdingRatio += action.holdingRatioDelta * fraction;
    effectDelta.surveillance += action.surveillanceDelta * surveillanceMultiplier * fraction;
    effectDelta.volatility += action.volatilityDelta * cardMultiplier * fraction;

    return remainingSec > 0 ? [{ ...effect, remainingSec }] : [];
  });

  const stateAfterStats = applyIntradayStatUpdate(
    {
      ...state,
      manualActionCooldowns: cooldowns,
      activeManualActionEffects
    },
    {
      marketPressure: state.marketPressure + effectDelta.marketPressure,
      marketLiquidity: state.marketLiquidity + effectDelta.marketLiquidity,
      personalParticipation: state.personalParticipation + effectDelta.personalParticipation,
      holdingRatio: state.holdingRatio + effectDelta.holdingRatio,
      surveillance: state.surveillance + effectDelta.surveillance,
      volatility: state.volatility + effectDelta.volatility
    }
  );
  return updatePositionAccountingForActionProgress(state, stateAfterStats);
}

export function getManualActionBudgetDelta(state: IntradayState, actionId: ManualActionId): number {
  const action = manualActionValues[actionId];

  if (actionId !== "position_settlement") {
    return action.budgetDelta;
  }

  const positionMarketValue = (state.currentPrice * state.heldUnits) / runDefaults.fictionalLedgerScale;
  return round1(clamp(positionMarketValue * 0.78, 6, 42));
}

function getActionEffectMultiplier(state: IntradayState, actionId: ManualActionId): number {
  if (actionId === "price_push") {
    return state.manualActionEffectMultiplier * state.pricePushEffectMultiplier;
  }

  if (actionId === "overheat_cooldown") {
    return state.manualActionEffectMultiplier * state.overheatCooldownEffectMultiplier;
  }

  return 1;
}

function getActionSurveillanceMultiplier(state: IntradayState, actionId: ManualActionId): number {
  if (actionId === "price_push" || actionId === "liquidity_supply") {
    return state.upwardActionSurveillanceMultiplier;
  }

  if (actionId === "position_settlement") {
    return state.positionSettlementSurveillanceMultiplier;
  }

  return 1;
}

function updatePositionAccountingForActionProgress(previousState: IntradayState, nextState: IntradayState): IntradayState {
  const unitDelta = nextState.heldUnits - previousState.heldUnits;

  if (unitDelta > 0) {
    const acquisitionPrice = roundToTick(
      Math.max(nextState.currentPrice, previousState.averageEntryPrice) * (1 + acquisitionPricePremiumPercent / 100),
      runDefaults.openingPriceTick
    );
    const previousCost = previousState.averageEntryPrice * previousState.heldUnits;
    const addedCost = acquisitionPrice * unitDelta;
    const averageEntryPrice = roundToTick(
      (previousCost + addedCost) / Math.max(1, previousState.heldUnits + unitDelta),
      runDefaults.openingPriceTick
    );

    return clampIntradayState({
      ...nextState,
      averageEntryPrice
    });
  }

  if (nextState.heldUnits <= 0) {
    return clampIntradayState({
      ...nextState,
      averageEntryPrice: nextState.currentPrice
    });
  }

  return nextState;
}

function roundToTick(value: number, tick: number): number {
  return Math.max(tick, Math.round(value / tick) * tick);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
