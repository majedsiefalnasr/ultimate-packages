# Base component directive

ID: ngcore.basecomponent

Framework: angular; availability: public

## Authored interpretation

Abstract directive base that every Angular component inherits for theme style registration, class composition, the dt and unstyled inputs and the pt and ptOptions passthrough inputs.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports UBaseComponent, U_PARENT_INSTANCE, getPassThroughValue and the passthrough types; basecomponent/index.ts forwards them. style-sheet.ts also declares NG_CORE_STYLE_KEY_ATTR, ngCoreStyleSheetFor and ngCoreStyleSheet, which the module barrel does not re-export, so they are source-only helpers. Dependency: @ultimate/uix-styled and @ultimate/uix-utils. ngOnInit registers its component css through registerComponentCss, so registered variable and component css follow Theme.setTheme, setPreset and setOptions. The pt and ptOptions inputs, $parentInstance, $pt, $params, ptm, ptms and ptmo resolve passthrough attributes for a template section through getPassThroughValue in passthrough.ts (ADR-077); a component that renders other UBaseComponents provides itself under U_PARENT_INSTANCE (ADR-079). The global and default pt sources, usePassThrough, pt.hooks, the hostName input and the $attrSelector dataset are not implemented (ADR-080), so ptOptions has no visible effect yet.

## Public exports

@ultimate/ng-core#UBaseComponent
@ultimate/ng-core#U_PARENT_INSTANCE
@ultimate/ng-core#getPassThroughValue
@ultimate/ng-core#PassThrough
@ultimate/ng-core#PassThroughAttributes
@ultimate/ng-core#PassThroughContext
@ultimate/ng-core#PassThroughOptions
@ultimate/ng-core#PassThroughParams

## Owned source and evidence

packages/ng-core/src/basecomponent/index.ts
packages/ng-core/src/basecomponent/passthrough.ts
packages/ng-core/src/basecomponent/parent-instance.token.ts
packages/ng-core/src/basecomponent/base-component.ts
packages/ng-core/src/basecomponent/style-sheet.ts

```text
packages/ng-core/src/basecomponent/base-component.ts: export abstract class UBaseComponent<PT = Record<string, unknown>> {
packages/ng-core/src/basecomponent/style-sheet.ts: export function ngCoreStyleSheetFor(doc: Document | undefined): StyleSheet<HTMLStyleElement> {
packages/ng-core/src/basecomponent/index.ts: export { UBaseComponent } from "./base-component";
packages/ng-core/src/basecomponent/passthrough.ts: export function getPassThroughValue(
packages/ng-core/src/basecomponent/parent-instance.token.ts: export const U_PARENT_INSTANCE
```

## Relationships

ngcore.config
package.ultimate.uix-styled.stylesheet (pending cross-batch)
package.ultimate.uix-styled.service (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Base component directive is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/ng-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-core.json --out docs/inventory/angular-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 40 source files accounted for, 33 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
