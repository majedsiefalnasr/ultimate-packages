# Compatibility / Baseline Manifest

Pinned Phase 0 baselines. Re-verify immediately before Phase 1 kickoff per the spec's Risks section (Prime relicensing volatility observed during Phase 0 investigation itself).

| Framework | Status | Version | Commit / Identifier | License |
|---|---|---|---|---|
| PrimeNG | Production Baseline | `21.1.9` | `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` | MIT |
| PrimeVue | Production Baseline | `4.5.5` | `66dde6788220fc9e6822342919d1ceb0e3460ece` | MIT |
| PrimeReact | Production Baseline | `10.9.9` | `d0f574e39122668292fc7a740f081bae1b93b1e9` | MIT |
| PrimeReact 11 | Architectural Reference only | `11.1.0` | not pinned, not incorporated | Non-MIT (commercial) |
| `@primeuix/utils` | Production Baseline | `0.7.2` | tarball shasum `0ded7f74bddf191f0e16aea34b593a7fcffa94b5` | MIT |
| `@primeuix/styled` | Production Baseline | `0.7.4` | tarball shasum `d2108a7fad297dea60d549b2c10ed744dc0cbc0e` | MIT |
| `@primeuix/styles` | Production Baseline | `2.0.3` | tarball shasum `e42d14c138fe092683228d65a3f6de17de70d6a0` | MIT |
| `@primeuix/motion` | Production Baseline | `0.0.10` | tarball shasum `9af4238226042d80518dd343c6481d03582e374a` | MIT |

## Peer/framework compatibility

- Angular: `^21.0.7` and up (PrimeNG 21.1.9 peer range)
- Vue: `^3.5.0` line (PrimeVue 4.5.5 peer range)
- React: `^17.0.0 || ^18.0.0 || ^19.0.0` (PrimeReact 10.9.9 peer range)

## Rejected candidates

PrimeNG `-lts` tags (commercial CLA); PrimeReact `>= 11.0.0` (commercial); any `@primeuix/*` package at or above its relicense version (`utils >= 0.8.0`, `styled >= 1.0.0`, `styles >= 3.0.0`, `motion >= 1.0.0`).
