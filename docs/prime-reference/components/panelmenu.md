# PanelMenu

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

PanelMenu is a vertical, inline navigation menu that combines an accordion with a tree: each root item is a collapsible panel header, and its children render as a tree whose groups expand and collapse in place (no overlays). One panel is open at a time unless `multiple` is set, and the expanded state can be driven from outside (`primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`, `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.vue`, `primereact-10.9.9:components/lib/panelmenu/PanelMenu.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model); `items` nests recursively, and `expanded` (PrimeNG) or `key` + `expandedKeys` (PrimeVue, PrimeReact) control which nodes are open.

## 2. Names & status

- Canonical name: **PanelMenu** in all three frameworks; not deprecated.
- Showcase menu: `PanelMenu` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `styleClass` (`@deprecated` since v20.0.0, use `class`) and `transitionOptions` (`@deprecated` since v21.0.0, use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`). None in PrimeVue or PrimeReact.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { PanelMenuModule } from 'primeng/panelmenu'` or the standalone `PanelMenu` class (`primeng-21.1.9:apps/showcase/doc/panelmenu/import-doc.ts`).
- Selectors `p-panelMenu`, `p-panelmenu`, `p-panel-menu`; class `PanelMenu extends BaseComponent<PanelMenuPassThrough>`, providers `PanelMenuStyle`, `PANELMENU_INSTANCE`, `PARENT_INSTANCE`.
- Internal parts: `PanelMenuList` (`ul[pPanelMenuList]`, the tree inside one panel, owns keyboard handling) and recursive `PanelMenuSub` (`ul[pPanelMenuSub]`) (`primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`, `primeng-21.1.9:packages/primeng/src/panelmenu/public_api.ts`).
- Style `primeng-21.1.9:packages/primeng/src/panelmenu/style/panelmenustyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/panelmenu/panelmenu.types.ts`.

**PrimeVue 4.5.5**

- Import: `import PanelMenu from 'primevue/panelmenu'` (`primevue-4.5.5:apps/showcase/doc/panelmenu/ImportDoc.vue`); tag `<PanelMenu>`.
- Source `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.vue` (headers), `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuList.vue` (tree + keyboard), `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuSub.vue` (recursive), props `primevue-4.5.5:packages/primevue/src/panelmenu/BasePanelMenu.vue`, types `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.d.ts`, style `primevue-4.5.5:packages/primevue/src/panelmenu/style/PanelMenuStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { PanelMenu } from 'primereact/panelmenu'` (`primereact-10.9.9:components/doc/panelmenu/importdoc.js`).
- Source `primereact-10.9.9:components/lib/panelmenu/PanelMenu.js`, `primereact-10.9.9:components/lib/panelmenu/PanelMenuList.js`, `primereact-10.9.9:components/lib/panelmenu/PanelMenuSub.js`, defaults/CSS `primereact-10.9.9:components/lib/panelmenu/PanelMenuBase.js`, types `primereact-10.9.9:components/lib/panelmenu/panelmenu.d.ts`.

## 4. Anatomy

| Part              | PrimeNG / PrimeVue section                         | PrimeReact section                                                | Content                                   |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Root              | `root`                                             | `root`                                                            | Outer container                           |
| Panel             | `panel`                                            | `panel`                                                           | One per root item                         |
| Header            | `header`                                           | `header`                                                          | `role="button"` toggle for the panel      |
| Header content    | `headerContent`, `headerLink`                      | `headerContent`, `headerAction`                                   | Clickable wrapper and link                |
| Header icons      | `submenuIcon`, `headerIcon`                        | `headerSubmenuIcon` (+ `expandIcon`/`collapseIcon`), `headerIcon` | Chevron toggle and `item.icon`            |
| Header label      | `headerLabel`                                      | `headerLabel`                                                     | `item.label`                              |
| Content container | `contentContainer`                                 | `toggleableContent`, `headerToggleableContent`                    | `role="region"` collapsible area          |
| Content           | `contentWrapper` (NG only), `content`              | `menuContent`                                                     | Inner wrappers                            |
| Tree list         | `rootList`, `submenu`                              | `menu`                                                            | `role="tree"` root, `role="group"` nested |
| Item              | `item`                                             | `menuitem`                                                        | `<li role="treeitem">`                    |
| Item parts        | `itemContent`, `itemLink`, `itemIcon`, `itemLabel` | `action`, `icon`, `label`                                         | Clickable content                         |
| Separator         | `separator`                                        | `separator`                                                       | `<li role="separator">`                   |
| Animation         | `motion` (NG) / `transition` (PV)                  | `transition`                                                      | Expand/collapse animation                 |

Sources: `primeng-21.1.9:packages/primeng/src/types/panelmenu/panelmenu.types.ts`, `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.d.ts`, `primereact-10.9.9:components/lib/panelmenu/panelmenu.d.ts`.

## 5. API highlights

| Prop           | PrimeNG                                                                                                   | PrimeVue                                                       | PrimeReact                               |
| -------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `model`        | `MenuItem[]`                                                                                              | `MenuItem[]`, `null`                                           | `MenuItem[]`, `null`                     |
| `multiple`     | `boolean`, `false`                                                                                        | `boolean`, `false`                                             | `boolean`, `false`                       |
| Expanded state | `item.expanded` on the model (mutated in place)                                                           | `expandedKeys` (`v-model:expandedKeys`), map of `key` → `true` | `expandedKeys` + `onExpandedKeysChange`  |
| Animation      | `motionOptions: MotionOptions`; deprecated `transitionOptions` (`'400ms cubic-bezier(0.86, 0, 0.07, 1)'`) | PT `transition`                                                | `transitionOptions: CSSTransitionProps`  |
| `tabindex`     | `number`, `0`                                                                                             | `number`, `0`                                                  | N/A                                      |
| `id`           | `string`                                                                                                  | via attrs                                                      | `string`                                 |
| Icons          | `#headericon`, `#submenuicon` templates                                                                   | `headericon`, `submenuicon`, `itemicon` slots                  | `expandIcon`, `collapseIcon`: `IconType` |

