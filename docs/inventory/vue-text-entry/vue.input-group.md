# Vue UInputGroup and UInputGroupAddon

ID: vue.input-group

Framework: vue; availability: public

## Authored interpretation

Layout wrapper pair joining inputs and addons into one bordered group by CSS.

## Framework surface

UInputGroup (InputGroup.vue) and UInputGroupAddon (InputGroupAddon.vue) with createBaseInputGroup (BaseInputGroup.ts) and createBaseInputGroupAddon (BaseInputGroupAddon.ts), plus inputGroupStyleModule and inputGroupAddonStyleModule (input-group-style.ts). Base chain: createBaseComponent directly (componentName inputgroup and inputgroupaddon); both declare no props and no emits. Template: each is a root div rendering the default slot, with inheritAttrs: false and ptmi('root') bound on the root. inputGroupAddonStyleModule has an empty css string; the shared CSS is in inputGroupStyleModule and comes from the shared @ultimate/uix-styles/inputgroup module (ADR-082, ADR-093), keyed on the classes the sibling fields emit (u-inputtext, p-inputwrapper, p-inputwrapper-focus and p-focus) and on the u-icon-field, u-float-label and u-ifta-label wrappers. The Aura registry key for this family is inputgroup; there is no inputgroupaddon key.

## Public exports

@ultimate/vue#UInputGroup
@ultimate/vue/input-group#UInputGroup
@ultimate/vue#createBaseInputGroup
@ultimate/vue/input-group#createBaseInputGroup
@ultimate/vue#UInputGroupAddon
@ultimate/vue/input-group#UInputGroupAddon
@ultimate/vue#createBaseInputGroupAddon
@ultimate/vue/input-group#createBaseInputGroupAddon

## Owned source and evidence

packages/vue/src/input-group/BaseInputGroup.ts
packages/vue/src/input-group/BaseInputGroupAddon.ts
packages/vue/src/input-group/InputGroup.vue
packages/vue/src/input-group/InputGroupAddon.vue
packages/vue/src/input-group/index.ts
packages/vue/src/input-group/input-group-style.ts

```text
packages/vue/src/input-group/InputGroup.vue: name: "UInputGroup"
packages/vue/src/input-group/InputGroupAddon.vue: name: "UInputGroupAddon"
packages/vue/src/input-group/input-group-style.ts: export const inputGroupStyleModule
packages/vue/src/input-group/input-group-style.ts: export const inputGroupAddonStyleModule
packages/vue/src/input-group/BaseInputGroup.ts: export function createBaseInputGroup
packages/vue/src/input-group/BaseInputGroupAddon.ts: export function createBaseInputGroupAddon
packages/vue/src/index.ts: export * from "./input-group";
packages/vue/package.json: "./input-group": {
packages/vue/src/input-group/input-group-style.ts: @ultimate/uix-styles/inputgroup"
```

## Relationships

package.ultimate.vue.input-group → [vue.input-group](vue.input-group.md) (reconciled family alias)
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
