# Code Quality and Local Developer Checks Implementation Plan — GAP-092

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` only after Plan Review approval and separate implementation authorization. Steps use checkbox (`- [ ]`) syntax for tracking. Do not infer authority to commit, push, or close tracking from this plan.

**Status:** Proposed for Plan Review; implementation unauthorized. The unified [Specification](../specs/2026-10-13-code-quality-local-developer-checks-design.md) was approved by the user on 2026-10-13. Its unchanged on-disk `Status:` line is a document snapshot, not the current gate.

**Amendment A1 (2026-10-13, proposed for Plan Review):** staged delivery. Tasks 1–4 ship as a first validated phase on a dedicated branch and draft PR for CI evidence; Task 5 stays blocked on GAP-089. See [Amendment A1 — staged delivery](#amendment-a1--staged-delivery). A1 changes sequencing and delivery only; it does not change any task's technical content, file boundary, or acceptance bar.

**Goal:** Repair GAP-092's repository-wide lint and formatting debt and install safe, efficient local Git hooks, while retaining direct CI enforcement.

**Architecture:** Keep ESLint, Prettier, workspace build/typecheck/test commands, and CI wiring. Pin compatible Husky and lint-staged as development tools. `pre-commit` checks staged whitespace, then read-only staged-file lint and formatting; `pre-push` runs full build, typecheck, and tests after the separately governed GAP-089 prerequisite is resolved.

**Tech Stack:** pnpm 9.6.0, Node `>=20.0.0` (CI uses 24.15.0), ESLint 9, Prettier 3, Husky 9.1.7, lint-staged 15.5.2, Git hooks.

## Global constraints and gates

- Work in an isolated worktree at a freshly verified implementation-base SHA; record branch, status, `origin/main`, the approved Spec, and this plan before edits. Preserve the primary checkout and other worktrees. Re-measure all debt at that SHA.
- Keep the existing root command names and scopes. Set `lint` to `eslint . --max-warnings=0`; staged ESLint also needs `--max-warnings=0`. Do not hide findings by broad ignores, rule downgrades, `continue-on-error`, or narrowed commands.
- Keep `.github/workflows/ci.yml`'s full lint, format, build, typecheck, and test steps and all other Track B gates unchanged. Do not address GAP-089/091/093/094 within this implementation.
- Preserve Prime-derived attribution and source/provenance constraints. A behavior-changing source correction needs its own approved scope under ADR-052. Format-sensitive derived files only after individual review; update provenance records only where actual changes require it.
- Hooks must be read-only for source and index content and restore partially staged, unstaged, untracked, and stash-list state on success and failure. Test in disposable clones, never the contributor's dirty checkout. If the selected lint-staged version fails preservation tests, stop and return to Plan Review with a safer mechanism; do not silently use `--no-stash`, `--fail-on-changes`, or a bypass.
- A successful normal `pre-push` and final activation require independent GAP-089 repair or a new, explicitly approved full-test contract. Until then, stop before declaring A5 satisfied or shipping an always-failing hook. This plan chooses **sequence activation after GAP-089**, not a test skip.
- Commits, pushes, PRs, and tracking updates require their own authorization. The eventual closeout must reconcile GAP-092 in `COMPLETION_REGISTER.md`; no tracking edit belongs to this plan-authoring gate.

## File boundary and baseline

The planned configuration surface is exactly `package.json`, `pnpm-lock.yaml`, `.husky/pre-commit`, `.husky/pre-push`, `.lintstagedrc.json`, and the `README.md` Development section for hook guidance. `eslint.config.mjs` and `.prettierignore` are inspection inputs; modify either only for a separately documented, file-specific defect with before/after coverage proof, and return to Plan Review if that changes policy. The lint-repair candidates are the 43 paths in Appendix A. The formatting candidates are the 509 exact paths in Appendix B; these are a snapshot, not permission for blind rewriting. Appendix B includes architecture and other tracking documents: mechanical Prettier changes are in scope there, but content, decisions, gap status, and completion status are not. Any source file changed for a lint or format finding, and any required per-file provenance record, must appear in the implementation diff manifest before editing. No workflow file or package test is a planned implementation edit.

At the planning baseline `3f86cbce30fcde4fd0ff88756e2713b8daf0a6ae`, the same-hash ESLint configuration and existing executable reproduced **59 errors, 1 warning**. Prettier reproduced **509 differing files**. The GitHub API could not be reached from this environment; the approved Spec's [CI run 38364336170](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38364336170) remains the remote evidence. Recheck actual upstream state before implementation; do not assume this snapshot is still current.

The proposed exact dependency pins are `husky: 9.1.7` and `lint-staged: 15.5.2`. Husky's [setup](https://typicode.github.io/husky/get-started.html) uses `prepare`; lint-staged's [migration guide](https://github.com/lint-staged/lint-staged/blob/main/MIGRATION.md#v16) states v16 requires Node 20.17+ (v16.0 needs 20.19), which exceeds this repository's root `>=20.0.0` declaration. The [15.5.2 package listing](https://www.npmjs.com/package/lint-staged?activeTab=versions) and [Husky 9.1.7 listing](https://www.npmjs.com/package/husky?activeTab=versions) establish available versions, not verified behavior in this repo. Before adding them, inspect package engines/licenses for compatibility with the root declaration and test clean installation at CI's Node 24.15.0. The README records a narrower Angular Storybook toolchain floor, so a whole-workspace frozen install at Node 20.0.0 is not a valid acceptance probe. If the pins are incompatible, return to Plan Review before choosing replacements.

## Tasks

### Task 1: Reproduce, classify, and lock the implementation inventory

**Files:** Inspect `package.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `docs/architecture/PROVENANCE.md`, `docs/architecture/provenance/*.json`, Appendix A, and Appendix B. No repository edit.

- [ ] Record `git status --short --branch`, `git rev-parse HEAD`, `git rev-parse origin/main`, and `git diff --name-status`; stop on unexpected pre-existing changes. Confirm the approved Spec and this plan are available in the chosen worktree.
- [ ] After a frozen install in the isolated worktree, run `pnpm exec eslint . --format json --output-file /tmp/gap-092-eslint.json` and `pnpm exec prettier --list-different . > /tmp/gap-092-prettier.txt` (both are expected to exit nonzero at baseline). Parse the JSON by path/rule/severity and compare with Appendix A; compare the formatter path list with Appendix B. Record SHA, command versions, counts, and exact added/removed paths.
- [ ] For each lint finding, record cause and the smallest semantics-preserving correction; classify inert React-plugin inline directives separately. For each formatting path, record owned/derived/verbatim/generated status and existing ignore behavior. Cross-check required notices and provenance manifests before writing source. If a finding needs behavior change or a new broad ignore, stop for separate scope review.
- [ ] Produce an implementation diff manifest that names exact files and batches formatting by directory/package/provenance class. Review each batch as a discrete diff with `git diff --check`, attribution check, and appropriate package tests before moving on. This inventory gate is the prerequisite for Tasks 2 and 3.

### Task 2: Repair lint debt and enforce zero warnings

**Files:** Modify `package.json` and only the confirmed Appendix A files; possible narrow `eslint.config.mjs` correction is conditional as above. No test assertion or workflow edit.

