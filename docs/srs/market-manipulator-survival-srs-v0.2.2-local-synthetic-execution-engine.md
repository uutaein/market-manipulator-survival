# SRS v0.2.2 — Local Synthetic Execution Engine

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Local synthetic execution gateway and reference matching engine |
| Version | v0.2.2 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.2.md |
| Baseline ADR | ../adr/ADR-0037-local-synthetic-execution-engine.md |
| Related SRS | ./market-manipulator-survival-srs-v0.2.1-order-book-wall-interactions.md |

This document defines the first local-only execution slice for synthetic liquidity events.

The feature is a fictional game abstraction. It must not use real market data, real order placement, real exchanges, real tickers, real accounts, or actionable real-world trading procedure language.

---

## 1. Gateway Model

The implementation must expose a replaceable execution boundary.

```ts
interface ExecutionGateway {
  seedBook(orders: readonly ExecutionOrderRequest[]): readonly ExecutionReport[];
  submit(order: ExecutionOrderRequest): readonly ExecutionReport[];
  cancel(orderId: string): readonly ExecutionReport[];
  getDepth(levels: number): BookDepthSnapshot;
}
```

| ID | Requirement |
| --- | --- |
| SRS-EXEC-GATE-001 | Game systems must depend on the execution gateway shape rather than directly depending on a specific engine implementation. |
| SRS-EXEC-GATE-002 | The gateway must support local seeded synthetic inputs only. |
| SRS-EXEC-GATE-003 | The initial implementation may be a TypeScript reference engine. |
| SRS-EXEC-GATE-004 | A later C++/WASM or sidecar implementation must preserve the same gateway behavior before replacing the reference engine. |

---

## 2. Order and Report Model

| ID | Requirement |
| --- | --- |
| SRS-EXEC-ORDER-001 | The reference engine must accept synthetic `buy` and `sell` sides. |
| SRS-EXEC-ORDER-002 | The reference engine must accept `limit` and `market` order types. |
| SRS-EXEC-ORDER-003 | Limit orders must include a positive finite price. |
| SRS-EXEC-ORDER-004 | All orders must include a positive finite quantity and non-empty id. |
| SRS-EXEC-ORDER-005 | Invalid orders must produce a `rejected` report without changing the book. |
| SRS-EXEC-ORDER-006 | Valid submitted orders must produce an `accepted` report before later lifecycle reports. |
| SRS-EXEC-ORDER-007 | Reports must be local simulation reports, not real venue acknowledgements. |

---

## 3. Matching Behavior

| ID | Requirement |
| --- | --- |
| SRS-EXEC-MATCH-001 | Resting orders must be prioritized by better price first. |
| SRS-EXEC-MATCH-002 | Resting orders at the same price must be prioritized by earlier insertion sequence. |
| SRS-EXEC-MATCH-003 | A buy limit request may match sell-side resting depth at or below its limit price. |
| SRS-EXEC-MATCH-004 | A sell limit request may match buy-side resting depth at or above its limit price. |
| SRS-EXEC-MATCH-005 | Market requests may match available opposite-side depth until filled or until the opposite book is empty. |
| SRS-EXEC-MATCH-006 | Partial fills must reduce both incoming and resting quantities consistently. |
| SRS-EXEC-MATCH-007 | Unfilled market remainder must expire and must not rest on the book. |
| SRS-EXEC-MATCH-008 | Unfilled IOC remainder must expire and must not rest on the book. |
| SRS-EXEC-MATCH-009 | Unfilled GTC limit remainder must rest on the book. |

---

## 4. Depth and Cancel Behavior

| ID | Requirement |
| --- | --- |
| SRS-EXEC-BOOK-001 | `getDepth(levels)` must aggregate remaining resting quantity by price. |
| SRS-EXEC-BOOK-002 | Bid depth must be sorted from highest price to lower price. |
| SRS-EXEC-BOOK-003 | Ask depth must be sorted from lowest price to higher price. |
| SRS-EXEC-BOOK-004 | Depth levels must include aggregated quantity and order count. |
| SRS-EXEC-BOOK-005 | Canceling a known resting order must remove its remaining quantity and report `canceled`. |
| SRS-EXEC-BOOK-006 | Canceling an unknown order must report `rejected` with an unknown-order reason. |
| SRS-EXEC-BOOK-007 | `seedBook` must clear previous depth and seed a deterministic local book from synthetic inputs. |

---

## 5. Integration Boundary

| ID | Requirement |
| --- | --- |
| SRS-EXEC-INT-001 | The first integration slice may remain in domain modules and need not add new UI controls. |
| SRS-EXEC-INT-002 | The order-book profile must be able to seed the local execution gateway from existing fictional order-book levels. |
| SRS-EXEC-INT-003 | Active order-book wall effects must be translated into additional synthetic limit liquidity at the matching visible level before displayed depth is calculated. |
| SRS-EXEC-INT-004 | Future chart/volume integration should consume execution reports through a game adapter, not from the engine directly in a Phaser scene. |
| SRS-EXEC-INT-005 | The displayed order-book depth may continue to use the existing seeded game formulas for base liquidity, but the final visible active-level depth must come from the local execution depth snapshot. |
| SRS-EXEC-INT-006 | The first integration slice must preserve existing wall budget, cooldown, barrier, and removal behavior. |
| SRS-EXEC-INT-007 | Stateful wall quantity decay from opposing synthetic flow is deferred until a later integration slice. |

---

## 6. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-EXEC-AC-001 | The repository exposes an `ExecutionGateway` interface for synthetic execution. |
| SRS-EXEC-AC-002 | The repository includes a local reference engine implementing the gateway behavior. |
| SRS-EXEC-AC-003 | The reference engine aggregates same-price depth and preserves price-time priority. |
| SRS-EXEC-AC-004 | A crossing limit order can partially consume resting depth and leave the correct residual book. |
| SRS-EXEC-AC-005 | A market order expires unfilled remainder instead of resting. |
| SRS-EXEC-AC-006 | Cancel removes known resting orders and rejects unknown order ids. |
| SRS-EXEC-AC-007 | Order-book wall depth increases are represented in the local execution depth snapshot with more than one order at the active level. |
| SRS-EXEC-AC-008 | The implementation passes typecheck, execution-engine regression checks, and order-book wall regression checks. |
