# OrderList

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

OrderList shows one collection as a multi-select list with a column of reorder buttons (move up, move to top, move down, move to bottom). The user selects one or more items and moves them, and the component reports the new order. PrimeNG and PrimeVue build it from an embedded Listbox plus four Buttons. PrimeReact renders its own list markup. Filtering and drag-and-drop reordering exist in PrimeNG and PrimeReact only (`primeng-21.1.9:packages/primeng/src/orderlist/orderlist.ts`, `primevue-4.5.5:packages/primevue/src/orderlist/OrderList.vue`, `primereact-10.9.9:components/lib/orderlist/OrderList.js`).

## 2. Names & status

- Canonical name: **OrderList** in all three frameworks. Listed under **Data** in `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, and `primereact-10.9.9:components/layout/menu.json`.
- Legacy aliases: none.
- Deprecated: PrimeNG `styleClass` (`@deprecated since v20.0.0`). PrimeVue `item` slot (`@deprecated since v4.0`, use `option`). PrimeReact: none.
- PrimeNG selector aliases: `p-orderList`, `p-orderlist`, `p-order-list`.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `OrderListModule` from `primeng/orderlist`, or the standalone `OrderList` (`primeng-21.1.9:apps/showcase/doc/orderlist/import-doc.ts`).
- Source `primeng-21.1.9:packages/primeng/src/orderlist/orderlist.ts`; style `primeng-21.1.9:packages/primeng/src/orderlist/style/orderliststyle.ts` (imports `@primeuix/styles/orderlist`); types `primeng-21.1.9:packages/primeng/src/types/orderlist/orderlist.types.ts`; exports `primeng-21.1.9:packages/primeng/src/orderlist/public_api.ts`.
- Renders a `p-listbox` in `multiple` mode for the items. Drag-and-drop uses `@angular/cdk/drag-drop`. Injects the root-provided `FilterService`.

**PrimeVue 4.5.5**

- Import: `import OrderList from 'primevue/orderlist'` (`primevue-4.5.5:apps/showcase/doc/orderlist/ImportDoc.vue`).
- Source `primevue-4.5.5:packages/primevue/src/orderlist/OrderList.vue`; props `primevue-4.5.5:packages/primevue/src/orderlist/BaseOrderList.vue`; types `primevue-4.5.5:packages/primevue/src/orderlist/OrderList.d.ts`; style `primevue-4.5.5:packages/primevue/src/orderlist/style/OrderListStyle.js`.
- Renders a `Listbox` in `multiple` mode. Order is bound with `v-model`; selection with `v-model:selection`.

**PrimeReact 10.9.9**

- Import: `import { OrderList } from 'primereact/orderlist'` (`primereact-10.9.9:components/doc/orderlist/importdoc.js`).
- Source `primereact-10.9.9:components/lib/orderlist/OrderList.js`, with `primereact-10.9.9:components/lib/orderlist/OrderListControls.js` and `primereact-10.9.9:components/lib/orderlist/OrderListSubList.js`; defaults and CSS `primereact-10.9.9:components/lib/orderlist/OrderListBase.js`; types `primereact-10.9.9:components/lib/orderlist/orderlist.d.ts`.
- Controlled: the app feeds `value` and writes back the array from `onChange`. Selection is internal state only.

## 4. Anatomy

| Part         | PrimeNG PT key                                                                | PrimeVue PT key                                                               | PrimeReact PT key                                                     | Notes                                                                   |
| ------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Root         | `host` / `root`                                                               | `root`                                                                        | `root`                                                                | `p-orderlist p-component`                                               |
| Controls     | `controls`                                                                    | `controls`                                                                    | `controls`                                                            | Column of four buttons; PrimeNG can place it right (`controlsPosition`) |
| Move buttons | `pcMoveUpButton`, `pcMoveTopButton`, `pcMoveDownButton`, `pcMoveBottomButton` | `pcMoveUpButton`, `pcMoveTopButton`, `pcMoveDownButton`, `pcMoveBottomButton` | `moveUpButton`, `moveTopButton`, `moveDownButton`, `moveBottomButton` | Button components                                                       |
| List         | `pcListbox`                                                                   | `pcListbox`                                                                   | `container`, `list`, `item`                                           | Listbox in NG/Vue; own `ul`/`li` in React                               |
| Header       | (inside Listbox, `#header` template)                                          | (inside Listbox, `header` slot)                                               | `header`                                                              |                                                                         |
| Filter       | (inside Listbox)                                                              | —                                                                             | `filterContainer`, `filter`, `filterInput`, `filterIcon`              | No filter in PrimeVue                                                   |
| Drop point   | —                                                                             | —                                                                             | `droppoint`                                                           | React-only drag indicator between items                                 |

