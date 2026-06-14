# SRS v0.1.5 — Freeze Readiness Review

| Item | Value |
| --- | --- |
| Document Type | SRS Review |
| Product | Market Manipulator Survival |
| Scope | MVP SRS freeze readiness |
| Version | v0.1.5 |
| Status | Historical Review / Superseded by SRS v0.1.6 and first-playable implementation |
| Date | 2026-06-13 |
| Current As Of | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| Baseline SRS | ./market-manipulator-survival-srs-v0.1.0-core-game-state.md through ./market-manipulator-survival-srs-v0.1.4-settlement-carryover-persistence.md |

This document reviews the current MVP SRS set and separates remaining work into:

1. decisions required before SRS freeze,
2. tuning values that can remain adjustable,
3. items that should stay outside MVP.

This document does not add new MVP features.

Current note:

> This review captured readiness gaps before SRS v0.1.6 and before the first playable implementation. Treat the blocker list below as historical context. The current actionable baseline is SRS v0.1.6, the MVP SPEC, and `docs/traceability.md`.

---

## 1. Current Status

The current SRS set is ready for implementation discussion, but it is not yet a final SRS freeze.

| Area | Status | Notes |
| --- | --- | --- |
| Core game state | Mostly ready | Main Run, Day, Intraday, Event, Market Board, Settlement, and Persistence states are defined. |
| Tick price formula | Draft ready | A simple fictional tick formula exists, with modular coefficients and default numbers. |
| Run flow and screens | Mostly ready | The 8 MVP screens and Day flow are defined. Failure screen handling needs one small clarification. |
| Content and interactions | Partially ready | Counts and names are fixed. Trigger rules, cooldowns, and effects need SRS-level baselines. |
| Settlement and carryover | Partially ready | Categories are fixed. Actual profit bands, final grade cuts, carryover rates, and social cost values need baselines. |
| Persistence | Scope ready | Storage scope is fixed. Exact localStorage keys and schema are not yet defined. |

Conclusion:

> The SRS has the correct MVP shape, but it still needs a small freeze pass for baseline values, event triggers, settlement thresholds, and persistence structure.

---

## 2. Blocking Decisions Before SRS Freeze

These decisions should be closed before implementation starts.

### SRS-FR-001 — Asset Catalog IDs and Display Names

The PRD fixes 8 sectors and 24 fictional assets, but the SRS does not yet define the final fictional asset IDs and display names.

Required before implementation:

1. 3 fictional asset IDs per sector,
2. player-facing Korean display names,
3. short briefing text per asset,
4. hidden Run-level profile tendency assignment support.

Recommended handling:

> Create a compact SRS content appendix for the 24 fictional assets. Keep names fictional and avoid real stock or exchange references.

### SRS-FR-002 — Run Start Baseline State

The current SRS references several baseline values but does not collect them into one table.

Required before implementation:

1. starting budget,
2. budget action guard,
3. Day 1 initial holding ratio,
4. Day 1 initial personal participation,
5. Day 1 initial liquidity,
6. Day 1 initial surveillance,
7. Day 1 initial volatility,
8. initial auto card rule.

Recommended baseline:

| State | Recommended MVP Baseline |
| --- | ---: |
| starting budget | 100 |
| budget action guard | 0 |
| initial holding ratio | 0 |
| initial personal participation | 30 |
| initial market liquidity | 50 |
| initial surveillance | 10 |
| initial volatility | 35 |
| initial competition pressure | 30 |
| initial auto cards | 1 random Lv.1 card from the 8 MVP auto cards |

### SRS-FR-003 — Market Board Selection Rule

The SRS states that 8 assets are displayed, but not how the 7 non-player assets are selected.

Required before implementation:

1. player asset always displayed,
2. same-sector peer asset count,
3. representative other-sector asset count,
4. handling when Morning News targets an undisplayed sector or asset.

Recommended baseline:

| Slot | Rule |
| --- | --- |
| 1 | Player selected asset |
| 2~3 | Other two assets from the same sector |
| 4~8 | Five representative assets from other sectors, prioritizing news-affected sectors |

If Morning News affects a non-displayed sector, at least one representative from that sector should appear on the board.

### SRS-FR-004 — Pre-open Card Effects

Pre-open card names and baseline roles are fixed in SRS v0.1.6.

Current baseline:

1. `선취매` increases holding ratio with a slightly worse average entry price,
2. `뉴스 배정` lets the player choose a positive or negative news direction for the selected fictional asset,
3. `종목 분석` strengthens price-push and overheat-cooldown effects,
4. `관망` no-effect behavior.

Handling:

> Keep exact values in balancing data. `뉴스 배정` is one MVP card even though it exposes positive/negative direction buttons.

### SRS-FR-005 — Manual Action Cooldowns

Manual action effects have draft values, but action cooldowns are still open.

Required before implementation:

1. cooldown per manual action,
2. whether actions can be used while document events are open,
3. UI disabled state when budget is insufficient.

Recommended baseline:

| Action | Recommended Cooldown |
| --- | ---: |
| 유동성 공급 | 8 sec |
| 매수봇 | 16 sec |
| 매도봇 | 12 sec |
| 포지션 정리 | 10 sec |

Manual actions should be disabled while a document event is active.

### SRS-FR-006 — Auto Card Reward Timing

The SRS defines 8 auto cards and Lv.1~Lv.3, but the reward trigger remains open.

Required before implementation:

1. when the first auto card is granted,
2. when card choice rewards appear,
3. whether rewards pause the game,
4. duplicate card handling.

Recommended baseline:

