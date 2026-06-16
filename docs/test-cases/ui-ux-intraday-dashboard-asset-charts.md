# UI/UX Test Cases - Intraday Dashboard Asset Charts

| Item         | Value                                                           |
| ------------ | --------------------------------------------------------------- |
| Feature      | `feature/ui/intraday_dashboard_asset_charts_experience.feature` |
| Test Scope   | Playwright visual and DOM smoke coverage                        |
| Status       | Implemented                                                     |
| Last Updated | 2026-06-16                                                      |

## TC-UX-INTRADAY-DASHBOARD-CHARTS-001 - Selected Asset Shows Signals, Live Chart, and Period Chart

References:

- `SRS-CONTENT-MARKET-004`: Market Dashboard ranks all 24 fictional assets and prioritizes the window around the player asset.
- `SRS-CONTENT-MARKET-005`: News-affected sectors or assets remain identifiable with badges or simple state cues.
- `SRS-FLOW-SCREEN-004`: Intraday shows fictional price movement without real market data.

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
6. Activate `개장 승인`.
7. Wait until the Intraday Market Board overlay is visible.
8. Select a row in the Market Dashboard.
9. Compare the page against the `intraday-dashboard-asset-charts.png` visual baseline.

Expected Result:

- The selected dashboard row is visually highlighted.
- The dashboard detail area shows the selected asset label, current live change, Day marker, and fictional value.
- The detail area shows compact selected-asset signals for rank, rank movement, news tone, and live flow.
- The `LIVE` mini chart shows individual intraday movement for the selected row.
- The `DAYS` mini chart shows period movement across Day 1 through Day 5 and highlights the current Day.
- The chart area remains compact and does not hide manual actions, auto-card status, or the live price desk.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-dashboard-asset-charts.spec.ts`
