# UI/UX Test Cases - Intraday Manual Action Unavailable State

| Item         | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Feature      | `feature/ui/intraday_manual_action_unavailable_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                               |
| Status       | Implemented                                                        |
| Last Updated | 2026-06-16                                                         |

## TC-UX-ACTION-UNAVAILABLE-001 - Disabled Manual Actions Explain Why

References:

- `SRS-BASE-ACTION-001`: Manual action buttons show disabled state when the player cannot pay the cost, a modal decision is open, or the action is on cooldown. Executing actions remain clickable as interruption controls.
- `SRS-BASE-ACTION-011`: Active manual actions show a fill gauge and can be interrupted mid-gauge.
- `SRS-CONTENT-ACTION-001`: Four MVP manual actions remain grouped as immediate controls.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, starts the default Run, selects Day 1 `선취매`, opens Morning News, and approves opening.
- The Intraday state is prepared with low budget, positive holding, and one manual action cooldown.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Activate `개장 승인`.
7. Prepare the active Intraday state with low budget and one manual action cooldown.
8. Compare the page against the `intraday-manual-action-unavailable.png` visual baseline.

Expected Result:

- Budget-cost manual actions that cannot be paid are visibly dimmed and labeled `예산 부족`.
- The cooldown manual action is visibly dimmed and labeled with remaining wait time such as `대기 9s`.
- At least one position-reducing action remains available when holding exists and its calculated recovery is positive.
- The manual action status line summarizes blocked reasons and the count of available actions.
- The Market Board, price desk, and money/risk telemetry remain visible without a manual Day Settlement control.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-manual-action-unavailable.spec.ts`
