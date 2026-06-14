import type { AssetId } from "../assets/assetCatalog";

export type GameMode = "free" | "contract";

export type ContractSponsorType =
  | "long_holder"
  | "short_seller"
  | "accumulator"
  | "defender"
  | "pump_exit";

export type ContractDirection =
  | "upward"
  | "downward"
  | "range"
  | "defense"
  | "attention"
  | "stealth";

export type ContractObjective =
  | {
      readonly id: string;
      readonly type: "touch";
      readonly targetPrice: number;
      readonly deadlineDay: number;
      readonly direction?: "upward" | "downward";
    }
  | {
      readonly id: string;
      readonly type: "maintain";
      readonly lowerPrice: number;
      readonly upperPrice: number;
      readonly requiredDays: number;
    }
  | {
      readonly id: string;
      readonly type: "close_above";
      readonly targetPrice: number;
      readonly day: number;
    }
  | {
      readonly id: string;
      readonly type: "close_below";
      readonly targetPrice: number;
      readonly day: number;
    }
  | {
      readonly id: string;
      readonly type: "close_inside_band";
      readonly lowerPrice: number;
      readonly upperPrice: number;
      readonly day: number;
    }
  | {
      readonly id: string;
      readonly type: "never_break";
      readonly lowerPrice?: number;
      readonly upperPrice?: number;
      readonly durationDays: number;
    }
  | {
      readonly id: string;
      readonly type: "rank";
      readonly maxRank: number;
      readonly deadlineDay: number;
    }
  | {
      readonly id: string;
      readonly type: "value";
      readonly minValue: number;
      readonly deadlineDay: number;
    }
  | {
      readonly id: string;
      readonly type: "touch_then_maintain";
      readonly targetPrice: number;
      readonly touchDeadlineDay: number;
      readonly lowerPrice: number;
      readonly upperPrice: number;
      readonly maintainDays: number;
      readonly direction?: "upward" | "downward";
    };

export interface ExpertReport {
  readonly direction: ContractDirection;
  readonly lowerPrice?: number;
  readonly upperPrice?: number;
  readonly targetPriceHint?: number;
  readonly confidence: number;
  readonly summary: string;
  readonly revealsExactObjective: boolean;
}

export interface ContractMandate {
  readonly id: string;
  readonly displayName: string;
  readonly sponsorType: ContractSponsorType;
  readonly direction: ContractDirection;
  readonly assetId: AssetId;
  readonly durationDays: number;
  readonly objectives: readonly ContractObjective[];
  readonly fixedReward: number;
  readonly riskLevel: number;
  readonly reportConfidence: number;
  readonly referencePrice: number;
  readonly expertReport: ExpertReport;
}

export type ContractObservationKind = "contract_start" | "intraday_tick" | "day_close" | "contract_event";

export interface ContractObservation {
  readonly day: number;
  readonly elapsedSec: number | null;
  readonly price: number;
  readonly priceChangePercent: number;
  readonly marketDashboardRank: number | null;
  readonly marketDashboardValue: number;
  readonly madness: number;
  readonly surveillance: number;
  readonly kind: ContractObservationKind;
}

export type ContractObjectiveStatus = "pending" | "completed" | "failed";

export interface ContractObjectiveEvaluation {
  readonly objectiveId: string;
  readonly objectiveType: ContractObjective["type"];
  readonly status: ContractObjectiveStatus;
  readonly progress: number;
  readonly required: number;
  readonly reason: string;
}

export interface ContractEvaluationResult {
  readonly contractId: string;
  readonly objectiveResults: readonly ContractObjectiveEvaluation[];
  readonly successful: boolean;
  readonly failed: boolean;
  readonly completedObjectives: number;
  readonly failedObjectives: number;
}

export interface ContractSettlementInput {
  readonly budgetSpent: number;
  readonly surveillanceCost: number;
  readonly socialCost: number;
  readonly sideEffectPenalty: number;
  readonly failedObjectivePenalty?: number;
}

export interface ContractSettlementResult {
  readonly contractId: string;
  readonly successful: boolean;
  readonly fixedReward: number;
  readonly fixedRewardPaid: number;
  readonly budgetSpent: number;
  readonly surveillanceCost: number;
  readonly socialCost: number;
  readonly sideEffectPenalty: number;
  readonly failedObjectivePenalty: number;
  readonly netPerformance: number;
  readonly efficiencyGrade: "S" | "A" | "B" | "C" | "D" | "F";
}
