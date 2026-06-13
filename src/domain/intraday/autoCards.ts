import { autoCardValues, type AutoCardValue } from "../balancing/autoCardValues";
import { autoCardIds, type AutoCardId } from "../balancing/runDefaults";
import { createSeededRandom } from "../random/SeededRandom";
import type { AutoCardState, RunState } from "../run/runState";
import { applyIntradayStatUpdate, clamp, type IntradayState } from "./intradayState";

export type AutoCardChoice =
  | { readonly type: "new"; readonly cardId: AutoCardId }
  | { readonly type: "level_up"; readonly cardId: AutoCardId };

export interface AutoCardEffectResult {
  readonly state: IntradayState;
  readonly card: AutoCardValue;
  readonly applied: boolean;
}

export function generateAutoCardChoices(
  runState: RunState,
  dayIndex: number,
  rewardIndex: number
): readonly AutoCardChoice[] {
  const owned = new Map(runState.autoCards.map((card) => [card.cardId, card.level]));
  const choices: AutoCardChoice[] = [];

  for (const cardId of autoCardIds) {
    const ownedLevel = owned.get(cardId);

    if (!ownedLevel) {
      choices.push({ type: "new", cardId });
    } else if (ownedLevel < 3) {
      choices.push({ type: "level_up", cardId });
    }
  }

  const random = createSeededRandom(`${runState.runSeed}:day:${dayIndex}:auto-reward:${rewardIndex}`);
  return random.shuffle(choices).slice(0, 3);
}

export function applyAutoCardChoice(runState: RunState, choice: AutoCardChoice): RunState {
  const existingCard = runState.autoCards.find((card) => card.cardId === choice.cardId);

  if (!existingCard) {
    return {
      ...runState,
      autoCards: [...runState.autoCards, { cardId: choice.cardId, level: 1 }]
    };
  }

  return {
    ...runState,
    autoCards: runState.autoCards.map((card) =>
      card.cardId === choice.cardId ? { ...card, level: clampAutoCardLevel(card.level + 1) } : card
    )
  };
}

export function applyAutoCardEffect(state: IntradayState, cardState: AutoCardState): AutoCardEffectResult {
  const card = autoCardValues[cardState.cardId];
  const scale = getAutoCardEffectScale(cardState);

  const nextState = applyIntradayStatUpdate(
    {
      ...state,
      budget: state.budget + card.budgetDelta * scale,
      positionSettlementImpactMultiplier: clamp(
        state.positionSettlementImpactMultiplier - card.positionSettlementImpactReductionDelta * scale,
        0.4,
        1
      ),
      activeNewsPricePressure:
        card.newsPressureMultiplierDelta === 0
          ? state.activeNewsPricePressure
          : state.activeNewsPricePressure * (1 + card.newsPressureMultiplierDelta)
    },
    {
      marketPressure: state.marketPressure + card.marketPressureDelta * scale,
      marketLiquidity: state.marketLiquidity + card.marketLiquidityDelta * scale,
      personalParticipation: state.personalParticipation + card.personalParticipationDelta * scale,
      holdingRatio: state.holdingRatio + card.holdingRatioDelta * scale,
      surveillance: state.surveillance + card.surveillanceDelta * scale,
      volatility: state.volatility + card.volatilityDelta * scale,
      competitionPressure: state.competitionPressure + card.competitionPressureDelta * scale
    }
  );

  return {
    state: nextState,
    card,
    applied: true
  };
}

export function getAutoCardPeriodSec(cardState: AutoCardState): number {
  const card = autoCardValues[cardState.cardId];

  if (card.growthType !== "period") {
    return card.periodSec;
  }

  return card.periodSec * getAutoCardPeriodScale(cardState);
}

export function getAutoCardEffectScale(cardState: AutoCardState): number {
  if (autoCardValues[cardState.cardId].growthType !== "effect") {
    return 1;
  }

  if (cardState.level === 3) {
    return 1.6;
  }

  if (cardState.level === 2) {
    return 1.3;
  }

  return 1;
}

export function getAutoCardPeriodScale(cardState: AutoCardState): number {
  if (cardState.level === 3) {
    return 0.75;
  }

  if (cardState.level === 2) {
    return 0.85;
  }

  return 1;
}

export function clampAutoCardLevel(level: number): 1 | 2 | 3 {
  if (level >= 3) {
    return 3;
  }

  if (level <= 1) {
    return 1;
  }

  return 2;
}

export function isMvpAutoCardId(value: string): value is AutoCardId {
  return autoCardIds.includes(value as AutoCardId);
}
