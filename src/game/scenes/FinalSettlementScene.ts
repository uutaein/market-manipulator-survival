import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { getSectorById } from "../../domain/assets/assetCatalog";
import {
  getNextLargerSectorId,
  getSectorMarketProfile,
} from "../../domain/assets/assetMarketProfiles";
import { runDefaults } from "../../domain/balancing/runDefaults";
import {
  gameSession,
  type ContractFinalSettlementSummary,
  type RunFailureSummary,
} from "../GameSession";
import {
  getBudgetPreservationLabel,
  getBudgetPreservationPercent,
} from "./settlementBudgetPreservation";

export class FinalSettlementScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.FinalSettlement);
  }

  create(): void {
    const finalSettlement =
      gameSession.finalSettlementResult ??
      gameSession.calculateFinalSettlement();
    const saved = gameSession.saveFinalSettlementRecord();
    const runState = gameSession.ensureRun();
    const runLengthDays = gameSession.getRunLengthDays();
    const contractSummary = gameSession.getContractFinalSettlementSummary();
    const failureSummary = gameSession.getRunFailureSummary();
    const recordStatus = getRecordStatus(
      saved,
      gameSession.lastFinalSaveUpdatedBest,
    );

    this.drawDocumentShell(
      "Final 정산 화면",
      [],
      undefined,
      "LOCAL SETTLEMENT RECORD",
    );
    this.drawGradeHero(
      finalSettlement,
      runState.runSeed,
      runLengthDays,
      recordStatus,
      failureSummary,
    );
    this.drawPerformancePanel(finalSettlement, runLengthDays);
    this.drawSurveillancePanel(finalSettlement);
    this.drawRiskPanel(finalSettlement);
    this.drawFinalNotePanel(
      createFinalNote(
        finalSettlement.forcedFailure,
        finalSettlement.failureReason,
      ),
      createProgressionNote(
        runState.selectedSectorId,
        finalSettlement.forcedFailure,
      ),
      contractSummary,
    );

    this.addActionButton(
      {
        label: "같은 조건 재시작",
        target: SceneKeys.PreOpenCard,
        onClick: () => {
          gameSession.restartWithSameSeed();
          gameSession.beginDay();
        },
      },
      0,
    );

    this.addActionButton(
      {
        label: "새 Run 시작",
        target: SceneKeys.RunSetup,
        onClick: () => {
          gameSession.prepareFreeMode();
        },
      },
      1,
    );
  }

  private drawGradeHero(
    finalSettlement: ReturnType<typeof gameSession.calculateFinalSettlement>,
    runSeed: string,
    runLengthDays: number,
    recordStatus: string,
    failureSummary: RunFailureSummary | null,
  ): void {
    this.add
      .rectangle(96, 126, 1088, 112, 0x090d10, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6f6a5b);
    this.add
      .text(122, 146, "FINAL GRADE", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "14px",
      })
      .setOrigin(0, 0);
    this.add
      .text(120, 164, finalSettlement.finalGrade, {
        color: getFinalGradeColor(finalSettlement.finalGrade),
        fontFamily: this.fontFamily,
        fontSize: "62px",
      })
      .setOrigin(0, 0);
    this.add
      .text(194, 168, getFinalGradeLabel(finalSettlement.finalGrade), {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "28px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        196,
        204,
        `RUN SEED ${shortenSeed(runSeed)} / ${runLengthDays} DAY REPORT / RECORD ${recordStatus}`,
        {
          color: "#8f9f7a",
          fontFamily: this.fontFamily,
          fontSize: "13px",
        },
      )
      .setOrigin(0, 0);

    if (finalSettlement.forcedFailure) {
      this.addMetricBadge(
        492,
        150,
        "FAILURE DAY",
        failureSummary?.dayLabel ?? "DAY ?",
        "#f6465d",
      );
      this.addMetricBadge(
        642,
        150,
        "PRICE CHANGE",
        failureSummary?.priceChangeLabel ?? "N/A",
        "#f6465d",
      );
      this.addMetricBadge(
        820,
        150,
        "SURVEILLANCE",
        failureSummary?.surveillanceLabel ??
          formatNumber(finalSettlement.finalSurveillance),
        "#f6465d",
      );
      this.addMetricBadge(
        1000,
        150,
        "BUDGET",
        failureSummary?.budgetLabel ??
          `${formatNumber(finalSettlement.finalBudget)}B`,
        "#d9c58b",
      );
      this.add
        .text(
          492,
          220,
          `REASON ${failureSummary?.reasonLabel ?? finalSettlement.failureReason ?? "forced failure"}`,
          {
            color: "#f6465d",
            fontFamily: this.fontFamily,
            fontSize: "12px",
            wordWrap: { width: 650 },
          },
        )
        .setOrigin(0, 0);
      return;
    }

    this.addMetricBadge(
      492,
      150,
      "CUMULATIVE PROFIT",
      `${formatSigned(finalSettlement.cumulativeProfit)}%`,
      getProfitColor(finalSettlement.cumulativeProfit),
    );
    this.addMetricBadge(
      730,
      150,
      "SUCCESSFUL DAYS",
      `${finalSettlement.successfulDays}/${runLengthDays}`,
      "#d9c58b",
    );
    this.addMetricBadge(936, 150, "LOCAL RECORD", recordStatus, "#8f9f7a");
  }

  private drawPerformancePanel(
    finalSettlement: ReturnType<typeof gameSession.calculateFinalSettlement>,
    runLengthDays: number,
  ): void {
    const budgetPreservationPercent = getBudgetPreservationPercent(
      finalSettlement.finalBudget,
      runDefaults.startingBudget,
    );

    this.drawPanel(96, 270, 340, 188, "RUN PERFORMANCE");
    this.add
      .text(
        122,
        326,
        [
          `누적 수익 ${formatSigned(finalSettlement.cumulativeProfit)}%`,
          `성공 Day ${finalSettlement.successfulDays}/${runLengthDays}`,
          `최종 예산 ${formatNumber(finalSettlement.finalBudget)}B / 보전 ${formatNumber(
            budgetPreservationPercent,
          )}%`,
          `런 시작 대비 ${getBudgetPreservationLabel(
            budgetPreservationPercent,
          )}`,
          `기준 등급 ${finalSettlement.baseFinalGrade}`,
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "16px",
          lineSpacing: 7,
        },
      )
      .setOrigin(0, 0);
  }

  private drawSurveillancePanel(
    finalSettlement: ReturnType<typeof gameSession.calculateFinalSettlement>,
  ): void {
    this.drawPanel(470, 270, 340, 188, "SURVEILLANCE REVIEW");
    this.add
      .text(
        496,
        326,
        [
          `최종 감시 ${formatNumber(finalSettlement.finalSurveillance)} / ${finalSettlement.finalSurveillanceGrade}`,
          `평균 감시등급 ${finalSettlement.averageSurveillanceGrade}`,
          `강제 실패 ${finalSettlement.forcedFailure ? "YES" : "NO"}`,
          finalSettlement.failureReason
            ? `사유 ${finalSettlement.failureReason}`
            : "감시 기록 저장 완료",
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "17px",
          lineSpacing: 12,
          wordWrap: { width: 286 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawRiskPanel(
    finalSettlement: ReturnType<typeof gameSession.calculateFinalSettlement>,
  ): void {
    const isAdjusted =
      finalSettlement.finalGrade !== finalSettlement.baseFinalGrade;
    const downgradeLabel = isAdjusted
      ? `${finalSettlement.baseFinalGrade} → ${finalSettlement.finalGrade}`
      : "없음";
    const adjustmentReasonLines =
      getFinalGradeAdjustmentReasonLines(finalSettlement);

    this.drawPanel(844, 270, 340, 188, "SETTLEMENT RISKS");
    this.add
      .text(
        870,
        326,
        [
          `보유 구간 ${finalSettlement.finalHoldingBand.displayName}`,
          `보유 리스크 ${finalSettlement.finalHoldingBand.settlementRisk ? "주의" : "정상"}`,
          `사회적 비용 ${formatNumber(finalSettlement.socialCost)}`,
          `등급 보정 ${downgradeLabel}`,
          ...adjustmentReasonLines,
        ].join("\n"),
        {
          color: isAdjusted ? "#ff8a70" : "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "15px",
          lineSpacing: 7,
          wordWrap: { width: 286 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawFinalNotePanel(
    note: string,
    progressionNote: string,
    contractSummary: ContractFinalSettlementSummary | null,
  ): void {
    const noteWidth = contractSummary ? 390 : 690;

    this.drawPanel(96, 492, noteWidth, 86, "FINAL NOTE");
    this.add
      .text(
        122,
        532,
        contractSummary
          ? "NOTE: 계약 정산표를 확인한 뒤 재시작 방식을 선택하세요."
          : `${note}\n${progressionNote}`,
        {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "14px",
          lineSpacing: 5,
          wordWrap: { width: noteWidth - 52 },
        },
      )
      .setOrigin(0, 0);

    if (contractSummary) {
      this.drawContractResultPanel(contractSummary);
      return;
    }

    this.drawPanel(820, 492, 364, 86, "REPLAY OPTIONS");
    this.add
      .text(846, 532, "같은 Seed로 재시도하거나 새 Run을 시작하세요.", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        lineSpacing: 4,
        wordWrap: { width: 310 },
      })
      .setOrigin(0, 0);
  }

  private drawContractResultPanel(
    summary: ContractFinalSettlementSummary,
  ): void {
    const statusColor = summary.successful ? "#00c087" : "#f6465d";
    const efficiencyGrade = summary.efficiencyGrade ?? "-";
    const riskCostTotal = round1(
      summary.surveillanceCost +
        summary.socialCost +
        summary.sideEffectPenalty +
        summary.failedObjectivePenalty,
    );
    const objectiveLines = summary.objectives.map(
      (objective) =>
        `${objective.statusLabel} ${objective.label} ${objective.progressLabel}`,
    );

    this.drawPanel(520, 466, 664, 122, "CONTRACT RESULT");
    this.add
      .text(
        544,
        506,
        [
          `${summary.statusLabel} / ${summary.assetDisplayName}`,
          `목표 ${summary.objectivesCompleted}/${summary.objectivesTotal} / DAY ${summary.currentDay}/${summary.durationDays}`,
          `보상 ${formatNumber(summary.fixedRewardPaid)}/${formatNumber(summary.fixedReward)}B ${summary.successful ? "지급" : "보류"}`,
          `순성과 ${formatSigned(summary.netPerformance)}B / 효율 ${efficiencyGrade}`,
        ].join("\n"),
        {
          color: statusColor,
          fontFamily: this.fontFamily,
          fontSize: "13px",
          lineSpacing: 5,
          wordWrap: { width: 178 },
        },
      )
      .setOrigin(0, 0);

    this.add
      .text(
        742,
        506,
        [
          `사용 예산 ${formatNumber(summary.budgetSpent)}B`,
          `감시 비용 ${formatNumber(summary.surveillanceCost)}B`,
          `사회 비용 ${formatNumber(summary.socialCost)}B`,
          `부작용 ${formatNumber(summary.sideEffectPenalty)}B`,
          `미완료 ${formatNumber(summary.failedObjectivePenalty)}B`,
          `리스크 합계 ${formatNumber(riskCostTotal)}B`,
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          lineSpacing: 2,
          wordWrap: { width: 164 },
        },
      )
      .setOrigin(0, 0);

    this.add
      .text(930, 506, objectiveLines.join("\n"), {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "11px",
        lineSpacing: 5,
        wordWrap: { width: 228 },
      })
      .setOrigin(0, 0);
  }

  private addMetricBadge(
    x: number,
    y: number,
    label: string,
    value: string,
    color: string,
  ): void {
    this.add
      .text(x, y, `${label}\n${value}`, {
        color,
        backgroundColor: "#111417",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        lineSpacing: 5,
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0, 0);
  }

  private drawPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
  ): void {
    this.add
      .rectangle(x, y, width, height, 0x090d10, 0.86)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(x + 24, y + 20, title, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function shortenSeed(runSeed: string): string {
  return runSeed.slice(0, 8).toUpperCase();
}

function getFinalGradeLabel(grade: string): string {
  const labels: Record<string, string> = {
    S: "조용한 대성공",
    A: "성공적 운용",
    B: "위험한 성공",
    C: "간신히 생존",
    D: "실패한 운용",
    F: "강제 종료",
  };

  return labels[grade] ?? "Unknown";
}

function getFinalGradeColor(grade: string): string {
  if (grade === "S" || grade === "A") {
    return "#00c087";
  }

  if (grade === "B" || grade === "C") {
    return "#d9c58b";
  }

  return "#f6465d";
}

function getProfitColor(value: number): string {
  return value >= 0 ? "#00c087" : "#f6465d";
}

function getRecordStatus(saved: boolean, updatedBest: boolean): string {
  if (!saved) {
    return "unavailable";
  }

  return updatedBest ? "best updated" : "saved";
}

function getFinalGradeAdjustmentReasonLines(
  finalSettlement: ReturnType<typeof gameSession.calculateFinalSettlement>,
): readonly string[] {
  if (finalSettlement.finalGrade === finalSettlement.baseFinalGrade) {
    return [];
  }

  const reasons: string[] = [];

  if (finalSettlement.socialCost >= 75) {
    reasons.push("사회적 비용 75+ : -2");
  } else if (finalSettlement.socialCost >= 50) {
    reasons.push("사회적 비용 50+ : -1");
  }

  if (finalSettlement.finalHoldingBand.id === "monopoly_risk") {
    reasons.push("과점 위험 : -1");
  }

  if (finalSettlement.finalSurveillanceGrade === "E") {
    reasons.push("최종 감시 E : -1");
  }

  return reasons.length > 0
    ? [`보정 사유 ${reasons.join(" / ")}`]
    : ["보정 사유 조정값 적용"];
}

function createFinalNote(
  forcedFailure: boolean,
  failureReason: string | null,
): string {
  if (forcedFailure) {
    return `NOTE: 강제 종료 결과입니다. 사유: ${failureReason ?? "forced failure"}`;
  }

  return "NOTE: 같은 조건 재시작은 동일 Run Seed로 초기 조건을 다시 생성합니다.";
}

function createProgressionNote(
  selectedSectorId: Parameters<typeof getSectorById>[0],
  forcedFailure: boolean,
): string {
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
