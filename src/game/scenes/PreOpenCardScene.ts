import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { getAssetInfluenceResistanceById } from "../../domain/assets/assetMarketProfiles";
import type { DayState } from "../../domain/day/daySetup";
import {
  earlyPositioningBudgetPercentMax,
  earlyPositioningHighRiskThresholdPercent,
  getEarlyPositioningBudgetPercentMin,
  getAvailablePreOpenCards,
  normalizeEarlyPositioningBudgetPercent,
  preOpenCards,
  previewEarlyPositioningEffect,
} from "../../domain/preopen/preOpenCards";
import { getEarlyPositioningEntryPremiumPercent } from "../../domain/intraday/intradayState";
import { gameSession } from "../GameSession";

export class PreOpenCardScene extends BaseDocumentScene {
  private earlyPositioningBudgetPercent = 20;

  constructor() {
    super(SceneKeys.PreOpenCard);
  }

  create(): void {
    const runState = gameSession.ensureRun();
    const dayState = gameSession.ensureDay();
    const selectedCardId = dayState.preOpenCardId;
    const availableCards = getAvailablePreOpenCards(runState);
    const earlyPositioningMinimumPercent =
      getEarlyPositioningBudgetPercentMin(runState);
    const assetInfluenceResistance = getAssetInfluenceResistanceById(
      runState.selectedAssetId,
    );
    this.earlyPositioningBudgetPercent =
      dayState.preOpenCardEffect?.earlyPositioningBudgetPercent ??
      earlyPositioningMinimumPercent;

    this.drawDocumentShell("개장 전 카드 선택", []);

    this.drawPreOpenHeader(dayState, availableCards);
    this.drawBudgetSummary(dayState, availableCards);
    this.drawLockedFutureChoices(availableCards);

    availableCards.forEach((card) => {
      const y = getCardY(card.id);
      const selected = selectedCardId === card.id;

      if (card.id === "early_positioning") {
        this.drawEarlyPositioningControl(
          dayState,
          y,
          selected,
          getEarlyPositioningEntryPremiumPercent(runState),
          earlyPositioningMinimumPercent,
          assetInfluenceResistance,
        );
      } else if (card.id === "news_assignment") {
        this.addChoiceCard(
          96,
          y,
          270,
          74,
          "뉴스 배정: 호재",
          "내 종목 호재를 배정한다.",
          () => {
            if (!gameSession.dayState?.preOpenCardId) {
              gameSession.selectPreOpenCard("뉴스 배정: 호재");
            }
            this.scene.restart();
          },
          selected &&
            dayState.preOpenCardEffect?.newsAssignmentDirection === "positive",
        );
        this.addChoiceCard(
          386,
          y,
          270,
          74,
          "뉴스 배정: 악재",
          "내 종목 악재를 배정한다.",
          () => {
            if (!gameSession.dayState?.preOpenCardId) {
              gameSession.selectPreOpenCard("뉴스 배정: 악재");
            }
            this.scene.restart();
          },
          selected &&
            dayState.preOpenCardEffect?.newsAssignmentDirection === "negative",
        );
        this.drawBudgetPreviewText(
          706,
          y + 11,
          dayState.startingBudgetForDay,
          card.budgetDelta,
          selected,
        );
      } else {
        this.addChoiceCard(
          96,
          y,
          560,
          card.id === "wait_and_see" ? 66 : 74,
          card.displayName,
          card.role,
          () => {
            if (!gameSession.dayState?.preOpenCardId) {
              gameSession.selectPreOpenCard(card.id);
            }
            this.scene.restart();
          },
          selected,
        );
        this.drawBudgetPreviewText(
          706,
          y + 11,
          dayState.startingBudgetForDay,
          card.budgetDelta,
          selected,
        );
      }
    });

    if (selectedCardId || availableCards.length > 1) {
      this.drawNextStepHint(
        selectedCardId
          ? "선택 완료 · Morning News 확인 가능"
          : "관망을 선택하면 예산을 보전하고 뉴스를 확인합니다.",
        360,
        496,
      );
      this.addActionButton({
        label: selectedCardId ? "아침 뉴스 확인" : "관망 후 뉴스 확인",
        target: SceneKeys.MorningBriefing,
        onClick: () => {
          if (!gameSession.dayState?.preOpenCardId) {
            gameSession.selectPreOpenCard("관망");
          }
        },
      });
    } else {
      this.drawNextStepHint(
        "선취매를 먼저 선택해야 Morning News 잠금이 해제됩니다.",
        96,
        760,
      );
    }
  }

