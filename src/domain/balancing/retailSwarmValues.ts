export const retailSwarmValues = {
  thresholds: {
    overheatedMin: 61,
    panicMin: 86
  },
  tokens: {
    minCount: 8,
    maxCount: 56,
    minDensity: 0.2,
    maxDensity: 1,
    minSpeed: 0.55,
    maxSpeed: 1.85
  },
  madness: {
    participationWeight: 0.72,
    positivePriceWeight: 2.1,
    positivePressureWeight: 0.18,
    volatilityWeight: 0.08,
    positionSettlementStart: 55,
    maxSellPressureAbsorption: 0.86,
    maxRetailParticipationBoost: 16,
    maxBidLiquidityBoost: 7,
    maxVolatilityBoost: 5,
    maxBudgetRecoveryBonus: 0.18,
    minChartShockScale: 0.08,
    maxChartRecoveryBounce: 1.8
  },
  stateEffects: {
    interest: {
      marketPressureDelta: 0,
      volatilityDelta: 0,
      surveillanceDelta: 0
    },
    overheated: {
      marketPressureDelta: 0,
      volatilityDelta: 3,
      surveillanceDelta: 2
    },
    panic: {
      marketPressureDelta: -35,
      volatilityDelta: 15,
      surveillanceDelta: 5
    }
  },
  visualByState: {
    interest: {
      movement: "gathering",
      warningVisual: false,
      panicVisual: false
    },
    overheated: {
      movement: "surging",
      warningVisual: true,
      panicVisual: false
    },
    panic: {
      movement: "reverse",
      warningVisual: true,
      panicVisual: true
    }
  }
} as const;

