# UI/UX Test Cases - Contract Intraday Deadline Pressure

| Item         | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Feature      | `feature/ui/contract_intraday_deadline_pressure_experience.feature` |
| Test Scope   | Playwright visual coverage                                          |
| Status       | Implemented                                                         |
| Last Updated | 2026-06-16                                                          |

## TC-UX-CONTRACT-TRACK-DEADLINE-001 - Intraday Tracker Shows Today Deadline Pressure

References:

- `SRS-CONTRACT-UI-TRACK-001`: Intraday UI shows a contract objective tracker.
- `SRS-CONTRACT-UI-TRACK-003`: Tracker shows touch status, maintain progress, close target, rank/VALUE target, and fail states when relevant.
- `SRS-CONTRACT-UI-TRACK-004`: Tracker shows estimated contract net performance or cost pressure.
- `ADR-0035`: Contract progress tracker is part of the first Contract Mode implementation.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday from an active Contract Mode mandate with a pending price objective.
- The active mandate is on its final objective Day without a completed target touch.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Enter Contract Mode and accept a sample mandate.
3. Complete Pre-open Card and Morning Briefing.
4. Prepare the active browser session with deterministic Day 3 pending deadline pressure.
5. Wait until the Intraday canvas and chart overlay are visible and non-empty.
6. Compare the page against the `contract-intraday-deadline.png` visual baseline.

Expected Result:

- The visible `TRACK` contract panel headline shows `오늘 마감` next to the current contract Day.
- Objective status and progress remain visible directly below the deadline-aware headline.
- The chart target, fixed reward, estimated net performance, cost pressure, manual actions, Market Dashboard, and Order Book remain visible.

Automation:

- `npm run test:visual`
- `tests/visual/contract-intraday-deadline.spec.ts`
