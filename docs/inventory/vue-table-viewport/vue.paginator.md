# Vue UPaginator

ID: vue.paginator

Framework: vue; availability: public

## Authored interpretation

Render page navigation and report requested page changes.

## Framework surface

Each is an Options API SFC extending its exported base factory, which extends createBaseComponent from @ultimate/vue-core; mounted registers its component style and cx resolves its local class map. Source-only style module is not re-exported by the family barrel. No plugin, directive or composable is exported by the family entry. UPaginator and createBasePaginator; source-only paginatorStyleModule. Declared props first, rows and totalRecords default to 0, pageLinkSize defaults to 5. Emits page, update:first and update:rows. The component watches first and rows into d_first and d_rows. It computes a bounded page link window and a page count through @ultimate/uix-data getPageCount; page is floor(d_first/d_rows) for positive rows and 0 otherwise. changePage validates a requested first index, mutates d_first and emits page with {page, first, rows, pageCount}, then update:first and update:rows. The fixed nav renders first, previous, numbered, next and last buttons with aria labels, aria-current on the active page and a polite page report. No slots or page-size dropdown. paginatorStyleModule imports @ultimate/uix-styles/paginator and defines local classes including currentPageReport; Aura registers a paginator preset.

## Public exports

@ultimate/vue#UPaginator
@ultimate/vue/paginator#UPaginator
@ultimate/vue#createBasePaginator
@ultimate/vue/paginator#createBasePaginator

## Owned source and evidence

packages/vue/src/paginator/Paginator.vue
packages/vue/src/paginator/base-paginator.ts
packages/vue/src/paginator/paginator-style.ts
packages/vue/src/paginator/index.ts

```text
packages/vue/src/paginator/Paginator.vue: name: "UPaginator"
packages/vue/src/paginator/base-paginator.ts: createBasePaginator
packages/vue/src/paginator/paginator-style.ts: export const paginatorStyleModule
packages/vue/src/paginator/index.ts: createBasePaginator
packages/vue/src/index.ts: export * from "./paginator";
packages/vue/package.json: "./paginator": {
packages/vue/src/paginator/Paginator.vue: this.$emit("page",
packages/vue/src/paginator/Paginator.vue: this.$emit("update:first",
packages/vue/src/paginator/Paginator.vue: aria-current
packages/vue/src/paginator/Paginator.vue: getPageCount
```

## Relationships

package.ultimate.vue.paginator → [vue.paginator](vue.paginator.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
package.ultimate.uix-data.pagination (pending cross-batch)
package.ultimate.uix-styles.paginator (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "The bounded existing Vue table, paginator and scroller specs passed together in the documented local run.",
    "run": "docs/inventory/vue-table-viewport/product-run.json",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/table/ src/paginator/ src/scroller/ --config /tmp/vitest-vue133.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Test Files  3 passed (3)\nTests  97 passed (97)",
    "limitations": "Temporary external config uses the Vue plugin and jsdom with css.postcss.plugins=[] to bypass the host ancestor PostCSS config; CSS processing and visuals are not verified. Prerequisite workspace builds were run. A single local run at the source revision; not a remote CI run."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured conditional non-docs CI Test step runs root pnpm run test, which invokes the Vue test script; this describes workflow configuration, not a successful run or branch protection. The scoped inventory Node tests are not included in test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); earlier steps can prevent execution. No remote CI run observed."
  }
]
```
