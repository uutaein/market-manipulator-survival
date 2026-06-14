import type { ManualActionId } from "../balancing/manualActionValues";
import { applyIntradayStatUpdate, type IntradayState } from "../intraday/intradayState";
import type { ContractDirection, ContractEvaluationResult, ContractMandate } from "./contractTypes";

export type ContractManualActionFit = "favored" | "neutral" | "risky";

export interface ContractManualActionFitResult {
  readonly state: IntradayState;
  readonly actionId: ManualActionId;
  readonly fit: ContractManualActionFit;
  readonly message: string;
  readonly sideEffectPenaltyDelta: number;
  readonly efficiencyBonusDelta: number;
}

interface ContractActionDelta {
  readonly marketPressure: number;
  readonly marketLiquidity: number;
  readonly personalParticipation: number;
  readonly surveillance: number;
  readonly volatility: number;
}

const actionLabels: Record<ManualActionId, string> = {
  liquidity_supply: "유동성 공급",
  price_push: "매수봇",
  overheat_cooldown: "매도봇",
  position_settlement: "포지션 정리"
};

export function applyContractManualActionFit(
  state: IntradayState,
  mandate: ContractMandate,
  actionId: ManualActionId,
  evaluation: ContractEvaluationResult | null
): ContractManualActionFitResult {
  const fit = getContractManualActionFit(mandate, actionId, evaluation);
  const delta = getContractActionDelta(mandate.direction, actionId, fit, state, evaluation);
  const nextState = applyIntradayStatUpdate(state, {
    marketPressure: state.marketPressure + delta.marketPressure,
    marketLiquidity: state.marketLiquidity + delta.marketLiquidity,
    personalParticipation: state.personalParticipation + delta.personalParticipation,
    surveillance: state.surveillance + delta.surveillance,
    volatility: state.volatility + delta.volatility
  });

  return {
    state: nextState,
    actionId,
    fit,
    message: createContractActionFitMessage(mandate, actionId, fit, evaluation),
    sideEffectPenaltyDelta: fit === "risky" ? getRiskPenalty(mandate.direction, actionId) : 0,
    efficiencyBonusDelta: fit === "favored" ? getEfficiencyBonus(mandate.direction, actionId, evaluation) : 0
  };
}

export function getContractRecommendedManualActionLabels(mandate: ContractMandate): readonly string[] {
  return getFavoredActionIds(mandate.direction).map((actionId) => actionLabels[actionId]);
}

function getContractManualActionFit(
  mandate: ContractMandate,
  actionId: ManualActionId,
  evaluation: ContractEvaluationResult | null
): ContractManualActionFit {
  if (mandate.direction === "attention" && actionId === "position_settlement") {
    return evaluation?.successful ? "favored" : "neutral";
  }

  if ((mandate.direction === "upward" || mandate.direction === "defense") && actionId === "position_settlement") {
    return evaluation?.successful ? "neutral" : "risky";
  }

  if (getFavoredActionIds(mandate.direction).includes(actionId)) {
    return "favored";
  }

  if (getRiskyActionIds(mandate.direction).includes(actionId)) {
    return "risky";
  }

  return "neutral";
}

function getFavoredActionIds(direction: ContractDirection): readonly ManualActionId[] {
  switch (direction) {
    case "upward":
      return ["liquidity_supply", "price_push"];
    case "downward":
      return ["overheat_cooldown", "position_settlement"];
    case "range":
      return ["liquidity_supply", "overheat_cooldown"];
    case "defense":
      return ["liquidity_supply", "price_push"];
    case "attention":
      return ["liquidity_supply", "price_push"];
    case "stealth":
      return ["liquidity_supply", "overheat_cooldown"];
  }
}

function getRiskyActionIds(direction: ContractDirection): readonly ManualActionId[] {
  switch (direction) {
    case "upward":
      return ["overheat_cooldown"];
    case "downward":
      return ["price_push", "liquidity_supply"];
    case "range":
      return ["price_push"];
    case "defense":
      return ["overheat_cooldown", "position_settlement"];
    case "attention":
      return ["overheat_cooldown"];
    case "stealth":
      return ["price_push"];
  }
}

