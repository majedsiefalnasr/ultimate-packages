# KeyFilter

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

KeyFilter restricts what a user can type into a text field, either with a named preset (positive integer, money, hex, email, alphanumeric, …) or with a custom regular expression. By default it blocks individual keystrokes and pasted text that do not match; in "validate only" mode it lets everything through and instead validates the whole value. PrimeNG and PrimeVue ship it as a directive; PrimeReact ships it as a utility object built into InputText, InputTextarea and Chips via a `keyfilter` prop.

## 2. Names & status

- Canonical name: **KeyFilter** (file `keyfilter`).
- PrimeNG: `KeyFilter` directive, selector `[pKeyFilter]`; stable.
- PrimeVue: `KeyFilter` directive, used as `v-keyfilter`; stable.
- PrimeReact: `KeyFilter` utility object (`primereact/keyfilter`) plus the `KeyFilterType` type; consumed through the `keyfilter` prop; stable. The PrimeReact showcase page still has its own "KeyFilter" entry but demonstrates it on InputText.

## 3. Per framework

### PrimeNG 21.1.9

- Import: `KeyFilterModule` (or standalone `KeyFilter`) from `primeng/keyfilter` (`primeng-21.1.9:apps/showcase/doc/keyfilter/import-doc.ts`).
- Selector: `[pKeyFilter]` on an input; provides `NG_VALIDATORS` (`KEYFILTER_VALIDATOR`) so it doubles as an Angular validator.
- Source: `primeng-21.1.9:packages/primeng/src/keyfilter/keyfilter.ts` (no `style/` folder and no PT types).

### PrimeVue 4.5.5

- Import: `import KeyFilter from 'primevue/keyfilter'`, register as `app.directive('keyfilter', KeyFilter)` (`primevue-4.5.5:apps/showcase/doc/keyfilter/ImportDoc.vue`).
- Usage: `v-keyfilter.int`, `v-keyfilter="/regex/"` or `v-keyfilter="{ pattern, validateOnly }"`.
- Source: `primevue-4.5.5:packages/primevue/src/keyfilter/KeyFilter.js`, `primevue-4.5.5:packages/primevue/src/keyfilter/BaseKeyFilter.js` (extends `@primevue/core/basedirective`), types `primevue-4.5.5:packages/primevue/src/keyfilter/KeyFilter.d.ts`, style `primevue-4.5.5:packages/primevue/src/keyfilter/style/KeyFilterStyle.js` (name `keyfilter-directive`, no CSS).
- Only acts when the bound element is a PrimeVue InputText or Textarea (`data-pc-name` check in `getTarget`).

### PrimeReact 10.9.9

- Import: none needed for typical use — pass `keyfilter` to `InputText` (`primereact-10.9.9:components/doc/keyfilter/importdoc.js`). The object itself is exported from `primereact/keyfilter`.
- Source: `primereact-10.9.9:components/lib/keyfilter/KeyFilter.js`, type `primereact-10.9.9:components/lib/keyfilter/keyfilteroptions.d.ts`.
- Consumers: `primereact-10.9.9:components/lib/inputtext/InputText.js`, `primereact-10.9.9:components/lib/inputtextarea/InputTextarea.js`, `primereact-10.9.9:components/lib/chips/Chips.js`.

## 4. Anatomy

N/A — KeyFilter renders nothing; it attaches `keypress`/`beforeinput`, `paste` and `input` handlers to an existing field.

## 5. API highlights

- Presets (all three): `pint`, `int`, `pnum`, `money`, `num`, `hex`, `email`, `alpha`, `alphanum`.
- PrimeNG: `@Input('pKeyFilter') pattern: RegExp | KeyFilterPattern`; `@Input() pValidateOnly: boolean`; `@Output() ngModelChange`. With `pValidateOnly` the `validate()` method returns `{ validatePattern: false }` when the whole value fails the regex. Presets are whole-value regexes (e.g. `pint: /^[\d]*$/`).
- PrimeVue: directive value `RegExp` or `KeyFilterOptions { pattern?: RegExp; validateOnly?: boolean }`; preset chosen by modifier (`KeyFilterModifiers`: `pint`, `int`, `pnum`, `money`, `num`, `hex`, `email`, `alpha`, `alphanum`). Presets are single-character regexes (e.g. `pint: /[\d]/`). PT via `KeyFilterDirectivePassThroughOptions`.
- PrimeReact: `keyfilter?: KeyFilterType` (`'pint' | 'int' | 'pnum' | 'money' | 'num' | 'hex' | 'email' | 'alpha' | 'alphanum' | RegExp`) and `validateOnly?: boolean` on the host component; `onInput(event, validatePattern)` reports the whole-value check. Utility methods `KeyFilter.onKeyPress`, `onBeforeInput`, `onPaste`, `validate`, `getRegex` on the exported object.
- Note: PrimeReact's `alphanum` mask is case-insensitive (`/[a-z0-9_]/i`) while PrimeVue's is not (`/[a-z0-9_]/`).

## 6. Usage guidance

