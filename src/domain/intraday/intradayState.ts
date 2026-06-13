import type { DayState, PreOpenCardEffect } from "../day/daySetup";
import type { DocumentEventChoiceType, DocumentEventId } from "../balancing/documentEventValues";
import { manualActionIds, type ManualActionId } from "../balancing/manualActionValues";
import { retailSwarmValues } from "../balancing/retailSwarmValues";
import { runDefaults } from "../balancing/runDefaults";
import { createSeededRandom } from "../random/SeededRandom";
import type { RunState } from "../run/runState";
import { getActiveNewsPricePressure, getActiveNewsStatImpact } from "./newsPressure";

export type RetailSwarmState = "interest" | "overheated" | "panic";

export interface PriceTickComponents {
  readonly pressure: number;
  readonly participation: number;
  readonly holding: number;
  readonly liquidity: number;
  readonly competition: number;
  readonly news: number;
  readonly aftereffect: number;
  readonly attentionFade: number;
  readonly orderBookMultiplier: number;
  readonly sellWallDepth: number;
  readonly buyWallDepth: number;
  readonly meanReversion: number;
  readonly targetResistance: number;
  readonly overheatDrag: number;
  readonly pullbackShock: number;
  readonly reboundSupport: number;
  readonly externalSimulatorImpulse: number;
  readonly externalSimulatorVolumeFactor: number;
  readonly simulatorAdjustment: number;
  readonly volatilityNoise: number;
  readonly directionalDelta: number;
  readonly liquidityMultiplier: number;
  readonly rawDelta: number;
  readonly clampedDelta: number;
}

export interface ActiveManualActionEffect {
  readonly actionId: ManualActionId;
  readonly remainingSec: number;
  readonly totalSec: number;
}

export interface IntradayState {
  readonly timeRemainingSec: number;
  readonly isPaused: boolean;
  readonly priceTickIndex: number;
  readonly openingPrice: number;
  readonly currentPrice: number;
  readonly averageEntryPrice: number;
  readonly heldUnits: number;
  readonly fictionalFloatUnits: number;
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
  readonly manualActionEffectMultiplier: number;
  readonly pricePushEffectMultiplier: number;
  readonly overheatCooldownEffectMultiplier: number;
  readonly liquiditySupplyPressureBonus: number;
  readonly upwardActionSurveillanceMultiplier: number;
  readonly positionSettlementSurveillanceMultiplier: number;
  readonly positionSettlementImpactMultiplier: number;
  readonly retailSwarmState: RetailSwarmState;
  readonly manualActionCooldowns: Readonly<Record<ManualActionId, number>>;
  readonly activeManualActionEffects: readonly ActiveManualActionEffect[];
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
  const newsImpact = getActiveNewsStatImpact(runState, dayState.morningNewsItems);
  const holdingRatio = applyEffect(runState.holdingRatio, effect, "holdingRatioDelta");
  const quote = createFictionalQuoteState(runState, dayState, holdingRatio, runDefaults.initialPriceChangePercent);

