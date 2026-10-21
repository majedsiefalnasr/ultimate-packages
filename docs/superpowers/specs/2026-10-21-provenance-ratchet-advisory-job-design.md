# Provenance Ratchet for the Advisory CI Job — Design

**Date:** 2026-10-21
**Status:** DRAFT (revision 4). Spec Review round 1 returned APPROVED WITH CHANGES (findings SR-1 to SR-5 applied, §8; revision 4 records two further user decisions, §7); awaiting the user's Spec Review decision. Not reviewed. Nothing in it is authorized for implementation until Spec Review passes, an Implementation Plan exists and passes Plan Review, and implementation is authorized.

- Brainstorming outcome of 2026-10-21, after the user chose Option 3 of the open questions in `docs/architecture/research/2026-10-21-co-11-ci-parallelization-and-advisory-failures.md` §5.
- ADR-072 (draft) records the decision. This work is separate from the CI/CD optimization (ADR-070) and the sharding work (ADR-071).

**Inputs, not guarantees:** the research note above (§3: the advisory job failed in 10 of 10 full runs on the same two steps); the GAP-094 Specification `2026-10-15-gap-094-production-provenance-scope-design.md` (§3.4, §4 items 4 and 6); `scripts/provenance/validate-provenance.mjs`; `scripts/provenance/validate-sast-baseline.mjs` as the precedent for a grandfathered list.

**Evidence baseline:** `develop` = `2f1d1b86`. `node scripts/provenance/validate-provenance.mjs --base-ref origin/develop` under **Node 24.15.0** (the version the repository expects; Node 23.11 gave the same count): 645 missing entries, split ng 164, react 216, vue 265.

## 1. Problem

The `CI` workflow is red on almost every run because the advisory job "Baselines (advisory): size, coverage, provenance" always fails. The Provenance validation step fails on 645 known missing manifest entries (GAP-094), so a new missing entry, which is a real regression, cannot be told apart from the old debt. The required `ci` check is unaffected (ADR-068). The cost is signal: a red workflow that means nothing hides the day a real regression appears.

## 2. Scope

**In scope:** the Provenance validation step only. Missing entries become a ratchet: the known 645 are listed, new ones fail.

**Non-goals:**

- Backfilling any manifest entry (GAP-094 batch PRs are unchanged).
- The Bundle-size regression check. It is one package over its baseline, fixed by a separate baseline-update PR measured on Node 24.15; it is not part of this Spec.
- Making the advisory job a required check, or changing any branch-protection setting.
- Changing the production-scope classifier (ADR-062) or the diff check in `validate-provenance.mjs`.

**Anti-goals:** the work fails if any of these happen, even when CI is green:

- A new production file without an entry passes.
- The list grows without a reviewed change to it.
- The strict behaviour (exit 1 on any missing entry) is lost for a local run without the flag.
- GAP-094 is reported resolved while the list is not empty.

## 3. Requirements

### R1 — Known-missing list

- A committed JSON file, `docs/architecture/provenance/known-missing.json`, holds the grandfathered list: an object keyed by manifest name (`ng`, `react`, `vue`), each value a sorted array of production file paths. The path sits beside the manifests, so the classifier already treats it as a provenance path (`NON_BROWSER_PATHS`) and it triggers no extra browser job.
- The list is generated from the validator's own output at the evidence baseline. It is never edited by hand to make a failure pass.

### R2 — Ratchet mode in the validator

- With a flag (name settled in the Plan), `validate-provenance.mjs` compares each missing file with the list:
  - missing and listed: allowed, reported as known debt;
  - missing and not listed: failure (new debt);
  - listed but no longer missing (an entry now exists, or the file is gone): failure, with the instruction to remove it from the list, so the list only shrinks.
- Without the flag the validator behaves exactly as today (strict, exit 1 on any missing entry).
- The ratchet also reports the remaining count, so the log shows progress.
- The flag's value is validated: the file must exist, be valid JSON of the shape in R1, and have sorted, duplicate-free arrays (an unsorted or duplicated list fails, so a batch PR shows up as deleted lines only). A malformed list is a failure, never an empty list (fail closed).
- A package that fails for any other reason (classifier error, missing or invalid manifest) still fails with the ratchet on. Only "has no entry" lines are matched against the list.

### R3 — CI

- The Provenance validation step in the advisory job passes the flag. The step name stays, because closeouts cite step names.
- The classifier's own tests enumerate files by path (`NON_BROWSER_PATHS` snapshot and the `scripts/provenance/` entries). The implementation PR updates those tests for `known-missing.json` and for any new script or test file, and shows the classifier output for the PR's own diff.
- No other step, job, trigger or required check changes.

### R4 — Backfill batches

- The list only shrinks. A PR that adds a line to it is rejected in review: the diff shows the added line, and no CODEOWNERS rule is added (branch protection requires no approvals, ADR-068, so such a rule would enforce nothing). An automatic check against the base branch's copy of the list is an option for the Plan, not a requirement of this Spec.
- A batch PR removes exactly its files from the list, and the validator's missing count drops by exactly the batch (GAP-094 Specification §4 item 6 is unchanged, and now also checked by the ratchet).

