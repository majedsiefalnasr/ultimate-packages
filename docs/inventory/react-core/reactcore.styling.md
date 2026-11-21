# Style sheet and component style hook

ID: reactcore.styling

Framework: react; availability: public

## Authored interpretation

SSR-guarded style sheet instance and a hook that registers theme variables, hidden-accessible, box-model and component CSS on mount.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports reactCoreStyleSheet and useComponentStyle. The sheet creates style elements in document.head and returns undefined when document is unavailable. useComponentStyle registers once on mount and adds component css only if the sheet has no entry for the name. Registered variable and component css are rewritten in place after Theme.setTheme, setPreset and setOptions. useComponentStyle(name, module, unstyled = false) registers only the hidden-accessible rule while unstyled and registers the rest when unstyled turns false.

## Public exports

@ultimate/react-core#reactCoreStyleSheet
@ultimate/react-core#useComponentStyle

## Owned source and evidence

packages/react-core/src/styling/index.ts
packages/react-core/src/styling/react-style-sheet.ts
packages/react-core/src/styling/use-component-style.ts

```text
packages/react-core/src/styling/react-style-sheet.ts: export const reactCoreStyleSheet = new ReactStyleSheet();
packages/react-core/src/styling/use-component-style.ts: export function useComponentStyle(
```

## Relationships

reactcore.hooks
package.ultimate.uix-styled.stylesheet (pending cross-batch)
package.ultimate.uix-styled.helpers (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Style sheet and component style hook is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/react-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-core.json --out docs/inventory/react-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "fb15ca0ee9bc50d3a84b4b19367af0dd192359ac",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 37 source files accounted for, 39 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
