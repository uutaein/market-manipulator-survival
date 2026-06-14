# ADR-0032 — Contract Reward and Scoring

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.0, ADR-0030, ADR-0031 |

## Context

In 자유모드, the player is judged mainly by survival, profit, budget preservation, and surveillance risk.

In 의뢰모드, the sponsor offers a fixed reward for satisfying a contract. The player should be rewarded for achieving the condition efficiently, not for spending unlimited budget to force the chart.

## Decision

Contract reward is fixed at contract acceptance time.

Contract score is based on net efficiency:

```text
 fixed contract reward
- budget spent
- surveillance risk cost
- social cost
- failed objective penalty
- excessive VALUE / MADNESS side-effect penalty
= contract net performance
```

In the first implementation:

1. successful contracts pay the fixed reward;
2. failed contracts do not pay the fixed reward;
3. partial objective progress is shown for feedback, but does not pay by default;
4. efficiency rating is based on net performance, not only success/failure.

## Reward Difficulty Drivers

Fixed reward increases non-linearly when the mandate becomes harder.

Difficulty factors include:

1. distance from current price to target price or band;
2. target band tightness;
3. shorter deadline;
4. longer maintenance requirement;
5. asset influence resistance and baseline trade value;
6. objective direction conflicting with current market mood;
7. rank, VALUE, MADNESS, or surveillance constraints;
8. compound objectives.

Extreme targets may produce geometrically larger rewards. They also increase report credibility risk, surveillance sensitivity, Retail Swarm backlash, and failure probability.

## Consequences

1. The player has a clear reason to use the least necessary budget.
2. High-reward contracts are not automatically optimal because they carry higher execution and risk costs.
3. Contract settlement can show both binary outcome and efficiency grade.
4. Balance can tune reward curves without changing objective evaluation.

## Rejected Alternatives

### Score only by contract success

Rejected. That would make expensive brute-force play too attractive.

### Score only by final budget

Rejected. That ignores surveillance, social cost, and the sponsor's fixed reward structure.

### Pay proportional reward for every partial objective

Rejected for first implementation. It can be revisited after the binary contract loop is fun.

## Follow-up

Balancing should define the first reward curve and efficiency grade thresholds after sample contracts exist.
