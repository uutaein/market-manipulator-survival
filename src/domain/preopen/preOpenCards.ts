import type { DayState, PreOpenCardEffect } from "../day/daySetup";
import { morningNewsTemplates, type MorningNews } from "../day/morningNews";
import type { RunState } from "../run/runState";
import {
  getPreOpenCardByDisplayName,
  preOpenCardIds,
  preOpenCardValues,
  type NewsAssignmentDirection,
  type PreOpenCardId,
  type PreOpenCardValue
} from "../balancing/preOpenCardValues";

export const preOpenCards = Object.values(preOpenCardValues);
export const earlyPositioningBudgetPercentMin = 10;
export const earlyPositioningBudgetPercentMax = 50;
export const earlyPositioningBudgetPercentStep = 5;

export interface PreOpenCardSelectionOptions {
  readonly earlyPositioningBudgetPercent?: number;
}

export interface EarlyPositioningPreviewEffect {
  readonly earlyPositioningBudgetPercent: number;
  readonly budgetDelta: number;
  readonly holdingRatioDelta: number;
  readonly marketPressureDelta: number;
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
}

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
  const selection = parsePreOpenCardSelection(cardIdOrDisplayName);

  if (selection) {
    return selection.cardId;
  }

  if (isPreOpenCardId(cardIdOrDisplayName)) {
    return cardIdOrDisplayName;
  }

  const card = getPreOpenCardByDisplayName(cardIdOrDisplayName);

  if (!card) {
    throw new Error(`Unknown pre-open card: ${cardIdOrDisplayName}`);
  }

  return card.id;
}

