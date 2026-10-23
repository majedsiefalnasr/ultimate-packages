# InputNumber

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

InputNumber is the locale-aware numeric input. It renders a text input with `role="spinbutton"` that formats the value with `Intl.NumberFormat` (decimal or currency mode, grouping, fraction digits, prefix and suffix), parses what the user types back to a number, clamps it to `min`/`max`, and can show spinner buttons (stacked, horizontal or vertical). The model value is a `number` (or `null`); the displayed string is derived. All three frameworks implement the same parser/formatter design, with differences in the extras each one adds (clear icon, rounding mode, highlight on focus, tooltip). It embeds [InputText](inputtext.md) for the field itself.

## 2. Names & status

- Canonical name: **InputNumber** (file `inputnumber`).
- PrimeNG: `InputNumber` component; the selector accepts three spellings, `p-inputNumber`, `p-inputnumber` and `p-input-number` (`primeng-21.1.9:packages/primeng/src/inputnumber/inputnumber.ts`). Module `InputNumberModule`. Stable; the input `styleClass` is deprecated since v20.0.0 ("use `class` instead").
- PrimeVue: `InputNumber` component (base `BaseInputNumber`); stable. Deprecated since v4.0: props `incrementButtonIcon` / `decrementButtonIcon` (use `incrementIcon` / `decrementIcon`) and slots `incrementbuttonicon` / `decrementbuttonicon` (use `incrementicon` / `decrementicon`); the state field `d_modelValue` is deprecated since 4.2.0 (use `d_value`) (`primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.d.ts`).
- PrimeReact: `InputNumber` component; stable. No deprecated members found in `primereact-10.9.9:components/lib/inputnumber/inputnumber.d.ts`.
- No legacy aliases beyond the PrimeNG selector spellings.

## 3. Per framework

### PrimeNG 21.1.9

- Import: `import { InputNumberModule } from 'primeng/inputnumber'` (`primeng-21.1.9:apps/showcase/doc/inputnumber/import-doc.ts`). The component is also standalone (`standalone: true`); the module imports and exports `InputNumber` and `SharedModule`.
- Selector: `p-inputNumber, p-inputnumber, p-input-number`. `OnPush`, `ViewEncapsulation.None`, `hostDirectives: [Bind]`.
- Class: `export class InputNumber extends BaseInput<InputNumberPassThrough>`; exports the provider constant `INPUTNUMBER_VALUE_ACCESSOR` (a `NG_VALUE_ACCESSOR` registration) so it works with `ngModel` and reactive forms.
- Entry point `primeng/inputnumber` re-exports the component, the types and the style (`primeng-21.1.9:packages/primeng/src/inputnumber/public_api.ts`).
- Source: `primeng-21.1.9:packages/primeng/src/inputnumber/inputnumber.ts`, style `primeng-21.1.9:packages/primeng/src/inputnumber/style/inputnumberstyle.ts`, PT and event types `primeng-21.1.9:packages/primeng/src/types/inputnumber/inputnumber.types.ts`, base `primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`.

### PrimeVue 4.5.5

- Import: `import InputNumber from 'primevue/inputnumber'` (`primevue-4.5.5:apps/showcase/doc/inputnumber/ImportDoc.vue`).
- Tag: `<InputNumber>`; `inheritAttrs: false`, attributes go to the root `<span>` via `ptmi('root')`.
- Source: `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.vue`, `primevue-4.5.5:packages/primevue/src/inputnumber/BaseInputNumber.vue` (props, provides `$pcInputNumber` and `$parentInstance`), types `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.d.ts`, style `primevue-4.5.5:packages/primevue/src/inputnumber/style/InputNumberStyle.js`; base `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`.

### PrimeReact 10.9.9

