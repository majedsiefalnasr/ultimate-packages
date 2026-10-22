# Breadcrumb

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Breadcrumb shows the user's location in a hierarchy as a horizontal trail of links: an optional home item followed by the `model` items, with a separator (chevron icon by default) between them. Items are plain links without submenus; activating one runs its `command` and/or navigates (`primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`, `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.vue`, `primereact-10.9.9:components/lib/breadcrumb/BreadCrumb.js`).

Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model).

## 2. Names & status

- Canonical name: **Breadcrumb**. PrimeReact spells the component and files `BreadCrumb` (`BreadCrumb.js`, `BreadCrumbBase.js`, type prefix `BreadCrumb*`) while the folder and import path are `breadcrumb` (`primereact-10.9.9:components/lib/breadcrumb/BreadCrumb.js`). PrimeNG's style class is also `BreadCrumbStyle`, while the component is `Breadcrumb` (`primeng-21.1.9:packages/primeng/src/breadcrumb/style/breadcrumbstyle.ts`).
- Showcase menu: `Breadcrumb` under **Menu** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `styleClass` (`@deprecated since v20.0.0`, use `class`) (`primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`). None in PrimeVue or PrimeReact.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { BreadcrumbModule } from 'primeng/breadcrumb'` or standalone `Breadcrumb` (`primeng-21.1.9:apps/showcase/doc/breadcrumb/import-doc.ts`).
- Selector `p-breadcrumb`; class `Breadcrumb extends BaseComponent<BreadcrumbPassThrough>`, providers `BreadCrumbStyle`, `BREADCRUMB_INSTANCE`, `PARENT_INSTANCE`, host directive `Bind`.
- Source `primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`; style `primeng-21.1.9:packages/primeng/src/breadcrumb/style/breadcrumbstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/breadcrumb/breadcrumb.types.ts`; exports listed in `primeng-21.1.9:packages/primeng/src/breadcrumb/public_api.ts`.
- The component injects Angular `Router` (`router = inject(Router)`), so the application must provide the router.

**PrimeVue 4.5.5**

- Import: `import Breadcrumb from 'primevue/breadcrumb'` (`primevue-4.5.5:apps/showcase/doc/breadcrumb/ImportDoc.vue`); tag `<Breadcrumb>`.
- Source `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.vue`, props `primevue-4.5.5:packages/primevue/src/breadcrumb/BaseBreadcrumb.vue`, internal row component `primevue-4.5.5:packages/primevue/src/breadcrumb/BreadcrumbItem.vue`, types `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.d.ts`, style `primevue-4.5.5:packages/primevue/src/breadcrumb/style/BreadcrumbStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { BreadCrumb } from 'primereact/breadcrumb'` (`primereact-10.9.9:components/doc/breadcrumb/importdoc.js`).
- Source `primereact-10.9.9:components/lib/breadcrumb/BreadCrumb.js`, defaults/CSS `primereact-10.9.9:components/lib/breadcrumb/BreadCrumbBase.js`, types `primereact-10.9.9:components/lib/breadcrumb/breadcrumb.d.ts`.

## 4. Anatomy

| Part           | PrimeNG / PrimeVue section | PrimeReact section | Element / content      |
| -------------- | -------------------------- | ------------------ | ---------------------- |
| Root           | `root`                     | `root`             | `<nav>`                |
| List           | `list`                     | `menu`             | `<ol>`                 |
| Home item      | `homeItem`                 | (home `menuitem`)  | `<li>` for `home`      |
| Separator      | `separator`                | `separator`        | `<li>` between items   |
| Separator icon | `separatorIcon`            | `separatorIcon`    | Chevron-right icon     |
| Item           | `item`                     | `menuitem`         | `<li>`                 |
| Item link      | `itemLink`                 | `action`           | `<a>`                  |
| Item icon      | `itemIcon`                 | `icon`             | Icon from `item.icon`  |
| Item label     | `itemLabel`                | `label`            | Text from `item.label` |

Sources: `primeng-21.1.9:packages/primeng/src/types/breadcrumb/breadcrumb.types.ts`, `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.d.ts`, `primereact-10.9.9:components/lib/breadcrumb/breadcrumb.d.ts`. PrimeReact types the `menu` section as `HTMLUListElement` although it renders `<ol>`.

## 5. API highlights

| Prop      | PrimeNG                 | PrimeVue                                                                                                         | PrimeReact                                 |
| --------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `model`   | `MenuItem[]`            | `MenuItem[]`, default `null`                                                                                     | `MenuItem[]`, default `null`               |
| `home`    | `MenuItem`              | `MenuItem` (typed `any`), `null`                                                                                 | `MenuItem`, `null`                         |
| Home ARIA | `homeAriaLabel: string` | N/A                                                                                                              | N/A                                        |
| ARIA      | via host attributes     | `ariaLabel`, `ariaLabelledby` (declared in `.d.ts`; not in `BaseBreadcrumb` props, reach the root as attributes) | via root props                             |
| Separator | `#separator` template   | `separator` slot                                                                                                 | `separatorIcon: IconType<BreadCrumbProps>` |

