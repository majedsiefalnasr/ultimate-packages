# Component metadata contract types

ID: schema.contract

Framework: shared; availability: public

## Authored interpretation

Type-only description of product component metadata: identity, per-framework API facts, accessibility, style, relationships, provenance reference and guidance.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports the types ComponentIdentity, PropFact, EventFact, FrameworkApi, ComponentApi, AccessibilityFacts, StyleIdentity, Relationships, ProvenanceRef, Guidance and ComponentMetadata. ComponentMetadata = ComponentIdentity & { api?, accessibility?, style?, relationships?, provenanceRef?, guidance? }. Identity carries name, category, description, schemaVersion, metadataVersion and packages for ng, react and vue (packageName, sourcePath). EventFact.mechanism is "output" | "callback-prop" | "emit". ProvenanceRef.package is "ng" | "react" | "vue" | "uix-styles". These are product component metadata types, distinct from the inventory schema in scripts/inventory/pilot-schema.json.

## Public exports

@ultimate/component-schema#ComponentIdentity
@ultimate/component-schema#PropFact
@ultimate/component-schema#EventFact
@ultimate/component-schema#FrameworkApi
@ultimate/component-schema#ComponentApi
@ultimate/component-schema#AccessibilityFacts
@ultimate/component-schema#StyleIdentity
@ultimate/component-schema#Relationships
@ultimate/component-schema#ProvenanceRef
@ultimate/component-schema#Guidance
@ultimate/component-schema#ComponentMetadata

## Owned source and evidence

packages/component-schema/src/identity.ts
packages/component-schema/src/api.ts
packages/component-schema/src/accessibility.ts
packages/component-schema/src/style.ts
packages/component-schema/src/relationships.ts
packages/component-schema/src/provenance-ref.ts
packages/component-schema/src/guidance.ts
packages/component-schema/src/component-metadata.ts

```text
packages/component-schema/src/identity.ts: export interface ComponentIdentity {
packages/component-schema/src/api.ts: export interface PropFact {
packages/component-schema/src/api.ts: export interface EventFact {
packages/component-schema/src/api.ts: export interface FrameworkApi {
packages/component-schema/src/api.ts: export interface ComponentApi {
packages/component-schema/src/accessibility.ts: export interface AccessibilityFacts {
packages/component-schema/src/style.ts: export interface StyleIdentity {
packages/component-schema/src/relationships.ts: export interface Relationships {
packages/component-schema/src/provenance-ref.ts: export interface ProvenanceRef {
packages/component-schema/src/guidance.ts: export interface Guidance {
packages/component-schema/src/component-metadata.ts: export type ComponentMetadata = ComponentIdentity & {
```

## Relationships

schema.validate
schema.version

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Component metadata contract types is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/component-schema/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/component-schema.json --out docs/inventory/component-schema (run twice; authored README SHA-256 checked before and after)",
    "revision": "0fa34369fc5b6f0a424f932d91ef6b560a294236",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 12 source files accounted for, 15 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/component-schema/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
