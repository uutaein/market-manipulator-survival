import { getAssetById } from "../../domain/assets/assetCatalog";
import type { ContractMandate, ContractObjective } from "../../domain/contract";
import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { gameSession } from "../GameSession";

export class ContractSelectionScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.ContractSelection);
  }

  create(): void {
    const contracts = gameSession.getContractOptions();

    this.drawDocumentShell(
      "의뢰모드 / 계약 선택",
      [
        "CONTRACT DESK",
        "",
        "고정 보상 계약을 선택합니다.",
        "목표는 수익 극대화가 아니라 최소 비용으로 조건을 달성하는 것입니다.",
        "모든 종목과 조건은 허구이며 실제 시장 데이터나 절차를 사용하지 않습니다."
      ],
      undefined,
      "CONTRACT TERMINAL"
    );

    contracts.forEach((contract, index) => {
      this.addContractCard(contract, 96 + (index % 2) * 540, 238 + Math.floor(index / 2) * 132);
    });

    this.addActionButton(
      {
        label: "메인으로",
        target: SceneKeys.MainMenu
      },
      0
    );
  }

  private addContractCard(contract: ContractMandate, x: number, y: number): void {
    const asset = getAssetById(contract.assetId);
    const background = this.add
      .rectangle(x, y, 500, 112, 0x151b1f, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6f6a5b);
    const title = this.add
      .text(x + 18, y + 14, `${contract.displayName} · ${asset.displayName}`, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "19px"
      })
      .setOrigin(0, 0);
    const summary = this.add
      .text(
        x + 18,
        y + 42,
        [
          `${getDirectionLabel(contract.direction)} / ${contract.durationDays} Day / 보상 ${contract.fixedReward}B / 위험 ${contract.riskLevel}`,
          formatObjectives(contract.objectives),
          `리포트 신뢰도 ${contract.reportConfidence}`
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "13px",
          lineSpacing: 4,
          wordWrap: { width: 456 }
        }
      )
      .setOrigin(0, 0);

    [background, title, summary].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", () => {
        gameSession.startContractRun(contract.id);
        this.scene.start(SceneKeys.PreOpenCard);
      });
    });
  }
}

function getDirectionLabel(direction: ContractMandate["direction"]): string {
  switch (direction) {
    case "upward":
      return "상승";
    case "downward":
      return "하락";
    case "range":
      return "밴드";
    case "defense":
      return "방어";
    case "attention":
      return "관심";
    case "stealth":
      return "은밀";
  }
}

function formatObjectives(objectives: readonly ContractObjective[]): string {
  return objectives.map((objective) => getObjectiveLabel(objective)).join(" + ");
}

function getObjectiveLabel(objective: ContractObjective): string {
  switch (objective.type) {
    case "touch":
      return `${objective.deadlineDay}일 내 ${formatPrice(objective.targetPrice)} 터치`;
    case "maintain":
      return `${objective.requiredDays}일 밴드 ${formatPrice(objective.lowerPrice)}~${formatPrice(objective.upperPrice)}`;
    case "close_above":
      return `${objective.day}일 종가 ${formatPrice(objective.targetPrice)} 이상`;
    case "close_below":
      return `${objective.day}일 종가 ${formatPrice(objective.targetPrice)} 이하`;
    case "close_inside_band":
      return `${objective.day}일 종가 밴드`;
    case "never_break":
      return `${objective.durationDays}일 이탈 금지`;
    case "rank":
      return `${objective.deadlineDay}일 내 VALUE ${objective.maxRank}위`;
    case "value":
      return `${objective.deadlineDay}일 내 VALUE ${formatValue(objective.minValue)}`;
    case "touch_then_maintain":
      return "터치 후 밴드 유지";
  }
}

function formatPrice(price: number): string {
  return `${Math.round(price).toLocaleString("ko-KR")}원`;
}

function formatValue(value: number): string {
  if (value >= 100000000) {
    return `${Math.round(value / 100000000)}억`;
  }

  return value.toLocaleString("ko-KR");
}
