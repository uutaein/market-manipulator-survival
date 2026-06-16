# UI/UX Test Cases - Morning Briefing

| Item         | Value                                            |
| ------------ | ------------------------------------------------ |
| Feature      | `feature/ui/morning_briefing_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage             |
| Status       | Implemented                                      |
| Last Updated | 2026-06-16                                       |

## TC-UX-BRIEFING-001 - News Becomes an Opening Decision

References:

- `SRS-FLOW-DAY-001`: Morning News is revealed after the pre-open card choice.
- `SRS-FLOW-DAY-002`: Market Briefing summarizes news effect, target conditions, and major risks.
- `SRS-FLOW-DAY-005`: Opening Approval is required before intraday operation.
- `SRS-CONTENT-NEWS-001`: Each Day shows exactly three Morning News items.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode, starts the default Run, selects Day 1 `선취매`, and opens Morning News.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select `선취매`.
5. Activate `아침 뉴스 확인`.
6. Wait for the full Morning Briefing to render.
7. Compare the page against the `morning-briefing.png` visual baseline.

Expected Result:

- Three Morning News items are visible in one grouped feed.
- Player-impacting and contextual news scopes are labeled distinctly.
- The selected asset briefing includes target band and crash line context.
- The selected pre-open effect is summarized before approval.
- Today Condition and risk hints are visible before opening.
- Opening Approval is placed as the final action, separate from informational panels.

Automation:

- `npm run test:visual`
- `tests/visual/morning-briefing.spec.ts`
