# Vue UInlineMessage

ID: vue.inline-message

Framework: vue; availability: public

## Authored interpretation

Compact inline severity message with a default severity icon and a default slot.

## Framework surface

UInlineMessage is an Options API component with inheritAttrs false with no $attrs binding. Barrel exports: UInlineMessage and createBaseInlineMessage; inlineMessageStyleModule is not re-exported. componentName inlinemessage differs from the family directory inline-message; Aura registry key inlinemessage. Props and defaults: severity = "error", icon = undefined. No emits, timers or close button. The default icon map is identical to UMessage; secondary and contrast severities have no default icon. role alert with aria-live polite. inline-message-style.ts is an untyped style module. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UInlineMessage
@ultimate/vue/inline-message#UInlineMessage
@ultimate/vue#createBaseInlineMessage
@ultimate/vue/inline-message#createBaseInlineMessage

## Owned source and evidence

packages/vue/src/inline-message/BaseInlineMessage.ts
packages/vue/src/inline-message/InlineMessage.vue
packages/vue/src/inline-message/index.ts
packages/vue/src/inline-message/inline-message-style.ts

```text
packages/vue/src/inline-message/index.ts: export { default as UInlineMessage }
packages/vue/src/inline-message/InlineMessage.vue: aria-live="polite"
packages/vue/src/inline-message/InlineMessage.vue: inheritAttrs: false
packages/vue/src/index.ts: export * from "./inline-message";
packages/vue/package.json: "./inline-message": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.inline-message → [vue.inline-message](vue.inline-message.md) (reconciled family alias)
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
