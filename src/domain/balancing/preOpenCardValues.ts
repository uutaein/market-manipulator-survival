export const preOpenCardIds = [
  "market_observation",
  "early_positioning",
  "defense_budget",
  "wait_and_see"
] as const;

export type PreOpenCardId = (typeof preOpenCardIds)[number];

export interface PreOpenCardValue {
  readonly id: PreOpenCardId;
  readonly displayName: string;
  readonly role: string;
  readonly budgetDelta: number;
  readonly holdingRatioDelta: number;
  readonly marketPressureDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
  readonly defenseReserve: number;
  readonly effectDurationSec: number | null;
  readonly revealsExtraBriefing: boolean;
}

export const preOpenCardValues = {
  market_observation: {
    id: "market_observation",
    displayName: "시장 관찰",
    role: "Reveals Morning News target type, target band, crash line, and one major risk hint.",
    budgetDelta: 0,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    defenseReserve: 0,
    effectDurationSec: null,
    revealsExtraBriefing: true
  },
  early_positioning: {
    id: "early_positioning",
    displayName: "사전 포지션 구축",
    role: "Spends starting budget to gain opening pressure.",
    budgetDelta: -10,
    holdingRatioDelta: 8,
    marketPressureDelta: 20,
    surveillanceDelta: 3,
    volatilityDelta: 4,
    defenseReserve: 0,
    effectDurationSec: 30,
    revealsExtraBriefing: false
  },
  defense_budget: {
    id: "defense_budget",
    displayName: "방어 자금 배정",
    role: "Reserves starting budget to reduce first panic or collapse-risk pressure.",
    budgetDelta: -8,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    defenseReserve: 8,
    effectDurationSec: null,
    revealsExtraBriefing: false
  },
  wait_and_see: {
    id: "wait_and_see",
    displayName: "관망",
    role: "Opens without spending budget or applying a pre-open stat effect.",
    budgetDelta: 0,
    holdingRatioDelta: 0,
    marketPressureDelta: 0,
    surveillanceDelta: 0,
    volatilityDelta: 0,
    defenseReserve: 0,
    effectDurationSec: null,
    revealsExtraBriefing: false
  }
} as const satisfies Record<PreOpenCardId, PreOpenCardValue>;

export function getPreOpenCardByDisplayName(displayName: string): PreOpenCardValue | undefined {
  return Object.values(preOpenCardValues).find((card) => card.displayName === displayName);
}
