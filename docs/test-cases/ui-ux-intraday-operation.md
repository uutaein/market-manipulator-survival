# UI/UX Test Cases - Intraday Operation

| Item         | Value                                              |
| ------------ | -------------------------------------------------- |
| Feature      | `feature/ui/intraday_operation_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage               |
| Status       | Implemented                                        |
| Last Updated | 2026-06-16                                         |

## TC-UX-INTRADAY-001 - Live Desk Is Scannable at Entry

References:

- `SRS-FLOW-SCREEN-004`: Intraday shows fictional candle chart and volume bar without real market data.
- `SRS-FLOW-DAY-006`: Intraday operation runs on a 180-second timer.
- `SRS-FLOW-DAY-002`: Target conditions and key risk remain readable after the player enters Intraday.
- `SRS-CONTENT-ACTION-001`: Four manual actions are immediate buttons.
- `SRS-CONTENT-MARKET-001` through `SRS-CONTENT-MARKET-005`: Market Board context and dashboard remain visible.

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
8. Compare the page against the `intraday-operation.png` visual baseline.

Expected Result:

- Day, selected asset, timer, and budget are visible in the session status.
- The live price chart and order book are grouped as the live price desk.
- Target distance and crash-line buffer are visible near the live price desk.
- Money and risk telemetry are visible before manual actions as compact cards for price, holding, profit/loss, budget, risk, chart state, and flow.
- Raw internal `MADNESS`, participation, liquidity, pressure, surveillance, and volatility metric labels are not exposed in the main telemetry copy.
- High surveillance can surface as a compact alert without changing screens.
- Near-crash price can surface as a compact alert without changing screens.
- The four MVP manual actions are grouped together and readable.
- Market Board, selected-asset mini charts, and auto-card status remain visible without obscuring the primary action area.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-operation.spec.ts`
