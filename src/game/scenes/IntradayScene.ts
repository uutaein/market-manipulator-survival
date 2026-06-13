import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { assets, type AssetDefinition } from "../../domain/assets/assetCatalog";
import { autoCardRewardElapsedSeconds, autoCardValues } from "../../domain/balancing/autoCardValues";
import { documentEventRules, documentEventValues } from "../../domain/balancing/documentEventValues";
import { runDefaults } from "../../domain/balancing/runDefaults";
import { getAutoCardPeriodSec } from "../../domain/intraday/autoCards";
import { manualActions } from "../../domain/intraday/manualActions";
import { calculateRetailSwarmModel, type RetailSwarmModel } from "../../domain/intraday/retailSwarm";
import { buildOrderBookProfile } from "../../domain/intraday/orderBook";
import type { MorningNews } from "../../domain/day/morningNews";
import type { ManualActionId } from "../../domain/balancing/manualActionValues";
import type { MarketBoardState } from "../../domain/market/marketBoard";
import { gameSession } from "../GameSession";
import {
  IntradayMarketTerminalOverlay,
  IntradayOrderBookOverlay,
  IntradayPriceChartOverlay,
  buildPriceCandles,
  type MarketBoardRankRow,
  type MarketTerminalModel
} from "../dom/intradayOverlays";

