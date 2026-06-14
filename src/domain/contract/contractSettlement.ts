import type {
  ContractEvaluationResult,
  ContractMandate,
  ContractObjective,
  ContractSettlementInput,
  ContractSettlementResult
} from "./contractTypes";

export function calculateContractDifficulty(mandate: ContractMandate, assetInfluenceResistance = 1): number {
  const objectiveDifficulty = mandate.objectives.reduce(
    (total, objective) => total + calculateObjectiveDifficulty(mandate, objective),
    0
  );
  const durationPressure = Math.max(0, 6 - mandate.durationDays) * 0.65;
  const riskPressure = mandate.riskLevel * 0.45;
  const resistancePressure = Math.max(0, assetInfluenceResistance - 1) * 0.35;
  const confidencePressure = Math.max(0, 70 - mandate.reportConfidence) * 0.04;

  return round2(objectiveDifficulty + durationPressure + riskPressure + resistancePressure + confidencePressure);
}

export function calculateRecommendedFixedReward(mandate: ContractMandate, assetInfluenceResistance = 1): number {
  const difficulty = calculateContractDifficulty(mandate, assetInfluenceResistance);

  return Math.round(8 * Math.exp(difficulty * 0.08));
}

export function settleContract(
  mandate: ContractMandate,
  evaluation: ContractEvaluationResult,
  input: ContractSettlementInput
): ContractSettlementResult {
  const failedObjectivePenalty =
    input.failedObjectivePenalty ?? Math.max(0, mandate.objectives.length - evaluation.completedObjectives) * 4;
  const fixedRewardPaid = evaluation.successful ? mandate.fixedReward : 0;
  const netPerformance = round1(
    fixedRewardPaid -
      input.budgetSpent -
      input.surveillanceCost -
      input.socialCost -
      input.sideEffectPenalty -
      failedObjectivePenalty
  );

  return {
    contractId: mandate.id,
    successful: evaluation.successful,
    fixedReward: mandate.fixedReward,
    fixedRewardPaid,
    budgetSpent: round1(input.budgetSpent),
    surveillanceCost: round1(input.surveillanceCost),
    socialCost: round1(input.socialCost),
    sideEffectPenalty: round1(input.sideEffectPenalty),
    failedObjectivePenalty: round1(failedObjectivePenalty),
    netPerformance,
    efficiencyGrade: getContractEfficiencyGrade(netPerformance, mandate.fixedReward)
  };
}

function calculateObjectiveDifficulty(mandate: ContractMandate, objective: ContractObjective): number {
  switch (objective.type) {
    case "touch":
      return calculatePriceDistanceDifficulty(mandate.referencePrice, objective.targetPrice);
    case "maintain":
      return calculateBandDifficulty(mandate.referencePrice, objective.lowerPrice, objective.upperPrice) +
        objective.requiredDays * 0.8;
    case "close_above":
    case "close_below":
      return calculatePriceDistanceDifficulty(mandate.referencePrice, objective.targetPrice) + 0.8;
    case "close_inside_band":
      return calculateBandDifficulty(mandate.referencePrice, objective.lowerPrice, objective.upperPrice) + 0.8;
    case "never_break":
      return objective.durationDays * 0.7;
    case "rank":
      return Math.max(0, 10 - objective.maxRank) * 0.7;
    case "value":
      return Math.log10(Math.max(1, objective.minValue)) * 0.55;
    case "touch_then_maintain":
      return calculatePriceDistanceDifficulty(mandate.referencePrice, objective.targetPrice) +
        calculateBandDifficulty(mandate.referencePrice, objective.lowerPrice, objective.upperPrice) +
        objective.maintainDays * 0.8;
  }
}

function calculatePriceDistanceDifficulty(referencePrice: number, targetPrice: number): number {
  return (Math.abs(targetPrice - referencePrice) / Math.max(1, referencePrice)) * 100;
}

function calculateBandDifficulty(referencePrice: number, lowerPrice: number, upperPrice: number): number {
  const bandWidthPercent = ((upperPrice - lowerPrice) / Math.max(1, referencePrice)) * 100;

  return Math.max(0, 12 - bandWidthPercent) * 0.6;
}

function getContractEfficiencyGrade(netPerformance: number, fixedReward: number): ContractSettlementResult["efficiencyGrade"] {
  const score = fixedReward <= 0 ? netPerformance : (netPerformance / fixedReward) * 100;

  if (score >= 80) {
    return "S";
  }

  if (score >= 60) {
    return "A";
  }

  if (score >= 35) {
    return "B";
  }

  if (score >= 10) {
    return "C";
  }

  if (score >= 0) {
    return "D";
  }

  return "F";
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
