# SRS v0.1.0 — Core Game State

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | SRS (Software Requirements Specification) |
| 제품명 | Market Manipulator Survival |
| 문서 범위 | Core Game State |
| 버전 | v0.1.0 |
| 상태 | Draft |
| 작성일 | 2026-06-13 |
| 기준 PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| 기준 Freeze 후보 | ../prd/market-manipulator-survival-mvp-freeze-candidate.md |

이 문서는 PRD v0.1.5와 MVP Freeze 후보를 바탕으로, MVP 구현에 필요한 핵심 게임 상태 변수를 정의한다.

PRD는 게임의 방향, 범위, 콘텐츠 수량, 플레이어 경험을 정의한다.  
이 SRS는 그 방향을 실제 게임 상태로 다루기 위한 변수, 수명, 전이, 저장 범위를 정의한다.

이 문서는 코드, TypeScript 인터페이스, Phaser Scene 구조, 파일 경로를 정의하지 않는다.

---

## 1. Scope

### 1.1 Included

이 SRS는 다음을 포함한다.

1. Run 전체 상태
2. Day 단위 상태
3. 장중 핵심 상태
4. 자동 카드와 수동 액션 상태
5. 문서 이벤트 상태
6. 시장 보드 상태
7. 정산 상태
8. 로컬 저장 대상 상태
9. 상태 수명과 Day 간 이월 규칙
10. 상태 전이 요구사항

### 1.2 Excluded

이 SRS는 다음을 아직 확정하지 않는다.

1. 가격 Tick 공식
2. 카드별 정확한 비용, 쿨다운, 효과량
3. 문서 이벤트별 정확한 발생 조건
4. Morning News별 정확한 수치 효과
5. 시장 여파 잔류율
6. 실제 수익 계산식
7. 저장 파일/키의 구체적 구현 스키마
8. TypeScript 타입 정의
9. Phaser Scene 구조

---

## 2. State Model Overview

MVP의 Core Game State는 다음 계층으로 나눈다.

| 계층 | 설명 | 대표 상태 |
| --- | --- | --- |
| Run State | 5-Day Run 전체에 유지되는 상태 | Seed, 선택 종목, 예산, 누적 수익, 자동 카드 |
| Day State | 하루 시장 세션에 적용되는 상태 | Morning News, Today Condition, 목표 밴드, 개장 전 카드 |
| Intraday State | 3분 장중 운용 중 실시간으로 변하는 상태 | 가격, 감시도, 변동성, 개인 참여도 |
| Event State | 문서 이벤트와 자동 카드 선택 등 일시적 상태 | 활성 문서 이벤트, 선택지, 일시정지 |
| Market Board State | 장중 시장 보드와 대시보드 상태 | 내 종목 상세, 경쟁 종목, 타 섹터 평균, 24개 개별 종목 거래대금 순위 |
| Settlement State | Day/Final 정산에 필요한 상태 | Day 결과, Final 등급, 사회적 비용 |
| Persistence State | localStorage 저장 대상 상태 | 진행 중 Run, 최근 결과, 최고 기록 |

---

## 3. Phase State

### 3.1 Required Phase Values

시스템은 현재 진행 단계를 `phase` 상태로 보유해야 한다.

| Phase | 의미 |
| --- | --- |
| `main_menu` | 메인 메뉴 |
| `run_setup` | Run 시작 / 섹터·종목 선택 |
| `morning_news` | 아침 뉴스 확인 |
| `market_briefing` | 시장 브리핑 확인 |
| `pre_open_card` | 개장 전 카드 선택 |
| `opening_approval` | 개장 승인 / 도장 액션 |
| `intraday` | 장중 운용 |
| `document_event` | 문서 이벤트 팝업 표시 |
| `day_settlement` | Day 정산 |
| `final_settlement` | Final 정산 |
| `run_failed` | 즉시 Run 실패 |

### 3.2 Phase Requirements

