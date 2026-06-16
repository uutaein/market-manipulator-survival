# UI/UX Test Cases - Final Settlement

| Item         | Value                                            |
| ------------ | ------------------------------------------------ |
| Feature      | `feature/ui/final_settlement_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage             |
| Status       | Implemented                                      |
| Last Updated | 2026-06-16                                       |

## TC-UX-FINAL-SETTLEMENT-001 - Final Result Summarizes Run and Replay Choices

References:

- `SRS-SETTLE-FINAL-002`: Final Settlement reflects cumulative profit, final surveillance grade, average surveillance grade, successful Days, final budget, final holding ratio, and social cost.
- `ADR-0002 section 2.6`: Budget preservation rate is shown explicitly on settlement screens.
- `SRS-SETTLE-FINAL-004`: Final Settlement provides same-condition restart and new Run start.
- `SRS-SETTLE-SAVE-002`: The recent Final Settlement result is saved locally.
- `SRS-SETTLE-SAVE-003`: The best Final grade and best cumulative profit are saved locally.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Final Settlement from a completed Free Mode Run.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session as a Day 5 settlement state.
4. Activate `Day 정산`.
5. Continue from Day Settlement into `Final 정산`.
6. Wait until the Final Settlement canvas is visible and non-empty.
7. Compare the page against the `final-settlement.png` visual baseline.

Expected Result:

- Final grade and grade label are the dominant result.
- Cumulative profit, successful Days, final budget preservation, and base grade are grouped as performance metrics.
- Final surveillance grade, average surveillance grade, holding band, and social cost are grouped as risk context.
- Local record save status is visible.
- `같은 조건 재시작` and `새 Run 시작` are visually separate actions.

Automation:

- `npm run test:visual`
- `tests/visual/final-settlement.spec.ts`
