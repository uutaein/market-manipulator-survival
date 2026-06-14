import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { MmsWorld } from "../support/world";
import { excludedManualActions, manualActions } from "../support/world";
import { autoCardIds } from "../../src/domain/balancing/runDefaults";
import { documentEventValues } from "../../src/domain/balancing/documentEventValues";
import { isMvpAutoCardId } from "../../src/domain/intraday/autoCards";
import { openDocumentEvent } from "../../src/domain/intraday/documentEvents";
import { clampIntradayState } from "../../src/domain/intraday/intradayState";
import {
  areManualActionsAvailable,
  cancelManualAction,
  canUseManualAction,
  tickManualActionCooldowns,
  useManualAction
} from "../../src/domain/intraday/manualActions";
import { gameSession } from "../../src/game/GameSession";

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

Then("the intraday timer starts at 180 seconds", function (this: MmsWorld) {
  assert.equal(this.intradayState?.timeRemainingSec, 180);
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

Then("price movement is calculated from pressure, participation, holding, liquidity, competition, news, aftereffect, attention fade, order book depth, fake OHLCV simulator adjustment, and volatility noise components", function (this: MmsWorld) {
  assert.ok(this.intradayState?.latestPriceComponents);
  assert.equal(typeof this.intradayState.latestPriceComponents.pressure, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.participation, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.holding, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.liquidity, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.competition, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.news, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.aftereffect, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.attentionFade, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.orderBookMultiplier, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.sellWallDepth, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.buyWallDepth, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.meanReversion, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.targetResistance, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.overheatDrag, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.pullbackShock, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.reboundSupport, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.externalSimulatorImpulse, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.externalSimulatorVolumeFactor, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.simulatorAdjustment, "number");
  assert.equal(typeof this.intradayState.latestPriceComponents.volatilityNoise, "number");
});

Then("the price is not directly overwritten by a manual action or card", function (this: MmsWorld) {
  assert.ok(this.intradayState?.latestPriceComponents);
  assert.equal(
    this.intradayState.priceChangePercent,
    this.priceBeforeTick + this.intradayState.latestPriceComponents.clampedDelta
  );
});

When("an overheated price tick runs", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = {
    ...this.intradayState!,
    priceChangePercent: 14,
    currentPrice: Math.round(this.intradayState!.openingPrice * 1.14),
    marketPressure: 52,
    personalParticipation: 76,
    volatility: 62,
    priceTickIndex: 9
  };
  this.runPriceTick();
});

Then("the price simulator applies negative reversion pressure", function (this: MmsWorld) {
  assert.ok(this.intradayState?.latestPriceComponents);
  assert.ok(this.intradayState.latestPriceComponents.meanReversion < 0);
  assert.ok(this.intradayState.latestPriceComponents.targetResistance < 0);
  assert.ok(this.intradayState.latestPriceComponents.simulatorAdjustment < 0);
});

When("upward pressure meets a thin sell wall", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = {
    ...this.intradayState!,
    marketPressure: 100,
    marketLiquidity: 5,
    personalParticipation: 70,
    priceTickIndex: 0
  };
  this.runPriceTick();
});

Then("the order book multiplier amplifies upward price movement", function (this: MmsWorld) {
  assert.ok(this.intradayState?.latestPriceComponents);
  assert.ok(this.intradayState.latestPriceComponents.sellWallDepth < 50);
  assert.ok(this.intradayState.latestPriceComponents.orderBookMultiplier > 1);
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
  this.useManualAction("매수봇");
});

Then("the action affects budget, market pressure, liquidity, participation, holding ratio, surveillance, or volatility", function (this: MmsWorld) {
  assert.equal(this.lastManualActionResult?.applied, true);
  assert.equal(this.intradayState?.lastManualActionId, "price_push");
  assert.equal(this.intradayState?.activeManualActionEffects.some((effect) => effect.actionId === "price_push"), true);
});

Then("the action does not directly set the final price", function (this: MmsWorld) {
  assert.equal(this.intradayState?.priceChangePercent, this.priceBeforeManualAction);
});

Then("the action enters cooldown if applicable", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.manualActionCooldowns.price_push > 0);
});

When("the player runs buy bot long enough for position accounting", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = movePriceAboveAverageEntry(this.intradayState!);
  this.heldUnitsBeforeManualAction = this.intradayState!.heldUnits;
  this.averageEntryPriceBeforeManualAction = this.intradayState!.averageEntryPrice;
  this.budgetBeforeManualAction = this.intradayState!.budget;
  this.useManualAction("매수봇");
  this.intradayState = tickManualActionCooldowns(this.intradayState!, 4);
});

