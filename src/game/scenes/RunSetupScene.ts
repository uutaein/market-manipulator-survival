import { BaseDocumentScene } from "./BaseDocumentScene";
import { SceneKeys } from "./SceneKeys";
import {
  getAssetById,
  getAssetsBySector,
  getSectorById,
  sectors,
  type AssetId,
  type SectorId,
} from "../../domain/assets/assetCatalog";
import {
  getAssetBaselineTradeValue,
  getAssetMarketProfile,
  getAssetNewsSensitivity,
  getEntryRecommendedSectorIds,
  getSectorMarketProfile,
} from "../../domain/assets/assetMarketProfiles";
import type { RunState } from "../../domain/run/runState";
import { gameSession } from "../GameSession";

type RunSetupMode = "new_run" | "next_day_asset";

interface RunSetupSceneData {
  readonly mode?: RunSetupMode;
  readonly sectorId?: SectorId;
  readonly assetId?: AssetId;
}

export class RunSetupScene extends BaseDocumentScene {
  private mode: RunSetupMode = "new_run";
  private pendingSectorId: SectorId = gameSession.selectedSectorId;
  private pendingAssetId: AssetId = gameSession.selectedAssetId;

  constructor() {
    super(SceneKeys.RunSetup);
  }

  init(data: RunSetupSceneData = {}): void {
    const sectorId = data.sectorId ?? gameSession.selectedSectorId;
    const sectorAssets = getAssetsBySector(sectorId);
    const requestedAsset = data.assetId ? getAssetById(data.assetId) : null;

    this.mode = data.mode ?? "new_run";
    this.pendingSectorId = sectorId;
    this.pendingAssetId =
      requestedAsset?.sectorId === sectorId
        ? requestedAsset.id
        : sectorAssets[0].id;
  }

  create(): void {
    const isNextDayAssetSelection = this.mode === "next_day_asset";
    const selectedAsset = getAssetById(this.pendingAssetId);
    const selectedSector = getSectorById(selectedAsset.sectorId);
    const selectedAssetProfile = getAssetMarketProfile(selectedAsset.id);
    const entryRecommendedSectorIds = getEntryRecommendedSectorIds();

    this.drawDocumentShell(
      isNextDayAssetSelection ? "다음 Day / 종목 선택" : "Run 시작 / 종목 선택",
      [],
      undefined,
      "ASSET REGISTRY",
    );

    this.drawSelectionSummary(
      selectedSector.displayName,
      selectedAsset.displayName,
      isNextDayAssetSelection,
    );
    this.drawSectorChoices(entryRecommendedSectorIds);
    this.drawAssetChoices();
    this.drawAssetMemo(
      selectedSector.displayName,
      selectedAsset,
      selectedAssetProfile,
      isNextDayAssetSelection,
    );
    this.addPrimaryStartButton(isNextDayAssetSelection);
  }

