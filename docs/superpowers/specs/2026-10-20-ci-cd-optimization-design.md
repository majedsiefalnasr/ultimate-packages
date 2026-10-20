# CI/CD Optimization — Design

**Date:** 2026-10-20
**Status:** APPROVED — Spec Review passed (user, 2026-10-20), revision 3. Nothing in it is authorized for implementation: the Plan needs Plan Review, and each stage its own implementation authorization.

- The user approved CO-1 to CO-13 on 2026-10-20, as recommended, with the boundaries recorded in the research record's §9 decision state.
- ADR-070 records the decisions.
- The implementation is split into three stages. Each stage lands as its own PR and needs its own implementation authorization (§8).

**Research:** `docs/architecture/research/2026-10-20-ci-cd-optimization-research.md`. Its §2–§4 evidence is binding here and is not restated.

**Baseline:** ADR-068, ADR-069, the Affected-Only CI Spec (revision 2, Amendment A1), its Plan (revision 2) and its closeout record. Rules from those documents that this Spec changes are listed in §2; every other rule stands.

**Evidence baseline:** `develop` = `ee8e0897`; `main` = `03aeb1a6`.

## 1. Problem

The research record's §4 lists the limitations. This Spec addresses these:

- **L-1:** browser jobs run for changes they cannot be affected by.
- **L-2:** track-a starts all three Storybook servers in every invocation.
- **L-4:** docs-only PRs run `ci-extended` and SSR.
- **L-5:** pack/install integrity selects no package on a push.
- **L-6:** a PR into `main` can take the docs fast path.
- **L-7:** superseded runs are never cancelled.
- **L-8:** no job has a timeout.
- **L-9:** tranche Playwright reports are lost.
- **L-10:** job names are unclear.

## 2. Decisions implemented and rules changed

| ID    | Decision (user, 2026-10-20)                                                         | Stage | Approved rule it changes                                                |
| ----- | ----------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------- |
| CO-3  | Cancel superseded PR runs; never cancel push runs                                   | 1     | —                                                                       |
| CO-4  | `timeout-minutes` on every `ci.yml` and `browser.yml` job                           | 1     | —                                                                       |
| CO-9  | One Playwright HTML report per invocation, uploaded                                 | 1     | —                                                                       |
| CO-10 | (a) Descriptive display names; the required check stays `ci`; cited step names kept | 1     | —                                                                       |
| CO-1  | Browser-input classification                                                        | 2     | Affected-Only Spec R1, "any other path adds all three"                  |
| CO-2  | Docs-only PRs skip the `ci-extended` steps and SSR; SSR follows `frameworks`        | 2     | Affected-Only Spec §3 non-goals and R4: `ci-extended` and SSR unchanged |
| CO-5  | PRs into `main` run everything                                                      | 2     | Affected-Only Spec R1: `scope` ignores the base                         |
| CO-6  | Pack/install integrity covers every package on a push                               | 2     | ADR-069 consequence and Spec A1: no package on a push                   |
| CO-7  | Each track-a job starts only its own framework's Storybook server                   | 3     | —                                                                       |

**Not implemented here, by decision:**

- CO-8 (sharding): deferred. Stage 3 measures, and CO-8 is reconsidered only if the critical path is still above about 15 minutes.
- CO-11 (parallel `ci`): research-only.
- CO-12: hooks unchanged.
- CO-13: push runs stay full.

## 3. Scope

**Non-goals:**

- branch protection, repository settings, the `ci` check name, triggers;
- `release.yml`;
- `perf-stage1.yml`, except its job display name (CO-10);
- hook commands;
- fixing any known-red check;
- track-a sharding;
- splitting `ci`;
- package-level Build/Typecheck/Test scoping (AO-3);
- Phase 2; deferred S1–S7.

**Anti-goals:** a stage fails if any of these happen, even when CI is green:

- the required `ci` job gains a job-level `if:`, a `paths`/`paths-ignore` filter, or a different check name;
- a push run, an empty diff, a classifier error or an unrecognized path leads to fewer checks or fewer frameworks than today;
- a push run is cancelled by concurrency;
- a browser job runs with a file that `NON_BROWSER_PATHS` matches, or a path outside `packages/` selects no framework without being in that list;
- any step that an ADR, Spec, Plan or closeout cites by name is renamed (§4.4).

