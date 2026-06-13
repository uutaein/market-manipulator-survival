import { assets, getAssetById, getAssetsBySector, sectors, type AssetId, type SectorId } from "../assets/assetCatalog";
import { autoCardIds, runDefaults, type AutoCardId } from "../balancing/runDefaults";
import { createSeededRandom } from "../random/SeededRandom";

export type AssetTendency = "stable" | "standard" | "high_risk";
export type RunStatus = "active" | "failed" | "completed";
export type RunPhase =
  | "main_menu"
  | "run_setup"
  | "morning_news"
  | "market_briefing"
  | "pre_open_card"
  | "opening_approval"
  | "intraday"
  | "document_event"
  | "day_settlement"
  | "final_settlement"
  | "run_failed";

export interface AutoCardState {
  readonly cardId: AutoCardId;
  readonly level: 1 | 2 | 3;
}

export type RunAssetProfiles = Record<SectorId, Partial<Record<AssetId, AssetTendency>>>;

export interface RunState {
  readonly runId: string;
  readonly runSeed: string;
  readonly runStatus: RunStatus;
  readonly phase: RunPhase;
  readonly currentDay: number;
  readonly selectedSectorId: SectorId;
  readonly selectedAssetId: AssetId;
  readonly runAssetProfiles: RunAssetProfiles;
  readonly budget: number;
  readonly cumulativeProfit: number;
  readonly holdingRatio: number;
  readonly surveillance: number;
  readonly socialCost: number;
  readonly autoCards: readonly AutoCardState[];
  readonly marketAftereffects: readonly string[];
  readonly dayResults: readonly string[];
  readonly failedReason: string | null;
}

export interface CreateRunStateOptions {
  readonly runSeed?: string;
  readonly selectedSectorId?: SectorId;
  readonly selectedAssetId?: AssetId;
}

const assetTendencies = ["stable", "standard", "high_risk"] as const;

export function createRunState(options: CreateRunStateOptions = {}): RunState {
  const runSeed = options.runSeed ?? createRunSeed();
  const selectedSectorId = options.selectedSectorId ?? sectors[0].id;
  const selectedAssetId = options.selectedAssetId ?? getAssetsBySector(selectedSectorId)[0].id;
  const selectedAsset = getAssetById(selectedAssetId);

  if (selectedAsset.sectorId !== selectedSectorId) {
    throw new Error(`Selected asset ${selectedAssetId} does not belong to sector ${selectedSectorId}`);
  }

  const random = createSeededRandom(runSeed);
  const startingCard = random.fork("starting-auto-card").pick(autoCardIds);

  return {
    runId: `run_${runSeed}`,
    runSeed,
    runStatus: "active",
    phase: "run_setup",
    currentDay: 1,
    selectedSectorId,
    selectedAssetId,
    runAssetProfiles: assignRunAssetProfiles(runSeed),
    budget: runDefaults.startingBudget,
    cumulativeProfit: 0,
    holdingRatio: runDefaults.initialHoldingRatio,
    surveillance: runDefaults.initialSurveillance,
    socialCost: 0,
    autoCards: [{ cardId: startingCard, level: 1 }],
    marketAftereffects: [],
    dayResults: [],
    failedReason: null
  };
}

export function restartRunWithSameSeed(previousRun: RunState): RunState {
  return createRunState({
    runSeed: previousRun.runSeed,
    selectedSectorId: previousRun.selectedSectorId,
    selectedAssetId: previousRun.selectedAssetId
  });
}

export function assignRunAssetProfiles(runSeed: string): RunAssetProfiles {
  const profiles = {} as RunAssetProfiles;

  for (const sector of sectors) {
    const random = createSeededRandom(`${runSeed}:asset-profile:${sector.id}`);
    const shuffledTendencies = random.shuffle(assetTendencies);
    const sectorProfiles: Partial<Record<AssetId, AssetTendency>> = {};
    const sectorAssets = getAssetsBySector(sector.id);

    for (const [index, asset] of sectorAssets.entries()) {
      sectorProfiles[asset.id] = shuffledTendencies[index];
    }

    profiles[sector.id] = sectorProfiles;
  }

  return profiles;
}

export function getSectorTendencies(
  profiles: RunAssetProfiles,
  sectorId: SectorId
): readonly AssetTendency[] {
  return Object.values(profiles[sectorId]);
}

export function hasOneOfEachTendency(profiles: RunAssetProfiles, sectorId: SectorId): boolean {
  const tendencies = new Set(getSectorTendencies(profiles, sectorId));
  return assetTendencies.every((tendency) => tendencies.has(tendency));
}

export function isValidRunAssetProfiles(profiles: RunAssetProfiles): boolean {
  return sectors.every((sector) => hasOneOfEachTendency(profiles, sector.id));
}

export function isFictionalCatalogComplete(): boolean {
  return sectors.length === 8 && assets.length === 24 && sectors.every((sector) => getAssetsBySector(sector.id).length === 3);
}

export function createRunSeed(): string {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `mms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
