# Vue UDynamicDialog

ID: vue.dynamic-dialog

Framework: vue; availability: public

## Authored interpretation

Host component that listens on the dialog event bus and renders one UDialog per opened dialog reference with the requested content component.

## Framework surface

UDynamicDialog is an Options API host component with no props and no emits. Barrel exports: only UDynamicDialog; createBaseDynamicDialog and dynamicDialogStyleModule are not re-exported. componentName dynamic-dialog. No Aura registry key exists for dynamic-dialog and no preset file exists for it. It subscribes to dialogEventBus open and close events in mounted and unsubscribes in beforeUnmount, keeps instances in data and filters by toRaw identity on close. It renders one UDialog per instance with visible fixed to true; only header, modal, closeOnEscape and inputValues are forwarded from instance.options (footer, position, dismissableMask, closable, blockScroll, appendTo and data are not). A dialog visibility change calls instance.close(). dynamic-dialog-style.ts is an untyped style module with empty css; cx('root') is never called and u-dynamic-dialog has no CSS rule. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UDynamicDialog
@ultimate/vue/dynamic-dialog#UDynamicDialog

## Owned source and evidence

packages/vue/src/dynamic-dialog/BaseDynamicDialog.ts
packages/vue/src/dynamic-dialog/DynamicDialog.vue
packages/vue/src/dynamic-dialog/dynamic-dialog-style.ts
packages/vue/src/dynamic-dialog/index.ts

```text
packages/vue/src/dynamic-dialog/index.ts: export { default as UDynamicDialog }
packages/vue/src/dynamic-dialog/DynamicDialog.vue: :visible="true"
packages/vue/src/dynamic-dialog/DynamicDialog.vue: dialogEventBus
packages/vue/src/index.ts: export * from "./dynamic-dialog";
packages/vue/package.json: "./dynamic-dialog": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.dynamic-dialog → [vue.dynamic-dialog](vue.dynamic-dialog.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.service (pending cross-batch)
package.ultimate.vue.dialog → [vue.dialog](vue.dialog.md) (reconciled family alias)

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
