# Source Scaffold

This directory contains the first implementation scaffold for `Market Manipulator Survival`.

Current scope:

1. TypeScript + Phaser 3 + Vite project structure.
2. Minimal Phaser scene shell for the accepted MVP screen flow.
3. Core Run State domain module under `src/domain/`.
4. First playable gameplay simulation wiring is in progress.
5. Cucumber step definitions exist outside `src/` under `feature/steps/`.

The scaffold exists so the next implementation work can attach SPEC/Gherkin-driven behavior to a running browser project.

## Scene Shell

| Scene | Purpose |
| --- | --- |
| `MainMenuScene` | Main Menu shell |
| `RunSetupScene` | Run setup / fictional asset selection shell |
| `MorningBriefingScene` | Morning News / Market Briefing shell |
| `PreOpenCardScene` | Pre-open Card / Opening Approval shell |
| `IntradayScene` | Intraday operation shell with fictional candle/volume chart, live Market Board, tick, manual action, auto card, document event, and Retail Swarm wiring |
| `IntradayRepositionScene` | Intraday desk-reposition flow after full position settlement |
| `DaySettlementScene` | Day Settlement shell |
| `FinalSettlementScene` | Final Settlement summary and failure variant shell |

Document Event is wired as an intraday modal and is not a standalone scene in the MVP SPEC.
Browser localStorage wiring exists for current Run continuation and Final Settlement records.
