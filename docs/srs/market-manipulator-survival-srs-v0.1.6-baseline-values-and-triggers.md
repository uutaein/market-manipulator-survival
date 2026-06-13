# SRS v0.1.6 — Baseline Values and Triggers

| Item | Value |
| --- | --- |
| Document Type | SRS |
| Product | Market Manipulator Survival |
| Scope | MVP baseline values, triggers, and balancing groups |
| Version | v0.1.6 |
| Status | Draft |
| Date | 2026-06-13 |
| Baseline PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| Baseline SRS | ./market-manipulator-survival-srs-v0.1.0-core-game-state.md through ./market-manipulator-survival-srs-v0.1.5-freeze-readiness-review.md |

This document closes the highest-priority MVP SRS gaps with simple baseline values.

The values in this document are not claims about real markets. They are game tuning defaults for a fictional pressure-management system. They should be separated from code logic so playtesting can adjust them without rewriting the simulation.

---

## 1. Balancing Group Model

MVP implementation should keep the following balancing groups separate from core logic.

| Group | Purpose |
| --- | --- |
| `runDefaults` | Starting Run and Day values |
| `assetCatalog` | Fictional sector and asset identifiers |
| `marketBoardRules` | Displayed asset selection |
| `preOpenCardValues` | Pre-open card baseline effects |
| `manualActionValues` | Manual action costs, cooldowns, and effects |
| `autoCardValues` | Auto card periods, effects, and level scaling |
| `autoRewardRules` | Auto card reward timing and choices |
| `documentEventRules` | Event triggers, limits, and choice effects |
| `settlementValues` | Profit bands, result matrix, grade cuts |
| `carryoverValues` | Day-to-Day carryover and aftereffects |
| `persistenceKeys` | localStorage key names and schema versions |

| ID | Requirement |
| --- | --- |
| SRS-BASE-MOD-001 | The above groups must be changeable without modifying the price tick formula structure. |
| SRS-BASE-MOD-002 | The implementation may store these values as JSON, TypeScript constants, or another simple data object, but they must not be scattered through unrelated gameplay code. |
| SRS-BASE-MOD-003 | MVP must not add an in-game balancing editor. |

---

## 2. Fictional Asset Catalog

MVP uses 8 fictional sectors and 24 fictional assets. All names are fictional and must not reference real companies, real stock names, real exchanges, or real market data.

Run-level hidden tendencies are assigned per sector at Run start:

1. one stable tendency,
2. one standard tendency,
3. one high-risk tendency.

The tendency is not shown directly to the player.

