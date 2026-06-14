import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { getSectorById } from "../../domain/assets/assetCatalog";
import { getNextLargerSectorId, getSectorMarketProfile } from "../../domain/assets/assetMarketProfiles";
import { gameSession } from "../GameSession";

export class FinalSettlementScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.FinalSettlement);
  }

  create(): void {
    const finalSettlement = gameSession.finalSettlementResult ?? gameSession.calculateFinalSettlement();
    const saved = gameSession.saveFinalSettlementRecord();
    const runState = gameSession.ensureRun();
    const contractLines = gameSession.getContractFinalSettlementLines();

    this.drawDocumentShell(
      "Final 정산 화면",
      [
        `RUN: ${runState.runId}`,
        `FINAL GRADE: ${finalSettlement.finalGrade} — ${getFinalGradeLabel(finalSettlement.finalGrade)}`,
        `BASE GRADE: ${finalSettlement.baseFinalGrade}`,
        "",
        `CUMULATIVE PROFIT: ${formatSigned(finalSettlement.cumulativeProfit)}%`,
        `SUCCESSFUL DAYS: ${finalSettlement.successfulDays} / 5`,
        `FINAL BUDGET: ${formatNumber(finalSettlement.finalBudget)}`,
        "",
        `FINAL SURVEILLANCE: ${formatNumber(finalSettlement.finalSurveillance)} (${finalSettlement.finalSurveillanceGrade})`,
        `AVERAGE SURVEILLANCE GRADE: ${finalSettlement.averageSurveillanceGrade}`,
        `FINAL HOLDING BAND: ${finalSettlement.finalHoldingBand.displayName}`,
        `SOCIAL COST: ${formatNumber(finalSettlement.socialCost)}`,
        `LOCAL RECORD: ${saved ? (gameSession.lastFinalSaveUpdatedBest ? "best updated" : "saved") : "unavailable"}`,
        ...(contractLines.length > 0 ? ["", ...contractLines] : []),
        "",
        createFinalNote(finalSettlement.forcedFailure, finalSettlement.failureReason),
        createProgressionNote(runState.selectedSectorId, finalSettlement.forcedFailure)
      ]
    );

    this.addActionButton(
      {
        label: "같은 조건 재시작",
        target: SceneKeys.PreOpenCard,
        onClick: () => {
          gameSession.restartWithSameSeed();
          gameSession.beginDay();
        }
      },
      0
    );

    this.addActionButton(
      {
        label: "새 Run 시작",
        target: SceneKeys.RunSetup,
        onClick: () => {
          gameSession.prepareFreeMode();
        }
      },
      1
    );
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function getFinalGradeLabel(grade: string): string {
  const labels: Record<string, string> = {
    S: "조용한 대성공",
    A: "성공적 운용",
    B: "위험한 성공",
    C: "간신히 생존",
    D: "실패한 운용",
    F: "강제 종료"
  };

  return labels[grade] ?? "Unknown";
}

function createFinalNote(forcedFailure: boolean, failureReason: string | null): string {
  if (forcedFailure) {
    return `NOTE: 강제 종료 결과입니다. 사유: ${failureReason ?? "forced failure"}`;
  }

  return "NOTE: 같은 조건 재시작은 동일 Run Seed로 초기 조건을 다시 생성합니다.";
}

function createProgressionNote(selectedSectorId: Parameters<typeof getSectorById>[0], forcedFailure: boolean): string {
  if (forcedFailure) {
    return "NEXT: 초반 추천 섹터로 다시 자본과 감각을 안정화하세요.";
  }

  const nextSectorId = getNextLargerSectorId(selectedSectorId);

  if (!nextSectorId) {
    return "NEXT: 이미 최대 거래대금 체급입니다. 같은 체급에서 더 높은 Final 등급을 노리세요.";
  }

  const nextSector = getSectorById(nextSectorId);
  const nextProfile = getSectorMarketProfile(nextSectorId);

  return `NEXT: ${nextSector.displayName} (${nextProfile.recommendation}) 같은 더 큰 거래대금 체급에 도전하세요.`;
}
