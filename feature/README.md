# Gherkin Feature Index

This directory contains Gherkin feature files and TypeScript Cucumber step definitions for the accepted MVP SPEC.

The `.feature` files are grouped by domain and function. They are not TC documents yet. Test case documents should be created after these feature files are reviewed.

## Structure

| Directory | Domain |
| --- | --- |
| `run/` | Run lifecycle, Day flow, failure, onboarding |
| `market/` | Asset selection, hidden asset tendencies, Market Board |
| `preopen/` | Morning News, Market Briefing, Pre-open Cards |
| `intraday/` | Tick simulation, manual actions, auto cards, document events, Retail Swarm |
| `settlement/` | Day/Final Settlement, carryover, aftereffects |
| `persistence/` | localStorage and restart records |
| `safety/` | Fictional safety abstraction requirements |
| `support/` | Shared Cucumber world and accepted MVP constants |
| `steps/` | Domain step definitions for executable Gherkin coverage |

## Running BDD Coverage

```powershell
npm run bdd
```

The current step definitions execute through a Cucumber support world with domain-level behavior coverage. They validate that the accepted MVP Gherkin scenarios are executable, but they do not yet drive rendered Phaser scenes, browser layout, or real browser localStorage.

## Status

These feature files correspond to `docs/spec/market-manipulator-survival-mvp-spec-v0.1.0.md`, which is accepted as the first playable MVP SPEC.

Feature rows and step source rows are linked from `docs/traceability.md`.
