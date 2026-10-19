# Affected-Only CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED — Plan Review passed (user, 2026-10-19), revision 2; native execution authorized. Pushing, opening the PR, merging and the post-merge steps each need their own explicit authorization. The in-session Plan Review findings PR-1 to PR-4 are applied (see the record at the end).

**Goal:** Skip the expensive `ci` steps on docs-only PRs, and run only the changed frameworks' Browser track-a jobs on PRs, while the required `ci` check always runs and every uncertain case runs everything.

**Architecture:** One pure, tested classifier (`scripts/provenance/classify-changes.mjs`) drives:

- step-level `if:` gates in `ci`;
- a dynamic track-a matrix in `browser.yml`;
- the widening rule in `affected-packages.mjs`.

Docs: `AGENTS.md` hooks note and ADR-069.

**Tech Stack:** Node 24.15.0 ESM, `node:test`, GitHub Actions YAML, `actionlint`, pnpm 9.6.0.

**Spec:** `docs/superpowers/specs/2026-10-19-affected-only-ci-design.md` (revision 2). R1–R7 and AC1–AC7 are binding.

## Global Constraints

- **Branch and worktree:** `research/affected-only-ci` in `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate-affected-ci`, from `origin/develop` `84fcdce2`, created with `--no-track`. Push with an explicit `src:dst` refspec.
- **Node:** prefix every `pnpm`/`node` command with `source ~/.nvm/nvm.sh && nvm use 24.15.0`.
- **Authorizations:** after Plan Review approval, commit, push this branch and open one PR into `develop`. **No merge without the user's explicit authorization.** No GitHub setting changes.
- **Hands off:** `ci-extended`, `track-e-ssr-hydration`, `release.yml`, `perf-stage1.yml`, hook commands, branch protection, the `ci` check name and triggers, S1–S7, Phase 2.
- **Gate expression:** `scope != 'docs'`, never `== 'full'` (Spec R3).

## Review Focus

1. **Missing classifier output.** If "Classify changes" errors before writing output, every gated step must still run. Task 3's `grep` and the AC1 bad-ref case cover this.
2. **Renamed or moved files.** `git diff --name-only` lists only the new path for a rename, so a file moved out of `packages/` into `docs/` reads as docs-only. Task 1 adds a test that a rename **from** `packages/…` counts by its old path too: use `--name-status -M` and include both sides.
3. **Root Markdown that a tool reads.** `README.md`, `CHANGELOG.md` and `SECURITY.md` at the root are docs-only. `AGENTS.md` is not (pointer validation). Task 1 tests each.
4. **Empty matrix.** `fromJSON('[]')` in a matrix is a workflow error. The job-level `if:` must stop it first. Task 4's `actionlint` plus the AC6 run cover this.
5. **Push on a new branch.** For a `push`, the classifier must not call git at all and must return full. Task 1 tests that the CLI with `--event push` returns full without a base ref.

---

### Task 1: Classifier module and tests

**Files:**

- Create: `scripts/provenance/classify-changes.mjs`
- Create: `scripts/provenance/classify-changes.test.mjs`

**Interfaces:**

- Produces:
  - `isDocsOnlyPath(path: string): boolean`;
  - `classifyChanges(paths: string[], { event }: { event: string }): { scope: "docs" | "full", frameworks: string[] }`;
  - CLI outputs `scope` and `frameworks` (JSON) to `$GITHUB_OUTPUT`.

- [ ] **Step 1: Write the failing tests** in `classify-changes.test.mjs`, one `test()` per AC1 case, with the exact expectations from Spec AC1. Also add:
  - Review Focus 2: renamed paths, both sides counted;
  - Review Focus 3: root `README.md`, `CHANGELOG.md` and `SECURITY.md` → docs; `AGENTS.md` → full;
  - Review Focus 5: `--event push` → full, with no git call;
  - Spec R1: with `GITHUB_OUTPUT` pointing at a temp file, a docs-only fixture writes exactly `frameworks=[]` and `scope=docs`, and an `ng` fixture writes exactly `frameworks=["ng"]`.

  The CLI cases run the script through `execFileSync(process.execPath, [...])` and parse its stdout.

- [ ] **Step 2: Run** `node --test scripts/provenance/classify-changes.test.mjs`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement** `classify-changes.mjs` per Spec R1. Collect changed paths with `git diff --name-status -M <mergeBase>...HEAD` and take every path column, so both sides of a rename count. Reuse `getMergeBaseSha` from `baseline-lib.mjs`. Wrap the git part in `try`, so an error writes the full result and exits 0.
- [ ] **Step 4: Run** the same command. Expected: all pass.
- [ ] **Step 5: Commit** `feat(ci): add a change classifier for scoped CI`.

### Task 2: Widen `affected-packages` on root and shared changes

**Files:**

- Modify: `scripts/provenance/affected-packages.mjs` (`computeAffectedPackages`)
- Modify: `scripts/provenance/affected-packages.test.mjs`

**Interfaces:**

- Consumes: `isDocsOnlyPath` from Task 1.

