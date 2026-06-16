import Phaser from "phaser";
import type { SceneKey } from "./SceneKeys";

export type SceneAction = {
  label: string;
  target?: SceneKey;
  onClick?: () => void;
};

export abstract class BaseDocumentScene extends Phaser.Scene {
  protected readonly fontFamily =
    '"IBM Plex Mono", "Malgun Gothic", "Apple SD Gothic Neo", Consolas, "Courier New", monospace';

  protected drawDocumentShell(
    title: string,
    lines: string[],
    action?: SceneAction,
    footerLabel = "SURVEILLANCE TERMINAL"
  ): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#071015");

    this.add
      .rectangle(width / 2, height / 2, width - 96, height - 96, 0x0b1419)
      .setStrokeStyle(2, 0x2d4650);

    this.add
      .text(96, 78, title, {
        color: "#f2fbfc",
        fontFamily: this.fontFamily,
        fontSize: "30px"
      })
      .setOrigin(0, 0);

    this.add
      .text(96, 136, lines.join("\n"), {
        color: "#c2d0d3",
        fontFamily: this.fontFamily,
        fontSize: "18px",
        lineSpacing: 10,
        wordWrap: { width: width - 192 }
      })
      .setOrigin(0, 0);

    if (footerLabel) {
      this.add
        .text(width - 286, height - 104, footerLabel, {
          color: "#7df3e7",
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
        color: "#071015",
        backgroundColor: "#2dd4bf",
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
        color: selected ? "#071015" : "#f2fbfc",
        backgroundColor: selected ? "#2dd4bf" : "#17252b",
        fontFamily: this.fontFamily,
        fontSize: "17px",
        padding: { x: 12, y: 8 }
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerup", onClick);
    return button;
  }
}
