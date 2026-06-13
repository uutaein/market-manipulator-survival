import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class MainMenuScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MainMenu);
  }

  create(): void {
    this.drawDocumentShell(
      "Market Manipulator Survival",
      [
        "Fictional exchange surveillance desk.",
        "MVP first playable scaffold.",
        "",
        "No real companies, tickers, exchanges, market data, or real procedures.",
        "Next implementation work should follow SPEC, Gherkin, and traceability."
      ],
      { label: "새 Run 시작", target: SceneKeys.RunSetup }
    );
  }
}
