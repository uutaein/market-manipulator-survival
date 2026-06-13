import type { MorningNewsTemplateId } from "../day/morningNews";

export const priceTickValues = {
  tickIntervalSec: 1,
  playerMinDeltaPerTick: -0.45,
  playerMaxDeltaPerTick: 0.45,
  coefficients: {
    marketPressure: 0.0024,
    personalParticipation: 0.0008,
    holdingRatio: 0.0006,
    marketLiquidity: 0.0005,
    competitionPressure: -0.0005
  },
  baselines: {
    personalParticipation: 40,
    holdingRatio: 20,
    marketLiquidity: 50
  },
  volatilityNoise: {
    base: 0.015,
    perVolatility: 0.0012
  },
  liquidityMultiplier: {
    base: 0.75,
    scale: 0.75
  }
} as const;

export const newsPricePressure: Record<MorningNewsTemplateId, number> = {
  sector_positive_catalyst: 0.035,
  sector_negative_catalyst: -0.045,
  market_slump: -0.03,
  regulatory_warning: -0.015,
  overheat_spread: 0.025
};
