# UI/UX Test Cases - Run Failure Final Settlement

| Item         | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Feature      | `feature/ui/run_failure_final_settlement_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                         |
| Status       | Implemented                                                  |
| Last Updated | 2026-06-16                                                   |

## TC-UX-FINAL-FAILURE-001 - Forced Failure Snapshot Is Scannable

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player is in Free Mode Intraday.
- The Run is forced into an immediate failure state.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Start Free Mode and reach Intraday.
3. Force the active Run into immediate failure with surveillance at `100`.
4. Wait until the Final Settlement canvas is visible and non-empty.
5. Compare the page against the `run-failure-final-settlement.png` visual baseline.

Expected Result:

- The Final grade is `F` and the result reads as forced failure.
- The hero failure snapshot shows Day, current price change, surveillance, budget, and reason.
- Run performance, surveillance review, risk, final note, and replay options remain visible.
- `같은 조건 재시작` and `새 Run 시작` are both available.
- No separate failure screen is introduced.

Automation:

- `npm run test:visual`
- `tests/visual/run-failure-final-settlement.spec.ts`
