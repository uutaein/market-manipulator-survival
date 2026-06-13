import type { AutoCardId } from "./runDefaults";

export type AutoCardGrowthType = "effect" | "period";

export interface AutoCardValue {
  readonly id: AutoCardId;
  readonly displayName: string;
  readonly periodSec: number;
  readonly growthType: AutoCardGrowthType;
  readonly budgetDelta: number;
  readonly marketPressureDelta: number;
  readonly marketLiquidityDelta: number;
  readonly personalParticipationDelta: number;
  readonly holdingRatioDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
  readonly competitionPressureDelta: number;
  readonly newsPressureMultiplierDelta: number;
}

export const autoCardValues = {
  attention_signal: {
    id: "attention_signal",
    displayName: "관심 신호",
    periodSec: 12,
    growthType: "effect",
    budgetDelta: 0,
    marketPressureDelta: 0,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 4,
    holdingRatioDelta: 0,
    surveillanceDelta: 1,
    volatilityDelta: 0,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0
  },
  liquidity_cycle: {
    id: "liquidity_cycle",
    displayName: "유동성 순환",
    periodSec: 14,
    growthType: "effect",
    budgetDelta: 0,
    marketPressureDelta: 0,
    marketLiquidityDelta: 5,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 1,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0
  },
  price_support: {
    id: "price_support",
    displayName: "가격 지지",
    periodSec: 10,
    growthType: "effect",
    budgetDelta: 0,
    marketPressureDelta: 6,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0
  },
  volatility_absorb: {
    id: "volatility_absorb",
    displayName: "변동성 흡수",
    periodSec: 12,
    growthType: "effect",
    budgetDelta: 0,
    marketPressureDelta: -1,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: -4,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0
  },
  news_amplifier: {
    id: "news_amplifier",
    displayName: "뉴스 증폭",
    periodSec: 15,
    growthType: "period",
    budgetDelta: 0,
    marketPressureDelta: 0,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0.2
  },
  surveillance_buffer: {
    id: "surveillance_buffer",
    displayName: "감시 완충",
    periodSec: 16,
    growthType: "effect",
    budgetDelta: 0,
    marketPressureDelta: 0,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: -2,
    volatilityDelta: 0,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0
  },
  competition_check: {
    id: "competition_check",
    displayName: "경쟁 견제",
    periodSec: 14,
    growthType: "effect",
    budgetDelta: 0,
    marketPressureDelta: 0,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 1,
    volatilityDelta: 0,
    competitionPressureDelta: -5,
    newsPressureMultiplierDelta: 0
  },
  settlement_routine: {
    id: "settlement_routine",
    displayName: "정리 루틴",
    periodSec: 18,
    growthType: "period",
    budgetDelta: 2,
    marketPressureDelta: -2,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: -3,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0
  }
} as const satisfies Record<AutoCardId, AutoCardValue>;
