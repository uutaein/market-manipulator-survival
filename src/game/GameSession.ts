import { getAssetById, getAssetsBySector, getSectorById, sectors, type AssetId, type SectorId } from "../domain/assets/assetCatalog";
import { createDayState, createMarketBriefing, type DayState, type MarketBriefing } from "../domain/day/daySetup";
import { autoCardRewardElapsedSeconds, autoCardValues } from "../domain/balancing/autoCardValues";
import { documentEventRules } from "../domain/balancing/documentEventValues";
import {
  advanceIntradayTime,
  createIntradayState,
  isIntradayComplete,
  pauseIntraday,
  resumeIntraday,
  type IntradayState
} from "../domain/intraday/intradayState";
import {
  applyAutoCardChoice,
  applyAutoCardEffect,
  generateAutoCardChoices,
  getAutoCardPeriodSec,
  type AutoCardChoice,
  type AutoCardEffectResult
} from "../domain/intraday/autoCards";
import {
  applyDocumentEventChoice,
  evaluateDocumentEvent,
  openDocumentEvent,
  type DocumentEventChoiceResult
} from "../domain/intraday/documentEvents";
import { tickManualActionCooldowns, useManualAction, type ManualActionResult } from "../domain/intraday/manualActions";
import { runPlayerPriceTick } from "../domain/intraday/priceTick";
import { buildMarketBoard, type MarketBoardState } from "../domain/market/marketBoard";
import { approveOpening, selectPreOpenCard } from "../domain/preopen/preOpenCards";
import { runDefaults } from "../domain/balancing/runDefaults";
import { createRunState, restartRunWithSameSeed, type AutoCardState, type RunState } from "../domain/run/runState";
import { prepareNextDayCarryover } from "../domain/settlement/carryover";
import {
  calculateDaySettlement,
  calculateFinalSettlement as calculateFinalSettlementResult,
  isSuccessfulDayResult,
  type DaySettlementResult,
  type FinalSettlementResult
} from "../domain/settlement/settlement";
import type { DayResultCategory } from "../domain/balancing/settlementValues";

export class GameSession {
  selectedSectorId: SectorId = sectors[0].id;
  selectedAssetId: AssetId = getAssetsBySector(this.selectedSectorId)[0].id;
  runState: RunState | null = null;
  dayState: DayState | null = null;
  marketBriefing: MarketBriefing | null = null;
  intradayState: IntradayState | null = null;
  marketBoardState: MarketBoardState | null = null;
  lastManualActionResult: ManualActionResult | null = null;
  daySettlementResult: DaySettlementResult | null = null;
  finalSettlementResult: FinalSettlementResult | null = null;
  surveillanceHistory: number[] = [];
  autoCardRewardIndex = 0;
  autoCardRewardChoices: readonly AutoCardChoice[] = [];
  lastAutoCardEffects: readonly AutoCardEffectResult[] = [];
  lastAutoCardRewardMessage: string | null = null;
  lastDocumentEventChoiceResult: DocumentEventChoiceResult | null = null;
  lastDocumentEventMessage: string | null = null;
  private autoCardLastTriggeredAt: Partial<Record<AutoCardState["cardId"], number>> = {};

  setSelectedSector(sectorId: SectorId): void {
    this.selectedSectorId = sectorId;
    this.selectedAssetId = getAssetsBySector(sectorId)[0].id;
  }

  setSelectedAsset(assetId: AssetId): void {
    const asset = getAssetById(assetId);
    this.selectedSectorId = asset.sectorId;
    this.selectedAssetId = asset.id;
  }

  startNewRun(): RunState {
    this.runState = createRunState({
      selectedSectorId: this.selectedSectorId,
      selectedAssetId: this.selectedAssetId
    });
    this.dayState = null;
    this.marketBriefing = null;
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    this.daySettlementResult = null;
    this.finalSettlementResult = null;
    this.surveillanceHistory = [];
    this.resetDayAutoCardSession();
    return this.runState;
  }

  restartWithSameSeed(): RunState {
    const previousRun = this.ensureRun();
    this.runState = restartRunWithSameSeed(previousRun);
    this.selectedSectorId = this.runState.selectedSectorId;
    this.selectedAssetId = this.runState.selectedAssetId;
    this.dayState = null;
    this.marketBriefing = null;
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    this.daySettlementResult = null;
    this.finalSettlementResult = null;
    this.surveillanceHistory = [];
    this.resetDayAutoCardSession();
    return this.runState;
  }

  ensureRun(): RunState {
    return this.runState ?? this.startNewRun();
  }

  beginDay(): DayState {
    const runState = this.ensureRun();
    this.dayState = createDayState(runState);
    this.marketBriefing = createMarketBriefing(runState, this.dayState);
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    this.daySettlementResult = null;
    this.finalSettlementResult = null;
    this.resetDayAutoCardSession();
    return this.dayState;
  }

  ensureDay(): DayState {
    return this.dayState ?? this.beginDay();
  }

