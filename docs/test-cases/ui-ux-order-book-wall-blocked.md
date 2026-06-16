# UI/UX Test Cases - Order-book Wall Blocked State

| Item | Value |
| --- | --- |
| Feature | `feature/ui/order_book_wall_blocked_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-WALL-BLOCKED-001 - Blocked and Cooldown State Explains Availability

References:
- `SRS-WALL-AVAIL-003`: A wall action is unavailable if the player cannot reserve the minimum wall budget.
- `SRS-WALL-AVAIL-004`: An inactive level is unavailable while the same level is on cooldown.
- `SRS-WALL-AVAIL-006`: The UI shows disabled or blocked feedback without starting an effect.
- `SRS-WALL-UI-001`: The Intraday screen does not add separate permanent wall buttons.
- `SRS-WALL-STATE-UI-004`: Inactive rows do not show active indicators.

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- One buy-wall level is on cooldown.
- Current budget is below the minimum wall reserve.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with wall cooldown and insufficient budget.
4. Wait until the order-book overlay and row-level wall feedback are visible.
5. Compare the page against the `order-book-wall-blocked.png` visual baseline.

Expected Result:
- The cooldown row shows a visible waiting state such as `대기 Ns`.
- Row-level feedback explains cooldown and insufficient-budget availability.
- No active wall indicator is shown because no wall is active.
- Wall affordances remain embedded in the order-book rows.

Automation:
- `npm run test:visual`
- `tests/visual/order-book-wall-blocked.spec.ts`