export function selectPreOpenCard(
  dayState: DayState,
  cardIdOrDisplayName: string,
  runState?: Pick<RunState, "selectedSectorId" | "selectedAssetId">,
  options: PreOpenCardSelectionOptions = {}
): DayState {
  if (dayState.preOpenCardId) {
    throw new Error("A Pre-open Card has already been selected for this Day");
  }

  const selection = parsePreOpenCardSelection(cardIdOrDisplayName);
  const card = getPreOpenCard(selection?.cardId ?? resolvePreOpenCardId(cardIdOrDisplayName));
  const newsAssignmentDirection = selection?.newsAssignmentDirection ?? null;
  const earlyPositioningBudgetPercent =
    selection?.earlyPositioningBudgetPercent ?? options.earlyPositioningBudgetPercent ?? null;
  const morningNewsItems = applyPreRevealNewsAssignment(dayState, newsAssignmentDirection, runState);

  return {
    ...dayState,
    morningNewsItems,
    morningNews: morningNewsItems[0],
    preOpenCardId: card.id,
    preOpenCardEffect: createPreOpenCardEffect(dayState, card, newsAssignmentDirection, earlyPositioningBudgetPercent)
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

function createPreOpenCardEffect(
  dayState: DayState,
  card: PreOpenCardValue,
  newsAssignmentDirection: NewsAssignmentDirection | null,
  earlyPositioningBudgetPercent: number | null
): PreOpenCardEffect {
  const newsAssignmentEffect = getNewsAssignmentEffect(newsAssignmentDirection);
  const earlyPositioningEffect =
    card.id === "early_positioning"
      ? previewEarlyPositioningEffect(dayState.startingBudgetForDay, earlyPositioningBudgetPercent)
      : null;

  return {
    sourceCardId: card.id,
    newsAssignmentDirection,
    earlyPositioningBudgetPercent: earlyPositioningEffect?.earlyPositioningBudgetPercent ?? null,
    budgetDelta: earlyPositioningEffect?.budgetDelta ?? card.budgetDelta,
    holdingRatioDelta: earlyPositioningEffect?.holdingRatioDelta ?? card.holdingRatioDelta,
    marketPressureDelta: earlyPositioningEffect?.marketPressureDelta ?? card.marketPressureDelta,
    surveillanceDelta: (earlyPositioningEffect?.surveillanceDelta ?? card.surveillanceDelta) + newsAssignmentEffect.surveillanceDelta,
    volatilityDelta: (earlyPositioningEffect?.volatilityDelta ?? card.volatilityDelta) + newsAssignmentEffect.volatilityDelta,
    defenseReserve: card.defenseReserve,
    effectDurationSec: card.effectDurationSec,
    revealsExtraBriefing: card.revealsExtraBriefing,
    manualActionEffectMultiplier: card.manualActionEffectMultiplier,
    pricePushEffectMultiplier: card.pricePushEffectMultiplier * newsAssignmentEffect.pricePushEffectMultiplier,
    overheatCooldownEffectMultiplier: card.overheatCooldownEffectMultiplier,
    liquiditySupplyPressureBonus: card.liquiditySupplyPressureBonus + newsAssignmentEffect.liquiditySupplyPressureBonus,
    upwardActionSurveillanceMultiplier:
      card.upwardActionSurveillanceMultiplier * newsAssignmentEffect.upwardActionSurveillanceMultiplier,
    positionSettlementSurveillanceMultiplier:
      card.positionSettlementSurveillanceMultiplier * newsAssignmentEffect.positionSettlementSurveillanceMultiplier
  };
}

export function previewEarlyPositioningEffect(
  currentBudget: number,
  requestedPercent: number | null | undefined
): EarlyPositioningPreviewEffect {
  const earlyPositioningBudgetPercent = normalizeEarlyPositioningBudgetPercent(requestedPercent ?? 20);
  const budgetSpend = round1((Math.max(0, currentBudget) * earlyPositioningBudgetPercent) / 100);
  const holdingRatioDelta = round1(Math.max(1, (budgetSpend / 100) * 100));
  const scale = holdingRatioDelta / 10;

  return {
    earlyPositioningBudgetPercent,
    budgetDelta: -budgetSpend,
    holdingRatioDelta,
    marketPressureDelta: round1(4 * scale),
    surveillanceDelta: round1(1 * scale),
    volatilityDelta: round1(2 * scale)
  };
}

export function normalizeEarlyPositioningBudgetPercent(value: number): number {
  const clamped = Math.min(earlyPositioningBudgetPercentMax, Math.max(earlyPositioningBudgetPercentMin, value));
  return Math.round(clamped / earlyPositioningBudgetPercentStep) * earlyPositioningBudgetPercentStep;
}

function applyPreRevealNewsAssignment(
  dayState: DayState,
  newsAssignmentDirection: NewsAssignmentDirection | null,
  runState?: Pick<RunState, "selectedSectorId" | "selectedAssetId">
): readonly MorningNews[] {
  if (!newsAssignmentDirection || !runState) {
    return dayState.morningNewsItems;
  }

  const templateId =
    newsAssignmentDirection === "positive" ? "sector_positive_catalyst" : "sector_negative_catalyst";
  const template = morningNewsTemplates.find((candidate) => candidate.id === templateId) ?? morningNewsTemplates[0];
  const displayName = newsAssignmentDirection === "positive" ? "종목 호재" : "종목 악재";

  const assignedNews: MorningNews = {
    templateId: template.id,
    displayName,
    designLabel: template.designLabel,
    role: template.role,
    target: {
      type: "asset" as const,
      sectorId: runState.selectedSectorId,
      assetId: runState.selectedAssetId
    }
  };
  const assetNewsIndex = dayState.morningNewsItems.findIndex((news) => news.target.type === "asset");

  if (assetNewsIndex < 0) {
    return [...dayState.morningNewsItems, assignedNews];
  }

  return dayState.morningNewsItems.map((news, index) => (index === assetNewsIndex ? assignedNews : news));
}

function parsePreOpenCardSelection(cardIdOrDisplayName: string): {
  readonly cardId: PreOpenCardId;
  readonly newsAssignmentDirection: NewsAssignmentDirection | null;
  readonly earlyPositioningBudgetPercent: number | null;
} | null {
  const earlyPositioningMatch = /^(?:사전 포지션 확보|early_positioning)\s*:?\s*(\d{1,3})%?$/.exec(cardIdOrDisplayName);

  if (earlyPositioningMatch) {
    return {
      cardId: "early_positioning",
      newsAssignmentDirection: null,
      earlyPositioningBudgetPercent: Number(earlyPositioningMatch[1])
    };
  }

  if (cardIdOrDisplayName === "뉴스 배정: 호재" || cardIdOrDisplayName === "news_assignment_positive") {
    return { cardId: "news_assignment", newsAssignmentDirection: "positive", earlyPositioningBudgetPercent: null };
  }

  if (cardIdOrDisplayName === "뉴스 배정: 악재" || cardIdOrDisplayName === "news_assignment_negative") {
    return { cardId: "news_assignment", newsAssignmentDirection: "negative", earlyPositioningBudgetPercent: null };
  }

  if (cardIdOrDisplayName === "뉴스 배정" || cardIdOrDisplayName === "news_assignment") {
    return { cardId: "news_assignment", newsAssignmentDirection: "positive", earlyPositioningBudgetPercent: null };
  }

  return null;
}

function getNewsAssignmentEffect(newsAssignmentDirection: NewsAssignmentDirection | null): {
  readonly surveillanceDelta: number;
  readonly volatilityDelta: number;
  readonly pricePushEffectMultiplier: number;
  readonly liquiditySupplyPressureBonus: number;
  readonly upwardActionSurveillanceMultiplier: number;
  readonly positionSettlementSurveillanceMultiplier: number;
} {
  if (newsAssignmentDirection === "positive") {
    return {
      surveillanceDelta: -2,
      volatilityDelta: 2,
      pricePushEffectMultiplier: 1.3,
      liquiditySupplyPressureBonus: 18,
      upwardActionSurveillanceMultiplier: 0.3,
      positionSettlementSurveillanceMultiplier: 1
    };
  }

  if (newsAssignmentDirection === "negative") {
    return {
      surveillanceDelta: 0,
      volatilityDelta: 8,
      pricePushEffectMultiplier: 0.85,
      liquiditySupplyPressureBonus: 0,
      upwardActionSurveillanceMultiplier: 1,
      positionSettlementSurveillanceMultiplier: 0.2
    };
  }

  return {
    surveillanceDelta: 0,
    volatilityDelta: 0,
    pricePushEffectMultiplier: 1,
    liquiditySupplyPressureBonus: 0,
    upwardActionSurveillanceMultiplier: 1,
    positionSettlementSurveillanceMultiplier: 1
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
