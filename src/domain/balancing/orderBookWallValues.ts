export const orderBookWallSides = ["buy", "sell"] as const;

export type OrderBookWallSide = (typeof orderBookWallSides)[number];
export type OrderBookWallLevelKey = `${OrderBookWallSide}:${number}`;

export const orderBookWallLevelOffsets = {
  buy: [-1, -2, -3],
  sell: [1, 2, 3]
} as const satisfies Record<OrderBookWallSide, readonly number[]>;

export interface OrderBookWallValue {
  readonly side: OrderBookWallSide;
  readonly displayName: string;
  readonly minReserveBudget: number;
  readonly maxReserveBudget: number;
  readonly durationSec: number;
  readonly cooldownSec: number;
  readonly depthBoostPerBudget: number;
  readonly marketPressureDelta: number;
  readonly personalParticipationDelta: number;
  readonly marketLiquidityDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
}

export const orderBookWallValues = {
  buy: {
    side: "buy",
    displayName: "매수벽 세우기",
    minReserveBudget: 2,
    maxReserveBudget: 10,
    durationSec: 14,
    cooldownSec: 24,
    depthBoostPerBudget: 16,
    marketPressureDelta: 10,
    personalParticipationDelta: 4,
    marketLiquidityDelta: -2,
    surveillanceDelta: 3,
    volatilityDelta: 2
  },
  sell: {
    side: "sell",
    displayName: "매도벽 세우기",
    minReserveBudget: 2,
    maxReserveBudget: 10,
    durationSec: 14,
    cooldownSec: 24,
    depthBoostPerBudget: 16,
    marketPressureDelta: -10,
    personalParticipationDelta: 4,
    marketLiquidityDelta: -2,
    surveillanceDelta: 3,
    volatilityDelta: 2
  }
} as const satisfies Record<OrderBookWallSide, OrderBookWallValue>;

export function getOrderBookWallLevelKey(
  side: OrderBookWallSide,
  offsetPercent: number
): OrderBookWallLevelKey {
  return `${side}:${offsetPercent}` as OrderBookWallLevelKey;
}

export function getOrderBookWallLevelKeys(): readonly OrderBookWallLevelKey[] {
  return orderBookWallSides.flatMap((side) =>
    orderBookWallLevelOffsets[side].map((offsetPercent) => getOrderBookWallLevelKey(side, offsetPercent))
  );
}

export function isOrderBookWallLevel(side: OrderBookWallSide, offsetPercent: number): boolean {
  return (orderBookWallLevelOffsets[side] as readonly number[]).includes(offsetPercent);
}
