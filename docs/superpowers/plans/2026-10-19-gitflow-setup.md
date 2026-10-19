# Gitflow Setup and CI Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED — Plan Review passed (user, 2026-10-19), revision 2; native execution authorized. Merging, creating `develop` and each GitHub setting still need their own explicit authorization.

- Aligned with Spec revision 2 (Spec Review findings SR-1 to SR-6 applied).
- The in-session Plan Review findings PR-1 to PR-5 are applied (§ Plan Review record at the end).

**Goal:** Make `develop` a working integration branch, with a fast, reliable `ci` check that runs for PRs into `main` and `develop` and diffs against the PR's target branch.

**Architecture:**

- One branch, `feature/gitflow-setup`, from `origin/main`, in a new worktree.
- Workflow changes:
  - `ci.yml` keeps a required job `ci` and gains a non-required job `ci-extended`.
  - The two Playwright jobs move unchanged to `browser.yml`.
- Config and docs changes: `package.json`, `.changeset/config.json`, `AGENTS.md`, `MIGRATION.md` and ADR-068.
- One PR into `main`. After the merge, `develop` is created and the GitHub settings are applied, each as a separate authorization.

**Tech Stack:** GitHub Actions YAML, `actionlint`, `awk`/`grep`/`diff`, pnpm 9.6.0, Node 24.15.0 (ADR-059), `prettier`, `gh`.

**Spec:** `docs/superpowers/specs/2026-10-19-gitflow-setup-design.md` (revision 2). Requirements R1–R11, AC1–AC10 and §6 are binding and are cited, not restated.

**Research:** `docs/architecture/research/2026-10-19-gitflow-setup-research.md` (revision 2).

## Global Constraints

- **Authorizations:**
  - After Plan Review approval: create the worktree and branch, commit, push the feature branch, and open one PR into `main`.
  - **No merge without the user's explicit authorization** (Task 4 is a HARD USER STOP).
  - Creating and pushing `develop` and each GitHub setting need their own explicit authorization (Tasks 5 and 6).
- **Hands off:** PRs #15, #37 and #38; deferred work S1–S7 and their worktrees; GAP statuses; COMPLETION_REGISTER; approved historical Specs and Plans.
- **No content change to moved steps or jobs** (Spec §3). The only allowed edits are R2's base-ref changes, R4's new setup steps and comment, and R5's file header.
- **Git mechanics:** `git worktree add --no-track`; push with an explicit `src:dst` refspec (the `push.default=upstream` trap).
- **Paths:** the worktree is `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate-gitflow-setup`. "The old `ci.yml`" means `git show 61f90979:.github/workflows/ci.yml`, read through process substitution; it is not saved to a file.
- **Node:** the shell default is Node 23.11.0, which fails the root `engines` (`^24.15.0`). Prefix every `pnpm`/`node` command with `source ~/.nvm/nvm.sh && nvm use 24.15.0` (installed under nvm).

## Review Focus

1. **Push event base.** On `push`, `github.base_ref` is empty, so `BASE` is the pushed branch and the diff against `origin/$BASE` is empty. That matches today's push behavior against `origin/main`. Task 2 Step 6 checks the expression.
2. **Dropped `if: ${{ !cancelled() }}`.** A moved step that loses its condition would stop running after an earlier failure. Task 2's AC2 check compares names only, so Step 5's diff also compares each moved step's full text.
3. **`ci-extended` setup drift.** Its Setup Node.js step must use `24.15.0` and `cache: "pnpm"` exactly as `ci` does; a different Node would change the measurements. Task 2 Step 5 greps both jobs.
4. **Inline expression injection.** `github.base_ref` is a branch name chosen by the PR author. It must reach shell only through `env`. Task 2 Step 6 (AC4) checks this.
5. **Reader confusion from a red workflow result.** The `CI` run stays red because of `ci-extended`. The R4 comment and ADR-068 must say that `ci` is the merge signal. Task 3 Step 4 checks the wording.

---

### Task 1: Worktree, branch and Phase 1 records

**Files:**

