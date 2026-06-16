# UI/UX Test Cases - Contract Briefing Tool Fit

| Item         | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Feature      | `feature/ui/contract_briefing_tool_fit_experience.feature` |
| Test Scope   | Playwright visual coverage                                 |
| Status       | Implemented                                                |
| Last Updated | 2026-06-16                                                 |

## TC-UX-CONTRACT-BRIEF-TOOLS-001 - Contract Briefing Shows Shared Tool Fit

References:

- `SRS-CONTRACT-MODE-003`: Contract Mode reuses the same manual actions, Market Dashboard, VALUE, MADNESS, Retail Swarm, and settlement primitives as Free Mode.
- `SRS-CONTRACT-UI-BRIEF-002`: Contract briefing shows target bandline or threshold, remaining Days, success conditions, fixed reward, risk level, and expert report summary.
- `SRS-CONTRACT-SAFE-003`: User-facing copy uses abstract game terms.
- `ADR-0035`: The first Contract Mode slice reuses existing manual actions and does not add new manual actions.

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
6. Compare the page against the `contract-briefing-tool-fit.png` visual baseline.

Expected Result:

- The Contract Briefing shows recommended shared manual tools for the accepted mandate.
- Risky or conflicting shared manual tools are visible before Opening Approval.
- Tool labels remain abstract game labels such as `유동성 공급`, `매수봇`, and `매도봇`.
- The target asset, remaining Days, fixed reward, risk level, report confidence, target line, expert report, Today condition, and `개장 승인` remain visible.

Automation:

- `npm run test:visual`
- `tests/visual/contract-briefing-tool-fit.spec.ts`
