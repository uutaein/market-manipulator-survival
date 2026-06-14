# ADR-0038 — Order Book Wall Decay

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.3, SRS v0.2.3, ADR-0036, ADR-0037 |

## Context

Order-book walls now attach to a clicked fictional price level and are represented as local synthetic liquidity. The remaining gap is that a wall is still all-or-nothing: the visible depth does not erode under opposing pressure, and removal or expiry refunds the full original reserve.

The desired player experience is that a wall looks large immediately, blocks price crossing while it has remaining depth, visibly melts when pressure reaches it, and only refunds the unconsumed reserve when removed or expired.

## Decision

Add stateful wall decay in the Intraday game adapter around the existing local synthetic execution layer.

1. Each active wall stores both original values and mutable remaining values: `depthBoost`, `reservedBudget`, `remainingDepthBoost`, and `remainingReservedBudget`.
2. Opposing fictional pressure and price contact with the wall reduce `remainingDepthBoost` over Intraday ticks.
3. Reserved budget is consumed in proportion to the depth that melted.
4. Removing a wall or letting it expire refunds only `remainingReservedBudget`.
5. A wall's price barrier remains active only while `remainingDepthBoost > 0` and `remainingSec > 0`.
6. Synthetic order-book seeding uses `remainingDepthBoost`, not the original depth.
7. The UI removal label shows the current refundable reserve.
8. The matching engine gateway remains local-only and exchange-free; decay is a game-domain adapter behavior, not a real venue connection.

## Rationale

This keeps the visible behavior consistent with the player's expectation: a large wall can absorb pressure, but once it has melted it can no longer hold the line. Keeping decay outside the core matching engine preserves the replaceable `ExecutionGateway` from ADR-0037 while still making wall state feel persistent and reactive.

Budget consumption tied to remaining depth also makes the feature easier to reason about. The player pays only for the wall volume that was actually consumed by the simulation; any remaining fictional reserve comes back when the wall is pulled or times out.

## Alternatives Considered

### Full engine-driven order consumption

Deferred. The local reference engine can already model resting liquidity, but full event replay into wall state would require a larger chart/volume adapter. The current slice uses deterministic game pressure as the decay input and leaves execution-report-driven consumption as a later refinement.

### Time-only decay

Rejected. A wall that melts at the same speed while untouched would make barriers feel arbitrary. Opposing pressure and contact should be the primary reasons a wall loses depth.

### Keep full refund behavior

Rejected. Full refunds after visible wall erosion would disconnect budget from the displayed volume loss and make the tactic too forgiving.

## Consequences

1. Active wall effects need backward-compatible remaining fields.
2. Regression tests must cover partial decay, partial refund, full melt, barrier removal after melt, and synthetic depth using remaining quantity.
3. Existing exact-refund requirements are superseded by remaining-reserve refund semantics.
4. Balancing values need explicit decay constants so wall erosion can be tuned without changing price formulas.
5. Safety language remains unchanged: all depth, pressure, and wall decay are fictional game-state abstractions.

## Open Questions

1. Whether later execution reports should replace pressure-based decay as the source of wall consumption.
2. Whether different fictional asset profiles should scale wall decay resistance.
3. Whether the UI should add a remaining-depth meter beyond the current row SIZE and refund label.
