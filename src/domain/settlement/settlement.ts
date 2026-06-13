import {
  dayResultMatrix,
  finalGrades,
  holdingBandValues,
  successfulDayResults,
  type DayResultCategory,
  type FinalGrade,
  type HoldingBandName,
  type ProfitBand,
  type SurveillanceGrade
} from "../balancing/settlementValues";
import { clamp, type RetailSwarmState } from "../intraday/intradayState";

export interface HoldingBand {
  readonly id: string;
  readonly displayName: HoldingBandName;
  readonly settlementRisk: boolean;
}

export interface DaySettlementInput {
  readonly dayIndex: number;
  readonly actualProfit: number;
  readonly surveillance: number;
  readonly budget: number;
  readonly holdingRatio: number;
  readonly personalParticipation: number;
  readonly volatility: number;
  readonly socialCost: number;
  readonly retailSwarmState: RetailSwarmState;
  readonly priceChangePercent: number;
  readonly marketPressure: number;
  readonly forcedFailure?: boolean;
  readonly failureReason?: string | null;
}

export interface DaySettlementResult {
  readonly dayIndex: number;
  readonly actualProfit: number;
  readonly profitBand: ProfitBand;
  readonly surveillanceGrade: SurveillanceGrade;
  readonly holdingBand: HoldingBand;
  readonly socialCostDelta: number;
  readonly socialCostTotal: number;
  readonly dayResultCategory: DayResultCategory;
  readonly primaryAxes: readonly ["actualProfit", "surveillanceGrade"];
  readonly supportingRiskMetrics: {
    readonly budget: number;
    readonly holdingRatio: number;
    readonly personalParticipation: number;
    readonly volatility: number;
    readonly socialCost: number;
  };
  readonly failureReason: string | null;
}

export interface FinalSettlementInput {
  readonly cumulativeProfit: number;
  readonly finalSurveillance: number;
  readonly surveillanceHistory: readonly number[];
  readonly successfulDays: number;
  readonly finalBudget: number;
  readonly finalHoldingRatio: number;
  readonly socialCost: number;
  readonly forcedFailure?: boolean;
  readonly failureReason?: string | null;
}

export interface FinalSettlementResult {
  readonly finalGrade: FinalGrade;
  readonly baseFinalGrade: FinalGrade;
  readonly cumulativeProfit: number;
  readonly finalSurveillanceGrade: SurveillanceGrade;
  readonly averageSurveillanceGrade: SurveillanceGrade;
  readonly successfulDays: number;
  readonly finalBudget: number;
  readonly finalHoldingBand: HoldingBand;
  readonly socialCost: number;
  readonly consideredMetrics: readonly [
    "cumulativeProfit",
    "finalSurveillanceGrade",
    "averageSurveillanceGrade",
    "successfulDays",
    "finalBudget",
    "finalHoldingRatio",
    "socialCost"
  ];
  readonly forcedFailure: boolean;
  readonly failureReason: string | null;
}

export function calculateDaySettlement(input: DaySettlementInput): DaySettlementResult {
  const surveillanceGrade = getSurveillanceGrade(input.surveillance);
  const profitBand = getProfitBand(input.actualProfit);
  const forcedFailure = input.forcedFailure === true || surveillanceGrade === "F";
  const dayResultCategory = forcedFailure
    ? "강제 실패"
    : dayResultMatrix[profitBand][getSurveillanceMatrixColumn(surveillanceGrade)];
  const socialCostDelta = calculateSocialCostDelta(input);

  return {
    dayIndex: input.dayIndex,
    actualProfit: input.actualProfit,
    profitBand,
    surveillanceGrade,
    holdingBand: getHoldingBand(input.holdingRatio),
    socialCostDelta,
    socialCostTotal: input.socialCost + socialCostDelta,
    dayResultCategory,
    primaryAxes: ["actualProfit", "surveillanceGrade"],
    supportingRiskMetrics: {
      budget: input.budget,
      holdingRatio: input.holdingRatio,
      personalParticipation: input.personalParticipation,
      volatility: input.volatility,
      socialCost: input.socialCost + socialCostDelta
    },
    failureReason: forcedFailure ? input.failureReason ?? "forced failure" : null
  };
}

export function calculateFinalSettlement(input: FinalSettlementInput): FinalSettlementResult {
  const finalSurveillanceGrade = getSurveillanceGrade(input.finalSurveillance);
  const averageSurveillance = getAverage(input.surveillanceHistory);
  const averageSurveillanceGrade = getSurveillanceGrade(averageSurveillance);
  const finalHoldingBand = getHoldingBand(input.finalHoldingRatio);
  const forcedFailure = input.forcedFailure === true || finalSurveillanceGrade === "F";

  if (forcedFailure) {
    return createFinalSettlementResult(input, {
      finalGrade: "F",
      baseFinalGrade: "F",
      finalSurveillanceGrade,
      averageSurveillanceGrade,
      finalHoldingBand,
      forcedFailure: true
    });
  }

  const baseFinalGrade = getBaseFinalGrade(input, finalSurveillanceGrade, averageSurveillanceGrade);
  const downgradeCount =
    getSocialCostDowngrade(input.socialCost) +
    (input.finalHoldingRatio >= 55 ? 1 : 0) +
    (finalSurveillanceGrade === "E" ? 1 : 0);
  const finalGrade = downgradeFinalGrade(baseFinalGrade, downgradeCount);

  return createFinalSettlementResult(input, {
    finalGrade,
    baseFinalGrade,
    finalSurveillanceGrade,
    averageSurveillanceGrade,
    finalHoldingBand,
    forcedFailure: false
  });
}

