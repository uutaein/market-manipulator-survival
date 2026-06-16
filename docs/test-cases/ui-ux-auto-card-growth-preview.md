# UI/UX Test Cases - Auto Card Growth Preview

| Item         | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Feature      | `feature/ui/auto_card_growth_preview_experience.feature` |
| Test Scope   | Playwright visual coverage                               |
| Status       | Implemented                                              |
| Last Updated | 2026-06-16                                               |

## TC-UX-AUTO-GROWTH-001 - Auto Card Reward Shows Growth Delta

References:

- `SRS-CONTENT-AUTO-002`: Auto cards can grow only from Lv.1 to Lv.3.
- `SRS-CONTENT-AUTO-003`: Auto card rewards provide up to three choices.
- `SRS-CONTENT-AUTO-004`: Evolution, synergy, rare, and legendary card types are excluded from MVP.
- `SRS-BASE-AUTO-001`: Auto card reward choices pause intraday time.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- An Auto Card Reward popup is open with a period-growth level-up card, an effect-growth level-up card, and a new card.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with mixed Auto Card Reward choices.
4. Wait until the paused reward popup is visible and the canvas is non-empty.
5. Compare the page against the `auto-card-growth-preview.png` visual baseline.

Expected Result:

- The popup remains visibly paused above the dimmed Intraday screen.
- The period-growth level-up choice shows current level to next level and current period to next period.
- The effect-growth level-up choice shows current level to next level and current effect scale to next effect scale.
- The new-card choice shows starting level, trigger period, and growth type.
- The next-level abstract stat effect is shown without implying non-MVP evolution, rarity, or synergy.

Automation:

- `npm run test:visual`
- `tests/visual/auto-card-growth-preview.spec.ts`
