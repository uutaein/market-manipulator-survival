# UI/UX Test Cases - Run Setup Discovery Guard

| Item         | Value                                                     |
| ------------ | --------------------------------------------------------- |
| Feature      | `feature/ui/run_setup_discovery_guard_experience.feature` |
| Test Scope   | Playwright visual coverage                                |
| Status       | Implemented                                               |
| Last Updated | 2026-06-16                                                |

## TC-UX-RUN-SETUP-DISCOVERY-001 - Progressive Asset Discovery Is Explicit

References:

- `PRD v0.1.5 items 45-46`: Internal asset profile values are not directly shown before a Run, and asset tendency is learned through play.
- `ADR-0022`: Stable, standard, and high-risk internal asset types are not shown directly to the player.
- `ADR-0023`: Run-random asset tendencies are inferred through intraday reactions and settlement notes.
- `ADR-0026`: Run Setup lets the player select a sector and asset, while detailed tendency remains hidden.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode from the Main Menu.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Wait until the Run Setup canvas is visible and non-empty.
4. Compare the page against the `run-setup-discovery-guard.png` visual baseline.

Expected Result:

- The selected asset memo separates visible context from hidden traits.
- Visible context is limited to role, baseline trade value, and news response.
- Hidden internal tendency, surveillance sensitivity, and budget efficiency are described as observation targets without exposing numeric values.
- The Run start control remains visually anchored after the memo.

Automation:

- `npm run test:visual`
- `tests/visual/run-setup-discovery-guard.spec.ts`
