# Angular UTooltip

ID: angular.tooltip

Framework: angular; availability: public

## Authored interpretation

Attribute directive that shows a text tooltip bubble on hover or focus of its host element.

## Framework surface

A directive (selector [uTooltip]), not a component; componentName tooltip; extends UBaseComponent. Inputs: uTooltip (string), uTooltipPosition ('top','bottom','left','right'; default 'top') and uTooltipDisabled (boolean). No outputs. Host listeners: mouseenter and focus call show(); mouseleave and blur call hide(). Injects ComponentIdGenerator without a default: the app must provide it. show() runs in the browser only, does nothing without text or when disabled, removes any previous container, creates a div role=tooltip with id `${next('u_tooltip')}`, an arrow div and a text div and class u-tooltip-<position>, sets inline display inline-block, appends it to document.body, aligns, calls ZIndex.set('tooltip', ..., 1100) and appends its id to the host aria-describedby (keeping existing ids). hide() clears the z-index, removes only its own id from aria-describedby (removing the attribute when empty) and removes the container. Alignment uses the host rect plus window scroll and uix-utils dom measurements; the left value is clamped to the viewport width and to at least 0, and there is no vertical clamp or flip. There is no show or hide delay, no Escape handling (the escape registry is not used), no touch handling and no output events. ngOnDestroy detaches aria-describedby and removes the container but does not call ZIndex.clear. Style module: tooltip-style.ts imports the CSS from @ultimate/uix-styles/tooltip and exports tooltipStyleModule only (classes root, arrow, text). Entry points: exported from the @ultimate/ng/tooltip manifest subpath and re-exported by the root barrel packages/ng/src/index.ts. Metadata: TOOLTIP_METADATA exists in packages/component-metadata/src/records/tooltip.ts with this directive as its source path; tooltip.api.mdx is a generated page excluded from this record's files. Aura registry key: tooltip. The package-coverage reservation puts package.ultimate.ng.tooltip under ticket 122.

## Public exports

@ultimate/ng#UTooltip
@ultimate/ng/tooltip#UTooltip

## Owned source and evidence

packages/ng/src/tooltip/index.ts
packages/ng/src/tooltip/tooltip.ts
packages/ng/src/tooltip/tooltip-style.ts

```text
packages/ng/src/tooltip/tooltip.ts: export class UTooltip extends UBaseComponent
packages/ng/src/tooltip/tooltip.ts: selector: "[uTooltip]"
packages/ng/src/tooltip/tooltip.ts: private readonly idGenerator = inject(ComponentIdGenerator);
packages/ng/src/tooltip/tooltip.ts: ZIndex.set("tooltip", this.container, 1100);
packages/ng/src/tooltip/tooltip.ts: this.renderer.setAttribute(container, "role", "tooltip");
packages/ng/src/tooltip/tooltip.ts: if (left < 0) {
packages/ng/src/tooltip/tooltip-style.ts: @ultimate/uix-styles/tooltip
packages/ng/src/tooltip/tooltip-style.ts: export const tooltipStyleModule
packages/ng/package.json: "./tooltip": {
packages/uix-styles/package.json: "./tooltip": {
packages/component-metadata/src/records/tooltip.ts: export const TOOLTIP_METADATA
packages/ng/src/tooltip/index.ts: export { UTooltip }
packages/themes/src/presets/aura/index.ts:     tooltip,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.tooltip → [angular.tooltip](angular.tooltip.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.id (pending cross-batch)
package.ultimate.uix-utils.zindex (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)
package.ultimate.uix-styles.tooltip (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the tooltip family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/tooltip/*.spec.ts'",
    "outcome": "not-run",
    "revision": "02810e3a8a6ca5ccf75eb596a1ddccdb86257c9b",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
