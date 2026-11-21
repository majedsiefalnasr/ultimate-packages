# Style sheet and component style registration

ID: vuecore.styling

Framework: vue; availability: public

## Authored interpretation

SSR-guarded style sheet instance and a function that registers theme variables, hidden-accessible, icon spin, box-model and component CSS.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports vueCoreStyleSheet and registerComponentStyle(componentName, styleModule, additionalPresetKeys?). Style elements are created in document.head with a data-u-style attribute and return undefined without a document. Registered variable and component css are rewritten in place after Theme.setTheme, setPreset and setOptions. With cssLayer on, the layer-order statement is placed first in document.head (ticket #173, F6).

## Public exports

@ultimate/vue-core#vueCoreStyleSheet
@ultimate/vue-core#registerComponentStyle

## Owned source and evidence

packages/vue-core/src/styling/index.ts
packages/vue-core/src/styling/vue-style-sheet.ts

```text
packages/vue-core/src/styling/vue-style-sheet.ts: export const vueCoreStyleSheet = new VueStyleSheet();
packages/vue-core/src/styling/vue-style-sheet.ts: export function registerComponentStyle(
```

## Relationships

package.ultimate.uix-styled.stylesheet (pending cross-batch)
package.ultimate.uix-styled.helpers (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Style sheet and component style registration is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/vue-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-core.json --out docs/inventory/vue-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 35 source files accounted for, 53 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