| Sector ID | Sector | Asset ID | Display Name | Short Briefing |
| --- | --- | --- | --- | --- |
| `food_agri` | 식량·농업 | `food_agri_01` | 밥심푸드 | 식량 테마가 붙으면 개인 참여도가 빠르게 붙는 허구 식품 데스크. |
| `food_agri` | 식량·농업 | `food_agri_02` | 온실상사 | 날씨 문서와 공급 불안에 민감한 시설 농업 데스크. |
| `food_agri` | 식량·농업 | `food_agri_03` | 작황컴퍼니 | 계절성 뉴스에 흔들리는 소형 농업 테마 데스크. |
| `energy_grid` | 에너지·전력망 | `energy_grid_01` | 콘센트전력 | 전력망 이슈가 뜨면 시장 보드에서 눈에 잘 띄는 허구 전력사. |
| `energy_grid` | 에너지·전력망 | `energy_grid_02` | 축전상회 | 저장 장치 테마로 관심이 짧고 강하게 붙는 에너지 데스크. |
| `energy_grid` | 에너지·전력망 | `energy_grid_03` | 정전복구 | 급락 방어와 복구 기대감이 번갈아 나타나는 전력망 데스크. |
| `bio_trial` | 바이오·임상 | `bio_trial_01` | 임상대기제약 | 승인 문구 하나에 기대와 경고가 같이 붙는 임상 데스크. |
| `bio_trial` | 바이오·임상 | `bio_trial_02` | 캡슐바이오 | 작은 호재에도 참여도가 튀는 연구 테마 데스크. |
| `bio_trial` | 바이오·임상 | `bio_trial_03` | 승인문턱랩스 | 확실한 정보보다 분위기에 더 크게 흔들리는 고변동 데스크. |
| `automation_ai` | 자동화·AI | `automation_ai_01` | 자동서기 | 문서 자동화 테마로 초반 관심을 모으기 쉬운 AI 데스크. |
| `automation_ai` | 자동화·AI | `automation_ai_02` | 프롬프트공업 | 뉴스 문구에 과민하게 반응하는 자동화 테마 데스크. |
| `automation_ai` | 자동화·AI | `automation_ai_03` | 클릭봇시스템즈 | 관심은 빨리 붙지만 감시 문서도 빨리 따라오는 자동화 데스크. |
| `chip_equipment` | 칩·장비 | `chip_equipment_01` | 웨이퍼상회 | 칩 공급 뉴스에 민감한 부품 테마 데스크. |
| `chip_equipment` | 칩·장비 | `chip_equipment_02` | 회로전자 | 유동성이 붙으면 가격 반응이 선명해지는 허구 전자 데스크. |
| `chip_equipment` | 칩·장비 | `chip_equipment_03` | 장비납품 | 수주 기대와 지연 경고가 번갈아 나오는 장비 테마 데스크. |
| `payment_fintech` | 결제·핀테크 | `payment_fintech_01` | 도장페이 | 승인 도장 같은 UI와 잘 맞는 결제 테마 데스크. |
| `payment_fintech` | 결제·핀테크 | `payment_fintech_02` | 원장테크 | 장부와 정산 뉴스에 따라 유동성이 움직이는 핀테크 데스크. |
| `payment_fintech` | 결제·핀테크 | `payment_fintech_03` | 영수증핀테크 | 예산 효율은 좋지만 감시 문서에 민감한 결제 데스크. |
| `media_game` | 미디어·게임 | `media_game_01` | 클릭방송 | 트래픽 소식에 개인 참여도가 빠르게 반응하는 미디어 데스크. |
| `media_game` | 미디어·게임 | `media_game_02` | 패치노트게임즈 | 업데이트 문구 하나로 과열과 실망이 교차하는 게임 데스크. |
| `media_game` | 미디어·게임 | `media_game_03` | 시즌패스미디어 | 관심은 넓지만 오래 유지하기 어려운 콘텐츠 테마 데스크. |
| `meme_theme` | 밈·테마 | `meme_theme_01` | 밈광장 | 커뮤니티 분위기가 빠르게 모였다가 흩어지는 테마 데스크. |
| `meme_theme` | 밈·테마 | `meme_theme_02` | 밈장부 | 웃음과 패닉이 같은 속도로 번지는 고위험 테마 데스크. |
| `meme_theme` | 밈·테마 | `meme_theme_03` | 댓글연쇄 | 댓글 분위기가 Retail Swarm으로 바로 번지는 밈 테마 데스크. |

---

## 3. Run and Day Baseline Values

| State | Baseline |
| --- | ---: |
| Run length | 5 Days |
| Intraday duration | 180 sec |
| Starting budget | 100 |
| Minimum budget failure threshold | 10 |
| Initial `priceChangePercent` | 0 |
| Initial `holdingRatio` | 15 |
| Initial `personalParticipation` | 30 |
| Initial `marketLiquidity` | 50 |
| Initial `surveillance` | 10 |
| Initial `volatility` | 35 |
| Initial `marketPressure` | 0 |
| Initial `competitionPressure` | 30 |
| Target band min | +8% |
| Target band max | +12% |
| Crash line | -20% |

Each new Run starts with 1 random Lv.1 auto card from the 8 MVP auto cards.

| ID | Requirement |
| --- | --- |
| SRS-BASE-RUN-001 | A new Run must initialize using the baseline values above unless modified by asset tendency, Today Condition, Morning News, or Day 1 onboarding rules. |
| SRS-BASE-RUN-002 | Starting values must be generated from the Run Seed where randomness is involved. |
| SRS-BASE-RUN-003 | The starting auto card must be reproducible from the Run Seed. |
| SRS-BASE-RUN-004 | Morning News must affect more than price direction; relevant news should also adjust starting volatility, participation, liquidity, or surveillance enough for the player to feel that briefing information matters. |

---

## 4. Market Board Selection Rules

MVP Market Board uses three intraday panels:

1. player-sector competitors,
2. other-sector averages,
3. a market dashboard ranked by fictional trade value.

The visible market context rows are:

| Slot | Rule |
| --- | --- |
| 1 | Player selected asset |
| 2~3 | The other two assets in the selected sector |
| 4~10 | Seven other-sector average rows |

