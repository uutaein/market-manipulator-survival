export const preOpenCardIds = [
  "early_positioning",
  "news_assignment",
  "asset_analysis",
  "wait_and_see"
] as const;

export type PreOpenCardId = (typeof preOpenCardIds)[number];
export type NewsAssignmentDirection = "positive" | "negative";

export interface PreOpenCardValue {
  readonly id: PreOpenCardId;
  readonly displayName: string;
  readonly role: string;
  readonly budgetDelta: number;
  readonly holdingRatioDelta: number;
  readonly marketPressureDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
  readonly defenseReserve: number;
  readonly effectDurationSec: number | null;
  readonly revealsExtraBriefing: boolean;
  readonly manualActionEffectMultiplier: number;
  readonly pricePushEffectMultiplier: number;
  readonly overheatCooldownEffectMultiplier: number;
  readonly liquiditySupplyPressureBonus: number;
  readonly upwardActionSurveillanceMultiplier: number;
  readonly positionSettlementSurveillanceMultiplier: number;
}

export const preOpenCardValues = {
  early_positioning: {
    id: "early_positioning",
    displayName: "사전 포지션 확보",
    role: "현재 예산의 10~50%를 투입해 보유 비중을 늘린다. 관심은 오르지 않지만 평균단가가 조금 불리해진다.",
    budgetDelta: 0,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    defenseReserve: 0,
    effectDurationSec: null,
    revealsExtraBriefing: false,
    manualActionEffectMultiplier: 1,
    pricePushEffectMultiplier: 1,
    overheatCooldownEffectMultiplier: 1,
    liquiditySupplyPressureBonus: 0,
    upwardActionSurveillanceMultiplier: 1,
    positionSettlementSurveillanceMultiplier: 1
  },
  news_assignment: {
    id: "news_assignment",
    displayName: "뉴스 배정",
    role: "아직 공개되지 않은 오늘 뉴스를 호재 또는 악재 중 하나로 배정한다.",
    budgetDelta: -8,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 2,
    volatilityDelta: 8,
    defenseReserve: 0,
    effectDurationSec: null,
    revealsExtraBriefing: true,
    manualActionEffectMultiplier: 1,
    pricePushEffectMultiplier: 1,
    overheatCooldownEffectMultiplier: 1,
    liquiditySupplyPressureBonus: 0,
    upwardActionSurveillanceMultiplier: 1,
    positionSettlementSurveillanceMultiplier: 1
  },
  asset_analysis: {
    id: "asset_analysis",
    displayName: "종목 분석",
    role: "가격 추진과 과열 해소의 장중 효과를 강화한다. 즉시 가격이나 관심을 올리지는 않는다.",
    budgetDelta: -4,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    defenseReserve: 0,
    effectDurationSec: null,
    revealsExtraBriefing: true,
    manualActionEffectMultiplier: 1.25,
    pricePushEffectMultiplier: 1,
    overheatCooldownEffectMultiplier: 1,
    liquiditySupplyPressureBonus: 0,
    upwardActionSurveillanceMultiplier: 1,
    positionSettlementSurveillanceMultiplier: 1
  },
  wait_and_see: {
    id: "wait_and_see",
    displayName: "관망",
    role: "예산을 쓰지 않고 관망한다. 개장 전 효과는 적용되지 않는다.",
    budgetDelta: 0,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    defenseReserve: 0,
    effectDurationSec: null,
    revealsExtraBriefing: false,
    manualActionEffectMultiplier: 1,
    pricePushEffectMultiplier: 1,
    overheatCooldownEffectMultiplier: 1,
    liquiditySupplyPressureBonus: 0,
    upwardActionSurveillanceMultiplier: 1,
    positionSettlementSurveillanceMultiplier: 1
  }
} as const satisfies Record<PreOpenCardId, PreOpenCardValue>;

export function getPreOpenCardByDisplayName(displayName: string): PreOpenCardValue | undefined {
  return Object.values(preOpenCardValues).find((card) => card.displayName === displayName);
}
