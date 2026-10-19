# Gitflow setup — research and decision record (2026-10-19)

**Status:** Research and verification record for Phase 1 (Gitflow Setup), revision 2. Its decisions are settled. The record itself changes no workflow, configuration, branch or GitHub setting.

- **Revision 1** proposed GF-1 to GF-11. The user approved them on 2026-10-19, subject to the CI-simplification scope added in revision 2 **[U]**.
- **Revision 2** adds that scope: §5 researches the CI simplification and proposes CI-1 to CI-5, and §6 reassesses GF-6. The user approved CI-1 to CI-5 and the revised GF-6 on 2026-10-19, as recommended **[U]**.
- Implemented by `docs/superpowers/specs/2026-10-19-gitflow-setup-design.md` and `docs/superpowers/plans/2026-10-19-gitflow-setup.md`; ADR-068 records the decisions.

**Evidence baseline:** `main` = `origin/main` = `61f9097967437660b3d306881bf37e2ffa23f12b`, clean primary checkout. Facts marked **[V]** were checked on 2026-10-19 against this tree, the GitHub API or the cited documentation. **[U]** marks a user statement.

## 1. Question

The user decided to adopt Gitflow: `main` for releases and `develop` for ongoing integration, keeping the existing Superpowers approval workflow **[U]**. The first Prime study branch will be created from `develop` after the setup is approved **[U]**.

This record answers one question: what is the smallest change that makes `develop` a working integration branch without weakening an existing gate?

Revision 2 adds a second question **[U]**: what is the smallest reliable CI, focused on fast code-quality checks, that can serve as a required merge check for both branches?

Out of scope: the Prime study (Phase 2) and every later phase; resuming deferred work S1–S7 (`COMPLETION_REGISTER.md`); repairing red CI steps or the Release workflow. The CI simplification moves checks between jobs and workflows. It fixes no failing check.

## 2. Verified current state

### 2.1 Repository and GitHub

