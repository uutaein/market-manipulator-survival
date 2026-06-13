import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class FinalSettlementScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.FinalSettlement);
  }

  create(): void {
    this.drawDocumentShell(
      "Final 정산 화면",
      [
        "SPEC shell for 5-Day Final Settlement or failure result.",
        "Future work: S/A/B/C/D/F grade, cumulative profit, surveillance summary, and restart choices.",
        "Failure reuses this layout as an F-grade variant."
      ],
      { label: "새 Run 시작", target: SceneKeys.RunSetup }
    );
  }
}