| ID | Requirement |
| --- | --- |
| SRS-STATE-PHASE-001 | 시스템은 한 번에 하나의 `phase`만 활성 상태로 유지해야 한다. |
| SRS-STATE-PHASE-002 | `document_event`는 장중 운용 위에 표시되는 모달 상태이며, 독립 Run 단계로 취급하지 않는다. |
| SRS-STATE-PHASE-003 | 문서 이벤트가 종료되면 시스템은 이전 장중 상태를 유지한 채 `intraday`로 복귀해야 한다. |
| SRS-STATE-PHASE-004 | 즉시 실패 조건이 발생하면 현재 Day 진행과 무관하게 `run_failed`로 전환해야 한다. |
| SRS-STATE-PHASE-005 | Day 5의 `day_settlement`가 끝나면 `final_settlement`로 전환해야 한다. |

---

## 4. Run State Variables

Run State는 5-Day Run 전체에 유지된다.

| 변수 | 범위/형태 | 수명 | 설명 |
| --- | --- | --- | --- |
| `runId` | 내부 식별자 | Run 전체 | 현재 Run을 구분하는 내부 ID |
| `runSeed` | 내부 Seed | Run 전체 | 같은 조건 재시작을 위한 기준값 |
| `runStatus` | `active` / `failed` / `completed` | Run 전체 | Run 진행 상태 |
| `currentDay` | 1~5 | Run 전체 | 현재 Day 번호 |
| `selectedSectorId` | 허구 섹터 ID | Run 전체 | 플레이어가 선택한 섹터 |
| `selectedAssetId` | 허구 종목 ID | Run 전체 | 플레이어가 선택한 종목 |
| `runAssetProfiles` | 섹터별 3종목 성향 배정 | Run 전체 | Run 시작 시 배정된 안정/표준/고위험 성향 |
| `budget` | 0 이상 숫자 | Day 간 이월 | 현재 예산 |
| `cumulativeProfit` | 숫자 | Day 간 이월 | 누적 실제 수익 |
| `holdingRatio` | 0~100 | Day 간 이월 | 현재 보유 비중 |
| `surveillance` | 0~100 | 일부 이월 | 현재 감시도 |
| `socialCost` | 0 이상 숫자 | 누적 | 누적 사회적 비용 |
| `autoCards` | 카드 ID + 레벨 | Day 간 이월 | 보유 자동 카드와 레벨 |
| `marketAftereffects` | 효과 목록 | Day 간 일부 유지 | 전날 결과가 남긴 시장 여파 |
| `dayResults` | 최대 5개 결과 | Run 전체 | Day별 정산 결과 |
| `failedReason` | 실패 사유 또는 없음 | 실패 시 설정 | 예산 고갈, 감시도 100, 가격 붕괴 등 |

### 4.1 Run State Requirements

| ID | Requirement |
| --- | --- |
| SRS-STATE-RUN-001 | 새 Run 시작 시 시스템은 새로운 `runSeed`를 생성해야 한다. |
| SRS-STATE-RUN-002 | 같은 조건으로 재시작을 선택하면 시스템은 이전 Run과 동일한 `runSeed`를 사용해야 한다. |
| SRS-STATE-RUN-003 | `runSeed`는 Run별 Asset Profile, Morning News 대상, Today Condition, 일부 시장 여파 초기 조건을 재현해야 한다. |
| SRS-STATE-RUN-004 | `currentDay`는 1에서 시작하고, Day 정산 후 다음 Day로 진행할 때 1씩 증가해야 한다. |
| SRS-STATE-RUN-005 | `currentDay`가 5인 Day의 정산이 끝나면 시스템은 Final Settlement로 전환해야 한다. |
| SRS-STATE-RUN-006 | `budget`, `cumulativeProfit`, `holdingRatio`, `socialCost`, `autoCards`는 Day 간 이월되어야 한다. |
| SRS-STATE-RUN-007 | `surveillance`는 Day 간 일부 이월되어야 하며, 정확한 감소율은 밸런싱 값으로 분리해야 한다. |
| SRS-STATE-RUN-008 | `failedReason`이 설정되면 `runStatus`는 `failed`가 되어야 한다. |
| SRS-STATE-RUN-009 | 신규 Run의 `holdingRatio`는 0에서 시작해야 한다. Day 1의 첫 보유 비중은 `선취매`를 통해 생성된다. |

