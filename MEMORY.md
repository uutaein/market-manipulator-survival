# MEMORY

Project progress memory for `Market Manipulator Survival`.

This file is a compact working log. It is not a PRD, SRS, ADR, or implementation plan.

---

## Current Mode

The project is still documentation-first.

Current baseline:

1. PRD is at MVP freeze-candidate level.
2. SRS exists as draft requirements and baseline tuning documents.
3. SDD exists only for lightweight simulation modularity.
4. TypeScript + Phaser 3 + Vite project scaffold has been created.
5. Cucumber step definitions exist for accepted MVP Gherkin coverage.
6. Core Run State domain module exists for seed, asset catalog, hidden profile assignment, and same-seed restart.
7. Day Setup / Morning News domain module exists for Day state, sector-default news, Today Condition, and Market Briefing data.
8. Pre-open Card domain module exists for 4 card values, one-card-per-Day selection, no-effect `관망`, and Opening Approval guard.
9. Intraday State / Price Tick domain module exists for 360-second timer, pause/resume, bounded stat clamping, news pressure, and component price tick.
10. Manual Action domain module exists for 4 action values, modal availability, budget/cooldown checks, state effects, and cooldown entry.
11. Auto Card domain module exists for 8 card values, reward choices, Lv.1~Lv.3 handling, and simple periodic state effects.
12. Document event effects, settlement, carryover, persistence, and Phaser gameplay wiring are not implemented yet.

---

## Current Repository Structure

| Path | Purpose |
| --- | --- |
| `docs/prd/` | PRD versions and MVP freeze candidate |
| `docs/adr/` | Product and architecture decision records |
| `docs/srs/` | Software requirement documents |
| `docs/sdd/` | Software design documents |
| `docs/spec/` | Implementation-facing specifications |
| `docs/traceability.md` | PRD/ADR/SRS/TC traceability matrix |
| `feature/` | Gherkin feature files grouped by domain and function |
| `feature/steps/` | TypeScript Cucumber step definitions grouped by domain |
| `feature/support/` | Shared Cucumber world and accepted MVP constants |
| `src/` | TypeScript + Phaser 3 source scaffold |
| `src/domain/` | Phaser-independent gameplay domain modules |
| `MEMORY.md` | Current progress memory |
| `SKILLS.md` | Project-specific rules and reusable design knowledge |

---

## Latest Product Baseline

Product name:

```text
Market Manipulator Survival
```

MVP shape:

1. Fictional satirical browser game.
2. 5-Day Run.
3. 6-minute intraday session per Day.
4. Papers, Please-style documents, warnings, stamps, and briefings.
5. Vampire Survivors-style pressure, auto cards, limited manual actions, and visual swarm pressure.
6. No real company names, real stock names, real exchanges, real market data, or real financial-crime procedures.

---

## Major MVP Decisions

| Area | Decision |
| --- | --- |
| Run length | 5 Days |
| Intraday duration | 360 seconds per Day |
| Sectors | 8 fictional sectors |
| Assets | 24 fictional assets |
| Morning News | 5 templates, 1 per Day |
| Pre-open Cards | 4 cards |
| Manual Actions | 4 actions |
| Auto Cards | 8 cards, Lv.1~Lv.3 |
| Document Events | 8 events |
| Market Board | 8 displayed assets total |
| Player asset | detailed simulation |
| Non-player assets | 7 simplified simulations |
| Settlement | actual profit + surveillance rating |
| Final grades | S/A/B/C/D/F |
| Storage | localStorage only |
| Tutorial | no separate tutorial mode; Day 1 integrated onboarding |
| Restart | same-condition restart via internal Run Seed |

---

## Current Key Documents

