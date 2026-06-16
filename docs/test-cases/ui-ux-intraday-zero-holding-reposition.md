# UI/UX Test Cases - Intraday Zero-Holding Reposition Prompt

| Item         | Value                                               |
| ------------ | --------------------------------------------------- |
| Feature      | `feature/ui/intraday_reposition_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                |
| Status       | Implemented                                         |
| Last Updated | 2026-06-16                                          |

## TC-UX-REPOSITION-PROMPT-001 - Zero-Holding Intraday Shows Next Paths

References:

- `SRS-BASE-ACTION-001`: Manual action buttons must show disabled state when the player cannot use them.
- `SRS-BASE-ACTION-006`: After holding reaches `0` and no manual action is executing, intraday desk reposition can choose a new fictional sector/asset while preserving Run/Day risk state.
- `SRS-BASE-ACTION-014`: Budget depletion alone is not a forced Run failure while recoverable position value logic remains separate from action availability.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and reaches Intraday operation.
- The intraday state has holding ratio `0`, no active manual action effects, enough budget for re-entry, and time remaining.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select Day 1 `선취매`, open Morning Briefing, and approve opening.
5. Seed a zero-holding intraday state with no active manual action effects.
6. Compare the page against the `intraday-zero-holding-reposition-prompt.png` visual baseline.

Expected Result:

- Manual action buttons are visibly unavailable and read as watch-state controls.
- `데스크 재배치` is visible as the re-entry path.
- The manual `Day 정산` control is not shown; timed settlement remains the end-Day path.
- The action status text explains that the player can use desk reposition.
- Money/risk telemetry still shows budget, holding, position value, and current risk state.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-reposition.spec.ts`
