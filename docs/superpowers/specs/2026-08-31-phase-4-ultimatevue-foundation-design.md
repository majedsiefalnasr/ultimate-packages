# Phase 4 — UltimateVue Foundation

Status: **APPROVED** (spec, 2026-08-31, after Real-Source Verification review round closing all flagged gaps). Package structure/base architecture/proof-set decisions were made after a mandatory Real-Source Verification Gate — every architectural decision below is backed by direct inspection of the pinned PrimeVue `4.5.5` tarball (commit `66dde6788220fc9e6822342919d1ceb0e3460ece`), not documentation, memory, or Angular/React-translated assumptions. See `docs/architecture/PROVENANCE.md` and `docs/architecture/checksums.json` for the pinned baseline. Ready for the Implementation Plan gate.

## Context

Phase 0 (repository foundation, provenance), Phase 1 (`@ultimate/uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`), Phase 2 (`@ultimate/ng-core`, `@ultimate/ng` — Button, Checkbox, Dialog, Menu, Tooltip, plus Ripple/AutoFocus/Fluid/Badge/Bind primitives), and Phase 3 (`@ultimate/react-core`, `@ultimate/react` — same five-component proof set) are complete and closed. Phase 4 builds UltimateVue on top of the same framework-neutral UIX foundation, using PrimeVue `4.5.5` (MIT, verified) as the implementation/behavior reference, per Blueprint §7/§9 and ADR-005.

`packages/vue` and `packages/vue-core` exist today only as Phase 0 scaffolding (`.gitkeep` in `vue-core`, a `THIRD-PARTY-NOTICES.md` stub naming `primevue@4.5.5` in `vue`) — no Phase 4 implementation exists yet.

Blueprint §7 and this repository's own `docs/architecture/PROVENANCE.md`/`checksums.json` agree exactly on `4.5.5` / `66dde6788220fc9e6822342919d1ceb0e3460ece` — unlike Phase 3, there is no version-string deviation to record here.

## Objective

Establish an Ultimate-owned, Vue-native component framework using PrimeVue 4.5.5 as the proven implementation/behavior reference. Not a port of PrimeVue to Vue — an Ultimate architecture informed by verified PrimeVue behavior, reusing Phase 1's framework-neutral UIX infrastructure wherever it already covers the need, and reusing Phase 3's already-built framework-neutral *logic* (Escape priority algorithm, scroll-lock refcounting) where evidence shows PrimeVue's own real upstream mechanism has a gap React's already closed.

## Provenance discipline used throughout this document

Every architectural claim below is labeled as one of:

- **Verified source behavior** — read directly from PrimeVue 4.5.5's `packages/core/src/` or `packages/primevue/src/` source during the Real-Source Verification Gate.
- **PrimeVue-specific implementation detail** — real, but not something Ultimate should copy (an implementation choice, not a behavior contract).
- **Existing Ultimate/UIX capability** — already built in Phase 1/2/3, directly reusable.
- **UltimateVue architectural decision** — a genuine Ultimate-owned design choice, made after reviewing the evidence.
- **Intentional behavioral/API deviation** — a deliberate, documented departure from verified PrimeVue behavior.
- **Future/deferred concern** — real, but explicitly out of Phase 4 scope.

---

## 1. PrimeVue 4.5.5 Baseline (verified)

