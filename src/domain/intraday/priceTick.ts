import { priceTickValues } from "../balancing/priceTickValues";
import { createSeededRandom } from "../random/SeededRandom";
import { clamp, clampIntradayState, type IntradayState, type PriceTickComponents } from "./intradayState";
import { buildOrderBookProfile } from "./orderBook";
import { simulatePriceMotion } from "./priceMotionSimulator";

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
  const attentionGap = Math.max(0, baselines.personalParticipation - state.personalParticipation);
  const unsupportedPrice = Math.max(0, state.priceChangePercent);
  const attentionFade = -(unsupportedPrice * attentionGap * coefficients.unsupportedPriceFade);
  const directionalDelta = pressure + participation + holding + liquidity + competition + news + aftereffect + attentionFade;
  const orderBook = buildOrderBookProfile(state, context);
  const orderBookMultiplier =
    directionalDelta >= 0 ? orderBook.upwardResponsiveness : orderBook.downwardResponsiveness;
  const simulation = simulatePriceMotion(state, context);
  const liquidityMultiplier = liquidityConfig.base + (state.marketLiquidity / 100) * liquidityConfig.scale;
  const volatilityRandom = random.next() * 2 - 1;
  const noiseRange = volatilityNoise.base + state.volatility * volatilityNoise.perVolatility;
  const volatilityNoiseComponent = volatilityRandom * noiseRange;
  const rawDelta =
    directionalDelta * liquidityMultiplier * orderBookMultiplier +
    simulation.simulatorAdjustment +
    volatilityNoiseComponent;
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
    attentionFade,
    orderBookMultiplier,
    sellWallDepth: orderBook.sellWallDepth,
    buyWallDepth: orderBook.buyWallDepth,
    meanReversion: simulation.meanReversion,
    targetResistance: simulation.targetResistance,
    overheatDrag: simulation.overheatDrag,
    pullbackShock: simulation.pullbackShock,
    reboundSupport: simulation.reboundSupport,
    externalSimulatorImpulse: simulation.externalSimulatorImpulse,
    externalSimulatorVolumeFactor: simulation.externalSimulatorVolumeFactor,
    simulatorAdjustment: simulation.simulatorAdjustment,
    volatilityNoise: volatilityNoiseComponent,
    directionalDelta,
    liquidityMultiplier,
    rawDelta,
    clampedDelta
  };
}
