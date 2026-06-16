# UI/UX Test Cases - Document Event Budget Delta

| Item         | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Feature      | `feature/ui/document_event_budget_delta_experience.feature` |
| Test Scope   | Playwright visual coverage                                  |
| Status       | Implemented                                                 |
| Last Updated | 2026-06-16                                                  |

## TC-UX-DOC-BUDGET-001 - Budget Delta Is Visible Before Commit

References:

- `SRS-BASE-DOC-002`: Document Event choices that change budget must show the budget delta in the popup choice description before the player commits.
- `ADR-0029`: Document Event choices that change budget must show the budget delta in the popup; `유동성 경색 보고` aggressive response uses `유동성 긴급 공급` at low cost, distinct from manual `유동성 공급`.
- `SRS-SETTLE-SOCIAL-001`: Document Event copy remains abstract and avoids real procedure detail.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday operation in Free Mode.
- The `유동성 경색 보고` document event is open.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with `유동성 경색 보고` open.
4. Wait until the paused popup is visible and the canvas is non-empty.
5. Compare the page against the `document-event-budget-delta.png` visual baseline.

Expected Result:

- `예산 재배치` shows a positive budget badge such as `예산 +6B`.
- `유동성 긴급 공급` shows a negative budget badge such as `예산 -2B`.
- `관망` has no budget badge because it does not immediately change budget.
- The existing abstract stat-delta summary remains visible under each choice.
- The popup still communicates the paused state and three-choice structure.

Automation:

- `npm run test:visual`
- `tests/visual/document-event-budget-delta.spec.ts`
