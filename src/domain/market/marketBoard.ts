import {
  assets,
  getAssetById,
  getAssetsBySector,
  getSectorById,
  sectors,
  type AssetDefinition,
  type AssetId,
  type SectorId
} from "../assets/assetCatalog";
import { newsPricePressure } from "../balancing/priceTickValues";
import type { DayState } from "../day/daySetup";
import type { MorningNewsTarget } from "../day/morningNews";
import { createSeededRandom } from "../random/SeededRandom";
import type { RunState } from "../run/runState";
import { clamp } from "../intraday/intradayState";

export type MarketBoardRole = "player" | "same_sector_peer" | "representative";
export type MarketBoardCalculationMode = "detailed" | "simplified";
export type MarketBoardTrend = "up" | "down" | "flat";
export type MarketBoardStatus = "normal" | "overheated" | "panic";
export type MarketBoardNewsBadge = "market" | "sector" | "asset" | null;

export interface MarketBoardEntryBase {
  readonly assetId: AssetId;
  readonly displayName: string;
  readonly sectorId: SectorId;
  readonly sectorName: string;
  readonly role: MarketBoardRole;
  readonly calculationMode: MarketBoardCalculationMode;
  readonly newsBadge: MarketBoardNewsBadge;
}

export interface PlayerMarketBoardEntry extends MarketBoardEntryBase {
  readonly role: "player";
  readonly calculationMode: "detailed";
  readonly usesDetailedPlayerState: true;
}

export interface NonPlayerMarketBoardEntry extends MarketBoardEntryBase {
  readonly role: "same_sector_peer" | "representative";
  readonly calculationMode: "simplified";
  readonly usesDetailedPlayerState: false;
  readonly simplifiedMovement: true;
  readonly priceChangePercent: number;
  readonly trend: MarketBoardTrend;
  readonly status: MarketBoardStatus;
}

export type MarketBoardEntry = PlayerMarketBoardEntry | NonPlayerMarketBoardEntry;

export interface MarketBoardState {
  readonly entries: readonly MarketBoardEntry[];
  readonly displayedAssetIds: readonly AssetId[];
  readonly playerAssetId: AssetId;
  readonly nonPlayerAssetSummaries: readonly NonPlayerMarketBoardEntry[];
}

export function buildMarketBoard(runState: RunState, dayState: DayState): MarketBoardState {
  const selectedAsset = getAssetById(runState.selectedAssetId);
  const selectedSectorAssets = getAssetsBySector(runState.selectedSectorId);
  const selectedIds = new Set<AssetId>([selectedAsset.id]);
  const entries: MarketBoardEntry[] = [createPlayerEntry(selectedAsset, dayState.morningNews.target)];

  for (const peer of selectedSectorAssets) {
    if (peer.id === selectedAsset.id) {
      continue;
    }

    selectedIds.add(peer.id);
    entries.push(createNonPlayerEntry(peer, "same_sector_peer", runState, dayState, entries.length));
  }

  for (const representative of selectRepresentativeAssets(runState, dayState, selectedIds)) {
    selectedIds.add(representative.id);
    entries.push(createNonPlayerEntry(representative, "representative", runState, dayState, entries.length));
  }

  const slicedEntries = entries.slice(0, 8);

  return {
    entries: slicedEntries,
    displayedAssetIds: slicedEntries.map((entry) => entry.assetId),
    playerAssetId: selectedAsset.id,
    nonPlayerAssetSummaries: slicedEntries.filter(isNonPlayerEntry)
  };
}

export function advanceMarketBoard(
  state: MarketBoardState,
  runState: RunState,
  dayState: DayState,
  tickIndex: number
): MarketBoardState {
  const entries = state.entries.map((entry, index) => {
    if (!isNonPlayerEntry(entry)) {
      return entry;
    }

    const asset = getAssetById(entry.assetId);
    const delta = calculateSimplifiedPriceDelta(asset, runState, dayState, index, tickIndex);
    const priceChangePercent = round2(clamp(entry.priceChangePercent + delta, -30, 30));

    return {
      ...entry,
      priceChangePercent,
      trend: getTrend(priceChangePercent),
      status: getStatus(priceChangePercent)
    };
  });

  return {
    entries,
    displayedAssetIds: entries.map((entry) => entry.assetId),
    playerAssetId: state.playerAssetId,
    nonPlayerAssetSummaries: entries.filter(isNonPlayerEntry)
  };
}

export function isNonPlayerEntry(entry: MarketBoardEntry): entry is NonPlayerMarketBoardEntry {
  return entry.calculationMode === "simplified";
}

function selectRepresentativeAssets(
  runState: RunState,
  dayState: DayState,
  selectedIds: ReadonlySet<AssetId>
): readonly AssetDefinition[] {
  const random = createSeededRandom(`${runState.runSeed}:day:${dayState.dayIndex}:market-board`);
  const representatives: AssetDefinition[] = [];

  addNewsAffectedRepresentative(representatives, selectedIds, runState, dayState, random);

  const candidateSectors = random.shuffle(
    sectors.filter((sector) => sector.id !== runState.selectedSectorId)
  );

  for (const sector of candidateSectors) {
    if (representatives.length >= 5) {
      break;
    }

    if (representatives.some((asset) => asset.sectorId === sector.id)) {
      continue;
    }

    const sectorCandidates = getAssetsBySector(sector.id).filter(
      (asset) => !selectedIds.has(asset.id) && !representatives.some((representative) => representative.id === asset.id)
    );

    if (sectorCandidates.length > 0) {
      representatives.push(random.pick(sectorCandidates));
    }
  }

  if (representatives.length < 5) {
    const remainingAssets = random.shuffle(
      assets.filter(
        (asset) => !selectedIds.has(asset.id) && !representatives.some((representative) => representative.id === asset.id)
      )
    );

    representatives.push(...remainingAssets.slice(0, 5 - representatives.length));
  }

  return representatives.slice(0, 5);
}

