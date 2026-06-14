import type {
  ContractEvaluationResult,
  ContractMandate,
  ContractObservation,
  ContractObjective,
  ContractObjectiveEvaluation
} from "./contractTypes";

export function evaluateContractObjectives(
  mandate: ContractMandate,
  observations: readonly ContractObservation[]
): ContractEvaluationResult {
  const sortedObservations = [...observations].sort((left, right) => {
    if (left.day !== right.day) {
      return left.day - right.day;
    }

    return (left.elapsedSec ?? Number.MAX_SAFE_INTEGER) - (right.elapsedSec ?? Number.MAX_SAFE_INTEGER);
  });
  const objectiveResults = mandate.objectives.map((objective) =>
    evaluateContractObjective(mandate, objective, sortedObservations)
  );
  const completedObjectives = objectiveResults.filter((result) => result.status === "completed").length;
  const failedObjectives = objectiveResults.filter((result) => result.status === "failed").length;

  return {
    contractId: mandate.id,
    objectiveResults,
    successful: completedObjectives === mandate.objectives.length && failedObjectives === 0,
    failed: failedObjectives > 0,
    completedObjectives,
    failedObjectives
  };
}

export function createContractObservation(
  observation: Omit<ContractObservation, "priceChangePercent"> & Partial<Pick<ContractObservation, "priceChangePercent">>
): ContractObservation {
  return {
    ...observation,
    priceChangePercent: observation.priceChangePercent ?? 0
  };
}

function evaluateContractObjective(
  mandate: ContractMandate,
  objective: ContractObjective,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  switch (objective.type) {
    case "touch":
      return evaluateTouchObjective(mandate, objective, observations);
    case "maintain":
      return evaluateMaintainObjective(mandate, objective, observations);
    case "close_above":
      return evaluateCloseAboveObjective(objective, observations);
    case "close_below":
      return evaluateCloseBelowObjective(objective, observations);
    case "close_inside_band":
      return evaluateCloseInsideBandObjective(objective, observations);
    case "never_break":
      return evaluateNeverBreakObjective(objective, observations);
    case "rank":
      return evaluateRankObjective(objective, observations);
    case "value":
      return evaluateValueObjective(objective, observations);
    case "touch_then_maintain":
      return evaluateTouchThenMaintainObjective(mandate, objective, observations);
  }
}

