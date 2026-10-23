# DataView

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

DataView renders a collection through an item template the app supplies. It has two named layouts, `list` and `grid`. The component provides the surrounding frame: header, footer, an optional embedded Paginator (top, bottom, or both), built-in sorting by `sortField`/`sortOrder`, lazy mode, and an empty message. It provides no grid CSS. The demos build the grid layout with utility classes (Tailwind/PrimeFlex) (`primeng-21.1.9:packages/primeng/src/dataview/dataview.ts`, `primevue-4.5.5:packages/primevue/src/dataview/DataView.vue`, `primereact-10.9.9:components/lib/dataview/DataView.js`).

## 2. Names & status

- Canonical name: **DataView** in all three frameworks. Listed under **Data** in `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, and `primereact-10.9.9:components/layout/menu.json`.
- PrimeReact also exports a helper, **DataViewLayoutOptions**, from `primereact/dataview`. It is a list/grid toggle button pair (`primereact-10.9.9:components/lib/dataview/DataView.js`). PrimeNG and PrimeVue have no equivalent; their demos use SelectButton.
- Deprecated: PrimeNG `styleClass` (`@deprecated since v20.0.0, use class instead`). PrimeVue and PrimeReact: none.
- PrimeNG selector aliases: `p-dataView`, `p-dataview`, `p-data-view`.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `DataViewModule` from `primeng/dataview`, or the standalone `DataView` (`primeng-21.1.9:apps/showcase/doc/dataview/import-doc.ts`).
- Source `primeng-21.1.9:packages/primeng/src/dataview/dataview.ts`; style `primeng-21.1.9:packages/primeng/src/dataview/style/dataviewstyle.ts` (imports `@primeuix/styles/dataview`); types `primeng-21.1.9:packages/primeng/src/types/dataview/dataview.types.ts`; exports `primeng-21.1.9:packages/primeng/src/dataview/public_api.ts`.
- Implements `BlockableUI`, so BlockUI can target it. Injects the root-provided `FilterService` for its public `filter()` method.

**PrimeVue 4.5.5**

- Import: `import DataView from 'primevue/dataview'` (`primevue-4.5.5:apps/showcase/doc/dataview/ImportDoc.vue`).
- Source `primevue-4.5.5:packages/primevue/src/dataview/DataView.vue`; props `primevue-4.5.5:packages/primevue/src/dataview/BaseDataView.vue`; types `primevue-4.5.5:packages/primevue/src/dataview/DataView.d.ts`; style `primevue-4.5.5:packages/primevue/src/dataview/style/DataViewStyle.js`.
- Emits `update:first`, `update:rows`, and `page`.

**PrimeReact 10.9.9**

- Import: `import { DataView, DataViewLayoutOptions } from 'primereact/dataview'` (`primereact-10.9.9:components/doc/dataview/importdoc.js`).
- Source `primereact-10.9.9:components/lib/dataview/DataView.js`; defaults and CSS `primereact-10.9.9:components/lib/dataview/DataViewBase.js`; types `primereact-10.9.9:components/lib/dataview/dataview.d.ts`.
- Paging is uncontrolled by default. If `onPage` is supplied, the `first`/`rows` props become controlled.

## 4. Anatomy

| Part                    | PrimeNG PT key                             | PrimeVue PT key | PrimeReact PT key                                                                  | Notes                                                              |
| ----------------------- | ------------------------------------------ | --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Root                    | `host` / `root`                            | `root`          | `root`                                                                             | Class `p-dataview` + `p-dataview-list`/`-grid`                     |
| Loading mask            | `loading`, `loadingOverlay`, `loadingIcon` | —               | `loadingOverlay`, `loadingIcon`                                                    | Built-in only in PrimeNG and PrimeReact                            |
| Header                  | `header`                                   | `header`        | `header`                                                                           |                                                                    |
| Paginator (top/bottom)  | `pcPaginator`                              | `pcPaginator`   | `paginator`                                                                        | Embedded Paginator with class `p-dataview-paginator-top`/`-bottom` |
| Content                 | `content`                                  | `content`       | `content`                                                                          | Wraps the rendered items                                           |
| Grid wrapper            | —                                          | —               | `grid`                                                                             | React only, when `itemTemplate` is used (`p-grid grid`)            |
| Empty message           | `emptyMessage`                             | `emptyMessage`  | `emptyMessage`                                                                     |                                                                    |
| Footer                  | `footer`                                   | `footer`        | `footer`                                                                           |                                                                    |
| Layout options (helper) | —                                          | —               | `root`, `listButton`, `gridButton`, `listIcon`, `gridIcon` (DataViewLayoutOptions) | React only                                                         |

Sources: `primeng-21.1.9:packages/primeng/src/types/dataview/dataview.types.ts`, `primevue-4.5.5:packages/primevue/src/dataview/DataView.d.ts`, `primereact-10.9.9:components/lib/dataview/dataview.d.ts`.

## 5. API highlights

| Concern         | PrimeNG                                                                                                                                                                                                                                                                                                                                                                                        | PrimeVue                                                                                                                                                                                                                                       | PrimeReact                                                                                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data            | `value`                                                                                                                                                                                                                                                                                                                                                                                        | `value`, `dataKey` (item key)                                                                                                                                                                                                                  | `value`, `dataKey` (React key)                                                                                                                                                                                                            |
| Layout          | `layout: 'list' \| 'grid'` (default `list`); emits `onChangeLayout` when the input changes                                                                                                                                                                                                                                                                                                     | `layout` (default `list`)                                                                                                                                                                                                                      | `layout` (default `list`); toggled via `DataViewLayoutOptions` `onChange`                                                                                                                                                                 |
| Item rendering  | `#list` / `#grid` templates, each receiving the current page's item array (`$implicit`)                                                                                                                                                                                                                                                                                                        | `list` / `grid` slots receiving `{ items }`                                                                                                                                                                                                    | `itemTemplate(item, layout)` (one per item) **or** `listTemplate(items, layout)` (whole page)                                                                                                                                             |
| Header / footer | `#header`, `#footer` templates, or `p-header` / `p-footer` content                                                                                                                                                                                                                                                                                                                             | `header`, `footer` slots                                                                                                                                                                                                                       | `header`, `footer` props                                                                                                                                                                                                                  |
| Pagination      | `paginator`, `rows`, `first`, `totalRecords`, `pageLinks` (5), `rowsPerPageOptions`, `paginatorPosition` (`bottom`), `alwaysShowPaginator`, `showCurrentPageReport`, `showJumpToPageDropdown`, `showPageLinks`, `showFirstLastIcon`, `paginatorDropdownAppendTo`, `paginatorDropdownScrollHeight`, `paginatorStyleClass`; templates `paginatorleft`, `paginatorright`, `paginatordropdownitem` | `paginator`, `rows`, `first`, `totalRecords`, `pageLinkSize`, `rowsPerPageOptions`, `paginatorPosition`, `alwaysShowPaginator`, `paginatorTemplate`, `currentPageReportTemplate`; slots `paginatorstart`, `paginatorend`, `paginatorcontainer` | `paginator`, `rows`, `first`, `totalRecords`, `pageLinkSize`, `rowsPerPageOptions`, `paginatorPosition`, `alwaysShowPaginator`, `paginatorTemplate`, `paginatorLeft`, `paginatorRight`, `paginatorClassName`, `paginatorDropdownAppendTo` |
| Page event      | `onPage {first, rows}`                                                                                                                                                                                                                                                                                                                                                                         | `page {first, rows, page, pageCount}` + `update:first/rows`                                                                                                                                                                                    | `onPage {first, rows, page, pageCount}`                                                                                                                                                                                                   |
| Sorting         | `sortField`, `sortOrder`; emits `onSort {sortField, sortOrder}`                                                                                                                                                                                                                                                                                                                                | `sortField` (string or function), `sortOrder`                                                                                                                                                                                                  | `sortField`, `sortOrder` (`1`/`-1`/`0`/`null`)                                                                                                                                                                                            |
| Lazy            | `lazy`, `lazyLoadOnInit` (true); emits `onLazyLoad {first, rows, sortField, sortOrder}`                                                                                                                                                                                                                                                                                                        | `lazy` (no lazy event; the page event drives loading)                                                                                                                                                                                          | `lazy` (the page event drives loading)                                                                                                                                                                                                    |
| Loading         | `loading`, `loadingIcon` (class string), `#loadingicon` template                                                                                                                                                                                                                                                                                                                               | N/A (no loading prop)                                                                                                                                                                                                                          | `loading`, `loadingIcon`                                                                                                                                                                                                                  |
| Empty           | `emptyMessage` (falls back to the `emptyMessage` translation), `#emptymessage` template                                                                                                                                                                                                                                                                                                        | `empty` slot `{ layout }`; text only from locale `emptyMessage`                                                                                                                                                                                | `emptyMessage` (falls back to locale `emptyMessage`)                                                                                                                                                                                      |
| Filtering       | Public `filter(value, matchMode = 'contains')` using `filterBy` (comma-separated fields), `filterLocale`, and FilterService                                                                                                                                                                                                                                                                    | N/A                                                                                                                                                                                                                                            | N/A                                                                                                                                                                                                                                       |
| Other           | `trackBy`, `gridStyleClass`, `#listicon`/`#gridicon` (declared but not used in the template)                                                                                                                                                                                                                                                                                                   | —                                                                                                                                                                                                                                              | `gutter` (false); `getElement()`                                                                                                                                                                                                          |

