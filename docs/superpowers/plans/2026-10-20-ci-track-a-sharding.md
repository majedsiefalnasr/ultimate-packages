# Track-a Sharding (CO-8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED — Plan Review passed (user, 2026-10-20), revision 2. Spec revision 2 is approved (user, 2026-10-20). In-session Plan Review findings PR-1 and PR-2 are applied (record at the end). Native execution is chosen. No task is authorized; implementation, push, PR and each merge need their own authorization.

**Goal:** Split the ng and vue Browser track-a jobs into three shards each, with react unchanged, so the longest Browser job gets shorter without any test changing (ADR-071).

**Architecture:**

- The tested change classifier gains a `track_a` matrix output (framework × shard).
- `browser.yml` uses that output as the track-a matrix and adds one `matrix.shard` clause to each suite's steps.
- No test, validator, step name or other job changes.

**Tech Stack:** Node 24.15.0 ESM, `node:test`, GitHub Actions YAML, `actionlint`, pnpm 9.6.0.

**Spec:** `docs/superpowers/specs/2026-10-20-ci-track-a-sharding-design.md` (revision 2). R1–R4 and AC1–AC4 are binding; every time in it is an estimate.

## Global Constraints

- **Branch:** `research/ci-track-a-sharding` in `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate-ci-cd-optimization`, `--no-track` from `origin/develop` `af6a3d28`. The closeout gets its own docs-only branch after the merge.
- **Push:** only with an explicit `src:dst` refspec.
- **Node:** prefix every `pnpm`/`node` command with `source ~/.nvm/nvm.sh && nvm use 24.15.0`.
- **Shard map (Spec R1):**
  - shard 1: strict suite, its accessibility baseline validation and its two uploads, G3-C2, W1;
  - shard 2: G3-A, G3-D;
  - shard 3: G3-B, G3-C1, G3-E.
- **Shard counts:** `{ ng: 3, react: 1, vue: 3 }`.
- **Hands off:**
  - test and spec files, validators, baselines;
  - step names;
  - the SSR jobs, `ci.yml`, `release.yml`, `perf-stage1.yml`;
  - the classifier's `scope` and `frameworks`;
  - triggers, concurrency, branch protection.
- **Authorizations:** each commit and push is a Plan step under the standing authorization; each merge needs the user's explicit authorization.

## Review Focus

1. **Duplicate artifact uploads.** Every `if: always()` upload that lacks a shard clause would run in all three shards and collide on its artifact name, failing the job. Task 2's check requires a shard clause on every upload except the tranche-report upload, which gets the shard in its artifact name.
2. **Shard as number versus string.** `JSON.stringify` writes numbers, and the workflow compares `matrix.shard == 1`. Task 1 asserts `typeof shard === "number"`.
3. **Fail-safe matrix.** A push, a classifier error or an unknown path must still give all seven jobs. Task 1 tests the CLI on a push and on an unresolvable base ref.
4. **A suite split across shards.** A tranche's run, validator and upload must share one shard. Task 2's check groups the steps by tranche and asserts one shard per group.
5. **Empty frameworks.** `frameworks=[]` must skip the job before the matrix is read. The job-level `if:` is unchanged; Task 1 asserts `{"include":[]}` for that case, so the matrix stays valid JSON anyway.

---

### Task 1: Classifier `track_a` output

**Files:**

- Modify: `scripts/provenance/classify-changes.mjs`
- Modify: `scripts/provenance/classify-changes.test.mjs`

**Interfaces:**

- Produces:
  - `TRACK_A_SHARDS: { ng: 3, react: 1, vue: 3 }` (frozen);
  - `trackAMatrix(frameworks: string[]) → { include: { framework: string, shard: number }[] }`, in framework order and then shard order;
  - `formatOutput(result)` writes a third line, `track_a=<JSON.stringify(trackAMatrix(result.frameworks))>`.

- [ ] **Step 1: Write the failing tests.**
  - `trackAMatrix(["ng","react","vue"])` deep-equals the 7 entries `ng 1, ng 2, ng 3, react 1, vue 1, vue 2, vue 3`, and every `shard` is a number.
  - `trackAMatrix(["react"])` gives `[{react 1}]`; `trackAMatrix([])` gives `{ include: [] }`.
  - `formatOutput({ scope: "docs", frameworks: [] })` gives `scope=docs\nframeworks=[]\ntrack_a={"include":[]}\n`. Update the existing `formatOutput` test to expect this line.
  - **Existing exact-output CLI tests (PR-1):** the four `assert.equal(output, …)` assertions (two ADR-069 CLI tests, two ADR-070 temp-git-repo tests) each gain the matching `track_a=` line: the full 7-entry matrix after `frameworks=["ng","react","vue"]`, and `track_a={"include":[]}` after `frameworks=[]`. These are the only edits to existing assertions.
  - The CLI with `--event push`, and with `--base-ref origin/no-such-branch-for-test`, each writes a `track_a=` line holding all 7 entries.
- [ ] **Step 2: Run** `node --test scripts/provenance/classify-changes.test.mjs`. Expected: FAIL; `trackAMatrix` is not exported.
- [ ] **Step 3: Implement** `TRACK_A_SHARDS`, `trackAMatrix` and the `formatOutput` line, with a one-line comment citing ADR-071.
- [ ] **Step 4: Run** the test file, then `pnpm run test:scripts`. Expected: all pass.
- [ ] **Step 5: Commit** `feat(ci): emit the track-a shard matrix from the classifier`.

### Task 2: Shard the track-a job

**Files:**