- [ ] In `package.json`, retain the `lint` key and replace its value with `eslint . --max-warnings=0`. Run `pnpm run lint`; it must still fail on the measured baseline.
- [ ] Remove obsolete inline directives that cite unconfigured `react-hooks/*` or `react/*` rules, then fix owned-code unused bindings, expression misuse, and other measured findings one file at a time. Inspect semantic behavior before each correction; do not globally disable a rule or rename a problem away. Run `pnpm exec eslint <changed-files> --max-warnings=0` after each small batch and `pnpm run lint` at the end; expect zero errors and warnings.
- [ ] In a disposable copy, write `/* eslint-disable no-alert */\nexport {};\n` to an otherwise linted `.js` path as a warning-only fixture; run `pnpm run lint` and require nonzero solely from the warning. Replace it with `const unused = 1;\n` for an error-level fixture and again require nonzero. Remove fixtures and verify the clean command exits zero. Record both exit codes and findings. Use actual repository rules if either fixture does not produce the stated severity.
- [ ] Run package tests relevant to changed source, `pnpm run build`, `pnpm run typecheck`, and required provenance checks. Review each source diff for runtime/provenance impact; stop if an authorized lint cleanup cannot preserve behavior.

### Task 3: Repair formatter debt in reviewed batches

**Files:** Modify only Appendix B paths confirmed by Task 1, plus a provenance manifest only if an actual source edit requires it. Keep `.prettierignore` unchanged unless the conditional policy gate above is met.

- [ ] For each Task 1 batch, run `pnpm exec prettier --write -- <explicit reviewed file paths>`; never run repository-wide `--write .` over all 509 paths. Review `git diff --stat`, `git diff --check`, and representative full diffs before the next batch. For Prime-derived/verbatim files, inspect every changed file and reconcile attribution/provenance as required.
- [ ] Run `pnpm run format:check` after all batches; require exit 0 with the original formatter scope. Verify previously failing paths are actually formatted rather than newly excluded.
- [ ] In a disposable copy, introduce a new formatting-only violation in a formatter-supported file and require `pnpm run format:check` nonzero. Remove the fixture; rerun the full check. Run package tests/typecheck/build and provenance checks for any files where formatting could affect syntax, generated output, or attribution.

### Task 4: Install and prove read-only `pre-commit`

**Files:** Modify `package.json`, `pnpm-lock.yaml`; create `.husky/pre-commit` and `.lintstagedrc.json`. No other hook manager or CI workflow change.

- [ ] Verify `husky@9.1.7` and `lint-staged@15.5.2` engine/license metadata against the root Node declaration, and test their behavior in a disposable clone with CI's Node 24.15.0. Then add them as exact root dev-dependency pins, update the lockfile with pnpm 9.6.0, and add `"prepare": "husky"` to the existing root scripts. Require frozen install to succeed from a clean clone and inspect `git config --get core.hooksPath` plus the actual hook target. Do not use `husky init` to overwrite scripts.
- [ ] Create `.lintstagedrc.json` with the following intended command mapping, then verify exact glob/ignore behavior using the installed version. If `--no-warn-ignored` is unavailable or an ignored path is treated as a failure, return to Plan Review rather than weakening `--max-warnings=0`:

  ```json
  {
    "*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}": "eslint --max-warnings=0 --no-warn-ignored",
    "*": "prettier --check --ignore-unknown"
  }
  ```

- [ ] Create `.husky/pre-commit` with these POSIX-shell commands and executable mode; use `&&` so whitespace failure stops lint-staged:

  ```sh
  git diff --cached --check && pnpm exec lint-staged
  ```

- [ ] In a disposable clone with a commit, run actual `git commit` attempts for: clean staged lint/format file; staged whitespace; warning-only ESLint fixture; error-level ESLint fixture; format-only fixture; no relevant staged file. Require the three quality violations and whitespace to block, clean/no-relevant cases to pass, and no whole-repo checks to run. Verify ignored ESLint paths and Vue/documentation formatting coverage.
- [ ] For partially staged, unstaged, and untracked cases, record hashes of index entries and worktree files and `git stash list` before/after successful and failing hooks. Require exact restoration and no auto-stage, `--fix`, or `--write`. Test renames/copies and a filename with spaces. If lint-staged's backup/hide/restore behavior cannot meet the Spec, stop before activation and return to Plan Review.

### Task 5: Add `pre-push` only after the GAP-089 activation dependency clears

**Files:** Create `.husky/pre-push`; modify only the Development section of `README.md` for hook commands and bypass limits. The Spec does not authorize a GAP-089 fix here.

- [ ] Verify independent GAP-089 evidence on the intended implementation SHA: `pnpm run build`, `pnpm run typecheck`, and `pnpm run test` all exit 0 on a clean isolated baseline. If the root test remains red, stop this task and report the activation dependency; do not use a skip, `--no-verify`, allow-failure wrapper, or modified tests as a solution.
- [ ] Create executable `.husky/pre-push` with the exact full commands in order:

  ```sh
  pnpm run build && pnpm run typecheck && pnpm run test
  ```

- [ ] In a disposable clone and local bare remote, exercise a normal push. Force one failure at each command boundary and verify the push is blocked and later commands do not run; restore normal commands and require a successful push. Record command order, exit codes, and representative duration. Do not push the actual feature branch from this test.
- [ ] In `README.md`'s existing Development section, add concise instructions for manual `pnpm run lint`, `pnpm run format:check`, `pnpm run build`, `pnpm run typecheck`, and `pnpm run test`; state that `pnpm install --frozen-lockfile` activates the hooks, `pre-commit` checks staged whitespace/lint/format, and `pre-push` runs build/typecheck/test. State Git hooks can be bypassed and CI remains authoritative. Do not change the documented Node/Storybook constraints.

### Task 6: Whole-change verification and CI evidence

**Files:** Read-only verification of the authorized diff; no `.github/workflows/ci.yml` or tracking edit.

- [ ] Confirm `git diff --name-status` matches the Task 1 manifest and approved file boundary. Run `git diff --check`, `pnpm run lint`, `pnpm run format:check`, `pnpm run build`, `pnpm run typecheck`, `pnpm run test`, relevant package tests, and source/provenance validators. Record separate outcomes; a GAP-089 test failure is a blocker for activated `pre-push`, not a GAP-092 exception.
- [ ] Repeat frozen install and hook probes in a disposable clean clone at CI's Node 24.15.0; confirm `core.hooksPath`, executable `pre-commit`/`pre-push`, and that CI installation/direct commands do not depend on hook execution. Compare `.github/workflows/ci.yml` byte-for-byte with the implementation base.
- [ ] After separately authorized remote verification, record a fresh GitHub-hosted run URL and SHA. Require Lint and Format check to execute and pass; record Typecheck and Test separately and inspect other quality gates for attributable regressions. A red unrelated step does not count as GAP-092 closure or an approved exception.
- [ ] Submit the reviewed diff and A1–A6 evidence to Final Review. Tracking reconciliation, commit, push, PR, or merge happen only at their separately authorized gates.

## Amendment A1 — staged delivery

The original plan delivers GAP-092 as one unit after GAP-089 clears. A1 splits delivery into two phases so the completed, verified Tasks 1–4 can collect GitHub-hosted CI evidence while Task 5 waits. Everything not named here (global constraints, file boundary, task steps, stop conditions) is unchanged and applies to both phases.

### Phase 1 — Tasks 1–4 (validated first phase)

**State at amendment time:** Tasks 1–4 are implemented in the isolated worktree `/private/tmp/ultimate-code-quality-spec` (detached at `3f86cbce30fcde4fd0ff88756e2713b8daf0a6ae`, equal to `origin/main`). The working-tree diff touches 529 tracked files: the 525 Appendix A/B paths, `package.json`, `pnpm-lock.yaml`, `docs/architecture/PROVENANCE.md`, and `docs/architecture/provenance/uix-styled.json` (one removed rule-free ESLint directive, comment only). New untracked files are `.husky/pre-commit` and `.lintstagedrc.json`, plus the approved Spec and this plan. `pnpm run lint` and `pnpm run format:check` exit 0, `git diff --check` is clean, and `.github/workflows/ci.yml` is byte-identical to the base.

