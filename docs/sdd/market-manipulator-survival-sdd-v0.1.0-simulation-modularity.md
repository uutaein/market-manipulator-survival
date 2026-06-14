# SDD v0.1.0 — Simulation Modularity

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | SDD (Software Design Document) |
| 제품명 | Market Manipulator Survival |
| 문서 범위 | Simulation Modularity |
| 버전 | v0.1.0 |
| 상태 | Draft / 첫 플레이어블 구현 기준 반영 |
| 작성일 | 2026-06-13 |
| 현행화일 | 2026-06-14 |
| 기준 PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| 기준 SRS | ../srs/market-manipulator-survival-srs-v0.1.0-core-game-state.md, ../srs/market-manipulator-survival-srs-v0.1.1-tick-price-formula.md |

이 문서는 MVP 장중 시뮬레이션을 나중에 쉽게 개선할 수 있도록 모듈 경계를 정의한다.

목표는 정교한 엔진을 만드는 것이 아니라, 가격 공식, 카드 효과, 뉴스 효과, 시장 여파, 정산 계산을 서로 느슨하게 분리해 플레이테스트 후 수치를 바꾸기 쉽게 만드는 것이다.

---

## 1. Design Principles

1. 공식보다 데이터 조정을 우선한다.
2. 상태 변경은 한 방향으로 흐르게 한다.
3. 가격 계산은 여러 컴포넌트의 합산 결과로 만든다.
4. 수동 액션, 자동 카드, 뉴스, 문서 이벤트는 직접 가격을 덮어쓰지 않고 상태 효과를 생성한다.
5. 대상 종목 상세 계산과 비플레이어 종목 간략 계산은 분리한다.
6. 같은 `runSeed`와 같은 입력 순서에서는 같은 결과가 재현되어야 한다.
7. 실제 시장 데이터나 실제 금융 모델은 어떤 모듈에도 넣지 않는다.

---

## 2. Proposed Module Boundaries

| 모듈 | 책임 | 바꾸기 쉬워야 하는 것 |
| --- | --- | --- |
| `RunSeed` | Run 재현성, 랜덤 소스 제공 | Seed 생성 방식 |
| `RunState` | 5-Day Run 전체 상태 보관 | 이월 항목 |
| `DaySetup` | Morning News, Today Condition, 목표 밴드 생성 | Day 시작 조건 |
| `PriceTick` | 대상 종목 가격 Tick 계산 | 가격 컴포넌트 계수 |
| `OrderBookDepth` | 대상 종목 fictional 호가창/매물대 깊이 생성 | 깊이 배수와 표시 모델 |
| `MarketBoardTick` | 같은 섹터 경쟁 종목, 타 섹터 평균, 24개 종목 거래대금 대시보드 간략 계산 | 간략 등락/거래대금 공식 |
| `ChartMotionAdapter` | seeded fake OHLCV와 차트 모션 보정 | 평균회귀, 저항, 되돌림, 볼륨 임펄스 |
| `ActionEffect` | 수동 액션 효과 생성 | 비용, 쿨다운, 효과량 |
| `AccountValuation` | 장중 순자산/총손익/Day손익 표시 계산 | 예산, 보유 비중, 평균단가, 종목 영향력 저항 |
| `AutoCardEffect` | 자동 카드 주기 발동 효과 생성 | 발동 주기, 레벨 성장 |
| `NewsEffect` | Morning News 효과 생성 | 뉴스별 압력/위험 수치 |
| `DocumentEventEffect` | 문서 이벤트 선택 효과 생성 | 선택지 효과 |
| `SwarmState` | 개인 참여도와 Retail Swarm 상태 변환 | 관심/과열/패닉 기준 |
| `Aftereffect` | Day 간 시장 여파 생성/감쇠 | 잔류율, 영향 대상 |
| `Settlement` | Day/Final 결과 산정 | 수익/등급 컷 |
| `Persistence` | localStorage 저장/복원 | 저장 키, 마이그레이션 |

