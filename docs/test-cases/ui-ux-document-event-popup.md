# UI/UX Test Cases - Document Event Popup

| Item         | Value                                                |
| ------------ | ---------------------------------------------------- |
| Feature      | `feature/ui/document_event_popup_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                 |
| Status       | Implemented                                          |
| Last Updated | 2026-06-16                                           |

## TC-UX-DOC-EVENT-001 - Document Event Presents Paused Three-Choice Decision

References:

- `SRS-CONTENT-DOC-002`: Only one document event is shown at a time.
- `SRS-CONTENT-DOC-003`: Intraday operation pauses while the document event is displayed.
- `SRS-CONTENT-DOC-004`: Each document event provides three choices.
- `SRS-CONTENT-DOC-005`: Choices represent stable, aggressive, and avoid or watch directions.
- `SRS-SETTLE-SOCIAL-001`: Social cost remains an abstract number and document warning, without real procedure detail.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- A document event is open in the active Intraday session.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with an open document event.
4. Wait until the paused popup is visible and the canvas is non-empty.
5. Compare the page against the `document-event-popup.png` visual baseline.

Expected Result:

- The Intraday screen is dimmed behind the popup.
- The popup clearly states that operation is paused until response.
- The document event title is prominent.
- Event-specific context can be shown in the document body.
- Three response choices are separated as clickable cards.
- Stable, aggressive, and avoid tones are readable.
- Choice effects use abstract stat deltas only.

Automation:

- `npm run test:visual`
- `tests/visual/document-event-popup.spec.ts`
