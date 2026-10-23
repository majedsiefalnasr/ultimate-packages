# Tree

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Tree shows hierarchical data as an indented, expandable list. Each node has a label, an optional icon and optional `children`; nodes can be expanded and collapsed, selected (single, multiple, or with checkboxes that propagate between parent and child), filtered by a search input, loaded lazily on expansion, rendered through per-type templates, and dragged and dropped to reorder or re-parent them. It is the list-style sibling of **TreeTable**: same node model, but no columns.

The three implementations share the vocabulary but differ in who owns state. PrimeNG mutates the data in place (`node.expanded`, `node.partialSelected`, `node.parent`) and binds selection as a `TreeNode` object or array. PrimeVue and PrimeReact keep `expandedKeys` and `selectionKeys` as key maps and never mark the nodes (PrimeReact additionally honours `node.expanded`). Only PrimeNG offers virtual scrolling (through **Scroller**) and a built-in `contextMenu` binding; only PrimeReact has a whole-tree `disabled` prop. PrimeNG and PrimeVue render with the shared `@primeuix` style and theme packages, while PrimeReact still uses its own older `p-treenode-*` class names and inline CSS (`primereact-10.9.9:components/lib/tree/TreeBase.js`).

## 2. Names & status

- Canonical name: **Tree** (component and class name in all three frameworks; PrimeNG selector `p-tree`, with a second internal standalone component `p-treeNode` that is not meant for direct use, `primeng-21.1.9:packages/primeng/src/tree/tree.ts`).
- Menu label: **Tree** in the Data group of PrimeNG (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `routerLink` `/tree`), PrimeVue (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `to: "/tree"`) and PrimeReact (`primereact-10.9.9:components/layout/menu.json`, `to: "/tree"`).
- Legacy aliases: none as export names. The PrimeNG module is `TreeModule` (imports and exports `Tree` and `SharedModule`), kept for NgModule users although `Tree` itself is standalone (`primeng-21.1.9:apps/showcase/doc/tree/import-doc.ts`).
- Deprecated:
  - PrimeNG: input `styleClass` (since v20.0.0, use `class`; `primeng-21.1.9:packages/primeng/src/tree/tree.ts`).
  - PrimeVue: slots `nodetogglericon` and `togglericon` (since v4.0, use `nodetoggleicon`) and slot `searchicon` (use `filtericon`) (`primevue-4.5.5:packages/primevue/src/tree/Tree.d.ts`).
  - PrimeReact: none found.
