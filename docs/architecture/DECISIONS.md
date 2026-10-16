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

Status: Accepted (Phase 1 spec, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`). The four pinned `@primeuix/*` npm tarballs ship only compiled dist output (`.mjs`/`.d.mts`), no `src/` directory, and the upstream `primefaces/primeuix` GitHub repository's history never reached these exact pinned versions (confirmed gap, Phase 0 Finding 3). Investigation found that every pinned tarball's published `.mjs.map` sourcemaps embed a complete `sourcesContent` array — the original per-file TypeScript source at the exact pinned MIT baseline. `scripts/provenance/extract-source.mjs` recovers this source deterministically from the same checksummed tarballs Phase 0 already pinned (`docs/architecture/checksums.json`), with no network access required at extraction time. This is the official Phase 1+ vendoring mechanism for these four packages.

## ADR-017 — `uix-styles` Phase 1 scope is the `base` module only

Status: Accepted (Phase 1 spec). `@primeuix/styles@2.0.3` ships a `base` module (global/framework-level CSS: box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation) alongside ~90 per-component style modules (button, dialog, datatable, etc.). Phase 1 incorporates only `base` — the ~90 per-component modules are component styles, not shared infrastructure, and Phase 1's explicit non-goal is "do not migrate framework components." Each per-component module migrates alongside its owning component during Phase 2 (Angular), Phase 3 (React), or Phase 4 (Vue). A scope-guard test (`packages/uix-styles/test/scope-guard.test.ts`) enforces this boundary in CI.

## ADR-018 — Option B: Ultimate-owned Angular base-class architecture

Status: Accepted (Phase 2 spec, confirmed by implementation). `ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy is independently authored, informed by but not copied from PrimeNG's `BaseComponent`/`BaseEditableHolder` — notably, PrimeNG's full passthrough (`pt`/`ptOptions`/`ptm`/`ptms`/`ptmo`) system, its `$parentInstance` DI-token lookup, and its full global-config surface are excluded from Phase 2's `UBaseComponent`/`UltimateConfig`, which cover only DI wiring (document/platformId/el/renderer/config), lifecycle, the `dt`/`unstyled` input pair, a `cx()` class-name-slot resolver, and `@ultimate/uix-styled`-backed style registration. This scoping held up across all 5 built components: each component's own provenance entry (`docs/architecture/provenance/ng.json`) documents deliberately excluding passthrough/DI-token-lookup call sites it would otherwise need to port (e.g. Button's badge/Fluid ancestor-detection wiring, Dialog's breakpoint passthrough). Revisit passthrough support only if a later-phase component creates real duplicate-pattern pressure (spec: DEFER, Needs Architecture Decision).

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

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's real `Dialog.js` supports draggable/resizable/maximizable behavior — a materially larger feature surface than Angular's already-shipped `UDialog`, which has none of these. Phase 3's `UDialog` deliberately does not include them: no such props exist on `UDialogProps`, no drag/resize handlers are wired, no maximize-toggle UI is rendered. Not an oversight — a firm, explicitly-scoped boundary (spec §15), with a dedicated negative regression test (`packages/react/src/dialog/dialog.spec.tsx`) guarding against silent scope creep. Revisit only via a separately approved future scope decision.

## ADR-031 — `URipple` is not built in Phase 3

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's `Button`/`Dialog`/`Menu` all import and render `Ripple` upstream. Phase 3's `UButton`/`UDialog`/`UMenu` render without a ripple effect — `URipple` is not a Phase 3 proof-set component, and no ad-hoc ripple implementation was folded into any individual component. Matches Angular's own Phase 2 precedent exactly: `URipple` was built as its own standalone primitive (`packages/ng/src/ripple`), not embedded per-component. A future `URipple` for React, if built, gets its own scope, provenance, and tests — not inherited from this phase.

## ADR-032 — Option B: Ultimate-owned Vue base architecture (Options-API `extends` mixin)

Status: Accepted (Phase 4 spec, confirmed by implementation). `vue-core`'s `createBaseComponent`/`createBaseEditableHolder`/`createBaseInput` are independently authored, informed by but not copied from PrimeVue's real `BaseComponent.vue`/`BaseEditableHolder.vue`/`BaseInput.vue` — the full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough system (~140 lines of nested-key resolution, two separate implementations for the component-mixin and directive-factory mechanisms) and `inject: { $parentInstance }` host-instance lookup are excluded from Phase 4's base, matching the same YAGNI posture ADR-018/024 established for Angular/React. Authoring style is Options-API `extends` mixin chains, not Composition-API composables — a genuine architectural fork resolved during Phase 4's research/brainstorming gate (chosen because it mirrors verified PrimeVue's own `BaseComponent.vue` mechanism most literally).

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

Status: Accepted (Phase 4 spec, confirmed by implementation, resolved fork — Gate 6 #2). Verified PrimeVue's real `BaseEditableHolder.vue` has a live, working integration with a separate PrimeVue package, `@primevue/forms` (`inject: { $pcForm, $pcFormField }`, `formField.onChange`, `$formNovalidate`/`$formValue`/`$formDefaultValue`/`$formControl`). Unlike Phase 3's equivalent Checkbox-forms decision (where PrimeReact genuinely has no broader form abstraction to exclude — nothing existed to cut), this is a deliberate boundary cut of a real, verified, functioning upstream feature. `@primevue/forms` remains unpinned, unevaluated, with no provenance record — incorporating it is deferred to its own future evidence-based evaluation (pinning its real source, running its own Real-Source Verification Gate), not silently absorbed into Phase 4 because `UCheckbox` happened to touch its edge.

## ADR-040 — `UDialog` excludes draggable and maximizable behavior despite verified upstream support; resizable was never a PrimeVue Dialog feature at all

Status: Accepted (Phase 4 spec, confirmed by implementation, resolved fork — this Phase's architecture-approval gate). Verified PrimeVue's real `Dialog.vue` implements both draggable (full mouse-drag positioning with `keepInViewport` bounds-checking) and maximizable (maximize/unmaximize state, icon swap, scroll-lock toggling) as first-class features — a materially larger feature surface than Angular's or React's already-shipped `UDialog`, neither of which has either. Resizable, unlike PrimeReact's Dialog (which has all three: draggable/resizable/maximizable, explicitly excluded per ADR-030), was never found as a feature anywhere in PrimeVue's real `Dialog.vue` source at all — nothing to exclude there, a genuinely different upstream feature surface than React's reference. Phase 4's `UDialog` excludes draggable and maximizable to keep scope identical across all three frameworks — no such props, handlers, or UI anywhere in the implementation.

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

## ADR-049 — Vue component prop types flow from inferred typed factories; type-only typing; contract-based nullability

Status: Accepted (user decision, 2026-10-03, GAP-082 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md`.

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

Status: Accepted (user decision, 2026-10-04, GAP-083 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-04-gap-083-vue-floor-compat-research.md`.

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

Status: Accepted (user decision, 2026-10-04, GAP-064 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-04-gap-064-aura-token-wiring-research.md`.

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

## ADR-052 — GAP-064 cross-tranche parity rules for the remaining G3 tranches (selector reachability, DOM admissibility, state selectors, runtime roles, open-state screenshots, tranche CI evidence)

Status: Accepted (user decisions, 2026-10-06, GAP-064 cross-tranche decision gate and C2-0 Spec Review). Evidence: `docs/architecture/research/2026-10-06-gap-064-cross-tranche-study.md` (§2–§5 evidence; §10 rulings; §11 amendments). This ADR is the normative record of those rulings. The study is their evidence and history, not the authority. The rule text below is transcribed from the approved rulings without change of substance; X-12 is given in its §11-corrected form.

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

Status: Accepted (user decision, 2026-10-11, completion-assessment Architecture Discussion). Evidence: `docs/architecture/research/2026-10-11-s5-accessibility-acceptance-research.md`.

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
- **Approved dispositions:** fix the 7 `svg-img-alt` rows, the 3 Scroller `scrollable-region-focusable` rows, and GAP-114, GAP-115 and GAP-122. GAP-103 and GAP-104 are fixed or become explicitly approved exceptions. GAP-116 may be recorded as an intended-divergence exception, effective only once entered in the approved exception register (entered 2026-10-11 as `BLUEPRINT_GAPS.md` §10 EX-3).
- **Contrast rows:** the 29 rows earlier approved as Aura parity exceptions (11 on 2026-10-04, 18 on 2026-10-06) are **candidates only**. Each must meet AC-3a and receive explicit publish-level approval. The 5 Button contrast rows are tested against AC-3a independently.
- **AC-8 (high contrast, RTL):** a research spike is authorized. Both stay unresolved §40 items until a decision follows the evidence; missing evidence is not an accepted exception.

**Not decided here.** The X-8 (b) scan-race fix was already decided and merged (`802f341`, merged at `b290919`); this ADR records only X-8 (a). The other ADR-052 proposals (X-5, X-7, X-9, X-10, X-11) stay undecided.

**Consequences.**

- `ACCESSIBILITY_BASELINE.md` rows leave the baseline only by real scans (its one-way-door contract is unchanged).
- The required fixes and the approved dispositions each need their own Specs and normal approval gates.
- Publish exceptions live in the exception register (gate G14), `BLUEPRINT_GAPS.md` §10, one row per approved exception.

## ADR-054 — Tree-family components are implementation-eligible as framework-native components

Status: Accepted (user decision, 2026-10-11, K-7 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-11-k7-tree-family-architecture-research.md`.

**Context.** ADR-043 excludes Tree-family identity/selection/expansion from any shared contract and states the components remain framework-native. GAP-013 and DECISION-D's 2026-09-21 OrganizationChart clarification (`BLUEPRINT_GAPS.md`) nevertheless recorded the four components, or Angular OrganizationChart, as blocked or excluded from implementation. The 2026-10-11 scope ruling includes all remaining inventory areas. Re-verification against the pinned PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5 sources confirmed the divergent state models ADR-043 recorded. React and Vue OrganizationChart already ship with framework-local node types (G3-E, `dd4c963`).

**Decision.**

> Tree, TreeTable, TreeSelect and Angular OrganizationChart are implementation-eligible as framework-native components, each following its framework's upstream state model with framework-local types. ADR-043's exclusion of a shared hierarchical contract and DECISION-D's protection of that question remain unchanged.

- Build order: Tree, then TreeSelect, then TreeTable, then Angular OrganizationChart. TreeTable's dependencies are addressed by its Spec.

**Rejected.** A shared hierarchical contract in `uix-data` (reopens DECISION-D without new evidence); a shared type-only `TreeNode` (Angular's node type carries the contested state fields).

**Consequences.**

- No shared Tree type or contract enters any `uix-*` package.
- If implementation surfaces genuine shared semantics, it is recorded as new evidence for DECISION-D and not acted on inside the implementation.
- Each component goes through its own Spec, Spec Review, Plan and Plan Review. This ADR authorizes no implementation.

## ADR-055 — External runtime dependency approval policy (DECISION-B); `chart.js` and `quill` approved as optional peers

Status: Accepted (user decision, 2026-10-11, K-8 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-11-k8-decision-b-external-dependency-policy-research.md`. Does not amend ADR-004 or ADR-005.

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

Status: Accepted (user decision, 2026-10-11, K-9 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-11-k9-config-passthrough-api-research.md`.

**Context.** The remaining inventory lists `config` (full surface), `passthrough`, `api` (remaining surface) and the remaining icons. GAP-021 and ADR-018, ADR-024 and ADR-032 defer `config` and `passthrough` until real duplicate-pattern pressure. Research found that every upstream use in the components still to build maps to an established per-component Ultimate pattern, and that shipped components contain no passthrough usage.

**Decision.**

- Option N: no new `config`, `passthrough` or shared `api` surface is needed for the approved scope. GAP-021 and ADR-018, ADR-024 and ADR-032 are unchanged.
- Remaining icons are in scope on a need-driven basis: those required by in-scope components, not every remaining upstream icon.
- No new i18n/translation requirement is introduced; no current source requires one.

**Consequences.**

- In-scope component Specs follow the per-component precedents: English-default label inputs, `variant` through the base input tier, framework-local node types, and framework-native filtering and drag/drop.
- `COMPONENT_INVENTORY.md` records the outcome for the cross-cutting rows.

## ADR-057 — Performance benchmarks: Stage 1 protocol and P1–P8 measurement methods

Status: Accepted (user decision, 2026-10-11, S-4 Architecture Discussion). Evidence: `docs/architecture/research/2026-10-11-s4-performance-stage1-methods-research.md`.

**Context.** Blueprint §31 requires established benchmarks. The user ruled all of P1–P8 in scope with two stages: Stage 1 records baselines; Stage 2 adds gates only where measured evidence supports them.

**Decision.**

- The common protocol and the P1–P8 methods in the evidence record are adopted: recorded identity and environment, production builds, warm-up and repeated runs, median/p95/interquartile range and variance statistics, same-commit run-to-run differences, and deterministic proxy metrics first. The suggested warm-up, run and iteration counts are starting values for the variance study, not requirements.
- The playground applications are the benchmark harness, within the authorized scope of the work.
- **Environment of record:** the pinned Playwright CI environment, with runner architecture and type recorded. Local Docker runs may supplement, never replace, CI evidence.
- **No timing threshold is approved.** A Stage 2 threshold needs measured same-commit noise and a separate decision per category. The existing 15% bundle-size gate (P1) is unchanged.

**Consequences.** Next is a Spec for the measurement harness and baseline recording. P8 for React and Vue depends on GAP-088.

## ADR-058 — CLI quality and documented-API evidence bars for the first pre-1.0 publish

Status: Accepted (user decision, 2026-10-11, completion-assessment Architecture Discussion). Evidence: `docs/architecture/research/2026-10-11-cli-quality-and-api-docs-evidence-research.md`.

**Context.** The user ruled that every Blueprint §40 criterion, including CLI quality and documented APIs, applies to the first pre-1.0 publish, but no source gave a measurable bar. Code inspection found that `@ultimate/cli` and `@ultimate/mcp` read the compatibility manifest from the monorepo root, which an installed package does not contain (GAP-131).

**Decision.**

- **CLI bar CLI-1 to CLI-6:** unit tests per command and documented error exit; installed-package smoke tests for the CLI per framework fixture; an installed-package smoke test for MCP; every Blueprint §19 duty implemented or an approved exception; smoke tests with pnpm and npm at minimum; `--help` and README list every command, its arguments and exit codes. Installed-package CLI and MCP smoke tests are **required evidence**; the current pack/install check is insufficient because it never runs the published binaries.
- **Approved first pre-1.0 publish exceptions:** the deferred `create` command and the `ai` stub. Neither is represented as implemented. They are entered in the exception register (gate G14), `BLUEPRINT_GAPS.md` §10 (EX-1, EX-2).
- **GAP-131 is not covered by any exception:** it must be resolved before the CLI or MCP packages are published to consumers.
- **Documented-API bar DOC-1 to DOC-5:** populated `api`, `accessibility` and `guidance` metadata for every in-scope shipped component and framework; an automated metadata-versus-API drift check; a generated API reference; story coverage of documented states; README validation.
- **Generated API reference destination:** Storybook docs pages initially (consistent with ADR-044), kept composable with authored guidance.

**Consequences.** CLI packaging and smoke-test work, and the metadata drift check and generated reference, each go through their own Spec and Plan gates; the documentation work is sequenced with the metadata coverage work.

## ADR-059 — Node 24.15.0 baseline for the private workspace and release toolchain (GAP-087)

Status: Accepted (user-authorized GAP-087 research, verification and Node.js support-policy decision gates, 2026-10-14). Evidence: `docs/architecture/research/2026-10-14-gap-087-node-policy-research.md`.

**Context.** Remote `main` at `9ea303df` runs CI on Node `24.15.0` but all three Release jobs on Node 20. [Release run 38531782252](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38531782252) failed at Select mode → Install dependencies: strict pnpm engine checking rejected Node `v20.20.2` for locked `@angular-devkit/architect@0.2201.7`, which requires `^22.22.3 || ^24.15.0 || >=26.0.0`. The private root's `engines.node: ">=20.0.0"` also admits versions that the workspace cannot install. CI's frozen install has passed on the pinned 24.15.0 baseline. Earlier release specifications and ADRs do not establish a binding Node support range.

**Decision.**

- The **private workspace toolchain** supports Node 24 from `24.15.0` through the remainder of major 24. Express this as root `engines.node: "^24.15.0"`, retaining `engine-strict=true` and the existing `pnpm@9.6.0` package-manager pin.
- Use Node `24.15.0` as the pinned execution baseline for local development guidance, CI, and **each** Release job. The existing CI pin establishes the verified baseline; a later patch release within the declared range is permitted but is not claimed as individually verified by this decision.
- This decision is about installing and operating the complete repository workspace. It makes no claim about a published package's consumer Node runtime range and does not change any package-specific consumer contract.

**Trade-off.** The locked Angular devkit also permits sufficiently recent Node 22 and Node 26+, but this repository currently verifies the complete workspace on 24.15.0 only. A single supported major avoids advertising untested major versions. Merely raising Release's Node pin would leave the private root's `>=20.0.0` declaration inconsistent with strict installation.

**Consequences.** GAP-087 stays open until a separately authorized Specification, Spec Review, Plan, Plan Review, implementation and verification align the root engine declaration and all Release jobs, then verify the frozen install and reached release path. C01 stays incomplete. No CI exception is created. Version and Publish remain unexercised in the cited failed Release run.

## ADR-061 — Provenance PR diff enforcement follows source incorporation

Status: Accepted (user PR #16 Architecture Discussion decision, 2026-10-14). Evidence: the approved Phase 0 Specification's Git/GitHub and CI requirements; `scripts/provenance/validate-provenance.mjs`; [PR #16 CI run 38615301042](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38615301042) at head `65c2345c`; [main baseline run 38555038184](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38555038184) at `94fac002`.

**Context.** Phase 0 requires a `PROVENANCE.md` update for a PR that incorporates Prime-derived source under the watched package paths. The current validator triggers its same-diff requirement for any path beginning `packages/uix`, `packages/ng`, `packages/react`, or `packages/vue`. This path-only rule is not undocumented implementation drift: the approved Phase 0 Implementation Plan's validator task (`docs/superpowers/plans/2026-08-28-phase-0-repository-foundation.md`) specified it without the Specification's source-incorporation qualifier, and the validator's diff check implements that Plan task as written. The conflict is between that Plan task and the Phase 0 Specification's source-incorporation requirement. PR #16 changes React/Vue coverage configuration, incorporates no Prime-derived source, and therefore fails this broader path-only check without a corresponding source-lineage change. The baseline run reaches a separate missing `ng.json` manifest entry; correcting the diff check does not establish repository-wide provenance completeness.

**Decision.** Correct the PR-diff enforcement to reflect the Phase 0 source-incorporation requirement in separately scoped provenance-validator work. Keep the positive requirement for an incorporating-source PR, preserve truthful provenance records and fail-closed Git-diff handling, and retain the independent heading and manifest-completeness checks. Do not add a `PROVENANCE.md` edit merely to make a configuration-only PR pass. Keep GAP-091 PR #16's approved four-file scope unchanged. This decision supersedes the Phase 0 Plan validator task's path-only same-diff rule; the Phase 0 Specification's source-incorporation requirement governs.

**Trade-off.** A path-only rule is simple but over-requires lineage updates for package configuration changes. Source-aware enforcement needs an explicit, tested boundary so it does not miss newly incorporated Prime-derived source. The subsequent provenance Specification must define that boundary and positive and negative cases before implementation.

**Consequences.** This decision does not authorize a validator edit, a GAP-091 scope amendment, a CI exception, or a PR merge. The separate provenance work follows its own Specification, review, Plan, review, implementation and verification gates. C04's existing GAP-094 manifest-scope problem and GAP-093 vendor-archive failures remain independently open; GAP-091 and C01 retain their current status.

## ADR-062 — Provenance manifest scope is production (distributed) source (DR-5)

Status: Accepted (user decision DR-5 Option B, 2026-10-15). Evidence: [`research/2026-10-15-gap-094-dr5-provenance-scope-options.md`](research/2026-10-15-gap-094-dr5-provenance-scope-options.md); [GAP-094](BLUEPRINT_GAPS.md#gap-094--provenancevalidate-fails-on-a-missing-manifest-entry); the approved Phase 0 Specification's "every Prime-derived source area incorporated" requirement; the Phase 1/2 Specifications' and Phase 3/4 Plans' "every `.ts`/`.tsx`/`.vue` file under `src/`" validator rule.

**Context.** The approved documents contain two scopes for the file-level provenance manifests: one entry per _incorporated_ source file (Phase 0, Phase 1 manifest bullet), and an entry for _every_ `.ts`/`.tsx`/`.vue` file under each watched package's `src/` (the Phase 1–4 validator rule, which `validate-provenance.mjs` implements). At `main` `ccb97d68`, 1163 of 1915 watched files have no entry. Of those, 467 are test and story files and 696 are files that reach the published packages.

**Decision.** The file-level manifests cover **production source**: every watched `src/` file that the package's own build distributes, either in its JavaScript output or in its declaration output. A file is excluded only when repository build evidence shows it is in neither, not because of its name or extension alone. Classification fails closed: when the build cannot be modelled, either every file of that package is treated as production or the validator reports a failure. This supersedes the Phase 1–4 "every file under `src/`" validator rule; the Phase 0 provenance purpose governs. Existing entries for excluded files stay valid and are not required. Every new or backfilled entry carries a truthful classification backed by per-file evidence.

**Trade-off.** Tests and stories, which do not ship, lose their mandatory lineage record. In return the rule follows the licensing purpose and the backfill focuses on distributed code. Determining production status from build configuration needs an explicit, tested classifier that fails closed. A filename pattern alone would be simpler, but it is not evidence.

**Consequences.** The GAP-094 Specification defines the classifier, a report-all validator mode, the per-file evidence method and backfill batching. Each step goes through its own review gates. `provenance:validate` stays red until the last backfill batch merges. No CI exception is granted. ADR-052 X-12 rule (2), changed-file completeness, now applies to the production files a tranche changes. Its rule (1), which expects the repository-wide validator to stay red, lapses once GAP-094 is resolved.

## ADR-063 — Ultimate-scoped `border-box` base layer, registered per component through each framework core (GAP-098)

Status: Accepted (user decision GAP-098 Option B, 2026-10-15). Evidence: [`research/2026-10-15-gap-098-box-model-options.md`](research/2026-10-15-gap-098-box-model-options.md); [GAP-097](BLUEPRINT_GAPS.md#gap-097--drawer-sizing-under-content-box-content-overflow-and-a-full-drawer-taller-than-the-viewport) and [GAP-098](BLUEPRINT_GAPS.md#gap-098--primes-global-base-style-box-sizing-border-box-is-not-applied-in-ultimate); `@primeuix/styles` 2.0.3 `base` (`*, ::before, ::after { box-sizing: border-box }`); PrimeReact 10.9.9 `components/lib/componentbase/ComponentBase.js` (`.p-component, .p-component * { box-sizing: border-box }` in `@layer primereact`); the user ruling of 2026-10-08 that excludes Prime's page-wide `*` rule.

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

Status: Accepted (user decision, Option B, 2026-10-16). Evidence: [`research/2026-10-16-gap-094-provenance-classification-semantics.md`](research/2026-10-16-gap-094-provenance-classification-semantics.md); [GAP-094](BLUEPRINT_GAPS.md#gap-094--provenancevalidate-fails-on-a-missing-manifest-entry); [ADR-062](#adr-062--provenance-manifest-scope-is-production-distributed-source-dr-5); Blueprint §2.3 and §8.

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
6. **Existing entries are not edited, migrated or reclassified**, including GAP-094 backfill batch 1. Their inconsistencies are recorded as [GAP-132](BLUEPRINT_GAPS.md#gap-132--legacy-provenance-manifest-entries-use-undefined-or-inconsistent-classifications) for separate authorization.

This decision supersedes the Phase 1 and Phase 2 Specification vocabularies for new entries; those Specifications carry a note pointing here. It also overrides, for any new entry, the G3 Specifications' fixed `reference-derived` ("Ported (Option B — reference, not verbatim copy)") wording: a future ported style module is COPY with sub-label `adapted`. It amends the GAP-094 Specification §3.4 (Amendment A1).

**Trade-off.** The class is decidable from evidence and matches the Blueprint's traceability purpose without migrating 793 merged entries. The cost is that existing entries remain inconsistent until GAP-132 is separately authorized. Over-attribution under the ambiguity rule is accepted, because every package that carries upstream code already ships the upstream MIT notice.

**Consequences.**

- Each GAP-094 backfill batch records a class per file and uses only the matrix's values.
- Reviewers check the class against the comparison, not against file role or name.
- A future enforcement step can read the class from the evidence records or adopt a schema field through its own decision.

## ADR-065 — Limited exception: two pre-existing React stylesheets retain PrimeReact theme CSS values outside `components/lib`

Status: Accepted (user decision, Option 2 of the GAP-132 deviation report under Blueprint §37, 2026-10-16). Evidence: [batch 2 evidence record, Correction section](research/2026-10-16-gap-094-backfill-batch-2-evidence.md#correction-under-gap-132-2026-10-16); [GAP-132](BLUEPRINT_GAPS.md#gap-132--legacy-provenance-manifest-entries-use-undefined-or-inconsistent-classifications); PR #28 (merge `d21933be`).

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
