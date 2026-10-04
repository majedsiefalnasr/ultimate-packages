# Specification — Vue Floor `^3.5.2` and Floor Compatibility Check (GAP-083)

**Status:** Approved at Spec Review (2026-10-04); decisions in §12. Next gate: Implementation Plan.
**Date:** 2026-10-04
**Branch:** `feature/gap-083-vue-floor-compat` (from `main` `770d44e`)
**Origin:** GAP-083 (`docs/architecture/BLUEPRINT_GAPS.md`); decision ADR-050, amending ADR-042; evidence `docs/architecture/research/2026-10-04-gap-083-vue-floor-compat-research.md`.

**Required sequence:** Decision (ADR-050, approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

Make the supported Vue floor of `@ultimate/vue` and `@ultimate/vue-core` match what their shipped declarations actually support, and keep it true:

1. Raise the declared floor from `^3.5.0` to `^3.5.2` wherever the repository states it.
2. Add a consumer type-check at the floor version to `validate`, covering the packed declarations of both packages, in addition to the existing check at the workspace Vue version.

No component, runtime or declaration-generation change.

## 2. Decisions This Specification Implements

- **ADR-050:** the floor is `^3.5.2`; Vue 3.5.0 and 3.5.1 are excluded because they accept at most 19 `DefineComponent` type arguments and the emitted declarations use 20; `validate` enforces the floor with a `vue@3.5.2` consumer check of both packages; the existing workspace-version check stays.
- **Rejected by ADR-050, out of scope here:** 19-argument declarations (post-processed or built against older Vue types) and hand-written PrimeVue-style declarations.
- **ADR-042** keeps its posture (Ultimate chooses its own Vue range) and now carries an "Amended by ADR-050" note.

## 3. Framework Applicability

Vue only. Angular and React are unaffected.

## 4. Existing Behavior (verified on `770d44e`)

- `packages/vue/package.json` and `packages/vue-core/package.json` declare `peerDependencies.vue` `^3.5.0`; both develop against `vue` `^3.5.13` (Vue 3.5.42 installed).
- `packages/vue/scripts/validate-consumer-types.mjs` (run by `packages/vue`'s `validate` script, and so by CI's "Validate generated artifacts" step):
  - packs `@ultimate/vue` and its workspace runtime closure (which includes `@ultimate/vue-core`);
  - installs them in a temporary consumer with `vue` pinned to the **workspace-installed** version;
  - type-checks, with `vue-tsc` and `skipLibCheck: false`, under `Bundler` and `NodeNext`:
    - an import of every `@ultimate/vue` export key (94);
    - the positive and negative fixtures (`packages/vue/test/consumer-types/`);
    - the per-key props invariant (88 prop-bearing components, 661 keys).
  - `@ultimate/vue-core` is not a direct dependency of the consumer and none of its exports is imported directly. Its declarations are checked only where `@ultimate/vue`'s declarations reference them.
- Research: this check fails at `vue@3.5.0`/`3.5.1` (198 TS2707 per mode, 15 of them in `@ultimate/vue-core/dist/index.d.mts`) and passes at `3.5.2`, `3.5.13` and `3.5.43`.
- Other statements of the floor:
  - `docs/architecture/compatibility-manifest.json`, the Vue entry's `frameworkVersionRange` is `^3.5.0`. `@ultimate/cli` (`init`, `add`, `theme`, `doctor`) and `@ultimate/mcp` (`check_framework_compatibility`) read this manifest.
  - `docs/architecture/COMPATIBILITY.md:19` and `docs/architecture/DEPENDENCIES.md:12` state `^3.5.0`, attributed to the PrimeVue 4.5.5 peer range.
  - `packages/vue/README.md:49` and `packages/vue-core/README.md:64` state "Peers on `vue` (`^3.5.0`)".
  - `packages/cli/test/fixtures/init/vue-project/package.json` declares `vue` `^3.5.0` and is the "compatible Vue project" of `packages/cli/test/commands/init.test.ts:129`. `init` derives the project's version by stripping the range operator, so this fixture resolves to `3.5.0`.
  - `packages/mcp/test/tools/check-framework-compatibility.test.ts:30` calls the tool with Vue `3.5.0` in a shape-only test.

## 5. Required Behavior

### 5.1 Declared floor

- `peerDependencies.vue` is `^3.5.2` in `packages/vue/package.json` and `packages/vue-core/package.json`.
- The Vue entry of `compatibility-manifest.json` has `frameworkVersionRange` `^3.5.2`, so the CLI and MCP report the same floor as the packages.
- `COMPATIBILITY.md`, `DEPENDENCIES.md` and both package READMEs state `^3.5.2`. Where they attribute the range to PrimeVue 4.5.5, the text says the floor is Ultimate's own (ADR-050) and that PrimeVue 4.5.5 declares `^3.5.0`.
- Any other maintained document found during implementation that explicitly states the Ultimate Vue floor is updated the same way and listed at Plan Review or closeout. Documents that only mention Vue versions without stating the floor (dated research notes, earlier specs and plans, GAP-083's own registry text) are not edited.
- `devDependencies.vue` (`^3.5.13`) and the playground's `vue` range are unchanged.
- CLI and MCP behavior is otherwise unchanged: only the manifest's Vue range and the tests that encode it move.

### 5.2 Floor compatibility check

The consumer check runs twice per `validate`: once at the workspace-installed Vue version (as today) and once at the floor version.

- **Floor source and agreement guard.** The floor version is derived from the packages' own manifests, not hard-coded. The check reads `peerDependencies.vue` of `@ultimate/vue` and `@ultimate/vue-core` and the Vue entry's `frameworkVersionRange` in `docs/architecture/compatibility-manifest.json`. It requires all three to be the same single caret range `^X.Y.Z`, and uses `X.Y.Z` as the floor. Otherwise it fails with a message naming every range it read.
- **Both packages, directly.** The consumer depends on both `@ultimate/vue` and `@ultimate/vue-core` (packed tarballs) and imports every export key of each. This applies to both runs.
- **Same assertions at both versions.** Each run type-checks, under `Bundler` and `NodeNext` with `skipLibCheck: false`, the export imports of both packages, the positive and negative fixtures and the props invariant.
- **Failure.** Any type error at either version fails `validate`. Output names the Vue version and mode of each result, for example `OK (vue 3.5.2, bundler)`.
- **Fresh consumer per version.** Each run installs into its own consumer directory, so one run's `node_modules` cannot satisfy the other's `vue`.
- If the floor equals the workspace-installed version, the check still runs both labeled passes; it does not silently skip.
- **Shared work.** The packages are packed once, and both passes install the same tarballs. Nothing else is shared between passes: each has its own consumer directory, `node_modules`, generated files and `vue-tsc` runs. The order of passes and of output is fixed.

### 5.3 What does not change

- No change to component source, factories, SFCs, runtime output or the declaration build.
- No change to `.github/workflows/ci.yml`: the existing "Validate generated artifacts" step runs the extended check.
- The existing fixtures and invariant logic are reused, not duplicated.

## 6. API Requirements

- Public type surface: unchanged.
- Package metadata: `peerDependencies.vue` of both packages narrows from `^3.5.0` to `^3.5.2`. This is a consumer-visible compatibility change for applications on Vue 3.5.0/3.5.1 and is recorded in `MIGRATION.md` §8.

## 7. Affected Files

| File                                                                                                                               | Change                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/vue/package.json`, `packages/vue-core/package.json`                                                                      | `peerDependencies.vue` → `^3.5.2`                                                                                                                                                               |
| `packages/vue/scripts/validate-consumer-types.mjs`                                                                                 | Floor derivation and agreement guard (both peer ranges and the manifest range), second Vue version, `@ultimate/vue-core` as direct dependency with its export keys imported, per-version labels |
| `docs/architecture/compatibility-manifest.json`                                                                                    | Vue `frameworkVersionRange` → `^3.5.2`                                                                                                                                                          |
| `packages/cli/test/fixtures/init/vue-project/package.json`                                                                         | `vue` range raised so the "compatible Vue project" stays compatible (e.g. `^3.5.13`)                                                                                                            |
| `packages/mcp/test/tools/check-framework-compatibility.test.ts`                                                                    | Vue version in the shape-only test moved to one inside the new range, keeping its intent                                                                                                        |
| `docs/architecture/COMPATIBILITY.md`, `docs/architecture/DEPENDENCIES.md`, `packages/vue/README.md`, `packages/vue-core/README.md` | Floor wording                                                                                                                                                                                   |
| `docs/architecture/MIGRATION.md`                                                                                                   | §8 entry for the peer-range change                                                                                                                                                              |
| `docs/architecture/BLUEPRINT_GAPS.md`                                                                                              | GAP-083 → RESOLVED, at closeout                                                                                                                                                                 |
| `pnpm-lock.yaml`                                                                                                                   | Only if pnpm records the changed peer range; no dependency version changes                                                                                                                      |

Any other file needing a change found during planning is reported at Plan Review rather than added silently.

## 8. Acceptance Criteria

1. Both packages declare `peerDependencies.vue` `^3.5.2`; the compatibility manifest, `COMPATIBILITY.md`, `DEPENDENCIES.md` and both READMEs state the same floor.
2. `pnpm --filter @ultimate/vue run validate` (after `pnpm run build`) reports OK for both modes at the workspace Vue version and at `3.5.2`, covering every export key of `@ultimate/vue` and `@ultimate/vue-core`, the fixtures and the props invariant (88 components, 661 keys).
3. **Negative control.** With the derived floor temporarily forced to `3.5.0` or `3.5.1` (verification only, not committed), the check fails with TS2707 in both `@ultimate/vue` and `@ultimate/vue-core` declarations.
4. **Guard.** Mismatched or non-caret `peerDependencies.vue` ranges between the two packages make the check fail with a message naming both ranges (verified with a temporary edit, not committed).
5. `@ultimate/cli` and `@ultimate/mcp` test suites pass, with the CLI Vue `init` test still exercising a compatible project.
6. `@ultimate/vue` and `@ultimate/vue-core` unit tests unchanged and passing; `integrity:pack-install @ultimate/vue` passes; `compatibility-manifest:validate` passes.
7. No component, runtime or declaration output change: a diff of `packages/vue/dist` and `packages/vue-core/dist` against a `main` build shows no differences.
8. `MIGRATION.md` §8 records the peer-range change.
9. **Floor agreement invariant.** The compatibility manifest, both packages' `peerDependencies.vue`, the validation floor, the CLI fixture expectations, the MCP expectations and the maintained documentation all agree on `^3.5.2`:
   - enforced by `validate`, which fails if the two peer ranges and the manifest range disagree (§5.2), and derives the floor it tests from them;
   - enforced by the CLI and MCP test suites, which read the real manifest;
   - verified at closeout for the maintained documents by a repository search for the Vue floor, recorded with its result.

## 9. Verification Approach

- Build, then run `validate` for `@ultimate/vue`; record per-version, per-mode output, time and memory (`--diagnostics`).
- Negative control and guard proofs by temporary, uncommitted edits.
- CLI, MCP, `vue`, `vue-core` test suites; `compatibility-manifest:validate`; `integrity:pack-install @ultimate/vue`.
- `dist` comparison against a `main` build.
- Real CI: the "Validate generated artifacts" step result on push. The overall job stays red on inherited debt and the open CI triage items; GAP-083 is judged on its own step results.

## 10. Evidence/Source References

- Research note §3 (version matrix, `vue-core` exposure, origin) and §3.5 (19-argument probe, not adopted).
- ADR-050, ADR-042, ADR-049.
- Vue `@vue/runtime-core` 3.5.1 vs 3.5.2 `DefineComponent` signatures (research §3.1).

## 11. Explicit Out-of-Scope Items

- 19-argument or hand-written declarations (rejected by ADR-050).
- Checking every 3.5.x release; only the floor and the workspace version are checked.
- Vue 3.6+ or Vue 4 support statements.
- The GitHub CI triage items from run `37188652979` (React `dist/*.d.mts` on Linux, visual/a11y baselines, React/Vue SSR web servers, SAST SARIF path, `release.yml` Node 20).
- GAP-064 and any other GAP.

## 12. Spec Review Decisions (2026-10-04)

1. **Compatibility manifest: in scope.** `compatibility-manifest.json`, the CLI `init` fixture that uses `^3.5.0`, the affected MCP test and any maintained compatibility document that explicitly states the Vue floor are updated. No other compatibility cleanup. CLI and MCP behavior otherwise unchanged.
2. **`@ultimate/vue-core` in both passes.** For each Vue version and module mode: a fresh consumer with that Vue version, every public export of `@ultimate/vue` and of `@ultimate/vue-core` imported, the fixtures and the props invariant run.
3. **Cost accepted.** No premature optimization. Passes share only infrastructure that does not weaken isolation (the packed tarballs); the check stays deterministic.
4. **Other floor declarations in scope.** `COMPATIBILITY.md`, `DEPENDENCIES.md` and both package READMEs, plus any directly affected compatibility document found during implementation. Wording states Ultimate's supported floor, not a PrimeVue requirement.
5. **Acceptance criteria.** All kept; criterion 9 (floor agreement invariant) added.
6. **ADR structure.** ADR-050 as the amendment record with the one-line pointer in ADR-042; `DECISIONS.md` not restructured.
7. **Scope boundary.** No runtime, component or declaration-generation changes, no Vue 3.5.0/3.5.1 shims, no CI workflow changes, none of the run `37188652979` CI failures, no GAP-064.
