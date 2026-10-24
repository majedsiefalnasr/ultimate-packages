# Paginator

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Paginator is a controlled navigation bar for paged data. It holds no data. From `totalRecords`, `rows` (page size), and `first` (zero-based index of the first record) it derives the page count and renders first/prev/page-link/next/last buttons. It can add a rows-per-page selector, a jump-to-page control, and a current-page report. On each change it emits a page-state object with `first`, `rows`, `page`, and `pageCount`. DataTable/Table, DataView, and TreeTable embed it for their built-in paging (`primeng-21.1.9:packages/primeng/src/paginator/paginator.ts`, `primevue-4.5.5:packages/primevue/src/paginator/Paginator.vue`, `primereact-10.9.9:components/lib/paginator/Paginator.js`).

## 2. Names & status

- Canonical name: **Paginator** in all three frameworks. Listed under **Data** in `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, and `primereact-10.9.9:components/layout/menu.json`.
- Deprecated members:
  - PrimeNG `styleClass` (`@deprecated since v20.0.0, use class instead`) and `dropdownAppendTo` (`@deprecated since v20.0.0. Use appendTo instead`) (`primeng-21.1.9:packages/primeng/src/paginator/paginator.ts`).
  - PrimeVue slots `firstpagelinkicon`, `prevpagelinkicon`, `nextpagelinkicon`, `lastpagelinkicon` (`@deprecated since v4.0`), replaced by `firsticon`, `previcon`, `nexticon`, `lasticon` (`primevue-4.5.5:packages/primevue/src/paginator/Paginator.d.ts`).
  - PrimeReact: none.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `PaginatorModule` from `primeng/paginator`, or the standalone `Paginator` (`primeng-21.1.9:apps/showcase/doc/paginator/import-doc.ts`).
- Selector `p-paginator`. Standalone, `OnPush`. Styling is applied to the host element through `host: { '[class]': ... }`, and a `@HostBinding('style.display')` hides the host when `alwaysShow` is false and there is at most one page.
- Source: `primeng-21.1.9:packages/primeng/src/paginator/paginator.ts`; style `primeng-21.1.9:packages/primeng/src/paginator/style/paginatorstyle.ts` (imports `@primeuix/styles/paginator`); types `primeng-21.1.9:packages/primeng/src/types/paginator/paginator.types.ts`; exports `primeng-21.1.9:packages/primeng/src/paginator/public_api.ts`.
- Single template. The element set is toggled by boolean inputs, not by a template string.

**PrimeVue 4.5.5**

- Import: `import Paginator from 'primevue/paginator'` (`primevue-4.5.5:apps/showcase/doc/paginator/ImportDoc.vue`).
- Source: `primevue-4.5.5:packages/primevue/src/paginator/Paginator.vue` with child SFCs `FirstPageLink.vue`, `PrevPageLink.vue`, `PageLinks.vue`, `NextPageLink.vue`, `LastPageLink.vue`, `CurrentPageReport.vue`, `RowsPerPageDropdown.vue`, `JumpToPageDropdown.vue`, `JumpToPageInput.vue`. Props in `primevue-4.5.5:packages/primevue/src/paginator/BasePaginator.vue`, types in `primevue-4.5.5:packages/primevue/src/paginator/Paginator.d.ts`, style in `primevue-4.5.5:packages/primevue/src/paginator/style/PaginatorStyle.js`.
- Emits `update:first` and `update:rows`, so `v-model:first` and `v-model:rows` work, plus `page`.

**PrimeReact 10.9.9**

- Import: `import { Paginator } from 'primereact/paginator'` (`primereact-10.9.9:components/doc/paginator/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/paginator/Paginator.js` with `FirstPageLink.js`, `PrevPageLink.js`, `PageLinks.js`, `NextPageLink.js`, `LastPageLink.js`, `CurrentPageReport.js`, `RowsPerPageDropdown.js`, `JumpToPageInput.js`. Defaults for each part are in `primereact-10.9.9:components/lib/paginator/PaginatorBase.js`; types in `primereact-10.9.9:components/lib/paginator/paginator.d.ts`.
- There is no JumpToPageDropdown part.

## 4. Anatomy

| Part                       | PrimeNG PT key                                  | PrimeVue PT key                | PrimeReact PT key                                                       | Element / child component          |
| -------------------------- | ----------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------- | ---------------------------------- |
| Outer container            | `host`                                          | `paginatorContainer` (`<nav>`) | —                                                                       | NG host element; Vue `<nav>`       |
| Root                       | `root`                                          | `root` (one per breakpoint)    | `root` (`<div>`)                                                        | Bar with the `p-paginator` class   |
| Inner content              | —                                               | `content`                      | —                                                                       | Vue only: wraps the template items |
| Start / end content        | `contentStart`, `contentEnd`                    | `contentStart`, `contentEnd`   | `left`, `end`                                                           | Custom areas at both ends          |
| Current page report        | `current`                                       | `current`                      | `current`                                                               | `<span>` text                      |
| First / prev / next / last | `first`, `prev`, `next`, `last`                 | same                           | `firstPageButton`, `prevPageButton`, `nextPageButton`, `lastPageButton` | `<button>`                         |
| Their icons                | `firstIcon`, `prevIcon`, `nextIcon`, `lastIcon` | same                           | `firstPageIcon`, `prevPageIcon`, `nextPageIcon`, `lastPageIcon`         | SVG icon                           |
| Page links                 | `pages`, `page`                                 | `pages`, `page`                | `pages`, `pageButton`                                                   | `<span>` holding `<button>`s       |
| Rows per page              | `pcRowPerPageDropdown`                          | `pcRowPerPageDropdown`         | `RPPDropdown`                                                           | NG/Vue Select, React Dropdown      |
| Jump-to-page select        | `pcJumpToPageDropdown`                          | `pcJumpToPageDropdown`         | —                                                                       | Select                             |
| Jump-to-page input         | `pcJumpToPageInput`                             | `pcJumpToPageInputText`        | `JTPInput`                                                              | InputNumber                        |

PT keys come from `primeng-21.1.9:packages/primeng/src/types/paginator/paginator.types.ts`, `primevue-4.5.5:packages/primevue/src/paginator/Paginator.d.ts`, and `primereact-10.9.9:components/lib/paginator/paginator.d.ts`. PrimeReact also has a `transition` PT key.

## 5. API highlights

Shared core (same name in all three frameworks): `totalRecords` (default `0`), `rows` (default `0`), `first` (default `0`), `pageLinkSize` (default `5`), `rowsPerPageOptions`, `alwaysShow` (default `true`), `currentPageReportTemplate`.

| Concern             | PrimeNG                                                                                                                                                                                                           | PrimeVue                                                                                                                                                                         | PrimeReact                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Change event        | `(onPageChange)` → `PaginatorState { first, rows, page, pageCount, totalRecords? }`                                                                                                                               | `@page` → `PageState { first, rows, page, pageCount }`, plus `update:first` and `update:rows`                                                                                    | `onPageChange(e)` → `{ first, rows, page, pageCount }`                                                                      |
| Element set         | Booleans `showFirstLastIcon` (true), `showPageLinks` (true), `showCurrentPageReport` (false), `showJumpToPageDropdown` (false), `showJumpToPageInput` (false); rows select shown when `rowsPerPageOptions` is set | `template` string of tokens, or an object keyed by max-width breakpoint (responsive)                                                                                             | `template` string, or `PaginatorTemplateOptions` object with `layout` plus a per-element render override                    |
| Default template    | N/A                                                                                                                                                                                                               | `FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown`                                                                                             | same as PrimeVue                                                                                                            |
| Report default      | `'{currentPage} of {totalPages}'`                                                                                                                                                                                 | `'({currentPage} of {totalPages})'`                                                                                                                                              | `'({currentPage} of {totalPages})'`                                                                                         |
| Report placeholders | `{currentPage}`, `{totalPages}`, `{first}`, `{last}`, `{rows}`, `{totalRecords}`                                                                                                                                  | same                                                                                                                                                                             | same                                                                                                                        |
| Side content        | `templateLeft` / `templateRight` inputs (context `$implicit: PaginatorState`)                                                                                                                                     | `start` / `end` slots (`{ state }`)                                                                                                                                              | `leftContent` / `rightContent` props                                                                                        |
| Fully custom UI     | N/A                                                                                                                                                                                                               | `container` slot (headless), receiving page data plus `firstPageCallback`, `prevPageCallback`, `nextPageCallback`, `lastPageCallback`, `rowChangeCallback`, `changePageCallback` | Per-element functions in `template` (each receives an options object with `onClick`/`onChange`, `className`, `disabled`, …) |
| Icons               | Templates `firstpagelinkicon`, `previouspagelinkicon`, `nextpagelinkicon`, `lastpagelinkicon`, `dropdownicon`                                                                                                     | Slots `firsticon`, `previcon`, `nexticon`, `lasticon`, `rowsperpagedropdownicon`, `jumptopagedropdownicon`                                                                       | Props `firstPageLinkIcon`, `prevPageLinkIcon`, `nextPageLinkIcon`, `lastPageLinkIcon`                                       |
| Overlay target      | `appendTo` (falls back to the global `overlayAppendTo` config), `dropdownScrollHeight` (`'200px'`)                                                                                                                | Inherited from the inner Select                                                                                                                                                  | `dropdownAppendTo` (d.ts says `document.body`)                                                                              |
| Other               | `locale` (localizes page numerals through `Intl.NumberFormat`), `dropdownItemTemplate`, `jumpToPageItemTemplate`                                                                                                  | —                                                                                                                                                                                | `getElement()` ref method                                                                                                   |

- "Show all" option: PrimeNG accepts an object `{ showAll: 'label' }` in `rowsPerPageOptions`. It maps to `totalRecords` (`primeng-21.1.9:packages/primeng/src/paginator/paginator.ts`). PrimeVue and PrimeReact type the option as `number[]`.

## 6. Usage guidance

- **Basic (controlled):** bind `first`, `rows`, and `totalRecords`, and update `first`/`rows` from the change event (or with `v-model` in Vue). The default template includes the rows select, so supply `rowsPerPageOptions` (`primeng-21.1.9:apps/showcase/doc/paginator/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/paginator/BasicDoc.vue`, `primereact-10.9.9:components/doc/paginator/basicdoc.js`).
- **Template / layout:** reorder or choose elements. PrimeNG uses the `show*` flags plus side templates (`primeng-21.1.9:apps/showcase/doc/paginator/template-doc.ts`). PrimeVue uses `template` tokens, including `JumpToPageDropdown`, `JumpToPageInput`, and `CurrentPageReport` (`primevue-4.5.5:apps/showcase/doc/paginator/TemplateDoc.vue`). PrimeReact splits this into Layout (`template.layout`) and Template (render overrides per element plus side content) (`primereact-10.9.9:components/doc/paginator/layoutdoc.js`, `primereact-10.9.9:components/doc/paginator/templatedoc.js`).
- **Current page report:** set the report format with placeholders (`primeng-21.1.9:apps/showcase/doc/paginator/currentpagereport-doc.ts`, `primevue-4.5.5:apps/showcase/doc/paginator/CurrentPageReportDoc.vue`). In PrimeReact it is the `CurrentPageReport` template token.
- **Responsive (PrimeVue only):** pass `template` as an object keyed by max-width breakpoints plus `default`. The component injects `@media` rules that show one bar per breakpoint (`primevue-4.5.5:apps/showcase/doc/paginator/ResponsiveDoc.vue`, `primevue-4.5.5:packages/primevue/src/paginator/Paginator.vue`).
- **Custom content:** the `start`/`end` slots in PrimeVue (`primevue-4.5.5:apps/showcase/doc/paginator/CustomContentDoc.vue`). The PrimeNG and PrimeReact equivalents are shown in their Template docs.
- **Headless (PrimeVue only):** the `container` slot replaces the whole UI and passes callbacks for navigation (`primevue-4.5.5:apps/showcase/doc/paginator/HeadlessDoc.vue`).
- **Images:** an image gallery paged by a standalone Paginator (`primeng-21.1.9:apps/showcase/doc/paginator/images-doc.ts`, `primereact-10.9.9:components/doc/paginator/imagesdoc.js`).
- No services required. ARIA labels come from the locale/translation `aria` keys of the global config.

## 7. Accessibility

- All three docs say the paginator sits in a `nav` element. First/prev/next/last buttons get `aria-label` from `aria.firstPageLabel`, `prevPageLabel`, `nextPageLabel`, and `lastPageLabel`. Page buttons are labelled from `aria.pageLabel`, and the current one has `aria-current="page"`. The report uses `aria-live="polite"`. The rows select is labelled by `aria.rowsPerPageLabel`, the jump input by `aria.jumpToPageInputLabel`, and the jump select by `aria.jumpToPageDropdownLabel`. Keyboard support: Tab moves between elements, and Enter/Space activates the focused control (`primeng-21.1.9:apps/showcase/doc/paginator/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/paginator/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/paginator/accessibilitydoc.js`).
- Doc/source mismatches:
  - `nav`: only PrimeVue renders `<nav>`. PrimeNG renders inside the `p-paginator` host with no `nav` element or role, and PrimeReact's root is a `<div>`. Applications have to add `role="navigation"` and a label themselves.
  - PrimeNG: the current-page report `<span>` has no `aria-live`, and the jump-to-page `p-inputnumber` gets no `aria-label` (`primeng-21.1.9:packages/primeng/src/paginator/paginator.ts`).
  - PrimeNG: the First button has no `disabled` attribute, only the `p-disabled` class (prev/next/last do have `disabled`), so it stays focusable on the first page. Clicking it there does nothing.
  - PrimeReact: page buttons use `aria-current="true"`, not `"page"` (`primereact-10.9.9:components/lib/paginator/PageLinks.js`). The rows-per-page Dropdown is labelled with `aria.jumpToPageDropdownLabel` instead of `rowsPerPageLabel` (`primereact-10.9.9:components/lib/paginator/RowsPerPageDropdown.js`).
- All three disable the controls when `totalRecords` is 0 (`empty`).

## 8. Theming

- PrimeNG/PrimeVue classes: `p-paginator`, `p-paginator-content-start`, `p-paginator-content-end`, `p-paginator-current`, `p-paginator-first`/`-prev`/`-next`/`-last` (+`-icon`), `p-paginator-pages`, `p-paginator-page` (+`p-paginator-page-selected`), `p-paginator-rpp-dropdown`, `p-paginator-jtp-dropdown`, `p-paginator-jtp-input`, and `p-disabled` on disabled buttons. PrimeVue adds `p-paginator-content` and the breakpoint classes `p-paginator-default` / `p-paginator-<key>` (`primeng-21.1.9:packages/primeng/src/paginator/style/paginatorstyle.ts`, `primevue-4.5.5:packages/primevue/src/paginator/style/PaginatorStyle.js`).
- PrimeReact classes are older and different: `p-paginator-left-content`, `p-paginator-right-content`, `p-paginator-element`, `p-link`, a shared `p-paginator-icon`, `p-paginator-page-start` / `p-paginator-page-end`, and `p-paginator-page-input`. The selected page is marked with `p-highlight` (`primereact-10.9.9:components/lib/paginator/PaginatorBase.js`, `primereact-10.9.9:components/doc/paginator/theming/styleddoc.js`). Its own CSS lives in `PaginatorBase.css.styles` (`@layer primereact`). A Tailwind preset entry is in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- Structural CSS (PrimeNG/PrimeVue): `@primeuix/styles-2.0.3:dist/paginator/index.mjs`, which includes the `:dir(rtl)` arrow rotation.
- Tokens: `PaginatorDesignTokens` sections `root`, `navButton`, `currentPageReport`, `jumpToPageInput`, 22 tokens in total (`@primeuix/themes-2.0.3:types/paginator/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`). Aura values are in `@primeuix/themes-2.0.3:dist/aura/paginator/index.mjs`. PrimeReact: tokens N/A.
- Hosts can theme the embedded paginator: DataTable has `paginatorTop` / `paginatorBottom` token groups, and DataView and TreeTable have them too.

## 9. Relationships

- Embeds Select (PrimeNG/PrimeVue) or Dropdown (PrimeReact) for rows per page and jump-to-page, and InputNumber for jump-to-page input. PrimeNG and PrimeVue page buttons use the Ripple directive.
- Embedded by Table/DataTable, DataView, and TreeTable in all three frameworks. Their `paginator*` props forward to these inputs (`primeng-21.1.9:packages/primeng/src/table/table.ts`, `primevue-4.5.5:packages/primevue/src/datatable/DataTable.vue`, `primereact-10.9.9:components/lib/datatable/DataTable.js`).
- PrimeNG Paginator registers itself under `PARENT_INSTANCE` so the PT of the nested Select and InputNumber is resolved against it.

## 10. Dependencies

- PrimeNG: `primeng/select`, `primeng/inputnumber`, `primeng/ripple`, `primeng/icons` (`AngleDoubleLeftIcon`, `AngleDoubleRightIcon`, `AngleLeftIcon`, `AngleRightIcon`), `primeng/api`, `primeng/basecomponent`, `primeng/bind`, and `@angular/forms` (`FormsModule`, used for `ngModel`).
- PrimeVue: `primevue/select`, `primevue/inputnumber`, `primevue/ripple`, `@primevue/icons`, `@primevue/core/basecomponent`, and `@primeuix/utils`.
- PrimeReact: `../dropdown/Dropdown`, `../inputnumber/InputNumber`, `../ripple/Ripple`, `../icons/*`, and `../api/Api` (`ariaLabel`).
- No external npm packages beyond each framework.

## 11. Framework differences

| Aspect                | PrimeNG                         | PrimeVue                                    | PrimeReact                                            |
| --------------------- | ------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Layout control        | `show*` boolean inputs          | `template` token string / breakpoint object | `template` string / options object                    |
| Responsive templates  | No                              | Yes (breakpoint keys)                       | No                                                    |
| Headless mode         | No                              | `container` slot                            | Per-element render functions                          |
| Jump-to-page dropdown | Yes                             | Yes                                         | No                                                    |
| Two-way binding       | No (event only)                 | `v-model:first`, `v-model:rows`             | No (controlled)                                       |
| Root markup           | Host element, no `nav`          | `<nav>` + `<div>`                           | `<div>`                                               |
| Report default        | `{currentPage} of {totalPages}` | `({currentPage} of {totalPages})`           | `({currentPage} of {totalPages})`                     |
| `aria-current` value  | `page`                          | `page`                                      | `true`                                                |
| Style classes         | `p-paginator-*` (v4 naming)     | same + `p-paginator-content`                | Legacy `p-paginator-element`, `p-link`, `p-highlight` |
| Design tokens         | `@primeuix/themes`              | `@primeuix/themes`                          | N/A                                                   |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/paginator/paginator.ts`
- `primeng-21.1.9:packages/primeng/src/paginator/style/paginatorstyle.ts`
- `primeng-21.1.9:packages/primeng/src/paginator/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/paginator/paginator.types.ts`
- `primeng-21.1.9:packages/primeng/src/table/table.ts`
- `primeng-21.1.9:apps/showcase/doc/paginator/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/paginator/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/paginator/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/paginator/currentpagereport-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/paginator/images-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/paginator/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/paginator/Paginator.vue`
- `primevue-4.5.5:packages/primevue/src/paginator/BasePaginator.vue`
- `primevue-4.5.5:packages/primevue/src/paginator/Paginator.d.ts`
- `primevue-4.5.5:packages/primevue/src/paginator/style/PaginatorStyle.js`
- `primevue-4.5.5:packages/primevue/src/datatable/DataTable.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/CurrentPageReportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/ResponsiveDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/CustomContentDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/HeadlessDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/paginator/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/paginator/Paginator.js`
- `primereact-10.9.9:components/lib/paginator/PaginatorBase.js`
- `primereact-10.9.9:components/lib/paginator/paginator.d.ts`
- `primereact-10.9.9:components/lib/paginator/PageLinks.js`
- `primereact-10.9.9:components/lib/paginator/RowsPerPageDropdown.js`
- `primereact-10.9.9:components/lib/datatable/DataTable.js`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/paginator/importdoc.js`
- `primereact-10.9.9:components/doc/paginator/basicdoc.js`
- `primereact-10.9.9:components/doc/paginator/layoutdoc.js`
- `primereact-10.9.9:components/doc/paginator/templatedoc.js`
- `primereact-10.9.9:components/doc/paginator/imagesdoc.js`
- `primereact-10.9.9:components/doc/paginator/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/paginator/theming/styleddoc.js`
- `@primeuix/styles-2.0.3:dist/paginator/index.mjs`
- `@primeuix/themes-2.0.3:types/paginator/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/paginator/index.mjs`
