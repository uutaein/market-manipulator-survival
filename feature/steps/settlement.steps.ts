import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { dayResultCategories, finalGrades, holdingBands } from "../support/world";
import {
  calculateDaySettlement,
  calculateFinalSettlement,
  getHoldingBand
} from "../../src/domain/settlement/settlement";
import { prepareNextDayCarryover } from "../../src/domain/settlement/carryover";
import { applyIntradayStatUpdate } from "../../src/domain/intraday/intradayState";

Given("intraday operation ends without forced failure", function (this: MmsWorld) {
  this.openIntraday();
  this.forcedFailure = false;
  this.daySettlementActualProfit = 10;
  this.timerSeconds = 0;
});

When("Day Settlement is calculated", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.runState);
  this.latestDaySettlement = calculateDaySettlement({
    dayIndex: this.currentDay,
    actualProfit: this.daySettlementActualProfit,
    surveillance: this.intradayState.surveillance,
    budget: this.intradayState.budget,
    holdingRatio: this.intradayState.holdingRatio,
    personalParticipation: this.intradayState.personalParticipation,
    volatility: this.intradayState.volatility,
    socialCost: this.runState.socialCost + this.intradayState.pendingSocialCostDelta,
    retailSwarmState: this.intradayState.retailSwarmState,
    priceChangePercent: this.intradayState.priceChangePercent,
    marketPressure: this.intradayState.marketPressure,
    forcedFailure: this.forcedFailure,
    failureReason: this.failureReason || null
  });
  this.daySettlementComplete = true;
  this.latestDayResult = this.latestDaySettlement.dayResultCategory;
});

Then("actual profit and surveillance grade are the primary result axes", function (this: MmsWorld) {
  assert.equal(this.daySettlementComplete, true);
  assert.deepEqual(this.latestDaySettlement?.primaryAxes, ["actualProfit", "surveillanceGrade"]);
});

Then("supporting risk metrics are displayed", function (this: MmsWorld) {
  assert.equal(this.daySettlementComplete, true);
  assert.ok(this.latestDaySettlement?.supportingRiskMetrics);
});

Then("the Day result is one of the 8 MVP Day result categories", function (this: MmsWorld) {
  assert.ok(dayResultCategories.has(this.latestDayResult));
});

Given("the player reaches the target band", function (this: MmsWorld) {
  this.openIntraday();
  this.daySettlementActualProfit = 22;
  this.intradayState = {
    ...this.intradayState!,
    priceChangePercent: 10
  };
});

Then("the surveillance grade is high", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  this.intradayState = {
    ...this.intradayState,
    surveillance: 82
  };
});

Then("the Day result is not {string}", function (this: MmsWorld, forbiddenResult: string) {
  assert.notEqual(this.latestDayResult, forbiddenResult);
});

Given("Day Settlement or Final Settlement is calculated", function (this: MmsWorld) {
  this.daySettlementComplete = true;
  this.finalSettlementComplete = true;
  this.latestHoldingBand = getHoldingBand(60).displayName;
});

When("holding ratio is evaluated", function (this: MmsWorld) {
  this.latestHoldingBand = getHoldingBand(60).displayName;
});

Then("it is classified into one of the 4 MVP holding bands", function (this: MmsWorld) {
  assert.ok(holdingBands.has(this.latestHoldingBand));
});

Then("high holding ratio is shown as a settlement risk", function (this: MmsWorld) {
  assert.ok(holdingBands.has(this.latestHoldingBand));
  assert.equal(this.latestHoldingBand, "과점 위험");
});

Given("Day 5 Settlement is complete", function (this: MmsWorld) {
  this.currentDay = 5;
  this.daySettlementComplete = true;
});

When("Final Settlement is calculated", function (this: MmsWorld) {
  this.latestFinalSettlement = calculateFinalSettlement({
    cumulativeProfit: 30,
    finalSurveillance: 42,
    surveillanceHistory: [20, 35, 40, 45, 42],
    successfulDays: 3,
    finalBudget: 78,
    finalHoldingRatio: 30,
    socialCost: 12,
    forcedFailure: false,
    failureReason: null
  });
  this.finalSummaryConsidered = true;
  this.finalGrade = this.latestFinalSettlement.finalGrade;
});

Then("cumulative actual profit, final surveillance grade, average surveillance grade, successful Days, final budget, final holding ratio, and social cost are considered", function (this: MmsWorld) {
  assert.equal(this.finalSummaryConsidered, true);
  assert.deepEqual(this.latestFinalSettlement?.consideredMetrics, [
    "cumulativeProfit",
    "finalSurveillanceGrade",
    "averageSurveillanceGrade",
    "successfulDays",
    "finalBudget",
    "finalHoldingRatio",
    "socialCost"
  ]);
});

Then("the final grade is one of S, A, B, C, D, or F", function (this: MmsWorld) {
  assert.ok(finalGrades.has(this.finalGrade));
});

Given("a forced failure occurred during the Run", function (this: MmsWorld) {
  this.triggerFailure();
});

When("the final result is shown", function (this: MmsWorld) {
  this.latestFinalSettlement = calculateFinalSettlement({
    cumulativeProfit: 0,
    finalSurveillance: 100,
    surveillanceHistory: [100],
    successfulDays: 0,
    finalBudget: 0,
    finalHoldingRatio: 0,
    socialCost: 0,
    forcedFailure: true,
    failureReason: this.failureReason
  });
  this.finalGrade = this.latestFinalSettlement.finalGrade;
  this.currentScreen = "final-settlement";
});

