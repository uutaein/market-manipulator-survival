# SRS v0.1.3 — Content and Interactions

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | SRS (Software Requirements Specification) |
| 제품명 | Market Manipulator Survival |
| 문서 범위 | Content and Interactions |
| 버전 | v0.1.3 |
| 상태 | First Playable Baseline / Playtest Tunable |
| 작성일 | 2026-06-13 |
| 현행화일 | 2026-06-14 |
| 기준 PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| 기준 SRS | ./market-manipulator-survival-srs-v0.1.0-core-game-state.md, ./market-manipulator-survival-srs-v0.1.1-tick-price-formula.md |

이 문서는 MVP 콘텐츠와 플레이어 상호작용 요구사항을 정의한다.

---

## 1. Scope

### 1.1 Included

1. Morning News 5개 템플릿
2. Pre-open Card 4개
3. 장중 수동 액션 4개
4. 장중 자동 카드 8개
5. 문서 이벤트 8개
6. Retail Swarm 3상태
7. Market Board 컨텍스트 10행과 24개 개별 종목 거래대금 대시보드

### 1.2 Excluded

1. 카드 진화와 조합 시너지
2. 희귀/전설 카드
3. 장중 속보 뉴스
4. 장중 복수 속보 동시 발생
5. 24개 전체 종목 상세 시뮬레이션
6. 실제 시장 데이터 기반 콘텐츠

---

## 2. Morning News

MVP Morning News는 5개 템플릿으로 제한한다.

| News ID | 표시명 | 주요 역할 |
| --- | --- | --- |
| `sector_positive_catalyst` | 섹터 호재 | 한 섹터의 관심과 상승 압력 증가 |
| `sector_negative_catalyst` | 섹터 악재 | 한 섹터의 하락 압력과 변동성 증가 |
| `market_slump` | 시장 침체 | 전체 관심과 예산 효율 감소 |
| `regulatory_warning` | 규제 경고 | 시작 감시도 또는 감시 민감도 증가 |
| `overheat_spread` | 과열 확산 | 개인 참여도, 변동성, 감시 리스크 증가 |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-NEWS-001 | 각 Day에는 Morning News가 정확히 3개 표시되어야 한다. |
| SRS-CONTENT-NEWS-002 | Morning News는 5개 템플릿과 허구 대상을 조합해 생성해야 한다. |
| SRS-CONTENT-NEWS-003 | 각 Day의 Morning News는 섹터 뉴스 1개와 허구 종목 뉴스 2개로 구성되어야 한다. |
| SRS-CONTENT-NEWS-004 | 실제 뉴스, 실제 사건, 실제 시장 데이터는 사용하지 않는다. |
| SRS-CONTENT-NEWS-005 | 비플레이어 종목 뉴스는 시장 보드 맥락과 배지에는 표시하되, 플레이어 종목 가격 계산에는 직접 반영하지 않아야 한다. |

---

## 3. Pre-open Cards

MVP Pre-open Card는 4개다.

| Card ID | 표시명 | 역할 |
| --- | --- | --- |
| `early_positioning` | 선취매 | Day 1 또는 보유 포지션이 없을 때는 현재 예산의 10~50%, Day 2 이후 보유 포지션이 있으면 0~50% 투입 비율을 조절해 보유 비중을 늘리거나 유지하는 카드 |
| `news_assignment` | 뉴스 배정 | 아침 뉴스 공개 전에 내 종목 호재 또는 악재 방향을 배정하는 카드 |
| `asset_analysis` | 종목 분석 | 매수봇과 매도봇 효과를 강화하는 카드 |
| `wait_and_see` | 관망 | 아무 카드도 쓰지 않고 예산을 보전한 채 개장 |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-PREOPEN-001 | 플레이어는 Day당 최대 1개의 Pre-open Card를 선택할 수 있어야 한다. |
| SRS-CONTENT-PREOPEN-002 | `관망`은 카드 미사용 선택으로 제공되어야 한다. |
| SRS-CONTENT-PREOPEN-003 | Pre-open Card 효과는 해당 Day에만 적용되어야 한다. |
| SRS-CONTENT-PREOPEN-004 | 개장 전 카드 선택은 Morning News 공개 전에 이뤄져야 한다. |
| SRS-CONTENT-PREOPEN-005 | 카드 선택 후 Morning News / Market Briefing을 확인하고 개장 승인 액션을 통해 장중 단계로 진입해야 한다. |
| SRS-CONTENT-PREOPEN-006 | `뉴스 배정`은 하나의 MVP 카드지만 `호재`와 `악재` 방향 버튼을 제공해야 한다. |
| SRS-CONTENT-PREOPEN-007 | `선취매`는 고정 비용이 아니라 드래그형 투입 비율 UI를 사용해야 한다. Day 1 또는 보유 포지션이 없을 때는 10~50%, Day 2 이후 보유 포지션이 있으면 0~50%를 선택할 수 있어야 한다. |
| SRS-CONTENT-PREOPEN-008 | Day 1 또는 보유 포지션이 없는 상태에서는 `선취매`만 선택 가능해야 한다. 다른 개장 전 카드는 비활성으로 보여줄 수 있다. |

