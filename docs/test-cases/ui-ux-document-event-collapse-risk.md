# UI/UX Test Cases - Document Event Collapse Risk

| Item         | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Feature      | `feature/ui/document_event_collapse_risk_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                         |
| Status       | Implemented                                                  |
| Last Updated | 2026-06-16                                                   |

## TC-UX-DOC-COLLAPSE-001 - Collapse Risk Notice Shows Crash Context

References:

- `SRS v0.1.6 trigger table`: `급락 위험 통지` can trigger when `priceChangePercent <= crashLine + 6`.
- `SRS-BASE-DOC-002`: Document Event choices that change budget must show the budget delta before commit.
- `SRS-BASE-DOC-004`: Document Event effects must use safe fictional terminology and abstract stats only.
- `ADR-0014`: `급락 위험 통지` is a failure-adjacent urgent Document Event.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday operation in Free Mode.
- The active Intraday state is near the crash line.
- The `급락 위험 통지` Document Event is open.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Wait for the full Morning Briefing and activate `개장 승인`.
7. Prepare the active browser session with `급락 위험 통지` open.
8. Compare the page against the `document-event-collapse-risk.png` visual baseline.

Expected Result:

- The popup title shows `급락 위험 통지`.
- The document body shows current change, crash line, and remaining crash buffer.
- Stable, aggressive, and watch responses are visually separated.
- The stable defensive choice exposes its budget cost before commit.
- The popup communicates that time and automatic effects are paused.

Automation:

- `npm run test:visual`
- `tests/visual/document-event-collapse-risk.spec.ts`
