# UI/UX Test Cases - Contract Day Settlement

| Item | Value |
| --- | --- |
| Feature | `feature/ui/contract_day_settlement_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-CONTRACT-DAY-001 - Day Settlement Shows Contract Progress

References:
- `SRS-CONTRACT-OBJ-003`: Partial objective progress is visible in settlement feedback but does not pay the fixed reward in the first implementation.
- `SRS-CONTRACT-OBJ-004`: Objective evaluation is deterministic from recorded observations.
- `SRS-CONTRACT-UI-SETTLE-001`: Day Settlement includes contract progress when in Contract Mode.

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Day Settlement from an active Contract Mode mandate.
- At least one objective has partial or completed progress before the contract's final Day.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Enter Contract Mode and accept a sample mandate.
3. Complete the path through Opening Approval until the Intraday screen is active.
4. Prepare the active browser session with deterministic Contract Mode observations.
5. Let the Intraday timer end and transition to Day Settlement.
6. Wait until the Day Settlement canvas is visible and non-empty.
7. Compare the page against the `contract-day-settlement.png` visual baseline.

Expected Result:
- The Day result, actual profit, surveillance grade, profit band, and supporting risk metrics remain visible.
- A dedicated `CONTRACT PROGRESS` panel shows mandate status, target asset, current Day, objective count, and fixed reward.
- Each contract objective shows pass, fail, or progress state.
- Partial completion is visible without presenting the fixed reward as paid.
- The next-step action remains visually available.

Automation:
- `npm run test:visual`
- `tests/visual/contract-day-settlement.spec.ts`
