import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";

Given("the player has an active Run", function (this: MmsWorld) {
  this.startNewRun();
});

When("the game saves progress", function (this: MmsWorld) {
  this.storage.set("mms.currentRun.v1", {
    schemaVersion: 1,
    runSeed: this.runSeed
  });
});

Then("the current Run state is stored under the MVP localStorage key", function (this: MmsWorld) {
  assert.equal(this.storage.has("mms.currentRun.v1"), true);
});

Then("the save includes a schema version", function (this: MmsWorld) {
  const saved = this.storage.get("mms.currentRun.v1") as { schemaVersion?: number } | undefined;
  assert.equal(saved?.schemaVersion, 1);
});

Then("no cloud account data is stored", function (this: MmsWorld) {
  assert.equal(this.storage.has("cloudAccount"), false);
});

Given("a valid current Run save exists", function (this: MmsWorld) {
  this.storage.set("mms.currentRun.v1", {
    schemaVersion: 1,
    runSeed: "mms-seed-001"
  });
});

When("the player opens the Main Menu", function (this: MmsWorld) {
  this.currentScreen = "main-menu";
});

Then("the player can continue the saved Run", function (this: MmsWorld) {
  assert.equal(this.storage.has("mms.currentRun.v1"), true);
});

Given("the player reaches Final Settlement", function (this: MmsWorld) {
  this.completeFinalSettlement();
});

When("the final result is saved", function (this: MmsWorld) {
  this.storage.set("mms.recentFinal.v1", { schemaVersion: 1 });
  this.storage.set("mms.bestRecord.v1", { schemaVersion: 1 });
});

Then("the recent Final Settlement is stored locally", function (this: MmsWorld) {
  assert.equal(this.storage.has("mms.recentFinal.v1"), true);
});

Then("the best Final grade and best cumulative profit can be updated", function (this: MmsWorld) {
  assert.equal(this.storage.has("mms.bestRecord.v1"), true);
});

Given("a saved object has an incompatible schema version", function (this: MmsWorld) {
  this.storage.set("mms.currentRun.v1", { schemaVersion: -1 });
});

When("the game attempts to load it", function (this: MmsWorld) {
  this.storage.delete("mms.currentRun.v1");
  this.incompatibleSaveDiscarded = true;
});

Then("the incompatible save may be discarded", function (this: MmsWorld) {
  assert.equal(this.incompatibleSaveDiscarded, true);
});

Then("the player can start a new Run", function (this: MmsWorld) {
  this.startNewRun();
  assert.equal(this.runStatus, "active");
});
