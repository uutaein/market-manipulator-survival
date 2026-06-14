# SRS v0.2.3 — Order Book Wall Decay

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Stateful decay for fictional Intraday order-book walls |
| Version | v0.2.3 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.3.md |
| Baseline ADR | ../adr/ADR-0038-order-book-wall-decay.md |
| Related SRS | ./market-manipulator-survival-srs-v0.2.1-order-book-wall-interactions.md, ./market-manipulator-survival-srs-v0.2.2-local-synthetic-execution-engine.md |

This document defines the stateful decay slice for contextual `매수벽 세우기` and `매도벽 세우기`.

The feature is a fictional game abstraction. It must not use real market data, real order placement, real exchanges, real tickers, real accounts, or actionable real-world trading procedure language.

---

## 1. Feature Model

Active walls must retain their original values for telemetry and their remaining values for gameplay.

```ts
type ActiveOrderBookWallEffect = {
  side: "buy" | "sell";
  offsetPercent: number;
  priceChangePercent: number;
  reservedBudget: number;
  depthBoost: number;
  remainingReservedBudget: number;
  remainingDepthBoost: number;
  remainingSec: number;
  totalSec: number;
};
```

| ID | Requirement |
| --- | --- |
| SRS-WALL-DECAY-MODEL-001 | Active wall state must represent remaining depth separately from original depth. |
| SRS-WALL-DECAY-MODEL-002 | Active wall state must represent remaining refundable reserve separately from original reserved budget. |
| SRS-WALL-DECAY-MODEL-003 | Existing active wall records without remaining fields must be interpreted as full remaining depth and full remaining reserve. |
| SRS-WALL-DECAY-MODEL-004 | A wall is active for depth, barrier, and removal matching only while `remainingSec > 0` and `remainingDepthBoost > 0`. |

---

## 2. Decay Inputs and Values

Order-book wall balancing values must include tunable decay constants.

| ID | Requirement |
| --- | --- |
| SRS-WALL-DECAY-VAL-001 | Wall balancing must include opposing-pressure decay per second. |
| SRS-WALL-DECAY-VAL-002 | Wall balancing must include a touch multiplier applied when the current price is at or beyond the wall's barrier level. |
| SRS-WALL-DECAY-VAL-003 | Neutral ticks with no opposing pressure must not consume wall depth by default. |
| SRS-WALL-DECAY-VAL-004 | Decay values must be side-specific tunables even if initial buy and sell values are equal. |

---

## 3. Decay Behavior

| ID | Requirement |
| --- | --- |
| SRS-WALL-DECAY-RUN-001 | A buy wall must decay from negative fictional market pressure. |
| SRS-WALL-DECAY-RUN-002 | A sell wall must decay from positive fictional market pressure. |
| SRS-WALL-DECAY-RUN-003 | A buy wall receives touch decay when the current price is at or below the wall price level. |
| SRS-WALL-DECAY-RUN-004 | A sell wall receives touch decay when the current price is at or above the wall price level. |
| SRS-WALL-DECAY-RUN-005 | Each tick must reduce `remainingDepthBoost` by at most the depth still remaining. |
| SRS-WALL-DECAY-RUN-006 | Each tick must consume `remainingReservedBudget` in proportion to the depth consumed during that tick. |
| SRS-WALL-DECAY-RUN-007 | A wall with no remaining depth must be removed from active effects and must not refund consumed reserve. |
| SRS-WALL-DECAY-RUN-008 | A wall that expires with remaining depth must refund only `remainingReservedBudget`. |
| SRS-WALL-DECAY-RUN-009 | Removing an active wall must refund only `remainingReservedBudget`. |

---

## 4. Order-Book and Price Integration

| ID | Requirement |
| --- | --- |
| SRS-WALL-DECAY-BOOK-001 | Visible order-book SIZE must use `remainingDepthBoost` for active walls. |
| SRS-WALL-DECAY-BOOK-002 | Local synthetic execution depth seeding must use `remainingDepthBoost` for wall liquidity. |
| SRS-WALL-DECAY-BOOK-003 | Multiple active levels on the same side must contribute only their remaining depth to responsiveness. |
| SRS-WALL-DECAY-BOOK-004 | Buy-wall price barriers must apply only while the matching buy wall has remaining depth. |
| SRS-WALL-DECAY-BOOK-005 | Sell-wall price barriers must apply only while the matching sell wall has remaining depth. |
| SRS-WALL-DECAY-BOOK-006 | Once a wall fully melts, the same price level must remain on cooldown but no longer blocks price crossing. |

---

## 5. UI Requirements

| ID | Requirement |
| --- | --- |
| SRS-WALL-DECAY-UI-001 | Active wall removal labels must show the current refundable reserve, not the original reserve. |
| SRS-WALL-DECAY-UI-002 | The existing hover-row interaction must remain the only wall activation/removal control. |
| SRS-WALL-DECAY-UI-003 | The visible row SIZE must shrink as remaining wall depth shrinks. |

---

## 6. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-WALL-DECAY-AC-001 | Starting a wall stores original depth/reserve and matching remaining depth/reserve. |
| SRS-WALL-DECAY-AC-002 | Opposing pressure at the barrier reduces visible wall depth and remaining refundable reserve. |
| SRS-WALL-DECAY-AC-003 | Removing a partially decayed wall refunds less than the original reserve and exactly the remaining reserve. |
| SRS-WALL-DECAY-AC-004 | A fully melted wall is removed from active effects and no longer clamps price movement. |
| SRS-WALL-DECAY-AC-005 | Expiry refunds only the remaining reserve. |
| SRS-WALL-DECAY-AC-006 | The implementation passes typecheck, order-book wall regression checks, execution-engine regression checks, and the full BDD suite. |
