# Accordion

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Accordion stacks a set of collapsible sections; each section has a clickable header that shows or hides its content. One section is open at a time unless multiple mode is on. PrimeNG and PrimeVue compose it from four parts (Accordion, AccordionPanel, AccordionHeader, AccordionContent) keyed by a `value`; PrimeReact keeps the older index-based model with `Accordion` plus `AccordionTab` children (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`, `primevue-4.5.5:packages/primevue/src/accordion/Accordion.vue`, `primereact-10.9.9:components/lib/accordion/Accordion.js`).

## 2. Names & status

- Canonical name: **Accordion**, with sub-components **AccordionPanel**, **AccordionHeader**, **AccordionContent** (PrimeNG, PrimeVue).
- Legacy alias **AccordionTab**:
  - PrimeVue: still shipped in `primevue/accordiontab` but deprecated since v4 ("Use the new structure of Accordion instead"); it logs a console warning when mounted. Accordion detects AccordionTab children and renders them through the new parts (`primevue-4.5.5:packages/primevue/src/accordiontab/AccordionTab.d.ts`, `primevue-4.5.5:packages/primevue/src/accordiontab/AccordionTab.vue`, `primevue-4.5.5:packages/primevue/src/accordion/Accordion.vue`).
  - PrimeNG: AccordionTab was deprecated in v18 and removed in v20 (replacement: AccordionPanel, AccordionHeader, AccordionContent); only the event interface names `AccordionTabOpenEvent` / `AccordionTabCloseEvent` survive in 21.1.9 (`primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`, `primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`).
  - PrimeReact: `AccordionTab` is the current, non-deprecated child component; there is no Panel/Header/Content split (`primereact-10.9.9:components/lib/accordion/Accordion.js`).
- Deprecated members:
  - PrimeNG `styleClass` (since v20.0.0, use `class`), `transitionOptions` (since v21.0.0, use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`).
  - PrimeVue `activeIndex` prop (since v4, use `value`), emits `update:activeIndex`, `tab-open`, `tab-close`, `tab-click` (all since v4) (`primevue-4.5.5:packages/primevue/src/accordion/Accordion.d.ts`).
