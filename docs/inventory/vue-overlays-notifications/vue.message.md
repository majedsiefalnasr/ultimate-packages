# Vue UMessage

ID: vue.message

Framework: vue; availability: public

## Authored interpretation

Inline severity message with optional close button, optional automatic dismissal and default severity icons.

## Framework surface

UMessage is an Options API component with inheritAttrs false with no $attrs binding. Barrel exports: UMessage and createBaseMessage; messageStyleModule is not re-exported. componentName message; Aura registry key message. Declared emits: close with { originalEvent }, emitted only by the close button. Props and defaults: severity = "info", closable = false, life = null, icon = undefined, closeIcon = undefined, closeAriaLabel = "Close". life is read once on mount (no watcher); timer dismissal does not emit close, it only hides. Default icon classes map info, success, warn and error; secondary and contrast severities have no default icon. role alert with aria-live polite. message-style.ts is an untyped style module. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UMessage
@ultimate/vue/message#UMessage
@ultimate/vue#createBaseMessage
@ultimate/vue/message#createBaseMessage

## Owned source and evidence

packages/vue/src/message/BaseMessage.ts
packages/vue/src/message/Message.vue
packages/vue/src/message/index.ts
packages/vue/src/message/message-style.ts

```text
packages/vue/src/message/index.ts: export { default as UMessage }
packages/vue/src/message/Message.vue: emits: ["close"]
packages/vue/src/message/Message.vue: aria-live="polite"
packages/vue/src/index.ts: export * from "./message";
packages/vue/package.json: "./message": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.message → [vue.message](vue.message.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
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
