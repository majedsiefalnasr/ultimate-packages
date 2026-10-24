# Panel

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Panel is a container with a header bar (title, custom action icons), a content area and an optional footer. When toggleable, a button in the header collapses and expands the content with an animation. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/panel/panel.ts`, `primevue-4.5.5:packages/primevue/src/panel/Panel.vue`, `primereact-10.9.9:components/lib/panel/Panel.js`).

## 2. Names & status

- Canonical name: **Panel** in all three frameworks; no legacy aliases.
- Not deprecated as a component. Deprecated members:
  - PrimeNG `styleClass` (since v20.0.0, use `class`) and `transitionOptions` (since v21.0.0, use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/panel/panel.ts`).
  - PrimeVue `togglericon` slot (since v4.0, use `toggleicon`) (`primevue-4.5.5:packages/primevue/src/panel/Panel.d.ts`).
- Listed in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                             | PrimeVue                                                                                      | PrimeReact                                                    |
| -------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Import         | `import { PanelModule } from 'primeng/panel'` (component `Panel` is standalone)                     | `import Panel from 'primevue/panel'`                                                          | `import { Panel } from 'primereact/panel'`                    |
| Selector / tag | `<p-panel>`                                                                                         | `<Panel>`                                                                                     | `<Panel />`                                                   |
| Source         | `packages/primeng/src/panel/panel.ts`, `style/panelstyle.ts`, types in `types/panel/panel.types.ts` | `packages/primevue/src/panel/Panel.vue`, `BasePanel.vue`, `Panel.d.ts`, `style/PanelStyle.js` | `components/lib/panel/Panel.js`, `PanelBase.js`, `panel.d.ts` |
| Base class     | `BaseComponent<PanelPassThrough>`, implements `BlockableUI`                                         | `BaseComponent` (via `BasePanel`)                                                             | `ComponentBase.extend` (`PanelBase`)                          |
| Sub-components | none (uses Button for the toggle)                                                                   | none (uses Button for the toggle)                                                             | none (native `<button>` toggle)                               |

Sources: `primeng-21.1.9:apps/showcase/doc/panel/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/panel/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/panel/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/panel/BasePanel.vue`, `primereact-10.9.9:components/doc/panel/importdoc.js`, `primereact-10.9.9:components/lib/panel/PanelBase.js`.

## 4. Anatomy

| Part              | PrimeNG PT key               | PrimeVue PT key              | PrimeReact PT key   | Class (PrimeNG / PrimeVue)  | Class (PrimeReact)                           |
| ----------------- | ---------------------------- | ---------------------------- | ------------------- | --------------------------- | -------------------------------------------- |
| Root              | `host`, `root`               | `root`                       | `root`              | `p-panel`                   | `p-panel`                                    |
| Header            | `header`                     | `header`                     | `header`            | `p-panel-header`            | `p-panel-header`                             |
| Title             | `title`                      | `title`                      | `title`             | `p-panel-title`             | `p-panel-title`                              |
| Header actions    | `headerActions`              | `headerActions`              | `icons`             | `p-panel-header-actions`    | `p-panel-icons`                              |
| Toggle button     | `pcToggleButton` (Button PT) | `pcToggleButton` (Button PT) | `toggler`           | `p-panel-toggle-button`     | `p-panel-header-icon p-panel-toggler p-link` |
| Toggle icon       | `pcToggleButton.icon`        | `pcToggleButton.icon`        | `togglerIcon`       | (Button icon)               | —                                            |
| Content container | `contentContainer`           | `contentContainer`           | `toggleableContent` | `p-panel-content-container` | `p-toggleable-content`                       |
| Content wrapper   | `contentWrapper`             | `contentWrapper`             | —                   | `p-panel-content-wrapper`   | —                                            |
| Content           | `content`                    | `content`                    | `content`           | `p-panel-content`           | `p-panel-content`                            |
| Footer            | `footer`                     | `footer`                     | `footer`            | `p-panel-footer`            | `p-panel-footer`                             |
| Animation         | `motion`                     | `transition`                 | `transition`        | —                           | —                                            |

