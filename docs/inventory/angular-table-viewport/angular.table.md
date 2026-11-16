# Angular UTable

ID: angular.table

Framework: angular; availability: public

## Authored interpretation

Data table with controlled sorting, filtering, selection, row editing, expansion, grouping and composed paging/windowing.

## Framework surface

Selector u-table; standalone UTable<T>. Inputs value: T[]=[], dataKey="", columns: UTableColumn<T>[]=[], sortMode: SortMode="single", sortField?: string, sortOrder: 1|0|-1=0, multiSortMeta: SortMeta[]=[], filters: Record<string,FilterMetadata|FilterMetadata[]>={}, selectionMode?: SelectionMode, selection?: T|T[], compareSelectionBy: "equals"|"deepEquals"="equals", selectionColumn=false, paginator=false, first=0, rows=0, totalRecords=0, rowsPerPageOptions?: number[], virtualScroll=false, virtualScrollItemSize=0, lazy=false, lazyLoadOnInit=false, editMode?: "cell"|"row", editingRowKeys: Record<string,boolean>={}, expandedRowKeys: Record<string,boolean>={}, rowGroupMode?: "subheader"|"rowspan", groupRowsBy?: string, loading=false. Outputs sortFieldChange: string|undefined, sortOrderChange: 1|0|-1, multiSortMetaChange: SortMeta[], selectionChange: T|T[], firstChange/rowsChange: number, onLazyLoad: {first:number;last:number}, editingRowKeysChange/expandedRowKeysChange: Record<string,boolean>, onRowExpand/onRowCollapse: {originalEvent:Event;data:T}. UTableColumn<T=unknown> defines field/header:string and body?: (row:T,options:{field:string;rowIndex:number})=>string; this exported source interface is not re-exported by the barrel. tableStyleModule wraps @ultimate/uix-styles/table and is also source-only. Public registerCustomFilter(fn: (value:unknown,filter:unknown,filterLocale?:string)=>boolean): void replaces an instance-local custom predicate; filterLocale is passed undefined. Public initRowEdit(row:T,event?:Event):void enters internal row editing. ngOnChanges reconciles first and editingRowKeys. Pipeline is filter-then-sort-then-paginate; grouping sorts the paged view with groupRowsBy leading. Filter arrays are OR alternatives per field, fields AND together; supported modes include contains/startsWith/notContains/endsWith/equals/notEquals/lt/lte/gt/gte/between/in/notIn/dateIs/dateIsNot/custom. Sorting emits ascending state rather than cycling or mutating controlled inputs. Selection emits controlled state, equals uses dataKey and deepEquals uses structural comparison; header select-all uses all value rows. Editing stores drafts and committed overrides without mutating value; save/cancel are protected handlers. Expansion emits controlled maps and renders an empty placeholder row. Non-virtual mode has headers with aria-sort, focusable rows with aria-selected, loading marker, fixed DEFAULT_EMPTY_MESSAGE="No results found" (not an input), selection controls, expansion and row-edit actions. ArrowUp/Down/Home/End move among mounted sibling rows; Space/Enter select and Ctrl/Cmd+A select all in multiple mode, with child-control guards. Virtual mode composes UScroller with filteredValue, itemSize, lazy and a #content template, renders absolute-index cells without non-virtual headers/edit/expansion controls, and navigation is limited to mounted rows. UPaginator receives first/rows/totalRecords and updates internal cursor plus emits firstChange/rowsChange. rowsPerPageOptions is declared but not forwarded or otherwise read; lazyLoadOnInit is declared but not read. Only @ultimate/ng#UTable is public; no manifest ./table entry or barrel UTableColumn export. No Aura table registry entry exists; shared CSS and base token registration establish styling relationships without inventing a table preset. TABLE_METADATA links the Angular source; table.api.mdx is generated supporting documentation. All components extend UBaseComponent with inherited dt?: Record<string,unknown> and unstyled?: boolean; base ngOnInit registers theme variables and structural CSS. Local style modules and their css/classes constants and inline class-parameter types are source-only, owned by this family. Remaining private/protected state, lifecycle methods, render handlers and helpers belong to the owning record. No additional directive, hook, factory or base class is declared in these roots. Metadata source references establish relationships, not proof of runtime completeness. Manifest dist targets declare availability, not verified publication or installed artifact integrity. Prime comments are neutral provenance references only.

## Public exports

@ultimate/ng#UTable

## Owned source and evidence

packages/ng/src/table/index.ts
packages/ng/src/table/table-style.ts
packages/ng/src/table/table.ts

```text
packages/ng/src/table/table.ts: export class UTable
packages/ng/src/table/index.ts: export { UTable }
packages/ng/src/index.ts: export * from "./table";
packages/ng/package.json: "name": "@ultimate/ng"
packages/ng/src/table/table-style.ts: export const tableStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/component-metadata/src/records/table.ts: export const TABLE_METADATA
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
angular.paginator
angular.scroller
package.ultimate.uix-data.identity (pending cross-batch)
package.ultimate.uix-utils.object (pending cross-batch)
package.ultimate.uix-styles.table (pending cross-batch)
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
