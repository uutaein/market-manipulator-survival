# UI/UX Test Cases - Auto Card Reward

| Item | Value |
| --- | --- |
| Feature | `feature/ui/auto_card_reward_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-AUTO-REWARD-001 - Auto Card Reward Compares Build Choices

References:
- `SRS-CONTENT-AUTO-001`: Auto cards periodically trigger or provide persistent effects during intraday operation.
- `SRS-CONTENT-AUTO-002`: Auto cards grow only from Lv.1 to Lv.3.
- `SRS-CONTENT-AUTO-003`: Auto card rewards provide up to three choices.
- `SRS-CONTENT-AUTO-004`: Evolution, synergy, rare, and legendary card types are excluded from MVP.

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- An Auto Card Reward popup is open.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with Auto Card Reward choices.
4. Wait until the paused reward popup is visible and the canvas is non-empty.
5. Compare the page against the `auto-card-reward.png` visual baseline.

Expected Result:
- The Intraday screen is dimmed behind the reward popup.
- The popup clearly states that operation is paused until a card choice is selected.
- Up to three choices are displayed as separated cards.
- Each choice exposes new-card or level-up status, next level, trigger period, growth type, and abstract stat effect.
- The copy communicates the Lv.3 cap and does not imply card evolution or synergy.

Automation:
- `npm run test:visual`
- `tests/visual/auto-card-reward.spec.ts`
