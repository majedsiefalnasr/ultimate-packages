# Phase 1 — UltimateUIX Foundation

**Status:** Draft for review
**References:** `ULTIMATE_PLATFORM_BLUEPRINT.md` (v0.1, §4/§5/§6/§9/§10), `docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md`, `docs/architecture/{PROVENANCE,DEPENDENCIES,PACKAGE_ARCHITECTURE,DECISIONS}.md`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

---

## Context

Phase 0 established the repository, pinned exact MIT baselines, and verified provenance/licensing for four `@primeuix/*` packages. `packages/{uix,uix-utils,uix-styled,uix-styles,uix-motion}/` exist only as stubs (`THIRD-PARTY-NOTICES.md` placeholders, `.gitkeep`). No source has been incorporated. CI validators (`validate-boundaries.mjs`, `validate-dependency-ceiling.mjs`, `validate-provenance.mjs`) exist and currently pass trivially ("nothing to validate yet").

Phase 1 is the first phase in which Prime-derived source may be incorporated. Its job is to turn the four pinned `@primeuix/*` packages into four Ultimate-owned, independently buildable, framework-neutral packages — the shared foundation `UltimateNG`/`UltimateReact`/`UltimateVue` will depend on starting Phase 2.

### Key investigation finding: the pinned npm tarballs contain no source

The four pinned tarballs already cached in `.vendor-cache/` (Phase 0's `vendor-snapshot.mjs` output) contain **only compiled output** — `dist/**/*.mjs`, `dist/**/*.d.mts`, `LICENSE`, `README.md`, `package.json`. There is no `src/` directory in any of the four tarballs, even though each package's own `package.json` `build` script references `src/`.

Separately, Phase 0's own Finding 3 already established that `primefaces/primeuix`'s GitHub history never reached these exact pinned versions (`main` branch is frozen at `utils@0.6.4`; all four npm releases carry `gitHead: null`). So the upstream git repository cannot supply source at the pinned versions either.

**This investigation found the resolution:** every pinned tarball's published `.mjs.map` sourcemap files embed a `sourcesContent` array — the complete, original, per-file TypeScript source, verified present for all four packages down to individual function-level files (e.g. `uix-utils`'s `dom` module resolves to ~90 separate `src/dom/methods/*.ts`/`src/dom/helpers/*.ts` files; `uix-styled` resolves to 18 separate files under `src/actions/`, `src/helpers/`, `src/config/`, etc.). This is the exact pinned MIT baseline, at file granularity, fully reproducible from artifacts Phase 0 already checksummed. No re-fetch from a mutable upstream source is required.

This finding drives the Provenance Requirements section below: **sourcemap extraction is the official Phase 1 vendoring mechanism**, not a fallback.

---

## Objective

Establish `UltimateUIX` as four independently owned, independently buildable, independently testable, framework-neutral packages, seeded from the verified Phase 0 PrimeUIX MIT baseline, with complete file-level provenance and zero prohibited Prime runtime dependencies — ready for `UltimateNG` (Phase 2) to consume.

---

## Inputs

- `ULTIMATE_PLATFORM_BLUEPRINT.md` §2 (ownership/provenance/framework-neutrality principles), §4/§5 (package boundaries), §6 (dependency direction), §9 (public API strategy), §10 (build strategy — plain pnpm, ADR-015 confirmed).
- Phase 0 spec + `docs/architecture/{PROVENANCE,DEPENDENCIES,DECISIONS,PACKAGE_ARCHITECTURE}.md` — pinned baselines, MIT ceilings, existing CI validators, package manager (pnpm workspaces), directory scaffold.
- `.vendor-cache/@primeuix__{utils-0.7.2,styled-0.7.4,styles-2.0.3,motion-0.0.10}.tar.gz` — Phase 0's checksummed, pinned npm tarballs (source of truth for Phase 1 extraction).
- `docs/architecture/checksums.json` — SHA-256 of each pinned tarball, produced by `scripts/provenance/vendor-snapshot.mjs`.

---

## Constraints (from Phase 0 and the Blueprint, binding on Phase 1)

- No runtime dependency on current `@primeuix/*`, `primeng`, `primevue`, `primereact` packages (ADR-004).
- Never exceed the pinned MIT ceilings: `utils@0.7.2`, `styled@0.7.4`, `styles@2.0.3`, `motion@0.0.10` (`docs/architecture/DEPENDENCIES.md`).
- `packages/uix*` must contain zero Angular/React/Vue imports (existing `validate-boundaries.mjs`).
- Every incorporated Prime-derived source area must have a `PROVENANCE.md` entry, CI-enforced against diffs touching `packages/uix*` (existing `validate-provenance.mjs`).
- pnpm workspaces, plain `pnpm -r` build orchestration — no Turborepo/Nx without demonstrated need (ADR-015).
- Package names remain provisional per Blueprint §34 in general, **except** where this spec explicitly commits a name (see Package Scope below).
- No component migration, no Angular/React/Vue work, no selector renaming, no theme implementation, no CLI/MCP/AI/Skills work, no public package publishing (task non-goals, restated in full below).

---

## PrimeUIX Findings

Investigated all four packages by extracting `.vendor-cache/*.tar.gz` and reading `package.json`, `dist/**`, and embedded sourcemap `sourcesContent`.

### `@primeuix/utils@0.7.2`

