# Performance Baseline

Phase 1 (`UltimateUIX Foundation`) baseline measurements, recorded once at Phase 1 completion for later comparison. Per the Blueprint's performance strategy ("do not optimize based on assumptions; establish benchmarks"), these numbers are not a budget or a CI gate — they are a reference point for Phase 2+.

## Package size

| Package | dist/ size | dist/ file count | index.mjs gzip size |
|---|---|---|---|
| packages/uix-motion | 33.3 KB | 3 | 2.05 KB |
| packages/uix-styled | 111.0 KB | 3 | 8.10 KB |
| packages/uix-styles | 14.3 KB | 6 | 0.65 KB |
| packages/uix-utils | 371.7 KB | 24 | 13.30 KB |

Measured with `node scripts/provenance/measure-package-size.mjs` against a fresh `pnpm run build` (Node v24.15.0, pnpm 9.6.0).

## Tree-shaking spot-check

Bundled `@ultimate/uix-utils/classnames` alone via esbuild 0.27.7 (`--bundle --format=esm`): output was `27` lines, containing zero references to `dom`-module-specific functions (`hasClass`, `getScrollableParents`, `blockBodyScroll`) — confirms subpath imports do not pull in unrelated submodules. The bundled output contains only the `classnames`/`cn` implementation.

Note: the brief's alias form (`--alias:@ultimate/uix-utils=<dist>`) does not resolve for a scoped, multi-segment specifier under esbuild's alias substitution — it does not walk the package's `exports` map (`"./*": "./dist/*/index.mjs"`) for subpaths. The check was run with the alias pointed at the resolved subpath file directly (`--alias:@ultimate/uix-utils/classnames=<dist>/classnames/index.mjs`), which is equivalent to how a bundler resolves the subpath export in practice.

## Notes

- No runtime/initialization-cost benchmark is included — these packages have no framework consumer yet (Phase 2+). Re-baseline runtime cost at Phase 2 exit.
- Numbers reflect an unoptimized first build; re-measure after any build-config change in a later phase.