- PrimeNG selectors accept both spellings: `p-accordion-panel` / `p-accordionpanel`, `p-accordion-header` / `p-accordionheader`, `p-accordion-content` / `p-accordioncontent` (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`).
- Listed first in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                    | PrimeVue                                                                                                                              | PrimeReact                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Import         | `import { AccordionModule } from 'primeng/accordion'` (all four components are standalone)                                                 | `import Accordion from 'primevue/accordion'`, plus `primevue/accordionpanel`, `primevue/accordionheader`, `primevue/accordioncontent` | `import { Accordion, AccordionTab } from 'primereact/accordion'`              |
| Selector / tag | `<p-accordion>`, `<p-accordion-panel>`, `<p-accordion-header>`, `<p-accordion-content>`                                                    | `<Accordion>`, `<AccordionPanel>`, `<AccordionHeader>`, `<AccordionContent>`                                                          | `<Accordion>`, `<AccordionTab>`                                               |
| Source         | `packages/primeng/src/accordion/accordion.ts` (all four classes), `style/accordionstyle.ts`, types in `types/accordion/accordion.types.ts` | one folder per part: `accordion/`, `accordionpanel/`, `accordionheader/`, `accordioncontent/`, legacy `accordiontab/`                 | `components/lib/accordion/Accordion.js`, `AccordionBase.js`, `accordion.d.ts` |
| Base class     | `BaseComponent<…PassThrough>`; `Accordion` implements `BlockableUI`                                                                        | `BaseComponent` via `BaseAccordion*`                                                                                                  | `ComponentBase.extend` (`AccordionBase`, `AccordionTabBase`)                  |
| Exports        | `Accordion`, `AccordionPanel`, `AccordionHeader`, `AccordionContent`, `AccordionModule`, `AccordionStyle`                                  | one default export per package; `AccordionTab` deprecated                                                                             | `Accordion`, `AccordionTab` (a marker component that renders nothing itself)  |

Sources: `primeng-21.1.9:apps/showcase/doc/accordion/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/accordion/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/accordion/package.json`, `primereact-10.9.9:components/doc/accordion/importdoc.js`, `primereact-10.9.9:components/lib/accordion/AccordionBase.js`.

## 4. Anatomy

PrimeNG / PrimeVue (new structure):

| Part            | Element                                   | PT key (component.key)                                       | Class                                                       |
| --------------- | ----------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Root            | `p-accordion` host / `div`                | `Accordion.root`                                             | `p-accordion p-component`                                   |
| Panel           | `p-accordion-panel` host / `as` (div)     | `AccordionPanel.root`                                        | `p-accordionpanel`, `p-accordionpanel-active`, `p-disabled` |
| Header          | host with `role="button"` / `as` (button) | `AccordionHeader.root`                                       | `p-accordionheader`                                         |
| Toggle icon     | chevron SVG or icon `span`                | `AccordionHeader.toggleicon`                                 | `p-accordionheader-toggle-icon`                             |
| Content region  | host / `as` (div), `role="region"`        | `AccordionContent.root`                                      | `p-accordioncontent`                                        |
| Content wrapper | `div`                                     | `AccordionContent.contentWrapper`                            | `p-accordioncontent-wrapper`                                |
| Content         | `div`                                     | `AccordionContent.content`                                   | `p-accordioncontent-content`                                |
| Animation       | `p-motion` (NG) / `<transition>` (Vue)    | `Accordion.motion` (NG), `AccordionContent.transition` (Vue) | —                                                           |

PrimeReact (index-based):

| Part           | Element               | PT key                           | Class                                             |
| -------------- | --------------------- | -------------------------------- | ------------------------------------------------- |
| Root           | `div`                 | `root`                           | `p-accordion p-component`                         |
| Tab            | `div`                 | `accordiontab.root`              | `p-accordion-tab`, `p-accordion-tab-active`       |
| Header         | `div`                 | `accordiontab.header`            | `p-accordion-header`, `p-highlight`, `p-disabled` |
| Header action  | `a` (`role="button"`) | `accordiontab.headerAction`      | `p-accordion-header-link`                         |
| Header icon    | chevron SVG           | `accordiontab.headerIcon`        | `p-accordion-toggle-icon`                         |
| Header title   | `span`                | `accordiontab.headerTitle`       | `p-accordion-header-text`                         |
| Content region | `div`                 | `accordiontab.toggleableContent` | `p-toggleable-content`                            |
| Content        | `div`                 | `accordiontab.content`           | `p-accordion-content`                             |
| Animation      | `CSSTransition`       | `accordiontab.transition`        | —                                                 |

- The header shows the projected label first and the toggle icon after it in PrimeNG/PrimeVue; PrimeReact renders the icon before the title (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`, `primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.vue`, `primereact-10.9.9:components/lib/accordion/Accordion.js`).
- Default icons: PrimeNG and PrimeVue show chevron-down when collapsed and chevron-up when expanded; PrimeReact shows chevron-right when collapsed and chevron-down when expanded.
- PrimeVue legacy AccordionTab PT keys (`root`, `header`, `headerAction`, `headerIcon`, `headerTitle`, `toggleableContent`, `content`, `transition`) are mapped onto the new parts (`primevue-4.5.5:packages/primevue/src/accordiontab/AccordionTab.d.ts`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/accordion/accordion.types.ts`, `primevue-4.5.5:packages/primevue/src/accordioncontent/AccordionContent.d.ts`, `primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.d.ts`, `primereact-10.9.9:components/lib/accordion/accordion.d.ts`.

## 5. API highlights

Accordion (container):

| Member            | PrimeNG                                                                                                   | PrimeVue                                                                              | PrimeReact                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Active state      | `value: ModelSignal<string \| number \| string[] \| number[]>` = `undefined`, `[(value)]`                 | `value: string \| number \| string[] \| number[]`, `v-model:value`                    | `activeIndex: number \| number[]` (index-based)                   |
| Multiple          | `multiple = false`                                                                                        | `multiple: Boolean = false`                                                           | `multiple: boolean = false`                                       |
| Activate on focus | `selectOnFocus = false`                                                                                   | `selectOnFocus: Boolean = false`                                                      | —                                                                 |
| Icons             | `expandIcon: string`, `collapseIcon: string` (icon class)                                                 | `expandIcon: String`, `collapseIcon: String`; slots `expandicon`, `collapseicon`      | `expandIcon`, `collapseIcon: IconType<AccordionProps>`            |
| Lazy content      | —                                                                                                         | `lazy: Boolean = false` (renders content only when active)                            | content always unmounted when closed                              |
| Header tabindex   | —                                                                                                         | `tabindex: Number = 0`                                                                | per tab `tabIndex = 0`                                            |
| Animation         | `motionOptions: MotionOptions`; `transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)'` (deprecated) | Vue `<transition name="p-collapsible">`                                               | `transitionOptions: CSSTransitionProps`                           |
| Events            | `onOpen(AccordionTabOpenEvent)`, `onClose(AccordionTabCloseEvent)` (`{ originalEvent, index }`)           | `update:value`; deprecated `update:activeIndex`, `tab-open`, `tab-close`, `tab-click` | `onTabOpen`, `onTabClose`, `onTabChange(AccordionTabChangeEvent)` |
| Methods           | `updateValue(value)`, `getBlockableElement()`                                                             | —                                                                                     | `getElement()`                                                    |

