import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class DaySettlementScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.DaySettlement);
  }

  create(): void {
    this.drawDocumentShell(
      "Day 정산 화면",
      [
        "SPEC shell for Day Settlement.",
        "Future work: actual profit, surveillance grade, holding risk, social cost, and learning hints.",
        "Day 5 will route to Final Settlement."
      ],
      { label: "Final 정산", target: SceneKeys.FinalSettlement }
    );
  }
}
