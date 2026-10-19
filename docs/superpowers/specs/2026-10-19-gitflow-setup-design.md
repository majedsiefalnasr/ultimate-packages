# Gitflow Setup and CI Simplification — Design

**Date:** 2026-10-19
**Status:** APPROVED — Spec Review closed (user, 2026-10-19), revision 2. The implementing Plan (revision 2) passed Plan Review (user, 2026-10-19).

- The user approved CI-1 to CI-5 and the revised GF-6 on 2026-10-19, as recommended.
- Spec Review (2026-10-19, in-session, against repository evidence) found SR-1 to SR-6, all applied in revision 2 (§8).
- Committed after Plan Review approval (`AGENTS.md` §7.3). Implementation follows the approved Plan (`AGENTS.md` §7.5).

**Phase:** Phase 1 (Gitflow Setup) of the local completion-phase note. It does not start Phase 2.

**Research:** `docs/architecture/research/2026-10-19-gitflow-setup-research.md`, revision 2. Its evidence tables (§2, §5.1) are binding here and are not restated.

**Evidence baseline:** `main` = `origin/main` = `61f9097967437660b3d306881bf37e2ffa23f12b`.

## 1. Problem

- PRs into `develop` would get no CI, and diff-based checks would measure against `main` (research F-1).
- The only automatic CI check is red because of two known debts. The two Playwright jobs take 22–26 minutes. So no check can be required for merges today (research F-3, F-6, F-7).

## 2. Decisions this Spec implements

| ID            | State                                       | Summary                                                                                               |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GF-1 to GF-11 | **Approved** (user, 2026-10-19)             | Research §4. GF-6 is replaced by the revised GF-6 below.                                              |
| CI-1          | **Approved** (user, 2026-10-19), option (a) | Contents of the required `ci` job.                                                                    |
| CI-2          | **Approved** (user, 2026-10-19), option (a) | Non-required `ci-extended` job for the known-red and slow baseline checks.                            |
| CI-3          | **Approved** (user, 2026-10-19), option (a) | Playwright jobs move unchanged to a non-required `browser.yml`.                                       |
| CI-4          | **Approved** (user, 2026-10-19)             | Triggers for `main` and `develop`; base from the PR's target branch.                                  |
| CI-5          | **Approved** (user, 2026-10-19)             | No hardcoded base in `size:validate` and `coverage:validate`.                                         |
| GF-6 (rev.)   | **Approved** (user, 2026-10-19)             | Stage A protection on both branches; Stage B requires `ci` on `develop` only, after three green runs. |

## 3. Scope

**In scope:** the files in §4 and the external steps in §6.

**Non-goals:**

- Fixing Provenance validation (GAP-094), the `component-metadata` size regression, the Release workflow (S3), or any other failing check.
- Changing the content of any moved step or job: commands, matrices, containers, artifacts and comments stay as they are.
- Retargeting or resuming PRs #15, #37, #38 or any deferred work S1–S7 (GF-10).
- Editing approved historical Specs and Plans that cite `origin/main`.
- Changing any GAP status or COMPLETION_REGISTER row.
- Starting the Prime study (Phase 2).

**Anti-goals:** the change fails if it does any of these, even when CI is green:

- a check that ran automatically before stops running automatically;
- a required check can be blocked by a known red step;
- an existing protection becomes weaker.

## 4. Requirements

### R1 — `ci.yml` triggers (CI-4)

`on.push.branches` and `on.pull_request.branches` are both `[main, develop]`.

### R2 — Base branch (CI-4)

- Each job that diffs sets a job-level `env` `BASE: ${{ github.base_ref || github.ref_name }}`.
- "Fetch base ref" runs `git fetch --no-tags origin "+refs/heads/$BASE:refs/remotes/origin/$BASE"`.
- Every `--base-ref` in a workflow is `"origin/$BASE"`, read from the environment variable and never interpolated inline in `run:`.

### R3 — Required job `ci` (CI-1)

