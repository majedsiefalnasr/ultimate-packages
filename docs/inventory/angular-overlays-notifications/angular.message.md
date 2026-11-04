# Angular UMessage

ID: angular.message

Framework: angular; availability: public

## Authored interpretation

Inline message banner: projected text with a severity, optional icon, optional close button and optional automatic hiding after a delay.

## Framework surface

Selector u-message; componentName message; extends UBaseComponent and implements OnInit and OnDestroy. Inputs: severity ('success','info','warn','error','secondary','contrast'; default 'info'), closable (false), icon, closeIcon, life and closeAriaLabel (default 'Close'). Output: onClose, emitting { originalEvent }. A private visible signal starts true. ngOnInit calls super.ngOnInit() and, when life is truthy at that moment, starts a setTimeout that hides the message; this auto-close does not emit onClose, and life is read once, so later life changes are ignored and 0 or undefined means no timer. ngOnDestroy clears the timer. close(event) hides the message and emits onClose; there is no way to show it again. Template: while visible, a div with role=alert, aria-live=polite and data-severity; an icon <i aria-hidden> when icon is set; a text span projecting content; and a button (type=button, aria-label bound to closeAriaLabel) when closable, showing the closeIcon <i> or ×. Style module: message-style.ts holds a local CSS string and exports messageStyleModule only. Entry points: exported from the @ultimate/ng/message manifest subpath and re-exported by the root barrel packages/ng/src/index.ts. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: message.

## Public exports

@ultimate/ng#UMessage
@ultimate/ng/message#UMessage

## Owned source and evidence

packages/ng/src/message/index.ts
packages/ng/src/message/message.ts
packages/ng/src/message/message-style.ts

```text
packages/ng/src/message/message.ts: export class UMessage extends UBaseComponent implements OnInit, OnDestroy
packages/ng/src/message/message.ts: this.autoCloseTimer = setTimeout(() => this.visible.set(false), life);
packages/ng/src/message/message.ts: clearTimeout(this.autoCloseTimer);
packages/ng/src/message/message.ts: aria-live="polite"
packages/ng/src/message/message.ts: this.onClose.emit({ originalEvent: event });
packages/ng/src/message/message-style.ts: export const messageStyleModule
packages/ng/package.json: "./message": {
packages/ng/src/message/index.ts: export { UMessage }
packages/themes/src/presets/aura/index.ts:     message,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.message → [angular.message](angular.message.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the message family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/message/*.spec.ts'",
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
