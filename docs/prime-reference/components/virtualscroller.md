# VirtualScroller

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

VirtualScroller renders only the slice of a large list or grid that is visible in a scroll viewport, plus a tolerance buffer, and moves that slice with CSS transforms as the user scrolls. A hidden spacer element gives the scrollbar the full virtual height or width. The application supplies `items` and a fixed `itemSize` (a number, or `[height, width]` for the two-dimensional mode) and renders each item through a template. It scrolls vertically, horizontally, or in both directions, supports a scroll `delay`, and has a `lazy` mode that asks the application for a `{ first, last }` range of data. It is mostly an infrastructure component. Several other components embed it for their virtual-scroll options (Select or Dropdown, MultiSelect, Listbox, AutoComplete, DataTable, and in PrimeNG also Tree and TreeTable; see §9) (`primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.vue`, `primeng-21.1.9:packages/primeng/src/scroller/scroller.ts`, `primereact-10.9.9:components/lib/virtualscroller/VirtualScroller.js`).

## 2. Names & status

- Canonical name: **VirtualScroller**. It appears in the showcase menu of all three frameworks as `VirtualScroller` at route `/virtualscroller` (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- PrimeNG alias: the class, folder, module, package, and catalog key are all **Scroller**: `Scroller` class, `ScrollerModule`, `primeng/scroller`, `packages/primeng/src/scroller`, and showcase folder `apps/showcase/doc/scroller`. The selector accepts `p-scroller`, `p-virtualscroller`, `p-virtual-scroller` and `p-virtualScroller`. Only the pass-through type (`VirtualScrollerPassThrough`), `componentName`, CSS classes, and style name use the "virtualscroller" spelling. The showcase page route in `primeng-21.1.9:apps/showcase/pages/scroller/index.ts` is a `scroller` folder, while its menu entry reads `VirtualScroller`. There is no `src/virtualscroller` folder.
- The repository `GLOSSARY.md` lists `virtualscroller` as the canonical name but, in its alias list, names only Table → datatable and OrgChart → organizationchart. The PrimeNG `Scroller` alias is not recorded there.
- Catalog keys: `modules.scroller` and `modules.scrolleroptions` in `docs/prime-reference/catalog/primeng.json`; `modules.virtualscroller` and `modules.virtualscrollerstyle` in `docs/prime-reference/catalog/primevue.json`; `modules.virtualscroller` in `docs/prime-reference/catalog/primereact.json`.
- Deprecated members: PrimeReact `loaderIconTemplate` is marked deprecated since v9.2.3 in favour of `loadingIcon` (`primereact-10.9.9:components/lib/virtualscroller/virtualscroller.d.ts`). Nothing is deprecated in PrimeNG or PrimeVue.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { ScrollerModule } from 'primeng/scroller'` (`primeng-21.1.9:apps/showcase/doc/scroller/import-doc.ts`). The `Scroller` class is also standalone.
- Source: `primeng-21.1.9:packages/primeng/src/scroller/scroller.ts` (`Scroller extends BaseComponent<VirtualScrollerPassThrough>`, no view encapsulation, default change detection); public surface in `primeng-21.1.9:packages/primeng/src/scroller/public_api.ts`; style in `primeng-21.1.9:packages/primeng/src/scroller/style/scrollerstyle.ts`; types in `primeng-21.1.9:packages/primeng/src/types/scroller/scroller.types.ts`; the options bag in `primeng-21.1.9:packages/primeng/src/api/scrolleroptions.ts`; a unit spec in `primeng-21.1.9:packages/primeng/src/scroller/scroller.spec.ts`.
- Showcase page: `primeng-21.1.9:apps/showcase/pages/scroller/index.ts` (sections Import, Basic, Horizontal, Grid, Delay, Loading, Lazy, Programmatic, Template, Scroll Options, Accessibility; PT viewer in `primeng-21.1.9:apps/showcase/doc/scroller/pt/PTViewer.ts`).

**PrimeVue 4.5.5**

- Import: `import VirtualScroller from 'primevue/virtualscroller'` (`primevue-4.5.5:apps/showcase/doc/virtualscroller/ImportDoc.vue`).
- Source: `primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.vue` over the prop base `primevue-4.5.5:packages/primevue/src/virtualscroller/BaseVirtualScroller.vue`; typings in `primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.d.ts`; style in `primevue-4.5.5:packages/primevue/src/virtualscroller/style/VirtualScrollerStyle.js`; package entry `primevue-4.5.5:packages/primevue/src/virtualscroller/package.json`.
- Showcase page: `primevue-4.5.5:apps/showcase/pages/virtualscroller/index.vue` (Import, Basic, Horizontal, Grid, Delay, Loading, Lazy, Accessibility; PT in `primevue-4.5.5:apps/showcase/doc/virtualscroller/pt/index.vue`; theming in `primevue-4.5.5:apps/showcase/doc/virtualscroller/theming/index.vue`).

**PrimeReact 10.9.9**

- Import: `import { VirtualScroller } from 'primereact/virtualscroller'` (`primereact-10.9.9:components/doc/virtualscroller/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/virtualscroller/VirtualScroller.js` (`React.memo(React.forwardRef(...))`, display name `VirtualScroller`); defaults and CSS in `primereact-10.9.9:components/lib/virtualscroller/VirtualScrollerBase.js`; types in `primereact-10.9.9:components/lib/virtualscroller/virtualscroller.d.ts`; package entry `primereact-10.9.9:components/lib/virtualscroller/package.json`.
- Showcase page: `primereact-10.9.9:pages/virtualscroller/index.js` (Import, Basic, Horizontal, Grid, Delay, Loading, Lazy, Accessibility; PT wireframe `primereact-10.9.9:components/doc/virtualscroller/pt/wireframe.js`; theming Styled).

## 4. Anatomy

| Part         | PT key        | Element | Notes                                                                                                                               |
| ------------ | ------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Host         | `host`        | custom  | PrimeNG only. The `<p-scroller>` element itself; attributes are applied after view checks.                                          |
| Root         | `root`        | `<div>` | The scroll viewport: `p-virtualscroller`, plus `-inline`, `-both p-both-scroll` or `-horizontal p-horizontal-scroll`.               |
| Content      | `content`     | `<div>` | `p-virtualscroller-content`. Absolutely positioned and translated; holds the rendered slice of items.                               |
| Spacer       | `spacer`      | `<div>` | `p-virtualscroller-spacer`. A 1px element resized to the full virtual extent. Omitted when `showSpacer` is false.                   |
| Loader       | `loader`      | `<div>` | `p-virtualscroller-loader`, sticky and viewport-sized. Rendered only if loading, `showLoader` is on and `loaderDisabled` is off.    |
| Loading icon | `loadingIcon` | svg     | `p-virtualscroller-loading-icon`. The built-in spinner icon. A custom `loader` template replaces the mask styling (`-loader-mask`). |

PT keys: PrimeNG `VirtualScrollerPassThroughOptions` has `host`, `root`, `content`, `spacer`, `loader`, `loadingIcon` (`primeng-21.1.9:packages/primeng/src/types/scroller/scroller.types.ts`). PrimeVue and PrimeReact have the same keys without `host`, plus `hooks` (`primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.d.ts`, `primereact-10.9.9:components/lib/virtualscroller/virtualscroller.d.ts`). The PrimeReact root PT is applied together with all unrecognised props (`getOtherProps`), and the PrimeVue root uses the attribute-merging variant (`ptmi`).

## 5. API highlights

| Prop                            | Type                                   | Default                                         | Effect                                                                                                          |
| ------------------------------- | -------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `items`                         | `any[]` (or `any[][]` for `both`)      | none                                            | Full data array. In lazy mode a placeholder array of the final length.                                          |
| `itemSize`                      | `number` or `number[]`                 | `0`                                             | Item height (vertical), width (horizontal), or `[height, width]` (both). Must match the real rendered size.     |
| `orientation`                   | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'`                                    | Scroll axis.                                                                                                    |
| `scrollHeight` / `scrollWidth`  | `string`                               | none                                            | Viewport size. CSS width and height on the element work too.                                                    |
| `numToleratedItems`             | `number`                               | half a view                                     | Extra items kept in the DOM beyond the viewport. The default is half the number of items that fit (rounded up). |
| `delay`                         | `number` (ms)                          | `0`                                             | Waits after scrolling before updating the slice; with `showLoader` the loader shows meanwhile.                  |
| `resizeDelay`                   | `number` (ms)                          | `10`                                            | Debounce for resize handling.                                                                                   |
| `lazy`                          | `boolean`                              | `false`                                         | Fires the lazy-load callback with `{ first, last }` for each new range.                                         |
| `step`                          | `number`                               | `0`                                             | Page size in lazy mode. Changes the last index in the first request and the page-change check.                  |
| `loading`                       | `boolean`                              | `false` (PrimeVue); unset (PrimeNG, PrimeReact) | Externally controlled busy state. Honoured only when `lazy` is set, in all three.                               |
| `showLoader` / `loaderDisabled` | `boolean`                              | `false` / `false`                               | Enables the loader overlay; the second turns the built-in loader markup off entirely.                           |
| `showSpacer`                    | `boolean`                              | `true`                                          | Turn off the spacer when the application sizes the scroll extent itself.                                        |
| `appendOnly`                    | `boolean`                              | `false`                                         | Keeps previously rendered items instead of dropping them. Very large data can exhaust the browser.              |
| `inline`                        | `boolean`                              | `false`                                         | Positions the content statically rather than absolutely. Used when embedded in a table.                         |
| `autoSize`                      | `boolean`                              | `false`                                         | Lets the container follow the content size.                                                                     |
| `disabled`                      | `boolean`                              | `false`                                         | Turns virtualisation off. Children (or the default slot) and the content template render directly.              |
| `columns`                       | `any[]`                                | none                                            | Column list passed through to the content template for grid use.                                                |
| `tabindex` / `tabIndex`         | `number`                               | `0`                                             | Tab order of the root.                                                                                          |

Framework-specific additions:

- PrimeNG: `trackBy` (forwarded to the ngFor); `options: ScrollerOptions`, an object that copies every listed field into the matching input and, for the three callbacks, replaces the output emission. `contentStyleClass` is a plain accessor. `hostName` is an input used by the base class. Outputs: `onLazyLoad` (`{ first, last }`), `onScroll`, `onScrollIndexChange`. Templates: `content`, `item`, `loader`, `loadericon`; any other template type falls back to the item template (`primeng-21.1.9:packages/primeng/src/scroller/scroller.ts`, `primeng-21.1.9:packages/primeng/src/api/scrolleroptions.ts`).
- PrimeVue: emits `lazy-load`, `scroll`, `scroll-index-change`, and `update:numToleratedItems` (the computed tolerance can be bound with `v-model:numToleratedItems`). Slots: `content`, `item` (`{ item, options }`), `loader` (`{ options }`), `loadingicon` (`{ class }`) (`primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.vue`, `primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.d.ts`).
- PrimeReact: callbacks `onScroll`, `onScrollIndexChange` (`{ first, last }`, each a number or `{ rows, cols }`), `onLazyLoad`. Templates are props: `itemTemplate(item, options)`, `contentTemplate(options)`, `loadingTemplate(options)`, `loadingIcon` (an icon node or function), and the deprecated `loaderIconTemplate`. Children render when `disabled` (`primereact-10.9.9:components/lib/virtualscroller/virtualscroller.d.ts`).

Template/slot context, common to the three:

- Item options: `index`, `count`, `first`, `last`, `even`, `odd`.
- Content options: `items`, `getItemOptions(index)`, `getLoaderOptions(index, extra)`, `loading`, `itemSize`, `rows`, `columns`, `spacerStyle`, `contentStyle`, and the flags `vertical`, `horizontal`, `both`. PrimeNG also passes `contentStyleClass`, `scrollTo`, `scrollToIndex`, `orientation`, and `scrollableElement`. PrimeReact adds `className`, `contentRef`, `spacerRef`, `stickyRef`, `children`, `element`, and `props`.

Methods (instance or ref):

- `scrollTo(options)` is the native `ScrollToOptions` call.
- `scrollToIndex(index, behavior = 'auto')`. The source accepts an array of indexes for grid mode; the PrimeVue typing narrows it to `number`.
- `scrollInView(index, to, behavior = 'auto')` with `to` as `'to-start'` or `'to-end'`. Without `to` it falls back to `scrollToIndex`.
- `getRenderedRange()` returns `{ first, last, viewport: { first, last } }`.
- PrimeNG and PrimeReact also have `getElementRef()`.

## 6. Usage guidance

- **Basic:** `items`, `itemSize`, and an item template are required. The array must already have the final length, and the viewport size comes from `scrollWidth`/`scrollHeight` or from CSS width and height. The demos use 100,000 items at 50px (`primevue-4.5.5:apps/showcase/doc/virtualscroller/BasicDoc.vue`, `primeng-21.1.9:apps/showcase/doc/scroller/basic-doc.ts`, `primereact-10.9.9:components/doc/virtualscroller/basicdoc.js`).
- **Scroll options (PrimeNG only):** the whole configuration can be passed as a single `options` object (`primeng-21.1.9:apps/showcase/doc/scroller/scrolloptions-doc.ts`). This is how host components forward their virtual-scroll options.
- **Delay:** `delay` adds a scroll-time threshold that trades visual completeness for fewer renders. The PrimeVue demo compares no delay, 150ms, and 500ms (`primevue-4.5.5:apps/showcase/doc/virtualscroller/DelayDoc.vue`, `primeng-21.1.9:apps/showcase/doc/scroller/delay-doc.ts`, `primereact-10.9.9:components/doc/virtualscroller/delaydoc.js`).
- **Lazy loading:** set `lazy`, pass a placeholder array with the final length, handle the lazy-load event, and write the loaded rows into the `first..last` range of a new array. Pair it with `loading` and `showLoader` (`primevue-4.5.5:apps/showcase/doc/virtualscroller/LazyDoc.vue`, `primeng-21.1.9:apps/showcase/doc/scroller/lazyload-doc.ts`, `primereact-10.9.9:components/doc/virtualscroller/lazydoc.js`). The PrimeNG text asks for a template named `loadingItem`, but the templates the component recognises are `loader` and `loadericon`.
- **Loader:** `showLoader` blocks the viewport with a mask by default, and a custom loader template (a skeleton row in the demos) replaces it. PrimeNG and PrimeVue name it `loader`; PrimeReact calls it `loadingTemplate` (`primevue-4.5.5:apps/showcase/doc/virtualscroller/LoadingDoc.vue`, `primeng-21.1.9:apps/showcase/doc/scroller/loader-doc.ts`, `primereact-10.9.9:components/doc/virtualscroller/loadingdoc.js`).
- **Horizontal:** `orientation="horizontal"` and an `itemSize` equal to the item width. The content container needs a flex row; the PrimeVue demo does this through `pt` (`primevue-4.5.5:apps/showcase/doc/virtualscroller/HorizontalDoc.vue`, `primeng-21.1.9:apps/showcase/doc/scroller/horizontal-doc.ts`, `primereact-10.9.9:components/doc/virtualscroller/horizontaldoc.js`).
- **Grid:** `orientation="both"`, `itemSize` as `[height, width]`, and `items` as an array of rows (each a cell array). The demo uses a 1000 × 1000 matrix (`primevue-4.5.5:apps/showcase/doc/virtualscroller/GridDoc.vue`, `primeng-21.1.9:apps/showcase/doc/scroller/grid-doc.ts`, `primereact-10.9.9:components/doc/virtualscroller/griddoc.js`).
- **Programmatic scrolling (PrimeNG only):** call `scrollToIndex` on the component instance (`primeng-21.1.9:apps/showcase/doc/scroller/programmatic-doc.ts`). The method also exists in PrimeVue and PrimeReact, but no demo covers it.
- **Templates (PrimeNG only):** valid template names are `content`, `item`, `loader`, and `loadericon` (`primeng-21.1.9:apps/showcase/doc/scroller/template-doc.ts`).
- **Import:** see §3 (`primevue-4.5.5:apps/showcase/doc/virtualscroller/ImportDoc.vue`, `primereact-10.9.9:components/doc/virtualscroller/importdoc.js`).

## 7. Accessibility

- The three accessibility docs say the same thing: no role is enforced, any ARIA role or attribute may be added because attributes pass through to the container element, and the component has no built-in interactive elements, so it adds no keyboard support (`primeng-21.1.9:apps/showcase/doc/scroller/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/virtualscroller/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/virtualscroller/accessibilitydoc.js`).
- Doc/source mismatch: the PrimeNG and PrimeReact docs state that a semantic list element is used. In all three sources the root, content, and spacer are `<div>` elements. The list semantics must come from the item template or from ARIA attributes. The PrimeReact doc also mentions a `listProps` property, which does not exist in the component (`primereact-10.9.9:components/lib/virtualscroller/VirtualScrollerBase.js`).
- The root is focusable (`tabindex` 0 by default, scrollable region). Because off-screen items are not in the DOM, assistive technologies and in-page search cannot see them. Setting size and position information (for example `aria-setsize` and `aria-posinset` on items, using `options.index` and the total count) is left to the application.
- Loading state is visual only (spinner or skeleton). There is no live region.

## 8. Theming

- Structural classes: `p-virtualscroller` (root), `p-virtualscroller-content`, `p-virtualscroller-spacer`, `p-virtualscroller-loader`, `p-virtualscroller-loader-mask` (loader without a custom template), `p-virtualscroller-loading-icon`; modifiers `p-virtualscroller-inline`, `p-virtualscroller-both` with `p-both-scroll`, and `p-virtualscroller-horizontal` with `p-horizontal-scroll` (`primeng-21.1.9:packages/primeng/src/scroller/style/scrollerstyle.ts`, `primevue-4.5.5:packages/primevue/src/virtualscroller/style/VirtualScrollerStyle.js`). PrimeVue also puts `p-virtualscroller-loading` on the content while it is loading.
- The structural CSS (root `overflow: auto` with `contain: strict`; absolute content and spacer; sticky loader) is the same in all three frameworks. For PrimeVue it ships in `@primeuix/styles-2.0.3:dist/virtualscroller/index.mjs`; PrimeNG inlines its own copy that references the same tokens; PrimeReact carries its own copy in `primereact-10.9.9:components/lib/virtualscroller/VirtualScrollerBase.js`.
- Design tokens (PrimeNG, PrimeVue): `virtualscroller.loader.mask.background`, `virtualscroller.loader.mask.color`, and `virtualscroller.loader.icon.size` (`@primeuix/themes-2.0.3:types/virtualscroller/index.d.ts`). Preset values are identical in Aura, Lara, and Nora: background `{content.background}`, colour `{text.muted.color}`, icon size `2rem`. Material has the same values and an empty `css` string (`@primeuix/themes-2.0.3:dist/aura/virtualscroller/index.mjs`, `@primeuix/themes-2.0.3:dist/material/virtualscroller/index.mjs`). There is no tokens-source directory for virtualscroller.
- PrimeVue adds one rule that resets the transform of a loading content element and makes it sticky, which keeps the loader in view.
- PrimeReact: no design tokens. The loader uses the generic `p-component-overlay` class, and the icon size is a fixed `2rem` in the component's own CSS. The Tailwind preset has no `virtualscroller` entry, but `PrimeReactPTOptions` has a typed `virtualscroller` key for global pass-through (`primereact-10.9.9:components/lib/api/api.d.ts`). The only PT demo is a wireframe image (`primereact-10.9.9:components/doc/virtualscroller/pt/wireframe.js`).
- The PrimeVue theming page lists the classes and the loader tokens through shared helpers (`primevue-4.5.5:apps/showcase/doc/virtualscroller/theming/index.vue`); PrimeNG has no theming doc folder and links to a `scroller` theme page; PrimeReact lists classes in `primereact-10.9.9:components/doc/virtualscroller/theming/styleddoc.js`, which omits the spacer, loading-icon, and inline classes.

## 9. Relationships

- Embedded by other components through a virtual-scroll option. PrimeNG: Select, MultiSelect, Listbox, AutoComplete, Tree, Table, and TreeTable pass `virtualScroll`, `virtualScrollItemSize`, and `virtualScrollOptions`, forwarded to `options` (`primeng-21.1.9:packages/primeng/src/table/table.ts`, `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`, `primeng-21.1.9:packages/primeng/src/select/select.ts`, `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`, `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`, `primeng-21.1.9:packages/primeng/src/autocomplete/autocomplete.ts`, `primeng-21.1.9:packages/primeng/src/tree/tree.ts`). In PrimeNG's Table the scroller runs in inline mode, with the built-in loader and spacer turned off.
- PrimeVue: Select, MultiSelect, Listbox, AutoComplete, and DataTable (as `DTVirtualScroller`) take `virtualScrollerOptions` (`primevue-4.5.5:packages/primevue/src/select/Select.vue`, `primevue-4.5.5:packages/primevue/src/datatable/DataTable.vue`, `primevue-4.5.5:packages/primevue/src/multiselect/MultiSelect.vue`, `primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`, `primevue-4.5.5:packages/primevue/src/autocomplete/AutoComplete.vue`).
- PrimeReact: Dropdown, MultiSelect, Listbox, AutoComplete, and DataTable accept `virtualScrollerOptions` (`primereact-10.9.9:components/lib/dropdown/DropdownPanel.js`, `primereact-10.9.9:components/lib/datatable/DataTable.js`, `primereact-10.9.9:components/lib/datatable/TableBody.js`, `primereact-10.9.9:components/lib/listbox/ListBox.js`, `primereact-10.9.9:components/lib/autocomplete/AutoCompletePanel.js`, `primereact-10.9.9:components/lib/multiselect/MultiSelectPanel.js`). Its DataTable can also return the instance through `getVirtualScroller`.
- Table-like records: [datatable.md](datatable.md) and [treetable.md](treetable.md) document the host components that consume it.
- Alternatives for long lists: [datascroller.md](datascroller.md) appends pages and keeps every item in the DOM; [dataview.md](dataview.md) pages with [paginator.md](paginator.md). VirtualScroller keeps the DOM small without pagination, but needs fixed item sizes.
- The loader demos use Skeleton as the placeholder.

## 10. Dependencies

- PrimeNG: `@primeuix/utils` (`findSingle`, `getHeight`, `getWidth`, `isTouchDevice`, `isVisible`), `primeng/api` (`PrimeTemplate`, `ScrollerOptions`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`SpinnerIcon`), `primeng/ts-helpers`, and Angular `CommonModule` (`primeng-21.1.9:packages/primeng/src/scroller/scroller.ts`).
- PrimeVue: `@primeuix/utils/dom` (`findSingle`, `getHeight`, `getWidth`, `isVisible`), `@primevue/icons/spinner`, `@primeuix/styles/virtualscroller`, and the PrimeVue base component and style machinery (`primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.vue`, `primevue-4.5.5:packages/primevue/src/virtualscroller/style/VirtualScrollerStyle.js`).
- PrimeReact: internal modules only: `../api/Api`, `../hooks/Hooks` (`useEventListener`, `useMergeProps`, `usePrevious`, `useResizeListener`, `useStyle`, `useUpdateEffect`), `../icons/spinner`, `../utils/Utils`, and `../componentbase/ComponentBase` (`primereact-10.9.9:components/lib/virtualscroller/VirtualScroller.js`).
- Browser behaviour: PrimeVue observes the root with `ResizeObserver` and also listens to window `resize` and `orientationchange`. PrimeNG and PrimeReact listen to window `resize` and `orientationchange` only. PrimeNG attaches them outside the Angular zone and uses `orientationchange` only on touch devices.

## 11. Framework differences

| Aspect                     | PrimeNG                                                      | PrimeVue                                                      | PrimeReact                                                          |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| Name in code               | `Scroller` (selector also `p-virtualscroller`)               | `VirtualScroller`                                             | `VirtualScroller`                                                   |
| Config as an object        | `options` input (`ScrollerOptions`)                          | spread props (`v-bind`)                                       | spread props                                                        |
| Lazy event                 | `onLazyLoad` output                                          | `lazy-load` event                                             | `onLazyLoad` prop                                                   |
| Templates                  | `content`, `item`, `loader`, `loadericon`                    | slots `content`, `item`, `loader`, `loadingicon`              | `itemTemplate`, `contentTemplate`, `loadingTemplate`, `loadingIcon` |
| Tolerance output           | None                                                         | `update:numToleratedItems`                                    | None                                                                |
| Resize detection           | window events                                                | ResizeObserver plus window events                             | window events                                                       |
| Page-change check (`step`) | page changes whenever `step` is set                          | `step` applies only when not lazy                             | page changes whenever `step` is set                                 |
| `trackBy`                  | Yes                                                          | N/A                                                           | N/A (key is `options.index`)                                        |
| PT keys                    | `host`, `root`, `content`, `spacer`, `loader`, `loadingIcon` | `root`, `content`, `spacer`, `loader`, `loadingIcon`, `hooks` | same as PrimeVue                                                    |
| Design tokens              | `virtualscroller.loader.*`                                   | `virtualscroller.loader.*`                                    | N/A                                                                 |
| Loader styling             | token-driven mask                                            | token-driven mask                                             | `p-component-overlay`, 2rem icon                                    |
| Programmatic demo          | Yes                                                          | No                                                            | No                                                                  |
| Doc-section differences    | extra Scroll Options, Programmatic, Template sections        | none                                                          | none                                                                |

Defects and mismatches found while reading the sources:

- PrimeVue: with a `loader` slot and `orientation="both"`, the loader options reference `d_numItemsInViewport`, but the data field is `numItemsInViewport`, so the expression reads an undefined field (`primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.vue`).
- PrimeVue renders its `loadingicon` slot (default: spinner) inside the loader even when a custom `loader` slot is supplied, so both appear. PrimeReact shows the icon only when no `loadingTemplate` is set.
- PrimeReact: the loader-icon template in the source receives `iconClassName`, `element`, and `props`, while the d.ts documents `className`. The d.ts also declares the component as a class and declares `VirtualScrollerState` twice (`primereact-10.9.9:components/lib/virtualscroller/virtualscroller.d.ts`).
- PrimeNG: `ScrollerContentOptions.itemSize` is typed as `number` while the input also accepts `number[]`, and the type omits `scrollTo`, `orientation`, and `scrollableElement`, which the source supplies (`primeng-21.1.9:packages/primeng/src/types/scroller/scroller.types.ts`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/scroller/scroller.ts`
- `primeng-21.1.9:packages/primeng/src/scroller/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/scroller/scroller.spec.ts`
- `primeng-21.1.9:packages/primeng/src/scroller/style/scrollerstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/scroller/scroller.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/scrolleroptions.ts`
- `primeng-21.1.9:packages/primeng/src/table/table.ts`
- `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`
- `primeng-21.1.9:packages/primeng/src/select/select.ts`
- `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`
- `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`
- `primeng-21.1.9:packages/primeng/src/autocomplete/autocomplete.ts`
- `primeng-21.1.9:packages/primeng/src/tree/tree.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/pages/scroller/index.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/scrolloptions-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/delay-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/lazyload-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/loader-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/horizontal-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/grid-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/programmatic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scroller/pt/PTViewer.ts`
- `primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.vue`
- `primevue-4.5.5:packages/primevue/src/virtualscroller/BaseVirtualScroller.vue`
- `primevue-4.5.5:packages/primevue/src/virtualscroller/VirtualScroller.d.ts`
- `primevue-4.5.5:packages/primevue/src/virtualscroller/package.json`
- `primevue-4.5.5:packages/primevue/src/virtualscroller/style/VirtualScrollerStyle.js`
- `primevue-4.5.5:packages/primevue/src/datatable/DataTable.vue`
- `primevue-4.5.5:packages/primevue/src/select/Select.vue`
- `primevue-4.5.5:packages/primevue/src/multiselect/MultiSelect.vue`
- `primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`
- `primevue-4.5.5:packages/primevue/src/autocomplete/AutoComplete.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/pages/virtualscroller/index.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/DelayDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/LazyDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/LoadingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/HorizontalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/GridDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/virtualscroller/theming/index.vue`
- `primereact-10.9.9:components/lib/virtualscroller/VirtualScroller.js`
- `primereact-10.9.9:components/lib/virtualscroller/VirtualScrollerBase.js`
- `primereact-10.9.9:components/lib/virtualscroller/virtualscroller.d.ts`
- `primereact-10.9.9:components/lib/virtualscroller/package.json`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/dropdown/DropdownPanel.js`
- `primereact-10.9.9:components/lib/datatable/DataTable.js`
- `primereact-10.9.9:components/lib/datatable/TableBody.js`
- `primereact-10.9.9:components/lib/listbox/ListBox.js`
- `primereact-10.9.9:components/lib/autocomplete/AutoCompletePanel.js`
- `primereact-10.9.9:components/lib/multiselect/MultiSelectPanel.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:pages/virtualscroller/index.js`
- `primereact-10.9.9:components/doc/virtualscroller/importdoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/basicdoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/delaydoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/lazydoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/loadingdoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/horizontaldoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/griddoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/virtualscroller/pt/wireframe.js`
- `primereact-10.9.9:components/doc/virtualscroller/theming/styleddoc.js`
- `@primeuix/styles-2.0.3:dist/virtualscroller/index.mjs`
- `@primeuix/themes-2.0.3:types/virtualscroller/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/virtualscroller/index.mjs`
- `@primeuix/themes-2.0.3:dist/material/virtualscroller/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
