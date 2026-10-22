# Menu

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Menu is a flat, vertical navigation or command list driven by a `MenuItem[]` model. Top-level items that carry `items` render as non-interactive group labels followed by their children; nesting stops at that one level. It renders inline by default, or as a popup overlay anchored to a trigger element when `popup` is set (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`, `primevue-4.5.5:packages/primevue/src/menu/Menu.vue`, `primereact-10.9.9:components/lib/menu/Menu.js`).

This record also documents the **shared MenuItem model** used by every Menu-category component (see [MenuItem model](#menuitem-model) below).

## 2. Names & status

- Canonical name: **Menu** in all three frameworks; no legacy alias; the component is not deprecated.
- Showcase menu: listed as `Menu` under **Menu** in all three menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members:
  - PrimeNG `showTransitionOptions` and `hideTransitionOptions` (`@deprecated since v21.0.0`, replaced by `motionOptions`), `styleClass` (`@deprecated since v20.0.0`, use `class`) (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`).
  - PrimeVue slot `submenuheader` (deprecated since v4.0, use `submenulabel`) (`primevue-4.5.5:packages/primevue/src/menu/Menu.d.ts`).
  - PrimeReact: none.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { MenuModule } from 'primeng/menu'` or the standalone `Menu` class (`primeng-21.1.9:apps/showcase/doc/menu/import-doc.ts`).
- Selector: `p-menu`; class `Menu extends BaseComponent<MenuPassThrough>`, providers `MenuStyle`, `MENU_INSTANCE`, `PARENT_INSTANCE`, host directive `Bind` (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`).
- Exports also the internal directive `MenuItemContent` (selector `[pMenuItemContent]`) and the `SafeHtmlPipe` used to render unescaped labels (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`, `primeng-21.1.9:packages/primeng/src/menu/public_api.ts`).
- Style: `primeng-21.1.9:packages/primeng/src/menu/style/menustyle.ts`; types: `primeng-21.1.9:packages/primeng/src/types/menu/menu.types.ts`; model type `MenuItem` from `primeng/api` (`primeng-21.1.9:packages/primeng/src/api/menuitem.ts`).

**PrimeVue 4.5.5**

- Import: `import Menu from 'primevue/menu'` (`primevue-4.5.5:apps/showcase/doc/menu/ImportDoc.vue`); tag `<Menu>`.
- Source: `primevue-4.5.5:packages/primevue/src/menu/Menu.vue`, props in `primevue-4.5.5:packages/primevue/src/menu/BaseMenu.vue`, one internal row component `primevue-4.5.5:packages/primevue/src/menu/Menuitem.vue` (not exported separately), types `primevue-4.5.5:packages/primevue/src/menu/Menu.d.ts`, style `primevue-4.5.5:packages/primevue/src/menu/style/MenuStyle.js`.
- Package entry: `primevue-4.5.5:packages/primevue/src/menu/package.json`; model type from `primevue/menuitem` (`primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`).

**PrimeReact 10.9.9**

- Import: `import { Menu } from 'primereact/menu'` (`primereact-10.9.9:components/doc/menu/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/menu/Menu.js` (`React.memo(React.forwardRef(...))`), defaults and CSS in `primereact-10.9.9:components/lib/menu/MenuBase.js`, types `primereact-10.9.9:components/lib/menu/menu.d.ts`; model type from `primereact/menuitem` (`primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`).

## 4. Anatomy

| Part         | PrimeNG / PrimeVue section       | PrimeReact section | Content                                                   |
| ------------ | -------------------------------- | ------------------ | --------------------------------------------------------- |
| Root         | `root`                           | `root`             | Container; overlay class in popup mode.                   |
| Start        | `start`                          | N/A                | Optional content before the list (template/slot).         |
| List         | `list`                           | `menu`             | `<ul role="menu">`.                                       |
| Group label  | `submenuLabel`                   | `submenuHeader`    | `<li>` for a top-level item that has `items`.             |
| Separator    | `separator`                      | `separator`        | `<li role="separator">` for items with `separator: true`. |
| Item         | `item`                           | `menuitem`         | `<li role="menuitem">`.                                   |
| Item content | `itemContent`                    | `content`          | Wrapper that receives clicks.                             |
| Item link    | `itemLink`                       | `action`           | `<a>` (href from `url`/router).                           |
| Item icon    | `itemIcon`                       | `icon`             | Icon from `item.icon`.                                    |
| Item label   | `itemLabel`                      | `label`            | Text from `item.label`.                                   |
| End          | `end`                            | N/A                | Optional content after the list.                          |
| Animation    | `motion` (NG), `transition` (PV) | `transition`       | Popup show/hide animation options.                        |

Sources: `primeng-21.1.9:packages/primeng/src/types/menu/menu.types.ts`, `primevue-4.5.5:packages/primevue/src/menu/Menu.d.ts`, `primereact-10.9.9:components/lib/menu/menu.d.ts`.

## 5. API highlights

Props / inputs:

| Prop                    | PrimeNG                                                                                                                                  | PrimeVue                                                  | PrimeReact                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `model`                 | `MenuItem[]`                                                                                                                             | `MenuItem[]`, default `null`                              | `MenuItem[]`                                                             |
| `popup`                 | `boolean`, `false`                                                                                                                       | `boolean`, `false`                                        | `boolean`, `false`                                                       |
| `appendTo`              | signal input, catalog default `'self'`                                                                                                   | `HTMLElement \| HintedString<'body' \| 'self'>`, `'body'` | `'self' \| HTMLElement \| …`, `null` (body)                              |
| `autoZIndex`            | `boolean`, `true`                                                                                                                        | `boolean`, `true`                                         | `boolean`, `true`                                                        |
| `baseZIndex`            | `number`, `0`                                                                                                                            | `number`, `0`                                             | `number`, `0`                                                            |
| `tabindex` / `tabIndex` | `number`, `0`                                                                                                                            | `number`, `0`                                             | `number`, `0`                                                            |
| ARIA                    | `ariaLabel`, `ariaLabelledBy`                                                                                                            | `ariaLabel`, `ariaLabelledby`                             | `ariaLabel`, `ariaLabelledBy`                                            |
| Animation               | `motionOptions` (signal); deprecated `showTransitionOptions` `'.12s cubic-bezier(0, 0, 0.2, 1)'`, `hideTransitionOptions` `'.1s linear'` | via PT `transition`                                       | `transitionOptions` (`CSSTransitionProps`)                               |
| PrimeReact only         | —                                                                                                                                        | —                                                         | `popupAlignment: 'left' \| 'right'` (`'left'`), `closeOnEscape` (`true`) |

- Events: PrimeNG outputs `onShow`, `onHide`, `onFocus`, `onBlur`; PrimeVue emits `show`, `hide`, `focus`, `blur`; PrimeReact callbacks `onShow`, `onHide`, `onFocus`, `onBlur`.
- Methods: PrimeNG `toggle(event)`, `show(event)`, `hide()`; PrimeVue `toggle(event, target?)`, `show(event, target?)`, `hide()`; PrimeReact `toggle(event)`, `show(event)`, `hide(event)`, `getElement()`, `getTarget()`.
- Templates / slots: PrimeNG `start`, `end`, `item` (context `MenuItemTemplateContext` `{ $implicit: MenuItem }`), `submenuheader` (`MenuSubmenuHeaderTemplateContext`); the class also declares a `header` `@ContentChild` that the template never renders, so it has no effect (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`). PrimeVue slots `start`, `end`, `item` (`{ item, label, props }`, `props` = `MenuRouterBindProps` with `action`, `icon`, `label` attribute bags), `itemicon` (`{ item, class }`), `submenulabel` (`{ item }`), deprecated `submenuheader`. PrimeReact has no slots; per-item rendering uses `MenuItem.template`.