### R5 — Records

- GAP-094 stays OPEN. Its "resolved" condition changes from "`provenance:validate` exits 0 in CI" to "the list is empty and the validator exits 0 without the flag".
- The GAP-094 Specification gets a short amendment note pointing here (§4 item 4's "stays red" is superseded for CI reporting only).

## 4. Acceptance criteria

| ID  | Criterion                                                                                              | Evidence                  |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------- |
| AC1 | With the flag, the validator exits 0 at the evidence baseline and prints the remaining count (645)     | Local run and CI run      |
| AC2 | With the flag, a new production file without an entry exits 1                                          | Unit test                 |
| AC3 | With the flag, a listed file that gains an entry exits 1 and names the file                            | Unit test                 |
| AC4 | Without the flag, the validator exits 1 on the 645 missing entries exactly as before                   | Unit test and local run   |
| AC5 | After the change the advisory job's Provenance step is green and Bundle-size remains the only red step | Real GitHub run           |
| AC6 | The list was generated from the validator output, and its count equals the count in AC1                | Generation script or diff |
| AC7 | Existing provenance self-tests pass unchanged                                                          | `ci` job self-test step   |

## 5. Risks

| ID  | Risk                                                                           | Mitigation                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | A classifier change (ADR-062) makes the list stale.                            | The ratchet fails on both sides: new missing files and listed files that are not missing. The PR that changes the classifier updates the list in the same PR. |
| K2  | A renamed or moved file shows as one new missing file and one stale list line. | Both fail loudly. The PR author renames the line in the list and gives the evidence. No special-casing.                                                       |
| K3  | The list is edited to hide a regression.                                       | Changes to the list are a normal reviewed diff. The Plan decides whether a CODEOWNERS or review note is needed.                                               |
| K4  | The list gives the impression that the debt is accepted.                       | GAP-094 stays OPEN and its resolved condition is explicit (R5).                                                                                               |
| K5  | Count differs between Node 23 and Node 24.                                     | Generate the list under Node 24.15 and compare with the CI count before landing.                                                                              |

## 6. Landing

1. Spec Review, then Plan, then Plan Review, each separately authorized.
2. One implementation PR from `develop` to `develop`: the list, the validator flag and its tests, the `ci.yml` flag, and the record updates (R5).
3. The Bundle-size baseline update is a separate PR and is not a dependency.

## 7. Decisions taken at brainstorming (user, 2026-10-21)

1. **List:** JSON beside the manifests (`docs/architecture/provenance/known-missing.json`), not a Markdown table (R1).
2. **Flag:** `--known-missing <path>`. The ratchet cannot run without an explicit list (R2).
3. **Order:** the Bundle-size baseline PR and this work are independent PRs. The Bundle-size PR goes first, so that when this one lands the whole advisory job can turn green.

4. **Sorted list:** the validator rejects an unsorted or duplicated list (R2).
5. **No CODEOWNERS:** the repository has none, and branch protection requires no approvals. Edits to the list are guarded by review of the diff and the shrink-only rule (R4, K3).

**Still open for the Plan:** whether to add an automatic comparison of the list with the base branch's copy.

## 8. Spec Review record

**Round 1 (in-session, 2026-10-21),** against ADR-072 (draft), `AGENTS.md`, `scripts/provenance/validate-provenance.mjs`, `classify-changes.mjs` and its tests, and the other readers of `docs/architecture/provenance/`:

- **SR-1 (applied, §3 R2):** the validator reads `docs/architecture/provenance/<name>.json` by explicit name only, and no other script lists that directory (checked with grep), so a `known-missing.json` file beside the manifests breaks no reader. No change to behaviour, recorded as evidence.
- **SR-2 (applied, §3 R2):** the ratchet must match only "has no entry" lines. Classifier errors, missing manifests and invalid manifests are different failures and must stay failures with the flag on, or the ratchet would hide them.
- **SR-3 (applied, §3 R2):** a missing, unreadable or malformed list must fail, not be treated as empty.
- **SR-4 (applied, §3 R3):** `classify-changes.test.mjs` has a snapshot test that lists every tracked file `isNonBrowserPath` matches, and a list of `scripts/provenance/` files. Adding `known-missing.json` and any new script or test changes those snapshots. The implementation PR must update them. Checked: a diff of only `known-missing.json` classifies as `scope=full`, `frameworks=[]`, so no Browser job runs, as intended.
- **SR-5 (applied, §7):** the evidence count was re-run under Node 24.15.0 (the version the repository expects) and equals the Node 23.11 count, so risk K5 is reduced to a re-check at implementation time.

**Not found:** a conflict with ADR-062, ADR-064, ADR-068, ADR-069 or ADR-070. The ratchet is limited to the advisory job, so ADR-069's rules on the required job are untouched.
