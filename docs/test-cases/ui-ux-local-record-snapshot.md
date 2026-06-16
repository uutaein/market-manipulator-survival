# UI/UX Test Cases - Local Record Snapshot

| Item         | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Feature      | `feature/ui/local_record_snapshot_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                  |
| Status       | Implemented                                           |
| Last Updated | 2026-06-16                                            |

## TC-UX-MENU-RECORD-001 - Local Records Are Scannable

Preconditions:

- Browser localStorage contains valid `mms.recentFinal.v1` and `mms.bestRecord.v1` save envelopes.
- Browser localStorage does not contain an active `mms.currentRun.v1` save.
- The game is opened with `?renderer=canvas`.
- Viewport is `1280x720`.

Steps:

1. Seed localStorage with recent Final Settlement and best-record data.
2. Open the Main Menu.
3. Wait until the Phaser canvas is visible and non-empty.
4. Compare the page against the `main-menu-local-records.png` visual baseline.

Expected Result:

- The local record area shows the recent Final grade and cumulative performance.
- The recent result includes successful Day count and risk context.
- The best record summary shows best grade, best cumulative profit, and final surveillance.
- Free Mode and Contract Mode remain visible as primary new-start choices.
- The local-only fictional safety framing remains visible.

Automation:

- `npm run test:visual`
- `tests/visual/main-menu.spec.ts`
