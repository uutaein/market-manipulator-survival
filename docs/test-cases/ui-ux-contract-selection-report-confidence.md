# UI/UX Test Cases - Contract Selection Report Confidence

| Item         | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| Feature      | `feature/ui/contract_selection_report_confidence_experience.feature` |
| Test Scope   | Playwright visual coverage                                           |
| Status       | Implemented                                                          |
| Last Updated | 2026-06-16                                                           |

## TC-UX-CONTRACT-SELECT-CONFIDENCE-001 - Contract Cards Show Report Confidence

References:

- `SRS-CONTRACT-MANDATE-006`: A contract mandate defines sponsor type, direction, risk level, and report confidence.
- `SRS-CONTRACT-REPORT-004`: Expert reports have a confidence value.
- `SRS-CONTRACT-UI-SELECT-002`: Each contract card shows sponsor style, target asset, duration, objective summary, fixed reward, risk level, and report confidence.
- `ADR-0034`: The same target can feel different based on report confidence.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player opens Contract Mode from the Main Menu.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Enter Contract Mode.
3. Wait until the Contract Selection screen is fully rendered.
4. Compare the page against the `contract-selection-report-confidence.png` visual baseline.

Expected Result:

- Every visible contract card shows a `신뢰 NN` report confidence badge.
- The selected contract detail still shows report confidence with reward and sponsor context.
- Reward, duration, risk level, sponsor style, target asset, and accept/return controls remain scannable.
- Confidence is presented as abstract report confidence and does not imply real-world investment advice.

Automation:

- `npm run test:visual`
- `tests/visual/contract-selection-report-confidence.spec.ts`
