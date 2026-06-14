import assert from "node:assert/strict";
import {
  createLocalMatchingEngine,
  type BookDepthSnapshot,
  type ExecutionReport,
  type ExecutionTradeReport
} from "../src/domain/execution/localMatchingEngine";

interface ScenarioResult {
  readonly name: string;
  readonly detail: string;
}

const scenarioResults: ScenarioResult[] = [];

runScenario("limit orders rest by price-time priority and expose depth", () => {
  const engine = createLocalMatchingEngine();

  engine.submit({ id: "bid-1", side: "buy", type: "limit", price: 99, quantity: 4 });
  engine.submit({ id: "bid-2", side: "buy", type: "limit", price: 100, quantity: 3 });
  engine.submit({ id: "bid-3", side: "buy", type: "limit", price: 100, quantity: 2 });
  engine.submit({ id: "ask-1", side: "sell", type: "limit", price: 103, quantity: 7 });

  const depth = engine.getDepth(3);

  assertDepth(depth, {
    bids: [
      { price: 100, quantity: 5, orderCount: 2 },
      { price: 99, quantity: 4, orderCount: 1 }
    ],
    asks: [{ price: 103, quantity: 7, orderCount: 1 }]
  });

  return "best bid aggregates two same-price orders before lower bid";
});

runScenario("crossing limit order produces partial fills against resting depth", () => {
  const engine = createLocalMatchingEngine();

  engine.submit({ id: "ask-a", side: "sell", type: "limit", price: 101, quantity: 2 });
  engine.submit({ id: "ask-b", side: "sell", type: "limit", price: 101, quantity: 3 });
  engine.submit({ id: "ask-c", side: "sell", type: "limit", price: 102, quantity: 5 });

  const reports = engine.submit({ id: "buy-taker", side: "buy", type: "limit", price: 101, quantity: 4 });
  const trades = getTradeReports(reports);

  assert.deepEqual(
    trades.map((trade) => [trade.makerOrderId, trade.price, trade.quantity]),
    [
      ["ask-a", 101, 2],
      ["ask-b", 101, 2]
    ]
  );
  assert.deepEqual(
    reports.filter((report) => report.type === "filled").map((report) => report.orderId),
    ["buy-taker"]
  );
  assertDepth(engine.getDepth(3), {
    bids: [],
    asks: [
      { price: 101, quantity: 1, orderCount: 1 },
      { price: 102, quantity: 5, orderCount: 1 }
    ]
  });

  return "taker consumed FIFO quantity at 101 and left one resting ask";
});

runScenario("market order expires leftover quantity without resting", () => {
  const engine = createLocalMatchingEngine();

  engine.submit({ id: "ask-a", side: "sell", type: "limit", price: 101, quantity: 2 });

  const reports = engine.submit({ id: "buy-market", side: "buy", type: "market", quantity: 5 });
  const expired = reports.find((report) => report.type === "expired");

  assert.ok(expired);
  assert.equal(expired.orderId, "buy-market");
  assert.equal(expired.remainingQuantity, 3);
  assertDepth(engine.getDepth(3), { bids: [], asks: [] });

  return "unfilled market remainder is expired, not added to book";
});

runScenario("cancel removes resting order and unknown cancel is rejected", () => {
  const engine = createLocalMatchingEngine();

  engine.submit({ id: "bid-a", side: "buy", type: "limit", price: 99, quantity: 3 });

  const cancelReports = engine.cancel("bid-a");
  const unknownReports = engine.cancel("bid-a");

  assert.deepEqual(cancelReports.map((report) => report.type), ["canceled"]);
  assert.deepEqual(unknownReports.map((report) => report.type), ["rejected"]);
  assertDepth(engine.getDepth(3), { bids: [], asks: [] });

  return "cancel is idempotent at caller level through rejected unknown order";
});

for (const result of scenarioResults) {
  console.log(`ok - ${result.name}: ${result.detail}`);
}

function runScenario(name: string, scenario: () => string): void {
  const detail = scenario();
  scenarioResults.push({ name, detail });
}

function getTradeReports(reports: readonly ExecutionReport[]): readonly ExecutionTradeReport[] {
  return reports.filter((report): report is ExecutionTradeReport => report.type === "trade");
}

function assertDepth(actual: BookDepthSnapshot, expected: BookDepthSnapshot): void {
  assert.deepEqual(actual.bids, expected.bids);
  assert.deepEqual(actual.asks, expected.asks);
}
