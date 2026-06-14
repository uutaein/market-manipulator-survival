import {
  getAssetById,
  getAssetsBySector,
  getSectorById,
  sectors,
  type AssetDefinition,
  type AssetId,
  type SectorDefinition,
  type SectorId
} from "../assets/assetCatalog";
import {
  getAssetBaselineTradeValue,
  getAssetNewsSensitivity,
  getSectorBaselineTradeValue
} from "../assets/assetMarketProfiles";
import { newsPricePressure } from "../balancing/priceTickValues";
import { runDefaults } from "../balancing/runDefaults";
import type { DayState } from "../day/daySetup";
import type { MorningNews } from "../day/morningNews";
import { createSeededRandom } from "../random/SeededRandom";
import type { RunState } from "../run/runState";
import { clamp } from "../intraday/intradayState";

export type MarketBoardRole = "player" | "same_sector_peer" | "sector_average";
export type MarketBoardCalculationMode = "detailed" | "simplified" | "sector_average";
export type MarketBoardTrend = "up" | "down" | "flat";
export type MarketBoardStatus = "normal" | "overheated" | "panic";
export type MarketBoardNewsBadge = "market" | "sector" | "asset" | null;
export type MarketBoardNewsTone = "positive" | "negative" | null;

export interface MarketBoardEntryBase {
  readonly displayName: string;
  readonly sectorId: SectorId;
  readonly sectorName: string;
  readonly role: MarketBoardRole;
  readonly calculationMode: MarketBoardCalculationMode;
  readonly newsBadge: MarketBoardNewsBadge;
  readonly newsTone: MarketBoardNewsTone;
  readonly baselineTradeValue: number;
}

export interface PlayerMarketBoardEntry extends MarketBoardEntryBase {
  readonly assetId: AssetId;
  readonly role: "player";
  readonly calculationMode: "detailed";
  readonly usesDetailedPlayerState: true;
}

export interface SameSectorPeerMarketBoardEntry extends MarketBoardEntryBase {
  readonly assetId: AssetId;
  readonly role: "same_sector_peer";
  readonly calculationMode: "simplified";
  readonly usesDetailedPlayerState: false;
  readonly simplifiedMovement: true;
  readonly referencePrice: number;
  readonly averageEntryPrice: number;
  readonly currentPrice: number;
  readonly priceChangePercent: number;
  readonly trend: MarketBoardTrend;
  readonly status: MarketBoardStatus;
}

export interface SectorAverageMarketBoardEntry extends MarketBoardEntryBase {
  readonly role: "sector_average";
  readonly calculationMode: "sector_average";
  readonly usesDetailedPlayerState: false;
  readonly simplifiedMovement: true;
  readonly sectorAverage: true;
  readonly referencePrice: number;
  readonly averageEntryPrice: number;
  readonly currentPrice: number;
  readonly priceChangePercent: number;
  readonly trend: MarketBoardTrend;
  readonly status: MarketBoardStatus;
}

export type NonPlayerMarketBoardEntry = SameSectorPeerMarketBoardEntry | SectorAverageMarketBoardEntry;
export type MarketBoardEntry = PlayerMarketBoardEntry | NonPlayerMarketBoardEntry;

export interface MarketBoardState {
  readonly entries: readonly MarketBoardEntry[];
  readonly displayedAssetIds: readonly AssetId[];
  readonly displayedSectorIds: readonly SectorId[];
  readonly playerAssetId: AssetId;
  readonly sameSectorPeerSummaries: readonly SameSectorPeerMarketBoardEntry[];
  readonly sectorAverageSummaries: readonly SectorAverageMarketBoardEntry[];
  readonly nonPlayerAssetSummaries: readonly NonPlayerMarketBoardEntry[];
}

