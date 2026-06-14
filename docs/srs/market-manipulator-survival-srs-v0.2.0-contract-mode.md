# SRS v0.2.0 — Contract Mode

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | Post-MVP Contract Mode requirements |
| Version | v0.2.0 |
| Status | Draft / Implementation Ready Slice |
| Date | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.2.0.md |
| Baseline ADRs | ../adr/ADR-0030-contract-mode-game-mode-split.md through ../adr/ADR-0035-contract-mode-first-implementation-scope.md |
| MVP Baseline | Git tag `v0.1.0-mvp` |

This document translates PRD v0.2.0 and ADR-0030 through ADR-0035 into software requirements for Contract Mode.

Contract Mode is a post-MVP feature. It must not redefine the MVP baseline. The current MVP loop becomes `free` mode. Contract Mode adds a second top-level mode that reuses the same fictional market engine but changes setup, objectives, progress tracking, and settlement.

All requirements in this document use fictional market data and abstract game terms only. They must not introduce real companies, real tickers, real exchanges, real market data, real news, or actionable real-world financial-crime procedures.

---

## 1. Mode Model

The game must support a top-level mode value.

```ts
type GameMode = "free" | "contract";
```

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-MODE-001 | The application must represent the selected game mode as explicit state. |
| SRS-CONTRACT-MODE-002 | `free` mode must preserve the existing `v0.1.0-mvp` 5-Day Run behavior unless a separate accepted change modifies shared systems. |
| SRS-CONTRACT-MODE-003 | `contract` mode must use the same fictional asset catalog, intraday price engine, manual actions, Market Dashboard, VALUE, MADNESS, Retail Swarm, and settlement primitives as `free` mode. |
| SRS-CONTRACT-MODE-004 | `contract` mode must add contract setup, objective tracking, expert report presentation, and contract settlement. |
| SRS-CONTRACT-MODE-005 | Mode-specific state must be optional or versioned so older `free` mode saves can be discarded or migrated safely. |

---

## 2. Contract Mandate Model

Contract Mode begins from a contract mandate.

```ts
type ContractSponsorType =
  | "long_holder"
  | "short_seller"
  | "accumulator"
  | "defender"
  | "pump_exit";

type ContractDirection =
  | "upward"
  | "downward"
  | "range"
  | "defense"
  | "attention"
  | "stealth";

type ContractMandate = {
  id: string;
  displayName: string;
  sponsorType: ContractSponsorType;
  direction: ContractDirection;
  assetId: string;
  durationDays: number;
  objectives: ContractObjective[];
  fixedReward: number;
  riskLevel: number;
  reportConfidence: number;
};
```

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-MANDATE-001 | A contract mandate must specify one target asset. |
| SRS-CONTRACT-MANDATE-002 | A contract mandate must specify a duration in Days. |
| SRS-CONTRACT-MANDATE-003 | The first implementation must support contract durations from 1 to 5 Days. |
| SRS-CONTRACT-MANDATE-004 | A contract mandate must include at least one objective. |
| SRS-CONTRACT-MANDATE-005 | A contract mandate must define a fixed reward at acceptance time. |
| SRS-CONTRACT-MANDATE-006 | A contract mandate must define sponsor type, direction, risk level, and report confidence. |
| SRS-CONTRACT-MANDATE-007 | Contract data must be seedable or deterministic enough for same-condition restart. |
| SRS-CONTRACT-MANDATE-008 | Sponsor type and direction are gameplay labels. UI text must not describe real-world financial techniques. |

---

## 3. Objective Model

Contract objectives are period-based. They are evaluated from intraday and Day settlement observations.

```ts
type ContractObjective =
  | { type: "touch"; targetPrice: number; deadlineDay: number }
  | { type: "maintain"; lowerPrice: number; upperPrice: number; requiredDays: number }
  | { type: "close_above"; targetPrice: number; day: number }
  | { type: "close_below"; targetPrice: number; day: number }
  | { type: "close_inside_band"; lowerPrice: number; upperPrice: number; day: number }
  | { type: "never_break"; lowerPrice?: number; upperPrice?: number; durationDays: number }
  | { type: "rank"; maxRank: number; deadlineDay: number }
  | { type: "value"; minValue: number; deadlineDay: number }
  | {
      type: "touch_then_maintain";
      targetPrice: number;
      touchDeadlineDay: number;
      lowerPrice: number;
      upperPrice: number;
      maintainDays: number;
    };
```

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-OBJ-001 | The first implementation must support `touch`, `maintain`, `close_above`, `close_below`, `close_inside_band`, `never_break`, `rank`, `value`, and `touch_then_maintain` objective types. |
| SRS-CONTRACT-OBJ-002 | A contract succeeds only when all required objectives pass. |
| SRS-CONTRACT-OBJ-003 | Partial objective progress must be visible in settlement feedback but must not pay the fixed reward in the first implementation. |
| SRS-CONTRACT-OBJ-004 | Objective evaluation must be deterministic from recorded observations. |
| SRS-CONTRACT-OBJ-005 | Objective evaluation must not depend on rendering frame rate. |
| SRS-CONTRACT-OBJ-006 | Objective evaluation must use fictional game prices, fictional VALUE, and game-local rank data only. |

