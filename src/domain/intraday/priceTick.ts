import { priceTickValues } from "../balancing/priceTickValues";
import { createSeededRandom } from "../random/SeededRandom";
import { clamp, clampIntradayState, type IntradayState, type PriceTickComponents } from "./intradayState";

export interface PriceTickContext {
  readonly runSeed: string;
  readonly dayIndex: number;
}

export function runPlayerPriceTick(state: IntradayState, context: PriceTickContext): IntradayState {
  if (state.isPaused) {
    return state;
  }

  const components = calculatePriceTickComponents(state, context);

  return clampIntradayState({
    ...state,
    priceTickIndex: state.priceTickIndex + 1,
    priceDeltaPerTick: components.clampedDelta,
    priceChangePercent: state.priceChangePercent + components.clampedDelta,
    latestPriceComponents: components
  });
}

export function calculatePriceTickComponents(
  state: IntradayState,
  context: PriceTickContext
): PriceTickComponents {
  const { coefficients, baselines, liquidityMultiplier: liquidityConfig, volatilityNoise } = priceTickValues;
  const random = createSeededRandom(`${context.runSeed}:day:${context.dayIndex}:price:${state.priceTickIndex}`);

  const pressure = state.marketPressure * coefficients.marketPressure;
  const participation = (state.personalParticipation - baselines.personalParticipation) * coefficients.personalParticipation;
  const holding = (state.holdingRatio - baselines.holdingRatio) * coefficients.holdingRatio;
  const liquidity = (state.marketLiquidity - baselines.marketLiquidity) * coefficients.marketLiquidity;
  const competition = state.competitionPressure * coefficients.competitionPressure;
  const news = state.activeNewsPricePressure;
  const aftereffect = state.marketAftereffectPressure;
  const directionalDelta = pressure + participation + holding + liquidity + competition + news + aftereffect;
  const liquidityMultiplier = liquidityConfig.base + (state.marketLiquidity / 100) * liquidityConfig.scale;
  const volatilityRandom = random.next() * 2 - 1;
  const noiseRange = volatilityNoise.base + state.volatility * volatilityNoise.perVolatility;
  const volatilityNoiseComponent = volatilityRandom * noiseRange;
  const rawDelta = directionalDelta * liquidityMultiplier + volatilityNoiseComponent;
  const clampedDelta = clamp(
    rawDelta,
    priceTickValues.playerMinDeltaPerTick,
    priceTickValues.playerMaxDeltaPerTick
  );

  return {
    pressure,
    participation,
    holding,
    liquidity,
    competition,
    news,
    aftereffect,
    volatilityNoise: volatilityNoiseComponent,
    directionalDelta,
    liquidityMultiplier,
    rawDelta,
    clampedDelta
  };
}
