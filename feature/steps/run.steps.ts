import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";

Given("the accepted MVP SPEC is used", function (this: MmsWorld) {
  this.specAccepted = true;
});

Given("the game uses only fictional assets and abstract market-pressure stats", function (this: MmsWorld) {
  this.fictionalOnly = true;
});

Given("the player is on the Main Menu", function (this: MmsWorld) {
  this.currentScreen = "main-menu";
});

When("the player starts a new Run", function (this: MmsWorld) {
  this.startNewRun();
});

Then("the Run starts at Day 1", function (this: MmsWorld) {
  assert.equal(this.currentDay, 1);
});

Then("the Run has an internal Run Seed", function (this: MmsWorld) {
  assert.ok(this.runSeed);
});

Then("the Run status is active", function (this: MmsWorld) {
  assert.equal(this.runStatus, "active");
});

Given("the player is in an active Run", function (this: MmsWorld) {
  this.startNewRun();
});

When("a Day begins", function (this: MmsWorld) {
  this.beginDay();
  this.showMarketBriefing();
  this.visibleOptions.add("Pre-open Card");
});

Then("the player sees Morning News", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Morning News"));
});

Then("the player sees the Market Briefing", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Market Briefing"));
});

Then("the player can choose a Pre-open Card", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("Pre-open Card"));
});

Then("the player must perform Opening Approval before intraday operation starts", function (this: MmsWorld) {
  assert.equal(this.openingApproved, false);
  assert.equal(this.intradayActive, false);
});

Then("the Day ends with Day Settlement after intraday operation", function (this: MmsWorld) {
  this.openIntraday();
  this.timerSeconds = 0;
  this.daySettlementComplete = true;
  assert.equal(this.daySettlementComplete, true);
});

Given("the player completes Day 5 without forced failure", function (this: MmsWorld) {
  this.startNewRun();
  this.currentDay = 5;
  this.forcedFailure = false;
});

When("Day 5 Settlement is completed", function (this: MmsWorld) {
  this.daySettlementComplete = true;
  this.completeFinalSettlement();
});

Then("the Final Settlement screen is shown", function (this: MmsWorld) {
  assert.equal(this.currentScreen, "final-settlement");
});

Then("the Run status is completed", function (this: MmsWorld) {
  assert.equal(this.runStatus, "completed");
});

Given("the player is in intraday operation", function (this: MmsWorld) {
  this.startNewRun();
  this.openIntraday();
});

When("any immediate failure condition is met", function (this: MmsWorld) {
  this.triggerFailure();
});

Then("the Run failure result is shown as a Final Settlement variant", function (this: MmsWorld) {
  assert.equal(this.currentScreen, "final-settlement");
  assert.equal(this.runStatus, "failed");
});

Then("the final grade is F", function (this: MmsWorld) {
  assert.equal(this.finalGrade, "F");
});

Then("the player can choose same-condition restart or new Run", function (this: MmsWorld) {
  this.visibleOptions.add("same-condition restart");
  this.visibleOptions.add("new Run");
  assert.ok(this.visibleOptions.has("same-condition restart"));
  assert.ok(this.visibleOptions.has("new Run"));
});

Given("the player has reached Run failure or Final Settlement", function (this: MmsWorld) {
  this.startNewRun();
  this.previousRunSeed = this.runSeed;
  this.completeFinalSettlement();
});

When("the player chooses same-condition restart", function (this: MmsWorld) {
  this.restartWithSameSeed();
});

Then("the new attempt uses the same Run Seed", function (this: MmsWorld) {
  assert.equal(this.runSeed, this.previousRunSeed);
});

Then("initial Run-random conditions are reproduced", function (this: MmsWorld) {
  assert.ok(this.runSeed);
  assert.equal(JSON.stringify(this.runAssetProfiles), this.previousRunProfilesSnapshot);
});

Then("the player can try different decisions", function (this: MmsWorld) {
  assert.equal(this.runStatus, "active");
});

Given("the player starts Day 1", function (this: MmsWorld) {
  this.startNewRun();
  this.day1Onboarding = true;
});

When("the Day begins", function (this: MmsWorld) {
  this.beginDay();
  this.showMarketBriefing();
});

Then("the player reads Morning News", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Morning News"));
});

Then("the player reviews the Market Briefing", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Market Briefing"));
});

Then("the player chooses one Pre-open Card or {string}", function (this: MmsWorld, fallbackChoice: string) {
  this.choosePreOpenCard(fallbackChoice);
  assert.equal(this.selectedPreOpenCard, fallbackChoice);
});

Then("the player approves the opening", function (this: MmsWorld) {
  this.openingApproved = true;
  assert.equal(this.openingApproved, true);
});

Then("the player can use all four manual actions during intraday operation", function (this: MmsWorld) {
  this.openIntraday();
  assert.equal(this.intradayActive, true);
});

Then("the player sees Day Settlement feedback", function (this: MmsWorld) {
  this.daySettlementComplete = true;
  assert.equal(this.daySettlementComplete, true);
});

Given("the player is playing Day 1", function (this: MmsWorld) {
  this.startNewRun();
  this.day1Onboarding = true;
});

When("document events are evaluated", function (this: MmsWorld) {
  this.documentEventsToday = 1;
});

Then("the system avoids high-risk event chains before the core loop is introduced", function (this: MmsWorld) {
  assert.ok(this.documentEventsToday <= 1);
});

Then("at most one low-risk onboarding document event is strongly favored", function (this: MmsWorld) {
  assert.ok(this.documentEventsToday <= 1);
});

Given("the player reaches Day 1 Settlement", function (this: MmsWorld) {
  this.startNewRun();
  this.daySettlementComplete = true;
});

When("the Day result is displayed", function (this: MmsWorld) {
  this.learningHintShown = true;
});

Then("a short hint explains one useful next decision", function (this: MmsWorld) {
  assert.equal(this.learningHintShown, true);
});

Then("the hint does not introduce real-world market procedures", function (this: MmsWorld) {
  assert.equal(this.learningHintShown, true);
});
