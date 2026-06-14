# ADR-0031 — Contract Objective Model

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.0, ADR-0030 |

## Context

의뢰모드 is not a single intraday mission. A sponsor can ask the player to touch a price band, maintain a band, defend a threshold, hit a close condition, or reach market dashboard conditions over a fixed period.

The implementation needs a stable objective model before UI and scoring are built.

## Decision

Contract objectives are period-based and evaluated from a recorded contract observation stream.

The first supported objective types are:

1. `touch`
2. `maintain`
3. `close_above`
4. `close_below`
5. `close_inside_band`
6. `never_break`
7. `rank`
8. `value`
9. `touch_then_maintain`

Each contract has one or more required objectives. In the first implementation, all required objectives must pass for the contract to succeed. Partial completion may be shown in settlement, but it does not pay the fixed reward by default.

## Evaluation Rules

### Price Touch

`touch` succeeds when the tracked player asset reaches the target price or enters the target band at any point before the objective deadline.

The evaluator may use intraday price history, Day high/low, or a normalized observation event. It must not require the player to finish the Day at the target.

### Maintain

`maintain` succeeds when the asset satisfies the requested band for the required number of Days or contract intervals.

The first implementation should count a Day as maintained when:

1. the Day close is inside the target band, and
2. no strict break condition attached to that objective was violated.

If the design later needs second-by-second band occupancy, that should be added as a separate objective option rather than silently changing `maintain`.

### Close Conditions

`close_above`, `close_below`, and `close_inside_band` are evaluated at the target Day settlement price.

### Never Break

`never_break` fails immediately when the tracked price crosses the prohibited lower or upper threshold during the contract period.

### Rank and VALUE

`rank` and `value` are evaluated using Market Dashboard observations. The first implementation should evaluate them at deadline or Day close unless the objective explicitly says "during period".

### Touch Then Maintain

`touch_then_maintain` is a compound objective:

1. target touch must occur by `touchDeadlineDay`;
2. after the touch, the asset must remain within the requested maintenance band for the required period.

## Consequences

1. The objective evaluator can be implemented independently from UI.
2. Contract progress can be displayed as objective cards with pass/fail/progress states.
3. Price, close, VALUE, and rank objectives can share one observation log.
4. The first implementation avoids ambiguous partial-payout behavior.

## Rejected Alternatives

### Make every objective intraday-only

Rejected. The intended contract design is period-based and can span multiple Days.

### Allow every objective to pay partial reward

Rejected for first implementation. Partial rewards make balancing and player messaging harder. They may be added later as optional bonus terms.

## Follow-up

SRS should define the concrete observation events and the exact Day-close source for contract evaluation.
