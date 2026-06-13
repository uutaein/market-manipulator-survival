import {
  assets,
  getAssetById,
  getAssetsBySector,
  sectors,
  type AssetDefinition,
  type AssetId,
  type SectorId
} from "../assets/assetCatalog";
import { createSeededRandom } from "../random/SeededRandom";
import type { RunState } from "../run/runState";

export type MorningNewsTemplateId =
  | "sector_positive_catalyst"
  | "sector_negative_catalyst"
  | "market_slump"
  | "regulatory_warning"
  | "overheat_spread";

export type MorningNewsTarget =
  | { readonly type: "sector"; readonly sectorId: SectorId }
  | { readonly type: "market" }
  | { readonly type: "asset"; readonly sectorId: SectorId; readonly assetId: AssetId };

export interface MorningNewsTemplate {
  readonly id: MorningNewsTemplateId;
  readonly displayName: string;
  readonly designLabel: string;
  readonly role: string;
}

export interface MorningNews {
  readonly templateId: MorningNewsTemplateId;
  readonly displayName: string;
  readonly designLabel: string;
  readonly role: string;
  readonly target: MorningNewsTarget;
}

export const morningNewsTemplates = [
  {
    id: "sector_positive_catalyst",
    displayName: "섹터 호재",
    designLabel: "Sector Positive Catalyst",
    role: "Increases attention and upward market pressure for one sector."
  },
  {
    id: "sector_negative_catalyst",
    displayName: "섹터 악재",
    designLabel: "Sector Negative Catalyst",
    role: "Increases downward pressure and volatility for one sector."
  },
  {
    id: "market_slump",
    displayName: "시장 침체",
    designLabel: "Market Slump",
    role: "Reduces overall attention and budget efficiency."
  },
  {
    id: "regulatory_warning",
    displayName: "규제 경고",
    designLabel: "Regulatory Warning",
    role: "Increases starting surveillance or surveillance sensitivity."
  },
  {
    id: "overheat_spread",
    displayName: "과열 확산",
    designLabel: "Overheat Spread",
    role: "Increases personal participation, volatility, and surveillance risk."
  }
] as const satisfies readonly MorningNewsTemplate[];

export function generateMorningNews(runState: RunState, dayIndex: number): MorningNews {
  return generateMorningNewsItems(runState, dayIndex)[0];
}

export function generateMorningNewsItems(runState: RunState, dayIndex: number): readonly MorningNews[] {
  const random = createSeededRandom(`${runState.runSeed}:day:${dayIndex}:morning-news`);
  const sector = random.pick(sectors);
  const sectorTemplate = random.pick([
    getMorningNewsTemplate("sector_positive_catalyst"),
    getMorningNewsTemplate("sector_negative_catalyst")
  ]);
  const selectedAsset = getAssetById(runState.selectedAssetId);
  const includePlayerAsset = random.next() < 0.22;
  const assetNewsTargets = selectAssetNewsTargets(random, includePlayerAsset ? selectedAsset : null);

  return [
    createSectorNews(sector.id, sectorTemplate),
    createAssetNews(assetNewsTargets[0], random.pick(["positive", "negative"]), random),
    createAssetNews(assetNewsTargets[1], random.pick(["positive", "negative"]), random)
  ];
}

export function isMorningNewsTemplateId(value: string): value is MorningNewsTemplateId {
  return morningNewsTemplates.some((template) => template.id === value);
}

export function describeMorningNewsTarget(target: MorningNewsTarget): string {
  if (target.type === "market") {
    return "시장 전체";
  }

  if (target.type === "asset") {
    const asset = getAssetsBySector(target.sectorId).find((candidate) => candidate.id === target.assetId);
    return asset ? asset.displayName : target.assetId;
  }

  const sector = sectors.find((candidate) => candidate.id === target.sectorId);
  return sector?.displayName ?? target.sectorId;
}

function createSectorNews(sectorId: SectorId, template: MorningNewsTemplate): MorningNews {
  const headline = sectorNewsHeadlines[sectorId][template.id === "sector_positive_catalyst" ? "positive" : "negative"];

  return {
    templateId: template.id,
    displayName: headline,
    designLabel: template.designLabel,
    role: template.role,
    target: {
      type: "sector",
      sectorId
    }
  };
}

