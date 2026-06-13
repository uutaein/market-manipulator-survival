# MVP SPEC v0.1.0 — First Playable Build

| Item | Value |
| --- | --- |
| Document Type | SPEC |
| Product | Market Manipulator Survival |
| Scope | MVP first playable implementation specification |
| Version | v0.1.0 |
| Status | Candidate |
| Date | 2026-06-13 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| Baseline SRS | ../srs/market-manipulator-survival-srs-v0.1.0-core-game-state.md through ../srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md |
| Baseline SDD | ../sdd/market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md |
| Traceability | ../traceability.md |

This SPEC defines what the first playable MVP build must include.

It does not freeze balance quality. Numeric values from SRS v0.1.6 are first playable defaults and should be adjusted after real playtesting.

This SPEC does not create TC documents, Gherkin feature files, implementation tasks, or project scaffolding.

---

## 1. Implementation Target

The later implementation target is:

```text
TypeScript + Phaser 3 + Vite
```

The MVP runs in a desktop browser first.

Electron packaging, mobile optimization, cloud save, online ranking, replay, and daily challenge features are outside this SPEC.

---

## 2. Product Safety Contract

The build must remain a fictional, satirical, abstract market-pressure management game.

The build must not include:

1. real company names,
2. real stock or ticker names,
3. real exchange names,
4. real market data,
5. real news,
6. real-world market manipulation procedures,
7. real financial modeling claims.

Player-facing terminology must use the approved safety abstraction layer.

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

---

## 3. MVP Feature Scope

The first playable build must include the following feature set.

| Feature | SPEC Decision |
| --- | --- |
| Run structure | 5-Day Run |
| Day duration | 360 sec intraday per Day |
| Day flow | Morning News -> Market Briefing -> Pre-open Card -> Opening Approval -> Intraday -> Day Settlement |
| Final flow | Final Settlement after Day 5 |
| Immediate failure | budget exhaustion, surveillance 100, critical price collapse |
| Sectors | 8 fictional sectors |
| Assets | 24 fictional assets |
| Asset choice | player selects sector and asset at Run start |
| Hidden asset tendency | stable / standard / high-risk assignment per sector at Run start |
| Morning News | 5 templates, 1 per Day |
| Pre-open Cards | 4 |
| Manual Actions | 4 |
| Auto Cards | 8, Lv.1~Lv.3 |
| Document Events | 8 |
| Retail Swarm | interest / overheated / panic |
| Market Board | 8 assets total |
| Player asset simulation | detailed |
| Non-player asset simulation | 7 simplified assets |
| Day Settlement | actual profit + surveillance grade |
| Final Settlement | cumulative profit + surveillance + supporting risk metrics |
| Storage | localStorage only |
| Restart | same-condition restart and new Run |

---

## 4. MVP Screens

The first playable build must stay within 8 screens.

| Screen | Required Role |
| --- | --- |
| Main Menu | start new Run, continue if save exists, show inline best result |
| Run Setup / Asset Selection | select sector and asset |
| Morning News / Market Briefing | show news, target band, brief risk information |
| Pre-open Card Selection | choose one of 4 pre-open cards |
| Intraday Operation | main playable screen |
| Document Event Popup | modal over intraday screen |
| Day Settlement | show Day result, metrics, and short hint |
| Final Settlement | show final grade, summary, restart options |

Run failure must reuse the Final Settlement layout as an F-grade failure variant. It must not add a ninth MVP screen.

---

## 5. Core State Required for First Playable

The implementation must support these state groups.

| State Group | Required Contents |
| --- | --- |
| Run State | Run Seed, current Day, selected asset, budget, cumulative profit, holding ratio, surveillance, social cost, auto cards, aftereffects |
| Day State | Morning News, Today Condition, target band, crash line, pre-open card, opening approval |
| Intraday State | time, pause state, price change, market pressure, participation, liquidity, surveillance, volatility, competition pressure |
| Event State | active document event, choices, event history |
| Market Board State | displayed 8 assets, player detail, non-player summaries, news badges |
| Settlement State | Day result, Day profit, surveillance grade, Final grade, settlement hints |
| Persistence State | current Run, recent Final Settlement, best record |

All 0~100 bounded states must clamp after updates.

---

## 6. First Playable Simulation

### 6.1 Tick Timing

| Item | Value |
| --- | ---: |
| Tick interval | 1 sec |
| Intraday duration | 360 sec |
| Price mode | Day open-relative percentage |

### 6.2 Price Formula Boundary

The player asset price tick must be component-based.

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

Manual actions, auto cards, news, and document choices must affect state variables or components. They must not directly overwrite the price as a fixed result.

The first playable default formula and coefficients are defined in SRS v0.1.1 and SRS v0.1.6.

### 6.3 Non-player Asset Simulation

Non-player assets use simplified movement only.

They react to:

1. sector news,
2. market news,
3. simple trend bias,
4. seeded noise.

They do not need budget, holding ratio, surveillance, or manual action state.

---

## 7. Required MVP Content

### 7.1 Morning News Templates

1. 섹터 호재
2. 섹터 악재
3. 시장 침체
4. 규제 경고
5. 과열 확산

Each Day has exactly 1 Morning News item.

### 7.2 Pre-open Cards

1. 시장 관찰
2. 사전 포지션 구축
3. 방어 자금 배정
4. 관망

The player can choose at most 1 per Day.

### 7.3 Manual Actions

1. 유동성 공급
2. 가격 추진
3. 과열 해소
4. 포지션 정리

Manual actions are unavailable while a document event or auto card reward choice is open.

### 7.4 Auto Cards

