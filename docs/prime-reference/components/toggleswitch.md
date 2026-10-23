# ToggleSwitch

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9 (shipped there only under the legacy name `InputSwitch`)

## 1. Summary

ToggleSwitch is a two-state on/off switch bound to a boolean (or any pair of `trueValue` / `falseValue`). It renders a visually hidden native `<input type="checkbox" role="switch">` stretched over a styled track (`slider`) that contains a round `handle`. PrimeNG and PrimeVue ship it as `ToggleSwitch` (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`, `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`). PrimeReact 10.9.9 ships no `toggleswitch` folder; the same control is the legacy `InputSwitch` (`primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`). PrimeVue additionally keeps a deprecated `InputSwitch` subclass (`primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.vue`).

## 2. Names & status

- Canonical name: **ToggleSwitch** (GLOSSARY: "The on/off switch input", avoid `InputSwitch`).
- Legacy alias **InputSwitch**:
  - PrimeVue 4.5.5: still shipped as a deprecated component. `InputSwitch.vue` is `extends: ToggleSwitch` and logs `console.warn('Deprecated since v4. Use ToggleSwitch component instead.')` in `mounted()`; `InputSwitch.d.ts` carries `@deprecated since v4. Use ToggleSwitch component instead.` (`primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.vue`, `primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.d.ts`).
  - PrimeReact 10.9.9: the only name under which the component exists, not deprecated, listed as `InputSwitch` in the Form group of the menu (`primereact-10.9.9:components/layout/menu.json`, `primereact-10.9.9:pages/inputswitch/index.js`).
  - PrimeNG 21.1.9: no `InputSwitch` module; the selector accepts the extra spellings `p-toggleSwitch` and `p-toggle-switch` (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`). The PrimeNG accessibility doc still talks about "InputSwitch" in its prose (`primeng-21.1.9:apps/showcase/doc/toggleswitch/accessibility-doc.ts`).
- Deprecated member: PrimeNG `styleClass` input is `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`).
- Menu category is Form in PrimeNG and PrimeVue (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`) and PrimeReact (`primereact-10.9.9:components/layout/menu.json`).
- Foundations note the same alias chain (`docs/prime-reference/foundations/primereact/index.md`, `docs/prime-reference/foundations/primevue.md`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                | PrimeVue                                                                                                                                              | PrimeReact (`InputSwitch`)                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Import         | `import { ToggleSwitchModule } from 'primeng/toggleswitch'` (component `ToggleSwitch` is standalone)                                   | `import ToggleSwitch from 'primevue/toggleswitch'`; deprecated alias `import InputSwitch from 'primevue/inputswitch'`                                 | `import { InputSwitch } from 'primereact/inputswitch'`                                |
| Selector / tag | `<p-toggleswitch>` (also `p-toggleSwitch`, `p-toggle-switch`)                                                                          | `<ToggleSwitch>` (deprecated `<InputSwitch>`)                                                                                                         | `<InputSwitch />`                                                                     |
| Source         | `packages/primeng/src/toggleswitch/toggleswitch.ts`, `style/toggleswitchstyle.ts`, types in `types/toggleswitch/toggleswitch.types.ts` | `packages/primevue/src/toggleswitch/ToggleSwitch.vue`, `BaseToggleSwitch.vue`, `ToggleSwitch.d.ts`, `style/ToggleSwitchStyle.js`; plus `inputswitch/` | `components/lib/inputswitch/InputSwitch.js`, `InputSwitchBase.js`, `inputswitch.d.ts` |
| Exports        | `ToggleSwitch`, `ToggleSwitchModule`, `TOGGLESWITCH_VALUE_ACCESSOR`, `ToggleSwitchStyle`, `ToggleSwitchClasses`, types                 | default `ToggleSwitch`; `ToggleSwitchStyle` from `primevue/toggleswitch/style`; `InputSwitch` and `InputSwitchStyle` from `primevue/inputswitch`      | `InputSwitch` (re-exported by `primereact.all.js`)                                    |
| Base class     | `BaseEditableHolder<ToggleSwitchPassThrough>`                                                                                          | `BaseEditableHolder` (via `BaseToggleSwitch`)                                                                                                         | `React.memo(forwardRef(...))` over `ComponentBase.extend` (`InputSwitchBase`)         |
| Sub-components | None (the `handle` is a template, not a component)                                                                                     | None (the `handle` is a slot)                                                                                                                         | None; optionally renders `Tooltip` as a sibling                                       |

Sources: `primeng-21.1.9:packages/primeng/src/toggleswitch/public_api.ts`, `primeng-21.1.9:apps/showcase/doc/toggleswitch/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/package.json`, `primevue-4.5.5:packages/primevue/src/index.js`, `primevue-4.5.5:packages/primevue/src/toggleswitch/BaseToggleSwitch.vue`, `primereact-10.9.9:components/doc/inputswitch/importdoc.js`, `primereact-10.9.9:components/lib/inputswitch/package.json`, `primereact-10.9.9:components/lib/primereact.all.js`, `primereact-10.9.9:components/lib/inputswitch/InputSwitchBase.js`.

## 4. Anatomy

| Part    | Element (NG / Vue / React) | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                   |
| ------- | -------------------------- | -------------- | --------------- | ----------------- | ----------------------- |
| Root    | host / `div` / `div`       | `root`         | `root`          | `root`            | `p-toggleswitch`        |
| Input   | `<input type="checkbox">`  | `input`        | `input`         | `input`           | `p-toggleswitch-input`  |
| Slider  | `div` / `div` / `span`     | `slider`       | `slider`        | `slider`          | `p-toggleswitch-slider` |
| Handle  | `div`                      | `handle`       | `handle`        | N/A               | `p-toggleswitch-handle` |
| Tooltip | `Tooltip` (React only)     | N/A            | N/A             | `tooltip`         | —                       |

- PrimeNG renders the input and slider directly inside the `<p-toggleswitch>` host (no wrapper `div`); the host is the root and its PT key is `host`/`root` (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`, `primeng-21.1.9:packages/primeng/src/types/toggleswitch/toggleswitch.types.ts`).
- PrimeVue wraps everything in a root `div`; PT keys are `root`, `input`, `slider`, `handle` plus `hooks` (`primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`, `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.d.ts`).
- PrimeReact has only `root`, `input`, `slider`, `tooltip` and `hooks`. There is no handle element: the knob is drawn with a `:before` pseudo-element on the slider (`primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`, `primereact-10.9.9:components/lib/inputswitch/inputswitch.d.ts`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`).
- PrimeNG and PrimeVue also stamp `data-p-checked`, `data-p-disabled` and a `data-p` attribute (from `cn({ checked, disabled, invalid })`) on the root, slider and handle (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`, `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`). PrimeReact stamps `data-p-highlight` and `data-p-disabled` on the root.

