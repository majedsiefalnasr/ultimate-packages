# Vue UPopover

ID: vue.popover

Framework: vue; availability: public

## Authored interpretation

Imperatively opened floating panel positioned under a trigger element, dismissed by outside click, resize or Escape, rendered into a portal.

## Framework surface

UPopover is an Options API component rendered through UPortal with the appendTo prop forwarded to it. Barrel exports: only UPopover; createBasePopover is exported from BasePopover.ts but is not re-exported by the family barrel (so it is also absent from the package root and the ./popover subpath), and popoverStyleModule is exported from popover-style.ts but not re-exported. componentName popover; Aura registry key popover. Declared emits: show and hide. There is no visible prop: visibility is internal state (visible and render) driven by the imperative methods toggle, show, hide and align. Component options also declare target, selfClick, documentClickListener and windowResizeListener fields. Props and defaults: dismissable = true, appendTo = "body". The document click and window resize listeners are bound in show and removed in hide and on unmount. dismissable false returns before selfClick is reset, and dismissable gates only the document click handler: resize always hides. Escape hides regardless of dismissable (OVERLAY_PANEL priority, display-order group overlay-panel, sharing the Escape registry). The panel has role dialog and aria-modal bound to visible. Each align call pushes a new ZIndex entry (Z_INDEX_KEYS.overlay) because align runs after show and again from updated() while visible; the ZIndex entry is not reverted on hide and the unmount clear receives a null content ref once hidden. popover-style.ts is an untyped style module. This family has no @ultimate/uix-styles entry and keeps its css locally.

## Public exports

@ultimate/vue#UPopover
@ultimate/vue/popover#UPopover

## Owned source and evidence

packages/vue/src/popover/BasePopover.ts
packages/vue/src/popover/Popover.vue
packages/vue/src/popover/index.ts
packages/vue/src/popover/popover-style.ts

```text
packages/vue/src/popover/index.ts: export { default as UPopover }
packages/vue/src/popover/Popover.vue: emits: ["show", "hide"]
packages/vue/src/popover/Popover.vue: if (!this.dismissable) return;
packages/vue/src/popover/BasePopover.ts: export function createBasePopover
packages/vue/src/index.ts: export * from "./popover";
packages/vue/package.json: "./popover": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.popover → [vue.popover](vue.popover.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.escape (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
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
