import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { gameSession } from "../GameSession";

export class MainMenuScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MainMenu);
  }

  create(): void {
    const canContinue = gameSession.canContinueSavedRun();

    this.drawDocumentShell(
      "Market Manipulator Survival",
      [
        "FICTIONAL EXCHANGE SURVEILLANCE DESK",
        "",
        "5-Day Run",
        "Morning documents",
        "Pre-open approval",
        "Intraday pressure management",
        canContinue ? "Saved Run available" : "No saved Run",
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
          gameSession.lastManualActionResult = null;
          gameSession.daySettlementResult = null;
          gameSession.finalSettlementResult = null;
          gameSession.surveillanceHistory = [];
        }
      }
    );

    if (canContinue) {
      this.addActionButton(
        {
          label: "저장 Run 이어가기",
          target: SceneKeys.PreOpenCard,
          onClick: () => {
            gameSession.loadSavedRun();
          }
        },
        1
      );
    }
  }
}
