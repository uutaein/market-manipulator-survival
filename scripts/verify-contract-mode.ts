import assert from "node:assert/strict";
import {
  createSampleContractMandates,
  evaluateContractObjectives,
  getContractRecommendedManualActionLabels,
  getContractRiskyManualActionLabels
} from "../src/domain/contract";
import { createMapStorage, persistenceKeys } from "../src/domain/persistence/localPersistence";
import { clampIntradayState } from "../src/domain/intraday/intradayState";
import { GameSession } from "../src/game/GameSession";

interface ScenarioResult {
  readonly name: string;
  readonly detail: string;
}

const scenarioResults: ScenarioResult[] = [];

runScenario("selection starts a contract run", () => {
  const session = new GameSession();
  session.prepareContractMode();
  const mandate = session.startContractRun("contract_downward_touch_bio");

  assert.equal(session.gameMode, "contract");
  assert.equal(session.contractMandate?.id, mandate.id);
  assert.equal(session.selectedAssetId, mandate.assetId);
  assert.equal(session.getRunLengthDays(), mandate.durationDays);

  return `${mandate.id} on ${mandate.assetId}`;
});

runScenario("upward touch can complete before deadline", () => {
  const session = startContract("contract_upward_touch_food");
  closeDayAtPrice(session, 12_500);

  assert.equal(session.contractEvaluationResult?.successful, true);
  assert.equal(session.contractEvaluationResult?.objectiveResults[0]?.status, "completed");

  return firstObjectiveStatus(session);
});

runScenario("downward touch can complete before deadline", () => {
  const session = startContract("contract_downward_touch_bio");
  closeDayAtPrice(session, 8_500);

  assert.equal(session.contractEvaluationResult?.successful, true);
  assert.equal(session.contractEvaluationResult?.objectiveResults[0]?.status, "completed");

  return firstObjectiveStatus(session);
});

runScenario("band maintain counts required closes", () => {
  const session = startContract("contract_band_maintain_payment");

  closeDayAtPrice(session, 10_800);
  assert.equal(session.contractEvaluationResult?.successful, false);
  session.continueAfterDaySettlement();

  closeDayAtPrice(session, 10_800);
  assert.equal(session.contractEvaluationResult?.successful, false);
  session.continueAfterDaySettlement();

  closeDayAtPrice(session, 10_800);
  assert.equal(session.contractEvaluationResult?.successful, true);
  assert.equal(session.contractEvaluationResult?.objectiveResults[0]?.progress, 3);

  return firstObjectiveStatus(session);
});

runScenario("defense contract stays failed after a forbidden break", () => {
  const session = startContract("contract_defense_energy");

  closeDayAtPrice(session, 9_300);
  assert.equal(session.contractEvaluationResult?.failed, true);
  session.continueAfterDaySettlement();

  closeDayAtPrice(session, 10_000);
  assert.equal(session.contractEvaluationResult?.failed, true);

  return firstObjectiveStatus(session);
});

runScenario("VALUE and rank objectives complete from dashboard observations", () => {
  const session = startContract("contract_value_rank_media");
  session.startIntraday();
  session.updateMarketDashboardSnapshot(
    new Map([[`asset:${session.selectedAssetId}`, 3]]),
    new Map([[`asset:${session.selectedAssetId}`, 350_000_000]])
  );

  assert.equal(session.contractEvaluationResult?.successful, true);
  assert.equal(session.contractEvaluationResult?.completedObjectives, 2);

  return `${session.contractEvaluationResult?.completedObjectives}/2 objectives`;
});

runScenario("deadline miss becomes failed and pays no fixed reward", () => {
  const session = startContract("contract_upward_touch_food");

  closeDayAtPrice(session, 10_100);
  discardIntradayTickObservations(session);
  session.continueAfterDaySettlement();
  closeDayAtPrice(session, 10_100);
  discardIntradayTickObservations(session);
  session.continueAfterDaySettlement();
  closeDayAtPrice(session, 10_100);
  discardIntradayTickObservations(session);

  assert.equal(session.contractEvaluationResult?.failed, true);
  assert.equal(session.contractEvaluationResult?.objectiveResults[0]?.status, "failed");

  const finalSettlement = session.calculateFinalSettlement();
  assert.ok(finalSettlement.finalGrade);
  assert.equal(session.contractSettlementResult?.fixedRewardPaid, 0);

  return `${firstObjectiveStatus(session)}, reward ${session.contractSettlementResult?.fixedRewardPaid}`;
});

