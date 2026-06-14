import {
  getOrderBookWallLevelKey,
  getOrderBookWallLevelKeys,
  isOrderBookWallLevel,
  orderBookWallSides,
  orderBookWallValues,
  type OrderBookWallLevelKey,
  type OrderBookWallSide,
  type OrderBookWallValue
} from "../balancing/orderBookWallValues";
import { runDefaults } from "../balancing/runDefaults";
import { applyIntradayStatUpdate, clampIntradayState, type IntradayState } from "./intradayState";

export type { OrderBookWallSide };

export interface OrderBookWallResult {
  readonly state: IntradayState;
  readonly action: OrderBookWallValue | null;
  readonly side: OrderBookWallSide | null;
  readonly offsetPercent: number | null;
  readonly applied: boolean;
  readonly budgetDelta: number;
  readonly reservedBudget: number;
  readonly depthBoost: number;
  readonly reason:
    | "applied"
    | "removed"
    | "paused"
    | "cooldown"
    | "insufficient_budget"
    | "no_position"
    | "unknown_level"
    | "unknown_side";
}

export function isOrderBookWallSide(value: string): value is OrderBookWallSide {
  return orderBookWallSides.includes(value as OrderBookWallSide);
}

export function areOrderBookWallActionsAvailable(state: IntradayState): boolean {
  return !state.isPaused && state.holdingRatio > 0;
}

export function canUseOrderBookWall(state: IntradayState, side: OrderBookWallSide, offsetPercent: number): boolean {
  if (!areOrderBookWallActionsAvailable(state)) {
    return false;
  }

  if (!isOrderBookWallLevel(side, offsetPercent)) {
    return false;
  }

  const levelKey = getOrderBookWallLevelKey(side, offsetPercent);

  if (hasActiveOrderBookWall(state, side, offsetPercent)) {
    return true;
  }

  if (state.orderBookWallCooldowns[levelKey] > 0) {
    return false;
  }

  return getOrderBookWallReserveBudget(state, side) >= orderBookWallValues[side].minReserveBudget;
}

export function useOrderBookWall(
  state: IntradayState,
  sideValue: string,
  offsetPercent: number,
  priceChangePercent: number
): OrderBookWallResult {
  if (!isOrderBookWallSide(sideValue)) {
    return {
      state,
      action: null,
      side: null,
      offsetPercent: null,
      applied: false,
      budgetDelta: 0,
      reservedBudget: 0,
      depthBoost: 0,
      reason: "unknown_side"
    };
  }

  const side = sideValue;
  const action = orderBookWallValues[side];

  if (!isOrderBookWallLevel(side, offsetPercent)) {
    return {
      state,
      action,
      side,
      offsetPercent,
      applied: false,
      budgetDelta: 0,
      reservedBudget: 0,
      depthBoost: 0,
      reason: "unknown_level"
    };
  }

  const levelKey = getOrderBookWallLevelKey(side, offsetPercent);

  if (state.isPaused) {
    return {
      state,
      action,
      side,
      offsetPercent,
      applied: false,
      budgetDelta: 0,
      reservedBudget: 0,
      depthBoost: 0,
      reason: "paused"
    };
  }

  if (state.holdingRatio <= 0) {
    return {
      state,
      action,
      side,
      offsetPercent,
      applied: false,
      budgetDelta: 0,
      reservedBudget: 0,
      depthBoost: 0,
      reason: "no_position"
    };
  }

  const activeEffect = findActiveOrderBookWallAtLevel(state, side, priceChangePercent);

  if (activeEffect) {
    const nextState = clampIntradayState({
      ...state,
      budget: state.budget + activeEffect.reservedBudget,
      activeOrderBookWallEffects: state.activeOrderBookWallEffects.filter((effect) => effect !== activeEffect)
    });

    return {
      state: nextState,
      action,
      side,
      offsetPercent,
      applied: true,
      budgetDelta: activeEffect.reservedBudget,
      reservedBudget: activeEffect.reservedBudget,
      depthBoost: activeEffect.depthBoost,
      reason: "removed"
    };
  }

  if (state.orderBookWallCooldowns[levelKey] > 0) {
    return {
      state,
      action,
      side,
      offsetPercent,
      applied: false,
      budgetDelta: 0,
      reservedBudget: 0,
      depthBoost: 0,
      reason: "cooldown"
    };
  }

  const reservedBudget = getOrderBookWallReserveBudget(state, side);
  const depthBoost = getOrderBookWallDepthBoostForReserve(side, reservedBudget);

  if (reservedBudget < action.minReserveBudget) {
    return {
      state,
      action,
      side,
      offsetPercent,
      applied: false,
      budgetDelta: 0,
      reservedBudget: 0,
      depthBoost: 0,
      reason: "insufficient_budget"
    };
  }

  const nextState = clampIntradayState({
    ...state,
    budget: state.budget - reservedBudget,
    orderBookWallCooldowns: {
      ...state.orderBookWallCooldowns,
      [levelKey]: action.cooldownSec
    },
    activeOrderBookWallEffects: [
      ...state.activeOrderBookWallEffects,
      {
        side,
        offsetPercent,
        priceChangePercent,
        reservedBudget,
        depthBoost,
        remainingSec: action.durationSec,
        totalSec: action.durationSec
      }
    ]
  });

  return {
    state: nextState,
    action,
    side,
    offsetPercent,
    applied: true,
    budgetDelta: -reservedBudget,
    reservedBudget,
    depthBoost,
    reason: "applied"
  };
}

