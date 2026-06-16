# UI/UX Test Cases - Intraday Desk Reposition

| Item         | Value                                               |
| ------------ | --------------------------------------------------- |
| Feature      | `feature/ui/intraday_reposition_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                |
| Status       | Implemented                                         |
| Last Updated | 2026-06-16                                          |

## TC-UX-REPOSITION-001 - Re-entry Decision Is Scannable

References:

- `SRS-BASE-ACTION-006`: If repeated `포지션 정리` actions reduce holding ratio to 0 and no manual action is executing, the player may use intraday desk reposition to choose a new fictional sector/asset while preserving Run/Day risk state.
- `PRD v0.1.5`: The player can use `포지션 정리` as the core manual action for recovering budget and managing holding risk.
- `ADR-0029`: First playable uses fictional assets and keeps Day-local operation abstract rather than realistic market procedure.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and reaches Intraday operation.
- The intraday state has holding ratio `0`, no active manual action effects, enough budget for re-entry, and time remaining.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `자유모드 시작`.
3. Activate `Run 시작`.
4. Select Day 1 `선취매`, open Morning Briefing, and approve opening.
5. Seed a zero-holding intraday state with no active manual action effects.
6. Activate `데스크 재배치`.
7. Compare the page against the `intraday-reposition-desk.png` visual baseline.

Expected Result:

- The screen shows that re-entry is available because holding is `0%` and no manual action is executing.
- Sector choices and asset choices are visibly separated.
- The selected asset brief includes role, baseline trade value, and news sensitivity.
- Re-entry cost, starting holding, remaining budget, and preserved risk state are visible before confirmation.
- The player can either confirm re-entry or cancel back to intraday operation.

Automation:

- `npm run test:visual`
- `tests/visual/intraday-reposition.spec.ts`
