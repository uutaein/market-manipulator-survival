# UI/UX Test Cases - Intraday Surveillance Alert

| Item         | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Feature      | `feature/ui/intraday_surveillance_alert_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                        |
| Status       | Implemented                                                 |
| Last Updated | 2026-06-16                                                  |

## TC-UX-INTRADAY-SURVEILLANCE-001 - High Surveillance Warns Before Failure

References:

- `SRS-STATE-SURV-001`: Intraday displays `surveillance` as a number.
- `SRS-STATE-SURV-003`: `surveillance` 100 is grade F and immediately fails the Run.
- `ADR-0006`: Surveillance is one of the core Intraday stats and reaches failure at 100.
- `PRD v0.1.5`: Intraday observation should keep major risk context readable while the player watches the target asset and market board.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player reaches Intraday operation in Free Mode.
- The active Intraday state has surveillance in the D danger band.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Wait for the full Morning Briefing and activate `개장 승인`.
7. Prepare the active browser session with high surveillance.
8. Compare the page against the `intraday-surveillance-alert.png` visual baseline.

Expected Result:

- A high-surveillance alert is visible before the Run has failed.
- The alert shows the surveillance grade band and current value.
- The alert shows the remaining buffer before the failure line at 100.
- The alert does not hide the live price desk, money/risk telemetry, manual actions, Market Board, or auto-card status.
- Wording remains in abstract game terms such as `감시`, `경보`, and `실패선`.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-surveillance-alert.spec.ts`
