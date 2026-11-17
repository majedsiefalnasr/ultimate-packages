# CLI — ticket #154

This is a bounded, source-backed inventory of `@ultimate/cli`: the `ultimate` binary, its command dispatch and help, the `init`, `add`, `theme`, `doctor`, `generate` and `ai` commands, framework and package-manager detection, compatibility matching and package installation. It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `bad6cc52abbeaa74c357dfcdc0a5a4338c781a86`; the structured input and generated views account for 16 files under `packages/cli/src` and `packages/cli/scripts`, 0 root export identities and 13 records, plus 1 explicit file disposition. `packages/cli/test`, `tsup.config.ts`, `README.md` and the on-disk `coverage/` output lie outside the inventoried roots. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/cli.json).

## Package availability

The package declares one `"."` export (types, import and default point at `./dist/index.*`) and a bin `ultimate` pointing at `./dist/bin.mjs`; `sideEffects` is `false`. `src/index.ts` is an empty barrel (`export {};`), so the library entry exposes no runtime or type identity and `cli.root` is availability internal with no exports. The commands are reachable only through the binary (built by tsup as a separate bundle with a node shebang) or by deep source import. The build script also copies the compatibility manifest into `dist/`. Installed or published package resolution and the built binary were not exercised.

## Interface summary

- Binary and dispatch (`cli.bin`, `cli.dispatch`): `runCli(argv, projectDir = process.cwd()): Promise<number>`; only `bin.ts` calls `process.exit`. Positional arguments only; `--help`/`-h` is honored globally or directly after a known command.
- Help (`cli.help`): `KNOWN_COMMANDS`, `EXIT_CODES`, `COMMAND_USAGE`, `renderHelp`. `create` (EX-1) and `ai` (EX-2) are documented exceptions.
- Detection (`cli.detection`): framework order @angular/core, react, vue; package manager order pnpm, yarn, npm with npm as default.
- Compatibility (`cli.compatibility`): hand-rolled caret, `||` and exact range matching; unsupported grammar fails closed; the manifest is read only from the package's own `dist/`.
- Install (`cli.install`): the only module that spawns a package manager, with array-form arguments.
- Commands (`cli.init`, `cli.add`, `cli.theme`, `cli.doctor`, `cli.generate`, `cli.ai`): see each generated record.

## Source observations retained without repair

- The empty library barrel is distinct from the implemented commands: the commands exist and work through the binary, but nothing is importable from `@ultimate/cli`.
- `generate` is metadata-limited: it only knows the eight records in the metadata registry, refuses every other component and writes no file.
- `ai` is a stub that always prints an unavailable message to stderr and exits 1; it does not call the AI tooling package.
- `add` installs any caller-named package verbatim; the compatibility check does not depend on the package name.
- `init`'s refusal message points users to `ultimate create`, which is not implemented and exits 1 as an unknown command.
- `doctor` stamps one project-level compatibility verdict on every component row; there is no per-component compatibility check.
- `findUp`, `toPlainVersion`, `readCliVersion` and `readManifest` are copied privately into each command file.
- Product defects, if any, were not searched for and are not repaired here.

## Relationships

`doctor` and `generate` consume `ALL_COMPONENTS` from `@ultimate/component-metadata` (#153) and `ComponentMetadata` from `@ultimate/component-schema` (#152); `theme` installs and references `@ultimate/themes` (#151); the `ai` stub message refers to the AI tooling package (#156). These are recorded as pending cross-scope references. Prime-related references are neutral and absent here.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/cli.json --out docs/inventory/cli`.
- Product build, typecheck and tests were not run, per the documentation-only scope. Test files exist under `packages/cli/test` and a `coverage/` directory is on disk, but neither is evidence of a current passing result. No product code was changed.
- `.github/workflows/ci.yml` runs lint and format checks on documentation-only changes; build, typecheck, tests and the installed-package smoke step are skipped there. A CLI boundary validation step has no docs-only condition but was not executed for this inventory. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