- Create (moved from the primary checkout's untracked drafts):
  - `docs/architecture/research/2026-10-19-gitflow-setup-research.md`
  - `docs/superpowers/specs/2026-10-19-gitflow-setup-design.md`
  - `docs/superpowers/plans/2026-10-19-gitflow-setup.md`

- [ ] **Step 1:** `git fetch origin --prune`; confirm `origin/main` is `61f90979` or record the new SHA. If it moved, re-run the research §2.2 checks before continuing.
- [ ] **Step 2:** `git worktree add --no-track -b feature/gitflow-setup ../ultimate-gitflow-setup origin/main`. Expected: `git -C ../ultimate-gitflow-setup status -sb` shows `## feature/gitflow-setup` with no upstream.
- [ ] **Step 3:** Copy the three drafts into the worktree, update their Status lines to the approved states and dates, then `cmp` each worktree file against its source. Remove the three untracked drafts from the primary checkout only after `cmp` passes. `ULTIMATE_COMPLETION_PHASES.md` stays where it is.
- [ ] **Step 4:** `pnpm install --frozen-lockfile` in the worktree with Node 24.15.0. Then run `npx prettier --check` on the three files. Expected: pass.
- [ ] **Step 5: Commit**

```bash
git add docs/architecture/research/2026-10-19-gitflow-setup-research.md docs/superpowers/specs/2026-10-19-gitflow-setup-design.md docs/superpowers/plans/2026-10-19-gitflow-setup.md
git commit -m "docs(gitflow): record Phase 1 research, Spec and Plan"
```

### Task 2: Split CI into `ci`, `ci-extended` and `Browser`

**Files:**

- Modify: `.github/workflows/ci.yml` (R1–R4; delete lines 192–480 after the move)
- Create: `.github/workflows/browser.yml` (R5)
- Modify: `package.json:39`, `package.json:41` (R6)

**Interfaces:**

- Produces: check name `ci` (job ID, no `name:`); job `ci-extended`; workflow `Browser` with job IDs `track-a-browser-visual-a11y` and `track-e-ssr-hydration`. Tasks 4–6 refer to these names.

- [ ] **Step 1: Write the checks first.** In the scratchpad, write `check-ci-split.sh`. It takes the worktree path and does the following:

  - **AC2:** extract the named steps per job with `awk` (job header `^  <id>:$`, step line `^      - name: `). Assert:
    - `ci` ∪ `ci-extended` equals the 37 old `ci` step names;
    - the counts are `ci` = 32 and `ci-extended` = 11;
    - the names common to both are exactly Checkout, Fetch base ref, Setup pnpm, Setup Node.js, Install dependencies and Build.
  - **AC3:** `diff <(git show 61f90979:.github/workflows/ci.yml | sed -n '193,480p') <(sed -n "$START,\$p" browser.yml)`, where `$START` is the first line after the header comment and `on:`/`jobs:` block. Expected: no output.
  - **AC4:**
    - `grep -n 'origin/main' .github/workflows/*.yml` prints nothing;
    - `grep -nE 'run:.*\$\{\{ *github\.(base_ref|ref_name)' .github/workflows/*.yml` prints nothing;
    - each of `ci` and `ci-extended` has exactly one `BASE: ${{ github.base_ref || github.ref_name }}`.
  - **R1:** `ci.yml` and `browser.yml` each contain `branches: [main, develop]` twice.

- [ ] **Step 2: Run the checks on the unchanged worktree.** Expected: FAIL, because there is no `ci-extended`, no `browser.yml` and three `origin/main` hits.
- [ ] **Step 3: Implement R1–R5.**

  - Cut lines 193–480 (the comment and both Playwright jobs) into `browser.yml`, under a header comment, `name: Browser`, and R1's `on:` block.
  - Delete line 192 (the blank separator) from `ci.yml`.
  - Add `env: BASE: ${{ github.base_ref || github.ref_name }}` to `ci`.
  - Change "Fetch base ref" and the two `--base-ref` steps per R2.
  - Move the five R3-removed steps, in their current relative order, into the new `ci-extended` job after its six setup steps (R4).
  - Add the R4 comment above `ci-extended`, naming GAP-094 and the `component-metadata` size regression.

- [ ] **Step 4: Implement R6.** Edit the two `package.json` scripts. In `ci-extended`, the two calls become `pnpm run size:validate -- --base-ref "origin/$BASE"` and `pnpm run coverage:validate -- --base-ref "origin/$BASE"`.
- [ ] **Step 5: Diff the moved step bodies.** For each of the five moved steps and the six repeated setup steps, compare the full step text in the old `ci.yml` with the new text. The only allowed differences are the R2 base-ref lines. Also `grep -A3 'Setup Node.js'` in both jobs: both show `node-version: "24.15.0"` and `cache: "pnpm"`.
- [ ] **Step 6: Run the checks again** (`check-ci-split.sh`, then `actionlint .github/workflows/ci.yml .github/workflows/browser.yml`). Expected: all pass, and `actionlint` prints nothing (AC1–AC4).
- [ ] **Step 7: Local spot check of R6.** Run `node scripts/provenance/validate-bundle-size.mjs --base-ref origin/main` once after `pnpm run build && pnpm run size:measure`. Expected: it runs and names `origin/main` in its output. The same `component-metadata` FAIL as research §5.1 is expected and is not repaired.
- [ ] **Step 8: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/browser.yml package.json
git commit -m "ci: split required ci from extended and browser checks for Gitflow"
```

### Task 3: Changesets base, `AGENTS.md`, `MIGRATION.md` and ADR-068

**Files:**

- Modify: `.changeset/config.json:8` (R7)
- Modify: `AGENTS.md:50`, `AGENTS.md:83-91`, `AGENTS.md:100-108` (R8)
- Modify: `docs/architecture/MIGRATION.md` §7.1, §7.2, §7.4 (R9)
- Modify: `docs/architecture/DECISIONS.md` (append ADR-068 after ADR-067, R10)

- [ ] **Step 1:** Apply R7. Expected `git diff .changeset/config.json`: one line, `"baseBranch": "develop",`.
- [ ] **Step 2:** Apply R8 with the exact sentences from Spec R8.
- [ ] **Step 3:** Apply R9. Keep every existing sentence that R9 does not name. The §7.4 paragraph carries the date of the merge.
- [ ] **Step 4:** Append R10's ADR-068 text verbatim. Its Status date is 2026-10-19, the date of the GF, CI and revised GF-6 approvals. Confirm that ADR-068 says `ci` is the merge signal and that the `CI` run may be red (Review Focus 5).
- [ ] **Step 5: Verify.** Run `pnpm run agents-md-pointers:validate`, `npx prettier --check AGENTS.md docs/architecture/MIGRATION.md docs/architecture/DECISIONS.md .changeset/config.json`, `pnpm run lint` and `pnpm run test:scripts`. Expected: all pass (AC5). Then run `git diff origin/main --stat`: only the files in Tasks 1–3 appear (AC9, AC10).
- [ ] **Step 6: Commit**

```bash
git add .changeset/config.json AGENTS.md docs/architecture/MIGRATION.md docs/architecture/DECISIONS.md
git commit -m "docs(gitflow): adopt Gitflow branch model (ADR-068)"
```

### Task 4: Push, open the PR, collect AC6 evidence — HARD USER STOP

- [ ] **Step 1:** `git push origin feature/gitflow-setup:refs/heads/feature/gitflow-setup`.
- [ ] **Step 2:** `gh pr create --base main --head feature/gitflow-setup`. The body links the Spec, the research record and ADR-068, and ends with the required attribution lines.
- [ ] **Step 3:** Wait for the runs. Record the run IDs for `CI` and `Browser`. Check AC6 with `gh run view <id> --json jobs`:
  - `ci` is `success`;
  - `ci-extended` is `failure` with failed steps exactly `Bundle-size regression check` and `Provenance validation`;
  - its logs show the same `component-metadata` line and a `manifest problem(s)` count no higher than 645;
  - all six `Browser` jobs are `success`.

  Any other result: stop and report. Do not fix unrelated failures.

- [ ] **Step 4: HARD USER STOP.** Report the AC1–AC6 evidence and ask for merge authorization. Merge only when told to, as a merge commit.

### Task 5: After the merge — `develop` (separately authorized)

- [ ] **Step 1:** Record the merge SHA. Check AC7 on the `main` push run, with the same expectations as Task 4 Step 3.
- [ ] **Step 2:** With explicit authorization: `git push origin <merge-sha>:refs/heads/develop`. Verify with `git ls-remote origin refs/heads/develop`: it shows the merge SHA.

### Task 6: GitHub settings (each separately authorized)

- [ ] **Step 1, GF-7:** `gh api -X PATCH repos/majedsiefalnasr/ultimate-packages -f default_branch=develop`. Verify: `gh repo view --json defaultBranchRef` shows `develop`.
- [ ] **Step 2, GF-6 Stage A, `main` and `develop`:** `gh api -X PUT repos/majedsiefalnasr/ultimate-packages/branches/<b>/protection --input stage-a.json`, where `stage-a.json` is:

  ```json
  {
    "required_status_checks": null,
    "enforce_admins": true,
    "required_pull_request_reviews": { "required_approving_review_count": 0 },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }
  ```

  Verify with `GET …/branches/<b>/protection` that each field reads back. In particular, `enforce_admins.enabled` must be `true` (Spec §6 step 3).

### Task 7: Closeout through the first PR into `develop`

**Files:**

- Create: `docs/architecture/research/<date>-gitflow-setup-closeout.md`, dated on the day it is written

- [ ] **Step 1:** In a new `--no-track` worktree from `origin/develop`, on `docs/gitflow-setup-closeout`, write the closeout record. It covers:
  - the AC1–AC7 evidence and the run IDs;
  - the external settings as read back;
  - what remains externally unexercisable.
- [ ] **Step 2:** Push with an explicit refspec and open a PR with `--base develop`. Check AC8:
  - `CI` and `Browser` both trigger;
  - the diff steps log `origin/develop`;
  - `ci` succeeds.
- [ ] **Step 3:** Report AC8, and ask separately for:
  - authorization to merge the closeout PR;
  - GF-6 Stage B: require `ci` on `develop`. Re-`PUT` the Stage A body for `develop` only, with `"required_status_checks": { "strict": false, "contexts": ["ci"] }`. Verify with `GET …/branches/develop/protection/required_status_checks`: `contexts` is `["ci"]` and `strict` is `false`.

  `main` stays at Stage A (Spec §6).

## Plan Review record (2026-10-19)

The review checked revision 1 against Spec revision 2 and the local environment. It was run in this session, not by an independent reviewer.

| ID   | Finding                                                                                                                                                             | Resolution                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| PR-1 | Task 6 set `enforce_admins=false`, contradicting Spec revision 2 (SR-2).                                                                                            | Task 6 Step 2 sets `true` and checks it.          |
| PR-2 | The shell default is Node 23.11.0. With it, `pnpm install` and the scripts fail the root `engines` `^24.15.0` **[V]**. Node 24.15.0 is installed under nvm **[V]**. | Global Constraints: `nvm use 24.15.0`.            |
| PR-3 | Saving the old `ci.yml` to a scratchpad file needs a shell redirect to a session-specific path, which this environment's command guard blocks for dynamic paths.    | Read through `git show` and process substitution. |
| PR-4 | Stage B gave no request body. Without one, the change could drop the Stage A fields.                                                                                | Task 7 Step 3 re-`PUT`s the full Stage A body.    |
| PR-5 | Task 3 Step 4 still told the implementer to look up the decision dates, and Task 7 fixed the closeout file's date in advance.                                       | Both dates set explicitly.                        |

Checked and found correct: every Spec requirement maps to a task (R1–R6 → Task 2; R7–R10 → Task 3; R11 → Tasks 1, 4, 5; Spec §6 → Tasks 5–7); every acceptance criterion has a check (AC1–AC4 Task 2; AC5, AC9, AC10 Task 3; AC6 Task 4; AC7 Task 5; AC8 Task 7); the old `ci` job's 37 step names are unique (Task 2 AC2).