이 모듈명은 구현 파일명을 확정하지 않는다.  
구현 단계에서는 이 책임 경계를 유지하는 선에서 더 단순한 구조로 합쳐도 된다.

---

## 3. Data-Driven Balancing

MVP에서 자주 바뀔 수치는 코드 로직이 아니라 밸런싱 데이터로 관리해야 한다.

| 데이터 그룹 | 포함 항목 |
| --- | --- |
| Price Coefficients | 압력, 참여도, 보유 비중, 유동성, 경쟁 압박, 변동성 노이즈 계수 |
| Clamp Values | Tick당 최대 상승/하락, 상태 최소/최대 |
| Asset Market Profiles | 종목별 baseline trade value, 시장 역할, influence resistance |
| Order Book / Depth Values | fictional 호가창 깊이, 매물대 반응 배수 |
| Manual Action Values | 비용, 쿨다운, 상태 변화량, 지속 시간 |
| Account Valuation Values | 포지션 평가 정규화, 회수율, 표시 반올림 |
| Auto Card Values | 발동 주기, Lv.1~Lv.3 효과, 성장 방식 |
| News Values | 뉴스 템플릿별 가격 압력, 감시/변동성/참여도 보정 |
| Aftereffect Values | 과열, 패닉, 고감시, 높은 수익, 과도한 보유 비중의 잔류 효과 |
| Settlement Values | 수익 구간, 보유 비중 패널티, 사회적 비용 보정 |
| Day 1 Values | Day 1 완화 보정, 확정 문서 이벤트, 힌트 조건 |

The first MVP baseline for these data groups is defined in:

- `../srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md`

### 3.1 Required Balancing Rule

| ID | Requirement |
| --- | --- |
| SDD-MOD-DATA-001 | 위 데이터 그룹은 가격 공식이나 상태 전이 로직과 분리되어야 한다. |
| SDD-MOD-DATA-002 | 수치 변경만으로 플레이 감각을 조정할 수 있어야 한다. |
| SDD-MOD-DATA-003 | 새 수치를 적용하기 위해 상태 구조 전체를 바꾸지 않아야 한다. |
| SDD-MOD-DATA-004 | MVP에서는 데이터 편집 UI를 만들지 않는다. |
| SDD-MOD-DATA-005 | 장중 순자산/총손익/Day손익 계산은 가격 Tick 공식과 분리하고, 포지션 획득 비용에 쓰는 asset influence resistance와 같은 기준을 사용해야 한다. 총손익은 Run 시작 예산 기준, Day손익은 해당 Day 시작 예산 기준으로 분리한다. |

### 3.2 MVP Balancing Modules

The implementation should keep the following conceptual balancing modules separate.

| Balancing Module | Source SRS Section | Primary Consumers |
| --- | --- | --- |
| `runDefaults` | SRS v0.1.6 section 3 | Run setup, Day setup |
| `assetCatalog` | SRS v0.1.6 section 2 | Run setup, Market Board |
| `marketBoardRules` | SRS v0.1.6 section 4 | Market Board |
| `preOpenCardValues` | SRS v0.1.6 section 5 | Pre-open flow, Day setup |
| `manualActionValues` | SRS v0.1.6 section 6 | ActionEffect |
| `autoCardValues` | SRS v0.1.6 section 7 | AutoCardEffect |
| `autoRewardRules` | SRS v0.1.6 section 7 | Auto card reward choice |
| `documentEventRules` | SRS v0.1.6 section 8 | DocumentEventEffect |
| `settlementValues` | SRS v0.1.6 section 9 | Settlement |
| `carryoverValues` | SRS v0.1.6 section 10 | Aftereffect, Day setup |
| `persistenceKeys` | SRS v0.1.6 section 11 | Persistence |

These names are conceptual module names, not required file names. Implementation can combine small modules if the balancing groups remain easy to find and change.

---

## 4. Tick Pipeline

