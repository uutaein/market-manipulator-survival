import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { assets, type AssetDefinition } from "../../domain/assets/assetCatalog";
import {
  getAssetBaselineTradeValue,
  getAssetNewsSensitivity
} from "../../domain/assets/assetMarketProfiles";
import { autoCardRewardElapsedSeconds, autoCardValues } from "../../domain/balancing/autoCardValues";
import {
  documentEventRules,
  documentEventValues,
  type DocumentEventChoiceValue
} from "../../domain/balancing/documentEventValues";
import { runDefaults } from "../../domain/balancing/runDefaults";
import { getAutoCardPeriodSec } from "../../domain/intraday/autoCards";
import type { IntradayState } from "../../domain/intraday/intradayState";
import { canUseManualAction, getManualActionBudgetDelta, manualActions } from "../../domain/intraday/manualActions";
import {
  canUseOrderBookWall,
  findActiveOrderBookWallAtLevel,
  getOrderBookWallRemainingReservedBudget,
  getOrderBookWallReserveBudget,
  getOrderBookWallValue,
  type OrderBookWallResult,
  type OrderBookWallSide
} from "../../domain/intraday/orderBookWalls";
import { getOrderBookWallLevelKey } from "../../domain/balancing/orderBookWallValues";
import { calculateRetailSwarmModel, type RetailSwarmModel } from "../../domain/intraday/retailSwarm";
import { buildOrderBookProfile, type OrderBookLevel } from "../../domain/intraday/orderBook";
import type { MorningNews } from "../../domain/day/morningNews";
import type { ManualActionId } from "../../domain/balancing/manualActionValues";
import type { MarketBoardState } from "../../domain/market/marketBoard";
import { gameSession, type PriceHistoryPoint } from "../GameSession";
import {
  IntradayMarketTerminalOverlay,
  IntradayOrderBookOverlay,
  IntradayPriceChartOverlay,
  buildPriceCandles,
  type MarketBoardRankRow,
  type MarketTerminalModel,
  type OrderBookOverlayWallAction
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
  private contractText: Phaser.GameObjects.Text | null = null;
  private autoCardText: Phaser.GameObjects.Text | null = null;
  private manualActionButtons: Partial<Record<ManualActionId, Phaser.GameObjects.Text>> = {};
  private manualActionGaugeTracks: Partial<Record<ManualActionId, Phaser.GameObjects.Rectangle>> = {};
  private manualActionGaugeBars: Partial<Record<ManualActionId, Phaser.GameObjects.Rectangle>> = {};
  private repositionButton: Phaser.GameObjects.Text | null = null;
  private manualActionFeedbackEndsAt: Partial<Record<ManualActionId, number>> = {};
  private manualActionButtonModes: Partial<Record<ManualActionId, "normal" | "active">> = {};
  private previousMarketBoardRanks = new Map<string, number>();
  private previousMarketTradeValues = new Map<string, number>();
  private previousMarketTradeValueElapsedSec = 0;
  private autoChoiceObjects: Phaser.GameObjects.GameObject[] = [];
  private documentEventObjects: Phaser.GameObjects.GameObject[] = [];
  private retailSwarmObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SceneKeys.Intraday);
  }

  create(): void {
    gameSession.intradayState ?? gameSession.startIntraday();
    this.manualActionButtons = {};
    this.manualActionGaugeTracks = {};
    this.manualActionGaugeBars = {};
    this.manualActionFeedbackEndsAt = {};
    this.manualActionButtonModes = {};
    this.previousMarketBoardRanks = new Map();
    this.previousMarketTradeValues = new Map();
    this.previousMarketTradeValueElapsedSec = 0;

    this.drawDocumentShell("장중 운용 화면", [], undefined, "LIVE SESSION");
    this.ensurePepeMascotTexture();

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
      .text(894, 92, "", {
        color: "#00c087",
        backgroundColor: "#0d171d",
        fontFamily: this.fontFamily,
        fontSize: "13px",
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
      crashFallback: gameSession.ensureDay().crashLine,
      averageEntryFallback: 0
    });
    this.orderBookOverlay = new IntradayOrderBookOverlay(this, {
      x: 452,
      y: 160,
      width: 122,
      height: 150
    }, (side, offsetPercent, priceChangePercent) =>
      this.handleOrderBookWallAction(side, offsetPercent, priceChangePercent)
    );
    this.marketTerminalOverlay = new IntradayMarketTerminalOverlay(this, {
      x: 610,
      y: 152,
      width: 560,
      height: 354
    });

    this.contractText = this.add
      .text(610, 92, "", {
        color: "#d9c58b",
        backgroundColor: "#111417",
        fontFamily: this.fontFamily,
        fontSize: "12px",
        lineSpacing: 1,
        padding: { x: 8, y: 5 },
        wordWrap: { width: 270 }
      })
      .setOrigin(0, 0);

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
      .text(96, 536, "수동 액션: 대기", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 500 }
      })
      .setOrigin(0, 0);

    manualActions.forEach((action, index) => {
      const buttonX = 96 + index * 206;
      const button = this.addDocumentButton(buttonX, 580, action.displayName, () => {
        const activeEffect = gameSession.intradayState?.activeManualActionEffects.find(
          (effect) => effect.actionId === action.id
        );

        if (activeEffect) {
          gameSession.cancelManualAction(action.id);
          this.actionStatusText?.setText(`수동 액션: ${getManualActionDisplayLabel(action.id, gameSession.intradayState)} 중단`);
          this.refreshIntradayUi();
          return;
        }

        const result = gameSession.useManualAction(action.id);
        if (result.applied) {
          this.startManualActionFeedback(action.id);
        }
        this.actionStatusText?.setText(
          [
            `수동 액션: ${getManualActionDisplayLabel(action.id, gameSession.intradayState)} / ${result.reason}`,
            gameSession.lastContractActionFitResult?.message ?? null
          ]
            .filter(Boolean)
            .join("\n")
        );
        this.refreshIntradayUi();
        this.routeIfRunFailed();
      });
      this.manualActionButtons[action.id] = button;
      this.manualActionGaugeTracks[action.id] = this.add
        .rectangle(buttonX, 636, manualActionGaugeWidth, 5, 0x2a3033, 0.95)
        .setOrigin(0, 0.5);
      this.manualActionGaugeBars[action.id] = this.add
        .rectangle(buttonX, 636, 0, 5, getManualActionFeedbackColorNumber(action.id), 0.95)
        .setOrigin(0, 0.5);
    });

    this.addDocumentButton(1040, 618, "Day 정산", () => {
      this.scene.start(SceneKeys.DaySettlement);
    });
    this.repositionButton = null;
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
    this.refreshContractText();
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

  private ensurePepeMascotTexture(): void {
    if (this.textures.exists(pepeMascotTextureKey)) {
      return;
    }

    this.load.image(pepeMascotTextureKey, "/assets/meme-frog-moods.png");
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      if (this.scene.isActive()) {
        this.refreshIntradayUi();
      }
    });
    this.load.start();
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

      const activeEffect = state?.activeManualActionEffects.find((effect) => effect.actionId === action.id);
      const progress = activeEffect ? 1 - activeEffect.remainingSec / Math.max(1, activeEffect.totalSec) : 0;
      const isActive = Boolean(activeEffect) || time < (this.manualActionFeedbackEndsAt[action.id] ?? 0);
      const label = getManualActionButtonLabel(action.id, action.displayName, state);
      this.refreshManualActionGauge(action.id, progress, Boolean(activeEffect));

      if (isActive) {
        this.setManualActionButtonMode(button, action.id, "active");
        button.setInteractive({ useHandCursor: true });
        button.setText(
          activeEffect ? `${getManualActionDisplayLabel(action.id, state)}\n진행 ${Math.round(progress * 100)}% · 중단` : label
        );
        button.setAlpha(0.68 + Math.sin(time * 0.026) * 0.16 + 0.16);
        continue;
      }

      this.setManualActionButtonMode(button, action.id, "normal");
      button.setText(label);
      if (!state || !canUseManualAction(state, action.id)) {
        button.disableInteractive();
        button.setText(state?.holdingRatio === 0 ? `${getManualActionDisplayLabel(action.id, state)}\n관망` : label);
        button.setAlpha(0.38);
        continue;
      }

      button.setInteractive({ useHandCursor: true });
      button.setAlpha(1);
    }
  }

  private handleOrderBookWallAction(
    side: OrderBookWallSide,
    offsetPercent: number,
    priceChangePercent: number
  ): void {
    const result = gameSession.useOrderBookWall(side, offsetPercent, priceChangePercent);

    this.actionStatusText?.setText(`호가벽: ${getOrderBookWallDisplayLabel(side)} / ${getOrderBookWallResultLabel(result.reason)}`);
    this.refreshIntradayUi();
    this.routeIfRunFailed();
  }

  private refreshManualActionGauge(actionId: ManualActionId, progress: number, visible: boolean): void {
    const track = this.manualActionGaugeTracks[actionId];
    const bar = this.manualActionGaugeBars[actionId];

    if (!track || !bar) {
      return;
    }

    track.setAlpha(visible ? 0.95 : 0.32);
    bar.width = visible ? manualActionGaugeWidth * Math.max(0, Math.min(1, progress)) : 0;
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
          `순자산 ${formatBudget(ledger.totalAccountValue)} / 총손익 ${formatSignedBudget(ledger.estimatedNetProfitLoss)} / Day손익 ${formatSignedBudget(
            ledger.dayProfitLoss
          )}`,
          `포지션 평가 ${formatBudget(ledger.positionMarketValue)} / 평가손익 ${formatSignedBudget(
            ledger.unrealizedPositionProfitLoss
          )}`,
          `기준 Run ${formatBudget(ledger.runStartingBudget)} / Day ${formatBudget(ledger.startingBudget)}`,
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
        `PARTICIPATION ${formatNumber(state.personalParticipation)} / MADNESS ${formatNumber(
          state.madness
        )} / LIQUIDITY ${formatNumber(state.marketLiquidity)}`,
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
    const isProfit = pnl >= 0;

    this.pnlBadgeText.setText(`총손익 ${formatSignedBudget(pnl)}   순자산 ${formatBudget(ledger.totalAccountValue)}`);
    this.pnlBadgeText.setStyle({
      color: isProfit ? "#00c087" : "#f6465d",
      backgroundColor: isProfit ? "#0b1f19" : "#241316",
      fontFamily: this.fontFamily,
      fontSize: "13px",
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
    const elapsedSec = playerState ? runDefaults.intradayDurationSec - playerState.timeRemainingSec : 0;

    if (elapsedSec < this.previousMarketTradeValueElapsedSec) {
      this.previousMarketTradeValues = new Map();
      this.previousMarketTradeValueElapsedSec = 0;
    }

    const playerTradeValueImpulse =
      playerState && gameSession.marketBoardState ? gameSession.consumeMarketDashboardTradeValueImpulse() : 0;
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
      this.previousMarketTradeValues,
      elapsedSec,
      this.previousMarketTradeValueElapsedSec,
      playerTradeValueImpulse,
      gameSession.ensureDay().morningNewsItems
    );
    this.previousMarketBoardRanks = model.ranks;
    this.previousMarketTradeValues = model.tradeValues;
    this.previousMarketTradeValueElapsedSec = elapsedSec;
    gameSession.updateMarketDashboardSnapshot(model.ranks, model.tradeValues);
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
        `자동 카드  다음 보상 ${nextReward ? `${Math.max(0, nextReward - elapsedSec)}s` : "-"}`,
        runState.autoCards.map((card) => {
          const value = autoCardValues[card.cardId];
          return `${value.displayName} Lv.${card.level}(${formatNumber(getAutoCardPeriodSec(card))}s)`;
        }).join("  "),
        `최근 발동: ${recentEffects || "-"}`,
        gameSession.autoCardRewardChoices.length > 0 ? "카드 선택 대기 중" : ""
      ].join("\n")
    );
  }

  private refreshContractText(): void {
    const lines = gameSession.getContractProgressLines();

    if (lines.length === 0) {
      this.contractText?.setVisible(false);
      return;
    }

    this.contractText?.setVisible(true);
    this.contractText?.setText(lines.slice(0, 4).join("\n"));
  }

  private renderAutoCardChoices(): void {
    this.autoChoiceObjects.forEach((object) => object.destroy());
    this.autoChoiceObjects = [];

    if (gameSession.autoCardRewardChoices.length === 0) {
      return;
    }

    const shell = this.createModalShell({
      eyebrow: "AUTO CARD REWARD",
      title: "자동 카드 선택",
      body: "자동 카드는 직접 누르지 않아도 장중에 주기적으로 발동됩니다.\n새 카드를 얻거나 기존 카드를 Lv.3까지 강화합니다.\n선택 전까지 장중 운용은 보류됩니다.",
      panelWidth: 650,
      panelHeight: 420,
      accentColor: 0xd9c58b
    });
    this.autoChoiceObjects.push(...shell.objects);

    const runState = gameSession.ensureRun();
    gameSession.autoCardRewardChoices.forEach((choice, index) => {
      const value = autoCardValues[choice.cardId];
      const prefix = choice.type === "new" ? "NEW CARD" : "LEVEL UP";
      const currentLevel = runState.autoCards.find((card) => card.cardId === choice.cardId)?.level ?? 0;
      const nextLevel = currentLevel >= 2 ? 3 : currentLevel === 1 ? 2 : 1;
      const objects = this.addAutoCardChoice(
        shell,
        index,
        `${prefix}: ${value.displayName}`,
        value.description,
        [
          `Lv.${nextLevel}`,
          `${formatNumber(getAutoCardPeriodSec({ cardId: choice.cardId, level: nextLevel }))}s마다 발동`,
          getAutoCardGrowthLabel(value.growthType)
        ].join(" · "),
        () => {
          const message = gameSession.chooseAutoCardReward(index);
          this.actionStatusText?.setText(`자동 카드: ${message}`);
          this.refreshIntradayUi();
        }
      );

      this.autoChoiceObjects.push(...objects);
    });
  }

  private addAutoCardChoice(
    shell: ModalShell,
    index: number,
    primaryLabel: string,
    description: string,
    metaLabel: string,
    onClick: () => void
  ): Phaser.GameObjects.GameObject[] {
    const x = shell.panelX + 34;
    const y = shell.choiceStartY + index * 74;
    const width = shell.choiceWidth;
    const height = 64;
    const card = this.add
      .rectangle(x, y, width, height, 0x222a2e, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6f6a5b, 0.85)
      .setDepth(32)
      .setInteractive({ useHandCursor: true });
    const primary = this.add
      .text(x + 16, y + 8, primaryLabel, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "16px",
        wordWrap: { width: width - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(33);
    const body = this.add
      .text(x + 16, y + 29, description, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "12px",
        wordWrap: { width: width - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(33);
    const meta = this.add
      .text(x + 16, y + 47, metaLabel, {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "11px",
        wordWrap: { width: width - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(33);

    card.on("pointerover", () => {
      card.setFillStyle(0x2f393d, 1);
      card.setStrokeStyle(1, 0xd9c58b, 1);
    });
    card.on("pointerout", () => {
      card.setFillStyle(0x222a2e, 1);
      card.setStrokeStyle(1, 0x6f6a5b, 0.85);
    });
    card.on("pointerup", onClick);

    return [card, primary, body, meta];
  }

  private renderRetailSwarm(): void {
    this.retailSwarmObjects.forEach((object) => object.destroy());
    this.retailSwarmObjects = [];

    const state = gameSession.intradayState;

    if (!state) {
      return;
    }

    const model = calculateRetailSwarmModel(state);
    const participantMood = estimateParticipantMood(state, gameSession.priceHistory);
    const panelX = 96;
    const panelY = 468;
    const panelWidth = 470;
    const panelHeight = 52;
    const panelColor = getSwarmPanelColor(model);
    const tokenColor = getSwarmTokenColor(model);
    const mood = getPepeSwarmMood(model);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, panelColor, 0.22)
      .setOrigin(0, 0)
      .setStrokeStyle(1, tokenColor, model.warningVisual ? 0.95 : 0.55);
    const label = this.add
      .text(
        panelX + 12,
        panelY + 9,
        `MADNESS ${formatNumber(state.madness)} / 열광도 ${formatNumber(model.participationNumber)} / ${getPepeSwarmLabel(
          mood
        )}`,
        {
          color: getParticipantMoodTextColor(participantMood.profitLossPercent, model),
          fontFamily: this.fontFamily,
          fontSize: "13px"
        }
      )
      .setOrigin(0, 0);
    const participantText = this.add
      .text(
        panelX + 12,
        panelY + 29,
        `참여자 평단 ${formatPrice(participantMood.averageEntryPrice)} / 체감 ${formatPercent(participantMood.profitLossPercent)}`,
        {
          color: getParticipantMoodTextColor(participantMood.profitLossPercent, model),
          fontFamily: this.fontFamily,
          fontSize: "12px"
        }
      )
      .setOrigin(0, 0);

    this.retailSwarmObjects.push(panel, label, participantText);

    this.retailSwarmObjects.push(
      ...this.drawPepeMascot(panelX + panelWidth - 58, panelY + 27, mood, participantMood.profitLossPercent)
    );
  }

  private drawPepeMascot(
    x: number,
    y: number,
    mood: PepeSwarmMood,
    participantProfitLossPercent: number
  ): Phaser.GameObjects.GameObject[] {
    if (this.textures.exists(pepeMascotTextureKey)) {
      const frameIndex = getPepeMascotFrameIndex(mood, participantProfitLossPercent);
      const source = this.textures.get(pepeMascotTextureKey).getSourceImage() as { readonly width: number; readonly height: number };
      const frameWidth = Math.floor(source.width / pepeMascotFrameCount);
      const frameHeight = source.height;
      const mascot = this.add
        .image(x, y, pepeMascotTextureKey)
        .setCrop(frameIndex * frameWidth, 0, frameWidth, frameHeight)
        .setDisplaySize(78, 52)
        .setOrigin(0.5, 0.5);

      return [mascot];
    }

    const scale = 1.45;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const skinColor = 0x91bf73;
    const shadowColor = 0x31452b;
    const eyeWhite = 0xf2edd6;
    const pupil = 0x171a12;
    const faceRadius = 9.4 * scale;

    objects.push(
      this.add.circle(x, y, faceRadius, skinColor, 0.98).setStrokeStyle(2, shadowColor, 0.95),
      this.add.ellipse(x - 5.4 * scale, y - 4.1 * scale, 6.6 * scale, 5.4 * scale, eyeWhite, 0.98),
      this.add.ellipse(x + 5.4 * scale, y - 4.1 * scale, 6.6 * scale, 5.4 * scale, eyeWhite, 0.98),
      this.add.circle(x - 4.3 * scale, y - 3.5 * scale, 1.45 * scale, pupil, 0.98),
      this.add.circle(x + 6.5 * scale, y - 3.5 * scale, 1.45 * scale, pupil, 0.98),
      this.add.ellipse(x, y + 1.8 * scale, 12 * scale, 5.5 * scale, 0x7ba663, 0.26)
    );

    if (participantProfitLossPercent > 0.15) {
      objects.push(
        this.add.ellipse(x, y + 5.7 * scale, 10.8 * scale, 5 * scale, pupil, 0.82),
        this.add.rectangle(x, y + 4.6 * scale, 7.5 * scale, 1.2 * scale, 0xf2edd6, 0.85),
        this.add
          .text(x - 25 * scale, y - 25 * scale, "가즈아", {
            color: "#00c087",
            fontFamily: this.fontFamily,
            fontSize: "11px"
          })
          .setOrigin(0, 0)
      );
      return objects;
    }

    if (participantProfitLossPercent < -0.15) {
      objects.push(
        this.add.rectangle(x, y + 6.2 * scale, 10.8 * scale, 1.7 * scale, pupil, 0.75).setAngle(8),
        this.add.ellipse(x + 11.5 * scale, y - 1 * scale, 3.2 * scale, 5.6 * scale, 0x7fb4c8, 0.82),
        this.add
          .text(x + 14 * scale, y - 18 * scale, "...", {
            color: "#f6465d",
            fontFamily: this.fontFamily,
            fontSize: "13px"
          })
          .setOrigin(0, 0)
      );
      return objects;
    }

    objects.push(this.add.rectangle(x, y + 5.7 * scale, 10.8 * scale, 1.7 * scale, pupil, 0.75));

    if (mood === "sleeping") {
      objects.push(
        this.add
          .text(x + 14 * scale, y - 17 * scale, "Zzz", {
            color: "#8fa2a6",
            fontFamily: this.fontFamily,
            fontSize: "12px"
          })
          .setOrigin(0, 0)
      );
      return objects;
    }

    if (mood === "curious") {
      objects.push(
        this.add
          .text(x + 14 * scale, y - 18 * scale, "?", {
            color: "#d9c58b",
            fontFamily: this.fontFamily,
            fontSize: "16px"
          })
          .setOrigin(0, 0)
      );
      return objects;
    }

    if (mood === "euphoric") {
      objects.push(
        this.add.line(x - 6 * scale, y - 9 * scale, 0, 0, -5 * scale, -8 * scale, shadowColor, 0.95),
        this.add.line(x + 6 * scale, y - 9 * scale, 0, 0, 5 * scale, -8 * scale, shadowColor, 0.95),
        this.add.circle(x - 11 * scale, y - 17 * scale, 1.7 * scale, 0xd9c58b, 0.96),
        this.add.circle(x + 11 * scale, y - 17 * scale, 1.7 * scale, 0xd9c58b, 0.96),
        this.add
          .text(x + 14 * scale, y - 18 * scale, "!", {
            color: "#d9c58b",
            fontFamily: this.fontFamily,
            fontSize: "16px"
          })
          .setOrigin(0, 0)
      );
    }

    return objects;
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
      crashLine: dayState.crashLine,
      averageEntryPriceChangePercent: calculateAverageEntryPriceChangePercent(state)
    });
    this.orderBookOverlay?.update({
      openingPrice: state.openingPrice,
      currentPrice: state.currentPrice,
      priceChangePercent: state.priceChangePercent,
      levels: orderBook.levels,
      sellWallLabel: orderBook.sellWallLabel,
      buyWallLabel: orderBook.buyWallLabel,
      wallActions: buildOrderBookWallOverlayActions(state, orderBook.levels)
    });

    const latestVolume = history[history.length - 1]?.fictionalVolume ?? 0;
    const averageEntryChange = calculateAverageEntryPriceChangePercent(state);
    this.priceChartLabel?.setText(
      `CHG ${formatPercent(currentPrice)}  TGT ${formatPercent(dayState.targetBandMin)}~${formatPercent(
        dayState.targetBandMax
      )}  AVG ${averageEntryChange === null ? "-" : formatPercent(averageEntryChange)}  VOL ${formatNumber(latestVolume)}`
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
    const shell = this.createModalShell({
      eyebrow: "DOCUMENT EVENT",
      title: event.displayName,
      body: "거래소 문서가 도착했습니다.\n응답 전까지 장중 운용은 일시 정지됩니다.",
      panelWidth: 650,
      panelHeight: 390,
      accentColor: 0xd9c58b
    });

    this.documentEventObjects.push(...shell.objects);
    event.choices.forEach((choice, index) => {
      const objects = this.addModalChoice(
        shell,
        index,
        `${getChoiceTone(choice.type)}: ${choice.label}`,
        getDocumentChoiceSecondaryLabel(choice),
        () => {
          const message = gameSession.chooseDocumentEventChoice(index);
          this.actionStatusText?.setText(`문서 이벤트: ${message}`);
          this.refreshIntradayUi();
          this.routeIfRunFailed();
        }
      );

      this.documentEventObjects.push(...objects);
    });
  }

  private createModalShell(config: ModalShellConfig): ModalShell {
    const { width, height } = this.scale;
    const panelX = width / 2 - config.panelWidth / 2;
    const panelY = height / 2 - config.panelHeight / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x050709, 0.74).setDepth(28);
    const shadow = this.add
      .rectangle(width / 2 + 8, height / 2 + 10, config.panelWidth, config.panelHeight, 0x000000, 0.42)
      .setDepth(29);
    const panel = this.add
      .rectangle(width / 2, height / 2, config.panelWidth, config.panelHeight, 0x1b1f22, 0.98)
      .setStrokeStyle(2, config.accentColor)
      .setDepth(30);
    const strip = this.add
      .rectangle(panelX, panelY, config.panelWidth, 38, 0x0d171d, 1)
      .setOrigin(0, 0)
      .setDepth(31);
    const accent = this.add
      .rectangle(panelX, panelY, 5, config.panelHeight, config.accentColor, 0.9)
      .setOrigin(0, 0)
      .setDepth(32);
    const eyebrow = this.add
      .text(panelX + 18, panelY + 11, config.eyebrow, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "12px"
      })
      .setOrigin(0, 0)
      .setDepth(32);
    const title = this.add
      .text(panelX + 34, panelY + 56, config.title, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "25px",
        wordWrap: { width: config.panelWidth - 68 }
      })
      .setOrigin(0, 0)
      .setDepth(32);
    const body = this.add
      .text(panelX + 34, panelY + 96, config.body, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        lineSpacing: 5,
        wordWrap: { width: config.panelWidth - 68 }
      })
      .setOrigin(0, 0)
      .setDepth(32);

    objects.push(backdrop, shadow, panel, strip, accent, eyebrow, title, body);

    return {
      panelX,
      panelY,
      panelWidth: config.panelWidth,
      choiceStartY: panelY + 162,
      choiceWidth: config.panelWidth - 68,
      objects
    };
  }

  private addModalChoice(
    shell: ModalShell,
    index: number,
    primaryLabel: string,
    secondaryLabel: string,
    onClick: () => void
  ): Phaser.GameObjects.GameObject[] {
    const x = shell.panelX + 34;
    const y = shell.choiceStartY + index * 62;
    const width = shell.choiceWidth;
    const height = 50;
    const card = this.add
      .rectangle(x, y, width, height, 0x222a2e, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6f6a5b, 0.85)
      .setDepth(32)
      .setInteractive({ useHandCursor: true });
    const primary = this.add
      .text(x + 16, y + 9, primaryLabel, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "16px",
        wordWrap: { width: width - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(33);
    const secondary = this.add
      .text(x + 16, y + 30, secondaryLabel, {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "12px",
        wordWrap: { width: width - 32 }
      })
      .setOrigin(0, 0)
      .setDepth(33);

    card.on("pointerover", () => {
      card.setFillStyle(0x2f393d, 1);
      card.setStrokeStyle(1, 0xd9c58b, 1);
    });
    card.on("pointerout", () => {
      card.setFillStyle(0x222a2e, 1);
      card.setStrokeStyle(1, 0x6f6a5b, 0.85);
    });
    card.on("pointerup", onClick);

    return [card, primary, secondary];
  }

  private routeIfRunFailed(): boolean {
    if (gameSession.ensureRun().runStatus !== "failed") {
      return false;
    }

    this.scene.start(SceneKeys.FinalSettlement);
    return true;
  }
}

interface ModalShellConfig {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly panelWidth: number;
  readonly panelHeight: number;
  readonly accentColor: number;
}

interface ModalShell {
  readonly panelX: number;
  readonly panelY: number;
  readonly panelWidth: number;
  readonly choiceStartY: number;
  readonly choiceWidth: number;
  readonly objects: readonly Phaser.GameObjects.GameObject[];
}

function buildOrderBookWallOverlayActions(
  state: IntradayState,
  levels: readonly OrderBookLevel[]
): readonly OrderBookOverlayWallAction[] {
  return levels
    .filter((level) => level.offsetPercent !== 0)
    .map((level) =>
      buildOrderBookWallOverlayAction(
        state,
        level.offsetPercent > 0 ? "sell" : "buy",
        level.offsetPercent,
        level.priceChangePercent
      )
    );
}

function buildOrderBookWallOverlayAction(
  state: IntradayState,
  side: OrderBookWallSide,
  offsetPercent: number,
  priceChangePercent: number
): OrderBookOverlayWallAction {
  const action = getOrderBookWallValue(side);
  const activeEffect = findActiveOrderBookWallAtLevel(state, side, priceChangePercent);
  const cooldownRemainingSec = state.orderBookWallCooldowns[getOrderBookWallLevelKey(side, priceChangePercent)] ?? 0;
  const active = Boolean(activeEffect);

  return {
    side,
    offsetPercent,
    priceChangePercent,
    label: action.displayName,
    statusLabel: getOrderBookWallStatusLabel(state, side, activeEffect, cooldownRemainingSec),
    disabled: !active && !canUseOrderBookWall(state, side, offsetPercent, priceChangePercent),
    active,
    cooldownRemainingSec
  };
}

function getOrderBookWallStatusLabel(
  state: IntradayState,
  side: OrderBookWallSide,
  activeEffect: IntradayState["activeOrderBookWallEffects"][number] | undefined,
  cooldownRemainingSec: number
): string {
  const action = getOrderBookWallValue(side);

  if (activeEffect && activeEffect.remainingSec > 0) {
    return `벽 빼기 +${formatNumber(getOrderBookWallRemainingReservedBudget(activeEffect))}B`;
  }

  if (cooldownRemainingSec > 0) {
    return `대기 ${Math.ceil(cooldownRemainingSec)}s`;
  }

  if (state.isPaused) {
    return "보류";
  }

  if (state.holdingRatio <= 0) {
    return "관망";
  }

  const reserveBudget = getOrderBookWallReserveBudget(state, side);

  if (reserveBudget < action.minReserveBudget) {
    return "예산 부족";
  }

  return `${action.displayName} ${formatNumber(reserveBudget)}B`;
}

function getOrderBookWallDisplayLabel(side: OrderBookWallSide): string {
  return getOrderBookWallValue(side).displayName;
}

function getOrderBookWallResultLabel(reason: OrderBookWallResult["reason"]): string {
  switch (reason) {
    case "applied":
      return "실행";
    case "removed":
      return "환급";
    case "paused":
      return "보류";
    case "cooldown":
      return "대기 중";
    case "insufficient_budget":
      return "예산 부족";
    case "no_position":
      return "관망";
    case "unknown_side":
    case "unknown_level":
      return "알 수 없음";
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
  previousTradeValues: ReadonlyMap<string, number> = new Map(),
  elapsedSec = 0,
  previousTradeValueElapsedSec = 0,
  playerTradeValueImpulse = 0,
  morningNewsItems: readonly MorningNews[] = []
): MarketTerminalModel {
  if (!marketBoardState) {
    return { peerRows: [], sectorRows: [], dashboardRows: [], rankRows: [], ranks: new Map(), tradeValues: new Map() };
  }

  const boardBaseRows = marketBoardState.entries
    .map((entry, index): MarketBoardRankRow =>
      createMarketBoardEntryRow(entry, playerPriceChangePercent, playerVolume, playerQuote, index, previousRanks)
    );
  const visibleAssetRows = new Map(boardBaseRows.filter((row) => row.key.startsWith("asset:")).map((row) => [row.key, row]));
  const assetRankBaseRows = assets.map((asset, index) => {
    const key = `asset:${asset.id}`;
    return (
      visibleAssetRows.get(key) ??
      createFullMarketAssetRow(
        asset,
        marketBoardState.playerAssetId,
        playerPriceChangePercent,
        playerVolume,
        playerQuote,
        index,
        previousRanks,
        morningNewsItems
      )
    );
  });
  const accumulatedRows = accumulateMarketTradeValues(
    uniqueMarketRows([...boardBaseRows, ...assetRankBaseRows]),
    previousTradeValues,
    elapsedSec,
    previousTradeValueElapsedSec,
    `asset:${marketBoardState.playerAssetId}`,
    playerTradeValueImpulse
  );
  const accumulatedByKey = new Map(accumulatedRows.map((row) => [row.key, row]));
  const boardRows = boardBaseRows.map((row) => accumulatedByKey.get(row.key) ?? row);
  const assetRankRows = assetRankBaseRows.map((row) => accumulatedByKey.get(row.key) ?? row);

  const rankedAssetRows = applyMarketRanks(assetRankRows, previousRanks);
  const ranks = new Map(rankedAssetRows.map((row) => [row.key, row.rank]));
  const tradeValues = new Map(accumulatedRows.map((row) => [row.key, row.fictionalTradeValue]));
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
    ranks,
    tradeValues
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
  const activityTradeValue = Math.round(fictionalVolume * quote.currentPrice);
  const baselineMultiplier = getEntryTradeValueMultiplier(priceChangePercent, entry.newsBadge, entry.newsTone);
  const activityWeight = entry.calculationMode === "detailed" ? 0.85 : 0.18;
  const fictionalTradeValue = Math.round(
    entry.baselineTradeValue * baselineMultiplier + activityTradeValue * activityWeight
  );
  const displayVolume = Math.max(1, Math.round(fictionalTradeValue / Math.max(1, quote.currentPrice)));
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
    fictionalVolume: displayVolume,
    fictionalTradeValue,
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

function uniqueMarketRows(rows: readonly MarketBoardRankRow[]): readonly MarketBoardRankRow[] {
  return [...new Map(rows.map((row) => [row.key, row])).values()];
}

function accumulateMarketTradeValues(
  rows: readonly MarketBoardRankRow[],
  previousTradeValues: ReadonlyMap<string, number>,
  elapsedSec: number,
  previousElapsedSec: number,
  playerKey: string,
  playerTradeValueImpulse: number
): readonly MarketBoardRankRow[] {
  const elapsedDeltaSec =
    previousTradeValues.size === 0
      ? Math.max(1, elapsedSec)
      : Math.max(0, elapsedSec - previousElapsedSec);

  return rows.map((row) => {
    const previous = previousTradeValues.get(row.key) ?? 0;
    const increment = calculateMarketTradeValueIncrement(row.fictionalTradeValue, elapsedDeltaSec);
    const impulse = row.key === playerKey ? playerTradeValueImpulse : 0;
    const cumulativeTradeValue = Math.max(previous, previous + increment + impulse);

    return {
      ...row,
      fictionalVolume: Math.max(row.fictionalVolume, Math.round(cumulativeTradeValue / Math.max(1, row.currentPrice))),
      fictionalTradeValue: Math.round(cumulativeTradeValue)
    };
  });
}

function calculateMarketTradeValueIncrement(activityTradeValue: number, elapsedDeltaSec: number): number {
  if (elapsedDeltaSec <= 0) {
    return 0;
  }

  return Math.max(1, (activityTradeValue * elapsedDeltaSec) / runDefaults.intradayDurationSec);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function getAutoCardGrowthLabel(growthType: "effect" | "period"): string {
  return growthType === "period" ? "강화: 발동 주기 단축" : "강화: 효과량 증가";
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

function calculateAverageEntryPriceChangePercent(state: IntradayState): number | null {
  if (state.heldUnits <= 0 || state.openingPrice <= 0) {
    return null;
  }

  return ((state.averageEntryPrice - state.openingPrice) / state.openingPrice) * 100;
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
  playerVolume: number,
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
  const baselineTradeValue = getAssetBaselineTradeValue(asset);
  const newsBadge = getAssetNewsBadge(asset, morningNewsItems);
  const newsTone = getAssetNewsTone(asset, morningNewsItems);
  const movementMultiplier = 1 + Math.min(0.5, Math.abs(priceChangePercent) * 0.028);
  const newsMultiplier = getAssetNewsTradeValueMultiplier(asset, newsBadge, newsTone);
  const playerActionTradeValue = asset.id === playerAssetId ? Math.max(0, playerVolume * quote.currentPrice * 0.85) : 0;
  const fictionalTradeValue = Math.round(baselineTradeValue * movementMultiplier * newsMultiplier + playerActionTradeValue);
  const fictionalVolume = Math.max(1, Math.round(fictionalTradeValue / Math.max(1, quote.currentPrice)));

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
    fictionalTradeValue,
    trend: getTrendLabel(priceChangePercent),
    newsBadge: newsBadge ?? "-",
    newsTone
  };
}

function getEntryTradeValueMultiplier(
  priceChangePercent: number,
  newsBadge: string | null,
  newsTone: "positive" | "negative" | null
): number {
  const movementMultiplier = 1 + Math.min(0.42, Math.abs(priceChangePercent) * 0.024);
  const newsMultiplier =
    newsBadge === "asset"
      ? newsTone === "positive"
        ? 1.34
        : 1.24
      : newsBadge === "sector"
        ? newsTone === "positive"
          ? 1.24
          : 1.16
        : newsBadge === "market"
          ? 1.1
          : 1;

  return movementMultiplier * newsMultiplier;
}

function getAssetNewsTradeValueMultiplier(
  asset: AssetDefinition,
  newsBadge: string | null,
  newsTone: "positive" | "negative" | null
): number {
  if (!newsBadge) {
    return 1;
  }

  const sensitivity = getAssetNewsSensitivity(asset);
  const base = newsBadge === "asset" ? 0.36 : 0.24;
  const toneFactor = newsTone === "positive" ? 1 : 0.82;

  return 1 + base * sensitivity * toneFactor;
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
const manualActionGaugeWidth = 156;

function getChoiceTone(choiceType: string): string {
  if (choiceType === "stable") {
    return "안정";
  }

  if (choiceType === "aggressive") {
    return "공격";
  }

  return "관망";
}

function getChoiceToneDescription(choiceType: string): string {
  if (choiceType === "stable") {
    return "감시/변동성 리스크를 낮추는 대신 추진력을 일부 포기합니다.";
  }

  if (choiceType === "aggressive") {
    return "단기 성과를 노리는 대신 감시/변동성 부담을 키웁니다.";
  }

  return "즉시 비용은 낮지만 후속 리스크가 남을 수 있습니다.";
}

function getDocumentChoiceSecondaryLabel(choice: DocumentEventChoiceValue): string {
  const budgetText =
    choice.effect.budgetDelta === 0 ? null : `예산 ${formatSignedBudget(choice.effect.budgetDelta)}`;

  return [getChoiceToneDescription(choice.type), budgetText].filter(Boolean).join(" · ");
}

function getManualActionFeedbackColor(actionId: ManualActionId): string {
  return `#${getManualActionFeedbackColorNumber(actionId).toString(16).padStart(6, "0")}`;
}

function getManualActionFeedbackColorNumber(actionId: ManualActionId): number {
  switch (actionId) {
    case "liquidity_supply":
      return 0x9ecf83;
    case "price_push":
      return 0xd9c58b;
    case "overheat_cooldown":
      return 0x7fb4c8;
    case "position_settlement":
      return 0xd08b72;
  }
}

function getManualActionButtonLabel(
  actionId: ManualActionId,
  fallbackDisplayName: string,
  state: IntradayState | null
): string {
  const displayName = getManualActionDisplayLabel(actionId, state);
  const budgetDelta = state ? getManualActionBudgetDelta(state, actionId) : 0;
  return `${displayName}\n${formatManualActionBudgetDelta(budgetDelta, actionId, fallbackDisplayName)}`;
}

function getManualActionDisplayLabel(actionId: ManualActionId, state: IntradayState | null): string {
  if (actionId !== "position_settlement") {
    const action = manualActions.find((candidate) => candidate.id === actionId);
    return action?.displayName ?? actionId;
  }

  if (!state || state.averageEntryPrice <= 0) {
    return "포지션 정리";
  }

  return state.currentPrice >= state.averageEntryPrice ? "수익실현" : "손실차단";
}

function formatManualActionBudgetDelta(delta: number, actionId: ManualActionId, fallbackDisplayName: string): string {
  if (delta < 0) {
    if (actionId === "price_push") {
      return `${formatBudget(Math.abs(delta))}+ 매수`;
    }

    if (actionId === "overheat_cooldown") {
      return `${formatBudget(Math.abs(delta))} 압박`;
    }

    return `${formatBudget(Math.abs(delta))} 비용`;
  }

  if (delta > 0) {
    return actionId === "position_settlement" ? `${formatBudget(delta)} 정리` : `${formatBudget(delta)} 회수`;
  }

  if (fallbackDisplayName === "매도봇" || fallbackDisplayName === "포지션 정리") {
    return "보유 없음";
  }

  return "자금 변동 없음";
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

interface ParticipantMoodEstimate {
  readonly averageEntryPrice: number;
  readonly profitLossPercent: number;
}

function estimateParticipantMood(
  state: IntradayState,
  history: readonly PriceHistoryPoint[]
): ParticipantMoodEstimate {
  const usableHistory =
    history.length > 0
      ? history
      : [
          {
            elapsedSec: 0,
            priceChangePercent: state.priceChangePercent,
            fictionalVolume: 1
          }
        ];
  const latestElapsedSec = usableHistory[usableHistory.length - 1]?.elapsedSec ?? 0;
  const lookbackSec = 60;
  const pointsInLookback = usableHistory.filter((point) => latestElapsedSec - point.elapsedSec <= lookbackSec);
  const averageVolume =
    pointsInLookback.length > 0
      ? Math.max(
          1,
          pointsInLookback.reduce((total, point) => total + Math.max(1, point.fictionalVolume), 0) /
            pointsInLookback.length
        )
      : 1;
  let weightedPriceTotal = 0;
  let weightTotal = 0;

  // Fictional VWAP-style estimate: volume spikes pull the participant average entry more strongly.
  for (const point of pointsInLookback) {
    const ageSec = Math.max(0, latestElapsedSec - point.elapsedSec);
    const pointVolume = Math.max(1, point.fictionalVolume);
    const volumeRatio = pointVolume / averageVolume;
    const volumeSpikeBoost = 1 + Math.min(4, Math.max(0, volumeRatio - 1)) * (0.45 + state.personalParticipation / 180);
    const recencyPosition = (lookbackSec - ageSec) / lookbackSec;
    const price = state.openingPrice * (1 + point.priceChangePercent / 100);
    const recency = 0.75 + recencyPosition * (0.65 + state.personalParticipation / 80);
    const weight = Math.pow(pointVolume, 1.04) * volumeSpikeBoost * recency;
    weightedPriceTotal += price * weight;
    weightTotal += weight;
  }

  const averageEntryPrice = weightTotal > 0 ? weightedPriceTotal / weightTotal : state.currentPrice;
  const profitLossPercent =
    averageEntryPrice > 0 ? ((state.currentPrice - averageEntryPrice) / averageEntryPrice) * 100 : 0;

  return {
    averageEntryPrice: roundToTick(averageEntryPrice, 10),
    profitLossPercent: Math.round(profitLossPercent * 10) / 10
  };
}

function getParticipantMoodTextColor(profitLossPercent: number, model: RetailSwarmModel): string {
  if (profitLossPercent > 0.15) {
    return "#00c087";
  }

  if (profitLossPercent < -0.15) {
    return "#f6465d";
  }

  return model.panicVisual ? "#f0a6a0" : "#d9c58b";
}

type PepeSwarmMood = "sleeping" | "curious" | "euphoric";

const pepeMascotTextureKey = "meme-frog-moods";
const pepeMascotFrameCount = 4;

function getPepeSwarmMood(model: RetailSwarmModel): PepeSwarmMood {
  if (model.participationNumber < 25) {
    return "sleeping";
  }

  if (model.participationNumber < 61) {
    return "curious";
  }

  return "euphoric";
}

function getPepeSwarmLabel(mood: PepeSwarmMood): string {
  if (mood === "sleeping") {
    return "수면";
  }

  if (mood === "curious") {
    return "호기심";
  }

  return "열광";
}

function getPepeMascotFrameIndex(mood: PepeSwarmMood, participantProfitLossPercent: number): number {
  if (participantProfitLossPercent > 0.15) {
    return 2;
  }

  if (participantProfitLossPercent < -0.15) {
    return 3;
  }

  if (mood === "sleeping") {
    return 0;
  }

  if (mood === "curious") {
    return 1;
  }

  return 2;
}
