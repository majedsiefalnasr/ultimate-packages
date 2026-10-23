# Tabs

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Tabs is a tabbed container: a row of tab headers of which exactly one is active, and a content area that shows the panel belonging to that header. PrimeNG and PrimeVue split it into five cooperating parts (Tabs, TabList, Tab, TabPanels, TabPanel) and link a tab to its panel through a shared `value`; the list can scroll with navigator buttons and an animated ink bar marks the active tab. PrimeReact has no such family: it ships only the older index-based `TabView` with `TabPanel` children, which adds closable tabs and header templates (`primeng-21.1.9:packages/primeng/src/tabs/tabs.ts`, `primevue-4.5.5:packages/primevue/src/tabs/Tabs.vue`, `primereact-10.9.9:components/lib/tabview/TabView.js`).

## 2. Names & status

- Canonical name: **Tabs**, with sub-components **TabList**, **Tab**, **TabPanels**, **TabPanel** (PrimeNG, PrimeVue). The project glossary names the concept "Tabs" and says to avoid "TabView".
- Legacy alias **TabView**:
  - PrimeVue: still shipped in `primevue/tabview` but deprecated since v4 ("Use Tabs component instead"); it logs a console warning when mounted. It scans its default slot for `TabPanel` children (header text, header classes and so on live on `TabPanel` as legacy props) and renders them with its own `p-tabview-*` markup (`primevue-4.5.5:packages/primevue/src/tabview/TabView.d.ts`, `primevue-4.5.5:packages/primevue/src/tabview/TabView.vue`, `primevue-4.5.5:packages/primevue/src/tabview/BaseTabView.vue`).
  - PrimeNG: TabView was deprecated in v19 ("Use the new Tabs components") and removed in v20; no `tabview` folder exists in 21.1.9 (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`).
  - PrimeReact: `TabView` is the only, current, non-deprecated component; its `TabPanel` is a marker child that renders nothing by itself (`primereact-10.9.9:components/lib/tabview/TabView.js`).
- PrimeVue `TabPanel` carries a set of props that only `TabView` honors (`header`, `headerStyle`, `headerClass`, `headerProps`, `headerActionProps`, `contentStyle`, `contentClass`, `contentProps`, `disabled`), each marked deprecated since v4 (`primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.d.ts`, `primevue-4.5.5:packages/primevue/src/tabpanel/BaseTabPanel.vue`).
- PrimeNG selectors: `p-tabs`, `p-tablist`, `p-tab`, `p-tabpanels`, `p-tabpanel` (`primeng-21.1.9:packages/primeng/src/tabs/tabs.ts`, `primeng-21.1.9:packages/primeng/src/tabs/tab.ts`).
- Listed in the Panel group of every showcase menu (PrimeNG and PrimeVue as "Tabs", PrimeReact as "TabView"), with a separate "TabMenu" entry in the Menu category of PrimeVue and PrimeReact (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                           | PrimeVue                                                                                                                                          | PrimeReact                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Import         | `import { TabsModule } from 'primeng/tabs'` (all five parts are standalone)                                                                                       | `import Tabs from 'primevue/tabs'`, plus `primevue/tablist`, `primevue/tab`, `primevue/tabpanels`, `primevue/tabpanel`; legacy `primevue/tabview` | `import { TabView, TabPanel } from 'primereact/tabview'`              |
| Selector / tag | `<p-tabs>`, `<p-tablist>`, `<p-tab>`, `<p-tabpanels>`, `<p-tabpanel>`                                                                                             | `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanels>`, `<TabPanel>`                                                                                       | `<TabView>`, `<TabPanel>`                                             |
| Source         | `packages/primeng/src/tabs/` with one file per part (`tabs.ts`, `tablist.ts`, `tab.ts`, `tabpanels.ts`, `tabpanel.ts`), `style/` per part, types in `types/tabs/` | one folder per part: `tabs/`, `tablist/`, `tab/`, `tabpanels/`, `tabpanel/`, legacy `tabview/`                                                    | `components/lib/tabview/TabView.js`, `TabViewBase.js`, `tabview.d.ts` |
| Base class     | `BaseComponent<…PassThrough>` per part, each with a parent-instance token; all use the `Bind` host directive (Tab also `Ripple`)                                  | `BaseComponent` via `BaseTabs`, `BaseTabList`, `BaseTab`, `BaseTabPanels`, `BaseTabPanel`, `BaseTabView`                                          | `ComponentBase.extend` (`TabViewBase`, `TabPanelBase`)                |
| Exports        | `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`, `TabsModule`, `TabsStyle` and the other style classes; `tabs.module.ts` itself carries no catalog members      | one default export per package                                                                                                                    | `TabView`, `TabPanel` (marker component)                              |
| Catalog        | modules `tabs`, `tablist`, `tab`, `tabpanels`, `tabpanel` (each with components and style; only `tabs` also lists types)                                          | modules `tabs`, `tablist`, `tab`, `tabpanels`, `tabpanel`, `tabview` plus style modules                                                           | module `tabview`                                                      |

Sources: `primeng-21.1.9:apps/showcase/doc/tabs/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/tabs/public_api.ts`, `primeng-21.1.9:packages/primeng/src/tabs/tabs.module.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/tabs/package.json`, `primereact-10.9.9:components/doc/tabview/importdoc.js`, `primereact-10.9.9:components/lib/tabview/TabViewBase.js`.

## 4. Anatomy

PrimeNG / PrimeVue (value-based structure):

| Part        | Element                                                         | PT key (component.key) | Class                                        |
| ----------- | --------------------------------------------------------------- | ---------------------- | -------------------------------------------- |
| Root        | `p-tabs` host / `div`                                           | `Tabs.root`            | `p-tabs p-component`, `p-tabs-scrollable`    |
| List        | `p-tablist` host / `div`                                        | `TabList.root`         | `p-tablist`                                  |
| Prev button | `button` (only when scrollable and not at the start)            | `TabList.prevButton`   | `p-tablist-prev-button p-tablist-nav-button` |
| Viewport    | `div` that scrolls horizontally                                 | `TabList.content`      | `p-tablist-content p-tablist-viewport`       |
| Tab strip   | `div` with `role="tablist"`                                     | `TabList.tabList`      | `p-tablist-tab-list`                         |
| Tab         | `p-tab` host with `role="tab"` / `as` (default `button`)        | `Tab.root`             | `p-tab`, `p-tab-active`, `p-disabled`        |
| Ink bar     | `span` with `role="presentation"` (`aria-hidden` in PrimeVue)   | `TabList.activeBar`    | `p-tablist-active-bar`                       |
| Next button | `button` (only when scrollable and not at the end)              | `TabList.nextButton`   | `p-tablist-next-button p-tablist-nav-button` |
| Panel group | `p-tabpanels` host / `div` with `role="presentation"`           | `TabPanels.root`       | `p-tabpanels`                                |
| Panel       | `p-tabpanel` host / `as` (default `div`) with `role="tabpanel"` | `TabPanel.root`        | `p-tabpanel`, `p-tabpanel-active`            |

- PrimeVue adds PT keys `prevIcon` and `nextIcon` for the default chevron icons inside the navigator buttons; PrimeNG exposes only the keys listed above in its PT types (`primevue-4.5.5:packages/primevue/src/tablist/TabList.d.ts`, `primeng-21.1.9:packages/primeng/src/types/tabs/tabs.types.ts`).
- The `Tab` elements are placed by the user inside `TabList`; the ink bar is appended after them by `TabList` itself, so a keyboard walk over siblings has to skip it (PrimeNG skips elements with `data-pc-section="activebar"`) (`primeng-21.1.9:packages/primeng/src/tabs/tablist.ts`, `primeng-21.1.9:packages/primeng/src/tabs/tab.ts`).
- Panels are siblings of the list, not children of it: `TabPanels` wraps the panels, `Tabs` wraps list and panels. The value on `Tab` and `TabPanel` is the only link between them (`primeng-21.1.9:packages/primeng/src/tabs/tabpanel.ts`, `primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.vue`).

PrimeReact `TabView` (index-based, legacy structure; PrimeVue `TabView` follows the same idea with `p-tabview-*` class names):

| Part            | Element                         | PT key                     | Class                                                                   |
| --------------- | ------------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| Root            | `div`                           | `root`                     | `p-tabview p-component`, `p-tabview-scrollable`                         |
| Nav container   | `div`                           | `navContainer` (d.ts)      | `p-tabview-nav-container`                                               |
| Prev / next     | `button`                        | `prevButton`, `nextButton` | `p-tabview-nav-prev` / `p-tabview-nav-next`, `p-tabview-nav-btn p-link` |
| Nav content     | `div`                           | `navContent`               | `p-tabview-nav-content`                                                 |
| Nav             | `ul` with `role="tablist"`      | `nav`                      | `p-tabview-nav`                                                         |
| Header          | `li` with `role="presentation"` | `tab.header`               | `p-tabview-selected p-highlight`, `p-disabled`                          |
| Header action   | `a` with `role="tab"`           | `tab.headerAction`         | `p-tabview-nav-link`                                                    |
| Title           | `span`                          | `tab.headerTitle`          | `p-tabview-title`                                                       |
| Close icon      | icon with `tabIndex` 0          | —                          | `p-tabview-close`                                                       |
| Ink bar         | `li` with `role="presentation"` | `inkbar`                   | `p-tabview-ink-bar`                                                     |
| Panel container | `div`                           | `panelContainer`           | `p-tabview-panels`                                                      |
| Panel           | `div` with `role="tabpanel"`    | `tab.content`              | `p-tabview-panel`                                                       |

- Source and typings disagree on PT key spelling: the typings document camelCase keys (`navContainer`, `panelContainer`) while the component calls use lowercase names (`navcontainer`, `panelcontainer`, `headeraction`, `headertitle`) (`primereact-10.9.9:components/lib/tabview/tabview.d.ts`, `primereact-10.9.9:components/lib/tabview/TabView.js`).
- PrimeVue `TabView` classes: `p-tabview`, `p-tabview-tablist-container`, `p-tabview-tablist-scroll-container`, `p-tabview-tablist`, `p-tabview-tablist-item` (+ `-active`), `p-tabview-tab-header`, `p-tabview-tab-title`, `p-tabview-panels`, `p-tabview-panel`, `p-tabview-ink-bar`, `p-tabview-prev-button`, `p-tabview-next-button` (`primevue-4.5.5:packages/primevue/src/tabview/style/TabViewStyle.js`).
- Class definitions per part: `primeng-21.1.9:packages/primeng/src/tabs/style/tabsstyle.ts`, `primeng-21.1.9:packages/primeng/src/tabs/style/tabliststyle.ts`, `primeng-21.1.9:packages/primeng/src/tabs/style/tabstyle.ts`, `primeng-21.1.9:packages/primeng/src/tabs/style/tabpanelstyle.ts`, `primeng-21.1.9:packages/primeng/src/tabs/style/tabpanelsstyle.ts`, `primevue-4.5.5:packages/primevue/src/tabs/style/TabsStyle.js`, `primevue-4.5.5:packages/primevue/src/tablist/style/TabListStyle.js`, `primevue-4.5.5:packages/primevue/src/tab/style/TabStyle.js`, `primevue-4.5.5:packages/primevue/src/tabpanel/style/TabPanelStyle.js`, `primevue-4.5.5:packages/primevue/src/tabpanels/style/TabPanelsStyle.js`.
- Catalog quirk: the PrimeNG `TabsClasses` enum lists `p-tabs-panel` for the panel, but the class actually applied by the panel style is `p-tabpanel` (`primeng-21.1.9:packages/primeng/src/tabs/style/tabsstyle.ts`, `primeng-21.1.9:packages/primeng/src/tabs/style/tabpanelstyle.ts`).

## 5. API highlights

Tabs (container):

| Member            | PrimeNG                                                                        | PrimeVue                                                             | PrimeReact (`TabView`)                                                     |
| ----------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Active state      | `value: ModelSignal<string \| number \| undefined>` = `undefined`, `[(value)]` | `value: string \| number`, `v-model:value`                           | `activeIndex: number` = `0` (index-based)                                  |
| Scrolling         | `scrollable = false`, `showNavigators = true`                                  | `scrollable: Boolean = false`, `showNavigators: Boolean = true`      | `scrollable: boolean = false` (buttons always follow it)                   |
| Lazy content      | `lazy = false` (also per panel)                                                | `lazy: Boolean = false`                                              | `renderActiveOnly = true` (render only the selected panel)                 |
| Activate on focus | `selectOnFocus = false`                                                        | `selectOnFocus: Boolean = false`                                     | —                                                                          |
| Tab stop          | `tabindex = 0`                                                                 | `tabindex: Number = 0`                                               | fixed (active header 0, others −1)                                         |
| Custom icons      | templates `previcon`, `nexticon`                                               | slots `previcon`, `nexticon` (declared on Tabs, rendered by TabList) | per panel `prevButton`, `nextButton`, `leftIcon`, `rightIcon`, `closeIcon` |
| Events            | `valueChange` (model)                                                          | `update:value`                                                       | `onTabChange`, `onTabClose`, `onBeforeTabChange`, `onBeforeTabClose`       |
| Methods           | `updateValue(value)`                                                           | —                                                                    | `reset()`, `getElement()`                                                  |

Parts:

- **Tab** — `value` (required in practice), `disabled = false`. PrimeVue adds `as = 'BUTTON'`, `asChild = false`; with `asChild` the default slot receives `{ class, active, a11yAttrs, onClick, dataP }` so you can render your own header (`primeng-21.1.9:packages/primeng/src/tabs/tab.ts`, `primevue-4.5.5:packages/primevue/src/tab/BaseTab.vue`, `primevue-4.5.5:packages/primevue/src/tab/Tab.vue`).
- **TabList** — no inputs; it owns the navigator buttons, the scroll handling and the ink bar. PrimeVue scrolls by 80% of the visible width; both frameworks react to resize and RTL (`primeng-21.1.9:packages/primeng/src/tabs/tablist.ts`, `primevue-4.5.5:packages/primevue/src/tablist/TabList.vue`).
- **TabPanels** — a plain wrapper without inputs (`primeng-21.1.9:packages/primeng/src/tabs/tabpanels.ts`, `primevue-4.5.5:packages/primevue/src/tabpanels/TabPanels.vue`).
- **TabPanel** — `value`. PrimeNG adds `lazy = false` and a `content` template for deferred content; PrimeVue adds `as = 'DIV'`, `asChild = false` and the TabView-only legacy props listed in section 2 (`primeng-21.1.9:packages/primeng/src/tabs/tabpanel.ts`, `primevue-4.5.5:packages/primevue/src/tabpanel/BaseTabPanel.vue`).
- **Lazy semantics differ**: PrimeNG renders a lazy panel the first time it becomes active and keeps it afterwards; PrimeVue renders the panel only while active (`v-if`) and destroys it on leaving (`primeng-21.1.9:packages/primeng/src/tabs/tabpanel.ts`, `primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.vue`).
- **PrimeVue `orientation`**: `Tabs.vue` and `TabList.vue` read `$pcTabs.orientation` (vertical mode switches the ink bar to top/height and sets `aria-orientation`), but `BaseTabs.vue` declares no such prop and neither `Tabs.d.ts` nor the docs mention one, so vertical tabs are not reachable through the declared API (`primevue-4.5.5:packages/primevue/src/tabs/Tabs.vue`, `primevue-4.5.5:packages/primevue/src/tabs/BaseTabs.vue`, `primevue-4.5.5:packages/primevue/src/tablist/TabList.vue`). PrimeNG has no orientation at all.
- **PrimeReact `TabPanel`** — `header`, `headerTemplate`, `headerClassName`, `headerStyle`, `contentClassName`, `contentStyle`, `leftIcon`, `rightIcon`, `closable = false`, `closeIcon`, `disabled = false`, `visible = true`, `prevButton`, `nextButton`. The component is controlled when `onTabChange` is passed (it then reads `activeIndex`), otherwise it keeps internal state. `onBeforeTabChange` / `onBeforeTabClose` can veto by returning `false`; closing hides the tab internally (tracked by the child `key`, so closable panels need a `key`) and activates the next enabled one (`primereact-10.9.9:components/lib/tabview/TabViewBase.js`, `primereact-10.9.9:components/lib/tabview/TabView.js`).
- `headerTemplate` in PrimeReact receives options including `className`, `titleClassName`, `onClick`, `onKeyDown`, `leftIconElement`, `titleElement`, `rightIconElement`, `element`, `index`, `selected` and `ariaControls`, and must wire the click handler itself (`primereact-10.9.9:components/lib/tabview/TabView.js`).
- PrimeVue `TabView` (deprecated): `activeIndex = 0`, `lazy`, `scrollable`, `tabindex`, `selectOnFocus`, `prevButtonProps`, `nextButtonProps`, `prevIcon`, `nextIcon`; events `update:activeIndex`, `tab-change`, `tab-click` (`primevue-4.5.5:packages/primevue/src/tabview/BaseTabView.vue`, `primevue-4.5.5:packages/primevue/src/tabview/TabView.d.ts`).
- Full API: catalog modules `tabs`, `tablist`, `tab`, `tabpanels`, `tabpanel` (PrimeNG), `tabs`, `tablist`, `tab`, `tabpanels`, `tabpanel`, `tabview` (PrimeVue) and `tabview` (PrimeReact) in `docs/prime-reference/catalog/`.

## 6. Usage guidance

- **Import** — module or per-part imports as in section 3 (`primeng-21.1.9:apps/showcase/doc/tabs/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/ImportDoc.vue`, `primereact-10.9.9:components/doc/tabview/importdoc.js`).
- **Basic** — PrimeNG/PrimeVue build a `TabList` of `Tab` items and a `TabPanels` of `TabPanel` items, then pair them by equal `value`; the container `value` selects the initial tab. PrimeReact lists `TabPanel` children, each with a `header` (`primeng-21.1.9:apps/showcase/doc/tabs/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/BasicDoc.vue`, `primereact-10.9.9:components/doc/tabview/basicdoc.js`).
- **Dynamic** — generate tabs and panels from an array with `@for` / `v-for`, using the item key as `value` (PrimeReact has no dedicated section; use `map` with a `key`) (`primeng-21.1.9:apps/showcase/doc/tabs/dynamic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/DynamicDoc.vue`).
- **Controlled** — two-way bind `value` and drive it from external buttons; in PrimeReact pair `activeIndex` with `onTabChange` (`primeng-21.1.9:apps/showcase/doc/tabs/controlled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/ControlledDoc.vue`, `primereact-10.9.9:components/doc/tabview/controlleddoc.js`).
- **Disabled** — `disabled` on a `Tab` (or `TabPanel` in PrimeReact) blocks interaction and removes it from the keyboard walk; the PrimeNG example omits the `value` on its disabled tab, so give every tab a value in real use (`primeng-21.1.9:apps/showcase/doc/tabs/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/DisabledDoc.vue`, `primereact-10.9.9:components/doc/tabview/disableddoc.js`).
- **Scrollable** — set `scrollable` to get navigator buttons when the strip overflows (the showcase uses 50 tabs); `previcon` / `nexticon` replace the default chevrons (`primeng-21.1.9:apps/showcase/doc/tabs/scrollable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/ScrollableDoc.vue`, `primereact-10.9.9:components/doc/tabview/scrollabledoc.js`).
- **Lazy** (PrimeNG only) — set `lazy` on `Tabs` or on one `TabPanel`, and wrap heavy content in `<ng-template #content>` so it is not instantiated until first activation (`primeng-21.1.9:apps/showcase/doc/tabs/lazy-doc.ts`). PrimeVue has the `lazy` prop but no doc section; PrimeReact uses `renderActiveOnly`.
- **Template** — PrimeNG puts custom header markup (avatar, badge) straight into `p-tab`; PrimeVue uses the default slot of `Tab`, with `as` to change the element and `asChild` for a headless header; PrimeReact uses `headerTemplate` (`primeng-21.1.9:apps/showcase/doc/tabs/customtemplate-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/TemplateDoc.vue`, `primereact-10.9.9:components/doc/tabview/templatedoc.js`).
- **TabMenu** (PrimeNG, PrimeVue) — use tabs without `TabPanels` as a route navigation bar and let the router outlet supply the content. A dedicated TabMenu component exists in the Menu category of PrimeVue and PrimeReact (`primeng-21.1.9:apps/showcase/doc/tabs/tabmenu-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/TabMenuDoc.vue`).
- **Closable** (PrimeReact only) — `closable` on a `TabPanel` shows a close icon; give each panel a `key` and use `onTabClose` to react (`primereact-10.9.9:components/doc/tabview/closabledoc.js`).
- **Header icons** (PrimeReact only) — `leftIcon` / `rightIcon` add icons around the title (`primereact-10.9.9:components/doc/tabview/headericondoc.js`).

No services or providers are required.

## 7. Accessibility

- Roles: the strip is `role="tablist"` (an inner `div` in PrimeNG and PrimeVue, the `ul` in PrimeReact); each header is `role="tab"` with `aria-selected`, `aria-controls` (the panel id) and, in PrimeNG/PrimeReact, `aria-disabled`; each panel is `role="tabpanel"` with `aria-labelledby` pointing back at the tab. PrimeVue `TabList` also sets `aria-orientation` (always `horizontal` in practice, see section 5) (`primeng-21.1.9:packages/primeng/src/tabs/tab.ts`, `primeng-21.1.9:packages/primeng/src/tabs/tabpanel.ts`, `primevue-4.5.5:packages/primevue/src/tab/Tab.vue`, `primevue-4.5.5:packages/primevue/src/tablist/TabList.vue`, `primereact-10.9.9:components/lib/tabview/TabView.js`).
- Ids follow `<tabsId>_tab_<value>` and `<tabsId>_tabpanel_<value>` (NG, Vue), or `<id>_header_<index>` and `<id><index>_content` (React).
- Roving tabindex: only the active tab is a tab stop (`tabindex` from the container, default 0); other tabs get −1. PrimeVue also gives every `TabPanel` the container `tabindex`, making panels focusable (`primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.vue`).
- Keyboard on a tab: Left / Right Arrow move to the previous / next enabled tab and wrap; Home / End jump to the first / last tab; Enter, Space and NumpadEnter activate; PageUp / PageDown scroll the strip to its start / end without changing the selection. With `selectOnFocus` (NG, Vue), focusing a tab activates it (`primeng-21.1.9:packages/primeng/src/tabs/tab.ts`, `primevue-4.5.5:packages/primevue/src/tab/Tab.vue`, `primereact-10.9.9:components/lib/tabview/TabView.js`).
- Navigator buttons carry localized `aria-label`s taken from the locale config (`aria.previous` / `aria.next`; React uses `prevPageLabel` / `nextPageLabel`); the PrimeReact close icon labels itself "Close" by default.
- Upstream doc mismatches:
  - All three accessibility docs list Home as "last header" and End as "first header", the reverse of what the source does (Home → first, End → last) (`primeng-21.1.9:apps/showcase/doc/tabs/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/tabview/accessibilitydoc.js`).
  - The PrimeNG doc says the tablist role sits on the container; it sits on the inner strip element.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-tabs` (+ `p-tabs-scrollable`), `p-tablist`, `p-tablist-content`, `p-tablist-viewport`, `p-tablist-tab-list`, `p-tablist-active-bar`, `p-tablist-prev-button`, `p-tablist-next-button`, `p-tablist-nav-button`, `p-tab` (+ `p-tab-active`, `p-disabled`), `p-tabpanels`, `p-tabpanel` (+ `p-tabpanel-active`). Only the `Tabs` style imports the shared stylesheet; the other part styles define class names only (`primeng-21.1.9:packages/primeng/src/tabs/style/tabsstyle.ts`, `primevue-4.5.5:packages/primevue/src/tabs/style/TabsStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/tabs/index.mjs` (PrimeNG and PrimeVue; contains no vertical-orientation rules). Legacy TabView CSS: `@primeuix/styles-2.0.3:dist/tabview/index.mjs` (PrimeVue `TabView`).
- Design tokens (`@primeuix/themes-2.0.3:types/tabs/index.d.ts`): `root.transitionDuration`; `tablist` (`borderWidth`, `background`, `borderColor`); `tab` (`background`, `hoverBackground`, `activeBackground`, `borderWidth`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `color`, `hoverColor`, `activeColor`, `padding`, `fontWeight`, `margin`, `gap`, `focusRing.*`); `tabpanel` (`background`, `color`, `padding`, `focusRing.*`); `navButton` (`background`, `color`, `hoverColor`, `width`, `focusRing.*`, `shadow`); `activeBar` (`height`, `bottom`, `background`). Aura values: `@primeuix/themes-2.0.3:dist/aura/tabs/index.mjs` (for example tab padding `1rem 1.125rem`, font weight 600, active color from `{primary.color}`).
- Legacy tokens for PrimeVue `TabView` (`@primeuix/themes-2.0.3:types/tabview/index.d.ts`): `root.transitionDuration`; `tabList` (`background`, `borderColor`); `tab` (`borderColor`, `activeBorderColor`, `color`, `hoverColor`, `activeColor`); `tabPanel` (`background`, `color`); `navButton` (`background`, `color`, `hoverColor`, `shadow`). Aura values: `@primeuix/themes-2.0.3:dist/aura/tabview/index.mjs`.
- PrimeReact: classes and an inline stylesheet in `TabViewBase.js`; design tokens N/A. Its styled doc lists `p-tabview`, `p-tabview-nav`, `p-tabview-selected`, `p-tabview-panels` and `p-tabview-panel` (`primereact-10.9.9:components/lib/tabview/TabViewBase.js`, `primereact-10.9.9:components/doc/tabview/styledoc.js`).
- Pass-through and theming docs: `primeng-21.1.9:apps/showcase/doc/tabs/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/tabs/pt/index.vue`, `primevue-4.5.5:apps/showcase/doc/tabs/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/tabs/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/tabview/pt/wireframe.js`, `primereact-10.9.9:components/doc/tabview/theming/styleddoc.js`, `primereact-10.9.9:components/doc/tabview/theming/tailwinddoc.js`.

## 9. Relationships

- Embeds: chevron icons for the navigator buttons (and a times icon for closable PrimeReact tabs); Ripple on each tab (PrimeNG host directive, PrimeVue `v-ripple`, PrimeReact `Ripple` on headers).
- Parent / child contract: `Tab`, `TabList`, `TabPanels` and `TabPanel` look up the enclosing `Tabs` (parent-instance token in PrimeNG, `$pcTabs` provide/inject in PrimeVue) for the active value, the id, the tabindex and the scroll options; they are not usable on their own. PrimeVue `TabPanel` renders only its slot when no `Tabs` ancestor exists, which is how `TabView` can reuse it (`primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.vue`).
- Alias chain: PrimeVue and PrimeReact `TabView` ≙ `Tabs` + `TabList` + `Tab` + `TabPanels` + `TabPanel`; PrimeNG removed the alias.
- Related: Accordion (stacked collapsible panels addressed by value, the vertical counterpart), Stepper (Panel category, ordered steps with panels), TabMenu (Menu category, tabs without panels for navigation), Panel and Fieldset (single collapsible container), ScrollPanel (custom scrolling), Splitter (resizable panes), Menubar (navigation bar alternative).
- A navigation bar built from tabs without panels overlaps with TabMenu; prefer TabMenu when the items come from a menu model.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils` (`uuid`, `equals`, `focus`, `getAttribute`, `findSingle`, `getOffset`, `getOuterWidth`, `getWidth`, `isRTL`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `primeng/base`, `primeng/icons` (`ChevronLeftIcon`, `ChevronRightIcon`), `primeng/ripple`, `@primeuix/styles/tabs` (`primeng-21.1.9:packages/primeng/src/tabs/tabs.ts`, `primeng-21.1.9:packages/primeng/src/tabs/tablist.ts`, `primeng-21.1.9:packages/primeng/src/tabs/tab.ts`, `primeng-21.1.9:packages/primeng/src/tabs/style/tabsstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primevue/icons/chevronleft`, `@primevue/icons/chevronright`, `primevue/ripple`, `@primeuix/utils` (`cn`, `equals`, DOM helpers), `@primeuix/styles/tabs` and, for `TabView`, `@primeuix/styles/tabview` (`primevue-4.5.5:packages/primevue/src/tablist/TabList.vue`, `primevue-4.5.5:packages/primevue/src/tab/Tab.vue`, `primevue-4.5.5:packages/primevue/src/tabs/style/TabsStyle.js`, `primevue-4.5.5:packages/primevue/src/tabview/style/TabViewStyle.js`).
- PrimeReact: internal `api`, `componentbase`, `hooks`, `icons` (chevron left/right, times), `ripple` and `utils` modules (`primereact-10.9.9:components/lib/tabview/TabView.js`).
- External npm packages: none beyond the framework itself.

## 11. Framework differences

| Aspect           | PrimeNG                                            | PrimeVue                                             | PrimeReact                                                          |
| ---------------- | -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| Composition      | Tabs / TabList / Tab / TabPanels / TabPanel        | same five parts (+ deprecated `TabView`)             | `TabView` + `TabPanel` children only                                |
| Active key       | `value` (model, string or number)                  | `value` (`v-model:value`)                            | numeric `activeIndex`                                               |
| Tab ↔ panel link | equal `value`                                      | equal `value`                                        | position in the child list                                          |
| Header element   | host with `role="tab"`; ripple host directive      | `button` by default (`as` / `asChild` configurable)  | `a` inside an `li`                                                  |
| Inactive panels  | kept in DOM and hidden; `lazy` defers first render | `v-show`; with `lazy`, unmounted again when inactive | only the selected one rendered unless `renderActiveOnly` is `false` |
| Closable tabs    | no                                                 | no                                                   | `closable`, `onTabClose`, veto callbacks                            |
| Focus activation | `selectOnFocus`                                    | `selectOnFocus`                                      | no                                                                  |
| Vertical layout  | none                                               | code path exists, prop not declared                  | none                                                                |
| Custom header    | free markup inside `p-tab`                         | default slot, `as`, `asChild`                        | `headerTemplate`, `leftIcon`, `rightIcon`                           |
| Panel focusable  | no (`tabpanel` has no `tabindex`)                  | yes (container `tabindex`)                           | no                                                                  |
| Legacy status    | `TabView` removed in v20                           | `TabView` deprecated since v4, warns on mount        | `TabView` is current                                                |
| Design tokens    | `tabs` token set                                   | `tabs` token set (`tabview` set for legacy)          | N/A                                                                 |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/tabs/tabs.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/tablist.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/tab.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/tabpanels.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/tabpanel.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/tabs.module.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/style/tabsstyle.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/style/tabliststyle.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/style/tabstyle.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/style/tabpanelstyle.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/style/tabpanelsstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/tabs/tabs.types.ts`
- `primeng-21.1.9:apps/showcase/doc/tabs/` (`import-doc.ts`, `basic-doc.ts`, `controlled-doc.ts`, `customtemplate-doc.ts`, `disabled-doc.ts`, `dynamic-doc.ts`, `lazy-doc.ts`, `scrollable-doc.ts`, `tabmenu-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`
- `primevue-4.5.5:packages/primevue/src/tabs/Tabs.vue`
- `primevue-4.5.5:packages/primevue/src/tabs/BaseTabs.vue`
- `primevue-4.5.5:packages/primevue/src/tabs/Tabs.d.ts`
- `primevue-4.5.5:packages/primevue/src/tabs/package.json`
- `primevue-4.5.5:packages/primevue/src/tabs/style/TabsStyle.js`
- `primevue-4.5.5:packages/primevue/src/tablist/TabList.vue`
- `primevue-4.5.5:packages/primevue/src/tablist/TabList.d.ts`
- `primevue-4.5.5:packages/primevue/src/tablist/style/TabListStyle.js`
- `primevue-4.5.5:packages/primevue/src/tab/Tab.vue`
- `primevue-4.5.5:packages/primevue/src/tab/BaseTab.vue`
- `primevue-4.5.5:packages/primevue/src/tab/style/TabStyle.js`
- `primevue-4.5.5:packages/primevue/src/tabpanels/TabPanels.vue`
- `primevue-4.5.5:packages/primevue/src/tabpanels/style/TabPanelsStyle.js`
- `primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.vue`
- `primevue-4.5.5:packages/primevue/src/tabpanel/BaseTabPanel.vue`
- `primevue-4.5.5:packages/primevue/src/tabpanel/TabPanel.d.ts`
- `primevue-4.5.5:packages/primevue/src/tabpanel/style/TabPanelStyle.js`
- `primevue-4.5.5:packages/primevue/src/tabview/TabView.vue`
- `primevue-4.5.5:packages/primevue/src/tabview/BaseTabView.vue`
- `primevue-4.5.5:packages/primevue/src/tabview/TabView.d.ts`
- `primevue-4.5.5:packages/primevue/src/tabview/style/TabViewStyle.js`
- `primevue-4.5.5:apps/showcase/doc/tabs/` (`ImportDoc.vue`, `BasicDoc.vue`, `ControlledDoc.vue`, `DisabledDoc.vue`, `DynamicDoc.vue`, `ScrollableDoc.vue`, `TabMenuDoc.vue`, `TemplateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/tabview/TabView.js`
- `primereact-10.9.9:components/lib/tabview/TabViewBase.js`
- `primereact-10.9.9:components/lib/tabview/tabview.d.ts`
- `primereact-10.9.9:components/doc/tabview/` (`importdoc.js`, `basicdoc.js`, `closabledoc.js`, `controlleddoc.js`, `disableddoc.js`, `headericondoc.js`, `scrollabledoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/tabs/index.mjs`
- `@primeuix/styles-2.0.3:dist/tabview/index.mjs`
- `@primeuix/themes-2.0.3:types/tabs/index.d.ts`
- `@primeuix/themes-2.0.3:types/tabview/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/tabs/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/tabview/index.mjs`
