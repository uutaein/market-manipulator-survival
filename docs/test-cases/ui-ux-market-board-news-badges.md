# UI/UX Test Cases - Market Board News Badges

| Item         | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Feature      | `feature/ui/market_board_news_badges_experience.feature` |
| Test Scope   | Playwright visual and DOM smoke coverage                 |
| Status       | Implemented                                              |
| Last Updated | 2026-06-16                                               |

## TC-UX-MARKET-NEWS-BADGES-001 - News Scope and Tone Are Visible

References:

- `SRS-CONTENT-MARKET-005`: News-affected sectors or assets must be identifiable through badges, borders, colors, trade-value movement, or simple state cues.
- `SRS-STATE-MARKET-004`: Sectors or assets affected by news are shown in the Market Board with badges or simple state.
- `ADR-0016`: News influence should remain visible on the Market Board so Morning News connects to the Intraday screen.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, starts the default Run, selects Day 1 `선취매`, opens Morning News, and approves opening.
- The Intraday state is prepared with selected-sector positive news, same-sector asset negative news, and other-sector negative news.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Activate `개장 승인`.
7. Prepare the active Intraday state with mixed Market Board news effects.
8. Compare the page against the `market-board-news-badges.png` visual baseline.

Expected Result:

- Affected rows show compact pill-style badges such as `섹터호재`, `종목악재`, and `섹터악재`.
- Positive and negative news badges use distinct colors.
- Badge text stays inside the Market Board row without hiding price, change, or VALUE columns.
- The Market Board retains the context scope labels and fictional-only row language.

Automation:

- `npm run test:visual`
- `tests/visual/market-board-news-badges.spec.ts`
