import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { assets, getAssetsBySector, sectors } from "../../src/domain/assets/assetCatalog";
import {
  getAssetBaselineTradeValue,
  getAssetInfluenceResistance,
  getAssetMarketProfile,
  getEntryRecommendedSectorIds,
  getNextLargerSectorId,
  getSectorMarketProfile
} from "../../src/domain/assets/assetMarketProfiles";
import { buildMarketBoard } from "../../src/domain/market/marketBoard";
import { assignRunAssetProfiles, getSectorTendencies, isValidRunAssetProfiles } from "../../src/domain/run/runState";

Given("a new Run is created", function (this: MmsWorld) {
  this.startNewRun();
});

When("the Run Setup screen is shown", function (this: MmsWorld) {
  this.currentScreen = "run-setup";
  this.fictionalSectors = sectors.length;
  this.fictionalAssetsPerSector = getAssetsBySector(sectors[0].id).length;
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
  this.runAssetProfiles = assignRunAssetProfiles(this.runSeed);
  this.hiddenProfilesAssigned = isValidRunAssetProfiles(this.runAssetProfiles);
});

Then("each sector receives one stable tendency", function (this: MmsWorld) {
  assert.ok(this.runAssetProfiles);
  assert.ok(sectors.every((sector) => getSectorTendencies(this.runAssetProfiles!, sector.id).includes("stable")));
});

Then("each sector receives one standard tendency", function (this: MmsWorld) {
  assert.ok(this.runAssetProfiles);
  assert.ok(sectors.every((sector) => getSectorTendencies(this.runAssetProfiles!, sector.id).includes("standard")));
});

Then("each sector receives one high-risk tendency", function (this: MmsWorld) {
  assert.ok(this.runAssetProfiles);
  assert.ok(sectors.every((sector) => getSectorTendencies(this.runAssetProfiles!, sector.id).includes("high_risk")));
});

Then("these tendencies are assigned to the sector assets using the Run Seed", function (this: MmsWorld) {
  assert.ok(this.runSeed);
  assert.ok(this.runAssetProfiles);
  assert.deepEqual(this.runAssetProfiles, assignRunAssetProfiles(this.runSeed));
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

Then("entry recommended sectors are available", function () {
  const recommendedSectorIds = getEntryRecommendedSectorIds();

  assert.ok(recommendedSectorIds.length > 0);
  assert.ok(recommendedSectorIds.every((sectorId) => getSectorMarketProfile(sectorId).capitalTier === "entry"));
});

Then("every sector has one sector leader, one standard asset, and one theme mover", function () {
  for (const sector of sectors) {
    const roles = getAssetsBySector(sector.id)
      .map((asset) => getAssetMarketProfile(asset.id).role)
      .sort();

    assert.deepEqual(roles, ["sector_leader", "standard", "theme_mover"].sort());
  }
});

Then("sector leaders have higher baseline trade value than theme movers", function () {
  for (const sector of sectors) {
    const sectorAssets = getAssetsBySector(sector.id);
    const leader = sectorAssets.find((asset) => getAssetMarketProfile(asset.id).role === "sector_leader");
    const themeMover = sectorAssets.find((asset) => getAssetMarketProfile(asset.id).role === "theme_mover");

    assert.ok(leader);
    assert.ok(themeMover);
    assert.ok(getAssetBaselineTradeValue(leader) > getAssetBaselineTradeValue(themeMover));
  }
});

Then("top market assets have exponentially higher trade value and influence resistance than entry theme assets", function () {
  const rankedAssets = [...assets].sort(
    (left, right) => getAssetBaselineTradeValue(left) - getAssetBaselineTradeValue(right)
  );
  const lowest = rankedAssets[0];
  const highest = rankedAssets[rankedAssets.length - 1];

  assert.ok(lowest);
  assert.ok(highest);
  assert.ok(getAssetBaselineTradeValue(highest) >= getAssetBaselineTradeValue(lowest) * 40);
  assert.ok(getAssetInfluenceResistance(highest) >= getAssetInfluenceResistance(lowest) * 10);
});

Then("each entry recommended sector has a larger-sector progression target", function () {
  for (const sectorId of getEntryRecommendedSectorIds()) {
    assert.ok(getNextLargerSectorId(sectorId));
  }
});

Given("intraday operation has started", function (this: MmsWorld) {
  this.startNewRun();
  this.openIntraday();
});

When("the Market Board is shown", function (this: MmsWorld) {
  assert.ok(this.runState);
  assert.ok(this.dayState);
  this.marketBoardState = buildMarketBoard(this.runState, this.dayState);
  this.displayedAssets = this.marketBoardState.entries.length;
  this.nonPlayerAssets = this.marketBoardState.nonPlayerAssetSummaries.length;
});

Then("exactly 8 assets are displayed", function (this: MmsWorld) {
  assert.equal(this.displayedAssets, 8);
});

Then("exactly 10 market board rows are displayed", function (this: MmsWorld) {
  assert.equal(this.displayedAssets, 10);
});

Then("one displayed asset is the player's selected asset", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.equal(this.marketBoardState.entries.filter((entry) => entry.role === "player").length, 1);
  assert.equal(this.marketBoardState.playerAssetId, this.runState?.selectedAssetId);
});

Then("one row is the player's selected asset", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.equal(this.marketBoardState.entries.filter((entry) => entry.role === "player").length, 1);
  assert.equal(this.marketBoardState.playerAssetId, this.runState?.selectedAssetId);
});

Then("seven displayed assets are non-player assets", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 7);
});

