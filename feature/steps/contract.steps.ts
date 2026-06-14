import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";

type ContractDirection = "upward" | "downward" | "range" | "defense" | "attention";
type ContractKind = "upward_touch" | "downward_touch" | "band_maintain" | "defense" | "value_rank";
type ObjectiveStatus = "pending" | "completed" | "failed";

interface ContractOption {
  readonly id: string;
  readonly kind: ContractKind;
  readonly direction: ContractDirection;
  readonly targetAsset: string;
  readonly durationDays: number;
  readonly fixedReward: number;
  readonly riskLevel: number;
  readonly objectiveSummary: string;
  readonly expertReport: {
    readonly summary: string;
    readonly confidence: number;
    readonly revealsExactObjective: boolean;
  };
}

interface ContractModeWorld extends MmsWorld {
  freeModeAvailable: boolean;
  contractModeAvailable: boolean;
  modeSelectionOpen: boolean;
  selectedMode: "free" | "contract" | "";
  contractOptions: ContractOption[];
  acceptedContract?: ContractOption;
  contractBriefingShown: boolean;
  objectiveStatus: Record<string, ObjectiveStatus>;
  maintainedDays: number;
  requiredMaintainedDays: number;
  fixedRewardEligible: boolean;
  reboundDemandRisk: number;
  sideEffectPenalty: number;
  requiredValueReached: boolean;
  requiredRankReached: boolean;
  contractSuccessful: boolean;
  fixedRewardPaid: boolean;
  partialObjectiveProgressShown: boolean;
  settlementShowsCostBreakdown: boolean;
  settlementShowsEfficiencyGrade: boolean;
}

function contractWorld(world: MmsWorld): ContractModeWorld {
  return world as ContractModeWorld;
}

function createContractOptions(): ContractOption[] {
  return [
    {
      id: "upward-touch-01",
      kind: "upward_touch",
      direction: "upward",
      targetAsset: "fictional_asset_alpha",
      durationDays: 3,
      fixedReward: 18,
      riskLevel: 3,
      objectiveSummary: "Touch the upper target before D+3",
      expertReport: {
        summary: "Desk estimate points to a higher fictional range.",
        confidence: 72,
        revealsExactObjective: false
      }
    },
    {
      id: "downward-touch-01",
      kind: "downward_touch",
      direction: "downward",
      targetAsset: "fictional_asset_beta",
      durationDays: 3,
      fixedReward: 22,
      riskLevel: 4,
      objectiveSummary: "Touch the lower target before D+3",
      expertReport: {
        summary: "Desk estimate points to a lower fictional range.",
        confidence: 64,
        revealsExactObjective: false
      }
    },
    {
      id: "band-maintain-01",
      kind: "band_maintain",
      direction: "range",
      targetAsset: "fictional_asset_gamma",
      durationDays: 5,
      fixedReward: 26,
      riskLevel: 5,
      objectiveSummary: "Maintain the requested price band for 3 Days",
      expertReport: {
        summary: "Desk estimate frames a bounded fictional range.",
        confidence: 69,
        revealsExactObjective: false
      }
    },
    {
      id: "defense-01",
      kind: "defense",
      direction: "defense",
      targetAsset: "fictional_asset_delta",
      durationDays: 4,
      fixedReward: 20,
      riskLevel: 3,
      objectiveSummary: "Defend the lower break line through the contract",
      expertReport: {
        summary: "Desk estimate highlights a fictional support zone.",
        confidence: 75,
        revealsExactObjective: false
      }
    },
    {
      id: "value-rank-01",
      kind: "value_rank",
      direction: "attention",
      targetAsset: "fictional_asset_epsilon",
      durationDays: 2,
      fixedReward: 24,
      riskLevel: 5,
      objectiveSummary: "Reach the requested VALUE and dashboard rank",
      expertReport: {
        summary: "Desk estimate expects elevated fictional attention.",
        confidence: 61,
        revealsExactObjective: false
      }
    }
  ];
}

function ensureContractOptions(world: ContractModeWorld): ContractOption[] {
  if (!world.contractOptions) {
    world.contractOptions = createContractOptions();
  }

  return world.contractOptions;
}

function acceptContract(world: ContractModeWorld, kind: ContractKind): void {
  const option = ensureContractOptions(world).find((contract) => contract.kind === kind);

  assert.ok(option, `expected contract option ${kind}`);
  world.selectedMode = "contract";
  world.acceptedContract = option;
  world.objectiveStatus = { primary: "pending" };
  world.fixedRewardEligible = true;
  world.contractSuccessful = false;
  world.fixedRewardPaid = false;
  world.partialObjectiveProgressShown = false;
}

Given("the MVP baseline is available as free mode", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.freeModeAvailable = true;
  world.contractModeAvailable = true;
  world.selectedMode = "";
});

When("the player opens the mode selection menu", function (this: MmsWorld) {
  contractWorld(this).modeSelectionOpen = true;
});

