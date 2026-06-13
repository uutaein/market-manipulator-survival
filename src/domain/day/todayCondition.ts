import { createSeededRandom } from "../random/SeededRandom";
import type { RunState } from "../run/runState";

export interface TodayCondition {
  readonly attentionShiftPercent: number;
  readonly volatilityShiftPercent: number;
  readonly liquidityShiftPercent: number;
  readonly surveillanceSensitivityShiftPercent: number;
}

export function generateTodayCondition(runState: RunState, dayIndex: number): TodayCondition {
  const random = createSeededRandom(`${runState.runSeed}:day:${dayIndex}:today-condition`);

  return {
    attentionShiftPercent: random.nextInt(-15, 16),
    volatilityShiftPercent: random.nextInt(-15, 16),
    liquidityShiftPercent: random.nextInt(-15, 16),
    surveillanceSensitivityShiftPercent: random.nextInt(-15, 16)
  };
}
