import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { getAssetById, getAssetsBySector, getSectorById, sectors } from "../../domain/assets/assetCatalog";
import {
  getAssetBaselineTradeValue,
  getAssetMarketProfile,
  getAssetNewsSensitivity,
  getEntryRecommendedSectorIds,
  getSectorMarketProfile
} from "../../domain/assets/assetMarketProfiles";
import { gameSession } from "../GameSession";

export class RunSetupScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.RunSetup);
  }

  create(): void {
    this.drawDocumentShell("Run 시작 / 종목 선택", [], undefined, "ASSET REGISTRY");

    this.add
      .text(96, 126, `선택: ${gameSession.getSelectedAssetLabel()}`, {
        color: "#111417",
        backgroundColor: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0, 0);

    this.add
      .text(96, 176, "SECTOR FILTER", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    const entryRecommendedSectorIds = getEntryRecommendedSectorIds();

    sectors.forEach((sector, index) => {
      const profile = getSectorMarketProfile(sector.id);
      const recommended = entryRecommendedSectorIds.includes(sector.id);
      this.addDocumentButton(
        96,
        208 + index * 42,
        `${sector.displayName} · ${recommended ? "추천" : profile.recommendation}`,
        () => {
          gameSession.setSelectedSector(sector.id);
          this.scene.restart();
        },
        gameSession.selectedSectorId === sector.id
      );
    });

    this.add
      .text(
        96,
        548,
        [
          `추천: ${entryRecommendedSectorIds
            .map((sectorId) => getCompactSectorName(getSectorById(sectorId).displayName))
            .join(" / ")}`,
          "성공 후 대형 체급 도전"
        ].join("\n"),
        {
          color: "#8fa2a6",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          lineSpacing: 4,
          wordWrap: { width: 300 }
        }
      )
      .setOrigin(0, 0);

    this.add
      .text(382, 176, "LISTED TARGETS", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    getAssetsBySector(gameSession.selectedSectorId).forEach((asset, index) => {
      const selected = gameSession.selectedAssetId === asset.id;
      const assetProfile = getAssetMarketProfile(asset.id);
      this.addAssetChoiceCard(
        382,
        208 + index * 104,
        `${asset.displayName} · ${getAssetRoleLabel(assetProfile.role)}`,
        `${asset.shortBriefing}\n기본대금 ${formatTradeValue(getAssetBaselineTradeValue(asset))}`,
        selected,
        () => {
          gameSession.setSelectedAsset(asset.id);
          this.scene.restart();
        }
      );
    });

    const selectedAsset = getAssetById(gameSession.selectedAssetId);
    const selectedSector = getSectorById(selectedAsset.sectorId);
    const selectedAssetProfile = getAssetMarketProfile(selectedAsset.id);
    this.add
      .rectangle(790, 176, 360, 318, 0x090d10, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(816, 204, "OBSERVATION MEMO", {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);
    this.add
      .text(816, 238, selectedAsset.displayName, {
        color: "#f3e8ca",
        fontFamily: this.fontFamily,
        fontSize: "28px"
      })
      .setOrigin(0, 0);
    this.add
      .text(816, 282, `섹터: ${selectedSector.displayName}`, {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "16px"
      })
      .setOrigin(0, 0);
    this.add
      .text(
        816,
        310,
        [
          `체급: ${getAssetRoleLabel(selectedAssetProfile.role)} / 기본대금 ${formatTradeValue(
            getAssetBaselineTradeValue(selectedAsset)
          )}`,
          `뉴스 반응: ${getNewsSensitivityLabel(getAssetNewsSensitivity(selectedAsset))}`
        ].join("\n"),
        {
          color: "#d9c58b",
          fontFamily: this.fontFamily,
          fontSize: "14px",
          lineSpacing: 5,
          wordWrap: { width: 300 }
        }
      )
      .setOrigin(0, 0);
    this.add
      .text(816, 356, selectedAsset.shortBriefing, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "17px",
        lineSpacing: 8,
        wordWrap: { width: 300 }
      })
      .setOrigin(0, 0);
    this.add
      .text(816, 414, "세부 성향은 비공개\nRun 중 가격 반응과 정산 메모로 확인", {
        color: "#8fa2a6",
        fontFamily: this.fontFamily,
        fontSize: "14px",
        lineSpacing: 7,
        wordWrap: { width: 300 }
      })
      .setOrigin(0, 0);

    this.addActionButton({
      label: "Run 시작",
      target: SceneKeys.PreOpenCard,
      onClick: () => {
        gameSession.startNewRun();
        gameSession.beginDay();
      }
    });
  }

  private addAssetChoiceCard(
    x: number,
    y: number,
    title: string,
    body: string,
    selected: boolean,
    onClick: () => void
  ): void {
    const background = this.add
      .rectangle(x, y, 330, 90, selected ? 0x273e2f : 0x151b1f, selected ? 0.95 : 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    const titleText = this.add
      .text(x + 16, y + 12, title, {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "18px"
      })
      .setOrigin(0, 0);
    const bodyText = this.add
      .text(x + 16, y + 42, body, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "13px",
        wordWrap: { width: 292 }
      })
      .setOrigin(0, 0);

    [background, titleText, bodyText].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", onClick);
    });
  }
}

function getAssetRoleLabel(role: ReturnType<typeof getAssetMarketProfile>["role"]): string {
  if (role === "sector_leader") {
    return "대장주";
  }

  if (role === "theme_mover") {
    return "테마주";
  }

  return "중형주";
}

function formatTradeValue(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  }

  return `${Math.round(value / 10000).toLocaleString("ko-KR")}만`;
}

function getNewsSensitivityLabel(value: number): string {
  if (value >= 1.25) {
    return "민감";
  }

  if (value <= 0.95) {
    return "안정";
  }

  return "보통";
}

function getCompactSectorName(displayName: string): string {
  if (displayName === "결제·핀테크") {
    return "핀테크";
  }

  if (displayName === "미디어·게임") {
    return "미디어";
  }

  return displayName;
}
