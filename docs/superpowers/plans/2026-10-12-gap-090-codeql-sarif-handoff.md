# GAP-090 CodeQL SARIF Handoff Implementation Plan

> **For agentic workers:** Use the repository's approved execution workflow for this one-task plan. Plan Review and separate implementation authorization are required before changing CI. The later PR/remote-CI step also requires the applicable git authorization under `AGENTS.md` §7.1.

**Status:** APPROVED — Plan Review passed; implementation and Final Review completed in PR #7 (merged at `6d777328f9236839f66dcc90b60b3eec1a783812`).

**Goal:** Make the existing CI SAST validator read the `javascript.sarif` file that the current CodeQL action writes inside its `sarif-output` directory, and fail explicitly if that file is absent.

**Architecture:** Keep the existing single `ci` job, CodeQL analysis, and validator. Change only the `Resolve SARIF path` step in `.github/workflows/ci.yml`: derive the expected file from the action's directory output, check it is a regular file, export its path through `GITHUB_ENV`, and print the resolved path for comparison with CodeQL's log. The following `SAST baseline validation` step remains the sole baseline decision point.

**Tech stack:** GitHub Actions YAML, Bash on `ubuntu-latest`, `github/codeql-action/analyze@v3`, pnpm 9.6.0, Node 24.15.0.

## Global constraints and evidence

