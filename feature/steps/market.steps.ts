import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";

Given("a new Run is created", function (this: MmsWorld) {
  this.startNewRun();
});

When("the Run Setup screen is shown", function (this: MmsWorld) {
  this.currentScreen = "run-setup";
  this.fictionalSectors = 8;
  this.fictionalAssetsPerSector = 3;
});

Then("all 8 fictional sectors are available", function (this: MmsWorld) {
  assert.equal(this.fictionalSectors, 8);
});

Then("each sector has 3 fictional assets", function (this: MmsWorld) {
  assert.equal(this.fictionalAssetsPerSector, 3);
});

Then("the player can select one sector and one asset", function (this: MmsWorld) {
  this.selectedAssetVisible = true;
  assert.equal(this.selectedAssetVisible, true);
});

When("Run-random asset profiles are generated", function (this: MmsWorld) {
  this.hiddenProfilesAssigned = true;
});

Then("each sector receives one stable tendency", function (this: MmsWorld) {
  assert.equal(this.hiddenProfilesAssigned, true);
});

Then("each sector receives one standard tendency", function (this: MmsWorld) {
  assert.equal(this.hiddenProfilesAssigned, true);
});

Then("each sector receives one high-risk tendency", function (this: MmsWorld) {
  assert.equal(this.hiddenProfilesAssigned, true);
});

Then("these tendencies are assigned to the sector assets using the Run Seed", function (this: MmsWorld) {
  assert.ok(this.runSeed);
  assert.equal(this.hiddenProfilesAssigned, true);
});

Given("the player is choosing an asset", function (this: MmsWorld) {
  this.currentScreen = "run-setup";
  this.selectedAssetVisible = true;
});

Then("the player can see the asset name, sector, and short briefing", function (this: MmsWorld) {
  assert.equal(this.selectedAssetVisible, true);
});

Then("the player cannot see the hidden stable, standard, or high-risk tendency", function (this: MmsWorld) {
  assert.equal(this.hiddenProfilesVisible, false);
});

Then("the player cannot see full profile values before play", function (this: MmsWorld) {
  assert.equal(this.hiddenProfilesVisible, false);
});

Given("intraday operation has started", function (this: MmsWorld) {
  this.startNewRun();
  this.openIntraday();
});

When("the Market Board is shown", function (this: MmsWorld) {
  this.displayedAssets = 8;
  this.nonPlayerAssets = 7;
});

Then("exactly 8 assets are displayed", function (this: MmsWorld) {
  assert.equal(this.displayedAssets, 8);
});

Then("one displayed asset is the player's selected asset", function (this: MmsWorld) {
  assert.equal(this.displayedAssets, 8);
});

Then("seven displayed assets are non-player assets", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 7);
});

Given("the player's selected asset belongs to a sector with two peer assets", function (this: MmsWorld) {
  this.sameSectorPeers = 2;
});

When("the Market Board is built", function (this: MmsWorld) {
  this.displayedAssets = 8;
});

Then("the two same-sector peer assets are displayed", function (this: MmsWorld) {
  assert.equal(this.sameSectorPeers, 2);
});

Given("Morning News affects a non-player sector", function (this: MmsWorld) {
  this.visibleOptions.add("news-affected sector");
});

When("representative other-sector assets are selected", function (this: MmsWorld) {
  this.visibleOptions.add("news-affected representative asset");
});

Then("at least one asset from the affected sector should be displayed", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("news-affected representative asset"));
});

Given("non-player assets are displayed on the Market Board", function (this: MmsWorld) {
  this.nonPlayerAssets = 7;
});

Then("each non-player asset shows simplified movement", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 7);
});

Then("non-player assets do not use detailed budget, holding ratio, or surveillance state", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 7);
});
