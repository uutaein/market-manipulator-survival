# ADR-0034 — Contract Mode Expert Report

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.0, ADR-0030, ADR-0031, ADR-0033 |

## Context

In 자유모드, `종목분석` is a pre-open card that strengthens buy/sell bot effects.

In 의뢰모드, the player needs a way to create narrative justification near the sponsor's target band without directly exposing or guaranteeing the sponsor's actual mandate.

## Decision

In 의뢰모드, the `종목분석` concept is presented as **전문가 리포트**.

The expert report:

1. suggests a plausible price range or directional thesis near the contract target;
2. does not reveal the exact sponsor objective as a mechanical instruction;
3. can support upward, downward, range, and defense mandates;
4. has a credibility or confidence value;
5. affects Retail Swarm expectation, MADNESS, VALUE attention, and surveillance risk through abstract game stats.

## Report Behavior

A report can be:

1. upward: supports a higher valuation range;
2. downward: supports a lower valuation range;
3. range-bound: supports a price band;
4. defensive: supports a floor or ceiling.

High-confidence reports make the market reaction smoother and can reduce risk cost. Low-confidence reports may still move attention, but they should raise surveillance, social cost, volatility, or backlash risk.

The more unrealistic the sponsor target is, the lower the default report confidence should be.

## UI Copy Rules

Expert report copy must:

1. use fictional assets and sectors only;
2. use abstract terms such as "band", "range", "desk estimate", "scenario", and "confidence";
3. avoid real analyst-report language that looks like real investment advice;
4. avoid procedural instructions for real market manipulation.

## Consequences

1. 의뢰모드 can reuse the pre-open card slot while changing its meaning.
2. The player gets a soft tool for shaping crowd expectations.
3. Contract targets can be hinted without becoming a rote instruction.
4. The same target can feel different based on report confidence.

## Rejected Alternatives

### Keep the exact `종목분석` behavior in contract mode

Rejected. It does not express the sponsor-contract fantasy clearly enough.

### Show the exact sponsor target as the expert report

Rejected. The report should create plausible cover and market expectation, not simply repeat the objective.

## Follow-up

The first implementation can start with small numeric effects and simple templated copy, then tune confidence and market reaction later.