The market dashboard is not a sector-average list. It ranks all 24 individual fictional assets by fictional trade value and displays a window around the player's current rank. If the player asset is near the top or bottom, the window clamps to the top or bottom of the 24-asset ranking.

Morning News affected sectors or assets must receive visible badges or stronger movement/volume signals in the relevant rows.

The player chart includes a fictional order-book/depth panel. The price formula applies an `orderBookMultiplier` after directional pressure and liquidity are combined. Thin sell-side depth amplifies upward responsiveness; thin buy-side depth amplifies downward responsiveness. The values are fictional and seeded for gameplay readability.

The price tick also uses a fictional price-motion simulator module. This module adds mean reversion, target-band resistance, overheat drag, occasional pullback shocks, crash-area rebound support, and a seeded fake OHLCV package impulse so prices do not simply drift upward whenever pressure is positive.

The fake OHLCV package adapter may use `stock-market-gen` or an equivalent local generator. It must only generate fictional candles from the current game state and Run Seed. It must not fetch or embed real market data, real tickers, or real exchange data.

The Intraday chart renderer may use `lightweight-charts` or an equivalent browser chart renderer. Phaser should not manually redraw candle and volume geometry every tick. The chart renderer receives fictional OHLCV data from the game session and stays replaceable.

The Market Dashboard should update through a stable DOM row pool or equivalent retained renderer. It should not destroy and recreate every visible row every second.

| ID | Requirement |
| --- | --- |
| SRS-BASE-MARKET-001 | The selected player asset must always be displayed. |
| SRS-BASE-MARKET-002 | Same-sector peers must be displayed unless the sector has fewer than 3 assets, which MVP does not allow. |
| SRS-BASE-MARKET-003 | All seven non-player sectors must be represented by simplified sector-average rows. |
| SRS-BASE-MARKET-004 | The market dashboard must rank all 24 individual fictional assets by fictional trade value, not sector averages. |
| SRS-BASE-MARKET-005 | Non-player movement must be reproducible from the Run Seed and Day index. |
| SRS-BASE-MARKET-006 | The Intraday chart must display fictional sell-side and buy-side depth for the player asset. |
| SRS-BASE-MARKET-007 | The price tick calculation must include an order-book/depth responsiveness multiplier. |
| SRS-BASE-MARKET-008 | The price tick calculation must include a fictional price-motion simulator adjustment with pullback and mean-reversion components. |
| SRS-BASE-MARKET-009 | The price-motion simulator may use a seeded fake OHLCV package adapter, but the adapter must remain replaceable and must not introduce real market data. |
| SRS-BASE-MARKET-010 | The candle/volume chart renderer must be separated from the Phaser scene and receive data through an adapter or overlay boundary. |
| SRS-BASE-MARKET-011 | The Market Dashboard renderer must use retained rows or an equivalent approach that avoids per-tick row object recreation. |

---

## 5. Pre-open Card Baseline Effects

| Card | Baseline Effect |
| --- | --- |
| 사전 포지션 확보 | Player chooses 10~50% of current Day budget with a drag-style investment ratio. Budget spent is `currentBudget * selectedPercent`; holding, pressure, surveillance, and volatility scale from the invested amount. Average entry price starts roughly 5~20% above opening price using deterministic Run/asset randomness. Does not increase attention directly. |
| 뉴스 배정 | `budget -8`. Player chooses `호재` or `악재` before Morning News is revealed. The generated Morning News targets the player asset. |
| 뉴스 배정: 호재 | Player asset positive news. Adds attention/upward context, lets liquidity supply add meaningful upward pressure, improves price-push effect, and reduces upward-action surveillance burden. |
| 뉴스 배정: 악재 | Player asset negative news. Adds downside context and volatility, reduces position-settlement surveillance burden, but weakens price-push context. |
| 종목 분석 | `budget -4`. Strengthens `가격 추진` and `과열 해소` effect multipliers. Does not directly move price or attention. |
| 관망 | No stat change. Preserves budget. |

| ID | Requirement |
| --- | --- |
| SRS-BASE-PREOPEN-001 | Pre-open card effects must apply only to the current Day. |
| SRS-BASE-PREOPEN-002 | Pre-open card selection must occur before Morning News is revealed. |
| SRS-BASE-PREOPEN-003 | `뉴스 배정` must target the player-selected fictional asset, not the whole market. |
| SRS-BASE-PREOPEN-004 | `관망` must be a valid explicit choice. |
| SRS-BASE-PREOPEN-005 | `뉴스 배정` is counted as one MVP card even though it exposes `호재` and `악재` direction buttons. |
| SRS-BASE-PREOPEN-006 | `사전 포지션 확보` must not use a fixed budget cost. |

