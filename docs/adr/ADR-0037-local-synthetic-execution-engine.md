# ADR-0037 — Local Synthetic Execution Engine

| Item | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-06-14 |
| Related Documents | PRD v0.2.2, SRS v0.2.2, ADR-0036, SDD v0.1.0 |

## Context

Order-book wall interactions started as direct fictional depth boosts. That is enough for the first visible feature, but it does not create a clean path toward learning and testing order lifecycle concepts such as accepted, rested, partially filled, filled, canceled, expired, and rejected states.

The user wants the game to use a real matching-machine style model for synthetic liquidity events, while keeping the product safe and separate from real venues, real market data, and real account connectivity.

## Decision

Add a local synthetic execution layer behind an `ExecutionGateway` boundary.

1. The execution layer runs only on fictional, seeded, local game data.
2. The initial implementation is a TypeScript reference engine under `src/domain/execution/`.
3. The reference engine supports limit/market requests, price-time priority, partial fills, cancellation, expiry, and depth snapshots.
4. The order-book profile may seed the gateway with existing fictional depth levels and active wall liquidity, then read back the local depth snapshot for visible depth.
5. The game domain must depend on the gateway shape, not on a specific engine implementation.
6. A later C++/WASM or sidecar engine may replace the reference engine if it implements the same gateway contract.
7. External exchange APIs are not used as the embedded game engine.
8. No real exchange connection, real account, real ticker, real market data, or procedural real-world trading instruction is introduced.

## Rationale

This gives the project realistic software architecture practice without turning the game into a real trading tool. The useful learning surface is order lifecycle handling, matching semantics, depth snapshots, replayability, and risk boundaries.

Keeping the reference engine in TypeScript first lowers build risk and gives deterministic tests. The interface still preserves a clean path to C++/WASM later.

## Alternatives Considered

### Connect directly to an exchange testnet

Rejected for the game engine. Testnets are useful for separate API integration training, but they are remote services, not embeddable matching engines. They also add credentials, network failure, rate limits, and safety scope that the game does not need.

### Vendor a C++ engine immediately

Deferred. C++/WASM is a good future implementation target, but the current workspace does not have a verified Emscripten/CMake toolchain. Starting with the gateway and reference engine avoids coupling game design to build tooling.

### Keep direct depth boosts only

Rejected as the long-term direction. Direct boosts are simple, but they do not model order lifecycle or partial consumption of synthetic depth.

## Consequences

1. `src/domain/execution/` becomes the execution boundary for synthetic liquidity.
2. Order-book wall visible depth is migrated from direct depth boost to synthetic local execution depth without changing the UI contract.
3. Tests must cover matching priority, partial fill, market-order expiry, cancel, and depth snapshots.
4. C++/WASM integration must implement the existing gateway rather than leaking engine-specific APIs into game scenes.
5. Stateful wall quantity decay is implemented through a game adapter around the execution gateway boundary and may later consume execution reports directly.
6. Safety copy must continue to describe this as fictional local simulation, not real market access.

## PRD Impact

PRD v0.2.2 records Local Synthetic Execution as a post-MVP architecture layer for order-book and future execution-training features.

## SRS Notes

SRS v0.2.2 defines gateway behavior, local-only constraints, deterministic depth snapshots, and acceptance criteria for the reference engine.

## Open Questions

1. Whether the first C++ candidate should be Liquibook or a smaller C++ limit-order-book project.
2. Whether the C++ implementation should run as WASM in-browser or as a local sidecar during development.
3. How much of the order-book wall feature should later migrate from pressure-based decay to execution-report-driven synthetic consumption.
