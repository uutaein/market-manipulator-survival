# UI/UX Test Cases - Next Day Asset Selection

| Item         | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Feature      | `feature/ui/next_day_asset_selection_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                     |
| Status       | Implemented                                              |
| Last Updated | 2026-06-16                                               |

## TC-UX-NEXT-DAY-ASSET-001 - Continuing Run Context Is Scannable

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player is in Free Mode.
- The player reaches Day Settlement before the final Day with holding ratio at `0%`.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Start a Run and enter the first Intraday screen.
4. Force a non-final Day Settlement state with holding ratio at `0%`.
5. Activate the Day Settlement next action.
6. Wait until the Next Day Asset Selection canvas is visible and non-empty.
7. Compare the page against the `next-day-asset-selection.png` visual baseline.

Expected Result:

- The screen title and top summary communicate that the player is choosing the next Day target, not starting a new Run.
- Sector and asset choices remain visible as comparable options.
- The selected asset memo includes role, baseline trade value, and news sensitivity.
- The Run carryover panel shows preserved budget, cumulative profit, surveillance, social cost, and `0%` holding state.
- The `다음 Day 준비` control is visually anchored after the decision context.

Automation:

- `npm run test:visual`
- `tests/visual/next-day-asset-selection.spec.ts`