- Not to be confused with **TreeTable** (hierarchy with columns), **TreeSelect** (a dropdown that embeds a tree; in PrimeVue it renders this Tree and suppresses the Tree's own empty message through an injected `$pcTreeSelect`, `primevue-4.5.5:packages/primevue/src/tree/Tree.vue`), or **OrganizationChart** (a node-link chart over the same `TreeNode` shape).

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `TreeModule` from `primeng/tree` (`primeng-21.1.9:apps/showcase/doc/tree/import-doc.ts`); the component is also standalone, so `Tree` can be imported directly. Exports are in `primeng-21.1.9:packages/primeng/src/tree/public_api.ts` (types, component, style).
- Source `primeng-21.1.9:packages/primeng/src/tree/tree.ts` (about 1950 lines: `Tree extends BaseComponent<TreePassThrough> implements BlockableUI` plus the internal `UITreeNode`); style `primeng-21.1.9:packages/primeng/src/tree/style/treestyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/tree/tree.types.ts`; node model `primeng-21.1.9:packages/primeng/src/api/treenode.ts`.
- `value` is `TreeNode[]`. Expansion lives on the node (`node.expanded`) with no key map. Selection is the `selection` model (`TreeNode` for single, `TreeNode[]` for multiple and checkbox). Checkbox mode sets `node.partialSelected` for the indeterminate state.
- Drag and drop needs the app to provide `TreeDragDropService` from `primeng/api` (`primeng-21.1.9:packages/primeng/src/api/treedragdropservice.ts`); both drag-and-drop showcase demos list it in `providers` (`primeng-21.1.9:apps/showcase/doc/tree/dragdrop/singledragdropdoc.ts`).
- Rendering uses `p-iconfield` with a `pInputText` search input for the filter, `p-checkbox` for checkbox mode, `pRipple` on the toggler and `p-scroller` for the list.

**PrimeVue 4.5.5**

- Import: `import Tree from 'primevue/tree'` (`primevue-4.5.5:apps/showcase/doc/tree/ImportDoc.vue`).
- Source `primevue-4.5.5:packages/primevue/src/tree/Tree.vue` (container, filter, recursion entry), `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue` (one node and its children), props in `primevue-4.5.5:packages/primevue/src/tree/BaseTree.vue`; types `primevue-4.5.5:packages/primevue/src/tree/Tree.d.ts` and the node model `primevue-4.5.5:packages/primevue/src/treenode/TreeNode.d.ts`; style `primevue-4.5.5:packages/primevue/src/tree/style/TreeStyle.js`.
- `value` is a node array where `key` is required. Expansion is `expandedKeys` (`v-model:expandedKeys`, a plain object `{key: true}`); selection is `selectionKeys` (`v-model:selectionKeys`), `{key: true}` for single and multiple and `{key: {checked, partialChecked}}` for checkbox mode.
- Drag and drop needs `v-model:value` because the tree rebuilds the array immutably and emits `update:value`. The helper `TreeDragDropService.js` is a module-level reactive store and needs no provider (`primevue-4.5.5:packages/primevue/src/tree/TreeDragDropService.js`).
- The node label slot is the default slot, resolved per `node.type`; the empty message and the footer render only when the tree is not hosted by **TreeSelect**.

**PrimeReact 10.9.9**

- Import: `import { Tree } from 'primereact/tree'` (`primereact-10.9.9:components/doc/tree/importdoc.js`).
- Source `primereact-10.9.9:components/lib/tree/Tree.js` (container, header and filter, drag and drop paths), `primereact-10.9.9:components/lib/tree/UITreeNode.js` (one node), defaults and class names in `primereact-10.9.9:components/lib/tree/TreeBase.js`, types in `primereact-10.9.9:components/lib/tree/tree.d.ts` and the node model in `primereact-10.9.9:components/lib/treenode/treenode.d.ts`.
- `value` is a `TreeNode[]`. Expansion is `expandedKeys` plus `onToggle` (uncontrolled when `onToggle` is absent); `node.expanded` is also honoured while not filtering. Selection is `selectionKeys` plus `onSelectionChange`, shaped as in PrimeVue.
- Drag and drop is enabled by `dragdropScope` and reports through `onDragDrop`, whose `value` carries the new, deep-cloned tree; the app must store it.
- The component is wrapped in `forwardRef`/`memo` and exposes `filter(value)` and `getElement()` on its ref.

## 4. Anatomy

| Part                  | PrimeNG PT key                                  | PrimeVue PT key                      | PrimeReact PT key                        |
| --------------------- | ----------------------------------------------- | ------------------------------------ | ---------------------------------------- |
| Root                  | `host`, `root`                                  | `root`                               | `root`                                   |
| Loading mask          | `mask`, `loadingIcon`                           | `mask`, `loadingIcon`                | `loadingOverlay`, `loadingIcon`          |
| Header area           | N/A (template slot only)                        | N/A (slot only)                      | `header`                                 |
| Filter container      | `pcFilterContainer` (IconField)                 | `pcFilterContainer` (IconField)      | `filterContainer`                        |
| Filter input and icon | `pcFilterInput`, `filterIcon`                   | `pcFilterInput`, `filterIcon`        | `input`, `searchIcon`                    |
| Filter icon wrapper   | `pcFilterIconContainer`                         | `pcFilterIconContainer`              | N/A                                      |
| Scroll wrapper        | `wrapper`, `pcScroller` (catalog)               | `wrapper`                            | `container`                              |
| Root list             | `rootChildren`                                  | `rootChildren`                       | N/A (the `ul` carries `container`)       |
| Node (`li`)           | `node`                                          | `node`                               | `node`                                   |
| Node content row      | `nodeContent`                                   | `nodeContent`                        | `content`                                |
| Toggle button / icon  | `nodeToggleButton`, `nodeTogglerIcon` (catalog) | `nodeToggleButton`, `nodeToggleIcon` | `toggler`, `togglerIcon`                 |
| Checkbox              | `pcNodeCheckbox`                                | `pcNodeCheckbox`                     | `nodeCheckbox`, `checkboxIcon`           |
| Node icon and label   | `nodeIcon`, `nodeLabel`                         | `nodeIcon`, `nodeLabel`              | `nodeIcon`, `label`                      |
| Child list            | `nodeChildren`                                  | `nodeChildren`                       | `subgroup`                               |
| Drop point            | `dropPoint`                                     | `dropPoint`                          | `droppoint`                              |
| Empty message         | `emptyMessage`                                  | `emptyMessage`                       | N/A (rendered as a tree item; no PT key) |
| Footer                | N/A (template slot only)                        | N/A (slot only)                      | `footer`                                 |
| Lifecycle hooks       | N/A                                             | `hooks`                              | `hooks`                                  |

Sources: PrimeNG keys from the catalog `TreePassThroughOptions` and `primeng-21.1.9:packages/primeng/src/types/tree/tree.types.ts`; PrimeVue from `primevue-4.5.5:packages/primevue/src/tree/Tree.d.ts`; PrimeReact from `primereact-10.9.9:components/lib/tree/tree.d.ts` and the wireframe `primereact-10.9.9:components/doc/tree/pt/wireframe.js`. PrimeNG's catalog names the toggle icon key `nodeTogglerIcon`, but the template and the CSS enum use `nodeToggleIcon` (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`). The viewers are `primeng-21.1.9:apps/showcase/doc/tree/pt/PTViewer.ts` and `primevue-4.5.5:apps/showcase/doc/tree/pt/PTViewer.vue`.

## 5. API highlights

| Capability                 | PrimeNG                                                                                                                               | PrimeVue                                                                                                                                                                 | PrimeReact                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data                       | `value: TreeNode[]`                                                                                                                   | `value: TreeNode[]`, `update:value`                                                                                                                                      | `value: TreeNode[]`                                                                                                                                |
| Selection mode             | `selectionMode`: `'single'`, `'multiple'`, `'checkbox'`, `null`                                                                       | same values                                                                                                                                                              | `'single'`, `'multiple'`, `'checkbox'`                                                                                                             |
| Selection state            | `selection` (model)                                                                                                                   | `selectionKeys` (`update:selectionKeys`)                                                                                                                                 | `selectionKeys` + `onSelectionChange({originalEvent, value})`                                                                                      |
| Expansion state            | `node.expanded`                                                                                                                       | `expandedKeys` (`update:expandedKeys`)                                                                                                                                   | `expandedKeys` + `onToggle({originalEvent, value})`                                                                                                |
| Meta-key selection         | `metaKeySelection` (default `false`)                                                                                                  | `metaKeySelection` (default `false`)                                                                                                                                     | `metaKeySelection` (runtime default `false`, typings say `true`)                                                                                   |
| Checkbox propagation       | `propagateSelectionUp`, `propagateSelectionDown` (both `true`)                                                                        | always on, no props                                                                                                                                                      | `propagateSelectionUp`, `propagateSelectionDown` (both `true`)                                                                                     |
| Highlight in checkbox mode | `highlightOnSelect` (`false`)                                                                                                         | `highlightOnSelect` (`false`)                                                                                                                                            | N/A                                                                                                                                                |
| Filtering                  | `filter`, `filterBy` (`'label'`), `filterMode` (`'lenient'`), `filterPlaceholder`, `filterLocale`, `filterInputAutoFocus`, `onFilter` | `filter`, `filterBy` (string or function), `filterMode`, `filterPlaceholder`, `filterLocale`, `@filter`                                                                  | `filter`, `filterBy`, `filterMode`, `filterPlaceholder`, `filterLocale`, `filterDelay` (300), `filterValue`, `onFilterValueChange`                 |
| Lazy loading               | `loadingMode` (`'mask'`/`'icon'`), `loading`, node `loading`, `onNodeExpand`; `lazy` + `onLazyLoad` for virtual scroll                | `loading`, `loadingMode`, node `loading`, `@node-expand`                                                                                                                 | `loading`, `loadingIcon`, `onExpand`                                                                                                               |
| Virtual scrolling          | `virtualScroll`, `virtualScrollItemSize`, `virtualScrollOptions`, `scrollHeight`, `onScroll`, `onScrollIndexChange`                   | N/A (not implemented)                                                                                                                                                    | N/A (not implemented)                                                                                                                              |
| Scroll height              | `scrollHeight` (accepts `'flex'`)                                                                                                     | `scrollHeight` (accepts `'flex'`)                                                                                                                                        | N/A (size via `style`/`contentStyle`)                                                                                                              |
| Context menu               | `contextMenu`, `contextMenuSelection`, `contextMenuSelectionMode` (`'separate'`/`'joint'`), `onNodeContextMenuSelect`                 | N/A                                                                                                                                                                      | `contextMenuSelectionKey`, `onContextMenu`, `onContextMenuSelectionChange`                                                                         |
| Drag and drop              | `draggableNodes`, `droppableNodes`, `draggableScope`, `droppableScope`, `validateDrop`, `onNodeDrop`; needs `TreeDragDropService`     | `draggableNodes`, `droppableNodes`, `draggableScope`, `droppableScope`, `validateDrop`, `@node-drop`, `@drag-enter`, `@drag-leave`, `@node-dragenter`, `@node-dragleave` | `dragdropScope`, `onDragDrop`                                                                                                                      |
| Node events                | `onNodeSelect`, `onNodeUnselect`, `onNodeExpand`, `onNodeCollapse`, `onNodeDoubleClick`                                               | `@node-select`, `@node-unselect`, `@node-expand`, `@node-collapse`                                                                                                       | `onSelect`, `onUnselect`, `onExpand`, `onCollapse`, `onNodeClick`, `onNodeDoubleClick`                                                             |
| Templates                  | `node` (by `type`), `header`, `footer`, `filter`, `loader`, `empty`, `togglericon`, `checkboxicon`, `loadingicon`, `filtericon`       | default slot (by `type`), `header`, `footer`, `nodeicon`, `nodetoggleicon`, `checkboxicon`, `loadingicon`, `filtericon`, `empty`                                         | `nodeTemplate`, `togglerTemplate`, `header`, `footer`, `filterTemplate`, `expandIcon`, `collapseIcon`, `checkboxIcon`, `loadingIcon`, `filterIcon` |
| Whole-tree disabled        | N/A                                                                                                                                   | N/A                                                                                                                                                                      | `disabled` (`false`)                                                                                                                               |
| Indentation                | `indentation` (rem, `1.5`)                                                                                                            | N/A (indent token)                                                                                                                                                       | N/A (indent token / CSS)                                                                                                                           |
| Accessibility labels       | `ariaLabel`, `ariaLabelledBy`, `togglerAriaLabel`                                                                                     | `ariaLabel`, `ariaLabelledby`                                                                                                                                            | `ariaLabel`, `ariaLabelledBy` (typings spell `ariaLabelledby`)                                                                                     |
| Imperative API             | `resetFilter()`, `scrollTo()`, `scrollToVirtualIndex()`, `getBlockableElement()`                                                      | N/A                                                                                                                                                                      | `filter(value)`, `getElement()`                                                                                                                    |
| Other                      | `trackBy`, `dt`, `pt`, `ptOptions`, `unstyled`                                                                                        | `dt`, `pt`, `ptOptions`, `unstyled`                                                                                                                                      | `showHeader` (`true`), `id`, `className`, `style`, `pt`, `ptOptions`, `unstyled`                                                                   |

Sources: `primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primevue-4.5.5:packages/primevue/src/tree/BaseTree.vue`, `primevue-4.5.5:packages/primevue/src/tree/Tree.d.ts`, `primereact-10.9.9:components/lib/tree/TreeBase.js`, `primereact-10.9.9:components/lib/tree/tree.d.ts`.

Node model (`TreeNode`):

- PrimeNG: `key`, `label`, `data`, `type`, `icon`, `expandedIcon`, `collapsedIcon`, `children`, `leaf`, `expanded`, `loading`, `selectable`, `draggable`, `droppable`, `style`, `styleClass`, plus the runtime fields `parent`, `checked` and `partialSelected` (`primeng-21.1.9:packages/primeng/src/api/treenode.ts`).
- PrimeVue: `key` (required string), `label`, `data`, `type`, `icon`, `expandedIcon`, `collapsedIcon`, `children`, `leaf`, `loading`, `selectable`, `draggable`, `droppable`, `style`, `styleClass`, and an open index signature. There is no `expanded` field because expansion is key based (`primevue-4.5.5:packages/primevue/src/treenode/TreeNode.d.ts`).
- PrimeReact: `key` (`string | number`), `label`, `data`, `icon`, `children`, `leaf`, `expanded`, `selectable`, `draggable` (`true`), `droppable` (`true`), `className`, `style`, `id` (`primereact-10.9.9:components/lib/treenode/treenode.d.ts`). There is no `type`, `loading` or per-node icon swap field; templates receive the node instead.

## 6. Usage guidance

- **Basic**: pass the node array as `value`. PrimeNG's page says the component "requires an array of TreeNode objects as value" (`primeng-21.1.9:apps/showcase/doc/tree/basic-doc.ts`); PrimeVue and PrimeReact use the same wording (`primevue-4.5.5:apps/showcase/doc/tree/BasicDoc.vue`, `primereact-10.9.9:components/doc/tree/basicdoc.js`).
- **Controlled expansion**: in PrimeNG, expand or collapse everything by setting `node.expanded` recursively and reassigning `value` (`primeng-21.1.9:apps/showcase/doc/tree/controlled-doc.ts`). In PrimeVue, set `expandedKeys` (the page calls it a "Map instance" but the type is a plain object) (`primevue-4.5.5:apps/showcase/doc/tree/ControlledDoc.vue`); in PrimeReact, pair `expandedKeys` with `onToggle` (`primereact-10.9.9:components/doc/tree/controlleddoc.js`).
- **Single selection**: set `selectionMode="single"` and bind the selection (`selection` in PrimeNG, `selectionKeys` in PrimeVue and PrimeReact) (`primeng-21.1.9:apps/showcase/doc/tree/single-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/selection/SingleDoc.vue`, `primereact-10.9.9:components/doc/tree/selection/singleselectiondoc.js`). A second click on the selected node clears it.
- **Multiple selection**: set `selectionMode="multiple"`; `metaKeySelection` switches between plain-click toggling and Ctrl/Cmd-click (`primeng-21.1.9:apps/showcase/doc/tree/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/selection/MultipleDoc.vue`, `primereact-10.9.9:components/doc/tree/selection/multipleselectiondoc.js`). The PrimeNG and PrimeReact pages claim a meta key is required by default, but both runtimes default `metaKeySelection` to `false` (see Section 11). The PrimeNG page also describes the binding as key/boolean pairs while the PrimeNG model is a `TreeNode[]`.
- **Checkbox selection**: use `selectionMode="checkbox"`; the state is `{checked, partialChecked}` per key in PrimeVue and PrimeReact, and `node.partialSelected` plus a node array in PrimeNG (`primeng-21.1.9:apps/showcase/doc/tree/checkbox-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/selection/CheckboxDoc.vue`, `primereact-10.9.9:components/doc/tree/selection/checkboxselectiondoc.js`). Disable propagation with `propagateSelectionUp`/`propagateSelectionDown` (PrimeNG, PrimeReact only).
- **Events**: PrimeNG exposes `onNodeExpand`, `onNodeCollapse`, `onNodeSelect`, `onNodeUnselect` (`primeng-21.1.9:apps/showcase/doc/tree/event-doc.ts`); PrimeVue emits `node-expand`, `node-collapse`, `node-select`, `node-unselect` (`primevue-4.5.5:apps/showcase/doc/tree/EventsDoc.vue`); PrimeReact has `onExpand`, `onCollapse`, `onSelect`, `onUnselect` and the click events (`primereact-10.9.9:components/doc/tree/eventsdoc.js`).
- **Filtering**: enable `filter` and choose `filterBy` (default `label`). Lenient mode keeps a node when it or any descendant matches (children of a matching node are not searched further); strict mode keeps a node only when the node itself matches (`primeng-21.1.9:apps/showcase/doc/tree/filter-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/FilterDoc.vue`, `primereact-10.9.9:components/doc/tree/filterdoc.js`). PrimeNG and PrimeReact expand matching ancestors automatically; PrimeVue does not touch `expandedKeys`.
- **Lazy loading**: mark a node as non-leaf, flag it `loading` while fetching and add the children in the expand handler. PrimeNG uses `loadingMode="icon"` with `node.loading` and `onNodeExpand` (`primeng-21.1.9:apps/showcase/doc/tree/lazy-doc.ts`); PrimeVue uses `loading` on the node and the `node-expand` event (`primevue-4.5.5:apps/showcase/doc/tree/LazyDoc.vue`); PrimeReact loads on `onExpand` (`primereact-10.9.9:components/doc/tree/lazydoc.js`).
- **Templating**: give nodes a `type` and supply a template of the same name, falling back to `default` (`primeng-21.1.9:apps/showcase/doc/tree/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/TemplateDoc.vue`). PrimeReact uses `nodeTemplate` and `togglerTemplate` functions instead (`primereact-10.9.9:components/doc/tree/templatedoc.js`).
- **Context menu**: in PrimeNG, bind a **ContextMenu** through `contextMenu` and `contextMenuSelection`; `contextMenuSelectionMode="separate"` keeps the right-click target apart from the normal selection (`primeng-21.1.9:apps/showcase/doc/tree/contextmenu-doc.ts`). In PrimeReact, use `contextMenuSelectionKey`, `onContextMenuSelectionChange` and `onContextMenu` (`primereact-10.9.9:components/doc/tree/contextmenudoc.js`). PrimeVue has no context-menu section or prop.
- **Virtual scroll**: PrimeNG only; set `virtualScroll`, `virtualScrollItemSize` and a fixed `scrollHeight` (`primeng-21.1.9:apps/showcase/doc/tree/virtualscroll-doc.ts`); combine with `lazy`, `loading` and `onNodeExpand` for server data (`primeng-21.1.9:apps/showcase/doc/tree/virtualscrolllazy-doc.ts`).
- **Single-tree drag and drop**: PrimeNG needs `draggableNodes`, `droppableNodes` and a `TreeDragDropService` provider (`primeng-21.1.9:apps/showcase/doc/tree/dragdrop/singledragdropdoc.ts`). PrimeVue also needs `v-model:value` (`primevue-4.5.5:apps/showcase/doc/tree/dragdrop/SingleDragDropDoc.vue`). PrimeReact needs `dragdropScope` and must store the value from `onDragDrop` (`primereact-10.9.9:components/doc/tree/dragdropdoc.js`).
- **Drag and drop between trees**: use matching `draggableScope`/`droppableScope` (a string or an array, PrimeNG and PrimeVue) to restrict where nodes can move; PrimeNG's demo also adds an `empty` template so an empty tree can still receive drops (`primeng-21.1.9:apps/showcase/doc/tree/dragdrop/multipledragdropdoc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/dragdrop/MultipleDragDropDoc.vue`).
- **Pass-through and theming pages**: PrimeNG and PrimeVue include a pass-through viewer (`primeng-21.1.9:apps/showcase/doc/tree/pt/PTComponent.ts`, `primevue-4.5.5:apps/showcase/doc/tree/pt/index.vue`); PrimeVue and PrimeReact add a Tailwind theming page (`primevue-4.5.5:apps/showcase/doc/tree/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/tree/theming/tailwinddoc.js`).

## 7. Accessibility

- Roles: the root list is `role="tree"` with `aria-label` or `aria-labelledby`; each node is `role="treeitem"`; each list of children is `role="group"` (PrimeNG omits the `group` list in virtual scroll mode, where the list is flat). The docs list the same roles (`primeng-21.1.9:apps/showcase/doc/tree/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tree/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/tree/accessibilitydoc.js`).
- Node attributes: `aria-label` (the node label), `aria-expanded`, `aria-level`, `aria-setsize` and `aria-posinset` are set by all three implementations (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`, `primereact-10.9.9:components/lib/tree/UITreeNode.js`). PrimeNG derives `aria-level` as `level + 1`; PrimeReact passes its `level` prop through.
- Selection state: PrimeNG sets `aria-selected` for single and multiple modes and `aria-checked` for checkbox mode. PrimeReact sets `aria-checked` and `aria-selected` (the latter true when the node is checked or selected). In PrimeVue the two computed values are swapped against their names: `aria-checked` is derived from the selected state in single and multiple modes and `aria-selected` from the checked state in checkbox mode, which contradicts the sentence in the docs that `aria-checked` replaces `aria-selected` in checkbox mode (`primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`).
- Toggle and checkbox: the toggle `<button>` has `tabindex="-1"` and the checkbox (the **Checkbox** component) has `tabindex="-1"`, so neither is reached with Tab; the docs say the icons are hidden from screen readers. PrimeNG declares `togglerAriaLabel` but its toggle button template does not use it (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`).
- Roving focus: the first node has `tabindex="0"` and the rest `-1`; on Tab the component moves the tab stop to the selected node, otherwise to the first (all three, in the node components).
- Keyboard (source, by `event.code`): ArrowDown and ArrowUp move between visible nodes; ArrowRight expands a collapsed node and then moves to its first child; ArrowLeft collapses an expanded node, otherwise moves to the parent; Enter, NumpadEnter and Space select in all three. Tab and Shift+Tab move into and out of the tree. There is no Home, End or type-ahead handling in any implementation.
- Context menu guard: PrimeNG ignores tree key events while a **ContextMenu** container has `display: block` (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`).
- Drag and drop has no keyboard alternative in the sources; the drop-point markers in PrimeVue and PrimeReact are `aria-hidden`.
- Filter input: PrimeNG and PrimeVue render an **InputText** inside an **IconField** with an **InputIcon**; PrimeReact renders a plain `<input type="text">` whose `aria-label` is `filterPlaceholder` (`primereact-10.9.9:components/lib/tree/Tree.js`).

## 8. Theming

- Shared structural CSS: `@primeuix/styles-2.0.3:dist/tree/index.mjs` (PrimeNG and PrimeVue). Key classes: `.p-tree`, `.p-tree-root-children`, `.p-tree-node-children`, `.p-tree-node-content`, `.p-tree-node-selectable`, `.p-tree-node-selected`, `.p-tree-node-dragover`, `.p-tree-node-drop-point`, `.p-tree-node-toggle-button`, `.p-tree-root`, `.p-tree-node-leaf` (hides the toggle with `visibility: hidden`), `.p-tree-filter`, `.p-tree-filter-input`, `.p-tree-loading-icon`, `.p-tree-mask` and `.p-tree-flex-scrollable`. Dragging a node adds a dashed primary outline through `[data-p-dragging]`.
- PrimeNG class names are built in `primeng-21.1.9:packages/primeng/src/tree/style/treestyle.ts`: root `p-tree p-component` with `p-tree-selectable`, `p-tree-loading`, `p-tree-flex-scrollable` and `p-tree-node-dragover`; node `p-tree-node` plus `p-tree-node-leaf`; content with `-selectable`, `-dragover`, `-selected`, `-contextmenu-selected`; and `p-tree-empty-message`. PrimeNG's style class map writes the drop marker as `p-tree-node-drop-point`, while the exported enum and the catalog say `p-tree-node-droppoint`.
- PrimeVue class names are in `primevue-4.5.5:packages/primevue/src/tree/style/TreeStyle.js`; the same set, plus `p-tree-filter` on the filter container, which is the only place the `filter.margin` token is used (PrimeNG's filter container does not get that class).
- PrimeReact uses older classes: `p-tree`, `p-tree-container`, `p-treenode`, `p-treenode-content`, `p-treenode-label`, `p-treenode-icon`, `p-treenode-children`, `p-treenode-droppoint`, `p-tree-toggler p-link`, `p-tree-filter-container`, `p-tree-loading-overlay`, `p-highlight`, `p-disabled`; these are set in `primereact-10.9.9:components/lib/tree/TreeBase.js` and listed in the style page `primereact-10.9.9:components/doc/tree/styledoc.js`. That page still lists `p-tree-horizontal`, which the component does not use.
- Tokens (`TreeDesignTokens`, `@primeuix/themes-2.0.3:types/tree/index.d.ts`; compatible libraries listed: PrimeNG and PrimeVue): `root` (`background`, `color`, `padding`, `gap`, `indent`, `transitionDuration`), `node` (`padding`, `borderRadius`, `hoverBackground`, `selectedBackground`, `color`, `hoverColor`, `selectedColor`, `focusRing`, `gap`), `nodeIcon` (`color`, `hoverColor`, `selectedColor`), `nodeToggleButton` (`borderRadius`, `size`, `hoverBackground`, `selectedHoverBackground`, `color`, `hoverColor`, `selectedHoverColor`, `focusRing`), `loadingIcon` (`size`) and `filter` (`margin`).
- Aura preset (`@primeuix/themes-2.0.3:dist/aura/tree/index.mjs`): root padding `1rem`, gap `2px`, indent `1rem`; node padding `0.25rem 0.5rem`, gap `0.25rem`, focus ring offset `-1px`, selected background `{highlight.background}`; toggle button `50%` radius and `1.75rem` size; loading icon `2rem`; filter margin `0 0 0.5rem 0`; the loading mask sets `--px-mask-background` with `light-dark(...)`.
- PrimeReact: tokens N/A (no `@primeuix` dependency in its tree); style via the classes above, the pass-through API, or the Tailwind preset entry `tree` in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- Per-component tokens can be overridden with the `dt` prop (PrimeNG and PrimeVue).

## 9. Relationships

- **TreeTable**: the columnar variant of the same hierarchy; it shares the `TreeNode` model, the `expandedKeys`/`selectionKeys` key-map style (PrimeVue, PrimeReact) and the `{checked, partialChecked}` state. Choose Tree when columns are not needed.
- **TreeSelect**: a dropdown over a tree. In PrimeVue it embeds this Tree and signals it through `$pcTreeSelect` (`primevue-4.5.5:packages/primevue/src/tree/Tree.vue`).
- **OrganizationChart**: another consumer of the `TreeNode` model, drawn as a node-link diagram.
- **Checkbox**: used in checkbox mode (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`, `primereact-10.9.9:components/lib/tree/UITreeNode.js`).
- **Scroller**: backs virtual scrolling and wraps the list in PrimeNG (`hostName` `tree`).
- **IconField**, **InputIcon** and **InputText**: build the filter input in PrimeNG and PrimeVue.
- **ContextMenu**: integrates through `contextMenu` in PrimeNG and through the selection-key callbacks in PrimeReact.
- **Ripple**: applied to the toggle button in all three.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/forms`; `primeng/api` (`TreeNode`, `TreeDragDropService`, `BlockableUI`, `PrimeTemplate`, `ScrollerOptions`), `primeng/basecomponent`, `primeng/bind`, `primeng/autofocus`, `primeng/checkbox`, `primeng/iconfield`, `primeng/inputicon`, `primeng/inputtext`, `primeng/ripple`, `primeng/scroller`, `primeng/icons` (search, spinner, chevron icons), `@primeuix/styles/tree` (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primeng-21.1.9:packages/primeng/src/tree/style/treestyle.ts`).
- PrimeVue: `@primevue/core` (`basecomponent`, style base), `primevue/checkbox`, `primevue/iconfield`, `primevue/inputicon`, `primevue/inputtext`, `primevue/ripple`, `@primevue/icons` (`search`, `spinner`, `check`, `minus`, `chevrondown`, `chevronright`), `@primeuix/utils` (`cn`, `object`, `dom` helpers), `@primeuix/styles/tree` (`primevue-4.5.5:packages/primevue/src/tree/Tree.vue`, `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`).
- PrimeReact: `../api/Api` (`PrimeReactContext`, `localeOption`), `../hooks/Hooks` (`useDebounce`, `useMergeProps`, `useUpdateEffect`), `../checkbox/Checkbox`, `../ripple/Ripple`, `../icons/search`, `../icons/spinner`, `../icons/chevrondown`, `../icons/chevronright`, `../icons/check`, `../icons/minus`, `../utils/Utils` (`primereact-10.9.9:components/lib/tree/Tree.js`, `primereact-10.9.9:components/lib/tree/UITreeNode.js`). No `@primeuix` styles.