| Type | Current Document |
| --- | --- |
| PRD | `docs/prd/market-manipulator-survival-prd-v0.1.5.md` |
| Freeze | `docs/prd/market-manipulator-survival-mvp-freeze-candidate.md` |
| SRS Core State | `docs/srs/market-manipulator-survival-srs-v0.1.0-core-game-state.md` |
| SRS Tick Formula | `docs/srs/market-manipulator-survival-srs-v0.1.1-tick-price-formula.md` |
| SRS Flow | `docs/srs/market-manipulator-survival-srs-v0.1.2-run-flow-and-screens.md` |
| SRS Content | `docs/srs/market-manipulator-survival-srs-v0.1.3-content-and-interactions.md` |
| SRS Settlement | `docs/srs/market-manipulator-survival-srs-v0.1.4-settlement-carryover-persistence.md` |
| SRS Review | `docs/srs/market-manipulator-survival-srs-v0.1.5-freeze-readiness-review.md` |
| SRS Baselines | `docs/srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md` |
| SDD Modularity | `docs/sdd/market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md` |
| MVP SPEC | `docs/spec/market-manipulator-survival-mvp-spec-v0.1.0.md` |
| Traceability | `docs/traceability.md` |
| Gherkin Features | `feature/README.md` |
| Cucumber Config | `cucumber.mjs` |
| Domain Modules | `src/domain/README.md` |
| Source Scaffold | `src/README.md` |

---

## Recent Work Completed

1. Organized PRD, ADR, SRS, and SDD under `docs/`.
2. Added SRS documents for core state, price formula, flow, content, settlement, carryover, and persistence.
3. Added lightweight SDD for simulation modularity.
4. Added SRS freeze readiness review.
5. Added baseline values and triggers for implementation discussion.
6. Added traceability matrix linking PRD/ADR decisions to SRS, Gherkin files, and planned TC IDs.
7. Added MVP SPEC v0.1.0 for first playable scope.
8. Accepted MVP SPEC v0.1.0 through ADR-0028.
9. Added root `feature/` Gherkin files grouped by domain and function.
10. Added this memory file and `SKILLS.md`.
11. Added TypeScript + Phaser 3 + Vite project scaffold.
12. Added Cucumber configuration, shared in-memory world, and domain step definitions.
13. Added Core Run State domain module for seeded Run creation, fictional asset catalog, hidden asset tendency assignment, and same-seed restart.
14. Added Day Setup / Morning News domain module for seeded Morning News, Today Condition, Day State, and Market Briefing data.
15. Added Pre-open Card domain module for MVP card values, selection rules, and Opening Approval.
16. Added Intraday State / Price Tick domain module for timer, pause/resume, bounded stats, news pressure, and fictional component-based player price ticks.
17. Added Manual Action domain module for four MVP manual actions, state effects, and cooldown entry.
18. Added Auto Card domain module for eight MVP auto cards, reward choices, level caps, and simple periodic state effects.

---

## Known Remaining Work Before Gameplay Implementation

The SRS is close to implementation-planning ready, but implementation still needs to connect gameplay modules to the accepted behavior.

Remaining non-code work:

1. Review root `feature/` Gherkin files for scenario coverage after the first implementation pass.
2. Review fictional asset names for tone.
3. Keep SRS v0.1.6 values as first-playable defaults until real playtesting.
4. Convert planned TC IDs in `docs/traceability.md` into actual manual or automated test cases after Gherkin review.
5. Keep new ideas in P1/P2 unless they are essential to the MVP loop.
6. Continue replacing in-memory BDD assumptions with module-backed checks as gameplay modules are implemented.

---

## Safety Memory

Always preserve the safety abstraction layer.

Do not add:

1. real stock names,
2. real company names,
3. real exchange names,
4. real market data,
5. real news,
6. real-world manipulation procedures,
7. financial-domain validation scope.

The game is a fictional resource-management and pressure-management game.

---

## Recent Commit Memory

Latest committed baseline before Core Run State branch:

```text
f7c4b8a test(bdd): add Cucumber step definitions
```

Current branch baseline includes:

1. TypeScript + Phaser 3 + Vite scaffold,
2. MVP Phaser scene shell,
3. traceability implementation scaffold section,
4. Cucumber step definitions for accepted MVP Gherkin scenarios,
5. Core Run State domain module,
6. Day Setup / Morning News domain module,
7. Pre-open Card domain module,
8. Intraday State / Price Tick domain module,
9. Manual Action domain module,
10. Auto Card domain module,
11. README, docs index, feature index, traceability, and MEMORY updates.
