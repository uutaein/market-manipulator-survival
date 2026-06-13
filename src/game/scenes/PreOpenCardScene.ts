import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { preOpenCards } from "../../domain/preopen/preOpenCards";
import { gameSession } from "../GameSession";

export class PreOpenCardScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.PreOpenCard);
  }

  create(): void {
    const dayState = gameSession.ensureDay();
    const selectedCardId = dayState.preOpenCardId;

    this.drawDocumentShell(
      "개장 전 카드 선택",
      [
        `DAY ${dayState.dayIndex}`,
        `선택: ${selectedCardId ? preOpenCards.find((card) => card.id === selectedCardId)?.displayName : "미선택"}`,
        "",
        "개장 승인 전 최대 1장을 선택한다."
      ]
    );

    preOpenCards.forEach((card, index) => {
      const y = 190 + index * 86;
      const selected = selectedCardId === card.id;
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
    });

    this.addActionButton({
      label: selectedCardId ? "개장 승인" : "관망 승인",
      target: SceneKeys.Intraday,
      onClick: () => {
        gameSession.startIntraday();
      }
    });
  }
}

function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
