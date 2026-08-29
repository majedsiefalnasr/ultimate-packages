# Phase 2 — UltimateNG Foundation & Angular Component Framework

**Status:** Draft for review
**References:** `ULTIMATE_PLATFORM_BLUEPRINT.md` (§5-14, §28-35), `docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md`, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`, `docs/architecture/{PROVENANCE,DEPENDENCIES,COMPATIBILITY,PACKAGE_ARCHITECTURE,DECISIONS,PERFORMANCE}.md`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

---

## Context

Phase 0 pinned and MIT-verified the PrimeNG baseline; Phase 1 turned four `@primeuix/*` packages into framework-neutral `@ultimate/uix-*` packages. `packages/ng/` exists only as a `THIRD-PARTY-NOTICES.md` stub. No Angular source has been incorporated. `docs/architecture/PROVENANCE.md`'s PrimeNG entry is pinned but unincorporated ("Modification status: not yet incorporated (Phase 0 — baseline pinned only)").

Phase 2 is the first phase incorporating Prime-derived **Angular** source. Its job is to establish `UltimateNG` — an Ultimate-owned Angular component framework, built on `UltimateUIX`, seeded from the verified PrimeNG 21.1.9 MIT baseline.

### Deviation: brief specified PrimeNG 17.18.15; repo baseline is 21.1.9

**Finding:** The originating brief for this specification referenced "PrimeNG 17.18.15" throughout. No occurrence of that version string exists anywhere in this repository — not in `PROVENANCE.md`, `COMPATIBILITY.md`, `DECISIONS.md`, `checksums.json`, `scripts/provenance/vendor-snapshot.mjs`, or the Blueprint itself. The Blueprint (§7, written before Phase 0) already named PrimeNG `21.1.9` as the baseline candidate. Phase 0 independently pinned, verified, and checksummed PrimeNG `21.1.9` at exact commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` (ADR-005, accepted). `packages/ng/THIRD-PARTY-NOTICES.md` already states "This package will incorporate source derived from `primeng@21.1.9`."

**Impact:** 21.1.9 and 17.x are architecturally distant — 21.1.9 ships standalone-only new components (legacy `NgModule` wrappers exist solely as deprecated back-compat shims), pervasive Angular signals (`input()`, `effect()`, `computed()`), an `@angular/cdk` peer dependency used only incidentally (5 files, drag-drop), and homegrown overlay/focus-trap infrastructure. A 17.x-targeted spec would describe a materially different codebase.

**Options:** (a) treat 17.18.15 as an error and spec against the actual pinned 21.1.9 baseline; (b) halt and require Phase 0/1 provenance to be corrected and re-pinned to 17.18.15 before Phase 2 specification can proceed.

**Recommendation:** (a). Per this spec's own governing instruction ("treat the repository's current state as authoritative... do not re-invent decisions already made in Phase 0"), and confirmed via investigation that 21.1.9 is a deliberate, fully-verified, ADR-recorded decision (not an unreviewed default).

**Decision required:** Confirmed by user — proceed against PrimeNG 21.1.9. Resolved; not open.

---

## Objective

Establish `UltimateNG` as two independently owned, independently buildable, independently testable Angular packages (`@ultimate/ng-core`, `@ultimate/ng`), seeded from the verified PrimeNG 21.1.9 MIT baseline, consuming `UltimateUIX` for framework-neutral infrastructure, with complete file-level provenance, zero prohibited Prime runtime dependencies, and a working foundation component set (Button, Checkbox, Dialog, Menu) proving the architecture end-to-end.

---

## PrimeNG 21.1.9 Baseline Findings

Investigated directly from `.vendor-cache/primeng-21.1.9.tar.gz` (git-archive of the full PrimeNG monorepo at the pinned commit — **not** an npm package tarball, so it contains complete original TypeScript source, unlike Phase 1's `@primeuix/*` situation).

- **Monorepo layout:** `packages/{primeng,themes,mcp}`, `apps/` (showcase — never a source of library code), root `LICENSE.md` (dual MIT/community + `-lts` commercial, confirmed via direct read — matches Phase 0's `PROVENANCE.md` claim verbatim).
- **Package identity:** `primeng@21.1.9`, description confirms "80+ components." `peerDependencies`: `@angular/{cdk,common,core,forms,router,platform-browser}` all at `catalog:angular21` (Angular 21.x), `rxjs: ^6.0.0 || ^7.8.1`. Runtime `dependencies`: `@primeuix/{styled,utils,styles,motion}` at catalog-pinned versions — the exact four packages Phase 1 already incorporated.
- **Build tooling:** `ng build primeng` (Angular CLI + `ng-packagr`, confirmed via root `build` script and per-component `ng-package.json` files with `{"lib": {"entryFile": "public_api.ts"}}`).
- **Test tooling:** Karma + Jasmine (`ng test primeng`, `karma-jasmine` devDependency). 96 `.spec.ts` files found colocated with component source.
- **Directory structure:** 118 top-level directories under `packages/primeng/src/`. ~22 are shared infrastructure (`api`, `base`, `basecomponent`, `baseeditableholder`, `baseinput`, `basemodelholder`, `bind`, `classnames`, `config`, `dom`, `focustrap`, `icons`, `motion`, `overlay`, `passthrough`, `ripple`, `styleclass`, `ts-helpers`, `types`, `usestyle`, `utils`, `autofocus`); the remaining ~95 are components/directives, consistent with the package's own "80+" claim (some directories are small directives, not full components).
- **Base class hierarchy:** `BaseComponent` (foundational — DI-injected `document`/`platformId`/`config`/theme service, `dt`/`unstyled` signal inputs, parent-instance linkage via `InjectionToken`) → `BaseEditableHolder` (adds editable/CVA-adjacent state) → `BaseInput` (form-input-specific). Confirmed via direct source read of `basecomponent/basecomponent.ts`.
- **Standalone architecture:** 210 occurrences of `standalone: true` vs. 87 of `standalone: false`; 104 files still contain an `@NgModule({...})` decorator. Direct inspection (`iconfield.ts`) confirms the pattern: a standalone component plus a trailing `@NgModule({imports:[X], exports:[X]}) export class XModule {}` — a thin deprecated backward-compatibility wrapper, not a parallel non-standalone implementation. **New Ultimate architecture should be standalone-only; no NgModule wrappers.**
- **Signals usage:** Pervasive. `Button`'s own source uses `input()`, `effect()`, `inject()`, `computed()` alongside legacy `@Input()`/`@Output()` decorators in the same file — an in-progress, not fully complete, migration to signals within PrimeNG itself.
- **Overlay infrastructure:** Homegrown (`primeng/overlay`, `primeng/focustrap`), not `@angular/cdk` Overlay. `@angular/cdk` peer dependency is used in only 5 files total (Listbox/Picklist/Orderlist drag-drop) — confirmed via repo-wide grep. Dialog implements Escape-key dismissal via a manual `Renderer2.listen(document, 'keydown', ...)` and focus trapping via the homegrown `FocusTrap` directive, not CDK's `A11yModule`.
- **Forms integration:** `NG_VALUE_ACCESSOR` provider pattern with `writeValue`/`registerOnChange`/`registerOnTouched` (confirmed in `checkbox.ts`), plus direct `NgControl`/`FormControl` injection support.
- **Accessibility:** `aria-labelledby`, `aria-modal="true"` present on Dialog's overlay panel; Escape-key handling wired explicitly. Present but component-by-component, not centralized.
- **Styling:** Every component's `style/<name>style.ts` file imports directly from `@primeuix/styles/<component-name>` (confirmed: `button/style/buttonstyle.ts` does `import { style } from '@primeuix/styles/button'`) and wraps it with `BaseStyle`/`@Injectable()`. This is exactly the per-component style module set Phase 1 (ADR-017) deliberately deferred — confirming Phase 1's plan was correct and Phase 2 is where those modules get incorporated.
- **Icons:** 57 self-contained Angular icon components under `primeng/icons` (e.g. `SpinnerIcon`, `TimesIcon`), imported directly by consuming components (`Button` imports `SpinnerIcon`). **No `primeicons` runtime dependency** — icons are Angular components, not an external font/package.
- **SSR-awareness:** `isPlatformServer`/`isPlatformBrowser` referenced in 38 files — SSR is an addressed, not absent, concern in the source.
- **License:** Root `LICENSE.md` confirmed to contain both the MIT "PRIMENG COMMUNITY VERSIONS LICENSE" (applies to `21.1.9`, no `-lts` suffix) and a separate commercial "PRIMENG LTS VERSIONS LICENSE" — matching `packages/ng/THIRD-PARTY-NOTICES.md`'s existing warning verbatim.

---

## Angular Baseline

**Target: Angular `^21.0.7` and up** (already recorded in `docs/architecture/COMPATIBILITY.md`, derived directly from PrimeNG 21.1.9's own peer range — not independently chosen by this spec).

- **Standalone components only.** No new `NgModule` is authored anywhere in `ng-core`/`ng`. PrimeNG's own `NgModule` wrappers exist only for its own backward compatibility with pre-standalone consumers — Ultimate has no such legacy consumer base to support, so this spec's Non-Goal list excludes NgModule support entirely (see Non-Goals).
- **Signals:** used where PrimeNG 21.1.9 already uses them (component inputs via `input()`, reactive internal state via `signal()`/`computed()`/`effect()`). Not a wholesale rewrite of every `@Input()` to signal inputs beyond what the reference source already demonstrates — Phase 2 follows the baseline's own migration state, it does not race ahead of it.
- **Control flow syntax:** new `@if`/`@for` syntax in templates, matching the modern Angular baseline; no reason to author new templates with legacy `*ngIf`/`*ngFor`.
- **`@angular/cdk`:** remains an external peer dependency (never vendored), used sparingly and only where a component's Ultimate-owned implementation genuinely needs it (e.g. drag-drop, if a migrated component requires it) — not adopted wholesale as an overlay-system replacement in Phase 2 (see Overlay Architecture).
- **SSR/hydration:** Ultimate-owned components must be import-safe under SSR (no top-level `document`/`window` access), matching the `isPlatformServer`/`isPlatformBrowser` guard pattern already present in the reference source. Full SSR/hydration integration testing is scoped to the Testing Strategy below, not deferred, but a dedicated Angular SSR demo app is out of scope (no `packages/ng` consumer app exists yet).
- **TypeScript:** matches the repo's existing `tsconfig.base.json` (`strict`, `ES2022`) — no separate TypeScript floor needed; Angular 21's own minimum TypeScript version is compatible with the repo's existing configuration.

---

## PrimeNG Source Scope

| Area | Classification | Rationale |
|---|---|---|
| Component templates/logic (Button, Checkbox, Dialog, Menu — Phase 2 set) | **ADAPT** | Reference source restructured into Ultimate's own `BaseComponent`-equivalent and public API; behavior preserved, internal architecture not lifted verbatim (Option B). |
| `basecomponent`/`baseeditableholder`/`baseinput` | **REFACTOR** | Reimplemented as Ultimate's own base-directive hierarchy; PrimeNG's DI-token parent-linkage pattern, config-service wiring, and theme-service coupling are design references, not copy targets. |
| `overlay`, `focustrap` | **ADAPT** | Retained as Angular-specific overlay/focus-trap directives (this is exactly the kind of Angular-native concern `ng-core` exists for), adapted to Ultimate's base-component hierarchy and import paths. Not replaced with `@angular/cdk` Overlay in Phase 2 (see Overlay Architecture — no demonstrated need to switch a working, accessible, homegrown system). |
| `ripple` | **ADAPT** | Small, self-contained directive; adapted into `ng-core`. |
| `icons` (57 components) | **ADAPT** | Adapted wholesale into `ng-core`; no reason to trim a self-contained, dependency-free icon set (Blueprint §2.8 minimal reinvention). |
| `api` (shared interfaces/config, e.g. `PrimeTemplate`, `SharedModule`) | **ADAPT** | `PrimeTemplate`-equivalent content-projection helper is genuinely Angular-specific and needed; `SharedModule`-style NgModule export is **REMOVE** (no NgModule support). |
| `config` (`PrimeNG` global config service) | **ADAPT** | Renamed/reworked as Ultimate's own config service; same DI-injectable responsibility (global defaults, ripple/theme toggles). |
| `dom`, `utils`, `classnames`, `ts-helpers`, `types` (PrimeNG's own internal copies) | **REMOVE** | Duplicate functionality already owned by `@ultimate/uix-utils` (confirmed: PrimeNG's `dom`/`classnames` helpers are thin wrappers or aliases around what `@primeuix/utils` already provides at the framework-neutral layer — Angular components should import `@ultimate/uix-utils` directly, not maintain a second copy). |
| `motion`, `usestyle` (Angular-side motion/style-injection helpers) | **REPLACE WITH UIX** | Superseded by `@ultimate/uix-motion` and `@ultimate/uix-styled`'s stylesheet service directly; no Angular-specific reimplementation needed — these were framework-neutral concerns already. |
| `bind` (a small directive binding pass-through attributes) | **ADAPT** | Angular-specific (host binding mechanics), retained. |
| `passthrough` | **DEFER** | Pass-through-props (`pt`) customization API — real PrimeNG feature, but not required for the Phase 2 foundation set to prove the architecture; revisit when a component's Phase-2-or-later migration demonstrates real need. |
| `styleclass` (a scroll/class-toggle utility directive) | **DEFER** | Not a dependency of the Phase 2 foundation set (Button/Checkbox/Dialog/Menu don't use it); classify per-component when its owning use case migrates. |
| All other ~91 components outside the Phase 2 foundation set | **DEFER** | See Component Inventory — classified individually, not migrated in Phase 2. |

**Duplicate-with-UIX classification (Ownership §6 requirement):**

| PrimeNG area | Classification |
|---|---|
| `dom`, `classnames`, `utils`, `ts-helpers` | REMOVE (use `@ultimate/uix-utils` directly) |
| `motion` | REPLACE WITH UIX (`@ultimate/uix-motion`) |
| `usestyle` (style injection) | REPLACE WITH UIX (`@ultimate/uix-styled`'s stylesheet service) |
| `overlay`, `focustrap`, `ripple`, `icons`, `bind`, `config`, base-class hierarchy | RETAIN FOR ANGULAR-SPECIFIC REASONS (genuine Angular lifecycle/DI/template concerns, no framework-neutral equivalent possible) |

---

## UltimateUIX Relationship

Dependency direction is one-way: `ng-core`/`ng` → `@ultimate/uix-{utils,styled,styles,motion}`. UIX never imports Angular (enforced already by `scripts/provenance/validate-boundaries.mjs`, unchanged — it already scans `packages/uix*` for framework imports; no extension needed since the rule is symmetric only in the sense that `ng*` packages are separately scanned by the ceiling script, not the boundary script, which is correct — UIX-side purity is what `validate-boundaries.mjs` protects).

`ng-core` consumes: `@ultimate/uix-utils` (DOM helpers, object helpers, classnames — replacing PrimeNG's own internal copies per the REMOVE classification above), `@ultimate/uix-styled` (token resolution, stylesheet registration — replacing `usestyle`), `@ultimate/uix-motion` (enter/leave orchestration for Dialog's overlay animation — replacing PrimeNG's Angular-side `motion` folder), `@ultimate/uix-styles` (base CSS + new per-component subpaths added as each component migrates, per ADR-017).

---

## Ownership Boundaries

- **Belongs in `ng-core`:** Ultimate's own base-component hierarchy, overlay/focus-trap/ripple directives, icon components, global config service, DI tokens shared across components.
- **Belongs in `ng`:** actual rendered components (Button, Checkbox, Dialog, Menu in Phase 2), their per-component style module registration.
- **Belongs in UIX (already built):** framework-neutral utilities, token resolution, motion orchestration, base/global CSS, and now (this phase) the growing set of per-component style modules as each component migrates.
- **Must remain external:** `@angular/*`, `primeng`, `@primeuix/*` current packages, `rxjs`, `tslib`.

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
| Purpose | Angular-specific foundation: base component/directive hierarchy, overlay + focus-trap + ripple infrastructure, icon component set, global config service, shared DI tokens |
| Public API | `BaseComponent`, `BaseEditableHolder`, `BaseInput` (Ultimate-owned base classes), `Overlay`, `FocusTrap`, `Ripple` directives, icon components (subset needed by Phase 2 components; full 57-icon set migrated wholesale per ADR above), `UltimateConfig` service (renamed from PrimeNG's `PrimeNG` service) |
| Internal API | Parent-instance DI-token linkage pattern (internal wiring, not re-exported as public contract) |
| Dependencies | `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, `@ultimate/uix-styles` |
| Peer dependencies | `@angular/{core,common,forms,platform-browser}` `^21.0.7`, `rxjs` |
| Build output | Angular Package Format via `ng-packagr` (FESM2022, `.d.ts`, partial-compilation metadata) |
| Side effects | none declared beyond what Angular decorators require (standard for Angular libraries) |
| Tests | Angular CLI + Vitest builder, TestBed-based |
| Consumers | `@ultimate/ng` |
| Ownership | Ultimate — architecture REFACTORed/ADAPTed from PrimeNG reference, file-level provenance tracked |

### `@ultimate/ng`

| | |
|---|---|
| Purpose | Angular components: Button, Checkbox, Dialog, Menu (Phase 2 foundation set) |
| Public API | `Button`, `Checkbox`, `Dialog`, `Menu` standalone components + their public Inputs/Outputs |
| Internal API | none beyond what's needed internally by these four components |
| Dependencies | `@ultimate/ng-core`, `@ultimate/uix-*` |
| Peer dependencies | `@angular/{core,common,forms,platform-browser}` `^21.0.7`, `rxjs` |
| Build output | Angular Package Format via `ng-packagr` |
| Side effects | none declared |
| Tests | Angular CLI + Vitest builder — rendering, inputs/outputs, a11y, CVA (Checkbox), overlay/focus/dismissal (Dialog), keyboard nav (Menu) |
| Consumers | none yet (Phase 2 is foundation only — no application consumer exists) |
| Ownership | Ultimate — ADAPTed from PrimeNG reference per-component, file-level provenance tracked |

No `packages/ng-components` fragmentation beyond this two-package split — matches the already-documented Phase 0 boundary model (`PACKAGE_ARCHITECTURE.md` §"Framework core packages" / "Framework component packages") exactly, no demonstrated need for finer fragmentation at 4 components.

---

## Public API Strategy

**Prime-compatible naming retained in Phase 2** — `p-button`/`p-checkbox`/`p-dialog`/`p-menu` selectors, `Button`/`Checkbox`/`Dialog`/`Menu` class names, `.p-*` CSS classes all kept verbatim. Per Blueprint §10, renaming is explicitly not itself an architectural objective in this phase and must be decided "before the first stable public release" — not manufactured now with zero consumers to validate against. This also minimizes the diff surface against the reference source during initial correctness verification.

**What Option B (Ultimate-owned architecture) actually changes**, despite naming staying Prime-compatible:

- `BaseComponent`/`BaseEditableHolder`/`BaseInput` are Ultimate's own classes (different internal implementation, informed by but not copied from PrimeNG's), not re-exports of a Prime-derived base.
- The global config service is renamed (`PrimeNG` → an Ultimate-owned equivalent name, exact name deferred to implementation) since it's a new public symbol, not a rendered-DOM-facing selector.
- Internal utility imports point to `@ultimate/uix-*`, never `@primeuix/*`.

**Deferred to a pre-1.0 decision** (explicitly, per Blueprint §10): `p-*` → `u-*` selector/class rename, whether `<p-button>` stays permanently or is an intentional compatibility alias once an Ultimate-first selector exists, import path stability guarantees.

---

## Component Migration Strategy

Dependency graph derived from direct source inspection, not assumed:

```text
Foundation (ng-core: BaseComponent hierarchy, config, overlay, focus-trap, ripple, icons)
    ↓
Primitive components (Button — no CVA, no overlay)
    ↓
Form components (Checkbox — CVA via BaseEditableHolder/BaseInput)
    ↓
Overlay components (Dialog — depends on Overlay + FocusTrap from ng-core, Motion from UIX)
    ↓
Menu/navigation components (Menu — keyboard nav, no overlay in its basic form; MegaMenu/Menubar/TieredMenu deferred, they add overlay+routing complexity)
```

This ordering is derived directly from real dependencies confirmed in source: `Dialog` imports `FocusTrap`, `Button`, icon components, and `MotionModule`; `Checkbox` imports `NG_VALUE_ACCESSOR`/`NgControl` (needs the `BaseEditableHolder`/`BaseInput` tier to exist first); `Button` has no such dependencies, hence first. `Menu` is included as the fourth foundation component specifically because it's the cheapest representative of the "navigation with keyboard interaction, no CVA, no complex overlay" category not otherwise covered by Button/Checkbox/Dialog.

Later-phase sequencing (for the full inventory, not built in Phase 2): remaining primitives → remaining form inputs (data-heavy ones like `InputNumber`/`Slider` last within that tier) → panel/container components → remaining overlay components (Popover, Tooltip, ConfirmDialog/ConfirmPopup) → menu/navigation complex variants (Menubar, TieredMenu, MegaMenu, PanelMenu) → data components (Table, TreeTable, Tree, VirtualScroller, Paginator — each is a substantial sub-project, sequenced last and likely spanning multiple later phases, not "Phase 2 later half").

---

## Component Inventory

Full ~95-component inventory is too large to enumerate exhaustively at full per-field detail in this document; representative entries below establish the classification pattern implementation-plan authors must apply to the remainder. The complete inventory (one row per component, same seven fields) is a required Phase 2 deliverable artifact (see Deliverables), generated from this pattern, not hand-written prose for all 95.

| Component | Category | UIX deps | Angular-specific responsibility | Style dep | A11y responsibility | Classification | Phase |
|---|---|---|---|---|---|---|---|
| Button | Primitive | uix-utils, uix-styled | Click/focus/blur output events, ripple integration | `@primeuix/styles/button` (already needed) | `aria-label`, disabled state | ADAPT | **Phase 2** |
| Checkbox | Form/input | uix-utils, uix-styled | CVA (`writeValue`/`registerOnChange`), `NgControl` integration | `@primeuix/styles/checkbox` | `role="checkbox"`, `aria-checked`, keyboard space-toggle | ADAPT | **Phase 2** |
| Dialog | Overlay | uix-utils, uix-styled, uix-motion | Overlay positioning, focus trap, Escape dismissal, enter/leave motion | `@primeuix/styles/dialog` | `aria-modal`, `aria-labelledby`, focus return on close | ADAPT | **Phase 2** |
| Menu | Menu/nav | uix-utils, uix-styled | Keyboard arrow navigation, item activation | `@primeuix/styles/menu` | `role="menu"`/`role="menuitem"`, roving tabindex | ADAPT | **Phase 2** |
| InputText, Password, Textarea, InputNumber, InputMask, InputOTP | Form/input | uix-utils, uix-styled | CVA, `BaseInput` tier | per-component | label association, validation state | ADAPT | Later Phase (Phase 2 established the `BaseInput` pattern; these follow directly) |
| RadioButton, ToggleSwitch, ToggleButton, Rating, Slider, ColorPicker, Knob | Form/input | uix-utils, uix-styled | CVA variants | per-component | roles/keyboard per widget type | ADAPT | Later Phase |
| Popover, Tooltip, ConfirmDialog, ConfirmPopup, Drawer | Overlay | uix-utils, uix-styled, uix-motion | Overlay + Dialog-adjacent patterns, `dynamicdialog` for programmatic instantiation | per-component | `role="tooltip"`/`role="dialog"`, dismissal | ADAPT | Later Phase (depends on Dialog's Phase 2 groundwork) |
| Menubar, TieredMenu, MegaMenu, PanelMenu, ContextMenu, SpeedDial, Breadcrumb | Menu/nav | uix-utils, uix-styled, uix-motion (submenu overlays) | Nested keyboard nav, overlay-based submenus, router integration (`@angular/router` peer) | per-component | `role="menubar"`, nested `aria-*` | ADAPT | Later Phase (depends on Menu + Dialog/overlay groundwork) |
| Panel, Fieldset, Card, Accordion, Divider, Splitter, Toolbar, ScrollPanel | Panel/container | uix-utils, uix-styled | Layout/collapse behavior, content projection | per-component | `aria-expanded` (Accordion), landmark roles | ADAPT | Later Phase |
| Table, TreeTable, Tree, VirtualScroller, Paginator, OrderList, PickList, DataView | Data | uix-utils, uix-styled | Selection/sort/filter/virtualization state, drag-drop (`@angular/cdk` for OrderList/PickList) | per-component | complex grid/tree ARIA patterns, huge a11y surface | ADAPT (each a sub-project) | Later Phase, explicitly staged individually — **Needs Architecture Decision** on virtualization contract before Table/TreeTable/VirtualScroller begin |
| Chart | Data/visualization | uix-utils | Wraps a charting library dependency (external, not Prime-derived) | n/a (canvas-rendered) | screen-reader chart summary patterns | Needs Architecture Decision | Later Phase — depends on choosing/approving an external charting dependency, out of Phase 2 scope |
| Toast, Message | Messaging | uix-utils, uix-styled, uix-motion | Programmatic/dynamic instantiation (`dynamicdialog`-adjacent service pattern) | per-component | `role="alert"`/`aria-live`, auto-dismiss timing | ADAPT | Later Phase |
| Terminal, Editor, Galleria, Carousel, OrganizationChart, Timeline, Skeleton, Avatar(Group), Badge, Tag, Chip, Image(Compare), Stepper, Steps, FloatLabel, IftaLabel, InputGroup(Addon), IconField, Fluid, BlockUI, Dock, ScrollTop, AnimateOnScroll, MetreGroup, InplaceEdit, KeyFilter | Mixed/misc | uix-utils (mostly) | Varies per component | per-component | Varies | ADAPT (most), Needs Architecture Decision (Editor — wraps Quill, an external dependency) | Later Phase |
| `passthrough` pass-through-props customization API | Cross-cutting feature, not a component | uix-utils | Applies to all components once built | n/a | n/a | DEFER | Not Needed for Phase 2; revisit when enough later-phase components exist to justify it |

---

## Component Style Strategy

Confirmed architecture: `UltimateNG component → @ultimate/uix-styled (token resolution) → @ultimate/uix-styles/<component> (CSS-in-JS module, per-component)`. This is not a new mechanism — it is exactly what PrimeNG 21.1.9 already does (`buttonstyle.ts` imports `style` from `@primeuix/styles/button`, wraps it in a `BaseStyle`-extending `@Injectable`), and exactly the extension point Phase 1's ADR-017 already reserved.

For each Phase 2 component: extract that component's style module (`button`, `checkbox`, `dialog`, `menu`) from the already-pinned, already-checksummed `.vendor-cache/@primeuix__styles-2.0.3.tar.gz`, add it as a new subpath export in `@ultimate/uix-styles` (`./button`, `./checkbox`, `./dialog`, `./menu`), following the existing `base` module's build/export/provenance pattern exactly — no new styling mechanism invented, no change to `@ultimate/uix-styled`'s token-resolution engine. `ng-core`'s base-style-wrapper class (Ultimate's equivalent of PrimeNG's `BaseStyle`) registers each component's style module with `uix-styled`'s existing stylesheet service.

Encapsulation: matches upstream — no Angular `ViewEncapsulation.Emulated` CSS scoping; styles are token-resolved global class-based CSS (`.p-button`, etc.), consistent with the `.p-*` selector strategy above.

---

## Angular Component Architecture

Representative pattern (confirmed via direct source inspection of Button/Checkbox/Dialog):

- **Metadata:** `standalone: true` always; `changeDetection: ChangeDetectionStrategy.OnPush`... — **confirmed to check**: this spec did not exhaustively verify `OnPush` is used on all three representative components; implementation must verify per-component during extraction and default to `OnPush` for all new Ultimate components regardless of what the specific reference file used, per the Change Detection section below.
- **Inputs:** mix of `input()` signal-based and legacy `@Input()` decorator in the same file (PrimeNG's own in-progress migration). Ultimate's adapted versions standardize on **signal-based `input()`/`output()` exclusively** for all Phase 2 components — no decorator-based `@Input()`/`@Output()` in new Ultimate source, since Angular 21's signal-based API is the modern, complete pattern and there's no legacy-consumer reason to mix styles within Ultimate's own new code (unlike PrimeNG, which has a large existing consumer base constraining its migration pace).
- **Content projection:** `ContentChild`/`contentChild` (both decorator and signal-query forms present in reference source) for template-based customization (e.g. Button's icon template).
- **Host bindings:** `host: {...}` metadata property (not `@HostBinding`/`@HostListener` decorators) — matches reference source's own already-modern style; Ultimate adopts the same `host` metadata pattern.
- **DI:** constructor-less `inject()` function calls at field-initializer level, not constructor-injected parameters — matches reference source, Ultimate adopts the same pattern.
- **Lifecycle:** `effect()` used for reactive side-effects tied to signal inputs, in place of some traditional `ngOnChanges` usage — adopted where it clarifies intent, not forced everywhere `ngOnChanges` would also work.

---

## Standalone vs NgModule

**Standalone only.** No `NgModule` is authored in `ng-core` or `ng`. Rationale: PrimeNG's own `NgModule` wrappers exist purely for PrimeNG's own large, pre-existing external consumer base's backward compatibility — Ultimate has zero such consumers at Phase 2 (no application depends on `@ultimate/ng` yet), so there is no compatibility obligation to replicate. Retaining NgModule support would be pure speculative future-proofing against a migration cost that doesn't exist yet (YAGNI) and contradicts the modern Angular ecosystem direction PrimeNG itself is visibly moving toward (210 standalone vs. 87 non-standalone, trending toward standalone-only).

---

## Change Detection and Performance

- **Strategy:** `ChangeDetectionStrategy.OnPush` for every Ultimate-authored component, regardless of what the specific PrimeNG reference file uses — this is a deliberate Ultimate standard, not a blind port, consistent with Option B's "Ultimate defines its own architecture" stance. Signal-based inputs make `OnPush` correctness straightforward (signals notify Angular's change detector directly).
- **No speculative optimization** beyond this standard — no manual `markForCheck()` micro-tuning, no virtual-DOM-style techniques, until a measured baseline (below) shows a real problem.
- **Measured baselines to record at Phase 2 exit** (matching Phase 1's `PERFORMANCE.md` precedent — record, don't optimize against assumptions): `dist/` size and gzip size for both `ng-core` and `ng` (same methodology as `scripts/provenance/measure-package-size.mjs`); Dialog open/close timing (a representative overlay operation); a basic component-creation-cost measurement for Button (cheapest) and Dialog (most complex of the four) via a throwaway benchmark harness — not a permanent CI gate.

---

## Accessibility

| Behavior | Classification | Evidence |
|---|---|---|
| Dialog: `aria-modal="true"`, `aria-labelledby` | RETAIN | Confirmed present in reference source |
| Dialog: Escape-key dismissal | RETAIN | Confirmed via `bindDocumentEscapeListener` |
| Dialog: focus trap | RETAIN | Uses `FocusTrap` directive, confirmed |
| Dialog: focus return to trigger element on close | **Needs verification during implementation** — not confirmed present or absent in this spec's investigation depth; implementation must check and, if missing, classify as FIX, not silently ship a gap | Flagged, not confirmed either way |
| Checkbox: `role`/`aria-checked`/keyboard toggle | RETAIN | Standard CVA + native `<input type="checkbox">` pattern gives this largely for free; implementation verifies the rendered markup preserves native semantics |
| Button: `aria-label` support | RETAIN | Confirmed input exists (`ariaLabel`) |
| Menu: `role="menu"`/roving tabindex | **Needs verification during implementation** — not directly inspected at this depth | Flagged |
| Reduced motion (Dialog's enter/leave animation) | RETAIN, inherited free | `@ultimate/uix-motion`'s `createMotion` already defaults `safe: true` (Phase 1 finding) — Dialog gets this automatically by using `uix-motion`, no Ultimate-side accessibility work needed here specifically |

No accessibility defect is currently confirmed and silently dropped — the two "needs verification" rows are explicit flags for implementation-time confirmation, not assumed-fine gaps. Any confirmed regression found during implementation blocks that component's Phase 2 completion, per Blueprint §30 ("Accessibility regressions are release blockers for affected components").

---

## Overlay Architecture

**Decision: retain PrimeNG's homegrown overlay/focus-trap system, adapted into `ng-core`, not replaced with `@angular/cdk` Overlay.**

Rationale: `@angular/cdk` is already a peer dependency (available, not forbidden), but is used in only 5 of PrimeNG's 118 source directories — the overlay/focus-trap/positioning system itself is deliberately homegrown by PrimeNG, not CDK-based, and this spec found no defect in that system during investigation (Dialog's Escape/focus-trap/`aria-modal` behavior all confirmed present and functioning as designed). Replacing a working, already-accessible system with CDK Overlay would be exactly the kind of "arbitrary API redesign" and "speculative rewrite" the Non-Goals explicitly forbid, with no demonstrated defect motivating the change.

Responsibility split:

- **`@ultimate/uix-motion`:** enter/leave class-based animation timing (already built, Phase 1).
- **`@ultimate/ng-core`:** `Overlay` directive (positioning, append-target, z-index via `@ultimate/uix-utils`'s `zindex` module — already available from Phase 1), `FocusTrap` directive (focus containment, tab-cycling).
- **Component (`Dialog`, later Popover/Tooltip/ConfirmDialog):** wires `Overlay` + `FocusTrap` + `uix-motion` together, owns its own Escape-key/backdrop-dismissal logic (as PrimeNG's `Dialog` does today) — not abstracted into a shared "modal service" in Phase 2 without a second overlay component existing yet to justify the abstraction (YAGNI; revisit once Popover/Tooltip migrate in a later phase and a real duplicate pattern is observed).

SSR: `Overlay`/`FocusTrap` must guard actual DOM manipulation behind `isPlatformBrowser()` checks (matching the 38-file pattern already present in the reference source) — import-time safety is required, call-time DOM access remains inherently client-side, consistent with `uix-motion`'s own SSR posture from Phase 1.

---

## Forms Architecture

`Checkbox` (Phase 2) implements `ControlValueAccessor` via the `NG_VALUE_ACCESSOR` provider pattern confirmed in the reference source (`writeValue`/`registerOnChange`/`registerOnTouched`, plus optional direct `NgControl` injection for validation-state access). This pattern lives in the `BaseEditableHolder`/`BaseInput` tier of `ng-core`'s base-class hierarchy so every future form-input component (Later Phase: InputText, RadioButton, etc.) inherits it rather than reimplementing CVA wiring per component — this is the specific, concrete duplication `BaseEditableHolder`/`BaseInput` exist to prevent, satisfying the "add abstraction only when it reduces real duplication" bar (more than one component needs this exact behavior, confirmed by the inventory above).

Angular Reactive Forms (`FormControl`/`formControlName`) and Template-driven forms (`ngModel`) are both supported, matching the reference source's dual support. Validation/error-state presentation itself (visual error styling) is a component-level concern layered on top of the CVA plumbing, not part of `ng-core`'s shared responsibility.

---

## Data Component Strategy

Not built in Phase 2 (Menu is the closest Phase-2 component to "data-adjacent," but is not a data component). The inventory above flags Table/TreeTable/Tree/VirtualScroller/Paginator/OrderList/PickList/DataView collectively as **Needs Architecture Decision** before any of them begins — specifically, a shared selection/sort/filter/virtualization contract (per Blueprint §32) should be designed once, before the first data component starts, rather than each data component inventing its own state model independently. This decision point is explicitly deferred past Phase 2, not resolved here, since no data component is in the Phase 2 foundation set and designing that contract speculatively — before a real component needs it — would itself violate YAGNI.

---

## Dependency Rules

Restates and confirms (does not weaken) existing Phase 0 rules, now made concrete for `ng-core`/`ng`:

- **Forbidden runtime dependencies:** `primeng`, `primevue`, `primereact`, any `@primeuix/*` package — already enforced by `scripts/provenance/validate-dependency-ceiling.mjs`'s `FORBIDDEN_DIRECT_DEPS` list and `WATCHED_PREFIXES` (which **already includes `"ng"`**, confirmed by direct read of the script — no extension needed for this check).
- **Required dependencies:** `@ultimate/uix-{utils,styled,styles,motion}` via pnpm workspace protocol.
- **Peer dependencies:** `@angular/{core,common,forms,cdk,router,platform-browser}` at `^21.0.7`, `rxjs` — external, never vendored, matching `DEPENDENCIES.md`'s existing "must remain external" list.
- **No CI extension needed for the ceiling/forbidden-dependency check** — it already covers `packages/ng*`. This is a correction relative to the brief's assumption that Phase 2 must "extend Phase 0 CI validators": investigation found the extension point already exists and already works for `ng`.
- **`validate-boundaries.mjs` scope:** unchanged — it protects `packages/uix*` from framework imports; it does not need to (and should not) scan `packages/ng*` for the opposite direction, since `ng*` packages are expected to import Angular. No gap identified requiring a new validator here.

---

## Provenance

Same model as Phase 1 (`PROVENANCE.md` package-level entries + `docs/architecture/provenance/<package>.json` file-level manifests), with a simpler extraction mechanism than Phase 1 needed:

- **Extraction mechanism:** direct `.ts` file extraction from `.vendor-cache/primeng-21.1.9.tar.gz` (already a git-archive containing complete original source — no sourcemap reconstruction needed, unlike Phase 1's `@primeuix/*` npm-tarball situation). A new `scripts/provenance/extract-primeng-source.mjs`, structurally similar to Phase 1's `extract-source.mjs` but simpler (untar + copy matching paths, no sourcemap parsing).
- **Manifest fields (per file):** `originalPath` (e.g. `packages/primeng/src/button/button.ts`), `ultimateDestination` (e.g. `packages/ng/src/button/button.ts`), `modificationStatus` (`"unmodified"` | `"import-path-adapted"` | `"refactored"` | `"reimplemented-with-reference"`), `modificationDescription`, `sha256OfOriginal`. The `"reimplemented-with-reference"` status is new relative to Phase 1's vocabulary, needed because Option B means base-class files are genuinely rewritten with PrimeNG's file as a design reference, not adapted-in-place — this must be distinguishable in the manifest from a verbatim or lightly-adapted file.
- **`docs/architecture/PROVENANCE.md` PrimeNG entry:** `Modification status` updated from "not yet incorporated" to reflect real Phase 2 incorporation; `Ultimate destination` narrowed from the currently-listed `packages/ng`, `packages/ng-core` (already correct — no change needed there) to note only the Phase 2 foundation subset is incorporated, with the remainder tracked via the Component Inventory's classification instead of a premature blanket "incorporated" claim.
- **`validate-provenance.mjs` extension:** same pattern as Phase 1 — every `.ts` file under `packages/{ng-core,ng}/src/` must have a manifest entry.

---

## Licensing

- **PrimeNG's own `LICENSE.md`:** confirmed (direct read) to contain both the MIT "Community Versions" section (applies to `21.1.9`) and a separate commercial `-lts` section. `packages/ng/THIRD-PARTY-NOTICES.md` already correctly warns future maintainers to re-verify the absence of `-lts` before any version bump — this spec confirms that existing warning is accurate and needs no change.
- **Icons:** the 57 icon components are PrimeNG's own Angular source (MIT, same license as the rest of `packages/primeng`) — not a separate font/asset license. No separate icon licensing concern exists (unlike, e.g., a bundled third-party font would present).
- **`@angular/cdk`:** MIT-licensed, external peer dependency, not vendored — no incorporation-licensing concern, ordinary peer-dependency license awareness only.
- **Attribution:** `packages/ng/THIRD-PARTY-NOTICES.md` and (new) `packages/ng-core/THIRD-PARTY-NOTICES.md` both get the verbatim MIT community-license text + PrimeTek copyright line, matching the Phase 1 pattern exactly.

---

## Build Strategy

**`ng-packagr`**, not `tsup`. Angular Package Format output requires understanding Angular decorators, templates, and partial-compilation metadata — `ng-packagr` (which PrimeNG itself uses) already solves this correctly; forcing `tsup` onto Angular source would mean reimplementing what `ng-packagr` provides for free, contradicting Blueprint §2.8 (minimal reinvention) and this spec's own instruction not to force `tsup` where Angular's packaging needs make other tooling more appropriate.

- **Per-package `ng-package.json`:** matches the reference source's own `{"lib": {"entryFile": "public_api.ts"}}` pattern, one per component within `ng`, or a single package-level config with per-component secondary entry points — exact secondary-entry-point vs. single-entry decision left to implementation (Open Question, see below), since both are valid Angular Package Format shapes and the choice doesn't affect this spec's architecture.
- **Output:** FESM2022 + `.d.ts`, matching modern Angular Package Format defaults (`ng-packagr`'s current default target).
- **TypeScript:** extends the repo's existing `tsconfig.base.json`, plus Angular's own required compiler options (`experimentalDecorators` or the newer decorator metadata approach, per Angular 21's actual requirement — implementation verifies the exact flag set Angular 21's compiler needs).
- **Orchestration:** `pnpm -r --if-present run build` (unchanged, ADR-015 stands — `ng`/`ng-core` slot into the existing plain-pnpm model the same way `uix-styled`/`uix-motion` already depend on `uix-utils`).

---

## Testing Strategy

**Angular CLI + Vitest builder** (Angular 21's `@angular/build` experimental Vitest unit-test builder), not Karma+Jasmine. Keeps Vitest-everywhere consistency with Phase 1 while still using real Angular `TestBed` for genuine component/DI/template testing — this is a runner choice, not a testing-infrastructure reinvention.

- **Component behavior:** inputs/outputs, rendering output, lifecycle — `TestBed`-based, per component.
- **Accessibility:** keyboard interaction (Tab/Escape/Arrow-key) and ARIA-attribute assertions per component (Dialog's `aria-modal`, Menu's roving tabindex, Checkbox's `aria-checked`) — automated `TestBed` + DOM assertions, not a separate axe-core integration in Phase 2 (no demonstrated need yet; revisit if manual a11y review finds gaps automation would have caught).
- **Forms:** Checkbox's CVA contract tested directly — `writeValue`/`registerOnChange`/`registerOnTouched` call verification, `FormControl` integration round-trip.
- **Overlay:** Dialog's open/close, Escape dismissal, focus trap entry/exit, backdrop click — `TestBed` + simulated DOM events.
- **Styling:** package/export test confirming `@ultimate/uix-styles/button` (etc.) subpath resolves once added.
- **SSR:** an import-only test (no rendering) confirming `ng-core`/`ng` modules import cleanly under a simulated server (Node, no DOM globals) — matching Phase 1's "SSR-safe at import time" test pattern.
- **Package exports:** every declared `ng-core`/`ng` public export resolves — same pattern as Phase 1's `exports.test.ts`.
- **Dependency boundaries:** existing `ceiling:validate` (already watches `ng`), extended in coverage (not in script logic — no code change needed) to also watch `ng-core` once it's a real directory with a real `package.json` (the script already generically scans any `packages/{uix,ng,react,vue}*` directory matching its `WATCHED_PREFIXES`, so `ng-core` is automatically covered — confirmed via direct script read, `"ng"` prefix-matches `"ng-core"`).
- **Framework boundary:** no React/Vue imports anywhere in `ng-core`/`ng` — a simple grep-based check, same style as `validate-boundaries.mjs`, could be added but is likely unnecessary since no React/Vue package exists yet to accidentally import; flagged as an Open Question rather than mandated now.
- **Build:** `pnpm install --frozen-lockfile && pnpm run build` from clean checkout must succeed for both packages.

---

## Storybook

PrimeNG mirror stories (if any exist from Phase 0/1 — not confirmed present in this investigation, flagged as Open Question) represent source-fidelity documentation and are explicitly not modified into UltimateNG stories. No unified Storybook redesign in Phase 2. The four Phase 2 components may get their own new Ultimate-authored stories demonstrating Ultimate's public API (not Prime's), but this is a documentation nice-to-have, not a Phase 2 gate — full Storybook integration strategy for the unified future state (Prime-derived reference + Ultimate behavior + styling + a11y + examples side by side) is deferred to whichever later phase first needs to present multiple frameworks' components together (likely Phase 3 or later, once React exists to compare against).

---

## AI/Metadata Constraints

No CLI/MCP/Skills/AI implementation in Phase 2 (unchanged non-goal). Public component APIs (Button/Checkbox/Dialog/Menu's `input()`/`output()` signal signatures) are already self-describing via TypeScript types and TSDoc comments (matching Phase 1's documentation-requirements precedent) — sufficient structure for a future metadata generator to consume without Phase 2 needing to build that generator or a dedicated schema now.

---

## Migration Strategy (Prime → Ultimate compatibility)

No compatibility tooling (codemods, selector aliases, automated migration scripts) is implemented in Phase 2 — there is no existing PrimeNG-consuming application in this repository to migrate, so building migration tooling now would have no user to validate it against (YAGNI). The intended future compatibility strategy, recorded for later phases: since selectors/class names stay Prime-compatible in Phase 2 (per Public API Strategy), an application already using real PrimeNG could in principle swap its dependency to `@ultimate/ng` with import-path changes only, for the four Phase 2 components — this compatibility property is a natural consequence of the naming decision above, not separately engineered tooling.

---

## Angular Upgrade Strategy

**Strategy B: UltimateNG independently tracks Angular releases**, informed by but not chained to PrimeNG's own release cadence. Rationale: ADR-001/Blueprint §13 already establish that Ultimate — not Prime — owns long-term Angular compatibility; ADR-013 already establishes "no automatic Prime synchronization" as a platform-wide principle for security, and the same reasoning extends naturally to version-tracking generally. Strategy A (stay chained to PrimeNG's Angular support) would recreate exactly the upstream-dependency risk ADR-013 was written to avoid. Strategy C (deliberate compatibility-window lag) is a refinement Ultimate can adopt within Strategy B once a second Angular major version exists to actually lag behind — not a distinct strategy to choose between now, with only Angular 21 in scope.

Concretely for Phase 2: pin `^21.0.7` (matching the verified PrimeNG 21.1.9 peer range) as the floor; no commitment yet to how quickly Ultimate adopts Angular 22+ once released — that's a real decision with real evidence (Angular 22's actual changes) needed at that future point, correctly left open now rather than speculated about.

---

## Security

- **DOM manipulation:** `Renderer2`-based (`renderer.listen`, confirmed in Dialog's Escape-key handler) — standard, sanitizer-respecting Angular API, not raw `document` manipulation. No `innerHTML` usage identified in the three representative components inspected.
- **Dynamic component creation:** not used by the Phase 2 foundation set (Button/Checkbox/Dialog/Menu are all static template components); `dynamicdialog`-style programmatic instantiation is explicitly deferred (not in Phase 2 scope) — its security review (dynamic component creation is a more sensitive pattern) is correctly deferred alongside it, not preemptively reviewed for code that doesn't exist yet.
- **User-provided content:** none of the four Phase 2 components render arbitrary user HTML directly (Button/Checkbox/Menu render structured content; Dialog projects content via `<ng-content>`, Angular's own template-projection mechanism, not string-based HTML injection) — no XSS-shaped pattern identified requiring a dedicated new test beyond ordinary Angular template-binding safety (which Angular's sanitizer already provides by default).
- **No `eval`/`Function` constructor usage** identified in any inspected reference source file — matches Phase 1's security posture precedent.
- **Dependency-vulnerability scanning:** no new external dependency introduced beyond `@ultimate/uix-*` (internal) and `@angular/*` (already-accepted peer ecosystem) — no new supply-chain surface beyond what Phase 0 already accepted.

---

## Performance

Baseline-recording only (matching Phase 1's explicit "not a budget" framing):

- `dist/` size + gzip size for `ng-core` and `ng`, using the same `measure-package-size.mjs` methodology Phase 1 established (extended trivially to cover Angular Package Format output — the script's size-measurement logic is format-agnostic, only the build step differs).
- Dialog open/close timing (representative overlay-operation cost) via a throwaway benchmark harness, not a permanent gate.
- Component-creation-cost spot-check for Button (cheapest) vs. Dialog (most complex of the four).
- Tree-shaking spot-check: confirm importing only `Button` from `@ultimate/ng` does not pull in `Dialog`'s overlay/focus-trap/motion dependencies into the bundle (secondary-entry-point Angular Package Format output should already guarantee this structurally; verified empirically, not assumed).

---

## Documentation

Per-package `README.md` (purpose, public API, Prime-derived-vs-Ultimate-owned distinction, provenance linkage) — same pattern as Phase 1. Per-component documentation (Button/Checkbox/Dialog/Menu) covers: PrimeNG foundation (which reference component, what changed under Option B), Ultimate behavior, public API (TSDoc-derived), styling (which `uix-styles` subpath), accessibility (from the table above), and migration notes (naming stayed Prime-compatible — see Public API Strategy). No public documentation site built in Phase 2 (non-goal, READMEs sufficient, matching Phase 1's precedent).

---

## Deliverables

```text
Packages (source + config):
  packages/ng-core/{src/,package.json,ng-package.json(s),README.md,THIRD-PARTY-NOTICES.md (populated)}
  packages/ng/{src/,package.json,ng-package.json(s),README.md,THIRD-PARTY-NOTICES.md (populated)}

Foundation components (in packages/ng/src/):
  button/, checkbox/, dialog/, menu/ — each with component + spec (Vitest/TestBed) + style registration

ng-core contents:
  base-component hierarchy (Ultimate-owned BaseComponent/BaseEditableHolder/BaseInput)
  overlay/, focustrap/, ripple/ directives
  icons/ (57 icon components, adapted)
  config service (Ultimate-owned, renamed from PrimeNG's global config service)

Provenance:
  scripts/provenance/extract-primeng-source.mjs (new)
  docs/architecture/provenance/ng-core.json (new)
  docs/architecture/provenance/ng.json (new)
  docs/architecture/PROVENANCE.md (PrimeNG entry updated: Modification status, Date incorporated, scope note)

UIX extension (per ADR-017's own plan):
  packages/uix-styles/ gains ./button, ./checkbox, ./dialog, ./menu subpath exports + provenance manifest entries

Component inventory:
  docs/architecture/COMPONENT_INVENTORY.md (new) — full ~95-row table per the pattern established in this spec's Component Inventory section

Architecture decisions:
  docs/architecture/DECISIONS.md — new ADR-018 (Option B: Ultimate-owned architecture over PrimeNG-derived thin layer), ADR-019 (standalone-only, no NgModule), ADR-020 (homegrown overlay retained over @angular/cdk Overlay adoption), ADR-021 (ng-packagr build tooling), ADR-022 (Angular CLI + Vitest test builder over Karma+Jasmine)

Dependency policy: no script changes needed (ceiling check already covers packages/ng* including ng-core; boundary check correctly does not need extension) — this finding itself is a deliverable (documented, not silently assumed)

CI: .github/workflows/ci.yml — verify existing steps exercise ng-core/ng non-trivially once they exist; no new job type needed beyond what Angular's build/test commands require in the existing pipeline shape

Performance baseline: recorded in docs/architecture/PERFORMANCE.md (appended, matching Phase 1's existing file)

Documentation: per-package + per-component READMEs
```

---

## Acceptance Criteria

- [ ] `@ultimate/ng-core` and `@ultimate/ng` build independently via `pnpm -r run build` from a clean checkout, using `ng-packagr`.
- [ ] Button, Checkbox, Dialog, Menu are implemented as standalone Angular 21 components with Ultimate-owned base-class architecture (not lifted PrimeNG internals).
- [ ] Zero `@primeng`/`primevue`/`primereact`/`@primeuix/*` runtime dependencies in either package (`ceiling:validate` passes non-trivially for both, confirmed already-covered by existing `WATCHED_PREFIXES`).
- [ ] `@ultimate/uix-styles` gains `./button`, `./checkbox`, `./dialog`, `./menu` subpath exports with provenance manifests.
- [ ] All four components' Vitest/TestBed suites pass: rendering, inputs/outputs, accessibility (keyboard/ARIA), Checkbox's CVA contract, Dialog's overlay/focus-trap/Escape/motion behavior, Menu's keyboard navigation.
- [ ] Package/export tests pass for both packages.
- [ ] SSR import-safety test passes for both packages (no top-level DOM access).
- [ ] Full ~95-component inventory documented with per-component classification (Phase 2 / Later Phase / Not Needed / Needs Architecture Decision).
- [ ] `docs/architecture/PROVENANCE.md`'s PrimeNG entry reflects real Phase 2 incorporation, backed by file-level manifests for both packages.
- [ ] Performance baseline recorded (package size, Dialog open/close timing, tree-shaking spot-check) in `PERFORMANCE.md`.
- [ ] READMEs exist for both packages and all four components.
- [ ] `docs/architecture/DECISIONS.md` records ADR-018 through ADR-022.
- [ ] The two flagged accessibility "needs verification" items (Dialog focus-return, Menu ARIA pattern) are resolved one way or the other (confirmed present and tested, or confirmed missing and classified as FIX with a tracked follow-up) — not left silently unresolved.

---

## Risks

| Risk | Impact | Likelihood | Mitigation | Decision point |
|---|---|---|---|---|
| Option B's "reimplemented, not lifted" base-class work takes materially longer than a thin-layer approach would have, blowing Phase 2 timeline | Medium — could stall the foundation set | Medium (inherent to the chosen approach) | Scope is deliberately capped at 4 components specifically to bound this risk; if `ng-core`'s base-class work alone proves too large, the foundation component count is the lever to cut, not the architecture stance (already user-approved) | Phase 2 implementation, if base-class work exceeds a rough time-box |
| PrimeNG's in-progress signals migration (mixed `input()`/`@Input()` in the same file) means some later-phase components will be much further from "fully signal-based" than the four Phase 2 representatives, understating later migration cost | Medium — Phase 2's component-migration-cost model may not generalize | Medium | Component Inventory flags this qualitatively; a per-component signals-migration-completeness check should be part of each later-phase component's own investigation, not assumed uniform now | Each later phase's own component investigation |
| Dialog's focus-return-on-close and Menu's ARIA pattern (both flagged "needs verification") turn out to have real gaps | Low-Medium — accessibility regression if shipped unnoticed | Low-Medium (flagged, not silently assumed fine) | Explicit acceptance-criteria line item requires resolution one way or the other before Phase 2 exit | Phase 2 implementation, before component sign-off |
| `@angular/cdk` peer dependency goes mostly unused in Phase 2 (only needed by later drag-drop components), raising the question of whether declaring it as a Phase 2 peer dependency at all is premature | Low | Low | Declare `@angular/cdk` as a peer dependency only when a Phase 2 component actually needs it; none of Button/Checkbox/Dialog/Menu do per source inspection — so Phase 2's actual peer dependency list may omit `@angular/cdk` entirely, deferred to whichever later-phase component (OrderList/PickList) needs it | Phase 2 implementation, package.json authoring |
| Angular CLI's Vitest builder is experimental (Angular 21) and could have rough edges relative to the mature Karma builder | Medium | Medium | If blocking issues emerge, this is the one build-tooling decision in this spec with a viable fallback (Karma+Jasmine) without touching architecture; revisit only if concretely blocked, not preemptively hedged against | Phase 2 implementation, first test-suite authoring |
| Full ~95-component inventory (a required deliverable) is time-consuming to produce at real per-component depth versus the illustrative grouped rows in this spec | Low-Medium | Medium | Implementation plan should treat inventory generation as a distinct, scriptable-where-possible task (e.g. a script that walks `packages/primeng/src/` and pre-fills category/dependency columns from source inspection, with a human pass for classification/risk) rather than 95 manually-written rows | Phase 2 implementation planning |
| `ng-core`/`ng` package split (vs. single package) adds cross-package build-order complexity | Low | Low | Same pattern already proven by `uix-styled`/`uix-motion` → `uix-utils` in Phase 1; pnpm workspace linking already handles this without Turborepo/Nx (ADR-015 unchanged) | Not a real risk given existing precedent — included for completeness |

---

## Decisions vs Open Questions

### Already decided (Blueprint / Phase 0 / Phase 1, unchanged)

Company-owned platform; monorepo; independent packages; framework-native implementations; no required Prime runtime dependency; MIT-only provenance; pnpm workspaces; plain-pnpm build orchestration (ADR-015); PrimeNG `21.1.9` baseline pinned at exact commit (ADR-005); `@ultimate/uix-*` four packages built and available; `uix-styles`' per-component modules deferred to each component's own migration phase (ADR-017) — Phase 2 is that phase, for Button/Checkbox/Dialog/Menu.

### Phase 2 decisions (made in this spec, approved by user)

- PrimeNG version deviation resolved: spec targets `21.1.9` (repo's actual pinned baseline), not the brief's `17.18.15`.
- **Option B**: Ultimate establishes its own base-component architecture; PrimeNG source is an implementation reference per component, not a lift-and-rename.
- Selectors/class names stay Prime-compatible (`p-button`, `Button`, `.p-*`) in Phase 2 — renaming deferred to a pre-1.0 decision.
- Package split: `@ultimate/ng-core` + `@ultimate/ng` (two packages, matching the already-documented Phase 0 boundary model).
- Foundation component set: Button, Checkbox, Dialog, Menu — everything else classified but not built.
- Build tool: `ng-packagr` (Angular Package Format), not `tsup`.
- Test tool: Angular CLI + Vitest builder (real TestBed, Vitest runner), not Karma+Jasmine.
- Icons (57 components): live in `ng-core`, not a separate `ng-icons` package.
- Style incorporation: extend `@ultimate/uix-styles` with per-component subpaths as each component migrates (per ADR-017's own stated plan), not a new ng-side styling mechanism.
- Standalone-only architecture; no `NgModule` authored in `ng-core`/`ng`.
- Overlay system: retain PrimeNG's homegrown overlay/focus-trap, adapted into `ng-core`; do not adopt `@angular/cdk` Overlay in Phase 2.
- Change detection: `OnPush` for all Ultimate-authored components (Ultimate standard, not a blind port of whatever each reference file happened to use).
- Angular upgrade strategy: Strategy B (Ultimate independently tracks Angular releases).

### Open questions (requiring resolution during implementation)

- Exact naming for `ng-core`'s config service (renamed from PrimeNG's `PrimeNG` service — placeholder name only, not committed here).
- Single-entry vs. secondary-entry-point Angular Package Format shape for `ng`'s four components (both valid; doesn't affect this spec's architecture).
- Whether a dedicated React/Vue-import-boundary check for `ng*` packages is worth adding now (likely unnecessary at Phase 2 since no React/Vue package exists yet to accidentally import).
- Whether Phase 0/1 produced any PrimeNG "mirror stories" already (not confirmed present or absent in this investigation) — affects Storybook section's starting point.
- Exact file/directory shape for the new `docs/architecture/COMPONENT_INVENTORY.md` deliverable (proposed here; implementation may adjust).

### Deferred decisions (explicitly postponed, per Blueprint/Phase 0/1)

`p-*` → `u-*` selector rename (pre-1.0 decision, Blueprint §10); `passthrough` pass-through-props API; `styleclass` utility directive; all ~91 non-foundation components (Later Phase, individually classified); data-component shared selection/sort/filter/virtualization contract (Needs Architecture Decision, before the first data component's own future phase); dedicated `ng-icons` package split (revisit only if icon-swapping becomes a real near-term need per Blueprint §33); migration codemods/compatibility tooling (no consumer exists yet to justify it); CLI/MCP/AI/Skills (Phases 7-9, unchanged); public npm publishing (unchanged).

---

## Phase Exit Criteria

Phase 2 is exited and Phase 3 (UltimateReact) may begin when:

1. All Acceptance Criteria above are checked.
2. `@ultimate/ng-core` and `@ultimate/ng` build, and their tests pass, from a clean `pnpm install --frozen-lockfile`.
3. `docs/architecture/PROVENANCE.md` reflects real Phase 2 incorporation for the foundation component set, backed by file-level manifests.
4. `docs/architecture/COMPONENT_INVENTORY.md` exists with the full ~95-component classification.
5. CI passes with `ng-core`/`ng` exercised non-trivially (build, test, ceiling, provenance, boundary checks all real, not trivially-passing scaffolding).
6. `docs/architecture/DECISIONS.md` records ADR-018 through ADR-022.
7. Performance baseline numbers recorded for both packages.
8. A fresh spot-check confirms zero `primeng`/`@primeuix/*` entries in `pnpm-lock.yaml` under `packages/ng*`.
9. Both flagged accessibility open items (Dialog focus-return, Menu ARIA pattern) are resolved (confirmed fine, or fixed, or explicitly tracked as a follow-up with a stated reason it isn't a Phase 2 blocker).

---

## Non-Goals (restated for implementation-plan authors)

Do not, in Phase 2 implementation:

- Migrate any component beyond Button, Checkbox, Dialog, Menu.
- Migrate Table, TreeTable, Tree, VirtualScroller, or any other data component.
- Rename `p-*` selectors or `.p-*` CSS classes to any Ultimate-specific prefix.
- Adopt `@angular/cdk` Overlay as a replacement for the retained homegrown overlay system.
- Implement `NgModule`-based consumption alongside standalone components.
- Implement the `passthrough` pass-through-props customization API.
- Implement React or Vue anything.
- Implement corporate theme values (Phase 5 remains untouched).
- Implement CLI, MCP, Skills, or AI tooling.
- Build migration codemods or compatibility-alias tooling.
- Publish any package to npm or create a public GitHub release.
- Design a shared data-component selection/sort/filter/virtualization contract speculatively (Needs Architecture Decision, deferred to whichever phase first builds a data component).
- Redesign Storybook architecture beyond what's needed to add four new component stories.