### MenuItem model

All Menu-category components (Breadcrumb, ContextMenu, Dock, Menu, Menubar, MegaMenu, PanelMenu, TieredMenu, Steps, TabMenu) consume this model. Each framework defines its own interface:

| Field                | PrimeNG `MenuItem`                                                                                                                                         | PrimeVue `MenuItem`                          | PrimeReact `MenuItem`                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| `label`              | `string`                                                                                                                                                   | `string \| ((...args) => string)`            | `string`                                                                  |
| `icon`               | `string`                                                                                                                                                   | `string`                                     | `IconType<MenuItem>`                                                      |
| `command`            | `(event: MenuItemCommandEvent) => void`                                                                                                                    | `(event: MenuItemCommandEvent) => void`      | `(event: MenuItemCommandEvent) => void`                                   |
| `url`                | `string`                                                                                                                                                   | `string`                                     | `string`                                                                  |
| `target`             | `string`                                                                                                                                                   | `string`                                     | `string`                                                                  |
| `items` (nesting)    | `MenuItem[]`                                                                                                                                               | `MenuItem[]`                                 | `MenuItem[] \| MenuItem[][]` (2-D for MegaMenu)                           |
| `disabled`           | `boolean`                                                                                                                                                  | `boolean \| ((...args) => boolean)`, `false` | `boolean`, `false`                                                        |
| `visible`            | `boolean`                                                                                                                                                  | `boolean \| ((...args) => boolean)`, `true`  | `boolean`, `true`                                                         |
| `separator`          | `boolean`                                                                                                                                                  | `boolean`, `false`                           | `boolean`, `false`                                                        |
| `expanded`           | `boolean`                                                                                                                                                  | N/A (component `expandedKeys` state)         | `boolean`, `false`                                                        |
| Styling              | `style`, `styleClass`, `iconClass`, `iconStyle`, `labelClass`, `labelStyle`, `linkClass`, `linkStyle`, `badgeStyleClass`                                   | `style`, `class`                             | `style`, `className`                                                      |
| Identity             | `id`, `automationId`, `title`, `tabindex` (`string`)                                                                                                       | `key`                                        | `id`, `data`                                                              |
| Router               | `routerLink`, `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, `skipLocationChange`, `replaceUrl`, `state`, `routerLinkActiveOptions` | N/A — use the `item` slot with `router-link` | N/A — use `command` with the app router                                   |
| Extras               | `escape` (render label as HTML when `false`), `badge`, `tooltip`, `tooltipPosition`, `tooltipOptions`                                                      | —                                            | `template` (`ReactNode \| (item, options: MenuItemOptions) => ReactNode`) |
| Open index signature | `[key: string]: any`                                                                                                                                       | `[key: string]: any`                         | none                                                                      |

- `MenuItemCommandEvent`: PrimeNG `{ originalEvent?: Event; item?: MenuItem | MegaMenuItem; index?: number }`; PrimeVue `{ originalEvent: Event; item: MenuItem; [key: string]: any }`; PrimeReact `{ originalEvent: React.SyntheticEvent; item: MenuItem }`.
- PrimeReact `MenuItemOptions` (passed to `template`): `onClick`, `className`, `labelClassName`, `iconClassName`, `element`, `props`.
- PrimeNG has a separate `MegaMenuItem` (`items?: MenuItem[][]`, `command?: (event?: any) => void`) in `primeng-21.1.9:packages/primeng/src/api/megamenuitem.ts`; PrimeVue and PrimeReact reuse `MenuItem` (see [MegaMenu](megamenu.md)).
- Behaviour shared by the components: `command` runs on activation before navigation; `url` renders an `href`; `visible: false` removes the item; `disabled` keeps it rendered but not activatable; `separator: true` renders a divider instead of an item. How deeply `items` nest depends on the component (Menu: one group level; TieredMenu/ContextMenu/Menubar/PanelMenu: unlimited; MegaMenu: columns).
- The PrimeNG JSDoc still says "not all may be utilized by the tabmenu component", although TabMenu is no longer shipped in PrimeNG 21 (`primeng-21.1.9:packages/primeng/src/api/menuitem.ts`; see [TabMenu](tabmenu.md)).

Sources: `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`, `primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`, `primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`.

## 6. Usage guidance

- **Basic:** bind an array of items to `model` to render an inline list (`primeng-21.1.9:apps/showcase/doc/menu/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/BasicDoc.vue`, `primereact-10.9.9:components/doc/menu/basicdoc.js`).
- **Group:** top-level items with `items` become labelled groups; children render beneath the label (`primeng-21.1.9:apps/showcase/doc/menu/group-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/GroupDoc.vue`, `primereact-10.9.9:components/doc/menu/groupdoc.js`).
- **Popup:** set `popup` and call `toggle(event)` from a trigger button; the trigger should carry `aria-haspopup` and `aria-controls` pointing to the menu id. PrimeReact adds `popupAlignment="right"` to align the overlay to the trigger's right edge (`primeng-21.1.9:apps/showcase/doc/menu/popup-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/PopupDoc.vue`, `primereact-10.9.9:components/doc/menu/popupdoc.js`).
- **Template:** customise item markup (badges, shortcuts) and add start/end content. PrimeNG uses `#start`, `#end`, `#item`, `#submenuheader`; PrimeVue uses `start`, `end`, `item`, `submenulabel` slots; PrimeReact puts a `template` on each item (`primeng-21.1.9:apps/showcase/doc/menu/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/TemplateDoc.vue`, `primereact-10.9.9:components/doc/menu/templatedoc.js`).
- **Command:** attach a `command` callback to an item to run an action (the demos show a Toast, so they import `MessageService`/`ToastModule` in PrimeNG) (`primeng-21.1.9:apps/showcase/doc/menu/command-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/CommandDoc.vue`, `primereact-10.9.9:components/doc/menu/commanddoc.js`).
- **Router:** PrimeNG binds `routerLink` on the item; PrimeVue wraps the item slot content in `<router-link v-slot="{ href, navigate }" custom>`; PrimeReact calls `router.push(...)` from `command` or uses `url` for external links (`primeng-21.1.9:apps/showcase/doc/menu/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/RouterDoc.vue`, `primereact-10.9.9:components/doc/menu/routerdoc.js`).
- **Styling (PrimeReact):** separate doc section on class names (`primereact-10.9.9:components/doc/menu/styledoc.js`).
- No service is required for the component itself; PrimeNG popup mode uses the root-provided `OverlayService` internally.

