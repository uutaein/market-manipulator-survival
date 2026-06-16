# UI/UX Test Cases - Order-book Wall Collapse Feedback

| Item         | Value                                                             |
| ------------ | ----------------------------------------------------------------- |
| Feature      | `feature/ui/order_book_wall_collapse_feedback_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                              |
| Status       | Implemented                                                       |
| Last Updated | 2026-06-16                                                        |

## TC-UX-WALL-COLLAPSE-001 - Collapsed Wall Leaves Clear Recent Feedback

References:

- `SRS-WALL-FEED-UI-001`: Intraday must not display a separate order-book wall feedback panel.
- `SRS-WALL-FEED-UI-002`: Recent wall feedback is represented on the affected order-book row.
- `SRS-WALL-FEED-UI-003`: Row-level feedback text uses game abstraction terms such as depth, reserve, refund, and barrier when text is needed.
- `SRS-WALL-STATE-UI-004`: The active indicator disappears when the wall is inactive, removed, expired, or collapsed.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A buy wall has formed, melted, and collapsed with no remaining depth or refundable reserve.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with a collapsed buy wall event log.
4. Wait until the order-book overlay and row-level wall feedback are visible.
5. Compare the page against the `order-book-wall-collapse-feedback.png` visual baseline.

Expected Result:

- No order-book row shows the active wall indicator.
- No separate wall feedback area is shown.
- The collapsed wall row shows local cooldown/released-barrier state.
- Wall actions remain embedded in the order-book rows without permanent extra buttons.

Automation:

- `npm run test:visual`
- `tests/visual/order-book-wall-collapse-feedback.spec.ts`