Then("held units increase", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.heldUnits > this.heldUnitsBeforeManualAction);
});

Then("average entry price increases", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.averageEntryPrice > this.averageEntryPriceBeforeManualAction);
});

Then("budget decreases by more than the buy bot fee", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.budget < this.budgetBeforeManualAction - 4);
});

When("the player marks the asset up from the high 9000s to 14000", function () {
  gameSession.startNewRun();
  gameSession.beginDay();
  gameSession.selectPreOpenCard("선취매", {
    earlyPositioningBudgetPercent: 50
  });

  const state = gameSession.startIntraday();
  const openingPrice = 9800;
  const currentPrice = 14000;
  const priceChangePercent = ((currentPrice / openingPrice) - 1) * 100;

  gameSession.intradayState = clampIntradayState({
    ...state,
    openingPrice,
    averageEntryPrice: 10200,
    priceChangePercent
  });
});

Then("the intraday total profit is positive", function () {
  const ledger = gameSession.getIntradayMoneyLedger();

  assert.ok(ledger);
  assert.ok(
    ledger.estimatedNetProfitLoss > 0,
    `expected positive total profit, got ${ledger.estimatedNetProfitLoss} with current ${ledger.currentPrice} and average ${ledger.averageEntryPrice}`
  );
});

When("the Day starts below the original Run budget and account value is {int}", function (accountValue: number) {
  gameSession.startNewRun();
  gameSession.runState = {
    ...gameSession.ensureRun(),
    currentDay: 2,
    budget: 56.4,
    holdingRatio: 10
  };
  gameSession.beginDay();
  gameSession.selectPreOpenCard("관망");
  const state = gameSession.startIntraday();

  gameSession.intradayState = clampIntradayState({
    ...state,
    budget: 50,
    openingPrice: 10000,
    averageEntryPrice: 10000,
    priceChangePercent: 0,
    holdingRatio: accountValue - 50,
    assetInfluenceResistance: 1
  });
});

Then("the intraday total account value is {int}", function (accountValue: number) {
  const ledger = gameSession.getIntradayMoneyLedger();

  assert.ok(ledger);
  assert.equal(ledger.totalAccountValue, accountValue);
});

Then("the intraday total profit is {int}", function (profitLoss: number) {
  const ledger = gameSession.getIntradayMoneyLedger();

  assert.ok(ledger);
  assert.equal(ledger.estimatedNetProfitLoss, profitLoss);
});

Then("the intraday Day profit is {float}", function (profitLoss: number) {
  const ledger = gameSession.getIntradayMoneyLedger();

  assert.ok(ledger);
  assert.equal(ledger.dayProfitLoss, profitLoss);
});

When("the player uses liquidity supply", function (this: MmsWorld) {
  this.useManualAction("유동성 공급");
});

When("the player uses buy bot", function (this: MmsWorld) {
  this.useManualAction("매수봇");
});

Then("the manual action budget change is {int}", function (this: MmsWorld, budgetDelta: number) {
  assert.equal(this.lastManualActionResult?.budgetDelta, budgetDelta);
});

When("the player runs sell bot long enough for position accounting", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = movePriceBelowAverageEntry(this.intradayState!);
  this.budgetBeforeManualAction = this.intradayState!.budget;
  this.holdingRatioBeforeManualAction = this.intradayState!.holdingRatio;
  this.averageEntryPriceBeforeManualAction = this.intradayState!.averageEntryPrice;
  this.useManualAction("매도봇");
  this.intradayState = tickManualActionCooldowns(this.intradayState!, 4);
});

Then("holding ratio decreases", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.holdingRatio < this.holdingRatioBeforeManualAction);
});

Then("budget decreases", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.budget < this.budgetBeforeManualAction);
});

Then("average entry price decreases", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.averageEntryPrice < this.averageEntryPriceBeforeManualAction);
});

When("the player uses sell bot to create a cheaper accumulation window", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = movePriceBelowAverageEntry(this.intradayState!);
  this.averageEntryPriceBeforeManualAction = this.intradayState!.averageEntryPrice;
  this.useManualAction("매도봇");
  this.intradayState = tickManualActionCooldowns(this.intradayState!, 4);
});

