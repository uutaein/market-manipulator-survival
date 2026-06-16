# UI/UX Test Cases - Opening Approval Stamp

| Item         | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Feature      | `feature/ui/opening_approval_stamp_experience.feature` |
| Test Scope   | Playwright visual and smoke coverage                   |
| Status       | Implemented                                            |
| Last Updated | 2026-06-16                                             |

## TC-UX-OPENING-STAMP-001 - Approval Stamp Anchors Intraday Entry

References:

- `PRD v0.1.4 section 7.3`: Opening Approval is the final mandatory pre-open action.
- `ADR-0005 section 2.4`: Players enter Intraday through approval button or opening stamp.
- `ADR-0007 section 3.4`: Opening Approval carries the document/stamp feel.
- `ADR-0010`: Opening Approval or stamp action is required before Intraday.
- `FEAT-010`: Opening approval / stamp action.

Preconditions:

- Browser localStorage is empty.
- The game is opened with `?renderer=canvas`.
- The player starts Free Mode and reaches Morning Briefing after a pre-open choice.
- Viewport is `1280x720`.

Steps:

1. Open the Main Menu.
2. Complete the Free Mode setup and pre-open choice.
3. Wait until the full Morning Briefing is rendered.
4. Compare the page against the `opening-approval-stamp.png` visual baseline.

Expected Result:

- Opening Approval is separated from the briefing panels as a bottom-right approval docket.
- The approval control includes `OPENING STAMP`, `[ 개장 승인 ]`, and a stamp-like `승인` mark.
- The control states that review is complete and Intraday operation will begin.
- The approval hit area remains the primary next action into Intraday.

Automation:

- `npm run test:visual`
- `tests/visual/opening-approval-stamp.spec.ts`
