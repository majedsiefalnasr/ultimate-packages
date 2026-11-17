# Vue UIconField and UInputIcon

ID: vue.icon-field

Framework: vue; availability: public

## Authored interpretation

Icon-adornment wrapper pair positioned by CSS around a slotted input.

## Framework surface

UIconField (IconField.vue) and UInputIcon (InputIcon.vue) with createBaseIconField (BaseIconField.ts) and createBaseInputIcon (BaseInputIcon.ts), plus iconFieldStyleModule and inputIconStyleModule (icon-field-style.ts). Base chain: createBaseComponent directly (componentName iconfield and input-icon); both declare no props and no emits, and there is no iconPosition prop. Template: UIconField is a root div rendering the default slot; UInputIcon is a root span with aria-hidden="true" rendering the default slot. Leading or trailing placement is resolved by .u-input-icon:first-child and :last-child CSS against DOM order, and the padding rules target only .u-input-text. inputIconStyleModule has an empty css string; the shared CSS lives in iconFieldStyleModule. The Aura registry key for this family is iconfield; there is no inputicon key.

## Public exports

@ultimate/vue#UIconField
@ultimate/vue/icon-field#UIconField
@ultimate/vue#createBaseIconField
@ultimate/vue/icon-field#createBaseIconField
@ultimate/vue#UInputIcon
@ultimate/vue/icon-field#UInputIcon
@ultimate/vue#createBaseInputIcon
@ultimate/vue/icon-field#createBaseInputIcon

## Owned source and evidence

packages/vue/src/icon-field/BaseIconField.ts
packages/vue/src/icon-field/BaseInputIcon.ts
packages/vue/src/icon-field/IconField.vue
packages/vue/src/icon-field/InputIcon.vue
packages/vue/src/icon-field/icon-field-style.ts
packages/vue/src/icon-field/index.ts

```text
packages/vue/src/icon-field/IconField.vue: name: "UIconField"
packages/vue/src/icon-field/InputIcon.vue: aria-hidden="true"
packages/vue/src/icon-field/icon-field-style.ts: export const iconFieldStyleModule
packages/vue/src/icon-field/icon-field-style.ts: export const inputIconStyleModule
packages/vue/src/icon-field/BaseIconField.ts: export function createBaseIconField
packages/vue/src/icon-field/BaseInputIcon.ts: export function createBaseInputIcon
packages/vue/src/index.ts: export * from "./icon-field";
packages/vue/package.json: "./icon-field": {
```

## Relationships

package.ultimate.vue.icon-field → [vue.icon-field](vue.icon-field.md) (reconciled family alias)
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