- [ ] **Step 1: Write the failing tests** from Spec AC2: `["pnpm-lock.yaml"]` and `["scripts/provenance/x.mjs"]` each → `getAllPackageNames()` short names, 17; `["docs/x.md"]` → `[]`.
- [ ] **Step 2: Run** `node --test scripts/provenance/affected-packages.test.mjs`. Expected: the two widening tests FAIL; the docs test and the existing tests pass.
- [ ] **Step 3: Implement** Spec R2 at the top of `computeAffectedPackages`.
- [ ] **Step 4: Run** `pnpm run test:scripts` (after `pnpm run vendor:fetch -- primereact primevue` in a fresh worktree). Expected: all pass.
- [ ] **Step 5: Commit** `fix(ci): treat root and shared changes as affecting every package`.

### Task 3: Gate the expensive `ci` steps

**Files:**

- Modify: `.github/workflows/ci.yml` (job `ci` only)

- [ ] **Step 1: Write the check first.** Add `check-scope-gates.sh` to the plan's SDD workspace. It asserts Spec AC3:
  - for each of the 16 R3 step names, the step's `if:` line contains `steps.classify.outputs.scope != 'docs'`;
  - there is no `== 'full'` anywhere;
  - no `paths:`/`paths-ignore:` in any workflow;
  - the `ci` job has no job-level `if:`;
  - "Classify changes" exists with `id: classify` and its `EVENT` comes from `env`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement** Spec R3.
- [ ] **Step 4: Run** the check and `actionlint .github/workflows/ci.yml`. Expected: both pass.
- [ ] **Step 5: Commit** `ci: skip expensive ci steps on docs-only pull requests`.

### Task 4: Dynamic track-a matrix

**Files:**

- Modify: `.github/workflows/browser.yml`

- [ ] **Step 1: Extend `check-scope-gates.sh`:**
  - a `changes` job exists with output `frameworks`;
  - track-a has `needs: changes`, `if: needs.changes.outputs.frameworks != '[]'` and `framework: ${{ fromJSON(needs.changes.outputs.frameworks) }}`;
  - track-a's steps are byte-identical to `origin/develop`'s;
  - `track-e-ssr-hydration` is byte-identical.

  Run it. Expected: FAIL.

- [ ] **Step 2: Implement** Spec R4.
- [ ] **Step 3: Run** the check and `actionlint .github/workflows/browser.yml`. Expected: both pass.
- [ ] **Step 4: Commit** `ci: run only changed frameworks' browser jobs on pull requests`.

### Task 5: `AGENTS.md` and ADR-069

**Files:**

- Modify: `AGENTS.md` §7.1 (R5)
- Modify: `docs/architecture/DECISIONS.md` (append ADR-069, R6, with the decision date)

- [ ] **Step 1:** Apply R5 and R6 verbatim.
- [ ] **Step 2: Run** `pnpm run agents-md-pointers:validate`, `npx prettier --check .` and `pnpm run lint`. Expected: all pass (AC4).
- [ ] **Step 3: Commit** `docs(ci): record change-scoped CI (ADR-069)`, also adding the research record, Spec and Plan with their approved Status lines.

### Task 6: PR and AC5 evidence — HARD USER STOP

- [ ] **Step 1:** Dispatch one fresh whole-branch reviewer **before pushing**. Fix Critical and Important findings test-first.
- [ ] **Step 2:** Push `research/affected-only-ci:refs/heads/research/affected-only-ci`. Open a PR with `--base develop`.
- [ ] **Step 3:** Check AC5 from the runs:
  - "Classify changes" logs `scope=full`;
  - no `ci` step is skipped;
  - `ci` succeeds;
  - track-a runs ng, react and vue.
- [ ] **Step 4: HARD USER STOP.** Report the evidence and ask for merge authorization.

### Task 7: After merge — AC6 and AC7 (separately authorized)

- [ ] **Step 1:** Check AC7 on the `develop` push run: no step skipped; track-a runs all three frameworks.
- [ ] **Step 2:** With authorization, open a docs-only closeout PR into `develop` that records the evidence. Check AC6 on it:
  - `scope=docs`;
  - the 16 R3 steps show as skipped;
  - `ci` succeeds;
  - track-a has no jobs;
  - SSR runs.

  Merging it needs its own authorization.

## Plan Review record (2026-10-19)

The review checked revision 1 against Spec revision 2. It was run in this session, not by an independent reviewer.

| ID   | Finding                                                                                                                                      | Resolution                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| PR-1 | Tasks 3 and 7 said "14 R3 steps". Spec revision 1 listed 13, and revision 2 lists 16 (SR-2).                                                 | Both now say 16.                                     |
| PR-2 | Task 1 had no test for the compact JSON output that Spec R1 now requires (SR-4).                                                             | Task 1 Step 1 adds exact `GITHUB_OUTPUT` assertions. |
| PR-3 | Task 6 dispatched the final reviewer after pushing and opening the PR, so a finding would land as extra PR commits after CI had already run. | The review now runs before the push (Task 6 Step 1). |
| PR-4 | The header still cited Spec revision 1.                                                                                                      | It now cites revision 2.                             |

Checked and found correct:

- Every Spec requirement maps to a task: R1 → Task 1, R2 → Task 2, R3 → Task 3, R4 → Task 4, R5–R6 → Task 5, R7 → Tasks 5–6.
- Every acceptance criterion has a check: AC1 → Task 1, AC2 → Task 2, AC3 → Tasks 3–4, AC4 → Task 5, AC5 → Task 6, AC6–AC7 → Task 7.
- `browser.yml`'s track-a and SSR jobs are unchanged between `84fcdce2` and `2b93c2e2`, so Task 4's byte-identity check against `origin/develop` holds.
