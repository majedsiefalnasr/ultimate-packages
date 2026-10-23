# InputOtp

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

InputOtp is a one-time-password (verification code) field rendered as a row of single-character inputs. The user types or pastes a code; focus advances automatically from cell to cell, and the component exposes the whole code as one string. It supports a configurable `length` (default 4), a `mask` that switches the cells to `type="password"`, an `integerOnly` mode that accepts digits only and requests a numeric keyboard, and a template that replaces each cell with custom markup. Each cell is a themed [InputText](inputtext.md), so variants, sizes and invalid styling come from that component. All three frameworks ship it with the same core feature set; PrimeNG and PrimeVue add `size`, form-library integration and a `filled`/`sizes` showcase, while PrimeReact has the smallest surface and several type-versus-source mismatches (see §11 and §5).

## 2. Names & status

- Canonical name: **InputOtp** (file `inputotp`). Display name in the menus: "InputOtp" (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`); all three list it in the Form category.
- PrimeNG: `InputOtp` standalone component, selectors `p-inputOtp, p-inputotp, p-input-otp`; module `InputOtpModule`; stable, not deprecated (`primeng-21.1.9:packages/primeng/src/inputotp/inputotp.ts`).
- PrimeVue: `InputOtp`; stable, not deprecated (`primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue`).
- PrimeReact: `InputOtp`; stable, not deprecated (`primereact-10.9.9:components/lib/inputotp/InputOtp.js`).
- No legacy aliases. Spelling is `InputOtp` (not `InputOTP`) in code; the theme-token docs title it "InputOTP Design Tokens" (`@primeuix/themes-2.0.3:types/inputotp/index.d.ts`).
- Deprecated members: none found in any of the three sources.

## 3. Per framework

### PrimeNG 21.1.9

- Import: `import { InputOtpModule } from 'primeng/inputotp';` (`primeng-21.1.9:apps/showcase/doc/inputotp/import-doc.ts`). The standalone class `InputOtp` is exported from the same entry point (`primeng-21.1.9:packages/primeng/src/inputotp/public_api.ts`, which also re-exports `./style/inputotpstyle`, i.e. `InputOtpStyle` and the `InputOtpClasses` enum).
- Selector / tag: `<p-inputotp>` (also `p-inputOtp`, `p-input-otp`). The host element itself carries the root class (`'[class]': "cx('root')"`).
- Class: `export class InputOtp extends BaseEditableHolder<InputOtpPassThrough> implements AfterViewChecked`; `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`; provides `NG_VALUE_ACCESSOR` (`INPUT_OTP_VALUE_ACCESSOR`), `InputOtpStyle`, an `INPUTOTP_INSTANCE` token and `PARENT_INSTANCE`; `hostDirectives: [Bind]`.
- Source: `primeng-21.1.9:packages/primeng/src/inputotp/inputotp.ts`, style `primeng-21.1.9:packages/primeng/src/inputotp/style/inputotpstyle.ts`, types `primeng-21.1.9:packages/primeng/src/types/inputotp/inputotp.types.ts` (re-exported from `primeng/types/inputotp`).
- Exports: `InputOtp`, `InputOtpModule`, `INPUT_OTP_VALUE_ACCESSOR`, `InputOtpStyle`, `InputOtpClasses`; types `InputOtpChangeEvent`, `InputOtpInputTemplateContext`, `InputOtpTemplateEvents`, `InputOtpPassThrough`, `InputOtpPassThroughOptions`, `InputOtpTemplates`. No sub-component or directive.

### PrimeVue 4.5.5

- Import: `import InputOtp from 'primevue/inputotp';` (`primevue-4.5.5:apps/showcase/doc/inputotp/ImportDoc.vue`); also re-exported from the `primevue` barrel (`primevue-4.5.5:packages/primevue/src/index.d.ts`).
- Tag: `<InputOtp>`; root `div`, then `length` slots/inputs.
- Source: `primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue` (extends `BaseInputOtp`, `inheritAttrs: false`, `emits: ['change', 'focus', 'blur']`), `primevue-4.5.5:packages/primevue/src/inputotp/BaseInputOtp.vue` (extends `BaseInput`, provides `$pcInputOtp` and `$parentInstance`), types `primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.d.ts`, style `primevue-4.5.5:packages/primevue/src/inputotp/style/InputOtpStyle.js`. The cell component is registered locally as `OtpInputText` (an alias of `primevue/inputtext`).
- Base chain: `InputOtp` → `BaseInputOtp` → `BaseInput` (`size`, `fluid`, `variant`) → `BaseEditableHolder` (`modelValue`, `defaultValue`, `name`, `invalid`, `disabled`, `formControl`, form registration) → `BaseComponent` (`primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).
- No sub-components or directives.

