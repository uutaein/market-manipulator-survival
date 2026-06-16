# UI/UX Test Cases - Contract Selection

| Item         | Value                                              |
| ------------ | -------------------------------------------------- |
| Feature      | `feature/ui/contract_selection_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage               |
| Status       | Implemented                                        |
| Last Updated | 2026-06-16                                         |

## TC-UX-CONTRACT-001 - Contract Comparison Is Decision-Oriented

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Contract Mode from the Main Menu.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Activate `의뢰모드 시작`.
3. Wait until the Contract Selection canvas is visible and non-empty.
4. Compare the page against the `contract-selection.png` visual baseline.

Expected Result:

- Available contracts are shown as comparable choices.
- The selected contract summary is visually dominant.
- Each contract card shows a concise objective summary.
- Reward, duration, risk, sponsor type, and report confidence are visible before acceptance.
- Expert report hints are grouped with objective context.
- Accept and return controls are separated by intent and placement.

Automation:

- `npm run test:visual`
- `tests/visual/contract-selection.spec.ts`
