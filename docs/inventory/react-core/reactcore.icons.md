# Base icons

ID: reactcore.icons

Framework: react; availability: public

## Authored interpretation

Small SVG icon components shared by React components.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports USpinnerIcon, UTimesIcon, UWindowMaximizeIcon, UWindowMinimizeIcon, UCheckIcon and the type IconProps (className, label, spin). USpinnerIcon sets role img, aria-label and the u-icon-spin class.

## Public exports

@ultimate/react-core#USpinnerIcon
@ultimate/react-core#UTimesIcon
@ultimate/react-core#UWindowMaximizeIcon
@ultimate/react-core#UWindowMinimizeIcon
@ultimate/react-core#UCheckIcon
@ultimate/react-core#IconProps

## Owned source and evidence

packages/react-core/src/icons/index.ts
packages/react-core/src/icons/check-icon.tsx
packages/react-core/src/icons/spinner-icon.tsx
packages/react-core/src/icons/times-icon.tsx
packages/react-core/src/icons/window-maximize-icon.tsx
packages/react-core/src/icons/window-minimize-icon.tsx

```text
packages/react-core/src/icons/spinner-icon.tsx: export function USpinnerIcon(
packages/react-core/src/icons/check-icon.tsx: export function UCheckIcon(
packages/react-core/src/icons/times-icon.tsx: export function UTimesIcon(
packages/react-core/src/icons/window-maximize-icon.tsx: export function UWindowMaximizeIcon(
packages/react-core/src/icons/window-minimize-icon.tsx: export function UWindowMinimizeIcon(
```

## Relationships

package.ultimate.uix-utils.classnames (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Base icons is present; this record describes the current source without asserting framework parity."
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
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 38 source files accounted for, 46 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
