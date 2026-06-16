import Phaser from "phaser";
import "./styles.css";
import { gameConfig } from "./game/config";

declare global {
  interface Window {
    __mmsGame?: Phaser.Game;
  }
}

const game = new Phaser.Game(gameConfig);

if (import.meta.env.DEV) {
  window.__mmsGame = game;
}
