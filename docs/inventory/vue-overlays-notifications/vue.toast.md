# Vue UToast

ID: vue.toast

Framework: vue; availability: public

## Authored interpretation

Event-bus driven stack of timed toast messages grouped by an optional group key and positioned by a style class.

## Framework surface

UToast is an Options API component with inheritAttrs false with no $attrs binding. Barrel exports: UToast and createBaseToast; toastStyleModule is not re-exported. componentName toast; Aura registry key toast. Props and defaults: group = null, position = "top-right", life = 3000. No emits are declared. It has no UPortal and no useZIndex: the stylesheet fixes position: fixed and z-index 1200. It subscribes to toastEventBus add, remove and remove-all in mounted and unsubscribes and clears timers on unmount. A module-level counter nextId is incremented for every added message and never reset. A message is accepted when (message.group ?? null) equals the group prop; each non-sticky message gets a timer using entry.life ?? this.life. remove(message) with the original options object removes nothing, because removal needs an id key that only the stored entry carries. Each message has role alert with aria-live assertive; the close button aria-label is the literal "Close" and there is no label prop. Root and message class resolvers return joined strings. toast-style.ts is an untyped style module. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UToast
@ultimate/vue/toast#UToast
@ultimate/vue#createBaseToast
@ultimate/vue/toast#createBaseToast

## Owned source and evidence

packages/vue/src/toast/BaseToast.ts
packages/vue/src/toast/Toast.vue
packages/vue/src/toast/index.ts
packages/vue/src/toast/toast-style.ts

```text
packages/vue/src/toast/index.ts: export { default as UToast }
packages/vue/src/toast/Toast.vue: nextId
packages/vue/src/toast/Toast.vue: entry.life ?? this.life
packages/vue/src/toast/Toast.vue: aria-live="assertive"
packages/vue/src/index.ts: export * from "./toast";
packages/vue/package.json: "./toast": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.toast → [vue.toast](vue.toast.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.service (pending cross-batch)
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
