import {
  documentEventIds,
  documentEventRules,
  documentEventValues,
  type DocumentEventChoiceType,
  type DocumentEventId,
  type DocumentEventValue
} from "../balancing/documentEventValues";
import { runDefaults } from "../balancing/runDefaults";
import { applyIntradayStatUpdate, pauseIntraday, resumeIntraday, type IntradayState } from "./intradayState";

export interface DocumentEventOpenResult {
  readonly state: IntradayState;
  readonly event: DocumentEventValue | null;
  readonly opened: boolean;
  readonly reason: "opened" | "no_trigger" | "limit" | "gap" | "time_window" | "already_active";
}

export interface DocumentEventChoiceResult {
  readonly state: IntradayState;
  readonly event: DocumentEventValue;
  readonly choiceType: DocumentEventChoiceType;
  readonly applied: boolean;
}

export function evaluateDocumentEvent(state: IntradayState): DocumentEventOpenResult {
  if (state.activeDocumentEventId) {
    return { state, event: documentEventValues[state.activeDocumentEventId], opened: false, reason: "already_active" };
  }

  if (state.documentEventHistory.length >= documentEventRules.maxEventsPerDay) {
    return { state, event: null, opened: false, reason: "limit" };
  }

  const elapsedSec = getIntradayElapsedSec(state);

  if (
    elapsedSec < documentEventRules.earliestEventElapsedSec ||
    elapsedSec > documentEventRules.latestNormalEventElapsedSec
  ) {
    return { state, event: null, opened: false, reason: "time_window" };
  }

  if (
    state.lastDocumentEventElapsedSec !== null &&
    elapsedSec - state.lastDocumentEventElapsedSec < documentEventRules.minimumGapSec
  ) {
    return { state, event: null, opened: false, reason: "gap" };
  }

  const event = findHighestPriorityTriggeredEvent(state);

  if (!event) {
    return { state, event: null, opened: false, reason: "no_trigger" };
  }

  return openDocumentEvent(state, event.id);
}

export function openDocumentEvent(state: IntradayState, eventId: DocumentEventId): DocumentEventOpenResult {
  const event = documentEventValues[eventId];
  const elapsedSec = getIntradayElapsedSec(state);
  const pausedState = pauseIntraday({
    ...state,
    activeDocumentEventId: event.id,
    documentEventChoices: event.choices.map((choice) => choice.type),
    documentEventHistory: [
      ...state.documentEventHistory,
      {
        eventId: event.id,
        choiceType: null,
        elapsedSec
      }
    ],
    lastDocumentEventElapsedSec: elapsedSec
  });

  return {
    state: pausedState,
    event,
    opened: true,
    reason: "opened"
  };
}

export function applyDocumentEventChoice(
  state: IntradayState,
  choiceType: DocumentEventChoiceType
): DocumentEventChoiceResult {
  if (!state.activeDocumentEventId) {
    throw new Error("No active document event is open");
  }

  const event = documentEventValues[state.activeDocumentEventId];
  const choice = event.choices.find((candidate) => candidate.type === choiceType);

  if (!choice) {
    throw new Error(`Document event ${event.id} does not have choice ${choiceType}`);
  }

  const effect = choice.effect;
  const stateWithChoice = {
    ...state,
    budget: state.budget + effect.budgetDelta,
    pendingSocialCostDelta: state.pendingSocialCostDelta + effect.socialCostDelta,
    pendingAftereffectTags: effect.aftereffectTag
      ? [...state.pendingAftereffectTags, effect.aftereffectTag]
      : state.pendingAftereffectTags,
    documentEventHistory: state.documentEventHistory.map((entry, index, entries) =>
      index === entries.length - 1 && entry.eventId === event.id ? { ...entry, choiceType } : entry
    )
  };

  const updatedStats = applyIntradayStatUpdate(stateWithChoice, {
    marketPressure: state.marketPressure + effect.marketPressureDelta,
    marketLiquidity: state.marketLiquidity + effect.marketLiquidityDelta,
    personalParticipation: state.personalParticipation + effect.personalParticipationDelta,
    holdingRatio: state.holdingRatio + effect.holdingRatioDelta,
    surveillance: state.surveillance + effect.surveillanceDelta,
    volatility: state.volatility + effect.volatilityDelta,
    competitionPressure: state.competitionPressure + effect.competitionPressureDelta
  });

  return {
    state: resumeIntraday({
      ...updatedStats,
      activeDocumentEventId: null,
      documentEventChoices: []
    }),
    event,
    choiceType,
    applied: true
  };
}

export function getAvailableDocumentEventChoices(state: IntradayState): readonly DocumentEventChoiceType[] {
  return state.documentEventChoices;
}

export function canOpenAnotherDocumentEvent(state: IntradayState): boolean {
  if (state.documentEventHistory.length >= documentEventRules.maxEventsPerDay) {
    return false;
  }

  const elapsedSec = getIntradayElapsedSec(state);

  if (state.lastDocumentEventElapsedSec === null) {
    return true;
  }

  return elapsedSec - state.lastDocumentEventElapsedSec >= documentEventRules.minimumGapSec;
}

export function getIntradayElapsedSec(state: IntradayState): number {
  return runDefaults.intradayDurationSec - state.timeRemainingSec;
}

function findHighestPriorityTriggeredEvent(state: IntradayState): DocumentEventValue | null {
  const triggered = documentEventIds
    .map((eventId) => documentEventValues[eventId])
    .filter((event) => isEventTriggered(event.id, state))
    .sort((left, right) => left.priority - right.priority);

  return triggered[0] ?? null;
}

function isEventTriggered(eventId: DocumentEventId, state: IntradayState): boolean {
  switch (eventId) {
    case "collapse_risk_notice":
      return state.priceChangePercent <= runDefaults.crashLine + 6;
    case "unusual_flow_inquiry":
      return state.surveillance >= 60;
    case "market_overheat_warning":
      return state.personalParticipation >= 70 || state.volatility >= 70;
    case "liquidity_dryness_report":
      return state.budget <= 35 || state.marketLiquidity <= 25;
    case "community_surge_alert":
      return state.personalParticipation >= 80 || state.retailSwarmState === "overheated";
    case "competition_desk_report":
      return state.competitionPressure >= 65;
    case "internal_risk_memo":
      return state.holdingRatio >= 50;
    case "closing_cleanup_request":
      return state.timeRemainingSec <= 75 && (state.holdingRatio >= 35 || state.surveillance >= 60);
  }
}
