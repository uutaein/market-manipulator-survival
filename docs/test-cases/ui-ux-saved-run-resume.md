# UI/UX Test Cases - Saved Run Resume

| Item         | Value                                            |
| ------------ | ------------------------------------------------ |
| Feature      | `feature/ui/saved_run_resume_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage             |
| Status       | Implemented                                      |
| Last Updated | 2026-06-16                                       |

## TC-UX-MENU-SAVE-001 - Saved Run Resume Context Is Scannable

Preconditions:

- Browser localStorage contains a valid `mms.currentRun.v1` save envelope.
- The saved Run is active and includes current Day, fictional target, budget, cumulative profit, surveillance, and holding state.
- The game is opened with `?renderer=canvas`.
- Viewport is `1280x720`.

Steps:

1. Seed localStorage with a valid current Run save.
2. Open the Main Menu.
3. Wait until the Phaser canvas is visible and non-empty.
4. Compare the page against the `main-menu-saved-run.png` visual baseline.

Expected Result:

- The saved-run badge indicates that a Run can be continued.
- A compact resume area shows saved mode, Day, resume entry point, fictional target, budget, cumulative profit, surveillance, and holding state.
- The `저장 Run 이어가기` control is visually grouped with the saved Run context.
- Free Mode and Contract Mode remain visible as primary new-start choices.
- The local-only fictional safety framing remains visible.

Automation:

- `npm run test:visual`
- `tests/visual/main-menu.spec.ts`
