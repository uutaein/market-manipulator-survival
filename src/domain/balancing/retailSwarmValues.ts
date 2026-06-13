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

