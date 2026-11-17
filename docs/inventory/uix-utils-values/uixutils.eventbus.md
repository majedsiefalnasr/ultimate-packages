# UIX event bus

ID: uixutils.eventbus

Framework: shared; availability: public

## Authored interpretation

Provide a small per-instance synchronous event bus with subscribe, unsubscribe, emit, and clear operations.

## Framework surface

See [authored signatures and interpretation](README.md). Handler = (evt: unknown) => void. EventBusOptions declares on(type: string, handler: Handler): void; off(type: string, handler: Handler): void; emit(type: string, evt?: unknown): void; clear(): void. EventBus(): EventBusOptions stores handlers in a per-instance Map and invokes emit handlers synchronously. Runtime on/off return this although the public interface declares void. No direct DOM dependency is present. Root and ./eventbus availability is supported by source barrels and package configuration, not an installed-package resolution test.

## Public exports

@ultimate/uix-utils#EventBus
@ultimate/uix-utils#EventBusOptions
@ultimate/uix-utils#Handler
@ultimate/uix-utils/eventbus#EventBus
@ultimate/uix-utils/eventbus#EventBusOptions
@ultimate/uix-utils/eventbus#Handler

## Owned source and evidence

packages/uix-utils/src/eventbus/index.ts

```text
packages/uix-utils/src/eventbus/index.ts: export type Handler = (evt: unknown) => void;
packages/uix-utils/src/index.ts: export * from "./eventbus";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/uix-styled/src/service/index.ts: import { EventBus } from "@ultimate/uix-utils/eventbus";
packages/vue-core/src/service/toast-service.ts: import { EventBus } from "@ultimate/uix-utils/eventbus";
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX event bus is present; this record describes the current source without asserting framework parity."
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
