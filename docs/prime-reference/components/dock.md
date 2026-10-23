# Dock

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Dock is an application-launcher bar in the style of a desktop dock: a row (or column) of icon items pinned to one edge of its container (`position` bottom, top, left or right). Hovering an item enlarges it and its neighbours. Items come from a flat `MenuItem[]` model; there is no nesting (`primeng-21.1.9:packages/primeng/src/dock/dock.ts`, `primevue-4.5.5:packages/primevue/src/dock/Dock.vue`, `primereact-10.9.9:components/lib/dock/Dock.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model).

## 2. Names & status

- Canonical name: **Dock** in all three frameworks; no alias; not deprecated.
- Showcase menu: `Dock` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `styleClass` (`@deprecated since v20.0.0`, use `class`) (`primeng-21.1.9:packages/primeng/src/dock/dock.ts`); PrimeVue slot `icon` (deprecated since v4.0, use `itemicon`) (`primevue-4.5.5:packages/primevue/src/dock/Dock.d.ts`). None in PrimeReact.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { DockModule } from 'primeng/dock'` or standalone `Dock` (`primeng-21.1.9:apps/showcase/doc/dock/import-doc.ts`).
- Selector `p-dock`; class `Dock extends BaseComponent<DockPassThrough>`, providers `DockStyle`, `DOCK_INSTANCE`, `PARENT_INSTANCE`, host directive `Bind`.
- Source `primeng-21.1.9:packages/primeng/src/dock/dock.ts`; style `primeng-21.1.9:packages/primeng/src/dock/style/dockstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/dock/dock.types.ts`; exports `primeng-21.1.9:packages/primeng/src/dock/public_api.ts`.

**PrimeVue 4.5.5**

- Import: `import Dock from 'primevue/dock'` (`primevue-4.5.5:apps/showcase/doc/dock/ImportDoc.vue`); tag `<Dock>`.
- Source `primevue-4.5.5:packages/primevue/src/dock/Dock.vue` (wrapper, breakpoint media query), list and keyboard logic in internal `primevue-4.5.5:packages/primevue/src/dock/DockSub.vue`, props `primevue-4.5.5:packages/primevue/src/dock/BaseDock.vue`, types `primevue-4.5.5:packages/primevue/src/dock/Dock.d.ts`, style `primevue-4.5.5:packages/primevue/src/dock/style/DockStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { Dock } from 'primereact/dock'` (`primereact-10.9.9:components/doc/dock/importdoc.js`).
- Source `primereact-10.9.9:components/lib/dock/Dock.js`, defaults/CSS `primereact-10.9.9:components/lib/dock/DockBase.js`, types `primereact-10.9.9:components/lib/dock/dock.d.ts`.

## 4. Anatomy

| Part           | PrimeNG / PrimeVue section | PrimeReact section | Content                                   |
| -------------- | -------------------------- | ------------------ | ----------------------------------------- |
| Root           | `root`                     | `root`             | Positioned container, `p-dock-<position>` |
| Header         | N/A                        | `header`           | PrimeReact `header` content               |
| List container | `listContainer`            | `container`        | Wrapper around the list                   |
| List           | `list`                     | `menu`             | `<ul role="menu">`                        |
| Item           | `item`                     | `menuitem`         | `<li>`                                    |
| Item content   | `itemContent`              | N/A                | Wrapper inside the item                   |
| Item link      | `itemLink`                 | `action`           | `<a>`                                     |
| Item icon      | `itemIcon`                 | `icon`             | Icon or image                             |
| Footer         | N/A                        | `footer`           | PrimeReact `footer` content               |

Sources: `primeng-21.1.9:packages/primeng/src/types/dock/dock.types.ts`, `primevue-4.5.5:packages/primevue/src/dock/Dock.d.ts`, `primereact-10.9.9:components/lib/dock/dock.d.ts`. Item labels are not rendered as text; they surface as tooltips and `aria-label`.

## 5. API highlights

| Prop            | PrimeNG                                                 | PrimeVue                                                                          | PrimeReact                                                |
| --------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `model`         | `MenuItem[] \| null`, `null`                            | `MenuItem[]`, `null`                                                              | `MenuItem[]`, `null`                                      |
| `position`      | `'bottom' \| 'top' \| 'left' \| 'right'`, `'bottom'`    | `HintedString<'left' \| 'right' \| 'top' \| 'bottom'>`, `'bottom'`                | `'left' \| 'top' \| 'bottom' \| 'right'`, `'bottom'`      |
| `breakpoint`    | `string`, `'960px'`                                     | `string`, `'960px'`                                                               | N/A                                                       |
| Tab index       | `tabindex: number = 0` (class field, not an input)      | `tabindex: number`, `0`                                                           | `tabIndex: number`, `0`                                   |
| Tooltips        | per item `tooltip`, `tooltipPosition`, `tooltipOptions` | `tooltipOptions: DockTooltipOptions` (`event`, `position`, …), label used as text | N/A (see Advanced demo using Tooltip component)           |
| Magnification   | always on                                               | always on                                                                         | `magnification: boolean`, `true`                          |
| Header / footer | N/A                                                     | N/A                                                                               | `header`, `footer`: `ReactNode \| (options) => ReactNode` |
| Other           | `id`, `ariaLabel`, `ariaLabelledBy`                     | `menuId`, `ariaLabel`, `ariaLabelledby`                                           | `id`                                                      |

- Events: `onFocus`, `onBlur` (PrimeNG outputs `EventEmitter<FocusEvent>`, PrimeReact callbacks); PrimeVue `DockSub` emits `focus`/`blur` and the Dock forwards them.
- Templates/slots: PrimeNG `item` (`DockItemTemplateContext` `{ $implicit: MenuItem }`). PrimeVue `item` (`{ item, index, label, props: DockRouterBindProps }`), `itemicon` (`{ item }`), deprecated `icon`. PrimeReact: `MenuItem.template`, `header`, `footer`.
- Methods: PrimeReact `getElement()`; none in PrimeNG/PrimeVue.
- Below `breakpoint` PrimeNG and PrimeVue add `p-dock-mobile` to the root via a `matchMedia` listener (`primevue-4.5.5:packages/primevue/src/dock/Dock.vue`, `primeng-21.1.9:packages/primeng/src/dock/style/dockstyle.ts`).

## 6. Usage guidance

- **Basic:** bind icon items (often image icons through the item template) and choose an edge with `position`; the demo switches positions with radio buttons (`primeng-21.1.9:apps/showcase/doc/dock/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dock/BasicDoc.vue`, `primereact-10.9.9:components/doc/dock/basicdoc.js`).
- **Advanced:** a mock desktop combining Dock with Menubar, Dialog, Terminal (with `TerminalService` in PrimeNG), Galleria, Tree and Toast (`MessageService`); item `command`s open the windows (`primeng-21.1.9:apps/showcase/doc/dock/advanced-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dock/AdvancedDoc.vue`, `primereact-10.9.9:components/doc/dock/advanceddoc.js`).
- **Styling (PrimeReact):** class-name reference (`primereact-10.9.9:components/doc/dock/styledoc.js`).
- Dock is absolutely positioned against its parent; the parent needs a relative position and a size.

## 7. Accessibility

- The list has `role="menu"` with `aria-orientation` (`horizontal` for top/bottom, `vertical` for left/right), `aria-activedescendant` while focused, and `aria-label`/`aria-labelledby` from props. Items have `role="menuitem"`, `aria-label` from the item label and `aria-disabled` (`primeng-21.1.9:packages/primeng/src/dock/dock.ts`, `primevue-4.5.5:packages/primevue/src/dock/DockSub.vue`, `primereact-10.9.9:components/lib/dock/Dock.js`).
- Icons are `aria-hidden`; links are removed from the tab order (`tabindex="-1"`) and focus is managed on the list.
- Keyboard (handled keys in all three: `ArrowDown`, `ArrowUp`, `ArrowRight`, `ArrowLeft`, `Home`, `End`, `Enter`, `NumpadEnter`, `Space`): Tab enters the dock, Up/Down move in vertical layouts and Left/Right in horizontal layouts, Home/End jump to the ends, Enter/Space activate (`primeng-21.1.9:apps/showcase/doc/dock/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dock/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/dock/accessibilitydoc.js`).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-dock` (+ `p-component`, `p-dock-<position>`, `p-dock-mobile`), `p-dock-list-container`, `p-dock-list`, `p-dock-item` (+ `p-focus`, `p-disabled`), `p-dock-item-content`, `p-dock-item-link`, `p-dock-item-icon` (`primeng-21.1.9:packages/primeng/src/dock/style/dockstyle.ts`, `primevue-4.5.5:packages/primevue/src/dock/style/DockStyle.js`).
- PT keys: see Anatomy; PrimeNG global PT key `dock` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/dock/index.mjs`.
- Design tokens: `DockDesignTokens` groups `root`, `item` (`@primeuix/themes-2.0.3:types/dock/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/dock/index.mjs`.
- PrimeReact: own CSS in `DockBase.js`; classes `p-dock p-component p-dock-<position>` (+ `p-dock-magnification`), `p-dock-list-container`, `p-dock-list`, `p-dock-header`, `p-dock-footer`, `p-dock-item` with neighbour classes `p-dock-item-second-prev`, `p-dock-item-prev`, `p-dock-item-current`, `p-dock-item-next`, `p-dock-item-second-next` (+ `p-focus`), `p-menuitem-content`, `p-dock-action` (+ `p-disabled`), `p-dock-action-icon` (`primereact-10.9.9:components/lib/dock/DockBase.js`). Tokens N/A.

## 9. Relationships

- Embeds: Tooltip (PrimeNG via item fields, PrimeVue via `v-tooltip` directive), Ripple, Badge (PrimeNG).
- Uses the MenuItem model ([Menu](menu.md#menuitem-model)); flat only.
- Typically combined with [Menubar](menubar.md), Dialog, Galleria, Terminal (showcase Advanced demo).
- Related: [Menubar](menubar.md) (text navigation bar), SpeedDial (floating action menu, Button category).

## 10. Dependencies

- PrimeNG: `@angular/router` (`RouterLink`, `RouterLinkActive`, `RouterModule`), `@primeuix/utils` (`find`, `findSingle`, `resolve`, `uuid`), `primeng/api`, `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/ripple`, `primeng/tooltip` (`primeng-21.1.9:packages/primeng/src/dock/dock.ts`).
- PrimeVue: `@primeuix/utils/dom`, `@primeuix/utils/object`, `@primevue/core/basecomponent`, `primevue/ripple`, `primevue/tooltip`, `@primeuix/styles/dock` (`primevue-4.5.5:packages/primevue/src/dock/DockSub.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/dock/Dock.js`).
- External npm: none beyond the framework.

## 11. Framework differences

| Aspect             | PrimeNG                        | PrimeVue                       | PrimeReact                                |
| ------------------ | ------------------------------ | ------------------------------ | ----------------------------------------- |
| Responsive mode    | `breakpoint` → `p-dock-mobile` | `breakpoint` → `p-dock-mobile` | N/A                                       |
| Magnification      | always (CSS)                   | always (CSS)                   | toggle `magnification`, neighbour classes |
| Header / footer    | N/A                            | N/A                            | `header`, `footer`                        |
| Tooltips           | per-item fields                | `tooltipOptions` prop          | not built in                              |
| Item customisation | `#item` template               | `item`, `itemicon` slots       | `MenuItem.template`                       |
| Tab index          | not an input (fixed `0`)       | `tabindex` prop                | `tabIndex` prop                           |
| Design tokens      | `@primeuix/themes`             | `@primeuix/themes`             | N/A                                       |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/dock/dock.ts`
- `primeng-21.1.9:packages/primeng/src/dock/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/dock/style/dockstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/dock/dock.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/dock/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dock/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dock/advanced-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/dock/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/dock/Dock.vue`
- `primevue-4.5.5:packages/primevue/src/dock/DockSub.vue`
- `primevue-4.5.5:packages/primevue/src/dock/BaseDock.vue`
- `primevue-4.5.5:packages/primevue/src/dock/Dock.d.ts`
- `primevue-4.5.5:packages/primevue/src/dock/style/DockStyle.js`
- `primevue-4.5.5:apps/showcase/doc/dock/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dock/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dock/AdvancedDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dock/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/dock/Dock.js`
- `primereact-10.9.9:components/lib/dock/DockBase.js`
- `primereact-10.9.9:components/lib/dock/dock.d.ts`
- `primereact-10.9.9:components/doc/dock/importdoc.js`
- `primereact-10.9.9:components/doc/dock/basicdoc.js`
- `primereact-10.9.9:components/doc/dock/advanceddoc.js`
- `primereact-10.9.9:components/doc/dock/styledoc.js`
- `primereact-10.9.9:components/doc/dock/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/dock/index.mjs`
- `@primeuix/themes-2.0.3:types/dock/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/dock/index.mjs`