export function tickOrderBookWallEffects(
  state: IntradayState,
  seconds: number = runDefaults.intradayDurationSec
): IntradayState {
  if (state.isPaused) {
    return state;
  }

  const cooldowns = Object.fromEntries(
    getOrderBookWallLevelKeys().map((levelKey) => [
      levelKey,
      Math.max(0, (state.orderBookWallCooldowns[levelKey] ?? 0) - seconds)
    ])
  ) as Record<OrderBookWallLevelKey, number>;
  const effectDelta = {
    budget: 0,
    marketPressure: 0,
    marketLiquidity: 0,
    personalParticipation: 0,
    surveillance: 0,
    volatility: 0
  };
  const activeOrderBookWallEffects = state.activeOrderBookWallEffects.flatMap((effect) => {
    const action = orderBookWallValues[effect.side];
    const appliedSeconds = Math.min(seconds, effect.remainingSec);
    const fraction = effect.totalSec > 0 ? appliedSeconds / effect.totalSec : 1;
    const remainingSec = Math.max(0, effect.remainingSec - seconds);

    effectDelta.marketPressure += action.marketPressureDelta * fraction;
    effectDelta.marketLiquidity += action.marketLiquidityDelta * fraction;
    effectDelta.personalParticipation += action.personalParticipationDelta * fraction;
    effectDelta.surveillance += action.surveillanceDelta * fraction;
    effectDelta.volatility += action.volatilityDelta * fraction;
    if (remainingSec <= 0 && effect.reservedBudget > 0) {
      effectDelta.budget += effect.reservedBudget;
    }

    return remainingSec > 0 ? [{ ...effect, remainingSec }] : [];
  });

  return applyIntradayStatUpdate(
    {
      ...state,
      budget: state.budget + effectDelta.budget,
      orderBookWallCooldowns: cooldowns,
      activeOrderBookWallEffects
    },
    {
      marketPressure: state.marketPressure + effectDelta.marketPressure,
      marketLiquidity: state.marketLiquidity + effectDelta.marketLiquidity,
      personalParticipation: state.personalParticipation + effectDelta.personalParticipation,
      surveillance: state.surveillance + effectDelta.surveillance,
      volatility: state.volatility + effectDelta.volatility
    }
  );
}

