import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import type { DayState } from "../../domain/day/daySetup";
import {
  earlyPositioningBudgetPercentMax,
  earlyPositioningBudgetPercentMin,
  getAvailablePreOpenCards,
  normalizeEarlyPositioningBudgetPercent,
  preOpenCards,
  previewEarlyPositioningEffect
} from "../../domain/preopen/preOpenCards";
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
    this.earlyPositioningBudgetPercent =
      dayState.preOpenCardEffect?.earlyPositioningBudgetPercent ?? this.earlyPositioningBudgetPercent;

    this.drawDocumentShell("개장 전 카드 선택", []);

    this.drawPreOpenHeader(dayState, availableCards.length === 1);
    this.drawBudgetSummary(dayState);

    availableCards.forEach((card) => {
      const y = getCardY(card.id);
      const selected = selectedCardId === card.id;

      if (card.id === "early_positioning") {
        this.drawEarlyPositioningControl(dayState, y, selected);
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
          selected && dayState.preOpenCardEffect?.newsAssignmentDirection === "positive"
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
          selected && dayState.preOpenCardEffect?.newsAssignmentDirection === "negative"
        );
        this.drawBudgetPreviewText(706, y + 11, dayState.startingBudgetForDay, card.budgetDelta, selected);
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
          selected
        );
        this.drawBudgetPreviewText(706, y + 11, dayState.startingBudgetForDay, card.budgetDelta, selected);
      }
    });

    if (selectedCardId || availableCards.length > 1) {
      this.addActionButton({
        label: selectedCardId ? "아침 뉴스 확인" : "관망 후 뉴스 확인",
        target: SceneKeys.MorningBriefing,
        onClick: () => {
          if (!gameSession.dayState?.preOpenCardId) {
            gameSession.selectPreOpenCard("관망");
          }
        }
      });
    } else {
      this.add
        .text(96, this.scale.height - 124, "사전 포지션 확보를 먼저 선택해야 아침 뉴스를 확인할 수 있습니다.", {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "18px"
        })
        .setOrigin(0, 0);
    }
  }

  private drawPreOpenHeader(dayState: DayState, earlyPositioningOnly: boolean): void {
    this.add
      .text(96, 136, `DAY ${dayState.dayIndex} · 선택: ${formatSelectedCard(dayState)}`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "18px"
      })
      .setOrigin(0, 0);
    this.add
      .text(
        96,
        166,
        earlyPositioningOnly
          ? "보유 포지션이 없으면 사전 포지션 확보만 선택할 수 있다."
          : "아침 뉴스 공개 전 최대 1장을 선택한다.",
        {
          color: "#8f9f7a",
          fontFamily: this.fontFamily,
          fontSize: "15px"
        }
      )
      .setOrigin(0, 0);
  }

  private drawBudgetSummary(dayState: DayState): void {
    const budgetDelta = dayState.preOpenCardEffect?.budgetDelta ?? 0;
    const selected = Boolean(dayState.preOpenCardId);
    const currentBudget = dayState.startingBudgetForDay;
    const remainingBudget = currentBudget + Math.min(0, budgetDelta);
    const spent = Math.max(0, -budgetDelta);

    this.add
      .rectangle(772, 104, 378, 58, 0x090d10, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(
        792,
        116,
        [
          `현재 예산 ${formatBudget(currentBudget)} · 선택 후 잔여 ${formatBudget(remainingBudget)}`,
          selected ? `예산 소모율 ${formatBudgetSpendRate(currentBudget, spent)}` : "예산 소모율은 카드별로 표시"
        ].join("\n"),
        {
          color: "#f3e8ca",
          fontFamily: this.fontFamily,
          fontSize: "15px",
          lineSpacing: 7
        }
      )
      .setOrigin(0, 0);
  }

  private drawEarlyPositioningControl(dayState: DayState, y: number, selected: boolean): void {
    const currentBudget = dayState.startingBudgetForDay;
    const panelX = 96;
    const panelWidth = 760;
    const panelHeight = 118;
    const trackX = panelX + 24;
    const trackY = y + 96;
    const trackWidth = 340;
    const percentToX = (percent: number) =>
      trackX +
      ((percent - earlyPositioningBudgetPercentMin) /
        (earlyPositioningBudgetPercentMax - earlyPositioningBudgetPercentMin)) *
        trackWidth;
    const effect = previewEarlyPositioningEffect(currentBudget, this.earlyPositioningBudgetPercent);

    const panel = this.add
      .rectangle(panelX, y, panelWidth, panelHeight, selected ? 0x273e2f : 0x151b1f, selected ? 0.98 : 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    this.add
      .text(panelX + 22, y + 14, "사전 포지션 확보", {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "22px"
      })
      .setOrigin(0, 0);
    this.add
      .text(panelX + 22, y + 50, "현재 예산 투입 비율을 조절한다.", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    const track = this.add.rectangle(trackX, trackY, trackWidth, 8, 0x2a3033, 1).setOrigin(0, 0.5);
    const fill = this.add
      .rectangle(trackX, trackY, percentToX(effect.earlyPositioningBudgetPercent) - trackX, 8, 0xd9c58b, 0.95)
      .setOrigin(0, 0.5);
    const knob = this.add.circle(percentToX(effect.earlyPositioningBudgetPercent), trackY, 11, 0xf3e8ca, 1);
    const previewText = this.add
      .text(panelX + 420, y + 18, formatEarlyPositioningPreview(effect, currentBudget), {
        color: selected ? "#f3e8ca" : "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        lineSpacing: 6,
        wordWrap: { width: 312 }
      })
      .setOrigin(0, 0);

    const updatePercent = (x: number) => {
      if (selected) {
        return;
      }

      const ratio = (Math.max(trackX, Math.min(trackX + trackWidth, x)) - trackX) / trackWidth;
      this.earlyPositioningBudgetPercent = normalizeEarlyPositioningBudgetPercent(
        earlyPositioningBudgetPercentMin +
          ratio * (earlyPositioningBudgetPercentMax - earlyPositioningBudgetPercentMin)
      );
      const nextEffect = previewEarlyPositioningEffect(currentBudget, this.earlyPositioningBudgetPercent);
      const knobX = percentToX(nextEffect.earlyPositioningBudgetPercent);
      knob.setPosition(knobX, trackY);
      fill.width = knobX - trackX;
      previewText.setText(formatEarlyPositioningPreview(nextEffect, currentBudget));
    };

    if (!selected) {
      panel.setInteractive({ useHandCursor: true });
      track.setInteractive({ useHandCursor: true });
      knob.setInteractive({ useHandCursor: true });
      this.input.setDraggable(knob);
      panel.on("pointerup", () => {
        if (!gameSession.dayState?.preOpenCardId) {
          gameSession.selectPreOpenCard("사전 포지션 확보", {
            earlyPositioningBudgetPercent: this.earlyPositioningBudgetPercent
          });
        }
        this.scene.restart();
      });
      track.on("pointerdown", (pointer: Phaser.Input.Pointer) => updatePercent(pointer.x));
      knob.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) => updatePercent(dragX));
    }

    this.addDocumentButton(
      884,
      y + 40,
      selected ? "선택됨" : "확보 실행",
      () => {
        if (!gameSession.dayState?.preOpenCardId) {
          gameSession.selectPreOpenCard("사전 포지션 확보", {
            earlyPositioningBudgetPercent: this.earlyPositioningBudgetPercent
          });
        }
        this.scene.restart();
      },
      selected
    );
  }

  private addChoiceCard(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    body: string,
    onClick: () => void,
    selected = false
  ): void {
    const background = this.add
      .rectangle(x, y, width, height, selected ? 0x273e2f : 0x151b1f, selected ? 0.98 : 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    const titleText = this.add
      .text(x + 18, y + 12, title, {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "19px"
      })
      .setOrigin(0, 0);
    const bodyText = this.add
      .text(x + 18, y + 42, body, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        wordWrap: { width: width - 36 }
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
    selected: boolean
  ): void {
    this.add
      .text(x, y, formatCardBudgetPreview(currentBudget, budgetDelta), {
        color: selected ? "#f3e8ca" : "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        lineSpacing: 6,
        wordWrap: { width: 440 }
      })
      .setOrigin(0, 0);
  }
}

function getCardY(cardId: string): number {
  switch (cardId) {
    case "early_positioning":
      return 190;
    case "news_assignment":
      return 326;
    case "asset_analysis":
      return 426;
    case "wait_and_see":
      return 516;
    default:
      return 190;
  }
}

function formatSelectedCard(dayState: DayState): string {
  if (!dayState.preOpenCardId) {
    return "미선택";
  }

  const card = preOpenCards.find((candidate) => candidate.id === dayState.preOpenCardId);

  if (dayState.preOpenCardId === "news_assignment") {
    return `뉴스 배정: ${dayState.preOpenCardEffect?.newsAssignmentDirection === "negative" ? "악재" : "호재"}`;
  }

  if (dayState.preOpenCardId === "early_positioning") {
    return `사전 포지션 확보 ${dayState.preOpenCardEffect?.earlyPositioningBudgetPercent ?? 20}%`;
  }

  return card?.displayName ?? dayState.preOpenCardId;
}

function formatEarlyPositioningPreview(
  effect: ReturnType<typeof previewEarlyPositioningEffect>,
  currentBudget: number
): string {
  const budgetSpend = Math.abs(effect.budgetDelta);
  const remainingBudget = Math.max(0, currentBudget - budgetSpend);

  return [
    `투입 비율 ${formatPercent(effect.earlyPositioningBudgetPercent)}`,
    `예산 사용 ${formatBudget(budgetSpend)}`,
    `잔여 예산 ${formatBudget(remainingBudget)} · 예산 소모율 ${formatBudgetSpendRate(currentBudget, budgetSpend)}`
  ].join("\n");
}

function formatCardBudgetPreview(currentBudget: number, budgetDelta: number): string {
  const budgetSpend = Math.max(0, -budgetDelta);
  const remainingBudget = Math.max(0, currentBudget - budgetSpend);

  if (budgetSpend <= 0) {
    return [`예산 사용 없음`, `잔여 예산 ${formatBudget(currentBudget)} · 예산 소모율 0`].join("\n");
  }

  return [
    `예산 사용 ${formatBudget(budgetSpend)}`,
    `잔여 예산 ${formatBudget(remainingBudget)} · 예산 소모율 ${formatBudgetSpendRate(currentBudget, budgetSpend)}`
  ].join("\n");
}

function formatBudget(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}B`;
}

function formatPercent(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}%`;
}

function getBudgetSpendRate(currentBudget: number, budgetSpend: number): number {
  if (currentBudget <= 0) {
    return 0;
  }

  return (budgetSpend / currentBudget) * 100;
}

function formatBudgetSpendRate(currentBudget: number, budgetSpend: number): string {
  return `${Math.round(getBudgetSpendRate(currentBudget, budgetSpend))}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
