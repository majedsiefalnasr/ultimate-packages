# CascadeSelect

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

CascadeSelect is a single-value dropdown for hierarchical data. Its overlay shows the top-level options; hovering or arrowing into a group opens the next level beside it as a cascading sub-menu, and only a leaf option can be selected. The trigger looks like a Select: a read-only label showing the chosen option's label (or a placeholder), an optional clear icon, a loading state and a chevron button. On narrow viewports PrimeNG and PrimeVue switch to a stacked "mobile" layout below a configurable `breakpoint`.

## 2. Names & status

- Canonical name: **CascadeSelect** (file `cascadeselect`); same name in all three frameworks; stable.
- PrimeNG: selectors `p-cascadeSelect`, `p-cascadeselect`, `p-cascade-select`; deprecated input `styleClass` (since v20.0.0, use `class`) (`primeng-21.1.9:packages/primeng/src/cascadeselect/cascadeselect.ts`).
- PrimeVue: deprecated since v4.0 — `panelClass`, `panelStyle`, `panelProps` (use `overlayClass`, `overlayStyle`, `overlayProps`) (`primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelect.d.ts`).
- PrimeReact: no deprecated members (`primereact-10.9.9:components/lib/cascadeselect/cascadeselect.d.ts`).

## 3. Per framework

### PrimeNG 21.1.9

- Import: `CascadeSelectModule` (exports `CascadeSelect`, `SharedModule`) or standalone `CascadeSelect` from `primeng/cascadeselect` (`primeng-21.1.9:apps/showcase/doc/cascadeselect/import-doc.ts`).
- Class: `export class CascadeSelect extends BaseEditableHolder<CascadeSelectPassThrough>` with providers `CASCADESELECT_VALUE_ACCESSOR`, `CascadeSelectStyle`, `PARENT_INSTANCE`, `CASCADESELECT_INSTANCE`; recursive helper `CascadeSelectSub` (selector `ul[pCascadeSelectSub]`, `extends BaseComponent`) renders each level.
- Source: `primeng-21.1.9:packages/primeng/src/cascadeselect/cascadeselect.ts`, style `primeng-21.1.9:packages/primeng/src/cascadeselect/style/cascadeselectstyle.ts`, types `primeng-21.1.9:packages/primeng/src/types/cascadeselect/cascadeselect.types.ts`, entry `primeng-21.1.9:packages/primeng/src/cascadeselect/public_api.ts`.

### PrimeVue 4.5.5

- Import: `import CascadeSelect from 'primevue/cascadeselect'` (`primevue-4.5.5:apps/showcase/doc/cascadeselect/ImportDoc.vue`).
- Source: `primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelect.vue`, `primevue-4.5.5:packages/primevue/src/cascadeselect/BaseCascadeSelect.vue` (`extends: BaseInput`), `primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelectSub.vue`, types `primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelect.d.ts`, style `primevue-4.5.5:packages/primevue/src/cascadeselect/style/CascadeSelectStyle.js`.

### PrimeReact 10.9.9

