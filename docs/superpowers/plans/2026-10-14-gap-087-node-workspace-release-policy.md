# GAP-087 Node.js Workspace and Release Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans when implementation is separately authorized. Steps use checkbox (`- [ ]`) syntax for tracking. This plan is for Plan Review; it authorizes no implementation, commit, push, PR, merge, or publish.

**Status:** PROPOSED — awaiting Plan Review.  
**Goal:** Make the private workspace Node declaration and every Release job match ADR-059's Node 24 policy, then verify the frozen install and report the actual release-path result.  
**Architecture:** Change the root engine range and three existing Release Node pins without changing release control flow. Clarify the existing README Development guidance. Prove file-level consistency locally and installation on a clean Node 24.15.0 runner; verify Select mode after the implementation reaches `main` through separately authorized gates.  
**Tech Stack:** Node.js 24.15.0 execution baseline; Node range `^24.15.0`; pnpm 9.6.0; GitHub Actions YAML; Markdown.

## Global constraints

- The [GAP-087 Specification](../specs/2026-10-14-gap-087-node-workspace-release-policy-design.md) §§2–3 (Spec Review approved by the user on 2026-10-14) and [ADR-059](../../architecture/DECISIONS.md#adr-059--node-24150-baseline-for-the-private-workspace-and-release-toolchain-gap-087) govern every step. ADR-059's policy is settled.
- Baseline: `main`/`origin/main` `9ea303df0b27ab69487449bf32577e223cd8bbb0`. Recheck live state and the approved Spec before implementation; the working tree already contains an unstaged ADR and untracked research/Spec plus unrelated files. Preserve all of them.
- Root `engines.node` must be exactly `^24.15.0`; retain `private: true`, `packageManager: "pnpm@9.6.0"`, and `.npmrc` `engine-strict=true`.
- All three Release jobs must pin exactly `node-version: "24.15.0"` and retain `pnpm install --frozen-lockfile`. CI already pins 24.15.0; do not change `.github/workflows/ci.yml` or its gates.
- Do not change dependencies, `pnpm-lock.yaml`, tests, package consumer engines, release triggers, mode selection, permissions, Changesets actions, authentication, scripts, publish access, GAP-087/C01 status, or exception records. If a lockfile change proves unavoidable, stop and return to review with evidence.
- This plan is one small implementation task. Do not add a test that merely copies the three literal version strings; the existing strict frozen install and live workflow are the meaningful checks. Do not use Node 23 from the current local shell to claim Node 24 compatibility.
- `AGENTS.md` §3 and §7 govern later authorizations. Plan Review approval alone does not authorize implementation or publication. No commit, push, PR, or merge is part of this plan-authoring gate.

## File structure

| File                            | Action at a later authorized implementation gate   | Responsibility                                                            |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| `package.json`                  | Modify `engines.node` only                         | Declare the private workspace Node 24 range.                              |
| `.github/workflows/release.yml` | Modify three `node-version` values only            | Pin Select mode, Version and Publish to the tested baseline.              |
| `README.md`                     | Modify the Development prerequisite paragraph only | Explain the supported range and recommended exact version for local work. |

## Task 1: Align the workspace and Release Node declarations

**Files:** Modify `package.json:6-8`, `.github/workflows/release.yml:27,55,83`, and `README.md:59-61`. No new permanent file or test.

**Inputs:** ADR-059's `^24.15.0` private-workspace range and `24.15.0` execution baseline. The existing three Release jobs each set up Node and then run the frozen install.

**Output:** A root declaration, local guidance, and Release workflow that use one policy; all other release behavior stays byte-for-byte unchanged.

- [ ] **Step 1 — Recheck the baseline and scope.** Run `git status --short --branch`, `git diff -- package.json .github/workflows/release.yml README.md`, and `git diff --cached --name-status`. Read the approved Spec, ADR-059, root engine, README Development paragraph, and each Release job's setup/install sequence. Confirm these three implementation surfaces are unchanged from the plan's baseline. If any changed, reconcile the evidence before editing; never overwrite another person's work.

- [ ] **Step 2 — Confirm the original contradiction without altering the repo.** Run `node -p "require('./package.json').engines.node"` and `rg -n 'node-version: "20"|node-version: "24.15.0"' .github/workflows/release.yml .github/workflows/ci.yml`. Expected at this baseline: root `>=20.0.0`; three Release matches for `"20"`; three CI setup matches for `"24.15.0"`. If these differ, stop and re-evaluate against the approved Spec instead of blindly applying the following edits.

- [ ] **Step 3 — Make the three focused edits.** In `package.json`, change only the root engine value:

  ```json
  "engines": {
    "node": "^24.15.0"
  },
  ```

  In `.github/workflows/release.yml`, change the `node-version` value in **Select mode**, **Version**, and **Publish** from `"20"` to `"24.15.0"`. Keep each surrounding setup action, pnpm cache and frozen install unchanged:

  ```yaml
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: "24.15.0"
      cache: "pnpm"
  ```

  Replace only the first Development paragraph in `README.md` with:

  ```markdown
  A pnpm workspace monorepo. The private workspace supports Node.js `^24.15.0`; use Node.js 24.15.0 as the pinned local and CI baseline. pnpm 9.6.0 is pinned through `packageManager`. `pnpm install` enforces dependency engine ranges. Individual dependencies may admit other Node majors, but those ranges do not extend this workspace's support policy.
  ```

- [ ] **Step 4 — Validate the exact edit surface.** Run `git diff --check`, `actionlint .github/workflows/release.yml`, and `./node_modules/.bin/prettier --check package.json .github/workflows/release.yml README.md` using the existing checkout tools. Expected: all exit 0. This formatting check may run under the current local Node 23; it is not installation compatibility evidence. Run `git diff -- package.json .github/workflows/release.yml README.md` and `git status --short --branch`; the task diff must show only the root engine, three Release version literals and the README paragraph. The pre-existing ADR and untracked files must remain intact; `.github/workflows/ci.yml`, `.npmrc`, package manifests, tests and `pnpm-lock.yaml` must have no task diff. If `actionlint` or the formatter is unavailable, report that check as unrun rather than passing; the clean Node 24 runner can perform formatting after Step 7's install.

- [ ] **Step 5 — Verify the declared values.** Run `node -p "require('./package.json').engines.node"`, `rg -n 'node-version: "24.15.0"' .github/workflows/release.yml`, and `rg -n 'node-version: "20"' .github/workflows/release.yml`. Expected: `^24.15.0`; exactly three Release matches for `"24.15.0"`; zero for `"20"` (the last `rg` exits 1 because it finds nothing). Confirm by reading the three jobs that each setup still precedes `pnpm install --frozen-lockfile`. These static checks prove configuration, not a successful install.

- [ ] **Step 6 — Obtain separate authorization for the implementation commit.** Plan Review approval does not authorize implementation or a commit. After separate implementation authorization and Steps 1–5, obtain explicit commit authorization before staging. Review `git status` and the focused diff, then stage only authorized files and create a Conventional Commit; do not stage the pre-existing ADR, research, Spec or unrelated work by default. If commit authorization is not granted, stop here: Step 7's clean checkout of the implementation commit is not yet available. A commit grants no authorization to push, open a PR or merge; each remote action requires its own applicable authorization.

- [ ] **Step 7 — Verify a strict frozen install on Node 24.15.0.** Use a clean checkout of the reviewed implementation commit from Step 6 on a runner with Node `v24.15.0` and pnpm `9.6.0`. Run `node --version`, `pnpm --version`, and `pnpm install --frozen-lockfile`; capture the commands, versions, exit codes and relevant output. A fresh PR CI job's Install dependencies step may provide this evidence only after push/PR authorization is separately granted; confirm its tested SHA contains the reviewed diff and record both tested and branch-head SHAs when they differ. The current local shell is Node 23.11.0 and cannot supply this proof. Do not disable `engine-strict`, use `--force`, or claim success from a static version check. Stop if the pinned install fails.

## Remote verification and Final Review evidence

- [ ] **Step 8 — Inspect the actual Release run on the implementation-bearing `main` commit.** Only after separate authorization for the required push, PR and merge, record the `main` commit SHA and Release run URL. A Release run is triggered by a push to `main`, so it cannot be used as pre-merge proof on this branch. Record Select mode's actual Node version and frozen-install conclusion, whether `changesets/action/select-mode` ran and its selected mode, and the Version/Publish job statuses. The Select mode Install dependencies step must pass without `ERR_PNPM_UNSUPPORTED_ENGINE`. **Whenever Version or Publish executes, its actual Install dependencies step must also pass; record that step's result for each executed job.** If either job is skipped, record it as dynamically unverified; the static configuration review from Steps 3–5 does not satisfy dynamic verification for a skipped job. If another step fails, report it separately. Do not manufacture a version or publish event to satisfy this check.
- [ ] **Step 9 — Inspect CI on that same `main` commit and present the Final Review packet.** Record CI run URL, tested SHA, root frozen-install result, any Node-related regression, and the overall CI and individual gate conclusions. Report the focused diff, formatter/actionlint results, clean-install evidence and limits, Release results and skipped paths, plus unrelated failures. A passing install does not establish a green CI, a successful publication, C01 completion, or a CI exception. Keep GAP-087 OPEN until the authorized verification/closeout gate accepts its evidence; do not update tracking in this task.

## Requirement-to-evidence map

| Approved Spec                                            | Plan steps | Proof                                                                                                |
| -------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| §2.1 private root engine and retained pnpm/strict policy | 1–5        | Focused `package.json` diff, value check, unchanged `.npmrc` and package manager.                    |
| §2.2 all three Release jobs and unchanged control flow   | 1–5, 8     | Three pins, same frozen installs; executed jobs' installs pass, skipped jobs dynamically unverified. |
| §2.3 local guidance                                      | 3–4        | README Development paragraph uses ADR-059 range and baseline.                                        |
| §2.4 CI and dependency boundary                          | 4, 7, 9    | No CI/lock/dependency diff; clean pinned install and same-commit CI result.                          |
| §3.1–5 acceptance and honest evidence                    | 4–9        | Recorded SHAs, commands, run URLs, job/step conclusions, conditional-job limits.                     |

## Risks and stop conditions

- If the implementation baseline changes the Release job structure, root engine or README guidance, stop and reassess the exact diff against the approved Spec. Do not apply version substitutions mechanically to a different workflow.
- If strict installation fails under Node 24.15.0, record the package and engine error and return to review. Do not change dependencies, lockfile, `.npmrc`, CI exceptions or supported majors under this plan.
- A later failure in Release mode selection, versioning or publishing is separate from the Node engine mismatch. Preserve the failure and report it; do not expand GAP-087 to fix it without its own gate.
- Pre-existing CI coverage, provenance and browser failures do not become accepted exceptions. C01 remains incomplete.

**Next gate:** Plan Review. Implementation begins only after Plan Review approval and separate implementation authorization under `AGENTS.md` §3.
