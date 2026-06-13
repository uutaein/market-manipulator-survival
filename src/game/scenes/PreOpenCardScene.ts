import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import type { DayState } from "../../domain/day/daySetup";
import {
  earlyPositioningBudgetPercentMax,
  earlyPositioningBudgetPercentMin,
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
    const dayState = gameSession.ensureDay();
    const selectedCardId = dayState.preOpenCardId;
    this.earlyPositioningBudgetPercent =
      dayState.preOpenCardEffect?.earlyPositioningBudgetPercent ?? this.earlyPositioningBudgetPercent;

    this.drawDocumentShell(
      "개장 전 카드 선택",
      [
        `DAY ${dayState.dayIndex}`,
        `선택: ${formatSelectedCard(dayState)}`,
        "",
        "아침 뉴스 공개 전 최대 1장을 선택한다."
      ]
    );

    preOpenCards.forEach((card, index) => {
      const y = 190 + index * 86;
      const selected = selectedCardId === card.id;

      if (card.id === "early_positioning") {
        this.drawEarlyPositioningControl(dayState, y, selected);
      } else if (card.id === "news_assignment") {
        this.addDocumentButton(
          96,
          y,
          `뉴스 배정: 호재\n내 종목 호재를 배정한다.`,
          () => {
            if (!gameSession.dayState?.preOpenCardId) {
              gameSession.selectPreOpenCard("뉴스 배정: 호재");
            }
            this.scene.restart();
          },
          selected && dayState.preOpenCardEffect?.newsAssignmentDirection === "positive"
        );
        this.addDocumentButton(
          350,
          y,
          `뉴스 배정: 악재\n내 종목 악재를 배정한다.`,
          () => {
            if (!gameSession.dayState?.preOpenCardId) {
              gameSession.selectPreOpenCard("뉴스 배정: 악재");
            }
            this.scene.restart();
          },
          selected && dayState.preOpenCardEffect?.newsAssignmentDirection === "negative"
        );
      } else {
        this.addDocumentButton(
          96,
          y,
          `${card.displayName}\n${card.role}`,
          () => {
            if (!gameSession.dayState?.preOpenCardId) {
              gameSession.selectPreOpenCard(card.id);
            }
            this.scene.restart();
          },
          selected
        );
      }

      if (card.id !== "early_positioning") {
        this.add
          .text(
            620,
            y,
            [
              `Budget ${formatDelta(card.budgetDelta)}`,
              `Holding ${formatDelta(card.holdingRatioDelta)}`,
              `Pressure ${formatDelta(card.marketPressureDelta)}`,
              `Surveillance ${formatDelta(card.surveillanceDelta)}`,
              `Volatility ${formatDelta(card.volatilityDelta)}`
            ].join("  "),
            {
              color: selected ? "#f3e8ca" : "#8f9f7a",
              fontFamily: this.fontFamily,
              fontSize: "15px",
              wordWrap: { width: 520 }
            }
          )
          .setOrigin(0, 0);
      }
    });

    this.addActionButton({
      label: selectedCardId ? "아침 뉴스 확인" : "관망 후 뉴스 확인",
      target: SceneKeys.MorningBriefing,
      onClick: () => {
        if (!gameSession.dayState?.preOpenCardId) {
          gameSession.selectPreOpenCard("관망");
        }
      }
    });
  }

  private drawEarlyPositioningControl(dayState: DayState, y: number, selected: boolean): void {
    const currentBudget = dayState.startingBudgetForDay;
    const trackX = 96;
    const trackY = y + 50;
    const trackWidth = 330;
    const percentToX = (percent: number) =>
      trackX +
      ((percent - earlyPositioningBudgetPercentMin) /
        (earlyPositioningBudgetPercentMax - earlyPositioningBudgetPercentMin)) *
        trackWidth;
    const effect = previewEarlyPositioningEffect(currentBudget, this.earlyPositioningBudgetPercent);

    this.add
      .text(96, y, `사전 포지션 확보\n현재 예산 투입 비율을 조절한다.`, {
        color: selected ? "#111417" : "#f3e8ca",
        backgroundColor: selected ? "#d9c58b" : "#2a3033",
        fontFamily: this.fontFamily,
        fontSize: "17px",
        padding: { x: 12, y: 8 }
      })
      .setOrigin(0, 0);

    const track = this.add.rectangle(trackX, trackY, trackWidth, 8, 0x2a3033, 1).setOrigin(0, 0.5);
    const fill = this.add
      .rectangle(trackX, trackY, percentToX(effect.earlyPositioningBudgetPercent) - trackX, 8, 0xd9c58b, 0.95)
      .setOrigin(0, 0.5);
    const knob = this.add.circle(percentToX(effect.earlyPositioningBudgetPercent), trackY, 11, 0xf3e8ca, 1);
    const previewText = this.add
      .text(448, y + 2, formatEarlyPositioningPreview(effect), {
        color: selected ? "#f3e8ca" : "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 420 }
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
      previewText.setText(formatEarlyPositioningPreview(nextEffect));
    };

    if (!selected) {
      track.setInteractive({ useHandCursor: true });
      knob.setInteractive({ useHandCursor: true });
      this.input.setDraggable(knob);
      track.on("pointerdown", (pointer: Phaser.Input.Pointer) => updatePercent(pointer.x));
      knob.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) => updatePercent(dragX));
    }

    this.addDocumentButton(
      880,
      y + 31,
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
}

function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
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

function formatEarlyPositioningPreview(effect: ReturnType<typeof previewEarlyPositioningEffect>): string {
  return [
    `투입 ${effect.earlyPositioningBudgetPercent}% / ${formatBudget(Math.abs(effect.budgetDelta))}`,
    `보유 ${formatDelta(effect.holdingRatioDelta)} / 압력 ${formatDelta(effect.marketPressureDelta)}`,
    `감시 ${formatDelta(effect.surveillanceDelta)} / 변동성 ${formatDelta(effect.volatilityDelta)}`
  ].join("\n");
}

function formatBudget(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}B`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
