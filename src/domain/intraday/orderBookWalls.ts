import {
  getOrderBookWallLevelKey,
  isOrderBookWallLevel,
  normalizeOrderBookWallPriceLevel,
  orderBookWallSides,
  orderBookWallValues,
  type OrderBookWallLevelKey,
  type OrderBookWallSide,
  type OrderBookWallValue
} from "../balancing/orderBookWallValues";
import { runDefaults } from "../balancing/runDefaults";
import { applyIntradayStatUpdate, clampIntradayState, type IntradayState, type OrderBookWallEvent } from "./intradayState";

export type { OrderBookWallSide };

type ActiveOrderBookWallEffect = IntradayState["activeOrderBookWallEffects"][number];

const maxOrderBookWallEvents = 6;
const orderBookWallMeltEventDepthThreshold = 8;

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

export function canUseOrderBookWall(
  state: IntradayState,
  side: OrderBookWallSide,
  offsetPercent: number,
  priceChangePercent = offsetPercent
): boolean {
  if (!areOrderBookWallActionsAvailable(state)) {
    return false;
  }

  if (!isOrderBookWallLevel(side, offsetPercent)) {
    return false;
  }

  const levelKey = getOrderBookWallLevelKey(side, priceChangePercent);

  if (hasActiveOrderBookWallAtPriceLevel(state, side, priceChangePercent)) {
    return true;
  }

  if ((state.orderBookWallCooldowns[levelKey] ?? 0) > 0) {
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

  const levelKey = getOrderBookWallLevelKey(side, priceChangePercent);

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
    const refundBudget = getOrderBookWallRemainingReservedBudget(activeEffect);
    const remainingDepthBoost = getOrderBookWallRemainingDepthBoost(activeEffect);
    const nextState = clampIntradayState({
      ...state,
      budget: state.budget + refundBudget,
      activeOrderBookWallEffects: state.activeOrderBookWallEffects.filter((effect) => effect !== activeEffect),
      orderBookWallEvents: appendOrderBookWallEvents(state, [
        createOrderBookWallEvent(state, activeEffect, "removed", {
          depthDelta: -remainingDepthBoost,
          reserveDelta: refundBudget,
          remainingDepthBoost: 0,
          remainingReservedBudget: 0
        })
      ])
    });

    return {
      state: nextState,
      action,
      side,
      offsetPercent,
      applied: true,
      budgetDelta: refundBudget,
      reservedBudget: refundBudget,
      depthBoost: remainingDepthBoost,
      reason: "removed"
    };
  }

  if ((state.orderBookWallCooldowns[levelKey] ?? 0) > 0) {
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

  const nextEffect = {
    side,
    offsetPercent,
    priceChangePercent: normalizeOrderBookWallPriceLevel(priceChangePercent),
    reservedBudget,
    depthBoost,
    remainingReservedBudget: reservedBudget,
    remainingDepthBoost: depthBoost,
    remainingSec: action.durationSec,
    totalSec: action.durationSec
  };
  const nextState = clampIntradayState({
    ...state,
    budget: state.budget - reservedBudget,
    orderBookWallCooldowns: {
      ...state.orderBookWallCooldowns,
      [levelKey]: action.cooldownSec
    },
    activeOrderBookWallEffects: [
      ...state.activeOrderBookWallEffects,
      nextEffect
    ],
    orderBookWallEvents: appendOrderBookWallEvents(state, [
      createOrderBookWallEvent(state, nextEffect, "formed", {
        depthDelta: depthBoost,
        reserveDelta: -reservedBudget,
        remainingDepthBoost: depthBoost,
        remainingReservedBudget: reservedBudget
      })
    ])
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
    Object.entries(state.orderBookWallCooldowns)
      .map(([levelKey, remainingSec]) => [levelKey, Math.max(0, (remainingSec ?? 0) - seconds)] as const)
      .filter(([, remainingSec]) => remainingSec > 0)
  ) as Record<OrderBookWallLevelKey, number>;
  const effectDelta = {
    budget: 0,
    marketPressure: 0,
    marketLiquidity: 0,
    personalParticipation: 0,
    surveillance: 0,
    volatility: 0
  };
  const wallEvents: OrderBookWallEvent[] = [];
  const activeOrderBookWallEffects = state.activeOrderBookWallEffects.flatMap((effect) => {
    const action = orderBookWallValues[effect.side];
    const appliedSeconds = Math.min(seconds, effect.remainingSec);
    const fraction = effect.totalSec > 0 ? appliedSeconds / effect.totalSec : 1;
    const remainingSec = Math.max(0, effect.remainingSec - seconds);
    const remainingDepthBoost = getOrderBookWallRemainingDepthBoost(effect);
    const remainingReservedBudget = getOrderBookWallRemainingReservedBudget(effect);
    const depthDecay = getOrderBookWallDepthDecay(effect, state, action, appliedSeconds);
    const nextRemainingDepthBoost = round1(Math.max(0, remainingDepthBoost - depthDecay));
    const reserveDecay =
      remainingDepthBoost > 0
        ? round1(Math.min(remainingReservedBudget, remainingReservedBudget * (depthDecay / remainingDepthBoost)))
        : remainingReservedBudget;
    const nextRemainingReservedBudget = round1(Math.max(0, remainingReservedBudget - reserveDecay));

    effectDelta.marketPressure += action.marketPressureDelta * fraction;
    effectDelta.marketLiquidity += action.marketLiquidityDelta * fraction;
    effectDelta.personalParticipation += action.personalParticipationDelta * fraction;
    effectDelta.surveillance += action.surveillanceDelta * fraction;
    effectDelta.volatility += action.volatilityDelta * fraction;
    if (remainingSec <= 0 && nextRemainingReservedBudget > 0) {
      effectDelta.budget += nextRemainingReservedBudget;
    }

    if (remainingSec <= 0 || nextRemainingDepthBoost <= 0) {
      const eventType = nextRemainingDepthBoost <= 0 ? "collapsed" : "expired";
      wallEvents.push(
        createOrderBookWallEvent(state, effect, eventType, {
          depthDelta: eventType === "collapsed" ? -depthDecay : -nextRemainingDepthBoost,
          reserveDelta: eventType === "collapsed" ? -reserveDecay : nextRemainingReservedBudget,
          remainingDepthBoost: 0,
          remainingReservedBudget: 0,
          elapsedSec: getOrderBookWallEventElapsedSec(state, appliedSeconds)
        })
      );
      return [];
    }

    if (depthDecay >= orderBookWallMeltEventDepthThreshold) {
      wallEvents.push(
        createOrderBookWallEvent(state, effect, "melted", {
          depthDelta: -depthDecay,
          reserveDelta: -reserveDecay,
          remainingDepthBoost: nextRemainingDepthBoost,
          remainingReservedBudget: nextRemainingReservedBudget,
          elapsedSec: getOrderBookWallEventElapsedSec(state, appliedSeconds)
        })
      );
    }

    return [
      {
        ...effect,
        remainingSec,
        remainingDepthBoost: nextRemainingDepthBoost,
        remainingReservedBudget: nextRemainingReservedBudget
      }
    ];
  });

  return applyIntradayStatUpdate(
    {
      ...state,
      budget: state.budget + effectDelta.budget,
      orderBookWallCooldowns: cooldowns,
      activeOrderBookWallEffects,
      orderBookWallEvents: appendOrderBookWallEvents(state, wallEvents)
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
  const activeEffects = previousState.activeOrderBookWallEffects.filter(isActiveOrderBookWallEffect);

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

  const refund = state.activeOrderBookWallEffects.reduce(
    (total, effect) => total + getOrderBookWallRemainingReservedBudget(effect),
    0
  );

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
  const levelKey = getOrderBookWallLevelKey(side, levelPriceChangePercent);
  const matchingEffects = state.activeOrderBookWallEffects.filter(
    (effect) =>
      effect.side === side &&
      isActiveOrderBookWallEffect(effect) &&
      getOrderBookWallLevelKey(effect.side, effect.priceChangePercent) === levelKey
  );

  return matchingEffects
    .reduce((total, effect) => total + getOrderBookWallRemainingDepthBoost(effect), 0);
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

export function getOrderBookWallRemainingDepthBoost(effect: ActiveOrderBookWallEffect): number {
  return round1(Math.max(0, effect.remainingDepthBoost ?? effect.depthBoost));
}

export function getOrderBookWallRemainingReservedBudget(effect: ActiveOrderBookWallEffect): number {
  return round1(Math.max(0, effect.remainingReservedBudget ?? effect.reservedBudget));
}

export function isActiveOrderBookWallEffect(effect: ActiveOrderBookWallEffect): boolean {
  return effect.remainingSec > 0 && getOrderBookWallRemainingDepthBoost(effect) > 0;
}

function hasActiveOrderBookWallAtPriceLevel(
  state: IntradayState,
  side: OrderBookWallSide,
  priceChangePercent: number
): boolean {
  return Boolean(findActiveOrderBookWallAtLevel(state, side, priceChangePercent));
}

export function findActiveOrderBookWallAtLevel(
  state: IntradayState,
  side: OrderBookWallSide,
  levelPriceChangePercent: number
): IntradayState["activeOrderBookWallEffects"][number] | undefined {
  const levelKey = getOrderBookWallLevelKey(side, levelPriceChangePercent);

  return state.activeOrderBookWallEffects.find(
    (effect) =>
      effect.side === side &&
      isActiveOrderBookWallEffect(effect) &&
      getOrderBookWallLevelKey(effect.side, effect.priceChangePercent) === levelKey
  );
}

function getOrderBookWallDepthDecay(
  effect: ActiveOrderBookWallEffect,
  state: IntradayState,
  action: OrderBookWallValue,
  seconds: number
): number {
  if (seconds <= 0) {
    return 0;
  }

  const remainingDepthBoost = getOrderBookWallRemainingDepthBoost(effect);
  const opposingPressure = effect.side === "buy" ? Math.max(0, -state.marketPressure) : Math.max(0, state.marketPressure);

  if (opposingPressure <= 0) {
    return 0;
  }

  const touchMultiplier = isOrderBookWallTouched(effect, state.priceChangePercent)
    ? action.barrierTouchDecayMultiplier
    : 1;
  const depthDecay = opposingPressure * action.depthDecayPerPressureSecond * seconds * touchMultiplier;

  return round1(Math.min(remainingDepthBoost, depthDecay));
}

function isOrderBookWallTouched(effect: ActiveOrderBookWallEffect, priceChangePercent: number): boolean {
  if (effect.side === "buy") {
    return priceChangePercent <= effect.priceChangePercent;
  }

  return priceChangePercent >= effect.priceChangePercent;
}

function appendOrderBookWallEvents(
  state: IntradayState,
  events: readonly OrderBookWallEvent[]
): readonly OrderBookWallEvent[] {
  if (events.length === 0) {
    return state.orderBookWallEvents ?? [];
  }

  return [...(state.orderBookWallEvents ?? []), ...events].slice(-maxOrderBookWallEvents);
}

function createOrderBookWallEvent(
  state: IntradayState,
  effect: ActiveOrderBookWallEffect,
  type: OrderBookWallEvent["type"],
  values: {
    readonly depthDelta: number;
    readonly reserveDelta: number;
    readonly remainingDepthBoost: number;
    readonly remainingReservedBudget: number;
    readonly elapsedSec?: number;
  }
): OrderBookWallEvent {
  const elapsedSec = values.elapsedSec ?? getOrderBookWallEventElapsedSec(state, 0);

  return {
    id: [
      elapsedSec,
      type,
      effect.side,
      normalizeOrderBookWallPriceLevel(effect.priceChangePercent),
      (state.orderBookWallEvents?.length ?? 0)
    ].join(":"),
    type,
    side: effect.side,
    priceChangePercent: normalizeOrderBookWallPriceLevel(effect.priceChangePercent),
    depthDelta: round1(values.depthDelta),
    reserveDelta: round1(values.reserveDelta),
    remainingDepthBoost: round1(values.remainingDepthBoost),
    remainingReservedBudget: round1(values.remainingReservedBudget),
    elapsedSec: round1(elapsedSec)
  };
}

function getOrderBookWallEventElapsedSec(state: IntradayState, additionalSeconds: number): number {
  return Math.max(0, runDefaults.intradayDurationSec - state.timeRemainingSec + additionalSeconds);
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