---

## 4. Observation Log

Contract Mode needs a small observation stream so objective evaluation does not depend on UI state.

```ts
type ContractObservation = {
  day: number;
  elapsedSec: number | null;
  price: number;
  priceChangePercent: number;
  marketDashboardRank: number | null;
  marketDashboardValue: number;
  madness: number;
  surveillance: number;
  kind: "intraday_tick" | "day_close" | "contract_event";
};
```

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-OBS-001 | Contract Mode must record observations during intraday ticks or at a stable sampling interval. |
| SRS-CONTRACT-OBS-002 | Contract Mode must record a Day-close observation for each contract Day. |
| SRS-CONTRACT-OBS-003 | Observations must include price, price change percent, dashboard rank, dashboard VALUE, MADNESS, and surveillance. |
| SRS-CONTRACT-OBS-004 | The objective evaluator must read observations from domain state, not from DOM text. |
| SRS-CONTRACT-OBS-005 | Observation storage should be bounded. The first implementation may keep only per-Day high, low, close, max VALUE, best rank, max MADNESS, and break flags when full tick logs are unnecessary. |

---

## 5. Objective Evaluation Rules

### 5.1 Price Touch

`touch` passes when the tracked asset reaches the target price before or on the deadline Day.

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-EVAL-TOUCH-001 | Upward touch must pass when any observation price is greater than or equal to the target price. |
| SRS-CONTRACT-EVAL-TOUCH-002 | Downward touch must pass when any observation price is less than or equal to the target price. |
| SRS-CONTRACT-EVAL-TOUCH-003 | The evaluator must infer touch direction from objective metadata or target relation to the contract start price. |

### 5.2 Maintain

`maintain` passes when the asset satisfies the requested band for the required number of Days.

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-EVAL-MAINTAIN-001 | The first implementation must count a Day as maintained when its Day-close price is inside the target band. |
| SRS-CONTRACT-EVAL-MAINTAIN-002 | If a `never_break` objective is attached separately, any intraday threshold break must still fail that objective even if the Day close returns inside the band. |
| SRS-CONTRACT-EVAL-MAINTAIN-003 | The UI must show maintained Day count and required Day count. |

### 5.3 Close Conditions

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-EVAL-CLOSE-001 | `close_above` must evaluate against the specified Day close. |
| SRS-CONTRACT-EVAL-CLOSE-002 | `close_below` must evaluate against the specified Day close. |
| SRS-CONTRACT-EVAL-CLOSE-003 | `close_inside_band` must evaluate against the specified Day close. |

### 5.4 Never Break

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-EVAL-BREAK-001 | `never_break` must fail if any observation crosses the forbidden lower or upper threshold during its duration. |
| SRS-CONTRACT-EVAL-BREAK-002 | A failed `never_break` objective must stay failed even if price later re-enters the acceptable band. |

### 5.5 Rank and VALUE

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-EVAL-RANK-001 | `rank` must evaluate using Market Dashboard rank observations. |
| SRS-CONTRACT-EVAL-RANK-002 | `value` must evaluate using cumulative Market Dashboard VALUE observations. |
| SRS-CONTRACT-EVAL-RANK-003 | The first implementation may evaluate rank and VALUE at deadline Day close unless the objective explicitly requires any-time achievement. |

### 5.6 Touch Then Maintain

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-EVAL-COMPOUND-001 | `touch_then_maintain` must first require touch by `touchDeadlineDay`. |
| SRS-CONTRACT-EVAL-COMPOUND-002 | Maintenance counting must start only after the touch has occurred. |
| SRS-CONTRACT-EVAL-COMPOUND-003 | If the touch never occurs, the compound objective must fail regardless of later close prices. |

---

## 6. Contract Reward and Settlement

Contract Mode uses fixed rewards and efficiency scoring.

