# Specification: Workstream 2 — Release, CI and Tooling (B1–B4)

**Document:** `docs/superpowers/specs/2026-10-17-workstream-2-release-ci-tooling-design.md`
**Status:** REVIEWED — Spec Review complete (2026-10-17, §11). Amendment A1 (2026-10-18, user rulings) passed independent Spec Review (approve with changes, applied, re-reviewed). The user authorized proceeding to the Implementation Plan and its Plan Review. This document authorizes no implementation, workflow change, status edit, exception, commit or push.
**Baseline:** `origin/main` at `f5a0f1387b71b4955b93eb361df5684805c83b07` (PR #31 merge), verified 2026-10-17.
**Origin:** the 2026-10-17 remaining-work audit and its consolidation into two workstreams. This is Workstream 2. Workstream 1 (component behaviour, visual parity and accessibility) is a separate Specification.
**Register rows covered:** [C01](../../architecture/COMPLETION_REGISTER.md), C03 (support ranges only), C09 (tooling), C10 (Stage 1), C11 (remainder), C12 (release path; not final acceptance).

---

## 1. Intent

The first restricted pre-1.0 publish (ruling S-1) needs four things that are independent of component work:

- a release workflow that reaches its Version and Publish paths;
- CI signals whose records match what CI actually does;
- truthful support and CLI evidence;
- the measurement and documentation tooling required by §40.

This Specification collects that work into one reviewed contract so it can proceed while Workstream 1's family waves run. It cites settled decisions instead of restating them.

## 2. Goals, non-goals, anti-goals

**Goals**

- **G1 (B1):** a Release workflow on `main` whose Select mode, Version and Publish gating is verified on a real run, with external-only evidence named as such.
- **G2 (B2):** C01 and GAP-091 records that match CI reality, and Spec/Plan status lines that match shipped work.
- **G3 (B3):** compatibility-manifest ranges that agree with the published peer ranges, and an evidence map for ADR-058 CLI-1–CLI-6 with the confirmed remainder implemented.
- **G4 (B4):** an ADR-057 Stage 1 harness and recorded P1–P8 baselines, and ADR-058 DOC-1–DOC-5 tooling (drift check, generated reference, coverage check) that scales to the component list C02 settles.

**Non-goals**

- Component source, styles, stories or visual baselines (Workstream 1).
- GAP-094 manifest backfill (C04, under its own batch PRs).
- Decisions D1 and D2 (Workstream 1).
- C02, C06 and C07 prerequisite work (§8).
- Package naming (N-1 / DECISION-E).
- Stage 2 performance thresholds (ADR-057: none approved).
- The deferred provenance-validator Minor findings.

**Anti-goals (failure even if every check passes)**

- Claiming a successful publish, a passing Version Packages cycle, branch protection, or a valid `NPM_TOKEN` from anything other than the real external event.
- Creating a second Changesets repair alongside PR #15, or editing PR #15.
- Weakening any CI step, threshold or baseline, or adding a CI exception.
- Registering a new gap for the Changesets action/CLI mismatch, or relabelling GAP-087. GAP-087 stays RESOLVED.
- Editing the user's uncommitted Phase 10 Spec/Plan amendment or the primary checkout's working tree.

## 3. Verified current state (2026-10-17)

| Item                     | Evidence                                                                                                            | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main` CI                | [run 38966084260](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38966084260) at `f5a0f138`      | Every `ci` step and all six browser/SSR jobs pass, except "Provenance validation", which fails only on 646 missing production entries (C04/GAP-094). Coverage, provenance self-tests, lint, format, test and SAST pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `main` Release           | [run 38966084574](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38966084574)                    | Fails in Select mode: `changesets/action/select-mode@v2.1.2` needs Changesets CLI v3; the workspace pins `@changesets/cli` `^2.27.0`. Version and Publish are skipped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| PR #15                   | head `5cb9f0a3`, base `94fac002`                                                                                    | Open, not draft, no reviews, mergeable (47 commits behind `main`, no conflicts). It changes only `.github/workflows/release.yml` and `docs/architecture/MIGRATION.md`. It replaces the v2.1.2 sub-actions with `changesets/action@v1`, adds a `ci-gate` job (full `ci` passed on the exact pushed SHA), and adds a `publish-eligibility` job (a uniquely matched, reviewed and merged Version Packages PR, with the `main` tip rechecked before npm authentication).                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| PR #15 CI                | [run 38568659298](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38568659298) (2026-10-14)       | Ran on the stale base. It failed coverage, provenance self-tests, provenance validation and the ng/vue G3-B/G3-D visual specs; all except provenance validation now pass on `main`. Not comparable until refreshed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PR #15 governance        | primary checkout, branch `docs/gap-087-node-policy-spec`                                                            | A "2026-10-14 scoped amendment for Spec Review" to the Phase 10 Spec (C3/R4/§9/§11, approval of the Version Packages PR's CI runs) and a rewritten Phase 10 Plan exist **only as the user's uncommitted edits**. Local commit `b45f9d5a` is patch-identical to PR #15's commit (`git range-diff`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| GAP-091                  | `BLUEPRINT_GAPS.md`                                                                                                 | Still OPEN with "Architectural decision required: Yes". The fix merged in [PR #16](https://github.com/majedsiefalnasr/ultimate-packages/pull/16) (`65c2345c`: React/Vue coverage scope excludes stories, tests, fixtures, mocks and declarations; the validator gets a baseline-only diff path).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| GAP-091 records          | PR #16 body; all git refs; local session logs (Spec Review, 2026-10-17)                                             | PR #16 says it "implements the approved GAP-091 Specification and ADR-060". **Neither exists in any git ref or surviving worktree.** `DECISIONS.md` jumps from ADR-059 to ADR-061. Both, and a C01 research finding, were uncommitted files in the worktree `/private/tmp/ultimate-c01-ci-characterization`, which no longer exists. A session log keeps a full read of the Spec (`2026-10-14-gap-091-react-vue-coverage-scope-design.md`, R1–R3, AC1–AC5). Its own status line reads "REVIEWED — … human approval is pending". No ADR-060 body text survives anywhere. Of explicit user approval, only references survive: the 2026-10-15 merge authorization calls the documents "the approved Spec or Plan", and ADR-061 says to keep "PR #16's approved four-file scope".                                                                                                                                                   |
| Coverage baselines       | `PERFORMANCE.md`                                                                                                    | React `89.69`, Vue `92.13` (measured 2026-09-09). PR #16 measured 91.65% and 95.09% under the new scope and deferred the "separately reviewed baseline-only change". Not yet made.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| C01                      | register                                                                                                            | Status text predates PRs #16–#24. GAP-088, 089, 090, 092 and 093 are RESOLVED; GAP-091 is OPEN (above).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Out-of-date status lines | files on `main`                                                                                                     | These still say PROPOSED although their work shipped: <ul><li>code-quality Spec and Plan (2026-10-13): GAP-092, PR #9</li><li>GAP-087 Spec and Plan (2026-10-14): PR #14</li></ul>The G3-E E1-V2 drafts (`2026-10-08-gap-064-g3e-e1-v2-*`) are superseded (E1-V2 CLOSED). ROADMAP footnote 4 still describes MCP reading the monorepo manifest, which is out of date after GAP-131.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| C03 ranges               | `compatibility-manifest.json`; `COMPATIBILITY.md:18`; package `peerDependencies`; `pnpm-lock.yaml`; installed smoke | Angular `frameworkVersionRange` is `^21.0.7`, but `@ultimate/ng` and `@ultimate/ng-core` peers are `^21.2.22` (since scaffold, `31103e8d`/`a75d05ec`, 2026-08-29). **Nothing shows Ultimate supports 21.0.7:**<ul><li>`^21.0.7` comes from `COMPATIBILITY.md` ("PrimeNG 21.1.9 peer range", `d975aa5e`, 2026-08-28, before the packages existed) and was copied into the manifest (`10048f0c`);</li><li>the lockfile resolves only Angular 21.2.25;</li><li>the installed-package smoke installs `^21.2.22`;</li><li>`21.0.7` appears elsewhere only as an input value in CLI/MCP compatibility tests and one CLI fixture's declared range, never as an installed version;</li><li>the GAP-095 remediation kept the peers at `^21.2.22`.</li></ul>The manifest and peers for React (`^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0`) and Vue (`^3.5.2`) agree with each other; their floors are not yet checked against installed versions. |
| C11                      | `scripts/provenance/installed-cli-mcp-smoke.mjs`; `packages/cli/test`                                               | Unit tests exist per command (`add`, `ai`, `doctor`, `generate`, `init`, `theme`). The installed-package smoke uses only `pnpm`. ADR-058 CLI-5 requires pnpm **and** npm. EX-1 (`create`) and EX-2 (`ai` stub) are approved exceptions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| C09                      | `packages/component-metadata/src/records`; `skills/`                                                                | 8 records and 8 Skills (button, checkbox, dialog, menu, paginator, scroller, table, tooltip). No drift check or generated API reference step in `ci.yml`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| C10                      | `PERFORMANCE.md`; `ci.yml`                                                                                          | P1 bundle size is measured and gated (15%). P2–P8 Stage 1 baselines are not recorded. P8's SSR dependency (GAP-088) is resolved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## 4. Binding inputs (cited, not restated)

| Source                                                                                                                                           | What this Specification relies on                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Phase 10 Track C Spec](2026-09-10-phase-10-migration-release-provenance-design.md) C3, C4, C5, R4, R5, §9, §11                                  | Release flow, human approval of the Version Packages PR, restricted access, token authentication, no `--provenance`/`id-token: write`, fail-closed gating, the external-only check list |
| [ADR-059](../../architecture/DECISIONS.md#adr-059--node-24150-baseline-for-the-private-workspace-and-release-toolchain-gap-087)                  | Node 24.15.0 for every Release job; pnpm 9.6.0                                                                                                                                          |
| [ADR-057](../../architecture/DECISIONS.md#adr-057--performance-benchmarks-stage-1-protocol-and-p1p8-measurement-methods) and its research record | Stage 1 protocol, P1–P8 methods, CI environment of record, no timing thresholds                                                                                                         |
| [ADR-058](../../architecture/DECISIONS.md#adr-058--cli-quality-and-documented-api-evidence-bars-for-the-first-pre-10-publish)                    | CLI-1–CLI-6, DOC-1–DOC-5, Storybook docs as the reference destination, EX-1/EX-2                                                                                                        |
| [ADR-044](../../architecture/DECISIONS.md), [ADR-009](../../architecture/DECISIONS.md#adr-009--component-metadata-as-source-of-truth)            | Storybook docs; metadata as the source of truth                                                                                                                                         |
| ADR-050; C03                                                                                                                                     | Vue floor; manifest/peer reconciliation scope                                                                                                                                           |
| `AGENTS.md` §3, §4, §7                                                                                                                           | Gates; the four evidence claims; git safety                                                                                                                                             |

## 5. Parts and requirements

Each requirement has an ID (`W2-<part>-R<n>`). Each acceptance criterion names its evidence claim: **Implemented**, **Verified**, **CI-enforced** or **Externally unexercisable** (`AGENTS.md` §4).

### B1 — Release path (C12, early repair portion)

PR #15 is the existing in-flight repair. This Specification does not duplicate or alter it. B1 has two branches, chosen by PR #15's outcome at the B1 start gate.

**Start gate.** B1 starts after one of these:

- **B1-M:** PR #15 is merged, following its own Spec Review of the Phase 10 amendment, its own review, and a CI run refreshed against current `main` that differs from `main`'s CI only in steps PR #15 explains.
- **B1-R:** the user records that PR #15 will not merge.

Until then B1 stays pending. B2–B4 do not wait for it.

**W2-B1-R1 (B1-M) — first-run verification.**

- Record the first Release run on `main` after the PR #15 merge: run ID, head SHA, and the result of each job.
- Expected with no pending changesets:
  - `ci-gate` confirms the `ci` job passed on that SHA;
  - the version job reports no changesets;
  - `publish-eligibility` is not eligible;
  - no npm authentication or publish step runs.
- Any other result is a defect that goes to `superpowers:systematic-debugging`. It is not re-labelled as success.

**W2-B1-R2 (B1-R) — repair.**

- Specify and implement a release workflow that meets Phase 10 R4 items 1–5, R5, C5's absence checks and §9.
- Use a Changesets action release that supports the pinned CLI v2, or a CLI upgrade justified by research. Either choice goes to Spec Review as an amendment to this document before the Plan.
- Keep ADR-059's Node pin in every job.
- Then apply W2-B1-R1.

**W2-B1-R3 — record.**

- C12's status records the run evidence and the PR #15 outcome.
- GAP-087's entry may add a cross-reference only. Its status is unchanged.
- No new gap ID is created for the action/CLI mismatch.

**W2-B1-R4 — external-only items.**

- The Version Packages PR open/merge cycle, a real restricted publish, `NPM_TOKEN` validity, GitHub branch protection and Actions approval settings stay **Externally unexercisable** until a real event occurs. They are listed by name in C12.
- A real changeset is not created by this workstream. The first Version/Publish cycle belongs to C12 final acceptance, after N-1 names (§8).

**B1 acceptance**

| ID    | Criterion                                                                                                                                                                             | Evidence claim                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| B1-A1 | `release.yml` on `main` contains no `changesets/action/*@v2` sub-action that requires CLI v3; `actionlint` passes; Node `24.15.0` in every job                                        | Verified (static)                       |
| B1-A2 | No `id-token: write` or `--provenance` on publish; publish uses `secrets.NPM_TOKEN`                                                                                                   | Verified (static)                       |
| B1-A3 | First Release run on `main` after the repair: the select/gate path completes with each job's result recorded, and Publish does not run without an eligible merged Version Packages PR | Verified (one real run)                 |
| B1-A4 | Version Packages cycle, real publish, token, branch protection                                                                                                                        | Externally unexercisable, listed in C12 |

### B2 — CI signal and record reconciliation (C01, GAP-091)

**W2-B2-R1 — GAP-091 decision record.** The coverage-scope decision that PR #16 implemented must exist in the repository before GAP-091 closes. The source is [ADR-060](../../architecture/DECISIONS.md#adr-060--react-and-vue-r7-line-coverage-measures-production-runtime-source-gap-091), which records the user's 2026-10-17 decision (X1). It is drafted on this branch and delivered with this Specification and its Plan. It records exactly what `65c2345c` implements:

- React/Vue line coverage measures runtime modules under `src/**`, with the nine extensions;
- exclusions: `*.stories.*`, `*.spec.*`, `*.test.*`, `.d.ts`/`.d.mts`/`.d.cts`, and the six test/fixture/mock directory names;
- test discovery and execution are unchanged;
- `total.lines.pct`, the 2-point threshold and the merge-base comparison are unchanged; the other 15 packages are unchanged;
- for React/Vue, only a diff that is exactly `docs/architecture/PERFORMANCE.md` takes the baseline-integrity path; a `vitest.config.ts` change always takes the regression path;
- the new baselines arrive in a separate, reviewed, baseline-only change.

ADR-060 records a decision made now. It does not claim that the missing GAP-091 Specification, Plan or earlier ADR-060 text was approved. The log copy of the GAP-091 draft Specification is cited only as dated evidence.

**W2-B2-R2a — integrity check compares only changed rows (Amendment A1, user ruling 2026-10-18; [ADR-066](../../architecture/DECISIONS.md#adr-066--performancemd-integrity-checks-compare-only-baseline-rows-the-diff-changes)).**

Finding F1 is that any diff touching `docs/architecture/PERFORMANCE.md` but not a package's `src/` or `package.json` puts that package on the integrity path, even when its row is unchanged. At least 13 of the 17 coverage rows (log values rounded to 0.1) and several bundle-size rows are stale. So no `PERFORMANCE.md` change can pass CI without refreshing unrelated baselines.

One separate validator PR changes this:

- **When integrity applies.** For each package, the integrity check (`|written − fresh| ≤ tolerance`) applies only when both hold:
  - (a) the diff is baseline-only for that package under the existing rules, which include ADR-060's strict React/Vue rule: the complete diff is exactly `PERFORMANCE.md`;
  - (b) that package's baseline value **differs** between the merge-base and HEAD versions of `PERFORMANCE.md`, including a row added. Values are compared as parsed numbers, so `89.70` and `89.7` count as unchanged.
- **Unchanged rows** take the normal regression path against the merge-base value.
- **Unchanged rules.** The coverage tolerance stays 0.05 and the 2-point coverage threshold is unchanged. The R6 rules are unchanged too: the 0.005 KB tolerance and the 15% gate.
- **`vitest.config.ts`.** A change to a package's `vitest.config.ts` always takes that package's normal regression path. This now applies to all 17 packages (user ruling 1). It inverts today's classification for the other 15 and amends ADR-060.
- **Fail closed.** These fail rather than pass:
  - `PERFORMANCE.md` is unreadable at either ref. Today `readFileAtRef` returns `null` on any Git error, and the change replaces that behaviour.
  - The merge-base baseline table is empty or missing.
  - A row was removed at HEAD.
- **Not baseline-only.** A changed row in a diff that is not baseline-only takes the regression path against the merge-base value, and the written value is ignored. This is today's behaviour.
- **Applies to R7 coverage and R6 bundle size alike.** Both use the same baseline-only detector. Without the R6 part, the stale size rows would still block every `PERFORMANCE.md`-only PR. That part is a controller ruling, **proposed pending the user's confirmation** (ADR-066), and Task 1a's merge depends on it. If the user declines it, B2-R2, B2-R3, B2-R4 and B4-R2 stay blocked pending a new ruling.
- **Parser bounds.** Each baseline parser reads only its own table and stops at the next heading. So later tables, such as P1–P8 Stage 1 rows named after packages, are never read as baselines.
- **Performance sections.** Edits to the P1–P8 performance sections that change no coverage or size row never trigger an integrity check.

**W2-B2-R2 — re-baseline.**

- One PR whose entire diff is `docs/architecture/PERFORMANCE.md`, changing only the React and Vue coverage rows, measured in the CI environment of record at a recorded commit.
  - It may add exactly one sentence describing only those two re-baselined rows: the measuring CI run, the commit and the ADR-060 scope. Without it, the table's existing "measured 2026-09-09" note would misdescribe them. This is a controller ruling, flagged to the user.
- It runs after B2-R2a is merged.
- This is the baseline-only change PR #16 deferred.
- The other 15 packages' coverage rows and every bundle-size row stay unchanged and are not normalised. Under B2-R2a they take the regression path.
- No threshold change.

**W2-B2-R3 — GAP-091 closeout.** Status becomes RESOLVED with:

- PR #16 and its merge;
- the B2-R2 PR and CI run;
- a closeout record under `docs/architecture/research/`.

**W2-B2-R4 — C01 closeout.**

- C01 closes when every `ci` step and browser/SSR job passes on `main`, except "Provenance validation".
- For that step, CI's failure lines must show missing production entries as its only failure reason. Under C01's own wording ("GAP-094 provenance content closes under C04"), that reason is owned by C04.
- The closeout cites the run and compares failure lines, not just step colours.
- C01 does not claim "all CI green". C12's "passing CI" prerequisite stays open until GAP-094 resolves.

**W2-B2-R5 — status lines.** These files get status lines that cite their merge and closeout records:

- code-quality Spec and Plan (2026-10-13);
- GAP-087 Spec and Plan (2026-10-14);
- the three G3-E E1-V2 drafts, marked superseded with a pointer to the E1-V2 closure record;
- ROADMAP footnote 4, corrected to the GAP-131 installed-manifest behaviour.

Their body text is not changed. The Phase 10 Spec and Plan are excluded, because the user has uncommitted edits to both.

**B2 acceptance**

| ID     | Criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Evidence claim        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| B2-A1  | ADR-060 merged to `main` in `DECISIONS.md`, matching `65c2345c` and stating it records the decision as of 2026-10-17                                                                                                                                                                                                                                                                                                                                                            | Implemented           |
| B2-A2a | Real-Git fixture tests:<ul><li>changed row → integrity, both honest and dishonest values;</li><li>unchanged stale row → regression path, which passes;</li><li>P1–P8-only edit → no integrity check;</li><li>`vitest.config.ts` + row change → regression against merge-base;</li><li>removed row, unreadable ref and empty merge-base table → fail;</li><li>a package-named Stage 1 table after Phase 10 is not read as a baseline.</li></ul>The same cases are covered for R6 | CI-enforced           |
| B2-A2  | `coverage:validate` and `size:validate` pass on the re-baseline PR; the diff is only `PERFORMANCE.md`, changing only the React/Vue coverage rows plus the one sentence describing them                                                                                                                                                                                                                                                                                          | CI-enforced           |
| B2-A3  | GAP-091 RESOLVED with closeout record; C01 closed per R4 with failure-line comparison                                                                                                                                                                                                                                                                                                                                                                                           | Implemented, Verified |
| B2-A4  | Every listed status line matches its shipped state; no other text in those files changes                                                                                                                                                                                                                                                                                                                                                                                        | Implemented           |

### B3 — Support ranges and CLI/MCP evidence (C03 ranges, C11)

**W2-B3-R1 — range reconciliation.**

- Compare each manifest `frameworkVersionRange` with the matching framework packages' peer ranges, and their declared floors with the versions CI actually installs.
- **Angular (decided at Spec Review 2026-10-17, on evidence):** set the manifest's Angular `frameworkVersionRange` and `COMPATIBILITY.md`'s Angular line to `^21.2.22`, the published peer range of `@ultimate/ng` and `@ultimate/ng-core`.
  - This corrects an inherited PrimeNG claim (§3). It does not narrow what Ultimate supports: a package manager already flags Angular below 21.2.22 against the published peers.
  - The peer ranges do not change.
  - Consequence: CLI `init`/`add`/`doctor` and MCP `check_framework_compatibility` will report Angular 21.0.7–21.2.21 projects as incompatible.
  - The CLI/MCP tests that use `21.0.7` as the "real manifest" value move to an in-range version, and gain one negative case below `21.2.22`.
  - `MIGRATION.md` records the change.
- React and Vue: compare each declared floor with the versions CI installs. Change a range only on a confirmed conflict. A floor CI never installs is recorded as unverified, not narrowed, unless the user decides otherwise.

**W2-B3-R2 — CI enforcement.** "Compatibility manifest validation" fails when a manifest range and the matching package peer range disagree. Existing checks are not weakened.

**W2-B3-R3 — CLI evidence map.**

- A dated research record maps each of CLI-1–CLI-6 to its current evidence (test file, CI step, README/`--help` text), or marks it missing.
- Known candidate: CLI-5 (npm smoke).
- EX-1 and EX-2 are cited, not re-opened.

**W2-B3-R4 — remainder (Amendment A1).** The R3 map (`research/2026-10-17-w2-b3-support-evidence.md`) confirmed CLI-1, CLI-5 and CLI-6 Missing. Remediation is one PR, separate from the B3-R1–R3 PR:

- **CLI-1.**
  - Tests assert the documented exit code of each refusal and error path: `doctor` 0 and 1, and the `add` and `theme` no-framework refusals.
  - Every error exit is documented in `packages/cli/README.md` and in help output.
- **CLI-5.** The installed-package smoke runs every consumer with both pnpm and npm.
- **CLI-6.**
  - `ultimate --help`/`-h` and `ultimate <cmd> --help`/`-h` print the command, its arguments and its exit codes, and exit 0.
  - The README lists every command, argument and exit code.
  - Tests assert the help output for every command, and that the README and the help agree.
- **Limits.**
  - EX-1 (`create`) and EX-2 (`ai` stub) stay approved exceptions and are not reopened.
  - No new command or behaviour beyond help text and documented exits.

**B3 acceptance**

| ID    | Criterion                                                                                                      | Evidence claim           |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| B3-A1 | Manifest and peer ranges agree for all three frameworks; the disagreement test fails on a seeded mismatch      | CI-enforced              |
| B3-A2 | CLI-1–CLI-6 map committed; every bar has evidence or an approved exception                                     | Implemented, Verified    |
| B3-A3 | Installed smoke passes with each required package manager                                                      | CI-enforced              |
| B3-A5 | CLI-1 and CLI-6 tests pass: refusal and error exit codes, help output for every command, README and help agree | CI-enforced              |
| B3-A4 | Behaviour after a real npm publish of `@ultimate/cli`/`@ultimate/mcp`                                          | Externally unexercisable |

### B4 — Measurement and documentation tooling (C10 Stage 1, C09 tooling)

**W2-B4-R1 — Stage 1 harness.** Implements ADR-057's protocol for P2–P8 on the playground applications, in the CI environment of record. It records the run's identity and environment, plus median, p95, interquartile range and same-commit variance. The suggested counts are starting values only.

**Amendment A1 clarifications:**

- **P7 `openToVisible`** ends at the first frame where the overlay is rendered visible. "Visible" means the overlay root is in the DOM, `element.checkVisibility({ opacityProperty: true, visibilityProperty: true })` is true (this covers `display`, `visibility` and `opacity`, including on ancestors), and its bounding box is non-zero.
  - It does not wait for enter animations to finish. This follows ADR-057 research §4, "open-to-visible".
  - `closeToRemoved` still measures until removal.
  - The motion-enabled and reduced-motion variants are both required.
  - No animation-duration metric is added.
- **Workflow gate.** The manual workflow runs `pnpm run perf:stats:test` before any measurement, so it cannot produce baseline artifacts when those unit tests fail. This does not make them a per-PR check.
- **Timing granularity.** Timing resolution is about one display frame (about 16.7 ms), because of the settle rule. This is recorded as a limitation, not hidden. No timing threshold is introduced.
- **P2 tree-shaking results are findings only,** not a mandate to optimise bundles.

**W2-B4-R2 — baselines.**

- The P1–P8 Stage 1 values go in `PERFORMANCE.md`, each with its commit, environment and variance.
- No timing gate is added; the P1 15% gate is unchanged.
- Values are labelled as covering the components shipped at the measured commit.

**W2-B4-R3 — DOC tooling.** Covers DOC-2, DOC-3 and a DOC-1/DOC-4 coverage report:

- an automated metadata-versus-API drift check;
- a generated API reference on Storybook docs pages, kept composable with authored guidance;
- a check that lists every shipped component lacking `api`, `accessibility` or `guidance` metadata, a Skill section, or story coverage of its documented states.

**Drift contract (Amendment A1, user ruling 2026-10-18):**

- **Classify every reported mismatch** against the real source and the documented API decisions: record headers, ADRs, gap records. Record each classification with its evidence in a dated research record.
- **Genuinely missing public API facts** are added to the record. This includes the stale Dialog `role`, the Angular Menu inputs and outputs, and the Table additions. Affected API pages are regenerated, along with any generated Skills/`llms` artifact derived from the records.
- **Deliberate omissions** go only into a narrow, explicit exclusion list in a committed file. Each entry names the component, framework, `apiKind` (prop or event), symbol, and a rationale citing its documented source.
  - An entry suppresses exactly one matching "missing-in-record" item.
  - A "missing-in-source" item (the record claims API the source lacks) is never excludable. Neither is a structural problem: a missing map entry, a missing source file or an orphan entry.
  - Wildcards are not allowed.
  - An entry that matches no current drift item, or names an unknown component or framework, fails the check. So exclusions cannot linger or pre-suppress future drift.
- **Excluded API is not added to the public metadata** just to pass.
- **Record changes regenerate** the Skills (`skills/<component>.md`) and `packages/ai/context/llms*.txt`, and bump each changed record's `metadataVersion` by one (Phase 6 Spec §5.1). `pnpm run validate` passes.
- **PR #36 stays unmerged** until its drift step is green under these rules.
- **The checker stays enforced.** Any unexplained drift fails CI.

**W2-B4-R4 — coverage scope.**

- The coverage check runs in **report mode** until C02 fixes the component list, then switches to enforcing.
- Report mode is not an exception: the step exits non-zero on drift between existing records and their source from the start. Only "component without a record" is reported rather than failed before C02.
- Writing the missing records for C05–C07 components follows each component's own work.
- **The denominator** is the union of `exports` subpaths and root-barrel re-exports, minus the documented exclusion constant (Amendment A1).
  - The barrel-only Angular components stay in it.
  - Before switching to enforcing after C02, the denominator is reconciled explicitly against the C02 component list.

**B4 acceptance**

| ID    | Criterion                                                                                                                                                                                                                                  | Evidence claim             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| B4-A1 | Harness runs P2–P8 in CI; repeated same-commit runs produce recorded variance                                                                                                                                                              | Verified                   |
| B4-A2 | `PERFORMANCE.md` holds P1–P8 Stage 1 values with environment and variance; no new timing gate                                                                                                                                              | Implemented                |
| B4-A3 | Drift check fails on a seeded metadata/API mismatch for an existing record                                                                                                                                                                 | CI-enforced                |
| B4-A6 | Drift check passes on the real records with the reviewed exclusion list. Tests: an exclusion suppresses exactly its item; a stale or unknown exclusion fails; a `missing-in-source` item is never suppressed; an unexcluded mismatch fails | CI-enforced                |
| B4-A7 | P7 `openToVisible` ends at first visible, in both motion variants; the workflow runs `perf:stats:test` before measuring                                                                                                                    | Verified                   |
| B4-A4 | Generated reference builds into Storybook docs for every record                                                                                                                                                                            | Verified                   |
| B4-A5 | Coverage report lists all shipped components without records; enforcing after C02                                                                                                                                                          | Verified, then CI-enforced |

## 6. Dependencies and order

```text
PR #15 (user's review gate, outside this Spec) ──► B1-M ──► C12 status
                       └── not merging ──────────► B1-R ──► B1-R1 ──► C12 status
ADR-060 (X1 resolved) ──► B2-R1 ──► B2-R2a (validator) ──► B2-R2 ──► B2-R3 ──► B2-R4
B2-R2a ──► B4-R2 (PERFORMANCE.md Stage 1 sections)
PR #32 (B2-R1 + Amendment A1) merged ──► PR #34 merge (user ruling 4)
User confirmation of the ADR-066 R6 part ──► B2-R2a merge
B2-R5 ── independent
B3-R1 ──► B3-R2;  B3-R3 ──► B3-R4
B4-R1 ──► B4-R2;  B4-R3 ──► B4-R4 (report mode) ──► enforcing after C02
```

- B2, B3 and B4 do not wait for B1.
- B4-R2's values are refreshed after Workstream 1 waves change shipped components. Stage 1 records a dated baseline, so this is not a blocker.
- C11's full closeout follows C09 coverage and C03 names (register). B3 closes only its remainder.
- C12 final acceptance (§40, real publish) is outside this Specification. It needs C01–C11, N-1 names and the external items.

## 7. Implementation boundaries

- One PR per part:
  - this Specification, its Plan and ADR-060 (B2-R1), plus Amendment A1 and ADR-066;
  - B2-R2a, the integrity validator change, which touches no `PERFORMANCE.md` value;
  - B2-R2, which must be baseline-only, React/Vue rows only;
  - B2-R3/R4;
  - B2-R5;
  - B3-R1–R3 (PR #34; it may merge before the CLI remediation, after this Specification's amendment merges, per user ruling 4);
  - B3-R4, the CLI-1/5/6 remediation;
  - B4-R1/R2 (performance);
  - B4-R3/R4 (documentation tooling);
  - B1.
- None of these PRs touch component source, provenance manifests or `PROVENANCE.md`, unless ADR-061's same-diff rule applies to a watched non-`src` package path the PR changes. In that case the disclosure is truthful and stated in the PR.
- Every PR's CI is compared with `main`'s by failure lines, not step colour.
- Branches are created from `origin/main` with `--no-track` and pushed with an explicit `src:dst` refspec. The primary checkout is never used.

## 8. Recorded dependencies outside this Specification

| Item                                  | Why it matters here                                                      | Owner                                   |
| ------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| C02 component list (GAP-017, GAP-040) | Switches B4-R4 to enforcing; C09 completion                              | C02 Verification/Research gate          |
| C06 Tree family, C07 Chart/Editor     | Add components that B4's coverage check will then require                | Their own Spec gates (ADR-054, ADR-055) |
| Workstream 1 (D1, D2)                 | Changes shipped components and React styling, which B4 baselines measure | Workstream 1                            |
| C04 / GAP-094                         | The one remaining red CI step; C12's "passing CI" prerequisite           | GAP-094 batch PRs                       |
| N-1 names / DECISION-E                | Needed before the first real Version/Publish cycle                       | C03 naming decision                     |

## 9. Blockers and open items

| ID     | Blocker                                                                                                                                                                    | Blocks        | Needed                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------- |
| ~~X1~~ | **Resolved (user authorization, 2026-10-17):** ADR-060 is drafted on this branch, recording the decision now (B2-R1). The deferred baseline-only change remains B2-R2 work | —             | —                                                                          |
| **X2** | External dependency owned by the user: PR #15's review and the Spec Review of the Phase 10 amendment (both uncommitted edits). PR #15 has no review and stale CI.          | B1 start gate | Nothing from this Specification; B1's tasks are conditional on its outcome |
| ~~X3~~ | **Resolved at Spec Review (2026-10-17):** nothing shows 21.0.7 support; Angular is aligned to the published `^21.2.22` as a correction (B3-R1)                             | —             | —                                                                          |
| ~~F1~~ | **Resolved (user ruling, Option 2, 2026-10-18):** integrity applies only to rows the diff changes (B2-R2a, ADR-066)                                                        | —             | —                                                                          |

## 10. Builder's calls (made by the author; open to Spec Review)

1. C01 closes with "Provenance validation" red, because its own text assigns that content to C04 (B2-R4).
2. B4's component-coverage check runs in report mode before C02. Drift on existing records is enforced from the start (B4-R4).
3. No real changeset is created to exercise Version/Publish; that cycle belongs to C12 final acceptance (B1-R4).
4. The Phase 10 Spec and Plan are excluded from B2-R5 status edits while the user's uncommitted edits exist.
5. One PR per part, with B2-R2 as a baseline-only PR (§7).

## 11. Spec Review log

- **2026-10-17, pass 1:**
  - X3 resolved on evidence (§3, B3-R1).
  - X1 investigated across git refs, worktrees and local session logs:
    - no approved ADR-060 text exists;
    - the GAP-091 Spec survives only as a log copy whose status says "human approval is pending";
    - X1 stays open pending user authorization.
  - X2 recorded as an external dependency owned by the user.
  - No other change.
- **2026-10-17, pass 2:**
  - The user authorized X1.
  - ADR-060 drafted and reviewed against `65c2345c`:
    - scope globs, exclusions and the strict React/Vue baseline-only rule match the source;
    - the 2-point threshold and 0.05 integrity tolerance are unchanged;
    - it states that it records the decision now.
  - B2-R1, B2-A1 and §9 updated.
  - §7's PR list aligned: ADR-060 ships with this Specification; B4 is two PRs.
  - Spec Review complete; no open blocker other than the external X2.

- **2026-10-18, Amendment A1 (user rulings 1–6):**
  - B2-R2a, B2-R2 and B2-A2/A2a.
  - The B3-R4 CLI remediation and B3-A5.
  - The B4-R1 P7, workflow-gate and granularity clarifications, and B4-A7.
  - The B4-R3 drift contract and B4-A6.
  - The B4-R4 denominator.
  - The §6, §7 and §9 updates.
  - ADR-066 added. The controller extended Option 2 to R6, which ADR-066 records.
  - The Angular prerelease-matching behaviour stays as pinned by the B3 tests. Task 13 stays gated on PR #15.
- **2026-10-18, Spec Review of A1 (independent reviewer): approve with changes.** Applied:
  - The fail-closed list is corrected. `readFileAtRef` currently swallows Git errors, so unreadable refs and an empty merge-base table now fail explicitly. A non-baseline-only changed row is moved out of the fail list.
  - The R7 `vitest.config.ts` inversion for the other 15 packages is disclosed as amending ADR-060.
  - R6 is marked proposed, pending the user's confirmation, and the B2-R2a merge depends on it.
  - Parser table bounds are added.
  - The re-baseline note sentence is allowed (controller ruling, flagged).
  - Exclusions are keyed on `apiKind`. "missing-in-source" and structural problems are never excludable.
  - Skills/`llms` regeneration and the `metadataVersion` bump are made explicit.
  - Two §6 edges are added. The counts are corrected.
- **2026-10-18, A1 re-review:** the remaining findings N-1 to N-5 were applied (whole-PR R6 merge gate with an explicit fallback, aligned visibility definition, `<cmd> -h`, how the fixture loads the predicate, the B4-A6 `missing-in-source` case). Spec Review and Plan Review of A1 are complete.

## 12. Next gate

Execute Amendment A1 under the reviewed Plan. Merges need the user's approval. The ADR-066 R6 confirmation gates Task 1a's merge. B1's tasks stay conditional on X2.
