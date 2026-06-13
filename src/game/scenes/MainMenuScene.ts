import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { gameSession } from "../GameSession";

export class MainMenuScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MainMenu);
  }

  create(): void {
    this.drawDocumentShell(
      "Market Manipulator Survival",
      [
        "FICTIONAL EXCHANGE SURVEILLANCE DESK",
        "",
        "5-Day Run",
        "Morning documents",
        "Pre-open approval",
        "Intraday pressure management",
        "",
        "No real companies, tickers, exchanges, market data, or real procedures."
      ],
      {
        label: "새 Run 시작",
        target: SceneKeys.RunSetup,
        onClick: () => {
          gameSession.runState = null;
          gameSession.dayState = null;
          gameSession.marketBriefing = null;
          gameSession.intradayState = null;
          gameSession.marketBoardState = null;
        }
      }
    );
  }
}