- Modify: `.github/workflows/browser.yml`
- Create (not committed): `.superpowers/sdd/2026-10-20-ci-track-a-sharding/verify-shards.sh`

**Interfaces:**

- Consumes: the `track_a` output from Task 1, through `needs.changes.outputs.track_a`.

- [ ] **Step 1: Capture, then write the check script (PR-2).** Before any edit, save the track-a job's step names, in order, to `.superpowers/sdd/2026-10-20-ci-track-a-sharding/track-a-steps-before.txt`. Then write the script; it exits non-zero on the first failure and fails until the workflow is changed.
  - `actionlint` is clean.
  - The `changes` job outputs `track_a: ${{ steps.classify.outputs.track_a }}`.
  - The track-a `matrix:` line is exactly `matrix: ${{ fromJSON(needs.changes.outputs.track_a) }}`, and `fail-fast: false` is still present (Spec SR-1).
  - The track-a job-level `if: needs.changes.outputs.frameworks != '[]'` is unchanged.
  - **Per-step shard clauses:** every step whose name starts with `Run Playwright projects`, `Accessibility baseline validation`, `Upload accessibility reports`, `Upload Playwright HTML report (`, `Run G3-`, `G3-`, `Upload G3-` or `Run W1` has exactly one `matrix.shard == N` in its `if:`, with N as in the Global Constraints shard map. All steps of one tranche (`Run G3-X`, `G3-X differential`, `Upload G3-X`) share one N.
  - `Upload Playwright HTML reports (tranches)` has no shard clause, and its artifact name is `playwright-report-tranches-${{ matrix.framework }}-${{ matrix.shard }}`.
  - The in-order list of the track-a job's step names is identical to `track-a-steps-before.txt` (Spec SR-2).
- [ ] **Step 2: Run it.** Expected: FAIL at the first shard check.
- [ ] **Step 3: Edit `browser.yml`** per Spec R3:
  - add the `changes` output and the `fromJSON` matrix;
  - give the strict suite `if: ${{ matrix.shard == 1 }}` and the baseline validation `if: ${{ matrix.shard == 1 }}`;
  - give the strict uploads `always() && matrix.shard == 1`;
  - append `&& matrix.shard == N` to each tranche and W1 condition;
  - rename the tranche-report artifact.
- [ ] **Step 4: Run** the check script and `prettier --check .github/workflows/browser.yml`. Expected: PASS.
- [ ] **Step 5: Commit** `ci(browser): shard the ng and vue track-a jobs`.

### Task 3: Landing and AC3 evidence

**Files:** the records this branch carries: `docs/architecture/DECISIONS.md` (ADR-071), the Spec, and this Plan.

- [ ] **Step 1:** Run `prettier --check .`, `pnpm run lint` and `pnpm run test:scripts`. Expected: pass. Then commit the three records: `docs(ci): record ADR-071 and the track-a sharding Spec and Plan`.
- [ ] **Step 2:** Final whole-branch review by a fresh reviewer, given the Review Focus above. Critical and Important findings are fixed test-first in one pass; Minor findings are recorded.
- [ ] **Step 3:** With authorization, push and open one PR into `develop`.
- [ ] **Step 4: AC3.**
  - The PR's Browser run has 7 track-a jobs: `(ng, 1–3)`, `(react, 1)`, `(vue, 1–3)`.
  - Each R1 step is `success` in its shard and `skipped` in the others.
  - Summed across each framework's shards, the Playwright `N passed` counts equal the Stage 3 push run's (Spec AC3 lists them).
  - Artifacts are uniquely named, and no upload fails.
  - Record each shard's job time.
- [ ] **Step 5:** Stop. The merge needs the user's authorization.

### Task 4: Push-run measurement and closeout

**Files:**

- Create: `docs/architecture/research/2026-MM-DD-ci-track-a-sharding-closeout.md`, on a docs-only branch from `origin/develop` after the merge.

- [ ] **Step 1: AC4.** On the push run after the merge:
  - repeat AC3's checks;
  - measure every shard's job time and the longest Browser job;
  - compare them with Spec §2 and the R1 estimates, and state plainly whether the critical path was materially shortened.
- [ ] **Step 2:** Write the closeout record in the style of the earlier CI closeouts: what landed, local verification, AC1–AC4 with run links, measured versus estimated, open items.
- [ ] **Step 3:** With authorization, open the docs-only closeout PR. Stop; the merge needs the user's authorization.

## Plan Review record

**In-session review (2026-10-20), against approved Spec revision 2:**

| ID   | Finding                                                                                                                                     | Resolution                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| PR-1 | Task 1 adds a `track_a=` output line, but four existing CLI tests assert the exact output, so they would fail and could read as regressions | Task 1 Step 1 names the four assertions and their exact new expected text; no other existing assertion changes |
| PR-2 | Task 2's in-order step-list comparison needs a list captured before the edit, and no step said when to capture it                           | Task 2 Step 1 captures it first, to a named workspace file                                                     |

Checked and found consistent:

- **Requirement coverage:** every Spec requirement maps to a task (R1: Global Constraints and Task 2; R2: Task 1; R3: Task 2; R4: Tasks 3 and 4), and every AC has a verifying step (AC1: Task 1; AC2: Task 2; AC3: Task 3; AC4: Task 4).
- **Review Focus:** it covers SR-1 (`fail-fast`), SR-2 (step order) and artifact isolation.
- **Hands off:** no task touches tests, validators, step names, the SSR jobs, `ci.yml`, release, triggers or protection.

**Plan Review approved (user, 2026-10-20)** on revision 2, with native execution.
