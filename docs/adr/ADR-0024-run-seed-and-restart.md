# ADR-0024 — Run Seed and Restart

| 항목 | 내용 |
| --- | --- |
| 상태 | Accepted |
| 날짜 | 2026-06-13 |
| 관련 문서 | PRD v0.1.5, ADR-0019, ADR-0021, ADR-0023 |

## Context

MVP는 5일 Run 구조를 사용하며, Run마다 아침 뉴스 대상, Today Condition, Run별 랜덤 Asset Profile, 시장 여파 초기 조건이 달라질 수 있다.

플레이어가 실패 원인을 학습하고 같은 조건에서 다른 선택을 실험하려면, Run의 초기 조건을 재현할 수 있어야 한다.

## Decision

MVP의 각 Run은 내부 Seed를 가진다.

Run Seed는 해당 Run의 아침 뉴스 대상, Today Condition, Run별 랜덤 Asset Profile, 일부 시장 여파 초기 조건을 재현하기 위한 기준값이다.

플레이어가 Run 실패 또는 Final Settlement에 도달하면 다음 선택지를 제공한다.

1. 같은 조건으로 재시작
2. 새 Run 시작

`같은 조건으로 재시작`은 동일한 Run Seed를 사용해 같은 초기 조건을 다시 플레이하게 한다.  
이 기능은 플레이어가 이전 실패를 학습하고 다른 선택을 실험할 수 있게 하기 위한 MVP 핵심 재플레이 장치다.

MVP에서는 Seed 직접 입력, Seed 공유, 일일 챌린지 기능은 제공하지 않는다.  
이 기능들은 P1/P2 후보로 둔다.

## Consequences

플레이어는 실패 후 바로 다른 선택을 실험할 수 있다.

Run별 랜덤 Asset Profile과 Morning News의 무작위성이 유지되면서도, 학습 가능한 재시도 흐름을 제공할 수 있다.

Seed 직접 입력과 공유 기능을 제외해 MVP UI와 저장 범위를 작게 유지한다.

정확한 Seed 생성 방식, 저장 범위, 재시작 시 유지/초기화되는 항목은 SRS/SDD 단계에서 정의한다.

## Alternatives Considered

### New Run Only

기각한다.  
실패 후 조건이 매번 바뀌면 플레이어가 이전 선택을 비교 실험하기 어렵다.

### Public Seed Input and Sharing

기각한다.  
재플레이와 챌린지에는 유용하지만 MVP의 핵심 루프 검증에는 필수적이지 않고 UI/저장/검증 범위를 늘린다.