---

## 4. Manual Actions

MVP 장중 수동 액션은 4개다.

| Action ID | 표시명 | 요구 역할 |
| --- | --- | --- |
| `liquidity_supply` | 유동성 공급 | 시장 유동성과 가격 반응성을 높인다. 예산을 소모하고 감시/변동성 리스크를 올릴 수 있다. |
| `price_push` | 매수봇 | 4B 시작 차감과 실제 매입 대금을 써서 보유 비중과 상방 압력을 키운다. 평단은 현재가 위치에 따라 오르거나, 매도봇 이후 싼 구간에서는 낮아질 수 있다. |
| `overheat_cooldown` | 매도봇 | 4B를 차감해 가격과 평단 압박을 낮추고 이후 더 싼 재매집 구간을 만든다. 보유 비중은 조금 줄 수 있으나 회수 목적이 아니라 매집 리듬 관리가 주 목적이다. |
| `position_settlement` | 포지션 정리 | 수익권에서는 수익실현, 손해권에서는 손실차단으로 표시한다. 현재가 기준 예산 회수를 담당하며 시장 충격이 `매도봇`보다 크다. |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-ACTION-001 | 수동 액션은 장중 운용 화면에서 즉시 사용할 수 있는 버튼으로 제공되어야 한다. |
| SRS-CONTENT-ACTION-002 | 수동 액션은 직접 가격 값을 덮어쓰지 않고 상태 변수에 영향을 줘야 한다. |
| SRS-CONTENT-ACTION-003 | `방어 자금 투입`, `군중 진정`, `관심 신호`는 MVP 수동 버튼에 포함하지 않는다. |

---

## 5. Auto Cards

MVP 장중 자동 카드는 8개다.

| Card ID | 표시명 | 주요 역할 |
| --- | --- | --- |
| `attention_signal` | 관심 신호 | 개인 참여도 증가 |
| `liquidity_cycle` | 유동성 순환 | 시장 유동성 증가 |
| `price_support` | 가격 지지 | 하락 압력 완화 |
| `volatility_absorb` | 변동성 흡수 | 변동성 증가 억제 |
| `news_amplifier` | 뉴스 증폭 | 현재 Morning News 효과 강화 |
| `surveillance_buffer` | 감시 완충 | 감시도 증가량 완화 |
| `competition_check` | 경쟁 견제 | 경쟁 압박 감소 |
| `settlement_routine` | 정리 루틴 | 포지션 정리 시 시장 충격과 변동성 부담 완화 |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-AUTO-001 | 자동 카드는 장중에 주기적으로 발동되거나 지속 효과를 제공해야 한다. |
| SRS-CONTENT-AUTO-002 | 자동 카드는 Lv.1~Lv.3까지만 성장할 수 있다. |
| SRS-CONTENT-AUTO-003 | 자동 카드 선택 보상은 최대 3개 선택지로 제공해야 한다. |
| SRS-CONTENT-AUTO-004 | 카드 진화와 조합 시너지는 MVP에 포함하지 않는다. |

---

## 6. Document Events

MVP 문서 이벤트는 8개다.