1. 관심 신호
2. 유동성 순환
3. 가격 지지
4. 변동성 흡수
5. 뉴스 증폭
6. 감시 완충
7. 경쟁 견제
8. 정리 루틴

Auto cards are limited to Lv.1~Lv.3.

No card evolution, rarity, synergy, or saved deck build is included.

### 7.5 Document Events

1. 이상 흐름 질의서
2. 시장 과열 경보
3. 유동성 경색 보고
4. 커뮤니티 폭주 알림
5. 경쟁 데스크 개입 보고
6. 급락 위험 통지
7. 내부 리스크 메모
8. 마감 전 정리 요청

Each document event has 3 choices:

1. stable,
2. aggressive,
3. avoid / watch.

Document events pause intraday time until the player selects a choice.

---

## 8. Balancing Data Modules

The first playable build must keep these value groups easy to find and change.

| Module | Purpose |
| --- | --- |
| `runDefaults` | starting values, target band, crash line |
| `assetCatalog` | fictional sectors and assets |
| `marketBoardRules` | 8-asset display selection |
| `preOpenCardValues` | pre-open effects |
| `manualActionValues` | costs, cooldowns, effects |
| `autoCardValues` | periods, effects, level scaling |
| `autoRewardRules` | reward timing and choices |
| `documentEventRules` | trigger thresholds, limits, effects |
| `settlementValues` | profit bands, result matrix, final grade rules |
| `carryoverValues` | Day-to-Day carryover and aftereffects |
| `persistenceKeys` | localStorage keys and schema version |

These names are conceptual. They do not have to be exact file names, but the implementation must preserve the separation.

---

## 9. Settlement Required Behavior

### 9.1 Surveillance Grade

| Surveillance | Grade |
| ---: | --- |
| 0~24 | A |
| 25~49 | B |
| 50~74 | C |
| 75~94 | D |
| 95~99 | E |
| 100 | F |

### 9.2 Day Result Categories

1. 완전 성공
2. 위험 성공
3. 고위험 성공
4. 안정 운용
5. 위험 운용
6. 조용한 실패
7. 손실 마감
8. 강제 실패

### 9.3 Final Grades

1. S — 조용한 대성공
2. A — 성공적 운용
3. B — 위험한 성공
4. C — 간신히 생존
5. D — 실패한 운용
6. F — 강제 종료

### 9.4 Holding Ratio Bands

| Band | Holding Ratio |
| --- | ---: |
| 영향력 부족 | 0~10% |
| 안정 구간 | 10~35% |
| 부담 구간 | 35~55% |
| 과점 위험 | 55%+ |

Detailed first playable settlement thresholds are in SRS v0.1.6.

---

## 10. Carryover and Restart

The first playable build must carry Day results into the next Day.

| State | Carryover |
| --- | --- |
| budget | exact |
| cumulative profit | exact |
| holding ratio | exact |
| surveillance | partial |
| social cost | exact |
| auto card levels | exact |
| personal participation | reduced |
| news effect | weak residual possible |
| market liquidity | mostly reset |
| volatility | mostly reset with possible aftereffect |
| pre-open card effect | no carryover |

Same-condition restart must use the same internal Run Seed.

The MVP does not include seed input, seed sharing, or daily challenge.

---

## 11. Persistence

The first playable build uses localStorage only.

Required keys:

| Key | Content |
| --- | --- |
| `mms.currentRun.v1` | current Run resume state |
| `mms.recentFinal.v1` | most recent Final Settlement |
| `mms.bestRecord.v1` | best Final grade and best cumulative profit |

Incompatible old saves may be discarded in MVP.

No replay data, detailed logs, cloud account data, or online ranking data is stored.

---

## 12. Day 1 Onboarding

The MVP has no separate tutorial mode.

Day 1 must:

1. start with a simple or weak Morning News setup,
2. show all 4 pre-open cards,
3. expose all 4 manual actions with tooltip-level explanation,
4. avoid high-risk event chains,
5. provide one low-risk document event if no event has appeared,
6. soften surveillance and collapse risk,
7. show a short settlement hint.

Day 1 can still fail if the player ignores the system or overuses resources.

---

## 13. Explicit Non-Scope

Do not include these in the first playable build:

1. SRS final balance freeze,
2. Gherkin feature files,
3. TC documents,
4. Phaser/Vite scaffolding before explicit approval,
5. card synergy,
6. card evolution,
7. rare or legendary cards,
8. 24-asset detailed simulation,
9. handcrafted 24+ news items,
10. breaking news chains,
11. separate tutorial mode,
12. detailed codex or collection screens,
13. online ranking,
14. cloud save,
15. Electron packaging,
16. mobile/iPad optimization,
17. real market data or real financial model expansion.

---

## 14. First Playable Definition of Done

The MVP first playable is SPEC-complete when:

1. a player can start a new Run,
2. select a fictional sector and asset,
3. play Day 1 through Day Settlement,
4. continue through Day 5 or fail early,
5. receive Final Settlement or failure result,
6. restart with the same condition or start a new Run,
7. see the Market Board with 8 assets,
8. use 4 manual actions,
9. receive auto card rewards,
10. encounter document events,
11. see Retail Swarm state changes,
12. persist and resume the current Run locally,
13. avoid all real-world market entities and procedures.

Balance quality is not part of this Definition of Done. Balance quality is evaluated after the playable build exists.

---

## 15. SPEC Freeze Rule

After this SPEC is accepted, new ideas should not be added to MVP by default.

Use this rule:

```text
If it is required for the first playable loop, update SPEC.
If it improves a future version, record it as P1/P2.
If it changes balance feel only, update balancing data after playtest.
```

TC documents and Gherkin feature files should be created after this SPEC is accepted.
