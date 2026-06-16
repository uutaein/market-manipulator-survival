# UI/UX Test Cases - Pre-open Card

| Item         | Value                                        |
| ------------ | -------------------------------------------- |
| Feature      | `feature/ui/preopen_card_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage         |
| Status       | Implemented                                  |
| Last Updated | 2026-06-16                                   |

## TC-UX-PREOPEN-001 - Day 1 Pre-open Choice Is Guided

References:

- `SRS-CONTENT-PREOPEN-004`: Pre-open choice happens before Morning News.
- `SRS-CONTENT-PREOPEN-007`: `선취매` uses a ratio UI and marks concentration risk above 50%.
- `SRS-CONTENT-PREOPEN-008`: Day 1 or no-position state allows only `선취매`.
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
4. Wait until the Pre-open Card canvas is visible and non-empty.
5. Compare the page against the `preopen-card.png` visual baseline.

Expected Result:

- Morning News is visibly locked until the pre-open decision is made.
- `선취매` is the only active Day 1 choice.
- The early-positioning ratio, `50%` threshold marker, budget use, entry premium, and concentration risk are grouped in the active panel.
- The `DECISION IMPACT` panel summarizes selected ratio, remaining budget, and risk before confirmation.
- Future pre-open choices are visible as locked or unavailable choices.
- The bottom next-step area clearly explains that a choice is required before Morning News.

Automation:

- `npm run test:visual`
- `tests/visual/preopen-card.spec.ts`
