# Vue UFloatLabel

ID: vue.float-label

Framework: vue; availability: public

## Authored interpretation

Label wrapper that floats a slotted label by CSS :has selectors.

## Framework surface

UFloatLabel (FloatLabel.vue, name "UFloatLabel") and createBaseFloatLabel (BaseFloatLabel.ts) plus floatLabelStyleModule (float-label-style.ts). Base chain: createBaseComponent directly, componentName floatlabel, no v-model. Declared prop: variant (String, default "over"; in, over and on are styled but the value is not validated). No emits. Template: a root span rendering the default slot, class cx('root', { variant }). The float behavior is pure CSS :has() with no JavaScript focus or value tracking. The filled and invalid selectors target input.u-filled, textarea.u-filled, .u-inputwrapper-focus, .u-inputwrapper-filled and .u-invalid, but UInputText and UTextarea render p-invalid and p-variant-filled (neither renders p-filled; only UPassword among the scoped inputs does), and no scoped template renders u-inputwrapper, so those selectors do not match those inputs (focus, placeholder and autofill selectors do not depend on classes; UInputChips root renders u-invalid). Style module registered as floatlabel.

## Public exports

@ultimate/vue#UFloatLabel
@ultimate/vue/float-label#UFloatLabel
@ultimate/vue#createBaseFloatLabel
@ultimate/vue/float-label#createBaseFloatLabel

## Owned source and evidence

packages/vue/src/float-label/BaseFloatLabel.ts
packages/vue/src/float-label/FloatLabel.vue
packages/vue/src/float-label/float-label-style.ts
packages/vue/src/float-label/index.ts

```text
packages/vue/src/float-label/FloatLabel.vue: name: "UFloatLabel"
packages/vue/src/float-label/BaseFloatLabel.ts: variant: { type: String, default: "over" }
packages/vue/src/float-label/float-label-style.ts: export const floatLabelStyleModule
packages/vue/src/float-label/float-label-style.ts: .u-float-label:has(input.u-filled) label
packages/vue/src/float-label/BaseFloatLabel.ts: export function createBaseFloatLabel
packages/vue/src/index.ts: export * from "./float-label";
packages/vue/package.json: "./float-label": {
```

## Relationships

package.ultimate.vue.float-label → [vue.float-label](vue.float-label.md) (reconciled family alias)
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