  private drawPreOpenHeader(
    dayState: DayState,
    availableCards: readonly { id: string }[],
  ): void {
    const earlyPositioningOnly = availableCards.length === 1;

    this.add
      .rectangle(96, 124, 640, 56, 0x090d10, 0.88)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(118, 136, `DAY ${dayState.dayIndex} · PRE-OPEN DECISION`, {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(118, 156, `선택: ${formatSelectedCard(dayState)}`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "18px",
      })
      .setOrigin(0, 0);
    this.add
      .rectangle(
        510,
        138,
        186,
        28,
        dayState.preOpenCardId ? 0x273e2f : 0x3a2f1e,
        0.96,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, dayState.preOpenCardId ? 0x8f9f7a : 0xd9c58b);
    this.add
      .text(526, 145, dayState.preOpenCardId ? "NEWS READY" : "NEWS LOCKED", {
        color: dayState.preOpenCardId ? "#8f9f7a" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);
    if (earlyPositioningOnly) {
      this.add
        .rectangle(96, 184, 760, 26, 0x10181d, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x263038);
      this.add
        .text(116, 189, "첫 포지션 확보를 위해 선취매만 활성화됩니다.", {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "14px",
        })
        .setOrigin(0, 0);
    } else {
      this.add
        .rectangle(96, 184, 760, 26, 0x10181d, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x263038);
      this.add
        .text(
          116,
          190,
          `보유 포지션 유지 중 · ${availableCards.length}개 선택지 비교 가능 · 최대 1장 선택`,
          {
            color: "#8f9f7a",
            fontFamily: this.fontFamily,
            fontSize: "13px",
          },
        )
        .setOrigin(0, 0);
    }
  }

  private drawBudgetSummary(
    dayState: DayState,
    availableCards: readonly { budgetDelta: number; displayName: string }[],
  ): void {
    const budgetDelta = dayState.preOpenCardEffect?.budgetDelta ?? 0;
    const selected = Boolean(dayState.preOpenCardId);
    const currentBudget = dayState.startingBudgetForDay;
    const remainingBudget = currentBudget + Math.min(0, budgetDelta);
    const spent = Math.max(0, -budgetDelta);
    const comparisonOpen = availableCards.length > 1 && !selected;
    const earlyPositioningOnly = availableCards.length === 1;
    const panelHeight = comparisonOpen ? 86 : 56;
    const summaryLines = comparisonOpen
      ? [
          `현재 예산 ${formatBudget(currentBudget)} · 선택 후 잔여 ${formatBudget(remainingBudget)}`,
          "카드 최대 1장 · 관망 비용 0B",
          `비용형 카드: ${formatBudgetCostLine(availableCards)}`,
        ]
      : [
          `현재 예산 ${formatBudget(currentBudget)} · 선택 후 잔여 ${formatBudget(remainingBudget)}`,
          selected
            ? `예산 소모율 ${formatBudgetSpendRate(currentBudget, spent)}`
            : earlyPositioningOnly
              ? "첫/무보유: 선취매만 가능"
              : "예산 소모율은 카드별로 표시",
        ];

    this.add
      .rectangle(772, 124, 378, panelHeight, 0x090d10, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(792, 136, summaryLines.join("\n"), {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: comparisonOpen ? "14px" : "15px",
        lineSpacing: comparisonOpen ? 5 : 7,
        wordWrap: { width: 336 },
      })
      .setOrigin(0, 0);
  }

  private drawLockedFutureChoices(
    availableCards: readonly { id: string }[],
  ): void {
    const availableCardIds = new Set(availableCards.map((card) => card.id));
    const lockedCards = preOpenCards.filter(
      (card) => !availableCardIds.has(card.id),
    );

    if (lockedCards.length === 0) {
      return;
    }

    this.add
      .rectangle(884, 366, 266, 188, 0x090d10, 0.78)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(904, 386, "LOCKED FUTURE CHOICES", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);

    lockedCards.forEach((card, index) => {
      const y = 416 + index * 40;
      this.add
        .rectangle(904, y, 220, 28, 0x151b1f, 0.84)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x263038);
      this.add
        .text(916, y + 7, `${card.displayName} · 잠김`, {
          color: "#8fa2a6",
          fontFamily: this.fontFamily,
          fontSize: "13px",
        })
        .setOrigin(0, 0);
    });
  }

  private drawNextStepHint(message: string, x: number, width: number): void {
    this.add
      .rectangle(x, this.scale.height - 132, width, 48, 0x090d10, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(x + 22, this.scale.height - 118, message, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "16px",
        wordWrap: { width: width - 44 },
      })
      .setOrigin(0, 0);
  }

  private drawEarlyPositioningControl(
    dayState: DayState,
    y: number,
    selected: boolean,
    entryPremiumPercent: number,
    minimumPercent: number,
    assetInfluenceResistance: number,
  ): void {
    const currentBudget = dayState.startingBudgetForDay;
    const panelX = 96;
    const panelWidth = 760;
    const panelHeight = 136;
    const trackX = panelX + 24;
    const trackY = y + 119;
    const trackWidth = 340;
    const percentToX = (percent: number) =>
      trackX +
      ((percent - minimumPercent) /
        (earlyPositioningBudgetPercentMax - minimumPercent)) *
        trackWidth;
    const effect = previewEarlyPositioningEffect(
      currentBudget,
      this.earlyPositioningBudgetPercent,
      minimumPercent,
      assetInfluenceResistance,
    );

    const panel = this.add
      .rectangle(
        panelX,
        y,
        panelWidth,
        panelHeight,
        selected ? 0x273e2f : 0x151b1f,
        1,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    this.add
      .text(panelX + 22, y + 14, "선취매", {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "22px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        panelX + 22,
        y + 48,
        "개장 전 미리 확보한다. 장가격보다 비싸게 사서 시작 손실이 날 수 있다.",
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "13px",
          lineSpacing: 2,
          wordWrap: { width: 390 },
        },
      )
      .setOrigin(0, 0);

    const track = this.add
      .rectangle(trackX, trackY, trackWidth, 8, 0x2a3033, 1)
      .setOrigin(0, 0.5);
    const highRiskX = percentToX(earlyPositioningHighRiskThresholdPercent);
    this.add
      .rectangle(
        highRiskX,
        trackY,
        trackX + trackWidth - highRiskX,
        8,
        0x6b3f24,
        0.96,
      )
      .setOrigin(0, 0.5);
    this.add
      .rectangle(highRiskX, trackY - 12, 2, 24, 0xffb86c, 0.95)
      .setOrigin(0, 0);
    this.add
      .text(
        highRiskX + 8,
        trackY - 32,
        `${formatPercent(earlyPositioningHighRiskThresholdPercent)} 초과 과집중`,
        {
          color: "#ffb86c",
          fontFamily: this.fontFamily,
          fontSize: "11px",
        },
      )
      .setOrigin(0, 0);
    const fill = this.add
      .rectangle(
        trackX,
        trackY,
        percentToX(effect.earlyPositioningBudgetPercent) - trackX,
        8,
        0xd9c58b,
        0.95,
      )
      .setOrigin(0, 0.5);
    const knob = this.add.circle(
      percentToX(effect.earlyPositioningBudgetPercent),
      trackY,
      11,
      0xf3e8ca,
      1,
    );
    const previewText = this.add
      .text(
        panelX + 420,
        y + 18,
        formatEarlyPositioningPreview(
          effect,
          currentBudget,
          entryPremiumPercent,
        ),
        {
          color: selected ? "#f3e8ca" : getEarlyPositioningPreviewColor(effect),
          fontFamily: this.fontFamily,
          fontSize: "15px",
          lineSpacing: 6,
          wordWrap: { width: 312 },
        },
      )
      .setOrigin(0, 0);
    const updateImpactPanel = this.drawEarlyPositioningImpactPanel(
      884,
      y,
      266,
      panelHeight,
      effect,
      currentBudget,
      entryPremiumPercent,
      selected,
      () => {
        if (!gameSession.dayState?.preOpenCardId) {
          gameSession.selectPreOpenCard("선취매", {
            earlyPositioningBudgetPercent: this.earlyPositioningBudgetPercent,
          });
        }
        this.scene.restart();
      },
    );

    const updatePercent = (x: number) => {
      if (selected) {
        return;
      }

      const ratio =
        (Math.max(trackX, Math.min(trackX + trackWidth, x)) - trackX) /
        trackWidth;
      this.earlyPositioningBudgetPercent =
        normalizeEarlyPositioningBudgetPercent(
          minimumPercent +
            ratio * (earlyPositioningBudgetPercentMax - minimumPercent),
          minimumPercent,
        );
      const nextEffect = previewEarlyPositioningEffect(
        currentBudget,
        this.earlyPositioningBudgetPercent,
        minimumPercent,
        assetInfluenceResistance,
      );
      const knobX = percentToX(nextEffect.earlyPositioningBudgetPercent);
      knob.setPosition(knobX, trackY);
      fill.width = knobX - trackX;
      previewText.setText(
        formatEarlyPositioningPreview(
          nextEffect,
          currentBudget,
          entryPremiumPercent,
        ),
      );
      previewText.setColor(getEarlyPositioningPreviewColor(nextEffect));
      updateImpactPanel(nextEffect);
    };

    if (!selected) {
      panel.setInteractive({ useHandCursor: true });
      track.setInteractive({ useHandCursor: true });
      knob.setInteractive({ useHandCursor: true });
      this.input.setDraggable(knob);
      panel.on("pointerup", () => {
        if (!gameSession.dayState?.preOpenCardId) {
          gameSession.selectPreOpenCard("선취매", {
            earlyPositioningBudgetPercent: this.earlyPositioningBudgetPercent,
          });
        }
        this.scene.restart();
      });
      track.on("pointerdown", (pointer: Phaser.Input.Pointer) =>
        updatePercent(pointer.x),
      );
      knob.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) =>
        updatePercent(dragX),
      );
    }
  }

  private drawEarlyPositioningImpactPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    effect: ReturnType<typeof previewEarlyPositioningEffect>,
    currentBudget: number,
    entryPremiumPercent: number,
    selected: boolean,
    onConfirm: () => void,
  ): (nextEffect: ReturnType<typeof previewEarlyPositioningEffect>) => void {
    this.add
      .rectangle(x, y, width, height, selected ? 0x273e2f : 0x090d10, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    this.add
      .text(x + 18, y + 14, "DECISION IMPACT", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        x + width - 18,
        y + 14,
        `원가 +${formatPercent(entryPremiumPercent)}`,
        {
          color: selected ? "#f3e8ca" : "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "12px",
        },
      )
      .setOrigin(1, 0);

    const percentRow = this.createImpactMeterRow(
      x + 18,
      y + 38,
      width - 36,
      "투입",
      0xd9c58b,
    );
    const budgetRow = this.createImpactMeterRow(
      x + 18,
      y + 58,
      width - 36,
      "잔여",
      0x8f9f7a,
    );
    const riskRow = this.createImpactMeterRow(
      x + 18,
      y + 78,
      width - 36,
      "위험",
      effect.riskBand === "concentrated" ? 0xffb86c : 0x8f9f7a,
    );

    const applyEffect = (
      nextEffect: ReturnType<typeof previewEarlyPositioningEffect>,
    ) => {
      const budgetSpend = Math.abs(nextEffect.budgetDelta);
      const remainingBudget = Math.max(0, currentBudget - budgetSpend);
      const remainingRate =
        currentBudget > 0 ? (remainingBudget / currentBudget) * 100 : 0;
      const riskPercent = getEarlyPositioningImpactRiskPercent(nextEffect);
      const riskColor =
        nextEffect.riskBand === "concentrated" ? 0xffb86c : 0x8f9f7a;

      updateImpactMeterRow(
        percentRow,
        nextEffect.earlyPositioningBudgetPercent,
        `${formatPercent(nextEffect.earlyPositioningBudgetPercent)}`,
      );
      updateImpactMeterRow(
        budgetRow,
        remainingRate,
        formatBudget(remainingBudget),
      );
      updateImpactMeterRow(
        riskRow,
        riskPercent,
        nextEffect.riskBand === "concentrated" ? "과집중" : "일반",
        riskColor,
      );
    };

    applyEffect(effect);
    this.addDocumentButton(
      x + 18,
      y + height - 38,
      selected ? "선택됨" : "선취매 실행",
      onConfirm,
      selected,
    );

    return applyEffect;
  }

  private createImpactMeterRow(
    x: number,
    y: number,
    width: number,
    label: string,
    color: number,
  ): ImpactMeterRow {
    const labelText = this.add
      .text(x, y, label, {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "11px",
      })
      .setOrigin(0, 0.5);
    const valueText = this.add
      .text(x + width, y, "", {
        color: `#${color.toString(16).padStart(6, "0")}`,
        fontFamily: this.fontFamily,
        fontSize: "11px",
      })
      .setOrigin(1, 0.5);
    const track = this.add
      .rectangle(x + 54, y + 10, width - 54, 5, 0x151b1f, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x263038, 0.8);
    const fill = this.add
      .rectangle(x + 54, y + 10, 0, 5, color, 0.95)
      .setOrigin(0, 0.5);

    return { fill, labelText, track, trackWidth: width - 54, valueText };
  }

  private addChoiceCard(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    body: string,
    onClick: () => void,
    selected = false,
  ): void {
    const background = this.add
      .rectangle(x, y, width, height, selected ? 0x273e2f : 0x151b1f, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    const titleText = this.add
      .text(x + 18, y + 12, title, {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "19px",
      })
      .setOrigin(0, 0);
    const bodyText = this.add
      .text(x + 18, y + 42, body, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        wordWrap: { width: width - 36 },
      })
      .setOrigin(0, 0);

    [background, titleText, bodyText].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", onClick);
    });
  }

  private drawBudgetPreviewText(
    x: number,
    y: number,
    currentBudget: number,
    budgetDelta: number,
    selected: boolean,
  ): void {
    this.add
      .text(x, y, formatCardBudgetPreview(currentBudget, budgetDelta), {
        color: selected ? "#f3e8ca" : "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        lineSpacing: 6,
        wordWrap: { width: 440 },
      })
      .setOrigin(0, 0);
  }
}

