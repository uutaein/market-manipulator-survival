# Market Manipulator Survival

`Market Manipulator Survival` is a documentation-first game design workspace for a fictional, satirical market-pressure management browser game.

The project combines:

- Vampire Survivors-like pressure, waves, automatic cards, and limited real-time actions
- Papers, Please-like morning documents, stamps, warnings, and bureaucratic decision pressure
- A fictional market board fantasy with abstract game stats

The game must not use real companies, real tickers, real exchanges, real market data, real news, or real financial-crime procedures.

---

## Current MVP Shape

The MVP is a 5-Day Run.

Each Day follows:

1. Morning News
2. Market Briefing
3. Pre-open Card selection
4. Opening Approval / stamp action
5. Intraday operation
6. Day Settlement

After Day 5, Final Settlement occurs.

MVP defaults:

- Intraday duration: 6 minutes per Day
- Morning News templates: 5
- Pre-open Cards: 4
- Manual Actions: 4
- Auto Cards: 8
- Document Events: 8
- Sectors: 8 fictional sectors
- Assets: 24 fictional assets
- Market Board: 8 displayed assets
- Storage: local only

---

## Development

The repository now has a minimal TypeScript + Phaser 3 + Vite scaffold.

```powershell
npm install
npm run dev
npm run bdd
npm run typecheck
npm run build
```

Current implementation status:

- Project scaffold: present
- MVP scene shell: present
- Core Run State domain module: present
- Day Setup / Morning News domain module: present
- Pre-open Card domain module: present
- Market Board domain module: present
- Intraday State / Price Tick domain module: present
- Manual Action domain module: present
- Auto Card domain module: present
- Document Event domain module: present
- Retail Swarm domain module: present
- Cucumber step definitions: present
- Gameplay simulation: not implemented yet
- BDD validation: executable against an in-memory support world, not yet against Phaser gameplay modules

---

## Documentation Layout

Product and design documents live under `docs/`.
Gherkin feature files live under root `feature/`.

```text
feature/
  run/          Run lifecycle and onboarding features
  market/       Asset and Market Board features
  preopen/      Morning News and Pre-open Card features
  intraday/     Tick, action, auto card, document, and swarm features
  settlement/   Settlement and carryover features
  persistence/  Local storage features
  safety/       Safety abstraction features
  steps/        TypeScript Cucumber step definitions
  support/      Shared Cucumber world and accepted MVP constants

docs/
  adr/   Architecture Decision Records
  prd/   Product requirements and MVP freeze documents
  srs/   Software requirements documents
  sdd/   Software design documents
  spec/  Implementation-facing specifications
  traceability.md
```

Key current documents:

- [PRD v0.1.5](docs/prd/market-manipulator-survival-prd-v0.1.5.md)
- [MVP Freeze Candidate](docs/prd/market-manipulator-survival-mvp-freeze-candidate.md)
- [Traceability Matrix](docs/traceability.md)
- [Gherkin Feature Index](feature/README.md)
- [SRS v0.1.0 — Core Game State](docs/srs/market-manipulator-survival-srs-v0.1.0-core-game-state.md)
- [SRS v0.1.1 — Tick Price Formula](docs/srs/market-manipulator-survival-srs-v0.1.1-tick-price-formula.md)
- [SRS v0.1.2 — Run Flow and Screens](docs/srs/market-manipulator-survival-srs-v0.1.2-run-flow-and-screens.md)
- [SRS v0.1.3 — Content and Interactions](docs/srs/market-manipulator-survival-srs-v0.1.3-content-and-interactions.md)
- [SRS v0.1.4 — Settlement, Carryover, and Persistence](docs/srs/market-manipulator-survival-srs-v0.1.4-settlement-carryover-persistence.md)
- [SRS v0.1.5 — Freeze Readiness Review](docs/srs/market-manipulator-survival-srs-v0.1.5-freeze-readiness-review.md)
- [SRS v0.1.6 — Baseline Values and Triggers](docs/srs/market-manipulator-survival-srs-v0.1.6-baseline-values-and-triggers.md)
- [SDD v0.1.0 — Simulation Modularity](docs/sdd/market-manipulator-survival-sdd-v0.1.0-simulation-modularity.md)
- [MVP SPEC v0.1.0 — First Playable Build](docs/spec/market-manipulator-survival-mvp-spec-v0.1.0.md)
- [MEMORY](MEMORY.md)
- [SKILLS](SKILLS.md)

---

## Safety Rules

This project is not an investment tool and not a real-world market manipulation simulator.

Use fictional, abstract terminology:

| Avoid | Use Instead |
| --- | --- |
| 자전거래 | 유동성 공급 / 유동성 순환 |
| 주가조작 | 시장 압력 관리 |
| 세력 | 운용 데스크 |
| 개미 | 개인 참여자 / 개인 참여도 |
| 주가 끌어올리기 | 가격 추진 |
| 주가 내려오기 | 과열 해소 / 가격 안정화 |
| 물량 털기 | 포지션 정리 |
| 허수 주문 | 신호 주문 / 관심 신호 |

---

## Current Status

The repository is still documentation-first.

Implementation has started with a minimal project scaffold.  
The current work is still early: gameplay systems are not implemented yet. The Cucumber layer currently validates accepted Gherkin coverage against an in-memory support world.