export function buildMarketBoard(runState: RunState, dayState: DayState): MarketBoardState {
  const selectedAsset = getAssetById(runState.selectedAssetId);
  const selectedSectorAssets = getAssetsBySector(runState.selectedSectorId);
  const entries: MarketBoardEntry[] = [createPlayerEntry(selectedAsset, dayState.morningNewsItems)];

  for (const peer of selectedSectorAssets) {
    if (peer.id === selectedAsset.id) {
      continue;
    }

    entries.push(createSameSectorPeerEntry(peer, runState, dayState, entries.length));
  }

  for (const sector of sectors) {
    if (sector.id === runState.selectedSectorId) {
      continue;
    }

    entries.push(createSectorAverageEntry(sector, runState, dayState, entries.length));
  }

  return {
    entries,
    displayedAssetIds: entries.filter(hasAssetId).map((entry) => entry.assetId),
    displayedSectorIds: entries.map((entry) => entry.sectorId),
    playerAssetId: selectedAsset.id,
    sameSectorPeerSummaries: entries.filter(isSameSectorPeerEntry),
    sectorAverageSummaries: entries.filter(isSectorAverageEntry),
    nonPlayerAssetSummaries: entries.filter(isNonPlayerEntry)
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

    const delta =
      entry.role === "same_sector_peer"
        ? calculateSimplifiedPriceDelta(getAssetById(entry.assetId), runState, dayState, index, tickIndex)
        : calculateSectorAverageDelta(entry.sectorId, runState, dayState, index, tickIndex);
    const priceChangePercent = round2(clamp(entry.priceChangePercent + delta, -30, 30));

    return {
      ...entry,
      currentPrice: calculateCurrentBoardPrice(entry.referencePrice, priceChangePercent),
      priceChangePercent,
      trend: getTrend(priceChangePercent),
      status: getStatus(priceChangePercent)
    };
  });

  return {
    entries,
    displayedAssetIds: entries.filter(hasAssetId).map((entry) => entry.assetId),
    displayedSectorIds: entries.map((entry) => entry.sectorId),
    playerAssetId: state.playerAssetId,
    sameSectorPeerSummaries: entries.filter(isSameSectorPeerEntry),
    sectorAverageSummaries: entries.filter(isSectorAverageEntry),
    nonPlayerAssetSummaries: entries.filter(isNonPlayerEntry)
  };
}

export function isNonPlayerEntry(entry: MarketBoardEntry): entry is NonPlayerMarketBoardEntry {
  return entry.role === "same_sector_peer" || entry.role === "sector_average";
}

export function isSameSectorPeerEntry(entry: MarketBoardEntry): entry is SameSectorPeerMarketBoardEntry {
  return entry.role === "same_sector_peer";
}

export function isSectorAverageEntry(entry: MarketBoardEntry): entry is SectorAverageMarketBoardEntry {
  return entry.role === "sector_average";
}

function hasAssetId(entry: MarketBoardEntry): entry is PlayerMarketBoardEntry | SameSectorPeerMarketBoardEntry {
  return "assetId" in entry;
}

function createPlayerEntry(asset: AssetDefinition, morningNewsItems: readonly MorningNews[]): PlayerMarketBoardEntry {
  return {
    assetId: asset.id,
    displayName: asset.displayName,
    sectorId: asset.sectorId,
    sectorName: getSectorById(asset.sectorId).displayName,
    role: "player",
    calculationMode: "detailed",
    newsBadge: getNewsBadge(asset, morningNewsItems),
    newsTone: getNewsTone(asset, morningNewsItems),
    baselineTradeValue: getAssetBaselineTradeValue(asset),
    usesDetailedPlayerState: true
  };
}

function createSameSectorPeerEntry(
  asset: AssetDefinition,
  runState: RunState,
  dayState: DayState,
  slotIndex: number
): SameSectorPeerMarketBoardEntry {
  const priceChangePercent = runDefaults.initialPriceChangePercent;
  const quote = createAssetBoardQuote(asset, runState, dayState, slotIndex, priceChangePercent);

  return {
    assetId: asset.id,
    displayName: asset.displayName,
    sectorId: asset.sectorId,
    sectorName: getSectorById(asset.sectorId).displayName,
    role: "same_sector_peer",
    calculationMode: "simplified",
    newsBadge: getNewsBadge(asset, dayState.morningNewsItems),
    newsTone: getNewsTone(asset, dayState.morningNewsItems),
    baselineTradeValue: getAssetBaselineTradeValue(asset),
    usesDetailedPlayerState: false,
    simplifiedMovement: true,
    referencePrice: quote.referencePrice,
    averageEntryPrice: quote.averageEntryPrice,
    currentPrice: quote.currentPrice,
    priceChangePercent,
    trend: getTrend(priceChangePercent),
    status: getStatus(priceChangePercent)
  };
}

