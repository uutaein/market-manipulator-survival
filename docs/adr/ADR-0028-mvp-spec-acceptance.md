# ADR-0028 — MVP SPEC Acceptance

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-13 |
| Related Documents | PRD v0.1.5, MVP Freeze Candidate, SRS v0.1.0~v0.1.6, SDD v0.1.0, MVP SPEC v0.1.0, traceability.md |

## Context

The PRD, ADRs, SRS, and SDD now define the MVP direction, feature scope, core state, first-playable baseline values, and lightweight module boundaries.

The project needs a single implementation-facing scope document before moving to Gherkin feature files, TC documents, and later implementation.

MVP SPEC v0.1.0 consolidates the accepted PRD/SRS/SDD decisions into the first playable build scope.

## Decision

Accept `docs/spec/market-manipulator-survival-mvp-spec-v0.1.0.md` as the first playable MVP SPEC.

This acceptance means:

1. SPEC v0.1.0 defines the first playable build scope.
2. New MVP features are not added by default after this point.
3. New ideas should be recorded as P1/P2 candidates unless required for the first playable loop.
4. SRS v0.1.6 values are accepted as first-playable defaults, not final balance values.
5. Balance quality will be evaluated after a playable build exists.
6. Gherkin feature files come after SPEC acceptance.
7. TC documents come after Gherkin feature files.
8. Implementation and Phaser/Vite scaffolding still require separate explicit approval.

## Acceptance Conditions

The accepted SPEC follows these conditions.

| Condition | Decision |
| --- | --- |
| Scope lock | SPEC features are the first playable MVP scope. |
| No balance freeze | Numeric values are first-playable defaults only. |
| No test docs yet | Gherkin comes next, TC after Gherkin. |
| No implementation yet | SPEC acceptance is not implementation approval. |
| Safety contract | No real companies, stocks, exchanges, market data, news, or real-world procedures. |
| First playable definition | Definition of Done is the SPEC first playable checklist. |
| Traceability | SPEC-scoped features remain linked in `docs/traceability.md`. |
| Deferred scope | Explicit non-scope items remain outside MVP. |

## Consequences

The next documentation step is Gherkin feature creation.

The SPEC can be used to decide whether future suggestions belong in MVP or should be deferred.

Implementation planning may reference the SPEC, but creating a project, writing game code, or adding Phaser/Vite scaffolding requires a separate user decision.

## Alternatives Considered

### Keep SPEC as Candidate

Rejected. The project has enough PRD, SRS, and SDD coverage to define first playable scope.

### Freeze Balance Before Implementation

Rejected. Balance quality cannot be judged reliably until the game is playable.

### Start TC Documents Immediately

Rejected. The agreed order is SPEC acceptance, then Gherkin feature files, then TC documents.

## Follow-up

1. Update SPEC v0.1.0 status to `Accepted`.
2. Update traceability status language to reflect SPEC acceptance.
3. Create Gherkin feature files next.
4. Do not start implementation until separately approved.