- **Source repository / commit**: `https://github.com/primefaces/primevue`, `66dde6788220fc9e6822342919d1ceb0e3460ece` — matches `docs/architecture/checksums.json`'s sha256-verified tarball (`f34c320efa3cab3f4f5dc2ace0e6159b61d4dda3af9176ee090da4ef199b546d`) and `docs/architecture/PROVENANCE.md`'s PrimeVue entry.
- **License**: MIT, copyright PrimeTek 2018-2025.
- **Repo shape**: already split into `packages/core` (`@primevue/core` — BaseComponent, BaseDirective, BaseEditableHolder, BaseInput, config, service, api, useid, useattrselector, usestyle, utils) and `packages/primevue` (actual components — button, checkbox, dialog, menu, tooltip, focustrap, ripple, portal, etc.), plus separate `packages/forms`, `packages/icons`, `packages/themes`, `packages/mcp`, `packages/metadata`, `packages/nuxt-module`, `packages/auto-import-resolver`. Architecturally closer to the desired Ultimate `vue-core`/`vue` split than PrimeReact 10 stable was — no architectural-reference-only secondary version is needed for Vue the way PrimeReact 11 was needed for React (ADR-014's situation does not recur here).
- **Component/directory count**: 150 top-level directories under `packages/primevue/src` (verified via directory listing).
- **Test tooling**: **Vitest** (`vitest@^0.29.8`) + **`@vue/test-utils@^2.0.0`**, `@vitejs/plugin-vue`, jsdom environment, istanbul coverage — verified directly from `packages/primevue/package.json` and `packages/primevue/vitest.config.js`. Test coverage is uneven: **78 of 150** component directories have a `.spec.js` file (verified by direct count). Of the Phase 4 proof set specifically: Button has `Button.spec.js`; Checkbox, Dialog, Menu, Tooltip, FocusTrap have **zero** PrimeVue-authored tests. Ripple has a `Ripple.spec.js` (the sole directive-test precedent found).

### PrimeVue's own package-split precedent

Not a boundary concern the way PrimeReact 11 was for React (that version was commercially licensed and excluded entirely) — PrimeVue 4.5.5 itself, the incorporated MIT baseline, already demonstrates the core/components split. This is treated as corroborating evidence for §2's package-architecture decision, not a separate reference tier requiring its own licensing boundary statement.

---

## 2. Package Architecture

**UltimateVue architectural decision**, confirmed by evidence (PrimeVue's own real repo shape already splits this way) rather than merely mirrored from Angular/React precedent:

```text
packages/
├── vue-core/     @ultimate/vue-core
└── vue/          @ultimate/vue
```

Matches `ng-core`/`ng` and `react-core`/`react`'s proven shape, matches the existing repo placeholders (`packages/vue-core/.gitkeep`, `packages/vue/THIRD-PARTY-NOTICES.md`), and matches PrimeVue's own real `packages/core`/`packages/primevue` split. Package names remain provisional per `docs/architecture/PACKAGE_ARCHITECTURE.md` until npm availability and long-term clarity are validated — not finalized by this spec.

### `@ultimate/vue-core`

Vue-specific foundation. No rendered public components.

- Ultimate-owned `BaseComponent` (Options-API `extends` mixin architecture — §7)
- `BaseEditableHolder` (v-model/controlled-uncontrolled contract only — §7, §19)
- `BaseInput` (`size`/`fluid`/`variant` intermediate tier, verified real — §7, §19)
- `BaseDirective`-equivalent factory (§7) — the separate mechanism required for directive-shaped primitives
- FocusTrap directive (`v-focustrap`, §14)
- Overlay primitives: `Portal` wrapping native `<Teleport>` (§13)
- Escape coordination adapter, thin wrapper over `@ultimate/uix-utils/escape`'s shared priority-tuple registry (§11) — not a dependency on `react-core`
- Scroll-lock coordination adapter, thin wrapper over `@ultimate/uix-utils/scroll-lock`'s shared refcounting logic (§16) — not a dependency on `react-core`
- Icon infrastructure (matching the verified minimum set already established for Angular/React — confirmed at implementation time against Button/Dialog/Checkbox's real Vue imports)
- Vue `StyleSheet` adapter (§8)
- Config/context primitive (Vue `provide`/`inject`, not Angular DI or React Context — §7)
- `@ultimate/uix-utils/zindex` consumption wrapper (§12)

### `@ultimate/vue`

Public rendered surface — the Phase 4 proof set:

- `UButton`
- `UCheckbox`
- `UDialog`
- `UMenu`
- `UTooltip` (Vue custom directive, not a component — §9)

Directive-shaped primitives, part of `vue-core`'s public surface, not `vue`'s component tier: `v-focustrap`, `v-tooltip`, `v-ripple`.

Dependency direction (enforced, §28): `@ultimate/vue` → `@ultimate/vue-core` → `@ultimate/uix-*`. No reverse or circular imports. `vue-core`/`vue` do not depend on `ng-core`/`react-core` — framework-native isolation per §2.4.

---

## 3. Build Tooling

**UltimateVue architectural decision**: `tsup` for both packages, plus `@vitejs/plugin-vue` (or equivalent) for `.vue` SFC compilation where Vue components/directives require it.

- Matches Phase 1's proven precedent (`uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`) and Phase 3's confirmed non-requirement for a framework-dedicated compiler tool the way Angular's `ng-packagr` is (ADR-021).
- Vue SFCs require a Vue-aware compilation step (unlike React's plain TSX, which `tsup`/esbuild handles natively) — `@vitejs/plugin-vue` is Vue's own official, verified-in-use tool (confirmed directly from PrimeVue's own `vitest.config.js`), the direct parallel to `ng-packagr` being "what PrimeNG itself uses" (ADR-021's rationale). Exact `tsup`+Vue-plugin wiring is an implementation-time concern, not decided further here — the tool choice itself is the architectural decision.
- Rejected alternative: Vite library mode directly (no demonstrated gap `tsup` + a Vue plugin doesn't cover, no existing repo precedent for a second build tool beyond what Phase 2's `ng-packagr` exception already required).

### Build output requirements

- **Module format**: ESM only (matches `uix-utils`/`uix-styled`/`react-core`/`react` precedent).
- **Declarations**: `.d.mts` output, matching Phase 1/3's established pattern.
- **Package exports**: `vue-core`'s Phase 4 shape follows `react-core`'s precedent — a single public entry point (`.`), no speculative subpath API added ahead of a real bundle measurement (same reasoning as Phase 3 §3, not repeated here). `vue` uses subpath exports per component (`@ultimate/vue/button`, `@ultimate/vue/checkbox`, `@ultimate/vue/dialog`, `@ultimate/vue/menu`, `@ultimate/vue/tooltip`) plus a barrel — same rationale as Phase 3 §3 (avoiding Phase 2's documented single-barrel tree-shaking failure, ROADMAP.md follow-up #5).
- **`sideEffects`**: **verified source behavior directly informs this decision, differently from React's reasoning**. PrimeVue's own `BaseComponent.vue` registers styles as a `watch: { isUnstyled: { immediate: true, handler() { this._loadCoreStyles(); ... } } }` side effect, evaluated at component-instance-creation time (via the `extends:` mixin chain, immediate watcher) — not at module-import time (matching neither Angular's true import-time side effect nor React's pure render-time hook call exactly; it is instance-lifecycle-time, closer to React's shape than Angular's). Provisionally `sideEffects: false` for both packages, reasoned the same way Phase 3 reasoned it — but subject to the same **hard, required validation gate** before being treated as confirmed (below), not defaulted.

  **Required build-level validation before this decision is treated as confirmed** (see §33 exit criteria — a hard gate, matching Phase 3 §3's precedent exactly, not weakened for Vue):
  - A production build (`tsup` build output, not dev/watch mode) of both `vue-core` and `vue`.
  - A consumer-like import against that production build output.
  - Actual component mounting from that consumer-like import (via Vitest + `@vue/test-utils`, jsdom environment).
  - Explicit verification that the required style registration/injection (the `VueStyleSheet` adapter's `createStyleElement` call, §8) still occurs under that consumer-like import.
  - Explicit verification that no component/directive code required for that registration is eliminated by dead-code elimination under `sideEffects: false`.
  - Both direct component/subpath import and barrel import must each be exercised.

  If this validation reveals a silent drop, correct the flag to `true` (Angular's ADR-021 precedent) or mark the specific style-registration module `sideEffects: true` via the array-of-paths form — not weaken the validation.
- **Package boundary rules**: see §28.
- **Consumer expectations**: `@ultimate/vue` peers on `vue` — exact version range is an implementation-time confirmation against PrimeVue 4.5.5's verified peer range and the monorepo's existing floor, not asserted here without that check (§27).

---

## 4. Ultimate Ownership Model

```text
PrimeVue 4.5.5 verified behavior
          ↓
Ultimate behavioral contract
          ↓
Ultimate-owned Vue implementation
          ↓
Existing framework-neutral UIX infrastructure where reusable
          ↓
Shared uix-utils/escape and uix-utils/scroll-lock registries (extracted
from react-core's already-built logic, §11/§16) where evidence shows
PrimeVue's own mechanism has a gap React already closed
```

Concretely, per the Real-Source Verification Gates:

- Where PrimeVue's behavior is verified-good and framework-neutral-reusable (z-index, motion, focus-lookup DOM helpers, scroll-lock primitives), Ultimate reuses the **already-built** Phase 1 UIX primitive directly — confirmed this Phase to be an even cleaner match than Phase 3 found (every DOM primitive `FocusTrap.js` calls already exists verbatim in `uix-utils/dom`).
- Where PrimeVue's behavior is verified-good but the mechanism is Vue-specific (FocusTrap/Tooltip/Ripple as directives, `BaseComponent`'s `extends:` mixin chain), Ultimate reimplements the **behavior**, independently authored — same Option-B treatment as ADR-018/024.
- Where PrimeVue's implementation detail conflicts with Ultimate architecture (full `pt`/`ptm`/`ptmi`/`ptmo` passthrough, `inject: { $parentInstance }`, `@primevue/forms` coupling), Ultimate excludes or replaces it.
- Where PrimeVue's real behavior has a **verified gap that React's `react-core` already closed** (Escape's plain unconditional listener with no stacking; scroll-lock's un-refcounted global calls), Ultimate extracts the already-built, already-evidenced-correct framework-neutral registry logic into `@ultimate/uix-utils` (§11, §16) and consumes it via a thin Vue adapter — `react-core` is refactored to consume the same shared module, not left as the thing `vue-core` depends on — not a third independent implementation of a known-weaker mechanism.
- Where PrimeVue's behavior has a verified gap with no cross-framework precedent yet (Tooltip's missing `aria-describedby`), Ultimate improves it, documented as an intentional deviation, same as Phase 3 §9.

---

## 5. Proof-Set Scope

Phase 4 implements exactly five components: **Button, Checkbox, Dialog, Menu, Tooltip**. Mirrors Phase 2/3's proof set exactly — same component count, same distinct-architecture-path rationale (primitive rendering; controlled form input; portal/overlay/focus-trap/motion; keyboard navigation/virtual focus; ref/target-based overlay primitive).

Plus required Vue-specific infrastructure directives: `v-focustrap`, `v-tooltip`, `v-ripple`.

### Non-goals for Phase 4

- The remaining ~145 PrimeVue component/infrastructure areas (§30).
- A visual baseline / Storybook-equivalent tool (Phase 2/3 precedent: explicitly deferred, ADR-023).
- A real consumer application proving tree-shaking in practice (`apps/playground-vue` remains a stub — see §24, §29).
- Full `pt`/`ptm`/`ptmi`/`ptmo` passthrough support.
- `@primevue/forms` integration for `UCheckbox` (§19, §20) — verified real, unpinned, explicitly excluded.
- Fixing Angular's still-open styling gap (ADR-023 follow-up #6) — tracked separately, not reopened here.
- Data-grid-class component architecture (Table/Tree/etc.).
- `UDialog` draggable and maximizable behavior. **`UDialog` does not expose or implement draggable or maximizable behavior in Phase 4 unless a separately approved scope decision explicitly adds one of those features.** Verified present in real PrimeVue 4.5.5 Dialog source (§15) — resizable was not found as a feature in PrimeVue's real Dialog at all (unlike PrimeReact, which has all three). Not automatically inherited. See §15 for the full boundary statement.

---

## 6. Foundation Dependencies (verified import closure)

Direct import inspection (not category assumption) of each proof-set component's real `.vue`/`.js` source, performed during the Real-Source Verification Gates:

| Component | Direct imports (verified) |
|---|---|
| Button | `BaseButton extends BaseComponent`, `SpinnerIcon`, `Badge`, `Ripple` (as a registered directive), `cn`/`isEmpty` utilities, `mergeProps` from `vue` |
| Checkbox | `BaseCheckbox extends BaseInput extends BaseEditableHolder extends BaseComponent` (verified full chain, §19) |
| Dialog | `BaseDialog extends BaseComponent`, `Portal`, `FocusTrap` (as a registered directive), `Ripple` (as a registered directive), `Button`, `TimesIcon`/`WindowMaximizeIcon`/`WindowMinimizeIcon`, `ZIndex`, `blockBodyScroll`/`unblockBodyScroll` (from local `primevue/utils`, itself wrapping `@primeuix/utils`), native `<transition>`/`<Teleport>` (via `Portal`) |
| Menu | `BaseMenu extends BaseComponent`, `aria-activedescendant`-driven `focusedOptionIndex` state, no Tooltip import found (parallel negative finding to Phase 3's Menu/Tooltip independence) |
| Tooltip | `BaseTooltip.extend('tooltip', {...})` (directive, not `extends: BaseComponent`), `createElement`/`focus`/`getWindowScrollTop`/etc. from `@primeuix/utils/dom`, `ZIndex`, `ConnectedOverlayScrollHandler` |

**Verified negative finding**: Menu does not import Tooltip in PrimeVue's real source, same as PrimeReact's verified behavior in Phase 3.

**Ultimate reuse map for this closure**:

| PrimeVue area | Classification |
|---|---|
| `BaseComponent` (`packages/core/src/basecomponent/BaseComponent.vue`) | Reference only — `vue-core` authors its own scoped-down Options-API mixin (§7) |
| `BaseDirective` (`packages/core/src/basedirective/BaseDirective.js`) | Reference only — `vue-core` authors its own scoped-down directive factory (§7), a **separate mechanism from `BaseComponent`**, verified as such this Phase |
| `BaseEditableHolder` | Reference only — `vue-core` authors its own v-model/controlled-uncontrolled contract, `@primevue/forms` coupling excluded (§19, §20) |
| `Ripple` | **Not a Phase 4 proof-set component in isolation, but its directive artifact shape is required infrastructure** (Button/Dialog/Menu use it upstream, verified). Built as a standalone `v-ripple` directive primitive, matching Angular's own Phase 2 precedent (`URipple` built standalone, not per-component) and React's Phase 3 deferral posture (ADR-031) — except Vue's real proof-set components (Button, Dialog) do wire `v-ripple` directly in their own verified templates, so unlike React (which deferred Ripple entirely, ADR-031), Vue's `UButton`/`UDialog` render with the directive applied, consistent with what verified source shows. |
| `Portal` (`packages/primevue/src/portal/Portal.vue`) | Vue-native implementation — thin wrapper around native `<Teleport>`, `isClient()`-equivalent SSR guard, authored in `vue-core` (§13) |
| Native `<transition>` | **Not replaced** by a wrapper library — Vue's own primitive, hooked to `@ultimate/uix-motion`'s `createMotion()` (§17) |
| `FocusTrap` (directive) | Vue-specific implementation, sentinel-span + `MutationObserver` mechanism (§14) |
| `ZIndex` (`@primeuix/utils/zindex`) | Direct reuse — `@ultimate/uix-utils/zindex` (§12), confirmed algorithmically identical during this Phase's verification |
| Escape handling (`bindDocumentKeyDownListener`/`onKeyDown`) | Verified weaker than React's — reused via a thin Vue adapter over the shared `@ultimate/uix-utils/escape` registry (extracted from `react-core/escape`'s algorithm, §11), not ported from PrimeVue's own weaker mechanism, not a `vue-core → react-core` dependency |
| `blockBodyScroll`/`unblockBodyScroll` (local `primevue/utils` wrapping `@primeuix/utils`) | Verified un-refcounted — reused via a thin Vue adapter over the shared `@ultimate/uix-utils/scroll-lock` registry (extracted from `react-core/scroll-lock`'s logic, §16), not ported from PrimeVue's own gap-carrying mechanism, not a `vue-core → react-core` dependency |
| `getFirstFocusableElement`, `getLastFocusableElement`, `isFocusableElement`, `focus`, `createElement` | Direct reuse — all five already exist verbatim in `@ultimate/uix-utils/dom`, confirmed this Phase |
| `PrimeVueService` (global event-bus, config-change notifications) | Reference only — `@ultimate/uix-utils`'s existing `eventbus` module covers the general capability if a real Phase 4 need surfaces; not ported wholesale |

---

## 7. Vue Core Base Architecture

**UltimateVue architectural decision**, LOCKED — Options-API `extends` mixin chain, directly modeled on ADR-018/024's proven Option-B pattern:

`vue-core` provides only:

1. **`BaseComponent`** — an Options-API mixin object (`export default { name, props, watch, methods, computed, ... }`), consumed via `extends: BaseComponent` in each proof-set component's own base file (`BaseButton`, `BaseCheckbox`, `BaseDialog`, `BaseMenu`), matching the verified `BaseComponent.vue`/`BaseButton.vue` structural pattern exactly (not copied code — independently authored, scoped down).
2. **`BaseEditableHolder`** — same `extends:` mechanism, layered on `BaseComponent` (`extends: BaseComponent` itself, verified from `BaseEditableHolder.vue`), providing v-model (`modelValue`/`update:modelValue`), `d_value` internal state, and the `controlled` computed (`$inProps.hasOwnProperty('modelValue')` pattern, verified) — with the `@primevue/forms`-coupled portions (`inject: { $pcForm, $pcFormField }`, `formField.onChange`, `$formNovalidate`/`$formValue`/`$formDefaultValue`) excluded entirely (§19, §20). **`BaseInput`** — a real, verified intermediate tier (`extends: BaseEditableHolder`, verified from `BaseInput.vue`) — not previously documented in this spec, closed as part of §19's completed Checkbox verification — layered between `BaseEditableHolder` and form-input-shaped components (Checkbox's real chain, §19), adding `size`/`fluid`/`variant` props and `$fluid`/`$variant` computeds. `vue-core` includes this tier for the same reason: Checkbox's real verified prop surface needs it, and it matches the ambient-Fluid-context pattern already independently confirmed for Button (§18) and Angular's `UButton` (ADR-018).
3. **`BaseDirective`-equivalent factory** — a **separate mechanism**, not an `extends:` mixin, since Vue directives use a different lifecycle-hook shape (`created`/`beforeMount`/`mounted`/`beforeUpdate`/`updated`/`beforeUnmount`/`unmounted` receiving `(el, binding, vnode, prevVnode)`) than components do. Verified from `BaseDirective.js`: a plain object with its own `.extend(name, options)` factory returning real directive lifecycle hooks, storing per-directive-instance state scoped to the bound element. `vue-core`'s own factory follows this same shape, independently authored, scoped down (no passthrough, no `PrimeVueService` global config-change subscription unless a real Phase 4 need demonstrates one).
4. **`cx()` class-name-slot resolution** — a per-component style-module contract shaped like Angular's `UBaseComponent.cx(key, params)` and React's `react-core` equivalent, matching PrimeVue's own verified `cx()` (`BaseComponent.vue`'s `computed: { ... }` methods block) minus the passthrough layer.
5. **Style registration** — via the Vue `StyleSheet` adapter (§8), invoked from the same `immediate: true` watcher pattern verified in `BaseComponent.vue`'s `watch: { isUnstyled: { immediate: true, handler() { this._loadCoreStyles(); ... } } }` — instance-lifecycle-time, not module-import-time.
6. **Vue lifecycle integration** — `extends:` mixin chain for components, directive-factory hooks for directives, matching the two verified mechanisms exactly (not forcing one shape onto both).
7. **Shared config/context primitive** — Vue's `provide`/`inject`, matching the verified `$primevue`/`$primevueConfig` pattern's *shape* (a provided config object consumed via `inject`) without its coupling to the excluded `$parentInstance` host-lookup mechanism (below).

### Explicitly excluded

**Intentional behavioral/API deviation**: the full PrimeVue `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough system (verified: `BaseComponent.vue`, ~140 lines of nested-key resolution — `_getPTValue`/`_usePT`/`_getPT`/`globalPT`/`defaultPT` computed properties; `BaseDirective.js`'s separate, parallel implementation of the same system for directives) is excluded entirely from both the component-mixin and directive-factory mechanisms. Same YAGNI justification that held across all 5 Angular components (ADR-018) and all 5 React components (ADR-024) — no demonstrated Ultimate consumer need, revisit only on real duplicate-pattern pressure from a later component.

**Intentional behavioral/API deviation**: `inject: { $parentInstance }` (verified: `BaseComponent.vue`'s `inject` block, used for `_getHostInstance` host-instance-tree lookup) is excluded — same posture as Angular's DI-token-lookup exclusion (ADR-018) and React's absence of an equivalent mechanism. No Phase 4 proof-set component demonstrates a real need for arbitrary host-instance lookup up the component tree.

**Intentional behavioral/API deviation**: no `@primevue/forms` integration (§19, §20) — the base stays scoped to v-model + controlled/uncontrolled, matching this Phase's Gate 6 #2 decision.

---

## 8. Styling Architecture

**Verified source behavior** (`BaseComponent.vue`'s `_loadCoreStyles`/`_loadThemeStyles`/`_loadScopedThemeStyles`, full read): registers styles via `BaseComponentStyle.loadCSS`/`this.$style.loadCSS`, deduplicated via `Base.isStyleNameLoaded`/`Theme.isStyleNameLoaded` name-based checks, triggered from the `immediate: true` `isUnstyled`/`dt` watchers described in §7.5 — not from a plain module-import-time side effect (verified distinct from a naive assumption).

**Existing Ultimate/UIX capability**: `@ultimate/uix-styled`'s `StyleSheet` class — same registry/dedup semantics already reused by both Angular (`ngCoreStyleSheet`, currently gapped) and React (`ReactStyleSheet`, confirmed working, ADR-029). Its `createStyleElement(meta)` hook returns `undefined` from the base class by design, requiring a framework-specific override to actually inject a `<style>` element.

**Existing Ultimate/UIX capability, the fix**: `@ultimate/uix-utils/dom`'s `createStyleElement(css, attributes, container)` — the same complete, working, framework-neutral implementation React's `ReactStyleSheet` already delegates to.

### Vue StyleSheet adapter — UltimateVue architectural decision

```text
class VueStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined; // SSR guard
    return createStyleElement(meta.css ?? "", meta.attrs, document.head);
  }
}
```

- Reuses `StyleSheet`'s registry/dedup semantics as-is — no reimplementation, same posture as React's adapter.
- Delegates actual DOM creation to the already-built `@ultimate/uix-utils/dom` `createStyleElement` — no PrimeVue styling code is ported.
- SSR-conscious: guards on `typeof document === "undefined"`, mirroring both the verified PrimeVue pattern (`Portal.vue`'s `isClient()` gate is the closest verified analogue found this Phase) and React's already-shipped adapter's identical guard.
- A single module-level `vueCoreStyleSheet` instance (matching both `ngCoreStyleSheet` and `reactCoreStyleSheet`'s singleton pattern), registered against from the `immediate: true` watcher pattern verified in `BaseComponent.vue` — once per component name at instance-creation time, not per-render/per-update.

**Explicit scope decision**: PrimeVue's CSP-nonce (`this.$primevueConfig?.csp?.nonce`, verified referenced throughout `BaseComponent.vue`/`Dialog.vue`) and multi-container (`context.styleContainer`) configurability are real, verified features but have no demonstrated Phase 4 proof-set need — excluded for now (YAGNI), addable if a real requirement surfaces.

**This spec does not reopen the Angular-side gap** (ADR-023 follow-up #6). Vue gets its own working adapter as in-scope Phase 4 work, exactly matching the posture Phase 3 §8 already established for React — not fixing Angular inline here.

---

## 9. Tooltip API

**Verified source behavior** (`Tooltip.js`, full read): a Vue custom directive, `BaseTooltip.extend('tooltip', {...})`, using directive lifecycle hooks (`beforeMount`/`updated`/`unmounted`) rather than a component's `extends:` mixin chain. Imperative — `beforeMount` reads `options.value` (string shorthand or object form: `value`/`disabled`/`escape`/`class`/`fitContent`/`id`/`showDelay`/`hideDelay`/`autoHide`), stores state directly on `target.$_ptooltip*` fields, calls `bindEvents`. No VNode/render involved for the tooltip's own binding logic — the floating panel itself is created imperatively via `createElement`/DOM manipulation (matching the `@primeuix/utils/dom` helpers verified elsewhere in this Phase).

**No `aria-describedby` wiring exists anywhere in `Tooltip.js`** — verified absent, same class of gap Phase 3 §9 found in PrimeReact's real source and Phase 2's Angular `UTooltip` (ROADMAP.md follow-up #4).

**No test file exists for Tooltip** in PrimeVue 4.5.5 (verified — confirmed absent by directory listing, same as FocusTrap).

### UltimateVue API — directive-native, not converted to a component

```text
v-tooltip="'Save changes'"
<!-- or -->
v-tooltip="{ value: 'Save changes', showDelay: 300 }"
```

Matches the verified target-based directive model exactly — `UTooltip` (`v-tooltip`) is applied directly to the target element, not wrapped around it or composed via a ref-target prop the way React's `UTooltip` component is. This is the Vue-native equivalent of the same underlying concept (React's ref/target primitive maps to Vue's directive-on-element binding) — same behavioral contract, deliberately different mechanism, per §2.4/§21.

**Prime-specific implementation detail, deliberately not copied**: `target.$_ptooltip*`-prefixed private field naming and the specific internal state-storage convention are PrimeVue-internal — Ultimate authors its own internal state shape independently, informed by but not copied from this pattern.

### Accessibility improvement — intentional deviation

Same contract Phase 3 §9 established for React, applied here to the directive mechanism instead of a component:

1. **Resolve the target element** — the same element the directive is bound to (`el` in the directive's lifecycle hooks) — not a separate lookup.
2. **Generate or use a stable tooltip ID** — if the floating tooltip panel already has an id (from PrimeVue's verified `$_ptooltipIdAttr` pattern, or Ultimate's own equivalent), use it; otherwise generate one deterministically.
3. **Add that ID to `aria-describedby` only while the tooltip is visible** — set on show, matching the directive's existing show/hide lifecycle.
4. **Preserve any existing `aria-describedby` value on the target** — append the tooltip's ID to any existing space-separated token list, never overwrite.
5. **On cleanup (hide/unmount), remove only the tooltip-owned ID** — preserve any other IDs present; remove the attribute entirely only if the token list becomes empty.
6. **Multiple Ultimate tooltips targeting the same element**: explicit non-goal for Phase 4, same as Phase 3 §9(6) — the append-one-remove-that-one contract is correct for the single-tooltip-per-target case, which is PrimeVue's own verified real usage pattern.

Regression tests for this exact contract are required (§23).

---

## 10. Menu

**Verified source behavior** (`Menu.vue` full read, `Menuitem.vue` full read — closing this section's prior verification gap): dual-mode component, same shape as PrimeReact's Menu. `popup: false` renders an always-visible inline `<ul role="menu">`; `popup: true` toggles a `Portal`-rendered overlay via `show(event, target)`/`hide()`/`toggle()`. Data-driven from a `model` prop (array of item objects). `<ul>` carries `:aria-activedescendant="focused ? focusedOptionId : undefined"`, `focusedOptionIndex` data property tracks the active item by id (stored as the item's rendered `id` string, not a numeric index), no `.focus()` call ever made on an individual `<li>` — confirmed virtual focus, same mechanism verified in PrimeReact's `Menu.js`.

**Intentional convergence, preserved**: matches React's already-accepted ADR-027 posture — Vue's real upstream Menu independently uses the same `aria-activedescendant` technique React's does, both diverging from Angular's already-shipped literal-DOM-focus `UMenu`. UltimateVue's `UMenu` preserves this verified Vue behavior rather than mirroring Angular's choice, per ADR-006 and the principle that cross-framework consistency belongs at the behavior/contract level, not the mechanism level.

### Coverage (all verified from the full `Menu.vue`/`Menuitem.vue` read — prior verification gap closed)

- **Disabled items**: `Menuitem.vue` renders `:aria-disabled="disabled()"` and `:data-p-disabled="disabled() || false"`; `Menu.vue`'s keyboard navigation filters via the `li[data-pc-section="item"][data-p-disabled="false"]` selector clause in `findNextOptionIndex`/`findPrevOptionIndex`/`changeFocusedOptionIndex`/`onEndKey`. `itemClick` no-ops (returns before calling `item.command`) when `this.disabled(item)` is true.
- **Home/End**: `onHomeKey` → `changeFocusedOptionIndex(0)`; `onEndKey` → `find(this.container, 'li[data-pc-section="item"][data-p-disabled="false"]').length - 1`, both verified, matching PrimeReact's equivalent shape.
- **Arrow navigation**: `findNextOptionIndex`/`findPrevOptionIndex` walk the filtered disabled-excluded list by matching the current `focusedOptionIndex` id against each link's `id`; `Alt+ArrowUp` in popup mode additionally returns focus to `this.target` and closes the menu (`onArrowUpKey`'s `event.altKey && this.popup` branch) — matches PrimeReact's equivalent behavior.
- **Enter/Space**: `onSpaceKey` calls `onEnterKey` directly (verified: `onSpaceKey(event) { this.onEnterKey(event); }`). `onEnterKey` locates the focused `<li>` by id, finds its `a[data-pc-section="itemlink"]` anchor if present, calls `.click()` on the anchor or the `<li>` itself; returns focus to `this.target` first if `this.popup`.
- **Escape — genuine correction to this spec's prior provisional expectation**: Menu's real Escape handling is **not** routed through the shared document-level priority mechanism (§11) at all. It is handled entirely locally, inside `onListKeyDown` — a `keydown` handler bound directly to the `<ul>` element itself (`@keydown="onListKeyDown"` in the template), which only fires while that specific `<ul>` has focus. The `Escape` case calls `focus(this.target)` then `this.hide()` if `this.popup`. **A real, verified quirk**: the `Escape` case in the `switch` statement has no `break` — it falls through into the immediately-following `Tab` case (`this.overlayVisible && this.hide()`), which is a second, redundant `hide()` call in the popup case and a no-op in the non-popup case (since `overlayVisible` is only ever true in popup mode) — verified harmless by trace, but a real fall-through, not a typo this spec should silently "fix" by omission. This differs from Dialog's real mechanism (§11: a global, unconditional `document`-level listener) — Menu's own real upstream Escape handling is scoped-to-focused-element, which is actually a form of natural "only the focused overlay responds" behavior distinct from both Dialog's plain-global-listener gap and the shared priority-queue mechanism §11 builds for Dialog. **UltimateVue architectural decision, informed by this evidence**: `UMenu`'s Escape handling should be authored as its own local `keydown` handler on its list element, matching this verified Vue-native mechanism — not routed through the §11 shared Escape-priority module, which exists for Dialog's genuinely different global-listener problem (multiple simultaneously-open Dialogs, not applicable to a focus-scoped local handler that only fires while that specific Menu has focus).
- **Tab**: closes a visible popup menu (`this.overlayVisible && this.hide()`, verified, reached either directly or via the Escape fall-through above) — does not trap Tab, confirmed no `v-focustrap`/FocusTrap import anywhere in `Menu.vue`.
- **Popup mode**: `show(event, target)` sets `overlayVisible = true` and captures `target`; the `<transition>`'s `@enter` hook (`onEnter`) performs `absolutePosition` alignment (`alignOverlay`), binds outside-click/resize/scroll listeners, sets z-index (`ZIndex.set('menu', el, ...)`, verified `'menu'` key — resolves §12's flagged per-component-key gap for Menu specifically), and focuses the list if popup. `onLeave`/`onAfterLeave` unbind listeners and clear z-index.
- **Focus restoration**: `focus(this.target)` called explicitly in both the Escape handler and the `Alt+ArrowUp` handler (`onArrowUpKey`) — verified, matches the pattern already documented for Dialog.
- **Outside-click**: `bindOutsideClickListener`/`unbindOutsideClickListener`, a Menu-local `document`-level `click` listener (capture phase, verified: `addEventListener('click', ..., true)`) — checks whether the click target is outside both the container and the trigger target; in popup mode, hides; in non-popup mode, clears `focusedOptionIndex`. **Not** built on a shared `useOverlayListener`-equivalent composition — Menu authors this directly itself (verified: no shared overlay-listener hook/mixin imported), same "component-local wiring, no premature shared service" posture §13 already establishes for Dialog.
- **Resize**: `bindResizeListener`/`unbindResizeListener` — a Menu-local `window` `resize` listener, hides the popup on resize (skipped on touch devices via `isTouchDevice()`) — verified, not previously documented in this spec at all (a real behavior this section's prior "provisional expectation" did not anticipate).
- **Scroll**: `bindScrollListener`/`unbindScrollListener` via `ConnectedOverlayScrollHandler` (verified import from `@primevue/core/utils`) — hides the popup on scroll of the target's scrollable ancestors. Also not previously documented.
- **Accessibility**: `role="menu"` on the `<ul>`, `role="menuitem"` on items (verified in `Menuitem.vue`), `role="none"`/`role="separator"` on submenu-label/separator `<li>`s, `aria-label`/`aria-labelledby` pass-through on the list, `aria-label`/`aria-disabled` on individual items (verified in `Menuitem.vue`).

### Selector strategy — intentional deviation

**Prime-specific implementation detail, not ported, now verified rather than assumed**: PrimeVue's real keyboard-navigation queries couple directly to `data-pc-section`/`data-p-disabled` attributes (verified: `li[data-pc-section="item"][data-p-disabled="false"]`, matching `BaseComponent.vue`'s `_getPTDatasets` mechanism — these attributes are set unconditionally on rendered elements regardless of whether `pt` props are actually supplied, confirmed this Phase). Since the full `pt` system is excluded (§7), Ultimate's own selector convention must not depend on this exact attribute name.

**UltimateVue architectural decision**: define a stable, Ultimate-owned data-attribute convention independent of any passthrough system — matching React's `data-u-menuitem`/`data-u-disabled` precedent (Phase 3 §10) for cross-framework consistency at the attribute-naming-convention level (not a shared mechanism, just a shared naming habit). Exact attribute names are an implementation-time detail.

---

## 11. Escape Handling (`vue-core`)

**Verified source behavior** (`Dialog.vue`'s `onKeyDown`/`bindDocumentKeyDownListener`/`unbindDocumentKeyDownListener`, full read): a **plain, unconditional `document`-level `keydown` listener**, gated only by `closeOnEscape && !event.isComposing`, bound on `onEnter` and removed on `onAfterLeave`/`unbindGlobalListeners`. **No priority-queue or topmost-z-index-stacking mechanism exists in PrimeVue's real Dialog** — verified directly this Phase. This is the same weaker posture ADR-020 documents for Angular's `UDialog`, not React's ADR-026 fix. Multiple simultaneously-open PrimeVue Dialogs would each independently close on Escape.

**Existing Ultimate/UIX capability, already built and already tested**: `react-core/src/escape/` (`priorities.ts`, `use-display-order.ts`, `use-global-escape-key.ts`, `escape.spec.ts`) implements exactly the priority-tuple algorithm PrimeReact's real source demonstrated as necessary for correctness (§11 of the Phase 3 spec) — a module-level priority-tiered registry, a display-order counter per group, only the highest `[priority, displayOrder]` tuple's callback fires on Escape.

**Extraction decision (resolved, verified by direct re-inspection of `react-core/src/escape/` source)**: the three files decompose into two distinct tiers:

- `priorities.ts` (`ESCAPE_PRIORITIES` constant object) and `use-global-escape-key.ts`'s core mechanism (`escKeyListeners: Map<number, Map<number, EscapeListener>>`, `onGlobalKeyDown`, `refreshGlobalListener`) have **zero React API surface** — verified by full read: the only React import in `use-global-escape-key.ts` is `useEffect` itself, used solely to trigger registration on mount and cleanup on unmount; the registry, comparison (`Math.max` over primary/secondary keys), and `document` listener add/remove logic are plain module-scoped functions and state, structurally identical in shape to `@ultimate/uix-utils/zindex`'s already-shared `ZIndex` singleton (module-closure state, imperative `set`/`clear`-equivalent methods, no framework dependency).
- `use-display-order.ts` is **genuinely React-shaped**, not merely React-wrapped — verified by full read: it holds `uid`/`displayOrder` in `useState` and *returns* `displayOrder` so the calling component re-renders when its position in the group changes. This return-and-re-render contract is a React reactivity pattern; a Vue equivalent needs Vue's own reactivity primitive (`ref()`), not a call into a React hook. The underlying `groupToDisplayedElements: Record<string, (number | undefined)[]>` registry itself has no React dependency, but the function wrapping it is not a thin shim over shared logic — it *is* the React-specific adapter.

**UltimateVue architectural decision — extract the framework-neutral tier into `@ultimate/uix-utils`, do not depend on `react-core`**:

```text
vue-core → uix-utils/escape   (new)
react-core → uix-utils/escape (new, react-core's existing files become the thin adapter over it)
```

not `vue-core → react-core`. This preserves framework-native isolation exactly as §28 requires and matches the precedent already set by `zindex`/`eventbus`: a plain, module-scoped, imperative registry lives in `uix-utils`, each framework's `*-core` package wraps it in a thin, framework-idiomatic call shape.

- **Extracted to `@ultimate/uix-utils/escape` (new submodule, smallest correct boundary)**: `ESCAPE_PRIORITIES`-equivalent constants; the priority-tiered registry (`Map<number, Map<number, EscapeListener>>` or equivalent); `onGlobalKeyDown`/`refreshGlobalListener`-equivalent register/deregister/dispatch functions, exposed as a plain `register(primary, secondary, callback)` / `unregister(primary, secondary)` pair — the same shape as `ZIndex.set`/`.clear`.
- **Stays framework-specific in each `*-core` adapter**: the mount/unmount lifecycle trigger (`useEffect` for React, `mounted`/`beforeUnmount` mixin hooks for Vue); the display-order counter's *reactive* wrapper (`useState` for React: `use-display-order.ts` stays as-is, unchanged by this extraction; Vue needs its own `ref()`-based equivalent calling into the same shared `groupToDisplayedElements`-equivalent registry, which is a good second candidate for the same `uix-utils/escape` submodule since the registry itself — unlike the reactive return — has no framework dependency either).
- **Not extracted**: `use-display-order.ts`'s `useState`/return-value contract itself — stays React-specific, unchanged. Vue's `vue-core` authors its own reactive wrapper over the shared registry.

This is a genuine, evidence-backed **architecture decision to make later** (extraction is the correct shape, per the analysis above) — but per this gate's explicit instruction, no code changes or extraction are performed now. This is recorded as a required pre-Phase-4-implementation refactor of `react-core/src/escape/`, not a Phase 4-only concern: `react-core`'s existing files must be updated to delegate to the new `uix-utils/escape` submodule as part of this work, not left as a parallel, duplicate implementation. See §31 for risk tracking and §33 for the exit-criteria implication.

### UltimateVue implementation shape (once the extraction above lands)

```text
useGlobalEscapeKey(this, {
  callback: () => this.close(),
  when: () => this.visible,
  priority: [PRIORITY.DIALOG, displayOrder],
});
```

- **Registration**: triggered from the same `mounted`/`beforeUnmount` lifecycle pair `BaseComponent.vue`'s mixin chain already provides (§7), calling `@ultimate/uix-utils/escape`'s shared `register`/`unregister` directly — not through `react-core`.
- **Priority tiers**: the same `ESCAPE_PRIORITIES`-equivalent constants, now shared verbatim from `uix-utils/escape` rather than duplicated per framework.
- **Display order**: Vue-native `ref()`-based wrapper over the shared per-group registry (§ above) — own implementation, not React's `useState` shape.
- **Cleanup**: deregisters on unmount; if a priority tier becomes empty, the shared registry deregisters the underlying `document` listener entirely (verified logic, now shared).
- **Preserved behavioral contract**: topmost + most-recently-shown + highest-priority-eligible overlay handles Escape — the exact contract §21's cross-framework table states, now genuinely shared at the mechanism level for the registry/priority logic, not just the behavior level.

Test-porting note (§23, §31): `react-core/escape/escape.spec.ts`'s existing test cases (priority-tuple wins, `when: false` doesn't fire, deregisters on unmount) test the now-shared registry logic — once extracted, these cases should be ported to a shared `uix-utils/escape` spec file covering the registry itself, plus each framework's adapter gets its own thin lifecycle/reactivity test, rather than duplicating full coverage per framework.

---

## 12. Z-Index

**Existing Ultimate/UIX capability, direct reuse, no redesign**: `@ultimate/uix-utils/zindex`'s `ZIndex` singleton — verified this Phase to already implement a working per-key stacking array (`zIndexes: { key: string; value: number }[]`), algorithmically matching PrimeVue's own real `ZIndex.set('modal', this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal)` / `ZIndex.clear(this.mask)` calls (verified directly in `Dialog.vue`). Already used today by both Angular's `UOverlay` and (per Phase 3 §12) available to React.

**Verified correction to a prior assumption**: ADR-020's "Angular hardcodes its z-index registry key to a single `'overlay'` bucket" limitation was confirmed this Phase to be an **Angular usage choice**, not a limitation of the shared `uix-utils/zindex` primitive itself — the primitive already supports real per-key stacking; Angular's `UOverlay` simply never called `set()` with more than one key.

### UltimateVue architectural decision

Same posture as Phase 3 §12 — component-level configuration, not a `uix-utils/zindex` redesign. `vue-core` exposes the existing `ZIndex.set(key, element, baseZIndex)` primitive via a small overlay wrapper; `UDialog` uses the verified `'modal'` key (matching PrimeVue's real call exactly, `Dialog.vue`); `UMenu` uses the verified `'menu'` key (`ZIndex.set('menu', el, this.baseZIndex || this.$primevue.config.zIndex.menu)`, confirmed in `Menu.vue`'s `onEnter`, §10 — this Phase's Menu verification gap closure resolves this key too, not left open). `UTooltip` uses the verified `'tooltip'` key (`ZIndex.set('tooltip', tooltipElement, el.$_ptooltipZIndex)`, confirmed in `Tooltip.js`). All three overlay components' z-index keys are now verified — no remaining gap in this section.

---

## 13. Overlay Architecture

Vue-native composition, no centralized overlay service, no third-party overlay library:

- **Portal**: a thin `vue-core` wrapper around native `<Teleport>` — verified directly against PrimeVue's real `Portal.vue`: an `inline` computed (`disabled || appendTo === 'self'`) escape hatch rendering the slot in place instead of teleporting, gated otherwise by a `mounted` data flag set from `isClient()` in the `mounted()` hook (the SSR-safety mechanism — Teleport never rendered server-side, no hydration-mismatch-avoidance code needed beyond this gate).
- **Overlay listeners**: outside-click/resize/scroll dismissal — verified this gate, authored component-locally, not through a shared composition hook: Menu's real `bindOutsideClickListener`/`bindResizeListener`/`bindScrollListener` (§10) are each Menu-local, none imported from a shared overlay-listener module. Matches the same "verified necessity, not speculative hook library" bar §7/§31 apply throughout — `vue-core` does not introduce a shared `useOverlayListener`-equivalent composition unless a second, later component demonstrates real duplication pressure.
- **Escape**: **not a single shared mechanism across every overlay** — `UDialog` uses the shared `uix-utils/escape` priority mechanism (§11, real global-listener gap it fixes); `UMenu` uses its own local `keydown` handler on its list element instead (§10's correction — Menu's real upstream Escape handling is scoped-to-focused-element, a different problem shape the shared mechanism does not need to solve for Menu).
- **Z-index**: `@ultimate/uix-utils/zindex`, §12.
- **Component-local orchestration**: each overlay component (`UDialog`, `UMenu` in popup mode) wires Portal + FocusTrap (where applicable) + motion + Escape (via whichever mechanism §11/§10 establishes for that component) + z-index directly in its own body — matching the verified pattern in PrimeVue's real `Dialog.vue`/`Menu.vue` (mask/root markup authored directly in the component's own template, no shared "overlay service"), Angular's already-shipped `UDialog` (ADR-020), and React's `UDialog` (Phase 3 §13). No new shared orchestration service — none demonstrated necessary by any of the three verified upstream sources or two already-shipped Ultimate implementations.

No Angular CDK, no third-party Vue overlay library — matches ADR-020's rationale, extended by this Phase's own confirmation that PrimeVue's real Dialog needs none either.

---

## 14. FocusTrap

**Verified source behavior** (`FocusTrap.js`, full read; `BaseFocusTrap.js`, full read): a Vue custom directive (`BaseFocusTrap.extend('focustrap', {...})`, built on the `BaseDirective` factory verified in §7 — a separate mechanism from `BaseComponent`'s `extends:` mixin chain). `mounted(el, binding)` — if not disabled — creates two hidden sentinel `<span class="p-hidden-accessible p-hidden-focusable">` elements (via `createElement`), `prepend`s/`append`s them to `el`, binds a `MutationObserver` (watching `childList` mutations, redirecting focus to the next focusable element if focus is lost after a dynamic-content change) plus `focusin`/`focusout` listeners, then performs auto-focus (`[autofocus]` selector first, falling back to first-focusable if `autoFocus: true`). Each sentinel's own `onFocus` handler (`onFirstHiddenElementFocus`/`onLastHiddenElementFocus`) redirects real DOM focus to the first/last real focusable descendant. No keydown interception anywhere in this file — containment is achieved purely through the sentinel-span technique exploiting native Tab order.

**No test file exists for FocusTrap** in PrimeVue 4.5.5 (verified — confirmed absent).

**Same sentinel-span *technique* as React's verified FocusTrap** (ADR-025), wired as a directive rather than a ref-based component — the mechanism-shape difference is dictated by Vue's directive/component distinction, not an independent design choice. **A capability neither Angular's nor React's FocusTrap has**: the `MutationObserver`-driven dynamic-content focus redirection, verified present in PrimeVue's real implementation — carried forward as verified upstream behavior, not gold-plating.

### UltimateVue architectural decision

Preserve the verified mechanism, independently authored (not a mechanical port):

- **Artifact shape**: a `v-focustrap` custom directive, built on `vue-core`'s own `BaseDirective`-equivalent factory (§7) — not converted into a component, not modeled on Angular's keydown-cycling `[uFocusTrap]` directive or React's ref-based sentinel component.
- **Sentinels**: two invisible, focusable `<span>` elements, `prepend`ed/`append`ed to the bound element, matching the verified accessibility attributes (`role="presentation"`, `aria-hidden="true"`, hidden-but-focusable styling, `tabIndex` configurable).
- **Focus redirection**: `onFocus` handlers on each sentinel, reusing **existing Ultimate/UIX capability** — `@ultimate/uix-utils/dom`'s `getFirstFocusableElement`/`getLastFocusableElement` (already consumed today by Angular's `UFocusTrap`/`UAutoFocus` and available to React), confirmed present verbatim this Phase.
- **Dynamic-content handling**: a `MutationObserver` on the trapped element's `childList`, redirecting focus if it is lost after a mutation — carrying forward this verified real capability, using `@ultimate/uix-utils/dom`'s existing helpers for the redirect-target lookup, not a new focus-lookup algorithm.
- **Initial/autofocus**: mirrors verified behavior — `autoFocus` binding value, selector-based override, fallback to first focusable element.
- **Disabled state, explicit contract**: `binding.value.disabled` drives a two-state directive-lifecycle contract, matching verified `FocusTrap.js` exactly — `disabled = true` → the directive is **unbound/inactive**: at `mounted`, sentinel creation and event/`MutationObserver` binding are skipped entirely (verified: `if (!disabled) { this.createHiddenFocusableElements(...); this.bind(...); this.autoElementFocus(...); }` — nothing runs when `disabled` is true); if `disabled` transitions to `true` at `updated`, the directive unbinds (`disabled && this.unbind(el)`), removing the `MutationObserver` and event listeners. `disabled = false` → the directive is **bound/active**: sentinels exist, focus redirection is live, auto-focus has run (or will run once `mounted`/`updated` next execute with `disabled = false`). This is a clarification of already-verified behavior, not a change to the underlying mechanism (§14's sentinel-span/`MutationObserver` architecture is unchanged).
- **Focus restoration**: FocusTrap itself does not restore focus (verified — no such logic in `FocusTrap.js`); this responsibility belongs to the consuming component (`UDialog` restores focus-on-close per its own verified source, §15) — matching React's identical division of responsibility (Phase 3 §14).
- **Nested traps**: no coordination mechanism exists in verified source — single-level only, matching Dialog's own single-trap usage, not a Phase 4 requirement.
- **Cleanup/unmount**: `unbind()` disconnects the `MutationObserver` and removes the two event listeners on the directive's `unmounted` hook; sentinel spans are DOM children removed automatically when Vue removes the trapped element.
- **SSR**: no `document`/`MutationObserver` calls run during SSR — Vue directive `mounted` hooks are inherently client-only by Vue's own contract, no extra guard code needed (verified: no SSR-guard code exists in `FocusTrap.js` itself, and none is needed).
- **Teleport interaction**: none required — the directive operates on whatever element it's bound to regardless of where Teleport relocates that element in the DOM.
- **Interaction with Dialog**: `UDialog`'s root element carries `v-focustrap="{ disabled: !modal }"`, matching verified `Dialog.vue` usage exactly.

---

## 15. Dialog

**Verified source behavior** (`Dialog.vue`, full read): controlled via `props.visible`/`emit('update:visible', false)` (Vue's v-model convention, not a raw `onHide` callback — a genuine, evidence-backed API-shape difference from both Angular's and React's `UDialog`, per §21's "behavioral contract, not mechanism" principle). Already wires `role="dialog"`, `:aria-labelledby="ariaLabelledById"`, `:aria-modal="modal"` correctly on the root element (verified — not a gap, matching Dialog's already-correct state in both Angular and React). Composes `Portal` + native `<transition>` (→ `createMotion`, §17) + `v-focustrap` directly in its own template, matching the "no shared orchestration service" pattern (§13).

### `UDialog` — controlled component contract

```text
visible: boolean            (v-model:visible)
@update:visible: (value: boolean) => void
```

Vue-native v-model shape — a genuine, verified-appropriate deviation from Angular's `[visible]`/`(visibleChange)` two-way-binding-via-events convention and React's `visible`/`onHide` controlled-prop convention, since v-model is Vue's own idiomatic mechanism for exactly this shape, matching PrimeVue's own real API (verified).

### Verified feature surface, scoped per proof-set requirements

PrimeVue's real Dialog additionally supports **draggable** (verified: `initDrag`/`bindDocumentDragListener`/`bindDocumentDragEndListener`, full mouse-drag positioning with `keepInViewport` bounds-checking) and **maximizable** (verified: `maximize()`/`maximized` state, icon swap, scroll-lock toggling on maximize) — resizable was **not found** as a feature anywhere in `Dialog.vue`'s real source (unlike PrimeReact, which has all three).

> **`UDialog` does not expose or implement draggable or maximizable behavior in Phase 4 unless a separately approved scope decision explicitly adds one of those features.**

This boundary is explicit and firm, matching the fork resolved during this Phase's architecture-approval gate (the recommended, user-approved option: cut both, keep `UDialog` scope identical across Angular/React/Vue). No `draggable`/`maximizable` props exist on Phase 4's `UDialog` public API, no drag/resize event handlers are wired, no maximize-toggle UI is rendered. This decision is not reopened by this spec — it restates and locks the already-resolved fork.

### In scope for Phase 4's `UDialog`

- Portal-rendered mask + content (§13)
- `v-focustrap` directive applied to root, `{ disabled: !modal }` (§14)
- `createMotion`-driven enter/leave via native `<transition>` hooks (§17), replacing verified PrimeVue's own `<transition>` wiring with Ultimate's motion primitive behind the same hook callbacks
- Shared Escape handling via the §11 adapter, `PRIORITY.DIALOG`
- Z-index via `@ultimate/uix-utils/zindex`, `'modal'` key (§12), matching PrimeVue's verified call exactly
- Body-scroll blocking coordination via the §16 adapter
- `role="dialog"`/`aria-labelledby`/`aria-modal` (already correct per verified source, preserved)
- Focus-return-on-close (verified: `onEnter` captures `document.activeElement` into `this.target`; `onLeave` calls `focus(this.target)` — matching both Angular's and React's already-shipped behavior, all three frameworks converged independently)
- Header/content/footer composition, close button, mask-click-to-dismiss (verified: `onMaskMouseDown`/`onMaskMouseUp` guarding against drag-selection false-triggers — a real interaction-correctness detail to preserve, not simplify away)

---

## 16. Dialog Scroll Blocking

**Verified source behavior**: `Dialog.vue`'s `enableDocumentSettings()`/`unbindDocumentState()` call `blockBodyScroll()`/`unblockBodyScroll()` (from a local `primevue/utils` module, itself thin-wrapping `@primeuix/utils`'s functions, passing a theme-token `variableName` option) **directly, with no reference-counting**. Two simultaneously-open modal Dialogs would double-block, and the first to close would incorrectly unblock while the second is still open — verified real gap, same class of issue as §11's Escape gap.

**Existing Ultimate/UIX capability, direct reuse**: `blockBodyScroll`/`unblockBodyScroll` already exist in `@ultimate/uix-utils/dom`, already framework-neutral, already ported from Phase 1.

**Existing Ultimate/UIX capability, already built and already tested-in-spirit**: `react-core/src/scroll-lock/use-scroll-lock.ts` already implements a module-scoped `Set<string>` of registered blocking-dialog IDs, with `register(id)`/`unregister(id)` calling `blockBodyScroll()`/`unblockBodyScroll()` only at the 0→1/1→0 set-size transitions — its own in-code comment explicitly states it "replaces PrimeReact's verified `document.primeDialogParams` global-mutation pattern."

**Extraction decision (resolved, verified by direct re-inspection of `react-core/src/scroll-lock/use-scroll-lock.ts`)**: unlike §11's Escape module, this entire file has **zero load-bearing React coupling** — verified by full read: the module-scoped `blockingIds: Set<string>`, `SCROLL_LOCK_OPTIONS` constant, and the `register`/`unregister` transition logic (`add`/`delete`, size-check, calling the already-framework-neutral `blockBodyScroll`/`unblockBodyScroll` from `@ultimate/uix-utils`) are plain functions with no framework state. The only React import is `useCallback`, used purely to give the returned functions a stable reference across re-renders — a memoization convenience, not a reactivity dependency (the functions close over module-scoped state, not component state; `useCallback`'s empty dependency array confirms nothing component-local is captured).

**UltimateVue architectural decision — extract in full into `@ultimate/uix-utils`, do not depend on `react-core`**:

```text
vue-core → uix-utils/scroll-lock   (new)
react-core → uix-utils/scroll-lock (new, react-core's existing file becomes a thin useCallback wrapper over it)
```

not `vue-core → react-core`. Same precedent as §11 and the existing `zindex`/`eventbus` shape — a plain, module-scoped, imperative registry lives in `uix-utils`, each framework's `*-core` package wraps it minimally.

- **Extracted to `@ultimate/uix-utils/scroll-lock` (new submodule)**: the entire `blockingIds` `Set`, `SCROLL_LOCK_OPTIONS`, and `register(id)`/`unregister(id)` functions, verbatim — this module needs no framework-specific adapter logic at all beyond what each `*-core` package already needs for its own component-lifecycle wiring.
- **Stays framework-specific in each `*-core` adapter**: nothing beyond the lifecycle call site itself — `react-core`'s `useCallback` wrapper (kept for React's reference-stability convention, now delegating to the shared functions instead of owning the `Set`) and `vue-core`'s own `mounted`/`beforeUnmount` mixin-hook call sites (§7).

Recorded as a required pre-Phase-4-implementation refactor of `react-core/src/scroll-lock/use-scroll-lock.ts`, matching §11's note exactly — `react-core`'s existing file must delegate to the new shared module, not remain a parallel, duplicate implementation. No code changes performed as part of this spec-review gate; see §31 for risk tracking and §33 for the exit-criteria implication.

### UltimateVue implementation shape (once the extraction above lands)

```text
register(id):    add id to the set; if set size becomes 1, call blockBodyScroll()
unregister(id):  remove id from the set; if set size becomes 0, call unblockBodyScroll()
```

- **Registration**: called from `UDialog`'s `mounted`/visibility-watcher lifecycle hook when `blockScroll` is true and the dialog is visible, calling `@ultimate/uix-utils/scroll-lock`'s shared `register` directly — not through `react-core`.
- **Unregistration**: called on hide/`beforeUnmount`.
- **Multiple blocking dialogs**: the Set naturally coalesces — scroll stays blocked as long as at least one dialog is registered, matching React's already-correct implementation, now genuinely shared logic rather than parallel reimplementation.
- **Cleanup**: unregister must run even on abrupt unmount, not just on a graceful hide, to avoid a stuck-blocked-scroll state.

---

## 17. Motion

**Verified source behavior**: `Dialog.vue`'s `<transition name="p-dialog" @enter="onEnter" @after-enter="onAfterEnter" @before-leave="onBeforeLeave" @leave="onLeave" @after-leave="onAfterLeave" appear>` — Vue's **native `<transition>` element**, not a wrapper library (confirmed by direct source read — no `react-transition-group`-equivalent import anywhere in `Dialog.vue` or its dependency closure). Declarative, JSX/template-driven, hook-callback-based.

**Existing Ultimate/UIX capability**: `@ultimate/uix-motion`'s `createMotion(element, options)` — imperative, Promise-based (`.enter()`/`.leave()`), framework-agnostic by construction, already proven working from two independent call-site shapes: Angular's `effect()` and React's `useEffect`.

### UltimateVue architectural decision — reuse `createMotion`, wired through native `<transition>` hooks

**No new runtime dependency** — `createMotion`'s Promise-based API is directly callable from Vue's `<transition>` hook callbacks the same way it's called from Angular's `effect()` and React's `useEffect`:

```text
<transition
  @enter="(el, done) => { createMotion(el, motionOptions).enter().then(done); }"
  @leave="(el, done) => { createMotion(el, motionOptions).leave().then(done); }"
/>
```

- **Enter/leave**: driven by the component's own `visible` state changing, which Vue's `<transition>` element observes natively — `createMotion`'s `.enter()`/`.leave()` calls are wired into the `done` callback contract Vue's transition hooks expect (unlike React, which drives visibility via its own state/effect cycle without a native transition-hook-with-done-callback primitive — a genuine, evidence-backed mechanism difference between the two adapters, both calling the identical underlying `createMotion` API).
- **Cancellation**: `motion.cancel()` on the transition's `@enter-cancelled`/`@leave-cancelled` hooks (Vue's native cancellation-hook pair) — already a first-class verified `createMotion` capability.
- **Cleanup**: `createMotion`'s own `run()` already removes transition classes and resolves/rejects appropriately — no additional cleanup logic needed beyond the cancellation wiring above.
- **Reduced-motion**: existing Ultimate/UIX capability — `createMotion`'s `safe` flag wired to `isPrefersReducedMotion()`, inherited automatically, no new work required (same as Phase 3 §17).

PrimeVue's actual `<transition>` wiring (verified `onEnter`/`onAfterEnter`/`onBeforeLeave`/`onLeave`/`onAfterLeave` callback shape) remains reference evidence for what side effects (focus capture, z-index set/clear, scroll-lock register/unregister, event emission) belong at each lifecycle point — already incorporated into §15's `UDialog` composition — not for the transition mechanism itself, which uses `createMotion` instead of PrimeVue's own CSS-class-based transition-name convention.

---

## 18. Button

**Verified source behavior** (`Button.vue`/`BaseButton.vue`, full read): real prop surface — `label`, `icon`+`iconPos` (`left`/`right`/`top`/`bottom`), `iconClass`, `badge`+`badgeClass`+`badgeSeverity`, `loading`+`loadingIcon`, `as`+`asChild` (polymorphic root-element pattern), `link`, `severity`, `raised`/`rounded`/`text`/`outlined`/`plain` (independent booleans, matching both Angular's and React's already-established boolean-modifier convention — **third independent cross-framework convergence**, not a new design choice), `size`, `variant`, `fluid`. `v-ripple` directive applied directly in the verified template (`<component v-if="!asChild" :is="as" v-ripple ...>`). `inject: { $pcFluid }` for ambient Fluid-context detection (matching Angular's verified "Fluid ancestor-detection wiring", ADR-018's explicit mention).

**Rendering order** (verified template): loading-icon-or-icon slot → label → children → `Badge` (conditional) → root element wraps all, `v-ripple` applied to root.

**Accessibility**: default `aria-label` computed as `label + (badge ? ' ' + badge : '')` when unset (verified: `defaultAriaLabel` computed), matching both Angular's and React's identical pattern.

### Ultimate API comparison — convergent evidence across all three frameworks

**Existing Ultimate/UIX capability**: Angular's `UButton` and React's `UButton` both already independently declare `severity`/`raised`/`rounded`/`text`/`outlined`/`size` as their public API (Phase 2/Phase 3, both verified against their own upstream sources) — this Phase's verification of PrimeVue's real `Button.vue` is the **third** independent confirmation that this boolean-modifier shape, not a single `variant` enum, is the real, convergent API across Prime's own Angular/React/Vue implementations.

**UltimateVue architectural decision**: preserve the verified boolean-modifier prop set as `UButton`'s public API, directly supported by three-way convergent evidence. `v-ripple` applied to the root element, matching verified source — since Vue's real Button (unlike React's, which deferred Ripple entirely per ADR-031) does wire the directive directly, `UButton` renders with the ripple effect active in Phase 4 (§6's classification note). `asChild`/`as` polymorphic-root pattern preserved as a genuine Vue-appropriate mechanism (Vue's `:is` dynamic-component binding is the natural fit, distinct from how Angular/React would express the same concept).

---

## 19. Checkbox

**Verified source behavior** (`Checkbox.vue`, `BaseCheckbox.vue`, `BaseInput.vue`, `BaseEditableHolder.vue` — all full reads, closing this section's prior verification gap): the real inheritance chain is **`Checkbox extends BaseCheckbox extends BaseInput extends BaseEditableHolder extends BaseComponent`** — one tier longer than this spec previously assumed (`BaseInput` was not previously read; it adds `size`/`fluid`/`variant` props and `$variant`/`$fluid` computeds, matching the same `fluid`-ambient-context pattern already documented for Button, §18). `BaseEditableHolder` provides `modelValue`/`update:modelValue`/`value-change`, `d_value` internal state, and the `controlled` computed (`$inProps.hasOwnProperty('modelValue')`) — genuinely supports both controlled (v-model) and uncontrolled (`defaultValue`-only) modes, a real difference from PrimeReact's fully-controlled-only Checkbox.

**Real rendered DOM structure, now verified (prior gap closed)**: a dual-element pattern — a real, fully-semantic native `<input type="checkbox">` (carrying `checked`/`disabled`/`readonly`/`required`/`tabindex`/`name`/`aria-labelledby`/`aria-label`/`aria-invalid`) plus a separate decorative `<div class="box">` rendering `CheckIcon` (checked) or `MinusIcon` (indeterminate) via a default slot. Real focus/change events (`@focus`/`@blur`/`@change`) bound directly to the native input.

**Correction to a claim this spec would otherwise have carried over from Phase 3 by unverified analogy**: PrimeVue's real Checkbox **does** have an `indeterminate` prop (verified: `BaseCheckbox.vue`'s `indeterminate: { type: Boolean, default: false }`, plus `d_indeterminate` local state, an `update:indeterminate` emit, a `MinusIcon` rendered when indeterminate, and a `this.$refs.input.indeterminate = this.d_indeterminate` DOM-property sync in `updateIndeterminate()` called from `mounted`/`updated`). This is the opposite of PrimeReact's verified Checkbox (Phase 3 §19: "No `indeterminate` prop exists anywhere in verified source") — a genuine, evidence-backed divergence between the two upstream references, not an inconsistency in this spec.

**Real, previously-undocumented value-mode surface**: `binary: Boolean` prop switches between two real modes — `binary: true` uses `trueValue`/`falseValue` against a single `modelValue` (matching PrimeReact's only mode); `binary: false` (the default) treats `modelValue` as an **array** and the checkbox's own `value` prop as a member to add/remove (`contains(this.value, value)` for the `checked` computed, `value.filter(...)`/`[...value, this.value]` in `onChange`) — a real multi-checkbox-group-into-one-array-model pattern PrimeReact's Checkbox has no equivalent for at all (verified: no `binary`-equivalent mode exists in PrimeReact's `Checkbox.js`).

**Real, previously-undocumented group composition**: `inject: { $pcCheckboxGroup }` — when present, `checked`/`onChange`/`groupName` all delegate to the injected `CheckboxGroup` instance instead of the individual checkbox's own `d_value`. `CheckboxGroup` is a separate PrimeVue component, not read in detail this pass (its own component, not part of the Phase 4 proof set) — recorded here as a real, verified integration point `UCheckbox` may encounter but is not required to support standalone (§30's "not every catalog area gets full inspection" posture applies to `CheckboxGroup` itself, distinct from `Checkbox`'s own core behavior, which is now fully verified).

**No test file exists for Checkbox** in PrimeVue 4.5.5 (verified — confirmed absent, same as Phase 3's finding for React).

**Live `@primevue/forms` integration verified and excluded**: `BaseEditableHolder.vue`'s `inject: { $pcForm, $pcFormField }`, `formField.onChange`, `$formNovalidate`/`$formValue`/`$formDefaultValue`/`$formControl` computed chain — a real, working integration with a separate, unpinned, unevaluated PrimeVue package. Confirmed excluded per this Phase's resolved Gate 6 #2 fork. `Checkbox.vue`'s own `onBlur` calls `this.formField.onBlur?.(event)` — one more concrete call site of the excluded integration, optional-chained so it is a safe no-op once the injection itself is never provided (Ultimate's own `BaseEditableHolder` simply never defines `formField` at all, per §7/§20 — not merely leaves the call unreachable).

### UltimateVue forms contract — the minimum, matching the approved boundary

**Verified**: unlike PrimeReact (which has no broader form abstraction at all, confirmed absent in Phase 3), PrimeVue's real `BaseEditableHolder` **does** provide one (`@primevue/forms` integration) — but it lives in a genuinely separate, unpinned package Ultimate has not evaluated. Excluding it is a deliberate boundary decision, not an assumption that no such thing exists upstream (a materially different justification than Phase 3 §19/§20's "PrimeReact itself has none" reasoning — recorded accurately here, not copied from Phase 3's wording).

`UCheckbox` public contract for Phase 4, matching the Gate 6 #2 forms-exclusion decision exactly, now extended with the real verified surface this section's completed read revealed:

```text
modelValue?: unknown          // v-model — controlled mode when provided
defaultValue?: unknown        // uncontrolled mode when modelValue is absent
binary?: boolean               // default false — true: trueValue/falseValue against a single modelValue;
                                //                 false: modelValue is an array, `value` is this checkbox's member
value?: unknown                 // this checkbox's member value when binary is false (verified real mode)
trueValue?: unknown             // default true — binary mode only
falseValue?: unknown            // default false — binary mode only
indeterminate?: boolean         // default false — verified real prop, opposite finding from React's Checkbox
@update:modelValue: (value) => void
@update:indeterminate: (value) => void
@value-change: (value) => void
@change: (event) => void
@focus: (event) => void
@blur: (event) => void
disabled?: boolean
readonly?: boolean
required?: boolean
invalid?: boolean               // → aria-invalid
name?: string
tabindex?: number
inputId?: string
ariaLabel?: string
ariaLabelledby?: string
```

No `formControl` prop, no `$pcForm`/`$pcFormField` injection, no `@primevue/forms` dependency — the only intentional exclusion from the verified surface. Both controlled (v-model) and uncontrolled (`defaultValue`) modes are supported, and both `binary`/array-membership modes are supported — this is a genuine, evidence-backed, materially larger contract than React's Phase 3 `UCheckbox` (fully controlled, `binary`-only, no `indeterminate`) — each framework's `UCheckbox` correctly reflects its own verified upstream reference's real capability, not a design inconsistency. `CheckboxGroup` composition (`$pcCheckboxGroup` injection) is **not** part of the Phase 4 proof-set contract — `UCheckbox` must function correctly standalone; group composition is deferred, unverified, out of scope (matching §30's inventory posture).

---

## 20. Forms Boundary (formal statement)

Phase 4 does **not** integrate `@primevue/forms`. This is a deliberate scope cut of a real, verified, working upstream integration — not an assumption that no such integration exists (contrast with Phase 3 §20, where PrimeReact genuinely has no equivalent to exclude).

The minimum, evidence-justified contract, matching §19:

```text
v-model (controlled) or defaultValue (uncontrolled)
+
value-change/update:modelValue emits
+
disabled/invalid props
```

`@primevue/forms` — unpinned, unevaluated, no provenance record, no license verification performed. If a later phase needs Ultimate-wide form-validation/registration infrastructure, that is its own evidence-based evaluation (pinning `@primevue/forms`'s real source, running its own Real-Source Verification Gate, deciding whether/how to incorporate it) — not silently absorbed into Phase 4 because `UCheckbox` happened to touch its edge.

---

## 21. Cross-Framework Contracts (UltimateNG ↔ UltimateReact ↔ UltimateVue)

Shared **behavioral** contracts, explicitly not shared **mechanisms**:

| Contract | Shared behavior | Framework-native mechanism (not shared) |
|---|---|---|
| Z-index semantics | Same base bucket values per overlay family, same `ZIndex.set/clear/get` algorithm | All three call the same `@ultimate/uix-utils/zindex` primitive — genuinely shared at the mechanism level too, not just behavior |
| Escape priority | "Topmost, most-recently-shown, highest-priority wins" | Angular: not yet implemented (ADR-020 known gap). React and Vue: the registry/priority-comparison logic is genuinely shared via `@ultimate/uix-utils/escape` (§11, extraction decision); only the mount/unmount lifecycle trigger and the display-order counter's reactive wrapper (`useState` for React, `ref()` for Vue) remain framework-specific |
| Scroll-lock coordination | Refcounted — scroll stays blocked while ≥1 dialog is registered | React and Vue: genuinely shared in full via `@ultimate/uix-utils/scroll-lock` (§16, extraction decision) — only the component-lifecycle call site differs per framework |
| `invalid` → `aria-invalid` | Same mapping concept | Angular: `UBaseEditableHolder`-derived. React: component-local. Vue: `BaseEditableHolder`-derived (Vue's own base actually has this concept natively, unlike React's) |
| Style registration | Real `<style>` injection as an instance-lifecycle-time effect, deduplicated by component name | Angular: currently a documented gap (ADR-023 follow-up #6). React: `ReactStyleSheet`, working. Vue: `VueStyleSheet`, working from day one (§8) |
| Motion lifecycle | `createMotion(element, options)`'s `.enter()`/`.leave()` Promise contract — shared at the mechanism level, not just behavior | Angular calls it from `effect()`; React from `useEffect`; Vue from native `<transition>` hook callbacks (§17) — call-site mechanism differs, the primitive does not |
| Accessibility expectations | Same baseline: correct ARIA roles/states, keyboard operability, focus management, label association | Implementation differs per framework's idiomatic pattern (e.g. Menu's focus technique) |
| Dialog controlled contract | Same underlying concept: an externally-controlled visibility boolean plus a change signal | Angular: `[visible]`/`(visibleChange)`. React: `visible`/`onHide`. Vue: `v-model:visible` (§15) — three different, each framework-idiomatic, shapes for the same contract |

**Explicitly not shared** (verified divergent by design, not by oversight): FocusTrap mechanism (Angular keydown-directive vs React sentinel-span-component vs Vue sentinel-span-directive-with-MutationObserver, §14); Tooltip artifact shape (Angular directive-with-component vs React ref-target component vs Vue pure directive, §9); Menu focus technique (Angular literal DOM focus vs React/Vue `aria-activedescendant` — Vue and React converge here, Angular diverges, §10); Ripple's proof-set inclusion (built and wired for Angular and Vue's real proof-set components; deferred entirely for React per ADR-031, since PrimeReact's own verified source pattern and Phase 3's own scope decision differed) — all intentional, evidence-backed, framework-native choices.

---

## 22. Provenance and Licensing

Reuses the established Phase 1/2/3 provenance model (per Blueprint §8, ADR-005) — no second provenance system introduced.

### Package-level (`docs/architecture/PROVENANCE.md`)

Update the existing `PrimeVue` entry's `Modification status` from "not yet incorporated (Phase 0 — baseline pinned only)" to reflect Phase 4 incorporation, following the exact field template already used by the `PrimeNG`/`PrimeReact` entries.

### File-level manifests

New `docs/architecture/provenance/vue-core.json` and `docs/architecture/provenance/vue.json`, matching the exact schema already established by `ng-core.json`/`ng.json`/`react-core.json`/`react.json`: an array of `{originalPath, ultimateDestination, modificationStatus, modificationDescription}` records per file. Every file with real PrimeVue provenance (e.g. `vue-core/src/focus-trap/*` ← `focustrap/FocusTrap.js`, `focustrap/BaseFocusTrap.js`) records its `originalPath`; every Ultimate-authored file with no upstream equivalent (the `VueStyleSheet` adapter, the Escape-priority Vue wrapper, the scroll-lock Vue wrapper, tests) records `"n/a"` with a `modificationDescription` explaining why.

### `THIRD-PARTY-NOTICES.md`

`packages/vue/THIRD-PARTY-NOTICES.md` already exists (Phase 0 stub, verified accurate: correct MIT license text, correct `primevue@4.5.5` naming) — verify it remains accurate at implementation time; `packages/vue-core/THIRD-PARTY-NOTICES.md` does not yet exist and must be created following the same template.

### No PrimeVue runtime dependency

Enforced by the same CI mechanism already protecting Angular/React (`scripts/provenance/validate-dependency-ceiling.mjs`) — extend its scope to `packages/vue`/`packages/vue-core`.

### Reused-logic provenance — a new pattern this Phase introduces

`vue-core`'s Escape (§11) and scroll-lock (§16) adapters consume the new, shared `@ultimate/uix-utils/escape`/`scroll-lock` submodules — the same submodules `react-core` is refactored to consume (§11/§16's extraction decision; `react-core` no longer owns this logic outright once the refactor lands). The corresponding `vue-core.json` manifest entry's `modificationDescription` must name **both** the original PrimeVue verified-gap finding **and** the specific `uix-utils` submodule consumed (e.g. `"Consumes @ultimate/uix-utils/escape's shared priority-tuple registry (extracted from react-core/src/escape/use-global-escape-key.ts during Phase 4 prerequisite work); PrimeVue's own Dialog.vue keydown listener has no equivalent stacking mechanism (verified gap)"`) — this is a new provenance-chain shape (Ultimate-to-Ultimate reuse via a shared framework-neutral module, not Prime-to-Ultimate, and not a direct cross-framework `*-core`-to-`*-core` dependency) that Phase 2/3's manifests never needed to express; the schema itself does not change, only the convention for what `modificationDescription` states. `react-core.json`'s own entries for `src/escape/`/`src/scroll-lock/` must be updated in the same prerequisite refactor to reflect their new delegate-to-`uix-utils` status.

### Traceability chain (strengthens, does not replace, the existing provenance model)

```text
Verified PrimeVue source
        ↓
Verified behavior/API/dependency
        ↓
Ultimate architectural decision
        ↓
Implementation file(s)
        ↓
Test proving the behavior
```

Implementation-plan tasks for Phase 4 must preserve this same chain per task — citing the specific verified source file/line this spec already cites, not re-deriving from memory or generic Vue convention. Especially load-bearing for this spec's intentional deviations (table below).

| Deviation | Verified source anchor | Ultimate decision | Spec section |
|---|---|---|---|
| Tooltip `aria-describedby` | `Tooltip.js` (no such wiring found) | Add it, additive/owned-ID-only-cleanup contract | §9 |
| Menu `aria-activedescendant` | `Menu.vue` (`focusedOptionIndex`, `aria-activedescendant` binding) | Preserve, diverge from Angular's literal-focus `UMenu`, converge with React | §10 |
| FocusTrap sentinel + MutationObserver | `FocusTrap.js`, `BaseFocusTrap.js` (full reads) | Preserve mechanism as a directive, Ultimate-owned implementation | §14 |
| Escape priority reuse | `Dialog.vue` (weak mechanism, verified) + `react-core/escape` (already-built algorithm, extracted to `uix-utils/escape`) | Thin Vue adapter over the shared `uix-utils/escape` registry, not PrimeVue's own weaker mechanism, not a direct `react-core` dependency | §11 |
| Scroll-lock refcounting reuse | `Dialog.vue`'s `blockBodyScroll`/`unblockBodyScroll` calls (un-refcounted, verified) + `react-core/scroll-lock` (already-built refcounting, extracted to `uix-utils/scroll-lock`) | Thin Vue adapter over the shared `uix-utils/scroll-lock` registry, not a direct `react-core` dependency | §16 |
| UIX motion via native `<transition>` | `Dialog.vue`'s real `<transition>` usage (confirms no wrapper-library dependency) | Reuse `@ultimate/uix-motion/createMotion` via transition hooks | §17 |
| UIX styling adapter | `BaseComponent.vue`'s `_loadCoreStyles`/watcher pattern (full read) | `StyleSheet` subclass + `createStyleElement`, instance-lifecycle-time registration | §8 |
| Passthrough exclusion | `BaseComponent.vue`, `BaseDirective.js` (two separate ~140-line passthrough implementations) | Excluded entirely from both mechanisms, Option B posture | §7 |
| `$parentInstance` exclusion | `BaseComponent.vue`'s `inject` block | Excluded | §7 |
| Forms exclusion | `BaseEditableHolder.vue`'s live `@primevue/forms` integration (verified, real, working) | Excluded — deliberate boundary cut of a real feature, not an absence-of-feature finding | §19, §20 |
| Dialog draggable/maximizable exclusion | `Dialog.vue`'s `initDrag`/`maximize()` (verified real features) | Excluded, matches Angular/React proof-set scope | §15 |

---

## 23. Testing Strategy

**Verified gap, directly informing this section**: PrimeVue's own test coverage across the proof set is uneven — only Button has a real `Button.spec.js`. Checkbox, Dialog, Menu, Tooltip, and FocusTrap have **zero** PrimeVue-authored tests (verified). Ripple has a real `Ripple.spec.js` (the sole directive-test precedent). Ultimate cannot rely on upstream tests as a behavioral oracle for most of the proof set — same posture Phase 2/3 already took.

### Tooling

**Verified source behavior**: Vitest (`^0.29.8`) + `@vue/test-utils` (`^2.0.0`), `@vitejs/plugin-vue`, jsdom environment — confirmed directly from PrimeVue's own `vitest.config.js`/`package.json`. This is both PrimeVue's own real, verified upstream choice and the direct Vue-ecosystem equivalent of Angular's Vitest-builder-plus-`TestBed` (ADR-022) and React's Vitest-plus-Testing-Library — matching the Vitest-everywhere posture already established repo-wide.

**Directive testing confirmed viable**: `Ripple.spec.js` (verified, full read) mounts an inline anonymous template component and registers the directive globally via `config.global.directives = { Ripple }` — `@vue/test-utils`'s own supported mechanism for directive testing, confirmed working. Same mechanism applies directly to `v-focustrap`/`v-tooltip` testing, closing the "no test precedent for a directive" gap those two would otherwise have.

### Minimum categories, mapped to verified behavior

- **Rendering**: each of the 5 components/directives renders its verified DOM structure (e.g. Checkbox's dual native-input-plus-box, verified §19; Button's icon/label/badge/children order, verified §18; Menu's `role="menu"`/`menuitem` structure, verified §10).
- **Props**: every prop enumerated in §18/§19 (and the equivalent verified surfaces for Dialog/Menu, §15/§10, both now fully verified) has at least one test.
- **v-model**: `UCheckbox`'s controlled (`modelValue`) and uncontrolled (`defaultValue`) modes both tested — a genuinely broader test surface than Phase 3's React `UCheckbox` needed, since Vue's real `BaseEditableHolder` supports both (§19).
- **Controlled/uncontrolled behavior**: explicit test asserting `controlled` computed's `$inProps.hasOwnProperty` detection logic behaves correctly in both modes.
- **Events**: `update:modelValue`/`value-change` (Checkbox), `update:visible` (Dialog, §15's v-model shape), item-click (Menu).
- **Keyboard interaction**: Menu's full verified key set (§10 — arrows, Home/End, Enter/Space, Escape, Tab, including a regression test for the verified `Escape`→`Tab` fall-through quirk); Dialog's Escape via §11's shared adapter (a materially different mechanism from Menu's own local `keydown` handler, per §10's correction — each needs its own test category, not a shared one).
- **Accessibility**: `role`/`aria-*` attributes per §26, including regression coverage for the Tooltip `aria-describedby` deviation (§9) and the already-correct Dialog attributes (§15).
- **Directives**: `v-focustrap` (sentinel-span redirection, autofocus, disabled state, `MutationObserver` dynamic-content redirection — a genuinely new test category neither Angular's nor React's FocusTrap needed), `v-tooltip` (show/hide, `aria-describedby` lifecycle), `v-ripple` (visual-only, but its presence/absence on Button/Dialog per §18/§6's classification should be asserted).
- **FocusTrap**: new tests, since no upstream tests exist to adapt — matching Phase 3's identical situation.
- **Overlay lifecycle**: mount → show → hide → unmount for Dialog/Menu(popup)/Tooltip, including Portal/Teleport presence/absence.
- **Escape priority**: multi-instance stacking — the shared `@ultimate/uix-utils/escape` registry gets its own spec file (covering priority-tuple wins, `when`/gating, deregistration) ported from `react-core/escape/escape.spec.ts`'s test *design*, per §11's note; `vue-core`'s own adapter test covers only its thin lifecycle/reactivity wrapper, not the registry logic a second time.
- **Z-index**: `ZIndex.set`/`.clear` invoked correctly per overlay open/close cycle, using the now-verified per-component keys (§12 — `'modal'`/`'menu'`/`'tooltip'`, all confirmed).
- **Scroll locking**: 0→1 and 1→0 transitions with multiple simultaneous dialogs — direct regression coverage for the adapter replacing PrimeVue's own un-refcounted calls (§16). No existing upstream test to port (`use-scroll-lock.ts` has no spec file either, per the prior architecture-approval gate's explicit flag) — this is new test-authoring work for both the eventual React gap-closure and this Vue adapter, not inherited from anywhere.
- **Motion**: `createMotion` `.enter()`/`.leave()` invoked from `<transition>` hook callbacks on visibility change, `.cancel()` on the cancellation hooks (§17).
- **Style injection**: `VueStyleSheet` adapter actually creates a real `<style>` element — regression test for the same class of gap ADR-023 found on Angular's side, must pass for Vue from day one, matching React's precedent.
- **Cleanup**: every lifecycle-based subscription (Escape listener, `MutationObserver`, scroll-lock registry, event listeners) removes itself on unmount — leak regression coverage.
- **SSR-sensitive behavior**: Portal's `isClient()` guard, `VueStyleSheet`'s `typeof document` guard, FocusTrap directive's inherent client-only `mounted`-hook guarantee — at minimum a render-without-crash assertion under a simulated server environment, not a full SSR framework integration.
- **Tooltip `aria-describedby`**: explicit regression test matching Phase 3 §9/§23's exact contract (present while visible, removed on hide/unmount, existing unrelated value preserved, only the owned ID removed on cleanup).
- **Dialog feature boundary**: explicit negative test asserting `UDialog` exposes no `draggable`/`maximizable` props and renders no drag-handle/maximize-toggle UI in Phase 4 (§15) — regression guard against silent scope creep.

---

## 24. Consumer/Build Validation

**Package build validation** (in scope, achievable this phase): `tsup` (plus the Vue compilation step, §3) builds both packages without error; declared `package.json` `exports` resolve; a Vitest suite (matching Phase 1/3's precedent) asserts every declared export subpath resolves and imports/mounts without throwing.

**Real application validation** (explicitly out of Phase 4 scope, documented rather than hidden): `apps/playground-vue` remains a stub (`.gitkeep` only) through Phase 4, matching the exact posture ADR-023 already accepted for `apps/playground-angular` and Phase 3 accepted for `apps/playground-react`. No claim about real-world tree-shaking, bundle isolation, or consumer ergonomics may be made without a real consuming application — this spec explicitly does not claim tree-shaking success (§29).

---

## 25. Security

**Verification status**: security scan performed this gate, both tiers — proof-set dependency closure (§6's file list: button, checkbox, dialog, menu, tooltip, focustrap, ripple, portal, badge, plus the full `packages/core/src` foundation tier) and the full `packages/primevue/src` catalog (150 directories) — direct `grep` for `innerHTML`, `v-html`, `eval(`, `document.write` across every `.vue`/`.js` file (excluding upstream `.spec.js` files). Prior verification gap closed.

**Proof-set closure result**: exactly **two** files use `innerHTML`, both real, both precisely characterized below. Zero `v-html` directive usage anywhere in the closure. Zero `eval`. Zero `document.write`.

**Full-catalog result**: **13** files total use `innerHTML` catalog-wide (of which the 2 proof-set files above are a subset) — `Paginator.vue`, `DataTable.vue`, `TreeTable.vue`, `OrderList.vue`, `Carousel.vue`, `Popover.vue`, `PickList.vue`, `BadgeDirective.js`, `GalleriaThumbnails.vue`, `DatePicker.vue`, `Toast.vue`, plus the two proof-set files. All 11 non-proof-set files are out of Phase 4 scope, not individually inspected this gate — recorded here as known upstream risk surface for whichever future phase incorporates any of them, matching Phase 3 §25's `Editor.js` precedent exactly. Zero `eval`, zero `document.write` anywhere in the full catalog.

### Proof-set-specific findings (both now fully verified — prior gap closed)

- **Tooltip content injection — the real mechanism, precisely characterized**: `Tooltip.js`'s `create(el)` method (verified, lines 294-306) branches on the directive's `escape` option (default `true`, per §9's already-verified `beforeMount` logic): when `el.$_ptooltipEscape` is true (the default), content is set via `tooltipText.innerHTML = ''` followed by `tooltipText.appendChild(document.createTextNode(el.$_ptooltipValue))` — safe, text-node-only, equivalent to React's verified `textContent` behavior (Phase 3 §25). When `el.$_ptooltipEscape` is explicitly set to `false` by the caller (an opt-in, not a default), content is set via `tooltipText.innerHTML = el.$_ptooltipValue` directly — a real, deliberate, caller-opt-in-only HTML-injection path, not a default-unsafe behavior. This is a genuine, evidence-backed divergence from React's Tooltip, which has no equivalent opt-in-raw-HTML mode at all (verified absent in Phase 3's Tooltip.js read).
- **UltimateVue architectural decision, informed by this finding**: `UTooltip`'s content-rendering contract should preserve the same two-mode shape — a safe, `createTextNode`-based default, plus an explicit, clearly-named, opt-in-only escape hatch for callers who need raw HTML (matching PrimeVue's real `escape: false` option name/shape, or an Ultimate-owned equivalent naming). The default path must never be the unsafe one. Regression test required (§23): assert the default path never renders caller content via `innerHTML`, and that the opt-in raw-HTML path is only reachable via the explicit option, not a fallback.
- **Dialog's `createStyle()` — a second real, minor finding**: `Dialog.vue`'s `createStyle()` method (verified, lines 278-299) builds a `<style>` element's `innerHTML` from `this.breakpoints` (a caller-supplied prop object) via unescaped string interpolation: `` `@media screen and (max-width: ${breakpoint}) { .p-dialog[...] { width: ${this.breakpoints[breakpoint]} !important; } }` `` for each `breakpoint` key. This writes caller-controlled string content into a `<style>` element's `innerHTML` — a CSS-parsing context, not an HTML/script-execution context, so this is not a script-injection vector the way `innerHTML` on a regular element would be, but it is unescaped string interpolation into DOM-injected CSS from a caller-supplied object's keys, and this spec records it precisely rather than waving it away as equivalent to Tooltip's finding. **UltimateVue architectural decision**: if `UDialog`'s Phase 4 scope includes a `breakpoints`-equivalent responsive-width prop (not yet decided — `breakpoints` was not covered by §15's Phase 4 scope statement, which focused on the draggable/maximizable cut), this same interpolation pattern must be evaluated for CSS-injection-safety (e.g. validating `breakpoint` keys are well-formed media-query fragments, not arbitrary strings) before being carried over — not ported as-is without that check. If `breakpoints` is not in Phase 4's `UDialog` scope at all, this finding is recorded for a future phase, not blocking Phase 4 exit.
- **Dynamic attributes/properties**: `mergeProps`/`cx`/`ptm`-style prop spreading (verified pattern in `Button.vue`) spreads caller-supplied props onto real DOM elements via `v-bind="attrs"`. Ultimate's scoped-down base (§7, no `pt` system) reduces this surface relative to verified PrimeVue, matching Angular's `UBind` precedent and React's identical note (Phase 3 §25) — accepted, documented, typed-API-bounded risk.
- **DOM style injection**: the `VueStyleSheet` adapter (§8) injects `css` strings originating from Ultimate-authored style modules only — same trust boundary as the existing `createStyleElement` primitive, not affected by either finding above.
- **Portal/Teleport rendering**: standard Vue `<Teleport>`, no custom DOM manipulation beyond Vue's own reconciliation.

---

## 26. Accessibility Baseline

Minimum baseline for all five proof-set components/directives, cross-checked against Angular/React's already-established `source-confirmed`/`runtime-tested` distinction. All five rows are now `source-confirmed` — the prior gaps (Checkbox, Menu's full surface, Tooltip's role) are closed this gate.

| Component | Verified roles/states | Keyboard | Focus | `aria-*` |
|---|---|---|---|---|
| Button | native root element semantics (via `as`/`asChild`) | native | native | default computed `aria-label` (§18) |
| Checkbox | native `<input type="checkbox">` inside a styled `<div class="box">` wrapper (verified, §19) | native (space-toggle via native input) | native | `aria-labelledby`/`aria-label` on the native input (verified), `aria-invalid` from `invalid` prop (verified via `BaseEditableHolder`'s `$invalid` computed) |
| Dialog | `role="dialog"`, `aria-modal`, `aria-labelledby` (already correct, verified) | Escape (priority-aware, §11), Tab cycling via `v-focustrap` | FocusTrap + focus-return-on-close (verified, preserved) | as listed |
| Menu | `role="menu"` on the list, `role="menuitem"` on items, `role="none"`/`role="separator"` on submenu-label/separator items, `aria-activedescendant` (all verified, §10) | full verified key set: arrows, Home/End, Enter/Space, Escape (local handler, §10's correction), Tab | virtual focus (`aria-activedescendant`) | `aria-label`/`aria-labelledby` on the list, `aria-label`/`aria-disabled` on items (verified, §10) |
| Tooltip | `role="tooltip"` confirmed present (verified, §9/§25) | n/a (pointer/focus-driven, per directive lifecycle) | n/a | `aria-describedby` on target, additive/non-destructive per §9's contract (**intentional deviation**) |

**Verification tiers** (per Phase 2/3's established distinction):
- `source-confirmed`: verified directly from `.vue`/`.js` source — every row above, this gate's completed reads.
- `runtime-tested`: to be established during implementation via the Vitest+`@vue/test-utils` suite (§23) — not yet performed.
- `automatically scanned`: not performed this phase.
- `manually validated`: not performed this phase.

---

## 27. Vue Compatibility Policy

**UltimateVue architectural decision**: Ultimate owns its own Vue compatibility policy, not automatically tied to PrimeVue's release cadence — matching Blueprint §18 and Phase 3 §27's identical posture for React.

- **Initial supported range**: `vue: ^3.5.0` — verified this gate via `npm view @primevue/core@4.5.5 peerDependencies`, matching Phase 3 §27's exact methodology. `primevue@4.5.5` itself declares no `peerDependencies` field (its own dependency on `"@primevue/core": "4.5.5"` — an exact pin, not a range — is where the real Vue constraint lives; verified via `npm view primevue@4.5.5 dependencies`). Chosen as the starting point because it is real, version-scoped, verified evidence — not because Ultimate is bound to track PrimeVue's cadence going forward, same posture Phase 3 §27 already established for React.
- **TypeScript**: match the monorepo's existing TypeScript version floor — implementation-time confirmation, not re-derived here.
- **Future Vue majors**: evaluated independently by Ultimate when they ship, using the same evidence-based process this spec followed. Record the decision in `docs/architecture/COMPATIBILITY.md`'s existing table format when it happens.

---

## 28. Package Boundary Rules

Dependency direction, enforced:

```text
@ultimate/vue
        ↓
@ultimate/vue-core
        ↓
@ultimate/uix-*
```

Prevented, matching the existing CI posture already protecting `ng`/`ng-core` and `react`/`react-core` (`scripts/provenance/validate-boundaries.mjs`, `validate-dependency-ceiling.mjs` — extend scope, do not fork a second validator):

- `vue-core` importing from `vue` (reverse dependency).
- `vue-core`/`vue` importing from `ng-core`/`ng`/`react-core`/`react` — framework-native isolation, **no exception**. §11/§16's Escape-priority and scroll-lock logic is shared via new `@ultimate/uix-utils/escape` and `@ultimate/uix-utils/scroll-lock` submodules (resolved extraction decision), not via a direct `vue-core → react-core` import. `react-core`'s existing `src/escape/`/`src/scroll-lock/` files are refactored to delegate to the same shared submodules as part of this Phase's prerequisite work (§31, §33) — after that refactor, neither `react-core` nor `vue-core` depends on the other; both depend only on `uix-utils`.
- Any runtime dependency on `primevue` or `@primeuix/*` (ADR-004, enforced identically to Angular/React).
- Circular package dependencies within the new packages or against existing ones.
- Framework-specific (Vue) logic leaking into `packages/uix-*` — the framework-neutral packages remain untouched by Phase 4 except where §8 explicitly names a *new* consumer of an *existing* export (`createStyleElement`).
- Component-specific logic unnecessarily promoted into `vue-core` — the bar is "demonstrated by at least two proof-set components," matching the standard already applied in §7/§19/§20.

---

## 29. Performance

**No claims are made about tree-shaking success, bundle size, or runtime overhead without real measurement** — per this spec's explicit instruction and Phase 2/3's own documented gap.

### What can be validated this phase (package-level only)

- Build output shape: real ESM with genuine subpath exports (§3).
- Style injection cost: the `VueStyleSheet` adapter (§8) registers once per component name at instance-creation time (dedup via `StyleSheet.has()`), not per-render/per-update — verified by test (§23).
- Overlay creation: Portal/FocusTrap/motion mount cost is bounded by Vue's own reconciliation — no additional Ultimate-introduced overhead beyond the verified PrimeVue shape being reimplemented.
- Repeated mount/unmount: covered by the cleanup test category (§23).
- Multiple dialogs/tooltips: covered by §11's (Escape priority) and §16's (scroll-blocking) explicit multi-instance test categories.

### Explicitly deferred (requires a real consumer app, out of Phase 4 scope per §24)

- Actual bundle size measurement.
- Actual tree-shaking verification.
- Runtime performance profiling under realistic render load.
- PrimeVue's own `nuxt-module` package (verified present in the repo shape, §1) signals a real, larger Nuxt/SSR ecosystem surface than Angular's or React's Phase 2/3 equivalent concern — flagged as a later performance-phase item per the prior architecture-approval gate's risk note, not a Phase 4 blocker or claim.

---

## 30. Inventory and Future Migration

Phase 4 implements exactly the five proof-set components plus three directives (§5). The remaining PrimeVue 4.5.5 inventory (145 of the 150 verified `packages/primevue/src` directories, after subtracting the proof set plus its direct infrastructure already covered in §6) is **not** classified component-by-component in this spec — same posture as Phase 3 §30, applying the same evidence-backed, per-component real-source-inspection bar to 145 more directories being out of scope for a foundation-establishing phase.

**Explicitly rejected**: assigning every remaining component to an artificial "Phase 4.x" split. Future phases determine their own scope through the same research/brainstorm/Real-Source Verification Gate process this Phase used.

**What can be stated now, as a starting-point signal, not a commitment**: neither Angular's `COMPONENT_INVENTORY.md` classification nor React's own inventory notes are directly valid evidence for PrimeVue's real structure (confirmed during this Phase's research — PrimeVue's own repo shape, e.g. the `packages/core`/`packages/primevue` split, already differs structurally from both). A Vue-native component inventory, built the same evidence-based way this spec's proof-set sections were, is real future work — not pre-committed here.

---

## 31. Risk Register

| Risk | Likelihood | Impact | Mitigation | Detection | Owner/Phase |
|---|---|---|---|---|---|
| Divergence from verified PrimeVue behavior during implementation | Medium | Medium | Every behavioral claim in this spec cites its exact source file; implementation tasks should re-cite the same evidence | Code review against this spec; provenance manifest cross-check | Phase 4 implementation |
| Directive lifecycle complexity (`BaseDirective`-equivalent factory's state-on-element pattern is intricate, verified as a real ~280-line mechanism in PrimeVue's own source) | Medium | Medium | Keep Ultimate's directive factory intentionally smaller than PrimeVue's (no passthrough, no global config-change bus unless demonstrated) | Directive unit tests per §23; code review against §7's "base stays small" principle | Phase 4 implementation |
| SSR/hydration | Low | Medium | Follow verified `isClient()`-gate pattern from Portal; directive `mounted` hooks are inherently client-only by Vue's own contract | SSR-specific test cases per §23 | Phase 4 implementation |
| FocusTrap + `MutationObserver` | Medium | Medium | Verified upstream pattern, but adds a real runtime-cost/complexity surface neither Angular's nor React's FocusTrap has | Dedicated dynamic-content focus test case; document as intentionally-carried-forward upstream behavior, not gold-plating | Phase 4 implementation |
| Overlay stacking (multi-dialog Escape/scroll-lock correctness) | Low | Medium | `uix-utils/zindex` already handles per-key stacking correctly; §11/§16 adapters close the two real gaps found in PrimeVue's own Dialog behavior | Multi-dialog integration test | Phase 4 implementation |
| Escape/scroll-lock shared-module extraction is a prerequisite, not Phase 4-internal work (§11, §16) — `react-core/src/escape/` and `react-core/src/scroll-lock/use-scroll-lock.ts` must be refactored to delegate to new `@ultimate/uix-utils/escape`/`scroll-lock` submodules before `vue-core` can depend on those submodules without either duplicating logic or creating the reverse-framework dependency §28 forbids | Medium | Medium | §11/§16 record the exact extraction boundary (verified this gate, by direct re-inspection of both `react-core` files) as a required pre-Phase-4-implementation refactor; not deferred indefinitely, not silently absorbed as ordinary Phase 4 work either — it changes an already-shipped Phase 3 package | Implementation-plan review confirms the `react-core` refactor is its own task, sequenced before any `vue-core` task that depends on the shared submodules; existing `react-core` tests (`escape.spec.ts`) must still pass unchanged after the refactor | Phase 4 implementation (prerequisite task against `react-core`) |
| Display-order reactive-wrapper porting risk (§11) — `use-display-order.ts`'s `useState`-based return-and-re-render contract is genuinely React-shaped and was NOT extracted; Vue needs its own `ref()`-based equivalent over the same shared registry | Medium | Low-Medium | §11 explicitly scopes the extraction boundary to exclude this file — Vue authors its own reactive wrapper, informed by but not copied from `use-display-order.ts`'s shape, calling into the same shared `uix-utils/escape` registry | Dedicated adapter test suite (§23) for Vue's own reactive wrapper, not assumed correct by analogy to React's `useState` version | Phase 4 implementation |
| Style injection | Low | Medium | Follow §8's ADR-029-matching pattern exactly (working from day one, not repeating Angular's gap) | Runtime DOM assertion test: a real `<style>` element must exist after component mount | Phase 4 implementation |
| Partial upstream test coverage (only Button + Ripple have real upstream specs) | Medium | Medium | Ultimate authors its own full coverage per §23, does not inherit PrimeVue's gaps | Coverage tracked per component in the eventual implementation plan's test plan | Phase 4 implementation |
| **RESOLVED this gate** — Real-Source Verification for Menu (full behavior surface), Checkbox (rendered DOM structure, full inheritance chain), Tooltip (content-injection mechanism), Vue peer-dependency range, and both tiers of the security scan (§25) are now complete, closing what was previously an open risk. Retained here only as a record of what this gate closed, not as a current risk. | — | — | §10, §19, §25, §26, §27 all updated with verified findings, including two real corrections (Menu's Escape is local not shared, §10; Checkbox has `indeterminate`/`binary`/group-composition, §19) and two new security findings (Tooltip's opt-in `escape: false` raw-HTML path; Dialog's `breakpoints`-interpolated `innerHTML`, both §25) | — | Closed |
| Future Vue compatibility | Low (not yet applicable) | Medium | §27's evidence-based, independently-evaluated policy — not tied to PrimeVue's cadence; initial range (`^3.5.0`) verified this gate | Re-run the same evidence process when a future Vue major ships | Future phase |
| API divergence (behavioral contract vs literal API) | Low | Low | §21's table makes divergence points explicit and evidence-justified | Cross-framework contract-test parity per Blueprint §27/§923 | Phase 4 implementation |
| Provenance mistakes | Low | High | Follow the exact per-file manifest mechanism already used for `ng.json`/`react.json`; §22's new reused-logic convention documented explicitly | `docs/architecture/provenance/vue-core.json`/`vue.json` reviewed against the same schema plus the new convention | Phase 4 implementation |
| Accidental passthrough leakage | Low | Medium | `pt`/`ptm`/`$parentInstance` explicitly excluded at both the component-mixin and directive-factory level (§7) | Code review / grep for `pt`/`ptm`/`$parentInstance` symbols | Phase 4 implementation |
| Over-expansion of `vue-core` | Low | Medium | §5 locks proof-set scope; §2's module list is evidence-justified per module | Spec review checks every `vue-core` module traces to a proof-set component's real requirement | Phase 4 implementation |
| `@primevue/forms` boundary erosion (a future task accidentally reintroduces `formControl`/`$pcForm` wiring since the base component genuinely has the hooks for it, unlike React where no such temptation exists in the reference source) | Low | Medium | §19/§20's explicit contract omits `formControl` entirely from `UCheckbox`'s public API; this is a slightly higher-risk boundary than Phase 3's equivalent decision precisely because the temptation is real and present in the verified reference in a way it wasn't for React | Code review / grep for `formControl`/`$pcForm`/`$pcFormField` symbols, same mechanism as the passthrough check above | Phase 4 implementation |

---

## 32. Intentional Deviations Table

| Area | PrimeVue 4.5.5 verified reference | UltimateVue decision |
|---|---|---|
| Tooltip accessibility | No verified `aria-describedby` link from target to panel | Add it — additive to any existing `aria-describedby` value, owned-ID-only removal on cleanup, multi-tooltip-same-target explicitly a non-goal (§9) |
| Menu focus | `aria-activedescendant` (verified) | Preserve — diverges from Angular's literal-focus `UMenu`, converges with React (§10) |
| Escape handling | Plain, unconditional per-instance listener, no stacking (verified, weaker than React's) | Extracted to shared `@ultimate/uix-utils/escape`, consumed via a thin Vue adapter — not PrimeVue's own weaker mechanism, not a `react-core` dependency (§11) |
| Scroll-lock coordination | Un-refcounted `blockBodyScroll`/`unblockBodyScroll` calls (verified, weaker than React's) | Extracted to shared `@ultimate/uix-utils/scroll-lock`, consumed via a thin Vue adapter — not a `react-core` dependency (§16) |
| FocusTrap | Sentinel-span + `MutationObserver` directive mechanism (verified) | Preserve mechanism, Ultimate-owned implementation, stays a directive (§14) |
| Dialog draggable/maximizable | Real, verified features in `Dialog.vue` (resizable not found) | Exclude both — matches Angular/React proof-set scope, resolved fork (§15) |
| Z-index | `ZIndex` per-key stack (verified) | Direct reuse, `@ultimate/uix-utils/zindex`, zero new code (§12) |
| Motion | Native `<transition>` + PrimeVue's own callback wiring | Reuse `@ultimate/uix-motion`'s `createMotion()` through the same native `<transition>` hooks (§17) |
| Styling | `useStyle`/`BaseStyle`/`Theme`-internal machinery, instance-lifecycle-time registration | `@ultimate/uix-styled` + `uix-utils/dom`'s `createStyleElement` adapter, same lifecycle timing (§8) |
| Passthrough | `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` (verified, two parallel implementations — component and directive) | Exclude entirely from both mechanisms (§7) |
| `$parentInstance` | `inject: { $parentInstance }` (verified) | Exclude (§7) |
| Forms | Real, working `@primevue/forms` integration (verified, unlike React where no such thing exists upstream to exclude) | Exclude — deliberate boundary cut of a real feature (§19, §20) |
| Ripple | Custom directive, wired directly in Button/Dialog templates (verified) | Preserve directive shape, wired in Vue's real proof-set components (unlike React, which deferred Ripple entirely per ADR-031) (§6, §18) |
| Portal/Teleport | Thin `<Teleport>` wrapper, `isClient()` SSR gate (verified) | Preserve pattern directly — Vue's own primitive is sufficient (§13) |
| Dialog controlled contract | `visible`/`emit('update:visible')` — Vue v-model convention (verified) | Preserve as `v-model:visible`, a genuine framework-native API-shape divergence from Angular's/React's own controlled-prop conventions (§15, §21) |
| Testing | Vitest + `@vue/test-utils`, ~52% upstream coverage (78/150) | Reuse tooling choice; Ultimate-authored coverage beyond upstream's partial set (§23) |

---

## 33. Exit Criteria

- [ ] `@ultimate/vue-core` and `@ultimate/vue` package structure exists, matching §2.
- [ ] `vue-core` builds via `tsup` (+ Vue compilation step) with no errors; ESM output, `.d.mts` declarations, exports map per §3.
- [ ] `vue` builds via `tsup` with no errors; subpath exports per component (§3) resolve correctly (verified by an export-resolution Vitest suite, matching Phase 1/3's precedent).
- [ ] `sideEffects: false`'s package-metadata decision is confirmed by measured bundler behavior, not merely defaulted: the full validation sequence in §3 has run. Do not close this criterion on the metadata decision alone.
- [ ] All five proof-set components (`UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip`) build and render/mount.
- [ ] `v-focustrap`, `v-tooltip`, `v-ripple` directives build and function, tested via the `@vue/test-utils` directive-testing pattern confirmed in §23.
- [ ] `UDialog` ships with no `draggable`/`maximizable` props or behavior (§15) — verified by the explicit negative test in §23.
- [x] **RESOLVED this gate**: Menu's full behavior surface (§10), Checkbox's full rendered/accessibility surface (§19, §26), Tooltip's content-injection mechanism (§25), and the full security scan (§25) are all closed with verified evidence — no longer a blocker for the implementation plan.
- [ ] Ultimate-authored test suite passes, covering every category in §23, including explicit regression tests for both intentional accessibility/behavior deviations (§9, §16, §11).
- [ ] Accessibility baseline passes at the `source-confirmed` + `runtime-tested` tiers (§26) for every row — all five rows are now `source-confirmed` (this gate); `runtime-tested` remains to be established during implementation. `automatically scanned` and `manually validated` tiers are explicitly not required for this exit.
- [ ] Styling works in an actual rendered (jsdom, via Vitest+`@vue/test-utils`) environment — a real `<style>` element is confirmed present after component mount (§8, §23).
- [ ] Provenance records complete: `docs/architecture/PROVENANCE.md`'s PrimeVue entry updated; `docs/architecture/provenance/vue-core.json` and `vue.json` created, matching the established schema plus §22's new reused-logic convention.
- [ ] No PrimeVue runtime dependency — verified by the extended `validate-dependency-ceiling.mjs` CI check.
- [ ] Package boundary validation passes — no `vue-core → vue` reverse dependency, no circular dependency, and no `vue-core → react-core` dependency (§28) — `@ultimate/uix-utils/escape` and `@ultimate/uix-utils/scroll-lock` exist and both `react-core` (refactored) and `vue-core` depend on them instead.
- [ ] `react-core/src/escape/` and `react-core/src/scroll-lock/use-scroll-lock.ts` are refactored to delegate to the new `@ultimate/uix-utils/escape`/`scroll-lock` submodules (§11, §16) — a prerequisite task, not optional cleanup; `react-core`'s existing `escape.spec.ts` suite still passes unchanged after the refactor.
- [ ] Documentation complete: `packages/vue-core/README.md` and `packages/vue/README.md`, matching the descriptive depth of `ng-core`'s/`react-core`'s existing READMEs.
- [ ] All approved intentional deviations (§32) are documented in the shipped README/provenance content, not only in this spec.
- [ ] Performance/build checks completed to the degree actually available per §29 — package-level checks only; no tree-shaking or bundle-size claim is made without a real consumer app.
- [ ] Vue peer-dependency range (`^3.5.0`, verified this gate, §27) recorded in `docs/architecture/COMPATIBILITY.md` — the verification itself is done; this criterion tracks recording it in the compatibility doc during implementation.

**Explicitly not required for Phase 4 exit** (documented, not hidden): a populated `apps/playground-vue`; measured tree-shaking; measured bundle size; axe-core or equivalent automated accessibility scanning; manual accessibility validation.

---

## 34. Decision Record

| Decision | Resolution | Verified against |
|---|---|---|
| Package split | `@ultimate/vue-core` + `@ultimate/vue` | Blueprint provisional proposal; `ng-core`/`ng`, `react-core`/`react` precedent; PrimeVue's own real `packages/core`/`packages/primevue` split |
| Base architecture | Options-API `extends` mixin (Gate 6 #1, this Phase's resolved fork) | `BaseComponent.vue` full read; ADR-018/024 precedent |
| Directive factory | Separate mechanism from the component mixin | `BaseDirective.js` full read — confirmed structurally distinct from `BaseComponent.vue` |
| Passthrough exclusion | Full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` excluded from both mechanisms | `BaseComponent.vue`, `BaseDirective.js` full reads (~140 lines each) |
| Forms boundary | `@primevue/forms` excluded (Gate 6 #2, this Phase's resolved fork) | `BaseEditableHolder.vue` full read — confirmed live, working, unpinned integration |
| Proof set | Button, Checkbox, Dialog, Menu, Tooltip + `v-focustrap`/`v-tooltip`/`v-ripple` | Real import-closure inspection (§6) |
| Tooltip API | Vue custom directive (`v-tooltip`), not converted to a component | `Tooltip.js` full read |
| Tooltip accessibility improvement | Add `aria-describedby`, additive/owned-ID-only-cleanup contract | Verified gap in `Tooltip.js` |
| Menu focus model | `aria-activedescendant` | `Menu.vue`'s `focusedOptionIndex`/`aria-activedescendant` binding, verified |
| FocusTrap | Sentinel-span + `MutationObserver` directive mechanism | `FocusTrap.js`, `BaseFocusTrap.js` full reads |
| Escape mechanism | Extract to `@ultimate/uix-utils/escape` (registry/priority-comparison logic only); Vue and React `*-core` packages each keep their own reactive/lifecycle wrapper (`ref()` vs `useState`) | `Dialog.vue`'s weak mechanism (verified) contrasted against `react-core/escape`'s already-built, already-tested logic; re-inspection of `use-global-escape-key.ts`/`use-display-order.ts` confirmed only the latter is genuinely React-shaped |
| Scroll-lock coordination | Extract in full to `@ultimate/uix-utils/scroll-lock` — no framework-specific residue beyond the lifecycle call site | `Dialog.vue`'s un-refcounted calls (verified) contrasted against `react-core/scroll-lock`'s already-built logic; re-inspection confirmed `useCallback` is a non-load-bearing memoization wrapper only |
| Z-index reuse | Direct reuse of `@ultimate/uix-utils/zindex`, no redesign | `Dialog.vue`'s real `ZIndex.set('modal', ...)` call vs `uix-utils/zindex/index.ts`, confirmed algorithmically matching |
| Motion | `@ultimate/uix-motion/createMotion`, wired via native `<transition>` hooks | `Dialog.vue`'s real `<transition>` usage confirms no wrapper-library dependency |
| Dialog scope | Excludes draggable and maximizable (this Phase's resolved fork) | `Dialog.vue` full read confirms both as real, verified features; user-approved cut to match Angular/React |
| Dialog controlled contract | `v-model:visible`, not `onHide`/`(visibleChange)` | `Dialog.vue`'s real `visible`/`emit('update:visible')` shape |
| Testing tooling | Vitest + `@vue/test-utils` | `packages/primevue/package.json`, `vitest.config.js` full reads; `Button.spec.js`, `Ripple.spec.js` full reads |
| Vue compatibility ownership | Independent Ultimate policy, not tied to PrimeVue's cadence — initial range `^3.5.0` (§27) | `npm view @primevue/core@4.5.5 peerDependencies`, verified this gate |

---

## Non-Goals (consolidated)

- Full PrimeVue catalog migration (§30).
- Visual baseline / Storybook tooling (Phase 2/3 precedent, ADR-023).
- A populated `apps/playground-vue` consumer app (§24) — candidate future work, not committed here.
- Full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough support (§7).
- `@primevue/forms` integration (§19, §20) — a real, verified, deliberately-excluded feature, not an absence-of-feature finding.
- Fixing Angular's parallel styling gap (ADR-023 follow-up #6) — not reopened by Phase 4.
- Data-grid-class component architecture (Table/Tree/etc.).
- Measured tree-shaking or bundle-size validation (§29).
- Automated accessibility scanning (axe-core or equivalent) (§26).
- Draggable/maximizable Dialog features, despite verified upstream support (§15) — explicitly scoped out, resolved fork.
- Resizable Dialog — not found as a feature in PrimeVue's real source at all (§15), not merely deferred.