- Events: PrimeNG none on `PanelMenu` (state lives on the model); PrimeVue emits `update:expandedKeys`, `panel-open`, `panel-close` (`PanelMenuPanelOpenEvent` `{ originalEvent, item }`); PrimeReact `onOpen`, `onClose` (`PanelMenuHeaderItemClickEvent` `{ originalEvent, item }`), `onExpandedKeysChange`.
- Methods: PrimeNG `collapseAll()` (clears `expanded` on root items); PrimeVue none declared; PrimeReact `getElement()` (`primereact-10.9.9:components/lib/panelmenu/panelmenu.d.ts`).
- Templates/slots: PrimeNG `item` (`PanelMenuItemTemplateContext` `{ $implicit: MenuItem }`), `headericon`, `submenuicon`. PrimeVue `item` (`{ item, root, active, label, props, hasSubmenu }`, `props` = `PanelMenuRouterBindProps`), `headericon` (`{ item, class }`), `submenuicon` (`{ active }`), `itemicon` (`{ item, class }`). PrimeReact: `MenuItem.template`.
- Source quirk (PrimeNG): in the `routerLink` branch of `PanelMenuSub`, the custom submenu-icon outlet is written `submenuIconTemplate && _submenuIconTemplate`, unlike the `||` used in the plain-link branch, so a custom icon only renders there when both template fields are set (`primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`).

## 6. Usage guidance

- **Basic:** headers with nested item trees in a fixed-width sidebar (`primeng-21.1.9:apps/showcase/doc/panelmenu/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/BasicDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/basicdoc.js`).
- **Multiple:** `multiple` allows several panels open at once (`primeng-21.1.9:apps/showcase/doc/panelmenu/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/MultipleDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/multipledoc.js`).
- **Controlled:** expand/collapse everything from a button — PrimeNG rewrites `expanded` across the model recursively; PrimeVue and PrimeReact build an `expandedKeys` object from item `key`s (`primeng-21.1.9:apps/showcase/doc/panelmenu/controlled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/ControlledDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/controlleddoc.js`).
- **Template:** custom items with badges and shortcut hints via the `item` template/slot or PrimeReact `template` (`primeng-21.1.9:apps/showcase/doc/panelmenu/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/TemplateDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/templatedoc.js`).
- **Command:** item `command` callbacks (`primeng-21.1.9:apps/showcase/doc/panelmenu/command-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/CommandDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/commanddoc.js`).
- **Router:** PrimeNG `routerLink`; PrimeVue `router-link custom` in the `item` slot; PrimeReact `command`/`url` (`primeng-21.1.9:apps/showcase/doc/panelmenu/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/RouterDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/routerdoc.js`).
- **Styling (PrimeReact):** class reference (`primereact-10.9.9:components/doc/panelmenu/styledoc.js`).
- Prefer PanelMenu for persistent sidebars where the hierarchy should stay visible; use [TieredMenu](tieredmenu.md) or [Menubar](menubar.md) when space is limited and overlays are acceptable.

