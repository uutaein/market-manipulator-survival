import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { preOpenCards } from "../support/world";
import { getAssetsBySector } from "../../src/domain/assets/assetCatalog";
import { isMorningNewsTemplateId, morningNewsTemplates } from "../../src/domain/day/morningNews";
import { getActiveNewsPricePressure } from "../../src/domain/intraday/newsPressure";
import { canStartIntraday, hasStatEffect } from "../../src/domain/preopen/preOpenCards";

Given("a new Day begins", function (this: MmsWorld) {
  this.beginDay();
});

Given("a new Day begins before Morning News is revealed", function (this: MmsWorld) {
  this.beginDay();
  this.visibleScreens.delete("Morning News");
  this.visibleScreens.delete("Market Briefing");
});

When("Morning News is generated", function (this: MmsWorld) {
  this.beginDay();
});

Then("exactly three Morning News items are shown", function (this: MmsWorld) {
  assert.equal(this.dayState?.morningNewsItems.length, 3);
});

Then("one Morning News item targets a sector", function (this: MmsWorld) {
  assert.equal(this.dayState?.morningNewsItems.filter((news) => news.target.type === "sector").length, 1);
});

Then("two Morning News items target fictional assets", function (this: MmsWorld) {
  assert.equal(this.dayState?.morningNewsItems.filter((news) => news.target.type === "asset").length, 2);
});

Then("each Morning News item is generated from one of the five MVP news templates", function (this: MmsWorld) {
  assert.equal(morningNewsTemplates.length, 5);
  assert.ok(this.dayState?.morningNewsItems.every((news) => isMorningNewsTemplateId(news.templateId)));
});

Then("it has a fictional target", function (this: MmsWorld) {
  assert.ok(this.dayState?.morningNews.target);
});

When("the target type is selected", function (this: MmsWorld) {
  if (!this.dayState) {
    this.beginDay();
  }
});

Then("sector-level targeting is preferred for MVP", function (this: MmsWorld) {
  assert.equal(this.dayState?.morningNews.target.type, "sector");
});

Then("market-level or asset-level targeting may only appear within the accepted SPEC scope", function (this: MmsWorld) {
  assert.ok(["sector", "market", "asset"].includes(this.dayState?.morningNews.target.type ?? ""));
});

When("non-player asset news is evaluated for player pressure", function (this: MmsWorld) {
  if (!this.runState) {
    this.startNewRun();
  }

  const competitor = getAssetsBySector(this.runState!.selectedSectorId).find(
    (asset) => asset.id !== this.runState!.selectedAssetId
  );
  assert.ok(competitor);

  const competitorBadNews = {
    templateId: "sector_negative_catalyst",
    displayName: `${competitor.displayName} 납품 지연설`,
    designLabel: "Asset Negative Catalyst",
    role: "Increases downward pressure and volatility for one fictional asset.",
    target: {
      type: "asset",
      sectorId: competitor.sectorId,
      assetId: competitor.id
    }
  } as const;

  this.latestNewsPressure = getActiveNewsPricePressure(this.runState!, [competitorBadNews]);
});

Then("the non-player asset news does not change player asset pressure", function (this: MmsWorld) {
  assert.equal(this.latestNewsPressure, 0);
});

Given("Morning News has been shown", function (this: MmsWorld) {
  this.beginDay();
  this.showMarketBriefing();
});

Given("a Pre-open Card has been selected", function (this: MmsWorld) {
  this.beginDay();
  this.choosePreOpenCard("관망");
});

When("the player views the Market Briefing", function (this: MmsWorld) {
  this.showMarketBriefing();
});

Then("the briefing summarizes the news effect", function (this: MmsWorld) {
  assert.ok(this.marketBriefing?.newsSummary);
});

Then("the briefing shows the target band", function (this: MmsWorld) {
  assert.ok(this.marketBriefing?.targetBandLabel);
});