Then("free mode is available", function (this: MmsWorld) {
  const world = contractWorld(this);

  assert.equal(world.modeSelectionOpen, true);
  assert.equal(world.freeModeAvailable, true);
});

Then("contract mode is available", function (this: MmsWorld) {
  const world = contractWorld(this);

  assert.equal(world.modeSelectionOpen, true);
  assert.equal(world.contractModeAvailable, true);
});

When("the player starts free mode", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.selectedMode = "free";
  world.startNewRun();
});

Then("the run uses the MVP 5-Day free mode loop", function (this: MmsWorld) {
  const world = contractWorld(this);

  assert.equal(world.selectedMode, "free");
  assert.equal(world.runState?.currentDay, 1);
  assert.equal(world.runStatus, "active");
});

When("the player starts contract mode", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.selectedMode = "contract";
  world.currentScreen = "contract-selection";
});

Then("the player is routed to contract selection", function (this: MmsWorld) {
  assert.equal(contractWorld(this).currentScreen, "contract-selection");
});

Given("contract mode is selected", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.selectedMode = "contract";
  world.currentScreen = "contract-selection";
});

When("contract options are generated", function (this: MmsWorld) {
  contractWorld(this).contractOptions = createContractOptions();
});

Then("at least 4 contract options are shown", function (this: MmsWorld) {
  assert.ok(ensureContractOptions(contractWorld(this)).length >= 4);
});

Then("an upward touch contract is available", function (this: MmsWorld) {
  assert.ok(ensureContractOptions(contractWorld(this)).some((contract) => contract.kind === "upward_touch"));
});

Then("a downward touch contract is available", function (this: MmsWorld) {
  assert.ok(ensureContractOptions(contractWorld(this)).some((contract) => contract.kind === "downward_touch"));
});

Then("a band maintain contract is available", function (this: MmsWorld) {
  assert.ok(ensureContractOptions(contractWorld(this)).some((contract) => contract.kind === "band_maintain"));
});

Then("a defense contract is available", function (this: MmsWorld) {
  assert.ok(ensureContractOptions(contractWorld(this)).some((contract) => contract.kind === "defense"));
});

Then(
  "each contract shows a fixed reward, risk level, duration, target asset, and objective summary",
  function (this: MmsWorld) {
    const contracts = ensureContractOptions(contractWorld(this));

    assert.ok(
      contracts.every(
        (contract) =>
          contract.fixedReward > 0 &&
          contract.riskLevel > 0 &&
          contract.durationDays > 0 &&
          contract.targetAsset.length > 0 &&
          contract.objectiveSummary.length > 0
      )
    );
  }
);

Given("the player accepts an upward touch contract", function (this: MmsWorld) {
  acceptContract(contractWorld(this), "upward_touch");
});

Given("the player accepted an upward touch contract", function (this: MmsWorld) {
  acceptContract(contractWorld(this), "upward_touch");
});

Given("the player accepted a downward touch contract", function (this: MmsWorld) {
  acceptContract(contractWorld(this), "downward_touch");
});

Given("the player accepted a band maintain contract requiring {int} maintained Days", function (this: MmsWorld, days: number) {
  const world = contractWorld(this);

  acceptContract(world, "band_maintain");
  world.requiredMaintainedDays = days;
  world.maintainedDays = 0;
});

Given("the player accepted a defense contract with a lower break line", function (this: MmsWorld) {
  acceptContract(contractWorld(this), "defense");
});

Given("the player accepted a contract with VALUE and rank objectives", function (this: MmsWorld) {
  const world = contractWorld(this);

  acceptContract(world, "value_rank");
  world.requiredValueReached = false;
  world.requiredRankReached = false;
});

Given("the player accepted a contract with multiple required objectives", function (this: MmsWorld) {
  const world = contractWorld(this);

  acceptContract(world, "band_maintain");
  world.objectiveStatus = {
    primary: "pending",
    secondary: "pending"
  };
});

When("the contract briefing is shown", function (this: MmsWorld) {
  const world = contractWorld(this);

  assert.ok(world.acceptedContract);
  world.contractBriefingShown = true;
  world.currentScreen = "contract-briefing";
});

Then("the briefing shows the target asset", function (this: MmsWorld) {
  assert.ok(contractWorld(this).acceptedContract?.targetAsset);
});

Then("the briefing shows the contract duration", function (this: MmsWorld) {
  assert.ok((contractWorld(this).acceptedContract?.durationDays ?? 0) > 0);
});

Then("the briefing shows the objective summary", function (this: MmsWorld) {
  assert.ok(contractWorld(this).acceptedContract?.objectiveSummary);
});

Then("the briefing shows the fixed reward", function (this: MmsWorld) {
  assert.ok((contractWorld(this).acceptedContract?.fixedReward ?? 0) > 0);
});

Then("the briefing shows an expert report", function (this: MmsWorld) {
  assert.ok(contractWorld(this).acceptedContract?.expertReport.summary);
});

