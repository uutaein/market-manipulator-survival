# UI/UX Test Cases - Contract Intraday Tracker

| Item | Value |
| --- | --- |
| Feature | `feature/ui/contract_intraday_tracker_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-CONTRACT-TRACK-001 - Intraday Tracker Shows Objective, Target, and Cost Pressure

References:
- `SRS-CONTRACT-UI-TRACK-001`: Intraday UI shows a contract objective tracker.
- `SRS-CONTRACT-UI-TRACK-002`: Price objectives render target line or bandline overlays on the player chart where practical.
- `SRS-CONTRACT-UI-TRACK-003`: Tracker shows touch status, maintain progress, close target, rank/VALUE target, and fail states when relevant.
- `SRS-CONTRACT-UI-TRACK-004`: Tracker shows estimated contract net performance or cost pressure.

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday from an active Contract Mode mandate with a price objective.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Enter Contract Mode and accept a sample mandate.
3. Complete Pre-open Card and Morning Briefing.
4. Prepare the active browser session with deterministic contract progress and cost pressure.
5. Wait until the Intraday canvas and chart overlay are visible and non-empty.
6. Compare the page against the `contract-intraday-tracker.png` visual baseline.

Expected Result:
- A visible `TRACK` contract panel shows mandate name, current Day, objective status, objective progress, fixed reward, estimated net performance, and cost pressure.
- The price chart label uses `CTGT` and the chart renders the contract target line or band.
- Manual actions, Market Dashboard, and Order Book remain visible.

Automation:
- `npm run test:visual`
- `tests/visual/contract-intraday-tracker.spec.ts`