---

## 6. Manual Action Baseline Values

Manual actions are unavailable while a document event or auto card reward choice is open.

| Action | Cost / Recovery | Cooldown | Baseline Effect |
| --- | ---: | ---: | --- |
| 유동성 공급 | `budget -4` | 8 sec | Low-cost attention and liquidity setup. Gradually applies `marketPressure +5`, `marketLiquidity +22`, `personalParticipation +10`, `volatility +6`, `surveillance +2`. |
| 가격 추진 | `budget -14` | 10 sec | High-cost upward pressure and position acquisition. Gradually applies `holdingRatio +4`, `marketPressure +58`, `marketLiquidity +8`, `personalParticipation +12`, `volatility +11`, `surveillance +7`, with average entry price rising when held units increase. |
| 과열 해소 | `budget -3` | 12 sec | Low-cost downward stabilization while keeping activity visible. Gradually applies `marketPressure -46`, `marketLiquidity +6`, `personalParticipation +4`, `volatility -8`, `surveillance -2`. |
| 포지션 정리 | current-price-based recovery | 14 sec | Full position cleanup with sharp exit shock. Budget recovery is based on current fictional position value. Gradually applies `holdingRatio -100`, `marketPressure -110`, `marketLiquidity +10`, `personalParticipation +16`, `surveillance +7`, `volatility +30`. |

| ID | Requirement |
| --- | --- |
| SRS-BASE-ACTION-001 | Manual action buttons must show disabled state when the player cannot pay the cost, the action is executing, or the action is on cooldown. |
| SRS-BASE-ACTION-002 | Budget recovery from `포지션 정리` must not raise budget above a future configurable Run budget cap if one is added. MVP may omit that cap. |
| SRS-BASE-ACTION-003 | Manual action values must live in `manualActionValues` or an equivalent balancing group. |
| SRS-BASE-ACTION-004 | Manual action budget cost/recovery is committed immediately, but non-budget stat effects are applied gradually over the action execution duration. |
| SRS-BASE-ACTION-005 | An executing manual action button must blink and show remaining seconds; the player cannot cancel or re-trigger that action while it is executing. |
| SRS-BASE-ACTION-006 | If `포지션 정리` reduces holding ratio to 0 and no manual action is still executing, the player may use an intraday desk-reposition flow to choose a new fictional sector/asset while preserving Run/Day risk state. |
| SRS-BASE-ACTION-007 | The intended MVP action rhythm is `사전 포지션 확보` followed by liquidity/attention setup, high-cost price pressure, overheat stabilization, and full position cleanup. |
| SRS-BASE-ACTION-008 | `가격 추진` must increase held units and average entry price while spending budget. |
| SRS-BASE-ACTION-009 | `포지션 정리` must reduce held units and recover budget based on current fictional price context. |

### 6.1 Intraday Money Flow Display

The Intraday screen must expose simple fictional budget-flow feedback:

| Display Item | Meaning |
| --- | --- |
| 사용 | Total budget spent by committed actions and entry choices |
| 회수 | Total budget recovered by settlement actions or effects |
| 투입 | `사용 - 회수` |
| 현재가 / 시초가 / 평균단가 | Fictional quote context for the player asset |
| 보유 / 매물 / 비중 | Held fictional units, fictional float units, and holding ratio |
| 포지션 평가 | Fictional position market value |
| 평가손익 | Unrealized fictional position gain/loss from current price versus average entry |

This is a game-budget display, not real accounting.

---

## 7. Auto Card Reward and Level Rules

### 7.1 Reward Timing

| Rule | Baseline |
| --- | --- |
| Starting auto card | 1 random Lv.1 card at Run start |
| Reward timing | At 45, 90, and 135 sec elapsed per Day |
| Choices | 3 choices |
| Choice behavior | Pause intraday until selected |
| Choice result | Gain a new Lv.1 card or level up an owned card |
| Max level | Lv.3 |

Eligible choices:

1. any unowned MVP auto card,
2. any owned MVP auto card below Lv.3.

If fewer than 3 eligible choices exist, show all eligible choices.

### 7.2 Auto Card Baseline Values

