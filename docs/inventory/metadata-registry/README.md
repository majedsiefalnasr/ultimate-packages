# Metadata registry — ticket #153

This is a bounded, source-backed inventory of `@ultimate/component-metadata`: the registry of populated product component metadata records (Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip) and its validation, API drift, source mapping, exclusion, docs generation and coverage tooling. The proof set is not expanded, and the records are treated as a hand-maintained description of source rather than as superior to it. It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `e60b2f03cdcfdbd8bf6cdb999a346858ad619718`; the structured input and generated views account for 16 source files under `packages/component-metadata/src` and `packages/component-metadata/scripts`, 1 named root export identity and 13 records, plus 1 explicit file disposition. `packages/component-metadata/test` lies outside the inventoried roots. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/metadata-registry.json).

## Package availability

The package declares a single `"."` export (types, import and default point at `./dist/index.*`) built by tsup from `src/index.ts`; there are no subpaths and `sideEffects` is `false`. The only root export identity is `ALL_COMPONENTS` (`ComponentMetadata[]`, owned by `metadata.root`). The eight record constants and every script export are not reachable from the package root. The scripts are wired as package scripts `validate`, `drift:check`, `docs:generate` and `coverage:report`. Installed or published package resolution was not exercised.

## Interface summary

- Registry (`metadata.root`): `ALL_COMPONENTS`, ordered Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip.
- Records (`metadata.button` … `metadata.tooltip`): one `<NAME>_METADATA: ComponentMetadata` constant each, internal to the package, with Angular, React and Vue API facts. Categories: Button Primitive, Checkbox Form, Dialog and Tooltip Overlay, Menu Navigation, Paginator, Scroller and Table Data.
- Validation (`metadata.validate`): runs `validateComponentMetadata` for every record against the built `dist` output.
- Drift (`metadata.drift`): extracts framework source names, compares them with records, applies `scripts/source-map.json` and the three entries of `scripts/drift-exclusions.json` (Dialog vue `after-hide`, Scroller react `contentTemplate`, Table vue `update:selection`).
- Docs generation (`metadata.docs`) and coverage tooling (`metadata.coverage`): see the generated records.
- `scripts/rename-dts.mjs` is an explicit disposition (build tooling).

## Source observations retained without repair

- `scripts/validate-all.mjs` imports from `../dist/index.mjs`, so validation needs a prior build and cannot run against source alone.
- Drift detection compares names only; types, defaults and descriptions in records are not checked against source.
- Three framework API items are deliberately unmodeled and recorded as exclusions rather than modeled.
- Record files carry long header comments asserting ground truth from framework sources; those comments are not evidence and were not re-verified here.
- The registry depends on `@ultimate/component-schema` at runtime for the version constant and at build time for types.

## Relationships

The schema contract and validator come from `@ultimate/component-schema` (#152, `package.ultimate.component-schema.root`), referenced by identity. Record source maps point at framework packages (`packages/ng`, `packages/react`, `packages/vue`); those components belong to other inventories. Prime-related references, where present, are neutral.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/metadata-registry.json --out docs/inventory/metadata-registry`.
- Product behavior, validate, drift, docs and coverage scripts were not run, per the documentation-only scope. Test files exist under `packages/component-metadata/test`, but their presence is not a result. No product code was changed.
- The workflow `.github/workflows/ci.yml` contains steps for the drift check, API docs check and coverage report, but they are skipped on the documentation-only path, so no execution is claimed. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
