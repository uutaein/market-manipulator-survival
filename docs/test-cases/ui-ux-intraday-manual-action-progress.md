# UI/UX Test Cases - Intraday Manual Action Progress

| Item         | Value                                                           |
| ------------ | --------------------------------------------------------------- |
| Feature      | `feature/ui/intraday_manual_action_progress_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                            |
| Status       | Implemented                                                     |
| Last Updated | 2026-06-16                                                      |

## TC-UX-ACTION-PROGRESS-001 - Active Manual Action Shows Progress and Interrupt

References:

- `SRS-BASE-ACTION-005`: An executing manual action button must blink and show gauge progress; clicking it again interrupts remaining progress without rolling back already-applied effects.
- `SRS-BASE-ACTION-011`: Active manual actions must show a fill gauge and may be interrupted mid-gauge.
- `SRS-CONTENT-ACTION-001`: Manual actions are immediate controls on the intraday operation screen.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and reaches Intraday operation.
- The intraday state contains an active `유동성 공급` manual action effect.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select Day 1 `선취매`, open Morning Briefing, and approve opening.
5. Seed an active `유동성 공급` manual action with remaining progress.
6. Compare the page against the `intraday-manual-action-progress.png` visual baseline.

Expected Result:

- The active manual action button is visually distinct from inactive manual action buttons.
- The active button shows progress percentage and an interrupt label.
- The active action gauge is partially filled.
- The action status explains that pressing again interrupts only the remaining action progress.
- Money, risk, chart, and market context remain visible while the action executes.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-manual-action-progress.spec.ts`
