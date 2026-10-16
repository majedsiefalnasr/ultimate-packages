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

## Held for a separate decision (ADR-065): 2 React style modules (re-assessed below)

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

## Reassessment under the ADR-064 clarification (2026-10-16)

**Authority:** the user approved Option 2 of the React theme-match impact assessment, recorded as the [ADR-064 clarification](../DECISIONS.md#clarification-2026-10-16-theme-comparisons-are-screening-evidence), and ruled on 2026-10-16 that a distinctive combination is one occurring only within one theme family. Only the two files held above are re-assessed. Each source entry is judged on its own direct comparison with the checksum-verified pinned archives. All theme counts below are taken on the matching selectors across the 56 pinned PrimeReact themes.

### `divider/divider-style.ts`: classified COPY (2 entries)

**Theme screening is negative.** Every matched value is of a §2 kind, and no combination of three or more occurs only within one theme family.

| Retained value              | Themes (of 56) | Families                         | Kind                       |
| --------------------------- | -------------- | -------------------------------- | -------------------------- |
| Horizontal `margin: 1rem 0` | 29             | 15                               | Generic                    |
| Content `padding: 0 0.5rem` | 56             | 24                               | Generic                    |
| Content `background` `#fff` | 28             | 15                               | White (palette constant)   |
| `1px … #dee2e6` borders     | 7              | 3 (saga, bootstrap4-light, nano) | Bootstrap gray-300 palette |

The batch 3 "5 of 5" grouping (saga-* and bootstrap4-light-blue/purple) spans two families, so it is not family-unique either.

**Classification from admissible sources:**

| Entry (file ⇐ source)                                        | Class                            | Evidence                                                                                                                                                                                          |
| ------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `divider-style.ts` ⇐ `components/lib/divider/DividerBase.js` | COPY (ambiguity rule), `adapted` | Rules kept declaration by declaration (details below). Uncertainty: most declarations are common layout CSS; the rule-by-rule retention, including the literal `margin: 0 1rem`, is the evidence. |
| `divider-style.ts` ⇐ `@primeuix/styles@2.0.3 divider`        | COPY (ambiguity rule), `adapted` | A subset of upstream's properties per rule, including five declarations not in DividerBase (details below).                                                                                       |

**DividerBase declarations kept:**

- vertical `min-height: 100%; margin: 0 1rem; justify-content: center`;
- vertical `::before`: `content: ""; position: absolute; top: 0; left: 50%`;
- horizontal `width: 100%; align-items: center`;
- content `z-index: 1`.

**The five `@primeuix/styles` declarations not in DividerBase:**

- a horizontal `margin`;
- a `1px solid` horizontal `::before` border;
- a `1px solid` vertical `::before` border;
- a content `background`;
- content `padding`.

**What Ultimate drops from `@primeuix/styles`:**

- the rules' `padding`;
- the horizontal `::before` positioning (it uses `flex: 1 1 0%` instead);
- the vertical `::before`'s `height: 100%` (it uses `bottom: 0`);
- the content `color`.

### `toolbar/toolbar-style.ts`: remains held (no entry)

**Theme screening finds a distinctive combination.** Several combinations of three or more retained theme-only declarations on `.p-toolbar` occur together only in the `lara-light` family:

| Retained declaration        | Themes (of 56) | Families                                                            |
| --------------------------- | -------------- | ------------------------------------------------------------------- |
| `background: #f9fafb`       | 8              | lara-light only                                                     |
| `border: 1px solid #e5e7eb` | 9              | lara-light, tailwind-light                                          |
| `border-radius: 6px`        | 20             | lara-dark, lara-light, soho-dark, soho-light, viva-dark, viva-light |
| `gap: 0.5rem`               | 56             | 24                                                                  |

Each value alone is generic or a Tailwind palette constant (gray-50, gray-200). The largest family-unique combination is all four declarations, found in exactly the eight `lara-light-*` themes (amber, blue, cyan, green, indigo, pink, purple, teal). The other family-unique combinations are:

- `#f9fafb`, `1px solid #e5e7eb`, `6px`;
- `#f9fafb`, `1px solid #e5e7eb`, `0.5rem`;
- `#f9fafb`, `6px`, `0.5rem`;
- `1px solid #e5e7eb`, `6px`, `0.5rem`.

Under clarification §3 that is a distinctive combination, so the file stays held for an ADR-065 source-boundary decision under Blueprint §37.

Its admissible-source comparison is recorded here, but no entry is made while it is held:

- **⇐ `ToolbarBase.js`:** the `.p-toolbar` block kept exactly (`display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap`).
- **⇐ `@primeuix/styles` toolbar:** the same four declarations, and a subset of the remaining root properties (`padding`, `background`, `border: 1px solid`, `border-radius`, `gap`; `color` is dropped).
- **Group rule:** Ultimate splits it into three rules, adds `gap: 0.5rem` to each, and uses `@primeuix/styles`' `-start`/`-center`/`-end` class names rather than ToolbarBase's `-group-*` names.

### Result after reassessment

|                                      | Before | After                                    |
| ------------------------------------ | ------ | ---------------------------------------- |
| Batch 3 entries                      | 14     | 16 (14 + 2), covering 15 of the 16 files |
| Source classes (15 classified files) | —      | 5 COPY, 10 REFERENCE                     |
| Held files                           | 2      | 1 (`toolbar-style.ts`)                   |
| Missing production files             | 647    | 646 (ng 164, react 217, vue 265)         |

`input-number/input-number-style.ts` and `terminal/terminal-style.ts` will be assessed with their own batches.
