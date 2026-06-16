# UI/UX Test Cases - Market Board Context

| Item         | Value                                                |
| ------------ | ---------------------------------------------------- |
| Feature      | `feature/ui/market_board_context_experience.feature` |
| Test Scope   | Playwright visual and DOM smoke coverage             |
| Status       | Implemented                                          |
| Last Updated | 2026-06-16                                           |

## TC-UX-MARKET-BOARD-CONTEXT-001 - Market Board Scope Is Explainable

References:

- `SRS-CONTENT-MARKET-002`: Market Board context shows two same-sector peers and seven other-sector averages.
- `SRS-CONTENT-MARKET-004`: Market Dashboard ranks all 24 fictional assets and prioritizes the window around the player asset.
- `SRS-CONTENT-MARKET-005`: News-affected sectors or assets remain identifiable with badges or simple state cues.
- `SRS-BASE-MARKET-001` through `SRS-BASE-MARKET-004`: The selected player asset, same-sector peers, other-sector averages, and 24-asset fictional value ranking remain separate.

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
8. Compare the page against the `market-board-context.png` visual baseline.

Expected Result:

- The Market Board shows separate panels for same-sector peer context, other-sector averages, and the market dashboard.
- The same-sector panel scope label reads `2 PEER / 동일 섹터`.
- The other-sector panel scope label reads `7 AVG / 타 섹터`.
- The dashboard scope label shows the player asset rank with `선택 차트`.
- The peer panel has two rows, the other-sector panel declares seven average rows, and the dashboard keeps a compact selectable rank window.
- The dashboard includes a selected-asset detail area for live and Day-period mini charts.
- News-affected rows retain abstract `호재` or `악재` badges without real ticker, venue, or exchange terminology.

Automation:

- `npm run test:visual`
- `tests/visual/market-board-context.spec.ts`