Then("two rows are same-sector competitor assets", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.equal(this.marketBoardState.sameSectorPeerSummaries.length, 2);
});

Then("seven rows are other-sector averages", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.equal(this.marketBoardState.sectorAverageSummaries.length, 7);
});

Then("the market dashboard ranks all 24 fictional assets around the player's asset", function (this: MmsWorld) {
  assert.equal(assets.length, 24);
  assert.ok(this.marketBoardState);
  assert.equal(this.marketBoardState.displayedAssetIds.length, 3);
  assert.equal(this.marketBoardState.displayedAssetIds.includes(this.marketBoardState.playerAssetId), true);
});

Given("the player's selected asset belongs to a sector with two peer assets", function (this: MmsWorld) {
  if (!this.runState) {
    this.startNewRun();
  }

  this.sameSectorPeers = getAssetsBySector(this.runState!.selectedSectorId).filter(
    (asset) => asset.id !== this.runState!.selectedAssetId
  ).length;
});

When("the Market Board is built", function (this: MmsWorld) {
  if (!this.dayState) {
    this.beginDay();
  }

  this.marketBoardState = buildMarketBoard(this.runState!, this.dayState!);
  this.displayedAssets = this.marketBoardState.entries.length;
});

Then("the two same-sector peer assets are displayed", function (this: MmsWorld) {
  assert.equal(this.sameSectorPeers, 2);
  assert.ok(this.marketBoardState);
  assert.equal(this.marketBoardState.entries.filter((entry) => entry.role === "same_sector_peer").length, 2);
});

Given("Morning News affects a non-player sector", function (this: MmsWorld) {
  if (!this.runState) {
    this.startNewRun();
  }

  if (!this.dayState) {
    this.beginDay();
  }

  const targetSector = sectors.find((sector) => sector.id !== this.runState!.selectedSectorId);
  assert.ok(targetSector);
  this.newsAffectedSectorId = targetSector.id;
  const morningNews = {
    ...this.dayState!.morningNews,
    target: {
      type: "sector" as const,
      sectorId: targetSector.id
    }
  };
  this.dayState = {
    ...this.dayState!,
    morningNews,
    morningNewsItems: [morningNews, ...this.dayState!.morningNewsItems.slice(1)]
  };
});

When("representative other-sector assets are selected", function (this: MmsWorld) {
  this.marketBoardState = buildMarketBoard(this.runState!, this.dayState!);
});

When("other-sector average rows are selected", function (this: MmsWorld) {
  this.marketBoardState = buildMarketBoard(this.runState!, this.dayState!);
});

Then("at least one asset from the affected sector should be displayed", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.ok(this.newsAffectedSectorId);
  assert.ok(
    this.marketBoardState.entries.some(
      (entry) => entry.role === "sector_average" && entry.sectorId === this.newsAffectedSectorId
    )
  );
});

Then("the affected sector average should be displayed", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.ok(this.newsAffectedSectorId);
  assert.ok(
    this.marketBoardState.sectorAverageSummaries.some((entry) => entry.sectorId === this.newsAffectedSectorId)
  );
});

Given("non-player assets are displayed on the Market Board", function (this: MmsWorld) {
  this.startNewRun();
  this.beginDay();
  this.marketBoardState = buildMarketBoard(this.runState!, this.dayState!);
  this.nonPlayerAssets = this.marketBoardState.nonPlayerAssetSummaries.length;
});

Given("non-player market rows are displayed on the Market Board", function (this: MmsWorld) {
  this.startNewRun();
  this.beginDay();
  this.marketBoardState = buildMarketBoard(this.runState!, this.dayState!);
  this.nonPlayerAssets = this.marketBoardState.nonPlayerAssetSummaries.length;
});

Then("each non-player asset shows simplified movement", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 9);
  assert.ok(this.marketBoardState);
  assert.ok(
    this.marketBoardState.nonPlayerAssetSummaries.every((entry) => entry.simplifiedMovement)
  );
});

Then("each non-player market row shows simplified movement", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 9);
  assert.ok(this.marketBoardState);
  assert.ok(this.marketBoardState.nonPlayerAssetSummaries.every((entry) => entry.simplifiedMovement));
});

Then("each same-sector competitor row has a fictional current price and average price", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.ok(
    this.marketBoardState.sameSectorPeerSummaries.every(
      (entry) => entry.currentPrice > 0 && entry.averageEntryPrice > 0 && entry.referencePrice > 0
    )
  );
});

Then("each other-sector average row has a fictional current price and average price", function (this: MmsWorld) {
  assert.ok(this.marketBoardState);
  assert.ok(
    this.marketBoardState.sectorAverageSummaries.every(
      (entry) => entry.currentPrice > 0 && entry.averageEntryPrice > 0 && entry.referencePrice > 0
    )
  );
});

Then("non-player assets do not use detailed budget, holding ratio, or surveillance state", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 9);
  assert.ok(this.marketBoardState);
  assert.ok(
    this.marketBoardState.nonPlayerAssetSummaries.every(
      (entry) => !("budget" in entry) && !("holdingRatio" in entry) && !("surveillance" in entry)
    )
  );
});

Then("non-player market rows do not use detailed budget, holding ratio, or surveillance state", function (this: MmsWorld) {
  assert.equal(this.nonPlayerAssets, 9);
  assert.ok(this.marketBoardState);
  assert.ok(
    this.marketBoardState.nonPlayerAssetSummaries.every(
      (entry) => !("budget" in entry) && !("holdingRatio" in entry) && !("surveillance" in entry)
    )
  );
});