---

## 5. Day State Variables

Day State는 각 Day 시작 시 생성되며, Day Settlement까지 유지된다.

| 변수 | 범위/형태 | 수명 | 설명 |
| --- | --- | --- | --- |
| `dayIndex` | 1~5 | Day 전체 | 현재 Day 번호 |
| `morningNews` | 뉴스 템플릿 + 대상 | Day 전체 | 해당 Day의 아침 뉴스 |
| `todayCondition` | 대상 종목 보정값 | Day 전체 | 해당 Day의 종목 컨디션 |
| `targetBandMin` | 숫자 | Day 전체 | 목표 밴드 하한 |
| `targetBandMax` | 숫자 | Day 전체 | 목표 밴드 상한 |
| `crashLine` | 숫자 | Day 전체 | 치명적 가격 붕괴선 |
| `startingBudgetForDay` | 숫자 | Day 전체 | Day 시작 시 예산 |
| `preOpenCardId` | 카드 ID 또는 `none` | Day 전체 | 선택한 개장 전 카드 |
| `preOpenCardEffect` | 효과 목록 | 해당 Day | 개장 전 카드 효과 |
| `openingApproved` | boolean | 개장 전 단계 | 개장 승인 여부 |
| `dayResult` | Day 결과 또는 없음 | 정산 후 | Day Settlement 결과 |
| `dayProfit` | 숫자 | 정산 후 | 해당 Day 실제 수익 |
| `daySurveillanceGrade` | A~F | 정산 후 | 해당 Day 감시등급 |

### 5.1 Day State Requirements

| ID | Requirement |
| --- | --- |
| SRS-STATE-DAY-001 | 각 Day 시작 시 시스템은 `morningNews`를 1개 생성해야 한다. |
| SRS-STATE-DAY-002 | 각 Day 시작 시 시스템은 `todayCondition`을 생성해야 한다. |
| SRS-STATE-DAY-003 | `preOpenCardId`는 Day당 최대 1개만 설정될 수 있다. |
| SRS-STATE-DAY-004 | 카드를 사용하지 않는 선택은 `none`이 아니라 플레이어-facing으로 `관망`으로 표시해야 한다. |
| SRS-STATE-DAY-005 | `openingApproved`가 참이 되기 전에는 `intraday` phase로 전환할 수 없다. |
| SRS-STATE-DAY-006 | `preOpenCardEffect`는 해당 Day에만 적용되고 다음 Day로 이월되지 않아야 한다. |

---

## 6. Intraday Core State Variables

Intraday Core State는 장중 운용 중 실시간으로 변한다.

| 변수 | 범위/형태 | 기본/제약 | 설명 |
| --- | --- | --- | --- |
| `timeRemainingSec` | 0~180 | Day 시작 시 180 | 장중 남은 시간 |
| `isIntradayPaused` | boolean | 기본 false | 문서 이벤트 등으로 장중 시간이 멈췄는지 여부 |
| `budget` | 0 이상 숫자 | MVP 시작 기준 100, 최소 유지 기준 10 | 핵심 생존 자원 |
| `priceChangePercent` | 숫자 | 목표 밴드와 붕괴선 기준으로 평가 | 현재 가격 등락률 |
| `marketPressure` | -100~100 권장 | 0은 중립 | 가격 방향 압력 |
| `holdingRatio` | 0~100 | 정산 구간 적용 | 보유 비중 / 시장 영향력 |
| `personalParticipation` | 0~100 | Retail Swarm과 동기화 | 개인 참여도 |
| `marketLiquidity` | 0~100 | Day마다 대부분 초기화 | 시장 유동성 |
| `surveillance` | 0~100 | 100 도달 시 실패 | 감시도 |
| `volatility` | 0~100 | 높을수록 이탈/붕괴 위험 | 변동성 |
| `competitionPressure` | 0~100 | 보조 상태 | 경쟁 압박 |
| `retailSwarmState` | `interest` / `overheated` / `panic` | 개인 참여도와 상황에서 도출 | Retail Swarm 상태 |

