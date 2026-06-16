# UI/UX Test Cases - Order-book Wall Low Depth

| Item         | Value                                                     |
| ------------ | --------------------------------------------------------- |
| Feature      | `feature/ui/order_book_wall_low_depth_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                      |
| Status       | Implemented                                               |
| Last Updated | 2026-06-16                                                |

## TC-UX-WALL-LOW-DEPTH-001 - Low-depth Wall Warns Before Collapse

References:

- `SRS-WALL-STATE-UI-001`: Active wall rows show a compact remaining-depth indicator.
- `SRS-WALL-STATE-UI-002`: The indicator fill ratio is clamped from remaining depth over original depth.
- `SRS-WALL-STATE-UI-005`: Active row title text includes remaining depth and remaining refundable reserve.
- `SRS-WALL-FEED-UI-003`: Row-level feedback text uses game abstraction terms such as depth, reserve, refund, and barrier when text is needed.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A buy wall is active with low remaining depth and a small refundable reserve.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with a nearly consumed buy wall.
4. Wait until the order-book overlay and wall feedback are visible.
5. Compare the page against the `order-book-wall-low-depth.png` visual baseline.

Expected Result:

- The active row uses a low-depth visual tone without changing row height.
- The active row label shows remaining-depth percentage and refundable reserve.
- The row title includes low-depth, remaining depth, original depth, refundable reserve, and original reserve details.
- Recent wall feedback remains visible and uses abstract `depth`, `예약`, `환급`, and `방어선` terminology.
- No separate permanent wall buttons are added outside the order-book rows.

Automation:

- `npm run test:visual`
- `tests/visual/order-book-wall-low-depth.spec.ts`
