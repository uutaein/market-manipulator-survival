import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { autoCardRewardElapsedSeconds, autoCardValues } from "../../domain/balancing/autoCardValues";
import { documentEventRules, documentEventValues } from "../../domain/balancing/documentEventValues";
import { runDefaults } from "../../domain/balancing/runDefaults";
import { getAutoCardPeriodSec } from "../../domain/intraday/autoCards";
import { manualActions } from "../../domain/intraday/manualActions";
import { calculateRetailSwarmModel, type RetailSwarmModel } from "../../domain/intraday/retailSwarm";
import type { MarketBoardState } from "../../domain/market/marketBoard";
import { gameSession } from "../GameSession";

export class IntradayScene extends BaseDocumentScene {
  private statsText: Phaser.GameObjects.Text | null = null;
  private actionStatusText: Phaser.GameObjects.Text | null = null;
  private autoCardText: Phaser.GameObjects.Text | null = null;
  private autoChoiceButtons: Phaser.GameObjects.Text[] = [];
  private documentEventObjects: Phaser.GameObjects.GameObject[] = [];
  private retailSwarmObjects: Phaser.GameObjects.GameObject[] = [];

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
        fontSize: "16px",
        lineSpacing: 5,
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

    this.autoCardText = this.add
      .text(610, 410, "", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        lineSpacing: 7,
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
        this.refreshIntradayUi();
      });
    });

    this.addActionButton({ label: "Day 정산", target: SceneKeys.DaySettlement });
    this.refreshIntradayUi();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const nextState = gameSession.runIntradaySecond();
        this.refreshIntradayUi();

        if (nextState.timeRemainingSec <= 0) {
          this.scene.start(SceneKeys.DaySettlement);
        }
      }
    });
  }

  private refreshIntradayUi(): void {
    this.refreshIntradayText();
    this.renderRetailSwarm();
    this.refreshAutoCardText();
    this.renderAutoCardChoices();
    this.renderDocumentEventPopup();
  }

  private refreshIntradayText(): void {
    const state = gameSession.intradayState;

    if (!state) {
      return;
    }

    this.statsText?.setText(
      [
        `TIME ${state.timeRemainingSec}s / PRICE ${formatPercent(state.priceChangePercent)}`,
        `LAST TICK ${formatPercent(state.priceDeltaPerTick)}`,
        "",
        `BUDGET ${formatNumber(state.budget)} / HOLDING ${formatNumber(state.holdingRatio)}%`,
        `PARTICIPATION ${formatNumber(state.personalParticipation)} / LIQUIDITY ${formatNumber(state.marketLiquidity)}`,
        `SURVEILLANCE ${formatNumber(state.surveillance)} / VOLATILITY ${formatNumber(state.volatility)}`,
        `PRESSURE ${formatNumber(state.marketPressure)} / DOCUMENTS ${state.documentEventHistory.length}/${documentEventRules.maxEventsPerDay}`,
        "",
        "COOLDOWNS",
        manualActions
          .slice(0, 2)
          .map((action) => `${action.displayName} ${formatNumber(state.manualActionCooldowns[action.id])}s`)
          .join(" / "),
        manualActions
          .slice(2)
          .map((action) => `${action.displayName} ${formatNumber(state.manualActionCooldowns[action.id])}s`)
          .join(" / ")
      ].join("\n")
    );
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
        "AUTO CARDS",
        ...runState.autoCards.map((card) => {
          const value = autoCardValues[card.cardId];
          return `${value.displayName} Lv.${card.level} / ${formatNumber(getAutoCardPeriodSec(card))}s`;
        }),
        "",
        nextReward ? `NEXT REWARD: ${Math.max(0, nextReward - elapsedSec)}s` : "NEXT REWARD: none",
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
    const panelY = 366;
    const panelWidth = 470;
    const panelHeight = 90;
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
        }
      ).setDepth(31);

      this.documentEventObjects.push(button);
    });
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

function getChoiceTone(choiceType: string): string {
  if (choiceType === "stable") {
    return "안정";
  }

  if (choiceType === "aggressive") {
    return "공격";
  }

  return "관망";
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
