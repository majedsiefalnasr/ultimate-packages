# Phase 2 — UltimateNG Foundation & Angular Component Framework

**Status:** Draft for review
**References:** `ULTIMATE_PLATFORM_BLUEPRINT.md`, `docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md`, `docs/architecture/{PROVENANCE,DEPENDENCIES,COMPATIBILITY,PACKAGE_ARCHITECTURE,DECISIONS}.md`, `packages/uix-{utils,styled,styles,motion}/` (Phase 1 implementation)

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document. No component migration begins until this specification is reviewed and approved, followed by a separate implementation plan.

All findings below were independently verified by direct inspection of `.vendor-cache/primeng-21.1.9.tar.gz` and the repository's committed architecture docs during this session — not carried over from assumption.

---

## Context

Phase 0 pinned and MIT-verified the PrimeNG baseline. Phase 1 turned four `@primeuix/*` packages into framework-neutral `@ultimate/uix-{utils,styled,styles,motion}` packages, with full provenance and CI-enforced framework-neutrality (`scripts/provenance/validate-boundaries.mjs`) and dependency ceilings (`scripts/provenance/validate-dependency-ceiling.mjs`). `packages/ng/` currently contains only a `THIRD-PARTY-NOTICES.md` stub; `packages/ng-core/` contains only a `.gitkeep`. No Angular source has been incorporated. `docs/architecture/PROVENANCE.md`'s PrimeNG entry is pinned but marked "not yet incorporated (Phase 0 — baseline pinned only)".

Phase 2 is the first phase incorporating Prime-derived **Angular** source. Its job is to establish `UltimateNG` — an Ultimate-owned Angular component framework, built on `UltimateUIX`, seeded from the verified PrimeNG 21.1.9 MIT baseline.

### Deviation: brief specified PrimeNG 17.18.15; verified repository baseline is 21.1.9

**Finding:** The task brief that requested this specification states the PrimeNG baseline as `17.18.15`. No occurrence of that version string exists anywhere in this repository. Verified directly in this session:

- `docs/architecture/PROVENANCE.md`: `Source version: 21.1.9`, `Source commit SHA: c493b1c6d9f7cdffbe1c4dc195493dd73d733593`.
- `docs/architecture/COMPATIBILITY.md:18`: `Angular: ^21.0.7 and up (PrimeNG 21.1.9 peer range)` — already committed, not a new decision this spec introduces.
- `.vendor-cache/primeng-21.1.9.tar.gz`: a real git-archive tarball whose root directory is literally named `primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/` — the commit SHA is independently corroborated by the tarball's own structure, not merely trusted from a doc.
- Direct extraction of `packages/primeng/package.json` from the tarball confirms `"version": "21.1.9"` and a peer-dependency block on `catalog:angular21`.

**Impact:** 21.1.9 and 17.x are architecturally distant. 21.1.9 (confirmed by direct source read of `button.ts`, `basecomponent.ts`, `dialog.ts`, `menu.ts`, `checkbox.ts`, `tooltip.ts`) is standalone-only, uses Angular signals (`input()`, `effect()`) alongside legacy decorators in the same files, and has a homegrown overlay/focus-trap system with `@angular/cdk` used only incidentally. A 17.x-targeted spec would describe a materially different codebase.

**Options:** (a) treat 17.18.15 as a stale error in the brief and spec against the actual pinned, checksummed, ADR-recorded 21.1.9 baseline; (b) halt and require Phase 0/1 provenance to be re-pinned to 17.18.15.

**Recommendation:** (a). Per this spec's own governing instruction to treat the repository's current state as authoritative and not re-invent decisions already made in Phase 0.

**Decision required:** Confirmed by user — proceed against PrimeNG 21.1.9. Resolved, not open.

---

## Objective

Establish `UltimateNG` as two independently owned, independently buildable, independently testable Angular packages (`@ultimate/ng-core`, `@ultimate/ng`), seeded from the verified PrimeNG 21.1.9 MIT baseline, consuming `UltimateUIX` for framework-neutral infrastructure, with complete file-level provenance, zero prohibited Prime runtime dependencies, and a working foundation component set (**Button, Checkbox, Dialog, Menu, Tooltip**) proving the architecture end-to-end — including forms (CVA), overlay/focus-trap/motion, and keyboard-navigable menus.

This is not a thin wrapper around PrimeNG: PrimeNG source informs the architecture (Option B, below), but the internal class hierarchy, public API naming, and CSS class names are Ultimate's own.

---

## PrimeNG 21.1.9 Baseline Findings

