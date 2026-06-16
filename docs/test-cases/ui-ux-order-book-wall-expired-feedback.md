# UI/UX Test Cases - Order-book Wall Expired Feedback

| Item         | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| Feature      | `feature/ui/order_book_wall_expired_feedback_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                             |
| Status       | Implemented                                                      |
| Last Updated | 2026-06-16                                                       |

## TC-UX-WALL-EXPIRED-001 - Expired Wall Shows Refund Feedback

References:

- `SRS-WALL-AC-009`: Wall effects expire after their duration and refund remaining reserve on expiry.
- `SRS-WALL-FEED-EVT-005`: A wall that expires with remaining reserve appends an `expired` event.
- `SRS-WALL-FEED-UI-001`: Intraday must not display a separate order-book wall feedback panel.
- `SRS-WALL-FEED-UI-003`: Row-level feedback text uses game abstraction terms such as depth, reserve, refund, and barrier when text is needed.
- `SRS-WALL-STATE-UI-004`: The active indicator disappears when the wall is inactive, removed, expired, or collapsed.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A buy wall expired with remaining refundable reserve.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with an expired buy wall.
4. Wait until the order-book overlay and row-level wall feedback are visible.
5. Compare the page against the `order-book-wall-expired-feedback.png` visual baseline.

Expected Result:

- No active wall row indicator remains after expiry.
- The expired wall row stays in local cooldown and shows recent expiry refund state.
- No separate wall feedback area is shown.
- Row-level feedback shows expiry refund and released barrier state.
- Available wall actions remain embedded in order-book rows without permanent extra buttons.

Automation:

- `npm run test:visual`
- `tests/visual/order-book-wall-expired-feedback.spec.ts`
