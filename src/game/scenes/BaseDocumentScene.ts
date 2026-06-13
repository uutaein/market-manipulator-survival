import Phaser from "phaser";
import type { SceneKey } from "./SceneKeys";

export type SceneAction = {
  label: string;
  target: SceneKey;
};

export abstract class BaseDocumentScene extends Phaser.Scene {
  protected drawDocumentShell(title: string, lines: string[], action?: SceneAction): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#111417");

    this.add
      .rectangle(width / 2, height / 2, width - 96, height - 96, 0x1b1f22)
      .setStrokeStyle(2, 0x6f6a5b);

    this.add
      .text(96, 78, title, {
        color: "#f3e8ca",
        fontFamily: "Consolas, Courier New, monospace",
        fontSize: "30px"
      })
      .setOrigin(0, 0);

    this.add
      .text(96, 136, lines.join("\n"), {
        color: "#c9c1ad",
        fontFamily: "Consolas, Courier New, monospace",
        fontSize: "18px",
        lineSpacing: 10,
        wordWrap: { width: width - 192 }
      })
      .setOrigin(0, 0);

    this.add
      .text(width - 260, height - 104, "SPEC ACCEPTED", {
        color: "#8f9f7a",
        fontFamily: "Consolas, Courier New, monospace",
        fontSize: "14px"
      })
      .setOrigin(0, 0.5);

    if (action) {
      this.addActionButton(action);
    }
  }

  private addActionButton(action: SceneAction): void {
    const { height } = this.scale;
    const button = this.add
      .text(96, height - 124, `[ ${action.label} ]`, {
        color: "#111417",
        backgroundColor: "#d9c58b",
        fontFamily: "Consolas, Courier New, monospace",
        fontSize: "20px",
        padding: { x: 16, y: 10 }
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerup", () => {
      this.scene.start(action.target);
    });
  }
}
