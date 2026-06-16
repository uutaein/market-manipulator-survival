# UI/UX Test Cases - Day Settlement High Holding

| Item         | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Feature      | `feature/ui/day_settlement_high_holding_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                        |
| Status       | Implemented                                                 |
| Last Updated | 2026-06-16                                                  |

## TC-UX-DAY-SETTLEMENT-HOLD-001 - High Holding Risk Is Explainable

References:

- `ADR-0017`: Holding ratio is intraday power but settlement risk.
- `SRS-SETTLE-HOLD-001`: Day/Final Settlement evaluates holding bands.
- `SRS-SETTLE-HOLD-002`: Excessive holding ratio must be shown as settlement risk.
- `SRS-SETTLE-HOLD-003`: `포지션 정리` is the key action for managing this risk.
- `SRS-SETTLE-DAY-005`: Settlement shows a short next-play hint.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday operation in a Free Mode Run.
- The active Day ends with holding ratio at or above `55%`.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with high remaining holding, participation, volatility, and social cost.
4. Activate Day Settlement.
5. Compare the page against the `day-settlement-high-holding.png` visual baseline.

Expected Result:

- The Holding / Settlement Context panel labels the holding band as `과점 위험 / 정산 리스크`.
- The panel explains that excessive holding can worsen surveillance and Final scoring.
- The hint tells the player to reduce holding through `포지션 정리`.
- Supporting metrics still show budget, holding ratio, participation, volatility, and social cost.

Automation:

- `npm run test:visual`
- `tests/visual/day-settlement-high-holding.spec.ts`
