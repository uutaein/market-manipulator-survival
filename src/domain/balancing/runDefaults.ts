export const runDefaults = {
  runLengthDays: 5,
  intradayDurationSec: 360,
  startingBudget: 100,
  minimumBudgetFailureThreshold: 10,
  initialPriceChangePercent: 0,
  initialHoldingRatio: 15,
  initialPersonalParticipation: 30,
  initialMarketLiquidity: 50,
  initialSurveillance: 10,
  initialVolatility: 35,
  initialMarketPressure: 0,
  initialCompetitionPressure: 30,
  targetBandMin: 8,
  targetBandMax: 12,
  crashLine: -20
} as const;

export const autoCardIds = [
  "attention_signal",
  "liquidity_cycle",
  "price_support",
  "volatility_absorb",
  "news_amplifier",
  "surveillance_buffer",
  "competition_check",
  "settlement_routine"
] as const;

export type AutoCardId = (typeof autoCardIds)[number];
