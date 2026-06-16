# UI/UX Test Cases - Contract Day Settlement Action Fit

| Item         | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Feature      | `feature/ui/contract_day_settlement_action_fit_experience.feature` |
| Test Scope   | Playwright visual coverage                                         |
| Status       | Implemented                                                        |
| Last Updated | 2026-06-16                                                         |

## TC-UX-CONTRACT-DAY-ACTION-FIT-001 - Day Settlement Shows Cumulative Tool-Fit Impact

References:

- `SRS-CONTRACT-MODE-003`: Contract Mode reuses the same manual actions, Market Dashboard, VALUE, MADNESS, Retail Swarm, and settlement primitives as Free Mode.
- `SRS-CONTRACT-UI-SETTLE-001`: Day Settlement includes contract progress when in Contract Mode.
- `SRS-CONTRACT-UI-SETTLE-003`: Final Contract Settlement shows risk costs and net performance.
- `ADR-0035`: Existing manual actions should become strategically different under contract objectives without adding new actions.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Day Settlement from an active Contract Mode mandate.
- At least one contract tool-fit bonus or risk value has accumulated during the Day.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Enter Contract Mode and accept a sample mandate.
3. Complete the path through Opening Approval until the Intraday screen is active.
4. Prepare the active browser session with deterministic Contract Mode observations and mixed tool-fit impact.
5. Let the Intraday timer end and transition to Day Settlement.
6. Wait until the Day Settlement canvas is visible and non-empty.
7. Compare the page against the `contract-day-settlement-action-fit.png` visual baseline.

Expected Result:

- The Day result, actual profit, surveillance grade, profit band, and supporting risk metrics remain visible.
- The `CONTRACT PROGRESS` panel still shows mandate status, current Day, objective count, and fixed reward.
- The panel shows a compact cumulative tool-fit line such as `도구 +0.8B / 위험 1.6B`.
- A recent tool-fit judgment remains visible when available so the player can connect the cumulative risk to the last shared tool choice.
- The next-step action remains visually available.

Automation:

- `npm run test:visual`
- `tests/visual/contract-day-settlement-action-fit.spec.ts`