function addNewsAffectedRepresentative(
  representatives: AssetDefinition[],
  selectedIds: ReadonlySet<AssetId>,
  runState: RunState,
  dayState: DayState,
  random: ReturnType<typeof createSeededRandom>
): void {
  const target = dayState.morningNews.target;

  if (target.type === "market") {
    return;
  }

  if (target.type === "asset") {
    if (target.assetId !== runState.selectedAssetId && !selectedIds.has(target.assetId)) {
      representatives.push(getAssetById(target.assetId));
    }
    return;
  }

  if (target.sectorId === runState.selectedSectorId) {
    return;
  }

  const candidates = getAssetsBySector(target.sectorId).filter((asset) => !selectedIds.has(asset.id));

  if (candidates.length > 0) {
    representatives.push(random.pick(candidates));
  }
}

function createPlayerEntry(asset: AssetDefinition, target: MorningNewsTarget): PlayerMarketBoardEntry {
  return {
    assetId: asset.id,
    displayName: asset.displayName,
    sectorId: asset.sectorId,
    sectorName: getSectorById(asset.sectorId).displayName,
    role: "player",
    calculationMode: "detailed",
    newsBadge: getNewsBadge(asset, target),
    usesDetailedPlayerState: true
  };
}

function createNonPlayerEntry(
  asset: AssetDefinition,
  role: "same_sector_peer" | "representative",
  runState: RunState,
  dayState: DayState,
  slotIndex: number
): NonPlayerMarketBoardEntry {
  const priceChangePercent = calculateSimplifiedPriceChange(asset, runState, dayState, slotIndex);

  return {
    assetId: asset.id,
    displayName: asset.displayName,
    sectorId: asset.sectorId,
    sectorName: getSectorById(asset.sectorId).displayName,
    role,
    calculationMode: "simplified",
    newsBadge: getNewsBadge(asset, dayState.morningNews.target),
    usesDetailedPlayerState: false,
    simplifiedMovement: true,
    priceChangePercent,
    trend: getTrend(priceChangePercent),
    status: getStatus(priceChangePercent)
  };
}

function calculateSimplifiedPriceChange(
  asset: AssetDefinition,
  runState: RunState,
  dayState: DayState,
  slotIndex: number
): number {
  const random = createSeededRandom(`${runState.runSeed}:day:${dayState.dayIndex}:market-board:${asset.id}:${slotIndex}`);
  const sectorNewsPressure = getSectorNewsPressure(asset, dayState);
  const marketNewsPressure = getMarketNewsPressure(dayState);
  const trendBias = random.next() * 0.02 - 0.01;
  const simplifiedVolatility = 35 + dayState.todayCondition.volatilityShiftPercent;
  const randomNoise = (random.next() * 2 - 1) * (0.02 + simplifiedVolatility * 0.0008);
  const rawDelta = sectorNewsPressure + marketNewsPressure + trendBias + randomNoise;

  return round2(clamp(rawDelta, -0.25, 0.25));
}

function calculateSimplifiedPriceDelta(
  asset: AssetDefinition,
  runState: RunState,
  dayState: DayState,
  slotIndex: number,
  tickIndex: number
): number {
  const random = createSeededRandom(
    `${runState.runSeed}:day:${dayState.dayIndex}:market-board:${asset.id}:${slotIndex}:tick:${tickIndex}`
  );
  const sectorNewsPressure = getSectorNewsPressure(asset, dayState) * 0.3;
  const marketNewsPressure = getMarketNewsPressure(dayState) * 0.3;
  const trendBias = random.next() * 0.02 - 0.01;
  const simplifiedVolatility = 35 + dayState.todayCondition.volatilityShiftPercent;
  const randomNoise = (random.next() * 2 - 1) * (0.02 + simplifiedVolatility * 0.0008);
  const rawDelta = sectorNewsPressure + marketNewsPressure + trendBias + randomNoise;

  return round2(clamp(rawDelta, -0.25, 0.25));
}

function getSectorNewsPressure(asset: AssetDefinition, dayState: DayState): number {
  const target = dayState.morningNews.target;

  if (target.type === "sector" && target.sectorId === asset.sectorId) {
    return newsPricePressure[dayState.morningNews.templateId];
  }

  if (target.type === "asset" && target.assetId === asset.id) {
    return newsPricePressure[dayState.morningNews.templateId];
  }

  return 0;
}

function getMarketNewsPressure(dayState: DayState): number {
  if (dayState.morningNews.target.type !== "market") {
    return 0;
  }

  return newsPricePressure[dayState.morningNews.templateId] * 0.6;
}

function getNewsBadge(asset: AssetDefinition, target: MorningNewsTarget): MarketBoardNewsBadge {
  if (target.type === "market") {
    return "market";
  }

  if (target.type === "asset" && target.assetId === asset.id) {
    return "asset";
  }

  if (target.type === "sector" && target.sectorId === asset.sectorId) {
    return "sector";
  }

  return null;
}

function getTrend(priceChangePercent: number): MarketBoardTrend {
  if (priceChangePercent > 0.03) {
    return "up";
  }

  if (priceChangePercent < -0.03) {
    return "down";
  }

  return "flat";
}

function getStatus(priceChangePercent: number): MarketBoardStatus {
  if (priceChangePercent >= 0.12) {
    return "overheated";
  }

  if (priceChangePercent <= -0.12) {
    return "panic";
  }

  return "normal";
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