  private drawSelectionSummary(
    sectorName: string,
    assetName: string,
    isNextDayAssetSelection: boolean,
  ): void {
    this.add
      .rectangle(96, 126, 1088, 50, 0x090d10, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(
        118,
        139,
        isNextDayAssetSelection ? "NEXT DAY TARGET" : "RUN TARGET",
        {
          color: "#7df3e7",
          fontFamily: this.fontFamily,
          fontSize: "12px",
        },
      )
      .setOrigin(0, 0);
    this.add
      .text(248, 135, `${sectorName} / ${assetName}`, {
        color: "#f2fbfc",
        fontFamily: this.fontFamily,
        fontSize: "24px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        884,
        139,
        isNextDayAssetSelection
          ? "Run/Day 리스크 보존"
          : "세부 성향은 Run 중 관찰",
        {
          color: "#2dd4bf",
          fontFamily: this.fontFamily,
          fontSize: "14px",
        },
      )
      .setOrigin(0, 0);
  }

  private drawSectorChoices(
    entryRecommendedSectorIds: readonly SectorId[],
  ): void {
    this.add
      .text(96, 204, "SECTOR RADAR", {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);

    sectors.forEach((sector, index) => {
      const profile = getSectorMarketProfile(sector.id);
      const selected = this.pendingSectorId === sector.id;
      const recommended = entryRecommendedSectorIds.includes(sector.id);
      this.addSectorChoice(
        96,
        232 + index * 38,
        sector.displayName,
        recommended ? "추천" : profile.recommendation,
        selected,
        () => {
          this.scene.restart({ mode: this.mode, sectorId: sector.id });
        },
      );
    });

    this.add
      .text(
        96,
        552,
        `추천 섹터: ${entryRecommendedSectorIds
          .map((sectorId) =>
            getCompactSectorName(getSectorById(sectorId).displayName),
          )
          .join(" / ")}`,
        {
          color: "#a8c0c4",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          wordWrap: { width: 250 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawAssetChoices(): void {
    this.add
      .text(382, 204, "TARGET SHORTLIST", {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);

    getAssetsBySector(this.pendingSectorId).forEach((asset, index) => {
      const selected = this.pendingAssetId === asset.id;
      const assetProfile = getAssetMarketProfile(asset.id);
      this.addAssetChoiceCard(
        382,
        232 + index * 112,
        `${asset.displayName} · ${getAssetRoleLabel(assetProfile.role)}`,
        `${asset.shortBriefing}\n기본대금 ${formatTradeValue(getAssetBaselineTradeValue(asset))}`,
        selected,
        () => {
          this.scene.restart({
            mode: this.mode,
            sectorId: this.pendingSectorId,
            assetId: asset.id,
          });
        },
      );
    });
  }

  private drawAssetMemo(
    selectedSectorName: string,
    selectedAsset: ReturnType<typeof getAssetById>,
    selectedAssetProfile: ReturnType<typeof getAssetMarketProfile>,
    isNextDayAssetSelection: boolean,
  ): void {
    this.add
      .rectangle(790, 204, 394, 300, 0x090d10, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x2d4650);
    this.add
      .text(816, 230, "OBSERVATION MEMO", {
        color: "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "15px",
      })
      .setOrigin(0, 0);
    this.add
      .text(816, 264, selectedAsset.displayName, {
        color: "#f2fbfc",
        fontFamily: this.fontFamily,
        fontSize: "28px",
      })
      .setOrigin(0, 0);
    this.add
      .text(816, 308, `섹터: ${selectedSectorName}`, {
        color: "#7df3e7",
        fontFamily: this.fontFamily,
        fontSize: "16px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        816,
        340,
        [
          `체급: ${getAssetRoleLabel(selectedAssetProfile.role)} / 기본대금 ${formatTradeValue(
            getAssetBaselineTradeValue(selectedAsset),
          )}`,
          `뉴스 반응: ${getNewsSensitivityLabel(getAssetNewsSensitivity(selectedAsset))}`,
        ].join("\n"),
        {
          color: "#2dd4bf",
          fontFamily: this.fontFamily,
          fontSize: "14px",
          lineSpacing: 5,
          wordWrap: { width: 300 },
        },
      )
      .setOrigin(0, 0);
    this.add
      .text(
        816,
        isNextDayAssetSelection ? 382 : 392,
        selectedAsset.shortBriefing,
        {
          color: "#c2d0d3",
          fontFamily: this.fontFamily,
          fontSize: isNextDayAssetSelection ? "15px" : "17px",
          lineSpacing: isNextDayAssetSelection ? 6 : 8,
          wordWrap: { width: 300 },
        },
      )
      .setOrigin(0, 0);

    if (isNextDayAssetSelection) {
      this.drawRunContinuityPanel(gameSession.ensureRun());
      return;
    }

    this.drawDiscoveryRulePanel();
  }

  private drawDiscoveryRulePanel(): void {
    this.add
      .rectangle(812, 438, 346, 48, 0x151b1f, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(828, 447, "DISCOVERY RULE", {
        color: "#7df3e7",
        fontFamily: this.fontFamily,
        fontSize: "11px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        828,
        464,
        [
          "공개: 체급·기본대금·뉴스 반응",
          "관찰: 내부 성향·감시/예산 효율",
        ].join("\n"),
        {
          color: "#2dd4bf",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          lineSpacing: 2,
          wordWrap: { width: 306 },
        },
      )
      .setOrigin(0, 0);
  }

  private drawRunContinuityPanel(runState: RunState): void {
    this.add
      .rectangle(812, 432, 346, 54, 0x151b1f, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x263038);
    this.add
      .text(828, 442, "RUN CARRYOVER", {
        color: "#7df3e7",
        fontFamily: this.fontFamily,
        fontSize: "11px",
      })
      .setOrigin(0, 0);
    this.add
      .text(
        828,
        460,
        [
          `DAY ${runState.currentDay} · 예산 ${formatNumber(runState.budget)}B · 보유 0%`,
          `누적 ${formatSignedPercent(runState.cumulativeProfit)} · 감시 ${formatNumber(
            runState.surveillance,
          )} · 사회비용 ${formatNumber(runState.socialCost)}`,
        ].join("\n"),
        {
          color: "#2dd4bf",
          fontFamily: this.fontFamily,
          fontSize: "12px",
          lineSpacing: 2,
          wordWrap: { width: 306 },
        },
      )
      .setOrigin(0, 0);
  }

  private addPrimaryStartButton(isNextDayAssetSelection: boolean): void {
    const button = this.add
      .text(
        790,
        536,
        `[ ${isNextDayAssetSelection ? "다음 Day 준비" : "Run 시작"} ]`,
        {
          color: "#071015",
          backgroundColor: "#2dd4bf",
          fontFamily: this.fontFamily,
          fontSize: "22px",
          padding: { x: 20, y: 12 },
        },
      )
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setBackgroundColor("#f2fbfc");
    });
    button.on("pointerout", () => {
      button.setBackgroundColor("#2dd4bf");
    });
    button.on("pointerup", () => {
      if (isNextDayAssetSelection) {
        gameSession.selectNextDayAsset(this.pendingAssetId);
      } else {
        gameSession.setSelectedAsset(this.pendingAssetId);
        gameSession.startNewRun();
        gameSession.beginDay();
      }

      this.scene.start(SceneKeys.PreOpenCard);
    });
  }

  private addSectorChoice(
    x: number,
    y: number,
    label: string,
    meta: string,
    selected: boolean,
    onClick: () => void,
  ): void {
    const background = this.add
      .rectangle(
        x,
        y,
        248,
        30,
        selected ? 0x273e2f : 0x151b1f,
        selected ? 0.96 : 0.88,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0x2dd4bf : 0x263038);
    const labelText = this.add
      .text(x + 12, y + 7, label, {
        color: selected ? "#f2fbfc" : "#c2d0d3",
        fontFamily: this.fontFamily,
        fontSize: "14px",
      })
      .setOrigin(0, 0);
    const metaText = this.add
      .text(x + 184, y + 7, meta, {
        color: selected ? "#2dd4bf" : "#a8c0c4",
        fontFamily: this.fontFamily,
        fontSize: "12px",
      })
      .setOrigin(0, 0);

    [background, labelText, metaText].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", onClick);
    });
  }

  private addAssetChoiceCard(
    x: number,
    y: number,
    title: string,
    body: string,
    selected: boolean,
    onClick: () => void,
  ): void {
    const background = this.add
      .rectangle(
        x,
        y,
        330,
        90,
        selected ? 0x273e2f : 0x151b1f,
        selected ? 0.95 : 0.9,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, selected ? 0x2dd4bf : 0x263038);
    const titleText = this.add
      .text(x + 16, y + 12, title, {
        color: selected ? "#f2fbfc" : "#2dd4bf",
        fontFamily: this.fontFamily,
        fontSize: "18px",
      })
      .setOrigin(0, 0);
    const bodyText = this.add
      .text(x + 16, y + 42, body, {
        color: "#c2d0d3",
        fontFamily: this.fontFamily,
        fontSize: "13px",
        wordWrap: { width: 292 },
      })
      .setOrigin(0, 0);

    [background, titleText, bodyText].forEach((object) => {
      object.setInteractive({ useHandCursor: true });
      object.on("pointerup", onClick);
    });
  }
}

function getAssetRoleLabel(
  role: ReturnType<typeof getAssetMarketProfile>["role"],
): string {
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

function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}%`;
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