export function applyOrderBookWallPriceBarriers(previousState: IntradayState, nextState: IntradayState): IntradayState {
  const activeEffects = previousState.activeOrderBookWallEffects.filter((effect) => effect.remainingSec > 0);

  if (activeEffects.length === 0) {
    return nextState;
  }

  const buyFloor = getMaxOrNull(
    activeEffects.filter((effect) => effect.side === "buy").map((effect) => effect.priceChangePercent)
  );
  const sellCeiling = getMinOrNull(
    activeEffects.filter((effect) => effect.side === "sell").map((effect) => effect.priceChangePercent)
  );
  let priceChangePercent = nextState.priceChangePercent;

  if (buyFloor !== null && priceChangePercent < buyFloor) {
    priceChangePercent = buyFloor;
  }

  if (sellCeiling !== null && priceChangePercent > sellCeiling) {
    priceChangePercent = sellCeiling;
  }

  if (priceChangePercent === nextState.priceChangePercent) {
    return nextState;
  }

  const priceDeltaPerTick = round2(priceChangePercent - previousState.priceChangePercent);

  return clampIntradayState({
    ...nextState,
    priceChangePercent,
    priceDeltaPerTick,
    latestPriceComponents: nextState.latestPriceComponents
      ? {
          ...nextState.latestPriceComponents,
          clampedDelta: priceDeltaPerTick
        }
      : null
  });
}

export function clearOrderBookWallEffects(state: IntradayState): IntradayState {
  if (state.activeOrderBookWallEffects.length === 0) {
    return state;
  }

  const refund = state.activeOrderBookWallEffects.reduce((total, effect) => total + effect.reservedBudget, 0);

  return clampIntradayState({
    ...state,
    budget: state.budget + refund,
    activeOrderBookWallEffects: []
  });
}

export function getActiveOrderBookWallDepthBoost(
  state: IntradayState,
  side: OrderBookWallSide,
  levelPriceChangePercent: number
): number {
  const matchingEffects = state.activeOrderBookWallEffects
    .filter((effect) => effect.side === side && isSameVisibleOrderBookLevel(effect.priceChangePercent, levelPriceChangePercent));

  return matchingEffects
    .reduce((total, effect) => total + (effect.remainingSec > 0 ? effect.depthBoost : 0), 0);
}

export function getOrderBookWallValue(side: OrderBookWallSide): OrderBookWallValue {
  return orderBookWallValues[side];
}

export function getOrderBookWallReserveBudget(state: IntradayState, side: OrderBookWallSide): number {
  const action = orderBookWallValues[side];
  return round1(Math.min(action.maxReserveBudget, Math.max(0, state.budget)));
}

export function getOrderBookWallDepthBoostForReserve(side: OrderBookWallSide, reservedBudget: number): number {
  return round1(Math.max(0, reservedBudget) * orderBookWallValues[side].depthBoostPerBudget);
}

function hasActiveOrderBookWall(state: IntradayState, side: OrderBookWallSide, offsetPercent: number): boolean {
  return state.activeOrderBookWallEffects.some(
    (effect) => effect.side === side && effect.offsetPercent === offsetPercent && effect.remainingSec > 0
  );
}

export function findActiveOrderBookWallAtLevel(
  state: IntradayState,
  side: OrderBookWallSide,
  levelPriceChangePercent: number
): IntradayState["activeOrderBookWallEffects"][number] | undefined {
  return state.activeOrderBookWallEffects.find(
    (effect) =>
      effect.side === side &&
      effect.remainingSec > 0 &&
      isSameVisibleOrderBookLevel(effect.priceChangePercent, levelPriceChangePercent)
  );
}

function isSameVisibleOrderBookLevel(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.5;
}

function getMaxOrNull(values: readonly number[]): number | null {
  return values.length > 0 ? Math.max(...values) : null;
}

function getMinOrNull(values: readonly number[]): number | null {
  return values.length > 0 ? Math.min(...values) : null;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