Sources: `primeng-21.1.9:packages/primeng/src/types/orderlist/orderlist.types.ts`, `primevue-4.5.5:packages/primevue/src/orderlist/OrderList.d.ts`, `primereact-10.9.9:components/lib/orderlist/orderlist.d.ts`.

## 5. API highlights

| Concern        | PrimeNG                                                                                                                                                                                                            | PrimeVue                                                                                          | PrimeReact                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Data           | `value`, `dataKey` (also used as Listbox `optionLabel`, fallback `'name'`)                                                                                                                                         | `modelValue` (`v-model`), `dataKey`                                                               | `value`, `dataKey` (typed required)                                                                                               |
| Reorder event  | `onReorder` (the moved items)                                                                                                                                                                                      | `reorder {originalEvent, value, direction}` + `update:modelValue`                                 | `onChange {originalEvent, value}`                                                                                                 |
| Selection      | `selection` + `selectionChange`, `onSelectionChange {originalEvent, value}`, `metaKeySelection` (false)                                                                                                            | `selection` (`v-model:selection`), `selection-change`, `metaKeySelection` (false)                 | Internal only                                                                                                                     |
| Item rendering | `#item` template (`$implicit`, `selected`, `index`)                                                                                                                                                                | `option` slot `{option, selected, index}`                                                         | `itemTemplate(item)`                                                                                                              |
| Header         | `#header` template (`header` input is declared but not rendered)                                                                                                                                                   | `header` slot                                                                                     | `header` prop                                                                                                                     |
| Filter         | `filterBy`, `filterPlaceholder`, `filterLocale`, `filterMatchMode` (`'contains'`); `onFilterEvent`; `#filter` template; `resetFilter()`                                                                            | N/A                                                                                               | `filter` (false), `filterBy`, `filterMatchMode` (`'contains'`), `filterLocale`, `filterPlaceholder`, `filterTemplate`, `onFilter` |
| Drag and drop  | `dragdrop` (false)                                                                                                                                                                                                 | N/A                                                                                               | `dragdrop` (false)                                                                                                                |
| Layout         | `scrollHeight` (`'14rem'`), `listStyle`, `controlsPosition` (`'left'`), `stripedRows`, `responsive`, `breakpoint` (`'960px'`)                                                                                      | `scrollHeight` (`'14rem'`), `listStyle`, `striped`, `responsive` (true), `breakpoint` (`'960px'`) | `listStyle`, `breakpoint` (`'960px'`, always applied)                                                                             |
| Buttons        | `buttonProps` (`{severity: 'secondary'}`), `moveUpButtonProps`, `moveTopButtonProps`, `moveDownButtonProps`, `moveBottomButtonProps`; icon templates `moveupicon`, `movetopicon`, `movedownicon`, `movebottomicon` | Same props; icon slots of the same names; `controlsstart` / `controlsend` slots                   | `moveUpIcon`, `moveTopIcon`, `moveDownIcon`, `moveBottomIcon`                                                                     |
| Empty          | `#empty`, `#emptyfilter` templates                                                                                                                                                                                 | (Listbox locale)                                                                                  | —                                                                                                                                 |
| Focus          | `autoOptionFocus` (true), `tabindex`, `onFocus`, `onBlur`                                                                                                                                                          | `autoOptionFocus` (true), `focusOnHover` (true), `tabindex` (0), `focus`, `blur`                  | `autoOptionFocus` (true), `focusOnHover` (true), `tabIndex` (0)                                                                   |
| Other          | `disabled`, `ariaLabel`, `ariaLabelledBy`; `trackBy` and `ariaFilterLabel` declared but unused                                                                                                                     | `disabled`, `ariaLabel`, `ariaLabelledby`                                                         | `ariaLabel`, `ariaLabelledBy`, `getElement()`                                                                                     |