- Events: PrimeNG `onItemClick: EventEmitter<BreadcrumbItemClickEvent>` (`{ originalEvent: Event; item: MenuItem }`), emitted after the item's `command`. PrimeVue and PrimeReact have no component events; use `MenuItem.command`.
- Templates/slots: PrimeNG `item` (`BreadcrumbItemTemplateContext` `{ $implicit: MenuItem }`), `separator`. PrimeVue `item` (`{ item, label, props: BreadcrumbRouterBindProps }`), `itemicon` (`{ item, class }`), `separator`. PrimeReact: per-item `MenuItem.template`.
- Methods: PrimeReact `getElement()`; none in PrimeNG/PrimeVue.
- Click handling: disabled items cancel the click; PrimeNG also cancels the default when the item has neither `url` nor `routerLink` (`primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`).

## 6. Usage guidance

- **Basic:** pass `home` (usually icon-only) and `model` for the trail (`primeng-21.1.9:apps/showcase/doc/breadcrumb/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/breadcrumb/BasicDoc.vue`, `primereact-10.9.9:components/doc/breadcrumb/basicdoc.js`).
- **Template:** replace item content and the separator. PrimeNG/PrimeVue use the `item` and `separator` templates/slots; PrimeReact sets `template` on items (`primeng-21.1.9:apps/showcase/doc/breadcrumb/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/breadcrumb/TemplateDoc.vue`, `primereact-10.9.9:components/doc/breadcrumb/templatedoc.js`).
- **Router:** PrimeNG binds `routerLink` on the items (active link gets `p-menuitem-link-active` via `routerLinkActive`); PrimeVue wraps item content in `<router-link custom>` inside the `item` slot; PrimeReact uses `url`/`template`/`command` for router or external links (`primeng-21.1.9:apps/showcase/doc/breadcrumb/router-doc.ts`, `primevue-4.5.5:apps/showcase/doc/breadcrumb/RouterDoc.vue`, `primereact-10.9.9:components/doc/breadcrumb/routerdoc.js`).
- **Styling (PrimeReact):** class-name reference section (`primereact-10.9.9:components/doc/breadcrumb/styledoc.js`).

## 7. Accessibility

