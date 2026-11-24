# Architecture Decision Records

## ADR-001 — Ultimate is a company-owned platform

Status: Accepted (Blueprint §1). Ultimate owns the resulting source, public API, package architecture, roadmap, maintenance, tooling, metadata, and AI integration. Prime is a historical technical foundation only.

## ADR-002 — Monorepo architecture

Status: Accepted (Blueprint §4). One monorepo is the source of truth for platform source, shared infrastructure, framework packages, themes, metadata, tooling, documentation, tests, and release configuration. Packages remain independently publishable.

## ADR-003 — Independent package versioning

Status: Accepted (Blueprint §21). No shared version number across packages; a compatibility matrix (`COMPATIBILITY.md`) provides the platform-level relationship.

## ADR-004 — No Prime runtime dependency

Status: Accepted (Blueprint §2.1). Ultimate must ultimately own the runtime implementation of its UI framework packages. No required runtime dependency on PrimeNG, PrimeVue, PrimeReact, or current PrimeUIX packages. Enforced by CI (see `scripts/provenance/validate-dependency-ceiling.mjs`).

## ADR-005 — MIT baseline/provenance strategy

Status: Accepted (Blueprint §2.3, refined by Phase 0 spec). Only MIT-licensed source revisions may be incorporated. Phase 0 verified PrimeNG 21.1.9, PrimeVue 4.5.5, PrimeReact 10.9.9, and 4 `@primeuix/*` packages as MIT via direct primary-source inspection (LICENSE.md at exact commit, or extracted npm tarball content where no commit SHA is publicly resolvable). See `docs/architecture/PROVENANCE.md`.

## ADR-006 — Framework-native implementations

Status: Accepted (Blueprint §2.4). Angular, React, and Vue implementations remain native to their respective frameworks; no forced single rendering implementation across frameworks.

## ADR-007 — Independent theme layer

Status: Accepted (Blueprint §2.5). Themes/presets are a separate layer from component implementations, deferred to Phase 5.

## ADR-008 — CLI as orchestrator

Status: Accepted (Blueprint §19). `@ultimate/cli` orchestrates but must not replace Angular CLI, Vite, or equivalent official framework tooling. Reserved as scaffolding only in Phase 0 (`packages/cli`).

## ADR-009 — Component metadata as source-of-truth

Status: Accepted (Blueprint §17/§18). Component metadata is a first-class, versioned platform artifact. Reserved as scaffolding only in Phase 0 (`packages/component-schema`, `packages/component-metadata`).

## ADR-010 — MCP as optional tooling

Status: Accepted (Blueprint §2.6/§23). MCP must remain optional and never a runtime dependency. Reserved as scaffolding only in Phase 0 (`packages/mcp`).

## ADR-011 — Skills as AI-operational knowledge

Status: Accepted (Blueprint §24). Skills are operational AI guidance, not merely documentation, versioned and tied to compatible component metadata versions. Deferred to Phase 9.

## ADR-012 — LLM context generated from platform knowledge

Status: Accepted (Blueprint §25/§26). Generated outputs (llms.txt etc.) should not become the primary source of truth. Deferred to Phase 9.

## ADR-013 — Security tracking without continuous Prime sync

Status: Accepted (Blueprint §12/§13, confirmed applicable by Phase 0 findings). No automatic Prime synchronization. Security advisories tracked and evaluated case-by-case. Ultimate has no ongoing access to Prime's non-MIT patch stream (PrimeNG `-lts`, PrimeReact 11+) — advisories affecting frozen MIT baselines must be manually evaluated and back-ported.

## ADR-014 — PrimeReact 11 reclassified from "alpha" to "architectural reference, commercially licensed"

