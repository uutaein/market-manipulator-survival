export const surveillanceGrades = ["A", "B", "C", "D", "E", "F"] as const;
export type SurveillanceGrade = (typeof surveillanceGrades)[number];

export const profitBands = ["high", "normal", "low", "loss"] as const;
export type ProfitBand = (typeof profitBands)[number];

export const dayResultCategoryNames = [
  "완전 성공",
  "위험 성공",
  "고위험 성공",
  "안정 운용",
  "위험 운용",
  "조용한 실패",
  "손실 마감",
  "강제 실패"
] as const;
export type DayResultCategory = (typeof dayResultCategoryNames)[number];

export const successfulDayResults = [
  "완전 성공",
  "위험 성공",
  "고위험 성공",
  "안정 운용"
] as const satisfies readonly DayResultCategory[];

export const finalGrades = ["S", "A", "B", "C", "D", "F"] as const;
export type FinalGrade = (typeof finalGrades)[number];

export const holdingBandValues = [
  {
    id: "low_influence",
    displayName: "영향력 부족",
    minInclusive: 0,
    maxExclusive: 10.000001,
    settlementRisk: false
  },
  {
    id: "stable",
    displayName: "안정 구간",
    minInclusive: 10.000001,
    maxExclusive: 35,
    settlementRisk: false
  },
  {
    id: "burden",
    displayName: "부담 구간",
    minInclusive: 35,
    maxExclusive: 55,
    settlementRisk: true
  },
  {
    id: "monopoly_risk",
    displayName: "과점 위험",
    minInclusive: 55,
    maxExclusive: 100.000001,
    settlementRisk: true
  }
] as const;

export type HoldingBandId = (typeof holdingBandValues)[number]["id"];
export type HoldingBandName = (typeof holdingBandValues)[number]["displayName"];

export const dayResultMatrix: Record<ProfitBand, Record<"ab" | "c" | "de" | "f", DayResultCategory>> = {
  high: {
    ab: "완전 성공",
    c: "위험 성공",
    de: "고위험 성공",
    f: "강제 실패"
  },
  normal: {
    ab: "안정 운용",
    c: "위험 운용",
    de: "위험 운용",
    f: "강제 실패"
  },
  low: {
    ab: "조용한 실패",
    c: "조용한 실패",
    de: "위험 운용",
    f: "강제 실패"
  },
  loss: {
    ab: "손실 마감",
    c: "손실 마감",
    de: "손실 마감",
    f: "강제 실패"
  }
};

