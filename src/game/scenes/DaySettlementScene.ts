import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { gameSession, type ContractProgressSummary } from "../GameSession";
import { runDefaults } from "../../domain/balancing/runDefaults";
import {
  getBudgetPreservationLabel,
  getBudgetPreservationPercent,
} from "./settlementBudgetPreservation";

export class DaySettlementScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.DaySettlement);
  }

  create(): void {
    const settlement =
      gameSession.daySettlementResult ?? gameSession.calculateDaySettlement();
    const runState = gameSession.ensureRun();
    const runLengthDays = gameSession.getRunLengthDays();
    const isFinalDay = runState.currentDay >= runLengthDays;
    const shouldSelectAsset = gameSession.shouldSelectAssetBeforeNextDay();
    const nextLabel = isFinalDay
      ? "Final 정산"
      : shouldSelectAsset
        ? "다음 Day 종목 선택"
        : "다음 Day";
    const contractSummary = gameSession.getContractProgressSummary();
    const hint = createHint(settlement);

    this.drawDocumentShell("Day 정산 화면", [], undefined, "SETTLEMENT DESK");
    this.drawResultSummary(settlement);
    this.drawRiskMetrics(settlement);
    this.drawHintPanel(hint, contractSummary);
    this.addNextButton(nextLabel, () => {
      gameSession.continueAfterDaySettlement();

      if (isFinalDay) {
        this.scene.start(SceneKeys.FinalSettlement);
        return;
      }

      if (shouldSelectAsset) {
        this.scene.start(SceneKeys.RunSetup, { mode: "next_day_asset" });
        return;
      }

      this.scene.start(SceneKeys.PreOpenCard);
    });
  }

  private drawResultSummary(
    settlement: ReturnType<typeof gameSession.calculateDaySettlement>,
  ): void {
    this.add
      .rectangle(96, 126, 1088, 72, 0x090d10, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6f6a5b);
    this.add
      .text(118, 142, `DAY ${settlement.dayIndex} RESULT`, {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);
    this.add
      .text(118, 162, settlement.dayResultCategory, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "28px",
      })
      .setOrigin(0, 0);
    this.addMetricBadge(
      438,
      144,
      "ACTUAL PROFIT",
      `${formatSigned(settlement.actualProfit)}%`,
      getProfitColor(settlement.actualProfit),
    );
    this.addMetricBadge(
      674,
      144,
      "SURVEILLANCE",
      settlement.surveillanceGrade,
      getSurveillanceColor(settlement.surveillanceGrade),
    );
    this.addMetricBadge(
      910,
      144,
      "PROFIT BAND",
      settlement.profitBand,
      "#d9c58b",
    );
  }

  private drawRiskMetrics(
    settlement: ReturnType<typeof gameSession.calculateDaySettlement>,
  ): void {
    const metrics = settlement.supportingRiskMetrics;
    const budgetPreservationPercent = getBudgetPreservationPercent(
      metrics.budget,
      runDefaults.startingBudget,
    );

    this.drawPanel(96, 230, 520, 250, "SUPPORTING RISK METRICS");
    this.add
      .text(
        122,
        286,
        [
          `예산 ${formatNumber(metrics.budget)}B / 보전 ${formatNumber(
            budgetPreservationPercent,
          )}%`,
          `런 시작 대비 ${getBudgetPreservationLabel(
            budgetPreservationPercent,
          )}`,
          `보유 비중 ${formatNumber(metrics.holdingRatio)}%`,
          `개인 참여도 ${formatNumber(metrics.personalParticipation)}`,
          `변동성 ${formatNumber(metrics.volatility)}`,
          `사회적 비용 ${settlement.socialCostTotal} (+${settlement.socialCostDelta})`,
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "18px",
          lineSpacing: 12,
        },
      )
      .setOrigin(0, 0);

    this.drawPanel(652, 230, 532, 250, "HOLDING / SETTLEMENT CONTEXT");
    const holdingContextLines = getHoldingContextLines(settlement);
    const holdingContextColor = settlement.holdingBand.settlementRisk
      ? "#ff8a70"
      : "#c9c1ad";

    this.add
      .text(678, 286, holdingContextLines.join("\n"), {
        color: holdingContextColor,
        fontFamily: this.fontFamily,
        fontSize: "16px",
        lineSpacing: 8,
        wordWrap: { width: 470 },
      })
      .setOrigin(0, 0);
  }

  private drawHintPanel(
    hint: string,
    contractSummary: ContractProgressSummary | null,
  ): void {
    if (contractSummary) {
      this.drawPanel(96, 500, 390, 88, "NEXT PLAY HINT");
      this.add
        .text(122, 540, hint, {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "14px",
          wordWrap: { width: 338 },
        })
        .setOrigin(0, 0);
      this.drawContractProgressPanel(contractSummary);
      return;
    }

    this.drawPanel(96, 516, 760, 84, "NEXT PLAY HINT");
    this.add
      .text(122, 558, hint, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "16px",
        wordWrap: { width: 700 },
      })
      .setOrigin(0, 0);
  }

  private drawContractProgressPanel(summary: ContractProgressSummary): void {
    const statusColor = getContractStatusColor(summary.statusLabel);
    const objectiveLines = summary.objectives.map(
      (objective) =>
        `${objective.statusLabel} ${objective.label} ${objective.progressLabel}`,
    );
    const actionLine =
      summary.actionFitMessage ??
      `추천 도구: ${summary.recommendedTools.join(" / ")}`;
    const actionFitScoreColor =
      summary.actionFitRisk > summary.actionFitBonus ? "#ffb3a8" : "#dff6dc";

    this.drawPanel(520, 500, 664, 88, "CONTRACT PROGRESS");
    this.add
      .text(
        544,
        538,
        [
          `${summary.statusLabel} / ${summary.assetDisplayName}`,
          `목표 ${summary.objectivesCompleted}/${summary.objectivesTotal} · DAY ${summary.currentDay}/${summary.durationDays}`,
          `고정 보상 ${formatNumber(summary.fixedReward)}B`,
        ].join("\n"),
        {
          color: statusColor,
          fontFamily: this.fontFamily,
          fontSize: "12px",
          lineSpacing: 3,
          wordWrap: { width: 170 },
        },
      )
      .setOrigin(0, 0);
    this.add
      .text(744, 538, objectiveLines.join("\n"), {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "12px",
        lineSpacing: 4,
        wordWrap: { width: 244 },
      })
      .setOrigin(0, 0);
    this.add
      .text(1018, 538, actionLine, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "11px",
        lineSpacing: 3,
        wordWrap: { width: 140 },
      })
      .setOrigin(0, 0);
    if (summary.actionFitScoreLabel) {
      this.add
        .text(1018, 572, summary.actionFitScoreLabel, {
          color: actionFitScoreColor,
          fontFamily: this.fontFamily,
          fontSize: "11px",
          lineSpacing: 2,
          wordWrap: { width: 140 },
        })
        .setOrigin(0, 0);
    }
  }

  private addNextButton(label: string, onClick: () => void): void {
    const button = this.add
      .text(960, this.scale.height - 124, `[ ${label} ]`, {
        color: "#111417",
        backgroundColor: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "20px",
        padding: { x: 18, y: 10 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setBackgroundColor("#f3e8ca");
    });
    button.on("pointerout", () => {
      button.setBackgroundColor("#d9c58b");
    });
    button.on("pointerup", onClick);
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

function getProfitColor(value: number): string {
  return value >= 0 ? "#00c087" : "#f6465d";
}

function getSurveillanceColor(grade: string): string {
  if (["D", "E", "F"].includes(grade)) {
    return "#f6465d";
  }

  if (grade === "C") {
    return "#d9c58b";
  }

  return "#8f9f7a";
}

function getContractStatusColor(statusLabel: string): string {
  if (statusLabel.includes("성공")) {
    return "#00c087";
  }

  if (statusLabel.includes("실패")) {
    return "#f6465d";
  }

  return "#d9c58b";
}

function createHint(
  settlement: ReturnType<typeof gameSession.calculateDaySettlement>,
): string {
  if (settlement.holdingBand.id === "monopoly_risk") {
    return "HINT: 과점 위험입니다. 다음 Day에는 포지션 정리로 보유 비중을 낮추세요.";
  }

  if (settlement.holdingBand.id === "burden") {
    return "HINT: 부담 구간입니다. 수익과 감시등급을 보며 일부 정리를 고려하세요.";
  }

  if (settlement.dayResultCategory === "손실 마감") {
    return "HINT: 다음 Day에는 유동성 공급 후 매수봇 타이밍을 확인하세요.";
  }

  if (["D", "E"].includes(settlement.surveillanceGrade)) {
    return "HINT: 감시 부담이 높습니다. 매도봇이나 감시 완충 선택을 고려하세요.";
  }

  if (settlement.dayResultCategory === "조용한 실패") {
    return "HINT: 리스크는 낮았지만 추진력이 부족했습니다. 개장 전 선택을 바꿔보세요.";
  }

  return "HINT: 마감 전 보유 비중과 감시등급을 함께 확인하세요.";
}

function getHoldingContextLines(
  settlement: ReturnType<typeof gameSession.calculateDaySettlement>,
): readonly string[] {
  const metrics = settlement.supportingRiskMetrics;
  const riskLabel = settlement.holdingBand.settlementRisk
    ? " / 정산 리스크"
    : "";
  const baseLines = [
    `보유 구간: ${settlement.holdingBand.displayName}${riskLabel}`,
    `마감 보유: ${formatNumber(metrics.holdingRatio)}%`,
    `실현 축: ${settlement.profitBand} / 감시 축: ${settlement.surveillanceGrade}`,
  ];

  switch (settlement.holdingBand.id) {
    case "low_influence":
      return [
        ...baseLines,
        "영향력 부족: 수익 기여와 가격 추진력이 약합니다.",
        "다음 Day에는 개장 전 선택과 매수 타이밍을 점검하세요.",
      ];
    case "stable":
      return [
        ...baseLines,
        "안정 구간: 정상 정산 범위입니다.",
        "수익과 감시등급을 함께 유지하세요.",
      ];
    case "burden":
      return [
        ...baseLines,
        "부담 구간: 수익 잠재력과 감시/사회적 비용이 함께 커집니다.",
        "포지션 정리는 이 리스크를 낮추는 핵심 수단입니다.",
      ];
    case "monopoly_risk":
      return [
        ...baseLines,
        "과점 위험: 감시등급 악화와 Final 감점 가능성이 큽니다.",
        "마감 전 정리하지 않은 비중은 다음 Day 리스크로 남습니다.",
      ];
    default:
      return [...baseLines, "과도한 보유 비중은 정산 리스크로 누적됩니다."];
  }
}
