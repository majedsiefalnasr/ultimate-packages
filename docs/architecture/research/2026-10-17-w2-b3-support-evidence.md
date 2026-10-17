# W2-B3 support evidence: framework ranges and CLI

Date: 2026-10-17
Scope: Workstream 2, Spec B3-R1/B3-R2. Base: `origin/main` f5a0f138.
Status: point-in-time evidence snapshot. No range was changed except Angular (see Conclusion).

## Framework ranges

Sources: `docs/architecture/compatibility-manifest.json`, `packages/{ng,react,vue}/package.json` `peerDependencies`, `pnpm-lock.yaml`, and `CONSUMERS` in `scripts/provenance/installed-cli-mcp-smoke.mjs`.

| Framework | Declared range (manifest / peer)                                                       | Floor   | Versions installed in lockfile                                | Versions installed by smoke                                                                 | Status                                                                                                                                                                                                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | `^21.2.22` / `^21.2.22` (`@angular/core` in `@ultimate/ng`)                            | 21.2.22 | `@angular/core` 21.2.25                                       | `^21.2.22` (resolves at install time to the newest 21.x; the exact version is not recorded) | Manifest equals peer after this change (CI-enforced by `compatibility-manifest:validate`). Floor 21.2.22 declared, not pinned: the lockfile has 21.2.25 and the smoke resolves a caret range. The MCP smoke asks the manifest about the string `21.2.22`, which does not install that version. Declared, unverified at the exact floor |
| React     | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` / same (`react`, `react-dom` in `@ultimate/react`) | 17.0.0  | `react` 18.3.1, `react-dom` 18.3.1                            | `^18.3.1` (18.3.1; MCP asked about `18.3.1`)                                                | Equal. 18 is installed and exercised. 17 and 19 are declared, unverified: no lockfile entry, no smoke consumer                                                                                                                                                                                                                         |
| Vue       | `^3.5.2` / `^3.5.2` (`vue` in `@ultimate/vue`)                                         | 3.5.2   | `vue` 3.5.42 (the `@ultimate/vue` devDependency is `^3.5.13`) | `^3.5.13` (MCP asked about `3.5.13`)                                                        | Equal. 3.5.2 is the ADR-050 floor, declared but never installed by CI: the lockfile has 3.5.42 and the smoke consumer asks for `^3.5.13`. Declared, unverified at the floor                                                                                                                                                            |

Notes:

- The manifest-versus-peer equality is now enforced by `findPeerRangeMismatches` (`docs/architecture/compatibility-peer-ranges.mjs`), run by `docs/architecture/compatibility-manifest.test.mjs` through `pnpm run compatibility-manifest:validate`.
- That check compares strings only. It does not prove that any floor version installs or works.
- PrimeNG 21.1.9 declares `^21.0.7`, which is lower than the published Ultimate peer. The manifest and `COMPATIBILITY.md` do not claim it.

## Conclusion

- B3-R1: the Angular manifest range was `^21.0.7`, below the published peer range `^21.2.22`. It is now `^21.2.22`. CLI and MCP report Angular 21.2.21 as incompatible.
- React `^17 || ^18 || ^19` and Vue `^3.5.2` already equal their peer ranges. No range was changed (Spec B3-R1).
- Floors that CI never installs are recorded as declared, unverified: React 17 and 19, Vue 3.5.2 to 3.5.12, and Angular 21.2.22 to 21.2.24 (lockfile 21.2.25).
- CLI behaviour note: `satisfiesCaretRange` parses only the leading `x.y.z`, so `21.2.22-rc.0` matches `^21.2.22`. Strict semver orders a prerelease below its release. This is pinned as existing behaviour in `packages/cli/test/compatibility.test.ts` and is not changed here.

## CLI evidence (ADR-058 CLI-1 to CLI-6)

Scope: Spec B3-R3. Base: branch `fix/w2-b3-support-cli-evidence` (from `origin/main` f5a0f138, Task 4 at 22eef10e). Research only: no code or CI change.

Sources for the requirement wording: `docs/architecture/DECISIONS.md` ADR-058 (line 501, "CLI bar CLI-1 to CLI-6"), `docs/architecture/research/2026-10-11-cli-quality-and-api-docs-evidence-research.md` (lines 47-52), and `docs/architecture/BLUEPRINT.md` §19 (lines 682-715). EX-1 and EX-2 are the approved exceptions in `docs/architecture/BLUEPRINT_GAPS.md` §10 (lines 2577-2578). They are cited, not re-opened.

Evidence labels follow AGENTS.md §4: Implemented (code read), Verified (run once, passed at that moment), CI-enforced (a `ci.yml` step fails on regression).

| Bar   | Requirement                                                                                                                                                                                                                                                                           | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Status                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| CLI-1 | ADR-058: "unit tests per command and documented error exit". Research record: "Every shipped command has unit tests for its success path and its documented error exits"; evidence "Test files map 1:1 to `src/commands/*.ts`; CI Test step green".                                   | Met part: six command files `packages/cli/src/commands/{add,ai,doctor,generate,init,theme}.ts` map 1:1 to `packages/cli/test/commands/{add,ai,doctor,generate,init,theme}.test.ts`. The CI `Test` step (`.github/workflows/ci.yml:68-70`, `pnpm run test`, root `package.json:12`) runs them; verified locally: 13 files, 76 tests passed. Success and error exits are asserted for `init` (`init.test.ts:64,79,92,158`), `generate` (`generate.test.ts:71,92,125,139`), `ai` (`ai.test.ts:19`). Not evidenced: (a) `doctor` has no `exitCode` assertion in `doctor.test.ts` at all (grep finds none), so neither its success exit 0 (`doctor.ts:158`) nor its no-framework exit 1 (`doctor.ts:112`) is asserted; `cli.test.ts:113-122` asserts exit 0 against a mocked `runDoctor`. (b) `add` no-framework refusal (`add.ts:81-87`) and (c) `theme` no-framework refusal (`theme.ts:122-128`) are uncovered (coverage run: `add.ts` uncovered lines 28-29,81-87; `theme.ts` uncovered lines include 122-128). (d) The error exits are not documented in the README or `--help` (see CLI-6), so "documented error exit" has only the Phase 7 spec as its document. | Missing (partly evidenced; parts a-d above)        |
| CLI-2 | ADR-058: "installed-package smoke tests for the CLI per framework fixture". Research record: pack `@ultimate/cli` and its closure, install into a scratch project per framework (Angular, React, Vue), run `init`, `add`, `theme`, `doctor` and `generate` successfully; "A CI step". | `CONSUMERS` (`scripts/provenance/installed-cli-mcp-smoke.mjs:34`) has Angular, React and Vue consumers. `runSmoke` (`:264`) loops over every consumer and calls `runCliChecks` (`:164`), which runs the installed `ultimate` bin with `init` (`:168`), `add @ultimate/uix-utils` (`:177`), `theme aura` (`:184`), `doctor` (`:194`), `generate Button` (`:201`) and checks exit 0 plus effects. CI step "Installed-package smoke (CLI/MCP)" (`.github/workflows/ci.yml:88-90`, `pnpm run smoke:installed`, `package.json:41`) runs it. Label: Implemented and CI-enforced. The harness was not run in this task, and whether the step has passed on `main` is not claimed here.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Met                                                |
| CLI-3 | ADR-058: "an installed-package smoke test for MCP". Research record: "the server starts over stdio and `check_framework_compatibility` returns a result".                                                                                                                             | `runMcpChecks` (`scripts/provenance/installed-cli-mcp-smoke.mjs:213`) starts the installed `ultimate-mcp` bin over `StdioClientTransport`, asserts initialize, then calls `check_framework_compatibility` (`:231`) for Angular 21.2.22, React 18.3.1 and Vue 3.5.13 (compatible) and React 16.0.0 (incompatible with a manifest-derived reason). `runSmoke` calls it on the React consumer (`:264`). Same CI step as CLI-2 (`ci.yml:88-90`). Label: Implemented and CI-enforced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Met                                                |
| CLI-4 | ADR-058: "every Blueprint §19 duty implemented or an approved exception". Research record: each "must" duty implemented with CLI-1/CLI-2 evidence or recorded as an approved exception.                                                                                               | Duty by duty (`packages/cli/src/commands/`): detect framework, `detectFramework` in `init.ts:93`, `add.ts:79`, `theme.ts:120`, `doctor.ts:100`, `generate.ts:84`; install compatible packages, `installPackage` in `init.ts:128`, `add.ts:111`, `theme.ts:151`; resolve theme, `runTheme` (`theme.ts:112`, writes `theme.ts:95,166`); validate compatibility, `matchCompatibility` in `init.ts:116`, `add.ts:101`, `theme.ts:139`, `doctor.ts:129`; generate code/configuration, `runGenerate` (`generate.ts:83`) and `init.ts:142`; diagnose project state, `runDoctor` (`doctor.ts`). Each is run by the CLI-2 smoke on three frameworks. "Invoke official framework tooling": no `create` command in `cli.ts:9`; EX-1, `BLUEPRINT_GAPS.md:2577`. "Configure optional capabilities": `ai` is a stub (`ai.ts:17-19`, exit 1); EX-2, `BLUEPRINT_GAPS.md:2578`. Neither exception is represented as implemented: README line 9 says so. Caveat: CLI-1 is incomplete for `doctor`, `add` and `theme` error exits, which does not change that each duty's success path has CLI-2 evidence.                                                                            | Met (6 duties); Exception EX-1 and EX-2 (2 duties) |
| CLI-5 | ADR-058: "smoke tests with pnpm and npm at minimum". Research record: "the CLI-2 smoke test runs with pnpm and npm at minimum ('where practical')"; evidence "CI matrix".                                                                                                             | The smoke is pnpm only. Header comment `scripts/provenance/installed-cli-mcp-smoke.mjs:7` says "pnpm only (OQ-1)". Consumers are installed with `pnpm install` (`:111`), and the harness fails if no `pnpm-lock.yaml` exists (`:112-114`) so the CLI does not fall back to npm. The probe uses `pnpm add` (`:127`). No `npm` invocation exists in the script, and the CI step is a single non-matrix step (`ci.yml:88-90`). Unit level only: `install-package.test.ts:57` asserts the `npm install <pkg>` argv with a mocked spawn, and `detect-package-manager.ts:13,33` maps `package-lock.json` and the default to npm. That is not an installed-package smoke with npm.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Missing (npm smoke absent)                         |
| CLI-6 | ADR-058: "`--help` and README list every command, its arguments and exit codes". Research record: "README review plus a test that asserts each command appears in `--help`".                                                                                                          | Ran the built CLI (`node packages/cli/dist/bin.mjs`, Node 24.15.0, in an empty directory). There is no `--help` or `-h`: `ultimate --help` and `-h` print `Unrecognized command "--help". Known commands: init, add, theme, doctor, generate, ai.` plus a usage block, exit 1. `<cmd> --help` is not handled: `init`, `add` and `generate` print their "requires an existing project" refusal, `theme --help` prints `unknown preset "--help"`, `doctor --help` runs the doctor report, `ai --help` prints the stub message; all exit 1. The usage text (`cli.ts:11`) lists command names only: no arguments, no exit codes. `packages/cli/README.md:9` names `init`, `add <package>`, `theme <preset>`, `doctor`, `generate <component>` and the `ai` stub, so commands and arguments are listed, but no exit codes appear in the README or anywhere in `--help`. No test asserts that each command appears in `--help` (`cli.test.ts` has no help case). Captures follow the table.                                                                                                                                                                              | Missing (no `--help`; no exit codes; no test)      |

### Captured `--help` output

Built binary, empty working directory, Node 24.15.0. `ultimate` below is `node packages/cli/dist/bin.mjs`.

```text
$ ultimate --help
Unrecognized command "--help". Known commands: init, add, theme, doctor, generate, ai.

Usage: ultimate <command> [args]

Commands:
  init, add, theme, doctor, generate, ai
[exit 1]

$ ultimate -h        (same text as above, with "-h"; exit 1)
$ ultimate           (usage block only; exit 1)

$ ultimate init --help
init requires an existing, already-scaffolded Angular/React/Vue project (an angular.json or a recognizable framework dependency in package.json). Creating a new project is not supported by init — use `ultimate create` instead.
[exit 1]

$ ultimate add --help
add requires an existing, already-scaffolded Angular/React/Vue project (an angular.json or a recognizable framework dependency in package.json).
[exit 1]

$ ultimate theme --help
theme: unknown preset "--help" - the only valid preset in v1 is "aura".
[exit 1]

$ ultimate doctor --help
Framework: none detected

- Button: missing, unknown
- Checkbox: missing, unknown
... (8 components)
8 of 8 known components reported
[exit 1]

$ ultimate generate --help
generate requires an existing, already-scaffolded Angular/React/Vue project (an angular.json or a recognizable framework dependency in package.json).
[exit 1]

$ ultimate ai --help
ai: not yet available — Phase 9 (AI Skills) is not started.
[exit 1]
```

Observation: the `init` refusal tells the user to "use `ultimate create` instead", but `create` is not a known command (EX-1). That is existing text, noted here and not changed.

### Missing rows

- CLI-1: Missing (partly evidenced). Missing parts: `doctor` exit-code assertions (0 and 1); `add` and `theme` no-framework refusal tests; documentation of the error exits (overlaps CLI-6).
- CLI-5: Missing. Missing part: an installed-package smoke with npm.
- CLI-6: Missing. Missing parts: a `--help` / `-h` implementation, per-command arguments and exit codes in `--help` and the README, and a test asserting each command appears in `--help`.

Stop rule (user-set, binding): CLI-1 and CLI-6 are Missing and are not CLI-5. They need a Plan amendment for Plan Review. Nothing is implemented for them here. Task 6 covers only CLI-5, and only after the amendment question is answered.

CLI-2, CLI-3 and CLI-4 are Met. CLI-4's two exceptions (EX-1 `create`, EX-2 `ai`) are cited from `BLUEPRINT_GAPS.md` §10.