- Import: `import { CascadeSelect } from 'primereact/cascadeselect'` (`primereact-10.9.9:components/doc/cascadeselect/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/cascadeselect/CascadeSelect.js`, `primereact-10.9.9:components/lib/cascadeselect/CascadeSelectSub.js`, base `primereact-10.9.9:components/lib/cascadeselect/CascadeSelectBase.js`, types `primereact-10.9.9:components/lib/cascadeselect/cascadeselect.d.ts`.

## 4. Anatomy

PrimeNG PT keys (`CascadeSelectPassThroughOptions`, `primeng-21.1.9:packages/primeng/src/types/cascadeselect/cascadeselect.types.ts`) and PrimeVue PT keys (`primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelect.d.ts`) describe the same tree:

- **root** — wrapper `div`.
- **hiddenInputWrapper / hiddenInput** (PrimeNG) or **hiddenInputContainer / hiddenInput** (PrimeVue) — a visually hidden, read-only focusable input with the combobox semantics.
- **label** — the visible value/placeholder text.
- **clearIcon** — optional clear control.
- **dropdown** → **loadingIcon** or **dropdownIcon**.
- **hiddenSearchResult**, **hiddenSelectedMessage** (PrimeNG binds `selectedMessageText`) — polite live regions.
- **overlay** (PrimeNG via `pcOverlay`; PrimeVue via `Portal` + **transition**) → **listContainer** → **list** (level 0) → **option** → **optionContent** → **optionText** + **groupIcon** (PrimeVue also **groupIconContainer**) → nested **optionList** for the next level.

PrimeReact PT keys (`primereact-10.9.9:components/lib/cascadeselect/cascadeselect.d.ts`): root, hiddenSelectedMessage, input, label, dropdownButton, dropdownIcon, loadingIcon, panel, wrapper, list, sublist, item, content, text, optionGroupIcon, transition.

## 5. API highlights

- **Data:** `options` (nested array); `optionLabel`, `optionValue`, `optionGroupLabel`, `optionGroupChildren` (a string or a per-level string array — e.g. `['states', 'cities']`), `optionDisabled` (PrimeNG/PrimeVue); `dataKey`. PrimeVue accepts functions for the label/value/group fields.
- **Value:** PrimeNG `ngModel`/form control (`BaseEditableHolder`), PrimeVue `v-model` (`modelValue`, `defaultValue`), PrimeReact `value` + `onChange(e: CascadeSelectChangeEvent)`.
- **Events:** `onChange`/`change`, `onGroupChange`/`group-change` (a group expanded), `onShow`, `onHide`, `onBeforeShow`, `onBeforeHide` (all three); `onFocus`, `onBlur`, `onClear` (PrimeNG); PrimeVue emits `focus`, `blur`, `click`, `update:modelValue`, `value-change` but no `clear`; PrimeReact has no `onClear`.
- **Display:** `placeholder`; `showClear = false`; `loading = false` with `loadingIcon`; PrimeNG `inputLabel`; PrimeVue `dropdownIcon`, `clearIcon`, `optionGroupIcon` icon-class props; PrimeReact `dropdownIcon`, `loadingIcon`, `optionGroupIcon` as `IconType`.
- **Overlay:** PrimeNG `appendTo = 'self'` (signal), `overlayOptions`, `motionOptions`, `panelStyle`, `panelStyleClass`; PrimeVue `appendTo = 'body'`, `overlayClass`, `overlayStyle`, `overlayProps`; PrimeReact `appendTo = document.body`, `panelClassName`, `panelStyle`, `transitionOptions`, `scrollHeight = '400px'` (used in the mobile media rule).
- **Responsive:** `breakpoint` — PrimeNG/PrimeVue `'960px'`; PrimeReact no default (the media rule is only emitted when set).
- **Focus behaviour (PrimeNG/PrimeVue):** `autoOptionFocus = false`, `selectOnFocus = false`, `focusOnHover = true`, `searchLocale` (type-ahead search on printable keys), messages `searchMessage`, `selectionMessage`, `emptySelectionMessage`, `emptySearchMessage`, `emptyMessage`.
- **Form inputs:** PrimeNG/PrimeVue `size: 'small' | 'large'`, `variant: 'outlined' | 'filled'`, `fluid`, `invalid`, `disabled`, `name`, `required` (PrimeNG), `inputId`, `tabindex`, `ariaLabel`, `ariaLabelledBy` / `ariaLabelledby`; PrimeVue `inputClass`, `inputStyle`, `inputProps`, `formControl`; PrimeReact `variant`, `invalid`, `disabled`, `inputId`, `inputRef`, `name`, `tabIndex`, `autoFocus`, `ariaLabelledBy`.
- **Templates:** PrimeNG `value`, `option`, `header`, `footer`, `triggericon`, `loadingicon`, `optiongroupicon`, `clearicon`; PrimeVue slots `value`, `option`, `header`, `footer`, `dropdownicon`, `loadingicon`, `optiongroupicon`, `clearicon`; PrimeReact `itemTemplate`.
- **Methods (PrimeReact):** `focus()`, `getElement()`, `getInput()`, `getLabel()`, `getOverlay()`.

## 6. Usage guidance

- Basic: nested options with per-level `optionGroupChildren` and a placeholder (`primeng-21.1.9:apps/showcase/doc/cascadeselect/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/BasicDoc.vue`, `primereact-10.9.9:components/doc/cascadeselect/basicdoc.js`).
- Template: custom option content (e.g. flags/icons per level) and header/footer (`primeng-21.1.9:apps/showcase/doc/cascadeselect/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/TemplateDoc.vue`, `primereact-10.9.9:components/doc/cascadeselect/templatedoc.js`).
- Loading state: show a spinner in place of the chevron while options load (`primeng-21.1.9:apps/showcase/doc/cascadeselect/loading-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/LoadingStateDoc.vue`, `primereact-10.9.9:components/doc/cascadeselect/loadingdoc.js`).
- Clear icon: `showClear` resets the value (`primeng-21.1.9:apps/showcase/doc/cascadeselect/clearicon-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/ClearIconDoc.vue`, `primereact-10.9.9:components/doc/cascadeselect/clearicondoc.js`).
- Float label and Ifta label (Ifta PrimeNG/PrimeVue only) (`primeng-21.1.9:apps/showcase/doc/cascadeselect/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/IftaLabelDoc.vue`, `primereact-10.9.9:components/doc/cascadeselect/floatlabeldoc.js`).
- Sizes and fluid (PrimeNG/PrimeVue) (`primeng-21.1.9:apps/showcase/doc/cascadeselect/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FluidDoc.vue`).
- Filled, disabled and invalid states (`primeng-21.1.9:apps/showcase/doc/cascadeselect/filled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/InvalidDoc.vue`, `primereact-10.9.9:components/doc/cascadeselect/filleddoc.js`, `primereact-10.9.9:components/doc/cascadeselect/disableddoc.js`, `primereact-10.9.9:components/doc/cascadeselect/invaliddoc.js`).
- Forms: Angular template-driven and reactive forms; `@primevue/forms` (`primeng-21.1.9:apps/showcase/doc/cascadeselect/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FormsDoc.vue`).
- Section order per showcase page: `primeng-21.1.9:apps/showcase/pages/cascadeselect/index.ts`, `primevue-4.5.5:apps/showcase/pages/cascadeselect/index.vue`, `primereact-10.9.9:pages/cascadeselect/index.js`.

## 7. Accessibility

- PrimeNG/PrimeVue: focus lives on a visually hidden read-only input with `role="combobox"`, `aria-haspopup="tree"`, `aria-expanded`, `aria-controls` (`<id>_tree` while open), `aria-activedescendant`; PrimeVue also sets `aria-invalid`. The popup `ul` has `role="tree"` with `aria-orientation="horizontal"`; each option `li` is a `treeitem` with `aria-label`, `aria-selected` (leaves only), `aria-level`, `aria-setsize`, `aria-posinset`; PrimeVue adds `aria-expanded` on groups and `role="group"` on nested lists (`primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelectSub.vue`). PrimeNG passes `'group'` to the nested sub-list through an `attrrole` input rather than a bound `role` attribute, and does not set `aria-expanded` on group treeitems (`primeng-21.1.9:packages/primeng/src/cascadeselect/cascadeselect.ts`).
- Keyboard (PrimeNG/PrimeVue handlers): Down/Up move focus or open the overlay (Alt+Up closes), Right opens a group, Left returns to the parent level, Home/End, Space/Enter select or expand, Escape closes, Tab selects/leaves, printable keys perform type-ahead search (`primevue-4.5.5:apps/showcase/doc/cascadeselect/AccessibilityDoc.vue`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/accessibility-doc.ts`).
- PrimeReact: the hidden input sets only `aria-haspopup="listbox"` plus any `aria-*` props passed through; it has no `combobox` role or `aria-expanded`. Lists use `role="listbox"` with items `role="none"` and a focusable content `div` per item (`tabIndex=0`) that handles Arrow keys, Enter, Tab and Escape (`primereact-10.9.9:components/lib/cascadeselect/CascadeSelectSub.js`). The PrimeReact accessibility doc nevertheless describes combobox/tree/treeitem semantics and a `filterInputProps` option that does not exist in this component (`primereact-10.9.9:components/doc/cascadeselect/accessibilitydoc.js`).
- Clear icon: `aria-hidden` in PrimeNG; PrimeReact gives it `aria-label` = `localeOption('clear')` and Enter/Space handling.

## 8. Theming

- Classes (PrimeNG/PrimeVue, `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`): `p-cascadeselect`, `p-cascadeselect-label`, `p-cascadeselect-clear-icon`, `p-cascadeselect-dropdown`, `p-cascadeselect-dropdown-icon`, `p-cascadeselect-loading-icon`, `p-cascadeselect-overlay`, `p-cascadeselect-list-container`, `p-cascadeselect-list`, `p-cascadeselect-item`, `p-cascadeselect-item-content`, `p-cascadeselect-item-text`, `p-cascadeselect-group-icon`, `p-cascadeselect-item-list`.
- PT keys: see Anatomy; PrimeNG adds `pcOverlay`.
- Design tokens (`@primeuix/themes-2.0.3:types/cascadeselect/index.d.ts`): `root` (field colours incl. `invalidPlaceholderColor`, padding, radius, `focusRing`, `transitionDuration`, `sm`, `lg`), `dropdown` (width, color), `overlay`, `list` (padding, gap, `mobileIndent`), `option` (focus/selected colours, padding, radius, `icon`), `clearIcon`. Aura values: `@primeuix/themes-2.0.3:dist/aura/cascadeselect/index.mjs`.
- Style module: `@primeuix/styles-2.0.3:dist/cascadeselect/index.mjs`.
- PrimeReact: classes and structural CSS in `CascadeSelectBase.js` — `p-cascadeselect p-component p-inputwrapper` (+ `p-disabled`, `p-invalid`, `p-variant-filled`, `p-focus`, `p-inputwrapper-filled`, `p-inputwrapper-focus`), `p-cascadeselect-label` (+ `p-placeholder`, `p-cascadeselect-label-empty`), `p-cascadeselect-trigger`, `p-cascadeselect-trigger-icon`, `p-cascadeselect-clear-icon`, `p-cascadeselect-panel`, `p-cascadeselect-items-wrapper`, `p-cascadeselect-items`, `p-cascadeselect-sublist`, `p-cascadeselect-item` (+ `p-cascadeselect-item-group`, `p-cascadeselect-item-active`, `p-highlight`), `p-cascadeselect-item-content`, `p-cascadeselect-item-text`, `p-cascadeselect-group-icon`, transition `p-connected-overlay`; a per-instance `<style>` is injected for the `breakpoint` media rule (`primereact-10.9.9:components/lib/cascadeselect/CascadeSelect.js`). Design tokens N/A.

## 9. Relationships

- Sibling selection components: Select and TreeSelect (Form B) — Select for flat lists, TreeSelect for hierarchical data shown as an indented tree rather than cascading panels.
- Wrapped by: [FloatLabel](floatlabel.md), [IftaLabel](iftalabel.md) (PrimeNG/PrimeVue), [InputGroup](inputgroup.md).
- Embeds: Overlay (PrimeNG) / Portal (PrimeVue, PrimeReact), Ripple.

## 10. Dependencies

- PrimeNG: `primeng/baseeditableholder`, `primeng/basecomponent`, `primeng/overlay`, `primeng/autofocus`, `primeng/bind`, `primeng/fluid`, `primeng/ripple`, `primeng/icons` (AngleRight, ChevronDown, Times), `primeng/api` (`OverlayService`, `OverlayOptions`, `TranslationKeys`), `@primeuix/utils`, `@primeuix/motion`, `@angular/forms`.
- PrimeVue: `@primevue/core` (BaseInput, `ConnectedOverlayScrollHandler`), `primevue/portal`, `primevue/overlayeventbus`, `primevue/ripple`, `@primevue/icons` (angleright, chevrondown, spinner, times), `@primeuix/utils` (dom, object, zindex).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks` (incl. `useGlobalOnEscapeKey`, `useOverlayListener`), `../overlayservice/OverlayService`, `../portal/Portal`, `../ripple/Ripple`, icons (chevrondown, spinner, times, angleright), `../utils/Utils`.
- No external npm dependencies.

## 11. Framework differences

| Aspect               | PrimeNG                              | PrimeVue                                 | PrimeReact                           |
| -------------------- | ------------------------------------ | ---------------------------------------- | ------------------------------------ |
| Base class           | `BaseEditableHolder`                 | `BaseInput`                              | `CascadeSelectBase` defaults         |
| `appendTo` default   | `'self'`                             | `'body'`                                 | `document.body`                      |
| `breakpoint` default | `'960px'`                            | `'960px'`                                | none                                 |
| Popup ARIA           | combobox → `tree` / `treeitem`       | combobox → `tree` / `treeitem` / `group` | `listbox` lists, items `role="none"` |
| Clear event          | `onClear`                            | — (`showClear` only)                     | — (`showClear` only)                 |
| Option disabling     | `optionDisabled`                     | `optionDisabled`                         | —                                    |
| Type-ahead search    | yes (`searchLocale`)                 | yes (`searchLocale`)                     | —                                    |
| Templates            | value, option, header, footer, icons | value, option, header, footer, icons     | `itemTemplate`                       |
| Sizes / fluid        | `size`, `fluid`                      | `size`, `fluid`                          | —                                    |
| Design tokens        | `@primeuix/themes` cascadeselect     | `@primeuix/themes` cascadeselect         | N/A (theme CSS)                      |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/cascadeselect/cascadeselect.ts`, `primeng-21.1.9:packages/primeng/src/cascadeselect/style/cascadeselectstyle.ts`, `primeng-21.1.9:packages/primeng/src/cascadeselect/public_api.ts`, `primeng-21.1.9:packages/primeng/src/types/cascadeselect/cascadeselect.types.ts`
- `primeng-21.1.9:apps/showcase/pages/cascadeselect/index.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/template-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/loading-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/iftalabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/clearicon-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/fluid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/filled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/cascadeselect/accessibility-doc.ts`
- `primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelect.vue`, `primevue-4.5.5:packages/primevue/src/cascadeselect/BaseCascadeSelect.vue`, `primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelectSub.vue`, `primevue-4.5.5:packages/primevue/src/cascadeselect/CascadeSelect.d.ts`, `primevue-4.5.5:packages/primevue/src/cascadeselect/style/CascadeSelectStyle.js`
- `primevue-4.5.5:apps/showcase/pages/cascadeselect/index.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/TemplateDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/LoadingStateDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/IftaLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/ClearIconDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FluidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/cascadeselect/AccessibilityDoc.vue`
- `primereact-10.9.9:components/lib/cascadeselect/CascadeSelect.js`, `primereact-10.9.9:components/lib/cascadeselect/CascadeSelectSub.js`, `primereact-10.9.9:components/lib/cascadeselect/CascadeSelectBase.js`, `primereact-10.9.9:components/lib/cascadeselect/cascadeselect.d.ts`
- `primereact-10.9.9:pages/cascadeselect/index.js`, `primereact-10.9.9:components/doc/cascadeselect/importdoc.js`, `primereact-10.9.9:components/doc/cascadeselect/basicdoc.js`, `primereact-10.9.9:components/doc/cascadeselect/loadingdoc.js`, `primereact-10.9.9:components/doc/cascadeselect/templatedoc.js`, `primereact-10.9.9:components/doc/cascadeselect/clearicondoc.js`, `primereact-10.9.9:components/doc/cascadeselect/floatlabeldoc.js`, `primereact-10.9.9:components/doc/cascadeselect/filleddoc.js`, `primereact-10.9.9:components/doc/cascadeselect/invaliddoc.js`, `primereact-10.9.9:components/doc/cascadeselect/disableddoc.js`, `primereact-10.9.9:components/doc/cascadeselect/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/cascadeselect/index.mjs`, `@primeuix/themes-2.0.3:types/cascadeselect/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/cascadeselect/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
