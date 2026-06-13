import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

export class IntradayScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.Intraday);
  }

  create(): void {
    this.drawDocumentShell(
      "장중 운용 화면",
      [
        "SPEC shell for the 360-second intraday loop.",
        "Future work: price tick, Market Board, manual actions, auto cards, document events, and Retail Swarm.",
        "This scaffold does not implement gameplay simulation yet."
      ],
      { label: "Day 정산", target: SceneKeys.DaySettlement }
    );
  }
}