**Phase 1 boundary:** no `.husky/pre-push`, no `README.md` change (the Development-section guidance in Task 5 describes both hooks and lands with Phase 2), no `.github/workflows/ci.yml` change, no tracking-document status change. Only mechanical Prettier changes in Appendix B tracking documents, as already permitted.

Phase 1 steps, executed only after A1 is approved:

- [ ] **P1-1 Re-verify base.** In the worktree, record `git status --short --branch`, `git rev-parse HEAD origin/main` (after `git fetch origin`), and confirm the changed-file list still equals the 529-path manifest above plus the four untracked files. If `origin/main` has moved, stop and report before branching; do not rebase silently.
- [ ] **P1-2 Branch.** `git switch -c fix/gap-092-code-quality-local-checks` from the detached HEAD in the worktree. The primary checkout and its uncommitted changes are not touched.
- [ ] **P1-3 Pre-commit equivalence.** Stage only the manifest paths by explicit pathspec (never `git add -A`/`.`), then run the hook's own command against the index: `git diff --cached --check && pnpm exec lint-staged`. Require exit 0 and an unchanged index afterwards (compare `git diff --cached --name-only | wc -l` and `git write-tree` before/after).
- [ ] **P1-4 Commit.** Two Conventional Commits on the branch: (1) `docs(gap-092): add code quality spec and implementation plan` containing only the Spec and this plan; (2) `fix(quality): repair lint and format debt and add pre-commit checks (GAP-092)` containing the remaining manifest paths, `.husky/pre-commit`, and `.lintstagedrc.json`. Body states that `pre-push` is deferred to Phase 2 pending GAP-089.
- [ ] **P1-5 Push and draft PR.** Push the branch to `origin` and open a **draft** PR into `main` whose description states Phase 1 scope, that `pre-push` is intentionally absent, that GAP-092 is not closed, and that the PR must not be merged before Phase 2 and Final Review.
- [ ] **P1-6 CI evidence.** Record the run URL and head SHA. Lint and Format check must execute and pass. Record Build, Typecheck, and Test separately; compare every other red step with the latest `main` baseline run and classify each as inherited (named gap) or attributable. An attributable regression stops Phase 1 for a fix inside the approved boundary; a red Test step attributable to GAP-089 is expected and is not a Phase 1 failure.
- [ ] **P1-7 Checkpoint report.** Report the branch, commits, PR, CI evidence, and classification to the user. This is a phase checkpoint, not Final Review, and authorizes nothing further.

### Phase 2 — Task 5 and Task 6 (blocked on GAP-089)

- [ ] **P2-0 Unblock check.** Start only when GAP-089 is resolved through its own gates and its fix is on `main`. Update the GAP-092 branch from `main` by merge (no force-push or history rewrite without separate authorization) and rerun Phase 1's lint/format checks on the result.
- [ ] **P2-1** Execute Task 5 unchanged (`.husky/pre-push`, README Development section, disposable-clone push probes).
- [ ] **P2-2** Execute Task 6 unchanged on the updated draft PR, including a fresh GitHub-hosted run.
- [ ] **P2-3** Submit the full A1–A6 evidence to Final Review. Marking the PR ready, merging, GAP-092 closeout, and tracking reconciliation each remain separately authorized gates.

### A1 risks and stop conditions

- **Phase 1 alone must not reach `main`.** `"prepare": "husky"` would activate `pre-commit` for every contributor without the `pre-push` half the Spec requires. The draft PR stays draft and unmerged until Phase 2 and Final Review complete.
- **Branch drift while blocked.** Phase 1 reformats 509 files, so other work landing on `main` will conflict. Resolve by merging `main` into the branch at P2-0 and re-running `pnpm run lint` and `pnpm run format:check`; new formatter or lint findings on files outside Appendix A/B return to Plan Review rather than being silently absorbed.
- **CI cost.** Each push to the draft PR triggers the full workflow; push only at P1-5 and P2-2 unless a fix is required.

## Amendment A2 — Phase 1 CI findings (proposed for Plan Review)

