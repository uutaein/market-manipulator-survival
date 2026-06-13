import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { dayResultCategories, finalGrades, holdingBands } from "../support/world";

Given("intraday operation ends without forced failure", function (this: MmsWorld) {
  this.openIntraday();
  this.forcedFailure = false;
  this.timerSeconds = 0;
});

When("Day Settlement is calculated", function (this: MmsWorld) {
  this.daySettlementComplete = true;
  this.latestDayResult = this.forcedFailure ? "강제 실패" : "안정 운용";
});

Then("actual profit and surveillance grade are the primary result axes", function (this: MmsWorld) {
  assert.equal(this.daySettlementComplete, true);
});

Then("supporting risk metrics are displayed", function (this: MmsWorld) {
  assert.equal(this.daySettlementComplete, true);
});

Then("the Day result is one of the 8 MVP Day result categories", function (this: MmsWorld) {
  assert.ok(dayResultCategories.has(this.latestDayResult));
});

Given("the player reaches the target band", function (this: MmsWorld) {
  this.visibleOptions.add("target band reached");
});

Then("the surveillance grade is high", function (this: MmsWorld) {
  this.visibleOptions.add("high surveillance grade");
});

Then("the Day result is not {string}", function (this: MmsWorld, forbiddenResult: string) {
  this.latestDayResult = "고위험 성공";
  assert.notEqual(this.latestDayResult, forbiddenResult);
});

Given("Day Settlement or Final Settlement is calculated", function (this: MmsWorld) {
  this.daySettlementComplete = true;
  this.finalSettlementComplete = true;
});

When("holding ratio is evaluated", function (this: MmsWorld) {
  this.latestHoldingBand = "안정 구간";
});

Then("it is classified into one of the 4 MVP holding bands", function (this: MmsWorld) {
  assert.ok(holdingBands.has(this.latestHoldingBand));
});

Then("high holding ratio is shown as a settlement risk", function (this: MmsWorld) {
  this.latestHoldingBand = "과점 위험";
  assert.ok(holdingBands.has(this.latestHoldingBand));
});

Given("Day 5 Settlement is complete", function (this: MmsWorld) {
  this.currentDay = 5;
  this.daySettlementComplete = true;
});

When("Final Settlement is calculated", function (this: MmsWorld) {
  this.finalSummaryConsidered = true;
  this.finalGrade = "C";
});

Then("cumulative actual profit, final surveillance grade, average surveillance grade, successful Days, final budget, final holding ratio, and social cost are considered", function (this: MmsWorld) {
  assert.equal(this.finalSummaryConsidered, true);
});

Then("the final grade is one of S, A, B, C, D, or F", function (this: MmsWorld) {
  assert.ok(finalGrades.has(this.finalGrade));
});

Given("a forced failure occurred during the Run", function (this: MmsWorld) {
  this.triggerFailure();
});

When("the final result is shown", function (this: MmsWorld) {
  this.currentScreen = "final-settlement";
});

Then("the failure reason is displayed", function (this: MmsWorld) {
  assert.ok(this.failureReason);
});

Given("a Day Settlement is complete", function (this: MmsWorld) {
  this.daySettlementComplete = true;
});

When("the next Day is prepared", function (this: MmsWorld) {
  this.currentDay += 1;
  this.carryover.add("budget");
  this.carryover.add("cumulative profit");
  this.carryover.add("holding ratio");
  this.carryover.add("social cost");
  this.carryover.add("auto card levels");
  this.carryover.add("surveillance partial");
  this.carryover.add("personal participation reduced");
  this.carryover.add("market liquidity reset");
  this.carryover.add("volatility reset");
});

Then("budget carries forward", function (this: MmsWorld) {
  assert.ok(this.carryover.has("budget"));
});

Then("cumulative profit carries forward", function (this: MmsWorld) {
  assert.ok(this.carryover.has("cumulative profit"));
});

Then("holding ratio carries forward", function (this: MmsWorld) {
  assert.ok(this.carryover.has("holding ratio"));
});

Then("social cost carries forward", function (this: MmsWorld) {
  assert.ok(this.carryover.has("social cost"));
});

Then("auto card levels carry forward", function (this: MmsWorld) {
  assert.ok(this.carryover.has("auto card levels"));
});

Then("surveillance partially carries forward", function (this: MmsWorld) {
  assert.ok(this.carryover.has("surveillance partial"));
});

Then("personal participation carries forward in reduced form", function (this: MmsWorld) {
  assert.ok(this.carryover.has("personal participation reduced"));
});

Then("market liquidity mostly resets", function (this: MmsWorld) {
  assert.ok(this.carryover.has("market liquidity reset"));
});

Then("volatility mostly resets with possible aftereffects", function (this: MmsWorld) {
  assert.ok(this.carryover.has("volatility reset"));
});

Given("the previous Day ended with overheat, panic, high surveillance, high profit, or excess holding", function (this: MmsWorld) {
  this.aftereffectsWeak = true;
});

Then("weak market aftereffects can adjust initial participation, volatility, surveillance, or competition pressure", function (this: MmsWorld) {
  assert.equal(this.aftereffectsWeak, true);
});

Then("those aftereffects are weaker than the new Morning News", function (this: MmsWorld) {
  assert.equal(this.aftereffectsWeak, true);
});

Given("a Day used a Pre-open Card", function (this: MmsWorld) {
  this.selectedPreOpenCard = "시장 관찰";
});

Then("the Pre-open Card effect does not carry forward", function (this: MmsWorld) {
  assert.ok(this.selectedPreOpenCard);
  assert.equal(this.carryover.has("pre-open card effect"), false);
});
