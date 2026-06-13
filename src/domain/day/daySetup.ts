import { getAssetById, getSectorById } from "../assets/assetCatalog";
import { runDefaults } from "../balancing/runDefaults";
import type { NewsAssignmentDirection, PreOpenCardId } from "../balancing/preOpenCardValues";
import type { RunState } from "../run/runState";
import { describeMorningNewsTarget, generateMorningNewsItems, type MorningNews } from "./morningNews";
import { generateTodayCondition, type TodayCondition } from "./todayCondition";

export interface PreOpenCardEffect {
  readonly sourceCardId: PreOpenCardId;
  readonly newsAssignmentDirection: NewsAssignmentDirection | null;
  readonly earlyPositioningBudgetPercent: number | null;
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

export interface DayState {
  readonly dayIndex: number;
  readonly morningNewsItems: readonly MorningNews[];
  readonly morningNews: MorningNews;
  readonly todayCondition: TodayCondition;
  readonly targetBandMin: number;
  readonly targetBandMax: number;
  readonly crashLine: number;
  readonly startingBudgetForDay: number;
  readonly preOpenCardId: PreOpenCardId | null;
  readonly preOpenCardEffect: PreOpenCardEffect | null;
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
  const morningNewsItems = generateMorningNewsItems(runState, dayIndex);

  return {
    dayIndex,
    morningNewsItems,
    morningNews: morningNewsItems[0],
    todayCondition: generateTodayCondition(runState, dayIndex),
    targetBandMin: runDefaults.targetBandMin,
    targetBandMax: runDefaults.targetBandMax,
    crashLine: runDefaults.crashLine,
    startingBudgetForDay: runState.budget,
    preOpenCardId: null,
    preOpenCardEffect: null,
    openingApproved: false
  };
}

export function createMarketBriefing(runState: RunState, dayState: DayState): MarketBriefing {
  const selectedAsset = getAssetById(runState.selectedAssetId);
  const selectedSector = getSectorById(runState.selectedSectorId);
  const newsSummary = dayState.morningNewsItems
    .map((news) => `${news.displayName}: ${describeMorningNewsTarget(news.target)} 대상`)
    .join(" / ");

  return {
    selectedAssetName: selectedAsset.displayName,
    selectedSectorName: selectedSector.displayName,
    newsSummary,
    targetBandLabel: `${dayState.targetBandMin}% ~ ${dayState.targetBandMax}%`,
    crashLineLabel: `${dayState.crashLine}%`,
    riskHints: createRiskHints(dayState),
    hiddenProfileValuesRevealed: false
  };
}

function createRiskHints(dayState: DayState): readonly string[] {
  const hints = dayState.morningNewsItems.map((news) => news.displayName);

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
