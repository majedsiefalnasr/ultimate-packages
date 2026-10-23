# TabMenu

**Category:** Menu · **Frameworks:** PrimeVue 4.5.5 · PrimeReact 10.9.9 (PrimeNG 21.1.9 does not ship it)

## 1. Summary

TabMenu is a navigation bar that renders a `MenuItem[]` model as a row of tab headers with one active header and an animated ink bar under it. It has no content panels: the content of a tab is supplied by the application (typically a router outlet), and an item either links somewhere (`url`) or runs a `command`. PrimeVue ships it as `TabMenu` (index-based `activeIndex`, `tab-change` event) and PrimeReact as `TabMenu` (`activeIndex` plus `onTabChange`, custom item `template`). PrimeNG removed it in v20; the replacement is the [Tabs](tabs.md) family used without `p-tabpanels` (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primereact-10.9.9:components/lib/tabmenu/TabMenu.js`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`).

## 2. Names & status

- Canonical name: **TabMenu**. The showcase label for the nearest section is "Tab Menu" (`primevue-4.5.5:apps/showcase/pages/tabs/index.vue`). No other alias.
- **Replacement in Prime's own words:** "Use Tabs without panels." PrimeVue lists TabMenu under "Deprecated Components" in the v4 migration guide; PrimeNG lists it in the v19 deprecated list and in the v20 removal table with status `removed` (`primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`, `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`).
- Status per framework:
  - **PrimeNG 21.1.9: N/A — not shipped in primeng-21.1.9.** `packages/primeng/src/` has no `tabmenu` folder, the Prime catalog `docs/prime-reference/catalog/primeng.json` has no `tabmenu` module, and the Menu category of the showcase menu lists Breadcrumb, ContextMenu, Dock, Menu, Menubar, MegaMenu, PanelMenu, TieredMenu only (`primeng-21.1.9:packages/primeng/src/`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`). The only traces left are a "Tab Menu" demo section on the Tabs page, a stale comment in the `MenuItem` interface ("may not be utilized by the tabmenu component"), and theme presets that still ship tabmenu tokens (`primeng-21.1.9:apps/showcase/doc/tabs/tabmenu-doc.ts`, `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`, `primeng-21.1.9:packages/themes/src/presets/aura/tabmenu/index.ts`).
  - **PrimeVue 4.5.5: shipped, documented as deprecated but not marked in code.** `TabMenu.vue` has no `console.warn` and `TabMenu.d.ts` has no `@deprecated` tag, unlike the legacy `TabView`, which warns "Deprecated since v4. Use Tabs component instead." on creation (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.d.ts`, `primevue-4.5.5:packages/primevue/src/tabview/TabView.vue`). It has no showcase page of its own and no entry in the showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`).
  - **PrimeReact 10.9.9: shipped, current.** Listed as "TabMenu" in the Menu category of the showcase, with its own page and no deprecation note (`primereact-10.9.9:components/layout/menu.json`, `primereact-10.9.9:pages/tabmenu/index.js`).

## 3. Per framework

| Aspect        | PrimeNG                                                     | PrimeVue                                                                                                                                   | PrimeReact                                                                                |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Import        | N/A — not shipped in primeng-21.1.9                         | `import TabMenu from 'primevue/tabmenu'` (export map `./tabmenu` → `TabMenu.vue`); root index also re-exports `TabMenu` and `TabMenuStyle` | `import { TabMenu } from 'primereact/tabmenu'`                                            |
| Tag           | N/A (use `<p-tabs>` + `<p-tablist>` + `<p-tab>`, no panels) | `<TabMenu>`                                                                                                                                | `<TabMenu>`                                                                               |
| Source        | N/A                                                         | `packages/primevue/src/tabmenu/` (`TabMenu.vue`, `BaseTabMenu.vue`, `TabMenu.d.ts`, `style/TabMenuStyle.js`, `style/TabMenuStyle.d.ts`)    | `components/lib/tabmenu/` (`TabMenu.js`, `TabMenuBase.js`, `tabmenu.d.ts`)                |
| Component     | N/A                                                         | Options-API SFC, `inheritAttrs: false`, `extends: BaseTabMenu`                                                                             | `React.memo(React.forwardRef(...))`; imperative handle exposes `props` and `getElement()` |
| Sub-parts     | N/A                                                         | none exported; internals inline (`li` per item, ink bar `li`)                                                                              | none exported; internals inline                                                           |
| Global PT key | N/A                                                         | `tabmenu` (`PrimeVuePTOptions`)                                                                                                            | `tabmenu` (`PrimeReactPTOptions`)                                                         |
| Catalog       | no module                                                   | modules `tabmenu` (props, slots, emits, PT types) and `tabmenustyle` (`TabMenuClasses`)                                                    | module `tabmenu` (component `TabMenu`, event `TabMenuTabChangeEvent`)                     |

Sources: `primevue-4.5.5:packages/primevue/package.json`, `primevue-4.5.5:packages/primevue/src/index.js`, `primevue-4.5.5:packages/primevue/src/tabmenu/package.json`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, `primereact-10.9.9:components/doc/tabmenu/importdoc.js`, `primereact-10.9.9:components/lib/primereact.all.js`, `primereact-10.9.9:components/lib/tabmenu/package.json`, `primereact-10.9.9:components/lib/api/api.d.ts`.

## 4. Anatomy

Both implementations render the same shape: a root `div` wrapping a `ul` that holds one `li` per visible item and, last, an extra `li` for the ink bar. Each item `li` wraps an `a` (the "link") that contains an optional icon and a label.

| Part    | Element                                  | PrimeVue PT key / class                                             | PrimeReact PT key / class                                    |
| ------- | ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Root    | `div`                                    | `root` / `p-tabmenu p-component`                                    | `root` / `p-tabmenu p-component`                             |
| List    | `ul` (`role="menubar"`)                  | `tablist` / `p-tabmenu-tablist`                                     | `menu` / `p-tabmenu-nav p-reset`                             |
| Item    | `li` (`role="presentation"`)             | `item` / `p-tabmenu-item` (+ `p-tabmenu-item-active`, `p-disabled`) | `menuitem` / `p-tabmenuitem` (+ `p-highlight`, `p-disabled`) |
| Link    | `a` (`role="menuitem"`)                  | `itemLink` / `p-tabmenu-item-link`                                  | `action` / `p-menuitem-link`                                 |
| Icon    | `span` (or custom icon slot / element)   | `itemIcon` / `p-tabmenu-item-icon`                                  | `icon` / `p-menuitem-icon`                                   |
| Label   | `span`                                   | `itemLabel` / `p-tabmenu-item-label`                                | `label` / `p-menuitem-text`                                  |
| Ink bar | `li` (`role="none"`), last child of list | `activeBar` / `p-tabmenu-active-bar`                                | `inkbar` / `p-tabmenu-ink-bar`                               |

- PT items receive a context `{ item, index }` in both frameworks; PrimeReact additionally passes `parent` metadata (`props`, `state`) (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primereact-10.9.9:components/lib/tabmenu/TabMenu.js`).
- With the PrimeVue `item` slot or the PrimeReact `template`, the default link/icon/label markup is replaced; the `li` and the ink bar stay.
- The ink bar is positioned by script: after every update the active item's width and left offset (relative to the list) are written to the bar's inline style, or zeroed when no item is active. PrimeReact's structural CSS hides the bar (`display: none`) and relies on the theme CSS to show it (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primereact-10.9.9:components/lib/tabmenu/TabMenuBase.js`).
- Hidden items (`visible` false) are not rendered at all, so they leave no `li`.

