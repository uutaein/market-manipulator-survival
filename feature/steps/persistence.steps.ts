import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import {
  canContinueSavedRun,
  createMapStorage,
  forbiddenPersistenceKeys,
  loadCurrentRun,
  parseSavedEnvelope,
  persistenceKeys,
  saveCurrentRun,
  saveFinalSettlement
} from "../../src/domain/persistence/localPersistence";
import { calculateFinalSettlement } from "../../src/domain/settlement/settlement";

Given("the player has an active Run", function (this: MmsWorld) {
  this.startNewRun();
});

When("the game saves progress", function (this: MmsWorld) {
  assert.ok(this.runState);
  saveCurrentRun(createMapStorage(this.storage), this.runState);
});

Then("the current Run state is stored under the MVP localStorage key", function (this: MmsWorld) {
  assert.equal(this.storage.has(persistenceKeys.currentRun), true);
});

Then("the save includes a schema version", function (this: MmsWorld) {
  const saved = parseSavedEnvelope(this.storage.get(persistenceKeys.currentRun) ?? null);
  assert.equal(saved?.schemaVersion, 1);
  assert.equal(typeof saved?.savedAt, "string");
});

Then("no cloud account data is stored", function (this: MmsWorld) {
  assert.equal(forbiddenPersistenceKeys.some((key) => this.storage.has(key)), false);
});

Given("a valid current Run save exists", function (this: MmsWorld) {
  this.startNewRun();
  saveCurrentRun(createMapStorage(this.storage), this.runState!);
});

When("the player opens the Main Menu", function (this: MmsWorld) {
  this.currentScreen = "main-menu";
  this.canContinueSavedRun = canContinueSavedRun(createMapStorage(this.storage));
});

Then("the player can continue the saved Run", function (this: MmsWorld) {
  assert.equal(this.canContinueSavedRun, true);
});

Given("the player reaches Final Settlement", function (this: MmsWorld) {
  this.completeFinalSettlement();
  this.latestFinalSettlement = calculateFinalSettlement({
    cumulativeProfit: 42,
    finalSurveillance: 35,
    surveillanceHistory: [20, 30, 35, 35, 35],
    successfulDays: 4,
    finalBudget: 88,
    finalHoldingRatio: 30,
    socialCost: 12
  });
});

When("the final result is saved", function (this: MmsWorld) {
  assert.ok(this.latestFinalSettlement);
  const result = saveFinalSettlement(createMapStorage(this.storage), this.latestFinalSettlement);
  this.bestRecordUpdated = result.bestRecordUpdated;
});

Then("the recent Final Settlement is stored locally", function (this: MmsWorld) {
  assert.equal(this.storage.has(persistenceKeys.recentFinal), true);
});

Then("the best Final grade and best cumulative profit can be updated", function (this: MmsWorld) {
  assert.equal(this.storage.has(persistenceKeys.bestRecord), true);
  assert.equal(this.bestRecordUpdated, true);
});

Given("a saved object has an incompatible schema version", function (this: MmsWorld) {
  this.storage.set(
    persistenceKeys.currentRun,
    JSON.stringify({
      schemaVersion: -1,
      savedAt: new Date().toISOString(),
      data: {}
    })
  );
});

When("the game attempts to load it", function (this: MmsWorld) {
  const result = loadCurrentRun(createMapStorage(this.storage));
  this.incompatibleSaveDiscarded = result.status === "discarded";
});

Then("the incompatible save may be discarded", function (this: MmsWorld) {
  assert.equal(this.incompatibleSaveDiscarded, true);
});

Then("the player can start a new Run", function (this: MmsWorld) {
  this.startNewRun();
  assert.equal(this.runStatus, "active");
});
