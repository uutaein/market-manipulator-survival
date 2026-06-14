import { getAssetById, getAssetsBySector, getSectorById, sectors, type AssetId, type SectorId } from "../domain/assets/assetCatalog";
import { getAssetInfluenceResistanceById } from "../domain/assets/assetMarketProfiles";
import { createDayState, createMarketBriefing, type DayState, type MarketBriefing } from "../domain/day/daySetup";
import { autoCardRewardElapsedSeconds, autoCardValues } from "../domain/balancing/autoCardValues";
import { documentEventRules } from "../domain/balancing/documentEventValues";
import {
  advanceIntradayTime,
  clampIntradayState,
  createFictionalQuoteState,
  createIntradayState,
  isIntradayComplete,
  pauseIntraday,
  resumeIntraday,
  type IntradayState,
  type RetailSwarmState
} from "../domain/intraday/intradayState";
import {
  applyAutoCardChoice,
  applyAutoCardEffect,
  generateAutoCardChoices,
  getAutoCardPeriodSec,
  type AutoCardChoice,
  type AutoCardEffectResult
} from "../domain/intraday/autoCards";
import { applyChartPatternInfluence, type ChartPatternInfluenceResult } from "../domain/intraday/chartPatternInfluence";
import {
  applyDocumentEventChoice,
  evaluateDocumentEvent,
  openDocumentEvent,
  type DocumentEventChoiceResult
} from "../domain/intraday/documentEvents";
import { applyRetailSwarmRiskEffects, type RetailSwarmEffectResult } from "../domain/intraday/retailSwarm";
import { calculatePositionSettlementMadnessEffects } from "../domain/intraday/madness";
import {
  cancelManualAction,
  tickManualActionCooldowns,
  useManualAction,
  type ManualActionResult
} from "../domain/intraday/manualActions";
import { runPlayerPriceTick } from "../domain/intraday/priceTick";
import type { ManualActionId } from "../domain/balancing/manualActionValues";
import { advanceMarketBoard, buildMarketBoard, type MarketBoardState } from "../domain/market/marketBoard";
import {
  canContinueSavedRun,
  loadCurrentRun,
  persistenceKeys,
  saveCurrentRun,
  saveFinalSettlement
} from "../domain/persistence/localPersistence";
import {
  approveOpening,
  getAvailablePreOpenCards,
  selectPreOpenCard,
  type PreOpenCardSelectionOptions
} from "../domain/preopen/preOpenCards";
import { runDefaults } from "../domain/balancing/runDefaults";
import { createRunState, restartRunWithSameSeed, type AutoCardState, type RunState } from "../domain/run/runState";
import { prepareNextDayCarryover } from "../domain/settlement/carryover";
import {
  applyContractManualActionFit,
  createContractObservation,
  createSampleContractMandates,
  evaluateContractObjectives,
  getContractRecommendedManualActionLabels,
  getSampleContractMandate,
  settleContract,
  type ContractManualActionFitResult,
  type ContractEvaluationResult,
  type ContractMandate,
  type ContractObservation,
  type ContractObservationKind,
  type ContractSettlementResult,
  type GameMode
} from "../domain/contract";
import {
  calculateDaySettlement,
  calculateFinalSettlement as calculateFinalSettlementResult,
  isSuccessfulDayResult,
  type DaySettlementResult,
  type FinalSettlementResult
} from "../domain/settlement/settlement";
import { createSeededRandom } from "../domain/random/SeededRandom";
import type { DayResultCategory } from "../domain/balancing/settlementValues";
import { getBrowserStorage } from "./browserStorage";

export interface PriceHistoryPoint {
  readonly elapsedSec: number;
  readonly priceChangePercent: number;
  readonly fictionalVolume: number;
}

export interface IntradayMoneyLedger {
  readonly runStartingBudget: number;
  readonly startingBudget: number;
  readonly currentBudget: number;
  readonly openingPrice: number;
  readonly currentPrice: number;
  readonly averageEntryPrice: number;
  readonly heldUnits: number;
  readonly fictionalFloatUnits: number;
  readonly positionMarketValue: number;
  readonly totalAccountValue: number;
  readonly unrealizedPositionProfitLoss: number;
  readonly spentBudget: number;
  readonly recoveredBudget: number;
  readonly netBudgetUsed: number;
  readonly budgetChange: number;
  readonly dayProfitLoss: number;
  readonly runProfitLoss: number;
  readonly assessedProfitLoss: number;
  readonly estimatedNetProfitLoss: number;
}

interface PriceHistoryAdjustment {
  readonly elapsedOffsetSec?: number;
  readonly priceChangePercent?: number;
  readonly volumeMultiplier?: number;
}

interface ManualActionChartResponse {
  readonly finalPriceDelta: number;
  readonly finalElapsedOffsetSec: number;
  readonly finalVolumeMultiplier: number;
  readonly points: readonly {
    readonly elapsedOffsetSec: number;
    readonly priceDelta: number;
    readonly volumeMultiplier: number;
  }[];
}

interface BreakoutImpulseResult {
  readonly state: IntradayState;
  readonly applied: boolean;
  readonly previousHighPercent: number;
  readonly breakoutClosePercent: number;
  readonly volumeMultiplier: number;
}

