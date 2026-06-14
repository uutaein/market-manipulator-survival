import { runDefaults } from "../balancing/runDefaults";
import { clamp, type IntradayState } from "../intraday/intradayState";
import type { RunState } from "../run/runState";
import type { DaySettlementResult } from "./settlement";

export type MarketAftereffectId =
  | "overheated_close"
  | "panic_close"
  | "high_surveillance"
  | "high_profit_attention"
  | "excess_holding";

export interface MarketAftereffect {
  readonly id: MarketAftereffectId;
  readonly severity: number;
  readonly strength: "weak";
  readonly personalParticipationDelta: number;
  readonly volatilityDelta: number;
  readonly surveillanceDelta: number;
  readonly marketPressureDelta: number;
  readonly competitionPressureDelta: number;
}

export interface NextDayInitialIntradayState {
  readonly personalParticipation: number;
  readonly marketLiquidity: number;
  readonly volatility: number;
  readonly surveillance: number;
  readonly marketPressure: number;
  readonly competitionPressure: number;
  readonly preOpenCardEffect: null;
}

export interface DayCarryoverResult {
  readonly nextRunState: RunState;
  readonly nextDayInitials: NextDayInitialIntradayState;
  readonly activeAftereffects: readonly MarketAftereffect[];
  readonly budgetCarried: boolean;
  readonly cumulativeProfitCarried: boolean;
  readonly holdingRatioCarried: boolean;
  readonly averageEntryPriceCarried: boolean;
  readonly socialCostCarried: boolean;
  readonly autoCardsCarried: boolean;
  readonly surveillancePartiallyCarried: boolean;
  readonly personalParticipationReduced: boolean;
  readonly marketLiquidityMostlyReset: boolean;
  readonly volatilityResetBase: number;
  readonly aftereffectsAreWeak: boolean;
  readonly preOpenCardEffectCarried: false;
}

export interface DayCarryoverInput {
  readonly runState: RunState;
  readonly daySettlement: DaySettlementResult;
  readonly endingIntradayState: IntradayState;
  readonly runLengthDays?: number;
}

export function prepareNextDayCarryover(input: DayCarryoverInput): DayCarryoverResult {
  const runLengthDays = input.runLengthDays ?? runDefaults.runLengthDays;
  const aftereffects = selectAftereffects(input.daySettlement, input.endingIntradayState);
  const ending = input.endingIntradayState;
  const nextSurveillanceBase = Math.round(ending.surveillance * 0.6);
  const nextParticipationBase = Math.round(ending.personalParticipation * 0.3);
  const nextVolatilityBase = runDefaults.initialVolatility;
  const nextLiquidityBase = runDefaults.initialMarketLiquidity;
  const nextMarketPressureBase = runDefaults.initialMarketPressure;
  const nextCompetitionBase = runDefaults.initialCompetitionPressure;

  const nextDayInitials: NextDayInitialIntradayState = {
    personalParticipation: clamp(nextParticipationBase + sum(aftereffects, "personalParticipationDelta"), 0, 100),
    marketLiquidity: nextLiquidityBase,
    volatility: clamp(nextVolatilityBase + sum(aftereffects, "volatilityDelta"), 0, 100),
    surveillance: clamp(nextSurveillanceBase + sum(aftereffects, "surveillanceDelta"), 0, 100),
    marketPressure: clamp(nextMarketPressureBase + sum(aftereffects, "marketPressureDelta"), -100, 100),
    competitionPressure: clamp(nextCompetitionBase + sum(aftereffects, "competitionPressureDelta"), 0, 100),
    preOpenCardEffect: null
  };

  const nextRunState: RunState = {
    ...input.runState,
    phase: input.runState.currentDay >= runLengthDays ? "final_settlement" : "morning_news",
    currentDay: Math.min(runLengthDays, input.runState.currentDay + 1),
    budget: ending.budget,
    cumulativeProfit: input.runState.cumulativeProfit + input.daySettlement.actualProfit,
    holdingRatio: ending.holdingRatio,
    averageEntryPrice: ending.holdingRatio > 0 ? ending.averageEntryPrice : null,
    lastClosePrice: ending.holdingRatio > 0 ? ending.currentPrice : null,
    surveillance: nextDayInitials.surveillance,
    socialCost: input.daySettlement.socialCostTotal,
    marketAftereffects: aftereffects.map((aftereffect) => aftereffect.id),
    dayResults: [...input.runState.dayResults, input.daySettlement.dayResultCategory]
  };

  return {
    nextRunState,
    nextDayInitials,
    activeAftereffects: aftereffects,
    budgetCarried: nextRunState.budget === ending.budget,
    cumulativeProfitCarried:
      nextRunState.cumulativeProfit === input.runState.cumulativeProfit + input.daySettlement.actualProfit,
    holdingRatioCarried: nextRunState.holdingRatio === ending.holdingRatio,
    averageEntryPriceCarried:
      ending.holdingRatio <= 0 ? nextRunState.averageEntryPrice === null : nextRunState.averageEntryPrice === ending.averageEntryPrice,
    socialCostCarried: nextRunState.socialCost === input.daySettlement.socialCostTotal,
    autoCardsCarried: JSON.stringify(nextRunState.autoCards) === JSON.stringify(input.runState.autoCards),
    surveillancePartiallyCarried: nextSurveillanceBase < ending.surveillance,
    personalParticipationReduced: nextParticipationBase < ending.personalParticipation,
    marketLiquidityMostlyReset: nextDayInitials.marketLiquidity === runDefaults.initialMarketLiquidity,
    volatilityResetBase: nextVolatilityBase,
    aftereffectsAreWeak: aftereffects.every((aftereffect) => aftereffect.strength === "weak"),
    preOpenCardEffectCarried: false
  };
}