- **Responsibility:** framework-neutral utility functions used by PrimeNG/PrimeVue component internals.
- **Public API:** 7 submodule entry points via `package.json` `exports["./*"]` — `classnames`, `dom`, `eventbus`, `mergeprops`, `object`, `uuid`, `zindex`, plus a barrel `index.mjs` re-exporting all seven.
- **Internal API:** none — every exported function is the public surface; no private/internal module.
- **Dependencies:** zero runtime dependencies (verified via `package.json`).
- **Framework coupling:** none. Pure functions (`classnames`, `object`, `uuid`) plus browser DOM helpers (`dom` module — ~90 files: focus management, scroll/viewport measurement, RTL detection via `isRTL()`, `isPrefersReducedMotion()`, style-tag injection). No Angular/React/Vue import anywhere.
- **Build process:** upstream uses `tsup` (confirmed via `package.json` `build` script: `tsup` after a `prebuild` step), producing ESM (`.mjs`) + TypeScript declarations (`.d.mts`) per submodule, `sideEffects: false`.
- **TypeScript configuration:** strict, per-file source (each function typically its own `.ts` file under `src/<module>/methods/*.ts` or `src/<module>/helpers/*.ts`).
- **Exports:** `exports` map in `package.json` maps `.` and `./*` to `dist/*/index.d.mts` + `dist/*/index.mjs` — genuine subpath exports, not a single flattened bundle.
- **Side effects:** none declared (`sideEffects: false`); confirmed no top-level `document`/`window` access outside function bodies (guards exist, e.g. `isClient()`/`isServer()` helpers used internally elsewhere).
- **Browser/runtime assumptions:** `dom` module functions assume `Element`/`document` exist when _called_, but do not touch them at module load time — safe to import under Node/SSR, unsafe only if a DOM function is _invoked_ server-side (expected, standard behavior).
- **SSR implications:** none at import time. Framework packages calling `dom` functions server-side is a framework-package concern (Phase 2+), not a `uix-utils` concern.
- **Test strategy (upstream):** not shipped in the tarball (no test files in `dist`); Ultimate must author its own.
- **Generated artifacts:** `dist/**/*.mjs`, `dist/**/*.d.mts`, `.mjs.map` (with embedded `sourcesContent` — the extraction source for Phase 1).
- **Source provenance:** MIT, tarball shasum `0ded7f74bddf191f0e16aea34b593a7fcffa94b5` (Phase 0 `PROVENANCE.md`, no public commit SHA — confirmed gap).
- **Classification: RETAIN** all 7 modules verbatim-adapted. No reason to rewrite proven, small, framework-neutral utilities (Blueprint §2.8 minimal reinvention); all 7 are plausible near-term consumers for Phase 2+ framework packages.

### `@primeuix/styled@0.7.4`

- **Responsibility:** theme/preset resolution engine — turns a design-token preset object into CSS custom properties and resolves `dt()`/`t()` token references at render/build time.
- **Public API:** single flat entry point (`dist/index.mjs`, no submodule exports) exporting `definePreset`, `updatePreset`, `usePreset`, `useTheme`, `updatePrimaryPalette`, `updateSurfacePalette`, palette helpers (`mix`, `shade`, `tint`), `dt()`, `t()`, `toVariables()`, a stylesheet registration service (`service/index.ts`).
- **Internal API:** `utils/sharedUtils.ts`, `utils/themeUtils.ts`, `helpers/css.ts` — internal helpers not re-exported from the barrel.
- **Dependencies:** `@primeuix/utils` only (confirmed: `deepMerge` import in `definePreset.ts`).
- **Framework coupling:** none.
- **Build process:** tsup, single-entry ESM output.
- **TypeScript configuration:** strict, 18 source files under `src/{actions,service,utils,helpers,config,stylesheet}/`.
- **Exports:** single `.` export only (`dist/index.d.mts` / `dist/index.mjs`).
- **Side effects:** the `stylesheet/index.ts` module manages a runtime stylesheet registry (DOM `<style>` tag insertion/removal) — this is an intentional runtime side effect (style injection), not a module-load-time side effect. `sideEffects: false` remains accurate for tree-shaking purposes (the side effect only fires when its functions are called).
- **Browser/runtime assumptions:** stylesheet injection assumes a `document`; token resolution (`dt()`/`t()`) is pure string manipulation, no DOM dependency.
- **SSR implications:** token resolution is SSR-safe; stylesheet injection is a runtime/client concern, same pattern as any CSS-in-JS style-injection API — framework packages will need to guard actual injection calls, not `uix-styled` itself.
- **Test strategy:** author new (Vitest) — token resolution determinism, preset merge correctness.
- **Source provenance:** MIT, tarball shasum `d2108a7fad297dea60d549b2c10ed744dc0cbc0e`.
- **Classification: RETAIN**, entire package. This is genuine styling _infrastructure_ — the mechanism by which a theme's tokens become usable CSS — distinct from any specific theme's token values (which remain out of scope, Phase 5) and distinct from any component's styles (which remain out of scope, Phase 2+).

### `@primeuix/styles@2.0.3`

