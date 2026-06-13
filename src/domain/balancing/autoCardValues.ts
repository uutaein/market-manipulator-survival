import type { AutoCardId } from "./runDefaults";

export type AutoCardGrowthType = "effect" | "period";

export const autoCardRewardElapsedSeconds = [45, 90, 135] as const;

export interface AutoCardValue {
  readonly id: AutoCardId;
  readonly displayName: string;
  readonly description: string;
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
  readonly positionSettlementImpactReductionDelta: number;
}

export const autoCardValues = {
  attention_signal: {
    id: "attention_signal",
    displayName: "관심 신호",
    description: "개인 참여도를 주기적으로 올려 가격 반응성을 키운다.",
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
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0
  },
  liquidity_cycle: {
    id: "liquidity_cycle",
    displayName: "유동성 순환",
    description: "시장 유동성을 주기적으로 올려 거래 흐름을 활발하게 만든다.",
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
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0
  },
  price_support: {
    id: "price_support",
    displayName: "가격 지지",
    description: "하락 압력을 완화해 급락 위험을 줄인다.",
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
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0
  },
  volatility_absorb: {
    id: "volatility_absorb",
    displayName: "변동성 흡수",
    description: "과도한 흔들림을 줄여 목표 밴드 안착을 돕는다.",
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
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0
  },
  news_amplifier: {
    id: "news_amplifier",
    displayName: "뉴스 증폭",
    description: "오늘 뉴스 효과를 키워 시장 분위기에 더 강하게 탄다.",
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
    newsPressureMultiplierDelta: 0.2,
    positionSettlementImpactReductionDelta: 0
  },
  surveillance_buffer: {
    id: "surveillance_buffer",
    displayName: "감시 완충",
    description: "감시도 상승 부담을 줄여 위험 운용 시간을 벌어준다.",
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
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0
  },
  competition_check: {
    id: "competition_check",
    displayName: "경쟁 견제",
    description: "경쟁 압박을 낮춰 시장 저항을 줄인다.",
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
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0
  },
  settlement_routine: {
    id: "settlement_routine",
    displayName: "정리 루틴",
    description: "포지션 정리 시 시장 충격과 변동성 부담을 낮춘다.",
    periodSec: 18,
    growthType: "period",
    budgetDelta: 0,
    marketPressureDelta: 0,
    marketLiquidityDelta: 0,
    personalParticipationDelta: 0,
    holdingRatioDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    competitionPressureDelta: 0,
    newsPressureMultiplierDelta: 0,
    positionSettlementImpactReductionDelta: 0.12
  }
} as const satisfies Record<AutoCardId, AutoCardValue>;