function createSectorAverageEntry(
  sector: SectorDefinition,
  runState: RunState,
  dayState: DayState,
  slotIndex: number
): SectorAverageMarketBoardEntry {
  const priceChangePercent = runDefaults.initialPriceChangePercent;
  const quote = createSectorAverageBoardQuote(sector.id, runState, dayState, slotIndex, priceChangePercent);

  return {
    displayName: `${sector.displayName} 섹터`,
    sectorId: sector.id,
    sectorName: sector.displayName,
    role: "sector_average",
    calculationMode: "sector_average",
    newsBadge: getSectorAverageNewsBadge(sector.id, dayState.morningNewsItems),
    newsTone: getSectorAverageNewsTone(sector.id, dayState.morningNewsItems),
    baselineTradeValue: getSectorBaselineTradeValue(sector.id),
    usesDetailedPlayerState: false,
    simplifiedMovement: true,
    sectorAverage: true,
    referencePrice: quote.referencePrice,
    averageEntryPrice: quote.averageEntryPrice,
    currentPrice: quote.currentPrice,
    priceChangePercent,
    trend: getTrend(priceChangePercent),
    status: getStatus(priceChangePercent)
  };
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
  const newsSensitivity = getAssetNewsSensitivity(asset);
  const trendBias = random.next() * 0.16 - 0.08;
  const simplifiedVolatility = 35 + dayState.todayCondition.volatilityShiftPercent;
  const randomNoise = (random.next() * 2 - 1) * (0.04 + simplifiedVolatility * 0.002);
  const rawDelta = (sectorNewsPressure * newsSensitivity + marketNewsPressure) * 12 + trendBias + randomNoise;

  return round2(clamp(rawDelta, -0.9, 0.9));
}

function calculateSectorAverageDelta(
  sectorId: SectorId,
  runState: RunState,
  dayState: DayState,
  slotIndex: number,
  tickIndex: number
): number {
  const sectorAssets = getAssetsBySector(sectorId);
  const total = sectorAssets.reduce(
    (sum, asset, index) => sum + calculateSimplifiedPriceDelta(asset, runState, dayState, slotIndex + index, tickIndex),
    0
  );

  return round2(total / sectorAssets.length);
}

function getSectorNewsPressure(asset: AssetDefinition, dayState: DayState): number {
  return dayState.morningNewsItems.reduce((total, news) => {
    const target = news.target;
    const pressure = newsPricePressure[news.templateId];

    if (target.type === "sector" && target.sectorId === asset.sectorId) {
      return total + pressure;
    }

    if (target.type === "asset" && target.assetId === asset.id) {
      return total + pressure;
    }

    return total;
  }, 0);
}

function getMarketNewsPressure(dayState: DayState): number {
  return dayState.morningNewsItems.reduce(
    (total, news) => (news.target.type === "market" ? total + newsPricePressure[news.templateId] * 0.6 : total),
    0
  );
}

function getNewsBadge(asset: AssetDefinition, morningNewsItems: readonly MorningNews[]): MarketBoardNewsBadge {
  if (morningNewsItems.some((news) => news.target.type === "asset" && news.target.assetId === asset.id)) {
    return "asset";
  }

  if (morningNewsItems.some((news) => news.target.type === "sector" && news.target.sectorId === asset.sectorId)) {
    return "sector";
  }

  if (morningNewsItems.some((news) => news.target.type === "market")) {
    return "market";
  }

  return null;
}

function getNewsTone(asset: AssetDefinition, morningNewsItems: readonly MorningNews[]): MarketBoardNewsTone {
  const assetNews = morningNewsItems.find((news) => news.target.type === "asset" && news.target.assetId === asset.id);

  if (assetNews) {
    return getNewsToneByTemplate(assetNews.templateId);
  }

  const sectorNews = morningNewsItems.find((news) => news.target.type === "sector" && news.target.sectorId === asset.sectorId);

  if (sectorNews) {
    return getNewsToneByTemplate(sectorNews.templateId);
  }

  const marketNews = morningNewsItems.find((news) => news.target.type === "market");

  return marketNews ? getNewsToneByTemplate(marketNews.templateId) : null;
}