- The job ID stays `ci`, with no `name:` key, so its check name stays `ci`.
- It keeps these existing steps, in their current order and with their current commands, except for R2's base changes:
  - Checkout; Fetch base ref; Setup pnpm; Setup Node.js; Install dependencies;
  - Dependency vulnerability scan; License scan; Install-script policy check;
  - Lint; Format check; Build; Typecheck; Validate generated artifacts; Metadata API drift check; Metadata coverage report; Test;
  - Determine affected packages; Pack/install integrity (affected); Installed-package smoke (CLI/MCP);
  - CodeQL init; CodeQL analyze; Resolve SARIF path; SAST baseline validation;
  - Fetch pinned vendor archives; Provenance scripts self-tests;
  - Package boundary validation; Prime dependency-ceiling validation; Compatibility manifest validation; CLI, MCP and AI package boundary validation; AGENTS.md pointer validation.
- It no longer contains: Bundle-size measurement, Bundle-size regression check, Coverage measurement, Coverage regression check, Provenance validation.
- Its `permissions` stay `contents: read`, `security-events: write`.

### R4 — Non-required job `ci-extended` (CI-2)

- A new job `ci-extended` in `ci.yml`, `runs-on: ubuntu-latest`, `permissions: contents: read`.
- Its steps: Checkout (`fetch-depth: 0`); Fetch base ref (R2); Setup pnpm; Setup Node.js (`24.15.0`, `cache: "pnpm"`, as in `ci`); Install dependencies; Build.
- Then these steps, moved from `ci` with their current names, conditions and commands, except for R2:
  - Bundle-size measurement; Bundle-size regression check;
  - Coverage measurement; Coverage regression check;
  - Provenance validation.
- A comment above the job says that it is not a required check, and names the two known red steps and their causes (GAP-094; the `component-metadata` size regression).

### R5 — `browser.yml` (CI-3)

- A new workflow `.github/workflows/browser.yml` with `name: Browser` and R1's triggers.
- It holds `track-a-browser-visual-a11y` and `track-e-ssr-hydration`, moved from `ci.yml`. Job IDs, the comments above them, and every key and step are byte-identical, except a new comment at the top of the file explaining why they are separate and non-required.
- The two jobs are removed from `ci.yml`.

### R6 — `package.json` (CI-5)

- `size:validate` becomes `node scripts/provenance/validate-bundle-size.mjs`.
- `coverage:validate` becomes `node scripts/provenance/validate-coverage.mjs`.
- CI calls them as `pnpm run size:validate -- --base-ref "origin/$BASE"` and `pnpm run coverage:validate -- --base-ref "origin/$BASE"`.
- The scripts' local default (`origin/main`) is unchanged.

### R7 — `.changeset/config.json` (GF-5)

`baseBranch` becomes `"develop"`. Nothing else changes.

### R8 — `AGENTS.md`

- **§4** "CI-enforced" reads: "a script in `.github/workflows/ci.yml` or `.github/workflows/browser.yml` will fail the build if the condition regresses. Whether a check also blocks merges depends on branch protection (ADR-068)."
- **§7.1:**
  - Replace "Direct work on `main` requires explicit authorization." with: "`main` is the release branch and `develop` the integration branch (ADR-068). Direct work on either requires explicit authorization."
  - Replace the branch-naming bullet with: "New work branches from `develop` and opens its PR against `develop`. `release/*` (from `develop`) and `hotfix/*` (from `main`) are reserved: each merges into `main` and back into `develop`. After any merge into `main`, including the Version Packages PR, `main` is merged back into `develop`. Other prefixes stay an implementation-level choice."
  - Add: "Create work branches and worktrees with `--no-track`, and push with an explicit `src:dst` refspec. With `push.default=upstream`, a branch tracking `origin/develop` or `origin/main` pushes straight to it."
- **§7.3:** add "Feature PRs merge into `develop` with a merge commit; squash and rebase merges are not used (ADR-068)."
- §6's pointer table is unchanged, so `agents-md-pointers:validate` stays green.

### R9 — `MIGRATION.md` §7

- **§7.1:** step 2 says feature PRs merge into `develop`. A new step says a `release/*` or `hotfix/*` PR merges into `main`, and that push starts the existing flow. A final step says `main` is merged back into `develop` after the Version Packages PR merges.
- **§7.2:** row 2 says "Release or hotfix PR merges to `main`". Row 5's trigger cell drops "unmodified", because ADR-068 changes `ci.yml`'s triggers, and the row adds that GitHub starts no workflow run for a PR created with `GITHUB_TOKEN`, so `ci` does not run on the Version Packages PR while `release.yml` uses the default token.
- **§7.4:** add a dated paragraph: as of ADR-068, `main` has PR-required protection without a required `ci` check. The fail-closed guarantee described above is therefore **not in place**, until the release token is decided (deferred S3) and `ci` is required on `main`.
- Existing text is otherwise kept.

