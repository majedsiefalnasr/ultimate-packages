# MCP — ticket #155

This is a bounded, source-backed inventory of `@ultimate/mcp`: MCP server creation, the stdio binary, the five tools `search_components`, `get_component`, `get_component_api`, `get_component_accessibility` and `check_framework_compatibility`, the exported helpers, types and errors, and the manifest reader. It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `642e7e27996c29dc6cca009f93a84e76ee74c9b8`; the structured input and generated views account for 12 files under `packages/mcp/src` and `packages/mcp/scripts`, 24 root export identities and 10 records, plus 1 explicit file disposition. `packages/mcp/test`, `tsup.config.ts`, `README.md` and the on-disk `coverage/` output lie outside the inventoried roots. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/mcp.json).

## Package availability

The package declares one `"."` export pointing at `./dist/index.*` and a bin `ultimate-mcp` pointing at `./dist/bin.mjs`. Unlike the CLI, the root barrel is populated: it exports `createMcpServer`, the five tool functions with their input and result types, `readCompatibilityManifest`, `CompatibilityManifestEntry`, the `McpToolError` type and five error constructors. `COMPATIBILITY_MANIFEST_PATH` is source-only. The stdio binary starts the server and is not a library export. The build script copies the compatibility manifest into `dist/`. Installed or published package resolution and a running stdio server were not exercised.

## Interface summary

- Server (`mcp.server`): `createMcpServer(): McpServer` registers the five tools with zod input schemas; handlers are wrapped so a result carrying `code` becomes an `isError` response and thrown exceptions become a generic `internal_error`.
- Binary (`mcp.bin`): the only stdio transport user; stdout is reserved for the protocol, diagnostics go to stderr.
- Tools: search by substring, full record with optional framework narrowing, per-framework props and events, accessibility facts, and single-axis framework-version compatibility.
- Errors (`mcp.errors`): `invalid_input`, `not_found`, `manifest_unreadable`, `facet_not_recorded`, `internal_error`.
- Manifest (`mcp.manifest`): reads only `framework` and `frameworkVersionRange`; fails closed with `manifest_unreadable`.

## Source observations retained without repair

- Argument vocabulary is not uniform: four tools take `ng`, `react`, `vue`, while `check_framework_compatibility` takes `angular`, `react`, `vue`.
- `check_framework_compatibility` evaluates only `frameworkVersionRange`; it is not a multi-axis compatibility verdict, and its range matcher is a private copy of the CLI matcher logic.
- Only the Table record in the metadata registry declares accessibility facts, so `get_component_accessibility` returns `facet_not_recorded` for the other seven components.
- All component tools are limited to the eight records in the metadata registry.
- The server version string is hard-coded as `0.1.0` in `src/server.ts` rather than read from `package.json`.
- The zod schemas in the server reject malformed arguments before a handler runs, so the handlers' own `invalid_input` branches are reachable only through direct import of the tool functions.
- Product defects, if any, were not searched for and are not repaired here.

## Relationships

The component tools read `ALL_COMPONENTS` from `@ultimate/component-metadata` (#153) and use types from `@ultimate/component-schema` (#152); these are recorded as pending cross-scope references. The manifest reader is independent of `@ultimate/cli` by design. Prime-related references are neutral and absent here.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/mcp.json --out docs/inventory/mcp`.
- Product build, typecheck and tests were not run, per the documentation-only scope. Test files exist under `packages/mcp/test` and a `coverage/` directory is on disk, but neither is evidence of a current passing result. No product code was changed.
- `.github/workflows/ci.yml` runs lint and format checks on documentation-only changes; build, typecheck, tests and the installed-package smoke step (CLI and MCP) are skipped there. An MCP boundary validation step has no docs-only condition but was not executed for this inventory. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
