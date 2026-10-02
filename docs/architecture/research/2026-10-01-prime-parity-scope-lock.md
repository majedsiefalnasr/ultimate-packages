# Prime-parity scope lock — post-closeout decisions and spike evidence

**Date:** 2026-10-01
**Boundary:** `feature/prime-parity-audit-gaps` is finally closed at `865be73`; this note does not reopen it. Evidence was gathered at `865be73`.
**Status:** research and proposals for user approval. No implementation, no GAP status change.

## 1. Parity baseline

Recorded as ADR-048 (`docs/architecture/DECISIONS.md`). The pinned last-MIT Prime versions (PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5, `@primeuix/*` as pinned in `PROVENANCE.md`) are the normative parity baseline. As of 2026-10-01 the current majors (PrimeNG 22.1.2, PrimeVue 5.0.2, PrimeReact 11.2.0, `@primeuix/themes`/`@primeuix/styles` 3.0.1) ship under the commercial "PrimeUI License" and are reference only. For the remaining GAPs, the newer releases were read only to confirm the behavior still exists upstream (all still do); they create no new GAPs.

## 2. GAP-081 / DECISION-F spike — package-specifier re-exports

**Question:** can the Angular primary barrel re-export secondary-entry components by package specifier (`@ultimate/ng/<name>`) without reproducing GAP-070's relative-import/`rootDir` failure, and does that remove duplicate classes?

**Method:** a scratch worktree at `865be73` (since removed; nothing committed). `@ultimate/ng` built with `ng-packagr` under Node 20.19.2. Duplication was measured by comparing `class` declarations in `fesm2022/ultimate-ng.mjs` against every subpath bundle. Class identity was measured by a Node ESM consumer resolving through the package's `exports` (`import("@ultimate/ng")` vs `import("@ultimate/ng/<name>")`, `===`).

| Variant                                                                                                                      | Build          | Primary-bundle classes duplicated in a subpath | Primary bundle                 | Barrel `===` subpath (6 classes)                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Baseline (`865be73`)                                                                                                         | OK             | 86 of 105                                      | 1,187.7 KB                     | 0/6, plus Angular `NG0912` "Component ID generation collision" warnings for `UBadge`, `UPaginator`, `UListbox` |
| 1: barrel re-exports the 69 subpath components by package specifier                                                          | OK             | 9                                              | 424.6 KB                       | —                                                                                                              |
| 2: as 1, plus the 13 relative imports of subpath components inside barrel-only components switched to package specifiers     | OK             | 0                                              | 333.8 KB                       | 6/6, no warnings                                                                                               |
| 5: every remaining barrel-only component (19) also given a secondary entry, all cross-directory imports by package specifier | OK, 89 entries | 0                                              | 3.5 KB (pure re-export barrel) | 6/6                                                                                                            |

**Findings:**

1. Package-specifier re-exports work. `ng-packagr` builds the primary entry after the secondary entries it imports, and the barrel then imports instead of inlining. GAP-070's failure is specific to relative imports that leave an entry's own directory.
2. Barrel re-exports alone (variant 1) are not enough. Nine subpath components are also imported relatively by barrel-only components (`badge`←overlay-badge; `fluid`←input-text, textarea; `listbox`←order-list, pick-list; `paginator`←data-view, table; `progress-bar`←file-upload; `ripple`←button, menu; `scroller`←table; `toggle-button`←select-button; `tooltip`←menu). Those imports must also use package specifiers (variant 2).
3. With package-specifier imports, every component builds as a secondary entry (variant 5), including `button`, `dialog`, `menu` and `table`, which GAP-009 recorded as permanently excluded. That exclusion's cause was the same relative-import trigger GAP-070 corrected.
4. Consumer packaging: `integrity:pack-install @ultimate/ng` passed for variants 2 and 5; the Angular SSR playground built for variant 5. The only prerender error was GAP-080's existing `ResizeObserver` error.
5. Development cost: inside `packages/ng`, a package specifier resolves through the package's own `exports` to `dist`. Unit tests then need a prior build, and 4 template type errors (`TS2322`, `overlay-badge`, `menu`, `input-number`) appeared against the emitted declarations. Adding a test-only `paths` mapping (`@ultimate/ng/*` → `src/*/index.ts` in `tsconfig.spec.json`) restored 899/899 passing tests without a prior build.
6. Publishing: the spike resolved new subpaths through ng-packagr's generated `dist/package.json`. A real implementation must also list every entry in the hand-written `packages/ng/package.json` `exports` map.
7. Side observation: `UInputNumber` is exported only from its subpath, not from the barrel (also true on `main`), so a subpath-only export already exists.

