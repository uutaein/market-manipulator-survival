# SRS v0.1.1 — Tick Price Formula

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | SRS (Software Requirements Specification) |
| 제품명 | Market Manipulator Survival |
| 문서 범위 | Tick Price Formula |
| 버전 | v0.1.1 |
| 상태 | Draft |
| 작성일 | 2026-06-13 |
| 기준 PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| 기준 SRS | ./market-manipulator-survival-srs-v0.1.0-core-game-state.md |

이 문서는 MVP 대상 종목과 비플레이어 종목의 가격 Tick 계산 요구사항을 정의한다.

가격 계산은 실제 금융 모델이 아니다.  
이 공식은 허구 시장 압력, 군중 심리, 변동성, 뉴스 효과를 게임용 수치로 변환하기 위한 단순 Tick Formula다.

---

## 1. Design Goal

MVP 가격 Tick 공식은 다음 감각을 목표로 한다.

1. 가격은 매초 작게 흔들린다.
2. 플레이어가 아무것도 하지 않으면 큰 상승보다 완만한 횡보/하락 위험이 많다.
3. `매수봇`, `관심 신호`, `유동성 공급`은 가격을 움직이게 하지만 감시/변동성 리스크를 만든다.
4. `매도봇`, `변동성 흡수`, `가격 지지`는 급격한 이탈을 줄인다.
5. 변동성이 높으면 목표 밴드 도달도 쉬워질 수 있지만 붕괴 위험도 커진다.
6. 가격은 한 Tick에 너무 크게 움직이지 않도록 제한한다.
7. 계수와 효과량은 코드에 고정하지 않고 밸런싱 데이터로 분리할 수 있어야 한다.

### 1.1 Modularity Requirements

| ID | Requirement |
| --- | --- |
| SRS-PRICE-MOD-001 | 가격 Tick 공식은 `pressure`, `participation`, `holding`, `liquidity`, `competition`, `news`, `aftereffect`, `volatilityNoise` 컴포넌트로 분리되어야 한다. |
| SRS-PRICE-MOD-002 | 각 컴포넌트의 계수는 밸런싱 데이터에서 교체 가능해야 한다. |
| SRS-PRICE-MOD-003 | 수동 액션 효과량, 자동 카드 효과량, 뉴스 압력값, 시장 여파 압력값은 가격 공식 본문과 분리되어야 한다. |
| SRS-PRICE-MOD-004 | 대상 종목 가격 계산과 비플레이어 종목 간략 계산은 별도 계산 경로로 유지해야 한다. |
| SRS-PRICE-MOD-005 | 같은 입력 상태와 같은 `runSeed`에서는 동일한 Tick 결과가 재현되어야 한다. |

---

## 2. Tick Timing

| 항목 | 값 |
| --- | ---: |
| Tick interval | 1초 |
| Intraday duration | 360초 |
| Ticks per Day | 360 |

| ID | Requirement |
| --- | --- |
| SRS-PRICE-TICK-001 | 장중 가격 계산은 1초마다 1회 수행한다. |
| SRS-PRICE-TICK-002 | 문서 이벤트로 장중 시간이 일시정지된 동안에는 가격 Tick을 수행하지 않는다. |
| SRS-PRICE-TICK-003 | Day당 최대 가격 Tick 수는 360회를 기준으로 한다. |

---

## 3. Core Price State

대상 종목 가격은 절대 가격이 아니라 Day 시작가 대비 등락률로 관리한다.

| 변수 | 범위 | 설명 |
| --- | --- | --- |
| `priceChangePercent` | 제한 없음, UI 권장 -40~+40 | Day 시작가 대비 등락률 |
| `targetBandMin` | 보통 +6~+10 | 목표 밴드 하한 |
| `targetBandMax` | 보통 +10~+16 | 목표 밴드 상한 |
| `crashLine` | 보통 -18~-25 | 즉시 실패 가격 붕괴선 |
| `priceDeltaPerTick` | -0.45~+0.45 | 1초 Tick당 가격 변화량 |

MVP 기본값은 다음을 권장한다.

| 항목 | 기본값 |
| --- | ---: |
| `targetBandMin` | +8% |
| `targetBandMax` | +12% |
| `crashLine` | -20% |
| Tick당 최대 상승 | +0.45%p |
| Tick당 최대 하락 | -0.45%p |

