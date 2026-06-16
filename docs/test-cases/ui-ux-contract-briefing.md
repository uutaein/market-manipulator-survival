# UI/UX Test Cases - Contract Briefing

| Item         | Value                                             |
| ------------ | ------------------------------------------------- |
| Feature      | `feature/ui/contract_briefing_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage              |
| Status       | Implemented                                       |
| Last Updated | 2026-06-16                                        |

## TC-UX-CONTRACT-BRIEF-001 - Contract Briefing Restates Mandate Before Intraday

References:

- `SRS-CONTRACT-UI-BRIEF-001`: Contract Mode shows contract briefing before the first intraday session.
- `SRS-CONTRACT-UI-BRIEF-002`: Contract briefing shows target bandline or threshold, remaining Days, success conditions, fixed reward, risk level, and expert report summary.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player has accepted a Contract Mode mandate.
- The player has completed the first Pre-open Card selection.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Enter Contract Mode.
3. Accept a sample mandate.
4. Complete the first Pre-open Card selection.
5. Wait until the Contract Mode Morning Briefing is fully rendered.
6. Compare the page against the `contract-briefing.png` visual baseline.

Expected Result:

- The page is labeled as a contract briefing before the first intraday session.
- The target asset, remaining Days, fixed reward, risk level, and report confidence are visible.
- The target threshold or bandline is visible.
- Success conditions and expert report summary are visible.
- Recommended and risky shared manual tools are visible before Opening Approval.
- Morning news, today condition, risk hints, and `개장 승인` remain available.

Automation:

- `npm run test:visual`
- `tests/visual/contract-briefing.spec.ts`