| Fact                                                                                    | Evidence                                                                                       |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| No `develop` branch on `origin`; no tags                                                | `git ls-remote origin refs/heads/develop` empty; `git tag` empty **[V]**                       |
| GitHub default branch is `main`; the repository is public                               | `gh repo view` **[V]**                                                                         |
| `main` has no branch protection and the repository has 0 rulesets                       | `GET …/branches/main/protection` → 404 "Branch not protected"; `GET …/rulesets` → `[]` **[V]** |
| Merge, squash and rebase merges are all allowed; head branches are not deleted on merge | `gh repo view` **[V]**                                                                         |
| Recent PRs land as merge commits                                                        | `git log --merges` (#29–#42) **[V]**                                                           |
| CI and Release are both **failure** at `61f90979`                                       | `gh run list --branch main` **[V]**                                                            |
| Open PRs #15, #37 and #38 target `main` (deferred S3 and S2)                            | `gh pr list` **[V]**                                                                           |
| Global git `push.default=upstream`                                                      | `git config --get push.default` **[V]**                                                        |

### 2.2 Files that assume `main` is the integration branch

| Location                                                                            | Current behavior                                                                                                                                                                  | Effect if PRs target `develop`                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml:3-7`                                                      | `push` and `pull_request` trigger only for `main`. All three jobs (`ci`, `track-a-browser-visual-a11y`, `track-e-ssr-hydration`) share this trigger.                              | **No CI runs** on PRs into `develop` or pushes to `develop`.                                                                                                                                                                                                              |
| `ci.yml:22`                                                                         | Fetches only `refs/heads/main` as the base ref.                                                                                                                                   | No `origin/develop` exists in the job to diff against.                                                                                                                                                                                                                    |
| `ci.yml:87`, `ci.yml:163`                                                           | `affected:packages` and `provenance:validate` get `--base-ref origin/main`.                                                                                                       | Affected packages and the ADR-061 provenance diff check would cover all unreleased `develop` work, not the PR's own diff.                                                                                                                                                 |
| `package.json:39`, `package.json:41`; called at `ci.yml:143`, `ci.yml:151`          | `size:validate` and `coverage:validate` hardcode `--base-ref origin/main`.                                                                                                        | Same over-wide diff for the size, coverage and ADR-066 row checks. CI cannot override it: `validate-bundle-size.mjs:157` and `validate-coverage.mjs:247` read the **first** `--base-ref`, so an appended one is ignored **[V]**.                                          |
| `scripts/provenance/{affected-packages,validate-bundle-size,validate-coverage}.mjs` | Default to `origin/main` when no `--base-ref` is given.                                                                                                                           | Local-only default; harmless once CI passes the base explicitly.                                                                                                                                                                                                          |
| `.changeset/config.json:8`                                                          | `baseBranch: "main"`.                                                                                                                                                             | `changeset add` and `changeset status` detect changed packages since `main`, not the integration branch. `baseBranch` controls exactly this detection ([Changesets config docs](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md)) **[V]**. |
| `.github/workflows/release.yml:3-5`                                                 | Runs on push to `main`. The Version Packages PR's base defaults to `github.ref_name` (`pr-base-branch` input, [changesets/action](https://github.com/changesets/action)) **[V]**. | Still correct for `main` as the release branch. The version commit lands only on `main`, so `develop` misses it without a back-merge.                                                                                                                                     |
| `docs/architecture/MIGRATION.md` §7.1, §7.2, §7.4                                   | Describes feature PRs merging to `main`, and a required `ci` status check on `main`.                                                                                              | Describes the old flow.                                                                                                                                                                                                                                                   |
| `AGENTS.md` §7.1, §7.3                                                              | Guards direct work on `main`; says no branch-naming convention is established.                                                                                                    | No rule for `develop`, PR base, back-merges, or release and hotfix branches.                                                                                                                                                                                              |

Not affected: `perf-stage1.yml` (manual trigger only), `docs/agents/AI_DELEGATION_POLICY.md` (no branch references), and the Superpowers skills. `finishing-a-development-branch` takes the base from the fork point and says not to assume `main` **[V]**.

### 2.3 Existing decisions and approved documents touched

- **Phase 0 Specification** (`docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md` §225–229): default branch `main`; "`main` protected, PR required". Gitflow keeps `main` as the protected release branch and adds `develop`. The missing protection on `main` is a pre-existing deviation, not caused by Gitflow.
- **MIGRATION.md §7.4** (Phase 10 Track C): the release flow's fail-closed guarantee depends on a required `ci` status check on `main`. That check is not configured today (§2.1).
- **ADR-061** and **ADR-066**: both rely on "the PR's diff". Neither names `origin/main`, so measuring against the PR's own base keeps their meaning. No ADR amendment is needed.
- **Approved Specs and Plans** that cite `origin/main` (Phase 0, Phase 10, several GAP Plans) are history. Under the 2026-10-19 documentation-hygiene ruling they are not rewritten.
- **Deferred S5** holds an uncommitted 16-line `AGENTS.md` edit in `ultimate-bounded-autonomous-execution`. An `AGENTS.md` change here will need a manual merge with it if S5 resumes. Nothing in S5 is changed by this record.

## 3. Findings that need a decision

1. **F-1 — CI blind spot.** Without trigger and base-ref changes, `develop` would integrate unchecked work (§2.2). This is required for any Gitflow adoption.
2. **F-2 — Release back-merge.** The Version Packages commit is created on `main`. Without a `main` → `develop` merge after each release and hotfix, version numbers and changelogs on `develop` drift.
3. **F-3 — Protection versus red CI.** The CI closeout rule (`COMPLETION_REGISTER.md`) keeps CI red until C01 is complete, and PRs #29–#42 merged with inherited failures. A required `ci` status check on `main` or `develop` would block **every** merge today. Protection without a required check is still possible: PR required, no force-push, no deletion.
4. **F-4 — Direct-push risk.** With `push.default=upstream`, a branch created with tracking from `origin/develop` pushes straight to `develop`. `develop` would be unprotected unless F-3's protection is applied.
5. **F-5 — How the setup itself lands.** `develop` does not exist, so the setup PR must target `main`. `develop` is then created from that merge commit.

## 4. Options and recommendations

Each item is a separate decision. Recommendations are the researcher's call, not decisions.

| ID    | Decision                                                         | Options                                                                                                                                                                                                                      | Recommendation                                                                                      |
| ----- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| GF-1  | Where the model is recorded                                      | (a) new ADR in `DECISIONS.md`, plus `AGENTS.md` operating rules; (b) `AGENTS.md` only                                                                                                                                        | **(a)**: it extends the Phase 0 Spec's Git requirements and changes MIGRATION §7's flow.            |
| GF-2  | How work reaches `main`                                          | (a) classic Gitflow: `release/*` from `develop` and `hotfix/*` from `main`, each merged into `main` and back into `develop`; (b) a direct `develop` → `main` PR per release                                                  | **(a)**, as requested ("Gitflow").                                                                  |
| GF-3  | Where Changesets versioning runs                                 | (a) unchanged: Version Packages PR on `main`, then a `main` → `develop` back-merge; (b) run `changeset version` on the `release/*` branch, which changes `release.yml`                                                       | **(a)**: no `release.yml` change and no overlap with deferred S3 (PR #15 edits `release.yml`).      |
| GF-4  | CI triggers and base                                             | Add `develop` to `push` and `pull_request`; fetch and diff against the PR's base branch (`github.base_ref`, or `github.ref_name` on push); drop the hardcoded base from the two `package.json` scripts and pass it from CI   | Required by F-1.                                                                                    |
| GF-5  | `.changeset/config.json` `baseBranch`                            | (a) `develop`; (b) keep `main`                                                                                                                                                                                               | **(a)**: changesets are written on branches from `develop`.                                         |
| GF-6  | Branch protection on `main` and `develop`                        | (a) PR required, no force-push, no deletion, **no required status check** until CI is green, recorded as a known gap against MIGRATION §7.4; (b) also require `ci` now, which blocks all merges until C01; (c) no protection | **(a)**. This is an external GitHub change, separately authorized.                                  |
| GF-7  | GitHub default branch                                            | (a) `develop`; (b) keep `main`                                                                                                                                                                                               | **(a)**: new PRs then target `develop` by default. External change, separately authorized.          |
| GF-8  | Merge method                                                     | (a) merge commits for feature, release, hotfix and back-merge PRs (current practice); (b) allow squash                                                                                                                       | **(a)**: keeps back-merges and history readable.                                                    |
| GF-9  | Branch naming                                                    | (a) keep the existing prefixes (`feature/`, `feat/`, `fix/`, `docs/`, `research/`, `tooling/`), branched from `develop`; reserve `release/*` and `hotfix/*`; (b) enforce one prefix set                                      | **(a)**: the smallest change.                                                                       |
| GF-10 | Deferred PRs #15, #37, #38 and branch `feat/w2-menus-navigation` | (a) leave unchanged; retarget to `develop` only when each is separately resumed; (b) retarget now                                                                                                                            | **(a)**: S1–S3 stay deferred.                                                                       |
| GF-11 | Landing sequence                                                 | One setup branch from `main` carrying this record, the ADR, the Spec, the Plan and the implementation; PR into `main`; then create `develop` from the merge commit; then the external settings (GF-6, GF-7)                  | Matches the existing rule that research, Spec, Plan and implementation land together on one branch. |

**Decision state (2026-10-19).** The user approved GF-1 to GF-11 as recommended, subject to the CI-simplification scope **[U]**. GF-6 is reassessed in §6 after that simplification; until then, revision 1's GF-6 (a) stands.

## 5. CI simplification (revision 2)

### 5.1 Measured current CI

Source: GitHub Actions job and step data for the 14 most recent CI runs, 2026-10-17 to 2026-10-19: 5 `push` runs on `main` and 9 `pull_request` runs, run IDs 39105886395 to 39246522293 **[V]**. Step times are from run 39246522293 at `61f90979` **[V]**.

| Job                                      | Runner                                        | Wall time | Result in 14 runs                                                                                           |
| ---------------------------------------- | --------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `ci`                                     | `ubuntu-latest`                               | 7–11 min  | **14 failures.** Failing steps only: Provenance validation (14/14) and Bundle-size regression check (10/14) |
| `track-a-browser-visual-a11y` (ng, vue)  | `ubuntu-24.04-arm`, Playwright 1.63 container | 22–26 min | 14/14 success per framework                                                                                 |
| `track-a-browser-visual-a11y` (react)    | same                                          | 5–6 min   | 14/14 success                                                                                               |
| `track-e-ssr-hydration` (ng, react, vue) | `ubuntu-latest`                               | 0–1 min   | 14/14 success per framework                                                                                 |

The `ci` job's steps, grouped:

| Group                         | Steps (seconds at `61f90979`)                                                                                                             | Result in 14 runs     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Setup                         | Checkout, Fetch base ref, pnpm, Node, Install (≈ 20)                                                                                      | green                 |
| Supply chain                  | Dependency vulnerability scan (1), License scan (1), Install-script policy (1)                                                            | green                 |
| Code quality                  | Lint (11), Format check (40), Typecheck (27)                                                                                              | green                 |
| Build and generated artifacts | Build (63), Validate generated artifacts (30), Metadata API drift (1), Metadata coverage report (1)                                       | green                 |
| Unit tests                    | Test (161)                                                                                                                                | green                 |
| Package integrity             | Determine affected packages (1), Pack/install integrity (0), Installed-package smoke CLI/MCP (22)                                         | green                 |
| Static security               | CodeQL init (13), CodeQL analyze (96), Resolve SARIF path (0), SAST baseline validation (1)                                               | green                 |
| Baseline regressions          | Bundle-size measurement (0), **Bundle-size regression check (1)**, Coverage measurement (161), Coverage regression check (0)              | bundle-size red 10/14 |
| Provenance                    | Fetch pinned vendor archives (6), Provenance scripts self-tests (18), **Provenance validation (2)**                                       | validation red 14/14  |
| Boundary validations          | Package boundary, Prime dependency ceiling, Compatibility manifest, CLI, MCP and AI package boundaries, AGENTS.md pointers (≈ 3 together) | green                 |

Known causes of the two red steps, both already registered and not repaired here:

- **Provenance validation:** the missing production manifest entries of GAP-094. ADR-062 says `provenance:validate` stays red until the last backfill batch merges, and ADR-052 X-12 classifies it as pre-existing debt.
- **Bundle-size regression check:** run 39246522293 logs `component-metadata: REGRESSION FAIL — 7.93 KB -> 10.0 KB (+26.5%, exceeds 15% threshold)` against the `PERFORMANCE.md` baseline row **[V]**. In this window it first fails on PR #36's head `3ee1937b` (run 39108725165), which changed `packages/component-metadata` **[V]**. COMPLETION_REGISTER records the failing step, but no GAP names this cause. Registering or repairing it is outside Phase 1.

### 5.2 Evidence that depends on the browser and SSR jobs

These records rely on the Playwright jobs running automatically:

- **ADR-052 X-12:** tranche CI evidence is read from the merge commit's run, including the strict Playwright projects, the accessibility baseline validation and every tranche's verification steps.
- **ADR-053 AC-1:** "the existing baseline gate stays green". **AC-4:** keyboard e2e tests "green in CI".
- **`AGENTS.md` §4:** "CI-enforced" means a script in `.github/workflows/ci.yml` fails the build on regression.

If the Playwright jobs stop running automatically, X-12 evidence can no longer be produced for future tranches, and AC-1 and AC-4 lose their CI signal. If they move to another workflow file but keep running, the evidence survives and only the `AGENTS.md` §4 definition needs to name that file.

### 5.3 Findings

1. **F-6 — The browser jobs are slow, not unreliable.** They were green in all 14 runs. Their cost is wall time: 22–26 min against `ci`'s 7–11 min.
2. **F-7 — `ci` is red only because of two known debts.** All other steps were green in all 14 runs. Moving those two steps out of the job leaves a set that has been reliable over this window.
3. **F-8 — Coverage measurement repeats the test run.** It takes 161 s, about as long as the Test step, and it only feeds the coverage regression check.
4. **F-9 — The check names are stable.** The `ci` job has no `name:` key, so its check name is its job ID, `ci`. It changes only if the job ID changes. Matrix check names such as `track-e-ssr-hydration (ng, playground-angular)` change whenever the matrix changes, so they are poor required-check candidates.

### 5.4 Options and recommendations

| ID   | Decision                                                      | Options                                                                                                                                                                                                                                                                                                                  | Recommendation                                                                                                                                                                                                                                                                            |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI-1 | Contents of the required `ci` job                             | (a) Setup, supply chain, code quality, build and generated artifacts, unit tests, package integrity, static security, vendor fetch and provenance self-tests, boundary validations: every group green in 14/14; (b) as (a) but without CodeQL and SAST (≈ 2 min faster); (c) code quality only (lint, format, typecheck) | **(a)**. Every included step is green and needed; CodeQL is the Phase 10 security gate. Estimated time is about 7–8 min, versus 7–11 today, because the coverage measurement leaves. Option (c) would drop build, tests and integrity checks that are fast enough and reliable.           |
| CI-2 | Where the known-red and slow baseline checks go               | (a) new non-required job `ci-extended` in `ci.yml`: Build, Bundle-size measurement and regression, Coverage measurement and regression, Provenance validation, unchanged (the validator does not read the vendor archives **[V]**); (b) remove them from CI                                                              | **(a)**. Nothing is deleted, the ADR-061 diff check and the X-12 log checks keep running, and the steps stay in `ci.yml`. The `CI` workflow's overall result stays red until GAP-094 and the `component-metadata` size regression are resolved. That is honest and does not block merges. |
| CI-3 | The browser and SSR Playwright jobs                           | (a) move `track-a-browser-visual-a11y` and `track-e-ssr-hydration` unchanged to a new `browser.yml` workflow (name `Browser`), with the same triggers as `ci.yml`, non-required; (b) as (a), but triggered only on push to `main`/`develop` and manually; (c) disable them                                               | **(a)**. It meets the "remove from the required CI workflow" request, keeps X-12, AC-1 and AC-4 evidence, and disables nothing. Option (b) delays failures until after a merge. Option (c) conflicts with ADR-052 X-12 and ADR-053 AC-1/AC-4 and would need its own decision.             |
| CI-4 | Triggers and base for every job in `ci.yml` and `browser.yml` | `push` and `pull_request` for `main` and `develop`. The base branch comes from `BASE: ${{ github.base_ref \|\| github.ref_name }}`, passed through an environment variable. The base fetch and every `--base-ref` use `origin/$BASE`.                                                                                    | Required (GF-4). On a push, the base equals the pushed branch, which matches today's push behavior against `origin/main`.                                                                                                                                                                 |
| CI-5 | `package.json` `size:validate` and `coverage:validate`        | Drop the hardcoded `--base-ref origin/main`; CI passes the base. Script defaults stay `origin/main` for local runs                                                                                                                                                                                                       | Required, because both checks stay in CI under CI-2 (a).                                                                                                                                                                                                                                  |

**What is disabled under these recommendations:** nothing. Two red steps and one slow step move to a non-required job, and the Playwright jobs move to a non-required workflow. If the user picks CI-2 (b) or CI-3 (b) or (c), §7 lists what would then stop running.

## 6. GF-6 reassessed after the simplification

**Criteria set by the user [U]:** require `ci` only if the simplified workflow is reliable and its check name is stable.

- **Check name:** stable (F-9).
- **Reliability:** every step of CI-1 (a) passed in all 14 recent runs (F-7). The restructured job has not run yet. Its reliability on PRs into `develop` is externally unexercisable until the setup PR, the post-merge push on `main` and a first PR into `develop` have run.

**Blocker on `main` (documented, not verified in this repository).** `release.yml` creates the Version Packages PR with the action's default `github-token`, `${{ github.token }}` ([changesets/action](https://github.com/changesets/action) inputs). GitHub does not start new workflow runs for events created with `GITHUB_TOKEN`, so `ci` would not run on that PR. If `ci` is required on `main`, the Version Packages PR could never merge without an admin bypass. MIGRATION §7.2 step 5 assumes `ci` runs on that PR. The Version PR has never been created here (S3), so this is documented platform behavior, not an observed failure. Fixing it means a token change in `release.yml`, which is deferred S3 scope.

**Recommended GF-6 (revised):**

| Branch    | Stage A, applied after `develop` exists                                  | Stage B                                                                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `develop` | PR required, 0 approvals (single maintainer), no force-push, no deletion | Require the `ci` check once the restructured `ci` has passed on the setup PR, the post-merge push to `main`, and the first PR into `develop`. "Require branches to be up to date" stays off. Separately authorized.                                |
| `main`    | Same as `develop`                                                        | Not required for now: the smallest safe alternative is Stage A only, recorded as a known gap against MIGRATION §7.4, until S3 is resumed and decides the release token. Release and hotfix PRs are opened by a person, so `ci` still runs on them. |

0 approvals keeps single-maintainer merges possible; the Phase 0 Spec asks for one review only once the team exceeds a single contributor.

## 7. Expected file changes if recommendations are approved

For the Specification, not authorized here:

- `AGENTS.md`:
  - §4: "CI-enforced" names both `ci.yml` and `browser.yml`.
  - §7.1 and §7.3: the branch roles; PR base `develop`; `develop` guarded like `main`; back-merge after each release or hotfix; `--no-track` worktrees and explicit-refspec pushes; reserved `release/*` and `hotfix/*`.
- `docs/architecture/DECISIONS.md`: ADR-068 (GF-1 to GF-11, CI-1 to CI-5, revised GF-6).
- `.github/workflows/ci.yml`: triggers and base (CI-4); the `ci` and `ci-extended` split (CI-1, CI-2); the two Playwright jobs removed from this file (CI-3).
- `.github/workflows/browser.yml`: new, holding the two Playwright jobs unchanged except for triggers (CI-3, CI-4).
- `package.json`: `size:validate` and `coverage:validate` (CI-5).
- `.changeset/config.json`: `baseBranch` (GF-5).
- `docs/architecture/MIGRATION.md` §7.1, §7.2 and §7.4: the Gitflow release path, the back-merge, the GITHUB_TOKEN limitation and the protection gap.

External, after the merge, each separately authorized: create and push `develop`; GF-7; GF-6 Stage A; later GF-6 Stage B for `develop`.

If CI-2 (b) is chosen instead, Bundle-size and Coverage regression checks and Provenance validation stop running in CI: ADR-061's PR diff check and X-12's log checks lose their CI source. If CI-3 (b) or (c) is chosen, see §5.2.

## 8. Limits

- That CI triggers and diffs correctly on a PR into `develop` can only be shown by a real GitHub run after `develop` exists. Until then it is **externally unexercisable**.
- The 14-run window shows recent reliability, not a guarantee. Earlier history includes a fixed intermittent Vue test timeout (GAP-089). The dependency vulnerability scan depends on the live advisory database and can turn red without a code change.
- The Changesets and `GITHUB_TOKEN` behavior is taken from the current `changesets/action` and GitHub documentation. The repository pins `select-mode@v2.1.2` and `version@v2.1.2`, whose Select mode step already fails on `main` (S3). The release path has never run end to end.
