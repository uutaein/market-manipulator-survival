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

  if (isPositionReducingAction(actionId) && state.holdingRatio <= 0) {
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

  if (isPositionReducingAction(actionId) && state.holdingRatio <= 0) {
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

export function cancelManualAction(state: IntradayState, actionId: ManualActionId): IntradayState {
  if (!state.activeManualActionEffects.some((effect) => effect.actionId === actionId)) {
    return state;
  }

  return clampIntradayState({
    ...state,
    manualActionCooldowns: {
      ...state.manualActionCooldowns,
      [actionId]: 0
    },
    activeManualActionEffects: state.activeManualActionEffects.filter((effect) => effect.actionId !== actionId)
  });
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
  const appliedActionIds = new Set<ManualActionId>();
  const activeManualActionEffects = state.activeManualActionEffects.flatMap((effect) => {
    const action = manualActionValues[effect.actionId];
    const appliedSeconds = Math.min(seconds, effect.remainingSec);
    const fraction = effect.totalSec > 0 ? appliedSeconds / effect.totalSec : 1;
    const remainingSec = Math.max(0, effect.remainingSec - seconds);
    const cardMultiplier = getActionEffectMultiplier(state, effect.actionId);
    const surveillanceMultiplier = getActionSurveillanceMultiplier(state, effect.actionId);
    const impactMultiplier = getActionImpactMultiplier(state, effect.actionId);

    const pressureBonus = effect.actionId === "liquidity_supply" ? state.liquiditySupplyPressureBonus : 0;

    if (appliedSeconds > 0) {
      appliedActionIds.add(effect.actionId);
    }

    effectDelta.marketPressure += (action.marketPressureDelta + pressureBonus) * cardMultiplier * impactMultiplier * fraction;
    effectDelta.marketLiquidity += action.marketLiquidityDelta * cardMultiplier * fraction;
    effectDelta.personalParticipation += action.personalParticipationDelta * cardMultiplier * impactMultiplier * fraction;
    effectDelta.holdingRatio += action.holdingRatioDelta * fraction;
    effectDelta.surveillance += action.surveillanceDelta * surveillanceMultiplier * fraction;
    effectDelta.volatility += action.volatilityDelta * cardMultiplier * impactMultiplier * fraction;

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
  return updatePositionAccountingForActionProgress(state, stateAfterStats, appliedActionIds);
}

export function getManualActionBudgetDelta(state: IntradayState, actionId: ManualActionId): number {
  const action = manualActionValues[actionId];

  if (actionId !== "position_settlement") {
    return action.budgetDelta;
  }

  const positionMarketValue = getNormalizedPositionMarketValue(state);
  const settlementRatio = getPositionSettlementRatio(state, action);
  return round1(clamp(positionMarketValue * settlementRatio * 0.92, 0, 24));
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

function getActionImpactMultiplier(state: IntradayState, actionId: ManualActionId): number {
  if (actionId === "position_settlement") {
    return state.positionSettlementImpactMultiplier;
  }

  return 1;
}

function getPositionSettlementRatio(state: IntradayState, action: { readonly holdingRatioDelta: number }): number {
  if (state.holdingRatio <= 0 || action.holdingRatioDelta >= 0) {
    return 0;
  }

  return clamp(Math.abs(action.holdingRatioDelta) / state.holdingRatio, 0, 1);
}

function getNormalizedPositionMarketValue(state: IntradayState): number {
  if (state.averageEntryPrice <= 0 || state.holdingRatio <= 0) {
    return 0;
  }

  return state.holdingRatio * (state.currentPrice / state.averageEntryPrice);
}

function updatePositionAccountingForActionProgress(
  previousState: IntradayState,
  nextState: IntradayState,
  appliedActionIds: ReadonlySet<ManualActionId>
): IntradayState {
  const unitDelta = nextState.heldUnits - previousState.heldUnits;

  if (unitDelta > 0) {
    const acquisitionPrice = roundToTick(
      nextState.currentPrice * (1 + acquisitionPricePremiumPercent / 100),
      runDefaults.openingPriceTick
    );
    const purchaseCost = appliedActionIds.has("price_push")
      ? getNormalizedPurchaseBudgetCost(nextState, unitDelta, acquisitionPrice)
      : 0;
    const paidPurchaseCost = round1(Math.min(purchaseCost, nextState.budget));
    const affordableState =
      purchaseCost > paidPurchaseCost
        ? clampIntradayState({
            ...nextState,
            budget: nextState.budget - paidPurchaseCost,
            holdingRatio:
              previousState.holdingRatio +
              (nextState.holdingRatio - previousState.holdingRatio) * (purchaseCost > 0 ? paidPurchaseCost / purchaseCost : 0)
          })
        : clampIntradayState({
            ...nextState,
            budget: nextState.budget - paidPurchaseCost
          });
    const actualUnitDelta = Math.max(0, affordableState.heldUnits - previousState.heldUnits);

    if (actualUnitDelta <= 0) {
      return clampIntradayState({
        ...affordableState,
        averageEntryPrice: previousState.averageEntryPrice
      });
    }

    const previousCost = previousState.averageEntryPrice * previousState.heldUnits;
    const addedCost = acquisitionPrice * actualUnitDelta;
    const averageEntryPrice = roundToTick(
      (previousCost + addedCost) / Math.max(1, previousState.heldUnits + actualUnitDelta),
      runDefaults.openingPriceTick
    );

    return clampIntradayState({
      ...affordableState,
      averageEntryPrice
    });
  }

  if (nextState.heldUnits <= 0) {
    return clampIntradayState({
      ...nextState,
      averageEntryPrice: nextState.currentPrice
    });
  }

  if (unitDelta < 0 && appliedActionIds.has("overheat_cooldown") && !appliedActionIds.has("position_settlement")) {
    const lowerReferencePrice = Math.min(nextState.currentPrice, previousState.averageEntryPrice);
    const compression = Math.min(
      previousState.averageEntryPrice * 0.012,
      Math.max(0, previousState.averageEntryPrice - lowerReferencePrice) * 0.25
    );

    if (compression > 0) {
      return clampIntradayState({
        ...nextState,
        averageEntryPrice: roundToTick(previousState.averageEntryPrice - compression, runDefaults.openingPriceTick)
      });
    }
  }

  return nextState;
}

function isPositionReducingAction(actionId: ManualActionId): boolean {
  return manualActionValues[actionId].holdingRatioDelta < 0;
}

function getNormalizedPurchaseBudgetCost(state: IntradayState, unitDelta: number, acquisitionPrice: number): number {
  if (state.fictionalFloatUnits <= 0 || state.openingPrice <= 0 || unitDelta <= 0) {
    return 0;
  }

  const holdingRatioDelta = (unitDelta / state.fictionalFloatUnits) * 100;
  return round1(holdingRatioDelta * (acquisitionPrice / state.openingPrice));
}

function roundToTick(value: number, tick: number): number {
  return Math.max(tick, Math.round(value / tick) * tick);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
