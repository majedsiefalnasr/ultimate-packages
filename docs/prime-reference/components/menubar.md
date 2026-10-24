# Menubar

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Menubar is a horizontal application menu bar: root items sit in a row, items with children open dropdown submenus, and deeper levels cascade sideways. It has `start` and `end` regions for content such as a logo or a search box. Below a responsive breakpoint the row collapses behind a hamburger button that toggles a vertical, inline-expanding list (`primeng-21.1.9:packages/primeng/src/menubar/menubar.ts`, `primevue-4.5.5:packages/primevue/src/menubar/Menubar.vue`, `primereact-10.9.9:components/lib/menubar/Menubar.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model); `items` nests recursively.

## 2. Names & status

- Canonical name: **Menubar** in all three frameworks (lower-case "b"); PrimeNG's style class is spelled `MenuBarStyle`. Not deprecated.
- Showcase menu: `Menubar` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `styleClass` (`@deprecated` since v20.0.0, use `class`); PrimeVue slots `menubutton` (use `button`) and `menubuttonicon` (use `buttonicon`), both deprecated since v4.0 (`primeng-21.1.9:packages/primeng/src/menubar/menubar.ts`, `primevue-4.5.5:packages/primevue/src/menubar/Menubar.d.ts`).

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { MenubarModule } from 'primeng/menubar'` or the standalone `Menubar` class (`primeng-21.1.9:apps/showcase/doc/menubar/import-doc.ts`).
- Selector `p-menubar`; class `Menubar extends BaseComponent`, providers `MenubarService`, `MenuBarStyle`, `MENUBAR_INSTANCE`, `PARENT_INSTANCE`.
- Internal recursive `MenubarSub` (selectors `p-menubarSub`, `p-menubarsub`, `[pMenubarSub]`) and an injectable `MenubarService` that debounces mouse-leave for `autoHide` (`primeng-21.1.9:packages/primeng/src/menubar/menubar.ts`, `primeng-21.1.9:packages/primeng/src/menubar/public_api.ts`).
- Style `primeng-21.1.9:packages/primeng/src/menubar/style/menubarstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/menubar/menubar.types.ts`.

**PrimeVue 4.5.5**

- Import: `import Menubar from 'primevue/menubar'` (`primevue-4.5.5:apps/showcase/doc/menubar/ImportDoc.vue`); tag `<Menubar>`.
- Source `primevue-4.5.5:packages/primevue/src/menubar/Menubar.vue`, recursive `primevue-4.5.5:packages/primevue/src/menubar/MenubarSub.vue`, props `primevue-4.5.5:packages/primevue/src/menubar/BaseMenubar.vue`, types `primevue-4.5.5:packages/primevue/src/menubar/Menubar.d.ts`, style `primevue-4.5.5:packages/primevue/src/menubar/style/MenubarStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { Menubar } from 'primereact/menubar'` (`primereact-10.9.9:components/doc/menubar/importdoc.js`).
- Source `primereact-10.9.9:components/lib/menubar/Menubar.js` (`React.memo(React.forwardRef(...))`), recursive `primereact-10.9.9:components/lib/menubar/MenubarSub.js`, defaults/CSS `primereact-10.9.9:components/lib/menubar/MenubarBase.js`, types `primereact-10.9.9:components/lib/menubar/menubar.d.ts`.

## 4. Anatomy

| Part         | PrimeNG / PrimeVue section | PrimeReact section | Content                                      |
| ------------ | -------------------------- | ------------------ | -------------------------------------------- |
| Root         | `root`                     | `root`             | Bar container                                |
| Start        | `start`                    | `start`            | Leading region (logo, title)                 |
| Menu button  | `button`                   | `button`           | Hamburger `<a role="button">`, mobile only   |
| Button icon  | `buttonIcon`               | `popupIcon`        | Bars icon                                    |
| Root list    | `rootList`                 | `menu`             | `<ul role="menubar">` of root items          |
| Item         | `item`                     | `menuitem`         | `<li role="menuitem">`                       |
| Item content | `itemContent`              | `content`          | Clickable wrapper                            |
| Item link    | `itemLink`                 | `action`           | `<a>`                                        |
| Item icon    | `itemIcon`                 | `icon`             | `item.icon`                                  |
| Item label   | `itemLabel`                | `label`            | `item.label`                                 |
| Submenu icon | `submenuIcon`              | `submenuIcon`      | Angle-down on root items, angle-right deeper |
| Submenu      | `submenu`                  | `submenu`          | Nested `<ul>`                                |
| Separator    | `separator`                | `separator`        | `<li role="separator">`                      |
| End          | `end`                      | `end`              | Trailing region (search, avatar)             |
| Badge (NG)   | `pcBadge`                  | N/A                | Item `badge`                                 |

Sources: `primeng-21.1.9:packages/primeng/src/types/menubar/menubar.types.ts`, `primevue-4.5.5:packages/primevue/src/menubar/Menubar.d.ts`, `primereact-10.9.9:components/lib/menubar/menubar.d.ts`.

## 5. API highlights

| Prop                        | PrimeNG                                                       | PrimeVue                                     | PrimeReact                                                |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| `model`                     | `MenuItem[]`                                                  | `MenuItem[]`, `null`                         | `MenuItem[]`                                              |
| `breakpoint`                | `string`, `'960px'`                                           | `string`, `'960px'`                          | N/A — theme CSS `@media` at 960px                         |
| `autoDisplay`               | `boolean`, `true` (open root on hover)                        | N/A                                          | N/A                                                       |
| `autoHide` / delay          | `boolean`; `autoHideDelay` `100` ms                           | N/A                                          | N/A                                                       |
| `autoZIndex` / `baseZIndex` | `true` / `0`                                                  | N/A                                          | N/A                                                       |
| Start / end                 | `#start`, `#end` templates (legacy `ng-content` lands in end) | `start`, `end` slots                         | `start`, `end` props: `ReactNode \| (props) => ReactNode` |
| Button customisation        | `#menuicon` template                                          | `buttonProps`, `button` / `buttonicon` slots | `menuIcon: IconType`                                      |
| Submenu icon                | `#submenuicon` template                                       | `submenuicon` slot (`{ root, active }`)      | `submenuIcon: IconType`                                   |
| ARIA                        | `ariaLabel`, `ariaLabelledBy`                                 | `ariaLabel`, `ariaLabelledby`                | `ariaLabel`, `ariaLabelledBy`                             |
| `id`                        | `string`                                                      | via attrs                                    | `string`                                                  |

- Events: PrimeNG `onFocus`, `onBlur` (`EventEmitter<FocusEvent>`); PrimeVue emits `focus`, `blur` from source while `MenubarEmitsOptions` in the `.d.ts` is empty; PrimeReact `onFocus`, `onBlur`.
- Methods: PrimeNG `toggle(event)`, `show()`; PrimeVue none declared in `Menubar.d.ts` (internal `toggle` reached through the `button` slot's `toggleCallback`); PrimeReact `toggle(event)`, `getElement()`, `getRootMenu()`, `getMenuButton()` (`primereact-10.9.9:components/lib/menubar/menubar.d.ts`).
- Templates/slots: PrimeNG `item` (`MenubarItemTemplateContext` `{ $implicit: MenuItem, root: boolean }`), `start`, `end`, `menuicon`, `submenuicon`. PrimeVue `item` (`{ item, label, props, root, hasSubmenu }`, `props` = `MenubarRouterBindProps`), `itemicon` (`{ item, class }`), `button` (`{ id, class, toggleCallback }`), `buttonicon`, `submenuicon`, `start`, `end`. PrimeReact: `MenuItem.template` plus the props above.

## 6. Usage guidance

- **Basic:** pass the nested model; root items with children render as dropdown triggers (`primeng-21.1.9:apps/showcase/doc/menubar/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menubar/BasicDoc.vue`, `primereact-10.9.9:components/doc/menubar/basicdoc.js`).
- **Template:** logo in `start`, search input and avatar in `end`, badges and shortcut hints in custom items (`primeng-21.1.9:apps/showcase/doc/menubar/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menubar/TemplateDoc.vue`, `primereact-10.9.9:components/doc/menubar/templatedoc.js`).
- **Command:** item `command` callbacks (demos show a toast) (`primeng-21.1.9:apps/showcase/doc/menubar/command-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menubar/CommandDoc.vue`, `primereact-10.9.9:components/doc/menubar/commanddoc.js`).
- **Router:** PrimeNG `routerLink`; PrimeVue `router-link custom` in the `item` slot; PrimeReact `command`/`url` with the app router (`primeng-21.1.9:apps/showcase/doc/menubar/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menubar/RouterDoc.vue`, `primereact-10.9.9:components/doc/menubar/routerdoc.js`).
- **Advanced (PrimeVue only):** a fully custom mobile button via the `button` slot (`primevue-4.5.5:apps/showcase/doc/menubar/AdvancedDoc.vue`).
- **Styling (PrimeReact):** class reference (`primereact-10.9.9:components/doc/menubar/styledoc.js`).
- Prefer Menubar for top-level site navigation with a few root entries; use [MegaMenu](megamenu.md) when a dropdown needs multi-column panels and [TieredMenu](tieredmenu.md) for a vertical cascade.

## 7. Accessibility

- Docs: root list `role="menubar"` labelled by `aria-label`/`aria-labelledby`; submenus `role="menu"` labelled by their parent item; items `menuitem` with `aria-disabled`, and groups add `aria-haspopup` and `aria-expanded`; the mobile button is `role="button"` with `aria-haspopup`, `aria-expanded`, `aria-controls` and a localized label (`primeng-21.1.9:apps/showcase/doc/menubar/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/menubar/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/menubar/accessibilitydoc.js`).
- Source: PrimeVue and PrimeReact give nested lists `role="menu"`; PrimeNG's `MenubarSub` host always sets `role="menubar"`, including nested submenus — a mismatch with its docs (`primeng-21.1.9:packages/primeng/src/menubar/menubar.ts`, `primevue-4.5.5:packages/primevue/src/menubar/MenubarSub.vue`, `primereact-10.9.9:components/lib/menubar/MenubarSub.js`).
- Button label source: PrimeNG `config.translation.aria.navigation`, PrimeVue `$primevue.config.locale.aria.navigation`, PrimeReact `ariaLabel('navigation')`; PrimeReact sets `aria-haspopup` on the button only while the mobile menu is open.
- Items set `aria-setsize`/`aria-posinset`; focus is tracked with `aria-activedescendant` on the root list.
- Keyboard: Left/Right move between root items; Down (or Up) on a root group opens its submenu at the first (or last) item; inside submenus Up/Down move, Right opens a nested level, Left closes back toward the root; Home/End jump to ends; Enter/Space activate or open; Escape closes the current submenu; Tab leaves the bar; typing searches by label.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-menubar` (+ `p-component`, `p-menubar-mobile`, `p-menubar-mobile-active`), `p-menubar-start`, `p-menubar-button`, `p-menubar-root-list`, `p-menubar-item` (+ `p-menubar-item-active`, `p-focus`, `p-disabled`), `p-menubar-item-content`, `p-menubar-item-link`, `p-menubar-item-icon`, `p-menubar-item-label`, `p-menubar-submenu-icon`, `p-menubar-submenu`, `p-menubar-separator`, `p-menubar-end` (`primeng-21.1.9:packages/primeng/src/menubar/style/menubarstyle.ts`, `primevue-4.5.5:packages/primevue/src/menubar/style/MenubarStyle.js`).
- PT keys: see Anatomy; PrimeNG global PT key `menubar` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/menubar/index.mjs`.
- Design tokens: `MenubarDesignTokens` groups `root`, `baseItem`, `item`, `submenu` (incl. `mobileIndent`), `separator`, `mobileButton` (`@primeuix/themes-2.0.3:types/menubar/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/menubar/index.mjs`.
- PrimeReact: own CSS in `MenubarBase.js` (hides `.p-menubar-button` by default); the mobile layout comes from theme CSS; classes `p-menubar p-component` (+ `p-menubar-mobile-active`), `p-menubar-start`, `p-menubar-end`, `p-menubar-button`, `p-menubar-root-list`, `p-submenu-list`, `p-menuitem` (+ `p-menuitem-active p-highlight`, `p-focus`, `p-disabled`), `p-menuitem-content`, `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-submenu-icon`, `p-menuitem-separator` (`primereact-10.9.9:components/lib/menubar/MenubarBase.js`). Tokens N/A.

## 9. Relationships

- Embeds: Bars, AngleDown, AngleRight icons; Ripple; PrimeNG also Badge and Tooltip.
- Related: [MegaMenu](megamenu.md) (horizontal bar with multi-column panels), [TieredMenu](tieredmenu.md) (vertical cascade), [Menu](menu.md) (flat list).

## 10. Dependencies

- PrimeNG: `@angular/router`, `@primeuix/utils`, `primeng/api` (`MenuItem`, `PrimeTemplate`, `SharedModule`), `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`AngleDownIcon`, `AngleRightIcon`, `BarsIcon`), `primeng/ripple`, `primeng/tooltip`, `primeng/utils` (`ZIndexUtils`), `rxjs` (`interval`, `Subject`, `debounce`, `filter`) (`primeng-21.1.9:packages/primeng/src/menubar/menubar.ts`).
- PrimeVue: `@primeuix/utils` (`dom`, `object`, `zindex`), `@primevue/core/basecomponent`, `@primevue/icons/bars`, `@primevue/icons/angledown`, `@primevue/icons/angleright`, `primevue/ripple` (`primevue-4.5.5:packages/primevue/src/menubar/Menubar.vue`, `primevue-4.5.5:packages/primevue/src/menubar/MenubarSub.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../icons/bars`, `../icons/angledown`, `../icons/angleright`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/menubar/Menubar.js`, `primereact-10.9.9:components/lib/menubar/MenubarSub.js`).

## 11. Framework differences

| Aspect                | PrimeNG                                    | PrimeVue                      | PrimeReact                   |
| --------------------- | ------------------------------------------ | ----------------------------- | ---------------------------- |
| Responsive breakpoint | `breakpoint` input (`'960px'`)             | `breakpoint` prop (`'960px'`) | Fixed in theme CSS (960px)   |
| Hover behaviour       | `autoDisplay`, `autoHide`, `autoHideDelay` | Click to open root            | Click to open root           |
| Nested list role      | `menubar` (docs say `menu`)                | `menu`                        | `menu`                       |
| Mobile button control | `#menuicon` template                       | `button` slot + `buttonProps` | `menuIcon` prop              |
| Public methods        | `toggle`, `show`                           | none declared                 | `toggle`, element getters    |
| Class naming          | `p-menubar-*`                              | `p-menubar-*`                 | `p-menuitem*`, `p-submenu-*` |
| Design tokens         | `@primeuix/themes`                         | `@primeuix/themes`            | N/A                          |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/menubar/menubar.ts`
- `primeng-21.1.9:packages/primeng/src/menubar/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/menubar/style/menubarstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/menubar/menubar.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/menubar/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menubar/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menubar/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menubar/command-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menubar/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/menubar/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/menubar/Menubar.vue`
- `primevue-4.5.5:packages/primevue/src/menubar/MenubarSub.vue`
- `primevue-4.5.5:packages/primevue/src/menubar/BaseMenubar.vue`
- `primevue-4.5.5:packages/primevue/src/menubar/Menubar.d.ts`
- `primevue-4.5.5:packages/primevue/src/menubar/style/MenubarStyle.js`
- `primevue-4.5.5:apps/showcase/doc/menubar/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menubar/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menubar/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menubar/CommandDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menubar/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menubar/AdvancedDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/menubar/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/menubar/Menubar.js`
- `primereact-10.9.9:components/lib/menubar/MenubarSub.js`
- `primereact-10.9.9:components/lib/menubar/MenubarBase.js`
- `primereact-10.9.9:components/lib/menubar/menubar.d.ts`
- `primereact-10.9.9:components/doc/menubar/importdoc.js`
- `primereact-10.9.9:components/doc/menubar/basicdoc.js`
- `primereact-10.9.9:components/doc/menubar/templatedoc.js`
- `primereact-10.9.9:components/doc/menubar/commanddoc.js`
- `primereact-10.9.9:components/doc/menubar/routerdoc.js`
- `primereact-10.9.9:components/doc/menubar/styledoc.js`
- `primereact-10.9.9:components/doc/menubar/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/menubar/index.mjs`
- `@primeuix/themes-2.0.3:types/menubar/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/menubar/index.mjs`