## 5. API highlights

Shared names and defaults: `trueValue = true`, `falseValue = false`, `inputId`, `ariaLabel`, `disabled = false`, `invalid`, `name`. Checked state is `value === trueValue`.

| Member              | PrimeNG                                                                                           | PrimeVue                                                                      | PrimeReact                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Value binding       | `ngModel` / `formControlName` (`ControlValueAccessor`)                                            | `modelValue` / `v-model`, `defaultValue`                                      | `checked: boolean` (required, default `false`), controlled with `onChange`                           |
| Read-only           | `readonly: boolean` (catalog default `false`)                                                     | `readonly: boolean = false`                                                   | N/A — no read-only prop                                                                              |
| Required            | `required` (signal input, default `false`)                                                        | N/A                                                                           | N/A                                                                                                  |
| Size                | `size: 'large' \| 'small' \| undefined` (signal input)                                            | N/A                                                                           | N/A                                                                                                  |
| Autofocus           | `autofocus: boolean` (default `false`)                                                            | N/A                                                                           | `autoFocus: boolean = false`                                                                         |
| Tab index           | `tabindex: number`                                                                                | `tabindex: number = null`                                                     | `tabIndex: number` (default `null`)                                                                  |
| ARIA                | `ariaLabel`, `ariaLabelledBy`                                                                     | `ariaLabel`, `ariaLabelledby`                                                 | `aria-*` attributes forwarded from other props to the input; `inputId`                               |
| Extra input styling | N/A                                                                                               | `inputClass: string \| object`, `inputStyle: object`                          | `inputRef`, `className`, `style`, `id`                                                               |
| Invalid             | `invalid` (signal input) plus `ng-invalid.ng-dirty` CSS                                           | `invalid` (also from `@primevue/forms`)                                       | `invalid: boolean = false`                                                                           |
| Change event        | `onChange: EventEmitter<ToggleSwitchChangeEvent>` with `originalEvent: Event`, `checked: boolean` | `change(event: Event)`, `update:modelValue(boolean)`, `value-change(boolean)` | `onChange(event: InputSwitchChangeEvent)` with `originalEvent`, `value`, `target`, `checked` (typed) |
| Focus / blur        | N/A as outputs (internal `onFocus`/`onBlur`, `onBlur` marks touched)                              | `focus(event)`, `blur(event)` emits                                           | `onFocus`, `onBlur` (`React.FocusEvent<HTMLInputElement>`)                                           |
| Handle content      | template `handle` with context `{ checked: boolean }`                                             | slot `handle` with scope `{ checked: boolean }`                               | N/A                                                                                                  |
| Tooltip             | N/A                                                                                               | N/A                                                                           | `tooltip: string`, `tooltipOptions`                                                                  |
| Methods             | N/A                                                                                               | N/A                                                                           | `focus()`, `getElement(): HTMLDivElement \| null`, `getInput(): HTMLInputElement \| null`            |