  ensureMarketBriefing(): MarketBriefing {
    const runState = this.ensureRun();
    const dayState = this.ensureDay();
    this.marketBriefing = this.marketBriefing ?? createMarketBriefing(runState, dayState);
    return this.marketBriefing;
  }

  selectPreOpenCard(cardIdOrDisplayName: string): DayState {
    this.dayState = selectPreOpenCard(this.ensureDay(), cardIdOrDisplayName);
    return this.dayState;
  }

  approveOpening(): DayState {
    if (!this.ensureDay().preOpenCardId) {
      this.selectPreOpenCard("관망");
    }

    this.dayState = approveOpening(this.ensureDay());
    return this.dayState;
  }

  startIntraday(): IntradayState {
    const runState = this.ensureRun();
    const dayState = this.approveOpening();
    this.intradayState = createIntradayState(runState, dayState);
    this.marketBoardState = buildMarketBoard(runState, dayState);
    this.lastAutoCardEffects = [];
    this.lastAutoCardRewardMessage = null;
    return this.intradayState;
  }

  runIntradaySecond(): IntradayState {
    const runState = this.ensureRun();
    const currentState = this.intradayState ?? this.startIntraday();

    if (isIntradayComplete(currentState)) {
      return currentState;
    }

    if (currentState.isPaused) {
      return currentState;
    }

    const tickedState = runPlayerPriceTick(currentState, {
      runSeed: runState.runSeed,
      dayIndex: runState.currentDay
    });
    const cooldownState = tickManualActionCooldowns(tickedState, 1);
    const advancedState = advanceIntradayTime(cooldownState, 1);
    this.intradayState = this.applyDueAutoCardEffects(advancedState);
    this.openDueAutoCardReward();

    if (!this.intradayState.isPaused) {
      this.openTriggeredDocumentEvent();
    }

    return this.intradayState;
  }

  useManualAction(actionIdOrDisplayName: string): ManualActionResult {
    const currentState = this.intradayState ?? this.startIntraday();
    this.lastManualActionResult = useManualAction(currentState, actionIdOrDisplayName);
    this.intradayState = this.lastManualActionResult.state;
    return this.lastManualActionResult;
  }

  chooseAutoCardReward(choiceIndex: number): string {
    const choice = this.autoCardRewardChoices[choiceIndex];

    if (!choice) {
      return "No auto card choice available.";
    }

    const runState = this.ensureRun();
    this.runState = applyAutoCardChoice(runState, choice);
    this.autoCardRewardChoices = [];
    const card = autoCardValues[choice.cardId];
    this.lastAutoCardRewardMessage =
      choice.type === "new" ? `${card.displayName} acquired.` : `${card.displayName} upgraded.`;

    const currentState = this.intradayState ?? this.startIntraday();
    const elapsedSec = getIntradayElapsedSec(currentState);
    this.autoCardLastTriggeredAt = {
      ...this.autoCardLastTriggeredAt,
      [choice.cardId]: elapsedSec
    };
    this.intradayState = resumeIntraday(currentState);
    return this.lastAutoCardRewardMessage;
  }

  chooseDocumentEventChoice(choiceIndex: number): string {
    const currentState = this.intradayState ?? this.startIntraday();
    const choiceType = currentState.documentEventChoices[choiceIndex];

    if (!currentState.activeDocumentEventId || !choiceType) {
      return "No document event choice available.";
    }

    const result = applyDocumentEventChoice(currentState, choiceType);
    const choice = result.event.choices.find((candidate) => candidate.type === result.choiceType);
    this.intradayState = result.state;
    this.lastDocumentEventChoiceResult = result;
    this.lastDocumentEventMessage = `${result.event.displayName}: ${choice?.label ?? result.choiceType}`;
    return this.lastDocumentEventMessage;
  }

  calculateDaySettlement(): DaySettlementResult {
    const runState = this.ensureRun();
    const intradayState = this.intradayState ?? this.startIntraday();

    this.daySettlementResult = calculateDaySettlement({
      dayIndex: runState.currentDay,
      actualProfit: round1(intradayState.priceChangePercent),
      surveillance: intradayState.surveillance,
      budget: intradayState.budget,
      holdingRatio: intradayState.holdingRatio,
      personalParticipation: intradayState.personalParticipation,
      volatility: intradayState.volatility,
      socialCost: runState.socialCost + intradayState.pendingSocialCostDelta,
      retailSwarmState: intradayState.retailSwarmState,
      priceChangePercent: intradayState.priceChangePercent,
      marketPressure: intradayState.marketPressure,
      forcedFailure: runState.runStatus === "failed",
      failureReason: runState.failedReason
    });
    return this.daySettlementResult;
  }

