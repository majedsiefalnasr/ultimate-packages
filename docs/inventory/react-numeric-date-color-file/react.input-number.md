# React UInputNumber

ID: react.input-number

Framework: react; availability: public

## Authored interpretation

Controlled numeric text input with locale-aware display formatting, parse-on-blur with min/max clamping, ArrowUp/ArrowDown stepping and optional increment/decrement buttons.

## Framework surface

UInputNumber is React.forwardRef<HTMLInputElement, UInputNumberProps>; among the four families in this inventory only input-number is a forwardRef. UInputNumberProps declares value (default null), onValueChange, min, max, step (1), mode (decimal | currency | percent), currency, locale, useGrouping (true), minFractionDigits, maxFractionDigits, prefix and suffix (both empty string), format (true), allowEmpty (true), showButtons (false), disabled, readOnly, invalid, fluid, name, id, placeholder, className and inputRef. UInputNumberValueChangeEvent carries originalEvent (React.SyntheticEvent) and value (number | null). The style module exports InputNumberClassesParams (invalid, fluid, focused) and inputNumberStyleModule; these two are not re-exported by index.ts.

Ref and state: a setRef callback assigns the forwarded ref and the inputRef prop to the same input element; an internal elementRef is assigned but never read. The value is controlled; local state is focused and rawText. The displayed text is rawText ?? String(value) while focused, otherwise the Intl.NumberFormat result (format=false shows String(value); prefix and suffix wrap the formatted text).

Callbacks: onFocus sets focused and copies String(value) into rawText. onChange only updates rawText and never calls onValueChange. onBlur always calls commit with rawText ?? "", so every blur emits onValueChange, including when the text is unchanged, and then clears focused and rawText. commit parses the text: a null parse emits null when allowEmpty is true, otherwise emits the clamp of 0 to min/max; any other parse emits the value clamped to min/max.

Parsing: parseValue strips prefix and suffix when present, trims, maps empty text to null, reads the group and decimal separators from formatToParts(1234.5) (fallback ',' and '.'), removes the group separator, replaces the decimal separator with '.', deletes every character outside digits, '.' and '-', then calls Number; NaN becomes null. Checked in plain Node: the focus text is String(value), which always uses '.', so in a locale whose group separator is '.' and decimal separator is ',' (checked for de, pt-BR, nl and tr) the focus text of 1234.5 parses to 12345 on blur, while en parses it as 1234.5 (es, fr, it and ru also parse it as 1234.5 because their group separator is not '.'). Non-ASCII digits are deleted. '-' or '.' alone parses to null. Repeated '-' or '.' characters are not guarded. With de and useGrouping false, '12,5' parses to 125 because the ',' fallback group separator is removed. In percent mode the formatter treats the value as a fraction (0.5 shows 50%, 50 shows 5,000%) and the parser never divides by 100, so percent mode does not scale typed text.

Formatting is unguarded: the Intl.NumberFormat is built inside useMemo during render, so mode currency without currency throws a TypeError ('Currency code is required with currency style.'), and an invalid locale, minFractionDigits greater than maxFractionDigits, or minFractionDigits of 200 throw a RangeError.

Stepping and keys: applyStep returns when disabled or readOnly, otherwise emits clamp((value ?? 0) + direction * step, min, max) with no floating-point rounding, no snapping to step multiples and no press-and-hold repeat. onKeyDown handles only key ArrowUp and ArrowDown, calls applyStep and always calls preventDefault inside the handler regardless of the disabled and readOnly props (a natively disabled input does not receive key events, a readOnly one does); Home, End, PageUp, PageDown and Enter are not handled. While focused the input shows rawText, which only typing changes: a step emitted by ArrowUp or ArrowDown (or a value prop changed from outside) does not update the displayed text, and the next blur commits the stale rawText, emitting the pre-step value again.

Markup and accessibility: root span with root, invalid, fluid and focused classes plus className; input type=text inputMode=decimal role=spinbutton with id, name, placeholder, disabled, readOnly, aria-invalid (invalid or undefined), aria-valuemin, aria-valuemax and aria-valuenow (value ?? undefined). There is no aria-valuetext and no aria-label prop. With showButtons, a buttonGroup span holds two type=button buttons with tabIndex -1, disabled when disabled or readOnly, aria-label Increment and Decrement, text + and -. Inline widget: no overlay, portal, imperative handle, useEffect or document listener.

Styles: root class string is u-inputnumber u-component u-inputnumber-buttons-stacked plus -invalid, -fluid and -focus modifiers; u-inputnumber-focus and the button-up and button-down class names have no CSS rule. Class keys: root, input, buttonGroup, incrementButton, decrementButton. This is the only family in the inventory whose CSS reads var(--u-inputtext-*) custom properties (background, border-color, border-radius, color, disabled-background, disabled-color, focus-border-color, hover-border-color, invalid-border-color, padding-x, padding-y). The component doc comment lists caret-position insert/delete, clipboard paste parsing, buttonLayout and roundingMode as not implemented. The component registers as componentName input-number while the Aura registry key is inputnumber.

## Public exports

@ultimate/react#UInputNumber
@ultimate/react/input-number#UInputNumber
@ultimate/react#UInputNumberProps
@ultimate/react/input-number#UInputNumberProps
@ultimate/react#UInputNumberValueChangeEvent
@ultimate/react/input-number#UInputNumberValueChangeEvent

## Owned source and evidence

packages/react/src/input-number/index.ts
packages/react/src/input-number/input-number.tsx
packages/react/src/input-number/input-number-style.ts

```text
packages/react/src/input-number/index.ts: export { UInputNumber } from
packages/react/src/input-number/input-number.tsx: export const UInputNumber = React.forwardRef<HTMLInputElement, UInputNumberProps>(
packages/react/src/input-number/input-number.tsx: onBlur
packages/react/src/input-number/input-number.tsx: const applyStep = React.useCallback(
packages/react/src/input-number/input-number.tsx: if (event.key === "ArrowUp") {
packages/react/src/input-number/input-number-style.ts: export const inputNumberStyleModule
packages/themes/src/presets/aura/index.ts: inputnumber: inputNumber,
packages/react/src/index.ts: export * from "./input-number";
packages/react/package.json: "./input-number": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.input-number → [react.input-number](react.input-number.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
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
    "behavior": "Bounded React product spec for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "e99d41249677496cf6c531576dd6e1c181544883",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