- Docs (identical in all three): root is a `<nav>` that accepts `aria-label`/`aria-labelledby`; items sit in an ordered list; separators are hidden from screen readers; the link matching the current route gets `aria-current="page"`; no custom keyboard handling — links follow the tab sequence (`primeng-21.1.9:apps/showcase/doc/breadcrumb/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/breadcrumb/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/breadcrumb/accessibilitydoc.js`).
- Source vs docs:
  - PrimeVue sets `aria-current="page"` when `item.url` or `item.to` equals `window.location.pathname`; the separator icon has `aria-hidden="true"` (`primevue-4.5.5:packages/primevue/src/breadcrumb/BreadcrumbItem.vue`, `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.vue`).
  - PrimeReact sets `aria-current="page"` on URL match, `aria-disabled` on disabled items, `role="separator"` on separator `<li>` and `aria-hidden` on its icon (`primereact-10.9.9:components/lib/breadcrumb/BreadCrumb.js`).
  - PrimeNG sets `aria-label` on the home link from `homeAriaLabel`, but sets neither `aria-current` nor `aria-hidden` on separators; the active route is only marked with the CSS class `p-menuitem-link-active` (`primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-breadcrumb` (+ `p-component`), `p-breadcrumb-list`, `p-breadcrumb-home-item`, `p-breadcrumb-separator`, `p-breadcrumb-separator-icon` (PrimeVue class map), `p-breadcrumb-item` (+ `p-disabled`), `p-breadcrumb-item-link`, `p-breadcrumb-item-icon`, `p-breadcrumb-item-label` (`primeng-21.1.9:packages/primeng/src/breadcrumb/style/breadcrumbstyle.ts`, `primevue-4.5.5:packages/primevue/src/breadcrumb/style/BreadcrumbStyle.js`). The PrimeNG catalog lists no separator-icon class.
- PT keys: see Anatomy; PrimeNG global PT key `breadcrumb` (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`). PrimeVue PT context `BreadcrumbContext` `{ item, index }`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/breadcrumb/index.mjs`.
- Design tokens: `BreadcrumbDesignTokens` groups `root`, `item`, `separator` (`@primeuix/themes-2.0.3:types/breadcrumb/index.d.ts`); Aura `@primeuix/themes-2.0.3:dist/aura/breadcrumb/index.mjs`.
- PrimeReact: own CSS in `BreadCrumbBase.js`; classes `p-breadcrumb p-component`, `p-breadcrumb-list`, `p-breadcrumb-home p-menuitem`, `p-menuitem` (+ `p-disabled`), `p-menuitem-link`, `p-menuitem-icon`, `p-menuitem-text`, `p-menuitem-separator`, `p-breadcrumb-chevron` (`primereact-10.9.9:components/lib/breadcrumb/BreadCrumbBase.js`). Tokens N/A.

## 9. Relationships

- Embeds: ChevronRight icon (all), Home icon import (PrimeNG), Tooltip and Badge (PrimeNG, for `tooltip`/`badge` item fields).
- Uses the MenuItem model ([Menu](menu.md#menuitem-model)).
- Related: [Steps](steps.md) (sequential progress trail), [TabMenu](tabmenu.md) / Tabs (sibling navigation), [Menubar](menubar.md) (site navigation).

## 10. Dependencies

- PrimeNG: `@angular/router` (`Router`, `RouterLink`, `RouterLinkActive`, `RouterModule`), `primeng/api` (`MenuItem`, `PrimeTemplate`, `SharedModule`), `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`ChevronRightIcon`, `HomeIcon`), `primeng/tooltip` (`primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/icons/chevronright`, `@primeuix/styles/breadcrumb` (`primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../icons/chevronright`, `../utils/Utils` (`primereact-10.9.9:components/lib/breadcrumb/BreadCrumb.js`).
- External npm: none beyond the framework (PrimeNG requires `@angular/router`).

## 11. Framework differences

| Aspect                | PrimeNG                               | PrimeVue                    | PrimeReact                              |
| --------------------- | ------------------------------------- | --------------------------- | --------------------------------------- |
| Component name        | `Breadcrumb`                          | `Breadcrumb`                | `BreadCrumb`                            |
| Item click event      | `onItemClick`                         | none (`command`)            | none (`command`)                        |
| Separator customising | `#separator` template                 | `separator` slot            | `separatorIcon` prop                    |
| `aria-current`        | not set (CSS class only)              | URL / `to` match            | URL match                               |
| Separator ARIA        | none                                  | icon `aria-hidden`          | `role="separator"` + icon `aria-hidden` |
| Router                | `routerLink` fields, injects `Router` | `item` slot + `router-link` | `url` / `template` / `command`          |
| Class naming          | `p-breadcrumb-item*`                  | `p-breadcrumb-item*`        | `p-menuitem*`, `p-breadcrumb-chevron`   |
| Design tokens         | `@primeuix/themes`                    | `@primeuix/themes`          | N/A                                     |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/breadcrumb/breadcrumb.ts`
- `primeng-21.1.9:packages/primeng/src/breadcrumb/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/breadcrumb/style/breadcrumbstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/breadcrumb/breadcrumb.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/breadcrumb/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/breadcrumb/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/breadcrumb/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/breadcrumb/router-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/breadcrumb/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.vue`
- `primevue-4.5.5:packages/primevue/src/breadcrumb/BaseBreadcrumb.vue`
- `primevue-4.5.5:packages/primevue/src/breadcrumb/BreadcrumbItem.vue`
- `primevue-4.5.5:packages/primevue/src/breadcrumb/Breadcrumb.d.ts`
- `primevue-4.5.5:packages/primevue/src/breadcrumb/style/BreadcrumbStyle.js`
- `primevue-4.5.5:apps/showcase/doc/breadcrumb/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/breadcrumb/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/breadcrumb/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/breadcrumb/RouterDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/breadcrumb/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/breadcrumb/BreadCrumb.js`
- `primereact-10.9.9:components/lib/breadcrumb/BreadCrumbBase.js`
- `primereact-10.9.9:components/lib/breadcrumb/breadcrumb.d.ts`
- `primereact-10.9.9:components/doc/breadcrumb/importdoc.js`
- `primereact-10.9.9:components/doc/breadcrumb/basicdoc.js`
- `primereact-10.9.9:components/doc/breadcrumb/templatedoc.js`
- `primereact-10.9.9:components/doc/breadcrumb/routerdoc.js`
- `primereact-10.9.9:components/doc/breadcrumb/styledoc.js`
- `primereact-10.9.9:components/doc/breadcrumb/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/breadcrumb/index.mjs`
- `@primeuix/themes-2.0.3:types/breadcrumb/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/breadcrumb/index.mjs`