장중 1초 Tick은 다음 순서를 따른다.

```text
1. 입력/대기 효과 확인
2. 수동 액션 효과 적용
3. 자동 카드 타이머 처리
4. 자동 카드 효과 적용
5. 문서 이벤트 발생 여부 확인
6. 문서 이벤트가 없으면 가격 Tick 계산
7. Retail Swarm 상태 갱신
8. 시장 보드 간략 Tick 계산
9. 실패 조건 확인
10. UI 표시 상태 갱신
```

문서 이벤트가 활성화되면 Tick Pipeline은 가격 계산을 멈추고 이벤트 선택을 기다린다.

---

## 5. PriceTick Module

`PriceTick`은 대상 종목 가격 계산만 담당한다.

### 5.1 Inputs

1. 현재 `priceChangePercent`
2. `marketPressure`
3. `personalParticipation`
4. `holdingRatio`
5. `marketLiquidity`
6. `competitionPressure`
7. `activeNewsPricePressure`
8. `marketAftereffectPressure`
9. `volatility`
10. `assetInfluenceResistance`
11. fictional `orderBookMultiplier`
12. seeded chart motion / fake OHLCV adjustment
13. Seeded random source
14. Price coefficient data

### 5.2 Outputs

1. `priceDeltaPerTick`
2. 갱신된 `priceChangePercent`
3. 붕괴선 접근 여부

### 5.3 Non-responsibilities

`PriceTick`은 다음을 직접 처리하지 않는다.

1. 수동 액션 비용 차감
2. 자동 카드 레벨업
3. 문서 이벤트 선택지 처리
4. Day Settlement 결과 산정
5. localStorage 저장

---

## 6. Effect Modules

수동 액션, 자동 카드, 뉴스, 문서 이벤트는 모두 “상태 효과”를 생성한다.

```text
Effect =
  대상 상태
  변화량
  지속 시간
  감쇠 방식
  출처
```

MVP에서는 복잡한 버프 시스템을 만들 필요는 없다.  
다만 효과의 출처를 구분해야 플레이테스트 중 어떤 시스템이 가격을 과하게 움직이는지 추적할 수 있다.

| 출처 | 예 |
| --- | --- |
| Manual Action | 매수봇, 유동성 공급 |
| Auto Card | 관심 신호, 가격 지지 |
| Morning News | 섹터 호재, 시장 침체 |
| Document Event | 시장 과열 경보 선택 결과 |
| Market Aftereffect | 전날 패닉 마감 여파 |

---

## 7. Randomness Boundary

무작위성은 `RunSeed`에서 파생된 재현 가능한 랜덤 소스를 사용해야 한다.

| 용도 | Seed 사용 여부 |
| --- | --- |
| Run별 Asset Profile 배정 | 사용 |
| Morning News 대상 | 사용 |
| Today Condition | 사용 |
| 가격 변동성 노이즈 | 사용 |
| 비플레이어 종목 간략 변동 | 사용 |
| UI 장식용 흔들림 | 재현 필요 없음 |

| ID | Requirement |
| --- | --- |
| SDD-MOD-RAND-001 | 같은 Run Seed와 같은 입력 순서에서는 가격 흐름이 재현되어야 한다. |
| SDD-MOD-RAND-002 | 게임 결과에 영향을 주는 랜덤은 재현 가능한 랜덤 소스에서 가져와야 한다. |
| SDD-MOD-RAND-003 | 단순 UI 연출용 랜덤은 게임 결과 상태를 바꾸면 안 된다. |

---

## 8. Settlement Boundary

`Settlement`는 장중 Tick 계산과 분리한다.

Day Settlement는 다음 입력만 사용한다.

1. Day 종료 가격 성과
2. Day 실제 수익
3. 감시등급
4. 잔여 예산
5. 보유 비중
6. 개인 참여도 최종 상태
7. 변동성
8. 사회적 비용
9. 강제 실패 여부