Status: Accepted (Phase 0 spec Finding 2, deviation from Blueprint §4's original framing). The Blueprint described PrimeReact 11 as "alpha" and a candidate for architectural reference. Phase 0 investigation found PrimeReact 11 is GA (`11.1.0`, published 2026-08-05) and commercially licensed (PrimeUI License, not MIT) — not merely immature. Confirmed and recorded per the Architectural Deviation Protocol (Blueprint §37): treated as architectural reference only (package-split pattern), never as incorporable source, and the reason is licensing, not maturity.

## ADR-015 — Build orchestration: plain pnpm scripts (no Turborepo/Nx) for Phase 0

Status: Accepted (plan-level decision; spec left this open). Phase 0 has no packages with real cross-package build dependencies yet, so `pnpm -r run <script>` is sufficient. Revisit once Phase 1+ packages create real build-caching needs.

## ADR-016 — Sourcemap extraction as the Phase 1 vendoring mechanism

Status: Accepted (Phase 1). The four pinned `@primeuix/*` npm tarballs ship only compiled dist output (`.mjs`/`.d.mts`), no `src/` directory, and the upstream `primefaces/primeuix` GitHub repository's history never reached these exact pinned versions (confirmed gap, Phase 0 Finding 3). Investigation found that every pinned tarball's published `.mjs.map` sourcemaps embed a complete `sourcesContent` array — the original per-file TypeScript source at the exact pinned MIT baseline. `scripts/provenance/extract-source.mjs` recovers this source deterministically from the same checksummed tarballs Phase 0 already pinned (`docs/architecture/checksums.json`), with no network access required at extraction time. This is the official Phase 1+ vendoring mechanism for these four packages.

## ADR-017 — `uix-styles` Phase 1 scope is the `base` module only

Status: Accepted (Phase 1 spec). `@primeuix/styles@2.0.3` ships a `base` module (global/framework-level CSS: box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation) alongside ~90 per-component style modules (button, dialog, datatable, etc.). Phase 1 incorporates only `base` — the ~90 per-component modules are component styles, not shared infrastructure, and Phase 1's explicit non-goal is "do not migrate framework components." Each per-component module migrates alongside its owning component during Phase 2 (Angular), Phase 3 (React), or Phase 4 (Vue). A scope-guard test (`packages/uix-styles/test/scope-guard.test.ts`) enforces this boundary in CI.

**Amended by ADR-082 (2026-11-21):** the Phase 1 limit to `base` no longer binds. A family's structural style lives in `uix-styles` by default, and staying framework-local needs a recorded reason. The rest of this ADR is unchanged.

**Amended by ADR-081 (2026-11-22):** the `base` module now uses `u-*` selectors and is registered by the three cores. The rest of this ADR is unchanged.

## ADR-018 — Option B: Ultimate-owned Angular base-class architecture

Status: Accepted (Phase 2 spec, confirmed by implementation). `ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy is independently authored, informed by but not copied from PrimeNG's `BaseComponent`/`BaseEditableHolder` — notably, PrimeNG's full passthrough (`pt`/`ptOptions`/`ptm`/`ptms`/`ptmo`) system, its `$parentInstance` DI-token lookup, and its full global-config surface are excluded from Phase 2's `UBaseComponent`/`UltimateConfig`, which cover only DI wiring (document/platformId/el/renderer/config), lifecycle, the `dt`/`unstyled` input pair, a `cx()` class-name-slot resolver, and `@ultimate/uix-styled`-backed style registration. This scoping held up across all 5 built components: each component's own provenance entry (`docs/architecture/provenance/ng.json`) documents deliberately excluding passthrough/DI-token-lookup call sites it would otherwise need to port (e.g. Button's badge/Fluid ancestor-detection wiring, Dialog's breakpoint passthrough). Revisit passthrough support only if a later-phase component creates real duplicate-pattern pressure (spec: DEFER, Needs Architecture Decision).

**Amended by ADR-077 (2026-11-21):** the exclusion of the passthrough system no longer holds. `pt` and `ptOptions` are built once in `ng-core`. The rest of this ADR is unchanged.

## ADR-019 — Standalone-only, no NgModule support

Status: Accepted (Phase 2 spec, confirmed by implementation). No `NgModule` authored in `ng-core` or `ng` across any built module (5 components — Button, Checkbox, Dialog, Menu, Tooltip — plus the Ripple/AutoFocus/Fluid/Badge primitives and the BaseComponent/BaseEditableHolder/Overlay/FocusTrap/Bind foundation tier; see `docs/architecture/COMPONENT_INVENTORY.md`). Ultimate has no pre-existing external consumer base requiring NgModule backward compatibility. Every component uses `standalone: true` plus signal-based `input()`/`output()`/`contentChild()`, consistent with the direction PrimeNG's own source is visibly moving.

## ADR-020 — Homegrown overlay/focus-trap retained over `@angular/cdk` Overlay

Status: Accepted (Phase 2 spec, confirmed by implementation). `@angular/cdk` is confirmed unused across the entire 5-component proof-set's dependency closure (Button, Checkbox, Dialog, Menu, Tooltip) — not declared as a peer dependency of either `ng-core` or `ng`. PrimeNG's own homegrown overlay/focus-trap system, adapted into `ng-core`'s `UOverlay`/`UFocusTrap`, has no found defect motivating a CDK migration. `UDialog` (the only overlay component built this phase) wires `UOverlay` + `UFocusTrap` + `@ultimate/uix-motion`'s `createMotion` together directly in its own class/template rather than through a shared "overlay orchestration service" abstraction, per YAGNI — there is exactly one consumer this phase. A real limitation surfaced during implementation: `UOverlay` hardcodes its z-index registry key to a single `"overlay"` bucket for every instance, so there is no working multi-dialog stacking order; `UDialog`'s Escape-key handling was implemented as a plain, unconditional `keydown.escape` host listener (guarded only by `closeOnEscape()`/`visible()`) rather than porting PrimeNG's topmost-z-index stacking check, since there is no real multi-dialog scenario yet to guard. Revisit the registry design if/when Popover/Drawer/ConfirmDialog migrate in a later phase and nested overlays become a real scenario.

## ADR-021 — `ng-packagr` build tooling for Angular packages

Status: Accepted (Phase 2 spec, confirmed by implementation). `tsup` (used elsewhere in the monorepo) does not understand Angular decorators/templates/partial-compilation metadata; `ng-packagr` (which PrimeNG itself uses) produces correct Angular Package Format output without reimplementing that tooling. Both `packages/ng-core` and `packages/ng` build via `ng-packagr -p ng-package.json`. During implementation, both packages' `package.json` were verified to declare `"sideEffects": true` (not `false`) — an earlier premature `sideEffects: false` on `ng` was found and reverted (Task 16/17 finding) because Ultimate components register their style module with `@ultimate/uix-styled`'s `StyleSheet` service as an import-time/`ngOnInit` side effect; marking either package side-effect-free would let bundlers tree-shake away style registration for components that are imported only for their type or re-exported through a barrel, silently dropping component styles. `sideEffects: true` was determined and verified correct on both packages, not merely left at its default.

## ADR-022 — Angular CLI Vitest builder + TestBed for Angular package tests

Status: Accepted (Phase 2 spec, confirmed by implementation). Keeps Vitest-everywhere consistency with Phase 0/1 while still exercising real Angular DI/compiler/template integration via `TestBed`, over Karma/Jasmine (PrimeNG's own stack). All 5 components' and all foundation modules' spec files run under `ng test --project=ng`/`--project=ng-core` (Angular CLI's Vitest builder), using a zoneless `TestBed` throughout. Implementation surfaced a real zoneless-specific test-mechanics issue, not a defect in the components themselves: a test performing two plain-property mutations on a zoneless host fixture in sequence (e.g. `UDialog`'s focus-return-on-close test flipping `visible` twice) can trigger `NG0100` (`ExpressionChangedAfterItHasBeenCheckedError`) on the second `detectChanges()` call; the established fix, applied identically in `packages/ng-core/src/overlay/overlay.spec.ts`, `packages/ng-core/src/bind/bind.spec.ts`, and `packages/ng/src/dialog/dialog.spec.ts`, is `fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(false); await fixture.whenStable();` in place of a second bare `detectChanges()` call.

## ADR-023 — Phase 2 closure: visual baseline and consumer-app validation deferred past Phase 2

Status: Accepted (Phase 2 Completion & Exit-Criteria Gap Review, 2026-08-30; user decision). Blueprint §35 lists five Phase 2 exit criteria. Three are met with runtime-verified evidence (target component set builds; component tests pass — 66 `TestBed` tests across 16 spec files; accessibility baseline passes — ARIA roles/states and keyboard behavior are runtime-tested, not merely source-reviewed, though no automated scanning tool such as axe-core is wired in). Two have no implementation of any kind:

- **Visual baseline established** — zero Storybook, screenshot, or visual-regression tooling exists anywhere in the repository. The Phase 2 spec's own Non-Goals section explicitly demoted this to "not a Phase 2 gate" rather than scoping a minimal version, so this is a spec-level deviation from the Blueprint, not an implementation shortfall.
- **Package consumers can use UltimateNG without installing PrimeNG** — necessary condition is met and CI-enforced (`ceiling:validate`; zero `primeng`/`@primeuix/*` in either package's runtime `dependencies`; zero runtime `from 'primeng'` imports), but the sufficient condition — a real application actually consuming the packages — is not: `apps/playground-angular` and `apps/showcase` are both empty (`.gitkeep` only), and `docs/architecture/PERFORMANCE.md` states directly that no app in the monorepo consumes `@ultimate/ng`/`@ultimate/ng-core` yet.

The gap review found the 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus primitives and foundation tier was the approved spec's deliberate, explicitly-scoped Phase 2 target — not a subset requiring further component migration to close (`docs/architecture/COMPONENT_INVENTORY.md`'s self-audited 14+2+101=117 accounting of the full PrimeNG catalog). Given that, the user decided to accept both unmet criteria as deferred rather than block Phase 2 closure on them. Phase 2 is closed on this basis.

Follow-up work, not yet assigned to a specific later phase:

1. Build a real `apps/playground-angular` consumer app importing and rendering all Phase 2 components. This is also the only way to get a genuine tree-shaking measurement — the documented single-barrel/`UButton`-pulls-in-`UDialog` failure (`ng-packagr`'s partial-Ivy output has no `@__PURE__` annotations, which only Angular's linker adds inside a real app build) cannot be re-measured without one. Scope as one task, not two.
2. Minimal visual-baseline tooling (Storybook or equivalent) with reference screenshots for the 5-component proof set.
3. Provenance manifest schema gap: the Phase 2 spec (line 388) names `sha256OfOriginal` as a required field; neither `docs/architecture/provenance/ng.json` nor `ng-core.json` has it. Either add the field or amend the spec to stop requiring it.
4. `UTooltip`'s floating container has `role="tooltip"` but no `aria-describedby` wired from the trigger element back to it — a real, specific accessibility gap for future hardening.
5. Tree-shaking: the Phase 2 spec originally committed to 9 secondary entry points in `packages/ng/ng-package.json` to enable per-component imports; implementation shipped a single-barrel `entryFile` instead (found and the plan text corrected mid-Phase-2, Task 12). Either implement the secondary entry points, or formally amend the spec to stop stating that as the build strategy.
6. `ngCoreStyleSheet` never overrides `StyleSheet.createStyleElement` — no `<style>` element is ever actually injected into the DOM by Angular's current style-registration path (only metadata dedup occurs). `@ultimate/uix-utils/dom`'s `createStyleElement` already provides the fix — `react-core`'s `ReactStyleSheet` (Phase 3, Task 11) demonstrates the exact pattern to apply. Discovered during Phase 3 research; distinct from the pre-existing five follow-ups above.

## ADR-024 — Option B: Ultimate-owned React base architecture

Status: Accepted (Phase 3 spec, confirmed by implementation). `react-core`'s `useComponentBase` is independently authored, informed by but not copied from PrimeReact's `ComponentBase` — the full `pt`/`ptm`/`ptmo` passthrough system (~150 lines of nested-key resolution in verified source) is excluded entirely. Same YAGNI justification that held across all 5 Angular components (ADR-018) — no demonstrated Ultimate consumer need, revisit only on real duplicate-pattern pressure from a later component.

**Amended by ADR-077 (2026-11-21):** the exclusion of the passthrough system no longer holds. `pt` and `ptOptions` are built once in `react-core`. The rest of this ADR is unchanged.

## ADR-025 — React FocusTrap uses sentinel-span mechanism, not keydown interception

Status: Accepted (Phase 3 spec, confirmed by implementation). `react-core`'s `FocusTrap` reimplements verified PrimeReact behavior (a hidden sentinel-`<span>` pair bracketing children, `onFocus` handlers redirecting real DOM focus back into the trap) rather than Angular's `UFocusTrap` keydown-Tab-interception directive. Materially different, framework-native mechanism, not a bug — React's sentinel-span technique is already idiomatic (plain refs/JSX) and works regardless of dynamic content changes inside the trap.

## ADR-026 — React Escape handling is a centralized priority-queue mechanism, closing a known Angular gap

Status: Accepted (Phase 3 spec, confirmed by implementation). `react-core`'s `useGlobalEscapeKey`/`useDisplayOrder` reimplements verified PrimeReact behavior (a single shared `document` keydown listener gated by a two-level priority tuple, only the topmost most-recently-shown overlay's Escape handler fires) — independently authored, not ported. This is verifiably more correct than Angular's existing `UDialog` Escape handling, which ADR-020 documents as "a plain, unconditional `keydown.escape` host listener" with "no working multi-dialog stacking order" as an accepted, known limitation. Stating this contract for React does not retroactively fix Angular's implementation — that remains tracked separately.

## ADR-027 — React Menu uses `aria-activedescendant` virtual focus, diverging from Angular's literal-DOM-focus `UMenu`

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's real React `Menu.js` uses `aria-activedescendant` (the `<ul>` retains real DOM focus; `focusedOptionIndex` state tracks the "active" item), while `docs/architecture/COMPONENT_INVENTORY.md` documents Angular's `UMenu` as deliberately using literal DOM focus movement instead (a divergence from PrimeNG's own virtual-focus pattern). Given both frameworks' real upstream references disagree on this exact dimension, `react`'s `UMenu` preserves the verified PrimeReact React behavior for React specifically, per ADR-006 (frameworks are independently native) and the principle that cross-framework consistency belongs at the behavior/contract level, not the mechanism level.

## ADR-028 — React motion uses `@ultimate/uix-motion`'s `createMotion`, no `react-transition-group` dependency

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's `CSSTransition.js` wraps the real npm `react-transition-group` package. `react-core`'s `useMotion` instead calls the already-built, framework-agnostic, Promise-based `@ultimate/uix-motion`'s `createMotion(element, options).enter()/.leave()` from a `useEffect` — no functional gap was found during the Real-Source Verification Gate that would require the declarative wrapper PrimeReact needed for its own React implementation. No new runtime dependency added.

## ADR-029 — React styling gets a working `StyleSheet` DOM-injection adapter from day one; a real gap found on the Angular side is tracked separately, not fixed by Phase 3

Status: Accepted (Phase 3 spec, confirmed by implementation). The Real-Source Verification Gate found that `@ultimate/uix-styled`'s `StyleSheet.createStyleElement` is a documented no-op in the base class unless subclassed, and Angular's `ngCoreStyleSheet` never overrides it — meaning Angular's current style-registration path never injects a real `<style>` element into the DOM, a previously-undocumented functional gap. `react-core`'s `ReactStyleSheet` subclasses `StyleSheet`, delegating to the already-built `@ultimate/uix-utils/dom`'s `createStyleElement` — React ships with working style injection from its first commit. Per explicit decision during Phase 3's brainstorming, this ADR does NOT fix the Angular-side gap — that is recorded as a new Phase 2 follow-up (see `docs/architecture/DECISIONS.md`'s ADR-023 follow-up list), kept separately scoped rather than silently absorbed into Phase 3.

## ADR-030 — `UDialog` does not implement draggable, resizable, or maximizable behavior in Phase 3

Status: Superseded by ADR-075 (2026-11-21, user ruling in gap-closing spec #167). It was first marked superseded on 2026-10-22, pending the Prime study; the exclusion is no longer binding. Original status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's real `Dialog.js` supports draggable/resizable/maximizable behavior — a materially larger feature surface than Angular's already-shipped `UDialog`, which has none of these. Phase 3's `UDialog` deliberately does not include them: no such props exist on `UDialogProps`, no drag/resize handlers are wired, no maximize-toggle UI is rendered. Not an oversight — a firm, explicitly-scoped boundary (spec §15), with a dedicated negative regression test (`packages/react/src/dialog/dialog.spec.tsx`) guarding against silent scope creep. Revisit only via a separately approved future scope decision.

## ADR-031 — `URipple` is not built in Phase 3

Status: Superseded by ADR-074 (2026-11-21, user ruling in gap-closing spec #167). It was first marked superseded on 2026-10-22, pending the Prime study; the exclusion is no longer binding. Original status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's `Button`/`Dialog`/`Menu` all import and render `Ripple` upstream. Phase 3's `UButton`/`UDialog`/`UMenu` render without a ripple effect — `URipple` is not a Phase 3 proof-set component, and no ad-hoc ripple implementation was folded into any individual component. Matches Angular's own Phase 2 precedent exactly: `URipple` was built as its own standalone primitive (`packages/ng/src/ripple`), not embedded per-component. A future `URipple` for React, if built, gets its own scope, provenance, and tests — not inherited from this phase.

## ADR-032 — Option B: Ultimate-owned Vue base architecture (Options-API `extends` mixin)

Status: Accepted (Phase 4 spec, confirmed by implementation). `vue-core`'s `createBaseComponent`/`createBaseEditableHolder`/`createBaseInput` are independently authored, informed by but not copied from PrimeVue's real `BaseComponent.vue`/`BaseEditableHolder.vue`/`BaseInput.vue` — the full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough system (~140 lines of nested-key resolution, two separate implementations for the component-mixin and directive-factory mechanisms) and `inject: { $parentInstance }` host-instance lookup are excluded from Phase 4's base, matching the same YAGNI posture ADR-018/024 established for Angular/React. Authoring style is Options-API `extends` mixin chains, not Composition-API composables — a genuine architectural fork resolved during Phase 4's research/brainstorming gate (chosen because it mirrors verified PrimeVue's own `BaseComponent.vue` mechanism most literally).

**Amended by ADR-077 (2026-11-21):** the exclusion of the passthrough system no longer holds. `pt` and `ptOptions` are built once in `vue-core`. The rest of this ADR is unchanged.

## ADR-033 — Separate `BaseDirective`-equivalent factory for directive-shaped primitives

Status: Accepted (Phase 4 spec, confirmed by implementation). `vue-core`'s `createDirective` factory is structurally distinct from `createBaseComponent`'s `extends:`-consumed mixin chain — matching verified PrimeVue's own `BaseDirective.js`, which is a plain object with its own `.extend(name, options)` factory returning real Vue directive lifecycle hooks, not an `extends:`-consumed mixin. This mechanism-shape difference is dictated by Vue's own component/directive distinction, not an independent Ultimate design choice — Angular and React have no equivalent separate-factory need since neither framework has Vue's native custom-directive concept in the same form.

## ADR-034 — FocusTrap, Tooltip, and Ripple are Vue custom directives, not components

Status: Accepted (Phase 4 spec, confirmed by implementation). Verified PrimeVue's real `FocusTrap.js`, `Tooltip.js`, and `Ripple.js` are all Vue custom directives (`v-focustrap`, `v-tooltip`, `v-ripple`), not `.vue` SFC components — a materially different artifact shape from both Angular's `[uFocusTrap]` directive-with-component-render and React's ref-based sentinel _component_ (FocusTrap) or ref-target _component_ (Tooltip). `vue-core`'s `v-focustrap` and `vue`'s `v-tooltip`/`v-ripple` preserve this verified directive-native mechanism rather than converting any of the three into components to superficially match Angular's or React's API shape — per §2.4/ADR-006's framework-native-implementation principle.

## ADR-035 — FocusTrap's `MutationObserver` dynamic-content redirection carried forward

Status: Accepted (Phase 4 spec, confirmed by implementation). Verified PrimeVue's real `FocusTrap.js` includes a `MutationObserver`-driven focus-redirection mechanism for dynamically rendered content inside the trap — a real capability neither Angular's nor React's FocusTrap has (verified absent in both Phase 2's and Phase 3's Real-Source Verification Gates). `vue-core`'s `v-focustrap` carries this forward as verified upstream behavior, not as gold-plating beyond what the reference source demonstrates.

## ADR-036 — Escape/scroll-lock registries extracted to `@ultimate/uix-utils`, `react-core` refactored to delegate

Status: Accepted (Phase 4 spec, confirmed by implementation). Direct re-inspection of `react-core/src/escape/use-global-escape-key.ts` and `react-core/src/scroll-lock/use-scroll-lock.ts` (Phase 4's prerequisite work, Task 1) confirmed both files' core registry/comparison/listener logic had zero load-bearing React coupling — `use-global-escape-key.ts`'s only React import was `useEffect` itself; `use-scroll-lock.ts`'s only React import (`useCallback`) was a non-load-bearing memoization wrapper. This logic was extracted into new `@ultimate/uix-utils/escape` and `@ultimate/uix-utils/scroll-lock` submodules, matching the existing `zindex`/`eventbus` precedent (a plain, module-scoped, imperative registry in `uix-utils`, each framework's `*-core` package wrapping it thinly). `react-core`'s existing files were refactored to delegate to these shared submodules — preserving their exact public signatures and existing test suites unchanged — rather than `vue-core` depending on `react-core` directly, which would have violated the framework-native-isolation principle (§28). `use-display-order.ts`'s `useState`-based reactive return-value contract was deliberately NOT extracted (genuinely React-shaped); only its underlying registry moved — `vue-core` authors its own `ref()`-based reactive wrapper independently.

## ADR-037 — `UMenu`'s Escape handling is a local `keydown` handler, not the shared Escape-priority mechanism

Status: Accepted (Phase 4 spec, confirmed by implementation). Verified PrimeVue's real `Menu.vue` handles Escape entirely locally, inside a `keydown` handler bound directly to its own `<ul>` element — not via a global `document`-level listener the way `Dialog.vue`'s (verified weaker, gap-carrying) mechanism or the shared `@ultimate/uix-utils/escape` adapter (built to fix that gap for Dialog specifically) work. Menu's real upstream Escape handling is scoped-to-focused-element, a genuinely different problem shape than Dialog's multiple-simultaneously-open-overlays stacking problem — the shared mechanism was not built to solve, and does not need to solve, Menu's case. `UMenu` preserves this verified local-handler mechanism rather than routing Menu through the shared adapter "for consistency," which would have contradicted verified source. A real, previously-undocumented switch-statement fall-through (`Escape` case has no `break`, falling into the `Tab` case) is preserved exactly as a documented, harmless-by-trace quirk, not silently corrected.

## ADR-038 — `UCheckbox` supports both controlled and uncontrolled modes, `indeterminate`, and `binary`/array-membership mode

Status: Accepted (Phase 4 spec, confirmed by implementation). Verified PrimeVue's real `BaseEditableHolder.vue`/`Checkbox.vue`/`BaseCheckbox.vue` support a materially broader contract than PrimeReact's fully-controlled-only Checkbox (Phase 3, ADR-024's sibling finding): both `modelValue` (controlled) and `defaultValue` (uncontrolled) modes; a real `indeterminate` prop with DOM-property sync (the opposite finding from PrimeReact's Checkbox, which has none); and a real `binary: false` array-membership mode (checkbox value is a member added/removed from a `modelValue` array) that PrimeReact's Checkbox has no equivalent for at all. `UCheckbox`'s Phase 4 public contract includes all of this — each framework's `UCheckbox` correctly reflects its own verified upstream reference's real capability; this is not an inconsistency with React's narrower Phase 3 contract to reconcile.

## ADR-039 — `UCheckbox` excludes `@primevue/forms` integration despite it being a real, verified, working upstream feature

Status: Superseded by ADR-076 (2026-11-21, user ruling in gap-closing spec #167). It was first marked superseded on 2026-10-22, pending the Prime study; the exclusion is no longer binding. Original status: Accepted (Phase 4 spec, confirmed by implementation, resolved fork — Gate 6 #2). Verified PrimeVue's real `BaseEditableHolder.vue` has a live, working integration with a separate PrimeVue package, `@primevue/forms` (`inject: { $pcForm, $pcFormField }`, `formField.onChange`, `$formNovalidate`/`$formValue`/`$formDefaultValue`/`$formControl`). Unlike Phase 3's equivalent Checkbox-forms decision (where PrimeReact genuinely has no broader form abstraction to exclude — nothing existed to cut), this is a deliberate boundary cut of a real, verified, functioning upstream feature. `@primevue/forms` remains unpinned, unevaluated, with no provenance record — incorporating it is deferred to its own future evidence-based evaluation (pinning its real source, running its own Real-Source Verification Gate), not silently absorbed into Phase 4 because `UCheckbox` happened to touch its edge.

## ADR-040 — `UDialog` excludes draggable and maximizable behavior despite verified upstream support; resizable was never a PrimeVue Dialog feature at all

Status: Superseded by ADR-075 (2026-11-21, user ruling in gap-closing spec #167). It was first marked superseded on 2026-10-22, pending the Prime study; the exclusion is no longer binding. Original status: Accepted (Phase 4 spec, confirmed by implementation, resolved fork — this Phase's architecture-approval gate). Verified PrimeVue's real `Dialog.vue` implements both draggable (full mouse-drag positioning with `keepInViewport` bounds-checking) and maximizable (maximize/unmaximize state, icon swap, scroll-lock toggling) as first-class features — a materially larger feature surface than Angular's or React's already-shipped `UDialog`, neither of which has either. Resizable, unlike PrimeReact's Dialog (which has all three: draggable/resizable/maximizable, explicitly excluded per ADR-030), was never found as a feature anywhere in PrimeVue's real `Dialog.vue` source at all — nothing to exclude there, a genuinely different upstream feature surface than React's reference. Phase 4's `UDialog` excludes draggable and maximizable to keep scope identical across all three frameworks — no such props, handlers, or UI anywhere in the implementation.

## ADR-041 — `v-tooltip`'s content-injection contract preserves PrimeVue's verified two-mode shape (safe default, explicit opt-in raw-HTML escape hatch)

Status: Accepted (Phase 4 spec, confirmed by implementation). Verified PrimeVue's real `Tooltip.js` branches on an `escape` option (default `true`): the default path uses `createTextNode`-based safe text insertion; `escape: false` is an explicit, caller-opt-in-only path using `innerHTML` directly — a real, deliberate divergence from PrimeReact's Tooltip, which has no equivalent opt-in-raw-HTML mode at all (verified absent during Phase 3's gate). `v-tooltip` preserves this exact two-mode contract — the default path never uses `innerHTML`, the raw-HTML path is reachable only via the explicit option, never a fallback. A related, separate, non-blocking finding (Dialog's `breakpoints`-interpolated `<style>` `innerHTML`, CSS-parsing-context not script-execution-context) was confirmed out of Phase 4's `UDialog` scope entirely (no `breakpoints` prop implemented) and is recorded here for a future phase if that feature is ever added, per spec §25.

## ADR-042 — Vue peer range `^3.5.0`, verified via `npm view @primevue/core@4.5.5 peerDependencies`

Status: Accepted (Phase 4 spec, confirmed by implementation). `primevue@4.5.5` itself declares no `peerDependencies` field; the real Vue version constraint lives on its exact-pinned dependency `@primevue/core@4.5.5`, whose own `peerDependencies` field is `{ "vue": "^3.5.0" }` (verified via `npm view`, matching Phase 3 §27's exact methodology for React). `@ultimate/vue` and `@ultimate/vue-core` adopt this as their initial peer range — chosen as real, version-scoped, verified evidence, not because Ultimate is bound to track PrimeVue's cadence going forward (same independent-ownership posture as Phase 3's React policy).

**Amended by ADR-050 (2026-10-04):** the supported Vue floor is now `^3.5.2`.

## ADR-043 — `@ultimate/uix-data` introduced as a narrow, evidence-verified shared Data foundation

Status: Accepted (uix-data spec, confirmed by implementation). Six sequential architecture research passes, each verified against real pinned PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5 source, established that a shared framework-neutral Data contract is supported by evidence only for a narrow set of concepts — not a universal Data-component abstraction. `@ultimate/uix-data` (package name provisional) was created as a new dedicated package, sibling to `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`, exposing exactly six items: `equals` (re-exported unchanged from `@ultimate/uix-utils/object`, per the same "verify zero load-bearing framework coupling, then centralize" pattern established by ADR-036), `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata` (simple non-operator shape only — the operator/constraints variant is verifiably real but differently normalized between PrimeReact and PrimeNG, and is deferred until real `Table` implementation evidence justifies it), `PaginationState`/`getPageCount`, and `calculateNumItemsInViewport`/`calculateLast` (the latter adopting Angular's verified real zero-guard, which PrimeReact's and PrimeVue's real implementations lack and would otherwise divide `0/0` into `NaN`). Hierarchical (Tree-family: Tree/TreeTable/TreeSelect/OrganizationChart) identity/selection/expansion was verified structurally incompatible across frameworks — PrimeNG mutates `TreeNode` object references in place, while PrimeReact and PrimeVue both use external `{[key]: boolean}` key-maps — and is explicitly excluded from any shared contract, remaining framework-native unless future evidence establishes genuine shared semantics. A final consumption-readiness pass, simulating real usage against actual Prime call sites, confirmed no additional primitive was needed: candidates including a sort-toggle cycle (verified present in React/Vue's real source but entirely absent from Angular's), page-link display math (verified identical across all three but classified as a rendering concern), and live-state-coupled virtualization helpers (`calculateFirst` family, called with 5-7 mutable instance fields in real source) were each investigated and rejected as either failing the cross-framework-identity bar or smuggling framework-owned state into a package that must remain pure.

## ADR-044 — Phase 10 testing/documentation tooling: Storybook + Playwright, distinct responsibilities

Status: Accepted (architecture discussion 2026-09-08-phase-10-architecture-discussion.md §2). Storybook is adopted as the platform's component documentation/testing surface (Blueprint §27) and as the mechanism for visual-regression coverage (§28). Playwright is adopted as the mechanism for real-browser and cross-browser interaction testing (§28/§31) and for SSR/hydration verification (§31) once a minimal servable harness exists (see the SSR/GAP-008 scope decision, §5). The two tools have non-overlapping primary responsibilities and both remain additive to the existing Vitest/jsdom/TestBed unit-and-component testing tier, which is unchanged. Specific screenshot-diff mechanism, CI job structure, and per-framework Storybook instance topology are deferred to Specification.

## ADR-045 — GAP-008's SSR/hydration scope is a minimal per-framework harness, not a full consumer/playground app

Status: Accepted (architecture discussion `2026-09-08-phase-10-architecture-discussion.md` §5, promoted from citation-only status in ADR-044 to a standalone record). GAP-008 ("no real consumer application anywhere in the monorepo") is a real, still-partially-open gap, but its SSR/hydration-relevant slice is fully resolved: Phase 10's SSR/hydration verification requirement (Blueprint §28's Build/Package testing tier, §31) is satisfied by one minimal, framework-specific SSR-capable harness per framework — using each framework's own raw SSR primitives (Angular's `provideServerRendering`/`provideClientHydration`; React's `renderToPipeableStream`/`hydrateRoot`; Vue's `createSSRApp`/`renderToString`), not a meta-framework (Next.js/Nuxt) and not a full playground/showcase application. `apps/playground-angular`/`apps/playground-react`/`apps/playground-vue` are the intended homes for these harnesses; `apps/showcase` and `apps/docs` remain out of Phase 10 scope entirely. This closes GAP-034 (SSR/hydration verification) using GAP-008's infrastructure as the vehicle; it does not close GAP-008's fuller scope (tree-shaking re-measurement via a real app build — GAP-009 — genuine bundle-size/performance benchmarking, or a real consumer/demo experience), which remains open, unassigned backlog outside Phase 10.

## ADR-046 — `UModelHolder` inserted between `UBaseComponent` and `UBaseEditableHolder`; `UInputText` is the first ancestor-`UFluid`-detecting component

Status: Accepted (Angular Form Foundation Tier spec, confirmed by implementation). Real PrimeNG 21.1.9's `BaseComponent -> BaseModelHolder -> BaseEditableHolder -> BaseInput` chain was found, during this workstream's Real-Source Verification Gate, to be two distinct tiers GAP-018's original registry text had blurred together — `BaseModelHolder` (minimal: `modelValue`/`$filled`/`writeModelValue`) and `BaseInput` (richer: `fluid`/`variant`/`size`/etc.), with `InputText`/`Textarea` extending `BaseModelHolder` directly, never `BaseEditableHolder` or `BaseInput`. `UModelHolder` is inserted into Angular's existing `UBaseComponent -> UBaseEditableHolder` chain at the position matching real PrimeNG's own ordering (`UBaseComponent -> UModelHolder -> UBaseEditableHolder`), and owns model-value state only — no `ControlValueAccessor` methods, matching real `BaseModelHolder`'s own scope exactly. `UInputText` extends `UModelHolder` directly (skipping `UBaseEditableHolder`), reads `NgControl` read-only purely to sync `UModelHolder` state, and does not implement `ControlValueAccessor` itself — Angular's native `DefaultValueAccessor` remains the sole accessor for the underlying `<input>` element, matching real `InputText`'s own architecture (an attribute directive, not a CVA-implementing wrapper). Separately, this workstream's `hasFluid` (ancestor `UFluid` DI-lookup via `inject(UFluid, {optional, host, skipSelf})`) is the first Ultimate component to actually implement this mechanism — `UButton`'s own doc comment (Phase 3) documents that it deliberately excludes this exact pattern as "a host-DI-lookup mechanism `UBaseComponent`'s scoped-down Option B architecture has no equivalent for." `UInputText` closes that gap for itself specifically, without retroactively adding it to `UButton`. The richer `BaseInput`-equivalent tier remains deferred (GAP-038) — no real consumer in this workstream justifies building it speculatively.

**Follow-up gap, recorded not fixed:** real PrimeNG's `BaseEditableHolder.writeValue` calls `this.writeControlValue(value, this.writeModelValue.bind(this))` — a bridge letting subclasses populate `modelValue` by implementing `writeControlValue`. `UBaseEditableHolder` has no such bridge; `writeValue` stays a bare `abstract` method. Net effect: `modelValue`/`$filled` are inherited-but-permanently-dead on every current `UBaseEditableHolder` subclass — e.g. `UCheckbox` writes only to its own `checked` signal, never calling the inherited `writeModelValue`, so `UCheckbox.modelValue()` stays `undefined` and `UCheckbox.$filled()` stays `false` always. Not fixed on this workstream (`UCheckbox` refactors and `UBaseEditableHolder`-shape changes are out of scope here — real regression risk with no current consumer justifying it). A natural first task for whoever builds the GAP-038 `UBaseInput` tier: add the `writeControlValue` bridge to `UBaseEditableHolder` and wire real subclasses (starting with `UCheckbox`) to call `writeModelValue` from their own `writeValue`. **This bridge is now built — see ADR-047.**

---

## ADR-047 — `UBaseInput` foundation tier, the `writeControlValue` bridge, `UCheckbox`'s migration, and `UInputNumber` as the first real `UBaseInput` consumer

Status: Accepted (Angular Form Foundation Tier spec, confirmed by implementation; closes GAP-038).

**`UBaseInput`'s insertion point and surface.** `packages/ng-core/src/base-input/base-input.ts`'s `UBaseInput` is inserted directly above `UBaseEditableHolder` in the existing chain (`UBaseComponent -> UModelHolder -> UBaseEditableHolder -> UBaseInput`), matching real PrimeNG 21.1.9's own verified `BaseComponent -> BaseModelHolder -> BaseEditableHolder -> BaseInput` ordering. Real-source extraction (`packages/primeng/src/baseinput/baseinput.ts`) confirmed it introduces zero `ControlValueAccessor` surface of its own — a pure input/config tier carrying `fluid`, `variant`, `size`, `inputSize`, `pattern`, `min`, `max`, `step`, `minlength`, `maxlength`, plus the computed `$variant` and `hasFluid` getter. `$variant`'s upstream `config.inputStyle()`/`config.inputVariant()` fallback is omitted, matching `UInputText`'s own already-established, deliberate omission (`UltimateConfig`'s Option-B surface has neither field).

**The `U_FLUID_ANCESTOR` token design.** `UBaseInput` cannot DI-inject `UFluid`'s class directly the way `UInputText` does (`inject(UFluid, {optional, host, skipSelf})`): `UBaseInput` lives in `ng-core`, which has no dependency on `@ultimate/ng` (`ng` depends on `ng-core`, not the reverse — importing `UFluid`'s class from `ng-core` would create a circular workspace dependency). Resolution: a new marker `InjectionToken<true>`, `U_FLUID_ANCESTOR` (`packages/ng-core/src/base-input/fluid-ancestor.token.ts`), which `UBaseInput` injects (`optional, host, skipSelf`) in place of the class itself, and which `UFluid` (`packages/ng/src/fluid/fluid.ts`) now provides on itself (`providers: [{ provide: U_FLUID_ANCESTOR, useValue: true }]`). `hasFluid` is unchanged in behavior — `fluid() ?? !!ancestor` — only the DI mechanism changes. This preserves the same ancestor-`<u-fluid>`-detection capability `UInputText` proved, without `ng-core` ever importing from `ng`.

**The `writeControlValue` bridge.** Real PrimeNG's `BaseEditableHolder.writeValue` calls `this.writeControlValue(value, this.writeModelValue.bind(this))` rather than implementing CVA logic directly — ADR-046 recorded this bridge as a known, deliberately-deferred gap in `UBaseEditableHolder`. It is now built: `writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void` is a new, overridable method on `UBaseEditableHolder` (`packages/ng-core/src/base-editable-holder/base-editable-holder.ts`) with a NOOP default (matching real PrimeNG's own documented "should be overridden in derived classes"), and `writeValue` is now a fixed, non-abstract method that always calls `this.writeControlValue(value, this.writeModelValue.bind(this))`. Subclasses override `writeControlValue`, never `writeValue`, to populate `modelValue`/`$filled` (via the `setModelValue` callback) and any local state from the same CVA write.

**`UCheckbox`'s specific migration.** `UCheckbox` (`packages/ng/src/checkbox/checkbox.ts`) now overrides `writeControlValue` in place of its previous direct `writeValue` override. Its own `checked` signal remains the authoritative, template-bound state source (unchanged from before — `UCheckbox` does not derive `checked` from `modelValue()` the way real PrimeNG's own `Checkbox` does); `writeControlValue` additionally calls `setModelValue(value)` so the inherited `modelValue`/`$filled` are populated in parallel on every CVA-driven write. `toggle()` — the user-interaction path (click/Space) — also calls `writeModelValue` directly, so `modelValue`/`$filled` stay in sync on user-driven writes too, not only CVA-driven ones; without this second call, `modelValue` would go stale the instant a user clicked the checkbox. `UCheckbox`'s own pre-existing test suite required no changes — the migration is a pure refactor of the write path, not a behavior change to `checked`/CVA semantics.

**`UInputNumber`'s real CVA-implementing shape, and its scope boundary.** `packages/ng/src/input-number/input-number.ts`'s `UInputNumber` extends `UBaseInput` directly (skipping no tier, matching real `InputNumber extends BaseInput`). Unlike `UInputText` — an attribute directive implementing no `ControlValueAccessor` of its own, relying on Angular's native `DefaultValueAccessor` — `UInputNumber` IS a `@Component` and DOES implement its own CVA surface: `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UInputNumber, multi: true }]` plus an overridden `writeControlValue`, confirmed against real source's own `INPUTNUMBER_VALUE_ACCESSOR` constant. This is a genuine, source-verified architectural difference between the two components, not an inconsistency introduced by this workstream. `writeControlValue` matches real source's exact coercion pattern (`this.value = value ? Number(value) : value; setModelValue(value);`), and `value: number | null` is `UInputNumber`'s own local, template-bound state (matching real `InputNumber`'s own `value` field and `UCheckbox`'s own-local-state-plus-bridge precedent). `clampToRange` is a deliberately scoped-down port of real source's `validateValue` — only the `min`/`max` branches, applied on every value change from a CVA write or user input; NOT re-applied merely because `min`/`max` themselves change while a value is already set (no `effect`/`ngOnChanges` watches them — matches real source, which also only calls `validateValue` from those same two call sites). Explicit scope boundary, excluded per the spec's Non-Goals: locale-aware `Intl.NumberFormat` formatting (`formatValue`/`parseValue`), clipboard paste handling (`onPaste`), cursor/caret-position insertion logic (`insertText`/`deleteRange`/`updateInput`/`initCursor`), and configurable spinner-button layouts (`showButtons`/`buttonLayout`) — none of these are built.

**The secondary-entry-point outcome, and its refinement of GAP-009.** `input-number` ships via a real `ng-packagr` secondary entry point (`packages/ng/input-number/ng-package.json`, `./input-number` in `packages/ng/package.json`'s `exports` map) — the opposite outcome from `UInputText`'s `input-text`, which GAP-009 documents as the 5th confirmed trigger of the `ShimReferenceTagger` defect (one secondary entry point's source directly importing a file that is itself another secondary entry point's root). `UInputNumber` also has ancestor-`UFluid` detection (inherited via `UBaseInput`'s `hasFluid`), but `input-number.ts` itself never imports `UFluid`'s class — the `U_FLUID_ANCESTOR` token indirection means the cross-secondary-entry-point class import that triggers the defect never happens in `UInputNumber`'s own compilation unit. This is recorded as a refinement, not a contradiction, of GAP-009's existing evidence: the defect is triggered specifically by a direct, class-level cross-secondary-entry-point import, not by inherited ancestor-detection behavior in general. Practical consequence for future work: a component needing ancestor-`UFluid` detection should route it through `UBaseInput`'s token pattern, not a direct `UFluid` import, to remain eligible for its own secondary entry point. See GAP-009's own entry for the full refinement note.

---

## ADR-048 — The pinned last-MIT Prime versions are the normative Prime-parity baseline

Status: Accepted (user decision, 2026-10-01, post-closeout reconciliation of `feature/prime-parity-audit-gaps`).

**Normative baseline.** The Prime-parity program measures Ultimate against the exact upstream versions already pinned in `docs/architecture/PROVENANCE.md` and used by the parity audit: PrimeNG `21.1.9` (commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`), PrimeReact `10.9.9` (commit `d0f574e39122668292fc7a740f081bae1b93b1e9`), PrimeVue `4.5.5` (commit `66dde6788220fc9e6822342919d1ceb0e3460ece`), and `@primeuix/styles` `2.0.3`, `@primeuix/themes` `2.0.3`, `@primeuix/styled` `0.7.4`, `@primeuix/utils` `0.7.2`, `@primeuix/motion` `0.0.10`. These are MIT-licensed. A GAP's parity claim must be backed by these sources.

**Newer releases are reference only.** As of 2026-10-01 the current upstream majors — PrimeNG `22.x`, PrimeVue `5.x`, PrimeReact `11.x`, `@primeuix/themes`/`@primeuix/styles` `3.x` — are published under the commercial "PrimeUI License", not MIT. They may be read for research and context only. Nothing is incorporated from them, and a behavior present only in a post-baseline release does not create a new Ultimate GAP. This extends `PROVENANCE.md`'s existing "architectural reference only" treatment of PrimeReact `11.1.0` to all post-baseline Prime releases.

**Scope boundary.** New post-baseline Prime features are outside the current parity scope unless a new scope is explicitly authorized. Moving the baseline to a newer version is itself a separate decision that would need a licensing review.

**Re-check, 2026-10-22 (user decision, Phase 2 Prime reference study).** The npm registry was checked for MIT releases published after each pin. Six pins are still the last MIT stable release of their package. Two are not, and both pins stay:

- **PrimeNG `21.1.10`** (2026-09-09, commit `e35af53afc675c9565b4aba07e6ec9f39bff7c5e`) is MIT under the same community licence text as `21.1.9`. Its only library change is a MultiSelect fix (upstream #19640): `onOverlayHide` is removed and the overlay calls `hide()`. The rest is formatting, README, showcase, LTS changelog and lockfile changes. Its dependencies match `21.1.9`. The pin stays at `21.1.9` because every existing Ultimate record is built on it and moving it would shift the parity baseline for one fix.
- **`@primeuix/motion` `0.1.1`** (2026-02-25) is MIT, but no pinned framework release can use it. PrimeNG `21.1.9` and `21.1.10` declare `^0.0.10`, and PrimeVue `4.5.5` and PrimeReact `10.9.9` do not depend on it. The pin stays at `0.0.10`, the version Prime actually ships.

Every package's next release after these is commercial (PrimeUI License), so no periodic re-check is scheduled. All eight cached archives match their `docs/architecture/checksums.json` sha256 values.

## ADR-049 — Vue component prop types flow from inferred typed factories; type-only typing; contract-based nullability

Status: Accepted (user decision, 2026-10-03, GAP-082 Architecture Discussion).

**Context.** `@ultimate/vue` components ship empty or partial prop types. The 95 Vue base factories (90 in `packages/vue`, 5 in `packages/vue-core`) are annotated `: ComponentOptions`, which erases the props that every SFC inherits through `extends:` (ADR-032).

**Decision.** Component prop types are generated from the existing runtime prop declarations:

- **Inferred typed factories.** Each factory returns `defineComponent({...})` with an inferred return type. SFCs keep their plain JavaScript `<script>` and their `extends:` chains. No hand-written parallel declarations (the PrimeVue model) are added. No SFC is converted to TypeScript or `<script setup>`.
- **Type-only typing.** Adding type information must not change runtime behavior. Where a prop's inferred type is wrong or too narrow, the prop is typed with a type-only `PropType` cast that keeps its runtime `type` behavior unchanged. That means no new Vue prop validation, no Boolean casting and no new development warnings. In JavaScript SFCs the cast is a JSDoc type cast.
- **Array props** accept both mutable and readonly arrays (`readonly unknown[]`, or the equivalent member in a union type).
- **Nullability rule.** A prop's public type includes `null` when `null` is a valid value of that prop's runtime/public contract.
  - `default: null` alone is not sufficient evidence.
  - Vue's runtime acceptance of `null` is not sufficient either, since every non-required prop accepts it.
  - Evidence is the component's own handling of `null` as a meaningful value. Example: `base-input.ts` treats a `null` `size`, `variant` or `fluid` as "unset, inherit".
  - PrimeVue `4.5.5`'s declaration of the corresponding prop is a reference where one exists.
  - Props typed `any` because of Vue's inference behavior (the editable-holder model/default values and the checkbox/radio/toggle values) accept `null` naturally.

**Scope.** This decision provides real prop types and compile-time rejection of wrong prop value types, keeps existing emit typing, and must not introduce false type errors in valid existing consumer code. Out of scope:

- typed slots
- emit payload typing
- literal-union / `HintedString` enum precision
- `pt`/`dt`/`unstyled` typing
- unknown-prop rejection
- PrimeVue declaration parity

**Rejected.**

- Hand-written parallel declarations: type/runtime drift, pipeline rework.
- TypeScript SFC conversion: unnecessary for the contract, large surface.
- `<script setup>`/`defineProps`: conflicts with ADR-032.
- Runtime `String`/`Boolean` types for the type-less props: adds development warnings, and Boolean casting changes a bare `fluid` attribute from `""` to `true`.

**Consequences.**

- Factory return types become specific component types, a type-only public API change. A factory result is no longer assignable to `ComponentOptions`.
- `@ultimate/vue` declarations grow from about 194 KB to about 610 KB.
- A consumer type-check that imports every entry point costs about 1.7 s → 2.5 s and about 245 MB → 400 MB.
- The runtime JavaScript barrel's gzip size grows by about 0.75%.

## ADR-050 — Vue floor raised to `^3.5.2` (amends ADR-042)

Status: Accepted (user decision, 2026-10-04, GAP-083 Architecture Discussion).

**Context.** ADR-042 set the `vue` peer range of `@ultimate/vue` and `@ultimate/vue-core` to `^3.5.0`, following `@primevue/core@4.5.5`. Their shipped declarations reference Vue's `DefineComponent` with 20 type arguments. Vue 3.5.2 added the 20th type parameter (`TypeEl extends Element = any`); Vue 3.5.0 and 3.5.1 accept at most 19. A consumer type-check of the packed packages therefore fails on Vue 3.5.0 and 3.5.1 (TS2707, in both packages, and the component types are lost) and passes on 3.5.2 and later.

**Decision.**

- The supported Vue floor for `@ultimate/vue` and `@ultimate/vue-core` is `^3.5.2`. Vue 3.5.0 and 3.5.1 are excluded because they cannot consume the emitted declarations.
- `validate` enforces the floor: a consumer type-check installs the packed packages with `vue@3.5.2` and type-checks the declarations of both packages. It is in addition to the existing consumer check against the workspace Vue version (GAP-082), which stays.
- This ADR supersedes ADR-042's floor only. ADR-042's posture stands: Ultimate chooses its Vue range on its own evidence and does not track PrimeVue's.

**Rejected.**

- 19-argument declarations that keep `^3.5.0`, by post-processing the emitted files or building them against older Vue types. Technically feasible (the research probe passed on every 3.5.x release), but it couples declaration generation to Vue's internal type shape, and each future change to that shape could need the same treatment.
- Hand-written declarations with a project-owned `DefineComponent` alias (the PrimeVue `4.5.5` model). It reverses ADR-049, which chose inferred factory types to avoid type/runtime drift.

**Consequences.**

- The `vue` peer range of both packages becomes `^3.5.2`. Applications on Vue 3.5.0 or 3.5.1 must upgrade.
- `validate` runs one more consumer type-check, at the floor version.
- The floor is now an explicit, checked contract instead of an assumption.

## ADR-051 — Component style keys equal the upstream Aura preset key; components may register additional preset keys' variables

Status: Accepted (user decision, 2026-10-04, GAP-064 Architecture Discussion).

**Context.** A component's `componentName` is both its structural-stylesheet key and the key `registerThemeVariables` passes to `Theme.getComponent()`, which reads `preset.components[name]` without normalization. `dt()` emits `var(--u-…)` references with no fallback. Fifteen Angular and sixteen Vue components, and InputGroup in both frameworks, register hyphenated keys (`input-text`) while the Aura preset uses the upstream keys (`inputtext`). Their token variables are therefore never defined. Separately, Vue `InputNumber` renders a plain `<input>` whose CSS uses only `inputtext.*` tokens; upstream obtains those variables from a child InputText.

**Decision.**

- **Style key equals preset key.** An Angular or Vue component whose structural CSS consumes an Aura preset module registers under that module's upstream key, matching PrimeNG 21.1.9 and PrimeVue 4.5.5 (`name = 'inputtext'`, …). Where it differs today, `componentName` is renamed. The shared lookup (`registerThemeVariables`, `Theme`) is unchanged, so React is unaffected.
- **Additional preset keys.** A component may also register the theme variables of further preset keys that its structural CSS consumes, without registering any structural CSS under those keys. The first and only current use is Vue `InputNumber`, which registers `inputnumber` and `inputtext`. Its DOM and component structure do not change.
- Sub-parts without an upstream module (`input-icon`, `input-group-addon`, `button-group`, Vue `menuitem`) keep their keys, as upstream does.

**Rejected.**

- Normalizing names (stripping hyphens) inside `registerThemeVariables`. It is one line, but it would also change React, which registers through the same function and is outside GAP-064, and it departs from upstream's exact-key lookup.
- A separate optional `themeKey` alongside `componentName`. It adds an API that upstream does not have, for no benefit over renaming.
- Rendering Vue `InputNumber`'s input as a child InputText. That is a structural component change, not a theming change.

**Consequences.**

- The key also appears as the value of the generated `<style>` elements' key attribute (`data-u-ng-style` in Angular, `data-u-style` in Vue, and `<key>-variables` for the variable block). For renamed components that value changes. It is not a documented consumer contract, and Angular SSR hydration reuse (GAP-078) is unaffected because server and client use the same key.
- No exported signature changes. Angular's `componentName` is `protected`, and Vue's is an internal `createBaseComponent` argument.
- New Angular or Vue components whose structural CSS consumes an Aura preset module register under that module's upstream key.

**Amended by ADR-078 (2026-11-21):** the rejection of name normalization inside `registerThemeVariables` no longer holds. The lookup strips hyphens from the registration name, so React's kebab-case names find their flat Aura keys. Angular and Vue are unchanged, and the renames this ADR decided stand. Original text stays as history.

## ADR-052 — GAP-064 cross-tranche parity rules for the remaining G3 tranches (selector reachability, DOM admissibility, state selectors, runtime roles, open-state screenshots, tranche CI evidence)

Status: Accepted (user decisions, 2026-10-06, GAP-064 cross-tranche decision gate and C2-0 Spec Review). This ADR is the normative record of those rulings. The rule text below is transcribed from the approved rulings without change of substance; X-12 is given in its corrected form.

**Context.** The selector-reach audit of the shipped G3-A, G3-B and G3-C1 CSS found that upstream selector text can be ported faithfully while a selector never reaches Ultimate's rendered DOM (G3-C1 Errata E2 and E3). It also found pre-existing component defects that a CSS port alone cannot evidence (study §4.1), and CI signals that a red global run masks (study §5, §11). The rules below apply to G3-C2, G3-D and G3-E. They extend, and do not reverse, ADR-051, D-G3-1..9 and C-1..C-11.

**Decision.**

**X-1 — Selector reachability.** For each tranche and each framework, every selector part a ported style module emits belongs to exactly one class. A selector part is a top-level comma part, read inside its at-rule.

- **R (reached):** matches at least one element in at least one named verification story, with that story's documented state applied.
- **K (conditional):** every class or attribute it needs is emitted by a cited source location under a named state that no story exercises. The tranche Spec lists it with the reason.
- **X (excluded):** not emitted, and recorded as an FX omission (D2).

State pseudo-classes and pseudo-elements are removed before matching. Combinators are evaluated against the actual rendered DOM, including framework-generated host elements such as Angular component hosts. A selector that matches only upstream markup and cannot match Ultimate's rendered DOM is not R evidence. Static textual fidelity to upstream selectors is never reachability evidence. The tranche-scoped reach test runs inside that tranche's existing verification specs; there is no separate CI step.

**X-2 — DOM-admissibility gate.**

> A parity tranche must not introduce, remove, reorder, or structurally alter rendered DOM solely to make upstream CSS selectors match. Existing framework-generated host elements may be accounted for when evaluating selector reachability, but they must not be removed or bypassed by changing component structure. Any DOM change required for behavioral parity must be separately authorized as a runtime/component correction, with its own evidence and scope.

- CSS adaptation to the existing DOM is allowed within a parity tranche.
- A DOM or runtime change is not ordinary CSS parity work and needs separate authorization.

**X-3 — Value-qualified state selectors.**

- A selector addressing a state attribute uses the value the component emits, for example `[data-u-open="true"]`, or the corresponding negated value.
- A presence-only attribute selector is allowed only for an attribute the component actually adds or removes entirely, such as `hidden`, with rendered evidence for both states in both frameworks.

**X-3b — Disabled appearance vs interaction guard.** The visual disabled state and interaction protection are verified separately. `pointer-events` alone is never treated as the complete interaction guard.

**X-4 — C-4 extension: runtime styling and positioning roles.** Each tranche's research lists every runtime styling or positioning responsibility in the pinned PrimeVue 4.5.5 / PrimeNG 21.1.9 source (`inlineStyles`, `nestedPosition`, `absolutePosition`, `addStyle`, runtime CSS variables). Each one is mapped to CSS keyed on state Ultimate already emits, kept as Ultimate's existing mechanism, or excluded. No new JavaScript or runtime state is introduced by a CSS port.

For **G3-C2**, C-4 covers:

1. submenu visibility;
2. the TieredMenu popup's initial off-screen placement;
3. ContextMenu root positioning;
4. nested submenu placement: upstream `nestedPosition()`'s default result (`inset-inline-start: 100%; top: 0`) expressed in CSS on the existing open state. Upstream's viewport-overflow flip is JavaScript-driven and is not introduced; the C2 Spec states the overflow decision explicitly;
5. Angular host-aware visibility adaptation.

Role 5 is not an exclusion or a PX. It is a CSS adaptation to Ultimate's existing rendered DOM, with no DOM change, no JavaScript change and no new runtime state. Where Angular inserts an existing component host between the item and the submenu, selectors account for that host, for example `.u-tieredmenu-item[data-u-open="true"] > u-tiered-menu-sub > .u-tieredmenu-submenu`. Vue keeps the direct-child form where its rendered DOM supports it. The Angular F-3b corrections are pre-existing defect corrections inside C2, not fidelity omissions.

**X-6 — Deterministic open-state screenshots** (refines C-10 and D-G3-7, replaces neither). Applies to every C2, D and E story whose verified CSS is visible only in an open or interaction state.

1. Open through the real trigger, using fixed coordinates where applicable.
2. Park the pointer at (0, 0) before capturing any resting state (this accounts for Firefox pointer residue).
3. Before a screenshot: verify the expected state attribute, verify a non-`none` computed `display` and a non-zero box, and wait for the existing motion-settle period.
4. Keep one baseline per engine × framework. Compare geometry within an engine, never across engines.

**X-12 — Per-tranche CI evidence.** A tranche counts as CI-verified without the whole repository CI being green, when the merge commit's run shows:

- **Green by status:** Build, Typecheck, Coverage measurement; the strict Playwright projects (ng, vue, react) and the accessibility baseline validation; the new tranche's verification and differential accessibility steps (ng, vue); every earlier tranche's steps, except the named pre-existing failure (vue G3-B step, U2).
- **Checked in the logs:** the provenance script self-tests add the new tests to the pass count, with exactly the 3 named pre-existing failures; Vue and React coverage percentages do not drop run over run by more than the gate threshold.
- **Provenance:**
  1. **Repository-wide provenance validation** (`provenance:validate`) is classified as **pre-existing debt**. It is red, it is expected to stay red, and its output is not tranche evidence. The tranche does not fix the validator or the missing entries.
  2. **Tranche-level changed-file provenance completeness** is the authoritative provenance evidence: every source file the tranche changes has a matching `ultimateDestination` entry in `docs/architecture/provenance/{ng,vue}.json`. It is verified directly over the tranche's changed-file list (relative to the tranche's branch point) and recorded at closeout. The repository-wide validator is never claimed to establish completeness.
- **Recorded at closeout:** `coverage:validate`, lint on the changed files, the Docker tranche run, the full regression run, the X-1 reach test, and the size measurement.

Unrelated CI debt is not fixed under this rule. Any change to the named pre-existing failure lists needs a separate decision.

**Not decided here.** The study's proposals X-5, X-7, X-8, X-9, X-10 and X-11 stay proposals until separately decided. **Later decision (2026-10-11):** X-8 (a), the accessibility row policy, is decided by ADR-053 (AC-3a); X-8 (b), the scan-race fix, was already merged (`802f341`, at `b290919`). X-5, X-7, X-9, X-10 and X-11 remain undecided. The recorded factual corrections to D-G3-4 and D-G3-9 (study §10) are applied at G3-D and G3-E research.

**Consequences.**

- Every remaining G3 Spec states, per framework, the R/K/X class of each emitted selector part, and ships a reach test inside its verification specs.
- Runtime or DOM corrections (for example C2-0) are separately specified and authorized, never folded into a CSS parity port.
- Tranche closeouts cite the X-12 evidence set, not the overall CI status and not the repository-wide provenance validator.

## ADR-053 — Accessibility acceptance policy for the first pre-1.0 publish (P-B, AC-1 to AC-7; decides the X-8 (a) row policy)

Status: Accepted (user decision, 2026-10-11, completion-assessment Architecture Discussion).

**Context.** Blueprint §30 makes accessibility regressions release blockers but does not say how pre-existing findings are treated. The user ruled on 2026-10-11 that every Blueprint §40 criterion applies to the first pre-1.0 publish, that an unmet criterion is an exception only when explicitly documented and approved, and that GAP-086, GAP-100, GAP-111, GAP-112, GAP-123 and every critical-severity component-level baseline finding (19 rows at `99364dc`) are required fixes. ADR-052 left the cross-tranche proposal X-8 undecided.

**Decision.**

- **Policy P-B, severity-tiered with documented exceptions**, measured by AC-1 to AC-7:
  - **AC-1:** no new violations; the existing baseline gate stays green and extends to every in-scope component story.
  - **AC-2:** zero critical component-level baseline rows. **AC-2a:** a critical row counts as fixed only when the component supports an accessible name and the documented story provides one, and the row's fingerprint disappears from a real scan.
  - **AC-3:** zero serious WCAG A/AA component-level rows, except rows individually approved as exceptions. **AC-3a (decides X-8 (a)):** a row is eligible as an upstream-Aura parity exception only when the rule is `color-contrast`, both colours equal resolved upstream Aura tokens, and the element has the same upstream role. Eligibility is not approval.
  - **AC-4:** every in-scope interactive component's primary interactions are keyboard-operable per its WAI-ARIA APG pattern, shown by committed keyboard e2e tests green in CI.
  - **AC-5:** modal and overlay components move focus in, contain it while modal, and restore it on close, shown by committed e2e assertions green in CI.
  - **AC-6:** the 246 Storybook-shell rows (`region`, `landmark-one-main`, `page-has-heading-one`) are one documented environmental class, not component defects. A non-shell row under these rules is a component finding.
  - **AC-7:** a dated manual assistive-technology check (screen reader and browser named) for each required fix and each new component family.
- **Required fixes (unchanged, not re-scoped):** GAP-086, GAP-100, GAP-111, GAP-112, GAP-123 and the 19 critical baseline rows (Checkbox `label`, Table `aria-required-children`).
- **Approved dispositions:** fix the 7 `svg-img-alt` rows, the 3 Scroller `scrollable-region-focusable` rows, and GAP-114, GAP-115 and GAP-122. GAP-103 and GAP-104 are fixed or become explicitly approved exceptions. GAP-116 may be recorded as an intended-divergence exception, effective only once entered in the approved exception register (entered 2026-10-11 as exception EX-3).
- **Contrast rows:** the 29 rows earlier approved as Aura parity exceptions (11 on 2026-10-04, 18 on 2026-10-06) are **candidates only**. Each must meet AC-3a and receive explicit publish-level approval. The 5 Button contrast rows are tested against AC-3a independently.
- **AC-8 (high contrast, RTL):** a research spike is authorized. Both stay unresolved §40 items until a decision follows the evidence; missing evidence is not an accepted exception.

**Not decided here.** The X-8 (b) scan-race fix was already decided and merged (`802f341`, merged at `b290919`); this ADR records only X-8 (a). The other ADR-052 proposals (X-5, X-7, X-9, X-10, X-11) stay undecided.

**Consequences.**

- `ACCESSIBILITY_BASELINE.md` rows leave the baseline only by real scans (its one-way-door contract is unchanged).
- The required fixes and the approved dispositions each need their own Specs and normal approval gates.
- Publish exceptions were recorded one row per approved exception in the exception register (gate G14); that register has been retired.

## ADR-054 — Tree-family components are implementation-eligible as framework-native components

Status: Accepted (user decision, 2026-10-11, K-7 Architecture Discussion).

**Context.** ADR-043 excludes Tree-family identity/selection/expansion from any shared contract and states the components remain framework-native. GAP-013 and DECISION-D's 2026-09-21 OrganizationChart clarification nevertheless recorded the four components, or Angular OrganizationChart, as blocked or excluded from implementation. The 2026-10-11 scope ruling includes all remaining inventory areas. Re-verification against the pinned PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5 sources confirmed the divergent state models ADR-043 recorded. React and Vue OrganizationChart already ship with framework-local node types (G3-E, `dd4c963`).

**Decision.**

> Tree, TreeTable, TreeSelect and Angular OrganizationChart are implementation-eligible as framework-native components, each following its framework's upstream state model with framework-local types. ADR-043's exclusion of a shared hierarchical contract and DECISION-D's protection of that question remain unchanged.

- Build order: Tree, then TreeSelect, then TreeTable, then Angular OrganizationChart. TreeTable's dependencies are addressed by its Spec.

**Rejected.** A shared hierarchical contract in `uix-data` (reopens DECISION-D without new evidence); a shared type-only `TreeNode` (Angular's node type carries the contested state fields).

**Consequences.**

- No shared Tree type or contract enters any `uix-*` package.
- If implementation surfaces genuine shared semantics, it is recorded as new evidence for DECISION-D and not acted on inside the implementation.
- Each component goes through its own Spec, Spec Review, Plan and Plan Review. This ADR authorizes no implementation.

## ADR-055 — External runtime dependency approval policy (DECISION-B); `chart.js` and `quill` approved as optional peers

Status: Accepted (user decision, 2026-10-11, K-8 Architecture Discussion). Does not amend ADR-004 or ADR-005.

**Context.** ADR-004 covers Prime packages only, and no process existed for a non-Prime runtime dependency (DECISION-B). Chart (Chart.js) and Editor (Quill) are in scope. Upstream Prime packages load both libraries from the consumer's install without declaring them.

**Decision.**

- **Policy (option (a)).** A non-framework-ecosystem runtime dependency of a framework package requires a recorded approval with: a license on the CI license allowlist; a clean `pnpm audit --prod` for it and its closure; a review of install scripts (`onlyBuiltDependencies`); a recorded bundle cost; and an approved version range.
- **Integration model I-1.** Such a dependency is an **optional peer dependency** (`peerDependencies` with `peerDependenciesMeta.optional`), loaded lazily by the consuming component only. Consumers who do not use that component install nothing.
- **Approved cases.** `chart.js` `^4.5` (Chart) and `quill` `^2.0.3` (Editor), **subject to the policy checks being recorded and enforced**. Until the checks are recorded, neither may be declared by a package.
- `DEPENDENCIES.md` gains an "approved optional runtime dependencies" category; the earlier copy-paste exclusion stays for PrimeReact's showcase dependencies.

**Not established.** Whether company policy requires a legal review (Blueprint §8) is not known from the repository; no legal review is claimed.

**Consequences.**

- CI enforcement (a validator that rejects unapproved non-framework runtime dependencies or peers) is specified through its own Spec.
- An Angular Chart must load Chart.js lazily, although PrimeNG imports it statically.
- Chart and Editor still need their own Specs and Plans.

## ADR-056 — No `config`, `passthrough` or shared `api` surface is needed for the approved component scope; icons are need-driven

Status: Accepted (user decision, 2026-10-11, K-9 Architecture Discussion).

**Context.** The remaining inventory lists `config` (full surface), `passthrough`, `api` (remaining surface) and the remaining icons. GAP-021 and ADR-018, ADR-024 and ADR-032 defer `config` and `passthrough` until real duplicate-pattern pressure. Research found that every upstream use in the components still to build maps to an established per-component Ultimate pattern, and that shipped components contain no passthrough usage.

**Decision.**

- Option N: no new `config`, `passthrough` or shared `api` surface is needed for the approved scope. GAP-021 and ADR-018, ADR-024 and ADR-032 are unchanged.
- Remaining icons are in scope on a need-driven basis: those required by in-scope components, not every remaining upstream icon.
- No new i18n/translation requirement is introduced; no current source requires one.

**Consequences.**

- In-scope component Specs follow the per-component precedents: English-default label inputs, `variant` through the base input tier, framework-local node types, and framework-native filtering and drag/drop.
- `COMPONENT_INVENTORY.md` records the outcome for the cross-cutting rows.

**Amended by ADR-077 (2026-11-21):** Option N no longer holds for `passthrough`. `pt` and `ptOptions` are built once in `ng-core`, `react-core` and `vue-core`, because every family carries the missing `pt` and `ptOptions` rows (Realignment Phase 4, D-PT), so the premise of "no duplicate-pattern pressure" is gone. GAP-021 and ADR-018, ADR-024 and ADR-032 are no longer unchanged for passthrough. The decisions on `config`, the shared `api` surface, icons and i18n stand. The `COMPONENT_INVENTORY.md` row for `passthrough` is stale until that file is retired by the gap-closing spec's final cleanup.

## ADR-057 — Performance benchmarks: Stage 1 protocol and P1–P8 measurement methods

Status: Accepted (user decision, 2026-10-11, S-4 Architecture Discussion).

**Context.** Blueprint §31 requires established benchmarks. The user ruled all of P1–P8 in scope with two stages: Stage 1 records baselines; Stage 2 adds gates only where measured evidence supports them.

**Decision.**

- The common protocol and the P1–P8 methods in the evidence record are adopted: recorded identity and environment, production builds, warm-up and repeated runs, median/p95/interquartile range and variance statistics, same-commit run-to-run differences, and deterministic proxy metrics first. The suggested warm-up, run and iteration counts are starting values for the variance study, not requirements.
- The playground applications are the benchmark harness, within the authorized scope of the work.
- **Environment of record:** the pinned Playwright CI environment, with runner architecture and type recorded. Local Docker runs may supplement, never replace, CI evidence.
- **No timing threshold is approved.** A Stage 2 threshold needs measured same-commit noise and a separate decision per category. The existing 15% bundle-size gate (P1) is unchanged.

**Consequences.** Next is a Spec for the measurement harness and baseline recording. P8 for React and Vue depends on GAP-088.

## ADR-058 — CLI quality and documented-API evidence bars for the first pre-1.0 publish

Status: Accepted (user decision, 2026-10-11, completion-assessment Architecture Discussion).

**Context.** The user ruled that every Blueprint §40 criterion, including CLI quality and documented APIs, applies to the first pre-1.0 publish, but no source gave a measurable bar. Code inspection found that `@ultimate/cli` and `@ultimate/mcp` read the compatibility manifest from the monorepo root, which an installed package does not contain (GAP-131).

**Decision.**

- **CLI bar CLI-1 to CLI-6:** unit tests per command and documented error exit; installed-package smoke tests for the CLI per framework fixture; an installed-package smoke test for MCP; every Blueprint §19 duty implemented or an approved exception; smoke tests with pnpm and npm at minimum; `--help` and README list every command, its arguments and exit codes. Installed-package CLI and MCP smoke tests are **required evidence**; the current pack/install check is insufficient because it never runs the published binaries.
- **Approved first pre-1.0 publish exceptions:** the deferred `create` command and the `ai` stub. Neither is represented as implemented. They were entered in the exception register (gate G14) as EX-1 and EX-2.
- **GAP-131 is not covered by any exception:** it must be resolved before the CLI or MCP packages are published to consumers.
- **Documented-API bar DOC-1 to DOC-5:** populated `api`, `accessibility` and `guidance` metadata for every in-scope shipped component and framework; an automated metadata-versus-API drift check; a generated API reference; story coverage of documented states; README validation.
- **Generated API reference destination:** Storybook docs pages initially (consistent with ADR-044), kept composable with authored guidance.

**Consequences.** CLI packaging and smoke-test work, and the metadata drift check and generated reference, each go through their own Spec and Plan gates; the documentation work is sequenced with the metadata coverage work.

## ADR-059 — Node 24.15.0 baseline for the private workspace and release toolchain (GAP-087)

Status: Accepted (user-authorized GAP-087 research, verification and Node.js support-policy decision gates, 2026-10-14).

**Context.** Remote `main` at `9ea303df` runs CI on Node `24.15.0` but all three Release jobs on Node 20. [Release run 38531782252](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38531782252) failed at Select mode → Install dependencies: strict pnpm engine checking rejected Node `v20.20.2` for locked `@angular-devkit/architect@0.2201.7`, which requires `^22.22.3 || ^24.15.0 || >=26.0.0`. The private root's `engines.node: ">=20.0.0"` also admits versions that the workspace cannot install. CI's frozen install has passed on the pinned 24.15.0 baseline. Earlier release specifications and ADRs do not establish a binding Node support range.

**Decision.**

- The **private workspace toolchain** supports Node 24 from `24.15.0` through the remainder of major 24. Express this as root `engines.node: "^24.15.0"`, retaining `engine-strict=true` and the existing `pnpm@9.6.0` package-manager pin.
- Use Node `24.15.0` as the pinned execution baseline for local development guidance, CI, and **each** Release job. The existing CI pin establishes the verified baseline; a later patch release within the declared range is permitted but is not claimed as individually verified by this decision.
- This decision is about installing and operating the complete repository workspace. It makes no claim about a published package's consumer Node runtime range and does not change any package-specific consumer contract.

**Trade-off.** The locked Angular devkit also permits sufficiently recent Node 22 and Node 26+, but this repository currently verifies the complete workspace on 24.15.0 only. A single supported major avoids advertising untested major versions. Merely raising Release's Node pin would leave the private root's `>=20.0.0` declaration inconsistent with strict installation.

**Consequences.** GAP-087 stays open until a separately authorized Specification, Spec Review, Plan, Plan Review, implementation and verification align the root engine declaration and all Release jobs, then verify the frozen install and reached release path. C01 stays incomplete. No CI exception is created. Version and Publish remain unexercised in the cited failed Release run.

## ADR-060 — React and Vue R7 line coverage measures production runtime source (GAP-091)

Status: Accepted (user decision X1, 2026-10-17, Workstream 2 Spec Review). **This entry records the decision now.** It does not claim that an ADR-060 text, a GAP-091 Specification or a GAP-091 Plan was approved earlier: none was committed, and no ADR-060 body survives. Evidence:

- the implementation in [PR #16](https://github.com/majedsiefalnasr/ultimate-packages/pull/16), commit `65c2345c`, merged at `bdc4dbcf`;
- GAP-091;
- a dated copy of a draft GAP-091 Specification (`2026-10-14-gap-091-react-vue-coverage-scope-design.md`). It was read on 2026-10-15 from a since-deleted uncommitted worktree and survives only in a local session log. Its own status reads "human approval is pending". It is cited as point-in-time evidence only, not as an approved Specification.

**Context.** The React and Vue coverage regression check failed on every push (for example at `3d0203d`: React `89.69% → 77.7%`, Vue `92.13% → 80.7%`). Neither package's Vitest configuration scoped coverage, so Storybook stories and other non-runtime files counted at 0% against baselines measured before the stories existed. GAP-091 records that this is a measurement-scope effect, not a source regression. A second defect: the shared baseline-only detector treated a diff touching `PERFORMANCE.md` plus a package's `vitest.config.ts` as baseline-only. So a coverage-configuration change could rewrite its own baseline in the same diff. PR #16 changed the scope and closed that path.

**Decision.** For the R7 line-coverage gate of `@ultimate/react` and `@ultimate/vue`:

- **Scope:**
  - Coverage measures runtime modules under the package's `src/**` with the extensions `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts` and `.vue`.
  - Untested runtime modules stay in the denominator (`all: true`).
- **Exclusions, and only these:**
  - `src/**/*.stories.*`, `src/**/*.spec.*`, `src/**/*.test.*`;
  - `src/**/*.d.ts`, `src/**/*.d.mts`, `src/**/*.d.cts`;
  - files under directories named `__tests__`, `__fixtures__`, `__mocks__`, `fixtures`, `test-fixtures` or `mocks`.

  Files outside `src/**` are outside the denominator. Any further exclusion needs its own reviewed decision.

- **Measurement only:** test discovery and execution, the `test`/`test:coverage` scripts and CI's coverage steps are unchanged. Excluding stories and tests from the denominator does not skip them.
- **Gate unchanged:** the metric is `total.lines.pct`. A drop greater than 2 points fails. The comparison is with the merge-base's committed `PERFORMANCE.md` value, and the integrity check's 0.05 tolerance applies. The other 15 packages' scope, baselines and classification are unchanged.
- **Baseline-only classification:**
  - For React and Vue, a diff takes the baseline-integrity path only when the complete merge-base-to-HEAD diff is exactly `docs/architecture/PERFORMANCE.md`.
  - Any other diff takes the regression path against the merge-base value, including a change to `vitest.config.ts`, to package source or manifest, or to a second file.
  - A Git error fails the validator rather than defaulting to baseline-only.
  - The bundle-size (R6) path is unchanged.
- **Re-baselining:** new React and Vue baselines under this scope are recorded only in a separate, reviewed PR whose entire diff is `docs/architecture/PERFORMANCE.md`. Its values must come from a fresh measurement and pass the integrity check. A baseline written in the same PR as a scope change cannot make that PR pass.

**Trade-off.** Excluding stories and tests means the R7 number no longer reflects story code, which does not ship. In return the gate measures the code that does ship and stops falling as stories are added. The strict baseline-only rule makes React/Vue baseline updates a separate PR. In exchange, a coverage-configuration change cannot approve its own baseline.

**Consequences.**

- The decision is already implemented on `main` by `65c2345c`. Recording it authorizes no further code change.
- The React and Vue baselines in `PERFORMANCE.md` (`89.69`, `92.13`) are not yet re-measured under this scope. Their re-baseline PR follows its own Plan and review (Workstream 2, W2-B2-R2).
- GAP-091 stays OPEN until that re-baseline and a closeout are complete. C01 stays incomplete.
- No CI exception is created, and the threshold does not change.

**Amended by ADR-066 (2026-10-18):**

- The baseline-integrity path applies only to baseline rows that a baseline-only diff changes. The strict React/Vue rule above stays: a diff must be exactly `PERFORMANCE.md` to be baseline-only.
- For all 17 packages, a `vitest.config.ts` change is now package-affecting for R7. This amends "the other 15 packages' … classification are unchanged".
- Proposed, pending the user's confirmation: R6 bundle size becomes subject to the same changed-rows rule. This would amend "The bundle-size (R6) path is unchanged".

## ADR-061 — Provenance PR diff enforcement follows source incorporation

Status: Accepted (user PR #16 Architecture Discussion decision, 2026-10-14). Evidence: the approved Phase 0 Specification's Git/GitHub and CI requirements; `scripts/provenance/validate-provenance.mjs`; [PR #16 CI run 38615301042](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38615301042) at head `65c2345c`; [main baseline run 38555038184](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38555038184) at `94fac002`.

**Context.** Phase 0 requires a `PROVENANCE.md` update for a PR that incorporates Prime-derived source under the watched package paths. The current validator triggers its same-diff requirement for any path beginning `packages/uix`, `packages/ng`, `packages/react`, or `packages/vue`. This path-only rule is not undocumented implementation drift: the approved Phase 0 Implementation Plan's validator task specified it without the Specification's source-incorporation qualifier, and the validator's diff check implements that Plan task as written. The conflict is between that Plan task and the Phase 0 Specification's source-incorporation requirement. PR #16 changes React/Vue coverage configuration, incorporates no Prime-derived source, and therefore fails this broader path-only check without a corresponding source-lineage change. The baseline run reaches a separate missing `ng.json` manifest entry; correcting the diff check does not establish repository-wide provenance completeness.

**Decision.** Correct the PR-diff enforcement to reflect the Phase 0 source-incorporation requirement in separately scoped provenance-validator work. Keep the positive requirement for an incorporating-source PR, preserve truthful provenance records and fail-closed Git-diff handling, and retain the independent heading and manifest-completeness checks. Do not add a `PROVENANCE.md` edit merely to make a configuration-only PR pass. Keep GAP-091 PR #16's approved four-file scope unchanged. This decision supersedes the Phase 0 Plan validator task's path-only same-diff rule; the Phase 0 Specification's source-incorporation requirement governs.

**Trade-off.** A path-only rule is simple but over-requires lineage updates for package configuration changes. Source-aware enforcement needs an explicit, tested boundary so it does not miss newly incorporated Prime-derived source. The subsequent provenance Specification must define that boundary and positive and negative cases before implementation.

**Consequences.** This decision does not authorize a validator edit, a GAP-091 scope amendment, a CI exception, or a PR merge. The separate provenance work follows its own Specification, review, Plan, review, implementation and verification gates. C04's existing GAP-094 manifest-scope problem and GAP-093 vendor-archive failures remain independently open; GAP-091 and C01 retain their current status.

## ADR-062 — Provenance manifest scope is production (distributed) source (DR-5)

Status: Accepted (user decision DR-5 Option B, 2026-10-15). Evidence: GAP-094; the approved Phase 0 Specification's "every Prime-derived source area incorporated" requirement; the Phase 1/2 Specifications' and Phase 3/4 Plans' "every `.ts`/`.tsx`/`.vue` file under `src/`" validator rule.

**Context.** The approved documents contain two scopes for the file-level provenance manifests: one entry per _incorporated_ source file (Phase 0, Phase 1 manifest bullet), and an entry for _every_ `.ts`/`.tsx`/`.vue` file under each watched package's `src/` (the Phase 1–4 validator rule, which `validate-provenance.mjs` implements). At `main` `ccb97d68`, 1163 of 1915 watched files have no entry. Of those, 467 are test and story files and 696 are files that reach the published packages.

**Decision.** The file-level manifests cover **production source**: every watched `src/` file that the package's own build distributes, either in its JavaScript output or in its declaration output. A file is excluded only when repository build evidence shows it is in neither, not because of its name or extension alone. Classification fails closed: when the build cannot be modelled, either every file of that package is treated as production or the validator reports a failure. This supersedes the Phase 1–4 "every file under `src/`" validator rule; the Phase 0 provenance purpose governs. Existing entries for excluded files stay valid and are not required. Every new or backfilled entry carries a truthful classification backed by per-file evidence.

**Trade-off.** Tests and stories, which do not ship, lose their mandatory lineage record. In return the rule follows the licensing purpose and the backfill focuses on distributed code. Determining production status from build configuration needs an explicit, tested classifier that fails closed. A filename pattern alone would be simpler, but it is not evidence.

**Consequences.** The GAP-094 Specification defines the classifier, a report-all validator mode, the per-file evidence method and backfill batching. Each step goes through its own review gates. `provenance:validate` stays red until the last backfill batch merges. No CI exception is granted. ADR-052 X-12 rule (2), changed-file completeness, now applies to the production files a tranche changes. Its rule (1), which expects the repository-wide validator to stay red, lapses once GAP-094 is resolved.

## ADR-063 — Ultimate-scoped `border-box` base layer, registered per component through each framework core (GAP-098)

Status: Accepted (user decision GAP-098 Option B, 2026-10-15). Evidence: GAP-097 and GAP-098; `@primeuix/styles` 2.0.3 `base` (`*, ::before, ::after { box-sizing: border-box }`); PrimeReact 10.9.9 `components/lib/componentbase/ComponentBase.js` (`.p-component, .p-component * { box-sizing: border-box }` in `@layer primereact`); the user ruling of 2026-10-08 that excludes Prime's page-wide `*` rule.

**Context.** Upstream component CSS assumes `border-box`. Ultimate ports that CSS, but nothing registers a box-model base, so components render under the browser default `content-box`. In the G3-D Drawer case, a full Drawer renders 722 px tall in a 720 px viewport, and the Angular and Vue G3-D CI steps are red.

**Decision.** Apply `box-sizing: border-box` to Ultimate component DOM through a rule builder in `@ultimate/uix-styled`.

- Each framework core registers one rule per component from its existing style-registration point, using the `has()`/`add()` pattern of the shared hidden-accessible and icon-spin rules. It therefore follows the GAP-074/GAP-078 per-document and SSR contracts.
- The rule is scoped to the component's own root classes, taken from its style module: its root, and any overlay, panel or mask parts that a framework reparents. It covers their subtrees, as PrimeReact's `.p-component, .p-component *` does.
- It has zero specificity and never targets the whole page.
- Drawer-only workarounds are not used.

The approved option's research named a list of component root classes generated from component metadata as an allowed form; this is that form.

**Trade-off.**

- Many components change size at once, so the visual baselines need a reviewed regeneration.
- Application content projected inside a component's subtree also gets `border-box`, as it does under Prime. This includes wrapper components such as Fluid, Card, Panel and Dialog.
- Elements outside Ultimate components are unaffected.
- The rule is unlayered, as all Ultimate CSS is. A host rule inside an `@layer` cannot override it; an unlayered host rule or `!important` can.

**Consequences.** The GAP-098 Specification fixes the selector, the registration points (Angular, Vue and React), the verification set and the baseline-review process. Changed baselines need the owner's visual acceptance before merge.

## ADR-064 — Provenance source class (COPY, REFERENCE, ORIGINAL) is evidence-based; `modificationStatus` is a descriptive sub-label

Status: Accepted (user decision, Option B, 2026-10-16). Evidence: GAP-094; [ADR-062](#adr-062--provenance-manifest-scope-is-production-distributed-source-dr-5); Blueprint §2.3 and §8.

**Context.**

- **No contract is enforced.** The file-level manifests' `modificationStatus` has no machine-readable contract:
  - `validate-provenance.mjs` reads only `ultimateDestination`;
  - there is no manifest schema;
  - nothing else consumes the value.
- **Two historical vocabularies conflict:**
  - the Phase 1 Specification enumerates `unmodified` | `import-path-adapted` | `modified`;
  - the Phase 2 Specification enumerates `unmodified` | `import-path-adapted` | `refactored` | `reimplemented-with-reference`.

  `modified` and `refactored` were never used.

- **Most values in use were never defined.** At `main` `f811c457`, 793 entries use 11 values. Eight of them have no definition in any Specification: `adapted`, `authored`, `reference-derived`, `rebranded`, `reconstructed`, `transcribed`, `ultimate-authored` and `re-export`. Use is inconsistent: the same transformation carries different labels, some labels are assigned by file role, and some `originalPath` values contradict the label.
- **The Blueprint needs a traceability answer.** §8 requires every copied or materially derived source area to be traceable and its notices preserved. That is a question about the content of each file.

**Decision.**

1. **Source class.** Every new or backfilled manifest entry has exactly one source class. The class is decided only by a side-by-side comparison of the file with its counterpart in the checksum-verified pinned upstream archive (`pnpm run vendor:fetch`):
   - **COPY** — the file retains upstream expression: wording (including doc comments), statements, declaration blocks or selectors, or structure (the same members and control flow). This holds whether the expression is verbatim or has been renamed, subset, import-rewritten, extended or re-serialized by a generator.
   - **REFERENCE** — a named upstream counterpart was compared, and the comparison shows only interface facts in common: public names, standard APIs, event names, parameter shapes and equivalent behavior.
   - **ORIGINAL** — no upstream counterpart exists in any pinned archive. This is checked by name and by a same-named upstream file or directory, and the paths searched are recorded. A file derived only from other Ultimate files is ORIGINAL.
2. **Ambiguity resolves to COPY.** When the evidence leaves genuine uncertainty about whether upstream wording, statements or structure are retained, the class is COPY. The evidence cites the compared upstream file and states the uncertainty. Standard APIs, public names or equivalent behavior alone never establish copying.
3. **Where the class lives.**
   - **Evidence record.** The class and its evidence live in the batch evidence record, which has a class column and the comparison per file.
   - **Manifest.** The manifest schema is unchanged. `modificationStatus` is a descriptive sub-label constrained by the matrix below. `modificationDescription` cites the evidence record.
   - **This ADR** is the authoritative contract. `PROVENANCE.md` carries the reader-facing summary.
4. **Compatibility matrix for new entries.** Derived from the 11 values found in the repository.

   | Source class | Allowed `modificationStatus` (new entries) | Meaning of the sub-label                                                                               | `originalPath`                                                        |
   | ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
   | COPY         | `unmodified`                               | Content identical to the upstream file.                                                                | The upstream file, in the manifest's established path form            |
   | COPY         | `import-path-adapted`                      | Identical except for import specifiers rewritten to `@ultimate/*`.                                     | The upstream file                                                     |
   | COPY         | `adapted`                                  | Any other COPY: renames, subsetting, additions, re-serialization. The description states what changed. | The upstream file (two entries when two upstream files contribute)    |
   | REFERENCE    | `reimplemented-with-reference`             | Rewritten with the upstream file as reference, with no retained expression.                            | The compared upstream file                                            |
   | ORIGINAL     | `authored`                                 | Ultimate-authored; no upstream counterpart.                                                            | Exactly `"n/a"`; any Ultimate source file is named in the description |

   **Legacy-only values.** `reference-derived`, `rebranded`, `reconstructed`, `transcribed`, `ultimate-authored` and `re-export` stay valid on existing entries. They are not used for new entries and are not approved by this ADR merely because they are present.

   **Never used.** `modified` and `refactored` (historical enumerations only) are not permitted.

   No class is assigned retroactively to an existing entry.

5. **No enforcement change.** There is no validator or schema change in this decision. A class or enum check needs its own decision.
6. **Existing entries are not edited, migrated or reclassified**, including GAP-094 backfill batch 1. Their inconsistencies are recorded as GAP-132 for separate authorization.

This decision supersedes the Phase 1 and Phase 2 Specification vocabularies for new entries; those Specifications carry a note pointing here. It also overrides, for any new entry, the G3 Specifications' fixed `reference-derived` ("Ported (Option B — reference, not verbatim copy)") wording: a future ported style module is COPY with sub-label `adapted`. It amends the GAP-094 Specification §3.4 (Amendment A1).

**Trade-off.** The class is decidable from evidence and matches the Blueprint's traceability purpose without migrating 793 merged entries. The cost is that existing entries remain inconsistent until GAP-132 is separately authorized. Over-attribution under the ambiguity rule is accepted, because every package that carries upstream code already ships the upstream MIT notice.

**Consequences.**

- Each GAP-094 backfill batch records a class per file and uses only the matrix's values.
- Reviewers check the class against the comparison, not against file role or name.
- A future enforcement step can read the class from the evidence records or adopt a schema field through its own decision.

### Clarification (2026-10-16): theme comparisons are screening evidence

Status: Accepted (user decision, Option 2 of the React theme-match impact assessment at `main` `12049bd0`, and the follow-up ruling on combinations, 2026-10-16). This clarifies Decisions 1 and 2 for **new** provenance entries only. It does not change ADR-065, its two stylesheet exceptions or the Phase 3 Specification, and no existing entry is reclassified or migrated.

1. **Screening, not attribution.** Comparing a file with sources outside the admissible boundary is a screening step. For PrimeReact that means its theme CSS (`public/themes/*`) and any other path outside `components/lib/` (ADR-065). Its result is recorded in the evidence table. A theme match does not by itself make the theme a source, and does not by itself create an entry.
2. **Generic and palette values alone are not evidence.** An individual value of the following kinds does not establish retained theme expression:
   - generic CSS values, such as layout keywords, `0`, `100%`, `50%`, and common spacing, size and radius steps;
   - values shared by many pinned themes across several families;
   - published third-party palette and scale constants: the Tailwind, Bootstrap and Material colour palettes, white, black, transparent and plain `rgba` overlays.

   Its overlap with a theme is not genuine uncertainty about out-of-boundary attribution.

3. **Hold only on distinctive evidence.** A file is held for a possible ADR-065 source-boundary decision under Blueprint §37 only on specific, distinctive evidence that is absent from every admissible in-boundary source. Two kinds of evidence qualify:
   - **An isolated distinctive value:** a single retained theme-only value that is not of a kind listed in §2 and appears in no admissible pinned source. It is held, with the value and the themes that carry it recorded.
   - **A distinctive combination:** at least three retained theme-only declarations, on corresponding selectors, that occur together only within one theme family. A theme family is the pinned themes that differ only by accent colour, for example `lara-light-*` or `saga-*`. This holds even when each value alone is of a kind listed in §2, because the combination, not the individual value, is the evidence.

   Any other isolated or scattered match of §2 values never holds a file.

4. **The ambiguity rule is unchanged in scope.** Decision 2 concerns genuine uncertainty about retained upstream wording, statements or structure. It does not turn generic or palette overlap with a theme into evidence of copying. A file whose screening finds neither kind of §3 evidence is classified from its admissible sources alone.

Recorded application: the two React style modules held in GAP-094 batch 3 are re-assessed under this clarification in the retired evidence record.

## ADR-065 — Limited exception: two pre-existing React stylesheets retain PrimeReact theme CSS values outside `components/lib`

Status: Accepted (user decision, Option 2 of the GAP-132 deviation report under Blueprint §37, 2026-10-16). Evidence: GAP-132; PR #28 (merge `d21933be`).

**Context.**

- **The boundary.** The approved Phase 3 Specification §1 and the PrimeReact entry in `PROVENANCE.md` limit the PrimeReact library source path to `components/lib/`.
- **The two files.** Both were added in Phase C Batch 1 on 2026-09-20 and are unchanged since:
  - `packages/react/src/chip/chip-style.ts` (`c42f709d`);
  - `packages/react/src/tag/tag-style.ts` (`be9f35e4`).
- **What they retain.** The GAP-132 correction found, by direct comparison with the pinned PrimeReact 10.9.9 archive, that both files retain declaration values from PrimeReact theme CSS outside that path:
  - Chip, from `public/themes/saga-blue/theme.css`, identical in the other saga themes;
  - Tag, from `public/themes/tailwind-light/theme.css`. Its matched values are also stock Tailwind constants; the uncertainty is stated and resolved to COPY under ADR-064.
- **How the theme ships.** PrimeReact's build copies `public/themes/**` into its published package as `resources/themes`, under the same MIT license and pinned commit.
- **Why the entries stay.** ADR-064 and Blueprint §8 require the retained lineage to be recorded, so removing the entries would make the records false.
- **How the values got there.** The repository cannot show how the values entered these files. The Batch 1 Plan required consulting only the cited `components/lib` paths, and `extract-primereact-source.mjs` extracts only from `components/lib`.

**Decision.**

- **Exception.** The two files above are an explicitly limited, recorded exception to the `components/lib/` source boundary. They are a pre-existing Phase C Batch 1 departure from it.
- **What stays.** Their provenance entries remain unchanged, including the theme-source entries added in PR #28, and so does the PrimeReact theme disclosure in `packages/react/THIRD-PARTY-NOTICES.md`.
- **What is not authorized.** The general PrimeReact source boundary stays `components/lib/`. This decision does not authorize PrimeReact theme CSS, or any other path outside `components/lib/`, as a source for any other file or any future work, including later GAP-094 batches.
- **Stylesheets.** They are not rewritten, and their visual baselines are unchanged.

**Trade-off.**

- _Gained:_ the approved boundary is kept and the provenance records stay truthful, with no source or baseline change.
- _Cost:_ a standing two-file exception remains. A later, separately authorized source change could rewrite the two stylesheets from admissible sources and retire it.

**Consequences.**

- Any other retained value from outside `components/lib/` that is found later is a new deviation needing its own decision under Blueprint §37. This ADR does not cover it.
- The Phase 3 Specification is not amended.
- GAP-132 records this disposition, and `PROVENANCE.md`'s GAP-132 disclosure cites this ADR.

## ADR-066 — `PERFORMANCE.md` integrity checks compare only baseline rows the diff changes

Status:

- **R7 coverage:** Accepted (user ruling, Workstream 2 finding F1, Option 2, 2026-10-18).
- **R6 bundle size:** Proposed, pending the user's confirmation. The extension is a controller ruling under the same principle, and the implementing PR merges only after it is confirmed.

Evidence:

- Workstream 2 Spec W2-B2-R2a;
- `scripts/provenance/validate-coverage.mjs`, `scripts/provenance/validate-bundle-size.mjs` and `scripts/provenance/baseline-lib.mjs` at `main` `f5a0f138`;
- [main CI run 38966084260](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38966084260): at least 13 of 17 coverage rows differ from fresh values by more than 0.05 (log values rounded to 0.1); bundle size `ng` is recorded at 202.86 KB but measures 65.8 KB.

**Context.**

- The coverage (R7) and bundle-size (R6) validators treat a diff that touches `docs/architecture/PERFORMANCE.md`, and not a package's `src/` or `package.json`, as baseline-only for that package (ADR-060 makes React/Vue stricter).
- Every package on the baseline-only path gets an integrity check: the written value must match a fresh measurement. That includes packages whose row the diff never changed.
- Many recorded rows are stale. So any `PERFORMANCE.md` change fails CI unless every unrelated baseline is refreshed. That covers the React/Vue coverage re-baseline (GAP-091) and the Stage 1 performance sections (ADR-057).

**Decision.**

- **When integrity applies.** For each package and each check (R7 coverage, R6 bundle size), the integrity check applies only when both hold:
  - (a) the diff is baseline-only for that package under the existing rules, including ADR-060's React/Vue rule;
  - (b) that package's value in `PERFORMANCE.md` differs between the merge-base and HEAD, compared as parsed numbers, including a row added.
- **Every other case** takes the normal regression path against the merge-base value.
- **`vitest.config.ts` (user ruling).** For every package, a change to its `vitest.config.ts` is package-affecting for R7. It therefore always takes the regression path, which inverts today's classification for the 15 non-React/Vue packages.
- **Fail closed.** These fail rather than pass:
  - `PERFORMANCE.md` unreadable at either ref;
  - an empty or missing merge-base baseline table;
  - a baseline row removed at HEAD.
- **Parser bounds.** Each parser reads only its own baseline table, up to the next heading.
- **Unchanged rules:** tolerances (0.05 coverage, 0.005 KB size), thresholds (2 points, 15%), merge-base lookup and ADR-060's strict React/Vue rule.

**Trade-off.**

- _Lost:_ a `PERFORMANCE.md` edit no longer forces re-verification of rows it does not touch. Those rows get the same regression check as any other PR.
- _Gained:_ a reviewed baseline change can land without rewriting, or quietly lowering, unrelated baselines.

**Consequences.**

- One separate validator PR implements this, with real-Git fixture tests (Workstream 2 B2-A2a).
- It inverts the existing test "other package R7 keeps its existing per-package diff classification", because of the `vitest.config.ts` ruling.
- The React/Vue re-baseline PR follows it. It changes only those two coverage rows, plus one sentence describing them.
- No baseline is normalised, and no CI exception is created.

## ADR-067 — React components consume Aura preset tokens (amends ADR-051's React carve-out)

Status: Accepted (user approval of the Workstream 1 Specification, decision D1, 2026-10-18). Its React classification was verified against the built Aura preset during Spec Review.

**Context.**

- GAP-064 excluded React from Aura token consumption "unless that exception is revisited". ADR-051 recorded React as unaffected.
- React registers theme variables through `registerThemeVariables(componentName)`, which calls `Theme.getComponent(componentName)` with no key normalization. Most React style modules therefore receive no Aura values. Some are layout-only, some hard-code colours, some read variable names Aura does not define, and some register under keys the preset lacks.

**Decision.**

- **(a) Scope.** React consumes Aura tokens, through `dt()` rendered by `renderCss`, for every module whose component has a module in Ultimate's Aura preset (`packages/themes/src/presets/aura`).
- **(b) Keys.** React registers under the preset key, as ADR-051 requires for Angular and Vue.
  - `react-core` gains ADR-051's additional-preset-keys support. Additional keys register variables only, never structural CSS or box-model roots.
  - A module whose primary key would collide with another component's structural sheet keeps its own key and uses an additional key instead. For example, `input-mask` keeps its key and adds `inputtext`.
- **(c) Exceptions.** These modules have no module in Ultimate's Aura preset, so they keep their current CSS: `mention`, `multi-state-checkbox`, `tri-state-checkbox`, `data-scroller`, `button-group`, `scroll-top`, `scroller` and `table`. For `scroller` and `table`, the upstream `virtualscroller` and `datatable` modules stay out of scope under the earlier GAP-064 decision.
- **Source.** Ported visual CSS comes from the pinned `@primeuix/styles@2.0.3` (see `PROVENANCE.md`). No PrimeReact theme CSS is used (ADR-065).

**Rejected.**

- Normalizing names inside `registerThemeVariables`. ADR-051's reasons still hold.
- Leaving React on static CSS. That would leave most React components unthemed under Aura, failing the first-publish parity goal.

**Consequences.**

- The Workstream 1 waves implement this. Changed visual baselines need the user's acceptance for each wave.

**Amended by ADR-078 (2026-11-21):** the rejection of "Normalizing names inside `registerThemeVariables`" no longer holds. Decision (b)'s "registers under the preset key" is met for the lookup by normalization, and the registration name of a React component stays kebab-case. Additional preset keys stay a family-ticket concern. Original text stays as history.

## ADR-068 — Gitflow branching model and a required fast `ci` check

Status: Accepted (user decisions GF-1 to GF-11 and CI-1 to CI-5, 2026-10-19).

**Context.** Every PR targeted `main`, which also triggers releases. The single CI job was red from two known debts, so no check could block merges, and `main` had no branch protection.

**Decision.**

- `main` is the release branch; `develop` is the integration branch. Work branches from `develop` and merges into it. `release/*` branches from `develop` and `hotfix/*` from `main`; both merge into `main` and back into `develop`. After every merge into `main`, `main` is merged back into `develop`.
- Changesets versioning stays on `main` (`release.yml` unchanged); `baseBranch` is `develop`.
- CI runs for pushes and PRs on both branches. Diff-based checks measure against the PR's target branch.
- The `ci` job holds the fast checks that were reliably green. Known-red and slow baseline checks run in the non-required `ci-extended` job. The Playwright jobs run in the non-required `Browser` workflow. Nothing stops running.
- Merge commits only.
- Protection on both branches: PR required, 0 approvals, no force-push, no deletion, applied to administrators too. `ci` becomes a required check on `develop` after it passes on three named runs. It is not required on `main` while the Version Packages PR is created with `GITHUB_TOKEN`.

**Consequences.**

- This extends the Phase 0 Specification's branch requirements.
- MIGRATION §7.4's fail-closed guarantee is not in place until `ci` is required on `main`.
- The `ci` check is the merge signal. The `CI` workflow's overall result can be red because of `ci-extended`. A check outside `ci` can go red without blocking a merge.
- Earlier records that cite `.github/workflows/ci.yml` for the `track-a-browser-visual-a11y` or `track-e-ssr-hydration` jobs now refer to `.github/workflows/browser.yml`. Those records are not rewritten. ADR-052 X-12's "merge commit's run" means the merge commit's `CI` and `Browser` runs together.

## ADR-069 — Change-scoped CI keeps the required `ci` check always reporting

Status: Accepted (user decisions AO-1 to AO-7, 2026-10-19).

**Decision.**

- A single tested classifier decides scope.
- The required `ci` job always runs. It skips only expensive steps, and only for a pull request whose every changed path is docs-only Markdown that no CI script reads.
- Any other path, any push, an empty diff or a classifier error runs everything.
- Non-required Browser jobs run only the changed frameworks on pull requests and all frameworks on pushes.
- `affected-packages` treats any non-package, non-docs change as affecting every package.
- Workflow path filters and job-level conditions on required jobs are not used.

**Consequences.** A docs-only PR's `ci` check proves formatting, lint, supply-chain and the fast validators, not build or tests. Push runs on `develop` and `main` run every step and all browser frameworks, and are the source of ADR-052 X-12 evidence. Pack/install integrity checks no package on a push, because a push's diff against its own branch is empty; this predates ADR-069 and is not changed by it. Package-level scoping (AO-3) is deferred.

## ADR-070 — CI/CD optimization: browser-input scoping, full validation for `main`, run hygiene (amends ADR-069)

Status: Accepted (user decisions CO-1 to CO-13, 2026-10-20). Each implementation stage needs its own approvals.

**Decision.**

- **Browser inputs (CO-1).** On a pull request into `develop`, a path may skip a framework's Browser jobs only in two cases:
  - it is a workspace package in no framework's dependency closure, derived from the package manifests at the PR head, whose contents the Browser jobs remove before building, on every event;
  - it is on a closed `NON_BROWSER_PATHS` list, whose files the Browser jobs delete before installing, on every event.

  A package in any closure runs all three frameworks.

  No path is narrowed because an analysis found no reference to it. Any other path, any failure to derive the closures and any unmodeled dependency edge runs all three frameworks.

- **Docs-only PRs (CO-2).** The non-required `ci-extended` steps and the SSR jobs follow the same classification as ADR-069's gated steps and track-a.
- **PRs into `main` (CO-5)** run everything, whatever they change.
- **Pushes (CO-6).** Pack/install integrity covers every package on a push. This replaces the ADR-069 consequence that it checked none.
- **Run hygiene (CO-3, CO-4, CO-9).** Superseded pull-request runs are cancelled; push runs never are. Every job in `ci.yml` and `browser.yml` has a timeout. Each Playwright invocation keeps its own HTML report.
- **Storybook servers (CO-7).** Each track-a job starts only its own framework's Storybook server, and none of the SSR harness servers, which no track-a test uses.
- **Names (CO-10).** The required check stays `ci`. Non-required jobs get descriptive display names, and step names cited as evidence are kept.
- **Unchanged.** Push runs stay full, including after docs-only merges (CO-13, AO-6). Hooks are unchanged (CO-12, AO-7). Track-a sharding (CO-8) is reconsidered only after CO-7 has been measured, and only if the critical path is still above about 15 minutes. Parallelizing `ci` (CO-11) stays research-only. ADR-069's other rules still hold: one tested classifier, fail-closed defaults, no workflow path filters, and no job-level conditions on the required job.

**Consequences.**

- A pull request that changes only workspace packages outside the framework closures, `NON_BROWSER_PATHS` files or docs-only Markdown runs no Browser jobs. Push runs on `develop` and `main` still run all of them, so ADR-052 X-12 and ADR-053 AC-1/AC-4/AC-5 CI evidence is unaffected.
- A dependency edge becomes part of a closure without a classifier change. A new path outside `packages/` runs all frameworks until a reviewed classifier change lists it. A Browser job that comes to need a listed file or a no-closure package fails on every run until the rule changes; it can never pass while depending on one.
- ADR-069's constraints are unchanged. It made no decision about tooling packages; they ran all frameworks only by its classifier's default (research §13.1).
- Earlier records that cite the old job names (`ci-extended`, `changes`, `track-a-browser-visual-a11y`, `track-e-ssr-hydration`) refer to the renamed jobs. The job IDs are unchanged, and those records are not rewritten.
- Runtime savings are estimates until the stage closeouts measure them.

## ADR-071 — Shard the Angular and Vue Browser track-a jobs (CO-8)

Status: Accepted (user decision, 2026-10-20). Implemented separately from the completed ADR-070 stages.

**Context.** ADR-070 deferred CO-8 until CO-7 was measured, and made it eligible only if the longest Browser job stayed above about 15 minutes. After CO-7, track-a ng took 24.6 minutes and vue 22.4 on the push run.

**Decision.**

- The ng and vue track-a jobs each split into three parallel shards. Each shard runs whole suites: a tranche's verification specs and its differential accessibility validator always run in the same shard. React stays one job.
- The track-a matrix (framework and shard) comes from the tested change classifier, as ADR-069 requires for every scoping decision. Its framework selection is unchanged.
- No test, validator, baseline, step name, required check or trigger changes.

**Consequences.**

- Each verification step still runs exactly once per framework per run, now in one of three jobs named `Playwright visual + a11y (<framework>, <shard>)`. ADR-052 X-12 evidence reads the same step names across those jobs.
- A full run uses more runner-minutes (estimated +6 to +7) in exchange for a shorter critical path (estimated about 10 minutes). Both are estimates until measured.

## ADR-072 — Provenance validation in the advisory CI job becomes a ratchet over the known-missing list

Status: Accepted (user decision, 2026-10-21). Implemented once authorized.

**Context.** The advisory job "Baselines (advisory): size, coverage, provenance" failed in every full run inspected, so the `CI` workflow is red while the required `ci` check is green (ADR-068). One of the two failing steps, Provenance validation, fails on 645 known missing manifest entries (GAP-094: ng 164, react 216, vue 265). A new missing entry cannot be told apart from the old debt.

**Decision.**

- In the advisory job only, the Provenance validation step compares missing entries with a committed known-missing list. A missing entry not on the list fails. A listed entry that is no longer missing also fails, so the list can only shrink.
- Without the ratchet flag the validator stays strict. No manifest entry is backfilled by this decision.
- GAP-094 stays OPEN until the list is empty and the validator exits 0 without the flag.

**Consequences.**

- The advisory job's Provenance step turns green and starts to catch new debt. The Bundle-size step remains red until its own baseline is updated in a separate PR.
- Backfill batch PRs also edit the list. The GAP-094 Specification's resolved condition is amended accordingly.
- The advisory job stays a non-required check. Making it required is a separate decision.
- Not a change to the production-scope classifier (ADR-062), the diff check, or the `ci` job.

## ADR-073 — Hierarchical work branches: a spec gets an integration branch and each ticket branches from it (amends ADR-068)

Status: Accepted (user decision, 2026-11-21). The rule applies once the CI and protection follow-ups under Consequences are in place.

**Context.** ADR-068 sends every work branch from `develop` into `develop`. A spec with many tickets then lands piecemeal on `develop`, so `develop` carries half-finished features and can no longer be cut into a release at any time. Established projects separate the stable line from unfinished work. Gitflow keeps `develop` integrable and uses `release/*` and `hotfix/*` for the release line. Kubernetes and GitLab flow fix defects upstream first and cherry-pick them to release branches. Trunk-based teams keep branches short and rely on feature flags to hide unfinished work. Stacked pull requests show that a branch cut from a feature branch works, and that maintenance cost grows once a stack passes two or three levels.

**Decision.**

- **Parent rule.** Every work branch is cut from its parent branch and its PR targets that parent. Standalone work has `develop` as its parent.
- **Spec level.** A spec with several tickets gets one integration branch `feat/<spec-slug>` from `develop`. Each ticket branch `type/<ticket-id>-slug` is cut from it and merges into it.
- **Depth.** A ticket that must be split further becomes the integration branch of its sub-tickets. Nothing nests deeper. A larger tree means the spec is split instead.
- **Merging.** Every merge is a merge commit (ADR-068 is unchanged). A child merges its parent before its PR is opened. An integration branch merges `develop` whenever `develop` has moved and before its final PR. Shared branches are not rebased.
- **Reaching `develop`.** An integration branch merges into `develop` in one PR, after all its tickets are merged and the checks are green. Unfinished integration work never reaches `develop`.
- **Release and hotfix.** `release/*` and `hotfix/*` are unchanged. After a hotfix is merged back into `develop`, open integration branches merge `develop`. A release is cut from `develop`, so an integration branch that has not merged is not in it by construction.
- **Not adopted now.** `support/*` maintenance branches and upstream-first cherry-picks onto released lines. Adopt them when Ultimate has to patch an already released version while `develop` moves on.

**Consequences.**

- ADR-068's "Work branches from `develop` and merges into it" now applies at the spec level only.
- Conflicts concentrate in the integration branch, mainly in `PROVENANCE.md` and `docs/architecture/provenance/*.json`, which every ticket touching `packages/{ng,react,vue,uix*}` must update. Merging the parent often keeps each conflict small.
- `ci.yml` and `browser.yml` run on pull requests into any base branch, so a ticket PR into an integration branch gets the same checks as one into `develop`. Pushes still trigger them only on `main` and `develop`, so a push to an integration branch starts no run of its own. The change classifier scopes any base other than `main` like `develop`, and a test pins this (ADR-069, ADR-070).
- `develop` is the only protected work branch today. Requiring `ci` on integration branches is a GitHub setting and is a separate change.
- Deleting an integration or ticket branch after its merge still needs explicit authorization (`AGENTS.md` section 5.1).
- The final integration PR is large. Its full CI run is the gate that ADR-068 gave every PR.

## ADR-074 — Ripple is built in all three frameworks (supersedes ADR-031)

Status: Accepted (user ruling R1, 2026-11-21, gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167)). Supersedes ADR-031. ADR-034 still applies.

**Context.**

- ADR-031 left React without a `URipple` in Phase 3. Its status was later changed to superseded, awaiting the Prime study, and no ADR replaced it. Realignment Phase 4 therefore found no in-force ADR that makes the gap intentional.
- Angular and Vue have a Ripple that activates the ink effect but ships no structural CSS for it. Phase 4 classed this P (partial).
- React has no Ripple. Phase 4 classed the Ripple family M (missing) and the React Button ripple row M. ADR-031 itself recorded that PrimeReact's `Button`, `Dialog` and `Menu` render `Ripple` upstream.
- The gap-closing spec's parity default (Q1) is that Ultimate matches Prime unless an in-force ADR says Ultimate is intentionally different.

**Decision.**

- Build Ripple in all three frameworks.
  - React: a new `URipple`, built as its own standalone primitive with its own scope, provenance and tests. This is the shape ADR-031 described for a future React Ripple and the shape Angular's Phase 2 `URipple` already has.
  - Angular and Vue: add the missing structural ink CSS.
- ADR-034 still governs the Vue form: `v-ripple` stays a custom directive, not a component.
- React components whose Prime counterparts render Ripple (Button, Dialog, Menu and others) use it, wired in their own family tickets.

**Consequences.**

- ADR-031 now reads "Superseded by ADR-074". Its original text stays as history.
- The work is done in the Track B tickets of the Ripple family and of the components that use it. Each ticket follows the gap-closing spec's definition of done: tests in every affected framework, provenance records (ADR-064) and a `PROVENANCE.md` update, and an inventory refresh.
- `packages/vue/src/button/Button.vue` carries a comment that cites ADR-031 as deferring Ripple. The Button ticket updates that comment, because a change under `packages/` also needs the `PROVENANCE.md` update.

## ADR-075 — `UDialog` is built with draggable, maximizable and resizable behavior where Prime has it (supersedes ADR-030 and ADR-040)

Status: Accepted (user ruling R2, 2026-11-21, gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167)). Supersedes ADR-030 and ADR-040.

**Context.**

- ADR-030 (React) and ADR-040 (Vue) excluded draggable, resizable and maximizable behavior from `UDialog`. ADR-040 also records that Angular's `UDialog` had none of them. Their status was later changed to superseded, awaiting the Prime study, and no ADR replaced them.
- PrimeNG's and PrimeReact's Dialog have draggable, maximizable and resizable behavior. PrimeVue's Dialog has draggable and maximizable behavior but no resizable behavior (ADR-040 verified this against the real `Dialog.vue`).
- Two negative tests still assert the old exclusion: `packages/react/src/dialog/dialog.spec.tsx:84` and `packages/vue/src/dialog/dialog.spec.ts:75`.
- The gap-closing spec's parity default (Q1) is that Ultimate matches Prime unless an in-force ADR says Ultimate is intentionally different.

**Decision.**

- Build all three behaviors wherever the pinned Prime oracle has them.
  - Angular: draggable, maximizable and resizable.
  - React: draggable, maximizable and resizable.
  - Vue: draggable and maximizable. PrimeVue has no resizable Dialog, so that row is N (not applicable). Nothing is built and no ADR is needed for it.
- Resize is a separate sub-ticket of the Dialog family ticket. Draggable and maximizable are built in the Dialog family ticket itself.
- The negative tests in React and Vue are removed or inverted by the ticket that implements the behavior they guard. Inverted means the test asserts that the behavior exists.
- ConfirmDialog and DynamicDialog inherit the outcome through `UDialog`. Their own family tickets verify the inherited behavior.

**Consequences.**

- ADR-030 and ADR-040 now read "Superseded by ADR-075". Their original text stays as history.
- `packages/react/README.md` and `packages/vue/README.md` still state the old non-goal. The Dialog ticket updates them, together with the `PROVENANCE.md` update that a change under `packages/` requires.
- Because resize is a sub-ticket, the Dialog ticket becomes the integration branch of its sub-tickets, as ADR-073 allows. Nothing nests deeper.

## ADR-076 — Vue Forms is built by Ultimate as its own spec; `@primevue/forms` is never imported (supersedes ADR-039)

Status: Accepted (user ruling R3, 2026-11-21, gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167)). Supersedes ADR-039. ADR-004 still applies.

**Context.**

- ADR-039 cut the `@primevue/forms` integration from `UCheckbox`. PrimeVue's `BaseEditableHolder.vue` has a live integration with that separate package (`$pcForm`, `$pcFormField`, `formField.onChange` and the `$form*` helpers). ADR-039 deferred the question to "its own future evidence-based evaluation". Its status was later changed to superseded, awaiting the Prime study, and no ADR replaced it.
- ADR-004 forbids a required runtime dependency on PrimeVue, so Ultimate cannot import `@primevue/forms`.
- Phase 4 needs a class for the Vue form-integration rows. Class I (intentional) needs an in-force ADR or a user ruling that says the cut is permanent. The ruling is the opposite: Ultimate builds it.

**Decision.**

- Ultimate builds its own Vue Forms: `Form`, `FormField`, `useForm` and resolvers.
- This is a separate spec, scheduled after the foundations. It is not part of Stages 1 to 4 of the gap-closing spec.
- Until that spec ships, the Vue form-integration rows stay M (missing), not I. No ADR declares the absence intentional.
- `@primevue/forms` is never imported, as a dependency or otherwise (ADR-004). It can serve as an upstream reference. Before any of its source is incorporated, it needs a pinned revision and a provenance record (ADR-005, ADR-064), which is what ADR-039 asked for.

**Consequences.**

- ADR-039 now reads "Superseded by ADR-076". Its original text stays as history.
- `UCheckbox` and the other Vue editable components keep their current contract until the Vue Forms spec adds the integration.
- This ADR concerns Vue only. It makes no decision about forms in Angular or React.

## ADR-077 — `pt` and `ptOptions` are built once in the three cores (amends ADR-056; ADR-018, ADR-024 and ADR-032 lose their passthrough exclusion)

Status: Accepted (user ruling R4, 2026-11-21, gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167)). Amends ADR-056. Amends ADR-018, ADR-024 and ADR-032 only where they exclude passthrough.

**Context.**

- ADR-018 (Angular), ADR-024 (React) and ADR-032 (Vue) excluded Prime's passthrough system from the base architecture. Each said to revisit it only on real duplicate-pattern pressure from a later component.
- ADR-056 confirmed that on 2026-10-11 (Option N). Its reasons were that every upstream use in the remaining components mapped to an established per-component pattern, and that shipped components contained no passthrough usage.
- Phase 4 decision D-PT made `pt` and `ptOptions` separate capability rows. Each is M (missing) wherever the pinned Prime oracle offers it, and N (not applicable) where it does not.
- The pressure evidence is that the rows are M in every family where Prime offers them, and every family carries these rows (`docs/architecture/research/phase4-gap-analysis.md`, section 2, reading notes). The pressure is therefore structural and shared by all families, not local to one component. The "no duplicate-pattern pressure" premise no longer holds.

**Decision.**

- Build `pt` and `ptOptions` once, in `ng-core`, `react-core` and `vue-core`. This is ticket A0 (#170) of the gap-closing spec. Components receive them through their base class or hook. They do not carry per-component passthrough code.
- A family exposes `pt` or `ptOptions` where its pinned oracle does (D-PT). Where the oracle does not, the row is N and nothing is built. The family tickets wire the family-specific part names.
- A0 decides the helper surface and the nested-key resolution design, and records them with provenance (ADR-064). If A0 needs a further architecture decision, such as host-instance lookup (`$parentInstance`), it records that decision as its own ADR. This ADR does not approve it in advance.
- The rest of ADR-056 stands: no new `config` surface, no shared `api` surface, need-driven icons and no new i18n requirement.

**Consequences.**

- ADR-056 and ADR-018, ADR-024 and ADR-032 each carry a note that points here. Their original text stays as history.
- A0 needs this ADR merged first.
- The `ng-core`, `react-core` and `vue-core` READMEs still say passthrough is excluded. A0 updates them, together with the `PROVENANCE.md` update that a change under `packages/` requires.
- The `passthrough` row of `COMPONENT_INVENTORY.md` still reads "not needed". The gap-closing spec retires that file in its final cleanup.

## ADR-078 — `registerThemeVariables` reads the preset under the hyphen-free registration name (amends ADR-051 and ADR-067)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), foundation item F7, ticket [#174](https://github.com/majedsiefalnasr/ultimate-packages/issues/174)). The spec names this approach; the ADR records that it reverses a rejected option.

**Context.**

- Aura preset keys are flat (`inputtext`, `datepicker`, `confirmdialog`). `Theme.getComponent(name)` reads `preset.components[name]` with no normalization.
- React registers kebab-case names (`input-text`, `date-picker`). 44 React names are not Aura keys. 31 of them have a flat Aura key that the lookup never reaches, so their variable blocks are never defined (Phase 4 shared-foundation audit, section 3b; classified P as C4).
- ADR-051 and ADR-067 each rejected "normalizing names inside `registerThemeVariables`". ADR-051's reason was that React registers through the same function and was outside GAP-064. ADR-067 repeated the rejection while deciding that React consumes Aura tokens.
- Angular and Vue were renamed to the upstream keys by ADR-051. Their remaining hyphenated names (`avatar-group`, `button-group`, `input-icon`, `input-group-addon`, `input-mask`, `scroll-top`, `dynamic-dialog`) have no Aura key, flat or hyphenated, so normalization cannot change them. `packages/themes/test/registration-keys.test.ts` proves this against the product source.

**Decision.**

- `registerThemeVariables` and its `theme:change` rewrite look the preset up under the registration name with its hyphens removed (`input-text` reads `inputtext`). The change is one private helper in `packages/uix-styled/src/stylesheet/theme-variables.ts`.
- The block stays registered under the name the caller gave (`input-text-variables`). Only the lookup changes. Angular and Vue sheet keys and output are therefore unchanged.
- A name that is already flat resolves exactly as before.
- A test enumerates the registration names of all three frameworks against the Aura keys. A React name with a flat Aura key that defines no variables fails the test.

**Rejected.**

- Renaming the 31 React components' `componentName` to the flat key, as ADR-051 did for Angular and Vue. It changes 31 components, their style keys and their tests, and leaves the next kebab-case name to fail silently again. Normalizing once fixes the whole class.
- Matching a hyphenated preset key first and falling back to the flat key. No Aura or Prime preset uses a hyphenated component key, so the fallback only adds a second lookup path.

**Consequences.**

- Third-party presets must use flat component keys, as Aura and Prime do. A preset that keyed a component with a hyphen (for example `"test-component"`) is no longer found. The `ng-core` A1 spec used such a key and now uses `testcomponent`.
- React components now inject their Aura variable blocks. Most React style modules still do not read them through `dt()` (F8). The React Aura-token rows stay P until the family tickets add `dt()` consumption; this ADR closes only the key mismatch.
- ADR-051 and ADR-067 each carry a note that points here. Their original text stays as history.

## ADR-085 — Per-instance `unstyled` and `dt` are built once in the three cores (foundation F15; contract and divergences from Prime)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), foundation item F15, ticket [#175](https://github.com/majedsiefalnasr/ultimate-packages/issues/175)). This is the first ADR of ticket A5. Numbering starts at 085 to avoid a collision with ADRs added by ticket A0 (#170) from 079 up.

**Context.**

- Phase 4 decision D-SHARED #5 ruled that per-instance `dt` and `unstyled` are separate capability rows per family. The shared-foundation audit (item F15) recorded Angular as P (the inputs were declared but never read), React as M, Vue as M, and React per-instance `dt` as N because PrimeReact 10.9.9 has no `dt` API.
- The pinned oracles behave as follows (read from the vendor archives, ADR-064). PrimeNG 21.1.9 and PrimeVue 4.5.5 resolve the instance `unstyled` value first and the global config second. `cx()` returns `undefined` when unstyled. Core and theme styles are skipped when unstyled, while base styles still load. A per-instance `dt` becomes a scoped preset (`Theme.getCustomPreset(name, dt, '[pcN]')`) loaded under the key `<attr>-<name>`. It is rewritten on `theme:change` and removed when `dt` is cleared or the component is destroyed. PrimeNG skips scoped styles on the server. PrimeReact resolves `unstyled` as `context || PrimeReact.unstyled || props.unstyled`, loads base and global styles always, and loads common and component styles only when styled.

**Decision.**

- `@ultimate/uix-styled` exports `createScopedTheme(sheet, componentName, attrSelector)`. It returns `{ key, update(dt), dispose() }`, writes the scoped variable block under `<attr>-<name>`, follows `theme:change`, and removes the `<style>` element together with the registry entry.
- **Angular (`ng-core`).** `UBaseComponent` reads the existing `unstyled` and `dt` inputs. `$unstyled` is the input when set, else `UltimateConfig.unstyled`. `cx()` returns `undefined` when unstyled. An unstyled instance registers only the base rules (hidden-accessible, icon spin). Styles are registered once the instance turns styled. `dt` is applied from an effect, outside the server platform, and is disposed with the component.
- **Vue (`vue-core`).** `BaseComponent` declares the `unstyled` and `dt` props (default `undefined`), a computed `isUnstyled`, and a `cx` that returns `undefined` when unstyled. `dt` follows PrimeVue's lifecycle (mounted, watcher, updated, unmounted). Every Vue family inherits both props through the base component.
- **React (`react-core`).** `useComponentBase` takes `unstyled` and returns `{ cx, isUnstyled }`. `useComponentStyle(name, module, unstyled)` registers only the hidden-accessible rule for an unstyled instance. React has no `dt`: PrimeReact has no per-instance `dt` API, so the row is N and nothing is built (D-SHARED #5).
- Each framework has one pilot component (Tag) that proves the contract. Families adopt it in their own tickets.

**Divergences from Prime.**

1. The `pcN` attribute is set only while `dt` is set. Prime sets it on every root.
2. Vue has no global `unstyled` fallback, because Ultimate Vue has no config plugin.
3. React `unstyled` is per-instance only. There is no global or context source yet.
4. Angular has no `directiveUnstyled` signal.
5. Scoped `dt` is not written on the server in Angular, and in Vue it is written from `mounted` only.
6. The `pcN` selector comes from the `uuid("pc")` counter of `@ultimate/uix-utils`, not from `useId`, which restarts in each Vue app.
7. React re-registers styles when `unstyled` turns false. PrimeReact runs its loader on mount only.
8. `$attrSelector` is exposed on Angular only. Vue keeps the selector private. Ticket A0 (#170), which builds `ptm` dataset code, must add it if it needs the selector.

**Contract for families.**

- `cx()` returns `undefined` when unstyled. Templates must never concatenate its result with a string. The Angular Tag pilot shows the fix: `cx('icon') + ' ' + icon()` rendered the word `undefined`, so the class list is now built in a computed that filters it.
- A React family component passes `unstyled` into `useComponentBase` and `useComponentStyle`. Vue and Angular components inherit it from the base class.

**Classification.**

- No row is I (intentionally not built). The only N row, React `dt`, keeps the classification the Phase 4 audit gave it.
- Re-classification after a source re-read is in the A5 ticket report, not in the Phase 4 reports.

**Consequences.**

- The `ng-core`, `react-core`, `vue-core` and `uix-styled` READMEs document the API.
- Other families need no per-component code to honor `unstyled` or `dt` in Angular and Vue. React families wire the `unstyled` prop one component at a time.
- Any later global `unstyled` source for React or Vue needs its own ruling.

## ADR-079 — `pt` functions receive `parent.instance` through host-instance lookup (A0 design decision, amends ADR-077)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), ticket [#170](https://github.com/majedsiefalnasr/ultimate-packages/issues/170) A0). ADR-077 left this open on purpose.

**Context.**

- A `pt` value can be a function. In all three pinned oracles it receives `{ instance, parent: { instance }, ... }`. `parent.instance` is the component that renders this one. A sub-component (a tree node inside a tree, a menu item inside a menu) uses it to style itself from its host's state.
- The oracles find that parent in different ways:
  - **PrimeNG 21.1.9** injects a `PARENT_INSTANCE` token (`inject(PARENT_INSTANCE, { optional: true, skipSelf: true })`). A component provides itself with `{ provide: PARENT_INSTANCE, useExisting: Self }`. An optional `hostName` input narrows the search, but `_getHostInstance` (`basecomponent.ts`) compares `this.$name` with `hostName` instead of the visited instance's name. For any component whose `hostName` differs from its own name the search therefore ends in `undefined`. This is a reference defect.
  - **PrimeVue 4.5.5** injects `$parentInstance`. Each component provides itself. A `hostName` option walks `$parentInstance` up to the instance whose component name equals `hostName`. The fallback is `this.$parent`.
  - **PrimeReact 10.9.9** has no lookup. Each component passes `parent` (the parent's metadata) and `hostName` in the params of its own `ptm(...)` call.
- Without this, a `pt` function in a sub-component family cannot read its host, so those rows stay M in Track B.

**Options.**

- **A (recommended, implemented): lookup per framework as the oracle does it.** Angular gets the `U_PARENT_INSTANCE` token. Vue gets `$parentInstance` and the `hostName` option. React takes `parent` and `hostName` in the `ptm` params. Choosing it means the family tickets for sub-components only wire names. Ultimate Angular drops `hostName` and does not copy the PrimeNG defect.
- **B: no lookup now.** `parent.instance` stays `undefined`. Each sub-component family would add its own lookup later, which is the duplication ADR-077 set out to avoid.

**Decision (as implemented, pending approval).** Option A.

- **Angular (`ng-core`).** `UBaseComponent.$parentInstance` is `inject(U_PARENT_INSTANCE, { optional: true, skipSelf: true })`. A component that renders other `UBaseComponent`s provides `{ provide: U_PARENT_INSTANCE, useExisting: Self }`. `$params.parent.instance` is that nearest provider. There is no `hostName`.
- **Vue (`vue-core`).** The base mixin provides every instance as `$parentInstance` and injects the nearest one. `createBaseComponent({ hostName })` walks up to the instance whose `componentName` equals `hostName`. `parent.instance` is that host, else `$parentInstance`, else `$parent`.
- **React (`react-core`).** `createPassThrough(name, { props, state, parent, hostName })` spreads the metadata into the `ptm` params. The caller supplies `parent`. React has no automatic lookup, same as PrimeReact. `PassThroughMetadata.hostName` only sets `data-pc-name`.

**Consequences.**

- A Vue component whose `ptm` runs under a parent receives the parent's `$props`, `$data` and `$attrs` in the `parent` params, as PrimeVue does.
- A Vue component that provides its own `$parentInstance` through a different mechanism would override the base mixin's provider. None exists today.
- The `hostName` lookup also decides which instance supplies `ptOptions` when a sub-component sets none. That path has no effect until a global `pt` source exists (ADR-080).

## ADR-080 — A0 builds the instance-level `pt` and `ptOptions` only; global `pt`, `usePassThrough`, `pt.hooks` and `$attrSelector` are not built (A0 scope decision, amends ADR-077)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), ticket [#170](https://github.com/majedsiefalnasr/ultimate-packages/issues/170) A0).

**Context.**

- ADR-077 builds `pt` and `ptOptions` once in the cores and keeps the rest of ADR-056: no new `config` surface.
- In the three oracles `ptOptions` (`mergeSections`, `mergeProps`) decides how the **global/default `pt`** from the config (`PrimeNG.pt`, `app.use(PrimeVue, { pt })`, `PrimeReactProvider value.pt`) is merged with the instance `pt`. The merge formula is `{ ...global, ...self, ...datasets }`, or `mergeProps(global, self, datasets)` when `ptOptions.mergeProps` is set. With no global value, the instance `pt` and the `data-pc-*` datasets share no keys that those options change. So **`ptOptions` has no observable effect on a rendered component until a global source exists.**
- The oracles carry three more `pt` features beyond the instance prop:
  - the `_usept` wrapper that `usePassThrough(globalPt, customPt, options)` produces;
  - `pt.hooks.onMounted` and the other lifecycle hooks;
  - the per-instance `$attrSelector` attribute that `ptm('root')` emits next to the datasets. It belongs to scoped `dt` (ticket #175), which owns that selector.

**Options for the global source.**

- **A (recommended): do it as its own Track A ticket after A0.** The resolvers already take the global section value as an input (`context.global`), so a later ticket supplies it from the config without touching any family. That ticket needs the config-surface decision ADR-056 deferred: an Angular `UltimateConfig` field, a React provider and a Vue plugin option. Waiting costs nothing in Track B, because families only call `ptm`.
- **B: build it inside A0.** It adds a config surface in all three frameworks at once and contradicts "no new `config` surface" in ADR-077 without a ruling.

**Decision (as implemented, pending approval).** Option A for the global source. A0 builds, in all three cores:

- the `pt` and `ptOptions` inputs (props), `ptm`, `ptmo`, plus `ptms` (Angular, as PrimeNG) and `ptmi` and `pt:section:attribute` attributes (Vue, as PrimeVue);
- nested keys (`a.b`), flat-case key matching, function values and function `pt`, string/array to class, the `data-pc-name`, `data-pc-section` and `data-pc-extend` datasets, `searchOut` for keys whose first segment is a param, and the `mergeSections` and `mergeProps` branches of the merge formula;
- the host-instance lookup of ADR-079.

It does not build the global/default `pt` source, `usePassThrough`, `pt.hooks`, the `$attrSelector` dataset or the `ptmi` `id` fallback (PrimeVue assigns a generated id there). These stay open rows for the global-source ticket or for a ruling that removes them.

**Oracle behavior ported as it is.** The pinned sources govern. Each of these is a reference defect or an oddity the user may want to rule on separately; none is changed here:

- With `mergeSections: false` the merge formula `mergeSections || (!mergeSections && self)` still merges when the instance has the section. It only drops the global value when the instance has none. PrimeVue's `self` is always an object, so there `mergeSections: false` never drops it.
- PrimeReact turns `{ className: [..], id }` into `{ className }` and loses `id`.
- PrimeNG derives `data-pc-section` from the last segment of a dotted key, PrimeVue from the whole key, PrimeReact from the second segment when the first names a param.
- The `searchOut` test is `/./g.test(key) && !!params[key.split('.')[0]]`, so it is true for any non-empty key whose first segment names a param.

**Consequences.**

- `ptOptions` is accepted, typed and tested against the merge formula (with a stand-in global value), but a component cannot observe it until the global source ticket lands. Phase 4 should keep the `ptOptions` rows P, not C, until then.
- The root `data-pc-name` is the component's `componentName`, flat-cased (`card`, `inputtext`). It equals Prime's value wherever Ultimate's name is Prime's name flat-cased.
- READMEs of `ng-core`, `react-core` and `vue-core` document the API and these limits.

## ADR-082 — Structural styles live in `@ultimate/uix-styles` by default; staying framework-local needs a recorded reason (foundation F9; amends ADR-017)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), foundation item F9, ticket [#178](https://github.com/majedsiefalnasr/ultimate-packages/issues/178)). The user chose Option A on 2026-11-21.

**Context.**

- Prime ships its structural style of every component as one module in `@primeuix/styles`, and PrimeNG, PrimeReact and PrimeVue all consume that one module.
- Ultimate's `@ultimate/uix-styles` holds 12 of Prime's 93 structural style modules (badge, button, checkbox, dialog, inputnumber, inputtext, menu, paginator, table, tooltip, virtualscroller, base). Shared imports are 11 in Angular, 3 in React and 9 in Vue. Most styles are framework-local copies (83 files in Angular, 83 in React, 86 in Vue), so the same CSS is maintained up to three times and can drift (Phase 4 shared-foundation audit, item F9, ruled P in all three frameworks).
- ADR-017 limited `uix-styles` to the `base` module for Phase 1 and said each per-component module would migrate with its owning component. It set no rule for when a family's style moves, and a scope-guard test enforces the Phase 1 list.

**Decision.**

- **Default.** A family's structural style is one module in `@ultimate/uix-styles`, named after the family, with `u-*` selectors, and all three frameworks consume it. A new or reworked family does not add a style copy inside a framework package.
- **Exception.** A family keeps a framework-local style only when the three frameworks cannot share one stylesheet, for example because Ultimate's DOM for that family differs by framework on purpose. The family ticket states the reason, and the family's provenance record repeats it. A missing reason is a review finding.
- **Moves.** The moves happen inside the Track B family tickets, each when it first touches the family. This ADR moves nothing.
- **Mechanics.** A new module adds a `./<name>` subpath export, a test in `uix-styles`, a provenance record under `docs/architecture/provenance/uix-styles.json`, and an update to the scope-guard list. The tree-shaking check lists the subpath.
- **ADR-017.** Its Phase 1 limit to `base` no longer binds. Its statement that a per-component module migrates alongside its owning component stands, and this ADR gives the default for it.

**Alternatives not chosen.**

- Option B, a rule of two (share a style only when a second framework needs it): rejected because it leaves the first framework's copy as the one that drifts, and every Track B family would need a judgment call.
- Option C, keep the current practice: rejected because it keeps up to three copies of each style and gives no rule for new families.

**Consequences.**

- Each Track B family ticket has one more deliverable: the shared module and its three consumers, or a recorded exception.
- Existing framework-local copies are not rewritten in bulk. They move when their family ticket runs.
- `PACKAGE_ARCHITECTURE.md` states the rule so that family tickets apply it without reading this ADR.

## ADR-081 — `@ultimate/uix-styles/base` uses `u-*` selectors and the three cores register it through one `uix-styled` helper (foundation F10; amends ADR-017)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), foundation item F10, ticket [#176](https://github.com/majedsiefalnasr/ultimate-packages/issues/176)). The user chose Option C in the Stage 1 session.

**Context.**

- No package consumed `@ultimate/uix-styles/base`, and its CSS still used Prime's `p-*` selectors and `p-animate-*` keyframes (Phase 4 shared-foundation audit, item C6, ruled P in all three frameworks).
- The cores registered their own hidden-accessible, icon-spin and box-model rules from `@ultimate/uix-styled`, so the module's disabled, icon, overlay-mask, anchored-overlay and collapsible rules reached no page.
- ADR-063 scopes `border-box` per component and says Ultimate never applies the page-wide form. The first rule of the base module is the page-wide form.

**Decision.**

- **Rename.** Selectors become `.u-*` and keyframes `u-animate-*`. The `var(--px-mask-background, ...)` wrapper is dropped in favour of `dt('mask.background')`, the same recorded difference as PX-B3 in the component style ports.
- **Remove two rules.** The page-wide `*, ::before, ::after { box-sizing: border-box }` rule is dropped, and ADR-063 stays as the only `border-box` mechanism. The `.pi` rule is dropped because Ultimate ships no PrimeIcons font.
- **Wire it once.** `registerSharedBase(sheet)` in `packages/uix-styled/src/stylesheet/base.ts` registers the module under the key `u-base` through `registerComponentCss`, so its `dt()` references resolve and follow theme changes. `@ultimate/uix-styled` gains a dependency on `@ultimate/uix-styles`. Each core calls the helper once, next to `registerThemeVariables`: `ng-core` `basecomponent/base-component.ts`, `react-core` `styling/use-component-style.ts`, `vue-core` `styling/vue-style-sheet.ts`.
- **Unstyled.** An unstyled instance does not load it, because it skips `registerThemeVariables` too (ADR-085). It keeps only the hidden-accessible and icon-spin rules.
- **Not renamed here.** Components in `ng` and `vue` that emit the class `p-disabled` are not renamed in this ticket. Each moves with its family ticket (ADR-082). Until then `.u-disabled` styles only what emits `u-disabled`.

**Alternatives not chosen.**

- Remove the module: rejected because the disabled, overlay-mask and collapsible rules need one shared home, and ADR-082 makes `uix-styles` that home.
- Rename the module but leave it unwired: rejected because a renamed module that no core registers repeats the problem this ticket exists to fix.

**Consequences.**

- Every styled instance now registers one `u-base` element per sheet. The size effect on `@ultimate/uix-styled` and `vue-core` is not measured here; the advisory bundle-size gate was already over its threshold for both on the integration branch before this ticket.
- Two rules now apply that did not before. `.u-component:disabled` gives a disabled element that carries `u-component` the opacity `dt('disabled.opacity')`, as in Prime. `.u-disabled` does the same and sets `pointer-events: none`; the only emitter of `u-disabled` today is the Vue `input-chips` root, which already resets its inner input to `opacity: 1` and now dims as that reset expects.
- `.u-icon` now sets `width` and `height` to `dt('icon.size')` (`1rem` in Aura). A `u-icon` element that carries a `width="14" height="14"` attribute, as the `react-core` and `vue-core` SVG icons do (spinner, check, times, window controls), grows from 14px to the token size, because a stylesheet rule overrides a presentation attribute. The baselines that changed for this reason are the Button Loading spinner in React and Vue, the Dialog close icon in React, and in Vue the Drawer close icon, the ConfirmDialog (two pixels taller, because its icon button grows) and the Chip remove icon. A component that needs another size sets it on a more specific class, as `.u-checkbox-icon` does.
- `.u-overlay-mask` now has CSS: a fixed, full-viewport mask with `dt('mask.background')`. Before, `ng` and `vue` Dialog, Drawer and ConfirmDialog rendered no dimming mask at all. It now appears in those two frameworks. The `ng` Dialog has no centering rule and was already full width at the top of the page before this ticket; the mask makes that visible, and because the mask is a fixed box the dialog now starts at the viewport edge instead of the 16px body margin. React Dialog and Drawer keep their own `u-dialog-mask` and `u-drawer-mask` rules and do not emit `u-overlay-mask`, so React is unchanged and the three frameworks still differ here. The Dialog family tickets in Stage 2 own the centering and the React difference.
- A disabled Button and the SplitButton in `ng`, and a disabled Button in React, now render dimmed, because `.u-component:disabled` now reaches the page. The Vue Button Disabled baseline did not change, so this ADR makes no claim about Vue Button. In Chromium the React change stays inside the 0.2 per-pixel threshold; it shows in Firefox.
- The React Checkbox style module is hand-written and does not use `@ultimate/uix-styles/checkbox`, so it had no `.u-checkbox-icon` size and the new `.u-icon` rule would have grown its check mark to 16px. It now sets `.u-checkbox-icon` to `dt('checkbox.icon.size')` (`0.875rem`), which keeps the existing 14px baseline.
- The intended visual changes above are recorded by updated Playwright baselines in this PR. The baselines were regenerated in the CI Playwright image, and only the listed stories changed.
- Tests cover the module's selectors, the absence of `box-sizing`, the helper, and registration in each core (present when styled, absent when unstyled).

## ADR-086 — InputText: `size`, value-derived `p-filled`, shared styles, and React `keyfilter`/`tooltip` stay composition (L0a, ticket #188)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#188](https://github.com/majedsiefalnasr/ultimate-packages/issues/188)). The user ruled on rows 5, 6, 9 and 12 to 14 before implementation. This ADR records those rulings and the rows that stay open.

**Context.**

- The Phase 4 InputText audit found 22 rows. The gaps were: no `size` in any framework (row 5), a `p-filled` class driven by the variant in Vue and never set in React (row 9), hard-coded React CSS with the wrong Aura key `input-text` (rows 16, 22), a Vue style copy with its own `.u-input-text` class and no placeholder, size or filled-hover rules (row 16), no `pt` anywhere (row 18), and a Vue base that shadowed `cx` and `mounted` so `unstyled`, per-instance `dt` and `pt` did nothing (rows 19 to 21).
- ADR-082 puts structural style in `@ultimate/uix-styles` by default. The `inputtext` module already existed and was consumed only by Angular.

**Decision.**

1. **Size (row 5).** All three frameworks take `size: "small" | "large"`, the same convention as Button. It emits `u-inputtext-sm` or `u-inputtext-lg`, which the shared module styles from the Aura `inputtext.sm.*` and `inputtext.lg.*` tokens. Angular names the input `uSize`, so it does not collide with the native `size` attribute. The size is also a token in `data-p` (Angular, Vue), as in PrimeNG and PrimeVue.
2. **Filled (row 9).** `p-filled` is value-derived: it is set when the value is not empty, like PrimeNG and PrimeVue. React tracks an uncontrolled `defaultValue` with state, so typing updates it. The variant-derived `filled` token stays in `data-p`, as in the oracles. `p-variant-filled` is the only class that follows the variant.
3. **Shared styles (rows 16, 22).** React and Vue import `style` from `@ultimate/uix-styles/inputtext`, like Angular. Both register under the Aura key `inputtext`. The Vue root class is now `u-inputtext`, the shared module's name.
4. **Vue base (rows 19 to 21).** `createBaseInput(options)` forwards `componentName` and `styleModule` to the editable holder. `BaseInputText` no longer shadows `cx` and `mounted`, so `unstyled`, per-instance `dt` and `pt` come from `createBaseComponent`. Other Vue families that use the shadow workaround are not touched; their tickets move them over.
5. **Pass-through (row 18).** Angular binds `ptms(["host", "root"])` through the `UBind` host directive. React and Vue apply `ptm("root")`. `unstyled` drops the Ultimate classes. React `dt` stays N because PrimeReact has no per-instance `dt`.
6. **Angular-only invalid style (row 8).** The `.ng-invalid.ng-dirty` rules stay in the Angular style module, with their reason documented there. Angular forms set those classes. React and Vue have no counterpart, so the shared module cannot carry them (ADR-082 framework-local exception).
7. **React `keyfilter`, `tooltip` and `validatePattern` (rows 12 to 14) are I.** They stay separate composition (`useKeyFilter`, `UTooltip`), as in Angular and Vue, instead of props of `UInputText`. This is an intentional difference from PrimeReact. Defects inside the key filter and the tooltip belong to the KeyFilter and Tooltip family tickets.
8. **Vue Fluid (row 6) stays P.** The explicit `fluid` prop works. Ancestor fluid detection needs a Fluid provider, and Vue has none. The Fluid family ticket is in L0b.

**Divergences from Prime.**

1. React `size` is the visual size, as in PrimeVue. PrimeReact passes the native `size` attribute to the DOM. A native `size` on the React input is now reachable only through `pt.root`.
2. React `p-filled` is derived from the value. PrimeReact never sets it.
3. React `keyfilter`, `tooltip` and `validatePattern` are not props (item 7).
4. Row 4 (variant fallback from global config) stays P in all three frameworks. The config surface has no `inputVariant` or `inputStyle`, and `packages/ng-core/src/base-input/base-input.ts` gates it on config's open decision.
5. Row 3 (`@primevue/forms`) stays M in Vue. It belongs to the separate Vue Forms spec (R3).
6. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so row 19 is P.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read; the Phase 4 report is not edited).

- Angular 15 / 2 / 0 / 0 / 5 / 0 / 0. Open: rows 4 and 19.
- React 10 / 3 / 0 / 3 / 5 / 1 / 0. Open: rows 4, 11 and 19. Row 11 is P because native `size` moved to `pt.root`. I: rows 12 to 14. N: row 21.
- Vue 14 / 3 / 1 / 0 / 4 / 0 / 0. Open: rows 4, 6 and 19. M: row 3.

**Consequences.**

- With the real `UInputText` in Vue, the FloatLabel, IconField, IftaLabel, InputGroup and InputMask style modules still select `.u-input-text` and miss the root class, until tickets #191 to #194 and #190 move them to `.u-inputtext`. This was already true in Angular and React. Their stories hand-write `class="u-input-text"` on raw inputs, so their baselines do not change.
- The Vue InputText baseline changes visually, because the shared module adds placeholder color, focus outline offset and filled hover and focus backgrounds. Any changed baseline comes with before and after images in the PR.
- Tests cover size, value-derived filled, `data-p`, `pt`, `unstyled` and per-instance `dt` in the frameworks that support each. The Angular invalid style is asserted on the style module's CSS, not in a browser.

## ADR-087 — Avatar and AvatarGroup: Prime content and error contracts, pass-through, shared styles, and logical size-specific group offsets (L0a, ticket #201)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#201](https://github.com/majedsiefalnasr/ultimate-packages/issues/201)). The user ruled on the three decisions of the Phase 4 report before implementation (all option A). This ADR records those rulings, the divergences and the rows that stay open.

**Context.**

- The Phase 4 Avatar audit found 18 rows per framework. The gaps were: image-first content order in Angular, React and Vue where PrimeNG and PrimeVue show the label first (row 1); a fallback after a failed image in Angular and Vue where upstream only emits the error, and a Vue failed state that never reset (row 4); no `imageAlt`, native attribute spread, `children`, `imageFallback` or click styling in React (rows 5, 6, 7, 9, 10); no default slot or `icon` slot in Vue (rows 7, 8) and no content projection in Angular (row 7); fixed physical-left group offsets with no size awareness (row 11); no `pt`, `ptOptions`, `unstyled` or `dt` (rows 12 to 13); and hard-coded React CSS (row 15).
- ADR-082 puts structural style in `@ultimate/uix-styles` by default. ADR-079 and ADR-080 define `pt` and `ptOptions`; ADR-085 defines `unstyled` and `dt`.

**Decision.**

1. **Content priority and image error (rows 1, 4): match each Prime contract.** Angular and Vue show projected or slot content first, then the `label`, then the `icon`, then the `image`, as PrimeNG and PrimeVue do. A failed image only emits the error (`onImageError` in Angular, `error` in Vue); there is no fallback and no failed state, so the Vue reset question disappears. React keeps the image first, then the `label`, then the `icon`, as PrimeReact does. React keeps its fallback after a failed image even when `onImageError` is supplied (user ruling 2026-11-18, recorded as a reference defect in the Phase 4 report), and the failed state resets when `image` changes.
2. **Customization (rows 5 to 10): Prime-equivalent.** React gains `imageAlt` (default `avatar`), `imageFallback` (default `default`, any other value is the fallback image URL), `children` that replace the content, the remaining root attributes, and the `u-avatar-clickable` class when `onClick` is set. React `icon` accepts a CSS class string or a node. Vue gains the default slot and the `icon` slot. Angular gains content projection.
3. **Group offsets (row 11): logical, tokenized and size-specific.** The shared module uses `margin-inline-start` from `avatar.group.offset`, `avatar.lg.group.offset` and `avatar.xl.group.offset`, so the overlap follows the writing direction and the avatar size. The fixed physical `margin-left` is gone.
4. **Pass-through (rows 12, 13).** `pt` applies to Avatar (`root`, `label`, `icon`, `image`) and AvatarGroup (`root`). Angular binds `ptms(["host","root"])` through the `UBind` host directive and `ptm` on the inner elements. React and Vue apply `ptm`, and Vue uses `ptmi('root')` with `inheritAttrs: false`. `unstyled` drops the Ultimate classes in all three. Per-instance `dt` is available in Angular and Vue; React has none (n/a, as PrimeReact).
5. **Shared styles (row 15).** Angular, React and Vue import `style` from `@ultimate/uix-styles/avatar` (a new module: the `@primeuix/styles` 2.0.3 avatar module with the `u-` prefix and one added rule, `.u-avatar-clickable`). The hard-coded React CSS is gone, and all three read the Aura `avatar` tokens.

**Divergences from Prime.**

1. React does not offer PrimeReact's `template` function prop or the function form of `icon`. `children` and a node `icon` cover the node forms.
2. React falls back after a failed image even when `onImageError` is supplied, where PrimeReact suppresses its built-in fallback (item 1 of the decision).
3. Angular does not offer `styleClass` or `style`; the host takes a normal `class` and `style`.
4. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so row 12a is P.
5. The Vue `icon` slot is wrapped in a span that carries `u-avatar-icon` and the icon `ptm`, as Angular and React already do. PrimeVue renders the slot through a dynamic component and the class never reaches it, so the shared icon-size rule would not apply to a slot icon. Ruled by the user for #201.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read; the Phase 4 report is not edited).

- Angular 13 / 1 / 0 / 0 / 4 / 0 / 0. Open: row 12a.
- React 15 / 1 / 0 / 0 / 2 / 0 / 0. Open: row 12a. Row 4 stays complete with its recorded reference defect.
- Vue 14 / 1 / 0 / 0 / 3 / 0 / 0. Open: row 12a.

**Consequences.**

- The group overlap and the avatar sizes now come from Aura tokens, so the Avatar and AvatarGroup baselines can change visually. No browser run was made for this ADR; a changed baseline comes with before and after images in the PR.
- React's `u-avatar-image` class is now set only while the image is shown, so a failed image removes the transparent background.
- Tests cover the content order, the error contract, `imageAlt`, `imageFallback`, `children`, the clickable class, `pt` on every section, `unstyled`, and per-instance `dt` where supported. Group behavior in RTL is not runtime-verified.

## ADR-088 — Badge: React `UBadge`, Angular `[uBadge]`, Vue `v-badge` stays out, and OverlayBadge forwards style and class (L0a, ticket #202)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#202](https://github.com/majedsiefalnasr/ultimate-packages/issues/202)). The user ruled on the four decisions below before implementation. This ADR records those rulings and the rows that stay open.

**Context.**

- The Phase 4 Badge audit found 15 rows per framework. React had no Badge at all (10 rows missing: the component, severity, size, the shape rules, attributes, element access, the overlay wrapper, `pt`, `ptOptions` and `unstyled`). Angular lacked the `[pBadge]` directive, `pt`, `ptOptions` and OverlayBadge's `style` and `styleClass` forwarding. Vue lacked `pt`, `ptOptions`, `unstyled`, per-instance `dt` and the deprecated `v-badge` directive.
- ADR-077, ADR-079 and ADR-080 (A0) give every family the instance-level `pt` and `ptOptions`; ADR-085 gives it `unstyled` and per-instance `dt`; ADR-082 makes the structural CSS a shared `@ultimate/uix-styles` module.

**Decision.**

1. **React `UBadge` (rows 1 to 4, 7, 8).** React gets a standalone `UBadge` on the shared `@ultimate/uix-styles/badge` module, so it reads the same Aura `badge` tokens as Angular and Vue. `severity` accepts both `warn` and `warning`, which map to the same `u-badge-warn` class, so PrimeReact code and the cross-framework spelling both work. `size` takes `small`, `large` and `xlarge`. `UButton` renders its badge through `UBadge` and keeps `badgeClassName`.
2. **Angular `[uBadge]` directive (row 11).** `UBadgeDirective` is the equivalent of PrimeNG's `[pBadge]`, with the same inputs (`badgeDisabled`, `badgeSize`, `severity`, `value`, `badgeStyle`, `badgeStyleClass`). It lives with `UOverlayBadge` and creates a real `UBadge` inside the host with `createComponent` and a `Renderer2`-made element, so it works on the server. The host takes `u-overlaybadge` from the overlay-badge module, so the placement CSS stays in one Angular place. `pt` on the directive reaches the badge as `pcBadge`, and `unstyled` is forwarded, which replaces PrimeNG's `pBadgePT` and `pBadgeUnstyled`. The selector and class take Ultimate's `u` prefix.
3. **Vue `v-badge` (row 11).** It stays out. PrimeVue deprecates it in v4 and points to OverlayBadge. This is a deliberate gap (I): a consumer migrating from `v-badge` uses `UOverlayBadge`.
4. **Angular OverlayBadge forwarding (row 9).** `badgeStyle` and `badgeStyleClass` are forwarded to the composed badge, as PrimeNG forwards `style` and `styleClass`. The deprecated `size` and `styleClass` are not offered. The names differ from PrimeNG's because `style` and `class` are already the host's own attributes in Angular.
5. **Pass-through, `unstyled` and `dt` (rows 12 to 13a).** Angular `UBadge` binds `ptms(["host", "root"])` through `UBind`. React and Vue apply `ptm("root")` and `ptmi("root")`. Angular and Vue OverlayBadge bind `root` (and `host` in Angular) and forward `pcBadge` to the composed badge. Vue Badge and OverlayBadge keep `inheritAttrs: false` because `ptmi("root")` carries the fall-through attributes, so `id`, `class` and `style` reach the root span (row 7). `unstyled` and `dt` come from the base chain; React takes `unstyled` as a prop and has no per-instance `dt`, because PrimeReact has none.
6. **React element access (row 8).** The ref is the root span. PrimeReact's handle is `{ props, getElement() }`. This is a usage difference, recorded as intentional (I), as in ADR-089.
7. **React overlay wrapper (row 10).** The wrapper CSS is not carried. React has no OverlayBadge component, as in PrimeReact, and the `.u-overlaybadge` rules would be a copy of the Angular and Vue ones. They move to a shared `@ultimate/uix-styles` overlaybadge module in a later ticket. This is an intentional gap (I) and differs from the Phase 4 report, which expected the row to close with the component.

**Divergences from Prime.**

1. Angular `[uBadge]` and OverlayBadge use `uBadge`, `badgeStyle` and `badgeStyleClass`; the directive does not attach to the first child of a host whose tag has a dash. The badge it creates is a `u-badge` element, where PrimeNG creates a span.
2. The directive takes `pt` and `unstyled` through the standard inputs and forwards them to the badge, instead of `pBadgePT` and `pBadgeUnstyled`.
3. Vue `v-badge` is not offered (item 3). The React ref is the element (item 6).
4. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so row 12a stays partial.
5. The `.u-overlaybadge` rules exist in two places (the Angular and Vue overlay-badge modules). A shared `@ultimate/uix-styles` overlaybadge module would remove the copy; it is a follow-up, not part of this ticket.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read; the Phase 4 report is not edited).

- Angular 11 / 1 / 0 / 0 / 3 / 0 / 0. Open: row 12a.
- React 7 / 1 / 0 / 2 / 5 / 0 / 0. Open: row 12a. I: rows 8 and 10.
- Vue 10 / 1 / 0 / 1 / 3 / 0 / 0. Open: row 12a. I: row 11.

**Consequences.**

- React consumers get `UBadge` from `@ultimate/react` and `@ultimate/react/badge`. A React Button badge now carries the shared badge look (padding, background from `badge.*` tokens, circle for one character), where it was an unstyled span.
- Tests cover shape, severity (including `warning`), size, attribute fall-through, `pt`, `unstyled` and per-instance `dt` in the frameworks that support each, the directive's create, update, disable and style-clearing paths, and OverlayBadge forwarding. The effect of the overlay CSS and of `unstyled` is asserted on classes and rules, not in a browser.
- No existing Badge or OverlayBadge story changes its output, and no React story rendered a Button badge, so no browser baseline changes. Overlay positioning in LTR and RTL is not runtime-verified.

## ADR-089 — Toolbar: regions render only when provided, `pt` reaches every section, and the deprecated and Angular-template surface stays out (L0a, ticket #205)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#205](https://github.com/majedsiefalnasr/ultimate-packages/issues/205)). The user ruled on region rendering, the React function form and the deprecated surface before implementation. This ADR records those rulings and the rows that stay open.

**Context.**

- The Phase 4 Toolbar audit found 14 rows (1 to 12, plus 10a and 11a). The gaps were: no `pt` or `ptOptions` anywhere (rows 11, 11a), `unstyled` and `dt` never read in Angular and absent in React and Vue (rows 10, 10a), a Vue root that swallowed consumer attributes because `inheritAttrs: false` had no `$attrs` binding (row 6), a React root that took only `className` and `style` (row 6), no function form for React `start`, `center` and `end` (row 2), and three rows where Ultimate renders differently from Prime (rows 3, 5, 7).
- ADR-077, ADR-079 and ADR-080 (A0) give every family the instance-level `pt` and `ptOptions`; ADR-085 gives it `unstyled` and per-instance `dt`.

**Decision.**

1. **Region rendering (row 3).** The start, center and end elements render only when their template, prop or slot is provided, in all three frameworks. Angular already did this, as PrimeNG does. Prime React and Prime Vue always render three divs. Ultimate keeps the conditional form: the DOM has no empty regions, an empty region cannot add a flex `gap` or a spacing artifact, and the three frameworks behave alike. This is intentional (I) in React and Vue.
2. **React function form (row 2).** `start`, `center` and `end` accept a node or a function that receives the toolbar props and returns a node, as PrimeReact's `getJSXElement(props.start, props)` does.
3. **Deprecated surface (rows 5, 7).** The deprecated `left` and `right` aliases (Angular templates, React props) and Angular `getBlockableElement()` are not offered, the same position as the deprecated `styleClass`. They are intentional (I).
4. **Pass-through (rows 11, 11a).** `pt` reaches four sections, `root`, `start`, `center` and `end`. Angular binds `ptms(["host", "root"])` through the `UBind` host directive and `ptm("start" | "center" | "end")` on each region, and provides `U_PARENT_INSTANCE`. React merges `ptm(section)` into each element's props. Vue binds `ptmi("root")` and `ptm(section)`.
5. **`unstyled` and `dt` (rows 10, 10a).** They come from the base chain, as ADR-085 specifies. React takes `unstyled` as a prop and has no per-instance `dt`, because PrimeReact has none.
6. **Attributes (row 6).** The Vue root binds `ptmi("root")`, which carries `$attrs`, so `id`, `class`, `style` and native attributes reach the root. The React root takes the other `div` props and merges them with `className`, `style` and `ptm("root")`, as PrimeReact's `getOtherProps` does.
7. **React ref (row 7).** The ref is the root `div`. PrimeReact's handle is `{ props, getElement() }`. This is a usage difference, recorded as intentional (I).
8. **Angular template source (row 2).** Content templates are plain `ng-template #start`, `#center` and `#end`. The `PrimeTemplate` and `pTemplate` mechanism is not offered, the same position as `UTimeline`. This is intentional (I) and was not among the three rulings; it is listed here for review.

**Divergences from Prime.**

1. React and Vue render a region only when provided (item 1).
2. The React ref is the element, not a handle (item 7).
3. No `left` and `right` aliases, no `getBlockableElement()`, no `pTemplate` (items 3 and 8).
4. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so rows 11a are partial.
5. React `unstyled` is a prop of `UToolbar` and `dt` is absent, as in PrimeReact.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read; the Phase 4 report is not edited).

- Angular 9 / 1 / 0 / 3 / 1 / 0 / 0. Open: row 11a. I: rows 2, 5, 7.
- React 7 / 1 / 0 / 3 / 3 / 0 / 0. Open: row 11a. I: rows 3, 5, 7.
- Vue 8 / 1 / 0 / 1 / 4 / 0 / 0. Open: row 11a. I: row 3.

**Consequences.**

- Existing selectors on the three regions keep working. A consumer that expects three divs from React or Vue, as in Prime, gets only the regions it provided.
- Tests cover the function form, attribute fall-through, `pt` on all four sections, `unstyled` and per-instance `dt` in the frameworks that support each. The effect of `unstyled` is asserted on the classes, not in a browser.
- No Toolbar visual output changes, so no browser baseline changes.

## ADR-090 — FloatLabel: one shared stylesheet keyed on the classes the sibling fields emit, `pt` and parent instance, and the unused nested instance token stays out (L0a, ticket #191)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#191](https://github.com/majedsiefalnasr/ultimate-packages/issues/191)). No ruling was needed before implementation; this ADR records the decisions the ticket made and the rows that stay open.

**Context.**

- FloatLabel is pure CSS: the label floats on `:has()` selectors against the projected field. The three frameworks kept three copies of that CSS (two with `dt()` tokens, React with literal colours), and none of them matched what the sibling fields render.
- The float and invalid selectors keyed on `u-filled`, `u-invalid` and `u-inputwrapper-*`, and the `in` padding selector on `u-input-text`. `UInputText` renders `u-inputtext`, `p-filled` and `p-invalid`, and the Select family renders `p-inputwrapper-filled`. So a filled field kept its label over the text, and the `in` padding and the invalid label colour never applied.
- `UFloatLabel` had no `pt`, `ptOptions`, `unstyled` or per-instance `dt` wiring, React accepted only `className` and `children`, and Angular and Vue did not provide themselves to descendants.

**Decision.**

1. **Shared module.** The structural CSS is `@ultimate/uix-styles/floatlabel` (ADR-082), consumed by the Angular, React and Vue style modules. Angular adds one framework-local rule, `.u-float-label:has(.ng-invalid.ng-dirty) label`, as PrimeNG does, because React and Vue have no counterpart.
2. **Selectors follow what the siblings emit.** The module keys on `u-inputtext`, `u-textarea`, `u-select-label`, `u-multi-select-label`, `u-cascade-select-label`, `u-input-icon`, `u-chip` and on the state classes `p-filled`, `p-invalid` and `p-inputwrapper-filled` and `-focus`, which the siblings emit unrenamed. It also carries Prime's `.p-multiselect-label:has(.p-chip)` and `.p-treeselect-label` padding selectors, which the local copies had dropped.
3. **Root class.** The root class stays `u-float-label` with `-over`, `-on` and `-in`. Prime's name after the `p-` to `u-` rename would be `u-floatlabel`; renaming a class that InputGroup, IftaLabel and consumers already select would break them for no capability gain.
4. **Pass-through.** Angular binds the root through `UBind` (`ptms` host and root), Vue binds `ptmi('root')` with `inheritAttrs: false`, and React merges its own class, the remaining props and `ptm('root')` on the span and forwards the ref. `unstyled` and per-instance `dt` come from the base in Angular and Vue; React has `unstyled` and no `dt`, as PrimeReact has none. The React `componentName` is `floatlabel`, the Aura key.
5. **Parent instance.** Angular provides itself as `U_PARENT_INSTANCE`. Vue already provides every instance as `$parentInstance` through the vue-core pass-through mixin. PrimeNG's nested `FLOATLABEL_INSTANCE` token and PrimeVue's `$pcFloatLabel` key have no consumer in the pinned sources, so they are not carried (I).
6. **React CSS.** The literal colours and sizes are replaced by the Aura `floatlabel` tokens through the shared module (ADR-067), and the `[placeholder]` selectors in the `in` and `on` variants are present.

**Divergences from Prime.**

1. The root class is `u-float-label`, not `u-floatlabel` (item 3).
2. The `variant` prop exists in React and is absent from PrimeReact.
3. No `FLOATLABEL_INSTANCE` token and no `$pcFloatLabel` key (item 5).
4. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so row 11 is partial.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read; the Phase 4 report is not edited). Row 5 stays partial because AutoComplete's multiple-value input and TreeSelect's label do not render the classes the module names yet; their family tickets (L0b) own that.

- Angular 11 / 2 / 0 / 0 / 0 / 0 / 0. Open: rows 5 and 11.
- React 6 / 2 / 0 / 0 / 5 / 0 / 0. Open: rows 5 and 11. N: rows 2, 6, 7, 8, 13.
- Vue 11 / 2 / 0 / 0 / 0 / 0 / 0. Open: rows 5 and 11.

**Consequences.**

- A filled field now floats its label and takes the filled label colour, and an invalid field takes the invalid label colour. These are visible changes for `UInputText` and `UTextarea` inside a FloatLabel in all three frameworks.
- The `in` variant now pads `UInputText`, because the selector names `u-inputtext`. FloatLabel stories hand-write the class on raw inputs; they now use `u-inputtext`, so their browser baselines can change for the `in` variant.
- React FloatLabel colours now come from the theme instead of fixed values, so its appearance follows the active preset.
- Tests cover the root class, variant classes, attribute fall-through, `pt`, `unstyled`, per-instance `dt` (Angular and Vue) and the parent instance. Their effect is asserted on classes and DOM, not in a browser.

## ADR-091 — IconField: one shared stylesheet keyed on the classes the sibling fields emit, `pt` and parent instance, React `iconPosition` defaults to `left`, and InputIcon is `aria-hidden` by default (L0a, ticket #192)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#192](https://github.com/majedsiefalnasr/ultimate-packages/issues/192)). Two rulings were taken before implementation (items 3 and 4); the rest records decisions the ticket made and the rows that stay open.

**Context.**

- IconField positions an icon inside a text field by `:first-child` and `:last-child` selectors against DOM order, and pads the field to make room. The three frameworks kept three copies of that CSS (Angular and Vue with `dt()` tokens, React with literal colours and sizes).
- The padding selectors keyed on `u-input-text` and `u-inputwrapper`. `UInputText` renders `u-inputtext`, and the wrapper classes the Select family renders are `p-inputwrapper*`. So the field was never padded and the icon sat on top of the text.
- Neither component had `pt`, `ptOptions` or `unstyled` wiring in React, none provided itself to descendants in Angular or Vue, and React did not forward a ref or the remaining props.
- InputIcon decorates a field. A screen reader announced the icon glyph or its name, and the three Prime packages differ: PrimeNG and PrimeReact set nothing, and PrimeVue sets `aria-hidden="true"` as a fixed attribute that cannot be replaced.

**Decision.**

1. **Shared module.** The structural CSS is `@ultimate/uix-styles/iconfield` (ADR-082), consumed by the Angular, React and Vue style modules, so all three read the Aura `iconfield` tokens.
2. **Selectors follow what the siblings emit.** The padding selectors key on `u-inputtext` and `p-inputwrapper`. The `sm` and `lg` icon-size rules accept both `u-inputtext-sm`/`-lg` and `u-inputfield-sm`/`-lg`, so the Select family can emit the second name without a change here.
3. **React `iconPosition` defaults to `left` (user ruling).** PrimeReact defaults to `right`. Angular, and PrimeNG, default to `left`, and a shared default keeps the three frameworks identical. The prop only adds the position class; the icon sits where it is placed in the DOM.
4. **InputIcon is `aria-hidden="true"` by default in all three (user ruling).** An attribute, a prop or a `pt` entry replaces it, so an interactive icon such as a clear button stays reachable. Angular writes it as a host attribute, React merges it first, and Vue places it before `v-bind`.
5. **Pass-through and parent instance.** Angular binds the root through `UBind` (`ptms` host and root) and provides itself as `U_PARENT_INSTANCE`. Vue binds `ptmi('root')` with `inheritAttrs: false`; the vue-core mixin already provides every instance as `$parentInstance`. React merges its own class, the remaining props and `ptm('root')`, and forwards the ref. `unstyled` and per-instance `dt` come from the base in Angular and Vue; React has `unstyled` and no `dt`. The component names are `iconfield` and `inputicon`, the Aura keys (Angular's was `input-icon`).
6. **Not carried.** The `ICONFIELD_INSTANCE` and `INPUTICON_INSTANCE` tokens and the `$pcIconField` and `$pcInputIcon` keys have no consumer in the pinned sources (I). React's `cloneElement` injection of `iconPosition` into the children has no consumer (I). The deprecated `styleClass` input and Vue's `class` prop are not needed.
7. **React CSS.** The literal colours and sizes are replaced by the Aura `iconfield` tokens through the shared module (ADR-067).

**Divergences from Prime.**

1. React `iconPosition` defaults to `left`, not `right` (item 3).
2. InputIcon is `aria-hidden` by default in Angular and React, where PrimeNG and PrimeReact set nothing, and replaceable in Vue, where PrimeVue's attribute is fixed (item 4).
3. The sibling selectors are `u-inputtext` and `p-inputwrapper`, not `p-inputtext` (item 2).
4. No instance tokens and no `cloneElement` injection (item 6).
5. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so row 11 is partial.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read; the Phase 4 report is not edited, and nothing here is browser-verified).

- Angular 11 / 1 / 0 / 0 / 0 / 1 / 0. Open: row 11 (P). N: row 6.
- React 8 / 1 / 0 / 1 / 0 / 3 / 0. Open: row 11 (P). I: row 3 (the default differs). N: rows 4, 6 and 13.
- Vue 11 / 1 / 0 / 0 / 0 / 1 / 0. Open: row 11 (P). N: row 3.

**Consequences.**

- A field inside an IconField is now padded for the icon in all three frameworks, and the icon takes the theme colour and size. These are visible changes for `UInputText` inside an IconField.
- React IconField now places the icon on the left by default. A consumer relying on the PrimeReact default writes `iconPosition="right"`.
- Screen readers stop announcing decorative icons. An icon that must be announced sets `aria-hidden="false"` or a label.
- Nothing emits `u-inputfield-sm` or `-lg` yet; the Select family tickets in L0b own that.
- Tests cover the root and position classes, attribute fall-through, `pt`, `unstyled`, `aria-hidden` and its replacement, per-instance `dt` (Angular and Vue) and the parent instance. Their effect is asserted on classes and DOM, not in a browser.

## ADR-092 — IftaLabel: one shared stylesheet keyed on the classes the sibling fields emit, `pt` and parent instance, the Angular-only invalid rule, and no React component (L0a, ticket #193)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#193](https://github.com/majedsiefalnasr/ultimate-packages/issues/193)). No ruling was needed before implementation; this ADR records the decisions the ticket made and the rows that stay open.

**Context.**

- IftaLabel is pure CSS: an absolutely positioned label sits above the field, and the field is padded to make room. The two frameworks kept two copies of that CSS, and neither matched what the sibling fields render.
- The padding selectors keyed on `u-input-text`, the invalid colour on `u-invalid`, and the focus colour on `u-inputwrapper-focus`. `UInputText` renders `u-inputtext` and `p-invalid`. So the label never took the invalid colour and the field was never padded.
- The local copies dropped two upstream padding selectors (`.p-multiselect-label:has(.p-chip)` and `.p-treeselect-label`) and, in Angular, PrimeNG's `.ng-invalid.ng-dirty` label colour rule.
- `UIftaLabel` had no `pt`, `ptOptions`, `unstyled` or per-instance `dt` wiring, and neither framework provided itself to descendants.
- PrimeReact ships no IftaLabel (`docs/prime-reference/components/iftalabel.md`).

**Decision.**

1. **Shared module.** The structural CSS is `@ultimate/uix-styles/iftalabel` (ADR-082), consumed by the Angular and Vue style modules, so both read the Aura `iftalabel` tokens. Angular adds one framework-local rule, `.u-ifta-label:has(.ng-invalid.ng-dirty) label`, as PrimeNG does, because Vue has no counterpart.
2. **Selectors follow what the siblings emit.** The module keys on `u-inputtext`, `u-textarea`, `u-select-label`, `u-multi-select-label`, `u-autocomplete-input-multiple`, `u-cascade-select-label`, `u-treeselect-label`, `u-chip` and `u-input-icon`, and on the state classes `p-invalid` and `p-inputwrapper-focus`. It also carries Prime's two padding selectors that the local copies had dropped.
3. **Root class.** The root class stays `u-ifta-label`. Prime's name after the `p-` to `u-` rename would be `u-iftalabel`; renaming a class that InputGroup and consumers already select would break them for no capability gain, as in ADR-090.
4. **Pass-through.** Angular binds the root through `UBind` (`ptms` host and root) and provides itself as `U_PARENT_INSTANCE`. Vue binds `ptmi('root')` with `inheritAttrs: false`; the vue-core mixin already provides every instance as `$parentInstance`. `unstyled` and per-instance `dt` come from the base. The component name is `iftalabel`, the Aura key.
5. **Not carried.** The `IFTALABEL_INSTANCE` token and PrimeVue's `$pcIftaLabel` key have no consumer in the pinned sources. PrimeNG's two extra selector aliases (`p-iftaLabel` and `p-ifta-label`) are not carried; Ultimate keeps one `u-ifta-label` selector.
6. **React.** No component is added. Every React row is N because PrimeReact ships none.

**Finding recorded here.** No component in the source emits `p-inputwrapper-focus`; the Select family emits `p-inputwrapper` and `p-inputwrapper-filled` only. So the focus label colour applies to a plain input or textarea (`:focus`) and not to a compound widget. ADR-090 states that the siblings emit `p-inputwrapper-focus`, which was wrong, and the same gap affects the FloatLabel focus selectors. It is a Select-family gap (L0b), not an IftaLabel change, so it stays open here and ADR-090 is not rewritten.

**Divergences from Prime.**

1. The root class is `u-ifta-label`, not `u-iftalabel` (item 3).
2. One selector, not three (item 5).
3. No `IFTALABEL_INSTANCE` token and no `$pcIftaLabel` key (item 5).
4. `ptOptions` is accepted everywhere but has no visible effect until the global `pt` source exists (ADR-080), so row 14 is partial.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read of the 16 rows; the Phase 4 report is not edited, and nothing here is browser-verified). Row 5 stays partial because AutoComplete's multiple-value input and TreeSelect's label do not render the classes the module names yet. Row 6 stays partial for the finding above.

- Angular 13 / 3 / 0 / 0 / 0 / 0 / 0. Open: rows 5, 6 and 14. Row 7 (invalid colour), row 8 (`.ng-invalid.ng-dirty`), rows 11, 13, 15 and 16 are now C.
- React 0 / 0 / 0 / 0 / 0 / 16 / 0. N: every row.
- Vue 12 / 3 / 0 / 0 / 0 / 1 / 0. Open: rows 5, 6 and 14. Row 8 is N (no Vue counterpart). Rows 7, 11, 13, 15 and 16 are now C.

**Consequences.**

- An invalid field now gives the label the invalid colour, and a plain input or textarea in focus gives it the focus colour. The field is padded for the label. These are visible changes for `UInputText` inside an IftaLabel in both frameworks.
- The IftaLabel stories hand-write the field class; they now use `u-inputtext`, so their browser baselines can change.
- Tests cover the root class, attribute fall-through (Vue), `pt`, `unstyled`, per-instance `dt` and the parent instance. Their effect is asserted on classes and DOM, not in a browser.

## ADR-093 — InputGroup: one shared stylesheet keyed on the classes the sibling fields emit, `pt` and unstyled on Angular and Vue, and React delivery left open (L0a, ticket #194)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#194](https://github.com/majedsiefalnasr/ultimate-packages/issues/194)). The React delivery is recorded separately in ADR-094.

**Context.**

- InputGroup is a layout wrapper. Its joined-field rules (radius collapse, borders, focus stacking) live in CSS, and the two frameworks kept two copies that did not match what the sibling fields emit.
- The rules keyed on `u-input-text`, `u-inputwrapper` and `u-focus`. `UInputText` renders `u-inputtext`, the Select family renders `p-inputwrapper` and `p-focus`, and no component renders `u-inputwrapper` or `u-focus`. So the joined rules did not reach the fields they were written for.
- The Angular rules for PrimeNG's `p-button` and `p-inputmask` host elements were missing, so a button or mask in a group kept its own radius.
- `UInputGroup` and `UInputGroupAddon` had no `pt`, `ptOptions`, `unstyled` or per-instance `dt` wiring, as the IftaLabel ticket had before #193.
- PrimeReact has no InputGroup component. Its only InputGroup is a CSS pattern: a `p-inputgroup` container with `p-inputgroup-addon` children.

**Decision.**

1. **Shared module.** The structural CSS is `@ultimate/uix-styles/inputgroup` (ADR-082), consumed by the Angular and Vue style modules, so both read the Aura `inputgroup` tokens.
2. **Selectors follow what the siblings emit.** The module keys on `u-inputtext`, `p-inputwrapper`, `p-inputwrapper-focus` and `p-focus`, and on the L0a wrapper roots `u-icon-field`, `u-float-label` and `u-ifta-label`.
3. **Framework-local rules.** Angular adds the rules PrimeNG applies to the `p-button` and `p-inputmask` host elements, renamed to `u-button` and `u-input-mask`. Vue has no counterpart.
4. **Root and addon classes.** The root class stays `u-input-group` and the addon class `u-input-group-addon`. The addon's component name becomes `inputgroupaddon`, the Aura key, as in the other ports.
5. **Pass-through.** Angular binds the root and the addon through `UBind` (`ptms` host and root). Vue binds `ptmi('root')` with `inheritAttrs: false`. `unstyled` and per-instance `dt` come from the base.
6. **React is recorded in ADR-094.** PrimeReact has the CSS pattern and no component; the user ruled that React ships components over the shared module.

**Divergences from Prime.**

1. The Angular button reset rule drops PrimeNG's `:first-child` guard on the group, which limited the reset to a group that is itself a first child.
2. `p-inputgroup-fluid` is not carried. PrimeNG gates it on an input the component never declares (Phase 4 row 6, N).
3. The deprecated `styleClass` input is not carried; classes come from the host binding.
4. PrimeNG's alias selectors `p-inputGroup` and `p-input-group` are not carried. Ultimate keeps one root selector.
5. `ptOptions` has no visible effect until the global `pt` source exists (ADR-080), so row 8 stays partial.

**Classification after this ticket** (C / P / M / I / N-A / N / U, from a source re-read of the 11 rows; the Phase 4 report is not edited, and nothing here is browser-verified).

- Angular 9 / 1 / 0 / 0 / 1 / 0. Open: row 8. Row 6 is N.
- Vue 9 / 1 / 0 / 0 / 1 / 0. Open: row 8. Row 6 is N.
- React: see ADR-094.

**Consequences.**

- A text input inside an InputGroup now gets the joined radius and border rules, and a focused field gets the focus stacking, in Angular and Vue.
- Angular buttons and masks in a group match PrimeNG's host-element rules.
- The InputGroup stories now use `u-inputtext`, so their browser baselines can change. They are not verified in a browser here.
- Tests cover the root and addon `pt`, `unstyled`, per-instance `dt` and attribute fall-through (Vue). They assert classes and DOM, not pixels.

## ADR-094 — InputGroup in React: `UInputGroup` and `UInputGroupAddon` over the shared stylesheet (L0a, ticket #194)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#194](https://github.com/majedsiefalnasr/ultimate-packages/issues/194)). User ruling: option A, React ships components.

**Context.**

- PrimeReact has no InputGroup component, only the `p-inputgroup` and `p-inputgroup-addon` CSS pattern. Angular and Vue ship components.
- The shared base CSS reaches React only through `useComponentStyle`, which a component calls. Without a component nothing registers the shared InputGroup rules.
- Ultimate's goal is one API and one architecture across Angular, React and Vue.

**Decision.**

1. **Two React components.** `UInputGroup` and `UInputGroupAddon` render a single root `div` each, with the root class, the remaining props, `ptm('root')` and a forwarded ref, in the shape of `UIconField`. `pt`, `ptOptions` and `unstyled` come from the base.
2. **One stylesheet.** `UInputGroup` registers `@ultimate/uix-styles/inputgroup` (ADR-082, ADR-093). `UInputGroupAddon` carries classes only, as in Angular and Vue.
3. **Entry point.** The package exports `@ultimate/react/input-group` and the barrel.

**Divergences from Prime.**

1. This is an Ultimate addition. PrimeReact has no component, so the React rows have no upstream source to copy; the provenance entries are `authored`.
2. Per-instance `dt` is not supported in React, as PrimeReact does not support it either.
3. `ptOptions` has no visible effect until the global `pt` source exists (ADR-080).

**Classification after this ticket** (C / P / M / I / N-A / N / U, from the Phase 4 report; the report is not edited, and nothing is browser-verified).

- React 3 / 0 / 0 / 0 / 8 / 0. Rows 1 to 3 move from M to C. Rows 4 to 11 stay N: PrimeReact has no component API to compare against.

**Consequences.**

- React users get the same grouped-field layout as Angular and Vue, from the same CSS, without writing `p-inputgroup` rules.
- The new React export is public API with no Prime counterpart, so it needs maintenance that PrimeReact users do not expect.
- Tests assert classes, DOM, `pt`, `unstyled` and the registered CSS, not pixels. The React stories are not browser-verified here.

## ADR-095 — InputMask: one shared mask engine and an attachable directive in Angular, composition and mobile guards in all three frameworks, InputText styling through the shared stylesheet, and `pt` and `unstyled` everywhere (L0a, ticket #190)

Status: Accepted (user approval confirmed 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#190](https://github.com/majedsiefalnasr/ultimate-packages/issues/190)). User rulings: Angular gets an attachable directive (1A); composition guards and the Android branch go into all three frameworks, tested with simulated events (2A).

**Context.**

- InputMask renders a masked text input. Prime's three implementations share one algorithm (jQuery maskedinput: `checkVal`, `shiftL`, `shiftR`, `seekNext`, `seekPrev`) and differ in what surrounds it.
- The Phase 4 report found the Ultimate ports far from Prime. Angular had no Escape, Enter, composition or mobile handling, no focus, blur or keydown outputs, no clear icon, no `keepBuffer`, and no directive form. React had no callbacks, no `pt`, no `unstyled` and no `size`. Vue repacked the whole input on every keystroke, so Backspace never shifted characters across a separator, and it did not render as an InputText.
- Two upstream React defects showed in the port: Delete removed nothing at a collapsed caret, and a controlled parent echoing an incomplete value let `autoClear` wipe the field while the user was still typing.
- The InputText stylesheet is shared (ADR-082, ADR-086). Each InputMask root is an InputText input, so the three frameworks should read the same Aura `inputtext` tokens.

**Decision.**

1. **Angular directive (ruling 1A).** `UInputMaskDirective` on `[uInputMask]` masks a native input without the component wrapper. The component and the directive both call one `InputMaskEngine`, which owns the DOM listeners and the buffer algorithm, so the two cannot drift. PrimeNG's directive selector is `[pInputMask]`; Ultimate's is `[uInputMask]` with `exportAs uInputMask`.
2. **Unprefixed pass-through names on the directive.** The directive uses `pt`, `ptOptions`, `unstyled` and `dt` inherited from the base, not PrimeNG's prefixed `pInputMaskPT` and `pInputMaskUnstyled` inputs. A directive that re-declared them as aliases failed typecheck against the base, and one set of names across the three frameworks is the goal.
3. **Composition and mobile guards in all three (ruling 2A).** Each port ignores `input` events while an IME composition is open and finalizes on `compositionend`, and each carries PrimeNG's Android Chrome branch. These paths are tested with simulated events in jsdom only. Real devices and real IME software are not verified, and the pull request says so.
4. **Paste is reformatted after the browser applies it.** Paste emits `paste` and the following `input` event reformats the value, instead of replacing the buffer from the clipboard text. This keeps the user's selection context.
5. **Escape and Enter.** Escape restores the value held at focus and Enter blurs, in all three, as upstream does.
6. **Angular surface added.** Inputs `keepBuffer`, `characterPattern`, `showClear`, `type`, `inputId`, `name`, `title`, `autocomplete`, `tabindex`, `ariaLabel`, `ariaLabelledBy`, `ariaRequired`, `required` and `autofocus`; outputs `onFocus`, `onBlur`, `onKeydown`, `onInput` and `onClear`; methods `focus()` and `clear()`; a `#clearicon` template with `UTimesIcon` as the default; `aria-invalid` on the input. A value written before the view exists is applied in `ngAfterViewInit`, and a changed `mask` re-initializes and reformats.
7. **React.**
   - **Surface:** `pt`, `ptOptions`, `unstyled`, `size`, `characterPattern` and `keepBuffer` are added, and native attributes spread onto the input. The caller's `onFocus`, `onBlur`, `onKeyDown`, `onKeyPress`, `onInput`, `onPaste`, `onCompositionStart` and `onCompositionEnd` are chained, not replaced.
   - **Style key:** the style registers under `inputtext`, with the shared module. ADR-067 says to keep `input-mask` and add `inputtext`, but react-core has no additional-keys support (ADR-078 left that to the family tickets). The root element is an InputText, so one registration under `inputtext` gives the same output without touching react-core. The pass-through name stays `inputmask`.
   - **Defects fixed:** Delete now removes the character at the caret, and the effect no longer re-applies a `value` that only echoes what the input already holds.
8. **Vue.** `InputMask.vue` renders a nested `UInputText`, as PrimeVue does, so the InputText classes, `size`, `variant`, `fluid`, `invalid` and `pt` apply, and `pt.pcInputText.root` reaches the input. The mask logic is a straight port of PrimeVue 4.5.5 with the changes listed under Divergences. `complete` keeps the earlier Ultimate payload `{ originalEvent, value }`.
9. **Names and classes.** The component name is `inputmask`, and the directive's is `inputmaskdirective`. The root class is `u-inputmask`. Ultimate keeps `u-input-mask` as the Angular component selector.
10. **Angular styles.** The Angular style module includes `@ultimate/uix-styles/inputtext` and the PrimeNG clear icon, fluid and `.ng-invalid.ng-dirty` rules, renamed to `u-input-mask`. `pcInputText` is a function that produces the InputText classes for the input.

**Divergences from Prime.**

1. The Angular directive is `[uInputMask]` and uses unprefixed pass-through names (decision 2).
2. Vue reads keys from `event.key`, not `event.code`, and ignores keypress for ctrl, alt and meta chords and non-character keys but lets shift through, so capitals are masked like other characters (PrimeVue ignores shift too).
3. Vue `caret()` writes a selection only while the input is focused and has no `offsetParent` guard on the read side, so the component can be tested in jsdom.
4. Vue and React paste handling follows decision 4. Vue `complete` carries `{ originalEvent, value }` where PrimeVue emits the bare event.
5. Vue without a `mask` behaves as a plain text input. An uncontrolled Vue instance also stores its own value so the next render does not re-apply a stale one.
6. Vue does not read `formField.onBlur`. Vue Forms is a separate spec, so row 23 stays M (R3).
7. React registers its style under `inputtext` (decision 7), and does not carry PrimeReact's `keyfilter`, `tooltip` and `validateOnly` props. They are composition (`useKeyFilter`, `UTooltip`) and are recorded as I, as in ADR-086.
8. The Angular NgModule wrapper is not carried, because ADR-019 is still Accepted, so row 25 is I.
9. Vue's `placeholder` is passed as given. The earlier Ultimate port defaulted it to the empty buffer, which PrimeVue does not do.
10. `ptOptions` has no visible effect until the global `pt` source exists (ADR-080), so row 27 stays P.

**Classification after this ticket** (C complete, P partial, M missing, I intentional, N/A not applicable; from a source re-read of the 27 rows; the Phase 4 report is not edited, and nothing here is browser-verified).

- **Angular:** C 21, P 3, I 1, N/A 2. Open: rows 19 and 20 (size, fluid, variant and visuals are tested as classes only) and row 27. Row 25 is I. Rows 23 and 24 are N/A.
- **React:** C 19, P 1, I 1, N/A 6. Open: row 27. Row 24 is I (composition, ADR-086). Rows 15 to 17, 23, 25 and 26 are N/A.
- **Vue:** C 20, P 1, M 1, N/A 5. Open: row 27 (P) and row 23 (M, Vue Forms). Rows 15 to 17, 24 and 25 are N/A.
- Rows 8 and 9 for Angular, React and Vue are C on simulated events only. They are not device-verified.

**Consequences.**

- Angular users can mask a native input with `[uInputMask]`, get the clear icon, `keepBuffer`, focus and blur outputs, and attach `pt`.
- Like PrimeNG, the Angular input stays empty until focus, so the earlier test that read the buffer before focus now focuses first, and the autoClear-on-blur assertion expects an empty string.
- Vue Backspace now shifts the remaining characters left across a separator, as PrimeVue does (`123-456` with the caret at 3 gives `124-56_`), where the earlier port cleared one slot.
- React and Vue render with the InputText classes, so the InputMask stories can change their browser baselines. They are not verified in a browser here.
- Tests assert values, classes, DOM, emitted events and pass-through. They do not measure pixels, real caret movement in a browser, or real IME and Android input.

## ADR-096 — TriStateCheckbox: React only, label-driven cycling, forwarded ARIA on the focusable box, localizable live-region labels, `pt` and `unstyled`, and `tooltip` stays composition (L0a, ticket #209)

Status: Accepted (user approval, 2026-11-24; gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#209](https://github.com/majedsiefalnasr/ultimate-packages/issues/209)). User rulings: Angular and Vue stay n/a, and the work is React only (1A); the live-region labels are props with English defaults (2A); `unstyled`, `variant` and `pt`/`ptOptions` are added in the same shape as the other L0a ports (3A); `tooltip` stays composition and is recorded as I (A).

**Context.**

- TriStateCheckbox is a control that cycles `null -> true -> false -> null`. Only PrimeReact 10.9.9 ships it. PrimeNG 21.1.9 and PrimeVue 4.5.5 do not, and their migration guidance points to an indeterminate Checkbox, which is not a three-value cycle. A check of `packages/ng`, `packages/vue`, `ng-core`, `vue-core` and `uix-styles` found no TriStateCheckbox in any of them.
- The Phase 4 report found `UTriStateCheckbox` complete on the cycle, the guards, the keyboard and the icons, and found 15 gap rows. The control was a plain function with no ref, no `pt`, no `unstyled`, no variant, no name, no focus callbacks and no custom icons. Its hidden input overlaid the root with no change handler, so a `<label htmlFor>` could not cycle it. `aria-invalid` sat on the hidden input instead of the focusable role, and the live-region text was hard-coded.

**Decision.**

1. **Angular and Vue stay n/a (ruling 1A).** Prime ships no such control there. A three-value control in either framework would be a separate ticket with its own design, and this ticket adds none.
2. **Label-driven cycling.** The hidden input now has the change handler, so a `<label htmlFor={inputId}>` cycles the value. The input ignores pointer events, so mouse clicks reach the box, and when the input receives focus (a label activation) it hands focus to the box. The box stays the only focusable element.
3. **ARIA on the focusable box.** Every `aria-*` prop goes on the `role="checkbox"` box, including `aria-label` and `aria-labelledby`, as PrimeReact does. `aria-invalid` moves there from the hidden input. The remaining props go on the root, so native attributes, `style`, `className` and `data-*` work.
4. **Live-region labels are props (ruling 2A).** `trueLabel`, `falseLabel` and `nullLabel` default to `True`, `False` and `Not Selected`, which are PrimeReact's English locale strings. The earlier hard-coded text (`true`, `false`, `none`) is replaced. React has no locale API in Ultimate, so the labels are plain props.
5. **Surface added.** `name`, `variant`, `onFocus`, `onBlur`, `autoFocus`, `checkIcon`, `uncheckIcon`, `style` and native attributes, plus a ref with `focus()` and `getElement()`. The change event now carries `stopPropagation`, `preventDefault` and `target {name, id, value}`.
6. **`pt`, `ptOptions` and `unstyled` (ruling 3A).** The sections are `root`, `box`, `input`, `srOnlyAria`, `checkIcon` and `uncheckIcon`, the names PrimeReact uses. The component is registered under `tristatecheckbox` (it was `tri-state-checkbox`), matching the pass-through name.
7. **Variant.** `variant="filled"` adds `p-variant-filled`, and a rule reads the Aura `checkbox.filled.background` token.
8. **`tooltip` is composition.** Callers wrap the control in `UTooltip`. PrimeReact's `tooltip` and `tooltipOptions` props are not carried, as `tooltip` is not for InputText (ADR-086) and InputMask (ADR-095).
9. **`aria-checked` stays `mixed` for `null`** (user ruling of 2026-11-19). PrimeReact reports `false`, which loses the third state, and that is recorded as a reference defect.

**Divergences from Prime.**

1. `tooltip` and `tooltipOptions` are not props (decision 8), so row 15 is I.
2. PrimeReact's input overlays the box and takes mouse clicks. Here the input ignores pointer events and the box takes them (decision 2). The result for the user is the same, and the box is the only tab stop.
3. Keyboard handling reads `event.code` (`Enter`, `NumpadEnter`, `Space`) as PrimeReact does. The earlier port also accepted `event.key`, and that fallback is gone, so a synthetic event with only `key` no longer cycles.
4. The live-region labels are props with English defaults, where PrimeReact reads them from its locale (decision 4).
5. `checkIcon` and `uncheckIcon` are `ReactNode`. PrimeReact's `IconUtils` also takes a function or a class string. `UCheckIcon` and `UTimesIcon` accept only a class name, so `pt.checkIcon` and `pt.uncheckIcon` reach the default icons through their class name only.
6. The root does not carry `p-highlight` for a non-null value, because no Ultimate rule reads it.
7. The root carries `data-p-disabled` only while disabled (PrimeReact writes the attribute with a boolean value).
8. `ptOptions` has no visible effect until the global `pt` source exists (ADR-080), so row 21 stays P.
9. There is no global `inputStyle` fallback for `variant`, because Ultimate's config has no such setting, so row 12 stays P.

**Classification after this ticket** (C complete, P partial, M missing, I intentional, N/A not applicable; from a source re-read of the 21 rows; the Phase 4 report is not edited, and nothing here is browser-verified).

- **React:** C 17, P 2, I 1, N/A 1. Open: row 12 (P, no global `inputStyle`) and row 21 (P, ADR-080). Row 15 is I. Row 20 is N/A (PrimeReact has no scoped `dt`). Row 5 is C on a jsdom label click; pointer hit-testing is not browser-verified.
- **Angular:** N/A 21.
- **Vue:** N/A 21.

**Consequences.**

- A `<label htmlFor>` now cycles the control, and a caller can read `event.target.name` and `event.target.id`.
- Assistive technology sees `aria-label`, `aria-labelledby` and `aria-invalid` on the same element that holds the role and the focus.
- Callers that relied on the old live-region text `true`, `false` or `none` see `True`, `False` or `Not Selected`, or set the three label props.
- Callers that passed only `event.key` in a test must pass `code` too.
- Tests assert values, classes, DOM, events and pass-through in jsdom. They do not measure pixels, real pointer hit-testing or screen-reader output.

## ADR-099 — MultiStateCheckbox: React only, a `role="checkbox"` box with a live region, no synthetic change on mount, upstream's event shape, and `pt` and `unstyled` (L0a, ticket #208)

Status: Proposed for user approval in the PR (gap-closing spec [#167](https://github.com/majedsiefalnasr/ultimate-packages/issues/167), Stage 2 layer L0a, ticket [#208](https://github.com/majedsiefalnasr/ultimate-packages/issues/208)). User rulings: Angular and Vue stay n/a, and the work is React only (Q10 A); the mount behaviour stays as it is and is recorded as intentional (Q11 B); the control exposes `role="checkbox"` with a live region and an accessible name (Q12 A); the surface adds `autoFocus`, a ref with `focus()` and `getElement()`, `invalid`, `variant`, `style`, `unstyled`, `pt` and `ptOptions`, and `tooltip` stays composition (Q13 A).

**Context.**

- MultiStateCheckbox cycles a value through a list of `options`. Only PrimeReact 10.9.9 ships it. PrimeNG 21.1.9 and PrimeVue 4.5.5 do not, so Angular and Vue have no component and no entry.
- The Phase 4 report found `UMultiStateCheckbox` complete on the cycle, the `empty` wrap, the guards and Space, and found 26 rows. The control was a plain function with `role="button"`, no checked state, no live region, no ref, no `pt`, no `unstyled`, no `invalid` or `variant`, and a hard-coded `none` label.

**Decision.**

1. **Angular and Vue stay n/a (Q10 A).** Prime ships no such control there, and this ticket adds none. The PR body states it.
2. **`role="checkbox"` box (Q12 A).** The focusable box carries `role="checkbox"`, `aria-checked` (`true` when an option is selected, `false` otherwise), `aria-invalid`, `aria-disabled` and `aria-readonly` where they apply. Its accessible name is the selected option's label, or `nullLabel` when nothing is selected. A caller's `aria-*` props go on the box and replace those defaults, as PrimeReact forwards them.
3. **Live region.** A polite span announces the same text. PrimeReact renders it only while the control has focus. Here it is always rendered, as in TriStateCheckbox (ADR-096).
4. **`nullLabel` is a prop** with the English default `Not Selected`, PrimeReact's locale string. It replaces the hard-coded `none`.
5. **No synthetic change on mount (Q11 B).** PrimeReact calls `onChange` once on mount when `empty` is false and the value is null. The control stays fully controlled and does not. The caller sets a non-null initial `value`. Row 3 is I.
6. **Event shape.** The change event carries `stopPropagation`, `preventDefault` and `target {name, id, value}`, as PrimeReact does.
7. **Guards.** `disabled` and `readOnly` block both click and Space. PrimeReact's Space handler ignores `readOnly`, which is recorded as a reference defect and not carried.
8. **Surface added (Q13 A).** `onFocus`, `onBlur`, `name`, `autoFocus`, `invalid`, `variant` (`filled` adds `p-variant-filled`, and a rule reads the Aura `checkbox.filled.background` token), `style` and native attributes on the root, and a ref with `focus()` and `getElement()`.
9. **`pt`, `ptOptions` and `unstyled`.** The sections are `root`, `box`, `icon` and `srOnlyAria`. The component is registered under `multistatecheckbox` (it was `multi-state-checkbox`), matching the pass-through name. The icon wrapper span is rendered only when an option icon is shown.
10. **`tooltip` is composition.** Callers wrap the control in `UTooltip`, as for InputText (ADR-086), InputMask (ADR-095) and TriStateCheckbox (ADR-096). Row 20 is I.
11. **Colours stay hand-authored** (ADR-067(c)), with the filled background read from the Aura token. The cursor moved from the root to the box.

**Divergences from Prime.**

1. No synthetic `onChange` on mount (decision 5), so row 3 is I.
2. `tooltip` and `tooltipOptions` are not props (decision 10), so row 20 is I.
3. PrimeReact nests a real `<Checkbox>` with a native input. Here the box is the only focusable element and there is no hidden input, so `inputId` is not carried.
4. `optionIcon` stays a function `(option) => ReactNode`. PrimeReact's `optionIcon` is a field name and `iconTemplate` is a separate prop. The function receives only the option.
5. `optionValue` and `optionLabel` resolve top-level properties only. PrimeReact resolves dotted paths. Equality is strict `===`, and PrimeReact's `dataKey` deep comparison is not carried. Rows 4 and 5 stay P.
6. A per-option `style` is not applied to the box (row 8 stays M). `style` is the root's, as PrimeReact's `style` is.
7. The live region is always rendered (decision 3).
8. `ptOptions` has no visible effect until the global `pt` source exists (ADR-080), so row 22a stays P.
9. The CSS adds invalid and filled rules but still has no hover, focus-visible or checked rules, so row 24 stays P.

**Classification after this ticket** (C complete, P partial, M missing, I intentional, N/A not applicable; from a source re-read of the 26 rows; the Phase 4 report is not edited, and nothing here is browser-verified).

- **React:** C 17, P 5, M 1, I 2, N/A 1. Open: rows 4 and 5 (P), 8 (M), 21 (P, no `inputId`), 22a (P, ADR-080) and 24 (P). Rows 3 and 20 are I. Row 23a is N/A (PrimeReact has no scoped `dt`).
- **Angular:** N/A 26.
- **Vue:** N/A 26.

**Consequences.**

- Assistive technology sees a checkbox with a checked state, a name and a live announcement, instead of a button with a fixed label.
- Callers that queried `getByRole("button")` use `getByRole("checkbox")`, and callers that read the `none` label see `Not Selected` or set `nullLabel`.
- `onChange` is now optional, and callers can read `event.target.name` and `event.target.id`.
- Tests assert values, classes, DOM, events and pass-through in jsdom. They do not measure pixels, focus rings or screen-reader output.