type ImpactMeterRow = {
  readonly fill: Phaser.GameObjects.Rectangle;
  readonly labelText: Phaser.GameObjects.Text;
  readonly track: Phaser.GameObjects.Rectangle;
  readonly trackWidth: number;
  readonly valueText: Phaser.GameObjects.Text;
};

function updateImpactMeterRow(
  row: ImpactMeterRow,
  percent: number,
  value: string,
  color?: number,
): void {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  row.fill.width = (row.trackWidth * clampedPercent) / 100;
  row.valueText.setText(value);

  if (color !== undefined) {
    const colorText = `#${color.toString(16).padStart(6, "0")}`;
    row.fill.setFillStyle(color, 0.95);
    row.labelText.setColor(colorText);
    row.track.setStrokeStyle(1, color, 0.55);
    row.valueText.setColor(colorText);
  }
}

function getEarlyPositioningImpactRiskPercent(
  effect: ReturnType<typeof previewEarlyPositioningEffect>,
): number {
  const baseRisk =
    (effect.earlyPositioningBudgetPercent / earlyPositioningBudgetPercentMax) *
    100;

  return effect.riskBand === "concentrated"
    ? Math.max(baseRisk, 74)
    : Math.min(baseRisk, 58);
}

function getCardY(cardId: string): number {
  switch (cardId) {
    case "early_positioning":
      return 212;
    case "news_assignment":
      return 358;
    case "asset_analysis":
      return 452;
    case "wait_and_see":
      return 528;
    default:
      return 190;
  }
}

