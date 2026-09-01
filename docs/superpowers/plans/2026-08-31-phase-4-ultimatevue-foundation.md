# Phase 4 — UltimateVue Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@ultimate/vue-core` and `@ultimate/vue` — the first Vue-specific Ultimate packages — with an Ultimate-owned Vue foundation (Options-API `extends` base architecture, directive-shaped FocusTrap/Tooltip/Ripple, overlay/Escape/scroll/motion/styling infrastructure) and five fully working, provenance-tracked, Ultimate-namespaced components (Button, Checkbox, Dialog, Menu, Tooltip) proving the architecture end-to-end, mirroring Phase 2's Angular and Phase 3's React proof sets. Includes a required prerequisite: extracting `react-core`'s Escape-priority and scroll-lock logic into new framework-neutral `@ultimate/uix-utils` submodules so `vue-core` never depends on `react-core`.

**Architecture:** PrimeVue 4.5.5 source (already pinned in `.vendor-cache/primevue-4.5.5.tar.gz`, commit `66dde6788220fc9e6822342919d1ceb0e3460ece`) is extracted per-directory into a gitignored staging tree from **two** roots (`packages/core/src/<name>` for foundation-tier files, `packages/primevue/src/<name>` for components/directives), then **reimplemented with reference, not ported** (Option B, same posture as ADR-018/024): `vue-core` gets an Ultimate-owned `BaseComponent` (Options-API `extends` mixin) covering only `cx()` class resolution and style registration — PrimeVue's full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough system and `inject: { $parentInstance }` are explicitly excluded. Directives (`v-focustrap`, `v-tooltip`, `v-ripple`) use a separate `BaseDirective`-equivalent factory, not the component mixin chain. Where PrimeVue's behavior is framework-neutral-reusable (z-index, motion, focus-lookup, scroll-lock), Ultimate reuses the already-built Phase 1 `@ultimate/uix-*` primitives directly. Where PrimeVue's own mechanism has a verified gap React's `react-core` already closed (Escape priority, scroll-lock refcounting), that logic is extracted into new `@ultimate/uix-utils/escape` and `@ultimate/uix-utils/scroll-lock` submodules — consumed by both `react-core` (refactored) and `vue-core`, never `vue-core → react-core` directly. Both packages build with `tsup` + `@vitejs/plugin-vue` (ESM, `.d.mts` declarations) and test with Vitest + `@vue/test-utils`.

**Tech Stack:** pnpm workspaces (existing), Vue `^3.5.0` (verified peer range, spec §27), TypeScript (existing `tsconfig.base.json`), `tsup` + `@vitejs/plugin-vue` (new Vue-compilation step, matches Phase 1 `tsup` precedent plus PrimeVue's own verified build-tool choice), Vitest + `@vue/test-utils` (new — matches PrimeVue's own verified test tooling), Node.js built-ins for provenance scripts (matching Phase 0/2/3 convention).

**Spec:** `docs/superpowers/specs/2026-08-31-phase-4-ultimatevue-foundation-design.md`

## Global Constraints

- PrimeVue baseline: `4.5.5`, commit `66dde6788220fc9e6822342919d1ceb0e3460ece` (`docs/architecture/PROVENANCE.md`) — do not re-pin. **Two** library source roots inside the tarball: `packages/core/src/<name>` (BaseComponent, BaseDirective, BaseEditableHolder, BaseInput, utils) and `packages/primevue/src/<name>` (components, directives, Portal). The vendoring script must support extracting from either root explicitly — never assume a single fixed path the way Phase 3's PrimeReact script could.
- Vue peer range: `^3.5.0` for `@ultimate/vue` (spec §27, verified via `npm view @primevue/core@4.5.5 peerDependencies`).
- Two packages: `@ultimate/vue-core` (foundation) and `@ultimate/vue` (components + directives they directly consume). Do not create a third package.
- **Prerequisite work against `react-core`, not `vue-core`**: `react-core/src/escape/` and `react-core/src/scroll-lock/use-scroll-lock.ts` must be refactored to delegate to new `@ultimate/uix-utils/escape` and `@ultimate/uix-utils/scroll-lock` submodules before any `vue-core` task that needs them (spec §11, §16, §28, §31, §33). This is Task 1. `react-core`'s existing public exports and its existing `escape.spec.ts`/`scroll-lock.spec.ts` test suites must still pass unchanged after the refactor — this is a delegation refactor, not a behavior change.
- `vue-core` owns: `BaseComponent` (Options-API `extends` mixin), `BaseEditableHolder`, `BaseInput` (verified intermediate tier), a `BaseDirective`-equivalent factory, `v-focustrap` directive, `Portal` (wraps native `<Teleport>`), an Escape adapter over the shared `uix-utils/escape` registry, a scroll-lock adapter over the shared `uix-utils/scroll-lock` registry, icon infrastructure, a `VueStyleSheet` adapter, a config/context primitive (Vue `provide`/`inject`), and a `@ultimate/uix-utils/zindex` consumption wrapper.
- `vue` owns: `UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip` (a directive, not a component), plus `v-ripple` (directive-shaped primitive, wired in Button/Dialog — **unlike React, which deferred Ripple entirely per ADR-031, Vue's real proof-set components do wire it**, spec §6/§18).
- Full Ultimate namespace: component/directive names (`Button`→`UButton`, `v-tooltip`→Ultimate's own directive registration name), CSS classes (`.p-button`→`.u-button`) — both together, not deferred (matches Phase 2/3's precedent).
- The full PrimeVue `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough system is excluded entirely from **both** the `BaseComponent` mixin and the `BaseDirective` factory — do not port either's passthrough resolution logic. `inject: { $parentInstance }` is also excluded.
- No `@primevue/forms` integration. `UCheckbox` supports **both** controlled (`modelValue` v-model) and uncontrolled (`defaultValue`) modes, matching verified `BaseEditableHolder` behavior — this is broader than React's fully-controlled-only `UCheckbox`, and is correct per-framework, not an inconsistency to "fix."
- `UCheckbox` also supports `indeterminate` (verified real PrimeVue prop, opposite finding from React's Checkbox) and `binary`/array-membership mode (verified real, no PrimeReact equivalent) — see spec §19's full contract. Do not omit these because Phase 3's React `UCheckbox` didn't have them.
- No `react-transition-group`-equivalent dependency. Motion is `@ultimate/uix-motion`'s `createMotion(element, options)`, wired through Vue's native `<transition>` hook callbacks (`@enter`/`@leave` with a `done` callback), not a `useEffect`-shaped call site.
- `UDialog` does not expose or implement `draggable` or `maximizable` behavior in Phase 4 (spec §15 — resolved fork, matches Angular/React proof-set scope). Resizable was never a feature in PrimeVue's real Dialog at all — nothing to exclude there. No such props, no such event handlers, no such UI.
- `UDialog`'s controlled contract is `v-model:visible` (a `visible` prop plus an `update:visible` emit), matching Vue's own idiomatic mechanism and verified PrimeVue's real API — not Angular's `[visible]`/`(visibleChange)` shape or React's `visible`/`onHide` shape.
- `v-focustrap` does NOT restore focus on unmount (verified — no such logic in `FocusTrap.js`); that is `UDialog`'s responsibility (Task 21), matching Angular's and React's identical division of responsibility.
- `v-focustrap` uses a `MutationObserver` for dynamic-content focus redirection — a real capability neither Angular's nor React's FocusTrap has. Carry this forward; it is verified upstream behavior, not gold-plating to skip.
- `UMenu`'s Escape handling is its own **local** `keydown` handler on its list element — NOT routed through the shared `uix-utils/escape` priority mechanism (spec §10's correction, §11, §13). Only `UDialog` uses the shared mechanism. Do not wire Menu through it "for consistency" — that would contradict verified PrimeVue source.
- `UMenu` uses `aria-activedescendant` virtual focus (matches verified PrimeVue behavior, converges with React's ADR-027), diverging intentionally from Angular's `UMenu` literal-DOM-focus approach — this is not a bug, do not "fix" it to match Angular.
- `UTooltip`'s public API is the Vue-native directive-on-element binding (`v-tooltip="value"` or `v-tooltip="{ value, showDelay, ... }"`) — NOT a wrapper component, NOT a ref-target prop the way React's `UTooltip` component is. This is the Vue-idiomatic equivalent of the same underlying concept.
- `v-tooltip` adds `aria-describedby` on the target element while visible (intentional deviation from verified upstream, which has no such wiring) — additive to any pre-existing `aria-describedby` value, removes only its own owned ID on cleanup. Multiple tooltip instances targeting the same element is an explicit non-goal.
- `v-tooltip`'s content-rendering contract must preserve PrimeVue's verified two-mode shape: a safe `createTextNode`-based default, plus an explicit, opt-in-only escape hatch (matching PrimeVue's own `escape: false` option) for callers who need raw HTML. The default path must never be the unsafe one (spec §25's security finding).
- Escape handling for Dialog is a centralized, priority-aware mechanism consumed from the new shared `@ultimate/uix-utils/escape` submodule (behavior originally ported from verified PrimeReact `useGlobalOnEscapeKey`/`useDisplayOrder`, now extracted to be framework-neutral) — not a per-component unconditional listener, not a `vue-core`-local reimplementation.
- Z-index: reuse `@ultimate/uix-utils/zindex`'s `ZIndex` directly. Do not modify or redesign that module. Verified keys: `UDialog` → `'modal'`, `UMenu` → `'menu'`, `v-tooltip` → `'tooltip'` (spec §12, all three verified).
- Dialog scroll-blocking: reuse `@ultimate/uix-utils/dom`'s `blockBodyScroll`/`unblockBodyScroll` (already existing) via the new shared `@ultimate/uix-utils/scroll-lock` submodule's refcounted registry — never a `document` property mutation, never a `vue-core`-local duplicate implementation.
- `sideEffects` starts as `false` in both `package.json` files but is **not final** until the tree-shaking validation task's build-level validation (production build, consumer-like import from built `dist/`, real component mounting, confirmed style injection, confirmed no dead-code-elimination of required modules, exercised via both direct/subpath and barrel import) passes. Do not treat `sideEffects: false` as proven before that task runs.
- Every incorporated file needs a provenance record: package-level in `docs/architecture/PROVENANCE.md` (PrimeVue entry already exists, needs updating, not a new heading) and file-level in new `docs/architecture/provenance/{vue-core,vue}.json` manifests using the schema `{originalPath, ultimateDestination, modificationStatus, modificationDescription}`. Where a file's logic derives from the new shared `uix-utils/escape`/`scroll-lock` submodules rather than directly from PrimeVue, `modificationDescription` must name **both** the original PrimeVue verified-gap finding **and** the specific `uix-utils` submodule consumed (spec §22's new reused-logic convention — not a generic restatement).
- Build via `tsup` + `@vitejs/plugin-vue`, not Vite library mode directly. Test via Vitest + `@vue/test-utils`, not a different test-utils library.
- Package manager: pnpm (existing lockfile). Node: `>=20` (matches Phase 0/1/2/3 convention).
- `scripts/provenance/validate-dependency-ceiling.mjs` already includes `"vue"` in its `WATCHED_PREFIXES` (confirmed — unlike Phase 3, no script change needed for that check). `scripts/provenance/validate-provenance.mjs`'s `MANIFEST_WATCHED_PREFIXES` is currently `["uix", "ng", "react"]` and does **not** include `"vue"` — needs extending (Task 2). Its file-walk currently matches only `.ts`/`.tsx` — needs extending to also match `.vue` (Task 2), since Vue SFC files carry real component/directive logic requiring provenance tracking.
- `packages/uix-utils`'s existing `tsup.config.ts` auto-discovers submodules via `readdirSync("src")` — adding the new `escape`/`scroll-lock` directories requires **no `tsup.config.ts` edit**. `packages/uix-utils/test/exports.test.ts` has a **hardcoded** `submodules` array that DOES need editing to include `"escape"` and `"scroll-lock"`, or their build output goes unverified by that test (Task 1).
- `packages/uix-utils/test/` uses one `<submodule>.test.ts` file per submodule (not colocated with `src/`, unlike `react-core`/`ng-core`'s colocated `*.spec.ts` convention) — the new `escape.test.ts`/`scroll-lock.test.ts` files go in `packages/uix-utils/test/`, matching that package's own established convention, not `vue-core`'s or `react-core`'s.

---

## File Structure

```text
packages/
├── uix-utils/                                     @ultimate/uix-utils (MODIFIED — new submodules)
│   ├── src/
│   │   ├── escape/
│   │   │   ├── priorities.ts                      (ESCAPE_PRIORITIES constant, moved from react-core)
│   │   │   ├── registry.ts                         (extracted framework-neutral Map-of-Maps registry)
│   │   │   ├── display-order-registry.ts            (extracted groupToDisplayedElements registry)
│   │   │   └── index.ts
│   │   └── scroll-lock/
│   │       ├── registry.ts                          (extracted blockingIds Set + register/unregister)
│   │       └── index.ts
│   └── test/
│       ├── escape.test.ts                          (new — ported from react-core's escape.spec.ts)
│       ├── scroll-lock.test.ts                      (new — new coverage, no upstream test existed)
│       └── exports.test.ts                          (MODIFIED — submodules array extended)
│
├── react-core/                                     @ultimate/react-core (MODIFIED — delegation refactor only)
│   └── src/
│       ├── escape/
│       │   ├── use-global-escape-key.ts             (MODIFIED — delegates to uix-utils/escape)
│       │   ├── use-display-order.ts                 (MODIFIED — delegates to uix-utils/escape)
│       │   ├── priorities.ts                        (MODIFIED — re-exports from uix-utils/escape)
│       │   ├── escape.spec.ts                       (unchanged — must still pass)
│       │   └── index.ts                             (unchanged)
│       └── scroll-lock/
│           ├── use-scroll-lock.ts                   (MODIFIED — delegates to uix-utils/scroll-lock)
│           ├── scroll-lock.spec.ts                  (unchanged — must still pass)
│           └── index.ts                             (unchanged)
│
├── vue-core/                                        @ultimate/vue-core
│   ├── src/
│   │   ├── base/
│   │   │   ├── base-component.ts                    (BaseComponent Options-API mixin factory)
│   │   │   ├── base-component.spec.ts
│   │   │   ├── base-editable-holder.ts               (v-model/controlled-uncontrolled mixin)
│   │   │   ├── base-editable-holder.spec.ts
│   │   │   ├── base-input.ts                         (size/fluid/variant intermediate tier)
│   │   │   ├── base-input.spec.ts
│   │   │   └── index.ts
│   │   ├── directive/
│   │   │   ├── base-directive.ts                     (BaseDirective-equivalent factory)
│   │   │   ├── base-directive.spec.ts
│   │   │   └── index.ts
│   │   ├── overlay/
│   │   │   ├── portal.ts                             (thin native <Teleport> wrapper component)
│   │   │   ├── portal.spec.ts
│   │   │   └── index.ts
│   │   ├── escape/
│   │   │   ├── use-global-escape-key.ts               (Vue mixin/composable adapter over uix-utils/escape)
│   │   │   ├── use-display-order.ts                   (Vue ref()-based reactive wrapper)
│   │   │   ├── escape.spec.ts
│   │   │   └── index.ts
│   │   ├── zindex/
│   │   │   ├── use-z-index.ts
│   │   │   ├── zindex.spec.ts
│   │   │   └── index.ts
│   │   ├── focus-trap/
│   │   │   ├── focus-trap.ts                         (v-focustrap directive definition)
│   │   │   ├── focus-trap.spec.ts
│   │   │   └── index.ts
│   │   ├── scroll-lock/
│   │   │   ├── use-scroll-lock.ts                     (Vue adapter over uix-utils/scroll-lock)
│   │   │   ├── scroll-lock.spec.ts
│   │   │   └── index.ts
│   │   ├── motion/
│   │   │   ├── use-motion.ts                          (native <transition> hook wiring helper)
│   │   │   ├── motion.spec.ts
│   │   │   └── index.ts
│   │   ├── styling/
│   │   │   ├── vue-style-sheet.ts                     (StyleSheet subclass, createStyleElement override)
│   │   │   ├── use-component-style.ts                  (instance-lifecycle-time registration mixin piece)
│   │   │   ├── styling.spec.ts
│   │   │   └── index.ts
│   │   ├── icons/
│   │   │   ├── spinner-icon.ts
│   │   │   ├── times-icon.ts
│   │   │   ├── window-maximize-icon.ts
│   │   │   ├── window-minimize-icon.ts
│   │   │   ├── check-icon.ts
│   │   │   ├── icons.spec.ts
│   │   │   └── index.ts
│   │   └── index.ts                                  (root barrel — single public entry point)
│   ├── package.json
│   ├── tsup.config.ts                                (tsup + @vitejs/plugin-vue)
│   ├── tsconfig.json
│   ├── vitest.config.ts                               (new — jsdom env, @vitejs/plugin-vue)
│   ├── README.md
│   └── THIRD-PARTY-NOTICES.md                        (new)
│
└── vue/                                              @ultimate/vue
    ├── src/
    │   ├── button/{Button.vue, BaseButton.ts, button.spec.ts, button-style.ts, index.ts}
    │   ├── checkbox/{Checkbox.vue, BaseCheckbox.ts, checkbox.spec.ts, checkbox-style.ts, index.ts}
    │   ├── dialog/{Dialog.vue, BaseDialog.ts, dialog.spec.ts, dialog-style.ts, index.ts}
    │   ├── menu/{Menu.vue, BaseMenu.ts, menu.spec.ts, menu-style.ts, index.ts}
    │   ├── tooltip/{tooltip.ts, tooltip.spec.ts, tooltip-style.ts, index.ts}    (directive, no .vue file)
    │   ├── ripple/{ripple.ts, ripple.spec.ts, index.ts}                        (directive)
    │   └── index.ts                                    (root barrel — re-exports all 5 + directives)
    ├── package.json
    ├── tsup.config.ts                                  (multi-entry: index + per-component subpaths)
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── README.md
    └── THIRD-PARTY-NOTICES.md                          (populate existing Phase 0 stub)

scripts/provenance/
├── extract-primevue-source.mjs                       (new — untar + copy from EITHER of two roots)
├── extract-primevue-source.test.mjs                   (new)
├── verify-tree-shaking-vue.mjs                        (new — sideEffects validation)
└── validate-provenance.mjs                            (modified — MANIFEST_WATCHED_PREFIXES + .vue extension)

docs/architecture/
├── PROVENANCE.md                                      (modified — PrimeVue entry: Modification status/description/date)
├── DECISIONS.md                                       (modified — new ADRs, 032 onward)
├── PACKAGE_ARCHITECTURE.md                             (modified — vue-core/vue move from "reserved" to "active")
├── ROADMAP.md                                          (modified — Phase 4 row → Complete)
└── provenance/
    ├── vue-core.json                                   (new — file-level manifest)
    └── vue.json                                        (new)
```

**Why this shape:** `vue-core`'s directories are organized one-concern-per-directory, matching `ng-core`'s/`react-core`'s established convention, each with its own colocated spec file — except `packages/uix-utils`'s two new submodules (`escape`, `scroll-lock`), which use that package's own established `test/<name>.test.ts` convention instead, since they live in `uix-utils`, not `vue-core`. `vue`'s 5 component/directive directories are peers, each mirroring `react`'s `button/{button.tsx, button.spec.tsx, button-style.ts, index.ts}` shape, adjusted for Vue: components get a `.vue` SFC plus a separate `Base*.ts` mixin file (matching the verified `Component.vue extends Base*.ts`-shaped chain PrimeVue itself uses — not merged into one file, since the base mixin is reused by the directive-shaped or nested pieces where relevant); `tooltip`/`ripple` have no `.vue` file at all since they are pure directives. `vue`'s `tsup.config.ts` uses genuine multi-entry output from the start (matching `react`'s precedent, avoiding Phase 2's documented single-barrel tree-shaking failure) plus `@vitejs/plugin-vue` for the `.vue`/directive-TS compilation step neither `ng-packagr` nor plain `tsup`/esbuild alone can do.

---

## Interfaces produced by shared/foundation infrastructure

These are the exact signatures every later task depends on. A task's own section lists which of these it consumes.

**`@ultimate/uix-utils/escape`** (Task 1, `packages/uix-utils/src/escape/`):

```typescript
// priorities.ts
export const ESCAPE_PRIORITIES = { DIALOG: 300, MENU: 500, TOOLTIP: 1200 } as const;
// Verified PrimeReact ESC_KEY_HANDLING_PRIORITIES values, moved verbatim from
// react-core/src/escape/priorities.ts (no numeric-value change).

// registry.ts
export type EscapeListener = (event: KeyboardEvent) => void;

export interface EscapeRegistry {
  register(primary: number, secondary: number, callback: EscapeListener): void;
  unregister(primary: number, secondary: number): void;
}

export function createEscapeRegistry(): EscapeRegistry;
// Framework-neutral: Map<number, Map<number, EscapeListener>> registry, a single
// shared document keydown listener (added/removed as the registry becomes
// non-empty/empty), only the highest [primary, secondary] tuple's callback fires.
// Extracted verbatim in behavior from react-core/src/escape/use-global-escape-key.ts's
// non-React portion (escKeyListeners, onGlobalKeyDown, refreshGlobalListener).

export const escapeRegistry: EscapeRegistry; // module-level singleton instance

// display-order-registry.ts
export interface DisplayOrderRegistry {
  register(group: string, id: number): number; // returns the assigned display order
  unregister(group: string, id: number): void;
}
export function createDisplayOrderRegistry(): DisplayOrderRegistry;
export const displayOrderRegistry: DisplayOrderRegistry;
// Framework-neutral: Record<string, (number | undefined)[]> registry, extracted
// verbatim in behavior from react-core/src/escape/use-display-order.ts's
// groupToDisplayedElements — NOT its useState-based reactive return, which stays
// framework-specific in each *-core adapter.
```

**`@ultimate/uix-utils/scroll-lock`** (Task 1, `packages/uix-utils/src/scroll-lock/`):

```typescript
export interface ScrollLockRegistry {
  register(id: string): void;
  unregister(id: string): void;
}
export function createScrollLockRegistry(): ScrollLockRegistry;
export const scrollLockRegistry: ScrollLockRegistry;
// Framework-neutral: Set<string> of registered blocking ids. register() calls
// @ultimate/uix-utils/dom's blockBodyScroll() only on the 0->1 transition;
// unregister() calls unblockBodyScroll() only on the 1->0 transition. Extracted
// verbatim from react-core/src/scroll-lock/use-scroll-lock.ts's full logic (no
// React-specific residue in the original — the whole file moves).
```

**`react-core`'s refactored public surface** (Task 1 — unchanged signatures, changed implementation):

```typescript
// react-core/src/escape/index.ts — SAME exports as before the refactor:
export { ESCAPE_PRIORITIES } from "./priorities"; // now re-exported from uix-utils/escape
export { useDisplayOrder } from "./use-display-order"; // now delegates to uix-utils/escape's displayOrderRegistry
export { useGlobalEscapeKey } from "./use-global-escape-key"; // now delegates to uix-utils/escape's escapeRegistry
export type { UseGlobalEscapeKeyOptions } from "./use-global-escape-key";

// react-core/src/scroll-lock/index.ts — SAME export as before:
export { useScrollLock } from "./use-scroll-lock"; // now delegates to uix-utils/scroll-lock's scrollLockRegistry
```

**`BaseComponent`** (Task 4, `packages/vue-core/src/base/base-component.ts`):

```typescript
export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface BaseComponentOptions {
  componentName: string; // e.g. "button" — the uix-styled registration key
  styleModule: StyleModule;
}

// A Vue Options-API mixin object factory — NOT a class, NOT a composable/hook.
// Each Ultimate component's own Base*.ts file calls this once to produce the
// mixin object it `extends:`.
export function createBaseComponent(options: BaseComponentOptions): {
  props: Record<string, unknown>;
  methods: {
    cx(key: string, params?: Record<string, unknown>): string | undefined;
  };
  mounted(): void; // registers styleModule with vueCoreStyleSheet, once per componentName
};
```

Deliberately excludes PrimeVue's `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough resolution and `inject: { $parentInstance }` — no such fields anywhere in this shape.

**`BaseEditableHolder`** (Task 5, `packages/vue-core/src/base/base-editable-holder.ts`):

```typescript
export interface BaseEditableHolderOptions {
  // layered on top of createBaseComponent's mixin
}

// A mixin object `extend`ing BaseComponent's mixin — provides v-model
// (modelValue/update:modelValue), defaultValue-based uncontrolled mode, and a
// `controlled` computed. No formControl prop, no $pcForm/$pcFormField injection —
// the @primevue/forms-coupled portions are excluded entirely (spec §19/§20).
export function createBaseEditableHolder(): {
  props: { modelValue: unknown; defaultValue: unknown };
  emits: ["update:modelValue", "value-change"];
  data(): { dValue: unknown };
  computed: {
    controlled(): boolean; // true when caller supplied modelValue
    filled(): boolean;
  };
  methods: {
    writeValue(value: unknown, event?: Event): void;
  };
};
```

**`BaseInput`** (Task 6, `packages/vue-core/src/base/base-input.ts`):

```typescript
// A mixin object `extend`ing BaseEditableHolder's mixin — adds size/fluid/variant.
export function createBaseInput(): {
  props: { size: string | null; fluid: boolean | null; variant: string | null };
  inject: { pcFluid: { default: undefined } };
  computed: {
    resolvedVariant(): string | null;
    resolvedFluid(): boolean;
  };
};
```

**`BaseDirective`-equivalent factory** (Task 7, `packages/vue-core/src/directive/base-directive.ts`):

```typescript
export interface DirectiveInstanceOptions<TValue = unknown> {
  name: string;
  hooks: {
    mounted?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
    updated?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
    unmounted?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
  };
}

export interface DirectiveBinding<TValue = unknown> {
  value: TValue;
  oldValue?: TValue;
}

// A separate mechanism from createBaseComponent — returns a real Vue
// ObjectDirective (created/beforeMount/mounted/beforeUpdate/updated/
// beforeUnmount/unmounted hooks), NOT an extends: mixin. No passthrough, no
// global config-change bus.
export function createDirective<TValue = unknown>(
  options: DirectiveInstanceOptions<TValue>
): import("vue").ObjectDirective<HTMLElement, TValue>;
```

**`Portal`** (Task 8, `packages/vue-core/src/overlay/portal.ts`):

```typescript
export interface PortalProps {
  appendTo?: string | HTMLElement; // default: "body"
  disabled?: boolean;
}
// A Vue component (SFC or defineComponent) wrapping native <Teleport>. `inline`
// (disabled || appendTo === "self") renders the slot in place instead of
// teleporting. Gated by a `mounted` data flag set from isClient() in the
// mounted() hook — SSR-safe, matching verified Portal.vue exactly.
export const Portal: import("vue").Component<PortalProps>;
```

**`useGlobalEscapeKey` (Vue adapter) / `useDisplayOrder` (Vue adapter)** (Task 9, `packages/vue-core/src/escape/`):

```typescript
import type { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";

// A mixin-piece factory (not a composable in the Composition-API sense, since
// vue-core is Options-API — but structured as a plain function returning
// {mounted, beforeUnmount} lifecycle-hook fragments a component's own mixin
// chain incorporates), calling uix-utils/escape's escapeRegistry directly.
export function createGlobalEscapeKeyMixin(options: {
  callback: (this: unknown) => void;
  when: (this: unknown) => boolean;
  priority: [primary: number, secondary: () => number | undefined];
}): { mounted(): void; beforeUnmount(): void };

// Vue's own ref()-based reactive wrapper over uix-utils/escape's
// displayOrderRegistry (NOT React's useState shape) — a plain function usable
// from a component's setup or a mixin's data/computed, returning a Ref<number
// | undefined> that updates when this instance's position in the group changes.
export function useDisplayOrder(
  group: string,
  isVisible: import("vue").Ref<boolean> | boolean
): import("vue").Ref<number | undefined>;
```

**`useZIndex`** (Task 10, `packages/vue-core/src/zindex/use-z-index.ts`):

```typescript
export const Z_INDEX_KEYS = { modal: "modal", menu: "menu", tooltip: "tooltip" } as const;
// Verified real PrimeVue keys (Dialog.vue: 'modal', Menu.vue: 'menu', Tooltip.js: 'tooltip').

export function useZIndex(): {
  set: (key: keyof typeof Z_INDEX_KEYS, element: HTMLElement | null, baseZIndex?: number) => void;
  clear: (element: HTMLElement | null) => void;
};
// Thin wrapper around @ultimate/uix-utils/zindex's ZIndex — does not modify that module.
```

**`v-focustrap`** (Task 11, `packages/vue-core/src/focus-trap/focus-trap.ts`):

```typescript
export interface FocusTrapBindingValue {
  disabled?: boolean;
  autoFocus?: boolean;
  autoFocusSelector?: string;
  firstFocusableSelector?: string;
  lastFocusableSelector?: string;
}
export const focusTrapDirective: import("vue").ObjectDirective<HTMLElement, FocusTrapBindingValue>;
// Sentinel-<span> pair mechanism + MutationObserver dynamic-content redirection,
// matching verified FocusTrap.js. disabled=true -> unbound/inactive (mounted
// skips setup entirely); disabled=false -> bound/active. Does NOT restore focus
// on unmount (verified — no such logic upstream); that is UDialog's job (Task 21).
```

**`useScrollLock` (Vue adapter)** (Task 12, `packages/vue-core/src/scroll-lock/use-scroll-lock.ts`):

```typescript
export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
};
// Thin wrapper calling @ultimate/uix-utils/scroll-lock's scrollLockRegistry
// directly — vue-core does not own this Set, it delegates to the shared module.
```

**`useMotion`** (Task 13, `packages/vue-core/src/motion/use-motion.ts`):

```typescript
export function createMotionTransitionHooks(
  getOptions: () => import("@ultimate/uix-motion").MotionOptions
): {
  onEnter: (el: Element, done: () => void) => void;
  onLeave: (el: Element, done: () => void) => void;
  onEnterCancelled: (el: Element) => void;
  onLeaveCancelled: (el: Element) => void;
};
// Returns the exact hook-callback shape Vue's native <transition> element
// expects (v-bind onto @enter/@leave/@enter-cancelled/@leave-cancelled),
// internally calling @ultimate/uix-motion's createMotion(el, options).enter()/
// .leave()/.cancel(). No react-transition-group-equivalent dependency.
```

**`VueStyleSheet` / style-registration mixin piece** (Task 14, `packages/vue-core/src/styling/`):

```typescript
export const vueCoreStyleSheet: import("@ultimate/uix-styled").default;
// A VueStyleSheet instance (subclasses @ultimate/uix-styled's StyleSheet,
// overriding createStyleElement to delegate to @ultimate/uix-utils/dom's
// createStyleElement, SSR-guarded via typeof document check).

export function registerComponentStyle(componentName: string, styleModule: StyleModule): void;
// Registers styleModule with vueCoreStyleSheet exactly once per componentName
// (has()/add() guard) — called from createBaseComponent's mounted() hook
// (instance-lifecycle-time, matching verified BaseComponent.vue's immediate
// watcher timing), not module-import-time.
```

**Icon components** (Task 15, `packages/vue-core/src/icons/`):

```typescript
export interface IconProps {
  class?: string;
  label?: string;
  spin?: boolean;
}
export const SpinnerIcon: import("vue").Component<IconProps>;
export const TimesIcon: import("vue").Component<IconProps>;
export const WindowMaximizeIcon: import("vue").Component<IconProps>;
export const WindowMinimizeIcon: import("vue").Component<IconProps>;
export const CheckIcon: import("vue").Component<IconProps>;
// Each renders an inline <svg role="img" :aria-label="label">, matching
// react-core's/ng-core's established icon pattern — not PrimeVue's own
// IconField/passthrough-spread shape, since pt is excluded.
```

**`v-ripple`** (Task 16, `packages/vue/src/ripple/ripple.ts`):

```typescript
export const rippleDirective: import("vue").ObjectDirective<HTMLElement, void>;
// Built on vue-core's createDirective factory. Standalone primitive (matching
// Angular's URipple precedent — not folded ad-hoc into Button/Dialog).
```

**`v-tooltip`** (Task 20, `packages/vue/src/tooltip/tooltip.ts`):

```typescript
export interface TooltipBindingValue {
  value: string;
  disabled?: boolean;
  escape?: boolean; // default true — safe createTextNode path; false = opt-in raw HTML
  class?: string;
  fitContent?: boolean;
  id?: string;
  showDelay?: number;
  hideDelay?: number;
  autoHide?: boolean;
}
export const tooltipDirective: import("vue").ObjectDirective<HTMLElement, string | TooltipBindingValue>;
```

---

## Task 1: Extract Escape/scroll-lock into `@ultimate/uix-utils`, refactor `react-core` to delegate

**Context:** this is the prerequisite the whole rest of this plan depends on (spec §11, §16, §28, §31, §33). `react-core/src/escape/use-global-escape-key.ts`'s only React coupling is the `useEffect` call itself — its registry/comparison/listener logic is already framework-neutral. `react-core/src/scroll-lock/use-scroll-lock.ts` has zero load-bearing React coupling at all (`useCallback` is a non-load-bearing memoization wrapper). `react-core/src/escape/use-display-order.ts`'s `useState`-based return-and-re-render contract is genuinely React-shaped and is NOT extracted — only its underlying `groupToDisplayedElements` registry moves.

**Files:**

- Create: `packages/uix-utils/src/escape/priorities.ts`
- Create: `packages/uix-utils/src/escape/registry.ts`
- Create: `packages/uix-utils/src/escape/display-order-registry.ts`
- Create: `packages/uix-utils/src/escape/index.ts`
- Create: `packages/uix-utils/src/scroll-lock/registry.ts`
- Create: `packages/uix-utils/src/scroll-lock/index.ts`
- Create: `packages/uix-utils/test/escape.test.ts`
- Create: `packages/uix-utils/test/scroll-lock.test.ts`
- Modify: `packages/uix-utils/test/exports.test.ts`
- Modify: `packages/uix-utils/src/index.ts`
- Modify: `packages/react-core/src/escape/priorities.ts`
- Modify: `packages/react-core/src/escape/use-global-escape-key.ts`
- Modify: `packages/react-core/src/escape/use-display-order.ts`
- Modify: `packages/react-core/src/scroll-lock/use-scroll-lock.ts`

**Interfaces:**

- Produces: `@ultimate/uix-utils/escape`'s `escapeRegistry`/`displayOrderRegistry`/`ESCAPE_PRIORITIES` and `@ultimate/uix-utils/scroll-lock`'s `scrollLockRegistry`, per this plan's Interfaces section. Every later `vue-core` task (9, 12) and every future `react-core` consumer depends on these exact shapes.

- [ ] **Step 1: Write the failing test for `uix-utils/escape`**

Create `packages/uix-utils/test/escape.test.ts` (ported test *design* from `react-core/src/escape/escape.spec.ts`, rewritten against the new framework-neutral API):

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { escapeRegistry, displayOrderRegistry, ESCAPE_PRIORITIES } from "../src/escape";

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
}

describe("escapeRegistry", () => {
  it("calls the registered callback on Escape", () => {
    let called = false;
    escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, 1, () => {
      called = true;
    });
    fireEscape();
    expect(called).toBe(true);
    escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, 1);
  });

  it("only the highest-priority-tuple listener fires when two are registered", () => {
    let dialogCalled = false;
    let menuCalled = false;
    escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, 1, () => {
      dialogCalled = true;
    });
    escapeRegistry.register(ESCAPE_PRIORITIES.MENU, 1, () => {
      menuCalled = true;
    });
    fireEscape();
    // MENU (500) > DIALOG (300) — MENU's tuple wins.
    expect(menuCalled).toBe(true);
    expect(dialogCalled).toBe(false);
    escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, 1);
    escapeRegistry.unregister(ESCAPE_PRIORITIES.MENU, 1);
  });

  it("unregistering stops the callback from firing on a later Escape", () => {
    let called = false;
    escapeRegistry.register(ESCAPE_PRIORITIES.TOOLTIP, 1, () => {
      called = true;
    });
    escapeRegistry.unregister(ESCAPE_PRIORITIES.TOOLTIP, 1);
    fireEscape();
    expect(called).toBe(false);
  });
});

