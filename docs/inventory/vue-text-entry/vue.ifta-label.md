# Vue UIftaLabel

ID: vue.ifta-label

Framework: vue; availability: public

## Authored interpretation

Label wrapper positioning a slotted label above the input by CSS.

## Framework surface

UIftaLabel (IftaLabel.vue, name "UIftaLabel") and createBaseIftaLabel (BaseIftaLabel.ts) plus iftaLabelStyleModule (ifta-label-style.ts). Base chain: createBaseComponent directly, componentName iftalabel; no props, no emits, no v-model. Template: a root span rendering the default slot, with inheritAttrs: false and ptmi('root') bound on the root. Every instance provides itself as $parentInstance through the vue-core pass-through mixin. Behavior is pure CSS :has() from the shared @ultimate/uix-styles/iftalabel module (ADR-082, ADR-092): the invalid selector .u-ifta-label:has(.p-invalid) label matches UInputText and UTextarea, and the padding rules target u-inputtext, u-textarea and the select classes. No component emits p-inputwrapper-focus yet, so the focus colour reaches plain inputs and textareas only. Style module registered as iftalabel.

## Public exports

@ultimate/vue#UIftaLabel
@ultimate/vue/ifta-label#UIftaLabel
@ultimate/vue#createBaseIftaLabel
@ultimate/vue/ifta-label#createBaseIftaLabel

## Owned source and evidence

packages/vue/src/ifta-label/BaseIftaLabel.ts
packages/vue/src/ifta-label/IftaLabel.vue
packages/vue/src/ifta-label/ifta-label-style.ts
packages/vue/src/ifta-label/index.ts

```text
packages/vue/src/ifta-label/IftaLabel.vue: name: "UIftaLabel"
packages/vue/src/ifta-label/ifta-label-style.ts: export const iftaLabelStyleModule
packages/uix-styles/src/iftalabel/index.ts: .u-ifta-label:has(.p-invalid) label
packages/vue/src/ifta-label/BaseIftaLabel.ts: export function createBaseIftaLabel
packages/vue/src/index.ts: export * from "./ifta-label";
packages/vue/package.json: "./ifta-label": {
```

## Relationships

package.ultimate.vue.ifta-label → [vue.ifta-label](vue.ifta-label.md) (reconciled family alias)
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
