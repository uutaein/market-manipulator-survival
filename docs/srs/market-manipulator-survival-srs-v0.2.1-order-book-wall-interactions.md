# SRS v0.2.1 — Order Book Wall Interactions

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Shared Intraday order-book wall interaction requirements |
| Version | v0.2.1 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.1.md |
| Baseline ADR | ../adr/ADR-0036-order-book-wall-interactions.md |
| Related SRS | ./market-manipulator-survival-srs-v0.1.1-tick-price-formula.md, ./market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md |

This document defines the first implementation slice for contextual `매수벽 세우기` and `매도벽 세우기` interactions inside the fictional Intraday order-book panel.

The feature is a fictional game abstraction. It must not use real market data, real order placement, real exchanges, real tickers, or actionable real-world financial procedure language.

---

## 1. Feature Model

Order-book wall interactions are short-lived level-specific effects.

```ts
type OrderBookWallSide = "buy" | "sell";

type ActiveOrderBookWallEffect = {
  side: OrderBookWallSide;
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
| SRS-WALL-MODEL-001 | Intraday state must represent level-specific active order-book wall effects. |
| SRS-WALL-MODEL-002 | Intraday state must represent price-level-specific order-book wall cooldowns keyed by the clicked fictional quote level. |
| SRS-WALL-MODEL-003 | Order-book wall effects must be cleared when a new Intraday Day starts. |
| SRS-WALL-MODEL-004 | Order-book wall effects must not carry into Day Settlement, Final Settlement, or the next Day. |
| SRS-WALL-MODEL-005 | A wall's identity must be the clicked `priceChangePercent` level, not the row's moving offset from the current price. |
| SRS-WALL-MODEL-006 | ASK +1/+2/+3 and BID -1/-2/-3 levels must be independently actionable. |

---

## 2. Baseline Values

First implementation baseline values are:

| Wall Action | Trigger Side | Reserve | Duration | Cooldown | Depth Boost | Gradual Stat Effect |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `매수벽 세우기` | BID row | `2B~10B`, up to available budget | 14 sec | 24 sec | buy-side depth `+16` per reserved `1B` | `marketPressure +10`, `personalParticipation +4`, `marketLiquidity -2`, `surveillance +3`, `volatility +2` over duration |
| `매도벽 세우기` | ASK row | `2B~10B`, up to available budget | 14 sec | 24 sec | sell-side depth `+16` per reserved `1B` | `marketPressure -10`, `personalParticipation +4`, `marketLiquidity -2`, `surveillance +3`, `volatility +2` over duration |

| ID | Requirement |
| --- | --- |
| SRS-WALL-BASE-001 | The wall action budget reserve must be deducted immediately when the action starts. |
| SRS-WALL-BASE-002 | Non-budget stat effects must apply gradually over the active duration. |
| SRS-WALL-BASE-003 | The depth boost must apply immediately to the clicked level while its effect is active. |
| SRS-WALL-BASE-004 | Values must live in an order-book wall balancing group or equivalent local constants that can be tuned without changing the price formula structure. |
| SRS-WALL-BASE-005 | Removing a wall or letting it expire must refund the remaining reserved budget for that wall after any later decay model has consumed part of the reserve. |
| SRS-WALL-BASE-006 | If available budget is below the minimum reserve, the wall action must be blocked. |

---

## 3. Availability Rules

| ID | Requirement |
| --- | --- |
| SRS-WALL-AVAIL-001 | Wall actions must be unavailable while Intraday is paused. |
| SRS-WALL-AVAIL-002 | Wall actions must be unavailable when `holdingRatio <= 0`; after the player sells out, the rest of that Day remains observation-only. |
| SRS-WALL-AVAIL-003 | A wall action must be unavailable if the player cannot reserve at least the minimum wall budget. |
| SRS-WALL-AVAIL-004 | An inactive level must be unavailable while that same level is on cooldown. |
| SRS-WALL-AVAIL-005 | Buy-side and sell-side wall cooldowns must be tracked separately per visible level. |
| SRS-WALL-AVAIL-006 | The UI must show disabled/blocked feedback without starting an effect when availability checks fail. |
| SRS-WALL-AVAIL-007 | An active level must remain clickable as a wall-removal control even if its cooldown is still running. |

---

## 4. Order-Book and Price Effects

The existing fictional order-book profile must include active wall effects.

| ID | Requirement |
| --- | --- |
| SRS-WALL-BOOK-001 | An active buy wall must increase visible buy-side depth on its clicked BID price level immediately. |
| SRS-WALL-BOOK-002 | An active sell wall must increase visible sell-side depth on its clicked ASK price level immediately. |
| SRS-WALL-BOOK-003 | Increased buy-side depth must reduce downward responsiveness through the existing order-book multiplier path. |
| SRS-WALL-BOOK-004 | Increased sell-side depth must reduce upward responsiveness through the existing order-book multiplier path. |
| SRS-WALL-BOOK-005 | Wall effects must not directly overwrite `priceChangePercent`; price movement must still pass through the price tick formula. |
| SRS-WALL-BOOK-006 | Displayed depth must remain clamped to the order-book display range. |
| SRS-WALL-BOOK-007 | Multiple active levels on the same side must all contribute to the side's average wall depth and responsiveness. |
| SRS-WALL-BOOK-008 | An active buy wall must prevent the final tick price from moving below its stored `priceChangePercent` barrier. |
| SRS-WALL-BOOK-009 | An active sell wall must prevent the final tick price from moving above its stored `priceChangePercent` barrier. |
| SRS-WALL-BOOK-010 | If the current price shifts while a wall remains active, the order-book display must keep matching/removal/cooldown state on the stored price level rather than the original row offset. |
| SRS-WALL-BOOK-011 | The barrier must be based on the clicked row's price level at action start, not a moving offset from the current price. |

---

## 5. UI Requirements

The feature must be embedded into the existing order-book panel.

| ID | Requirement |
| --- | --- |
| SRS-WALL-UI-001 | The Intraday screen must not add separate permanent buttons for `매수벽 세우기` or `매도벽 세우기`. |
| SRS-WALL-UI-002 | Hovering an ASK row must reveal an inline `매도벽 세우기` affordance. |
| SRS-WALL-UI-003 | Hovering a BID row must reveal an inline `매수벽 세우기` affordance. |
| SRS-WALL-UI-004 | Clicking the hovered affordance must request the corresponding wall action. |
| SRS-WALL-UI-005 | Active or cooldown rows must show concise status text such as remaining seconds, `벽 빼기`, or blocked reason. |
| SRS-WALL-UI-006 | The order-book overlay may accept pointer events only for the row actions; it must not block unrelated Intraday controls. |
| SRS-WALL-UI-007 | If a wall is started on one row, other rows on the same side must remain actionable unless they fail their own availability checks. |

---

## 6. Safety Requirements

| ID | Requirement |
| --- | --- |
| SRS-WALL-SAFE-001 | The feature must use fictional order-book depth generated from game state and seed only. |
| SRS-WALL-SAFE-002 | UI and docs must not describe real order placement, real order timing, evasion, real venues, real tickers, or real trading instructions. |
| SRS-WALL-SAFE-003 | The feature must remain a game-stat interaction: budget, depth, pressure, participation, liquidity, surveillance, volatility, and responsiveness. |

---

## 7. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-WALL-AC-001 | Hovering BID rows exposes `매수벽 세우기`; clicking starts a buy wall if available. |
| SRS-WALL-AC-002 | Hovering ASK rows exposes `매도벽 세우기`; clicking starts a sell wall if available. |
| SRS-WALL-AC-003 | Starting a buy wall reserves budget, immediately increases the clicked BID price level's visible SIZE/depth according to the reserve, and lowers downward responsiveness while active. |
| SRS-WALL-AC-004 | Starting a sell wall reserves budget, immediately increases the clicked ASK price level's visible SIZE/depth according to the reserve, and lowers upward responsiveness while active. |
| SRS-WALL-AC-005 | While active, a buy wall prevents price ticks from closing below the clicked level. |
| SRS-WALL-AC-006 | While active, a sell wall prevents price ticks from closing above the clicked level. |
| SRS-WALL-AC-007 | Clicking an active wall removes it and refunds its remaining reserved budget. |
| SRS-WALL-AC-008 | When holding ratio is 0, both wall actions are blocked and the player can only observe for the rest of the Day. |
| SRS-WALL-AC-009 | Wall effects expire after their duration, refund their remaining reserve on expiry, and cooldown reaches 0 after its timer. |
| SRS-WALL-AC-010 | The same level cannot be restarted during active duration or cooldown, but other visible levels can be used independently. |
| SRS-WALL-AC-011 | The implementation passes typecheck and domain regression checks for activation, remaining-reserve refund, expiry refund, cooldown, barrier clamping, depth impact, and no-position blocking. |
