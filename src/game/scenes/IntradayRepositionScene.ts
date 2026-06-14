import { getAssetById, getAssetsBySector, sectors, type AssetId, type SectorId } from "../../domain/assets/assetCatalog";
import { gameSession } from "../GameSession";
import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";

interface RepositionSceneData {
  readonly sectorId?: SectorId;
  readonly assetId?: AssetId;
}

export class IntradayRepositionScene extends BaseDocumentScene {
  private pendingSectorId: SectorId = gameSession.selectedSectorId;
  private pendingAssetId: AssetId = gameSession.selectedAssetId;

  constructor() {
    super(SceneKeys.IntradayReposition);
  }

  init(data: RepositionSceneData): void {
    const sectorId = data.sectorId ?? gameSession.selectedSectorId;
    const sectorAssets = getAssetsBySector(sectorId);
    const requestedAsset = data.assetId ? getAssetById(data.assetId) : null;

    this.pendingSectorId = sectorId;
    this.pendingAssetId = requestedAsset?.sectorId === sectorId ? requestedAsset.id : sectorAssets[0].id;
  }

  create(): void {
    this.drawDocumentShell("운용 데스크 재배치", [
      "장중에 포지션을 전량 정리한 뒤에는 같은 Day에 다른 종목으로 재진입할 수 없다.",
      "남은 Day는 관망하거나 Day 정산으로 넘긴다.",
      "다음 Day 시작 전에 새 섹터와 종목을 선택할 수 있다."
    ]);

    if (!gameSession.canRepositionIntradayAsset()) {
      this.add
        .text(96, 210, "장중 재배치는 비활성화됐다. 다음 Day 종목 선택 단계에서 새 종목을 고를 수 있다.", {
          color: "#c46b5b",
          fontFamily: this.fontFamily,
          fontSize: "18px",
          wordWrap: { width: 760 }
        })
        .setOrigin(0, 0);
      this.addActionButton({ label: "장중으로 복귀", target: SceneKeys.Intraday });
      return;
    }

    this.add
      .text(96, 210, "섹터", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    sectors.forEach((sector, index) => {
      this.addDocumentButton(
        96,
        240 + index * 40,
        sector.displayName,
        () => this.scene.restart({ sectorId: sector.id }),
        this.pendingSectorId === sector.id
      );
    });

    this.add
      .text(410, 210, "종목", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "15px"
      })
      .setOrigin(0, 0);

    getAssetsBySector(this.pendingSectorId).forEach((asset, index) => {
      this.addDocumentButton(
        410,
        240 + index * 74,
        `${asset.displayName}\n${asset.shortBriefing}`,
        () => this.scene.restart({ sectorId: this.pendingSectorId, assetId: asset.id }),
        this.pendingAssetId === asset.id
      );
    });

    const selectedAsset = getAssetById(this.pendingAssetId);
    this.add
      .text(
        820,
        240,
        `RE-ENTRY BRIEF\n${selectedAsset.displayName}\n\n${selectedAsset.shortBriefing}\n\n상세 성향: 비공개`,
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "17px",
          lineSpacing: 9,
          wordWrap: { width: 330 }
        }
      )
      .setOrigin(0, 0);

    this.addActionButton({
      label: "재진입",
      target: SceneKeys.Intraday,
      onClick: () => {
        gameSession.repositionIntradayAsset(this.pendingAssetId);
      }
    });
    this.addActionButton({ label: "취소", target: SceneKeys.Intraday }, 1);
  }
}