export class IntradayScene extends BaseDocumentScene {
  private priceChartGraphics: Phaser.GameObjects.Graphics | null = null;
  private priceChartLabel: Phaser.GameObjects.Text | null = null;
  private sessionStatusText: Phaser.GameObjects.Text | null = null;
  private pnlBadgeText: Phaser.GameObjects.Text | null = null;
  private priceChartOverlay: IntradayPriceChartOverlay | null = null;
  private orderBookOverlay: IntradayOrderBookOverlay | null = null;
  private marketTerminalOverlay: IntradayMarketTerminalOverlay | null = null;
  private moneyText: Phaser.GameObjects.Text | null = null;
  private statsText: Phaser.GameObjects.Text | null = null;
  private actionStatusText: Phaser.GameObjects.Text | null = null;
  private autoCardText: Phaser.GameObjects.Text | null = null;
  private manualActionButtons: Partial<Record<ManualActionId, Phaser.GameObjects.Text>> = {};
  private repositionButton: Phaser.GameObjects.Text | null = null;
  private manualActionFeedbackEndsAt: Partial<Record<ManualActionId, number>> = {};
  private manualActionButtonModes: Partial<Record<ManualActionId, "normal" | "active">> = {};
  private previousMarketBoardRanks = new Map<string, number>();
  private autoChoiceButtons: Phaser.GameObjects.Text[] = [];
  private documentEventObjects: Phaser.GameObjects.GameObject[] = [];
  private retailSwarmObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SceneKeys.Intraday);
  }

  create(): void {
    gameSession.intradayState ?? gameSession.startIntraday();
    this.manualActionButtons = {};
    this.manualActionFeedbackEndsAt = {};
    this.manualActionButtonModes = {};
    this.previousMarketBoardRanks = new Map();

    this.drawDocumentShell("장중 운용 화면", [], undefined, "LIVE SESSION");

    this.sessionStatusText = this.add
      .text(96, 118, "", {
        color: "#111417",
        backgroundColor: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0, 0);
    this.pnlBadgeText = this.add
      .text(742, 118, "", {
        color: "#06110d",
        backgroundColor: "#00c087",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0, 0);

    this.priceChartGraphics = this.add.graphics();
    this.priceChartLabel = this.add
      .text(108, 140, "", {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "13px"
      })
      .setOrigin(0, 0);
    this.priceChartOverlay = new IntradayPriceChartOverlay(this, {
      x: 96,
      y: 160,
      width: 350,
      height: 150,
      targetMinFallback: gameSession.ensureDay().targetBandMin,
      targetMaxFallback: gameSession.ensureDay().targetBandMax,
      crashFallback: gameSession.ensureDay().crashLine
    });
    this.orderBookOverlay = new IntradayOrderBookOverlay(this, {
      x: 452,
      y: 160,
      width: 122,
      height: 150
    });
    this.marketTerminalOverlay = new IntradayMarketTerminalOverlay(this, {
      x: 610,
      y: 132,
      width: 560,
      height: 374
    });

    this.moneyText = this.add
      .text(96, 326, "", {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "13px",
        lineSpacing: 2,
        wordWrap: { width: 470 }
      })
      .setOrigin(0, 0);

    this.statsText = this.add
      .text(96, 414, "", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "12px",
        lineSpacing: 2,
        wordWrap: { width: 470 }
      })
      .setOrigin(0, 0);

    this.autoCardText = this.add
      .text(610, 516, "", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "13px",
        lineSpacing: 2,
        wordWrap: { width: 560 }
      })
      .setOrigin(0, 0);

    this.actionStatusText = this.add
      .text(96, 536, "Manual action: ready", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 500 }
      })
      .setOrigin(0, 0);

    manualActions.forEach((action, index) => {
      const button = this.addDocumentButton(96 + index * 206, 580, action.displayName, () => {
        const result = gameSession.useManualAction(action.id);
        if (result.applied) {
          this.startManualActionFeedback(action.id);
        }
        this.actionStatusText?.setText(`Manual action: ${action.displayName} / ${result.reason}`);
        this.refreshIntradayUi();
        this.routeIfRunFailed();
      });
      this.manualActionButtons[action.id] = button;
    });

    this.addDocumentButton(1040, 618, "Day 정산", () => {
      this.scene.start(SceneKeys.DaySettlement);
    });
    this.repositionButton = this.addDocumentButton(760, 618, "운용 데스크 재배치", () => {
      this.scene.start(SceneKeys.IntradayReposition);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyDomOverlays());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyDomOverlays());
    this.refreshIntradayUi();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const nextState = gameSession.runIntradaySecond();
        this.refreshIntradayUi();

        if (this.routeIfRunFailed()) {
          return;
        }

        if (nextState.timeRemainingSec <= 0) {
          this.scene.start(SceneKeys.DaySettlement);
        }
      }
    });
  }

  update(time: number): void {
    this.refreshManualActionButtonStyles(time);
  }

  private refreshIntradayUi(): void {
    this.renderPriceChart();
    this.refreshIntradayText();
    this.renderMarketTerminal();
    this.renderRetailSwarm();
    this.refreshAutoCardText();
    this.renderAutoCardChoices();
    this.renderDocumentEventPopup();
    this.refreshDomOverlayVisibility();
    this.refreshManualActionButtonStyles(this.time.now);
    this.refreshRepositionButton();
  }

  private destroyDomOverlays(): void {
    this.priceChartOverlay?.destroy();
    this.priceChartOverlay = null;
    this.orderBookOverlay?.destroy();
    this.orderBookOverlay = null;
    this.marketTerminalOverlay?.destroy();
    this.marketTerminalOverlay = null;
  }

  private refreshDomOverlayVisibility(): void {
    const state = gameSession.intradayState;
    const modalOpen = Boolean(state?.activeDocumentEventId || gameSession.autoCardRewardChoices.length > 0);

    this.priceChartOverlay?.setVisible(!modalOpen);
    this.orderBookOverlay?.setVisible(!modalOpen);
    this.marketTerminalOverlay?.setVisible(!modalOpen);
  }

  private startManualActionFeedback(actionId: ManualActionId): void {
    this.manualActionFeedbackEndsAt = {
      ...this.manualActionFeedbackEndsAt,
      [actionId]: this.time.now + manualActionFeedbackDurationMs
    };
  }

  private refreshManualActionButtonStyles(time: number): void {
    const state = gameSession.intradayState;

    for (const action of manualActions) {
      const button = this.manualActionButtons[action.id];

      if (!button) {
        continue;
      }

      const cooldown = state?.manualActionCooldowns[action.id] ?? 0;
      const isActive = cooldown > 0 || time < (this.manualActionFeedbackEndsAt[action.id] ?? 0);

      if (isActive) {
        this.setManualActionButtonMode(button, action.id, "active");
        button.disableInteractive();
        button.setText(`${action.displayName} ${Math.ceil(cooldown)}s`);
        button.setAlpha(0.68 + Math.sin(time * 0.026) * 0.16 + 0.16);
        continue;
      }

      this.setManualActionButtonMode(button, action.id, "normal");
      button.setText(action.displayName);
      button.setInteractive({ useHandCursor: true });
      button.setAlpha(1);
    }
  }

  private setManualActionButtonMode(
    button: Phaser.GameObjects.Text,
    actionId: ManualActionId,
    mode: "normal" | "active"
  ): void {
    if (this.manualActionButtonModes[actionId] === mode) {
      return;
    }

    this.manualActionButtonModes[actionId] = mode;

    if (mode === "active") {
      button.setStyle({
        color: "#111417",
        backgroundColor: getManualActionFeedbackColor(actionId),
        fontFamily: this.fontFamily,
        fontSize: "17px",
        padding: { x: 12, y: 8 }
      });
      button.setShadow(0, 0, "#f3e8ca", 8, true, true);
      return;
    }

    button.setStyle({
      color: "#f3e8ca",
      backgroundColor: "#2a3033",
      fontFamily: this.fontFamily,
      fontSize: "17px",
      padding: { x: 12, y: 8 }
    });
    button.setShadow(0, 0, "#000000", 0, false, false);
  }

  private refreshIntradayText(): void {
    const state = gameSession.intradayState;
    const ledger = gameSession.getIntradayMoneyLedger();

    if (!state) {
      return;
    }

    if (ledger) {
      this.moneyText?.setText(
        [
          `현재가 ${formatPrice(ledger.currentPrice)} / 시초가 ${formatPrice(ledger.openingPrice)} / 평균단가 ${formatPrice(
            ledger.averageEntryPrice
          )}`,
          `보유 ${formatUnits(ledger.heldUnits)} / 매물 ${formatUnits(ledger.fictionalFloatUnits)} / 비중 ${formatNumber(
            state.holdingRatio
          )}%`,
          `포지션 평가 ${formatBudget(ledger.positionMarketValue)} / 평가손익 ${formatSignedBudget(
            ledger.unrealizedPositionProfitLoss
          )}`,
          `자금 투입 ${formatBudget(ledger.netBudgetUsed)} / 회수 ${formatBudget(
            ledger.recoveredBudget
          )} / 예산 ${formatBudget(ledger.currentBudget)}`
        ].join("\n")
      );
    }

    this.sessionStatusText?.setText(
      `DAY ${gameSession.ensureRun().currentDay}/5  ${gameSession.getSelectedAssetLabel()}  TIME ${state.timeRemainingSec}s  BUDGET ${formatBudget(
        state.budget
      )}`
    );
    this.refreshProfitLossBadge(ledger);

    this.statsText?.setText(
      [
        `TIME ${state.timeRemainingSec}s / CHANGE ${formatPercent(state.priceChangePercent)} / TICK ${formatPercent(
          state.priceDeltaPerTick
        )}`,
        `PARTICIPATION ${formatNumber(state.personalParticipation)} / LIQUIDITY ${formatNumber(state.marketLiquidity)}`,
        `SURVEILLANCE ${formatNumber(state.surveillance)} / VOLATILITY ${formatNumber(state.volatility)}`,
        `PRESSURE ${formatNumber(state.marketPressure)} / DOCUMENTS ${state.documentEventHistory.length}/${documentEventRules.maxEventsPerDay}`
      ].join("\n")
    );
  }

  private refreshProfitLossBadge(ledger: ReturnType<typeof gameSession.getIntradayMoneyLedger>): void {
    if (!ledger || !this.pnlBadgeText) {
      return;
    }

    const pnl = ledger.estimatedNetProfitLoss;
    const unrealized = ledger.unrealizedPositionProfitLoss;
    const isProfit = pnl >= 0;

    this.pnlBadgeText.setText(`손익 ${formatSignedBudget(pnl)} / 평가 ${formatSignedBudget(unrealized)}`);
    this.pnlBadgeText.setStyle({
      color: isProfit ? "#06110d" : "#1c0709",
      backgroundColor: isProfit ? "#00c087" : "#f6465d",
      fontFamily: this.fontFamily,
      fontSize: "14px",
      padding: { x: 10, y: 5 }
    });
  }

  private refreshRepositionButton(): void {
    if (!this.repositionButton) {
      return;
    }

    const available = gameSession.canRepositionIntradayAsset();
    this.repositionButton.setVisible(available);

    if (available) {
      this.repositionButton.setInteractive({ useHandCursor: true });
      this.repositionButton.setAlpha(0.82 + Math.sin(this.time.now * 0.01) * 0.18);
      return;
    }

    this.repositionButton.disableInteractive();
    this.repositionButton.setAlpha(0);
  }

  private renderMarketTerminal(): void {
    const playerState = gameSession.intradayState;
    const playerPriceChangePercent = playerState?.priceChangePercent ?? 0;
    const playerVolume = gameSession.priceHistory[gameSession.priceHistory.length - 1]?.fictionalVolume ?? 0;
    const model = buildMarketTerminalModel(
      gameSession.marketBoardState,
      playerPriceChangePercent,
      playerVolume,
      {
        currentPrice: playerState?.currentPrice ?? 10000,
        referencePrice: playerState?.openingPrice ?? 10000,
        averageEntryPrice: playerState?.averageEntryPrice ?? 10000
      },
      this.previousMarketBoardRanks,
      gameSession.ensureDay().morningNewsItems
    );
    this.previousMarketBoardRanks = model.ranks;
    this.marketTerminalOverlay?.update(model);
  }

  private refreshAutoCardText(): void {
    const state = gameSession.intradayState;
    const runState = gameSession.ensureRun();

    if (!state) {
      return;
    }

    const elapsedSec = runDefaults.intradayDurationSec - state.timeRemainingSec;
    const nextReward = autoCardRewardElapsedSeconds[gameSession.autoCardRewardIndex];
    const recentEffects = gameSession.lastAutoCardEffects.map((effect) => effect.card.displayName).join(", ");

    this.autoCardText?.setText(
      [
        `AUTO CARDS  NEXT ${nextReward ? `${Math.max(0, nextReward - elapsedSec)}s` : "none"}`,
        runState.autoCards.map((card) => {
          const value = autoCardValues[card.cardId];
          return `${value.displayName} Lv.${card.level} / ${formatNumber(getAutoCardPeriodSec(card))}s`;
        }).join("   "),
        `RECENT EFFECT: ${recentEffects || "-"}`,
        gameSession.autoCardRewardChoices.length > 0 ? "REWARD PAUSED: choose one card." : ""
      ].join("\n")
    );
  }

  private renderAutoCardChoices(): void {
    this.autoChoiceButtons.forEach((button) => button.destroy());
    this.autoChoiceButtons = [];

    gameSession.autoCardRewardChoices.forEach((choice, index) => {
      const value = autoCardValues[choice.cardId];
      const prefix = choice.type === "new" ? "NEW" : "LV UP";
      const button = this.addDocumentButton(610, 560 + index * 44, `${prefix}: ${value.displayName}`, () => {
        const message = gameSession.chooseAutoCardReward(index);
        this.actionStatusText?.setText(`Auto card: ${message}`);
        this.refreshIntradayUi();
      });

      this.autoChoiceButtons.push(button);
    });
  }

  private renderRetailSwarm(): void {
    this.retailSwarmObjects.forEach((object) => object.destroy());
    this.retailSwarmObjects = [];

    const state = gameSession.intradayState;

    if (!state) {
      return;
    }

    const model = calculateRetailSwarmModel(state);
    const panelX = 96;
    const panelY = 468;
    const panelWidth = 470;
    const panelHeight = 52;
    const panelColor = getSwarmPanelColor(model);
    const tokenColor = getSwarmTokenColor(model);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, panelColor, 0.22)
      .setOrigin(0, 0)
      .setStrokeStyle(1, tokenColor, model.warningVisual ? 0.95 : 0.55);
    const label = this.add
      .text(
        panelX + 12,
        panelY + 9,
        `RETAIL SWARM ${model.state.toUpperCase()} / ${formatNumber(model.participationNumber)}`,
        {
          color: model.panicVisual ? "#f0a6a0" : "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "13px"
        }
      )
      .setOrigin(0, 0);

    this.retailSwarmObjects.push(panel, label);

    for (let index = 0; index < model.tokenCount; index += 1) {
      const position = getSwarmTokenPosition(model, state.priceTickIndex, index, panelX, panelY, panelWidth, panelHeight);
      const token =
        model.state === "panic"
          ? this.add.rectangle(position.x, position.y, 7, 7, tokenColor, 0.88).setAngle(45)
          : this.add.circle(position.x, position.y, position.radius, tokenColor, position.alpha);

      this.retailSwarmObjects.push(token);
    }
  }

  private renderPriceChart(): void {
    const graphics = this.priceChartGraphics;
    const state = gameSession.intradayState;
    const dayState = gameSession.ensureDay();
    const runState = gameSession.ensureRun();

    if (!graphics || !state) {
      return;
    }

    const currentPrice = state.priceChangePercent;
    const history = gameSession.priceHistory.length > 0 ? gameSession.priceHistory : [];
    const candles = buildPriceCandles(history);
    const orderBook = buildOrderBookProfile(state, {
      runSeed: runState.runSeed,
      dayIndex: dayState.dayIndex
    });

    graphics.clear();
    this.priceChartOverlay?.update({
      candles,
      targetBandMin: dayState.targetBandMin,
      targetBandMax: dayState.targetBandMax,
      crashLine: dayState.crashLine
    });
    this.orderBookOverlay?.update({
      openingPrice: state.openingPrice,
      currentPrice: state.currentPrice,
      priceChangePercent: state.priceChangePercent,
      levels: orderBook.levels,
      sellWallLabel: orderBook.sellWallLabel,
      buyWallLabel: orderBook.buyWallLabel
    });

    const latestVolume = history[history.length - 1]?.fictionalVolume ?? 0;
    this.priceChartLabel?.setText(
      `CANDLE / VOLUME ${formatPercent(currentPrice)}  TARGET ${formatPercent(dayState.targetBandMin)}~${formatPercent(
        dayState.targetBandMax
      )}  VOL ${formatNumber(latestVolume)}`
    );
  }

  private renderDocumentEventPopup(): void {
    this.documentEventObjects.forEach((object) => object.destroy());
    this.documentEventObjects = [];

    const state = gameSession.intradayState;

    if (!state?.activeDocumentEventId) {
      return;
    }

    const event = documentEventValues[state.activeDocumentEventId];
    const { width, height } = this.scale;
    const panelX = width / 2 - 310;
    const panelY = height / 2 - 180;
    const panel = this.add
      .rectangle(width / 2, height / 2, 660, 380, 0x1b1f22, 0.98)
      .setStrokeStyle(2, 0xd9c58b)
      .setDepth(30);
    const title = this.add
      .text(panelX, panelY, event.displayName, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "25px"
      })
      .setDepth(31)
      .setOrigin(0, 0);
    const body = this.add
      .text(panelX, panelY + 48, "SURVEILLANCE DESK NOTICE\n응답 전까지 장중 운용이 보류됩니다.", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "16px",
        lineSpacing: 8,
        wordWrap: { width: 580 }
      })
      .setDepth(31)
      .setOrigin(0, 0);

    this.documentEventObjects.push(panel, title, body);

    event.choices.forEach((choice, index) => {
      const button = this.addDocumentButton(
        panelX,
        panelY + 132 + index * 60,
        `${getChoiceTone(choice.type)}: ${choice.label}`,
        () => {
          const message = gameSession.chooseDocumentEventChoice(index);
          this.actionStatusText?.setText(`Document event: ${message}`);
          this.refreshIntradayUi();
          this.routeIfRunFailed();
        }
      ).setDepth(31);

      this.documentEventObjects.push(button);
    });
  }

  private routeIfRunFailed(): boolean {
    if (gameSession.ensureRun().runStatus !== "failed") {
      return false;
    }

    this.scene.start(SceneKeys.FinalSettlement);
    return true;
  }
}