Then("the briefing shows major risk hints without revealing hidden asset profile values", function (this: MmsWorld) {
  assert.ok(this.marketBriefing?.riskHints.length);
  assert.equal(this.marketBriefing?.hiddenProfileValuesRevealed, false);
  assert.equal(this.hiddenProfilesVisible, false);
});

Given("the player has reviewed Morning News and the Market Briefing", function (this: MmsWorld) {
  this.beginDay();
  this.showMarketBriefing();
});

When("the Pre-open Card screen is shown", function (this: MmsWorld) {
  for (const card of preOpenCards) {
    if (card === "뉴스 배정") {
      this.visibleOptions.add("뉴스 배정: 호재");
      this.visibleOptions.add("뉴스 배정: 악재");
    } else {
      this.visibleOptions.add(card);
    }
  }
});

Then("the player can choose {string}", function (this: MmsWorld, cardName: string) {
  assert.ok(this.visibleOptions.has(cardName));
});

Then("no more than one Pre-open Card can be selected for the Day", function (this: MmsWorld) {
  this.choosePreOpenCard("관망");
  this.choosePreOpenCard("뉴스 배정: 호재");
  assert.ok(this.preOpenSelectionError);
});

Then("Morning News has not been shown yet", function (this: MmsWorld) {
  assert.equal(this.visibleScreens.has("Morning News"), false);
});

When("the player confirms the pre-open choice", function (this: MmsWorld) {
  if (!this.dayState?.preOpenCardId) {
    this.choosePreOpenCard("관망");
  }
  this.showMarketBriefing();
});

Then("Morning News and the Market Briefing are shown", function (this: MmsWorld) {
  assert.ok(this.visibleScreens.has("Morning News"));
  assert.ok(this.visibleScreens.has("Market Briefing"));
});

Given("the player does not want to spend budget before opening", function (this: MmsWorld) {
  this.beginDay();
  this.selectedPreOpenCard = "";
});

When("the player chooses {string}", function (this: MmsWorld, cardName: string) {
  this.choosePreOpenCard(cardName);
});

When("the player chooses early positioning with {int} percent of current budget", function (
  this: MmsWorld,
  percent: number
) {
  this.choosePreOpenCard("사전 포지션 확보", {
    earlyPositioningBudgetPercent: percent
  });
});

Then("the pre-open effect spends {int} percent of the current budget", function (this: MmsWorld, percent: number) {
  assert.ok(this.dayState?.preOpenCardEffect);
  const expectedSpend = Math.round(((this.dayState.startingBudgetForDay * percent) / 100) * 10) / 10;
  assert.equal(this.dayState.preOpenCardEffect.budgetDelta, -expectedSpend);
});

Then("the early positioning effect stores the chosen budget ratio", function (this: MmsWorld) {
  assert.equal(this.dayState?.preOpenCardEffect?.earlyPositioningBudgetPercent, 35);
});

Then("no pre-open stat effect is applied", function (this: MmsWorld) {
  assert.equal(this.dayState?.preOpenCardId, "wait_and_see");
  assert.equal(hasStatEffect(this.dayState.preOpenCardEffect), false);
});

Then("the player's budget is preserved", function (this: MmsWorld) {
  assert.equal(this.dayState?.preOpenCardEffect?.budgetDelta, 0);
});

Given("the player has selected a Pre-open Card or {string}", function (this: MmsWorld, fallbackChoice: string) {
  this.beginDay();
  this.choosePreOpenCard(fallbackChoice);
  this.openingApproved = false;
});

When("the player has not approved the opening", function (this: MmsWorld) {
  this.openingApproved = false;
});

Then("intraday operation cannot start", function (this: MmsWorld) {
  assert.equal(this.dayState?.openingApproved, false);
  assert.equal(canStartIntraday(this.dayState!), false);
  assert.equal(this.intradayActive, false);
});

When("the player performs Opening Approval", function (this: MmsWorld) {
  this.approveOpening();
  this.openIntraday();
});