**Evidence for each DECISION-F option:**

| Option                                         | Removes duplicates?                                                              | Work implied                                                                                                                 | Notes                                                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Barrel re-exports subpaths                  | Yes, if internal cross-directory imports also use package specifiers (variant 2) | Rewrite barrel exports and 13 internal imports; test `paths` mapping; no `exports` change for the existing 70                | Both import styles keep working with one class identity. Barrel-only components stay barrel-only.                                           |
| 2. PrimeNG-style subpath-only                  | Yes (variant 5 with an empty or re-export-only barrel)                           | As 1, plus 19 new entries and `exports` entries. Removing the barrel's own exports would be a breaking change for consumers. | Matches PrimeNG 21.1.9 and 22.x, whose primary `primeng` entry is empty (37 bytes). Variant 5's 3.5 KB re-export barrel is a middle ground. |
| 3. Current model + one documented import style | No — duplication remains; relies on consumers never mixing styles                | Documentation only                                                                                                           | The `NG0912` collisions and `instanceof`/DI mismatches stay reachable.                                                                      |

## 3. GAP-078 — proposed SSR styling contract

**Current behavior:** `ng-core`, `react-core` and `vue-core` each keep a module-level `StyleSheet` that writes `<style>` elements into the global `document.head`, guarded by `typeof document`. React registers in `useMountEffect` and Vue in `mounted()`, so both are client-only. Angular registers in `ngOnInit`, which also runs on the server, where the guard skips it. No framework emits component or theme CSS into server HTML.

**Baseline Prime:** PrimeNG 21.1.9's `UseStyle` writes into the injected `DOCUMENT` (`usestyle.ts:9,19,25`), which is per-request under server rendering. PrimeVue 4.5.5's `useStyle` (`UseStyle.js:21`) and PrimeReact 10.9.9's `useStyle` (`useStyle.js:12`) use `window.document` only on the client. PrimeVue offers server CSS separately, through `getStyleSheet()` collectors consumed by its Nuxt module. Ultimate's `uix-styled` already ports `getStyleSheet`/`getCommonStyleSheet`, but nothing consumes them.

**Proposed contract.** "SSR-safe style injection" for Ultimate means:

1. No server-executed path touches a browser global (already true; GAP-065/GAP-080 cover component code).
2. Styles are written only into the document of the current render, never a process-global object.
3. Registration state is scoped to that document, so nothing leaks between requests.
4. Each style key appears at most once per document, including after hydration: the client adopts a server-emitted `<style>` with the same key instead of adding a second one.

Per framework:

- **Angular (parity with PrimeNG, implementation required):** style registration targets the `DOCUMENT` injected into `UBaseComponent`, and registration state is tracked per document instead of in the module singleton. Server HTML then contains the common theme variables and the style of every component rendered, before first paint. On hydration the client reuses those elements by their key attribute.
- **Vue and React (no implementation; documented contract):** client-only injection stays, matching the PrimeVue/PrimeReact baseline. Server output carries no component CSS. Styles are injected once on first client mount, and unstyled content before hydration is accepted and documented. A server-side collector built on `uix-styled`'s `getStyleSheet` is not proposed now: no React or Vue SSR consumer exists beyond the minimal harnesses.

