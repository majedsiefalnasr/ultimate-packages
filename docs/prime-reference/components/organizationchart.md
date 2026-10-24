# OrganizationChart

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

OrganizationChart draws a tree of nodes as a top-down chart. Each node is a box, and lines connect it to its children. Nodes can be selectable (single or multiple) and collapsible, and their content can be templated per node `type`. All three frameworks render nested HTML tables: each node is a `table` whose rows hold the node cell, the connector lines and the child tables (`primeng-21.1.9:packages/primeng/src/organizationchart/organizationchart.ts`, `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChartNode.vue`, `primereact-10.9.9:components/lib/organizationchart/OrganizationChartNode.js`).

## 2. Names & status

- Canonical name: **OrganizationChart** (component and class name in all three frameworks).
- Menu label: **OrgChart** in the Data group of PrimeNG (`primeng-21.1.9:apps/showcase/assets/data/menu.json`) and PrimeVue (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`), and **Org Chart** in PrimeReact (`primereact-10.9.9:components/layout/menu.json`). All three link to the route `/organizationchart`. "OrgChart" is a menu label only, not an exported name.
- Legacy aliases: none.
- Deprecated: PrimeNG `styleClass` (since v20.0.0, use `class`) and `preserveSpace` (since v20.0.0). PrimeVue `togglericon` slot (since v4.0, use `toggleicon`). PrimeReact: none.
- PrimeNG selector aliases: `p-organizationChart`, `p-organization-chart`, `p-organizationchart`. The internal node renderer is the attribute directive component `[pOrganizationChartNode]`.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `OrganizationChartModule` from `primeng/organizationchart`, or the standalone `OrganizationChart` (`primeng-21.1.9:apps/showcase/doc/organizationchart/import-doc.ts`).
- Source `primeng-21.1.9:packages/primeng/src/organizationchart/organizationchart.ts` (`OrganizationChart` and `OrganizationChartNode`); style `primeng-21.1.9:packages/primeng/src/organizationchart/style/organizationchartstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/organizationchart/organizationchart.types.ts`; exports `primeng-21.1.9:packages/primeng/src/organizationchart/public_api.ts`.
- `value` is a `TreeNode[]`; only the first element is drawn (`root` getter returns `value[0]`). Expansion is stored on the node itself (`node.expanded`).

**PrimeVue 4.5.5**

- Import: `import OrganizationChart from 'primevue/organizationchart'` (`primevue-4.5.5:apps/showcase/doc/organizationchart/ImportDoc.vue`).
- Source `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChart.vue` and `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChartNode.vue`; props `primevue-4.5.5:packages/primevue/src/organizationchart/BaseOrganizationChart.vue`; types `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChart.d.ts`; style `primevue-4.5.5:packages/primevue/src/organizationchart/style/OrganizationChartStyle.js`.
- `value` is a single root node (`OrganizationChartNode`, with a required `key`). Selection and collapse state are key maps: `selectionKeys` and `collapsedKeys`. A node is expanded unless its key is in `collapsedKeys`.

**PrimeReact 10.9.9**

- Import: `import { OrganizationChart } from 'primereact/organizationchart'` (`primereact-10.9.9:components/doc/organizationchart/importdoc.js`).
- Source `primereact-10.9.9:components/lib/organizationchart/OrganizationChart.js` and `primereact-10.9.9:components/lib/organizationchart/OrganizationChartNode.js`; defaults and CSS `primereact-10.9.9:components/lib/organizationchart/OrganizationChartBase.js`; types `primereact-10.9.9:components/lib/organizationchart/organizationchart.d.ts`.
- `value` is an array; the first element is the root. Each node keeps its own expanded state (`useState(node.expanded)`). Children are split into rows of at most ten (`MAX_CHILDREN_PER_ROW = 10`), which PrimeNG and PrimeVue do not do.

## 4. Anatomy

| Part               | PrimeNG PT key                    | PrimeVue PT key                   | PrimeReact PT key       | Notes                                         |
| ------------------ | --------------------------------- | --------------------------------- | ----------------------- | --------------------------------------------- |
| Root               | `host` / `root`                   | `root`                            | `root`                  | `p-organizationchart p-component`             |
| Node table         | `table`                           | `table`                           | `table`                 | One per node, nested                          |
| Table body         | `body`                            | `body`                            | N/A                     |                                               |
| Node row and cell  | `row`, `cell`                     | `row`, `cell`                     | `row`, `cell`           | Cell spans `2 × children` columns             |
| Node box           | `node`                            | `node`                            | `node`                  | Label or template, selection target           |
| Toggle button      | `nodeToggleButton`                | `nodeToggleButton`                | `nodeToggler`           | `a` with `tabindex="0"`                       |
| Toggle icon        | `nodeToggleButtonIcon`            | `nodeToggleButtonIcon`            | `nodeTogglerIcon`       | Chevron down when expanded, up when collapsed |
| Connector rows     | `connectors`                      | `connectors`                      | `lines`                 | Hidden (`visibility: hidden`) when collapsed  |
| Line cell          | `lineCell`                        | `lineCell`                        | `lineCell`              |                                               |
| Vertical connector | `connectorDown`                   | `connectorDown`                   | `lineDown`              |                                               |
| Horizontal halves  | `connectorLeft`, `connectorRight` | `connectorLeft`, `connectorRight` | `lineLeft`, `lineRight` | Top border except at the outer ends           |
| Children row       | `nodeChildren`                    | `nodeChildren`                    | `nodes`                 |                                               |
| Child cell         | `nodeCell`                        | `nodeCell`                        | `nodeCell`              | Holds the child's table                       |

Sources: `primeng-21.1.9:packages/primeng/src/types/organizationchart/organizationchart.types.ts`, `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChart.d.ts`, `primereact-10.9.9:components/lib/organizationchart/organizationchart.d.ts`.

## 5. API highlights

| Concern          | PrimeNG                                                                                            | PrimeVue                                                                                                                        | PrimeReact                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Data             | `value: TreeNode[]` (first element is the root)                                                    | `value: OrganizationChartNode` (single root, `key` required)                                                                    | `value: OrganizationChartNodeData[]` (first element is the root)                                |
| Node fields      | `TreeNode`: `label`, `type`, `styleClass`, `expanded`, `selectable`, `leaf`, `children`, `data`    | `key`, `type`, `styleClass`, `data`, `selectable`, `collapsible`, `children`                                                    | `label`, `className`, `expanded`, `selectable`, `children`                                      |
| Selection        | `selectionMode: 'single' \| 'multiple' \| null`; `selection` / `selectionChange` (`[(selection)]`) | `selectionMode`; `selectionKeys` (`v-model:selectionKeys`)                                                                      | `selectionMode: 'single' \| 'multiple'`; `selection`, `onSelectionChange {originalEvent, data}` |
| Selection events | `onNodeSelect`, `onNodeUnselect` (`{originalEvent, node}`)                                         | `node-select`, `node-unselect` (payload: the node)                                                                              | `onNodeSelect`, `onNodeUnselect` (`{originalEvent, node}`)                                      |
| Collapse         | `collapsible` (shows toggle buttons); `onNodeExpand`, `onNodeCollapse` (`{originalEvent, node}`)   | `collapsible` (false), `collapsedKeys` (`v-model:collapsedKeys`); `node-expand`, `node-collapse`; per-node `collapsible: false` | No `collapsible` prop: every non-leaf node gets a toggle; no expand/collapse events             |
| Node content     | `pTemplate` named after `node.type`, or `default` (context `$implicit` = node)                     | Slot named after `node.type`, or `default` (`{node}`)                                                                           | `nodeTemplate(node)`                                                                            |
| Toggle icon      | `togglericon` template (context `$implicit` = expanded)                                            | `toggleicon` slot (`{expanded}`); `togglericon` deprecated                                                                      | `togglerIcon`                                                                                   |
| Other            | `preserveSpace` (true, deprecated; adds `p-organizationchart-preservespace`)                       | `dt`, `pt`, `ptOptions`, `unstyled`                                                                                             | `pt`, `ptOptions`, `unstyled`                                                                   |

## 6. Usage guidance

- **Basic:** pass the hierarchy and a label per node; the chart draws boxes and connectors. PrimeNG and PrimeReact wrap the root in an array (`primeng-21.1.9:apps/showcase/doc/organizationchart/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/organizationchart/BasicDoc.vue`, `primereact-10.9.9:components/doc/organizationchart/basicdoc.js`).
- **Template:** replace the label with custom markup, for example a flag image above a country name. PrimeNG uses `pTemplate="default"` (`primeng-21.1.9:apps/showcase/doc/organizationchart/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/organizationchart/TemplateDoc.vue`, `primereact-10.9.9:components/doc/organizationchart/templatedoc.js`).
- **Selection:** set `selectionMode` (`multiple` in the demos) and bind the selection. Nodes marked `selectable: false` ignore clicks (`primeng-21.1.9:apps/showcase/doc/organizationchart/selection-doc.ts`, `primevue-4.5.5:apps/showcase/doc/organizationchart/SelectionDoc.vue`, `primereact-10.9.9:components/doc/organizationchart/selectiondoc.js`).
- **Colored:** style single nodes through the node's `styleClass` (`className` in PrimeReact) and a typed template such as `pTemplate="person"` (`primeng-21.1.9:apps/showcase/doc/organizationchart/colored.-doc.ts`, `primevue-4.5.5:apps/showcase/doc/organizationchart/ColoredDoc.vue`, `primereact-10.9.9:components/doc/organizationchart/coloreddoc.js`). The PrimeNG file is literally named `colored.-doc.ts`.
- Clicking the toggle button does not select the node: PrimeNG and PrimeVue check the event target's `data-pc-section` before selecting.
- No services needed.

## 7. Accessibility

- All three accessibility docs say the table-based markup gives weak screen-reader support and that a nested list with tree-widget roles is planned. No roles or ARIA attributes are set on nodes today (`primeng-21.1.9:apps/showcase/doc/organizationchart/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/organizationchart/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/organizationchart/accessibilitydoc.js`).
- Keyboard: Tab moves between the toggle buttons; Enter and Space toggle a node. PrimeVue and PrimeReact also accept NumpadEnter (`onKeydown` / `onKeyDown` check `event.code`); PrimeNG binds `keydown.enter` and `keydown.space`. Only the PrimeReact doc lists numpad enter.
- Selection is mouse-only: the node box has no tabindex and no key handler in any framework.
- PrimeReact renders the toggle as `<a href="#">` and calls `preventDefault`.

## 8. Theming

- PrimeNG/PrimeVue classes: `p-organizationchart p-component` (PrimeNG adds `p-organizationchart-preservespace`), `p-organizationchart-table`, `p-organizationchart-node` (+`p-organizationchart-node-selectable`, `p-organizationchart-node-selected`), `p-organizationchart-node-toggle-button`, `p-organizationchart-node-toggle-button-icon`, `p-organizationchart-connectors`, `p-organizationchart-connector-down`, `p-organizationchart-connector-left` / `-right` (+`p-organizationchart-connector-top`), `p-organizationchart-node-children` (`primeng-21.1.9:packages/primeng/src/organizationchart/style/organizationchartstyle.ts`, `primevue-4.5.5:packages/primevue/src/organizationchart/style/OrganizationChartStyle.js`). PrimeVue also adds `p-disabled` to the toggle button when the node is not selectable.
- PrimeReact classes keep the older names: `p-organizationchart-node-content` (+`p-organizationchart-selectable-node`, `p-highlight`), `p-node-toggler`, `p-node-toggler-icon`, `p-organizationchart-lines`, `p-organizationchart-line-down`, `p-organizationchart-line-left` / `-right` (+`p-organizationchart-line-top`), `p-organizationchart-nodes`. Own CSS in `primereact-10.9.9:components/lib/organizationchart/OrganizationChartBase.js`; Tailwind preset in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/organizationchart/index.mjs`.
- Tokens: `OrganizationChartDesignTokens` with sections `root` (`gutter`, `transitionDuration`), `node` (background, hover and selected colors, `padding`, `toggleablePadding`, `borderRadius`), `nodeToggleButton` (colors, `size`, `borderRadius`, `focusRing`), `connector` (`color`, `borderRadius`, `height`) (`@primeuix/themes-2.0.3:types/organizationchart/index.d.ts`). Aura sets `gutter` `0.75rem`, toggle `size` `1.5rem` with `borderRadius` `50%`, and connector `height` `24px` (`@primeuix/themes-2.0.3:dist/aura/organizationchart/index.mjs`). PrimeReact: tokens N/A.

## 9. Relationships

- Shares the tree data model with **Tree** and **TreeTable**: PrimeNG types `value` as `TreeNode` from `primeng/api`, and the PrimeReact demos type nodes as `TreeNode`.
- Selection and key-map conventions (`selectionKeys`, `collapsedKeys`) in PrimeVue match the Tree component's `selectionKeys`/`expandedKeys` style.
- Uses no other Prime components besides the chevron icons.

## 10. Dependencies

- PrimeNG: `primeng/api` (`PrimeTemplate`, `SharedModule`, `TreeNode`), `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`ChevronDownIcon`, `ChevronUpIcon`), `@primeuix/utils` (`hasClass`, `isAttributeEquals`), `rxjs` (`Subject` for selection changes), `@primeuix/styles/organizationchart`.
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/icons/chevrondown`, `@primevue/icons/chevronup`, `@primeuix/utils/dom`, `@primeuix/styles/organizationchart`.
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase`, `../hooks/Hooks` (`useMergeProps`), `../utils/Utils`, `../icons/chevrondown`, `../icons/chevronup`.

## 11. Framework differences

| Aspect                 | PrimeNG                                    | PrimeVue                              | PrimeReact                                           |
| ---------------------- | ------------------------------------------ | ------------------------------------- | ---------------------------------------------------- |
| `value` shape          | Array, first item is root                  | Single root node                      | Array, first item is root                            |
| Selection binding      | Node objects (`selection`)                 | Key map (`selectionKeys`)             | Node objects (`selection` + `onSelectionChange`)     |
| Collapse state         | `node.expanded` (mutated)                  | `collapsedKeys` key map (v-model)     | Internal per-node state, seeded from `node.expanded` |
| Collapsible switch     | `collapsible` prop                         | `collapsible` prop + per-node opt-out | None: every non-leaf node toggles                    |
| Expand/collapse events | Yes                                        | Yes                                   | No                                                   |
| Content template       | Per `type` or `default`                    | Per `type` or `default` slot          | Single `nodeTemplate`                                |
| Children per row       | Unlimited                                  | Unlimited                             | Wrapped every 10                                     |
| Class names            | `p-organizationchart-node`, `-connector-*` | Same as PrimeNG                       | Older `-node-content`, `-line-*`, `p-node-toggler`   |
| Design tokens          | `@primeuix/themes`                         | `@primeuix/themes`                    | N/A                                                  |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/organizationchart/organizationchart.ts`
- `primeng-21.1.9:packages/primeng/src/organizationchart/style/organizationchartstyle.ts`
- `primeng-21.1.9:packages/primeng/src/organizationchart/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/organizationchart/organizationchart.types.ts`
- `primeng-21.1.9:apps/showcase/doc/organizationchart/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/organizationchart/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/organizationchart/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/organizationchart/selection-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/organizationchart/colored.-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/organizationchart/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChart.vue`
- `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChartNode.vue`
- `primevue-4.5.5:packages/primevue/src/organizationchart/BaseOrganizationChart.vue`
- `primevue-4.5.5:packages/primevue/src/organizationchart/OrganizationChart.d.ts`
- `primevue-4.5.5:packages/primevue/src/organizationchart/style/OrganizationChartStyle.js`
- `primevue-4.5.5:apps/showcase/doc/organizationchart/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/organizationchart/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/organizationchart/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/organizationchart/SelectionDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/organizationchart/ColoredDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/organizationchart/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/organizationchart/OrganizationChart.js`
- `primereact-10.9.9:components/lib/organizationchart/OrganizationChartNode.js`
- `primereact-10.9.9:components/lib/organizationchart/OrganizationChartBase.js`
- `primereact-10.9.9:components/lib/organizationchart/organizationchart.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/organizationchart/importdoc.js`
- `primereact-10.9.9:components/doc/organizationchart/basicdoc.js`
- `primereact-10.9.9:components/doc/organizationchart/templatedoc.js`
- `primereact-10.9.9:components/doc/organizationchart/selectiondoc.js`
- `primereact-10.9.9:components/doc/organizationchart/coloreddoc.js`
- `primereact-10.9.9:components/doc/organizationchart/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/organizationchart/index.mjs`
- `@primeuix/themes-2.0.3:types/organizationchart/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/organizationchart/index.mjs`
