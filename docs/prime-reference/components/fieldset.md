# Fieldset

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Fieldset groups related content inside a native `<fieldset>` element with a `<legend>` caption, and can optionally collapse and expand its content through a toggle button in the legend. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/fieldset/fieldset.ts`, `primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.vue`, `primereact-10.9.9:components/lib/fieldset/Fieldset.js`).

## 2. Names & status

- Canonical name: **Fieldset** in all three frameworks; no legacy aliases.
- Not deprecated as a component. Deprecated members:
  - PrimeNG `styleClass` (since v20.0.0, use `class`) and `transitionOptions` (since v21.0.0, use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/fieldset/fieldset.ts`).
  - PrimeVue `togglericon` slot (since v4.0, use `toggleicon`) (`primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.d.ts`).
- Listed in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                            | PrimeVue                                                                                                     | PrimeReact                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Import         | `import { FieldsetModule } from 'primeng/fieldset'` (component `Fieldset` is standalone)                           | `import Fieldset from 'primevue/fieldset'`                                                                   | `import { Fieldset } from 'primereact/fieldset'`                          |
| Selector / tag | `<p-fieldset>`                                                                                                     | `<Fieldset>`                                                                                                 | `<Fieldset />`                                                            |
| Source         | `packages/primeng/src/fieldset/fieldset.ts`, `style/fieldsetstyle.ts`, types in `types/fieldset/fieldset.types.ts` | `packages/primevue/src/fieldset/Fieldset.vue`, `BaseFieldset.vue`, `Fieldset.d.ts`, `style/FieldsetStyle.js` | `components/lib/fieldset/Fieldset.js`, `FieldsetBase.js`, `fieldset.d.ts` |
| Base class     | `BaseComponent<FieldsetPassThrough>`, implements `BlockableUI`                                                     | `BaseComponent` (via `BaseFieldset`, provides `$pcFieldset`)                                                 | `ComponentBase.extend` (`FieldsetBase`)                                   |
| Sub-components | none                                                                                                               | none                                                                                                         | none                                                                      |

Sources: `primeng-21.1.9:apps/showcase/doc/fieldset/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/fieldset/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/fieldset/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/fieldset/BaseFieldset.vue`, `primereact-10.9.9:components/doc/fieldset/importdoc.js`, `primereact-10.9.9:components/lib/fieldset/FieldsetBase.js`.

## 4. Anatomy

| Part              | Element             | PrimeNG PT key     | PrimeVue PT key    | PrimeReact PT key   | Class (PrimeNG / PrimeVue)     | Class (PrimeReact)       |
| ----------------- | ------------------- | ------------------ | ------------------ | ------------------- | ------------------------------ | ------------------------ |
| Root              | `<fieldset>`        | `root`             | `root`             | `root`              | `p-fieldset`                   | `p-fieldset`             |
| Legend            | `<legend>`          | `legend`           | `legend`           | `legend`            | `p-fieldset-legend`            | `p-fieldset-legend`      |
| Toggle button     | `<button>` / `<a>`  | `toggleButton`     | `toggleButton`     | `toggler`           | `p-fieldset-toggle-button`     | —                        |
| Toggle icon       | icon                | `toggleIcon`       | `toggleIcon`       | `togglerIcon`       | `p-fieldset-toggle-icon`       | `p-fieldset-toggler`     |
| Legend label      | `<span>`            | `legendLabel`      | `legendLabel`      | `legendTitle`       | `p-fieldset-legend-label`      | `p-fieldset-legend-text` |
| Content container | `<div role=region>` | `contentContainer` | `contentContainer` | `toggleableContent` | `p-fieldset-content-container` | `p-toggleable-content`   |
| Content wrapper   | `<div>`             | `contentWrapper`   | `contentWrapper`   | —                   | `p-fieldset-content-wrapper`   | —                        |
| Content           | `<div>`             | `content`          | `content`          | `content`           | `p-fieldset-content`           | `p-fieldset-content`     |
| Animation         | —                   | `motion`           | `transition`       | `transition`        | —                              | —                        |