- Import: `import { InputNumber } from 'primereact/inputnumber'` (`primereact-10.9.9:components/doc/inputnumber/importdoc.js`).
- Tag: `<InputNumber>`, `React.memo(React.forwardRef(...))`. The ref exposes `focus()`, `getFormatter()`, `getElement()` and `getInput()` (`primereact-10.9.9:components/lib/inputnumber/inputnumber.d.ts`).
- Source: `primereact-10.9.9:components/lib/inputnumber/InputNumber.js`, `primereact-10.9.9:components/lib/inputnumber/InputNumberBase.js` (default props, classes and CSS), types `primereact-10.9.9:components/lib/inputnumber/inputnumber.d.ts`.

## 4. Anatomy

- **root** — wrapper (`p-inputnumber`): PrimeNG host element, PrimeVue and PrimeReact `<span>`.
- **input** — the embedded [InputText](inputtext.md) with `p-inputnumber-input`, `role="spinbutton"`. PT key `pcInputText` in PrimeNG and PrimeVue, `input` in PrimeReact.
- **buttonGroup** — `<span>` that wraps the two buttons, rendered only for the `stacked` layout. Other layouts render the two buttons directly under the root.
- **incrementButton / decrementButton** — `<button type="button">` elements (`tabindex="-1"`, `aria-hidden`) with an angle-up/angle-down icon. Icon PT keys: `incrementButtonIcon` / `decrementButtonIcon` (PrimeNG), `incrementIcon` / `decrementIcon` (PrimeVue), none (PrimeReact).
- **clearIcon** — a times icon shown when `showClear` is on and the layout is not `vertical`; PrimeNG and PrimeVue only (`primeng-21.1.9:packages/primeng/src/inputnumber/inputnumber.ts`, `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.vue`).
- **tooltip** — PrimeReact only, a sibling `Tooltip` bound to the root when `tooltip` is set (`primereact-10.9.9:components/lib/inputnumber/InputNumber.js`).
- Layout variants: `stacked` (default; buttons stacked at the inline end inside the field), `horizontal` (decrement left, increment right), `vertical` (increment above, decrement below, centred text) (`@primeuix/styles-2.0.3:dist/inputnumber/index.mjs`).

## 5. API highlights