## 4. Stage 1 — Run hygiene and names (YAML only)

### R1 — Concurrency (CO-3)

`ci.yml` and `browser.yml` each get a workflow-level block:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.event.pull_request.number || format('{0}-{1}', github.ref, github.sha) }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

- A PR's group is its number, so a new push to the PR cancels the run still in progress for the older head.
- A push's group includes ref and SHA. No two push runs share a group, so a push run is never cancelled and never replaced while pending.

### R2 — Timeouts (CO-4)

| Job                           | `timeout-minutes` | Longest observed (research §3.1) |
| ----------------------------- | ----------------- | -------------------------------- |
| `ci`                          | 30                | 8.9 min                          |
| `ci-extended`                 | 20                | 4.4 min                          |
| `changes`                     | 5                 | 0.2 min                          |
| `track-a-browser-visual-a11y` | 45                | 26.7 min                         |
| `track-e-ssr-hydration`       | 15                | 1.7 min                          |

### R3 — Per-invocation Playwright reports (CO-9)

- Each track-a step that runs `npx playwright test` after the strict suite gets `PLAYWRIGHT_HTML_OUTPUT_DIR` set in its `env:`:
  - the six `Run G3-… verification specs` steps get `playwright-report-tranches/<id>`, where `<id>` is `g3a`, `g3b`, `g3c1`, `g3c2`, `g3d` or `g3e`;
  - `Run W1 verification specs (react)` gets `playwright-report-tranches/w1`.
- A new last step in the job, "Upload Playwright HTML reports (tranches)", with `if: always()`, uploads `playwright-report-tranches/` as `playwright-report-tranches-${{ matrix.framework }}` with `if-no-files-found: ignore`.
- The strict suite's `playwright-report/` and its existing upload are unchanged.
- No test command, `--project`, `--grep-invert` or validator changes.

### R4 — Display names (CO-10 a)

