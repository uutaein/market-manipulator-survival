import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class RunSetupScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.RunSetup);
  }

  create(): void {
    this.drawDocumentShell(
      "Run 시작 / 종목 선택",
      [
        "SPEC shell for sector and fictional asset selection.",
        "All 8 sectors and 24 fictional assets will be selectable here.",
        "Hidden asset tendencies are not displayed to the player."
      ],
      { label: "브리핑 확인", target: SceneKeys.MorningBriefing }
    );
  }
}