**Trigger:** Phase 1 stopped at P1-6. [CI run 38381740920](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38381740920) on `ecdbf79` (draft PR #9) passed Lint and Format check but exposed one regression this PR caused and two older defects, newly exposed. A P1-3 Spec edit also needs retroactive review. A2 adds four bounded corrections to the Phase 1 boundary. Everything else in this plan and A1 is unchanged. No A2 change is applied until A2 passes Plan Review.

### A2-0 Spec normalization (retroactive review; no further Spec edits)

At P1-3 the staged whitespace check (`git diff --cached --check`) rejected the approved Spec. Its three header lines ended in two-space Markdown hard breaks. Without separate authorization, those breaks were replaced by CommonMark backslash hard breaks before commit `7728281`. The complete diff between the approved Spec and the PR #9 version (`$` marks end of line):

```diff
-**Date:** 2026-10-13  $
-**Status:** PROPOSED — awaiting Spec Review. No implementation, Plan, commit, or tracking change is authorized.  $
-**Baseline:** fetched `origin/main` at `3f86cbce30fcde4fd0ff88756e2713b8daf0a6ae` (GAP-088 PR #8 merge).  $
+**Date:** 2026-10-13\$
+**Status:** PROPOSED — awaiting Spec Review. No implementation, Plan, commit, or tracking change is authorized.\$
+**Baseline:** fetched `origin/main` at `3f86cbce30fcde4fd0ff88756e2713b8daf0a6ae` (GAP-088 PR #8 merge).\$
```

No other byte differs. The text, requirements, and rendered output (three lines with hard breaks) are unchanged. Prettier 3.9.6 accepts both forms; only the whitespace check rejects the original. **Decision requested:** accept this normalization as recorded, or restore the original bytes and decide how the Spec passes the whitespace check. No further Spec edit is proposed.

### A2-1 Template whitespace regression (caused by this PR)

**Finding.** Under the default `htmlWhitespaceSensitivity: "css"`, Prettier 3.9.6 reflowed embedded Angular templates and Vue SFC templates. Elements it treats as whitespace-insensitive (for example `th`, `td`, `button`, `span`, `a`) had text moved onto its own lines. Angular (`preserveWhitespaces: false`) and Vue (`condense`) then render one space on each side of the text. Example, `packages/ng/src/table/table.ts`:

```text
base   : >{{ col.header }}</th>                → renders "Name"
PR head: >\n  {{ col.header }}\n</th>          → renders " Name "  (Angular SSR spec expects ">Name<"; fails 3/3)
strict : >{{ col.header }}</th\n>              → renders "Name"
```

**Method.** Probe script outside the repo, `/tmp/gap092-probe-scripts/probe.mjs`. For every changed file that carries a template, it compiles three versions with the repository's own compilers: `@angular/compiler` 21.2.25 `parseTemplate(..., { preserveWhitespaces: false })`, serializing text nodes, interpolation text parts, elements, attributes, bindings, and control-flow blocks; and Vue 3.5.42 `compileTemplate`, with whitespace normalized only outside string literals. The versions are base (`3f86cbc`), PR head (`ecdbf79`), and the candidate. Population: 94 files (Angular inline templates in `packages/ng{,-core}/src` plus every `.vue` file in the diff).

| Comparison                    | Identical | Differ | Differences                                                          |
| ----------------------------- | --------- | ------ | -------------------------------------------------------------------- |
| base vs PR head               | 79        | 15     | 12 render text changes (below), plus 3 equivalent JS forms           |
| base vs strict-formatted base | 90        | 4      | `knob.ts` (SVG `<text>`, below), plus the same 3 equivalent JS forms |
| base vs **candidate**         | **91**    | **3**  | only the 3 equivalent JS forms                                       |

The 12 text changes are in `packages/ng/src/{date-picker/date-picker,file-upload/file-upload,image/image,knob/knob,paginator/paginator,table/table,tabs/tab-list}.ts` and `packages/vue/src/{breadcrumb/Breadcrumb,date-picker/DatePicker,file-upload/FileUpload,image/Image,table/Table}.vue`. Examples: `‹` → `‹`, `↻` → `↻`, `×` → `×`, `Save` → `Save`, `{{ link }}`/`{{ chooseLabel() }}`/`{{ valueToDisplay() }}` gaining surrounding spaces. The three equivalent JS forms are `Listbox.vue` and `MultiSelect.vue` (a trailing comma added in an object literal) and `Select.vue` (`' '` → `" "`). They are already in PR head and are semantically identical.

**Limit of `strict`.** Setting `strict` alone repairs nothing already committed: `prettier --list-different --html-whitespace-sensitivity strict .` at PR head reports 0 files, because strict preserves the whitespace the earlier formatting inserted. Strict also does not protect SVG `<text>`. Minimal fixtures show `<text …>{{ x }}</text>` split in strict mode both inside and outside `@if`, while the equivalent HTML `<span>` is preserved. A single `<!-- prettier-ignore -->` before that element preserves it. Angular does not render template comments.

**Correction (proposed).**

1. `.prettierrc.json`: add `"htmlWhitespaceSensitivity": "strict"`. At PR head this changes no other file (0 files in the list above), so `format:check` scope and the rest of the reformatted tree are unaffected. This is a formatter-policy change made to preserve rendered output. It does not weaken any check.
2. For each of the 12 files: take the base (`3f86cbc`) content, reapply only that file's approved lint fix, and format with the repository Prettier under the new setting. Only `date-picker.ts` is in Appendix A; its lint fix is the two `no-unused-expressions` ternary-to-`if`/`else` rewrites. The other 11 files are format-only.
3. `packages/ng/src/knob/knob.ts`: add exactly one `<!-- prettier-ignore -->` line immediately before the SVG `<text x="50" …>` element. No other `prettier-ignore` is added anywhere. This file has no per-file provenance record (GAP-094 scope), so no provenance edit is required. If Plan Review prefers it recorded, add it to the existing PrimeNG package entry.

Candidate size against PR head: 3–33 changed lines per file, 147 lines across the 12 files. The candidate passes `prettier --check` under the new config.

**A2-1 verification (on the branch, before commit):** rerun the probe base-vs-branch and require 91 identical with only the 3 listed equivalent forms differing. Then require these to exit 0: `pnpm run format:check` and `pnpm run lint`, the `@ultimate/ng` and `@ultimate/vue` unit suites, `pnpm run typecheck`, `pnpm run build`, and the Angular SSR Playwright project (`ssr-hydration.spec.ts`, including "serves SSR content and hydrates column sorting"). Then probe that a new whitespace-only template edit still fails `format:check`.

### A2-2 Stale themes size entry (older defect, newly exposed)

**Finding.** `docs/architecture/PERFORMANCE.md` records `packages/themes` gzip as `13.14 KB`. A fresh build measures 13,873 bytes, i.e. `13.55 KB`, identical at base `3f86cbc` and PR head `ecdbf79`. Measured locally with Node 24.15.0 via `measurePackage("packages/themes")`; CI reported the same `13.55 KB`. Themes source and manifest are unchanged in this PR. This PR reformats `PERFORMANCE.md`, so `validate-bundle-size.mjs` classifies themes as a baseline-only diff and runs its integrity check, which fails.

**Correction (proposed).** Change only the `index.mjs gzip size` cell of the `packages/themes` row in the "Phase 10 — CI/Security/Quality Gates" Package size table from `13.14 KB` to `13.55 KB`. Nothing else changes: the dist size and file-count cells (not gated), every other row, the 15% threshold, all validator code, and the historical Phase 5 narrative (line 79). This changes a recorded measurement, not any gap, decision, or completion status.

**Verification:** `pnpm run build` then `pnpm run size:validate` (base ref `origin/main`) reports themes `OK (baseline-only, integrity check: 13.55 KB matches fresh measurement)`, with no new FAIL for any package.

### A2-3 Missing `component-metadata` README (older defect, newly exposed)

**Finding.** `packages/component-metadata/package.json` lists `README.md` in `files`, but no such file exists at base or head. Pack/install integrity checks only affected packages, and this PR edits `component-metadata` sources, so the check fails with "missing 1 path(s) … README.md". GAP-131 resolved the same defect for `@ultimate/cli` by adding the README.

**Correction (proposed).** Create `packages/component-metadata/README.md` with this exact content, following the existing package README pattern. No `package.json` change.

````markdown
# @ultimate/component-metadata

Populated component metadata records for the Ultimate Platform (Phase 6), validated against `@ultimate/component-schema`.

## Status

Unstable (pre-1.0). No semver guarantee yet.

## Usage

```ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
```

## Scope

See `docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md` for the contract.
````

**Verification:** `pnpm --filter @ultimate/component-metadata run build`, then `pnpm run integrity:pack-install -- @ultimate/component-metadata` exits 0, and `pnpm run format:check` passes.

### A2 file boundary, sequencing, and stop conditions

- **Added to the Phase 1 boundary:** `.prettierrc.json` (one key), `docs/architecture/PERFORMANCE.md` (one cell), and `packages/component-metadata/README.md` (new). The 12 A2-1 files are already in Appendix B.
- **Unchanged:** the CI workflow, the Spec, `.prettierignore`, `eslint.config.mjs`, tests, validators, and tracking status. `.husky/pre-push` stays absent.
- **Order:** A2-1, then A2-2, then A2-3, each verified as above. Then one commit on `fix/gap-092-code-quality-local-checks`, `fix(quality): preserve template whitespace and correct exposed baselines (GAP-092)`, with the pre-commit equivalence check from P1-3. Then a single push to draft PR #9 and P1-6 CI evidence again. The PR stays draft and unmerged.
- **Stop and return to Plan Review if:** the branch probe shows any render difference beyond the three listed equivalent forms; strict formatting changes any file outside the 12; any other package fails the size integrity check; or CI shows any other failure caused by this PR.

## Plan Review decisions and stop conditions

Plan Review should confirm the pinned version choice, the staging glob/ignore semantics, the strict no-change preservation contract, the exact-file baseline appendices, and the GAP-089 sequencing. A real compatibility or preservation failure is a blocker requiring a corrected Plan Review; it is not delegated to implementation improvisation. This plan intentionally keeps `.github/workflows/ci.yml` unchanged and permits only mechanical formatter changes in Appendix B tracking documents; status reconciliation waits for closeout.

**Next gate:** Plan Review. Implementation remains unauthorized until this plan is approved and implementation receives separate human authorization.

## Appendix A — exact lint candidate paths at planning baseline

The count below is by file, not finding. Re-run Task 1 before edits; only files still failing at the implementation SHA are candidates.

```text
packages/component-schema/src/metadata-version.ts
packages/component-schema/test/guidance.test-d.ts
packages/mcp/src/errors.ts
packages/ng/src/animate-on-scroll/animate-on-scroll.ts
packages/ng/src/avatar/avatar.spec.ts
packages/ng/src/cascade-select/cascade-select.ts
packages/ng/src/color-picker/color-picker.ts
packages/ng/src/date-picker/date-picker.ts
packages/ng/src/input-otp/input-otp.ts
packages/ng/src/popover/popover.ts
packages/ng/src/scroll-panel/scroll-panel.ts
packages/ng/src/select-button/select-button.ts
packages/ng/src/speed-dial/speed-dial.ts
packages/ng/src/style-class/style-class.ts
packages/ng/src/tiered-menu/tiered-menu.ts
packages/react/src/block-ui/block-ui.tsx
packages/react/src/cascade-select/cascade-select.tsx
packages/react/src/color-picker/color-picker.spec.tsx
packages/react/src/data-scroller/data-scroller.tsx
packages/react/src/date-picker/date-picker.tsx
packages/react/src/deferred-content/deferred-content.tsx
packages/react/src/drawer/drawer.spec.tsx
packages/react/src/file-upload/file-upload.stories.tsx
packages/react/src/galleria/galleria.tsx
packages/react/src/input-mask/input-mask.tsx
packages/react/src/input-otp/input-otp.tsx
packages/react/src/multi-select/multi-select.tsx
packages/react/src/scroll-panel/scroll-panel.spec.tsx
packages/react/src/scroll-panel/scroll-panel.tsx
packages/react/src/scroll-top/scroll-top.tsx
packages/react/src/select/select.tsx
packages/react/src/speed-dial/speed-dial.tsx
packages/react/src/splitter/splitter.tsx
packages/react/src/style-class/style-class.ts
packages/react/src/terminal/terminal.tsx
packages/react/src/timeline/timeline.tsx
packages/themes/test/contract.test.ts
packages/themes/test/dark-mode.test.ts
packages/uix-styled/src/stylesheet/index.ts
packages/uix-utils/test/escape.test.ts
packages/vue/src/animate-on-scroll/animate-on-scroll.ts
packages/vue/src/scroll-panel/scroll-panel.spec.ts
packages/vue/src/style-class/style-class.ts
```

## Appendix B — exact formatting candidate paths at planning baseline

Re-run Task 1 before edits and use the Task 1 provenance classification to form reviewed batches.

```text
docs/architecture/ACCESSIBILITY_BASELINE.md
docs/architecture/BLUEPRINT_GAPS.md
docs/architecture/COMPONENT_INVENTORY.md
docs/architecture/DECISIONS.md
docs/architecture/PERFORMANCE.md
docs/architecture/REACT_COMPONENT_STATUS.md
docs/architecture/research/2026-09-02-table-data-component-architecture.md
docs/architecture/research/2026-09-02-table-editing-grouping-dragdrop-architecture.md
docs/architecture/research/2026-09-07-phase-7-cli-architecture.md
docs/architecture/research/2026-09-07-phase-8-mcp-architecture.md
docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md
docs/architecture/research/2026-09-08-phase-10-production-hardening.md
docs/architecture/research/2026-09-12-ai-knowledge-architecture-assessment.md
docs/architecture/research/2026-09-12-ai-orientation-design.md
docs/architecture/research/2026-09-12-next-work-prioritization-audit.md
docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md
docs/architecture/research/2026-09-12-project-reality-and-ai-operating-model-audit.md
docs/architecture/research/2026-09-13-blueprint-closure-current-state-reconciliation.md
docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md
docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md
docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md
docs/architecture/research/2026-09-17-phase-c-migration-batch-selection-analysis.md
docs/architecture/research/2026-09-17-phase-c-migration-dependency-map.md
docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md
docs/architecture/research/2026-10-04-gap-064-g3a-accessibility-preexisting.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-decision-proposal.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-record.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-c1-experiment-authorization.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-c1-experiment-result.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-disposition-proposal.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-p2-design.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-p2-production-proposal.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-stage1-investigation.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-stage2-corrected-investigation.md
docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-stage2-investigation.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-d2-decision-packet.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-d2-readiness-authorization.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-d3-authorization-packet.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-d3-preparation-specification.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-fixture-preparation-correction-packet.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-v1-readiness-d1-investigation.md
docs/architecture/research/2026-10-09-gap-064-g3e-e1-v2-v1-readiness-decision-packet.md
docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md
docs/architecture/VUE_COMPONENT_STATUS.md
docs/superpowers/plans/2026-08-30-phase-3-ultimatereact-foundation.md
docs/superpowers/plans/2026-08-31-phase-4-ultimatevue-foundation.md
docs/superpowers/plans/2026-09-01-phase-5-ultimate-themes.md
docs/superpowers/plans/2026-09-01-uix-data-foundation.md
docs/superpowers/plans/2026-09-02-paginator-component-implementation.md
docs/superpowers/plans/2026-09-02-scroller-component-implementation.md
docs/superpowers/plans/2026-09-02-scroller-content-template-extension.md
docs/superpowers/plans/2026-09-02-table-component-implementation.md
docs/superpowers/plans/2026-09-06-phase-6-component-metadata-implementation.md
docs/superpowers/plans/2026-09-07-phase-7-cli-implementation.md
docs/superpowers/plans/2026-09-07-phase-8-mcp-implementation.md
docs/superpowers/plans/2026-09-08-phase-10-ci-security-quality-gates-implementation.md
docs/superpowers/plans/2026-09-09-phase-10-operational-documentation-implementation.md
docs/superpowers/plans/2026-09-10-phase-10-browser-visual-accessibility-implementation.md
docs/superpowers/plans/2026-09-10-phase-10-migration-release-provenance-implementation.md
docs/superpowers/plans/2026-09-12-agents-md-orientation-implementation.md
docs/superpowers/plans/2026-09-13-blueprint-completion.md
docs/superpowers/plans/2026-09-16-angular-base-input.md
docs/superpowers/plans/2026-09-16-angular-form-foundation.md
docs/superpowers/plans/2026-09-16-phase-b-knowledge-reconciliation-implementation.md
docs/superpowers/plans/2026-09-17-phase-c-batch-1-migration-implementation.md
docs/superpowers/plans/2026-09-20-phase-c-batch-2-migration-implementation.md
docs/superpowers/plans/2026-09-23-table-filter-vocabulary.md
docs/superpowers/plans/2026-09-25-gap-039-vue-tooltip-visibility.md
docs/superpowers/plans/2026-10-04-gap-064-g3a-display-feedback.md
docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md
docs/superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-p3-execution.md
docs/superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-remediation.md
docs/superpowers/specs/2026-08-30-phase-3-ultimatereact-foundation-design.md
docs/superpowers/specs/2026-08-31-phase-4-ultimatevue-foundation-design.md
docs/superpowers/specs/2026-09-01-phase-5-ultimate-themes-design.md
docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md
docs/superpowers/specs/2026-09-02-paginator-component-design.md
docs/superpowers/specs/2026-09-02-scroller-component-design.md
docs/superpowers/specs/2026-09-02-table-component-design.md
docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md
docs/superpowers/specs/2026-09-07-phase-7-cli-design.md
docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md
docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md
docs/superpowers/specs/2026-09-09-phase-10-operational-documentation-design.md
docs/superpowers/specs/2026-09-10-phase-10-browser-visual-accessibility-design.md
docs/superpowers/specs/2026-09-10-phase-10-migration-release-provenance-design.md
docs/superpowers/specs/2026-09-12-agents-md-orientation-design.md
docs/superpowers/specs/2026-09-13-blueprint-completion-design.md
docs/superpowers/specs/2026-09-16-angular-base-input-design.md
docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md
docs/superpowers/specs/2026-09-16-phase-b-knowledge-reconciliation-design.md
docs/superpowers/specs/2026-09-17-phase-c-batch-1-migration-design.md
docs/superpowers/specs/2026-09-20-phase-c-batch-2-migration-design.md
docs/superpowers/specs/2026-09-21-phase-c-batch-3-migration-design.md
docs/superpowers/specs/2026-09-23-table-filter-vocabulary-design.md
docs/superpowers/specs/2026-10-04-gap-064-g3a-display-feedback-design.md
docs/superpowers/specs/2026-10-05-ci-visual-environment-design.md
docs/superpowers/specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md
packages/component-metadata/src/records/button.ts
packages/component-metadata/src/records/checkbox.ts
packages/component-metadata/src/records/dialog.ts
packages/component-metadata/src/records/menu.ts
packages/component-metadata/src/records/paginator.ts
packages/component-metadata/src/records/scroller.ts
packages/component-metadata/src/records/table.ts
packages/component-metadata/src/records/tooltip.ts
packages/component-metadata/test/package-exports.test.ts
packages/component-metadata/test/table.test.ts
packages/component-schema/src/metadata-version.ts
packages/component-schema/src/validate.ts
packages/component-schema/test/api.test.ts
packages/component-schema/test/component-metadata.test-d.ts
packages/component-schema/test/metadata-version.test.ts
packages/component-schema/test/validate.test.ts
packages/mcp/src/errors.ts
packages/mcp/src/index.ts
packages/mcp/src/server.ts
packages/mcp/src/tools/check-framework-compatibility.ts
packages/mcp/src/tools/search-components.ts
packages/mcp/test/errors.test.ts
packages/mcp/test/tools/check-framework-compatibility.test.ts
packages/mcp/test/tools/get-component-api.test.ts
packages/ng-core/src/basecomponent/base-component.ts
packages/ng-core/src/dialog-service/dialog-service.ts
packages/ng/e2e/accessibility-envelope.ts
packages/ng/e2e/g3a-aura-styles.spec.ts
packages/ng/e2e/tooltip.spec.ts
packages/ng/src/accordion/accordion.spec.ts
packages/ng/src/animate-on-scroll/animate-on-scroll.ts
packages/ng/src/autocomplete/autocomplete.spec.ts
packages/ng/src/breadcrumb/breadcrumb-style.ts
packages/ng/src/breadcrumb/breadcrumb.spec.ts
packages/ng/src/breadcrumb/breadcrumb.stories.ts
packages/ng/src/breadcrumb/breadcrumb.ts
packages/ng/src/carousel/carousel.spec.ts
packages/ng/src/carousel/carousel.ts
packages/ng/src/cascade-select/cascade-select.spec.ts
packages/ng/src/cascade-select/cascade-select.ts
packages/ng/src/checkbox/checkbox.spec.ts
packages/ng/src/chip/chip.spec.ts
packages/ng/src/chip/chip.ts
packages/ng/src/color-picker/color-picker.spec.ts
packages/ng/src/color-picker/color-picker.ts
packages/ng/src/confirm-dialog/confirm-dialog.spec.ts
packages/ng/src/confirm-dialog/confirm-dialog.ts
packages/ng/src/confirm-popup/confirm-popup.spec.ts
packages/ng/src/confirm-popup/confirm-popup.ts
packages/ng/src/context-menu/context-menu-style.ts
packages/ng/src/context-menu/context-menu.spec.ts
packages/ng/src/date-picker/date-picker.ts
packages/ng/src/dock/dock-style.ts
packages/ng/src/dock/dock.ts
packages/ng/src/drawer/drawer.spec.ts
packages/ng/src/drawer/drawer.ts
packages/ng/src/dynamic-dialog/dynamic-dialog.spec.ts
packages/ng/src/dynamic-dialog/dynamic-dialog.ts
packages/ng/src/fieldset/fieldset.spec.ts
packages/ng/src/fieldset/fieldset.ts
packages/ng/src/file-upload/file-upload.spec.ts
packages/ng/src/file-upload/file-upload.ts
packages/ng/src/galleria/galleria.ts
packages/ng/src/image-compare/image-compare.spec.ts
packages/ng/src/image/image.ts
packages/ng/src/inplace/inplace.ts
packages/ng/src/input-mask/input-mask.spec.ts
packages/ng/src/input-otp/input-otp.spec.ts
packages/ng/src/input-text/input-text.spec.ts
packages/ng/src/key-filter/key-filter.ts
packages/ng/src/knob/knob.spec.ts
packages/ng/src/knob/knob.ts
packages/ng/src/listbox/listbox.spec.ts
packages/ng/src/listbox/listbox.ts
packages/ng/src/mega-menu/mega-menu-column.ts
packages/ng/src/mega-menu/mega-menu-style.ts
packages/ng/src/mega-menu/mega-menu.spec.ts
packages/ng/src/mega-menu/mega-menu.ts
packages/ng/src/menubar/menubar.spec.ts
packages/ng/src/menubar/menubar.ts
packages/ng/src/message/message.ts
packages/ng/src/meter-group/meter-group.spec.ts
packages/ng/src/meter-group/meter-group.ts
packages/ng/src/multi-select/multi-select.ts
packages/ng/src/overlay-badge/overlay-badge.spec.ts
packages/ng/src/overlay-badge/overlay-badge.ts
packages/ng/src/paginator/paginator.spec.ts
packages/ng/src/paginator/paginator.ts
packages/ng/src/panel-menu/panel-menu-style.ts
packages/ng/src/panel-menu/panel-menu.spec.ts
packages/ng/src/panel/panel.ts
packages/ng/src/password/password.spec.ts
packages/ng/src/password/password.ts
packages/ng/src/popover/popover.spec.ts
packages/ng/src/progress-bar/progress-bar.spec.ts
packages/ng/src/progress-spinner/progress-spinner.ts
packages/ng/src/rating/rating.spec.ts
packages/ng/src/rating/rating.ts
packages/ng/src/scroll-panel/scroll-panel.spec.ts
packages/ng/src/scroll-panel/scroll-panel.ts
packages/ng/src/scroller/scroller.spec.ts
packages/ng/src/scroller/scroller.ts
packages/ng/src/select-button/select-button.spec.ts
packages/ng/src/select/select.spec.ts
packages/ng/src/select/select.ts
packages/ng/src/skeleton/skeleton-style.ts
packages/ng/src/slider/slider.ts
packages/ng/src/speed-dial/speed-dial-style.ts
packages/ng/src/speed-dial/speed-dial.spec.ts
packages/ng/src/speed-dial/speed-dial.ts
packages/ng/src/split-button/split-button.stories.ts
packages/ng/src/splitter/splitter.spec.ts
packages/ng/src/stepper/step-item.ts
packages/ng/src/stepper/step-panel.ts
packages/ng/src/stepper/step.ts
packages/ng/src/stepper/stepper-style.ts
packages/ng/src/stepper/stepper.spec.ts
packages/ng/src/stepper/stepper.ts
packages/ng/src/steps/steps.ts
packages/ng/src/table/table.spec.ts
packages/ng/src/table/table.ts
packages/ng/src/tabs/tab-list.ts
packages/ng/src/tabs/tab-panel.ts
packages/ng/src/tabs/tab.ts
packages/ng/src/tabs/tabs.spec.ts
packages/ng/src/tabs/tabs.ts
packages/ng/src/tag/tag-style.ts
packages/ng/src/tag/tag.spec.ts
packages/ng/src/tag/tag.ts
packages/ng/src/textarea/textarea.spec.ts
packages/ng/src/tiered-menu/tiered-menu-style.ts
packages/ng/src/tiered-menu/tiered-menu-sub.ts
packages/ng/src/tiered-menu/tiered-menu.spec.ts
packages/ng/src/tiered-menu/tiered-menu.ts
packages/ng/src/timeline/timeline.spec.ts
packages/ng/src/timeline/timeline.ts
packages/ng/src/toast/toast.spec.ts
packages/ng/src/toast/toast.ts
packages/ng/src/toggle-button/toggle-button.spec.ts
packages/react-core/src/confirmation/confirmation-event-bus.spec.ts
packages/react-core/src/styling/use-component-style.ts
packages/react/e2e/accessibility-envelope.ts
packages/react/e2e/tooltip.spec.tsx
packages/react/src/accordion/accordion.tsx
packages/react/src/autocomplete/autocomplete.spec.tsx
packages/react/src/autocomplete/autocomplete.tsx
packages/react/src/block-ui/block-ui.spec.tsx
packages/react/src/breadcrumb/breadcrumb-style.ts
packages/react/src/breadcrumb/breadcrumb.stories.tsx
packages/react/src/breadcrumb/breadcrumb.tsx
packages/react/src/carousel/carousel.stories.tsx
packages/react/src/cascade-select/cascade-select.spec.tsx
packages/react/src/cascade-select/cascade-select.tsx
packages/react/src/checkbox/checkbox.stories.tsx
packages/react/src/chip/chip.tsx
packages/react/src/color-picker/color-picker.spec.tsx
packages/react/src/color-picker/color-picker.stories.tsx
packages/react/src/color-picker/color-picker.tsx
packages/react/src/confirm-dialog/confirm-dialog.spec.tsx
packages/react/src/confirm-dialog/confirm-dialog.tsx
packages/react/src/confirm-popup/confirm-popup.spec.tsx
packages/react/src/context-menu/context-menu-style.ts
packages/react/src/context-menu/context-menu.tsx
packages/react/src/data-scroller/data-scroller-style.ts
packages/react/src/data-scroller/data-scroller.spec.tsx
packages/react/src/data-scroller/data-scroller.stories.tsx
packages/react/src/data-scroller/data-scroller.tsx
packages/react/src/data-scroller/index.ts
packages/react/src/date-picker/date-picker.spec.tsx
packages/react/src/date-picker/date-picker.tsx
packages/react/src/dock/dock-style.ts
packages/react/src/dock/dock.tsx
packages/react/src/drawer/drawer.tsx
packages/react/src/fieldset/fieldset.tsx
packages/react/src/file-upload/file-upload.spec.tsx
packages/react/src/file-upload/file-upload.tsx
packages/react/src/float-label/float-label.tsx
packages/react/src/galleria/galleria.spec.tsx
packages/react/src/galleria/galleria.tsx
packages/react/src/icon-field/icon-field.tsx
packages/react/src/image/image.tsx
packages/react/src/inplace/inplace.spec.tsx
packages/react/src/input-chips/index.ts
packages/react/src/input-chips/input-chips-style.ts
packages/react/src/input-mask/input-mask.spec.tsx
packages/react/src/input-mask/input-mask.tsx
packages/react/src/input-number/input-number.tsx
packages/react/src/input-otp/input-otp.tsx
packages/react/src/input-switch/input-switch.spec.tsx
packages/react/src/input-switch/input-switch.tsx
packages/react/src/input-text/input-text.tsx
packages/react/src/input-textarea/input-textarea.tsx
packages/react/src/key-filter/key-filter.stories.tsx
packages/react/src/key-filter/key-filter.ts
packages/react/src/knob/knob.tsx
packages/react/src/listbox/listbox.spec.tsx
packages/react/src/listbox/listbox.tsx
packages/react/src/mega-menu/mega-menu-column.tsx
packages/react/src/mega-menu/mega-menu.spec.tsx
packages/react/src/mega-menu/mega-menu.tsx
packages/react/src/mention/mention.spec.tsx
packages/react/src/mention/mention.tsx
packages/react/src/menubar/menubar-sub.tsx
packages/react/src/menubar/menubar.spec.tsx
packages/react/src/menubar/menubar.stories.tsx
packages/react/src/menubar/menubar.tsx
packages/react/src/message/message.tsx
packages/react/src/meter-group/meter-group.tsx
packages/react/src/multi-select/multi-select.spec.tsx
packages/react/src/multi-select/multi-select.tsx
packages/react/src/multi-state-checkbox/multi-state-checkbox.spec.tsx
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx
packages/react/src/paginator/paginator.spec.tsx
packages/react/src/paginator/paginator.tsx
packages/react/src/panel-menu/panel-menu.spec.tsx
packages/react/src/panel-menu/panel-menu.stories.tsx
packages/react/src/panel-menu/panel-menu.tsx
packages/react/src/panel/panel.spec.tsx
packages/react/src/panel/panel.tsx
packages/react/src/password/password.tsx
packages/react/src/popover/popover.tsx
packages/react/src/progress-bar/progress-bar.spec.tsx
packages/react/src/progress-bar/progress-bar.tsx
packages/react/src/progress-spinner/progress-spinner.tsx
packages/react/src/radio-button/radio-button.tsx
packages/react/src/rating/rating.tsx
packages/react/src/scroll-panel/scroll-panel.spec.tsx
packages/react/src/scroll-panel/scroll-panel.tsx
packages/react/src/scroll-top/scroll-top.tsx
packages/react/src/scroller/scroller.spec.tsx
packages/react/src/scroller/scroller.tsx
packages/react/src/select-button/select-button.spec.tsx
packages/react/src/select-button/select-button.tsx
packages/react/src/select/select.spec.tsx
packages/react/src/select/select.tsx
packages/react/src/skeleton/skeleton-style.ts
packages/react/src/slider/slider.tsx
packages/react/src/speed-dial/index.ts
packages/react/src/speed-dial/speed-dial-style.ts
packages/react/src/speed-dial/speed-dial.spec.tsx
packages/react/src/speed-dial/speed-dial.tsx
packages/react/src/split-button/split-button.stories.tsx
packages/react/src/split-button/split-button.tsx
packages/react/src/splitter/splitter.spec.tsx
packages/react/src/splitter/splitter.tsx
packages/react/src/stepper/stepper.spec.tsx
packages/react/src/stepper/stepper.tsx
packages/react/src/steps/steps.spec.tsx
packages/react/src/steps/steps.tsx
packages/react/src/table/table-style.ts
packages/react/src/table/table.spec.tsx
packages/react/src/table/table.tsx
packages/react/src/tabs/tab-menu.tsx
packages/react/src/tabs/tab-view.tsx
packages/react/src/tabs/tabs-style.ts
packages/react/src/tabs/tabs.spec.tsx
packages/react/src/tag/tag.tsx
packages/react/src/terminal/terminal.tsx
packages/react/src/tiered-menu/tiered-menu-style.ts
packages/react/src/tiered-menu/tiered-menu-sub.tsx
packages/react/src/tiered-menu/tiered-menu.tsx
packages/react/src/timeline/timeline-style.ts
packages/react/src/toast/toast.tsx
packages/react/src/toggle-button/toggle-button.spec.tsx
packages/react/src/toggle-button/toggle-button.tsx
packages/react/src/tri-state-checkbox/index.ts
packages/react/src/tri-state-checkbox/tri-state-checkbox-style.ts
packages/react/src/tri-state-checkbox/tri-state-checkbox.stories.tsx
packages/themes/README.md
packages/themes/test/cross-framework-consistency.test.ts
packages/themes/test/utils/g3e-port.mjs
packages/uix-styled/src/utils/themeUtils.ts
packages/uix-styles/test/scope-guard.test.ts
packages/uix-utils/test/exports.test.ts
packages/vue-core/src/base/base-input.spec.ts
packages/vue-core/src/escape/create-display-order-mixin.spec.ts
packages/vue-core/src/escape/use-display-order.ts
packages/vue-core/src/icons/icons.spec.ts
packages/vue-core/src/overlay/portal.spec.ts
packages/vue-core/src/service/confirmation-service.ts
packages/vue-core/src/service/dialog-service.spec.ts
packages/vue-core/src/service/toast-service.spec.ts
packages/vue-core/src/styling/vue-style-sheet.ts
packages/vue-core/tsup.config.ts
packages/vue/e2e/accessibility-envelope.ts
packages/vue/e2e/g3a-aura-styles.spec.ts
packages/vue/e2e/tooltip.spec.ts
packages/vue/src/accordion-header/AccordionHeader.vue
packages/vue/src/accordion/Accordion.vue
packages/vue/src/animate-on-scroll/animate-on-scroll.ts
packages/vue/src/autocomplete/autocomplete.stories.ts
packages/vue/src/autocomplete/AutoComplete.vue
packages/vue/src/avatar-group/avatar-group.spec.ts
packages/vue/src/breadcrumb/BaseBreadcrumb.ts
packages/vue/src/breadcrumb/breadcrumb.spec.ts
packages/vue/src/breadcrumb/breadcrumb.stories.ts
packages/vue/src/breadcrumb/Breadcrumb.vue
packages/vue/src/button/button-style.ts
packages/vue/src/button/button.spec.ts
packages/vue/src/cascade-select/cascade-select.spec.ts
packages/vue/src/cascade-select/CascadeSelect.vue
packages/vue/src/cascade-select/CascadeSelectSublist.vue
packages/vue/src/checkbox/checkbox.spec.ts
packages/vue/src/checkbox/Checkbox.vue
packages/vue/src/color-picker/color-picker.spec.ts
packages/vue/src/color-picker/ColorPicker.vue
packages/vue/src/confirm-dialog/BaseConfirmDialog.ts
packages/vue/src/confirm-dialog/confirm-dialog.spec.ts
packages/vue/src/confirm-dialog/ConfirmDialog.vue
packages/vue/src/confirm-popup/BaseConfirmPopup.ts
packages/vue/src/confirm-popup/confirm-popup.spec.ts
packages/vue/src/context-menu/BaseContextMenu.ts
packages/vue/src/context-menu/context-menu-style.ts
packages/vue/src/context-menu/context-menu.spec.ts
packages/vue/src/date-picker/date-picker.spec.ts
packages/vue/src/date-picker/DatePicker.vue
packages/vue/src/dialog/dialog.spec.ts
packages/vue/src/dock/dock-style.ts
packages/vue/src/dock/Dock.vue
packages/vue/src/drawer/drawer-style.ts
packages/vue/src/dynamic-dialog/BaseDynamicDialog.ts
packages/vue/src/file-upload/BaseFileUpload.ts
packages/vue/src/file-upload/file-upload.spec.ts
packages/vue/src/file-upload/FileUpload.vue
packages/vue/src/float-label/BaseFloatLabel.ts
packages/vue/src/float-label/float-label.spec.ts
packages/vue/src/galleria/Galleria.vue
packages/vue/src/icon-field/BaseInputIcon.ts
packages/vue/src/ifta-label/ifta-label.spec.ts
packages/vue/src/image-compare/ImageCompare.vue
packages/vue/src/image/image.spec.ts
packages/vue/src/image/Image.vue
packages/vue/src/inline-message/BaseInlineMessage.ts
packages/vue/src/inline-message/inline-message.spec.ts
packages/vue/src/input-chips/BaseInputChips.ts
packages/vue/src/input-chips/InputChips.vue
packages/vue/src/input-group/BaseInputGroup.ts
packages/vue/src/input-group/input-group.spec.ts
packages/vue/src/input-mask/input-mask.spec.ts
packages/vue/src/input-mask/InputMask.vue
packages/vue/src/input-number/input-number.spec.ts
packages/vue/src/input-number/InputNumber.vue
packages/vue/src/input-otp/input-otp.spec.ts
packages/vue/src/key-filter/key-filter.ts
packages/vue/src/knob/knob.spec.ts
packages/vue/src/knob/Knob.vue
packages/vue/src/listbox/listbox.spec.ts
packages/vue/src/listbox/Listbox.vue
packages/vue/src/mega-menu/mega-menu-style.ts
packages/vue/src/mega-menu/mega-menu.spec.ts
packages/vue/src/menu/Menu.vue
packages/vue/src/menu/Menuitem.vue
packages/vue/src/menubar/menubar-style.ts
packages/vue/src/menubar/menubar.spec.ts
packages/vue/src/menubar/MenubarSub.vue
packages/vue/src/message/Message.vue
packages/vue/src/meter-group/BaseMeterGroup.ts
packages/vue/src/meter-group/MeterGroup.vue
packages/vue/src/multi-select/multi-select.spec.ts
packages/vue/src/multi-select/MultiSelect.vue
packages/vue/src/overlay-badge/BaseOverlayBadge.ts
packages/vue/src/paginator/paginator-style.ts
packages/vue/src/paginator/paginator.spec.ts
packages/vue/src/paginator/Paginator.vue
packages/vue/src/panel-menu/panel-menu-style.ts
packages/vue/src/panel-menu/panel-menu.spec.ts
packages/vue/src/password/password-style.ts
packages/vue/src/password/Password.vue
packages/vue/src/popover/popover.spec.ts
packages/vue/src/progress-bar/BaseProgressBar.ts
packages/vue/src/progress-spinner/ProgressSpinner.vue
packages/vue/src/radio-button/radio-button.spec.ts
packages/vue/src/scroll-panel/BaseScrollPanel.ts
packages/vue/src/scroll-panel/scroll-panel.spec.ts
packages/vue/src/scroll-top/BaseScrollTop.ts
packages/vue/src/scroll-top/scroll-top.spec.ts
packages/vue/src/scroller/scroller.spec.ts
packages/vue/src/scroller/Scroller.vue
packages/vue/src/select-button/SelectButton.vue
packages/vue/src/select/select.spec.ts
packages/vue/src/select/Select.vue
packages/vue/src/skeleton/skeleton-style.ts
packages/vue/src/slider/Slider.vue
packages/vue/src/speed-dial/speed-dial-style.ts
packages/vue/src/speed-dial/speed-dial.spec.ts
packages/vue/src/speed-dial/SpeedDial.vue
packages/vue/src/split-button/BaseSplitButton.ts
packages/vue/src/split-button/split-button.spec.ts
packages/vue/src/split-button/SplitButton.vue
packages/vue/src/splitter/Splitter.vue
packages/vue/src/stepper/Step.vue
packages/vue/src/stepper/stepper-style.ts
packages/vue/src/steps/steps-style.ts
packages/vue/src/style-class/style-class.ts
packages/vue/src/table/table-style.ts
packages/vue/src/table/table.spec.ts
packages/vue/src/table/Table.vue
packages/vue/src/tabs/Tab.vue
packages/vue/src/tag/Tag.vue
packages/vue/src/tiered-menu/BaseTieredMenu.ts
packages/vue/src/tiered-menu/tiered-menu-style.ts
packages/vue/src/tiered-menu/TieredMenuSub.vue
packages/vue/src/timeline/timeline-style.ts
packages/vue/src/toast/toast.spec.ts
packages/vue/src/tooltip/tooltip.spec.ts
packages/vue/src/tooltip/tooltip.ts
packages/vue/tsup.config.ts
scripts/provenance/extract-primevue-source.test.mjs
scripts/provenance/validate-g3a-accessibility.test.mjs
scripts/provenance/validate-mcp-boundary.test.mjs
scripts/provenance/verify-tree-shaking-vue.mjs
```
