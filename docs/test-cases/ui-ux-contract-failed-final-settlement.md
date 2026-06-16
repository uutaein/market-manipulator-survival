# UI/UX Test Cases - Contract Failed Final Settlement

| Item         | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| Feature      | `feature/ui/contract_failed_final_settlement_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                             |
| Status       | Implemented                                                      |
| Last Updated | 2026-06-16                                                       |

## TC-UX-CONTRACT-FINAL-FAIL-001 - Failed Contract Explains Missed Objectives and Unpaid Reward

References:

- `SRS-CONTRACT-OBJ-002`: A contract succeeds only when all required objectives pass.
- `SRS-CONTRACT-OBJ-003`: Partial objective progress must be visible in settlement feedback but must not pay the fixed reward in the first implementation.
- `SRS-CONTRACT-UI-SETTLE-002`: Final Contract Settlement shows contract success/failure.
- `SRS-CONTRACT-UI-SETTLE-003`: Final Contract Settlement shows each objective result, fixed reward, budget spent, risk costs, net performance, and efficiency grade.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Final Settlement from a failed Contract Mode mandate.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the path through Opening Approval until the Intraday screen is active.
3. Prepare the active browser session as the final Day of a failed Contract Mode mandate.
4. Let the Intraday timer end and transition to Day Settlement.
5. Continue from Day Settlement into `Final 정산`.
6. Wait until the Final Settlement canvas is visible and non-empty.
7. Compare the page against the `contract-failed-final-settlement.png` visual baseline.

Expected Result:

- The Contract Result panel uses `FAILED` as the primary contract status.
- Missed objectives are shown with failed progress labels.
- The fixed reward is shown as unpaid.
- Missed-objective penalty and other risk costs are visible.
- Net performance and efficiency grade show the cost of the failed contract separately from the Free Mode final grade.

Automation:

- `npm run test:visual`
- `tests/visual/contract-failed-final-settlement.spec.ts`