| Rule | Recommended MVP Baseline |
| --- | --- |
| Run start | 1 random Lv.1 auto card |
| Reward timing | Every 90 seconds of intraday time |
| Choices | 3 choices |
| Choice result | New Lv.1 card or +1 level to existing card |
| Max level | Lv.3 |
| Pause behavior | Pause intraday while choosing |

### SRS-FR-007 — Document Event Trigger and Cooldown Rules

Document event names and roles are fixed, but trigger thresholds and occurrence limits are open.

Required before implementation:

1. trigger threshold per event,
2. minimum time between document events,
3. maximum document events per Day,
4. Day 1 event behavior,
5. choice effects per event.

Recommended baseline:

| Rule | Recommended MVP Baseline |
| --- | --- |
| Max events per Day | 2 |
| Minimum gap | 90 sec intraday time |
| Day 1 | 1 low-risk event, strongly likely |
| Event choice count | 3 |
| Pause behavior | Pause intraday until choice |

### SRS-FR-008 — Settlement Thresholds

Day and Final result labels are fixed, but numeric thresholds are not.

Required before implementation:

1. Day profit bands,
2. Day result matrix,
3. Final grade cuts,
4. social cost grade penalty rule,
5. successful Day definition.

Recommended handling:

> Create one SRS settlement matrix using broad thresholds. Keep the values easy to tune after playtesting.

### SRS-FR-009 — Carryover and Market Aftereffect Rates

Carryover categories are fixed, but exact rates are not.

Required before implementation:

1. surveillance carryover rate,
2. personal participation decay rate,
3. liquidity reset value,
4. volatility reset value,
5. aftereffect duration and strength,
6. news residual stacking rule.

Recommended handling:

> Define weak default rates and cap aftereffects to avoid runaway 5-Day snowballing.

### SRS-FR-010 — localStorage Schema

Persistence scope is fixed, but exact keys and versioning are not.

Required before implementation:

1. storage key names,
2. schema version field,
3. current Run save shape,
4. recent Final Settlement save shape,
5. best record comparison rule,
6. behavior when saved schema is incompatible.

Recommended handling:

> Define one small versioned JSON schema. Discard incompatible old saves in MVP rather than building migration tools.

### SRS-FR-011 — Run Failure Screen Handling

The SRS includes `run_failed` as a phase, but the MVP screen list is limited to 8 screens and does not name a separate failure screen.

Required before implementation:

1. whether failure reuses Final Settlement screen,
2. whether failure reuses Day Settlement layout,
3. which buttons appear after failure.

Recommended baseline:

> Treat Run failure as a Final Settlement variant with `finalGrade = F`, `forcedFailure = true`, failure reason display, `같은 조건으로 재시작`, and `새 Run 시작`.

This preserves the 8-screen MVP limit.

### SRS-FR-012 — Main Menu Records and Settings Scope

The screen list says Main Menu can enter settings and records, but MVP excludes advanced settings and separate statistics screens.

Required before implementation:

1. whether records are shown inline on Main Menu,
2. whether settings are limited to basic audio/display toggles,
3. whether any separate settings/records screen exists.

Recommended baseline:

> Main Menu shows best Final grade and best cumulative profit inline. MVP settings are limited to basic audio toggle or can be omitted. No separate records/settings screen is added.

---

## 3. Non-blocking Tuning Items

These items do not need product-owner decisions before SRS freeze. They can remain adjustable during balancing.

1. exact price coefficient tuning,
2. exact news pressure values,
3. exact volatility noise coefficient,
4. exact manual action costs after first playtest,
5. exact auto card period/effect tuning after first playtest,
6. exact document event copy,
7. exact settlement hint copy,
8. exact visual intensity of warning states,
9. UI layout spacing and animation details,
10. final color palette and CRT/document treatment.

---

## 4. Items That Must Stay Outside MVP

The following must not be pulled into SRS freeze.

1. real market data,
2. real company, stock, exchange, or news references,
3. real financial procedure modeling,
4. card synergies or card evolution,
5. 24-asset detailed real-time simulation,
6. separate tutorial mode,
7. cloud save, online ranking, replay, daily challenge,
8. Electron packaging,
9. mobile/iPad optimization,
10. financial domain expert review or real market validation.

---

## 5. Recommended SRS Freeze Passes

To freeze SRS without over-designing, use the following order.

| Priority | Pass | Output |
| ---: | --- | --- |
| 1 | Baseline values | Starting state, manual cooldowns, auto reward timing, Day 1 defaults |
| 2 | Event and settlement baselines | Document event triggers, Day result matrix, Final grade cuts |
| 3 | Content appendix | 24 fictional asset IDs/names and short briefings |
| 4 | Carryover and persistence | Carryover rates, aftereffect caps, localStorage schema |
| 5 | UI state clarification | Failure screen variant, Main Menu records/settings scope |

Recommended next document:

> `market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md`

That document should close SRS-FR-002 through SRS-FR-007 first, because those are the highest-impact implementation blockers.

---

## 6. Freeze Readiness Checklist

| Check | Status |
| --- | --- |
| PRD MVP scope is clear | Ready |
| ADR decisions are reflected in PRD | Ready |
| Core state variables are identified | Ready |
| Tick formula exists at MVP level | Draft ready |
| Screen flow is defined | Mostly ready |
| Content counts are fixed | Ready |
| Manual actions are fixed | Ready |
| Auto cards are fixed | Ready |
| Document events are fixed | Ready |
| Market board size is fixed | Ready |
| Settlement labels are fixed | Ready |
| Baseline effects and triggers are defined | Not ready |
| Settlement thresholds are defined | Not ready |
| Carryover rates are defined | Not ready |
| Persistence schema is defined | Not ready |
| Failure screen behavior is clarified | Not ready |

SRS freeze should wait until the five "Not ready" rows are resolved.
