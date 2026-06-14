# PRD — Market Manipulator Survival v0.2.2

| 항목 | 내용 |
| --- | --- |
| 문서 종류 | PRD (Product Requirements Document) |
| 제품명 | Market Manipulator Survival |
| 버전 | v0.2.2 |
| 상태 | Post-MVP 로컬 합성 체결 엔진 초안 |
| 작성일 | 2026-06-14 |
| 시간대 기준 | Asia/Seoul |
| 기준 문서 | `market-manipulator-survival-prd-v0.2.1.md`, `market-manipulator-survival-prd-v0.2.0.md` |
| 관련 ADR | ADR-0037 |
| 관련 SRS | `market-manipulator-survival-srs-v0.2.2-local-synthetic-execution-engine.md` |

이 문서는 가상 유동성 이벤트를 더 정교한 로컬 체결 모델 위에서 다루기 위한 제품 방향을 정의한다.

---

## 0. 변경 이력

| 버전 | 변경 내용 |
| --- | --- |
| v0.2.2 | `ExecutionGateway` 경계와 로컬 합성 체결 엔진을 Post-MVP 기술 방향으로 추가. 첫 단계는 TypeScript reference engine이며, C++/WASM 엔진은 같은 경계 뒤에서 교체 가능한 후속 후보로 둔다. 기존 호가창 depth profile은 로컬 합성 체결 snapshot을 거쳐 표시 깊이를 산출한다. |

---

## 1. 제품 의도

v0.2.1의 호가벽은 즉시 보이는 깊이 변화와 단기 가격 장벽을 제공한다. v0.2.2에서는 이 계층을 나중에 실제 체결 머신 형태로 확장할 수 있도록 로컬 합성 체결 엔진을 도입한다.

이 기능의 목적은 다음이다.

1. 합성 주문 생명주기와 부분체결 흐름을 게임 내부에서 검증할 수 있게 한다.
2. 호가창 깊이, 벽 소진, 체결량 표시를 단순 수치 보정이 아닌 엔진 결과로 확장할 길을 만든다.
3. C++/WASM 같은 고성능 엔진 후보를 나중에 교체 가능한 구현체로 붙일 수 있게 한다.
4. 실제 시장 연결 없이, 안전한 로컬 시뮬레이션만으로 체결 시스템 구조를 학습한다.

---

## 2. 범위

### 2.1 포함

| 항목 | 설명 |
| --- | --- |
| `ExecutionGateway` | 게임 도메인이 의존하는 합성 체결 인터페이스 |
| TypeScript reference engine | 가격-시간 우선순위, 부분체결, 취소, 만료, depth snapshot을 검증하는 로컬 엔진 |
| 합성 주문 이벤트 | 게임 이벤트를 로컬 엔진 입력으로 바꾸기 위한 후속 통합 지점 |
| 호가창 depth 연동 | 기존 seeded fictional order-book level과 활성 호가벽을 합성 limit liquidity로 변환하고, engine depth snapshot을 표시 depth에 반영 |
| 엔진 교체 가능성 | C++/WASM 또는 local sidecar가 같은 gateway를 구현할 수 있도록 경계 보존 |
| 회귀 검증 | reference engine의 핵심 체결 흐름을 스크립트로 검증 |

### 2.2 제외

| 항목 | 제외 이유 |
| --- | --- |
| 실제 거래소 API 연결 | 게임 엔진 범위를 벗어나고 안전/인증/네트워크 리스크가 큼 |
| 실계좌 또는 실시장 주문 | 제품 안전 원칙상 제외 |
| 실제 종목/티커/시장 데이터 | 허구 게임 데이터만 사용 |
| C++ 엔진 즉시 벤더링 | 도구체인 검증 전에는 빌드 리스크가 큼 |
| 호가벽 전체 재작성 | 첫 단계는 depth 산출 경로 연동에 한정하고, 지속 수량/체결 로그 기반 벽 소진은 후속 통합으로 남김 |

---

## 3. 플레이어 경험

v0.2.2의 첫 단계는 플레이어가 직접 새 화면을 보는 기능이 아니다. 대신 기존/후속 호가창 기능이 다음 방향으로 발전할 수 있게 한다.

1. 기존 seeded 호가 레벨은 로컬 합성 limit liquidity로 변환된다.
2. 활성 호가벽은 같은 로컬 엔진의 추가 합성 liquidity로 변환된다.
3. 호가창 SIZE와 depth는 engine depth snapshot을 기반으로 표시된다.
4. 반대 방향 합성 흐름으로 벽이 부분적으로 소진되는 모델은 후속 통합에서 확장할 수 있다.
5. 체결 이벤트는 차트 볼륨, 가격 반응성, 참여도, 리스크 표시의 입력이 될 수 있다.

---

## 4. 안전 표현 원칙

이 기능은 실제 거래 방법을 설명하거나 실제 시장 접근을 제공하지 않는다.

1. 모든 주문, 호가, 체결, depth는 합성 게임 데이터다.
2. 실제 거래소명, 실제 티커, 실제 계좌, 실제 주문 API를 게임 엔진에 넣지 않는다.
3. 문서와 UI는 체결 엔진을 “로컬 합성 체결”로 설명한다.
4. 금지 행위의 실행 절차나 회피 방법을 다루지 않는다.
5. 실제 금융 시스템 학습이 필요하더라도 이 저장소의 구현은 안전한 추상 시뮬레이션에 머문다.

---

## 5. SRS 위임 사항

SRS는 다음을 확정한다.

1. gateway 메서드와 report 형태
2. limit/market 요청의 기본 처리
3. 가격-시간 우선순위
4. 부분체결, 완전체결, 취소, 만료, 거절 상태
5. depth snapshot 집계 방식
6. deterministic local-only 검증 기준
7. C++/WASM 교체 시 지켜야 할 호환 경계