### 6.1 Intraday Requirements

| ID | Requirement |
| --- | --- |
| SRS-STATE-INTRA-001 | 장중 운용은 기본 180초의 `timeRemainingSec`로 시작해야 한다. |
| SRS-STATE-INTRA-002 | `timeRemainingSec`가 0에 도달하면 시스템은 `day_settlement`로 전환해야 한다. |
| SRS-STATE-INTRA-003 | `isIntradayPaused`가 참이면 `timeRemainingSec`는 감소하지 않아야 한다. |
| SRS-STATE-INTRA-004 | `budget`이 최소 유지 기준 미만이면 즉시 Run 실패가 발생해야 한다. |
| SRS-STATE-INTRA-005 | `surveillance`가 100에 도달하면 즉시 Run 실패가 발생해야 한다. |
| SRS-STATE-INTRA-006 | `priceChangePercent`가 `crashLine`을 이탈하면 즉시 Run 실패가 발생해야 한다. |
| SRS-STATE-INTRA-007 | `holdingRatio`, `personalParticipation`, `marketLiquidity`, `surveillance`, `volatility`, `competitionPressure`는 0~100 범위를 벗어나지 않도록 보정되어야 한다. |
| SRS-STATE-INTRA-008 | `marketPressure`는 상승 압력과 하락 압력을 모두 표현할 수 있어야 한다. |
| SRS-STATE-INTRA-009 | `retailSwarmState`는 개인 참여도와 패닉/과열 조건에 따라 관심, 과열, 패닉 중 하나로 표시되어야 한다. |

---

## 7. Holding Ratio Bands

MVP는 마감 보유 비중을 4구간으로 분류한다.

| 구간 | 범위 | 요구사항 |
| --- | ---: | --- |
| 영향력 부족 | 0~10% | 가격 영향력과 수익 기여가 낮은 상태로 취급한다. |
| 안정 구간 | 10~35% | 정상 정산 구간으로 취급한다. |
| 부담 구간 | 35~55% | 수익 잠재력은 높지만 감시/사회적 비용 증가 가능 상태로 취급한다. |
| 과점 위험 | 55% 이상 | 정산 패널티와 감시등급 악화 가능 상태로 취급한다. |

| ID | Requirement |
| --- | --- |
| SRS-STATE-HOLD-001 | 시스템은 Day Settlement 시 `holdingRatio`를 위 4구간 중 하나로 분류해야 한다. |
| SRS-STATE-HOLD-002 | `매도봇`은 4B를 차감해 평단 압박 관리를 돕고 `holdingRatio`를 조금 낮출 수 있으며, `포지션 정리`는 수익실현 또는 손실차단을 위해 더 큰 회수와 정산 리스크 관리를 담당해야 한다. |
| SRS-STATE-HOLD-003 | 높은 `holdingRatio`는 장중에는 가격 추진/방어 효율에 유리할 수 있지만, 정산에서는 리스크로 평가되어야 한다. |

---

## 8. Surveillance Grade State

`surveillance`는 장중에는 0~100 숫자로 관리하고, 정산에서는 감시등급으로 변환한다.