## 6. Usage guidance

- **Basic:** give `value` plus a list template or slot. The template receives the visible items and lays them out itself (`primeng-21.1.9:apps/showcase/doc/dataview/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dataview/BasicDoc.vue`, `primereact-10.9.9:components/doc/dataview/basicdoc.js`).
- **Pagination:** turn on `paginator` and set `rows`. Customizing the embedded paginator follows the Paginator rules (`primeng-21.1.9:apps/showcase/doc/dataview/pagination-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dataview/PaginationDoc.vue`, `primereact-10.9.9:components/doc/dataview/paginationdoc.js`). In non-lazy mode the component slices `value`. In lazy mode it renders `value` as is, so the app supplies one page at a time and sets `totalRecords`.
- **Sorting:** an external control such as a Select sets `sortField` and `sortOrder`, and DataView sorts the data (`primeng-21.1.9:apps/showcase/doc/dataview/sorting-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dataview/SortingDoc.vue`, `primereact-10.9.9:components/doc/dataview/sortingdoc.js`). PrimeNG sorts `value` **in place** and resets `first` to 0. PrimeVue and PrimeReact sort a copy, using a locale comparator.
- **Layout:** switch `layout` between `list` and `grid`. Grid styling comes from utility CSS in the app. PrimeNG and PrimeVue demos switch with SelectButton; PrimeReact uses `DataViewLayoutOptions` (`primeng-21.1.9:apps/showcase/doc/dataview/layout-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dataview/LayoutDoc.vue`, `primereact-10.9.9:components/doc/dataview/layoutdoc.js`).
- **Loading:** the demos render Skeleton placeholders in the item templates while data loads (`primeng-21.1.9:apps/showcase/doc/dataview/loading-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dataview/LoadingDoc.vue`, `primereact-10.9.9:components/doc/dataview/loadingdoc.js`). PrimeNG and PrimeReact also have a `loading` overlay with a spinner.
- No services need to be provided by the app. PrimeNG's FilterService is `providedIn: 'root'`.

