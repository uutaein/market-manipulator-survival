# SRS v0.2.6 — Order Book Wall State Indicators

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Intraday order-book wall remaining-state indicators |
| Version | v0.2.6 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.6.md |
| Baseline ADR | ../adr/ADR-0036-order-book-wall-interactions.md, ../adr/ADR-0038-order-book-wall-decay.md |
| Related SRS | ./market-manipulator-survival-srs-v0.2.5-order-book-wall-decay-feedback.md |

This document defines compact remaining-state indicators for active fictional order-book walls.

The feature is a fictional game abstraction. It must not use real market data, real order placement, real exchanges, real tickers, real accounts, or actionable real-world trading procedure language.

---

## 1. Overlay Model

| ID | Requirement |
| --- | --- |
| SRS-WALL-STATE-MODEL-001 | Order-book overlay wall actions must expose remaining depth and original depth for active walls. |
| SRS-WALL-STATE-MODEL-002 | Order-book overlay wall actions must expose remaining refundable reserve and original reserved budget for active walls. |
| SRS-WALL-STATE-MODEL-003 | Inactive rows may omit remaining-state fields and must render without the active indicator. |

---

## 2. Indicator Behavior

| ID | Requirement |
| --- | --- |
| SRS-WALL-STATE-UI-001 | Active wall rows must show a compact remaining-depth indicator. |
| SRS-WALL-STATE-UI-002 | The indicator fill ratio must be `remainingDepthBoost / depthBoost`, clamped to `0..1`. |
| SRS-WALL-STATE-UI-003 | The indicator must not change row height or order-book grid layout. |
| SRS-WALL-STATE-UI-004 | The indicator must disappear when the wall is inactive, removed, expired, or collapsed. |
| SRS-WALL-STATE-UI-005 | Active wall row title text must include remaining depth and remaining refundable reserve. |

---

## 3. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-WALL-STATE-AC-001 | Starting a wall displays an active row indicator with a ratio near 1. |
| SRS-WALL-STATE-AC-002 | Melting a wall reduces the indicator ratio. |
| SRS-WALL-STATE-AC-003 | Active row title includes remaining depth and refundable reserve values. |
| SRS-WALL-STATE-AC-004 | Inactive rows do not show active indicator classes or state text. |
| SRS-WALL-STATE-AC-005 | The implementation passes typecheck, order-book wall regression checks, full BDD, build, and browser smoke verification. |
