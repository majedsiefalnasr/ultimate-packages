# GAP-094 backfill batch 3: evidence record (Divider, Toolbar)

**Date:** 2026-10-16
**Base:** `main` `4c932c417e68c17cab4618bd9027b0ce7d6cecbd`, verified against GitHub. Its CI run [38935468313](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38935468313) fails only "Provenance validation": the diff check passes, and the failures are the 661 missing manifest entries.
**Authority:** ADR-064, ADR-065, the GAP-094 Specification §3.4 and Amendment A1, and the [batch 3 Plan](../../superpowers/plans/2026-10-16-gap-094-backfill-batch-3.md).

## Inventory at the base

The full local validator output lists 661 missing production files: ng 168, react 222, vue 271. Divider and Toolbar account for 16 of them.

## Method

- **Upstream archives.** Fetched with `pnpm run vendor:fetch` (SHA-256 verified):
  - PrimeNG 21.1.9 at `c493b1c6`;
  - PrimeReact 10.9.9 at `d0f574e3`;
  - PrimeVue 4.5.5 at `66dde678`;
  - `@primeuix/styles` 2.0.3.
- **Lineage.** Divider was added in `c42f709d`, Toolbar in `be9f35e4` (Phase C Batch 1 Plan §7, Divider row 217 and Toolbar row 234). The only later commit is `f146ea8c` (GAP-082), which only wraps `BaseDivider.ts` and `BaseToolbar.ts` in `defineComponent`.
- **Classification.** ADR-064 is applied to each entry on its own comparison:
  - COPY means retained upstream wording, statements or structure;
  - REFERENCE means only interface facts are shared: public names, standard APIs, standard ARIA, equivalent output;
  - genuine uncertainty is resolved to COPY and stated;
  - index files follow the A1 barrel rule. Each component's same-named upstream entry (`public_api.ts`, or a `package.json` in PrimeReact and PrimeVue) shares only the component export, so they are REFERENCE.
- **ADR-065 boundary.** For each React style module, every one of the 56 pinned PrimeReact themes was compared. A file whose values match pinned theme CSS is held.

## Evidence table (14 entries)

| File                         | Class                 | `modificationStatus`         | Compared upstream                      | Evidence                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | --------------------- | ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ng `divider/divider.ts`      | COPY                  | adapted                      | `primeng/src/divider/divider.ts`       | Same template (a `cx('content')` div around ng-content). Same host `role="separator"` and `aria-orientation` bound to layout. Doc text verbatim: "Specifies the orientation." Default `'horizontal'`.                                                                                                                                |
| ng `divider/index.ts`        | REFERENCE             | reimplemented-with-reference | `primeng/src/divider/public_api.ts`    | Upstream has two `export *` (component, style); ours has one named component re-export.                                                                                                                                                                                                                                              |
| ng `toolbar/toolbar.ts`      | COPY                  | adapted                      | `primeng/src/toolbar/toolbar.ts`       | Same template structure: ng-content, then start/center/end divs rendering ContentChild templates through `ngTemplateOutlet`. Same host `role="toolbar"` and `aria-labelledby`. Doc text verbatim: "Defines a string value that labels an interactive element."                                                                       |
| ng `toolbar/index.ts`        | REFERENCE             | reimplemented-with-reference | `primeng/src/toolbar/public_api.ts`    | As above, with three `export *` upstream.                                                                                                                                                                                                                                                                                            |
| react `divider/divider.tsx`  | REFERENCE             | reimplemented-with-reference | `components/lib/divider/Divider.js`    | Every statement rewritten. Shared: standard ARIA, the layout prop and equivalent root/content output.                                                                                                                                                                                                                                |
| react `divider/index.ts`     | REFERENCE             | reimplemented-with-reference | `components/lib/divider/package.json`  | Entry manifest only.                                                                                                                                                                                                                                                                                                                 |
| react `toolbar/toolbar.tsx`  | REFERENCE             | reimplemented-with-reference | `components/lib/toolbar/Toolbar.js`    | Every statement rewritten. Shared: `role="toolbar"`, the public `start`/`center`/`end` props and equivalent slot output.                                                                                                                                                                                                             |
| react `toolbar/index.ts`     | REFERENCE             | reimplemented-with-reference | `components/lib/toolbar/package.json`  | Entry manifest only.                                                                                                                                                                                                                                                                                                                 |
| vue `divider/Divider.vue`    | COPY                  | adapted                      | `primevue/src/divider/Divider.vue`     | Kept: the root `role="separator"` with `aria-orientation`, and the content wrapper `<div v-if="$slots.default" :class="cx('content')">` around the default slot.                                                                                                                                                                     |
| vue `divider/BaseDivider.ts` | REFERENCE             | reimplemented-with-reference | `primevue/src/divider/BaseDivider.vue` | Shares only the public `layout` prop (String, default `'horizontal'`).                                                                                                                                                                                                                                                               |
| vue `divider/index.ts`       | REFERENCE             | reimplemented-with-reference | `primevue/src/divider/package.json`    | Entry manifest only.                                                                                                                                                                                                                                                                                                                 |
| vue `toolbar/Toolbar.vue`    | COPY (ambiguity rule) | adapted                      | `primevue/src/toolbar/Toolbar.vue`     | The root line is kept token for token apart from pt: `:class="cx('root')" role="toolbar" :aria-labelledby="ariaLabelledby"`, including PrimeVue's own `ariaLabelledby` spelling. Also kept: a div with `cx('start'/'center'/'end')` around each named slot. Uncertainty stated: these are standard attributes and public slot names. |
| vue `toolbar/BaseToolbar.ts` | REFERENCE             | reimplemented-with-reference | `primevue/src/toolbar/BaseToolbar.vue` | Shares only the public `ariaLabelledby` prop (String, default `null`).                                                                                                                                                                                                                                                               |
| vue `toolbar/index.ts`       | REFERENCE             | reimplemented-with-reference | `primevue/src/toolbar/package.json`    | Entry manifest only.                                                                                                                                                                                                                                                                                                                 |

