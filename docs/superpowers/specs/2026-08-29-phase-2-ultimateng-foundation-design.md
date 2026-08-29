# Phase 2 — UltimateNG Foundation & Angular Component Framework

## Context

Phase 0 (Repository Foundation, Provenance & Baseline Verification) and Phase 1 (UltimateUIX Foundation) are complete and committed on `main`. Phase 1 delivered four framework-neutral packages — `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles` (base module only), `@ultimate/uix-motion` — derived from the pinned `@primeuix/*` MIT baselines via sourcemap extraction (ADR-016), with full provenance manifests and CI-enforced framework-neutrality (`scripts/provenance/validate-boundaries.mjs`) and dependency ceilings (`scripts/provenance/validate-dependency-ceiling.mjs`).

Phase 2 builds the first framework-specific package on top of that foundation: **UltimateNG**, the Angular implementation layer.

```text
PrimeNG MIT baseline
        ↓
Ultimate-owned UIX foundation
        ↓
UltimateNG
```

This document is a specification only. It contains no implementation code and authorizes no repository changes. Implementation begins only after this spec is reviewed and approved, followed by a separate implementation plan.

### Deviation: baseline version corrected from the task brief

**Finding:** The task brief that requested this specification states the PrimeNG baseline is `17.18.15`. The actual Phase 0-verified, checksummed, and provenance-pinned baseline — recorded in `docs/architecture/PROVENANCE.md`, `docs/architecture/COMPATIBILITY.md`, `docs/architecture/DEPENDENCIES.md`, and the vendored tarball `.vendor-cache/primeng-21.1.9.tar.gz` — is **PrimeNG `21.1.9`** at commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`, with Angular peer range `^21.0.7` and up.

**Impact:** This is not a rounding difference. PrimeNG 17.x predates Angular signals, zoneless change detection, and standalone-only component architecture as defaults. PrimeNG 21.1.9 (verified by direct source inspection during this investigation) is standalone-only, signals-based throughout (`input()`, `computed()`, `effect()`), zoneless-ready (`provideZonelessChangeDetection` used in its own test suite), and uses a `Bind`-hostDirective passthrough pattern not present in PrimeNG 17.x. Every downstream architectural finding in this spec (Section 7 onward) is derived from the 21.1.9 source, not 17.x.

**Options:**
1. Treat `21.1.9` as authoritative (it is already pinned, checksummed, and provenance-recorded from Phase 0; re-litigating it would reopen completed, committed work).
2. Reopen Phase 0 provenance work to re-verify a `17.18.15` baseline instead.
3. Escalate to the repository owner before proceeding further.

**Recommendation:** Option 1. Phase 0's baseline is already verified, committed, and load-bearing for Phase 1's completed work; nothing in the actual repository state supports `17.18.15`.

**Decision required:** Confirmed by repository owner — proceed on PrimeNG `21.1.9`. (See Decisions vs Open Questions.)

## Objective

Establish `@ultimate/ng`, the first framework-specific Ultimate package, as an Ultimate-owned Angular component framework derived from the verified MIT PrimeNG 21.1.9 baseline, consuming UltimateUIX for framework-neutral infrastructure. This is not a thin wrapper around PrimeNG: PrimeNG source is incorporated, provenance-tracked, and given an Ultimate-owned public API surface (renamed selectors, class names, CSS classes, and import paths), while its internal architecture (standalone components, signals, `BaseComponent`, passthrough) is retained because it is already sound, current, and worth keeping.

Phase 2 scope is deliberately narrow: foundation infrastructure plus a small pilot component set sufficient to prove the architecture end-to-end, not a mass migration of PrimeNG's ~100 components.

## Inputs

- `ULTIMATE_PLATFORM_BLUEPRINT.md` — authoritative platform architecture.
- `docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md`
- `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`
- `docs/architecture/{PROVENANCE,DECISIONS,DEPENDENCIES,PACKAGE_ARCHITECTURE,COMPATIBILITY,ROADMAP}.md`
- `docs/architecture/provenance/{uix-utils,uix-styled,uix-styles,uix-motion}.json` (file-level manifest schema precedent)
- `packages/uix-{utils,styled,styles,motion}/` (Phase 1 implementation, package/build/test conventions)
- `.vendor-cache/primeng-21.1.9.tar.gz` (pinned PrimeNG source, direct inspection performed for this spec)
- `packages/ng/THIRD-PARTY-NOTICES.md`, `packages/ng-core/.gitkeep` (Phase 0 scaffolding)

## Constraints (from Blueprint, Phase 0, and Phase 1 — binding on Phase 2)

- **ADR-004 (no Prime runtime dependency):** `@ultimate/ng` must declare zero runtime/peer/optional dependency on `primeng`, `@primeuix/*` above its pinned ceiling, or any other Prime package. Enforced by `scripts/provenance/validate-dependency-ceiling.mjs`, which already watches `packages/ng*`.
- **ADR-005 (MIT-only incorporation):** Only the pinned, MIT-verified PrimeNG `21.1.9` revision may be incorporated as source.
- **Package boundary (`PACKAGE_ARCHITECTURE.md`):** dependency direction is `UltimateNG → UltimateUIX`, never the reverse. `packages/uix*` must never import Angular — enforced by `scripts/provenance/validate-boundaries.mjs`.
- **ADR-002 (monorepo):** `@ultimate/ng` lives in this monorepo under `pnpm-workspace.yaml`'s `packages/*` glob, independently versioned per ADR-003.
- **ADR-016 precedent (vendoring mechanism):** any new source-extraction mechanism for PrimeNG source must be deterministic, reproducible from already-checksummed artifacts, and documented — not a live re-fetch.
- **Non-goals restated from the Blueprint (Section 32 of the brief):** no React/Vue implementation, no corporate theme, no CLI/MCP/Skills/AI runtime, no public npm publish, no automatic Prime sync, no arbitrary API redesign beyond the namespace rename decided here, no full-inventory migration.

## PrimeNG 21.1.9 Baseline Findings

Verified by direct extraction and inspection of `.vendor-cache/primeng-21.1.9.tar.gz` (`primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/`), not assumed from general PrimeNG familiarity.

### Package structure

- Single npm package `primeng`, monorepo subdirectory `packages/primeng`.
- `peerDependencies`: `@angular/{cdk,common,core,forms,router,platform-browser}` at `catalog:angular21` (resolves to `^21.0.7` per the workspace catalog), `rxjs: ^6.0.0 || ^7.8.1`.
- `dependencies`: `@primeuix/{styled,utils,styles,motion}` at `catalog:` (matching the exact versions Phase 1 already pinned: `0.7.4`, `0.7.2`, `2.0.3`, `0.0.10`).
- Build: `ng build primeng` (Angular CLI wrapping ng-packagr) preceded by `scripts/prebuild.mjs` and followed by `scripts/postbuild.mjs` (asset/metadata processing; not required for Phase 2 to replicate, since Ultimate is not replicating PrimeNG's showcase/doc generation).
- Output: Angular Package Format (APF) with one **secondary entrypoint per component/directive/utility area** (`ng-package.json` with `entryFile: public_api.ts` in each of the ~140 source directories), not a single bundle.
- Test: Karma + Jasmine + Angular `TestBed`, browser-run (`ng test primeng --browsers=ChromeHeadless`).

### Source inventory (`packages/primeng/src/*`, 140 top-level directories)

Approximately 100 are components/directives with a public Angular API; the remainder are shared infrastructure, types, or internal utilities. Full classification is in the Component Inventory section below. Representative categories confirmed by directory scan: primitives (`button`, `badge`, `tag`, `avatar`, `divider`, `chip`), form inputs (`inputtext`, `select`, `checkbox`, `inputnumber`, `datepicker`, `textarea`), overlays (`dialog`, `popover`, `drawer`, `tooltip`, `contextmenu`, `dynamicdialog`), data components (`table`, `treetable`, `tree`, `dataview`, `paginator`, `scroller`), navigation (`menu`, `menubar`, `tabs`, `stepper`, `breadcrumb`), and shared infrastructure (`basecomponent`, `baseeditableholder`, `baseinput`, `base`, `overlay`, `bind`, `dom`, `api`, `config`, `ripple`, `autofocus`, `icons`, `motion`, `focustrap`).

### Component architecture (verified via `button`, `overlay`, `select`, `table`, `dynamicdialog`, `basecomponent`)

- **Standalone-only.** Every inspected `@Component`/`@Directive` declares `standalone: true`. No NgModule-based component definitions; legacy `*Module` exports (e.g. `SharedModule`, `BadgeModule`) exist only as re-export conveniences, not architectural requirements.
- **`ChangeDetectionStrategy.OnPush`** with `ViewEncapsulation.None` on every inspected component (styling is handled by the token/class system, not `ViewEncapsulation.Emulated`).
- **Signals used for inputs**: `input()` and `computed()` are used throughout (e.g. `BaseComponent.dt`, `.unstyled`, `.pt`, `.ptOptions` are all `input()`), alongside legacy `@Input()`/`@Output()` decorators still present on some public APIs for compatibility. `effect()` is used for reactive side effects (e.g. theme-change listeners in `BaseComponent`).
- **DI via `inject()`** almost exclusively; constructor injection is largely absent in newer code paths inspected.
- **Shared base classes**: `BaseComponent` (Directive, `standalone: true`) is the root class nearly every component extends — it wires `DOCUMENT`, `PLATFORM_ID`, `ElementRef`, `Injector`, `ChangeDetectorRef`, `Renderer2`, the `PrimeNG` config service, `BaseComponentStyle`, `BaseStyle`, and a `PARENT_INSTANCE` injection token for parent-instance lookup without `@ContentChild`/`forwardRef` gymnastics. `BaseEditableHolder` and `BaseInput` extend this further for form-control components (not needed by the Phase 2 pilot set).
- **Passthrough pattern**: a `Bind` hostDirective (imported from `primeng/bind`) applied via `[pBind]="ptm('slot')"` bindings in templates implements PrimeNG's "pt" (passthrough) attribute-injection system — this is the mechanism by which consumers can inject arbitrary DOM attributes onto internal component slots.
- **Templates are inline** (template strings in the `@Component` decorator), not separate `.html` files, in every inspected component.
- **Zoneless-ready**: `button.spec.ts` explicitly uses `provideZonelessChangeDetection()` in its `TestBed` setup, confirming the codebase is validated against Angular's zoneless change-detection mode, not just zone.js.

### Style architecture (verified via `button/style/buttonstyle.ts`, `base/style/basestyle.ts`, `basecomponent/style/basecomponentstyle.ts`)

- Each component's style module (`@Injectable() class XStyle extends BaseStyle`) imports its raw CSS/token function from **`@primeuix/styles/<component>`** — e.g. `import { style } from '@primeuix/styles/button'`. This confirms and extends ADR-017's finding: Phase 1 deferred these ~90 per-component style modules deliberately, and Phase 2 (Angular), Phase 3 (React), Phase 4 (Vue) are exactly where each is incorporated, one at a time, alongside its owning component — never in bulk.
- The style module also defines a `classes` object: a per-slot map of either static class-name strings or functions of `{ instance }` returning conditional class arrays (e.g. `root: ({ instance }) => [...]`). This is component-authored logic, not shared UIX infrastructure, and stays in `@ultimate/ng`.
- `BaseStyle` (from `primeng/base`, i.e. framework-neutral-shaped but currently living inside the `primeng` package) provides the loader-state tracking (`_loadedStyleNames` Set, `isStyleNameLoaded`, etc.) that avoids double-injecting a component's CSS. This responsibility overlaps with `@ultimate/uix-styled`'s existing `StyleSheet`/`ThemeService` (`packages/uix-styled/src/stylesheet/index.ts`, `src/service/index.ts`) and must not be duplicated — see UltimateUIX Relationship below.
- `BaseComponentStyle`/`BaseStyle` are provided via Angular `providers: [...]` arrays at both the `BaseComponent` directive level and each component's own `@Component` decorator, giving each component tree its own style-service instance chain.

### Overlay infrastructure (verified via `overlay/overlay.ts`)

- A standalone `Overlay` component (not a service) handles positioning (`absolutePosition`/`relativePosition` from `@primeuix/utils` — already in `@ultimate/uix-utils`), scroll handling (`ConnectedOverlayScrollHandler` from `primeng/dom`, Angular-specific — not in UIX), append-to-target, and dismissal, and consumes `@primeuix/motion` (already `@ultimate/uix-motion`) directly for enter/leave transitions via `MotionEvent`/`MotionOptions`.
- `dynamicdialog/` layers a `DialogService` + `DynamicDialogRef`/`DynamicDialogConfig`/`DynamicDialogInjector` on top for imperative, ComponentRef-based dialog creation — this is Angular-specific (uses `Injector`, `ComponentRef`) and belongs entirely in `@ultimate/ng`, not UIX.
- Overlay-dependent components are explicitly **out of Phase 2's pilot scope** (see Component Migration Strategy) because they require this additional infrastructure beyond what `Button`/`Ripple`/`AutoFocus` exercise.

### Forms integration (verified via `select/select.ts`)

- Standard Angular Forms pattern: `NG_VALUE_ACCESSOR` provided via a DI token, with `writeValue`/`registerOnChange`/`registerOnTouched`/`setDisabledState` implemented on the component class implementing `ControlValueAccessor`. `BaseEditableHolder`/`BaseInput` centralize touched/dirty/disabled state handling for form-control components.
- This is entirely Angular-specific and belongs in `@ultimate/ng`; nothing here overlaps with UIX. Out of Phase 2's pilot scope (no form-control component is migrated in Phase 2).

### Accessibility (spot-checked across `button`, `overlay`, `select`)

- ARIA attributes are set via template attribute bindings (`[attr.aria-label]`, `[attr.aria-hidden]`), not `@HostBinding`, in every inspected case. `tabindex` and `disabled` are similarly template-bound, not host-bound.
- No accessibility defects were identified in the pilot components (`Button`) during this inspection; a full accessibility audit of the broader inventory is out of Phase 2 scope and deferred to each component's own migration phase.

### Testing (verified via `button/button.spec.ts`)

- `TestBed` + a wrapper test `@Component` (`standalone: false` in the wrapper itself, to allow binding every input via template interpolation) + `ComponentFixture` + `By.css`/`By.directive` queries. Assertions cover rendering (class presence, DOM structure), input binding (label/icon/severity/etc. reflected to DOM), and event emission (click/focus/blur).

## Angular Baseline

**Decision:** Target Angular `^21.0.7` and up, matching PrimeNG 21.1.9's verified peer range exactly (`catalog:angular21` in the pinned tarball's `package.json`). No speculative jump to a newer major not yet reflected in the verified baseline.

- **Standalone components**: primary and only architecture (see Standalone vs NgModule below).
- **Signals**: used for component inputs and computed state, consistent with the verified source. Phase 2 continues this pattern rather than reverting to decorator-only `@Input()`.
- **Zoneless / SSR / hydration**: the verified baseline is zoneless-compatible in its own test suite; Phase 2 does not add SSR/hydration-specific code beyond what's inherited, since the pilot components (Button, Ripple, AutoFocus) have no server-rendering-specific logic to adapt. Full SSR/hydration verification is deferred to a phase where an overlay- or data-heavy component (which do have `isPlatformBrowser`/`isPlatformServer` branches) is migrated.
- **Angular CLI / compiler**: not required as a full workspace — see Build Strategy.

## PrimeNG Source Scope (Classification)

| Source area | Classification | Rationale |
|---|---|---|
| `button/` | **ADAPT** | Pilot component. Retain architecture; rename API surface; repoint style import to `@ultimate/uix-styles`. |
| `ripple/` | **ADAPT** | Button dependency; small standalone directive, minimal surface. |
| `autofocus/` | **ADAPT** | Button dependency; small standalone directive, minimal surface. |
| `basecomponent/`, `base/` | **ADAPT** | Required foundation for any component; retained as internal (non-exported-as-public-API) infrastructure inside `@ultimate/ng`. |
| `bind/` | **ADAPT** | Passthrough mechanism required by `basecomponent`; retained as-is architecturally. |
| `dom/`, `api/`, `config/` | **DEFER (Needs Architecture Decision)** | `dom/` contains `ConnectedOverlayScrollHandler` (overlay-only, not needed by pilot); `api/` contains many cross-cutting types/services (`MessageService`, `FilterService`, etc.) whose scope needs its own review once more components land; `config/` (`PrimeNG` global config service) is needed by `BaseComponent` but only a minimal subset applies to the pilot — full config surface deferred. |
| `overlay/`, `dynamicdialog/` | **DEFER (Later Phase)** | Not needed by pilot; brings in `@primeuix/motion` consumption pattern for Angular and `ConnectedOverlayScrollHandler`. Next logical migration wave. |
| `baseeditableholder/`, `baseinput/` | **DEFER (Later Phase)** | Needed only once a form-control component is migrated. |
| All other ~90 component directories (`table`, `dialog`, `select`, `tree`, etc.) | **DEFER (Later Phase)**, per Component Inventory | Full per-component classification in that section. |
| `icons/` | **DEFER (Needs Architecture Decision)** | Icon set (SVG components per icon) — large surface, needs its own scoping decision on which icons ship and how; not required by the text-only Button variant used in the pilot's own tests, though Button's real API does support icons. Flagged as an open question. |
| PrimeNG's own build scripts (`scripts/prebuild.mjs`, `scripts/postbuild.mjs`), Karma/Jasmine config, showcase app (`apps/showcase`) | **EXCLUDE** | Build/doc tooling and demo app, not library source. Never incorporated, per the same principle already applied to PrimeReact's showcase app in `DEPENDENCIES.md`. |

## UltimateUIX Relationship

Dependency direction is strictly `@ultimate/ng → @ultimate/uix-*`, never the reverse — enforced by the existing `scripts/provenance/validate-boundaries.mjs` (already scans all `packages/uix*` directories for framework imports and fails the build if found).

`@ultimate/ng` may depend on:
- `@ultimate/uix-utils` (DOM helpers, classnames, object utils — used directly by `overlay`/`button`/etc. in the verified source via `@primeuix/utils`)
- `@ultimate/uix-styled` (theme/token resolution, `StyleSheet` service)
- `@ultimate/uix-styles` (base module now; `button` module added in Phase 2)
- `@ultimate/uix-motion` (motion primitives — not exercised by the Phase 2 pilot set, since Button/Ripple/AutoFocus have no enter/leave transitions, but the dependency is declared for when overlay components land)

### Duplicate-responsibility classification

| PrimeNG responsibility | Classification | Notes |
|---|---|---|
| `BaseStyle`'s `_loadedStyleNames` tracking (`base/style/basestyle.ts`) | **REPLACE WITH UIX** | `@ultimate/uix-styled`'s `StyleSheet`/`ThemeService` already owns style-injection/dedup responsibility. `@ultimate/ng`'s `BaseStyle`-equivalent must delegate to UIX's `StyleSheet`, not reimplement loaded-style tracking. |
| Style module's raw CSS/token function (`@primeuix/styles/button` shape) | **REPLACE WITH UIX** | The per-component style content is framework-agnostic and belongs in `@ultimate/uix-styles/button`, matching the `base` module's Phase 1 precedent — consumed identically by Angular now and by React/Vue later. Only the Angular-specific `classes` resolver function (`{ instance } => [...]`) and the `@Injectable() XStyle extends BaseStyle` wiring stay in `@ultimate/ng`. |
| `absolutePosition`/`relativePosition`/DOM query helpers (`@primeuix/utils`) | **REPLACE WITH UIX** | Already available via `@ultimate/uix-utils`; no reason to duplicate. |
| Motion/transition primitives (`@primeuix/motion`) | **REPLACE WITH UIX** | Already available via `@ultimate/uix-motion`. Not exercised by the pilot set but the policy is recorded now for when overlay components land. |
| `ConnectedOverlayScrollHandler`, `Bind` passthrough directive, `BaseComponent`'s Angular DI wiring, `ControlValueAccessor` implementations | **RETAIN FOR ANGULAR-SPECIFIC REASONS** | These depend on Angular's `Injector`/`Renderer2`/`ChangeDetectorRef`/Forms APIs directly; there is nothing UIX (framework-neutral) can own here. |

## Ownership Boundaries

```text
@ultimate/ng component
        ↓ consumes
@ultimate/uix-styled (token resolution, StyleSheet injection)
        ↓ consumes
@ultimate/uix-styles/<component> (raw CSS/token module, e.g. .../button)
```

`@ultimate/ng`'s per-component `XStyle` class is a thin Angular `@Injectable` adapter: it extends a UltimateNG-owned `BaseStyle` (which delegates loaded-style bookkeeping to `@ultimate/uix-styled`'s `StyleSheet`), sets `style` to the imported UIX style module, and defines the Angular-specific `classes` resolver function. No styling infrastructure is reimplemented inside `@ultimate/ng`.

## Package Architecture

**Decision:** Single package `packages/ng/` (`@ultimate/ng`), not split into `ng-core`/`ng-components`. PrimeNG's own proven shape — one package, many APF secondary entrypoints — is retained. `packages/ng-core/` (currently an empty Phase 0 `.gitkeep` scaffold) is **removed** as part of this phase.

**Deviation from Phase 0's `PACKAGE_ARCHITECTURE.md`:**
- **Finding:** Phase 0 reserved `packages/ng-core/` for a "framework core packages" tier separate from "framework component packages," per the Blueprint's original core/components split.
- **Impact:** At Phase 2's pilot scope (3 small components), a second package adds workspace/build/test/versioning overhead with no corresponding boundary benefit — there is no second consumer of "core" independent of "components" yet.
- **Options:** (1) keep the empty scaffold for a hypothetical future split; (2) remove it now and revisit only if a real need emerges (e.g. if `@ultimate/ng` grows large enough that internal-only base classes need independent versioning).
- **Recommendation:** (2) — remove now, matching YAGNI; a single package can always be split later without breaking consumers, since internal base classes are not currently exported as public API.
- **Decision required:** Confirmed by repository owner — remove `packages/ng-core/`, update `PACKAGE_ARCHITECTURE.md` to reflect the single-package Angular tier.

### `@ultimate/ng`

- **Purpose:** Ultimate's Angular component framework, derived from PrimeNG 21.1.9.
- **Public API (Phase 2):** `UButton` (selector `u-button`), `Ripple` (attribute directive, selector `pRipple`-equivalent renamed per the API strategy below), `AutoFocus` (attribute directive). Internal `BaseComponent`/`BaseStyle`/`Bind`-equivalent classes are **not** part of the public API surface (not re-exported from the package root), matching PrimeNG's own practice of keeping `basecomponent`/`bind` as internal-support entrypoints most consumers never import directly.
- **Internal API:** `basecomponent`, `base`, `bind` — Angular-specific foundation classes, importable by other `@ultimate/ng` entrypoints via workspace-relative APF secondary-entrypoint imports, not intended for direct external consumption (documented as internal in each entrypoint's README, not technically firewalled — matching PrimeNG's own convention).
- **Dependencies:** `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles` (workspace protocol).
- **Peer dependencies:** `@angular/core`, `@angular/common`, `@angular/cdk` (if needed by pilot — to confirm during implementation; not used by `overlay`-free pilot components, so may be omitted from Phase 2's actual peer set and added when overlay components land), `rxjs`, at the verified `^21.0.7`-and-up range.
- **Exports:** APF secondary entrypoints — `@ultimate/ng/button`, `@ultimate/ng/ripple`, `@ultimate/ng/autofocus`, plus internal entrypoints `@ultimate/ng/basecomponent`, `@ultimate/ng/base`, `@ultimate/ng/bind`.
- **Build output:** ng-packagr APF output (ESM, `.d.ts` per entrypoint, `package.json` per entrypoint with proper `exports` map) — see Build Strategy.
- **Side effects:** `sideEffects: false` at the package level (matching every Phase 1 UIX package), consistent with tree-shaking requirements — to be verified true for Angular decorators/DI metadata during implementation (Angular decorator metadata does not require `sideEffects: true` under ng-packagr's standard output).
- **Tests:** Vitest + Angular Testing Library, one test file per entrypoint (component behavior, passthrough/`Bind` behavior for Button, directive behavior for Ripple/AutoFocus), plus an exports-resolution test and a dependency-boundary test mirroring the pattern in `packages/uix-utils/test/exports.test.ts`.
- **Ownership:** Angular framework team (per `CODEOWNERS` — to be updated during implementation to include `packages/ng/`).

## Public API Strategy

**Decision:** Ultimate-first namespace, applied now, not deferred.

- Selector prefix `u-` for components (`<u-button>` replaces `<p-button>`), attribute-directive selectors renamed to an Ultimate-prefixed form (e.g. `uRipple`/`uAutoFocus` replacing `pRipple`/`pAutoFocus` — exact naming to be finalized in the implementation plan, following whatever convention reads most naturally; this spec fixes the *policy*, not the final string).
- Class names: `Button` → `UButton`, `ButtonDirective` → `UButtonDirective`, `ButtonLabel` → `UButtonLabel`, `ButtonIcon` → `UButtonIcon`.
- CSS classes: `p-button` → `u-button` (and all BEM-style descendants: `p-button-icon` → `u-button-icon`, etc.) — this requires the corresponding `@ultimate/uix-styles/button` module's class-name strings to be updated at incorporation time, not left as `p-*` strings under a new Angular class name.
- Import paths: `primeng/button` → `@ultimate/ng/button`.
- Injection tokens: renamed to match (`BUTTON_INSTANCE` → an Ultimate-scoped equivalent, exact name deferred to implementation).

**Rationale:** Ultimate has no existing external consumer base for a PrimeNG-compatible API to protect, and Ultimate's own stated goal (Blueprint, ADR-004) is ownership, not compatibility. Renaming once now, while the surface is still 3 components, avoids a second breaking migration later and eliminates CSS-class collision risk if a consuming application ever has `primeng` installed alongside `@ultimate/ng` for a transitional period.

**Deferred:** No migration tooling (codemods, aliasing) is built in Phase 2 — see Migration Strategy.

## Component Migration Strategy

Dependency-graph-derived sequence, based on verified source relationships:

```text
Foundation (basecomponent, base, bind)
    ↓
Primitives with no overlay/forms dependency (button, ripple, autofocus)  ← Phase 2 pilot
    ↓
Form-control primitives (baseeditableholder, baseinput, then inputtext/checkbox/etc.)  ← Later phase
    ↓
Overlay-dependent components (overlay infra, then tooltip/popover/dialog/etc.)  ← Later phase
    ↓
Data components (table, tree, treetable, paginator, scroller — build on primitives + overlay)  ← Later phase
    ↓
Complex/composite components (datepicker, autocomplete, cascadeselect — compose multiple prior tiers)  ← Later phase
```

Phase 2 implements only the first two tiers' foundation layer plus the primitive pilot set. This order is derived directly from verified import relationships (e.g. `select.ts` imports form infrastructure; `overlay.ts` is imported by `dynamicdialog`, `popover`, and others; `table.ts` composes paginator/scroller-adjacent concerns) rather than assumed.

## Component Inventory

Full classification of all ~140 source areas is required as a Phase 2 deliverable (a structured table: Component | Prime source path | Category | Dependencies | UIX dependencies | Angular-specific responsibilities | Style dependencies | Accessibility responsibilities | Migration classification | Migration phase | Risk). Given the size (~140 rows), this table is generated as part of implementation (a machine-checkable artifact, e.g. `docs/architecture/provenance/ng-inventory.json` or `.csv`, following the same file-level-manifest precedent as Phase 1), not hand-authored inline in this spec. This spec fixes the **schema and the classification policy**:

- **Phase 2:** `button`, `ripple`, `autofocus`, `basecomponent`, `base`, `bind` (foundation + pilot only).
- **Later Phase:** every other component/directive with a clear future home per the migration sequence above.
- **Not Needed:** none identified yet — full review during implementation may surface PrimeNG areas with no Ultimate equivalent need (e.g. legacy/deprecated directives); to be confirmed.
- **Needs Architecture Decision:** `icons/` (icon set scoping), `api/` (which cross-cutting services/types are core vs component-specific), `config/` (global `PrimeNG` config service's full surface vs a minimal Phase 2 subset), `dom/` (which DOM helpers stay Angular-specific vs migrate to UIX).

## Styling Strategy

```text
UltimateNG component (UButton)
        ↓
UltimateNG style adapter (UButtonStyle — Angular @Injectable, class-resolver logic)
        ↓
UltimateUIX styling infrastructure (@ultimate/uix-styled's StyleSheet/ThemeService for injection+dedup, dt() token resolution)
        ↓
UltimateNG component style content (@ultimate/uix-styles/button — raw CSS/token module, migrated from @primeuix/styles/button)
```

- `@ultimate/uix-styles` gains a `button` module in Phase 2 (following the exact extraction/provenance mechanism ADR-016 established: sourcemap recovery from the pinned `@primeuix/styles@2.0.3` tarball, already available in `.vendor-cache/`), with its `p-button*` class-name strings renamed to `u-button*` as part of incorporation (not left mismatched against the Angular-side rename).
- `@ultimate/ng`'s `UButtonStyle` (`@Injectable`) imports this module, defines the `classes` resolver function (Angular-specific, stays here), and delegates loaded-style-name tracking to `@ultimate/uix-styled`'s existing `StyleSheet` service rather than reimplementing `BaseStyle`'s `_loadedStyleNames` bookkeeping.
- This establishes the reusable pattern every subsequent component (Phase 2+) follows: one `@ultimate/uix-styles/<component>` module, one `@ultimate/ng` (and later React/Vue) style adapter per framework.

## Overlay Architecture

Not implemented in Phase 2 (no pilot component needs it), but the responsibility split is fixed now so later phases don't re-litigate it:

- **UltimateUIX:** positioning math (`absolutePosition`/`relativePosition`, already in `uix-utils`), motion/transition primitives (already in `uix-motion`).
- **UltimateNG:** the `Overlay` component itself (Angular `ComponentRef`/`Injector`-based dynamic rendering), `ConnectedOverlayScrollHandler` (DOM-event-driven, Angular-lifecycle-bound), `DialogService`/`DynamicDialogRef` (Angular DI-based imperative API), z-index management if Angular-lifecycle-coupled (to confirm whether `@primeuix/utils`'s existing zindex utility, already in `uix-utils`, covers this or whether Angular-specific sequencing is needed).
- **Component:** dismissal policy (escape key, backdrop click), modal semantics (focus trap entry/exit), ARIA (`role="dialog"`, `aria-modal`) — component-authored, not shared.

## Forms Architecture

Not implemented in Phase 2 (no pilot component is a form control), but fixed as policy: `ControlValueAccessor`, `NG_VALUE_ACCESSOR` provision, touched/dirty/disabled state, and error presentation are 100% Angular-specific and belong entirely in `@ultimate/ng`'s `BaseEditableHolder`/`BaseInput`-equivalent base classes when that tier is migrated. No UIX involvement.

## Data Component Strategy

Not implemented in Phase 2. Table/TreeTable/Tree/VirtualScroller/Paginator are explicitly deferred past the overlay tier per the migration sequence, since they compose primitive + (in some cases) overlay infrastructure that doesn't exist yet. No further design work performed in this spec beyond confirming their place in the sequence.

## Dependency Rules

- **Forbidden runtime/peer/optional dependencies for `@ultimate/ng`:** `primeng`, `primevue`, `primereact`, any `@primeuix/*` package. Already enforced by `scripts/provenance/validate-dependency-ceiling.mjs` (no changes needed — it already watches any `packages/ng*` directory).
- **Required dependencies:** `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles` via `workspace:*`.
- **Required peer dependencies:** `@angular/core`, `@angular/common`, `rxjs` at the verified `^21.0.7`-and-up range (exact peer set, including whether `@angular/cdk`/`@angular/forms`/`@angular/router`/`@angular/platform-browser` are needed by the Phase 2 pilot specifically, to be finalized during implementation — the pilot set does not use CDK/Forms/Router directly based on verified source).
- **CI:** no new validator scripts required; existing `boundary:validate` and `ceiling:validate` already cover `packages/ng*`. `provenance:validate` (`scripts/provenance/validate-provenance.mjs`) must be confirmed to also cover a new `ng.json` manifest — to verify/extend during implementation if its file-discovery logic is hardcoded to the four Phase 1 package names.

## Provenance

New file-level manifest `docs/architecture/provenance/ng.json`, using the **exact schema already established** in Phase 1 (`{originalPath, ultimateDestination, modificationStatus, modificationDescription}` per entry, verified against `docs/architecture/provenance/uix-styles.json`), covering every file under `button/`, `ripple/`, `autofocus/`, `basecomponent/`, `base/`, `bind/` incorporated from the pinned tarball.

`docs/architecture/PROVENANCE.md`'s existing PrimeNG entry is updated: `Modification status` changes from "not yet incorporated" to "incorporated (Phase 2)", with `Modification description` pointing to the new manifest and describing the API rename (selector/class/CSS-class/import-path changes) alongside the already-precedented import-specifier adaptation pattern (`scripts/provenance/adapt-imports.mjs`, extended to also handle the `@ultimate/ng` namespace rename, not just `@primeuix/* → @ultimate/uix-*`).

**Vendoring mechanism:** unlike the four `@primeuix/*` packages (which had no `src/` in their tarballs, requiring ADR-016's sourcemap-recovery mechanism), the pinned `primeng-21.1.9.tar.gz` **does** contain full TypeScript source (`packages/primeng/src/**/*.ts`) directly, extracted from the exact commit SHA `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` (a real git-archive tarball, not an npm publish tarball — confirmed by the presence of `.github/`, `.husky/`, `CHANGELOG.md`, and other non-published-package files at the tarball root). This is a **more reproducible** vendoring mechanism than ADR-016's: direct source extraction from a verified commit, no sourcemap-recovery step needed. Document this as the Phase 2 vendoring mechanism, distinct from (and simpler than) ADR-016.

## Licensing

- PrimeNG `21.1.9`'s Community Versions section is MIT — already verified in Phase 0 and re-confirmed in `packages/ng/THIRD-PARTY-NOTICES.md` (already exists from Phase 0 scaffolding), which correctly flags that PrimeNG ships a **dual-license** `LICENSE.md` and only the non-`-lts` Community section applies.
- `@ultimate/uix-styles/button`'s incorporated content (from `@primeuix/styles@2.0.3`) is covered by the existing `packages/uix-styles/THIRD-PARTY-NOTICES.md` and `PROVENANCE.md` `@primeuix/styles` entry — no new licensing question, just an addition to an already-covered package.
- No icons, fonts, or other bundled assets are incorporated in Phase 2 (icon scoping is explicitly deferred — see Component Inventory's "Needs Architecture Decision" row).
- `packages/ng/THIRD-PARTY-NOTICES.md` must be updated from its current "will incorporate source derived from primeng@21.1.9" placeholder language to reflect actual incorporation once Phase 2 lands.

## Build Strategy

**Decision:** ng-packagr directly, not a full Angular CLI workspace (`angular.json`).

- **Rationale:** PrimeNG's own build (`ng build primeng`) is Angular CLI invoking ng-packagr under the hood; for a library-only package with no application shell, invoking ng-packagr directly (via its programmatic API or CLI, driven by a `ng-package.json` + ordinary `package.json` `build` script) avoids scaffolding a full CLI-managed workspace that a pure library doesn't need, while still producing standards-correct Angular Package Format output (the actual requirement, not `ng build` specifically). This keeps Phase 2 closer to Phase 0/1's "plain tooling" spirit (ADR-015) than adopting Angular CLI's opinionated project structure would.
- **Output:** APF-compliant ESM output, per-entrypoint `.d.ts`, `package.json` `exports` map per secondary entrypoint (`button/package.json`, `ripple/package.json`, etc., each pointing into a shared `dist/` structure) — mirroring the `ng-package.json` shape already verified in every PrimeNG source directory.
- **TypeScript:** Angular's compiler (`@angular/compiler-cli`) is required for template type-checking and decorator processing — this is non-negotiable for any Angular library regardless of packager choice, and is not "forcing tsup" onto Angular (tsup is not used for `@ultimate/ng`).
- **Partial compilation / metadata:** ng-packagr emits Ivy partial-compilation output by default, which is the current Angular library-authoring standard.

## Testing Strategy

**Decision:** Vitest + Angular Testing Library, not Karma/Jasmine.

- **Rationale:** keeps a single test runner across the entire monorepo (matching Phase 0/1's Vitest-everywhere convention), while `@testing-library/angular` provides the TestBed-compatible rendering/query API Angular component tests need. This is a deliberate choice, not "tools for consistency's sake" — Angular's DI/compiler/zone integration still goes through `TestBed` either way; only the assertion/runner layer changes.
- **Coverage for Phase 2 pilot:**
  - **Component behavior:** `UButton` inputs (label, icon, severity, disabled, loading), outputs (click/focus/blur), rendering (conditional icon/label/badge slots).
  - **Accessibility:** `aria-label`, `aria-hidden`, `tabindex`, `disabled` attribute reflection; keyboard-triggered click via `Ripple`/`AutoFocus` interaction (no keyboard-nav test needed beyond native `<button>` semantics, since `UButton` renders a real `<button>` element).
  - **Forms:** not applicable — no pilot component implements `ControlValueAccessor`.
  - **Overlay:** not applicable — no pilot component uses overlay infrastructure.
  - **Styling:** `UButtonStyle` resolves expected class names from `@ultimate/uix-styles/button` given various input combinations (mirroring `packages/uix-styled/test/token-resolution.test.ts`'s pattern).
  - **SSR:** not applicable in Phase 2 — no pilot component branches on `isPlatformServer`.
  - **Package exports:** every `@ultimate/ng/*` entrypoint resolves and exports the expected symbols (mirroring `packages/uix-utils/test/exports.test.ts`).
  - **Dependency boundaries:** `@ultimate/ng/package.json` declares no forbidden Prime dependency (already covered by existing `ceiling:validate` CI script, additionally asserted in a package-level test for fast local feedback, matching Phase 1's pattern of also having in-package boundary tests, e.g. `packages/uix-styles/test/scope-guard.test.ts`).
  - **Framework boundary:** N/A for `@ultimate/ng` itself (it's expected to import Angular); the existing `boundary:validate` continues to guard `packages/uix*` only, which is correct — `@ultimate/ng` is supposed to import `@angular/*`.
  - **Build:** clean `pnpm install && pnpm -r run build && pnpm -r run test` from a fresh checkout must succeed, including `@ultimate/ng`.

## Accessibility

No known accessibility defects were found in the pilot components (`Button`) during source verification. Classification for the pilot set:

| Behavior | Classification |
|---|---|
| `aria-label` reflection | RETAIN |
| `aria-hidden` on decorative icon/badge slots | RETAIN |
| `tabindex` reflection | RETAIN |
| `disabled`/loading-state semantics | RETAIN |
| Focus management via `pAutoFocus`/`AutoFocus` directive | RETAIN |

Full accessibility classification (RETAIN/FIX/REPLACE/MISSING) for the broader ~100-component inventory is deferred to each component's own migration phase, since it requires inspecting each component's actual template/interaction pattern — not assumable from the pilot set.

## SSR / Hydration

No SSR/hydration-specific behavior is exercised by the Phase 2 pilot set (`Button`, `Ripple`, `AutoFocus` have no `isPlatformServer` branches in the verified source). Deferred to the phase where a component with real SSR-sensitive logic (e.g. `overlay`, which does check `isPlatformBrowser`) is migrated.

## Security

- No `innerHTML`/`bypassSecurityTrust*`/dynamic-script patterns were found in the pilot components during verification.
- The `Bind`/passthrough (`pt`) mechanism allows consumers to inject arbitrary attributes onto internal DOM slots — this is an existing PrimeNG design (not new to Ultimate) but is flagged as **security-sensitive code requiring explicit tests**: a malicious or careless `pt` value should not be able to inject event handlers or `javascript:` URLs. Phase 2 implementation must include a test asserting passthrough attribute binding goes through Angular's standard attribute-binding sanitization (`[attr.x]`), not raw DOM manipulation.
- No user-provided HTML rendering exists in the pilot set (Button's `label` is bound via `{{ }}` interpolation, which Angular auto-escapes).

## Performance

Baselines to record (measured, not assumed) as a Phase 2 deliverable, following the same measurement-script pattern already established in `scripts/provenance/measure-package-size.mjs`:

- `@ultimate/ng/button` (+ its `ripple`/`autofocus` dependencies) bundle size, minified and gzipped.
- Package install size from a clean `pnpm install`.
- No component-creation/change-detection/overlay-rendering benchmarks in Phase 2 (no complexity in the pilot set to warrant them) — deferred to when data/overlay components are measured.

## Documentation

For `UButton` (the only fully-documented component in Phase 2): PrimeNG foundation (link to the provenance entry), UltimateNG behavior/API (inputs/outputs table), styling (which `@ultimate/uix-styles/button` tokens are consumed), accessibility notes, a basic usage example. Follows the existing `packages/uix-*/README.md` format/depth, not a new documentation system. No Storybook changes in Phase 2 (see Non-Goals) — PrimeNG mirror stories, if any exist for Angular already, are left untouched.

## AI/Metadata Constraints

No CLI/MCP/Skills/AI runtime work in Phase 2. `UButton`'s public API (selector, inputs, outputs, content-projection slots) is structured plainly enough (no dynamic/reflection-based API surface) that a future Phase 6 metadata-extraction tool can introspect it via standard Angular decorator metadata — no special annotation is added now to accommodate that, since none is needed yet.

## Migration Strategy (compatibility with PrimeNG)

**Decision:** No compatibility mechanism (codemods, selector aliasing, import aliasing) is built in Phase 2. Since Ultimate has no existing `<p-button>`-consuming application to migrate (this is greenfield adoption of `@ultimate/ng`, not a retrofit of an existing PrimeNG app), migration tooling has no current consumer and would be speculative. If/when Ultimate needs to migrate an existing PrimeNG-based application onto `@ultimate/ng`, that becomes its own scoped effort with a real target application to validate against — deferred, not designed here.

## Angular Upgrade Strategy

**Decision:** Independent tracking with deliberate lag (Strategy B/C hybrid, not Strategy A).

`@ultimate/ng` tracks Angular's own release cadence directly, not PrimeNG's upstream cadence, since Ultimate now owns this source and Blueprint ADR-004 already commits to no ongoing Prime dependency. Target current-and-previous major (`^21.0.7` now; adopt Angular 22 a few months after its stable release, once its own ecosystem — CDK, forms, testing libraries — has caught up, rather than day-one). This avoids both upstream lag (waiting on PrimeNG to upgrade first) and upgrade churn (chasing every Angular major immediately). Re-evaluated at the start of each subsequent phase touching `@ultimate/ng`.

## Deliverables

- `packages/ng/` package: `package.json`, `ng-package.json` per entrypoint, `tsconfig.json`, build config, `README.md`, `THIRD-PARTY-NOTICES.md` (updated from placeholder).
- Source: `button/`, `ripple/`, `autofocus/`, `basecomponent/`, `base/`, `bind/` — adapted from the pinned PrimeNG `21.1.9` tarball with the Ultimate API rename applied.
- `packages/uix-styles/src/button/index.ts` — new per-component style module, extracted from the pinned `@primeuix/styles@2.0.3` tarball, class names renamed `p-button*` → `u-button*`.
- `docs/architecture/provenance/ng.json` — new file-level manifest.
- `docs/architecture/PROVENANCE.md` — PrimeNG entry updated to "incorporated (Phase 2)".
- `docs/architecture/PACKAGE_ARCHITECTURE.md` — updated to remove the `ng-core` tier and reflect the single-package `@ultimate/ng` model.
- `docs/architecture/provenance/uix-styles.json` — updated with the new `button` module's manifest entry.
- `scripts/provenance/adapt-imports.mjs` — extended to also rewrite the Ultimate API rename (selector/class/CSS-class strings), not just import specifiers, or a new sibling script if the transformation shape differs meaningfully (to decide during implementation).
- Component Inventory artifact (`docs/architecture/provenance/ng-inventory.json` or equivalent) — full ~140-area classification.
- Tests: component/directive/style/export/dependency-boundary tests per the Testing Strategy section.
- Performance baseline record (bundle size, install size) — likely appended to `docs/architecture/PERFORMANCE.md` (existing Phase 1 file).
- `CODEOWNERS` update for `packages/ng/`.
- This spec's Decisions vs Open Questions section resolved into `docs/architecture/DECISIONS.md` as new ADR entries once approved.

## Acceptance Criteria

- `@ultimate/ng` builds cleanly via ng-packagr from a clean `pnpm install`.
- `UButton`, `Ripple`, `AutoFocus` are fully migrated with Ultimate-namespaced selectors/classes/CSS classes/import paths.
- `docs/architecture/provenance/ng.json` exists and is complete for every incorporated file.
- `pnpm run provenance:validate`, `boundary:validate`, `ceiling:validate` all pass with `packages/ng/` present.
- `@ultimate/ng`'s `package.json` declares zero `primeng`/`@primeuix/*` runtime/peer/optional dependency.
- All Testing Strategy coverage areas have passing tests.
- `@ultimate/uix-styles/button` module exists, is provenance-tracked, and is the sole source of `UButton`'s style content (no duplicated CSS/token logic inside `@ultimate/ng`).
- Component Inventory artifact covers all ~140 verified source areas with a classification.
- Performance baseline is recorded (not assumed) for `@ultimate/ng/button`.
- `README.md`/component documentation exists for `UButton` per the Documentation section.

## Risks

| Risk | Impact | Likelihood | Mitigation | Decision point |
|---|---|---|---|---|
| PrimeNG source divergence (future Prime releases move further from 21.1.9) | Growing gap makes future security-advisory backporting harder | Medium | ADR-013 already accepts case-by-case advisory evaluation; no continuous sync is planned regardless | Ongoing, reassessed per advisory |
| Angular version compatibility (Angular 22+ breaking changes) | `@ultimate/ng` may need rework independent of PrimeNG's own timeline | Medium | Deliberate-lag upgrade strategy (adopt a major only after ecosystem catch-up) | Start of each phase touching `@ultimate/ng` |
| API divergence from PrimeNG growing over time | Harder to reference upstream PrimeNG docs/issues for debugging | Low (accepted trade-off) | Provenance manifest always links back to the exact original source | N/A — accepted by this spec's Public API Strategy decision |
| Component migration scale (~140 areas, ~3 done) | Long runway before the platform is broadly usable | High (known, accepted) | Explicit staged migration sequence (this spec); each later phase re-scopes its own tier | Start of each subsequent Angular-component phase |
| Overlay complexity (deferred) | Next phase touching overlay is high-risk/high-surface (positioning, SSR, focus, motion, dismissal all at once) | Medium | Explicitly scoped out of Phase 2; dedicated design pass recommended when that phase starts | Start of the overlay-tier phase |
| Forms integration (deferred) | CVA/validation edge cases are easy to get subtly wrong | Medium | Explicitly scoped out of Phase 2 | Start of the forms-tier phase |
| Accessibility regressions during API rename | Renaming classes/selectors could silently drop an ARIA binding if copy-paste is imprecise | Low-Medium | Explicit accessibility test coverage per component (this spec's Testing Strategy) | Per-component migration, ongoing |
| Performance regressions | None expected at pilot scale, but no baseline existed before Phase 2 | Low | Baseline recorded now, before scale grows | Each subsequent phase compares against this baseline |
| SSR/hydration issues | Deferred entirely; unverified until an SSR-sensitive component migrates | Medium (unverified, not mitigated) | Explicit non-goal for Phase 2; first SSR-sensitive component's phase must design this properly | Start of the first overlay/SSR-sensitive component's phase |
| Styling integration correctness | `uix-styles/button` class renames must exactly match `@ultimate/ng`'s class-resolver strings, or styling silently breaks | Medium | Both live in the same PR/commit; export test + visual smoke check during implementation | Implementation review |
| Prime dependency leakage | A future contributor could accidentally add `primeng` as a dev dependency for convenience during development | Low | `ceiling:validate` already blocks any `packages/ng*` declaration of forbidden deps in `package.json`; add a note to `packages/ng/README.md` | Ongoing CI |
| Provenance gaps | Missing or incomplete manifest entries for incorporated files | Low | `validate-provenance.mjs` pattern (extend if it doesn't yet generically discover new manifests) | Implementation review |
| Build complexity (ng-packagr vs tsup mismatch across the monorepo) | Root-level `pnpm -r run build` must correctly invoke ng-packagr for `packages/ng` while using tsup elsewhere | Low | Each package's own `build` script encapsulates its tool choice; root orchestration (`pnpm -r --if-present run build`) is already tool-agnostic | Implementation |
| Maintenance burden (second build/test toolchain in the monorepo) | Contributors need Angular-specific tooling knowledge in addition to the existing tsup/Vitest stack | Medium (accepted trade-off) | Documented clearly in `packages/ng/README.md`; inherent to supporting a real Angular framework | N/A — accepted |
| Future Angular upgrades | Covered above | — | — | — |
| Future React/Vue symmetry | Decisions made here (single-package-per-entrypoint shape, UIX-delegation pattern for styles) should be checked for reusability when Phase 3/4 begin | Low | This spec's Styling Strategy/Ownership Boundaries sections are written framework-agnostically where possible, for Phase 3/4 authors to reference | Start of Phase 3 |

## Decisions vs Open Questions

### Already decided (Blueprint / Phase 0 / Phase 1, unchanged)

- No Prime runtime dependency (ADR-004).
- MIT-only incorporation (ADR-005).
- UltimateUIX must remain framework-neutral; dependency direction is one-way (`PACKAGE_ARCHITECTURE.md`).
- Independent package versioning (ADR-003).
- Provenance model: `PROVENANCE.md` + file-level JSON manifests (Phase 1 precedent).

### Phase 2 decisions (made in this spec, approved by user)

- Baseline is PrimeNG `21.1.9`, not the brief's stated `17.18.15` (documented deviation).
- Close-derivation architecture (Option A): retain PrimeNG's internal architecture, rename the public API.
- Ultimate-first API rename applied now (selectors, class names, CSS classes, import paths).
- Phase 2 pilot scope: `Button`, `Ripple`, `AutoFocus` only, fully migrated; full inventory classified but not implemented.
- Single package `@ultimate/ng`, not split into `ng-core`/`ng-components`; `packages/ng-core/` scaffold removed.
- Standalone-only; no NgModule exports.
- Build via ng-packagr directly, not full Angular CLI workspace.
- Testing via Vitest + Angular Testing Library, not Karma/Jasmine.
- Angular upgrade strategy: independent tracking with deliberate lag.
- Style architecture: per-component style content lives in `@ultimate/uix-styles/<component>` (not duplicated inside `@ultimate/ng`); `@ultimate/ng` owns only the Angular-specific style-adapter/class-resolver layer.

### Open questions (requiring resolution during implementation)

- Exact renamed directive selectors for `Ripple`/`AutoFocus` (policy fixed: Ultimate-prefixed; exact string not fixed).
- Whether `@angular/cdk`, `@angular/forms`, `@angular/router`, `@angular/platform-browser` belong in Phase 2's actual peer dependency set or can be deferred until a component that needs them lands (verified source shows the pilot set doesn't use them directly, but `PrimeNG`'s package.json peer list includes them at the whole-package level).
- Icon scoping (`icons/` classification) — deferred as "Needs Architecture Decision," not resolved here.
- `api/`, `config/`, `dom/` full-surface scoping — deferred as "Needs Architecture Decision."
- Whether `validate-provenance.mjs`'s file-discovery logic needs extension to generically find any `docs/architecture/provenance/*.json`, or whether it's hardcoded to the four Phase 1 filenames (to confirm by reading the script during implementation).
- Exact mechanism for extending `adapt-imports.mjs` vs. writing a sibling script for the Ultimate API rename transformation (selector/class-name/CSS-class rewriting is a different shape of transformation than import-specifier rewriting).

### Deferred decisions (explicitly postponed)

- Overlay architecture implementation (responsibility split fixed; no code/component design beyond that).
- Forms/CVA implementation details.
- Data component (Table/Tree/etc.) architecture.
- Full accessibility audit beyond the pilot set.
- SSR/hydration verification beyond the pilot set (which has no SSR-sensitive logic).
- Migration/codemod tooling from PrimeNG.
- Storybook architecture changes.
- Theme layer (Phase 5, per Blueprint).

## Phase Exit Criteria

- `@ultimate/ng` package builds cleanly via ng-packagr from a clean checkout.
- `UButton`, `Ripple`, `AutoFocus` have complete provenance (`docs/architecture/provenance/ng.json`).
- Zero forbidden Prime runtime dependencies (`ceiling:validate` passes).
- Angular peer dependency policy is explicit in `package.json`.
- Component tests, accessibility tests, package/export tests, dependency-boundary tests all pass.
- Build passes from a clean checkout (`pnpm install && pnpm -r run build && pnpm -r run test`).
- `UButton` integrates successfully with `@ultimate/uix-styled`/`@ultimate/uix-styles` (styling infrastructure is consumed, not duplicated).
- Performance baseline recorded for `@ultimate/ng/button`.
- `README.md` documentation exists for `UButton`.
- Full ~140-area component inventory classification is documented (even though only 6 areas are implemented).
- `docs/architecture/PACKAGE_ARCHITECTURE.md` and `DECISIONS.md` updated to reflect Phase 2's actual decisions (single-package model, baseline correction, API rename policy).

## Non-Goals (restated for implementation-plan authors)

- No React or Vue implementation.
- No corporate/custom theme implementation (Phase 5).
- No CLI, MCP, Skills, or AI runtime integration.
- No public npm publish or GitHub public release.
- No automatic Prime synchronization mechanism.
- No arbitrary API redesign beyond the namespace rename decided in this spec (internal architecture — signals, `OnPush`, `Bind` passthrough, standalone — is retained, not redesigned).
- No arbitrary selector renaming beyond the fixed Ultimate-first policy (i.e., don't also invent a *different* new naming scheme later in the same phase).
- No migration of the full PrimeNG component inventory — only `Button`/`Ripple`/`AutoFocus`.
- No speculative performance rewrites — only measurement.
- No overlay, forms, or data-component implementation (all explicitly deferred).
- No Storybook architecture redesign.
- No migration tooling (codemods, aliasing) from PrimeNG.
