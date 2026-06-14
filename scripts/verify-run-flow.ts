import assert from "node:assert/strict";
import { getAssetsBySector, sectors } from "../src/domain/assets/assetCatalog";
import { buildOrderBookProfile } from "../src/domain/intraday/orderBook";
import {
  applyOrderBookWallPriceBarriers,
  canUseOrderBookWall,
  getOrderBookWallRemainingDepthBoost,
  getOrderBookWallRemainingReservedBudget,
  tickOrderBookWallEffects
} from "../src/domain/intraday/orderBookWalls";
import { canUseManualAction } from "../src/domain/intraday/manualActions";
import { clampIntradayState, createEmptyOrderBookWallCooldowns } from "../src/domain/intraday/intradayState";
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
  assert.equal(canUseOrderBookWall(session.intradayState, "buy", -1), false);
  assert.equal(canUseOrderBookWall(session.intradayState, "sell", 1), false);

  const buyAgainResult = session.useManualAction("매수봇");
  assert.equal(buyAgainResult.applied, false);
  assert.equal(buyAgainResult.reason, "no_position");
  const wallResult = session.useOrderBookWall("buy", -1, session.intradayState.priceChangePercent - 1);
  assert.equal(wallResult.applied, false);
  assert.equal(wallResult.reason, "no_position");
  assert.equal(session.canRepositionIntradayAsset(), false);

  return "manual and order-book wall actions blocked after holding 0";
});

