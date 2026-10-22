# PickList

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

PickList shows two lists side by side, a **source** and a **target**, with transfer buttons between them (move selected to target, move all to target, move selected to source, move all to source). Each list can also have its own reorder controls (up, top, down, bottom). The app owns both arrays; the component moves items between them and reports the change. PrimeNG and PrimeVue build each side from an embedded Listbox. PrimeReact renders its own lists. Filtering exists in PrimeNG and PrimeReact, drag-and-drop only in PrimeNG (`primeng-21.1.9:packages/primeng/src/picklist/picklist.ts`, `primevue-4.5.5:packages/primevue/src/picklist/PickList.vue`, `primereact-10.9.9:components/lib/picklist/PickList.js`).

## 2. Names & status

- Canonical name: **PickList** in all three frameworks. Listed under **Data** in `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, and `primereact-10.9.9:components/layout/menu.json`.
- Legacy aliases: none.
- Deprecated: PrimeVue `item` slot (`@deprecated since v4.0`, use `option`). PrimeNG and PrimeReact: none marked. Unlike most PrimeNG 21 components, PickList's `styleClass` input carries no deprecation tag.
- PrimeNG selector aliases: `p-pickList`, `p-picklist`, `p-pick-list`.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `PickListModule` from `primeng/picklist`, or the standalone `PickList` (`primeng-21.1.9:apps/showcase/doc/picklist/import-doc.ts`).
- Source `primeng-21.1.9:packages/primeng/src/picklist/picklist.ts`; style `primeng-21.1.9:packages/primeng/src/picklist/style/pickliststyle.ts` (imports `@primeuix/styles/picklist`); types `primeng-21.1.9:packages/primeng/src/types/picklist/picklist.types.ts`; exports `primeng-21.1.9:packages/primeng/src/picklist/public_api.ts`.
- `source` and `target` are signal models (`model<any[]>([])`), so `[(source)]` / `[(target)]` two-way binding works. The root carries `cdkDropListGroup` so items can be dragged between the two Listboxes. Injects `FilterService`.

**PrimeVue 4.5.5**

- Import: `import PickList from 'primevue/picklist'` (`primevue-4.5.5:apps/showcase/doc/picklist/ImportDoc.vue`).
- Source `primevue-4.5.5:packages/primevue/src/picklist/PickList.vue`; props `primevue-4.5.5:packages/primevue/src/picklist/BasePickList.vue`; types `primevue-4.5.5:packages/primevue/src/picklist/PickList.d.ts`; style `primevue-4.5.5:packages/primevue/src/picklist/style/PickListStyle.js`.
- `v-model` holds a two-element array `[source, target]` (default `[[], []]`); `v-model:selection` has the same shape.

**PrimeReact 10.9.9**

- Import: `import { PickList } from 'primereact/picklist'` (`primereact-10.9.9:components/doc/picklist/importdoc.js`).
- Source `primereact-10.9.9:components/lib/picklist/PickList.js`, with `PickListSubList.js`, `PickListItem.js`, `PickListControls.js`, `PickListTransferControls.js` in the same folder; defaults and CSS `primereact-10.9.9:components/lib/picklist/PickListBase.js`; types `primereact-10.9.9:components/lib/picklist/picklist.d.ts`.
- Controlled through `source`/`target` and `onChange {originalEvent, source, target}`. Selection is controlled when `sourceSelection`/`targetSelection` are given, otherwise internal.

## 4. Anatomy

| Part                    | PrimeNG PT key                                                                                                           | PrimeVue PT key                                     | PrimeReact PT key                                                                                       | Notes                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Root                    | `host` / `root`                                                                                                          | `root`                                              | `root`                                                                                                  | `p-picklist p-component`                             |
| Source reorder controls | `sourceControls`; `pcSourceMoveUpButton`, `pcSourceMoveTopButton`, `pcSourceMoveDownButton`, `pcSourceMoveBottomButton`  | `sourceControls`; same four `pcSource*` button keys | `controls`; `moveUpButton`, `moveTopButton`, `moveDownButton`, `moveBottomButton`                       | Hidden with `showSourceControls = false`             |
| Source list             | `sourceListContainer`; `pcListbox`                                                                                       | `sourceListContainer`; `pcListbox`                  | `listWrapper`, `header`, `filterContainer`, `filter`, `filterInput`, `filterIcon`, `list`, `item`       | Listbox in NG/Vue                                    |
| Transfer controls       | `transferControls`; `pcMoveToTargetButton`, `pcMoveAllToTargetButton`, `pcMoveToSourceButton`, `pcMoveAllToSourceButton` | `transferControls`; same four keys                  | `buttons`; `moveToTargetButton`, `moveAllToTargetButton`, `moveToSourceButton`, `moveAllToSourceButton` | Icons rotate when the viewport is below `breakpoint` |
| Target list             | `targetListContainer`; `pcListbox`                                                                                       | `targetListContainer`; `pcListbox`                  | same keys as source list                                                                                |                                                      |
| Target reorder controls | `targetControls`; `pcTargetMoveUpButton`, `pcTargetMoveTopButton`, `pcTargetMoveDownButton`, `pcTargetMoveBottomButton`  | `targetControls`; same four `pcTarget*` button keys | `controls` (shared key)                                                                                 | Hidden with `showTargetControls = false`             |

Sources: `primeng-21.1.9:packages/primeng/src/types/picklist/picklist.types.ts`, `primevue-4.5.5:packages/primevue/src/picklist/PickList.d.ts`, `primereact-10.9.9:components/lib/picklist/picklist.d.ts`.

## 5. API highlights

| Concern         | PrimeNG                                                                                                                                                                                                                                                                                                                   | PrimeVue                                                                                                                                         | PrimeReact                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data            | `source`, `target` (models), `dataKey`                                                                                                                                                                                                                                                                                    | `modelValue` `[source, target]`, `dataKey`                                                                                                       | `source`, `target`, `dataKey`                                                                                                                                                                                                   |
| Transfer events | `onMoveToTarget`, `onMoveAllToTarget`, `onMoveToSource`, `onMoveAllToSource` (`{items}`)                                                                                                                                                                                                                                  | `move-to-target`, `move-all-to-target`, `move-to-source`, `move-all-to-source`, plus `update:modelValue`                                         | `onChange {source, target}`, plus `onMoveToTarget`, `onMoveAllToTarget`, `onMoveToSource`, `onMoveAllToSource`                                                                                                                  |
| Reorder events  | `onSourceReorder`, `onTargetReorder`                                                                                                                                                                                                                                                                                      | `reorder {originalEvent, value, direction, listIndex}`                                                                                           | Through `onChange`                                                                                                                                                                                                              |
| Selection       | `onSourceSelect`, `onTargetSelect`, `metaKeySelection` (false), `keepSelection` (false)                                                                                                                                                                                                                                   | `selection` (`v-model:selection`), `selection-change`, `metaKeySelection` (false)                                                                | `sourceSelection`, `targetSelection`, `onSourceSelectionChange`, `onTargetSelectionChange`, `metaKeySelection` (false)                                                                                                          |
| Item rendering  | `#item` template (`$implicit`, `index`); `sourceOptionDisabled` / `targetOptionDisabled`                                                                                                                                                                                                                                  | `option` slot                                                                                                                                    | `itemTemplate`, `sourceItemTemplate`, `targetItemTemplate`                                                                                                                                                                      |
| Headers         | `sourceHeader`, `targetHeader` inputs or templates                                                                                                                                                                                                                                                                        | `sourceheader`, `targetheader` slots                                                                                                             | `sourceHeader`, `targetHeader`                                                                                                                                                                                                  |
| Filter          | `filterBy`, `showSourceFilter`/`showTargetFilter` (true), `sourceFilterPlaceholder`, `targetFilterPlaceholder`, `filterMatchMode` (`'contains'`), `filterLocale`; `onSourceFilter`, `onTargetFilter`; `sourceFilter`/`targetFilter` templates                                                                             | N/A                                                                                                                                              | `filter` (false), `filterBy`, `showSourceFilter`/`showTargetFilter` (true), `sourceFilterValue`, `targetFilterValue`, placeholders, templates, `filterMatchMode` (`'contains'`), `onSourceFilterChange`, `onTargetFilterChange` |
| Drag and drop   | `dragdrop` (false)                                                                                                                                                                                                                                                                                                        | N/A                                                                                                                                              | N/A                                                                                                                                                                                                                             |
| Controls        | `showSourceControls`, `showTargetControls` (true); `buttonProps` (`{severity: 'secondary'}`), per-button `move*ButtonProps` and `moveToTargetProps`, `moveAllToTargetProps`, `moveToSourceProps`, `moveAllToSourceProps`; eight `*ButtonAriaLabel` inputs; icon templates (`movetotargeticon` etc. receive `viewChanged`) | Same `show*Controls`, `buttonProps` and per-button props; `*controlsstart`/`*controlsend` slots for each of the three control groups; icon slots | `showSourceControls`, `showTargetControls`; icon props (`moveToTargetIcon`, `moveAllToSourceIcon`, …)                                                                                                                           |
| Layout          | `scrollHeight` (`'14rem'`), `sourceStyle`, `targetStyle`, `stripedRows`, `responsive`, `breakpoint`                                                                                                                                                                                                                       | `scrollHeight` (`'14rem'`), `listStyle`, `striped`, `responsive` (true), `breakpoint` (`'960px'`)                                                | `sourceStyle`, `targetStyle`, `breakpoint` (`'960px'`)                                                                                                                                                                          |
| Other           | `disabled`, `tabindex` (0), `autoOptionFocus` (true), `sourceAriaLabel`, `targetAriaLabel`, `trackBy`/`sourceTrackBy`/`targetTrackBy`                                                                                                                                                                                     | `disabled`, `tabindex` (0), `autoOptionFocus` (true), `focusOnHover` (true)                                                                      | `tabIndex` (0), `autoOptionFocus` (true), `focusOnHover` (true), `getElement()`                                                                                                                                                 |

