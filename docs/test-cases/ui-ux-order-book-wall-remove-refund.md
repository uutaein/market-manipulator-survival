# UI/UX Test Cases - Order-book Wall Remove Refund

| Item         | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Feature      | `feature/ui/order_book_wall_remove_refund_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                          |
| Status       | Implemented                                                   |
| Last Updated | 2026-06-16                                                    |

## TC-UX-WALL-REMOVE-REFUND-001 - Removed Wall Shows Refund Feedback

References:

- `SRS-WALL-BASE-005`: Removing a wall refunds the remaining reserved budget after decay.
- `SRS-WALL-AVAIL-007`: Active levels remain clickable as wall-removal controls.
- `SRS-WALL-AC-007`: Clicking an active wall removes it and refunds remaining reserved budget.
- `SRS-WALL-FEED-EVT-002`: Removing a wall appends a `removed` event with the refunded remaining reserve.
- `SRS-WALL-FEED-UI-003`: Row-level feedback text uses game abstraction terms such as depth, reserve, refund, and barrier when text is needed.
- `SRS-WALL-STATE-UI-004`: The active indicator disappears when the wall is inactive, removed, expired, or collapsed.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A buy wall formed, partially melted, and was removed with refundable reserve remaining.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with a removed buy wall event log.
4. Wait until the order-book overlay and row-level wall feedback are visible.
5. Compare the page against the `order-book-wall-remove-refund.png` visual baseline.

Expected Result:

- No order-book row shows the active wall indicator.
- No separate wall feedback area is shown.
- Row-level feedback keeps the removed level on cooldown and exposes refund state through row status/title.
- The removed level remains on cooldown, while other row actions stay embedded in the order-book rows.

Automation:

- `npm run test:visual`
- `tests/visual/order-book-wall-remove-refund.spec.ts`
