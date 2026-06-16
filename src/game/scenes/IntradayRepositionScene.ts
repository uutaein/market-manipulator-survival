import {
  getAssetById,
  getAssetsBySector,
  sectors,
  type AssetId,
  type SectorId,
} from "../../domain/assets/assetCatalog";
import {
  getAssetBaselineTradeValue,
  getAssetMarketProfile,
  getAssetNewsSensitivity,
} from "../../domain/assets/assetMarketProfiles";
import {
  gameSession,
  intradayRepositionEntryCost,
  intradayRepositionStartingHolding,
} from "../GameSession";
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
    this.pendingAssetId =
      requestedAsset?.sectorId === sectorId
        ? requestedAsset.id
        : sectorAssets[0].id;
  }

  create(): void {
    this.drawDocumentShell(
      "운용 데스크 재배치",
      [],
      undefined,
      "RE-ENTRY DESK",
    );

    if (!gameSession.canRepositionIntradayAsset()) {
      this.drawDisabledState();
      this.addActionButton({
        label: "장중으로 복귀",
        target: SceneKeys.Intraday,
      });
      return;
    }

    this.drawStatusPanel();
    this.drawSectorChoices();
    this.drawAssetChoices();
    this.drawSelectedAssetBrief();

    this.addActionButton({
      label: `재진입 ${formatBudget(intradayRepositionEntryCost)}`,
      target: SceneKeys.Intraday,
      onClick: () => {
        gameSession.repositionIntradayAsset(this.pendingAssetId);
      },
    });
    this.addActionButton({ label: "취소", target: SceneKeys.Intraday }, 1);
  }

  private drawStatusPanel(): void {
    const state = gameSession.intradayState;

    this.drawPanel(96, 126, 1054, 76, "RE-ENTRY CONDITIONS");
    this.add
      .text(
        122,
        166,
        [
          `현재 보유 ${formatPercent(state?.holdingRatio ?? 0)} · 진행 중 액션 없음`,
          `남은 시간 ${state?.timeRemainingSec ?? 0}s · 예산 ${formatBudget(state?.budget ?? 0)} · 재진입 비용 ${formatBudget(
            intradayRepositionEntryCost,
          )}`,
          `새 종목은 ${formatPercent(intradayRepositionStartingHolding)} 보유로 시작하며 감시/참여/변동성 상태는 보존됩니다.`,
        ].join("    "),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "13px",
          wordWrap: { width: 1000 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawSectorChoices(): void {
    this.drawPanel(96, 232, 270, 324, "SECTOR");

    this.add
      .text(118, 274, "새 데스크 섹터", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);

    sectors.forEach((sector, index) => {
      this.addSectorChoice(
        118,
        300 + index * 29,
        sector.displayName,
        () => this.scene.restart({ sectorId: sector.id }),
        this.pendingSectorId === sector.id,
      );
    });
  }

  private drawAssetChoices(): void {
    this.drawPanel(396, 232, 374, 324, "ASSET");

    this.add
      .text(422, 274, "진입 후보", {
        color: "#8f9f7a",
        fontFamily: this.fontFamily,
        fontSize: "13px",
      })
      .setOrigin(0, 0);

    getAssetsBySector(this.pendingSectorId).forEach((asset, index) => {
      this.addAssetChoice(
        422,
        302 + index * 76,
        asset.id,
        asset.displayName,
        asset.shortBriefing,
        () =>
          this.scene.restart({
            sectorId: this.pendingSectorId,
            assetId: asset.id,
          }),
        this.pendingAssetId === asset.id,
      );
    });
  }

  private drawSelectedAssetBrief(): void {
    const selectedAsset = getAssetById(this.pendingAssetId);
    const selectedProfile = getAssetMarketProfile(selectedAsset.id);
    const state = gameSession.intradayState;
    const nextBudget = Math.max(
      0,
      (state?.budget ?? 0) - intradayRepositionEntryCost,
    );

    this.drawPanel(800, 232, 350, 324, "RE-ENTRY BRIEF");
    this.add
      .text(
        826,
        280,
        [
          selectedAsset.displayName,
          selectedAsset.shortBriefing,
          `체급: ${getAssetRoleLabel(selectedProfile.role)} / 기본대금 ${formatTradeValue(
            getAssetBaselineTradeValue(selectedAsset),
          )}`,
          `뉴스 반응: ${getNewsSensitivityLabel(getAssetNewsSensitivity(selectedAsset))}`,
          `재진입 후 예산 ${formatBudget(nextBudget)} · 보유 ${formatPercent(intradayRepositionStartingHolding)}`,
          "보존: 감시도, 참여도, 변동성, 문서 이벤트 이력",
        ].join("\n\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "14px",
          lineSpacing: 5,
          wordWrap: { width: 298 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawDisabledState(): void {
    const state = gameSession.intradayState;

    this.drawPanel(96, 132, 1054, 210, "RE-ENTRY LOCKED");
    this.add
      .text(
        122,
        184,
        [
          "장중 데스크 재배치는 자유모드에서 보유 포지션이 0%이고 진행 중인 수동 액션이 없을 때만 열립니다.",
          `현재 보유 ${formatPercent(state?.holdingRatio ?? 0)} · 예산 ${formatBudget(state?.budget ?? 0)} · 남은 시간 ${
            state?.timeRemainingSec ?? 0
          }s`,
          `필요 조건: 보유 0% / 진행 액션 없음 / 예산 ${formatBudget(intradayRepositionEntryCost)} 이상 / 장중 진행 중`,
          "조건이 맞지 않으면 남은 Day를 운용하거나 Day 정산 후 다음 Day 종목 선택을 사용합니다.",
        ].join("\n"),
        {
          color: "#c9c1ad",
          fontFamily: this.fontFamily,
          fontSize: "16px",
          lineSpacing: 9,
          wordWrap: { width: 980 },
        },
      )
      .setOrigin(0, 0);
  }

  private addAssetChoice(
    x: number,
    y: number,
    assetId: AssetId,
    title: string,
    body: string,
    onClick: () => void,
    selected: boolean,
  ): void {
    const profile = getAssetMarketProfile(assetId);
    const background = this.add
      .rectangle(x, y, 316, 62, selected ? 0x273e2f : 0x151b1f, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    const titleText = this.add
      .text(x + 14, y + 10, title, {
        color: selected ? "#f3e8ca" : "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);
    const bodyText = this.add
      .text(x + 14, y + 32, `${body} · ${getAssetRoleLabel(profile.role)}`, {
        color: "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "11px",
        wordWrap: { width: 288 },
      })
      .setOrigin(0, 0);

    [background, titleText, bodyText].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", onClick);
    });
  }

  private addSectorChoice(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    selected: boolean,
  ): void {
    const background = this.add
      .rectangle(
        x,
        y,
        212,
        25,
        selected ? 0xd9c58b : 0x151b1f,
        selected ? 0.96 : 0.9,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0xd9c58b : 0x263038);
    const labelText = this.add
      .text(x + 12, y + 5, label, {
        color: selected ? "#111417" : "#c9c1ad",
        fontFamily: this.fontFamily,
        fontSize: "14px",
      })
      .setOrigin(0, 0);

    [background, labelText].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", onClick);
    });
  }

  private drawPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
  ): void {
    this.add
      .rectangle(x, y, width, height, 0x090d10, 0.84)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(x + 22, y + 20, title, {
        color: "#d9c58b",
        fontFamily: this.fontFamily,
        fontSize: "14px",
      })
      .setOrigin(0, 0);
  }
}

function formatBudget(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}B`;
}

function formatPercent(value: number): string {
  return `${formatNumber(Math.round(value * 10) / 10)}%`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatTradeValue(value: number): string {
  if (value >= 100000000) {
    return `${formatNumber(Math.round(value / 10000000) / 10)}억`;
  }

  return `${formatNumber(Math.round(value / 100000) / 10)}백만`;
}

function getAssetRoleLabel(
  role: ReturnType<typeof getAssetMarketProfile>["role"],
): string {
  switch (role) {
    case "sector_leader":
      return "섹터 리더";
    case "theme_mover":
      return "테마 민감";
    default:
      return "표준";
  }
}

function getNewsSensitivityLabel(value: number): string {
  if (value >= 1.35) {
    return "매우 높음";
  }

  if (value >= 1.1) {
    return "높음";
  }

  if (value <= 0.95) {
    return "낮음";
  }

  return "보통";
}
