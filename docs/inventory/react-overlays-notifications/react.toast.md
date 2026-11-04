# React UToast

ID: react.toast

Framework: react; availability: public

## Authored interpretation

Imperative toast stack with seven positions, severities and timed or sticky messages.

## Framework surface

UToast is React.forwardRef<UToastHandle, UToastProps> and is not rendered through a portal. Barrel exports: UToast and types UToastProps, UToastHandle and UToastMessageOptions. UToastProps: position (top-right default, top-left, bottom-right, bottom-left, top-center, bottom-center, center), life (3000), className. UToastHandle: show(message or array) and clear(), created with useImperativeHandle and dependency [push]. UToastMessageOptions: severity (success, info, warn, error, secondary, contrast), summary, detail, life, sticky, closable and a string index signature; extra keys are accepted but never read, and an id key is overwritten by the generated id. There is no context, provider, hook or service; the handle is the only API. State: a module-level counter nextId is shared by every UToast instance and is never reset. push appends an entry, and unless sticky schedules a timer for entry.life ?? life, so life 0 schedules a zero-delay timeout; remove and clear cancel timers and the unmount effect clears them all. There are no onShow or onRemove callbacks. Rendering: the container div is always rendered (class u-toast plus the position class), carries no role and does not use useZIndex; each message has role="alert", aria-live="assertive" and aria-atomic="true"; summary and detail are rendered only when truthy; the close button (hard-coded aria-label "Close", text ×) is rendered unless closable === false. Style: the stylesheet gives .u-toast position: fixed and z-index 1200, seven position rules, the u-toast-message rule, six severity rules using var(--u-toast-<severity>-bg) and var(--u-toast-<severity>-color) with fallbacks, and rules for content, summary, detail and close button. Classes: root, message, messageContent, summary, detail, closeButton. componentName toast is passed to useComponentBase together with toastStyleModule; the theme preset lookup uses that name as given and the Aura registry key toast matches it. toastStyleModule is an untyped style module (a plain { css, classes } object) exported from toast-style.ts and is not part of the package barrels. No @ultimate/uix-styles entry exists for toast; the style file says so in a comment and no source file in this family imports @ultimate/uix-styles.

## Public exports

@ultimate/react#UToast
@ultimate/react/toast#UToast
@ultimate/react#UToastProps
@ultimate/react/toast#UToastProps
@ultimate/react#UToastHandle
@ultimate/react/toast#UToastHandle
@ultimate/react#UToastMessageOptions
@ultimate/react/toast#UToastMessageOptions

## Owned source and evidence

packages/react/src/toast/index.ts
packages/react/src/toast/toast.tsx
packages/react/src/toast/toast-style.ts

```text
packages/react/src/toast/index.ts: export { UToast } from
packages/react/src/toast/toast.tsx: let nextId = 0;
packages/react/src/toast/toast.tsx: React.forwardRef<UToastHandle, UToastProps>
packages/react/src/toast/toast.tsx: entry.life ?? life
packages/react/src/toast/toast.tsx: aria-live="assertive"
packages/react/src/toast/toast.tsx: message.closable !== false
packages/react/src/toast/toast-style.ts: export const toastStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     toast,
packages/react/src/index.ts: export * from "./toast";
packages/react/package.json: "./toast": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.toast → [react.toast](react.toast.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
