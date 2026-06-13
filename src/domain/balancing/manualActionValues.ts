export const manualActionIds = [
  "liquidity_supply",
  "price_push",
  "overheat_cooldown",
  "position_settlement"
] as const;

export type ManualActionId = (typeof manualActionIds)[number];

export interface ManualActionValue {
  readonly id: ManualActionId;
  readonly displayName: string;
  readonly budgetDelta: number;
  readonly cooldownSec: number;
  readonly marketPressureDelta: number;
  readonly marketLiquidityDelta: number;
  readonly personalParticipationDelta: number;
  readonly holdingRatioDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
}

export const manualActionValues = {
  liquidity_supply: {
    id: "liquidity_supply",
    displayName: "유동성 공급",
    budgetDelta: -6,
    cooldownSec: 8,
    marketPressureDelta: 0,
    marketLiquidityDelta: 18,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 3,
    volatilityDelta: 4
  },
  price_push: {
    id: "price_push",
    displayName: "가격 추진",
    budgetDelta: -8,
    cooldownSec: 10,
    marketPressureDelta: 35,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 5,
    volatilityDelta: 6
  },
  overheat_cooldown: {
    id: "overheat_cooldown",
    displayName: "과열 해소",
    budgetDelta: -4,
    cooldownSec: 12,
    marketPressureDelta: -18,
    marketLiquidityDelta: 0,
    personalParticipationDelta: -12,
    holdingRatioDelta: 0,
    surveillanceDelta: -4,
    volatilityDelta: -10
  },
  position_settlement: {
    id: "position_settlement",
    displayName: "포지션 정리",
    budgetDelta: 7,
    cooldownSec: 14,
    marketPressureDelta: -12,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: -10,
    surveillanceDelta: 0,
    volatilityDelta: 3
  }
} as const satisfies Record<ManualActionId, ManualActionValue>;

export function getManualActionByDisplayName(displayName: string): ManualActionValue | undefined {
  return Object.values(manualActionValues).find((action) => action.displayName === displayName);
}