| Job ID (unchanged)            | `name:` added                                      | Check name expected on a PR                                               |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| `ci`                          | `ci`                                               | `ci` (pins today's name)                                                  |
| `ci-extended`                 | `Baselines (advisory): size, coverage, provenance` | same                                                                      |
| `changes`                     | `Classify changes`                                 | same                                                                      |
| `track-a-browser-visual-a11y` | `Playwright visual + a11y`                         | `Playwright visual + a11y (ng)` etc.; skipped: `Playwright visual + a11y` |
| `track-e-ssr-hydration`       | `SSR hydration`                                    | `SSR hydration (ng)` etc.                                                 |
| `stage1` (`perf-stage1.yml`)  | `Perf Stage 1 measurement`                         | same (manual only)                                                        |

- **SSR matrix shape.** For the SSR name to carry only the framework, the SSR matrix becomes `framework: [ng, react, vue]` with no `include`. The build step derives the directory:

  ```yaml
  pnpm --filter-prod "${{ matrix.framework == 'ng' && 'playground-angular' || format('playground-{0}', matrix.framework) }}..." run build
  ```

  Its step name keeps its text, with the expression substituted the same way. Artifact names are unchanged.

- **Matrix suffix.** The names contain no matrix expression. The expectation that GitHub appends the matrix values to a `name:` without one is **[D]**, unverified here. AC1.3 checks it on a real run. If GitHub does not append them, the fallback is `name: <text> (${{ matrix.framework }})` for running jobs, and AC1.3 records how the skipped row renders. Stage 1 cannot close until one of the two forms is verified.

### 4.4 Step names

No step is renamed. The research record's §5.1 offered two examples:

- `Run Playwright projects (…)` is cited in `2026-10-11-gap-124-verification.md` and in the G3-C1, G3-C2 and G3-E Plans.
- `Pack/install integrity (affected)` is cited in 15 records, among them the ADR-069 Spec and its closeout.

Under §5.1's own rule both stay. The rule itself (cited step names are never renamed) is the anti-goal in §3.

## 5. Stage 2 — Classification (CO-1, CO-2, CO-5, CO-6)

### R5 — Browser inputs (CO-1)

`scripts/provenance/classify-changes.mjs` gains a closure derivation, a closed list of non-browser paths, and a refined framework rule. Scope (`docs`/`full`) is unchanged except for R6.

**Principle.** A path may skip browser jobs only when:

- it is a workspace package in no framework's dependency closure (R5.1), and the browser jobs delete its contents after building (R5.3); or
- it is on the closed `NON_BROWSER_PATHS` list (R5.2), and the browser jobs delete it before installing (R5.3).

Both cases rest on physical exclusion, so no browser result can depend on a narrowed path.

Nothing is narrowed because an analysis failed to find a reference.

**R5.1 — `deriveFrameworkClosures(repoRoot)`**, read from the working tree at the PR head. It needs no dependency install and no build, and it throws on any error.

- **Framework roots.** These are the projects Spec R1 already maps to each framework:
  - ng: `packages/ng`, `packages/ng-core`, `apps/playground-angular`, `tooling/prime-reference/ng`;
  - react: `packages/react`, `packages/react-core`, `apps/playground-react`;
  - vue: `packages/vue`, `packages/vue-core`, `apps/playground-vue`, `tooling/prime-reference/vue`.
- **Package closure.** For each framework, the set of `packages/*` directory names reachable from its roots:
  - the roots' own `workspace:` entries in `dependencies` and `devDependencies`;
  - then, for every package reached, `workspace:` entries in `dependencies` only.

  These are `workspace-graph.mjs`'s `getTransitiveClosure` semantics. Through them, `themes`' devDependency cross-edge does not pull `react` and `vue` into `ng`. The derivation reads every manifest from `repoRoot` itself, because `workspace-graph.mjs` resolves the repository from its own module path and so cannot read a fixture tree. A test checks that, on the real tree, each closure agrees with `getTransitiveClosure`, so the two cannot drift apart.

- **Edge guard.** If any manifest under `packages/`, `apps/` or `tooling/prime-reference/` has a `workspace:` specifier in `peerDependencies` or `optionalDependencies`, the derivation throws. Those edges are not modeled.
- **Evidence (research §13).**
  - The browser surface has no undeclared `@ultimate/*` import, no relative import into another package and no filesystem read of another package.
  - Its only references to no-closure packages are comments.
  - Outside the framework roots, every package today is in all three closures or in none.

**R5.2 — `NON_BROWSER_PATHS`**, a closed list exported by the classifier. It is the only source of narrowing outside `packages/`.

| Kind   | Entries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prefix | `docs/architecture/provenance/`, `.changeset/`, `.github/codeql/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Exact  | `AGENTS.md`; `docs/architecture/PROVENANCE.md`, `PERFORMANCE.md`, `SAST_BASELINE.md`, `COMPATIBILITY.md`; `.github/workflows/ci.yml`, `release.yml`, `perf-stage1.yml`                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Exact  | under `scripts/provenance/`: `validate-provenance.mjs`, `validate-provenance-diff.test.mjs`, `validate-provenance-manifest.test.mjs`, `production-scope.mjs`, `production-scope.test.mjs`, `generate-manifest.mjs`, `validate-coverage.mjs`, `validate-coverage.test.mjs`, `validate-bundle-size.mjs`, `validate-bundle-size.test.mjs`, `measure-package-size.mjs`, `affected-packages.mjs`, `affected-packages.test.mjs`, `pack-install-integrity.mjs`, `pack-install-integrity.test.mjs`, `installed-cli-mcp-smoke.mjs`, `installed-cli-mcp-smoke.test.mjs`, `validate-sast-baseline.mjs`, `validate-sast-baseline.test.mjs` |

- A prefix entry matches a path that starts with it; an exact entry matches only itself.
- **Excluded on purpose:**
  - `skills/`, `docs/architecture/compatibility-manifest.json` and `scripts/copy-compatibility-manifest.mjs` are used by the `ai`, `cli` and `mcp` builds, which run inside track-a's whole-workspace `pnpm run build`. The `ai` build writes generated skill files into `skills/`; the `cli` and `mcp` builds run the copy script on the manifest;
  - `scripts/perf/`: the playgrounds' perf pages import types from `scripts/perf/browser/harness`, and `ng build` type-checks every `src/**/*.ts` file of `playground-angular` (research §13.3, item 6);
  - the accessibility baselines and validators, the classifier and its imports, `browser.yml` and the Playwright configs are browser inputs.

  Every path not in the list, under `docs/` (other than docs-only Markdown) or `scripts/` included, selects all three frameworks.

- The `.changeset/` prefix also matches docs-only Markdown (`.changeset/*.md`). Rule 1 settles those first, with the same result, and R5.3 removes them from browser jobs like any other listed file.

**R5.3 — Physical exclusion.** Two CLI modes. Unlike the classification mode, both **fail loudly**: any error, including a closure derivation error, exits non-zero.

- `node scripts/provenance/classify-changes.mjs --remove-non-browser-paths`:
  - deletes every tracked file (`git ls-files`) that `NON_BROWSER_PATHS` matches, and prints how many files it removed and which ones;
  - `track-a-browser-visual-a11y` and `track-e-ssr-hydration` run it as "Remove non-browser inputs", right after "Setup Node.js" and before install.
- `node scripts/provenance/classify-changes.mjs --remove-out-of-closure-packages`:
  - for every workspace package under `packages/` that is in no framework closure (R5.1), deletes everything in its directory except `package.json`: tracked files, `dist/` and any other build output. It prints the packages and file counts;
  - both browser jobs run it as "Remove packages outside the framework closures", right after their build step (track-a: "Build workspace packages"; SSR: "Build harness and its workspace dependencies") and before Playwright;
  - keeping `package.json` keeps the pnpm workspace intact for the `pnpm --filter … exec`/`run` commands that start the servers.
- Both steps run on every event, PR and push alike.
- **Consequence.** No Playwright run ever sees a listed file or a no-closure package's contents, so no browser result can depend on them, whether they are read by literal or computed path, directly or indirectly. A browser job that does need one fails on every run, PR and push, until the rule changes. That is a loud failure, not a silent narrowing.
- **Build coverage.** The no-closure packages are still built inside track-a's whole-workspace build, before they are removed, so a broken tooling package can still fail track-a's Build step on a push. That build is not browser evidence; the required `ci` Build step checks it on every non-docs PR.

**R5.4 — Framework rule** for a pull request into `develop`, per path, in this order:

1. A docs-only path (`isDocsOnlyPath`, unchanged) adds nothing.
2. A path under a framework root adds that framework (unchanged).
3. A path under `packages/<name>/`:
   - when `<name>` is a workspace package in **no** framework closure, it adds nothing (enforced by R5.3);
   - otherwise, including a package in some or all closures, or a directory that is not a workspace package, it adds all three.
4. A path matched by `NON_BROWSER_PATHS` adds nothing.
5. Any other path adds all three. This covers root files, the lockfile, `browser.yml`, `playwright*.config.ts`, `.husky/`, `skills/`, unlisted `docs/` and `scripts/` paths, other `apps/` and `tooling/` paths, and new top-level directories.

If `deriveFrameworkClosures` throws, the CLI logs the error and rule 3 adds all three frameworks. Rules 1, 2, 4 and 5 do not depend on the derivation.

**R5.5 — How the classification stays correct as inputs change.** This answers the user's condition on CO-1. Uncertainty never narrows.

| Change in the repository                                                       | Effect                                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A framework package gains or loses a workspace dependency                      | Read from the manifests on every run, so the closure follows. A package that joins a closure stops being removed and selects all three                                                          |
| A new `packages/*` package                                                     | In no closure until a framework depends on it: narrowed, and removed from browser jobs after the build                                                                                          |
| Browser code starts reading a no-closure package by path, without declaring it | The package's files are absent in every Playwright run, so the job fails on the PR that introduces the read and on every run after it. Declaring the dependency moves it into the closure       |
| A package comes to be in some closures but not all                             | Rule 3 adds all three. Narrowing for partial closures would need a new decision                                                                                                                 |
| A peer or optional workspace edge                                              | The derivation throws; rule 3 runs all three until the derivation is extended                                                                                                                   |
| The closure derivation fails for any reason                                    | Rule 3 runs all three                                                                                                                                                                           |
| A browser job starts reading a file outside `packages/` that is **not** listed | Nothing to do: the path already selects all three (rule 5)                                                                                                                                      |
| A browser job starts reading a **listed** file, by literal or computed path    | The file is absent in every browser run, so the job fails on the PR that introduces the read and on every run after it. The fix is to drop the entry. No run passes while depending on the file |
| A new script, doc, top-level directory or file                                 | Rule 5: all three, until a reviewed classifier change lists it                                                                                                                                  |
| An entry is added to `NON_BROWSER_PATHS`                                       | That PR changes the classifier, a browser input (rule 5), so it runs all three frameworks with the new exclusion already applied, and proves the entry on its own PR                            |

Only rules 3 and 4 can narrow, and R5.3 physically enforces both. A derivation error makes rule 3 run all three in the classifier and fail the browser job's removal step, never the reverse.

### R6 — PRs into `main` (CO-5)

`classifyChanges(paths, { event, baseRef, closures })` returns `{ scope: "full", frameworks: ["ng", "react", "vue"] }` when `event` is `pull_request` and `baseRef` is `origin/main`. The CLI already passes `--base-ref "origin/$BASE"`.

### R7 — `ci-extended` and SSR (CO-2)

- **`ci-extended`** gains the "Classify changes" step, identical to `ci`'s, after "Setup Node.js". Its six steps after install add `&& steps.classify.outputs.scope != 'docs'` to their `if:`: Build, Bundle-size measurement, Bundle-size regression check, Coverage measurement, Coverage regression check, Provenance validation. It has no job-level `if:`.
- **`track-e-ssr-hydration`** gains:
  - `needs: changes`;
  - `if: needs.changes.outputs.frameworks != '[]'`;
  - `matrix.framework: ${{ fromJSON(needs.changes.outputs.frameworks) }}`.

  This is the same pattern track-a uses (Affected-Only Spec R4). The directory expression of R4 is unchanged.

### R8 — Pack/install integrity on push (CO-6)

- `affected-packages.mjs` accepts `--event <name>`. With `--event push`, the CLI writes every package from `getAllPackageNames()` (short names, sorted) and calls no git command.
- `computeAffectedPackages` is unchanged. Without `--event`, the CLI behaves as today.
- `ci.yml`'s "Determine affected packages" step passes `--event "$EVENT"`, with `EVENT: ${{ github.event_name }}` in its `env:`.

### R9 — Records

- The Spec R1 comment block in `classify-changes.mjs` cites ADR-070 for R5 and R6.
- ADR-070 is already drafted. Stage 2 only checks that its text matches what landed.

## 6. Stage 3 — Storybook servers (CO-7)

### R10 — Framework-filtered Storybook servers

- `playwright.config.ts` reads `TRACK_A_FRAMEWORK`:
  - when it is `ng`, `react` or `vue`, the `webServer` array is exactly that framework's Storybook entry. The three SSR harness entries are left out too: today they are included in every track-a invocation, because `TRACK_E_SSR_FRAMEWORK` is unset there, and no track-a spec uses them (research §3.2);
  - when it is unset, all three are included, so local runs are unchanged;
  - any other value is a configuration error (`throw`).

  This mirrors the existing `TRACK_E_SSR_FRAMEWORK` logic. SSR selection is unchanged.

- `track-a-browser-visual-a11y` sets `TRACK_A_FRAMEWORK: ${{ matrix.framework }}` in its job `env:`.

### R11 — Measurement and the CO-8 trigger

- The Stage 3 closeout records, for its PR run and the following push run on `develop`, the same segments as research §3.2:
  - job total;
  - pre-test startup per invocation;
  - strict and tranche test time;
  - test counts.
- Test counts must equal the pre-change counts, or any difference must be explained by a test added or removed on `develop` in between.
- If the longest Browser job on the push run is above 15 minutes, the closeout says so and presents CO-8 for a decision. Nothing is sharded without it.

## 7. Risks

- **A listed path that a browser job needs (CO-1).** R5.3 turns this into a red browser job on every run, never a silent skip. Stage 2's own PR runs the exclusion against all three frameworks (AC2.6), so today's list is proved before it narrows anything.
- **Exclusion removes too much from the job.** The step deletes only tracked files matching the list; AC2.2 pins the matched set on the real tree.
- **Wrong closure semantics.** If a no-closure package were reachable at browser runtime, for example through a devDependency of a dependency, R5.3 would remove it and the browser job would fail on every run. The failure is loud, and the fix is a classifier change. Nothing narrows silently.
- **pnpm with emptied packages.** Untested until AC2.6. If the server start commands fail with only `package.json` left, AC2.6 fails before any narrowing ships, and rule 3's narrowing must be withdrawn (packages then run all three, as under ADR-069).
- **Concurrency cancelling the required check.** When a superseded run is cancelled, its old head shows `ci` as cancelled. Branch protection reads the new head's `ci`, so a merge waits for the new run.
- **Name rendering (R4)** is unverified until AC1.3.
- **Report size (R3).** Seven extra HTML reports per framework job. The artifact uses the default retention.
- **SSR on docs PRs.** After R7, a docs-only PR runs no SSR. Push runs still do.

## 8. Landing and authorization

| Stage | Branch                                                       | Carries                                                                            | PR into   |
| ----- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------- |
| 1     | `research/ci-cd-optimization` (exists, from `ee8e0897`)      | research record, ADR-070, this Spec, the Plan, R1–R4                               | `develop` |
| 2     | new, `--no-track` from `origin/develop` after Stage 1 merges | R5–R9, Stage 1 closeout record                                                     | `develop` |
| 3     | new, `--no-track` from `origin/develop` after Stage 2 merges | R10–R11, Stage 2 closeout record; Stage 3 closeout follows in its own docs-only PR | `develop` |

Each stage needs its own implementation authorization, and each push, PR and merge its own, as `AGENTS.md` §3 and §7 require. Stage 2 starts only after the Stage 1 closeout is accepted, and Stage 3 only after Stage 2's.

## 9. Acceptance criteria

### Stage 1

| ID    | Criterion                                                                                                                                                                                                                                    | Evidence                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| AC1.1 | `actionlint` clean. Both workflows have the R1 block. Every `ci.yml`/`browser.yml` job has the R2 `timeout-minutes`. The `ci` job has no job-level `if:` and no workflow `paths`. No `name:` of a step changed (diff of step names is empty) | Local `grep`, `git diff`                   |
| AC1.2 | On the Stage 1 PR: `ci` reports under the exact name `ci` and the PR shows the required check satisfied                                                                                                                                      | Real GitHub run                            |
| AC1.3 | (a) On the Stage 1 PR: the check names of running jobs match R4's table, or the R4 fallback is applied and verified. (b) The skipped track-a row's rendering, recorded from a docs-only PR (§9.4)                                            | (a) Real GitHub run; (b) deferred per §9.4 |
| AC1.4 | A second commit pushed while the PR's first runs are in progress cancels them; the push run after merge is not cancelled                                                                                                                     | Real GitHub runs                           |
| AC1.5 | The push run's track-a jobs upload `playwright-report-tranches-<fw>` containing one report per tranche invocation (ng and vue: 6; react: `w1`)                                                                                               | Real GitHub run                            |
| AC1.6 | Every step outcome and test count on the push run equals the previous push run's (39320417193), apart from the new upload step                                                                                                               | Real GitHub run                            |

### Stage 2

| ID    | Criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Evidence                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| AC2.1 | `classify-changes.test.mjs` covers each R5.4 rule and R6 with fixture inputs, including: each `NON_BROWSER_PATHS` kind → `[]`; neighbours that are not listed → all three (`docs/architecture/compatibility-manifest.json`, `docs/architecture/provenance.json`, `skills/x`, `scripts/provenance/validate-g3a-accessibility.mjs`, `scripts/provenance/new.mjs`, `docs/architecture/ACCESSIBILITY_BASELINE.md`); a rename from a listed path to an unlisted one → all three; closure derivation throwing (peer edge fixture) → rule 3 gives all three; a fixture package in only one closure → all three; `scripts/perf/x.ts` → all three. `--remove-non-browser-paths` in a temporary git repository deletes exactly the tracked listed files, keeps untracked and unlisted files, and exits non-zero outside a git repository. `--remove-out-of-closure-packages` on a fixture tree empties exactly the no-closure package directories except `package.json`, including an untracked `dist/`, and exits non-zero on the peer-edge fixture. All existing 15 cases still pass | Local                           |
| AC2.2 | Against the real tree: `deriveFrameworkClosures` puts `themes` and every `uix-*` package in all three closures, `ai`, `cli`, `mcp`, `component-metadata` and `component-schema` in none, and `react` not in the ng closure, agreeing with `getTransitiveClosure`; every package outside the framework roots is in all three closures or in none. The files `NON_BROWSER_PATHS` matches in `git ls-files` are listed in the test as a snapshot, and none of them is under `packages/`, `apps/`, `skills/` or `tooling/`, is referenced literally in `browser.yml` or `playwright.config.ts`, or is `classify-changes.mjs`/`baseline-lib.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                  | Local test                      |
| AC2.3 | Replaying the 43 merged PRs of research §3.5 through `classifyChanges` with the real closures: PRs #11, #17, #22, #25, #26, #27, #29, #30, #31 and #40 give `[]`; #16 and #28 give `["react","vue"]`; every other PR, #34 included (compatibility files stay browser inputs), gives the same frameworks as the ADR-069 classifier. Any other difference is listed and justified in the Stage 2 closeout. This replay, not research §3.5's 19%, is the measured share                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Local script output             |
| AC2.4 | `affected-packages.test.mjs`: the CLI with `--event push` prints all 17 packages without calling git; without `--event` it is unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Local                           |
| AC2.5 | `pnpm run test:scripts`, `pnpm run lint`, `prettier --check .`, `actionlint` pass. Every R7 `if:` uses `!= 'docs'` or `!= '[]'`, never an equality with `full`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Local                           |
| AC2.6 | On the Stage 2 PR, which changes `classify-changes.mjs`: `scope=full`; all three track-a and all three SSR jobs run with both R5.3 steps applied, their logs listing the removed files and packages, and pass with the same test counts as the Stage 1 push run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Real GitHub run                 |
| AC2.7 | On the push run after merge: pack/install integrity lists 17 packages; all frameworks run; `ci-extended` steps run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Real GitHub run                 |
| AC2.8 | On a docs-only PR after Stage 2 merges: the `ci-extended` steps after install are skipped and the job succeeds; SSR and track-a are skipped; `ci` succeeds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Deferred per §9.4               |
| AC2.9 | The first real PR that gives `frameworks=[]` with `scope=full` shows track-a and SSR skipped and `ci` green. Monitoring only, not a closure condition (§9.4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Real GitHub run when one occurs |

### Stage 3

| ID    | Criterion                                                                                                                                                                                                                                                    | Evidence         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| AC3.1 | With `TRACK_A_FRAMEWORK=vue`, the resolved config's `webServer` is exactly `[vue-storybook]`. With both variables unset, it is unchanged (three Storybook and three SSR entries). With `TRACK_E_SSR_FRAMEWORK` set, it is unchanged. An invalid value throws | Local            |
| AC3.2 | On the Stage 3 PR and the following push run, each track-a log shows only its own framework's Storybook server, and every test count matches R11                                                                                                             | Real GitHub runs |
| AC3.3 | The Stage 3 closeout records the R11 measurements against research §3.2, and the CO-8 trigger outcome                                                                                                                                                        | Closeout record  |

### 9.4 Evidence that completes after a stage's own runs

Three criteria need a kind of PR that a stage's own PR cannot be. Each stage closeout records them explicitly as **pending**, with the reason, and cannot record them as met.

| Criterion | Needs                                                   | Pending allowed in                 | Completed in                                                                                                                                                                                                                            |
| --------- | ------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1.3 (b) | a docs-only PR after Stage 1 merges                     | Stage 1 closeout, Stage 2 closeout | The **Stage 3 closeout PR**, which is docs-only by construction (§8), from its own runs, written into the Stage 3 closeout record before that PR merges. An earlier docs-only PR may supply it instead; the next closeout then cites it |
| AC2.8     | a docs-only PR after Stage 2 merges                     | Stage 2 closeout                   | The Stage 3 closeout PR, as above                                                                                                                                                                                                       |
| AC2.9     | a PR that changes only tooling packages or listed paths | any closeout                       | Monitoring only. The first such PR is cited in the next CI closeout. Until then, AC2.1, AC2.3 and AC2.6 are the closure evidence for rules 3 and 4                                                                                      |

Closure conditions:

- **Stage 1** closes with AC1.1, AC1.2, AC1.3 (a), AC1.4, AC1.5 and AC1.6 met.
- **Stage 2** closes with AC2.1 to AC2.7 met.
- **Stage 3**, and with it the whole Spec, closes only when AC3.1 to AC3.3, AC1.3 (b) and AC2.8 are met. Only AC2.9 may still be pending at that point.

## 10. Spec Review record

**Round 1 (user, 2026-10-20): not approved.** Findings and resolutions:

| ID   | Finding                                                                                                                                                                                                                                     | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SR-1 | R5.2–R5.3 (revision 1) narrowed any `docs/` or `scripts/` path that a literal scan did not find. A computed-path or otherwise unmodeled browser input could be classified as safe to skip. A full push run is a backstop, not a substitute. | The literal scans (browser scripts, browser docs) are removed. Outside `packages/`, only the closed `NON_BROWSER_PATHS` list narrows (R5.2), and the browser jobs physically remove those files on every run (R5.3), so no browser result can depend on them. Every other path runs all three (R5.4 rule 5). R5.5 restates the guarantees. Tests: AC2.1 and AC2.2; real-run proof of the list: AC2.6. A probe on 2026-10-20 found that track-a's whole-workspace build uses `skills/` (the `ai` build writes into it) and the compatibility-manifest files, so they are not listed; AC2.3's expected replay changes accordingly (#28 → react, vue; #34 → all) |
| SR-2 | AC1.3 and AC2.8 need later docs-only PR evidence; their status at each stage closeout was unclear.                                                                                                                                          | §9.4 says which evidence may stay pending at which closeout and where it completes: the Stage 3 closeout PR, docs-only by construction. AC1.3 is split into (a), at Stage 1, and (b), deferred. AC2.9 is monitoring only, never a closure condition                                                                                                                                                                                                                                                                                                                                                                                                           |

**Round 2 (in-session re-review of revision 2, 2026-10-20):** one open finding, awaiting the user.

| ID   | Finding                                                                                                                                                                                                                                                                                             | State                                                                                                                                                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SR-3 | R5.4 rule 3 narrows `packages/` paths by the dependency closure. The closure models module imports only, so a framework's tests or Storybook reading another package's files by filesystem path is unmodeled, which is the SR-1 class of gap. Physical exclusion (R5.3) does not cover `packages/`. | Open. Options: (A) drop rule 3, so a non-framework-root `packages/` path runs all three, as under ADR-069; (B) extend R5.3 to remove out-of-closure packages after Build. The AC2.3 replay shows no historical PR depends on rule 3 |

**Round 3 (in-session re-review of revision 3, 2026-10-20), after the user asked for SR-3 to be resolved from evidence (research §13):**

| ID   | Finding                                                                                                                                                                                                                                                                        | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SR-3 | (round 2)                                                                                                                                                                                                                                                                      | **Resolved.** ADR-069 placed no constraint on narrowing non-required jobs by package; tooling packages ran all three only by Spec R1's default. Evidence (research §13.2): no undeclared or relative cross-package access on the browser surface, and every non-root package is in all three closures or none. Rule 3 now narrows only no-closure packages, and R5.3's second mode removes their contents in the browser jobs after the build, so an unmodeled read fails loudly. Packages in some or all closures run all three. Tests: AC2.1, AC2.2; real-run proof: AC2.6, which also decides the untested pnpm behaviour (§7) |
| SR-4 | Revision 2's `NON_BROWSER_PATHS` listed `scripts/perf/`. All three playgrounds import types from `scripts/perf/browser/harness`, and `playground-angular` type-checks all of `src/**/*.ts` in `ng build`. Removing it would likely break the Angular build in track-a and SSR. | `scripts/perf/` is removed from the list and named under "Excluded on purpose". AC2.1 tests `scripts/perf/x.ts` → all three. The AC2.3 replay is unaffected: no replayed PR touched `scripts/perf/`                                                                                                                                                                                                                                                                                                                                                                                                                               |

No other requirement is affected: R1–R4, R6–R11, §8 and §9.4 are unchanged, and AC2.3's expected results stand.

**Spec Review approved (user, 2026-10-20)** on revision 3.