function evaluateTouchObjective(
  mandate: ContractMandate,
  objective: Extract<ContractObjective, { type: "touch" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const direction = objective.direction ?? inferTouchDirection(mandate, objective.targetPrice, observations);
  const eligibleObservations = observations.filter((observation) => observation.day <= objective.deadlineDay);
  const touched = eligibleObservations.some((observation) =>
    direction === "upward" ? observation.price >= objective.targetPrice : observation.price <= objective.targetPrice
  );
  const deadlinePassed = getLatestClosedDay(observations) >= objective.deadlineDay;

  return {
    objectiveId: objective.id,
    objectiveType: objective.type,
    status: touched ? "completed" : deadlinePassed ? "failed" : "pending",
    progress: touched ? 1 : 0,
    required: 1,
    reason: touched
      ? "target touched before deadline"
      : deadlinePassed
        ? "deadline passed before target touch"
        : "target not touched yet"
  };
}

function evaluateMaintainObjective(
  mandate: ContractMandate,
  objective: Extract<ContractObjective, { type: "maintain" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const maintainedDays = new Set(
    observations
      .filter(
        (observation) =>
          observation.kind === "day_close" &&
          observation.price >= objective.lowerPrice &&
          observation.price <= objective.upperPrice
      )
      .map((observation) => observation.day)
  );
  const progress = maintainedDays.size;
  const latestClosedDay = getLatestClosedDay(observations);
  const remainingCloseDays = Math.max(0, mandate.durationDays - latestClosedDay);
  const impossible = progress + remainingCloseDays < objective.requiredDays;

  return {
    objectiveId: objective.id,
    objectiveType: objective.type,
    status: progress >= objective.requiredDays ? "completed" : impossible ? "failed" : "pending",
    progress,
    required: objective.requiredDays,
    reason:
      progress >= objective.requiredDays
        ? "required maintained Days reached"
        : impossible
          ? "not enough contract Days remain to maintain band"
        : "more maintained Day closes required"
  };
}

function evaluateCloseAboveObjective(
  objective: Extract<ContractObjective, { type: "close_above" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const close = findDayClose(observations, objective.day);
  const completed = close ? close.price >= objective.targetPrice : false;

  return createCloseEvaluation(objective.id, objective.type, close !== undefined, completed);
}

function evaluateCloseBelowObjective(
  objective: Extract<ContractObjective, { type: "close_below" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const close = findDayClose(observations, objective.day);
  const completed = close ? close.price <= objective.targetPrice : false;

  return createCloseEvaluation(objective.id, objective.type, close !== undefined, completed);
}

function evaluateCloseInsideBandObjective(
  objective: Extract<ContractObjective, { type: "close_inside_band" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const close = findDayClose(observations, objective.day);
  const completed = close ? close.price >= objective.lowerPrice && close.price <= objective.upperPrice : false;

  return createCloseEvaluation(objective.id, objective.type, close !== undefined, completed);
}

function evaluateNeverBreakObjective(
  objective: Extract<ContractObjective, { type: "never_break" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const eligibleObservations = observations.filter((observation) => observation.day <= objective.durationDays);
  const broken = eligibleObservations.some(
    (observation) =>
      (objective.lowerPrice !== undefined && observation.price < objective.lowerPrice) ||
      (objective.upperPrice !== undefined && observation.price > objective.upperPrice)
  );
  const latestClosedDay = getLatestClosedDay(observations);

  if (broken) {
    return {
      objectiveId: objective.id,
      objectiveType: objective.type,
      status: "failed",
      progress: 0,
      required: 1,
      reason: "forbidden break occurred"
    };
  }

  return {
    objectiveId: objective.id,
    objectiveType: objective.type,
    status: latestClosedDay >= objective.durationDays ? "completed" : "pending",
    progress: Math.min(latestClosedDay, objective.durationDays),
    required: objective.durationDays,
    reason: latestClosedDay >= objective.durationDays ? "break line defended" : "contract period still active"
  };
}

function evaluateRankObjective(
  objective: Extract<ContractObjective, { type: "rank" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const completed = observations.some(
    (observation) =>
      observation.day <= objective.deadlineDay &&
      observation.marketDashboardRank !== null &&
      observation.marketDashboardRank <= objective.maxRank
  );
  const deadlinePassed = getLatestClosedDay(observations) >= objective.deadlineDay;

  return {
    objectiveId: objective.id,
    objectiveType: objective.type,
    status: completed ? "completed" : deadlinePassed ? "failed" : "pending",
    progress: completed ? 1 : 0,
    required: 1,
    reason: completed
      ? "rank target reached"
      : deadlinePassed
        ? "rank deadline passed"
        : "rank target not reached yet"
  };
}

function evaluateValueObjective(
  objective: Extract<ContractObjective, { type: "value" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const maxValue = observations.reduce(
    (value, observation) =>
      observation.day <= objective.deadlineDay ? Math.max(value, observation.marketDashboardValue) : value,
    0
  );
  const deadlinePassed = getLatestClosedDay(observations) >= objective.deadlineDay;

  return {
    objectiveId: objective.id,
    objectiveType: objective.type,
    status: maxValue >= objective.minValue ? "completed" : deadlinePassed ? "failed" : "pending",
    progress: maxValue,
    required: objective.minValue,
    reason: maxValue >= objective.minValue
      ? "VALUE target reached"
      : deadlinePassed
        ? "VALUE deadline passed"
        : "VALUE target not reached yet"
  };
}

function evaluateTouchThenMaintainObjective(
  mandate: ContractMandate,
  objective: Extract<ContractObjective, { type: "touch_then_maintain" }>,
  observations: readonly ContractObservation[]
): ContractObjectiveEvaluation {
  const direction = objective.direction ?? inferTouchDirection(mandate, objective.targetPrice, observations);
  const touchObservation = observations.find(
    (observation) =>
      observation.day <= objective.touchDeadlineDay &&
      (direction === "upward" ? observation.price >= objective.targetPrice : observation.price <= objective.targetPrice)
  );

  if (!touchObservation) {
    const touchDeadlinePassed = getLatestClosedDay(observations) >= objective.touchDeadlineDay;

    return {
      objectiveId: objective.id,
      objectiveType: objective.type,
      status: touchDeadlinePassed ? "failed" : "pending",
      progress: 0,
      required: objective.maintainDays,
      reason: touchDeadlinePassed
        ? "touch deadline passed before maintenance could start"
        : "touch required before maintenance starts"
    };
  }

  const maintainedDays = new Set(
    observations
      .filter(
        (observation) =>
          observation.kind === "day_close" &&
          observation.day >= touchObservation.day &&
          observation.price >= objective.lowerPrice &&
          observation.price <= objective.upperPrice
      )
      .map((observation) => observation.day)
  );
  const progress = maintainedDays.size;
  const latestClosedDay = getLatestClosedDay(observations);
  const remainingCloseDays = Math.max(0, mandate.durationDays - latestClosedDay);
  const impossible = progress + remainingCloseDays < objective.maintainDays;

  return {
    objectiveId: objective.id,
    objectiveType: objective.type,
    status: progress >= objective.maintainDays ? "completed" : impossible ? "failed" : "pending",
    progress,
    required: objective.maintainDays,
    reason:
      progress >= objective.maintainDays
        ? "touch and maintenance requirements completed"
        : impossible
          ? "not enough contract Days remain after touch"
        : "maintenance still required after touch"
  };
}

function createCloseEvaluation(
  objectiveId: string,
  objectiveType: ContractObjective["type"],
  hasClose: boolean,
  completed: boolean
): ContractObjectiveEvaluation {
  return {
    objectiveId,
    objectiveType,
    status: completed ? "completed" : hasClose ? "failed" : "pending",
    progress: completed ? 1 : 0,
    required: 1,
    reason: completed ? "close condition completed" : hasClose ? "close condition failed" : "close not observed yet"
  };
}

function findDayClose(observations: readonly ContractObservation[], day: number): ContractObservation | undefined {
  return observations.find((observation) => observation.kind === "day_close" && observation.day === day);
}

function getLatestClosedDay(observations: readonly ContractObservation[]): number {
  return observations.reduce(
    (latestDay, observation) =>
      observation.kind === "day_close" ? Math.max(latestDay, observation.day) : latestDay,
    0
  );
}

function inferTouchDirection(
  mandate: ContractMandate,
  targetPrice: number,
  observations: readonly ContractObservation[]
): "upward" | "downward" {
  const startPrice = observations.find((observation) => observation.kind === "contract_start")?.price ?? mandate.referencePrice;

  return targetPrice >= startPrice ? "upward" : "downward";
}
