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
    budgetDelta: -4,
    cooldownSec: 8,
    marketPressureDelta: 5,
    marketLiquidityDelta: 22,
    personalParticipationDelta: 10,
    holdingRatioDelta: 0,
    surveillanceDelta: 2,
    volatilityDelta: 6
  },
  price_push: {
    id: "price_push",
    displayName: "가격 추진",
    budgetDelta: -14,
    cooldownSec: 16,
    marketPressureDelta: 52,
    marketLiquidityDelta: 12,
    personalParticipationDelta: 14,
    holdingRatioDelta: 5,
    surveillanceDelta: 7,
    volatilityDelta: 10
  },
  overheat_cooldown: {
    id: "overheat_cooldown",
    displayName: "과열 해소",
    budgetDelta: -3,
    cooldownSec: 12,
    marketPressureDelta: -46,
    marketLiquidityDelta: 6,
    personalParticipationDelta: 4,
    holdingRatioDelta: 0,
    surveillanceDelta: -2,
    volatilityDelta: -8
  },
  position_settlement: {
    id: "position_settlement",
    displayName: "포지션 일부 정리",
    budgetDelta: 0,
    cooldownSec: 10,
    marketPressureDelta: -34,
    marketLiquidityDelta: 6,
    personalParticipationDelta: 8,
    holdingRatioDelta: -10,
    surveillanceDelta: 4,
    volatilityDelta: 12
  }
} as const satisfies Record<ManualActionId, ManualActionValue>;

export function getManualActionByDisplayName(displayName: string): ManualActionValue | undefined {
  if (displayName === "포지션 정리") {
    return manualActionValues.position_settlement;
  }

  return Object.values(manualActionValues).find((action) => action.displayName === displayName);
}
