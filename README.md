# Market Manipulator Survival

`Market Manipulator Survival` is a documentation-led game design and implementation workspace for a fictional, satirical market-pressure management browser game.

The project combines:

- Vampire Survivors-like pressure, waves, automatic cards, and limited real-time actions
- Papers, Please-like morning documents, stamps, warnings, and bureaucratic decision pressure
- A fictional market board fantasy with abstract game stats

The game must not use real companies, real tickers, real exchanges, real market data, real news, or real financial-crime procedures.

---

## Current MVP Shape

The MVP is a 5-Day Run.

Each Day follows:

1. Pre-open Card selection
2. Morning News
3. Market Briefing
4. Opening Approval / stamp action
5. Intraday operation
6. Day Settlement

After Day 5, Final Settlement occurs.

MVP defaults:

- Intraday duration: 3 minutes per Day
- Morning News templates: 5
- Morning News per Day: 3, with 1 sector item and 2 fictional asset items
- Pre-open Cards: 4
- Pre-open flow: choose a card before Morning News is revealed, then approve opening after briefing
- Manual Actions: 4
- Auto Cards: 8
- Document Events: 8
- Sectors: 8 fictional sectors
- Assets: 24 fictional assets
- Market Board: player asset, 2 same-sector competitors, 7 other-sector averages
- Market Dashboard: 24 individual fictional assets ranked by fictional trade value
- Intraday quote readout: opening price, current price, average entry price, held units, and fictional position P/L
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
- Immediate failure scene routing: present
- Core Run State domain module: present
- Day Setup / Morning News domain module: present
- Pre-open Card domain module: present
- Market Board domain module: present
- Intraday State / Price Tick domain module: present
- Manual Action domain module: present
- Auto Card domain module: present
- Document Event domain module: present
- Retail Swarm domain module: present
- Settlement domain module: present
- Day Carryover domain module: present
- Local Persistence domain module: present
- Safety Contract domain module: present
- Run/Day scene wiring: first playable
- Intraday candle/volume chart and money-flow panel: first playable
- Market Board scene wiring: first playable
- Intraday tick/action scene wiring: first playable
- Auto Card scene wiring: first playable
- Document Event scene wiring: first playable
- Retail Swarm scene wiring: first playable
- Day Settlement scene wiring: first playable
- Final Settlement scene wiring: first playable
- Local persistence browser wiring: first playable
- Cucumber step definitions: present
- Gameplay simulation: first playable loop implemented, playtest tuning ongoing
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

The repository remains documentation-led, but implementation has started.

The first playable loop is wired through Phaser scenes, domain modules, and browser chart/table overlays. The Cucumber layer still validates accepted Gherkin coverage against an in-memory support world, not the rendered Phaser UI.
