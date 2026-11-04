# Angular UPopover

ID: angular.popover

Framework: angular; availability: public

## Authored interpretation

Imperatively shown floating panel: show(event, target?), toggle and hide position projected content under a target element and dismiss on outside click, window resize or Escape.

## Framework surface

Selector u-popover; componentName popover; extends UBaseComponent. Input: dismissable (true). Outputs: onShow, onHide. Public methods: toggle(event, target?), show(event, target?) and hide(). There is no visible input. show() calls event.stopPropagation(), takes target ?? event.currentTarget ?? event.target, sets visible and render, binds document click and window resize listeners, registers an escape callback (ESCAPE_PRIORITIES.OVERLAY_PANEL with a per-class instanceCount uid) that calls hide(), aligns after the next render and emits onShow synchronously. hide() returns immediately when not visible; otherwise it unbinds, unregisters and emits onHide. The document click listener returns at once when dismissable is false (the selfClick flag is then not reset); otherwise it hides when selfClick is false, the content does not contain the click target and the click is not on the target element or inside it, and then resets selfClick. Any window resize hides regardless of dismissable, and Escape hides regardless of dismissable. align() writes top = target.bottom + scrollY and left = target.left + scrollX on the uOverlay container (the content's parent element) and calls ZIndex.set('overlay', ..., 1000); there is no flip, arrow or viewport clamp. Template: a uOverlay div (appendTo body) with role=dialog and [attr.aria-modal]=visible(), so aria-modal is 'true' while shown although the panel is non-modal; it has no aria-label and no focus management. The overlay and content click handlers set selfClick. ngOnDestroy unbinds both listeners, unregisters the escape callback and calls ZIndex.clear on the container when it exists. The instanceCount counter is private static to this class, so UPopover and UConfirmPopup each start at 1: if a popover and a confirm popup with the same uid are both registered, escapeRegistry keeps one callback per (OVERLAY_PANEL, uid) key, so the later register replaces the earlier one and either component's unregister removes the entry. Style module: popover-style.ts holds a local CSS string and exports popoverStyleModule only (classes root and content); there is no ClassesParams export. Entry points: exported from the @ultimate/ng/popover manifest subpath and re-exported by the root barrel packages/ng/src/index.ts. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: popover.

## Public exports

@ultimate/ng#UPopover
@ultimate/ng/popover#UPopover

## Owned source and evidence

packages/ng/src/popover/index.ts
packages/ng/src/popover/popover.ts
packages/ng/src/popover/popover-style.ts

```text
packages/ng/src/popover/popover.ts: export class UPopover extends UBaseComponent
packages/ng/src/popover/popover.ts: [attr.aria-modal]="visible()"
packages/ng/src/popover/popover.ts: this.target = target ?? (event.currentTarget as HTMLElement) ?? (event.target as HTMLElement);
packages/ng/src/popover/popover.ts: if (!this.dismissable()) {
packages/ng/src/popover/popover.ts: escapeRegistry.register(ESCAPE_PRIORITIES.OVERLAY_PANEL, this.instanceUid, () => this.hide());
packages/ng/src/popover/popover.ts: private static instanceCount = 0;
packages/ng/src/popover/popover.ts: ZIndex.clear(content);
packages/ng/src/popover/popover-style.ts: export const popoverStyleModule
packages/ng/package.json: "./popover": {
packages/ng/src/popover/index.ts: export { UPopover }
packages/themes/src/presets/aura/index.ts:     popover,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.popover → [angular.popover](angular.popover.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
package.ultimate.uix-utils.zindex (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the popover family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/popover/*.spec.ts'",
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
