# Angular UDynamicDialog

ID: angular.dynamic-dialog

Framework: angular; availability: public

## Authored interpretation

Host for service-opened dialogs: renders one UDialog per request emitted by UDialogService.open$ and instantiates the requested component inside it.

## Framework surface

Selector u-dynamic-dialog; componentName dynamic-dialog (hyphenated, unlike most registry keys); extends UBaseComponent. No inputs and no outputs. Injects UDialogService (ng-core, providedIn root) and composes UDialog and NgComponentOutlet, so a ComponentIdGenerator must be provided through UDialog. The constructor subscribes to dialogService.open$ with no unsubscribe and no destroyRef cleanup; for every request it also subscribes to ref.requestClose$ and removes the instance (and unsubscribes that inner subscription) when it emits, but an instance still open when the host is destroyed keeps its inner subscription until the ref completes. Template: @for over instances tracked by ref renders u-dialog with visible fixed true, header and modal (config.modal ?? true) and closeOnEscape (config.closeOnEscape ?? true) from the request config, and an ng-container *ngComponentOutlet that passes config.inputValues as inputs. The dialog's visibleChange calls ref.close() with an undefined result. config.data is not read by this component. Style module: dynamic-dialog-style.ts defines an empty CSS string and exports dynamicDialogStyleModule only (class root). Entry points: re-exported by the root barrel packages/ng/src/index.ts only; there is no ./dynamic-dialog manifest subpath and no packages/ng/dynamic-dialog secondary entry-point directory. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. There is no Aura registry key for this family (the Aura preset has no dynamic-dialog or dynamicdialog entry), so no themes relationship is linked. (no Aura registry key).

## Public exports

@ultimate/ng#UDynamicDialog

## Owned source and evidence

packages/ng/src/dynamic-dialog/index.ts
packages/ng/src/dynamic-dialog/dynamic-dialog.ts
packages/ng/src/dynamic-dialog/dynamic-dialog-style.ts

```text
packages/ng/src/dynamic-dialog/dynamic-dialog.ts: export class UDynamicDialog extends UBaseComponent
packages/ng/src/dynamic-dialog/dynamic-dialog.ts: this.dialogService.open$.subscribe((request) => {
packages/ng/src/dynamic-dialog/dynamic-dialog.ts: const subscription = request.ref.requestClose$.subscribe(() => {
packages/ng/src/dynamic-dialog/dynamic-dialog.ts: instance.ref.close();
packages/ng/src/dynamic-dialog/dynamic-dialog-style.ts: export const dynamicDialogStyleModule
packages/ng/src/dynamic-dialog/index.ts: export { UDynamicDialog }
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.dynamic-dialog → [angular.dynamic-dialog](angular.dynamic-dialog.md) (reconciled family alias)
package.ultimate.ng.dialog → [angular.dialog](angular.dialog.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.dialog-service (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the dynamic-dialog family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/dynamic-dialog/*.spec.ts'",
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
