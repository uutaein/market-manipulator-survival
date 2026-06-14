import Phaser from "phaser";
import { ContractSelectionScene } from "./scenes/ContractSelectionScene";
import { DaySettlementScene } from "./scenes/DaySettlementScene";
import { FinalSettlementScene } from "./scenes/FinalSettlementScene";
import { IntradayScene } from "./scenes/IntradayScene";
import { IntradayRepositionScene } from "./scenes/IntradayRepositionScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { MorningBriefingScene } from "./scenes/MorningBriefingScene";
import { PreOpenCardScene } from "./scenes/PreOpenCardScene";
import { RunSetupScene } from "./scenes/RunSetupScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 1280,
  height: 720,
  backgroundColor: "#111417",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    MainMenuScene,
    ContractSelectionScene,
    RunSetupScene,
    MorningBriefingScene,
    PreOpenCardScene,
    IntradayScene,
    IntradayRepositionScene,
    DaySettlementScene,
    FinalSettlementScene
  ]
};
