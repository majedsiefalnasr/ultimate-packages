# Component schema — ticket #152

This is a bounded, source-backed inventory of `@ultimate/component-schema`: the product component metadata contract (identity, API, accessibility, style, relationship, provenance and guidance types), the schema version, the metadata version helper and the validator with its result type. It is the product metadata schema and is distinct from the inventory schema in `scripts/inventory/pilot-schema.json`. It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `0fa34369fc5b6f0a424f932d91ef6b560a294236`; the structured input and generated views account for 12 source files under `packages/component-schema/src`, 15 named root export identities and 5 records. `packages/component-schema/test` lies outside the inventoried roots. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/component-schema.json).

## Package availability

The package declares a single `"."` export (types, import and default point at `./dist/index.*`) built by tsup from `src/index.ts`; there are no subpaths and `sideEffects` is `false`. The barrel record `schema.root` owns no export identities and is `internal`. Installed or published package resolution was not exercised.

## Interface summary

- Version (`schema.version`): `SCHEMA_VERSION` (`"1.0.0"`) and `nextMetadataVersion(current, next): number`, which increments by one only when content other than `metadataVersion` and `schemaVersion` changed.
- Contract (`schema.contract`): `ComponentIdentity`, `PropFact`, `EventFact`, `FrameworkApi`, `ComponentApi`, `AccessibilityFacts`, `StyleIdentity`, `Relationships`, `ProvenanceRef`, `Guidance`, `ComponentMetadata`. Types only.
- Validator (`schema.validate`): `validateComponentMetadata(record, allRecords): ValidationResult` and the `ValidationResult` union.

## Source observations retained without repair

- `nextMetadataVersion` compares `JSON.stringify` output, so differing key order in otherwise equal content counts as a change.
- `validateComponentMetadata` requires `schemaVersion` to equal `SCHEMA_VERSION` exactly; there is no range or compatibility policy.
- The validator reads `docs/architecture/provenance/<package>.json` with `node:fs` relative to the module location, so provenance checks depend on the repository layout and a Node runtime.
- `ProvenanceRef.package` admits `uix-styles`, which is not a key of `ComponentIdentity.packages`.

## Relationships

Registry records that consume this schema (#153, `package.ultimate.component-metadata.records`) are recorded in the pending ledger. The validator's dependency on the provenance JSON files under `docs/architecture/provenance` is documentation data, not an inventoried package. Prime-related references, where present, are neutral.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/component-schema.json --out docs/inventory/component-schema`.
- Product behavior and type tests were not run, per the documentation-only scope. Test files exist under `packages/component-schema/test`, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
