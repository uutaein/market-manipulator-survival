import { newsPricePressure } from "../balancing/priceTickValues";
import type { MorningNews } from "../day/morningNews";
import type { RunState } from "../run/runState";

export interface NewsStatImpact {
  readonly personalParticipationDelta: number;
  readonly marketLiquidityDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
}

const newsStatImpacts: Record<MorningNews["templateId"], NewsStatImpact> = {
  sector_positive_catalyst: {
    personalParticipationDelta: 10,
    marketLiquidityDelta: 5,
    surveillanceDelta: 2,
    volatilityDelta: 10
  },
  sector_negative_catalyst: {
    personalParticipationDelta: 4,
    marketLiquidityDelta: -8,
    surveillanceDelta: 3,
    volatilityDelta: 15
  },
  market_slump: {
    personalParticipationDelta: -8,
    marketLiquidityDelta: -10,
    surveillanceDelta: 1,
    volatilityDelta: 8
  },
  regulatory_warning: {
    personalParticipationDelta: -2,
    marketLiquidityDelta: -3,
    surveillanceDelta: 10,
    volatilityDelta: 8
  },
  overheat_spread: {
    personalParticipationDelta: 18,
    marketLiquidityDelta: 4,
    surveillanceDelta: 6,
    volatilityDelta: 18
  }
};

export function getActiveNewsPricePressure(runState: RunState, morningNewsInput: MorningNews | readonly MorningNews[]): number {
  const morningNewsItems: readonly MorningNews[] = Array.isArray(morningNewsInput) ? morningNewsInput : [morningNewsInput];
  const total = morningNewsItems.reduce((sum, morningNews) => {
    const basePressure = newsPricePressure[morningNews.templateId];
    return sum + basePressure * getMorningNewsPriceTargetScale(runState, morningNews);
  }, 0);

  return round3(total);
}

export function getActiveNewsStatImpact(runState: RunState, morningNewsInput: MorningNews | readonly MorningNews[]): NewsStatImpact {
  const morningNewsItems: readonly MorningNews[] = Array.isArray(morningNewsInput) ? morningNewsInput : [morningNewsInput];

  return morningNewsItems.reduce<NewsStatImpact>(
    (total, morningNews) => {
      const impact = newsStatImpacts[morningNews.templateId];
      const scale = getMorningNewsStatTargetScale(runState, morningNews);

      return {
        personalParticipationDelta: round1(total.personalParticipationDelta + impact.personalParticipationDelta * scale),
        marketLiquidityDelta: round1(total.marketLiquidityDelta + impact.marketLiquidityDelta * scale),
        surveillanceDelta: round1(total.surveillanceDelta + impact.surveillanceDelta * scale),
        volatilityDelta: round1(total.volatilityDelta + impact.volatilityDelta * scale)
      };
    },
    {
      personalParticipationDelta: 0,
      marketLiquidityDelta: 0,
      surveillanceDelta: 0,
      volatilityDelta: 0
    }
  );
}

function getMorningNewsPriceTargetScale(runState: RunState, morningNews: MorningNews): number {
  if (morningNews.target.type === "market") {
    return 0.5;
  }

  if (morningNews.target.type === "asset") {
    if (morningNews.target.assetId === runState.selectedAssetId) {
      return 1;
    }

    return 0;
  }

  return morningNews.target.sectorId === runState.selectedSectorId ? 1 : 0;
}

function getMorningNewsStatTargetScale(runState: RunState, morningNews: MorningNews): number {
  if (morningNews.target.type === "market") {
    return 0.5;
  }

  if (morningNews.target.type === "asset") {
    if (morningNews.target.assetId === runState.selectedAssetId) {
      return 1;
    }

    return 0;
  }

  return morningNews.target.sectorId === runState.selectedSectorId ? 1 : 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
