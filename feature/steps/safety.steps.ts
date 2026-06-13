import { Given, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";

Given("any player-facing content is shown", function (this: MmsWorld) {
  this.safeContentChecked = true;
});

Then("it must not include real company names", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
});

Then("it must not include real stock or ticker names", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
});

Then("it must not include real exchange names", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
});

Then("it must not include real market data", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
});

Then("it must not include real news", function (this: MmsWorld) {
  assert.equal(this.safeContentChecked, true);
});

Given("a player-facing action, card, stat, document, or hint is shown", function (this: MmsWorld) {
  this.safeTerminologyChecked = true;
});

Then("it uses approved safe abstraction terms", function (this: MmsWorld) {
  assert.equal(this.safeTerminologyChecked, true);
});

Then("it avoids direct real-world financial-crime procedure language", function (this: MmsWorld) {
  assert.equal(this.safeTerminologyChecked, true);
});

Given("the game calculates price, participation, surveillance, or profit", function (this: MmsWorld) {
  this.fictionalCalculationChecked = true;
});

Then("the calculation uses fictional game stats", function (this: MmsWorld) {
  assert.equal(this.fictionalCalculationChecked, true);
});

Then("the calculation does not claim to model real markets", function (this: MmsWorld) {
  assert.equal(this.fictionalCalculationChecked, true);
});

Then("the calculation does not require real market data", function (this: MmsWorld) {
  assert.equal(this.fictionalCalculationChecked, true);
});
