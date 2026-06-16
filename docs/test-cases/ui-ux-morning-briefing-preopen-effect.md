# UI/UX Test Cases - Morning Briefing Pre-open Effect

| Item         | Value                                                           |
| ------------ | --------------------------------------------------------------- |
| Feature      | `feature/ui/morning_briefing_preopen_effect_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                            |
| Status       | Implemented                                                     |
| Last Updated | 2026-06-16                                                      |

## TC-UX-BRIEFING-PREOPEN-001 - Pre-open Effect Is Confirmed Before Approval

References:

- `PRD v0.1.5`: Pre-open card effect direction is shown before Opening Approval.
- `PRD v0.1.5`: After card selection, the player reviews Morning News and Market Briefing before entering intraday through approval.
- `SPEC v0.1.0 section 7.2`: `뉴스 배정` exposes positive and negative direction choices for the player-selected fictional asset.
- `SRS-FLOW-DAY-005`: Opening Approval is required before intraday operation.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, completes Day 1 with a carried position, and reaches Day 2 Pre-open Card selection.
- The player selects `뉴스 배정: 호재`.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Complete Day 1 through Opening Approval and seed a near-close carried-position state.
5. Let the Intraday timer end and transition to Day Settlement.
6. Activate `다음 Day`.
7. Select `뉴스 배정: 호재`.
8. Activate `아침 뉴스 확인`.
9. Wait for the full Morning Briefing to render.
10. Compare the page against the `morning-briefing-preopen-effect.png` visual baseline.

Expected Result:

- Morning Briefing shows the assigned player-asset news direction in the news feed.
- A `PRE-OPEN EFFECT` panel summarizes the selected card before Opening Approval.
- The effect panel includes budget cost and risk/effect direction, including volatility and liquidity context for `뉴스 배정`.
- Market Briefing and Today Condition remain visible beside the pre-open effect summary.
- Opening Approval remains the final, visually separate action into intraday operation.

Automation:

- `npm run test:visual`
- `tests/visual/morning-briefing-preopen-effect.spec.ts`
