# Phase 5 — Ultimate Themes

Status: **APPROVED** (spec, 2026-09-01, after a Research + Brainstorming Gate closing all five genuine architectural forks). Every decision below is backed by direct inspection of the pinned `@primeuix/styled@0.7.4`/`@primeuix/styles@2.0.3` engine already vendored in Phase 1, the three current framework-core packages (`ng-core`/`react-core`/`vue-core`), and the PrimeNG 21.1.9/PrimeReact 10.9.9/PrimeVue 4.5.5 tarballs — not documentation, memory, or assumption. Ready for the Implementation Plan gate.

## Context

Phase 0 (repository foundation, provenance), Phase 1 (`@ultimate/uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`), Phase 2 (`@ultimate/ng-core`/`ng`), Phase 3 (`@ultimate/react-core`/`react`), and Phase 4 (`@ultimate/vue-core`/`vue`) are complete and closed. All three framework proof-sets (Button, Checkbox, Dialog, Menu, Tooltip) exist and ship CSS containing unresolved `dt('button.primary.color')`-style token-function calls — written in Phase 2 against a token resolver that does not exist yet. Phase 5 builds that resolver's public-facing layer and ships real token values.

`packages/themes` exists today only as Phase 0 scaffolding (`.gitkeep`) — no Phase 5 implementation exists yet.

Unlike Phases 2-4, Phase 5 is not a framework-migration phase. It is a cross-framework theming/design-system phase: establishing a public theme contract and shipping baseline preset data that all three existing framework packages already expect to consume.

## Provenance discipline used throughout this document

Every architectural claim below is labeled as one of:

- **Verified source behavior** — read directly from the pinned `@primeuix/styled`/`@primeuix/styles`/`@primeuix/themes` tarballs or the PrimeNG/PrimeReact/PrimeVue tarballs.
- **Existing Ultimate/UIX capability** — already built in Phase 1-4, directly reusable or already wired.
- **UltimateThemes architectural decision** — a genuine Ultimate-owned design choice, made after reviewing the evidence, resolved via the Research Gate's five forks.
- **Intentional behavioral/API deviation** — a deliberate, documented departure from verified upstream behavior.
- **Future/deferred concern** — real, but explicitly out of Phase 5 scope (YAGNI).

---

## 1. Baseline (verified)

### 1.1 `@primeuix/styled@0.7.4` — the theme engine (already vendored, Phase 1)

- **Ultimate destination:** `packages/uix-styled` (unmodified except cross-package import-specifier adaptation — `docs/architecture/PROVENANCE.md` confirms "all other source retained verbatim").
- **Verified capabilities** (read from `dist/index.mjs` + its sourcemap, structurally matching `packages/uix-styled/src/{actions,service,utils,helpers,config,stylesheet}`):
  - `dt(tokenPath)` / `$dt(tokenPath)` — resolves a dot-path token string (e.g. `"button.background"`) to a CSS `var(--p-button-background, fallback)` reference at render time. `$dt` returns `{name, variable, value}` for static lookups.
  - `{curly.path}` expression interpolation inside token strings, resolved via `evaluateDtExpressions` against an `EXPR_REGEX`.
  - `definePreset(...presets)` / `usePreset(...presets)` — both `deepMerge` across N preset objects (later wins, arrays pushed not replaced, plain objects merged recursively).
  - CSS variable naming: `getVariableName(prefix, variable) = "--" + toNormalizeVariable(prefix, variable)`, kebab-joined. Default prefix `'p'`. Confirmed shape: `--p-button-background`. Selector defaults to `:root,:host`.
  - Preset shape: `{ primitive, semantic: { colorScheme: { light, dark }, ...rest }, components: {...}, directives: {...}, extend?, css? }`.
  - Dark mode: one `darkModeSelector` option, dispatched via regex into 5 kinds — `class` (`.dark`), `attr` (`[data-theme='dark']`), `media` (raw `@media` string), `system` (`"@media (prefers-color-scheme: dark)"`, the default), `custom` (verbatim fallback), or `false`/`"none"` to disable.
  - `StyleSheet` base class: `add(key, css)` builds `{name, css, attrs, markup}` and calls `createStyleElement(spec)` — that method is an **empty stub at the engine layer**; actual DOM `<style>` creation is deferred to `@primeuix/utils` (already framework-neutral). Ultimate's `ng-core`/`react-core`/`vue-core` each subclass `StyleSheet` and override only `createStyleElement`.
  - `cssLayer` option (`boolean | {name, order}`) wraps generated CSS in `@layer` for cascade-priority control.
  - `ThemeService` — an `EventBus` singleton (`onStyleMounted`/`onStyleUpdated`/`onStyleLoaded`) preventing duplicate injection across component instances sharing one style block.

