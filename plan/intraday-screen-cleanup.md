# Intraday Screen Cleanup Plan

## Goal

Improve the Intraday operation screen so the document-event and auto-card popups feel stable, the main play surface is easier to scan, and the chart remains the visual focus.

## Scope

1. Rework modal presentation:
   - add a dimmed backdrop,
   - center the popup reliably,
   - improve title/body/choice spacing,
   - hide DOM overlays while modal UI is active.

2. Rebalance the Intraday layout:
   - keep chart and order book as the left-side focus,
   - keep market board tables on the right,
   - move always-important money/position feedback into a compact readable block,
   - keep manual actions and settlement controls above the frame edge.

3. Reduce text clutter:
   - group debug-style stats into compact lines,
   - keep budget, P/L, price, average entry, held units, and timer prominent,
   - avoid overlapping UI text at 1280x720.

4. Improve readable feedback:
   - show the average entry line on the price chart,
   - make the top P/L badge less visually noisy,
   - render Retail Swarm as PEPE-style participant tokens while preserving state border colors.

5. Verify:
   - run typecheck, BDD, and build,
   - inspect the screen in the browser,
   - capture the modal and normal Intraday states.

## Out of Scope

- New mechanics.
- New content.
- Formula tuning.
- Replacing Phaser scenes or the chart library.
- Full visual redesign of non-Intraday screens.
