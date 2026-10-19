# Affected-Only CI — research and decision record (2026-10-19)

**Status:** Research and verification record for the deferred Affected-Only CI follow-up of Phase 1. The user approved AO-1 to AO-7 on 2026-10-19, as recommended. The record itself changes no workflow, hook, script, branch or GitHub setting. ADR-069 records the decisions. Spec Review later added three dist-reading validators to AO-1's skipped steps (Spec SR-2). It is separate from Phase 2, which has not started.

**Evidence baseline:** `develop` = `origin/develop` = `84fcdce2`; `main` = `03aeb1a6`. Branch protection as of ADR-068 Stage B: `develop` requires `ci`, with `strict: false`; `main` has no required check. **[V]** = checked on 2026-10-19 against this tree, the GitHub API or CI logs. **[D]** = taken from vendor documentation and not exercised here.

## 1. Question

Which existing checks can run only for changed or affected packages, how should root and shared changes widen the scope, and how can the required `ci` check stay reliable without ever being skipped by accident?

Out of scope: fixing any failing check (GAP-094, the `component-metadata` size regression, the Release workflow S3); the Prime study (Phase 2); deferred work S1–S7.

## 2. Verified current state

### 2.1 Workspace and dependency graph

- `pnpm-workspace.yaml` declares `packages/*`, `apps/*`, `tooling/prime-reference/ng` and `tooling/prime-reference/vue`. That is 22 projects: 17 published packages, 3 private playground apps and 2 private reference harnesses with no scripts **[V]**.
- Workspace edges (`workspace:*`) **[V]**:
  - `uix-utils`, `uix-styles` and `component-schema` have no workspace dependencies;
  - `uix-styled`, `uix-data` and `uix-motion` depend on `uix-utils`;
  - `ng-core` depends on `uix-styled` and `uix-utils`;
  - `react-core` and `vue-core` depend on `uix-motion`, `uix-styled` and `uix-utils`;
  - `ng`, `react` and `vue` depend on their core, `uix-data`, `uix-motion`, `uix-styled`, `uix-styles`, `uix-utils` and `themes`;
  - `component-metadata` depends on `component-schema`;
  - `ai`, `cli` and `mcp` depend on both of those;
  - `themes` depends on `uix-styled`, and has **devDependencies** on `react`, `vue` and `uix-styles` (a cross-edge);
  - the apps depend on their framework package, its core and `themes`.
- Every package resolves through its `exports` to `dist/` **[V]**, so a consumer's typecheck and tests need its dependencies **built**. `themes`' `pretest` builds its own dependency closure (`pnpm --filter "@ultimate/themes^..." run build`), and CI's Test step shows those builds **[V]**.
- `scripts/provenance/workspace-graph.mjs` models only `packages/*`, 17 packages. It reads `dependencies` plus `devDependencies` for the queried package, and `dependencies` only for transitive steps **[V]**.

### 2.2 CI workflows

