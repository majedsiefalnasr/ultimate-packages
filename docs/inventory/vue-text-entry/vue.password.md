# Vue UPassword

ID: vue.password

Framework: vue; availability: public

## Authored interpretation

Password input with strength feedback overlay and optional visibility toggle.

## Framework surface

UPassword (Password.vue, name "UPassword") and createBasePassword (BasePassword.ts) plus passwordStyleModule and PasswordClassesParams (password-style.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. The inherited size prop is never read by the template. Declared props: feedback (true), toggleMask, promptLabel, weakLabel, mediumLabel, strongLabel, mediumRegex, strongRegex, placeholder, disabled, inputId, ariaLabel, ariaLabelledby, appendTo ("body"). It declares no invalid or name prop and the template renders no aria-invalid. Emits change (the native event, not a { originalEvent, value } object), focus and blur; v-model through writeValue. Template: root div (cx root with filled, fluid, disabled, so p-filled is applied), input, optional toggle svg icons with role="button" and aria-label but only an @click handler (no tabindex or key handler), an overlay with role="dialog" rendered through Portal (UPortal from vue-core overlay) when feedback is on and the overlay is visible, and an always-rendered u-hidden-accessible aria-live span. Strength: strongRegex 3, mediumRegex 2, otherwise 1; Escape is detected on keyup via event.code. The clearIcon class is defined in the style module but no template uses it. The root also emits u-component. Style module registered as password.

## Public exports

@ultimate/vue#UPassword
@ultimate/vue/password#UPassword
@ultimate/vue#createBasePassword
@ultimate/vue/password#createBasePassword

## Owned source and evidence

packages/vue/src/password/BasePassword.ts
packages/vue/src/password/Password.vue
packages/vue/src/password/index.ts
packages/vue/src/password/password-style.ts

```text
packages/vue/src/password/Password.vue: name: "UPassword"
packages/vue/src/password/Password.vue: role="button"
packages/vue/src/password/Password.vue: event.code === "Escape"
packages/vue/src/password/Password.vue: this.$emit("change", event);
packages/vue/src/password/password-style.ts: export const passwordStyleModule
packages/vue/src/password/password-style.ts: clearIcon:
packages/vue/src/password/BasePassword.ts: export function createBasePassword
packages/vue/src/index.ts: export * from "./password";
packages/vue/package.json: "./password": {
```

## Relationships

package.ultimate.vue.password → [vue.password](vue.password.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)

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
