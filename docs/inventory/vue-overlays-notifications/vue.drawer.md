# Vue UDrawer

ID: vue.drawer

Framework: vue; availability: public

## Authored interpretation

Controlled edge-anchored panel with header, close button, Escape and mask dismissal and a focus trap, rendered into a portal without leave motion.

## Framework surface

UDrawer is an Options API component rendered through UPortal with the appendTo prop forwarded to it. Barrel exports: UDrawer and createBaseDrawer; drawerStyleModule and DrawerClassesParams are exported from drawer-style.ts but not re-exported. componentName drawer; Aura registry key drawer. Declared emits: update:visible, show and hide; show and hide are emitted only by the visible watcher, so mount with visible true does not emit show. Props and defaults: visible = false, header = null, position = "left", modal = true, dismissible = true, closable = true, closeOnEscape = true, appendTo = "body", ariaCloseLabel = "Close". modal is read only by the mask-click dismissal condition: the mask is always rendered and the focus trap is always enabled whatever modal is. Escape reaches close() through two paths: the global Escape mixin (SIDEBAR priority, display-order group sidebar, sharing the Escape registry) and a root keydown handler that checks event.code. The root has role complementary and no aria-labelledby or id on the title; the footer renders only for the footer slot (there is no footer prop). There is no scroll lock, no motion hook and no leave transition: hiding removes the mask immediately. The ZIndex entry is not reverted on hide: z-index is set (Z_INDEX_KEYS.modal) after show and cleared only on unmount, when the mask ref is still present. drawer-style.ts is an untyped style module; u-drawer-close-button has no CSS rule. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UDrawer
@ultimate/vue/drawer#UDrawer
@ultimate/vue#createBaseDrawer
@ultimate/vue/drawer#createBaseDrawer

## Owned source and evidence

packages/vue/src/drawer/BaseDrawer.ts
packages/vue/src/drawer/Drawer.vue
packages/vue/src/drawer/drawer-style.ts
packages/vue/src/drawer/index.ts

```text
packages/vue/src/drawer/index.ts: export { default as UDrawer }
packages/vue/src/drawer/Drawer.vue: emits: ["update:visible", "show", "hide"]
packages/vue/src/drawer/Drawer.vue: role="complementary"
packages/vue/src/drawer/drawer-style.ts: export const drawerStyleModule
packages/vue/src/index.ts: export * from "./drawer";
packages/vue/package.json: "./drawer": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.drawer → [vue.drawer](vue.drawer.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.escape (pending cross-batch)
package.ultimate.vue-core.focus-trap (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
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
