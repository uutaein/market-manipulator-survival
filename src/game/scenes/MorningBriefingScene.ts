import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class MorningBriefingScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.MorningBriefing);
  }

  create(): void {
    this.drawDocumentShell(
      "아침 뉴스 / 시장 브리핑",
      [
        "SPEC shell for one Morning News item and Market Briefing.",
        "Morning News uses 5 fictional templates.",
        "Briefing shows news effect, target band, and major risk hints."
      ],
      { label: "개장 전 카드", target: SceneKeys.PreOpenCard }
    );
  }
}
