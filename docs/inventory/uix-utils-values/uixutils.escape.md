# UIX Escape and display-order registries

ID: uixutils.escape

Framework: shared; availability: public

## Authored interpretation

Coordinate global Escape handling by priority and track display order within named groups.

## Framework surface

See [authored signatures and interpretation](README.md). Exports ESCAPE_PRIORITIES; EscapeRegistry/createEscapeRegistry/escapeRegistry; EscapeListener; and DisplayOrderRegistry/createDisplayOrderRegistry/displayOrderRegistry. EscapeRegistry registers and unregisters primary/secondary numeric priorities; an Escape key invokes only the callback with the greatest primary and then greatest secondary value. The document keydown listener is guarded and installed only while handlers exist. DisplayOrderRegistry records number IDs by group. Constants are SIDEBAR 100, DIALOG 300, IMAGE 400, MENU 500, OVERLAY_PANEL 600, TOOLTIP 1200. Root and ./escape mappings are source/configuration evidence; no blanket SSR guarantee is claimed.

## Public exports

@ultimate/uix-utils#DisplayOrderRegistry
@ultimate/uix-utils#ESCAPE_PRIORITIES
@ultimate/uix-utils#EscapeListener
@ultimate/uix-utils#EscapeRegistry
@ultimate/uix-utils#createDisplayOrderRegistry
@ultimate/uix-utils#createEscapeRegistry
@ultimate/uix-utils#displayOrderRegistry
@ultimate/uix-utils#escapeRegistry
@ultimate/uix-utils/escape#DisplayOrderRegistry
@ultimate/uix-utils/escape#ESCAPE_PRIORITIES
@ultimate/uix-utils/escape#EscapeListener
@ultimate/uix-utils/escape#EscapeRegistry
@ultimate/uix-utils/escape#createDisplayOrderRegistry
@ultimate/uix-utils/escape#createEscapeRegistry
@ultimate/uix-utils/escape#displayOrderRegistry
@ultimate/uix-utils/escape#escapeRegistry

## Owned source and evidence

packages/uix-utils/src/escape/display-order-registry.ts
packages/uix-utils/src/escape/index.ts
packages/uix-utils/src/escape/priorities.ts
packages/uix-utils/src/escape/registry.ts

```text
packages/uix-utils/src/escape/index.ts: export { ESCAPE_PRIORITIES } from "./priorities";
packages/uix-utils/src/index.ts: export * from "./escape";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/react-core/src/escape/use-global-escape-key.ts: import { escapeRegistry } from "@ultimate/uix-utils/escape";
packages/vue-core/src/escape/use-display-order.ts: import { displayOrderRegistry } from "@ultimate/uix-utils/escape";
packages/uix-utils/src/escape/priorities.ts: TOOLTIP: 1200
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX Escape and display-order registries is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/uix-utils-values.json --out docs/inventory/uix-utils-values (run twice; authored README SHA-256 checked before and after)",
    "revision": "7a06beb32487f04ccd84a765f7722ac606825c74",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 55 source files, 64 named symbols, 128 root/subpath export identities, 8 records, no problems; the authored README SHA-256 was unchanged. The #143 DOM relationship remains in the pending cross-scope ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; the #143 cross-scope relationship remains pending in the pilot, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/uix-utils-values/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash. The cross-scope #143 relationship is transparently retained in the pending ledger."
  }
]
```