function formatSelectedCard(dayState: DayState): string {
  if (!dayState.preOpenCardId) {
    return "미선택";
  }

  const card = preOpenCards.find(
    (candidate) => candidate.id === dayState.preOpenCardId,
  );

  if (dayState.preOpenCardId === "news_assignment") {
    return `뉴스 배정: ${dayState.preOpenCardEffect?.newsAssignmentDirection === "negative" ? "악재" : "호재"}`;
  }

  if (dayState.preOpenCardId === "early_positioning") {
    return `선취매 ${dayState.preOpenCardEffect?.earlyPositioningBudgetPercent ?? 20}%`;
  }

  return card?.displayName ?? dayState.preOpenCardId;
}

function formatEarlyPositioningPreview(
  effect: ReturnType<typeof previewEarlyPositioningEffect>,
  currentBudget: number,
  entryPremiumPercent: number,
): string {
  const budgetSpend = Math.abs(effect.budgetDelta);
  const remainingBudget = Math.max(0, currentBudget - budgetSpend);

  return [
    `투입 비율 ${formatPercent(effect.earlyPositioningBudgetPercent)}`,
    formatEarlyPositioningRiskLine(effect),
    `예산 사용 ${formatBudget(budgetSpend)}`,
    `체급 저항 x${formatNumber(effect.assetInfluenceResistance)} · 매입 프리미엄 ${formatPercent(entryPremiumPercent)}`,
    `잔여 예산 ${formatBudget(remainingBudget)} · 예산 소모율 ${formatBudgetSpendRate(currentBudget, budgetSpend)}`,
  ].join("\n");
}

