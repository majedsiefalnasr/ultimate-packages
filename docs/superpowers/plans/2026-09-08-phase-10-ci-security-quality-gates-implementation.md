# Phase 10 Track B — CI / Security / Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Draft for review
**Approved spec:** `docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md` (Status: Draft for review; formally APPROVED at spec-review gate)
**Companion research:** `docs/architecture/research/2026-09-08-phase-10-production-hardening.md`
**Companion architecture discussion:** `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md`
**Baseline:** `main` at `ee2713f` (Phase 9 — AI Skills and LLM Context, closed)

**Goal:** Wire nine new/extended CI gates into `.github/workflows/ci.yml` — dependency-vulnerability scanning (`pnpm audit`), license scanning (`license-checker`), SAST (CodeQL + a new repository-owned baseline validator), a malicious-dependency-review mechanical check, a bundle-size regression gate (extending the existing `measure-package-size.mjs`), a coverage regression gate (`@vitest/coverage-v8` + Angular's `ng test --code-coverage`), and a generalized, path-scoped pack/install integrity suite (extending the Phase 9 `@ultimate/ai` packaging-test precedent) — plus the merge-base-anchored baseline-comparison infrastructure both regression gates share. R9 (publish provenance) requires zero implementation in this track — it stays a documented contract in the spec.

**Architecture:** No new package. All new code lives under `scripts/provenance/` (following the exact convention already established by `validate-cli-boundary.mjs`/`validate-mcp-boundary.mjs`/`validate-ai-boundary.mjs`: a plain `node:fs`/`node:child_process` ESM script with a matching `*.test.mjs` sibling using `node:test`+`node:assert/strict`+`spawnSync`, auto-discovered by the existing `pnpm run test:scripts` → `node --test scripts/provenance/*.test.mjs` command with no wiring change needed) plus new root `package.json` scripts. All new `.github/workflows/ci.yml` steps are wired exclusively by Task 9 — every other task creates only the script/config the step invokes. Two shared, reusable pieces of new infrastructure back both R6 and R7: a `scripts/provenance/baseline-lib.mjs` module (merge-base-anchored git-blob reading of a committed baseline file, extracted once and imported by both the size-regression and coverage-regression validators, since both need the identical "read this file's content at the merge-base commit, not HEAD" primitive), a shared diff-shape detector (distinguishing a baseline-only PR from a source-changing PR, written once in Task 9 and reused by both validators), and a `docs/architecture/PERFORMANCE.md` extension (both baselines live in the same file's Phase 10 section, since the spec left exact storage format as an implementation-plan-level choice — Task 6 documents this choice explicitly).

**Tech Stack:** Plain Node.js ESM scripts (`node:fs`, `node:child_process`, `node:path`), `node:test` for script self-tests (matching every existing `scripts/provenance/*.mjs`), `pnpm audit` (built into the already-pinned `pnpm@9.6.0`, no new dependency), `license-checker-rseidelsohn` (new root devDependency — the maintained fork, per spec R2's tool selection), `github/codeql-action` (GitHub Actions-native, no new npm dependency), `@vitest/coverage-v8` (new devDependency in the 15 Vitest-based packages), Angular's own `--code-coverage` builder flag (already available via the pinned `@angular/build@21.2.22`, which runs Vitest `4.0.8` internally — confirmed this session, no new dependency needed for `ng`/`ng-core`).

## Global Constraints

These apply to every task below; a task does not restate them, it inherits them.

- **This plan implements exactly Track B's approved spec — nothing more.** No Storybook, no Playwright, no visual regression, no accessibility automation, no SSR/hydration harness, no `@ultimate/cli` `create`/`migrate`/`update`, no SECURITY.md/CONTRIBUTING.md/CHANGELOG.md content, no publish pipeline. Spec §1/§13.
- **17-package scope is fixed and identical across R6, R7, R8**: `ai`, `cli`, `component-metadata`, `component-schema`, `mcp`, `ng-core`, `ng`, `react-core`, `react`, `themes`, `uix-data`, `uix-motion`, `uix-styled`, `uix-styles`, `uix-utils`, `vue-core`, `vue`. Re-verified this session (17 packages, all non-`private`, all with `build`+`test` scripts). `packages/uix` (`.gitkeep`-only) is not in scope. Spec §4 R6/R7/R8's "Authoritative package count"/"Authoritative package scope" subsections.
- **R1 severity threshold: `high` (i.e. `--audit-level high`, covering `high`+`critical`).** Not `moderate`, not `critical`-only. Spec §4 R1.
- **R2 allowlist is exactly these 7 SPDX identifiers, no more, no fewer:** `MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`, `0BSD`, `CC0-1.0`. Unknown/unparseable licenses fail closed. Workspace packages excluded via `--excludeScopes @ultimate` (never `--excludePrivatePackages` — no package in this repo declares `"private": true`, confirmed twice this session; using that flag would silently exclude nothing). Spec §4 R2.
- **R3's enforcement mechanism is the repository-owned validator, never CodeQL's native code-scanning gate.** CodeQL produces SARIF; `scripts/provenance/validate-sast-baseline.mjs` consumes it, extracts `partialFingerprints`, compares against `docs/architecture/SAST_BASELINE.md`, and its own exit code is what fails CI. Spec §4 R3, points 1–7.
- **R6 threshold: 15% relative regression on gzip barrel size.** R7 threshold: **2 percentage points, an absolute delta**, on line-coverage percentage — never described as "relative." Both compared against the baseline **as committed at the PR's merge-base with `main`**, never a same-diff-modified value. Spec §4 R6/R7.
- **R6/R7 baseline acceptance is a two-PR lifecycle, never a same-PR bypass** (Plan Review BLOCKING finding, resolved in Task 6, reused identically by Task 7): a PR that changes a package's source/tests is always regression-checked against the merge-base baseline and may legitimately fail; a *separate*, later PR touching only the baseline file is checked instead by a truthfulness/integrity check (its written value must match a fresh real re-measurement) rather than the regression comparison, since a source-unchanged diff has nothing to regress-check. No flag, environment variable, or CLI argument disables the regression comparison for any PR that changes source — see Task 6's dedicated "R6/R7 baseline acceptance lifecycle" subsection for the full design.
- **R8 cadence: path-scoped to affected packages + their `workspace:*` closure, on every push/PR — never unscoped-every-push, never scheduled-only.** Spec §4 R8.
- **R9 is contract-only. This plan creates zero files, zero scripts, zero CI steps for R9.** Spec §4 R9 (already a closed decision, not reopened here).
- **No CI-workflow topology decision beyond what the spec already made explicit** (which gates exist, blocking vs. staged semantics). Job/step grouping is chosen in Task 9 using the existing single-job convention (`.github/workflows/ci.yml` has exactly one job today, `ci`) — extending it rather than introducing a new job is the minimal, convention-preserving choice, documented as an implementation-level decision, not a spec reopening. Spec §16 item 4.
- **`docs/architecture/SAST_BASELINE.md` format: a Markdown table** (one row per grandfathered finding: fingerprint, rule ID, file, one-line note), matching this repository's existing preference for human-readable-and-diffable Markdown over JSON/YAML for hand-touched provenance-adjacent files (`PROVENANCE.md`, `PERFORMANCE.md`, `DECISIONS.md` are all Markdown, none are JSON/YAML) — implementation-level choice per spec §16 item 2, documented here.
- **Baseline storage: `docs/architecture/PERFORMANCE.md` gains a new `## Phase 10 — CI/Security/Quality Gates` section holding both the size table (extending the existing per-package-size-table format already used in its Phase 1/Phase 2 sections) and a new coverage table** — one file, not two, since both are small, related, human-readable measurement records and this repository already has exactly one established home for that class of data. Implementation-level choice per spec §16 item 3, documented here.
- **`ng`/`ng-core` do not have a standalone `vitest.config.ts`** (confirmed this session — they use `@angular/build:unit-test` via `angular.json`, which itself runs Vitest `4.0.8` internally as a devDependency, but coverage is invoked via `ng test --code-coverage`, not a `defineConfig({ test: { coverage } })` block). This is a real, non-obvious repository fact that Task 7 must handle explicitly for these two packages rather than assuming uniform Vitest-config-file coverage wiring across all 17 — see Task 7.
- **Exactly one task, Task 9, edits `.github/workflows/ci.yml`.** Every other task that needs a CI step (Tasks 1, 2, 3, 6, 7, 8) creates only the script/config/manifest entry the step will invoke — the step itself, its placement, and its ordering are defined once, in Task 9, never duplicated. This corrects a Plan Review MAJOR finding against the prior draft.
- **Existing CI structure is extended, not restructured.** `.github/workflows/ci.yml` currently has exactly one job (`ci`) with 20 sequential steps, already does `fetch-depth: 0` and fetches `origin/main` (step "Fetch base ref") — this exact mechanism already gives every step merge-base access via `git merge-base origin/main HEAD`, reused directly by R6/R7's baseline comparison rather than adding new fetch logic. Task 9 appends new steps to this same job in the same style.

---

### Task 1: R1 — `pnpm audit` dependency-vulnerability gate

**Files:**
- Modify: `package.json` (add one script)

**Ownership note:** this task creates the `audit:validate` script only. The CI step invoking it is exclusively Task 9's responsibility (Plan Review finding #3 — exactly one task, Task 9, edits `.github/workflows/ci.yml`).

**Objective:** Add a `"audit:validate": "pnpm audit --audit-level high --prod"` script to root `package.json`. `--prod` scopes the audit to runtime dependencies only, per spec §4 R1's "Package scope: whole-repository" combined with the tool's own `-P`/`--prod` flag (confirmed present in `pnpm audit --help` output this session) — devDependency vulnerabilities are lower-risk (never ship to a consumer) and including them would make the gate noisier without a corresponding security benefit; this is documented here as the plan's own scoping choice since the spec's evidence section named the flag but did not mandate `--prod` specifically.

Do not set `--ignore-registry-errors` — a registry-unreachable condition must cause the step to fail (spec §4 R1's explicit registry-unreachable requirement), which is `pnpm audit`'s default behavior (non-zero exit) when that flag is absent.

**Dependencies:** None — independent, can start immediately.

**Verification:**
- Run `pnpm audit --audit-level high --prod` locally against current `main` and record the actual exit code and output (this is real evidence for Task 10's verification matrix — the spec explicitly left "passes on current `main`'s actual dependency tree" as something to confirm empirically at implementation time, not assumed).
- Negative test (manual, documented in the task's own commit/PR description, not a committed automated test — `pnpm audit`'s behavior against a synthetic vulnerable dependency is the tool's own tested behavior, not this repository's code): temporarily add a `devDependency` on a package/version pair with a known `high`+ advisory (e.g. an old, deliberately vulnerable version of a throwaway package) in a scratch branch, confirm `pnpm audit --audit-level high --prod` reports it if in `dependencies`, confirm it does NOT report it if only in `devDependencies` (proving the `--prod` scoping works as intended), then revert.

---

### Task 2: R2 — `license-checker` allowlist gate

**Files:**
- Modify: `package.json` (add one devDependency, one script)

**Ownership note:** this task creates the `license:validate` script only. The CI step invoking it is exclusively Task 9's responsibility (Plan Review finding #3).

**Objective:** Add `license-checker-rseidelsohn` as a root devDependency (the maintained fork — spec §4 R2's tool selection explicitly allows either it or the original `license-checker`; this plan picks the maintained fork since an unmaintained original is a worse long-term choice with no offsetting benefit). Add a `"license:validate"` script:

```
license-checker-rseidelsohn --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;CC0-1.0" --excludeScopes "@ultimate" --failOn "UNKNOWN"
```

(`--failOn "UNKNOWN"` is `license-checker`'s documented mechanism for making an unparseable/missing license fail the process rather than merely being silently omitted from the report — this directly satisfies spec §4 R2's "unknown license... must fail closed, not pass silently" requirement; without `--failOn`, `license-checker` by default only fails on `--onlyAllow` mismatches for *recognized* licenses, and an unrecognized one could otherwise pass through unflagged — confirmed via the tool's own documented flag set, not invented here.)

**Dependencies:** None — independent, can start immediately. Can run in parallel with Task 1 (both touch `package.json`'s `scripts`/`devDependencies` block — sequence Task 1 then Task 2, or merge both edits in one pass, to avoid a two-writer conflict on the same file; noted here since both are otherwise logically independent).

**Verification:**
- Run `pnpm run license:validate` locally against current `main`'s actual resolved dependency tree; record real output (same "confirm empirically, don't assume clean" discipline as Task 1).
- Negative test (manual, scratch branch): add a `devDependency` on a package with a known non-allowlisted license (e.g. a GPL-licensed package) or a version with no `license` field, confirm the command exits non-zero and names the offending package; revert.
- Confirm `--excludeScopes "@ultimate"` correctly excludes all 17 in-scope workspace packages from being flagged against their own (already-`"license": "MIT"`-declared) entries — verify by checking the tool's report output does not list any `@ultimate/*` package as a violation, confirming the flag does what the spec's R2 correction intended (not the retracted, factually-wrong `--excludePrivatePackages` approach).

---

### Task 3: R5 — malicious-dependency-review mechanical check

**Files:**
- Create: `scripts/provenance/validate-install-script-policy.mjs`
- Create: `scripts/provenance/validate-install-script-policy.test.mjs`
- Modify: `package.json` (add one script)

**Ownership note:** this task creates the script and its `package.json` entry only. The CI step invoking it is exclusively Task 9's responsibility (Plan Review finding #3).

**Objective:** Per spec §4 R5, this is deliberately narrow: verify the repository has not silently re-enabled unrestricted install-time script execution. **Corrected per Plan Review finding #5** — the prior draft's `enable-pre-post-scripts` and `dangerouslyAllowAllBuilds`-or-similarly-named speculative keys are removed; this task now checks only mechanisms confirmed real this session by direct `pnpm@9.6.0` inspection (`pnpm config get <key>`, real repository file contents), with no pattern-matching against hypothetical key names.

**Confirmed real mechanisms (evidence, not speculation):**
1. **`.npmrc`'s `enable-scripts` setting.** Confirmed via `pnpm config get enable-scripts` (returned `true`, pnpm's own default) — this is `pnpm`'s real, documented blanket lifecycle-script kill-switch (`pnpm install --help` lists the equivalent `--ignore-scripts` CLI flag as a real, current option). This repository's own root `.npmrc` was read directly this session and confirmed to contain only `engine-strict=true` and `save-exact=true` — no `enable-scripts` override of any kind, meaning `pnpm`'s own default (scripts enabled, but only for packages that are actually dependencies being installed — see mechanism 2) is in effect, unmodified.
2. **`pnpm-workspace.yaml`'s `onlyBuiltDependencies` / `ignoredBuiltDependencies` fields.** Confirmed via direct inspection this session that `pnpm-workspace.yaml` is a real file in this repository (currently containing only a `packages:` list — `packages/*`, `apps/*` — no build-approval fields at all). These two fields are `pnpm`'s modern (9.x-era) allowlist mechanism specifically for which dependencies are permitted to run install-time build/lifecycle scripts, replacing a blanket on/off switch with an explicit allowlist model — this is the field surface most directly relevant to R5's "malicious package/dependency review" concern (a newly-added dependency's install script running unreviewed), more so than mechanism 1's blanket switch.

`validate-install-script-policy.mjs` (following the exact shape of `validate-cli-boundary.mjs`: plain script, `fail()`/`pass()` helpers, `process.exit()`), checking only these two confirmed mechanisms, with mechanism 2 carrying this check's actual pass/fail power (documented explicitly, not left implicit):
1. **`.npmrc` `enable-scripts` (informational only, no independent pass/fail power):** reads the repository root `.npmrc` if present and reports the value of `enable-scripts` if set. This key is a blanket, repository-wide switch with no per-dependency targeting, and `true` is `pnpm`'s own out-of-the-box default (confirmed via `pnpm config get enable-scripts` this session) — so its mere presence/absence at the default value carries no signal about a newly introduced risk, and this check does not fail on it alone. It is checked and reported purely for visibility (e.g., so a future reviewer can see at a glance whether this key has ever been touched), honoring the task brief's instruction not to force a low-signal, false-positive-prone key into a real gate condition.
2. **`pnpm-workspace.yaml` `onlyBuiltDependencies`/`ignoredBuiltDependencies` (the real, meaningful check):** reads `pnpm-workspace.yaml` if present; if either field is defined and non-empty, fails when any listed package name is **not** already present in the repository's own `pnpm-lock.yaml` dependency tree at check time — an allowlist/ignorelist entry naming a package that isn't a real, resolvable dependency is itself suspicious (either stale or a sign of a manually-added, unreviewed entry meant to pre-authorize a not-yet-added dependency's install scripts). For this repository's current, real state (both fields absent, confirmed this session), the check passes with an informational "no build-script allowlist/ignorelist overrides present" message.
3. **Overall pass/fail:** passes when mechanism 2 finds no orphaned allowlist/ignorelist entries (mechanism 1 never independently fails the check, per point 1).

Root `package.json` script (named explicitly here, referenced identically by Task 9's CI step and Task 10's verification matrix): `"install-script-policy:validate": "node scripts/provenance/validate-install-script-policy.mjs"`.

**Dependencies:** None — independent, can start immediately.

**Verification (`node --test scripts/provenance/validate-install-script-policy.test.mjs`, auto-discovered by the existing `pnpm run test:scripts` glob):**
- Passes against current `main`'s real `.npmrc` and `pnpm-workspace.yaml` (both confirmed this session — no overrides present).
- Fails against a scratch fixture `pnpm-workspace.yaml` whose `onlyBuiltDependencies` list names a package not present in the fixture's `pnpm-lock.yaml` (the concrete "install-script restriction disabled/subverted" negative case the task brief explicitly requires, expressed via this repository's actual confirmed mechanism rather than a speculative one).
- Passes against a scratch fixture `pnpm-workspace.yaml` whose `onlyBuiltDependencies` list only names packages that do resolve in the fixture's `pnpm-lock.yaml`.
- Passes against a scratch fixture with no `pnpm-workspace.yaml` build-approval fields at all (matching this repository's real current state).

---

### Task 4: R3 — CodeQL configuration + `validate-sast-baseline.mjs` (script/config/tests only — no CI workflow wiring)

**Ownership note (Plan Review correction):** this task owns only the CodeQL *configuration file*, the validator *script and its tests*, and the `SAST_BASELINE.md` *stub/contract*. It does **not** touch `.github/workflows/ci.yml` — CodeQL `init`/`analyze` step wiring, SARIF-path handling, and the SAST-baseline-validation CI step invocation are exclusively Task 9's responsibility (the only task in this plan that edits `.github/workflows/ci.yml`). This corrects the prior draft's duplicated CI-editing ownership between Task 4 and Task 9.

**Files:**
- Create: `.github/codeql/codeql-config.yml` (query-pack + path scoping)
- Create: `scripts/provenance/validate-sast-baseline.mjs`
- Create: `scripts/provenance/validate-sast-baseline.test.mjs`
- Create: `docs/architecture/SAST_BASELINE.md` — **stub only** (column-header row + a documented, valid-but-empty table structure; e.g. a Markdown table with the header row `| Fingerprint | Rule | File | Note |` and zero data rows, plus a one-line comment explaining the file is intentionally empty pending Task 8's real initial-scan population). This task does not run CodeQL against real `main` source and does not populate real findings — that is exclusively Task 8's responsibility (Plan Review finding #4). Task 4's own tests (below) use hand-written SARIF/baseline fixtures, never this stub file's real (empty) content, so the stub's emptiness has no bearing on this task's own test correctness.
- Modify: `package.json` (add one script)

**Objective:**

1. `.github/codeql/codeql-config.yml` scopes CodeQL to exactly the surface spec §4 R3 names — `packages/*/src/` and `scripts/` — and excludes generated artifacts/docs:
   ```yaml
   name: "Ultimate Track B SAST config"
   queries:
     - uses: security-extended
   paths:
     - packages/*/src
     - scripts
   paths-ignore:
     - "**/dist/**"
     - "**/node_modules/**"
     - "skills/**"
     - "docs/**"
   ```
   This file is pure configuration, consumed by `github/codeql-action/init`'s `config-file` input — the action itself, and the CI steps that invoke it, are wired exclusively in Task 9.
2. `validate-sast-baseline.mjs` (new script, plain Node, no new npm dependency — SARIF is JSON, parsed with `JSON.parse`):
   - Takes the SARIF file path as its one CLI argument (`process.argv[2]`) — a plain positional argument, not a flag, matching the simplest possible invocation shape and avoiding the prior draft's inconsistency between how the root script and the CI step passed this value (see the fix below).
   - Parses SARIF's `runs[].results[]` array; for each result at `level: "error"` or `"warning"` (SARIF's own severity field — `"note"` is skipped per spec §4 R3's severity threshold), reads `result.partialFingerprints` (CodeQL's own per-result stable-fingerprint object, confirmed as a documented CodeQL SARIF extension field, not invented by this script).
   - Parses `docs/architecture/SAST_BASELINE.md`'s Markdown table into an in-memory list of grandfathered fingerprints (simple line-based table-row parsing — no Markdown-parsing library needed for one fixed-column table, consistent with this repository's YAGNI-favoring existing scripts).
   - For each qualifying SARIF result, checks whether any of its `partialFingerprints` values matches a baseline entry; if none do, the finding is new and gets printed (`[validate-sast-baseline] NEW FINDING: <rule> at <file> — not in SAST_BASELINE.md`) and counted.
   - Exits non-zero if any new finding was found; exits zero and prints a pass summary otherwise.
3. **`"sast:validate": "node scripts/provenance/validate-sast-baseline.mjs"` root script — corrected (Plan Review BLOCKING finding #1).** The prior draft's `"sast:validate": "node scripts/provenance/validate-sast-baseline.mjs <sarif-path>"` was invalid: `<sarif-path>` is not shell syntax pnpm/npm resolves to a real argument — it would have been passed to the script literally as the four-character string `<sarif-path>`. The corrected root script takes **no baked-in path** at all; the actual SARIF file path is supplied at invocation time by whichever caller has it — Task 9's CI step runs `pnpm run sast:validate -- "$SARIF_PATH"` (passed through pnpm's own `--` argument-forwarding, a real, working mechanism, unlike a literal placeholder token), and this task's own tests (below) invoke the script directly via `spawnSync("node", [SCRIPT_PATH, sarifFixturePath], ...)`, matching the exact pattern already used by `validate-cli-boundary.test.mjs`.

**Dependencies:** None on other Track B tasks — independent. (Soft ordering note: Task 8 populates the real `SAST_BASELINE.md` content by running this exact mechanism against `main`, so Task 8 depends on this task's script existing, not the reverse. Task 9 depends on this task's script and config file existing, since Task 9 is what wires them into CI.)

**Verification (`node --test scripts/provenance/validate-sast-baseline.test.mjs`):**
- **New finding, not in baseline:** construct a synthetic minimal SARIF fixture (hand-written JSON, not a real CodeQL run — this test validates the *parser/comparator logic*, not CodeQL itself) with one `error`-level result and an empty `SAST_BASELINE.md` fixture (a hand-written test fixture, not the real repository stub); assert non-zero exit and the "NEW FINDING" message.
- **Grandfathered finding, in baseline:** same SARIF fixture, but with a `SAST_BASELINE.md` fixture containing a matching fingerprint row; assert zero exit.
- **`note`-level finding, never compared:** SARIF fixture with only a `note`-level result, empty baseline; assert zero exit (proves note-level findings are skipped entirely, per spec).
- **Malformed/missing baseline file:** SARIF fixture pointing at a nonexistent `SAST_BASELINE.md` path; assert the script fails closed (non-zero exit with a clear "baseline file not found" message) rather than silently treating a missing baseline as "everything is grandfathered" — this is the malformed/missing-baseline negative case the task brief explicitly requires.
- **Baseline-removal behavior:** a fixture baseline with an entry removed (simulating a reviewed PR that fixed the underlying finding and removed its baseline row) combined with a SARIF fixture that no longer contains that finding; assert zero exit (proves removing a stale baseline entry for now-fixed code does not itself trigger a failure, since the corresponding finding is genuinely gone from the new SARIF).

---

### Task 5: R6/R7 shared infrastructure — `baseline-lib.mjs` (merge-base-anchored baseline reading)

**Files:**
- Create: `scripts/provenance/baseline-lib.mjs`
- Create: `scripts/provenance/baseline-lib.test.mjs`

**Objective:** Extract the one primitive both R6 and R7 need, per the spec's explicit merge-base-anchoring requirement: read a committed file's content **as it existed at the merge-base commit with a given base ref**, not the current working tree's version. This directly reuses the git idiom already proven in this repository's own `validate-provenance.mjs` (`git diff --name-only <ref>...HEAD`, confirmed present and working this session) extended with `git merge-base` + `git show`:

```js
export function getMergeBaseSha(baseRef) {
  return execSync(`git merge-base ${baseRef} HEAD`, { encoding: "utf8" }).trim();
}

export function readFileAtRef(ref, relativePath) {
  try {
    return execSync(`git show ${ref}:${relativePath}`, { encoding: "utf8" });
  } catch {
    return null; // file did not exist at that ref — caller decides how to handle (e.g. "no baseline yet" for Stage 1→2 transition)
  }
}
```

Both functions are pure (no `process.exit`, no console output) — they are imported by Task 6's and Task 7's validator scripts, which own all CLI/exit-code/logging behavior, matching this repository's established pattern (seen in Phase 9's `render-section.ts`/`skill-file.ts` being pure logic with only `bin-*.ts` touching the real filesystem/exit codes).

**Dependencies:** None — independent, can start immediately. Tasks 6 and 7 depend on this task.

**Verification (`node --test scripts/provenance/baseline-lib.test.mjs`):**
- `getMergeBaseSha("HEAD")` against the current repo returns the current `HEAD` SHA (merge-base of a ref with itself is itself) — a real, non-mocked git assertion run against this actual repository.
- `readFileAtRef(<a real recent commit SHA>, "package.json")` returns real file content matching what `git show <sha>:package.json` produces when run directly in a shell (cross-checked, not just self-consistently asserted).
- `readFileAtRef(<real commit SHA>, "this/path/does/not/exist.md")` returns `null`, not an unhandled thrown exception.

---

### Task 6: R6 — bundle-size regression gate

**Files:**
- Modify: `scripts/provenance/measure-package-size.mjs` (extend package-discovery scope from `uix*`/`ng*` prefixes to the full 17-package list)
- Create: `scripts/provenance/validate-bundle-size.mjs`
- Create: `scripts/provenance/validate-bundle-size.test.mjs`
- Modify: `docs/architecture/PERFORMANCE.md` (add `## Phase 10 — CI/Security/Quality Gates` § with a size table; populated with real Stage-1 numbers in Task 8)
- Modify: `package.json` (add two scripts: `size:measure`, `size:validate`)

**Ownership note:** this task creates the measurement/validation scripts and the two `package.json` entries only. The CI steps invoking them are exclusively Task 9's responsibility (Plan Review finding #3).

**Objective:**

1. **Extend, do not replace, `measure-package-size.mjs`.** Its `PACKAGE_PREFIXES = ["uix", "ng"]` filter (line 17, confirmed this session) is replaced with an explicit `ALL_PUBLISHABLE_PACKAGES` list — the same 17-name list this plan's Global Constraints section fixes — since a prefix filter can no longer express the full scope (`react`, `vue`, `themes`, `cli`, `mcp`, `ai`, `component-schema`, `component-metadata` don't share a common prefix with each other or with `uix`/`ng`). This is the "identify the exact existing implementation to extend" requirement — `measure-package-size.mjs` is that implementation; its `dirSizeBytes`/`barrelGzipSize` functions (already correctly handling both `tsup`'s `dist/index.mjs` and `ng-packagr`'s `dist/fesm2022/<name>.mjs` output shapes via `package.json`'s own `module`/`main` field resolution, confirmed this session) are reused verbatim — only the package-discovery list changes.
2. `validate-bundle-size.mjs`: imports `baseline-lib.mjs` (Task 5), runs the extended `measure-package-size.mjs`'s measurement logic (imported as a function, not shelled out to, so its output is directly usable rather than re-parsed from stdout — this requires a small refactor: `measure-package-size.mjs`'s per-package measurement logic becomes an exported function `measurePackage(pkgPath)` the CLI entry point already calls; both the existing standalone script and the new validator import it), reads the merge-base version of `PERFORMANCE.md`'s Phase 10 size table (via `readFileAtRef(mergeBaseSha, "docs/architecture/PERFORMANCE.md")` + a small table-row parser for just that section), and for each of the 17 packages runs the **two-step acceptance lifecycle** below (the exact mechanism resolving the Plan Review's BLOCKING finding — see the "R6/R7 baseline acceptance lifecycle" subsection immediately after this list for the full design and rationale, referenced identically by Task 7):
   - **If the current diff (per `git diff --name-only <merge-base>...HEAD`, already computed by Task 9's "Determine affected packages" step and passed to this script as an input, not recomputed here) touches only `docs/architecture/PERFORMANCE.md` and no `packages/<name>/src/**`/`packages/<name>/package.json` path for this specific package** — this is a **baseline-only PR** for this package. In that case, the gate does **not** run the regression comparison at all (there is nothing to regress-check: this PR did not change the package's source, so its "new" measurement is definitionally unchanged from `main`'s current real state). Instead it runs an **integrity check**: re-measure the package fresh (from its actual current, unchanged `dist/` output) and assert the new baseline value the PR is writing into `PERFORMANCE.md` equals that fresh real measurement (exact match, or within the gzip-size script's own natural floating-point rounding — a tolerance already used by the existing `.toFixed(1)`/`.toFixed(2)` formatting in `measure-package-size.mjs`, not a new invented fudge factor). Fails if the two disagree — this is what prevents a baseline-only PR from writing an arbitrary, unverified number rather than the package's genuine, currently-measured size.
   - **Otherwise (the diff touches this package's own source/manifest, with or without also touching `PERFORMANCE.md`)** — this is a normal regression-checked PR. If no prior baseline entry exists for the package at the merge-base (Stage 1 — first-ever measurement), print an informational line, do not fail. If a prior entry exists, compute `(newSize - baselineSize) / baselineSize` using the **merge-base's own recorded baseline value**, never a value read from the current diff's own edited `PERFORMANCE.md` (this is the merge-base-anchoring the spec's BLOCKING finding required, unchanged from the prior plan draft — only the baseline-only-PR branch above is new); fail (non-zero exit, printed violation) if `> 0.15`; pass otherwise. **This branch never reads or trusts any `PERFORMANCE.md` value the current PR itself wrote — only the merge-base's.**
3. `"size:measure": "node scripts/provenance/measure-package-size.mjs"` (unchanged invocation, extended scope). `"size:validate": "node scripts/provenance/validate-bundle-size.mjs --base-ref origin/main"` (matches the existing `--base-ref` CLI-flag convention already used by `provenance:validate`).

**R6/R7 baseline acceptance lifecycle (design, shared identically by Task 7 — stated once here, referenced there):**

The Plan Review's BLOCKING finding is real: under a naive "always compare current measurement against the merge-base baseline" rule, a second, baseline-only PR that merely updates the recorded number can *never* pass, because its own "current measurement" is the same regressed size the first PR already legitimately failed on — nothing about a baseline-only diff changes the measured value, so comparing it against the still-old merge-base baseline reproduces the exact same failure forever, with no path to ever landing the new baseline. A same-PR bypass (letting a PR read its own edited baseline) is explicitly forbidden by the spec and the review. The two-step lifecycle therefore needs a **third kind of check**, not just "compare" or "bypass":

1. **Implementation PR** (e.g. a legitimately larger new feature): gate runs the normal regression branch above, compares against the merge-base's recorded baseline, **legitimately fails** if the increase exceeds 15%. This is expected, correct, and not overridden — the PR's own gate never passes by any mechanism in this repository's CI. The PR merges to `main` only via an out-of-band, human decision: a reviewer approves the PR **and its failing status check** through this repository's normal merge process (GitHub's branch-protection "merge without waiting for a specific check" / an administrator override / an explicitly documented required-check exemption — the exact mechanism is a repository-settings choice outside this plan's file-level scope, noted here as a real, necessary precondition this plan does not implement, matching the spec's own explicit exclusion of "branch-protection-rule mechanics" from Track B's scope, §10 of the spec). This plan does not gate-bypass anything — it documents that landing a legitimately-failing check requires an explicit, visible, out-of-band human action, never a CI-internal flag.
2. **Baseline-update PR** (opened after step 1 has merged, so its merge-base is now `main` at-or-after the implementation PR — i.e., the merge-base's `PERFORMANCE.md` still has the *old* number, but the merge-base's `dist/` output, if rebuilt, would now measure the *new* number): this PR's diff touches **only** `docs/architecture/PERFORMANCE.md`, writing in the new, real, currently-measured value. Per the bullet above, the gate detects this is a baseline-only diff for the affected package(s) and switches to the **integrity check** — it does not run the (would-always-fail) regression comparison at all, and instead verifies the number this PR is writing matches reality. This is the mechanism that makes the second PR passable: not by disabling the gate, but by the gate recognizing "this diff shape carries no regression risk to check" and substituting a narrower, still-real verification (the written number must be true, not merely asserted).

**Why this is not a generic bypass, addressing the constraint list directly:** there is no flag, environment variable, or CLI argument that disables or weakens the regression comparison — the integrity-check branch is selected purely from the **shape of the diff** (source/manifest unchanged for the package in question), which a PR author cannot fake without actually leaving the package's source unchanged; and even in that branch, the gate still fails if the written number is wrong, so it is not "anything goes for baseline-only PRs" — it is "baseline-only PRs are checked for truthfulness instead of regression, since a truthful baseline-only PR by definition contains no code regression to catch."

**Dependencies:** Task 5 (imports `baseline-lib.mjs`); Task 9's affected-package diff computation (this task's diff-shape detection consumes that output rather than recomputing its own `git diff`, avoiding two independent implementations of the same check).

**Verification (`node --test scripts/provenance/validate-bundle-size.test.mjs`):**
- **Stage 1 (no prior baseline):** merge-base `PERFORMANCE.md` fixture with no entry for a synthetic package name, diff touches that package's source; assert informational-only, zero exit.
- **Stage 2 pass:** merge-base baseline of e.g. `100.0 KB`, current measurement of `105.0 KB` (5% increase, under 15%), diff touches the package's source; assert zero exit.
- **Stage 2 fail (implementation PR, legitimate failure):** merge-base baseline of `100.0 KB`, current measurement of `120.0 KB` (20% increase, over 15%), diff touches the package's source; assert non-zero exit with the violating package named.
- **Same-diff-bypass negative test (explicitly required by the task brief):** simulate a PR that both increased a package's size by 20% AND edited `PERFORMANCE.md`'s HEAD-version baseline entry to `120.0 KB` in the *same diff as the source change* (i.e. the diff touches both the package's source AND `PERFORMANCE.md` — this is NOT a baseline-only diff, so the regression branch runs, not the integrity-check branch) — construct the test so the validator reads the *merge-base* fixture (still `100.0 KB`, unedited) rather than any HEAD-version value, and assert it **still fails**. This is the single most important test in this task per the spec's BLOCKING finding, and it is what proves the integrity-check branch cannot be reached by a source-changing PR no matter what it also writes into `PERFORMANCE.md`.
- **Baseline-only PR, honest value (new, lifecycle Step 2):** diff touches only `PERFORMANCE.md`, no package source; fixture's real re-measured size is `120.0 KB`; the PR writes `120.0 KB` into `PERFORMANCE.md`; assert zero exit (integrity check passes — the written value is truthful) regardless of the merge-base's old `100.0 KB` value, and regardless of the >15% relationship between old and new (proving the regression branch is genuinely skipped, not merely satisfied).
- **Baseline-only PR, dishonest value (new, lifecycle Step 2 negative case):** same setup, but the PR writes a false value (e.g. `90.0 KB`, not matching the fixture's real re-measured `120.0 KB`); assert non-zero exit — proves the integrity check itself is a real, enforced check, not a rubber stamp for any baseline-only diff.
- Real measurement run: execute the extended `measure-package-size.mjs` against a fresh `pnpm run build` of all 17 packages and confirm it produces exactly 17 rows with no errors (deferred to Task 8's full-repo pass for the actual real-number capture, but this task's own verification confirms the script itself runs clean across all 17 before Task 8 records the numbers).

---

### Task 7: R7 — coverage regression gate

**Files:**
- Modify: `packages/{ai,cli,component-metadata,component-schema,mcp,react-core,react,themes,uix-data,uix-motion,uix-styled,uix-styles,uix-utils,vue-core,vue}/vitest.config.ts` (15 files — add `coverage` block)
- Modify: `packages/{ai,cli,component-metadata,component-schema,mcp,react-core,react,themes,uix-data,uix-motion,uix-styled,uix-styles,uix-utils,vue-core,vue}/package.json` (15 files — add `@vitest/coverage-v8` devDependency, add `test:coverage` script)
- Modify: `packages/ng-core/angular.json`, `packages/ng/angular.json` (enable `codeCoverage` option on the `test` target)
- Modify: `packages/ng-core/package.json`, `packages/ng/package.json` (add `test:coverage` script: `"ng test --project=<name> --code-coverage"`)
- Create: `scripts/provenance/validate-coverage.mjs`
- Create: `scripts/provenance/validate-coverage.test.mjs`
- Modify: `docs/architecture/PERFORMANCE.md` (add coverage table to the Phase 10 section)
- Modify: root `package.json` (add `coverage:measure`, `coverage:validate` scripts)

**Ownership note:** this task creates the coverage-collection wiring (per-package config), the measurement/validation scripts, and the root `package.json` entries only. The CI steps invoking them are exclusively Task 9's responsibility (Plan Review finding #3).

**Objective:**

1. **15 Vitest-native packages:** add `@vitest/coverage-v8` as a devDependency and extend each `vitest.config.ts`'s `defineConfig({ test: { ... } })` with:
   ```ts
   coverage: {
     provider: "v8",
     reporter: ["text", "json-summary"],
     reportsDirectory: "./coverage",
   },
   ```
   `json-summary` is chosen specifically because it produces a small, directly-`JSON.parse`-able `coverage/coverage-summary.json` with a `total.lines.pct` field — exactly the one number (line-coverage percentage) spec §4 R7 gates on — without needing to parse a full `lcov`/HTML report. Add a `"test:coverage": "vitest run --coverage --typecheck"` script per package (matching the existing `"test": "vitest run --typecheck"` pattern already in every one of these `package.json` files, confirmed this session, with `--coverage` appended).
2. **`ng`/`ng-core` (confirmed this session to have no standalone `vitest.config.ts` — they run via `@angular/build:unit-test`, which internally uses Vitest `4.0.8` but is invoked through `ng test`):** enable `"codeCoverage": true` under each package's `angular.json` `test` target `options`, and add `"test:coverage": "ng test --project=<name> --code-coverage"` to each `package.json`. This is the Angular-idiomatic equivalent of the other 15 packages' `--coverage` flag — same underlying Vitest coverage engine, different invocation surface, confirmed as the correct mechanism for this specific pinned `@angular/build@21.2.22` this session rather than assumed.
3. `validate-coverage.mjs`: imports `baseline-lib.mjs` (Task 5); for each of the 17 packages, reads that package's `coverage/coverage-summary.json` (Vitest packages) or Angular's coverage output (`ng test --code-coverage`'s own coverage report location — confirmed during implementation against the actual builder output, since this is the one detail needing empirical confirmation at implementation time rather than assumed identical to the Vitest-native path) for its `total.lines.pct` (or equivalent Angular-coverage-report field), extracts a single number per package, reads the merge-base version of `PERFORMANCE.md`'s coverage table, and runs the **identical two-step acceptance lifecycle defined in full in Task 6** (this task does not re-derive the design — it applies the same diff-shape-based branch selection, with the coverage-specific numbers substituted):
   - **Baseline-only diff for this package** (per Task 9's affected-package diff computation, touching only `docs/architecture/PERFORMANCE.md`, not this package's `src/**`/`package.json`/`vitest.config.ts`/`angular.json`): skip the regression comparison; run the integrity check instead — re-measure the package's actual current coverage fresh, assert the value the PR is writing into `PERFORMANCE.md` matches that fresh measurement (exact match, or within `toFixed(1)`-scale rounding, consistent with Task 6's own tolerance); fail if they disagree.
   - **Otherwise (diff touches this package's own source/tests/config):** normal regression branch. No prior entry (Stage 1): informational only, zero exit. Prior entry exists: fail if `baselinePct - currentPct > 2.0` (absolute percentage-point delta, never a relative/ratio comparison — this is the exact terminology the spec's Minor finding corrected), using the **merge-base's own recorded baseline value only**, never a value the current PR's own diff wrote; pass otherwise.
4. `"coverage:measure": "pnpm -r --if-present run test:coverage"`, `"coverage:validate": "node scripts/provenance/validate-coverage.mjs --base-ref origin/main"`.

**Dependencies:** Task 5 (imports `baseline-lib.mjs`); Task 9's affected-package diff computation (same reuse rationale as Task 6 — one shared diff-shape detector, not two independent implementations). Independent of Task 6 otherwise (different files, same shared library and lifecycle design).

**Verification (`node --test scripts/provenance/validate-coverage.test.mjs`):**
- **Stage 1:** no merge-base entry for a synthetic package, diff touches the package's source/tests; informational, zero exit.
- **Stage 2 pass:** baseline `85.0%`, current `84.0%` (1-point drop, under 2), diff touches the package's source/tests; zero exit.
- **Stage 2 fail (implementation PR, legitimate failure):** baseline `85.0%`, current `82.0%` (3-point drop, over 2), diff touches the package's source/tests; non-zero exit, package named.
- **Same-diff-bypass negative test:** identical structure to Task 6's — a fixture where the diff touches both the package's source/tests AND `PERFORMANCE.md` in the same PR (masking a real 3-point drop by editing the HEAD-version baseline value), but the merge-base fixture (unedited) still shows `85.0%`; assert the validator still fails (the regression branch runs, not the integrity-check branch, since this diff is not baseline-only).
- **Baseline-only PR, honest value (new, lifecycle Step 2):** diff touches only `PERFORMANCE.md`, no package source/tests/config; fixture's real re-measured coverage is `82.0%`; the PR writes `82.0%`; assert zero exit regardless of the merge-base's old `85.0%` value and regardless of the >2-point relationship, proving the regression branch is genuinely skipped for this diff shape.
- **Baseline-only PR, dishonest value (new, lifecycle Step 2 negative case):** same setup, but the PR writes a false value (e.g. `85.0%`, not matching the real re-measured `82.0%`); assert non-zero exit.
- **Absolute-not-relative confirmation test:** baseline `10.0%`, current `8.5%` — a 1.5-point absolute drop (passes, under 2 points) that would be a 15% *relative* drop (would fail if the code mistakenly used R6's relative-percentage formula instead of R7's absolute-delta formula); asserting this passes is a direct regression test against exactly the terminology bug the spec's Minor review finding fixed — it must never silently reappear in the implementation.
- Real measurement run: `pnpm run coverage:measure` across all 17 packages, confirm every one produces a real coverage number with no execution errors (Angular's two packages included) before Task 8's full-repo capture.

---

### Task 8: R8 — generalized, path-scoped pack/install integrity suite + SAST_BASELINE.md initial population

**Files:**
- Create: `scripts/provenance/workspace-graph.mjs` (transitive `workspace:*` closure computation, shared utility)
- Create: `scripts/provenance/workspace-graph.test.mjs`
- Create: `scripts/provenance/pack-install-integrity.mjs`
- Create: `scripts/provenance/pack-install-integrity.test.mjs`
- Modify: `package.json` (add `integrity:pack-install` script)
- Modify: `docs/architecture/SAST_BASELINE.md` (Task 4's stub — this task overwrites it with real, captured content; see the dedicated subsection below)

**Ownership note:** this task creates the pack/install scripts and the `package.json` entry only (the CI step invoking `integrity:pack-install` is exclusively Task 9's responsibility, Plan Review finding #3). This task **is** the sole owner of `SAST_BASELINE.md`'s real initial content (Plan Review finding #4 — Task 4 only ever creates the empty stub; this task performs the actual capture, described below).

**Objective:**

1. **`workspace-graph.mjs`** — a pure module computing, for all 17 packages, the direct `workspace:*` edges (by reading each `package.json`'s `dependencies` for `workspace:*`-specifier entries) and their **full transitive closure** via a standard graph traversal, correctly handling the two real cross-edges this session's dependency-map re-derivation confirmed (`@ultimate/ng → themes → react/vue` — i.e. `themes` is not a leaf, and the traversal must not assume "framework package = dependency leaf"). Exports `getDirectDependencies(pkgName)` and `getTransitiveClosure(pkgName)`.
2. **`pack-install-integrity.mjs`** — generalizes `packages/ai/test/packaging.test.ts`'s proven mechanism (pack → `pnpm.overrides` with `file:` tarball paths → scratch-consumer `pnpm install --no-lockfile` → assert files exist), but data-driven per the spec's explicit generalization requirement (not the original test's hand-copied, `@ultimate/ai`-specific assertion list):
   - For a given target package name, computes its transitive closure via `workspace-graph.mjs`.
   - Topologically sorts the closure (dependencies packed before dependents — a genuine topological sort, not the current `measure-package-size.mjs`-style prefix shortcut, per spec §4 R8's explicit rejection of that pattern for this requirement) and runs `pnpm pack --pack-destination <scratch-dir>` for each member.
   - Builds a scratch consumer `package.json` with `dependencies: { "<target>": "file:<target-tarball>" }` and `pnpm.overrides` mapping every other closure member to its own `file:` tarball path (exact same shape as the Phase 9 precedent, generalized to N members instead of 2).
   - Runs `pnpm install --no-lockfile` in the scratch consumer.
   - **Data-driven assertion (the actual generalization):** reads the target package's own `package.json` `exports`/`main`/`module`/`types`/`bin`/`files` fields, resolves every path they reference, and asserts each one exists under `node_modules/@ultimate/<name>/` in the scratch consumer — derived from that package's own manifest at test time, never a hand-copied literal list.
   - Cleans up scratch directories (`mkdtempSync`/`rmSync`, matching the Phase 9 precedent).
3. This module is invoked once per "affected package" (computed by Task 9's CI step, not by this script itself — this script takes an explicit package-name argument and tests exactly that one package plus its closure; path-scoping selection logic lives in the CI step per the spec's own separation of "what gets tested" (this script) from "which packages are affected by this push/PR" (CI-level `git diff` logic, Task 9)).
4. `packages/ai/test/packaging.test.ts` is **left in place, unmodified** — it remains `@ultimate/ai`'s own Vitest-suite-level packaging proof (already passing, already reviewed in Phase 9); this task adds a *second*, generalized, CI-level mechanism covering all 17 packages, rather than deleting or rewriting working, already-approved Phase 9 code. (If a future cleanup pass wants to de-duplicate `@ultimate/ai`'s own test against the new generalized one, that is out of this task's scope — YAGNI, not needed to satisfy the spec.)

**`SAST_BASELINE.md` initial population (Plan Review finding #4 — this task's exclusive responsibility, distinct from Task 4's stub-only scope):**

1. Run CodeQL (using Task 4's `.github/codeql/codeql-config.yml`) against `main`'s actual current source, producing a real SARIF file — this is the one real, non-fixture CodeQL run in this entire plan, performed once, here, to establish ground truth. (Prior to Task 9 landing the CI-integrated `init`/`analyze` steps, this run happens via a local/manual invocation of the same `github/codeql-action`-equivalent CodeQL CLI, or via a throwaway CI run of Task 9's not-yet-merged steps — the exact mechanics of running CodeQL once outside the final CI wiring are an implementation-time logistics choice, not a behavioral one, since the config file and query pack are identical either way.)
2. Run Task 4's `validate-sast-baseline.mjs` against that real SARIF output, pointed at the still-empty stub `SAST_BASELINE.md` from Task 4 — every `error`/`warning` finding it reports is, by construction, "new" (nothing is baselined yet).
3. **Two possible real outcomes, both handled explicitly, per spec §4 R3's "does not assume `main` is clean":**
   - **Zero findings:** `docs/architecture/SAST_BASELINE.md` is committed as an **explicitly documented empty baseline** — the header-row-only structure from Task 4's stub is kept as-is, with one added comment line stating plainly that a real CodeQL scan against `main` at implementation time found zero qualifying findings (recording the scan date/commit for future auditability, not left as an ambiguous "was this ever actually run?" empty file).
   - **One or more findings:** every real finding's `partialFingerprints` value, rule ID, file path, and a one-line human note (written by whoever runs this task, describing what the finding is — not auto-generated boilerplate) is added as a real row in the table.
4. Re-run `validate-sast-baseline.mjs` against the same real SARIF output, now pointed at the just-populated real `SAST_BASELINE.md`; confirm zero exit (every real finding, if any, is now grandfathered) — this is the task's own closing verification, listed again in the Verification section below for completeness.

**Dependencies:** None on Tasks 1–7's *logic* (a fresh, independent mechanism) for the pack/install portion — but the `SAST_BASELINE.md` population sub-step depends on Task 4 existing first (needs the validator script and CodeQL config to run against). The pack/install portion of this task is otherwise independent and could run in parallel with Tasks 1–7.

**Verification (`node --test scripts/provenance/workspace-graph.test.mjs scripts/provenance/pack-install-integrity.test.mjs`):**
- `workspace-graph.mjs`: `getTransitiveClosure("@ultimate/ng")` returns exactly the 7 packages this session's dependency-map re-derivation found (`ng-core`, `uix-utils`, `uix-styled`, `uix-motion`, `uix-styles`, `uix-data`, `themes`) — real assertion against the real, current `package.json` files, not a fixture, since this is exactly the kind of fact that must stay correct as dependencies evolve. `getTransitiveClosure("@ultimate/themes")` includes `react` and `vue`, proving the cross-edge is handled (not silently dropped by an assume-leaf shortcut).
- `pack-install-integrity.mjs`, real run (not mocked) against `@ultimate/ai` (the smallest real closure, 2 dependencies) — confirm it passes and its runtime is in the same range as the Phase 9 precedent's empirically-measured 6.89s (recorded in the spec) — this cross-check confirms the generalized script isn't accidentally doing much more work than the original for an equivalent case.
- **Pack/install failure negative test (explicitly required by the task brief):** construct a scratch fixture package whose `package.json` `exports` map references a file the tarball's `files` array does not actually include; assert the generalized script correctly fails (proves the data-driven assertion catches a real broken-packaging case, not just a happy path).
- Real run against `@ultimate/ng` or `@ultimate/vue` (the largest real closures, 6-7 dependencies) — confirms the topological-sort/multi-package-pack logic works at the actual largest scale this repository has today, not just the smallest case.
- `SAST_BASELINE.md` population: confirm the file is non-empty-or-explicitly-documented-empty after the real run, and that a subsequent `pnpm run sast:validate` run against the same SARIF output passes cleanly (every real finding is now grandfathered).

---

### Task 9: R10 — CI workflow wiring (topology, ordering, path-scoping) — the sole task editing `.github/workflows/ci.yml`

**Files:**
- Modify: `.github/workflows/ci.yml`

**Ownership note (Plan Review finding #3):** this is the exclusive task that edits `.github/workflows/ci.yml` in this entire plan. Tasks 1, 2, 3, 6, 7, 8 create scripts/configs/manifests only; every CI step invoking those scripts is defined here, once, avoiding the prior draft's duplicated ownership between Task 4 and this task.

**Objective:** Add all new steps to the existing single `ci` job, in this exact order relative to the existing 20 steps (new steps marked `NEW`). **The `SAST baseline validation` step's argument passing is corrected here (Plan Review BLOCKING finding #1)** — the prior draft's `pnpm run sast:validate -- <sarif-path from previous step's output>` used a literal, non-substituted placeholder token, which is not valid shell syntax and would have been passed to the script verbatim as the string `<sarif-path`. The corrected step captures the real SARIF path from the CodeQL `analyze` step's own GitHub Actions output into a shell environment variable, then forwards that variable through pnpm's real `--` argument-forwarding mechanism:

```text
Checkout (existing)
Fetch base ref (existing)
Setup pnpm (existing)
Setup Node.js (existing)
Install dependencies (existing)
NEW: Dependency vulnerability scan            — pnpm run audit:validate
NEW: License scan                             — pnpm run license:validate
NEW: Install-script policy check              — pnpm run install-script-policy:validate
Lint (existing)
Format check (existing)
Typecheck (existing)
Build (existing)
Validate generated artifacts (existing)
Test (existing)
NEW: Determine affected packages              — computes $AFFECTED_PACKAGES via git diff against origin/main + workspace-graph.mjs closure expansion, writes to $GITHUB_OUTPUT
NEW: Pack/install integrity (affected)        — for each package in $AFFECTED_PACKAGES, pnpm run integrity:pack-install -- "$pkg"
NEW: CodeQL init                              — github/codeql-action/init@v3, with config-file: ./.github/codeql/codeql-config.yml (Task 4's file)
NEW: CodeQL analyze                           — github/codeql-action/analyze@v3 (id: codeql-analyze), produces SARIF; its documented `sarif-file` step output is captured into $GITHUB_ENV as SARIF_PATH by this same step (a real shell assignment, e.g. `echo "SARIF_PATH=${{ steps.codeql-analyze.outputs.sarif-output }}/javascript-typescript.sarif" >> "$GITHUB_ENV"`, using the action's own documented output — not a hardcoded, unverified path)
NEW: SAST baseline validation                 — pnpm run sast:validate -- "$SARIF_PATH"   (corrected — SARIF_PATH is a real environment variable set by the prior step, forwarded through pnpm's `--` mechanism exactly as R2/R1's other scripts already receive their own real arguments; matches the corrected root script from Task 4, which now takes a plain positional argument with no baked-in placeholder)
NEW: Bundle-size measurement                  — pnpm run size:measure
NEW: Bundle-size regression check             — pnpm run size:validate -- --base-ref origin/main
NEW: Coverage measurement                     — pnpm run coverage:measure
NEW: Coverage regression check                — pnpm run coverage:validate -- --base-ref origin/main
Provenance scripts self-tests (existing)      — now also covers Tasks 3/4/5/6/7/8's new *.test.mjs files automatically (no wiring change needed — pnpm run test:scripts already globs scripts/provenance/*.test.mjs)
Provenance validation (existing)
Package boundary validation (existing)
Prime dependency-ceiling validation (existing)
Compatibility manifest validation (existing)
CLI package boundary validation (existing)
MCP package boundary validation (existing)
AI package boundary validation (existing)
```

**Ordering rationale:** the three fast, dependency-policy-only checks (audit, license, install-script-policy) run immediately after install — before the more expensive lint/format/typecheck/build/test sequence — since they need only the resolved `node_modules` state, not a build, and failing fast on a security/policy violation before spending CI minutes on a full build+test is consistent with the existing steps' own fail-fast-early ordering (lint/format/typecheck precede build/test today). The affected-package computation, pack/install integrity, CodeQL, and the two regression gates are placed after "Test" since they depend on a real `pnpm run build` having already happened (Build precedes them) and, for CodeQL/regression gates, benefit from running after the cheaper existing gates have already had a chance to fail first. The two regression gates run last among the new steps since they are Stage-1-informational-capable (least urgent to fail fast) and their measurement scripts need the already-completed build.

**"Determine affected packages" step, exact mechanism:** `git diff --name-only $(git merge-base origin/main HEAD)...HEAD` (the same triple-dot merge-base-relative diff already proven working in `validate-provenance.mjs`'s `--base-ref` handling) to get changed file paths, map each changed `packages/<name>/...` path to its package name, expand via `workspace-graph.mjs`'s **reverse** closure (which packages transitively depend on each changed package — the inverse direction from R8's own forward-closure use, since "what changed" must expand to "what could break downstream", not "what this changed thing depends on"; this reverse-closure function is a natural, minimal addition to Task 8's `workspace-graph.mjs`, not a separate module), and writes the resulting package-name list to `$GITHUB_OUTPUT` for the next step to consume via a matrix or a loop (exact GitHub Actions syntax — `strategy.matrix` vs. a shell `for` loop over the output — is a workflow-authoring detail chosen at implementation time based on whichever reads more clearly in the final YAML; both satisfy the spec's path-scoping contract identically).

**Dependencies:** Depends on Tasks 1–8 all being complete (this task wires every script they created into CI; it has no independent logic of its own beyond the ordering/YAML itself and the affected-package-computation step, which needs Task 8's `workspace-graph.mjs` for its reverse-closure expansion). Tasks 6 and 7 in turn consume this step's `$AFFECTED_PACKAGES`-computation *shape* (the diff-against-merge-base logic) for their own baseline-only-vs-source-changed diff-shape detection (Task 6/7's two-step acceptance lifecycle) — the diff-shape detector is written once, here, and imported/reused by `validate-bundle-size.mjs`/`validate-coverage.mjs` rather than reimplemented, consistent with the shared-primitive pattern `baseline-lib.mjs` (Task 5) already establishes for the merge-base-reading half of the same problem.

**Verification:**
- Full `.github/workflows/ci.yml` YAML lint/syntax check (e.g. `actionlint` if available locally, or a manual read-through against GitHub Actions' documented syntax — no new CI-linting tool is introduced by this plan if one doesn't already exist in this repository; confirmed this session no `.actionlintrc` or similar exists, so this is a manual verification step, not a new automated gate).
- Confirm every new step references a real, existing `package.json` script created in Tasks 1–8 (no step invents a script name that doesn't exist).
- Confirm the "Determine affected packages" step's output correctly identifies (a) exactly one package when a single leaf package like `uix-data` changes with no downstream dependents in the diff, and (b) multiple packages when a widely-depended-on package like `uix-utils` changes (must include every one of `uix-styled`/`uix-motion`/`uix-data`/`ng-core`/`react-core`/`vue-core` and their own dependents, transitively) — this is the exact "one single-package change, one shared-dependency change touching multiple downstream packages" pair the spec's own R8 acceptance criteria requires, verified here at the CI-wiring level (Task 8 verified the closure-computation logic itself; this task verifies the CI step correctly uses it).

---

### Task 10: Full-repository verification pass + final report

**Files:** None created/modified — verification only.

**Objective:** Run every new script and every extended existing command against the real, current state of `main` with all of Tasks 1–9's changes applied, exactly matching the discipline every prior phase's closeout used (Phase 6–9's own "full workspace `pnpm run test`/`build`/`validate`/`typecheck` remain green" standard, spec §15 acceptance criterion 6):

- `pnpm install` (no lockfile drift from the two new devDependencies — `license-checker-rseidelsohn`, `@vitest/coverage-v8` — added cleanly).
- `pnpm run lint`, `pnpm run format:check`, `pnpm run typecheck`, `pnpm run build`, `pnpm run validate`, `pnpm run test` — all must remain green, zero regressions from any of Tasks 1–9's edits (especially the 15 `vitest.config.ts`/`package.json` edits in Task 7 and the `measure-package-size.mjs` edit in Task 6).
- `pnpm run test:scripts` — now covers every new `*.test.mjs` file from Tasks 3–8 automatically; confirm the count of discovered test files increased by exactly the number of new files created.
- `pnpm run audit:validate`, `pnpm run license:validate`, `pnpm run install-script-policy:validate`, `pnpm run sast:validate -- "$SARIF_PATH"` (using a real SARIF file path captured from a real CodeQL run, per Task 4's corrected argument-passing contract — no placeholder token), `pnpm run size:validate -- --base-ref origin/main`, `pnpm run coverage:validate -- --base-ref origin/main`, `pnpm run integrity:pack-install -- "@ultimate/ai"` (a real package name, not a placeholder) — each run once for real against `main`'s actual current state, output recorded.

**Dependencies:** Blocked by Tasks 1–9 (final integration check).

**Verification:** This task's own output *is* its verification — no further sub-steps.

---

## Verification Matrix

| Req | Implementation Task(s) | Verification command/test | Expected result |
|---|---|---|---|
| R1 | Task 1 | `pnpm audit --audit-level high --prod` | Exits per real `main` dependency state (recorded, not assumed); fails on synthetic `high`+ dep in `dependencies`; passes when only in `devDependencies` |
| R2 | Task 2 | `pnpm run license:validate` | Exits per real `main` state; fails on synthetic disallowed/unknown-license dep; `@ultimate/*` packages never flagged |
| R3 | Tasks 4 (script/config), 8 (real baseline capture), 9 (CI wiring — sole owner) | `node --test scripts/provenance/validate-sast-baseline.test.mjs` (Task 4, fixtures only); real CodeQL run + capture against `main` (Task 8); real CI run of the wired `init`→`analyze`→`sast:validate -- "$SARIF_PATH"` sequence (Task 9) | New finding → non-zero exit; grandfathered finding → zero exit; `note`-level never gates; missing baseline file fails closed; baseline-removal-for-fixed-code case passes; real `SAST_BASELINE.md` reflects `main`'s actual scan result (zero findings, explicitly documented, or real findings recorded) |
| R4 | Task 1 (monitoring half only — process half is Track D's) | N/A — satisfied directly by R1's CI gate per spec §4 R4 | R1's gate existing and passing is R4's entire Track B deliverable |
| R5 | Task 3 (script/config), Task 9 (CI wiring) | `node --test scripts/provenance/validate-install-script-policy.test.mjs` | Passes on real `main` (no `pnpm-workspace.yaml` build-approval override present, confirmed this session); fails on synthetic `onlyBuiltDependencies`/`ignoredBuiltDependencies` fixture naming a non-resolvable package |
| R6 | Tasks 5, 6 (scripts), 9 (CI wiring + shared diff-shape detector) | `node --test scripts/provenance/validate-bundle-size.test.mjs`; real `pnpm run size:measure` across 17 packages | Stage 1 informational on first measurement; Stage 2 (source-changed diff) fails >15% vs. merge-base baseline, passes ≤15%; same-diff source+baseline-edit bypass attempt still fails; baseline-only diff with an honest re-measured value passes via the integrity check; baseline-only diff with a dishonest value fails |
| R7 | Tasks 5, 7 (scripts), 9 (CI wiring + shared diff-shape detector) | `node --test scripts/provenance/validate-coverage.test.mjs`; real `pnpm run coverage:measure` across 17 packages (15 Vitest + 2 Angular) | Stage 1 informational; Stage 2 (source-changed diff) fails >2.0-point absolute drop, passes ≤2.0 points vs. merge-base baseline; same-diff bypass attempt still fails; baseline-only diff honest/dishonest cases pass/fail identically to R6's; 15%-relative-but-<2-point-absolute case correctly passes (terminology regression guard) |
| R8 | Task 8 (scripts), 9 (CI wiring + path-scoping) | `node --test scripts/provenance/workspace-graph.test.mjs scripts/provenance/pack-install-integrity.test.mjs`; real runs against `@ultimate/ai` (small closure) and `@ultimate/ng`/`@ultimate/vue` (large closures, cross-edge-inclusive) | Closure computation matches real, current dependency graph including the `themes→react/vue` cross-edge; real pack/install passes for all tested packages; synthetic broken-manifest fixture correctly fails |
| R9 | None (contract-only, spec §4 R9) | N/A | No CI artifact created or expected — verified by absence, per spec |
| R10 | Task 9 (sole `.github/workflows/ci.yml` owner) | Manual YAML review; real CI-step-name/script-existence cross-check; affected-package-computation spot-check on a single-package and a shared-dependency change | Every new step exists, in the specified order, referencing a real script; affected-package output correctly scopes to 1 package (leaf change) and N packages (shared-dependency change); no other task's edits touch `.github/workflows/ci.yml` |

---

## Self-Review Notes (for the plan author, not a task to execute)

- **Angular coverage mechanism (Task 7) is the one genuinely new fact this plan surfaced beyond the approved spec's own evidence.** The spec's R7 evidence section said "every `packages/*/vitest.config.ts` already uses `defineConfig`... confirmed this session across all 15 files" — true as far as it went, but `ng`/`ng-core` (2 of the 17 in-scope packages) have no such file at all, confirmed freshly during this plan's own repository inspection. This is not a spec contradiction (the spec never claimed all 17 have a `vitest.config.ts` — it separately scoped R7 to "all 17 publishable packages" without asserting uniform config-file wiring) — it is exactly the kind of implementation-level detail spec §16 anticipated needing resolution during planning, resolved here using real evidence (`@angular/build:unit-test`'s own `vitest@4.0.8` devDependency and `--code-coverage` flag, confirmed this session) rather than assumed or glossed over.
- **`measure-package-size.mjs`'s refactor into an importable function (Task 6)** is a small, necessary structural change to let `validate-bundle-size.mjs` reuse its measurement logic directly rather than shelling out and re-parsing stdout — flagged explicitly here since it's the one place this plan modifies existing, working, previously-approved code (Phase 1/2's script) rather than only adding new files; the change is additive (export a function that was previously only reachable via the script's top-level `for` loop) and does not alter the standalone script's existing CLI behavior or output format.
- **No task in this plan touches `.changeset/`, `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`, any Storybook/Playwright config, any `apps/*` directory, or `@ultimate/cli`'s command set** — confirmed via a final scan of every task's Files list above against the spec's own Non-Goals (§13) and this plan's Global Constraints.

---

## Plan Review Correction Log

### Correction pass 1 — 2026-09-08 (in response to Plan Review round 1, REQUEST CHANGES)

Five findings addressed:

1. **BLOCKING — `sast:validate` argument handling.** The root script no longer bakes in a literal `<sarif-path>` placeholder (invalid shell syntax). It now takes a plain positional CLI argument with nothing hardcoded; Task 9's CI step captures the real SARIF path from `codeql-action/analyze`'s own step output into a `SARIF_PATH` environment variable and forwards it via `pnpm run sast:validate -- "$SARIF_PATH"`. Task 4, Task 9, Task 10, and the Verification Matrix all updated consistently.
2. **BLOCKING — R6/R7 baseline-update lifecycle.** Replaced the ambiguous "reviewer approves, then update the baseline" wording with a fully specified two-PR lifecycle: an implementation PR is always regression-checked against the merge-base baseline and may legitimately fail (landing it requires an explicit, out-of-band human/repository-settings action, not a CI-internal bypass); a separate, later, baseline-only PR is detected by diff shape (touches only the baseline file, not the package's source/manifest) and is checked instead by a truthfulness/integrity comparison (the written value must match a fresh re-measurement) rather than the regression comparison, since a source-unchanged diff has nothing to regress-check. No skip flag, allow-regression flag, environment-variable override, or same-PR-modified-baseline read was introduced anywhere. Documented once in full in Task 6 (shared identically by Task 7), referenced from Global Constraints, Task 9, and the Verification Matrix.
3. **MAJOR — duplicated CodeQL CI-editing ownership.** Removed `.github/workflows/ci.yml` from Task 4's Files list (and, on the same principle, from Tasks 1, 2, 3, 6, 7, 8 — the review's stated rule, "exactly one task responsible for editing CI workflow topology: Task 9," was applied to every task, not only Task 4). Task 9 is now the sole task in the plan that edits `.github/workflows/ci.yml`; every other affected task gained an explicit "Ownership note" stating this.
4. **MAJOR — SAST baseline creation vs. population ownership.** Task 4 now explicitly creates only the empty/stub `SAST_BASELINE.md` (header row, documented-empty) and uses only hand-written fixtures in its own tests, never the real repository file. Task 8 gained a dedicated "SAST_BASELINE.md initial population" subsection performing the actual real CodeQL run against `main`, handling both the zero-findings and real-findings outcomes explicitly, and re-verifying the populated file passes.
5. **MAJOR — speculative pnpm configuration behavior in R5.** Removed the invented `enable-pre-post-scripts`/`dangerouslyAllowAllBuilds`-or-similarly-named language. Task 3 was rewritten around two mechanisms empirically confirmed against this session's actual pinned `pnpm@9.6.0` (`pnpm config get enable-scripts`, and direct inspection of this repository's real `.npmrc` and `pnpm-workspace.yaml`): `.npmrc`'s `enable-scripts` (retained but documented as informational-only, since it is a blanket switch already at pnpm's own default and carries no independent signal) and `pnpm-workspace.yaml`'s `onlyBuiltDependencies`/`ignoredBuiltDependencies` fields (the real, meaningful check — fails if either field names a package not resolvable in the lockfile). No hypothetical or pattern-matched key names remain. Task 3's tests and the Verification Matrix updated to test only these confirmed mechanisms; the task's own root-script name (`install-script-policy:validate`), previously only implied, is now stated explicitly.

**Consistency pass performed** across Global Constraints, Tasks 3/4/6/7/8/9/10, the Verification Matrix, and Self-Review Notes — no stale "relative-regression"-for-R7, literal-placeholder-argument, dual-CI-ownership, or speculative-pnpm-key wording remained after the edits above.