export class GameSession {
  gameMode: GameMode = "free";
  contractMandate: ContractMandate | null = null;
  contractObservations: readonly ContractObservation[] = [];
  contractEvaluationResult: ContractEvaluationResult | null = null;
  contractSettlementResult: ContractSettlementResult | null = null;
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
  lastRetailSwarmEffectResult: RetailSwarmEffectResult | null = null;
  lastContractActionFitResult: ContractManualActionFitResult | null = null;
  lastFinalSaveUpdatedBest = false;
  priceHistory: PriceHistoryPoint[] = [];
  marketDashboardPlayerRank: number | null = null;
  marketDashboardPlayerValue = 0;
  private intradayStartingBudget = 0;
  private intradaySpentBudget = 0;
  private intradayRecoveredBudget = 0;
  private contractBudgetSpent = 0;
  private contractActionMistakePenalty = 0;
  private contractActionEfficiencyBonus = 0;
  private pendingMarketDashboardTradeValueImpulse = 0;
  private lastMarketDashboardFeedbackElapsedSec: number | null = null;
  private lastRetailSwarmState: RetailSwarmState | null = null;
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

  prepareFreeMode(): void {
    this.gameMode = "free";
    this.contractMandate = null;
    this.resetCurrentRunState();
  }

  prepareContractMode(): void {
    this.gameMode = "contract";
    this.contractMandate = null;
    this.resetCurrentRunState();
  }

  getContractOptions(): readonly ContractMandate[] {
    return createSampleContractMandates();
  }

  startContractRun(contractId: string): ContractMandate {
    const mandate = getSampleContractMandate(contractId);

    this.gameMode = "contract";
    this.contractMandate = mandate;
    this.setSelectedAsset(mandate.assetId);
    this.startNewRun();
    this.beginDay();
    this.recordContractObservation("contract_start");

    return mandate;
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
    this.priceHistory = [];
    this.resetIntradayMoneyLedger(0);
    this.resetContractProgress();
    this.resetMarketDashboardFeedback();
    this.lastFinalSaveUpdatedBest = false;
    this.resetDayAutoCardSession();
    if (this.gameMode === "contract" && this.contractMandate) {
      this.recordContractObservation("contract_start");
    }
    this.saveCurrentRunProgress();
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
    this.priceHistory = [];
    this.resetIntradayMoneyLedger(0);
    this.resetContractProgress();
    this.resetMarketDashboardFeedback();
    this.lastFinalSaveUpdatedBest = false;
    this.resetDayAutoCardSession();
    if (this.gameMode === "contract" && this.contractMandate) {
      this.recordContractObservation("contract_start");
    }
    this.saveCurrentRunProgress();
    return this.runState;
  }

  canContinueSavedRun(): boolean {
    const storage = getBrowserStorage();
    return storage ? canContinueSavedRun(storage) : false;
  }