종목 난이도와 Today Condition은 목표 밴드와 붕괴선을 소폭 조정할 수 있다.

---

## 4. Player Asset Tick Formula

대상 종목의 1초 가격 변화는 다음 순서로 계산한다.

```text
pressureComponent =
  marketPressure * 0.0024

participationComponent =
  (personalParticipation - 40) * 0.0008

holdingComponent =
  (holdingRatio - 20) * 0.0006

liquidityComponent =
  (marketLiquidity - 50) * 0.0005

competitionComponent =
  competitionPressure * -0.0005

newsComponent =
  activeNewsPricePressure

aftereffectComponent =
  marketAftereffectPressure

directionalDelta =
  pressureComponent
  + participationComponent
  + holdingComponent
  + liquidityComponent
  + competitionComponent
  + newsComponent
  + aftereffectComponent

liquidityMultiplier =
  0.75 + (marketLiquidity / 100) * 0.75

volatilityNoise =
  seededRandom(-1, 1) * (0.015 + volatility * 0.0012)

rawDelta =
  directionalDelta * liquidityMultiplier
  + volatilityNoise

priceDeltaPerTick =
  clamp(rawDelta, -0.45, +0.45)

priceChangePercent =
  priceChangePercent + priceDeltaPerTick
```

### 4.1 Formula Notes

| 요소 | 의도 |
| --- | --- |
| `marketPressure` | 플레이어 액션과 자동 카드가 만드는 주 방향성 |
| `personalParticipation` | 40 이상이면 가격 반응 보너스, 낮으면 추진 어려움 |
| `holdingRatio` | 20 이상이면 영향력 보너스, 낮으면 힘 부족 |
| `marketLiquidity` | 가격 반응성을 키우지만 흔들림도 커질 수 있음 |
| `competitionPressure` | 가격 추진을 방해하는 저항 |
| `activeNewsPricePressure` | 당일 Morning News의 방향성 |
| `marketAftereffectPressure` | 전날 시장 여파의 약한 잔류 효과 |
| `volatilityNoise` | 변동성에 따른 흔들림 |

---

## 5. Component Ranges

### 5.1 Market Pressure

| 상태 | 값 |
| --- | ---: |
| 강한 하락 압력 | -80~-100 |
| 약한 하락 압력 | -20~-40 |
| 중립 | -10~+10 |
| 약한 상승 압력 | +20~+40 |
| 강한 상승 압력 | +60~+100 |

`marketPressure`는 -100~+100 범위로 보정한다.

### 5.2 News Price Pressure

| Morning News | `activeNewsPricePressure` 권장값 |
| --- | ---: |
| 섹터 호재 | +0.035 |
| 섹터 악재 | -0.045 |
| 시장 침체 | -0.030 |
| 규제 경고 | -0.015 |
| 과열 확산 | +0.025 |

뉴스 효과가 대상 종목과 직접 관련되면 위 값을 그대로 적용한다.  
같은 섹터만 관련되면 70%를 적용한다.  
시장 전체 뉴스는 50%를 적용한다.

### 5.3 Market Aftereffect Pressure

| 시장 여파 | `marketAftereffectPressure` 권장값 |
| --- | ---: |
| 전날 과열 마감 | +0.012 |
| 전날 패닉 마감 | -0.018 |
| 높은 감시등급 | -0.010 |
| 높은 실제 수익 | +0.008 |
| 과도한 보유 비중 | -0.012 |

시장 여파는 새 Day의 Morning News보다 약해야 한다.

### 5.4 Volatility Noise

| `volatility` | 흔들림 범위 예 |
| ---: | --- |
| 0 | 약 ±0.015%p |
| 25 | 약 ±0.045%p |
| 50 | 약 ±0.075%p |
| 75 | 약 ±0.105%p |
| 100 | 약 ±0.135%p |

변동성은 방향성이 아니라 흔들림이다.  
높은 변동성은 목표 밴드 진입과 붕괴 위험을 모두 키운다.

---

## 6. Manual Action Price Effects

수동 액션은 `marketPressure`, `marketLiquidity`, `holdingRatio`, `volatility`, `surveillance` 등을 바꿔 간접적으로 가격 Tick에 영향을 준다.

MVP 권장 수치는 다음이다.

