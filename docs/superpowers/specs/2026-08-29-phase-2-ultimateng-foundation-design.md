# Phase 2 — UltimateNG Foundation & Angular Component Framework

**Status:** Draft for review
**References:** `ULTIMATE_PLATFORM_BLUEPRINT.md` (v0.1), `docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md`, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`, `docs/architecture/{PROVENANCE,DEPENDENCIES,COMPATIBILITY,PACKAGE_ARCHITECTURE,DECISIONS}.md`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document. No component migration begins until this specification is reviewed and approved.

---

## Context

Phase 0 pinned and verified the PrimeNG MIT baseline. Phase 1 turned four `@primeuix/*` packages into `@ultimate/uix-{utils,styled,styles,motion}` — framework-neutral, independently buildable, zero Prime runtime dependency. `packages/ng/` and `packages/ng-core/` exist only as stubs (`THIRD-PARTY-NOTICES.md` and `.gitkeep` respectively); no Angular source has been incorporated.

### Correction to the task brief: PrimeNG baseline is 21.1.9, not 17.18.15

The task brief that requested this specification states the PrimeNG baseline as `17.18.15`. **This is incorrect and is superseded by the repository's own authoritative state.** Verified directly in this investigation:

- `ULTIMATE_PLATFORM_BLUEPRINT.md` §7: "PrimeNG `21.1.9` is the initial baseline candidate."
- `docs/architecture/PROVENANCE.md`: `Source version: 21.1.9`, `Source commit SHA: c493b1c6d9f7cdffbe1c4dc195493dd73d733593`.
- `docs/architecture/COMPATIBILITY.md`: `PrimeNG | Production Baseline | 21.1.9 | c493b1c6... | MIT`.
- `packages/ng/THIRD-PARTY-NOTICES.md`: "This package will incorporate source derived from `primeng@21.1.9`."
- `.vendor-cache/primeng-21.1.9.tar.gz`: a full monorepo tarball rooted at `primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/`, confirming the commit SHA independently.

No `17.18.15` baseline, provenance record, or vendor artifact exists anywhere in the repository. Per this session's explicit confirmation, **this specification uses `21.1.9` throughout**, matching Phase 0's approved baseline. This is not treated as a Blueprint deviation — it is a correction of stale text in the task brief against an already-decided, already-approved Phase 0 baseline.

### Key investigation finding: PrimeNG 21.1.9 targets Angular ^21.0.7, not an older Angular line

Verified directly from `.vendor-cache/primeng-21.1.9.tar.gz`, file `packages/primeng/package.json`:

```json
"peerDependencies": {
  "@angular/cdk": "catalog:angular21",
  "@angular/common": "catalog:angular21",
  "@angular/core": "catalog:angular21",
  "@angular/forms": "catalog:angular21",
  "@angular/router": "catalog:angular21",
  "@angular/platform-browser": "catalog:angular21",
  "rxjs": "^6.0.0 || ^7.8.1"
}
```

The workspace's `pnpm-workspace.yaml` resolves `catalog:angular21` to `@angular/core: ^21.0.7`, `typescript: 5.9.3`. This matches `docs/architecture/COMPATIBILITY.md`'s existing record (`Angular: ^21.0.7 and up`). Angular 21 is a current-generation release: standalone components are the default authoring model, signals and the modern control-flow syntax (`@if`/`@for`) are stable, and NgModule-based authoring is legacy. This materially changes the shape of Phase 2 relative to an older-Angular assumption — there is no NgModule-compatibility question to litigate; standalone is simply what a from-scratch 2026 Angular library looks like.

### Key investigation finding: PrimeNG's vendored source is a real, verifiable git snapshot — unlike Phase 1's PrimeUIX case

Phase 1's ADR-016 (sourcemap extraction) was necessitated by a specific problem: the `@primeuix/*` npm tarballs shipped only compiled `dist/` output with no `src/`, and the upstream `primeuix` repository's git history never reached the pinned versions. **Neither problem exists for PrimeNG.** `.vendor-cache/primeng-21.1.9.tar.gz` is a full GitHub archive of the real monorepo at commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` (confirmed: the tarball's root directory is literally named `primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/`), containing genuine `.ts` source files, per-component `ng-package.json` files, and `.spec.ts` test files under `packages/primeng/src/<component>/`. Phase 2's vendoring mechanism is therefore simpler than Phase 1's: **direct extraction from the pinned, checksummed tarball**, with no sourcemap recovery step required.

### Key investigation finding: component-level import graph, verified from real source

To ground the migration-sequencing and package-boundary questions in fact rather than assumption, this investigation extracted and read the actual `.ts` import statements for a representative slice of PrimeNG 21.1.9's ~100 source areas (full list in Component Inventory, below). Verified foundation chain:

```text
base → basecomponent (uses @primeuix/styled's ThemeService, @primeuix/utils)
basecomponent → basemodelholder → baseeditableholder
bind (near-zero deps: cn, equals from @primeuix/utils)
api (shared types/interfaces: MenuItem, TreeNode, TooltipOptions, etc. — no component deps)
```

Verified proof-set component dependencies:

```text
ripple     → basecomponent
autofocus  → basecomponent, dom
fluid      → basecomponent, bind
inputtext  → basemodelholder, bind, fluid, basecomponent
checkbox   → baseeditableholder, bind, api
button     → basecomponent, bind, ripple, autofocus, badge, fluid, api, icons(SpinnerIcon)
tooltip    → basecomponent, bind, dom(ConnectedOverlayScrollHandler), api, utils(ZIndexUtils)
dialog     → basecomponent, bind, button, focustrap, motion(@primeuix/motion), dom, utils, api, icons
```

Notable, non-obvious findings from this data:

- **Button transitively requires Badge.** `button.ts` imports `BadgeModule` from `primeng/badge`. Any Phase 2 scope that includes Button must also migrate Badge (or stub it), whether or not Badge was independently prioritized.
- **Tooltip does not use Angular CDK for overlay positioning.** It computes position manually via `@ultimate/uix-utils`-equivalent DOM helpers (`getViewport`, `getWindowScrollLeft`, `getOuterWidth`, etc.) and manages its own z-index via `ZIndexUtils`. No `@angular/cdk` import appears anywhere in the Button/InputText/Checkbox/Tooltip dependency closure. CDK is a PrimeNG peer dependency at the package level but is not exercised by this phase's proof set.
- **Dialog is substantially heavier than Tooltip** as an overlay proof case: it additionally requires FocusTrap, `@primeuix/motion` integration, and a nested Button dependency. This directly informed the proof-set selection below.

---

## Objective

Establish `@ultimate/ng-core` and `@ultimate/ng` as the first framework-specific Ultimate packages: an Ultimate-owned Angular component framework, architecturally independent of PrimeNG's internal design, built on `@ultimate/uix-*`, validated end-to-end against a small representative component set. This is a foundation-and-proof phase, not a full-catalog migration.

---

## Scope

**In scope:** `@ultimate/ng-core` (foundation), `@ultimate/ng` (components), a 4-component proof set (Button, InputText, Checkbox, Tooltip) plus their verified transitive dependencies, full PrimeNG component inventory and migration classification, provenance mechanism, build/test tooling decisions, dependency-boundary CI extension, styling integration with `@ultimate/uix-styles`, accessibility/forms/overlay architecture for the proof set specifically.

**Out of scope (explicit non-goals, deferred to later phases):** migrating any PrimeNG component beyond the proof set; React/Vue implementations; corporate theme implementation; CLI/MCP/Skills/AI implementation; public npm publishing; Angular CDK adoption (not exercised by the proof set — revisit when a CDK-dependent component is migrated); automated Prime synchronization; selector-compatibility/migration tooling; NgModule support; Dialog, FocusTrap, or `@primeuix/motion`-integrated components (deferred — Dialog specifically requires all three and is heavier than this phase's proof case).

---

## Angular Baseline

**Decision: Angular `^21.0.7`, TypeScript `5.9.3`, standalone-only, no NgModule support.**

This is not a speculative "target the newest version" choice — it is the exact peer range PrimeNG 21.1.9 itself declares and the exact version the pnpm catalog resolves to (see Context, above). Angular 21's own direction already treats standalone as the default and NgModule as the legacy path; PrimeNG 21.1.9 is itself built standalone-first. Adopting anything older than Angular 21 would mean deliberately diverging from the verified, pinned baseline for no demonstrated reason; adopting anything newer would mean moving ahead of the reference implementation's own tested range before Phase 2 has validated the current one.

- **Supported range:** `@angular/core@^21.0.7` and compatible `@angular/{common,forms,platform-browser}` at the same catalog range. `@angular/cdk` is **not** a Phase 2 runtime or peer dependency — it is not exercised by the proof set (verified above) and is not manufactured as a dependency ahead of a component that actually needs it (YAGNI; revisit when scope expands to a CDK-dependent component, e.g. the newer Select/DatePicker/OverlayPanel-style components).
- **TypeScript:** `5.9.3`, matching the pinned catalog.
- **Standalone components:** the sole authoring model. Every component, directive, and pipe in `@ultimate/ng-core` and `@ultimate/ng` is a standalone class with its own `imports` array. No `NgModule` is authored, exported, or documented as a migration path.
- **NgModule support:** explicitly **not provided**, not as a compatibility shim, not as a future placeholder. There is no existing UltimateNG consumer base to justify the double-API maintenance burden, and Angular's own ecosystem direction makes NgModule support a depreciating investment.
- **Signals / modern control flow:** not required by the proof set's actual PrimeNG source (verified: Button/InputText/Checkbox/Tooltip use classic `@Input()`/`@Output()` decorators and RxJS-based reactivity in the 21.1.9 baseline, not Angular signals). Phase 2 does not force a signals rewrite during migration — that would be a "speculative performance rewrite" (explicit non-goal). Signal-based APIs may be evaluated in a later phase once the current architecture is proven.
- **SSR/hydration:** not exercised by the proof set (none of Button/InputText/Checkbox/Tooltip perform SSR-unsafe operations at class-construction time; Tooltip's DOM measurement happens on user interaction, not initialization). Full SSR validation is deferred to a phase where a genuinely SSR-sensitive component (e.g. an overlay opened on page load, or a virtualized list) is migrated.

### Angular Upgrade Strategy

**Decision: Ultimate tracks Angular independently, on its own schedule, with deliberate lag — not tied to PrimeNG's release cadence.**

Per Blueprint §13 ("Angular compatibility is an Ultimate responsibility") and §12 ("no automatic dependency" on Prime's roadmap), UltimateNG evaluates each new Angular major once it is GA and stable, on Ultimate's own roadmap, independent of whether or when PrimeNG itself upgrades. A compatibility window is recorded per Ultimate release in `docs/architecture/COMPATIBILITY.md`, extending the existing table format. This avoids re-coupling Ultimate's release cadence to an upstream project — the same reasoning already applied to Phase 0/1's "no continuous Prime sync" policy (ADR-013).

---

## Critical Architectural Question: Depth of Ownership

**Decision: Option B — Ultimate establishes its own internal Angular component architecture. PrimeNG is a behavioral reference during migration, not a structural template.**

Analysis:

| Dimension | Option A (close PrimeNG-derived) | Option B (Ultimate-owned architecture) — **chosen** |
|---|---|---|
| Ownership | Superficial — Prime's base-class/DI/lifecycle decisions persist indefinitely under an Ultimate label | Real — Ultimate controls its own foundation, can evolve it without upstream constraint |
| API control | Constrained by Prime's internal shape leaking through the public surface | Full control; internal shape never dictates public API |
| Maintainability | Every future fix must reason about Prime's original design intent | Ultimate's own conventions are self-consistent and documented once |
| Angular upgradeability | Inherits Prime's upgrade posture and any technical debt in its lifecycle integration | Ultimate designs lifecycle integration against the pinned Angular 21 baseline directly, no inherited assumptions from Prime's own multi-version compatibility compromises |
| Accessibility | Inherits Prime's a11y implementation as-is, including any latent defects | Ultimate reviews and re-implements a11y-critical logic with its own test coverage, catching defects during migration (see Accessibility, below) |
| Performance | Inherits Prime's change-detection/rendering choices without re-evaluation | Ultimate measures and can diverge if a real bottleneck is found (not speculative) |
| Security | Inherits Prime's DOM/sanitizer assumptions | Ultimate reviews DOM-manipulation code during migration, not merely copies it |
| Developer experience | Prime's naming/patterns may not match Ultimate's broader (React/Vue) conventions | Ultimate can establish naming/patterns consistent across future framework phases |
| Future React/Vue symmetry | No shared internal-architecture vocabulary — each framework re-derives its own patterns from its own Prime source independently | Establishes a pattern (base-component/model-holder/editable-holder split, DI-token conventions) that Phase 3/4 can consciously mirror or consciously diverge from, rather than each phase reinventing structure from a different Prime codebase |
| Provenance | Simpler to trace 1:1 to Prime source | Still fully traceable — file-level provenance tracks origin regardless of how much the destination is restructured (Phase 1 precedent) |
| Ability to diverge from Prime | Low — structural coupling makes future divergence expensive | High — Ultimate's foundation is free to evolve independently from day one |
| Long-term sustainability | Accumulates hidden coupling to a frozen, unmaintained upstream (Blueprint §12: no continuous Prime sync) | Sustainable — Ultimate's foundation is designed for Ultimate's own long-term roadmap |

This matches Blueprint §2.2 ("must not blindly preserve Prime architecture") and §2.4 ("must not force a single rendering implementation") in spirit — even within Angular alone, blind structural preservation forecloses the ownership the Blueprint requires. The cost is real: Option B requires genuine design work in `ng-core` rather than a mechanical port. This is accepted as the correct tradeoff given the Blueprint's explicit ownership principle (§2.1, §11) and is not "choosing the harder path for its own sake" — PrimeNG's own base-component pattern (a `BaseComponent` → `BaseModelHolder` → `BaseEditableHolder` inheritance chain, verified from real source) is architecturally sound, and Ultimate's version is expected to closely resemble it in concept while being independently authored, documented, and owned rather than copied.

**What "Ultimate-owned architecture" means concretely in Phase 2:**

- `ng-core` defines Ultimate's own base classes (working names: `UltimateBaseComponent`, `UltimateBaseModelHolder`, `UltimateBaseEditableHolder` — exact naming is an implementation-plan detail, not fixed here), independently authored against Angular 21's current APIs, informed by PrimeNG's proven lifecycle/DI/theme-integration patterns but not copy-pasted.
- Where PrimeNG's approach is already sound and framework-idiomatic (e.g. constructor-based DI, `OnInit`/`OnDestroy` lifecycle usage, a shared theme-service injection point), Ultimate's version follows the same proven shape — this is "minimal reinvention" (Blueprint §2.8), not reinvention for its own sake.
- Where PrimeNG's approach reflects multi-version-Angular compromises no longer relevant at Angular 21 (if any are found during actual implementation), Ultimate's version does not inherit them.

---

## PrimeNG Source Scope

Classification of major source areas, per the required RETAIN/ADAPT/REFACTOR/REPLACE/REMOVE/EXTERNAL/DEFER taxonomy:

| Source area | Classification | Rationale |
|---|---|---|
| `basecomponent`, `basemodelholder`, `baseeditableholder` | **ADAPT** | Structural pattern retained (proven, Blueprint §2.8), reimplemented as Ultimate's own base classes in `ng-core` per the Critical Architectural Question decision above. Not verbatim RETAIN (internal naming/DI conventions become Ultimate's own), not REFACTOR (no behavioral redesign), not REPLACE (no reason to invent a different pattern). |
| `bind` (directive) | **ADAPT** | Small, proven utility directive (class/attribute binding helper); adapted into `ng-core` with Ultimate naming. |
| `api` (shared types/interfaces) | **ADAPT** | Type-only module (`MenuItem`, `TreeNode`, `TooltipOptions`, etc.) — retained conceptually, Ultimate-named, only the subset needed by the proof set is migrated now (`TooltipOptions` and whichever types Button/InputText/Checkbox actually reference); the rest is inventoried but not incorporated (see Component Inventory). |
| `button`, `inputtext`, `checkbox`, `tooltip` (proof-set components) | **ADAPT** | Component behavior/logic retained and validated against Prime's own `.spec.ts` tests as a correctness reference; template, selector, class names, and public API are Ultimate's own per the selector-strategy decision below. |
| `ripple`, `autofocus`, `fluid`, `badge` (proof-set transitive deps) | **ADAPT** | Same treatment as proof-set components — each is migrated because a proof-set component genuinely imports it, not speculatively. |
| Overlay infrastructure (`overlay`, `dynamicdialog`, `dock`, generic positioning helpers) | **DEFER** | Not exercised by the proof set (Tooltip does its own lightweight positioning without the shared `overlay` module — verified above). Revisit when a component that genuinely needs shared overlay infrastructure (Dialog, Popover, Select) is migrated. |
| `focustrap` | **DEFER** | Needed by Dialog, not by the current proof set. |
| `motion` module (PrimeNG's Angular wrapper around `@primeuix/motion`) | **DEFER** | Needed by Dialog and other transition-driven overlays, not by the current proof set. `@ultimate/uix-motion` (Phase 1) already exists and is ready to be consumed whenever this is picked up. |
| Icons (`icons/*`, ~90 individual icon components) | **DEFER, partial ADAPT** | Only the specific icons the proof set actually imports (`SpinnerIcon` for Button's loading state) are migrated now. The remaining ~89 icon components are inventoried as **LATER PHASE**, migrated alongside whichever component first needs each one — avoids importing an entire icon library speculatively (YAGNI). |
| Accessibility utilities (focus management helpers inside `@primeuix/utils`'s `dom` module) | **EXTERNAL** | Already retained verbatim in `@ultimate/uix-utils` (Phase 1) — `focus`, `getFirstFocusableElement`, `getLastFocusableElement` are consumed from there, not re-implemented in `ng-core`. |
| Forms integration (`ControlValueAccessor` patterns embedded in `basemodelholder`/`baseeditableholder`) | **ADAPT** | Part of the base-class ADAPT decision above; see Forms Architecture, below. |
| Animation integration | **EXTERNAL / DEFER** | Framework-neutral orchestration already lives in `@ultimate/uix-motion` (Phase 1, EXTERNAL to this phase); PrimeNG's Angular-side wrapper around it is DEFERRED (not needed by the proof set). |
| Style integration (`dt()`/`t()` token resolution, stylesheet registration) | **EXTERNAL** | Already retained in `@ultimate/uix-styled` (Phase 1). `ng-core`'s `BaseComponent`-equivalent injects and calls into it; no reimplementation. |
| Shared utilities (`dom`, `utils` z-index management, `classnames`, etc.) | **EXTERNAL** | Already retained in `@ultimate/uix-utils` (Phase 1). Consumed directly, never reimplemented in `ng-core`/`ng`. |
| Ripple's CSS keyframes / component-specific style modules | **ADAPT** | Migrated into `@ultimate/uix-styles` alongside each owning component (Button's, InputText's, Checkbox's, Tooltip's, Ripple's, AutoFocus's, Fluid's, and Badge's respective `uix-styles` modules — 8 modules total), per the Styling Strategy decision below. |
| All other ~90 component/directive/utility source areas not listed above | **DEFER (LATER PHASE)** | Full classification recorded in Component Inventory, below. |

---

## UltimateUIX Relationship & Ownership Boundaries

Confirmed, unchanged from Blueprint §6 and Phase 1's established boundary — this phase does not renegotiate it:

```text
Framework Components (packages/ng)
        ↓
Framework Core (packages/ng-core)
        ↓
UltimateUIX (packages/uix-{utils,styled,styles,motion})
```

`@ultimate/ng-core` and `@ultimate/ng` may depend on `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles`. (`@ultimate/uix-motion` is a valid dependency in principle but has zero actual consumers in this phase's proof set — not imported speculatively.) UIX packages continue to contain zero Angular imports, enforced by the existing `validate-boundaries.mjs` (already scans `packages/uix*`, requires no change).

**Duplicate-functionality audit** (PrimeNG code that overlaps UIX responsibility, classified per the required REMOVE/REPLACE WITH UIX/RETAIN taxonomy):

| PrimeNG functionality | UIX equivalent | Classification |
|---|---|---|
| DOM helpers used by `basecomponent`, `ripple`, `autofocus`, `tooltip` (`addClass`, `removeClass`, `getOuterWidth`, `getViewport`, `focus`, etc.) | `@ultimate/uix-utils` `dom` submodule | **REPLACE WITH UIX** — these are literally the same functions, already migrated verbatim in Phase 1. Angular source imports rewritten from `@primeuix/utils`/`primeng/dom` to `@ultimate/uix-utils`. |
| Z-index management (`ZIndexUtils`, used by Tooltip) | `@ultimate/uix-utils` `zindex` submodule | **REPLACE WITH UIX** |
| Theme/token resolution (`ThemeService`, `dt()`/`t()`, used by `basecomponent`) | `@ultimate/uix-styled` | **REPLACE WITH UIX** |
| CSS generation for base/global styles | `@ultimate/uix-styles` (`base` module, already migrated) | **REPLACE WITH UIX** |
| `mergeProps`/`cn`/`equals`/`isNotEmpty` (used throughout `basecomponent`, `bind`) | `@ultimate/uix-utils` `object`/`classnames`/`mergeprops` submodules | **REPLACE WITH UIX** |
| Component lifecycle wiring (`ngOnInit`, constructor DI, template binding) | none — inherently Angular-specific | **RETAIN FOR ANGULAR-SPECIFIC REASONS** |
| `ControlValueAccessor` implementation in `basemodelholder`/`baseeditableholder` | none — Angular Forms API is framework-specific | **RETAIN FOR ANGULAR-SPECIFIC REASONS** |
| Host binding / host listener declarations (e.g. Ripple's pointer-event handlers) | none — Angular decorator mechanism | **RETAIN FOR ANGULAR-SPECIFIC REASONS** |

No case was found in this investigation where PrimeNG maintains a duplicate implementation of something UIX already owns without a framework-specific reason — Phase 1's extraction was thorough enough that the overlap is clean.

---

## Package Architecture

**Decision: two packages, matching the already-approved Blueprint/Phase 0/1 structure exactly — `packages/ng-core` and `packages/ng`. No further fragmentation.**

This was already decided at the Blueprint level (§4, §5) and confirmed unmodified through Phase 0 (`PACKAGE_ARCHITECTURE.md`). Phase 2 does not revisit it — there is no demonstrated need for a third Angular package (e.g. a separate `ng-forms` or `ng-overlay` package) at this phase's scope, and inventing one now would be premature fragmentation.

### `@ultimate/ng-core`

| | |
|---|---|
| Purpose | Ultimate-owned Angular foundation: base component classes, model/editable-holder base classes, shared directives (`Bind`), shared type contracts (subset of `api`), DI token conventions, theme-service integration point |
| Public API | Base classes and types intended for `@ultimate/ng` (and, later, any Ultimate-authored Angular code outside the core catalog) to extend/consume — e.g. an Ultimate equivalent of `BaseComponent`, `BaseModelHolder`, `BaseEditableHolder`, the `Bind` directive, and the `TooltipOptions`-shaped type contracts the proof set needs |
| Internal API | None identified in this phase's scope — the base-class surface is small enough that everything exported is intentional public API for `@ultimate/ng` to consume |
| Dependencies | `@ultimate/uix-utils`, `@ultimate/uix-styled` |
| Peer dependencies | `@angular/core@^21.0.7`, `@angular/common@^21.0.7`, `@angular/forms@^21.0.7` (needed by the editable-holder's `ControlValueAccessor` contract), `rxjs@^7.8.1` |
| Exports | Single entry point (`.`) — the surface is small enough at this phase that subpath exports are not yet warranted (revisit if the surface grows materially in a later phase) |
| Build output | Angular Package Format via `ng-packagr` (see Build Strategy) |
| Side effects | `sideEffects: false` |
| Tests | Vitest + `@angular/core/testing` (`TestBed`) — base-class contract tests (lifecycle correctness, DI resolution, `ControlValueAccessor` conformance) |
| Ownership | Ultimate — architecture is Ultimate-authored (ADAPT classification per the Critical Architectural Question), file-level provenance still tracked back to the PrimeNG source areas that informed the design |

### `@ultimate/ng`

| | |
|---|---|
| Purpose | Actual Angular components: the Phase 2 proof set (Button, InputText, Checkbox, Tooltip) and their direct transitive dependencies (Ripple, AutoFocus, Fluid, Badge) |
| Public API | Standalone Angular components/directives with Ultimate selectors (`u-button`, `u-input-text`, `u-checkbox`, `u-tooltip` — exact final selector names are an implementation-plan detail within the `u-*` namespace, not fixed component-by-component here), Ultimate-named classes, inputs, and outputs |
| Internal API | Per-component internal helpers not intended for direct external use (mirroring PrimeNG's own private/internal module pattern where one exists, e.g. a component's internal style-class computation) |
| Dependencies | `@ultimate/ng-core`, `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles` |
| Peer dependencies | `@angular/core@^21.0.7`, `@angular/common@^21.0.7`, `@angular/forms@^21.0.7`, `rxjs@^7.8.1` |
| Exports | Subpath exports per component (`./button`, `./input-text`, `./checkbox`, `./tooltip`, `./ripple`, `./autofocus`, `./fluid`, `./badge`), matching PrimeNG's own per-component `ng-package.json` secondary-entry-point pattern — this is a proven Angular Package Format shape, not an Ultimate invention, and it is what makes tree-shaking per-component actually work for consumers |
| Build output | Angular Package Format via `ng-packagr`, one secondary entry point per component |
| Side effects | `sideEffects: false` |
| Tests | Vitest + `TestBed` — component rendering, inputs/outputs, forms (`ControlValueAccessor`), accessibility (keyboard/ARIA), Tooltip overlay positioning/dismissal |
| Ownership | Ultimate — components are ADAPT-classified (behavior/logic informed by Prime, public API and internals independently authored), file-level provenance tracked per component |

**No `ng-forms`, `ng-overlay`, or other subdivision package is created.** If a future phase's scope grows large enough to warrant it (e.g. once Dialog/Overlay/Select-family components are migrated), that is a decision for that phase, made against real evidence of a boundary problem — not manufactured now.

---

## Public API Strategy

**Decision: Ultimate namespace (`u-*` selectors, Ultimate class/input/output names) from day one. No interim PrimeNG-compatible (`p-*`) alias layer.**

Consequences of this choice, addressed explicitly per the brief's required analysis:

- **Selector changes:** `p-button` → `u-button` (exact prefix `u-` is adopted here as the working convention; final confirmation before any public release remains a pre-1.0 gate per Blueprint §10, unchanged). No dual-selector support.
- **Component class names:** PrimeNG's `Button`/`ButtonDirective`/`ButtonIcon`/`ButtonLabel` become Ultimate-named equivalents (e.g. `UButton` or `UltimateButton` — exact convention is an implementation-plan detail; consistency across the proof set matters more than the specific prefix chosen).
- **Inputs/outputs:** retained by name where PrimeNG's naming is already framework-idiomatic and has no Ultimate-specific reason to change (e.g. `label`, `icon`, `disabled` stay as-is); renamed only where Ultimate's own convention differs materially — no renaming for its own sake.
- **Injection tokens/services:** Ultimate-named DI tokens in `ng-core`, not re-exported PrimeNG tokens.
- **CSS classes:** the underlying `.p-*` CSS classes from `@ultimate/uix-styles` (inherited from Phase 1's `base` module and this phase's newly-migrated component style modules) are **retained verbatim for now** — Phase 1 already decided `.p-*` selector renaming is a pre-1.0, cross-cutting decision, not a per-phase one (Phase 1's Decisions vs Open Questions). Phase 2 does not selectively rename CSS classes for only its four components while leaving the rest of `uix-styles` unrenamed — that would create an inconsistent half-migrated state. The TypeScript-level public API (selectors, class names) is Ultimate's own; the CSS class layer beneath it is deferred as a unified cross-framework decision.
- **Template references / type names:** Ultimate-named throughout the TypeScript surface.
- **Import paths:** `@ultimate/ng/button`, not `primeng/button`.
- **Migration tooling:** none built in this phase (see Migration Compatibility, below) — there are no existing UltimateNG consumers to migrate.
- **Developer familiarity:** a real cost — engineers familiar with PrimeNG's `p-*` API must learn Ultimate's naming. Accepted as a one-time cost in exchange for avoiding a permanent compatibility-shim maintenance burden and for establishing real ownership from the first shipped component (Blueprint §10, §11).
- **Future React/Vue symmetry:** establishing Ultimate's own naming conventions now (rather than inheriting three different Prime naming conventions across three future framework phases) gives Phase 3/4 a real precedent to consciously follow or consciously diverge from.

**What must remain deferred:** the exact final `u-*` (vs. some other) prefix is not irreversibly locked by this phase — Blueprint §10 explicitly reserves "public naming must be decided before the first stable public release," and this phase's proof-set components are pre-1.0/unstable (consistent with Phase 1's own API-stability posture). `u-*` is adopted as the Phase 2 working convention, not as the final, unchangeable brand decision.

---

## Component Migration Strategy

Derived from the actual verified PrimeNG dependency graph (Context, above), not an assumed generic ordering:

```text
Foundation (ng-core)
  base → basecomponent → basemodelholder → baseeditableholder
  bind, api (subset)
        ↓
Primitive components (ng)
  ripple, autofocus, fluid, badge
        ↓
Form primitive (ng)
  inputtext, checkbox
        ↓
Interactive primitive with transitive deps (ng)
  button (needs ripple, autofocus, fluid, badge — all already migrated above)
        ↓
Overlay proof case (ng)
  tooltip (needs basecomponent, bind, dom/utils from UIX, api — no dependency on button/dialog/focustrap/motion)
```

This ordering is a direct consequence of the real import graph, not an assumed textbook layering — `button` is sequenced after its own dependencies (`ripple`/`autofocus`/`fluid`/`badge`) precisely because the source data shows it requires them, and `tooltip` is included as the overlay proof case specifically because it does **not** require the heavier `dialog`/`focustrap`/`motion` chain, keeping the proof set's overlay validation minimal but genuine (it does exercise real viewport-relative positioning and dismissal, unlike a non-overlay component).

**Dialog, FocusTrap, and PrimeNG's Angular `motion` wrapper are explicitly excluded from Phase 2**, deferred to a later phase specifically because they are heavier than what a proof set needs to validate the architecture end-to-end. `@ultimate/uix-motion` (Phase 1) is ready to be consumed whenever that later phase begins — no UIX-side work is blocking it.

---

## Component Inventory

Full classification of PrimeNG 21.1.9's source areas (enumerated directly from `packages/primeng/src/*` in the vendored tarball — 100 top-level directories, several containing further nested areas such as `icons/*` and `types/*`).

**Phase 2 (migrated now):**

| Component | Prime source path | Category | Dependencies | UIX dependencies | Migration phase | Risk |
|---|---|---|---|---|---|---|
| (foundation) `base`, `basecomponent`, `basemodelholder`, `baseeditableholder` | `src/{base,basecomponent,basemodelholder,baseeditableholder}` | Foundation | none (mutual chain only) | `uix-utils`, `uix-styled` | Phase 2 | Low — small, well-understood surface, but foundational (errors here affect every future component) |
| `bind` | `src/bind` | Foundation directive | none | `uix-utils` | Phase 2 | Low |
| `api` (subset: types the proof set references) | `src/api` | Shared types | none | none | Phase 2 (partial) | Low |
| `ripple` | `src/ripple` | Primitive directive | `basecomponent` | `uix-utils`, `uix-styles` (component style module) | Phase 2 | Low |
| `autofocus` | `src/autofocus` | Primitive directive | `basecomponent`, `dom` | `uix-utils` | Phase 2 | Low |
| `fluid` | `src/fluid` | Primitive directive | `basecomponent`, `bind` | `uix-utils` | Phase 2 | Low |
| `badge` | `src/badge` | Primitive component | (verify exact deps during implementation; referenced by `button` as `BadgeModule`) | `uix-utils`, `uix-styles` | Phase 2 | Low-Medium — pulled in as a dependency, not independently prioritized; its own dependency closure should be re-verified at implementation time |
| `inputtext` | `src/inputtext` | Form primitive | `basemodelholder`, `bind`, `fluid`, `basecomponent` | `uix-utils`, `uix-styles` | Phase 2 | Low |
| `checkbox` | `src/checkbox` | Form primitive | `baseeditableholder`, `bind`, `api` | `uix-utils`, `uix-styles` | Phase 2 | Medium — `ControlValueAccessor` correctness is the highest-value/highest-risk part of the proof set (see Forms Architecture) |
| `button` | `src/button` | Interactive primitive | `basecomponent`, `bind`, `ripple`, `autofocus`, `badge`, `fluid`, `api`, `icons`(`SpinnerIcon`) | `uix-utils`, `uix-styles` | Phase 2 | Medium — widest dependency fan-out in the proof set |
| `tooltip` | `src/tooltip` | Overlay | `basecomponent`, `bind`, `dom`, `api`, `utils`(`ZIndexUtils`) | `uix-utils`, `uix-styles` | Phase 2 | Medium-High — overlay positioning/dismissal is the highest-complexity behavior in the proof set, and the first real validation of Ultimate's overlay approach |
| `icons` (subset: `SpinnerIcon` only) | `src/icons/spinner` (and shared `src/icons/baseicon`) | Icon | `basecomponent` | `uix-utils` | Phase 2 (partial) | Low |

**Later Phase (dependency-adjacent to the proof set, deferred deliberately):**

| Component | Category | Why deferred |
|---|---|---|
| `dialog` | Overlay | Requires `focustrap` + `motion` + nested `button` — heavier than this phase's proof case; natural candidate for the next overlay-focused phase |
| `focustrap` | Accessibility utility | Needed only by `dialog` (and similar modal patterns) within the current investigation scope |
| `motion` (Angular wrapper around `@primeuix/motion`) | Animation integration | Needed only by `dialog`/transition-driven overlays; `@ultimate/uix-motion` is ready whenever this is picked up |
| `overlay`, `dynamicdialog`, `popover`, `drawer`, `contextmenu`, `speeddial` | Overlay | Share generic overlay/portal infrastructure not exercised by Tooltip's simpler positioning approach; a dedicated overlay-infrastructure design question belongs to that later phase |
| Remaining `icons/*` (~89 icon components) | Icon | Migrated per-consuming-component as each is picked up, not as a batch — avoids importing an unused icon catalog |
| `select`, `datepicker`, `multiselect`, `cascadeselect`, `autocomplete`, `treeselect`, `listbox`, `colorpicker`, `inputmask`, `inputnumber`, `inputotp`, `password`, `rating`, `slider`, `togglebutton`, `toggleswitch`, `radiobutton`, `selectbutton`, `editor`, `textarea`, `knob`, `keyfilter` | Form | Broader form-component category; natural "Form Components" phase per the Blueprint's staged migration example, not part of this phase's minimal proof set |
| `table`, `treetable`, `tree`, `scroller`, `dataview`, `paginator`, `orderlist`, `picklist`, `organizationchart`, `virtualscroller`-equivalent (`scroller`) | Data | High-complexity category (Blueprint §19); requires its own dedicated design pass (virtualization, selection, filtering, sorting state models) — explicitly not migrated automatically |
| `menu`, `menubar`, `megamenu`, `panelmenu`, `tieredmenu`, `breadcrumb`, `steps`, `stepper`, `tabs`, `toolbar` | Navigation | Natural "Navigation Components" phase |
| `accordion`, `card`, `panel`, `fieldset`, `divider`, `splitter`, `scrollpanel`, `blockui`, `inplace`, `skeleton`, `carousel`, `galleria`, `timeline`, `terminal`, `dock`, `organizationchart` | Layout/Display | Later phase, no proof-set dependency |
| `toast`, `message`, `confirmdialog`, `confirmpopup`, `progressbar`, `progressspinner`, `metergroup` | Feedback | Later phase |
| `avatar`, `avatargroup`, `chip`, `tag`, `image`, `imagecompare`, `overlaybadge`, `iconfield`, `inputgroup`, `inputgroupaddon`, `inputicon`, `floatlabel`, `iftalabel` | Display/Form-adjacent | Later phase, no proof-set dependency |
| `fileupload`, `dragdrop`, `colorpicker`, `chart`, `styleclass`, `scrolltop` | Utility/Specialized | Later phase |
| `config` (PrimeNG's global config service) | Configuration | Needs its own architecture decision — how Ultimate exposes global defaults/config is a cross-cutting question better resolved once more components exist to validate it against (classified **Needs Architecture Decision**) |
| `passthrough` (PrimeNG's "pass-through" prop escape-hatch pattern) | Cross-cutting API pattern | Classified **Needs Architecture Decision** — whether Ultimate adopts an equivalent extensibility mechanism is a public-API question affecting every future component, not resolvable from a 4-component proof set |
| `animateonscroll` | Utility | Not needed by proof set |

**Not Needed:**

| Component | Why |
|---|---|
| `usestyle` | PrimeNG-internal composition helper superseded by `@ultimate/uix-styled`'s own registration mechanism (Phase 1) |
| `classnames` (PrimeNG's own Angular-side wrapper, distinct from `@primeuix/utils`'s `classnames`) | Superseded by `@ultimate/uix-utils`'s `classnames` submodule directly |
| `ts-helpers` | Internal PrimeNG TypeScript utility types (e.g. `Nullable`, `VoidListener`); Ultimate defines its own equivalent minimal type-helper set in `ng-core` rather than porting PrimeNG's exact file |

**Needs Architecture Decision:** `config` (global configuration/defaults service), `passthrough` (extensibility escape hatch) — both flagged above, deliberately not resolved by this spec (see Open Questions).

This inventory covers all top-level `src/*` directories enumerated from the vendored tarball. Exhaustive per-file dependency verification for every "Later Phase" component is not performed in this spec — only the proof set and its direct/transitive dependencies were verified against real source, per the phase's actual scope.

---

## Component Style Strategy

**Decision: component styles migrate into `@ultimate/uix-styles`, one module per component, consumed by `@ultimate/ng` via `@ultimate/uix-styled`'s existing registration mechanism. No styling infrastructure is duplicated inside `@ultimate/ng` or `@ultimate/ng-core`.**

This directly extends Phase 1's own stated intent (Phase 1 spec, `uix-styles` package table: "~90 per-component style modules — classified LATER PHASE, migrated alongside each component (Phase 2/3/4)") — Phase 2 is the first phase to actually execute that plan, for exactly the 8 components/directives in its proof set (`button`, `inputtext`, `checkbox`, `tooltip`, `ripple`, `autofocus`, `fluid`, `badge`).

Architecture (matching the brief's required diagram exactly):

```text
UltimateNG component (packages/ng)
        ↓ imports and registers
UltimateUIX styling infrastructure (@ultimate/uix-styled: dt()/t() resolution, stylesheet service)
        ↓ resolves tokens against
UltimateNG component style (@ultimate/uix-styles/<component>: the CSS-in-JS template retained from @primeuix/styles)
```

Mechanics:

- Each proof-set component's corresponding `@primeuix/styles` module (e.g. `button/`, `inputtext/`, `checkbox/`, `tooltip/`, `ripple/`, `autofocus/`, `fluid/`, `badge/`) is extracted from the pinned tarball into `packages/uix-styles/src/<component>/`, following the exact subpath-export pattern the `base` module already established in Phase 1 (`exports["./*"]`).
- `@ultimate/uix-styles`'s scope-guard test (Phase 1, `packages/uix-styles/test/scope-guard.test.ts`) must be **updated, not removed** — Phase 1's guard asserted zero per-component modules existed; Phase 2 changes that assertion to "only the 8 named proof-set modules (plus `base`) exist," still failing the build if an unrelated 9th module is added without a corresponding component.
- Each `@ultimate/ng` component's `BaseComponent`-equivalent (inherited from `ng-core`) calls into `@ultimate/uix-styled`'s stylesheet registration service at component construction/initialization, passing its own `uix-styles` module's CSS template — mirroring PrimeNG's own `BaseComponent`/`BaseStyle` pattern, which this investigation confirmed already does exactly this (verified: `basecomponent.ts` imports `Base, BaseStyle` from `primeng/base` and `Theme, ThemeService` from `@primeuix/styled`).
- Token resolution (`dt()`/`t()`), CSS generation, and stylesheet injection/ordering remain entirely `@ultimate/uix-styled`'s and `@ultimate/uix-styles`'s responsibility — `ng-core`/`ng` never re-implement any of this, satisfying the brief's explicit "avoid recreating styling infrastructure inside UltimateNG" instruction.
- `.p-*` CSS class names inside the migrated style modules are retained verbatim in Phase 2 (see Public API Strategy — CSS-layer renaming is a deferred, cross-cutting, pre-1.0 decision, not a per-phase one).

---

## Overlay Architecture

Scoped strictly to what Tooltip (this phase's only overlay proof case) actually requires — a full shared overlay-infrastructure design (the brief's broader §17 concerns: append target, portal/dynamic rendering, backdrop, modal semantics) is explicitly deferred to the phase that migrates Dialog/Popover/Select-family components, where those concerns are actually load-bearing.

Verified from Tooltip's real source:

- **Positioning:** computed directly by the Tooltip component itself using `@ultimate/uix-utils`' `dom` submodule (`getViewport`, `getWindowScrollLeft`, `getWindowScrollTop`, `getOuterWidth`, `getOuterHeight`) — no shared "overlay service" is involved. This is a **component responsibility**, not a `ng-core` or UIX responsibility, for this specific component.
- **Append target:** verified from source — Tooltip appends its element via `appendChild`/`createElement` from `@ultimate/uix-utils`, targeting the document body (or a configurable target) directly, not through a shared portal abstraction. **Component responsibility.**
- **Z-index:** managed via `@ultimate/uix-utils`' `zindex` submodule (`ZIndexUtils`), already Ultimate-owned since Phase 1. **UIX responsibility**, consumed by the component.
- **Scroll/viewport handling:** Tooltip uses a `ConnectedOverlayScrollHandler` pattern (verified import from `primeng/dom`) to reposition or dismiss on scroll. This specific helper is not yet part of `@ultimate/uix-utils`'s Phase 1 scope (Phase 1 retained the `dom` module's ~90 files, but this investigation did not confirm `ConnectedOverlayScrollHandler` specifically was among them) — **this must be verified during implementation**, and if absent, it is migrated into `@ultimate/uix-utils` as an addition to the `dom` submodule (it is framework-neutral DOM/scroll-event logic, not Angular-specific), not into `ng-core`/`ng`.
- **Dismissal (click-outside, escape key):** verified as component-level event binding (host listeners) in Tooltip's own source — **component responsibility**, using Angular's own `HostListener`/event-binding mechanism, no shared dismissal service needed for this component.
- **Motion:** Tooltip's enter/leave uses a `fadeIn` helper (verified import from `@ultimate/uix-utils`, not `@ultimate/uix-motion`) — simpler than Dialog's full `@primeuix/motion`-based transition orchestration. **UIX responsibility** (already Phase 1 scope), no `@ultimate/uix-motion` dependency needed for this component.
- **SSR/hydration:** Tooltip's DOM measurement and positioning happen on user interaction (`mouseenter`/`focus`), not at construction time — SSR-safe by the same reasoning already established for `@ultimate/uix-utils` in Phase 1 (import-time safe, call-time is a framework-package/component concern).

**Deferred to the Dialog-and-beyond phase:** shared portal/dynamic-component-rendering abstraction, backdrop management, modal focus-trap integration, generic append-target configuration shared across multiple overlay components. Building this shared infrastructure now, against a single component that doesn't need most of it, would be premature abstraction (Blueprint §2.8, this session's own KISS/YAGNI operating constraints).

---

## Forms Architecture

Scoped to what InputText and Checkbox (the proof set's two form primitives) actually require.

- **`ControlValueAccessor`:** both components implement Angular's standard `ControlValueAccessor` interface, inherited from `ng-core`'s `BaseModelHolder`/`BaseEditableHolder`-equivalent base classes (per the ADAPT classification decided above). This is genuinely Angular-specific and belongs in `ng-core`, not UIX.
- **Validation:** delegated entirely to Angular's own `Validators`/`FormControl` mechanism — Ultimate does not build a custom validation layer. PrimeNG's own source confirms this same delegation (no custom validation engine found in `checkbox`/`inputtext`).
- **Disabled state:** propagated via the standard `setDisabledState` `ControlValueAccessor` hook, verified present in PrimeNG's `baseeditableholder`.
- **Touched/dirty state:** standard Angular Forms behavior via `registerOnTouched`/`registerOnChange`, no custom tracking needed.
- **Error presentation:** **not part of this phase's scope.** PrimeNG's error/validation-message presentation (if any exists at the InputText/Checkbox level specifically — not confirmed as a proof-set concern) is deferred; this phase validates the CVA *mechanism* works correctly, not a full form-field error-display pattern (that likely belongs with a dedicated `FormField`/`FloatLabel`-style component in a later phase).
- **Form field semantics (ARIA `aria-invalid`, `aria-describedby` linkage to error text):** deferred alongside error presentation, for the same reason — no error UI exists yet to link to.

This is the highest-risk correctness surface in the proof set (per the Component Inventory's risk rating for `checkbox`) precisely because `ControlValueAccessor` bugs are easy to introduce silently (a component that renders correctly but doesn't correctly propagate value changes to a parent `FormControl`) — this drives the explicit CVA-conformance test requirement in Testing Strategy, below.

---

## Data Component Strategy

**Not applicable to Phase 2's scope.** None of Table, TreeTable, Tree, VirtualScroller/Scroller, or Paginator are part of the proof set (see Component Inventory — all classified Later Phase, category "Data"). This phase does not investigate their performance/virtualization/selection architecture in depth; that investigation belongs to the dedicated Data Components phase the Blueprint's own staged-migration example anticipates (§10 of the task brief, §32 of the Blueprint).

---

## Dependency Rules

Restated and confirmed unchanged from Phase 0/1, extended to cover the new packages:

- `packages/ng` and `packages/ng-core` must not declare a runtime dependency on `primeng`, `primevue`, `primereact`, or any `@primeuix/*` package (ADR-004).
- `packages/ng`/`packages/ng-core` may depend on `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles` (and, when a future component needs it, `@ultimate/uix-motion`).
- `@angular/*` and `rxjs` remain external peer dependencies — never vendored (consistent with Phase 0's "must remain external" classification for framework packages generally).
- **CI validator status, verified against actual script content in this investigation:** `scripts/provenance/validate-dependency-ceiling.mjs` already includes `"ng"` in its `WATCHED_PREFIXES` array (confirmed by reading the script directly — `const WATCHED_PREFIXES = ["uix", "ng", "react", "vue"];`) and already forbids direct `primeng`/`primevue`/`primereact` dependencies. **No change to this script is required for Phase 2** — it was already extended in anticipation, evidently during Phase 0/1 implementation. This must be re-verified at Phase 2 implementation time (a script can drift between this spec and implementation), but no deviation from Phase 0/1's boundary policy is needed.
- `scripts/provenance/validate-boundaries.mjs` (framework-import boundary check) currently scans `packages/uix*` for framework imports. It does **not** currently need a symmetric check for `packages/ng*` containing React/Vue imports — no such cross-framework leakage is architecturally possible from `ng`/`ng-core`'s dependency graph, but adding a defensive check (packages/ng* must contain zero `react`/`vue` imports) is a cheap, low-risk CI addition worth making explicit as a Phase 2 deliverable, extending the existing script rather than writing a new one.

---

## Provenance

**Decision: direct tarball extraction, checksum-verified — not sourcemap recovery.**

Unlike Phase 1's `@primeuix/*` packages, `.vendor-cache/primeng-21.1.9.tar.gz` is a genuine, verifiable GitHub archive at a real, confirmed commit SHA (`c493b1c6d9f7cdffbe1c4dc195493dd73d733593` — independently corroborated by the tarball's own root directory name, not merely trusted from `PROVENANCE.md`'s existing record). Real `.ts` source exists directly under `packages/primeng/src/<component>/`, alongside each component's own `.spec.ts` test file. No sourcemap recovery step (Phase 1's ADR-016) is needed or appropriate here — using it would add unnecessary complexity where the real source is already present.

Mechanism:

- A new extraction script (`scripts/provenance/extract-primeng-source.mjs`, or an extended version of Phase 1's `extract-source.mjs` — exact script consolidation is an implementation-plan detail) reads `.vendor-cache/primeng-21.1.9.tar.gz` directly, extracts `packages/primeng/src/<component>/**` for each component in this phase's scope (foundation + `ripple`/`autofocus`/`fluid`/`badge`/`inputtext`/`checkbox`/`button`/`tooltip` + the `SpinnerIcon`/`baseicon` subset), and writes into a staging tree (`.vendor-extracted/ng/`, gitignored, regeneratable from the same checksummed tarball — no network access required), matching Phase 1's established reproducibility model.
- Adaptation happens from the staged extraction tree into `packages/ng-core/src/` and `packages/ng/src/<component>/` — this is where ADAPT-classified files get Ultimate naming, restructured base-class inheritance (per the Critical Architectural Question decision), rewritten imports (`@primeuix/utils`/`primeng/dom` → `@ultimate/uix-utils`, etc.), and a provenance header comment.
- **`docs/architecture/PROVENANCE.md` update:** the existing PrimeNG entry (added in Phase 0) gets its `Modification status` and `Date incorporated` fields updated from "not yet incorporated" to the real Phase 2 state, and its `Ultimate destination` field (already correctly pre-filled as `packages/ng`, `packages/ng-core` in Phase 0's record) is confirmed accurate.
- **File-level manifest:** `docs/architecture/provenance/ng-core.json` and `docs/architecture/provenance/ng.json`, following Phase 1's exact established schema (`{ originalPath, ultimateDestination, modificationStatus, modificationDescription, sha256OfOriginal }`). Given this phase's ADAPT-heavy classification (base classes restructured, not verbatim-copied), most entries are expected to carry `modificationStatus: "adapted"` (a value not needed in Phase 1's mostly-verbatim RETAIN work — the manifest schema may need this value added; Phase 1's schema is a string enum, extending it is a compatible, non-breaking change).
- **`validate-provenance.mjs` extension:** the existing check (every `.ts` file under a Prime-derived `packages/*/src/` must have a manifest entry) is extended to also scan `packages/ng*/src/`.
- **Attribution:** `packages/ng/THIRD-PARTY-NOTICES.md` (already exists as a populated stub — verified in this investigation to already contain the correct MIT license text and the important `-lts`-suffix caveat) is confirmed accurate and left as-is; `packages/ng-core/THIRD-PARTY-NOTICES.md` (currently does not exist — `ng-core` is currently only a `.gitkeep` stub) is newly created, mirroring `packages/ng`'s content, since `ng-core`'s base classes are also PrimeNG-informed (ADAPT-classified) even though more heavily restructured than `ng`'s components.

**On PrimeNG's dual license structure:** `packages/ng/THIRD-PARTY-NOTICES.md` already correctly flags that PrimeNG's `LICENSE.md` is dual (MIT community vs. commercial `-lts`), and that `21.1.9` (no `-lts` suffix) uses the MIT section. This must be re-verified at Phase 2 implementation time per that same file's own instruction ("Any future PrimeNG version bump MUST re-verify") — no version bump is occurring in this phase, so the existing verification stands, but implementation should not skip re-confirming the tag has not been retroactively relabeled.

---

## Licensing

No new licensing question is introduced beyond what Phase 0/1 already resolved for PrimeNG generally:

- PrimeNG `21.1.9`'s MIT community-license section applies (confirmed, Phase 0 Finding 1, re-confirmed via direct tarball inspection in this investigation — no `-lts` suffix on the pinned tag).
- No bundled fonts/icon-asset licensing question arises from the proof set specifically — `SpinnerIcon` (the only icon migrated in this phase) is an inline SVG component, not a separate font/asset file, verified by its presence as a `.ts` file under `src/icons/spinner/`, not a binary asset.
- No new third-party dependency is introduced by the proof set beyond what Phase 1 already licensed (`@ultimate/uix-*`) and what Angular itself requires (already an accepted external peer dependency, Blueprint-level).
- The Phase 0 "LEGAL REVIEW REQUIRED" flag (re-publishing MIT-derived source at company scale) remains open and unresolved by this phase, as it was by Phase 1 — restated here for continuity, not re-litigated.

---

## Build Strategy

**Decision: `ng-packagr` (Angular's own official library packaging tool), not `tsup`, for `packages/ng` and `packages/ng-core` specifically.**

This is a deliberate, evidence-backed deviation from Phase 0/1's "plain pnpm + tsup" pattern (ADR-015 covers build *orchestration* — plain pnpm scripts — which is unaffected; this deviation is about the per-package build *tool*, not the monorepo-level orchestration). The deviation is justified per the Architectural Deviation Protocol:

**Finding:** PrimeNG 21.1.9 itself is built with `ng build primeng` (Angular CLI, backed by `ng-packagr`), using per-component `ng-package.json` secondary-entry-point configuration (verified: every one of the ~100 `packages/primeng/src/<area>/` directories contains its own `ng-package.json`). `tsup` (esbuild-based) has no Angular decorator/template compiler and cannot produce Angular Package Format output — it is not a viable alternative for compiling `@Component`/`@Directive`/`@Injectable` classes with templates.

**Impact:** Phase 2 needs Angular's own compiler toolchain (`@angular/compiler-cli`, invoked via `ng-packagr`/Angular CLI) as a build-time dependency for `packages/ng`/`packages/ng-core` only. This is already anticipated in Phase 0's `DEPENDENCIES.md` ("Build-time only, not shipped: `ng-packagr`, `@angular/cli` (Angular line)") — Phase 2 is simply the phase that actually exercises that already-planned dependency, not an unplanned addition.

**Options considered:**
1. Force `tsup`/esbuild to handle Angular compilation via a custom plugin — rejected: fights the tooling, not how any production Angular library is built, unnecessary risk for a first Angular package.
2. `ng-packagr` via Angular CLI (`ng build`) — **chosen**: matches PrimeNG's own proven build exactly, is Angular's own official Angular Package Format tool, requires no custom tooling investment.

**Recommendation:** `ng-packagr`, invoked via a minimal Angular CLI workspace configuration (an `angular.json` defining `ng-core` and `ng` as library projects, each with its own `ng-package.json` — for `ng`, one per component secondary entry point, mirroring PrimeNG's exact proven shape).

**Trade-offs:** introduces a second build toolchain into the monorepo (tsup for UIX, ng-packagr for ng/ng-core) rather than one universal tool. Accepted — forcing tooling uniformity across fundamentally different compilation requirements (framework-neutral ESM vs. Angular Package Format) would be a worse outcome than using each ecosystem's own proven tool. `pnpm -r --if-present run build` orchestration (ADR-015, plain pnpm) is unaffected — it still calls each package's own `build` script, which for `ng`/`ng-core` invokes `ng build` internally instead of `tsup`.

**Decision required (recorded, not resolved here):** none — this is resolved by this spec as a Phase 2 architectural decision, to be ratified as a new ADR at implementation time (see Deliverables).

- **TypeScript:** Angular's own strict compilation mode, `5.9.3` (matching the pinned catalog), extending the same root `tsconfig.base.json` where compatible, with Angular-specific compiler options (`enableIvy`-equivalent modern defaults, already standard in Angular 21) layered in `packages/{ng,ng-core}/tsconfig.json`.
- **Partial compilation / metadata:** `ng-packagr`'s standard Angular Package Format output (Ivy partial compilation, `.metadata.json` where applicable, `.d.ts` declarations) — no customization needed, matching PrimeNG's own proven output shape.
- **Exports:** subpath per component for `packages/ng` (matching PrimeNG's secondary-entry-point convention); single entry for `packages/ng-core` (small enough surface, no subpath fragmentation needed yet).
- **Side effects:** `sideEffects: false` in both packages' `package.json`, consistent with Phase 0/1's tree-shaking posture.
- **Source maps:** shipped, matching Phase 0/1's existing requirement for all packages.

---

## Testing Strategy

**Decision: Vitest as the test runner, `@angular/core/testing` (`TestBed`) for Angular-specific component harnesses — not Karma/Jasmine.**

**Finding:** PrimeNG 21.1.9 itself uses Karma + Jasmine + ChromeHeadless (verified: `package.json` `devDependencies` include `karma`, `karma-chrome-launcher`, `karma-jasmine`; `test:unit` script runs `ng test primeng --watch=false --browsers=ChromeHeadless`). Karma is a legacy tool the broader Angular ecosystem (including Angular's own CLI defaults in recent versions) is moving away from, in favor of Web Test Runner or, increasingly, Vitest-based builders.

**Decision rationale:** Phase 0/1 already standardized on Vitest for framework-neutral packages (ADR-level consistency, not a hard technical requirement by itself). Angular's `TestBed` API is test-runner-agnostic — it works correctly under Vitest with appropriate configuration (`jsdom`/`happy-dom` environment, Angular's zone/testing setup). Choosing Vitest here avoids introducing a second, declining test runner into the monorepo, while still using 100% official Angular testing APIs (`TestBed`, `ComponentFixture`) — this is not a compromise on Angular-testing correctness, only a choice of which runner executes those APIs.

Coverage required for the proof set:

- **Component behavior:** inputs, outputs, rendering, lifecycle — one test suite per proof-set component (`button`, `inputtext`, `checkbox`, `tooltip`, plus `ripple`/`autofocus`/`fluid`/`badge`), using `TestBed`/`ComponentFixture`, referencing PrimeNG's own `.spec.ts` files (verified present in the vendored source, e.g. `tooltip.spec.ts`) as a correctness baseline — not copied verbatim (selectors/class names differ per the Public API Strategy decision), but used to confirm behavioral parity where parity is intended.
- **Accessibility:** keyboard interaction (Tab/Enter/Space activation for Button; focus handling for Tooltip's hover/focus triggers) and ARIA attribute correctness (`aria-disabled`, `role`, `aria-describedby` where Tooltip links to its trigger element) — automated via `TestBed`-rendered DOM assertions.
- **Forms:** `ControlValueAccessor` conformance tests for InputText and Checkbox — value propagation both directions (`writeValue` → view, view interaction → `registerOnChange` callback), `setDisabledState` correctness, integration with a real `FormControl`/`FormGroup` in the test harness (not just the component in isolation) to catch the exact class of silent CVA bug flagged as this phase's highest-risk item.
- **Overlay:** Tooltip positioning (verify computed position against viewport/scroll state), dismissal (click-outside, escape, scroll-triggered reposition/hide via the `ConnectedOverlayScrollHandler`-equivalent), and motion (fade-in/out via `@ultimate/uix-utils`'s `fadeIn`).
- **Styling:** token/style integration — each component's corresponding `@ultimate/uix-styles` module registers correctly via `@ultimate/uix-styled`'s stylesheet service when the component initializes (extending Phase 1's existing "package/export tests explicitly call every exported function including stylesheet registration" pattern to the new per-component style modules).
- **SSR:** import-time safety only (no top-level DOM access in any `ng-core`/`ng` module) — full SSR rendering is not exercised in this phase (no SSR-sensitive component in the proof set), consistent with the Angular Baseline section's SSR scoping.
- **Package exports:** a Vitest suite asserting every declared `package.json` `exports` subpath for both `ng-core` and `ng` resolves and imports without throwing — extending Phase 1's established pattern.
- **Dependency boundaries:** `ceiling:validate` and `boundary:validate` (extended per Dependency Rules, above) pass non-trivially against real `ng`/`ng-core` content for the first time.
- **Framework boundary:** confirm zero `react`/`vue` imports anywhere in `packages/ng*` (new, cheap CI check, per Dependency Rules).
- **Build:** `pnpm install --frozen-lockfile && pnpm run build` from a clean checkout must succeed for `ng-core` and `ng`, including their `ng-packagr` step, alongside the existing UIX packages' `tsup` builds.

---

## Accessibility

Classification per the brief's required RETAIN/FIX/REPLACE/MISSING taxonomy, based on the proof set's verified source:

| Behavior | PrimeNG 21.1.9 baseline (verified/inferred from source) | Classification | Notes |
|---|---|---|---|
| Reduced-motion respect (Tooltip's fade transition) | Uses `@ultimate/uix-utils`'s `fadeIn` — already confirmed in Phase 1 to respect `prefers-reduced-motion` via `isPrefersReducedMotion()` | **RETAIN** | Inherited correctly from Phase 1's UIX work, no Angular-side change needed |
| Focus management (focusable-element detection used by `autofocus`) | Uses `@ultimate/uix-utils`'s `focus`/`getFirstFocusableElement`/`getLastFocusableElement` (already Phase 1 scope) | **RETAIN** | Same reasoning |
| Button keyboard activation (Enter/Space) | Native `<button>` element semantics (verified: PrimeNG's Button renders a real `<button>`, not a `<div>` with ARIA role) | **RETAIN** | Correct baseline — native semantics are the right default, no reimplementation needed |
| Checkbox ARIA state (`aria-checked`, `role="checkbox"` if not a native `<input type="checkbox">`) | **Requires implementation-time verification** — this investigation did not confirm whether PrimeNG's Checkbox renders a native `<input type="checkbox">` (in which case ARIA is automatic) or a custom-styled `<div>`-based checkbox (in which case explicit `role`/`aria-checked` management is required) | **Needs verification, tentatively FIX if custom-rendered** | Flagged rather than assumed — do not carry forward an assumption this investigation could not confirm from the data gathered |
| Tooltip ARIA linkage (`aria-describedby` from trigger element to tooltip content) | **Requires implementation-time verification** — not confirmed present or absent in this investigation's source read | **Needs verification, tentatively MISSING if absent** | If PrimeNG's own Tooltip does not set `aria-describedby`, this is a known accessibility gap category (tooltips are a common WCAG failure point) that Ultimate should not blindly inherit — if missing upstream, classify as Ultimate-side **FIX**, not silently RETAIN a gap |
| Disabled-state semantics (`disabled` attribute / `aria-disabled`) | Standard Angular `[disabled]` binding to native disabled attribute, verified as the general pattern across `basecomponent`-derived components | **RETAIN** | Native `disabled` is correct where a native element is used |
| Error-state ARIA (`aria-invalid`) | Out of scope — no error-presentation UI exists in the proof set (see Forms Architecture) | **DEFERRED, not MISSING** | Not a defect to fix now; there is no error UI yet to attach it to |
| Live regions | Not exercised by any proof-set component (no dynamic status announcement need in Button/InputText/Checkbox/Tooltip) | **N/A for this phase** | Revisit when Toast/Message components are migrated |

**Any confirmed inherited accessibility defect must be documented explicitly, not silently carried forward** — this is a hard requirement restated from the brief. This investigation flags two specific items above (Checkbox's exact DOM structure, Tooltip's `aria-describedby` linkage) as requiring direct source verification during implementation rather than being resolved by this spec's investigation depth. If either is confirmed missing/incorrect in the actual PrimeNG source, Ultimate's version must FIX it, not RETAIN the gap — accessibility regressions are release blockers per Blueprint §30.

---

## Security

- **DOM manipulation:** Tooltip's DOM insertion (verified: `appendChild`/`createElement` from `@ultimate/uix-utils`) does not use `innerHTML` with unsanitized content — content is set via Angular's own template binding (`{{ }}` interpolation, which Angular auto-sanitizes) or explicit text-node creation, not raw HTML string injection. **No XSS-shaped pattern identified** in the proof set, consistent with Phase 1's finding for the underlying UIX utilities.
- **Sanitizer usage:** no explicit `DomSanitizer.bypassSecurityTrust*` call was found in the proof set's source during this investigation — if Tooltip or any proof-set component's actual template does use one (e.g. to render HTML content in a tooltip), this must be flagged as security-sensitive code requiring an explicit test during implementation, not assumed safe.
- **Dynamic component creation:** none in the proof set — Tooltip attaches an element via DOM APIs, not Angular's `ViewContainerRef.createComponent` dynamic-component API. (Dynamic component creation is a `dynamicdialog`-category concern, out of this phase's scope.)
- **URL handling:** none identified in the proof set's components.
- **Style injection:** inherited from `@ultimate/uix-styled`'s Phase 1-verified `<style>`-tag-based mechanism — no `eval`/inline `on*`-attribute pattern, already confirmed safe in Phase 1.
- **User-provided content:** Button's label/icon and Tooltip's content are the main user-controlled-content surfaces — both go through Angular's default template interpolation/sanitization; no explicit escape hatch is introduced by this phase.

No security-sensitive new utility is introduced by this phase beyond what Angular's own template engine and Phase 1's already-reviewed UIX utilities provide.

---

## Performance Baseline

Following Phase 1's established posture — measure, do not speculatively optimize:

- **Package size:** `dist/` total size and gzip size of `@ultimate/ng-core` and `@ultimate/ng` (aggregate and per-component-entry-point), recorded after Phase 2's build.
- **Representative component bundle size:** isolated bundle-size measurement for a single component import (e.g. `import { Button } from '@ultimate/ng/button'`) via a throwaway bundler test, confirming per-component tree-shaking actually works given the subpath-export/secondary-entry-point structure — extending Phase 1's exact same spot-check methodology to the new packages.
- **Initial component creation cost:** basic instantiation-time measurement for each proof-set component under `TestBed`, recorded as a baseline number, not compared against an arbitrary budget.
- **Change detection cost:** not deeply measured in this phase — none of the proof-set components have complex change-detection-heavy behavior (no large list rendering, no `OnPush`-vs-default comparison meaningful at this scope). Deferred to the Data Components phase, where it is actually load-bearing.
- **Overlay open/close cost:** Tooltip's show/hide timing, recorded as a baseline (this is the first phase where this measurement is even possible, since Phase 1 had no framework consumer).
- **SSR rendering cost:** not measured — no SSR-sensitive component in the proof set (consistent with Angular Baseline's SSR scoping).
- **Tree-shaking:** verified qualitatively via the bundle-size spot-check above, following Phase 1's exact precedent.

Exact recording location (new file vs. extending `docs/architecture/PERFORMANCE.md`, which Phase 1 already created) is an implementation-plan detail — extending the existing file is the expected default absent a reason to split it.

---

## Documentation

- Each proof-set component gets a doc entry (README section or dedicated file — exact format is an implementation-plan detail) covering: PrimeNG foundation (source path, version, commit SHA — linking to the provenance manifest), UltimateNG behavior (what, if anything, was intentionally changed from Prime's behavior), API (selector, inputs, outputs, exact Ultimate naming), styling (which `@ultimate/uix-styles` module it registers), accessibility (referencing the classification table above), and migration notes (only where genuinely relevant — e.g. Badge being a transitive rather than independently-chosen migration).
- `@ultimate/ng-core` and `@ultimate/ng` each get a package-level `README.md` (matching Phase 1's per-package documentation pattern), documenting purpose, public API, and provenance linkage.
- No duplication of PrimeNG's own showcase/demo documentation content — Ultimate's docs describe Ultimate's own API and behavior, referencing Prime only as historical/provenance context.
- No public documentation site is built in this phase (non-goal, consistent with Phase 0/1).

---

## AI/Metadata Constraints

No AI/CLI/MCP/Skills implementation occurs in this phase (restated non-goal, unchanged from Blueprint/Phase 0/1). Compatibility is preserved structurally, not implemented:

- Each `@ultimate/ng` component's exported class carries TSDoc comments on its public inputs/outputs (part of the Documentation requirement above) — structured enough to later feed a metadata generator (Phase 6) without rework, matching Phase 1's exact same forward-compatibility posture.
- No metadata schema or generator is built now.
- No AI/tooling runtime dependency is added to `packages/ng`/`packages/ng-core`'s `package.json` (already implied by the dependency rules above).

---

## Migration Compatibility

**Decision: no compatibility mechanism (API compatibility layer, codemods, selector aliases, import aliases) is built in Phase 2.**

There are no existing UltimateNG consumers to migrate from PrimeNG — this is the first UltimateNG release, not a version upgrade of an existing Ultimate product. Building migration tooling now would be solving a problem that does not yet exist (YAGNI). The intended long-term compatibility strategy, for the record (not implemented now): once UltimateNG has real external consumers and a future breaking change is being planned, Ultimate would define codemods and a migration guide at that time, following the same pattern React/Vue/Angular's own core teams use for major-version migrations — this is a documentation/tooling investment appropriate to *that* future moment, not this one.

**What Phase 2 does provide, at zero extra cost:** the file-level provenance manifest (`docs/architecture/provenance/ng.json`, `ng-core.json`) already gives any future engineer or migration-tooling author a precise map from Ultimate's public API back to PrimeNG's original source, which is a prerequisite for writing a PrimeNG→UltimateNG codemod later, even though no such codemod is written now.

---

## Storybook

No Storybook work is authored or modified in this phase (non-goal, matching the brief's explicit instruction not to modify existing PrimeNG mirror stories and not to redesign Storybook architecture). This spec does not investigate the existing Storybook setup in depth, since no Storybook deliverable exists in this phase's scope — deferred to whichever phase first needs to document UltimateNG components in Storybook (a natural candidate is whichever phase completes enough of the component inventory to make a unified Storybook worthwhile, not necessarily Phase 2 itself given its intentionally small proof-set scope).

---

## Deliverables

```text
Packages (source + config):
  packages/ng-core/{src/,package.json,angular.json (or ng-package.json equivalent),README.md,THIRD-PARTY-NOTICES.md (new)}
  packages/ng/{src/<component>/,package.json,angular.json,README.md,THIRD-PARTY-NOTICES.md (confirmed accurate, unchanged)}

