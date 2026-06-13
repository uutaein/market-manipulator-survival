import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { manualActions } from "../../domain/intraday/manualActions";
import type { MarketBoardState } from "../../domain/market/marketBoard";
import { gameSession } from "../GameSession";

export class IntradayScene extends BaseDocumentScene {
  private statsText: Phaser.GameObjects.Text | null = null;
  private actionStatusText: Phaser.GameObjects.Text | null = null;

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
        `START PRICE ${formatPercent(intradayState.priceChangePercent)}`
      ]
    );

    this.statsText = this.add
      .text(96, 186, "", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "18px",
        lineSpacing: 8,
        wordWrap: { width: 470 }
      })
      .setOrigin(0, 0);

    this.add
      .text(610, 136, "MARKET BOARD", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    this.add
      .text(610, 166, formatMarketBoard(marketBoardState), {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "16px",
        lineSpacing: 9,
        wordWrap: { width: 560 }
      })
      .setOrigin(0, 0);

    this.actionStatusText = this.add
      .text(96, 476, "Manual action: ready", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 500 }
      })
      .setOrigin(0, 0);

    manualActions.forEach((action, index) => {
      this.addDocumentButton(96 + index * 220, 520, action.displayName, () => {
        const result = gameSession.useManualAction(action.id);
        this.actionStatusText?.setText(`Manual action: ${action.displayName} / ${result.reason}`);
        this.refreshIntradayText();
      });
    });

    this.addActionButton({ label: "Day 정산", target: SceneKeys.DaySettlement });
    this.refreshIntradayText();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const nextState = gameSession.runIntradaySecond();
        this.refreshIntradayText();

        if (nextState.timeRemainingSec <= 0) {
          this.scene.start(SceneKeys.DaySettlement);
        }
      }
    });
  }

  private refreshIntradayText(): void {
    const state = gameSession.intradayState;

    if (!state) {
      return;
    }

    this.statsText?.setText(
      [
        `TIME ${state.timeRemainingSec}s`,
        `PRICE ${formatPercent(state.priceChangePercent)}`,
        `LAST TICK ${formatPercent(state.priceDeltaPerTick)}`,
        "",
        `BUDGET ${formatNumber(state.budget)}`,
        `HOLDING ${formatNumber(state.holdingRatio)}%`,
        `PARTICIPATION ${formatNumber(state.personalParticipation)} (${state.retailSwarmState})`,
        `LIQUIDITY ${formatNumber(state.marketLiquidity)}`,
        `SURVEILLANCE ${formatNumber(state.surveillance)}`,
        `VOLATILITY ${formatNumber(state.volatility)}`,
        `PRESSURE ${formatNumber(state.marketPressure)}`,
        "",
        ...manualActions.map(
          (action) => `${action.displayName}: ${formatNumber(state.manualActionCooldowns[action.id])}s`
        )
      ].join("\n")
    );
  }
}

function formatMarketBoard(marketBoardState: MarketBoardState | null): string {
  if (!marketBoardState) {
    return "No board data";
  }

  return marketBoardState.entries
    .map((entry, index) => {
      if (entry.calculationMode === "detailed") {
        return `${index + 1}. ${entry.displayName} / DETAIL / ${entry.newsBadge ?? "-"}`;
      }

      return `${index + 1}. ${entry.displayName} / ${entry.trend} ${formatPercent(entry.priceChangePercent)} / ${
        entry.newsBadge ?? "-"
      }`;
    })
    .join("\n");
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}%`;
}
