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

| File                                   | Source class | `modificationStatus`         | Compared upstream                                                | Evidence                                                                                                                                                                                                                                                                                             | Uncertainty                                                                                                                                     |
| -------------------------------------- | ------------ | ---------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ng `chip/chip.ts`                      | COPY         | adapted                      | `primeng/src/chip/chip.ts`                                       | Same template structure: ng-content; image else icon; label; removable span with `role="button"`, `tabindex` `disabled ? -1 : 0`, `aria-label` and click/keydown. Same `close`/`onKeydown` statements (`Enter` or `Backspace`).                                                                      | None                                                                                                                                            |
| ng `chip/index.ts`                     | REFERENCE    | reimplemented-with-reference | `primeng/src/chip/public_api.ts`                                 | Upstream has three `export *` (types, component, style); ours has one named component re-export.                                                                                                                                                                                                     | None                                                                                                                                            |
| ng `tag/tag.ts`                        | COPY         | adapted                      | `primeng/src/tag/tag.ts`                                         | Same icon-then-label template with `cx('icon')`/`cx('label')`. Input doc text verbatim: "Severity type of the tag.", "Whether the corners of the tag are rounded."                                                                                                                                   | None                                                                                                                                            |
| ng `tag/index.ts`                      | REFERENCE    | reimplemented-with-reference | `primeng/src/tag/public_api.ts`                                  | As for Chip's index.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |
| react `chip/chip.tsx` (2 entries)      | COPY         | adapted                      | `components/lib/chip/Chip.js`; `primeng/src/chip/chip.ts`        | From Chip.js: the control flow (details below). From PrimeNG's Chip, a second source from another framework: the keydown statement, the remove control's `tabIndex` `disabled ? -1 : 0` and `aria-label={removeAriaLabel}`, and `close()` hiding then emitting.                                      | Against Chip.js alone the call is uncertain (rendering rewritten, structure retained). With the PrimeNG statements included it is plainly COPY. |
| react `chip/chip-style.ts` (2 entries) | COPY         | adapted                      | `components/lib/chip/ChipBase.js`; `@primeuix/styles@2.0.3 chip` | From ChipBase: the class map keys (an `image` key is added), label `line-height: 1.5`, root `inline-flex`/`center`. From the styles module: its selectors and property lists, with literal values in place of `dt()` (details below).                                                                | None                                                                                                                                            |
| react `chip/index.ts`                  | REFERENCE    | reimplemented-with-reference | `components/lib/chip/package.json`                               | Entry manifest only; shares the exported component.                                                                                                                                                                                                                                                  | None                                                                                                                                            |
| react `tag/tag.tsx`                    | REFERENCE    | reimplemented-with-reference | `components/lib/tag/Tag.js`                                      | Every statement rewritten (no `mergeProps`, `IconUtils` or imperative handle). Shares only the props and equivalent span output; the DOM differs (icon wrapper, merged value/children span).                                                                                                         | None                                                                                                                                            |
| react `tag/tag-style.ts` (2 entries)   | COPY         | adapted                      | `components/lib/tag/TagBase.js`; `@primeuix/styles@2.0.3 tag`    | From TagBase: the root class logic (`<prefix>-<severity>`, `-rounded`) and root `inline-flex`/`center`/`center`. From the styles module: its selector set (rounded and six severities) and root property list, with literal values instead of `dt()`.                                                | None                                                                                                                                            |
| react `tag/index.ts`                   | REFERENCE    | reimplemented-with-reference | `components/lib/tag/package.json`                                | As for Chip's index.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |
| vue `chip/Chip.vue` (2 entries)        | COPY         | adapted                      | `primevue/src/chip/Chip.vue`; `primeng/src/chip/chip.ts`         | Template structure kept (details below). Same `inheritAttrs: false`, `data` `visible: true`, `onKeydown` and `close` emitting `remove`. From PrimeNG's Chip: the remove control's `role="button"`, `tabindex` `disabled ? -1 : 0` and `aria-label` bound to `removeAriaLabel`, which PrimeVue lacks. | None                                                                                                                                            |
| vue `chip/BaseChip.ts`                 | COPY         | adapted                      | `primevue/src/chip/BaseChip.vue`                                 | Same prop definitions, e.g. `label: { type: [String, Number], default: null }`, plus `icon`, `image`, `removable`.                                                                                                                                                                                   | None                                                                                                                                            |
| vue `chip/index.ts`                    | REFERENCE    | reimplemented-with-reference | `primevue/src/chip/package.json`                                 | Entry manifest only.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |
| vue `tag/Tag.vue`                      | COPY         | adapted                      | `primevue/src/tag/Tag.vue`                                       | Template rewritten, but it keeps the root/icon/label `cx` sequence and the component options.                                                                                                                                                                                                        | Yes. COPY per the ambiguity rule (reason below).                                                                                                |
| vue `tag/BaseTag.ts`                   | REFERENCE    | reimplemented-with-reference | `primevue/src/tag/BaseTag.vue`                                   | Shares only the public prop names, written as typed definitions instead of upstream's shorthand.                                                                                                                                                                                                     | None                                                                                                                                            |
| vue `tag/index.ts`                     | REFERENCE    | reimplemented-with-reference | `primevue/src/tag/package.json`                                  | Entry manifest only.                                                                                                                                                                                                                                                                                 | None                                                                                                                                            |

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

## Result

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