## 6. Usage guidance

- **Basic:** bind the array and a `dataKey`, and render each item with a template. The demos use `breakpoint="575px"` so the controls stack on small screens (`primeng-21.1.9:apps/showcase/doc/orderlist/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/orderlist/BasicDoc.vue`, `primereact-10.9.9:components/doc/orderlist/basicdoc.js`).
- **Filter:** set `filterBy` (PrimeNG) or `filter` + `filterBy` (PrimeReact) to show a search input above the list (`primeng-21.1.9:apps/showcase/doc/orderlist/filter-doc.ts`, `primereact-10.9.9:components/doc/orderlist/filterdoc.js`). PrimeVue has no filter section.
- **Drag and drop:** `dragdrop` lets the user drag items to a new position (`primeng-21.1.9:apps/showcase/doc/orderlist/dragdrop-doc.ts`, `primereact-10.9.9:components/doc/orderlist/dragdropdoc.js`). PrimeVue has no drag-and-drop section.
- **Template:** the item template shows an image and text per product (`primeng-21.1.9:apps/showcase/doc/orderlist/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/orderlist/TemplateDoc.vue`).
- PrimeNG uses `FilterService`, which is `providedIn: 'root'`. No service setup by the app.

## 7. Accessibility

- All docs describe: the list has role `listbox` with `aria-multiselectable`; items have role `option` with `aria-selected` and `aria-disabled`; the move buttons are labelled from locale keys `aria.moveTop`, `aria.moveUp`, `aria.moveDown`, `aria.moveBottom`, overridable through the per-button props. Keyboard: Tab focuses the first selected (or first) option; Up/Down move focus; Enter/Space toggle; Home/End; Shift+Up/Down extend; Shift+Space range-selects; Ctrl+Shift+Home/End; Ctrl+A selects all. Buttons respond to Enter and Space (`primevue-4.5.5:apps/showcase/doc/orderlist/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/orderlist/accessibilitydoc.js`).
- PrimeNG and PrimeVue get this behaviour from Listbox. PrimeReact implements it itself: `ul role="listbox"` with `aria-multiselectable` and `aria-activedescendant`, `li role="option"` with `aria-selected`, and key handling for ArrowUp/Down, Home, End, Enter, NumpadEnter, Space and KeyA (`primereact-10.9.9:components/lib/orderlist/OrderListSubList.js`).
- Doc/source mismatches: the PrimeNG accessibility doc is copied from PickList (it talks about `sourceListProps`/`targetListProps` and transfer labels) (`primeng-21.1.9:apps/showcase/doc/orderlist/accessibility-doc.ts`). The PrimeReact doc mentions `listProps` and `moveTopButtonProps`-style props, which PrimeReact OrderList does not have (`primereact-10.9.9:components/lib/orderlist/OrderListBase.js`).

## 8. Theming

