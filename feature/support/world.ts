import { World, setWorldConstructor } from "@cucumber/cucumber";
import type { DayState, MarketBriefing } from "../../src/domain/day/daySetup";
import { createDayState, createMarketBriefing } from "../../src/domain/day/daySetup";
import type { AutoCardId } from "../../src/domain/balancing/runDefaults";
import {
  advanceIntradayTime,
  applyIntradayStatUpdate,
  createIntradayState,
  isIntradayComplete,
  pauseIntraday,
  resumeIntraday,
  type IntradayState
} from "../../src/domain/intraday/intradayState";
import type { ManualActionResult } from "../../src/domain/intraday/manualActions";
import { getManualActionDisplayNames, useManualAction } from "../../src/domain/intraday/manualActions";
import type { AutoCardChoice, AutoCardEffectResult } from "../../src/domain/intraday/autoCards";
import { applyAutoCardEffect, generateAutoCardChoices } from "../../src/domain/intraday/autoCards";
import type { DocumentEventChoiceResult, DocumentEventOpenResult } from "../../src/domain/intraday/documentEvents";
import {
  applyDocumentEventChoice,
  canOpenAnotherDocumentEvent,
  evaluateDocumentEvent,
  openDocumentEvent
} from "../../src/domain/intraday/documentEvents";
import { runPlayerPriceTick } from "../../src/domain/intraday/priceTick";
import {
  approveOpening,
  canStartIntraday,
  getPreOpenCardDisplayNames,
  selectPreOpenCard
} from "../../src/domain/preopen/preOpenCards";
import type { RunAssetProfiles, RunState } from "../../src/domain/run/runState";
import { createRunState, restartRunWithSameSeed } from "../../src/domain/run/runState";

export const preOpenCards = new Set(getPreOpenCardDisplayNames());

export const manualActions = new Set(getManualActionDisplayNames());

export const excludedManualActions = new Set([
  "방어 자금 투입",
  "군중 진정",
  "관심 신호"
]);

export const dayResultCategories = new Set([
  "완전 성공",
  "위험 성공",
  "고위험 성공",
  "안정 운용",
  "위험 운용",
  "조용한 실패",
  "손실 마감",
  "강제 실패"
]);

export const finalGrades = new Set(["S", "A", "B", "C", "D", "F"]);

export const holdingBands = new Set([
  "영향력 부족",
  "안정 구간",
  "부담 구간",
  "과점 위험"
]);

export type RunStatus = "none" | "active" | "completed" | "failed";

export class MmsWorld extends World {
  specAccepted = false;
  fictionalOnly = false;
  currentScreen = "none";
  runStatus: RunStatus = "none";
  runState?: RunState;
  dayState?: DayState;
  marketBriefing?: MarketBriefing;
  intradayState?: IntradayState;
  runSeed = "";
  previousRunSeed = "";
  previousRunProfilesSnapshot = "";
  currentDay = 0;
  forcedFailure = false;
  finalGrade = "";
  failureReason = "";
  intradayActive = false;
  intradayPaused = false;
  timerSeconds = 0;
  priceBeforeTick = 0;
  tickIndexBefore = 0;
  priceBeforeManualAction = 0;
  lastManualActionResult?: ManualActionResult;
  openingApproved = false;
  selectedPreOpenCard = "";
  preOpenSelectionError = "";
  daySettlementComplete = false;
  finalSettlementComplete = false;
  documentEventOpen = false;
  documentEventsToday = 0;
  documentEventLimitAllowsAnother = true;
  lastDocumentEventOpenResult?: DocumentEventOpenResult;
  lastDocumentEventChoiceResult?: DocumentEventChoiceResult;
  autoCardRewardOpen = false;
  autoCards = new Map<string, number>();
  pendingAutoCardChoices: readonly AutoCardChoice[] = [];
  autoRewardIndex = 0;
  lastAutoCardEffectResult?: AutoCardEffectResult;
  visibleOptions = new Set<string>();
  visibleScreens = new Set<string>();
  displayedAssets = 0;
  nonPlayerAssets = 0;
  sameSectorPeers = 0;
  fictionalSectors = 0;
  fictionalAssetsPerSector = 0;
  hiddenProfilesAssigned = false;
  hiddenProfilesVisible = false;
  runAssetProfiles?: RunAssetProfiles;
  selectedAssetVisible = false;
  latestDayResult = "";
  latestHoldingBand = "";
  finalSummaryConsidered = false;
  carryover = new Set<string>();
  aftereffectsWeak = false;
  storage = new Map<string, unknown>();
  incompatibleSaveDiscarded = false;
  safeContentChecked = false;
  safeTerminologyChecked = false;
  fictionalCalculationChecked = false;
  day1Onboarding = false;
  learningHintShown = false;

