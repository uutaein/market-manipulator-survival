import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { createLocalMatchingEngine, type ExecutionTradeReport } from "../../src/domain/execution/localMatchingEngine";
import { clampIntradayState, createEmptyOrderBookWallCooldowns } from "../../src/domain/intraday/intradayState";
import { buildOrderBookProfile } from "../../src/domain/intraday/orderBook";
import { useOrderBookWall } from "../../src/domain/intraday/orderBookWalls";
import type { MmsWorld } from "../support/world";

Given("a local synthetic execution engine", function (this: MmsWorld) {
  this.executionGateway = createLocalMatchingEngine();
  this.executionReports = [];
  this.executionDepth = undefined;
});

When("synthetic limit orders seed both sides of the book", function (this: MmsWorld) {
  assert.ok(this.executionGateway);
  this.executionReports = this.executionGateway.seedBook([
    { id: "bid-low", side: "buy", type: "limit", price: 99, quantity: 4 },
    { id: "bid-best-a", side: "buy", type: "limit", price: 100, quantity: 3 },
    { id: "bid-best-b", side: "buy", type: "limit", price: 100, quantity: 2 },
    { id: "ask-best", side: "sell", type: "limit", price: 103, quantity: 5 },
    { id: "ask-high", side: "sell", type: "limit", price: 104, quantity: 7 }
  ]);
  this.executionDepth = this.executionGateway.getDepth(3);
});

Then("the local depth snapshot is sorted by best price", function (this: MmsWorld) {
  assert.ok(this.executionDepth);
  assert.deepEqual(
    this.executionDepth.bids.map((level) => level.price),
    [100, 99]
  );
  assert.deepEqual(
    this.executionDepth.asks.map((level) => level.price),
    [103, 104]
  );
});

Then("the depth snapshot contains only synthetic quantities", function (this: MmsWorld) {
  assert.ok(this.executionDepth);
  assert.deepEqual(this.executionDepth.bids[0], { price: 100, quantity: 5, orderCount: 2 });
  assert.deepEqual(this.executionDepth.asks[0], { price: 103, quantity: 5, orderCount: 1 });
});

Given("seeded sell-side synthetic depth", function (this: MmsWorld) {
  assert.ok(this.executionGateway);
  this.executionGateway.seedBook([
    { id: "ask-a", side: "sell", type: "limit", price: 101, quantity: 2 },
    { id: "ask-b", side: "sell", type: "limit", price: 101, quantity: 3 }
  ]);
  this.executionDepth = this.executionGateway.getDepth(3);
});

When("a crossing synthetic buy order is submitted", function (this: MmsWorld) {
  assert.ok(this.executionGateway);
  this.executionReports = this.executionGateway.submit({
    id: "buy-cross",
    side: "buy",
    type: "limit",
    price: 101,
    quantity: 4
  });
  this.executionDepth = this.executionGateway.getDepth(3);
});

Then("local execution reports include a trade and final fill", function (this: MmsWorld) {
  const trades = this.executionReports.filter((report): report is ExecutionTradeReport => report.type === "trade");

  assert.equal(trades.length, 2);
  assert.equal(this.executionReports.some((report) => report.type === "filled" && report.orderId === "buy-cross"), true);
});

Then("remaining depth reflects the partial consumption", function (this: MmsWorld) {
  assert.ok(this.executionDepth);
  assert.deepEqual(this.executionDepth.asks, [{ price: 101, quantity: 1, orderCount: 1 }]);
});

When("the remaining synthetic order is canceled", function (this: MmsWorld) {
  assert.ok(this.executionGateway);
  this.executionReports = this.executionGateway.cancel("ask-b");
  this.executionDepth = this.executionGateway.getDepth(3);
});

Then("the local engine removes it from the book", function (this: MmsWorld) {
  assert.equal(this.executionReports.some((report) => report.type === "canceled" && report.orderId === "ask-b"), true);
  assert.ok(this.executionDepth);
  assert.deepEqual(this.executionDepth.asks, []);
});

When("a synthetic buy wall is added to a visible bid level", function (this: MmsWorld) {
  if (!this.intradayState) {
    this.openIntraday();
  }

  this.intradayState = clampIntradayState({
    ...this.intradayState!,
    marketLiquidity: 25,
    marketPressure: 0,
    personalParticipation: 30,
    volatility: 35,
    assetInfluenceResistance: 1,
    orderBookWallCooldowns: createEmptyOrderBookWallCooldowns(),
    activeOrderBookWallEffects: []
  });
  const context = { runSeed: this.runSeed, dayIndex: this.currentDay };
  this.orderBookProfileBeforeWall = buildOrderBookProfile(this.intradayState!, context);
  const bidLevel = this.orderBookProfileBeforeWall.levels.find((level) => level.offsetPercent === -1);
  assert.ok(bidLevel);
  this.activeSyntheticWallPriceChangePercent = bidLevel.priceChangePercent;
  const result = useOrderBookWall(this.intradayState!, "buy", -1, bidLevel.priceChangePercent);
  assert.equal(result.applied, true);
  this.intradayState = result.state;
  this.orderBookProfileAfterWall = buildOrderBookProfile(this.intradayState, context);
});

Then("the order-book profile reads the active level from execution depth", function (this: MmsWorld) {
  assert.ok(this.orderBookProfileAfterWall);
  const activeLevel = this.orderBookProfileAfterWall.levels.find(
    (level) => Math.abs(level.priceChangePercent - this.activeSyntheticWallPriceChangePercent) < 0.5
  );

  assert.ok(activeLevel);
  assert.ok(
    this.orderBookProfileAfterWall.executionDepth.bids.some(
      (level) => level.quantity === activeLevel.bidDepth && level.orderCount > 1
    )
  );
});

Then("downward responsiveness decreases while the synthetic wall is active", function (this: MmsWorld) {
  assert.ok(this.orderBookProfileBeforeWall);
  assert.ok(this.orderBookProfileAfterWall);
  assert.ok(
    this.orderBookProfileAfterWall.downwardResponsiveness <
      this.orderBookProfileBeforeWall.downwardResponsiveness
  );
});