```text
 fixed contract reward
- budget spent
- surveillance risk cost
- social cost
- failed objective penalty
- excessive VALUE / MADNESS side-effect penalty
= contract net performance
```

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-SCORE-001 | Contract fixed reward must be set before contract start and must not change during execution. |
| SRS-CONTRACT-SCORE-002 | Successful contracts must pay the fixed reward. |
| SRS-CONTRACT-SCORE-003 | Failed contracts must not pay the fixed reward in the first implementation. |
| SRS-CONTRACT-SCORE-004 | Contract settlement must display fixed reward, budget spent, surveillance cost, social cost, side-effect penalties, and net performance. |
| SRS-CONTRACT-SCORE-005 | Contract settlement must display each objective's pass/fail/progress state. |
| SRS-CONTRACT-SCORE-006 | Contract Mode must grade efficiency separately from binary success. |
| SRS-CONTRACT-SCORE-007 | Reward calculation must be data-driven enough for balancing without changing objective evaluator logic. |

### 6.1 Reward Difficulty Inputs

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-REWARD-001 | Reward generation must consider target distance from starting price. |
| SRS-CONTRACT-REWARD-002 | Reward generation must consider band tightness. |
| SRS-CONTRACT-REWARD-003 | Reward generation must consider deadline length and maintenance duration. |
| SRS-CONTRACT-REWARD-004 | Reward generation must consider asset influence resistance or baseline trade value. |
| SRS-CONTRACT-REWARD-005 | Reward generation must increase non-linearly for extreme targets. |
| SRS-CONTRACT-REWARD-006 | Extreme targets must also increase report credibility risk, surveillance sensitivity, or side-effect risk. |

---

## 7. Sponsor Types and Downward Contracts

Contract Mode must support both upward and downward price mandates.

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-SPONSOR-001 | The first implementation must support sponsor types `long_holder`, `short_seller`, `accumulator`, `defender`, and `pump_exit` as data labels. |
| SRS-CONTRACT-SPONSOR-002 | The first implementation must support directions `upward`, `downward`, `range`, `defense`, `attention`, and `stealth` as data labels. |
| SRS-CONTRACT-SPONSOR-003 | Downward contracts must be valid contract samples. |
| SRS-CONTRACT-SPONSOR-004 | Downward contracts must be able to use `touch`, `close_below`, `never_break`, `maintain`, or `touch_then_maintain`. |
| SRS-CONTRACT-SPONSOR-005 | Downward contracts must model counter-pressure from VALUE rank, MADNESS, rebound demand, or Retail Swarm using existing fictional stats. |
| SRS-CONTRACT-SPONSOR-006 | UI copy must not describe real short-selling mechanics or real market tactics. |

---

## 8. Expert Report

In Contract Mode, the `종목분석` concept becomes `전문가 리포트`.

```ts
type ExpertReport = {
  direction: ContractDirection;
  lowerPrice?: number;
  upperPrice?: number;
  targetPriceHint?: number;
  confidence: number;
  summary: string;
};
```

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-REPORT-001 | Contract Mode must display `전문가 리포트` instead of `종목분석` when the report feature is active. |
| SRS-CONTRACT-REPORT-002 | Expert reports must hint at a plausible range or direction near the contract target without simply repeating the exact objective text. |
| SRS-CONTRACT-REPORT-003 | Expert reports must support upward, downward, range, and defense scenarios. |
| SRS-CONTRACT-REPORT-004 | Expert reports must have a confidence value. |
| SRS-CONTRACT-REPORT-005 | Lower report confidence must increase risk through surveillance, volatility, social cost, or weaker market response. |
| SRS-CONTRACT-REPORT-006 | Expert report copy must use fictional and abstract language. |
| SRS-CONTRACT-REPORT-007 | Expert report effects should be small in the first implementation and playtest-tunable. |

---

## 9. UI and Screens

### 9.1 Main Menu

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-UI-MENU-001 | Main Menu must expose `자유모드` and `의뢰모드` entry points. |
| SRS-CONTRACT-UI-MENU-002 | Selecting `자유모드` must start or continue the existing MVP flow. |
| SRS-CONTRACT-UI-MENU-003 | Selecting `의뢰모드` must route to contract selection. |

### 9.2 Contract Selection

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-UI-SELECT-001 | Contract selection must show at least 4 sample contracts in the first implementation. |
| SRS-CONTRACT-UI-SELECT-002 | Each contract card must show sponsor style, target asset, duration, objective summary, fixed reward, risk level, and report confidence. |
| SRS-CONTRACT-UI-SELECT-003 | Contract objective summaries must be clear enough for gameplay but must avoid real-world financial procedure language. |

### 9.3 Contract Briefing

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-UI-BRIEF-001 | Contract Mode must show contract briefing before the first intraday session. |
| SRS-CONTRACT-UI-BRIEF-002 | Contract briefing must show target bandline or threshold, remaining Days, success conditions, fixed reward, risk level, and expert report summary. |

