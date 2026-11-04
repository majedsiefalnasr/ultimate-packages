# Vue UConfirmPopup

ID: vue.confirm-popup

Framework: vue; availability: public

## Authored interpretation

Confirmation popup that listens on the confirmation event bus and renders a panel anchored to the confirmation target with accept and reject buttons.

## Framework surface

UConfirmPopup is an Options API component rendered through UPortal (v-if confirmation, no appendTo). Barrel exports: only UConfirmPopup; createBaseConfirmPopup and confirmPopupStyleModule are not re-exported. componentName confirmpopup differs from the family directory confirm-popup; Aura registry key confirmpopup. Prop and default: group = undefined. No emits are declared. The component subscribes to confirmationEventBus confirm and close events in mounted and unsubscribes both in beforeUnmount; a confirm event is accepted when options.key equal to the group prop. Escape calls reject (OVERLAY_PANEL priority, display-order group overlay-panel, sharing the Escape registry). The outside click and resize hide without calling reject; the document click and window resize listeners are bound after the confirmation is positioned and removed in hide and on unmount. Accept and reject return focus to the target. Panel role alertdialog without aria-modal or labelling. The ZIndex entry is not reverted on hide: the overlay z-index is set in align and cleared only on unmount, when the content ref is null once hidden. confirm-popup-style.ts is an untyped style module; u-confirmpopup-message has no CSS rule. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UConfirmPopup
@ultimate/vue/confirm-popup#UConfirmPopup

## Owned source and evidence

packages/vue/src/confirm-popup/BaseConfirmPopup.ts
packages/vue/src/confirm-popup/ConfirmPopup.vue
packages/vue/src/confirm-popup/confirm-popup-style.ts
packages/vue/src/confirm-popup/index.ts

```text
packages/vue/src/confirm-popup/index.ts: export { default as UConfirmPopup }
packages/vue/src/confirm-popup/ConfirmPopup.vue: role="alertdialog"
packages/vue/src/confirm-popup/ConfirmPopup.vue: options && options.key === this.group
packages/vue/src/index.ts: export * from "./confirm-popup";
packages/vue/package.json: "./confirm-popup": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.confirm-popup → [vue.confirm-popup](vue.confirm-popup.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.escape (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.service (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)

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
