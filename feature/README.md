# Gherkin Feature Index

This directory contains Gherkin feature files for the accepted MVP SPEC.

The files are grouped by domain and function. They are not TC documents yet. Test case documents should be created after these feature files are reviewed.

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

## Status

These feature files correspond to `docs/spec/market-manipulator-survival-mvp-spec-v0.1.0.md`, which is accepted as the first playable MVP SPEC.

Feature rows are linked from `docs/traceability.md`.