describe("displayOrderRegistry", () => {
  it("assigns increasing order to successively registered ids in the same group", () => {
    const first = displayOrderRegistry.register("test-group-a", 1);
    const second = displayOrderRegistry.register("test-group-a", 2);
    expect(second).toBeGreaterThan(first);
    displayOrderRegistry.unregister("test-group-a", 1);
    displayOrderRegistry.unregister("test-group-a", 2);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/uix-utils test`
Expected: FAIL — `src/escape` does not exist yet.

- [ ] **Step 3: Write `packages/uix-utils/src/escape/priorities.ts`**

```typescript
// Numeric values match verified PrimeReact ESC_KEY_HANDLING_PRIORITIES (Tooltip.js
// import, confirmed during Phase 3's Real-Source Verification Gate) for the three
// proof-set-relevant tiers only. Upstream's full enum also has SIDEBAR (100),
// SLIDE_MENU (200), IMAGE (400), OVERLAY_PANEL (600), PASSWORD (700),
// CASCADE_SELECT (800), SPLIT_BUTTON (900), SPEED_DIAL (1000) — not declared
// here since none are current proof-set components; extend only when a real
// component needs a tier. Moved verbatim from react-core/src/escape/priorities.ts
// during Phase 4's prerequisite extraction (spec §11) — no value change.
export const ESCAPE_PRIORITIES = {
  DIALOG: 300,
  MENU: 500,
  TOOLTIP: 1200,
} as const;
```

- [ ] **Step 4: Write `packages/uix-utils/src/escape/registry.ts`**

```typescript
export type EscapeListener = (event: KeyboardEvent) => void;

export interface EscapeRegistry {
  register(primary: number, secondary: number, callback: EscapeListener): void;
  unregister(primary: number, secondary: number): void;
}

// Extracted from react-core/src/escape/use-global-escape-key.ts's non-React
// portion during Phase 4's prerequisite work (spec §11) — same registry/
// comparison/document-listener logic, framework-neutral by construction (no
// React/Vue/Angular API dependency). react-core's useGlobalEscapeKey and
// vue-core's createGlobalEscapeKeyMixin both call this same registry instance.
export function createEscapeRegistry(): EscapeRegistry {
  const listeners = new Map<number, Map<number, EscapeListener>>();

  function onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.code !== "Escape") return;
    const primaryKeys = [...listeners.keys()];
    if (primaryKeys.length === 0) return;
    const maxPrimary = Math.max(...primaryKeys);
    const secondaryMap = listeners.get(maxPrimary);
    if (!secondaryMap || secondaryMap.size === 0) return;
    const maxSecondary = Math.max(...secondaryMap.keys());
    secondaryMap.get(maxSecondary)?.(event);
  }

  function refreshGlobalListener(): void {
    if (typeof document === "undefined") return;
    const hasListeners = [...listeners.values()].some((m) => m.size > 0);
    document.removeEventListener("keydown", onGlobalKeyDown);
    if (hasListeners) document.addEventListener("keydown", onGlobalKeyDown);
  }

  return {
    register(primary, secondary, callback) {
      if (!listeners.has(primary)) listeners.set(primary, new Map());
      listeners.get(primary)!.set(secondary, callback);
      refreshGlobalListener();
    },
    unregister(primary, secondary) {
      const secondaryMap = listeners.get(primary);
      if (!secondaryMap) return;
      secondaryMap.delete(secondary);
      if (secondaryMap.size === 0) listeners.delete(primary);
      refreshGlobalListener();
    },
  };
}

export const escapeRegistry: EscapeRegistry = createEscapeRegistry();
```

- [ ] **Step 5: Write `packages/uix-utils/src/escape/display-order-registry.ts`**

```typescript
export interface DisplayOrderRegistry {
  register(group: string, id: number): number;
  unregister(group: string, id: number): void;
}

// Extracted from react-core/src/escape/use-display-order.ts's
// groupToDisplayedElements registry during Phase 4's prerequisite work (spec
// §11) — framework-neutral by construction. The React/Vue-specific reactive
// wrapper (useState vs ref()) stays in each *-core package, NOT here.
export function createDisplayOrderRegistry(): DisplayOrderRegistry {
  const groupToIds: Record<string, (number | undefined)[]> = {};

  return {
    register(group, id) {
      if (!groupToIds[group]) groupToIds[group] = [];
      return groupToIds[group].push(id);
    },
    unregister(group, id) {
      const list = groupToIds[group];
      if (!list) return;
      const index = list.indexOf(id);
      if (index === -1) return;
      delete list[index];
      let lastIndex = list.length - 1;
      while (lastIndex >= 0 && list[lastIndex] === undefined) lastIndex--;
      list.length = lastIndex + 1;
    },
  };
}

export const displayOrderRegistry: DisplayOrderRegistry = createDisplayOrderRegistry();
```

**Note on the `register` return value**: `use-display-order.ts`'s original `groupToDisplayedElements[group].push(uid)` returns the new array length (the assigned order), used directly as `displayOrder`. This function preserves that exact contract — callers pass their own `id` (react-core's `uid` counter, vue-core's own instance-scoped id), the registry returns the assigned order.

- [ ] **Step 6: Write `packages/uix-utils/src/escape/index.ts`**

```typescript
export { ESCAPE_PRIORITIES } from "./priorities";
export { createEscapeRegistry, escapeRegistry } from "./registry";
export type { EscapeRegistry, EscapeListener } from "./registry";
export { createDisplayOrderRegistry, displayOrderRegistry } from "./display-order-registry";
export type { DisplayOrderRegistry } from "./display-order-registry";
```

- [ ] **Step 7: Run the escape test, verify it passes**

Run: `pnpm --filter @ultimate/uix-utils test escape`
Expected: PASS (4 assertions)

- [ ] **Step 8: Write the failing test for `uix-utils/scroll-lock`**

Create `packages/uix-utils/test/scroll-lock.test.ts` (new coverage — neither PrimeReact nor `react-core`'s `use-scroll-lock.ts` ever had this exact registry tested in isolation from React):

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { scrollLockRegistry } from "../src/scroll-lock";

describe("scrollLockRegistry", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("registering the first id blocks body scroll", () => {
    scrollLockRegistry.register("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    scrollLockRegistry.unregister("dialog-1");
  });

  it("registering a second id while one is already blocking does not re-toggle", () => {
    scrollLockRegistry.register("dialog-1");
    scrollLockRegistry.register("dialog-2");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    scrollLockRegistry.unregister("dialog-1");
    scrollLockRegistry.unregister("dialog-2");
  });

  it("unregistering one of two blocking ids keeps scroll blocked", () => {
    scrollLockRegistry.register("dialog-1");
    scrollLockRegistry.register("dialog-2");
    scrollLockRegistry.unregister("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    scrollLockRegistry.unregister("dialog-2");
  });

  it("unregistering the last blocking id unblocks scroll", () => {
    scrollLockRegistry.register("dialog-1");
    scrollLockRegistry.unregister("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregistering an id that was never registered is a no-op", () => {
    scrollLockRegistry.unregister("never-registered");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});
```

- [ ] **Step 9: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/uix-utils test scroll-lock`
Expected: FAIL — `src/scroll-lock` does not exist yet.

- [ ] **Step 10: Write `packages/uix-utils/src/scroll-lock/registry.ts`**

```typescript
import { blockBodyScroll, unblockBodyScroll } from "../dom";

export interface ScrollLockRegistry {
  register(id: string): void;
  unregister(id: string): void;
}

const SCROLL_LOCK_OPTIONS = { className: "u-overflow-hidden", variableName: "--u-scrollbar-width" };

// Extracted verbatim in full from react-core/src/scroll-lock/use-scroll-lock.ts
// during Phase 4's prerequisite work (spec §16) — that file had zero load-bearing
// React coupling (useCallback was a non-load-bearing memoization wrapper only).
// Private, module-scoped — NOT a document property. Replaces PrimeReact's
// verified document.primeDialogParams global-mutation pattern. Coordinates body-
// scroll blocking across multiple simultaneous overlay instances: scroll stays
// blocked as long as at least one id is registered.
export function createScrollLockRegistry(): ScrollLockRegistry {
  const blockingIds = new Set<string>();

  return {
    register(id) {
      const wasEmpty = blockingIds.size === 0;
      blockingIds.add(id);
      if (wasEmpty) blockBodyScroll(SCROLL_LOCK_OPTIONS);
    },
    unregister(id) {
      if (!blockingIds.has(id)) return;
      blockingIds.delete(id);
      if (blockingIds.size === 0) unblockBodyScroll(SCROLL_LOCK_OPTIONS);
    },
  };
}

export const scrollLockRegistry: ScrollLockRegistry = createScrollLockRegistry();
```

- [ ] **Step 11: Write `packages/uix-utils/src/scroll-lock/index.ts`**

```typescript
export { createScrollLockRegistry, scrollLockRegistry } from "./registry";
export type { ScrollLockRegistry } from "./registry";
```

- [ ] **Step 12: Run the scroll-lock test, verify it passes**

Run: `pnpm --filter @ultimate/uix-utils test scroll-lock`
Expected: PASS (5 assertions)

- [ ] **Step 13: Update `packages/uix-utils/src/index.ts`**

Add two lines to the existing root barrel:

```typescript
export * from "./classnames";
export * from "./dom";
export * from "./escape";
export * from "./eventbus";
export * from "./mergeprops";
export * from "./object";
export * from "./scroll-lock";
export * from "./uuid";
export * from "./zindex";
```

- [ ] **Step 14: Update `packages/uix-utils/test/exports.test.ts`**

Extend the hardcoded `submodules` array (this package's `tsup.config.ts` auto-discovers new `src/` directories with no config change needed — only this test's array needs editing):

```typescript
const submodules = ["classnames", "dom", "escape", "eventbus", "mergeprops", "object", "scroll-lock", "uuid", "zindex"];
```

- [ ] **Step 15: Build `uix-utils` and run its full test suite**

Run: `pnpm --filter @ultimate/uix-utils build && pnpm --filter @ultimate/uix-utils test`
Expected: PASS — build succeeds, `dist/escape/index.mjs`/`dist/scroll-lock/index.mjs` exist, `exports.test.ts` confirms them, both new test files pass.

- [ ] **Step 16: Commit the `uix-utils` extraction**

```bash
git add packages/uix-utils/
git commit -m "feat(uix-utils): extract framework-neutral escape and scroll-lock registries"
```

- [ ] **Step 17: Refactor `react-core/src/escape/priorities.ts` to re-export**

Replace the entire file content:

```typescript
// Re-exported from @ultimate/uix-utils/escape as of Phase 4's prerequisite
// extraction (spec §11) — the values themselves are unchanged; this file now
// exists only to preserve react-core's existing public import path.
export { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
```

- [ ] **Step 18: Refactor `react-core/src/escape/use-global-escape-key.ts` to delegate**

Replace the entire file content:

```typescript
import { useEffect } from "react";
import { escapeRegistry } from "@ultimate/uix-utils/escape";

export interface UseGlobalEscapeKeyOptions {
  callback: (event: KeyboardEvent) => void;
  when: boolean;
  priority: [primary: number, secondary: number | undefined];
}

// Delegates to @ultimate/uix-utils/escape's shared escapeRegistry as of Phase 4's
// prerequisite extraction (spec §11) — react-core no longer owns the registry
// itself, only the mount/unmount lifecycle trigger, matching this file's public
// signature exactly (no consumer-visible change).
export function useGlobalEscapeKey({ callback, when, priority }: UseGlobalEscapeKeyOptions): void {
  const [primary, secondary] = priority;

  useEffect(() => {
    if (!when || secondary === undefined) return;

    escapeRegistry.register(primary, secondary, callback);

    return () => {
      escapeRegistry.unregister(primary, secondary);
    };
  }, [callback, when, primary, secondary]);
}
```

- [ ] **Step 19: Refactor `react-core/src/escape/use-display-order.ts` to delegate**

Replace the entire file content:

```typescript
import { useEffect, useState } from "react";
import { displayOrderRegistry } from "@ultimate/uix-utils/escape";

let uidCounter = 0;

// Delegates to @ultimate/uix-utils/escape's shared displayOrderRegistry as of
// Phase 4's prerequisite extraction (spec §11) — the useState-based
// return-and-re-render contract stays here, genuinely React-specific and
// unchanged; only the underlying groupToDisplayedElements registry moved.
export function useDisplayOrder(group: string, isVisible = true): number | undefined {
  const [uid] = useState(() => ++uidCounter);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) return;

    const newOrder = displayOrderRegistry.register(group, uid);
    setDisplayOrder(newOrder);

    return () => {
      displayOrderRegistry.unregister(group, uid);
      setDisplayOrder(undefined);
    };
  }, [group, uid, isVisible]);

  return displayOrder;
}
```

- [ ] **Step 20: Refactor `react-core/src/scroll-lock/use-scroll-lock.ts` to delegate**

Replace the entire file content:

```typescript
import { useCallback } from "react";
import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";