runScenario("contract action fit marks mismatched tools risky", () => {
  const session = startContract("contract_downward_touch_bio");
  session.startIntraday();
  session.useManualAction("매수봇");

  assert.equal(session.lastContractActionFitResult?.fit, "risky");
  assert.match(session.lastContractActionFitResult?.message ?? "", /위험/);

  return session.lastContractActionFitResult?.message ?? "";
});

runScenario("contract desk exposes action fit labels", () => {
  const mandates = createSampleContractMandates();

  for (const mandate of mandates) {
    assert.ok(getContractRecommendedManualActionLabels(mandate).length > 0, mandate.id);
    assert.ok(getContractRiskyManualActionLabels(mandate).length > 0, mandate.id);
  }

  return `${mandates.length} contract label sets`;
});

runScenario("contract save restores mode, observations, and duration", () => {
  const storage = new Map<string, string>();
  const globalWithStorage = globalThis as typeof globalThis & {
    localStorage: ReturnType<typeof createMapStorage>;
  };
  globalWithStorage.localStorage = createMapStorage(storage);

  const saved = startContract("contract_value_rank_media");
  saved.startIntraday();
  saved.updateMarketDashboardSnapshot(
    new Map([[`asset:${saved.selectedAssetId}`, 3]]),
    new Map([[`asset:${saved.selectedAssetId}`, 350_000_000]])
  );
  saved.useManualAction("매수봇");
  saved.calculateDaySettlement();

  assert.equal(saved.saveCurrentRunProgress(), true);
  assert.equal(storage.has(persistenceKeys.currentRun), true);

  const restored = new GameSession();
  assert.equal(restored.loadSavedRun(), true);
  assert.equal(restored.gameMode, "contract");
  assert.equal(restored.contractMandate?.id, "contract_value_rank_media");
  assert.equal(restored.contractEvaluationResult?.completedObjectives, 2);
  assert.equal(restored.getRunLengthDays(), 2);

  return `${restored.contractMandate.id}, ${restored.contractObservations.length} observations`;
});

for (const result of scenarioResults) {
  console.log(`ok - ${result.name}: ${result.detail}`);
}

function runScenario(name: string, scenario: () => string): void {
  const detail = scenario();
  scenarioResults.push({ name, detail });
}

function startContract(contractId: string): GameSession {
  const session = new GameSession();
  session.prepareContractMode();
  session.startContractRun(contractId);
  return session;
}

function closeDayAt(session: GameSession, priceChangePercent: number): void {
  const state = session.intradayState ?? session.startIntraday();
  session.intradayState = clampIntradayState({
    ...state,
    priceChangePercent,
    priceDeltaPerTick: 0
  });
  session.calculateDaySettlement();
}

function closeDayAtPrice(session: GameSession, targetPrice: number): void {
  const state = session.intradayState ?? session.startIntraday();
  const priceChangePercent = ((targetPrice / state.openingPrice) - 1) * 100;
  closeDayAt(session, priceChangePercent);
}

function discardIntradayTickObservations(session: GameSession): void {
  assert.ok(session.contractMandate);
  session.contractObservations = session.contractObservations.filter(
    (observation) => observation.kind !== "intraday_tick"
  );
  session.contractEvaluationResult = evaluateContractObjectives(
    session.contractMandate,
    session.contractObservations
  );
}

function firstObjectiveStatus(session: GameSession): string {
  const result = session.contractEvaluationResult?.objectiveResults[0];
  assert.ok(result);
  return `${result.objectiveId}:${result.status}:${result.progress}/${result.required}`;
}
