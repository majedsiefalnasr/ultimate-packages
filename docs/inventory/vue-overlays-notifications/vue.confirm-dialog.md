# Vue UConfirmDialog

ID: vue.confirm-dialog

Framework: vue; availability: public

## Authored interpretation

Confirmation dialog that listens on the confirmation event bus and renders accept and reject buttons inside a UDialog.

## Framework surface

UConfirmDialog is an Options API component that renders a UDialog (imported from ../dialog/Dialog.vue) with role alertdialog; class is passed to UDialog whose template root is UPortal. Barrel exports: only UConfirmDialog; createBaseConfirmDialog is exported from BaseConfirmDialog.ts but is not re-exported, and confirmDialogStyleModule is not re-exported. componentName confirmdialog differs from the family directory confirm-dialog; Aura registry key confirmdialog. Prop and default: group = undefined. No emits are declared. The component subscribes to confirmationEventBus confirm and close events in mounted and unsubscribes both in beforeUnmount; a confirm event is accepted when options.key equal to the group prop (undefined matches undefined). header, modal and closeOnEscape come from the confirmation options (modal and closeOnEscape default to true). Labels default to "No" and "Yes" and each button is hidden when rejectVisible or acceptVisible is false. Dismissal through Escape, mask or the close button hides without calling reject; only the reject button calls the reject callback. dismissableMask, appendTo, blockScroll, closable and footer are not forwarded to the dialog. The icon element applies cx('icon') only when the confirmation has an icon. confirm-dialog-style.ts is an untyped style module; u-confirmdialog has no rule in its stylesheet. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UConfirmDialog
@ultimate/vue/confirm-dialog#UConfirmDialog

## Owned source and evidence

packages/vue/src/confirm-dialog/BaseConfirmDialog.ts
packages/vue/src/confirm-dialog/ConfirmDialog.vue
packages/vue/src/confirm-dialog/confirm-dialog-style.ts
packages/vue/src/confirm-dialog/index.ts

```text
packages/vue/src/confirm-dialog/index.ts: export { default as UConfirmDialog }
packages/vue/src/confirm-dialog/ConfirmDialog.vue: role="alertdialog"
packages/vue/src/confirm-dialog/ConfirmDialog.vue: options && options.key === this.group
packages/vue/src/index.ts: export * from "./confirm-dialog";
packages/vue/package.json: "./confirm-dialog": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.confirm-dialog → [vue.confirm-dialog](vue.confirm-dialog.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.service (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
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