| Auto Card | Lv.1 Period | Lv.1 Effect | Growth Type |
| --- | ---: | --- | --- |
| 관심 신호 | 12 sec | `personalParticipation +4`, `surveillance +1` | effect |
| 유동성 순환 | 14 sec | `marketLiquidity +5`, `volatility +1` | effect |
| 가격 지지 | 10 sec | If below target band: `marketPressure +6` | effect |
| 변동성 흡수 | 12 sec | `volatility -4`, `marketPressure -1` | effect |
| 뉴스 증폭 | 15 sec | Current Morning News pressure +20% while active | period |
| 감시 완충 | 16 sec | Next surveillance increase reduced by 20% | effect |
| 경쟁 견제 | 14 sec | `competitionPressure -5`, `surveillance +1` | effect |
| 정리 루틴 | 18 sec | `holdingRatio -3`, `budget +2`, `marketPressure -2` | period |

Level scaling:

| Level | Effect Growth Type | Period Growth Type |
| --- | --- | --- |
| Lv.1 | baseline effect | baseline period |
| Lv.2 | effect x1.3 | period x0.85 |
| Lv.3 | effect x1.6 | period x0.75 |

| ID | Requirement |
| --- | --- |
| SRS-BASE-AUTO-001 | Auto card reward choices must pause intraday time. |
| SRS-BASE-AUTO-002 | Auto card choice generation must be reproducible from Run Seed and current state. |
| SRS-BASE-AUTO-003 | Card evolution, rarity, and synergy must not be represented in the auto card reward pool. |

---

## 8. Document Event Trigger Rules

### 8.1 Global Event Rules

| Rule | Baseline |
| --- | ---: |
| Max document events per Day | 2 |
| Minimum gap between events | 45 sec intraday time |
| Earliest event time | 30 sec elapsed |
| Latest normal event time | 165 sec elapsed |
| Day 1 behavior | 1 low-risk event between 60 and 90 sec elapsed if no event has appeared |
| Pause behavior | Pause until the player chooses |

Only one document event can be active at a time.

### 8.2 Event Triggers

| Event | Trigger |
| --- | --- |
| 이상 흐름 질의서 | `surveillance >= 60` |
| 시장 과열 경보 | `personalParticipation >= 70` or `volatility >= 70` |
| 유동성 경색 보고 | `budget <= 35` or `marketLiquidity <= 25` |
| 커뮤니티 폭주 알림 | `personalParticipation >= 80` or Retail Swarm has been overheated for 30 sec |
| 경쟁 데스크 개입 보고 | `competitionPressure >= 65` |
| 급락 위험 통지 | `priceChangePercent <= crashLine + 6` |
| 내부 리스크 메모 | `holdingRatio >= 50` |
| 마감 전 정리 요청 | `timeRemainingSec <= 75` and (`holdingRatio >= 35` or `surveillance >= 60`) |

When multiple events qualify, choose the highest priority:

1. 급락 위험 통지,
2. 이상 흐름 질의서,
3. 시장 과열 경보,
4. 유동성 경색 보고,
5. 내부 리스크 메모,
6. 커뮤니티 폭주 알림,
7. 경쟁 데스크 개입 보고,
8. 마감 전 정리 요청.

### 8.3 Choice Effect Templates

Each event has 3 choices: stable, aggressive, avoid/watch.

| Choice Type | Baseline Pattern |
| --- | --- |
| Stable | Costs budget or pressure, lowers surveillance/volatility/social cost. |
| Aggressive | Improves pressure or opportunity, increases surveillance/volatility/social cost. |
| Avoid / Watch | No immediate cost, adds aftereffect risk or delayed pressure. |

### 8.4 Event Choice Baselines

