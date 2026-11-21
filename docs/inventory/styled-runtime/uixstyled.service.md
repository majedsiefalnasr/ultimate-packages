# Theme service

ID: uixstyled.service

Framework: shared; availability: public

## Authored interpretation

Event bus instance used to broadcast theme, preset, options and style-load changes.

## Framework surface

See [authored signatures and interpretation](README.md). Default export ThemeService (re-exported as the named root export ThemeService) is an EventBus() instance from @ultimate/uix-utils/eventbus; its on/off/emit surface is owned by the UIX event bus record.

## Public exports

@ultimate/uix-styled#ThemeService

## Owned source and evidence

packages/uix-styled/src/service/index.ts

```text
packages/uix-styled/src/service/index.ts: const ThemeService = EventBus();
packages/uix-styled/src/index.ts: export { default as ThemeService } from "./service/index";
```

## Relationships

package.ultimate.uix-utils.eventbus (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Theme service is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed. Existing package tests under packages/uix-styled/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/styled-runtime.json --out docs/inventory/styled-runtime (run twice; authored README SHA-256 checked before and after)",
    "revision": "fb15ca0ee9bc50d3a84b4b19367af0dd192359ac",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 27 source files, 58 named symbols, 58 root export identities, 8 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