Parts:

- **AccordionPanel** — `value` (unique key, required in practice), `disabled = false`. PrimeVue adds `as = 'DIV'`, `asChild = false` (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`, `primevue-4.5.5:packages/primevue/src/accordionpanel/BaseAccordionPanel.vue`).
- **AccordionHeader** — PrimeNG: `toggleicon` template with context `{ active }`. PrimeVue: `as = 'BUTTON'`, `asChild = false`; default slot `{ active }`, `toggleicon` slot; in `asChild` mode it exposes `{ class, active, a11yAttrs, onClick }` for a custom header (`primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.vue`).
- **AccordionContent** — PrimeVue: `as = 'DIV'`, `asChild = false` (`primevue-4.5.5:packages/primevue/src/accordioncontent/BaseAccordionContent.vue`).
- **AccordionTab** (PrimeReact current, PrimeVue deprecated) — `header`, `headerTemplate` (React), `headerStyle`, `headerClassName`/`headerClass`, `contentStyle`, `contentClassName`/`contentClass`, `disabled = false`; PrimeVue also `headerProps`, `headerActionProps`, `contentProps` and slots `header`, `headericon` (`primereact-10.9.9:components/lib/accordion/AccordionBase.js`, `primevue-4.5.5:packages/primevue/src/accordiontab/BaseAccordionTab.vue`).
- Value semantics: with `multiple`, PrimeNG/PrimeVue keep an array of panel values; clicking an open single-mode panel closes it (value becomes `undefined` in PrimeNG, `null` in PrimeVue) (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`, `primevue-4.5.5:packages/primevue/src/accordion/Accordion.vue`).
- PrimeReact is controlled when `onTabChange` is provided (it then reads `activeIndex` directly), otherwise it keeps internal state seeded from `activeIndex` (`primereact-10.9.9:components/lib/accordion/Accordion.js`).
- Full API: catalog modules `accordion` (PrimeNG, PrimeReact) and `accordion`, `accordionpanel`, `accordionheader`, `accordioncontent`, `accordiontab` (PrimeVue) in `docs/prime-reference/catalog/`.

## 6. Usage guidance

- **Import** — module or per-part imports as in section 3 (`primeng-21.1.9:apps/showcase/doc/accordion/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/ImportDoc.vue`, `primereact-10.9.9:components/doc/accordion/importdoc.js`).
- **Basic** — PrimeNG/PrimeVue nest Panel → Header + Content and give each panel a unique `value`; the container `value` opens one panel initially. PrimeReact lists `AccordionTab` children and opens one by `activeIndex` (`primeng-21.1.9:apps/showcase/doc/accordion/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/BasicDoc.vue`, `primereact-10.9.9:components/doc/accordion/basicdoc.js`).
- **Dynamic** — generate panels or tabs from an array (`@for`, `v-for`, `map`) (`primeng-21.1.9:apps/showcase/doc/accordion/dynamic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/DynamicDoc.vue`, `primereact-10.9.9:components/doc/accordion/dynamicdoc.js`).
- **Multiple** — set `multiple` and bind an array value (PrimeNG doc text still mentions `activeIndex`, an older name) (`primeng-21.1.9:apps/showcase/doc/accordion/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/MultipleDoc.vue`, `primereact-10.9.9:components/doc/accordion/multipledoc.js`).
- **Disabled** — `disabled` on a panel/tab blocks interaction and skips it in keyboard navigation (`primeng-21.1.9:apps/showcase/doc/accordion/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/DisabledDoc.vue`, `primereact-10.9.9:components/doc/accordion/disableddoc.js`).
- **Controlled** — two-way bind `value` (PrimeNG/PrimeVue), or pair `activeIndex` with `onTabChange` (PrimeReact); external buttons change the open panel (`primeng-21.1.9:apps/showcase/doc/accordion/controlled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/ControlledDoc.vue`, `primereact-10.9.9:components/doc/accordion/controlleddoc.js`).
- **Template** — PrimeNG customizes the icon with the `toggleicon` template; PrimeVue puts custom markup in the header default slot and shows `as` / `asChild` for headless headers; PrimeReact uses `header` / `headerTemplate` (`primeng-21.1.9:apps/showcase/doc/accordion/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/TemplateDoc.vue`, `primereact-10.9.9:components/doc/accordion/templatedoc.js`).

