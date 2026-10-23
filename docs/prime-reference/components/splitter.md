# Splitter

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Splitter lays out two or more panels side by side (horizontal) or stacked (vertical) with a draggable gutter between each pair, so users can resize neighbouring panels by mouse, touch or keyboard. Sizes are percentages, can be constrained by minimums, and can optionally persist in web storage. Splitters can be nested inside panels to build multi-pane layouts (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`, `primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`, `primereact-10.9.9:components/lib/splitter/Splitter.js`).

## 2. Names & status

- Canonical name: **Splitter**, with panel children called **SplitterPanel** in PrimeVue and PrimeReact.
- PrimeNG has no SplitterPanel component: panels are `<ng-template #panel>` (or `pTemplate`) children that the Splitter wraps in `div.p-splitterpanel` elements (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`, `primeng-21.1.9:apps/showcase/doc/splitter/horizontal-doc.ts`).
- PrimeReact `SplitterPanel` is an empty marker function (`() => {}`); the Splitter reads its props and renders the panel markup itself (`primereact-10.9.9:components/lib/splitter/Splitter.js`).
- Deprecated: PrimeNG `styleClass` (since v20, use `class`) (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`). Nothing deprecated in PrimeVue or PrimeReact.
- Listed under Panel in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                   | PrimeVue                                                                                                                 | PrimeReact                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Import         | `import { SplitterModule } from 'primeng/splitter'` (standalone `Splitter` also exported)                 | `import Splitter from 'primevue/splitter'`, `import SplitterPanel from 'primevue/splitterpanel'`                         | `import { Splitter, SplitterPanel } from 'primereact/splitter'`           |
| Selector / tag | `<p-splitter>` with `<ng-template #panel>` children                                                       | `<Splitter>` with `<SplitterPanel>` children                                                                             | `<Splitter>` with `<SplitterPanel>` children                              |
| Source         | `packages/primeng/src/splitter/splitter.ts`, `style/splitterstyle.ts`, `types/splitter/splitter.types.ts` | `splitter/Splitter.vue`, `BaseSplitter.vue`, `Splitter.d.ts`; `splitterpanel/SplitterPanel.vue`, `BaseSplitterPanel.vue` | `components/lib/splitter/Splitter.js`, `SplitterBase.js`, `splitter.d.ts` |
| Base class     | `BaseComponent<SplitterPassThrough>`                                                                      | `BaseComponent` via `BaseSplitter` / `BaseSplitterPanel`                                                                 | `ComponentBase.extend` (`SplitterBase`)                                   |
| Sub-components | none (template-based panels)                                                                              | `SplitterPanel`                                                                                                          | `SplitterPanel` (marker)                                                  |

Sources: `primeng-21.1.9:apps/showcase/doc/splitter/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/ImportDoc.vue`, `primereact-10.9.9:components/doc/splitter/importdoc.js`.

## 4. Anatomy

| Part          | Element                                    | PT key (NG / Vue / React)                             | Class                                                                      |
| ------------- | ------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Root          | `p-splitter` host / `div`                  | `root` / `Splitter.root` / `root`                     | `p-splitter p-component`, `p-splitter-horizontal` or `p-splitter-vertical` |
| Panel         | `div`                                      | `panel` / `SplitterPanel.root` / `splitterpanel.root` | `p-splitterpanel` (+ `p-splitterpanel-nested`) — React: `p-splitter-panel` |
| Gutter        | `div` between panels (none after the last) | `gutter` / `gutter` / `gutter`                        | `p-splitter-gutter` (+ `p-splitter-gutter-resizing` while dragging)        |
| Gutter handle | `div` inside the gutter, focusable         | `gutterHandle` / `gutterHandle` / `gutterHandler`     | `p-splitter-gutter-handle`                                                 |

- While resizing, the root gets `p-splitter-resizing` and `data-p-resizing="true"` (NG, Vue) / `data-p-splitter-resizing` (React).
- Panel `flex-basis` is set inline as `calc(<size>% - <(panels − 1) × gutterSize>px)`; the gutter handle's width (horizontal) or height (vertical) is set inline to `gutterSize` px in PrimeNG and PrimeVue, while PrimeReact applies `gutterSize` to the gutter itself.
- PT key spelling differs: PrimeReact uses `gutterHandler` (`primereact-10.9.9:components/lib/splitter/splitter.d.ts`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/splitter/splitter.types.ts`, `primevue-4.5.5:packages/primevue/src/splitter/Splitter.d.ts`, `primevue-4.5.5:packages/primevue/src/splitterpanel/SplitterPanel.d.ts`, `primereact-10.9.9:components/lib/splitter/splitter.d.ts`.

## 5. API highlights

| Member        | PrimeNG                                                     | PrimeVue                                      | PrimeReact                                                |
| ------------- | ----------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| Orientation   | `layout = 'horizontal'`                                     | `layout = 'horizontal'`                       | `layout = 'horizontal'`                                   |
| Gutter size   | `gutterSize = 4` (px)                                       | `gutterSize = 4`                              | `gutterSize = 4`                                          |
| Keyboard step | `step = 5`                                                  | `step = 5`                                    | `step = 5`                                                |
| Initial sizes | `panelSizes: number[]` on Splitter                          | `size` on each SplitterPanel                  | `size` on each SplitterPanel                              |
| Minimum sizes | `minSizes: number[] = []` on Splitter                       | `minSize` on each SplitterPanel               | `minSize` on each SplitterPanel                           |
| Persistence   | `stateKey = null`, `stateStorage = 'session'`               | `stateKey = null`, `stateStorage = 'session'` | `stateKey = null`, `stateStorage = 'session'`             |
| Panel styling | `panelStyle`, `panelStyleClass` (applied to every panel)    | attributes on each SplitterPanel              | `style`, `className`, `id`, `aria-label(ledby)` per panel |
| Events        | `onResizeStart`, `onResizeEnd` (`{ originalEvent, sizes }`) | `resizestart`, `resize`, `resizeend`          | `onResizeEnd` only                                        |
| Methods       | —                                                           | `resetState()`                                | `getElement()`                                            |

- Panels without an explicit size share the remaining space equally (`100 / panelCount`), giving a 50/50 split for two panels (`primeng-21.1.9:apps/showcase/doc/splitter/size-doc.ts`).
- `stateStorage` accepts `'local'` or `'session'`; any other value throws an error, and PrimeNG also throws when storage is accessed on the server (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`, `primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`).
- Source quirk: PrimeNG `validateResize` only checks `minSizes[0]` and `minSizes[1]` against the two panels next to the dragged gutter, whatever that gutter's index, so per-panel minimums behave correctly only in two-panel layouts. PrimeVue and PrimeReact look up `minSize` on the actual neighbouring panels (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`, `primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`, `primereact-10.9.9:components/lib/splitter/Splitter.js`).
- PrimeVue collects SplitterPanel vnodes from its default slot, including those inside fragments (for example `v-for`), and re-initialises whenever the list of panel `size` values changes programmatically (`primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`).
- PrimeReact keeps the sizes in React state and saves them on resize end (`primereact-10.9.9:components/lib/splitter/Splitter.js`).
- Full API: catalog modules `splitter` (all three) and `splitterpanel` (PrimeVue) in `docs/prime-reference/catalog/`.

## 6. Usage guidance

- **Import** — see section 3 (`primeng-21.1.9:apps/showcase/doc/splitter/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/ImportDoc.vue`, `primereact-10.9.9:components/doc/splitter/importdoc.js`).
- **Horizontal** — at least two panels, side by side by default; give the root an explicit height (`primeng-21.1.9:apps/showcase/doc/splitter/horizontal-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/HorizontalDoc.vue`, `primereact-10.9.9:components/doc/splitter/horizontaldoc.js`).
- **Size** — percentage sizes such as 25/75 via `panelSizes` (NG) or per-panel `size`, plus a minimum during resize via `minSizes` / `minSize` (`primeng-21.1.9:apps/showcase/doc/splitter/size-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/SizeDoc.vue`, `primereact-10.9.9:components/doc/splitter/sizedoc.js`).
- **Vertical** — `layout="vertical"` stacks panels (`primeng-21.1.9:apps/showcase/doc/splitter/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/VerticalDoc.vue`, `primereact-10.9.9:components/doc/splitter/verticaldoc.js`).
- **Nested** — place another Splitter inside a panel; the inner one loses its border and the panel gets the nested modifier (`primeng-21.1.9:apps/showcase/doc/splitter/nested-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/NestedDoc.vue`, `primereact-10.9.9:components/doc/splitter/nesteddoc.js`).

No services or providers are required.

## 7. Accessibility

- The separator role: PrimeNG puts `role="separator"` on the gutter and `aria-orientation` / `aria-valuenow` on the focusable handle; PrimeVue puts `role="separator"`, `aria-orientation` (equal to `layout`) and `aria-valuenow` on the handle; PrimeReact puts the role on the handle together with `aria-controls` (panel id), `aria-label` / `aria-labelledby` taken from the panel, `aria-valuenow`, `aria-valuetext` (rounded percent), `aria-valuemin` (panel `minSize` or 0) and `aria-valuemax="100"` (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`, `primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`, `primereact-10.9.9:components/lib/splitter/Splitter.js`).
- Orientation value differs: PrimeNG/PrimeVue set `aria-orientation` to the layout name, while PrimeReact sets the separator's own axis (`vertical` for a horizontal layout).
- Keyboard (handle, `tabindex="0"`): Tab focuses each handle; Left/Right Arrow resize a horizontal splitter, Up/Down Arrow a vertical one, by `step` percent, repeating every 40 ms while held. PrimeReact also supports Home (maximise the panel before the handle), End (minimise it) and Enter (toggle between the two) (`primeng-21.1.9:apps/showcase/doc/splitter/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/splitter/accessibilitydoc.js`).
- Panels and gutters are `tabindex="-1"`; PrimeReact panels have `role="presentation"`.
- Upstream doc mismatch: the PrimeNG and PrimeReact keyboard tables describe Left/Right Arrow as moving a "vertical" splitter, whereas the source applies them to horizontal layouts (the PrimeVue doc says horizontal).

## 8. Theming

- Style classes: `p-splitter`, `p-splitter-horizontal`, `p-splitter-vertical`, `p-splitterpanel`, `p-splitterpanel-nested`, `p-splitter-gutter`, `p-splitter-gutter-handle`, state classes `p-splitter-resizing`, `p-splitter-gutter-resizing` (`primeng-21.1.9:packages/primeng/src/splitter/style/splitterstyle.ts`, `primevue-4.5.5:packages/primevue/src/splitter/style/SplitterStyle.js`, `primevue-4.5.5:packages/primevue/src/splitterpanel/style/SplitterPanelStyle.js`).
- PrimeNG adds inline root styles (`display: flex`, `flex-wrap: nowrap`, column direction when vertical).
- Structural CSS: `@primeuix/styles-2.0.3:dist/splitter/index.mjs` (PrimeNG, PrimeVue).
- Design tokens (`@primeuix/themes-2.0.3:types/splitter/index.d.ts`): `root` (`background`, `borderColor`, `color`, `transitionDuration`), `gutter.background`, `handle` (`size`, `background`, `borderRadius`, `focusRing.width/style/color/offset/shadow`). Aura values: `@primeuix/themes-2.0.3:dist/aura/splitter/index.mjs`.
- PrimeReact: its own `@layer primereact` structural CSS in `SplitterBase.js` and the class `p-splitter-panel`; design tokens N/A (`primereact-10.9.9:components/lib/splitter/SplitterBase.js`, `primereact-10.9.9:components/doc/splitter/theming/styleddoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/splitter/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/splitter/pt/index.vue`, `primereact-10.9.9:components/doc/splitter/pt/wireframe.js`.

## 9. Relationships

- Embeds nothing; nests itself.
- Related layout containers: ScrollPanel (often placed inside a panel for long content), Panel and Card; Drawer for slide-in side panes (Overlay category).
- Comparable resizing logic: DataTable column resize (Data category).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/ts-helpers`, `primeng/base`, `@primeuix/styles/splitter` (`primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`, `primeng-21.1.9:packages/primeng/src/splitter/style/splitterstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primevue/core/utils`, `@primeuix/utils`, `@primeuix/styles/splitter` (`primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/splitter/Splitter.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect            | PrimeNG                                       | PrimeVue                    | PrimeReact                   |
| ----------------- | --------------------------------------------- | --------------------------- | ---------------------------- |
| Panel declaration | `<ng-template #panel>`                        | `<SplitterPanel>` component | `<SplitterPanel>` marker     |
| Sizes / minimums  | arrays on Splitter (`panelSizes`, `minSizes`) | per-panel `size`, `minSize` | per-panel `size`, `minSize`  |
| Events            | resize start + end                            | resize start, during, end   | resize end only              |
| Separator element | gutter has the role, handle has focus         | handle                      | handle, with full value ARIA |
| Extra keys        | arrows                                        | arrows                      | arrows, Home, End, Enter     |
| Reset API         | —                                             | `resetState()`              | —                            |
| Panel class       | `p-splitterpanel`                             | `p-splitterpanel`           | `p-splitter-panel`           |
| Styling source    | `@primeuix/styles` + tokens                   | `@primeuix/styles` + tokens | own CSS in `SplitterBase.js` |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/splitter/splitter.ts`
- `primeng-21.1.9:packages/primeng/src/splitter/style/splitterstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/splitter/splitter.types.ts`
- `primeng-21.1.9:apps/showcase/doc/splitter/` (`import-doc.ts`, `horizontal-doc.ts`, `size-doc.ts`, `vertical-doc.ts`, `nested-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/splitter/Splitter.vue`
- `primevue-4.5.5:packages/primevue/src/splitter/BaseSplitter.vue`
- `primevue-4.5.5:packages/primevue/src/splitter/Splitter.d.ts`
- `primevue-4.5.5:packages/primevue/src/splitter/style/SplitterStyle.js`
- `primevue-4.5.5:packages/primevue/src/splitterpanel/SplitterPanel.vue`
- `primevue-4.5.5:packages/primevue/src/splitterpanel/BaseSplitterPanel.vue`
- `primevue-4.5.5:packages/primevue/src/splitterpanel/SplitterPanel.d.ts`
- `primevue-4.5.5:packages/primevue/src/splitterpanel/style/SplitterPanelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/splitter/` (`ImportDoc.vue`, `HorizontalDoc.vue`, `SizeDoc.vue`, `VerticalDoc.vue`, `NestedDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/splitter/Splitter.js`
- `primereact-10.9.9:components/lib/splitter/SplitterBase.js`
- `primereact-10.9.9:components/lib/splitter/splitter.d.ts`
- `primereact-10.9.9:components/doc/splitter/` (`importdoc.js`, `horizontaldoc.js`, `sizedoc.js`, `verticaldoc.js`, `nesteddoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/splitter/index.mjs`
- `@primeuix/themes-2.0.3:types/splitter/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/splitter/index.mjs`
