import { World, setWorldConstructor } from "@cucumber/cucumber";
import type { RunAssetProfiles, RunState } from "../../src/domain/run/runState";
import { createRunState, restartRunWithSameSeed } from "../../src/domain/run/runState";

export const preOpenCards = new Set([
  "시장 관찰",
  "사전 포지션 구축",
  "방어 자금 배정",
  "관망"
]);

export const manualActions = new Set([
  "유동성 공급",
  "가격 추진",
  "과열 해소",
  "포지션 정리"
]);

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
  openingApproved = false;
  selectedPreOpenCard = "";
  daySettlementComplete = false;
  finalSettlementComplete = false;
  documentEventOpen = false;
  documentEventsToday = 0;
  autoCardRewardOpen = false;
  autoCards = new Map<string, number>();
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
    this.hiddenProfilesAssigned = true;
    this.currentDay = this.runState.currentDay;
    this.runStatus = this.runState.runStatus;
    this.currentScreen = this.runState.phase;
    this.visibleScreens.add("Run Setup");
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
    this.currentDay = this.runState.currentDay;
    this.runStatus = this.runState.runStatus;
    this.currentScreen = this.runState.phase;
  }

  openIntraday(): void {
    this.intradayActive = true;
    this.intradayPaused = false;
    this.timerSeconds = 360;
    this.currentScreen = "intraday";
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
    this.intradayPaused = true;
    if (type === "document") {
      this.documentEventOpen = true;
    } else {
      this.autoCardRewardOpen = true;
    }
  }

  closeModal(): void {
    this.documentEventOpen = false;
    this.autoCardRewardOpen = false;
    this.intradayPaused = false;
  }
}

setWorldConstructor(MmsWorld);