runScenario("order-book walls change visible depth and responsiveness", () => {
  const buySession = startFreeIntraday();
  buySession.intradayState = tuneOrderBookTestState(buySession.intradayState ?? buySession.startIntraday());
  const buyState = buySession.intradayState;
  assert.ok(buyState);
  const buyRun = buySession.ensureRun();
  const buyDay = buySession.ensureDay();
  const buyProfileBefore = buildOrderBookProfile(buyState, {
    runSeed: buyRun.runSeed,
    dayIndex: buyDay.dayIndex
  });

  const buyWallPrice = getLevelPriceChangePercent(buyProfileBefore, -1);
  const buyResult = buySession.useOrderBookWall("buy", -1, buyWallPrice);
  const buyProfileAfter = buildOrderBookProfile(buyResult.state, {
    runSeed: buyRun.runSeed,
    dayIndex: buyDay.dayIndex
  });
  const buyLevelBefore = buyProfileBefore.levels.find((level) => level.offsetPercent === -1);
  const buyLevelAfter = buyProfileAfter.levels.find((level) => level.offsetPercent === -1);
  assert.ok(buyLevelBefore);
  assert.ok(buyLevelAfter);

  assert.equal(buyResult.applied, true);
  assert.equal(buyResult.budgetDelta, -10);
  assert.equal(buyResult.reservedBudget, 10);
  assert.equal(buyResult.state.budget, buyState.budget - 10);
  assert.equal(getLastOrderBookWallEvent(buyResult.state)?.type, "formed");
  assert.equal(getLastOrderBookWallEvent(buyResult.state)?.depthDelta, buyResult.depthBoost);
  assert.ok(buyLevelAfter.bidDepth > buyLevelBefore.bidDepth);
  assert.ok(buyProfileAfter.buyWallDepth > buyProfileBefore.buyWallDepth);
  assert.ok(buyProfileAfter.downwardResponsiveness < buyProfileBefore.downwardResponsiveness);
  assert.ok(
    buyProfileAfter.executionDepth.bids.some(
      (level) => level.quantity === buyLevelAfter.bidDepth && level.orderCount > 1
    )
  );

  const shiftedBuyState = clampIntradayState({
    ...buyResult.state,
    priceChangePercent: buyWallPrice + 1.2
  });
  const shiftedBuyProfile = buildOrderBookProfile(shiftedBuyState, {
    runSeed: buyRun.runSeed,
    dayIndex: buyDay.dayIndex
  });
  const shiftedBuyLevel = shiftedBuyProfile.levels.find(
    (level) => Math.abs(level.priceChangePercent - buyWallPrice) < 0.01
  );
  assert.ok(shiftedBuyLevel);
  assert.ok(shiftedBuyLevel.bidDepth > buyLevelBefore.bidDepth);
  assert.ok(
    shiftedBuyProfile.executionDepth.bids.some(
      (level) => level.quantity === shiftedBuyLevel.bidDepth && level.orderCount > 1
    )
  );

  const decaySession = startFreeIntraday();
  decaySession.intradayState = tuneOrderBookTestState(decaySession.intradayState ?? decaySession.startIntraday());
  const decayState = decaySession.intradayState;
  assert.ok(decayState);
  const decayRun = decaySession.ensureRun();
  const decayDay = decaySession.ensureDay();
  const decayProfileBefore = buildOrderBookProfile(decayState, {
    runSeed: decayRun.runSeed,
    dayIndex: decayDay.dayIndex
  });
  const decayWallPrice = getLevelPriceChangePercent(decayProfileBefore, -1);
  const decayResult = decaySession.useOrderBookWall("buy", -1, decayWallPrice);
  assert.equal(decayResult.applied, true);
  const decayProfileAfter = buildOrderBookProfile(decayResult.state, {
    runSeed: decayRun.runSeed,
    dayIndex: decayDay.dayIndex
  });
  const decayLevelAfter = decayProfileAfter.levels.find((level) => level.offsetPercent === -1);
  assert.ok(decayLevelAfter);

  const pressuredWallState = clampIntradayState({
    ...decayResult.state,
    marketPressure: -100,
    priceChangePercent: decayWallPrice
  });
  const partiallyMeltedState = tickOrderBookWallEffects(pressuredWallState, 5);
  const partiallyMeltedEffect = partiallyMeltedState.activeOrderBookWallEffects.find(
    (effect) => effect.side === "buy" && Math.abs(effect.priceChangePercent - decayWallPrice) < 0.01
  );
  assert.ok(partiallyMeltedEffect);
  assert.ok(getOrderBookWallRemainingDepthBoost(partiallyMeltedEffect) < decayResult.depthBoost);
  assert.ok(getOrderBookWallRemainingReservedBudget(partiallyMeltedEffect) < decayResult.reservedBudget);
  assert.ok(getOrderBookWallRemainingReservedBudget(partiallyMeltedEffect) > 0);
  assert.equal(getLastOrderBookWallEvent(partiallyMeltedState)?.type, "melted");
  assert.ok((getLastOrderBookWallEvent(partiallyMeltedState)?.depthDelta ?? 0) < 0);
  assert.equal(
    getLastOrderBookWallEvent(partiallyMeltedState)?.remainingReservedBudget,
    getOrderBookWallRemainingReservedBudget(partiallyMeltedEffect)
  );

  const partiallyMeltedProfile = buildOrderBookProfile(partiallyMeltedState, {
    runSeed: decayRun.runSeed,
    dayIndex: decayDay.dayIndex
  });
  const partiallyMeltedLevel = partiallyMeltedProfile.levels.find(
    (level) => Math.abs(level.priceChangePercent - decayWallPrice) < 0.01
  );
  assert.ok(partiallyMeltedLevel);
  assert.ok(partiallyMeltedLevel.bidDepth < decayLevelAfter.bidDepth);
  decaySession.intradayState = partiallyMeltedState;
  const removePartialWallResult = decaySession.useOrderBookWall(
    "buy",
    partiallyMeltedLevel.offsetPercent,
    decayWallPrice
  );
  assert.equal(removePartialWallResult.applied, true);
  assert.equal(removePartialWallResult.reason, "removed");
  assert.equal(removePartialWallResult.budgetDelta, getOrderBookWallRemainingReservedBudget(partiallyMeltedEffect));
  assert.ok(removePartialWallResult.budgetDelta > 0);
  assert.ok(removePartialWallResult.budgetDelta < decayResult.reservedBudget);
  assert.equal(getLastOrderBookWallEvent(removePartialWallResult.state)?.type, "removed");
  assert.equal(getLastOrderBookWallEvent(removePartialWallResult.state)?.reserveDelta, removePartialWallResult.budgetDelta);

  const meltSession = startFreeIntraday();
  meltSession.intradayState = tuneOrderBookTestState(meltSession.intradayState ?? meltSession.startIntraday());
  const meltState = meltSession.intradayState;
  assert.ok(meltState);
  const meltRun = meltSession.ensureRun();
  const meltDay = meltSession.ensureDay();
  const meltProfileBefore = buildOrderBookProfile(meltState, {
    runSeed: meltRun.runSeed,
    dayIndex: meltDay.dayIndex
  });
  const meltWallPrice = getLevelPriceChangePercent(meltProfileBefore, -1);
  const meltResult = meltSession.useOrderBookWall("buy", -1, meltWallPrice);
  assert.equal(meltResult.applied, true);
  const fullMeltPressureState = clampIntradayState({
    ...meltResult.state,
    marketPressure: -100,
    priceChangePercent: meltWallPrice
  });
  const fullyMeltedState = tickOrderBookWallEffects(fullMeltPressureState, 14);
  assert.equal(
    fullyMeltedState.activeOrderBookWallEffects.some(
      (effect) => effect.side === "buy" && Math.abs(effect.priceChangePercent - meltWallPrice) < 0.01
    ),
    false
  );
  assert.equal(getLastOrderBookWallEvent(fullyMeltedState)?.type, "collapsed");
  assert.ok(fullyMeltedState.orderBookWallEvents.length <= 6);
  const postMeltDownsideAttempt = clampIntradayState({
    ...fullyMeltedState,
    priceChangePercent: meltWallPrice - 4,
    priceDeltaPerTick: -4
  });
  const postMeltBarrierState = applyOrderBookWallPriceBarriers(fullyMeltedState, postMeltDownsideAttempt);
  assert.equal(postMeltBarrierState.priceChangePercent, meltWallPrice - 4);

  buySession.intradayState = shiftedBuyState;
  const removeBuyResult = buySession.useOrderBookWall("buy", shiftedBuyLevel.offsetPercent, buyWallPrice);
  assert.equal(removeBuyResult.applied, true);
  assert.equal(removeBuyResult.reason, "removed");
  assert.equal(removeBuyResult.budgetDelta, 10);
  assert.equal(removeBuyResult.state.budget, buyState.budget);

  const repeatBuyResult = buySession.useOrderBookWall("buy", shiftedBuyLevel.offsetPercent, buyWallPrice);
  assert.equal(repeatBuyResult.applied, false);
  assert.equal(repeatBuyResult.reason, "cooldown");

  const postRemoveBuyProfile = buildOrderBookProfile(removeBuyResult.state, {
    runSeed: buyRun.runSeed,
    dayIndex: buyDay.dayIndex
  });
  const secondLevelBuyPrice = getLevelPriceChangePercent(postRemoveBuyProfile, -2);
  const secondLevelBuyResult = buySession.useOrderBookWall("buy", -2, secondLevelBuyPrice);
  assert.equal(secondLevelBuyResult.applied, true);
  assert.equal(secondLevelBuyResult.reason, "applied");

  let cooledState = secondLevelBuyResult.state;
  for (let index = 0; index < 14; index += 1) {
    cooledState = tickOrderBookWallEffects(cooledState, 1);
  }
  assert.equal(cooledState.activeOrderBookWallEffects.some((effect) => effect.side === "buy" && effect.offsetPercent === -2), false);
  assert.equal(cooledState.budget, buyState.budget);
  assert.equal(getLastOrderBookWallEvent(cooledState)?.type, "expired");

  const sellSession = startFreeIntraday();
  sellSession.intradayState = tuneOrderBookTestState(sellSession.intradayState ?? sellSession.startIntraday());
  const sellState = sellSession.intradayState;
  assert.ok(sellState);
  const sellRun = sellSession.ensureRun();
  const sellDay = sellSession.ensureDay();
  const sellProfileBefore = buildOrderBookProfile(sellState, {
    runSeed: sellRun.runSeed,
    dayIndex: sellDay.dayIndex
  });

  const sellWallPrice = getLevelPriceChangePercent(sellProfileBefore, 1);
  const sellResult = sellSession.useOrderBookWall("sell", 1, sellWallPrice);
  const sellProfileAfter = buildOrderBookProfile(sellResult.state, {
    runSeed: sellRun.runSeed,
    dayIndex: sellDay.dayIndex
  });
  const sellLevelBefore = sellProfileBefore.levels.find((level) => level.offsetPercent === 1);
  const sellLevelAfter = sellProfileAfter.levels.find((level) => level.offsetPercent === 1);
  assert.ok(sellLevelBefore);
  assert.ok(sellLevelAfter);

  assert.equal(sellResult.applied, true);
  assert.ok(sellLevelAfter.askDepth > sellLevelBefore.askDepth);
  assert.ok(sellProfileAfter.sellWallDepth > sellProfileBefore.sellWallDepth);
  assert.ok(sellProfileAfter.upwardResponsiveness < sellProfileBefore.upwardResponsiveness);
  assert.ok(
    sellProfileAfter.executionDepth.asks.some(
      (level) => level.quantity === sellLevelAfter.askDepth && level.orderCount > 1
    )
  );

  const downsideAttempt = clampIntradayState({
    ...buyResult.state,
    priceChangePercent: buyWallPrice - 4,
    priceDeltaPerTick: -4
  });
  const buyBarrierState = applyOrderBookWallPriceBarriers(buyResult.state, downsideAttempt);
  assert.equal(buyBarrierState.priceChangePercent, buyWallPrice);

  const upsideAttempt = clampIntradayState({
    ...sellResult.state,
    priceChangePercent: sellWallPrice + 4,
    priceDeltaPerTick: 4
  });
  const sellBarrierState = applyOrderBookWallPriceBarriers(sellResult.state, upsideAttempt);
  assert.equal(sellBarrierState.priceChangePercent, sellWallPrice);

  const pressuredSellWallState = clampIntradayState({
    ...sellResult.state,
    marketPressure: 100,
    priceChangePercent: sellWallPrice
  });
  const partiallyMeltedSellState = tickOrderBookWallEffects(pressuredSellWallState, 5);
  const partiallyMeltedSellEffect = partiallyMeltedSellState.activeOrderBookWallEffects.find(
    (effect) => effect.side === "sell" && Math.abs(effect.priceChangePercent - sellWallPrice) < 0.01
  );
  assert.ok(partiallyMeltedSellEffect);
  assert.ok(getOrderBookWallRemainingDepthBoost(partiallyMeltedSellEffect) < sellResult.depthBoost);
  assert.ok(getOrderBookWallRemainingReservedBudget(partiallyMeltedSellEffect) < sellResult.reservedBudget);

  return `buy depth ${buyProfileBefore.buyWallDepth}->${buyProfileAfter.buyWallDepth}, sell depth ${sellProfileBefore.sellWallDepth}->${sellProfileAfter.sellWallDepth}`;
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

function tuneOrderBookTestState(state: ReturnType<GameSession["startIntraday"]>) {
  return clampIntradayState({
    ...state,
    marketLiquidity: 25,
    marketPressure: 0,
    personalParticipation: 30,
    volatility: 35,
    assetInfluenceResistance: 1,
    orderBookWallCooldowns: createEmptyOrderBookWallCooldowns(),
    activeOrderBookWallEffects: [],
    orderBookWallEvents: []
  });
}

function getLevelPriceChangePercent(
  profile: ReturnType<typeof buildOrderBookProfile>,
  offsetPercent: number
): number {
  const level = profile.levels.find((candidate) => candidate.offsetPercent === offsetPercent);
  assert.ok(level);
  return level.priceChangePercent;
}

function getLastOrderBookWallEvent(state: ReturnType<GameSession["startIntraday"]>) {
  return state.orderBookWallEvents[state.orderBookWallEvents.length - 1];
}
