# Vue UInputOtp

ID: vue.input-otp

Framework: vue; availability: public

## Authored interpretation

One-time-code entry rendering one native input per character with paste and arrow-key navigation.

## Framework surface

UInputOtp (InputOtp.vue, name "UInputOtp") and createBaseInputOtp (BaseInputOtp.ts) plus inputOtpStyleModule (input-otp-style.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. The inherited size prop is never read by the template. Declared props: readonly, tabindex, length (4), mask, integerOnly, disabled, invalid, name. Emits change ({ originalEvent, value }), focus and blur; keydown is not emitted. v-model writes the joined token string once per edit through writeValue. Template: a root div containing length native inputs (type password when mask, inputmode numeric when integerOnly) each carrying name and aria-invalid; no per-input aria-label is rendered. Typing moves focus to the next segment; Arrow keys and Backspace on an empty segment navigate; the keydown filter for integerOnly uses /^[0-9]$/ while handlePaste uses !isNaN(Number(pastedCode)), a looser check. onClick selects through an untracked setTimeout of 1 ms. Segment class u-input-otp-input only; the u-input-text class is not applied. Style module registered as inputotp.

## Public exports

@ultimate/vue#UInputOtp
@ultimate/vue/input-otp#UInputOtp
@ultimate/vue#createBaseInputOtp
@ultimate/vue/input-otp#createBaseInputOtp

## Owned source and evidence

packages/vue/src/input-otp/BaseInputOtp.ts
packages/vue/src/input-otp/InputOtp.vue
packages/vue/src/input-otp/index.ts
packages/vue/src/input-otp/input-otp-style.ts

```text
packages/vue/src/input-otp/InputOtp.vue: name: "UInputOtp"
packages/vue/src/input-otp/InputOtp.vue: /^[0-9]$/.test(event.key)
packages/vue/src/input-otp/InputOtp.vue: !isNaN(Number(pastedCode))
packages/vue/src/input-otp/InputOtp.vue: setTimeout(() => event.target.select(), 1)
packages/vue/src/input-otp/input-otp-style.ts: export const inputOtpStyleModule
packages/vue/src/input-otp/BaseInputOtp.ts: export function createBaseInputOtp
packages/vue/src/index.ts: export * from "./input-otp";
packages/vue/package.json: "./input-otp": {
```

## Relationships

package.ultimate.vue.input-otp → [vue.input-otp](vue.input-otp.md) (reconciled family alias)
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
    "behavior": "Bounded Vue product spec for the text-entry families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/input-text/ src/textarea/ src/input-mask/ src/input-otp/ src/password/ src/input-chips/ src/float-label/ src/ifta-label/ src/icon-field/ src/input-group/",
    "outcome": "not-run",
    "revision": "849ec35cc57b459cf1a6fb24f83b24d4beff559a",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
