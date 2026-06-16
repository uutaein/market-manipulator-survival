# UI/UX Test Cases - Morning Briefing News Scope

| Item         | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Feature      | `feature/ui/morning_briefing_news_scope_experience.feature` |
| Test Scope   | Playwright visual coverage                                  |
| Status       | Implemented                                                 |
| Last Updated | 2026-06-16                                                  |

## TC-UX-BRIEFING-NEWS-SCOPE-001 - News Scope Is Scannable

References:

- `PRD v0.1.5 section 7.1`: Morning News contains one sector news item and two fictional asset news items per Day.
- `PRD v0.1.5 section 7.1`: Non-player asset news appears as Market Board context and badges, but does not directly affect player-asset price calculation.
- `ADR-0005 section 2.5`: The player asset is calculated in detail while non-player assets are simplified context.
- `ADR-0016`: News influence must be visually distinguishable on market context surfaces.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, keeps the default Run Setup choice, selects Day 1 `선취매`, and opens Morning Briefing.
- Morning News is prepared with selected-sector, selected-asset, and same-sector non-player asset targets.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Seed mixed Morning News targets.
6. Activate `아침 뉴스 확인`.
7. Wait for the full Morning Briefing to render.
8. Compare the page against the `morning-briefing-news-scope.png` visual baseline.

Expected Result:

- Selected-sector news is labeled as `내 섹터 영향`.
- Selected-asset news is labeled as `직접 영향`.
- Same-sector non-player asset news is labeled as `동일 섹터 참고`.
- Market Briefing, Today Condition, risk hints, and Opening Approval remain visible.

Automation:

- `npm run test:visual`
- `tests/visual/morning-briefing-news-scope.spec.ts`
