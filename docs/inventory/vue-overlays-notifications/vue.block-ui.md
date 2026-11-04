# Vue UBlockUI

ID: vue.block-ui

Framework: vue; availability: public

## Authored interpretation

Wrapper that overlays its content with a blocking mask, optionally fixed to the document with scroll lock and z-index stacking.

## Framework surface

UBlockUI is an Options API component with inheritAttrs false with no $attrs binding. Barrel exports: UBlockUI and createBaseBlockUI; blockUiStyleModule and BlockUIMaskParams are exported from block-ui-style.ts but not re-exported. componentName blockui differs from the family directory block-ui; Aura registry key blockui. Declared emits: blocked and unblocked. Props and defaults: blocked = false, fullScreen = false, baseZIndex = 0, autoZIndex = true. A module-level counter instanceCount builds the scroll lock id per instance. blocked at mount runs block() and emits blocked; the blocked watcher calls block() and unblock(). block() registers the scroll lock when fullScreen and sets the z-index after nextTick when autoZIndex, the z-index key is the string literal "modal"; unblock() clears the z-index while the mask is still rendered and clearZIndex is not gated by autoZIndex. unmount while blocked emits no unblocked. The root has aria-busy bound to blocked; the mask has no role or aria-hidden. The fullScreen mask is positioned fixed by the document rule; the stylesheet gives the mask position fixed, then absolute in a later rule, then fixed again only for the document variant. block-ui-style.ts is an untyped style module. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UBlockUI
@ultimate/vue/block-ui#UBlockUI
@ultimate/vue#createBaseBlockUI
@ultimate/vue/block-ui#createBaseBlockUI

## Owned source and evidence

packages/vue/src/block-ui/BaseBlockUI.ts
packages/vue/src/block-ui/BlockUI.vue
packages/vue/src/block-ui/block-ui-style.ts
packages/vue/src/block-ui/index.ts

```text
packages/vue/src/block-ui/index.ts: export { default as UBlockUI }
packages/vue/src/block-ui/BlockUI.vue: emits: ["blocked", "unblocked"]
packages/vue/src/block-ui/BlockUI.vue: instanceCount
packages/vue/src/block-ui/BlockUI.vue: :aria-busy="blocked"
packages/vue/src/index.ts: export * from "./block-ui";
packages/vue/package.json: "./block-ui": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.block-ui → [vue.block-ui](vue.block-ui.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.scroll-lock (pending cross-batch)
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
    "behavior": "Bounded Vue product specs for the overlay and notification families were not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/dialog/ src/drawer/ src/popover/ src/confirm-dialog/ src/confirm-popup/ src/dynamic-dialog/ src/tooltip/ src/toast/ src/message/ src/inline-message/ src/block-ui/",
    "outcome": "not-run",
    "revision": "ce6cb351653cbbb19cc0b0246942082dd0aff73d",
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