## 5. API highlights

**Props**

| Prop                                   | PrimeVue                                           | PrimeReact                                                                          |
| -------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `model`                                | `MenuItem[]`, default `null`                       | `MenuItem[]`, default `null`; the component renders `null` when it is not set       |
| `activeIndex`                          | `number` = `0`; also used as `v-model:activeIndex` | `number` = `0`                                                                      |
| `ariaLabel`                            | `string`, default `null`                           | default `null` in `TabMenuBase`, but not declared in `tabmenu.d.ts` or the catalog  |
| `ariaLabelledby`                       | `string`, default `null`                           | spelled `ariaLabelledBy` (capital B), default `null`, also missing from the typings |
| `id`, `style`, `className`, `children` | N/A (use attrs / `class` on root)                  | defaults `null`; `children` is `undefined` and unused                               |
| `pt`, `ptOptions`, `unstyled`, `dt`    | `pt`, `ptOptions`, `unstyled = false`, `dt`        | `pt`, `ptOptions`, `unstyled = false`; `dt` N/A                                     |

**Events and methods**

- PrimeVue: `tab-change` with `TabMenuChangeEvent { originalEvent: Event; index: number }`, and `update:activeIndex` (number) for `v-model:activeIndex`. The type file documents only `tab-change`; `update:activeIndex` appears only in `emits` of the SFC (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.d.ts`, `primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`).
- PrimeReact: `onTabChange(event: TabMenuTabChangeEvent)` with `{ originalEvent: React.SyntheticEvent; value: MenuItem; index: number }`; method `getElement(): HTMLDivElement | null` (`primereact-10.9.9:components/lib/tabmenu/tabmenu.d.ts`).
- Click behavior (both): a disabled item gets `preventDefault` and nothing else happens; otherwise the item's `command({ originalEvent, item })` runs first, then the active index changes, then the change event fires. PrimeVue emits `tab-change` on every click, even on the already-active item, while `update:activeIndex` only fires when the index actually changes. PrimeReact calls `onTabChange` when provided and otherwise stores the index internally (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primereact-10.9.9:components/lib/tabmenu/TabMenu.js`).
- PrimeReact is **controlled as soon as `onTabChange` is passed**: the active index then comes from the `activeIndex` prop only, so omitting the prop update freezes the highlight. PrimeVue keeps `d_activeIndex` internally, seeded from the prop and re-synced by a watcher whenever the prop changes.
- PrimeReact additionally calls `preventDefault` and `stopPropagation` on clicks of items without a `url`; items with a `url` navigate natively, and items without one still render `href="#"`.