| Event | Stable Choice | Aggressive Choice | Avoid / Watch Choice |
| --- | --- | --- | --- |
| 이상 흐름 질의서 | `budget -6`, `surveillance -12`, `marketPressure -8` | `marketPressure +10`, `surveillance +8`, `volatility +4` | `surveillance +10`, add high-surveillance aftereffect |
| 시장 과열 경보 | `personalParticipation -14`, `volatility -10`, `marketPressure -8` | `marketPressure +12`, `surveillance +7`, `socialCost +5` | `volatility +8`, panic risk +1 |
| 유동성 경색 보고 | `budget +6`, `marketPressure -10` | `budget -6`, `marketLiquidity +18`, `surveillance +4` | `volatility +8`, `marketLiquidity -5` |
| 커뮤니티 폭주 알림 | `personalParticipation -16`, `volatility -8` | `marketPressure +14`, `surveillance +8`, `socialCost +6` | 50% chance panic pressure, `socialCost +4` |
| 경쟁 데스크 개입 보고 | `budget -5`, `competitionPressure -16` | `marketPressure +10`, `surveillance +6`, `competitionPressure -8` | `competitionPressure +10` |
| 급락 위험 통지 | `budget -8`, `marketPressure +20`, `volatility -8` | `holdingRatio +8`, `marketPressure +15`, `surveillance +8` | `volatility +10`, collapse aftereffect risk |
| 내부 리스크 메모 | `holdingRatio -12`, `budget +8`, `marketPressure -10` | `marketPressure +12`, `surveillance +7`, `socialCost +5` | add holding-risk settlement warning |
| 마감 전 정리 요청 | `holdingRatio -10`, `surveillance -5`, `budget +4` | `marketPressure +16`, `volatility +8`, `surveillance +8` | no immediate change |

| ID | Requirement |
| --- | --- |
| SRS-BASE-DOC-001 | Document event triggers must be condition-based and capped by the global event rules. |
| SRS-BASE-DOC-002 | Document event effects must use safe fictional terminology and abstract stats only. |
| SRS-BASE-DOC-003 | Day 1 must avoid high-risk event chains before the player has seen the basic loop. |

---

## 9. Settlement Baselines

### 9.1 Day Profit Bands

| Profit Band | Day Profit |
| --- | ---: |
| High | `>= +18` |
| Normal | `+6` to `+17.99` |
| Low | `0` to `+5.99` |
| Loss | `< 0` |

### 9.2 Day Result Matrix

| Profit Band | Surveillance A~B | Surveillance C | Surveillance D~E | Surveillance F |
| --- | --- | --- | --- | --- |
| High | 완전 성공 | 위험 성공 | 고위험 성공 | 강제 실패 |
| Normal | 안정 운용 | 위험 운용 | 위험 운용 | 강제 실패 |
| Low | 조용한 실패 | 조용한 실패 | 위험 운용 | 강제 실패 |
| Loss | 손실 마감 | 손실 마감 | 손실 마감 | 강제 실패 |

`successfulDays` counts 완전 성공, 위험 성공, 고위험 성공, and 안정 운용.

### 9.3 Final Grade Baselines

Final grade is evaluated before social cost and holding-ratio penalties, then adjusted.

| Grade | Baseline Conditions |
| --- | --- |
| S | `cumulativeProfit >= 60`, `successfulDays >= 4`, final and average surveillance A~B, `finalHoldingRatio <= 45`, no forced failure |
| A | `cumulativeProfit >= 40`, `successfulDays >= 3`, average surveillance A~C, no forced failure |
| B | `cumulativeProfit >= 25`, `successfulDays >= 3`, average surveillance A~D, no forced failure |
| C | Survived 5 Days, `cumulativeProfit >= 0` or `successfulDays >= 2` |
| D | Survived 5 Days but does not meet C or higher |
| F | Forced failure |

Adjustment rules:

| Condition | Adjustment |
| --- | --- |
| `socialCost >= 75` | downgrade 2 grades |
| `socialCost >= 50` | downgrade 1 grade |
| `finalHoldingRatio >= 55` | downgrade 1 grade |
| Final surveillance E | downgrade 1 grade |

Grades cannot be downgraded below F.

### 9.4 Social Cost Baselines

| Source | Social Cost Delta |
| --- | ---: |
| End Day with `personalParticipation >= 75` | +6 |
| End Day with panic state | +10 |
| End Day with `volatility >= 75` | +6 |
| Aggressive document event choice | +4 to +6 as listed |
| End Day outside target band after high pressure | +5 |
| End Day with surveillance D/E | +5 |

| ID | Requirement |
| --- | --- |
| SRS-BASE-SETTLE-001 | Day result classification must use the Day result matrix unless forced failure occurs. |
| SRS-BASE-SETTLE-002 | Final grade must apply forced failure first. |
| SRS-BASE-SETTLE-003 | Social cost is an abstract game penalty and must not describe real-world harm or real-world procedures. |

---

## 10. Carryover and Aftereffect Baselines

