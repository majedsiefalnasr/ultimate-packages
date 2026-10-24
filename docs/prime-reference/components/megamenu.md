# MegaMenu

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

MegaMenu is a navigation bar whose root items open large panels that show several groups of links side by side in columns, instead of one cascading list per level. It lays out horizontally (dropdown panels) or vertically (panels fly out to the side), has `start`/`end` regions, and collapses behind a hamburger button below a breakpoint (`primeng-21.1.9:packages/primeng/src/megamenu/megamenu.ts`, `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.vue`, `primereact-10.9.9:components/lib/megamenu/MegaMenu.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model), with one structural twist: a root item's `items` is an array of **columns**, each column an array of **groups**, and each group a MenuItem whose own `items` are the links (`MenuItem[][]` per root item). PrimeNG types this as a separate `MegaMenuItem` interface whose `items?: MenuItem[][]` (`primeng-21.1.9:packages/primeng/src/api/megamenuitem.ts`); PrimeVue and PrimeReact keep `model?: MenuItem[]` and rely on the nesting convention shown in their demos (`primevue-4.5.5:apps/showcase/doc/megamenu/BasicDoc.vue`).

## 2. Names & status

- Canonical name: **MegaMenu** in all three frameworks; not deprecated.
- Showcase menu: `MegaMenu` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `styleClass` (`@deprecated` since v20.0.0, use `class`) (`primeng-21.1.9:packages/primeng/src/megamenu/megamenu.ts`). PrimeVue's `MegaMenu.d.ts` declares only `menubutton`/`menubuttonicon` slots, while the template prefers `button`/`buttonicon` when supplied and falls back to the older names (`primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.vue`, `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.d.ts`) — the reverse of [Menubar](menubar.md), where the old names are marked deprecated.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { MegaMenuModule } from 'primeng/megamenu'` or the standalone `MegaMenu` class; items typed with `MegaMenuItem` from `primeng/api` (`primeng-21.1.9:apps/showcase/doc/megamenu/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/megamenu/basic-doc.ts`).
- Selectors `p-megaMenu`, `p-megamenu`, `p-mega-menu`; class `MegaMenu extends BaseComponent<MegaMenuPassThrough>`, providers `MegaMenuStyle`, `MEGAMENU_INSTANCE`, `PARENT_INSTANCE`.
- Internal recursive `MegaMenuSub` (selectors `p-megaMenuSub`, `p-megamenu-sub`, `ul[pMegaMenuSub]`) (`primeng-21.1.9:packages/primeng/src/megamenu/megamenu.ts`, `primeng-21.1.9:packages/primeng/src/megamenu/public_api.ts`).
- Style `primeng-21.1.9:packages/primeng/src/megamenu/style/megamenustyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/megamenu/megamenu.types.ts`.

**PrimeVue 4.5.5**

- Import: `import MegaMenu from 'primevue/megamenu'` (`primevue-4.5.5:apps/showcase/doc/megamenu/ImportDoc.vue`); tag `<MegaMenu>`.
- Source `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.vue`, recursive `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenuSub.vue`, props `primevue-4.5.5:packages/primevue/src/megamenu/BaseMegaMenu.vue`, types `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.d.ts`, style `primevue-4.5.5:packages/primevue/src/megamenu/style/MegaMenuStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { MegaMenu } from 'primereact/megamenu'` (`primereact-10.9.9:components/doc/megamenu/importdoc.js`).
- Single-file render `primereact-10.9.9:components/lib/megamenu/MegaMenu.js` (no separate Sub component; `React.memo(React.forwardRef(...))`), defaults/CSS `primereact-10.9.9:components/lib/megamenu/MegaMenuBase.js`, types `primereact-10.9.9:components/lib/megamenu/megamenu.d.ts`.

## 4. Anatomy

| Part          | PrimeNG / PrimeVue section                         | PrimeReact section                                    | Content                                          |
| ------------- | -------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Root          | `root`                                             | `root`                                                | Bar container                                    |
| Start / end   | `start`, `end`                                     | `start`, `end`                                        | Leading and trailing regions                     |
| Menu button   | `button`                                           | `menuButton`                                          | Hamburger `<a role="button">`, mobile only       |
| Button icon   | `buttonIcon`                                       | `menuButtonIcon`                                      | Bars icon                                        |
| Root list     | `rootList`                                         | `menu`                                                | `<ul role="menubar">`                            |
| Root item     | `item`                                             | `menuitem`                                            | `<li role="menuitem">` at level 1                |
| Item parts    | `itemContent`, `itemLink`, `itemIcon`, `itemLabel` | `headerAction` (root link), `action`, `icon`, `label` | Clickable content                                |
| Submenu icon  | `submenuIcon`                                      | `submenuIcon`                                         | Angle-down (horizontal) / angle-right (vertical) |
| Panel         | `overlay`                                          | `panel`                                               | Container opened by a root item                  |
| Grid / column | `grid`, `column`                                   | `grid`, `column`                                      | Column layout inside the panel                   |
| Group list    | `submenu`                                          | `submenu`                                             | `<ul role="menu">` per group                     |
| Group label   | `submenuLabel`                                     | `submenuHeader`                                       | Non-interactive `<li role="presentation">`       |
| Link item     | `item`                                             | `submenuItem`                                         | `<li role="menuitem">` inside a group            |
| Separator     | `separator`                                        | `separator`                                           | `<li role="separator">`                          |

Sources: `primeng-21.1.9:packages/primeng/src/types/megamenu/megamenu.types.ts`, `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.d.ts`, `primereact-10.9.9:components/lib/megamenu/megamenu.d.ts`.

## 5. API highlights

| Prop                    | PrimeNG                                         | PrimeVue                                                   | PrimeReact                                                                                     |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `model`                 | `MegaMenuItem[]`                                | `MenuItem[]`, `null`                                       | `MenuItem[]`, `null`                                                                           |
| `orientation`           | `'horizontal' \| 'vertical'`, `'horizontal'`    | `string`, `'horizontal'`                                   | `'horizontal' \| 'vertical'`, `'horizontal'`                                                   |
| `breakpoint`            | `string`, `'960px'`                             | `string`, `'960px'`                                        | `string`, `undefined` (mobile mode off unless set)                                             |
| `scrollHeight`          | `string`, `'20rem'`                             | `string`, `'20rem'`                                        | `string`, `'400px'`                                                                            |
| `disabled`              | `boolean`, `false`                              | `boolean`, `false`                                         | N/A                                                                                            |
| `tabindex` / `tabIndex` | `number`, `0`                                   | `number`, `0`                                              | `number`, `0`                                                                                  |
| ARIA                    | `ariaLabel`, `ariaLabelledBy`                   | `ariaLabel`, `ariaLabelledby`                              | read from `props.ariaLabel`/`ariaLabelledBy` in source but not declared in `.d.ts` or defaults |
| Start / end             | `#start`, `#end` templates                      | `start`, `end` slots                                       | `start`, `end`: `ReactNode \| (props) => ReactNode`                                            |
| Mobile button           | `#button`, `#buttonicon`, `#menuicon` templates | `button`/`menubutton`, `buttonicon`/`menubuttonicon` slots | `menuIcon: IconType`                                                                           |
| Submenu icon            | `#submenuicon` template                         | `submenuicon` slot (`{ active }`)                          | `submenuIcon: IconType`                                                                        |

- Events: PrimeNG has no public outputs on `MegaMenu` (outputs exist only on the internal `MegaMenuSub`); PrimeVue emits `focus`, `blur` (`MegaMenuEmitsOptions`); PrimeReact `onFocus`, `onBlur`.
- Methods: PrimeNG `toggle(event)`, `show()`, `hide(event?, isFocus?)` on the class; PrimeVue none declared in `MegaMenu.d.ts`; PrimeReact `getElement()` only (`primereact-10.9.9:components/lib/megamenu/megamenu.d.ts`).
- Templates/slots: PrimeNG `item` (`MegaMenuItemTemplateContext`), `start`, `end`, `menuicon`, `submenuicon`, `button`, `buttonicon`. PrimeVue `item` (`{ item, label, props, hasSubmenu }`, `props` = `MegaMenuRouterBindProps`), `itemicon` (`{ item, class }`), `submenuicon`, `menubutton` (`{ id, class, toggleCallback }`), `menubuttonicon`, `start`, `end`. PrimeReact: `MenuItem.template` plus the props above.

## 6. Usage guidance

- **Basic:** horizontal bar with a panel per root item; the number of columns in a root item drives the grid width class (`primeng-21.1.9:apps/showcase/doc/megamenu/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/megamenu/BasicDoc.vue`, `primereact-10.9.9:components/doc/megamenu/basicdoc.js`).
- **Vertical:** `orientation="vertical"` turns the bar into a side menu with panels opening to the right (`primeng-21.1.9:apps/showcase/doc/megamenu/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/megamenu/VerticalDoc.vue`, `primereact-10.9.9:components/doc/megamenu/verticaldoc.js`).
- **Template:** rich panel content (images, descriptions, call-to-action) through the `item` template/slot or PrimeReact `template`, plus `start`/`end` regions (`primeng-21.1.9:apps/showcase/doc/megamenu/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/megamenu/TemplateDoc.vue`, `primereact-10.9.9:components/doc/megamenu/templatedoc.js`).
- **Command:** item `command` callbacks (`primeng-21.1.9:apps/showcase/doc/megamenu/command-doc.ts`, `primevue-4.5.5:apps/showcase/doc/megamenu/CommandDoc.vue`, `primereact-10.9.9:components/doc/megamenu/commanddoc.js`).
- **Router:** PrimeNG `routerLink`; PrimeVue `router-link custom` in the `item` slot; PrimeReact `command`/`url` (`primeng-21.1.9:apps/showcase/doc/megamenu/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/megamenu/RouterDoc.vue`, `primereact-10.9.9:components/doc/megamenu/routerdoc.js`).
- **Styling (PrimeReact):** class reference (`primereact-10.9.9:components/doc/megamenu/styledoc.js`).
- Column width classes are chosen from the column count: 2 → `col-6`, 3 → `col-4`, 4 → `col-3`, 6 → `col-2`, any other count (and mobile mode) → `col-12`; five columns therefore stack full width (`primeng-21.1.9:packages/primeng/src/megamenu/style/megamenustyle.ts`, `primevue-4.5.5:packages/primevue/src/megamenu/style/MegaMenuStyle.js`, `primereact-10.9.9:components/lib/megamenu/MegaMenuBase.js`).
- Pick MegaMenu over [Menubar](menubar.md) when a top-level entry leads to many categorised links that benefit from being visible at once.

## 7. Accessibility

- Docs: root list `role="menubar"` with `aria-orientation` and `aria-label`/`aria-labelledby`; items `menuitem` with `aria-label`, `aria-disabled`; group lists `role="menu"` labelled by their header; root items with panels carry `aria-haspopup` and `aria-expanded` (`primeng-21.1.9:apps/showcase/doc/megamenu/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/megamenu/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/megamenu/accessibilitydoc.js`).
- Source: all three render root `menubar`, group lists `menu`, group headers `presentation`; items set `aria-setsize`, `aria-posinset` and `aria-level` (PrimeNG `level + 1`; PrimeReact fixed `'1'` for root items and `'2'` for links); focus tracked with `aria-activedescendant` (`primeng-21.1.9:packages/primeng/src/megamenu/megamenu.ts`, `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenuSub.vue`, `primereact-10.9.9:components/lib/megamenu/MegaMenu.js`).
- Mobile button: `role="button"`, `aria-haspopup`, `aria-expanded`, `aria-controls`, localized "navigation" label.
- Keyboard (horizontal): Left/Right move across root items; Down opens a root item's panel and then walks its links; Alt+Up closes the open panel and returns to its root item; Up moves back within a panel; Home/End jump to ends; Enter/Space open or activate; Escape closes; Tab leaves; printable characters search by label. Vertical orientation swaps the axes (Up/Down on roots, Right opens a panel) (`primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.vue`).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-megamenu` (+ `p-component`, `p-megamenu-mobile`, `p-megamenu-mobile-active`, `p-megamenu-horizontal`, `p-megamenu-vertical`), `p-megamenu-start`, `p-megamenu-button`, `p-megamenu-root-list`, `p-megamenu-item` (+ `p-megamenu-item-active`, `p-focus`, `p-disabled`), `p-megamenu-item-content`, `p-megamenu-item-link`, `p-megamenu-item-icon`, `p-megamenu-item-label`, `p-megamenu-submenu-icon`, `p-megamenu-overlay`, `p-megamenu-grid`, `p-megamenu-col-{12,6,4,3,2}`, `p-megamenu-submenu`, `p-megamenu-submenu-label`, `p-megamenu-separator`, `p-megamenu-end` (`primeng-21.1.9:packages/primeng/src/megamenu/style/megamenustyle.ts`, `primevue-4.5.5:packages/primevue/src/megamenu/style/MegaMenuStyle.js`).
- PT keys: see Anatomy; PrimeNG global PT key `megaMenu` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/megamenu/index.mjs`.
- Design tokens: `MegaMenuDesignTokens` groups `root`, `baseItem`, `item`, `overlay`, `submenu`, `submenuLabel`, `submenuIcon`, `separator`, `mobileButton` (`@primeuix/themes-2.0.3:types/megamenu/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/megamenu/index.mjs`.
- PrimeReact: own CSS in `MegaMenuBase.js` plus a generated `@media` block when `breakpoint` is set; classes `p-megamenu p-component` (+ `p-megamenu-horizontal`/`-vertical`, `p-megamenu-mobile-active`), `p-megamenu-start`, `p-megamenu-end`, `p-megamenu-button`, `p-megamenu-root-list`, `p-megamenu-panel`, `p-megamenu-grid`, `p-megamenu-col-*`, `p-submenu-list p-megamenu-submenu`, `p-megamenu-submenu-header p-submenu-header`, `p-menuitem` (+ `p-menuitem-active`, `p-focus`, `p-disabled`), `p-menuitem-content`, `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-submenu-icon`, `p-menuitem-separator` (`primereact-10.9.9:components/lib/megamenu/MegaMenuBase.js`). Tokens N/A.

## 9. Relationships

- Embeds: Bars, AngleDown, AngleRight icons; Ripple; PrimeNG also Badge and Tooltip.
- Related: [Menubar](menubar.md) (same bar, cascading lists instead of panels), [PanelMenu](panelmenu.md) (vertical accordion alternative), [Menu](menu.md) (shared item model).

## 10. Dependencies

- PrimeNG: `@angular/router`, `@primeuix/utils`, `primeng/api` (`MegaMenuItem`, `PrimeTemplate`, `SharedModule`), `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`AngleDownIcon`, `AngleRightIcon`, `BarsIcon`), `primeng/ripple`, `primeng/tooltip`, `primeng/utils` (`ZIndexUtils`) (`primeng-21.1.9:packages/primeng/src/megamenu/megamenu.ts`).
- PrimeVue: `@primeuix/utils` (`dom`, `object`, `zindex`), `@primevue/core/basecomponent`, `@primevue/icons/bars`, `@primevue/icons/angledown`, `@primevue/icons/angleright`, `primevue/ripple` (`primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.vue`, `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenuSub.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks` (`useEventListener`, `useMatchMedia`, `useResizeListener`), `../icons/angledown`, `../icons/angleright`, `../icons/bars`, `../ripple/Ripple`, `../utils/Utils` (`ZIndexUtils`) (`primereact-10.9.9:components/lib/megamenu/MegaMenu.js`).

## 11. Framework differences

| Aspect                 | PrimeNG                                   | PrimeVue                                                                                 | PrimeReact                              |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Item typing            | Dedicated `MegaMenuItem` (`MenuItem[][]`) | `MenuItem[]` + nesting convention                                                        | `MenuItem[]` + nesting convention       |
| Mobile mode default    | on below `'960px'`                        | on below `'960px'`                                                                       | off unless `breakpoint` set             |
| `scrollHeight` default | `'20rem'`                                 | `'20rem'`                                                                                | `'400px'`                               |
| ARIA label props       | yes                                       | yes                                                                                      | undeclared (source reads them)          |
| `disabled` prop        | yes                                       | yes                                                                                      | no                                      |
| Public methods         | `toggle`, `show`, `hide`                  | none declared                                                                            | `getElement`                            |
| Button slot naming     | `button` / `buttonicon` (+ `menuicon`)    | `.d.ts` lists `menubutton`/`menubuttonicon`; template also accepts `button`/`buttonicon` | `menuIcon` prop                         |
| Class naming           | `p-megamenu-*`                            | `p-megamenu-*`                                                                           | mix of `p-megamenu-*` and `p-menuitem*` |
| Design tokens          | `@primeuix/themes`                        | `@primeuix/themes`                                                                       | N/A                                     |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/megamenu/megamenu.ts`
- `primeng-21.1.9:packages/primeng/src/megamenu/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/megamenu/style/megamenustyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/megamenu/megamenu.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/megamenuitem.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/vertical-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/command-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/megamenu/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.vue`
- `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenuSub.vue`
- `primevue-4.5.5:packages/primevue/src/megamenu/BaseMegaMenu.vue`
- `primevue-4.5.5:packages/primevue/src/megamenu/MegaMenu.d.ts`
- `primevue-4.5.5:packages/primevue/src/megamenu/style/MegaMenuStyle.js`
- `primevue-4.5.5:apps/showcase/doc/megamenu/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/megamenu/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/megamenu/VerticalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/megamenu/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/megamenu/CommandDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/megamenu/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/megamenu/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/megamenu/MegaMenu.js`
- `primereact-10.9.9:components/lib/megamenu/MegaMenuBase.js`
- `primereact-10.9.9:components/lib/megamenu/megamenu.d.ts`
- `primereact-10.9.9:components/doc/megamenu/importdoc.js`
- `primereact-10.9.9:components/doc/megamenu/basicdoc.js`
- `primereact-10.9.9:components/doc/megamenu/verticaldoc.js`
- `primereact-10.9.9:components/doc/megamenu/templatedoc.js`
- `primereact-10.9.9:components/doc/megamenu/commanddoc.js`
- `primereact-10.9.9:components/doc/megamenu/routerdoc.js`
- `primereact-10.9.9:components/doc/megamenu/styledoc.js`
- `primereact-10.9.9:components/doc/megamenu/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/megamenu/index.mjs`
- `@primeuix/themes-2.0.3:types/megamenu/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/megamenu/index.mjs`
