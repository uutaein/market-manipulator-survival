# SRS v0.1.2 — Run Flow and Screens

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | SRS (Software Requirements Specification) |
| 제품명 | Market Manipulator Survival |
| 문서 범위 | Run Flow and Screens |
| 버전 | v0.1.2 |
| 상태 | Draft |
| 작성일 | 2026-06-13 |
| 기준 PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| 기준 SRS | ./market-manipulator-survival-srs-v0.1.0-core-game-state.md |

이 문서는 MVP의 화면 흐름과 Run/Day 진행 요구사항을 정의한다.

---

## 1. Scope

### 1.1 Included

1. 5-Day Run 진행
2. Day 단계 전환
3. MVP 화면 8개
4. 문서 이벤트 모달 처리
5. 즉시 실패와 Final Settlement 진입
6. 같은 조건 재시작 / 새 Run 시작

### 1.2 Excluded

1. 화면 레이아웃 상세 픽셀 스펙
2. Phaser Scene 구조
3. 애니메이션 구현 방식
4. 세부 UI 컴포넌트 파일 구조
5. 튜토리얼 전용 캠페인

---

## 2. MVP Screens

MVP는 다음 8개 화면으로 제한한다.

| 화면 | 주요 목적 |
| --- | --- |
| 메인 메뉴 | 새 Run 시작, 설정, 기록 보기 진입 |
| Run 시작 / 종목 선택 | 섹터와 종목 직접 선택 |
| 아침 뉴스 / 시장 브리핑 | 오늘의 뉴스, 짧은 종목 브리핑, 목표 조건 확인 |
| 개장 전 카드 선택 | 개장 전 카드 4개 중 최대 1개 선택 |
| 장중 운용 화면 | fictional 캔들 차트, 볼륨 바, 시장 보드, 핵심 지표, 액션, 자동 카드 표시 |
| 문서 이벤트 팝업 | 장중 조건 기반 이벤트와 3개 선택지 표시 |
| Day 정산 화면 | 하루 결과와 힌트 표시 |
| Final 정산 화면 | 5일 Run 최종 결과와 재시작 선택 표시 |

| ID | Requirement |
| --- | --- |
| SRS-FLOW-SCREEN-001 | 시스템은 MVP 화면을 위 8개 범위로 제한해야 한다. |
| SRS-FLOW-SCREEN-002 | 문서 이벤트는 별도 전체 화면이 아니라 장중 운용 화면 위의 모달로 표시해야 한다. |
| SRS-FLOW-SCREEN-003 | 상세 도감, 카드 컬렉션, 섹터별 통계, 리플레이, 온라인 랭킹, 고급 설정 화면은 MVP에 포함하지 않는다. |
| SRS-FLOW-SCREEN-004 | 장중 운용 화면은 대상 종목의 fictional 가격 흐름을 캔들 차트와 볼륨 바로 표시해야 한다. 실제 종목, 실제 거래소, 실제 시장 데이터는 사용하지 않는다. |

---

## 3. Run Flow

MVP Run은 다음 흐름을 따른다.

```text
메인 메뉴
→ Run 시작 / 종목 선택
→ Day 1 아침 뉴스 / 시장 브리핑
→ 개장 전 카드 선택
→ 개장 승인
→ 장중 운용 화면
→ Day 정산
→ Day 2~5 반복
→ Final 정산
```

장중에 조건이 충족되면 문서 이벤트 팝업이 장중 운용 화면 위에 표시될 수 있다.

| ID | Requirement |
| --- | --- |
| SRS-FLOW-RUN-001 | 새 Run은 Day 1에서 시작해야 한다. |
| SRS-FLOW-RUN-002 | Run은 최대 Day 5까지 진행해야 한다. |
| SRS-FLOW-RUN-003 | Day 5의 Day Settlement 이후 Final Settlement로 전환해야 한다. |
| SRS-FLOW-RUN-004 | MVP에는 조기 성공 엔딩을 제공하지 않는다. |
| SRS-FLOW-RUN-005 | 즉시 실패 조건이 발생하면 현재 Day 종료를 기다리지 않고 Run 실패로 전환해야 한다. |

---

## 4. Day Flow

각 Day는 다음 단계를 순서대로 진행한다.

1. Morning News
2. Market Briefing
3. Pre-open Card selection
4. Opening Approval / stamp action
5. Intraday operation
6. Day Settlement

| ID | Requirement |
| --- | --- |
| SRS-FLOW-DAY-001 | 각 Day는 Morning News 화면으로 시작해야 한다. |
| SRS-FLOW-DAY-002 | Market Briefing은 뉴스 영향, 목표 조건, 주요 리스크를 요약해야 한다. |
| SRS-FLOW-DAY-003 | 플레이어는 개장 전 카드 중 최대 1개를 선택할 수 있어야 한다. |
| SRS-FLOW-DAY-004 | 카드 미사용은 `관망`으로 표현해야 한다. |
| SRS-FLOW-DAY-005 | 플레이어가 개장 승인 버튼 또는 도장 액션을 수행해야 장중 운용으로 진입할 수 있다. |
| SRS-FLOW-DAY-006 | 장중 운용 기본 시간은 360초여야 한다. |
| SRS-FLOW-DAY-007 | 장중 시간이 끝나면 Day Settlement로 전환해야 한다. |

---

## 5. Immediate Failure Flow

즉시 Run 실패 조건은 다음이다.

1. 예산 고갈
2. 감시도 100 도달
3. 치명적 가격 붕괴

| ID | Requirement |
| --- | --- |
| SRS-FLOW-FAIL-001 | 즉시 실패 조건이 발생하면 `run_failed` 상태로 전환해야 한다. |
| SRS-FLOW-FAIL-002 | 즉시 실패 후 플레이어는 `같은 조건으로 재시작` 또는 `새 Run 시작`을 선택할 수 있어야 한다. |
| SRS-FLOW-FAIL-003 | `같은 조건으로 재시작`은 동일한 Run Seed를 사용해야 한다. |

---

## 6. Day 1 Onboarding Flow

MVP는 별도 튜토리얼 모드를 제공하지 않는다.  
Day 1은 인게임 온보딩 역할을 한다.

| ID | Requirement |
| --- | --- |
| SRS-FLOW-ONBOARD-001 | Day 1은 아침 뉴스 확인, 개장 전 카드 선택, 개장 승인, 장중 수동 액션, Day 정산 확인을 자연스럽게 경험하게 해야 한다. |
| SRS-FLOW-ONBOARD-002 | Day 1에서는 지나치게 복잡한 이벤트 조합을 피해야 한다. |
| SRS-FLOW-ONBOARD-003 | Day 1에서는 감시도 증가와 가격 붕괴 위험을 완만하게 조정할 수 있다. |
| SRS-FLOW-ONBOARD-004 | Day Settlement 화면은 다음 플레이에 도움이 되는 짧은 힌트를 제공해야 한다. |

---

## 7. Open Items

다음 항목은 후속 UX/SRS에서 정의한다.

1. 화면별 버튼 배치
2. 도장 액션의 정확한 입력 방식
3. Day 1 힌트 문구 목록
4. 화면 전환 애니메이션 강도
5. 키보드/마우스 입력 상세
