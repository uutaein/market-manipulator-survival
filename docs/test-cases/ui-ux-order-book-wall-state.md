# UI/UX Test Cases - Order-book Wall State

| Item | Value |
| --- | --- |
| Feature | `feature/ui/order_book_wall_state_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-WALL-STATE-001 - Active Wall Shows Row State and Feedback

References:
- `SRS-WALL-UI-001`: Intraday must not add separate permanent wall buttons.
- `SRS-WALL-UI-005`: Active or cooldown rows show concise status text.
- `SRS-WALL-DECAY-UI-001`: Active wall removal labels show current refundable reserve.
- `SRS-WALL-FEED-UI-001`: Intraday displays latest wall feedback near the action/status area.
- `SRS-WALL-FEED-UI-003`: Event text uses game abstraction terms such as depth, reserve, refund, and barrier.
- `SRS-WALL-STATE-UI-001`: Active wall rows show a compact remaining-depth indicator.

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A buy wall is active with partial remaining depth and refundable reserve.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with a partially melted buy wall.
4. Wait until the order-book overlay and wall feedback are visible.
5. Compare the page against the `order-book-wall-state.png` visual baseline.

Expected Result:
- The active row is visually distinct and shows its remaining-depth indicator.
- The active row displays remove/refund state without hover.
- Recent wall feedback is visible in the Intraday action/status area.
- Feedback uses abstract `depth`, `예약`, `환급`, and `방어선` terminology.
- No separate permanent wall buttons are added outside the order-book rows.

Automation:
- `npm run test:visual`
- `tests/visual/order-book-wall-state.spec.ts`
