# ADR-0035 — Contract Mode First Implementation Scope

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.0, ADR-0030, ADR-0031, ADR-0032, ADR-0033, ADR-0034 |

## Context

의뢰모드 can become large quickly: many sponsor types, objective combinations, reports, rewards, settlement screens, and new balance rules.

The first implementation should prove that contract objectives are fun while reusing the existing MVP engine.

## Decision

The first implementation of 의뢰모드 is limited to a thin playable slice.

It should include:

1. mode selection between 자유모드 and 의뢰모드;
2. contract selection with at least 4 sample mandates;
3. objective tracking for price, band, close, VALUE, or rank as needed by those samples;
4. expert report presentation in place of contract-mode `종목분석`;
5. contract progress tracker during play;
6. contract settlement with success/failure, fixed reward, cost, risk, and net performance;
7. reuse of existing manual actions, MADNESS, VALUE, Retail Swarm, Market Dashboard, and settlement primitives.

## Required Sample Mandates

The first contract set should include at least:

1. upward touch contract;
2. downward touch contract;
3. band maintain contract;
4. defense contract.

Optional fifth sample:

1. touch-then-maintain contract with VALUE or rank pressure.

## Out of Scope

The first implementation does not require:

1. new manual actions;
2. full story campaign;
3. complex sponsor relationship progression;
4. partial reward economy;
5. online ranking;
6. new real-time simulation for all 24 assets;
7. real-world financial data or real financial terminology.

## Consequences

1. Implementation can start with objective and settlement domain logic before adding large content.
2. Existing game balance remains relevant.
3. Downward and range contracts can be tested early.
4. The team can decide later whether to add new tools after proving that objective-driven play works.

## Rejected Alternatives

### Build the full contract campaign immediately

Rejected. It would expand content and state scope before the objective model is validated.

### Add many new buttons before testing contracts

Rejected. The first design goal is to make existing tools strategically different under new objectives.

## Follow-up

After the thin slice is playable, evaluate whether contract mode needs new tools, new event types, or a longer campaign structure.
