# Specification — Approved-Design Implementation: SSR Style Injection, Shared Hidden-Accessible Utility, Angular Barrel Re-exports (GAP-078, GAP-074, GAP-081)

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-10-03
**Branch:** `feature/prime-parity-approved-designs` (from `main` `cdcc65e`)
**Origin:** approved designs in `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §2–§4, user decisions §7.2–§7.4 (2026-10-02), and the post-merge inventory (2026-10-03). Parity baseline: ADR-048.

**Required sequence:** Decision (approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.** It does not restate the research; it fixes scope, files, order and acceptance for the approved designs.

---

## 1. Purpose and Scope

**Purpose:** implement the three already-decided Prime-parity follow-ups in one phase.

**In scope:**

- **GAP-078:** Angular per-document style injection, plus documentation of the React/Vue client-only contract.
- **GAP-074:** one shared `u-hidden-accessible` utility.
- **GAP-081:** Option 1 Angular barrel re-exports.

**Out of scope:**

- GAP-064 (Aura coverage) and GAP-082 (typed Vue props).
- A server-side CSS collector for React or Vue.
- Adding `UInputNumber` to the Angular barrel. It is exported only from its subpath today; adding it would be new API, which Option 1 does not include.
- Any new `@ultimate/ng` subpath.
- Restructuring the 19 barrel-only components into secondary entries (Option 2 was rejected).
- Newer commercial Prime releases (ADR-048).

---

## 2. Approved Decisions This Specification Implements

1. **GAP-078 (scope lock §3, decision §7.3).**
   - Angular style registration targets the injected `DOCUMENT`, with registration scoped per document.
   - Each style key is emitted once per document, and server-rendered styles are reused on hydration.
   - No browser globals are touched on the server.
   - React and Vue stay client-only, which is documented.
   - No shared abstraction beyond `uix-styled`'s existing `StyleSheet`.
2. **GAP-074 (scope lock §4, decision §7.4).**
   - One shared `u-hidden-accessible` rule lives in `@ultimate/uix-styled`.
   - It is registered once per document through each core's existing `StyleSheet` path, independent of whether a theme is applied, and follows the GAP-078 contract.
   - No component-local copies; `u-hidden-focusable` stays an unstyled marker.
3. **GAP-081 (DECISION-F Option 1, decision §7.2).**
   - The barrel re-exports the existing secondary entries by package specifier, and the 13 cross-directory relative imports become package-specifier imports.
   - Existing barrel and subpath imports keep working, and the `exports` map stays accurate.
   - A TypeScript path mapping, used only for development tooling, resolves `@ultimate/ng/*` to source. Its location is widened in §5.4.

---

## 3. Order and Interaction

Implementation order: **GAP-078 → GAP-074 → GAP-081**.

- **GAP-074 depends on GAP-078 in Angular.** The shared rule is registered through the same Angular style path that GAP-078 makes per-document. So in Angular the rule is written into the server-rendered document and adopted on hydration, exactly like component CSS. Implementing GAP-074 first would place the rule in the process-global sheet that GAP-078 replaces.
- **In React and Vue** the shared rule follows each core's existing client-only path, so it has no dependency on GAP-078 there.
- **GAP-081 is independent.** It touches only `packages/ng/src/index.ts`, 13 import sites and `packages/ng/tsconfig.json`, none of which GAP-078 or GAP-074 change. It comes last so its packaging verification runs on the final code.

---

## 4. GAP-078 — Angular per-document style injection

### 4.1 Current behavior (verified on `cdcc65e`)

- `packages/ng-core/src/basecomponent/style-sheet.ts:16-33`: a single module-level `ngCoreStyleSheet` creates `<style>` elements in the global `document.head`, guarded only by `typeof document`. It sets no key attribute (`attrs` empty), so an existing element cannot be found again.
- `UBaseComponent.ngOnInit` (`base-component.ts:49-58`) registers theme variables and component CSS into that singleton. `UBaseComponent` already injects `DOCUMENT` (`:21`) and `PLATFORM_ID` (`:22`).
- `uix-utils` `createStyleElement`/`createElement` use the global `document` and only create elements, never reuse them.
- `registerThemeVariables(sheet, componentName)` (`uix-styled/src/stylesheet/theme-variables.ts:46`) already takes the sheet as a parameter.

### 4.2 Required behavior

1. Angular keeps one style registry **per `Document`** (for example a `WeakMap<Document, sheet>` inside `ng-core`). `UBaseComponent` registers theme variables and component CSS into the registry of its injected `DOCUMENT`; the global `document` is never used.
2. Each Angular `<style>` element carries a stable key attribute identifying its style key (e.g. `data-u-style="<key>"`). Before creating an element, the registry looks for an existing `<style>` with that key in the injected document's `head`. If one exists (server-rendered HTML being hydrated) it is adopted, not duplicated.
3. Server rendering: styles are written into the per-request document, so the server HTML contains the common theme variables and the CSS of every component rendered. Nothing leaks between requests or documents.
4. A key registered twice in the same document produces one element.
5. React and Vue are unchanged in behavior. A short contract note is added (to `packages/react-core` and `packages/vue-core` documentation, or `docs/architecture/MIGRATION.md`; the Plan picks the existing home): server output contains no component CSS, injection happens on first client mount, and unstyled content before hydration is accepted.

### 4.3 Affected files

- `packages/ng-core/src/basecomponent/style-sheet.ts` and `base-component.ts`, plus their specs.
- The React/Vue contract note.
- `apps/playground-angular` SSR e2e (`apps/playground-angular/e2e/ssr-hydration.spec.ts`). It currently states that no `<style>` presence is asserted; this Spec intentionally changes that for Angular.

### 4.4 API

No public API change. The per-document registry and the key attribute are internal to `ng-core`. `ngCoreStyleSheet` is exported from `ng-core`, and tests outside `ng-core` read it to inspect registered CSS: `packages/ng/src/{button,paginator,table}/*.spec.ts` and `packages/themes/test/cross-framework-consistency.test.ts`. Production code outside `ng-core` does not use it; only `ng-core`, `react-core` and `vue-core` README prose mentions it. The Plan keeps these tests working by giving them a supported way to read the registry for a given document (for example, keeping `ngCoreStyleSheet` as the registry for the test document), without adding public API beyond what already exists.

---

## 5. GAP-074 — shared `u-hidden-accessible`

### 5.1 Current behavior (verified on `cdcc65e`)

No stylesheet defines a shared rule. Usages:

- `p-hidden-accessible`: Angular `packages/ng/src/rating/rating.ts:45`, Vue `packages/vue/src/rating/Rating.vue:9`.
- `u-hidden-accessible`: React `packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx:93`; focus-trap sentinels `packages/react-core/src/focus-trap/focus-trap.tsx:65,75`, `packages/vue-core/src/focus-trap/focus-trap.ts:33` (with `u-hidden-focusable`).
- Vue Password's local rule: `packages/vue/src/password/password-style.ts:77-78,129` (`u-password-hidden-accessible`).

### 5.2 Required behavior

1. `@ultimate/uix-styled` provides the rule as one CSS string: PrimeNG 21.1.9 `basestyle.ts:8-22` `.p-hidden-accessible` plus its `input, select { transform: scale(0) }` companion, renamed to `u-`. It also provides a single registration helper that adds the rule to a given `StyleSheet` under one reserved key.
2. `ng-core` (`UBaseComponent.ngOnInit`), `react-core` (`useComponentStyle`) and `vue-core` (`registerComponentStyle`) call that helper from the same place they already register component CSS, whether or not a theme is applied. The reserved key makes it once per sheet: per document in Angular (§4), per page in React and Vue.
3. Angular and Vue Rating switch from `p-hidden-accessible` to `u-hidden-accessible`.
4. Vue Password uses `u-hidden-accessible` and its local `u-password-hidden-accessible` rule and class mapping are removed.
5. React TriStateCheckbox and the React/Vue focus-trap sentinels need no class or API change; they become styled.
6. `u-hidden-focusable` gets no CSS. It stays a selector marker, as in Prime.

### 5.3 API

One new export from `@ultimate/uix-styled`: the registration helper, plus the CSS string if the helper alone is not enough. This is unavoidable, because all three core packages must share one definition and `uix-styled` is the only styling package they all already depend on (`ng-core`, `react-core`, `vue-core` `package.json`). No component API changes.

### 5.4 Affected files

- `packages/uix-styled/src`: the new rule, helper and index export.
- `ng-core` `base-component.ts`; `react-core` `styling/use-component-style.ts`; `vue-core` `styling/vue-style-sheet.ts`.
- `packages/ng/src/rating/rating.ts`; `packages/vue/src/rating/Rating.vue`.
- `packages/vue/src/password/password-style.ts`, `Password.vue`.
- Specs alongside each.

---

## 6. GAP-081 — Angular barrel re-exports (Option 1)

### 6.1 Current behavior (verified on `cdcc65e`)

- `packages/ng/src/index.ts` re-exports all 88 directories by relative path, so the primary bundle inlines every component.
- 70 secondary entries exist (`packages/ng/*/ng-package.json`).
- 13 relative imports cross into secondary-entry directories, across 11 files: `button.ts`, `menu.ts` (×2), `input-text.ts`, `textarea.ts`, `overlay-badge.ts`, `select-button.ts`, `table.ts` (×2), `data-view.ts`, `order-list.ts`, `pick-list.ts`, `file-upload.ts`.
- Spike measurement (scope lock §2): 86 of 105 primary-bundle classes are duplicated in a subpath, and the barrel and subpath give a different class for 0 of 6 samples, with `NG0912` collisions.

### 6.2 Required behavior

1. In `packages/ng/src/index.ts`, each of the 69 barrel exports that has a secondary entry becomes `export * from "@ultimate/ng/<entry>"`. The 19 barrel-only components keep their relative exports. No export is removed or added, so `UInputNumber` stays subpath-only (§1).
2. The 13 cross-directory relative imports become `@ultimate/ng/<entry>` imports.
3. The `exports` map in `packages/ng/package.json` is unchanged; the 70 existing entries are already listed.

### 6.3 Widened implementation detail: path-mapping location

The approved decision says "test-only path mapping", which is what the spike used (`tsconfig.spec.json`). Current evidence shows that is not enough.

**Why not enough:**

- CI runs `pnpm run typecheck` **before** `pnpm run build` (`.github/workflows/ci.yml:52`, `:55`). `packages/ng`'s `typecheck` is `tsc --noEmit` on `tsconfig.json`.
- After this change, `src` imports `@ultimate/ng/<entry>`. That resolves through the workspace symlink to `dist` types, which do not exist yet when typecheck runs.
- Storybook (`tsconfig.storybook.json`) has the same problem.

**Required:** the `@ultimate/ng/*` → `src/*/index.ts` mapping is placed in `packages/ng/tsconfig.json`, which `tsconfig.spec.json` and `tsconfig.storybook.json` both extend. It covers tests, typecheck and Storybook in one place.

**This does not narrow or widen Option 1's behavior.** The mapping is still used only by development tooling and never by the published build:

- `packages/ng`'s `build` script is `ng-packagr -p ng-package.json`, with no `-c`. Without `-c`, `ng-packagr` uses its bundled `tsconfig.ngc.json` (`ng-packagr/src/lib/ts/tsconfig.js:45-82`) and does not read `packages/ng/tsconfig.json`.
- Option 1's published output (the spike's variant 2) is therefore unchanged. The Plan must prove this by comparing build output with and without the mapping.

### 6.4 Affected files

- `packages/ng/src/index.ts`.
- The 11 importing files in §6.1.
- `packages/ng/tsconfig.json`.
- No `exports` change.

---

## 7. Intentional Divergences That Must Remain Unchanged

- React and Vue emit no component CSS on the server. That is the documented contract and matches PrimeReact 10.9.9 and PrimeVue 4.5.5.
- `UInputNumber` stays subpath-only.
- The 19 barrel-only Angular components stay barrel-only.

---

## 8. Acceptance Criteria

| Criterion                                                                                                                                                                                                                             | Traces to      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Unit: under a server `PLATFORM_ID` with a provided `DOCUMENT`, Angular writes theme and component styles into that document and never touches the global `document` (spy-based)                                                       | GAP-078        |
| Unit: two different documents each receive their own styles; registering the same key twice in one document yields one element                                                                                                        | GAP-078        |
| Unit: when a document already contains a keyed `<style>`, registration adopts it and creates no duplicate                                                                                                                             | GAP-078        |
| E2E (`ng-ssr-chromium`): the raw server HTML contains the theme-variable and component `<style>` elements; after hydration each key occurs exactly once                                                                               | GAP-078        |
| React/Vue: a Node server render (no global `document`) does not throw and emits no `<style>`; existing jsdom style tests pass unchanged; contract note added                                                                          | GAP-078        |
| The shared rule is registered exactly once per sheet in all three cores, with and without a theme applied; in Angular it appears in server HTML (via GAP-078)                                                                         | GAP-074        |
| Angular/Vue Rating carry `u-hidden-accessible` and no `p-hidden-accessible`; Vue Password uses the shared class and its local rule is gone; no source file still uses `p-hidden-accessible`; `u-hidden-focusable` has no CSS          | GAP-074        |
| A real-browser check confirms a hidden-accessible element is visually hidden (1×1, clipped) but stays in the accessibility tree                                                                                                       | GAP-074        |
| The primary `@ultimate/ng` bundle shares no component class with any subpath bundle; barrel and subpath imports give the same class (`===`); no `NG0912` collision for duplicated classes                                             | GAP-081        |
| `pnpm --filter @ultimate/ng run typecheck` passes **with no prior build**; Storybook builds; `ng-packagr` output is identical with and without the `tsconfig.json` mapping apart from the intended re-export changes                  | GAP-081 (§6.3) |
| `integrity:pack-install @ultimate/ng` passes; the `exports` map is unchanged; no barrel export added or removed                                                                                                                       | GAP-081        |
| Full unit suites pass for `ng`, `ng-core`, `react`, `react-core`, `vue`, `vue-core` and `uix-styled`; existing visual baselines pass, and any baseline that changes is explained; touched files gain no new prettier or lint failures | All            |

---

## 9. Evidence/Source References

- `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §2–§4, §7
- `docs/architecture/BLUEPRINT_GAPS.md` GAP-074, GAP-078, GAP-081 and DECISION-F
- ADR-048
- Files cited in §4.1, §5.1 and §6.1
- `.github/workflows/ci.yml`
- `ng-packagr` 21.2.7 `src/lib/ts/tsconfig.js`
- PrimeNG 21.1.9 `src/base/style/basestyle.ts` and `src/usestyle/usestyle.ts` (`.vendor-cache/`)

---

## 10. Explicit Out-of-Scope Items

- GAP-064 and GAP-082
- A React/Vue server CSS collector
- `UInputNumber` in the barrel, new subpaths, Option 2 restructuring
- Inherited repository debt (manifest, format, lint)
- Newer commercial Prime releases
