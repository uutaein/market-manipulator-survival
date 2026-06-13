# Domain Modules

This directory contains gameplay-domain code that is independent from Phaser scenes.

Current implemented scope:

| Module | Purpose |
| --- | --- |
| `assets/assetCatalog.ts` | Fictional 8-sector / 24-asset catalog from SRS v0.1.6 |
| `balancing/runDefaults.ts` | First-playable Run defaults and MVP auto card IDs |
| `balancing/preOpenCardValues.ts` | First-playable Pre-open Card values from SRS v0.1.6 |
| `balancing/priceTickValues.ts` | First-playable price tick coefficients and news pressure values |
| `day/` | Day start state, Morning News generation, Today Condition, Market Briefing summary |
| `intraday/` | Intraday state, timer pause/resume, bounded stats, and player asset price tick |
| `preopen/` | Pre-open Card selection and Opening Approval rules |
| `random/SeededRandom.ts` | Deterministic seeded random source for reproducible Run setup |
| `run/runState.ts` | Core Run State creation, same-seed restart, hidden asset tendency assignment |

The current domain layer supports early Run, Day setup, Pre-open Card selection, and the player asset intraday tick skeleton. It does not yet include manual actions, auto card effects, document event effects, settlement, carryover, or persistence modules.

BDD steps currently exercise this domain layer for Run start, same-seed restart, asset catalog completeness, hidden profile assignment, Morning News generation, Market Briefing data, Pre-open Card selection, Opening Approval, intraday timer behavior, pause/resume behavior, bounded stat clamping, and player price tick components.
