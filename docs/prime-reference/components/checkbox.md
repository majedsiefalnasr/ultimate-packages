# Checkbox

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Checkbox is a themed wrapper around the native `input type="checkbox"`. The real input is stretched over a styled box and made invisible, so keyboard, focus and form semantics stay native while the look comes from design tokens. All three frameworks support a single boolean value with custom `trueValue` / `falseValue`; PrimeNG and PrimeVue also support a multi-value mode where the model is an array and each checkbox adds or removes its own `value`. Only PrimeNG and PrimeVue offer an `indeterminate` state, only PrimeVue ships a `CheckboxGroup` wrapper, and PrimeReact is fully controlled through `checked` + `onChange` (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).

## 2. Names & status

- Canonical name: **Checkbox**. Not deprecated in any of the three frameworks (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Listed in the Form group of all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- PrimeNG selector aliases: `p-checkbox`, `p-checkBox` and `p-check-box` all resolve to the same component (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`).
- Deprecated member: PrimeNG `styleClass` is marked deprecated since v20.0.0 in favour of `class` (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `docs/prime-reference/catalog/primeng.json`).
- Related component modules: PrimeVue also ships `CheckboxGroup` (separate module `checkboxgroup`) with its own style module; PrimeNG and PrimeReact have no group component (`primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.vue`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primereact.json`).
- Removed siblings: TriStateCheckbox was dropped from PrimeNG (v19) and PrimeVue (v4) with Checkbox `indeterminate` as the documented replacement, and it survives in PrimeReact only. See [TriStateCheckbox](tristatecheckbox.md) and [MultiStateCheckbox](multistatecheckbox.md) (`primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`, `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                    | PrimeVue                                                                                                           | PrimeReact                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Import         | `import { CheckboxModule } from 'primeng/checkbox'`                                                        | `import Checkbox from 'primevue/checkbox'`; `import CheckboxGroup from 'primevue/checkboxgroup'`                   | `import { Checkbox } from 'primereact/checkbox'`                                  |
| Selector / tag | `<p-checkbox>` (aliases `p-checkBox`, `p-check-box`)                                                       | `<Checkbox>`, `<CheckboxGroup>`                                                                                    | `<Checkbox />`                                                                    |
| Source         | `packages/primeng/src/checkbox/checkbox.ts`, `style/checkboxstyle.ts`, `public_api.ts`                     | `packages/primevue/src/checkbox/Checkbox.vue`, `BaseCheckbox.vue`, `Checkbox.d.ts`, `style/CheckboxStyle.js`       | `components/lib/checkbox/Checkbox.js`, `CheckboxBase.js`, `checkbox.d.ts`         |
| Types          | `packages/primeng/src/types/checkbox/checkbox.types.ts`                                                    | `Checkbox.d.ts`; group: `packages/primevue/src/checkboxgroup/CheckboxGroup.d.ts`                                   | `checkbox.d.ts`                                                                   |
| Exports        | `Checkbox` (standalone), `CheckboxModule`, `CHECKBOX_VALUE_ACCESSOR`, `CheckboxStyle`, `CheckboxClasses`   | `Checkbox`, `CheckboxGroup`; style modules `CheckboxStyle`, `CheckboxGroupStyle`                                   | `Checkbox` (also re-exported from the all-in-one bundle)                          |
| Base class     | `BaseEditableHolder<CheckboxPassThrough>` (value accessor, `required`/`invalid`/`disabled`/`name` signals) | `BaseCheckbox` → `BaseInput` → `BaseEditableHolder` (`modelValue`, `defaultValue`, `size`, `variant`, `formField`) | `ComponentBase.extend` (`CheckboxBase`); declared as a class component in `.d.ts` |
| Form binding   | `ngModel`, `formControlName`, or the `formControl` input via `NG_VALUE_ACCESSOR`                           | `v-model` / `modelValue`, uncontrolled `defaultValue`, PrimeVue Forms via `name`                                   | none; controlled `checked` + `onChange`                                           |
| Showcase page  | `apps/showcase/pages/checkbox/index.ts`                                                                    | `apps/showcase/pages/checkbox/index.vue`                                                                           | `pages/checkbox/index.js`                                                         |

Sources: `primeng-21.1.9:apps/showcase/doc/checkbox/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/checkbox/public_api.ts`, `primeng-21.1.9:packages/primeng/src/checkbox/ng-package.json`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primevue-4.5.5:apps/showcase/doc/checkbox/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/checkbox/package.json`, `primevue-4.5.5:packages/primevue/src/checkbox/BaseCheckbox.vue`, `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`, `primereact-10.9.9:components/doc/checkbox/importdoc.js`, `primereact-10.9.9:components/lib/checkbox/package.json`, `primereact-10.9.9:components/lib/primereact.all.js`.

## 4. Anatomy

| Part        | Element                                           | PrimeNG PT key | PrimeVue PT key        | PrimeReact PT key | Class                                                   |
| ----------- | ------------------------------------------------- | -------------- | ---------------------- | ----------------- | ------------------------------------------------------- |
| Root        | host element (NG), `div` (Vue, React)             | `root`         | `root`                 | `root`            | `p-checkbox p-component` (+ state classes, see Theming) |
| Input       | `input type="checkbox"`, invisible, covers box    | `input`        | `input`                | `input`           | `p-checkbox-input`                                      |
| Box         | `div` holding the icon                            | `box`          | `box`                  | `box`             | `p-checkbox-box`                                        |
| Icon        | `CheckIcon` / `MinusIcon` svg, or custom content  | `icon`         | `icon`                 | `icon`            | `p-checkbox-icon`                                       |
| Tooltip     | PrimeReact `Tooltip` sibling (when `tooltip` set) | —              | —                      | `tooltip`         | —                                                       |
| Group (Vue) | `div` wrapping checkboxes                         | —              | `CheckboxGroup` `root` | —                 | `p-checkbox-group p-component`                          |

- Icon selection: PrimeNG and PrimeVue render `CheckIcon` when checked and `MinusIcon` when indeterminate, unless an icon template/slot is supplied; PrimeNG can also render a class-based icon from `checkboxIcon`. PrimeReact renders `icon` (or `CheckIcon`) only when checked (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- PrimeReact returns a Fragment: the root `div` plus an optional `Tooltip` sibling (`primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- PrimeVue `CheckboxGroup` renders only a root `div` with a default slot (`primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.vue`).
- Pass-through key lists: `primeng-21.1.9:packages/primeng/src/types/checkbox/checkbox.types.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.d.ts`, `primereact-10.9.9:components/lib/checkbox/checkbox.d.ts`.

## 5. API highlights

| Member             | PrimeNG                                                                           | PrimeVue                                                                                      | PrimeReact                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Value binding      | `ngModel` / form control; `value: any`                                            | `modelValue` (`v-model`), `defaultValue`, `value: any`                                        | `checked: boolean` (required in types), `value: any`                                                                                             |
| Mode               | `binary: boolean` (default `false`): boolean model; otherwise array model         | `binary: boolean`: boolean model; otherwise array model                                       | boolean only (no array handling)                                                                                                                 |
| Checked values     | `trueValue = true`, `falseValue = false`                                          | `trueValue` (default `true`), `falseValue` (default `false`)                                  | `trueValue = true`, `falseValue = false`; checked iff `checked === trueValue`                                                                    |
| Indeterminate      | `indeterminate = false` (visual mask, cleared on first click)                     | `indeterminate = false`, also sets native `input.indeterminate`; emits `update:indeterminate` | N/A                                                                                                                                              |
| Change event       | `onChange(CheckboxChangeEvent)` with `checked`, `originalEvent`                   | `change(Event)`, `update:modelValue(any)`, `value-change(any)`                                | `onChange(event)` with `originalEvent`, `value`, `checked`, `stopPropagation()`, `preventDefault()`, `target { type, name, id, value, checked }` |
| Focus events       | `onFocus(Event)`, `onBlur(Event)`                                                 | `focus(Event)`, `blur(Event)`                                                                 | `onFocus`, `onBlur` via native HTML attributes (set focused state)                                                                               |
| State              | `disabled`, `invalid`, `readonly`, `required`, `name` (base signals/inputs)       | `disabled`, `invalid = false`, `readonly = false`, `required = false`, `name`                 | `disabled = false`, `invalid = false`, `readOnly = false` (camel-case), `required = false`, `name`                                               |
| Variant / size     | `variant: 'filled' \| 'outlined'`, `size: 'small' \| 'large'` (signal inputs)     | `variant` (default `null`, `outlined`/`filled`), `size: 'small' \| 'large'`                   | `variant: 'outlined' \| 'filled'` (default `null`, context fallback); no size                                                                    |
| Labelling          | `inputId`, `ariaLabel`, `ariaLabelledBy`                                          | `inputId`, `ariaLabel`, `ariaLabelledby`                                                      | `inputId`, plus any `aria-*` attribute forwarded to the input                                                                                    |
| Input styling      | `inputClass`, `inputStyle`, `tabindex` (number)                                   | `inputClass`, `inputStyle`, `tabindex` (Number)                                               | `tabIndex`, `inputRef`                                                                                                                           |
| Icon customisation | `checkboxIcon: string` (class), template `icon` (also accepted as `checkboxicon`) | slot `icon` with scope `{ checked, indeterminate, class }`                                    | `icon: IconType<CheckboxProps>`                                                                                                                  |
| Focus handling     | `autofocus`, `focus()`                                                            | none documented                                                                               | `autoFocus = false`, `focus()`, `getElement()`, `getInput()`                                                                                     |
| Tooltip            | N/A                                                                               | N/A                                                                                           | `tooltip`, `tooltipOptions`                                                                                                                      |
| Common             | `pt`, `ptOptions`, `unstyled`, `dt`, `styleClass` (deprecated), `formControl`     | `pt`, `ptOptions`, `unstyled = false`, `dt`, `formControl`                                    | `pt`, `ptOptions`, `unstyled`, `className`, `style`, `id`, `onMouseDown`, `onContextMenu`                                                        |

- Update logic (binary): PrimeNG and PrimeVue compute the next value as `trueValue` when indeterminate or unchecked, otherwise `falseValue`; indeterminate is then switched off. Non-binary mode filters the array using `equals` or appends `value`; the model must already be an array when the box is checked or indeterminate (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`).
- Read-only: PrimeNG `handleChange` ignores changes when `readonly`; PrimeVue ignores them when `disabled` or `readonly`; PrimeReact returns early for `disabled` or `readOnly` and only invokes the callback if `onChange` is set (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- PrimeVue `CheckboxGroup` props: `modelValue`, `defaultValue`, `name`, `invalid = false`, `formControl`, `dt`, `pt`, `ptOptions`, `unstyled = false`; emits `update:modelValue` and `value-change`; one default slot. A `name` is generated with `uuid('checkbox-group-')` when absent and shared with the child inputs (`primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.d.ts`, `primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.vue`, `primevue-4.5.5:packages/primevue/src/checkboxgroup/BaseCheckboxGroup.vue`).
- PrimeReact `CheckboxChangeEvent` extends `FormEvent` but the interface is declared without `export` in the `.d.ts`; `variant` is documented as default `outlined` while `defaultProps` sets `null` with an `inputStyle` context fallback; `tabIndex` is documented with `@defaultValue false` although typed as a number (`primereact-10.9.9:components/lib/checkbox/checkbox.d.ts`, `primereact-10.9.9:components/lib/checkbox/CheckboxBase.js`).
- Full API: catalog modules `checkbox` in `docs/prime-reference/catalog/primeng.json` and `docs/prime-reference/catalog/primereact.json`; `checkbox`, `checkboxgroup`, `checkboxstyle`, `checkboxgroupstyle` in `docs/prime-reference/catalog/primevue.json`.

## 6. Usage guidance

PrimeNG (`primeng-21.1.9:apps/showcase/pages/checkbox/index.ts`):

- **Basic** — a boolean checkbox needs `binary` together with `ngModel` (`primeng-21.1.9:apps/showcase/doc/checkbox/basic-doc.ts`).
- **Indeterminate** — `[indeterminate]="true"` with `binary` shows the minus icon as a neither-on-nor-off state (`primeng-21.1.9:apps/showcase/doc/checkbox/indeterminate-doc.ts`).
- **Group** — several checkboxes share one `ngModel` array and differ by `value` (`primeng-21.1.9:apps/showcase/doc/checkbox/multiple-doc.ts`).
- **Dynamic** — checkboxes generated from a list, with object values bound to an array model (`primeng-21.1.9:apps/showcase/doc/checkbox/dynamic-doc.ts`).
- **Filled** — `variant="filled"` for a higher-emphasis background (`primeng-21.1.9:apps/showcase/doc/checkbox/filled-doc.ts`).
- **Sizes** — `size="small"` and `size="large"` (`primeng-21.1.9:apps/showcase/doc/checkbox/sizes-doc.ts`).
- **Disabled** — `disabled` blocks editing and focus (`primeng-21.1.9:apps/showcase/doc/checkbox/disabled-doc.ts`).
- **Invalid** — `invalid` input reflects failed validation (`primeng-21.1.9:apps/showcase/doc/checkbox/invalid-doc.ts`).
- **Forms** — template-driven (`ngModel` + `name` per box) and reactive (`formControlName` on binary boxes with a group-level validator) variants, each paired with `p-message` for the error (`primeng-21.1.9:apps/showcase/doc/checkbox/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/checkbox/reactiveforms-doc.ts`).
- **Pass Through / Theming** — PT viewer and `themeDocs="checkbox"` (`primeng-21.1.9:apps/showcase/doc/checkbox/pt/PTViewer.ts`, `primeng-21.1.9:apps/showcase/doc/checkbox/pt/PTComponent.ts`).
- Orphan doc: `label-doc.ts` exists in the doc folder and demonstrates a `label` attribute that the component does not declare; it is not part of the page's section list (`primeng-21.1.9:apps/showcase/doc/checkbox/label-doc.ts`, `primeng-21.1.9:apps/showcase/pages/checkbox/index.ts`).
- Services/providers: none beyond Angular Forms for model binding (`FormsModule` / `ReactiveFormsModule`).

PrimeVue (`primevue-4.5.5:apps/showcase/pages/checkbox/index.vue`):

- **Basic** — `v-model` plus `binary` (`primevue-4.5.5:apps/showcase/doc/checkbox/BasicDoc.vue`).
- **Group** — either bind the same `v-model` array on every Checkbox, or wrap them in `CheckboxGroup` and put `v-model` on the group only; inside a group each Checkbox reads and writes the group value (`primevue-4.5.5:apps/showcase/doc/checkbox/GroupDoc.vue`).
- **Forms** — `CheckboxGroup name="…"` inside PrimeVue Forms `<Form>` with a zod resolver requiring at least one entry; this demo depends on `zod` and `@primevue/forms` (`primevue-4.5.5:apps/showcase/doc/checkbox/FormsDoc.vue`).
- **Dynamic** — `v-for` over a list with a shared array model (`primevue-4.5.5:apps/showcase/doc/checkbox/DynamicDoc.vue`).
- **Indeterminate** — `indeterminate` + `binary` masks the actual value visually (`primevue-4.5.5:apps/showcase/doc/checkbox/IndeterminateDoc.vue`).
- **Filled**, **Sizes**, **Invalid**, **Disabled** — `variant="filled"`, `size="small"|"large"`, `:invalid`, `disabled` (`primevue-4.5.5:apps/showcase/doc/checkbox/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/DisabledDoc.vue`).
- **Pass Through / Theming** — `primevue-4.5.5:apps/showcase/doc/checkbox/pt/index.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/pt/PTViewer.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/theming/TailwindDoc.vue`.
- Services/providers: PrimeVue config only for global `inputVariant` / `inputStyle`; Forms are optional.

PrimeReact (`primereact-10.9.9:pages/checkbox/index.js`):

- **Basic** — controlled `checked` + `onChange`, reading `e.checked` (`primereact-10.9.9:components/doc/checkbox/basicdoc.js`).
- **Group** — each Checkbox gets `value` and `checked={list.includes(value)}`; the handler adds or removes `e.value` itself (`primereact-10.9.9:components/doc/checkbox/groupdoc.js`).
- **Dynamic** — checkboxes generated from object lists, matched by key (`primereact-10.9.9:components/doc/checkbox/dynamicdoc.js`).
- **Invalid**, **Filled**, **Disabled** — `invalid`, `variant="filled"`, `disabled` (`primereact-10.9.9:components/doc/checkbox/invaliddoc.js`, `primereact-10.9.9:components/doc/checkbox/filleddoc.js`, `primereact-10.9.9:components/doc/checkbox/disableddoc.js`).
- **Style / Pass Through / Tailwind** — structural class table, wireframe and Tailwind notes (`primereact-10.9.9:components/doc/checkbox/styledoc.js`, `primereact-10.9.9:components/doc/checkbox/pt/wireframe.js`, `primereact-10.9.9:components/doc/checkbox/theming/styleddoc.js`, `primereact-10.9.9:components/doc/checkbox/theming/tailwinddoc.js`).
- No Indeterminate, Sizes or Forms demos exist because the component has no such features. Services/providers: none; optional `PrimeReactContext` supplies `inputStyle`.

## 7. Accessibility

- Documented model (all three): the component keeps a hidden native checkbox that screen readers see. Provide a name with a `label` linked through `inputId`, or `aria-labelledby` / `aria-label` (PrimeNG `ariaLabelledBy` / `ariaLabel`) (`primeng-21.1.9:apps/showcase/doc/checkbox/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/checkbox/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/checkbox/accessibilitydoc.js`).
- Keyboard (all three docs): Tab moves focus to the checkbox; Space toggles the checked state. These come from the native input (`primeng-21.1.9:apps/showcase/doc/checkbox/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/checkbox/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/checkbox/accessibilitydoc.js`).
- Roles: no explicit `role`; the native `input type="checkbox"` carries the implicit checkbox role (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- ARIA attributes in source: PrimeNG sets `aria-label` / `aria-labelledby` only (no `aria-invalid`); PrimeVue sets `aria-label`, `aria-labelledby` and `aria-invalid` (only when invalid); PrimeReact sets `aria-invalid` from `invalid` and forwards any `aria-*` prop to the input (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- Indeterminate: PrimeVue also sets the DOM `indeterminate` property on the input, so assistive tech sees a mixed state; PrimeNG only changes the icon and `checked` result and does not touch the native property (`primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`).
- State attributes: `data-p-checked`, `data-p-disabled`, `data-p-highlight` (NG, React), `data-p-indeterminate` (Vue) are styling hooks, not ARIA (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- Group: PrimeVue `CheckboxGroup` adds no role or label (no `role="group"`); labelling the set is the caller's job (`primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.vue`).

## 8. Theming

- Shared structural CSS: PrimeNG and PrimeVue import `style` from `@primeuix/styles/checkbox`; PrimeVue `CheckboxGroup` imports `@primeuix/styles/checkboxgroup` (`.p-checkbox-group` is `display: inline-flex`). PrimeNG appends a rule that gives `p-checkbox`, `p-checkBox` and `p-check-box` with `.ng-invalid.ng-dirty` the invalid border colour token (`@primeuix/styles-2.0.3:dist/checkbox/index.mjs`, `@primeuix/styles-2.0.3:dist/checkboxgroup/index.mjs`, `primeng-21.1.9:packages/primeng/src/checkbox/style/checkboxstyle.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/style/CheckboxStyle.js`, `primevue-4.5.5:packages/primevue/src/checkboxgroup/style/CheckboxGroupStyle.js`).
- CSS behaviour: the input is `appearance: none`, absolutely positioned, `opacity: 0`; hover and focus-visible styling is applied to the box through `:has(.p-checkbox-input:hover)` / `:has(.p-checkbox-input:focus-visible)`; the checked look hangs on `.p-checkbox-checked`; `.p-checkbox.p-disabled` resets `opacity` to 1 and uses disabled tokens (`@primeuix/styles-2.0.3:dist/checkbox/index.mjs`).
- Style classes (catalog: PrimeNG `modules.checkbox.style.classes`, PrimeVue `CheckboxClasses` / `CheckboxGroupClasses`): `p-checkbox`, `p-checkbox-box`, `p-checkbox-icon`, `p-checkbox-input`; PrimeVue group adds `p-checkbox-group` (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`).
- Emitted state classes on the root:
  - PrimeNG: `p-checkbox p-component` plus `p-checkbox-checked p-highlight`, `p-disabled`, `p-invalid`, `p-variant-filled`, `p-checkbox-sm p-inputfield-sm`, `p-checkbox-lg p-inputfield-lg` (`primeng-21.1.9:packages/primeng/src/checkbox/style/checkboxstyle.ts`).
  - PrimeVue: the same set without `p-highlight`; `p-invalid` also follows the surrounding `CheckboxGroup` invalid state (`primevue-4.5.5:packages/primevue/src/checkbox/style/CheckboxStyle.js`).
  - PrimeReact: `p-checkbox p-component` plus `p-highlight`, `p-disabled`, `p-invalid`, `p-variant-filled`; no size classes, and the checked state is not expressed as `p-checkbox-checked` (`primereact-10.9.9:components/lib/checkbox/CheckboxBase.js`).
- Design tokens (`@primeuix/themes-2.0.3:types/checkbox/index.d.ts`): `CheckboxDesignTokens` has two sections.
  - `root`: `borderRadius`, `width`, `height`, `background`, `checkedBackground`, `checkedHoverBackground`, `disabledBackground`, `filledBackground`, `borderColor`, `hoverBorderColor`, `focusBorderColor`, `checkedBorderColor`, `checkedHoverBorderColor`, `checkedFocusBorderColor`, `checkedDisabledBorderColor`, `invalidBorderColor`, `shadow`, `focusRing` (`width`, `style`, `color`, `offset`, `shadow`), `transitionDuration`, `sm` (`width`, `height`), `lg` (`width`, `height`).
  - `icon`: `size`, `color`, `checkedColor`, `checkedHoverColor`, `disabledColor`, `sm.size`, `lg.size`.
  - Token paths read `checkbox.*` (for example `checkbox.focus.ring.width`). Preset values live in `@primeuix/themes-2.0.3:dist/aura/checkbox/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/checkbox/index.mjs`, `@primeuix/themes-2.0.3:dist/material/checkbox/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/checkbox/index.mjs`. In Aura the box is `1.25rem` (`sm` `1rem`, `lg` `1.5rem`), the icon `0.875rem`, the checked background is `{primary.color}`.
  - `CheckboxGroup` has no token set of its own.
- Pass-through sections: PrimeNG `root`, `input`, `box`, `icon`; PrimeVue the same plus `hooks`, with method context `{ checked, indeterminate, disabled }`; PrimeReact `root`, `input`, `box`, `icon`, `tooltip`, `hooks`, with `context { checked, disabled }` and `state { focused }`; PrimeVue `CheckboxGroup` `root`, `hooks` (`primeng-21.1.9:packages/primeng/src/types/checkbox/checkbox.types.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.d.ts`, `primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.d.ts`, `primereact-10.9.9:components/lib/checkbox/checkbox.d.ts`).
- PrimeReact: no `@primeuix`; classes come from `CheckboxBase.js` and the theme CSS, design tokens N/A. `PrimeReactPTOptions.checkbox` is typed and the Tailwind preset has a `checkbox` entry (`primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`).
- Doc/source mismatch (React): the Style and Styled-mode docs list only `p-checkbox`, `p-checkbox-box` and `p-checkbox-icon`, omitting `p-checkbox-input` and the state classes (`primereact-10.9.9:components/doc/checkbox/styledoc.js`, `primereact-10.9.9:components/doc/checkbox/theming/styleddoc.js`).
- Doc/source mismatch (React): `variant` is documented as `outlined` by default whereas `defaultProps` uses `null` (`primereact-10.9.9:components/lib/checkbox/checkbox.d.ts`, `primereact-10.9.9:components/lib/checkbox/CheckboxBase.js`).

## 9. Relationships

- Embeds: icons `CheckIcon`, `MinusIcon` (NG, Vue) and `CheckIcon` (React); PrimeReact embeds Tooltip (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- Embedded by:
  - Tree and TreeTable selection checkboxes in all three (PrimeVue `TreeNode.vue` with PT `pcNodeCheckbox`; `BodyCell.vue`; PrimeReact `UITreeNode.js` and `TreeTableRow.js`; PrimeNG `tree.ts` and `treetable.ts`).
  - Table / DataTable row and header selection (PrimeNG `table.ts`; PrimeVue `RowCheckbox.vue`, `HeaderCheckbox.vue`; PrimeReact `RowCheckbox.js`, `HeaderCheckbox.js`).
  - MultiSelect option and "select all" checkboxes in all three (PT `pcOptionCheckbox`, `pcHeaderCheckbox` in Vue).
  - Listbox with multiple selection in PrimeNG only; the PrimeVue and PrimeReact Listbox sources do not import Checkbox.
  - PrimeReact [MultiStateCheckbox](multistatecheckbox.md) wraps this Checkbox.
  - Evidence: `primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`, `primeng-21.1.9:packages/primeng/src/table/table.ts`, `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`, `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`, `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`, `primevue-4.5.5:packages/primevue/src/treetable/BodyCell.vue`, `primevue-4.5.5:packages/primevue/src/datatable/RowCheckbox.vue`, `primevue-4.5.5:packages/primevue/src/datatable/HeaderCheckbox.vue`, `primevue-4.5.5:packages/primevue/src/multiselect/MultiSelect.vue`, `primereact-10.9.9:components/lib/tree/UITreeNode.js`, `primereact-10.9.9:components/lib/treetable/TreeTableRow.js`, `primereact-10.9.9:components/lib/datatable/RowCheckbox.js`, `primereact-10.9.9:components/lib/datatable/HeaderCheckbox.js`, `primereact-10.9.9:components/lib/multiselect/MultiSelectItem.js`, `primereact-10.9.9:components/lib/multiselect/MultiSelectHeader.js`, `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`.
- Related / alternatives: [TriStateCheckbox](tristatecheckbox.md) (PrimeReact-only three-value cycle; replaced in NG/Vue by `indeterminate`, which does not cycle), [MultiStateCheckbox](multistatecheckbox.md) (PrimeReact-only ordered state list), RadioButton (one of N), ToggleSwitch and SelectButton (other boolean/multi-choice inputs) — only the first two are documented in this study so far.
- Alias chain: PrimeNG selector aliases `p-checkBox` / `p-check-box`; no component alias in Vue or React.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@angular/forms`; `@primeuix/utils` (`contains`, `equals`); `primeng/api` (`PrimeTemplate`, `SharedModule`); `primeng/basecomponent` (`PARENT_INSTANCE`); `primeng/baseeditableholder`; `primeng/bind`; `primeng/icons/check`, `primeng/icons/minus`; `primeng/ts-helpers`; `primeng/types/checkbox`; `primeng/base` and `@primeuix/styles/checkbox` for styling (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primeng-21.1.9:packages/primeng/src/checkbox/style/checkboxstyle.ts`).
- PrimeVue: `@primevue/core/baseinput` (→ `baseeditableholder`), `@primevue/core/base/style`; `@primeuix/utils` (`cn`, `uuid`), `@primeuix/utils/object` (`contains`, `equals`); `@primevue/icons/check`, `@primevue/icons/minus`; `@primeuix/styles/checkbox`, `@primeuix/styles/checkboxgroup` (`primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primevue-4.5.5:packages/primevue/src/checkbox/BaseCheckbox.vue`, `primevue-4.5.5:packages/primevue/src/checkbox/style/CheckboxStyle.js`, `primevue-4.5.5:packages/primevue/src/checkboxgroup/CheckboxGroup.vue`, `primevue-4.5.5:packages/primevue/src/checkboxgroup/style/CheckboxGroupStyle.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`, `useUpdateEffect`), `../icons/check`, `../tooltip/Tooltip`, `../utils/Utils` (`DomHandler`, `IconUtils`, `ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- External npm packages: none beyond the framework and `@primeuix/*` (the PrimeVue Forms demo additionally uses `zod`, a showcase-only dependency).

## 11. Framework differences

| Aspect               | PrimeNG                                                | PrimeVue                                                             | PrimeReact                                                  |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Value ownership      | form value accessor (`ngModel`, form control)          | `v-model` / `defaultValue`; group value when inside a group          | controlled `checked` only                                   |
| Multi-value (array)  | built in (non-`binary`)                                | built in (non-`binary`), or via `CheckboxGroup`                      | manual (caller adds/removes `e.value`)                      |
| Group component      | none                                                   | `CheckboxGroup`                                                      | none                                                        |
| `indeterminate`      | yes (visual only, no native DOM flag)                  | yes (also sets native `indeterminate`, emits `update:indeterminate`) | N/A                                                         |
| Sizes                | `size` `small` / `large`                               | `size` `small` / `large`                                             | N/A                                                         |
| Checked detection    | `modelValue === trueValue` (binary) or `contains`      | same as NG                                                           | `checked === trueValue`                                     |
| Read-only handling   | `readonly` skips model update                          | `readonly` skips model update                                        | `readOnly` skips callback                                   |
| Change event payload | `{ checked, originalEvent }`                           | native `Event` (plus `update:modelValue`, `value-change`)            | `{ originalEvent, value, checked, target, … }`              |
| Icon customisation   | `checkboxIcon` class, `icon` / `checkboxicon` template | `icon` slot with `checked`, `indeterminate`, `class`                 | `icon` prop (`IconType`)                                    |
| Tooltip              | N/A                                                    | N/A                                                                  | `tooltip`, `tooltipOptions`                                 |
| Root classes         | `p-checkbox-checked p-highlight`                       | `p-checkbox-checked`                                                 | `p-highlight`                                               |
| Design tokens        | `@primeuix/themes` `checkbox.*`                        | `@primeuix/themes` `checkbox.*`                                      | N/A (theme CSS)                                             |
| Deprecated           | `styleClass` (since v20.0.0)                           | none                                                                 | none                                                        |
| Embedded in          | Tree, TreeTable, Table, MultiSelect, Listbox           | Tree, TreeTable, DataTable, MultiSelect                              | Tree, TreeTable, DataTable, MultiSelect, MultiStateCheckbox |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`
- `primeng-21.1.9:packages/primeng/src/checkbox/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/checkbox/ng-package.json`
- `primeng-21.1.9:packages/primeng/src/checkbox/style/checkboxstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/checkbox/checkbox.types.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`, `primeng-21.1.9:packages/primeng/src/table/table.ts`, `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`, `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`
- `primeng-21.1.9:apps/showcase/doc/checkbox/` (`import-doc.ts`, `basic-doc.ts`, `indeterminate-doc.ts`, `multiple-doc.ts`, `dynamic-doc.ts`, `filled-doc.ts`, `sizes-doc.ts`, `disabled-doc.ts`, `invalid-doc.ts`, `label-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`, `pt/PTComponent.ts`)
- `primeng-21.1.9:apps/showcase/pages/checkbox/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`
- `primevue-4.5.5:packages/primevue/src/checkbox/` (`Checkbox.vue`, `BaseCheckbox.vue`, `Checkbox.d.ts`, `package.json`, `style/CheckboxStyle.js`)
- `primevue-4.5.5:packages/primevue/src/checkboxgroup/` (`CheckboxGroup.vue`, `BaseCheckboxGroup.vue`, `CheckboxGroup.d.ts`, `style/CheckboxGroupStyle.js`)
- `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:packages/primevue/src/tree/TreeNode.vue`, `primevue-4.5.5:packages/primevue/src/treetable/BodyCell.vue`, `primevue-4.5.5:packages/primevue/src/datatable/RowCheckbox.vue`, `primevue-4.5.5:packages/primevue/src/datatable/HeaderCheckbox.vue`, `primevue-4.5.5:packages/primevue/src/multiselect/MultiSelect.vue`
- `primevue-4.5.5:apps/showcase/doc/checkbox/` (`ImportDoc.vue`, `BasicDoc.vue`, `GroupDoc.vue`, `FormsDoc.vue`, `DynamicDoc.vue`, `IndeterminateDoc.vue`, `FilledDoc.vue`, `SizesDoc.vue`, `InvalidDoc.vue`, `DisabledDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `pt/PTViewer.vue`, `theming/index.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/pages/checkbox/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`
- `primereact-10.9.9:components/lib/checkbox/` (`Checkbox.js`, `CheckboxBase.js`, `checkbox.d.ts`, `package.json`)
- `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`, `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/lib/tree/UITreeNode.js`, `primereact-10.9.9:components/lib/treetable/TreeTableRow.js`, `primereact-10.9.9:components/lib/datatable/RowCheckbox.js`, `primereact-10.9.9:components/lib/datatable/HeaderCheckbox.js`, `primereact-10.9.9:components/lib/multiselect/MultiSelectItem.js`, `primereact-10.9.9:components/lib/multiselect/MultiSelectHeader.js`, `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`
- `primereact-10.9.9:components/doc/checkbox/` (`importdoc.js`, `basicdoc.js`, `groupdoc.js`, `dynamicdoc.js`, `invaliddoc.js`, `filleddoc.js`, `disableddoc.js`, `accessibilitydoc.js`, `styledoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:pages/checkbox/index.js`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/checkbox/index.mjs`
- `@primeuix/styles-2.0.3:dist/checkboxgroup/index.mjs`
- `@primeuix/themes-2.0.3:types/checkbox/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/checkbox/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/checkbox/index.mjs`, `@primeuix/themes-2.0.3:dist/material/checkbox/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/checkbox/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
