# Gitflow setup — closeout record (2026-10-19)

**Status:** Closeout record for Phase 1 (Gitflow Setup), the Plan's Task 7. It records evidence only. It changes no workflow, setting or GAP status. AC8 is shown by this record's own PR into `develop`; its run IDs are added to §3 before the PR merges. GF-6 Stage B is not applied (§5).

**Records:** research `2026-10-19-gitflow-setup-research.md`; Spec `docs/superpowers/specs/2026-10-19-gitflow-setup-design.md` (revision 2, Amendments A1–A2); Plan `docs/superpowers/plans/2026-10-19-gitflow-setup.md` (revision 2); ADR-068.

## 1. What landed

- [PR #43](https://github.com/majedsiefalnasr/ultimate-packages/pull/43), head `841753ca`. Merged with the user's authorization as merge commit `03aeb1a6089499208392ca4a7b853842e5a64789`. Its parents are `61f90979` and `841753ca`, and its tree equals the PR head.
- Branch commits:
  - `0457b5d2`: research, Spec, Plan.
  - `35e96e49`: CI split.
  - `3c14bb8e`: ADR-068 and the docs.
  - `841753ca`: final-review fix, Spec Amendment A1.

## 2. Local verification (before push)

| Check                                                  | Result                                                                                                                                                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 `actionlint` on `ci.yml` and `browser.yml`         | No errors                                                                                                                                                                                                            |
| AC2 step accounting                                    | 37 old `ci` steps; 32 in `ci`, 11 in `ci-extended`; the overlap is exactly the six setup steps                                                                                                                       |
| AC3 moved jobs                                         | `browser.yml` jobs byte-identical to old `ci.yml` lines 193–480                                                                                                                                                      |
| AC4 base handling                                      | No `origin/main` in any workflow. No inline `github.base_ref`/`github.ref_name` in `run:`. `BASE` env once per diffing job                                                                                           |
| Moved step bodies                                      | 43 compared. Only Spec R2/R6 base-ref lines differ; every `if: ${{ !cancelled() }}` kept                                                                                                                             |
| AC5                                                    | `prettier --check .`, `pnpm run lint`, `agents-md-pointers:validate` pass; `test:scripts` 283/283 (after `vendor:fetch primereact primevue`, as CI does)                                                             |
| Pre-push hook (build, typecheck, test) on Node 24.15.0 | Pass                                                                                                                                                                                                                 |
| Final whole-branch review (fresh reviewer)             | 0 Critical, 1 Important, 4 Minor. The Important finding (MIGRATION §7.2 rows 2, 5, 6 and §7.1 step 6 claimed a required `ci` gate on `main`) was fixed in `841753ca`, with a check that failed first and then passed |

## 3. GitHub runs

| Event                                | Run                                                                                                  | Result                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC6: PR #43 into `main`              | CI [39263248203](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39263248203)      | `ci` success (7m54s). `ci-extended` failure only in Bundle-size regression check and Provenance validation. Diff steps used `origin/main`.                                                         |
| AC6                                  | Browser [39263248308](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39263248308) | All 6 jobs success                                                                                                                                                                                 |
| AC7: push to `main` `03aeb1a6`       | CI [39267533878](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39267533878)      | `ci` success (8m). `ci-extended` failure in the same two steps only                                                                                                                                |
| AC7                                  | Browser [39267533887](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39267533887) | All 6 jobs success                                                                                                                                                                                 |
| AC7                                  | Release [39267533920](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39267533920) | Select mode failure: "This version of the Changesets action is designed to work with Changesets CLI v3. Changesets CLI v2 is not supported". Pre-existing deferred S3; Version and Publish skipped |
| Push creating `develop`              | CI [39282143510](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39282143510)      | `ci` success (8m). `ci-extended` failure in the same two steps only. Provenance logs "diff check against origin/develop passed"                                                                    |
| Push creating `develop`              | Browser [39282143652](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39282143652) | All 6 jobs success                                                                                                                                                                                 |
| AC8: this record's PR into `develop` | Added before merge                                                                                   | —                                                                                                                                                                                                  |

The two `ci-extended` failures have the same causes in every run above:

- `component-metadata: REGRESSION FAIL — 7.93 KB -> 10.0 KB (+26.5%, exceeds 15% threshold)`;
- `645 manifest problem(s)` (GAP-094).

Neither is repaired here.

## 4. External steps, each authorized by the user on 2026-10-19

| Step                                    | Verified state                                                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create `develop`                        | `git push origin 03aeb1a6…:refs/heads/develop`. `git ls-remote` shows `develop` = `03aeb1a6`                                                                            |
| GF-7 default branch                     | `gh repo view` reads `defaultBranchRef` = `develop`                                                                                                                     |
| GF-6 Stage A on `main` and on `develop` | `GET …/protection` reads back on both: 0 required approvals; required status checks none; `enforce_admins` true; force pushes false; deletions false; restrictions none |

## 5. Not yet done or not provable here

- **GF-6 Stage B:** requiring `ci` on `develop` waits for AC8 and its own authorization. `main` stays at Stage A while the Version Packages PR is created with `GITHUB_TOKEN` (ADR-068; MIGRATION §7.4).
- **Externally unexercisable so far:**
  - a `release/*` or `hotfix/*` PR into `main`;
  - a `main` → `develop` back-merge PR;
  - a Version Packages PR.
    None has happened yet.
- **Deferred minors from the final review:**
  - MIGRATION §7.1's sentence "the only human action in this entire flow" is now loose;
  - the `ci-extended` comment says "required `ci` check" before `ci` is required anywhere;
  - `README.md:88` points to `ci.yml` for the full list of CI gates.
- **Unchanged:** Affected-Only CI stays a deferred future study. Phase 2 has not started. Deferred work S1–S7 is untouched.