## 6. Usage guidance

- **Basic:** bind source and target arrays plus a `dataKey`, and give an item template. Demos set `breakpoint="1400px"` (PrimeNG, PrimeVue) or `"1280px"` (PrimeReact) so the layout stacks on narrow screens. The PrimeNG demo also turns on `dragdrop` (`primeng-21.1.9:apps/showcase/doc/picklist/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/picklist/BasicDoc.vue`, `primereact-10.9.9:components/doc/picklist/basicdoc.js`).
- **Filter:** `filterBy` (PrimeNG) or `filter` + `filterBy` (PrimeReact) adds a search input above each list; per-side placeholders and visibility flags are available (`primeng-21.1.9:apps/showcase/doc/picklist/filter-doc.ts`, `primereact-10.9.9:components/doc/picklist/filterdoc.js`). PrimeVue has no filter section.
- **Template:** item and header templates render rich rows such as an image with name and price (`primeng-21.1.9:apps/showcase/doc/picklist/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/picklist/TemplateDoc.vue`).
- Double-clicking an item moves it to the other list in PrimeNG and PrimeVue (`onDblClick` / `item-dblclick` handlers in the sources above).
- PrimeNG ships `primeng-21.1.9:apps/showcase/doc/picklist/templates-doc.ts`, a template reference table that the PickList page does not include (`primeng-21.1.9:apps/showcase/pages/picklist/index.ts`).
- No services need app setup; PrimeNG `FilterService` is root-provided.