function getContractActionDelta(
  direction: ContractDirection,
  actionId: ManualActionId,
  fit: ContractManualActionFit,
  state: IntradayState,
  evaluation: ContractEvaluationResult | null
): ContractActionDelta {
  if (fit === "neutral") {
    return createDelta({});
  }

  if (fit === "risky") {
    return getRiskyActionDelta(direction, state);
  }

  if (actionId === "position_settlement" && evaluation?.successful) {
    return createDelta({
      marketPressure: direction === "downward" ? -1.8 : -0.8,
      marketLiquidity: 2.4,
      personalParticipation: direction === "attention" ? 2.6 : 1.2,
      surveillance: 0.4,
      volatility: 0.8
    });
  }

  switch (direction) {
    case "upward":
    case "attention":
      return createDelta({
        marketPressure: 3.2,
        marketLiquidity: 2.4,
        personalParticipation: 2.2,
        surveillance: 0.5,
        volatility: 0.6
      });
    case "downward":
      return createDelta({
        marketPressure: -3.4,
        marketLiquidity: 1.8,
        personalParticipation: -0.6,
        surveillance: 0.4,
        volatility: 0.8
      });
    case "range":
      return createDelta({
        marketPressure: getBandCorrectionPressure(state),
        marketLiquidity: 3,
        surveillance: -0.2,
        volatility: -2.2
      });
    case "defense":
      return createDelta({
        marketPressure: 3,
        marketLiquidity: 2.8,
        personalParticipation: 1,
        surveillance: 0.2,
        volatility: -0.8
      });
    case "stealth":
      return createDelta({
        marketPressure: getBandCorrectionPressure(state) * 0.5,
        marketLiquidity: 2.4,
        surveillance: -0.8,
        volatility: -1.8
      });
  }
}

function getRiskyActionDelta(direction: ContractDirection, state: IntradayState): ContractActionDelta {
  switch (direction) {
    case "downward":
      return createDelta({
        marketPressure: 3.8,
        marketLiquidity: -1.2,
        personalParticipation: 2.4,
        surveillance: 1.6,
        volatility: 1.8
      });
    case "range":
    case "defense":
    case "stealth":
      return createDelta({
        marketPressure: state.priceChangePercent >= 0 ? 2.4 : -2.4,
        marketLiquidity: -0.8,
        personalParticipation: 1.2,
        surveillance: 1.4,
        volatility: 3
      });
    case "upward":
    case "attention":
      return createDelta({
        marketPressure: -2.8,
        marketLiquidity: -1,
        personalParticipation: -0.8,
        surveillance: 1.2,
        volatility: 2.2
      });
  }
}

function getBandCorrectionPressure(state: IntradayState): number {
  if (state.priceChangePercent > 3) {
    return -1.6;
  }

  if (state.priceChangePercent < -2) {
    return 1.8;
  }

  return state.marketPressure > 0 ? -1.2 : 1.2;
}

function getRiskPenalty(direction: ContractDirection, actionId: ManualActionId): number {
  if (direction === "defense" && actionId === "position_settlement") {
    return 1.8;
  }

  if (direction === "downward" && actionId === "price_push") {
    return 1.7;
  }

  return 1.2;
}

function getEfficiencyBonus(
  direction: ContractDirection,
  actionId: ManualActionId,
  evaluation: ContractEvaluationResult | null
): number {
  if (actionId === "position_settlement" && evaluation?.successful) {
    return 1.4;
  }

  if (direction === "range" || direction === "defense") {
    return 0.8;
  }

  return 0.6;
}

function createContractActionFitMessage(
  mandate: ContractMandate,
  actionId: ManualActionId,
  fit: ContractManualActionFit,
  evaluation: ContractEvaluationResult | null
): string {
  const prefix = fit === "favored" ? "적합" : fit === "risky" ? "위험" : "보통";
  const actionLabel = actionLabels[actionId];

  if (actionId === "position_settlement" && evaluation?.successful) {
    return `의뢰 도구 ${prefix}: ${actionLabel} - 조건 충족 후 비용 회수`;
  }

  if (fit === "favored") {
    return `의뢰 도구 ${prefix}: ${actionLabel} - ${getDirectionIntentLabel(mandate.direction)}와 맞음`;
  }

  if (fit === "risky") {
    return `의뢰 도구 ${prefix}: ${actionLabel} - ${getDirectionIntentLabel(mandate.direction)}와 충돌`;
  }

  return `의뢰 도구 ${prefix}: ${actionLabel}`;
}

function getDirectionIntentLabel(direction: ContractDirection): string {
  switch (direction) {
    case "upward":
      return "상방 터치";
    case "downward":
      return "하방 터치";
    case "range":
      return "밴드 유지";
    case "defense":
      return "하단 방어";
    case "attention":
      return "관심 순위";
    case "stealth":
      return "저노출 운용";
  }
}

function createDelta(delta: Partial<ContractActionDelta>): ContractActionDelta {
  return {
    marketPressure: delta.marketPressure ?? 0,
    marketLiquidity: delta.marketLiquidity ?? 0,
    personalParticipation: delta.personalParticipation ?? 0,
    surveillance: delta.surveillance ?? 0,
    volatility: delta.volatility ?? 0
  };
}
