export type SectorId =
  | "food_agri"
  | "energy_grid"
  | "bio_trial"
  | "automation_ai"
  | "chip_equipment"
  | "payment_fintech"
  | "media_game"
  | "community_token";

export type AssetId =
  | "food_agri_01"
  | "food_agri_02"
  | "food_agri_03"
  | "energy_grid_01"
  | "energy_grid_02"
  | "energy_grid_03"
  | "bio_trial_01"
  | "bio_trial_02"
  | "bio_trial_03"
  | "automation_ai_01"
  | "automation_ai_02"
  | "automation_ai_03"
  | "chip_equipment_01"
  | "chip_equipment_02"
  | "chip_equipment_03"
  | "payment_fintech_01"
  | "payment_fintech_02"
  | "payment_fintech_03"
  | "media_game_01"
  | "media_game_02"
  | "media_game_03"
  | "community_token_01"
  | "community_token_02"
  | "community_token_03";

export interface SectorDefinition {
  readonly id: SectorId;
  readonly displayName: string;
}

export interface AssetDefinition {
  readonly id: AssetId;
  readonly sectorId: SectorId;
  readonly displayName: string;
  readonly shortBriefing: string;
}

export const sectors = [
  { id: "food_agri", displayName: "식량·농업" },
  { id: "energy_grid", displayName: "에너지·전력망" },
  { id: "bio_trial", displayName: "바이오·임상" },
  { id: "automation_ai", displayName: "자동화·AI" },
  { id: "chip_equipment", displayName: "칩·장비" },
  { id: "payment_fintech", displayName: "결제·핀테크" },
  { id: "media_game", displayName: "미디어·게임" },
  { id: "community_token", displayName: "커뮤니티 토큰" }
] as const satisfies readonly SectorDefinition[];

export const assets = [
  {
    id: "food_agri_01",
    sectorId: "food_agri",
    displayName: "곡물회랑",
    shortBriefing: "Regional supply desk with steady attention."
  },
  {
    id: "food_agri_02",
    sectorId: "food_agri",
    displayName: "온실노드",
    shortBriefing: "Controlled-growth operator with weather-sensitive demand."
  },
  {
    id: "food_agri_03",
    sectorId: "food_agri",
    displayName: "수확셀",
    shortBriefing: "Small seasonal desk with uneven participation."
  },
  {
    id: "energy_grid_01",
    sectorId: "energy_grid",
    displayName: "그리드램프",
    shortBriefing: "Utility-adjacent desk with broad sector visibility."
  },
  {
    id: "energy_grid_02",
    sectorId: "energy_grid",
    displayName: "축전회랑",
    shortBriefing: "Storage-themed desk with volatile attention bursts."
  },
  {
    id: "energy_grid_03",
    sectorId: "energy_grid",
    displayName: "전력노드",
    shortBriefing: "Infrastructure desk with slower but stronger moves."
  },
  {
    id: "bio_trial_01",
    sectorId: "bio_trial",
    displayName: "임상서랍",
    shortBriefing: "Clinical-file desk with event-heavy sentiment."
  },
  {
    id: "bio_trial_02",
    sectorId: "bio_trial",
    displayName: "바이오램프",
    shortBriefing: "Research-themed desk with sharp attention swings."
  },
  {
    id: "bio_trial_03",
    sectorId: "bio_trial",
    displayName: "세포문서",
    shortBriefing: "Thin-flow desk with high uncertainty."
  },
  {
    id: "automation_ai_01",
    sectorId: "automation_ai",
    displayName: "오토서기",
    shortBriefing: "Automation desk with strong crowd recognition."
  },
  {
    id: "automation_ai_02",
    sectorId: "automation_ai",
    displayName: "패턴엔진",
    shortBriefing: "Pattern desk that reacts strongly to news."
  },
  {
    id: "automation_ai_03",
    sectorId: "automation_ai",
    displayName: "공정노드",
    shortBriefing: "Factory-flow desk with moderate liquidity."
  },
  {
    id: "chip_equipment_01",
    sectorId: "chip_equipment",
    displayName: "웨이퍼문",
    shortBriefing: "Component desk with sector-sensitive pressure."
  },
  {
    id: "chip_equipment_02",
    sectorId: "chip_equipment",
    displayName: "장비서랍",
    shortBriefing: "Equipment desk with slower attention buildup."
  },
  {
    id: "chip_equipment_03",
    sectorId: "chip_equipment",
    displayName: "회로등대",
    shortBriefing: "Signal-heavy desk with fast volatility changes."
  },
  {
    id: "payment_fintech_01",
    sectorId: "payment_fintech",
    displayName: "결제도장",
    shortBriefing: "Settlement-themed desk with stable baseline interest."
  },
  {
    id: "payment_fintech_02",
    sectorId: "payment_fintech",
    displayName: "원장노드",
    shortBriefing: "Ledger desk with medium liquidity and pressure."
  },
  {
    id: "payment_fintech_03",
    sectorId: "payment_fintech",
    displayName: "정산서랍",
    shortBriefing: "Budget-efficient desk with surveillance sensitivity."
  },
  {
    id: "media_game_01",
    sectorId: "media_game",
    displayName: "채널잉크",
    shortBriefing: "Media desk with fast attention movement."
  },
  {
    id: "media_game_02",
    sectorId: "media_game",
    displayName: "플레이문",
    shortBriefing: "Game-themed desk with high participation variance."
  },
  {
    id: "media_game_03",
    sectorId: "media_game",
    displayName: "방송노드",
    shortBriefing: "Broadcast desk with broad but unstable interest."
  },
  {
    id: "community_token_01",
    sectorId: "community_token",
    displayName: "포럼칩",
    shortBriefing: "Community desk with fast crowd buildup."
  },
  {
    id: "community_token_02",
    sectorId: "community_token",
    displayName: "밈원장",
    shortBriefing: "Meme-led desk with high panic risk."
  },
  {
    id: "community_token_03",
    sectorId: "community_token",
    displayName: "토큰광장",
    shortBriefing: "Token-square desk with strong swarm response."
  }
] as const satisfies readonly AssetDefinition[];

export function getAssetsBySector(sectorId: SectorId): readonly AssetDefinition[] {
  return assets.filter((asset) => asset.sectorId === sectorId);
}

export function getAssetById(assetId: AssetId): AssetDefinition {
  const asset = assets.find((candidate) => candidate.id === assetId);

  if (!asset) {
    throw new Error(`Unknown asset ID: ${assetId}`);
  }

  return asset;
}

export function getSectorById(sectorId: SectorId): SectorDefinition {
  const sector = sectors.find((candidate) => candidate.id === sectorId);

  if (!sector) {
    throw new Error(`Unknown sector ID: ${sectorId}`);
  }

  return sector;
}