function createAssetNews(
  asset: AssetDefinition,
  direction: "positive" | "negative",
  random: ReturnType<typeof createSeededRandom>
): MorningNews {
  const template = random.pick(
    direction === "positive"
      ? [getMorningNewsTemplate("sector_positive_catalyst"), getMorningNewsTemplate("overheat_spread")]
      : [
          getMorningNewsTemplate("sector_negative_catalyst"),
          getMorningNewsTemplate("regulatory_warning"),
          getMorningNewsTemplate("market_slump")
        ]
  );
  const headline = direction === "positive" ? pickAssetPositiveHeadline(asset) : pickAssetNegativeHeadline(asset);

  return {
    templateId: template.id,
    displayName: headline,
    designLabel: direction === "positive" ? "Asset Positive Catalyst" : "Asset Negative Catalyst",
    role:
      direction === "positive"
        ? "Increases attention and upward market pressure for one fictional asset."
        : "Increases downward pressure and volatility for one fictional asset.",
    target: {
      type: "asset",
      sectorId: asset.sectorId,
      assetId: asset.id
    }
  };
}

function selectAssetNewsTargets(
  random: ReturnType<typeof createSeededRandom>,
  forcedAsset: AssetDefinition | null
): readonly [AssetDefinition, AssetDefinition] {
  const selected: AssetDefinition[] = forcedAsset ? [forcedAsset] : [];
  const candidates = [...assets].sort(() => random.next() - 0.5);

  for (const asset of candidates) {
    if (selected.some((candidate) => candidate.id === asset.id)) {
      continue;
    }

    selected.push(asset);

    if (selected.length >= 2) {
      break;
    }
  }

  return [selected[0], selected[1]];
}

function getMorningNewsTemplate(templateId: MorningNewsTemplateId): MorningNewsTemplate {
  const template = morningNewsTemplates.find((candidate) => candidate.id === templateId);

  if (!template) {
    throw new Error(`Unknown Morning News template: ${templateId}`);
  }

  return template;
}

function pickAssetPositiveHeadline(asset: AssetDefinition): string {
  const index = hashString(asset.id) % assetPositiveHeadlines.length;
  return `${asset.displayName} ${assetPositiveHeadlines[index]}`;
}

function pickAssetNegativeHeadline(asset: AssetDefinition): string {
  const index = hashString(asset.id) % assetNegativeHeadlines.length;
  return `${asset.displayName} ${assetNegativeHeadlines[index]}`;
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

const sectorNewsHeadlines: Record<SectorId, { readonly positive: string; readonly negative: string }> = {
  food_agri: {
    positive: "농업 날씨 풍년 예상",
    negative: "작황 불안 경보"
  },
  energy_grid: {
    positive: "전력망 보강 예산 기대",
    negative: "전력 예비율 경고"
  },
  bio_trial: {
    positive: "임상 일정 정상화 기대",
    negative: "검증 절차 지연 우려"
  },
  automation_ai: {
    positive: "자동화 발주 확대 관측",
    negative: "AI 비용 부담 재평가"
  },
  chip_equipment: {
    positive: "장비 발주 회복 기대",
    negative: "부품 납기 지연 우려"
  },
  payment_fintech: {
    positive: "간편결제 이용액 개선",
    negative: "정산 장애 점검 확대"
  },
  media_game: {
    positive: "콘텐츠 트래픽 반등",
    negative: "업데이트 반응 둔화"
  },
  meme_theme: {
    positive: "테마 게시판 재점화",
    negative: "커뮤니티 관심 급랭"
  }
};

const assetPositiveHeadlines = [
  "공급 계약 기대",
  "이용자 지표 개선",
  "시제품 반응 양호",
  "분기 브리핑 호평",
  "파트너십 소문 확산"
] as const;

const assetNegativeHeadlines = [
  "납품 지연설",
  "검증 일정 지연",
  "운영 장애 보고",
  "비용 부담 확대",
  "커뮤니티 반응 냉각"
] as const;
