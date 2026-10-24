# InputText

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

InputText is the themed single-line text input. It enhances a native `<input>` with Prime styling (outlined/filled variants, small/large sizes, fluid width, invalid state) and form integration. In PrimeNG it is an attribute directive on a native input; in PrimeVue and PrimeReact it is a component that renders the input. PrimeReact additionally builds key filtering and tooltip support into it. Its CSS class `p-inputtext` is reused by almost every other text-entry component.

## 2. Names & status

- Canonical name: **InputText** (file `inputtext`).
- PrimeNG: `InputText` directive, selector `[pInputText]`; stable. Input `ptInputText` is deprecated ("use pInputTextPT instead").
- PrimeVue: `InputText` component; stable.
- PrimeReact: `InputText` component; stable.

## 3. Per framework

### PrimeNG 21.1.9

- Import: `InputTextModule` (or standalone `InputText`) from `primeng/inputtext` (`primeng-21.1.9:apps/showcase/doc/inputtext/import-doc.ts`).
- Selector: `[pInputText]` on `<input>`; host binds `[class]="cx('root')"` and `data-p`.
- Class: `export class InputText extends BaseModelHolder<InputTextPassThrough>`; injects `NgControl` (optional) and the `Fluid` container (`pcFluid`).
- Source: `primeng-21.1.9:packages/primeng/src/inputtext/inputtext.ts`, style `primeng-21.1.9:packages/primeng/src/inputtext/style/inputtextstyle.ts`, PT types `primeng-21.1.9:packages/primeng/src/types/inputtext/inputtext.types.ts`; base `primeng-21.1.9:packages/primeng/src/basemodelholder/basemodelholder.ts`.

### PrimeVue 4.5.5

- Import: `import InputText from 'primevue/inputtext'` (`primevue-4.5.5:apps/showcase/doc/inputtext/ImportDoc.vue`).
- Tag: `<InputText>` renders `<input type="text">` with `aria-invalid` and `data-p`.
- Source: `primevue-4.5.5:packages/primevue/src/inputtext/InputText.vue`, `primevue-4.5.5:packages/primevue/src/inputtext/BaseInputText.vue` (extends BaseInput, provides `$pcInputText`), types `primevue-4.5.5:packages/primevue/src/inputtext/InputText.d.ts`, style `primevue-4.5.5:packages/primevue/src/inputtext/style/InputTextStyle.js`; base `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`.

### PrimeReact 10.9.9

- Import: `import { InputText } from 'primereact/inputtext'` (`primereact-10.9.9:components/doc/inputtext/importdoc.js`).
- Tag: `<InputText>` (`React.memo(React.forwardRef(...))`) renders `<input>`; optional `<Tooltip>` sibling.
- Source: `primereact-10.9.9:components/lib/inputtext/InputText.js`, `primereact-10.9.9:components/lib/inputtext/InputTextBase.js`, types `primereact-10.9.9:components/lib/inputtext/inputtext.d.ts`.

## 4. Anatomy

- **root** — the `<input>` element with `p-inputtext p-component`. No inner parts.
- PrimeReact adds an optional **tooltip** part.

## 5. API highlights

- PrimeNG (directive inputs): `pSize: 'large' | 'small'` (aliased `@Input('pSize')`), `variant` (`'filled' | 'outlined'`, signal), `fluid` (signal, also inherited from a parent `p-fluid`), `invalid` (signal), `hostName`, `pInputTextPT`, `pInputTextUnstyled`, `ptInputText` (deprecated). Value binding goes through the native input + `ngModel`/`formControl`; `$filled` comes from BaseModelHolder.
- PrimeVue props: `modelValue`, `defaultValue`, `name`, `size: 'small' | 'large'`, `invalid` (default `false`), `variant: 'filled' | 'outlined'`, `fluid`, `disabled`, `formControl` (from BaseEditableHolder/BaseInput) + `pt`, `ptOptions`, `unstyled`, `dt`. Emits `update:modelValue`, `value-change`.
- PrimeReact props: `keyfilter: KeyFilterType`, `validateOnly` (default `false`), `invalid` (default `false`), `variant: 'filled' | 'outlined'` (falls back to the context `inputStyle`), `size: number | string` (native HTML `size`, not a visual size), `tooltip`, `tooltipOptions`, `onInput(event, validatePattern)`, `onBeforeInput`, `onPaste`, `onKeyDown`, `pt`, `ptOptions`, `unstyled`.
- Visual size: PrimeNG `pSize`, PrimeVue `size`, PrimeReact via classes `p-inputtext-sm` / `p-inputtext-lg`.

