import { createLocalMatchingEngine, type BookDepthSnapshot, type ExecutionOrderRequest } from "../execution/localMatchingEngine";
import { getOrderBookWallLevelKey } from "../balancing/orderBookWallValues";
import type { IntradayState } from "./intradayState";
import { getOrderBookWallRemainingDepthBoost, isActiveOrderBookWallEffect } from "./orderBookWalls";

export interface SyntheticExecutionOrderBookLevel {
  readonly offsetPercent: number;
  readonly priceChangePercent: number;
  readonly bidDepth: number;
  readonly askDepth: number;
}

export interface SyntheticExecutionOrderBookResult {
  readonly levels: readonly SyntheticExecutionOrderBookLevel[];
  readonly depth: BookDepthSnapshot;
}

export function applySyntheticExecutionOrderBook(
  levels: readonly SyntheticExecutionOrderBookLevel[],
  state: IntradayState
): SyntheticExecutionOrderBookResult {
  const engine = createLocalMatchingEngine();
  const orders = buildSyntheticOrderBookOrders(levels, state);
  engine.seedBook(orders);
  const depth = engine.getDepth(3);
  const bidDepthByPrice = new Map(depth.bids.map((level) => [level.price, level.quantity]));
  const askDepthByPrice = new Map(depth.asks.map((level) => [level.price, level.quantity]));

  return {
    levels: levels.map((level) => {
      const price = getSyntheticExecutionPrice(state.openingPrice, level.priceChangePercent);

      if (level.offsetPercent < 0) {
        return {
          ...level,
          bidDepth: round1(bidDepthByPrice.get(price) ?? level.bidDepth)
        };
      }

      if (level.offsetPercent > 0) {
        return {
          ...level,
          askDepth: round1(askDepthByPrice.get(price) ?? level.askDepth)
        };
      }

      return level;
    }),
    depth
  };
}

function buildSyntheticOrderBookOrders(
  levels: readonly SyntheticExecutionOrderBookLevel[],
  state: IntradayState
): readonly ExecutionOrderRequest[] {
  return [
    ...levels.flatMap((level) => buildBaseDepthOrders(level, state.openingPrice)),
    ...state.activeOrderBookWallEffects.flatMap((effect, index) => {
      if (!isActiveOrderBookWallEffect(effect)) {
        return [];
      }

      const matchingLevel = levels.find(
        (level) =>
          level.offsetPercent !== 0 &&
          (effect.side === "buy" ? level.offsetPercent < 0 : level.offsetPercent > 0) &&
          getOrderBookWallLevelKey(effect.side, effect.priceChangePercent) ===
            getOrderBookWallLevelKey(effect.side, level.priceChangePercent)
      );

      if (!matchingLevel) {
        return [];
      }

      const order: ExecutionOrderRequest = {
        id: `wall:${effect.side}:${effect.offsetPercent}:${index}`,
        side: effect.side,
        type: "limit",
        price: getSyntheticExecutionPrice(state.openingPrice, matchingLevel.priceChangePercent),
        quantity: getOrderBookWallRemainingDepthBoost(effect),
        tag: "order-book-wall"
      };

      return [order];
    })
  ];
}

function buildBaseDepthOrders(
  level: SyntheticExecutionOrderBookLevel,
  openingPrice: number
): readonly ExecutionOrderRequest[] {
  if (level.offsetPercent === 0) {
    return [];
  }

  const price = getSyntheticExecutionPrice(openingPrice, level.priceChangePercent);

  if (level.offsetPercent < 0) {
    return [
      {
        id: `base:bid:${level.offsetPercent}`,
        side: "buy",
        type: "limit",
        price,
        quantity: level.bidDepth,
        tag: "base-depth"
      }
    ];
  }

  return [
    {
      id: `base:ask:${level.offsetPercent}`,
      side: "sell",
      type: "limit",
      price,
      quantity: level.askDepth,
      tag: "base-depth"
    }
  ];
}

function getSyntheticExecutionPrice(openingPrice: number, priceChangePercent: number): number {
  return Math.max(1, Math.round(openingPrice * (1 + priceChangePercent / 100)));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
