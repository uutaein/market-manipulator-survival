# UI/UX Test Cases - Pre-open Decision Impact

| Item         | Value                                                   |
| ------------ | ------------------------------------------------------- |
| Feature      | `feature/ui/preopen_decision_impact_experience.feature` |
| Test Scope   | Playwright visual coverage                              |
| Status       | Implemented                                             |
| Last Updated | 2026-06-16                                              |

## TC-UX-PREOPEN-IMPACT-001 - Early Positioning Impact Is Scannable Before Confirm

References:

- `SRS-CONTENT-PREOPEN-004`: Pre-open choice happens before Morning News.
- `SRS-CONTENT-PREOPEN-007`: `선취매` uses a ratio UI and marks concentration risk above 50%.
- `SRS-FLOW-ONBOARD-005`: Day 1 shows other pre-open cards as disabled when unavailable.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, keeps the default Run Setup choice, and starts the Run.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Move the `선취매` ratio into the high-risk band.
5. Wait until the Pre-open Card canvas is visible and non-empty.
6. Compare the page against the `preopen-decision-impact.png` visual baseline.

Expected Result:

- The `DECISION IMPACT` panel shows the selected ratio before confirmation.
- Remaining budget is represented as both text and a compact meter.
- Concentrated risk is marked before the player confirms the pre-open choice.
- The impact panel does not obscure locked future choices or the bottom Morning News lock guidance.
- Morning News remains locked until the player confirms the choice.

Automation:

- `npm run test:visual`
- `tests/visual/preopen-decision-impact.spec.ts`
