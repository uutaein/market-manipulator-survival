import { getAssetsBySector, sectors, type AssetId, type SectorId } from "../assets/assetCatalog";
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
  const random = createSeededRandom(`${runState.runSeed}:day:${dayIndex}:morning-news`);
  const template = random.pick(morningNewsTemplates);
  const sector = random.pick(sectors);

  return {
    templateId: template.id,
    displayName: template.displayName,
    designLabel: template.designLabel,
    role: template.role,
    target: {
      type: "sector",
      sectorId: sector.id
    }
  };
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
