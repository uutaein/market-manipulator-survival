# UI/UX Test Cases - Main Menu

| Item | Value |
| --- | --- |
| Feature | `feature/ui/main_menu_experience.feature` |
| Test Scope | Playwright visual and smoke coverage |
| Status | Implemented |
| Last Updated | 2026-06-16 |

## TC-UX-MENU-001 - Primary Mode Choice Is Immediately Scannable

Preconditions:
- Browser localStorage is empty.
- The game is opened with `?renderer=canvas` for deterministic Playwright capture.
- Viewport is `1280x720`.

Steps:
1. Open the Main Menu.
2. Wait until the Phaser canvas is visible and non-empty.
3. Compare the page against the `main-menu.png` visual baseline.

Expected Result:
- The title and desk context are visible in the first viewport.
- `자유모드` and `의뢰모드` appear as the two dominant choices.
- Each mode has a visible start control inside the corresponding mode area.
- Saved-run status is visible but secondary.
- The local-only fictional safety framing remains visible.

Automation:
- `npm run test:visual`
- `tests/visual/main-menu.spec.ts`
