import { retailSwarmValues } from "../balancing/retailSwarmValues";
import {
  applyIntradayStatUpdate,
  clamp,
  getRetailSwarmState,
  type IntradayState,
  type RetailSwarmState
} from "./intradayState";

export type RetailSwarmMovement = "gathering" | "surging" | "reverse";

export interface RetailSwarmModel {
  readonly state: RetailSwarmState;
  readonly participationNumber: number;
  readonly tokenKind: "abstract_token";
  readonly tokenCount: number;
  readonly density: number;
  readonly speed: number;
  readonly movement: RetailSwarmMovement;
  readonly warningVisual: boolean;
  readonly panicVisual: boolean;
  readonly usesAbstractTokens: true;
  readonly riskEffect: RetailSwarmRiskEffect;
}

export interface RetailSwarmRiskEffect {
  readonly marketPressureDelta: number;
  readonly volatilityDelta: number;
  readonly surveillanceDelta: number;
}

export interface RetailSwarmEffectResult {
  readonly state: IntradayState;
  readonly model: RetailSwarmModel;
  readonly applied: boolean;
}

export function calculateRetailSwarmModel(input: IntradayState | number): RetailSwarmModel {
  const personalParticipation = typeof input === "number" ? input : input.personalParticipation;
  const participationNumber = clamp(personalParticipation, 0, 100);
  const state = getRetailSwarmState(participationNumber);
  const visual = retailSwarmValues.visualByState[state];
  const riskEffect = retailSwarmValues.stateEffects[state];

  return {
    state,
    participationNumber,
    tokenKind: "abstract_token",
    tokenCount: Math.round(scaleParticipation(participationNumber, "minCount", "maxCount")),
    density: round2(scaleParticipation(participationNumber, "minDensity", "maxDensity")),
    speed: round2(scaleParticipation(participationNumber, "minSpeed", "maxSpeed")),
    movement: visual.movement,
    warningVisual: visual.warningVisual,
    panicVisual: visual.panicVisual,
    usesAbstractTokens: true,
    riskEffect
  };
}

export function applyRetailSwarmRiskEffects(state: IntradayState): RetailSwarmEffectResult {
  const model = calculateRetailSwarmModel(state);
  const effect = model.riskEffect;
  const applied =
    effect.marketPressureDelta !== 0 ||
    effect.volatilityDelta !== 0 ||
    effect.surveillanceDelta !== 0;

  if (!applied) {
    return {
      state,
      model,
      applied: false
    };
  }

  return {
    state: applyIntradayStatUpdate(
      {
        ...state,
        marketPressure: state.marketPressure + effect.marketPressureDelta
      },
      {
        volatility: state.volatility + effect.volatilityDelta,
        surveillance: state.surveillance + effect.surveillanceDelta
      }
    ),
    model,
    applied: true
  };
}

function scaleParticipation(
  participationNumber: number,
  minKey: "minCount" | "minDensity" | "minSpeed",
  maxKey: "maxCount" | "maxDensity" | "maxSpeed"
): number {
  const { tokens } = retailSwarmValues;
  const normalized = clamp(participationNumber, 0, 100) / 100;
  return tokens[minKey] + (tokens[maxKey] - tokens[minKey]) * normalized;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