## 7. Accessibility

- The list uses `role="menu"`, labelled by `aria-label` or `aria-labelledby` props; it tracks focus with `aria-activedescendant`. Items have `role="menuitem"`, `aria-label` from the item label and `aria-disabled` when disabled; group labels have `role="none"`, separators `role="separator"` (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`, `primevue-4.5.5:packages/primevue/src/menu/Menu.vue`, `primereact-10.9.9:components/lib/menu/Menu.js`).
- The accessibility docs say that in popup mode the component manages `aria-expanded`, `aria-haspopup` and `aria-controls` on the target; the source of all three does not set them — the popup demos set `aria-haspopup`/`aria-controls` on the trigger themselves (`primevue-4.5.5:apps/showcase/doc/menu/AccessibilityDoc.vue`, `primevue-4.5.5:apps/showcase/doc/menu/PopupDoc.vue`, `primereact-10.9.9:components/doc/menu/popupdoc.js`).
- Keyboard (handled keys identical in all three: `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, `NumpadEnter`, `Space`, `Escape`, `Tab`): arrows move between items, Home/End jump to first/last, Enter/Space activate (and close a popup, returning focus to the target), Escape closes a popup, Tab leaves the menu (`primeng-21.1.9:apps/showcase/doc/menu/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menu/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/menu/accessibilitydoc.js`).
- `Alt+ArrowUp` in popup mode closes the popup and returns focus to the target (`event.altKey` branch of the ArrowUp handler in all three sources).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-menu` (+ `p-component`, `p-menu-overlay` in popup mode), `p-menu-start`, `p-menu-list`, `p-menu-submenu-label`, `p-menu-separator`, `p-menu-end`, `p-menu-item` (+ `p-focus`, `p-disabled`), `p-menu-item-content`, `p-menu-item-link`, `p-menu-item-icon`, `p-menu-item-label` (`primeng-21.1.9:packages/primeng/src/menu/style/menustyle.ts`, `primevue-4.5.5:packages/primevue/src/menu/style/MenuStyle.js`).
- Mismatch: both `MenuClasses` enums (and therefore the catalog) list `p-menu-submenu-item` for the group label, while the class map actually applies `p-menu-submenu-label`.
- PT keys: see Anatomy; PrimeNG global PT key `menu` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`). PrimeVue PT method options carry `MenuContext` `{ item, index, focused, disabled }`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/menu/index.mjs` (PrimeNG and PrimeVue).
- Design tokens: `MenuDesignTokens` groups `root`, `list`, `item`, `submenuLabel`, `separator` (`@primeuix/themes-2.0.3:types/menu/index.d.ts`); Aura values `@primeuix/themes-2.0.3:dist/aura/menu/index.mjs`.
- PrimeReact: own CSS in `MenuBase.css.styles`; classes `p-menu p-component` (+ `p-menu-overlay`, `p-input-filled`, `p-ripple-disabled`), `p-menu-list p-reset`, `p-menuitem`, `p-menuitem-content`, `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-submenu-header`, `p-menu-separator`, transition `p-connected-overlay` (`primereact-10.9.9:components/lib/menu/MenuBase.js`). Tokens N/A.
- PrimeNG z-index layer for menus: `zIndex.menu = 1000` (`primeng-21.1.9:packages/primeng/src/config/primeng.ts`).

## 9. Relationships

- Embeds: Ripple on items (all three); PrimeNG also imports Badge and Tooltip modules for `badge`/`tooltip` fields.
- Popup variant behaves like an overlay; for nested submenus use [TieredMenu](tieredmenu.md); for right-click use [ContextMenu](contextmenu.md); for horizontal bars use [Menubar](menubar.md) or [MegaMenu](megamenu.md); for accordion-style navigation use [PanelMenu](panelmenu.md).
- The MenuItem model defined here is shared by [Breadcrumb](breadcrumb.md), [ContextMenu](contextmenu.md), [Dock](dock.md), [Menubar](menubar.md), [MegaMenu](megamenu.md), [PanelMenu](panelmenu.md), [TieredMenu](tieredmenu.md), [Steps](steps.md) and [TabMenu](tabmenu.md).
- Often used as the popup of a SplitButton-like trigger (a Button that calls `toggle`).

## 10. Dependencies

- PrimeNG: `@primeuix/motion`, `@primeuix/utils`, `primeng/api` (`MenuItem`, `OverlayService`, `PrimeTemplate`, `SharedModule`), `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/dom` (`ConnectedOverlayScrollHandler`), `primeng/motion`, `primeng/ripple`, `primeng/tooltip`, `primeng/utils` (`ZIndexUtils`), `@angular/router` (`RouterModule`), `@angular/platform-browser` (`DomSanitizer`) (`primeng-21.1.9:packages/primeng/src/menu/menu.ts`).
- PrimeVue: `@primeuix/utils` (`cn`, `dom`, `zindex`, `object`), `@primevue/core/basecomponent`, `@primevue/core/utils` (`ConnectedOverlayScrollHandler`), `primevue/overlayeventbus`, `primevue/portal`, `primevue/ripple` (`primevue-4.5.5:packages/primevue/src/menu/Menu.vue`, `primevue-4.5.5:packages/primevue/src/menu/Menuitem.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useGlobalOnEscapeKey`, overlay listeners), `../overlayservice/OverlayService`, `../portal/Portal`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/menu/Menu.js`); npm `react-transition-group` via CSSTransition.
- No external npm packages beyond the framework.

