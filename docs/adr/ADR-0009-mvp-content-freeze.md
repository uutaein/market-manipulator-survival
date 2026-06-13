# ADR-0009 — MVP Content Freeze

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | ADR (Architecture Decision Record) |
| 제품명 | Market Manipulator Survival |
| ADR 번호 | ADR-0009 |
| 상태 | Accepted, Partially Superseded by ADR-0011 |
| 결정일 | 2026-06-13 |
| 시간대 기준 | Asia/Seoul |
| 관련 PRD | `market-manipulator-survival-prd-v0.1.4.md` |
| 관련 ADR | ADR-0003, ADR-0004, ADR-0005, ADR-0006, ADR-0007, ADR-0008 |
| 결정 범위 | MVP 콘텐츠 수량, Run/Day 기본 길이, 결과 카테고리 수량 |

> Supersession note: Morning News 템플릿 수와 Manual Actions 수량은 ADR-0011이 우선한다. ADR-0011 이후 MVP 기준은 Morning News 5개 템플릿, Manual Actions 4개다.

---

## 1. Context

PRD v0.1.3과 ADR-0007, ADR-0008 이후 MVP는 5일 Run 구조로 확장되었다.

하지만 SRS로 넘어가기 전 다음 수량이 아직 부분적으로 후보 또는 범위로 남아 있었다.

1. Morning News 수량
2. Pre-Open Card 수량
3. Intraday Auto Card 수량
4. Manual Action 수량
5. Document Event 수량
6. Retail Swarm 상태 수량
7. Day Result와 Final Result 수량
8. Market Board 표시 종목 수

MVP를 작게 유지하려면 콘텐츠 수량을 먼저 동결해야 한다.

---

## 2. Decision

MVP 콘텐츠 수량은 다음으로 고정한다.

| 항목 | MVP 기준 |
| --- | ---: |
| Run 길이 | 5 Day |
| Day 장중 운용 시간 | 6분 |
| 개장 전 제한 시간 | 없음 |
| 섹터 | 8개 |
| 종목 | 24개 |
| Morning News 템플릿 | 5개, ADR-0011에서 보정 |
| Day당 활성 Morning News | 1개 |
| Pre-Open Cards | 4개 |
| Day당 Pre-Open Card 사용 | 최대 1개, 생략 가능 |
| Intraday Auto Cards | 8개 |
| Manual Actions | 4개, ADR-0011에서 보정 |
| Document Events | 8개 |
| Retail Swarm states | 3개: 관심 / 과열 / 패닉 |
| Market Board 표시 종목 | 8개 |
| Day Result categories | 8개 |
| Final Result grades | 6개 |

정확한 수치 효과, 등장 확률, 계수, 점수 계산식은 SRS/SDD에서 정의한다.
감시등급 F, 예산 고갈, 치명적 가격 붕괴는 일반 Day Result가 아니라 즉시 Run Failure 상태로 별도 처리한다.

---

## 3. Consequences

### 3.1 Positive Consequences

1. MVP 완료 기준이 명확해진다.
2. 콘텐츠 제작량과 밸런싱 범위를 제한할 수 있다.
3. 5일 Run에서 반복을 줄일 최소 뉴스/이벤트 수량을 확보한다.
4. 자동 카드와 수동 액션의 역할을 분리하기 쉬워진다.
5. Day Settlement와 Final Settlement 화면 요구사항이 명확해진다.

### 3.2 Negative Consequences

1. 30분 내외 Run에 비해 콘텐츠 반복이 여전히 느껴질 수 있다.
2. 5개 뉴스와 8개 문서 이벤트도 초안 작성 비용이 있다.
3. 8개 Final/Day 결과 표현이 UI 설명 부담을 만들 수 있다.

### 3.3 Mitigations

1. 뉴스와 문서 이벤트는 모두 짧은 문서형 템플릿으로 작성한다.
2. 같은 콘텐츠라도 영향을 받는 섹터, 종목, Today Condition으로 변주한다.
3. 결과 화면은 카테고리명보다 핵심 원인 2~3개를 우선 표시한다.

---

## 4. Alternatives Considered

### 4.1 콘텐츠 수량을 SRS까지 열어둠

유연성은 있지만 MVP 범위가 계속 흔들릴 수 있다.  
따라서 PRD 단계에서 수량을 동결한다.

### 4.2 뉴스 10개 이하

제작량은 줄지만 5일 Run 반복에서 같은 뉴스가 빠르게 반복될 수 있다.  
초기 ADR-0009에서는 15개로 두었으나, 이후 ADR-0011에서 5개 템플릿과 랜덤 허구 대상 조합으로 축소했다.

### 4.3 수동 액션 3개

입력은 단순해지지만 장중 운용 선택지가 부족하다.  
MVP 핵심 지표를 다루기 위해 4개로 고정한다.

### 4.4 Market Board에 24개 종목 전체 표시

시장감은 강하지만 UI 복잡도가 크다.  
전체 24개 종목은 간략 상태를 가지되, 화면에는 8개만 표시한다.

---

## 5. Status

Accepted.

이 ADR은 PRD v0.1.4의 MVP 콘텐츠 수량 기준으로 적용한다. 단, Morning News 템플릿 수와 Manual Actions 수량은 ADR-0011이 우선한다.