| 수동 액션 | 즉시 상태 변화 | 지속 시간 |
| --- | --- | --- |
| 유동성 공급 | `marketLiquidity +22`, `volatility +6`, `surveillance +2`, `budget -2` | 점진 적용 |
| 매수봇 | `holdingRatio +5`, `marketPressure +52`, `volatility +10`, `surveillance +7`, `budget -4` plus actual purchase budget for acquired units | 점진 적용 |
| 매도봇 | `budget -4`, `holdingRatio -4`, `marketPressure -42`, `volatility -10`, average-entry compression when applicable | 점진 적용 |
| 포지션 정리 | current-price-based `budget` recovery, `holdingRatio -12`, `marketPressure -58`, `volatility +22` | 점진 적용 |

| ID | Requirement |
| --- | --- |
| SRS-PRICE-ACTION-001 | 수동 액션은 가격을 직접 고정값으로 이동시키지 않고, 상태 변수를 통해 Tick 공식에 영향을 줘야 한다. |
| SRS-PRICE-ACTION-002 | `매수봇`은 가장 강한 단기 상승 압력 액션이어야 하며, 늘어난 보유량에는 실제 매입 대금 차감이 따라야 한다. |
| SRS-PRICE-ACTION-003 | `매도봇`은 상승 압력을 줄이고 평단 압박 관리에 기여해야 한다. |
| SRS-PRICE-ACTION-004 | `포지션 정리`는 수익실현 또는 손실차단 역할을 하며 가격 지지력을 약화시켜야 한다. |

---

## 7. Auto Card Price Effects

자동 카드는 주기적으로 상태를 바꿔 Tick 공식에 영향을 준다.

MVP 권장 수치는 Lv.1 기준이며, Lv.2~Lv.3은 효과량 또는 발동 주기 중 하나만 개선한다.

| 자동 카드 | Lv.1 발동 주기 | Lv.1 효과 |
| --- | ---: | --- |
| 관심 신호 | 12초 | `personalParticipation +4`, `surveillance +1` |
| 유동성 순환 | 14초 | `marketLiquidity +5`, `volatility +1` |
| 가격 지지 | 10초 | `marketPressure +6` if `priceChangePercent < targetBandMin` |
| 변동성 흡수 | 12초 | `volatility -4`, `marketPressure -1` |
| 뉴스 증폭 | 15초 | `activeNewsPricePressure` 20% 강화 |
| 감시 완충 | 16초 | 다음 감시도 증가량 20% 감소 |
| 경쟁 견제 | 14초 | `competitionPressure -5`, `surveillance +1` |
| 정리 루틴 | 18초 | `포지션 정리`의 시장 충격과 변동성 부담 완화. 자동 매도 없음 |

| 레벨 | 개선 규칙 |
| --- | --- |
| Lv.1 | 기본 효과 |
| Lv.2 | 효과량 +30% 또는 발동 주기 -15% |
| Lv.3 | 효과량 +60% 또는 발동 주기 -25% |

MVP에서는 카드별로 효과량 성장형 또는 주기 단축형 중 하나만 사용한다.  
분기 업그레이드와 카드 진화는 MVP에 포함하지 않는다.

---

## 8. Retail Swarm Price Effects

Retail Swarm은 `personalParticipation` 상태를 시각화하며, 가격 Tick에도 영향을 준다.

| 개인 참여도 | Swarm State | 가격 영향 |
| ---: | --- | --- |
| 0~25 | 관심 낮음 | 추진 어려움 |
| 26~60 | 관심 | 정상 반응 |
| 61~85 | 과열 | 상승 반응 증가, 감시/변동성 증가 |
| 86~100 | 패닉 위험 | 급격한 방향 전환 가능 |

패닉 상태가 발생하면 다음 보정을 적용한다.

```text
marketPressure = marketPressure - 35
volatility = volatility + 15
surveillance = surveillance + 5
```

패닉은 즉시 실패 조건은 아니지만 가격 붕괴선 접근 위험을 높인다.

---

## 9. Non-player Asset Formula

비플레이어 종목 7개는 간략 계산한다.

```text
nonPlayerDelta =
  sectorNewsPressure
  + marketNewsPressure
  + trendBias
  + seededRandom(-1, 1) * (0.02 + simplifiedVolatility * 0.0008)

nonPlayerPriceChangePercent =
  nonPlayerPriceChangePercent + clamp(nonPlayerDelta, -0.25, +0.25)
```

