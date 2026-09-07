import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/paginator/paginator.ts (UPaginator class, `input()`/`output()` signal API)
 * - React: packages/react/src/paginator/paginator.tsx (UPaginatorProps interface + destructured props)
 * - Vue: packages/vue/src/paginator/base-paginator.ts (createBasePaginator's `props`/`emits`)
 *   and packages/vue/src/paginator/Paginator.vue (real `$emit` call sites, `changePage()` method)
 *
 * Paginator was already the subject of extensive real-source research in an
 * earlier, separate implementation plan (its own per-framework tasks:
 * Angular Tasks 2-6, React Tasks 7-9, Vue Tasks 10-12 — see each source
 * file's own header doc comment and docs/architecture/provenance/{ng,react,vue}.json).
 * That means the props/events below are drawn from a component whose API
 * surface is already stable and shipped, not newly authored for this
 * metadata task.
 *
 * Props are IDENTICAL across all three frameworks — `first`/`rows`/
 * `totalRecords`/`pageLinkSize`, same names, same defaults (0/0/0/5) — this
 * is the one proof-set component so far where the prop surface itself does
 * NOT diverge (verified by reading all three prop declarations in full:
 * paginator.ts:173-176, paginator.tsx:14-17, base-paginator.ts:9-12).
 *
 * Events, verified per framework — the state-ownership MECHANISM diverges
 * sharply even though the semantic payload (`page`/`first`/`rows`/
 * `pageCount`) is the same shape everywhere:
 * - Angular's `UPaginator` declares a single `onPageChange = output<PaginatorPageChangeEvent>()`
 *   (paginator.ts:178). Internal `_first` signal is updated locally by
 *   `changePage()` BEFORE the emit (paginator.ts:214-221) — Angular owns a
 *   copy of `first` internally, reconciled from the `first` input via
 *   `ngOnChanges` (paginator.ts:182-186), matching the "internal-with-
 *   one-way-input" state-ownership model documented in that file's own
 *   header comment and in provenance/ng.json's paginator.ts entry.
 * - React's `UPaginatorProps.onPageChange` (paginator.tsx:18) is a REQUIRED
 *   callback prop: `(event: PaginatorPageChangeEvent) => void`. `changePage`
 *   (paginator.tsx:63-68) NEVER mutates any local state — it only calls
 *   `onPageChange(...)` when the new page is in bounds. This is a fully
 *   controlled, no-uncontrolled-fallback model (confirmed by this
 *   component's own doc comment, paginator.tsx:43-47, and by
 *   provenance/react.json's explicit "the UI does NOT advance unless the
 *   parent's onPageChange handler updates first/rows" note) — distinct from
 *   both Angular (owns internal state) and Vue (owns internal state AND
 *   fully v-model round-trips it).
 * - Vue's `Paginator.vue`/`base-paginator.ts` declare `emits: ["page",
 *   "update:first", "update:rows"]` (base-paginator.ts:14) — THREE events,
 *   not one, and the primary one is named `"page"`, NOT `"onPageChange"`
 *   (Vue's `emits` array holds the raw event name; `onPageChange` would be
 *   the camelCase *listener* prop name Vue derives from it, but the
 *   emitted/declared name itself is `"page"` — verified directly against
 *   `this.$emit("page", { page: p, first: newFirst, rows: this.d_rows, pageCount })`,
 *   Paginator.vue:91). `changePage()` (Paginator.vue:86-95) mutates the
 *   internal `d_first` data property FIRST, then emits all three:
 *   `"page"` (the semantic page-change payload, same shape as Angular/React,
 *   modeled here as the `pageChanged` semanticId shared with ng/react),
 *   `"update:first"` and `"update:rows"` (Vue's v-model convention
 *   companions enabling `v-model:first`/`v-model:rows` two-way binding on
 *   the parent, modeled as their own `firstChanged`/`rowsChanged`
 *   semanticIds — the same pattern Task 11/Dialog used for its
 *   `update:visible` v-model companion vs. its `shown`/`hidden` lifecycle
 *   pair) — matching the "internal-with-full-v-model" state-ownership
 *   model documented in base-paginator.ts's own watchers
 *   (first/rows watchers sync `d_first`/`d_rows` when the parent changes
 *   them externally, base-paginator.ts:21-28) and in provenance/vue.json's
 *   paginator entries. `update:first`/`update:rows` have no Angular or
 *   React counterpart.
 *
 * Cross-framework note: unlike Checkbox/Dialog/Menu (where earlier tasks
 * found sharp *prop* divergence), Paginator's props are fully symmetric —
 * the divergence here is entirely in event MECHANISM/COUNT/NAME, not props.
 * This is consistent with Paginator having been implemented from a single,
 * already-settled cross-framework spec in the earlier plan, rather than
 * grown independently per framework.
 */
export const PAGINATOR_METADATA: ComponentMetadata = {
  name: "Paginator",
  category: "Data",
  description:
    "A page-navigation control (first/prev/next/last plus numbered page links) driven by first/rows/totalRecords, used standalone or composed inside Table/DataView for paging.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/paginator/paginator.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/paginator/paginator.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/paginator/base-paginator.ts" },
  },
  api: {
    ng: {
      props: [
        { name: "first", type: "number", default: "0", required: false, description: "Zero-relative index of the first record to be displayed." },
        { name: "rows", type: "number", default: "0", required: false, description: "Number of rows to display per page." },
        { name: "totalRecords", type: "number", default: "0", required: false, description: "Number of total records." },
        { name: "pageLinkSize", type: "number", default: "5", required: false, description: "Number of page links to display." },
      ],
      events: [
        {
          semanticId: "pageChanged",
          frameworkName: "onPageChange",
          mechanism: "output",
          payloadDescription:
            "PaginatorPageChangeEvent ({ page, first, rows, pageCount }) — emitted after the internal _first signal is updated locally, on any in-bounds first/prev/next/last/page-link click.",
        },
      ],
    },
    react: {
      props: [
        { name: "first", type: "number", required: true, description: "Zero-relative index of the first record to be displayed." },
        { name: "rows", type: "number", required: true, description: "Number of rows to display per page." },
        { name: "totalRecords", type: "number", required: true, description: "Number of total records." },
        { name: "pageLinkSize", type: "number", default: "5", required: false, description: "Number of page links to display." },
      ],
      events: [
        {
          semanticId: "pageChanged",
          frameworkName: "onPageChange",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: PaginatorPageChangeEvent) => void — required prop. Fully controlled: the component holds no page state of its own, so a parent that ignores this callback sees no UI advance.",
        },
      ],
    },
    vue: {
      props: [
        { name: "first", type: "Number", default: "0", required: false, description: "Zero-relative index of the first record to be displayed." },
        { name: "rows", type: "Number", default: "0", required: false, description: "Number of rows to display per page." },
        { name: "totalRecords", type: "Number", default: "0", required: false, description: "Number of total records." },
        { name: "pageLinkSize", type: "Number", default: "5", required: false, description: "Number of page links to display." },
      ],
      events: [
        {
          semanticId: "pageChanged",
          frameworkName: "page",
          mechanism: "emit",
          payloadDescription:
            "{ page, first, rows, pageCount } — emitted after the internal d_first data property is updated locally, on any in-bounds first/prev/next/last/page-link click. NOT named 'onPageChange' — the declared emits-array name is 'page'.",
        },
        {
          semanticId: "firstChanged",
          frameworkName: "update:first",
          mechanism: "emit",
          payloadDescription: "number — v-model companion emit for the `first` prop, enabling v-model:first two-way binding. Emitted alongside 'page' in the same changePage() call.",
        },
        {
          semanticId: "rowsChanged",
          frameworkName: "update:rows",
          mechanism: "emit",
          payloadDescription: "number — v-model companion emit for the `rows` prop, enabling v-model:rows two-way binding. Emitted alongside 'page' in the same changePage() call.",
        },
      ],
    },
  },
  style: {
    componentName: "paginator",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/paginator/paginator.ts", "packages/ng/src/paginator/paginator-style.ts"],
  },
};