When("the player buys again in that cheaper accumulation window", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  this.useManualAction("매수봇");
  this.intradayState = tickManualActionCooldowns(this.intradayState, 4);
});

Then("the average entry price is below the pre-sell average", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.averageEntryPrice < this.averageEntryPriceBeforeManualAction);
});

When("the player starts a buy bot action", function (this: MmsWorld) {
  this.useManualAction("매수봇");
});

When("the player interrupts the active buy bot action", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  this.intradayState = cancelManualAction(this.intradayState, "price_push");
});

Then("the buy bot action is no longer active", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.equal(this.intradayState.activeManualActionEffects.some((effect) => effect.actionId === "price_push"), false);
});

Then("{string} is not a manual action button", function (this: MmsWorld, actionName: string) {
  assert.ok(excludedManualActions.has(normalizeLabel(actionName)));
});

function movePriceAboveAverageEntry(state: NonNullable<MmsWorld["intradayState"]>): NonNullable<MmsWorld["intradayState"]> {
  const targetPrice = state.averageEntryPrice * 1.04;
  return clampIntradayState({
    ...state,
    priceChangePercent: ((targetPrice / state.openingPrice) - 1) * 100
  });
}

function movePriceBelowAverageEntry(state: NonNullable<MmsWorld["intradayState"]>): NonNullable<MmsWorld["intradayState"]> {
  const targetPrice = state.averageEntryPrice * 0.88;
  return clampIntradayState({
    ...state,
    priceChangePercent: ((targetPrice / state.openingPrice) - 1) * 100
  });
}

When("initial Run state is created", function (this: MmsWorld) {
  if (!this.runState) {
    this.startNewRun();
  }
  this.syncAutoCardsMap();
});

Then("the player receives one random Lv.1 auto card from the 8 MVP auto cards", function (this: MmsWorld) {
  assert.equal(autoCardIds.length, 8);
  assert.equal(this.runState?.autoCards.length, 1);
  assert.ok(this.runState?.autoCards[0]);
  assert.ok(isMvpAutoCardId(this.runState.autoCards[0].cardId));
  assert.equal(this.runState.autoCards[0].level, 1);
});

When("an auto card reward timing is reached", function (this: MmsWorld) {
  this.openAutoCardRewardChoice();
});

Then("up to 3 auto card choices are shown", function (this: MmsWorld) {
  assert.ok(this.pendingAutoCardChoices.length > 0);
  assert.ok(this.pendingAutoCardChoices.length <= 3);
});

Then("the player can choose a new Lv.1 card or level up an owned card below Lv.3", function (this: MmsWorld) {
  assert.equal(this.autoCardRewardOpen, true);
  assert.ok(this.pendingAutoCardChoices.every((choice) => choice.type === "new" || choice.type === "level_up"));
});

Given("the player owns an auto card", function (this: MmsWorld) {
  this.setOwnedAutoCard("attention_signal", 1);
});

When("the card period is reached during intraday operation", function (this: MmsWorld) {
  this.triggerOwnedAutoCardEffect();
});

Then("the card applies its configured state effect", function (this: MmsWorld) {
  assert.equal(this.lastAutoCardEffectResult?.applied, true);
  assert.equal(this.lastAutoCardEffectResult.card.id, "attention_signal");
});

Then("the card effect uses abstract fictional stats only", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.equal(typeof this.intradayState.personalParticipation, "number");
  assert.ok(this.intradayState.personalParticipation >= 0 && this.intradayState.personalParticipation <= 100);
});

Given("the player owns auto cards", function (this: MmsWorld) {
  this.setOwnedAutoCard("attention_signal", 3);
});

Then("no card can exceed Lv.3", function (this: MmsWorld) {
  assert.ok([...this.autoCards.values()].every((level) => level <= 3));
});

Then("card evolution is not available", function (this: MmsWorld) {
  assert.equal(isMvpAutoCardId("evolved_card"), false);
});

Then("card synergy is not available", function (this: MmsWorld) {
  assert.equal(isMvpAutoCardId("synergy_card"), false);
});

Then("rare or legendary card types are not available", function (this: MmsWorld) {
  assert.equal(isMvpAutoCardId("legendary_card"), false);
});

When("a document event trigger condition is met", function (this: MmsWorld) {
  this.forceDocumentEventTriggerCondition();
});

When("the global event limit allows another event", function (this: MmsWorld) {
  this.allowDocumentEventByGlobalRules();
});

