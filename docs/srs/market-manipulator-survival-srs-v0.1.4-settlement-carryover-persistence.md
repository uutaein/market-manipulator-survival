# SRS v0.1.4 — Settlement, Carryover, and Persistence

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | SRS (Software Requirements Specification) |
| 제품명 | Market Manipulator Survival |
| 문서 범위 | Settlement, Carryover, and Persistence |
| 버전 | v0.1.4 |
| 상태 | First Playable Baseline / Playtest Tunable |
| 작성일 | 2026-06-13 |
| 현행화일 | 2026-06-14 |
| 기준 PRD | ../prd/market-manipulator-survival-prd-v0.1.5.md |
| 기준 SRS | ./market-manipulator-survival-srs-v0.1.0-core-game-state.md |

이 문서는 Day/Final 정산, Day 간 이월, Run Seed 재시작, MVP 저장 범위 요구사항을 정의한다.

---

## 1. Scope

### 1.1 Included

1. 즉시 Run 실패
2. Day Settlement
3. Final Settlement
4. 보유 비중 정산 구간
5. 사회적 비용
6. Day 간 이월
7. Run Seed와 재시작
8. localStorage 저장 범위

### 1.2 Excluded

1. 정교한 실현/평가손익 분리
2. 세금, 수수료, 슬리피지
3. 정교한 호가창 단위 체결 계산
4. 상세 플레이 로그
5. 리플레이 데이터
6. 클라우드 저장
7. 온라인 랭킹

---

## 2. Immediate Run Failure

즉시 Run 실패 조건은 다음이다.

1. 감시도 100 도달
2. 치명적 가격 붕괴

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-FAIL-001 | `budget`이 부족하면 예산 소모 행동을 제한해야 한다. 예산 부족 자체는 즉시 Run 실패로 처리하지 않는다. |
| SRS-SETTLE-FAIL-002 | `surveillance`가 100에 도달하면 즉시 Run 실패로 처리해야 한다. |
| SRS-SETTLE-FAIL-003 | `priceChangePercent`가 `crashLine` 이하가 되면 즉시 Run 실패로 처리해야 한다. |
| SRS-SETTLE-FAIL-004 | 즉시 실패 시 Day Settlement를 기다리지 않고 실패 결과 화면으로 전환해야 한다. |

---

## 3. Surveillance Grade

감시도는 장중에는 0~100 숫자로 표시하고, 정산에서는 감시등급으로 변환한다.

| 감시도 | 감시등급 | 의미 |
| ---: | --- | --- |
| 0~24 | A | 정상 |
| 25~49 | B | 관찰 |
| 50~74 | C | 주의 |
| 75~94 | D | 위험 |
| 95~99 | E | 임박 |
| 100 | F | 강제 실패 |

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-SURV-001 | Day Settlement는 감시등급을 표시해야 한다. |
| SRS-SETTLE-SURV-002 | Final Settlement는 최종 감시등급과 평균 감시등급을 표시해야 한다. |
| SRS-SETTLE-SURV-003 | 감시등급 F는 강제 실패로 처리해야 한다. |

---

## 4. Day Settlement

Day Settlement는 실제 수익과 감시등급을 중심으로 결과를 분류한다.

MVP Day 결과는 다음 8개다.

1. 완전 성공
2. 위험 성공
3. 고위험 성공
4. 안정 운용
5. 위험 운용
6. 조용한 실패
7. 손실 마감
8. 강제 실패

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-DAY-001 | Day Settlement는 장중 180초 종료 후 진행해야 한다. |
| SRS-SETTLE-DAY-002 | Day Settlement는 실제 수익과 감시등급을 핵심 축으로 사용해야 한다. |
| SRS-SETTLE-DAY-003 | Day Settlement는 잔여 예산, 보유 비중, 개인 참여도, 변동성, 사회적 비용을 보조 지표로 표시해야 한다. |
| SRS-SETTLE-DAY-004 | 가격 목표를 달성했더라도 감시등급이 높으면 완전 성공으로 처리하지 않아야 한다. |
| SRS-SETTLE-DAY-005 | 정산 화면은 다음 플레이에 도움이 되는 짧은 힌트를 표시해야 한다. |

---

## 5. Final Settlement

Final Settlement는 Day 5의 Day Settlement 이후 진행한다.

MVP Final 등급은 다음 6개다.

1. S — 조용한 대성공
2. A — 성공적 운용
3. B — 위험한 성공
4. C — 간신히 생존
5. D — 실패한 운용
6. F — 강제 종료

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-FINAL-001 | Final Settlement는 5일 Run 종료 후 표시해야 한다. |
| SRS-SETTLE-FINAL-002 | Final Settlement는 누적 실제 수익, 최종 감시등급, 평균 감시등급, 성공 Day 수, 최종 예산, 최종 보유 비중, 사회적 비용을 반영해야 한다. |
| SRS-SETTLE-FINAL-003 | Run 중 강제 실패가 발생하면 Final 등급은 F여야 한다. |
| SRS-SETTLE-FINAL-004 | Final Settlement 이후 `같은 조건으로 재시작`과 `새 Run 시작`을 제공해야 한다. |

---

## 6. Holding Ratio Settlement Bands

