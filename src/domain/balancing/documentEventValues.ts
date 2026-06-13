export const documentEventIds = [
  "collapse_risk_notice",
  "unusual_flow_inquiry",
  "market_overheat_warning",
  "liquidity_dryness_report",
  "internal_risk_memo",
  "community_surge_alert",
  "competition_desk_report",
  "closing_cleanup_request"
] as const;

export type DocumentEventId = (typeof documentEventIds)[number];
export type DocumentEventChoiceType = "stable" | "aggressive" | "avoid";

export interface DocumentChoiceEffectValue {
  readonly budgetDelta: number;
  readonly marketPressureDelta: number;
  readonly marketLiquidityDelta: number;
  readonly personalParticipationDelta: number;
  readonly holdingRatioDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
  readonly competitionPressureDelta: number;
  readonly socialCostDelta: number;
  readonly aftereffectTag: string | null;
}

export interface DocumentEventChoiceValue {
  readonly type: DocumentEventChoiceType;
  readonly label: string;
  readonly effect: DocumentChoiceEffectValue;
}

export interface DocumentEventValue {
  readonly id: DocumentEventId;
  readonly displayName: string;
  readonly priority: number;
  readonly choices: readonly [
    DocumentEventChoiceValue,
    DocumentEventChoiceValue,
    DocumentEventChoiceValue
  ];
}

export const documentEventRules = {
  maxEventsPerDay: 2,
  minimumGapSec: 45,
  earliestEventElapsedSec: 30,
  latestNormalEventElapsedSec: 165,
  day1FallbackMinElapsedSec: 60,
  day1FallbackMaxElapsedSec: 90
} as const;

const noEffect: DocumentChoiceEffectValue = {
  budgetDelta: 0,
  marketPressureDelta: 0,
  marketLiquidityDelta: 0,
  personalParticipationDelta: 0,
  holdingRatioDelta: 0,
  surveillanceDelta: 0,
  volatilityDelta: 0,
  competitionPressureDelta: 0,
  socialCostDelta: 0,
  aftereffectTag: null
};

export const documentEventValues = {
  collapse_risk_notice: createEvent("collapse_risk_notice", "급락 위험 통지", 1, [
    choice("stable", "방어 자금 투입", {
      ...noEffect,
      budgetDelta: -8,
      marketPressureDelta: 20,
      volatilityDelta: -8
    }),
    choice("aggressive", "위험 감수", {
      ...noEffect,
      holdingRatioDelta: 8,
      marketPressureDelta: 15,
      surveillanceDelta: 8
    }),
    choice("avoid", "관망", {
      ...noEffect,
      volatilityDelta: 10,
      aftereffectTag: "collapse_risk"
    })
  ]),
  unusual_flow_inquiry: createEvent("unusual_flow_inquiry", "이상 흐름 질의서", 2, [
    choice("stable", "소명 제출", {
      ...noEffect,
      budgetDelta: -6,
      surveillanceDelta: -12,
      marketPressureDelta: -8
    }),
    choice("aggressive", "흐름 유지", {
      ...noEffect,
      marketPressureDelta: 10,
      surveillanceDelta: 8,
      volatilityDelta: 4
    }),
    choice("avoid", "무시", {
      ...noEffect,
      surveillanceDelta: 10,
      aftereffectTag: "high_surveillance"
    })
  ]),
  market_overheat_warning: createEvent("market_overheat_warning", "시장 과열 경보", 3, [
    choice("stable", "매도봇", {
      ...noEffect,
      personalParticipationDelta: -14,
      volatilityDelta: -10,
      marketPressureDelta: -8
    }),
    choice("aggressive", "흐름 유지", {
      ...noEffect,
      marketPressureDelta: 12,
      surveillanceDelta: 7,
      socialCostDelta: 5
    }),
    choice("avoid", "경고 보류", {
      ...noEffect,
      volatilityDelta: 8,
      aftereffectTag: "panic_risk"
    })
  ]),
  liquidity_dryness_report: createEvent("liquidity_dryness_report", "유동성 경색 보고", 4, [
    choice("stable", "예산 재배치", {
      ...noEffect,
      budgetDelta: 6,
      marketPressureDelta: -10
    }),
    choice("aggressive", "유동성 공급", {
      ...noEffect,
      budgetDelta: -6,
      marketLiquidityDelta: 18,
      surveillanceDelta: 4
    }),
    choice("avoid", "관망", {
      ...noEffect,
      volatilityDelta: 8,
      marketLiquidityDelta: -5
    })
  ]),
  internal_risk_memo: createEvent("internal_risk_memo", "내부 리스크 메모", 5, [
    choice("stable", "포지션 정리", {
      ...noEffect,
      holdingRatioDelta: -12,
      budgetDelta: 8,
      marketPressureDelta: -10
    }),
    choice("aggressive", "영향력 유지", {
      ...noEffect,
      marketPressureDelta: 12,
      surveillanceDelta: 7,
      socialCostDelta: 5
    }),
    choice("avoid", "리스크 기록", {
      ...noEffect,
      aftereffectTag: "holding_risk"
    })
  ]),
  community_surge_alert: createEvent("community_surge_alert", "커뮤니티 폭주 알림", 6, [
    choice("stable", "군중 진정", {
      ...noEffect,
      personalParticipationDelta: -16,
      volatilityDelta: -8
    }),
    choice("aggressive", "흐름 활용", {
      ...noEffect,
      marketPressureDelta: 14,
      surveillanceDelta: 8,
      socialCostDelta: 6
    }),
    choice("avoid", "방치", {
      ...noEffect,
      socialCostDelta: 4,
      aftereffectTag: "panic_risk"
    })
  ]),
  competition_desk_report: createEvent("competition_desk_report", "경쟁 데스크 개입 보고", 7, [
    choice("stable", "경쟁 견제", {
      ...noEffect,
      budgetDelta: -5,
      competitionPressureDelta: -16
    }),
    choice("aggressive", "가격 방어", {
      ...noEffect,
      marketPressureDelta: 10,
      surveillanceDelta: 6,
      competitionPressureDelta: -8
    }),
    choice("avoid", "무시", {
      ...noEffect,
      competitionPressureDelta: 10
    })
  ]),
  closing_cleanup_request: createEvent("closing_cleanup_request", "마감 전 정리 요청", 8, [
    choice("stable", "조용히 정리", {
      ...noEffect,
      holdingRatioDelta: -10,
      surveillanceDelta: -5,
      budgetDelta: 4
    }),
    choice("aggressive", "마지막 추진", {
      ...noEffect,
      marketPressureDelta: 16,
      volatilityDelta: 8,
      surveillanceDelta: 8
    }),
    choice("avoid", "현상 유지", noEffect)
  ])
} as const satisfies Record<DocumentEventId, DocumentEventValue>;

function createEvent(
  id: DocumentEventId,
  displayName: string,
  priority: number,
  choices: readonly [DocumentEventChoiceValue, DocumentEventChoiceValue, DocumentEventChoiceValue]
): DocumentEventValue {
  return {
    id,
    displayName,
    priority,
    choices
  };
}

function choice(
  type: DocumentEventChoiceType,
  label: string,
  effect: DocumentChoiceEffectValue
): DocumentEventChoiceValue {
  return {
    type,
    label,
    effect
  };
}