- Header actions hold the custom icons followed by the toggle button. In PrimeNG and PrimeVue the footer sits inside the collapsible container, so it collapses with the content; in PrimeReact the footer is rendered after the collapsible region (`primeng-21.1.9:packages/primeng/src/panel/panel.ts`, `primevue-4.5.5:packages/primevue/src/panel/Panel.vue`, `primereact-10.9.9:components/lib/panel/Panel.js`).
- PrimeReact renders the header only when `header`, `toggleable` or `headerTemplate` is set; PrimeNG hides it with `showHeader = false`; PrimeVue always renders it.
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/panel/panel.types.ts`, `primevue-4.5.5:packages/primevue/src/panel/Panel.d.ts`, `primereact-10.9.9:components/lib/panel/panel.d.ts`.

## 5. API highlights

Shared props: `header` (string; `ReactNode` in PrimeReact), `toggleable: boolean`, `collapsed: boolean`.

| Member              | PrimeNG                                                                                                 | PrimeVue                                                                                              | PrimeReact                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Two-way collapsed   | `[(collapsed)]` via `collapsedChange`                                                                   | `v-model:collapsed` via `update:collapsed`                                                            | controlled when `onToggle` is provided, otherwise internal state         |
| Toggle events       | `onBeforeToggle(PanelBeforeToggleEvent)`, `onAfterToggle(PanelAfterToggleEvent)`                        | `toggle({ originalEvent, value })`                                                                    | `onToggle(PanelToggleEvent)`, `onExpand`, `onCollapse`                   |
| Toggle trigger      | `toggler: 'icon' \| 'header' = 'icon'`                                                                  | button only                                                                                           | button only                                                              |
| Toggle button props | `toggleButtonProps` (passed to Button as `buttonProps`)                                                 | `toggleButtonProps: Object = { severity: 'secondary', text: true, rounded: true }`                    | —                                                                        |
| Actions position    | `iconPos: 'start' \| 'end' \| 'center' = 'end'`                                                         | —                                                                                                     | —                                                                        |
| Header visibility   | `showHeader: boolean = true`                                                                            | —                                                                                                     | —                                                                        |
| Animation           | `motionOptions` (signal input); `transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)'` deprecated | Vue `<transition name="p-collapsible">`                                                               | `transitionOptions: CSSTransitionProps`                                  |
| Header content      | `header` template / `<p-header>` facet                                                                  | `header` slot `{ id, class, collapsed }`                                                              | `headerTemplate(PanelHeaderTemplateOptions)` (replaces the whole header) |
| Custom icons        | `icons` template                                                                                        | `icons` slot                                                                                          | `icons: ReactNode \| (props) => ReactNode`                               |
| Toggle icon         | `headericons` template (context: collapsed)                                                             | `toggleicon` slot `{ collapsed }` (`togglericon` deprecated); `togglebutton` slot replaces the button | `expandIcon`, `collapseIcon` (`IconType`)                                |
| Footer              | `footer` template / `<p-footer>` facet                                                                  | `footer` slot                                                                                         | `footer`, `footerTemplate`                                               |
| Methods             | `toggle(event)`, `expand()`, `collapse()`, `getBlockableElement()`                                      | —                                                                                                     | `getElement()`, `getContent()`                                           |

- Defaults differ for `collapsed`/`toggleable`: `false` in PrimeVue (Boolean props), `undefined` in PrimeNG, `null` in PrimeReact `defaultProps`; all are falsy.
- PrimeNG templates (`header`, `icons`, `content`, `footer`, `headericons` with a `collapsed` context) are declared in `PanelTemplates` (`primeng-21.1.9:packages/primeng/src/types/panel/panel.types.ts`).
- Full API: catalog module `panel` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — set `header` and put content inside (`primeng-21.1.9:apps/showcase/doc/panel/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panel/BasicDoc.vue`, `primereact-10.9.9:components/doc/panel/basicdoc.js`).
- **Toggleable** — enable `toggleable`; `collapsed` sets the start state. PrimeNG can make the whole header the trigger with `toggler="header"`; PrimeReact documents controlled and uncontrolled modes (`primeng-21.1.9:apps/showcase/doc/panel/toggleable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panel/ToggleableDoc.vue`, `primereact-10.9.9:components/doc/panel/toggleabledoc.js`).
- **Template** — customize the header (avatar and name), add action icons such as a menu trigger, and add a footer with buttons (`primeng-21.1.9:apps/showcase/doc/panel/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panel/TemplateDoc.vue`, `primereact-10.9.9:components/doc/panel/templatedoc.js`).

No services or providers are required.

## 7. Accessibility

