# GAP-094 backfill batch 2: evidence record (Chip, Tag)

**Date:** 2026-10-16
**Base:** `main` `d08fb80055baefa95b4f5737d0fb4a2779850ca7`, verified against GitHub. Its CI run [38895551609](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38895551609) fails only "Provenance validation" (677).
**Authority:** [ADR-064](../DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label); [GAP-094 Specification](../../superpowers/specs/2026-10-15-gap-094-production-provenance-scope-design.md) §3.4 and Amendment A1; [batch 2 Plan](../../superpowers/plans/2026-10-16-gap-094-backfill-batch-2.md).

## Inventory at the base

The validator reports 677 missing production files: ng 172, react 228, vue 277. Of these, 16 belong to Chip and Tag.

## Method

- **Upstream sources.** Fetched with `pnpm run vendor:fetch` (SHA-256 verified against `checksums.json`):
  - PrimeNG 21.1.9 at `c493b1c6`;
  - PrimeReact 10.9.9 at `d0f574e3`;
  - PrimeVue 4.5.5 at `66dde678`;
  - `@primeuix/styles` 2.0.3, read from `dist/<module>/index.mjs.map` `sourcesContent`.
- **Lineage.** From `git log --follow`. Later commits change no upstream lineage:
  - `ecdbf793` (GAP-092) only reformats;
  - `f146ea8c` and `ec3112f3` (GAP-082) only wrap Vue base factories in `defineComponent` and add `PropType` typing.
- **Governing Plan.** Phase C Batch 1 Plan §7, Chip row (added in `c42f709d`) and Tag row (added in `be9f35e4`).
- **Classification (ADR-064).**
  - **COPY:** upstream wording, statements or structure are retained. Genuine uncertainty is resolved to COPY and stated in the table.
  - **REFERENCE:** only interface facts are shared: public names, standard APIs or equivalent output.
  - **Index files:** each component has a same-named upstream directory. Its entry point is PrimeNG's `public_api.ts`, or a `package.json` in PrimeReact and PrimeVue. Each Ultimate barrel shares only the component export with it, so it is REFERENCE under the A1 barrel rule.
  - **ORIGINAL:** none in this batch.

## Evidence table

