# TieredMenu

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

TieredMenu is a vertical menu whose items can open nested submenus to the side, to any depth (cascading flyouts). It renders inline or, with `popup`, as an overlay anchored to a trigger. Below a `breakpoint` width it switches to a mobile mode in which submenus stack inside the list instead of flying out (`primeng-21.1.9:packages/primeng/src/tieredmenu/tieredmenu.ts`, `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.vue`, `primereact-10.9.9:components/lib/tieredmenu/TieredMenu.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model); `items` nests recursively.

## 2. Names & status

- Canonical name: **TieredMenu** in all three; no alias; not deprecated.
- Showcase menu: `TieredMenu` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `showTransitionOptions`/`hideTransitionOptions` (`@deprecated since v21.0.0`, use `motionOptions`) and `styleClass` (`@deprecated since v20.0.0`) (`primeng-21.1.9:packages/primeng/src/tieredmenu/tieredmenu.ts`). None in PrimeVue or PrimeReact.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { TieredMenuModule } from 'primeng/tieredmenu'` or standalone `TieredMenu` (`primeng-21.1.9:apps/showcase/doc/tieredmenu/import-doc.ts`).
- Selectors `p-tieredMenu`, `p-tieredmenu`, `p-tiered-menu`; class `TieredMenu extends BaseComponent<TieredMenuPassThrough>`, providers `TieredMenuStyle`, `TIEREDMENU_INSTANCE`, `PARENT_INSTANCE`, host directive `Bind`.
- Internal recursive sub-component `TieredMenuSub` (selectors `p-tieredMenuSub`, `p-tieredmenusub`), also exported (`primeng-21.1.9:packages/primeng/src/tieredmenu/public_api.ts`).
- Style `primeng-21.1.9:packages/primeng/src/tieredmenu/style/tieredmenustyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/tieredmenu/tieredmenu.types.ts`.

**PrimeVue 4.5.5**

- Import: `import TieredMenu from 'primevue/tieredmenu'` (`primevue-4.5.5:apps/showcase/doc/tieredmenu/ImportDoc.vue`); tag `<TieredMenu>`.
- Source `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.vue`, recursive internal `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenuSub.vue`, props `primevue-4.5.5:packages/primevue/src/tieredmenu/BaseTieredMenu.vue`, types `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.d.ts`, style `primevue-4.5.5:packages/primevue/src/tieredmenu/style/TieredMenuStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { TieredMenu } from 'primereact/tieredmenu'` (`primereact-10.9.9:components/doc/tieredmenu/importdoc.js`).
- Source `primereact-10.9.9:components/lib/tieredmenu/TieredMenu.js`, recursive `primereact-10.9.9:components/lib/tieredmenu/TieredMenuSub.js`, defaults/CSS `primereact-10.9.9:components/lib/tieredmenu/TieredMenuBase.js`, types `primereact-10.9.9:components/lib/tieredmenu/tieredmenu.d.ts`.

## 4. Anatomy

| Part         | PrimeNG / PrimeVue section                   | PrimeReact section | Content                                       |
| ------------ | -------------------------------------------- | ------------------ | --------------------------------------------- |
| Root         | `root`                                       | `root`             | Container (overlay class in popup mode)       |
| Start / end  | PrimeVue `start`, `end` slots (classes only) | N/A                | Content before/after the list (PrimeVue only) |
| Root list    | `rootList`                                   | `menu`             | Top-level `<ul>`                              |
| Item         | `item`                                       | `menuitem`         | `<li role="menuitem">`                        |
| Item content | `itemContent`                                | `content`          | Clickable wrapper                             |
| Item link    | `itemLink`                                   | `action`           | `<a>`                                         |
| Item icon    | `itemIcon`                                   | `icon`             | `item.icon`                                   |
| Item label   | `itemLabel`                                  | `label`            | `item.label`                                  |
| Submenu icon | `submenuIcon`                                | `submenuIcon`      | Angle-right indicator on group items          |
| Submenu      | `submenu`                                    | `submenu`          | Nested `<ul role="menu">`                     |
| Separator    | `separator`                                  | `separator`        | `<li role="separator">`                       |
| Animation    | `motion` (NG) / `transition` (PV)            | `transition`       | Popup animation                               |

Sources: `primeng-21.1.9:packages/primeng/src/types/tieredmenu/tieredmenu.types.ts`, `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.d.ts`, `primereact-10.9.9:components/lib/tieredmenu/tieredmenu.d.ts`. PrimeVue renders `start`/`end` with `ptm('start')`/`ptm('end')`, but the PT options type declares no `start`/`end` keys.

## 5. API highlights

| Prop                        | PrimeNG                                                                       | PrimeVue                      | PrimeReact                                                                     |
| --------------------------- | ----------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `model`                     | `MenuItem[]`                                                                  | `MenuItem[]`, `null`          | `MenuItem[]`, `null`                                                           |
| `popup`                     | `boolean`                                                                     | `boolean`, `false`            | `boolean`, `false`                                                             |
| `appendTo`                  | signal input, default `undefined`                                             | `string \| object`, `'body'`  | `null` (document body), `'self'`, element                                      |
| `breakpoint`                | `string`, `'960px'`                                                           | `string`, `'960px'`           | `string`, `undefined` (mobile mode off unless set)                             |
| `autoZIndex` / `baseZIndex` | `true` / `0`                                                                  | `true` / `0`                  | `true` / `0`                                                                   |
| `autoDisplay`               | `boolean`, `true` (open submenus on hover after first activation)             | N/A                           | N/A                                                                            |
| `disabled`                  | `boolean`, `false`                                                            | `boolean`, `false`            | N/A                                                                            |
| `tabindex`                  | `number`, `0`                                                                 | `number`, `0`                 | N/A                                                                            |
| ARIA                        | `ariaLabel`, `ariaLabelledBy`                                                 | `ariaLabel`, `ariaLabelledby` | `aria-*` through root props                                                    |
| Animation                   | `motionOptions`; deprecated `showTransitionOptions` / `hideTransitionOptions` | PT `transition`               | `transitionOptions: CSSTransitionProps`                                        |
| PrimeReact only             | —                                                                             | —                             | `scrollHeight: string`, `'400px'` (mobile max height), `submenuIcon: IconType` |

- Events: PrimeNG `onShow`, `onHide`; PrimeVue emits `focus`, `blur`, `before-show`, `before-hide`, `show`, `hide`; PrimeReact `onShow`, `onHide`, `onFocus`, `onBlur`.
- Methods: PrimeNG `toggle(event)`, `show(event, isFocus?)`, `hide(event?, isFocus?)`; PrimeVue `toggle(event)`, `show(event)`, `hide()`; PrimeReact `toggle(event)`, `show(event)`, `hide(event)`, `getElement()` (imperative handle; the `.d.ts` declares only `toggle` and `getElement`) (`primereact-10.9.9:components/lib/tieredmenu/TieredMenu.js`).
- Templates/slots: PrimeNG `item` (`TieredMenuItemTemplateContext` `{ $implicit: MenuItem, hasSubmenu }`), `submenuicon`. PrimeVue `start`, `end`, `item` (`{ item, label, props, hasSubmenu }`), `itemicon` (`{ item, class }`), `submenuicon` (`{ active }`). PrimeReact: `MenuItem.template`, `submenuIcon` prop.

## 6. Usage guidance

- **Basic:** bind a nested model; groups open to the side on click, then on hover (`primeng-21.1.9:apps/showcase/doc/tieredmenu/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tieredmenu/BasicDoc.vue`, `primereact-10.9.9:components/doc/tieredmenu/basicdoc.js`).
- **Popup:** set `popup` and call `toggle(event)` from a button; give the trigger `aria-haspopup`/`aria-controls` (`primeng-21.1.9:apps/showcase/doc/tieredmenu/popup-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tieredmenu/PopupDoc.vue`, `primereact-10.9.9:components/doc/tieredmenu/popupdoc.js`).
- **Template:** customise items (badges, shortcut hints, submenu indicator) with the item template/slot or PrimeReact `template` (`primeng-21.1.9:apps/showcase/doc/tieredmenu/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tieredmenu/TemplateDoc.vue`, `primereact-10.9.9:components/doc/tieredmenu/templatedoc.js`).
- **Command:** run callbacks from item `command` (demo shows a Toast) (`primeng-21.1.9:apps/showcase/doc/tieredmenu/command-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tieredmenu/CommandDoc.vue`, `primereact-10.9.9:components/doc/tieredmenu/commanddoc.js`).
- **Router:** PrimeNG `routerLink` on items; PrimeVue `router-link custom` inside the item slot; PrimeReact `command` with `router.push` or `url` (`primeng-21.1.9:apps/showcase/doc/tieredmenu/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tieredmenu/RouterDoc.vue`, `primereact-10.9.9:components/doc/tieredmenu/routerdoc.js`).
- **Styling (PrimeReact):** class reference (`primereact-10.9.9:components/doc/tieredmenu/styledoc.js`).

## 7. Accessibility

- Docs: the root list uses `role="menubar"` with `aria-orientation="vertical"`; submenus use `role="menu"` labelled by their parent item; items are `menuitem` with `aria-label`, `aria-disabled`, and group items add `aria-haspopup` and `aria-expanded` (`primevue-4.5.5:apps/showcase/doc/tieredmenu/AccessibilityDoc.vue`, `primeng-21.1.9:apps/showcase/doc/tieredmenu/accessibility-doc.ts`, `primereact-10.9.9:components/doc/tieredmenu/accessibilitydoc.js`).
- Source: PrimeVue and PrimeReact match the docs (root `menubar`, nested `menu`; PrimeVue also sets `aria-level`, `aria-setsize`, `aria-posinset`) (`primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.vue`, `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenuSub.vue`, `primereact-10.9.9:components/lib/tieredmenu/TieredMenuSub.js`). PrimeNG renders every list, including the root, with `role="menu"` — a mismatch with its own docs (`primeng-21.1.9:packages/primeng/src/tieredmenu/tieredmenu.ts`).
- Group items get `aria-haspopup="menu"` only when they have no `to`/`url` target.
- Keyboard (all three): Up/Down move within a level; Right opens a submenu or enters it; Left closes it or returns to the parent; Home/End go to first/last; Enter/Space open a group or activate an item and close overlays; Escape closes the current popup submenu; Alt+Up closes the popup and refocuses the target; Tab leaves; printable characters jump to the item whose label starts with the typed text.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-tieredmenu` (+ `p-component`, `p-tieredmenu-overlay`, `p-tieredmenu-mobile`), `p-tieredmenu-start`, `p-tieredmenu-root-list`, `p-tieredmenu-item` (+ `p-tieredmenu-item-active`, `p-focus`, `p-disabled`), `p-tieredmenu-item-content`, `p-tieredmenu-item-link`, `p-tieredmenu-item-icon`, `p-tieredmenu-item-label`, `p-tieredmenu-submenu-icon`, `p-tieredmenu-submenu`, `p-tieredmenu-separator`, `p-tieredmenu-end`; PrimeNG also adds `p-menuitem-badge` (`primeng-21.1.9:packages/primeng/src/tieredmenu/style/tieredmenustyle.ts`, `primevue-4.5.5:packages/primevue/src/tieredmenu/style/TieredMenuStyle.js`).
- Inline style: submenu `display: flex|none` driven by active state (PrimeVue `inlineStyles.submenu`).
- PT keys: see Anatomy; PrimeNG global PT key `tieredMenu` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/tieredmenu/index.mjs`.
- Design tokens: `TieredMenuDesignTokens` groups `root`, `list`, `item`, `submenu`, `submenuIcon`, `separator` (`@primeuix/themes-2.0.3:types/tieredmenu/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/tieredmenu/index.mjs`.
- PrimeReact: own CSS in `TieredMenuBase.js` (plus a generated `@media (max-width: breakpoint)` block with `max-height: scrollHeight`); classes `p-tieredmenu p-component` (+ `p-tieredmenu-overlay`, `p-input-filled`, `p-ripple-disabled`), `p-tieredmenu-root-list`, `p-submenu-list`, `p-menuitem` (+ `p-menuitem-active p-highlight`, `p-focus`, `p-disabled`), `p-menuitem-content`, `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-submenu-icon`, `p-menuitem-separator`, transition `p-connected-overlay` (`primereact-10.9.9:components/lib/tieredmenu/TieredMenuBase.js`, `primereact-10.9.9:components/lib/tieredmenu/TieredMenu.js`). Tokens N/A.

## 9. Relationships

- Embeds: AngleRight icon, Ripple; PrimeNG also Tooltip (item `tooltip` fields).
- Embedded by: SplitButton uses TieredMenu as its dropdown in PrimeNG and PrimeVue (Button category).
- Related: [Menu](menu.md) (single level), [ContextMenu](contextmenu.md) (same cascading pattern opened by right-click), [Menubar](menubar.md) (horizontal root with tiered submenus), [PanelMenu](panelmenu.md) (inline accordion). PrimeReact-only alternative: SlideMenu (sliding submenus).

## 10. Dependencies

- PrimeNG: `@angular/router` (`RouterModule`), `@primeuix/motion`, `@primeuix/utils` (positioning, `isPrintableCharacter`, `nestedPosition`), `primeng/api` (`MenuItem`, `OverlayService`, `PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `primeng/dom` (`ConnectedOverlayScrollHandler`), `primeng/icons` (`AngleRightIcon`), `primeng/motion`, `primeng/ripple`, `primeng/tooltip`, `primeng/utils` (`ZIndexUtils`) (`primeng-21.1.9:packages/primeng/src/tieredmenu/tieredmenu.ts`).
- PrimeVue: `@primeuix/utils` (`dom`, `object`, `zindex`), `@primevue/core/utils` (`ConnectedOverlayScrollHandler`), `@primevue/core/basecomponent`, `@primevue/icons/angleright`, `primevue/overlayeventbus`, `primevue/portal`, `primevue/ripple` (`primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.vue`, `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenuSub.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useMatchMedia`, listeners), `../overlayservice/OverlayService`, `../portal/Portal`, `../icons/angleright`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/tieredmenu/TieredMenu.js`, `primereact-10.9.9:components/lib/tieredmenu/TieredMenuSub.js`); npm `react-transition-group` via CSSTransition.

## 11. Framework differences

| Aspect              | PrimeNG                      | PrimeVue                  | PrimeReact                   |
| ------------------- | ---------------------------- | ------------------------- | ---------------------------- |
| Root list role      | `menu`                       | `menubar` (as documented) | `menubar` (as documented)    |
| Mobile mode default | on below `'960px'`           | on below `'960px'`        | off unless `breakpoint` set  |
| Hover auto-display  | `autoDisplay` input (`true`) | built in                  | built in                     |
| Start / end areas   | N/A                          | `start`, `end` slots      | N/A                          |
| `disabled` prop     | yes                          | yes                       | no                           |
| Submenu icon        | `#submenuicon` template      | `submenuicon` slot        | `submenuIcon` prop           |
| Class naming        | `p-tieredmenu-*`             | `p-tieredmenu-*`          | `p-menuitem*`, `p-submenu-*` |
| Design tokens       | `@primeuix/themes`           | `@primeuix/themes`        | N/A                          |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/tieredmenu/tieredmenu.ts`
- `primeng-21.1.9:packages/primeng/src/tieredmenu/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/tieredmenu/style/tieredmenustyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/tieredmenu/tieredmenu.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/popup-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/command-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/tieredmenu/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.vue`
- `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenuSub.vue`
- `primevue-4.5.5:packages/primevue/src/tieredmenu/BaseTieredMenu.vue`
- `primevue-4.5.5:packages/primevue/src/tieredmenu/TieredMenu.d.ts`
- `primevue-4.5.5:packages/primevue/src/tieredmenu/style/TieredMenuStyle.js`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/PopupDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/CommandDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/tieredmenu/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/tieredmenu/TieredMenu.js`
- `primereact-10.9.9:components/lib/tieredmenu/TieredMenuSub.js`
- `primereact-10.9.9:components/lib/tieredmenu/TieredMenuBase.js`
- `primereact-10.9.9:components/lib/tieredmenu/tieredmenu.d.ts`
- `primereact-10.9.9:components/doc/tieredmenu/importdoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/basicdoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/popupdoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/templatedoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/commanddoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/routerdoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/styledoc.js`
- `primereact-10.9.9:components/doc/tieredmenu/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/tieredmenu/index.mjs`
- `@primeuix/themes-2.0.3:types/tieredmenu/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/tieredmenu/index.mjs`