**Shared abstraction:** not justified beyond what exists. The shared piece is already `uix-styled`'s `StyleSheet`; only Angular's target document and registration scope change.

**Tests that would prove it:**

- _Angular unit:_ under a server `PLATFORM_ID` with a provided `DOCUMENT`, styles land in that document and the global `document` is never touched (spy-based, as in GAP-065). Two documents each receive their own styles. Registering the same key twice in one document yields one element.
- _Angular e2e_ (existing `ng-ssr-chromium` harness): the raw server HTML contains the proof-set components' `<style>` elements and the common theme variables. After hydration, each style key occurs exactly once.
- _React and Vue:_ a Node-environment server render (`renderToString` / `createSSRApp`) with no global `document` does not throw, emits no `<style>`, and leaves the style sheet empty. The existing jsdom tests continue to cover client injection.

## 4. GAP-074 — proposed accessibility CSS architecture

**Recommendation: one shared utility, `u-hidden-accessible`, registered once per document by each core package.**

- **Why shared:** baseline Prime defines `.p-hidden-accessible` once, in each framework's base style that every component loads (PrimeNG `basestyle.ts:8-22`, PrimeVue `BaseStyle.js`). Ultimate's usages span three frameworks and two core packages (focus-trap sentinels in `react-core`/`vue-core`), which component-local rules cannot cover without duplication. The one component-local rule that exists (Vue Password's `u-password-hidden-accessible`, GAP-061) would become a second, competing mechanism if kept.
- **Name:** `u-hidden-accessible`. Ultimate renames Prime's component and utility classes from `p-` to `u-` and keeps `p-` only for state classes (`p-invalid`, `p-disabled`, `p-filled`, `p-focus`). Hidden-accessible is a utility, and 3 of the 5 existing usages already use `u-`.
- **Where:** one framework-neutral CSS string in `@ultimate/uix-styled`, which all three core packages already depend on (`@ultimate/uix-styles` is not a core dependency). It is registered through each core's existing `StyleSheet` under a reserved key, from the same registration point components already use, independent of whether a theme is applied. It therefore follows GAP-078's contract automatically.
- **Rule content:** PrimeNG 21.1.9's `.p-hidden-accessible` block plus its `input, select { transform: scale(0) }` companion, renamed.
- **Exact scope:**
  - Add the shared rule and its registration in `ng-core`, `react-core` and `vue-core`.
  - Switch Angular `rating.ts:45` and Vue `Rating.vue:9` from `p-hidden-accessible` to `u-hidden-accessible`.
  - React `tri-state-checkbox.tsx:93` and the `react-core`/`vue-core` focus-trap sentinels need no class change; they become styled.
  - Migrate Vue Password from its local rule to the shared class and remove the local rule.
  - `u-hidden-focusable` stays an unstyled marker, as in Prime.
  - Add tests asserting the shared rule is registered and each usage carries the class.

## 5. GAP-064 — reconciled remaining scope

A component re-themes only when two things hold. Its structural CSS must call `dt('<key>.…')`, directly or through an imported `@ultimate/uix-styles` module. And the name it registers styles under must equal the preset key exactly: `Theme.getComponent(name)` reads `preset.components[name]` with no normalization (`uix-styled/src/utils/themeUtils.ts:248`). Measured statically at `865be73` against the 76 registered modules and the 88 component modules of `@primeuix/themes` 2.0.3:

| Class                                          | Angular                                                                                                                                                                                                        | Vue                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Covered (resolves today)                       | autocomplete, button, checkbox, dialog, listbox, menu, password, rating, select, slider, textarea, tooltip (12)                                                                                                | same 12                       |
| Key mismatch — fix is a name/key mapping       | cascade-select, color-picker, date-picker, file-upload, float-label, icon-field, ifta-label, input-number, input-otp, input-text, multi-select, radio-button, select-button, toggle-button, toggle-switch (15) | same 15 plus input-chips (16) |
| Missing module, CSS already token-based        | badge, inputgroup, paginator                                                                                                                                                                                   | same                          |
| Missing module, out of scope by decision       | datatable (Table Plan), virtualscroller                                                                                                                                                                        | same                          |
| Hand-written CSS, module registered but unused | 46 components                                                                                                                                                                                                  | 48 components                 |
| Not ported, no Angular/Vue consumer            | tabview, tabmenu (React `UTabView`/`UTabMenu` only); ripple (undecided)                                                                                                                                        | same                          |

React consumes no tokens: its style files are hand-written static CSS, the accepted `ROADMAP.md` footnote exception. React is therefore outside GAP-064 unless that exception is revisited.

The key-mismatch components' token references currently resolve to nothing in Angular and Vue (on `main` and on the closed branch). Fixing the mapping changes their rendering, so it needs visual verification.

## 6. Locked implementation families (candidate scope, unprioritized)

| Family                          | GAPs                                                                                      | Connection to the parity audit                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| F1 Tabs / Navigation            | GAP-071 (plus the `tab-list.ts:10` comment fix), GAP-072, GAP-073                         | Found during GAP-057/GAP-053; each compares against baseline PrimeNG/PrimeVue behavior |
| F2 Form / Accessibility         | GAP-075, GAP-076 (Vue only)                                                               | Found in the GAP-059/GAP-061 reviews                                                   |
| F3 Vue Stepper                  | GAP-077                                                                                   | Split out of GAP-063                                                                   |
| F4 SSR                          | GAP-080, plus the real CI SSR build-order verification (operational, not part of the GAP) | Same defect class as GAP-065                                                           |
| F5 Vue declarations / packaging | GAP-079, plus the `.stories.d.mts` and source-map follow-ups                              | Vue remainder of GAP-068                                                               |

Decision items, not implementation scope until approved: DECISION-F/GAP-081 (§2), GAP-078 (§3), GAP-074 (§4), GAP-064's next tranche (§5).

## 7. User decisions (2026-10-02)

1. **Parity baseline:** ADR-048 approved as written.
2. **DECISION-F:** Option 1. The barrel re-exports the existing secondary entries by package specifier, and the 13 cross-directory relative imports become package-specifier imports. Existing barrel and subpath imports keep working, a test-only path mapping is added, and the hand-written `exports` map stays accurate. Target: no duplicate component classes, no duplicate-class `NG0912` collisions, and pack/install integrity intact. Option 2 (subpath-only, no barrel removal) and Option 3 are rejected. GAP-081 is implemented later, in its own packaging Spec and Plan.
3. **GAP-078:** §3's contract approved.
   - Angular: target the injected `DOCUMENT`, scope registration per document, emit each style once per document, and reuse server styles on hydration. Tests must cover multiple documents, duplicate registration, server rendering and hydration reuse.
   - React and Vue: client-only and documented; no server-side collector.
   - Not in the next implementation phase.
4. **GAP-074:** §4's architecture approved (one shared `u-hidden-accessible` registered through `@ultimate/uix-styled`, following the GAP-078 registration contract; no component-local copies). Not in the next implementation phase.
5. **GAP-064:** stays PARTIAL. §5's reconciled scope is kept for a later dedicated theming phase with its own visual verification; nothing from it is implemented now, including the naming-mapping fix.
6. **GAP-076:** Vue only; no Angular Password GAP.
7. **Minor observations:** as recorded under GAP-071/GAP-072; no new GAPs.
8. **Next implementation phase:** exactly F1–F5 (§6). GAP-064, GAP-074, GAP-078 and GAP-081 are excluded from it.
9. **Process:** five Specs (one per family), Spec Review, five Plans, Plan Review, then Implementation. The phase starts from `main` after `feature/prime-parity-audit-gaps` has been merged.
