import type { DayState, PreOpenCardEffect } from "../day/daySetup";
import {
  getPreOpenCardByDisplayName,
  preOpenCardIds,
  preOpenCardValues,
  type PreOpenCardId,
  type PreOpenCardValue
} from "../balancing/preOpenCardValues";

export const preOpenCards = Object.values(preOpenCardValues);

export function getPreOpenCard(cardId: PreOpenCardId): PreOpenCardValue {
  return preOpenCardValues[cardId];
}

export function getPreOpenCardDisplayNames(): readonly string[] {
  return preOpenCards.map((card) => card.displayName);
}

export function isPreOpenCardId(value: string): value is PreOpenCardId {
  return preOpenCardIds.includes(value as PreOpenCardId);
}

export function resolvePreOpenCardId(cardIdOrDisplayName: string): PreOpenCardId {
  if (isPreOpenCardId(cardIdOrDisplayName)) {
    return cardIdOrDisplayName;
  }

  const card = getPreOpenCardByDisplayName(cardIdOrDisplayName);

  if (!card) {
    throw new Error(`Unknown pre-open card: ${cardIdOrDisplayName}`);
  }

  return card.id;
}

export function selectPreOpenCard(dayState: DayState, cardIdOrDisplayName: string): DayState {
  if (dayState.preOpenCardId) {
    throw new Error("A Pre-open Card has already been selected for this Day");
  }

  const card = getPreOpenCard(resolvePreOpenCardId(cardIdOrDisplayName));

  return {
    ...dayState,
    preOpenCardId: card.id,
    preOpenCardEffect: createPreOpenCardEffect(card)
  };
}

export function approveOpening(dayState: DayState): DayState {
  if (!dayState.preOpenCardId) {
    throw new Error("Opening Approval requires a selected Pre-open Card or 관망");
  }

  return {
    ...dayState,
    openingApproved: true
  };
}

export function canStartIntraday(dayState: DayState): boolean {
  return dayState.openingApproved;
}

export function hasStatEffect(effect: PreOpenCardEffect | null): boolean {
  if (!effect) {
    return false;
  }

  return (
    effect.budgetDelta !== 0 ||
    effect.holdingRatioDelta !== 0 ||
    effect.marketPressureDelta !== 0 ||
    effect.surveillanceDelta !== 0 ||
    effect.volatilityDelta !== 0 ||
    effect.defenseReserve !== 0
  );
}

function createPreOpenCardEffect(card: PreOpenCardValue): PreOpenCardEffect {
  return {
    sourceCardId: card.id,
    budgetDelta: card.budgetDelta,
    holdingRatioDelta: card.holdingRatioDelta,
    marketPressureDelta: card.marketPressureDelta,
    surveillanceDelta: card.surveillanceDelta,
    volatilityDelta: card.volatilityDelta,
    defenseReserve: card.defenseReserve,
    effectDurationSec: card.effectDurationSec,
    revealsExtraBriefing: card.revealsExtraBriefing
  };
}