## 6. Usage guidance

- Bind the value with `ngModel` (PrimeNG), `v-model` (PrimeVue) or `value`/`onChange` (PrimeReact) (`primeng-21.1.9:apps/showcase/doc/inputtext/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/BasicDoc.vue`, `primereact-10.9.9:components/doc/inputtext/basicdoc.js`).
- Forms: Angular template-driven and reactive forms in PrimeNG; `@primevue/forms` in PrimeVue (`primeng-21.1.9:apps/showcase/doc/inputtext/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/FormsDoc.vue`).
- Labels: FloatLabel (all three) and IftaLabel (PrimeNG/PrimeVue) (`primeng-21.1.9:apps/showcase/doc/inputtext/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/IftaLabelDoc.vue`, `primereact-10.9.9:components/doc/inputtext/floatlabeldoc.js`).
- Sizes: small and large alternatives to the default (`primeng-21.1.9:apps/showcase/doc/inputtext/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/SizesDoc.vue`, `primereact-10.9.9:components/doc/inputtext/sizesdoc.js`).
- Fluid: full container width via `fluid` (`primeng-21.1.9:apps/showcase/doc/inputtext/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/FluidDoc.vue`).
- Help text: a `<small>` hint (PrimeNG/PrimeReact) or the Message component (PrimeVue) linked by `aria-describedby` (`primeng-21.1.9:apps/showcase/doc/inputtext/helptext-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/HelpTextDoc.vue`, `primereact-10.9.9:components/doc/inputtext/helptextdoc.js`).
- Filled variant for higher emphasis (`primeng-21.1.9:apps/showcase/doc/inputtext/filled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/FilledDoc.vue`, `primereact-10.9.9:components/doc/inputtext/filleddoc.js`).
- Disabled and invalid states (`primeng-21.1.9:apps/showcase/doc/inputtext/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/InvalidDoc.vue`, `primereact-10.9.9:components/doc/inputtext/disableddoc.js`, `primereact-10.9.9:components/doc/inputtext/invaliddoc.js`).
- Key filtering is built in for PrimeReact via `keyfilter` (`primereact-10.9.9:components/doc/inputtext/keyfilterdoc.js`); PrimeNG/PrimeVue use the separate KeyFilter directive.
- No services required.

## 7. Accessibility

- Native `<input>`: give it a `<label for>` or `aria-label`/`aria-labelledby`; `Tab` moves focus to the input (`primeng-21.1.9:apps/showcase/doc/inputtext/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputtext/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputtext/accessibilitydoc.js`).
- PrimeVue binds `aria-invalid` from `invalid`; neither the PrimeNG directive nor the PrimeReact component sets `aria-invalid` itself (no `aria-*` binding in their sources), so authors pass it explicitly.

## 8. Theming