| 변수 | 권장 범위 |
| --- | --- |
| `sectorNewsPressure` | -0.035~+0.030 |
| `marketNewsPressure` | -0.020~+0.015 |
| `trendBias` | -0.010~+0.010 |
| Tick당 최대 변화 | -0.25~+0.25%p |

비플레이어 종목은 감시도, 보유 비중, 예산, 수동 액션 영향을 직접 받지 않는다.  
단, 같은 섹터 뉴스와 시장 전체 뉴스는 간략 반영한다.

---

## 10. Failure and Clamp Rules

| ID | Requirement |
| --- | --- |
| SRS-PRICE-FAIL-001 | `priceChangePercent <= crashLine`이면 즉시 Run 실패를 발생시켜야 한다. |
| SRS-PRICE-FAIL-002 | 대상 종목의 Tick당 가격 변화는 -0.45~+0.45%p로 제한해야 한다. |
| SRS-PRICE-FAIL-003 | 비플레이어 종목의 Tick당 가격 변화는 -0.25~+0.25%p로 제한해야 한다. |
| SRS-PRICE-FAIL-004 | 0~100 범위 상태는 Tick 계산 후 0~100으로 보정해야 한다. |
| SRS-PRICE-FAIL-005 | `surveillance >= 100` 또는 `budget < minimumBudget`이면 가격 Tick 결과와 무관하게 즉시 Run 실패를 발생시켜야 한다. |

---

## 11. Tuning Expectations

기본 수치 기준에서 기대하는 Day 흐름은 다음이다.

| 플레이 패턴 | 예상 결과 |
| --- | --- |
| 아무 행동도 하지 않음 | 가격은 대체로 횡보하거나 약하게 하락하며 목표 밴드 도달이 어렵다. |
| 유동성 공급만 반복 | 가격 반응은 커지지만 변동성과 감시 리스크가 누적된다. |
| 매수봇만 반복 | 단기 상승과 보유량 증가는 강하지만 예산, 감시도, 변동성 리스크가 빠르게 커진다. |
| 매도봇을 섞음 | 목표 밴드 안착은 느려지지만 평단 압박, 감시/변동성 리스크가 낮아진다. |
| 포지션 정리를 하지 않음 | 장중 영향력은 높지만 정산 리스크가 커진다. |
| 패닉 발생 | 하락 압력과 변동성이 커져 붕괴선 접근 위험이 높아진다. |

---

## 12. Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| SRS-PRICE-AC-001 | 중립 상태에서 대상 종목 가격은 60초 동안 큰 방향성 없이 작게 흔들려야 한다. |
| SRS-PRICE-AC-002 | `매수봇`을 사용하면 진행 시간 동안 가격 상승 압력, 보유량, 평균단가 상승이 눈에 띄게 증가해야 한다. |
| SRS-PRICE-AC-003 | `매도봇`을 사용하면 상승 압력은 줄 수 있지만 평단 압박, 변동성, 감시 부담이 낮아져야 한다. |
| SRS-PRICE-AC-004 | 높은 변동성 상태에서는 Tick당 흔들림 폭이 커져야 한다. |
| SRS-PRICE-AC-005 | `priceChangePercent`가 `crashLine` 이하가 되면 즉시 Run 실패가 발생해야 한다. |
| SRS-PRICE-AC-006 | 같은 `runSeed`와 같은 입력 순서에서는 같은 가격 흐름이 재현되어야 한다. |
| SRS-PRICE-AC-007 | 비플레이어 종목은 플레이어 종목보다 단순하고 작은 폭으로 움직여야 한다. |
| SRS-PRICE-AC-008 | 공식은 실제 금융 시장 데이터나 실제 종목 정보를 요구하지 않아야 한다. |

---

## 13. Open Balancing Items

다음 항목은 플레이 테스트 후 조정할 수 있다.

1. Tick당 최대 변화량
2. 목표 밴드 기본값
3. 붕괴선 기본값
4. `marketPressure` 계수
5. `volatilityNoise` 계수
6. 수동 액션 비용과 지속 시간
7. 자동 카드 발동 주기
8. 뉴스별 `activeNewsPricePressure`
9. 패닉 발생 기준
10. Day 1 보정값

---

## 14. Related Design Document

가격 공식과 장중 시뮬레이션의 모듈 경계는 다음 SDD에서 정의한다.

- `../sdd/market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md`
