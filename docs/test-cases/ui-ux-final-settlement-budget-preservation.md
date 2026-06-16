# UI/UX Test Cases - Final Settlement Budget Preservation

| Item         | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| Feature      | `feature/ui/final_settlement_budget_preservation_experience.feature` |
| Test Scope   | Playwright visual coverage                                           |
| Status       | Implemented                                                          |
| Last Updated | 2026-06-16                                                           |

## TC-UX-FINAL-BUDGET-001 - Final Budget Preservation Is Explicit

References:

- `PRD v0.1.5 section 11.9`: Final Settlement shows final budget as part of the whole-Run result.
- `ADR-0002 section 2.6`: Budget preservation rate is shown explicitly on settlement screens.
- `ADR-0008 sections 6 and 9`: Final Settlement evaluates the Run outcome and budget preservation is part of Day/Final settlement impact.
- `SRS-SETTLE-FINAL-002`: Final Settlement reflects final budget, holding ratio, surveillance, successful Days, and social cost.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Final Settlement with remaining budget below 50% of the Run starting budget.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Force a Day 5 Intraday state with `38B` remaining budget.
4. Activate `Day 정산`.
5. Continue from Day Settlement into `Final 정산`.
6. Wait until the Final Settlement canvas is visible and non-empty.
7. Compare the page against the `final-settlement-budget-preservation.png` visual baseline.

Expected Result:

- Final budget is shown with a preservation percentage.
- The preservation percentage is labeled as Run-starting-budget based.
- The below-50% state is called out as a threshold miss.
- Cumulative profit, success count, base grade, risk context, and replay choices remain visible.

Automation:

- `npm run test:visual`
- `tests/visual/final-settlement-budget-preservation.spec.ts`
