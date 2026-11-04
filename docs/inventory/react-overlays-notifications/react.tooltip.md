# React UTooltip

ID: react.tooltip

Framework: react; availability: public

## Authored interpretation

Tooltip bound to a target element or selector with hover or focus triggers, delays, aria-describedby wiring and escape handling.

## Framework surface

UTooltip is a plain function component, not a forwardRef returning a ReactElement or null, rendered through Portal without appendTo. Barrel exports: UTooltip and type UTooltipProps. UTooltipProps: target (a ref, an element, a selector string or an array of selectors) is required; content, position ("right" default, left, top, bottom), event ("hover" default, focus, both), showDelay (0), hideDelay (0), disabled (false), closeOnEscape (false), autoZIndex (true), baseZIndex, id, className. The array form uses only target[0]. Listeners: listeners are attached once on mount (useMountEffect) to the target resolved at that time, using the show and hide functions of the first render, so later changes of target, event, disabled, content and the delays are not rebound; the unmount cleanup removes the same listeners, clears both timers, removes aria-describedby and calls clearZIndex(panelRef.current). Behaviour: show returns when disabled or content is empty, otherwise clears the hide timer and sets visible after showDelay; hide clears the show timer and sets visible false after hideDelay. Escape hides while visible && closeOnEscape (priority [ESCAPE_PRIORITIES.TOOLTIP, displayOrder], via useGlobalEscapeKey). A useUpdateEffect on [visible] adds or removes the panel id in the target aria-describedby and sets the "tooltip" z-index when autoZIndex, or clears it. The component returns null when content is empty. Panel: role="tooltip" with aria-hidden={!visible}, which is always false because Portal renders the panel only while visible; the id comes from id or useId. When visible turns false the panel is already removed, so the clear receives null and the ZIndex entry is never reverted; the unmount cleanup receives null for the same reason when unmounted while visible. Placement: no code in tooltip.tsx assigns top or left; the stylesheet rule .u-tooltip is position: absolute with top: -9999px; left: -9999px, and no rule exists for u-tooltip-right, u-tooltip-left, u-tooltip-top and u-tooltip-bottom, which the position prop adds as a class. u-tooltip-text has a rule. Links: @ultimate/component-metadata has a Tooltip record and @ultimate/uix-styles has a tooltip entry; this source imports neither. tooltip.api.mdx is generated documentation and is excluded. componentName tooltip is passed to useComponentBase together with tooltipStyleModule; the theme preset lookup uses that name as given and the Aura registry key tooltip matches it. tooltipStyleModule is a typed StyleModule exported from tooltip-style.ts and is not part of the package barrels.

## Public exports

@ultimate/react#UTooltip
@ultimate/react/tooltip#UTooltip
@ultimate/react#UTooltipProps
@ultimate/react/tooltip#UTooltipProps

## Owned source and evidence

packages/react/src/tooltip/index.ts
packages/react/src/tooltip/tooltip.tsx
packages/react/src/tooltip/tooltip-style.ts

```text
packages/react/src/tooltip/index.ts: export { UTooltip } from
packages/react/src/tooltip/tooltip.tsx: export function UTooltip(
packages/react/src/tooltip/tooltip.tsx: document.querySelector<HTMLElement>(target[0])
packages/react/src/tooltip/tooltip.tsx: useMountEffect(() => {
packages/react/src/tooltip/tooltip.tsx: clearZIndex(panelRef.current);
packages/react/src/tooltip/tooltip.tsx: role="tooltip"
packages/react/src/tooltip/tooltip.tsx: aria-hidden={!visible}
packages/react/src/tooltip/tooltip-style.ts: export const tooltipStyleModule: StyleModule
packages/themes/src/presets/aura/index.ts:     tooltip,
packages/react/src/index.ts: export * from "./tooltip";
packages/react/package.json: "./tooltip": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.tooltip → [react.tooltip](react.tooltip.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.hooks (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product specs for the overlay and notification families were not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/dialog/ src/drawer/ src/popover/ src/confirm-dialog/ src/confirm-popup/ src/tooltip/ src/toast/ src/message/ src/block-ui/",
    "outcome": "not-run",
    "revision": "7b296258f469ba37ed2367cafbf3f2dbf95398f0",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
