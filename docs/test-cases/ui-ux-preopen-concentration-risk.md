# UI/UX Test Cases - Pre-open Concentration Risk

| Item         | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Feature      | `feature/ui/preopen_concentration_risk_experience.feature` |
| Test Scope   | Playwright visual coverage                                 |
| Status       | Implemented                                                |
| Last Updated | 2026-06-16                                                 |

## TC-UX-PREOPEN-CONCENTRATION-001 - Early Positioning High-Risk Band Is Visible

References:

- `PRD v0.1.5 section 7.2`: `선취매` supports 10-85% entry on Day 1 and marks values above 50% as concentration risk.
- `ADR-0029 item 17`: Values above 50% are shown as a high-risk concentration band rather than a normal default choice.
- `SRS-CONTENT-PREOPEN-007`: `선취매` uses a ratio UI and marks concentration risk above 50%.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, keeps the default Run Setup choice, and starts the Run.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Move the `선취매` ratio above the `50%` threshold.
5. Wait until the Pre-open Card canvas is visible and non-empty.
6. Compare the page against the `preopen-concentration-risk.png` visual baseline.

Expected Result:

- The ratio track shows a distinct high-risk concentration band after `50%`.
- The preview calls out `구간 과집중` and opening liquidity loss.
- Budget use, remaining budget, entry premium, and asset influence resistance remain visible.
- Morning News remains locked until `선취매` is confirmed.

Automation:

- `npm run test:visual`
- `tests/visual/preopen-concentration-risk.spec.ts`