function formatEarlyPositioningRiskLine(
  effect: ReturnType<typeof previewEarlyPositioningEffect>,
): string {
  return effect.riskBand === "concentrated"
    ? "구간 과집중 · 개장 유동성 급감"
    : "구간 일반";
}

function getEarlyPositioningPreviewColor(
  effect: ReturnType<typeof previewEarlyPositioningEffect>,
): string {
  return effect.riskBand === "concentrated" ? "#ffb86c" : "#8f9f7a";
}

function formatCardBudgetPreview(
  currentBudget: number,
  budgetDelta: number,
): string {
  const budgetSpend = Math.max(0, -budgetDelta);
  const remainingBudget = Math.max(0, currentBudget - budgetSpend);

  if (budgetSpend <= 0) {
    return [
      `예산 사용 없음`,
      `잔여 예산 ${formatBudget(currentBudget)} · 예산 소모율 0`,
    ].join("\n");
  }

  return [
    `예산 사용 ${formatBudget(budgetSpend)}`,
    `잔여 예산 ${formatBudget(remainingBudget)} · 예산 소모율 ${formatBudgetSpendRate(currentBudget, budgetSpend)}`,
  ].join("\n");
}

function formatBudgetCostLine(
  cards: readonly { budgetDelta: number; displayName: string }[],
): string {
  const costCards = cards
    .filter((card) => card.budgetDelta < 0)
    .map(
      (card) =>
        `${card.displayName} ${formatBudget(Math.abs(card.budgetDelta))}`,
    );

  return costCards.length > 0 ? costCards.join(" / ") : "없음";
}

function formatBudget(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}B`;
}

function formatPercent(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}%`;
}

function getBudgetSpendRate(
  currentBudget: number,
  budgetSpend: number,
): number {
  if (currentBudget <= 0) {
    return 0;
  }

  return (budgetSpend / currentBudget) * 100;
}

function formatBudgetSpendRate(
  currentBudget: number,
  budgetSpend: number,
): string {
  return `${Math.round(getBudgetSpendRate(currentBudget, budgetSpend))}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