## 7. Accessibility

- All three docs say the layout-options container has role `group`, its buttons use `aria-pressed`, and they are labelled from `aria.listView` / `aria.gridView`. Keyboard support: Tab moves focus to the buttons, and Space toggles. For the paginator, the docs refer to Paginator (`primeng-21.1.9:apps/showcase/doc/dataview/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dataview/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/dataview/accessibilitydoc.js`).
- Doc/source mismatch: PrimeNG and PrimeVue ship no layout-options element at all, so the described semantics belong to whatever toggle the app uses (SelectButton in the demos). PrimeReact `DataViewLayoutOptions` renders a plain `<div>` with two `<button type="button">`s. It has no `role="group"`, no `aria-pressed`, and no `aria-label`; selection is shown only by the `p-highlight` class (`primereact-10.9.9:components/lib/dataview/DataView.js`, `primereact-10.9.9:components/lib/dataview/DataViewBase.js`). Its icon-only buttons therefore have no accessible name.
- DataView itself adds no roles or ARIA to its content. The item markup and its semantics are up to the app.
- The loading overlay (PrimeNG/PrimeReact) does not announce busy state (no `aria-busy`).

## 8. Theming

- PrimeNG/PrimeVue classes: `p-dataview`, `p-dataview-list`, `p-dataview-grid`, `p-dataview-header`, `p-dataview-content`, `p-dataview-empty-message`, `p-dataview-footer`, `p-dataview-paginator-top`, `p-dataview-paginator-bottom`. PrimeNG adds `p-dataview-loading`, `p-dataview-loading-overlay` (+`p-overlay-mask`), and `p-dataview-loading-icon` (`primeng-21.1.9:packages/primeng/src/dataview/style/dataviewstyle.ts`, `primevue-4.5.5:packages/primevue/src/dataview/style/DataViewStyle.js`).
- PrimeReact classes: `p-dataview`, `p-dataview-<layout>`, `p-dataview-loading`, `p-dataview-loading-overlay p-component-overlay`, `p-dataview-loading-icon`, `p-dataview-header`, `p-dataview-content`, `p-dataview-emptymessage` (no hyphen), `p-dataview-footer`, and the grid wrapper `p-grid grid` (+`p-nogutter grid-nogutter` when `gutter` is false). The layout options use `p-dataview-layout-options p-selectbutton p-button-group` with `p-button p-button-icon-only` buttons. Own CSS (`@layer primereact`) covers only the loading overlay (`primereact-10.9.9:components/lib/dataview/DataViewBase.js`). Tailwind preset entries `dataview` and `dataviewlayoutoptions` are in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/dataview/index.mjs`.
- Tokens: `DataViewDesignTokens` sections `root`, `header`, `content`, `footer`, `paginatorTop`, `paginatorBottom`, 26 tokens in total (`@primeuix/themes-2.0.3:types/dataview/index.d.ts`). Aura values are in `@primeuix/themes-2.0.3:dist/aura/dataview/index.mjs`. PrimeReact: tokens N/A.

## 9. Relationships

- Embeds **Paginator** and forwards the paginator props. PrimeVue forwards the headless `paginatorcontainer` slot as the Paginator `container` slot.
- Demos pair it with **SelectButton** (layout switch), **Select/Dropdown** (sort picker), **Skeleton** (loading), and **Tag**/**Button** in item templates.
- PrimeNG: works with **BlockUI** through `BlockableUI.getBlockableElement()`. Filtering uses `FilterService` (shared with Table).
- Close relatives: **DataScroller** (PrimeReact only, infinite scroll instead of pages) and **VirtualScroller**.

## 10. Dependencies

- PrimeNG: `primeng/paginator`, `primeng/icons` (`SpinnerIcon`), `primeng/api` (`FilterService`, `BlockableUI`, `Header`, `Footer`, `TranslationKeys`), `primeng/basecomponent`, `primeng/bind`, and `@primeuix/utils` (`resolveFieldData`).
- PrimeVue: `primevue/paginator`, `@primevue/core/basecomponent`, and `@primeuix/utils/object` (`localeComparator`, `resolveFieldData`, `sort`).
- PrimeReact: `../paginator/Paginator`, `../ripple/Ripple`, `../icons/spinner`, `../icons/bars`, `../icons/thlarge`, and `../api/Api` (`localeOption`).
- No external packages beyond each framework.

## 11. Framework differences

| Aspect               | PrimeNG                                   | PrimeVue                           | PrimeReact                                               |
| -------------------- | ----------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| Item template model  | Whole page array (`#list` / `#grid`)      | Whole page array (`list` / `grid`) | Per item (`itemTemplate`) or whole page (`listTemplate`) |
| Layout switcher      | None (app UI)                             | None (app UI)                      | `DataViewLayoutOptions` helper                           |
| Loading overlay      | Yes                                       | No                                 | Yes                                                      |
| Built-in text filter | `filter()` + `filterBy` via FilterService | No                                 | No                                                       |
| Lazy event           | `onLazyLoad`                              | Page event only                    | Page event only                                          |
| Sort mutates `value` | Yes (in place)                            | No (copy)                          | No (copy)                                                |
| Paging state         | Inputs updated internally; emits `onPage` | `v-model:first` / `v-model:rows`   | Uncontrolled unless `onPage` is given                    |
| Empty message class  | `p-dataview-empty-message`                | `p-dataview-empty-message`         | `p-dataview-emptymessage`                                |
| Design tokens        | `@primeuix/themes`                        | `@primeuix/themes`                 | N/A                                                      |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/dataview/dataview.ts`
- `primeng-21.1.9:packages/primeng/src/dataview/style/dataviewstyle.ts`
- `primeng-21.1.9:packages/primeng/src/dataview/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/dataview/dataview.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/filterservice.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/pagination-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/sorting-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/layout-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/loading-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dataview/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/dataview/DataView.vue`
- `primevue-4.5.5:packages/primevue/src/dataview/BaseDataView.vue`
- `primevue-4.5.5:packages/primevue/src/dataview/DataView.d.ts`
- `primevue-4.5.5:packages/primevue/src/dataview/style/DataViewStyle.js`
- `primevue-4.5.5:apps/showcase/doc/dataview/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dataview/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dataview/PaginationDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dataview/SortingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dataview/LayoutDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dataview/LoadingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dataview/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/dataview/DataView.js`
- `primereact-10.9.9:components/lib/dataview/DataViewBase.js`
- `primereact-10.9.9:components/lib/dataview/dataview.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/dataview/importdoc.js`
- `primereact-10.9.9:components/doc/dataview/basicdoc.js`
- `primereact-10.9.9:components/doc/dataview/paginationdoc.js`
- `primereact-10.9.9:components/doc/dataview/sortingdoc.js`
- `primereact-10.9.9:components/doc/dataview/layoutdoc.js`
- `primereact-10.9.9:components/doc/dataview/loadingdoc.js`
- `primereact-10.9.9:components/doc/dataview/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/dataview/index.mjs`
- `@primeuix/themes-2.0.3:types/dataview/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/dataview/index.mjs`
