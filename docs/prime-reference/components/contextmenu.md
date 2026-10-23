# ContextMenu

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ContextMenu is a cascading overlay menu shown at the pointer position, normally in response to a right click (`contextmenu` event) on a target element or anywhere in the document. Its items can open nested submenus to any depth, like [TieredMenu](tieredmenu.md); below a `breakpoint` width submenus stack inline instead of flying out (`primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`, `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.vue`, `primereact-10.9.9:components/lib/contextmenu/ContextMenu.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model); `items` nests recursively.

## 2. Names & status

- Canonical name: **ContextMenu** in all three frameworks; no legacy alias; not deprecated.
- Showcase menu: `ContextMenu` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: none marked `@deprecated` in any of the three sources. PrimeNG still exposes `style`/`styleClass` as plain inputs here (`primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`).

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { ContextMenuModule } from 'primeng/contextmenu'` or the standalone `ContextMenu` class (`primeng-21.1.9:apps/showcase/doc/contextmenu/import-doc.ts`).
- Selectors `p-contextMenu`, `p-contextmenu`, `p-context-menu`; class `ContextMenu extends BaseComponent<ContextMenuPassThrough>`, providers `ContextMenuStyle`, `CONTEXTMENU_INSTANCE`.
- Internal recursive sub-component `ContextMenuSub` (selectors `p-contextMenuSub`, `p-contextmenu-sub`), exported from the same entry (`primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`, `primeng-21.1.9:packages/primeng/src/contextmenu/public_api.ts`).
- Style `primeng-21.1.9:packages/primeng/src/contextmenu/style/contextmenustyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/contextmenu/contextmenu.types.ts`.

**PrimeVue 4.5.5**

- Import: `import ContextMenu from 'primevue/contextmenu'` (`primevue-4.5.5:apps/showcase/doc/contextmenu/ImportDoc.vue`); tag `<ContextMenu>`.
- Source `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.vue`, recursive internal `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenuSub.vue`, props `primevue-4.5.5:packages/primevue/src/contextmenu/BaseContextMenu.vue`, types `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.d.ts`, style `primevue-4.5.5:packages/primevue/src/contextmenu/style/ContextMenuStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { ContextMenu } from 'primereact/contextmenu'` (`primereact-10.9.9:components/doc/contextmenu/importdoc.js`).
- Source `primereact-10.9.9:components/lib/contextmenu/ContextMenu.js` (`React.memo(React.forwardRef(...))`), recursive `primereact-10.9.9:components/lib/contextmenu/ContextMenuSub.js`, defaults/CSS `primereact-10.9.9:components/lib/contextmenu/ContextMenuBase.js`, types `primereact-10.9.9:components/lib/contextmenu/contextmenu.d.ts`.

## 4. Anatomy

| Part         | PrimeNG / PrimeVue section        | PrimeReact section | Content                                     |
| ------------ | --------------------------------- | ------------------ | ------------------------------------------- |
| Root         | `root`                            | `root`             | Absolutely positioned overlay container     |
| Root list    | `rootList`                        | `menu`             | Top-level `<ul>`                            |
| Item         | `item`                            | `menuitem`         | `<li role="menuitem">`                      |
| Item content | `itemContent`                     | N/A (class only)   | Clickable wrapper                           |
| Item link    | `itemLink`                        | `action`           | `<a>`                                       |
| Item icon    | `itemIcon`                        | `icon`             | `item.icon`                                 |
| Item label   | `itemLabel`                       | `label`            | `item.label`                                |
| Submenu icon | `submenuIcon`                     | `submenuIcon`      | Angle-right indicator on items with `items` |
| Submenu      | `submenu`                         | `menu` (nested)    | Nested `<ul role="menu">`                   |
| Separator    | `separator`                       | `separator`        | `<li role="separator">`                     |
| Animation    | `motion` (NG) / `transition` (PV) | `transition`       | Show/hide animation of root and submenus    |

Sources: `primeng-21.1.9:packages/primeng/src/types/contextmenu/contextmenu.types.ts`, `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.d.ts`, `primereact-10.9.9:components/lib/contextmenu/contextmenu.d.ts`.

## 5. API highlights

| Prop                        | PrimeNG                                                         | PrimeVue                                                  | PrimeReact                                                                   |
| --------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `model`                     | `MenuItem[]`                                                    | `MenuItem[]`, `null`                                      | `MenuItem[]`, `null`                                                         |
| `global`                    | `boolean` (catalog default `false`)                             | `boolean`, `false`                                        | `boolean`, `false`                                                           |
| `target`                    | `HTMLElement \| string \| null`                                 | N/A — call `show(event)` from the target's handler        | N/A — call `show(event)` from the target's handler                           |
| `triggerEvent`              | `string`, `'contextmenu'`                                       | N/A                                                       | N/A                                                                          |
| `pressDelay`                | `number`, `500` (touch long-press, ms)                          | N/A                                                       | N/A                                                                          |
| `breakpoint`                | `string`, `'960px'`                                             | `string`, `'960px'`                                       | `string`, `undefined` (mobile mode off unless set)                           |
| `appendTo`                  | signal input; falls back to global `overlayAppendTo` (`'self'`) | `HintedString<'body' \| 'self'> \| HTMLElement`, `'body'` | `'self' \| HTMLElement \| () => HTMLElement`, `null` (body)                  |
| `autoZIndex` / `baseZIndex` | `true` / `0`                                                    | `true` / `0`                                              | `true` / `0`                                                                 |
| `tabindex` / `tabIndex`     | N/A on root (sub-list `tabindex` `0`)                           | `number \| string`, `0`                                   | `number`, `0`                                                                |
| ARIA                        | `ariaLabel`, `ariaLabelledBy`                                   | `ariaLabel`, `ariaLabelledby`                             | `ariaLabel`, `ariaLabelledBy` (`.d.ts`; source default key `ariaLabelledby`) |
| Animation                   | `motionOptions: MotionOptions`                                  | PT `transition`                                           | `transitionOptions: CSSTransitionProps`                                      |
| PrimeReact only             | —                                                               | —                                                         | `scrollHeight: string`, `'400px'`; `submenuIcon: IconType`                   |

- Events: PrimeNG `onShow`, `onHide` (`EventEmitter<null>`); PrimeVue emits `focus`, `blur`, `before-show`, `before-hide`, `show`, `hide`; PrimeReact `onShow(event)`, `onHide(event)`, plus `onFocus`/`onBlur` defaults in `ContextMenuBase.js`.
- Methods: PrimeNG `show(event)`, `hide()`, `toggle(event?)`; PrimeVue `show(event)`, `hide()`, `toggle(event)`; PrimeReact `show(event)`, `hide(event)`, `getElement()` (`primereact-10.9.9:components/lib/contextmenu/contextmenu.d.ts`). `show` positions the overlay at `event.pageX`/`pageY` and calls `preventDefault()` so the browser's native menu does not appear.
- Templates/slots: PrimeNG `item` (`ContextMenuItemTemplateContext` `{ $implicit: MenuItem }`), `submenuicon` (`ContextMenuSubmenuIconTemplateContext` `{ class: string }`). PrimeVue `item` (`{ item, label, hasSubmenu, props }`, `props` = `ContextMenuRouterBindProps` `{ action, icon, label, submenuicon }`), `itemicon` (`{ item, class }`), `submenuicon` (`{ active }`). PrimeReact: `MenuItem.template` and the `submenuIcon` prop.

## 6. Usage guidance

- **Basic:** PrimeNG attaches the menu to an element through `[target]` (a template reference) and listens for `triggerEvent` itself; PrimeVue and PrimeReact keep a ref to the menu and call `show(event)` from the target's own `contextmenu` handler (`primeng-21.1.9:apps/showcase/doc/contextmenu/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/BasicDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/basicdoc.js`).
- **Document:** `global` binds the menu to the whole document so a right click anywhere opens it (`primeng-21.1.9:apps/showcase/doc/contextmenu/document-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/DocumentDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/documentdoc.js`).
- **Command:** item `command` callbacks act on the row/record that was right-clicked; the demos remember the selected record in the handler and clear it on `hide` (PrimeNG demo uses `ToastModule`/`MessageService`) (`primeng-21.1.9:apps/showcase/doc/contextmenu/command-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/CommandDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/commanddoc.js`).
- **Template:** customise item content (badges, shortcut hints) via the `item` template/slot or PrimeReact `template` (`primeng-21.1.9:apps/showcase/doc/contextmenu/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/TemplateDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/templatedoc.js`).
- **Router:** PrimeNG `routerLink` on items; PrimeVue `router-link custom` inside the `item` slot; PrimeReact `command` with the app router or `url` (`primeng-21.1.9:apps/showcase/doc/contextmenu/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/RouterDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/routerdoc.js`).
- **Table / DataTable:** all three point to the table component's built-in context-menu integration (PrimeNG Table `contextMenu`, `contextMenuSelection`, `contextMenuSelectionMode` inputs and the `pContextMenuRow` directive; PrimeVue DataTable `contextMenu`/`contextMenuSelection` props; PrimeReact DataTable `onContextMenu`/`contextMenuSelection`) (`primeng-21.1.9:apps/showcase/doc/contextmenu/table-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/DataTableDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/datatabledoc.js`, `primeng-21.1.9:packages/primeng/src/table/table.ts`, `primevue-4.5.5:packages/primevue/src/datatable/BaseDataTable.vue`, `primereact-10.9.9:components/lib/datatable/DataTableBase.js`).
- **Styling (PrimeReact):** class reference (`primereact-10.9.9:components/doc/contextmenu/styledoc.js`).
- PrimeNG on touch devices (`isIOS()`/`isAndroid()`) replaces the trigger event with a `touchstart` long press of `pressDelay` ms (`primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`).

## 7. Accessibility

- Docs: the root list uses `role="menubar"` with `aria-orientation="vertical"`, labelled through `aria-label`/`aria-labelledby`; submenus are `role="menu"` labelled by their parent item; items are `menuitem` with `aria-label`, `aria-disabled`, and group items add `aria-haspopup`, `aria-expanded` (`primeng-21.1.9:apps/showcase/doc/contextmenu/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/contextmenu/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/contextmenu/accessibilitydoc.js`).
- Source: PrimeVue and PrimeReact render the root list as `menubar` as documented; PrimeNG's `ContextMenuSub` hardcodes `role="menu"` for the root list too — a mismatch with its own docs (`primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`, `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.vue`, `primereact-10.9.9:components/lib/contextmenu/ContextMenu.js`).
- Items in all three set `aria-level`, `aria-setsize`, `aria-posinset`; `aria-haspopup="menu"` only for groups without a `to`/`url`; the list tracks focus with `aria-activedescendant` (`primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenuSub.vue`, `primereact-10.9.9:components/lib/contextmenu/ContextMenuSub.js`).
- Keyboard (handled keys identical in all three): Up/Down move within a level; Right opens/enters a submenu; Left closes it; Home/End jump to first/last; Enter/Space open a group or activate an item and close the menu; Escape closes the menu; Tab leaves and closes; printable characters search by label prefix.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-contextmenu` (+ `p-component`, `p-contextmenu-mobile`), `p-contextmenu-root-list`, `p-contextmenu-item` (+ `p-contextmenu-item-active`, `p-focus`, `p-disabled`), `p-contextmenu-item-content`, `p-contextmenu-item-link`, `p-contextmenu-item-icon`, `p-contextmenu-item-label`, `p-contextmenu-submenu-icon`, `p-contextmenu-submenu`, `p-contextmenu-separator` (`primeng-21.1.9:packages/primeng/src/contextmenu/style/contextmenustyle.ts`, `primevue-4.5.5:packages/primevue/src/contextmenu/style/ContextMenuStyle.js`).
- Difference: PrimeVue applies `p-contextmenu-mobile` to the root; PrimeNG's class map applies it to each item instead.
- PT keys: see Anatomy; PrimeNG has no global PT key for ContextMenu in `PrimeNGConfigType.pt` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`). PrimeVue PT method options carry `ContextMenuContext` `{ item, index, active, focused, disabled }`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/contextmenu/index.mjs`.
- Design tokens: `ContextMenuDesignTokens` groups `root`, `list`, `item`, `submenu` (`mobileIndent`), `submenuIcon`, `separator` (`@primeuix/themes-2.0.3:types/contextmenu/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/contextmenu/index.mjs`.
- PrimeReact: own CSS in `ContextMenuBase.js` plus a generated `@media` block (`max-height: scrollHeight`) when `breakpoint` is set; classes `p-contextmenu p-component` (+ `p-input-filled`, `p-ripple-disabled`), `p-contextmenu-root-list`, `p-submenu-list`, `p-menuitem` (+ `p-menuitem-active p-highlight`, `p-focus`, `p-disabled`), `p-menuitem-content`, `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-submenu-icon`, `p-menuitem-separator`; transitions `p-contextmenu`, `p-contextmenusub` (`primereact-10.9.9:components/lib/contextmenu/ContextMenuBase.js`). Tokens N/A.

## 9. Relationships

- Embeds: AngleRight icon, Ripple; PrimeNG also Badge and Tooltip (item `badge`/`tooltip` fields).
- Embedded by / integrates with: Table/DataTable (all three), TreeTable (PrimeNG, PrimeVue, PrimeReact) and Tree (PrimeNG, PrimeReact) expose a `contextMenu` binding (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`, `primevue-4.5.5:packages/primevue/src/treetable/BaseTreeTable.vue`, `primereact-10.9.9:components/lib/tree/TreeBase.js`, `primereact-10.9.9:components/lib/treetable/TreeTableBase.js`).
- Related: [TieredMenu](tieredmenu.md) (same cascading structure, anchored to a trigger), [Menu](menu.md) (popup without nesting).

