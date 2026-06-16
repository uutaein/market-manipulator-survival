import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import {
  describeMorningNewsTarget,
  type MorningNews,
} from "../../domain/day/morningNews";
import type { DayState, PreOpenCardEffect } from "../../domain/day/daySetup";
import type {
  ContractMandate,
  ContractObjective,
  ExpertReport,
} from "../../domain/contract";
import {
  getContractRecommendedManualActionLabels,
  getContractRiskyManualActionLabels,
} from "../../domain/contract";
import type { RunState } from "../../domain/run/runState";
import { gameSession } from "../GameSession";

export class MorningBriefingScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MorningBriefing);
  }

  create(): void {
    this.drawNewsPromptIntro();
    this.time.delayedCall(1000, () => {
      this.drawFullBriefing();
    });
  }

  private drawFullBriefing(): void {
    this.children.removeAll();

    const dayState = gameSession.ensureDay();
    const briefing = gameSession.ensureMarketBriefing();
    const todayCondition = dayState.todayCondition;
    const contractMandate =
      gameSession.gameMode === "contract" ? gameSession.contractMandate : null;

    this.drawDocumentShell(
      contractMandate ? "아침 뉴스 / 전문가 리포트" : "아침 뉴스 / 시장 브리핑",
      [],
      undefined,
      "",
    );

    this.drawBriefingHeader(dayState.dayIndex, Boolean(contractMandate));

    this.drawNewsPanel(96, 204);
    if (contractMandate) {
      this.drawContractBriefingPanel(
        790,
        204,
        dayState.dayIndex,
        briefing.selectedSectorName,
        briefing.selectedAssetName,
        contractMandate,
      );
      this.drawCompactConditionPanel(790, 520, todayCondition);
    } else {
      this.drawBriefingPanel(
        790,
        204,
        briefing.selectedSectorName,
        briefing.selectedAssetName,
        briefing.targetBandLabel,
        briefing.crashLineLabel,
      );
      this.drawPreOpenEffectPanel(790, 408, dayState);
      this.drawCompactConditionPanel(790, 520, todayCondition);
    }
    this.drawRiskPanel(96, 520, briefing.riskHints);
    this.addOpeningApprovalButton();
  }

  private drawNewsPromptIntro(): void {
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const promptLines = [
      { text: "> NEWS FEED OPEN", color: "#2dd4bf" },
      ...dayState.morningNewsItems.flatMap((news, index) => {
        const scopeBadge = getNewsScopeBadge(news, runState);
        const impactColor = scopeBadge.highlight
          ? getNewsToneColor(news)
          : "#7df3e7";

        return [
          { text: `> ${index + 1}. ${news.displayName}`, color: "#f2fbfc" },
          {
            text: `> 대상: ${describeMorningNewsTarget(news.target)}${formatPromptImpact(news, runState)}`,
            color: impactColor,
          },
        ];
      }),
    ];

    this.drawDocumentShell("아침 뉴스 수신 중", []);
    this.add
      .text(96, 136, `DAY ${dayState.dayIndex}`, {
        color: "#c2d0d3",
        fontFamily: this.fontFamily,
        fontSize: "18px",
      })
      .setOrigin(0, 0);
    this.drawPanel(96, 184, 1054, 388);
    this.addPanelTitle(96, 184, "MORNING NEWS PROMPT");

    promptLines.forEach((line, index) => {
      const targetY = 242 + index * 38;
      const text = this.add
        .text(126, targetY + 18, line.text, {
          color: line.color,
          fontFamily: this.fontFamily,
          fontSize: index === 0 ? "17px" : "18px",
          wordWrap: { width: 990 },
        })
        .setOrigin(0, 0)
        .setAlpha(0);

      this.tweens.add({
        targets: text,
        y: targetY,
        alpha: 1,
        duration: 220,
        delay: index * 105,
        ease: "Sine.easeOut",
      });
    });
  }

  private drawBriefingHeader(dayIndex: number, contractMode: boolean): void {
    this.add
      .rectangle(96, 126, 1088, 50, 0x090d10, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(118, 139, `DAY ${dayIndex} · MORNING NEWS REVEALED`, {
        color: "#7df3e7",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        380,
        135,
        contractMode
          ? "전문가 리포트 확인 후 개장 승인"
          : "뉴스 영향과 목표 조건 확인 후 개장 승인",
        {
          color: "#f2fbfc",
          fontFamily: this.fontFamily,
          fontSize: "20px",
        },
      )
      .setOrigin(0, 0);
    this.add
      .text(956, 139, "OPENING APPROVAL REQUIRED", {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);
  }

  private drawNewsPanel(x: number, y: number): void {
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();

    this.drawPanel(x, y, 650, 296);
    this.addPanelTitle(x, y, "MORNING NEWS");

    dayState.morningNewsItems.forEach((news, index) => {
      const rowY = y + 54 + index * 72;
      const scopeBadge = getNewsScopeBadge(news, runState);
      const impactColor = scopeBadge.highlight
        ? getNewsToneColor(news)
        : "#7df3e7";

      if (scopeBadge.highlight) {
        this.add
          .rectangle(x + 18, rowY - 10, 606, 66, 0x000000, 0)
          .setOrigin(0, 0)
          .setStrokeStyle(2, colorStringToNumber(impactColor), 0.9);
      }

      this.add
        .text(x + 26, rowY, `${index + 1}. ${news.displayName}`, {
          color: scopeBadge.highlight ? "#f2fbfc" : "#c2d0d3",
          fontFamily: this.fontFamily,
          fontSize: "19px",
        })
        .setOrigin(0, 0);
      this.add
        .text(
          x + 54,
          rowY + 32,
          `대상: ${describeMorningNewsTarget(news.target)}`,
          {
            color: "#7df3e7",
            fontFamily: this.fontFamily,
            fontSize: "15px",
            wordWrap: { width: 420 },
          },
        )
        .setOrigin(0, 0);

      this.drawNewsScopeBadge(x + 492, rowY + 26, scopeBadge, impactColor);
    });
  }

  private drawNewsScopeBadge(
    x: number,
    y: number,
    scopeBadge: NewsScopeBadge,
    color: string,
  ): void {
    this.add
      .rectangle(
        x,
        y,
        122,
        24,
        scopeBadge.highlight ? colorStringToNumber(color) : 0x151b1f,
        scopeBadge.highlight ? 0.16 : 0.92,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, colorStringToNumber(color), 0.82);
    this.add
      .text(x + 10, y + 6, scopeBadge.label, {
        color,
        fontFamily: this.fontFamily,
        fontSize: "11px",
      })
      .setOrigin(0, 0);
  }

  private drawBriefingPanel(
    x: number,
    y: number,
    sectorName: string,
    assetName: string,
    targetBandLabel: string,
    crashLineLabel: string,
  ): void {
    this.drawPanel(x, y, 360, 190);
    this.addPanelTitle(x, y, "MARKET BRIEFING");
    this.add
      .text(
        x + 26,
        y + 58,
        [
          `종목: ${assetName}`,
          `섹터: ${sectorName}`,
          `목표 밴드: ${targetBandLabel}`,
          `붕괴선: ${crashLineLabel}`,
        ].join("\n"),
        {
          color: "#c2d0d3",
          fontFamily: this.fontFamily,
          fontSize: "16px",
          lineSpacing: 10,
          wordWrap: { width: 310 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawContractBriefingPanel(
    x: number,
    y: number,
    dayIndex: number,
    sectorName: string,
    assetName: string,
    mandate: ContractMandate,
  ): void {
    const report = mandate.expertReport;
    const remainingDays = Math.max(1, mandate.durationDays - dayIndex + 1);
    const recommendedTools = getContractRecommendedManualActionLabels(mandate);
    const riskyTools = getContractRiskyManualActionLabels(mandate);

    this.drawPanel(x, y, 360, 296);
    this.addPanelTitle(x, y, "CONTRACT BRIEF");
    this.add
      .text(
        x + 26,
        y + 54,
        [
          `${mandate.displayName} / ${assetName}`,
          `섹터 ${sectorName} · ${getContractDirectionLabel(mandate.direction)}`,
          `남은 Day ${remainingDays}/${mandate.durationDays} · 보상 ${formatReward(mandate.fixedReward)}`,
          `위험 ${mandate.riskLevel}/5 · 리포트 신뢰도 ${report.confidence}`,
          `목표선: ${formatContractTargetLine(mandate.objectives)}`,
          `성공 조건: ${formatContractSuccessConditions(mandate.objectives)}`,
          `리포트: ${formatExpertReportPriceLine(report)}`,
          report.summary,
        ].join("\n"),
        {
          color: "#c2d0d3",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          lineSpacing: 3,
          wordWrap: { width: 310 },
        },
      )
      .setOrigin(0, 0);
    this.add
      .rectangle(x + 24, y + 232, 312, 44, 0x071015, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x354149, 0.9);
    this.add
      .text(x + 36, y + 240, "TOOL FIT", {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "10px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        x + 112,
        y + 238,
        [
          `추천 ${recommendedTools.join(" / ")}`,
          `주의 ${riskyTools.join(" / ") || "없음"}`,
        ].join("\n"),
        {
          color: "#c2d0d3",
          fontFamily: this.fontFamily,
          fontSize: "11px",
          lineSpacing: 2,
          wordWrap: { width: 212 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawCompactConditionPanel(
    x: number,
    y: number,
    todayCondition: {
      readonly attentionShiftPercent: number;
      readonly volatilityShiftPercent: number;
      readonly liquidityShiftPercent: number;
      readonly surveillanceSensitivityShiftPercent: number;
    },
  ): void {
    this.drawPanel(x, y, 360, 74);
    this.add
      .text(
        x + 24,
        y + 18,
        [
          `TODAY: 관심 ${formatSigned(todayCondition.attentionShiftPercent)} · 변동성 ${formatSigned(todayCondition.volatilityShiftPercent)}`,
          `유동성 ${formatSigned(todayCondition.liquidityShiftPercent)} · 감시 ${formatSigned(todayCondition.surveillanceSensitivityShiftPercent)}`,
        ].join("\n"),
        {
          color: "#c2d0d3",
          fontFamily: this.fontFamily,
          fontSize: "13px",
          lineSpacing: 5,
          wordWrap: { width: 312 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawPreOpenEffectPanel(
    x: number,
    y: number,
    dayState: DayState,
  ): void {
    this.drawPanel(x, y, 360, 102);
    this.addPanelTitle(x, y, "PRE-OPEN EFFECT");
    this.add
      .text(x + 26, y + 46, formatPreOpenEffectSummary(dayState).join("\n"), {
        color: "#c2d0d3",
        fontFamily: this.fontFamily,
        fontSize: "12px",
        lineSpacing: 3,
        wordWrap: { width: 308 },
      })
      .setOrigin(0, 0);
  }

  private drawRiskPanel(
    x: number,
    y: number,
    riskHints: readonly string[],
  ): void {
    this.drawPanel(x, y, 650, 74);
    this.add
      .text(x + 24, y + 20, `RISK: ${riskHints.join(" / ")}`, {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 602 },
      })
      .setOrigin(0, 0);
  }

  private addOpeningApprovalButton(): void {
    const x = 914;
    const y = this.scale.height - 130;
    const width = 242;
    const height = 76;
    const panel = this.add
      .rectangle(x, y, width, height, 0x090d10, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x2dd4bf, 0.82);
    const hitZone = this.add
      .zone(x, y, width, height)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x + 18, y + 10, "OPENING STAMP", {
        color: "#7df3e7",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(x + 18, y + 32, "[ 개장 승인 ]", {
        color: "#f2fbfc",
        fontFamily: this.fontFamily,
        fontSize: "20px",
      })
      .setOrigin(0, 0);
    this.add
      .text(x + 18, y + 58, "검토 완료 · 장중 운용 전환", {
        color: "#c2d0d3",
        fontFamily: this.fontFamily,
        fontSize: "11px",
      })
      .setOrigin(0, 0);
    this.add
      .ellipse(x + 196, y + 39, 66, 42, 0x000000, 0)
      .setStrokeStyle(2, 0xff5a6f, 0.88);
    this.add
      .text(x + 175, y + 29, "승인", {
        color: "#ff5a6f",
        fontFamily: this.fontFamily,
        fontSize: "19px",
      })
      .setOrigin(0, 0)
      .setAngle(-8);

    hitZone.on("pointerover", () => {
      panel.setFillStyle(0x151a18, 0.96);
      panel.setStrokeStyle(2, 0xe6f7f8, 1);
    });
    hitZone.on("pointerout", () => {
      panel.setFillStyle(0x090d10, 0.92);
      panel.setStrokeStyle(2, 0x2dd4bf, 0.82);
    });
    hitZone.on("pointerup", () => {
      gameSession.startIntraday();
      this.scene.start(SceneKeys.Intraday);
    });
  }

  private drawPanel(x: number, y: number, width: number, height: number): void {
    this.add
      .rectangle(x, y, width, height, 0x090d10, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
  }

  private addPanelTitle(x: number, y: number, title: string): void {
    this.add
      .text(x + 24, y + 20, title, {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);
  }
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatPreOpenEffectSummary(dayState: DayState): readonly string[] {
  const effect = dayState.preOpenCardEffect;

  if (!effect) {
    return ["선택 정보 없음", "개장 전 효과가 아직 적용되지 않았습니다."];
  }

  switch (effect.sourceCardId) {
    case "early_positioning":
      return [
        `선취매 ${effect.earlyPositioningBudgetPercent ?? 0}% · 예산 ${formatSigned(effect.budgetDelta)}B`,
        `보유 ${formatSigned(effect.holdingRatioDelta)}% · 유동성 ${formatSigned(effect.marketLiquidityDelta)}`,
        effect.earlyPositioningRiskBand === "concentrated"
          ? "과집중 구간 · 개장 리스크 상승"
          : "프리미엄 진입 · 장중 전 보유 확보",
      ];
    case "news_assignment":
      return [
        `${formatNewsAssignmentLabel(effect)} · 예산 ${formatSigned(effect.budgetDelta)}B`,
        `변동성 ${formatSigned(effect.volatilityDelta)} · 유동성 보정 ${formatSigned(effect.liquiditySupplyPressureBonus)}`,
        effect.newsAssignmentDirection === "negative"
          ? "악재 맥락으로 정리 명분 강화"
          : "호재 맥락으로 상승 액션 정당성 강화",
      ];
    case "asset_analysis":
      return [
        `종목 분석 · 예산 ${formatSigned(effect.budgetDelta)}B`,
        `수동 액션 효과 x${formatMultiplier(effect.manualActionEffectMultiplier)}`,
        "즉시 가격 대신 장중 도구 효율 강화",
      ];
    case "wait_and_see":
      return [
        "관망 · 예산 +0B",
        "추가 개장 전 효과 없음",
        "예산을 보전하고 뉴스만 확인",
      ];
    default:
      return ["개장 전 선택 확인", "선택 효과가 개장 승인 후 반영됩니다."];
  }
}

function formatNewsAssignmentLabel(effect: PreOpenCardEffect): string {
  return effect.newsAssignmentDirection === "negative"
    ? "뉴스 배정: 악재"
    : "뉴스 배정: 호재";
}

function formatMultiplier(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function formatPromptImpact(news: MorningNews, runState: RunState): string {
  const scopeBadge = getNewsScopeBadge(news, runState);
  return ` [${scopeBadge.label}]`;
}

function getNewsToneColor(news: MorningNews): string {
  if (isNegativeNews(news)) {
    return "#ff5a6f";
  }

  if (isPositiveNews(news)) {
    return "#78d982";
  }

  return "#2dd4bf";
}

function isPositiveNews(news: MorningNews): boolean {
  return (
    news.designLabel.includes("Positive") ||
    news.templateId === "sector_positive_catalyst"
  );
}

function isNegativeNews(news: MorningNews): boolean {
  return (
    news.designLabel.includes("Negative") ||
    news.templateId === "sector_negative_catalyst" ||
    news.templateId === "market_slump" ||
    news.templateId === "regulatory_warning"
  );
}

interface NewsScopeBadge {
  readonly label: string;
  readonly highlight: boolean;
}

function getNewsScopeBadge(
  news: MorningNews,
  runState: RunState,
): NewsScopeBadge {
  if (news.target.type === "market") {
    return { label: "시장 전체", highlight: true };
  }

  if (
    news.target.type === "sector" &&
    news.target.sectorId === runState.selectedSectorId
  ) {
    return { label: "내 섹터 영향", highlight: true };
  }

  if (
    news.target.type === "asset" &&
    news.target.assetId === runState.selectedAssetId
  ) {
    return { label: "직접 영향", highlight: true };
  }

  if (
    news.target.type === "asset" &&
    news.target.sectorId === runState.selectedSectorId
  ) {
    return { label: "동일 섹터 참고", highlight: false };
  }

  return { label: "시장 참고", highlight: false };
}

function colorStringToNumber(color: string): number {
  return Number.parseInt(color.replace("#", ""), 16);
}

function formatExpertReportPriceLine(report: ExpertReport): string {
  const priceHint = report.targetPriceHint
    ? `제시가 ${formatPrice(report.targetPriceHint)} 부근`
    : null;
  const bandHint =
    report.lowerPrice !== undefined && report.upperPrice !== undefined
      ? `밴드 ${formatPrice(report.lowerPrice)}~${formatPrice(report.upperPrice)}`
      : null;

  return [priceHint, bandHint].filter(Boolean).join(" / ") || "가격 제시 없음";
}

function formatContractTargetLine(
  objectives: readonly ContractObjective[],
): string {
  return objectives
    .map((objective) => getContractTargetLabel(objective))
    .join(" + ");
}

function formatContractSuccessConditions(
  objectives: readonly ContractObjective[],
): string {
  return objectives
    .map((objective) => getContractSuccessConditionLabel(objective))
    .join(" + ");
}

function getContractTargetLabel(objective: ContractObjective): string {
  switch (objective.type) {
    case "touch":
      return `${formatPrice(objective.targetPrice)} ${objective.direction === "downward" ? "하단" : "상단"}`;
    case "maintain":
      return `${formatPrice(objective.lowerPrice)}~${formatPrice(objective.upperPrice)} 밴드`;
    case "close_above":
      return `${formatPrice(objective.targetPrice)} 이상`;
    case "close_below":
      return `${formatPrice(objective.targetPrice)} 이하`;
    case "close_inside_band":
      return `${formatPrice(objective.lowerPrice)}~${formatPrice(objective.upperPrice)} 마감 밴드`;
    case "never_break":
      if (objective.lowerPrice !== undefined) {
        return `${formatPrice(objective.lowerPrice)} 방어선`;
      }
      return `${formatPrice(objective.upperPrice ?? 0)} 제한선`;
    case "rank":
      return `VALUE 순위 ${objective.maxRank}위`;
    case "value":
      return `VALUE ${formatValue(objective.minValue)}`;
    case "touch_then_maintain":
      return `${formatPrice(objective.targetPrice)} 터치 후 ${formatPrice(objective.lowerPrice)}~${formatPrice(objective.upperPrice)}`;
  }
}

function getContractSuccessConditionLabel(
  objective: ContractObjective,
): string {
  switch (objective.type) {
    case "touch":
      return `DAY ${objective.deadlineDay} 안에 터치`;
    case "maintain":
      return `${objective.requiredDays}개 Day 마감 유지`;
    case "close_above":
      return `DAY ${objective.day} 이상 마감`;
    case "close_below":
      return `DAY ${objective.day} 이하 마감`;
    case "close_inside_band":
      return `DAY ${objective.day} 밴드 안 마감`;
    case "never_break":
      return `${objective.durationDays}개 Day 이탈 없음`;
    case "rank":
      return `DAY ${objective.deadlineDay} 안에 순위 도달`;
    case "value":
      return `DAY ${objective.deadlineDay} 안에 VALUE 도달`;
    case "touch_then_maintain":
      return `DAY ${objective.touchDeadlineDay} 안에 터치 후 ${objective.maintainDays}개 Day 유지`;
  }
}

function formatPrice(value: number): string {
  return value.toLocaleString("ko-KR");
}

function formatValue(value: number): string {
  if (value >= 100000000) {
    return `${Math.round(value / 100000000)}억`;
  }

  return value.toLocaleString("ko-KR");
}

function formatReward(value: number): string {
  return `${value.toLocaleString("ko-KR")}B`;
}

function getContractDirectionLabel(
  direction: ContractMandate["direction"],
): string {
  const labels: Record<ContractMandate["direction"], string> = {
    upward: "상방",
    downward: "하방",
    range: "밴드",
    defense: "방어",
    attention: "관심",
    stealth: "은닉",
  };

  return labels[direction];
}
