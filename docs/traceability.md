# Traceability Matrix

| Item | Value |
| --- | --- |
| Product | Market Manipulator Survival |
| Purpose | Link MVP PRD decisions to SRS requirements, Gherkin features, and future test cases |
| Status | Living Document |
| Date | 2026-06-13 |
| Baseline PRD | ./prd/market-manipulator-survival-prd-v0.1.5.md |
| MVP Freeze Candidate | ./prd/market-manipulator-survival-mvp-freeze-candidate.md |
| MVP SPEC | ./spec/market-manipulator-survival-mvp-spec-v0.1.0.md |

This document tracks MVP feature scope from PRD decisions through SRS requirements, SPEC scope, and future test cases.

`TC` entries are placeholders until test cases are written. They reserve the expected test coverage area without creating implementation work yet.

---

## Status Values

| Status | Meaning |
| --- | --- |
| `PRD Approved` | Product scope is approved in PRD/ADR. |
| `SRS Drafted` | Requirements exist but may still need review. |
| `SRS Ready` | Requirements are specific enough for implementation planning. |
| `SPEC Scoped` | Feature is included in the MVP SPEC. |
| `SPEC Accepted` | Feature is included in the accepted MVP SPEC. |
| `Gherkin Drafted` | Gherkin feature coverage exists. |
| `Step Definitions Drafted` | Executable Cucumber step definitions exist for the Gherkin scenarios. |
| `Domain Implemented` | Non-UI domain module exists and is exercised by executable checks. |
| `TC Planned` | Test case ID is reserved but not written. |
| `TC Drafted` | Test case is written but not executed. |
| `Implemented` | Feature has code implementation. |
| `Scaffolded` | Implementation structure exists, but feature behavior is not complete. |
| `Verified` | Feature has passed its planned tests. |
| `Deferred` | Explicitly outside MVP or moved to P1/P2. |

---

## MVP Feature Traceability

