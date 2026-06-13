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
| FEAT-001 | 5-Day Run structure | PRD v0.1.5; ADR-0007; ADR-0009 | SRS v0.1.0, v0.1.2 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-RUN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Scene Wiring Partial / TC Planned | Day 1~5 domain exists; `src/game/GameSession.ts` now shares Run state across Main Menu, Run Setup, Morning Briefing, Pre-open, and Intraday scenes. |
| FEAT-002 | Day phase flow | PRD v0.1.5; ADR-0007; ADR-0012 | SRS v0.1.0, v0.1.2 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-FLOW-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Scene Wiring Partial / TC Planned | Pre-open selection before Morning News reveal, Morning News / Market Briefing, Opening Approval, Intraday entry, Day Settlement, and next-Day routing are wired in Phaser scenes. |
| FEAT-003 | Immediate Run failure | PRD v0.1.5; ADR-0008 | SRS v0.1.0, v0.1.1, v0.1.4, v0.1.6 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-FAIL-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Scene Wiring Partial / TC Planned | Budget exhaustion, surveillance 100, and critical price collapse now mark the Run failed and route Intraday to Final Settlement F-grade. |
| FEAT-004 | Fictional sectors and assets | PRD v0.1.5; ADR-0003; ADR-0023; ADR-0026 | SRS v0.1.0, v0.1.6 | [asset_selection_and_profiles.feature](../feature/market/asset_selection_and_profiles.feature) | TC-ASSET-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 8 sectors, 24 fictional assets exist in `src/domain/assets/assetCatalog.ts`; Run Setup scene now allows sector/asset selection and shows non-locking entry recommendations plus asset market roles from `assetMarketProfiles`. Baseline trade value is intentionally non-linear, and influence resistance scales from fixed trade-value/role profiles. |
| FEAT-005 | Run-random hidden asset profile | PRD v0.1.5; ADR-0022; ADR-0023 | SRS v0.1.0, v0.1.6 | [asset_selection_and_profiles.feature](../feature/market/asset_selection_and_profiles.feature) | TC-ASSET-002 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Seeded stable/standard/high-risk tendency assignment exists in `src/domain/run/runState.ts`; Run Setup shows only name, sector, and short briefing. |
| FEAT-006 | Run Seed and same-condition restart | PRD v0.1.5; ADR-0024 | SRS v0.1.0, v0.1.2, v0.1.4 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature), [local_storage.feature](../feature/persistence/local_storage.feature) | TC-SEED-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Core same-seed Run recreation and current Run save/load domain support exist; Final Settlement scene exposes same-condition restart and Main Menu can continue a saved Run. |
| FEAT-007 | Morning News templates | PRD v0.1.5; ADR-0005; ADR-0011 | SRS v0.1.3, v0.1.6 | [news_and_briefing.feature](../feature/preopen/news_and_briefing.feature) | TC-NEWS-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 5 templates and seeded Day news generation exist in `src/domain/day/`; each Day now generates 3 fictional news items, with 1 sector item and 2 asset items. Non-player asset news is visible as context but does not directly affect player price calculation. |
| FEAT-008 | Market Briefing | PRD v0.1.5; ADR-0005; ADR-0010 | SRS v0.1.2, v0.1.3 | [news_and_briefing.feature](../feature/preopen/news_and_briefing.feature) | TC-BRIEF-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Briefing data exists in `src/domain/day/daySetup.ts`; Morning Briefing scene now displays selected asset, target band, crash line, Today Condition, and risk hints. |
| FEAT-009 | Pre-open cards | PRD v0.1.5; ADR-0012 | SRS v0.1.3, v0.1.6 | [preopen_cards.feature](../feature/preopen/preopen_cards.feature) | TC-PREOPEN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 4 card values, max-one selection before Morning News reveal, `뉴스 배정` positive/negative directions, no-effect `관망`, and drag-style `선취매` budget investment exist in `src/domain/preopen/` and the Pre-open scene. Day 1 only allows `선취매`; from Day 2 onward, other cards open when a carried position exists. Early positioning uses 10~50% for first/no-position entry and 0~50% for carried-position optional accumulation, with a 2~7% premium entry that can start with visible valuation loss. Higher `선취매` raises holding ratio and lowers opening liquidity, but effective acquisition is reduced by asset influence resistance. |
| FEAT-010 | Opening approval / stamp action | PRD v0.1.5; ADR-0012 | SRS v0.1.0, v0.1.2, v0.1.3 | [preopen_cards.feature](../feature/preopen/preopen_cards.feature) | TC-OPEN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Opening Approval now creates initial Intraday state through `GameSession`; stamp-style input remains a later UX improvement. |
| FEAT-011 | Intraday 180-second operation | PRD v0.1.5; ADR-0007 | SRS v0.1.0, v0.1.1, v0.1.2, v0.1.6 | [tick_simulation.feature](../feature/intraday/tick_simulation.feature) | TC-INTRA-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 180-second timer and pause/resume behavior exist in `src/domain/intraday/`; Intraday scene now displays the initial timer value. |
| FEAT-012 | Core intraday stats | PRD v0.1.5; ADR-0002; ADR-0006 | SRS v0.1.0, v0.1.1 | [tick_simulation.feature](../feature/intraday/tick_simulation.feature) | TC-STATE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Core intraday state and 0~100 bounded stat clamping exist in `src/domain/intraday/`; Intraday scene now displays initial budget, price, holding, participation, liquidity, surveillance, volatility, and pressure. |
| FEAT-013 | Tick price formula | PRD v0.1.5; ADR-0027 | SRS v0.1.1, v0.1.2, v0.1.6 | [tick_simulation.feature](../feature/intraday/tick_simulation.feature) | TC-PRICE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Component-based fictional player price tick exists in `src/domain/intraday/priceTick.ts`; Intraday scene now advances price/timer once per second and renders fictional candle/volume chart history. A seeded fake OHLCV adapter adds realistic candle noise without real market data. Asset influence resistance now dampens directional pressure and deepens the fictional order book for larger trade-value assets. |
| FEAT-014 | Manual actions | PRD v0.1.5; ADR-0011 | SRS v0.1.1, v0.1.3, v0.1.6 | [manual_actions.feature](../feature/intraday/manual_actions.feature) | TC-ACTION-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 4 action values, cost checks, immediate budget commit, gradual effects, cooldown entry, modal disable, and lightweight position accounting exist in `src/domain/intraday/manualActions.ts`; buttons are `유동성 공급`, `매수봇`, `매도봇`, and dynamic `수익실현`/`손실차단` for `포지션 정리`. `매수봇` spends 4B plus actual purchase budget for acquired units, with purchase budget scaled by asset influence resistance; `매도봇` spends 4B for downward pressure, cheaper re-accumulation setup, and average-entry pressure management. Intraday scene exposes fill gauges, mid-gauge interruption, normalized account evaluation, and action-specific candle/volume responses. |
| FEAT-015 | Auto cards | PRD v0.1.5; ADR-0013 | SRS v0.1.0, v0.1.1, v0.1.3, v0.1.6 | [auto_cards.feature](../feature/intraday/auto_cards.feature) | TC-AUTO-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 8 card values, Lv.1~Lv.3 cap, reward choices, and periodic state effects exist in `src/domain/intraday/autoCards.ts`; `정리 루틴` lowers the impact of manual partial settlement without automatically selling. Intraday scene now displays owned cards, opens paused reward choices, and applies periodic card effects. |
| FEAT-016 | Document events | PRD v0.1.5; ADR-0014 | SRS v0.1.0, v0.1.3, v0.1.6 | [document_events.feature](../feature/intraday/document_events.feature) | TC-DOC-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 8 event values, condition triggers, pause behavior, 3 choices, cap/gap rules, and choice effects exist in `src/domain/intraday/documentEvents.ts`; Intraday scene now opens document event modals, pauses time, applies choices, and resumes. |
| FEAT-017 | Retail Swarm | PRD v0.1.5; ADR-0006 | SRS v0.1.1, v0.1.3 | [retail_swarm.feature](../feature/intraday/retail_swarm.feature) | TC-SWARM-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Swarm state, warning/panic flags, and risk effects exist in `src/domain/intraday/retailSwarm.ts`; Intraday scene now renders a meme-frog-style participant mood panel with RSI-like attention and volume-weighted participant entry estimate, without moving token dots. |
| FEAT-018 | Market Board | PRD v0.1.5; ADR-0016 | SRS v0.1.0, v0.1.3, v0.1.6 | [market_board.feature](../feature/market/market_board.feature) | TC-MARKET-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | 1 detailed player entry, 2 same-sector competitors, 7 other-sector average rows, news badges, and fictional quote fields exist in `src/domain/market/marketBoard.ts`; Intraday scene renders competitor context, sector context, current/average prices, and a 24-asset fictional trade-value dashboard around the player rank. Dashboard ranking uses fixed sector/asset baseline trade value plus EMA-smoothed live activity to reduce per-tick rank churn while preserving visible action impact. |
| FEAT-019 | Day Settlement | PRD v0.1.5; ADR-0008; ADR-0015 | SRS v0.1.0, v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-SETTLE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Profit bands, surveillance grades, and Day result matrix exist in `src/domain/settlement/settlement.ts`; Day Settlement scene now displays result, risk metrics, hint, and next routing. |
| FEAT-020 | Final Settlement | PRD v0.1.5; ADR-0008; ADR-0015 | SRS v0.1.0, v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-FINAL-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Final grade baselines, forced failure handling, and downgrade rules exist in `src/domain/settlement/settlement.ts`; Final Settlement scene now displays grade, cumulative profit, surveillance summary, holding band, social cost, and restart choices. |
| FEAT-021 | Holding ratio settlement risk | PRD v0.1.5; ADR-0017 | SRS v0.1.0, v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-HOLD-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | 4 holding bands and settlement risk flags exist in `src/domain/balancing/settlementValues.ts`. |
| FEAT-022 | Social cost | PRD v0.1.5; ADR-0008; ADR-0015 | SRS v0.1.4, v0.1.6 | [day_and_final_settlement.feature](../feature/settlement/day_and_final_settlement.feature) | TC-SOCIAL-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Abstract social cost deltas and final-grade adjustment inputs exist in `src/domain/settlement/settlement.ts`. |
| FEAT-023 | Day carryover and aftereffects | PRD v0.1.5; ADR-0021 | SRS v0.1.0, v0.1.4, v0.1.6 | [carryover_and_aftereffects.feature](../feature/settlement/carryover_and_aftereffects.feature) | TC-CARRY-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Budget/profit/holding/social/auto-card carryover, partial risk carryover, reset baselines, and weak aftereffects exist in `src/domain/settlement/carryover.ts`. |
| FEAT-024 | Day 1 integrated onboarding | PRD v0.1.5; ADR-0019 | SRS v0.1.2, v0.1.6 | [day1_onboarding.feature](../feature/run/day1_onboarding.feature) | TC-ONBOARD-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Scene Wiring Partial / TC Planned | Day 1 fallback document event is wired between 120 and 180 elapsed seconds when no prior event has appeared; hint copy can still be refined later. |
| FEAT-025 | MVP screens | PRD v0.1.5; ADR-0018 | SRS v0.1.2, v0.1.6 | [run_lifecycle.feature](../feature/run/run_lifecycle.feature) | TC-SCREEN-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / TC Planned | 8 screens; failure is Final Settlement variant. |
| FEAT-026 | Local persistence | PRD v0.1.5; ADR-0025 | SRS v0.1.0, v0.1.4, v0.1.6 | [local_storage.feature](../feature/persistence/local_storage.feature) | TC-SAVE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / Scene Wiring Partial / TC Planned | Versioned local save envelopes, current Run save/load, recent Final save, best record update, and incompatible save discard exist in `src/domain/persistence/localPersistence.ts`; browser localStorage adapter, Main Menu continue, active Run save, and Final result save are wired. |
| FEAT-027 | Safe abstraction layer | PRD v0.1.5; ADR-0002; ADR-0027 | All SRS docs | [safety_abstraction.feature](../feature/safety/safety_abstraction.feature) | TC-SAFE-001 | SPEC Accepted / Gherkin Drafted / Step Definitions Drafted / Domain Implemented / TC Planned | Player-facing content collection, forbidden entity/procedure term checks, approved safe-term checks, and fictional calculation checks exist in `src/domain/safety/safetyContract.ts`. |

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
| IMP-003 | Pre-open Card domain module | SPEC v0.1.0 sections 4, 7 | `src/domain/preopen/`, `src/domain/balancing/preOpenCardValues.ts` | Domain Implemented | Adds 4 Pre-open Card values, one-card-per-Day selection before Morning News reveal, `뉴스 배정` positive/negative directions, no-effect `관망`, and Opening Approval guard. |
| IMP-004 | Intraday state and price tick domain module | SPEC v0.1.0 sections 5, 6 | `src/domain/intraday/`, `src/domain/balancing/priceTickValues.ts`, `src/types/stock-market-gen.d.ts` | Domain Implemented | Adds intraday state creation, timer pause/resume, bounded stat clamping, news pressure, component-based player price tick, and a replaceable fake OHLCV simulator adapter. |
| IMP-005 | Manual Action domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/manualActions.ts`, `src/domain/balancing/manualActionValues.ts` | Domain Implemented | Adds 4 Manual Action values, modal availability checks, budget/cooldown checks, gradual state effects, cooldown entry, and lightweight held-unit / average-entry accounting. |
| IMP-006 | Auto Card domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/autoCards.ts`, `src/domain/balancing/autoCardValues.ts` | Domain Implemented | Adds 8 Auto Card values, reward choice generation, new-card/level-up handling, Lv.3 cap, and simple periodic state effects. |
| IMP-007 | Document Event domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/documentEvents.ts`, `src/domain/balancing/documentEventValues.ts` | Domain Implemented | Adds 8 Document Event values, trigger priority, event cap/gap rules, modal pause, 3-choice state, choice effects, and event history. |
| IMP-008 | Retail Swarm domain module | SPEC v0.1.0 sections 7, 8 | `src/domain/intraday/retailSwarm.ts`, `src/domain/balancing/retailSwarmValues.ts` | Domain Implemented | Adds participation-synced swarm state, abstract token display model, warning/panic flags, and risk effects for overheat/panic. |
| IMP-009 | Market Board domain module | SPEC v0.1.0 sections 6, 7 | `src/domain/market/marketBoard.ts` | Domain Implemented | Adds selected asset detail entry, same-sector peers, seven other-sector average rows, news badges, fictional quote fields, and simplified non-player movement summaries. |
| IMP-010 | Settlement domain module | SPEC v0.1.0 sections 8, 9 | `src/domain/settlement/settlement.ts`, `src/domain/balancing/settlementValues.ts` | Domain Implemented | Adds surveillance grades, profit bands, Day result matrix, holding bands, social cost deltas, Final grade baselines, downgrade rules, and forced failure handling. |
| IMP-011 | Day carryover domain module | SPEC v0.1.0 sections 8, 9 | `src/domain/settlement/carryover.ts` | Domain Implemented | Adds Day-to-Day Run state carryover, partial surveillance/participation carryover, liquidity/volatility reset baselines, weak aftereffects, and Pre-open Card non-carryover. |
| IMP-012 | Local persistence domain module | SPEC v0.1.0 sections 9, 10 | `src/domain/persistence/localPersistence.ts` | Domain Implemented | Adds versioned save envelopes, current Run save/load, recent Final save, best record comparison, forbidden key list, and incompatible save discard behavior. |
| IMP-013 | Safety contract domain module | SPEC v0.1.0 section 2 | `src/domain/safety/safetyContract.ts` | Domain Implemented | Adds player-facing content collection, approved safe terms, forbidden procedure/entity terms, and fictional calculation validation. |
| IMP-014 | Run/Day scene session wiring | SPEC v0.1.0 sections 4, 5, 6 | `src/game/GameSession.ts`, `src/game/scenes/RunSetupScene.ts`, `src/game/scenes/MorningBriefingScene.ts`, `src/game/scenes/PreOpenCardScene.ts`, `src/game/scenes/IntradayScene.ts` | Scene Wiring Partial | Adds shared scene session state, sector/asset selection, Day setup display, Pre-open card selection/approval, and initial Intraday state/Market Board display. |
| IMP-015 | Intraday tick/action scene wiring | SPEC v0.1.0 sections 6, 7 | `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts` | Scene Wiring Partial | Adds one-second Intraday ticking, displayed price/timer updates, manual action buttons, locked gradual action execution, action feedback, and cooldown display. |
| IMP-016 | Day Settlement scene wiring | SPEC v0.1.0 sections 4, 8, 9 | `src/game/GameSession.ts`, `src/game/scenes/DaySettlementScene.ts` | Scene Wiring Partial | Adds Day Settlement result display, surveillance grade, holding band, social cost, risk metrics, learning hint, and next-Day/Final routing. |
| IMP-017 | Final Settlement scene wiring | SPEC v0.1.0 sections 4, 9, 10 | `src/game/GameSession.ts`, `src/game/scenes/FinalSettlementScene.ts` | Scene Wiring Partial | Adds Day 5 carryover into cumulative Run state, Final grade calculation, summary display, forced-failure note support, and same-seed/new-Run restart choices. |
| IMP-018 | Auto Card scene wiring | SPEC v0.1.0 sections 7, 8 | `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts`, `src/domain/balancing/autoCardValues.ts` | Scene Wiring Partial | Adds 45/90/135-second reward timing, paused card choice state, reward application, periodic card effects, owned card display, recent effect display, and choice buttons. |
| IMP-019 | Document Event scene wiring | SPEC v0.1.0 sections 7, 8 | `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts` | Scene Wiring Partial | Adds condition-based document event opening, Day 1 fallback event, modal pause display, 3-choice buttons, choice application, and resume behavior. |
| IMP-020 | Retail Swarm scene wiring | SPEC v0.1.0 sections 7, 8 | `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts` | Scene Wiring Partial | Adds abstract token swarm rendering, participation-synced density/speed, overheated/panic warning visuals, and one-shot transition risk application. |
| IMP-021 | Local persistence browser wiring | SPEC v0.1.0 sections 9, 10 | `src/game/browserStorage.ts`, `src/game/GameSession.ts`, `src/game/scenes/MainMenuScene.ts`, `src/game/scenes/FinalSettlementScene.ts` | Scene Wiring Partial | Adds browser localStorage adapter, current Run save/load, Main Menu continue option, recent Final save, best-record update flag, and current Run cleanup after Final Settlement. |
| IMP-022 | Market Board live scene wiring | SPEC v0.1.0 sections 6, 7 | `src/domain/assets/assetMarketProfiles.ts`, `src/domain/market/marketBoard.ts`, `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts`, `src/game/dom/intradayOverlays.ts` | Scene Wiring Partial | Adds simplified competitor/sector-average advancement, live player price display, and terminal-style Market Board refresh with 24 individual fictional asset value ranking. The dashboard now uses retained DOM rows, fixed baseline trade value, and EMA-smoothed live trade value instead of per-tick Phaser row recreation and raw instant ranking. |
| IMP-023 | Immediate failure scene routing | SPEC v0.1.0 sections 5, 9 | `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts` | Scene Wiring Partial | Adds budget/surveillance/collapse failure checks, Run failed state updates, Final Settlement record save, and Intraday-to-Final routing. |
| IMP-024 | Intraday candle, volume, and money flow | SPEC v0.1.0 sections 4, 14 | `src/game/GameSession.ts`, `src/game/scenes/IntradayScene.ts`, `src/game/dom/intradayOverlays.ts` | Scene Wiring Partial | Adds Day-local fictional price/volume history, 6-second candle aggregation, target band, crash line, current price marker, volume bars, fake OHLCV volume impulse, manual-action-specific candle patterns, and a quote/position/money-flow readout with current price, average entry, held units, spent/recovered budget, and unrealized P/L. Candle and volume rendering now uses a `lightweight-charts` DOM overlay. |
| IMP-025 | Intraday desk reposition | SPEC v0.1.0 sections 6, 7 | `src/game/GameSession.ts`, `src/game/scenes/IntradayRepositionScene.ts` | Scene Wiring Partial | Adds a fictional desk-reposition flow after holding ratio reaches 0 and no manual action is still executing; Run/Day risk state is preserved. |

---

## Step Definition Traceability

| Step Group | Gherkin Source | Step Source | Status | Notes |
| --- | --- | --- | --- | --- |
| Run lifecycle and Day 1 onboarding | `feature/run/` | `feature/steps/run.steps.ts` | Step Definitions Drafted | Covers Run start, phase progression, failure routing, same-condition restart, and Day 1 onboarding checks. |
| Asset selection and Market Board | `feature/market/` | `feature/steps/market.steps.ts` | Step Definitions Drafted | Covers fictional catalog visibility, hidden profile constraints, entry recommendations, asset market roles, Market Board context rows, and 24-asset value ranking scope. |
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
| TC-NEWS-001 | Morning News | 3 fictional news items per Day from 5 templates and fictional targets. | TC Planned |
| TC-BRIEF-001 | Market Briefing | News effect, target band, and risk summary are shown. | TC Planned |
| TC-PREOPEN-001 | Pre-open card | One card or watch choice applies correct Day-only effect. | TC Planned |
| TC-OPEN-001 | Opening approval | Intraday cannot start before approval. | TC Planned |
| TC-INTRA-001 | Intraday timer | 180-second timer runs and pauses correctly. | TC Planned |
| TC-STATE-001 | Core stats | 0~100 stats clamp and update correctly. | TC Planned |
| TC-PRICE-001 | Price tick | Price formula reacts to pressure, volatility, news, fake OHLCV impulse, and seed. | TC Planned |
| TC-ACTION-001 | Manual actions | Costs, cooldowns, disabled state, and effects work. | TC Planned |
| TC-AUTO-001 | Auto cards | Periodic effects, reward timing, and Lv.1~Lv.3 work. | TC Planned |
| TC-DOC-001 | Document events | Trigger limits, pause behavior, and 3-choice effects work. | TC Planned |
| TC-SWARM-001 | Retail Swarm | State reflects participation and panic/overheat conditions. | TC Planned |
| TC-MARKET-001 | Market Board | Player, peers, sector averages, and 24-asset value ranking display and update. | TC Planned |
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

