# Vue UInputNumber

ID: vue.input-number

Framework: vue; availability: public

## Authored interpretation

Numeric text input with Intl.NumberFormat display, min/max/step clamping and ArrowUp/ArrowDown stepping.

## Framework surface

UInputNumber (Options API SFC InputNumber.vue, name "UInputNumber") and createBaseInputNumber (BaseInputNumber.ts) plus inputNumberStyleModule and InputNumberClassesParams (input-number-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseInputNumber extends createBaseInput() (size, fluid, variant, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, filled, writeValue); because createBaseInput takes no arguments the factory shadows cx() and mounted(); mounted registers the style under the name inputnumber, which is also the Aura registry key, and is the only scoped base that passes additional preset keys (["inputtext"]) to registerComponentStyle. Declared props: locale, mode ("decimal", "currency" or "percent" are the only values the formatter maps; any other string behaves as decimal), currency, useGrouping (true), minFractionDigits, maxFractionDigits, min (null), max (null), step (1), allowEmpty (true), prefix, suffix, placeholder, readonly, disabled, invalid, name, plus inherited size, fluid, variant, modelValue and defaultValue. There is no inputId or aria-label prop, no showButtons or spin buttons, no slots and no v-model/defineModel declaration. Emits declared: focus, blur, input. focus and blur forward the native event; input carries { originalEvent, value } with the clamped value and is emitted by commit(), i.e. on every native input event and every ArrowUp/ArrowDown step; the native input event itself is not forwarded. update:modelValue and value-change come from writeValue(value, event) in commit(). Template: span root and one input type=text inputmode=decimal role="spinbutton" with aria-valuemin, aria-valuemax, aria-valuenow (numericValue ?? undefined) and aria-invalid (invalid || undefined); ref="input" is declared and never read ($refs is not used in this component). No UPortal, no overlay. Formatting: the formatter computed builds new Intl.NumberFormat(locale, { useGrouping, minimumFractionDigits, maximumFractionDigits, style }) with currency (currency ?? "USD") only in currency mode; construction can throw during render (RangeError, for example minFractionDigits 5 with maxFractionDigits 2, an invalid locale tag or an invalid currency code); the TypeError that Intl raises for a currency style without a code cannot occur here because currency falls back to "USD". displayValue returns rawText while focused, "" for null or NaN, otherwise prefix + formatted + suffix. Note that percent mode does not scale: percent mode formats the stored number with style percent, so 0.5 shows 50% and 50 shows 5,000%, and parsing 50 stores 50. State: focused, rawText. On focus rawText becomes String(numericValue) ("" when null or NaN); while focused the shown text is rawText, so an external modelValue change while focused does not change the shown text (only typing or a step updates rawText). Parsing (parseValue): strips a leading prefix and trailing suffix, removes the group separator and maps the decimal separator to "." from formatter.formatToParts(1234.5) (fallbacks "," and "."), then removes everything outside [0-9.-]; "" and "-" give null, NaN gives null. Locale fact computed with Intl in plain Node: with useGrouping true (the prop default; the formatter receives the boolean true, which always emits a group, so es, it and sl report "." even though Intl's default 'auto' grouping with CLDR minimumGroupingDigits 2 prints 1234.5 as 1234,5), a locale whose formatToParts(1234.5) group is "." and decimal is "," (de, pt, pt-BR, nl, tr, es, es-AR, it, sl, da, ro, hr, el, id, vi, sr, ca, gl, eu and is among those tested) turns the focus text "1234.5" into 12345 and typed "1234.56" into 123456, because "." is removed as the group separator; locales whose group is not "." (en, fr, pl, ru and pt-PT among those tested) parse the focus text correctly. When useGrouping is false the formatter has no group part, the fallback group "," is stripped, and a typed decimal comma in any locale with decimal "," (de, fr, es, pt, it, pl, ru among those tested) is removed: "1,5" becomes 15. Exponent text: String(1e21) is "1e+21", which parses to 121 (the "e" and "+" are removed); String(1e-7) is "1e-7", which parses to null. Non-ASCII digits and a non-ASCII minus (such as the sv U+2212) are dropped by the same regex. Commit logic: clamp(min, max); null with allowEmpty false writes min ?? 0 to the model but still emits input with value null. onInput commits on every keystroke (a partial entry such as "-" writes null). Note that blur does not commit: onBlur only clears focused and emits blur, so no clamp or reformat is written on blur. Keyboard: onKeyDown returns early for readonly or disabled; ArrowUp/ArrowDown call preventDefault and spin(event, ±step); no Home, End, PageUp, PageDown or Enter. spin uses numericValue ?? 0 + delta clamped, with no rounding to fraction digits (0.1 + 0.2 is 0.30000000000000004), and a NaN numericValue stays NaN. onPaste only calls preventDefault for readonly or disabled; otherwise the browser pastes and the input event path runs. Model: when only defaultValue is passed (controlled is false) writeValue emits value-change only and never updates dValue, so the text after blur keeps showing the initial defaultValue instead of later input. Unused: the inherited size and variant props are never read; filled is never passed to a class resolver (InputNumberClassesParams.filled is declared and unused); invalid is applied through inputParams as p-invalid. Styles (input-number-style.ts, hand-ported, no @ultimate/uix-styles import, only a mention in a comment): classes root (u-input-number, u-input-number-fluid) and input (u-input-number-input, p-invalid); CSS tokens are dt('inputtext.…') (15 uses), the spin-button rules are intentionally excluded, no z-index and no overlay. Theme: Aura registry key inputnumber (value inputNumber), differing from the family name input-number. No component-metadata record exists. input-number.spec.ts and input-number.stories.ts are excluded supporting files. Composes no UPortal: no UPortal in this component.

## Public exports

@ultimate/vue#UInputNumber
@ultimate/vue/input-number#UInputNumber
@ultimate/vue#createBaseInputNumber
@ultimate/vue/input-number#createBaseInputNumber

## Owned source and evidence

packages/vue/src/input-number/BaseInputNumber.ts
packages/vue/src/input-number/InputNumber.vue
packages/vue/src/input-number/index.ts
packages/vue/src/input-number/input-number-style.ts

```text
packages/vue/src/input-number/InputNumber.vue: name: "UInputNumber",
packages/vue/src/input-number/InputNumber.vue: emits: ["focus", "blur", "input"],
packages/vue/src/input-number/InputNumber.vue: this.$emit("input", { originalEvent: event, value: clamped });
packages/vue/src/input-number/InputNumber.vue: const parts = this.formatter.formatToParts(1234.5);
packages/vue/src/input-number/InputNumber.vue: ref="input"
packages/vue/src/input-number/BaseInputNumber.ts: extends: createBaseInput(),
packages/vue/src/input-number/BaseInputNumber.ts: registerComponentStyle("inputnumber", inputNumberStyleModule, ["inputtext"]);
packages/vue/src/input-number/input-number-style.ts: export const inputNumberStyleModule
packages/vue/src/input-number/index.ts: createBaseInputNumber
packages/vue/src/index.ts: export * from "./input-number";
packages/vue/package.json: "./input-number": {
```

## Relationships

package.ultimate.vue.input-number → [vue.input-number](vue.input-number.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Vue product spec for the numeric, date, color and file families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "3143b1f248e72addb28087e65a31014466c5969d",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); no product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
