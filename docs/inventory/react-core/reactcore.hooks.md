# Lifecycle, event, resize and merge-props hooks

ID: reactcore.hooks

Framework: react; availability: public

## Authored interpretation

General-purpose hooks for mount, unmount and update effects, previous value, event and resize listeners, and merging prop sets.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports useMergeProps, useMountEffect, useUnmountEffect, useUpdateEffect, usePrevious, useEventListener, UseEventListenerOptions and useResizeListener. useEventListener returns a [bind, unbind] pair and binds only once; useResizeListener is a window resize wrapper; useMergeProps concatenates className and chains on* handlers.

## Public exports

@ultimate/react-core#useMergeProps
@ultimate/react-core#useMountEffect
@ultimate/react-core#useUnmountEffect
@ultimate/react-core#useUpdateEffect
@ultimate/react-core#usePrevious
@ultimate/react-core#useEventListener
@ultimate/react-core#UseEventListenerOptions
@ultimate/react-core#useResizeListener

## Owned source and evidence

packages/react-core/src/hooks/index.ts
packages/react-core/src/hooks/use-event-listener.ts
packages/react-core/src/hooks/use-merge-props.ts
packages/react-core/src/hooks/use-mount-effect.ts
packages/react-core/src/hooks/use-previous.ts
packages/react-core/src/hooks/use-resize-listener.ts
packages/react-core/src/hooks/use-unmount-effect.ts
packages/react-core/src/hooks/use-update-effect.ts

```text
packages/react-core/src/hooks/use-event-listener.ts: export function useEventListener({
packages/react-core/src/hooks/use-merge-props.ts: export function useMergeProps()
packages/react-core/src/hooks/use-mount-effect.ts: export function useMountEffect(effect: () => void): void {
packages/react-core/src/hooks/use-previous.ts: export function usePrevious<T>(value: T): T | undefined {
packages/react-core/src/hooks/use-update-effect.ts: export function useUpdateEffect(effect: () => void, deps: unknown[]): void {
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Lifecycle, event, resize and merge-props hooks is present; this record describes the current source without asserting framework parity."
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
    "revision": "2b9a684df33d0e7dc1e2120eb6ca981fd2865932",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 56 source files accounted for, 46 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
