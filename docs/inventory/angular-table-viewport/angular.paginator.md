# Angular UPaginator

ID: angular.paginator

Framework: angular; availability: public

## Authored interpretation

Page navigation driven by record offset, page size and record count.

## Framework surface

Selector u-paginator; standalone UPaginator. Inputs first=0, rows=0, totalRecords=0, pageLinkSize=5; output onPageChange: PaginatorPageChangeEvent. Public interface PaginatorPageChangeEvent has page/first/rows/pageCount:number. Public changePage(first:number):void calculates page=floor(first/rows) when rows>0, otherwise zero; accepts only 0<=page<pageCount, updates internal _first then emits. No firstChange output. ngOnChanges reconciles first; pageCount uses getPageCount from @ultimate/uix-data. First/Previous/Next/Last buttons and numbered pageLinks use a nav/content wrapper, native disabled boundary buttons, English aria-labels and aria-current=page for selected link; host exposes data-page-count/data-page/data-page-links. paginatorStyleModule wraps @ultimate/uix-styles/paginator with inline disabled?/selected? resolver parameter types. Aura registers paginator; PAGINATOR_METADATA points to the Angular source and paginator.api.mdx is generated supporting documentation. Consumer availability: @ultimate/ng#UPaginator, @ultimate/ng/paginator#UPaginator, @ultimate/ng#PaginatorPageChangeEvent, @ultimate/ng/paginator#PaginatorPageChangeEvent. All components extend UBaseComponent with inherited dt?: Record<string,unknown> and unstyled?: boolean; base ngOnInit registers theme variables and structural CSS. Local style modules and their css/classes constants and inline class-parameter types are source-only, owned by this family. Remaining private/protected state, lifecycle methods, render handlers and helpers belong to the owning record. No additional directive, hook, factory or base class is declared in these roots. Metadata source references establish relationships, not proof of runtime completeness. Manifest dist targets declare availability, not verified publication or installed artifact integrity. Prime comments are neutral provenance references only.

## Public exports

@ultimate/ng#UPaginator
@ultimate/ng/paginator#UPaginator
@ultimate/ng#PaginatorPageChangeEvent
@ultimate/ng/paginator#PaginatorPageChangeEvent

## Owned source and evidence

packages/ng/src/paginator/index.ts
packages/ng/src/paginator/paginator-style.ts
packages/ng/src/paginator/paginator.ts

```text
packages/ng/src/paginator/paginator.ts: export class UPaginator
packages/ng/src/paginator/index.ts: export { UPaginator }
packages/ng/src/index.ts: export * from "@ultimate/ng/paginator";
packages/ng/package.json: "./paginator"
packages/ng/src/paginator/paginator-style.ts: export const paginatorStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/component-metadata/src/records/paginator.ts: export const PAGINATOR_METADATA
packages/themes/src/presets/aura/index.ts:     paginator,
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.uix-data.pagination (pending cross-batch)
package.ultimate.uix-styles.paginator (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, template composition, helpers and style adapters exist; source presence is not execution."
  },
  {
    "state": "failed",
    "behavior": "Initial scoped product attempt failed before assertions because workspace dependency artifacts were absent.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{table,paginator,scroller}/*.spec.ts'",
    "outcome": "failed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "output": "Exit 1. Application bundle generation failed; TS2307 Cannot find module '@ultimate/ng-core', '@ultimate/uix-data', '@ultimate/uix-styles/table', '@ultimate/themes' and cascading Angular compiler errors.",
    "limitations": "No product assertions ran. Dependency build was performed before retry; no product source repair."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded three-family Angular product specs passed once (135 tests).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{table,paginator,scroller}/*.spec.ts'",
    "outcome": "passed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "output": "Exit 0. Vitest 4.0.8: 3 files, 135 tests passed (Table 95, Paginator 16, Scroller 24). Angular warnings NG8113 for unused UStepList/UStepPanels in VerticalStepperHost (src/g3c1-aura-styles.spec.ts), NG8102 for step() ?? 1 (src/input-number/input-number.ts:90:19).",
    "run": "docs/inventory/angular-table-viewport/product-run.json",
    "limitations": "Local Angular unit tests only; not browser/accessibility/visual, Storybook, publication, full package build or remote CI. Coverage includes imported foundations and does not prove exhaustive coverage. Warnings were not repaired."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step runs root pnpm run test, recursively including Angular ng test --project=ng; inventory tests are outside provenance-only test:scripts. Configuration only, no remote run observed.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional !cancelled() and classification scope != docs; branch protection not observed."
  }
]
```
