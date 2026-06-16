# UI/UX Test Cases - Order-book Wall Expiring

| Item         | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Feature      | `feature/ui/order_book_wall_expiring_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                     |
| Status       | Implemented                                              |
| Last Updated | 2026-06-16                                               |

## TC-UX-WALL-EXPIRING-001 - Expiring Wall Warns Before Timeout

References:

- `SRS-WALL-AC-009`: Wall effects expire after their duration and refund remaining reserve on expiry.
- `SRS-WALL-STATE-UI-001`: Active wall rows show a compact remaining-depth indicator.
- `SRS-WALL-STATE-UI-005`: Active row title text includes remaining depth and remaining refundable reserve.
- `SRS-WALL-FEED-UI-003`: Event text uses game abstraction terms such as depth, reserve, refund, and barrier.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A buy wall is active with only a few seconds remaining before timeout.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with a nearly expired buy wall.
4. Wait until the order-book overlay and wall feedback are visible.
5. Compare the page against the `order-book-wall-expiring.png` visual baseline.

Expected Result:

- The active row uses an expiring visual tone without changing row height.
- The active row label shows remaining seconds and refundable reserve.
- The row title includes expiring state, remaining time, remaining depth, original depth, refundable reserve, and original reserve details.
- Recent wall feedback remains visible and uses abstract `depth`, `예약`, `환급`, and `방어선` terminology.
- No separate permanent wall buttons are added outside the order-book rows.

Automation:

- `npm run test:visual`
- `tests/visual/order-book-wall-expiring.spec.ts`