| Feature ID | Feature | PRD / ADR Source | SRS Source | Gherkin Source | TC ID | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FEAT-001 | 5-Day Run structure | PRD v0.1.5; ADR-0007; ADR-0009 | SRS v0.1.0, v0.1.2 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-RUN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Day 1~5, no early success ending. |
| FEAT-002 | Day phase flow | PRD v0.1.5; ADR-0007; ADR-0012 | SRS v0.1.0, v0.1.2 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-FLOW-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Morning News through Day Settlement. |
| FEAT-003 | Immediate Run failure | PRD v0.1.5; ADR-0008 | SRS v0.1.0, v0.1.1, v0.1.4, v0.1.6 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-FAIL-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Budget, surveillance, price collapse. |
| FEAT-004 | Fictional sectors and assets | PRD v0.1.5; ADR-0003; ADR-0023; ADR-0026 | SRS v0.1.0, v0.1.6 | [asset_selection_and_profiles.feature](../feature/market/asset_selection_and_profiles.feature) | TC-ASSET-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 8 sectors, 24 fictional assets exist in `src/domain/assets/assetCatalog.ts`; UI wiring pending. |
| FEAT-005 | Run-random hidden asset profile | PRD v0.1.5; ADR-0022; ADR-0023 | SRS v0.1.0, v0.1.6 | [asset_selection_and_profiles.feature](../feature/market/asset_selection_and_profiles.feature) | TC-ASSET-002 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Seeded stable/standard/high-risk tendency assignment exists in `src/domain/run/runState.ts`; player-facing concealment UI pending. |
| FEAT-006 | Run Seed and same-condition restart | PRD v0.1.5; ADR-0024 | SRS v0.1.0, v0.1.2, v0.1.4 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature), [local_storage.feature](../feature/persistence/local_storage.feature) | TC-SEED-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Core same-seed Run recreation exists; persistence and UI wiring pending. |
| FEAT-007 | Morning News templates | PRD v0.1.5; ADR-0005; ADR-0011 | SRS v0.1.3, v0.1.6 | [news_and_briefing.feature](../feature/preopen/news_and_briefing.feature) | TC-NEWS-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 5 templates and seeded Day news generation exist in `src/domain/day/`; UI wiring pending. |
| FEAT-008 | Market Briefing | PRD v0.1.5; ADR-0005; ADR-0010 | SRS v0.1.2, v0.1.3 | [news_and_briefing.feature](../feature/preopen/news_and_briefing.feature) | TC-BRIEF-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Briefing data exists in `src/domain/day/daySetup.ts`; UI copy and scene wiring pending. |
| FEAT-009 | Pre-open cards | PRD v0.1.5; ADR-0012 | SRS v0.1.3, v0.1.6 | [preopen_cards.feature](../feature/preopen/preopen_cards.feature) | TC-PREOPEN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 4 card values, max-one selection, and no-effect `관망` exist in `src/domain/preopen/`; scene wiring pending. |
| FEAT-010 | Opening approval / stamp action | PRD v0.1.5; ADR-0012 | SRS v0.1.0, v0.1.2, v0.1.3 | [preopen_cards.feature](../feature/preopen/preopen_cards.feature) | TC-OPEN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Domain rule requires selected card or `관망` before opening approval; exact input gesture remains UX-level. |
| FEAT-011 | Intraday 360-second operation | PRD v0.1.5; ADR-0007 | SRS v0.1.0, v0.1.1, v0.1.2 | [tick_simulation.feature](../feature/intraday/tick_simulation.feature) | TC-INTRA-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 360-second timer and pause/resume behavior exist in `src/domain/intraday/`; scene wiring pending. |
| FEAT-012 | Core intraday stats | PRD v0.1.5; ADR-0002; ADR-0006 | SRS v0.1.0, v0.1.1 | [tick_simulation.feature](../feature/intraday/tick_simulation.feature) | TC-STATE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Core intraday state and 0~100 bounded stat clamping exist in `src/domain/intraday/`; UI wiring pending. |
| FEAT-013 | Tick price formula | PRD v0.1.5; ADR-0027 | SRS v0.1.1, v0.1.6 | [tick_simulation.feature](../feature/intraday/tick_simulation.feature) | TC-PRICE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Component-based fictional player price tick exists in `src/domain/intraday/priceTick.ts`; manual action effects pending. |
| FEAT-014 | Manual actions | PRD v0.1.5; ADR-0011 | SRS v0.1.1, v0.1.3, v0.1.6 | [manual_actions.feature](../feature/intraday/manual_actions.feature) | TC-ACTION-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 4 action values, cost checks, cooldown entry, modal disable, and state effects exist in `src/domain/intraday/manualActions.ts`; scene wiring pending. |
| FEAT-015 | Auto cards | PRD v0.1.5; ADR-0013 | SRS v0.1.0, v0.1.1, v0.1.3, v0.1.6 | [auto_cards.feature](../feature/intraday/auto_cards.feature) | TC-AUTO-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 8 card values, Lv.1~Lv.3 cap, reward choices, and periodic state effects exist in `src/domain/intraday/autoCards.ts`; scene wiring pending. |
| FEAT-016 | Document events | PRD v0.1.5; ADR-0014 | SRS v0.1.0, v0.1.3, v0.1.6 | [document_events.feature](../feature/intraday/document_events.feature) | TC-DOC-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 8 event values, condition triggers, pause behavior, 3 choices, cap/gap rules, and choice effects exist in `src/domain/intraday/documentEvents.ts`; scene wiring pending. |
| FEAT-017 | Retail Swarm | PRD v0.1.5; ADR-0006 | SRS v0.1.1, v0.1.3 | [retail_swarm.feature](../feature/intraday/retail_swarm.feature) | TC-SWARM-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Swarm state, token model, warning/panic flags, and risk effects exist in `src/domain/intraday/retailSwarm.ts`; Phaser token rendering pending. |
| FEAT-018 | Market Board | PRD v0.1.5; ADR-0016 | SRS v0.1.0, v0.1.3, v0.1.6 | [market_board.feature](../feature/market/market_board.feature) | TC-MARKET-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | 1 detailed player asset, 7 simplified non-player assets. |
| FEAT-019 | Day Settlement | PRD v0.1.5; ADR-0008; ADR-0015 | SRS v0.1.0, v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-SETTLE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Result matrix and profit bands defined. |
| FEAT-020 | Final Settlement | PRD v0.1.5; ADR-0008; ADR-0015 | SRS v0.1.0, v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-FINAL-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Final grades and adjustment rules defined. |
| FEAT-021 | Holding ratio settlement risk | PRD v0.1.5; ADR-0017 | SRS v0.1.0, v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-HOLD-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | 4 bands, final-grade adjustment. |
| FEAT-022 | Social cost | PRD v0.1.5; ADR-0008; ADR-0015 | SRS v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-SOCIAL-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Abstract risk score only. |
| FEAT-023 | Day carryover and aftereffects | PRD v0.1.5; ADR-0021 | SRS v0.1.0, v0.1.4, v0.1.6 | [carryover_and_aftereffects.feature](../feature/settlement/carryover_and_aftereffects.feature) | TC-CARRY-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Rates and caps defined. |
| FEAT-024 | Day 1 integrated onboarding | PRD v0.1.5; ADR-0019 | SRS v0.1.2, v0.1.6 | [day1_onboarding.feature](../feature/run/day1_onboarding.feature) | TC-ONBOARD-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | Hint copy can be written later. |
| FEAT-025 | MVP screens | PRD v0.1.5; ADR-0018 | SRS v0.1.2, v0.1.6 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-SCREEN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | 8 screens; failure is Final Settlement variant. |
| FEAT-026 | Local persistence | PRD v0.1.5; ADR-0025 | SRS v0.1.0, v0.1.4, v0.1.6 | [local_storage.feature](../feature/persistence/local_storage.feature) | TC-SAVE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | localStorage only, versioned keys. |
| FEAT-027 | Safe abstraction layer | PRD v0.1.5; ADR-0002; ADR-0027 | All SRS docs | [safety_abstraction.feature](../feature/safety/safety_abstraction.feature) | TC-SAFE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | No real stocks, exchanges, market data, or real procedure modeling. |