function buildMarketTerminalModel(
  marketBoardState: MarketBoardState | null,
  playerPriceChangePercent = 0,
  playerVolume = 0,
  playerQuote: MarketBoardQuote = {
    currentPrice: 10000,
    referencePrice: 10000,
    averageEntryPrice: 10000
  },
  previousRanks: ReadonlyMap<string, number> = new Map(),
  morningNewsItems: readonly MorningNews[] = []
): MarketTerminalModel {
  if (!marketBoardState) {
    return { peerRows: [], sectorRows: [], dashboardRows: [], rankRows: [], ranks: new Map() };
  }

  const boardRows = marketBoardState.entries
    .map((entry, index): MarketBoardRankRow =>
      createMarketBoardEntryRow(entry, playerPriceChangePercent, playerVolume, playerQuote, index, previousRanks)
    );
  const visibleAssetRows = new Map(boardRows.filter((row) => row.key.startsWith("asset:")).map((row) => [row.key, row]));
  const assetRankBaseRows = assets.map((asset, index) => {
    const key = `asset:${asset.id}`;
    return (
      visibleAssetRows.get(key) ??
      createFullMarketAssetRow(
        asset,
        marketBoardState.playerAssetId,
        playerPriceChangePercent,
        playerQuote,
        index,
        previousRanks,
        morningNewsItems
      )
    );
  });

  const rankedAssetRows = applyMarketRanks(assetRankBaseRows, previousRanks);
  const ranks = new Map(rankedAssetRows.map((row) => [row.key, row.rank]));
  const rankByKey = new Map(rankedAssetRows.map((row) => [row.key, row]));
  const playerRankIndex = Math.max(0, rankedAssetRows.findIndex((row) => row.roleLabel === "ME"));
  const dashboardStart = clampRankWindowStart(playerRankIndex, rankedAssetRows.length, 7);

  return {
    peerRows: boardRows
      .filter((row) => row.roleLabel === "PEER")
      .map((row) => rankByKey.get(row.key) ?? row),
    sectorRows: boardRows.filter((row) => row.roleLabel === "AVG"),
    dashboardRows: rankedAssetRows.slice(dashboardStart, dashboardStart + 7),
    rankRows: rankedAssetRows,
    ranks
  };
}

