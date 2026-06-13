# MVP SPEC v0.1.0 — First Playable Build

| Item | Value |
| --- | --- |
| Document Type | SPEC |
| Product | Market Manipulator Survival |
| Scope | MVP first playable implementation specification |
| Version | v0.1.0 |
| Status | Accepted / Current First-Playable Baseline |
| Date | 2026-06-13 |
| Current As Of | 2026-06-14 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| Baseline SRS | ../srs/market-manipulator-survival-srs-v0.1.0-core-game-state.md through ../srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md |
| Baseline SDD | ../sdd/market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md |
| Traceability | ../traceability.md |

This SPEC defines what the first playable MVP build must include.

It does not freeze balance quality. Numeric values from SRS v0.1.6 are first playable defaults and should be adjusted after real playtesting.

At acceptance time, this SPEC did not create TC documents, Gherkin feature files, implementation tasks, or project scaffolding. Those artifacts now exist where explicitly approved, and this SPEC remains the implementation-facing scope baseline rather than a TC document.

---

## 1. Implementation Target

The current implementation target is:

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
| Day duration | 180 sec intraday per Day |
| Day flow | Pre-open Card -> Morning News -> Market Briefing / Opening Approval -> Intraday -> Day Settlement |
| Final flow | Final Settlement after Day 5 |
| Immediate failure | budget exhaustion, surveillance 100, critical price collapse |
| Sectors | 8 fictional sectors |
| Assets | 24 fictional assets |
| Asset choice | player selects sector and asset at Run start; setup may show non-locking entry recommendations |
| Asset market profile | each sector has one sector leader, one standard asset, and one theme mover with fixed fictional baseline trade value |
| Hidden asset tendency | stable / standard / high-risk assignment per sector at Run start |
| Morning News | 5 templates, 3 items per Day: 1 sector item and 2 asset items |
| Pre-open Cards | 4 |
| Manual Actions | 4 |
| Auto Cards | 8, Lv.1~Lv.3 |
| Document Events | 8 |
| Retail Swarm | interest / overheated / panic |
| Market Board | player asset + 2 same-sector competitors + 7 other-sector averages |
| Market Dashboard | 24 individual fictional assets ranked by baseline-anchored fictional trade value with live activity adjustment |
| Player asset simulation | detailed |
| Non-player asset simulation | simplified competitor/sector-average movement |
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
| Pre-open Card Selection | choose one of 4 pre-open cards before Morning News is revealed |
| Morning News / Market Briefing | reveal news, target band, brief risk information, and Opening Approval |
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
| Day State | generated Morning News items, Today Condition, target band, crash line, pre-open card, opening approval |
| Intraday State | time, pause state, opening/current/average price, held units, fictional float units, price change, market pressure, participation, liquidity, surveillance, volatility, competition pressure |
| Event State | active document event, choices, event history |
| Market Board State | player detail, same-sector competitors, other-sector averages, news badges, 24-asset fictional value ranking |
| Settlement State | Day result, Day profit, surveillance grade, Final grade, settlement hints |
| Persistence State | current Run, recent Final Settlement, best record |

All 0~100 bounded states must clamp after updates.

---

## 6. First Playable Simulation

### 6.1 Tick Timing

| Item | Value |
| --- | ---: |
| Tick interval | 1 sec |
| Intraday duration | 180 sec |
| Price mode | Day open-relative percentage |

### 6.2 Price Formula Boundary

The player asset price tick must be component-based.

```text
directionalDelta =
  pressure
  + participation
  + holding
  + liquidity
  + competition
  + news
  + aftereffect
  + attentionFade

priceDeltaPerTick =
  (directionalDelta / assetInfluenceResistance)
  × liquidityMultiplier
  × orderBookMultiplier
  + simulatorAdjustment
  + volatilityNoise
```

`assetInfluenceResistance` comes from the selected fictional asset's market profile. Larger baseline trade-value assets are harder for the same budget and pressure to move. `orderBookMultiplier` is a fictional depth-readability factor, not real order-book data.

`simulatorAdjustment` may use a seeded fake OHLCV generator package to add realistic candle noise and volume impulse. It must not fetch real market data, real tickers, or real exchange data.

The first playable may use browser-native chart/table renderers for candle, volume, and dashboard display. Phaser should remain responsible for the game scene shell, document popups, manual action controls, and Retail Swarm visuals.

Manual actions, auto cards, news, and document choices must affect state variables or components. They must not directly overwrite the price as a fixed result.

The first playable default formula and coefficients are defined in SRS v0.1.1 and SRS v0.1.6.

Morning News must visibly change market feel through direction, volatility, participation, liquidity, surveillance, and/or fictional trade value. News that only changes hidden numbers is not sufficient for the first playable.

Manual actions commit their budget cost/recovery immediately, then apply non-budget stat effects gradually during their execution/cooldown window. The executing button blinks, shows gauge progress, and can be clicked again to interrupt remaining progress without rolling back already-applied effects.

