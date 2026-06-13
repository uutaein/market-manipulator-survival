import {
  assets,
  sectors,
  type AssetDefinition,
  type AssetId,
  type SectorId
} from "./assetCatalog";

export type AssetMarketRole = "sector_leader" | "standard" | "theme_mover";
export type SectorCapitalTier = "entry" | "growth" | "large" | "speculative";

export interface SectorMarketProfile {
  readonly sectorId: SectorId;
  readonly baseTradeValue: number;
  readonly newsSensitivity: number;
  readonly capitalTier: SectorCapitalTier;
  readonly recommendation: string;
}

export interface AssetMarketProfile {
  readonly assetId: AssetId;
  readonly role: AssetMarketRole;
  readonly tradeValueMultiplier: number;
  readonly newsSensitivityMultiplier: number;
  readonly influenceResistance: number;
  readonly volumeStability: number;
}

const sectorMarketProfiles = {
  food_agri: {
    sectorId: "food_agri",
    baseTradeValue: 6800000,
    newsSensitivity: 1.06,
    capitalTier: "entry",
    recommendation: "초반 추천"
  },
  energy_grid: {
    sectorId: "energy_grid",
    baseTradeValue: 8600000,
    newsSensitivity: 0.96,
    capitalTier: "large",
    recommendation: "대형 체급"
  },
  bio_trial: {
    sectorId: "bio_trial",
    baseTradeValue: 5200000,
    newsSensitivity: 1.28,
    capitalTier: "speculative",
    recommendation: "고변동"
  },
  automation_ai: {
    sectorId: "automation_ai",
    baseTradeValue: 7600000,
    newsSensitivity: 1.18,
    capitalTier: "growth",
    recommendation: "성장 체급"
  },
  chip_equipment: {
    sectorId: "chip_equipment",
    baseTradeValue: 9400000,
    newsSensitivity: 0.92,
    capitalTier: "large",
    recommendation: "최대 체급"
  },
  payment_fintech: {
    sectorId: "payment_fintech",
    baseTradeValue: 7000000,
    newsSensitivity: 1.0,
    capitalTier: "entry",
    recommendation: "초반 추천"
  },
  media_game: {
    sectorId: "media_game",
    baseTradeValue: 6100000,
    newsSensitivity: 1.16,
    capitalTier: "entry",
    recommendation: "초반 추천"
  },
  meme_theme: {
    sectorId: "meme_theme",
    baseTradeValue: 4500000,
    newsSensitivity: 1.42,
    capitalTier: "speculative",
    recommendation: "고위험"
  }
} as const satisfies Record<SectorId, SectorMarketProfile>;

const roleProfiles = {
  sector_leader: {
    tradeValueMultiplier: 1.72,
    newsSensitivityMultiplier: 0.82,
    influenceResistance: 1.42,
    volumeStability: 0.9
  },
  standard: {
    tradeValueMultiplier: 1,
    newsSensitivityMultiplier: 1,
    influenceResistance: 1,
    volumeStability: 0.72
  },
  theme_mover: {
    tradeValueMultiplier: 0.58,
    newsSensitivityMultiplier: 1.55,
    influenceResistance: 0.76,
    volumeStability: 0.42
  }
} as const satisfies Record<AssetMarketRole, Omit<AssetMarketProfile, "assetId" | "role">>;

const assetMarketRoles = Object.fromEntries(
  sectors.flatMap((sector) =>
    assets
      .filter((asset) => asset.sectorId === sector.id)
      .map((asset, index) => [asset.id, index === 0 ? "sector_leader" : index === 1 ? "standard" : "theme_mover"])
  )
) as Record<AssetId, AssetMarketRole>;

export function getSectorMarketProfile(sectorId: SectorId): SectorMarketProfile {
  return sectorMarketProfiles[sectorId];
}

export function getEntryRecommendedSectorIds(): readonly SectorId[] {
  return sectors
    .filter((sector) => getSectorMarketProfile(sector.id).capitalTier === "entry")
    .map((sector) => sector.id);
}

export function getNextLargerSectorId(sectorId: SectorId): SectorId | null {
  const currentProfile = getSectorMarketProfile(sectorId);
  const nextSector = [...sectors]
    .map((sector) => getSectorMarketProfile(sector.id))
    .filter((profile) => profile.baseTradeValue > currentProfile.baseTradeValue)
    .sort((left, right) => left.baseTradeValue - right.baseTradeValue)[0];

  return nextSector?.sectorId ?? null;
}

export function getAssetMarketProfile(assetId: AssetId): AssetMarketProfile {
  const role = assetMarketRoles[assetId];
  const roleProfile = roleProfiles[role];

  return {
    assetId,
    role,
    ...roleProfile
  };
}

export function getAssetBaselineTradeValue(asset: AssetDefinition): number {
  const sectorProfile = getSectorMarketProfile(asset.sectorId);
  const assetProfile = getAssetMarketProfile(asset.id);

  return Math.round(sectorProfile.baseTradeValue * assetProfile.tradeValueMultiplier);
}

export function getAssetNewsSensitivity(asset: AssetDefinition): number {
  const sectorProfile = getSectorMarketProfile(asset.sectorId);
  const assetProfile = getAssetMarketProfile(asset.id);

  return round2(sectorProfile.newsSensitivity * assetProfile.newsSensitivityMultiplier);
}

export function getSectorAverageBaselineTradeValue(sectorId: SectorId): number {
  const sectorAssets = assets.filter((asset) => asset.sectorId === sectorId);
  const total = sectorAssets.reduce((sum, asset) => sum + getAssetBaselineTradeValue(asset), 0);

  return Math.round(total / Math.max(1, sectorAssets.length));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