| State | Next Day Baseline |
| --- | --- |
| `budget` | carries exactly |
| `cumulativeProfit` | carries exactly |
| `holdingRatio` | carries exactly |
| `surveillance` | carries at 60% rounded to nearest integer |
| `socialCost` | carries exactly |
| `autoCards` | card levels carry exactly |
| `personalParticipation` | carries at 30%, then applies aftereffects |
| `marketLiquidity` | resets to 50, then applies aftereffects |
| `volatility` | resets to 35, then applies aftereffects |
| Pre-open card effects | do not carry |

Market aftereffects last 1 Day by default. A maximum of 3 aftereffects can be active at Day start. If more than 3 are generated, keep the 3 highest severity effects.

| Aftereffect | Trigger | Next Day Effect |
| --- | --- | --- |
| Overheated Close | End Day with `personalParticipation >= 75` | `personalParticipation +10`, `volatility +6` |
| Panic Close | End Day in panic | `personalParticipation -8`, `volatility +10`, `marketPressure -6` |
| High Surveillance | End Day surveillance D/E | `surveillance +5`, surveillance gains +10% for Day |
| High Profit Attention | Day profit High | `personalParticipation +8`, `competitionPressure +5` |
| Excess Holding | End Day `holdingRatio >= 55` | `surveillance +5`, `competitionPressure +8` |

Morning News residual:

| Rule | Baseline |
| --- | --- |
| Residual duration | 1 next Day |
| Residual strength | 25% of original news pressure |
| Stacking | Use strongest residual only |
| Priority | New Morning News is always stronger than residual news |

| ID | Requirement |
| --- | --- |
| SRS-BASE-CARRY-001 | Market aftereffects must be weaker than current Day Morning News. |
| SRS-BASE-CARRY-002 | Carryover must not create unlimited compounding across the full 5-Day Run. |
| SRS-BASE-CARRY-003 | Pre-open card effects must not carry to the next Day. |

---

## 11. Persistence Baseline

MVP uses localStorage only.

| Storage Key | Content |
| --- | --- |
| `mms.currentRun.v1` | Current Run state needed to resume |
| `mms.recentFinal.v1` | Most recent Final Settlement |
| `mms.bestRecord.v1` | Best final grade and best cumulative profit |

All stored objects must include:

```text
schemaVersion = 1
savedAt = ISO timestamp
```

If a saved object has an incompatible schema version, MVP may discard it and start fresh. MVP does not require migration tooling.

Best record comparison:

1. Higher Final grade wins.
2. If grade is tied, higher cumulative profit wins.
3. If still tied, lower final surveillance wins.

| ID | Requirement |
| --- | --- |
| SRS-BASE-SAVE-001 | Persistence must not store detailed replay logs. |
| SRS-BASE-SAVE-002 | Persistence must not store cloud account data or online ranking data. |
| SRS-BASE-SAVE-003 | Incompatible saves may be discarded safely in MVP. |

---

## 12. Failure and Main Menu Clarifications

Run failure is handled as a Final Settlement variant.

| Rule | Baseline |
| --- | --- |
| Failure phase | `run_failed` internal phase |
| Display | Final Settlement layout variant |
| Grade | F |
| Required fields | failure reason, Day, current price change, surveillance, budget |
| Buttons | `같은 조건으로 재시작`, `새 Run 시작` |

Main Menu MVP scope:

1. `새 Run 시작`,
2. `이어하기` if `mms.currentRun.v1` exists,
3. inline best Final grade,
4. inline best cumulative profit.

No separate records screen is required for MVP. MVP settings may be omitted unless implementation later adds a basic audio toggle.

| ID | Requirement |
| --- | --- |
| SRS-BASE-UI-001 | Run failure must not add a ninth MVP screen. |
| SRS-BASE-UI-002 | Main Menu records must be inline in MVP. |
| SRS-BASE-UI-003 | Separate advanced settings or statistics screens remain outside MVP. |

---

## 13. SRS Freeze Impact

This document closes the following readiness items from SRS v0.1.5:

1. Asset Catalog IDs and Display Names,
2. Run Start Baseline State,
3. Market Board Selection Rule,
4. Pre-open Card Effects,
5. Manual Action Cooldowns,
6. Auto Card Reward Timing,
7. Document Event Trigger and Cooldown Rules,
8. Settlement Thresholds,
9. Carryover and Market Aftereffect Rates,
10. localStorage Schema,
11. Run Failure Screen Handling,
12. Main Menu Records and Settings Scope.

Remaining work before implementation should focus on consistency review and playtest-driven tuning, not new MVP feature decisions.