Then("the failure reason is displayed", function (this: MmsWorld) {
  assert.ok(this.failureReason);
});

Given("a Day Settlement is complete", function (this: MmsWorld) {
  this.openIntraday();
  this.daySettlementActualProfit = 10;
  this.latestDaySettlement = calculateDaySettlement({
    dayIndex: this.currentDay,
    actualProfit: this.daySettlementActualProfit,
    surveillance: this.intradayState!.surveillance,
    budget: this.intradayState!.budget,
    holdingRatio: this.intradayState!.holdingRatio,
    personalParticipation: this.intradayState!.personalParticipation,
    volatility: this.intradayState!.volatility,
    socialCost: this.runState!.socialCost + this.intradayState!.pendingSocialCostDelta,
    retailSwarmState: this.intradayState!.retailSwarmState,
    priceChangePercent: this.intradayState!.priceChangePercent,
    marketPressure: this.intradayState!.marketPressure
  });
  this.daySettlementComplete = true;
});

When("the next Day is prepared", function (this: MmsWorld) {
  assert.ok(this.runState);
  assert.ok(this.intradayState);
  assert.ok(this.latestDaySettlement);
  this.latestCarryoverResult = prepareNextDayCarryover({
    runState: this.runState,
    endingIntradayState: this.intradayState,
    daySettlement: this.latestDaySettlement
  });
  this.runState = this.latestCarryoverResult.nextRunState;
  this.currentDay = this.runState.currentDay;
});

Then("budget carries forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.budgetCarried, true);
});

Then("cumulative profit carries forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.cumulativeProfitCarried, true);
});

Then("holding ratio carries forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.holdingRatioCarried, true);
});

Then("average entry price carries forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.averageEntryPriceCarried, true);
});

Then("social cost carries forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.socialCostCarried, true);
});

Then("auto card levels carry forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.autoCardsCarried, true);
});

Then("surveillance partially carries forward", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.surveillancePartiallyCarried, true);
});

Then("personal participation carries forward in reduced form", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.personalParticipationReduced, true);
});

Then("market liquidity mostly resets", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.marketLiquidityMostlyReset, true);
});

Then("volatility mostly resets with possible aftereffects", function (this: MmsWorld) {
  assert.ok(this.latestCarryoverResult);
  assert.ok(this.latestCarryoverResult.nextDayInitials.volatility >= this.latestCarryoverResult.volatilityResetBase);
});

Given("the previous Day ended with overheat, panic, high surveillance, high profit, or excess holding", function (this: MmsWorld) {
  this.openIntraday();
  this.daySettlementActualProfit = 22;
  this.intradayState = applyIntradayStatUpdate(
    {
      ...this.intradayState!,
      priceChangePercent: 14
    },
    {
      personalParticipation: 92,
      surveillance: 82,
      volatility: 78,
      holdingRatio: 60
    }
  );
  this.latestDaySettlement = calculateDaySettlement({
    dayIndex: this.currentDay,
    actualProfit: this.daySettlementActualProfit,
    surveillance: this.intradayState.surveillance,
    budget: this.intradayState.budget,
    holdingRatio: this.intradayState.holdingRatio,
    personalParticipation: this.intradayState.personalParticipation,
    volatility: this.intradayState.volatility,
    socialCost: this.runState!.socialCost + this.intradayState.pendingSocialCostDelta,
    retailSwarmState: this.intradayState.retailSwarmState,
    priceChangePercent: this.intradayState.priceChangePercent,
    marketPressure: this.intradayState.marketPressure
  });
});

Then("weak market aftereffects can adjust initial participation, volatility, surveillance, or competition pressure", function (this: MmsWorld) {
  assert.ok(this.latestCarryoverResult);
  assert.ok(this.latestCarryoverResult.activeAftereffects.length > 0);
  assert.ok(
    this.latestCarryoverResult.nextDayInitials.personalParticipation !== 0 ||
      this.latestCarryoverResult.nextDayInitials.volatility !== this.latestCarryoverResult.volatilityResetBase ||
      this.latestCarryoverResult.nextDayInitials.competitionPressure !== 30
  );
});

Then("those aftereffects are weaker than the new Morning News", function (this: MmsWorld) {
  assert.equal(this.latestCarryoverResult?.aftereffectsAreWeak, true);
});

Given("a Day used a Pre-open Card", function (this: MmsWorld) {
  this.openIntraday();
  this.selectedPreOpenCard = "종목 분석";
  this.latestDaySettlement = calculateDaySettlement({
    dayIndex: this.currentDay,
    actualProfit: 10,
    surveillance: this.intradayState!.surveillance,
    budget: this.intradayState!.budget,
    holdingRatio: this.intradayState!.holdingRatio,
    personalParticipation: this.intradayState!.personalParticipation,
    volatility: this.intradayState!.volatility,
    socialCost: this.runState!.socialCost + this.intradayState!.pendingSocialCostDelta,
    retailSwarmState: this.intradayState!.retailSwarmState,
    priceChangePercent: this.intradayState!.priceChangePercent,
    marketPressure: this.intradayState!.marketPressure
  });
});

Then("the Pre-open Card effect does not carry forward", function (this: MmsWorld) {
  assert.ok(this.selectedPreOpenCard);
  assert.equal(this.latestCarryoverResult?.preOpenCardEffectCarried, false);
  assert.equal(this.latestCarryoverResult?.nextDayInitials.preOpenCardEffect, null);
});
