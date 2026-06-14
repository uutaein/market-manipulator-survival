# Cucumber Step Definitions

This directory contains TypeScript step definitions for the accepted MVP Gherkin feature files.

## Scope

| File | Domain |
| --- | --- |
| `run.steps.ts` | Run lifecycle, failure routing, same-condition restart, Day 1 onboarding |
| `market.steps.ts` | Asset selection, hidden asset tendencies, Market Board |
| `contract.steps.ts` | Post-MVP Contract Mode acceptance scenarios |
| `preopen.steps.ts` | Morning News, Market Briefing, Pre-open Cards, Opening Approval |
| `intraday.steps.ts` | Timer, tick rules, manual actions, auto cards, document events, Retail Swarm |
| `settlement.steps.ts` | Day Settlement, Final Settlement, holding bands, carryover |
| `persistence.steps.ts` | MVP local persistence and save compatibility |
| `safety.steps.ts` | Fictional content and safety abstraction constraints |

## Current Test Layer

The current steps execute through the shared Cucumber support world in `feature/support/world.ts`.

They are intended to make the accepted Gherkin coverage executable and to catch obvious spec drift. They cover domain-level behavior where wired, but they do not yet exercise rendered Phaser scenes, browser layout, or real browser localStorage.

As implementation progresses, replace broad in-memory checks with module-backed assertions while keeping the same domain grouping.
