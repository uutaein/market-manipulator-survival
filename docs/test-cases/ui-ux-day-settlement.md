# UI/UX Test Cases - Day Settlement

| Item         | Value                                          |
| ------------ | ---------------------------------------------- |
| Feature      | `feature/ui/day_settlement_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage           |
| Status       | Implemented                                    |
| Last Updated | 2026-06-16                                     |

## TC-UX-DAY-SETTLEMENT-001 - Day Result Explains Outcome and Next Step

References:

- `SRS-SETTLE-DAY-002`: Day Settlement uses actual profit and surveillance grade as core axes.
- `SRS-SETTLE-DAY-003`: Supporting risk metrics include budget, holding, participation, volatility, and social cost.
- `ADR-0002 section 2.6`: Budget preservation rate is shown explicitly on settlement screens.
- `SRS-SETTLE-HOLD-001`: Holding ratio is evaluated into one of four bands.
- `SRS-SETTLE-DAY-005`: The screen shows a short hint for the next play.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, enters Intraday operation, and opens Day Settlement.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Activate `Day 정산` from the Intraday screen.
4. Wait until the Day Settlement canvas is visible and non-empty.
5. Compare the page against the `day-settlement.png` visual baseline.

Expected Result:

- Day result category is prominent.
- Actual profit and surveillance grade are shown as primary axes.
- Budget preservation, holding, participation, volatility, and social cost are grouped as supporting metrics.
- Holding-band context is visible.
- The next-step control is separate from the result summary and hint.

Automation:

- `npm run test:visual`
- `tests/visual/day-settlement.spec.ts`