## 7. Accessibility

- Docs: each header is a `button` with `aria-label`, `aria-expanded` and `aria-controls` pointing at a `region` labelled by the header; the content is a `tree` of `treeitem`s whose groups are `group`s, with `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset` (`primeng-21.1.9:apps/showcase/doc/panelmenu/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panelmenu/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/panelmenu/accessibilitydoc.js`).
- Source: PrimeVue and PrimeReact render nested lists with `role="group"` as documented; PrimeNG's `PanelMenuSub` host hardcodes `role="tree"` for every level, so nested lists are also `tree` (`primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`, `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuSub.vue`, `primereact-10.9.9:components/lib/panelmenu/PanelMenuSub.js`).
- PrimeNG also sets `aria-hidden` on a sub list while its parent panel is collapsed; focus inside the tree is tracked with `aria-activedescendant` in all three.
- Keyboard, headers: Up/Down move between headers, Home/End jump to first/last, Enter/Space toggle the panel, Tab moves into the open panel's tree (`primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.vue`).
- Keyboard, tree: Up/Down move through visible items; Right expands a group (or moves into it once expanded); Left collapses it or moves to the parent; Home/End jump to ends; Enter/Space activate an item or toggle a group; printable characters search by label (`primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuList.vue`).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-panelmenu` (+ `p-component`), `p-panelmenu-panel`, `p-panelmenu-header` (+ `p-panelmenu-header-active`, `p-disabled`), `p-panelmenu-header-content`, `p-panelmenu-header-link`, `p-panelmenu-header-icon`, `p-panelmenu-header-label`, `p-panelmenu-content-container`, `p-panelmenu-content-wrapper`, `p-panelmenu-content`, `p-panelmenu-root-list`, `p-panelmenu-item` (+ `p-focus`, `p-disabled`), `p-panelmenu-item-content`, `p-panelmenu-item-link`, `p-panelmenu-item-icon`, `p-panelmenu-item-label`, `p-panelmenu-submenu-icon`, `p-panelmenu-submenu`, `p-menuitem-separator`; PrimeNG adds `p-panelmenu-expanded` and `p-menuitem-badge` (`primeng-21.1.9:packages/primeng/src/panelmenu/style/panelmenustyle.ts`, `primevue-4.5.5:packages/primevue/src/panelmenu/style/PanelMenuStyle.js`).
- PT keys: see Anatomy; PrimeNG global PT key `panelMenu` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/panelmenu/index.mjs`.
- Design tokens: `PanelMenuDesignTokens` groups `root`, `panel`, `item`, `submenu`, `submenuIcon` (`@primeuix/themes-2.0.3:types/panelmenu/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/panelmenu/index.mjs`.
- PrimeReact: own CSS in `PanelMenuBase.js`; classes `p-panelmenu p-component`, `p-panelmenu-panel`, `p-panelmenu-header-content`, `p-panelmenu-header-link`, `p-toggleable-content` (+ `p-toggleable-content-collapsed`), `p-panelmenu-content`, `p-panelmenu-root-list`, `p-submenu-list`, `p-menuitem` (+ `p-highlight`, `p-focus`, `p-disabled`), `p-menuitem-content`, `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-submenu-icon`, `p-menuitem-separator` (`primereact-10.9.9:components/lib/panelmenu/PanelMenuBase.js`). Tokens N/A.

## 9. Relationships

- Embeds: ChevronDown/ChevronRight icons; PrimeVue and PrimeReact use Ripple in sub items; PrimeNG uses Tooltip and `primeng/motion`.
- Related: [Accordion](accordion.md) (same header/region pattern for content), [Tree](tree.md) (same tree semantics for data), [TieredMenu](tieredmenu.md) (overlay alternative), [Menu](menu.md) (shared item model).

## 10. Dependencies

- PrimeNG: `@angular/router`, `@primeuix/motion` (`MotionOptions`), `@primeuix/utils`, `primeng/api` (`MenuItem`, `PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`ChevronDownIcon`, `ChevronRightIcon`), `primeng/motion`, `primeng/tooltip` (`primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`).
- PrimeVue: `@primeuix/utils` (`dom`, `object`), `@primevue/core/basecomponent`, `@primevue/icons/chevrondown`, `@primevue/icons/chevronright`, `primevue/ripple` (`primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.vue`, `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuSub.vue`, `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuList.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks`, `../icons/chevrondown`, `../icons/chevronright`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/panelmenu/PanelMenu.js`, `primereact-10.9.9:components/lib/panelmenu/PanelMenuSub.js`); npm `react-transition-group` via CSSTransition.

## 11. Framework differences

| Aspect               | PrimeNG                                          | PrimeVue                          | PrimeReact                                                    |
| -------------------- | ------------------------------------------------ | --------------------------------- | ------------------------------------------------------------- |
| Expanded state       | `item.expanded` mutated on the model             | `expandedKeys` with `v-model`     | `expandedKeys` + `onExpandedKeysChange`                       |
| Open/close events    | none                                             | `panel-open`, `panel-close`       | `onOpen`, `onClose`                                           |
| Nested list role     | `tree` (docs say `group`)                        | `group`                           | `group`                                                       |
| Animation API        | `motionOptions` (deprecated `transitionOptions`) | PT `transition` (`p-collapsible`) | `transitionOptions`                                           |
| Header icon override | `#headericon` template                           | `headericon` slot                 | `expandIcon` / `collapseIcon` props                           |
| Public methods       | `collapseAll()`                                  | none declared                     | `getElement()`                                                |
| Class naming         | `p-panelmenu-*`                                  | `p-panelmenu-*`                   | mix of `p-panelmenu-*`, `p-menuitem*`, `p-toggleable-content` |
| Design tokens        | `@primeuix/themes`                               | `@primeuix/themes`                | N/A                                                           |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/panelmenu/panelmenu.ts`
- `primeng-21.1.9:packages/primeng/src/panelmenu/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/panelmenu/style/panelmenustyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/panelmenu/panelmenu.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/multiple-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/controlled-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/command-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/panelmenu/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.vue`
- `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuList.vue`
- `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenuSub.vue`
- `primevue-4.5.5:packages/primevue/src/panelmenu/BasePanelMenu.vue`
- `primevue-4.5.5:packages/primevue/src/panelmenu/PanelMenu.d.ts`
- `primevue-4.5.5:packages/primevue/src/panelmenu/style/PanelMenuStyle.js`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/MultipleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/ControlledDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/CommandDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/panelmenu/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/panelmenu/PanelMenu.js`
- `primereact-10.9.9:components/lib/panelmenu/PanelMenuList.js`
- `primereact-10.9.9:components/lib/panelmenu/PanelMenuSub.js`
- `primereact-10.9.9:components/lib/panelmenu/PanelMenuBase.js`
- `primereact-10.9.9:components/lib/panelmenu/panelmenu.d.ts`
- `primereact-10.9.9:components/doc/panelmenu/importdoc.js`
- `primereact-10.9.9:components/doc/panelmenu/basicdoc.js`
- `primereact-10.9.9:components/doc/panelmenu/multipledoc.js`
- `primereact-10.9.9:components/doc/panelmenu/controlleddoc.js`
- `primereact-10.9.9:components/doc/panelmenu/templatedoc.js`
- `primereact-10.9.9:components/doc/panelmenu/commanddoc.js`
- `primereact-10.9.9:components/doc/panelmenu/routerdoc.js`
- `primereact-10.9.9:components/doc/panelmenu/styledoc.js`
- `primereact-10.9.9:components/doc/panelmenu/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/panelmenu/index.mjs`
- `@primeuix/themes-2.0.3:types/panelmenu/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/panelmenu/index.mjs`