  loadSavedRun(): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      return false;
    }

    const result = loadCurrentRun(storage);

    if (result.status !== "loaded") {
      return false;
    }

    this.runState = result.envelope.data;
    this.gameMode = "free";
    this.contractMandate = null;
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
    this.priceHistory = [];
    this.resetIntradayMoneyLedger(0);
    this.resetContractProgress();
    this.resetMarketDashboardFeedback();
    this.lastFinalSaveUpdatedBest = false;
    this.resetDayAutoCardSession();
    return true;
  }

  resetCurrentRunState(): void {
    this.runState = null;
    this.dayState = null;
    this.marketBriefing = null;
    this.intradayState = null;
    this.marketBoardState = null;
    this.lastManualActionResult = null;
    this.daySettlementResult = null;
    this.finalSettlementResult = null;
    this.surveillanceHistory = [];
    this.priceHistory = [];
    this.resetIntradayMoneyLedger(0);
    this.resetContractProgress();
    this.resetMarketDashboardFeedback();
    this.lastFinalSaveUpdatedBest = false;
    this.resetDayAutoCardSession();
  }

  saveCurrentRunProgress(): boolean {
    const storage = getBrowserStorage();

    if (!storage || !this.runState || this.runState.runStatus !== "active") {
      return false;
    }

    saveCurrentRun(storage, this.runState);
    return true;
  }

  saveFinalSettlementRecord(): boolean {
    const storage = getBrowserStorage();

    if (!storage) {
      this.lastFinalSaveUpdatedBest = false;
      return false;
    }

    const finalSettlement = this.finalSettlementResult ?? this.calculateFinalSettlement();
    const result = saveFinalSettlement(storage, finalSettlement);
    storage.removeItem(persistenceKeys.currentRun);
    this.lastFinalSaveUpdatedBest = result.bestRecordUpdated;
    return true;
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
    this.priceHistory = [];
    this.resetIntradayMoneyLedger(0);
    this.resetMarketDashboardFeedback();
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

  selectPreOpenCard(cardIdOrDisplayName: string, options: PreOpenCardSelectionOptions = {}): DayState {
    this.dayState = selectPreOpenCard(this.ensureDay(), cardIdOrDisplayName, this.ensureRun(), options);
    this.marketBriefing = createMarketBriefing(this.ensureRun(), this.dayState);
    return this.dayState;
  }

  approveOpening(): DayState {
    if (!this.ensureDay().preOpenCardId) {
      this.selectPreOpenCard(getDefaultPreOpenChoice(this.ensureRun()));
    }

    this.dayState = approveOpening(this.ensureDay());
    return this.dayState;
  }

  startIntraday(): IntradayState {
    const runState = this.ensureRun();
    const dayState = this.approveOpening();
    this.resetIntradayMoneyLedger(dayState.startingBudgetForDay);
    this.recordBudgetLedgerDelta(dayState.preOpenCardEffect?.budgetDelta ?? 0);
    this.intradayState = createIntradayState(runState, dayState);
    this.marketBoardState = buildMarketBoard(runState, dayState);
    this.resetMarketDashboardFeedback();
    this.lastAutoCardEffects = [];
    this.lastAutoCardRewardMessage = null;
    this.priceHistory = [createPriceHistoryPoint(this.intradayState)];
    this.recordContractObservation("intraday_tick", this.intradayState);
    return this.intradayState;
  }

  runIntradaySecond(): IntradayState {
    const runState = this.ensureRun();
    const currentState = this.intradayState ?? this.startIntraday();

    if (runState.runStatus === "failed") {
      return currentState;
    }

    if (isIntradayComplete(currentState)) {
      return currentState;
    }

    if (currentState.isPaused) {
      return currentState;
    }

    const actionProgressState = tickManualActionCooldowns(currentState, 1);
    this.recordBudgetLedgerDelta(actionProgressState.budget - currentState.budget);
    this.queueManualActionDashboardTradeValueProgress(currentState, actionProgressState);
    const dashboardPressureState = this.applyMarketDashboardRankBuyPressure(actionProgressState);
    const tickedState = runPlayerPriceTick(dashboardPressureState, {
      runSeed: runState.runSeed,
      dayIndex: runState.currentDay
    });
    const patternResult = applyChartPatternInfluence(tickedState, this.priceHistory, {
      runSeed: runState.runSeed,
      dayIndex: runState.currentDay
    });
    const breakoutResult = this.applyBreakoutImpulse(patternResult.state);
    const advancedState = advanceIntradayTime(breakoutResult.state, 1);
    const autoCardState = this.applyDueAutoCardEffects(advancedState);
    this.intradayState = this.applyRetailSwarmTransitionRisk(autoCardState);
    if (patternResult.applied) {
      this.recordChartPatternHistory(this.intradayState, patternResult);
    }
    if (breakoutResult.applied) {
      this.recordBreakoutHistory(this.intradayState, breakoutResult);
    }
    this.recordPriceHistory(this.intradayState);
    this.advanceMarketBoard();
    this.recordContractObservation("intraday_tick", this.intradayState);

    if (this.checkImmediateRunFailure(this.intradayState)) {
      return this.intradayState;
    }

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
    if (this.lastManualActionResult.applied && this.lastManualActionResult.action) {
      this.recordBudgetLedgerDelta(this.lastManualActionResult.budgetDelta);
      this.applyContractActionFit(this.lastManualActionResult.action.id);
    }
    this.applyManualActionChartResponse(this.lastManualActionResult);
    this.checkImmediateRunFailure(this.intradayState);
    return this.lastManualActionResult;
  }

  cancelManualAction(actionId: ManualActionId): IntradayState {
    const currentState = this.intradayState ?? this.startIntraday();
    this.intradayState = cancelManualAction(currentState, actionId);
    return this.intradayState;
  }

  canRepositionIntradayAsset(): boolean {
    const runState = this.runState;
    const state = this.intradayState;

    return Boolean(
      runState?.runStatus === "active" &&
        state &&
        !state.isPaused &&
        state.holdingRatio <= 0 &&
        state.activeManualActionEffects.length === 0 &&
        state.budget >= intradayRepositionEntryCost
    );
  }

  repositionIntradayAsset(assetId: AssetId): IntradayState {
    const asset = getAssetById(assetId);
    const runState = this.ensureRun();
    const dayState = this.ensureDay();
    const state = this.intradayState ?? this.startIntraday();

    if (!this.canRepositionIntradayAsset()) {
      throw new Error("Intraday reposition is available only after the position is fully settled.");
    }

    this.selectedSectorId = asset.sectorId;
    this.selectedAssetId = asset.id;
    this.runState = {
      ...runState,
      selectedSectorId: asset.sectorId,
      selectedAssetId: asset.id,
      holdingRatio: intradayRepositionStartingHolding,
      averageEntryPrice: null,
      lastClosePrice: null
    };
    const quote = createFictionalQuoteState(
      this.runState,
      dayState,
      intradayRepositionStartingHolding,
      runDefaults.initialPriceChangePercent
    );
    this.runState = {
      ...this.runState,
      averageEntryPrice: quote.averageEntryPrice
    };
    this.marketBriefing = createMarketBriefing(this.runState, dayState);
    this.intradayState = clampIntradayState({
      ...state,
      budget: state.budget - intradayRepositionEntryCost,
      assetInfluenceResistance: getAssetInfluenceResistanceById(asset.id),
      openingPrice: quote.openingPrice,
      currentPrice: quote.currentPrice,
      averageEntryPrice: quote.averageEntryPrice,
      heldUnits: quote.heldUnits,
      fictionalFloatUnits: quote.fictionalFloatUnits,
      priceChangePercent: runDefaults.initialPriceChangePercent,
      priceDeltaPerTick: 0,
      holdingRatio: intradayRepositionStartingHolding,
      marketPressure: Math.max(4, state.marketPressure + 8),
      marketLiquidity: Math.max(35, state.marketLiquidity - 4),
      personalParticipation: Math.max(20, state.personalParticipation - 12),
      volatility: Math.min(100, state.volatility + 4),
      activeManualActionEffects: [],
      lastManualActionId: null,
      latestPriceComponents: null
    });
    this.marketBoardState = buildMarketBoard(this.runState, dayState);
    this.resetMarketDashboardFeedback();
    this.priceHistory = [createPriceHistoryPoint(this.intradayState)];
    this.recordBudgetLedgerDelta(-intradayRepositionEntryCost);
    this.saveCurrentRunProgress();
    return this.intradayState;
  }

  chooseAutoCardReward(choiceIndex: number): string {
    const choice = this.autoCardRewardChoices[choiceIndex];

    if (!choice) {
      return "No auto card choice available.";
    }

    const runState = this.ensureRun();
    this.runState = applyAutoCardChoice(runState, choice);
    this.saveCurrentRunProgress();
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
    this.recordBudgetLedgerDelta(result.state.budget - currentState.budget);
    this.lastDocumentEventChoiceResult = result;
    this.lastDocumentEventMessage = `${result.event.displayName}: ${choice?.label ?? result.choiceType}`;
    this.checkImmediateRunFailure(this.intradayState);
    return this.lastDocumentEventMessage;
  }

  calculateDaySettlement(): DaySettlementResult {
    const runState = this.ensureRun();
    const intradayState = this.intradayState ?? this.startIntraday();
    this.recordContractObservation("day_close", intradayState);

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
    const runLengthDays = this.getRunLengthDays();

    const carryover = prepareNextDayCarryover({
      runState,
      endingIntradayState: intradayState,
      daySettlement,
      runLengthDays
    });

    this.surveillanceHistory = [...this.surveillanceHistory, intradayState.surveillance];
    this.runState = carryover.nextRunState;
    this.finalSettlementResult = null;

    if (runState.currentDay >= runLengthDays) {
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
    this.priceHistory = [];
    this.resetIntradayMoneyLedger(0);
    this.resetMarketDashboardFeedback();
    this.beginDay();
    this.saveCurrentRunProgress();
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
    this.contractSettlementResult = this.calculateContractSettlementResult(this.finalSettlementResult);

    return this.finalSettlementResult;
  }

  getRunLengthDays(): number {
    return this.gameMode === "contract" && this.contractMandate
      ? this.contractMandate.durationDays
      : runDefaults.runLengthDays;
  }

  getSelectedAssetLabel(): string {
    const asset = getAssetById(this.selectedAssetId);
    const sector = getSectorById(asset.sectorId);
    return `${sector.displayName} / ${asset.displayName}`;
  }

  getIntradayMoneyLedger(): IntradayMoneyLedger | null {
    const state = this.intradayState;

    if (!state) {
      return null;
    }

    const positionMarketValue = getNormalizedPositionMarketValue(state);
    const positionCostBasis = getNormalizedPositionCostBasis(state);
    const unrealizedPositionProfitLoss = round1(positionMarketValue - positionCostBasis);
    const totalAccountValue = round1(state.budget + positionMarketValue);
    const dayProfitLoss = round1(totalAccountValue - this.intradayStartingBudget);
    const runProfitLoss = round1(totalAccountValue - runDefaults.startingBudget);
    const netBudgetUsed = round1(this.intradaySpentBudget - this.intradayRecoveredBudget);

    return {
      runStartingBudget: runDefaults.startingBudget,
      startingBudget: this.intradayStartingBudget,
      currentBudget: state.budget,
      openingPrice: state.openingPrice,
      currentPrice: state.currentPrice,
      averageEntryPrice: state.averageEntryPrice,
      heldUnits: state.heldUnits,
      fictionalFloatUnits: state.fictionalFloatUnits,
      positionMarketValue,
      totalAccountValue,
      unrealizedPositionProfitLoss,
      spentBudget: round1(this.intradaySpentBudget),
      recoveredBudget: round1(this.intradayRecoveredBudget),
      netBudgetUsed,
      budgetChange: round1(state.budget - this.intradayStartingBudget),
      dayProfitLoss,
      runProfitLoss,
      assessedProfitLoss: runProfitLoss,
      estimatedNetProfitLoss: runProfitLoss
    };
  }

  updateMarketDashboardSnapshot(
    ranks: ReadonlyMap<string, number>,
    tradeValues: ReadonlyMap<string, number>
  ): void {
    const playerKey = `asset:${this.selectedAssetId}`;
    this.marketDashboardPlayerRank = ranks.get(playerKey) ?? null;
    this.marketDashboardPlayerValue = tradeValues.get(playerKey) ?? this.marketDashboardPlayerValue;
    this.recordContractObservation("contract_event", this.intradayState);
  }

  getContractProgressLines(): readonly string[] {
    const mandate = this.contractMandate;

    if (this.gameMode !== "contract" || !mandate) {
      return [];
    }

    const evaluation = this.refreshContractEvaluation();
    const asset = getAssetById(mandate.assetId);
    const runState = this.runState;
    const currentDay = Math.min(runState?.currentDay ?? 1, mandate.durationDays);
    const headline = evaluation.successful
      ? "상태: 성공 조건 충족"
      : evaluation.failed
        ? "상태: 실패 조건 발생"
        : `상태: 진행 중 (${evaluation.completedObjectives}/${mandate.objectives.length})`;

    return [
      `의뢰: ${mandate.displayName}`,
      `종목: ${asset.displayName} / DAY ${currentDay}/${mandate.durationDays} / 보상 ${formatContractNumber(mandate.fixedReward)}`,
      headline,
      ...evaluation.objectiveResults.map((result) => {
        const objective = mandate.objectives.find((candidate) => candidate.id === result.objectiveId);
        return `${getContractStatusLabel(result.status)} ${formatContractObjectiveLabel(objective)} ${formatContractProgress(result.progress, result.required)}`;
      }),
      this.lastContractActionFitResult
        ? this.lastContractActionFitResult.message
        : `추천 도구: ${getContractRecommendedManualActionLabels(mandate).join(" / ")}`
    ];
  }

  getContractFinalSettlementLines(): readonly string[] {
    const mandate = this.contractMandate;

    if (this.gameMode !== "contract" || !mandate) {
      return [];
    }

    const evaluation = this.refreshContractEvaluation();
    const settlement = this.contractSettlementResult;

    if (!settlement) {
      return [
        "CONTRACT RESULT",
        `STATUS: ${evaluation.successful ? "SUCCESS" : "INCOMPLETE"}`,
        `OBJECTIVES: ${evaluation.completedObjectives}/${mandate.objectives.length}`,
        `REWARD: ${evaluation.successful ? formatContractNumber(mandate.fixedReward) : "0"} / ${formatContractNumber(mandate.fixedReward)}`
      ];
    }

    return [
      "CONTRACT RESULT",
      `STATUS: ${settlement.successful ? "SUCCESS" : "FAILED"}`,
      `OBJECTIVES: ${evaluation.completedObjectives}/${mandate.objectives.length}`,
      `REWARD: ${formatContractNumber(settlement.fixedRewardPaid)} / ${formatContractNumber(settlement.fixedReward)}`,
      `SPENT: ${formatContractNumber(settlement.budgetSpent)}`,
      `ACTION FIT: +${formatContractNumber(this.contractActionEfficiencyBonus)} / RISK ${formatContractNumber(this.contractActionMistakePenalty)}`,
      `NET: ${formatContractSigned(settlement.netPerformance)} / GRADE ${settlement.efficiencyGrade}`
    ];
  }

  consumeMarketDashboardTradeValueImpulse(): number {
    const impulse = this.pendingMarketDashboardTradeValueImpulse;
    this.pendingMarketDashboardTradeValueImpulse = 0;
    return impulse;
  }

  private applyMarketDashboardRankBuyPressure(state: IntradayState): IntradayState {
    const rank = this.marketDashboardPlayerRank;
    const elapsedSec = getIntradayElapsedSec(state);

    if (!rank || rank > marketDashboardFeedbackMaxRank || this.lastMarketDashboardFeedbackElapsedSec === elapsedSec) {
      return state;
    }

    this.lastMarketDashboardFeedbackElapsedSec = elapsedSec;

    const runState = this.ensureRun();
    const rankScore = (marketDashboardFeedbackMaxRank + 1 - rank) / marketDashboardFeedbackMaxRank;
    const chance = Math.min(
      marketDashboardFeedbackMaxChance,
      marketDashboardFeedbackBaseChance +
        rankScore * marketDashboardFeedbackRankChanceScale +
        state.madness * marketDashboardFeedbackMadnessChanceScale
    );
    const random = createSeededRandom(
      `${runState.runSeed}:day:${runState.currentDay}:dashboard-feedback:${elapsedSec}:${rank}`
    );

    if (random.next() > chance) {
      return state;
    }

    return clampIntradayState({
      ...state,
      marketPressure: state.marketPressure + round1(0.5 + rankScore * 1.8),
      personalParticipation: state.personalParticipation + round1(0.4 + rankScore * 1.2)
    });
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
        const budgetBefore = nextState.budget;
        const result = applyAutoCardEffect(nextState, cardState);
        nextState = result.state;
        this.recordBudgetLedgerDelta(nextState.budget - budgetBefore);
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

  private recordPriceHistory(state: IntradayState, adjustment: PriceHistoryAdjustment = {}): void {
    const point = createPriceHistoryPoint(state, adjustment);
    const lastPoint = this.priceHistory[this.priceHistory.length - 1];

    if (lastPoint?.elapsedSec === point.elapsedSec) {
      this.priceHistory = [...this.priceHistory.slice(0, -1), point];
      return;
    }

    this.priceHistory = [...this.priceHistory, point].slice(-runDefaults.intradayDurationSec - 1);
  }

  private applyBreakoutImpulse(state: IntradayState): BreakoutImpulseResult {
    const previousHighPercent = getRecentPriceHighPercent(this.priceHistory, 45);
    const crossedPreviousHigh =
      previousHighPercent > 0 &&
      state.priceChangePercent > previousHighPercent + 0.08 &&
      state.priceChangePercent - state.priceDeltaPerTick <= previousHighPercent + 0.03;
    const pressureScore =
      Math.max(0, state.marketPressure) * 0.45 +
      Math.max(0, state.personalParticipation - 35) * 0.28 +
      Math.max(0, state.marketLiquidity - 45) * 0.18 +
      Math.max(0, state.activeNewsPricePressure) * 120;

    if (!crossedPreviousHigh || pressureScore < 14) {
      return {
        state,
        applied: false,
        previousHighPercent,
        breakoutClosePercent: state.priceChangePercent,
        volumeMultiplier: 1
      };
    }

    const impulsePercent = round1(Math.min(2.4, Math.max(0.6, 0.45 + pressureScore / 34)));
    const breakoutClosePercent = state.priceChangePercent + impulsePercent;
    const volumeMultiplier = round1(Math.min(4.2, 1.8 + pressureScore / 28));

    return {
      state: clampIntradayState({
        ...state,
        priceChangePercent: breakoutClosePercent,
        priceDeltaPerTick: state.priceDeltaPerTick + impulsePercent
      }),
      applied: true,
      previousHighPercent,
      breakoutClosePercent,
      volumeMultiplier
    };
  }

  private recordBreakoutHistory(state: IntradayState, breakout: BreakoutImpulseResult): void {
    const preBreakoutPrice = Math.max(
      breakout.previousHighPercent - 0.08,
      state.priceChangePercent - state.priceDeltaPerTick
    );
    this.recordPriceHistory(state, {
      elapsedOffsetSec: -0.72,
      priceChangePercent: preBreakoutPrice,
      volumeMultiplier: 0.9
    });
    this.recordPriceHistory(state, {
      elapsedOffsetSec: -0.28,
      priceChangePercent: breakout.previousHighPercent + 0.12,
      volumeMultiplier: breakout.volumeMultiplier
    });
    this.recordPriceHistory(state, {
      elapsedOffsetSec: -0.05,
      priceChangePercent: breakout.breakoutClosePercent,
      volumeMultiplier: breakout.volumeMultiplier * 1.25
    });
  }

  private recordChartPatternHistory(state: IntradayState, pattern: ChartPatternInfluenceResult): void {
    for (const point of pattern.points) {
      this.recordPriceHistory(state, {
        elapsedOffsetSec: point.elapsedOffsetSec,
        priceChangePercent: point.priceChangePercent,
        volumeMultiplier: point.volumeMultiplier
      });
    }
  }

  private applyManualActionChartResponse(result: ManualActionResult): void {
    if (!result.applied || !result.action || !this.intradayState) {
      return;
    }

    const response = getManualActionChartResponse(result.action.id, result.state);
    const basePrice = this.intradayState.priceChangePercent;

    for (const point of response.points) {
      this.recordPriceHistory(this.intradayState, {
        elapsedOffsetSec: point.elapsedOffsetSec,
        priceChangePercent: basePrice + point.priceDelta,
        volumeMultiplier: point.volumeMultiplier
      });
    }

    this.recordPriceHistory(this.intradayState, {
      elapsedOffsetSec: response.finalElapsedOffsetSec,
      priceChangePercent: basePrice + response.finalPriceDelta,
      volumeMultiplier: response.finalVolumeMultiplier
    });
  }

  private advanceMarketBoard(): void {
    const runState = this.ensureRun();
    const dayState = this.ensureDay();
    const intradayState = this.intradayState;

    if (!this.marketBoardState || !intradayState) {
      return;
    }

    this.marketBoardState = advanceMarketBoard(
      this.marketBoardState,
      runState,
      dayState,
      intradayState.priceTickIndex
    );
  }

  private checkImmediateRunFailure(state: IntradayState): boolean {
    const reason = getImmediateFailureReason(state);

    if (!reason) {
      return false;
    }

    const runState = this.ensureRun();
    this.runState = {
      ...runState,
      runStatus: "failed",
      phase: "final_settlement",
      budget: state.budget,
      holdingRatio: state.holdingRatio,
      averageEntryPrice: state.holdingRatio > 0 ? state.averageEntryPrice : null,
      lastClosePrice: state.holdingRatio > 0 ? state.currentPrice : null,
      surveillance: state.surveillance,
      socialCost: runState.socialCost + state.pendingSocialCostDelta,
      failedReason: reason
    };
    this.finalSettlementResult = null;
    this.saveFinalSettlementRecord();
    return true;
  }

  private applyRetailSwarmTransitionRisk(state: IntradayState): IntradayState {
    if (state.retailSwarmState === this.lastRetailSwarmState) {
      return state;
    }

    this.lastRetailSwarmState = state.retailSwarmState;

    if (state.retailSwarmState === "interest") {
      this.lastRetailSwarmEffectResult = null;
      return state;
    }

    this.lastRetailSwarmEffectResult = applyRetailSwarmRiskEffects(state);
    return this.lastRetailSwarmEffectResult.state;
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
    this.lastRetailSwarmEffectResult = null;
    this.lastRetailSwarmState = null;
    this.autoCardLastTriggeredAt = {};
  }

  private applyContractActionFit(actionId: ManualActionId): void {
    const mandate = this.contractMandate;
    const state = this.intradayState;

    if (this.gameMode !== "contract" || !mandate || !state) {
      this.lastContractActionFitResult = null;
      return;
    }

    const evaluation = this.contractEvaluationResult ?? this.refreshContractEvaluation();
    const result = applyContractManualActionFit(state, mandate, actionId, evaluation);
    this.intradayState = result.state;
    this.lastManualActionResult = this.lastManualActionResult
      ? {
          ...this.lastManualActionResult,
          state: result.state
        }
      : null;
    this.lastContractActionFitResult = result;
    this.contractActionMistakePenalty = round1(
      this.contractActionMistakePenalty + result.sideEffectPenaltyDelta
    );
    this.contractActionEfficiencyBonus = round1(
      this.contractActionEfficiencyBonus + result.efficiencyBonusDelta
    );
  }

  private recordContractObservation(kind: ContractObservationKind, state: IntradayState | null = null): void {
    const mandate = this.contractMandate;

    if (this.gameMode !== "contract" || !mandate) {
      return;
    }

    const runState = this.ensureRun();
    const activeState = state ?? this.intradayState;
    const elapsedSec = activeState ? getIntradayElapsedSec(activeState) : null;
    const observation = createContractObservation({
      day: runState.currentDay,
      elapsedSec,
      price: activeState?.currentPrice ?? mandate.referencePrice,
      priceChangePercent: activeState?.priceChangePercent ?? 0,
      marketDashboardRank: this.marketDashboardPlayerRank,
      marketDashboardValue: this.marketDashboardPlayerValue,
      madness: activeState?.madness ?? 0,
      surveillance: activeState?.surveillance ?? runState.surveillance,
      kind
    });
    const observationsWithoutDuplicate = this.contractObservations.filter(
      (candidate) =>
        !(
          candidate.day === observation.day &&
          candidate.elapsedSec === observation.elapsedSec &&
          candidate.kind === observation.kind
        )
    );

    this.contractObservations = [...observationsWithoutDuplicate, observation].slice(-contractObservationLimit);
    this.refreshContractEvaluation();
  }

  private refreshContractEvaluation(): ContractEvaluationResult {
    const mandate = this.contractMandate;

    if (!mandate) {
      throw new Error("Contract evaluation requested without an active mandate.");
    }

    this.contractEvaluationResult = evaluateContractObjectives(mandate, this.contractObservations);
    return this.contractEvaluationResult;
  }

  private calculateContractSettlementResult(finalSettlement: FinalSettlementResult): ContractSettlementResult | null {
    const mandate = this.contractMandate;

    if (this.gameMode !== "contract" || !mandate) {
      this.contractSettlementResult = null;
      return null;
    }

    const evaluation = this.refreshContractEvaluation();
    const maxMadness = this.contractObservations.reduce(
      (maxValue, observation) => Math.max(maxValue, observation.madness),
      0
    );

    return settleContract(mandate, evaluation, {
      budgetSpent: this.contractBudgetSpent,
      surveillanceCost: round1(finalSettlement.finalSurveillance * 0.08),
      socialCost: round1(finalSettlement.socialCost * 0.5),
      sideEffectPenalty: round1(
        Math.max(
          0,
          maxMadness * 0.04 +
            (finalSettlement.forcedFailure ? 12 : 0) +
            this.contractActionMistakePenalty -
            this.contractActionEfficiencyBonus
        )
      )
    });
  }

  private resetContractProgress(): void {
    this.contractObservations = [];
    this.contractEvaluationResult = null;
    this.contractSettlementResult = null;
    this.lastContractActionFitResult = null;
    this.contractBudgetSpent = 0;
    this.contractActionMistakePenalty = 0;
    this.contractActionEfficiencyBonus = 0;
  }

  private resetIntradayMoneyLedger(startingBudget: number): void {
    this.intradayStartingBudget = startingBudget;
    this.intradaySpentBudget = 0;
    this.intradayRecoveredBudget = 0;
  }

  private resetMarketDashboardFeedback(): void {
    this.marketDashboardPlayerRank = null;
    this.marketDashboardPlayerValue = 0;
    this.pendingMarketDashboardTradeValueImpulse = 0;
    this.lastMarketDashboardFeedbackElapsedSec = null;
  }

  private queueManualActionDashboardTradeValueProgress(previousState: IntradayState, nextState: IntradayState): void {
    const impulse = previousState.activeManualActionEffects.reduce((total, effect) => {
      const nextRemainingSec = nextState.activeManualActionEffects.find(
        (nextEffect) => nextEffect.actionId === effect.actionId
      )?.remainingSec ?? 0;
      const progress = 1 - nextRemainingSec / Math.max(1, effect.totalSec);

      return total + getManualActionDashboardTradeValueProgressImpulse(effect.actionId, nextState, progress);
    }, 0);

    if (impulse > 0) {
      this.pendingMarketDashboardTradeValueImpulse = Math.round(
        this.pendingMarketDashboardTradeValueImpulse + impulse
      );
    }
  }

  private recordBudgetLedgerDelta(delta: number): void {
    if (delta < 0) {
      this.intradaySpentBudget = round1(this.intradaySpentBudget + Math.abs(delta));
      if (this.gameMode === "contract" && this.contractMandate) {
        this.contractBudgetSpent = round1(this.contractBudgetSpent + Math.abs(delta));
      }
      return;
    }

    if (delta > 0) {
      this.intradayRecoveredBudget = round1(this.intradayRecoveredBudget + delta);
    }
  }
}

export const gameSession = new GameSession();

export const intradayRepositionEntryCost = 5;
export const intradayRepositionStartingHolding = 12;

const marketDashboardFeedbackMaxRank = 8;
const marketDashboardFeedbackBaseChance = 0.01;
const marketDashboardFeedbackRankChanceScale = 0.13;
const marketDashboardFeedbackMadnessChanceScale = 0.0008;
const marketDashboardFeedbackMaxChance = 0.22;
const contractObservationLimit = 2400;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatContractNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatContractSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatContractNumber(value)}`;
}

function formatContractProgress(progress: number, required: number): string {
  if (required <= 1) {
    return progress >= required ? "(완료)" : "(대기)";
  }

  return `(${formatContractNumber(Math.min(progress, required))}/${formatContractNumber(required)})`;
}

function getContractStatusLabel(status: ContractEvaluationResult["objectiveResults"][number]["status"]): string {
  if (status === "completed") {
    return "[완료]";
  }

  if (status === "failed") {
    return "[실패]";
  }

  return "[진행]";
}

function formatContractObjectiveLabel(objective: ContractMandate["objectives"][number] | undefined): string {
  if (!objective) {
    return "알 수 없는 조건";
  }

  switch (objective.type) {
    case "touch":
      return `${objective.direction === "downward" ? "하단" : "상단"} ${formatContractNumber(objective.targetPrice)} 터치`;
    case "maintain":
      return `${formatContractNumber(objective.lowerPrice)}~${formatContractNumber(objective.upperPrice)} 유지`;
    case "close_above":
      return `DAY ${objective.day} ${formatContractNumber(objective.targetPrice)} 이상 마감`;
    case "close_below":
      return `DAY ${objective.day} ${formatContractNumber(objective.targetPrice)} 이하 마감`;
    case "close_inside_band":
      return `DAY ${objective.day} ${formatContractNumber(objective.lowerPrice)}~${formatContractNumber(objective.upperPrice)} 마감`;
    case "never_break":
      if (objective.lowerPrice !== undefined) {
        return `${formatContractNumber(objective.lowerPrice)} 하단 방어`;
      }
      return `${formatContractNumber(objective.upperPrice ?? 0)} 상단 제한`;
    case "rank":
      return `대시보드 ${objective.maxRank}위 이내`;
    case "value":
      return `VALUE ${formatContractNumber(objective.minValue)} 이상`;
    case "touch_then_maintain":
      return `${formatContractNumber(objective.targetPrice)} 터치 후 ${formatContractNumber(objective.lowerPrice)}~${formatContractNumber(objective.upperPrice)} 유지`;
  }
}

function getNormalizedPositionMarketValue(state: IntradayState): number {
  if (state.averageEntryPrice <= 0 || state.holdingRatio <= 0) {
    return 0;
  }

  return round1(getNormalizedPositionCostBasis(state) * (state.currentPrice / state.averageEntryPrice));
}

function getNormalizedPositionCostBasis(state: IntradayState): number {
  if (state.holdingRatio <= 0) {
    return 0;
  }

  return round1(state.holdingRatio * Math.max(1, state.assetInfluenceResistance));
}

function getIntradayElapsedSec(state: IntradayState): number {
  return runDefaults.intradayDurationSec - state.timeRemainingSec;
}

function createPriceHistoryPoint(state: IntradayState, adjustment: PriceHistoryAdjustment = {}): PriceHistoryPoint {
  const elapsedSec = Math.min(
    runDefaults.intradayDurationSec,
    Math.max(0, getIntradayElapsedSec(state) + (adjustment.elapsedOffsetSec ?? 0))
  );
  const volumeMultiplier = adjustment.volumeMultiplier ?? 1;

  return {
    elapsedSec,
    priceChangePercent: adjustment.priceChangePercent ?? state.priceChangePercent,
    fictionalVolume: Math.round(calculateFictionalVolume(state) * volumeMultiplier)
  };
}

function calculateFictionalVolume(state: IntradayState): number {
  const participation = state.personalParticipation * 2.2;
  const liquidity = state.marketLiquidity * 1.4;
  const volatility = state.volatility * 1.1;
  const madness = state.madness * 1.35;
  const pressure = Math.abs(state.marketPressure) * 0.9;
  const tickImpulse = Math.abs(state.priceDeltaPerTick) * 260;
  const simulatorVolumeFactor = state.latestPriceComponents?.externalSimulatorVolumeFactor ?? 1;

  return Math.round(
    (80 + participation + liquidity + volatility + madness + pressure + tickImpulse) * simulatorVolumeFactor
  );
}

function getRecentPriceHighPercent(history: readonly PriceHistoryPoint[], lookbackSec: number): number {
  const latestElapsedSec = history[history.length - 1]?.elapsedSec ?? 0;
  const recentPoints = history.filter((point) => latestElapsedSec - point.elapsedSec <= lookbackSec);

  if (recentPoints.length === 0) {
    return 0;
  }

  return Math.max(...recentPoints.map((point) => point.priceChangePercent));
}

function getDefaultPreOpenChoice(runState: RunState): string {
  const availableCards = getAvailablePreOpenCards(runState);

  if (availableCards.length === 1 && availableCards[0]?.id === "early_positioning") {
    return "선취매";
  }

  return "관망";
}

function getImmediateFailureReason(state: IntradayState): string | null {
  if (state.surveillance >= 100) {
    return "surveillance reached 100";
  }

  if (state.priceChangePercent <= runDefaults.crashLine) {
    return "critical price collapse";
  }

  return null;
}

function getManualActionDashboardTradeValueProgressImpulse(
  actionId: ManualActionId,
  state: IntradayState,
  progress: number
): number {
  const progress01 = Math.min(1, Math.max(0, progress));
  const baseNotional = state.openingPrice * state.fictionalFloatUnits;

  switch (actionId) {
    case "liquidity_supply":
      return Math.round(baseNotional * (0.0045 + progress01 * 0.0145));
    case "price_push":
      return Math.round(baseNotional * (0.0038 + progress01 * 0.012));
    case "overheat_cooldown":
      return Math.round(baseNotional * (0.0032 + progress01 * 0.009));
    case "position_settlement": {
      const madnessIntensity = calculatePositionSettlementMadnessEffects(state.madness).intensity;

      return Math.round(baseNotional * (0.006 + progress01 * 0.02 + madnessIntensity * 0.006));
    }
  }
}

function getManualActionChartResponse(actionId: ManualActionId, state: IntradayState): ManualActionChartResponse {
  switch (actionId) {
    case "liquidity_supply":
      return {
        finalPriceDelta: 0.02,
        finalElapsedOffsetSec: 0.45,
        finalVolumeMultiplier: 1.08,
        points: [
          { elapsedOffsetSec: 0.12, priceDelta: 0.01, volumeMultiplier: 1.04 },
          { elapsedOffsetSec: 0.28, priceDelta: 0.01, volumeMultiplier: 1.08 }
        ]
      };
    case "price_push":
      return {
        finalPriceDelta: 0.05,
        finalElapsedOffsetSec: 0.52,
        finalVolumeMultiplier: 1.12,
        points: [
          { elapsedOffsetSec: 0.16, priceDelta: 0.02, volumeMultiplier: 1.06 },
          { elapsedOffsetSec: 0.34, priceDelta: 0.04, volumeMultiplier: 1.1 }
        ]
      };
    case "overheat_cooldown":
      return {
        finalPriceDelta: -0.04,
        finalElapsedOffsetSec: 0.38,
        finalVolumeMultiplier: 1.1,
        points: [
          { elapsedOffsetSec: 0.12, priceDelta: 0.01, volumeMultiplier: 1.05 },
          { elapsedOffsetSec: 0.25, priceDelta: -0.03, volumeMultiplier: 1.09 }
        ]
      };
    case "position_settlement":
      const madnessEffects = calculatePositionSettlementMadnessEffects(state.madness);
      const shockScale = madnessEffects.chartShockScale;
      const recoveryBounce = madnessEffects.chartRecoveryBounce;
      return {
        finalPriceDelta: round2(-0.22 * shockScale + recoveryBounce * 0.04),
        finalElapsedOffsetSec: 0.48,
        finalVolumeMultiplier: round2(1.16 + madnessEffects.intensity * 0.16),
        points: [
          {
            elapsedOffsetSec: 0.1,
            priceDelta: round2(-0.05 * shockScale),
            volumeMultiplier: round2(1.06 + madnessEffects.intensity * 0.06)
          },
          {
            elapsedOffsetSec: 0.24,
            priceDelta: round2(-0.12 * shockScale + recoveryBounce * 0.01),
            volumeMultiplier: round2(1.1 + madnessEffects.intensity * 0.1)
          },
          {
            elapsedOffsetSec: 0.38,
            priceDelta: round2(-0.18 * shockScale + recoveryBounce * 0.025),
            volumeMultiplier: round2(1.14 + madnessEffects.intensity * 0.14)
          }
        ]
      };
  }
}