- Classes: `p-inputtext`, `p-component`, `p-filled`, `p-invalid`, `p-variant-filled`; sizes `p-inputtext-sm`/`-lg` (PrimeNG/PrimeReact) and `p-inputfield-sm`/`-lg` (PrimeVue adds both); `p-inputtext-fluid`. PrimeNG adds `.p-inputtext.ng-invalid.ng-dirty` rules. Catalog: `p-inputtext` (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`).
- PT keys: PrimeNG `root`; PrimeVue `root`; PrimeReact `root`, `tooltip`.
- Design tokens (`@primeuix/themes-2.0.3:types/inputtext/index.d.ts`): section `root` — background, disabledBackground, filledBackground, filledHoverBackground, filledFocusBackground, borderColor, hoverBorderColor, focusBorderColor, invalidBorderColor, color, disabledColor, placeholderColor, invalidPlaceholderColor, shadow, paddingX, paddingY, borderRadius, focusRing (width, style, color, offset, shadow), transitionDuration, `sm`/`lg` (fontSize, paddingX, paddingY). Aura maps them to `{form.field.*}` (`@primeuix/themes-2.0.3:dist/aura/inputtext/index.mjs`).
- Style module: `@primeuix/styles-2.0.3:dist/inputtext/index.mjs`.
- PrimeReact: classes in `InputTextBase.js`; visual CSS from the theme; tokens N/A.

## 9. Relationships

- Embedded by (as `p-inputtext`): AutoComplete, CascadeSelect (label), DatePicker, InputMask, InputNumber, InputOtp, Password, Select (editable), Chips/InputChips input.
- Wrapped by: [FloatLabel](floatlabel.md), [IftaLabel](iftalabel.md), [IconField](iconfield.md), [InputGroup](inputgroup.md).
- Works with: [KeyFilter](keyfilter.md) (directive in PrimeNG/PrimeVue, built-in prop in PrimeReact); Textarea (Form B) is the multi-line counterpart.

## 10. Dependencies

- PrimeNG: `primeng/basemodelholder`, `primeng/fluid`, `@angular/forms` (`NgControl`), `@primeuix/styles/inputtext`.
- PrimeVue: `@primevue/core/baseinput`, `@primeuix/styles/inputtext`.
- PrimeReact: `KeyFilter`, `Tooltip`, `ComponentBase`, hooks, utils.
- No external npm dependency.

## 11. Framework differences

| Aspect         | PrimeNG                            | PrimeVue                     | PrimeReact                           |
| -------------- | ---------------------------------- | ---------------------------- | ------------------------------------ |
| Form           | attribute directive `[pInputText]` | component                    | component                            |
| Visual size    | `pSize`                            | `size`                       | CSS classes `p-inputtext-sm`/`-lg`   |
| `size` meaning | (BaseInput `size` unused here)     | visual size                  | native HTML `size` attribute         |
| Fluid          | `fluid` / parent Fluid             | `fluid` / parent Fluid       | —                                    |
| Key filter     | separate KeyFilter directive       | separate KeyFilter directive | built-in `keyfilter`, `validateOnly` |
| Tooltip        | —                                  | —                            | built-in `tooltip`, `tooltipOptions` |
| Forms          | Angular forms                      | `@primevue/forms`            | controlled props                     |
| PT keys        | `root`                             | `root`                       | `root`, `tooltip`                    |
| Deprecated     | `ptInputText`                      | —                            | —                                    |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/inputtext/inputtext.ts`, `primeng-21.1.9:packages/primeng/src/inputtext/style/inputtextstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputtext/inputtext.types.ts`, `primeng-21.1.9:packages/primeng/src/basemodelholder/basemodelholder.ts`
- `primeng-21.1.9:apps/showcase/doc/inputtext/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/iftalabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/fluid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/helptext-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/filled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/accessibility-doc.ts`, `primeng-21.1.9:apps/showcase/pages/inputtext/index.ts`
- `primeng-21.1.9:apps/showcase/doc/inputtext/icons-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputtext/keyfilter-doc.ts` (present but not wired into the page)
- `primevue-4.5.5:packages/primevue/src/inputtext/InputText.vue`, `primevue-4.5.5:packages/primevue/src/inputtext/BaseInputText.vue`, `primevue-4.5.5:packages/primevue/src/inputtext/InputText.d.ts`, `primevue-4.5.5:packages/primevue/src/inputtext/style/InputTextStyle.js`, `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`
- `primevue-4.5.5:apps/showcase/doc/inputtext/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/IftaLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/FluidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/HelpTextDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputtext/AccessibilityDoc.vue`
- `primereact-10.9.9:components/lib/inputtext/InputText.js`, `primereact-10.9.9:components/lib/inputtext/InputTextBase.js`, `primereact-10.9.9:components/lib/inputtext/inputtext.d.ts`
- `primereact-10.9.9:components/doc/inputtext/importdoc.js`, `primereact-10.9.9:components/doc/inputtext/basicdoc.js`, `primereact-10.9.9:components/doc/inputtext/keyfilterdoc.js`, `primereact-10.9.9:components/doc/inputtext/sizesdoc.js`, `primereact-10.9.9:components/doc/inputtext/helptextdoc.js`, `primereact-10.9.9:components/doc/inputtext/floatlabeldoc.js`, `primereact-10.9.9:components/doc/inputtext/filleddoc.js`, `primereact-10.9.9:components/doc/inputtext/invaliddoc.js`, `primereact-10.9.9:components/doc/inputtext/disableddoc.js`, `primereact-10.9.9:components/doc/inputtext/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/inputtext/index.mjs`
- `@primeuix/themes-2.0.3:types/inputtext/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputtext/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
