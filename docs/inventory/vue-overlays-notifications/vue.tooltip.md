# Vue v-tooltip directive

ID: vue.tooltip

Framework: vue; availability: public

## Authored interpretation

Directive that shows a body-appended tooltip panel for the host element on hover or focus with optional delays, HTML content and auto-hide control.

## Framework surface

v-tooltip is a directive (no component, no Base factory, no plugin install): tooltipDirective is created with createDirective and has mounted, updated and unmounted hooks; users register it with app.directive or a local directives option. Barrel exports: tooltipDirective and type TooltipBindingValue; tooltipStyleModule is exported from tooltip-style.ts but not re-exported. Aura registry key tooltip. The binding is a string shorthand or an object with value, disabled, escape, class, fitContent, id, showDelay, hideDelay and autoHide; defaults: escape = true, showDelay = 0, hideDelay = 0, autoHide = true, id from uuid("u_tooltip"), fitContent applied unless false. Listeners mouseenter, mouseleave, focus and blur are attached with addEventListener on the host and removed on unbind. updated unbinds and rebinds, which removes an open panel. onEnter does not clear showTimer (it clears only hideTimer) and showTooltip does not check for an existing panel, so repeated entries can append duplicate panels. autoHide false leaves the panel until unbind. escape false assigns innerHTML; otherwise textContent is used. The panel is appended to document.body with role tooltip and an aria-describedby token on the host, positioned from the host rect plus scroll offsets plus 4, with Z_INDEX_KEYS.tooltip set and cleared on hide. No resize or scroll handling and no Escape handling. The directive never reads tooltipStyleModule.classes: u-tooltip-arrow and the position classes are never applied (only u-tooltip, the custom class and u-tooltip-text). The metadata record packages/component-metadata/src/records/tooltip.ts cites tooltip.ts:150-161 for the hooks, whereas the hooks block starts at line 167; its Vue events: [] matches the absence of emits in a directive. tooltip-style.ts is a typed StyleModule over the uix-styles tooltip stylesheet.

## Public exports

@ultimate/vue#tooltipDirective
@ultimate/vue/tooltip#tooltipDirective
@ultimate/vue#TooltipBindingValue
@ultimate/vue/tooltip#TooltipBindingValue

## Owned source and evidence

packages/vue/src/tooltip/index.ts
packages/vue/src/tooltip/tooltip-style.ts
packages/vue/src/tooltip/tooltip.ts

```text
packages/vue/src/tooltip/index.ts: export { tooltipDirective }
packages/vue/src/tooltip/tooltip.ts: export const tooltipDirective
packages/vue/src/tooltip/tooltip.ts: autoHide === false
packages/vue/src/tooltip/tooltip-style.ts: export const tooltipStyleModule: StyleModule
packages/vue/src/index.ts: export * from "./tooltip";
packages/vue/package.json: "./tooltip": {
.github/workflows/ci.yml: run: pnpm run test
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue.tooltip → [vue.tooltip](vue.tooltip.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.directive (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)
package.ultimate.uix-utils.uuid (pending cross-batch)
package.ultimate.uix-styles.tooltip (pending cross-batch)

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