| Event ID | 표시명 | 발생 방향 |
| --- | --- | --- |
| `unusual_flow_inquiry` | 이상 흐름 질의서 | 감시도가 높을 때 |
| `market_overheat_warning` | 시장 과열 경보 | 개인 참여도/변동성이 높을 때 |
| `liquidity_dryness_report` | 유동성 경색 보고 | 예산 또는 유동성이 낮을 때 |
| `community_surge_alert` | 커뮤니티 폭주 알림 | 개인 참여 군집이 과열될 때 |
| `competition_desk_report` | 경쟁 데스크 개입 보고 | 경쟁 압박이 높을 때 |
| `collapse_risk_notice` | 급락 위험 통지 | 가격이 붕괴선에 가까울 때 |
| `internal_risk_memo` | 내부 리스크 메모 | 보유 비중이 너무 높을 때 |
| `closing_cleanup_request` | 마감 전 정리 요청 | Day 후반부 또는 마감 직전 |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-DOC-001 | 문서 이벤트는 장중 조건 기반으로 발생해야 한다. |
| SRS-CONTENT-DOC-002 | MVP에서는 한 번에 하나의 문서 이벤트만 표시해야 한다. |
| SRS-CONTENT-DOC-003 | 문서 이벤트 표시 중 장중 시간은 일시정지되어야 한다. |
| SRS-CONTENT-DOC-004 | 각 문서 이벤트는 3개 선택지를 제공해야 한다. |
| SRS-CONTENT-DOC-005 | 선택지는 안정, 공격, 회피/관망 성격으로 구성해야 한다. |

---

## 7. Retail Swarm

Retail Swarm은 개인 참여도를 숫자와 시각적 분위기로 동시에 표현한다.

| 상태 | 조건 방향 | 요구 역할 |
| --- | --- | --- |
| `interest` | 관심 | 가격 추진 반응성 증가 |
| `overheated` | 과열 | 감시도와 변동성 증가 |
| `panic` | 패닉 | 가격 하락 압력과 변동성 증가 |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-SWARM-001 | Retail Swarm은 개인 참여도와 동기화되어야 한다. |
| SRS-CONTENT-SWARM-002 | 개인 참여도가 높을수록 참가자 분위기, 과열도, 밀집감, 또는 토큰/아이콘 표현이 더 강하게 보여야 한다. MVP 첫 플레이어블은 움직이는 점 군집 대신 상태 패널을 사용할 수 있다. |
| SRS-CONTENT-SWARM-003 | 과열 상태는 경고 시각 효과로 표시되어야 한다. |
| SRS-CONTENT-SWARM-004 | 패닉 상태는 하락 압력과 연결되어야 한다. |
| SRS-CONTENT-SWARM-005 | 실사형 군중 묘사와 복잡한 유닛 AI는 MVP에 포함하지 않는다. |

---

## 8. Market Board

MVP Market Board는 장중 시장이 살아 있다는 감각을 주기 위해 컨텍스트 패널과 마켓 대시보드를 분리한다.

| 항목 | 요구사항 |
| --- | --- |
| 플레이어 종목 | 1개, 상세 계산 |
| 같은 섹터 경쟁 종목 | 2개, 간략 계산 |
| 타 섹터 평균 | 7개, 섹터별 간략 평균 |
| 마켓 대시보드 | 24개 개별 허구 종목의 거래대금 순위 중 내 종목 주변 구간 |
| 뉴스 표시 | 배지 또는 간단한 상태 표시 |

| ID | Requirement |
| --- | --- |
| SRS-CONTENT-MARKET-001 | 시장 보드는 항상 플레이어 종목을 포함해야 한다. |
| SRS-CONTENT-MARKET-002 | 컨텍스트 패널은 같은 섹터 경쟁 종목 2개와 타 섹터 평균 7개를 간략 표시해야 한다. |
| SRS-CONTENT-MARKET-003 | 24개 전체 종목의 실시간 상세 시뮬레이션은 MVP에 포함하지 않는다. |
| SRS-CONTENT-MARKET-004 | 마켓 대시보드는 전체 24개 개별 종목의 fictional 거래대금 순위를 표시하되, 플레이어 종목 주변 순위를 우선 보여줘야 한다. |
| SRS-CONTENT-MARKET-005 | 뉴스 영향을 받은 섹터나 종목은 배지, 테두리, 색상, 거래대금 변화 등으로 식별 가능해야 한다. |

---

## 9. Open Items

후속 밸런싱에서 정의할 항목은 다음이다.

1. 카드별 정확한 효과량
2. 수동 액션 쿨다운
3. 자동 카드 보상 발생 조건
4. 문서 이벤트별 정확한 발생 조건
5. Retail Swarm 상태 전환 기준