function createMarketBoardEntryRow(
  entry: MarketBoardState["entries"][number],
  playerPriceChangePercent: number,
  playerVolume: number,
  playerQuote: MarketBoardQuote,
  index: number,
  previousRanks: ReadonlyMap<string, number>
): MarketBoardRankRow {
  const priceChangePercent = entry.calculationMode === "detailed" ? playerPriceChangePercent : entry.priceChangePercent;
  const quote =
    entry.calculationMode === "detailed"
      ? playerQuote
      : {
          referencePrice: entry.referencePrice,
          currentPrice: entry.currentPrice,
          averageEntryPrice: entry.averageEntryPrice
        };
  const fictionalVolume =
    entry.calculationMode === "detailed"
      ? Math.max(playerVolume, 1)
      : calculateBoardEntryVolume(entry.priceChangePercent, entry.newsBadge, entry.role, index);
  const key = getMarketBoardRankKey(entry);

  return {
    key,
    label: entry.displayName,
    roleLabel: getMarketBoardRoleLabel(entry.role),
    rank: 0,
    previousRank: previousRanks.get(key) ?? null,
    rankMarker: "·",
    referencePrice: quote.referencePrice,
    currentPrice: quote.currentPrice,
    averageEntryPrice: quote.averageEntryPrice,
    priceChangePercent,
    fictionalVolume,
    fictionalTradeValue: Math.round(fictionalVolume * quote.currentPrice),
    trend: entry.calculationMode === "detailed" ? getTrendLabel(priceChangePercent) : entry.trend.toUpperCase(),
    newsBadge: entry.newsBadge ?? "-",
    newsTone: entry.newsTone
  };
}