| 감시도 | 감시등급 | 상태 |
| ---: | --- | --- |
| 0~24 | A | 정상 |
| 25~49 | B | 관찰 |
| 50~74 | C | 주의 |
| 75~94 | D | 위험 |
| 95~99 | E | 임박 |
| 100 | F | 강제 실패 |

| ID | Requirement |
| --- | --- |
| SRS-STATE-SURV-001 | 시스템은 장중에 `surveillance`를 숫자로 표시해야 한다. |
| SRS-STATE-SURV-002 | Day Settlement와 Final Settlement에서는 감시등급을 표시해야 한다. |
| SRS-STATE-SURV-003 | `surveillance` 100은 감시등급 F이며 즉시 Run 실패로 처리해야 한다. |

---

## 9. Card and Action State

### 9.1 Manual Action State

MVP 수동 액션은 다음 4개로 고정한다.

| Action ID | 표시명 | 주요 영향 상태 |
| --- | --- | --- |
| `liquidity_supply` | 유동성 공급 | 예산, 시장 유동성, 가격 반응성, 감시도, 변동성 |
| `price_push` | 매수봇 | 예산, 가격, 보유 비중, 시장 압력, 감시도, 변동성 |
| `overheat_cooldown` | 매도봇 | 예산 차감, 보유 비중, 가격 압력, 평단 압박, 변동성 |
| `position_settlement` | 포지션 정리 | 수익실현/손실차단, 보유 비중, 예산, 가격 지지 |

| 변수 | 범위/형태 | 설명 |
| --- | --- | --- |
| `manualActionCooldowns` | 액션별 남은 쿨다운 | 액션 재사용 가능 여부 |
| `lastManualActionId` | 액션 ID 또는 없음 | 마지막 사용 수동 액션 |

정확한 쿨다운과 수치 효과는 밸런싱 데이터로 분리한다.

### 9.2 Auto Card State

MVP 자동 카드는 다음 8개로 고정한다.

| Card ID | 표시명 | 주요 영향 상태 |
| --- | --- | --- |
| `attention_signal` | 관심 신호 | 개인 참여도 |
| `liquidity_cycle` | 유동성 순환 | 시장 유동성 |
| `price_support` | 가격 지지 | 하락 압력, 예산 |
| `volatility_absorb` | 변동성 흡수 | 변동성, 패닉 위험 |
| `news_amplifier` | 뉴스 증폭 | Morning News 효과 |
| `surveillance_buffer` | 감시 완충 | 감시도 증가량 |
| `competition_check` | 경쟁 견제 | 경쟁 압박 |
| `settlement_routine` | 정리 루틴 | 포지션 정리 충격 완화 |

| 변수 | 범위/형태 | 설명 |
| --- | --- | --- |
| `autoCards` | 카드 ID + Lv.1~Lv.3 | 보유 자동 카드와 레벨 |
| `autoCardTimers` | 카드별 타이머 | 다음 발동까지 남은 시간 |
| `pendingAutoCardChoices` | 최대 3개 선택지 | 새 카드 획득 또는 기존 카드 레벨업 선택지 |

| ID | Requirement |
| --- | --- |
| SRS-STATE-CARD-001 | 자동 카드는 Lv.1~Lv.3 범위를 벗어날 수 없다. |
| SRS-STATE-CARD-002 | 자동 카드 선택지는 장중 일정 조건마다 최대 3개를 제공해야 한다. |
| SRS-STATE-CARD-003 | 카드 진화, 조합 시너지, 희귀/전설 카드는 MVP 상태에 포함하지 않는다. |

---

## 10. Document Event State

| 변수 | 범위/형태 | 설명 |
| --- | --- | --- |
| `activeDocumentEvent` | 이벤트 ID 또는 없음 | 현재 표시 중인 문서 이벤트 |
| `documentEventChoices` | 3개 선택지 | 안정 / 공격 / 회피·관망 성격의 선택지 |
| `documentEventHistory` | 선택 결과 목록 | Day 또는 Run 중 발생한 문서 이벤트 기록 |
| `isIntradayPaused` | boolean | 문서 이벤트 표시 중 장중 시간 일시정지 |

