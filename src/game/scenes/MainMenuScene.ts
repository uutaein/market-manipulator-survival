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
        "자유모드: 5-Day Run",
        "의뢰모드: fixed-reward contract slice",
        "Morning documents",
        "Pre-open approval",
        "Intraday pressure management",
        canContinue ? "Saved Run available" : "No saved Run",
        "",
        "No real companies, tickers, exchanges, market data, or real procedures."
      ],
      {
        label: "자유모드 시작",
        target: SceneKeys.RunSetup,
        onClick: () => {
          gameSession.prepareFreeMode();
        }
      }
    );

    this.addActionButton(
      {
        label: "의뢰모드 시작",
        target: SceneKeys.ContractSelection,
        onClick: () => {
          gameSession.prepareContractMode();
        }
      },
      1
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
        2
      );
    }
  }
}
