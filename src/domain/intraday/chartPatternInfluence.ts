import { createSeededRandom } from "../random/SeededRandom";
import { clamp, clampIntradayState, type IntradayState } from "./intradayState";

export interface ChartPatternHistoryPoint {
  readonly elapsedSec: number;
  readonly priceChangePercent: number;
  readonly fictionalVolume: number;
}

export interface ChartPatternContext {
  readonly runSeed: string;
  readonly dayIndex: number;
}

export interface ChartPatternSyntheticPoint {
  readonly elapsedOffsetSec: number;
  readonly priceChangePercent: number;
  readonly volumeMultiplier: number;
}

export interface ChartPatternInfluenceResult {
  readonly state: IntradayState;
  readonly applied: boolean;
  readonly label: string | null;
  readonly points: readonly ChartPatternSyntheticPoint[];
}

export function applyChartPatternInfluence(
  state: IntradayState,
  history: readonly ChartPatternHistoryPoint[],
  context: ChartPatternContext
): ChartPatternInfluenceResult {
  const recent = getRecentHistory(history, 90);

  if (recent.length < 8 || state.isPaused) {
    return noPattern(state);
  }

  const low = Math.min(...recent.map((point) => point.priceChangePercent));
  const high = Math.max(...recent.map((point) => point.priceChangePercent));
  const range = high - low;

  if (range < 0.8) {
    return noPattern(state);
  }

  const fibInfluence = calculateFibonacciInfluence(state, low, high);
  const waveInfluence = calculateWaveInfluence(state, context);
  const combinedDelta = round2(clamp(fibInfluence.delta + waveInfluence.delta, -1.15, 1.45));

  if (Math.abs(combinedDelta) < 0.08) {
    return noPattern(state);
  }

  const nextPriceChangePercent = round2(state.priceChangePercent + combinedDelta);
  const volumeMultiplier = round2(clamp(1.15 + Math.abs(combinedDelta) * 0.9 + waveInfluence.volumeBonus, 1.1, 3.2));
  const label = fibInfluence.label ?? waveInfluence.label;

  return {
    state: clampIntradayState({
      ...state,
      priceChangePercent: nextPriceChangePercent,
      priceDeltaPerTick: state.priceDeltaPerTick + combinedDelta
    }),
    applied: true,
    label,
    points: [
      {
        elapsedOffsetSec: -0.65,
        priceChangePercent: state.priceChangePercent,
        volumeMultiplier: Math.max(0.9, volumeMultiplier - 0.45)
      },
      {
        elapsedOffsetSec: -0.25,
        priceChangePercent: round2(state.priceChangePercent + combinedDelta * 0.72),
        volumeMultiplier
      },
      {
        elapsedOffsetSec: -0.04,
        priceChangePercent: nextPriceChangePercent,
        volumeMultiplier: volumeMultiplier + 0.25
      }
    ]
  };
}

function calculateFibonacciInfluence(
  state: IntradayState,
  low: number,
  high: number
): { readonly delta: number; readonly label: string | null } {
  const range = high - low;
  const price = state.priceChangePercent;
  const pressureBias = getPressureBias(state);
  const fib382 = high - range * 0.382;
  const fib50 = high - range * 0.5;
  const fib618 = high - range * 0.618;
  const extension618 = high + range * 0.618;
  const extension100 = high + range;

  if (pressureBias > 0.3 && isNear(price, fib382, 0.34)) {
    return { delta: 0.22 + pressureBias * 0.34, label: "Fib 38.2 bounce" };
  }

  if (pressureBias > 0.2 && isNear(price, fib50, 0.36)) {
    return { delta: 0.18 + pressureBias * 0.3, label: "Fib 50 bounce" };
  }

  if (pressureBias > 0.1 && isNear(price, fib618, 0.4)) {
    return { delta: 0.15 + pressureBias * 0.26, label: "Fib 61.8 support" };
  }

  if (pressureBias > 0.55 && price > high + 0.08 && price < extension618) {
    return { delta: 0.28 + pressureBias * 0.52, label: "Fib extension push" };
  }

  if (pressureBias < 0.25 && price >= extension618 - 0.3) {
    return { delta: -0.16 - Math.max(0, price - extension618) * 0.12, label: "Fib extension resistance" };
  }

  if (price >= extension100 && pressureBias < 0.75) {
    return { delta: -0.24, label: "Fib extension exhaustion" };
  }

  return { delta: 0, label: null };
}

function calculateWaveInfluence(
  state: IntradayState,
  context: ChartPatternContext
): { readonly delta: number; readonly volumeBonus: number; readonly label: string | null } {
  const random = createSeededRandom(`${context.runSeed}:day:${context.dayIndex}:wave-offset`);
  const phaseOffset = random.nextInt(0, 18);
  const phase = Math.floor((state.priceTickIndex + phaseOffset) / 12) % 8;
  const bias = getPressureBias(state);
  const amplitude = clamp(0.08 + state.volatility / 260 + Math.abs(bias) * 0.18, 0.08, 0.48);
  const direction = bias >= -0.15 ? 1 : -1;
  const wave = getWavePhase(phase);
  const delta = round2(wave.force * amplitude * direction);

  return {
    delta,
    volumeBonus: wave.volumeBonus,
    label: wave.label
  };
}

function getWavePhase(phase: number): { readonly force: number; readonly volumeBonus: number; readonly label: string } {
  switch (phase) {
    case 0:
      return { force: 0.42, volumeBonus: 0.1, label: "Wave 1 impulse" };
    case 1:
      return { force: -0.32, volumeBonus: 0.04, label: "Wave 2 pullback" };
    case 2:
      return { force: 0.9, volumeBonus: 0.4, label: "Wave 3 expansion" };
    case 3:
      return { force: -0.26, volumeBonus: 0.06, label: "Wave 4 digestion" };
    case 4:
      return { force: 0.54, volumeBonus: 0.22, label: "Wave 5 push" };
    case 5:
      return { force: -0.44, volumeBonus: 0.16, label: "A correction" };
    case 6:
      return { force: 0.28, volumeBonus: 0.08, label: "B rebound" };
    default:
      return { force: -0.5, volumeBonus: 0.2, label: "C correction" };
  }
}

function getRecentHistory(
  history: readonly ChartPatternHistoryPoint[],
  lookbackSec: number
): readonly ChartPatternHistoryPoint[] {
  const latestElapsedSec = history[history.length - 1]?.elapsedSec ?? 0;

  return history.filter((point) => latestElapsedSec - point.elapsedSec <= lookbackSec);
}

function getPressureBias(state: IntradayState): number {
  const pressure = state.marketPressure / 85;
  const participation = (state.personalParticipation - 35) / 70;
  const liquidity = (state.marketLiquidity - 45) / 75;
  const news = state.activeNewsPricePressure * 12;
  const aftereffect = state.marketAftereffectPressure * 9;
  const competition = -state.competitionPressure / 170;

  return clamp(pressure + participation + liquidity + news + aftereffect + competition, -1, 1);
}

function isNear(value: number, target: number, tolerance: number): boolean {
  return Math.abs(value - target) <= tolerance;
}

function noPattern(state: IntradayState): ChartPatternInfluenceResult {
  return {
    state,
    applied: false,
    label: null,
    points: []
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