| ID | Requirement |
| --- | --- |
| SRS-STATE-DOC-001 | MVP에서는 한 번에 하나의 `activeDocumentEvent`만 존재할 수 있다. |
| SRS-STATE-DOC-002 | 문서 이벤트가 표시되는 동안 `isIntradayPaused`는 참이어야 한다. |
| SRS-STATE-DOC-003 | 문서 이벤트는 항상 3개 선택지를 제공해야 한다. |
| SRS-STATE-DOC-004 | 선택지가 결정되면 이벤트 효과를 적용하고 `activeDocumentEvent`를 비워야 한다. |
| SRS-STATE-DOC-005 | 문서 이벤트 결과는 필요한 경우 `socialCost`, `surveillance`, `volatility`, `holdingRatio`, `marketAftereffects`에 반영될 수 있다. |

---

## 11. Market Board State

MVP 시장 보드는 내 종목 상세, 같은 섹터 경쟁 종목 2개, 타 섹터 평균 7개, 24개 개별 종목 거래대금 순위를 관리한다.

| 변수 | 범위/형태 | 설명 |
| --- | --- | --- |
| `displayedAssetIds` | 플레이어 종목 + 같은 섹터 경쟁 종목 ID | 종목 단위 표시 대상 |
| `sectorAverageSummaries` | 7개 섹터 평균 | 타 섹터 평균 행 |
| `marketDashboardRows` | 24개 개별 종목 중 표시 구간 | 거래대금 순위 대시보드 |
| `playerAssetState` | 상세 상태 | 플레이어 대상 종목 |
| `nonPlayerAssetSummaries` | 간략 상태 | 경쟁 종목과 타 섹터 평균 상태 |
| `newsBadges` | 종목/섹터별 배지 | 뉴스 영향 표시 |

### 11.1 Player Asset State

`playerAssetState`는 다음 상태를 포함해야 한다.

1. `assetId`
2. `sectorId`
3. `priceChangePercent`
4. `targetBandMin`
5. `targetBandMax`
6. `crashLine`
7. `marketPressure`
8. `holdingRatio`
9. `personalParticipation`
10. `marketLiquidity`
11. `surveillance`
12. `volatility`

### 11.2 Non-player Asset Summary

비플레이어 종목은 다음 간략 상태만 가진다.

1. `assetId`
2. `sectorId`
3. `priceChangePercent`
4. `trendState`
5. `newsBadge`

| ID | Requirement |
| --- | --- |
| SRS-STATE-MARKET-001 | `displayedAssetIds`는 플레이어 종목과 같은 섹터 경쟁 종목 2개를 포함해야 한다. |
| SRS-STATE-MARKET-002 | `displayedAssetIds` 중 1개는 `selectedAssetId`와 동일해야 한다. |
| SRS-STATE-MARKET-003 | 비플레이어 경쟁 종목과 타 섹터 평균은 간략 계산만 사용해야 한다. |
| SRS-STATE-MARKET-004 | 뉴스 영향을 받는 섹터나 종목은 시장 보드에서 배지 또는 간단한 상태로 표시되어야 한다. |
| SRS-STATE-MARKET-005 | 마켓 대시보드는 24개 개별 종목 거래대금 순위를 사용하되, 24개 전체 상세 시뮬레이션을 수행하지 않아야 한다. |

---

## 12. Settlement State

### 12.1 Day Settlement State