- Toggle logic: PrimeNG's host click handler calls `onClick`, which writes `checked() ? falseValue : trueValue`, notifies the form model, emits `onChange` and refocuses the input; it does nothing when disabled or `readonly`. PrimeVue does the same from the native `change` event, guarded by `disabled` and `readonly`, via `writeValue`. PrimeReact builds the event with `value = checked ? falseValue : trueValue` and calls `props.onChange` (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`, `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`, `primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`).
- PrimeVue blur also calls `formField.onBlur?.(event)` for `@primevue/forms` (`primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`). Form props `modelValue`, `defaultValue`, `name`, `invalid`, `disabled`, `formControl` come from `BaseEditableHolder` (`primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).
- PrimeVue types: `modelValue?: boolean | string`, `defaultValue?: boolean | string`, `trueValue?: any`, `falseValue?: any` (`primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.d.ts`).
- Deprecated PrimeVue `InputSwitch` has an identical API: its props, slots, context and pass-through types all extend the ToggleSwitch ones, and `InputSwitchEmitsOptions` is empty while `InputSwitchEmits` intersects `ToggleSwitchEmits` (`primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.d.ts`).
- Full API: catalog module `toggleswitch` in `docs/prime-reference/catalog/primeng.json` and `primevue.json` (plus `inputswitch` and `inputswitchstyle` in `primevue.json`) and module `inputswitch` in `docs/prime-reference/catalog/primereact.json`.

## 6. Usage guidance

- **Import** — import the module or component from the framework entry point (`primeng-21.1.9:apps/showcase/doc/toggleswitch/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/ImportDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/importdoc.js`).
- **Basic** — two-way bind the value: `ngModel`, `v-model`, or controlled `checked` with `onChange={(e) => setChecked(e.value)}` (`primeng-21.1.9:apps/showcase/doc/toggleswitch/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/BasicDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/basicdoc.js`).
- **Preselection** — start in the on state by initialising the bound value to the true value (`primeng-21.1.9:apps/showcase/doc/toggleswitch/preselection-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/PreselectionDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/preselectiondoc.js`).
- **Template** — customise the handle contents (the showcase swaps a check and a times icon by `checked`) with the `handle` template or slot; PrimeReact has no equivalent (`primeng-21.1.9:apps/showcase/doc/toggleswitch/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/TemplateDoc.vue`).
- **Invalid** — set `invalid` to show a failed validation (the demos use `!checked`); the PrimeReact demo instead applies the class `p-invalid` through `className` rather than the `invalid` prop (`primeng-21.1.9:apps/showcase/doc/toggleswitch/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/InvalidDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/invaliddoc.js`).
- **Disabled** — `disabled` blocks editing and focus (`primeng-21.1.9:apps/showcase/doc/toggleswitch/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/DisabledDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/disableddoc.js`).
- **Forms** — PrimeNG shows template-driven forms (`#model="ngModel"`, `required`, `[invalid]` after submit) and reactive forms (`formControlName` with an `isInvalid` helper); PrimeVue shows `@primevue/forms` with a `name` and a resolver plus a `Message` for the error; PrimeReact has no forms demo (`primeng-21.1.9:apps/showcase/doc/toggleswitch/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/toggleswitch/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/FormsDoc.vue`).
- **Accessibility** — name the switch with a `<label for>` plus `inputId`, or `aria-labelledby`, or `aria-label` (`primeng-21.1.9:apps/showcase/doc/toggleswitch/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/accessibilitydoc.js`).
- **Pass Through** — PrimeNG and PrimeVue ship a PT viewer for the four sections; PrimeReact ships a wireframe image page (`primeng-21.1.9:apps/showcase/doc/toggleswitch/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/pt/PTViewer.vue`, `primereact-10.9.9:components/doc/inputswitch/pt/wireframe.js`).
- **Theming** — PrimeVue and PrimeReact ship a Tailwind (unstyled) preset page (`primevue-4.5.5:apps/showcase/doc/toggleswitch/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/theming/tailwinddoc.js`).

No services or providers are required.

## 7. Accessibility

- All three render a native checkbox with `role="switch"`, `aria-checked` and `aria-label` / `aria-labelledby`; it is visually hidden (opacity 0, stretched over the track) so it is the focusable element that screen readers announce. The showcase docs describe it as "a hidden native checkbox element with switch role internally that is only visible to screen readers" (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`, `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`, `primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`).
- Keyboard (identical in all three docs): Tab moves focus to the switch; Space toggles the checked state (`primeng-21.1.9:apps/showcase/doc/toggleswitch/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toggleswitch/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputswitch/accessibilitydoc.js`). No other key handling exists in the source; the behaviour is the native checkbox's.
- PrimeNG sets `required` and `disabled` attributes on the input when the signals are true; `readonly` is only honoured in the click handler, it is not rendered on the input (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`).
- PrimeVue sets `aria-invalid` when `invalid` is true, and passes `disabled` and `readonly` to the native input (`primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`). Native `readonly` has no effect on a checkbox, so the `onChange` guard is what actually blocks the change.
- PrimeReact quirk: the root `div` carries `role="checkbox"` and `aria-checked`, wrapping the inner `input role="switch"`, so two nested role announcements exist. It exposes no `aria-invalid` and forwards only props that match `DomHandler.ARIA_PROPS` to the input (`primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`).
- Doc wording: the PrimeNG and PrimeReact accessibility docs say "InputSwitch component" even though PrimeNG's class is `ToggleSwitch` (`primeng-21.1.9:apps/showcase/doc/toggleswitch/accessibility-doc.ts`, `primereact-10.9.9:components/doc/inputswitch/accessibilitydoc.js`).

## 8. Theming

- Style classes: `p-toggleswitch` (root, with `p-component`, and conditionally `p-toggleswitch-checked`, `p-disabled`, `p-invalid`), `p-toggleswitch-input`, `p-toggleswitch-slider`, `p-toggleswitch-handle`. The PrimeVue `ToggleSwitchClasses` enum lists four members (`root`, `input`, `slider`, `handle`); the PrimeNG `ToggleSwitchClasses` enum and its catalog `style.classes` list only three, omitting `handle`, although the template and `classes` map render it (catalog `primevue.json` `modules.toggleswitchstyle.enumerations.ToggleSwitchClasses`, catalog `primeng.json` `modules.toggleswitch.style.classes`; `primeng-21.1.9:packages/primeng/src/toggleswitch/style/toggleswitchstyle.ts`, `primevue-4.5.5:packages/primevue/src/toggleswitch/style/ToggleSwitchStyle.js`).
- Inline style: root gets `position: relative` in both PrimeNG and PrimeVue.
- Pass-through section keys: `root`, `input`, `slider`, `handle` (PrimeVue also `hooks`); PrimeVue pass-through functions receive a context `{ checked, disabled }` (`primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.d.ts`). PrimeReact keys: `root`, `input`, `slider`, `tooltip`, `hooks` (`primereact-10.9.9:components/lib/inputswitch/inputswitch.d.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/toggleswitch/index.mjs`, imported as `style` by PrimeNG and PrimeVue. It sizes the root from `toggleswitch.width/height`, hides and stretches the input, positions the handle with `inset-inline-start` (so it is RTL-aware) and slides it to `width - (handle.size + gap)` when checked, applies hover states through `:has(.p-toggleswitch-input:hover)`, the focus ring on the slider through `:has(.p-toggleswitch-input:focus-visible)`, and the invalid border through `.p-toggleswitch.p-invalid > .p-toggleswitch-slider`. A disabled root keeps `opacity: 1` and recolors slider and handle instead. PrimeNG adds one rule: `p-toggleswitch.ng-invalid.ng-dirty > .p-toggleswitch-slider` uses the invalid border color (`primeng-21.1.9:packages/primeng/src/toggleswitch/style/toggleswitchstyle.ts`).
- Design tokens (`@primeuix/themes-2.0.3:types/toggleswitch/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 34 tokens in two sections):
  - `root` (22): `width`, `height`, `borderRadius`, `gap`, `shadow`, `focusRing.width/style/color/offset/shadow`, `borderWidth`, `borderColor`, `hoverBorderColor`, `checkedBorderColor`, `checkedHoverBorderColor`, `invalidBorderColor`, `transitionDuration`, `slideDuration`, `background`, `disabledBackground`, `hoverBackground`, `checkedBackground`, `checkedHoverBackground`.
  - `handle` (12): `borderRadius`, `size`, `background`, `disabledBackground`, `hoverBackground`, `checkedBackground`, `checkedHoverBackground`, `color`, `hoverColor`, `checkedColor`, `checkedHoverColor`.
  - Aura preset values include `width: 2.5rem`, `height: 1.5rem`, `gap: 0.25rem`, `slideDuration: 0.2s`, handle `size: 1rem` and `borderRadius: 50%` (`@primeuix/themes-2.0.3:dist/aura/toggleswitch/index.mjs`). Presets exist for aura, lara, material and nora.
  - There is no `@primeuix` module named `inputswitch`; the deprecated PrimeVue `InputSwitch` reuses the ToggleSwitch styles (its `InputSwitchStyle.js` only sets `name: 'inputswitch'`) (`primevue-4.5.5:packages/primevue/src/inputswitch/style/InputSwitchStyle.js`).
- PrimeReact (no `@primeuix`, tokens N/A): classes come from `css.classes` in `InputSwitchBase.js` and are `p-inputswitch p-component` (with `p-highlight`, `p-disabled`, `p-invalid`), `p-inputswitch-input`, `p-inputswitch-slider`. The `css` object has no `styles` entry, so the structural rules live in the shipped theme files (for example 3rem × 1.75rem root, 1.25rem knob in `:before`, `translateX(1.25rem)` when checked) rather than in the component (`primereact-10.9.9:components/lib/inputswitch/InputSwitchBase.js`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`, `primereact-10.9.9:styles/layout/_config.scss`).
- Doc/source mismatch: PrimeReact's class tables list `p-inputswitch-checked` for the active root, but the code and theme CSS use `p-highlight` (`primereact-10.9.9:components/doc/inputswitch/theming/styleddoc.js`, `primereact-10.9.9:components/doc/inputswitch/styledoc.js`, `primereact-10.9.9:components/lib/inputswitch/InputSwitchBase.js`).

## 9. Relationships

- Embeds no other Prime component. PrimeReact optionally renders a `Tooltip` beside the root when `tooltip` is set (`primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`).
- Embedded by: no Prime component embeds it in the sources reviewed; the PrimeVue Forms demo pairs it with Form, Message and Button (`primevue-4.5.5:apps/showcase/doc/toggleswitch/FormsDoc.vue`).
- Related Form components: Checkbox (also boolean, different look and semantics), ToggleButton (pressable button toggle), RadioButton, SelectButton, MultiStateCheckbox / TriStateCheckbox (more than two states).
- Alias chain: `InputSwitch` (PrimeReact, PrimeVue deprecated) → `ToggleSwitch`; PrimeVue's `InputSwitch` literally extends `ToggleSwitch`.
- Shared base: both PrimeNG and PrimeVue extend their `BaseEditableHolder`, the same base used by Knob, Checkbox and other editable inputs (`primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@angular/forms` (`NG_VALUE_ACCESSOR`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/autofocus` (`AutoFocus`), `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/base` (`BaseStyle`), `@primeuix/styles/toggleswitch` (`primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`, `primeng-21.1.9:packages/primeng/src/toggleswitch/style/toggleswitchstyle.ts`).
- PrimeVue: `@primevue/core/baseeditableholder`, `@primevue/core/base/style`, `@primeuix/utils` (`cn`), `@primeuix/styles/toggleswitch`, `primevue/toggleswitch/style`; the deprecated `InputSwitch` imports `primevue/toggleswitch` (`primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`, `primevue-4.5.5:packages/primevue/src/toggleswitch/BaseToggleSwitch.vue`, `primevue-4.5.5:packages/primevue/src/toggleswitch/style/ToggleSwitchStyle.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../tooltip/Tooltip`, `../utils/Utils` (`DomHandler`, `ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`, `primereact-10.9.9:components/lib/inputswitch/InputSwitchBase.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect               | PrimeNG                                | PrimeVue                                        | PrimeReact                                                           |
| -------------------- | -------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| Component name       | `ToggleSwitch`                         | `ToggleSwitch` (deprecated alias `InputSwitch`) | `InputSwitch` only                                                   |
| Root element         | `<p-toggleswitch>` host, no wrapper    | `div`                                           | `div` with `role="checkbox"`                                         |
| Handle part          | `handle` element + `handle` template   | `handle` element + `handle` slot                | None (CSS `:before`)                                                 |
| Checked root class   | `p-toggleswitch-checked`               | `p-toggleswitch-checked`                        | `p-highlight` (docs say `p-inputswitch-checked`)                     |
| Value binding        | `ngModel` / `formControlName`          | `v-model`, `@primevue/forms`                    | Controlled `checked` + `onChange`                                    |
| Change event payload | `{ originalEvent, checked }`           | Native `Event` (value via `update:modelValue`)  | `{ originalEvent, value, target, ... }`; `checked` typed but not set |
| Read-only            | `readonly` input                       | `readonly` prop                                 | N/A                                                                  |
| Size variants        | `size = 'small' \| 'large'`            | N/A                                             | N/A                                                                  |
| Required / autofocus | `required`, `autofocus`                | N/A                                             | `autoFocus` only                                                     |
| Input class / style  | N/A                                    | `inputClass`, `inputStyle`                      | N/A                                                                  |
| Invalid              | `invalid` + `ng-invalid.ng-dirty` rule | `invalid` + `aria-invalid`                      | `invalid` (no `aria-invalid`)                                        |
| Click target         | Host click handler (whole control)     | Native `change` on the input                    | Native `change` on the input                                         |
| Tooltip              | N/A                                    | N/A                                             | Built-in `tooltip` / `tooltipOptions`                                |
| Imperative API       | N/A                                    | N/A                                             | `focus()`, `getElement()`, `getInput()`                              |
| Styling source       | `@primeuix/styles` + tokens            | `@primeuix/styles` + tokens                     | Theme CSS files; no tokens                                           |
| Position of knob     | `inset-inline-start` (RTL aware)       | `inset-inline-start` (RTL aware)                | `left` + `translateX` in theme CSS                                   |
| Deprecations         | `styleClass`                           | `InputSwitch` component                         | None                                                                 |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/toggleswitch/toggleswitch.ts`
- `primeng-21.1.9:packages/primeng/src/toggleswitch/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/toggleswitch/style/toggleswitchstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/toggleswitch/toggleswitch.types.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:apps/showcase/doc/toggleswitch/` (`import-doc.ts`, `basic-doc.ts`, `preselection-doc.ts`, `template-doc.ts`, `invalid-doc.ts`, `disabled-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.vue`
- `primevue-4.5.5:packages/primevue/src/toggleswitch/BaseToggleSwitch.vue`
- `primevue-4.5.5:packages/primevue/src/toggleswitch/ToggleSwitch.d.ts`
- `primevue-4.5.5:packages/primevue/src/toggleswitch/style/ToggleSwitchStyle.js`
- `primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.vue`
- `primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.d.ts`
- `primevue-4.5.5:packages/primevue/src/inputswitch/style/InputSwitchStyle.js`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:apps/showcase/doc/toggleswitch/` (`ImportDoc.vue`, `BasicDoc.vue`, `PreselectionDoc.vue`, `TemplateDoc.vue`, `InvalidDoc.vue`, `DisabledDoc.vue`, `FormsDoc.vue`, `AccessibilityDoc.vue`, `pt/PTViewer.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`
- `primereact-10.9.9:components/lib/inputswitch/InputSwitchBase.js`
- `primereact-10.9.9:components/lib/inputswitch/inputswitch.d.ts`
- `primereact-10.9.9:components/lib/inputswitch/package.json`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/doc/inputswitch/` (`importdoc.js`, `basicdoc.js`, `preselectiondoc.js`, `invaliddoc.js`, `disableddoc.js`, `accessibilitydoc.js`, `styledoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:pages/inputswitch/index.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:public/themes/lara-light-blue/theme.css`
- `primereact-10.9.9:styles/layout/_config.scss`
- `@primeuix/styles-2.0.3:dist/toggleswitch/index.mjs`
- `@primeuix/themes-2.0.3:types/toggleswitch/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/toggleswitch/index.mjs`