## 7. Accessibility

- All docs describe: each list has role `listbox` with `aria-multiselectable`; items are `option`s with `aria-selected` and `aria-disabled`; the same keyboard model as OrderList (Tab, Up/Down, Enter/Space, Home/End, Shift+arrows, Shift+Space, Ctrl+Shift+Home/End, Ctrl+A); buttons respond to Enter and Space (`primeng-21.1.9:apps/showcase/doc/picklist/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/picklist/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/picklist/accessibilitydoc.js`).
- Button labels in source come from the locale `aria` keys `moveTop`, `moveUp`, `moveDown`, `moveBottom`, `moveToTarget`, `moveAllToTarget`, `moveToSource`, `moveAllToSource`. PrimeNG also accepts explicit `*ButtonAriaLabel` inputs.
- Doc/source mismatch: the docs name the transfer keys `aria.moveTo`, `aria.moveAllTo`, `aria.moveFrom`, `aria.moveAllFrom` and props such as `sourceListProps`/`moveToButtonProps`. The sources use `moveToTarget`-style keys, and PrimeReact has no `*ListProps` or `*ButtonProps` at all (`primereact-10.9.9:components/lib/picklist/PickListBase.js`, `primereact-10.9.9:components/lib/picklist/PickListTransferControls.js`).
- PrimeReact implements the listbox itself (`ul role="listbox"` with `aria-multiselectable` and `aria-activedescendant`, `li role="option"`) in `primereact-10.9.9:components/lib/picklist/PickListSubList.js` and `primereact-10.9.9:components/lib/picklist/PickListItem.js`.

## 8. Theming

