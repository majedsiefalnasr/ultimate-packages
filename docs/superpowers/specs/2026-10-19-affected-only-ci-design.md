# Affected-Only CI — Design

**Date:** 2026-10-19
**Status:** APPROVED — Spec Review closed (user, 2026-10-19), revision 2. The implementing Plan (revision 2) passed Plan Review (user, 2026-10-19).

- The user approved AO-1 to AO-7 on 2026-10-19, as recommended.
- Spec Review (2026-10-19, in-session, against repository evidence) found SR-1 to SR-6, all applied in revision 2 (§7).
- Committed with its implementation after Plan Review approval (`AGENTS.md` §7.3).

**Research:** `docs/architecture/research/2026-10-19-affected-only-ci-research.md`. Its §2–§5 evidence is binding here and is not restated.

**Evidence baseline:** `develop` = `84fcdce2`. `develop` has since moved to `2b93c2e2` (PR #45, docs only: the Gitflow closeout record). Nothing in this Spec depends on that file.

## 1. Problem

- Every PR runs every check, including the 37% of recent PRs that change only Markdown (research F-1).
- The existing affected-package logic selects nothing for root and shared changes, so pack/install integrity silently runs for nothing on exactly those PRs (F-2).
- Local hooks are silently off in checkouts without `.husky/_` (F-5).

## 2. Decisions this Spec implements

| ID   | State                                       | Summary                                                                 |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------- |
| AO-1 | **Approved** (user, 2026-10-19), option (a) | Docs-only fast path in `ci`, with step-level skips.                     |
| AO-2 | **Approved** (user, 2026-10-19), option (a) | Browser track-a runs only the changed frameworks on PRs.                |
| AO-3 | **Approved** (user, 2026-10-19), option (a) | Package-level Build/Typecheck/Test scoping deferred.                    |
| AO-4 | **Approved** (user, 2026-10-19), option (a) | `affected-packages` returns every package when a widening path changes. |
| AO-5 | **Approved** (user, 2026-10-19), option (a) | One tested classifier module.                                           |
| AO-6 | **Approved** (user, 2026-10-19), option (a) | Push runs stay full; `strict: false` unchanged.                         |
| AO-7 | **Approved** (user, 2026-10-19), option (a) | `AGENTS.md` documents the per-checkout `pnpm install` that hooks need.  |

## 3. Scope

**Non-goals:**

- scoping Build, Typecheck or Test by package (AO-3);
- changing `ci-extended`'s content, the SSR jobs, `release.yml` or `perf-stage1.yml`;
- changing branch protection, the `ci` check name, or the triggers;
- changing hooks' commands;
- fixing any known-red check;
- Phase 2; deferred S1–S7.

**Anti-goals:** the change fails if any of these happen, even when CI is green:

- the required `ci` check can report success without its expensive steps having run, on a diff that is not docs-only;
- a classifier error, an empty diff, a push or an unknown path leads to fewer checks;
- a workflow-level `paths`/`paths-ignore` filter or a job-level `if:` is added to the `ci` job.

## 4. Requirements

### R1 — Classifier `scripts/provenance/classify-changes.mjs` (AO-1, AO-2, AO-4, AO-5)

- **Pure exports:**
  - `isDocsOnlyPath(path) → boolean`;
  - `classifyChanges(paths, { event }) → { scope: "docs" | "full", frameworks: string[] }`.
- **`isDocsOnlyPath`** is true only when the path ends in `.md` **and** is not under `packages/`, `apps/`, `skills/`, `tooling/`, `.github/` or `.husky/`, **and** is not one of:
  - `AGENTS.md`;
  - `docs/architecture/PERFORMANCE.md`, `ACCESSIBILITY_BASELINE.md`, `SAST_BASELINE.md`, `PROVENANCE.md`, `COMPATIBILITY.md`;
  - any `docs/architecture/research/*-accessibility-preexisting.md`.
- **`scope`** is `"docs"` only when `event` is `"pull_request"`, `paths` is non-empty and every path is docs-only. Otherwise it is `"full"`.
- **`frameworks`**, a sorted subset of `["ng", "react", "vue"]`:
  - when `scope` is `"full"` because of the event or an empty list, all three;
  - otherwise the union per path:
    - a docs-only path adds nothing;
    - `packages/ng/`, `packages/ng-core/`, `apps/playground-angular/` or `tooling/prime-reference/ng/` adds `ng`;
    - `packages/react/`, `packages/react-core/` or `apps/playground-react/` adds `react`;
    - `packages/vue/`, `packages/vue-core/`, `apps/playground-vue/` or `tooling/prime-reference/vue/` adds `vue`;
    - any other path adds all three.
- **CLI:** `node scripts/provenance/classify-changes.mjs --base-ref <ref> --event <name>`.
  - It lists changed files with `git diff --name-status -M <merge-base>...HEAD` and counts **both** paths of a rename, so a file moved out of `packages/` is not read as docs-only. It reuses `baseline-lib.mjs`'s `getMergeBaseSha`. For a `push` it calls no git command.
  - It prints the result and, when `$GITHUB_OUTPUT` is set, writes `scope=<…>` and `frameworks=<JSON array>`. The array is written with `JSON.stringify`, so the empty case is exactly `[]`, which R4's job condition compares against.
  - **On any error**, it prints the error, writes `scope=full` and `frameworks=["ng","react","vue"]`, and exits 0.

### R2 — `affected-packages.mjs` widening (AO-4)

`computeAffectedPackages(changedFiles)` returns every package in `getAllPackageNames()` (short names, sorted) when any changed file is neither under `packages/` nor docs-only by `isDocsOnlyPath`. Otherwise its current behavior is unchanged.

### R3 — `ci.yml` job `ci` (AO-1, AO-6)

- A new step "Classify changes" (`id: classify`) after "Setup Node.js". It runs `node scripts/provenance/classify-changes.mjs --base-ref "origin/$BASE" --event "$EVENT"`, with `EVENT: ${{ github.event_name }}` passed through `env`.
- These 16 existing steps add `&& steps.classify.outputs.scope != 'docs'` to their `if:`, and nothing else changes:
  - Build, Typecheck, Validate generated artifacts, Test;
  - Metadata API drift check, Metadata coverage report, Compatibility manifest validation. These read built output: `component-metadata/dist` for the first two, `component-schema/dist` for the third. They cannot run once Build is skipped;
  - Determine affected packages, Pack/install integrity (affected), Installed-package smoke (CLI/MCP);
  - CodeQL init, CodeQL analyze, Resolve SARIF path, SAST baseline validation;
  - Fetch pinned vendor archives, Provenance scripts self-tests.
- The comparison is `!= 'docs'`, never `== 'full'`, so an empty or missing output runs the step.
- The job keeps its ID, has no job-level `if:`, and gets no workflow `paths` filter.
- `ci-extended` is unchanged.

### R4 — `browser.yml` job `track-a-browser-visual-a11y` (AO-2)

- A new job `changes`:
  - `runs-on: ubuntu-latest`, `permissions: contents: read`;
  - `env: BASE: ${{ github.base_ref || github.ref_name }}`, checkout with `fetch-depth: 0`, the same "Fetch base ref" command as `ci`, and Node setup (`24.15.0`); no dependency install is needed;
  - runs the classifier and exposes `frameworks` as a job output.
- `track-a-browser-visual-a11y` gains:
  - `needs: changes`;
  - `if: needs.changes.outputs.frameworks != '[]'`;
  - `matrix.framework: ${{ fromJSON(needs.changes.outputs.frameworks) }}`.
- Its steps are unchanged. `track-e-ssr-hydration` is unchanged.

### R5 — `AGENTS.md` §7.1 (AO-7)

Add: "Run `pnpm install` under Node 24.15.0 in each checkout or worktree before committing. Git hooks live in `.husky/_` (`core.hooksPath`), which husky creates per checkout. Without it git runs no hooks and gives no warning."

### R6 — ADR-069 in `DECISIONS.md`

> ## ADR-069 — Change-scoped CI keeps the required `ci` check always reporting
>
> Status: Accepted (user decisions AO-1 to AO-7, 2026-10-19). Evidence: `docs/architecture/research/2026-10-19-affected-only-ci-research.md`.
>
> **Decision.**
>
> - A single tested classifier decides scope.
> - The required `ci` job always runs. It skips only expensive steps, and only for a pull request whose every changed path is docs-only Markdown that no CI script reads.
> - Any other path, any push, an empty diff or a classifier error runs everything.
> - Non-required Browser jobs run only the changed frameworks on pull requests and all frameworks on pushes.
> - `affected-packages` treats any non-package, non-docs change as affecting every package.
> - Workflow path filters and job-level conditions on required jobs are not used.
>
> **Consequences.** A docs-only PR's `ci` check proves formatting, lint, supply-chain and the fast validators, not build or tests. Push runs on `develop` and `main` run every step and all browser frameworks, and are the source of ADR-052 X-12 evidence. Pack/install integrity checks no package on a push, because a push's diff against its own branch is empty; this predates ADR-069 and is not changed by it. Package-level scoping (AO-3) is deferred.

### R7 — Landing

- The branch `research/affected-only-ci` (from `origin/develop`, `--no-track`) carries the research, this Spec, the Plan and R1–R6.
- One PR into `develop`. Because it changes `.github/` and `scripts/`, it classifies as `full` and runs everything.

## 5. Acceptance criteria

| ID  | Criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Evidence                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| AC1 | `node --test scripts/provenance/classify-changes.test.mjs` passes and covers each R1 rule: <br>• docs-only → `docs`, `[]`; <br>• each §2.5 file → `full`; <br>• `packages/ng/README.md` → `full`, `["ng"]`; <br>• `pnpm-lock.yaml` → all three; <br>• `apps/playground-vue/x` → `["vue"]`; <br>• `packages/uix-utils/x` → all three; <br>• `push` → `full`, all; <br>• empty list → `full`, all; <br>• an unknown path → all; <br>• CLI on a bad ref → `scope=full`, exit 0 | Local                                                  |
| AC2 | `affected-packages.test.mjs` adds: `pnpm-lock.yaml` → all 17; `scripts/x.mjs` → all 17; a docs-only path → `[]`. All existing cases pass                                                                                                                                                                                                                                                                                                                                    | Local                                                  |
| AC3 | `actionlint` is clean. No workflow has `paths:` or `paths-ignore:`. The `ci` job has no job-level `if:`. Every R3 step's `if:` contains `scope != 'docs'`, and none contains `== 'full'`                                                                                                                                                                                                                                                                                    | Local `grep`                                           |
| AC4 | `pnpm run test:scripts`, `pnpm run lint`, `prettier --check .` and `agents-md-pointers:validate` pass                                                                                                                                                                                                                                                                                                                                                                       | Local                                                  |
| AC5 | On this PR: classify logs `scope=full`; every `ci` step runs; `ci` succeeds; all three track-a frameworks run                                                                                                                                                                                                                                                                                                                                                               | Real GitHub run                                        |
| AC6 | After merge, on a docs-only PR into `develop`: classify logs `scope=docs`; the R3 steps show as skipped; `ci` succeeds; track-a does not run; SSR still runs                                                                                                                                                                                                                                                                                                                | Real GitHub run; externally unexercisable before merge |
| AC7 | The push run on `develop` after merge runs every step and all three track-a frameworks                                                                                                                                                                                                                                                                                                                                                                                      | Real GitHub run                                        |

## 6. Risks

- **A docs-only PR merges a docs change that breaks a build-time reader** that R1 did not list. Mitigation: the push run on `develop` is full (AO-6), and R1's exclusion list comes from research §2.5.
- **Dynamic matrix:** if `changes` fails, track-a is skipped. It is non-required, and the failed `changes` job shows red.
- **CodeQL on docs-only PRs:** the analysis is skipped, so GitHub's code-scanning summary for that PR has no new analysis. It is not a required check, and push runs keep the analysis on `develop` and `main`.
- **Classifier drift:** a new validator that reads a new docs file must be added to R1's list. ADR-069 names the rule, and AC1 pins the current list.
- **Wider pack/install integrity:** after R2, any root or shared change runs integrity for all 17 packages. Measured locally after a build: 1 s for `uix-utils` and 5 s for `ng` with its 7-package closure. That is well under a minute in total.

## 7. Spec Review record (2026-10-19)

The review checked every requirement against `84fcdce2` and the workflow and script sources. It was run in this session, not by an independent reviewer.

| ID   | Finding                                                                                                                                                                                                                                    | Resolution                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| SR-1 | §2 listed AO-1 to AO-7 as pending, although the user approved them.                                                                                                                                                                        | §2 and Status updated.                  |
| SR-2 | R3 kept Metadata API drift check, Metadata coverage report and Compatibility manifest validation always on. They import `component-metadata/dist` and `component-schema/dist`, so with Build skipped they would fail or read stale output. | Added to R3's gated list, now 16 steps. |
| SR-3 | ADR-069's Status carried a `<date>` placeholder.                                                                                                                                                                                           | Set to 2026-10-19.                      |
| SR-4 | R1 did not fix the JSON form of `frameworks`. R4's `!= '[]'` relies on it.                                                                                                                                                                 | R1 requires `JSON.stringify`.           |
| SR-5 | The cost of R2's widening was not stated.                                                                                                                                                                                                  | Measured and recorded in §6.            |
| SR-6 | `develop` moved to `2b93c2e2` after the evidence baseline.                                                                                                                                                                                 | Recorded; the change is unrelated.      |

**Amendment after approval (2026-10-19, final review):**

- **A1:** R6's ADR text said push runs "remain the full post-merge signal". Pack/install integrity selects no package on a push, because the push diff is empty. That predates this work and was not part of R2. The ADR now says so, and the behavior is unchanged.

Checked and found correct:

- The other fast validators read no `dist/` (boundary, ceiling, CLI/MCP/AI boundary, AGENTS.md pointers, install-script policy). Lint and Format already run before Build.
- `baseline-lib.mjs` imports only `node:child_process`, so the classifier needs no dependency install.
- No CI script reads `.changeset/`.