### R10 — ADR-068 in `DECISIONS.md`

Append this text after ADR-067, with its status set to the actual decision date:

> ## ADR-068 — Gitflow branching model and a required fast `ci` check
>
> Status: Accepted (user decisions GF-1 to GF-11 and CI-1 to CI-5, 2026-10-19). Evidence: `docs/architecture/research/2026-10-19-gitflow-setup-research.md`.
>
> **Context.** Every PR targeted `main`, which also triggers releases. The single CI job was red from two known debts, so no check could block merges, and `main` had no branch protection.
>
> **Decision.**
>
> - `main` is the release branch; `develop` is the integration branch. Work branches from `develop` and merges into it. `release/*` branches from `develop` and `hotfix/*` from `main`; both merge into `main` and back into `develop`. After every merge into `main`, `main` is merged back into `develop`.
> - Changesets versioning stays on `main` (`release.yml` unchanged); `baseBranch` is `develop`.
> - CI runs for pushes and PRs on both branches. Diff-based checks measure against the PR's target branch.
> - The `ci` job holds the fast checks that were reliably green. Known-red and slow baseline checks run in the non-required `ci-extended` job. The Playwright jobs run in the non-required `Browser` workflow. Nothing stops running.
> - Merge commits only.
> - Protection on both branches: PR required, 0 approvals, no force-push, no deletion, applied to administrators too. `ci` becomes a required check on `develop` after it passes on three named runs. It is not required on `main` while the Version Packages PR is created with `GITHUB_TOKEN`.
>
> **Consequences.**
>
> - This extends the Phase 0 Specification's branch requirements.
> - MIGRATION §7.4's fail-closed guarantee is not in place until `ci` is required on `main`.
> - The `ci` check is the merge signal. The `CI` workflow's overall result can be red because of `ci-extended`. A check outside `ci` can go red without blocking a merge; the CI closeout rule in `COMPLETION_REGISTER.md` still applies to it.
> - Earlier records that cite `.github/workflows/ci.yml` for the `track-a-browser-visual-a11y` or `track-e-ssr-hydration` jobs (for example in `BLUEPRINT_GAPS.md`) now refer to `.github/workflows/browser.yml`. Those records are not rewritten. ADR-052 X-12's "merge commit's run" means the merge commit's `CI` and `Browser` runs together.

### R11 — Landing order (GF-11)

1. One branch `feature/gitflow-setup`, from `origin/main`, created with `--no-track`.
2. It carries the research record, this Spec, the Plan, and the R1–R10 changes.
3. One PR into `main`.
4. After the user authorizes the merge: create `develop` from the merge commit, then the external steps in §6.

## 5. Acceptance criteria

| ID   | Criterion                                                                                                                                                                                           | Evidence                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| AC1  | `actionlint` reports no errors for `ci.yml` and `browser.yml`. It reports none for `ci.yml` at `61f90979` **[V]**.                                                                                  | Local                                                             |
| AC2  | The 37 named steps of the old `ci` job all appear in `ci` (32) or `ci-extended` (11), and the steps in both are exactly the six setup steps of R4. The old job has no duplicate step names **[V]**. | Local script comparison                                           |
| AC3  | The two jobs in `browser.yml` are byte-identical to the old `ci.yml` lines 193–480, apart from the file header.                                                                                     | Local diff                                                        |
| AC4  | No workflow contains `origin/main`, and no `run:` interpolates `github.base_ref` or `github.ref_name` inline.                                                                                       | `grep`                                                            |
| AC5  | `prettier --check`, `pnpm run lint`, `pnpm run test:scripts` and `pnpm run agents-md-pointers:validate` pass locally.                                                                               | Local                                                             |
| AC6  | On the setup PR: `ci` succeeds. `ci-extended` fails only in Bundle-size regression check and Provenance validation, with the same causes as run 39246522293. Every `Browser` job succeeds.          | Real GitHub run                                                   |
| AC7  | After the merge: the push run on `main` meets AC6.                                                                                                                                                  | Real GitHub run                                                   |
| AC8  | After `develop` exists: a first PR into `develop` triggers every job in both workflows, and its diff steps log `origin/develop`.                                                                    | Real GitHub run; externally unexercisable before `develop` exists |
| AC9  | `.changeset/config.json` and `package.json` differ from `main` only as R6 and R7 say.                                                                                                               | `git diff`                                                        |
| AC10 | `AGENTS.md`, `MIGRATION.md` and `DECISIONS.md` differ from `main` only as R8–R10 say.                                                                                                               | `git diff`                                                        |

