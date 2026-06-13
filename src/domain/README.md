# Domain Modules

This directory contains gameplay-domain code that is independent from Phaser scenes.

Current implemented scope:

| Module | Purpose |
| --- | --- |
| `assets/assetCatalog.ts` | Fictional 8-sector / 24-asset catalog from SRS v0.1.6 |
| `balancing/autoCardValues.ts` | First-playable Auto Card values from SRS v0.1.6 |
| `balancing/documentEventValues.ts` | First-playable Document Event values and global rules from SRS v0.1.6 |
| `balancing/manualActionValues.ts` | First-playable Manual Action values from SRS v0.1.6 |
| `balancing/runDefaults.ts` | First-playable Run defaults and MVP auto card IDs |
| `balancing/preOpenCardValues.ts` | First-playable Pre-open Card values from SRS v0.1.6 |
| `balancing/priceTickValues.ts` | First-playable price tick coefficients and news pressure values |
| `balancing/retailSwarmValues.ts` | First-playable Retail Swarm thresholds, token scaling, and risk effects |
| `day/` | Day start state, Morning News generation, Today Condition, Market Briefing summary |
| `intraday/` | Intraday state, timer pause/resume, bounded stats, and player asset price tick |
| `market/marketBoard.ts` | MVP 8-slot Market Board selection and simplified non-player summaries |
| `preopen/` | Pre-open Card selection and Opening Approval rules |
| `random/SeededRandom.ts` | Deterministic seeded random source for reproducible Run setup |
| `run/runState.ts` | Core Run State creation, same-seed restart, hidden asset tendency assignment |

The current domain layer supports early Run, Day setup, Pre-open Card selection, the player asset intraday tick skeleton, Market Board selection, Manual Action state effects, Auto Card rewards/effects, Document Event decisions, and Retail Swarm state modeling. It does not yet include settlement, carryover, or persistence modules.

BDD steps currently exercise this domain layer for Run start, same-seed restart, asset catalog completeness, hidden profile assignment, Morning News generation, Market Briefing data, Pre-open Card selection, Opening Approval, Market Board selection/simplified summaries, intraday timer behavior, pause/resume behavior, bounded stat clamping, player price tick components, Manual Action state effects, Auto Card rewards/effects, Document Event trigger/choice behavior, and Retail Swarm participation/overheat/panic behavior.
