import { assets, sectors } from "../assets/assetCatalog";
import { autoCardValues } from "../balancing/autoCardValues";
import { documentEventValues } from "../balancing/documentEventValues";
import { manualActionValues } from "../balancing/manualActionValues";
import { preOpenCardValues } from "../balancing/preOpenCardValues";
import { morningNewsTemplates } from "../day/morningNews";

export const approvedSafeTerms = [
  "유동성 공급",
  "유동성 순환",
  "시장 압력 관리",
  "운용 데스크",
  "개인 참여자",
  "개인 참여도",
  "가격 추진",
  "과열 해소",
  "가격 안정화",
  "포지션 정리",
  "신호 주문",
  "관심 신호"
] as const;

export const forbiddenProcedureTerms = [
  "자전거래",
  "주가조작",
  "세력",
  "개미",
  "주가 끌어올리기",
  "주가 내려오기",
  "물량 털기",
  "허수 주문",
  "pump and dump",
  "wash trade",
  "spoofing"
] as const;

export const forbiddenRealEntityTerms = [
  "NASDAQ",
  "NYSE",
  "KOSPI",
  "KOSDAQ",
  "AAPL",
  "TSLA",
  "NVDA",
  "Apple",
  "Tesla",
  "Nvidia",
  "Samsung",
  "Google",
  "Microsoft",
  "Bloomberg",
  "Reuters"
] as const;

export interface SafetyValidationReport {
  readonly contentCount: number;
  readonly realEntityViolations: readonly string[];
  readonly procedureTermViolations: readonly string[];
  readonly realMarketDataViolations: readonly string[];
  readonly realNewsViolations: readonly string[];
  readonly approvedTermHits: readonly string[];
  readonly passed: boolean;
}

export interface CalculationSafetyReport {
  readonly usesFictionalGameStats: boolean;
  readonly claimsRealMarketModel: boolean;
  readonly requiresRealMarketData: boolean;
  readonly passed: boolean;
}

export function collectPlayerFacingContent(): readonly string[] {
  return [
    ...sectors.flatMap((sector) => [sector.displayName]),
    ...assets.flatMap((asset) => [asset.displayName, asset.shortBriefing]),
    ...morningNewsTemplates.flatMap((template) => [template.displayName, template.designLabel, template.role]),
    ...Object.values(preOpenCardValues).flatMap((card) => [card.displayName, card.role]),
    ...Object.values(manualActionValues).map((action) => action.displayName),
    ...Object.values(autoCardValues).map((card) => card.displayName),
    ...Object.values(documentEventValues).flatMap((event) => [
      event.displayName,
      ...event.choices.map((choice) => choice.label)
    ]),
    "예산",
    "가격",
    "보유 비중",
    "시장 영향력",
    "개인 참여도",
    "시장 유동성",
    "감시도",
    "변동성",
    "시장 압력",
    "사회적 비용"
  ];
}

export function collectTerminologyContent(): readonly string[] {
  return [
    ...Object.values(preOpenCardValues).map((card) => card.displayName),
    ...Object.values(manualActionValues).map((action) => action.displayName),
    ...Object.values(autoCardValues).map((card) => card.displayName),
    ...Object.values(documentEventValues).flatMap((event) => [
      event.displayName,
      ...event.choices.map((choice) => choice.label)
    ]),
    "개인 참여도",
    "시장 압력",
    "포지션 정리",
    "과열 해소"
  ];
}

export function validateSafetyContent(content: readonly string[]): SafetyValidationReport {
  const realEntityViolations = findTerms(content, forbiddenRealEntityTerms);
  const procedureTermViolations = findTerms(content, forbiddenProcedureTerms);
  const realMarketDataViolations = content.filter((item) => /\breal market data\b/i.test(item));
  const realNewsViolations = content.filter((item) => /\breal news\b/i.test(item));
  const approvedTermHits = findTerms(content, approvedSafeTerms);

  return {
    contentCount: content.length,
    realEntityViolations,
    procedureTermViolations,
    realMarketDataViolations,
    realNewsViolations,
    approvedTermHits,
    passed:
      realEntityViolations.length === 0 &&
      procedureTermViolations.length === 0 &&
      realMarketDataViolations.length === 0 &&
      realNewsViolations.length === 0
  };
}

export function validateCalculationSafety(input: {
  readonly usesFictionalGameStats: boolean;
  readonly claimsRealMarketModel: boolean;
  readonly requiresRealMarketData: boolean;
}): CalculationSafetyReport {
  return {
    ...input,
    passed:
      input.usesFictionalGameStats &&
      !input.claimsRealMarketModel &&
      !input.requiresRealMarketData
  };
}

function findTerms(content: readonly string[], terms: readonly string[]): readonly string[] {
  return terms.filter((term) =>
    content.some((item) => item.toLocaleLowerCase().includes(term.toLocaleLowerCase()))
  );
}