### 1.2 `@primeuix/styles@2.0.3` — per-component style/token data (already vendored, Phase 1)

- **Ultimate destination:** `packages/uix-styles` (`base` module incorporated Phase 1; per-component modules incorporated per-component during each framework's migration phase — Button/Checkbox/Dialog/Menu/Tooltip done across Phases 2-4).
- Pure data/style-function package — no runtime engine logic (that is `@primeuix/styled`'s job). Verified: `packages/uix-styles/src/button/index.ts`'s CSS body already contains unresolved `dt('button.primary.color')`, `dt('button.padding.y')`, `dt('button.border.radius')` calls — inert placeholders shipped since Phase 2, waiting on Phase 5's resolver being exercised.
- CSS naming convention (verified, already in place): BEM-flavored — `.u-<component>` root, `.u-<component>-<part>` for parts (e.g. `.u-button-icon-right`), state via plain pseudo-classes (`.u-button:disabled`). RTL already partially present **natively**, with zero JS/theme-layer involvement: `.u-button-icon-right:dir(rtl) { order: -1; }` uses the CSS `:dir()` pseudo-class directly.

### 1.3 `@primeuix/themes` — baseline preset data (NOT previously vendored — new Phase 5 pin)

- **Verified exclusion history:** `docs/architecture/DEPENDENCIES.md` line 37 — deliberately excluded from Phase 0's core baseline: *"theme layer is a separate Phase 5 concern"*. Not an oversight; a documented punt to this exact phase.
- **Verified version-compatibility finding (this gate):** latest npm `@primeuix/themes` is `3.0.0`, which depends on `@primeuix/styled: ^1.0.0` — incompatible with Ultimate's already-pinned `@primeuix/styled@0.7.4` engine (Phase 1 baseline, not to be silently re-pinned per Blueprint §7's Baseline Rule). `npm view @primeuix/themes@2.0.3 dependencies` confirms `{ "@primeuix/styled": "^0.7.4" }` — an exact match to Ultimate's existing pin.
- **Baseline to incorporate:** `@primeuix/themes@2.0.3`.
  - Tarball shasum: `c3919d49e818b3bbac611ab8d89a52d4ffed6815`
  - Tarball integrity: `sha512-3fS1883mtCWhgUgNf/feiaaDSOND4EBIOu9tZnzJlJ8QtYyL6eFLcA6V3ymCWqLVXQ1+lTVEZv1gl47FIdXReg==`
  - Source repository: `https://github.com/primefaces/primeuix` (`packages/themes` monorepo subdirectory)
  - Source commit SHA: none — same confirmed upstream provenance gap already documented for `@primeuix/styled`/`@primeuix/styles`/`@primeuix/motion` (`gitHead: null` on publish; upstream repo has no tag reaching this version). Pin by npm tarball integrity hash, consistent with the existing three entries in `docs/architecture/PROVENANCE.md`.
  - License: MIT, copyright PrimeTek — verify from the tarball's `LICENSE` file during Task 1 (not yet extracted as of this spec).
- **Task 1 of the implementation plan must**: download `@primeuix/themes@2.0.3` into `.vendor-cache/`, add its `PROVENANCE.md` entry (moving it out of the "Excluded" list at line 132 into a proper baseline section, matching the existing four `@primeuix/*` entries' format exactly), and record its `docs/architecture/checksums.json` entry.

### 1.4 Framework-core styling machinery (verified, Phases 2-4)

All three `*-core` packages share one pattern (verified by direct read):

| Package | File | Mechanism |
|---|---|---|
| `ng-core` | `basecomponent/base-component.ts`, `basecomponent/style-sheet.ts` | `UBaseComponent` directive; `cx(key, params)` resolves classes via `uix-utils`'s `cn()`; module-level `ngCoreStyleSheet = new StyleSheet()` registered in `ngOnInit` |
| `react-core` | `styling/use-component-style.ts`, `styling/react-style-sheet.ts` | `useComponentStyle` hook; `ReactStyleSheet extends StyleSheet<HTMLStyleElement>`, `createStyleElement` → `uix-utils`'s helper, SSR-guarded |
| `vue-core` | `base/base-component.ts`, `styling/vue-style-sheet.ts` | `createBaseComponent()` mixin; `VueStyleSheet extends StyleSheet<HTMLStyleElement>`, same override pattern, `data-u-style="{name}"` tag |

**Verified gap, all three**: none currently read or apply `dt()`, dark mode, RTL, or density. Angular's `BaseComponent` has a `dt` input prop declared but never read anywhere (dead code). This is the exact gap Phase 5 closes — not by changing any of the three files above structurally, but by making the resolver they already call into (`uix-styled`'s `StyleSheet`/`dt`) actually resolve to real values, which requires `packages/themes` to exist and be wired at the app-configuration layer.

### 1.5 Motion preference (verified, already has a home — not part of this phase's contract)

`packages/uix-motion/src/utils/index.ts`'s `isPrefersReducedMotion()` is already consumed internally by `uix-motion`'s own execution engine (an `options.safe` guard) — self-contained, component-behavior-scoped. **Confirmed and re-affirmed in this gate: motion preference stays exactly where it is.** It is not promoted into the theme contract (§6 below).

---

## 2. Package Architecture

**UltimateThemes architectural decision** (Research Gate fork #5, resolved: single package, YAGNI):

```text
packages/
└── themes/     @ultimate/themes
```

One package, not split into a separate contract-types package plus a data package. Blueprint's own package list names no separate "theme-contract" package, and Phase 5's own explicit constraint list says "avoid unnecessary new packages." `uix-styled` and `uix-styles` are **not renamed, split, or relocated** — they keep their existing Phase 1 roles and package names.

```text
packages/themes/
├── src/
│   ├── contract/            public theme-contract TypeScript types (primitive/semantic/component/mode/direction)
│   ├── presets/
│   │   └── aura/             Ultimate's baseline preset (ported from @primeuix/themes@2.0.3's Aura, Option B — reference, not verbatim)
│   │       ├── base/
│   │       ├── button/
│   │       ├── checkbox/
│   │       ├── dialog/
│   │       ├── menu/
│   │       └── tooltip/
│   └── index.ts
├── test/
├── package.json
├── tsup.config.ts
├── vitest.config.ts
└── README.md
```

Preset scope matches the existing five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) — the same components `uix-styles` already has CSS for. No expansion to PrimeVue's full ~150-component catalog; that mirrors the same proof-set discipline Phases 2-4 already applied.

### `@ultimate/themes`

- Depends on: `@ultimate/uix-styled` (workspace) for the `dt`/`definePreset`/`StyleSheet` runtime it re-exercises; no dependency on any `*-core`/framework component package (matches Blueprint §6's one-directional `Theme/Preset → theme contract → framework implementations` arrow — themes never depend on frameworks).
- Ships: the public theme contract types, `definePreset`-based Ultimate preset data (`ultimateAura` or equivalent baseline name — final preset name is an implementation-plan-level naming decision, not architecturally load-bearing), and a thin `applyUltimateTheme(options)` entry point that wires `usePreset`/`useTheme` from `uix-styled` with Ultimate's rebranded config (§3).
- No framework-specific code. No Angular/React/Vue imports anywhere in this package.

---

## 3. Engine Rebrand (Research Gate fork #2, resolved: full rebrand)

`uix-styled` is modified in this phase — the **first** modification beyond import-path adaptation since Phase 1:

- **CSS variable prefix**: `'p'` → `'u'`. Every CSS variable Ultimate ships changes shape from `--p-button-background` to `--u-button-background`. This is a source-level change to `uix-styled`'s config default, not a per-call-site override — matches the `.p-button` → `.u-button` full-namespace precedent already set at the component layer in Phases 2-4.
- **Ultimate-facing exported identifiers**: any type/function name in `uix-styled`'s public barrel (`src/index.ts`) that carries PrimeUIX-specific naming (e.g. anything literally named with a `Prime`/`p`-prefixed identifier in its exported surface) is renamed to Ultimate naming. Internal, non-exported helper names may keep their original PrimeUIX-derived names where purely private — this is not a full internal-file rewrite, only the public contract surface.
- **Not touched**: `uix-styled`'s file structure, module boundaries, or algorithmic behavior (deepMerge semantics, dark-mode-selector regex dispatch, `StyleSheet` bookkeeping) — those are reused exactly as vendored. This is a rebrand, not a re-architecture.
- **Provenance**: `docs/architecture/provenance/uix-styled.json`'s per-file `modificationStatus`/`modificationDescription` entries are updated for every touched file, following the existing schema — this is now a second, distinct modification pass beyond Phase 1's import-adaptation pass, and must be recorded as such (not silently merged into the Phase 1 entry).

---

## 4. Public Theme Contract (Research Gate forks #3 and #4, resolved)

**UltimateThemes architectural decision**: the public contract (`packages/themes/src/contract/`) covers exactly:

| Category | Public? | Rationale |
|---|---|---|
| Primitive tokens | Yes | Raw scale values (color ramps, spacing) — needed publicly so consumers can build custom presets referencing the same primitives. |
| Semantic tokens | Yes | Meaning-bearing, light/dark-aware tokens referencing primitives. This is the core of "establish theme contract." |
| Component tokens | Yes | Per-component token objects (e.g. `button.background`) — needed publicly since shipped component CSS already emits `dt()` calls referencing these exact paths. |
| Mode (light/dark) | Yes | Explicit Phase 5 objective — the `darkModeSelector` config surface (§1.1) is exposed as a documented, configurable public option. |
| Direction (RTL/LTR) | Yes | Explicit Phase 5 objective. Native CSS `:dir()` already handles the component-CSS side (§1.2); the contract's job is only to confirm/document this is dir-attribute-driven, not to build new JS direction-switching logic — none is needed. |
| States, variants | Not a separate category | Expressed *through* component tokens and CSS pseudo-classes (e.g. `button.primary.color`, `.u-button:disabled`) — already the shipped pattern. No separate top-level "state" or "variant" contract object. |
| Density | **Out of scope** | Research Gate fork #3, resolved: zero evidence anywhere in the repo (no density handling in any `*-core` package, `uix-styles`, or `uix-motion`) and zero confirmed reference need. Blueprint says theme contract "may define" density, not "must." YAGNI — add later only if a real consumer needs it. Not even a stub reserved. |
| Motion preferences | **Out of scope, stays where it is** | Already has a working home in `uix-motion` (§1.5), component-behavior-scoped. Not promoted into the theme contract — doing so would duplicate an already-solved concern. |

---

## 5. Preset Application Timing (Research Gate fork #4, resolved: runtime only)

**UltimateThemes architectural decision**: runtime resolution only, exactly as vendored — no build-time static CSS generation.

- Component CSS (`uix-styles`) ships with `dt()` calls already in place (§1.2) — unchanged by this phase.
- `packages/themes`'s job is to supply real preset *values* that `dt()` resolves against at `StyleSheet.add()` time, via the CSS-custom-property mechanism already built into `uix-styled` (§1.1).
- No new build step. Preset switching, dark/light, and RTL/LTR all recalculate live via CSS custom properties — zero additional engine work beyond wiring what already exists end-to-end for the first time.
- **Rejected alternative** (build-time static CSS generation): no evidence anywhere in the Blueprint, prior ADRs, or repository of a CSP/no-inline-style requirement that would justify the added infrastructure (Gate 11 concern, unconfirmed) — rejected per YAGNI, revisit only if a real CSP constraint surfaces later.

---

## 6. Cross-Framework Integration Boundary

Confirmed dependency direction (verified — matches Blueprint §6's stated arrow exactly, not merely assumed):

```text
                 @ultimate/themes
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
   @ultimate/ng-core  react-core  vue-core
   (StyleSheet         (StyleSheet  (StyleSheet
    subclass,           subclass,    subclass,
    already built)      already      already
                         built)       built)
```

- `packages/themes` has zero dependency on `ng-core`/`react-core`/`vue-core`/`ng`/`react`/`vue` — enforced by the existing `validate-dependency-ceiling.mjs` check, which must be extended in Task 1 of the implementation plan to include `"themes"` in `WATCHED_PREFIXES` (matching the same extension pattern used for `"vue"` in Phase 4).
- No framework-to-framework leakage introduced: Angular/React/Vue each already independently subclass `uix-styled`'s `StyleSheet` (§1.4) — Phase 5 does not touch those three subclass files. It only makes the resolver they already call into produce real values, by shipping `packages/themes`'s preset data and wiring it at the application-configuration layer (a consuming app calls `applyUltimateTheme(...)` once, framework-agnostically, before mounting any Ultimate component — the exact mechanics of that one call site are an implementation-plan-level detail, not an architectural fork).

---

## 7. Security (Gate 11 — evidence-backed only)

- **Token injection risk**: `dt()`'s resolution path is a fixed, developer-authored dot-path string → CSS variable reference; it does not interpolate arbitrary/user-controlled runtime strings into CSS at any point verified in `uix-styled`'s source (§1.1). No new risk introduced by shipping real preset values — same trust boundary as the already-shipped `uix-styles` CSS.
- **Preset-value provenance**: `@primeuix/themes@2.0.3`'s pin (§1.3) is verified MIT, matches the existing three `@primeuix/*` provenance entries' trust level exactly — no elevated risk from this specific dependency addition.
- **No CSP/nonce handling added**: consistent with §5's runtime-only decision — deferred, no evidence any consuming app currently requires it.
- **Out of scope for this spec**: a full independent security-review pass belongs to the implementation plan's own review gate (matching Phase 2-4 precedent), not re-litigated here without new evidence.

---

## 8. Non-Goals (this phase)

- Density (§4) — no evidence of need, not even a reserved stub.
- Promoting motion preference into the theme contract (§4) — stays in `uix-motion`.
- Build-time static CSS generation (§5) — runtime-only.
- A separate `theme-contract` package split from `packages/themes` (§2) — one package.
- Expanding preset coverage beyond the existing five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) — matches Phases 2-4's proof-set discipline.
- Full PrimeUIX `@primeuix/themes` catalog port (all preset families — Aura, Lara, Nora, Material) — only one Ultimate baseline preset is required to meet "port/create baseline presets"; additional presets are future/candidate work, not committed here.
- A corporate/branded design system built on top of the contract (Blueprint §16 — explicitly future work, "can later be implemented as an Ultimate preset").
- axe-core or equivalent automated accessibility scanning (matches the same non-goal already recorded for Phases 2-4).
- A populated consumer/playground app exercising live theme switching — candidate future work, not committed here.

---

## 9. Decision Record

| Decision | Resolution | Verified against |
|---|---|---|
| Baseline preset source | Pin `@primeuix/themes@2.0.3` (not latest `3.0.0`) | `npm view @primeuix/themes@2.0.3 dependencies` confirms `^0.7.4` match to Ultimate's already-pinned `uix-styled` engine; `3.0.0` requires incompatible `^1.0.0` |
| Engine rebrand scope | Full — CSS var prefix `p`→`u`, public exported identifiers renamed | Research Gate fork #2, user-approved; matches `.p-button`→`.u-button` component-layer precedent |
| Contract publicness | Primitive, semantic, component tokens + mode + direction public; states/variants expressed via existing component-token/pseudo-class pattern, not separate categories | Research Gate fork #3/#4, user-approved; §1.2's already-shipped `.u-button:disabled`/`dt('button.primary.color')` pattern |
| Density | Out of scope entirely, no stub | Research Gate fork #3, user-approved (YAGNI); zero evidence anywhere in repo or reference source inspected |
| Motion preference | Stays in `uix-motion`, not promoted to contract | Already verified working, component-scoped (§1.5) |
| Application timing | Runtime only, via already-vendored `dt()`/`StyleSheet` mechanism | Research Gate fork #4, user-approved; no CSP requirement in evidence |
| Package granularity | Single `packages/themes` package | Research Gate fork #5, user-approved (YAGNI); Blueprint constraint "avoid unnecessary new packages" |
| Package boundary | `uix-styled`/`uix-styles` unchanged in role; `packages/themes` owns contract types + preset data only | §1.1/§1.2 verified existing responsibilities; Blueprint §6's one-directional theme-to-framework arrow |

---

## 10. Exit Criteria

- [ ] `@primeuix/themes@2.0.3` pinned in `.vendor-cache/`, `docs/architecture/PROVENANCE.md` entry added (moved out of the "Excluded" list), `docs/architecture/checksums.json` updated.
- [ ] `@ultimate/themes` package structure exists, matching §2.
- [ ] `themes` builds via `tsup` with no errors; ESM output, `.d.mts` declarations.
- [ ] `uix-styled`'s CSS variable prefix is `'u'`, verified by a runtime assertion test (a resolved token variable is literally named `--u-*`, not `--p-*`).
- [ ] `uix-styled`'s public barrel exports carry Ultimate naming; `docs/architecture/provenance/uix-styled.json` records this second modification pass distinctly from Phase 1's import-adaptation pass.
- [ ] Ultimate baseline preset (Aura-derived, Option B reference-not-verbatim) ships real token values for all five proof-set components (Button, Checkbox, Dialog, Menu, Tooltip) — primitive, semantic, and component tiers all populated, not placeholder.
- [ ] Light/dark mode is functional and tested: at least the `"system"` default and one explicit `darkModeSelector` mode (e.g. `.dark` class) are verified working end-to-end against real component CSS.
- [ ] RTL/LTR is verified: existing `:dir(rtl)` native CSS behavior (§1.2) is confirmed still functioning once real token values are wired in (regression check, not new code).
- [ ] Cross-framework consistency validated: the same preset, applied once, produces matching resolved CSS variable values when consumed through `ng-core`, `react-core`, and `vue-core`'s existing `StyleSheet` subclasses — a dedicated cross-framework consistency test suite, not an assumption.
- [ ] `validate-dependency-ceiling.mjs` extended to watch `"themes"`; passes with zero violations (no `themes → ng-core|react-core|vue-core|ng|react|vue` dependency).
- [ ] `validate-provenance.mjs` passes for the new `themes` package (manifest entries for every source file).
- [ ] Provenance records complete: `docs/architecture/provenance/themes.json` created, matching the established schema.
- [ ] Documentation: `packages/themes/README.md`, matching the descriptive depth of `ng-core`'s/`react-core`'s/`vue-core`'s existing READMEs.
- [ ] `docs/architecture/ROADMAP.md` updated to mark Phase 5 complete upon closeout.

**Explicitly not required for Phase 5 exit** (documented, not hidden): density support; motion preference promoted into the contract; build-time CSS generation; more than one baseline preset family; a populated consumer/playground app; automated accessibility scanning.

---

## Non-Goals (consolidated)

See §8.
