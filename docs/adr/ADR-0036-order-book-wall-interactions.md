# ADR-0036 — Order Book Wall Interactions

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.1, SRS v0.2.1, PRD v0.2.0, SRS v0.1.6, ADR-0011, ADR-0035 |

## Context

The Intraday screen already displays a fictional order-book/depth panel. The panel is useful for reading sell-side and buy-side depth, and the price formula already uses that depth through `orderBookMultiplier`.

The user wants explicit `매수벽 세우기` and `매도벽 세우기` interactions, but adding two more permanent buttons would crowd the Intraday command row and weaken ADR-0011's four-main-manual-action baseline.

This feature also has a safety boundary: it must remain a fictional game abstraction and must not become a real order-entry or real-world manipulation procedure.

## Decision

Add order-book wall interactions as contextual actions inside the existing order-book rows.

1. Hovering ASK rows exposes `매도벽 세우기`.
2. Hovering BID rows exposes `매수벽 세우기`.
3. Clicking the hovered row starts a short-lived fictional wall effect for that side.
4. These wall actions are not counted as MVP manual action buttons.
5. The actions reserve budget in proportion to the wall volume, enter price-level-specific cooldown, modify fictional order-book depth and price responsiveness, and create a temporary price barrier at the clicked price level.
6. Each visible ASK/BID row can have its own active wall and cooldown, keyed by the clicked fictional quote level rather than the row's moving offset from the current price.
7. Clicking an active wall removes that wall and refunds its reserved budget.
8. The actions are unavailable while intraday is paused, while the player has no position, while reserve budget is insufficient, or while the same inactive price level is on cooldown.
9. The UI must show the action affordance in the order-book row itself, not as separate side buttons.

## Rationale

The order-book panel is where the player is already reading buy-side and sell-side pressure. Putting the action on the row keeps the control local to the information it changes.

This also preserves the four large manual action buttons as the main real-time command layer. `매수벽 세우기` and `매도벽 세우기` become small tactical nudges rather than new primary actions.

## Alternatives Considered

### Add two new Intraday buttons

Rejected. It increases command-row density and makes the feature feel equal to the four core manual actions.

### Model precise per-price order placement

Rejected. It would add unnecessary complexity and risks implying real-world order tactics. The game only needs an abstract depth signal.

### Keep the order book display-only

Rejected. The existing order-book depth already affects the price formula, so making it lightly interactive creates a readable and useful decision without a large new system.

## Consequences

1. The order-book DOM overlay must accept pointer events on rows.
2. Intraday state needs level-specific active wall effects, reserved budget, and cooldowns.
3. The order-book profile must include active wall boosts when calculating visible depth and responsiveness, and the clicked price level's displayed volume must increase immediately while it remains in visible depth.
4. The price tick must respect active wall barriers: buy walls block downside crossing and sell walls block upside crossing until the wall is removed or expires.
4. Tests must cover activation, cooldown, no-position blocking, and depth/responsiveness impact.
5. Copy must avoid real-world procedural language and remain a fictional game interaction.

## PRD Impact

PRD v0.2.1 records this as a shared free/contract-mode tactical interaction on the existing order-book panel.

## SRS Notes

SRS v0.2.1 defines the exact availability rules, baseline values, depth effects, cooldown behavior, and acceptance criteria.

## Open Questions

1. Whether later playtests should tune wall values separately by asset influence resistance.
2. Whether Contract Mode objectives should score excessive wall usage as an efficiency penalty beyond normal budget and surveillance cost.
3. Whether later versions should allow stacking multiple walls on the same level instead of one active wall per level.
