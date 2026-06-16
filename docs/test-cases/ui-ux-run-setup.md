# UI/UX Test Cases - Run Setup

| Item         | Value                                     |
| ------------ | ----------------------------------------- |
| Feature      | `feature/ui/run_setup_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage      |
| Status       | Implemented                               |
| Last Updated | 2026-06-16                                |

## TC-UX-RUN-SETUP-001 - Asset Choice Context Is Scannable

References:

- `ADR-0022`: Run Setup must not directly expose hidden stable/standard/high-risk asset profile labels.
- `ADR-0026`: Sector and asset selection is direct, while detailed asset tendency is learned during the Run.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode from the Main Menu.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Wait until the Run Setup canvas is visible and non-empty.
4. Compare the page against the `run-setup.png` visual baseline.

Expected Result:

- The selected sector and asset appear as a prominent summary near the top.
- Entry recommendations are visible without hiding non-recommended sectors.
- Same-sector assets are presented as comparable cards.
- The selected asset memo includes role, baseline trade value, and news sensitivity.
- Hidden profile traits are labeled as observation targets rather than exposed as pre-Run values.
- The Run start control is visually anchored after the decision context.

Automation:

- `npm run test:visual`
- `tests/visual/run-setup.spec.ts`