- The [approved GAP-090 Specification](../specs/2026-10-12-gap-090-codeql-sarif-handoff-design.md) §§2–3 governs this plan. [Phase 10 Track B R3](../specs/2026-09-08-phase-10-ci-security-quality-gates-design.md#r3--sast-static-application-security-testing) and its [Task 9](2026-09-08-phase-10-ci-security-quality-gates-implementation.md) retain the existing finding-severity, baseline, and CI-enforcement contract. The historical Task 9 example used `javascript-typescript.sarif`; current workflow and recorded CI evidence supersede that leaf-name assumption, without reopening the contract.
- [Main CI run 38221832098](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38221832098) at `6d2836d0c0a5adc8e5978de4a91147b99388bd31` recorded CodeQL post-processing `results/javascript.sarif`, while the workflow requested `results/javascript-typescript.sarif`. A fixture pass or local path probe is not proof that real CI evaluated findings.
- The only implementation file is `.github/workflows/ci.yml`, specifically its `Resolve SARIF path` step. Do not change `SAST baseline validation`, `scripts/provenance/validate-sast-baseline.mjs`, its tests, `SAST_BASELINE.md`, scripts, action versions, query/upload configuration, other CI steps, tracking documents, or exception records.
- The validator's existing tests include a missing-**baseline**-file case, not a missing-SARIF-file fixture. Test the missing SARIF handoff separately below; do not misreport the existing fixture as covering it.
- A successful path handoff does not itself prove a passing SAST gate or overall CI. New findings or fingerprint mismatch remain failures to investigate separately. No baseline addition, severity change, or exception is authorized.

## Task 1: Repair and verify the single SARIF handoff

**Files:** Modify `.github/workflows/ci.yml` in the `Resolve SARIF path` step only. Create no permanent test or helper file.

**Inputs:** `steps.codeql-analyze.outputs.sarif-output` is an absolute directory path. The observed single JavaScript/TypeScript output file is `javascript.sarif` inside it.

**Output:** `SARIF_PATH` in `GITHUB_ENV`, set only after the expected file exists as a regular file; the next unchanged step consumes that path.

- [ ] **Step 1 — Confirm the implementation boundary.** Recheck `git status --short --branch`, the current workflow lines for `CodeQL init`, `CodeQL analyze`, `Resolve SARIF path`, and `SAST baseline validation`, and the approved Spec. Preserve existing dirty files. Stop if the workflow has changed so the one-step handoff is no longer sufficient.

- [ ] **Step 2 — Change only `Resolve SARIF path`.** Retain its name, `if`, and `env` expression. Replace its one-line `run` with the following block, leaving the following validator invocation unchanged:

  ```yaml
  - name: Resolve SARIF path
    if: ${{ !cancelled() }}
    env:
      SARIF_OUTPUT_DIR: ${{ steps.codeql-analyze.outputs.sarif-output }}
    run: |
      if [ -z "$SARIF_OUTPUT_DIR" ]; then
        echo "::error::CodeQL sarif-output directory is empty"
        exit 1
      fi
      SARIF_PATH="$SARIF_OUTPUT_DIR/javascript.sarif"
      if [ ! -f "$SARIF_PATH" ]; then
        echo "::error::CodeQL SARIF file not found at $SARIF_PATH"
        exit 1
      fi
      printf 'SARIF_PATH=%s\n' "$SARIF_PATH" >> "$GITHUB_ENV"
      echo "Resolved CodeQL SARIF: $SARIF_PATH"
  ```

  An empty directory output or missing/wrongly named file must fail this step before `GITHUB_ENV` is written. The `-f` check tests the expected regular file; file contents and findings remain the unchanged validator's responsibility.

- [ ] **Step 3 — Check YAML and formatting.** Run `actionlint .github/workflows/ci.yml` and `pnpm exec prettier --check .github/workflows/ci.yml`. Expected: both exit 0. If `actionlint` is unavailable in the execution environment, record that limitation and use the repository's available YAML/workflow validation; do not claim the `actionlint` check passed.

- [ ] **Step 4 — Exercise the handoff locally without a repository fixture.** Execute the following Bash probe in a disposable temp directory. Its `resolve_sarif` body must stay byte-for-byte equivalent to the workflow's shell body apart from the function wrapper; compare them in review. The positive case selects only `javascript.sarif`, and the empty-output, absent-file, and wrong-leaf cases must each exit non-zero with an explicit diagnostic. These probes do not run CodeQL and do not count as CI evidence.

  ```bash
  set -euo pipefail
  probe_dir=$(mktemp -d)
  trap 'rm -rf "$probe_dir"' EXIT
  mkdir -p "$probe_dir/results"
  printf '{"version":"2.1.0","runs":[]}\n' > "$probe_dir/results/javascript.sarif"
  resolve_sarif() (
    SARIF_OUTPUT_DIR=$1
    GITHUB_ENV=$2
    if [ -z "$SARIF_OUTPUT_DIR" ]; then
      echo "::error::CodeQL sarif-output directory is empty"
      exit 1
    fi
    SARIF_PATH="$SARIF_OUTPUT_DIR/javascript.sarif"
    if [ ! -f "$SARIF_PATH" ]; then
      echo "::error::CodeQL SARIF file not found at $SARIF_PATH"
      exit 1
    fi
    printf 'SARIF_PATH=%s\n' "$SARIF_PATH" >> "$GITHUB_ENV"
    echo "Resolved CodeQL SARIF: $SARIF_PATH"
  )
  resolve_sarif "$probe_dir/results" "$probe_dir/github-env"
  test "$(cat "$probe_dir/github-env")" = "SARIF_PATH=$probe_dir/results/javascript.sarif"
  if resolve_sarif '' "$probe_dir/empty-env" > "$probe_dir/empty.log" 2>&1; then exit 1; fi
  rg 'sarif-output directory is empty' "$probe_dir/empty.log"
  mv "$probe_dir/results/javascript.sarif" "$probe_dir/results/javascript-typescript.sarif"
  if resolve_sarif "$probe_dir/results" "$probe_dir/wrong-env" > "$probe_dir/wrong.log" 2>&1; then exit 1; fi
  rg 'SARIF file not found at .*javascript.sarif' "$probe_dir/wrong.log"
  rm "$probe_dir/results/javascript-typescript.sarif"
  if resolve_sarif "$probe_dir/results" "$probe_dir/missing-env" > "$probe_dir/missing.log" 2>&1; then exit 1; fi
  rg 'SARIF file not found at .*javascript.sarif' "$probe_dir/missing.log"
  test ! -e "$probe_dir/empty-env" && test ! -e "$probe_dir/wrong-env" && test ! -e "$probe_dir/missing-env"
  ```

- [ ] **Step 5 — Preserve the validator contract.** Run `node --test scripts/provenance/validate-sast-baseline.test.mjs`. Expected: exit 0, including the grandfathered-finding, new-finding, note-level, and missing-baseline cases. The missing-SARIF behavior is established by Step 4's handoff probe and the validator's source-level missing-path failure, not by claiming a nonexistent validator fixture.

- [ ] **Step 6 — Review the exact diff.** Run `git diff --check`, `git diff -- .github/workflows/ci.yml`, and `git status --short --branch`. Expected task diff: one workflow step only; no other task file modified. Distinguish all pre-existing dirty/untracked state. Do not stage or commit without the applicable authorization.

## Remote verification and Final Review evidence

- [ ] **Step 7 — Obtain separately authorized Git publication/CI execution.** Plan Review alone does not authorize implementation, commit, push, branch creation, or PR creation. After those gates are granted, run the normal PR CI on a clean GitHub-hosted runner. Record the implementation commit SHA, the workflow-tested/event SHA if different (for example, a PR merge ref), run URL, job and step conclusions. Confirm the tested SHA contains the reviewed one-step diff; do not label the event SHA as the branch head without checking.
- [ ] **Step 8 — Inspect the real CodeQL/SAST handoff.** From the same run, retain the `CodeQL analyze` conclusion and logged generated SARIF path, `Resolve SARIF path` conclusion and printed resolved path, and `SAST baseline validation` conclusion, exit result, and output. The generated and resolved paths must be identical. The validator must report its qualifying-result count or `NEW FINDING` diagnostics, rather than `SARIF file not found`. If it reports only grandfathered findings, its step must pass; if it reports new findings or a fingerprint mismatch, keep the gate failed and bring the exact evidence to review. Do not change the baseline or validator to make it green.
- [ ] **Step 9 — Present Final Review evidence.** Report local checks and their limits, exact changed-file set and diff, remote SHA/run/log evidence, SAST outcome, and any other CI failures separately. Do not mark GAP-090 resolved or claim overall CI success merely because the SARIF path works. No tracking change or exception is part of this plan.

## Requirement-to-evidence map

| Approved Spec                                   | Plan step            | Proof required                                                                                                 |
| ----------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| §2.1 directory-to-`javascript.sarif` handoff    | Task 1 Steps 1–2     | Focused workflow diff; CodeQL output and resolved path match in real CI                                        |
| §2.2 missing/unexpected output fails closed     | Task 1 Steps 2, 4    | Empty, absent, and wrong-leaf probes fail without exporting `SARIF_PATH`; real workflow keeps failing behavior |
| §2.3 unchanged baseline authority               | Task 1 Steps 2, 5, 8 | Validator and invocation unchanged; existing fixture tests pass; real validator output and exit captured       |
| §2.4 scope preservation                         | Task 1 Steps 3, 6    | `actionlint`, Prettier, `git diff --check`, one-step diff review                                               |
| §3.3–5 real-CI verification and honest closeout | Remote Steps 7–9     | Tested SHA, run URL, actual CodeQL file, validator output/exit, unrelated failures identified                  |

## Risks and stop conditions

- `analyze@v3` or its configuration may emit a different filename in a later run. The fixed expected leaf intentionally fails closed; do not add a fallback or broad SARIF search under this plan. Stop and seek focused review if real CI contradicts the recorded `javascript.sarif` evidence.
- The real SARIF may expose new findings or changed fingerprints after the path is repaired. Preserve that failure; it is distinct from this handoff defect and needs separate evidence review before any disposition.
- The repository already has unrelated required CI failures. Do not classify them as exceptions or infer this change caused or repaired them without evidence.

**Next gate:** Plan Review. Implementation begins only after Plan Review approval and separate implementation authorization under `AGENTS.md` §3.
