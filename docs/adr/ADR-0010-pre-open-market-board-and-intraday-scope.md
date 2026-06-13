# ADR-0010 — Pre-Open, Market Board, and Intraday Scope

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | ADR (Architecture Decision Record) |
| 제품명 | Market Manipulator Survival |
| ADR 번호 | ADR-0010 |
| 상태 | Accepted, Partially Superseded by ADR-0011 and ADR-0016 |
| 결정일 | 2026-06-13 |
| 시간대 기준 | Asia/Seoul |
| 관련 PRD | `market-manipulator-survival-prd-v0.1.4.md` |
| 관련 ADR | ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009 |
| 결정 범위 | 개장 전 단계 역할, Market Board 표시/계산 범위, 장중 수동/자동 액션 경계, Retail Swarm의 시스템 역할 |

> Supersession note: MVP 수동 액션 목록은 ADR-0011이 우선한다. ADR-0011 이후 MVP 수동 액션은 `유동성 공급`, `가격 추진`, `과열 해소`, `포지션 정리` 4개다. Market Board의 최종 표시/계산 범위는 ADR-0016이 우선한다.

---

## 1. Context

PRD v0.1.3은 개장 전 뉴스, 개장 전 카드, 시장 보드, Retail Swarm, 장중 액션을 정의했다.

그러나 다음 항목은 SRS로 넘어가기 전에 PRD 수준에서 더 닫아야 했다.

1. Morning News와 Market Briefing의 역할 차이
2. 개장 전 카드 사용이 필수인지 여부
3. 개장 승인 액션이 필수 흐름인지 여부
4. Market Board에 표시할 비플레이어 종목 수
5. 24개 종목 전체를 계산하는지, 표시 종목만 계산하는지
6. 수동 액션과 자동 카드의 역할 경계
7. 보유 비중 변화가 수동인지 자동인지
8. Retail Swarm이 순수 시각화인지 실제 상태 변화와 연결되는지

---

## 2. Decision

### 2.1 Pre-Open Stage

각 Day는 다음 순서로 시작한다.

```text
Morning News
→ Market Briefing
→ Pre-Open Card selection or 관망
→ Opening Approval / 도장 액션
→ Intraday
```

Morning News의 역할은 해당 Day의 조건 변화를 만드는 것이다.

Market Briefing의 역할은 플레이어가 읽고 판단할 수 있도록 뉴스 영향, 대상 종목 상태, 목표 밴드, 예산 조건, 주요 리스크를 요약하는 것이다.

Pre-Open Card는 Day당 최대 1장만 사용할 수 있으며, 플레이어는 카드 없이 관망으로 개장할 수 있다.

Opening Approval 또는 도장 액션은 장중으로 넘어가기 위한 필수 UX 액션이다.

### 2.2 Market Board Scope

Market Board에는 매 Day 8개 종목만 표시한다.

| 표시 대상 | 수량 |
| --- | ---: |
| 플레이어 대상 종목 | 1 |
| 같은 섹터 비플레이어 종목 | 2 |
| 다른 섹터 대표 종목 | 5 |

플레이어 대상 종목은 상세 계산한다.

비플레이어 종목 7개는 뉴스, 섹터, Asset Profile, 랜덤 변동성 기반의 간략 상태만 계산한다.

24개 종목 전체의 실시간 상세 시뮬레이션은 MVP에서 제외한다.

비플레이어 종목의 표시 정보는 종목명, 섹터, 현재 등락률, 뉴스 영향 여부, 과열/패닉 상태, 간략 추세 아이콘으로 제한한다.

### 2.3 Intraday Interaction Scope

MVP 수동 액션은 ADR-0011에 따라 다음 4개로 고정한다.

| 수동 액션 | 역할 |
| --- | --- |
| 유동성 공급 | 예산 소모, 거래 흐름과 변동성 증가 |
| 가격 추진 | 예산 소모, 단기 상승 압력 |
| 과열 해소 | 압력 감소, 감시도/변동성 완화 |
| 포지션 정리 | 보유 비중 감소, 예산 회복, 가격 압력 감소 |

`방어 자금 투입`, `군중 진정`, `관심 신호`는 MVP 수동 버튼이 아니다. 이들은 자동 카드, 문서 이벤트 효과, 또는 P1 후보로 둔다.

Intraday Auto Cards는 8개로 고정하되, 개별 명칭과 수치 효과는 SRS/SDD에서 확정한다.

자동 카드 전용 효과는 반복 유동성 보정, 관심 신호 보정, 감시 완충, 변동성 완충, 정산 보조 범주 안에서 설계한다.

### 2.4 Holding Ratio Changes

보유 비중은 수동과 자동 양쪽으로 변할 수 있다.

수동 액션 중에서는 `포지션 정리`가 보유 비중을 낮추는 명시적 조작이다.

개장 전 카드와 자동 카드는 보유 비중 또는 시장 영향력을 간접적으로 올리거나 낮출 수 있다.

모든 표현은 실제 금융 절차가 아니라 게임용 영향력/정산 리스크로 유지한다.

### 2.5 Retail Swarm Role

Retail Swarm은 순수 배경 연출이 아니다.

Retail Swarm은 개인 참여도의 시각화이며, 가격 압력, 변동성, 감시도 변화와 연결되는 상태 장치다.

MVP 상태는 다음 4개로 고정한다.

1. 조용함
2. 관심 형성
3. 과열
4. 패닉

---

## 3. Consequences

### 3.1 Positive Consequences

1. 개장 전 문서 UX의 역할이 명확해진다.
2. 카드 없이 개장할 수 있어 예산 보전 전략이 가능하다.
3. 시장 보드는 시장감을 주되 화면 복잡도를 제한한다.
4. 24개 종목 전체가 존재한다는 감각을 유지하면서 상세 계산 범위를 표시 종목으로 줄인다.
5. 수동 액션과 자동 카드가 겹치지 않게 설계할 기준이 생긴다.
6. Retail Swarm이 게임 상태와 연결되어 Vampire Survivors식 압박을 만든다.

### 3.2 Negative Consequences

1. 표시 대상이 아닌 종목의 상태를 얼마나 보여줄지 별도 UX 판단이 필요하다.
2. Market Board 표시 종목 선정 규칙이 필요하다.
3. 수동 4개와 자동 8개를 모두 설명하려면 UI 정보량이 늘어난다.
4. Retail Swarm과 수치 변화가 어긋나면 플레이어가 상태를 오해할 수 있다.

### 3.3 Mitigations

1. 비플레이어 종목은 간략 등락률과 상태 아이콘만 가진다.
2. Market Board 선정 규칙은 SRS에서 단순 우선순위로 정의한다.
3. 수동 액션 버튼은 짧은 수치 효과와 쿨다운만 표시한다.
4. Retail Swarm 상태 색상과 움직임은 개인 참여도 구간과 일치시킨다.

---

## 4. Status

Accepted.

이 ADR은 PRD v0.1.4의 개장 전, Market Board, 장중 인터랙션 범위 기준으로 적용한다.
