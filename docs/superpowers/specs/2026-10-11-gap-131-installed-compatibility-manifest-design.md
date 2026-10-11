# GAP-131 — Installed CLI and MCP packages resolve the compatibility manifest

**Date:** 2026-10-11
**Status:** APPROVED (user, 2026-10-11), with Spec Review findings SR-1 to SR-7 applied and OQ-1 to OQ-3 resolved by the user (§9, §11). Next gate: the Plan and Plan Review. No implementation before Plan approval.
**Authority:** ADR-058 (CLI quality bar CLI-1 to CLI-6; GAP-131 "must be resolved before the CLI or MCP packages are published to consumers"; installed-package CLI and MCP smoke tests are required evidence); GAP-131 (`docs/architecture/BLUEPRINT_GAPS.md`); [CLI/API-docs research](../../architecture/research/2026-10-11-cli-quality-and-api-docs-evidence-research.md) CLI-F1; [Final Project Completion Assessment](../../architecture/research/2026-10-11-final-project-completion-assessment.md) (S-1 first pre-1.0 publish; D-40).
**Governing earlier Specs:** [Phase 7 CLI](2026-09-07-phase-7-cli-design.md) §6.4 (manifest ownership, location, consumer); [Phase 8 MCP](2026-09-07-phase-8-mcp-design.md) (MCP reads the manifest independently; structured error when it is missing, invalid or malformed).
**Baseline:** `main` `9baf086` (PR #2 merged: ADR-053 to ADR-058, GAP-131 registered). Drafted against `99364dc`; no Spec content depends on the difference.

## 1. Problem (code-inspection evidence; not yet reproduced)

GAP-131 records, from code inspection only:

- `@ultimate/cli`: `add`, `init`, `theme` and `doctor` each build `MANIFEST_PATH = join(CLI_PACKAGE_ROOT, "..", "..", "docs", "architecture", "compatibility-manifest.json")` (for example `packages/cli/src/commands/add.ts:33–41`). `CLI_PACKAGE_ROOT` is the nearest `package.json` above the running module.
- `@ultimate/mcp`: `src/manifest-path.ts` sets `REPO_ROOT = join(__dirname, "..", "..", "..")` and reads `<REPO_ROOT>/docs/architecture/compatibility-manifest.json`.
- Both packages publish `files: ["dist", "README.md"]`, so an installed copy contains no manifest. In an installed package the CLI path resolves to a `docs/architecture/` directory two levels above the package root (for example `node_modules/docs/…`, or a path inside pnpm's `.pnpm` store once symlinks are resolved), which does not exist.
- The CI pack/install integrity check packs, installs and asserts files exist; it never runs a published binary.

**Expected but unobserved impact:** in an installed package, `init`, `add`, `theme` and `doctor` fail to read the manifest, and MCP's `check_framework_compatibility` returns its manifest-unreadable error. This Spec requires that impact to be **reproduced first** (§6.1) before the fix is applied.

## 2. Goal and scope

1. Installed `@ultimate/cli` and `@ultimate/mcp` packages read the compatibility manifest from their own distribution.
2. Installed-package smoke tests (ADR-058 CLI-2 and CLI-3) prove it in CI by running the published binaries.

## 3. Non-goals

- The rest of the ADR-058 CLI bar: CLI-1 (per-command error-exit tests), CLI-4 (§19 duties; `create`/`ai` are register exceptions EX-1/EX-2), CLI-6 (`--help`/README). Observed and **not** fixed here: `packages/cli` lists `README.md` in `files` but has no `README.md` (a CLI-6 item).
- CLI-5 under npm (OQ-1, resolved). This Spec runs the smoke tests with pnpm only. npm coverage remains required before publishing (ADR-058 CLI-5) and belongs to the CLI quality work.
- Manifest **content**, including the known Angular range discrepancy (manifest `^21.0.7` vs `@ultimate/ng` peer `^21.2.22`; assessment §2 row 5).
- The resolver logic (`matchCompatibility`), command behaviour, MCP tool contracts, publishing, the release workflow (GAP-087).
- GAP status changes. GAP-131 stays OPEN until closeout, and its status changes only by user decision.

## 4. Preservation constraints

- **Canonical source unchanged:** `docs/architecture/compatibility-manifest.json` stays the single authored file and the one validated by `compatibility-manifest:validate` (Phase 7 Spec §6.4). The packaged copy is a build output, never edited.
- **No new package** for the manifest (Phase 7 Spec §6.4: "No new package is introduced to hold this file").
- **MCP independence and error contract:** MCP keeps its own reader (`src/manifest.ts`) and returns the same structured manifest-unreadable error when the file is missing, invalid JSON or malformed (Phase 8 Spec). The CLI and MCP still do not depend on each other (CLI and MCP boundary validators unchanged).
- **No new runtime dependency** in either package. `files` stays `["dist", "README.md"]`; the copy lives in `dist/`.
- **No fallback** to the monorepo path at runtime: a fallback would let in-repo tests pass while installed packages fail, which is the defect itself.

## 5. Design

### 5.1 Packaged copy

- One shared script, `scripts/copy-compatibility-manifest.mjs <package-dir>`, copies `docs/architecture/compatibility-manifest.json` byte-for-byte to `<package-dir>/dist/compatibility-manifest.json`. It fails with a non-zero exit if the source is missing.
- Both packages' `build` scripts call it after the existing steps:
  `tsup && node scripts/rename-dts.mjs && node ../../scripts/copy-compatibility-manifest.mjs .`
- `tsup` runs with `clean: true`, so the copy step must run after `tsup` (as above).

### 5.2 Runtime resolution

- **CLI:** a new module `packages/cli/src/manifest-path.ts` exports `COMPATIBILITY_MANIFEST_PATH = join(<package root>, "dist", "compatibility-manifest.json")`, where `<package root>` is the nearest directory above the module containing `package.json` (the same walk the commands already use). `add`, `init`, `theme` and `doctor` import it instead of building their own `MANIFEST_PATH`. Their other per-file helpers (`findUp`, `readCliVersion`) are unchanged.
- **MCP:** `packages/mcp/src/manifest-path.ts` keeps its role and export name, and changes its value to `<package root>/dist/compatibility-manifest.json` using the same nearest-`package.json` walk.
- The path is identical in source (tests run from `src/`) and in an installed package, because both sit under the same package root. In-repo tests therefore need the package itself built first, which is new: today the CLI and MCP tests need only their dependencies built. CI already runs Build (`pnpm -r --if-present run build`) before Test and Coverage. Locally, a test run after a manifest edit without a rebuild fails the drift test (§6.3) rather than passing silently.

### 5.3 Alternatives considered

| Alternative                                                | Rejected because                                                                                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embed the manifest with a JSON import at build time        | Both tsconfigs set `rootDir: "src"`; importing a file under `docs/` breaks `tsc` and declaration builds. It also removes MCP's specified runtime missing/invalid-file error path |
| Runtime fallback chain (packaged copy, then monorepo path) | Masks the defect in every in-repo test (§4)                                                                                                                                      |
| A dedicated manifest package                               | Contradicts Phase 7 Spec §6.4                                                                                                                                                    |
| Fetch the manifest over the network                        | Adds a network dependency to an offline CLI; out of proportion                                                                                                                   |

## 6. Verification design

### 6.1 Reproduce first

Before any source change, the smoke harness (§6.2) runs against unmodified packages built from the branch point. The expected result is a failure at manifest resolution in the CLI commands and the MCP compatibility tool. The observed output is recorded in the GAP-131 evidence at closeout. **If the failure does not reproduce, implementation stops and the finding returns to the user.**

### 6.2 Installed-package smoke harness (CLI-2, CLI-3)

**Location:** a new `scripts/provenance/installed-cli-mcp-smoke.mjs`. It reuses the closure packing and `file:` override mechanism of `scripts/provenance/pack-install-integrity.mjs`. That script is refactored to export the shared functions it keeps private today (closure resolution, `packOne`, scratch-consumer creation); the logic is not copied. Its command-line behaviour (guarded by `isMainModule`) and `pack-install-integrity.test.mjs` stay unchanged (AC-6).

**Consumers:** three scratch projects created in a temporary directory:

| Framework | Declared dependency (must satisfy the manifest and the framework package's peer range)                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`, `@angular/router` `^21.2.22`; `@angular/cdk` `^21.0.0`; `rxjs` `^7.8.1` (the `@ultimate/ng` peer set) |
| React     | `react`, `react-dom` `^18.3.1`                                                                                                                                                           |
| Vue       | `vue` `^3.5.13`                                                                                                                                                                          |

The existing unit fixtures (`packages/cli/test/fixtures/*-project`) are not reused: their framework versions (for example Angular `^17`) do not satisfy the manifest.

**Local resolution of unpublished packages:** each consumer's `package.json` carries `pnpm.overrides` mapping every `@ultimate/*` package in the closure of `@ultimate/cli`, `@ultimate/mcp`, the framework package and `@ultimate/themes` to its packed tarball. Then the CLI's own `pnpm add <name>` calls are expected to resolve locally; this is unverified (OQ-2) and is checked before it is relied on. Framework peer packages come from the public registry (network required, as for the existing CI install step; OQ-3).

**Package-manager detection:** the CLI chooses its package manager from the consumer's lockfile and falls back to **npm** when there is none (`packages/cli/src/detect-package-manager.ts`). The existing scratch consumer installs with `pnpm install --no-lockfile`, which would leave no lockfile, so the CLI would call npm. Each smoke consumer is therefore installed with `pnpm install` **writing** `pnpm-lock.yaml`, and the harness asserts that the lockfile exists before running any CLI command.

**CLI assertions, per consumer, using the installed `node_modules/.bin/ultimate`:**

| Command                            | Pass condition                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `ultimate init`                    | Exit 0; `ultimate.config.json` written; the resolved framework package present in `package.json`       |
| `ultimate add @ultimate/uix-utils` | Exit 0; the package present in `package.json`                                                          |
| `ultimate theme aura`              | Exit 0; `@ultimate/themes` installed; theme entry file written                                         |
| `ultimate doctor`                  | Exit 0; report ends with an "N of N known components reported" line, N being the metadata record count |
| `ultimate generate Button`         | Exit 0; non-empty snippet on stdout                                                                    |
| All of the above                   | No output mentions `compatibility-manifest.json` as missing or unreadable                              |

**MCP assertions, from one consumer, using the installed `ultimate-mcp` over stdio:**

- The server initializes.
- `check_framework_compatibility` returns `compatible: true` for each framework at the consumer's version.
- It returns `compatible: false` with a manifest-derived reason (not the manifest-unreadable error) for a version outside the range, for example React `16.0.0`.
- The client is the `@modelcontextprotocol/sdk` stdio client. The harness resolves it through `createRequire` anchored at `packages/mcp/package.json`, because pnpm does not hoist the SDK to the repository root. This uses the version `@ultimate/mcp` already declares; no new dependency.

### 6.3 Unit tests

- **CLI and MCP:** a test asserts that `COMPATIBILITY_MANIFEST_PATH` points inside the package's `dist/`, and that the file there is byte-identical to `docs/architecture/compatibility-manifest.json` (drift guard).
- **MCP:** existing tests that mock the path for missing and malformed files keep passing unchanged.

### 6.4 CI

- A new step, **"Installed-package smoke (CLI/MCP)"**, in the `ci` job immediately after "Pack/install integrity (affected)", with `if: ${{ !cancelled() }}`.
- It runs on every pull request and every `main` push, not path-scoped, because the defect sits between packaging and runtime and a path filter could skip it.
- **Time and registry availability (OQ-3):** the step installs three framework sets from the public registry, which adds CI time and depends on the registry being available. `ci.yml` has no existing step timeout or install-retry convention (the only retry convention is Playwright's `retries: process.env.CI ? 2 : 0`), so the step relies on pnpm's default fetch retries and adds none. No registry service, cache or dependency is added unless measured evidence shows this approach is inadequate.

## 7. Acceptance criteria

| ID   | Criterion                                                                                                                                                                                                              | Evidence                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| AC-1 | The defect is reproduced before the fix (§6.1), or implementation stopped                                                                                                                                              | Recorded harness output          |
| AC-2 | `dist/compatibility-manifest.json` exists in both packed tarballs and is byte-identical to the canonical file                                                                                                          | Harness check; unit tests (§6.3) |
| AC-3 | All CLI smoke assertions pass for Angular, React and Vue consumers (CLI-2, pnpm)                                                                                                                                       | CI step green                    |
| AC-4 | MCP smoke assertions pass (CLI-3)                                                                                                                                                                                      | CI step green                    |
| AC-5 | No code path in `packages/cli/src` or `packages/mcp/src` resolves a file under the monorepo `docs/` directory (comments excluded)                                                                                      | Text search in review            |
| AC-6 | Existing CLI and MCP unit tests, `pack-install-integrity.test.mjs`, the pack/install integrity step, CLI/MCP boundary validators and `compatibility-manifest:validate` stay green; the MCP error contract is unchanged | CI                               |
| AC-8 | Each smoke consumer has a `pnpm-lock.yaml` before CLI commands run, so the CLI uses pnpm                                                                                                                               | Harness assertion                |
| AC-7 | No new runtime dependency; `files` unchanged                                                                                                                                                                           | `package.json` diff              |

## 8. Records written during implementation

- GAP-131 evidence: the reproduced failure (AC-1) and the fix commits. The status change happens only at closeout, by user decision.
- ROADMAP footnote 3's "known packaging gap" sentence is updated at closeout (documentation authorization).
- `MIGRATION.md`: no consumer-facing API change is expected. If the installed layout changes in a way consumers can see, it gets a note.

## 9. Spec Review questions (resolved by the user, 2026-10-11)

- **OQ-1 — npm (ADR-058 CLI-5).** _Background:_ npm's `overrides` reportedly cannot replace a direct dependency with a different spec (EOVERRIDE) [assumption from npm documentation; not tested]. **Ruling:** this Spec's smoke harness uses pnpm only. npm coverage remains required before publishing under ADR-058 and is handled by the CLI quality work. No Verdaccio or other local registry is introduced here without demonstrated necessity.
- **OQ-2 — pnpm override on `pnpm add <bare name>`.** **Ruling:** treated as unverified. The Plan verifies it before relying on it. If it does not work, implementation stops and returns with the concrete limitation; scope is not expanded silently (no local registry, no change to the CLI's install behaviour).
- **OQ-3 — network in CI.** **Ruling:** the public-registry approach is retained. CI-time and registry-availability implications are recorded (§6.4); existing retry/timeout conventions apply where they exist. No new registry service or dependency without evidence that the current approach is inadequate.

## 10. Risks and rollback

- **Risks:** a slower CI job (three framework installs); registry flakiness; Angular peer resolution; the pnpm override behaviour (OQ-2); package tests now depending on the package's own build (§5.2).
- **Rollback:** revert the build-script and resolver changes. The canonical manifest is untouched, so rollback restores the current (defective) behaviour and no data is lost.

## 11. Spec Review record (2026-10-11)

Reviewed against ADR-058, GAP-131, the CLI/API-docs research (CLI-F1), the Phase 7 CLI Spec §6.4 and the Phase 8 MCP Spec, and checked against the current build and pack/install scripts.

| ID   | Finding                                                                                                                                           | Change                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| SR-1 | `detectPackageManager` falls back to npm without a lockfile; the existing scratch consumer uses `--no-lockfile`, so the CLI would have called npm | §6.2 package-manager detection; AC-8                          |
| SR-2 | The Angular consumer's declared versions were ambiguous                                                                                           | §6.2 table: the exact `@ultimate/ng` peer set                 |
| SR-3 | The SDK client cannot be resolved from the repository root under pnpm                                                                             | §6.2: `createRequire` anchored at `packages/mcp/package.json` |
| SR-4 | CLI/MCP tests would newly depend on their own package build                                                                                       | §5.2 note; §10 risk                                           |
| SR-5 | The refactored pack/install script must keep its behaviour and tests                                                                              | §6.2; AC-6                                                    |
| SR-6 | AC-5 could be read to cover comments                                                                                                              | AC-5 reworded to code paths                                   |
| SR-7 | The installed-path description assumed npm's flat layout                                                                                          | §1 reworded                                                   |

**Confirmed consistent (no change):** the copy runs after `tsup` (`clean: true`) and after `rename-dts.mjs`, which only renames `.d.ts` files; package builds run from each package directory (`pnpm -r --if-present run build`), so `../../scripts/…` resolves; `dist/` is already in `files`; the bundled `dist/index.mjs` and `dist/bin.mjs` and the source modules share one package root; MCP's existing path module and its tests' path mocking remain the seam; the reproduce-first condition (§6.1) is preserved.

**Amendment A1 (approved at Plan Review):** `generate` uses the record name `Button` (case-sensitive match, `generate.ts:93`).