- When toggleable, the toggle button (holding the icon and label) sits inside the legend; otherwise the legend holds only the label.
- PrimeReact renders the legend only when `legend` is set or the fieldset is toggleable, and uses an `<a>` with `role="button"` as the toggler instead of a `<button>` (`primereact-10.9.9:components/lib/fieldset/Fieldset.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/fieldset/fieldset.types.ts`, `primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.d.ts`, `primereact-10.9.9:components/lib/fieldset/fieldset.d.ts`.

## 5. API highlights

Shared props: `legend` (string; `ReactNode` in PrimeReact), `toggleable: boolean = false`, `collapsed: boolean = false`.

| Member              | PrimeNG                                                                                                                          | PrimeVue                                                            | PrimeReact                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Two-way collapsed   | `[(collapsed)]` via `collapsedChange: EventEmitter<boolean>`                                                                     | `v-model:collapsed` via `update:collapsed`                          | controlled when `onToggle` is provided, otherwise internal state                              |
| Toggle events       | `onBeforeToggle(FieldsetBeforeToggleEvent)`, `onAfterToggle(FieldsetAfterToggleEvent)` (`originalEvent`, `collapsed`)            | `toggle({ originalEvent, value })`                                  | `onToggle(FieldsetToggleEvent { originalEvent, value })`, `onExpand`, `onCollapse`, `onClick` |
| Animation           | `motionOptions` (signal input, `MotionOptions`); `transitionOptions: string = '400ms cubic-bezier(0.86, 0, 0.07, 1)'` deprecated | Vue `<transition name="p-collapsible">`                             | `transitionOptions: CSSTransitionProps`                                                       |
| Icons               | `expandicon`, `collapseicon` templates                                                                                           | `toggleicon` slot `{ collapsed, class }` (`togglericon` deprecated) | `expandIcon`, `collapseIcon` (`IconType`)                                                     |
| Legend content      | `header` template or `<p-header>` facet                                                                                          | `legend` slot `{ toggleCallback }`                                  | `legend` as `ReactNode`                                                                       |
| Body content        | projection plus `content` template                                                                                               | default slot                                                        | `children`                                                                                    |
| Toggle button attrs | —                                                                                                                                | `toggleButtonProps` (bound onto the button, may carry `ariaLabel`)  | —                                                                                             |
| Methods             | `getBlockableElement()`                                                                                                          | —                                                                   | `getElement()`, `getContent()`                                                                |

- The default expand icon is a plus and the collapse icon a minus in all three (`primeng-21.1.9:packages/primeng/src/fieldset/fieldset.ts`, `primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.vue`, `primereact-10.9.9:components/lib/fieldset/Fieldset.js`).
- Full API: catalog module `fieldset` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — set `legend` and place the grouped content inside (`primeng-21.1.9:apps/showcase/doc/fieldset/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fieldset/BasicDoc.vue`, `primereact-10.9.9:components/doc/fieldset/basicdoc.js`).
- **Toggleable** — enable `toggleable` to let users collapse the content; `collapsed` sets the initial state. PrimeReact documents controlled (`collapsed` + `onToggle`) and uncontrolled modes (`primeng-21.1.9:apps/showcase/doc/fieldset/toggleable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fieldset/ToggleableDoc.vue`, `primereact-10.9.9:components/doc/fieldset/toggleabledoc.js`).
- **Template** — replace the legend text with custom markup such as an avatar and a name (`primeng-21.1.9:apps/showcase/doc/fieldset/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fieldset/TemplateDoc.vue`, `primereact-10.9.9:components/doc/fieldset/templatedoc.js`).

No services or providers are required.

## 7. Accessibility

- Uses the semantic `<fieldset>` / `<legend>` pair, so the legend names the group (`primeng-21.1.9:apps/showcase/doc/fieldset/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fieldset/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/fieldset/accessibilitydoc.js`).
- Toggleable mode: the legend contains a button-role element with `aria-controls` pointing at the content, `aria-expanded` reflecting the state and an accessible name taken from `legend` (PrimeVue: `toggleButtonProps.ariaLabel` first). The content container has `role="region"` and `aria-labelledby` pointing at the toggle/legend id.
- Keyboard: Tab / Shift+Tab move focus; Enter and Space toggle the content. Source also accepts NumpadEnter in PrimeVue and PrimeReact (`primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.vue`, `primereact-10.9.9:components/lib/fieldset/Fieldset.js`).
- Collapsed content handling differs: PrimeNG keeps the content in the DOM and sets `aria-hidden` plus `tabindex="-1"` on it and on focusable descendants; PrimeVue hides it with `v-show`; PrimeReact unmounts it on exit (`primeng-21.1.9:packages/primeng/src/fieldset/fieldset.ts`).

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-fieldset` (with `p-component`), `p-fieldset-toggleable`, `p-fieldset-collapsed` (PrimeNG only, when toggleable and collapsed), `p-fieldset-legend`, `p-fieldset-legend-label`, `p-fieldset-toggle-button`, `p-fieldset-toggle-icon`, `p-fieldset-content-container`, `p-fieldset-content-wrapper`, `p-fieldset-content` (`primeng-21.1.9:packages/primeng/src/fieldset/style/fieldsetstyle.ts`, `primevue-4.5.5:packages/primevue/src/fieldset/style/FieldsetStyle.js`). The catalog `FieldsetClasses` enums list a subset.
- Structural CSS: `@primeuix/styles-2.0.3:dist/fieldset/index.mjs`, imported unchanged by PrimeNG and PrimeVue.
- Design tokens (`@primeuix/themes-2.0.3:types/fieldset/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 24 tokens): `root` (`background`, `borderColor`, `borderRadius`, `color`, `padding`, `transitionDuration`), `legend` (`background`, `hoverBackground`, `color`, `hoverColor`, `borderRadius`, `borderWidth`, `borderColor`, `padding`, `gap`, `fontWeight`, `focusRing.*`), `toggleIcon` (`color`, `hoverColor`), `content.padding`. Aura values: `@primeuix/themes-2.0.3:dist/aura/fieldset/index.mjs`.
- PrimeReact: classes and own structural CSS in `FieldsetBase.js` (`p-fieldset-legend` with `p-unselectable-text`, `p-fieldset-legend-text`, `p-fieldset-toggler`, `p-toggleable-content`, `p-fieldset-content`); design tokens N/A (`primereact-10.9.9:components/lib/fieldset/FieldsetBase.js`, `primereact-10.9.9:components/doc/fieldset/styledoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/fieldset/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/fieldset/pt/index.vue`, `primereact-10.9.9:components/doc/fieldset/pt/wireframe.js`.

## 9. Relationships

- Embeds icons (Plus, Minus) and, in PrimeVue and PrimeReact, the Ripple directive/component on the toggle.
- Related: Panel (same toggle model with a header bar instead of a legend), Accordion (several collapsible sections), Card (static container).
- PrimeNG Fieldset implements `BlockableUI`, so BlockUI can target it.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/motion`, `@primeuix/utils`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/icons`, `primeng/motion`, `primeng/base`, `@primeuix/styles/fieldset` (`primeng-21.1.9:packages/primeng/src/fieldset/fieldset.ts`, `primeng-21.1.9:packages/primeng/src/fieldset/style/fieldsetstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primevue/icons/minus`, `@primevue/icons/plus`, `primevue/ripple`, `@primeuix/utils`, `@primeuix/styles/fieldset` (`primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.vue`, `primevue-4.5.5:packages/primevue/src/fieldset/style/FieldsetStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks`, `../icons/minus`, `../icons/plus`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/fieldset/Fieldset.js`).
- External npm packages: PrimeReact's CSSTransition wraps `react-transition-group`.

## 11. Framework differences

| Aspect               | PrimeNG                                          | PrimeVue                          | PrimeReact                                                  |
| -------------------- | ------------------------------------------------ | --------------------------------- | ----------------------------------------------------------- |
| Toggle element       | `<button role="button">`                         | `<button type="button">` + ripple | `<a role="button">` + ripple                                |
| Collapsed content    | kept in DOM, `aria-hidden`, untabbable           | `v-show` hidden                   | unmounted                                                   |
| Animation API        | `motionOptions` (`transitionOptions` deprecated) | Vue transition + `pt.transition`  | `transitionOptions` (CSSTransition)                         |
| Toggle events        | before/after toggle + `collapsedChange`          | `toggle`, `update:collapsed`      | `onToggle`, `onExpand`, `onCollapse`                        |
| Collapsed root class | `p-fieldset-collapsed`                           | none                              | none                                                        |
| Content wrapper      | yes                                              | yes                               | no                                                          |
| Class naming         | `@primeuix` names                                | `@primeuix` names                 | legacy names (`p-fieldset-toggler`, `p-toggleable-content`) |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/fieldset/fieldset.ts`
- `primeng-21.1.9:packages/primeng/src/fieldset/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/fieldset/style/fieldsetstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/fieldset/fieldset.types.ts`
- `primeng-21.1.9:apps/showcase/doc/fieldset/` (`import-doc.ts`, `basic-doc.ts`, `toggleable-doc.ts`, `template-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.vue`
- `primevue-4.5.5:packages/primevue/src/fieldset/BaseFieldset.vue`
- `primevue-4.5.5:packages/primevue/src/fieldset/Fieldset.d.ts`
- `primevue-4.5.5:packages/primevue/src/fieldset/style/FieldsetStyle.js`
- `primevue-4.5.5:apps/showcase/doc/fieldset/` (`ImportDoc.vue`, `BasicDoc.vue`, `ToggleableDoc.vue`, `TemplateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/fieldset/Fieldset.js`
- `primereact-10.9.9:components/lib/fieldset/FieldsetBase.js`
- `primereact-10.9.9:components/lib/fieldset/fieldset.d.ts`
- `primereact-10.9.9:components/doc/fieldset/` (`importdoc.js`, `basicdoc.js`, `toggleabledoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/fieldset/index.mjs`
- `@primeuix/themes-2.0.3:types/fieldset/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/fieldset/index.mjs`