Then("one document event popup is shown", function (this: MmsWorld) {
  this.evaluateAndOpenDocumentEvent();
  assert.equal(this.lastDocumentEventOpenResult?.opened, true);
  assert.equal(this.documentEventOpen, true);
});

Then("intraday operation pauses", function (this: MmsWorld) {
  assert.equal(this.intradayState?.isPaused, true);
});

Given("a document event popup is shown", function (this: MmsWorld) {
  this.openDefaultDocumentEvent();
});

Then("the player sees three choices", function (this: MmsWorld) {
  assert.equal(this.intradayState?.documentEventChoices.length, 3);
});

Then("the choices represent stable, aggressive, and avoid or watch directions", function (this: MmsWorld) {
  assert.deepEqual(this.intradayState?.documentEventChoices, ["stable", "aggressive", "avoid"]);
});

When("the player selects a choice", function (this: MmsWorld) {
  this.chooseDocumentEventOption("stable");
});

Then("the selected effect is applied to abstract game stats", function (this: MmsWorld) {
  assert.equal(this.lastDocumentEventChoiceResult?.applied, true);
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.surveillance < 65 || this.intradayState.budget < 100);
});

Then("the document event closes", function (this: MmsWorld) {
  assert.equal(this.documentEventOpen, false);
  assert.equal(this.intradayState?.activeDocumentEventId, null);
});

Given("the liquidity dryness document event popup is shown", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.budgetBeforeManualAction = this.intradayState!.budget;
  this.lastDocumentEventOpenResult = openDocumentEvent(this.intradayState!, "liquidity_dryness_report");
  this.intradayState = this.lastDocumentEventOpenResult.state;
  this.documentEventOpen = true;
  this.intradayPaused = this.intradayState.isPaused;
});

Then("the aggressive liquidity document choice costs 2 budget", function () {
  const choice = documentEventValues.liquidity_dryness_report.choices.find(
    (candidate) => candidate.type === "aggressive"
  );

  assert.ok(choice);
  assert.equal(choice.label, "유동성 긴급 공급");
  assert.equal(choice.effect.budgetDelta, -2);
});

When("the player selects the aggressive document choice", function (this: MmsWorld) {
  this.chooseDocumentEventOption("aggressive");
});

Then("the document event budget change is {int}", function (this: MmsWorld, budgetDelta: number) {
  assert.ok(this.intradayState);
  assert.equal(this.intradayState.budget - this.budgetBeforeManualAction, budgetDelta);
});

Given("document events have already occurred during the Day", function (this: MmsWorld) {
  this.setDocumentEventGapBlockedState();
});

When("the event system checks for another document event", function (this: MmsWorld) {
  this.checkDocumentEventLimits();
});

Then("no more than 2 document events occur in one Day", function (this: MmsWorld) {
  assert.ok(this.documentEventsToday <= 2);
});

Then("document events respect the minimum gap between events", function (this: MmsWorld) {
  assert.equal(this.documentEventLimitAllowsAnother, false);
});

When("personal participation increases", function (this: MmsWorld) {
  this.increasePersonalParticipationForSwarm();
});

Then("the Retail Swarm becomes denser or faster", function (this: MmsWorld) {
  assert.ok(this.retailSwarmModelBefore);
  assert.ok(this.latestRetailSwarmModel);
  assert.ok(
    this.latestRetailSwarmModel.tokenCount > this.retailSwarmModelBefore.tokenCount ||
      this.latestRetailSwarmModel.speed > this.retailSwarmModelBefore.speed
  );
});

Then("the participation number increases", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.personalParticipation > this.participationBeforeSwarm);
});

Given("personal participation is high", function (this: MmsWorld) {
  this.setHighParticipationForSwarm();
});

When("the system evaluates Retail Swarm state", function (this: MmsWorld) {
  this.evaluateRetailSwarmState();
});

Then("the swarm can enter the overheated state", function (this: MmsWorld) {
  assert.equal(this.latestRetailSwarmModel?.state, "overheated");
});

Then("warning visuals are shown", function (this: MmsWorld) {
  assert.equal(this.latestRetailSwarmModel?.warningVisual, true);
});

Then("surveillance or volatility risk can increase", function (this: MmsWorld) {
  assert.ok(this.latestRetailSwarmModel);
  assert.ok(
    this.latestRetailSwarmModel.riskEffect.surveillanceDelta > 0 ||
      this.latestRetailSwarmModel.riskEffect.volatilityDelta > 0
  );
});

