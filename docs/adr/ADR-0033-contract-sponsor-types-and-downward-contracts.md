# ADR-0033 — Contract Sponsor Types and Downward Contracts

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.0, ADR-0030, ADR-0031, ADR-0032 |

## Context

의뢰모드 should support more than upward price targets. A sponsor may want price rise, price decline, range control, defense, attention, or stealth.

Downward contracts are especially important because they force the player to use the same tools differently. Strong sell pressure can create VALUE, MADNESS, and rebound demand, so a downward mandate should not be solved by repeatedly pressing one button.

## Decision

The first contract sponsor types are:

1. `long_holder`
2. `short_seller`
3. `accumulator`
4. `defender`
5. `pump_exit`

The first contract directions are:

1. `upward`
2. `downward`
3. `range`
4. `defense`
5. `attention`
6. `stealth`

Downward contracts are first-class objectives. They can use `touch`, `close_below`, `never_break`, `maintain`, and compound objectives.

## Sponsor Intent

| Sponsor Type | Intent | Typical Objectives |
| --- | --- | --- |
| `long_holder` | Needs favorable high-price conditions | upward touch, high close, upper band |
| `short_seller` | Benefits from lower prices | downward touch, low close, upper break prevention |
| `accumulator` | Wants price suppressed while accumulating | range below threshold, overheat prevention |
| `defender` | Needs a floor defended | lower threshold defense, close above |
| `pump_exit` | Wants attention and a sellable high-price window | touch, VALUE rank, maintain after touch |

## Downward Contract Risks

Downward contracts must model counter-pressure:

1. rapid drops can trigger rebound demand;
2. high VALUE rank can attract bargain hunters or momentum watchers;
3. high MADNESS can let Retail Swarm absorb settlement pressure;
4. low liquidity makes price movement easier but increases volatility and surveillance risk;
5. a credible expert report can reduce the risk cost of a move, but a low-credibility report can amplify it.

## Consequences

1. Existing manual actions are context-sensitive in contract mode.
2. `매도봇` and `포지션 정리` are useful but risky in downward contracts.
3. `유동성 공급` may be useful defensively, even in downward or range contracts.
4. Contract design can create varied puzzles without adding many new buttons.

## Rejected Alternatives

### Support only upward contracts in v0.2.0

Rejected. It would make 의뢰모드 too similar to 자유모드.

### Add a dedicated short-selling action immediately

Rejected for first implementation. The current goal is to reuse existing tools and make objective context change their value.

## Safety

Downward contracts must stay fictional and abstract. UI copy must not explain real short-selling mechanics, real market tactics, or real-world execution patterns.

## Follow-up

SRS should specify how downward pressure interacts with MADNESS, VALUE rank, and Retail Swarm using existing game terms.