- PrimeNG/PrimeVue classes: `p-picklist p-component`, `p-picklist-controls p-picklist-source-controls`, `p-picklist-list-container p-picklist-source-list-container`, `p-picklist-controls p-picklist-transfer-controls`, `p-picklist-list-container p-picklist-target-list-container`, `p-picklist-controls p-picklist-target-controls`. The lists carry Listbox classes (`primeng-21.1.9:packages/primeng/src/picklist/style/pickliststyle.ts`, `primevue-4.5.5:packages/primevue/src/picklist/style/PickListStyle.js`).
- A `max-width: breakpoint` media style stacks the layout; below it the transfer icons change from left/right to up/down (`viewChanged`).
- PrimeReact classes: `p-picklist p-component`, `p-picklist-buttons p-picklist-transfer-buttons`, `p-picklist-source-controls p-picklist-buttons`, `p-picklist-target-controls p-picklist-buttons`, `p-picklist-list-wrapper` (+`p-picklist-source-wrapper` / `p-picklist-target-wrapper`), `p-picklist-header`, `p-picklist-filter-container`, `p-picklist-filter`, `p-picklist-filter-input p-inputtext p-component`, `p-picklist-filter-icon`, `p-picklist-list p-picklist-source` / `p-picklist-target`, `p-picklist-item` (+`p-highlight`, `p-focus`). Own CSS in `primereact-10.9.9:components/lib/picklist/PickListBase.js`; Tailwind preset in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/picklist/index.mjs`.
- Tokens: `PickListDesignTokens` with `root.gap` and `controls.gap` (`@primeuix/themes-2.0.3:types/picklist/index.d.ts`); Aura `1.125rem` and `0.5rem` (`@primeuix/themes-2.0.3:dist/aura/picklist/index.mjs`). PrimeReact: tokens N/A.

## 9. Relationships

- Uses **Listbox** (PrimeNG, PrimeVue) and **Button**; PrimeReact uses **Button** and **Ripple**.
- **OrderList** is the single-list version; the reorder controls and token shape match.
- Filtering relies on `FilterService`, shared with Table, Listbox and OrderList.

## 10. Dependencies

- PrimeNG: `primeng/listbox`, `primeng/button`, `primeng/ripple`, `primeng/icons` (eight angle icons), `primeng/api` (`FilterService`, `PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `@primeuix/utils`, and `@angular/cdk/drag-drop` (external).
- PrimeVue: `primevue/listbox`, `primevue/button`, `primevue/ripple`, `@primevue/icons` (angle icons), `@primevue/core/basecomponent` (via `BasePickList.vue`), `@primeuix/utils/dom`, `@primeuix/utils/object`.
- PrimeReact: `../api/Api` (`FilterService`, `PrimeReactContext`, `ariaLabel`), `../api/Locale`, `../componentbase/ComponentBase`, `../hooks/Hooks` (`useMatchMedia`, `useMergeProps`, `useUpdateEffect`), `../utils/Utils`, `../button/Button`, `../ripple/Ripple`, icons `search` and the angle set.

## 11. Framework differences

| Aspect                | PrimeNG                              | PrimeVue                          | PrimeReact                      |
| --------------------- | ------------------------------------ | --------------------------------- | ------------------------------- |
| List implementation   | Two embedded Listboxes               | Two embedded Listboxes            | Own `ul`/`li`                   |
| Data binding          | `[(source)]`, `[(target)]` models    | `v-model` `[source, target]`      | `source`, `target` + `onChange` |
| Filter                | Yes                                  | No                                | Yes (`filter`)                  |
| Drag and drop         | Yes (Angular CDK, across lists)      | No                                | No                              |
| Double-click transfer | Yes                                  | Yes                               | No                              |
| Per-button props      | Yes, plus explicit aria-label inputs | Yes                               | No (icons only)                 |
| Controls slots        | Icon templates only                  | `*controlsstart` / `*controlsend` | No                              |
| Design tokens         | `@primeuix/themes`                   | `@primeuix/themes`                | N/A                             |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/picklist/picklist.ts`
- `primeng-21.1.9:packages/primeng/src/picklist/style/pickliststyle.ts`
- `primeng-21.1.9:packages/primeng/src/picklist/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/picklist/picklist.types.ts`
- `primeng-21.1.9:apps/showcase/pages/picklist/index.ts`
- `primeng-21.1.9:apps/showcase/doc/picklist/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/picklist/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/picklist/filter-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/picklist/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/picklist/templates-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/picklist/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/picklist/PickList.vue`
- `primevue-4.5.5:packages/primevue/src/picklist/BasePickList.vue`
- `primevue-4.5.5:packages/primevue/src/picklist/PickList.d.ts`
- `primevue-4.5.5:packages/primevue/src/picklist/style/PickListStyle.js`
- `primevue-4.5.5:apps/showcase/doc/picklist/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/picklist/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/picklist/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/picklist/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/picklist/PickList.js`
- `primereact-10.9.9:components/lib/picklist/PickListBase.js`
- `primereact-10.9.9:components/lib/picklist/PickListSubList.js`
- `primereact-10.9.9:components/lib/picklist/PickListItem.js`
- `primereact-10.9.9:components/lib/picklist/PickListControls.js`
- `primereact-10.9.9:components/lib/picklist/PickListTransferControls.js`
- `primereact-10.9.9:components/lib/picklist/picklist.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/picklist/importdoc.js`
- `primereact-10.9.9:components/doc/picklist/basicdoc.js`
- `primereact-10.9.9:components/doc/picklist/filterdoc.js`
- `primereact-10.9.9:components/doc/picklist/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/picklist/index.mjs`
- `@primeuix/themes-2.0.3:types/picklist/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/picklist/index.mjs`
