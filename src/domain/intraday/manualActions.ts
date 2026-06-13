import {
  getManualActionByDisplayName,
  manualActionIds,
  manualActionValues,
  type ManualActionId,
  type ManualActionValue
} from "../balancing/manualActionValues";
import { runDefaults } from "../balancing/runDefaults";
import { applyIntradayStatUpdate, type IntradayState } from "./intradayState";

export interface ManualActionResult {
  readonly state: IntradayState;
  readonly action: ManualActionValue | null;
  readonly applied: boolean;
  readonly reason: "applied" | "paused" | "cooldown" | "insufficient_budget" | "unknown_action";
}

export const manualActions = Object.values(manualActionValues);

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
  const action = manualActionValues[actionId];

  if (!areManualActionsAvailable(state)) {
    return false;
  }

  if (state.manualActionCooldowns[actionId] > 0) {
    return false;
  }

  return state.budget + action.budgetDelta >= 0;
}

export function useManualAction(state: IntradayState, actionIdOrDisplayName: string): ManualActionResult {
  const actionId = resolveManualActionId(actionIdOrDisplayName);

  if (!actionId) {
    return {
      state,
      action: null,
      applied: false,
      reason: "unknown_action"
    };
  }

  const action = manualActionValues[actionId];

  if (state.isPaused) {
    return {
      state,
      action,
      applied: false,
      reason: "paused"
    };
  }

  if (state.manualActionCooldowns[actionId] > 0) {
    return {
      state,
      action,
      applied: false,
      reason: "cooldown"
    };
  }

  if (state.budget + action.budgetDelta < 0) {
    return {
      state,
      action,
      applied: false,
      reason: "insufficient_budget"
    };
  }

  const nextState = applyIntradayStatUpdate(
    {
      ...state,
      budget: state.budget + action.budgetDelta,
      lastManualActionId: action.id,
      manualActionCooldowns: {
        ...state.manualActionCooldowns,
        [action.id]: action.cooldownSec
      }
    },
    {
      marketPressure: state.marketPressure + action.marketPressureDelta,
      marketLiquidity: state.marketLiquidity + action.marketLiquidityDelta,
      personalParticipation: state.personalParticipation + action.personalParticipationDelta,
      holdingRatio: state.holdingRatio + action.holdingRatioDelta,
      surveillance: state.surveillance + action.surveillanceDelta,
      volatility: state.volatility + action.volatilityDelta
    }
  );

  return {
    state: nextState,
    action,
    applied: true,
    reason: "applied"
  };
}

export function tickManualActionCooldowns(state: IntradayState, seconds = runDefaults.intradayDurationSec): IntradayState {
  const cooldowns = Object.fromEntries(
    manualActionIds.map((actionId) => [actionId, Math.max(0, state.manualActionCooldowns[actionId] - seconds)])
  ) as Record<ManualActionId, number>;

  return {
    ...state,
    manualActionCooldowns: cooldowns
  };
}
