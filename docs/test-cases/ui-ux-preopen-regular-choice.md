# UI/UX Test Cases - Regular Pre-open Choice

| Item         | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Feature      | `feature/ui/preopen_regular_choice_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                   |
| Status       | Implemented                                            |
| Last Updated | 2026-06-16                                             |

## TC-UX-PREOPEN-REGULAR-001 - Carried-Position Pre-open Choices Are Comparable

References:

- `PRD v0.1.5`: The player chooses whether to secure more position, assign news direction, analyze the asset, or preserve budget before Morning News.
- `SPEC v0.1.0 section 7.2`: The player can choose at most one pre-open card per Day before Morning News is revealed.
- `SPEC v0.1.0 section 7.2`: From Day 2 onward, a carried position allows `선취매` at 0~85% because additional accumulation is optional.
- `ADR-0029`: Day 1 limits pre-open to `선취매`, while other pre-open cards open from Day 2 when a carried-position context exists.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, completes Day 1 with a carried position, and activates `다음 Day`.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select the Day 1 `선취매` path and approve opening.
5. Seed a near-close Day 1 intraday state with a positive carried position.
6. Activate `Day 정산`.
7. Activate `다음 Day`.
8. Compare the page against the `preopen-card-regular-options.png` visual baseline.

Expected Result:

- The Pre-open Card screen is rendered for Day 2 with a carried position.
- `선취매`, `뉴스 배정`, `종목 분석`, and `관망` are all visible as available choices.
- The header states that a carried position has opened multiple comparable choices and that at most one card can be selected.
- The budget summary shows current budget, one-card limit, no-cost watch path, and budget-cost card comparison.
- Morning News remains locked until the player chooses a card or confirms the watch path.

Automation:

- `npm run test:visual`
- `tests/visual/preopen-regular-choice.spec.ts`
