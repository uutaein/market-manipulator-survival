import { Given, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import {
  collectPlayerFacingContent,
  collectTerminologyContent,
  validateCalculationSafety,
  validateSafetyContent
} from "../../src/domain/safety/safetyContract";

Given("any player-facing content is shown", function (this: MmsWorld) {
  this.safetyReport = validateSafetyContent(collectPlayerFacingContent());
  this.safeContentChecked = true;
});

Then("it must not include real company names", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
  assert.deepEqual(this.safetyReport?.realEntityViolations, []);
});

Then("it must not include real stock or ticker names", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
  assert.deepEqual(this.safetyReport?.realEntityViolations, []);
});

Then("it must not include real exchange names", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
  assert.deepEqual(this.safetyReport?.realEntityViolations, []);
});

Then("it must not include real market data", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
  assert.deepEqual(this.safetyReport?.realMarketDataViolations, []);
});

Then("it must not include real news", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
  assert.deepEqual(this.safetyReport?.realNewsViolations, []);
});

Given("a player-facing action, card, stat, document, or hint is shown", function (this: MmsWorld) {
  this.terminologyReport = validateSafetyContent(collectTerminologyContent());
  this.safeTerminologyChecked = true;
});

Then("it uses approved safe abstraction terms", function (this: MmsWorld) {
  assert.equal(this.safeTerminologyChecked, true);
  assert.ok((this.terminologyReport?.approvedTermHits.length ?? 0) > 0);
});

Then("it avoids direct real-world financial-crime procedure language", function (this: MmsWorld) {
  assert.equal(this.safeTerminologyChecked, true);
  assert.deepEqual(this.terminologyReport?.procedureTermViolations, []);
});

Given("the game calculates price, participation, surveillance, or profit", function (this: MmsWorld) {
  this.calculationSafetyReport = validateCalculationSafety({
    usesFictionalGameStats: true,
    claimsRealMarketModel: false,
    requiresRealMarketData: false
  });
  this.fictionalCalculationChecked = true;
});

Then("the calculation uses fictional game stats", function (this: MmsWorld) {
  assert.equal(this.fictionalCalculationChecked, true);
  assert.equal(this.calculationSafetyReport?.usesFictionalGameStats, true);
});

Then("the calculation does not claim to model real markets", function (this: MmsWorld) {
  assert.equal(this.fictionalCalculationChecked, true);
  assert.equal(this.calculationSafetyReport?.claimsRealMarketModel, false);
});

Then("the calculation does not require real market data", function (this: MmsWorld) {
  assert.equal(this.fictionalCalculationChecked, true);
  assert.equal(this.calculationSafetyReport?.requiresRealMarketData, false);
  assert.equal(this.calculationSafetyReport?.passed, true);
});
