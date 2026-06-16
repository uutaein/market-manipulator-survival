# SRS v0.2.5 — Order Book Wall Decay Feedback

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Intraday order-book wall tuning and decay feedback |
| Version | v0.2.5 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.5.md |
| Baseline ADR | ../adr/ADR-0038-order-book-wall-decay.md |
| Related SRS | ./market-manipulator-survival-srs-v0.2.3-order-book-wall-decay.md, ./market-manipulator-survival-srs-v0.2.4-order-book-wall-visual-feedback.md |

This document defines the player-facing feedback slice for fictional order-book wall decay.

The feature is a fictional game abstraction. It must not use real market data, real order placement, real exchanges, real tickers, real accounts, or actionable real-world trading procedure language.

---

## 1. Event Model

| ID | Requirement |
| --- | --- |
| SRS-WALL-FEED-MODEL-001 | Intraday state must store a capped recent order-book wall event log. |
| SRS-WALL-FEED-MODEL-002 | Wall event types must include `formed`, `melted`, `collapsed`, `removed`, and `expired`. |
| SRS-WALL-FEED-MODEL-003 | Each event must include side, price level, depth delta, reserve delta, remaining depth, remaining refundable reserve, and elapsed second. |
| SRS-WALL-FEED-MODEL-004 | The event log must be local game state and must not represent real execution reports. |
| SRS-WALL-FEED-MODEL-005 | The log must keep only recent entries, with an implementation cap of at least 5 and no more than 8 entries. |

---

## 2. Event Generation

| ID | Requirement |
| --- | --- |
| SRS-WALL-FEED-EVT-001 | Starting a wall must append a `formed` event. |
| SRS-WALL-FEED-EVT-002 | Removing a wall must append a `removed` event with the refunded remaining reserve. |
| SRS-WALL-FEED-EVT-003 | A tick that consumes meaningful wall depth must append a `melted` event. |
| SRS-WALL-FEED-EVT-004 | A tick that fully consumes wall depth must append a `collapsed` event. |
| SRS-WALL-FEED-EVT-005 | A wall that expires with remaining reserve must append an `expired` event. |
| SRS-WALL-FEED-EVT-006 | Tiny depth changes below the UI threshold may be aggregated away to avoid noisy logs. |

---

## 3. Tuning Values

| ID | Requirement |
| --- | --- |
| SRS-WALL-FEED-TUNE-001 | Buy and sell wall decay values must remain side-specific tunables. |
| SRS-WALL-FEED-TUNE-002 | Strong opposing pressure at the barrier must still be able to fully melt a max-reserve wall within its duration. |
| SRS-WALL-FEED-TUNE-003 | Moderate opposing pressure must show partial melt without instantly deleting the wall. |
| SRS-WALL-FEED-TUNE-004 | Neutral pressure must not create melt events. |

---

## 4. UI Requirements

| ID | Requirement |
| --- | --- |
| SRS-WALL-FEED-UI-001 | The Intraday scene must not display a separate order-book wall feedback panel. |
| SRS-WALL-FEED-UI-002 | Recent wall feedback must be represented on the affected order-book row through status text, row title, depth bar, cooldown state, or remaining-state indicator. |
| SRS-WALL-FEED-UI-003 | Row-level feedback text must use game abstraction terms such as `depth`, `예약`, `환급`, and `방어선` when text is needed. |
| SRS-WALL-FEED-UI-004 | The UI must not use real venue, order-routing, real ticker, or real execution terminology. |

---

## 5. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-WALL-FEED-AC-001 | Starting a wall creates a recent event in state and visible row-level feedback. |
| SRS-WALL-FEED-AC-002 | Partial melt creates a `melted` event with consumed depth and remaining refund. |
| SRS-WALL-FEED-AC-003 | Full melt creates a `collapsed` event and removes the price barrier. |
| SRS-WALL-FEED-AC-004 | Removing a wall creates a `removed` event with the refunded amount. |
| SRS-WALL-FEED-AC-005 | The event log is capped for state storage, and no separate newest-first feedback panel is rendered. |
| SRS-WALL-FEED-AC-006 | The implementation passes typecheck, order-book wall regression checks, full BDD, build, and browser smoke verification. |
