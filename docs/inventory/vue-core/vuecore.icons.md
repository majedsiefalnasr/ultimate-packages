# Base icons

ID: vuecore.icons

Framework: vue; availability: public

## Authored interpretation

Small SVG icon components shared by Vue components.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports SpinnerIcon, TimesIcon, WindowMaximizeIcon, WindowMinimizeIcon, CheckIcon, MinusIcon and the type IconProps (class, label, spin). Icon components are named with a U prefix at registration (for example USpinnerIcon) but exported without it.

## Public exports

@ultimate/vue-core#SpinnerIcon
@ultimate/vue-core#IconProps
@ultimate/vue-core#TimesIcon
@ultimate/vue-core#WindowMaximizeIcon
@ultimate/vue-core#WindowMinimizeIcon
@ultimate/vue-core#CheckIcon
@ultimate/vue-core#MinusIcon

## Owned source and evidence

packages/vue-core/src/icons/index.ts
packages/vue-core/src/icons/check-icon.ts
packages/vue-core/src/icons/minus-icon.ts
packages/vue-core/src/icons/spinner-icon.ts
packages/vue-core/src/icons/times-icon.ts
packages/vue-core/src/icons/window-maximize-icon.ts
packages/vue-core/src/icons/window-minimize-icon.ts

```text
packages/vue-core/src/icons/spinner-icon.ts: export const SpinnerIcon = defineComponent({
packages/vue-core/src/icons/check-icon.ts: export const CheckIcon
packages/vue-core/src/icons/minus-icon.ts: export const MinusIcon = defineComponent({
packages/vue-core/src/icons/times-icon.ts: export const TimesIcon
packages/vue-core/src/icons/window-maximize-icon.ts: export const WindowMaximizeIcon
packages/vue-core/src/icons/window-minimize-icon.ts: export const WindowMinimizeIcon
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Base icons is present; this record describes the current source without asserting framework parity."
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
