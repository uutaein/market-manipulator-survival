# SKILLS

Project-specific skills, reusable rules, and remembered operations for `Market Manipulator Survival`.

This is not a Codex system skill file. It is a repository-local design memory for future contributors and agents.

---

## 1. Documentation Workflow Skill

Use this order unless the user explicitly changes it:

```text
PRD -> ADR -> SRS -> SDD -> SPEC -> Gherkin -> TC -> Implementation -> Tests
```

Current project rule:

1. PRD defines product direction and MVP scope.
2. ADR records accepted product or architecture decisions.
3. SRS defines observable behavior, state, values, triggers, and requirements.
4. SDD defines lightweight module boundaries.
5. SPEC consolidates the buildable first playable scope.
6. Gherkin feature files come before TC documents.
7. Implementation starts only after explicit approval.
8. The current implementation has started with a minimal Phaser/Vite scaffold.

When adding or changing a feature:

1. update PRD only if product scope changes,
2. add ADR only for a durable decision,
3. update SRS for behavior or values,
4. update SDD only if module boundaries change,
5. update SPEC if first playable scope changes,
6. update root `feature/` Gherkin files if behavior coverage changes,
7. update `docs/traceability.md` in the same change.

---

## 2. Safety Abstraction Skill

Player-facing language must remain fictional and abstract.

Use these terms:

| Avoid | Use |
| --- | --- |
| 자전거래 | 유동성 공급 / 유동성 순환 |
| 주가조작 | 시장 압력 관리 |
| 세력 | 운용 데스크 |
| 개미 | 개인 참여자 / 개인 참여도 |
| 주가 끌어올리기 | 가격 추진 |
| 주가 내려오기 | 과열 해소 / 가격 안정화 |
| 물량 털기 | 포지션 정리 |
| 허수 주문 | 신호 주문 / 관심 신호 |

Never add real:

1. companies,
2. stocks,
3. exchanges,
4. market data,
5. news,
6. financial-crime procedures.

---

## 3. MVP Scope Skill

The MVP exists to validate this loop:

```text
Morning News
-> Market Briefing
-> Pre-open Card
-> Opening Approval
-> Intraday pressure
-> Document Event
-> Day Settlement
-> 5-Day Final Settlement
```

Keep features out of MVP if they do not directly support this loop.

Do not pull these into MVP:

1. card synergy,
2. card evolution,
3. rare/legendary cards,
4. 24-asset detailed real-time simulation,
5. large handcrafted news library,
6. complex accounting,
7. real market validation,
8. separate tutorial campaign,
9. online ranking,
10. cloud save,
11. Electron/mobile packaging.

---

## 4. Core State Skill

The core game state is grouped into:

| Group | Examples |
| --- | --- |
| Run State | `runSeed`, `currentDay`, `budget`, `cumulativeProfit`, `autoCards` |
| Day State | `morningNews`, `todayCondition`, `targetBand`, `preOpenCard` |
| Intraday State | `priceChangePercent`, `marketPressure`, `holdingRatio`, `personalParticipation`, `surveillance` |
| Event State | active document event, choices, pause state |
| Market Board State | player asset detail, 7 non-player summaries |
| Settlement State | Day result, Final grade, social cost |
| Persistence State | current Run, recent Final, best record |

0~100 stats must be clamped after updates:

```text
holdingRatio
personalParticipation
marketLiquidity
surveillance
volatility
competitionPressure
```

`marketPressure` can be negative or positive and is normally clamped around `-100~+100`.

---

## 5. Price Formula Skill

The price formula is fictional and component-based.

Core idea:

```text
priceDeltaPerTick =
  pressure
  + participation
  + holding
  + liquidity
  + competition
  + news
  + aftereffect
  + volatilityNoise
```

Important rules:

1. Tick interval is 1 second.
2. Intraday duration is 360 seconds.
3. Player asset uses detailed tick calculation.
4. Non-player assets use simplified tick calculation.
5. Manual actions and cards should affect state variables, not directly overwrite price.
6. Same `runSeed` plus same input sequence should reproduce the same game-affecting results.
7. Coefficients belong in balancing data, not scattered logic.

Current default values are in:

```text
docs/srs/market-manipulator-survival-srs-v0.1.1-tick-price-formula.md
docs/srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md
```

---

## 6. Balancing Module Skill

Keep these balancing groups separate:

```text
runDefaults
assetCatalog
marketBoardRules
preOpenCardValues
manualActionValues
autoCardValues
autoRewardRules
documentEventRules
settlementValues
carryoverValues
persistenceKeys
```

These names are conceptual. They do not have to be exact file names later.

Rule:

> If a value is likely to change after playtesting, it belongs in a balancing group.

---

## 7. Settlement Skill

Settlement is based on:

```text
actual profit + surveillance rating
```

Price target alone is not enough.

Day results:

```text
완전 성공
위험 성공
고위험 성공
안정 운용
위험 운용
조용한 실패
손실 마감
강제 실패
```

Final grades:

```text
S — 조용한 대성공
A — 성공적 운용
B — 위험한 성공
C — 간신히 생존
D — 실패한 운용
F — 강제 종료
```

High holding ratio is useful during the Day but risky at settlement.

Holding bands:

```text
0~10%    영향력 부족
10~35%   안정 구간
35~55%   부담 구간
55%+     과점 위험
```

---

## 8. Gherkin Feature Skill

Gherkin feature files live under:

```text
feature/
```

Group files by domain first, then function:

```text
feature/run/
feature/market/
feature/preopen/
feature/intraday/
feature/settlement/
feature/persistence/
feature/safety/
```

Use English Gherkin keywords for tool compatibility:

```gherkin
Feature:
Scenario:
Given
When
Then
And
But
```

Use approved Korean player-facing terms inside quoted game labels.

Do not create TC documents before Gherkin feature coverage exists.

---

## 9. Traceability Skill

Every MVP feature should appear in:

```text
docs/traceability.md
```

Traceability rows should include:

1. Feature ID,
2. feature name,
3. PRD/ADR source,
4. SRS source,
5. Gherkin source,
6. TC ID,
7. status,
8. notes.

When tests are written, update the matching `TC-*` row.

When a feature is deferred, move or mirror it under Deferred Scope Traceability.

---

## 10. Editing Skill

When editing docs:

1. Keep PRD high-level.
2. Put values, thresholds, and triggers in SRS.
3. Put module boundaries in SDD.
4. Keep ADRs short and decision-focused.
5. Prefer explicit MVP exclusions over broad possibility lists.
6. Do not add implementation files unless the user asks for implementation.

When in doubt:

> Keep the MVP smaller.

---

## 11. Implementation Scaffold Skill

Current scaffold target:

```text
TypeScript + Phaser 3 + Vite
```

Current scaffold rules:

1. Keep the Phaser scene shell aligned with the 8 MVP screens.
2. Keep Document Event as an Intraday modal concept, not a separate full screen.
3. Do not implement gameplay simulation inside scene placeholders.
4. Keep balancing values outside scene code when gameplay implementation begins.
5. Add Cucumber step definitions after the project scaffold is committed.
6. Use `npm run build` to verify TypeScript and Vite.
