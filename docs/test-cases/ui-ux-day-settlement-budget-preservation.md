# UI/UX Test Cases - Day Settlement Budget Preservation

| Item         | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Feature      | `feature/ui/day_settlement_budget_preservation_experience.feature` |
| Test Scope   | Playwright visual coverage                                         |
| Status       | Implemented                                                        |
| Last Updated | 2026-06-16                                                         |

## TC-UX-DAY-SETTLEMENT-BUDGET-001 - Budget Preservation Is Explicit

References:

- `PRD v0.1.5 section 11.8`: Day Settlement includes budget preservation rate.
- `ADR-0002 section 2.6`: Budget preservation rate is shown explicitly on settlement screens.
- `ADR-0008 section 5`: Day Settlement supporting metrics include budget preservation.
- `SRS-SETTLE-DAY-003`: Supporting risk metrics include remaining budget and related settlement risk context.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Day Settlement with remaining budget below 50% of the Run starting budget.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Force an Intraday state with `34B` remaining budget.
4. Let the Intraday timer end and transition to Day Settlement.
5. Wait until the Day Settlement canvas is visible and non-empty.
6. Compare the page against the `day-settlement-budget-preservation.png` visual baseline.

Expected Result:

- Remaining budget is shown with a preservation percentage.
- The preservation percentage is labeled as Run-starting-budget based.
- The below-50% state is called out as a threshold miss.
- Holding, participation, volatility, and social cost metrics remain visible in the same panel.

Automation:

- `npm run test:visual`
- `tests/visual/day-settlement-budget-preservation.spec.ts`