## Held for a separate decision (ADR-065): 2 React style modules

These files get no entry, and both stay validator failures (fail-closed). Each retains rule-by-rule declarations from its `components/lib` base style, which on its own would be COPY. Each also retains literal values that match pinned PrimeReact theme CSS outside `components/lib/`. ADR-065 does not authorize theme sources beyond its two named files, so classifying these files needs a separate decision.

| File                                          | Retained from `components/lib`                                                                                                                                                                                                   | Matching values in pinned theme CSS                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| react `divider/divider-style.ts` (`c42f709d`) | `DividerBase.js`: vertical `min-height: 100%; margin: 0 1rem; justify-content: center`; the absolutely positioned `::before` at `left: 50%` with `top: 0`; horizontal `width: 100%`, `align-items: center`; content `z-index: 1` | 5 of 5 checked values match six themes (four are found only in theme CSS; vertical `margin: 0 1rem` is also in `DividerBase.js`) (saga-blue, saga-green, saga-orange, saga-purple, bootstrap4-light-blue, bootstrap4-light-purple), e.g. `saga-blue/theme.css` `.p-divider` rules (details below)                                                           |
| react `toolbar/toolbar-style.ts` (`be9f35e4`) | `ToolbarBase.js`: `.p-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap }` and the group rules (`display: flex; align-items: center`)                                                | 4 of 5 checked values match all eight pinned `lara-light-*` themes (amber, blue, cyan, green, indigo, pink, purple, teal; no other theme reaches 4/5): background `#f9fafb`, border `1px solid #e5e7eb`, `border-radius: 6px`, `gap: 0.5rem`. Padding differs (`0.75rem 1rem` vs `1.25rem`). These values are also stock Tailwind gray and scale constants. |

The five matching divider values are below. The first four occur only in theme CSS; the fifth is also in `DividerBase.js`, inside the boundary, so it is not evidence of a theme source.

- horizontal `margin: 1rem 0`;
- horizontal `::before` border `1px … #dee2e6`;
- horizontal content `padding: 0 0.5rem`;
- content background `#fff`/`#ffffff`;
- vertical `margin: 0 1rem` (also in `DividerBase.js`).

## Result

- **Entries.** 14 entries for 14 files: Angular 4, React 4, Vue 6.

| Framework | COPY  | REFERENCE | ORIGINAL |
| --------- | ----- | --------- | -------- |
| Angular   | 2     | 2         | 0        |
| React     | 0     | 4         | 0        |
| Vue       | 2     | 4         | 0        |
| **Total** | **4** | **10**    | **0**    |

- **Held.** 2 React style modules are held under ADR-065, as described above.
- **Missing count.** 661 → 647. Remaining: ng 164, react 218, vue 265. The remaining React count includes the two held files.
