import { getAssetById, getAssetsBySector, sectors, type AssetId, type SectorId } from "../../domain/assets/assetCatalog";
import { gameSession, intradayRepositionEntryCost, intradayRepositionStartingHolding } from "../GameSession";
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
      "포지션을 모두 정리한 뒤 다른 섹터와 종목으로 재진입할 수 있다.",
      `재진입 비용: ${intradayRepositionEntryCost}B / 초기 보유 비중: ${intradayRepositionStartingHolding}%`,
      "Run, Day, 예산, 감시 리스크는 유지된다."
    ]);

    if (!gameSession.canRepositionIntradayAsset()) {
      this.add
        .text(96, 210, "현재는 재배치 조건이 아니다. 포지션 정리로 보유 비중을 0%까지 낮춘 뒤 사용할 수 있다.", {
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