---

## Deferred Scope Traceability

| Feature ID | Deferred Feature | PRD / ADR Source | Status | Notes |
| --- | --- | --- | --- | --- |
| DEF-001 | Card synergy and evolution | PRD v0.1.5; ADR-0020 | Deferred | P1 candidate. |
| DEF-002 | 24-asset detailed real-time simulation | PRD v0.1.5; ADR-0016; ADR-0020 | Deferred | P1 candidate. |
| DEF-003 | 24+ handcrafted news items | PRD v0.1.5; ADR-0011; ADR-0020 | Deferred | P1 candidate. |
| DEF-004 | Intraday breaking news / news chains | PRD v0.1.5; ADR-0020 | Deferred | P1/P2 candidate. |
| DEF-005 | Complex accounting model | PRD v0.1.5; ADR-0020 | Deferred | P1/P2 candidate. |
| DEF-006 | Separate tutorial mode | PRD v0.1.5; ADR-0019; ADR-0020 | Deferred | P1 candidate. |
| DEF-007 | Codex, collections, replay, ranking | PRD v0.1.5; ADR-0020 | Deferred | P1/P2 candidate. |
| DEF-008 | Electron packaging and mobile optimization | PRD v0.1.5; ADR-0020 | Deferred | P1/P2 candidate. |
| DEF-009 | Real market data or real financial model | PRD v0.1.5; ADR-0002; ADR-0027 | Deferred | Excluded from MVP direction. |
| DEF-010 | Financial domain expert review / real market validation | SDD v0.1.0 | Deferred | Explicitly outside MVP. |

---

## Implementation Scaffold Traceability

