import { getAssetById, getSectorById } from "../assets/assetCatalog";
import { runDefaults } from "../balancing/runDefaults";
import type { RunState } from "../run/runState";
import { describeMorningNewsTarget, generateMorningNews, type MorningNews } from "./morningNews";
import { generateTodayCondition, type TodayCondition } from "./todayCondition";

export interface DayState {
  readonly dayIndex: number;
  readonly morningNews: MorningNews;
  readonly todayCondition: TodayCondition;
  readonly targetBandMin: number;
  readonly targetBandMax: number;
  readonly crashLine: number;
  readonly startingBudgetForDay: number;
  readonly preOpenCardId: string | null;
  readonly openingApproved: boolean;
}

export interface MarketBriefing {
  readonly selectedAssetName: string;
  readonly selectedSectorName: string;
  readonly newsSummary: string;
  readonly targetBandLabel: string;
  readonly crashLineLabel: string;
  readonly riskHints: readonly string[];
  readonly hiddenProfileValuesRevealed: false;
}

export function createDayState(runState: RunState, dayIndex = runState.currentDay): DayState {
  return {
    dayIndex,
    morningNews: generateMorningNews(runState, dayIndex),
    todayCondition: generateTodayCondition(runState, dayIndex),
    targetBandMin: runDefaults.targetBandMin,
    targetBandMax: runDefaults.targetBandMax,
    crashLine: runDefaults.crashLine,
    startingBudgetForDay: runState.budget,
    preOpenCardId: null,
    openingApproved: false
  };
}

export function createMarketBriefing(runState: RunState, dayState: DayState): MarketBriefing {
  const selectedAsset = getAssetById(runState.selectedAssetId);
  const selectedSector = getSectorById(runState.selectedSectorId);
  const targetLabel = describeMorningNewsTarget(dayState.morningNews.target);

  return {
    selectedAssetName: selectedAsset.displayName,
    selectedSectorName: selectedSector.displayName,
    newsSummary: `${dayState.morningNews.displayName}: ${targetLabel} 대상. ${dayState.morningNews.role}`,
    targetBandLabel: `${dayState.targetBandMin}% ~ ${dayState.targetBandMax}%`,
    crashLineLabel: `${dayState.crashLine}%`,
    riskHints: createRiskHints(dayState),
    hiddenProfileValuesRevealed: false
  };
}

function createRiskHints(dayState: DayState): readonly string[] {
  const hints = [dayState.morningNews.displayName];

  if (dayState.todayCondition.volatilityShiftPercent > 8) {
    hints.push("변동성 주의");
  }

  if (dayState.todayCondition.surveillanceSensitivityShiftPercent > 8) {
    hints.push("감시 민감도 주의");
  }

  if (hints.length === 1) {
    hints.push("표준 변동 범위");
  }

  return hints;
}
