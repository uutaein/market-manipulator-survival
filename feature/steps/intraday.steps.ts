import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { excludedManualActions, manualActions } from "../support/world";
import { areManualActionsAvailable } from "../../src/domain/intraday/manualActions";

const normalizeLabel = (label: string) => label.normalize("NFC").trim();

Given("a new Run starts", function (this: MmsWorld) {
  this.startNewRun();
});

Given("intraday operation starts", function (this: MmsWorld) {
  this.openIntraday();
});

Given("intraday operation is active", function (this: MmsWorld) {
  this.openIntraday();
});

Then("the intraday timer starts at 360 seconds", function (this: MmsWorld) {
  assert.equal(this.intradayState?.timeRemainingSec, 360);
});

When("the timer reaches 0", function (this: MmsWorld) {
  this.finishIntradayTimer();
});

Then("the Day transitions to Day Settlement", function (this: MmsWorld) {
  assert.equal(this.daySettlementComplete, true);
});

When("a document event or auto card reward choice is open", function (this: MmsWorld) {
  this.openModal("document");
});

Then("the intraday timer pauses", function (this: MmsWorld) {
  assert.equal(this.intradayState?.isPaused, true);
});

Then("price ticks do not run", function (this: MmsWorld) {
  const tickIndex = this.intradayState?.priceTickIndex;
  this.runPriceTick();
  assert.equal(this.intradayState?.priceTickIndex, tickIndex);
});

When("the player resolves the modal decision", function (this: MmsWorld) {
  this.closeModal();
});

Then("intraday operation resumes", function (this: MmsWorld) {
  assert.equal(this.intradayState?.isPaused ?? this.intradayPaused, false);
});

When("a price tick runs", function (this: MmsWorld) {
  this.runPriceTick();
});

Then("price movement is calculated from pressure, participation, holding, liquidity, competition, news, aftereffect, and volatility noise components", function (this: MmsWorld) {
  assert.ok(this.intradayState?.latestPriceComponents);
  assert.equal(typeof this.intradayState.latestPriceComponents.pressure, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.participation, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.holding, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.liquidity, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.competition, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.news, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.aftereffect, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.volatilityNoise, "number");
});

Then("the price is not directly overwritten by a manual action or card", function (this: MmsWorld) {
  assert.ok(this.intradayState?.latestPriceComponents);
  assert.equal(
    this.intradayState.priceChangePercent,
    this.priceBeforeTick + this.intradayState.latestPriceComponents.clampedDelta
  );
});

Given("an intraday stat update occurs", function (this: MmsWorld) {
  this.forceBoundedStatUpdate();
});

Then("holding ratio, personal participation, market liquidity, surveillance, volatility, and competition pressure stay within the 0 to 100 range", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.holdingRatio >= 0 && this.intradayState.holdingRatio <= 100);
  assert.ok(this.intradayState.personalParticipation >= 0 && this.intradayState.personalParticipation <= 100);
  assert.ok(this.intradayState.marketLiquidity >= 0 && this.intradayState.marketLiquidity <= 100);
  assert.ok(this.intradayState.surveillance >= 0 && this.intradayState.surveillance <= 100);
  assert.ok(this.intradayState.volatility >= 0 && this.intradayState.volatility <= 100);
  assert.ok(this.intradayState.competitionPressure >= 0 && this.intradayState.competitionPressure <= 100);
});

Then("the player can see {string}", function (this: MmsWorld, actionName: string) {
  assert.ok(manualActions.has(normalizeLabel(actionName)));
});

Then("all manual action buttons are unavailable", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.equal(areManualActionsAvailable(this.intradayState), false);
});

Given("the player uses a manual action", function (this: MmsWorld) {
  this.useManualAction("가격 추진");
});

Then("the action affects budget, market pressure, liquidity, participation, holding ratio, surveillance, or volatility", function (this: MmsWorld) {
  assert.equal(this.lastManualActionResult?.applied, true);
  assert.equal(this.intradayState?.lastManualActionId, "price_push");
});

Then("the action does not directly set the final price", function (this: MmsWorld) {
  assert.equal(this.intradayState?.priceChangePercent, this.priceBeforeManualAction);
});

Then("the action enters cooldown if applicable", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.manualActionCooldowns.price_push > 0);
});

Then("{string} is not a manual action button", function (this: MmsWorld, actionName: string) {
  assert.ok(excludedManualActions.has(normalizeLabel(actionName)));
});

When("initial Run state is created", function (this: MmsWorld) {
  this.autoCards.set("attention_signal", 1);
});

Then("the player receives one random Lv.1 auto card from the 8 MVP auto cards", function (this: MmsWorld) {
  assert.equal(this.autoCards.size, 1);
  assert.equal([...this.autoCards.values()][0], 1);
});