Step times are from CI 39287882521 (PR #44 into `develop`) **[V]**. pnpm runs `-r` scripts in parallel, so a step's time is shorter than the sum of its packages.

| Workflow / job                               | Trigger                           | Required     | Wall time                                                             | Contents                                            |
| -------------------------------------------- | --------------------------------- | ------------ | --------------------------------------------------------------------- | --------------------------------------------------- |
| `CI` / `ci`                                  | push and PR, `main` and `develop` | on `develop` | ≈ 8 min                                                               | 32 steps (§3)                                       |
| `CI` / `ci-extended`                         | same                              | no           | ≈ 4 min                                                               | build, bundle size, coverage, provenance validation |
| `Browser` / `track-a-browser-visual-a11y` ×3 | same                              | no           | ng ≈ 25, vue ≈ 24, react ≈ 6 min (arm64 runner, Playwright container) | full workspace build, then Playwright per framework |
| `Browser` / `track-e-ssr-hydration` ×3       | same                              | no           | ≈ 1 min each                                                          | harness build and SSR Playwright                    |
| `Release`                                    | push to `main`                    | —            | fails at Select mode (S3)                                             | Changesets                                          |
| `perf-stage1.yml`                            | `workflow_dispatch` only          | —            | —                                                                     | not automatic                                       |

That is roughly 70 runner-minutes per PR, whatever the PR changes. Nothing in any workflow is scoped by change, except the pack/install integrity loop (§2.4) **[V]**.

### 2.3 Local Git hooks

- `core.hooksPath` is `.husky/_`, a relative path in the shared repository config (`.git/config`, scope local) **[V]**.
- `.husky/_` is created per checkout by `husky` through `prepare` when `pnpm install` runs. It existed in `ultimate-gitflow-setup` and appeared in this worktree only after `pnpm install` **[V]**.
- **The primary checkout has `node_modules` but no `.husky/_`** **[V]**. Git therefore finds no hooks there and runs none, with no warning. The same is true of any worktree before its first `pnpm install`.
- `.husky/pre-commit` runs `git diff --cached --check && pnpm exec lint-staged`. `.lintstagedrc.json` runs on **staged files only** **[V]**:
  - `eslint --max-warnings=0 --no-warn-ignored` on JS/TS files;
  - `prettier --check --ignore-unknown` on all files;
  - `scripts/check-svg-text-whitespace.mjs` on `.ts`/`.vue` files.
- `.husky/pre-push` runs `pnpm run build && pnpm run typecheck && pnpm run test` across the **whole workspace** **[V]**. It needs Node 24.15.0 (`engine-strict=true`). Under the shell default Node 23.11 it failed during Phase 1 **[V]**.
- No other hooks exist (`.husky/` holds only `pre-commit` and `pre-push`) **[V]**.

### 2.4 Existing affected-package tooling

- `scripts/provenance/affected-packages.mjs` maps a changed path to a package only when it matches `^packages/<name>/`, then adds every reverse-transitive dependent **[V]**. Only the `ci` step "Pack/install integrity (affected)" uses it. That step loops over the result and does nothing when the list is empty **[V]**.
- **Root and shared changes select nothing.** For the real range `61f90979..84fcdce2`, which changed root `package.json`, `.changeset/`, `.github/` and docs, both `computeAffectedPackages` and pnpm's built-in `pnpm --filter "...[61f90979]"` select **zero** projects **[V]**. A lockfile-only or `tsconfig.base.json`-only change behaves the same, by the path rule above. Today that means pack/install integrity is silently skipped for exactly the changes that most need it.
- pnpm 9 supports `--filter "...[<ref>]"`, `--test-pattern` and `--changed-files-ignore-pattern` [D] ([pnpm filtering](https://github.com/pnpm/pnpm/blob/main/pnpm/docs/filtering.md)). It assigns root files to the root project, which no package depends on, so it has the same root-change gap **[V]**.

### 2.5 Which files CI scripts read outside `packages/`

Validators read these paths **[V]**, so a change to them is not "docs only":

- `docs/architecture/PERFORMANCE.md` (size and coverage baselines);
- `ACCESSIBILITY_BASELINE.md` and `research/*-accessibility-preexisting.md` (accessibility gates);
- `SAST_BASELINE.md`;
- `PROVENANCE.md`, `provenance/*.json` and `checksums.json`;
- `compatibility-manifest.json`, `COMPATIBILITY.md` and the compatibility manifest scripts;
- `AGENTS.md` (pointer validation);
- `skills/` (the `ai` package's `validate`).

Generated API docs live under `packages/<fw>/src/**`, not `docs/` **[V]**.

### 2.6 What recent PRs change

For the last 38 PRs merged to `main` (#2–#43) **[V]**:

- 14 (37%) changed only Markdown files that no CI script reads;
- 2 more changed only Markdown, but Markdown that a validator reads (§2.5);
- 7 touched a framework package (`ng`, `react`, `vue` or their cores);
- 3 touched all three frameworks.

Most code PRs touched shared packages, scripts or root configuration.

## 3. Check map

"Affected-only safe" means the check can be narrowed without losing what it protects, given §2.1 and §2.4.

| Check                                                | Where it runs now                           | Protects                                                    | Cost (CI)                       | Affected-only safe?                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Whitespace (`git diff --check`)                      | pre-commit                                  | trailing whitespace and conflict markers in staged files    | < 1 s                           | already staged-only                                                                                                     |
| ESLint                                               | pre-commit (staged); `ci` Lint (whole repo) | lint rules                                                  | 11 s                            | not worth it: config is shared and the run is fast                                                                      |
| SVG text whitespace                                  | pre-commit (staged); `ci` Lint              | SVG text in components                                      | in Lint                         | same as ESLint                                                                                                          |
| Prettier                                             | pre-commit (staged); `ci` Format check      | formatting, including docs                                  | 39 s                            | not worth it: needed for docs too                                                                                       |
| Dependency audit, license, install-script policy     | `ci`                                        | supply chain                                                | 3 s                             | no: depends on the lockfile, not paths                                                                                  |
| Build                                                | pre-push; `ci`; `ci-extended`; Browser      | packages compile; `dist/` for consumers                     | 63 s                            | partly: affected packages plus their **forward** closure; full on root changes                                          |
| Typecheck                                            | pre-push; `ci`                              | type errors                                                 | 27 s (needs Build)              | partly: affected reverse closure, with its forward closure built                                                        |
| Validate generated artifacts                         | `ci`                                        | `ai` skills context, metadata, Vue consumer types           | 30 s                            | partly: per package; `skills/` maps to `ai`                                                                             |
| Metadata drift and coverage report                   | `ci`                                        | API metadata matches source                                 | 2 s                             | no: fast                                                                                                                |
| Unit tests                                           | pre-push; `ci` Test                         | behavior                                                    | 155 s (vue 85, react 82, ng 68) | partly: affected reverse closure; full on root changes                                                                  |
| Pack/install integrity                               | `ci` (already affected-only)                | packed tarballs install                                     | 0 s on recent PRs               | already affected-only, but **silently empty on root changes** (F-2)                                                     |
| Installed CLI/MCP smoke                              | `ci`                                        | installed bins work                                         | 22 s                            | partly: only when `cli`, `mcp`, `ai` or their dependencies change                                                       |
| CodeQL and SAST baseline                             | `ci`                                        | JS security findings                                        | 95 s                            | partly: skip only when no JS/TS changed; keep on push                                                                   |
| Provenance self-tests                                | `ci`                                        | provenance scripts                                          | 24 s (with vendor fetch)        | partly: when `scripts/` or provenance data change                                                                       |
| Boundary, ceiling, compatibility, pointer validators | `ci`                                        | package boundaries, Prime ceiling, compatibility, AGENTS.md | ≈ 3 s                           | no: fast                                                                                                                |
| Bundle size, coverage, provenance validation         | `ci-extended` (non-required)                | baselines and manifests                                     | ≈ 4 min                         | not required; can follow Build/Test scope                                                                               |
| Playwright browser, visual and a11y                  | Browser (non-required)                      | per-framework rendering and a11y                            | 6–25 min per framework          | **yes, per framework**: ng, react or vue only when its framework, core, shared packages, `themes` or root config change |
| SSR hydration                                        | Browser (non-required)                      | per-framework SSR                                           | ≈ 1 min each                    | per framework, as above                                                                                                 |

## 4. Changes that must widen to the full scope

A diff touching any of these runs every check:

- `pnpm-lock.yaml`, root `package.json`, `pnpm-workspace.yaml`, `.npmrc`;
- `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.lintstagedrc.json`;
- `.github/**`, `.husky/**`, `scripts/**`, `playwright*.config.ts`, `tooling/**`, `apps/**`;
- the `docs/` and other paths in §2.5;
- any path the classifier does not recognise (fail closed).

Within `packages/`, a change to a shared package (`uix-*`, `themes`, `component-schema`) widens through the reverse closure. Because of `themes`' devDependency cross-edge, `react` or `vue` changes also reach `themes`' tests (§2.1).

## 5. Required checks and skip safeguards

- **Workflow-level path filters break required checks** [D]. If `on.pull_request.paths` or `paths-ignore` stops a workflow from running, its required check never reports, and the PR waits for it indefinitely ([GitHub: handling skipped but required checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/troubleshooting-required-status-checks#handling-skipped-but-required-checks)).
- **A job skipped by `if:` reports success** [D]. A required job that a conditional skips therefore **passes** the protection rule. Gating the `ci` job itself on a change classification could silently pass a PR that ran nothing.
- **`strict: false`** means a PR is not re-tested after `develop` moves **[V]**. Two PRs that each pass alone can break together. The push run on `develop` after each merge is today's only post-merge signal.
- **ADR-052 X-12** reads tranche evidence from the merge commit's `CI` and `Browser` runs (ADR-068) **[V]**. Push runs must stay full for that evidence to exist.

## 6. Findings

1. **F-1: no check is scoped today.** Every PR, including the 37% that change only Markdown, spends about 8 minutes in the required `ci` and about 70 runner-minutes overall.
2. **F-2: the existing affected logic fails open on root changes.** A lockfile, root `package.json`, `tsconfig.base.json` or `scripts/` change selects zero packages, and pack/install integrity then runs for nothing. pnpm's own filter has the same gap.
3. **F-3: the browser jobs are the largest cost and the safest to scope.** They are per framework and non-required, and push runs keep full X-12 evidence.
4. **F-4: package-level scoping inside `ci` saves little.** Build (63 s) is needed for the forward closure anyway. For the PRs in §2.6, that leaves at most the vue/react/ng test time on the single-framework PRs, about 2–3 minutes.
5. **F-5: local hooks are silently off in the primary checkout** (§2.3). Pre-push protection holds only where `pnpm install` ran husky, and only under Node 24.15.0.
6. **F-6: skipping must happen at step level inside an always-running `ci` job.** A path filter can block merges forever (§5). An `if:` on the job can pass them silently.

## 7. Options and recommendations

These are the researcher's recommendations, not decisions.

| ID   | Decision                                                       | Options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Recommendation                                                                                                                               |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AO-1 | Required `ci`: docs-only fast path                             | (a) one classification step at the start of `ci` sets `scope=docs` only when **every** changed path is Markdown outside `packages/`, `apps/`, `skills/` and §2.5, and `scope=full` otherwise (including errors, empty diffs and pushes); with `scope=docs`, the expensive steps (Build, Typecheck, Validate generated artifacts, Test, Pack/install, Installed smoke, CodeQL/SAST, vendor fetch and provenance self-tests) are skipped at **step** level, while install, supply chain, Lint, Format and the fast validators always run; (b) no fast path | **(a)**. It covers 37% of recent PRs, cuts them from about 8 to about 2 minutes, and keeps the `ci` job and its check name always reporting. |
| AO-2 | Browser workflow scope on PRs                                  | (a) a classification job decides which frameworks run: a framework, its core or its app runs that framework; a shared package, `themes`, a root or unknown path runs all three; docs-only runs none; pushes always run all; (b) unchanged                                                                                                                                                                                                                                                                                                                | **(a)**. The jobs are non-required, so a skipped one cannot block or falsely pass a protected merge, and push runs keep X-12 evidence.       |
| AO-3 | Package-level scoping of Build, Typecheck and Test inside `ci` | (a) defer, revisit with measured data after AO-1 and AO-2; (b) do it now with pnpm `--filter "...[origin/$BASE]"` plus the §4 widening                                                                                                                                                                                                                                                                                                                                                                                                                   | **(a)**. It saves at most about 2–3 minutes (F-4) and adds the most risk.                                                                    |
| AO-4 | Root-change gap in `affected-packages.mjs` (F-2)               | (a) when §4 matches, return every package; (b) leave it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **(a)**. It is a fail-open defect in an existing check. The fix is small and shares the classifier rules with AO-1.                          |
| AO-5 | Classifier location and tests                                  | (a) one pure function in `scripts/provenance/` (for example `classify-changes.mjs`) with `node --test` cases, used by both workflows; (b) inline shell in YAML                                                                                                                                                                                                                                                                                                                                                                                           | **(a)**. It matches the `affected-packages.mjs` and `workspace-graph.mjs` pattern and is testable.                                           |
| AO-6 | Push runs and `strict: false`                                  | (a) keep every push run on `main` and `develop` full, with `strict: false` unchanged; (b) turn on `strict: true`                                                                                                                                                                                                                                                                                                                                                                                                                                         | **(a)**. Strict mode forces re-runs on every `develop` move. Full push runs already give the post-merge signal.                              |
| AO-7 | Local hooks (F-5)                                              | (a) document in `AGENTS.md` that `pnpm install` under Node 24.15.0 is needed in each checkout or worktree before work, and that hooks are absent otherwise; (b) also scope pre-push to affected packages; (c) leave it                                                                                                                                                                                                                                                                                                                                   | **(a)**. It is the smallest fix for a silent gap. Option (b) would carry AO-3's risk into hooks.                                             |

**What would stop running under these recommendations:**

- on docs-only PRs (AO-1), the expensive `ci` steps listed above;
- on PRs, the Browser jobs of frameworks that did not change (AO-2).

Every push run stays full, and every always-run check still runs on every PR.

## 8. Limits

- The two GitHub behaviors in §5 come from GitHub documentation and were not exercised in this repository.
- The savings estimates use one run's step times and the recent PR mix in §2.6; future PRs may differ.
- Whether `actions/checkout` with `fetch-depth: 0` gives the classifier a correct merge base on every PR is expected but not yet run. The base-ref mechanism already works for `affected-packages` (CI 39287882521, `origin/develop`) **[V]**.