  continueAfterDaySettlement(): void {
    const runState = this.ensureRun();
    const intradayState = this.intradayState ?? this.startIntraday();
    const daySettlement = this.daySettlementResult ?? this.calculateDaySettlement();

    const carryover = prepareNextDayCarryover({
      runState,
      endingIntradayState: intradayState,
      daySettlement
    });

    this.surveillanceHistory = [...this.surveillanceHistory, intradayState.surveillance];
    this.runState = carryover.nextRunState;
    this.finalSettlementResult = null;

    if (runState.currentDay >= runDefaults.runLengthDays) {
      this.runState = {
        ...carryover.nextRunState,
        runStatus: "completed",
        phase: "final_settlement"
      };
      return;
    }

    this.dayState = null;
    this.marketBriefing = null;
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    this.daySettlementResult = null;
    this.beginDay();
  }

  calculateFinalSettlement(): FinalSettlementResult {
    const runState = this.ensureRun();
    const successfulDays = runState.dayResults.filter((result) =>
      isSuccessfulDayResult(result as DayResultCategory)
    ).length;
    const surveillanceHistory = this.surveillanceHistory.length > 0 ? this.surveillanceHistory : [runState.surveillance];

    this.finalSettlementResult = calculateFinalSettlementResult({
      cumulativeProfit: round1(runState.cumulativeProfit),
      finalSurveillance: runState.surveillance,
      surveillanceHistory,
      successfulDays,
      finalBudget: runState.budget,
      finalHoldingRatio: runState.holdingRatio,
      socialCost: runState.socialCost,
      forcedFailure: runState.runStatus === "failed",
      failureReason: runState.failedReason
    });

    return this.finalSettlementResult;
  }

  getSelectedAssetLabel(): string {
    const asset = getAssetById(this.selectedAssetId);
    const sector = getSectorById(asset.sectorId);
    return `${sector.displayName} / ${asset.displayName}`;
  }

  private applyDueAutoCardEffects(state: IntradayState): IntradayState {
    const runState = this.ensureRun();
    const elapsedSec = getIntradayElapsedSec(state);
    let nextState = state;
    const effects: AutoCardEffectResult[] = [];

    for (const cardState of runState.autoCards) {
      const periodSec = getAutoCardPeriodSec(cardState);
      const lastTriggeredAt = this.autoCardLastTriggeredAt[cardState.cardId] ?? 0;

      if (elapsedSec >= periodSec && elapsedSec - lastTriggeredAt >= periodSec) {
        const result = applyAutoCardEffect(nextState, cardState);
        nextState = result.state;
        effects.push(result);
        this.autoCardLastTriggeredAt = {
          ...this.autoCardLastTriggeredAt,
          [cardState.cardId]: elapsedSec
        };
      }
    }

    if (effects.length > 0) {
      this.lastAutoCardEffects = effects;
    }

    return nextState;
  }

  private openDueAutoCardReward(): void {
    if (!this.intradayState || this.autoCardRewardChoices.length > 0) {
      return;
    }

    const rewardTiming = autoCardRewardElapsedSeconds[this.autoCardRewardIndex];

    if (!rewardTiming || getIntradayElapsedSec(this.intradayState) < rewardTiming) {
      return;
    }

    const runState = this.ensureRun();
    const choices = generateAutoCardChoices(runState, runState.currentDay, this.autoCardRewardIndex + 1);
    this.autoCardRewardIndex += 1;

    if (choices.length === 0) {
      return;
    }

    this.autoCardRewardChoices = choices;
    this.lastAutoCardRewardMessage = "Auto card reward opened.";
    this.intradayState = pauseIntraday(this.intradayState);
  }

  private openTriggeredDocumentEvent(): void {
    const state = this.intradayState;

    if (!state || this.autoCardRewardChoices.length > 0 || state.activeDocumentEventId) {
      return;
    }

    if (this.shouldOpenDay1OnboardingEvent(state)) {
      const result = openDocumentEvent(state, "liquidity_dryness_report");
      this.intradayState = result.state;
      this.lastDocumentEventMessage = result.event ? `${result.event.displayName} opened.` : null;
      return;
    }

    const result = evaluateDocumentEvent(state);

    if (result.opened) {
      this.intradayState = result.state;
      this.lastDocumentEventMessage = result.event ? `${result.event.displayName} opened.` : null;
    }
  }

  private shouldOpenDay1OnboardingEvent(state: IntradayState): boolean {
    const runState = this.ensureRun();
    const elapsedSec = getIntradayElapsedSec(state);

    return (
      runState.currentDay === 1 &&
      state.documentEventHistory.length === 0 &&
      elapsedSec >= documentEventRules.day1FallbackMinElapsedSec &&
      elapsedSec <= documentEventRules.day1FallbackMaxElapsedSec
    );
  }

  private resetDayAutoCardSession(): void {
    this.autoCardRewardIndex = 0;
    this.autoCardRewardChoices = [];
    this.lastAutoCardEffects = [];
    this.lastAutoCardRewardMessage = null;
    this.lastDocumentEventChoiceResult = null;
    this.lastDocumentEventMessage = null;
    this.autoCardLastTriggeredAt = {};
  }
}

export const gameSession = new GameSession();

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function getIntradayElapsedSec(state: IntradayState): number {
  return runDefaults.intradayDurationSec - state.timeRemainingSec;
}
