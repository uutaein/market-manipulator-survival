import { getAssetById } from "../../domain/assets/assetCatalog";
import {
  getContractRecommendedManualActionLabels,
  getContractRiskyManualActionLabels,
  type ContractMandate,
  type ContractObjective,
  type ExpertReport,
} from "../../domain/contract";
import { gameSession } from "../GameSession";
import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

interface ContractCardObjects {
  readonly contractId: string;
  readonly background: Phaser.GameObjects.Rectangle;
  readonly title: Phaser.GameObjects.Text;
  readonly meta: Phaser.GameObjects.Text;
  readonly objective: Phaser.GameObjects.Text;
  readonly badge: Phaser.GameObjects.Text;
  readonly confidence: Phaser.GameObjects.Text;
}

export class ContractSelectionScene extends BaseDocumentScene {
  private contracts: readonly ContractMandate[] = [];
  private selectedContractId: string | null = null;
  private readonly contractCards: ContractCardObjects[] = [];
  private detailObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SceneKeys.ContractSelection);
  }

  create(): void {
    this.contracts = gameSession.getContractOptions();
    this.selectedContractId = this.contracts[0]?.id ?? null;
    this.contractCards.length = 0;
    this.detailObjects = [];

    this.drawDocumentShell(
      "의뢰모드 / 계약 선택",
      [],
      undefined,
      "CONTRACT TERMINAL",
    );

    const selectedContract = this.getSelectedContract();
    if (selectedContract) {
      this.drawSelectionSummary(selectedContract);
    }

    this.drawContractListPanel();
    this.contracts.forEach((contract, index) => {
      this.addContractListItem(contract, 118, 238 + index * 62);
    });

    if (selectedContract) {
      this.renderContractDetails(selectedContract);
    }

    this.addSecondaryButton(96, 596, "메인으로", () => {
      this.scene.start(SceneKeys.MainMenu);
    });
    this.addPrimaryButton(960, 596, "의뢰 수락", () => {
      const contract = this.getSelectedContract();
      if (contract) {
        gameSession.startContractRun(contract.id);
        this.scene.start(SceneKeys.PreOpenCard);
      }
    });
  }

  private drawSelectionSummary(contract: ContractMandate): void {
    const asset = getAssetById(contract.assetId);
    this.add
      .rectangle(96, 126, 1088, 50, 0x090d10, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(118, 139, "SELECTED CONTRACT", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);
    this.add
      .text(292, 135, `${contract.displayName} / ${asset.displayName}`, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "24px",
        wordWrap: { width: 500 },
      })
      .setOrigin(0, 0);
    this.add
      .text(
        854,
        137,
        `보상 ${formatReward(contract.fixedReward)} · ${contract.durationDays}D · 위험 ${contract.riskLevel}/5`,
        {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "14px",
        },
      )
      .setOrigin(0, 0);
  }

  private drawContractListPanel(): void {
    this.add
      .rectangle(96, 222, 510, 336, 0x090d10, 0.78)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(96, 196, "AVAILABLE CONTRACTS", {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);
  }

  private addContractListItem(
    contract: ContractMandate,
    x: number,
    y: number,
  ): void {
    const asset = getAssetById(contract.assetId);
    const background = this.add
      .rectangle(x, y, 466, 58, 0x151b1f, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x354149);
    const badge = this.add
      .text(x + 14, y + 8, getDirectionLabel(contract.direction), {
        color: "#111417",
        backgroundColor: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "11px",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0, 0);
    const title = this.add
      .text(x + 74, y + 8, `${contract.displayName} · ${asset.displayName}`, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "15px",
        wordWrap: { width: 286 },
      })
      .setOrigin(0, 0);
    const confidence = this.add
      .text(x + 384, y + 8, `신뢰 ${contract.reportConfidence}`, {
        color: "#111417",
        backgroundColor: getReportConfidenceColor(contract.reportConfidence),
        fontFamily: this.fontFamily,
        fontSize: "11px",
        padding: { x: 7, y: 2 },
      })
      .setOrigin(0, 0);
    const meta = this.add
      .text(
        x + 74,
        y + 30,
        `${contract.durationDays}D · 보상 ${formatReward(contract.fixedReward)} · 위험 ${contract.riskLevel}/5 · ${getSponsorTypeLabel(contract.sponsorType)}`,
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          wordWrap: { width: 430 },
        },
      )
      .setOrigin(0, 0);
    const objective = this.add
      .text(x + 74, y + 42, formatCardObjectiveSummary(contract.objectives), {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "11px",
        wordWrap: { width: 372 },
      })
      .setOrigin(0, 0);

    const select = () => {
      this.selectContract(contract.id);
    };

    [background, badge, title, confidence, meta, objective].forEach(
      (object) => {
        object.setInteractive({ useHandCursor: true });
        object.on("pointerup", select);
      },
    );

    this.contractCards.push({
      contractId: contract.id,
      background,
      title,
      meta,
      objective,
      badge,
      confidence,
    });
    this.refreshContractCardStyles();
  }

  private selectContract(contractId: string): void {
    if (this.selectedContractId === contractId) {
      return;
    }

    this.selectedContractId = contractId;
    this.refreshContractCardStyles();

    const selectedContract = this.getSelectedContract();
    if (selectedContract) {
      this.renderContractDetails(selectedContract);
    }
  }

  private refreshContractCardStyles(): void {
    this.contractCards.forEach((card) => {
      const selected = card.contractId === this.selectedContractId;
      card.background.setFillStyle(
        selected ? 0x273039 : 0x151b1f,
        selected ? 0.98 : 0.94,
      );
      card.background.setStrokeStyle(
        selected ? 2 : 1,
        selected ? 0xd9c58b : 0x354149,
      );
      card.title.setColor(selected ? "#f3e8ca" : "#d7d0bd");
      card.meta.setColor(selected ? "#d9c58b" : "#aeb7a3");
      card.objective.setColor(selected ? "#b7cbb0" : "#8fa2a6");
      card.badge.setBackgroundColor(selected ? "#d9c58b" : "#8f9f7a");
      card.confidence.setAlpha(selected ? 1 : 0.82);
    });
  }

  private renderContractDetails(contract: ContractMandate): void {
    this.detailObjects.forEach((object) => {
      object.destroy();
    });
    this.detailObjects = [];

    const asset = getAssetById(contract.assetId);
    const x = 636;
    const y = 204;
    const width = 548;
    const height = 354;
    const report = contract.expertReport;
    const recommendedTools = getContractRecommendedManualActionLabels(contract);
    const riskyTools = getContractRiskyManualActionLabels(contract);

    this.trackDetailObject(
      this.add
        .rectangle(x, y, width, height, 0x090d10, 0.82)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x6f6a5b),
    );
    this.trackDetailObject(
      this.add
        .text(x + 24, y + 18, "CONTRACT BRIEF", {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "15px",
        })
        .setOrigin(0, 0),
    );
    this.trackDetailObject(
      this.add
        .text(
          x + 24,
          y + 48,
          `${contract.displayName} · ${asset.displayName}`,
          {
            color: "#f3e8ca",
            fontFamily: this.fontFamily,
            fontSize: "21px",
            wordWrap: { width: width - 48 },
          },
        )
        .setOrigin(0, 0),
    );
    this.drawRiskBars(x + 24, y + 96, contract.riskLevel);
    this.trackDetailObject(
      this.add
        .text(
          x + 128,
          y + 86,
          [
            `${getSponsorTypeLabel(contract.sponsorType)} · ${getDirectionLabel(contract.direction)} · ${contract.durationDays} Day`,
            `보상 ${formatReward(contract.fixedReward)} · 리포트 신뢰도 ${report.confidence}`,
          ].join("\n"),
          {
            color: "#c9c1ad",
            fontFamily: this.fontFamily,
            fontSize: "13px",
            lineSpacing: 4,
            wordWrap: { width: width - 156 },
          },
        )
        .setOrigin(0, 0),
    );

    this.trackDetailObject(
      this.add
        .text(
          x + 24,
          y + 140,
          [
            `조건: ${formatObjectives(contract.objectives)}`,
            `리포트: ${formatExpertReportPriceLine(report)}`,
            report.summary,
            `추천 도구: ${recommendedTools.join(" / ")}`,
            `주의 도구: ${riskyTools.join(" / ") || "없음"}`,
          ].join("\n"),
          {
            color: "#c9c1ad",
            fontFamily: this.fontFamily,
            fontSize: "14px",
            lineSpacing: 7,
            wordWrap: { width: width - 48 },
          },
        )
        .setOrigin(0, 0),
    );
  }

  private addPrimaryButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const button = this.add
      .text(x, y, `[ ${label} ]`, {
        color: "#111417",
        backgroundColor: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "20px",
        padding: { x: 18, y: 10 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setBackgroundColor("#f3e8ca");
    });
    button.on("pointerout", () => {
      button.setBackgroundColor("#d9c58b");
    });
    button.on("pointerup", onClick);
  }

  private addSecondaryButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const button = this.add
      .text(x, y, `[ ${label} ]`, {
        color: "#c9c1ad",
        backgroundColor: "#263038",
        fontFamily: this.fontFamily,
        fontSize: "18px",
        padding: { x: 16, y: 9 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setColor("#f3e8ca");
    });
    button.on("pointerout", () => {
      button.setColor("#c9c1ad");
    });
    button.on("pointerup", onClick);
  }

  private drawRiskBars(x: number, y: number, riskLevel: number): void {
    for (let index = 0; index < 5; index += 1) {
      const active = index < riskLevel;
      this.trackDetailObject(
        this.add
          .rectangle(
            x + index * 17,
            y,
            12,
            22,
            active ? getRiskBarColor(riskLevel) : 0x263038,
            active ? 0.95 : 0.72,
          )
          .setOrigin(0, 0),
      );
    }
    this.trackDetailObject(
      this.add
        .text(x, y + 28, `위험 ${riskLevel}/5`, {
          color: "#aeb7a3",
          fontFamily: this.fontFamily,
          fontSize: "12px",
        })
        .setOrigin(0, 0),
    );
  }

  private trackDetailObject<T extends Phaser.GameObjects.GameObject>(
    object: T,
  ): T {
    this.detailObjects.push(object);
    return object;
  }

  private getSelectedContract(): ContractMandate | null {
    return (
      this.contracts.find(
        (contract) => contract.id === this.selectedContractId,
      ) ??
      this.contracts[0] ??
      null
    );
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

function getSponsorTypeLabel(
  sponsorType: ContractMandate["sponsorType"],
): string {
  switch (sponsorType) {
    case "long_holder":
      return "롱 보유자";
    case "short_seller":
      return "숏 의뢰주";
    case "accumulator":
      return "매집자";
    case "defender":
      return "방어자";
    case "pump_exit":
      return "익절 출구";
  }
}

function getReportConfidenceColor(confidence: number): string {
  if (confidence >= 72) {
    return "#d9c58b";
  }

  if (confidence >= 66) {
    return "#8f9f7a";
  }

  return "#d99d5a";
}

function formatCardObjectiveSummary(
  objectives: readonly ContractObjective[],
): string {
  return `목표 ${formatObjectives(objectives)}`;
}

function formatObjectives(objectives: readonly ContractObjective[]): string {
  return objectives
    .map((objective) => getObjectiveLabel(objective))
    .join(" + ");
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
      return `${objective.day}일 종가 밴드 ${formatPrice(objective.lowerPrice)}~${formatPrice(objective.upperPrice)}`;
    case "never_break":
      return `${objective.durationDays}일 이탈 금지`;
    case "rank":
      return `${objective.deadlineDay}일 내 VALUE ${objective.maxRank}위`;
    case "value":
      return `${objective.deadlineDay}일 내 VALUE ${formatValue(objective.minValue)}`;
    case "touch_then_maintain":
      return `${objective.touchDeadlineDay}일 내 터치 후 ${objective.maintainDays}일 밴드 유지`;
  }
}

function formatExpertReportPriceLine(report: ExpertReport): string {
  const priceHint = report.targetPriceHint
    ? `제시가 ${formatPrice(report.targetPriceHint)} 부근`
    : null;
  const bandHint =
    report.lowerPrice !== undefined && report.upperPrice !== undefined
      ? `밴드 ${formatPrice(report.lowerPrice)}~${formatPrice(report.upperPrice)}`
      : null;

  return [priceHint, bandHint].filter(Boolean).join(" / ") || "가격 제시 없음";
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

function formatReward(value: number): string {
  return `${value.toLocaleString("ko-KR")}B`;
}

function getRiskBarColor(riskLevel: number): number {
  if (riskLevel >= 5) {
    return 0xd0645d;
  }

  if (riskLevel >= 4) {
    return 0xd99d5a;
  }

  return 0x8f9f7a;
}