### 6.3 Non-player Asset Simulation

Non-player assets use simplified movement only.

They react to:

1. sector news,
2. market news,
3. simple trend bias,
4. seeded noise.

They do not need budget, holding ratio, surveillance, or manual action state.

The market dashboard ranks all 24 individual fictional assets by fictional trade value. Sector averages may appear in the other-sector context panel, but not as dashboard ranking rows.

---

## 7. Required MVP Content

### 7.1 Morning News Templates

1. 섹터 호재
2. 섹터 악재
3. 시장 침체
4. 규제 경고
5. 과열 확산

Each Day has exactly 3 Morning News items: 1 sector news item and 2 fictional asset news items.

Asset news can target the player asset or another fictional asset. Non-player asset news is used for Market Board context and badges, but it does not directly change the player asset price calculation.

### 7.2 Pre-open Cards

1. 선취매
2. 뉴스 배정
3. 종목 분석
4. 관망

The player can choose at most 1 per Day before Morning News is revealed.

`뉴스 배정` is one MVP card that exposes two direction choices:

1. `뉴스 배정: 호재`
2. `뉴스 배정: 악재`

Both directions target the player-selected fictional asset for the current Day. Positive assignment improves attention and upward-action legitimacy. Negative assignment increases downside context and reduces surveillance burden for position settlement.

`선취매` uses a drag-style investment ratio control instead of a fixed budget cost. On Day 1 or when no position carries over, the player chooses 10~50% of the current Day budget. From Day 2 onward, if a position carries over, the player chooses 0~50% because additional accumulation is optional. The chosen ratio determines budget spent and position acquired; a higher ratio increases holding ratio and lowers opening market liquidity. The resulting average entry price starts roughly 2~7% above the opening price using deterministic Run/asset randomness, so the initial valuation can show a loss before intraday pressure changes the price.

The Intraday chart must include a fictional order-book/depth panel for the player asset. Thin sell-side depth should make upward pressure more responsive; thin buy-side depth should make downward pressure more responsive. This is an abstract game model, not real order-book data.

### 7.3 Manual Actions

1. 유동성 공급
2. 매수봇
3. 매도봇
4. 포지션 정리, displayed as 수익실현 when above average entry and 손실차단 when below average entry

Manual actions are unavailable while a document event or auto card reward choice is open.

The Intraday screen must show a simple fictional position and money-flow readout: opening price, current price, average entry price, held units, fictional float units, position value, total account value, total P&L, unrealized gain/loss, spent budget, recovered budget, and current budget.

Position value must be normalized against the same fictional influence resistance used for acquisition. First playable account value uses `holdingRatio * max(1, assetInfluenceResistance)` as normalized cost basis and multiplies it by `currentPrice / averageEntryPrice`. This keeps large-asset acquisition cost, position value, and total P&L internally consistent without becoming a real accounting model.

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

If a document event choice changes budget, its choice description must show the budget delta before selection. The `유동성 경색 보고` aggressive response is displayed as `유동성 긴급 공급`, costs 2B in the first playable, and is intentionally distinct from the manual `유동성 공급` button.

---

## 8. Balancing Data Modules

The first playable build must keep these value groups easy to find and change.

| Module | Purpose |
| --- | --- |
| `runDefaults` | starting values, target band, crash line |
| `assetCatalog` | fictional sectors and assets |
| `assetMarketProfiles` | fixed fictional baseline trade value, market role, and influence resistance |
| `marketBoardRules` | player/peer/sector-average context and 24-asset value ranking |
| `preOpenCardValues` | pre-open effects |
| `manualActionValues` | costs, cooldowns, effects |
| `autoCardValues` | periods, effects, level scaling |
| `autoRewardRules` | reward timing and choices |
| `documentEventRules` | trigger thresholds, limits, effects |
| `settlementValues` | profit bands, result matrix, final grade rules |
| `carryoverValues` | Day-to-Day carryover and aftereffects |
| `persistenceKeys` | localStorage keys and schema version |
| `priceTickValues` | component coefficients, resistance, order-book, and simulator tuning |
| `retailSwarmValues` | participant mood thresholds and display/risk values |

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

1. require `선취매` as the first-position pre-open choice before Morning News reveal,
2. keep the Day 1 Morning News setup readable and avoid harsh high-risk combinations,
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
2. TC documents,
3. unapproved project scaffolding,
4. features not covered by PRD/SRS/SPEC/Traceability,
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
7. see a fictional candlestick chart with volume bars,
8. see the Market Board context panels and 24-asset fictional value dashboard,
9. use 4 manual actions,
10. receive auto card rewards,
11. encounter document events,
12. see Retail Swarm state changes,
13. persist and resume the current Run locally,
14. avoid all real-world market entities and procedures.

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

Gherkin feature files and step definitions now exist after SPEC acceptance. TC documents should still be created after the accepted Gherkin coverage is reviewed.
