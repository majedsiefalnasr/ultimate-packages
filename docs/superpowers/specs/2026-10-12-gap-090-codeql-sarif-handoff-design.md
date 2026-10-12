# GAP-090 — CodeQL SARIF handoff to the SAST baseline validator

**Date:** 2026-10-12
**Status:** APPROVED — Spec Review passed; implementation and Final Review completed in PR #7 (merged at `6d777328f9236839f66dcc90b60b3eec1a783812`).
**Authority:** [Blueprint §29](../../architecture/BLUEPRINT.md#29-security-strategy) and [§40](../../architecture/BLUEPRINT.md#40-definition-of-done-for-the-platform); [GAP-090](../../architecture/BLUEPRINT_GAPS.md#gap-090--sast-baseline-validation-cannot-find-the-codeql-sarif-file). The [Phase 10 Track B Specification](2026-09-08-phase-10-ci-security-quality-gates-design.md) §4 R3 and its [Implementation Plan](../plans/2026-09-08-phase-10-ci-security-quality-gates-implementation.md) establish the existing CodeQL, baseline, severity, and CI enforcement contracts. This Specification repairs their SARIF file handoff only.

## 1. Verified problem

On `main` commit `6d2836d0c0a5adc8e5978de4a91147b99388bd31`, [CI run 38221832098](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38221832098), `ci` job, CodeQL analyze succeeded and logged `Post-processing sarif files: ["/home/runner/work/ultimate-packages/results/javascript.sarif"]`. Its `sarif-output` step output identified `/home/runner/work/ultimate-packages/results` as the output **directory**. The following `Resolve SARIF path` step instead formed `.../results/javascript-typescript.sarif`; `SAST baseline validation` exited 1 with `SARIF file not found at .../results/javascript-typescript.sarif`. [PR #6 CI run 38289045573](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38289045573) repeats the same generated-file and requested-file mismatch.

The source confirms the handoff: [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) appends `/javascript-typescript.sarif` to `steps.codeql-analyze.outputs.sarif-output`, then invokes `pnpm run sast:validate -- "$SARIF_PATH"`. [`validate-sast-baseline.mjs`](../../../scripts/provenance/validate-sast-baseline.mjs) accepts that path, fails closed when it is absent, and compares qualifying SARIF findings with [`SAST_BASELINE.md`](../../architecture/SAST_BASELINE.md). Its fixture tests exercise the comparison contract, but a fixture pass does not establish that CI supplied a real CodeQL file. No current CI evidence proves the validator evaluated the real findings.

## 2. Required behavior and scope

1. In the existing `ci` job, resolve the JavaScript/TypeScript analysis file actually emitted by the existing `github/codeql-action/analyze@v3` step. For the current single `javascript-typescript` analysis, the observed file is `javascript.sarif` inside the action's `sarif-output` directory. Treat that output as a directory, not as a complete file path.
2. Before invoking the validator, require the resolved path to name an existing regular SARIF file. Missing output must fail the CI step with an explicit path diagnostic; it must never be interpreted as zero findings or cause the validation step to be skipped.
3. Pass that exact existing file to the unchanged `pnpm run sast:validate -- "$SARIF_PATH"` invocation. The existing validator remains the authority for baseline fingerprints, qualifying `error`/`warning` severity, and exit status. A new qualifying finding must still fail CI; a scan containing only grandfathered qualifying findings must pass this validation step.
4. Keep the existing CodeQL source/query scope, upload behavior, baseline contents and one-way-door rule, action versions, and other CI steps unchanged. This repair introduces no exception and does not waive any other failing CI check.

The expected implementation surface is the `Resolve SARIF path` handoff in `.github/workflows/ci.yml` only. The Plan must verify that this remains sufficient against the exact workflow version in use. No change to the validator, its tests, root scripts, `SAST_BASELINE.md`, or tracking documents is justified by the currently verified path mismatch.

## 3. Acceptance and verification

1. A focused review of the workflow diff shows that only the SARIF handoff is changed; the resolved path is derived from `steps.codeql-analyze.outputs.sarif-output` and points to the observed `javascript.sarif` file. The resolution fails closed if that file is absent.
2. Existing `validate-sast-baseline.mjs` tests continue to pass, including missing-file, grandfathered-finding, new-finding, and note-level cases. A focused path-resolution check exercises the exact directory-plus-file selection and missing-file failure. These local checks are necessary but do not replace real CI evidence.
3. On a clean GitHub-hosted CI run for the eventual implementation commit, record the commit SHA, run URL, CodeQL analyze result and logged SARIF path, resolved existing file path, `SAST baseline validation` exit code, and validator output. The validator must read the same real file CodeQL produced and report a qualifying-result count or actual `NEW FINDING` diagnostics, rather than `SARIF file not found`.
4. If the real SARIF has only existing grandfathered qualifying findings, `SAST baseline validation` must pass. If it reveals new findings or an unexpected fingerprint mismatch, retain the failing gate and investigate that evidence separately before claiming a working, passing SAST gate. Do not add baseline entries, suppress findings, or change severity to force a pass.
5. Final Review distinguishes a repaired SARIF path from the overall CI result. Other required CI failures remain unexcepted; GAP-090 status changes require their own evidence review and authorization.

## 4. Boundaries and next gate

No architectural choice is reopened. The dated [completion assessment](../../architecture/research/2026-10-11-final-project-completion-assessment.md) places GAP-090 in C01's CI-signal work; the completion register is maintained separately under C00 and is not included in this closeout PR. Neither tracking source authorizes implementation. GAP-089, GAP-091, GAP-092, release, and general cleanup are outside this Specification.

The next gate is **Spec Review**. Only after approval may an Implementation Plan be authored and submitted to Plan Review under [`AGENTS.md` §3](../../../AGENTS.md#3-workflow-and-approval-gates).