function getSectorAverageNewsBadge(sectorId: SectorId, morningNewsItems: readonly MorningNews[]): MarketBoardNewsBadge {
  if (morningNewsItems.some((news) => news.target.type === "asset" && news.target.sectorId === sectorId)) {
    return "asset";
  }

  if (morningNewsItems.some((news) => news.target.type === "sector" && news.target.sectorId === sectorId)) {
    return "sector";
  }

  if (morningNewsItems.some((news) => news.target.type === "market")) {
    return "market";
  }

  return null;
}

function getSectorAverageNewsTone(sectorId: SectorId, morningNewsItems: readonly MorningNews[]): MarketBoardNewsTone {
  const sectorNews = morningNewsItems.find((news) => news.target.type === "sector" && news.target.sectorId === sectorId);

  if (sectorNews) {
    return getNewsToneByTemplate(sectorNews.templateId);
  }

  const assetNews = morningNewsItems.find((news) => news.target.type === "asset" && news.target.sectorId === sectorId);

  if (assetNews) {
    return getNewsToneByTemplate(assetNews.templateId);
  }

  const marketNews = morningNewsItems.find((news) => news.target.type === "market");

  return marketNews ? getNewsToneByTemplate(marketNews.templateId) : null;
}

function getNewsToneByTemplate(templateId: MorningNews["templateId"]): MarketBoardNewsTone {
  if (templateId === "sector_positive_catalyst" || templateId === "overheat_spread") {
    return "positive";
  }

  return "negative";
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

function createAssetBoardQuote(
  asset: AssetDefinition,
  runState: RunState,
  dayState: DayState,
  slotIndex: number,
  priceChangePercent: number
): { readonly referencePrice: number; readonly averageEntryPrice: number; readonly currentPrice: number } {
  const random = createSeededRandom(`${runState.runSeed}:day:${dayState.dayIndex}:market-board-quote:${asset.id}:${slotIndex}`);
  const referencePrice = roundedToTick(
    random.nextInt(runDefaults.openingPriceMin, runDefaults.openingPriceMax + runDefaults.openingPriceTick),
    runDefaults.openingPriceTick
  );
  const averageEntryPrice = roundedToTick(referencePrice * (0.98 + random.next() * 0.04), runDefaults.openingPriceTick);

  return {
    referencePrice,
    averageEntryPrice,
    currentPrice: calculateCurrentBoardPrice(referencePrice, priceChangePercent)
  };
}

function createSectorAverageBoardQuote(
  sectorId: SectorId,
  runState: RunState,
  dayState: DayState,
  slotIndex: number,
  priceChangePercent: number
): { readonly referencePrice: number; readonly averageEntryPrice: number; readonly currentPrice: number } {
  const sectorAssets = getAssetsBySector(sectorId);
  const quotes = sectorAssets.map((asset, index) =>
    createAssetBoardQuote(asset, runState, dayState, slotIndex + index, priceChangePercent)
  );
  const referencePrice = roundedToTick(getAverage(quotes.map((quote) => quote.referencePrice)), runDefaults.openingPriceTick);
  const averageEntryPrice = roundedToTick(
    getAverage(quotes.map((quote) => quote.averageEntryPrice)),
    runDefaults.openingPriceTick
  );

  return {
    referencePrice,
    averageEntryPrice,
    currentPrice: calculateCurrentBoardPrice(referencePrice, priceChangePercent)
  };
}

function calculateCurrentBoardPrice(referencePrice: number, priceChangePercent: number): number {
  return roundedToTick(referencePrice * (1 + priceChangePercent / 100), runDefaults.openingPriceTick);
}

function getAverage(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / Math.max(1, values.length);
}

function roundedToTick(value: number, tick: number): number {
  return Math.max(tick, Math.round(value / tick) * tick);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