export function getSurveillanceGrade(surveillance: number): SurveillanceGrade {
  const value = clamp(surveillance, 0, 100);

  if (value >= 100) {
    return "F";
  }

  if (value >= 95) {
    return "E";
  }

  if (value >= 75) {
    return "D";
  }

  if (value >= 50) {
    return "C";
  }

  if (value >= 25) {
    return "B";
  }

  return "A";
}

export function getProfitBand(actualProfit: number): ProfitBand {
  if (actualProfit >= 18) {
    return "high";
  }

  if (actualProfit >= 6) {
    return "normal";
  }

  if (actualProfit >= 0) {
    return "low";
  }

  return "loss";
}

export function getHoldingBand(holdingRatio: number): HoldingBand {
  const value = clamp(holdingRatio, 0, 100);
  const band = holdingBandValues.find(
    (candidate) => value >= candidate.minInclusive && value < candidate.maxExclusive
  ) ?? holdingBandValues[holdingBandValues.length - 1];

  return {
    id: band.id,
    displayName: band.displayName,
    settlementRisk: band.settlementRisk
  };
}

export function isSuccessfulDayResult(dayResultCategory: DayResultCategory): boolean {
  return successfulDayResults.includes(dayResultCategory as (typeof successfulDayResults)[number]);
}

function calculateSocialCostDelta(input: DaySettlementInput): number {
  let socialCostDelta = 0;

  if (input.personalParticipation >= 75) {
    socialCostDelta += 6;
  }

  if (input.retailSwarmState === "panic") {
    socialCostDelta += 10;
  }

  if (input.volatility >= 75) {
    socialCostDelta += 6;
  }

  if ((input.priceChangePercent < 8 || input.priceChangePercent > 12) && input.marketPressure >= 50) {
    socialCostDelta += 5;
  }

  if (["D", "E"].includes(getSurveillanceGrade(input.surveillance))) {
    socialCostDelta += 5;
  }

  return socialCostDelta;
}

function getSurveillanceMatrixColumn(grade: SurveillanceGrade): "ab" | "c" | "de" | "f" {
  if (grade === "F") {
    return "f";
  }

  if (grade === "D" || grade === "E") {
    return "de";
  }

  if (grade === "C") {
    return "c";
  }

  return "ab";
}

function getBaseFinalGrade(
  input: FinalSettlementInput,
  finalSurveillanceGrade: SurveillanceGrade,
  averageSurveillanceGrade: SurveillanceGrade
): FinalGrade {
  if (
    input.cumulativeProfit >= 60 &&
    input.successfulDays >= 4 &&
    isGradeAtMost(finalSurveillanceGrade, "B") &&
    isGradeAtMost(averageSurveillanceGrade, "B") &&
    input.finalHoldingRatio <= 45
  ) {
    return "S";
  }

  if (input.cumulativeProfit >= 40 && input.successfulDays >= 3 && isGradeAtMost(averageSurveillanceGrade, "C")) {
    return "A";
  }

  if (input.cumulativeProfit >= 25 && input.successfulDays >= 3 && isGradeAtMost(averageSurveillanceGrade, "D")) {
    return "B";
  }

  if (input.cumulativeProfit >= 0 || input.successfulDays >= 2) {
    return "C";
  }

  return "D";
}

function isGradeAtMost(actual: SurveillanceGrade, maximum: SurveillanceGrade): boolean {
  return surveillanceGradeRank(actual) <= surveillanceGradeRank(maximum);
}

function surveillanceGradeRank(grade: SurveillanceGrade): number {
  return ["A", "B", "C", "D", "E", "F"].indexOf(grade);
}

function getSocialCostDowngrade(socialCost: number): number {
  if (socialCost >= 75) {
    return 2;
  }

  if (socialCost >= 50) {
    return 1;
  }

  return 0;
}

function downgradeFinalGrade(grade: FinalGrade, downgradeCount: number): FinalGrade {
  const startIndex = finalGrades.indexOf(grade);
  return finalGrades[Math.min(finalGrades.length - 1, startIndex + downgradeCount)];
}

function getAverage(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function createFinalSettlementResult(
  input: FinalSettlementInput,
  result: {
    readonly finalGrade: FinalGrade;
    readonly baseFinalGrade: FinalGrade;
    readonly finalSurveillanceGrade: SurveillanceGrade;
    readonly averageSurveillanceGrade: SurveillanceGrade;
    readonly finalHoldingBand: HoldingBand;
    readonly forcedFailure: boolean;
  }
): FinalSettlementResult {
  return {
    finalGrade: result.finalGrade,
    baseFinalGrade: result.baseFinalGrade,
    cumulativeProfit: input.cumulativeProfit,
    finalSurveillanceGrade: result.finalSurveillanceGrade,
    averageSurveillanceGrade: result.averageSurveillanceGrade,
    successfulDays: input.successfulDays,
    finalBudget: input.finalBudget,
    finalHoldingBand: result.finalHoldingBand,
    socialCost: input.socialCost,
    consideredMetrics: [
      "cumulativeProfit",
      "finalSurveillanceGrade",
      "averageSurveillanceGrade",
      "successfulDays",
      "finalBudget",
      "finalHoldingRatio",
      "socialCost"
    ],
    forcedFailure: result.forcedFailure,
    failureReason: result.forcedFailure ? input.failureReason ?? "forced failure" : null
  };
}

