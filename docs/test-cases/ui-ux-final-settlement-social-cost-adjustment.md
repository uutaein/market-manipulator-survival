# UI/UX Test Cases - Final Settlement Social Cost Adjustment

| Item         | Value                                                                   |
| ------------ | ----------------------------------------------------------------------- |
| Feature      | `feature/ui/final_settlement_social_cost_adjustment_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                                    |
| Status       | Implemented                                                             |
| Last Updated | 2026-06-16                                                              |

## TC-UX-FINAL-SOCIAL-COST-001 - Social Cost Downgrade Is Explained

References:

- `ADR-0015`: Social cost can lower the Final grade and should be shown when it does.
- `SRS-SETTLE-FINAL-002`: Final Settlement reflects social cost.
- `SRS-SETTLE-SOCIAL-002`: Social cost appears in Final Settlement.
- `SRS-SETTLE-SOCIAL-003`: High social cost can be used as a Final grade adjustment.
- `SRS v0.1.6`: `socialCost >= 50` downgrades by one grade.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Final Settlement from a completed Free Mode Run.
- Cumulative profit and surveillance qualify for base grade `A`.
- Social cost is at least `50`, downgrading the final grade to `B`.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session as a Day 5 state with high accumulated social cost.
4. Activate `Day 정산`.
5. Continue from Day Settlement into `Final 정산`.
6. Compare the page against the `final-settlement-social-cost-adjustment.png` visual baseline.

Expected Result:

- The hero shows final grade `B` and its grade label.
- The performance panel shows base grade `A`.
- The risks panel shows `등급 보정 A -> B`.
- The risks panel identifies `사회적 비용 50+ : -1` as the adjustment reason.
- Replay actions remain available.

Automation:

- `npm run test:visual`
- `tests/visual/final-settlement-social-cost-adjustment.spec.ts`