| 변수 | 범위/형태 | 설명 |
| --- | --- | --- |
| `dayProfit` | 숫자 | 해당 Day 실제 수익 |
| `daySurveillanceGrade` | A~F | 해당 Day 감시등급 |
| `dayResultCategory` | 8개 결과 중 하나 | Day 결과 |
| `endingBudget` | 숫자 | Day 종료 예산 |
| `endingHoldingRatio` | 0~100 | Day 종료 보유 비중 |
| `endingPersonalParticipation` | 0~100 | Day 종료 개인 참여도 |
| `endingVolatility` | 0~100 | Day 종료 변동성 |
| `daySocialCostDelta` | 숫자 | 해당 Day 사회적 비용 증가량 |
| `settlementHint` | 짧은 문구 | 다음 플레이 학습 힌트 |

MVP Day 결과는 다음 중 하나여야 한다.

1. 완전 성공
2. 위험 성공
3. 고위험 성공
4. 안정 운용
5. 위험 운용
6. 조용한 실패
7. 손실 마감
8. 강제 실패

### 12.2 Final Settlement State

| 변수 | 범위/형태 | 설명 |
| --- | --- | --- |
| `finalGrade` | S/A/B/C/D/F | 최종 등급 |
| `cumulativeProfit` | 숫자 | 누적 실제 수익 |
| `finalSurveillanceGrade` | A~F | 최종 감시등급 |
| `averageSurveillanceGrade` | A~F | 평균 감시등급 |
| `successfulDays` | 0~5 | 성공한 Day 수 |
| `finalBudget` | 숫자 | 최종 예산 |
| `finalHoldingRatio` | 0~100 | 최종 보유 비중 |
| `finalSocialCost` | 숫자 | 누적 사회적 비용 |
| `forcedFailure` | boolean | 강제 실패 여부 |

MVP Final 등급은 다음 중 하나여야 한다.

1. S — 조용한 대성공
2. A — 성공적 운용
3. B — 위험한 성공
4. C — 간신히 생존
5. D — 실패한 운용
6. F — 강제 종료

| ID | Requirement |
| --- | --- |
| SRS-STATE-SETTLE-001 | Day Settlement는 실제 수익과 감시등급을 중심으로 `dayResultCategory`를 결정해야 한다. |
| SRS-STATE-SETTLE-002 | Final Settlement는 누적 실제 수익, 최종/평균 감시등급, 성공 Day 수, 최종 예산, 최종 보유 비중, 사회적 비용을 반영해야 한다. |
| SRS-STATE-SETTLE-003 | `forcedFailure`가 참이면 `finalGrade`는 F여야 한다. |
| SRS-STATE-SETTLE-004 | 정산 화면은 결과만 표시하지 않고 짧은 학습 힌트를 제공해야 한다. |

---

## 13. Carryover Rules

Day 종료 후 다음 Day로 넘어갈 때 상태는 다음 규칙을 따른다.

| 상태 | 이월 규칙 |
| --- | --- |
| `budget` | 이월 |
| `cumulativeProfit` | 이월 |
| `holdingRatio` | 이월 |
| `surveillance` | 일부 이월 |
| `socialCost` | 누적 |
| `autoCards` | 카드와 레벨 이월 |
| `personalParticipation` | 감소 이월 |
| `morningNews` 직접 효과 | 해당 Day 중심, 일부 잔류 가능 |
| `marketLiquidity` | 대부분 초기화 |
| `volatility` | 대부분 초기화, 과열/패닉 여파 일부 가능 |
| `preOpenCardEffect` | 이월하지 않음 |

| ID | Requirement |
| --- | --- |
| SRS-STATE-CARRY-001 | 시스템은 Day Settlement 후 Carryover 처리를 수행해야 한다. |
| SRS-STATE-CARRY-002 | Carryover 결과는 다음 Day의 초기 상태에 반영되어야 한다. |
| SRS-STATE-CARRY-003 | 시장 여파는 새 Day의 Morning News보다 약해야 한다. |
| SRS-STATE-CARRY-004 | 정확한 잔류율과 감소율은 밸런싱 값으로 분리해야 한다. |

---

## 14. Persistence State

MVP에서는 localStorage 기반 로컬 저장만 사용한다.