- PrimeNG/PrimeVue classes: `p-orderlist p-component`, `p-orderlist-controls`. PrimeNG adds `p-orderlist-controls-left` / `p-orderlist-controls-right` and an inline rule that moves the controls after the list when they are on the right. Everything inside the list carries Listbox classes (`primeng-21.1.9:packages/primeng/src/orderlist/style/orderliststyle.ts`, `primevue-4.5.5:packages/primevue/src/orderlist/style/OrderListStyle.js`).
- `responsive` (PrimeNG) / `breakpoint` (PrimeVue, PrimeReact) injects a `<style>` element with a `max-width` media query that stacks controls above the list.
- PrimeReact classes: `p-orderlist p-component`, `p-orderlist-controls`, `p-orderlist-list-container`, `p-orderlist-header`, `p-orderlist-filter-container`, `p-orderlist-filter`, `p-orderlist-filter-input p-inputtext p-component`, `p-orderlist-filter-icon`, `p-orderlist-list`, `p-orderlist-item` (+`p-highlight`, `p-focus`), `p-orderlist-droppoint` (+`p-orderlist-droppoint-highlight`). Own CSS lives in `primereact-10.9.9:components/lib/orderlist/OrderListBase.js`. Tailwind preset entry in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/orderlist/index.mjs` (flex row with token gap; the Listbox grows; controls form a column).
- Tokens: `OrderListDesignTokens` with `root.gap` and `controls.gap` (`@primeuix/themes-2.0.3:types/orderlist/index.d.ts`); Aura `1.125rem` and `0.5rem` (`@primeuix/themes-2.0.3:dist/aura/orderlist/index.mjs`). The list itself uses Listbox tokens. PrimeReact: tokens N/A.

## 9. Relationships

- Uses **Listbox** (PrimeNG, PrimeVue) and **Button**; PrimeReact uses **Button** and **Ripple**.
- **PickList** is the two-list version with the same reorder controls and the same token shape.
- Filtering relies on `FilterService`, shared with Table, Listbox and DataView.

## 10. Dependencies

- PrimeNG: `primeng/listbox`, `primeng/button`, `primeng/ripple`, `primeng/icons` (angle icons), `primeng/api` (`FilterService`, `PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `@primeuix/utils`, and `@angular/cdk/drag-drop` (external).
- PrimeVue: `primevue/listbox`, `primevue/button`, `primevue/ripple`, `@primevue/icons` (angle icons), `@primevue/core/basecomponent` (via `BaseOrderList.vue`), `@primeuix/utils/dom` and `@primeuix/utils/object`.
- PrimeReact: `../api/Api` (`FilterService`, `PrimeReactContext`, `ariaLabel`), `../componentbase`, `../hooks/Hooks`, `../utils/Utils`, `../button/Button`, `../ripple/Ripple`, icons `angleup`, `angledown`, `angledoubleup`, `angledoubledown`, `search`.

## 11. Framework differences

| Aspect              | PrimeNG                         | PrimeVue                                  | PrimeReact              |
| ------------------- | ------------------------------- | ----------------------------------------- | ----------------------- |
| List implementation | Embedded Listbox                | Embedded Listbox                          | Own `ul`/`li`           |
| Filter              | Yes (`filterBy`)                | No                                        | Yes (`filter`)          |
| Drag and drop       | Yes (Angular CDK)               | No                                        | Yes (native HTML5 drag) |
| Selection binding   | `selection` / `selectionChange` | `v-model:selection`                       | Internal only           |
| Reorder event       | `onReorder` (moved items)       | `reorder` + `update:modelValue`           | `onChange` (new array)  |
| Controls position   | `controlsPosition` left/right   | Left; `controlsstart`/`controlsend` slots | Left                    |
| Responsive          | Opt-in `responsive`             | On by default                             | Always                  |
| Design tokens       | `@primeuix/themes`              | `@primeuix/themes`                        | N/A                     |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/orderlist/orderlist.ts`
- `primeng-21.1.9:packages/primeng/src/orderlist/style/orderliststyle.ts`
- `primeng-21.1.9:packages/primeng/src/orderlist/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/orderlist/orderlist.types.ts`
- `primeng-21.1.9:apps/showcase/doc/orderlist/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/orderlist/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/orderlist/filter-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/orderlist/dragdrop-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/orderlist/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/orderlist/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/orderlist/OrderList.vue`
- `primevue-4.5.5:packages/primevue/src/orderlist/BaseOrderList.vue`
- `primevue-4.5.5:packages/primevue/src/orderlist/OrderList.d.ts`
- `primevue-4.5.5:packages/primevue/src/orderlist/style/OrderListStyle.js`
- `primevue-4.5.5:apps/showcase/doc/orderlist/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/orderlist/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/orderlist/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/orderlist/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/orderlist/OrderList.js`
- `primereact-10.9.9:components/lib/orderlist/OrderListBase.js`
- `primereact-10.9.9:components/lib/orderlist/OrderListControls.js`
- `primereact-10.9.9:components/lib/orderlist/OrderListSubList.js`
- `primereact-10.9.9:components/lib/orderlist/orderlist.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/orderlist/importdoc.js`
- `primereact-10.9.9:components/doc/orderlist/basicdoc.js`
- `primereact-10.9.9:components/doc/orderlist/filterdoc.js`
- `primereact-10.9.9:components/doc/orderlist/dragdropdoc.js`
- `primereact-10.9.9:components/doc/orderlist/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/orderlist/index.mjs`
- `@primeuix/themes-2.0.3:types/orderlist/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/orderlist/index.mjs`
