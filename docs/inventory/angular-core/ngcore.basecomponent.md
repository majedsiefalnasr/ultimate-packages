# Base component directive

ID: ngcore.basecomponent

Framework: angular; availability: public

## Authored interpretation

Abstract directive base that every Angular component inherits for theme style registration, class composition and the dt and unstyled inputs.

## Framework surface

See [authored signatures and interpretation](README.md). Root export UBaseComponent only; basecomponent/index.ts forwards that single class. style-sheet.ts also declares NG_CORE_STYLE_KEY_ATTR, ngCoreStyleSheetFor and ngCoreStyleSheet, which the module barrel does not re-export, so they are source-only helpers. Dependency: @ultimate/uix-styled and @ultimate/uix-utils. ngOnInit registers its component css through registerComponentCss, so registered variable and component css follow Theme.setTheme, setPreset and setOptions. With cssLayer on, its style sheet places the layer-order statement first in the injected document's head (ticket #173, F6).

## Public exports

@ultimate/ng-core#UBaseComponent

## Owned source and evidence

packages/ng-core/src/basecomponent/index.ts
packages/ng-core/src/basecomponent/base-component.ts
packages/ng-core/src/basecomponent/style-sheet.ts

```text
packages/ng-core/src/basecomponent/base-component.ts: export abstract class UBaseComponent {
packages/ng-core/src/basecomponent/style-sheet.ts: export function ngCoreStyleSheetFor(doc: Document | undefined): StyleSheet<HTMLStyleElement> {
packages/ng-core/src/basecomponent/index.ts: export { UBaseComponent } from "./base-component";
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
    "revision": "b93f4d6708ab4a00da820df86124a4e8a30687b0",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 38 source files accounted for, 26 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
