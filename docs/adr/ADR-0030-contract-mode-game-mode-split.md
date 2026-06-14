# ADR-0030 — Contract Mode Game Mode Split

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.0, PRD v0.1.5, MVP tag `v0.1.0-mvp`, ADR-0029 |

## Context

The first playable MVP has been fixed as `v0.1.0-mvp`. That build already supports the core 5-Day Run loop, fictional market dashboard, manual actions, MADNESS, Retail Swarm, and settlement.

Post-MVP design needs a second play style without destabilizing the MVP baseline. The player wants to name the current MVP loop as **자유모드** and add **의뢰모드**, where a sponsor requests a price condition over a fixed period.

## Decision

The product will support two top-level game modes:

1. `free`: 자유모드
2. `contract`: 의뢰모드

자유모드 is the current MVP loop. It remains a 5-Day Run where the player chooses a sector and asset, builds their own position, and optimizes survival, profit, budget preservation, and surveillance risk.

의뢰모드 is a contract-driven mode. The player accepts a mandate with a target asset, period, objectives, fixed reward, and risk profile. The goal is not maximum self-directed profit, but satisfying the mandate with the least cost and lowest risk.

Both modes share the same fictional market engine, intraday tick model, manual actions, Market Dashboard, VALUE, MADNESS, Retail Swarm, and settlement primitives. They differ in setup, objective tracking, and final scoring.

## Consequences

1. MVP baseline behavior is not redefined by contract mode.
2. New contract features should not be added to 자유모드 unless they also improve the shared engine.
3. `GameMode` becomes a first-class state field in future implementation.
4. Main Menu must eventually expose mode selection.
5. Save data must eventually include the selected mode and mode-specific payload.

## Rejected Alternatives

### Replace the MVP loop with contract mode

Rejected. The MVP has already been fixed as a playable baseline. Replacing it would make future regressions hard to isolate.

### Implement contract mode as a one-off intraday event

Rejected. The intended design is period-based: touch, maintain, close, rank, and VALUE conditions can span multiple Days.

## Safety

Both modes remain fictional and satirical. They must not use real companies, real tickers, real exchanges, real market data, real news, or actionable real-world financial-crime procedures.

## Follow-up

Define the contract objective model, reward model, sponsor types, expert report behavior, and first implementation scope in separate ADRs.