**Slots / templates**

- PrimeVue slot `item`, scope `{ item, index, active, label, props: { action, icon, label } }`, where each `props` entry is a ready attribute object to spread on your own elements (class, `tabindex: -1`, click and keydown handlers, PT bindings); slot `itemicon`, scope `{ item, class }` (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.d.ts`).
- PrimeReact per-item `template: ReactNode | (item, options) => ReactNode` on the `MenuItem`; `options` carries `onClick`, `className` (`p-menuitem-link`), `labelClassName` (`p-menuitem-text`), `iconClassName`, `element` (the default content), `props`, `active`, `index` and `disabled`. There is no component-level template prop (`primereact-10.9.9:components/lib/tabmenu/TabMenu.js`, `primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`).

**MenuItem fields actually used** (see the shared model in [Menu](menu.md#menuitem-model)):

- PrimeVue: `label` (string or function), `icon`, `url`, `target`, `command`, `disabled` (boolean or function), `visible` (boolean or function), `class`. `items`, `separator`, `style` and `key` are ignored; the Vue `:key` is the label plus index (`primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`).
- PrimeReact: `id` (used as key), `label`, `icon`, `url` (default `#`), `target`, `command`, `disabled` (boolean only), `visible` (only `false` hides), `style`, `className`, `template`. `items` and `separator` are ignored (`primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`).

Full API: catalog modules `tabmenu` / `tabmenustyle` (PrimeVue) and `tabmenu` (PrimeReact) in `docs/prime-reference/catalog/`.

## 6. Usage guidance

PrimeVue and PrimeNG have no TabMenu page. Their only trace is the "Tab Menu" section of the Tabs page; PrimeReact documents the real component.

- **Tab Menu section (PrimeNG, PrimeVue):** the replacement pattern is a `Tabs` container with a `TabList` and `Tab` children but no `TabPanels`, where a router outlet below supplies the content. The demos give each `Tab` a route-like `value` and render icon plus label inside it; the PrimeVue code variant wraps the content in a `router-link` anchor. The outlet itself is deliberately left out of the demo (`primeng-21.1.9:apps/showcase/doc/tabs/tabmenu-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/TabMenuDoc.vue`).
- **Import (PrimeReact):** a single named import from `primereact/tabmenu` (`primereact-10.9.9:components/doc/tabmenu/importdoc.js`).
- **Basic (PrimeReact):** pass a `model` of items with `label` and `icon`. The description text says "Steps requires a collection of menuitems", a copy-paste leftover from the Steps page (`primereact-10.9.9:components/doc/tabmenu/basicdoc.js`).
- **Controlled (PrimeReact):** bind `activeIndex` and update it from `onTabChange`; the demo drives it from external buttons as well (`primereact-10.9.9:components/doc/tabmenu/controlleddoc.js`).
- **Template (PrimeReact):** give each item a `template` function to draw a custom header (an avatar plus name in the demo); because the template replaces the link, it has to call the state setter itself to move the highlight, and the component is kept controlled with `activeIndex` / `onTabChange` (`primereact-10.9.9:components/doc/tabmenu/templatedoc.js`).
- **Command (PrimeReact):** `command` callbacks run on click; the demo shows a Toast, which therefore needs a `Toast` element with a ref on the page (`primereact-10.9.9:components/doc/tabmenu/commanddoc.js`).
- **Router (PrimeReact):** navigation is done either with `url` (internal or external), or with `command` calling the router programmatically (`primereact-10.9.9:components/doc/tabmenu/routerdoc.js`).
- **Accessibility, Style and Tailwind (PrimeReact):** see sections 7 and 8 (`primereact-10.9.9:components/doc/tabmenu/accessibilitydoc.js`, `primereact-10.9.9:components/doc/tabmenu/styledoc.js`, `primereact-10.9.9:components/doc/tabmenu/theming/styleddoc.js`, `primereact-10.9.9:components/doc/tabmenu/theming/tailwinddoc.js`).
- Services/providers: none are required by the component itself. PrimeVue and PrimeReact need their usual theme or style setup; routing integration is the application's job.

## 7. Accessibility

- **Roles and attributes (identical structure in both):** the list is `role="menubar"` and takes `aria-label` or `aria-labelledby`; each item `li` is `role="presentation"`; each link is `role="menuitem"` with `aria-label` set to the item label and `aria-disabled` when disabled; the ink bar `li` is `role="none"`. PrimeReact also puts `aria-disabled` on the `li` and `data-p-highlight` on the active `li`; PrimeVue uses `data-p-active` and `data-p-disabled` (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primereact-10.9.9:components/lib/tabmenu/TabMenu.js`).
- **Not tabs semantics:** despite the visual, there is no `role="tab"`, `aria-selected` or `aria-controls`; the active item is conveyed only through classes and `data-*` attributes. This is the opposite of the [Tabs](tabs.md) replacement, which uses `tablist` / `tab` / `tabpanel` roles.
- **Roving tabindex:** links start at `tabindex="-1"`; the active link is the tab stop (`0`). PrimeVue sets this once in `mounted` and PrimeReact computes it per render (`active ? '0' : '-1'`). Arrow/Home/End move the stop to the newly focused link.
- **Keyboard (from source, both frameworks):** Right Arrow / Left Arrow move focus to the next / previous enabled item without wrapping at either end; Home / End move to the first / last enabled item; Enter, Space and NumpadEnter activate the focused item (running `command` and changing the active item); Tab leaves the component and, if focus was moved off the active link, restores the tab stop to it. Moving focus does not activate (there is no select-on-focus option) (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primereact-10.9.9:components/lib/tabmenu/TabMenu.js`).
- **Source observation:** the `Tab` key handler reads `activeItem.children[0]` before it checks `activeItem`, and the lookup only matches an item that is enabled and active; with no matching item (for example an `activeIndex` out of range, or an active item that is disabled) pressing Tab inside the menu would throw in both frameworks. This is a reading of the code, not a verified run.
- **Keyboard docs:** PrimeReact documents the keys above, and its table matches the source for Home (first) and End (last), unlike the Tabs docs (`primereact-10.9.9:components/doc/tabmenu/accessibilitydoc.js`). PrimeVue has no TabMenu accessibility doc; the accessibility section of its Tabs page describes the Tabs components instead.

## 8. Theming

- **Style classes (PrimeVue `TabMenuClasses` and class map):** `p-tabmenu` (+ `p-component`), `p-tabmenu-tablist`, `p-tabmenu-item` (+ `p-tabmenu-item-active`, `p-disabled`), `p-tabmenu-item-link`, `p-tabmenu-item-icon`, `p-tabmenu-item-label`, `p-tabmenu-active-bar` (`primevue-4.5.5:packages/primevue/src/tabmenu/style/TabMenuStyle.js`, `primevue-4.5.5:packages/primevue/src/tabmenu/style/TabMenuStyle.d.ts`).
  - **Doc/source mismatch:** the `TabMenuClasses` enum (and thus the catalog) names the last member `inkbar = 'p-tabmenu-ink-bar'`, but the component renders `p-tabmenu-active-bar` (key `activeBar`) and the shared CSS styles `.p-tabmenu-active-bar`. `p-tabmenu-ink-bar` is the PrimeReact name. The enum also omits the modifier classes `p-tabmenu-item-active` and `p-disabled` (`primevue-4.5.5:packages/primevue/src/tabmenu/style/TabMenuStyle.d.ts`, `primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`).
- **PT sections:** PrimeVue `root`, `tablist`, `item`, `itemLink`, `itemIcon`, `itemLabel`, `activeBar`, `hooks`; PrimeReact `root`, `menu`, `menuitem`, `action`, `icon`, `label`, `inkbar`, `hooks` (`primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.d.ts`, `primereact-10.9.9:components/lib/tabmenu/tabmenu.d.ts`).
- **Structural CSS (PrimeVue):** `@primeuix/styles-2.0.3:dist/tabmenu/index.mjs` — scrollable root (`overflow-x: auto`, scrollbar hidden), flex list with a bottom border, link with focus ring, hover rules limited to items that are neither active nor disabled, and an absolutely positioned bar with a 250 ms transition (`@primeuix/styles-2.0.3:dist/tabmenu/index.mjs`).
- **Design tokens:** `TabmenuDesignTokens` in `@primeuix/themes-2.0.3:types/tabmenu/index.d.ts` has five groups:
  - `root` (`transitionDuration`);
  - `tablist` (`borderWidth`, `background`, `borderColor`);
  - `item` (`background`, `borderWidth`, `borderColor`, `color`, `padding`, `fontWeight`, `margin`, `gap`, hover and active variants of background / border color / color, and `focusRing` with `width`, `style`, `color`, `offset`, `shadow`);
  - `itemIcon` (`color`, `hoverColor`, `activeColor`);
  - `activeBar` (`height`, `bottom`, `background`).
    Presets `aura`, `lara`, `material` and `nora` each ship a `tabmenu` module; Aura sets item padding `1rem 1.125rem`, font weight `600`, a `-1px` bottom margin, gap `0.5rem`, and a 1px active bar in the primary color (`@primeuix/themes-2.0.3:dist/aura/tabmenu/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/tabmenu/index.mjs`, `@primeuix/themes-2.0.3:dist/material/tabmenu/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/tabmenu/index.mjs`). The tokens still exist in the 2.0.3 package although PrimeNG no longer ships the component.
- **PrimeReact:** no `@primeuix`; tokens N/A. Own structural CSS lives in `TabMenuBase.js` (`@layer primereact`: scrollable root, flex `p-tabmenu-nav`, hidden `p-tabmenu-ink-bar`). Visual styling comes from the bundled theme stylesheets, whose selectors are nested (`.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link`, `.p-highlight`); the ink bar is styled in 8 of the bundled theme files (`primereact-10.9.9:components/lib/tabmenu/TabMenuBase.js`, `primereact-10.9.9:public/themes/lara-light-amber/theme.css`, `primereact-10.9.9:public/themes/`). Its style doc lists `p-tabmenu`, `p-tabmenu-nav`, `p-tabmenuitem`, `p-menuitem-link`, `p-menuitem-text`, `p-menuitem-icon`, and the Tailwind doc shows unstyled-mode PT (`primereact-10.9.9:components/doc/tabmenu/styledoc.js`, `primereact-10.9.9:components/doc/tabmenu/theming/tailwinddoc.js`).

## 9. Relationships

- **Replaced by:** [Tabs](tabs.md) used without `TabPanels` (PrimeNG, PrimeVue). It is the cross-category link between Menu and Panel: the Tabs record covers the same pattern and notes that TabMenu is the preferred choice when items come from a menu model.
- **Embeds:** Ripple (PrimeVue `v-ripple` directive on the link, PrimeReact `<Ripple />`). No overlay, tooltip or badge support, unlike [Breadcrumb](breadcrumb.md) in PrimeNG.
- **Uses:** the shared `MenuItem` model documented in [Menu](menu.md#menuitem-model).
- **Related / alternatives:** [Steps](steps.md) (the sibling retired the same way, replaced by Stepper without panels), [Menubar](menubar.md) (also `role="menubar"`, for site navigation), [PanelMenu](panelmenu.md) (vertical), [Breadcrumb](breadcrumb.md), [Tabs](tabs.md) (TabView in PrimeReact).
- **Embedded by:** none in the three source trees.

## 10. Dependencies

- PrimeVue: `@primevue/core/basecomponent` (`BaseComponent`), `primevue/tabmenu/style` (extends `@primevue/core/base/style` `BaseStyle`), `@primeuix/styles/tabmenu`, `primevue/ripple`, `vue` (`mergeProps`), and `@primeuix/utils/dom` (`getAttribute`, `find`, `findSingle`, `getWidth`, `getOffset`). `getAttribute` there converts numeric-looking and `"true"`/`"false"` attribute values to numbers and booleans, which the keyboard code relies on (`primevue-4.5.5:packages/primevue/src/tabmenu/BaseTabMenu.vue`, `primevue-4.5.5:packages/primevue/src/tabmenu/TabMenu.vue`, `primevue-4.5.5:packages/primevue/src/tabmenu/style/TabMenuStyle.js`, `@primeuix/utils-0.7.2:dist/dom/index.mjs`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`, `ComponentBase`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../ripple/Ripple`, `../utils/Utils` (`DomHandler`, `IconUtils`, `ObjectUtils`, `UniqueComponentId`, `classNames`) (`primereact-10.9.9:components/lib/tabmenu/TabMenu.js`, `primereact-10.9.9:components/lib/utils/DomHandler.js`).
- External npm: none beyond the framework (`vue`, `react`).

## 11. Framework differences

| Aspect                           | PrimeNG                                                 | PrimeVue                                                                   | PrimeReact                                                                               |
| -------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Availability                     | Removed in v20; Tabs without panels                     | Shipped, documented as deprecated, no runtime warning                      | Shipped, current                                                                         |
| Showcase                         | "Tab Menu" section on the Tabs page                     | Same section on the Tabs page; not in the menu                             | Own page in the Menu category                                                            |
| Active-state API                 | N/A                                                     | `activeIndex` (+ `v-model:activeIndex`), internal copy                     | `activeIndex`; controlled once `onTabChange` is set                                      |
| Change event                     | N/A                                                     | `tab-change` `{ originalEvent, index }`                                    | `onTabChange` `{ originalEvent, value, index }`                                          |
| Custom item render               | N/A                                                     | slots `item` (with bind props) and `itemicon`                              | per-item `template(item, options)`                                                       |
| `label` / `disabled` / `visible` | N/A                                                     | value or function                                                          | `label` string; `disabled` boolean; only `visible: false` hides                          |
| Item `style` / `className`       | N/A                                                     | `class` only                                                               | `style` and `className`                                                                  |
| Aria label props                 | N/A                                                     | `ariaLabel`, `ariaLabelledby`                                              | `ariaLabel`, `ariaLabelledBy` at runtime, absent from the typings                        |
| Click on plain item              | N/A                                                     | native (no `preventDefault`) so `url` works                                | `preventDefault` + `stopPropagation` when no `url`; `href="#"`                           |
| Class names                      | N/A                                                     | `p-tabmenu-item`, `-item-link`, `-item-icon`, `-item-label`, `-active-bar` | `p-tabmenuitem`, `p-menuitem-link`, `-icon`, `-text`, `p-highlight`, `p-tabmenu-ink-bar` |
| Theming                          | tokens remain in `@primeuix/themes` and PrimeNG presets | `@primeuix/styles` + `tabmenu` design tokens, `dt` prop                    | own CSS in `TabMenuBase.js` plus theme.css files; tokens N/A                             |
| Imperative API                   | N/A                                                     | none documented                                                            | `getElement()`                                                                           |

## 12. Sources

- `primevue-4.5.5:packages/primevue/src/tabmenu/` (`TabMenu.vue`, `BaseTabMenu.vue`, `TabMenu.d.ts`, `package.json`, `style/TabMenuStyle.js`, `style/TabMenuStyle.d.ts`)
- `primevue-4.5.5:packages/primevue/package.json`, `primevue-4.5.5:packages/primevue/src/index.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, `primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`, `primevue-4.5.5:packages/primevue/src/tabview/TabView.vue`
- `primevue-4.5.5:apps/showcase/doc/tabs/TabMenuDoc.vue`, `primevue-4.5.5:apps/showcase/pages/tabs/index.vue`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`
- `primereact-10.9.9:components/lib/tabmenu/` (`TabMenu.js`, `TabMenuBase.js`, `tabmenu.d.ts`, `package.json`), `primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/primereact.all.js`, `primereact-10.9.9:components/lib/utils/DomHandler.js`
- `primereact-10.9.9:components/doc/tabmenu/` (`importdoc.js`, `basicdoc.js`, `controlleddoc.js`, `templatedoc.js`, `commanddoc.js`, `routerdoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`, `pt/wireframe.js`), `primereact-10.9.9:pages/tabmenu/index.js`, `primereact-10.9.9:components/layout/menu.json`, `primereact-10.9.9:public/themes/lara-light-amber/theme.css`
- `primeng-21.1.9:apps/showcase/doc/tabs/tabmenu-doc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`, `primeng-21.1.9:packages/themes/src/presets/aura/tabmenu/index.ts`
- `@primeuix/styles-2.0.3:dist/tabmenu/index.mjs`, `@primeuix/themes-2.0.3:types/tabmenu/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/tabmenu/index.mjs`, `@primeuix/utils-0.7.2:dist/dom/index.mjs`