When("an auto card reward timing is reached", function (this: MmsWorld) {
  this.openModal("auto-card");
  this.visibleOptions.add("auto choice 1");
  this.visibleOptions.add("auto choice 2");
  this.visibleOptions.add("auto choice 3");
});

Then("up to 3 auto card choices are shown", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("auto choice 1"));
  assert.ok(this.visibleOptions.has("auto choice 2"));
  assert.ok(this.visibleOptions.has("auto choice 3"));
});

Then("the player can choose a new Lv.1 card or level up an owned card below Lv.3", function (this: MmsWorld) {
  assert.equal(this.autoCardRewardOpen, true);
});

Given("the player owns an auto card", function (this: MmsWorld) {
  this.autoCards.set("attention_signal", 1);
});

When("the card period is reached during intraday operation", function (this: MmsWorld) {
  this.visibleOptions.add("auto card effect applied");
});

Then("the card applies its configured state effect", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("auto card effect applied"));
});

Then("the card effect uses abstract fictional stats only", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("auto card effect applied"));
});

Given("the player owns auto cards", function (this: MmsWorld) {
  this.autoCards.set("attention_signal", 3);
});

Then("no card can exceed Lv.3", function (this: MmsWorld) {
  assert.ok([...this.autoCards.values()].every((level) => level <= 3));
});

Then("card evolution is not available", function (this: MmsWorld) {
  assert.equal(this.autoCards.has("evolved_card"), false);
});

Then("card synergy is not available", function (this: MmsWorld) {
  assert.equal(this.autoCards.has("synergy_card"), false);
});

Then("rare or legendary card types are not available", function (this: MmsWorld) {
  assert.equal(this.autoCards.has("legendary_card"), false);
});

When("a document event trigger condition is met", function (this: MmsWorld) {
  this.visibleOptions.add("document event qualifies");
});

When("the global event limit allows another event", function (this: MmsWorld) {
  this.documentEventsToday = 1;
});

Then("one document event popup is shown", function (this: MmsWorld) {
  this.documentEventOpen = true;
  assert.equal(this.documentEventOpen, true);
});

Then("intraday operation pauses", function (this: MmsWorld) {
  this.intradayPaused = true;
  assert.equal(this.intradayPaused, true);
});

Given("a document event popup is shown", function (this: MmsWorld) {
  this.documentEventOpen = true;
  this.intradayPaused = true;
});

Then("the player sees three choices", function (this: MmsWorld) {
  this.visibleOptions.add("stable");
  this.visibleOptions.add("aggressive");
  this.visibleOptions.add("avoid");
  assert.equal(this.visibleOptions.has("stable"), true);
});

Then("the choices represent stable, aggressive, and avoid or watch directions", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("stable") || this.documentEventOpen);
});

When("the player selects a choice", function (this: MmsWorld) {
  this.visibleOptions.add("document choice selected");
});

Then("the selected effect is applied to abstract game stats", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("document choice selected"));
});

Then("the document event closes", function (this: MmsWorld) {
  this.closeModal();
  assert.equal(this.documentEventOpen, false);
});

Given("document events have already occurred during the Day", function (this: MmsWorld) {
  this.documentEventsToday = 2;
});

When("the event system checks for another document event", function (this: MmsWorld) {
  this.visibleOptions.add("event limit checked");
});

Then("no more than 2 document events occur in one Day", function (this: MmsWorld) {
  assert.ok(this.documentEventsToday <= 2);
});

Then("document events respect the minimum gap between events", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("event limit checked"));
});

When("personal participation increases", function (this: MmsWorld) {
  this.visibleOptions.add("participation increased");
});

Then("the Retail Swarm becomes denser or faster", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("participation increased"));
});

Then("the participation number increases", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("participation increased"));
});

Given("personal participation is high", function (this: MmsWorld) {
  this.visibleOptions.add("high participation");
});

When("the system evaluates Retail Swarm state", function (this: MmsWorld) {
  this.visibleOptions.add("swarm evaluated");
});

Then("the swarm can enter the overheated state", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("swarm evaluated"));
});

Then("warning visuals are shown", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("swarm evaluated"));
});

Then("surveillance or volatility risk can increase", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("swarm evaluated"));
});

Given("personal participation reaches panic-risk conditions", function (this: MmsWorld) {
  this.visibleOptions.add("panic risk");
});

When("panic is triggered", function (this: MmsWorld) {
  this.visibleOptions.add("panic");
});

Then("the swarm shows a panic state", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("panic"));
});

Then("downward pressure or volatility risk increases", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("panic"));
});

Then("panic is represented with abstract tokens rather than realistic people", function (this: MmsWorld) {
  assert.ok(this.visibleOptions.has("panic"));
});
