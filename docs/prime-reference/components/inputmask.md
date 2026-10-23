# InputMask

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

InputMask is a text field that forces the typed value into a fixed pattern such as a phone number, a serial number or a date. The pattern is a short string in which `9` stands for a digit, `a` for a letter, `*` for a letter or digit, `?` marks everything after it as optional, and any other character is a literal that is inserted for the user. Unfilled positions show a placeholder character (the "slot character", `_` by default). All three libraries render a plain text input: PrimeNG offers both a `p-inputmask` component and a `pInputMask` directive that can be attached to any input, while PrimeVue and PrimeReact offer a component that wraps their InputText (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`, `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`, `primereact-10.9.9:components/lib/inputmask/InputMask.js`).

## 2. Names & status

- Canonical name: **InputMask** (file `inputmask`).
- PrimeNG: `InputMask` component (selectors `p-inputmask`, `p-inputMask`, `p-input-mask`) and `InputMaskDirective` (selector `[pInputMask]`), both in `primeng/inputmask`; stable (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- PrimeVue: `InputMask` component, tag `<InputMask>`; stable (`primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`).
- PrimeReact: `InputMask` component (`React.memo(forwardRef(...))`); stable (`primereact-10.9.9:components/lib/inputmask/InputMask.js`).
- No deprecation notice was found for the component in any of the three libraries. The extra PrimeNG selector spellings `p-inputMask` and `p-input-mask` are aliases of the same component.
- The PrimeNG showcase page describes it as a component for entering input in a given format such as numeric, date, currency or phone (`primeng-21.1.9:apps/showcase/pages/inputmask/index.ts`); the PrimeVue page is titled "Vue Mask Component" (`primevue-4.5.5:apps/showcase/pages/inputmask/index.vue`).

## 3. Per framework

### PrimeNG 21.1.9

- Import: `InputMaskModule` from `primeng/inputmask` (`primeng-21.1.9:apps/showcase/doc/inputmask/import-doc.ts`). The module imports and exports the component, the directive and `SharedModule`; the barrel also re-exports the types and the style class (`primeng-21.1.9:packages/primeng/src/inputmask/public_api.ts`).
- Component: standalone, `OnPush`, `ViewEncapsulation.None`, extends `BaseInput<InputMaskPassThrough>`, registers `NG_VALUE_ACCESSOR`, and uses the `Bind` host directive. Its template is a native `<input pInputText>` plus an optional clear icon (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- Directive `[pInputMask]`: standalone, adds the host class `p-inputmask` unless unstyled, can sit on an `<input>` or on a host element that contains a `data-p-maskable` or visible input. It does not implement `ControlValueAccessor`; it dispatches a synthetic `input` event so `ngModel`/form controls pick up the masked text, and it ignores events that are not trusted (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- Style: `primeng-21.1.9:packages/primeng/src/inputmask/style/inputmaskstyle.ts`; types: `primeng-21.1.9:packages/primeng/src/types/inputmask/inputmask.types.ts`.
- Most showcase examples use the directive on a PrimeNG `pInputText` field (`primeng-21.1.9:apps/showcase/doc/inputmask/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/mask-doc.ts`); only the clear-icon example uses `<p-inputmask>` (`primeng-21.1.9:apps/showcase/doc/inputmask/clearicon-doc.ts`).

### PrimeVue 4.5.5

- Import: `import InputMask from 'primevue/inputmask'` (`primevue-4.5.5:apps/showcase/doc/inputmask/ImportDoc.vue`).
- `InputMask.vue` extends `BaseInputMask.vue` (which extends `@primevue/core/baseinput`), sets `inheritAttrs: false` and renders a PrimeVue `InputText`, forwarding its PT to the inner field (`primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`, `primevue-4.5.5:packages/primevue/src/inputmask/BaseInputMask.vue`).
- Types: `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.d.ts`; style: `primevue-4.5.5:packages/primevue/src/inputmask/style/InputMaskStyle.js`.

### PrimeReact 10.9.9

- Import: `import { InputMask } from 'primereact/inputmask'` (`primereact-10.9.9:components/doc/inputmask/importdoc.js`).
- The component renders PrimeReact `InputText` and passes parent metadata so PT and context work through it (`primereact-10.9.9:components/lib/inputmask/InputMask.js`, `primereact-10.9.9:components/lib/inputtext/InputText.js`).
- Defaults live in `primereact-10.9.9:components/lib/inputmask/InputMaskBase.js`; the public types in `primereact-10.9.9:components/lib/inputmask/inputmask.d.ts`.
- Props extend InputText's props (minus `onChange` and `pt`), so `keyfilter`, `validateOnly` and `onInput` are inherited (`primereact-10.9.9:components/lib/inputmask/inputmask.d.ts`, `primereact-10.9.9:components/lib/inputtext/inputtext.d.ts`).

## 4. Anatomy

- PrimeNG component: host `p-inputmask` (classes `p-inputmask p-component p-inputwrapper`, plus `p-variant-filled`) containing a native `<input>` styled by InputText and, when `showClear` is on and the field has a value and is enabled, a clear icon (`p-inputmask-clear-icon`, default a "times" SVG, or the `clearicon` template) (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`, `primeng-21.1.9:packages/primeng/src/inputmask/style/inputmaskstyle.ts`).
- PrimeNG directive: no wrapper; the `<input>` itself gets `p-inputmask` (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- PrimeVue: a single `<input>` (rendered by InputText) with class `p-inputmask` and `p-filled` when it has a value; no wrapper and no slots (`primevue-4.5.5:packages/primevue/src/inputmask/style/InputMaskStyle.js`, `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.d.ts`).
- PrimeReact: a single `<input>` (rendered by InputText) carrying `p-inputmask` plus state classes `p-filled`, `p-invalid` and `p-variant-filled` (`primereact-10.9.9:components/lib/inputmask/InputMaskBase.js`).

## 5. API highlights

- Mask syntax (all three, hard-coded): `9` → `[0-9]`, `a` → `[A-Za-z]`, `*` → letter or digit, `?` → rest optional; other characters are literals (`primeng-21.1.9:apps/showcase/doc/inputmask/mask-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/MaskDoc.vue`, `primereact-10.9.9:components/doc/inputmask/maskdoc.js`).
- Common props: `mask`, `slotChar` (default `_`), `autoClear` (default `true`; clears an incomplete value on blur), `unmask`, plus the usual form props (`disabled`, `invalid`, `variant`, `size`, `placeholder`, `readonly`/`readOnly`).
- PrimeNG component inputs: `mask`, `slotChar`, `autoClear`, `characterPattern` (regex source used for the `a` token, default `[A-Za-z]`; `*` additionally accepts digits), `keepBuffer`, `unmask`, `showClear`, `type`, `readonly`, `placeholder`, `title`, `tabindex`, `inputId`, `style`, `styleClass`, `ariaLabel`, `ariaLabelledBy`, `ariaRequired`, `autocomplete`, `autofocus`, plus the `BaseInput` set (`disabled`, `invalid`, `fluid`, `variant`, `size`, `name`, `required`, `minlength`, `maxlength`, `pattern`, `dt`, `pt`, `ptOptions`, `unstyled`) (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- PrimeNG component outputs: `onComplete`, `onFocus`, `onBlur`, `onInput`, `onKeydown`, `onClear`; template `clearicon`; methods `focus()` and `clear()`. Assigning a new `mask` resets the model value to an empty string (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- PrimeNG directive: inputs `pInputMask` (the mask), `slotChar`, `autoClear`, `characterPattern`, `keepBuffer`, `pInputMaskPT`, `pInputMaskUnstyled`; outputs `onComplete` (void) and `onUnmaskedChange` (string with the raw characters). It has no `unmask` input (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- PrimeVue props: `modelValue`, `defaultValue`, `mask`, `slotChar`, `autoClear`, `unmask`, `id`, `class`, `placeholder`, `readonly`, `invalid`, `name`, `size`, `variant`, `fluid`, `disabled`, `dt`, `pt`, `ptOptions`, `unstyled`. Events: `update:modelValue`, `value-change`, `focus`, `blur`, `keydown`, `keypress`, `paste`, `complete`. No slots. No `characterPattern`, `keepBuffer` or `showClear` (`primevue-4.5.5:packages/primevue/src/inputmask/InputMask.d.ts`).
- PrimeReact props: `value`, `mask`, `slotChar`, `autoClear`, `unmask`, `type`, `disabled`, `readOnly`, `required`, `invalid`, `variant`, `size`, `maxLength`, `tooltip`/`tooltipOptions`, plus inherited InputText props. Callbacks: `onChange` (event with `value`), `onComplete` (`InputMaskCompleteEvent { originalEvent, value }`), `onFocus`, `onBlur`. Methods `focus()` and `getElement()` (`primereact-10.9.9:components/lib/inputmask/inputmask.d.ts`, `primereact-10.9.9:components/lib/inputmask/InputMaskBase.js`).
- Value semantics: in PrimeVue and PrimeReact the emitted/changed value is an empty string when the field still equals its empty mask template; with `unmask` the model holds only the typed characters rather than the formatted text (`primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`, `primereact-10.9.9:components/lib/inputmask/InputMask.js`).

## 6. Usage guidance

- Basic usage binds the masked value to the model (`ngModel` / `v-model` / `value` + `onChange`) (`primeng-21.1.9:apps/showcase/doc/inputmask/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/BasicDoc.vue`, `primereact-10.9.9:components/doc/inputmask/basicdoc.js`).
- Combine tokens and literals for formats such as `999-99-9999` (SSN), `(999) 999-9999` (phone) or `a*-999-a999` (serial) (`primeng-21.1.9:apps/showcase/doc/inputmask/mask-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/MaskDoc.vue`, `primereact-10.9.9:components/doc/inputmask/maskdoc.js`).
- Put `?` before the part that may be left empty, for example a phone number with an optional extension; `autoClear` decides whether an incomplete value is wiped on blur (`primeng-21.1.9:apps/showcase/doc/inputmask/optional-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/OptionalDoc.vue`, `primereact-10.9.9:components/doc/inputmask/optionaldoc.js`).
- Use a multi-character `slotChar` to show a format hint such as `mm/dd/yyyy` inside the empty field (`primeng-21.1.9:apps/showcase/doc/inputmask/slotchar-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/SlotCharDoc.vue`, `primereact-10.9.9:components/doc/inputmask/slotchardoc.js`).
- Only PrimeNG documents the clear icon (`<p-inputmask [showClear]="true">`) (`primeng-21.1.9:apps/showcase/doc/inputmask/clearicon-doc.ts`).
- Visual variants: floating label (`primeng-21.1.9:apps/showcase/doc/inputmask/floatlabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/FloatLabelDoc.vue`, `primereact-10.9.9:components/doc/inputmask/floatlabeldoc.js`), ifta label (PrimeNG and PrimeVue only: `primeng-21.1.9:apps/showcase/doc/inputmask/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/IftaLabelDoc.vue`), filled (`primeng-21.1.9:apps/showcase/doc/inputmask/filled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/FilledDoc.vue`, `primereact-10.9.9:components/doc/inputmask/filleddoc.js`), disabled and invalid (`primeng-21.1.9:apps/showcase/doc/inputmask/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/InvalidDoc.vue`, `primereact-10.9.9:components/doc/inputmask/disableddoc.js`, `primereact-10.9.9:components/doc/inputmask/invaliddoc.js`).
- Sizes and fluid width are documented for PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/inputmask/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/FluidDoc.vue`).
- Forms: PrimeNG documents template-driven and reactive forms (`primeng-21.1.9:apps/showcase/doc/inputmask/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/reactiveforms-doc.ts`); PrimeVue documents PrimeVue Forms with a resolver (`primevue-4.5.5:apps/showcase/doc/inputmask/FormsDoc.vue`); PrimeReact has no forms section.
- A DatePicker can be masked with the directive, e.g. `pInputMask="99/99/9999"` together with `dateFormat="dd/mm/yy"` (`primeng-21.1.9:apps/showcase/doc/datepicker/mask-doc.ts`).
- Prefer [KeyFilter](keyfilter.md) when only individual characters should be blocked and no fixed layout is needed, and [InputNumber](inputnumber.md) for real numeric/currency values.
- No services required.

## 7. Accessibility

- The component is a native text input and defines no ARIA roles or keyboard handling in the docs. Give it a `<label>` tied by `for`/`id`, or use `aria-labelledby` / `aria-label` (`primeng-21.1.9:apps/showcase/doc/inputmask/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputmask/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputmask/accessibilitydoc.js`).
- The documented keyboard interaction is only `Tab`, which moves focus. The source additionally handles Backspace, Delete, Enter (blur logic) and Escape (restores the text from when the field was focused) (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`, `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`, `primereact-10.9.9:components/lib/inputmask/InputMask.js`).
- PrimeNG's component forwards `ariaLabel`, `ariaLabelledBy` and `ariaRequired` to the inner input (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- Screen readers will read the literal mask characters and slot characters as part of the value; pair the field with visible format hints (for example the expected pattern in the label).

## 8. Theming

- No dedicated design-token module: `@primeuix/styles-2.0.3:dist/` has no `inputmask` folder and `@primeuix/themes-2.0.3` has no `types/inputmask` or `dist/<preset>/inputmask`, so InputMask relies on the InputText tokens and styles (`@primeuix/styles-2.0.3:dist/inputtext/index.mjs`, `@primeuix/themes-2.0.3:types/inputtext/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputtext/index.mjs`). See [InputText](inputtext.md).
- PrimeNG ships a small stylesheet of its own: `p-inputmask` is `position: relative`, the clear icon is absolutely placed at the inline end using `form.field.padding.x` and `form.field.icon.color`, fluid mode stretches to 100%, and `ng-invalid.ng-dirty` borders use `inputtext.invalid.*` tokens (`primeng-21.1.9:packages/primeng/src/inputmask/style/inputmaskstyle.ts`). Style classes: `p-inputmask`, `p-inputmask-clear-icon`.
- PrimeNG PT (`InputMaskPassThroughOptions`): `host`, `root` (the input), `pcInputText`, `clearIcon`; the global PT key is `inputMask` (`primeng-21.1.9:packages/primeng/src/types/inputmask/inputmask.types.ts`, `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`). Showcase PT pages: `primeng-21.1.9:apps/showcase/doc/inputmask/pt/PTComponent.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/pt/PTViewer.ts`.
- PrimeVue style: class `p-inputmask` only, with `p-filled` state; no CSS of its own. PT options: `root`, `pcInputText`, `hooks`; context `{ disabled, filled }`; global PT key `inputmask` (`primevue-4.5.5:packages/primevue/src/inputmask/style/InputMaskStyle.js`, `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.d.ts`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`). Theming docs: `primevue-4.5.5:apps/showcase/doc/inputmask/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/theming/TailwindDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/pt/PTViewer.vue`.
- PrimeReact: no `@primeuix`; classic styled mode lists the classes `p-inputtext` and `p-inputmask` as the input element. PT is the InputText PT (`inputmask?: InputTextPassThroughOptions` in the global API), and the Tailwind preset has an `inputmask` entry with a root only (`primereact-10.9.9:components/doc/inputmask/styledoc.js`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`, `primereact-10.9.9:components/doc/inputmask/pt/wireframe.js`, `primereact-10.9.9:components/doc/inputmask/theming/styleddoc.js`, `primereact-10.9.9:components/doc/inputmask/theming/tailwinddoc.js`).

## 9. Relationships

- Built on: [InputText](inputtext.md) (all three render it as the field).
- Used by: [DatePicker](datepicker.md) (PrimeNG) applies the `pInputMask` directive and exposes a `data-p-maskable` attribute on its input (`primeng-21.1.9:packages/primeng/src/datepicker/datepicker.ts`).
- Layout: [InputGroup](inputgroup.md) styles `p-inputmask > .p-inputtext` so a mask component fits an input group (`primeng-21.1.9:packages/primeng/src/inputgroup/style/inputgroupstyle.ts`); also combined with [FloatLabel](floatlabel.md), [IftaLabel](iftalabel.md) and [IconField](iconfield.md) patterns.
- Alternatives: [KeyFilter](keyfilter.md) (character-level blocking; PrimeReact InputMask inherits the `keyfilter` prop through InputText), [InputNumber](inputnumber.md) (numeric values).

## 10. Dependencies

- PrimeNG: `@angular/forms` (`NG_VALUE_ACCESSOR`), the PrimeNG `InputText`, `AutoFocus`, `TimesIcon`, `SharedModule` and `Bind` building blocks (`primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`).
- PrimeVue: `@primevue/core/baseinput`, the PrimeVue `InputText` component (`primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`).
- PrimeReact: PrimeReact `InputText` and its base (`primereact-10.9.9:components/lib/inputmask/InputMask.js`).
- No external npm dependency.

## 11. Framework differences

| Aspect                       | PrimeNG                                              | PrimeVue                                      | PrimeReact                             |
| ---------------------------- | ---------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Form                         | `p-inputmask` component and `[pInputMask]` directive | `<InputMask>` component                       | `InputMask` component                  |
| Binding                      | `ngModel` / reactive forms (component CVA)           | `v-model`, `defaultValue`                     | controlled `value` + `onChange`        |
| Mask tokens                  | `9`, `a`, `*`, `?`; `a` regex via `characterPattern` | `9`, `a`, `*`, `?` fixed                      | `9`, `a`, `*`, `?` fixed               |
| `keepBuffer`                 | yes                                                  | no                                            | no                                     |
| Clear icon (`showClear`)     | yes, with `clearicon` template                       | no                                            | no                                     |
| `unmask`                     | component only                                       | yes                                           | yes                                    |
| Unmasked output on directive | `onUnmaskedChange`                                   | N/A                                           | N/A                                    |
| Complete event               | `onComplete`                                         | `complete`                                    | `onComplete({ originalEvent, value })` |
| Key detection                | `which` / `keyCode`                                  | `event.code` / `event.key`, composition aware | `which` / `keyCode`                    |
| Changing `mask` at runtime   | resets model to empty                                | re-initialises                                | re-initialises                         |
| Sizes / fluid / ifta docs    | yes                                                  | yes                                           | no                                     |
| Forms docs                   | template-driven and reactive                         | PrimeVue Forms                                | none                                   |
| Own CSS / `@primeuix` tokens | own CSS, inputtext tokens, no inputmask module       | no CSS, inputtext tokens                      | no `@primeuix`, classic CSS            |
| PT                           | `host`, `root`, `pcInputText`, `clearIcon`           | `root`, `pcInputText`, `hooks`                | InputText PT only                      |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/inputmask/inputmask.ts`, `primeng-21.1.9:packages/primeng/src/inputmask/public_api.ts`, `primeng-21.1.9:packages/primeng/src/inputmask/style/inputmaskstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputmask/inputmask.types.ts`, `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:packages/primeng/src/inputgroup/style/inputgroupstyle.ts`, `primeng-21.1.9:packages/primeng/src/datepicker/datepicker.ts`
- `primeng-21.1.9:apps/showcase/doc/inputmask/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/mask-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/optional-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/slotchar-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/clearicon-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/iftalabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/filled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/fluid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/inputmask/pt/PTComponent.ts`, `primeng-21.1.9:apps/showcase/doc/inputmask/pt/PTViewer.ts`, `primeng-21.1.9:apps/showcase/pages/inputmask/index.ts`, `primeng-21.1.9:apps/showcase/doc/datepicker/mask-doc.ts`
- `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.vue`, `primevue-4.5.5:packages/primevue/src/inputmask/BaseInputMask.vue`, `primevue-4.5.5:packages/primevue/src/inputmask/InputMask.d.ts`, `primevue-4.5.5:packages/primevue/src/inputmask/style/InputMaskStyle.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:apps/showcase/doc/inputmask/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/MaskDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/OptionalDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/SlotCharDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/IftaLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/FluidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/inputmask/pt/PTViewer.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/inputmask/theming/TailwindDoc.vue`, `primevue-4.5.5:apps/showcase/pages/inputmask/index.vue`
- `primereact-10.9.9:components/lib/inputmask/InputMask.js`, `primereact-10.9.9:components/lib/inputmask/InputMaskBase.js`, `primereact-10.9.9:components/lib/inputmask/inputmask.d.ts`, `primereact-10.9.9:components/lib/inputtext/InputText.js`, `primereact-10.9.9:components/lib/inputtext/inputtext.d.ts`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/inputmask/importdoc.js`, `primereact-10.9.9:components/doc/inputmask/basicdoc.js`, `primereact-10.9.9:components/doc/inputmask/maskdoc.js`, `primereact-10.9.9:components/doc/inputmask/optionaldoc.js`, `primereact-10.9.9:components/doc/inputmask/slotchardoc.js`, `primereact-10.9.9:components/doc/inputmask/floatlabeldoc.js`, `primereact-10.9.9:components/doc/inputmask/filleddoc.js`, `primereact-10.9.9:components/doc/inputmask/invaliddoc.js`, `primereact-10.9.9:components/doc/inputmask/disableddoc.js`, `primereact-10.9.9:components/doc/inputmask/accessibilitydoc.js`, `primereact-10.9.9:components/doc/inputmask/styledoc.js`, `primereact-10.9.9:components/doc/inputmask/pt/wireframe.js`, `primereact-10.9.9:components/doc/inputmask/theming/styleddoc.js`, `primereact-10.9.9:components/doc/inputmask/theming/tailwinddoc.js`
- `@primeuix/styles-2.0.3:dist/inputtext/index.mjs`, `@primeuix/themes-2.0.3:types/inputtext/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputtext/index.mjs`