The full API is in the catalog (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`). Shared formatting props across all three: `locale`, `localeMatcher`, `mode: 'decimal' | 'currency'` (default `'decimal'`), `currency`, `currencyDisplay`, `useGrouping` (default `true`), `minFractionDigits`, `maxFractionDigits`, `prefix`, `suffix`, `format` (default `true`), `showButtons` (default `false`), `buttonLayout: 'stacked' | 'horizontal' | 'vertical'` (default `'stacked'`), `allowEmpty` (default `true`), `placeholder`, `inputId`, `inputStyle`, `min`, `max`, `step`.

### PrimeNG

- Props (decorator inputs): `showButtons`, `format`, `buttonLayout` (typed `string`), `inputId`, `styleClass` (deprecated), `placeholder`, `tabindex`, `title`, `ariaLabelledBy`, `ariaDescribedBy`, `ariaLabel`, `ariaRequired`, `autocomplete`, `incrementButtonClass`, `decrementButtonClass`, `incrementButtonIcon`, `decrementButtonIcon`, `readonly`, `allowEmpty`, `locale`, `localeMatcher`, `mode`, `currency`, `currencyDisplay`, `useGrouping`, `minFractionDigits`, `maxFractionDigits`, `prefix`, `suffix`, `inputStyle`, `inputStyleClass`, `showClear` (default `false`), `autofocus`.
- Signal inputs inherited from `BaseInput`: `fluid`, `variant: 'filled' | 'outlined'`, `size: 'large' | 'small'`, `inputSize`, `pattern`, `min`, `max`, `step`, `minlength`, `maxlength`; `invalid` and `disabled` come from `BaseEditableHolder` (`primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`). The variant falls back to the global config (`$variant = variant() || config.inputStyle() || config.inputVariant()`).
- Outputs: `onInput(InputNumberInputEvent)` where the event is `{ originalEvent: Event; value: number | null; formattedValue: string }`, `onFocus(Event)`, `onBlur(Event)`, `onKeyDown(KeyboardEvent)`, `onClear(void)` (`primeng-21.1.9:packages/primeng/src/types/inputnumber/inputnumber.types.ts`).
- Templates: `clearicon`, `incrementbuttonicon`, `decrementbuttonicon` (content children or `pTemplate`).
- Value flows through `ControlValueAccessor`. With a control using `updateOn: 'blur'`, the model update is held back while the field has focus (`updateModel` in `inputnumber.ts`).
- No `roundingMode` and no `highlightOnFocus`.

### PrimeVue

- Props (`BaseInputNumber.vue`): `modelValue`, `defaultValue`, `name`, `size: 'small' | 'large'`, `invalid` (`false`), `disabled` (`false`), `variant` (`null`), `fluid` (`null`), `formControl`, `showClear` (`false`), `readonly` (`false`), `highlightOnFocus` (`false`), `roundingMode` (default `'halfExpand'`; accepted: `ceil`, `floor`, `expand`, `trunc`, `halfCeil`, `halfFloor`, `halfExpand`, `halfTrunc`, `halfEven`), `min` (`null`), `max` (`null`), `step` (`1`), `incrementIcon`, `decrementIcon`, `incrementButtonClass`, `decrementButtonClass`, `inputClass`, `ariaLabelledby`, `ariaLabel`, `required` (declared in the base component but absent from the `InputNumberProps` typing), plus `pt`, `ptOptions`, `unstyled`, `dt`. Deprecated: `incrementButtonIcon`, `decrementButtonIcon`.
- Emits: `update:modelValue(number)`, `value-change(number)`, `input(InputNumberInputEvent)` with `{ originalEvent, value, formattedValue }`, `focus(Event)`, `blur(InputNumberBlurEvent)` with `{ originalEvent, value: string }` (`primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.d.ts`).
- Slots: `incrementbutton` and `decrementbutton` (scope `{ listeners }` with `onMousedown`, `onMouseup`, `onMouseleave`, `onKeydown`, `onKeyup`), `incrementicon`, `decrementicon` (and the two deprecated `*buttonicon` slots), `clearicon` (scope `{ clearCallback }`).
- Method: `getFormatter()` returns the current `Intl.NumberFormat`.

### PrimeReact

- Controlled props: `value: number | null`, `onValueChange(InputNumberValueChangeEvent)` (a `FormEvent<number | null>`), `onChange({ originalEvent, value })` (called only when the value really changed, before `onValueChange`), `onFocus`, `onBlur`, `onKeyDown`, `onKeyUp` (`primereact-10.9.9:components/lib/inputnumber/inputnumber.d.ts`).
- Other props: `roundingMode` (same nine values as PrimeVue), `invalid` (`false`), `disabled` (`false`), `variant: 'outlined' | 'filled'` (falls back to the context `inputStyle`), `size: number` (native HTML `size`, not a visual size), `maxLength`, `readOnly`, `required`, `pattern`, `type` (default `'text'`), `inputMode`, `inputRef`, `autoFocus`, `tabIndex`, `inputClassName`, `className`, `incrementButtonClassName`, `decrementButtonClassName`, `incrementButtonIcon`, `decrementButtonIcon` (`IconType`), `tooltip`, `tooltipOptions`, `ariaLabelledBy`, plus `pt`, `ptOptions`, `unstyled` (defaults in `primereact-10.9.9:components/lib/inputnumber/InputNumberBase.js`). `aria-*` and `data-*` props are forwarded to the input.
- No `showClear`, `highlightOnFocus` or `fluid` props.
- `inputMode` defaults to `'numeric'` when `mode === 'decimal'` and neither fraction-digit prop is set, otherwise `'decimal'`.

### Behaviour worth knowing

- Parser: a `constructParser()` step builds locale-specific regular expressions (numerals, group, decimal, minus sign, currency, prefix, suffix) from `Intl.NumberFormat`. It re-runs when any formatting prop changes.
- Spinning: `step` is added to the current value, then clamped. PrimeVue and PrimeReact add through a helper that rounds to the larger number of decimal places of value and step (`addWithPrecision`), so `0.1 + 0.2` style drift does not appear; PrimeNG adds the plain numbers (`spin()` in `inputnumber.ts`). Holding a button repeats after 500 ms, then every 40 ms.
- Commit points: `Tab`, `Enter` (PrimeVue and PrimeReact also `NumpadEnter`) and blur validate, reformat and write the model.
- `allowEmpty: false` turns an empty value into `0` for display (PrimeReact uses `min || 0` when evaluating).

## 6. Usage guidance

- Numerals: bind the number with `ngModel`, `v-model` or `value` plus `onValueChange`; the demos cover integer-only, no-grouping and min/max fraction digits (`primeng-21.1.9:apps/showcase/doc/inputnumber/numerals-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/NumeralsDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/numberalsdoc.js`).
- Forms: PrimeNG supports template-driven and reactive forms; PrimeVue integrates with `@primevue/forms` using `name` on the field and a `Message` for the error; PrimeReact has no forms section (`primeng-21.1.9:apps/showcase/doc/inputnumber/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FormsDoc.vue`).
- Locale: the `locale` prop sets grouping and decimal symbols; it defaults to the user locale (`primeng-21.1.9:apps/showcase/doc/inputnumber/locale-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/LocaleDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/localedoc.js`).
- Currency: `mode="currency"` with an ISO 4217 `currency`; `currencyDisplay` picks the symbol, the code or the name (`primeng-21.1.9:apps/showcase/doc/inputnumber/currency-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/CurrencyDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/currencydoc.js`).
- Prefix and suffix: free text such as units around the number (`primeng-21.1.9:apps/showcase/doc/inputnumber/prefixsuffix-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/PrefixSuffixDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/prefixsuffixdoc.js`).
- Buttons: `showButtons` plus `buttonLayout`; arrow keys spin even without buttons (`primeng-21.1.9:apps/showcase/doc/inputnumber/buttons-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/ButtonsDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/buttonsdoc.js`).
- Vertical: `buttonLayout="vertical"` (`primeng-21.1.9:apps/showcase/doc/inputnumber/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/VerticalDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/verticaldoc.js`).
- Labels: [FloatLabel](floatlabel.md) in all three; [IftaLabel](iftalabel.md) in PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/inputnumber/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/IftaLabelDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/floatlabeldoc.js`).
- Clear icon: `showClear` adds a reset icon; PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/inputnumber/clearicon-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/ClearIconDoc.vue`).
- Sizes: small and large alternatives; PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/inputnumber/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/SizesDoc.vue`).
- Fluid: full-width layout; PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/inputnumber/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FluidDoc.vue`). PrimeReact demos wrap the fields in a `p-fluid` container instead (`primereact-10.9.9:components/doc/inputnumber/buttonsdoc.js`).
- Filled variant for stronger emphasis (`primeng-21.1.9:apps/showcase/doc/inputnumber/filled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FilledDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/filleddoc.js`).
- Disabled: not editable and not focusable (`primeng-21.1.9:apps/showcase/doc/inputnumber/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/DisabledDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/disableddoc.js`).
- Invalid: the `invalid` flag marks failed validation (`primeng-21.1.9:apps/showcase/doc/inputnumber/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/InvalidDoc.vue`, `primereact-10.9.9:components/doc/inputnumber/invaliddoc.js`).
- Services and providers: none required.

## 7. Accessibility

- The input carries `role="spinbutton"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` in all three (`primeng-21.1.9:packages/primeng/src/inputnumber/inputnumber.ts`, `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.vue`, `primereact-10.9.9:components/lib/inputnumber/InputNumber.js`).
- Naming: a `<label for>` plus `inputId`, or `ariaLabelledBy` / `aria-labelledby`, or `ariaLabel` / `aria-label`; PrimeNG also offers `ariaDescribedBy` and `ariaRequired` (`primeng-21.1.9:apps/showcase/doc/inputnumber/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputnumber/AccessibilityDoc.vue`). PrimeReact's doc asks authors to give the span and the input distinct ids (`id` and `inputId`) (`primereact-10.9.9:components/doc/inputnumber/accessibilitydoc.js`).
- Keyboard (identical tables): `Tab` moves focus to the input; `Up` increments; `Down` decrements; `Home` sets the minimum when provided; `End` sets the maximum when provided.
- Source behaviour beyond the table: `Left`/`Right` jump the caret over formatting characters, `Enter` commits the value, and `Backspace`/`Delete` are handled by the component to keep the formatted text valid.
- The spinner buttons are `aria-hidden` with `tabindex="-1"`, so they are pointer-only and the keyboard path is the arrow keys on the input.
- Source quirk: PrimeNG `Home`/`End` test `if (this.min())` / `if (this.max())`, so a bound of `0` is ignored; PrimeVue and PrimeReact test emptiness instead (`primeng-21.1.9:packages/primeng/src/inputnumber/inputnumber.ts`, `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.vue`, `primereact-10.9.9:components/lib/inputnumber/InputNumber.js`).

## 8. Theming

- Classes (PrimeNG and PrimeVue, from `@primeuix/styles`): `p-inputnumber`, `p-component`, `p-inputwrapper`, `p-inputwrapper-filled`, `p-inputwrapper-focus`, `p-inputnumber-stacked`, `p-inputnumber-horizontal`, `p-inputnumber-vertical`, `p-inputnumber-fluid`, `p-invalid`, `p-inputnumber-input`, `p-inputnumber-button-group`, `p-inputnumber-button`, `p-inputnumber-increment-button`, `p-inputnumber-decrement-button`, `p-inputnumber-clear-icon`, `p-disabled` on a button (`primeng-21.1.9:packages/primeng/src/inputnumber/style/inputnumberstyle.ts`, `primevue-4.5.5:packages/primevue/src/inputnumber/style/InputNumberStyle.js`).
- PrimeReact uses different names: `p-inputnumber-buttons-stacked|horizontal|vertical` on the root, `p-inputnumber-button-up` / `p-inputnumber-button-down` on the buttons, `p-variant-filled` on the input, and the buttons also carry `p-button p-button-icon-only` (`primereact-10.9.9:components/lib/inputnumber/InputNumberBase.js`).
- PrimeNG adds `ng-invalid.ng-dirty` rules for the three selector spellings that recolour the inner `.p-inputtext` border and placeholder with `inputtext.*` tokens.
- Pass-through keys: PrimeNG `host`, `root`, `pcInputText`, `clearIcon`, `buttonGroup`, `incrementButton`, `decrementButton`, `incrementButtonIcon`, `decrementButtonIcon` (`primeng-21.1.9:packages/primeng/src/types/inputnumber/inputnumber.types.ts`); PrimeVue `root`, `pcInputText`, `clearIcon`, `buttonGroup`, `incrementButton`, `incrementIcon`, `decrementButton`, `decrementIcon`, `hooks` (`primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.d.ts`); PrimeReact `root`, `input`, `buttonGroup`, `incrementButton`, `decrementButton`, `tooltip`, `hooks` (no icon keys) (`primereact-10.9.9:components/lib/inputnumber/inputnumber.d.ts`).
- Data attribute `data-p` mirrors state (invalid, fluid, filled, size, layout; PrimeNG adds disabled, focus, empty) for styled/unstyled hooks.
- Design tokens (`@primeuix/themes-2.0.3:types/inputnumber/index.d.ts`): section `root` — `transitionDuration`; section `button` — `width`, `borderRadius`, `verticalPadding`, `background`, `hoverBackground`, `activeBackground`, `borderColor`, `hoverBorderColor`, `activeBorderColor`, `color`, `hoverColor`, `activeColor`. Aura sets the button width to `2.5rem`, radius and vertical padding from `form.field.*`, a transparent background, surface-scale hover/active colours with separate light and dark values (`@primeuix/themes-2.0.3:dist/aura/inputnumber/index.mjs`). The field itself is styled by the `inputtext` tokens.
- Style module: `@primeuix/styles-2.0.3:dist/inputnumber/index.mjs`. It also sizes the button icons from `form.field.sm|lg.font.size` when the input has `p-inputtext-sm|lg`, positions the clear icon, and shifts a FloatLabel label when the layout is horizontal.
- PrimeReact: own CSS in the `styles` string of `InputNumberBase.js` inside `@layer primereact`; design tokens N/A. Fluid is handled by an ancestor `.p-fluid` selector.
- Catalog class lists: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`.