## 6. External steps (each separately authorized)

1. Create `develop` from the setup merge commit and push it with an explicit refspec.
2. GF-7: set the default branch to `develop`.
3. GF-6 Stage A, on `main` and `develop`: PR required, 0 approvals, block force-pushes and deletion, and include administrators (`enforce_admins: true`). Without that last setting, the repository owner's own pushes bypass the PR requirement, and the `push.default=upstream` trap (research F-4) stays open.
4. GF-6 Stage B, on `develop` only: require the `ci` check once AC6, AC7 and AC8 have passed.

Each step is verified with `gh api` afterwards. Steps 2–4 are outward-facing GitHub settings.

## 7. Risks

- **Moved-step slip:** a step could be dropped or changed in the move. AC2 and AC3 guard this.
- **Required check never reports:** if a future change renames the `ci` job, a PR into `develop` waits forever. R3 fixes the job ID, and ADR-068 names it.
- **Live advisory feed:** the dependency vulnerability scan can turn `ci` red without a code change (research §8). It stays in `ci`, because a new advisory is a real signal.
- **Overall run still red:** the `CI` workflow's run result stays red because of `ci-extended`. Readers must look at the `ci` check, not the workflow result. ADR-068 and R4's comment say so.
- **Deferred S5:** its uncommitted `AGENTS.md` edit will need a manual merge if S5 resumes.
- **Admins included:** with `enforce_admins: true`, the owner cannot bypass a red required `ci` on `develop` after Stage B. That is intended. The Changesets publish job pushes tags only, so branch protection on `main` does not affect it **[V]** (`release.yml` publish step).

## 8. Spec Review record (2026-10-19)

The review checked every requirement against `61f90979`, the GitHub API and the workflow files. It was run in this session, not by an independent reviewer.

| ID   | Finding                                                                                                                                                                                                  | Resolution                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| SR-1 | §2 still listed CI-1 to CI-5 and GF-6 as pending, although the user approved them.                                                                                                                       | §2 and Status updated.                 |
| SR-2 | Stage A did not set `enforce_admins`. GitHub lets administrators bypass PR-required protection by default, so the owner's direct pushes, including the F-4 trap, would still reach `develop` and `main`. | §6 step 3, ADR-068 and §7.             |
| SR-3 | ADR-068 did not say that the `ci` check, not the `CI` workflow result, is the merge signal.                                                                                                              | ADR-068 Consequences.                  |
| SR-4 | Resolved `BLUEPRINT_GAPS.md` entries (file lines 125, 141, 656 and 2358) and ADR-052 X-12 point to the Playwright jobs in `ci.yml`. After the move these pointers are stale.                             | ADR-068 Consequences; no tier-5 edits. |
| SR-5 | R9 left MIGRATION §7.2 row 5 claiming `ci.yml`'s trigger is "unmodified".                                                                                                                                | R9.                                    |
| SR-6 | AC2's wording was ambiguous about the overlap between the two jobs.                                                                                                                                      | AC2 now gives counts 37, 32, 11 and 6. |

Checked and found correct: the `ci` job's permissions (R3); `ci-extended`'s Node setup matching `ci` (R4); no `needs:`, `secrets` or step outputs crossing between the moved jobs and `ci`, and no workflow-level `permissions` in `ci.yml`, so `browser.yml` inherits the same defaults (R5); AC3's line range 193–480 (R5); the Provenance validator does not read vendor archives (R4); `actionlint` passes on `ci.yml` at `61f90979` (AC1).
