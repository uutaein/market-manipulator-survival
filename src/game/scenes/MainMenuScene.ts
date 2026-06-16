import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import {
  gameSession,
  type LocalRecordSummary,
  type SavedRunSummary,
} from "../GameSession";

interface ModeCardConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
  readonly buttonLabel: string;
  readonly accent: number;
  readonly onStart: () => void;
}

export class MainMenuScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MainMenu);
  }

  create(): void {
    const savedRunSummary = gameSession.getSavedRunSummary();
    const localRecordSummary = savedRunSummary
      ? null
      : gameSession.getLocalRecordSummary();
    const canContinue = savedRunSummary !== null;
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#111417");
    this.drawMainFrame(width, height, canContinue);

    this.drawModeCard({
      x: 96,
      y: 194,
      width: 500,
      height: 318,
      eyebrow: "FREE MODE",
      title: "자유모드",
      summary: "5-Day Run으로 기본 루프를 익히는 표준 플레이",
      details: [
        "Day 1 -> Day 5",
        "종목 선택 / 사전 문서 / 장중 운용",
        "누적 정산과 같은 조건 재시작",
      ],
      buttonLabel: "자유모드 시작",
      accent: 0xd9c58b,
      onStart: () => {
        gameSession.prepareFreeMode();
        this.scene.start(SceneKeys.RunSetup);
      },
    });

    this.drawModeCard({
      x: 684,
      y: 194,
      width: 500,
      height: 318,
      eyebrow: "CONTRACT MODE",
      title: "의뢰모드",
      summary: "고정 보상 계약을 고르고 목표 조건을 관리하는 짧은 슬라이스",
      details: [
        "계약 비교 / 리스크 확인",
        "목표가·밴드·VALUE 조건",
        "보상에서 비용과 위험을 차감",
      ],
      buttonLabel: "의뢰모드 시작",
      accent: 0x8f9f7a,
      onStart: () => {
        gameSession.prepareContractMode();
        this.scene.start(SceneKeys.ContractSelection);
      },
    });

    if (savedRunSummary) {
      this.drawSavedRunCard(savedRunSummary);
    } else if (localRecordSummary) {
      this.drawLocalRecordCard(localRecordSummary);
    }
  }

  private drawMainFrame(
    width: number,
    height: number,
    canContinue: boolean,
  ): void {
    this.add
      .rectangle(width / 2, height / 2, width - 96, height - 96, 0x1b1f22)
      .setStrokeStyle(2, 0x6f6a5b);

    this.add
      .text(96, 74, "Market Manipulator Survival", {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "32px",
      })
      .setOrigin(0, 0);

    this.add
      .text(98, 126, "FICTIONAL EXCHANGE SURVEILLANCE DESK", {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "16px",
      })
      .setOrigin(0, 0);

    this.add
      .text(1042, 92, canContinue ? "SAVED RUN READY" : "NO SAVED RUN", {
        color: canContinue ? "#111417" : "#d9c58b",
        backgroundColor: canContinue ? "#8f9f7a" : "#263038",
        fontFamily: this.fontFamily,
        fontSize: "13px",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0);

    this.add
      .text(
        96,
        height - 112,
        "LOCAL ONLY · FICTIONAL ASSETS · NO REAL MARKET DATA",
        {
          color: "#8fa2a6",
          fontFamily: this.fontFamily,
          fontSize: "13px",
        },
      )
      .setOrigin(0, 0);

    this.add
      .text(width - 286, height - 104, "SURVEILLANCE TERMINAL", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "14px",
      })
      .setOrigin(0, 0.5);
  }

  private drawModeCard(config: ModeCardConfig): void {
    this.add
      .rectangle(
        config.x,
        config.y,
        config.width,
        config.height,
        0x090d10,
        0.82,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, config.accent);

    this.add
      .rectangle(config.x, config.y, config.width, 5, config.accent, 0.9)
      .setOrigin(0, 0);

    this.add
      .text(config.x + 26, config.y + 28, config.eyebrow, {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);

    this.add
      .text(config.x + 26, config.y + 58, config.title, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "34px",
      })
      .setOrigin(0, 0);

    this.add
      .text(config.x + 26, config.y + 111, config.summary, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "17px",
        wordWrap: { width: config.width - 52 },
      })
      .setOrigin(0, 0);

    this.add
      .text(
        config.x + 26,
        config.y + 166,
        config.details.map((detail) => `- ${detail}`).join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "15px",
          lineSpacing: 8,
          wordWrap: { width: config.width - 52 },
        },
      )
      .setOrigin(0, 0);

    this.addModeButton(
      config.x + 26,
      config.y + config.height - 74,
      220,
      config.buttonLabel,
      config.onStart,
    );
  }

  private drawSavedRunCard(summary: SavedRunSummary): void {
    this.add
      .rectangle(96, 534, 1088, 66, 0x090d10, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x8f9f7a);

    this.add
      .text(118, 546, summary.modeLabel, {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(118, 566, `${summary.dayLabel} · ${summary.phaseLabel}`, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "19px",
      })
      .setOrigin(0, 0);
    this.add
      .text(386, 546, summary.targetLabel, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "16px",
      })
      .setOrigin(0, 0);
    this.add
      .text(386, 570, `${summary.budgetLabel} · ${summary.riskLabel}`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);
    this.add
      .text(758, 558, summary.savedAtLabel, {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);

    this.addModeButton(952, 544, 214, "저장 Run 이어가기", () => {
      gameSession.loadSavedRun();
      this.scene.start(SceneKeys.PreOpenCard);
    });
  }

  private drawLocalRecordCard(summary: LocalRecordSummary): void {
    this.add
      .rectangle(96, 534, 1088, 66, 0x090d10, 0.86)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6f6a5b);

    this.add
      .text(118, 546, "LOCAL RECORDS", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(118, 566, summary.recentTitle, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "19px",
      })
      .setOrigin(0, 0);
    this.add
      .text(292, 546, summary.recentPerformanceLabel, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);
    this.add
      .text(292, 570, summary.recentRiskLabel, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);

    if (summary.bestTitle) {
      this.add
        .text(646, 546, summary.bestTitle, {
          color: "#8f9f7a",
          fontFamily: this.fontFamily,
          fontSize: "12px",
        })
        .setOrigin(0, 0);
      this.add
        .text(646, 568, summary.bestPerformanceLabel ?? "", {
          color: "#f3e8ca",
          fontFamily: this.fontFamily,
          fontSize: "15px",
        })
        .setOrigin(0, 0);
      this.add
        .text(846, 568, summary.bestRiskLabel ?? "", {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "13px",
        })
        .setOrigin(0, 0);
    }

    this.add
      .text(1008, 548, summary.savedAtLabel, {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);
  }

  private addModeButton(
    x: number,
    y: number,
    width: number,
    label: string,
    onClick: () => void,
  ): void {
    const background = this.add
      .rectangle(x, y, width, 46, 0xd9c58b, 1)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x + width / 2, y + 23, label, {
        color: "#111417",
        fontFamily: this.fontFamily,
        fontSize: "18px",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    [background, text].forEach((object) => {
      object.on("pointerover", () => {
        background.setFillStyle(0xf3e8ca, 1);
      });
      object.on("pointerout", () => {
        background.setFillStyle(0xd9c58b, 1);
      });
      object.on("pointerup", onClick);
    });
  }
}
