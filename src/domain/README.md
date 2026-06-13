# Domain Modules

This directory contains gameplay-domain code that is independent from Phaser scenes.

Current implemented scope:

| Module | Purpose |
| --- | --- |
| `assets/assetCatalog.ts` | Fictional 8-sector / 24-asset catalog from SRS v0.1.6 |
| `balancing/runDefaults.ts` | First-playable Run defaults and MVP auto card IDs |
| `random/SeededRandom.ts` | Deterministic seeded random source for reproducible Run setup |
| `run/runState.ts` | Core Run State creation, same-seed restart, hidden asset tendency assignment |

The current domain layer supports the first implementation unit only. It does not yet include Day setup, Morning News, price ticks, actions, settlement, carryover, or persistence modules.

BDD steps currently exercise this domain layer for Run start, same-seed restart, asset catalog completeness, and hidden profile assignment.
