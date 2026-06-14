# PRD — Market Manipulator Survival v0.2.6

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | PRD (Product Requirements Document) |
| 제품명 | Market Manipulator Survival |
| 버전 | v0.2.6 |
| 상태 | Post-MVP 호가벽 잔량 표시 초안 |
| 작성일 | 2026-06-14 |
| 시간대 기준 | Asia/Seoul |
| 기준 문서 | `market-manipulator-survival-prd-v0.2.5.md`, `market-manipulator-survival-prd-v0.2.4.md` |
| 관련 ADR | ADR-0036, ADR-0038 |
| 관련 SRS | `market-manipulator-survival-srs-v0.2.6-order-book-wall-state-indicators.md` |

이 문서는 활성 호가벽의 남은 가상 depth와 환급 가능 예산을 호가창에서 더 직접 읽을 수 있게 하는 UI 요구를 정의한다.

---

## 0. 변경 이력

| 버전 | 변경 내용 |
| --- | --- |
| v0.2.6 | 활성 호가벽 행에 남은 depth/reserve 상태를 나타내는 compact indicator와 상세 hover title을 추가한다. |

---

## 1. 제품 의도

v0.2.5에서는 벽 이벤트 로그가 생겼지만, 플레이어가 현재 활성 벽이 얼마나 남았는지는 호가창 행 자체에서도 바로 읽을 수 있어야 한다. 숫자 로그는 사건의 설명이고, 행 indicator는 현재 상태의 계기판 역할을 한다.

이 기능의 목적은 다음이다.

1. 활성 벽 행에서 남은 가상 depth 비율을 즉시 읽게 한다.
2. hover title에서 남은 depth와 환급 가능 예산을 정확한 수치로 제공한다.
3. 기존 PRICE/SIZE 밀도와 hover 조작을 해치지 않는다.
4. 실제 시장 주문/체결 표현 없이 가상 depth/reserve 상태만 표시한다.

---

## 2. 범위

### 2.1 포함

| 항목 | 설명 |
| --- | --- |
| 행 indicator | 활성 벽 행에 남은 depth 비율을 짧은 막대로 표시 |
| 상세 title | 활성 벽 hover title에 남은 depth, 원래 depth, 환급 가능 예산 표시 |
| Overlay action 모델 | DOM overlay action payload에 남은 depth/reserve 수치 추가 |
| 안정적 레이아웃 | 행 높이와 grid track을 바꾸지 않고 indicator를 absolute overlay로 표시 |

### 2.2 제외

| 항목 | 제외 이유 |
| --- | --- |
| 별도 상세 패널 | 현재 장중 화면 밀도를 유지 |
| 새 조작 방식 | 기존 호가 행 hover/click 유지 |
| 실제 주문 정보 | 안전 원칙상 제외 |

---

## 3. 플레이어 경험

1. 벽을 세우면 해당 호가 행에 얇은 상태 막대가 나타난다.
2. 벽이 녹으면 상태 막대가 짧아진다.
3. 행에 마우스를 올리면 `남은 depth 128/160, 환급 8.0B/10B` 형태의 상세 title을 확인할 수 있다.
4. 기존 `벽 빼기` 조작은 그대로 유지된다.

---

## 4. SRS 위임 사항

SRS는 다음을 확정한다.

1. Overlay action 필드
2. Indicator 표시 조건
3. Ratio 계산 방식
4. Hover title 형식
5. 회귀 검증 기준
