import { retailSwarmValues } from "../balancing/retailSwarmValues";

export interface MadnessIndexInput {
  readonly personalParticipation: number;
  readonly priceChangePercent: number;
  readonly marketPressure: number;
  readonly volatility: number;
}

export interface PositionSettlementMadnessEffects {
  readonly intensity: number;
  readonly sellPressureAbsorption: number;
  readonly retailParticipationBoost: number;
  readonly bidLiquidityBoost: number;
  readonly volatilityBoost: number;
  readonly budgetRecoveryMultiplier: number;
  readonly chartShockScale: number;
  readonly chartRecoveryBounce: number;
}

export function calculateMadnessIndex(input: MadnessIndexInput): number {
  const values = retailSwarmValues.madness;
  const participation = input.personalParticipation * values.participationWeight;
  const fomoPrice = Math.max(0, input.priceChangePercent) * values.positivePriceWeight;
  const positivePressure = Math.max(0, input.marketPressure) * values.positivePressureWeight;
  const volatilitySpark = input.volatility * values.volatilityWeight;

  return round1(clamp(participation + fomoPrice + positivePressure + volatilitySpark, 0, 100));
}

export function calculatePositionSettlementMadnessEffects(madness: number): PositionSettlementMadnessEffects {
  const values = retailSwarmValues.madness;
  const intensity = calculatePositionSettlementMadnessIntensity(madness);

  return {
    intensity,
    sellPressureAbsorption: round2(values.maxSellPressureAbsorption * intensity),
    retailParticipationBoost: round1(values.maxRetailParticipationBoost * intensity),
    bidLiquidityBoost: round1(values.maxBidLiquidityBoost * intensity),
    volatilityBoost: round1(values.maxVolatilityBoost * intensity),
    budgetRecoveryMultiplier: round2(1 + values.maxBudgetRecoveryBonus * intensity),
    chartShockScale: round2(1 - (1 - values.minChartShockScale) * intensity),
    chartRecoveryBounce: round2(values.maxChartRecoveryBounce * intensity)
  };
}

export function calculatePositionSettlementMadnessIntensity(madness: number): number {
  const { positionSettlementStart } = retailSwarmValues.madness;

  return round2(clamp((madness - positionSettlementStart) / (100 - positionSettlementStart), 0, 1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