| Scaffold ID | Scope | SPEC / SDD Source | Implementation Location | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| SCF-001 | TypeScript + Phaser 3 + Vite project | SPEC v0.1.0 section 1 | `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.ts` | Scaffolded | Buildable browser scaffold. |
| SCF-002 | MVP screen shell | SPEC v0.1.0 section 4 | `src/game/scenes/` | Scaffolded | 7 Phaser scenes cover 8 MVP screens; Document Event remains an Intraday modal concept. |
| SCF-003 | Shared document UI shell | SDD v0.1.0 module boundaries | `src/game/scenes/BaseDocumentScene.ts` | Scaffolded | Temporary document-style shell for first implementation passes. |
| SCF-004 | Cucumber step definitions | Gherkin feature files | `cucumber.mjs`, `feature/support/`, `feature/steps/` | Step Definitions Drafted | In-memory BDD step layer for accepted MVP Gherkin coverage; not a substitute for gameplay implementation tests. |
| IMP-001 | Core Run State domain module | SPEC v0.1.0 sections 5, 8, 10 | `src/domain/` | Domain Implemented | Adds seeded random, fictional asset catalog, Run defaults, hidden profile assignment, new Run creation, and same-seed restart. |
| IMP-002 | Day setup and Morning News domain module | SPEC v0.1.0 sections 6, 7, 12 | `src/domain/day/` | Domain Implemented | Adds seeded Morning News generation, sector-default fictional targeting, Today Condition, Day State, and Market Briefing data. |
| IMP-003 | Pre-open Card domain module | SPEC v0.1.0 sections 4, 7 | `src/domain/preopen/`, `src/domain/balancing/preOpenCardValues.ts` | Domain Implemented | Adds 4 Pre-open Card values, one-card-per-Day selection, no-effect `관망`, and Opening Approval guard. |
| IMP-004 | Intraday state and price tick domain module | SPEC v0.1.0 sections 5, 6 | `src/domain/intraday/`, `src/domain/balancing/priceTickValues.ts` | Domain Implemented | Adds intraday state creation, timer pause/resume, bounded stat clamping, news pressure, and component-based player price tick. |
| IMP-005 | Manual Action domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/manualActions.ts`, `src/domain/balancing/manualActionValues.ts` | Domain Implemented | Adds 4 Manual Action values, modal availability checks, budget/cooldown checks, state effects, and cooldown entry. |
| IMP-006 | Auto Card domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/autoCards.ts`, `src/domain/balancing/autoCardValues.ts` | Domain Implemented | Adds 8 Auto Card values, reward choice generation, new-card/level-up handling, Lv.3 cap, and simple periodic state effects. |
| IMP-007 | Document Event domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/documentEvents.ts`, `src/domain/balancing/documentEventValues.ts` | Domain Implemented | Adds 8 Document Event values, trigger priority, event cap/gap rules, modal pause, 3-choice state, choice effects, and event history. |
| IMP-008 | Retail Swarm domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/retailSwarm.ts`, `src/domain/balancing/retailSwarmValues.ts` | Domain Implemented | Adds participation-synced swarm state, abstract token display model, warning/panic flags, and risk effects for overheat/panic. |

---

## Step Definition Traceability

| Step Group | Gherkin Source | Step Source | Status | Notes |
| --- | --- | --- | --- | --- |
| Run lifecycle and Day 1 onboarding | `feature/run/` | `feature/steps/run.steps.ts` | Step Definitions Drafted | Covers Run start, phase progression, failure routing, same-condition restart, and Day 1 onboarding checks. |
| Asset selection and Market Board | `feature/market/` | `feature/steps/market.steps.ts` | Step Definitions Drafted | Covers fictional catalog visibility, hidden profile constraints, and 8-asset Market Board scope. |
| Morning News, briefing, and pre-open cards | `feature/preopen/` | `feature/steps/preopen.steps.ts` | Step Definitions Drafted | Covers 5-template news scope, briefing behavior, 4 pre-open cards, and Opening Approval. |
| Intraday systems | `feature/intraday/` | `feature/steps/intraday.steps.ts` | Step Definitions Drafted | Covers timer pauses, tick constraints, manual actions, auto cards, document events, and Retail Swarm behavior. |
| Settlement and carryover | `feature/settlement/` | `feature/steps/settlement.steps.ts` | Step Definitions Drafted | Covers Day/Final result axes, holding bands, carryover, and aftereffects. |
| Persistence | `feature/persistence/` | `feature/steps/persistence.steps.ts` | Step Definitions Drafted | Covers MVP localStorage keys and incompatible save handling. |
| Safety abstraction | `feature/safety/` | `feature/steps/safety.steps.ts` | Step Definitions Drafted | Covers fictional content and abstract terminology constraints. |