## 9. Relationships

- Embeds: [InputText](inputtext.md) (the field; also the PT target `pcInputText`/`input`), angle-up, angle-down and times icons. PrimeNG also uses its `AutoFocus` directive; PrimeReact adds `Tooltip` and `Ripple`.
- Uses the `Fluid` container (PrimeNG `pcFluid`, PrimeVue `$pcFluid`) for inherited full width.
- Wrapped by: [FloatLabel](floatlabel.md), [IftaLabel](iftalabel.md); sits beside [IconField](iconfield.md) and [InputGroup](inputgroup.md) layouts.
- Related: [KeyFilter](keyfilter.md) restricts characters on plain text inputs, whereas InputNumber does its own key handling; InputOtp, InputMask and Slider cover other constrained numeric/text entry (other categories or records).
- Forms: PrimeVue Form (`@primevue/forms`) is a cross-category dependency for the `name`-based integration.

## 10. Dependencies

- PrimeNG: `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/autofocus`, `primeng/basecomponent`, `primeng/baseinput`, `primeng/bind`, `primeng/icons`, `primeng/inputtext`, `@angular/forms`, `@angular/common`, `@primeuix/utils` (`getSelection`), `@primeuix/styles/inputnumber`.
- PrimeVue: `@primevue/core/baseinput`, `@primevue/core/base/style`, `@primevue/icons/angledown|angleup|times`, `primevue/inputtext`, `@primeuix/utils` (`cn`) with `/dom` and `/object` helpers, `@primeuix/styles/inputnumber`.
- PrimeReact: `ComponentBase`, `PrimeReactContext`, hooks (`useMergeProps`, mount/update/unmount effects), `AngleDownIcon`, `AngleUpIcon`, `InputText`, `Ripple`, `Tooltip`, `DomHandler`/`IconUtils`/`ObjectUtils`/`classNames`.
- No external npm library; formatting uses the platform `Intl.NumberFormat`.

