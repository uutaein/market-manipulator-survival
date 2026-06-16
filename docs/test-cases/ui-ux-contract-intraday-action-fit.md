# UI/UX Test Cases - Contract Intraday Action Fit

| Item         | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Feature      | `feature/ui/contract_intraday_action_fit_experience.feature` |
| Test Scope   | Playwright visual coverage                                   |
| Status       | Implemented                                                  |
| Last Updated | 2026-06-16                                                   |

## TC-UX-CONTRACT-TRACK-ACTION-FIT-001 - Intraday Tracker Shows Manual-Action Fit Feedback

References:

- `SRS-CONTRACT-MODE-003`: Contract Mode reuses the same manual actions, Market Dashboard, VALUE, MADNESS, Retail Swarm, and settlement primitives as Free Mode.
- `SRS-CONTRACT-UI-TRACK-001`: Intraday UI shows a contract objective tracker.
- `SRS-CONTRACT-UI-TRACK-004`: Tracker shows estimated contract net performance or cost pressure.
- `ADR-0035`: The first Contract Mode slice reuses existing manual actions and uses contract objectives to make those tools strategically different.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday from an active Contract Mode mandate.
- A shared manual action that conflicts with the accepted mandate is available.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Enter Contract Mode and accept a sample mandate.
3. Complete Pre-open Card and Morning Briefing.
4. Prepare the active browser session with deterministic Contract Mode progress.
5. Use a manual action that is risky for the active mandate.
6. Wait until the Intraday canvas and chart overlay are visible and non-empty.
7. Compare the page against the `contract-intraday-action-fit.png` visual baseline.

Expected Result:

- The visible `TRACK` contract panel moves into a compact feedback state without covering the Market Dashboard.
- A distinct `도구판정 [위험]` line identifies the conflicting shared tool and mandate intent.
- Estimated net performance and cost pressure remain visible after the tool-fit judgment.
- Manual action buttons, the active action state, Market Dashboard, chart target, and Order Book remain visible.

Automation:

- `npm run test:visual`
- `tests/visual/contract-intraday-action-fit.spec.ts`
