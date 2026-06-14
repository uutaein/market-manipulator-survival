# Documentation Index

This directory contains the product, requirement, decision, and design documents for `Market Manipulator Survival`.

## Structure

| Directory | Purpose |
| --- | --- |
| `adr/` | Architecture Decision Records and product-scope decisions |
| `prd/` | Product requirements, PRD versions, and MVP freeze candidate |
| `srs/` | Software requirements documents |
| `sdd/` | Software design documents |
| `spec/` | Implementation-facing specifications |

## Traceability

| Document | Purpose |
| --- | --- |
| [traceability.md](traceability.md) | Links PRD/ADR decisions to SRS requirements, Gherkin features, future test cases, and status. |
| [../feature/README.md](../feature/README.md) | Root Gherkin feature and Cucumber step index grouped by domain and function. |

## Current Baseline

| Type | Document |
| --- | --- |
| Post-MVP PRD | [market-manipulator-survival-prd-v0.2.4.md](prd/market-manipulator-survival-prd-v0.2.4.md) |
| Post-MVP PRD | [market-manipulator-survival-prd-v0.2.3.md](prd/market-manipulator-survival-prd-v0.2.3.md) |
| Post-MVP PRD | [market-manipulator-survival-prd-v0.2.2.md](prd/market-manipulator-survival-prd-v0.2.2.md) |
| Post-MVP PRD | [market-manipulator-survival-prd-v0.2.1.md](prd/market-manipulator-survival-prd-v0.2.1.md) |
| Post-MVP PRD | [market-manipulator-survival-prd-v0.2.0.md](prd/market-manipulator-survival-prd-v0.2.0.md) |
| MVP Baseline PRD | [market-manipulator-survival-prd-v0.1.5.md](prd/market-manipulator-survival-prd-v0.1.5.md) |
| Freeze | [market-manipulator-survival-mvp-freeze-candidate.md](prd/market-manipulator-survival-mvp-freeze-candidate.md) |
| SRS | [market-manipulator-survival-srs-v0.1.0-core-game-state.md](srs/market-manipulator-survival-srs-v0.1.0-core-game-state.md) |
| SRS | [market-manipulator-survival-srs-v0.1.1-tick-price-formula.md](srs/market-manipulator-survival-srs-v0.1.1-tick-price-formula.md) |
| SRS | [market-manipulator-survival-srs-v0.1.2-run-flow-and-screens.md](srs/market-manipulator-survival-srs-v0.1.2-run-flow-and-screens.md) |
| SRS | [market-manipulator-survival-srs-v0.1.3-content-and-interactions.md](srs/market-manipulator-survival-srs-v0.1.3-content-and-interactions.md) |
| SRS | [market-manipulator-survival-srs-v0.1.4-settlement-carryover-persistence.md](srs/market-manipulator-survival-srs-v0.1.4-settlement-carryover-persistence.md) |
| SRS Review | [market-manipulator-survival-srs-v0.1.5-freeze-readiness-review.md](srs/market-manipulator-survival-srs-v0.1.5-freeze-readiness-review.md) |
| SRS | [market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md](srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md) |
| Post-MVP SRS | [market-manipulator-survival-srs-v0.2.0-contract-mode.md](srs/market-manipulator-survival-srs-v0.2.0-contract-mode.md) |
| Post-MVP SRS | [market-manipulator-survival-srs-v0.2.1-order-book-wall-interactions.md](srs/market-manipulator-survival-srs-v0.2.1-order-book-wall-interactions.md) |
| Post-MVP SRS | [market-manipulator-survival-srs-v0.2.2-local-synthetic-execution-engine.md](srs/market-manipulator-survival-srs-v0.2.2-local-synthetic-execution-engine.md) |
| Post-MVP SRS | [market-manipulator-survival-srs-v0.2.3-order-book-wall-decay.md](srs/market-manipulator-survival-srs-v0.2.3-order-book-wall-decay.md) |
| Post-MVP SRS | [market-manipulator-survival-srs-v0.2.4-order-book-wall-visual-feedback.md](srs/market-manipulator-survival-srs-v0.2.4-order-book-wall-visual-feedback.md) |
| SDD | [market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md](sdd/market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md) |
| SPEC | [market-manipulator-survival-mvp-spec-v0.1.0.md](spec/market-manipulator-survival-mvp-spec-v0.1.0.md) |
| Implementation Scaffold | [../src/README.md](../src/README.md) |
| Domain Modules | [../src/domain/README.md](../src/domain/README.md) |
| BDD Coverage | [../feature/README.md](../feature/README.md) |

## ADRs

ADR files are stored in [`adr/`](adr/).  
The MVP baseline PRD, MVP Freeze Candidate, and MVP SPEC reference ADR-0001 through ADR-0029.
The Post-MVP PRD references ADR-0030 through ADR-0035 for 자유모드 / 의뢰모드 scope, ADR-0036 for order-book wall interactions, ADR-0037 for the local synthetic execution engine, and ADR-0038 for order-book wall decay.