export function selectAftereffects(
  daySettlement: DaySettlementResult,
  endingIntradayState: IntradayState
): readonly MarketAftereffect[] {
  const effects: MarketAftereffect[] = [];

  if (endingIntradayState.personalParticipation >= 75) {
    effects.push(createAftereffect("overheated_close", 3, {
      personalParticipationDelta: 10,
      volatilityDelta: 6
    }));
  }

  if (endingIntradayState.retailSwarmState === "panic") {
    effects.push(createAftereffect("panic_close", 4, {
      personalParticipationDelta: -8,
      volatilityDelta: 10,
      marketPressureDelta: -6
    }));
  }

  if (daySettlement.surveillanceGrade === "D" || daySettlement.surveillanceGrade === "E") {
    effects.push(createAftereffect("high_surveillance", 3, {
      surveillanceDelta: 5
    }));
  }

  if (daySettlement.profitBand === "high") {
    effects.push(createAftereffect("high_profit_attention", 2, {
      personalParticipationDelta: 8,
      competitionPressureDelta: 5
    }));
  }

  if (endingIntradayState.holdingRatio >= 55) {
    effects.push(createAftereffect("excess_holding", 3, {
      surveillanceDelta: 5,
      competitionPressureDelta: 8
    }));
  }

  return effects.sort((left, right) => right.severity - left.severity).slice(0, 3);
}

function createAftereffect(
  id: MarketAftereffectId,
  severity: number,
  deltas: Partial<
    Pick<
      MarketAftereffect,
      | "personalParticipationDelta"
      | "volatilityDelta"
      | "surveillanceDelta"
      | "marketPressureDelta"
      | "competitionPressureDelta"
    >
  >
): MarketAftereffect {
  return {
    id,
    severity,
    strength: "weak",
    personalParticipationDelta: deltas.personalParticipationDelta ?? 0,
    volatilityDelta: deltas.volatilityDelta ?? 0,
    surveillanceDelta: deltas.surveillanceDelta ?? 0,
    marketPressureDelta: deltas.marketPressureDelta ?? 0,
    competitionPressureDelta: deltas.competitionPressureDelta ?? 0
  };
}

function sum(aftereffects: readonly MarketAftereffect[], key: keyof MarketAftereffect): number {
  return aftereffects.reduce((total, aftereffect) => {
    const value = aftereffect[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}