### 9.4 Intraday Tracker

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-UI-TRACK-001 | Intraday UI must show a contract objective tracker. |
| SRS-CONTRACT-UI-TRACK-002 | Price objectives must render target line or bandline overlays on the player chart where practical. |
| SRS-CONTRACT-UI-TRACK-003 | Tracker must show touch status, maintain progress, close target, rank/VALUE target, and fail states when relevant. |
| SRS-CONTRACT-UI-TRACK-004 | Tracker must show estimated contract net performance or cost pressure. |

### 9.5 Contract Settlement

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-UI-SETTLE-001 | Day Settlement must include contract progress when in Contract Mode. |
| SRS-CONTRACT-UI-SETTLE-002 | Final Contract Settlement must show contract success/failure. |
| SRS-CONTRACT-UI-SETTLE-003 | Final Contract Settlement must show each objective result, fixed reward, budget spent, risk costs, net performance, and efficiency grade. |

---

## 10. First Implementation Scope

The first Contract Mode implementation is a thin playable slice.

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-SLICE-001 | The first implementation must include mode selection. |
| SRS-CONTRACT-SLICE-002 | The first implementation must include contract selection. |
| SRS-CONTRACT-SLICE-003 | The first implementation must include at least one upward touch contract. |
| SRS-CONTRACT-SLICE-004 | The first implementation must include at least one downward touch contract. |
| SRS-CONTRACT-SLICE-005 | The first implementation must include at least one band maintain contract. |
| SRS-CONTRACT-SLICE-006 | The first implementation must include at least one defense contract. |
| SRS-CONTRACT-SLICE-007 | The first implementation should not add new manual actions. |
| SRS-CONTRACT-SLICE-008 | The first implementation should reuse existing manual actions and shared market systems. |
| SRS-CONTRACT-SLICE-009 | The first implementation does not require a story campaign, partial reward economy, online ranking, or full 24-asset detailed simulation. |

---

## 11. Persistence

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-SAVE-001 | Save data must include `gameMode` when Contract Mode is implemented. |
| SRS-CONTRACT-SAVE-002 | Contract Mode save data must include selected mandate id, objective progress, current contract Day, and contract observations or summaries. |
| SRS-CONTRACT-SAVE-003 | Existing incompatible saves must be safely discarded or migrated according to the project's persistence versioning rules. |
| SRS-CONTRACT-SAVE-004 | Same-condition restart must recreate the same contract options from the Run Seed or contract seed. |

---

## 12. Safety Requirements

| ID | Requirement |
| --- | --- |
| SRS-CONTRACT-SAFE-001 | Contract Mode must not use real companies, real tickers, real exchanges, real market data, or real news. |
| SRS-CONTRACT-SAFE-002 | Contract Mode must not describe real market manipulation methods, real short-selling procedures, evasion methods, or executable financial tactics. |
| SRS-CONTRACT-SAFE-003 | User-facing text must use abstract game terms such as `시장 압력`, `가격 밴드`, `전문가 리포트`, `관심도`, `VALUE`, `MADNESS`, and `리스크`. |
| SRS-CONTRACT-SAFE-004 | Downward contracts must be framed as fictional price-condition puzzles, not real short strategies. |
| SRS-CONTRACT-SAFE-005 | Contract settlement must include surveillance or social cost so the satire remains explicit. |

---

## 13. Acceptance Criteria

The first Contract Mode slice is acceptable when:

1. The player can choose 자유모드 or 의뢰모드.
2. 자유모드 still follows the MVP baseline loop.
3. 의뢰모드 shows at least 4 sample contracts.
4. Sample contracts include upward touch, downward touch, band maintain, and defense.
5. Contract progress is visible during play.
6. Price target lines or bandlines are visible where relevant.
7. Objective evaluation is deterministic from observations.
8. Contract settlement displays success/failure and objective results.
9. Successful contracts pay fixed reward.
10. Failed contracts do not pay fixed reward in the first implementation.
11. Net performance accounts for budget spent and risk costs.
12. Expert report appears in Contract Mode and uses fictional abstract language.
13. Downward contracts create counter-pressure through existing VALUE, MADNESS, or Retail Swarm systems.
14. No real financial data or real financial procedure language is introduced.

---

## 14. Open Implementation Questions

These questions do not block the first slice but should be resolved during implementation:

1. Whether `maintain` should later support second-by-second occupancy instead of Day-close counting.
2. Whether partial objective payouts should exist in a later version.
3. Whether contract-specific auto cards or document events are needed after the first slice.
4. Whether expert report confidence should be visible as a numeric value or a label.
5. Whether Contract Mode should use the same 5-Day hard limit for all future contract types.