| File                                   | Source class                                                      | `modificationStatus`         | Compared upstream                                                | Evidence                                                                                                                                                                                                                                                                                             | Uncertainty                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ng `chip/chip.ts`                      | COPY                                                              | adapted                      | `primeng/src/chip/chip.ts`                                       | Same template structure: ng-content; image else icon; label; removable span with `role="button"`, `tabindex` `disabled ? -1 : 0`, `aria-label` and click/keydown. Same `close`/`onKeydown` statements (`Enter` or `Backspace`).                                                                      | None                                                                                                                                            |
| ng `chip/index.ts`                     | REFERENCE                                                         | reimplemented-with-reference | `primeng/src/chip/public_api.ts`                                 | Upstream has three `export *` (types, component, style); ours has one named component re-export.                                                                                                                                                                                                     | None                                                                                                                                            |
| ng `tag/tag.ts`                        | COPY                                                              | adapted                      | `primeng/src/tag/tag.ts`                                         | Same icon-then-label template with `cx('icon')`/`cx('label')`. Input doc text verbatim: "Severity type of the tag.", "Whether the corners of the tag are rounded."                                                                                                                                   | None                                                                                                                                            |
| ng `tag/index.ts`                      | REFERENCE                                                         | reimplemented-with-reference | `primeng/src/tag/public_api.ts`                                  | As for Chip's index.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |
| react `chip/chip.tsx` (2 entries)      | Corrected, see [Correction](#correction-under-gap-132-2026-10-16) | see Correction               | `components/lib/chip/Chip.js`; `primeng/src/chip/chip.ts`        | From Chip.js: the control flow (details below). From PrimeNG's Chip, a second source from another framework: the keydown statement, the remove control's `tabIndex` `disabled ? -1 : 0` and `aria-label={removeAriaLabel}`, and `close()` hiding then emitting.                                      | Against Chip.js alone the call is uncertain (rendering rewritten, structure retained). With the PrimeNG statements included it is plainly COPY. |
| react `chip/chip-style.ts` (2 entries) | Corrected, see [Correction](#correction-under-gap-132-2026-10-16) | see Correction               | `components/lib/chip/ChipBase.js`; `@primeuix/styles@2.0.3 chip` | From ChipBase: the class map keys (an `image` key is added), label `line-height: 1.5`, root `inline-flex`/`center`. From the styles module: its selectors and property lists, with literal values in place of `dt()` (details below).                                                                | None                                                                                                                                            |
| react `chip/index.ts`                  | REFERENCE                                                         | reimplemented-with-reference | `components/lib/chip/package.json`                               | Entry manifest only; shares the exported component.                                                                                                                                                                                                                                                  | None                                                                                                                                            |
| react `tag/tag.tsx`                    | REFERENCE                                                         | reimplemented-with-reference | `components/lib/tag/Tag.js`                                      | Every statement rewritten (no `mergeProps`, `IconUtils` or imperative handle). Shares only the props and equivalent span output; the DOM differs (icon wrapper, merged value/children span).                                                                                                         | None                                                                                                                                            |
| react `tag/tag-style.ts` (2 entries)   | Corrected, see [Correction](#correction-under-gap-132-2026-10-16) | see Correction               | `components/lib/tag/TagBase.js`; `@primeuix/styles@2.0.3 tag`    | From TagBase: the root class logic (`<prefix>-<severity>`, `-rounded`) and root `inline-flex`/`center`/`center`. From the styles module: its selector set (rounded and six severities) and root property list, with literal values instead of `dt()`.                                                | None                                                                                                                                            |
| react `tag/index.ts`                   | REFERENCE                                                         | reimplemented-with-reference | `components/lib/tag/package.json`                                | As for Chip's index.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |
| vue `chip/Chip.vue` (2 entries)        | Corrected, see [Correction](#correction-under-gap-132-2026-10-16) | see Correction               | `primevue/src/chip/Chip.vue`; `primeng/src/chip/chip.ts`         | Template structure kept (details below). Same `inheritAttrs: false`, `data` `visible: true`, `onKeydown` and `close` emitting `remove`. From PrimeNG's Chip: the remove control's `role="button"`, `tabindex` `disabled ? -1 : 0` and `aria-label` bound to `removeAriaLabel`, which PrimeVue lacks. | None                                                                                                                                            |
| vue `chip/BaseChip.ts`                 | COPY                                                              | adapted                      | `primevue/src/chip/BaseChip.vue`                                 | Same prop definitions, e.g. `label: { type: [String, Number], default: null }`, plus `icon`, `image`, `removable`.                                                                                                                                                                                   | None                                                                                                                                            |
| vue `chip/index.ts`                    | REFERENCE                                                         | reimplemented-with-reference | `primevue/src/chip/package.json`                                 | Entry manifest only.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |
| vue `tag/Tag.vue`                      | Corrected, see [Correction](#correction-under-gap-132-2026-10-16) | see Correction               | `primevue/src/tag/Tag.vue`                                       | Template rewritten, but it keeps the root/icon/label `cx` sequence and the component options.                                                                                                                                                                                                        | Yes. COPY per the ambiguity rule (reason below).                                                                                                |
| vue `tag/BaseTag.ts`                   | REFERENCE                                                         | reimplemented-with-reference | `primevue/src/tag/BaseTag.vue`                                   | Shares only the public prop names, written as typed definitions instead of upstream's shorthand.                                                                                                                                                                                                     | None                                                                                                                                            |
| vue `tag/index.ts`                     | REFERENCE                                                         | reimplemented-with-reference | `primevue/src/tag/package.json`                                  | Entry manifest only.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |

**React `chip/chip.tsx`.**

- Kept: the control flow image, else icon, then label, then the removable control (`role`, `tabIndex`, `onClick` close, `onKeyDown`); root `aria-label={label}`; internal visible state.
- Its keydown statement uses `event.key` `Enter`/`Backspace`, as PrimeNG and PrimeVue do, not PrimeReact's `event.code` check. Together with the PrimeNG-only `tabIndex` and `aria-label` attributes, this identifies PrimeNG's `chip.ts` as a second source (second entry).

**React `chip/chip-style.ts`.**

- From ChipBase: root `display: inline-flex` and `align-items: center`; label `line-height: 1.5`.
- From `@primeuix/styles` 2.0.3 chip, with literal values in place of `dt()`:
  - the root's `gap`, `background`, `color`, `border-radius` and `padding`;
  - the image's `width`, `height`, `border-radius: 50%` and negative inline-start margin;
  - the icon's `font-size`;
  - the remove icon's `cursor` and `font-size`, and its `:focus-visible` `outline` and `outline-offset`.

**Vue `chip/Chip.vue`.** The kept template structure is:

- the `v-if="visible"` root with `cx('root')` and `aria-label`;
- `img v-if="image"`;
- icon `v-else-if` with `[cx('icon'), icon]`;
- label `v-if="label !== null"`, now a `span` instead of upstream's `div`.

**Vue `tag/Tag.vue`.** The uncertainty: the template is rewritten, but the file keeps upstream's `inheritAttrs: false` although it never binds `$attrs`. That suggests the option was carried over rather than needed.

## Result (as merged in PR #27; superseded in part by the Correction below)

**Counts.** 16 files, giving 20 entries:

- React `chip.tsx`, React `chip-style.ts`, React `tag-style.ts` and Vue `Chip.vue` each cite two upstream sources.
- React `chip.tsx` and Vue `Chip.vue` cite PrimeNG's `chip.ts` as a second source from another framework.

| Framework | COPY  | REFERENCE | ORIGINAL |
| --------- | ----- | --------- | -------- |
| Angular   | 2     | 2         | 0        |
| React     | 3     | 3         | 0        |
| Vue       | 3     | 3         | 0        |
| **Total** | **8** | **8**     | **0**    |

**Conclusiveness.** No file is inconclusive. Vue `Tag.vue` is COPY under the ambiguity rule, with the reason stated. React `chip.tsx` and `chip-style.ts` are plainly COPY once all their sources are counted.

**Cross-framework sources.** ADR-064 requires a second entry when a second upstream file contributes, and does not restrict sources to the same framework. The PrimeNG path uses `ng.json`'s established form. The React and Vue packages' `THIRD-PARTY-NOTICES.md` name only PrimeReact and PrimeVue. Both are MIT, copyright PrimeTek. Whether those notices should also name PrimeNG is recorded under GAP-132; no notice is changed here.

**Independent review.** It agreed with every classification. Its findings are all applied:

1. React `chip-style.ts` was missing its `@primeuix/styles` chip source.
2. The PrimeNG-derived statements in React `chip.tsx` and Vue `Chip.vue` had no entry.
3. Four descriptions were incomplete.

**Missing count.** 677 → 661. Remaining: ng 168, react 222, vue 271.

## Correction under GAP-132 (2026-10-16)

**Authority:** user authorization of a narrowly scoped GAP-132 correction, following the post-merge review of batch 2. The baseline is `main` `28ab819d`.

**Method:** ADR-064 is applied as written. Each source entry is assessed on its own direct comparison with that one upstream file, never on lineage or on another entry. Archives were re-fetched and checksum-verified (`vendor:fetch`), then extracted fresh. An independent review of this correction, and a re-review, found seven issues; all are applied here:

1. The two PrimeNG entries had been judged differently on the same evidence.
2. The `@primeuix/styles` chip comparison was incomplete.
3. The ChipBase comparison was incomplete.
4. The theme scoring was not reproducible.
5. Source comments that contradict the new REFERENCE entries were not recorded.
6. The Tag theme judgment applied a different test from the saga entry.
7. An open-item count was wrong.

The `@primeuix/styles` tag entry was re-checked by the same test for consistency.

| Entry (file ⇐ source)                                                      | Was                   | Now                                          | Evidence from the direct comparison                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------- | --------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| react `chip.tsx` ⇐ PrimeReact `components/lib/chip/Chip.js`                | COPY `adapted`        | **REFERENCE** `reimplemented-with-reference` | Shared: rendering order (image else icon, label, remove), root `aria-label={label}`, internal visible state. These are the same in all three upstreams. Not kept: `Chip.js`'s keydown (`event.code` incl. `NumpadEnter`), fixed `tabIndex: 0`, veto-returning `onRemove`. The file's comment calls it an "adaptation" of `Chip.js`; ADR-064 decides by comparison, and the comment is recorded under GAP-132.                                                                           |
| react `chip.tsx` ⇐ PrimeNG `packages/primeng/src/chip/chip.ts`             | COPY                  | **COPY** (confirmed)                         | Retained statement `if (event.key === 'Enter' \|\| event.key === 'Backspace') { close(event) }` (`chip.ts:239`). The same remove control has `tabIndex` `disabled ? -1 : 0` and `aria-label={removeAriaLabel}`. Uncertainty stated: the statement also occurs in PrimeVue `Chip.vue:32`, and the attributes are standard ARIA.                                                                                                                                                          |
| react `chip-style.ts` ⇐ PrimeReact `components/lib/chip/ChipBase.js`       | COPY                  | **COPY** (confirmed, ambiguity rule)         | Nearly the whole `styles` block is kept rule by rule under renamed selectors: root `display: inline-flex` and `align-items: center`, label `line-height: 1.5`, remove icon `cursor: pointer`, image `border-radius: 50%`. Same class-map keys (an `image` key is added). Each declaration is generic; the rule-by-rule retention is the evidence.                                                                                                                                       |
| react `chip-style.ts` ⇐ `@primeuix/styles@2.0.3 chip`                      | COPY                  | **COPY** (confirmed, ambiguity rule)         | Identical declarations: root `inline-flex` and `center`, remove icon `cursor: pointer`, image `border-radius: 50%`. Same property set per rule: root `gap`/`background`/`color`/`border-radius`/`padding`; image width, height, radius and negative leading margin; icon `font-size`; remove icon `:focus-visible` `outline` and `outline-offset`. Values are literals instead of `dt()`.                                                                                               |
| react `chip-style.ts` ⇐ PrimeReact `public/themes/saga-blue/theme.css`     | (missing)             | **COPY** (new entry)                         | Retained declaration values from `.p-chip` rules (`theme.css` lines 6724–6743; identical in saga-green, saga-orange and saga-purple; no other pinned theme matches): `#dee2e6`, `#495057`, `16px`, image `2rem` × `2rem` with `margin-left: -0.5rem`, label `line-height: 1.5` with `0.25rem` vertical spacing. Uncertainty stated: `#dee2e6` and `#495057` are also Bootstrap gray-300 and gray-700; the combination of retained values found only in the saga themes is the evidence. |
| react `tag-style.ts` ⇐ PrimeReact `components/lib/tag/TagBase.js`          | COPY                  | **REFERENCE**                                | Only one of TagBase's three style rules is kept: the generic centering triad. The other two are not kept: `line-height: 1.5` on icon and value, and `border-radius: 10rem` for rounded, where ours uses `9999px`. The class naming scheme is public names.                                                                                                                                                                                                                              |
| react `tag-style.ts` ⇐ `@primeuix/styles@2.0.3 tag`                        | COPY                  | **COPY** (confirmed, ambiguity rule)         | The root keeps upstream's exact ten-property list (`display`, `align-items`, `justify-content`, `background`, `color`, `font-size`, `font-weight`, `padding`, `border-radius`, `gap`), including three identical declarations. It also keeps the full selector set: icon, rounded, success, info, warn, danger, secondary, contrast. Values are literals instead of `dt()`. Uncertainty stated: the severity selectors are public names.                                                |
| react `tag-style.ts` ⇐ PrimeReact `public/themes/tailwind-light/theme.css` | (missing)             | **COPY** (new entry, ambiguity rule)         | Retained `.p-tag` values (8 of 10, scoring below): color `#fff`, `0.75rem`, `700`, `6px` (= `0.375rem`), success `#22c55e`, info `#3b82f6`, warn `#f59e0b`, danger `#ef4444`. Info and warn distinguish it from every `lara-light-*` theme. Uncertainty stated: all matched values are also stock Tailwind constants. Not retained: padding `0.25rem 0.4rem` and the indigo-600 primary background.                                                                                     |
| vue `Chip.vue` ⇐ PrimeNG `packages/primeng/src/chip/chip.ts`               | COPY                  | **COPY** (confirmed)                         | Assessed against PrimeNG alone. Retained: the keydown statement (`chip.ts:239` → `Chip.vue:45-49`) and `close()`'s hide-then-emit order. The same `role`, `tabindex` `disabled ? -1 : 0` and `aria-label` bindings are present. Uncertainty stated: the statement also occurs in PrimeVue `Chip.vue`, and the attributes are standard ARIA.                                                                                                                                             |
| vue `Tag.vue` ⇐ PrimeVue `packages/primevue/src/tag/Tag.vue`               | COPY (ambiguity rule) | **REFERENCE**                                | The template is rewritten. `inheritAttrs: false` is a project-wide Ultimate pattern: 57 of 108 Ultimate Vue SFCs have it, and only 1 binds `$attrs`. It is not evidence of copying from this file. What remains is `cx()` key order and framework boilerplate.                                                                                                                                                                                                                          |

**PrimeReact themes and Tag.** Every pinned theme (56) was scored against ten of `tag-style.ts`'s values. Normalization: `#ffffff` = `#fff`, `0.375rem` = `6px`.

The ten values are: root background `#6b7280`, color `#fff`, `font-size: 0.75rem`, `font-weight: 700`, `padding: 0.25rem 0.5rem`, `border-radius: 6px`, success `#22c55e`, info `#3b82f6`, warn `#f59e0b`, danger `#ef4444`.

| Theme                                   | Match (normalized) | Raw match |
| --------------------------------------- | ------------------ | --------- |
| `tailwind-light`                        | 8 of 10            | 6         |
| each of the eight `lara-light-*` themes | 6                  | 5         |

**Test applied to both theme comparisons.** The saga chip entry rests on retained declaration values, and so does this one. In both cases some of the values are also third-party constants:

- saga's `#dee2e6` and `#495057` are Bootstrap gray-300 and gray-700;
- tailwind-light's values are Tailwind palette and scale constants.

Applying one test to both, retained theme values that single out one pinned theme are evidence of retention. Where the values could also come straight from the third-party palette, that is genuine uncertainty, which ADR-064 §2 resolves to COPY with the uncertainty stated. A tailwind-light entry is therefore added.

**Corrected counts (per file).** A file counts as COPY if any of its entries is COPY. 16 files and 22 entries: 11 COPY entries and 11 REFERENCE entries.

| Framework | COPY                                            | REFERENCE | ORIGINAL |
| --------- | ----------------------------------------------- | --------- | -------- |
| Angular   | 2                                               | 2         | 0        |
| React     | 3 (`chip.tsx`, `chip-style.ts`, `tag-style.ts`) | 3         | 0        |
| Vue       | 2 (`Chip.vue`, `BaseChip.ts`)                   | 4         | 0        |
| **Total** | **7**                                           | **9**     | **0**    |

The validator count is unaffected (661), because it checks destinations only.

**Open items recorded under GAP-132 (not decided here):**

1. **PrimeReact source path.** The new saga-theme and tailwind-light sources are PrimeReact theme CSS. The `primereact` package distributes them as `resources/themes` under its MIT license (`gulpfile.js` `build-themes`). However, the Phase 3 Specification and the `PROVENANCE.md` PrimeReact entry record `components/lib` as the only PrimeReact source path. Widening that recorded path, or reworking the stylesheet, needs a decision.
2. **Source comments contradict three entries.** These files' comments call themselves adaptations of the upstream file now classified REFERENCE: React `chip.tsx` (of `Chip.js`), React `tag-style.ts` (of `TagBase.js`) and Vue `Tag.vue`. Source files are out of scope for this correction.

**Notices.** `packages/react/THIRD-PARTY-NOTICES.md` and `packages/vue/THIRD-PARTY-NOTICES.md` changed as follows:

- they state the recorded lineage instead of "will incorporate";
- they add the PrimeNG Community Versions MIT notice. Its copyright, permission and disclaimer text matches the pinned `LICENSE.md` lines 7–25 word for word. The LTS commercial section is excluded. The heading follows `@ultimate/ng`'s notice.

Both notices state that whether further notices are required is a legal question for company-policy review (Blueprint §8). The repository does not determine it.