function applyMarketRanks(
  rows: readonly MarketBoardRankRow[],
  previousRanks: ReadonlyMap<string, number>
): readonly MarketBoardRankRow[] {
  return [...rows]
    .sort((left, right) => right.fictionalTradeValue - left.fictionalTradeValue)
    .map((row, index) => {
      const rank = index + 1;

      return {
        ...row,
        rank,
        previousRank: previousRanks.get(row.key) ?? null,
        rankMarker: rankMarker(row.key, rank, previousRanks)
      };
    });
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatBudget(value: number): string {
  return `${formatNumber(Math.max(0, value))}B`;
}

function formatSignedBudget(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}B`;
}

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}`;
}

function formatUnits(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}u`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}%`;
}

interface MarketBoardQuote {
  readonly referencePrice: number;
  readonly currentPrice: number;
  readonly averageEntryPrice: number;
}

function createFullMarketAssetRow(
  asset: AssetDefinition,
  playerAssetId: string,
  playerPriceChangePercent: number,
  playerQuote: MarketBoardQuote,
  index: number,
  previousRanks: ReadonlyMap<string, number>,
  morningNewsItems: readonly MorningNews[]
): MarketBoardRankRow {
  const key = `asset:${asset.id}`;
  const seed = hashString(`${asset.id}:${index}`);
  const priceWave = ((seed % 170) - 85) / 10;
  const priceChangePercent = asset.id === playerAssetId ? playerPriceChangePercent : priceWave;
  const quote = asset.id === playerAssetId ? playerQuote : createSyntheticBoardQuote(asset.id, index, priceChangePercent);
  const baseVolume = 260 + (seed % 520);
  const priceActivity = Math.abs(priceChangePercent) * 32;
  const fictionalVolume = Math.round(baseVolume + priceActivity);

  return {
    key,
    label: asset.displayName,
    roleLabel: "MKT",
    rank: 0,
    previousRank: previousRanks.get(key) ?? null,
    rankMarker: "·",
    referencePrice: quote.referencePrice,
    currentPrice: quote.currentPrice,
    averageEntryPrice: quote.averageEntryPrice,
    priceChangePercent,
    fictionalVolume,
    fictionalTradeValue: Math.round(fictionalVolume * quote.currentPrice),
    trend: getTrendLabel(priceChangePercent),
    newsBadge: getAssetNewsBadge(asset, morningNewsItems) ?? "-",
    newsTone: getAssetNewsTone(asset, morningNewsItems)
  };
}

