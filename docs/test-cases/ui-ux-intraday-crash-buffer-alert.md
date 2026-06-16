# UI/UX Test Cases - Intraday Crash Buffer Alert

| Item         | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Feature      | `feature/ui/intraday_crash_buffer_alert_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                        |
| Status       | Implemented                                                 |
| Last Updated | 2026-06-16                                                  |

## TC-UX-INTRADAY-CRASH-001 - Crash Buffer Warns Before Forced Failure

References:

- `SRS-STATE-INTRA-006`: Leaving the crash line causes immediate Run failure.
- `SRS-PRICE-FAIL-001`: `priceChangePercent <= crashLine` triggers immediate Run failure.
- `SRS v0.1.6 trigger table`: The collapse-risk notice can trigger when `priceChangePercent <= crashLine + 6`.
- `PRD v0.1.5`: Intraday should keep target/crash-line context readable around the fictional candle chart.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday operation in Free Mode.
- The active Intraday state is above but close to the Day crash line.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Wait for the full Morning Briefing and activate `개장 승인`.
7. Prepare the active browser session near the crash line.
8. Compare the page against the `intraday-crash-buffer-alert.png` visual baseline.

Expected Result:

- A crash-line alert is visible before the Run has failed.
- The alert shows current price change against the crash line.
- The alert shows remaining crash buffer.
- The alert does not hide the live price desk, money/risk telemetry, manual actions, Market Board, or auto-card status.
- Wording remains in abstract game terms such as `붕괴`, `선`, and `붕괴여유`.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-crash-buffer-alert.spec.ts`