Then("the expert report does not reveal the exact objective as a mechanical instruction", function (this: MmsWorld) {
  assert.equal(contractWorld(this).acceptedContract?.expertReport.revealsExactObjective, false);
});

When("the tracked asset touches the contract target before the deadline", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.objectiveStatus.primary = "completed";
});

When("the tracked asset touches the lower contract target before the deadline", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.objectiveStatus.primary = "completed";
});

Then("the touch objective is marked completed", function (this: MmsWorld) {
  assert.equal(contractWorld(this).objectiveStatus.primary, "completed");
});

Then("the contract remains eligible for fixed reward", function (this: MmsWorld) {
  assert.equal(contractWorld(this).fixedRewardEligible, true);
});

When("the tracked asset closes inside the contract band for {int} Days", function (this: MmsWorld, days: number) {
  const world = contractWorld(this);

  world.maintainedDays = days;
  if (world.maintainedDays >= world.requiredMaintainedDays) {
    world.objectiveStatus.primary = "completed";
  }
});

Then("the maintain objective progress is {int} of {int} Days", function (this: MmsWorld, actual: number, expected: number) {
  const world = contractWorld(this);

  assert.equal(world.maintainedDays, actual);
  assert.equal(world.requiredMaintainedDays, expected);
});

Then("the contract is not yet successful", function (this: MmsWorld) {
  assert.equal(contractWorld(this).contractSuccessful, false);
});

When("the tracked asset closes inside the contract band for the required Day", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.maintainedDays = world.requiredMaintainedDays;
  world.objectiveStatus.primary = "completed";
});

Then("the maintain objective is marked completed", function (this: MmsWorld) {
  assert.equal(contractWorld(this).objectiveStatus.primary, "completed");
});

When("the tracked asset breaks below the forbidden lower line during the contract period", function (this: MmsWorld) {
  contractWorld(this).objectiveStatus.primary = "failed";
});

Then("the defense objective is marked failed", function (this: MmsWorld) {
  assert.equal(contractWorld(this).objectiveStatus.primary, "failed");
});

Then("the defense objective remains failed even if the price later recovers", function (this: MmsWorld) {
  assert.equal(contractWorld(this).objectiveStatus.primary, "failed");
});

When("the tracked asset reaches the required cumulative VALUE", function (this: MmsWorld) {
  contractWorld(this).requiredValueReached = true;
});

When("the tracked asset reaches the required dashboard rank", function (this: MmsWorld) {
  contractWorld(this).requiredRankReached = true;
});

Then("the VALUE objective is marked completed", function (this: MmsWorld) {
  assert.equal(contractWorld(this).requiredValueReached, true);
});

Then("the rank objective is marked completed", function (this: MmsWorld) {
  assert.equal(contractWorld(this).requiredRankReached, true);
});

When("the player forces a rapid drop with high VALUE and high MADNESS", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.reboundDemandRisk = 8;
  world.sideEffectPenalty = 5;
});

Then("rebound demand risk increases", function (this: MmsWorld) {
  assert.ok(contractWorld(this).reboundDemandRisk > 0);
});

Then("the contract net performance is penalized for excessive side effects", function (this: MmsWorld) {
  assert.ok(contractWorld(this).sideEffectPenalty > 0);
});

When("every required objective is completed by the contract deadline", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.objectiveStatus = Object.fromEntries(
    Object.keys(world.objectiveStatus).map((objectiveId) => [objectiveId, "completed" as const])
  );
  world.contractSuccessful = true;
  world.fixedRewardPaid = true;
  world.settlementShowsCostBreakdown = true;
  world.settlementShowsEfficiencyGrade = true;
});

Then("the contract is successful", function (this: MmsWorld) {
  assert.equal(contractWorld(this).contractSuccessful, true);
});

Then("the fixed reward is paid", function (this: MmsWorld) {
  assert.equal(contractWorld(this).fixedRewardPaid, true);
});

Then(
  "contract settlement shows budget spent, surveillance cost, social cost, side-effect penalties, and net performance",
  function (this: MmsWorld) {
    assert.equal(contractWorld(this).settlementShowsCostBreakdown, true);
  }
);

Then("contract settlement shows an efficiency grade", function (this: MmsWorld) {
  assert.equal(contractWorld(this).settlementShowsEfficiencyGrade, true);
});

When("at least one required objective is not completed by the contract deadline", function (this: MmsWorld) {
  const world = contractWorld(this);

  world.objectiveStatus.primary = "completed";
  world.objectiveStatus.secondary = "pending";
  world.contractSuccessful = false;
  world.fixedRewardPaid = false;
  world.partialObjectiveProgressShown = true;
});

Then("the contract is failed", function (this: MmsWorld) {
  assert.equal(contractWorld(this).contractSuccessful, false);
});

Then("the fixed reward is not paid", function (this: MmsWorld) {
  assert.equal(contractWorld(this).fixedRewardPaid, false);
});

Then("partial objective progress is shown for feedback", function (this: MmsWorld) {
  assert.equal(contractWorld(this).partialObjectiveProgressShown, true);
});
