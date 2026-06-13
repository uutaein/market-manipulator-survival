import { generateStock, type GeneratedMarketBar } from "stock-market-gen";
import { priceTickValues } from "../balancing/priceTickValues";
import { runDefaults } from "../balancing/runDefaults";
import { createSeededRandom } from "../random/SeededRandom";
import { clamp, type IntradayState } from "./intradayState";

export interface PriceMotionSimulationContext {
  readonly runSeed: string;
  readonly dayIndex: number;
}

export interface PriceMotionSimulation {
  readonly meanReversion: number;
  readonly targetResistance: number;
  readonly overheatDrag: number;
  readonly pullbackShock: number;
  readonly reboundSupport: number;
  readonly externalSimulatorImpulse: number;
  readonly externalSimulatorVolumeFactor: number;
  readonly simulatorAdjustment: number;
}

export function simulatePriceMotion(
  state: IntradayState,
  context: PriceMotionSimulationContext
): PriceMotionSimulation {
  const { simulator } = priceTickValues;
  const price = state.priceChangePercent;
  const random = createSeededRandom(
    `${context.runSeed}:day:${context.dayIndex}:price-motion:${Math.floor(state.priceTickIndex / 5)}`
  );
  const positivePressure = Math.max(0, state.marketPressure);
  const overheatedParticipation = Math.max(0, state.personalParticipation - simulator.overheatParticipationStart);
  const overTarget = Math.max(0, price - runDefaults.targetBandMin);
  const nearCrash = Math.max(0, runDefaults.crashLine + simulator.reboundDistanceFromCrash - price);
  const pullbackChance = clamp(
    simulator.pullbackBaseChance +
      Math.max(0, price) * simulator.pullbackChancePerPositivePrice +
      state.volatility * simulator.pullbackChancePerVolatility +
      positivePressure * simulator.pullbackChancePerPressure,
    0,
    simulator.pullbackMaxChance
  );
  const pullbackShock =
    random.next() < pullbackChance
      ? -(
          simulator.pullbackBaseStrength +
          random.next() * simulator.pullbackRandomStrength +
          Math.max(0, price) * simulator.pullbackStrengthPerPositivePrice
        )
      : 0;
  const meanReversion = -price * simulator.meanReversion;
  const targetResistance = -overTarget * simulator.targetResistance;
  const overheatDrag = -(overheatedParticipation * Math.max(0, price) * simulator.overheatDrag);
  const reboundSupport = nearCrash * simulator.reboundSupport;
  const externalSimulation = stockMarketGenAdapter.simulate(state, context);
  const simulatorAdjustment =
    meanReversion +
    targetResistance +
    overheatDrag +
    pullbackShock +
    reboundSupport +
    externalSimulation.externalSimulatorImpulse;

  return {
    meanReversion: round4(meanReversion),
    targetResistance: round4(targetResistance),
    overheatDrag: round4(overheatDrag),
    pullbackShock: round4(pullbackShock),
    reboundSupport: round4(reboundSupport),
    externalSimulatorImpulse: round4(externalSimulation.externalSimulatorImpulse),
    externalSimulatorVolumeFactor: round4(externalSimulation.externalSimulatorVolumeFactor),
    simulatorAdjustment: round4(simulatorAdjustment)
  };
}

interface PriceMotionAdapterResult {
  readonly externalSimulatorImpulse: number;
  readonly externalSimulatorVolumeFactor: number;
}

interface PriceMotionAdapter {
  simulate(state: IntradayState, context: PriceMotionSimulationContext): PriceMotionAdapterResult;
}

const stockMarketGenAdapter: PriceMotionAdapter = {
  simulate(state, context) {
    const { simulator } = priceTickValues;
    const startPrice = Math.max(1, simulator.externalStartPriceBase + state.priceChangePercent);
    const drift = clamp(
      state.marketPressure * simulator.externalDriftPerPressure +
        state.activeNewsPricePressure * simulator.externalDriftPerNewsPressure +
        state.marketAftereffectPressure * simulator.externalDriftPerAftereffectPressure,
      simulator.externalMinDrift,
      simulator.externalMaxDrift
    );
    const volatility = Math.max(
      0,
      simulator.externalVolatilityBase + state.volatility * simulator.externalVolatilityPerGameVolatility
    );

    try {
      const generated = generateStock({
        symbol: "MMS",
        name: "Fictional Session",
        sector: "Fictional Market",
        kind: "stock",
        startPrice,
        bars: simulator.externalBars,
        interval: "1d",
        startDate: Date.UTC(2026, 0, 1),
        drift,
        volatility,
        seed: `${context.runSeed}:day:${context.dayIndex}:stock-market-gen:${state.priceTickIndex}`
      });
      return convertGeneratedBarsToImpulse(generated.bars);
    } catch {
      return {
        externalSimulatorImpulse: 0,
        externalSimulatorVolumeFactor: 1
      };
    }
  }
};

function convertGeneratedBarsToImpulse(bars: readonly GeneratedMarketBar[]): PriceMotionAdapterResult {
  const { simulator } = priceTickValues;
  const latest = bars.at(-1);
  const previous = bars.at(-2);

  if (!latest || !previous || previous.close <= 0) {
    return {
      externalSimulatorImpulse: 0,
      externalSimulatorVolumeFactor: 1
    };
  }

  const generatedMovePercent = ((latest.close - previous.close) / previous.close) * 100;
  const averageVolume = Math.max(1, bars.reduce((total, bar) => total + bar.volume, 0) / bars.length);
  const volumeRatio = latest.volume / averageVolume;

  return {
    externalSimulatorImpulse: clamp(
      generatedMovePercent * simulator.externalImpulseScale,
      -simulator.externalImpulseClamp,
      simulator.externalImpulseClamp
    ),
    externalSimulatorVolumeFactor: clamp(
      1 + (volumeRatio - 1) * simulator.externalVolumeFactorScale,
      simulator.externalVolumeFactorMin,
      simulator.externalVolumeFactorMax
    )
  };
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