## 11. Framework differences

| Aspect             | PrimeNG                                | PrimeVue                                 | PrimeReact                            |
| ------------------ | -------------------------------------- | ---------------------------------------- | ------------------------------------- |
| Default `appendTo` | `'self'`                               | `'body'`                                 | `document.body`                       |
| Router integration | `routerLink` and friends on `MenuItem` | `item` slot + `router-link custom`       | `command` + app router                |
| Item customisation | `#item` template                       | `item`, `itemicon` slots                 | `MenuItem.template`                   |
| Start / end areas  | `#start`, `#end`                       | `start`, `end` slots                     | N/A                                   |
| Popup alignment    | Absolute under target                  | Absolute under target                    | `popupAlignment` `'left'`/`'right'`   |
| Animation          | `motionOptions` (`@primeuix/motion`)   | `<transition name="p-anchored-overlay">` | `CSSTransition` `p-connected-overlay` |
| Class naming       | `p-menu-item*`                         | `p-menu-item*`                           | `p-menuitem*`, `p-submenu-header`     |
| Design tokens      | `@primeuix/themes`                     | `@primeuix/themes`                       | N/A                                   |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/menu/menu.ts`
- `primeng-21.1.9:packages/primeng/src/menu/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/menu/style/menustyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/menu/menu.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`
- `primeng-21.1.9:packages/primeng/src/api/megamenuitem.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/group-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/popup-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/command-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menu/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/menu/Menu.vue`
- `primevue-4.5.5:packages/primevue/src/menu/BaseMenu.vue`
- `primevue-4.5.5:packages/primevue/src/menu/Menuitem.vue`
- `primevue-4.5.5:packages/primevue/src/menu/Menu.d.ts`
- `primevue-4.5.5:packages/primevue/src/menu/style/MenuStyle.js`
- `primevue-4.5.5:packages/primevue/src/menu/package.json`
- `primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`
- `primevue-4.5.5:apps/showcase/doc/menu/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/GroupDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/PopupDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/CommandDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menu/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/menu/Menu.js`
- `primereact-10.9.9:components/lib/menu/MenuBase.js`
- `primereact-10.9.9:components/lib/menu/menu.d.ts`
- `primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`
- `primereact-10.9.9:components/doc/menu/importdoc.js`
- `primereact-10.9.9:components/doc/menu/basicdoc.js`
- `primereact-10.9.9:components/doc/menu/groupdoc.js`
- `primereact-10.9.9:components/doc/menu/popupdoc.js`
- `primereact-10.9.9:components/doc/menu/templatedoc.js`
- `primereact-10.9.9:components/doc/menu/commanddoc.js`
- `primereact-10.9.9:components/doc/menu/routerdoc.js`
- `primereact-10.9.9:components/doc/menu/styledoc.js`
- `primereact-10.9.9:components/doc/menu/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/menu/index.mjs`
- `@primeuix/themes-2.0.3:types/menu/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/menu/index.mjs`
