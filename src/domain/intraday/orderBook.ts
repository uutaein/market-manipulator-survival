import type { BookDepthSnapshot } from "../execution/executionGateway";
import { getOrderBookWallLevelKey, normalizeOrderBookWallPriceLevel } from "../balancing/orderBookWallValues";
import { createSeededRandom } from "../random/SeededRandom";
import { clamp, type IntradayState } from "./intradayState";
import { applySyntheticExecutionOrderBook } from "./orderBookExecution";
import { isActiveOrderBookWallEffect } from "./orderBookWalls";

export interface OrderBookContext {
  readonly runSeed: string;
  readonly dayIndex: number;
}

export interface OrderBookLevel {
  readonly offsetPercent: number;
  readonly priceChangePercent: number;
  readonly bidDepth: number;
  readonly askDepth: number;
}

export interface OrderBookProfile {
  readonly levels: readonly OrderBookLevel[];
  readonly executionDepth: BookDepthSnapshot;
  readonly sellWallDepth: number;
  readonly buyWallDepth: number;
  readonly upwardResponsiveness: number;
  readonly downwardResponsiveness: number;
  readonly sellWallLabel: "thin" | "normal" | "heavy";
  readonly buyWallLabel: "thin" | "normal" | "heavy";
}

const orderBookOffsets = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] as const;

export function buildOrderBookProfile(state: IntradayState, context: OrderBookContext): OrderBookProfile {
  const tickBucket = Math.floor(state.priceTickIndex / 4);
  const baseLevels = orderBookOffsets.map((offsetPercent) => {
    const random = createSeededRandom(
      `${context.runSeed}:day:${context.dayIndex}:order-book:${tickBucket}:${offsetPercent}`
    );
    const priceChangePercent = round1(state.priceChangePercent + offsetPercent);
    const distance = Math.abs(offsetPercent);
    const assetDepth = Math.max(0, state.assetInfluenceResistance - 1) * 5;
    const baseDepth = 38 + state.marketLiquidity * 0.42 + distance * 7 + assetDepth + (random.next() * 24 - 12);
    const pressure = state.marketPressure;
    const participation = state.personalParticipation;
    const madness = state.madness;
    const holding = state.holdingRatio;
    const askDepth = clamp(
      baseDepth +
        Math.max(0, -pressure) * 0.25 +
        Math.max(0, state.priceChangePercent) * 1.4 -
        Math.max(0, pressure) * 0.36,
      8,
      260
    );
    const bidDepth = clamp(
      baseDepth +
        Math.max(0, pressure) * 0.18 +
        holding * 0.12 -
        state.volatility * 0.08 +
        participation * 0.04 +
        madness * 0.12,
      8,
      260
    );

    return {
      offsetPercent,
      priceChangePercent,
      bidDepth: round1(offsetPercent <= 0 ? bidDepth : bidDepth * 0.25),
      askDepth: round1(offsetPercent >= 0 ? askDepth : askDepth * 0.25)
    };
  });
  const visibleLevels = pinActiveOrderBookWallLevels(baseLevels, state);
  const syntheticExecution = applySyntheticExecutionOrderBook(visibleLevels, state);
  const levels = syntheticExecution.levels;
  const sellWallDepth = round1(getAverage(levels.filter((level) => level.offsetPercent > 0).map((level) => level.askDepth)));
  const buyWallDepth = round1(getAverage(levels.filter((level) => level.offsetPercent < 0).map((level) => level.bidDepth)));

  return {
    levels,
    executionDepth: syntheticExecution.depth,
    sellWallDepth,
    buyWallDepth,
    upwardResponsiveness: round2(clamp(1.5 - sellWallDepth / 100, 0.65, 1.55)),
    downwardResponsiveness: round2(clamp(1.5 - buyWallDepth / 100, 0.65, 1.55)),
    sellWallLabel: getDepthLabel(sellWallDepth),
    buyWallLabel: getDepthLabel(buyWallDepth)
  };
}

function pinActiveOrderBookWallLevels(
  baseLevels: readonly OrderBookLevel[],
  state: IntradayState
): readonly OrderBookLevel[] {
  const bidLevels = selectVisibleSideLevels(baseLevels, state, "buy");
  const midLevel = baseLevels.find((level) => level.offsetPercent === 0);
  const askLevels = selectVisibleSideLevels(baseLevels, state, "sell");

  return midLevel ? [...bidLevels, midLevel, ...askLevels] : [...bidLevels, ...askLevels];
}

function selectVisibleSideLevels(
  baseLevels: readonly OrderBookLevel[],
  state: IntradayState,
  side: "buy" | "sell"
): readonly OrderBookLevel[] {
  const sideLevels = baseLevels.filter((level) => (side === "buy" ? level.offsetPercent < 0 : level.offsetPercent > 0));
  const levelsByPrice = new Map(sideLevels.map((level) => [getOrderBookWallLevelKey(side, level.priceChangePercent), level]));

  state.activeOrderBookWallEffects
    .filter((effect) => effect.side === side && isActiveOrderBookWallEffect(effect))
    .forEach((effect) => {
      if (!isWallPriceLevelInVisibleSide(state.priceChangePercent, effect.priceChangePercent, side)) {
        return;
      }

      const referenceLevel = getNearestLevel(sideLevels, effect.priceChangePercent);
      if (!referenceLevel) {
        return;
      }

      levelsByPrice.set(getOrderBookWallLevelKey(side, effect.priceChangePercent), {
        ...referenceLevel,
        priceChangePercent: normalizeOrderBookWallPriceLevel(effect.priceChangePercent)
      });
    });

  const sortedLevels = [...levelsByPrice.values()].sort((left, right) =>
    side === "buy"
      ? right.priceChangePercent - left.priceChangePercent
      : left.priceChangePercent - right.priceChangePercent
  );

  return sortedLevels.slice(0, 5).map((level, index) => ({
    ...level,
    offsetPercent: side === "buy" ? -(index + 1) : index + 1
  }));
}

function isWallPriceLevelInVisibleSide(
  currentPriceChangePercent: number,
  wallPriceChangePercent: number,
  side: "buy" | "sell"
): boolean {
  const distance = Math.abs(wallPriceChangePercent - currentPriceChangePercent);

  if (distance > 5.5) {
    return false;
  }

  if (side === "buy") {
    return wallPriceChangePercent <= currentPriceChangePercent;
  }

  return wallPriceChangePercent >= currentPriceChangePercent;
}

function getNearestLevel(
  levels: readonly OrderBookLevel[],
  priceChangePercent: number
): OrderBookLevel | undefined {
  return levels.reduce<OrderBookLevel | undefined>((nearest, level) => {
    if (!nearest) {
      return level;
    }

    return Math.abs(level.priceChangePercent - priceChangePercent) <
      Math.abs(nearest.priceChangePercent - priceChangePercent)
      ? level
      : nearest;
  }, undefined);
}

function getDepthLabel(depth: number): "thin" | "normal" | "heavy" {
  if (depth < 38) {
    return "thin";
  }

  if (depth > 66) {
    return "heavy";
  }

  return "normal";
}

function getAverage(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / Math.max(1, values.length);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