## 11. Framework differences

| Aspect                       | PrimeNG                                                                                                           | PrimeVue                                                        | PrimeReact                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Expansion state              | Mutates `node.expanded`; no key map                                                                               | `expandedKeys` object, `update:expandedKeys`                    | `expandedKeys` + `onToggle`; `node.expanded` also honoured                                       |
| Selection state              | `selection` model, node object(s); `node.partialSelected` mutated                                                 | `selectionKeys` key map                                         | `selectionKeys` key map + `onSelectionChange`                                                    |
| Meta-key default             | `metaKeySelection` `false`; docs say a meta key is required                                                       | `metaKeySelection` `false`; docs say a meta key is not required | runtime `false`; typings and docs say `true`/required                                            |
| Checkbox propagation control | `propagateSelectionUp/Down` props                                                                                 | none (always propagates)                                        | `propagateSelectionUp/Down` props                                                                |
| Virtual scroll               | Yes (`virtualScroll`, **Scroller**)                                                                               | No                                                              | No                                                                                               |
| Context menu                 | `contextMenu` + `contextMenuSelection(Mode)`                                                                      | N/A                                                             | `contextMenuSelectionKey` + callbacks                                                            |
| Drag and drop wiring         | Provide `TreeDragDropService`; array mutated in place                                                             | `v-model:value`; immutable rebuild; module-level service        | `dragdropScope`; `onDragDrop` returns a cloned tree to store                                     |
| Drop positions               | Before (top 25%), child (middle), after (bottom 25%)                                                              | Before, child, after, with `aria-hidden` drop-point elements    | Explicit drop-point `li` elements; dropping on a node adds a child                               |
| Node `type` templates        | Yes (`node` template per `type`)                                                                                  | Yes (default slot per `type`)                                   | N/A; single `nodeTemplate` function                                                              |
| Filter accent handling       | `removeAccents` + locale lowercase                                                                                | locale lowercase only                                           | lowercase only                                                                                   |
| Filter auto-expands matches  | Yes (sets `node.expanded`)                                                                                        | No                                                              | Yes (calls `onToggle`)                                                                           |
| Filter trigger               | On input change, reapplied when `value` changes                                                                   | On `keyup`                                                      | Debounced (`filterDelay` 300 ms)                                                                 |
| Whole-tree disabled          | N/A                                                                                                               | N/A                                                             | `disabled`                                                                                       |
| Styling source               | `@primeuix/styles/tree` + themes                                                                                  | `@primeuix/styles/tree` + themes                                | Own CSS and `p-treenode-*` names                                                                 |
| Typing quirks                | Catalog PT key `nodeTogglerIcon` vs runtime `nodeToggleIcon`; `p-tree-node-droppoint` enum vs `-drop-point` class | `aria-checked`/`aria-selected` derived from swapped states      | `ariaLabelledby` in typings vs `ariaLabelledBy` at runtime; `emptyMessage` default doc vs `null` |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/tree/tree.ts`
- `primeng-21.1.9:packages/primeng/src/tree/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/tree/style/treestyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/tree/tree.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/treenode.ts`
- `primeng-21.1.9:packages/primeng/src/api/treedragdropservice.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/single-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/multiple-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/checkbox-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/controlled-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/event-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/filter-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/lazy-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/contextmenu-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/virtualscroll-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/virtualscrolllazy-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/dragdrop/singledragdropdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/dragdrop/multipledragdropdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/pt/PTComponent.ts`
- `primeng-21.1.9:apps/showcase/doc/tree/pt/PTViewer.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/tree/Tree.vue`
- `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`
- `primevue-4.5.5:packages/primevue/src/tree/BaseTree.vue`
- `primevue-4.5.5:packages/primevue/src/tree/Tree.d.ts`
- `primevue-4.5.5:packages/primevue/src/tree/TreeDragDropService.js`
- `primevue-4.5.5:packages/primevue/src/tree/style/TreeStyle.js`
- `primevue-4.5.5:packages/primevue/src/treenode/TreeNode.d.ts`
- `primevue-4.5.5:apps/showcase/doc/tree/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/ControlledDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/EventsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/FilterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/LazyDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/selection/SingleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/selection/MultipleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/selection/CheckboxDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/dragdrop/SingleDragDropDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/dragdrop/MultipleDragDropDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/tree/theming/TailwindDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/tree/Tree.js`
- `primereact-10.9.9:components/lib/tree/UITreeNode.js`
- `primereact-10.9.9:components/lib/tree/TreeBase.js`
- `primereact-10.9.9:components/lib/tree/tree.d.ts`
- `primereact-10.9.9:components/lib/treenode/treenode.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/tree/importdoc.js`
- `primereact-10.9.9:components/doc/tree/basicdoc.js`
- `primereact-10.9.9:components/doc/tree/controlleddoc.js`
- `primereact-10.9.9:components/doc/tree/eventsdoc.js`
- `primereact-10.9.9:components/doc/tree/filterdoc.js`
- `primereact-10.9.9:components/doc/tree/lazydoc.js`
- `primereact-10.9.9:components/doc/tree/templatedoc.js`
- `primereact-10.9.9:components/doc/tree/contextmenudoc.js`
- `primereact-10.9.9:components/doc/tree/dragdropdoc.js`
- `primereact-10.9.9:components/doc/tree/styledoc.js`
- `primereact-10.9.9:components/doc/tree/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/tree/pt/wireframe.js`
- `primereact-10.9.9:components/doc/tree/selection/singleselectiondoc.js`
- `primereact-10.9.9:components/doc/tree/selection/multipleselectiondoc.js`
- `primereact-10.9.9:components/doc/tree/selection/checkboxselectiondoc.js`
- `primereact-10.9.9:components/doc/tree/theming/tailwinddoc.js`
- `@primeuix/styles-2.0.3:dist/tree/index.mjs`
- `@primeuix/themes-2.0.3:types/tree/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/tree/index.mjs`