Final Settlement는 Run 전체 누적 상태를 사용한다.

가격 공식은 Day/Final 결과명을 직접 결정하지 않는다.

---

## 9. Logging for Balancing

MVP 저장 대상에는 상세 플레이 로그를 포함하지 않는다.

다만 개발 중 밸런싱을 위해 세션 중 메모리 또는 개발 콘솔 수준의 진단 정보는 허용한다.

권장 진단 항목은 다음이다.

1. Tick별 `priceDeltaPerTick`
2. 컴포넌트별 기여량
3. 수동 액션 사용 시점
4. 자동 카드 발동 시점
5. 문서 이벤트 발생/선택 시점
6. 실패 조건 도달 원인

이 진단 정보는 MVP 플레이어 저장 데이터에 포함하지 않는다.

---

## 10. Change Safety Rules

| ID | Requirement |
| --- | --- |
| SDD-MOD-SAFE-001 | 새 가격 컴포넌트를 추가할 때는 기존 컴포넌트를 직접 수정하기보다 별도 컴포넌트로 추가해야 한다. |
| SDD-MOD-SAFE-002 | 수동 액션이나 자동 카드 수치를 바꿀 때는 PriceTick 공식 자체를 수정하지 않아야 한다. |
| SDD-MOD-SAFE-003 | 비플레이어 종목 계산을 정교하게 만들더라도 대상 종목 상세 계산과 결합하지 않아야 한다. |
| SDD-MOD-SAFE-004 | 실제 시장 데이터, 실제 종목명, 실제 거래소명은 어떤 모듈에도 입력하지 않는다. |
| SDD-MOD-SAFE-005 | 플레이테스트 후 조정은 우선 밸런싱 데이터 변경으로 해결하고, 구조 변경은 마지막에 검토한다. |
| SDD-MOD-SAFE-006 | 금융 도메인 전문가 검토, 실제 시장 검증, 실제 금융 모델 확장은 MVP 범위에 포함하지 않는다. |

---

## 11. Internal Balancing Surface

MVP에서는 외부 금융 도메인 검토를 전제로 하지 않는다.  
밸런싱은 내부 플레이테스트와 게임 감각 검토를 기준으로 진행한다.

내부 밸런싱 담당자가 우선 확인할 표면은 다음이다.

| 검토 표면 | 관련 데이터 그룹 | 기대 산출물 |
| --- | --- | --- |
| 가격 반응성 | Price Coefficients, Clamp Values | 너무 둔한지/과격한지 판단 |
| 액션 리스크 | Manual Action Values | 버튼별 비용과 위험의 납득성 |
| 자동 카드 성장 | Auto Card Values | 카드가 빌드 재미를 만드는지 판단 |
| 뉴스 영향 | News Values | 당일 분위기 변화가 보이는지 판단 |
| 시장 여파 | Aftereffect Values | 전날 결과가 과하지 않게 남는지 판단 |
| 정산 리스크 | Settlement Values | 수익과 감시의 균형이 맞는지 판단 |
| Day 1 완화 | Day 1 Values | 첫 판이 너무 억울하지 않은지 판단 |

검토자는 코드 구조가 아니라 이 표면의 수치와 플레이 결과를 중심으로 피드백한다.  
실제 시장 정합성, 실제 금융 모델, 실제 시장 데이터 기반 검증은 MVP 밸런싱 기준이 아니다.

---

## 12. MVP Implementation Bias

첫 플레이어블 구현은 다음 의존성 방향을 따라 작게 시작했다.

1. Core Game State
2. PriceTick 단독 계산
3. 수동 액션 4개 효과
4. 자동 카드 8개 타이머
5. 문서 이벤트 일시정지와 선택 효과
6. 시장 보드 간략 Tick과 retained DOM/차트 오버레이
7. Day Settlement
8. Carryover
9. Final Settlement
10. localStorage 최소 저장

이 순서는 구현 계획이 아니라 설계상 의존성 방향이다.