Given("personal participation reaches panic-risk conditions", function (this: MmsWorld) {
  this.setPanicRiskForSwarm();
});

When("panic is triggered", function (this: MmsWorld) {
  this.triggerRetailSwarmPanic();
});

Then("the swarm shows a panic state", function (this: MmsWorld) {
  assert.equal(this.latestRetailSwarmModel?.state, "panic");
  assert.equal(this.latestRetailSwarmModel.panicVisual, true);
});

Then("downward pressure or volatility risk increases", function (this: MmsWorld) {
  assert.ok(this.lastRetailSwarmEffectResult?.applied);
  assert.ok(
    this.lastRetailSwarmEffectResult.model.riskEffect.marketPressureDelta < 0 ||
      this.lastRetailSwarmEffectResult.model.riskEffect.volatilityDelta > 0
  );
});

Then("panic is represented with abstract tokens rather than realistic people", function (this: MmsWorld) {
  assert.equal(this.latestRetailSwarmModel?.usesAbstractTokens, true);
  assert.equal(this.latestRetailSwarmModel?.tokenKind, "abstract_token");
});

When("the intraday budget is depleted while a position remains", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = clampIntradayState({
    ...this.intradayState!,
    budget: 0,
    holdingRatio: Math.max(20, this.intradayState!.holdingRatio),
    heldUnits: Math.max(2000, this.intradayState!.heldUnits),
    averageEntryPrice: this.intradayState!.averageEntryPrice || this.intradayState!.openingPrice,
    currentPrice: Math.max(this.intradayState!.currentPrice, this.intradayState!.averageEntryPrice || this.intradayState!.openingPrice)
  });
});

Then("the Run is not failed by budget depletion", function (this: MmsWorld) {
  assert.notEqual(this.runStatus, "failed");
  assert.ok(this.intradayState);
});

Then("budget-cost manual actions are unavailable", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.equal(canUseManualAction(this.intradayState, "liquidity_supply"), false);
  assert.equal(canUseManualAction(this.intradayState, "price_push"), false);
  assert.equal(canUseManualAction(this.intradayState, "overheat_cooldown"), false);
});

Then("position settlement remains available when it can recover budget", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.equal(canUseManualAction(this.intradayState, "position_settlement"), true);
});

When("the player settles a position into high MADNESS", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  const highMadnessState = clampIntradayState({
    ...this.intradayState!,
    budget: 24,
    holdingRatio: 40,
    averageEntryPrice: this.intradayState!.openingPrice,
    priceChangePercent: 8,
    marketPressure: 40,
    personalParticipation: 82,
    marketLiquidity: 48,
    volatility: 58
  });
  const lowMadnessState = clampIntradayState({
    ...highMadnessState,
    priceChangePercent: -1,
    marketPressure: 0,
    personalParticipation: 25,
    volatility: 25
  });
  const lowResult = useManualAction(lowMadnessState, "포지션 정리");
  const lowStateAfterSettlement = tickManualActionCooldowns(lowResult.state, 10);

  this.lowMadnessSettlementBudgetDelta = lowResult.budgetDelta;
  this.lowMadnessSettlementPressureDelta = lowStateAfterSettlement.marketPressure - lowMadnessState.marketPressure;
  this.holdingRatioBeforeManualAction = highMadnessState.holdingRatio;
  this.heldUnitsBeforeManualAction = highMadnessState.heldUnits;
  this.lastManualActionResult = useManualAction(highMadnessState, "포지션 정리");
  this.highMadnessSettlementBudgetDelta = this.lastManualActionResult.budgetDelta;
  this.intradayState = tickManualActionCooldowns(this.lastManualActionResult.state, 10);
  this.highMadnessSettlementPressureDelta = this.intradayState.marketPressure - highMadnessState.marketPressure;
});

Then("the position settlement still reduces held units", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.heldUnits < this.heldUnitsBeforeManualAction);
  assert.ok(this.intradayState.holdingRatio < this.holdingRatioBeforeManualAction);
});

Then("MADNESS absorbs part of the settlement pressure", function (this: MmsWorld) {
  assert.ok(this.intradayState);
  assert.ok(this.intradayState.madness > 55);
  assert.ok(this.highMadnessSettlementPressureDelta > this.lowMadnessSettlementPressureDelta);
});

Then("MADNESS improves the settlement recovery", function (this: MmsWorld) {
  assert.ok(this.highMadnessSettlementBudgetDelta > this.lowMadnessSettlementBudgetDelta);
});
