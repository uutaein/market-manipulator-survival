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
| `food_agri` | 식량·농업 | `food_agri_01` | 곡물회랑 | Regional supply desk with steady attention. |
| `food_agri` | 식량·농업 | `food_agri_02` | 온실노드 | Controlled-growth operator with weather-sensitive demand. |
| `food_agri` | 식량·농업 | `food_agri_03` | 수확셀 | Small seasonal desk with uneven participation. |
| `energy_grid` | 에너지·전력망 | `energy_grid_01` | 그리드램프 | Utility-adjacent desk with broad sector visibility. |
| `energy_grid` | 에너지·전력망 | `energy_grid_02` | 축전회랑 | Storage-themed desk with volatile attention bursts. |
| `energy_grid` | 에너지·전력망 | `energy_grid_03` | 전력노드 | Infrastructure desk with slower but stronger moves. |
| `bio_trial` | 바이오·임상 | `bio_trial_01` | 임상서랍 | Clinical-file desk with event-heavy sentiment. |
| `bio_trial` | 바이오·임상 | `bio_trial_02` | 바이오램프 | Research-themed desk with sharp attention swings. |
| `bio_trial` | 바이오·임상 | `bio_trial_03` | 세포문서 | Thin-flow desk with high uncertainty. |
| `automation_ai` | 자동화·AI | `automation_ai_01` | 오토서기 | Automation desk with strong crowd recognition. |
| `automation_ai` | 자동화·AI | `automation_ai_02` | 패턴엔진 | Pattern desk that reacts strongly to news. |
| `automation_ai` | 자동화·AI | `automation_ai_03` | 공정노드 | Factory-flow desk with moderate liquidity. |
| `chip_equipment` | 칩·장비 | `chip_equipment_01` | 웨이퍼문 | Component desk with sector-sensitive pressure. |
| `chip_equipment` | 칩·장비 | `chip_equipment_02` | 장비서랍 | Equipment desk with slower attention buildup. |
| `chip_equipment` | 칩·장비 | `chip_equipment_03` | 회로등대 | Signal-heavy desk with fast volatility changes. |
| `payment_fintech` | 결제·핀테크 | `payment_fintech_01` | 결제도장 | Settlement-themed desk with stable baseline interest. |
| `payment_fintech` | 결제·핀테크 | `payment_fintech_02` | 원장노드 | Ledger desk with medium liquidity and pressure. |
| `payment_fintech` | 결제·핀테크 | `payment_fintech_03` | 정산서랍 | Budget-efficient desk with surveillance sensitivity. |
| `media_game` | 미디어·게임 | `media_game_01` | 채널잉크 | Media desk with fast attention movement. |
| `media_game` | 미디어·게임 | `media_game_02` | 플레이문 | Game-themed desk with high participation variance. |
| `media_game` | 미디어·게임 | `media_game_03` | 방송노드 | Broadcast desk with broad but unstable interest. |
| `community_token` | 커뮤니티 토큰 | `community_token_01` | 포럼칩 | Community desk with fast crowd buildup. |
| `community_token` | 커뮤니티 토큰 | `community_token_02` | 밈원장 | Meme-led desk with high panic risk. |
| `community_token` | 커뮤니티 토큰 | `community_token_03` | 토큰광장 | Token-square desk with strong swarm response. |

---

## 3. Run and Day Baseline Values

| State | Baseline |
| --- | ---: |
| Run length | 5 Days |
| Intraday duration | 360 sec |
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

---

## 4. Market Board Selection Rules

MVP Market Board displays 8 assets.

| Slot | Rule |
| --- | --- |
| 1 | Player selected asset |
| 2~3 | The other two assets in the selected sector |
| 4~8 | Five representative assets from other sectors |

Representative asset priority:

1. Morning News affected sector or asset,
2. sectors with active market aftereffects,
3. sectors not yet shown today,
4. seeded random fill.

| ID | Requirement |
| --- | --- |
| SRS-BASE-MARKET-001 | The selected player asset must always be displayed. |
| SRS-BASE-MARKET-002 | Same-sector peers must be displayed unless the sector has fewer than 3 assets, which MVP does not allow. |
| SRS-BASE-MARKET-003 | If Morning News affects a non-player sector, at least one asset from that sector should appear in slots 4~8. |
| SRS-BASE-MARKET-004 | Non-player asset selection must be reproducible from the Run Seed and Day index. |

---

## 5. Pre-open Card Baseline Effects

| Card | Baseline Effect |
| --- | --- |
| 시장 관찰 | Reveals Morning News target type, target band, crash line, and one major risk hint. No stat cost. |
| 사전 포지션 구축 | `budget -10`, `holdingRatio +8`, `marketPressure +20` for first 30 sec, `surveillance +3`, `volatility +4`. |
| 방어 자금 배정 | Reserve 8 budget for the Day. First panic or collapse-risk event consumes reserve to apply `marketPressure +15`, `volatility -8`, `surveillance -3`. If unused, 6 budget returns at Day Settlement. |
| 관망 | No stat change. Preserves budget. |

| ID | Requirement |
| --- | --- |
| SRS-BASE-PREOPEN-001 | Pre-open card effects must apply only to the current Day. |
| SRS-BASE-PREOPEN-002 | `시장 관찰` must be informational and must not improve stats directly. |
| SRS-BASE-PREOPEN-003 | `방어 자금 배정` reserve must not carry to the next Day. |
| SRS-BASE-PREOPEN-004 | `관망` must be a valid explicit choice. |

---

## 6. Manual Action Baseline Values

Manual actions are unavailable while a document event or auto card reward choice is open.

| Action | Cost / Recovery | Cooldown | Baseline Effect |
| --- | ---: | ---: | --- |
| 유동성 공급 | `budget -6` | 8 sec | `marketLiquidity +18`, `volatility +4`, `surveillance +3`; liquidity bonus decays over 20 sec. |
| 가격 추진 | `budget -8` | 10 sec | `marketPressure +35` for 12 sec, `volatility +6`, `surveillance +5`. |
| 과열 해소 | `budget -4` | 12 sec | `marketPressure -18`, `personalParticipation -12`, `volatility -10`, `surveillance -4`. |
| 포지션 정리 | `budget +7` | 14 sec | `holdingRatio -10`, `marketPressure -12`, `volatility +3`. |

| ID | Requirement |
| --- | --- |
| SRS-BASE-ACTION-001 | Manual action buttons must show disabled state when the player cannot pay the cost or the action is on cooldown. |
| SRS-BASE-ACTION-002 | Budget recovery from `포지션 정리` must not raise budget above a future configurable Run budget cap if one is added. MVP may omit that cap. |
| SRS-BASE-ACTION-003 | Manual action values must live in `manualActionValues` or an equivalent balancing group. |

---

## 7. Auto Card Reward and Level Rules

### 7.1 Reward Timing

| Rule | Baseline |
| --- | --- |
| Starting auto card | 1 random Lv.1 card at Run start |
| Reward timing | At 90, 180, and 270 sec elapsed per Day |
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
| Minimum gap between events | 90 sec intraday time |
| Earliest event time | 45 sec elapsed |
| Latest normal event time | 320 sec elapsed |
| Day 1 behavior | 1 low-risk event between 120 and 180 sec elapsed if no event has appeared |
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
