# UI/UX Test Cases - Intraday Objective Distance

| Item         | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Feature      | `feature/ui/intraday_objective_distance_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                        |
| Status       | Implemented                                                 |
| Last Updated | 2026-06-16                                                  |

## TC-UX-INTRADAY-OBJECTIVE-001 - Objective Distance Is Scannable

References:

- `SRS-FLOW-SCREEN-004`: Intraday shows the fictional price flow as the primary live screen.
- `SRS-FLOW-DAY-002`: Market Briefing summarizes target conditions and key risk before Intraday.
- `SRS-PRICE-AC-005`: Crossing the crash line is an immediate failure condition.
- `PRD v0.1.5`: Intraday observation centers on the target asset chart and market board, with target and risk context remaining readable.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, starts the default Run, selects Day 1 `선취매`, opens Morning News, and approves opening.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Wait for the full Morning Briefing and activate `개장 승인`.
7. Wait until the Intraday canvas and DOM overlays are visible.
8. Compare the page against the `intraday-objective-distance.png` visual baseline.

Expected Result:

- The live price desk separates current movement, average entry, and volume from objective distance.
- A compact status strip shows whether the player is below, inside, or above the target band.
- The same strip shows crash-line buffer without replacing the chart or order book.
- The copy uses abstract game terms such as `목표` and `붕괴여유`.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-objective-distance.spec.ts`
