# Shared component styles — ticket #146

This is a bounded, source-backed inventory of `@ultimate/uix-styles`: the shared `base` CSS, the shared `StyleType` alias, and the avatar, badge, button, checkbox, chip, dialog, floatlabel, iconfield, iftalabel, inputgroup, inputnumber, inputtext, menu, paginator, table, textarea, tooltip and virtualscroller style modules. It describes current source and package configuration only. It makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `54f81ae85b0cfe3583541471bd4114fe8d8d7bac`, with the avatar module added for ticket #201; the structured input and generated views account for 15 source files under `packages/uix-styles/src` (test files are outside the inventoried root), 15 named export identities and 14 records. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/shared-component-styles.json).

## Package availability and subpath reconciliation

`packages/uix-styles/package.json` declares 20 exports: the root plus `./avatar`, `./base`, `./badge`, `./button`, `./checkbox`, `./chip`, `./dialog`, `./floatlabel`, `./iconfield`, `./iftalabel`, `./inputgroup`, `./inputnumber`, `./inputtext`, `./menu`, `./paginator`, `./table`, `./textarea`, `./tooltip` and `./virtualscroller`. `packages/uix-styles/tsup.config.ts` builds `src/index.ts` plus one entry per directory found under `src` (discovered with `readdirSync`), which yields the same 18 subpath entries. The two sets agree at the inspected revision. The inventory input maps the root and every subpath explicitly, so root-only discovery is not relied on. Installed or published package resolution was not exercised.

The package root re-exports only `base` (the `base` module's `style`) and `StyleType`. No component style is available from the root; each is reachable only through its subpath.

## Style modules

Every module exports one named string constant, `style`, a `/*css*/` template with embedded `dt('...')` design-token placeholders and no imports or runtime logic. Component modules use `.u-<name>*` selectors; `base` keeps upstream-style `.p-*` selectors. `inputnumber` also references the shared `.p-floatlabel` selector. The `table` module uses the `datatable.*` token namespace, so the module name and token namespace differ in source. The `virtualscroller` module contains only the loader selectors. The `button` module is the largest; shared UIX button CSS is also named by earlier Angular, React and Vue action inventories, while this record owns the style module itself.

## Types and runtime

`StyleType` is a type contract (`export type StyleType = string;`) with no runtime value; no module in this package currently imports it. Every `style` constant is a runtime string value. Resolution of the `dt()` placeholders belongs to the styled runtime inventoried in #145 and is kept in the pending ledger because the pilot resolves references within one input.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/shared-component-styles.json --out docs/inventory/shared-component-styles`.
- Product behavior and snapshot tests were not run, per the documentation-only scope. Test files exist under `packages/uix-styles/test`, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
