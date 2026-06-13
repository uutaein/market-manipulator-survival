import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import { getAssetById, getAssetsBySector, sectors } from "../../domain/assets/assetCatalog";
import { gameSession } from "../GameSession";

export class RunSetupScene extends BaseDocumentScene {
  constructor() {
    super(SceneKeys.RunSetup);
  }

  create(): void {
    this.drawDocumentShell(
      "Run 시작 / 종목 선택",
      [
        `선택: ${gameSession.getSelectedAssetLabel()}`,
        "",
        "종목 성향은 Run 중 반응과 정산 메모로 드러난다."
      ]
    );

    this.add
      .text(96, 190, "섹터", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    sectors.forEach((sector, index) => {
      this.addDocumentButton(
        96,
        222 + index * 42,
        sector.displayName,
        () => {
          gameSession.setSelectedSector(sector.id);
          this.scene.restart();
        },
        gameSession.selectedSectorId === sector.id
      );
    });

    this.add
      .text(410, 190, "종목", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    getAssetsBySector(gameSession.selectedSectorId).forEach((asset, index) => {
      const selected = gameSession.selectedAssetId === asset.id;
      this.addDocumentButton(
        410,
        222 + index * 74,
        `${asset.displayName}\n${asset.shortBriefing}`,
        () => {
          gameSession.setSelectedAsset(asset.id);
          this.scene.restart();
        },
        selected
      );
    });

    const selectedAsset = getAssetById(gameSession.selectedAssetId);
    this.add
      .text(820, 222, `BRIEF\n${selectedAsset.displayName}\n\n${selectedAsset.shortBriefing}\n\n상세 성향: 비공개`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "17px",
        lineSpacing: 9,
        wordWrap: { width: 330 }
      })
      .setOrigin(0, 0);

    this.addActionButton({
      label: "Run 시작",
      target: SceneKeys.MorningBriefing,
      onClick: () => {
        gameSession.startNewRun();
        gameSession.beginDay();
      }
    });
  }
}
