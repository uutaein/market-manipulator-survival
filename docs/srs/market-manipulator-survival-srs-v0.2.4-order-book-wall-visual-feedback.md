# SRS v0.2.4 — Order Book Wall Visual Feedback

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Intraday order-book wall visual feedback |
| Version | v0.2.4 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.4.md |
| Baseline ADR | ../adr/ADR-0036-order-book-wall-interactions.md, ../adr/ADR-0038-order-book-wall-decay.md |
| Related SRS | ./market-manipulator-survival-srs-v0.2.3-order-book-wall-decay.md |

This document defines the UI quality slice for order-book wall depth changes.

The feature is a fictional game abstraction. It must not use real market data, real order placement, real exchanges, real tickers, real accounts, or actionable real-world trading procedure language.

---

## 1. DOM Row Stability

| ID | Requirement |
| --- | --- |
| SRS-WALL-VIS-MODEL-001 | Order-book row DOM nodes must be reused across overlay updates. |
| SRS-WALL-VIS-MODEL-002 | Updating a row must not replace the entire class list in a way that restarts active-wall animations every tick. |
| SRS-WALL-VIS-MODEL-003 | Row side, active, disabled, cooldown, and transient visual states must be applied through targeted class toggles. |

---

## 2. Depth and Size Animation

| ID | Requirement |
| --- | --- |
| SRS-WALL-VIS-ANIM-001 | Depth bars must animate toward target depth through `requestAnimationFrame`. |
| SRS-WALL-VIS-ANIM-002 | Depth bars must use transform scale rather than layout width for the moving portion of the bar. |
| SRS-WALL-VIS-ANIM-003 | SIZE text must continue to animate numerically toward its target value. |
| SRS-WALL-VIS-ANIM-004 | New depth targets must cancel the prior frame loop and continue from the currently displayed value. |
| SRS-WALL-VIS-ANIM-005 | Destroying the overlay must cancel all row animation frames. |

---

## 3. Wall Transition Cues

| ID | Requirement |
| --- | --- |
| SRS-WALL-VIS-CUE-001 | A newly active wall must trigger a one-shot activation pulse. |
| SRS-WALL-VIS-CUE-002 | A growing active wall must trigger a short growth cue without restarting on unchanged ticks. |
| SRS-WALL-VIS-CUE-003 | A melting active wall must trigger a short melt cue without restarting on unchanged ticks. |
| SRS-WALL-VIS-CUE-004 | Transient cue timers must be cleared when the overlay is destroyed. |

---

## 4. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-WALL-VIS-AC-001 | Starting a wall changes the active row to a stable active state and starts a one-shot activation cue. |
| SRS-WALL-VIS-AC-002 | Re-rendering the same active row without depth change does not restart activation or size animations. |
| SRS-WALL-VIS-AC-003 | Increasing depth animates the bar and SIZE upward from the current displayed values. |
| SRS-WALL-VIS-AC-004 | Decreasing depth animates the bar and SIZE downward from the current displayed values. |
| SRS-WALL-VIS-AC-005 | The implementation passes typecheck, order-book wall regression checks, full BDD, build, and browser smoke verification. |