These steps currently validate that the accepted MVP Gherkin scenarios are executable against an in-memory support world. They do not yet validate Phaser scenes, persisted browser state, or real gameplay modules.

---

## Future Test Case Register

| TC ID | Area | Expected Test Focus | Status |
| --- | --- | --- | --- |
| TC-RUN-001 | Run structure | Day 1 starts, Day 5 ends in Final Settlement, no early success. | TC Planned |
| TC-FLOW-001 | Day flow | Required phases occur in order. | TC Planned |
| TC-FAIL-001 | Failure | Budget, surveillance, and crash failures route to failure result. | TC Planned |
| TC-ASSET-001 | Asset catalog | 8 sectors and 24 fictional assets are available. | TC Planned |
| TC-ASSET-002 | Hidden profile | Run-random tendencies are assigned and not directly displayed. | TC Planned |
| TC-SEED-001 | Seed | Same seed reproduces initial Run setup. | TC Planned |
| TC-NEWS-001 | Morning News | 1 fictional news item per Day from 5 templates. | TC Planned |
| TC-BRIEF-001 | Market Briefing | News effect, target band, and risk summary are shown. | TC Planned |
| TC-PREOPEN-001 | Pre-open card | One card or watch choice applies correct Day-only effect. | TC Planned |
| TC-OPEN-001 | Opening approval | Intraday cannot start before approval. | TC Planned |
| TC-INTRA-001 | Intraday timer | 360-second timer runs and pauses correctly. | TC Planned |
| TC-STATE-001 | Core stats | 0~100 stats clamp and update correctly. | TC Planned |
| TC-PRICE-001 | Price tick | Price formula reacts to pressure, volatility, news, and seed. | TC Planned |
| TC-ACTION-001 | Manual actions | Costs, cooldowns, disabled state, and effects work. | TC Planned |
| TC-AUTO-001 | Auto cards | Periodic effects, reward timing, and Lv.1~Lv.3 work. | TC Planned |
| TC-DOC-001 | Document events | Trigger limits, pause behavior, and 3-choice effects work. | TC Planned |
| TC-SWARM-001 | Retail Swarm | State reflects participation and panic/overheat conditions. | TC Planned |
| TC-MARKET-001 | Market Board | 1 detailed + 7 simplified assets display and update. | TC Planned |
| TC-SETTLE-001 | Day Settlement | Profit band and surveillance matrix produce correct Day result. | TC Planned |
| TC-FINAL-001 | Final Settlement | Final grade and downgrade rules work. | TC Planned |
| TC-HOLD-001 | Holding ratio | 4 settlement bands and penalties apply. | TC Planned |
| TC-SOCIAL-001 | Social cost | Abstract social cost accumulates and affects final grade. | TC Planned |
| TC-CARRY-001 | Carryover | Budget, holding, surveillance, participation, and aftereffects carry correctly. | TC Planned |
| TC-ONBOARD-001 | Day 1 onboarding | Day 1 has reduced risk and at least one low-risk event. | TC Planned |
| TC-SCREEN-001 | Screens | MVP stays within 8 screens and failure reuses final layout. | TC Planned |
| TC-SAVE-001 | Persistence | localStorage keys save current Run, recent final, and best record. | TC Planned |
| TC-SAFE-001 | Safety | No real market entities, data, or procedural real-world manipulation language appear in player-facing content. | TC Planned |

---

## Maintenance Rule

When a PRD feature changes, update this file in the same change.

When an SRS section is added, update the matching feature row.

When a Gherkin feature file is added or moved, update the matching `Gherkin Source`.

When Cucumber step definitions are added or moved, update the matching `Step Definition Traceability` row.

When tests are created, replace the reserved `TC-*` status with the actual test file, case name, or manual checklist reference.

