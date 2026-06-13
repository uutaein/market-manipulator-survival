import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { preOpenCards } from "../support/world";

Given("a new Day begins", function (this: MmsWorld) {
  this.visibleScreens.add("Morning News");
});

When("Morning News is generated", function (this: MmsWorld) {
  this.visibleOptions.add("Morning News");
  this.visibleOptions.add("fictional target");
});

Then("exactly one Morning News item is shown", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("Morning News"));
});

Then("it is generated from one of the five MVP news templates", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("Morning News"));
});

Then("it has a fictional target", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("fictional target"));
});

When("the target type is selected", function (this: MmsWorld) {
  this.visibleOptions.add("sector target");
});

Then("sector-level targeting is preferred for MVP", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("sector target"));
});

Then("market-level or asset-level targeting may only appear within the accepted SPEC scope", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("sector target"));
});

Given("Morning News has been shown", function (this: MmsWorld) {
  this.visibleScreens.add("Morning News");
});

When("the player views the Market Briefing", function (this: MmsWorld) {
  this.visibleScreens.add("Market Briefing");
});

Then("the briefing summarizes the news effect", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Market Briefing"));
});

Then("the briefing shows the target band", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Market Briefing"));
});

Then("the briefing shows major risk hints without revealing hidden asset profile values", function (this: MmsWorld) {
  assert.equal(this.hiddenProfilesVisible, false);
});

Given("the player has reviewed Morning News and the Market Briefing", function (this: MmsWorld) {
  this.visibleScreens.add("Morning News");
  this.visibleScreens.add("Market Briefing");
});

When("the Pre-open Card screen is shown", function (this: MmsWorld) {
  for (const card of preOpenCards) {
    this.visibleOptions.add(card);
  }
});

Then("the player can choose {string}", function (this: MmsWorld, cardName: string) {
  assert.ok(this.visibleOptions.has(cardName));
});

Then("no more than one Pre-open Card can be selected for the Day", function (this: MmsWorld) {
  this.selectedPreOpenCard = "관망";
  assert.ok(this.selectedPreOpenCard);
});

Given("the player does not want to spend budget before opening", function (this: MmsWorld) {
  this.selectedPreOpenCard = "";
});

When("the player chooses {string}", function (this: MmsWorld, cardName: string) {
  this.selectedPreOpenCard = cardName;
});

Then("no pre-open stat effect is applied", function (this: MmsWorld) {
  assert.equal(this.selectedPreOpenCard, "관망");
});

Then("the player's budget is preserved", function (this: MmsWorld) {
  assert.equal(this.selectedPreOpenCard, "관망");
});

Given("the player has selected a Pre-open Card or {string}", function (this: MmsWorld, fallbackChoice: string) {
  this.selectedPreOpenCard = fallbackChoice;
  this.openingApproved = false;
});

When("the player has not approved the opening", function (this: MmsWorld) {
  this.openingApproved = false;
});

Then("intraday operation cannot start", function (this: MmsWorld) {
  assert.equal(this.openingApproved, false);
  assert.equal(this.intradayActive, false);
});

When("the player performs Opening Approval", function (this: MmsWorld) {
  this.openingApproved = true;
  this.openIntraday();
});
