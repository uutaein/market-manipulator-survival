import type { DayState, PreOpenCardEffect } from "../day/daySetup";
import type { DocumentEventChoiceType, DocumentEventId } from "../balancing/documentEventValues";
import { manualActionIds, type ManualActionId } from "../balancing/manualActionValues";
import { runDefaults } from "../balancing/runDefaults";
import type { RunState } from "../run/runState";
import { getActiveNewsPricePressure } from "./newsPressure";

export type RetailSwarmState = "interest" | "overheated" | "panic";

export interface PriceTickComponents {
  readonly pressure: number;
  readonly participation: number;
  readonly holding: number;
  readonly liquidity: number;
  readonly competition: number;
  readonly news: number;
  readonly aftereffect: number;
  readonly volatilityNoise: number;
  readonly directionalDelta: number;
  readonly liquidityMultiplier: number;
  readonly rawDelta: number;
  readonly clampedDelta: number;
}

export interface IntradayState {
  readonly timeRemainingSec: number;
  readonly isPaused: boolean;
  readonly priceTickIndex: number;
  readonly priceChangePercent: number;
  readonly priceDeltaPerTick: number;
  readonly budget: number;
  readonly marketPressure: number;
  readonly holdingRatio: number;
  readonly personalParticipation: number;
  readonly marketLiquidity: number;
  readonly surveillance: number;
  readonly volatility: number;
  readonly competitionPressure: number;
  readonly activeNewsPricePressure: number;
  readonly marketAftereffectPressure: number;
  readonly retailSwarmState: RetailSwarmState;
  readonly manualActionCooldowns: Readonly<Record<ManualActionId, number>>;
  readonly lastManualActionId: ManualActionId | null;
  readonly activeDocumentEventId: DocumentEventId | null;
  readonly documentEventChoices: readonly DocumentEventChoiceType[];
  readonly documentEventHistory: readonly DocumentEventHistoryEntry[];
  readonly lastDocumentEventElapsedSec: number | null;
  readonly pendingSocialCostDelta: number;
  readonly pendingAftereffectTags: readonly string[];
  readonly latestPriceComponents: PriceTickComponents | null;
}

export interface DocumentEventHistoryEntry {
  readonly eventId: DocumentEventId;
  readonly choiceType: DocumentEventChoiceType | null;
  readonly elapsedSec: number;
}

export type BoundedIntradayStat =
  | "holdingRatio"
  | "personalParticipation"
  | "marketLiquidity"
  | "surveillance"
  | "volatility"
  | "competitionPressure";

export function createIntradayState(runState: RunState, dayState: DayState): IntradayState {
  const effect = dayState.preOpenCardEffect;

  return clampIntradayState({
    timeRemainingSec: runDefaults.intradayDurationSec,
    isPaused: false,
    priceTickIndex: 0,
    priceChangePercent: runDefaults.initialPriceChangePercent,
    priceDeltaPerTick: 0,
    budget: applyEffect(runState.budget, effect, "budgetDelta"),
    marketPressure: applyEffect(runDefaults.initialMarketPressure, effect, "marketPressureDelta"),
    holdingRatio: applyEffect(runState.holdingRatio, effect, "holdingRatioDelta"),
    personalParticipation: runDefaults.initialPersonalParticipation,
    marketLiquidity: runDefaults.initialMarketLiquidity,
    surveillance: applyEffect(runState.surveillance, effect, "surveillanceDelta"),
    volatility: applyEffect(runDefaults.initialVolatility, effect, "volatilityDelta"),
    competitionPressure: runDefaults.initialCompetitionPressure,
    activeNewsPricePressure: getActiveNewsPricePressure(runState, dayState.morningNews),
    marketAftereffectPressure: 0,
    retailSwarmState: "interest",
    manualActionCooldowns: createEmptyManualActionCooldowns(),
    lastManualActionId: null,
    activeDocumentEventId: null,
    documentEventChoices: [],
    documentEventHistory: [],
    lastDocumentEventElapsedSec: null,
    pendingSocialCostDelta: 0,
    pendingAftereffectTags: [],
    latestPriceComponents: null
  });
}

export function pauseIntraday(state: IntradayState): IntradayState {
  return {
    ...state,
    isPaused: true
  };
}

export function resumeIntraday(state: IntradayState): IntradayState {
  return {
    ...state,
    isPaused: false
  };
}

export function advanceIntradayTime(state: IntradayState, seconds = 1): IntradayState {
  if (state.isPaused) {
    return state;
  }

  return {
    ...state,
    timeRemainingSec: Math.max(0, state.timeRemainingSec - seconds)
  };
}

export function isIntradayComplete(state: IntradayState): boolean {
  return state.timeRemainingSec <= 0;
}

export function clampIntradayState(state: IntradayState): IntradayState {
  const clamped = {
    ...state,
    budget: Math.max(0, state.budget),
    marketPressure: clamp(state.marketPressure, -100, 100),
    holdingRatio: clamp01To100(state.holdingRatio),
    personalParticipation: clamp01To100(state.personalParticipation),
    marketLiquidity: clamp01To100(state.marketLiquidity),
    surveillance: clamp01To100(state.surveillance),
    volatility: clamp01To100(state.volatility),
    competitionPressure: clamp01To100(state.competitionPressure)
  };

  return {
    ...clamped,
    retailSwarmState: getRetailSwarmState(clamped.personalParticipation)
  };
}

export function createEmptyManualActionCooldowns(): Readonly<Record<ManualActionId, number>> {
  return Object.fromEntries(manualActionIds.map((actionId) => [actionId, 0])) as Record<ManualActionId, number>;
}

export function applyIntradayStatUpdate(
  state: IntradayState,
  update: Partial<Pick<IntradayState, BoundedIntradayStat | "marketPressure">>
): IntradayState {
  return clampIntradayState({
    ...state,
    ...update
  });
}

export function getRetailSwarmState(personalParticipation: number): RetailSwarmState {
  if (personalParticipation >= 86) {
    return "panic";
  }

  if (personalParticipation >= 61) {
    return "overheated";
  }

  return "interest";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clamp01To100(value: number): number {
  return clamp(value, 0, 100);
}

function applyEffect(
  value: number,
  effect: PreOpenCardEffect | null,
  key: keyof Pick<
    PreOpenCardEffect,
    "budgetDelta" | "holdingRatioDelta" | "marketPressureDelta" | "surveillanceDelta" | "volatilityDelta"
  >
): number {
  return value + (effect?.[key] ?? 0);
}
