import assert from "node:assert/strict";
import { getAssetsBySector, sectors } from "../src/domain/assets/assetCatalog";
import { canUseManualAction } from "../src/domain/intraday/manualActions";
import { clampIntradayState } from "../src/domain/intraday/intradayState";
import { GameSession } from "../src/game/GameSession";

interface ScenarioResult {
  readonly name: string;
  readonly detail: string;
}

const scenarioResults: ScenarioResult[] = [];

runScenario("full sell leaves the rest of the Day as observation only", () => {
  const session = startFreeIntraday();
  const state = session.intradayState ?? session.startIntraday();

  session.intradayState = clampIntradayState({
    ...state,
    holdingRatio: 0,
    activeManualActionEffects: [],
    priceDeltaPerTick: 0
  });

  assert.equal(canUseManualAction(session.intradayState, "price_push"), false);
  assert.equal(canUseManualAction(session.intradayState, "liquidity_supply"), false);
  assert.equal(canUseManualAction(session.intradayState, "overheat_cooldown"), false);
  assert.equal(canUseManualAction(session.intradayState, "position_settlement"), false);

  const buyAgainResult = session.useManualAction("매수봇");
  assert.equal(buyAgainResult.applied, false);
  assert.equal(buyAgainResult.reason, "no_position");
  assert.equal(session.canRepositionIntradayAsset(), false);

  return "manual actions blocked after holding 0";
});

runScenario("no carried position selects a new asset before the next Day pre-open", () => {
  const session = startFreeIntraday();
  const state = session.intradayState ?? session.startIntraday();
  const oldRunSeed = session.ensureRun().runSeed;
  const oldAssetId = session.selectedAssetId;

  session.intradayState = clampIntradayState({
    ...state,
    holdingRatio: 0,
    activeManualActionEffects: [],
    priceDeltaPerTick: 0
  });
  session.calculateDaySettlement();

  assert.equal(session.shouldSelectAssetBeforeNextDay(), true);
  session.continueAfterDaySettlement();

  const nextAsset = getAssetsBySector(sectors[1].id)[1];
  assert.notEqual(nextAsset.id, oldAssetId);

  session.selectNextDayAsset(nextAsset.id);

  assert.equal(session.ensureRun().runSeed, oldRunSeed);
  assert.equal(session.ensureRun().currentDay, 2);
  assert.equal(session.ensureRun().selectedAssetId, nextAsset.id);
  assert.equal(session.ensureRun().holdingRatio, 0);
  assert.equal(session.ensureRun().averageEntryPrice, null);
  assert.equal(session.ensureRun().lastClosePrice, null);
  assert.equal(session.dayState?.dayIndex, 2);
  assert.equal(session.dayState?.preOpenCardId, null);

  session.selectPreOpenCard("선취매", {
    earlyPositioningBudgetPercent: 20
  });
  const nextDayState = session.startIntraday();
  assert.ok(nextDayState.holdingRatio > 0);

  return `${oldAssetId} -> ${nextAsset.id} on seed ${oldRunSeed}`;
});

for (const result of scenarioResults) {
  console.log(`ok - ${result.name}: ${result.detail}`);
}

function runScenario(name: string, scenario: () => string): void {
  const detail = scenario();
  scenarioResults.push({ name, detail });
}

function startFreeIntraday(): GameSession {
  const session = new GameSession();
  session.prepareFreeMode();
  session.setSelectedAsset(getAssetsBySector(sectors[0].id)[0].id);
  session.startNewRun();
  session.beginDay();
  session.selectPreOpenCard("선취매", {
    earlyPositioningBudgetPercent: 30
  });
  session.startIntraday();
  return session;
}