  startNewRun(): void {
    this.previousRunSeed = this.runSeed || "mms-seed-001";
    this.runState = createRunState({ runSeed: this.previousRunSeed });
    this.runSeed = this.runState.runSeed;
    this.runAssetProfiles = this.runState.runAssetProfiles;
    this.syncAutoCardsMap();
    this.hiddenProfilesAssigned = true;
    this.currentDay = this.runState.currentDay;
    this.runStatus = this.runState.runStatus;
    this.currentScreen = this.runState.phase;
    this.visibleScreens.add("Run Setup");
  }

  beginDay(): void {
    if (!this.runState) {
      this.startNewRun();
    }

    this.dayState = createDayState(this.runState!);
    this.currentDay = this.dayState.dayIndex;
    this.visibleScreens.add("Morning News");
  }

  showMarketBriefing(): void {
    if (!this.runState) {
      this.startNewRun();
    }

    if (!this.dayState) {
      this.beginDay();
    }

    this.marketBriefing = createMarketBriefing(this.runState!, this.dayState!);
    this.visibleScreens.add("Market Briefing");
  }

  choosePreOpenCard(cardName: string): void {
    if (!this.dayState) {
      this.beginDay();
    }

    try {
      this.dayState = selectPreOpenCard(this.dayState!, cardName);
      this.selectedPreOpenCard = cardName;
      this.preOpenSelectionError = "";
    } catch (error) {
      this.preOpenSelectionError = error instanceof Error ? error.message : String(error);
    }
  }

  approveOpening(): void {
    if (!this.dayState) {
      this.beginDay();
    }

    this.dayState = approveOpening(this.dayState!);
    this.openingApproved = this.dayState.openingApproved;
  }

  canStartIntraday(): boolean {
    return Boolean(this.dayState && canStartIntraday(this.dayState));
  }

  restartWithSameSeed(): void {
    if (!this.runState) {
      this.startNewRun();
      return;
    }

    this.previousRunSeed = this.runState.runSeed;
    this.previousRunProfilesSnapshot = JSON.stringify(this.runState.runAssetProfiles);
    this.runState = restartRunWithSameSeed(this.runState);
    this.runSeed = this.runState.runSeed;
    this.runAssetProfiles = this.runState.runAssetProfiles;
    this.syncAutoCardsMap();
    this.currentDay = this.runState.currentDay;
    this.runStatus = this.runState.runStatus;
    this.currentScreen = this.runState.phase;
  }

  openIntraday(): void {
    if (!this.runState) {
      this.startNewRun();
    }

    if (!this.dayState) {
      this.beginDay();
    }

    if (!this.dayState!.preOpenCardId) {
      this.choosePreOpenCard("관망");
    }

    if (!this.dayState!.openingApproved) {
      this.approveOpening();
    }

    this.intradayState = createIntradayState(this.runState!, this.dayState!);
    this.intradayActive = true;
    this.intradayPaused = this.intradayState.isPaused;
    this.timerSeconds = this.intradayState.timeRemainingSec;
    this.currentScreen = "intraday";
  }

  finishIntradayTimer(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.intradayState = advanceIntradayTime(this.intradayState!, this.intradayState!.timeRemainingSec);
    this.timerSeconds = this.intradayState.timeRemainingSec;
    this.daySettlementComplete = isIntradayComplete(this.intradayState);
  }

  runPriceTick(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.priceBeforeTick = this.intradayState!.priceChangePercent;
    this.tickIndexBefore = this.intradayState!.priceTickIndex;
    this.intradayState = runPlayerPriceTick(this.intradayState!, {
      runSeed: this.runSeed,
      dayIndex: this.currentDay
    });
  }

