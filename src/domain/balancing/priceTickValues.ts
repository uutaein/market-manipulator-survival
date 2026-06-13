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
    competitionPressure: -0.0005,
    unsupportedPriceFade: 0.00055
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
  },
  simulator: {
    meanReversion: 0.018,
    targetResistance: 0.026,
    overheatParticipationStart: 62,
    overheatDrag: 0.00085,
    pullbackBaseChance: 0.04,
    pullbackChancePerPositivePrice: 0.006,
    pullbackChancePerVolatility: 0.00035,
    pullbackChancePerPressure: 0.00025,
    pullbackMaxChance: 0.28,
    pullbackBaseStrength: 0.05,
    pullbackRandomStrength: 0.16,
    pullbackStrengthPerPositivePrice: 0.012,
    reboundDistanceFromCrash: 6,
    reboundSupport: 0.03,
    externalBars: 7,
    externalStartPriceBase: 100,
    externalVolatilityBase: 0.28,
    externalVolatilityPerGameVolatility: 0.016,
    externalDriftPerPressure: 0.02,
    externalDriftPerNewsPressure: 16,
    externalDriftPerAftereffectPressure: 14,
    externalMinDrift: -2.4,
    externalMaxDrift: 2.4,
    externalImpulseScale: 0.035,
    externalImpulseClamp: 0.14,
    externalVolumeFactorMin: 0.78,
    externalVolumeFactorMax: 1.75,
    externalVolumeFactorScale: 0.5
  }
} as const;

export const newsPricePressure: Record<MorningNewsTemplateId, number> = {
  sector_positive_catalyst: 0.035,
  sector_negative_catalyst: -0.045,
  market_slump: -0.03,
  regulatory_warning: -0.015,
  overheat_spread: 0.025
};