Verified by direct extraction of `.vendor-cache/primeng-21.1.9.tar.gz` (a full git-archive of the PrimeNG monorepo at the pinned commit — contains complete original TypeScript source and `.spec.ts` test files, unlike Phase 1's `@primeuix/*` npm-tarball situation, which had no `src/`).

- **Package identity:** `primeng@21.1.9`, description confirms "80+ components." `peerDependencies` (verified from the tarball's own `package.json`): `@angular/{cdk,common,core,forms,router,platform-browser}` at `catalog:angular21`, `rxjs: ^6.0.0 || ^7.8.1`. `dependencies`: `@primeuix/{styled,utils,styles,motion}` — the same four packages Phase 1 already incorporated.
- **Build/test tooling:** `ng build primeng` (Angular CLI + ng-packagr, confirmed via `package.json` `build` script and per-component `ng-package.json` files). Test via `karma`/`karma-jasmine` devDependencies (confirmed), `ng test primeng --browsers=ChromeHeadless`.
- **Directory structure:** 117 top-level directories under `packages/primeng/src/` (counted directly from the tarball listing). Confirmed present via direct listing: all 5 proof-set components (`button`, `checkbox`, `dialog`, `menu`, `tooltip`) plus supporting infrastructure (`basecomponent`, `base`, `baseeditableholder`, `baseinput`, `bind`, `api`, `config`, `dom`, `focustrap`, `overlay`, `ripple`, `autofocus`, `icons`, `motion`, `fluid`, `badge`).
- **Standalone architecture:** every inspected `@Component`/`@Directive` in `button.ts`, `basecomponent.ts`, `dialog.ts`, `menu.ts` declares `standalone: true`. No NgModule-based component definitions found in the proof set; legacy `*Module` exports (e.g. `SharedModule`, `BadgeModule`) exist only as re-export conveniences for consumers, not architectural requirements.
- **Signals usage:** confirmed in `button.ts` — `ButtonLabel`, `ButtonIcon`, `ButtonDirective` all use `effect()` for reactive side effects; `basecomponent.ts` uses `input()`, `computed()`, `signal()`, `effect()` alongside `inject()`-based DI. This is an in-progress migration within PrimeNG itself (legacy `@Input()`/`@Output()` decorators appear alongside signal-based APIs in the same files).
- **Base class hierarchy (confirmed via direct read of `basecomponent.ts`):** `BaseComponent` (`standalone: true`, root class) — injects `DOCUMENT`, `PLATFORM_ID`, `ElementRef`, `Injector`, `ChangeDetectorRef`, `Renderer2`, the `PrimeNG` config service, `BaseComponentStyle`, `BaseStyle`, and a `PARENT_INSTANCE` injection token for parent-instance lookup. `BaseEditableHolder`/`BaseInput` extend this further for form-control components (needed by Checkbox).
- **Overlay infrastructure (confirmed via `dialog.ts` imports):** homegrown (`primeng/focustrap`, `primeng/dom`'s `ConnectedOverlayScrollHandler`, `primeng/utils`'s `ZIndexUtils`), not `@angular/cdk` Overlay. Dialog implements Escape-key dismissal via `bindDocumentEscapeListener` (confirmed at `dialog.ts:991-992`) and focus trapping via the `FocusTrap` directive (confirmed import and template usage `pFocusTrap` at `dialog.ts:36,77`). `@angular/cdk` is a peer dependency at the whole-package level but is not imported anywhere in the 5-component proof set's dependency closure.
- **Forms integration (confirmed via `checkbox.ts`):** `NG_VALUE_ACCESSOR`/`NgControl` imported from `@angular/forms`, standard `ControlValueAccessor` provider pattern.
- **Accessibility (confirmed via direct template inspection):** Dialog — `[attr.aria-labelledby]`, `[attr.aria-modal]="true"` (`dialog.ts:88-89`), Escape-key handling. Menu — `role="menu"` (`menu.ts:191`), `role="menuitem"` (`menu.ts:238,263`), `role="separator"` (`menu.ts:203,223,248`), `role="none"` (`menu.ts:212`). Tooltip — `this.container.setAttribute('role', 'tooltip')` (`tooltip.ts:500`).
- **Styling (confirmed via `buttonstyle.ts`):** every component's `style/<name>style.ts` imports raw CSS/token content directly from `@primeuix/styles/<component-name>` (`import { style } from '@primeuix/styles/button'`) and wraps it in a `BaseStyle`-extending `@Injectable`. This confirms Phase 1's ADR-017 deferral of the ~90 per-component style modules was deliberate — Phase 2 is where the first 5 of them get incorporated. The style module also defines a `classes` object — a per-slot map of static strings or `{instance} => [...]` resolver functions (e.g. `buttonstyle.ts`'s `root` classes reference `instance.hasIcon`, `instance.severity`, etc.) — this is component-authored logic that stays in `@ultimate/ng`, not shared UIX infrastructure.
- **Icons:** self-contained Angular icon components under `primeng/icons` (confirmed present: `spinner`, `times`, `windowmaximize`, `windowminimize`, `baseicon`). No `primeicons` runtime font/package dependency — icons are Angular components.
- **License:** root `LICENSE.md` confirmed (per Phase 0's existing record) to contain both the MIT "Community Versions" section (applies to `21.1.9`, no `-lts` suffix) and a separate commercial `-lts` section, matching `packages/ng/THIRD-PARTY-NOTICES.md`'s existing warning.

### Component proof-set dependency closure (verified via direct import inspection — not assumed)

| Component | Confirmed direct imports | Notes |
|---|---|---|
| `button` | `basecomponent`, `bind`, `ripple`, `autofocus`, `badge`, `fluid`, `icons`(`SpinnerIcon`), `api` | No overlay, no forms. |
| `checkbox` | `baseeditableholder`, `bind`, `api` | CVA via `NG_VALUE_ACCESSOR`. |
| `dialog` | `basecomponent`, `bind`, **`button`**, `focustrap`, `motion`(`@primeuix/motion`), `dom`, `utils`, `icons`(`TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`), `api` | Pulls in Button's own closure. |
| `menu` | `basecomponent`, `bind`, `ripple`, `badge`, **`tooltip`**, `RouterModule`(external Angular), `api` | **Non-obvious finding, below.** |
| `tooltip` | `basecomponent`, `bind`, `dom`(`ConnectedOverlayScrollHandler`), `utils`(`ZIndexUtils`), `api` | Own lightweight positioning; no cascade beyond this. |

**Non-obvious finding — Menu genuinely depends on Tooltip:** Direct inspection of `menu.ts` found `import { TooltipModule } from 'primeng/tooltip'` in the component's own `imports` array (`menu.ts:71,164`), with `pTooltip` actually applied in the template to menu-item labels (`menu.ts:209,234,259`) — this is load-bearing (truncated-label tooltips), not incidental. None of this session's initial research passes caught this; it was found by directly reading Menu's source rather than assuming its dependency shape. This is why **Tooltip is included in the Phase 2 proof set** rather than deferred — Menu's real behavior cannot be preserved without it, and Tooltip's own dependency closure (confirmed above) adds no further cascade. `RouterModule`'s `routerLink` support (`menu.ts:89-96`) remains available since `@angular/router` is an external peer dependency requiring no Prime source adaptation.

**Full foundation-tier closure required for the 5-component proof set:** `basecomponent`, `base`, `bind`, `baseeditableholder`, `api` (subset: types referenced by the 5 components), `ripple`, `autofocus`, `badge`, `fluid`, `focustrap`, `overlay` (underlies `focustrap`/Dialog positioning), plus 5 icon components (`SpinnerIcon`, `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `BaseIcon`).

---

## Angular Baseline

**Target: Angular `^21.0.7` and up** — already recorded in `docs/architecture/COMPATIBILITY.md:18`, derived directly from PrimeNG 21.1.9's own verified peer range, not independently chosen by this spec.

- **Standalone components only.** No new `NgModule` is authored anywhere in `ng-core`/`ng`. PrimeNG's own `NgModule`-shaped exports (`SharedModule`, `BadgeModule`, etc.) exist only for PrimeNG's own pre-existing external consumer base — Ultimate has no such legacy consumers to support.
- **Signals:** used where the verified 21.1.9 source already uses them (`input()` for component inputs, `effect()`/`computed()` for reactive internal state). Ultimate's adapted versions standardize on signal-based `input()`/`output()` exclusively for all Phase 2 components — no decorator-based `@Input()`/`@Output()` in new Ultimate source, since there is no legacy-consumer reason to mix styles within Ultimate's own new code.
- **Control flow syntax:** modern `@if`/`@for` in any new templates Ultimate authors.
- **`@angular/cdk`:** remains an external peer dependency, never vendored, and is **not** part of Phase 2's actual dependency set — confirmed unused by the entire 5-component proof-set closure (see table above). Declared as an available-but-unexercised peer only if a specific implementation need surfaces; not manufactured now.
- **SSR/hydration:** Ultimate-owned components must be import-safe under SSR (no top-level `document`/`window` access). Full SSR/hydration integration testing for overlay-specific behavior (Dialog's append-to-body, Tooltip's positioning) is scoped into this phase's Testing Strategy since both proof-set components touch the DOM conditionally — not deferred, since Dialog and Tooltip are both in scope this phase. A dedicated SSR demo application is out of scope (no consumer app exists yet).
- **TypeScript:** matches the repo's existing `tsconfig.base.json` (strict, ES2022) plus whatever decorator/compiler options Angular 21's compiler requires — verified during implementation, not a new floor.

### Angular Upgrade Strategy

**Decision: Ultimate independently tracks Angular releases**, informed by but not chained to PrimeNG's own cadence. Per Blueprint principles already established (Angular compatibility is an Ultimate responsibility; no continuous Prime sync, matching ADR-013's reasoning), staying chained to PrimeNG's own Angular support would recreate exactly the upstream-dependency risk that policy exists to avoid. Concretely: pin `^21.0.7` as the floor now; adopt Angular 22+ on Ultimate's own schedule once its ecosystem (CDK, forms, testing libraries) has caught up, re-evaluated at the start of each subsequent phase touching `@ultimate/ng` — not committed to a specific lag window now, since that requires evidence (Angular 22's actual changes) that doesn't exist yet.

---

## Critical Architectural Question: Depth of Ownership

**Decision: Option B — Ultimate establishes its own base-class architecture, informed by but not copied from PrimeNG's.**

| Dimension | Option A (thin PrimeNG-derived wrapper) | Option B (Ultimate-owned architecture) — chosen |
|---|---|---|
| Ownership | Superficial — Prime's internal design persists under an Ultimate label | Real — Ultimate controls its own foundation |
| API control | Constrained by Prime's internal shape leaking through | Full control; internal shape never dictates public API |
| Maintainability | Every fix must reason about Prime's original intent | Ultimate's own conventions, documented once |
| Accessibility | Inherits Prime's a11y implementation as-is, including latent defects | Ultimate reviews and re-implements a11y-critical logic with its own test coverage |
| Ability to diverge | Low — structural coupling makes future divergence expensive | High — free to evolve independently from day one |
| Future React/Vue symmetry | Each framework re-derives structure independently from its own Prime source | Establishes a pattern (base-component hierarchy, DI-token conventions) Phase 3/4 can consciously follow or diverge from |
| Cost | Lower migration effort now | Requires genuine design work in `ng-core`, not a mechanical port |

This matches the Blueprint's ownership principle. The cost is real and accepted: `ng-core`'s `BaseComponent`/`BaseEditableHolder`/`BaseInput` hierarchy is independently authored — informed by PrimeNG's proven DI/lifecycle/theme-integration pattern (which this investigation confirmed is already sound: `inject()`-based DI, `PARENT_INSTANCE` token, `BaseStyle` injection) but not copy-pasted. Where PrimeNG's approach is already idiomatic Angular 21, Ultimate's version follows the same shape (minimal reinvention); it does not invent a different pattern for its own sake.

---

## PrimeNG Source Scope

| Area | Classification | Rationale |
|---|---|---|
| `button`, `checkbox`, `dialog`, `menu`, `tooltip` (proof set) | **ADAPT** | Behavior/logic retained and validated against Prime's own `.spec.ts` files as a correctness reference; internal base-class architecture and public API are Ultimate's own (Option B). |
| `basecomponent`, `baseeditableholder`, `baseinput` | **REFACTOR** | Reimplemented as Ultimate's own base-directive hierarchy; PrimeNG's DI-token parent-linkage and theme-service wiring are design references, not copy targets. New manifest status `"reimplemented-with-reference"` applies here (see Provenance). |
| `overlay`, `focustrap` | **ADAPT** | Genuinely Angular-specific concerns (positioning, focus-trap lifecycle) — exactly what `ng-core` exists for. Not replaced with `@angular/cdk` Overlay (see Overlay Architecture — no defect found motivating a rewrite). |
| `ripple`, `autofocus`, `fluid`, `badge` | **ADAPT** | Migrated because a proof-set component genuinely imports each, not speculatively. |
| `icons` (5 needed: Spinner, Times, WindowMaximize, WindowMinimize, BaseIcon) | **ADAPT (partial)** | Only the icons the proof set actually imports. Remaining ~85+ icon components are **DEFER**, migrated per-consuming-component in later phases — avoids importing an unused icon catalog. |
| `api` (shared types, subset referenced by proof set) | **ADAPT (partial)** | Type-only interfaces (`MenuItem`, `TooltipOptions`, `PrimeTemplate`, etc.) needed by the 5 components; the rest of `api`'s surface is inventoried but not incorporated. `SharedModule`-style NgModule export within `api` is **REMOVE** (no NgModule support). |
| `bind` | **ADAPT** | Small, proven attribute/class-binding directive; adapted with Ultimate naming. |
| `config` (global `PrimeNG` service) | **ADAPT (minimal subset)** | Needed by `BaseComponent`, but only the subset the proof set exercises; full config surface is **DEFER (Needs Architecture Decision)** — a cross-cutting question better resolved once more components exist. |
| `dom`, `utils`, `classnames`, `ts-helpers` (PrimeNG's own internal copies) | **REMOVE** | Duplicate functionality already owned by `@ultimate/uix-utils` (confirmed: these are the same DOM/z-index/classname helpers Phase 1 already migrated verbatim). Angular source imports rewritten to `@ultimate/uix-utils` directly. |
| `motion` (PrimeNG's Angular-side wrapper), `usestyle` | **REPLACE WITH UIX** | Superseded by `@ultimate/uix-motion` and `@ultimate/uix-styled`'s stylesheet service directly. |
| `dynamicdialog`, generic shared overlay/portal infra beyond what Dialog itself needs | **DEFER** | Not exercised by the proof set's own Dialog usage (Dialog is template-declared, not imperatively instantiated in Phase 2). |
| `passthrough` (pt customization API) | **DEFER (Needs Architecture Decision)** | Real PrimeNG feature; not required to prove the architecture with 5 components. Revisit once more components create real duplicate-pattern pressure. |
| All other ~100 component directories outside the proof set | **DEFER** | Full classification in Component Inventory (deliverable, not enumerated row-by-row in this spec — see Deliverables). |

**Duplicate-with-UIX classification:**

| PrimeNG area | Classification |
|---|---|
| `dom`, `classnames`, `utils`, `ts-helpers` | REMOVE (use `@ultimate/uix-utils` directly) |
| `motion` (Angular wrapper) | REPLACE WITH UIX (`@ultimate/uix-motion`) |
| `usestyle`, `BaseStyle`'s loaded-style tracking | REPLACE WITH UIX (`@ultimate/uix-styled`'s `StyleSheet`/`ThemeService`) |
| `overlay`, `focustrap`, `ripple`, `icons`, `bind`, `config`, base-class hierarchy, `ControlValueAccessor` wiring | RETAIN FOR ANGULAR-SPECIFIC REASONS (genuine Angular lifecycle/DI/Forms concerns, no framework-neutral equivalent possible) |

---

## UltimateUIX Relationship

Dependency direction is strictly one-way: `ng-core`/`ng` → `@ultimate/uix-{utils,styled,styles,motion}`. UIX never imports Angular — enforced by the existing `scripts/provenance/validate-boundaries.mjs`, which already scans `packages/uix*` for framework imports and requires no change (it is not, and should not be, extended to scan `packages/ng*`, since `ng*` packages are expected to import Angular).

`ng-core` consumes: `@ultimate/uix-utils` (DOM helpers, z-index, classnames, object utilities — replacing PrimeNG's own internal copies), `@ultimate/uix-styled` (token resolution, stylesheet registration — replacing `usestyle`/`BaseStyle`'s bookkeeping), `@ultimate/uix-motion` (enter/leave orchestration for Dialog's overlay animation), `@ultimate/uix-styles` (base CSS + the 5 new per-component subpaths this phase adds).

---

## Ownership Boundaries

```text
@ultimate/ng component (e.g. UButton)
        ↓ consumes
@ultimate/ng-core (base classes, Overlay, FocusTrap, Ripple, icons, config)
        ↓ consumes
@ultimate/uix-{utils,styled,styles,motion} (framework-neutral, Phase 1)
```

- **Belongs in `ng-core`:** Ultimate's base-component hierarchy, overlay/focus-trap/ripple directives, icon components, global config service (minimal subset), shared DI tokens.
- **Belongs in `ng`:** the 5 rendered components, their per-component style registration (`XStyle` adapter classes).
- **Belongs in UIX (already built):** framework-neutral utilities, token resolution, motion orchestration, base/global CSS, and now the 5 new per-component style modules.
- **Must remain external:** `@angular/*`, `primeng`, `@primeuix/*`, `rxjs`, `tslib`.

---

## Package Architecture

```text
packages/
├── ng-core/     @ultimate/ng-core
└── ng/          @ultimate/ng
```

### `@ultimate/ng-core`

| | |
|---|---|
| Purpose | Angular-specific foundation: base component/directive hierarchy, overlay + focus-trap + ripple infrastructure, icon component set (5 needed), global config service (minimal subset), shared DI tokens |
| Public API | `UBaseComponent`, `UBaseEditableHolder`, `UBaseInput` (Ultimate-owned base classes — exact naming finalized in implementation), `Overlay`, `FocusTrap`, `Ripple` directives, `SpinnerIcon`/`TimesIcon`/`WindowMaximizeIcon`/`WindowMinimizeIcon`/`BaseIcon`, `UltimateConfig` service |
| Internal API | Parent-instance DI-token linkage pattern (internal wiring, not re-exported as public contract) |
| Dependencies | `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, `@ultimate/uix-styles` |
| Peer dependencies | `@angular/{core,common,forms,platform-browser}` `^21.0.7`, `rxjs` |
| Build output | Angular Package Format via `ng-packagr` (ESM, `.d.ts`, partial-compilation metadata) |
| Side effects | `sideEffects: false` |
| Tests | Angular CLI + Vitest builder, `TestBed`-based |
| Consumers | `@ultimate/ng` |
| Ownership | Ultimate — REFACTOR/ADAPT classification, file-level provenance tracked, `"reimplemented-with-reference"` status for genuinely rewritten base-class files |

### `@ultimate/ng`

| | |
|---|---|
| Purpose | Angular components: Button, Checkbox, Dialog, Menu, Tooltip (Phase 2 foundation set) |
| Public API | `UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip` standalone components/directives + their public Inputs/Outputs |
| Internal API | Per-component internal helpers not intended for direct external use |
| Dependencies | `@ultimate/ng-core`, `@ultimate/uix-*` |
| Peer dependencies | `@angular/{core,common,forms,platform-browser}` `^21.0.7`, `rxjs` |
| Exports | Secondary entry points per component: `@ultimate/ng/button`, `/checkbox`, `/dialog`, `/menu`, `/tooltip` — matching PrimeNG's own proven per-component APF shape, enabling real tree-shaking |
| Build output | Angular Package Format via `ng-packagr` |
| Side effects | `sideEffects: false` |
| Tests | Angular CLI + Vitest builder — rendering, inputs/outputs, a11y, CVA (Checkbox), overlay/focus/dismissal/motion (Dialog), keyboard nav (Menu), positioning/dismissal (Tooltip) |
| Consumers | none yet (Phase 2 is foundation only) |
| Ownership | Ultimate — ADAPT classification, file-level provenance tracked per component |

No further package fragmentation (e.g. `ng-forms`, `ng-overlay`) — matches the already-documented Phase 0 core/components tier split exactly, and there is no demonstrated need for finer fragmentation at 5 components.

---

## Public API Strategy

**Decision: Ultimate namespace applied now, in Phase 2 — both TypeScript-level and CSS-level.**

- **Selectors:** `p-button`→`u-button`, `p-checkbox`→`u-checkbox`, `p-dialog`→`u-dialog`, `p-menu`→`u-menu`, `p-tooltip`(directive selector)→`u-tooltip`/`uTooltip` equivalent. Exact final selector strings are an implementation-plan detail within this policy, not fixed component-by-component here.
- **Class names:** `Button`/`ButtonDirective`/`ButtonLabel`/`ButtonIcon` → `UButton`/`UButtonDirective`/`UButtonLabel`/`UButtonIcon`, and equivalently for the other 4 components.
- **CSS classes:** `.p-button` → `.u-button` and all BEM-style descendants (`.p-button-icon` → `.u-button-icon`, etc.) — renamed **now**, in the same phase as the TypeScript rename, not deferred. The corresponding `@ultimate/uix-styles/<component>` module's class-name strings are updated at incorporation time so the TS-level and CSS-level naming never mismatch.
- **Import paths:** `primeng/button` → `@ultimate/ng/button`.
- **Injection tokens:** renamed to Ultimate-scoped equivalents (e.g. `PARENT_INSTANCE`-equivalent, exact names deferred to implementation).

**Rationale:** Ultimate has no existing external consumer base for a PrimeNG-compatible API to protect. Renaming once now, while the surface is 5 components, avoids a second breaking migration later and eliminates any CSS-class collision risk if a consuming application ever runs `primeng` and `@ultimate/ng` side by side during a transitional period. This also keeps the TS and CSS layers consistent from day one, rather than creating a mismatched state where an Ultimate-named component renders Prime-named classes internally.

**Deferred:** no migration tooling (codemods, selector aliasing) is built in Phase 2 — see Migration Strategy. No further naming scheme changes within the same phase once `u-*` is adopted.

---

## Component Migration Strategy

Dependency-graph-derived sequence, based on the verified import relationships above (not an assumed generic ordering):

```text
Foundation (ng-core: base, basecomponent, baseeditableholder, bind, api-subset, config-subset)
    ↓
Overlay/focus infrastructure (ng-core: overlay, focustrap, ripple, autofocus, icons)
    ↓
Primitive components (ng: button — needs ripple/autofocus/badge/fluid, all foundation-tier)
    ↓
Form component (ng: checkbox — needs baseeditableholder, the CVA tier)
    ↓
Overlay proof case, lightweight (ng: tooltip — needs basecomponent/bind/dom/utils only, no cascade)
    ↓
Overlay proof case, heavy (ng: dialog — needs button, focustrap, motion; sequenced after button exists)
    ↓
Navigation (ng: menu — needs ripple, badge, tooltip; sequenced last since it depends on tooltip)
```

This ordering is a direct consequence of the real import graph confirmed above: `menu` is sequenced last specifically because it depends on `tooltip` (a non-obvious finding from direct source inspection); `dialog` is sequenced after `button` because it imports `Button` directly; `tooltip` is sequenced before `dialog` despite being a simpler overlay case, since `dialog`'s heavier overlay infrastructure (`focustrap`, `motion`) has no dependency on `tooltip` and the two can be validated independently, but `tooltip`'s own zero-cascade dependency profile makes it the natural first overlay validation.

Later-phase sequencing (full inventory, not built in Phase 2): remaining primitives → remaining form inputs → remaining overlay components (Popover, Drawer, ConfirmDialog/ConfirmPopup — building on Dialog's Phase 2 groundwork) → remaining navigation (Menubar, TieredMenu, MegaMenu — building on Menu's Phase 2 groundwork) → data components (Table, TreeTable, Tree, VirtualScroller/Scroller, Paginator — each a substantial sub-project, explicitly requiring a "Needs Architecture Decision" on a shared selection/sort/filter/virtualization contract before any of them begins).

---

## Component Inventory

Full ~117-directory inventory is a required Phase 2 deliverable artifact (`docs/architecture/COMPONENT_INVENTORY.md`), generated using the same 7-field schema (Component | Prime source path | Category | Dependencies | UIX dependencies | Angular-specific responsibilities | Style dependencies | Accessibility responsibilities | Migration classification | Migration phase | Risk) as this section's representative rows — not hand-written in full here.

| Component | Category | Dependencies (verified) | UIX deps | Style dep | A11y responsibility | Classification | Phase |
|---|---|---|---|---|---|---|---|
| Button | Primitive | basecomponent, bind, ripple, autofocus, badge, fluid, icons(Spinner), api | uix-utils, uix-styled | `uix-styles/button` | disabled state, loading state | ADAPT | **Phase 2** |
| Checkbox | Form | baseeditableholder, bind, api | uix-utils, uix-styled | `uix-styles/checkbox` | `role="checkbox"`, `aria-checked`, keyboard space-toggle, CVA | ADAPT | **Phase 2** |
| Dialog | Overlay | basecomponent, bind, button, focustrap, motion, dom, utils, icons(Times/WindowMax/WindowMin), api | uix-utils, uix-styled, uix-motion | `uix-styles/dialog` | `aria-modal`, `aria-labelledby`, focus trap, Escape dismissal, focus-return-on-close (**needs implementation-time verification**) | ADAPT | **Phase 2** |
| Menu | Navigation | basecomponent, bind, ripple, badge, tooltip, RouterModule(external), api | uix-utils, uix-styled | `uix-styles/menu` | `role="menu"`/`role="menuitem"`/`role="separator"`, roving tabindex (**needs implementation-time verification**) | ADAPT | **Phase 2** |
| Tooltip | Overlay | basecomponent, bind, dom(ConnectedOverlayScrollHandler), utils(ZIndexUtils), api | uix-utils, uix-styled | `uix-styles/tooltip` | `role="tooltip"` | ADAPT | **Phase 2** |
| Ripple, AutoFocus, Fluid, Badge, FocusTrap (transitive foundation) | Foundation/directive | basecomponent (mostly) | uix-utils | own `uix-styles` module where applicable | inherited from host component | ADAPT | **Phase 2** (as dependencies, not independently prioritized) |
| InputText, Password, Textarea, InputNumber, InputMask, InputOTP, RadioButton, ToggleSwitch, Select, DatePicker, etc. (~25 remaining form components) | Form | basemodelholder/baseeditableholder tier (established this phase) | uix-utils, uix-styled | per-component | label association, validation state | ADAPT | Later Phase |
| Popover, Drawer, ConfirmDialog, ConfirmPopup, ContextMenu, DynamicDialog | Overlay | overlay/dialog groundwork (established this phase) | uix-utils, uix-styled, uix-motion | per-component | dismissal, modal semantics | ADAPT | Later Phase |
| Menubar, TieredMenu, MegaMenu, PanelMenu, Breadcrumb, Steps, Stepper, Tabs | Navigation | menu groundwork (established this phase) | uix-utils, uix-styled, uix-motion | per-component | nested `aria-*`, keyboard nav | ADAPT | Later Phase |
| Table, TreeTable, Tree, Scroller, Paginator, OrderList, PickList, DataView | Data | primitive + overlay tiers | uix-utils, uix-styled | per-component | complex grid/tree ARIA patterns | ADAPT (each a sub-project) | Later Phase — **Needs Architecture Decision** on shared virtualization/selection/sort/filter contract before this tier begins |
| Chart | Data/visualization | wraps an external charting dependency | uix-utils | n/a | screen-reader chart summary | Needs Architecture Decision | Later Phase — depends on approving an external charting dependency |
| `config` (full surface), `passthrough`, `icons` (remaining ~85+), `api` (remaining surface) | Cross-cutting | applies to all future components | uix-utils | n/a | n/a | Needs Architecture Decision | Not resolved in Phase 2 — revisit once enough later-phase components create real pressure |
| Remaining ~65 components (Accordion, Card, Panel, Toast, Message, Avatar, Chip, Carousel, Galleria, Editor, etc.) | Mixed | varies | uix-utils (mostly) | per-component | varies | ADAPT (most) | Later Phase |

---

## Component Style Strategy

Confirmed architecture (matches what PrimeNG 21.1.9 already does — `buttonstyle.ts` imports `style` from `@primeuix/styles/button` and wraps it in a `BaseStyle`-extending `@Injectable`, verified directly):

```text
UltimateNG component → @ultimate/uix-styled (token resolution, stylesheet injection/dedup) → @ultimate/uix-styles/<component> (CSS-in-JS module, per-component)
```

For each of the 5 Phase 2 components: extract that component's style module (`button`, `checkbox`, `dialog`, `menu`, `tooltip`) from `.vendor-cache/@primeuix__styles-2.0.3.tar.gz` (already pinned and checksummed from Phase 1), add it as a new subpath export in `@ultimate/uix-styles` (`./button`, `./checkbox`, `./dialog`, `./menu`, `./tooltip`), following the existing `base` module's build/export/provenance pattern exactly, with `.p-*` class-name strings renamed to `.u-*` at incorporation time (per the Public API Strategy decision). No new styling mechanism invented; `@ultimate/uix-styled`'s token-resolution engine is unchanged. `ng-core`'s base-style-wrapper class (Ultimate's equivalent of PrimeNG's `BaseStyle`) registers each component's style module with `uix-styled`'s existing stylesheet service — the `_loadedStyleNames`-equivalent bookkeeping is not reimplemented in `ng-core`.

Encapsulation matches upstream: no `ViewEncapsulation.Emulated`; styles are token-resolved global class-based CSS, consistent with the `.u-*` selector strategy.

`packages/uix-styles`'s existing scope-guard test (Phase 1) must be updated, not removed, to allow exactly these 5 new modules (plus `base`) — still failing the build if an unrelated 6th module appears without a corresponding component.

---

## Angular Component Architecture

Representative pattern, confirmed via direct source inspection of `button.ts`, `basecomponent.ts`, `dialog.ts`, `menu.ts`:

- **Metadata:** `standalone: true` always (confirmed in every inspected file). `ChangeDetectionStrategy.OnPush` adopted as a deliberate Ultimate standard for every new component regardless of what the specific PrimeNG reference file uses (see Change Detection, below).
- **Inputs/outputs:** PrimeNG's own source mixes `input()`/`effect()` signal-based patterns with legacy `@Input()`/`@Output()` decorators in the same files (an in-progress migration within PrimeNG itself, confirmed in `button.ts`). Ultimate's adapted versions standardize on **signal-based `input()`/`output()` exclusively** — no decorator-based inputs/outputs in new Ultimate source.
- **Content projection:** `ContentChild`/`contentChild` forms for template-based customization (e.g. Button's icon template) — both forms present in reference source; Ultimate adopts the signal-based `contentChild` form for new code.
- **Host bindings:** `host: {...}` metadata property, not `@HostBinding`/`@HostListener` decorators — matches the reference source's own modern style.
- **DI:** field-initializer `inject()` calls, not constructor-injected parameters — matches reference source (confirmed throughout `basecomponent.ts`).
- **Lifecycle:** `effect()` for reactive side effects tied to signal inputs, adopted where it clarifies intent, not forced everywhere `ngOnChanges` would also work.
- **Templates:** inline template strings within the `@Component` decorator (confirmed in every inspected component) — Ultimate follows the same convention.

---

## Standalone vs NgModule

**Standalone only.** No `NgModule` is authored in `ng-core` or `ng`. PrimeNG's own `NgModule`-shaped exports exist purely for PrimeNG's own large, pre-existing external consumer base's backward compatibility — Ultimate has zero such consumers at Phase 2, so there is no compatibility obligation to replicate. Retaining NgModule support would be speculative future-proofing against a migration cost that doesn't exist (YAGNI), and contradicts the direction PrimeNG's own source is visibly moving (standalone-first architecture confirmed throughout the proof set).

---

## Change Detection and Performance

- **Strategy:** `ChangeDetectionStrategy.OnPush` for every Ultimate-authored component, regardless of what the specific PrimeNG reference file uses — a deliberate Ultimate standard consistent with Option B. Signal-based inputs make `OnPush` correctness straightforward.
- **No speculative optimization** beyond this standard — no manual `markForCheck()` micro-tuning, no virtual-DOM-style techniques, until a measured baseline shows a real problem.
- **Measured baselines to record at Phase 2 exit** (matching Phase 1's `PERFORMANCE.md` precedent — record, don't optimize against assumptions): `dist/` size and gzip size for both `ng-core` and `ng` (same methodology as `scripts/provenance/measure-package-size.mjs`); Dialog open/close timing (representative overlay operation); Tooltip show/hide timing; component-creation-cost spot-check for Button (cheapest) and Dialog (most complex of the five); tree-shaking spot-check confirming importing only `Button` does not pull in Dialog's overlay/focus-trap/motion dependencies (secondary-entry-point APF output should structurally guarantee this — verified empirically, not assumed).

---

## Accessibility

| Behavior | Classification | Evidence |
|---|---|---|
| Dialog: `aria-modal="true"`, `aria-labelledby` | RETAIN | Confirmed present at `dialog.ts:88-89` |
| Dialog: Escape-key dismissal | RETAIN | Confirmed via `bindDocumentEscapeListener` at `dialog.ts:991-992` |
| Dialog: focus trap | RETAIN | Uses `FocusTrap` directive, confirmed import and template usage |
| Dialog: focus return to trigger element on close | **Needs verification during implementation** — not confirmed present or absent at this investigation depth | Flagged, not assumed fine |
| Checkbox: `role`/`aria-checked`/keyboard toggle, CVA | RETAIN | Standard CVA + native `<input type="checkbox">` pattern; implementation verifies rendered markup preserves native semantics |
| Button: `aria-label`/disabled/loading state | RETAIN | Confirmed inputs exist |
| Menu: `role="menu"`/`role="menuitem"`/`role="separator"` | RETAIN | Confirmed at `menu.ts:191,203,212,223,238,248,263` |
| Menu: roving tabindex / arrow-key navigation | **Needs verification during implementation** — template shows `[attr.tabindex]` bindings but full keyboard-nav behavior not traced end-to-end at this depth | Flagged |
| Tooltip: `role="tooltip"` | RETAIN | Confirmed at `tooltip.ts:500` |
| Reduced motion (Dialog's enter/leave, Tooltip's fade) | RETAIN, inherited free | `@ultimate/uix-motion`'s `createMotion` already defaults `safe: true` (Phase 1 finding) |

No accessibility defect is confirmed and silently dropped — the "needs verification" rows are explicit flags for implementation-time confirmation. Any confirmed regression found during implementation blocks that component's Phase 2 completion.

---

## Overlay Architecture

**Decision: retain PrimeNG's homegrown overlay/focus-trap system, adapted into `ng-core`, not replaced with `@angular/cdk` Overlay.**

Rationale: `@angular/cdk` is a peer dependency at the whole-PrimeNG-package level but is confirmed unused anywhere in the 5-component proof-set's dependency closure. The homegrown overlay/focus-trap/positioning system is deliberately used instead, and this investigation found no defect in it — Dialog's Escape/focus-trap/`aria-modal` behavior and Tooltip's positioning/z-index/dismissal all confirmed present and functioning as designed in source. Replacing a working, already-accessible system with CDK Overlay would be an unmotivated rewrite.

Responsibility split:

- **`@ultimate/uix-motion`:** enter/leave class-based animation timing (already built, Phase 1) — used by Dialog.
- **`@ultimate/uix-utils`:** z-index management (`zindex` submodule, already built) — used by Tooltip and Dialog.
- **`@ultimate/ng-core`:** `Overlay` directive (positioning, append-target), `FocusTrap` directive (focus containment, tab-cycling) — both adapted from PrimeNG's proven implementation.
- **Component (`Dialog`):** wires `Overlay` + `FocusTrap` + `uix-motion` together, owns its own Escape-key/backdrop-dismissal logic (as PrimeNG's `Dialog` does today) — not abstracted into a shared "modal service" in Phase 2, since only one component needs it (YAGNI; revisit once Popover/Drawer migrate in a later phase and a real duplicate pattern is observed).
- **Component (`Tooltip`):** computes its own lightweight positioning directly via `@ultimate/uix-utils`'s DOM helpers (confirmed: no shared "overlay service" involved in the verified source) — a component responsibility, not `ng-core`'s.

SSR: `Overlay`/`FocusTrap`/Tooltip must guard actual DOM manipulation behind `isPlatformBrowser()` checks (confirmed pattern present in the reference source's `isPlatformBrowser` imports) — import-time safety is required, call-time DOM access remains inherently client-side.

---

## Forms Architecture

`Checkbox` implements `ControlValueAccessor` via the `NG_VALUE_ACCESSOR` provider pattern confirmed in the reference source (`writeValue`/`registerOnChange`/`registerOnTouched`, plus `NgControl` injection for validation-state access). This pattern lives in the `BaseEditableHolder`/`BaseInput` tier of `ng-core`'s base-class hierarchy so every future form-input component inherits it rather than reimplementing CVA wiring per component — the specific, concrete duplication this base-class tier exists to prevent.

Angular Reactive Forms (`FormControl`/`formControlName`) and template-driven forms (`ngModel`) are both supported, matching the reference source's dual support. Validation/error-state presentation itself is a component-level concern layered on top of the CVA plumbing, not part of `ng-core`'s shared responsibility, and is not built in Phase 2 beyond what Checkbox itself needs (no dedicated `FormField`/error-display component exists yet).

---

## Data Component Strategy

Not built in Phase 2. Table/TreeTable/Tree/Scroller/Paginator/OrderList/PickList/DataView are collectively classified **Needs Architecture Decision** in the Component Inventory — specifically, a shared selection/sort/filter/virtualization contract should be designed once, before the first data component starts, rather than each data component inventing its own state model independently. This decision point is explicitly deferred past Phase 2; designing that contract speculatively, before a real component needs it, would violate YAGNI.

---

## Dependency Rules

- **Forbidden runtime dependencies:** `primeng`, `primevue`, `primereact`, any `@primeuix/*` package — already enforced by `scripts/provenance/validate-dependency-ceiling.mjs:19`'s `WATCHED_PREFIXES = ["uix", "ng", "react", "vue"]`, confirmed by direct read of the script. **No CI script change needed** — `packages/ng*` is already covered.
- **Required dependencies:** `@ultimate/uix-{utils,styled,styles,motion}` via pnpm workspace protocol.
- **Peer dependencies:** `@angular/{core,common,forms,platform-browser}` at `^21.0.7`, `rxjs` — external, never vendored. `@angular/cdk`/`@angular/router` are not required by the Phase 2 proof set's own source (Menu's `RouterModule` usage is optional template functionality, not a hard compile-time dependency of the package itself — to confirm exact peer declaration during implementation).
- **`validate-boundaries.mjs` scope:** unchanged — protects `packages/uix*` from framework imports; does not need to (and should not) scan `packages/ng*` for the opposite direction.

---

## Provenance

Same model as Phase 1 (`PROVENANCE.md` package-level entries + `docs/architecture/provenance/<package>.json` file-level manifests), with a simpler extraction mechanism than Phase 1 needed:

- **Extraction mechanism:** direct `.ts` file extraction from `.vendor-cache/primeng-21.1.9.tar.gz` (confirmed to be a real git-archive containing complete original source — no sourcemap reconstruction needed, unlike Phase 1's `@primeuix/*` npm-tarball situation). A new `scripts/provenance/extract-primeng-source.mjs`, structurally similar to Phase 1's extraction script but simpler (untar + copy matching paths, no sourcemap parsing).
- **Manifest fields (per file):** `originalPath`, `ultimateDestination`, `modificationStatus` (`"unmodified"` | `"import-path-adapted"` | `"refactored"` | `"reimplemented-with-reference"`), `modificationDescription`, `sha256OfOriginal`. The `"reimplemented-with-reference"` status is new relative to Phase 1's vocabulary — needed because Option B means base-class files are genuinely rewritten with PrimeNG's file as a design reference, not adapted-in-place, and this must be distinguishable in the manifest from a verbatim or lightly-adapted file.
- **`docs/architecture/PROVENANCE.md` PrimeNG entry:** `Modification status` updated from "not yet incorporated" to reflect real Phase 2 incorporation of the 5-component set; `Ultimate destination` (already correctly pre-filled as `packages/ng`, `packages/ng-core`) confirmed accurate, noting only the Phase 2 subset is incorporated (remainder tracked via Component Inventory).
- **`validate-provenance.mjs` extension:** every `.ts` file under `packages/{ng-core,ng}/src/` must have a manifest entry — same pattern as Phase 1; confirm during implementation whether the script's file-discovery logic is generic or hardcoded to Phase 1's four package names, extending if needed.

---

## Licensing

- PrimeNG's `LICENSE.md`: confirmed (per Phase 0's existing record) to contain both the MIT "Community Versions" section (applies to `21.1.9`) and a separate commercial `-lts` section. `packages/ng/THIRD-PARTY-NOTICES.md` already correctly warns future maintainers to re-verify the absence of `-lts` before any version bump.
- Icons: the 5 needed icon components are PrimeNG's own Angular source (MIT, same license as the rest of `packages/primeng`) — no separate font/asset license concern.
- `@angular/cdk`, `@angular/router`: MIT-licensed, external peer dependencies, not vendored — ordinary peer-dependency license awareness only.
- Attribution: `packages/ng/THIRD-PARTY-NOTICES.md` and a new `packages/ng-core/THIRD-PARTY-NOTICES.md` both get the verbatim MIT community-license text + PrimeTek copyright line, matching the Phase 1 pattern.
- `@ultimate/uix-styles`'s 5 new modules are covered by the existing `packages/uix-styles/THIRD-PARTY-NOTICES.md` and `PROVENANCE.md`'s `@primeuix/styles` entry — an addition to an already-covered package, no new licensing question.

---

## Build Strategy

**`ng-packagr`**, not `tsup`. Angular Package Format output requires understanding Angular decorators, templates, and partial-compilation metadata — `ng-packagr` (which PrimeNG itself uses, confirmed via its `build` script) already solves this correctly; forcing `tsup` onto Angular source would mean reimplementing what `ng-packagr` provides for free.

- **Per-package `ng-package.json`:** one per package (`ng-core`, `ng`), with `ng`'s config declaring 5 secondary entry points (`button`, `checkbox`, `dialog`, `menu`, `tooltip`), matching the reference source's own per-component `ng-package.json` shape.
- **Output:** FESM2022 + `.d.ts`, matching modern Angular Package Format defaults.
- **TypeScript:** extends the repo's existing `tsconfig.base.json`, plus Angular's own required compiler options — implementation verifies the exact flag set Angular 21's compiler needs.
- **Orchestration:** `pnpm -r --if-present run build` (unchanged) — `ng`/`ng-core` slot into the existing plain-pnpm model the same way `uix-styled`/`uix-motion` already depend on `uix-utils`.

---

## Testing Strategy

**Angular CLI + Vitest builder** (Angular 21's `@angular/build` experimental Vitest unit-test builder), not Karma+Jasmine. Keeps Vitest-everywhere consistency with Phase 1 while still using real Angular `TestBed` for genuine component/DI/template testing.

- **Component behavior:** inputs/outputs, rendering output, lifecycle — `TestBed`-based, per component, for all 5.
- **Accessibility:** keyboard interaction (Tab/Escape/Arrow-key) and ARIA-attribute assertions per component (Dialog's `aria-modal`, Menu's roving tabindex, Checkbox's `aria-checked`, Tooltip's `role="tooltip"`) — automated `TestBed` + DOM assertions.
- **Forms:** Checkbox's CVA contract tested directly — `writeValue`/`registerOnChange`/`registerOnTouched` call verification, `FormControl` integration round-trip.
- **Overlay:** Dialog's open/close, Escape dismissal, focus trap entry/exit, backdrop click, motion transition. Tooltip's show/hide, positioning, scroll-triggered dismissal (`ConnectedOverlayScrollHandler` behavior).
- **Navigation:** Menu's keyboard arrow-navigation, item activation, tooltip-on-truncated-label integration (validating the Menu→Tooltip dependency this spec surfaced).
- **Styling:** package/export test confirming each `@ultimate/uix-styles/<component>` subpath resolves once added.
- **SSR:** an import-only test confirming `ng-core`/`ng` modules import cleanly under a simulated server (no DOM globals) for all 5 components, given that Dialog and Tooltip both touch the DOM conditionally.
- **Package exports:** every declared `ng-core`/`ng` public export resolves — same pattern as Phase 1's exports tests.
- **Dependency boundaries:** existing `ceiling:validate` (already watches `ng`), confirmed to also cover `ng-core` once it has a real `package.json` (the script's `WATCHED_PREFIXES` generically prefix-matches any `packages/{uix,ng,react,vue}*` directory).
- **Framework boundary:** no React/Vue imports anywhere in `ng-core`/`ng` — no dedicated new validator required in Phase 2 (no React/Vue package exists yet to accidentally import); flagged as an Open Question rather than mandated now.
- **Build:** `pnpm install --frozen-lockfile && pnpm run build` from clean checkout must succeed for both packages.

---

## Storybook

PrimeNG mirror stories (if any exist from Phase 0/1 — not confirmed present in this investigation) represent source-fidelity documentation and are explicitly not modified into UltimateNG stories. No unified Storybook redesign in Phase 2. The 5 Phase 2 components may get their own new Ultimate-authored stories demonstrating Ultimate's public API, as a documentation nice-to-have, not a Phase 2 gate. Full Storybook integration strategy for the unified future state is deferred to whichever later phase first needs to present multiple frameworks' components together.

---

## AI/Metadata Constraints

No CLI/MCP/Skills/AI implementation in Phase 2. Public component APIs (signal-based `input()`/`output()` signatures) are already self-describing via TypeScript types and TSDoc comments — sufficient structure for a future metadata generator to consume without Phase 2 needing to build that generator or a dedicated schema now.

---

## Migration Strategy (Prime → Ultimate compatibility)

No compatibility tooling (codemods, selector aliases, automated migration scripts) is implemented in Phase 2 — there is no existing PrimeNG-consuming application in this repository to migrate, so building migration tooling now would have no user to validate it against. Since selectors/class names are Ultimate-renamed in Phase 2 (not compatibility-preserved), an application already using real PrimeNG would need explicit code changes (not merely an import-path swap) to adopt `@ultimate/ng` — this cost is accepted per the Public API Strategy decision above, and documented for future migration-guide authors, not built as tooling now.

---

## Security

- **DOM manipulation:** `Renderer2`-based (confirmed in Dialog's Escape-key handler), standard sanitizer-respecting Angular API, not raw `document` manipulation. No `innerHTML` usage identified in the 5 inspected components.
- **Dynamic component creation:** not used by the Phase 2 set (all 5 are template-declared, not `ComponentRef`-instantiated). `dynamicdialog`-style programmatic instantiation is explicitly deferred, and its security review (a more sensitive pattern) is correctly deferred alongside it.
- **User-provided content:** none of the 5 components render arbitrary user HTML directly via string injection — Menu's `SafeHtmlPipe` (confirmed present in `menu.ts`) explicitly routes through Angular's `DomSanitizer`, not raw `innerHTML`. No XSS-shaped pattern identified requiring dedicated new tests beyond ordinary Angular template-binding safety.
- **No `eval`/`Function` constructor usage** identified in any inspected source file.
- **Dependency-vulnerability scanning:** no new external dependency introduced beyond `@ultimate/uix-*` (internal) and `@angular/*` (already-accepted peer ecosystem).

---

## Performance

Baseline-recording only (not a budget, matching Phase 1's framing):

- `dist/` size + gzip size for `ng-core` and `ng`, using `measure-package-size.mjs`'s existing methodology.
- Dialog open/close timing and Tooltip show/hide timing (representative overlay-operation costs) via a throwaway benchmark harness, not a permanent gate.
- Component-creation-cost spot-check for Button (cheapest) vs. Dialog (most complex of the five).
- Tree-shaking spot-check: confirm importing only `Button` does not pull in Dialog's overlay/focus-trap/motion dependencies into the bundle.

---

## Documentation

Per-package `README.md` (purpose, public API, Prime-derived-vs-Ultimate-owned distinction, provenance linkage) — same pattern as Phase 1. Per-component documentation (Button, Checkbox, Dialog, Menu, Tooltip) covers: PrimeNG foundation (which reference component, what changed under Option B), Ultimate behavior, public API (TSDoc-derived), styling (which `uix-styles` subpath), accessibility (from the table above), and migration notes (naming changed to `u-*` — see Public API Strategy). No public documentation site built in Phase 2.

---

## Deliverables

```text
Packages (source + config):
  packages/ng-core/{src/,package.json,ng-package.json,README.md,THIRD-PARTY-NOTICES.md (new)}
  packages/ng/{src/,package.json,ng-package.json,README.md,THIRD-PARTY-NOTICES.md (populated)}

Foundation components (in packages/ng/src/):
  button/, checkbox/, dialog/, menu/, tooltip/ — each with component + spec (Vitest/TestBed) + style registration

ng-core contents:
  base-component hierarchy (UBaseComponent/UBaseEditableHolder/UBaseInput)
  overlay/, focustrap/, ripple/, autofocus/ directives
  icons/ (5: Spinner, Times, WindowMaximize, WindowMinimize, BaseIcon)
  config service (minimal subset)

Provenance:
  scripts/provenance/extract-primeng-source.mjs (new)
  docs/architecture/provenance/ng-core.json (new)
  docs/architecture/provenance/ng.json (new)
  docs/architecture/PROVENANCE.md (PrimeNG entry updated: Modification status, Date incorporated, scope note)

UIX extension (per ADR-017's own plan):
  packages/uix-styles/ gains ./button, ./checkbox, ./dialog, ./menu, ./tooltip subpath exports + provenance manifest entries
  packages/uix-styles/test/scope-guard.test.ts updated to allow exactly these 5 new modules

Component inventory:
  docs/architecture/COMPONENT_INVENTORY.md (new) — full ~117-row table per the pattern established in this spec's Component Inventory section

Architecture decisions:
  docs/architecture/DECISIONS.md — new ADRs: Option B (Ultimate-owned architecture), standalone-only/no NgModule, homegrown overlay retained over CDK, ng-packagr build tooling, Angular CLI+Vitest test builder, Ultimate-first API naming applied in Phase 2

Dependency policy: no script changes needed (ceiling check already covers packages/ng* including ng-core; boundary check correctly does not need extension) — documented as a finding, not silently assumed

CI: verify existing pipeline steps exercise ng-core/ng non-trivially once they exist; no new job type needed

Performance baseline: recorded in docs/architecture/PERFORMANCE.md (appended)

Documentation: per-package + per-component READMEs
```

---

## Risks

| Risk | Impact | Likelihood | Mitigation | Decision point |
|---|---|---|---|---|
| PrimeNG source divergence (future Prime releases move further from 21.1.9) | Growing gap makes future security-advisory backporting harder | Medium | No continuous sync is planned regardless; advisories evaluated case-by-case | Ongoing, per advisory |
| Angular version compatibility (Angular 22+ breaking changes) | `@ultimate/ng` may need rework independent of PrimeNG's own timeline | Medium | Deliberate-lag upgrade strategy | Start of each phase touching `@ultimate/ng` |
| API divergence from PrimeNG growing over time | Harder to reference upstream docs/issues for debugging | Low (accepted trade-off) | Provenance manifest always links back to exact original source | N/A — accepted by Public API Strategy |
| Component migration scale (~117 areas, 5 done) | Long runway before the platform is broadly usable | High (known, accepted) | Explicit staged migration sequence; each later phase re-scopes its own tier | Start of each subsequent phase |
| Overlay complexity beyond Phase 2's Dialog/Tooltip scope | Popover/Drawer/Select-family phase is high-surface | Medium | Explicitly scoped out of Phase 2; dedicated design pass recommended when that phase starts | Start of the next overlay-tier phase |
| Forms integration beyond Checkbox | CVA/validation edge cases easy to get subtly wrong at scale | Medium | Explicit CVA-conformance test requirement now; broader form-field/error-presentation pattern deferred | Start of the forms-tier phase |
| Accessibility regressions during API rename | Renaming classes/selectors could silently drop an ARIA binding | Low-Medium | Explicit per-component a11y test coverage (this spec's Testing Strategy) | Per-component migration, ongoing |
| Menu→Tooltip dependency underestimated in earlier planning | Confirms the value of direct source verification over assumption; already corrected in this spec | Resolved | Direct source inspection performed for every proof-set component before finalizing scope | N/A — already mitigated |
| Performance regressions | None expected at 5-component scale, but no baseline existed before Phase 2 | Low | Baseline recorded now, before scale grows | Each subsequent phase compares against this baseline |
| SSR/hydration issues (Dialog/Tooltip DOM-touching behavior) | Both proof-set overlay components are in scope this phase | Medium | Explicit SSR import-safety tests required in Testing Strategy | Implementation review |
| Styling integration correctness | `uix-styles` class renames must exactly match `@ultimate/ng`'s class-resolver strings | Medium | Both live in the same PR/commit; export test + visual smoke check | Implementation review |
| Prime dependency leakage | A future contributor could accidentally add `primeng` as a dev dependency | Low | `ceiling:validate` already blocks any `packages/ng*` declaration of forbidden deps | Ongoing CI |
| Provenance gaps | Missing or incomplete manifest entries for incorporated files | Low | `validate-provenance.mjs` pattern extended to `ng*` | Implementation review |
| Build complexity (ng-packagr vs tsup mismatch across the monorepo) | Root `pnpm -r run build` must correctly invoke ng-packagr for `packages/ng*` while using tsup elsewhere | Low | Each package's own `build` script encapsulates its tool choice; root orchestration is tool-agnostic | Implementation |
| Maintenance burden (second build/test toolchain) | Contributors need Angular-specific tooling knowledge in addition to the existing tsup/Vitest stack | Medium (accepted trade-off) | Documented in `packages/ng/README.md`; inherent to supporting a real Angular framework | N/A — accepted |
| Future React/Vue symmetry | Decisions made here (per-component secondary-entry-point shape, UIX-delegation pattern for styles) should be checked for reusability when Phase 3/4 begin | Low | This spec's sections are written framework-agnostically where possible | Start of Phase 3 |

---

## Decisions vs Open Questions

### Already decided (Blueprint / Phase 0 / Phase 1, unchanged)

- No Prime runtime dependency.
- MIT-only incorporation.
- UltimateUIX must remain framework-neutral; dependency direction is one-way.
- Independent package versioning.
- Provenance model: `PROVENANCE.md` + file-level JSON manifests.
- Angular target `^21.0.7` (already recorded in `COMPATIBILITY.md` prior to this spec).

### Phase 2 decisions (made in this spec, approved by user)

- Baseline is PrimeNG `21.1.9`, not the brief's stated `17.18.15` (documented deviation).
- Two-package split: `@ultimate/ng-core` + `@ultimate/ng`.
- Ultimate-first API rename applied now — selectors, class names, **and CSS classes** — in Phase 2, not deferred.
- Phase 2 proof set: Button, Checkbox, Dialog, Menu, Tooltip (5 components, expanded from an initial 4 after direct source inspection revealed Menu's genuine Tooltip dependency).
- Option B: Ultimate-owned base-class architecture, informed by but not copied from PrimeNG.
- Standalone-only; no NgModule exports.
- Homegrown overlay/focus-trap system retained, not replaced with `@angular/cdk` Overlay.
- Build via `ng-packagr`, not `tsup`.
- Testing via Angular CLI + Vitest builder, not Karma/Jasmine.
- Angular upgrade strategy: independent tracking with deliberate lag.

### Open questions (requiring resolution during implementation)

- Exact final class/selector naming strings within the fixed `u-*` policy (e.g. `UButton` vs `UltimateButton`).
- Exact peer-dependency declaration for `@angular/router` given Menu's optional `routerLink` template usage — hard peer or documented optional integration.
- `config`'s full surface, `passthrough`, remaining `api` surface, remaining ~85+ icons — all flagged Needs Architecture Decision, not resolved here.
- Whether `validate-provenance.mjs`'s file-discovery logic needs extension to generically find any `docs/architecture/provenance/*.json` or is hardcoded to Phase 1's four filenames.

### Deferred decisions (explicitly postponed)

- Shared overlay/portal abstraction beyond Dialog's own wiring (revisit once Popover/Drawer migrate).
- Data component (Table/Tree/etc.) architecture and its shared selection/sort/filter/virtualization contract.
- Full accessibility audit beyond the 5-component proof set.
- Migration/codemod tooling from PrimeNG.
- Storybook architecture changes.
- Theme layer (later phase, per Blueprint).

---

## Phase Exit Criteria

- `@ultimate/ng-core` and `@ultimate/ng` build independently via `pnpm -r run build` from a clean checkout, using `ng-packagr`.
- Button, Checkbox, Dialog, Menu, Tooltip are implemented as standalone Angular 21 components with Ultimate-owned base-class architecture (not lifted PrimeNG internals) and full Ultimate naming (selectors, classes, CSS classes).
- Zero `primeng`/`primevue`/`primereact`/`@primeuix/*` runtime dependencies in either package (`ceiling:validate` passes).
- `@ultimate/uix-styles` gains `./button`, `./checkbox`, `./dialog`, `./menu`, `./tooltip` subpath exports with provenance manifests, class names renamed `.p-*`→`.u-*`.
- All 5 components' Vitest/TestBed suites pass: rendering, inputs/outputs, accessibility (keyboard/ARIA), Checkbox's CVA contract, Dialog's overlay/focus-trap/Escape/motion behavior, Menu's keyboard navigation and Tooltip integration, Tooltip's positioning/dismissal.
- Package/export tests pass for both packages.
- Dependency-boundary tests pass (`ceiling:validate`, `boundary:validate`).
- Build passes from a clean checkout.
- Full ~117-area component inventory classification documented (`COMPONENT_INVENTORY.md`), even though only ~11 areas are implemented (5 components + foundation-tier dependencies).
- Performance baseline recorded (not assumed).
- Documentation exists for all 5 migrated components.
- `docs/architecture/DECISIONS.md` updated with Phase 2's ADRs.

---

## Non-Goals

- React or Vue implementation.
- Corporate/custom theme implementation.
- CLI, MCP, Skills, or AI runtime integration.
- Public npm publish or GitHub public release.
- Automatic Prime synchronization mechanism.
- Arbitrary API redesign beyond the namespace rename decided in this spec (internal architecture concepts — signals, `OnPush`, standalone — are retained in spirit via Option B's "informed by, not copied from" approach, not redesigned for its own sake).
- Arbitrary selector renaming beyond the fixed Ultimate-first `u-*` policy.
- Migration of the full ~117-area PrimeNG inventory — only the 5-component proof set plus its verified foundation-tier dependencies.
- Speculative performance rewrites — only measurement.
- Data-component implementation (Table/Tree/etc. — explicitly deferred pending a shared virtualization contract decision).
- Overlay implementation beyond Dialog and Tooltip's own needs (no shared portal/modal-service abstraction built speculatively).
- Storybook architecture redesign.
- Migration tooling (codemods, aliasing) from PrimeNG.
- `@angular/cdk` Overlay adoption (homegrown system retained; no defect found motivating a switch).