  useManualAction(actionName = "가격 추진"): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.priceBeforeManualAction = this.intradayState!.priceChangePercent;
    this.lastManualActionResult = useManualAction(this.intradayState!, actionName);
    this.intradayState = this.lastManualActionResult.state;
  }

  syncAutoCardsMap(): void {
    this.autoCards = new Map((this.runState?.autoCards ?? []).map((card) => [card.cardId, card.level]));
  }

  setOwnedAutoCard(cardId: AutoCardId, level: 1 | 2 | 3): void {
    if (!this.runState) {
      this.startNewRun();
    }

    this.runState = {
      ...this.runState!,
      autoCards: [{ cardId, level }]
    };
    this.syncAutoCardsMap();
  }

  openAutoCardRewardChoice(): void {
    if (!this.runState) {
      this.startNewRun();
    }

    if (!this.intradayState) {
      this.openIntraday();
    }

    this.autoRewardIndex += 1;
    this.pendingAutoCardChoices = generateAutoCardChoices(this.runState!, this.currentDay, this.autoRewardIndex);
    this.openModal("auto-card");
  }

  triggerOwnedAutoCardEffect(): void {
    if (!this.runState) {
      this.startNewRun();
    }

    if (!this.intradayState) {
      this.openIntraday();
    }

    const card = this.runState!.autoCards[0];
    this.lastAutoCardEffectResult = applyAutoCardEffect(this.intradayState!, card);
    this.intradayState = this.lastAutoCardEffectResult.state;
  }

  forceDocumentEventTriggerCondition(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.intradayState = applyIntradayStatUpdate(
      {
        ...this.intradayState!,
        timeRemainingSec: 300
      },
      {
        surveillance: 65
      }
    );
  }

  allowDocumentEventByGlobalRules(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.intradayState = {
      ...this.intradayState!,
      documentEventHistory: [],
      lastDocumentEventElapsedSec: null
    };
    this.documentEventsToday = this.intradayState.documentEventHistory.length;
    this.documentEventLimitAllowsAnother = canOpenAnotherDocumentEvent(this.intradayState);
  }

  evaluateAndOpenDocumentEvent(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.lastDocumentEventOpenResult = evaluateDocumentEvent(this.intradayState!);
    this.intradayState = this.lastDocumentEventOpenResult.state;
    this.documentEventOpen = this.lastDocumentEventOpenResult.opened;
    this.intradayPaused = this.intradayState.isPaused;
    this.documentEventsToday = this.intradayState.documentEventHistory.length;
  }

  openDefaultDocumentEvent(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.lastDocumentEventOpenResult = openDocumentEvent(this.intradayState!, "unusual_flow_inquiry");
    this.intradayState = this.lastDocumentEventOpenResult.state;
    this.documentEventOpen = true;
    this.intradayPaused = this.intradayState.isPaused;
    this.documentEventsToday = this.intradayState.documentEventHistory.length;
  }

  chooseDocumentEventOption(choiceType: "stable" | "aggressive" | "avoid" = "stable"): void {
    if (!this.intradayState?.activeDocumentEventId) {
      this.openDefaultDocumentEvent();
    }

    this.lastDocumentEventChoiceResult = applyDocumentEventChoice(this.intradayState!, choiceType);
    this.intradayState = this.lastDocumentEventChoiceResult.state;
    this.documentEventOpen = false;
    this.intradayPaused = this.intradayState.isPaused;
  }

  setDocumentEventGapBlockedState(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.intradayState = {
      ...this.intradayState!,
      timeRemainingSec: 210,
      documentEventHistory: [
        {
          eventId: "unusual_flow_inquiry",
          choiceType: "stable",
          elapsedSec: 100
        }
      ],
      lastDocumentEventElapsedSec: 100
    };
    this.documentEventsToday = this.intradayState.documentEventHistory.length;
  }

  checkDocumentEventLimits(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.documentEventLimitAllowsAnother = canOpenAnotherDocumentEvent(this.intradayState!);
  }

  forceBoundedStatUpdate(): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.intradayState = applyIntradayStatUpdate(this.intradayState!, {
      holdingRatio: 150,
      personalParticipation: -20,
      marketLiquidity: 125,
      surveillance: 140,
      volatility: -10,
      competitionPressure: 130
    });
  }

  triggerFailure(reason = "immediate failure"): void {
    this.forcedFailure = true;
    this.failureReason = reason;
    this.runStatus = "failed";
    this.finalGrade = "F";
    this.currentScreen = "final-settlement";
  }

  completeFinalSettlement(): void {
    this.runStatus = "completed";
    this.finalSettlementComplete = true;
    this.currentScreen = "final-settlement";
  }

  openModal(type: "document" | "auto-card"): void {
    if (!this.intradayState) {
      this.openIntraday();
    }

    this.intradayState = pauseIntraday(this.intradayState!);
    this.intradayPaused = this.intradayState.isPaused;
    if (type === "document") {
      this.documentEventOpen = true;
    } else {
      this.autoCardRewardOpen = true;
    }
  }

  closeModal(): void {
    this.documentEventOpen = false;
    this.autoCardRewardOpen = false;
    if (this.intradayState) {
      this.intradayState = resumeIntraday(this.intradayState);
      this.intradayPaused = this.intradayState.isPaused;
    } else {
      this.intradayPaused = false;
    }
  }
}

setWorldConstructor(MmsWorld);