Components migrated (8, per Component Migration Strategy):
  Foundation: base, basecomponent, basemodelholder, baseeditableholder, bind, api (subset) — into ng-core
  Components: ripple, autofocus, fluid, badge, inputtext, checkbox, button, tooltip — into ng
  Icon (partial): SpinnerIcon, baseicon — into ng

Tests: *.spec.ts colocated per component, Vitest + TestBed harness, vitest.config.ts per package

Provenance:
  scripts/provenance/extract-primeng-source.mjs (new, or extended extract-source.mjs)
  docs/architecture/provenance/ng-core.json (new)
  docs/architecture/provenance/ng.json (new)
  docs/architecture/PROVENANCE.md (PrimeNG entry updated: Modification status, Date incorporated)

Dependency policy updates:
  scripts/provenance/validate-dependency-ceiling.mjs (verify "ng" already in WATCHED_PREFIXES — confirmed present in this investigation; re-verify at implementation time)
  scripts/provenance/validate-boundaries.mjs (extended: packages/ng* must contain zero react/vue imports)
  scripts/provenance/validate-provenance.mjs (extended: packages/ng*/src/**/*.ts must have a manifest entry; manifest schema's modificationStatus enum extended to include "adapted")

Styling:
  packages/uix-styles/src/{button,inputtext,checkbox,tooltip,ripple,autofocus,fluid,badge}/ (8 new component style modules)
  packages/uix-styles/test/scope-guard.test.ts (updated: allow exactly these 8 modules + base, not zero)

Architecture decisions:
  docs/architecture/DECISIONS.md — new ADR-018 (Ultimate-owned internal Angular architecture, Option B), ADR-019 (ng-packagr as Phase 2 build tool, deviation from tsup), ADR-020 (direct tarball extraction as Phase 2 vendoring mechanism), ADR-021 (Ultimate selector namespace from day one, no PrimeNG-compatible alias layer), ADR-022 (Vitest + TestBed as Angular test strategy, not Karma/Jasmine)
  docs/architecture/COMPATIBILITY.md — extended with Angular ^21.0.7 UltimateNG compatibility window entry

Documentation: per-package README.md, per-component doc entries (see Documentation section)

Performance baseline: recorded in docs/architecture/PERFORMANCE.md (extended from Phase 1)

CI: .github/workflows/ci.yml — no new job; existing steps (install/build/test/lint/typecheck/provenance/boundary/ceiling) become non-trivial for packages/ng* for the first time; ng-packagr build step added to the build stage

Component inventory: recorded in this spec's Component Inventory section — implementation plan does not need to re-derive it
```

---

## Acceptance Criteria

- [ ] `packages/ng-core` and `packages/ng` build independently (and together) via `pnpm -r run build` from a clean checkout, including the `ng-packagr` step.
- [ ] Every declared `package.json` `exports` subpath resolves for both packages (package/export tests pass).
- [ ] All 8 proof-set components (Button, InputText, Checkbox, Tooltip, Ripple, AutoFocus, Fluid, Badge) render correctly under `TestBed`, with inputs/outputs/lifecycle behavior verified.
- [ ] `ControlValueAccessor` conformance tests pass for InputText and Checkbox against a real `FormControl` harness.
- [ ] Tooltip's positioning, dismissal, and motion behavior are verified under test.
- [ ] Accessibility tests pass for keyboard interaction and ARIA attributes; the two flagged "needs verification" items (Checkbox DOM structure, Tooltip `aria-describedby`) are resolved one way or the other (confirmed correct, or fixed) — not left unresolved.
- [ ] `boundary:validate` passes non-trivially for `packages/ng*` (zero Angular-inappropriate imports found; zero React/Vue imports found via the new check).
- [ ] `ceiling:validate` passes non-trivially for `packages/ng*` (zero `primeng`/`@primeuix/*` runtime dependencies).
- [ ] `provenance:validate` passes — every incorporated `.ts` file under `packages/ng*/src/` has a manifest entry; `PROVENANCE.md`'s PrimeNG entry reflects real incorporation.
- [ ] All 8 new `@ultimate/uix-styles` component modules exist, are consumed correctly by their owning `@ultimate/ng` component, and the updated scope-guard test passes.
- [ ] `packages/ng-core/THIRD-PARTY-NOTICES.md` exists and is populated (currently missing); `packages/ng/THIRD-PARTY-NOTICES.md` confirmed still accurate.
- [ ] Performance baseline numbers recorded for both packages (package size, per-component bundle size, tree-shaking spot-check, component creation cost, Tooltip open/close timing).
- [ ] READMEs exist for both packages; per-component documentation covers Prime foundation, Ultimate behavior, API, styling, accessibility, and migration notes.
- [ ] `docs/architecture/DECISIONS.md` records ADR-018 through ADR-022.
- [ ] `docs/architecture/COMPATIBILITY.md` records the Angular ^21.0.7 UltimateNG compatibility window.
- [ ] A fresh spot-check confirms no `primeng`/`@primeuix/*` entries exist in `pnpm-lock.yaml` under `packages/ng*`.
- [ ] The full PrimeNG component inventory (this spec's Component Inventory section) is confirmed complete against the actual vendored tarball's `src/*` directory listing at implementation time (no new top-level component area is discovered that this spec failed to classify).
- [ ] `packages/ng` and `packages/ng-core` can be consumed via workspace protocol with zero reverse dependency (neither is imported by `packages/uix-*`).

---

## Risks

| Risk | Impact | Likelihood | Mitigation | Decision point |
|---|---|---|---|---|
| Task brief's stale `17.18.15` version reference gets reintroduced in a future document or conversation without this spec's correction being noticed | Medium — could cause a future phase to re-litigate an already-corrected baseline | Low once this spec is the reference | This spec's Context section documents the correction explicitly and permanently; future specs should cite this document, not the original task brief | Ongoing |
| `Badge`'s own transitive dependency closure was not independently verified to the same depth as the other 7 proof-set items (only confirmed as a `button` import) | Low-Medium — could add an unaccounted-for 9th component to the proof set if Badge itself has non-trivial dependencies | Medium — not yet verified | Re-verify Badge's own `.ts` imports during implementation, before committing to the final component list; if Badge pulls in something unexpected, treat it the same way Button pulled in Badge (extend the proof set) or find/author a minimal stub | Phase 2 implementation, before Button's build is finalized |
| `ConnectedOverlayScrollHandler` (used by Tooltip) is not confirmed to already exist in Phase 1's `@ultimate/uix-utils` `dom` submodule | Medium — could require an unplanned UIX-package addition mid-Phase-2 | Medium — Phase 1's spec describes "~90 files" retained but this investigation did not name-check this specific helper | Verify presence early in implementation; if absent, add it to `@ultimate/uix-utils`'s `dom` submodule (it is framework-neutral) as a small Phase 2-triggered UIX addition, following Phase 1's exact extraction/provenance mechanism for that one file | Phase 2 implementation, before Tooltip's positioning logic is written |
| Checkbox's exact DOM structure (native `<input>` vs. custom-rendered) is unconfirmed, affecting the accessibility classification | Medium — could reveal an inherited accessibility gap requiring a FIX, not just a RETAIN | Medium | Verify directly from `checkbox.ts`/`checkbox.html`-equivalent template source at implementation start, before writing any Checkbox test; resolve the "Needs verification" flag in the Accessibility section explicitly | Phase 2 implementation, before Checkbox tests are written |
| Tooltip's `aria-describedby` linkage is unconfirmed | Medium — same category of risk as above, and tooltips are a common WCAG failure point industry-wide | Medium | Same verification approach; if missing, implement it as an Ultimate-side FIX, documented as an intentional accessibility improvement over the inherited baseline, not a silent behavior change | Phase 2 implementation, before Tooltip tests are written |
| `ng-packagr`/Angular CLI build tooling introduces monorepo build complexity Phase 0/1 never had to solve (a second build system alongside tsup) | Low-Medium — could complicate `pnpm -r run build` orchestration if `ng build` behaves differently under workspace-linked dependencies than a standalone Angular app | Low-Medium — untested combination in this repo | Prototype the `ng-core`/`ng` build against workspace-linked `@ultimate/uix-*` dependencies early in implementation, before writing all 8 components, to catch any workspace-linking friction while the surface is still small | Phase 2 implementation, first build attempt |
| Vitest + TestBed combination for Angular component testing is less battle-tested industry-wide than Karma+Jasmine or Angular's own Web Test Runner path | Medium — could surface Angular-zone/change-detection timing issues under Vitest's execution model that wouldn't occur under Karma | Low-Medium | Validate the Vitest+TestBed harness against the simplest proof-set component (Button) first, before writing tests for the more complex ones (Tooltip, Checkbox's CVA tests) — fail fast on tooling friction while the cost of switching is still low | Phase 2 implementation, first test suite written |
| `.p-*` CSS class retention (deferred cross-cutting decision) creates a visible inconsistency once Ultimate's TypeScript-level API (`u-*` selectors) ships alongside still-`.p-*`-prefixed CSS classes | Low — cosmetic/internal inconsistency, not a functional defect | Confirmed, accepted | Explicitly documented in Public API Strategy as an intentional, deferred decision, not an oversight; revisit at the pre-1.0 CSS-naming gate Phase 1 already established | Pre-1.0, cross-cutting (not Phase 2-specific) |
| `config` and `passthrough` architecture questions (flagged Needs Architecture Decision) get implicitly resolved by ad-hoc implementation choices during Phase 2 coding rather than deliberately, because a component "just needs" a config value | Medium — could silently establish an unreviewed pattern that later phases feel locked into | Low-Medium if flagged (this spec flags it explicitly) | Implementation must not add a global config service or pass-through extensibility mechanism as a side effect of building the proof set; if a proof-set component seems to need one, escalate as a new open question rather than deciding inline | Phase 2 implementation |
| Full ~100-area component inventory (this spec) was derived from a single investigation pass over the vendored tarball's directory listing, not exhaustively cross-checked file-by-file for every "Later Phase" entry | Low — could contain a minor miscategorization for a component this phase never touches | Low-Medium | Acceptable given this phase's scope does not depend on Later Phase entries being perfectly precise; the phase that actually migrates each deferred component re-verifies its own dependency closure at that time, matching how this spec itself re-verified the proof set rather than trusting Phase 0/1's higher-level descriptions | Each future phase's own investigation |

---

## Decisions vs Open Questions

### Already decided (Blueprint / Phase 0 / Phase 1, unchanged)

Company-owned platform; monorepo; independent packages; framework-native implementations; no required Prime runtime dependency; MIT-only provenance; pnpm workspaces; plain-pnpm build *orchestration* (ADR-015, distinct from per-package build *tooling*); PrimeNG baseline `21.1.9` at commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`; Angular peer range `^21.0.7`; `packages/ng`, `packages/ng-core` directory names and boundary responsibilities (Blueprint §5, `PACKAGE_ARCHITECTURE.md`); `@ultimate/uix-*` package names and their Phase 1 scope; Vitest as the default test runner across the monorepo generally.

### Phase 2 decisions (made in this spec)

- PrimeNG baseline corrected to `21.1.9` (task brief's `17.18.15` was stale; repository state is authoritative, confirmed with the user).
- Ultimate-owned internal Angular component architecture (Option B) — PrimeNG is a behavioral reference, not a structural template.
- Ultimate selector namespace (`u-*` working convention) and independent public API from day one — no interim PrimeNG-compatible alias layer.
- Standalone components only — no NgModule support, not even as a compatibility shim.
- Phase 2 proof set: Button, InputText, Checkbox, Tooltip, plus verified transitive dependencies Ripple, AutoFocus, Fluid, Badge, plus foundation (base/basecomponent/basemodelholder/baseeditableholder/bind/api subset) and the `SpinnerIcon` icon.
- Package boundary: foundation classes/directives/types in `ng-core`; every actual rendered component (including structural directives like Ripple) in `ng`.
- `ng-packagr` (not `tsup`) as the build tool for `ng`/`ng-core`, matching PrimeNG's own proven Angular Package Format build.
- Vitest + `TestBed` (not Karma/Jasmine) as the Angular test strategy.
- Direct tarball extraction (not sourcemap recovery) as the Phase 2 vendoring mechanism — simpler than Phase 1's ADR-016 because real `src/` exists in the pinned tarball.
- Component styles migrate into `@ultimate/uix-styles` (one module per migrated component), consumed via `@ultimate/uix-styled`'s existing registration mechanism — no styling infrastructure duplicated in `ng`/`ng-core`.
- Angular CDK is not adopted in Phase 2 — not exercised by the proof set, not manufactured as a dependency ahead of need.
- Dialog, FocusTrap, and PrimeNG's Angular `motion` wrapper are explicitly deferred — heavier than the proof set requires.
- Angular upgrade strategy: Ultimate tracks Angular independently, on its own schedule, deliberately not tied to PrimeNG's cadence.
- No migration-compatibility tooling (codemods, aliases) built in this phase — no existing consumer base to justify it yet.
- `.p-*` CSS class naming remains verbatim in Phase 2 — a deferred, cross-cutting, pre-1.0 decision already established by Phase 1, not re-opened here.

### Open questions (requiring resolution during implementation, not by this spec)

- Exact final Ultimate selector prefix (`u-*` vs. an alternative) — working convention only, per Blueprint §10's pre-1.0 gate.
- Exact Ultimate base-class naming conventions in `ng-core` (e.g. `UltimateBaseComponent` vs. a shorter form).
- Whether `Badge`'s own dependency closure introduces any unaccounted-for 9th proof-set component (flagged as a risk above).
- Whether `ConnectedOverlayScrollHandler` already exists in Phase 1's `@ultimate/uix-utils` `dom` submodule, or must be added as a Phase 2-triggered UIX addition (flagged as a risk above).
- Checkbox's exact DOM structure and Tooltip's `aria-describedby` linkage — both flagged for direct source verification at implementation start (see Accessibility, Risks).
- Exact provenance-manifest schema extension for the new `modificationStatus: "adapted"` value.
- Exact script consolidation approach for provenance extraction (new `extract-primeng-source.mjs` vs. extending Phase 1's `extract-source.mjs`).
- Exact location for the new performance-baseline records (extending `PERFORMANCE.md` vs. a new file) — matching Phase 1's own still-open equivalent question.

### Deferred decisions (explicitly postponed to later phases)

`config` (global configuration/defaults service architecture) and `passthrough` (extensibility escape-hatch pattern) — both classified **Needs Architecture Decision**, deliberately not resolved by a 4-component proof set; final `.p-*` → alternative CSS-class-prefix decision (pre-1.0, cross-cutting, already deferred by Phase 1); Angular CDK adoption (revisit when a CDK-dependent component is migrated); shared overlay/portal infrastructure design (Dialog-and-beyond phase); Data Components architecture (selection/sorting/filtering/virtualization models); Navigation Components category; migration-compatibility tooling (codemods, guides) — intended strategy documented, not built; React/Vue framework symmetry validation (Phase 3/4); Storybook integration for UltimateNG; public npm publishing and npm-name-availability verification; final corporate themes (Phase 5); CLI/MCP/AI/Skills (Phases 7-9).

---

## Phase Exit Criteria

Phase 2 is exited and Phase 2.x/3 (whichever the next component-migration or React phase is) may begin when:

1. All items in Acceptance Criteria above are checked.
2. `@ultimate/ng-core` and `@ultimate/ng` build, test, and pass all CI validators independently from a clean `pnpm install --frozen-lockfile`.
3. `docs/architecture/PROVENANCE.md`'s PrimeNG entry reflects real Phase 2 incorporation, backed by the two new file-level manifest JSONs.
4. `docs/architecture/DECISIONS.md` records ADR-018 through ADR-022.
5. `docs/architecture/COMPATIBILITY.md` records the Angular `^21.0.7` UltimateNG compatibility window.
6. Representative components (the 4-component proof set) integrate successfully with `@ultimate/uix-utils`, `@ultimate/uix-styled`, and `@ultimate/uix-styles` — confirmed by passing tests, not merely by successful compilation.
7. Styling infrastructure is confirmed to use `@ultimate/uix-styled`/`@ultimate/uix-styles` rather than any duplicate mechanism inside `ng`/`ng-core` (verified via code review against this spec's Component Style Strategy section).
8. Performance baseline numbers are recorded for both new packages.
9. Documentation exists for all 8 migrated components/directives.
10. The full PrimeNG component inventory's migration classification (this spec's Component Inventory section) is confirmed still accurate against the vendored tarball, and any newly-discovered component area is classified before Phase 2 is considered closed.
11. A fresh re-verification confirms no `primeng`/`@primeuix/*` runtime dependency exists anywhere in `packages/ng*`'s `package.json` or `pnpm-lock.yaml`.
12. Both accessibility "needs verification" items (Checkbox DOM structure, Tooltip `aria-describedby`) are resolved with a documented outcome (RETAIN, confirmed correct; or FIX, with the fix implemented and tested).

---

## Non-Goals (restated for implementation-plan authors)

Do not, in Phase 2 implementation:

- Migrate any PrimeNG component beyond the 8-item proof set (Button, InputText, Checkbox, Tooltip, Ripple, AutoFocus, Fluid, Badge) and its supporting foundation/icon subset.
- Migrate Dialog, FocusTrap, or PrimeNG's Angular `motion` wrapper — explicitly deferred as heavier than this phase's proof case requires.
- Adopt Angular CDK — not exercised by the proof set; do not add it speculatively.
- Build NgModule support, even as a compatibility shim.
- Build any PrimeNG API-compatibility layer, codemod, or selector alias.
- Rename `.p-*` CSS classes — deferred, cross-cutting, pre-1.0 decision already established by Phase 1.
- Build shared overlay/portal infrastructure beyond what Tooltip's own component-level positioning requires.
- Resolve the `config` or `passthrough` architecture questions — flagged as Needs Architecture Decision, not decided here.
- Build error-presentation/form-field-semantics UI for InputText/Checkbox — CVA mechanism only, in this phase.
- Migrate React or Vue components.
- Implement corporate themes or concrete token values.
- Implement Ultimate CLI, MCP, Skills, or AI tooling.
- Build or modify Storybook stories.
- Publish any package to npm or create a public GitHub release.
- Maintain automatic Prime synchronization.
- Perform speculative performance optimization or a signals-based rewrite of proof-set components (none of PrimeNG 21.1.9's proof-set source uses signals; do not introduce one without a demonstrated need).