- **Responsibility:** CSS generation — a `base` module (global framework-level CSS) plus ~90 per-component style modules (`accordion/`, `button/`, `datatable/`, `dialog/`, etc.), each a CSS-in-JS template string referencing `dt('token.path')` placeholders resolved later by `uix-styled`.
- **Public API:** subpath exports per module (`exports["./*"]` mirrors `uix-utils`'s pattern) plus a `base` barrel and a top-level `index.mjs`.
- **Investigated `base` module in detail** (the only module in Phase 1 scope — see Package Scope): global box-sizing reset, `.p-collapsible-*` expand/collapse animation keyframes, `.p-disabled` (opacity via `dt('disabled.opacity')`), `.pi`/`.p-icon` sizing (`dt('icon.size')`), `.p-overlay-mask` (position/background via `dt('mask.*')` tokens). **Confirmed: no per-component selectors present in `base`** — it is genuinely global/framework-level CSS, not accidentally-included component styling.
- **Dependencies:** none at the module level — pure CSS template strings, `dt()`/`t()` placeholders are resolved by the consumer (`uix-styled`) at render time, not imported here.
- **Framework coupling:** none.
- **Build process:** tsup, same subpath-export shape as `uix-utils`.
- **Side effects:** none — plain exported string constants.
- **SSR implications:** none — static strings, no DOM/browser API touched.
- **Classification (per module):**
  - `base` — **RETAIN**, Phase 1 scope.
  - All ~90 per-component modules (`accordion`, `autocomplete`, `avatar`, `badge`, … `virtualscroller`) — **LATER PHASE**. Each migrates alongside its owning component in Phase 2 (Angular), 3 (React), or 4 (Vue), not speculatively now. Rationale: these are component styles, and Phase 1's explicit non-goal is "do not migrate framework components" — importing 90 style modules with zero consumers inflates Phase 1 scope and risks provenance/adaptation drift before the actual component exists to validate against.
  - `types.mjs`/`types.d.mts` (shared TS types for style modules) — **RETAIN**, Phase 1, since `base` needs the shared type shape and later-phase component style migration will too.

### `@primeuix/motion@0.0.10`

- **Responsibility:** enter/leave transition/animation orchestration for overlay-style UI (dialogs, dropdowns, tooltips) — CSS class-based (`p-*-enter-active` etc.), not a JS animation engine.
- **Public API:** single entry point, `createMotion(element, options): MotionInstance`.
- **Internal API:** `config/index.ts` (defaults, the `createMotion` factory), `utils/index.ts` (`shouldSkipMotion`, `mergeOptions`, `resolveClassNames`, `resolveDuration`, etc.) — both re-exported from the barrel, so effectively all public.
- **Dependencies:** `@primeuix/utils` only (`addClass`/`removeClass` from `dom`; `getHiddenElementDimensions`, `isPrefersReducedMotion`, `setCSSProperty`, `toMs` — confirmed via sourcemap).
- **Framework coupling:** none.
- **Reduced-motion handling:** `shouldSkipMotion()` returns `true` when `options.disabled` or (`options.safe && isPrefersReducedMotion()`) — and `DEFAULT_MOTION_OPTIONS.safe` is `true` by default. **Motion respects `prefers-reduced-motion` out of the box**, satisfying the accessibility requirement without Ultimate-side changes.
- **CSS vs JS responsibilities:** JS orchestrates class toggling and phase timing (enter/leave/appear); actual animation/transition definitions live in CSS (component style modules — out of Phase 1 scope, consistent with `uix-styles` classification above).
- **SSR:** `createMotion` requires a real `Element` argument (throws if absent) — inherently a client-side/runtime API, not called at module load time, so importing the package is SSR-safe; _using_ it server-side is a framework-package concern.
- **API stability:** small surface (one factory function + options), low churn risk.
- **Source provenance:** MIT, tarball shasum `9af4238226042d80518dd343c6481d03582e374a`.
- **Classification: RETAIN**, entire package.

---

## Package Scope

Four packages, matching the Blueprint's provisional structure and Phase 0's `PROVENANCE.md` destinations exactly:

```text
packages/
├── uix-utils/     @ultimate/uix-utils
├── uix-styled/    @ultimate/uix-styled
├── uix-styles/    @ultimate/uix-styles
└── uix-motion/    @ultimate/uix-motion
```

**`packages/uix/` (the existing umbrella stub) is left untouched in Phase 1** — no package.json, no re-exports. It currently contains only `.gitkeep`/`.DS_Store`. Revisit only if a later phase demonstrates a real need for a single umbrella import; not manufactured now. **No `uix-core` package** — none of the four packages need a fifth shared dependency; `uix-styled` and `uix-motion` already depend cleanly on `uix-utils` directly.

**Package names are committed now** (`@ultimate/uix-utils` etc.), not left provisional, since they map 1:1 to existing directory names with negligible collision risk under the `@ultimate` npm scope. Real npm-availability/reservation is a pre-publish task, not a Phase 1 blocker (Phase 1 does not publish).

### `@ultimate/uix-utils`

|                      |                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Purpose              | Framework-neutral utility functions (classnames, DOM helpers, event bus, prop merging, object helpers, UUID, z-index management) |
| Public API           | `classnames`, `dom`, `eventbus`, `mergeprops`, `object`, `uuid`, `zindex` submodules + barrel                                    |
| Internal API         | none                                                                                                                             |
| Dependencies         | none                                                                                                                             |
| Peer dependencies    | none                                                                                                                             |
| Build output         | ESM (`dist/**/*.mjs`), `.d.mts` declarations, source maps, per-submodule                                                         |
| Exports              | `.` and `./*` subpath map (mirrors upstream shape)                                                                               |
| Side effects         | `sideEffects: false`                                                                                                             |
| Tests                | Vitest, per-module unit tests; `dom` module tests run under jsdom                                                                |
| Consumers (Phase 2+) | `uix-styled`, `uix-motion`, all framework-core packages                                                                          |
| Ownership            | Ultimate — MIT-derived, RETAIN classification, file-level provenance tracked                                                     |

### `@ultimate/uix-styled`

|                      |                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose              | Theme/preset resolution engine — token resolution (`dt`/`t`), preset merging, stylesheet registration                                                                  |
| Public API           | `definePreset`, `updatePreset`, `usePreset`, `useTheme`, `updatePrimaryPalette`, `updateSurfacePalette`, palette helpers, `dt`, `t`, `toVariables`, stylesheet service |
| Internal API         | `sharedUtils`, `themeUtils`, `helpers/css` (not re-exported)                                                                                                           |
| Dependencies         | `@ultimate/uix-utils`                                                                                                                                                  |
| Peer dependencies    | none                                                                                                                                                                   |
| Build output         | ESM, single entry, `.d.mts`, source maps                                                                                                                               |
| Exports              | `.` only                                                                                                                                                               |
| Side effects         | `sideEffects: false` for tree-shaking; runtime stylesheet injection is a called-function effect, not a module-load effect                                              |
| Tests                | Vitest — token resolution determinism, preset merge correctness, stylesheet registration lifecycle                                                                     |
| Consumers (Phase 2+) | Framework-core packages (theme consumption), later theme packages (Phase 5)                                                                                            |
| Ownership            | Ultimate — MIT-derived, RETAIN classification, file-level provenance tracked                                                                                           |

### `@ultimate/uix-styles`

|                      |                                                                                                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose              | Global/base CSS infrastructure shared across all future components                                                                                                                                                                                             |
| Public API (Phase 1) | `base` module only, plus shared `types`                                                                                                                                                                                                                        |
| Internal API         | none                                                                                                                                                                                                                                                           |
| Dependencies         | none                                                                                                                                                                                                                                                           |
| Peer dependencies    | none                                                                                                                                                                                                                                                           |
| Build output         | ESM, subpath exports (`./base`), `.d.mts`, source maps                                                                                                                                                                                                         |
| Exports              | `.` (barrel, re-exports `base` only in Phase 1) and `./base`                                                                                                                                                                                                   |
| Side effects         | none — static string exports                                                                                                                                                                                                                                   |
| Tests                | Vitest — snapshot test on generated `base` CSS output; a **scope guard test** asserting no `.p-{componentname}`-style selector patterns appear outside the whitelisted base selectors (`.p-disabled`, `.p-icon`, `.p-overlay-mask`, `.p-collapsible-*`, `.pi`) |
| Consumers (Phase 2+) | Framework-core packages (global reset/base styles), later theme packages                                                                                                                                                                                       |
| Ownership            | Ultimate — MIT-derived, RETAIN (base only) classification, file-level provenance tracked                                                                                                                                                                       |
| Deferred             | ~90 per-component style modules — classified LATER PHASE, migrated alongside each component (Phase 2/3/4)                                                                                                                                                      |

### `@ultimate/uix-motion`

|                      |                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Purpose              | Class-based enter/leave transition orchestration respecting `prefers-reduced-motion`                                           |
| Public API           | `createMotion(element, options): MotionInstance`, `DEFAULT_MOTION_OPTIONS`                                                     |
| Internal API         | `shouldSkipMotion`, `mergeOptions`, `resolveClassNames`, `resolveDuration` (re-exported, effectively public)                   |
| Dependencies         | `@ultimate/uix-utils`                                                                                                          |
| Peer dependencies    | none                                                                                                                           |
| Build output         | ESM, single entry, `.d.mts`, source maps                                                                                       |
| Exports              | `.` only                                                                                                                       |
| Side effects         | `sideEffects: false`; DOM class mutation is a called-function effect                                                           |
| Tests                | Vitest — `shouldSkipMotion` behavior (incl. `prefers-reduced-motion` simulation), hook/phase lifecycle correctness under jsdom |
| Consumers (Phase 2+) | Framework-core packages implementing overlay/transition components                                                             |
| Ownership            | Ultimate — MIT-derived, RETAIN classification, file-level provenance tracked                                                   |

---

## Ownership Boundaries

- **Belongs in UIX:** framework-neutral utilities, theme/token resolution infrastructure, global/base CSS, motion orchestration — all four packages above.
- **Belongs in framework core (Phase 2+):** component lifecycle integration, framework-native event binding, calling into `uix-motion`/`uix-styled`/`uix-utils` from Angular/React/Vue-specific code.
- **Belongs in framework components (Phase 2+):** actual rendered components, their own per-component style modules (the ~90 deferred `uix-styles` modules migrate here, alongside the owning component, not into UIX).
- **Belongs in themes (Phase 5):** actual token _values_ (a specific palette, a specific corporate design language). UIX provides the resolution _mechanism_ (`uix-styled`), never a concrete theme.
- **Belongs in developer tooling (Phase 7+):** none of this phase's work — `packages/{cli,mcp,ai}` remain untouched scaffolding.
- **Must remain external:** Angular/React/Vue themselves, current `@primeuix/*`/`primeng`/`primevue`/`primereact` packages.

---

## Dependency Rules

Runtime dependency direction (unchanged from Blueprint §6, Phase 0 `PACKAGE_ARCHITECTURE.md`):

```text
Framework Components (Phase 2+)
        ↓
Framework Core (Phase 2+)
        ↓
UltimateUIX (this phase)
```

Within UIX: `uix-styled` → `uix-utils`; `uix-motion` → `uix-utils`; `uix-styles` → (none). No package imports another UIX package's internal (non-exported) modules.

**Prime dependency leakage detection** (extends existing Phase 0 mechanism, no new script needed for the boundary/ceiling checks themselves — they already scan `packages/uix*`/`packages/{ng,react,vue}*`; Phase 1 just makes them non-trivial for the first time):

- `package.json` checks: `validate-dependency-ceiling.mjs` already scans `packages/{ng,react,vue}*/package.json` for forbidden deps and `@primeuix/*` ceiling violations. **Gap identified:** it does not scan `packages/uix*/package.json`. Phase 1 must extend `WATCHED_PREFIXES` in that script to include `uix` (an incorrect Phase 1 `uix-utils/package.json` declaring a stray `@primeuix/utils` runtime dependency would otherwise go undetected).
- Source import checks: `validate-boundaries.mjs` already scans `packages/uix*` for framework imports — sufficient as-is, no change needed.
- Lockfile checks: `pnpm-lock.yaml` must show zero `@primeuix/*`/`primeng`/`primevue`/`primereact` entries under any `packages/uix*` workspace after Phase 1 — verified manually at PR review time; no new automated check proposed (lockfile parsing for this is lower value than the two checks above, which already catch the declaration-level source of truth).
- Build output checks: none proposed — `sideEffects: false` + subpath exports already make tree-shaking verifiable via existing build tooling; no new script needed.

---

## Build Requirements

- **Tool:** `tsup`, matching PrimeUIX's own proven upstream build (Blueprint §2.8 minimal reinvention; avoids inventing a new build pipeline for a shape already validated).
- **Orchestration:** `pnpm -r --if-present run build` (existing root script, unchanged — ADR-015 plain-pnpm stands; no cross-package build-order problem exists yet since `uix-styled`/`uix-motion` depend only on `uix-utils`, and pnpm workspace linking handles that without Turborepo/Nx).
- **TypeScript:** extends `tsconfig.base.json` (already `ES2022`/`ESNext`/`Bundler` resolution/`strict`/`declaration`+`declarationMap`+`sourceMap` — already correct for this shape, no changes needed at the root).
- **Output per package:** ESM only (`.mjs`), `.d.mts` declarations, `.mjs.map` source maps, matching upstream subpath-export shape where the source package had one (`uix-utils`, `uix-styles`), single-entry where it had one (`uix-styled`, `uix-motion`).
- **Declaration generation:** via `tsup`'s built-in `dts` option (backed by the TS compiler), not a separate `tsc --emitDeclarationOnly` pass — one build step per package.

---

## Runtime Requirements

- **Module format:** ESM only — no CJS output. Matches upstream, matches `tsconfig.base.json`'s `module: ESNext`.
- **Tree-shaking:** `sideEffects: false` in every package's `package.json`; subpath exports preserved (`uix-utils`, `uix-styles`) so consumers can import a single submodule without pulling in the rest.
- **Browser compatibility:** target `ES2022` (matches `tsconfig.base.json`); no additional transpilation/polyfill requirement identified — all four packages already assume this target upstream.
- **SSR compatibility:** confirmed safe at _import_ time for all four packages (no top-level `document`/`window` access). Runtime calls into DOM-touching functions (`uix-utils/dom`, `uix-styled`'s stylesheet injection, `uix-motion`'s `createMotion`) are a framework-package SSR-guarding responsibility, not a UIX-package one — UIX does not attempt to solve framework-specific SSR/hydration itself (task non-goal §19).
- **Package exports validation:** a Vitest suite per package asserts every declared export subpath resolves and imports without throwing, catching `package.json`/`tsup` config drift.
- **Source maps:** shipped in every package's `dist/`, `.mjs.map` alongside `.mjs`.

---

## Styling Requirements

- **Style resolution** (`uix-styled`): retained as-is — `dt()`/`t()` token resolution, preset merge, stylesheet registration service.
- **Component style configuration:** out of Phase 1 scope — belongs to the per-component style modules deferred to Phase 2+.
- **Token consumption:** `uix-styled` resolves tokens; it does not define what tokens exist or their values (that's a theme, Phase 5).
- **Theme integration:** `uix-styled` exposes the mechanism (`usePreset`/`useTheme`); no concrete theme is built in Phase 1.
- **Style registration / CSS generation:** `uix-styled`'s stylesheet service, retained as-is.
- **SSR / CSP considerations:** stylesheet injection uses `<style>` tag insertion — no `eval`/inline `on*` attribute usage found in the investigated source; no CSP-unsafe pattern identified. Framework packages doing actual SSR style extraction is out of scope here (non-goal §19).
- **Style ordering / isolation:** unchanged from upstream mechanism — `uix-styled`'s service already handles registration ordering; no Ultimate-specific change proposed without a demonstrated need.
- **Boundary:** styling _infrastructure_ (`uix-styled` + `uix-styles/base`) is fully separated from theme _definitions_ (Phase 5, not built) and component _implementation_ (Phase 2+, not built) — confirmed by the package scope above.

---

## Motion Requirements

- **Runtime size:** single-entry, small surface (`createMotion` + options) — no bundling concern identified.
- **Browser behavior:** class-based enter/leave, timing via `resolveDuration`/`toMs` — unchanged from upstream.
- **Reduced-motion:** already respected by default (`safe: true`, `shouldSkipMotion()` checks `isPrefersReducedMotion()`) — no Ultimate-side change required, tested explicitly (see Testing Requirements).
- **Framework independence:** confirmed — depends only on `uix-utils`, no framework import.
- **CSS vs JS split:** JS orchestrates class/phase timing; CSS (actual `@keyframes`/transition definitions) lives in per-component style modules — deferred to Phase 2+ alongside the owning component, consistent with `uix-styles`'s scope split.
- **Accessibility:** covered by reduced-motion handling above; no additional Phase 1 requirement identified.
- **SSR:** `createMotion` throws without a real `Element` — inherently client-invoked; import-time SSR-safe (confirmed, no top-level DOM access).
- **API stability:** small, stable surface — no instability flag needed for this package's public API.

---

## Testing Requirements

All four packages use **Vitest** (chosen for native ESM/TS support with no extra transform config, consistent with the repo's `ESNext`/`Bundler`-resolution TypeScript setup and `tsup`'s own ESM-first output).

- **Unit:** every retained function/module gets at least one correctness test. `uix-utils/dom` and `uix-motion` tests run under `vitest`'s `jsdom` environment where DOM presence is required; pure-function tests (`classnames`, `object`, `uuid`, `zindex`, `eventbus`, `mergeprops`, `uix-styled` token resolution) run under Node.
- **Styling:** `uix-styles` base CSS output is snapshot-tested for determinism; a scope-guard test asserts no per-component selector pattern leaks into the `base` module (fails the build if Phase 1 scope is accidentally violated later).
- **Motion:** `shouldSkipMotion()` tested against both `options.disabled` and simulated `prefers-reduced-motion` media-query states; phase/hook lifecycle (`enter`/`leave`/`appear`) tested under jsdom.
- **Package:** each package's declared `exports` subpaths are import-tested (catches export-map/build misconfiguration before it reaches a framework-package consumer).
- **Dependency Boundary:** existing `boundary:validate` script, unchanged, now exercised non-trivially for the first time.
- **Prime Dependency Boundary:** existing `ceiling:validate` script, **extended** to also watch `packages/uix*/package.json` (gap identified above).
- **Build:** `pnpm install --frozen-lockfile && pnpm run build` from a clean checkout must succeed for all four packages (verified in CI, existing `ci.yml` steps already run install/build/test/lint/typecheck/provenance/boundary/ceiling — Phase 1 needs no new CI job, only for these steps to stop trivially passing).
- **Determinism:** no test may depend on wall-clock time, network access, or non-seeded randomness (`uuid` module tests assert format/uniqueness properties, not specific generated values).

---

## Provenance Requirements

- **Extraction mechanism:** new `scripts/provenance/extract-source.mjs`. Reads each `.vendor-cache/@primeuix__*.tar.gz` (already checksummed by Phase 0's `vendor-snapshot.mjs`), locates every `.mjs.map` file inside, parses each sourcemap's `sources`/`sourcesContent` arrays, and writes the recovered original-path TypeScript files into a staging tree (`.vendor-extracted/<package>/`, gitignored, fully regeneratable from the same pinned, checksummed tarballs — no network access required at extraction time). Idempotent and re-runnable, consistent with Phase 0's existing "import script + checksum manifest" reproducibility model.
- **Adaptation:** Ultimate engineers copy/adapt from the staged extraction tree into each `packages/uix-*/src/` — this is where RETAIN-classified files get their import paths rewritten (`@primeuix/utils` → `@ultimate/uix-utils` internal imports) and a provenance header comment added; no other modification unless a specific bug/incompatibility is being fixed (see Upstream Patch Strategy below).
- **Attribution preservation:** each `packages/uix-*/THIRD-PARTY-NOTICES.md` (already exists as a stub) is populated with the verbatim MIT license text extracted from the tarball's `LICENSE` file plus the PrimeTek copyright line, per Phase 0's `PROVENANCE.md` copyright-holder field.
- **`docs/architecture/PROVENANCE.md` updates:** the four existing package-level entries (added in Phase 0) get their `Modification status` and `Date incorporated` fields updated from "not yet incorporated" to the real Phase 1 state. Entry format/granularity stays package-level, matching Phase 0's established template — no new heading structure.
- **File-level manifest (new):** `docs/architecture/provenance/<package>.json` — one JSON file per UIX package, one array entry per incorporated source file: `{ originalPath, ultimateDestination, modificationStatus: "unmodified"|"import-path-adapted"|"modified", modificationDescription, sha256OfOriginal }`. Machine-readable, CI-checkable.
- **`validate-provenance.mjs` extension:** add a check that every `.ts` file under each `packages/uix-*/src/` has a corresponding entry in that package's manifest JSON — catches an engineer adding source without recording its provenance. This is an additive check to the existing script, not a new script.
- **Future-maintainer traceability:** the manifest's `originalPath` field (e.g. `src/dom/methods/hasClass.ts`) plus the package-level `PROVENANCE.md` entry's tarball shasum together let a future maintainer reconstruct exactly which upstream file, at which pinned version, any given `packages/uix-*/src/` file came from — without needing a live upstream git history (which, per Phase 0 Finding 3, does not exist for these versions anyway).

---

## Security Requirements

- Preserve Phase 0's security posture: no dynamic evaluation (`eval`/`Function` constructor) found in any of the four investigated packages.
- Style injection (`uix-styled`'s stylesheet service) uses standard `<style>` tag DOM insertion, not `innerHTML`-based raw string injection into arbitrary elements — no XSS-shaped pattern identified; re-verify this specific claim during actual extraction/adaptation (Phase 1 implementation), since this spec's investigation read the compiled output, not 100% of every internal helper line-by-line.
- No URL handling, no dynamic `import()` of user-controlled strings found in any of the four packages.
- Dependency-vulnerability scanning: none of the four packages introduce new external dependencies beyond `@ultimate/uix-utils` (internal) — no new supply-chain surface added by this phase beyond what Phase 0 already accepted by pinning these exact tarballs.
- No security-sensitive new utility is being introduced without justification — all four packages are RETAIN-classified adaptations of already-shipped, already-in-production-use (via PrimeNG/PrimeVue) code, not new Ultimate-authored logic.

---

## Performance Requirements

- **Baseline, not optimization:** record measurable numbers for later comparison; do not tune anything preemptively (task non-goal-adjacent constraint, Blueprint §31 "do not optimize based on assumptions").
- Record, per package, after Phase 1 build: `dist/` total size (bytes), gzip size of the barrel entry, install size (`node_modules` footprint when installed standalone).
- Record tree-shaking effectiveness qualitatively: confirm (via a throwaway bundler test, e.g. esbuild with a single-submodule import) that importing only `uix-utils/classnames` does not pull in the `dom` module's ~90 files into the resulting bundle.
- No runtime/initialization-cost benchmark is meaningful yet — these packages have no framework consumer to measure against until Phase 2. Defer runtime-cost benchmarking to Phase 2 exit criteria.

---

## Documentation Requirements

- Each package gets a `README.md` documenting: purpose, public API (with TSDoc-derived signatures), what's Ultimate-owned vs. Prime-derived-and-adapted, and a link to its `PROVENANCE.md` entry + manifest JSON.
- Distinguish, per exported symbol: **Ultimate public API** (stable, intended for framework-package consumption), vs. **inherited Prime implementation detail temporarily retained for compatibility** — none identified in this investigation; all four packages' full exported surfaces are treated as intentional Ultimate public API from Phase 1, since no compatibility-shim scenario was found (these are being adapted wholesale, not partially).
- Mark the entire Phase 1 public API surface **unstable** (pre-1.0, no semver guarantee yet) — consistent with Blueprint §9's "identify APIs that should be treated as unstable during the initial development phase."
- No public documentation site is built in Phase 1 (non-goal); READMEs are sufficient for Phase 1 exit.

---

## AI/Metadata Constraints

- No AI system, CLI, MCP, or Skills work in Phase 1 (non-goal, unchanged from Blueprint/Phase 0).
- Package architecture must not _prevent_ future metadata generation: each package's TSDoc comments on exported symbols (added as part of Documentation Requirements above) are structured enough to later feed a metadata generator without rework — no dedicated metadata schema or generator is built now.
- No AI/tooling runtime dependency is added to any `packages/uix-*` package.json (already implied by the zero-new-runtime-dependency finding above).

---

## Deliverables

```text
Packages (source + config):
  packages/uix-utils/{src/,package.json,tsup.config.ts,README.md,THIRD-PARTY-NOTICES.md (populated)}
  packages/uix-styled/{src/,package.json,tsup.config.ts,README.md,THIRD-PARTY-NOTICES.md (populated)}
  packages/uix-styles/{src/,package.json,tsup.config.ts,README.md,THIRD-PARTY-NOTICES.md (populated)}
  packages/uix-motion/{src/,package.json,tsup.config.ts,README.md,THIRD-PARTY-NOTICES.md (populated)}

Tests: *.test.ts colocated per package, vitest.config.ts per package (or shared root config)

Provenance:
  scripts/provenance/extract-source.mjs (new)
  docs/architecture/provenance/uix-utils.json (new)
  docs/architecture/provenance/uix-styled.json (new)
  docs/architecture/provenance/uix-styles.json (new)
  docs/architecture/provenance/uix-motion.json (new)
  docs/architecture/PROVENANCE.md (4 existing entries updated: Modification status, Date incorporated)

Dependency policy updates:
  scripts/provenance/validate-dependency-ceiling.mjs (WATCHED_PREFIXES extended to include "uix")
  scripts/provenance/validate-provenance.mjs (extended: every packages/uix-*/src/**/*.ts must have a manifest entry)

Architecture decisions:
  docs/architecture/DECISIONS.md — new ADR-016 (sourcemap extraction as vendoring mechanism), ADR-017 (uix-styles base-only Phase 1 scope, ~90 component modules deferred)

Documentation: per-package README.md (see Documentation Requirements)

CI: .github/workflows/ci.yml unchanged (existing steps become non-trivial); no new job added

Performance baseline: recorded in docs/architecture/ (exact file TBD in implementation plan — e.g. PERFORMANCE.md or an appendix to an existing file), per Performance Requirements above

Migration classification: recorded in this spec's PrimeUIX Findings section (RETAIN/LATER-PHASE per module) — implementation plan does not need to re-derive it
```

---

## Acceptance Criteria

- [ ] All four `packages/uix-*` build independently via `pnpm -r run build` from a clean checkout.
- [ ] Every package's declared `exports` map resolves (package/export tests pass).
- [ ] `boundary:validate` passes non-trivially (real source scanned, zero framework imports found).
- [ ] `ceiling:validate` (extended to watch `packages/uix*`) passes non-trivially.
- [ ] `provenance:validate` (extended with manifest-completeness check) passes — every incorporated `.ts` file has a manifest entry, `PROVENANCE.md`'s 4 entries reflect Phase 1 incorporation.
- [ ] All Vitest suites pass (unit, styling snapshot + scope-guard, motion incl. reduced-motion, package/export).
- [ ] `uix-styles` contains only the `base` module + `types` — verified by the scope-guard test; zero per-component style modules present.
- [ ] `THIRD-PARTY-NOTICES.md` populated (no longer stub) in all four packages.
- [ ] Performance baseline numbers recorded (dist size, gzip size, tree-shaking spot-check) for all four packages.
- [ ] READMEs exist for all four packages, documenting public API and provenance linkage.
- [ ] Framework packages (Phase 2+) can theoretically depend on `@ultimate/uix-*` via workspace protocol with zero reverse dependency (no `packages/uix-*` imports anything from `packages/{ng,react,vue}*`).
- [ ] `docs/architecture/DECISIONS.md` has ADR-016 and ADR-017 recorded.

---

## Risks

| Risk                                                                                                                                                                | Impact                                                                                                                     | Likelihood                                                                      | Mitigation                                                                                                                                                                                                                | Decision point                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Sourcemap `sourcesContent` is present for the 4 packages investigated in this spec but a specific submodule/file is later found missing it during actual extraction | Medium — would block file-level provenance for that file, forcing a decompiled-source fallback                             | Low (spot-checked across all 4 packages, all submodules, in this investigation) | If found, decompile from `.mjs` instead and mark that file's manifest entry `modificationStatus: "reconstructed-from-compiled-output"`, flagged for extra review                                                          | Phase 1 implementation, `extract-source.mjs` first run                 |
| `ceiling:validate`'s `WATCHED_PREFIXES` gap (doesn't currently watch `packages/uix*`) ships unfixed                                                                 | High if unfixed — a stray `@primeuix/*` runtime dependency in a `uix-*` package.json would go undetected by CI             | Low once flagged (this spec flags it explicitly)                                | Implementation plan must include the one-line `WATCHED_PREFIXES` extension as an early task, verified by a negative test (intentionally-bad package.json should fail CI)                                                  | Phase 1 implementation, before first `uix-*` package.json is committed |
| `uix-styles`' base/component boundary is violated later (someone adds a component selector to `base` without noticing)                                              | Medium — quietly breaks the Phase 1 scope decision, extra component CSS ships before its owning component exists           | Low with the scope-guard test in place; higher without it                       | Scope-guard test (Testing Requirements) must ship in Phase 1, not deferred                                                                                                                                                | Phase 1 implementation                                                 |
| Upstream `primeuix` repo is archived (Phase 0 Finding 3) — zero future patches for any bug found in the 4 pinned packages                                           | Medium — Ultimate is sole maintainer from day one                                                                          | Confirmed (Phase 0)                                                             | Already a known, accepted constraint; Phase 1 changes nothing here, just inherits it                                                                                                                                      | Ongoing, not a Phase 1 blocker                                         |
| `uix-styled`'s stylesheet-injection side effect is miscategorized and a bundler drops it despite `sideEffects: false`                                               | Low-Medium — functions still work when called explicitly; risk is theoretical bundler over-aggressiveness, not a logic bug | Low                                                                             | Package/export tests (Testing Requirements) explicitly call every exported function including stylesheet registration, catching accidental dead-code elimination in CI                                                    | Phase 1 implementation, package test authoring                         |
| Performance baseline numbers become stale/misleading once Phase 2 adds real consumers                                                                               | Low — baseline is explicitly framed as "for later comparison," not a hard budget                                           | Expected/accepted                                                               | Re-baseline at Phase 2 exit, not a Phase 1 concern                                                                                                                                                                        | Phase 2 planning                                                       |
| File-level provenance manifest JSON schema (proposed inline in this spec) turns out insufficient once real extraction begins                                        | Low-Medium — could need a schema revision mid-implementation                                                               | Low-Medium (schema is new, not yet validated against real bulk data)            | Schema is intentionally simple (5 fields); implementation plan may refine field names/structure without needing a new spec, as long as the required facts (original path, destination, modification status) are preserved | Phase 1 implementation                                                 |

---

## Decisions vs Open Questions

### Already decided (Blueprint / Phase 0, unchanged)

Company-owned platform; monorepo; independent packages; framework-native implementations; no required Prime runtime dependency; MIT-only provenance; pnpm workspaces; plain-pnpm build orchestration (ADR-015); pinned MIT ceilings for all four `@primeuix/*` packages; `packages/uix*` directory names; PrimeUIX baseline versions and tarball checksums.

### Phase 1 decisions (made in this spec, approved by user)

- Sourcemap extraction (`sourcesContent` embedded in the pinned tarballs) is the official Phase 1 vendoring mechanism — not upstream git checkout (confirmed unavailable at these versions), not decompiled dist.
- `packages/uix/` stays an untouched stub in Phase 1; no umbrella re-export package, no `uix-core`.
- `uix-styles` Phase 1 scope is the `base` module (+ shared `types`) only; all ~90 per-component style modules are classified LATER PHASE, deferred to the component's own migration phase.
- Package names committed now: `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles`, `@ultimate/uix-motion`.
- Test runner: Vitest, for all four packages.
- `uix-utils` retains all 7 modules (classnames, dom, eventbus, mergeprops, object, uuid, zindex) as-is — no per-module trimming.
- Provenance stays package-level in `PROVENANCE.md` (matching Phase 0's format), with a new file-level JSON manifest per package for CI-checkable completeness.
- Build output shape: tsup, ESM, subpath exports where upstream had them (`uix-utils`, `uix-styles`), single-entry where upstream had that (`uix-styled`, `uix-motion`) — matching the proven upstream shape rather than flattening.
- `.p-*` CSS selectors in the retained `base` module are kept verbatim — no renaming in Phase 1 (explicit non-goal).

### Open questions (requiring resolution during implementation)

- Exact file/directory naming convention for the provenance manifest JSON (`docs/architecture/provenance/<package>.json` proposed here; implementation plan may adjust).
- Whether `vitest.config.ts` is shared at the workspace root or per-package — a tooling detail, not an architectural one.
- Exact location for the new performance-baseline record (new file vs. appended to an existing `docs/architecture/*.md`).

### Deferred decisions (explicitly postponed, per Blueprint/Phase 0)

Final corporate themes (Phase 5); ~90 per-component style modules (Phase 2/3/4, alongside each component); any umbrella `packages/uix` re-export package (revisit only if demonstrated); public selector prefix / `.p-*` → `.u-*` renaming (pre-1.0 decision, not Phase 1); CLI/MCP/AI/Skills (Phases 7-9); public npm publishing and npm-name-availability verification; Turborepo/Nx adoption (revisit only if plain-pnpm becomes insufficient, ADR-015 unchanged).

---

## Phase Exit Criteria

Phase 1 is exited and Phase 2 (UltimateNG) may begin when:

1. All Acceptance Criteria above are checked.
2. All four `@ultimate/uix-*` packages exist, build, and pass tests independently from a clean `pnpm install --frozen-lockfile`.
3. `docs/architecture/PROVENANCE.md`'s four package-level entries reflect real Phase 1 incorporation (no longer "not yet incorporated"), backed by the four new file-level manifest JSONs.
4. CI (`ci.yml`, unchanged pipeline) passes with all validators exercising real content for the first time (no longer trivially passing on empty scaffolding).
5. `docs/architecture/DECISIONS.md` records ADR-016 and ADR-017.
6. A fresh spot-check confirms no `@primeuix/*`/`primeng`/`primevue`/`primereact` entries exist in `pnpm-lock.yaml` under any `packages/uix-*` workspace.
7. Performance baseline numbers are recorded for all four packages.

---

## Non-Goals (restated for implementation-plan authors)

Do not, in Phase 1 implementation:

- Migrate Angular, React, or Vue components.
- Redesign component public APIs.
- Rename Prime selectors (`.p-*` stays verbatim in the retained `base` CSS module).
- Implement Ultimate CLI, MCP, Skills, or AI tooling.
- Create final corporate themes or concrete token values.
- Migrate any of the ~90 `uix-styles` per-component modules (deferred to each component's own phase).
- Introduce Turborepo/Nx without a demonstrated build-orchestration failure of plain `pnpm -r`.
- Publish any package to npm or create a public GitHub release.
- Maintain automatic Prime synchronization.
- Build a public documentation site (per-package READMEs are sufficient).
