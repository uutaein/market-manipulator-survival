# UI/UX Test Cases - Retail Swarm Panel

| Item         | Value                                              |
| ------------ | -------------------------------------------------- |
| Feature      | `feature/ui/retail_swarm_panel_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage               |
| Status       | Implemented                                        |
| Last Updated | 2026-06-16                                         |

## TC-UX-RETAIL-SWARM-001 - Retail Swarm Shows Panic Risk as Abstract Status

References:

- `SRS-CONTENT-SWARM-001`: Retail Swarm synchronizes with personal participation.
- `SRS-CONTENT-SWARM-002`: Higher participation strengthens visible mood, overheat, density, or abstract status expression.
- `SRS-CONTENT-SWARM-003`: Overheated state is shown with warning visuals.
- `SRS-CONTENT-SWARM-004`: Panic state connects to downward pressure.
- `SRS-CONTENT-SWARM-005`: Realistic crowd depiction and complex unit AI are excluded from MVP.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and enters Intraday operation.
- Retail Swarm is prepared in a panic-risk state.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode path through Opening Approval.
3. Prepare the active browser session with high personal participation and panic-risk pressure.
4. Wait until the Intraday canvas is visible and non-empty.
5. Compare the page against the `retail-swarm-panel.png` visual baseline.

Expected Result:

- The panel hides raw internal `MADNESS`, pressure, volatility, surveillance, and liquidity values.
- Panic or overheat state is shown as a distinct abstract warning badge.
- Abstract risk copy explains whether the swarm is stable, warning, or panic without exposing raw deltas.
- Participant average and perceived P/L are readable without realistic crowd depiction.
- The panel uses the selected ant-skin meme mascot sheet for sleeping, curious, hype, or anxious mood states.
- The panel uses abstract status language only and avoids realistic crowd depiction.

Automation:

- `npm run test:visual`
- `tests/visual/retail-swarm-panel.spec.ts`
