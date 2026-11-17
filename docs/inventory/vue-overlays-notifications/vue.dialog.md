# Vue UDialog

ID: vue.dialog

Framework: vue; availability: public

## Authored interpretation

Controlled modal dialog with header, footer, close button, Escape and mask dismissal, optional scroll lock, z-index stacking, enter and leave motion hooks and focus restore, rendered into a portal.

## Framework surface

UDialog is an Options API component (the only family component with a setup() function, used for useId) rendered through UPortal with the appendTo prop forwarded to it. Barrel exports: UDialog and createBaseDialog; dialogStyleModule and DialogClassesParams are exported from dialog-style.ts but not re-exported. componentName dialog; Aura registry key dialog. Declared emits: update:visible, show, hide and after-hide, declared at Dialog.vue line 117 and emitted at lines 189 (show), 211 (hide) and 220 (after-hide); close() only emits update:visible false, so visibility is controlled by the parent. Props and defaults: visible = false, header = null, footer = null, modal = true, closable = true, closeOnEscape = true, dismissableMask = false, blockScroll = false, baseZIndex = 0, autoZIndex = true, role = "dialog", position = "center", appendTo = "body", ariaCloseLabel = "Close". There is no draggable or maximizable support (no draggable or maximizable) in the component. The focus trap directive is disabled when modal is false; scroll lock is registered on enter and unregistered on after-leave and unmount when modal or blockScroll is set. The z-index entry (Z_INDEX_KEYS.modal) is set on enter when autoZIndex and cleared on after-leave and on unmount. Escape is registered through createGlobalEscapeKeyMixin with the DIALOG priority and a display-order mixin (group dialog) shares the Escape registry with drawer, popover and confirm-popup. Mask dismissal needs dismissableMask and modal and requires mouse-down and the event target to be the mask. aria-labelledby is set only when header is truthy (the title span receives the id ${dialogId}_header built from useId). Focus search order footer, header, content, then the close button on after-enter; focus returns to the previously focused element on leave. onBeforeLeave is an empty handler. The footer renders when the footer prop or the footer slot is present. The metadata record packages/component-metadata/src/records/dialog.ts cites lines 118, 177, 199 and 208 of Dialog.vue, which differ from the current lines 117, 189, 211 and 220 (the record cites lines 118, 177, 199 and 208); its event facts list update:visible, show and hide and omit after-hide, although the source declares and emits after-hide. dialog-style.ts is a typed StyleModule that combines the uix-styles dialog stylesheet with a local mask rule; the class u-overlay-mask (applied when modal) and u-dialog-close-button have no CSS rule in either stylesheet. dialog.api.mdx is a generated API page and is excluded as supporting documentation. Foundation imports: vue-core base, overlay, escape, focus-trap, zindex, scroll-lock, motion and icons; uix-utils escape and dom; uix-styles dialog; ripple.

## Public exports

@ultimate/vue#UDialog
@ultimate/vue/dialog#UDialog
@ultimate/vue#createBaseDialog
@ultimate/vue/dialog#createBaseDialog

## Owned source and evidence

packages/vue/src/dialog/BaseDialog.ts
packages/vue/src/dialog/Dialog.vue
packages/vue/src/dialog/dialog-style.ts
packages/vue/src/dialog/index.ts

```text
packages/vue/src/dialog/index.ts: export { default as UDialog }
packages/vue/src/dialog/Dialog.vue: emits: ["update:visible", "show", "hide", "after-hide"]
packages/vue/src/dialog/Dialog.vue: v-focustrap="{ disabled: !modal }"
packages/vue/src/dialog/Dialog.vue: this.dismissableMask &&
packages/vue/src/dialog/dialog-style.ts: export const dialogStyleModule: StyleModule
packages/vue/src/index.ts: export * from "./dialog";
packages/vue/package.json: "./dialog": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.dialog → [vue.dialog](vue.dialog.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.escape (pending cross-batch)
package.ultimate.vue-core.focus-trap (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.scroll-lock (pending cross-batch)
package.ultimate.vue-core.motion (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)
package.ultimate.uix-styles.dialog (pending cross-batch)
package.ultimate.vue.ripple (pending cross-batch)

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
