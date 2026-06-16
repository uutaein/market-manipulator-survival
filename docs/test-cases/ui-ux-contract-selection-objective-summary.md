# UI/UX Test Cases - Contract Selection Objective Summary

| Item         | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| Feature      | `feature/ui/contract_selection_objective_summary_experience.feature` |
| Test Scope   | Playwright visual coverage                                           |
| Status       | Implemented                                                          |
| Last Updated | 2026-06-16                                                           |

## TC-UX-CONTRACT-SELECT-OBJECTIVE-001 - Contract Cards Show Objective Shape

References:

- `SRS-CONTRACT-UI-SELECT-002`: Each contract card shows sponsor style, target asset, duration, objective summary, fixed reward, risk level, and report confidence.
- `SRS-CONTRACT-UI-SELECT-003`: Contract objective summaries must be clear enough for gameplay while avoiding real-world financial procedure language.
- `SRS-CONTRACT-SAFE-003`: User-facing copy uses abstract game terms.
- `ADR-0035`: The first Contract Mode slice includes upward touch, downward touch, band maintain, and defense mandates.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player opens Contract Mode from the Main Menu.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Enter Contract Mode.
3. Wait until the Contract Selection screen is fully rendered.
4. Compare the page against the `contract-selection-objective-summary.png` visual baseline.

Expected Result:

- Every visible contract card shows a concise `목표 ...` line.
- Touch, band, defense, and VALUE/rank objective shapes are distinguishable in the card list.
- Report confidence, reward, duration, risk level, sponsor style, target asset, and accept/return controls remain scannable.
- Objective copy stays in fictional abstract game terms and does not introduce real-world procedure language.

Automation:

- `npm run test:visual`
- `tests/visual/contract-selection-objective-summary.spec.ts`
