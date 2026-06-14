export const runDefaults = {
  runLengthDays: 5,
  intradayDurationSec: 180,
  startingBudget: 100,
  initialPriceChangePercent: 0,
  initialHoldingRatio: 0,
  initialPersonalParticipation: 30,
  initialMarketLiquidity: 50,
  initialSurveillance: 10,
  initialVolatility: 35,
  initialMarketPressure: 0,
  initialCompetitionPressure: 30,
  openingPriceMin: 4200,
  openingPriceMax: 19800,
  openingPriceTick: 10,
  fictionalFloatUnitMin: 9000,
  fictionalFloatUnitMax: 18000,
  fictionalFloatUnitTick: 100,
  baselineEntryDiscountPercent: 0,
  earlyPositioningEntryPremiumMinPercent: 2,
  earlyPositioningEntryPremiumMaxPercent: 7,
  fictionalLedgerScale: 500000,
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