| 구간 | 보유 비중 | 정산 의미 |
| --- | ---: | --- |
| 영향력 부족 | 0~10% | 가격 영향력과 수익 기여가 낮음 |
| 안정 구간 | 10~35% | 정상 정산 구간 |
| 부담 구간 | 35~55% | 수익 잠재력은 높지만 감시/사회적 비용 증가 |
| 과점 위험 | 55% 이상 | 정산 패널티가 크고 감시등급 악화 가능 |

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-HOLD-001 | 시스템은 Day Settlement와 Final Settlement에서 보유 비중 구간을 평가해야 한다. |
| SRS-SETTLE-HOLD-002 | 과도한 보유 비중은 정산 리스크로 표시되어야 한다. |
| SRS-SETTLE-HOLD-003 | `포지션 정리`는 이 정산 리스크를 관리하는 핵심 수단이어야 한다. |

---

## 7. Social Cost

사회적 비용은 추상 정산 패널티다.

사회적 비용은 다음 사건에서 누적될 수 있다.

1. 개인 참여도 과열
2. Retail Swarm 패닉
3. 변동성 폭주
4. 감시 문서 이벤트 악화
5. 목표 밴드 이탈 상태의 장기화

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-SOCIAL-001 | 사회적 비용은 실제 피해나 실제 절차 묘사 없이 추상 수치와 문서 경고로만 표현해야 한다. |
| SRS-SETTLE-SOCIAL-002 | 사회적 비용은 Day Settlement와 Final Settlement에 표시되어야 한다. |
| SRS-SETTLE-SOCIAL-003 | 높은 사회적 비용은 Final 등급 보정에 사용할 수 있다. |

---

## 8. Carryover

Day 종료 후 다음 Day로 이월되는 상태는 다음이다.

| 상태 | 처리 |
| --- | --- |
| 예산 | 이월 |
| 누적 실제 수익 | 이월 |
| 보유 비중 | 이월 |
| 평균단가 | 보유 포지션이 있으면 이월 |
| 전일 종가 | 보유 포지션이 있으면 다음 Day 시초가 기준으로 이월 |
| 감시도 | 일부 이월 |
| 사회적 비용 | 누적 |
| 자동 카드 레벨 | 이월 |
| 개인 참여도 | 감소 이월 |
| 뉴스 효과 | 일부 잔류 가능 |
| 시장 유동성 | 대부분 초기화 |
| 변동성 | 대부분 초기화, 과열/패닉 여파 일부 가능 |
| 개장 전 카드 효과 | 이월하지 않음 |

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-CARRY-001 | Day Settlement 이후 Carryover 처리를 수행해야 한다. |
| SRS-SETTLE-CARRY-002 | Carryover 결과는 다음 Day의 초기 상태에 반영되어야 한다. |
| SRS-SETTLE-CARRY-003 | 시장 여파는 새 Day의 Morning News보다 약해야 한다. |
| SRS-SETTLE-CARRY-004 | 보유 포지션이 남아 있으면 다음 Day의 평균단가는 전날 마감 평균단가를 유지해야 하며, 새 Day의 시초가로 재계산하지 않아야 한다. |
| SRS-SETTLE-CARRY-005 | 보유 포지션이 남아 있으면 다음 Day의 시초가는 전날 종가를 기준으로 시작해야 한다. 표시 등락률은 새 Day 시초가 기준 0%로 초기화한다. |

---

## 9. Run Seed and Restart

각 Run은 내부 Run Seed를 가진다.

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-SEED-001 | 새 Run 시작 시 시스템은 내부 Run Seed를 생성해야 한다. |
| SRS-SETTLE-SEED-002 | Run Seed는 Run별 랜덤 Asset Profile, Morning News 대상, Today Condition, 일부 시장 여파 초기 조건을 재현해야 한다. |
| SRS-SETTLE-SEED-003 | 같은 조건 재시작은 동일한 Run Seed를 사용해야 한다. |
| SRS-SETTLE-SEED-004 | MVP에서는 Seed 직접 입력, Seed 공유, 일일 챌린지를 제공하지 않는다. |

---

## 10. Persistence

MVP에서는 localStorage 기반 로컬 저장만 사용한다.

저장 대상은 다음으로 제한한다.

1. 진행 중 Run 상태
2. 최근 Final Settlement 결과
3. 최고 Final 등급
4. 최고 누적 수익

| ID | Requirement |
| --- | --- |
| SRS-SETTLE-SAVE-001 | 시스템은 진행 중 Run 상태를 로컬에 저장할 수 있어야 한다. |
| SRS-SETTLE-SAVE-002 | 시스템은 최근 Final Settlement 결과를 저장해야 한다. |
| SRS-SETTLE-SAVE-003 | 시스템은 최고 Final 등급과 최고 누적 수익을 저장해야 한다. |
| SRS-SETTLE-SAVE-004 | 상세 플레이 로그, 리플레이 데이터, 클라우드 저장, 온라인 랭킹은 MVP 저장 대상에 포함하지 않는다. |

---

## 11. Open Items

후속 밸런싱에서 정의할 항목은 다음이다.

1. 실제 수익 계산식
2. Final 등급 컷
3. 사회적 비용 누적량
4. 감시도 일부 이월 비율
5. 뉴스 잔류율
6. localStorage 키와 마이그레이션 정책