| 저장 대상 | 설명 |
| --- | --- |
| `currentRunState` | 진행 중 Run 상태 |
| `recentFinalSettlement` | 최근 Final Settlement 결과 |
| `bestFinalGrade` | 최고 Final 등급 |
| `bestCumulativeProfit` | 최고 누적 수익 |

| ID | Requirement |
| --- | --- |
| SRS-STATE-SAVE-001 | 시스템은 진행 중 Run 상태를 로컬에 저장할 수 있어야 한다. |
| SRS-STATE-SAVE-002 | 시스템은 최근 Final Settlement 결과를 로컬에 저장해야 한다. |
| SRS-STATE-SAVE-003 | 시스템은 최고 Final 등급과 최고 누적 수익을 로컬에 저장해야 한다. |
| SRS-STATE-SAVE-004 | 상세 플레이 로그, 리플레이 데이터, 클라우드 저장, 온라인 랭킹 상태는 MVP 저장 대상에 포함하지 않는다. |
| SRS-STATE-SAVE-005 | 정확한 저장 키와 저장 스키마는 별도 저장 SRS 또는 SDD에서 정의한다. |

---

## 15. State Validation Rules

| ID | Requirement |
| --- | --- |
| SRS-STATE-VALID-001 | 0~100 범위 상태는 계산 후 항상 0~100으로 보정되어야 한다. |
| SRS-STATE-VALID-002 | `currentDay`는 1~5 범위를 벗어날 수 없다. |
| SRS-STATE-VALID-003 | `autoCards`의 레벨은 1~3 범위를 벗어날 수 없다. |
| SRS-STATE-VALID-004 | Day당 `morningNews`는 정확히 1개여야 한다. |
| SRS-STATE-VALID-005 | Day당 `preOpenCardId`는 최대 1개여야 한다. |
| SRS-STATE-VALID-006 | 한 번에 활성 문서 이벤트는 최대 1개여야 한다. |
| SRS-STATE-VALID-007 | 시장 보드 표시 종목은 8개여야 한다. |
| SRS-STATE-VALID-008 | 실제 종목명, 실제 거래소명, 실제 시장 데이터는 어떤 상태에도 저장하지 않는다. |

---

## 16. Open SRS Items

다음 항목은 후속 SRS 또는 밸런싱 문서에서 정의한다.

1. 가격 Tick 공식
2. `marketPressure`가 `priceChangePercent`에 반영되는 방식
3. 카드별 비용, 쿨다운, 효과량
4. 자동 카드 발동 주기
5. 자동 카드 선택 보상 발생 조건
6. 문서 이벤트별 등장 조건과 선택지 효과량
7. Morning News별 수치 효과
8. Today Condition 생성 규칙
9. 시장 여파 잔류율과 감소율
10. 실제 수익 계산식
11. Final 등급 컷
12. localStorage 저장 키와 마이그레이션 정책

---

## 17. Acceptance Checklist

Core Game State SRS는 다음을 만족해야 한다.

| 항목 | 기준 |
| --- | --- |
| Run 재현성 | 같은 `runSeed`로 같은 초기 조건을 재현할 수 있다. |
| Day 진행 | Day 1~5 흐름을 상태로 표현할 수 있다. |
| 장중 운용 | 예산, 가격, 보유 비중, 개인 참여도, 유동성, 감시도, 변동성, 시장 압력을 모두 표현할 수 있다. |
| 문서 이벤트 | 이벤트 중 장중 시간이 멈추고 선택 후 복귀할 수 있다. |
| 정산 | Day/Final 결과를 상태로 저장하고 표시할 수 있다. |
| 이월 | Day 결과가 다음 Day 초기 상태에 영향을 줄 수 있다. |
| 저장 | MVP 저장 범위가 진행 중 Run, 최근 결과, 최고 기록으로 제한된다. |
| 안전성 | 실제 시장 데이터나 실제 종목 정보를 상태에 포함하지 않는다. |