## 11. Framework differences

| Aspect                | PrimeNG                                                | PrimeVue                                      | PrimeReact                                            |
| --------------------- | ------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------- |
| Selector / tag        | `p-inputNumber`, `p-inputnumber`, `p-input-number`     | `<InputNumber>`                               | `<InputNumber>`                                       |
| Value binding         | `ControlValueAccessor` (`ngModel`, forms)              | `v-model` / `@primevue/forms`                 | `value` + `onValueChange` (plus `onChange`)           |
| Change events         | `onInput`, `onFocus`, `onBlur`, `onKeyDown`, `onClear` | `input`, `focus`, `blur`, `value-change`      | `onChange`, `onValueChange`, `onKeyDown`, `onKeyUp`   |
| Clear icon            | `showClear`, `clearicon` template                      | `showClear`, `clearicon` slot                 | —                                                     |
| Rounding mode         | —                                                      | `roundingMode` (`halfExpand`)                 | `roundingMode`                                        |
| Highlight on focus    | —                                                      | `highlightOnFocus`                            | —                                                     |
| Visual size           | `size` `'small' \| 'large'`                            | `size` `'small' \| 'large'`                   | — (`size` is native HTML `size`)                      |
| Fluid                 | `fluid` / parent Fluid                                 | `fluid` / parent Fluid                        | ancestor `.p-fluid` CSS                               |
| Button customisation  | `*ButtonClass`, `*ButtonIcon`, icon templates          | button slots with `listeners`, icon slots     | `*ButtonClassName`, `*ButtonIcon`                     |
| Button disabled state | `p-disabled` keyed on `maxlength()`/`minlength()`      | `p-disabled` at max/min value                 | `p-disabled` only when `disabled`                     |
| Spin arithmetic       | plain addition                                         | `addWithPrecision`                            | `addWithPrecision`                                    |
| Extras                | `title`, `autocomplete`, `ariaDescribedBy`             | —                                             | `tooltip`, `inputMode`, `type`, `pattern`, `inputRef` |
| Class names           | `p-inputnumber-stacked`, `-increment-button`           | same as PrimeNG                               | `-buttons-stacked`, `-button-up`                      |
| PT keys               | `host`, `root`, `pcInputText`, `…Icon`                 | `root`, `pcInputText`, `…Icon`                | `root`, `input`, `tooltip`                            |
| Tokens                | `@primeuix/themes` `root`, `button`                    | same                                          | N/A (own CSS)                                         |
| Deprecated            | `styleClass`                                           | `*ButtonIcon` props and slots, `d_modelValue` | —                                                     |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/inputnumber/inputnumber.ts`, `primeng-21.1.9:packages/primeng/src/inputnumber/public_api.ts`, `primeng-21.1.9:packages/primeng/src/inputnumber/style/inputnumberstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputnumber/inputnumber.types.ts`, `primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:apps/showcase/doc/inputnumber/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/numerals-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/locale-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/currency-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/prefixsuffix-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/buttons-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/vertical-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/iftalabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/clearicon-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/fluid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/filled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputnumber/accessibility-doc.ts`
- `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.vue`, `primevue-4.5.5:packages/primevue/src/inputnumber/BaseInputNumber.vue`, `primevue-4.5.5:packages/primevue/src/inputnumber/InputNumber.d.ts`, `primevue-4.5.5:packages/primevue/src/inputnumber/style/InputNumberStyle.js`, `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`
- `primevue-4.5.5:apps/showcase/doc/inputnumber/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/NumeralsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/LocaleDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/CurrencyDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/PrefixSuffixDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/ButtonsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/VerticalDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/IftaLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/ClearIconDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FluidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputnumber/AccessibilityDoc.vue`
- `primereact-10.9.9:components/lib/inputnumber/InputNumber.js`, `primereact-10.9.9:components/lib/inputnumber/InputNumberBase.js`, `primereact-10.9.9:components/lib/inputnumber/inputnumber.d.ts`
- `primereact-10.9.9:components/doc/inputnumber/importdoc.js`, `primereact-10.9.9:components/doc/inputnumber/numberalsdoc.js`, `primereact-10.9.9:components/doc/inputnumber/localedoc.js`, `primereact-10.9.9:components/doc/inputnumber/currencydoc.js`, `primereact-10.9.9:components/doc/inputnumber/prefixsuffixdoc.js`, `primereact-10.9.9:components/doc/inputnumber/buttonsdoc.js`, `primereact-10.9.9:components/doc/inputnumber/verticaldoc.js`, `primereact-10.9.9:components/doc/inputnumber/floatlabeldoc.js`, `primereact-10.9.9:components/doc/inputnumber/filleddoc.js`, `primereact-10.9.9:components/doc/inputnumber/invaliddoc.js`, `primereact-10.9.9:components/doc/inputnumber/disableddoc.js`, `primereact-10.9.9:components/doc/inputnumber/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/inputnumber/index.mjs`
- `@primeuix/themes-2.0.3:types/inputnumber/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputnumber/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