## 10. Dependencies

- PrimeNG: `@angular/router`, `@primeuix/motion`, `@primeuix/utils`, `primeng/api` (`MenuItem`, `OverlayService`, `PrimeTemplate`, `SharedModule`), `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`AngleRightIcon`), `primeng/motion`, `primeng/ripple`, `primeng/tooltip`, `primeng/utils` (`ZIndexUtils`) (`primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`).
- PrimeVue: `@primeuix/utils` (`dom`, `object`, `zindex`), `@primevue/core/basecomponent`, `@primevue/icons/angleright`, `primevue/portal`, `primevue/ripple` (`primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.vue`, `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenuSub.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useEventListener`, `useMatchMedia`, `useResizeListener`), `../portal/Portal`, `../icons/angleright`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/contextmenu/ContextMenu.js`, `primereact-10.9.9:components/lib/contextmenu/ContextMenuSub.js`); npm `react-transition-group` via CSSTransition.

## 11. Framework differences

| Aspect                | PrimeNG                             | PrimeVue                     | PrimeReact                   |
| --------------------- | ----------------------------------- | ---------------------------- | ---------------------------- |
| Attaching to a target | `target` + `triggerEvent` inputs    | Caller invokes `show(event)` | Caller invokes `show(event)` |
| Touch long press      | `pressDelay` (`500` ms)             | N/A                          | N/A                          |
| Root list role        | `menu` (docs say `menubar`)         | `menubar`                    | `menubar`                    |
| Mobile mode default   | on below `'960px'`                  | on below `'960px'`           | off unless `breakpoint` set  |
| Default `appendTo`    | global `overlayAppendTo` (`'self'`) | `'body'`                     | `document.body`              |
| Submenu icon          | `#submenuicon` template             | `submenuicon` slot           | `submenuIcon` prop           |
| Class naming          | `p-contextmenu-*`                   | `p-contextmenu-*`            | `p-menuitem*`, `p-submenu-*` |
| Design tokens         | `@primeuix/themes`                  | `@primeuix/themes`           | N/A                          |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/contextmenu/contextmenu.ts`
- `primeng-21.1.9:packages/primeng/src/contextmenu/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/contextmenu/style/contextmenustyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/contextmenu/contextmenu.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:packages/primeng/src/table/table.ts`
- `primeng-21.1.9:packages/primeng/src/tree/tree.ts`
- `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/document-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/command-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/table-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/contextmenu/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.vue`
- `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenuSub.vue`
- `primevue-4.5.5:packages/primevue/src/contextmenu/BaseContextMenu.vue`
- `primevue-4.5.5:packages/primevue/src/contextmenu/ContextMenu.d.ts`
- `primevue-4.5.5:packages/primevue/src/contextmenu/style/ContextMenuStyle.js`
- `primevue-4.5.5:packages/primevue/src/datatable/BaseDataTable.vue`
- `primevue-4.5.5:packages/primevue/src/treetable/BaseTreeTable.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/DocumentDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/CommandDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/DataTableDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/contextmenu/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/contextmenu/ContextMenu.js`
- `primereact-10.9.9:components/lib/contextmenu/ContextMenuSub.js`
- `primereact-10.9.9:components/lib/contextmenu/ContextMenuBase.js`
- `primereact-10.9.9:components/lib/contextmenu/contextmenu.d.ts`
- `primereact-10.9.9:components/lib/datatable/DataTableBase.js`
- `primereact-10.9.9:components/lib/tree/TreeBase.js`
- `primereact-10.9.9:components/lib/treetable/TreeTableBase.js`
- `primereact-10.9.9:components/doc/contextmenu/importdoc.js`
- `primereact-10.9.9:components/doc/contextmenu/basicdoc.js`
- `primereact-10.9.9:components/doc/contextmenu/documentdoc.js`
- `primereact-10.9.9:components/doc/contextmenu/commanddoc.js`
- `primereact-10.9.9:components/doc/contextmenu/templatedoc.js`
- `primereact-10.9.9:components/doc/contextmenu/routerdoc.js`
- `primereact-10.9.9:components/doc/contextmenu/datatabledoc.js`
- `primereact-10.9.9:components/doc/contextmenu/styledoc.js`
- `primereact-10.9.9:components/doc/contextmenu/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/contextmenu/index.mjs`
- `@primeuix/themes-2.0.3:types/contextmenu/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/contextmenu/index.mjs`
