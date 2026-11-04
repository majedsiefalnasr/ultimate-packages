# Angular UToast

ID: angular.toast

Framework: angular; availability: public

## Authored interpretation

Notification stack fed by UToastService: messages whose key matches this instance are listed with severity, summary and detail and are removed on close or after their life.

## Framework surface

Selector u-toast; componentName toast; extends UBaseComponent. Inputs: key, position (seven values; default 'top-right') and life (default 3000, numberAttribute). No outputs. Injects UToastService (ng-core, providedIn root) and DestroyRef. The constructor subscribes to messageObserver (single or array; keeps only messages with m.key === this.key(), so undefined matches undefined) and to clearObserver (clears all when the key is null or equals this.key()). Each pushed entry gets an id from the module-level nextId counter shared by every UToast instance, and unless entry.sticky is set a setTimeout(remove, entry.life ?? this.life()) is stored in a timers Map; because of ?? a life of 0 schedules a zero-delay timeout. remove(id) drops the entry and clears its timer; destroyRef.onDestroy unsubscribes both subscriptions and clears all timers. Template: one div per message with class from severity, role=alert, aria-live=assertive and aria-atomic=true; summary and detail divs only when set; a close button (type=button, literal aria-label 'Close', rendered as ×) unless message.closable is false. There is no pause on hover, no icon, no template slot and no close output. Style module: toast-style.ts holds a local CSS string covering six severities and seven positions (fixed positioning) and exports toastStyleModule only. Entry points: exported from the @ultimate/ng/toast manifest subpath and re-exported by the root barrel packages/ng/src/index.ts. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: toast.

## Public exports

@ultimate/ng#UToast
@ultimate/ng/toast#UToast

## Owned source and evidence

packages/ng/src/toast/index.ts
packages/ng/src/toast/toast.ts
packages/ng/src/toast/toast-style.ts

```text
packages/ng/src/toast/toast.ts: export class UToast extends UBaseComponent
packages/ng/src/toast/toast.ts: let nextId = 0;
packages/ng/src/toast/toast.ts: const accepted = list.filter((m) => m.key === this.key());
packages/ng/src/toast/toast.ts: const timer = setTimeout(() => this.remove(id), entry.life ?? this.life());
packages/ng/src/toast/toast.ts: aria-live="assertive"
packages/ng/src/toast/toast.ts: this.timers.forEach((timer) => clearTimeout(timer));
packages/ng/src/toast/toast-style.ts: export const toastStyleModule
packages/ng/package.json: "./toast": {
packages/ng/src/toast/index.ts: export { UToast }
packages/themes/src/presets/aura/index.ts:     toast,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.toast → [angular.toast](angular.toast.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.toast-service (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the toast family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/toast/*.spec.ts'",
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