- Use presets for common numeric/alpha restrictions (`primeng-21.1.9:apps/showcase/doc/keyfilter/presets-doc.ts`, `primevue-4.5.5:apps/showcase/doc/keyfilter/PresetsDoc.vue`, `primereact-10.9.9:components/doc/keyfilter/presetsdoc.js`).
- Use a regex to block single keystrokes that don't match (`primeng-21.1.9:apps/showcase/doc/keyfilter/regex-doc.ts`, `primevue-4.5.5:apps/showcase/doc/keyfilter/RegexDoc.vue`, `primereact-10.9.9:components/doc/keyfilter/regexdoc.js`).
- Use `validateOnly` to validate the entire word instead of blocking keys (`primevue-4.5.5:apps/showcase/doc/keyfilter/RegexWordDoc.vue`, `primereact-10.9.9:components/doc/keyfilter/regexworddoc.js`); PrimeNG supports `pValidateOnly` in source but has no showcase section for it.
- The PrimeNG page description advises InputNumber or InputMask when the whole value (not keystrokes) must be constrained (`primeng-21.1.9:apps/showcase/pages/keyfilter/index.ts`).
- No services required.

## 7. Accessibility

- No accessibility features of its own; follow the host field's guidance (InputText) (`primeng-21.1.9:apps/showcase/doc/keyfilter/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/keyfilter/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/keyfilter/accessibilitydoc.js`).
- Silently swallowing keystrokes gives no feedback to assistive technology; pair restrictive filters with visible help text.

## 8. Theming

N/A — no CSS, no design tokens and no `@primeuix/styles` module for keyfilter (`@primeuix/styles-2.0.3:dist/` has no `keyfilter` folder; PrimeVue's `KeyFilterStyle.js` is name-only). PrimeVue exposes a directive PT (`KeyFilterDirectivePassThroughOptions`, `root`); PrimeNG has none.

## 9. Relationships

- Hosted by: [InputText](inputtext.md) (all), Textarea (PrimeVue target, PrimeReact InputTextarea), [Chips](chips.md) (PrimeReact `keyfilter` prop).
- Alternatives for whole-value formatting: [InputNumber](inputnumber.md), [InputMask](inputmask.md).

## 10. Dependencies

- PrimeNG: `@angular/forms` (`NG_VALIDATORS`, `Validator`), `@primeuix/utils` (DOM helpers).
- PrimeVue: `@primevue/core/basedirective`, `@primeuix/utils/dom`.
- PrimeReact: `DomHandler` utilities.
- No external npm dependency.

## 11. Framework differences

| Aspect         | PrimeNG                             | PrimeVue                           | PrimeReact                           |
| -------------- | ----------------------------------- | ---------------------------------- | ------------------------------------ |
| Form           | directive `[pKeyFilter]`            | directive `v-keyfilter`            | utility object + `keyfilter` prop    |
| Preset syntax  | `pKeyFilter="int"`                  | modifier `v-keyfilter.int`         | `keyfilter="int"`                    |
| Preset regexes | whole-value (`^…*$`)                | single-char                        | single-char                          |
| Validate-only  | `pValidateOnly` + Angular validator | `{ validateOnly: true }`           | `validateOnly` + `onInput(e, valid)` |
| Allowed hosts  | any input                           | PrimeVue InputText / Textarea only | InputText, InputTextarea, Chips      |
| PT             | none                                | directive PT `root`                | none                                 |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/keyfilter/keyfilter.ts`
- `primeng-21.1.9:apps/showcase/doc/keyfilter/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/keyfilter/presets-doc.ts`, `primeng-21.1.9:apps/showcase/doc/keyfilter/regex-doc.ts`, `primeng-21.1.9:apps/showcase/doc/keyfilter/accessibility-doc.ts`, `primeng-21.1.9:apps/showcase/pages/keyfilter/index.ts`
- `primevue-4.5.5:packages/primevue/src/keyfilter/KeyFilter.js`, `primevue-4.5.5:packages/primevue/src/keyfilter/BaseKeyFilter.js`, `primevue-4.5.5:packages/primevue/src/keyfilter/KeyFilter.d.ts`, `primevue-4.5.5:packages/primevue/src/keyfilter/style/KeyFilterStyle.js`
- `primevue-4.5.5:apps/showcase/doc/keyfilter/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/keyfilter/PresetsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/keyfilter/RegexDoc.vue`, `primevue-4.5.5:apps/showcase/doc/keyfilter/RegexWordDoc.vue`, `primevue-4.5.5:apps/showcase/doc/keyfilter/AccessibilityDoc.vue`
- `primereact-10.9.9:components/lib/keyfilter/KeyFilter.js`, `primereact-10.9.9:components/lib/keyfilter/keyfilteroptions.d.ts`, `primereact-10.9.9:components/lib/inputtext/InputText.js`, `primereact-10.9.9:components/lib/inputtextarea/InputTextarea.js`, `primereact-10.9.9:components/lib/chips/Chips.js`
- `primereact-10.9.9:components/doc/keyfilter/importdoc.js`, `primereact-10.9.9:components/doc/keyfilter/presetsdoc.js`, `primereact-10.9.9:components/doc/keyfilter/regexdoc.js`, `primereact-10.9.9:components/doc/keyfilter/regexworddoc.js`, `primereact-10.9.9:components/doc/keyfilter/accessibilitydoc.js`