### PrimeReact 10.9.9

- Import: `import { InputOtp } from 'primereact/inputotp';` (`primereact-10.9.9:components/doc/inputotp/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/inputotp/InputOtp.js` (`React.memo(React.forwardRef(...))`, `displayName = 'InputOtp'`), base `primereact-10.9.9:components/lib/inputotp/BaseInputOtp.js` (named `BaseInputOtp.js`, not `InputOtpBase.js`, unlike every other folder; it exports `InputOtpBase`), types `primereact-10.9.9:components/lib/inputotp/inputotp.d.ts`, package entry `primereact-10.9.9:components/lib/inputotp/package.json`.
- No sub-components. The showcase page wrongly lists an `InputOtpTab` API doc and describes the component as grouping "contents in tabs" (copy-paste from TabView); no such component exists (`primereact-10.9.9:pages/inputotp/index.js`).

## 4. Anatomy

- **root** — a wrapper that lays the cells out in a flex row (`p-inputotp p-component`). PrimeNG: the host element `<p-inputotp>` itself; PrimeVue/PrimeReact: a `div` (`primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue`, `primereact-10.9.9:components/lib/inputotp/InputOtp.js`).
- **cells** — `length` sibling `<input>` elements, each an [InputText](inputtext.md) with class `p-inputotp-input` (PT key `pcInputText` in PrimeNG/PrimeVue, `input` in PrimeReact). Cell 1 of PrimeNG has `maxlength = length`, the others `1`, so an autofilled or pasted full code can land in the first cell (`primeng-21.1.9:packages/primeng/src/inputotp/inputotp.ts`).
- **custom cell** — when a template/slot/`inputTemplate` is supplied it replaces the default `InputText` for every position; the component keeps the surrounding row and the token model. Extra elements (for example a separator) may be rendered between cells (`primevue-4.5.5:apps/showcase/doc/inputotp/SampleDoc.vue`).
- Focus movement walks `nextElementSibling` / `previousElementSibling` and skips non-`INPUT` nodes, so custom templates must keep real `<input>` elements as siblings inside the root (`findNextInput` / `findPrevInput` in all three sources).
- The wireframe image in the PrimeReact showcase is only a placeholder (`primereact-10.9.9:components/doc/inputotp/pt/wireframe.js`).

## 5. API highlights

Full lists are in the catalog (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`). Defaults below are from source.

**Shared props (all three):**

- `length: number = 4` — number of cells.
- `mask: boolean = false` — cells render `type="password"`.
- `integerOnly: boolean = false` — keydown allows only `/^[0-9]$/` (plus navigation keys); paste is accepted only when `!isNaN(pasted)`; `inputmode` is `numeric` instead of `text`.
- `readonly` / `readOnly`, `disabled`, `invalid`, `variant: 'outlined' | 'filled'`, `tabindex`, `unstyled`, `pt`, `ptOptions`.

**PrimeNG** (`primeng-21.1.9:packages/primeng/src/inputotp/inputotp.ts`):

- Model: `ngModel` / `formControlName` through `ControlValueAccessor`; the control value is a string; arrays are also accepted on write (sliced to `length`). `writeControlValue` stores tokens as characters.
- Inputs: `readonly` (`booleanAttribute`), `tabindex: number | null = null`, `length = 4`, `styleClass: string | undefined` (applied to each cell input, not the root), `mask = false`, `integerOnly = false`, `autofocus` (`booleanAttribute`, only the first cell), signal inputs `variant`, `size: 'large' | 'small'`; inherited from `BaseEditableHolder`: `required`, `invalid`, `disabled`, `name` (signal inputs, `booleanAttribute` transforms).
- Outputs: `onChange: EventEmitter<InputOtpChangeEvent>` (`{ originalEvent: Event; value: any }`), `onFocus: EventEmitter<Event>`, `onBlur: EventEmitter<Event>`.
- Template: `input` (`@ContentChild('input')` or a `pTemplate="input"`/`PrimeTemplate`), context `InputOtpInputTemplateContext { $implicit: number | string; events: InputOtpTemplateEvents; index: number }` (`primeng-21.1.9:packages/primeng/src/types/inputotp/inputotp.types.ts`). `events` offers `input`, `keydown`, `focus`, `blur`, `paste` handlers; the type declares `input: (event, index) => void` but the runtime function takes only the event (the index is bound by the component).
- Value changes are not marked touched: the source never calls `onModelTouched`, so a form that waits for `touched` to show an error relies on the surrounding form's submit state (the template-driven demo checks `otpModel.touched || exampleForm.submitted`).

**PrimeVue** (`primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.d.ts`, `primevue-4.5.5:packages/primevue/src/inputotp/BaseInputOtp.vue`):

- Props: `modelValue` (typed `boolean | string | undefined`; the description "whether a inputotp should be checked" is a leftover from Checkbox), `defaultValue`, `name`, `size: HintedString<'small' | 'large'>`, `invalid`, `disabled = false`, `readonly = false`, `variant`, `tabindex: number = null`, `length = 4`, `mask = false`, `integerOnly = false`, `formControl`, `dt`, `pt`, `ptOptions`, `unstyled`. `fluid` is inherited from `BaseInput` but is not in the d.ts and is not used by the template.
- Emits: `update:modelValue(value: string)`, `value-change(value: string)`, `change(event: InputOtpChangeEvent)` (`{ originalEvent: Event; value: string }`), `focus(event)`, `blur(event)`.
- Slot: `default` with scope `{ events: (index) => InputOtpTemplateEvents; attrs: (index) => InputOtpTemplateAttrsOptions; index: number }`. In practice the template receives `events` and `attrs` already resolved for the current cell (`events: getTemplateEvents(i - 1)`, `attrs: getTemplateAttrs(i - 1)`); `attrs` carries only `{ value }`.
- Forms: with `@primevue/forms`, `name` registers the field and each cell gets `name="<formName>_<index>"` (`:name="$formName ? $formName + '_' + (i - 1) : undefined"`).
- No `autofocus` prop and no per-cell `aria-label`.

**PrimeReact** (`primereact-10.9.9:components/lib/inputotp/inputotp.d.ts`, `primereact-10.9.9:components/lib/inputotp/BaseInputOtp.js`):

- Props: `value: string | number | null = null` (controlled; used to seed and re-sync tokens), `invalid = false`, `disabled = false`, `readOnly` (default `false` in `defaultProps`; the d.ts declares it as `readonly`, but the source reads `props.readOnly`, so the declared name is not honoured), `variant: 'outlined' | 'filled'` (d.ts says default `outlined`, `defaultProps` has `null`), `tabindex` (d.ts) vs `tabIndex` (source), `length = 4`, `mask = false`, `integerOnly = false`, `inputTemplate`, `autoFocus` (HTML attribute, first cell only), `style` (applied to the root), `unstyled`, `pt`, `ptOptions`. The d.ts also extends the HTML input attributes but the component forwards only the props listed here.
- Events: `onChange(e: InputOtpChangeEvent)` (`{ originalEvent: React.SyntheticEvent; value?: string | number | null }`; the runtime value is a string). `onInput` and `onFocus`/`onBlur` are declared in the d.ts, but the source calls `props.focus(event)` and `props.blur(event)` and never `onInput`/`onFocus`/`onBlur`, so those handlers are not invoked from the shipped code.
- `inputTemplate: (options: { events, props }) => ReactNode` — `events` is `{ onInput, onKeyDown, onFocus, onBlur, onPaste }` and `props` is `{ value, type, variant, readOnly, disabled, tabIndex, autoFocus, 'aria-label', 'data-index', className }` for the current cell (`primereact-10.9.9:components/lib/inputotp/InputOtp.js`).
- `defaultProps` also lists `modelValue: false` and `className: null`, neither of which is read by the component.
- No `size`, no `name`, no form-library integration.

## 6. Usage guidance

- **Import** — one import per framework (`primeng-21.1.9:apps/showcase/doc/inputotp/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/ImportDoc.vue`, `primereact-10.9.9:components/doc/inputotp/importdoc.js`).
- **Basic** — bind the value two-way (`ngModel`, `v-model`, `value` + `onChange`) and set `length` when 4 characters is not what you want (`primeng-21.1.9:apps/showcase/doc/inputotp/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/BasicDoc.vue`, `primereact-10.9.9:components/doc/inputotp/basicdoc.js`).
- **Forms** — PrimeVue wraps the field in a `Form` from the forms library (field `name`, zod resolver, `$form.<name>.invalid` for the message) (`primevue-4.5.5:apps/showcase/doc/inputotp/FormsDoc.vue`); PrimeNG has two demos, template-driven (`required`, `[minlength]="4"`, `[invalid]` bound to touched/submitted state) and reactive (`formControlName`, `[invalid]`) (`primeng-21.1.9:apps/showcase/doc/inputotp/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/reactiveforms-doc.ts`). PrimeReact has no Forms section. The demos also use Message and Toast; no service is required by InputOtp itself.
- **Mask** — turn on `mask` to hide the typed characters like a password (`primeng-21.1.9:apps/showcase/doc/inputotp/mask-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/MaskDoc.vue`, `primereact-10.9.9:components/doc/inputotp/maskdoc.js`).
- **Integer Only** — `integerOnly` restricts input to digits (`primeng-21.1.9:apps/showcase/doc/inputotp/integeronly-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/IntegerOnlyDoc.vue`, `primereact-10.9.9:components/doc/inputotp/integeronlydoc.js`).
- **Filled** — `variant="filled"` for a more emphasised look; PrimeVue only (`primevue-4.5.5:apps/showcase/doc/inputotp/FilledDoc.vue`). PrimeNG and PrimeReact support the `variant` prop but have no demo for it.
- **Sizes** — `size="small"` / `size="large"` next to the default; PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/inputotp/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/SizesDoc.vue`).
- **Template** — supply your own cell markup and wire it to the provided events and token value (PrimeNG `#input` template with `let-token let-events="events"`; PrimeVue default slot `#default="{ attrs, events }"`; PrimeReact `inputTemplate={fn}` rendering `<input {...events} {...props} />`) (`primeng-21.1.9:apps/showcase/doc/inputotp/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/TemplateDoc.vue`, `primereact-10.9.9:components/doc/inputotp/templatedoc.js`).
- **Sample** — a full "authenticate your account" layout with 6 cells, a separator element after the third cell (using the `index` context) and Resend/Submit buttons (`primeng-21.1.9:apps/showcase/doc/inputotp/sample-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/SampleDoc.vue`, `primereact-10.9.9:components/doc/inputotp/sampledoc.js`). The PrimeNG sample sets `maxLength` to 1 on its custom inputs and drives only `events.input` and `events.keydown`.
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/inputotp/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputotp/accessibilitydoc.js`).
- **Pass Through / Theming** — PT viewer, class list and Tailwind guidance (`primeng-21.1.9:apps/showcase/doc/inputotp/pt/PTComponent.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/pt/index.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/theming/index.vue`, `primereact-10.9.9:components/doc/inputotp/theming/styleddoc.js`, `primereact-10.9.9:components/doc/inputotp/theming/tailwinddoc.js`).
- Page structure for reference: PrimeNG `Import, Basic, Mask, Integer Only, Sizes, Template, Forms (Template Driven / Reactive), Sample, Accessibility` (`primeng-21.1.9:apps/showcase/pages/inputotp/index.ts`); PrimeVue `Import, Basic, Forms, Mask, Integer Only, Filled, Sizes, Template, Sample, Accessibility` (`primevue-4.5.5:apps/showcase/pages/inputotp/index.vue`); PrimeReact `Import, Basic, Mask, Integer Only, Template, Sample, Accessibility` (`primereact-10.9.9:pages/inputotp/index.js`).
- Practical tips from source: the value is a plain string, so a controlled consumer should compare against `length` for completeness; SMS autofill/paste of a whole code into the first cell is handled by all three; to localise the PrimeReact per-cell label, set `locale`'s `aria.otpLabel` (`{0}` is the 1-based cell number).

## 7. Accessibility

The showcase accessibility sections are identical in all three frameworks: screen-reader support is delegated to [InputText](inputtext.md) because each cell is an InputText, and the keyboard table is: **Tab** moves focus to the input otp; **Right Arrow** moves to the next input; **Left Arrow** moves to the previous input; **Backspace** deletes the input and moves focus to the previous input (`primeng-21.1.9:apps/showcase/doc/inputotp/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputotp/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputotp/accessibilitydoc.js`).

Behaviour from source:

- No `role`, `aria-*` or group labelling is set on the root in any framework. The root is a plain container (`primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue`).
- PrimeReact gives every cell `aria-label` from the locale string `aria.otpLabel` (default "Please enter one time password character {0}", 1-based index) and `data-index` (`primereact-10.9.9:components/lib/inputotp/InputOtp.js`, `primereact-10.9.9:components/lib/api/Locale.js`). PrimeNG and PrimeVue set no per-cell label; the application must supply one (for PrimeNG and PrimeVue only through a template or `pt`).
- PrimeVue/PrimeNG/PrimeReact all call `select()` on focus and after programmatic moves, so typing replaces the existing character.
- Key handling: `ArrowLeft`/`ArrowRight` move and are `preventDefault`ed; `ArrowUp`/`ArrowDown` are suppressed; `Backspace` on an empty cell moves to the previous cell (a non-empty cell is cleared by the browser's input event, which then moves back). Modifier handling: PrimeNG and PrimeReact ignore keys with Alt, Ctrl or Meta; PrimeVue ignores only Ctrl and Meta. PrimeReact additionally handles `Delete` (clears the current cell, moves forward) and ignores all keys when disabled or read-only.
- `inputmode="numeric"` is set when `integerOnly` is on, which brings up a numeric keyboard on touch devices (all three).
- PrimeNG `integerOnly` blocks the Tab key: the default branch of `onKeyDown` calls `preventDefault` for any key that is not `0`-`9`, and PrimeNG has no `Tab`/`Enter` case, so tabbing out of the field is prevented while `integerOnly` is on. PrimeVue and PrimeReact explicitly let `Tab` and `Enter` through (`primeng-21.1.9:packages/primeng/src/inputotp/inputotp.ts`, `primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue`, `primereact-10.9.9:components/lib/inputotp/InputOtp.js`).
- PrimeVue also handles virtual keyboards: `isTouchDevice() && event instanceof CustomEvent` input events advance focus (`primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue`); and `onClick` re-selects the cell after a 1 ms delay.

## 8. Theming

- **Style classes** (catalog and source): `p-inputotp` (root, plus `p-component`) and `p-inputotp-input` (each cell). The PrimeNG enum `InputOtpClasses` has members `root` and `pcInputText`; the PrimeVue enum has `root` and `pcInput` (while the style `classes` object key in the same package is `pcInputText`, an upstream naming mismatch); PrimeReact has `root` and `input` (`primeng-21.1.9:packages/primeng/src/inputotp/style/inputotpstyle.ts`, `primevue-4.5.5:packages/primevue/src/inputotp/style/InputOtpStyle.js`, `primevue-4.5.5:packages/primevue/src/inputotp/style/InputOtpStyle.d.ts`, `primereact-10.9.9:components/lib/inputotp/BaseInputOtp.js`, `primereact-10.9.9:components/doc/inputotp/theming/styleddoc.js`). Each cell also keeps the InputText classes (`p-inputtext`, `p-inputtext-sm` / `p-inputtext-lg`, filled/invalid), which the structural CSS targets for sizing.
- **Pass-through section keys:**
  - PrimeNG: `host`, `root`, `pcInputText` (`InputTextPassThrough`) (`primeng-21.1.9:packages/primeng/src/types/inputotp/inputotp.types.ts`).
  - PrimeVue: `root`, `pcInputText` (`InputTextPassThroughOptions`), `hooks` (`primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.d.ts`).
  - PrimeReact: `root`, `input`, `hooks`; the d.ts comment on `input` says "Tooltip component", which is wrong (`primereact-10.9.9:components/lib/inputotp/inputotp.d.ts`). The Tailwind example nests the InputText PT as `input.root` (`primereact-10.9.9:components/doc/inputotp/theming/tailwinddoc.js`).
- **Structural CSS** (`@primeuix/styles-2.0.3:dist/inputotp/index.mjs`): `.p-inputotp` is `display: flex; align-items: center; gap: dt('inputotp.gap')`; `.p-inputotp-input` is `text-align: center; width: dt('inputotp.input.width')`; the `.p-inputtext-sm` / `.p-inputtext-lg` variants use `inputotp.input.sm.width` and `inputotp.input.lg.width`. Used by PrimeNG (`@primeuix/styles/inputotp` in `primeng-21.1.9:packages/primeng/src/inputotp/style/inputotpstyle.ts`) and PrimeVue.
- **Design tokens** (`@primeuix/themes-2.0.3:types/inputotp/index.d.ts`): sections `root` (`gap`) and `input` (`width`, `sm.width`, `lg.width`); the type comments call the `sm`/`lg` entries "small/large screens", but they are size variants. Aura, Lara and Nora ship `gap: 0.5rem`, `width: 2.5rem`, `sm.width: 2rem`, `lg.width: 3rem`; Material ships `3rem`, `2.5rem`, `3.5rem` (`@primeuix/themes-2.0.3:dist/aura/inputotp/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/inputotp/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/inputotp/index.mjs`, `@primeuix/themes-2.0.3:dist/material/inputotp/index.mjs`). The cell's own look (border, focus ring, variant) comes from the `inputtext` tokens.
- **PrimeReact:** no `@primeuix`; tokens N/A. Its `BaseInputOtp.js` defines `css: { classes }` only; there is no `styles` entry, so `useHandleStyle(InputOtpBase.css.styles, ...)` loads no component CSS. The flex layout, gap and cell width come from the compiled theme stylesheets (for example `p-inputotp { display: flex; align-items: center; gap: 0.5rem }`, `p-inputotp-input { text-align: center; width: 2.5rem }` in `primereact-10.9.9:public/themes/lara-light-blue/theme.css`).
- Unstyled mode: `unstyled` removes classes (`cx` returns nothing) in PrimeReact and PrimeVue; PrimeNG passes `[unstyled]` to the cell InputText.

## 9. Relationships

- Embeds: [InputText](inputtext.md) (one per cell; PrimeNG as the `pInputText` directive with `pSize`, `variant`, `invalid`, PrimeVue/PrimeReact as the component). PrimeNG additionally uses the `pAutoFocus` directive for `autofocus`.
- Embedded by: no other Prime component uses InputOtp.
- Alternatives and related: InputMask (fixed-format single field), Password (masked single field), [InputNumber](inputnumber.md) (numeric entry), [KeyFilter](keyfilter.md) (character restriction on a plain field); InputOtp implements its own `integerOnly` filter instead of using KeyFilter.
- Form integration: PrimeVue `Form`/`FormField` (`@primevue/forms`) through `BaseEditableHolder`; PrimeNG `ControlValueAccessor` via `BaseEditableHolder`; PrimeReact none.
- Display companions in demos: Button, Message, Toast (not dependencies).
- No alias chain.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/forms` (`NG_VALUE_ACCESSOR`); `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/autofocus`, `primeng/baseeditableholder`, `primeng/basecomponent` (`PARENT_INSTANCE`), `primeng/bind`, `primeng/inputtext`, `primeng/ts-helpers`, `primeng/types/inputotp`, `primeng/base` (style), `@primeuix/styles/inputotp`.
- PrimeVue: `@primeuix/utils/dom` (`isTouchDevice`), `primevue/inputtext`, `./BaseInputOtp.vue`; base `@primevue/core/baseinput`; style `primevue/inputotp/style` → `@primeuix/styles/inputotp` and `@primevue/core/base/style`.
- PrimeReact: `../api/Api` (`PrimeReactContext`, `ariaLabel`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useUpdateEffect`), `../inputtext/InputText`, `../utils/Utils` (`ObjectUtils`).
- No external npm packages beyond the framework and the Prime internals.

## 11. Framework differences

| Aspect                 | PrimeNG 21.1.9                                            | PrimeVue 4.5.5                                                    | PrimeReact 10.9.9                                     |
| ---------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| Form                   | `ControlValueAccessor` component (`p-inputotp`)           | `v-model` / `@primevue/forms` field                               | Controlled `value` + `onChange`                       |
| Value prop             | `ngModel` / `formControlName` (string; arrays accepted)   | `modelValue` / `defaultValue` (string)                            | `value: string \| number \| null`                     |
| Change event           | `onChange` output                                         | `change` (+ `update:modelValue`, `value-change`)                  | `onChange`                                            |
| Focus / blur           | `onFocus`, `onBlur` outputs                               | `focus`, `blur` emits                                             | d.ts: `onFocus`/`onBlur`; source calls `focus`/`blur` |
| `size`                 | `size` (`small`/`large`)                                  | `size` (`small`/`large`)                                          | N/A                                                   |
| `variant`              | signal input                                              | prop (default `null`)                                             | prop (d.ts default `outlined`)                        |
| `autofocus`            | `autofocus` input (first cell)                            | none (attr falls on root)                                         | `autoFocus` (first cell)                              |
| Cell label             | none                                                      | none                                                              | `aria-label` from `aria.otpLabel` locale              |
| Template               | `#input` template (`$implicit`, `events`, `index`)        | default slot (`events`, `attrs`, `index`)                         | `inputTemplate({ events, props })`                    |
| Cell `maxlength`       | cell 1 = `length`, others 1                               | not set                                                           | not set                                               |
| Paste truncation       | `substring(0, length + 1)`                                | `substring(0, length)`                                            | `substring(0, length + 1)`                            |
| Tab with `integerOnly` | blocked (no `Tab` case)                                   | allowed                                                           | allowed                                               |
| Touched state          | never marked touched                                      | n/a                                                               | n/a                                                   |
| `Delete` key           | falls into default branch                                 | falls into default branch                                         | explicit handler                                      |
| Per-cell form name     | `name` input on each cell                                 | `<name>_<index>`                                                  | none                                                  |
| PT keys                | `host`, `root`, `pcInputText`                             | `root`, `pcInputText`, `hooks`                                    | `root`, `input`, `hooks`                              |
| Structural CSS         | `@primeuix/styles/inputotp`                               | `@primeuix/styles/inputotp`                                       | none in `BaseInputOtp.js` (theme CSS only)            |
| Design tokens          | `inputotp` (`gap`, `input.*`)                             | `inputotp` (`gap`, `input.*`)                                     | N/A                                                   |
| Showcase               | Basic, Mask, Integer Only, Sizes, Template, Forms, Sample | Basic, Forms, Mask, Integer Only, Filled, Sizes, Template, Sample | Basic, Mask, Integer Only, Template, Sample           |

## 12. Sources

- PrimeNG: `primeng-21.1.9:packages/primeng/src/inputotp/inputotp.ts`, `primeng-21.1.9:packages/primeng/src/inputotp/public_api.ts`, `primeng-21.1.9:packages/primeng/src/inputotp/style/inputotpstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputotp/inputotp.types.ts`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primeng-21.1.9:apps/showcase/pages/inputotp/index.ts`
- PrimeNG docs: `primeng-21.1.9:apps/showcase/doc/inputotp/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/mask-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/integeronly-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/template-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/sample-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/accessibility-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputotp/pt/PTComponent.ts`
- PrimeVue: `primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.vue`, `primevue-4.5.5:packages/primevue/src/inputotp/BaseInputOtp.vue`, `primevue-4.5.5:packages/primevue/src/inputotp/InputOtp.d.ts`, `primevue-4.5.5:packages/primevue/src/inputotp/style/InputOtpStyle.js`, `primevue-4.5.5:packages/primevue/src/inputotp/style/InputOtpStyle.d.ts`, `primevue-4.5.5:packages/primevue/src/index.d.ts`, `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primevue-4.5.5:apps/showcase/pages/inputotp/index.vue`
- PrimeVue docs: `primevue-4.5.5:apps/showcase/doc/inputotp/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/MaskDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/IntegerOnlyDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/FilledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/TemplateDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/SampleDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/AccessibilityDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/pt/index.vue`, `primevue-4.5.5:apps/showcase/doc/inputotp/theming/index.vue`
- PrimeReact: `primereact-10.9.9:components/lib/inputotp/InputOtp.js`, `primereact-10.9.9:components/lib/inputotp/BaseInputOtp.js`, `primereact-10.9.9:components/lib/inputotp/inputotp.d.ts`, `primereact-10.9.9:components/lib/inputotp/package.json`, `primereact-10.9.9:components/lib/api/Locale.js`, `primereact-10.9.9:components/layout/menu.json`, `primereact-10.9.9:pages/inputotp/index.js`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`
- PrimeReact docs: `primereact-10.9.9:components/doc/inputotp/importdoc.js`, `primereact-10.9.9:components/doc/inputotp/basicdoc.js`, `primereact-10.9.9:components/doc/inputotp/maskdoc.js`, `primereact-10.9.9:components/doc/inputotp/integeronlydoc.js`, `primereact-10.9.9:components/doc/inputotp/templatedoc.js`, `primereact-10.9.9:components/doc/inputotp/sampledoc.js`, `primereact-10.9.9:components/doc/inputotp/accessibilitydoc.js`, `primereact-10.9.9:components/doc/inputotp/pt/wireframe.js`, `primereact-10.9.9:components/doc/inputotp/theming/styleddoc.js`, `primereact-10.9.9:components/doc/inputotp/theming/tailwinddoc.js`
- Shared: `@primeuix/styles-2.0.3:dist/inputotp/index.mjs`, `@primeuix/themes-2.0.3:types/inputotp/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputotp/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/inputotp/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/inputotp/index.mjs`, `@primeuix/themes-2.0.3:dist/material/inputotp/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