function createSyntheticBoardQuote(assetId: string, index: number, priceChangePercent: number): MarketBoardQuote {
  const seed = hashString(`quote:${assetId}:${index}`);
  const referencePrice = roundToTick(4200 + (seed % 15600), 10);
  const averageEntryPrice = roundToTick(referencePrice * (0.985 + ((seed % 31) / 1000)), 10);
  const currentPrice = roundToTick(referencePrice * (1 + priceChangePercent / 100), 10);

  return {
    referencePrice,
    currentPrice,
    averageEntryPrice
  };
}

function getAssetNewsBadge(asset: AssetDefinition, morningNewsItems: readonly MorningNews[]): string | null {
  if (morningNewsItems.some((news) => news.target.type === "asset" && news.target.assetId === asset.id)) {
    return "asset";
  }

  if (morningNewsItems.some((news) => news.target.type === "sector" && news.target.sectorId === asset.sectorId)) {
    return "sector";
  }

  return null;
}

function getAssetNewsTone(asset: AssetDefinition, morningNewsItems: readonly MorningNews[]): "positive" | "negative" | null {
  const assetNews = morningNewsItems.find((news) => news.target.type === "asset" && news.target.assetId === asset.id);

  if (assetNews) {
    return getNewsToneByTemplate(assetNews.templateId);
  }

  const sectorNews = morningNewsItems.find((news) => news.target.type === "sector" && news.target.sectorId === asset.sectorId);

  return sectorNews ? getNewsToneByTemplate(sectorNews.templateId) : null;
}

