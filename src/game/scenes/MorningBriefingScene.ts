import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { describeMorningNewsTarget } from "../../domain/day/morningNews";
import { gameSession } from "../GameSession";

export class MorningBriefingScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MorningBriefing);
  }

  create(): void {
    const dayState = gameSession.ensureDay();
    const briefing = gameSession.ensureMarketBriefing();
    const todayCondition = dayState.todayCondition;
    const newsLines = dayState.morningNewsItems.flatMap((news, index) => [
      `${index + 1}. ${news.displayName}`,
      `   TARGET: ${describeMorningNewsTarget(news.target)} / ${news.role}`
    ]);

    this.drawDocumentShell(
      "아침 뉴스 / 시장 브리핑",
      [
        `DAY ${dayState.dayIndex}`,
        "",
        "MORNING NEWS",
        ...newsLines,
        "",
        `ASSET: ${briefing.selectedSectorName} / ${briefing.selectedAssetName}`,
        `TARGET BAND: ${briefing.targetBandLabel}`,
        `CRASH LINE: ${briefing.crashLineLabel}`,
        "",
        `TODAY CONDITION`,
        `Attention ${formatSigned(todayCondition.attentionShiftPercent)}%`,
        `Volatility ${formatSigned(todayCondition.volatilityShiftPercent)}%`,
        `Liquidity ${formatSigned(todayCondition.liquidityShiftPercent)}%`,
        `Surveillance sensitivity ${formatSigned(todayCondition.surveillanceSensitivityShiftPercent)}%`,
        "",
        `RISK: ${briefing.riskHints.join(" / ")}`
      ],
      {
        label: "개장 승인",
        target: SceneKeys.Intraday,
        onClick: () => {
          gameSession.startIntraday();
        }
      }
    );
  }
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
