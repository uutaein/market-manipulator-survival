import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { gameSession } from "../GameSession";

export class IntradayScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.Intraday);
  }

  create(): void {
    const intradayState = gameSession.intradayState ?? gameSession.startIntraday();
    const marketBoardState = gameSession.marketBoardState;
    const runState = gameSession.ensureRun();

    this.drawDocumentShell(
      "장중 운용 화면",
      [
        `DAY ${runState.currentDay} / 5`,
        `ASSET: ${gameSession.getSelectedAssetLabel()}`,
        "",
        `TIME ${intradayState.timeRemainingSec}s`,
        `PRICE ${formatPercent(intradayState.priceChangePercent)}`,
        `BUDGET ${formatNumber(intradayState.budget)}`,
        `HOLDING ${formatNumber(intradayState.holdingRatio)}%`,
        `PARTICIPATION ${formatNumber(intradayState.personalParticipation)} (${intradayState.retailSwarmState})`,
        `LIQUIDITY ${formatNumber(intradayState.marketLiquidity)}`,
        `SURVEILLANCE ${formatNumber(intradayState.surveillance)}`,
        `VOLATILITY ${formatNumber(intradayState.volatility)}`,
        `PRESSURE ${formatNumber(intradayState.marketPressure)}`
      ]
    );

    this.add
      .text(610, 136, "MARKET BOARD", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    marketBoardState?.entries.forEach((entry, index) => {
      const line =
        entry.calculationMode === "detailed"
          ? `${index + 1}. ${entry.displayName} / DETAIL / ${entry.newsBadge ?? "-"}`
          : `${index + 1}. ${entry.displayName} / ${entry.trend} ${formatPercent(entry.priceChangePercent)} / ${
              entry.newsBadge ?? "-"
            }`;

      this.add
        .text(610, 166 + index * 36, line, {
          color: entry.role === "player" ? "#f3e8ca" : "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "16px",
          wordWrap: { width: 560 }
        })
        .setOrigin(0, 0);
    });

    this.addActionButton({ label: "Day 정산", target: SceneKeys.DaySettlement });
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}%`;
}
