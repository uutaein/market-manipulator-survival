# ADR-0029 — First Playable Implementation Alignment

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.1.5, MVP Freeze Candidate, SRS v0.1.0~v0.1.6, SDD v0.1.0, MVP SPEC v0.1.0, traceability.md |

## Context

After MVP SPEC acceptance, implementation and playtesting feedback clarified several first-playable details that were either newer than older PRD/ADR text or more specific than the original freeze candidate.

The repository needs current documents to match the playable build without rewriting historical ADRs.

## Decision

The current first playable baseline uses:

1. TypeScript + Phaser 3 + Vite.
2. Phaser scenes as the game shell, with browser DOM overlays for chart, volume, order-book/depth, and market dashboard rendering where useful.
3. Pre-open Card selection before Morning News reveal.
4. 3 Morning News items per Day: 1 sector item and 2 fictional asset items.
5. Day 1 limited to `선취매` for first-position onboarding; other pre-open cards open from Day 2 when a carried-position context exists.
6. Pre-open cards: `선취매`, `뉴스 배정`, `종목 분석`, `관망`.
7. Manual actions: `유동성 공급`, `매수봇`, `매도봇`, and `포지션 정리`, with `포지션 정리` displayed as `수익실현` or `손실차단` based on position context.
8. A fictional candle/volume chart, average-entry line, order-book/depth panel, and always-visible budget/P&L readout are required first-playable intraday feedback.
9. Market Board context rows are player asset + 2 same-sector competitors + 7 other-sector averages.
10. Market Dashboard ranks all 24 individual fictional assets by baseline-anchored fictional trade value with live activity adjustment.
11. Fixed asset market profiles provide baseline trade value, market role, and influence resistance so larger assets are harder to move.
12. Retail Swarm may be represented as a participant mood/RSI-style panel in the first playable rather than moving crowd tokens.
13. Intraday account/P&L display uses a normalized fictional position value based on `holdingRatio * assetInfluenceResistance * currentPrice / averageEntryPrice`, so position value is consistent with the budget required to acquire influence in larger assets.
14. Document Event choices that change budget must show the budget delta in the popup. The `유동성 경색 보고` aggressive response is named `유동성 긴급 공급` and uses a low 2B budget cost, distinct from the manual `유동성 공급` button.

## Consequences

Current PRD, SRS, SDD, SPEC, and traceability documents should use the decisions above as the live baseline.

Historical PRDs and ADRs are not rewritten. They remain decision history and may contain superseded names or counts.

Balance values remain playtest-tunable. This ADR does not freeze final numbers.

## Safety

The first playable remains fictional and satirical. It must not use real companies, real tickers, real exchanges, real market data, real news, or real-world financial-crime procedures.

## Follow-up

Keep `docs/traceability.md`, `MEMORY.md`, `SKILLS.md`, and README files aligned whenever gameplay behavior or first-playable scope changes.
