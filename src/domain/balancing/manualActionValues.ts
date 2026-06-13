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
    budgetDelta: -2,
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
    displayName: "매수봇",
    budgetDelta: -4,
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
    displayName: "매도봇",
    budgetDelta: -4,
    cooldownSec: 12,
    marketPressureDelta: -42,
    marketLiquidityDelta: 8,
    personalParticipationDelta: 4,
    holdingRatioDelta: -4,
    surveillanceDelta: -1,
    volatilityDelta: -10
  },
  position_settlement: {
    id: "position_settlement",
    displayName: "포지션 정리",
    budgetDelta: 0,
    cooldownSec: 10,
    marketPressureDelta: -58,
    marketLiquidityDelta: 3,
    personalParticipationDelta: 12,
    holdingRatioDelta: -12,
    surveillanceDelta: 7,
    volatilityDelta: 22
  }
} as const satisfies Record<ManualActionId, ManualActionValue>;

export function getManualActionByDisplayName(displayName: string): ManualActionValue | undefined {
  if (
    displayName === "포지션 정리" ||
    displayName === "포지션 일부 정리" ||
    displayName === "수익실현" ||
    displayName === "손실차단"
  ) {
    return manualActionValues.position_settlement;
  }

  if (displayName === "가격 추진") {
    return manualActionValues.price_push;
  }

  if (displayName === "과열 해소") {
    return manualActionValues.overheat_cooldown;
  }

  return Object.values(manualActionValues).find((action) => action.displayName === displayName);
}
