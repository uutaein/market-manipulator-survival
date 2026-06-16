# UI/UX Test Cases - Contract Final Settlement

| Item | Value |
| --- | --- |
| Feature | `feature/ui/contract_final_settlement_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-CONTRACT-FINAL-001 - Contract Result Explains Outcome, Costs, and Efficiency

References:
- `SRS-CONTRACT-SCORE-004`: Contract settlement displays fixed reward, budget spent, surveillance cost, social cost, side-effect penalties, and net performance.
- `SRS-CONTRACT-SCORE-005`: Contract settlement displays each objective's pass/fail/progress state.
- `SRS-CONTRACT-SCORE-006`: Contract Mode grades efficiency separately from binary success.
- `SRS-CONTRACT-UI-SETTLE-002`: Final Contract Settlement shows contract success/failure.
- `SRS-CONTRACT-UI-SETTLE-003`: Final Contract Settlement shows each objective result, fixed reward, budget spent, risk costs, net performance, and efficiency grade.

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Final Settlement from a completed Contract Mode mandate.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Complete the path through Opening Approval until the Intraday screen is active.
3. Prepare the active browser session as the final Day of a successful Contract Mode mandate.
4. Activate `Day 정산`.
5. Continue from Day Settlement into `Final 정산`.
6. Wait until the Final Settlement canvas is visible and non-empty.
7. Compare the page against the `contract-final-settlement.png` visual baseline.

Expected Result:
- Contract success or failure is visible in a dedicated Contract Result panel.
- Objective completion is shown per objective with progress labels.
- Fixed reward, spent budget, surveillance cost, social cost, side-effect penalty, and missed-objective penalty are grouped as settlement costs.
- Net performance and efficiency grade are shown separately from the binary contract outcome.
- `같은 조건 재시작` and `새 Run 시작` remain available.

Automation:
- `npm run test:visual`
- `tests/visual/contract-final-settlement.spec.ts`