function getNewsToneByTemplate(templateId: MorningNews["templateId"]): "positive" | "negative" {
  return templateId === "sector_positive_catalyst" || templateId === "overheat_spread" ? "positive" : "negative";
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function roundToTick(value: number, tick: number): number {
  return Math.max(tick, Math.round(value / tick) * tick);
}

function clampRankWindowStart(playerRankIndex: number, totalRows: number, windowSize: number): number {
  if (totalRows <= windowSize) {
    return 0;
  }

  return Math.max(0, Math.min(totalRows - windowSize, playerRankIndex - Math.floor(windowSize / 2)));
}

function rankMarker(key: string, currentRank: number, previousRanks: ReadonlyMap<string, number>): string {
  const previousRank = previousRanks.get(key);

  if (!previousRank) {
    return "·";
  }

  if (currentRank < previousRank) {
    return "▲";
  }

  if (currentRank > previousRank) {
    return "▼";
  }

  return "=";
}

function calculateBoardEntryVolume(
  priceChangePercent: number,
  newsBadge: string | null,
  role: string,
  index: number
): number {
  const roleBase = role === "sector_average" ? 420 : 280;
  const priceActivity = Math.abs(priceChangePercent) * 58;
  const newsBoost = newsBadge === "market" ? 420 : newsBadge === "sector" ? 620 : newsBadge === "asset" ? 820 : 0;
  const slotVariance = (index % 4) * 31;

  return Math.round(roleBase + priceActivity + newsBoost + slotVariance);
}

function getMarketBoardRankKey(entry: MarketBoardState["entries"][number]): string {
  if ("assetId" in entry) {
    return `asset:${entry.assetId}`;
  }

  return `sector:${entry.sectorId}`;
}

function getMarketBoardRoleLabel(role: string): string {
  if (role === "player") {
    return "ME";
  }

  if (role === "same_sector_peer") {
    return "PEER";
  }

  return "AVG";
}

function getTrendLabel(priceChangePercent: number): string {
  if (priceChangePercent > 0.03) {
    return "UP";
  }

  if (priceChangePercent < -0.03) {
    return "DOWN";
  }

  return "FLAT";
}

const manualActionFeedbackDurationMs = 900;

function getChoiceTone(choiceType: string): string {
  if (choiceType === "stable") {
    return "안정";
  }

  if (choiceType === "aggressive") {
    return "공격";
  }

  return "관망";
}

function getManualActionFeedbackColor(actionId: ManualActionId): string {
  switch (actionId) {
    case "liquidity_supply":
      return "#9ecf83";
    case "price_push":
      return "#d9c58b";
    case "overheat_cooldown":
      return "#7fb4c8";
    case "position_settlement":
      return "#d08b72";
  }
}

function getSwarmPanelColor(model: RetailSwarmModel): number {
  if (model.state === "panic") {
    return 0x3b2224;
  }

  if (model.state === "overheated") {
    return 0x3b3422;
  }

  return 0x202b25;
}

function getSwarmTokenColor(model: RetailSwarmModel): number {
  if (model.state === "panic") {
    return 0xc46b5b;
  }

  if (model.state === "overheated") {
    return 0xd9c58b;
  }

  return 0x8f9f7a;
}

function getSwarmTokenPosition(
  model: RetailSwarmModel,
  tickIndex: number,
  tokenIndex: number,
  panelX: number,
  panelY: number,
  panelWidth: number,
  panelHeight: number
): { readonly x: number; readonly y: number; readonly radius: number; readonly alpha: number } {
  const centerBias = model.movement === "reverse" ? 0.7 : model.movement === "surging" ? 0.58 : 0.46;
  const centerX = panelX + panelWidth * centerBias;
  const centerY = panelY + panelHeight * 0.58;
  const phase = tickIndex * model.speed * 0.12;
  const angle = tokenIndex * 2.399 + phase;
  const ring = 10 + ((tokenIndex % 9) / 8) * 52 * model.density;
  const reverseBoost = model.movement === "reverse" ? 1.35 : 1;
  const surgeOffset = model.movement === "surging" ? Math.sin(phase + tokenIndex) * 8 : 0;

  return {
    x: centerX + Math.cos(angle) * ring * reverseBoost + surgeOffset,
    y: centerY + Math.sin(angle) * ring * 0.52 * reverseBoost,
    radius: 2.2 + model.density * 1.8,
    alpha: 0.52 + model.density * 0.4
  };
}
