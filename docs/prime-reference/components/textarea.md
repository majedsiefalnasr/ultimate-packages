# Textarea

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Textarea styles a native multi-line `textarea` element and optionally grows its height with the content (`autoResize`) instead of showing a scrollbar. PrimeNG ships it as an attribute directive, PrimeVue as a component that renders the `textarea` itself, and PrimeReact under the name **InputTextarea**, which also integrates KeyFilter and Tooltip.

## 2. Names & status

- Canonical name: **Textarea** (PrimeNG, PrimeVue); PrimeReact name: **InputTextarea**. No component is deprecated (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- PrimeNG directive selector is `[pTextarea], [pInputTextarea]`; the second (older) attribute is still accepted by the selector but no showcase doc uses it (`primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`).
- PrimeNG and PrimeVue have no `inputtextarea` source folder; PrimeReact has no `textarea` folder (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`).
- Listed in the Form group of each showcase menu.

## 3. Per framework

| Aspect         | PrimeNG                                                          | PrimeVue                                                          | PrimeReact                                                              |
| -------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Import         | `import { TextareaModule } from 'primeng/textarea'`              | `import Textarea from 'primevue/textarea'`                        | `import { InputTextarea } from 'primereact/inputtextarea'`              |
| Selector / tag | `<textarea pTextarea>` (directive)                               | `<Textarea />`                                                    | `<InputTextarea />`                                                     |
| Source         | `packages/primeng/src/textarea/textarea.ts`                      | `packages/primevue/src/textarea/Textarea.vue`, `BaseTextarea.vue` | `components/lib/inputtextarea/InputTextarea.js`, `InputTextareaBase.js` |
| Exports        | `Textarea`, `TextareaModule`, `TextareaStyle`, `TextareaClasses` | `Textarea` (default), `TextareaStyle`                             | `InputTextarea`                                                         |
| Base class     | `BaseModelHolder<TextareaPassThrough>` (standalone directive)    | `BaseInput` (via `BaseTextarea`)                                  | `ComponentBase.extend` (`InputTextareaBase`)                            |

Sources: `primeng-21.1.9:packages/primeng/src/textarea/public_api.ts`, `primeng-21.1.9:apps/showcase/doc/textarea/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/textarea/package.json`, `primereact-10.9.9:components/doc/inputtextarea/importdoc.js`, `primereact-10.9.9:components/lib/inputtextarea/package.json`.

## 4. Anatomy

| Part    | Element              | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                                            |
| ------- | -------------------- | -------------- | --------------- | ----------------- | -------------------------------------------------------------------------------- |
| Root    | `textarea` (native)  | `host`, `root` | `root`          | `root`            | NG/Vue `p-textarea p-component`; React `p-inputtextarea p-inputtext p-component` |
| Tooltip | PrimeReact `Tooltip` | —              | —               | `tooltip`         | —                                                                                |

There are no inner parts: every framework styles a single native element (`primeng-21.1.9:packages/primeng/src/types/textarea/textarea.types.ts`, `primevue-4.5.5:packages/primevue/src/textarea/Textarea.d.ts`, `primereact-10.9.9:components/lib/inputtextarea/inputtextarea.d.ts`).

## 5. API highlights

| Member        | PrimeNG                                                                                | PrimeVue                                         | PrimeReact                                                                |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| Value         | native `value` / `ngModel` / `formControlName`                                         | `v-model` (`modelValue`), `defaultValue`, `name` | native `value` / `defaultValue` + `onChange`                              |
| Auto resize   | `autoResize` (`@Input`, boolean)                                                       | `autoResize: Boolean`                            | `autoResize = false`                                                      |
| Resize event  | `onResize: EventEmitter<Event \| {}>`                                                  | —                                                | —                                                                         |
| Size          | `pSize: 'large' \| 'small'`                                                            | `size: 'small' \| 'large'`                       | —                                                                         |
| Variant       | `variant: 'filled' \| 'outlined'` (falls back to config `inputStyle` / `inputVariant`) | `variant: 'outlined' \| 'filled'`                | `variant: 'outlined' \| 'filled'` (default `null` → context `inputStyle`) |
| Invalid       | `invalid` (input signal)                                                               | `invalid`                                        | `invalid = false`                                                         |
| Fluid         | `fluid` (or a parent `Fluid` component)                                                | `fluid`                                          | — (only legacy `.p-fluid` CSS)                                            |
| Key filtering | separate `pKeyFilter` directive                                                        | —                                                | built-in `keyfilter`, `validateOnly = false`                              |
| Tooltip       | —                                                                                      | —                                                | `tooltip`, `tooltipOptions`                                               |
| Emits         | —                                                                                      | `update:modelValue`, `value-change`              | native events (`onInput`, `onKeyDown`, `onPaste`, …)                      |
| Forms         | Angular forms through the native element                                               | `formControl` (PrimeVue Forms)                   | —                                                                         |
| PT / unstyled | `pTextareaPT`, `pTextareaUnstyled`                                                     | `pt`, `ptOptions`, `unstyled`, `dt`              | `pt`, `ptOptions`, `unstyled`                                             |

- Auto-resize algorithms differ. PrimeNG sets `height: auto` then `scrollHeight` on input, after view checks and on form value changes, and switches to `overflow-y: scroll` once `max-height` is reached. PrimeVue observes the element with a `ResizeObserver` plus input/updated hooks, and does not cap at `max-height`. PrimeReact resizes on focus, blur, keyup, input and `value` changes, caches the last `scrollHeight`, and caps at `max-height` like PrimeNG (`primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`, `primevue-4.5.5:packages/primevue/src/textarea/Textarea.vue`, `primereact-10.9.9:components/lib/inputtextarea/InputTextarea.js`).
- PrimeNG Textarea is not a `ControlValueAccessor`: Angular's built-in accessor binds the native element and the directive only tracks the value for the `p-filled` class (`primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`).
- PrimeReact `InputTextareaProps` extends `TextareaHTMLAttributes`; defaults from `InputTextareaBase.defaultProps` (`primereact-10.9.9:components/lib/inputtextarea/InputTextareaBase.js`).
- Full API: catalog modules `textarea` (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`) and `inputtextarea` (`docs/prime-reference/catalog/primereact.json`).

## 6. Usage guidance

- **Basic** — bind the value with `ngModel`, `v-model` or `value` + `onChange`; demos pass native `rows` / `cols` (`primeng-21.1.9:apps/showcase/doc/textarea/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/BasicDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/basicdoc.js`).
- **Auto Resize** — `autoResize` grows the field instead of scrolling (`primeng-21.1.9:apps/showcase/doc/textarea/autoresize-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/AutoResizeDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/autoresizedoc.js`).
- **Filled** — `variant="filled"` for higher emphasis (`primeng-21.1.9:apps/showcase/doc/textarea/filled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/FilledDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/filleddoc.js`).
- **Float Label / Ifta Label** — wrap with FloatLabel or IftaLabel; demos set `resize: none` (`primeng-21.1.9:apps/showcase/doc/textarea/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/textarea/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/textarea/IftaLabelDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/floatlabeldoc.js`). PrimeReact has no IftaLabel demo.
- **Sizes** — small and large alternatives (NG `pSize`, Vue `size`); not available in PrimeReact (`primeng-21.1.9:apps/showcase/doc/textarea/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/SizesDoc.vue`).
- **Fluid** — full container width (`primeng-21.1.9:apps/showcase/doc/textarea/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/FluidDoc.vue`).
- **Key Filter** — PrimeNG combines with the `pKeyFilter` directive (its doc text still says "InputText"); PrimeReact uses the built-in `keyfilter` prop; PrimeVue has no demo (`primeng-21.1.9:apps/showcase/doc/textarea/keyfilter-doc.ts`, `primereact-10.9.9:components/doc/inputtextarea/keyfilterdoc.js`).
- **Invalid** — `invalid` shows failed validation (`primeng-21.1.9:apps/showcase/doc/textarea/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/InvalidDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/invaliddoc.js`).
- **Disabled** — native `disabled` (`primeng-21.1.9:apps/showcase/doc/textarea/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/DisabledDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/disableddoc.js`).
- **Forms** — PrimeNG reactive and template-driven forms; PrimeVue Forms library (`primeng-21.1.9:apps/showcase/doc/textarea/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/textarea/templatedrivenforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/FormsDoc.vue`).
- **Style** — PrimeReact class list (`primereact-10.9.9:components/doc/inputtextarea/styledoc.js`).

## 7. Accessibility

- All three render a native `textarea`, so every passed attribute applies directly; label it with `<label for>` + `id`, `aria-labelledby` or `aria-label`. Keyboard: Tab moves focus to the field; no custom keys (`primeng-21.1.9:apps/showcase/doc/textarea/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/textarea/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inputtextarea/accessibilitydoc.js`).
- PrimeVue sets `aria-invalid` when `invalid` is true; PrimeNG and PrimeReact only add the `p-invalid` class, so `aria-invalid` must be set by the consumer (`primevue-4.5.5:packages/primevue/src/textarea/Textarea.vue`, `primeng-21.1.9:packages/primeng/src/textarea/style/textareastyle.ts`, `primereact-10.9.9:components/lib/inputtextarea/InputTextareaBase.js`).

## 8. Theming

- PrimeNG classes (`TextareaClasses.root = 'p-textarea'`; dynamic): `p-textarea p-component`, `p-filled`, `p-textarea-resizable`, `p-variant-filled`, `p-textarea-fluid`, `p-inputfield-sm p-textarea-sm`, `p-textarea-lg p-inputfield-lg`, `p-invalid`. PrimeNG adds rules for `.p-textarea.ng-invalid.ng-dirty` (border and placeholder) (`primeng-21.1.9:packages/primeng/src/textarea/style/textareastyle.ts`).
- PrimeVue classes: the same set from `TextareaStyle` (`primevue-4.5.5:packages/primevue/src/textarea/style/TextareaStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/textarea/index.mjs` (shared by NG and Vue) — includes `.p-textarea-resizable { overflow: hidden; resize: none }` and the sm/lg sizes.
- Tokens: `textarea.root` — `background`, `disabledBackground`, `filledBackground`, `filledHoverBackground`, `filledFocusBackground`, `borderColor`, `hoverBorderColor`, `focusBorderColor`, `invalidBorderColor`, `color`, `disabledColor`, `placeholderColor`, `invalidPlaceholderColor`, `shadow`, `paddingX`, `paddingY`, `borderRadius`, `focusRing.{width,style,color,offset,shadow}`, `transitionDuration`, `sm.{fontSize,paddingX,paddingY}`, `lg.{fontSize,paddingX,paddingY}` (`@primeuix/themes-2.0.3:types/textarea/index.d.ts`).
- PrimeReact: classes `p-inputtextarea p-inputtext p-component`, `p-disabled`, `p-filled`, `p-inputtextarea-resizable`, `p-invalid`, `p-variant-filled`; own `css.styles` with `.p-inputtextarea-resizable` and `.p-fluid .p-inputtextarea { width: 100% }`; the `p-inputtext` class reuses InputText theme styling; `p-filled` is toggled on input directly in the DOM. Design tokens N/A (`primereact-10.9.9:components/lib/inputtextarea/InputTextareaBase.js`, `primereact-10.9.9:components/lib/inputtextarea/InputTextarea.js`, `primereact-10.9.9:components/doc/inputtextarea/theming/styleddoc.js`).
- PT: NG `host`, `root`; Vue `root`, `hooks`; React `root`, `tooltip`, `hooks`. React global PT key `inputtextarea` and Tailwind preset entry `inputtextarea` (`primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`).

## 9. Relationships

- Sibling of InputText (single line); PrimeReact InputTextarea even carries the `p-inputtext` class.
- Composes with FloatLabel, IftaLabel, Fluid (NG/Vue) and KeyFilter (NG directive, React built-in).
- Embedded by PrimeReact Mention, which renders an InputTextarea (see `mention.md`).
- Alias chain: PrimeReact `InputTextarea` ↔ PrimeNG/PrimeVue `Textarea`; PrimeNG `[pInputTextarea]` selector alias.

## 10. Dependencies

- PrimeNG: `primeng/basemodelholder`, `primeng/bind`, `primeng/fluid`, `primeng/base`, `@angular/forms` (`NgControl`), `@primeuix/styles/textarea` (`primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`).
- PrimeVue: `@primevue/core/baseinput`, `@primeuix/styles/textarea`, `@primeuix/utils` (`cn`) (`primevue-4.5.5:packages/primevue/src/textarea/BaseTextarea.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../keyfilter/KeyFilter`, `../tooltip/Tooltip`, `../utils/Utils` (`primereact-10.9.9:components/lib/inputtextarea/InputTextarea.js`).

## 11. Framework differences

| Aspect              | PrimeNG                                | PrimeVue                               | PrimeReact                       |
| ------------------- | -------------------------------------- | -------------------------------------- | -------------------------------- |
| Name                | Textarea                               | Textarea                               | InputTextarea                    |
| Form                | attribute directive on native element  | component rendering `textarea`         | component rendering `textarea`   |
| Auto-resize trigger | input, view checks, form value changes | ResizeObserver, input, updates         | focus, blur, keyup, input, value |
| `max-height` cap    | yes                                    | no                                     | yes                              |
| Sizes               | `pSize`                                | `size`                                 | —                                |
| Fluid               | `fluid` / `Fluid` parent               | `fluid`                                | `.p-fluid` CSS only              |
| Key filter          | `pKeyFilter` directive                 | —                                      | `keyfilter` prop                 |
| `aria-invalid`      | not set                                | set from `invalid`                     | not set                          |
| Theming             | `@primeuix/styles` + `textarea` tokens | `@primeuix/styles` + `textarea` tokens | own CSS, tokens N/A              |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`
- `primeng-21.1.9:packages/primeng/src/textarea/style/textareastyle.ts`
- `primeng-21.1.9:packages/primeng/src/textarea/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/textarea/textarea.types.ts`
- `primeng-21.1.9:apps/showcase/doc/textarea/` (`import-doc.ts`, `basic-doc.ts`, `autoresize-doc.ts`, `filled-doc.ts`, `floatlabel-doc.ts`, `iftalabel-doc.ts`, `sizes-doc.ts`, `fluid-doc.ts`, `keyfilter-doc.ts`, `invalid-doc.ts`, `disabled-doc.ts`, `reactiveforms-doc.ts`, `templatedrivenforms-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/textarea/Textarea.vue`
- `primevue-4.5.5:packages/primevue/src/textarea/BaseTextarea.vue`
- `primevue-4.5.5:packages/primevue/src/textarea/Textarea.d.ts`
- `primevue-4.5.5:packages/primevue/src/textarea/style/TextareaStyle.js`
- `primevue-4.5.5:packages/primevue/src/textarea/package.json`
- `primevue-4.5.5:apps/showcase/doc/textarea/` (`ImportDoc.vue`, `BasicDoc.vue`, `AutoResizeDoc.vue`, `FilledDoc.vue`, `FloatLabelDoc.vue`, `IftaLabelDoc.vue`, `SizesDoc.vue`, `FluidDoc.vue`, `InvalidDoc.vue`, `DisabledDoc.vue`, `FormsDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/inputtextarea/InputTextarea.js`
- `primereact-10.9.9:components/lib/inputtextarea/InputTextareaBase.js`
- `primereact-10.9.9:components/lib/inputtextarea/inputtextarea.d.ts`
- `primereact-10.9.9:components/lib/inputtextarea/package.json`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/inputtextarea/` (`importdoc.js`, `basicdoc.js`, `autoresizedoc.js`, `filleddoc.js`, `floatlabeldoc.js`, `keyfilterdoc.js`, `invaliddoc.js`, `disableddoc.js`, `styledoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/textarea/index.mjs`
- `@primeuix/themes-2.0.3:types/textarea/index.d.ts`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