No services or providers are required.

## 7. Accessibility

- Header: PrimeNG makes the header host `role="button"` with `tabindex` 0 (−1 when disabled) and `aria-disabled`; PrimeVue renders a native `<button type="button">` (disabled via the `disabled` attribute); PrimeReact uses an `<a href="#…" role="button">` inside a header `div`. All set `aria-expanded` and `aria-controls` pointing at the content id (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`, `primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.vue`, `primereact-10.9.9:components/lib/accordion/Accordion.js`).
- Content: `role="region"` with `aria-labelledby` pointing back at the header id. Ids follow `<accordionId>_accordionheader_<value>` / `_accordioncontent_<value>` (NG, Vue) or `<id>_header_<index>` / `_content_<index>` (React).
- Toggle icons are `aria-hidden`.
- Keyboard (header): Tab / Shift+Tab move through the page; Enter and Space toggle (NumpadEnter as well in source); Down/Up Arrow move to the next/previous enabled header and wrap; Home / End go to the first / last header (`primeng-21.1.9:apps/showcase/doc/accordion/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/accordion/accessibilitydoc.js`).
- `selectOnFocus` (NG, Vue) opens a panel as soon as its header receives focus.
- Upstream doc mismatch: the PrimeNG accessibility doc mentions a `heading` role with `headerAriaLevel` and a `header` property; neither exists in the 21.1.9 source (`primeng-21.1.9:apps/showcase/doc/accordion/accessibility-doc.ts`, `primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-accordion`, `p-accordionpanel` (+ `p-accordionpanel-active`, `p-disabled`), `p-accordionheader`, `p-accordionheader-toggle-icon`, `p-accordioncontent`, `p-accordioncontent-wrapper`, `p-accordioncontent-content` (`primeng-21.1.9:packages/primeng/src/accordion/style/accordionstyle.ts`, `primevue-4.5.5:packages/primevue/src/accordionpanel/style/AccordionPanelStyle.js`, `primevue-4.5.5:packages/primevue/src/accordionheader/style/AccordionHeaderStyle.js`, `primevue-4.5.5:packages/primevue/src/accordioncontent/style/AccordionContentStyle.js`). The PrimeVue `accordiontab` style registers a name only.
- PrimeNG adds its own rules on top of the shared CSS: an `icon-start` modifier that moves the toggle icon before the label, ripple positioning, and a grid wrapper for the motion element (`primeng-21.1.9:packages/primeng/src/accordion/style/accordionstyle.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/accordion/index.mjs` (PrimeNG and PrimeVue).
- Design tokens (`@primeuix/themes-2.0.3:types/accordion/index.d.ts`): `root.transitionDuration`; `panel` (`borderWidth`, `borderColor`); `header` (`color`, `hoverColor`, `activeColor`, `activeHoverColor`, `padding`, `fontWeight`, `borderRadius`, `borderWidth`, `borderColor`, `background`, `hoverBackground`, `activeBackground`, `activeHoverBackground`, `focusRing.*`, `toggleIcon.*`, `first.*`, `last.*`); `content` (`borderWidth`, `borderColor`, `background`, `color`, `padding`). Aura values: `@primeuix/themes-2.0.3:dist/aura/accordion/index.mjs`.
- PrimeReact: classes and a small `@layer primereact` stylesheet in `AccordionBase.js`; design tokens N/A. Its styled doc lists `p-accordion`, `p-accordion-header`, `p-accordion-content` (`primereact-10.9.9:components/lib/accordion/AccordionBase.js`, `primereact-10.9.9:components/doc/accordion/styledoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/accordion/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/accordion/pt/index.vue`, `primereact-10.9.9:components/doc/accordion/pt/wireframe.js`.

## 9. Relationships

- Embeds: chevron icons; Ripple (PrimeNG host directive on the header, PrimeVue `v-ripple`); motion/transition (`p-motion`, Vue `<transition>`, React `CSSTransition`).
- Alias chain: PrimeVue `AccordionTab` (deprecated) → `AccordionPanel` + `AccordionHeader` + `AccordionContent`; PrimeReact `AccordionTab` is the equivalent of one panel.
- Related: Panel and Fieldset (a single collapsible section), Tabs (same panel-by-value model, one visible at a time), PanelMenu (accordion-style menu, Menu category).
- PrimeNG Accordion implements `BlockableUI`, so BlockUI can target it.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/motion`, `@primeuix/utils`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (ChevronDown/ChevronUp), `primeng/motion`, `primeng/ripple`, `primeng/utils`, `primeng/base`, `@primeuix/styles/accordion` (`primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`, `primeng-21.1.9:packages/primeng/src/accordion/style/accordionstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primevue/icons/chevrondown`, `@primevue/icons/chevronup`, `@primevue/icons/chevronright`, `primevue/ripple`, `@primeuix/utils`, `@primeuix/styles/accordion` (`primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.vue`, `primevue-4.5.5:packages/primevue/src/accordion/style/AccordionStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks`, `../icons/chevrondown`, `../icons/chevronright`, `../utils/Utils` (`primereact-10.9.9:components/lib/accordion/Accordion.js`).
- External npm packages: PrimeReact's CSSTransition wraps `react-transition-group`.

## 11. Framework differences

| Aspect           | PrimeNG                            | PrimeVue                                             | PrimeReact                               |
| ---------------- | ---------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| Composition      | Panel / Header / Content           | Panel / Header / Content (+ deprecated AccordionTab) | `AccordionTab` children                  |
| Active key       | panel `value` (model)              | panel `value` (`v-model:value`)                      | numeric `activeIndex`                    |
| Header element   | host element with `role="button"`  | native `<button>` (`as` / `asChild` configurable)    | `<a role="button">` in a `div`           |
| Closed content   | kept in DOM, hidden by motion      | `v-show` hidden, or not rendered with `lazy`         | unmounted after exit transition          |
| Events           | `onOpen`, `onClose`, `valueChange` | `update:value` (+ deprecated tab events)             | `onTabOpen`, `onTabClose`, `onTabChange` |
| Focus activation | `selectOnFocus`                    | `selectOnFocus`                                      | no                                       |
| Default icons    | chevron down / up                  | chevron down / up                                    | chevron right / down                     |
| Headless mode    | no                                 | `asChild` on each part                               | no                                       |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/accordion/accordion.ts`
- `primeng-21.1.9:packages/primeng/src/accordion/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/accordion/style/accordionstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/accordion/accordion.types.ts`
- `primeng-21.1.9:apps/showcase/doc/accordion/` (`import-doc.ts`, `basic-doc.ts`, `dynamic-doc.ts`, `multiple-doc.ts`, `disabled-doc.ts`, `controlled-doc.ts`, `template-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`
- `primevue-4.5.5:packages/primevue/src/accordion/Accordion.vue`
- `primevue-4.5.5:packages/primevue/src/accordion/Accordion.d.ts`
- `primevue-4.5.5:packages/primevue/src/accordion/package.json`
- `primevue-4.5.5:packages/primevue/src/accordion/style/AccordionStyle.js`
- `primevue-4.5.5:packages/primevue/src/accordionpanel/BaseAccordionPanel.vue`
- `primevue-4.5.5:packages/primevue/src/accordionpanel/style/AccordionPanelStyle.js`
- `primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.vue`
- `primevue-4.5.5:packages/primevue/src/accordionheader/AccordionHeader.d.ts`
- `primevue-4.5.5:packages/primevue/src/accordionheader/style/AccordionHeaderStyle.js`
- `primevue-4.5.5:packages/primevue/src/accordioncontent/BaseAccordionContent.vue`
- `primevue-4.5.5:packages/primevue/src/accordioncontent/AccordionContent.d.ts`
- `primevue-4.5.5:packages/primevue/src/accordioncontent/style/AccordionContentStyle.js`
- `primevue-4.5.5:packages/primevue/src/accordiontab/AccordionTab.vue`
- `primevue-4.5.5:packages/primevue/src/accordiontab/BaseAccordionTab.vue`
- `primevue-4.5.5:packages/primevue/src/accordiontab/AccordionTab.d.ts`
- `primevue-4.5.5:apps/showcase/doc/accordion/` (`ImportDoc.vue`, `BasicDoc.vue`, `DynamicDoc.vue`, `MultipleDoc.vue`, `DisabledDoc.vue`, `ControlledDoc.vue`, `TemplateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/accordion/Accordion.js`
- `primereact-10.9.9:components/lib/accordion/AccordionBase.js`
- `primereact-10.9.9:components/lib/accordion/accordion.d.ts`
- `primereact-10.9.9:components/doc/accordion/` (`importdoc.js`, `basicdoc.js`, `dynamicdoc.js`, `multipledoc.js`, `disableddoc.js`, `controlleddoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/accordion/index.mjs`
- `@primeuix/themes-2.0.3:types/accordion/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/accordion/index.mjs`
