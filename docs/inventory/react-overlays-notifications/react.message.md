# React UMessage

ID: react.message

Framework: react; availability: public

## Authored interpretation

Inline severity message with optional icon, close button and timed dismissal.

## Framework surface

UMessage is React.forwardRef<HTMLDivElement, UMessageProps> and is not rendered through a portal. Barrel exports: UMessage and type UMessageProps. UMessageProps: severity (success, info, warn, error, secondary, contrast; default "info"), closable (false), icon, closeIcon, life, closeAriaLabel ("Close"), onClose({ originalEvent }), children, className. The forwarded ref is the root div. State: visible starts true and is never set back to true. An effect on [life] returns immediately when life is falsy, otherwise hides after life milliseconds and clears the timer on cleanup; timer dismissal does not call onClose, while the close button calls onClose with the click event after hiding. Hidden returns null. Icons: a default icon class is mapped for info (pi pi-info-circle), success (pi pi-check), warn (pi pi-exclamation-triangle) and error (pi pi-times-circle); secondary and contrast have no default icon, and an icon prop replaces the default. The pi classes are only referenced as class names; the style module defines no rule for them. Accessibility: root role="alert", aria-live="polite" and data-severity; the close button label comes from closeAriaLabel and the default close content is ×. Style: classes root, content, icon, text, closeButton; rules for u-message, u-message-content, u-message-icon, u-message-text, u-message-close-button and six severity rules using var(--u-message-<severity>-bg) and var(--u-message-<severity>-color) with fallbacks. componentName message is passed to useComponentBase together with messageStyleModule; the theme preset lookup uses that name as given and the Aura registry key message matches it. messageStyleModule is an untyped style module (a plain { css, classes } object) exported from message-style.ts and is not part of the package barrels. No @ultimate/uix-styles entry exists for message; the style file says so in a comment and no source file in this family imports @ultimate/uix-styles.

## Public exports

@ultimate/react#UMessage
@ultimate/react/message#UMessage
@ultimate/react#UMessageProps
@ultimate/react/message#UMessageProps

## Owned source and evidence

packages/react/src/message/index.ts
packages/react/src/message/message.tsx
packages/react/src/message/message-style.ts

```text
packages/react/src/message/index.ts: export { UMessage } from
packages/react/src/message/message.tsx: React.forwardRef<HTMLDivElement, UMessageProps>
packages/react/src/message/message.tsx: if (!life) return;
packages/react/src/message/message.tsx: onClose?.({ originalEvent: event });
packages/react/src/message/message.tsx: aria-live="polite"
packages/react/src/message/message.tsx: warn: "pi pi-exclamation-triangle"
packages/react/src/message/message-style.ts: export const messageStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     message,
packages/react/src/index.ts: export * from "./message";
packages/react/package.json: "./message": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.message → [react.message](react.message.md) (reconciled family alias)
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
