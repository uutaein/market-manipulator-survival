import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { getAssetById, getAssetsBySector, getSectorById, sectors } from "../../domain/assets/assetCatalog";
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

    sectors.forEach((sector, index) => {
      this.addDocumentButton(
        96,
        208 + index * 42,
        sector.displayName,
        () => {
          gameSession.setSelectedSector(sector.id);
          this.scene.restart();
        },
        gameSession.selectedSectorId === sector.id
      );
    });

    this.add
      .text(382, 176, "LISTED TARGETS", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    getAssetsBySector(gameSession.selectedSectorId).forEach((asset, index) => {
      const selected = gameSession.selectedAssetId === asset.id;
      this.addAssetChoiceCard(382, 208 + index * 100, asset.displayName, asset.shortBriefing, selected, () => {
        gameSession.setSelectedAsset(asset.id);
        this.scene.restart();
      });
    });

    const selectedAsset = getAssetById(gameSession.selectedAssetId);
    const selectedSector = getSectorById(selectedAsset.sectorId);
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
      .text(816, 324, selectedAsset.shortBriefing, {
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
      .rectangle(x, y, 330, 82, selected ? 0x273e2f : 0x151b1f, selected ? 0.95 : 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    const titleText = this.add
      .text(x + 16, y + 12, title, {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "20px"
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