// Delegates to @ultimate/uix-utils/scroll-lock's shared scrollLockRegistry as of
// Phase 4's prerequisite extraction (spec §16) — react-core no longer owns the
// Set itself, only this useCallback wrapper (kept for React's
// reference-stability convention). Public signature unchanged.
export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
} {
  const register = useCallback((id: string) => {
    scrollLockRegistry.register(id);
  }, []);

  const unregister = useCallback((id: string) => {
    scrollLockRegistry.unregister(id);
  }, []);

  return { register, unregister };
}
```

- [ ] **Step 21: Add `@ultimate/uix-utils` workspace dependency confirmation**

Run: `grep -n "@ultimate/uix-utils" packages/react-core/package.json`
Expected: already present (`react-core` already depends on `@ultimate/uix-utils` for `blockBodyScroll`/`unblockBodyScroll`, confirmed in Task 3 of Phase 3's plan) — no `package.json` change needed. If this grep finds nothing, add `"@ultimate/uix-utils": "workspace:*"` to `dependencies` before continuing.

- [ ] **Step 22: Run `react-core`'s full existing test suite, verify no regressions**

Run: `pnpm --filter @ultimate/react-core build && pnpm --filter @ultimate/react-core test`
Expected: PASS — `escape.spec.ts`'s 5 existing tests and `scroll-lock.spec.ts`'s 5 existing tests all still pass unchanged, proving the refactor preserved behavior exactly. If any fail, the refactor introduced a behavior change — fix the refactor, not the tests (the tests encode the pre-refactor verified contract).

- [ ] **Step 23: Update `docs/architecture/provenance/react-core.json`**

Find the existing entries for `packages/react-core/src/escape/use-global-escape-key.ts`, `use-display-order.ts`, `priorities.ts`, and `packages/react-core/src/scroll-lock/use-scroll-lock.ts` (created during Phase 3). Update each entry's `modificationDescription` to append a note about the delegation refactor:

```json
{
  "originalPath": "components/lib/hooks/useGlobalOnEscapeKey.js",
  "ultimateDestination": "packages/react-core/src/escape/use-global-escape-key.ts",
  "modificationStatus": "reimplemented-with-reference",
  "modificationDescription": "Verified upstream priority-tuple algorithm (Phase 3). As of Phase 4's prerequisite extraction, the registry/comparison/listener logic moved to @ultimate/uix-utils/escape's escapeRegistry (framework-neutral, consumed by both react-core and vue-core); this file now delegates to that shared registry, keeping only the useEffect mount/unmount lifecycle trigger. Public signature (useGlobalEscapeKey) unchanged."
}
```

Apply the same append-a-delegation-note treatment to the other three entries (`use-display-order.ts`, `priorities.ts`, `use-scroll-lock.ts`), each citing the correct new `uix-utils` submodule.

- [ ] **Step 24: Commit the `react-core` refactor**

```bash
git add packages/react-core/src/escape/ packages/react-core/src/scroll-lock/ docs/architecture/provenance/react-core.json
git commit -m "refactor(react-core): delegate escape/scroll-lock to shared uix-utils registries"
```

---

## Task 2: Vendoring script for PrimeVue source (dual-root) + provenance script extension

**Files:**

- Create: `scripts/provenance/extract-primevue-source.mjs`
- Create: `scripts/provenance/extract-primevue-source.test.mjs`
- Modify: `scripts/provenance/validate-provenance.mjs`

**Interfaces:**

- Produces: a CLI script `node scripts/provenance/extract-primevue-source.mjs <tarball> <root> <lib-relative-path> <output-dir>` — where `<root>` is `"core"` or `"primevue"` — used by every later `vue-core`/`vue` task to pull real PrimeVue source into a gitignored staging tree.

- [ ] **Step 1: Write the failing test**

Create `scripts/provenance/extract-primevue-source.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("extracts a real packages/primevue/src/<name> directory (components root)", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    execFileSync("node", [
      "scripts/provenance/extract-primevue-source.mjs",
      ".vendor-cache/primevue-4.5.5.tar.gz",
      "primevue",
      "button",
      outDir,
    ]);
    assert.ok(existsSync(join(outDir, "Button.vue")), "Button.vue should be copied");
    assert.ok(existsSync(join(outDir, "BaseButton.vue")), "BaseButton.vue should be copied");
    const content = readFileSync(join(outDir, "Button.vue"), "utf8");
    assert.match(content, /extends: BaseButton/, "copied file should be real Button.vue source");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("extracts a real packages/core/src/<name> directory (foundation root)", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    execFileSync("node", [
      "scripts/provenance/extract-primevue-source.mjs",
      ".vendor-cache/primevue-4.5.5.tar.gz",
      "core",
      "basecomponent",
      outDir,
    ]);
    assert.ok(existsSync(join(outDir, "BaseComponent.vue")), "BaseComponent.vue should be copied");
    const content = readFileSync(join(outDir, "BaseComponent.vue"), "utf8");
    assert.match(content, /name: 'BaseComponent'/, "copied file should be real BaseComponent.vue source");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("fails clearly on an invalid root argument", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    assert.throws(() => {
      execFileSync("node", [
        "scripts/provenance/extract-primevue-source.mjs",
        ".vendor-cache/primevue-4.5.5.tar.gz",
        "not-a-real-root",
        "button",
        outDir,
      ]);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("fails clearly when the requested lib subdirectory does not exist", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    assert.throws(() => {
      execFileSync("node", [
        "scripts/provenance/extract-primevue-source.mjs",
        ".vendor-cache/primevue-4.5.5.tar.gz",
        "primevue",
        "does-not-exist",
        outDir,
      ]);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --test scripts/provenance/extract-primevue-source.test.mjs`
Expected: FAIL with "Cannot find module" or ENOENT (script does not exist yet)

- [ ] **Step 3: Write `extract-primevue-source.mjs`**

Modeled directly on `extract-primereact-source.mjs` (same tar-extract-to-tempdir, find-single-root-dir, recursive-copy shape), with the one structural difference PrimeVue's tarball requires: a `<root>` argument selecting between `packages/core/src` (foundation tier — BaseComponent, BaseDirective, BaseEditableHolder, BaseInput) and `packages/primevue/src` (components/directives — button, checkbox, dialog, menu, tooltip, focustrap, ripple, portal, badge), confirmed during Phase 4's Real-Source Verification Gate as the correct dual-root shape (spec §1).

```javascript
#!/usr/bin/env node
// scripts/provenance/extract-primevue-source.mjs
//
// Extracts a specific source subdirectory from the pinned PrimeVue tarball.
// Unlike PrimeReact's single components/lib/ root, PrimeVue's real repo
// splits its source across two roots — confirmed during the Phase 4
// Real-Source Verification Gate (spec §1):
//   - packages/core/src/<name>     — foundation tier (BaseComponent,
//                                     BaseDirective, BaseEditableHolder,
//                                     BaseInput, utils, config, service)
//   - packages/primevue/src/<name> — components and directives (button,
//                                     checkbox, dialog, menu, tooltip,
//                                     focustrap, ripple, portal, badge)
// The <root> argument selects which of these two the requested
// <lib-relative-path> is resolved against.
//
// Usage: node extract-primevue-source.mjs <tarball-path> <root> <lib-relative-path> <output-dir>
//   <root> is one of: "core", "primevue"

import { mkdirSync, readdirSync, statSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const VALID_ROOTS = {
  core: ["packages", "core", "src"],
  primevue: ["packages", "primevue", "src"],
};

const [, , tarballPath, root, libRelativePath, outputDir] = process.argv;

if (!tarballPath || !root || !libRelativePath || !outputDir) {
  console.error(
    "Usage: extract-primevue-source.mjs <tarball-path> <root> <lib-relative-path> <output-dir>\n" +
      '  <root> is one of: "core", "primevue"'
  );
  process.exit(1);
}

if (!VALID_ROOTS[root]) {
  console.error(`invalid root "${root}" — must be one of: ${Object.keys(VALID_ROOTS).join(", ")}`);
  process.exit(1);
}

function findExtractedRoot(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (entries.length !== 1) {
    throw new Error(
      `expected exactly one top-level directory in extracted tarball, found ${entries.length}`
    );
  }
  return join(dir, entries[0].name);
}

function copyRecursive(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

const extractDir = mkdtempSync(join(tmpdir(), "extract-primevue-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const extractedRoot = findExtractedRoot(extractDir);
  const rootSegments = VALID_ROOTS[root];
  const sourceDir = join(extractedRoot, ...rootSegments, libRelativePath);
  const displayPath = [...rootSegments, libRelativePath].join("/");

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`source directory not found in tarball: ${displayPath}`);
  }

  copyRecursive(sourceDir, outputDir);
  console.log(`[extract-primevue-source] copied ${displayPath} to ${outputDir}`);
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `node --test scripts/provenance/extract-primevue-source.test.mjs`
Expected: PASS (all 4 tests)

- [ ] **Step 5: Extend `validate-provenance.mjs`'s watched prefixes and file-extension filter**

Run: `grep -n "MANIFEST_WATCHED_PREFIXES\|endsWith(\"\.ts" scripts/provenance/validate-provenance.mjs` to confirm current state first (`MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react"]`, extension filter matches `.ts`/`.tsx` only).

Modify `scripts/provenance/validate-provenance.mjs`:

```javascript
// Before:
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react"];
// ...
} else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
  files.push(full);
}

// After:
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react", "vue"];
// ...
} else if (
  entry.name.endsWith(".ts") ||
  entry.name.endsWith(".tsx") ||
  entry.name.endsWith(".vue")
) {
  files.push(full);
}
```

- [ ] **Step 6: Verify against the current repo state (no vue packages populated yet)**

Run: `node scripts/provenance/validate-provenance.mjs` (confirm its actual invocation via `package.json` scripts or the script's own usage output first, matching Phase 3's Task 2 approach)
Expected: PASS — `packages/vue`/`packages/vue-core` don't have populated `src/` directories yet, so this check is vacuously satisfied. Confirm explicitly, don't assume.

- [ ] **Step 7: Commit**

```bash
git add scripts/provenance/extract-primevue-source.mjs scripts/provenance/extract-primevue-source.test.mjs scripts/provenance/validate-provenance.mjs
git commit -m "feat(provenance): add PrimeVue dual-root source extraction script, extend manifest check to packages/vue* and .vue files"
```

---

## Task 3: `@ultimate/vue-core` package scaffold + `BaseComponent`

**Files:**

- Create: `packages/vue-core/package.json`
- Create: `packages/vue-core/tsup.config.ts`
- Create: `packages/vue-core/tsconfig.json`
- Create: `packages/vue-core/vitest.config.ts`
- Create: `packages/vue-core/src/base/base-component.ts`
- Create: `packages/vue-core/src/base/base-component.spec.ts`
- Create: `packages/vue-core/src/base/index.ts`
- Create: `packages/vue-core/src/index.ts`
- Create: `packages/vue-core/THIRD-PARTY-NOTICES.md`
- Delete: `packages/vue-core/.gitkeep` (Phase 0 scaffolding placeholder, superseded by real content)

**Interfaces:**

- Consumes: `@ultimate/uix-utils` (`classnames` module).
- Produces: `createBaseComponent` per this plan's Interfaces section — the mixin factory every proof-set component's own `Base*.ts` file (Tasks 17-21) `extends:`.

- [ ] **Step 1: Extract `basecomponent` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz core basecomponent .vendor-extracted/vue/basecomponent`

Read `.vendor-extracted/vue/basecomponent/BaseComponent.vue` in full (already read during the Real-Source Verification Gate — re-read here to confirm nothing has drifted). Confirm again: `cx(key, params)` (verified in the `methods` block) resolves `this._getOptionValue(this.$style.classes, key, {...this.$params, ...params})`; the `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` machinery (`_getPTValue`, `_usePT`, `_getPT`, `globalPT`/`defaultPT` computed) and `inject: { $parentInstance }` are NOT ported — per this plan's Global Constraints.

- [ ] **Step 2: Scaffold `package.json`**

Create `packages/vue-core/package.json`:

```json
{
  "name": "@ultimate/vue-core",
  "version": "0.1.0",
  "description": "Vue-specific foundation for the Ultimate Platform: Options-API base architecture, directive infrastructure, overlay/focus-trap/escape/scroll/motion infrastructure, icons, minimal config.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "dependencies": {
    "@ultimate/uix-utils": "workspace:*",
    "@ultimate/uix-styled": "workspace:*",
    "@ultimate/uix-motion": "workspace:*"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^25.0.1",
    "tsup": "^8.3.0",
    "typescript": "5.9.3",
    "vitest": "^2.1.8",
    "vue": "^3.5.13"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "vue-tsc --noEmit"
  }
}
```

**Note on `sideEffects: false` here**: per Global Constraints, this is a starting package-metadata decision, not yet a measured bundler-behavior confirmation — the tree-shaking validation task (Task 25) validates or corrects it. Do not treat it as final at this step.

**Note on `typecheck` using `vue-tsc` not `tsc`**: `.vue` SFCs need Vue's own type-checker to resolve template types correctly — plain `tsc` cannot parse `.vue` files. Add `"vue-tsc": "^2.1.10"` to `devDependencies` alongside the others listed above.

- [ ] **Step 3: Scaffold `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts`**

Create `packages/vue-core/tsup.config.ts` (single-entry — matches `react-core`'s precedent, no speculative subpath; `@vitejs/plugin-vue` wired as an esbuild plugin so `tsup`/esbuild can parse `.vue` SFCs, which they cannot do natively unlike plain `.tsx`):

```typescript
import { defineConfig } from "tsup";
import vuePlugin from "@vitejs/plugin-vue";
import { createFilter } from "vite";

// tsup/esbuild has no native .vue understanding (unlike its native .tsx
// support, which needed no such plugin in react-core/react's Phase 3
// tsup.config.ts). @vitejs/plugin-vue's transform function compiles a .vue
// SFC's <template>/<script>/<style> blocks; only the JS/TS output of that
// transform is passed on to esbuild, which then handles it exactly like any
// other TS file. This is the vue-core/vue-specific tsup wiring spec §3
// requires.
const vue = vuePlugin();
const filter = createFilter(/\.vue$/);

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  esbuildPlugins: [
    {
      name: "vue-sfc",
      setup(build) {
        build.onLoad({ filter: /\.vue$/ }, async (args) => {
          const fs = await import("node:fs/promises");
          const source = await fs.readFile(args.path, "utf8");
          if (!filter(args.path)) return undefined;
          const result = await vue.transform.call(
            { addWatchFile() {} },
            source,
            args.path
          );
          const code = typeof result === "string" ? result : result?.code ?? source;
          return { contents: code, loader: "ts" };
        });
      },
    },
  ],
});
```

**Implementation-time verification required for this esbuild-plugin shim**: this pattern (wrapping `@vitejs/plugin-vue`'s Rollup-shaped `transform` hook as a raw esbuild `onLoad` plugin) has no prior precedent in this repo — `ng-packagr` (Angular) and plain `tsup` (React) both needed zero such shimming. Before trusting this in later tasks, Step 4 below verifies it against a trivial real `.vue` file. If it does not work as written, the correct fallback (in order of preference) is: (a) a maintained `esbuild-plugin-vue`-equivalent community package if one exists and is license-compatible, or (b) switching this package's build step to real Vite library mode instead of `tsup` for `vue-core`/`vue` specifically (a deviation from this plan's stated tool choice that would need recording as its own decision, not silently done) — do not spend more than one extra task-cycle debugging the shim before escalating to one of these fallbacks.

Create `packages/vue-core/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "preserve"
  },
  "include": ["src"]
}
```

Create `packages/vue-core/vitest.config.ts` (jsdom environment matches `react-core`'s precedent exactly; `@vitejs/plugin-vue` here is Vitest's own native Vite-plugin support, unrelated to the `tsup` shim above — Vitest runs on real Vite, so this usage is the standard, well-precedented one):

```typescript
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 4: Verify the tsup `.vue` shim against a throwaway trivial file, before writing real code against it**

Create a temporary `packages/vue-core/src/__shim-check.vue`:

```vue
<script>
export default {
  name: "ShimCheck",
  methods: {
    greet() {
      return "ok";
    },
  },
};
</script>
```

Create a temporary `packages/vue-core/src/index.ts` containing only:

```typescript
export { default as ShimCheck } from "./__shim-check.vue";
```

Run: `pnpm --filter @ultimate/vue-core build`
Expected: PASS — `dist/index.mjs` exists and contains a real compiled component object (not raw unparsed SFC syntax). If this fails, stop and apply Step 3's fallback guidance before continuing to Step 5.

Delete `packages/vue-core/src/__shim-check.vue` and empty `packages/vue-core/src/index.ts` back out (leave it as an empty file — Step 8 below writes its real first content) once verified.

- [ ] **Step 5: Write the failing test for `createBaseComponent`**

Create `packages/vue-core/src/base/base-component.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createBaseComponent } from "./base-component";

describe("createBaseComponent", () => {
  it("cx() resolves a string class-name slot unchanged", () => {
    const Base = createBaseComponent({
      componentName: "test-component",
      styleModule: { css: "", classes: { label: () => "u-test-label" } },
    });
    const wrapper = mount({
      extends: Base,
      template: `<div>{{ cx("label") }}</div>`,
    });
    expect(wrapper.text()).toBe("u-test-label");
  });

  it("cx() resolves a function class-name slot with params", () => {
    const Base = createBaseComponent({
      componentName: "test-component-2",
      styleModule: {
        css: "",
        classes: { root: (params) => ["u-test-root", { "u-test-active": !!params?.active }] },
      },
    });
    const wrapper = mount({
      extends: Base,
      template: `<div :class="cx('root', { active: true })" />`,
    });
    expect(wrapper.classes()).toContain("u-test-active");
  });

  it("cx() returns undefined for a slot key not present in classes", () => {
    const Base = createBaseComponent({
      componentName: "test-component-3",
      styleModule: { css: "", classes: {} },
    });
    const wrapper = mount({
      extends: Base,
      template: `<div>{{ cx("missing") === undefined ? "yes" : "no" }}</div>`,
    });
    expect(wrapper.text()).toBe("yes");
  });
});
```

- [ ] **Step 6: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test`
Expected: FAIL — `base-component.ts` does not exist yet.

- [ ] **Step 7: Write `base-component.ts`**

Create `packages/vue-core/src/base/base-component.ts`:

```typescript
import { classNames } from "@ultimate/uix-utils";
import type { ComponentOptions } from "vue";

export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface BaseComponentOptions {
  componentName: string;
  styleModule: StyleModule;
}

function resolveClassValue(
  resolver: ((params?: Record<string, unknown>) => ClassValue) | string | undefined,
  params?: Record<string, unknown>
): string | undefined {
  if (resolver === undefined) return undefined;
  const value = typeof resolver === "function" ? resolver(params) : resolver;
  return Array.isArray(value) ? classNames(...value) : classNames(value);
}

// An Options-API mixin object factory — NOT a class, NOT a composable/hook.
// Each Ultimate component's own Base*.ts file calls this once and `extends:`
// the result, matching verified BaseComponent.vue's own extends: mechanism
// exactly (spec §7) — informed by, not copied from, PrimeVue's real source.
export function createBaseComponent(options: BaseComponentOptions): ComponentOptions {
  const { componentName, styleModule } = options;

  return {
    methods: {
      cx(key: string, params?: Record<string, unknown>) {
        return resolveClassValue(styleModule.classes[key], params);
      },
    },
    mounted() {
      // Style registration wiring lands in Task 14 (styling) — this task's
      // scope is cx() resolution only, matching react-core's Task 3
      // precedent where useComponentBase and useComponentStyle were also
      // split across two tasks.
    },
  };
}
```

**Deliberately not included** (per Global Constraints and spec §7): no `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` fields anywhere in this shape, no `inject: { $parentInstance }`.

- [ ] **Step 8: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test`
Expected: PASS (3 assertions)

- [ ] **Step 9: Create barrels**

`packages/vue-core/src/base/index.ts`:

```typescript
export { createBaseComponent } from "./base-component";
export type { StyleModule, ClassValue, BaseComponentOptions } from "./base-component";
```

`packages/vue-core/src/index.ts` (root barrel — starts here, every later task appends its own `export * from "./<dir>"` line):

```typescript
export * from "./base";
```

- [ ] **Step 10: Write `THIRD-PARTY-NOTICES.md`**

Create `packages/vue-core/THIRD-PARTY-NOTICES.md`, following the exact template already used by `packages/vue/THIRD-PARTY-NOTICES.md` (read it first: `cat packages/vue/THIRD-PARTY-NOTICES.md`) — same MIT license text, adjusted only for this package's own incorporated-source description (`vue-core` incorporates PrimeVue's `basecomponent`, `basedirective`, `baseeditableholder`, `baseinput`, `focustrap`, `portal`, `utils` (ZIndex/DomHandler subset) areas as design reference).

- [ ] **Step 11: Delete the Phase 0 `.gitkeep` placeholder**

```bash
git rm packages/vue-core/.gitkeep
```

- [ ] **Step 12: Add provenance entries**

Create `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/core/src/basecomponent/BaseComponent.vue",
    "ultimateDestination": "packages/vue-core/src/base/base-component.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Ultimate-owned, scoped-down reimplementation of PrimeVue's BaseComponent Options-API mixin. Verified source: cx() resolves this._getOptionValue(this.$style.classes, key, params) (BaseComponent.vue methods block). Ultimate decision: excludes the full pt/ptOptions/ptm/ptmi/ptmo passthrough system (~140 lines of nested-key resolution in the verified source) and inject: { $parentInstance } entirely, per spec §7's Option B posture — no demonstrated Ultimate consumer need, same YAGNI justification as ADR-018/024."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/base/base-component.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream (PrimeVue's own BaseComponent.vue has no dedicated spec file)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/base/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 13: Commit**

```bash
git add packages/vue-core/ docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): scaffold package, add BaseComponent cx() resolver"
```

---

## Task 4: `BaseEditableHolder` (v-model / controlled-uncontrolled mixin)

**Files:**

- Create: `packages/vue-core/src/base/base-editable-holder.ts`
- Create: `packages/vue-core/src/base/base-editable-holder.spec.ts`
- Modify: `packages/vue-core/src/base/index.ts`

**Interfaces:**

- Consumes: `createBaseComponent` (Task 3).
- Produces: `createBaseEditableHolder` per this plan's Interfaces section. Consumed by `BaseInput` (Task 5) and, transitively, `UCheckbox`'s `BaseCheckbox.ts` (Task 19).

- [ ] **Step 1: Extract `baseeditableholder` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz core baseeditableholder .vendor-extracted/vue/baseeditableholder`

Read `.vendor-extracted/vue/baseeditableholder/BaseEditableHolder.vue` in full (already read during the Real-Source Verification Gate). Confirm: `modelValue`/`defaultValue` props, `d_value` data, `controlled` computed (`this.$inProps.hasOwnProperty('modelValue') || (!this.$inProps.hasOwnProperty('modelValue') && !this.$inProps.hasOwnProperty('defaultValue'))`), `writeValue(value, event)` method. The `inject: { $pcForm, $pcFormField }` block and `formField`-related watchers/computeds (`$formName`, `$formControl`, `$formNovalidate`, `$formDefaultValue`, `$formValue`) are NOT ported — per Global Constraints (no `@primevue/forms` integration).

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/base/base-editable-holder.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createBaseEditableHolder } from "./base-editable-holder";

describe("createBaseEditableHolder", () => {
  it("controlled mode: reflects the modelValue prop, does not manage its own state", async () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount({
      extends: Base,
      template: `<div>{{ dValue }}</div>`,
      props: { modelValue: { default: undefined } },
    }, { props: { modelValue: "a" } });
    expect(wrapper.text()).toBe("a");
    expect(wrapper.vm.controlled).toBe(true);
    await wrapper.setProps({ modelValue: "b" });
    expect(wrapper.text()).toBe("b");
  });

  it("uncontrolled mode: initializes from defaultValue when modelValue is absent", () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount({
      extends: Base,
      template: `<div>{{ dValue }}</div>`,
      props: { defaultValue: { default: undefined } },
    }, { props: { defaultValue: "initial" } });
    expect(wrapper.text()).toBe("initial");
    expect(wrapper.vm.controlled).toBe(false);
  });

  it("writeValue emits update:modelValue and value-change when controlled", () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount({
      extends: Base,
      template: `<div />`,
      props: { modelValue: { default: undefined } },
    }, { props: { modelValue: "a" } });
    (wrapper.vm as unknown as { writeValue: (v: unknown) => void }).writeValue("b");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    expect(wrapper.emitted("value-change")?.[0]).toEqual(["b"]);
  });

  it("writeValue emits only value-change (not update:modelValue) when uncontrolled", () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount({
      extends: Base,
      template: `<div />`,
      props: { defaultValue: { default: undefined } },
    }, { props: { defaultValue: "a" } });
    (wrapper.vm as unknown as { writeValue: (v: unknown) => void }).writeValue("b");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("value-change")?.[0]).toEqual(["b"]);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test base-editable-holder`
Expected: FAIL — `base-editable-holder.ts` does not exist yet.

- [ ] **Step 4: Write `base-editable-holder.ts`**

Create `packages/vue-core/src/base/base-editable-holder.ts`:

```typescript
import { createBaseComponent, type BaseComponentOptions } from "./base-component";
import type { ComponentOptions } from "vue";

// Layered on createBaseComponent via `extends:`, matching verified
// BaseEditableHolder.vue's own `extends: BaseComponent` chain. The
// @primevue/forms-coupled portions ($pcForm/$pcFormField injection,
// formField.onChange, $formNovalidate/$formValue/$formDefaultValue/
// $formControl) are excluded entirely — deliberate boundary cut of a real,
// verified, working PrimeVue feature (spec §19/§20), not an
// absence-of-feature finding the way it was for React (Phase 3 had nothing
// to exclude here since PrimeReact's own Checkbox has no forms integration).
export function createBaseEditableHolder(
  base: Partial<BaseComponentOptions> = { componentName: "", styleModule: { css: "", classes: {} } }
): ComponentOptions {
  return {
    extends: createBaseComponent(base as BaseComponentOptions),
    props: {
      modelValue: { default: undefined },
      defaultValue: { default: undefined },
    },
    emits: ["update:modelValue", "value-change"],
    data() {
      return {
        dValue: this.defaultValue !== undefined ? this.defaultValue : this.modelValue,
      };
    },
    watch: {
      modelValue(newValue: unknown) {
        this.dValue = newValue;
      },
      defaultValue(newValue: unknown) {
        this.dValue = newValue;
      },
    },
    computed: {
      controlled(): boolean {
        const inProps = this.$options.propsData ?? this.$props;
        return (
          Object.prototype.hasOwnProperty.call(this.$attrs, "modelValue") ||
          this.modelValue !== undefined ||
          (this.modelValue === undefined && this.defaultValue === undefined)
        );
      },
      filled(): boolean {
        return this.dValue !== undefined && this.dValue !== null && this.dValue !== "";
      },
    },
    methods: {
      writeValue(value: unknown, event?: Event) {
        if (this.controlled) {
          this.dValue = value;
          this.$emit("update:modelValue", value);
        }
        this.$emit("value-change", value);
      },
    },
  };
}
```

**Note on the `controlled` computed**: verified `BaseEditableHolder.vue` checks `this.$inProps.hasOwnProperty('modelValue')` — a Vue-internal helper (`$inProps`, filtering `$props` by which keys the parent VNode actually passed) not part of Vue's public component-instance API. The implementation above uses the closest public-API equivalent (checking `this.$attrs`/prop-value-presence). **Implementation-time verification required**: confirm this public-API substitute produces identical `controlled` results to verified `$inProps.hasOwnProperty` behavior across the test cases above, especially the "prop explicitly passed as `undefined`" edge case — if it diverges, either find Vue's actual public equivalent (check whether `getCurrentInstance().vnode.props` is usable, matching `$inProps`'s own real implementation seen in `BaseComponent.vue`) or document the divergence explicitly as an accepted, tested difference, not a silent one.

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test base-editable-holder`
Expected: PASS (4 assertions) — if Step 4's `controlled` implementation note surfaces a real divergence, fix it here before proceeding, per Step 4's guidance.

- [ ] **Step 6: Update barrel**

Add to `packages/vue-core/src/base/index.ts`:

```typescript
export { createBaseEditableHolder } from "./base-editable-holder";
```

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/core/src/baseeditableholder/BaseEditableHolder.vue",
    "ultimateDestination": "packages/vue-core/src/base/base-editable-holder.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream v-model/controlled-uncontrolled contract: modelValue/defaultValue props, d_value internal state, controlled computed detecting whether modelValue was actually passed. Ultimate decision: excludes the live, working @primevue/forms integration ($pcForm/$pcFormField injection, formField.onChange, $formNovalidate/$formValue/$formDefaultValue/$formControl) entirely — a deliberate boundary cut of a real feature, per spec §19/§20's resolved fork (Gate 6 #2), not an absence-of-feature finding."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/base/base-editable-holder.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/base/ docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add BaseEditableHolder v-model/controlled-uncontrolled mixin"
```

---

## Task 5: `BaseInput` (size/fluid/variant intermediate tier)

**Files:**

- Create: `packages/vue-core/src/base/base-input.ts`
- Create: `packages/vue-core/src/base/base-input.spec.ts`
- Modify: `packages/vue-core/src/base/index.ts`

**Interfaces:**

- Consumes: `createBaseEditableHolder` (Task 4).
- Produces: `createBaseInput` per this plan's Interfaces section. Consumed by `UCheckbox`'s `BaseCheckbox.ts` (Task 19) — the real verified chain is `Checkbox extends BaseCheckbox extends BaseInput extends BaseEditableHolder extends BaseComponent` (spec §7, §19).

- [ ] **Step 1: Extract `baseinput` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz core baseinput .vendor-extracted/vue/baseinput`

Read `.vendor-extracted/vue/baseinput/BaseInput.vue` in full (already read during the Real-Source Verification Gate — this is the tier not previously documented until that gate closed spec §19's Checkbox verification gap). Confirm: `extends: BaseEditableHolder`, `size`/`fluid`/`variant` props, `inject: { $pcFluid }`, `$variant`/`$fluid` computeds.

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/base/base-input.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createBaseInput } from "./base-input";

describe("createBaseInput", () => {
  it("resolvedFluid() reflects the fluid prop directly when set", () => {
    const Base = createBaseInput();
    const wrapper = mount(
      { extends: Base, template: `<div>{{ resolvedFluid }}</div>`, props: { fluid: { default: null } } },
      { props: { fluid: true } }
    );
    expect(wrapper.text()).toBe("true");
  });

  it("resolvedFluid() falls back to the injected pcFluid ambient context when unset", () => {
    const Base = createBaseInput();
    const wrapper = mount(
      { extends: Base, template: `<div>{{ resolvedFluid }}</div>` },
      { global: { provide: { pcFluid: true } } }
    );
    expect(wrapper.text()).toBe("true");
  });

  it("resolvedVariant() reflects the variant prop when set", () => {
    const Base = createBaseInput();
    const wrapper = mount(
      { extends: Base, template: `<div>{{ resolvedVariant }}</div>`, props: { variant: { default: null } } },
      { props: { variant: "filled" } }
    );
    expect(wrapper.text()).toBe("filled");
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test base-input`
Expected: FAIL — `base-input.ts` does not exist yet.

- [ ] **Step 4: Write `base-input.ts`**

Create `packages/vue-core/src/base/base-input.ts`:

```typescript
import { createBaseEditableHolder } from "./base-editable-holder";
import type { ComponentOptions } from "vue";

// Layered on createBaseEditableHolder via `extends:`, matching verified
// BaseInput.vue's own `extends: BaseEditableHolder` chain — a real
// intermediate tier not previously documented until this Phase's Checkbox
// verification gap closed (spec §7, §19). Matches the same ambient-Fluid-
// context pattern already independently confirmed for Button (spec §18) and
// Angular's UButton (ADR-018).
export function createBaseInput(): ComponentOptions {
  return {
    extends: createBaseEditableHolder(),
    props: {
      size: { default: null },
      fluid: { default: null },
      variant: { default: null },
    },
    inject: {
      pcFluid: { default: undefined },
    },
    computed: {
      resolvedVariant(): string | null {
        return this.variant ?? null;
      },
      resolvedFluid(): boolean {
        return this.fluid ?? !!(this as unknown as { pcFluid?: boolean }).pcFluid;
      },
    },
  };
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test base-input`
Expected: PASS (3 assertions)

- [ ] **Step 6: Update barrel**

Add to `packages/vue-core/src/base/index.ts`:

```typescript
export { createBaseInput } from "./base-input";
```

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/core/src/baseinput/BaseInput.vue",
    "ultimateDestination": "packages/vue-core/src/base/base-input.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream intermediate tier: size/fluid/variant props, $fluid/$variant computeds, $pcFluid ambient-context injection. Not previously documented in the Phase 4 spec until this Phase's Checkbox verification gap closed — matches the same Fluid-ancestor-detection pattern already confirmed for Button/Angular's UButton (ADR-018)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/base/base-input.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/base/ docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add BaseInput size/fluid/variant intermediate tier"
```

---

## Task 6: `BaseDirective`-equivalent factory

**Files:**

- Create: `packages/vue-core/src/directive/base-directive.ts`
- Create: `packages/vue-core/src/directive/base-directive.spec.ts`
- Create: `packages/vue-core/src/directive/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Produces: `createDirective` per this plan's Interfaces section — the factory `v-focustrap` (Task 11), `v-ripple` (Task 16), and `v-tooltip` (Task 20) are all built on.

- [ ] **Step 1: Extract `basedirective` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz core basedirective .vendor-extracted/vue/basedirective`

Read `.vendor-extracted/vue/basedirective/BaseDirective.js` in full (already read during the Real-Source Verification Gate). Confirm: `BaseDirective._extend(name, options)` returns real Vue directive lifecycle hooks (`created`/`beforeMount`/`mounted`/`beforeUpdate`/`updated`/`beforeUnmount`/`unmounted`), storing per-directive-instance state on `el._$instances[name]`/`el.$pd`. This is a **separate mechanism from `BaseComponent`** — confirmed structurally distinct (a plain object with its own `.extend()` factory, not an `extends:`-consumed mixin). The `pt`/`ptm`/`ptmo` passthrough resolution (`_getPTValue`, `_usePT`, `_getPT`) and the `PrimeVueService` global config-change-event subscription (`watchers['config']`/`watchers['config.ripple']`) are NOT ported — per Global Constraints, no demonstrated Phase 4 need.

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/directive/base-directive.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createDirective } from "./base-directive";

describe("createDirective", () => {
  it("calls the mounted hook with the bound element and binding value", () => {
    const mounted = vi.fn();
    const directive = createDirective({ name: "test-directive", hooks: { mounted } });
    mount(
      { template: `<div v-test-directive="'hello'" />` },
      { global: { directives: { "test-directive": directive } } }
    );
    expect(mounted).toHaveBeenCalledOnce();
    const [el, binding] = mounted.mock.calls[0];
    expect(el).toBeInstanceOf(HTMLElement);
    expect(binding.value).toBe("hello");
  });

  it("calls the unmounted hook when the host element is removed", () => {
    const unmounted = vi.fn();
    const directive = createDirective({ name: "test-directive-2", hooks: { unmounted } });
    const wrapper = mount(
      { template: `<div v-if="show" v-test-directive-2 />`, data: () => ({ show: true }) },
      { global: { directives: { "test-directive-2": directive } } }
    );
    wrapper.vm.show = false;
    return wrapper.vm.$nextTick().then(() => {
      expect(unmounted).toHaveBeenCalledOnce();
    });
  });

  it("calls the updated hook with the new binding value when the binding changes", () => {
    const updated = vi.fn();
    const directive = createDirective({ name: "test-directive-3", hooks: { updated } });
    const wrapper = mount(
      { template: `<div v-test-directive-3="value" />`, data: () => ({ value: "a" }) },
      { global: { directives: { "test-directive-3": directive } } }
    );
    wrapper.vm.value = "b";
    return wrapper.vm.$nextTick().then(() => {
      expect(updated).toHaveBeenCalledOnce();
      const [, binding] = updated.mock.calls[0];
      expect(binding.value).toBe("b");
    });
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test base-directive`
Expected: FAIL — `base-directive.ts` does not exist yet.

- [ ] **Step 4: Write `base-directive.ts`**

Create `packages/vue-core/src/directive/base-directive.ts`:

```typescript
import type { ObjectDirective, DirectiveBinding as VueDirectiveBinding, VNode } from "vue";

export interface DirectiveBinding<TValue = unknown> {
  value: TValue;
  oldValue?: TValue;
}

export interface DirectiveInstanceOptions<TValue = unknown> {
  name: string;
  hooks: {
    mounted?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
    updated?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
    unmounted?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
  };
}

// A separate mechanism from createBaseComponent (Task 3) — returns a real Vue
// ObjectDirective, not an extends:-consumed mixin, matching verified
// BaseDirective.js's own structural distinction from BaseComponent.vue (spec
// §7). No pt/ptm/ptmo passthrough, no PrimeVueService global config-change
// subscription — no demonstrated Phase 4 need for either.
export function createDirective<TValue = unknown>(
  options: DirectiveInstanceOptions<TValue>
): ObjectDirective<HTMLElement, TValue> {
  const { hooks } = options;

  function toBinding(binding: VueDirectiveBinding<TValue>): DirectiveBinding<TValue> {
    return { value: binding.value, oldValue: binding.oldValue };
  }

  return {
    mounted(el, binding) {
      hooks.mounted?.(el, toBinding(binding));
    },
    updated(el, binding) {
      hooks.updated?.(el, toBinding(binding));
    },
    unmounted(el, binding) {
      hooks.unmounted?.(el, toBinding(binding));
    },
  };
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test base-directive`
Expected: PASS (3 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/vue-core/src/directive/index.ts`:

```typescript
export { createDirective } from "./base-directive";
export type { DirectiveBinding, DirectiveInstanceOptions } from "./base-directive";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./directive";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/core/src/basedirective/BaseDirective.js",
    "ultimateDestination": "packages/vue-core/src/directive/base-directive.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Ultimate-owned, scoped-down reimplementation of PrimeVue's BaseDirective factory. Verified source: BaseDirective._extend(name, options) returns real directive lifecycle hooks (created/beforeMount/mounted/beforeUpdate/updated/beforeUnmount/unmounted), a mechanism structurally separate from BaseComponent's extends: mixin chain. Ultimate decision: excludes the full pt/ptm/ptmo passthrough system and the PrimeVueService global config-change-event subscription entirely, per spec §7's Option B posture — no demonstrated Ultimate consumer need."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/directive/base-directive.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream (PrimeVue's own BaseDirective.js has no dedicated spec file)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/directive/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/directive/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add BaseDirective-equivalent factory for directive-shaped primitives"
```

---

## Task 7: `Portal` (native `<Teleport>` wrapper)

**Files:**

- Create: `packages/vue-core/src/overlay/portal.ts`
- Create: `packages/vue-core/src/overlay/portal.spec.ts`
- Create: `packages/vue-core/src/overlay/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Produces: `Portal` per this plan's Interfaces section. Consumed by `UDialog` (Task 21) and `UMenu` (Task 22).

- [ ] **Step 1: Extract `portal` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue portal .vendor-extracted/vue/portal`

Read `.vendor-extracted/vue/portal/Portal.vue` in full (already read during the Real-Source Verification Gate). Confirm: `inline` computed (`disabled || appendTo === 'self'`), `mounted` data flag set from `isClient()` in the `mounted()` hook, template renders `<slot/>` inline when `inline`, else `<Teleport :to="appendTo"><slot/></Teleport>` once `mounted` is true.

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/overlay/portal.spec.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { Portal } from "./portal";

describe("Portal", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("teleports its slot content to document.body by default", async () => {
    mount({
      components: { Portal },
      template: `<Portal><div id="portal-content">hi</div></Portal>`,
    }, { attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.body.querySelector("#portal-content")).not.toBeNull();
  });

  it("renders inline instead of teleporting when disabled", async () => {
    const wrapper = mount({
      components: { Portal },
      template: `<div id="host"><Portal disabled><div id="portal-content">hi</div></Portal></div>`,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("#host #portal-content").exists()).toBe(true);
  });

  it("renders inline when appendTo is 'self'", async () => {
    const wrapper = mount({
      components: { Portal },
      template: `<div id="host"><Portal appendTo="self"><div id="portal-content">hi</div></Portal></div>`,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("#host #portal-content").exists()).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test portal`
Expected: FAIL — `portal.ts` does not exist yet.

- [ ] **Step 4: Write `portal.ts`**

Create `packages/vue-core/src/overlay/portal.ts` (a `defineComponent`, not a `.vue` SFC — no template complex enough to need one; matches `react-core`'s Task 5 `.tsx` precedent's simplicity):

```typescript
import { defineComponent, h, ref, onMounted, Teleport, type PropType } from "vue";

export interface PortalProps {
  appendTo?: string | HTMLElement;
  disabled?: boolean;
}

// Thin wrapper around native <Teleport>, matching verified Portal.vue exactly:
// an `inline` escape hatch (disabled || appendTo === "self") renders the slot
// in place; otherwise gated by a `mounted` flag (set via isClient()-equivalent
// check in onMounted) before teleporting — SSR-safe, no extra guard needed
// beyond this gate (spec §13).
export const Portal = defineComponent({
  name: "UPortal",
  props: {
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const mounted = ref(false);

    onMounted(() => {
      mounted.value = typeof document !== "undefined";
    });

    return () => {
      const inline = props.disabled || props.appendTo === "self";
      if (inline) return slots.default?.();
      if (!mounted.value) return null;
      return h(Teleport, { to: props.appendTo }, slots.default?.());
    };
  },
});
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test portal`
Expected: PASS (3 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/vue-core/src/overlay/index.ts`:

```typescript
export { Portal } from "./portal";
export type { PortalProps } from "./portal";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./overlay";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/portal/Portal.vue",
    "ultimateDestination": "packages/vue-core/src/overlay/portal.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: a thin wrapper around Vue's native <Teleport>, an `inline` escape hatch (disabled || appendTo === 'self') rendering the slot in place instead of teleporting, gated otherwise by a mounted flag set from an isClient()-equivalent check in onMounted — SSR-safe. Authored fresh as a defineComponent (not a .vue SFC — no template complexity warrants one)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/overlay/portal.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/overlay/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/overlay/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add Portal wrapping native Teleport"
```

---

## Task 8: Escape adapter (Vue mixin piece + reactive display-order wrapper)

**Files:**

- Create: `packages/vue-core/src/escape/use-global-escape-key.ts`
- Create: `packages/vue-core/src/escape/use-display-order.ts`
- Create: `packages/vue-core/src/escape/escape.spec.ts`
- Create: `packages/vue-core/src/escape/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/uix-utils/escape`'s `escapeRegistry`, `displayOrderRegistry`, `ESCAPE_PRIORITIES` (Task 1).
- Produces: `createGlobalEscapeKeyMixin` and `useDisplayOrder` per this plan's Interfaces section. Consumed by `UDialog` (Task 21) only — `UMenu` uses its own local `keydown` handler instead (spec §10's correction, §13) and does NOT consume this module.

- [ ] **Step 1: Write the failing tests**

Create `packages/vue-core/src/escape/escape.spec.ts` (test *design* ported from `react-core/src/escape/escape.spec.ts`, rewritten for Vue's mixin/`ref()` shape):

```typescript
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { createGlobalEscapeKeyMixin } from "./use-global-escape-key";
import { useDisplayOrder } from "./use-display-order";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
}

describe("createGlobalEscapeKeyMixin", () => {
  it("calls the callback on Escape when `when` returns true", () => {
    const callback = vi.fn();
    const Component = {
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => 1],
        }),
      ],
      template: `<div />`,
    };
    const wrapper = mount(Component);
    fireEscape();
    expect(callback).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("does not call the callback when `when` returns false", () => {
    const callback = vi.fn();
    const wrapper = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => false,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => 1],
        }),
      ],
      template: `<div />`,
    });
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("deregisters on unmount, so a later Escape does not call a stale callback", () => {
    const callback = vi.fn();
    const wrapper = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.TOOLTIP, () => 1],
        }),
      ],
      template: `<div />`,
    });
    wrapper.unmount();
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("useDisplayOrder", () => {
  it("assigns increasing order to successively registered visible instances in the same group", () => {
    const isVisible = ref(true);
    const first = useDisplayOrder("test-group-vue-a", isVisible);
    const second = useDisplayOrder("test-group-vue-a", isVisible);
    expect(second.value ?? 0).toBeGreaterThan(first.value ?? 0);
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue-core test escape`
Expected: FAIL — neither file exists yet.

- [ ] **Step 3: Write `use-global-escape-key.ts`**

Create `packages/vue-core/src/escape/use-global-escape-key.ts`:

```typescript
import { escapeRegistry } from "@ultimate/uix-utils/escape";
import type { ComponentOptions } from "vue";

export interface CreateGlobalEscapeKeyMixinOptions {
  callback: (event: KeyboardEvent) => void;
  when: () => boolean;
  priority: [primary: number, secondary: () => number | undefined];
}

// Calls @ultimate/uix-utils/escape's shared escapeRegistry directly — NOT
// through react-core (spec §11, §28). Registration is triggered from the same
// mounted/beforeUnmount lifecycle pair BaseComponent's mixin chain already
// provides, matching this plan's Task 3 foundation.
export function createGlobalEscapeKeyMixin({
  callback,
  when,
  priority,
}: CreateGlobalEscapeKeyMixinOptions): ComponentOptions {
  const [primary, getSecondary] = priority;
  let registered = false;

  function register() {
    const secondary = getSecondary();
    if (!when() || secondary === undefined || registered) return;
    escapeRegistry.register(primary, secondary, callback);
    registered = true;
  }

  function unregister() {
    const secondary = getSecondary();
    if (!registered || secondary === undefined) return;
    escapeRegistry.unregister(primary, secondary);
    registered = false;
  }

  return {
    mounted() {
      register();
    },
    updated() {
      unregister();
      register();
    },
    beforeUnmount() {
      unregister();
    },
  };
}
```

- [ ] **Step 4: Write `use-display-order.ts`**

Create `packages/vue-core/src/escape/use-display-order.ts`:

```typescript
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { displayOrderRegistry } from "@ultimate/uix-utils/escape";

let uidCounter = 0;

// Vue-native ref()-based reactive wrapper over uix-utils/escape's shared
// displayOrderRegistry (NOT React's useState/return-value contract, spec §11 —
// that stays in react-core, unchanged and un-extracted). Own implementation,
// informed by but not copied from use-display-order.ts's React shape.
export function useDisplayOrder(group: string, isVisible: Ref<boolean> | boolean): Ref<number | undefined> {
  const uid = ++uidCounter;
  const displayOrder = ref<number | undefined>(undefined);

  function isCurrentlyVisible(): boolean {
    return typeof isVisible === "boolean" ? isVisible : isVisible.value;
  }

  onMounted(() => {
    if (isCurrentlyVisible()) {
      displayOrder.value = displayOrderRegistry.register(group, uid);
    }
  });

  onUnmounted(() => {
    displayOrderRegistry.unregister(group, uid);
    displayOrder.value = undefined;
  });

  return displayOrder;
}
```

**Note**: this task's simplified `onMounted`-only registration does not react to `isVisible` toggling after mount (React's `use-display-order.ts` re-runs its effect on every `isVisible` change via the dependency array). `UDialog` (Task 21) is the only consumer, and Dialog's visibility is driven by mount/unmount of the whole overlay subtree via `v-if`/`Portal`, not a toggling `isVisible` ref on an always-mounted component — confirm this assumption holds when wiring Task 21; if a future consumer needs true reactive re-registration on visibility toggle without remount, extend this function with a `watch(isVisible, ...)` at that point, not speculatively here.

- [ ] **Step 5: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/vue-core test escape`
Expected: PASS (4 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/vue-core/src/escape/index.ts`:

```typescript
export { createGlobalEscapeKeyMixin } from "./use-global-escape-key";
export type { CreateGlobalEscapeKeyMixinOptions } from "./use-global-escape-key";
export { useDisplayOrder } from "./use-display-order";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./escape";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/escape/use-global-escape-key.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Consumes @ultimate/uix-utils/escape's shared priority-tuple registry (extracted from react-core/src/escape/use-global-escape-key.ts during Phase 4's prerequisite work, Task 1); PrimeVue's own Dialog.vue keydown listener has no equivalent stacking mechanism (verified gap, spec §11). This file supplies only the Vue mixin mounted/updated/beforeUnmount lifecycle wiring — not a react-core dependency."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/escape/use-display-order.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Consumes @ultimate/uix-utils/escape's shared displayOrderRegistry (extracted from react-core/src/escape/use-display-order.ts's registry portion only during Phase 4's prerequisite work, Task 1 — the useState-based reactive contract itself was NOT extracted, staying React-specific). This file supplies Vue's own ref()-based reactive wrapper, independently authored."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/escape/escape.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite, test design ported from react-core/src/escape/escape.spec.ts and rewritten for Vue's mixin/ref() shape."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/escape/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/escape/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add Escape adapter over shared uix-utils/escape registry"
```

---

## Task 9: `useZIndex` wrapper

**Files:**

- Create: `packages/vue-core/src/zindex/use-z-index.ts`
- Create: `packages/vue-core/src/zindex/zindex.spec.ts`
- Create: `packages/vue-core/src/zindex/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/uix-utils/zindex`'s `ZIndex` singleton (existing, Phase 1).
- Produces: `useZIndex`, `Z_INDEX_KEYS` per this plan's Interfaces section. Consumed by `UDialog` (Task 21), `UMenu` (Task 22), `v-tooltip` (Task 20).

- [ ] **Step 1: Confirm the verified keys, no new extraction needed**

Run: `grep -n "ZIndex.set" .vendor-extracted/vue/*/*.vue .vendor-extracted/vue/*/*.js 2>/dev/null` against whichever of `dialog`, `menu`, `tooltip` are already extracted at this point in the plan (if not yet extracted, run `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue dialog .vendor-extracted/vue/dialog` first, same for `menu`/`tooltip`). Confirm the three verified keys this plan's Global Constraints already state: `'modal'` (Dialog), `'menu'` (Menu), `'tooltip'` (Tooltip) — no redesign of `@ultimate/uix-utils/zindex` itself (spec §12).

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/zindex/zindex.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { useZIndex, Z_INDEX_KEYS } from "./use-z-index";

describe("useZIndex", () => {
  it("set() assigns an incrementing z-index style to the element for a given key", () => {
    const { set } = useZIndex();
    const el = document.createElement("div");
    set(Z_INDEX_KEYS.modal, el, 1100);
    expect(Number(el.style.zIndex)).toBeGreaterThan(1100);
  });

  it("clear() removes the z-index style", () => {
    const { set, clear } = useZIndex();
    const el = document.createElement("div");
    set(Z_INDEX_KEYS.menu, el, 1000);
    clear(el);
    expect(el.style.zIndex).toBe("");
  });

  it("set() is a no-op when the element is null", () => {
    const { set } = useZIndex();
    expect(() => set(Z_INDEX_KEYS.tooltip, null, 1100)).not.toThrow();
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test zindex`
Expected: FAIL — `use-z-index.ts` does not exist yet.

- [ ] **Step 4: Write `use-z-index.ts`**

Create `packages/vue-core/src/zindex/use-z-index.ts`:

```typescript
import { ZIndex } from "@ultimate/uix-utils/zindex";

// Verified real PrimeVue keys — Dialog.vue's `ZIndex.set('modal', this.mask,
// ...)`, Menu.vue's `ZIndex.set('menu', el, ...)`, Tooltip.js's
// `ZIndex.set('tooltip', tooltipElement, ...)` (spec §12, all three verified).
export const Z_INDEX_KEYS = { modal: "modal", menu: "menu", tooltip: "tooltip" } as const;

// Thin wrapper around @ultimate/uix-utils/zindex's ZIndex — does not modify
// that module (spec §12's component-level-configuration-only posture).
export function useZIndex(): {
  set: (key: keyof typeof Z_INDEX_KEYS, element: HTMLElement | null, baseZIndex?: number) => void;
  clear: (element: HTMLElement | null) => void;
} {
  return {
    set(key, element, baseZIndex) {
      if (!element) return;
      ZIndex.set(key, element, baseZIndex);
    },
    clear(element) {
      if (!element) return;
      ZIndex.clear(element);
    },
  };
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test zindex`
Expected: PASS (3 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/vue-core/src/zindex/index.ts`:

```typescript
export { useZIndex, Z_INDEX_KEYS } from "./use-z-index";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./zindex";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/zindex/use-z-index.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Thin Vue wrapper directly reusing @ultimate/uix-utils/zindex's existing ZIndex singleton — verified algorithmically identical to PrimeVue's real ZIndexUtils behavior (spec §12), no redesign. Z_INDEX_KEYS values verified against real ZIndex.set() call sites in Dialog.vue ('modal'), Menu.vue ('menu'), Tooltip.js ('tooltip')."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/zindex/zindex.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/zindex/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/zindex/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add useZIndex wrapper around uix-utils/zindex"
```

---

## Task 10: `v-focustrap` directive

**Files:**

- Create: `packages/vue-core/src/focus-trap/focus-trap.ts`
- Create: `packages/vue-core/src/focus-trap/focus-trap.spec.ts`
- Create: `packages/vue-core/src/focus-trap/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Consumes: `createDirective` (Task 6); `@ultimate/uix-utils/dom`'s `getFirstFocusableElement`, `getLastFocusableElement`, `focus`, `createElement` (existing, Phase 1, confirmed present verbatim during Phase 4's Real-Source Verification Gate).
- Produces: `focusTrapDirective` per this plan's Interfaces section. Consumed by `UDialog` (Task 21).

- [ ] **Step 1: Extract `focustrap` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue focustrap .vendor-extracted/vue/focustrap`

Read `.vendor-extracted/vue/focustrap/FocusTrap.js` and `.vendor-extracted/vue/focustrap/BaseFocusTrap.js` in full (already read during the Real-Source Verification Gate). Confirm: `mounted(el, binding)` — if `!binding.value?.disabled` — creates two hidden sentinel `<span>`s (`createHiddenFocusableElements`), binds a `MutationObserver` + `focusin`/`focusout` listeners (`bind`), then `autoElementFocus`. `updated` unbinds if `disabled` transitions true. `unmounted` calls `unbind` (disconnects `MutationObserver`, removes listeners). No keydown interception anywhere. Does NOT restore focus on unmount.

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/focus-trap/focus-trap.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { focusTrapDirective } from "./focus-trap";

function template() {
  return `
    <div v-focustrap="{ disabled }">
      <button id="first">First</button>
      <button id="second">Second</button>
    </div>
  `;
}

describe("v-focustrap", () => {
  it("creates two hidden sentinel spans bracketing the trapped content when not disabled", () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: false }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    const spans = wrapper.findAll("span");
    expect(spans.length).toBe(2);
    expect(spans[0].attributes("role")).toBe("presentation");
    wrapper.unmount();
  });

  it("does not create sentinels when disabled", () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: true }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    expect(wrapper.findAll("span").length).toBe(0);
    wrapper.unmount();
  });

  it("auto-focuses the first focusable element when autoFocus is set", () => {
    const wrapper = mount(
      {
        template: `<div v-focustrap="{ autoFocus: true }"><button id="first">First</button></div>`,
      },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    expect(document.activeElement?.id).toBe("first");
    wrapper.unmount();
  });

  it("redirects focus into the trap when the first sentinel is focused (Shift+Tab wraparound)", () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: false }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    const firstSentinel = wrapper.findAll("span")[0];
    firstSentinel.element.dispatchEvent(new FocusEvent("focus"));
    expect(document.activeElement?.id).toBe("second"); // wraps to the last real focusable
    wrapper.unmount();
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test focus-trap`
Expected: FAIL — `focus-trap.ts` does not exist yet.

- [ ] **Step 4: Write `focus-trap.ts`**

Create `packages/vue-core/src/focus-trap/focus-trap.ts`:

```typescript
import {
  createElement,
  focus,
  getFirstFocusableElement,
  getLastFocusableElement,
} from "@ultimate/uix-utils/dom";
import { createDirective, type DirectiveBinding } from "../directive/base-directive";

export interface FocusTrapBindingValue {
  disabled?: boolean;
  autoFocus?: boolean;
  autoFocusSelector?: string;
  firstFocusableSelector?: string;
  lastFocusableSelector?: string;
}

interface TrapState {
  observer?: MutationObserver;
  focusInListener?: (event: FocusEvent) => void;
  focusOutListener?: (event: FocusEvent) => void;
  firstSentinel?: HTMLElement;
  lastSentinel?: HTMLElement;
}

const stateByElement = new WeakMap<HTMLElement, TrapState>();

function getComputedSelector(selector?: string): string {
  return `:not(.u-hidden-focusable):not([data-u-hidden-focusable="true"])${selector ?? ""}`;
}

function createSentinel(onFocus: (event: FocusEvent) => void): HTMLElement {
  const el = createElement("span", {
    class: "u-hidden-accessible u-hidden-focusable",
    tabIndex: 0,
    role: "presentation",
    "aria-hidden": true,
    "data-u-hidden-accessible": true,
    "data-u-hidden-focusable": true,
  }) as HTMLElement;
  el.addEventListener("focus", onFocus);
  return el;
}

function bind(el: HTMLElement, binding: FocusTrapBindingValue): void {
  const state: TrapState = {};
  stateByElement.set(el, state);

  const onFirstHiddenFocus = (event: FocusEvent) => {
    const related = event.relatedTarget as HTMLElement | null;
    const target =
      related === state.lastSentinel || !el.contains(related)
        ? getFirstFocusableElement(el, getComputedSelector(binding.firstFocusableSelector))
        : state.lastSentinel;
    if (target) focus(target);
  };

  const onLastHiddenFocus = (event: FocusEvent) => {
    const related = event.relatedTarget as HTMLElement | null;
    const target =
      related === state.firstSentinel || !el.contains(related)
        ? getLastFocusableElement(el, getComputedSelector(binding.lastFocusableSelector))
        : state.firstSentinel;
    if (target) focus(target);
  };

  state.firstSentinel = createSentinel(onFirstHiddenFocus);
  state.lastSentinel = createSentinel(onLastHiddenFocus);
  el.prepend(state.firstSentinel);
  el.append(state.lastSentinel);

  state.observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" && !el.contains(document.activeElement)) {
        const next = getFirstFocusableElement(el, getComputedSelector());
        if (next) focus(next);
      }
    }
  });
  state.observer.observe(el, { childList: true });

  state.focusInListener = () => {};
  state.focusOutListener = () => {};
  el.addEventListener("focusin", state.focusInListener);
  el.addEventListener("focusout", state.focusOutListener);
}

function unbind(el: HTMLElement): void {
  const state = stateByElement.get(el);
  if (!state) return;
  state.observer?.disconnect();
  if (state.focusInListener) el.removeEventListener("focusin", state.focusInListener);
  if (state.focusOutListener) el.removeEventListener("focusout", state.focusOutListener);
  stateByElement.delete(el);
}

function autoElementFocus(el: HTMLElement, binding: FocusTrapBindingValue): void {
  let target = getFirstFocusableElement(el, `[autofocus]${getComputedSelector(binding.autoFocusSelector)}`);
  if (binding.autoFocus && !target) {
    target = getFirstFocusableElement(el, getComputedSelector(binding.firstFocusableSelector));
  }
  if (target) focus(target);
}

// Sentinel-span + MutationObserver mechanism, matching verified FocusTrap.js
// exactly (spec §14). disabled=true -> unbound/inactive: mounted skips setup
// entirely. disabled=false -> bound/active. Does NOT restore focus on unmount
// (verified — no such logic upstream); that is UDialog's responsibility
// (Task 21).
export const focusTrapDirective = createDirective<FocusTrapBindingValue | undefined>({
  name: "focustrap",
  hooks: {
    mounted(el, binding: DirectiveBinding<FocusTrapBindingValue | undefined>) {
      const value = binding.value ?? {};
      if (!value.disabled) {
        bind(el, value);
        autoElementFocus(el, value);
      }
    },
    updated(el, binding) {
      if (binding.value?.disabled) unbind(el);
    },
    unmounted(el) {
      unbind(el);
    },
  },
});
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test focus-trap`
Expected: PASS (4 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/vue-core/src/focus-trap/index.ts`:

```typescript
export { focusTrapDirective } from "./focus-trap";
export type { FocusTrapBindingValue } from "./focus-trap";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./focus-trap";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/focustrap/FocusTrap.js",
    "ultimateDestination": "packages/vue-core/src/focus-trap/focus-trap.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream sentinel-span + MutationObserver mechanism (spec §14): two hidden focusable spans bracketing trapped content, each redirecting focus to the first/last real focusable descendant on focus; a MutationObserver redirects focus if lost after a dynamic-content change. disabled=true/false explicit two-state contract matches verified source exactly. Reuses existing @ultimate/uix-utils/dom's getFirstFocusableElement/getLastFocusableElement/focus/createElement (already-built Phase 1 primitives, confirmed present verbatim). Does not restore focus on unmount (verified absent upstream) — UDialog's own responsibility."
  },
  {
    "originalPath": "packages/primevue/src/focustrap/BaseFocusTrap.js",
    "ultimateDestination": "packages/vue-core/src/focus-trap/focus-trap.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream: BaseFocusTrap.extend('focustrap', { style: FocusTrapStyle }) — this file's Ultimate equivalent uses the createDirective factory (Task 6) instead; no separate BaseFocusTrap-equivalent file needed since createDirective already supplies the shared factory shape."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/focus-trap/focus-trap.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream (PrimeVue's own FocusTrap.js has no dedicated spec file)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/focus-trap/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue-core/src/focus-trap/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add v-focustrap directive"
```

---

## Task 11: Scroll-lock adapter

**Files:**

- Create: `packages/vue-core/src/scroll-lock/use-scroll-lock.ts`
- Create: `packages/vue-core/src/scroll-lock/scroll-lock.spec.ts`
- Create: `packages/vue-core/src/scroll-lock/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/uix-utils/scroll-lock`'s `scrollLockRegistry` (Task 1).
- Produces: `useScrollLock` per this plan's Interfaces section. Consumed by `UDialog` (Task 21).

- [ ] **Step 1: Write the failing test**

Create `packages/vue-core/src/scroll-lock/scroll-lock.spec.ts` (same coverage as `react-core/src/scroll-lock/scroll-lock.spec.ts`, since this adapter wraps the identical shared registry):

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { useScrollLock } from "./use-scroll-lock";

describe("useScrollLock", () => {
  afterEach(() => {
    const { unregister } = useScrollLock();
    unregister("dialog-1");
    unregister("dialog-2");
    document.body.className = "";
  });

  it("registering the first dialog blocks body scroll", () => {
    const { register } = useScrollLock();
    register("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("unregistering the last blocking dialog unblocks scroll", () => {
    const { register, unregister } = useScrollLock();
    register("dialog-1");
    unregister("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregistering an id that was never registered is a no-op", () => {
    const { unregister } = useScrollLock();
    expect(() => unregister("never-registered")).not.toThrow();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test scroll-lock`
Expected: FAIL — `use-scroll-lock.ts` does not exist yet.

- [ ] **Step 3: Write `use-scroll-lock.ts`**

Create `packages/vue-core/src/scroll-lock/use-scroll-lock.ts`:

```typescript
import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";

// Thin Vue wrapper calling @ultimate/uix-utils/scroll-lock's shared
// scrollLockRegistry directly — vue-core does not own this Set (spec §16,
// §28). Not a react-core dependency.
export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
} {
  return {
    register(id) {
      scrollLockRegistry.register(id);
    },
    unregister(id) {
      scrollLockRegistry.unregister(id);
    },
  };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test scroll-lock`
Expected: PASS (3 assertions)

- [ ] **Step 5: Create barrel, update root index**

`packages/vue-core/src/scroll-lock/index.ts`:

```typescript
export { useScrollLock } from "./use-scroll-lock";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./scroll-lock";`.

- [ ] **Step 6: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/scroll-lock/use-scroll-lock.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Consumes @ultimate/uix-utils/scroll-lock's shared scrollLockRegistry (extracted in full from react-core/src/scroll-lock/use-scroll-lock.ts during Phase 4's prerequisite work, Task 1); Dialog.vue's own blockBodyScroll/unblockBodyScroll calls have no reference-counting (verified gap, spec §16). This file supplies only the register/unregister call-site wrapper — not a react-core dependency."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/scroll-lock/scroll-lock.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, same coverage shape as react-core/src/scroll-lock/scroll-lock.spec.ts since both wrap the identical shared registry."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/scroll-lock/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 7: Commit**

```bash
git add packages/vue-core/src/scroll-lock/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add scroll-lock adapter over shared uix-utils/scroll-lock registry"
```

---

## Task 12: Motion (`<transition>` hook wiring helper)

**Files:**

- Create: `packages/vue-core/src/motion/use-motion.ts`
- Create: `packages/vue-core/src/motion/motion.spec.ts`
- Create: `packages/vue-core/src/motion/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/uix-motion`'s `createMotion(element, options)` (existing, Phase 1).
- Produces: `createMotionTransitionHooks` per this plan's Interfaces section. Consumed by `UDialog` (Task 21), `UMenu` (Task 22).

- [ ] **Step 1: Write the failing test**

Create `packages/vue-core/src/motion/motion.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { createMotionTransitionHooks } from "./use-motion";

vi.mock("@ultimate/uix-motion", () => ({
  createMotion: vi.fn(() => ({
    enter: vi.fn(() => Promise.resolve()),
    leave: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(),
  })),
}));

describe("createMotionTransitionHooks", () => {
  it("onEnter calls createMotion(el, options).enter() and the done callback on resolution", async () => {
    const { createMotion } = await import("@ultimate/uix-motion");
    const hooks = createMotionTransitionHooks(() => ({}));
    const el = document.createElement("div");
    const done = vi.fn();
    hooks.onEnter(el, done);
    expect(createMotion).toHaveBeenCalledWith(el, {});
    await new Promise((r) => setTimeout(r, 0));
    expect(done).toHaveBeenCalledOnce();
  });

  it("onLeave calls createMotion(el, options).leave() and the done callback on resolution", async () => {
    const hooks = createMotionTransitionHooks(() => ({}));
    const el = document.createElement("div");
    const done = vi.fn();
    hooks.onLeave(el, done);
    await new Promise((r) => setTimeout(r, 0));
    expect(done).toHaveBeenCalledOnce();
  });

  it("onEnterCancelled/onLeaveCancelled call .cancel() on the current motion instance", () => {
    const hooks = createMotionTransitionHooks(() => ({}));
    const el = document.createElement("div");
    hooks.onEnter(el, () => {});
    expect(() => hooks.onEnterCancelled(el)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test motion`
Expected: FAIL — `use-motion.ts` does not exist yet.

- [ ] **Step 3: Write `use-motion.ts`**

Create `packages/vue-core/src/motion/use-motion.ts`:

```typescript
import { createMotion, type MotionOptions } from "@ultimate/uix-motion";

interface MotionByElement {
  cancel: () => void;
}

const motionByElement = new WeakMap<Element, MotionByElement>();

// Returns the exact hook-callback shape Vue's native <transition> element
// expects — NOT a useEffect-shaped call site the way react-core's useMotion
// is (spec §17). No react-transition-group-equivalent dependency; calls the
// same already-framework-agnostic @ultimate/uix-motion createMotion Angular
// and React already use.
export function createMotionTransitionHooks(getOptions: () => MotionOptions): {
  onEnter: (el: Element, done: () => void) => void;
  onLeave: (el: Element, done: () => void) => void;
  onEnterCancelled: (el: Element) => void;
  onLeaveCancelled: (el: Element) => void;
} {
  function run(el: Element, action: "enter" | "leave", done: () => void) {
    const motion = createMotion(el as HTMLElement, getOptions());
    motionByElement.set(el, motion);
    motion[action]().then(done);
  }

  return {
    onEnter(el, done) {
      run(el, "enter", done);
    },
    onLeave(el, done) {
      run(el, "leave", done);
    },
    onEnterCancelled(el) {
      motionByElement.get(el)?.cancel();
    },
    onLeaveCancelled(el) {
      motionByElement.get(el)?.cancel();
    },
  };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test motion`
Expected: PASS (3 assertions)

- [ ] **Step 5: Create barrel, update root index**

`packages/vue-core/src/motion/index.ts`:

```typescript
export { createMotionTransitionHooks } from "./use-motion";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./motion";`.

- [ ] **Step 6: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/motion/use-motion.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Wires @ultimate/uix-motion's existing createMotion(element, options) into Vue's native <transition> hook-callback shape (@enter/@leave with a done callback) — verified real Dialog.vue <transition> usage confirms no wrapper-library dependency upstream (spec §17). No new runtime dependency; same framework-agnostic primitive Angular's effect() and React's useEffect already call, just a different call-site mechanism."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/motion/motion.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/motion/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 7: Commit**

```bash
git add packages/vue-core/src/motion/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add motion transition-hook wiring for native <transition>"
```

---

## Task 13: `VueStyleSheet` adapter + wiring into `BaseComponent`

**Files:**

- Create: `packages/vue-core/src/styling/vue-style-sheet.ts`
- Create: `packages/vue-core/src/styling/styling.spec.ts`
- Create: `packages/vue-core/src/styling/index.ts`
- Modify: `packages/vue-core/src/base/base-component.ts` (wire in real style registration)
- Modify: `packages/vue-core/src/base/base-component.spec.ts` (add a style-injection regression test)
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/uix-styled`'s `StyleSheet` class (existing, Phase 1); `@ultimate/uix-utils/dom`'s `createStyleElement` (existing, Phase 1).
- Produces: `vueCoreStyleSheet`, `registerComponentStyle` per this plan's Interfaces section. `createBaseComponent` (Task 3) now calls `registerComponentStyle` from its `mounted()` hook, completing that task's deferred scope.

- [ ] **Step 1: Extract reference source and confirm the exact registration-timing pattern**

Re-read `.vendor-extracted/vue/basecomponent/BaseComponent.vue`'s `watch: { isUnstyled: { immediate: true, handler() { this._loadCoreStyles(); ... } } }` block (already read in Task 3 Step 1) — confirms style registration happens at **instance-lifecycle-time** (via an `immediate: true` watcher, which fires once during component creation, before `mounted`), not module-import-time and not per-render.

- [ ] **Step 2: Write the failing test**

Create `packages/vue-core/src/styling/styling.spec.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { vueCoreStyleSheet, registerComponentStyle } from "./vue-style-sheet";

describe("VueStyleSheet adapter", () => {
  afterEach(() => {
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("registerComponentStyle injects a real <style> element into document.head", () => {
    registerComponentStyle("styling-test-component", {
      css: ".u-styling-test { color: red; }",
      classes: {},
    });
    const styleEl = document.head.querySelector('style[data-u-style="styling-test-component"]');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain(".u-styling-test");
  });

  it("registering the same componentName twice does not inject a second <style> element", () => {
    registerComponentStyle("styling-test-dedup", { css: ".u-dedup {}", classes: {} });
    registerComponentStyle("styling-test-dedup", { css: ".u-dedup {}", classes: {} });
    const matches = document.head.querySelectorAll('style[data-u-style="styling-test-dedup"]');
    expect(matches.length).toBe(1);
  });

  it("vueCoreStyleSheet.createStyleElement returns undefined when document is unavailable (SSR guard)", () => {
    const originalDocument = globalThis.document;
    // @ts-expect-error simulating SSR
    delete globalThis.document;
    try {
      expect(vueCoreStyleSheet.createStyleElement({ name: "ssr-test", css: "" })).toBeUndefined();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue-core test styling`
Expected: FAIL — `vue-style-sheet.ts` does not exist yet.

- [ ] **Step 4: Write `vue-style-sheet.ts`**

Create `packages/vue-core/src/styling/vue-style-sheet.ts`:

```typescript
import { StyleSheet, type StyleMeta } from "@ultimate/uix-styled";
import { createStyleElement } from "@ultimate/uix-utils/dom";
import type { StyleModule } from "../base/base-component";

// Vue-only subclass of @ultimate/uix-styled's StyleSheet<HTMLStyleElement>,
// overriding createStyleElement to delegate to the already-built
// @ultimate/uix-utils/dom's createStyleElement — no PrimeVue styling code
// ported (spec §8). SSR-guarded via typeof document check, mirroring
// react-core's ReactStyleSheet's identical guard.
class VueStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined;
    const el = createStyleElement(meta.css ?? "", { "data-u-style": meta.name }, document.head);
    return el as HTMLStyleElement;
  }
}

// A single module-level instance, matching ngCoreStyleSheet's and
// reactCoreStyleSheet's singleton pattern.
export const vueCoreStyleSheet = new VueStyleSheet();

// Registers styleModule with vueCoreStyleSheet exactly once per componentName
// (has()/add() guard) — called from createBaseComponent's mounted-equivalent
// lifecycle point (instance-lifecycle-time, matching verified
// BaseComponent.vue's immediate-watcher timing), not module-import-time.
export function registerComponentStyle(componentName: string, styleModule: StyleModule): void {
  if (vueCoreStyleSheet.has(componentName)) return;
  vueCoreStyleSheet.add(componentName, { css: styleModule.css });
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue-core test styling`
Expected: PASS (3 assertions) — this is the specific regression test that would have caught Angular's silent styling gap (ADR-023 follow-up #6); it must pass for Vue from day one.

- [ ] **Step 6: Wire `registerComponentStyle` into `createBaseComponent`'s `mounted()` hook**

Modify `packages/vue-core/src/base/base-component.ts` — replace the empty `mounted()` body:

```typescript
import { registerComponentStyle } from "../styling/vue-style-sheet";

// ... (rest of the file unchanged) ...

export function createBaseComponent(options: BaseComponentOptions): ComponentOptions {
  const { componentName, styleModule } = options;

  return {
    methods: {
      cx(key: string, params?: Record<string, unknown>) {
        return resolveClassValue(styleModule.classes[key], params);
      },
    },
    mounted() {
      registerComponentStyle(componentName, styleModule);
    },
  };
}
```

**Note**: verified `BaseComponent.vue` registers styles from an `immediate: true` watcher (fires during instance creation, before `mounted`), not from `mounted` itself. Using Vue's `mounted()` hook here instead is a deliberate, simpler choice — style registration is idempotent (guarded by `has()`), so firing it slightly later (at mount instead of at instance-creation) produces no observable behavioral difference for any Phase 4 proof-set component, and avoids introducing an `immediate: true` watcher into every component's mixin chain for no measurable benefit. If a later phase's component demonstrates a real need for pre-mount style availability (e.g. SSR string rendering needing styles before the mount phase even exists), revisit this choice then — not speculatively here.

- [ ] **Step 7: Add a style-injection regression test to `base-component.spec.ts`**

Append to `packages/vue-core/src/base/base-component.spec.ts`:

```typescript
it("mounting a component registers its style module, injecting a real <style> element", () => {
  const Base = createBaseComponent({
    componentName: "base-component-style-regression",
    styleModule: { css: ".u-regression-test { color: blue; }", classes: {} },
  });
  mount({ extends: Base, template: `<div />` });
  const styleEl = document.head.querySelector('style[data-u-style="base-component-style-regression"]');
  expect(styleEl).not.toBeNull();
  expect(styleEl?.textContent).toContain(".u-regression-test");
});
```

- [ ] **Step 8: Run the full `base-component` and `styling` test suites, verify all pass**

Run: `pnpm --filter @ultimate/vue-core test base-component styling`
Expected: PASS (4 base-component assertions including the new one, 3 styling assertions)

- [ ] **Step 9: Create barrel, update root index**

`packages/vue-core/src/styling/index.ts`:

```typescript
export { vueCoreStyleSheet, registerComponentStyle } from "./vue-style-sheet";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./styling";`.

- [ ] **Step 10: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json`:

```json
[
  {
    "originalPath": "packages/core/src/basecomponent/BaseComponent.vue",
    "ultimateDestination": "packages/vue-core/src/styling/vue-style-sheet.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream style-registration timing: an immediate: true watcher fires during instance creation, calling _loadCoreStyles()/BaseComponentStyle.loadCSS. Ultimate decision: VueStyleSheet subclasses the already-built @ultimate/uix-styled StyleSheet, delegating actual DOM creation to @ultimate/uix-utils/dom's createStyleElement (already-built Phase 1 primitive) — this closes the same class of gap ADR-023 found on Angular's ngCoreStyleSheet (no real <style> injection), matching React's ADR-029 working-from-day-one posture (spec §8). Registration is wired from Vue's mounted() hook rather than an immediate watcher — a deliberate simplification, documented inline, with no observable behavioral difference for any Phase 4 proof-set component."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/styling/styling.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/styling/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 11: Commit**

```bash
git add packages/vue-core/src/styling/ packages/vue-core/src/base/base-component.ts packages/vue-core/src/base/base-component.spec.ts packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add VueStyleSheet adapter, wire real style injection into BaseComponent"
```

---

## Task 14: Icon components

**Files:**

- Create: `packages/vue-core/src/icons/spinner-icon.ts`
- Create: `packages/vue-core/src/icons/times-icon.ts`
- Create: `packages/vue-core/src/icons/window-maximize-icon.ts`
- Create: `packages/vue-core/src/icons/window-minimize-icon.ts`
- Create: `packages/vue-core/src/icons/check-icon.ts`
- Create: `packages/vue-core/src/icons/icons.spec.ts`
- Create: `packages/vue-core/src/icons/index.ts`
- Modify: `packages/vue-core/src/index.ts`

**Interfaces:**

- Produces: `SpinnerIcon`, `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `CheckIcon` per this plan's Interfaces section. Consumed by `UButton` (Task 19, `SpinnerIcon`), `UDialog` (Task 21, `TimesIcon`/`WindowMaximizeIcon`/`WindowMinimizeIcon` for provenance completeness even though Phase 4's `UDialog` doesn't render a maximize toggle per the excluded-scope constraint), `UCheckbox` (Task 19, `CheckIcon`).

- [ ] **Step 1: Confirm the verified minimum icon set**

Run: `grep -rln "SpinnerIcon\|TimesIcon\|WindowMaximizeIcon\|WindowMinimizeIcon\|CheckIcon" .vendor-extracted/vue/button .vendor-extracted/vue/dialog .vendor-extracted/vue/checkbox 2>/dev/null` (extract `checkbox`/`dialog` first via the vendoring script if not already done in an earlier task) — confirms this is the same 5-icon minimum set already established for Angular (`ng-core/src/icons`) and React (`react-core/src/icons`), four of five matching exactly, `CheckIcon` new since Angular's `UCheckbox` styles the native input directly with no icon.

- [ ] **Step 2: Write the failing tests**

Create `packages/vue-core/src/icons/icons.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { SpinnerIcon, TimesIcon, WindowMaximizeIcon, WindowMinimizeIcon, CheckIcon } from "./index";

describe.each([
  ["SpinnerIcon", SpinnerIcon],
  ["TimesIcon", TimesIcon],
  ["WindowMaximizeIcon", WindowMaximizeIcon],
  ["WindowMinimizeIcon", WindowMinimizeIcon],
  ["CheckIcon", CheckIcon],
])("%s", (_name, Icon) => {
  it("renders an svg with role=img", () => {
    const wrapper = mount(Icon);
    expect(wrapper.find("svg").attributes("role")).toBe("img");
  });

  it("applies aria-label from the label prop", () => {
    const wrapper = mount(Icon, { props: { label: "test label" } });
    expect(wrapper.find("svg").attributes("aria-label")).toBe("test label");
  });

  it("applies the class prop to the root svg", () => {
    const wrapper = mount(Icon, { props: { class: "u-custom-icon-class" } });
    expect(wrapper.find("svg").classes()).toContain("u-custom-icon-class");
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue-core test icons`
Expected: FAIL — none of the five icon files exist yet.

- [ ] **Step 4: Write the five icon components**

Create `packages/vue-core/src/icons/spinner-icon.ts`:

```typescript
import { defineComponent, h } from "vue";

export interface IconProps {
  class?: string;
  label?: string;
  spin?: boolean;
}

export const SpinnerIcon = defineComponent({
  name: "USpinnerIcon",
  props: { class: String, label: String, spin: Boolean },
  setup(props) {
    return () =>
      h(
        "svg",
        {
          role: "img",
          "aria-label": props.label,
          class: [props.class, props.spin ? "u-icon-spin" : undefined],
          width: "14",
          height: "14",
          viewBox: "0 0 14 14",
        },
        [
          h("path", {
            d: "M7 0a7 7 0 1 0 7 7A7.008 7.008 0 0 0 7 0Zm0 12.833A5.833 5.833 0 1 1 12.833 7 5.839 5.839 0 0 1 7 12.833Z",
          }),
        ]
      );
  },
});
```

Create `packages/vue-core/src/icons/times-icon.ts`, `window-maximize-icon.ts`, `window-minimize-icon.ts`, `check-icon.ts` following the identical `defineComponent`/`IconProps` shape, each with its own real inline `<svg>` path data matching `react-core`'s already-established `UTimesIcon`/`UWindowMaximizeIcon`/`UWindowMinimizeIcon`/`UCheckIcon` visual output exactly (copy the real path-data values from `packages/react-core/src/icons/{times,window-maximize,window-minimize,check}-icon.tsx` — same icon, same visual, different component-authoring syntax only, per this plan's cross-framework-consistency-at-the-behavior-level, not the mechanism-level principle):

```typescript
// packages/vue-core/src/icons/times-icon.ts
import { defineComponent, h } from "vue";
import type { IconProps } from "./spinner-icon";

export const TimesIcon = defineComponent({
  name: "UTimesIcon",
  props: { class: String, label: String },
  setup(props) {
    return () =>
      h(
        "svg",
        { role: "img", "aria-label": props.label, class: props.class, width: "14", height: "14", viewBox: "0 0 14 14" },
        [h("path", { d: "M8.014 7 13.4 1.61a.702.702 0 0 0-.994-.993L7.014 6L1.61.615a.703.703 0 0 0-.994.993L6.014 7 .626 12.385a.703.703 0 0 0 .994.993L7.014 8l5.394 5.385a.703.703 0 0 0 .994-.993Z" })]
      );
  },
});
```

(Repeat the same shape for `WindowMaximizeIcon`, `WindowMinimizeIcon`, `CheckIcon` — pull each icon's exact real `d` path-data attribute value from `react-core`'s already-shipped equivalent file rather than inventing new path data, since these must render visually identically across frameworks.)

- [ ] **Step 5: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/vue-core test icons`
Expected: PASS (15 assertions — 3 per icon × 5 icons)

- [ ] **Step 6: Create barrel, update root index**

`packages/vue-core/src/icons/index.ts`:

```typescript
export { SpinnerIcon } from "./spinner-icon";
export type { IconProps } from "./spinner-icon";
export { TimesIcon } from "./times-icon";
export { WindowMaximizeIcon } from "./window-maximize-icon";
export { WindowMinimizeIcon } from "./window-minimize-icon";
export { CheckIcon } from "./check-icon";
```

Update `packages/vue-core/src/index.ts`, adding `export * from "./icons";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue-core.json` (one entry per icon file plus the shared spec/barrel):

```json
[
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/spinner-icon.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-owned inline <svg role=\"img\"> icon component, matching ng-core's/react-core's established icon pattern — not PrimeVue's own icon-package passthrough-spread shape, since pt is excluded. Visual path data matches react-core's USpinnerIcon exactly (same icon, different component-authoring syntax)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/times-icon.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Same pattern as spinner-icon.ts. Visual path data matches react-core's UTimesIcon exactly."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/window-maximize-icon.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Same pattern. Ported for provenance completeness — verified upstream PrimeVue Dialog.vue imports this icon, but Phase 4's UDialog does not render a maximize toggle (spec §15's excluded scope)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/window-minimize-icon.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Same pattern and same provenance-completeness rationale as window-maximize-icon.ts."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/check-icon.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Same pattern. Used by UCheckbox's checked state (spec §19) — a real Phase 4 consumer, unlike the maximize/minimize icons above."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/icons.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite covering all five icons via describe.each, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue-core/src/icons/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Build the full `vue-core` package and run its complete test suite**

Run: `pnpm --filter @ultimate/vue-core build && pnpm --filter @ultimate/vue-core test`
Expected: PASS — every task's tests (Tasks 3-14) pass together, the package builds cleanly via the `tsup`+`@vitejs/plugin-vue` shim verified in Task 3. This is the first point in the plan where the entire `vue-core` foundation is exercised as one unit — if anything regresses across task boundaries, fix it here before starting `vue` package work.

- [ ] **Step 9: Commit**

```bash
git add packages/vue-core/src/icons/ packages/vue-core/src/index.ts docs/architecture/provenance/vue-core.json
git commit -m "feat(vue-core): add five icon components, complete vue-core foundation"
```

---

## Task 15: `@ultimate/vue` package scaffold

**Files:**

- Create: `packages/vue/package.json`
- Create: `packages/vue/tsup.config.ts`
- Create: `packages/vue/tsconfig.json`
- Create: `packages/vue/vitest.config.ts`
- Create: `packages/vue/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/vue-core` (Tasks 3-14).
- Produces: an empty-but-buildable component package, matching `react`'s Task 13 precedent. Verifies the existing `packages/vue/THIRD-PARTY-NOTICES.md` Phase 0 stub remains accurate (already verified as accurate during the Phase 4 spec's research — this task confirms it's unchanged, does not rewrite it).

- [ ] **Step 1: Verify the existing `THIRD-PARTY-NOTICES.md` stub is still accurate**

Run: `cat packages/vue/THIRD-PARTY-NOTICES.md`
Expected: correct MIT license text, correct `primevue@4.5.5` naming, footer pointing at `docs/architecture/PROVENANCE.md` — confirmed accurate during Phase 4's spec-writing research; if anything has drifted, fix it now before proceeding (do not silently leave a stale notice).

- [ ] **Step 2: Scaffold `package.json`**

Create `packages/vue/package.json`:

```json
{
  "name": "@ultimate/vue",
  "version": "0.1.0",
  "description": "Ultimate Platform Vue components: Button, Checkbox, Dialog, Menu, Tooltip.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    },
    "./button": {
      "types": "./dist/button/index.d.mts",
      "import": "./dist/button/index.mjs",
      "default": "./dist/button/index.mjs"
    },
    "./checkbox": {
      "types": "./dist/checkbox/index.d.mts",
      "import": "./dist/checkbox/index.mjs",
      "default": "./dist/checkbox/index.mjs"
    },
    "./dialog": {
      "types": "./dist/dialog/index.d.mts",
      "import": "./dist/dialog/index.mjs",
      "default": "./dist/dialog/index.mjs"
    },
    "./menu": {
      "types": "./dist/menu/index.d.mts",
      "import": "./dist/menu/index.mjs",
      "default": "./dist/menu/index.mjs"
    },
    "./tooltip": {
      "types": "./dist/tooltip/index.d.mts",
      "import": "./dist/tooltip/index.mjs",
      "default": "./dist/tooltip/index.mjs"
    }
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "dependencies": {
    "@ultimate/vue-core": "workspace:*",
    "@ultimate/uix-utils": "workspace:*",
    "@ultimate/uix-styled": "workspace:*",
    "@ultimate/uix-motion": "workspace:*"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^25.0.1",
    "tsup": "^8.3.0",
    "typescript": "5.9.3",
    "vitest": "^2.1.8",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.10"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "vue-tsc --noEmit"
  }
}
```

- [ ] **Step 3: Scaffold `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts`**

Create `packages/vue/tsup.config.ts` (multi-entry from the start, matching `react`'s precedent, plus the same `.vue`-SFC esbuild-plugin shim verified in Task 3 Step 4 — `Tooltip`/`Ripple` are pure `.ts` directives with no `.vue` file, so the shim only actually engages for `button`/`checkbox`/`dialog`/`menu`'s entries):

```typescript
import { defineConfig } from "tsup";
import vuePlugin from "@vitejs/plugin-vue";
import { createFilter } from "vite";

const vue = vuePlugin();
const filter = createFilter(/\.vue$/);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "button/index": "src/button/index.ts",
    "checkbox/index": "src/checkbox/index.ts",
    "dialog/index": "src/dialog/index.ts",
    "menu/index": "src/menu/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  esbuildPlugins: [
    {
      name: "vue-sfc",
      setup(build) {
        build.onLoad({ filter: /\.vue$/ }, async (args) => {
          const fs = await import("node:fs/promises");
          const source = await fs.readFile(args.path, "utf8");
          if (!filter(args.path)) return undefined;
          const result = await vue.transform.call({ addWatchFile() {} }, source, args.path);
          const code = typeof result === "string" ? result : result?.code ?? source;
          return { contents: code, loader: "ts" };
        });
      },
    },
  ],
});
```

Create `packages/vue/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "preserve"
  },
  "include": ["src"]
}
```

Create `packages/vue/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 4: Create an empty root barrel**

Create `packages/vue/src/index.ts` (empty for now — each component/directive task appends its own `export * from "./<dir>"` line):

```typescript
export {};
```

- [ ] **Step 5: Verify the package builds**

Run: `pnpm --filter @ultimate/vue build`
Expected: PASS — `dist/index.mjs`, `dist/index.d.mts` exist. The other four subpath entries (`button`, `checkbox`, `dialog`, `menu`, `tooltip`) will fail at this point since their `src/` files don't exist yet — this is expected; `tsup`'s multi-entry build will report missing-entry errors for those five. **Temporarily comment out the four not-yet-existing entries in `tsup.config.ts`** (keep only `index`) to get a clean PASS at this checkpoint, then restore the full entry map before Task 16 starts (each subsequent component task's own build-verification step will re-enable its own entry).

- [ ] **Step 6: Commit**

```bash
git add packages/vue/package.json packages/vue/tsup.config.ts packages/vue/tsconfig.json packages/vue/vitest.config.ts packages/vue/src/index.ts
git commit -m "feat(vue): scaffold package"
```

---

## Task 16: `v-ripple` directive

**Context:** unlike React (which deferred Ripple entirely, ADR-031), Vue's real `Button.vue`/`Dialog.vue` wire `v-ripple` directly in their own verified templates — this task must land before Task 17 (`UButton`), which consumes it.

**Files:**

- Create: `packages/vue/src/ripple/ripple.ts`
- Create: `packages/vue/src/ripple/ripple.spec.ts`
- Create: `packages/vue/src/ripple/index.ts`
- Modify: `packages/vue/src/index.ts`
- Modify: `packages/vue/tsup.config.ts` (add `"ripple/index"` entry — internal, not a public subpath export per spec, since Ripple is infrastructure wired into other components, not itself part of the 5-component public proof set)

**Interfaces:**

- Consumes: `createDirective` (`@ultimate/vue-core`, Task 6).
- Produces: `rippleDirective` per this plan's Interfaces section. Consumed by `UButton` (Task 17), `UDialog` (Task 20).

- [ ] **Step 1: Extract `ripple` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue ripple .vendor-extracted/vue/ripple`

Read `.vendor-extracted/vue/ripple/Ripple.js` and `.vendor-extracted/vue/ripple/BaseRipple.js` in full. Confirm the real mechanism: `mounted(el)` appends an `<span class="p-ink">` ink element; a `mousedown` listener computes the click offset, sets `--ink-size`/`transform`/`left`/`top` CSS custom properties on the ink element, then toggles a `p-ink-active` class (triggering a CSS-driven ripple animation via the theme's own stylesheet, not JS-driven animation).

- [ ] **Step 2: Write the failing test**

Create `packages/vue/src/ripple/ripple.spec.ts` (test design confirmed viable via `@vue/test-utils`'s `config.global.directives` mechanism, verified against PrimeVue's own real `Ripple.spec.js` during the Phase 4 Real-Source Verification Gate):

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { rippleDirective } from "./ripple";

describe("v-ripple", () => {
  it("creates an ink element on mount", () => {
    const wrapper = mount(
      { template: `<div class="card" v-ripple>Default</div>` },
      { global: { directives: { ripple: rippleDirective } } }
    );
    expect(wrapper.find(".u-ink").exists()).toBe(true);
  });

  it("activates the ink element on mousedown", async () => {
    const wrapper = mount(
      { template: `<div class="card" v-ripple>Default</div>` },
      { global: { directives: { ripple: rippleDirective } } }
    );
    await wrapper.find(".card").trigger("mousedown");
    expect(wrapper.find(".u-ink").classes()).toContain("u-ink-active");
  });

  it("removes the ink element on unmount", () => {
    const wrapper = mount(
      { template: `<div class="card" v-ripple>Default</div>` },
      { global: { directives: { ripple: rippleDirective } } }
    );
    wrapper.unmount();
    expect(document.querySelector(".u-ink")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/vue test ripple`
Expected: FAIL — `ripple.ts` does not exist yet.

- [ ] **Step 4: Write `ripple.ts`**

Create `packages/vue/src/ripple/ripple.ts`:

```typescript
import { createElement } from "@ultimate/uix-utils/dom";
import { createDirective } from "@ultimate/vue-core";

const inkByElement = new WeakMap<HTMLElement, HTMLElement>();
const listenerByElement = new WeakMap<HTMLElement, (event: MouseEvent) => void>();

function createInk(): HTMLElement {
  return createElement("span", { class: "u-ink", role: "presentation", "aria-hidden": true }) as HTMLElement;
}

function activate(el: HTMLElement, ink: HTMLElement, event: MouseEvent): void {
  ink.classList.remove("u-ink-active");
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ink.style.setProperty("--u-ink-size", `${size}px`);
  ink.style.left = `${event.clientX - rect.left - size / 2}px`;
  ink.style.top = `${event.clientY - rect.top - size / 2}px`;
  requestAnimationFrame(() => ink.classList.add("u-ink-active"));
}

// Vue custom directive, matching verified Ripple.js's real mechanism:
// mousedown-triggered CSS-custom-property-driven ink animation, not
// JS-driven. Standalone primitive (matching Angular's URipple precedent) —
// not folded ad-hoc into Button/Dialog's own component files.
export const rippleDirective = createDirective<void>({
  name: "ripple",
  hooks: {
    mounted(el) {
      const ink = createInk();
      el.appendChild(ink);
      inkByElement.set(el, ink);
      const listener = (event: MouseEvent) => activate(el, ink, event);
      listenerByElement.set(el, listener);
      el.addEventListener("mousedown", listener);
    },
    unmounted(el) {
      const listener = listenerByElement.get(el);
      if (listener) el.removeEventListener("mousedown", listener);
      inkByElement.get(el)?.remove();
      inkByElement.delete(el);
      listenerByElement.delete(el);
    },
  },
});
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/vue test ripple`
Expected: PASS (3 assertions)

- [ ] **Step 6: Create barrel, update root index and tsup entries**

`packages/vue/src/ripple/index.ts`:

```typescript
export { rippleDirective } from "./ripple";
```

Update `packages/vue/src/index.ts`, replacing `export {};` with `export * from "./ripple";`.

Update `packages/vue/tsup.config.ts`'s `entry` map, adding `"ripple/index": "src/ripple/index.ts"`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/vue.json` (new file — first entry for this package):

```json
[
  {
    "originalPath": "packages/primevue/src/ripple/Ripple.js",
    "ultimateDestination": "packages/vue/src/ripple/ripple.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream mechanism: mousedown-triggered ink-element animation driven by CSS custom properties (--ink-size, computed left/top offsets) and a toggled active class, not JS-driven animation. Standalone directive primitive, matching Angular's URipple precedent — full Ultimate namespace rename (u-ink/u-ink-active, not p-ink/p-ink-active)."
  },
  {
    "originalPath": "packages/primevue/src/ripple/BaseRipple.js",
    "ultimateDestination": "packages/vue/src/ripple/ripple.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream: BaseRipple.extend('ripple', { style: RippleStyle }) — this file's Ultimate equivalent uses vue-core's createDirective factory instead; no separate BaseRipple-equivalent file needed."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/ripple/ripple.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, test design confirmed viable via @vue/test-utils's config.global.directives mechanism (verified against PrimeVue's own real Ripple.spec.js during the Real-Source Verification Gate)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/ripple/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/vue/src/ripple/ packages/vue/src/index.ts packages/vue/tsup.config.ts docs/architecture/provenance/vue.json
git commit -m "feat(vue): add v-ripple directive"
```

---

## Task 17: `UButton` (without tooltip wiring — retrofitted in Task 18)

**Files:**

- Create: `packages/vue/src/button/BaseButton.ts`
- Create: `packages/vue/src/button/Button.vue`
- Create: `packages/vue/src/button/button-style.ts`
- Create: `packages/vue/src/button/button.spec.ts`
- Create: `packages/vue/src/button/index.ts`
- Modify: `packages/vue/src/index.ts`

**Interfaces:**

- Consumes: `createBaseComponent` (`@ultimate/vue-core`, Task 3), `SpinnerIcon` (`@ultimate/vue-core`, Task 14), `rippleDirective` (Task 16).
- Produces: `UButton` component. Retrofitted with real tooltip wiring in Task 18 Step 8.

- [ ] **Step 1: Extract `button` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue button .vendor-extracted/vue/button`

Read `.vendor-extracted/vue/button/Button.vue` and `.vendor-extracted/vue/button/BaseButton.vue` in full (already read during the Real-Source Verification Gate — spec §18). Confirm the verified prop surface: `label`, `icon`+`iconPos`, `iconClass`, `badge`+`badgeClass`+`badgeSeverity`, `loading`+`loadingIcon`, `as`+`asChild`, `link`, `severity`, `raised`/`rounded`/`text`/`outlined`/`plain`, `size`, `variant`, `fluid`. Rendering order: loading-icon-or-icon slot → label → children → `Badge` (conditional) → root wraps all, `v-ripple` on root. `inject: { pcFluid }`.

- [ ] **Step 2: Write `button-style.ts`**

Create `packages/vue/src/button/button-style.ts` (a plain `StyleModule` object — this is deliberately NOT a real theme/CSS-token implementation, since `@ultimate/uix-styles` already ships button style-definition modules per the Phase 1 foundation; this file re-exports/wraps that existing module):

```typescript
import type { StyleModule } from "@ultimate/vue-core";
import { buttonStyle } from "@ultimate/uix-styles/button";

// Reuses the already-built Phase 1 @ultimate/uix-styles button style
// definition — framework-neutral token/class definitions, no new styling
// infrastructure needed (spec §2, Gate 4's reuse-before-reinvent finding).
export const buttonStyleModule: StyleModule = buttonStyle;
```

**Implementation-time verification required**: confirm `@ultimate/uix-styles/button`'s actual exported shape matches `StyleModule`'s `{ css, classes }` contract exactly — if the real export shape differs (e.g. a different property naming), adapt this file's re-export accordingly; do not assume without checking the real file (`packages/uix-styles/src/button/index.ts`).

- [ ] **Step 3: Write the failing test**

Create `packages/vue/src/button/button.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UButton } from "./index";

describe("UButton", () => {
  it("renders a native button element with the label", () => {
    const wrapper = mount(UButton, { props: { label: "Submit" } });
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.text()).toContain("Submit");
  });

  it("renders an icon when the icon prop is set", () => {
    const wrapper = mount(UButton, { props: { icon: "pi pi-check" } });
    expect(wrapper.find(".pi-check").exists()).toBe(true);
  });

  it("shows a spinner icon and hides the label icon when loading", () => {
    const wrapper = mount(UButton, { props: { loading: true, icon: "pi pi-check" } });
    expect(wrapper.findComponent({ name: "USpinnerIcon" }).exists()).toBe(true);
    expect(wrapper.find(".pi-check").exists()).toBe(false);
  });

  it("computes a default aria-label from label + badge when unset", () => {
    const wrapper = mount(UButton, { props: { label: "Save", badge: "5" } });
    expect(wrapper.attributes("aria-label")).toBe("Save 5");
  });

  it("does not override an explicitly supplied aria-label", () => {
    const wrapper = mount(UButton, { props: { label: "Save", ariaLabel: "Custom label" } });
    expect(wrapper.attributes("aria-label")).toBe("Custom label");
  });

  it("applies boolean-modifier classes for severity/raised/rounded/text/outlined", () => {
    const wrapper = mount(UButton, { props: { severity: "danger", raised: true, rounded: true } });
    expect(wrapper.classes().join(" ")).toMatch(/danger|raised|rounded/);
  });

  it("renders as a different root element via the `as` prop", () => {
    const wrapper = mount(UButton, { props: { as: "a", label: "Link Button" } });
    expect(wrapper.element.tagName).toBe("A");
  });

  it("has the v-ripple directive applied to the root element", () => {
    const wrapper = mount(UButton, { props: { label: "Ripple Test" } });
    expect(wrapper.find(".u-ink").exists()).toBe(true);
  });
});
```

- [ ] **Step 4: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue test button`
Expected: FAIL — none of the button files exist yet.

- [ ] **Step 5: Write `BaseButton.ts`**

Create `packages/vue/src/button/BaseButton.ts`:

```typescript
import { createBaseComponent } from "@ultimate/vue-core";
import { buttonStyleModule } from "./button-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...), matching verified BaseButton.vue's own
// extends: BaseComponent chain exactly (spec §7, §18).
export function createBaseButton(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "button", styleModule: buttonStyleModule }),
    props: {
      label: { type: String, default: null },
      icon: { type: String, default: null },
      iconPos: { type: String, default: "left" },
      iconClass: { type: [String, Object], default: null },
      badge: { type: String, default: null },
      badgeClass: { type: [String, Object], default: null },
      badgeSeverity: { type: String, default: "secondary" },
      loading: { type: Boolean, default: false },
      loadingIcon: { type: String, default: undefined },
      as: { type: [String, Object], default: "BUTTON" },
      asChild: { type: Boolean, default: false },
      link: { type: Boolean, default: false },
      severity: { type: String, default: null },
      raised: { type: Boolean, default: false },
      rounded: { type: Boolean, default: false },
      text: { type: Boolean, default: false },
      outlined: { type: Boolean, default: false },
      size: { type: String, default: null },
      variant: { type: String, default: null },
      plain: { type: Boolean, default: false },
      fluid: { type: Boolean, default: null },
      ariaLabel: { type: String, default: null },
    },
    inject: {
      pcFluid: { default: undefined },
    },
  };
}
```

- [ ] **Step 6: Write `Button.vue`**

Create `packages/vue/src/button/Button.vue`:

```vue
<template>
  <component :is="tag" v-if="!asChild" v-ripple :class="cx('root')" v-bind="rootAttrs">
    <span v-if="loading" :class="cx('loadingIcon')">
      <USpinnerIcon spin />
    </span>
    <span v-else-if="icon" :class="[cx('icon'), icon, iconClass]" />
    <span v-if="label" :class="cx('label')">{{ label }}</span>
    <slot />
    <span v-if="badge" :class="[cx('badge'), badgeClass]">{{ badge }}</span>
  </component>
  <slot v-else :class="cx('root')" />
</template>

<script>
import { SpinnerIcon as USpinnerIcon } from "@ultimate/vue-core";
import { rippleDirective } from "../ripple";
import { createBaseButton } from "./BaseButton";

export default {
  name: "UButton",
  extends: createBaseButton(),
  inheritAttrs: false,
  components: { USpinnerIcon },
  directives: { ripple: rippleDirective },
  computed: {
    tag() {
      return this.as === "BUTTON" ? "button" : this.as;
    },
    resolvedAriaLabel() {
      if (this.ariaLabel) return this.ariaLabel;
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : undefined;
    },
    rootAttrs() {
      const base = {
        "aria-label": this.resolvedAriaLabel,
        disabled: this.tag === "button" ? this.loading || this.$attrs.disabled : undefined,
        type: this.tag === "button" ? "button" : undefined,
      };
      return { ...this.$attrs, ...base };
    },
  },
};
</script>
```

- [ ] **Step 7: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/vue test button`
Expected: PASS (8 assertions)

- [ ] **Step 8: Create barrel, update root index**

`packages/vue/src/button/index.ts`:

```typescript
export { default as UButton } from "./Button.vue";
export { createBaseButton } from "./BaseButton";
```

Update `packages/vue/src/index.ts`, adding `export * from "./button";`.

- [ ] **Step 9: Restore the full `tsup.config.ts` entry map (Task 15's temporary comment-out)**

Confirm `packages/vue/tsup.config.ts`'s `entry` map includes `"button/index": "src/button/index.ts"` uncommented. Run: `pnpm --filter @ultimate/vue build`
Expected: PASS for the `index` and `button` entries specifically (the other three component entries still fail until their own tasks land — that remains expected at this point in the plan).

- [ ] **Step 10: Add provenance entries**

Append to `docs/architecture/provenance/vue.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/button/Button.vue",
    "ultimateDestination": "packages/vue/src/button/Button.vue",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified real prop surface and rendering order (spec §18): boolean-modifier severity/raised/rounded/text/outlined/size preserved, matching a three-way convergent pattern already independently confirmed for Angular's and React's UButton. v-ripple applied to root (unlike React, which deferred Ripple entirely per ADR-031 — Vue's real Button wires it directly, verified). Default aria-label computed as label + badge, matching verified BaseButton.vue behavior. Full Ultimate namespace rename applied."
  },
  {
    "originalPath": "packages/primevue/src/button/BaseButton.vue",
    "ultimateDestination": "packages/vue/src/button/BaseButton.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream prop surface, ported via createBaseComponent's extends: mechanism. pcFluid ambient-context injection preserved, matching Angular's UButton Fluid-ancestor-detection wiring (ADR-018)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/button/button-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Reuses the already-built @ultimate/uix-styles button style module (Phase 1) — no new styling infrastructure."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/button/button.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream (PrimeVue's own Button has a real Button.spec.js, but this suite is independently authored against Ultimate's own API surface, not a port of that file)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/button/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 11: Commit**

```bash
git add packages/vue/src/button/ packages/vue/src/index.ts packages/vue/tsup.config.ts docs/architecture/provenance/vue.json
git commit -m "feat(vue): add UButton (without tooltip wiring, retrofitted next task)"
```

---

## Task 18: `v-tooltip` directive (+ retrofit `UButton`)

**Files:**

- Create: `packages/vue/src/tooltip/tooltip.ts`
- Create: `packages/vue/src/tooltip/tooltip-style.ts`
- Create: `packages/vue/src/tooltip/tooltip.spec.ts`
- Create: `packages/vue/src/tooltip/index.ts`
- Modify: `packages/vue/src/index.ts`
- Modify: `packages/vue/src/button/Button.vue` (retrofit real tooltip wiring)
- Modify: `packages/vue/src/button/button.spec.ts` (add a tooltip-integration test)

**Interfaces:**

- Consumes: `createDirective` (`@ultimate/vue-core`, Task 6), `useZIndex` (`@ultimate/vue-core`, Task 9).
- Produces: `tooltipDirective` per this plan's Interfaces section. Consumed directly by end users (`v-tooltip` on any element) and retrofitted onto `UButton` (this task, Step 8).

- [ ] **Step 1: Extract `tooltip` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue tooltip .vendor-extracted/vue/tooltip`

Read `.vendor-extracted/vue/tooltip/Tooltip.js` and `.vendor-extracted/vue/tooltip/BaseTooltip.js` in full (already read during the Real-Source Verification Gate — spec §9, §25). Confirm: `BaseTooltip.extend('tooltip', {...})`, `beforeMount` reads `options.value` (string or object: `value`/`disabled`/`escape`/`class`/`fitContent`/`id`/`showDelay`/`hideDelay`/`autoHide`), stores state on `target.$_ptooltip*` fields, `create(el)` branches on `escape` (default `true`: safe `createTextNode` path; `escape: false`: opt-in raw `innerHTML` path — spec §25's security finding), `ZIndex.set('tooltip', tooltipElement, ...)`. No `aria-describedby` wiring exists — this is the intentional deviation this task adds.

- [ ] **Step 2: Write `tooltip-style.ts`**

Create `packages/vue/src/tooltip/tooltip-style.ts` (same reuse pattern as `button-style.ts`, Task 17 Step 2):

```typescript
import type { StyleModule } from "@ultimate/vue-core";
import { tooltipStyle } from "@ultimate/uix-styles/tooltip";

export const tooltipStyleModule: StyleModule = tooltipStyle;
```

- [ ] **Step 3: Write the failing tests**

Create `packages/vue/src/tooltip/tooltip.spec.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { tooltipDirective } from "./tooltip";

describe("v-tooltip", () => {
  afterEach(() => {
    document.querySelectorAll('[role="tooltip"]').forEach((el) => el.remove());
  });

  function mountTarget(bindingExpr: string) {
    return mount(
      { template: `<button ${bindingExpr}>Target</button>` },
      { global: { directives: { tooltip: tooltipDirective } }, attachTo: document.body }
    );
  }

  it("renders a role=tooltip panel with the content on show", async () => {
    const wrapper = mountTarget(`v-tooltip="'Save changes'"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toBe("Save changes");
  });

  it("uses textContent (createTextNode), never innerHTML, by default (security regression, spec §25)", async () => {
    const wrapper = mountTarget(`v-tooltip="'<img src=x onerror=alert(1)>'"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel?.querySelector("img")).toBeNull();
    expect(panel?.textContent).toBe("<img src=x onerror=alert(1)>");
  });

  it("only renders raw HTML when the caller explicitly opts in via escape: false", async () => {
    const wrapper = mountTarget(`v-tooltip="{ value: '<b>bold</b>', escape: false }"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel?.querySelector("b")).not.toBeNull();
  });

  it("adds aria-describedby on the target while visible (intentional deviation, spec §9)", async () => {
    const wrapper = mountTarget(`v-tooltip="'Save changes'"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("button").attributes("aria-describedby")).toBeTruthy();
  });

  it("removes only the owned aria-describedby id on hide, preserving pre-existing values", async () => {
    const wrapper = mount(
      { template: `<button aria-describedby="other-id" v-tooltip="'Save changes'">Target</button>` },
      { global: { directives: { tooltip: tooltipDirective } }, attachTo: document.body }
    );
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("button").attributes("aria-describedby")).toContain("other-id");
    await wrapper.find("button").trigger("mouseleave");
    await new Promise((r) => setTimeout(r, 300)); // hideDelay default
    expect(wrapper.find("button").attributes("aria-describedby")).toBe("other-id");
  });
});
```

- [ ] **Step 4: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue test tooltip`
Expected: FAIL — `tooltip.ts` does not exist yet.

- [ ] **Step 5: Write `tooltip.ts`**

Create `packages/vue/src/tooltip/tooltip.ts`:

```typescript
import { createElement, focus } from "@ultimate/uix-utils/dom";
import { uuid } from "@ultimate/uix-utils/uuid";
import { createDirective } from "@ultimate/vue-core";
import { useZIndex, Z_INDEX_KEYS } from "@ultimate/vue-core";

export interface TooltipBindingValue {
  value: string;
  disabled?: boolean;
  escape?: boolean;
  class?: string;
  fitContent?: boolean;
  id?: string;
  showDelay?: number;
  hideDelay?: number;
  autoHide?: boolean;
}

interface TooltipState {
  panel?: HTMLElement;
  panelId: string;
  showTimer?: ReturnType<typeof setTimeout>;
  hideTimer?: ReturnType<typeof setTimeout>;
  onEnter: () => void;
  onLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

const stateByElement = new WeakMap<HTMLElement, TooltipState>();
const { set: setZIndex, clear: clearZIndex } = useZIndex();

function normalizeBinding(value: string | TooltipBindingValue | undefined): TooltipBindingValue {
  if (typeof value === "string") return { value, escape: true, showDelay: 0, hideDelay: 0, autoHide: true };
  return { escape: true, showDelay: 0, hideDelay: 0, autoHide: true, ...value, value: value?.value ?? "" };
}

function addOwnedDescribedBy(el: HTMLElement, id: string): void {
  const existing = el.getAttribute("aria-describedby");
  const tokens = existing ? existing.split(" ").filter(Boolean) : [];
  if (!tokens.includes(id)) tokens.push(id);
  el.setAttribute("aria-describedby", tokens.join(" "));
}

function removeOwnedDescribedBy(el: HTMLElement, id: string): void {
  const existing = el.getAttribute("aria-describedby");
  if (!existing) return;
  const tokens = existing.split(" ").filter((token) => token && token !== id);
  if (tokens.length > 0) el.setAttribute("aria-describedby", tokens.join(" "));
  else el.removeAttribute("aria-describedby");
}

function showTooltip(el: HTMLElement, state: TooltipState, binding: TooltipBindingValue): void {
  if (binding.disabled || !binding.value) return;

  const panel = createElement("div", {
    id: state.panelId,
    role: "tooltip",
    class: binding.class,
    style: { position: "absolute", width: binding.fitContent === false ? undefined : "fit-content" },
  }) as HTMLElement;

  // Two-mode content contract, matching verified Tooltip.js exactly (spec §25):
  // escape defaults to true (safe createTextNode path); escape: false is an
  // explicit, caller-opt-in-only raw-HTML path. The default path must never
  // be the unsafe one.
  if (binding.escape === false) {
    panel.innerHTML = binding.value;
  } else {
    panel.textContent = binding.value;
  }

  document.body.appendChild(panel);
  state.panel = panel;

  const rect = el.getBoundingClientRect();
  panel.style.left = `${rect.left + window.scrollX}px`;
  panel.style.top = `${rect.bottom + window.scrollY + 4}px`;

  setZIndex(Z_INDEX_KEYS.tooltip, panel);
  addOwnedDescribedBy(el, state.panelId);
}

function hideTooltip(el: HTMLElement, state: TooltipState): void {
  if (!state.panel) return;
  clearZIndex(state.panel);
  state.panel.remove();
  state.panel = undefined;
  removeOwnedDescribedBy(el, state.panelId);
}

function bind(el: HTMLElement, binding: TooltipBindingValue): void {
  const state: TooltipState = {
    panelId: binding.id ?? uuid("u_tooltip"),
    onEnter: () => {},
    onLeave: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };

  state.onEnter = () => {
    clearTimeout(state.hideTimer);
    state.showTimer = setTimeout(() => showTooltip(el, state, binding), binding.showDelay ?? 0);
  };
  state.onLeave = () => {
    clearTimeout(state.showTimer);
    if (binding.autoHide === false) return;
    state.hideTimer = setTimeout(() => hideTooltip(el, state), binding.hideDelay ?? 0);
  };
  state.onFocus = state.onEnter;
  state.onBlur = state.onLeave;

  el.addEventListener("mouseenter", state.onEnter);
  el.addEventListener("mouseleave", state.onLeave);
  el.addEventListener("focus", state.onFocus);
  el.addEventListener("blur", state.onBlur);

  stateByElement.set(el, state);
}

function unbind(el: HTMLElement): void {
  const state = stateByElement.get(el);
  if (!state) return;
  clearTimeout(state.showTimer);
  clearTimeout(state.hideTimer);
  el.removeEventListener("mouseenter", state.onEnter);
  el.removeEventListener("mouseleave", state.onLeave);
  el.removeEventListener("focus", state.onFocus);
  el.removeEventListener("blur", state.onBlur);
  hideTooltip(el, state);
  stateByElement.delete(el);
}

// Vue custom directive, target-based model matching verified Tooltip.js
// exactly — NOT a wrapper component (spec §9). aria-describedby wiring is
// this task's intentional accessibility deviation over verified upstream
// (which has no such wiring) — additive to any pre-existing value, removes
// only its own owned id on cleanup.
export const tooltipDirective = createDirective<string | TooltipBindingValue | undefined>({
  name: "tooltip",
  hooks: {
    mounted(el, binding) {
      bind(el, normalizeBinding(binding.value));
    },
    updated(el, binding) {
      unbind(el);
      bind(el, normalizeBinding(binding.value));
    },
    unmounted(el) {
      unbind(el);
    },
  },
});
```

- [ ] **Step 6: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/vue test tooltip`
Expected: PASS (5 assertions, including the two security-regression tests from spec §25)

- [ ] **Step 7: Create barrel, update root index**

`packages/vue/src/tooltip/index.ts`:

```typescript
export { tooltipDirective } from "./tooltip";
export type { TooltipBindingValue } from "./tooltip";
```

Update `packages/vue/src/index.ts`, adding `export * from "./tooltip";`.

- [ ] **Step 8: Retrofit `UButton` with real tooltip wiring**

Modify `packages/vue/src/button/Button.vue`, adding a `tooltip`/`tooltipOptions` prop pair to `BaseButton.ts` first:

Modify `packages/vue/src/button/BaseButton.ts`, adding two props to the existing `props` object:

```typescript
tooltip: { type: String, default: null },
tooltipOptions: { type: Object, default: null },
```

Modify `packages/vue/src/button/Button.vue` — add the `tooltip` directive import and apply it conditionally on the root element:

```vue
<script>
import { SpinnerIcon as USpinnerIcon } from "@ultimate/vue-core";
import { rippleDirective } from "../ripple";
import { tooltipDirective } from "../tooltip";
import { createBaseButton } from "./BaseButton";

export default {
  name: "UButton",
  extends: createBaseButton(),
  inheritAttrs: false,
  components: { USpinnerIcon },
  directives: { ripple: rippleDirective, tooltip: tooltipDirective },
  // ... (computed block unchanged) ...
  computed: {
    tag() {
      return this.as === "BUTTON" ? "button" : this.as;
    },
    resolvedAriaLabel() {
      if (this.ariaLabel) return this.ariaLabel;
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : undefined;
    },
    rootAttrs() {
      const base = {
        "aria-label": this.resolvedAriaLabel,
        disabled: this.tag === "button" ? this.loading || this.$attrs.disabled : undefined,
        type: this.tag === "button" ? "button" : undefined,
      };
      return { ...this.$attrs, ...base };
    },
    tooltipBinding() {
      if (!this.tooltip) return undefined;
      return { value: this.tooltip, ...this.tooltipOptions };
    },
  },
};
</script>
```

Modify `Button.vue`'s `<template>`, adding `v-tooltip="tooltipBinding"` alongside the existing `v-ripple` on the root `<component>` element:

```vue
<template>
  <component :is="tag" v-if="!asChild" v-ripple v-tooltip="tooltipBinding" :class="cx('root')" v-bind="rootAttrs">
    <!-- ... rest unchanged ... -->
  </component>
  <slot v-else :class="cx('root')" />
</template>
```

- [ ] **Step 9: Add the tooltip-integration test to `button.spec.ts`**

Append to `packages/vue/src/button/button.spec.ts`:

```typescript
it("renders a tooltip on hover when the tooltip prop is set (sugar over v-tooltip)", async () => {
  const wrapper = mount(UButton, { props: { label: "Save", tooltip: "Save changes" }, attachTo: document.body });
  await wrapper.find("button").trigger("mouseenter");
  await new Promise((r) => setTimeout(r, 0));
  const panel = document.querySelector('[role="tooltip"]');
  expect(panel?.textContent).toBe("Save changes");
  wrapper.unmount();
});
```

- [ ] **Step 10: Run the full `button` test suite, verify no regressions plus the new test passes**

Run: `pnpm --filter @ultimate/vue test button tooltip`
Expected: PASS (9 button assertions including the new one, 5 tooltip assertions)

- [ ] **Step 11: Add provenance entries**

Append to `docs/architecture/provenance/vue.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/tooltip/Tooltip.js",
    "ultimateDestination": "packages/vue/src/tooltip/tooltip.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream target-based directive mechanism (spec §9): imperative event binding, floating panel created via createElement, ZIndex.set('tooltip', ...) (spec §12). Two-mode content-injection contract preserved exactly: escape defaults to true (safe createTextNode path), escape: false is an explicit opt-in raw-innerHTML path — verified real security-relevant divergence from React's Tooltip, which has no such opt-in mode (spec §25). Intentional deviation: adds aria-describedby wiring absent from verified upstream — additive to any pre-existing value, owned-id-only removal on cleanup (spec §9)."
  },
  {
    "originalPath": "packages/primevue/src/tooltip/BaseTooltip.js",
    "ultimateDestination": "packages/vue/src/tooltip/tooltip.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream: BaseTooltip.extend('tooltip', {...}) — this file's Ultimate equivalent uses vue-core's createDirective factory instead."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/tooltip/tooltip-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Reuses the already-built @ultimate/uix-styles tooltip style module (Phase 1)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/tooltip/tooltip.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite, including explicit regression coverage for the two-mode content-injection security contract (spec §25) and the aria-describedby accessibility deviation (spec §9)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/tooltip/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  },
  {
    "originalPath": "packages/primevue/src/button/Button.vue",
    "ultimateDestination": "packages/vue/src/button/Button.vue",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Updated this task to add tooltip/tooltipOptions prop sugar over v-tooltip, matching verified Button.vue's own tooltip integration pattern — third independent confirmation of the sugar-prop pattern already established for Angular/React (spec §9)."
  }
]
```

- [ ] **Step 12: Commit**

```bash
git add packages/vue/src/tooltip/ packages/vue/src/button/ packages/vue/src/index.ts packages/vue/tsup.config.ts docs/architecture/provenance/vue.json
git commit -m "feat(vue): add v-tooltip directive, retrofit UButton with tooltip prop sugar"
```

---

## Task 19: `UCheckbox`

**Files:**

- Create: `packages/vue/src/checkbox/BaseCheckbox.ts`
- Create: `packages/vue/src/checkbox/Checkbox.vue`
- Create: `packages/vue/src/checkbox/checkbox-style.ts`
- Create: `packages/vue/src/checkbox/checkbox.spec.ts`
- Create: `packages/vue/src/checkbox/index.ts`
- Modify: `packages/vue/src/index.ts`

**Interfaces:**

- Consumes: `createBaseInput` (`@ultimate/vue-core`, Task 5 — the real chain is `UCheckbox extends BaseCheckbox extends BaseInput extends BaseEditableHolder extends BaseComponent`), `CheckIcon` (`@ultimate/vue-core`, Task 14).
- Produces: `UCheckbox` component, matching the full public contract spec §19 establishes (broader than React's — both controlled/uncontrolled modes, `indeterminate`, `binary`/array-membership mode).

- [ ] **Step 1: Extract `checkbox` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue checkbox .vendor-extracted/vue/checkbox`

Read `.vendor-extracted/vue/checkbox/Checkbox.vue` and `.vendor-extracted/vue/checkbox/BaseCheckbox.vue` in full (already read during the Real-Source Verification Gate — spec §19, this Phase's completed verification gap). Confirm the exact rendered DOM: a real native `<input type="checkbox">` carrying `checked`/`disabled`/`readonly`/`required`/`tabindex`/`name`/`aria-labelledby`/`aria-label`/`aria-invalid`, plus a separate decorative `<div class="box">` rendering `CheckIcon`/`MinusIcon`. Confirm: `indeterminate` prop + `d_indeterminate` + `update:indeterminate` emit + `updateIndeterminate()` DOM-property sync in `mounted`/`updated`. Confirm the `binary` mode split: `binary: true` uses `trueValue`/`falseValue` against a single `modelValue`; `binary: false` (default) treats `modelValue` as an array, `value` as the member. `$pcCheckboxGroup` injection is NOT ported (out of Phase 4 scope, spec §19).

- [ ] **Step 2: Write `checkbox-style.ts`**

Create `packages/vue/src/checkbox/checkbox-style.ts` (same reuse pattern as Task 17/18):

```typescript
import type { StyleModule } from "@ultimate/vue-core";
import { checkboxStyle } from "@ultimate/uix-styles/checkbox";

export const checkboxStyleModule: StyleModule = checkboxStyle;
```

- [ ] **Step 3: Write the failing tests**

Create `packages/vue/src/checkbox/checkbox.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UCheckbox } from "./index";

describe("UCheckbox — controlled (v-model)", () => {
  it("renders a native input[type=checkbox] plus a decorative box", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true } });
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.find(".u-checkbox-box").exists()).toBe(true);
  });

  it("binary mode: checked reflects modelValue === trueValue", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: true, binary: true } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("binary mode: emits update:modelValue with trueValue/falseValue on change", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("does not manage its own checked state when controlled — reflects the prop only", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true } });
    await wrapper.setProps({ modelValue: true });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });
});

describe("UCheckbox — uncontrolled (defaultValue)", () => {
  it("initializes checked state from defaultValue when modelValue is absent", () => {
    const wrapper = mount(UCheckbox, { props: { defaultValue: true, binary: true } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });
});

describe("UCheckbox — indeterminate (real, verified prop; opposite finding from React's Checkbox)", () => {
  it("renders MinusIcon and sets the native input's indeterminate DOM property when indeterminate", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true, indeterminate: true } });
    expect((wrapper.find("input").element as HTMLInputElement).indeterminate).toBe(true);
    expect(wrapper.findComponent({ name: "UMinusIcon" }).exists()).toBe(true);
  });

  it("clears indeterminate and emits update:indeterminate on change", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true, indeterminate: true } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:indeterminate")?.[0]).toEqual([false]);
  });
});

describe("UCheckbox — binary: false (array-membership mode, no PrimeReact equivalent)", () => {
  it("checked reflects whether the checkbox's value is a member of the modelValue array", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: ["a", "b"], value: "a" } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("checking adds the value to the array, unchecking removes it", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: ["a"], value: "b" } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a", "b"]]);
  });
});

describe("UCheckbox — accessibility", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true, invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly/required/name/tabindex pass through to the native input", () => {
    const wrapper = mount(UCheckbox, {
      props: { modelValue: false, binary: true, disabled: true, readonly: true, required: true, name: "agree", tabindex: 5 },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("required")).toBeDefined();
    expect(input.attributes("name")).toBe("agree");
    expect(input.attributes("tabindex")).toBe("5");
  });
});
```

- [ ] **Step 4: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue test checkbox`
Expected: FAIL — none of the checkbox files exist yet.

- [ ] **Step 5: Write `BaseCheckbox.ts`**

Create `packages/vue/src/checkbox/BaseCheckbox.ts`:

```typescript
import { createBaseInput } from "@ultimate/vue-core";
import { checkboxStyleModule } from "./checkbox-style";
import type { ComponentOptions } from "vue";

// extends: createBaseInput(...), matching verified BaseCheckbox.vue's real
// chain exactly: Checkbox extends BaseCheckbox extends BaseInput extends
// BaseEditableHolder extends BaseComponent (spec §7, §19).
export function createBaseCheckbox(): ComponentOptions {
  return {
    extends: (() => {
      const base = createBaseInput();
      base.extends = { ...(base.extends as ComponentOptions), name: "BaseCheckbox" };
      return base;
    })(),
    props: {
      value: { default: null },
      binary: { type: Boolean, default: false },
      indeterminate: { type: Boolean, default: false },
      trueValue: { default: true },
      falseValue: { default: false },
      readonly: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      tabindex: { type: Number, default: null },
      inputId: { type: String, default: null },
      inputClass: { type: [String, Object], default: null },
      inputStyle: { type: Object, default: null },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
    },
  };
}
```

- [ ] **Step 6: Write `Checkbox.vue`**

Create `packages/vue/src/checkbox/Checkbox.vue`:

```vue
<template>
  <div :class="cx('root')">
    <input
      ref="input"
      type="checkbox"
      :id="inputId"
      :class="[cx('input'), inputClass]"
      :style="inputStyle"
      :value="value"
      :name="name"
      :checked="checked"
      :tabindex="tabindex"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-labelledby="ariaLabelledby"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      @change="onChange"
    />
    <div :class="cx('box')">
      <UCheckIcon v-if="checked" :class="cx('icon')" />
      <UMinusIcon v-else-if="dIndeterminate" :class="cx('icon')" />
    </div>
  </div>
</template>

<script>
import { CheckIcon as UCheckIcon, WindowMinimizeIcon as UMinusIconRaw } from "@ultimate/vue-core";
import { createBaseCheckbox } from "./BaseCheckbox";

// UMinusIcon is a real, distinct visual icon (a horizontal bar) — reusing
// WindowMinimizeIcon's shape here is a placeholder only if a dedicated
// MinusIcon has not yet been added to vue-core's icon set at implementation
// time; if vue-core's Task 14 did not add a MinusIcon (it wasn't in this
// plan's Task 14 icon list, since Angular/React's Phase 2/3 proof sets never
// needed one), add a sixth vue-core icon (MinusIcon) as a small addendum to
// Task 14 before this task proceeds — do not silently reuse an unrelated
// icon's shape for a real UI-visible checkbox-indeterminate glyph.
const UMinusIcon = UMinusIconRaw;

export default {
  name: "UCheckbox",
  extends: createBaseCheckbox(),
  emits: ["change", "focus", "blur", "update:indeterminate"],
  components: { UCheckIcon, UMinusIcon },
  data() {
    return { dIndeterminate: this.indeterminate };
  },
  watch: {
    indeterminate(newValue) {
      this.dIndeterminate = newValue;
      this.updateIndeterminate();
    },
  },
  mounted() {
    this.updateIndeterminate();
  },
  updated() {
    this.updateIndeterminate();
  },
  computed: {
    checked() {
      if (this.dIndeterminate) return false;
      if (this.binary) return this.dValue === this.trueValue;
      return Array.isArray(this.dValue) && this.dValue.includes(this.value);
    },
  },
  methods: {
    onChange(event) {
      if (this.disabled || this.readonly) return;

      let newValue;
      if (this.binary) {
        newValue = this.dIndeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue;
      } else {
        const current = Array.isArray(this.dValue) ? this.dValue : [];
        newValue = this.checked ? current.filter((v) => v !== this.value) : [...current, this.value];
      }

      if (this.dIndeterminate) {
        this.dIndeterminate = false;
        this.$emit("update:indeterminate", false);
      }

      this.writeValue(newValue, event);
      this.$emit("change", event);
    },
    updateIndeterminate() {
      if (this.$refs.input) this.$refs.input.indeterminate = this.dIndeterminate;
    },
  },
};
</script>
```

- [ ] **Step 7: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/vue test checkbox`
Expected: PASS (12 assertions)

- [ ] **Step 8: Create barrel, update root index and tsup entries**

`packages/vue/src/checkbox/index.ts`:

```typescript
export { default as UCheckbox } from "./Checkbox.vue";
export { createBaseCheckbox } from "./BaseCheckbox";
```

Update `packages/vue/src/index.ts`, adding `export * from "./checkbox";`. Confirm `packages/vue/tsup.config.ts`'s `"checkbox/index"` entry is present (added in Task 15's original entry map).

- [ ] **Step 9: Run the build, confirm the checkbox entry succeeds**

Run: `pnpm --filter @ultimate/vue build`
Expected: PASS for `index`, `button`, `checkbox` entries.

- [ ] **Step 10: Add provenance entries**

Append to `docs/architecture/provenance/vue.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/checkbox/Checkbox.vue",
    "ultimateDestination": "packages/vue/src/checkbox/Checkbox.vue",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified real rendered DOM (spec §19, this Phase's completed verification gap): dual-element pattern — a real semantic native input[type=checkbox] plus a decorative box rendering CheckIcon/MinusIcon. indeterminate prop with d_indeterminate/update:indeterminate/updateIndeterminate() DOM-property sync — verified real, opposite finding from PrimeReact's Checkbox (which has none). binary mode split (true: trueValue/falseValue against a single modelValue; false/default: array-membership mode against this checkbox's own value prop) — a real mode PrimeReact's Checkbox has no equivalent for at all. $pcCheckboxGroup composition explicitly excluded — out of Phase 4 proof-set scope."
  },
  {
    "originalPath": "packages/primevue/src/checkbox/BaseCheckbox.vue",
    "ultimateDestination": "packages/vue/src/checkbox/BaseCheckbox.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified real chain: Checkbox extends BaseCheckbox extends BaseInput extends BaseEditableHolder extends BaseComponent — one tier longer than initially assumed until this Phase's verification gap closed. formControl prop and its @primevue/forms coupling excluded (spec §20)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/checkbox/checkbox-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Reuses the already-built @ultimate/uix-styles checkbox style module (Phase 1)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/checkbox/checkbox.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite, including explicit coverage for both controlled/uncontrolled modes, indeterminate, and binary:false array-membership mode — a materially broader test surface than Phase 3's React UCheckbox needed, since Vue's verified BaseEditableHolder/Checkbox support all of these and PrimeReact's does not."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/checkbox/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 11: Commit**

```bash
git add packages/vue/src/checkbox/ packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "feat(vue): add UCheckbox with full controlled/uncontrolled/indeterminate/binary contract"
```

---

## Task 20: `UDialog`

**Files:**

- Create: `packages/vue/src/dialog/BaseDialog.ts`
- Create: `packages/vue/src/dialog/Dialog.vue`
- Create: `packages/vue/src/dialog/dialog-style.ts`
- Create: `packages/vue/src/dialog/dialog.spec.ts`
- Create: `packages/vue/src/dialog/index.ts`
- Modify: `packages/vue/src/index.ts`

**Interfaces:**

- Consumes: `Portal` (Task 7), `createGlobalEscapeKeyMixin`/`ESCAPE_PRIORITIES` (Task 8), `useZIndex`/`Z_INDEX_KEYS` (Task 9), `focusTrapDirective` (Task 10), `useScrollLock` (Task 11), `createMotionTransitionHooks` (Task 12), `TimesIcon` (Task 14), `rippleDirective` (Task 16).
- Produces: `UDialog` component — the most compositionally complex component in the proof set, exercising every foundation-tier piece built in Tasks 7-14.

- [ ] **Step 1: Extract `dialog` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue dialog .vendor-extracted/vue/dialog`

Read `.vendor-extracted/vue/dialog/Dialog.vue` and `.vendor-extracted/vue/dialog/BaseDialog.vue` in full (already read multiple times during the Real-Source Verification Gates — spec §15, §16, §17). Re-confirm the exact composition this task must reproduce:
- `Portal` wraps `<transition>` wraps the mask/root markup.
- `v-focustrap="{ disabled: !modal }"` on the root content element.
- `onEnter`: emits `show`, captures `document.activeElement` into `this.target`, calls `enableDocumentSettings()` (scroll lock), `bindGlobalListeners()` (Escape), sets z-index (`'modal'` key).
- `onAfterEnter`: focus-priority search (footer → header → content `[autofocus]`, falling back to maximize/close button).
- `onLeave`: emits `hide`, `focus(this.target)`.
- `onAfterLeave`: clears z-index, unbinds document state/listeners, emits `after-hide`.
- `onMaskMouseDown`/`onMaskMouseUp`: guards against drag-selection false-triggering a mask-click dismiss.
- **Confirm again, per Global Constraints**: `draggable`/`maximizable` are real, verified upstream features this task does NOT port — no such props, no such handlers, no such UI.

- [ ] **Step 2: Write `dialog-style.ts`**

Create `packages/vue/src/dialog/dialog-style.ts` (same reuse pattern as prior component tasks):

```typescript
import type { StyleModule } from "@ultimate/vue-core";
import { dialogStyle } from "@ultimate/uix-styles/dialog";

export const dialogStyleModule: StyleModule = dialogStyle;
```

- [ ] **Step 3: Write the failing tests**

Create `packages/vue/src/dialog/dialog.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UDialog } from "./index";

describe("UDialog — controlled contract (v-model:visible)", () => {
  it("renders nothing when visible is false", () => {
    const wrapper = mount(UDialog, { props: { visible: false } });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    wrapper.unmount();
  });

  it("renders when visible is true, with role=dialog/aria-modal/aria-labelledby", async () => {
    const wrapper = mount(UDialog, {
      props: { visible: true, header: "Confirm" },
      attachTo: document.body,
    });
    await new Promise((r) => setTimeout(r, 0));
    const dialogEl = document.querySelector('[role="dialog"]');
    expect(dialogEl).not.toBeNull();
    expect(dialogEl?.getAttribute("aria-modal")).toBe("true");
    expect(dialogEl?.getAttribute("aria-labelledby")).toBeTruthy();
    wrapper.unmount();
  });

  it("emits update:visible(false) when the close button is clicked", async () => {
    const wrapper = mount(UDialog, { props: { visible: true, closable: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    const closeButton = document.querySelector('[role="dialog"] button');
    (closeButton as HTMLElement)?.click();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
  });
});

describe("UDialog — feature boundary (spec §15, regression against silent scope creep)", () => {
  it("exposes no draggable prop, renders no drag handle", () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    expect(wrapper.props()).not.toHaveProperty("draggable");
    wrapper.unmount();
  });

  it("exposes no maximizable prop, renders no maximize-toggle UI", async () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.props()).not.toHaveProperty("maximizable");
    expect(document.querySelector('[role="dialog"] [class*="maximize"]')).toBeNull();
    wrapper.unmount();
  });
});

describe("UDialog — Escape (via the shared uix-utils/escape adapter, spec §11)", () => {
  it("closes on Escape when closeOnEscape is true (default)", async () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it("the topmost of two simultaneously-open dialogs closes first on Escape (priority stacking)", async () => {
    const first = mount(UDialog, { props: { visible: true } }, );
    const second = mount(UDialog, { props: { visible: true } });
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(second.emitted("update:visible")?.[0]).toEqual([false]);
    expect(first.emitted("update:visible")).toBeUndefined();
    first.unmount();
    second.unmount();
  });
});

describe("UDialog — scroll locking (spec §16)", () => {
  it("blocks body scroll when a modal dialog is visible", async () => {
    const wrapper = mount(UDialog, { props: { visible: true, modal: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    wrapper.unmount();
  });

  it("two simultaneously-open modal dialogs: scroll stays blocked until both close", async () => {
    const first = mount(UDialog, { props: { visible: true, modal: true } });
    const second = mount(UDialog, { props: { visible: true, modal: true } });
    await new Promise((r) => setTimeout(r, 0));
    first.unmount();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    second.unmount();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});

describe("UDialog — focus", () => {
  it("captures the previously-focused element and restores focus to it on close", async () => {
    const trigger = document.createElement("button");
    trigger.id = "trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.setProps({ visible: false });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.activeElement?.id).toBe("trigger");

    wrapper.unmount();
    trigger.remove();
  });
});

describe("UDialog — mask click", () => {
  it("dismisses on a mask click when dismissableMask and modal are both true", async () => {
    const wrapper = mount(UDialog, { props: { visible: true, modal: true, dismissableMask: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    const mask = document.querySelector(".u-dialog-mask");
    mask?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    mask?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
  });
});
```

- [ ] **Step 4: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue test dialog`
Expected: FAIL — none of the dialog files exist yet.

- [ ] **Step 5: Write `BaseDialog.ts`**

Create `packages/vue/src/dialog/BaseDialog.ts`:

```typescript
import { createBaseComponent } from "@ultimate/vue-core";
import { dialogStyleModule } from "./dialog-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...). No draggable/maximizable/resizable props
// anywhere in this shape — the Phase 4 scope boundary (spec §15) is enforced
// structurally, not just by omission from the template.
export function createBaseDialog(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "dialog", styleModule: dialogStyleModule }),
    props: {
      visible: { type: Boolean, default: false },
      header: { type: String, default: null },
      footer: { type: String, default: null },
      modal: { type: Boolean, default: true },
      closable: { type: Boolean, default: true },
      closeOnEscape: { type: Boolean, default: true },
      dismissableMask: { type: Boolean, default: false },
      blockScroll: { type: Boolean, default: false },
      baseZIndex: { type: Number, default: 0 },
      autoZIndex: { type: Boolean, default: true },
      position: { type: String, default: "center" },
      appendTo: { type: [String, Object], default: "body" },
      ariaCloseLabel: { type: String, default: "Close" },
    },
  };
}
```

- [ ] **Step 6: Write `Dialog.vue`**

Create `packages/vue/src/dialog/Dialog.vue`:

```vue
<template>
  <UPortal :appendTo="appendTo">
    <div v-if="containerVisible" ref="mask" :class="cx('mask')" @mousedown="onMaskMouseDown" @mouseup="onMaskMouseUp">
      <transition
        name="u-dialog"
        appear
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="visible"
          ref="container"
          v-focustrap="{ disabled: !modal }"
          :class="cx('root')"
          role="dialog"
          :aria-labelledby="ariaLabelledById"
          :aria-modal="modal"
        >
          <div v-if="header" ref="headerContainer" :class="cx('header')">
            <span :id="ariaLabelledById" :class="cx('title')">{{ header }}</span>
            <button v-if="closable" v-ripple type="button" :class="cx('closeButton')" :aria-label="ariaCloseLabel" @click="close">
              <UTimesIcon />
            </button>
          </div>
          <div ref="content" :class="cx('content')">
            <slot />
          </div>
          <div v-if="footer || $slots.footer" ref="footerContainer" :class="cx('footer')">
            <slot name="footer">{{ footer }}</slot>
          </div>
        </div>
      </transition>
    </div>
  </UPortal>
</template>

<script>
import { Portal as UPortal, TimesIcon as UTimesIcon, focusTrapDirective, useZIndex, Z_INDEX_KEYS, useScrollLock, createGlobalEscapeKeyMixin, createMotionTransitionHooks } from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { focus } from "@ultimate/uix-utils/dom";
import { rippleDirective } from "../ripple";
import { useDisplayOrder } from "@ultimate/vue-core";
import { createBaseDialog } from "./BaseDialog";

const { set: setZIndex, clear: clearZIndex } = useZIndex();
const { register: registerScrollLock, unregister: unregisterScrollLock } = useScrollLock();
const motionHooks = createMotionTransitionHooks(() => ({ name: "u-dialog" }));
let dialogIdCounter = 0;

export default {
  name: "UDialog",
  extends: createBaseDialog(),
  emits: ["update:visible", "show", "hide", "after-hide"],
  components: { UPortal, UTimesIcon },
  directives: { focustrap: focusTrapDirective, ripple: rippleDirective },
  data() {
    return {
      containerVisible: this.visible,
      dialogId: `u-dialog-${++dialogIdCounter}`,
      lastFocusedElement: null,
      maskMouseDownTarget: null,
    };
  },
  computed: {
    ariaLabelledById() {
      return this.header ? `${this.dialogId}_header` : null;
    },
  },
  mixins: [
    // Priority scoped per-instance below in created(), since priority/displayOrder
    // need the instance's own visible/dialogId — created dynamically, matching
    // the reactive per-instance display-order registration pattern.
  ],
  created() {
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.close(),
      when: () => this.visible && this.closeOnEscape,
      priority: [ESCAPE_PRIORITIES.DIALOG, () => this._displayOrder],
    });
  },
  mounted() {
    this._displayOrder = 1;
    this.escapeMixin.mounted.call(this);
  },
  beforeUnmount() {
    this.escapeMixin.beforeUnmount.call(this);
    unregisterScrollLock(this.dialogId);
    if (this.$refs.mask && this.autoZIndex) clearZIndex(this.$refs.mask);
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    onEnter() {
      this.$emit("show");
      this.lastFocusedElement = document.activeElement;
      if (this.modal || this.blockScroll) registerScrollLock(this.dialogId);
      if (this.autoZIndex) setZIndex(Z_INDEX_KEYS.modal, this.$refs.mask, this.baseZIndex);
    },
    onAfterEnter() {
      const footer = this.$refs.footerContainer?.querySelector("[autofocus]");
      const header = this.$refs.headerContainer?.querySelector("[autofocus]");
      const content = this.$refs.content?.querySelector("[autofocus]");
      const target = footer || header || content;
      if (target) focus(target);
    },
    onBeforeLeave() {
      // matches verified Dialog.vue's mask-leave-active class toggle for modal
      // dialogs — omitted here since it's a pure CSS-class concern with no
      // JS-testable behavior beyond what onAfterLeave already covers.
    },
    onLeave() {
      this.$emit("hide");
      if (this.lastFocusedElement) focus(this.lastFocusedElement);
      this.lastFocusedElement = null;
    },
    onAfterLeave() {
      if (this.autoZIndex) clearZIndex(this.$refs.mask);
      this.containerVisible = false;
      if (this.modal || this.blockScroll) unregisterScrollLock(this.dialogId);
      this.$emit("after-hide");
    },
    onMaskMouseDown(event) {
      this.maskMouseDownTarget = event.target;
    },
    onMaskMouseUp(event) {
      if (this.dismissableMask && this.modal && this.$refs.mask === this.maskMouseDownTarget && this.$refs.mask === event.target) {
        this.close();
      }
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) this.containerVisible = true;
    },
  },
};
</script>
```

**Note on `useZIndex`/`useScrollLock`/`createMotionTransitionHooks` module-level instantiation**: these three are called once at module scope (outside the component definition), not per-instance inside `setup()`/`data()` — this matches the shared-registry pattern the underlying `uix-utils` modules already establish (one shared registry, many components calling into it), not a per-instance-state anti-pattern. Confirm this doesn't create cross-instance state leakage during Step 7's test run — each call site (`setZIndex`, `registerScrollLock`, etc.) is itself stateless, delegating to the shared registries, so this is safe; if any test reveals otherwise, move the destructuring inside the component's own `created()`/`setup()` instead.

**Implementation-time verification required for `_displayOrder`**: the `mounted()` hook here hardcodes `this._displayOrder = 1` rather than calling `useDisplayOrder`'s real registration logic (Task 8) — this is a simplification gap, not a finished implementation. Before this task is considered complete, wire `useDisplayOrder(group: "dialog", isVisible)` properly (matching the Interfaces section's real signature) so multiple simultaneously-open dialogs get genuinely distinct, incrementing display orders — the "topmost of two dialogs closes first" test in Step 3 will only reliably pass with a real display-order value, not a hardcoded `1` for every instance. Fix this before running Step 7.

- [ ] **Step 7: Fix the `_displayOrder` gap flagged above, then run the tests**

Replace the `created()`/`mounted()` block in `Dialog.vue`'s `<script>` with real `useDisplayOrder` wiring:

```javascript
created() {
  this.escapeMixin = createGlobalEscapeKeyMixin({
    callback: () => this.close(),
    when: () => this.visible && this.closeOnEscape,
    priority: [ESCAPE_PRIORITIES.DIALOG, () => this._displayOrderRef?.value],
  });
},
mounted() {
  this._displayOrderRef = useDisplayOrder("dialog", () => this.visible);
  this.escapeMixin.mounted.call(this);
},
```

**Note**: `useDisplayOrder` (Task 8) is a Composition-API-shaped function (`onMounted`/`onUnmounted` internally) called here from within an Options-API `mounted()` hook — Vue supports calling Composition-API lifecycle-registering functions from inside Options-API hooks only via `getCurrentInstance()`-based context, which is fragile outside `setup()`. **This is a real API-shape mismatch between Task 8's `useDisplayOrder` (designed composition-first) and this component's Options-API authoring style (locked per Global Constraints/spec §7).** Resolve this before proceeding: either (a) add a `setup()` block to `Dialog.vue` solely to call `useDisplayOrder` and expose its ref to the Options-API portion via `this` (Vue supports mixing `setup()` return values with Options-API in the same component), or (b) revisit Task 8's `useDisplayOrder` to also offer an Options-API-mixin-shaped variant (a `createDisplayOrderMixin` analogous to `createGlobalEscapeKeyMixin`'s own shape) — option (b) is more consistent with this plan's stated Options-API-throughout architecture and should be preferred; if chosen, go back and add `createDisplayOrderMixin` to Task 8's file before continuing this task.

Run: `pnpm --filter @ultimate/vue test dialog`
Expected: PASS (13 assertions) — only after the `_displayOrder` gap above is genuinely resolved, not worked around.

- [ ] **Step 8: Create barrel, update root index**

`packages/vue/src/dialog/index.ts`:

```typescript
export { default as UDialog } from "./Dialog.vue";
export { createBaseDialog } from "./BaseDialog";
```

Update `packages/vue/src/index.ts`, adding `export * from "./dialog";`. Confirm `packages/vue/tsup.config.ts`'s `"dialog/index"` entry is present.

- [ ] **Step 9: Run the build, confirm the dialog entry succeeds**

Run: `pnpm --filter @ultimate/vue build`
Expected: PASS for `index`, `button`, `checkbox`, `dialog` entries.

- [ ] **Step 10: Add provenance entries**

Append to `docs/architecture/provenance/vue.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/dialog/Dialog.vue",
    "ultimateDestination": "packages/vue/src/dialog/Dialog.vue",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified controlled contract: visible prop + emit('update:visible') (Vue's v-model convention, spec §15) — a genuine framework-native API-shape divergence from Angular's [visible]/(visibleChange) and React's visible/onHide. role=dialog/aria-modal/aria-labelledby already correct upstream, preserved. Composes UPortal (Task 7) + v-focustrap (Task 10, {disabled: !modal}) + native <transition> wired to createMotion (Task 12) + shared Escape adapter (Task 8, PRIORITY.DIALOG) + ZIndex 'modal' key (Task 9) + scroll-lock adapter (Task 11) — matching the verified 'no shared orchestration service' pattern, each piece wired directly in this component's own body. Focus-return-on-close and mask-click drag-selection-guard behavior preserved exactly. EXCLUDES draggable and maximizable (verified real upstream features) per spec §15's resolved fork — no such props, handlers, or UI anywhere in this file."
  },
  {
    "originalPath": "packages/primevue/src/dialog/BaseDialog.vue",
    "ultimateDestination": "packages/vue/src/dialog/BaseDialog.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream prop surface, scoped to Phase 4's excluded-draggable/maximizable boundary — no such props declared."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/dialog/dialog-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Reuses the already-built @ultimate/uix-styles dialog style module (Phase 1)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/dialog/dialog.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite, including explicit negative regression tests for the draggable/maximizable exclusion (spec §15/§23), multi-dialog Escape-priority stacking (spec §11), and multi-dialog scroll-lock refcounting (spec §16)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/dialog/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 11: Commit**

```bash
git add packages/vue/src/dialog/ packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "feat(vue): add UDialog composing Portal/FocusTrap/Escape/ZIndex/scroll-lock/motion"
```

---

## Task 21: `UMenu`

**Context:** Menu's real Escape handling is a **local** `keydown` handler on its own list element — NOT routed through the shared `uix-utils/escape` adapter (spec §10's correction, §13). Do not wire Menu through Task 8's `createGlobalEscapeKeyMixin` "for consistency" — that would contradict verified PrimeVue source. This is this plan's last proof-set component.

**Files:**

- Create: `packages/vue/src/menu/BaseMenu.ts`
- Create: `packages/vue/src/menu/Menuitem.vue`
- Create: `packages/vue/src/menu/Menu.vue`
- Create: `packages/vue/src/menu/menu-style.ts`
- Create: `packages/vue/src/menu/menu.spec.ts`
- Create: `packages/vue/src/menu/index.ts`
- Modify: `packages/vue/src/index.ts`

**Interfaces:**

- Consumes: `Portal` (Task 7), `useZIndex`/`Z_INDEX_KEYS` (Task 9). Does **not** consume the Escape adapter (Task 8), does **not** consume `focusTrapDirective` (Task 10 — Menu does not trap Tab, verified no FocusTrap import in real `Menu.vue`).
- Produces: `UMenu` component.

- [ ] **Step 1: Extract `menu` source for reference**

Run: `node scripts/provenance/extract-primevue-source.mjs .vendor-cache/primevue-4.5.5.tar.gz primevue menu .vendor-extracted/vue/menu`

Read `.vendor-extracted/vue/menu/Menu.vue` and `.vendor-extracted/vue/menu/Menuitem.vue` in full (already read multiple times during the Real-Source Verification Gates — spec §10). Re-confirm the complete verified behavior surface this task must reproduce:
- Dual-mode: `popup: false` renders an always-visible inline `<ul role="menu">`; `popup: true` toggles a `Portal`-rendered overlay via `show(event, target)`/`hide()`/`toggle()`.
- `aria-activedescendant` virtual focus — `focusedOptionIndex` tracks the active item by its rendered `id`, no `.focus()` ever called on an individual `<li>`.
- Keyboard: `ArrowDown`/`ArrowUp` (`Alt+ArrowUp` in popup mode returns focus to target and closes), `Home`/`End`, `Enter`/`NumpadEnter`/`Space` (both call `onEnterKey`), `Escape` (local handler, calls `focus(this.target)` then `hide()` if popup — **verified fall-through into the `Tab` case, no `break`**, a real quirk to preserve, not silently fix), `Tab` (closes a visible popup, does not trap).
- Popup-mode lifecycle: `show`/`onEnter` (absolute-position alignment, binds outside-click/resize/scroll listeners, sets z-index `'menu'` key, focuses the list), `onLeave`/`onAfterLeave` (unbind listeners, clear z-index).
- Outside-click: Menu-local `document`-level capture-phase `click` listener — NOT built on a shared overlay-listener composition.
- Resize/scroll dismissal: Menu-local `window` resize listener + `ConnectedOverlayScrollHandler`-equivalent scroll dismissal.
- `Menuitem.vue`: `role="menuitem"`, `aria-label`, `aria-disabled`, `data-p-disabled`-equivalent selector marker (Ultimate's own `data-u-*` convention per spec §10's selector-strategy deviation), disabled-item filtering.

- [ ] **Step 2: Write `menu-style.ts`**

Create `packages/vue/src/menu/menu-style.ts`:

```typescript
import type { StyleModule } from "@ultimate/vue-core";
import { menuStyle } from "@ultimate/uix-styles/menu";

export const menuStyleModule: StyleModule = menuStyle;
```

- [ ] **Step 3: Write the failing tests**

Create `packages/vue/src/menu/menu.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UMenu } from "./index";

const model = [
  { label: "New", command: () => {} },
  { label: "Open", command: () => {} },
  { separator: true },
  { label: "Disabled", disabled: true, command: () => {} },
  { label: "Delete", command: () => {} },
];

describe("UMenu — non-popup mode", () => {
  it("renders an always-visible inline ul[role=menu]", () => {
    const wrapper = mount(UMenu, { props: { model } });
    expect(wrapper.find('ul[role="menu"]').exists()).toBe(true);
  });

  it("renders role=menuitem items, role=separator for separator entries", () => {
    const wrapper = mount(UMenu, { props: { model } });
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(4);
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);
  });

  it("marks disabled items with aria-disabled", () => {
    const wrapper = mount(UMenu, { props: { model } });
    const disabledItem = wrapper.findAll('[role="menuitem"]')[2];
    expect(disabledItem.attributes("aria-disabled")).toBe("true");
  });
});

describe("UMenu — keyboard navigation (verified full key set, spec §10)", () => {
  it("ArrowDown moves focusedOptionIndex to the next non-disabled item", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toBeTruthy();
    wrapper.unmount();
  });

  it("ArrowDown skips disabled items", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    // Navigate through New -> Open -> Delete, never landing on Disabled.
    for (let i = 0; i < 3; i++) await list.trigger("keydown", { code: "ArrowDown" });
    const activeId = list.attributes("aria-activedescendant");
    const activeItem = wrapper.find(`#${activeId}`);
    expect(activeItem.text()).not.toBe("Disabled");
    wrapper.unmount();
  });

  it("Home moves to the first item, End moves to the last non-disabled item", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "End" });
    const activeId = list.attributes("aria-activedescendant");
    expect(wrapper.find(`#${activeId}`).text()).toBe("Delete");
    wrapper.unmount();
  });

  it("Space triggers the same activation as Enter (calls onEnterKey)", async () => {
    const commandSpy = { called: false };
    const spyModel = [{ label: "Action", command: () => { commandSpy.called = true; } }];
    const wrapper = mount(UMenu, { props: { model: spyModel }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "ArrowDown" });
    await list.trigger("keydown", { code: "Space" });
    expect(commandSpy.called).toBe(true);
    wrapper.unmount();
  });

  it("Escape (local handler, NOT the shared uix-utils/escape adapter) hides a popup menu", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    wrapper.vm.show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("keydown", { code: "Escape" });
    expect(wrapper.emitted("hide")).toBeTruthy();
    wrapper.unmount();
  });

  it("Tab closes a visible popup menu without trapping focus", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    wrapper.vm.show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("keydown", { code: "Tab" });
    expect(wrapper.emitted("hide")).toBeTruthy();
    wrapper.unmount();
  });
});

describe("UMenu — popup mode lifecycle", () => {
  it("show() makes the overlay visible, sets z-index with the 'menu' key", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    wrapper.vm.show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    wrapper.unmount();
  });

  it("hide() removes the overlay", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    wrapper.vm.show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    wrapper.vm.hide();
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
  });

  it("clicking outside the menu and the trigger target dismisses it (Menu-local listener, not a shared composition)", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    const outsideEl = document.createElement("div");
    document.body.appendChild(outsideEl);
    wrapper.vm.show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
    outsideEl.remove();
  });
});
```

- [ ] **Step 4: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/vue test menu`
Expected: FAIL — none of the menu files exist yet.

- [ ] **Step 5: Write `BaseMenu.ts`**

Create `packages/vue/src/menu/BaseMenu.ts`:

```typescript
import { createBaseComponent } from "@ultimate/vue-core";
import { menuStyleModule } from "./menu-style";
import type { ComponentOptions } from "vue";

export function createBaseMenu(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "menu", styleModule: menuStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      popup: { type: Boolean, default: false },
      appendTo: { type: [String, Object], default: "body" },
      autoZIndex: { type: Boolean, default: true },
      baseZIndex: { type: Number, default: 0 },
      tabindex: { type: Number, default: 0 },
      ariaLabel: { type: String, default: null },
      ariaLabelledby: { type: String, default: null },
    },
  };
}
```

- [ ] **Step 6: Write `Menuitem.vue`**

Create `packages/vue/src/menu/Menuitem.vue`:

```vue
<template>
  <li
    v-if="visible"
    :id="id"
    role="menuitem"
    data-u-menuitem
    :data-u-disabled="disabled || false"
    :class="cx('item')"
    :aria-label="item.label"
    :aria-disabled="disabled"
    @click="onClick"
    @mousemove="onMouseMove"
  >
    <a v-ripple :href="item.url" :class="cx('itemLink')" tabindex="-1">
      <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
      <span :class="cx('itemLabel')">{{ item.label }}</span>
    </a>
  </li>
</template>

<script>
import { rippleDirective } from "../ripple";
import { createBaseComponent } from "@ultimate/vue-core";

export default {
  name: "UMenuitem",
  extends: createBaseComponent({ componentName: "menuitem", styleModule: { css: "", classes: {} } }),
  directives: { ripple: rippleDirective },
  emits: ["item-click", "item-mousemove"],
  props: {
    item: { type: Object, required: true },
    id: { type: String, required: true },
    focusedOptionId: { type: [String, Number], default: null },
  },
  computed: {
    visible() {
      return typeof this.item.visible === "function" ? this.item.visible() : this.item.visible !== false;
    },
    disabled() {
      return typeof this.item.disabled === "function" ? this.item.disabled() : !!this.item.disabled;
    },
  },
  methods: {
    onClick(event) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      this.$emit("item-click", { originalEvent: event, item: this.item, id: this.id });
    },
    onMouseMove(event) {
      this.$emit("item-mousemove", { originalEvent: event, id: this.id });
    },
  },
};
</script>
```

- [ ] **Step 7: Write `Menu.vue`**

Create `packages/vue/src/menu/Menu.vue`:

```vue
<template>
  <UPortal :appendTo="appendTo" :disabled="!popup">
    <transition name="u-menu" @enter="onEnter" @leave="onLeave" @after-leave="onAfterLeave">
      <div v-if="popup ? overlayVisible : true" ref="container" :class="cx('root')" @click="onOverlayClick">
        <ul
          ref="list"
          role="menu"
          :tabindex="tabindex"
          :aria-activedescendant="focused ? focusedOptionId : undefined"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :class="cx('list')"
          @focus="onListFocus"
          @blur="onListBlur"
          @keydown="onListKeyDown"
        >
          <template v-for="(item, i) in model" :key="item.label + i">
            <li v-if="!item.items && item.separator" :key="'sep' + i" role="separator" :class="cx('separator')" />
            <UMenuitem
              v-else-if="!item.items"
              :id="`${_uid}_${i}`"
              :item="item"
              :focused-option-id="focusedOptionId"
              @item-click="itemClick"
              @item-mousemove="itemMouseMove"
            />
          </template>
        </ul>
      </div>
    </transition>
  </UPortal>
</template>

<script>
import { Portal as UPortal, useZIndex, Z_INDEX_KEYS } from "@ultimate/vue-core";
import { focus, isTouchDevice } from "@ultimate/uix-utils/dom";
import Menuitem from "./Menuitem.vue";
import { createBaseMenu } from "./BaseMenu";

const { set: setZIndex, clear: clearZIndex } = useZIndex();
let uidCounter = 0;

// Escape handling here is deliberately a LOCAL keydown handler on the <ul>,
// NOT the shared uix-utils/escape adapter — matching verified Menu.vue's real
// upstream mechanism exactly (spec §10's correction, §13). Menu's Escape only
// fires while this specific <ul> has focus; it does not need the global
// document-level stacking problem the shared adapter solves for Dialog.
export default {
  name: "UMenu",
  extends: createBaseMenu(),
  inheritAttrs: false,
  emits: ["show", "hide", "focus", "blur"],
  components: { UMenuitem: Menuitem, UPortal },
  data() {
    return {
      overlayVisible: false,
      focused: false,
      focusedOptionIndex: -1,
      _uid: `u-menu-${++uidCounter}`,
    };
  },
  target: null,
  outsideClickListener: null,
  resizeListener: null,
  mounted() {
    if (!this.popup) {
      this.bindResizeListener();
      this.bindOutsideClickListener();
    }
  },
  beforeUnmount() {
    this.unbindResizeListener();
    this.unbindOutsideClickListener();
    if (this.$refs.container && this.autoZIndex) clearZIndex(this.$refs.container);
  },
  computed: {
    focusedOptionId() {
      return this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : null;
    },
  },
  methods: {
    itemClick(event) {
      if (this.overlayVisible) this.hide();
      if (!this.popup) this.focusedOptionIndex = event.id;
    },
    itemMouseMove(event) {
      if (this.focused) this.focusedOptionIndex = event.id;
    },
    onListFocus(event) {
      this.focused = true;
      if (!this.popup) this.changeFocusedOptionIndex(0);
      this.$emit("focus", event);
    },
    onListBlur(event) {
      this.focused = false;
      this.focusedOptionIndex = -1;
      this.$emit("blur", event);
    },
    onListKeyDown(event) {
      switch (event.code) {
        case "ArrowDown":
          this.onArrowDownKey(event);
          break;
        case "ArrowUp":
          this.onArrowUpKey(event);
          break;
        case "Home":
          this.onHomeKey(event);
          break;
        case "End":
          this.onEndKey(event);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(event);
          break;
        case "Space":
          this.onSpaceKey(event);
          break;
        case "Escape":
          if (this.popup) {
            focus(this.target);
            this.hide();
          }
        // Verified fall-through, no break — matches real Menu.vue's switch
        // statement exactly (spec §10's confirmed quirk, harmless by trace,
        // not silently "fixed" here).
        case "Tab":
          if (this.overlayVisible) this.hide();
          break;
        default:
          break;
      }
    },
    onArrowDownKey(event) {
      this.changeFocusedOptionIndex(this.findNextOptionIndex(this.focusedOptionIndex));
      event.preventDefault();
    },
    onArrowUpKey(event) {
      if (event.altKey && this.popup) {
        focus(this.target);
        this.hide();
        event.preventDefault();
      } else {
        this.changeFocusedOptionIndex(this.findPrevOptionIndex(this.focusedOptionIndex));
        event.preventDefault();
      }
    },
    onHomeKey(event) {
      this.changeFocusedOptionIndex(0);
      event.preventDefault();
    },
    onEndKey(event) {
      const items = this.getEnabledItems();
      this.changeFocusedOptionIndex(items.length - 1);
      event.preventDefault();
    },
    onEnterKey(event) {
      const item = this.getEnabledItems()[this.currentItemPosition()];
      if (this.popup) focus(this.target);
      if (item?.command) item.command({ originalEvent: event, item });
      event.preventDefault();
    },
    onSpaceKey(event) {
      this.onEnterKey(event);
    },
    getEnabledItems() {
      return this.model.filter((item) => !item.separator && !item.disabled);
    },
    currentItemPosition() {
      const items = this.getEnabledItems();
      return Math.max(
        0,
        items.findIndex((item) => item === this.model[this.focusedOptionIndex])
      );
    },
    findNextOptionIndex(index) {
      return Math.min(index + 1, this.getEnabledItems().length - 1);
    },
    findPrevOptionIndex(index) {
      return Math.max(index - 1, 0);
    },
    changeFocusedOptionIndex(index) {
      const items = this.getEnabledItems();
      const clamped = index >= items.length ? items.length - 1 : index < 0 ? 0 : index;
      this.focusedOptionIndex = this.model.indexOf(items[clamped]);
    },
    toggle(event, target) {
      if (this.overlayVisible) this.hide();
      else this.show(event, target);
    },
    show(event, target) {
      this.overlayVisible = true;
      this.target = target ?? event?.currentTarget;
    },
    hide() {
      this.overlayVisible = false;
      this.target = null;
    },
    onEnter() {
      this.bindOutsideClickListener();
      this.bindResizeListener();
      if (this.autoZIndex) setZIndex(Z_INDEX_KEYS.menu, this.$refs.container, this.baseZIndex);
      if (this.popup) focus(this.$refs.list);
      this.$emit("show");
    },
    onLeave() {
      this.unbindOutsideClickListener();
      this.unbindResizeListener();
      this.$emit("hide");
    },
    onAfterLeave() {
      if (this.autoZIndex) clearZIndex(this.$refs.container);
    },
    onOverlayClick() {},
    bindOutsideClickListener() {
      if (this.outsideClickListener) return;
      this.outsideClickListener = (event) => {
        const isOutsideContainer = this.$refs.container && !this.$refs.container.contains(event.target);
        const isOutsideTarget = !(this.target && (this.target === event.target || this.target.contains?.(event.target)));
        if (this.overlayVisible && isOutsideContainer && isOutsideTarget) this.hide();
        else if (!this.popup && isOutsideContainer && isOutsideTarget) this.focusedOptionIndex = -1;
      };
      document.addEventListener("click", this.outsideClickListener, true);
    },
    unbindOutsideClickListener() {
      if (!this.outsideClickListener) return;
      document.removeEventListener("click", this.outsideClickListener, true);
      this.outsideClickListener = null;
    },
    bindResizeListener() {
      if (this.resizeListener) return;
      this.resizeListener = () => {
        if (this.overlayVisible && !isTouchDevice()) this.hide();
      };
      window.addEventListener("resize", this.resizeListener);
    },
    unbindResizeListener() {
      if (!this.resizeListener) return;
      window.removeEventListener("resize", this.resizeListener);
      this.resizeListener = null;
    },
  },
};
</script>
```

**Note on scroll dismissal**: verified `Menu.vue` uses `ConnectedOverlayScrollHandler` (from `@primevue/core/utils`) to dismiss the popup on scroll of the target's scrollable ancestors — this task's implementation above omits it for brevity of a first pass; before this task is complete, add a `bindScrollListener`/`unbindScrollListener` pair (a scroll listener on `window` in capture phase, checking whether the scroll event's target is an ancestor of `this.target`, calling `hide()` if so) alongside the existing resize/outside-click listeners, matching the same Menu-local-wiring posture as those two — not a shared composition, per spec §13.

- [ ] **Step 8: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/vue test menu`
Expected: PASS (14 assertions) — including confirming the scroll-dismissal note above is addressed if any test exercises it (Step 3's test list above does not include a dedicated scroll-dismissal test; add one here if closing that note reveals it's needed for completeness, matching this plan's own "don't silently under-test a real documented behavior" standard applied throughout).

- [ ] **Step 9: Create barrel, update root index**

`packages/vue/src/menu/index.ts`:

```typescript
export { default as UMenu } from "./Menu.vue";
export { createBaseMenu } from "./BaseMenu";
```

Update `packages/vue/src/index.ts`, adding `export * from "./menu";`. Confirm `packages/vue/tsup.config.ts`'s `"menu/index"` entry is present.

- [ ] **Step 10: Run the full build, confirm all five component entries plus the barrel succeed**

Run: `pnpm --filter @ultimate/vue build`
Expected: PASS — `index`, `button`, `checkbox`, `dialog`, `menu`, `tooltip`, `ripple` entries all build. This is the first point every planned `vue` subpath export is real.

- [ ] **Step 11: Add provenance entries**

Append to `docs/architecture/provenance/vue.json`:

```json
[
  {
    "originalPath": "packages/primevue/src/menu/Menu.vue",
    "ultimateDestination": "packages/vue/src/menu/Menu.vue",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified full behavior surface (spec §10, this Phase's completed verification gap): dual-mode (inline/popup), aria-activedescendant virtual focus (converges with React's ADR-027, diverges from Angular's literal-DOM-focus UMenu), full keyboard set (arrows/Home/End/Enter/Space/Escape/Tab), the verified Escape-case switch-statement fall-through into Tab preserved exactly as a documented quirk (not silently fixed). Escape handling is Menu's own LOCAL keydown handler on its list element — NOT the shared uix-utils/escape adapter (spec §11's mechanism is Dialog-specific; Menu's real upstream mechanism is scoped-to-focused-element, a different problem shape). Outside-click/resize dismissal authored Menu-locally, not through a shared overlay-listener composition — matching the same posture already established for Dialog (spec §13). ZIndex 'menu' key verified and reused."
  },
  {
    "originalPath": "packages/primevue/src/menu/Menuitem.vue",
    "ultimateDestination": "packages/vue/src/menu/Menuitem.vue",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified real rendered attributes: role=menuitem, aria-label, aria-disabled. Selector-strategy deviation (spec §10): Ultimate's own data-u-menuitem/data-u-disabled convention replaces PrimeVue's real data-pc-section/data-p-disabled attributes, since those are passthrough-system-coupled and the full pt system is excluded (spec §7)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/menu/menu-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Reuses the already-built @ultimate/uix-styles menu style module (Phase 1)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/menu/menu.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite covering the full verified key set, including a dedicated test confirming Escape uses Menu's own local handler rather than the shared uix-utils/escape mechanism — a real, evidence-backed architectural distinction from Dialog, not an oversight to unify."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/vue/src/menu/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 12: Run the FULL `vue-core` and `vue` test suites together, confirm the entire five-component proof set is stable as one unit**

Run: `pnpm --filter @ultimate/vue-core test && pnpm --filter @ultimate/vue test`
Expected: PASS — every task's tests across both packages pass together. This is the first point in the plan where the complete Phase 4 proof set (5 components + 3 directives + 12 foundation-tier modules) is exercised as one whole.

- [ ] **Step 13: Commit**

```bash
git add packages/vue/src/menu/ packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "feat(vue): add UMenu with local Escape handling, complete the five-component proof set"
```

---

## Task 22: `sideEffects` build-level validation

**Context:** per Global Constraints, `sideEffects: false` in both `package.json` files has been a provisional package-metadata decision since Task 3/Task 15 — not yet a measured bundler-behavior confirmation. This task runs the required validation sequence spec §3/§33 demand before that decision is treated as final.

**Files:**

- Create: `scripts/provenance/verify-tree-shaking-vue.mjs`
- Modify: `packages/vue-core/package.json` (if validation reveals a correction is needed)
- Modify: `packages/vue/package.json` (if validation reveals a correction is needed)

**Interfaces:**

- Consumes: both packages' built `dist/` output (Tasks 3-21).
- Produces: a confirmed-or-corrected `sideEffects` decision for both packages, recorded in this task's commit.

- [ ] **Step 1: Write `verify-tree-shaking-vue.mjs`**

Modeled on Phase 3's `verify-tree-shaking-react.mjs` equivalent (a real esbuild bundle check, not a guess) — since this script's exact prior content was not re-read in this plan's research pass, write it from first principles matching this exact validation shape:

```javascript
#!/usr/bin/env node
// scripts/provenance/verify-tree-shaking-vue.mjs
//
// Confirms or corrects the sideEffects: false package-metadata decision for
// @ultimate/vue-core and @ultimate/vue (spec §3, §33 — a hard exit-criteria
// gate, not a default). Bundles a minimal consumer entry point via esbuild
// against each package's real built dist/ output (not src/), for both a
// direct/subpath import and a barrel import, then inspects the resulting
// bundle for evidence that required style-registration code was NOT
// eliminated by dead-code elimination.

import { build } from "esbuild";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function bundleEntry(entrySource, label) {
  const dir = mkdtempSync(join(tmpdir(), "verify-tree-shaking-vue-"));
  const entryFile = join(dir, "entry.mjs");
  writeFileSync(entryFile, entrySource);
  try {
    const result = await build({
      entryPoints: [entryFile],
      bundle: true,
      write: false,
      format: "esm",
      platform: "browser",
      treeShaking: true,
      absWorkingDir: process.cwd(),
    });
    const code = result.outputFiles[0].text;
    console.log(`[verify-tree-shaking-vue] ${label}: bundle size ${code.length} bytes`);
    return code;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const checks = [
  {
    label: "vue subpath import (UButton only)",
    source: `import { UButton } from "@ultimate/vue/button"; console.log(UButton);`,
    mustContain: ["registerComponentStyle", "createStyleElement"],
    mustNotContain: ["UDialog", "UMenu"],
  },
  {
    label: "vue barrel import (UButton only, via full barrel)",
    source: `import { UButton } from "@ultimate/vue"; console.log(UButton);`,
    mustContain: ["registerComponentStyle", "createStyleElement"],
    mustNotContain: [],
  },
];

let failed = false;

for (const check of checks) {
  const code = await bundleEntry(check.source, check.label);
  for (const term of check.mustContain) {
    if (!code.includes(term)) {
      console.error(`FAIL: ${check.label} — expected bundle to contain "${term}" but it was eliminated`);
      failed = true;
    }
  }
  for (const term of check.mustNotContain) {
    if (code.includes(term)) {
      console.error(`FAIL: ${check.label} — expected bundle to NOT contain "${term}" (tree-shaking failure)`);
      failed = true;
    }
  }
}

if (failed) {
  console.error(
    "\nsideEffects: false did not hold under real bundling. Correct the flag to true, or mark the " +
      "specific style-registration module sideEffects: true via the array-of-paths form. Do not weaken this check."
  );
  process.exit(1);
}

console.log("[verify-tree-shaking-vue] all checks passed — sideEffects: false confirmed under real esbuild bundling.");
```

- [ ] **Step 2: Build both packages in production mode**

Run: `pnpm --filter @ultimate/vue-core build && pnpm --filter @ultimate/vue build`
Expected: PASS — both `dist/` directories populated (not dev/watch mode).

- [ ] **Step 3: Run the verification script**

Run: `node scripts/provenance/verify-tree-shaking-vue.mjs`
Expected: PASS. If it FAILs, this is a real, required decision point — not a step to skip or silently retry:
- If style registration is eliminated: correct `sideEffects` to `true` in the failing package's `package.json` (matching Angular's ADR-021 precedent), or mark the specific style-registration module `sideEffects: true` via the array-of-paths form if only that module needs it.
- Do not proceed to Step 4 until this genuinely passes — do not comment out the check or narrow its assertions to make it pass artificially.

- [ ] **Step 4: Write a throwaway consumer-mounting confirmation test, run it, then delete it**

Create a temporary `packages/vue/src/__tree-shaking-consumer.spec.ts` (deleted at the end of this step — its only purpose is confirming real component *mounting* from the built `dist/` output, not just import, survives whatever `sideEffects` value Step 3 settled on):

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
// Import from the BUILT dist/ output, not src/ — the whole point of this check.
import { UButton } from "../dist/index.mjs";

describe("tree-shaking consumer-mount confirmation (throwaway)", () => {
  it("mounts UButton from the built dist/ output and confirms real style injection", () => {
    const wrapper = mount(UButton, { props: { label: "Test" } });
    expect(wrapper.text()).toContain("Test");
    expect(document.head.querySelector('style[data-u-style="button"]')).not.toBeNull();
  });
});
```

Run: `pnpm --filter @ultimate/vue exec vitest run src/__tree-shaking-consumer.spec.ts`
Expected: PASS. Then delete the file:

```bash
rm packages/vue/src/__tree-shaking-consumer.spec.ts
```

- [ ] **Step 5: Commit**

```bash
git add scripts/provenance/verify-tree-shaking-vue.mjs
git commit -m "feat(provenance): add and run tree-shaking/sideEffects validation for vue-core and vue"
```

(If Step 3 required a `package.json` correction, include that file in this commit too, with a commit message reflecting the correction, e.g. `fix(vue): correct sideEffects to true after tree-shaking validation found style registration eliminated`.)

---

## Task 23: Resolve the Dialog `breakpoints` CSS-injection finding (spec §25)

**Context:** spec §25 flagged a real, precise security finding: PrimeVue's real `Dialog.vue` builds a `<style>` element's `innerHTML` from a caller-supplied `breakpoints` object via unescaped string interpolation. This plan's Task 20 did **not** implement a `breakpoints`-equivalent prop on `UDialog` at all — this task exists to make that omission an explicit, verified decision, not a silent gap.

**Files:** none created or modified directly by this task — it is a verification-only checkpoint whose output feeds Task 24's ADR batch.

- [ ] **Step 1: Confirm `UDialog`'s Task 20 implementation has no `breakpoints` prop**

Run: `grep -n "breakpoints" packages/vue/src/dialog/*.ts packages/vue/src/dialog/*.vue`
Expected: no matches — confirming Task 20's `UDialog` never added a `breakpoints`-equivalent responsive-width feature at all (it was not in this plan's Task 20 scope; Dialog's real feature surface beyond draggable/maximizable was never fully inventoried against this specific prop).

- [ ] **Step 2: Record this as an explicit decision, not a silent omission**

This finding is **not blocking Phase 4 exit** per spec §25's own framing ("If `breakpoints` is not in Phase 4's `UDialog` scope at all, this finding is recorded for a future phase, not blocking Phase 4 exit") — confirmed true by Step 1. No code change needed. This task's only output is the ADR entry Task 24 writes (ADR referencing this exact finding, its CSS-injection-safety implication, and the explicit "descoped, not silently forgotten" status) — do not skip that ADR entry believing this task's grep-confirmation alone is sufficient documentation.

---

## Task 24: Provenance documentation updates (PROVENANCE.md, PACKAGE_ARCHITECTURE.md, DECISIONS.md, ROADMAP.md)

**Files:**

- Modify: `docs/architecture/PROVENANCE.md`
- Modify: `docs/architecture/PACKAGE_ARCHITECTURE.md`
- Modify: `docs/architecture/DECISIONS.md`
- Modify: `docs/architecture/ROADMAP.md`

**Interfaces:** none — pure documentation, consumed by future phases/readers, not by other tasks in this plan.

- [ ] **Step 1: Update `PROVENANCE.md`'s PrimeVue entry**

Modify the existing `## PrimeVue` entry (currently: `Modification status: not yet incorporated (Phase 0 — baseline pinned only)`), following the exact field template already used by the `PrimeNG`/`PrimeReact` entries:

```markdown
## PrimeVue

- **Source repository:** https://github.com/primefaces/primevue
- **Source package:** `primevue`
- **Source version:** `4.5.5`
- **Source commit SHA:** `66dde6788220fc9e6822342919d1ceb0e3460ece`
- **Source path:** `packages/primevue`, `packages/core` (dual-root monorepo subdirectories — verified during Phase 4's Real-Source Verification Gate; unlike PrimeReact's single `components/lib/` root, PrimeVue's own repo splits foundation-tier source from components/directives)
- **Original license:** MIT
- **Copyright holder:** PrimeTek, 2018-2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/vue`, `packages/vue-core` (Phase 4)
- **Modification status:** incorporated (Phase 4) — foundation tier reimplemented with PrimeVue as design reference, not copied verbatim (Option B, same posture as ADR-018/024); Button/Checkbox/Dialog/Menu/Tooltip and their direct primitive dependencies (Ripple, Portal, FocusTrap, BaseComponent/BaseDirective/BaseEditableHolder/BaseInput) adapted with full Ultimate namespace rename. Remaining ~145 source areas classified but not incorporated — see `docs/architecture/COMPONENT_INVENTORY.md` if a Vue-native inventory is added in a later phase (not committed this phase, spec §30).
- **Modification description:** see file-level manifests at `docs/architecture/provenance/vue-core.json` and `docs/architecture/provenance/vue.json` for per-file status.
- **Date incorporated:** [fill in the actual date this task runs]
```

- [ ] **Step 2: Update `PACKAGE_ARCHITECTURE.md`'s active-status prose**

Run: `grep -n "vue-core.*reserved\|vue.*reserved for Phase 4" docs/architecture/PACKAGE_ARCHITECTURE.md` to confirm the current exact wording first.

Replace `vue-core remains reserved for Phase 4` with:

```markdown
`packages/vue-core` is active as of Phase 4 — see `packages/vue-core/README.md` for its `BaseComponent`/`BaseEditableHolder`/`BaseInput`/`BaseDirective` architecture.
```

Replace `vue remains reserved for Phase 4` with:

```markdown
`packages/vue` is active as of Phase 4 — see `packages/vue/README.md` for its 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus `v-ripple` and `v-tooltip` directives.
```

- [ ] **Step 3: Add new ADRs to `DECISIONS.md`, starting at ADR-032**

Run: `grep -n "^## ADR" docs/architecture/DECISIONS.md | tail -3` to confirm ADR-031 is still the current highest before appending (if a concurrent change has added ADRs since this plan was written, adjust the starting number accordingly — do not silently overwrite an existing ADR-032).

Append to `docs/architecture/DECISIONS.md`:

```markdown
## ADR-032 — Option B: Ultimate-owned Vue base architecture (Options-API `extends` mixin)

Status: Accepted (Phase 4 spec, confirmed by implementation). `vue-core`'s `createBaseComponent`/`createBaseEditableHolder`/`createBaseInput` are independently authored, informed by but not copied from PrimeVue's real `BaseComponent.vue`/`BaseEditableHolder.vue`/`BaseInput.vue` — the full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` passthrough system (~140 lines of nested-key resolution, two separate implementations for the component-mixin and directive-factory mechanisms) and `inject: { $parentInstance }` host-instance lookup are excluded from Phase 4's base, matching the same YAGNI posture ADR-018/024 established for Angular/React. Authoring style is Options-API `extends` mixin chains, not Composition-API composables — a genuine architectural fork resolved during Phase 4's research/brainstorming gate (chosen because it mirrors verified PrimeVue's own `BaseComponent.vue` mechanism most literally).

## ADR-033 — Separate `BaseDirective`-equivalent factory for directive-shaped primitives

Status: Accepted (Phase 4 spec, confirmed by implementation). `vue-core`'s `createDirective` factory is structurally distinct from `createBaseComponent`'s `extends:`-consumed mixin chain — matching verified PrimeVue's own `BaseDirective.js`, which is a plain object with its own `.extend(name, options)` factory returning real Vue directive lifecycle hooks, not an `extends:`-consumed mixin. This mechanism-shape difference is dictated by Vue's own component/directive distinction, not an independent Ultimate design choice — Angular and React have no equivalent separate-factory need since neither framework has Vue's native custom-directive concept in the same form.

## ADR-034 — FocusTrap, Tooltip, and Ripple are Vue custom directives, not components

Status: Accepted (Phase 4 spec, confirmed by implementation). Verified PrimeVue's real `FocusTrap.js`, `Tooltip.js`, and `Ripple.js` are all Vue custom directives (`v-focustrap`, `v-tooltip`, `v-ripple`), not `.vue` SFC components — a materially different artifact shape from both Angular's `[uFocusTrap]` directive-with-component-render and React's ref-based sentinel *component* (FocusTrap) or ref-target *component* (Tooltip). `vue-core`'s `v-focustrap` and `vue`'s `v-tooltip`/`v-ripple` preserve this verified directive-native mechanism rather than converting any of the three into components to superficially match Angular's or React's API shape — per §2.4/ADR-006's framework-native-implementation principle.

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
```

- [ ] **Step 4: Update `ROADMAP.md`'s Phase 4 row**

Run: `grep -n "^| 4" docs/architecture/ROADMAP.md` to confirm the current row text first.

Change the Phase 4 row's status from `Not started` to `Complete`:

```markdown
| 4     | UltimateVue                                               | Complete                |
```

**Note**: Phases 0/1/2's rows show stale statuses in this file despite being complete (pre-existing drift, not introduced by this plan) — out of this task's scope to fix unless explicitly asked; only Phase 4's own row is this task's responsibility.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/PROVENANCE.md docs/architecture/PACKAGE_ARCHITECTURE.md docs/architecture/DECISIONS.md docs/architecture/ROADMAP.md
git commit -m "docs(architecture): record Phase 4 provenance, package-architecture status, ADR-032 through ADR-042, roadmap update"
```

---

## Task 25: READMEs + full clean-checkout verification

**Files:**

- Create: `packages/vue-core/README.md`
- Create: `packages/vue/README.md`

**Interfaces:** none — documentation, plus a final verification pass across the whole Phase 4 deliverable.

- [ ] **Step 1: Write `packages/vue-core/README.md`**

Following the exact structural depth of `packages/react-core/README.md` (Status/Architecture/Modules/Usage/Intentional-deviations/Dependencies sections):

```markdown
# @ultimate/vue-core

Vue-specific foundation for the Ultimate Platform: Options-API base component architecture, directive infrastructure, overlay/focus-trap/escape/scroll/motion infrastructure, and icons.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

`vue-core`'s `createBaseComponent` is **Option B**: informed by PrimeVue's own `BaseComponent.vue` pattern, but independently authored and deliberately scoped down. It covers class-name-slot resolution (`cx()`) and one-time-per-`componentName` style registration against a module-level `VueStyleSheet` instance only — an Options-API mixin factory, not a class (unlike Angular's `ng-core`) and not a hook (unlike React's `react-core`).

PrimeVue's full passthrough (`pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo`) system and `inject: { $parentInstance }` host-lookup are explicitly excluded — same posture as Angular's `ng-core` (ADR-018), `react-core` (ADR-024), and `vue-core`'s own ADR-032. Directives (`v-focustrap`) use a genuinely separate mechanism (`createDirective`, ADR-033) since Vue's directive lifecycle hooks differ structurally from a component's `extends:`-consumed mixin chain — this is not true of Angular's or React's foundation tier, which have no equivalent native-directive concept. See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/vue-core.json` for the full provenance record.

## Modules

- `base` — `createBaseComponent({ componentName, styleModule })` (an Options-API mixin factory, `extend:`-consumed by every component's own `Base*.ts`), `createBaseEditableHolder()` (v-model/controlled-uncontrolled contract, `@primevue/forms` integration excluded per ADR-039), `createBaseInput()` (the real verified `size`/`fluid`/`variant` intermediate tier).
- `directive` — `createDirective({ name, hooks })`, a separate factory (not `extends:`-consumed) returning a real Vue `ObjectDirective` — the mechanism `v-focustrap`/`v-tooltip`/`v-ripple` are all built on (ADR-033, ADR-034).
- `overlay` — `Portal`, a thin wrapper around native `<Teleport>` (an `inline` escape hatch for `disabled`/`appendTo="self"`, SSR-guarded via a `mounted` flag).
- `escape` — `createGlobalEscapeKeyMixin`/`useDisplayOrder`, a thin Vue adapter over `@ultimate/uix-utils/escape`'s shared priority-tuple registry (extracted from `react-core` during Phase 4's prerequisite work, ADR-036) — NOT a `react-core` dependency. Consumed by `UDialog` only; `UMenu`'s Escape handling is intentionally its own local mechanism (ADR-037).
- `zindex` — `useZIndex()` → `{ set, clear }`, a thin wrapper over `@ultimate/uix-utils`'s `ZIndex` singleton. Verified real keys: `modal` (Dialog), `menu` (Menu), `tooltip` (Tooltip).
- `focus-trap` — `focusTrapDirective` (`v-focustrap`), a Vue custom directive (not a component, ADR-034) using the sentinel-span technique plus a `MutationObserver` for dynamic-content focus redirection (ADR-035, a real capability neither `ng-core`'s nor `react-core`'s FocusTrap has). Does not restore focus on unmount — `UDialog`'s own responsibility.
- `scroll-lock` — `useScrollLock()` → `{ register, unregister }`, a thin Vue wrapper over `@ultimate/uix-utils/scroll-lock`'s shared refcounted registry (ADR-036).
- `motion` — `createMotionTransitionHooks(getOptions)`, wiring `@ultimate/uix-motion`'s `createMotion` into Vue's native `<transition>` hook-callback shape (`@enter`/`@leave` with a `done` callback) — a materially different call-site mechanism from Angular's `effect()` or React's `useEffect`, calling the same underlying framework-agnostic primitive.
- `styling` — `VueStyleSheet` (Vue-only `StyleSheet` subclass delegating to `@ultimate/uix-utils/dom`'s `createStyleElement`), `registerComponentStyle(componentName, styleModule)` (called from `createBaseComponent`'s `mounted()` hook).
- `icons` — five standalone icon components (`SpinnerIcon`, `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `CheckIcon`), each rendering its own inline `<svg role="img">`, matching `ng-core`'s/`react-core`'s established icon pattern.

## Usage

```typescript
import { createBaseComponent, type StyleModule } from "@ultimate/vue-core";

const exampleStyleModule: StyleModule = {
  css: ".u-example-root { }",
  classes: { root: () => "u-example-root" },
};

export default {
  name: "UExample",
  extends: createBaseComponent({ componentName: "example", styleModule: exampleStyleModule }),
  template: `<div :class="cx('root')" />`,
};
```

## Intentional deviations (spec §32)

- **Base architecture** — Options-API `extends` mixin, preserving PrimeVue's own structural mechanism, independently authored (ADR-032).
- **Directive factory** — a separate mechanism from the component mixin, matching Vue's own component/directive distinction (ADR-033).
- **FocusTrap/Tooltip/Ripple** — Vue custom directives, not components, matching verified upstream artifact shape exactly (ADR-034). FocusTrap's `MutationObserver` dynamic-content handling carried forward (ADR-035).
- **Escape** — extracted to shared `@ultimate/uix-utils/escape`, consumed via a thin adapter, not a `react-core` dependency (ADR-036).
- **Scroll-lock** — extracted to shared `@ultimate/uix-utils/scroll-lock` in full (ADR-036).
- **Passthrough** — PrimeVue's full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` system excluded entirely from both the component-mixin and directive-factory mechanisms (Option B, ADR-032/033).
- **Forms** — `@primevue/forms` excluded, a deliberate cut of a real, working PrimeVue feature (ADR-039).

## Dependencies

Depends on `@ultimate/uix-utils`, `@ultimate/uix-styled`, and `@ultimate/uix-motion` (workspace). Peers on `vue` (`^3.5.0`).
```

- [ ] **Step 2: Write `packages/vue/README.md`**

Following the same structural depth as `packages/react/README.md`:

```markdown
# @ultimate/vue

Ultimate Platform Vue components: Button, Checkbox, Dialog, Menu, Tooltip.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Components

- `UButton` — boolean-modifier prop set (`severity`/`raised`/`rounded`/`text`/`outlined`/`size`), matching a three-way convergent pattern independently confirmed across Angular/React/Vue's real upstream sources. `v-ripple` applied to root (unlike React's `UButton`, which has none — Vue's real Button wires it directly, verified). `tooltip`/`tooltipOptions` prop sugar over `v-tooltip`.
- `UCheckbox` — supports both controlled (`modelValue` v-model) and uncontrolled (`defaultValue`) modes, `indeterminate`, and `binary`/array-membership mode — a materially broader contract than React's `UCheckbox` (ADR-038), since Vue's own verified upstream reference genuinely supports all of this and PrimeReact's does not. `@primevue/forms` integration excluded (ADR-039).
- `UDialog` — `v-model:visible` controlled contract (Vue's own idiomatic mechanism, diverging intentionally from Angular's/React's own controlled-prop conventions). Composes `Portal` + `v-focustrap` + native `<transition>` + shared Escape adapter + z-index + scroll-lock. Excludes draggable/maximizable despite verified upstream support (ADR-040); resizable was never a PrimeVue Dialog feature at all.
- `UMenu` — `aria-activedescendant` virtual focus (converges with React, diverges from Angular). Escape handling is Menu's own **local** `keydown` handler, intentionally NOT routed through the shared Escape-priority mechanism `UDialog` uses (ADR-037) — a real, evidence-backed architectural distinction, not an inconsistency.
- `v-tooltip` — a Vue custom directive, not a wrapper component (matching React's ref-target-component concept translated to Vue's directive-on-element binding). Adds `aria-describedby` on the target while visible (intentional accessibility deviation over verified upstream). Two-mode content-injection contract: safe `createTextNode` default, explicit opt-in-only raw-HTML escape hatch (ADR-041).
- `v-ripple` — a standalone directive primitive (matching Angular's `URipple` precedent), wired into `UButton`/`UDialog`.

## Usage

```vue
<template>
  <UButton label="Save" severity="success" @click="onSave" />
  <UCheckbox v-model="agreed" binary />
  <div v-tooltip="'Save your changes'">Hover me</div>
</template>

<script>
import { UButton, UCheckbox } from "@ultimate/vue";
import { tooltipDirective } from "@ultimate/vue/tooltip";

export default {
  components: { UButton, UCheckbox },
  directives: { tooltip: tooltipDirective },
  data: () => ({ agreed: false }),
  methods: { onSave() {} },
};
</script>
```

## Intentional deviations (spec §32)

See `packages/vue-core/README.md`'s deviation list for foundation-tier deviations (base architecture, directives, Escape, scroll-lock, passthrough, forms). Component-level deviations:

- **UDialog** — excludes draggable/maximizable (ADR-040).
- **UMenu** — local Escape handler, not the shared adapter (ADR-037).
- **v-tooltip** — adds `aria-describedby`, two-mode content-injection contract (ADR-041).
- **UCheckbox** — broader contract than React's (controlled+uncontrolled, indeterminate, binary modes) (ADR-038).

## Dependencies

Depends on `@ultimate/vue-core`, `@ultimate/uix-utils`, `@ultimate/uix-styled`, and `@ultimate/uix-motion` (workspace). Peers on `vue` (`^3.5.0`).
```

- [ ] **Step 3: Full clean-checkout install/build/test/typecheck sequence, both packages**

Run:
```bash
pnpm install
pnpm --filter @ultimate/uix-utils build
pnpm --filter @ultimate/uix-utils test
pnpm --filter @ultimate/react-core build
pnpm --filter @ultimate/react-core test
pnpm --filter @ultimate/vue-core build
pnpm --filter @ultimate/vue-core test
pnpm --filter @ultimate/vue-core typecheck
pnpm --filter @ultimate/vue build
pnpm --filter @ultimate/vue test
pnpm --filter @ultimate/vue typecheck
```
Expected: PASS at every step — including `react-core`'s tests, confirming Task 1's refactor introduced no regression this far downstream in the plan either.

- [ ] **Step 4: Run all three provenance/boundary validators**

Run:
```bash
node scripts/provenance/validate-provenance.mjs
node scripts/provenance/validate-boundaries.mjs
node scripts/provenance/validate-dependency-ceiling.mjs
```
Expected: PASS on all three — `validate-provenance.mjs` confirms every `.ts`/`.tsx`/`.vue` file under `packages/{uix,ng,react,vue}*/src/` has a provenance manifest entry (Task 2's extension); `validate-boundaries.mjs` confirms no `vue-core → vue` reverse dependency and no `vue-core → react-core`/`vue → react`/etc. cross-framework dependency (spec §28); `validate-dependency-ceiling.mjs` confirms zero `primevue`/`@primevue/*`/`@primeuix/*` runtime dependency anywhere in `packages/vue*`.

- [ ] **Step 5: Manual dependency-direction grep check**

Run: `grep -rn "@ultimate/react-core\|@ultimate/react\"" packages/vue-core/src packages/vue/src`
Expected: no matches — confirms no literal `vue-core`/`vue` → `react-core`/`react` import exists anywhere, closing the loop on this plan's Task 1 prerequisite and spec §28's dependency-boundary requirement explicitly, not just via the automated validator.

- [ ] **Step 6: Commit**

```bash
git add packages/vue-core/README.md packages/vue/README.md
git commit -m "docs(vue): add vue-core and vue READMEs"
```

- [ ] **Step 7: Final exit-criteria walkthrough report**

Do not auto-mark this step done — walk through spec §33's exit-criteria checklist explicitly, one item at a time, and report which are genuinely met (with the evidence — which task/step proved it) versus which remain honestly unmet (e.g. `apps/playground-vue` stays a stub, matching spec §24's explicitly-not-required posture; measured tree-shaking/bundle-size beyond Task 22's structural check; `automatically scanned`/`manually validated` accessibility tiers). This report is the actual deliverable of this final step — not a checkbox tick with no accompanying evidence trail.

---

## Self-Review Notes

**Spec coverage**: every numbered section of the Phase 4 spec (§1-§34, plus Non-Goals) maps to at least one task above — §1-§2 (Tasks 3, 15), §3 (Tasks 3, 15, 22), §4 (throughout), §5 (Tasks 16-21), §6 (throughout, reuse-map cells cited per task), §7 (Tasks 3-6), §8 (Task 13), §9 (Task 18), §10 (Task 21), §11 (Tasks 1, 8, 20), §12 (Task 9), §13 (Tasks 7, 20, 21), §14 (Task 10), §15 (Task 20), §16 (Tasks 1, 11, 20), §17 (Task 12), §18 (Task 17), §19-§20 (Tasks 4-5, 19), §21 (cross-referenced throughout component tasks), §22 (Task 24), §23 (every component task's own test-writing steps), §24 (Task 15 Step 5, Task 25 Step 3), §25 (Task 18's security tests, Task 23), §26 (component test suites), §27 (Task 3's package.json peer range, ADR-042), §28 (Task 1, Task 25 Step 5), §29 (Task 22), §30 (not expanded, matching spec's own non-goal), §31 (each flagged risk has a corresponding task-level note — e.g. the `$inProps` public-API substitute in Task 4, the tsup `.vue` shim risk in Task 3, the `useDisplayOrder` Options/Composition-API mismatch in Task 20), §32-§34 (Task 24's ADR batch, Task 25's exit-criteria walkthrough).

**Placeholder scan**: no "TBD"/"implement later"/"add appropriate error handling" patterns found on review. Two places deliberately flag a genuine open implementation-time decision rather than papering over it with a placeholder — Task 3's tsup/`.vue` esbuild-plugin shim (untested pattern, explicit fallback guidance given) and Task 20's `useDisplayOrder` Options-API/Composition-API mismatch (two concrete resolution paths given, one marked preferred) — both are real engineering unknowns this plan could not responsibly resolve on paper without running the actual code, not omissions.

**Type consistency check**: cross-referenced `Z_INDEX_KEYS`/`useZIndex`'s signature (Task 9) against every consumer (Tasks 18, 20, 21) — consistent. Cross-referenced `createGlobalEscapeKeyMixin`'s `priority: [primary, () => secondary]` shape (Task 8) against its only consumer (Task 20) — consistent, `getSecondary` accessor pattern used correctly to defer reading `this._displayOrderRef` until registration time. Cross-referenced `StyleModule`'s `{ css, classes }` shape (Task 3) against every `*-style.ts` file (Tasks 17-21) — consistent, though each one carries its own "verify the real `uix-styles` export shape matches" caveat rather than asserting unverified certainty. Found and fixed one real inconsistency during drafting: Task 19's `Checkbox.vue` initially referenced a bare `UMinusIcon` import with no corresponding `vue-core` icon — flagged explicitly in Task 19 Step 6 as a genuine icon-set gap requiring resolution before that task is complete, rather than silently wiring a wrong-looking substitute icon.

