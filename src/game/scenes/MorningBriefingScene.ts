import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { describeMorningNewsTarget, type MorningNews } from "../../domain/day/morningNews";
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

    this.drawDocumentShell(
      "아침 뉴스 / 시장 브리핑",
      [],
      {
        label: "개장 승인",
        target: SceneKeys.Intraday,
        onClick: () => {
          gameSession.startIntraday();
        }
      }
    );

    this.add
      .text(96, 136, `DAY ${dayState.dayIndex}`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "18px"
      })
      .setOrigin(0, 0);

    this.drawNewsPanel(96, 184);
    this.drawBriefingPanel(790, 184, briefing.selectedSectorName, briefing.selectedAssetName, briefing.targetBandLabel, briefing.crashLineLabel);
    this.drawConditionPanel(790, 404, todayCondition);
    this.drawRiskPanel(96, 506, briefing.riskHints);
  }

  private drawNewsPromptIntro(): void {
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const promptLines = [
      { text: "> NEWS FEED OPEN", color: "#d9c58b" },
      ...dayState.morningNewsItems.flatMap((news, index) => {
        const impactColor = getPlayerImpactLabel(news, runState) ? getNewsToneColor(news) : "#f3e8ca";

        return [
          { text: `> ${index + 1}. ${news.displayName}`, color: "#f3e8ca" },
          { text: `> 대상: ${describeMorningNewsTarget(news.target)}${formatPromptImpact(news, runState)}`, color: impactColor }
        ];
      })
    ];

    this.drawDocumentShell("아침 뉴스 수신 중", []);
    this.add
      .text(96, 136, `DAY ${dayState.dayIndex}`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "18px"
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
          wordWrap: { width: 990 }
        })
        .setOrigin(0, 0)
        .setAlpha(0);

      this.tweens.add({
        targets: text,
        y: targetY,
        alpha: 1,
        duration: 220,
        delay: index * 105,
        ease: "Sine.easeOut"
      });
    });
  }

  private drawNewsPanel(x: number, y: number): void {
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();

    this.drawPanel(x, y, 650, 296);
    this.addPanelTitle(x, y, "MORNING NEWS");

    dayState.morningNewsItems.forEach((news, index) => {
      const rowY = y + 54 + index * 72;
      const impactLabel = getPlayerImpactLabel(news, runState);
      const impactColor = impactLabel ? getNewsToneColor(news) : "#8f9f7a";

      if (impactLabel) {
        this.add
          .rectangle(x + 18, rowY - 10, 606, 66, 0x000000, 0)
          .setOrigin(0, 0)
          .setStrokeStyle(2, colorStringToNumber(impactColor), 0.9);
      }

      this.add
        .text(x + 26, rowY, `${index + 1}. ${news.displayName}`, {
          color: impactLabel ? "#f3e8ca" : "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "19px"
        })
        .setOrigin(0, 0);
      this.add
        .text(x + 54, rowY + 32, `대상: ${describeMorningNewsTarget(news.target)}`, {
          color: "#8f9f7a",
          fontFamily: this.fontFamily,
          fontSize: "15px"
        })
        .setOrigin(0, 0);

      if (impactLabel) {
        this.add
          .text(x + 348, rowY + 32, impactLabel, {
            color: impactColor,
            fontFamily: this.fontFamily,
            fontSize: "15px"
          })
          .setOrigin(0, 0);
      }
    });
  }

  private drawBriefingPanel(
    x: number,
    y: number,
    sectorName: string,
    assetName: string,
    targetBandLabel: string,
    crashLineLabel: string
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
          `붕괴선: ${crashLineLabel}`
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "16px",
          lineSpacing: 10,
          wordWrap: { width: 310 }
        }
      )
      .setOrigin(0, 0);
  }

  private drawConditionPanel(
    x: number,
    y: number,
    todayCondition: {
      readonly attentionShiftPercent: number;
      readonly volatilityShiftPercent: number;
      readonly liquidityShiftPercent: number;
      readonly surveillanceSensitivityShiftPercent: number;
    }
  ): void {
    this.drawPanel(x, y, 360, 158);
    this.addPanelTitle(x, y, "TODAY CONDITION");
    this.add
      .text(
        x + 26,
        y + 54,
        [
          `관심 ${formatSigned(todayCondition.attentionShiftPercent)}%`,
          `변동성 ${formatSigned(todayCondition.volatilityShiftPercent)}%`,
          `유동성 ${formatSigned(todayCondition.liquidityShiftPercent)}%`,
          `감시 민감도 ${formatSigned(todayCondition.surveillanceSensitivityShiftPercent)}%`
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "16px",
          lineSpacing: 8
        }
      )
      .setOrigin(0, 0);
  }

  private drawRiskPanel(x: number, y: number, riskHints: readonly string[]): void {
    this.drawPanel(x, y, 650, 74);
    this.add
      .text(x + 24, y + 20, `RISK: ${riskHints.join(" / ")}`, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 602 }
      })
      .setOrigin(0, 0);
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
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);
  }
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatPromptImpact(news: MorningNews, runState: RunState): string {
  const impactLabel = getPlayerImpactLabel(news, runState);
  return impactLabel ? ` [${impactLabel}]` : "";
}

function getNewsToneColor(news: MorningNews): string {
  if (isNegativeNews(news)) {
    return "#ff5a6f";
  }

  if (isPositiveNews(news)) {
    return "#78d982";
  }

  return "#d9c58b";
}

function isPositiveNews(news: MorningNews): boolean {
  return news.designLabel.includes("Positive") || news.templateId === "sector_positive_catalyst";
}

function isNegativeNews(news: MorningNews): boolean {
  return (
    news.designLabel.includes("Negative") ||
    news.templateId === "sector_negative_catalyst" ||
    news.templateId === "market_slump" ||
    news.templateId === "regulatory_warning"
  );
}

function getPlayerImpactLabel(news: MorningNews, runState: RunState): string | null {
  if (news.target.type === "market") {
    return "내 종목 영향";
  }

  if (news.target.type === "sector" && news.target.sectorId === runState.selectedSectorId) {
    return "내 섹터 영향";
  }

  if (news.target.type === "asset" && news.target.assetId === runState.selectedAssetId) {
    return "내 종목 영향";
  }

  return null;
}

function colorStringToNumber(color: string): number {
  return Number.parseInt(color.replace("#", ""), 16);
}
