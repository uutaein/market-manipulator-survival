import Phaser from "phaser";
import type { SceneKey } from "./SceneKeys";

export type SceneAction = {
  label: string;
  target?: SceneKey;
  onClick?: () => void;
};

export abstract class BaseDocumentScene extends Phaser.Scene {
  protected readonly fontFamily = "Consolas, Courier New, monospace";

  protected drawDocumentShell(
    title: string,
    lines: string[],
    action?: SceneAction,
    footerLabel = "SURVEILLANCE TERMINAL"
  ): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#111417");

    this.add
      .rectangle(width / 2, height / 2, width - 96, height - 96, 0x1b1f22)
      .setStrokeStyle(2, 0x6f6a5b);

    this.add
      .text(96, 78, title, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "30px"
      })
      .setOrigin(0, 0);

    this.add
      .text(96, 136, lines.join("\n"), {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "18px",
        lineSpacing: 10,
        wordWrap: { width: width - 192 }
      })
      .setOrigin(0, 0);

    if (footerLabel) {
      this.add
        .text(width - 286, height - 104, footerLabel, {
          color: "#8f9f7a",
          fontFamily: this.fontFamily,
          fontSize: "14px"
        })
        .setOrigin(0, 0.5);
    }

    if (action) {
      this.addActionButton(action);
    }
  }

  protected addActionButton(action: SceneAction, index = 0): Phaser.GameObjects.Text {
    const { height } = this.scale;
    const button = this.add
      .text(96 + index * 260, height - 124, `[ ${action.label} ]`, {
        color: "#111417",
        backgroundColor: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "20px",
        padding: { x: 16, y: 10 }
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerup", () => {
      action.onClick?.();
      if (action.target) {
        this.scene.start(action.target);
      }
    });

    return button;
  }

  protected addDocumentButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    selected = false
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        color: selected ? "#111417" : "#f3e8ca",
        backgroundColor: selected ? "#d9c58b" : "#2a3033",
        fontFamily: this.fontFamily,
        fontSize: "17px",
        padding: { x: 12, y: 8 }
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerup", onClick);
    return button;
  }
}