  return clampIntradayState({
    timeRemainingSec: runDefaults.intradayDurationSec,
    isPaused: false,
    priceTickIndex: 0,
    openingPrice: quote.openingPrice,
    currentPrice: quote.currentPrice,
    averageEntryPrice: quote.averageEntryPrice,
    heldUnits: quote.heldUnits,
    fictionalFloatUnits: quote.fictionalFloatUnits,
    priceChangePercent: runDefaults.initialPriceChangePercent,
    priceDeltaPerTick: 0,
    budget: applyEffect(runState.budget, effect, "budgetDelta"),
    marketPressure: applyEffect(runDefaults.initialMarketPressure, effect, "marketPressureDelta"),
    holdingRatio,
    personalParticipation: runDefaults.initialPersonalParticipation + newsImpact.personalParticipationDelta,
    marketLiquidity: applyEffect(runDefaults.initialMarketLiquidity, effect, "marketLiquidityDelta") + newsImpact.marketLiquidityDelta,
    surveillance: applyEffect(runState.surveillance, effect, "surveillanceDelta") + newsImpact.surveillanceDelta,
    volatility: applyEffect(runDefaults.initialVolatility, effect, "volatilityDelta") + newsImpact.volatilityDelta,
    competitionPressure: runDefaults.initialCompetitionPressure,
    activeNewsPricePressure: getActiveNewsPricePressure(runState, dayState.morningNewsItems),
    marketAftereffectPressure: 0,
    manualActionEffectMultiplier: effect?.manualActionEffectMultiplier ?? 1,
    pricePushEffectMultiplier: effect?.pricePushEffectMultiplier ?? 1,
    overheatCooldownEffectMultiplier: effect?.overheatCooldownEffectMultiplier ?? 1,
    liquiditySupplyPressureBonus: effect?.liquiditySupplyPressureBonus ?? 0,
    upwardActionSurveillanceMultiplier: effect?.upwardActionSurveillanceMultiplier ?? 1,
    positionSettlementSurveillanceMultiplier: effect?.positionSettlementSurveillanceMultiplier ?? 1,
    positionSettlementImpactMultiplier: 1,
    retailSwarmState: "interest",
    manualActionCooldowns: createEmptyManualActionCooldowns(),
    activeManualActionEffects: [],
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
    competitionPressure: clamp01To100(state.competitionPressure),
    positionSettlementImpactMultiplier: clamp(state.positionSettlementImpactMultiplier, 0.4, 1)
  };
  const currentPrice = calculateCurrentPrice(clamped.openingPrice, clamped.priceChangePercent);
  const fictionalFloatUnits = Math.max(1, Math.round(clamped.fictionalFloatUnits));
  const heldUnits = Math.round((fictionalFloatUnits * clamped.holdingRatio) / 100);

  return {
    ...clamped,
    currentPrice,
    fictionalFloatUnits,
    heldUnits,
    retailSwarmState: getRetailSwarmState(clamped.personalParticipation)
  };
}

export interface FictionalQuoteState {
  readonly openingPrice: number;
  readonly currentPrice: number;
  readonly averageEntryPrice: number;
  readonly heldUnits: number;
  readonly fictionalFloatUnits: number;
}

export function createFictionalQuoteState(
  runState: Pick<RunState, "runSeed" | "selectedAssetId">,
  dayState: Pick<DayState, "dayIndex" | "preOpenCardId">,
  holdingRatio: number,
  priceChangePercent: number
): FictionalQuoteState {
  const random = createSeededRandom(`${runState.runSeed}:day:${dayState.dayIndex}:quote:${runState.selectedAssetId}`);
  const openingPrice = roundedToTick(
    random.nextInt(runDefaults.openingPriceMin, runDefaults.openingPriceMax + runDefaults.openingPriceTick),
    runDefaults.openingPriceTick
  );
  const fictionalFloatUnits = roundedToTick(
    random.nextInt(runDefaults.fictionalFloatUnitMin, runDefaults.fictionalFloatUnitMax + runDefaults.fictionalFloatUnitTick),
    runDefaults.fictionalFloatUnitTick
  );
  const entryDiscount =
    dayState.preOpenCardId === "early_positioning"
      ? -getEarlyPositioningEntryPremiumPercent(runState)
      : runDefaults.baselineEntryDiscountPercent;
  const averageEntryPrice = roundedToTick(openingPrice * (1 - entryDiscount / 100), runDefaults.openingPriceTick);
  const heldUnits = Math.round((fictionalFloatUnits * clamp(holdingRatio, 0, 100)) / 100);

  return {
    openingPrice,
    currentPrice: calculateCurrentPrice(openingPrice, priceChangePercent),
    averageEntryPrice,
    heldUnits,
    fictionalFloatUnits
  };
}

export function getEarlyPositioningEntryPremiumPercent(
  runState: Pick<RunState, "runSeed" | "selectedAssetId">
): number {
  const random = createSeededRandom(`${runState.runSeed}:early-positioning-premium:${runState.selectedAssetId}`);
  const min = runDefaults.earlyPositioningEntryPremiumMinPercent;
  const max = runDefaults.earlyPositioningEntryPremiumMaxPercent;

  return roundedToTick(min + random.next() * (max - min), 0.1);
}

export function calculateCurrentPrice(openingPrice: number, priceChangePercent: number): number {
  return roundedToTick(openingPrice * (1 + priceChangePercent / 100), runDefaults.openingPriceTick);
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
  if (personalParticipation >= retailSwarmValues.thresholds.panicMin) {
    return "panic";
  }

  if (personalParticipation >= retailSwarmValues.thresholds.overheatedMin) {
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

function roundedToTick(value: number, tick: number): number {
  return Math.max(tick, Math.round(value / tick) * tick);
}

function applyEffect(
  value: number,
  effect: PreOpenCardEffect | null,
  key: keyof Pick<
    PreOpenCardEffect,
    | "budgetDelta"
    | "holdingRatioDelta"
    | "marketLiquidityDelta"
    | "marketPressureDelta"
    | "surveillanceDelta"
    | "volatilityDelta"
  >
): number {
  return value + (effect?.[key] ?? 0);
}