- Toggleable panels put a button in the header with `aria-controls` pointing at the content and `aria-expanded` reflecting the state. Its accessible name defaults to `header`; PrimeVue prefers `toggleButtonProps.ariaLabel` (`primeng-21.1.9:apps/showcase/doc/panel/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/panel/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/panel/accessibilitydoc.js`).
- The content container has `role="region"` and `aria-labelledby` pointing at the header id. PrimeNG and PrimeVue give that id to the toggle button when toggleable (and to the title otherwise); PrimeReact gives it to the title and gives the button an `_label` id.
- Keyboard: Tab / Shift+Tab move focus; Enter and Space toggle. PrimeVue also accepts NumpadEnter; PrimeReact relies on the native `<button>` (`primevue-4.5.5:packages/primevue/src/panel/Panel.vue`, `primereact-10.9.9:components/lib/panel/Panel.js`).
- Collapsed content: PrimeNG keeps it in the DOM with `aria-hidden` and `tabindex="-1"` on focusable descendants; PrimeVue hides it with `v-show`; PrimeReact sets `aria-hidden` and unmounts it after the exit transition.
- PrimeNG `toggler="header"` makes the header `div` clickable but not focusable; keyboard users still use the button.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-panel` (with `p-component`), `p-panel-toggleable`, `p-panel-header`, `p-panel-title`, `p-panel-header-actions`, `p-panel-toggle-button`, `p-panel-content-container`, `p-panel-content-wrapper`, `p-panel-content`, `p-panel-footer`. PrimeNG adds `p-panel-expanded` / `p-panel-collapsed` on the root and `p-panel-icons-start` / `-end` / `-center` on the actions (`primeng-21.1.9:packages/primeng/src/panel/style/panelstyle.ts`, `primevue-4.5.5:packages/primevue/src/panel/style/PanelStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/panel/index.mjs`, imported unchanged by PrimeNG and PrimeVue.
- Design tokens (`@primeuix/themes-2.0.3:types/panel/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 14 tokens): `root` (`background`, `borderColor`, `color`, `borderRadius`), `header` (`background`, `color`, `padding`, `borderColor`, `borderWidth`, `borderRadius`), `toggleableHeader.padding`, `title.fontWeight`, `content.padding`, `footer.padding`. Aura values: `@primeuix/themes-2.0.3:dist/aura/panel/index.mjs`.
- PrimeReact: classes and own structural CSS in `PanelBase.js`; design tokens N/A. The React styled doc lists `p-panel-titlebar` and `p-panel-titlebar-toggler`, which the 10.9.9 source no longer emits (`primereact-10.9.9:components/lib/panel/PanelBase.js`, `primereact-10.9.9:components/doc/panel/styledoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/panel/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/panel/pt/index.vue`, `primereact-10.9.9:components/doc/panel/pt/wireframe.js`.

## 9. Relationships

- Embeds Button (PrimeNG, PrimeVue) for the toggle, Plus/Minus icons, and Ripple (PrimeVue registers it; PrimeReact renders `<Ripple />` in the toggle).
- Related: Fieldset (same toggle model, native fieldset/legend), Accordion (several collapsible panels), Card (static container), Toolbar.
- PrimeNG Panel implements `BlockableUI`, so BlockUI can target it.
- The Template demo pairs Panel with Avatar, Button and Menu (`primeng-21.1.9:apps/showcase/doc/panel/template-doc.ts`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/motion`, `@primeuix/utils`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/button`, `primeng/icons`, `primeng/motion`, `primeng/ts-helpers`, `primeng/base`, `@primeuix/styles/panel` (`primeng-21.1.9:packages/primeng/src/panel/panel.ts`, `primeng-21.1.9:packages/primeng/src/panel/style/panelstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primevue/icons/minus`, `@primevue/icons/plus`, `primevue/button`, `primevue/ripple`, `@primeuix/utils`, `@primeuix/styles/panel` (`primevue-4.5.5:packages/primevue/src/panel/Panel.vue`, `primevue-4.5.5:packages/primevue/src/panel/style/PanelStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks`, `../icons/minus`, `../icons/plus`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/panel/Panel.js`).
- External npm packages: PrimeReact's CSSTransition wraps `react-transition-group`.

## 11. Framework differences

| Aspect               | PrimeNG                                 | PrimeVue                           | PrimeReact                                        |
| -------------------- | --------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| Toggle element       | `<p-button>` (text, rounded, secondary) | `<Button>` via `toggleButtonProps` | native `<button>` + Ripple                        |
| Header as toggler    | `toggler="header"`                      | no                                 | no                                                |
| Actions position     | `iconPos`                               | fixed (end)                        | fixed                                             |
| Footer placement     | inside collapsible area                 | inside collapsible area            | outside collapsible area                          |
| Collapsed content    | in DOM, `aria-hidden`, untabbable       | `v-show` hidden                    | unmounted after exit                              |
| Toggle events        | before/after + `collapsedChange`        | `toggle`, `update:collapsed`       | `onToggle`, `onExpand`, `onCollapse`              |
| Header customization | template inserted next to title         | slot replaces title                | `headerTemplate` replaces the whole header        |
| Class naming         | `@primeuix` names + state classes       | `@primeuix` names                  | legacy names (`p-panel-icons`, `p-panel-toggler`) |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/panel/panel.ts`
- `primeng-21.1.9:packages/primeng/src/panel/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/panel/style/panelstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/panel/panel.types.ts`
- `primeng-21.1.9:apps/showcase/doc/panel/` (`import-doc.ts`, `basic-doc.ts`, `toggleable-doc.ts`, `template-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/panel/Panel.vue`
- `primevue-4.5.5:packages/primevue/src/panel/BasePanel.vue`
- `primevue-4.5.5:packages/primevue/src/panel/Panel.d.ts`
- `primevue-4.5.5:packages/primevue/src/panel/style/PanelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/panel/` (`ImportDoc.vue`, `BasicDoc.vue`, `ToggleableDoc.vue`, `TemplateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/panel/Panel.js`
- `primereact-10.9.9:components/lib/panel/PanelBase.js`
- `primereact-10.9.9:components/lib/panel/panel.d.ts`
- `primereact-10.9.9:components/doc/panel/` (`importdoc.js`, `basicdoc.js`, `toggleabledoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/panel/index.mjs`
- `@primeuix/themes-2.0.3:types/panel/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/panel/index.mjs`
