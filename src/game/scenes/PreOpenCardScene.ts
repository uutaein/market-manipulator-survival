import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class PreOpenCardScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.PreOpenCard);
  }

  create(): void {
    this.drawDocumentShell(
      "개장 전 카드 선택",
      [
        "SPEC shell for 4 Pre-open Cards.",
        "시장 관찰 / 사전 포지션 구축 / 방어 자금 배정 / 관망",
        "Opening Approval is required before intraday operation."
      ],
      { label: "개장 승인", target: SceneKeys.Intraday }
    );
  }
}
