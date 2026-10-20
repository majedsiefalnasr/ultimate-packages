# CI/CD optimization — research record (2026-10-20)

**Status:** Research only. Authorized by the user on 2026-10-20 as a comprehensive study of the CI/CD system. It changes no workflow, script, hook, branch protection, repository setting or release configuration. The user approved the recommended direction for CO-1 to CO-13 on 2026-10-20, with the recommendations and deferrals in §9 (decision state below §9). ADR-070 records the decisions; `docs/superpowers/specs/2026-10-20-ci-cd-optimization-design.md` and `docs/superpowers/plans/2026-10-20-ci-cd-optimization.md` implement them. It is not Phase 2 and does not resume deferred S1–S7.

**Baseline (binding, not re-litigated):** ADR-068 (Gitflow, required `ci`), ADR-069 (change-scoped CI), the Affected-Only CI Spec revision 2 with Amendment A1, Plan revision 2, and the closeout record `2026-10-19-affected-only-ci-closeout.md`. Where this record proposes changing a rule those documents fixed, §10 names the rule and the evidence.

**Evidence baseline:** `develop` = `origin/develop` = `ee8e0897`; `main` = `origin/main` = `03aeb1a6` (`develop` is 15 commits ahead). **[V]** = checked on 2026-10-20 against this tree, the GitHub API or CI logs. **[D]** = vendor documentation, not exercised here. **[E]** = estimate derived from measured numbers; the derivation is stated.

## 1. Questions

1. Which checks should run for which changes, and where is scoping safe beyond ADR-069?
2. Which browser, visual, accessibility and SSR work is needed per change type, and what is redundant?
3. Do the check names make purpose, scope and requiredness clear, and can they change safely?
4. What validation level fits each Gitflow event (local, PR → `develop`, push `develop`, PR → `main`, push `main`)?
5. What do runs cost now, where is the critical path, and which optimizations are measured versus estimated?

## 2. Inventory

### 2.1 Workflows and jobs [V]

| Workflow (`name`) | File              | Trigger                         | Job ID → check name shown on PRs                                                  | Required                 | Runner                                   |
| ----------------- | ----------------- | ------------------------------- | --------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------- |
| `CI`              | `ci.yml`          | push + PR, `main` and `develop` | `ci` → `ci`                                                                       | **on `develop` only**    | `ubuntu-latest`                          |
| `CI`              | `ci.yml`          | same                            | `ci-extended` → `ci-extended`                                                     | no (red by design, §2.4) | `ubuntu-latest`                          |
| `Browser`         | `browser.yml`     | same                            | `changes` → `changes`                                                             | no                       | `ubuntu-latest`                          |
| `Browser`         | `browser.yml`     | same                            | `track-a-browser-visual-a11y` → `track-a-browser-visual-a11y (ng\|react\|vue)`    | no                       | `ubuntu-24.04-arm` + Playwright 1.63 img |
| `Browser`         | `browser.yml`     | same                            | `track-e-ssr-hydration` → `track-e-ssr-hydration (ng, playground-angular)` (etc.) | no                       | `ubuntu-latest`                          |
| `Release`         | `release.yml`     | push `main`                     | `select-mode` → `Select mode`; `version` → `Version`; `publish` → `Publish`       | —                        | `ubuntu-latest`                          |
| `Perf Stage 1`    | `perf-stage1.yml` | `workflow_dispatch` only        | `stage1` → `stage1`                                                               | —                        | `ubuntu-24.04-arm` + Playwright img      |

- Only `ci`, `ci-extended`, `changes`, `Select mode`, `Version`, `Publish` and `stage1` have stable names. The `ci` job has no `name:`, so its check name is its ID **[V]**.
- No workflow sets `concurrency` except `perf-stage1.yml`, and no job sets `timeout-minutes` (GitHub default 360 min) **[V]**.
- `Release` runs on every push to `main`, in parallel with `CI`, without waiting for it. MIGRATION §7.4 records this as the open fail-closed gap **[V]**.

### 2.2 Branch protection and settings [V]

| Branch    | Required checks           | Strict | Approvals | Admins enforced |
| --------- | ------------------------- | ------ | --------- | --------------- |
| `develop` | `ci` (GitHub Actions app) | false  | 0         | yes             |
| `main`    | none                      | —      | 0         | yes             |

- Default branch `develop`; no rulesets; default workflow token permission `read`.
- The repository is **public**. GitHub-hosted standard runners, including arm64, are free for public repositories, so the cost here is wall time, queue pressure and concurrency limits, not billing **[D]**.
- Observation outside this study's scope: the repository still allows squash and rebase merges, while ADR-068 and `AGENTS.md` §7.3 say merge commits only. Nothing here changes it.

### 2.3 `ci` job steps and gating (ADR-069) [V]

33 steps after setup. With `scope=docs` on a PR, the 16 ADR-069 steps are skipped; the rest always run:

- **Always:** install, audit, license, install-script policy, Lint, Format check, package boundary, Prime ceiling, CLI/MCP/AI boundaries, AGENTS.md pointers.
- **Gated (`scope != 'docs'`):** Build, Typecheck, Validate generated artifacts, Metadata drift + coverage report, Test, affected packages, pack/install integrity, installed CLI/MCP smoke, CodeQL init/analyze, SARIF resolve, SAST baseline, vendor fetch, provenance self-tests, compatibility manifest.

### 2.4 `ci-extended` and its known failures [V]

Build, bundle-size measure + regression, coverage measure + regression, provenance validation. It fails on every run in two known steps (bundle size: `component-metadata` +26.5%; provenance: GAP-094). It is **not** gated by ADR-069: it ran 2.9–4.1 min on both docs-only PR #47 runs and turned the `CI` workflow red there.

### 2.5 Local hooks [V]

- `pre-commit`: `git diff --cached --check && lint-staged` (ESLint, Prettier check and SVG-whitespace on staged files).
- `pre-push`: `pnpm run build && pnpm run typecheck && pnpm run test`, whole workspace, regardless of change. In CI the same three steps take ≈ 2.7 min (42 + 17 + 101 s, run 39303955225).
- Hooks run only where `pnpm install` created `.husky/_` (ADR-069, AO-7).

## 3. Measured baseline

Window: every `CI` and `Browser` run since the Gitflow setup PR (2026-10-19 13:48 UTC to 20:34 UTC), 27 runs, all jobs **[V]**.

### 3.1 Per run

| Run type                    | Required `ci` wall | `CI` runner-min | `Browser` runner-min | Longest job (critical path) |
| --------------------------- | ------------------ | --------------- | -------------------- | --------------------------- |
| Full PR → `develop` (n = 7) | 6.2–8.6 min        | 10–12           | 60–63                | track-a ng, 25.9–26.6 min   |
| Docs-only PR (n = 2)        | 0.9–1.2 min        | 4–5             | 4                    | `ci-extended`, 2.9–4.1 min  |
| Push `develop` (n = 5)      | 5.7–8.9 min        | 9–13            | 60–63                | track-a ng, 25.5–26.7 min   |
| Push `main` (n = 1)         | 8.2 min            | 12              | 59                   | track-a ng, 25.5 min        |

- A docs-only merge still costs a full push run (≈ 72 runner-min): PR #47's merge push 39320417160/39320417193 **[V]**. ADR-069 (AO-6) chose this.
- Browser reliability: since GAP-097/098 were resolved (2026-10-15), every track-a and SSR job in the window passed, and the three track-a logs of run 39308302789 report 0 flaky tests under `retries: 2`. Before that, 108 of 312 track-a jobs failed, all in the then-known G3-B/G3-D steps (2026-10-12 to 10-15) **[V]**.

### 3.2 Where track-a time goes (run 39308302789, push `develop`) [V]

| Segment                                      | ng                 | vue                | react            |
| -------------------------------------------- | ------------------ | ------------------ | ---------------- |
| Container init + checkout + install          | ≈ 50 s             | ≈ 45 s             | ≈ 47 s           |
| `pnpm run build` (all 20 workspace projects) | 47 s               | 44 s               | 47 s             |
| Strict suite (`--grep-invert` tranches)      | 342 s, 435 tests   | 282 s, 396 tests   | 253 s, 294 tests |
| G3-A … G3-E tranche steps (6 invocations)    | 1 120 s, 945 tests | 1 036 s, 966 tests | —                |
| W1 (react)                                   | —                  | —                  | 53 s, 24 tests   |
| **Job total**                                | **25.7 min**       | **23.7 min**       | **6.8 min**      |

- Each `npx playwright test` invocation spends **33–35 s before its first test**: ng's 7 invocations spend 239 s, ≈ 16% of the job, measured from step start to Playwright's `Running N tests` line.
- `playwright.config.ts` starts **all three** Storybook dev servers (ng webpack, react and vue Vite) for every track-a invocation; only SSR runs filter servers (`TRACK_E_SSR_FRAMEWORK`). So the vue and react jobs start the Angular webpack Storybook up to 7 times for nothing; the vue job's log holds 3 457 `[ng-storybook]` lines **[V]**. Because `TRACK_E_SSR_FRAMEWORK` is unset in track-a, the same `webServer` array also includes all three SSR harness servers (ports 6011–6013), which no track-a spec uses (no `packages/*/e2e` file references those ports) **[V]** (config and grep; their startup is not visible in the logs because Playwright does not print their stdout).
- Playwright uses 2 workers on the 4-vCPU arm64 runner (its default of half the cores) **[V]** for the count, **[D]** for the runner size.
- After the strict suite, `playwright-report/` is overwritten by each tranche invocation and never uploaded again. A failing tranche step leaves only its accessibility JSON, not its HTML report or traces **[V]**.

### 3.3 `ci` critical path (run 39303955225, full PR) [V]

Setup 22 s → Lint 8 s → Format 25 s → Build 42 s → Typecheck 17 s → Validate 19 s → Test 101 s → pack/install 33 s → smoke 15 s → CodeQL 65 s → vendor + self-tests 17 s → validators ≈ 3 s. Total 6.2 min, all serial. Test and CodeQL are 45% of it.

### 3.4 Duplicated work across one full run [V]

- `pnpm run build`: 5× (ci, ci-extended, 3× track-a), plus 3 partial builds in SSR.
- Unit tests: 2× (`ci` Test 101–161 s; `ci-extended` Coverage measurement 104–155 s runs the same suites with `--coverage`).
- Install: 9 jobs, 6–9 s each with the pnpm store cache; setup is already cheap.

### 3.5 What changes in practice (43 merged PRs, #1–#47) [V]

| Change mix                                                                                  | PRs      | Today's Browser scope (AO-2) |
| ------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| Docs-only Markdown                                                                          | 16 (37%) | none                         |
| Markdown plus tool-read docs/data only (`PROVENANCE.md`, `provenance/*.json`, `DECISIONS`…) | 7 (16%)  | all three                    |
| Tooling package only (`cli`/`mcp`) with docs                                                | 1        | all three                    |
| Root config, workflow, scripts, or mixed with frameworks/shared UI                          | 18       | all three                    |
| Single framework (vue) with docs                                                            | 1        | vue                          |

The 8 PRs in rows 2–3 (19%) changed nothing that a browser job builds, serves or reads, but each ran ≈ 60 Browser runner-minutes and kept the PR's last check open for ≈ 26 min.

## 4. Current behavior and its limitations

1. **L-1 Browser scoping is coarse.** Any path outside the three framework prefixes selects all three frameworks (Spec R1). The browser jobs' real inputs are narrower: the framework packages, their cores, `uix-*`, `themes`, the playground apps, `playwright.config.ts`, `browser.yml`, the accessibility validators and baselines, root config and the lockfile. `ai`, `cli`, `mcp`, `component-metadata`, `component-schema`, `skills/`, provenance data, `PERFORMANCE.md` and most of `scripts/` are not in the browser dependency closure (§3.5; package edges checked in each framework's `package.json`) **[V]**.
2. **L-2 Track-a pays repeated fixed costs.** 7 invocations × 3 servers per framework job (§3.2).
3. **L-3 The critical path is one job.** track-a ng at ≈ 26 min sets the time to an all-green PR; the required `ci` is 6–9 min.
4. **L-4 Docs-only PRs still run `ci-extended` and SSR,** ≈ 8 runner-min, and their `CI` workflow shows red because of `ci-extended`.
5. **L-5 Push runs' diff-based checks are vacuous.** On a push, `BASE` is the pushed branch, so `merge-base == HEAD` and the diff is empty: pack/install integrity selects no package (ADR-069 consequence, Spec A1), and the ADR-061 provenance diff check passes trivially. Size and coverage regression still compare against the recorded `PERFORMANCE.md` baseline, so they keep meaning **[V]**.
6. **L-6 PRs into `main` get the docs fast path.** The classifier ignores the base branch, so a docs-only `hotfix/*` PR into `main` skips Build, Test and CodeQL. No such PR has happened yet. `main` has no required check, so any red would not block anyway **[V]**.
7. **L-7 No concurrency control.** A new push to a PR starts new runs while the old ones keep going: 15 PR branches had 2–5 `CI` runs each. Five pushes to `main` within 2 minutes on 2026-10-18 each started full CI and Release **[V]**.
8. **L-8 No job timeouts.** A hung Storybook or SSR server holds a runner up to 360 min **[V]** (default from **[D]**).
9. **L-9 Tranche failures lose their reports** (§3.2).
10. **L-10 Names do not say purpose, scope or requiredness.** `track-a`/`track-e` are internal plan labels; the SSR check carries the playground directory; `ci-extended` reads as "more of `ci`" though it is advisory and red by design; when track-a is skipped, the PR shows one unexpanded `track-a-browser-visual-a11y` row.
11. **L-11 Local and CI validation differ in shape, not in content.** Pre-push repeats the whole-workspace Build/Typecheck/Test that CI also runs, including for docs-only pushes; this is consistent but slow, not a gap.

## 5. Proposed architecture

Three tiers, one classifier, unchanged required-check contract:

| Tier           | When                                     | What runs                                                                                                                      |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **T-local**    | pre-commit / pre-push                    | Staged lint/format; Build/Typecheck/Test (optionally skipped for docs-only pushes, CO-12)                                      |
| **T-affected** | PR → `develop`                           | Required `ci` with ADR-069 docs gating; advisory jobs scoped by the classifier's per-consumer outputs (frameworks, docs scope) |
| **T-full**     | push `develop`, PR → `main`, push `main` | Everything, all frameworks; diff-based package selection replaced by "all packages" (CO-5, CO-6)                               |

Classifier extensions (same module, same fail-closed rules: push, empty diff, error or unknown path ⇒ full):

- `frameworks` computed from a **browser-input allowlist**: framework/core/app prefix ⇒ that framework; `uix-*`, `themes`, root config, lockfile, `playwright.config.ts`, `browser.yml`, `.husky/`, accessibility baselines and validators, any unknown path ⇒ all three; a **listed** non-browser path (`packages/{ai,cli,mcp,component-metadata,component-schema}/`, `skills/`, `docs/architecture/provenance/`, `PERFORMANCE.md`, `PROVENANCE.md`, `SAST_BASELINE.md`, `COMPATIBILITY.md`, `compatibility-manifest.*`, `ci.yml`, `release.yml`, `perf-stage1.yml`, and scripts not used by `browser.yml`) ⇒ none (CO-1).
- `scope=full` whenever the base is `main` (CO-5).

Browser workflow:

- Track-a starts only its own framework's Storybook server (CO-7).
- Optional sharding of ng and vue into suite groups (CO-8), keeping each tranche's specs and its validator in the same job so the differential contracts are untouched.
- SSR scoped by the same `frameworks` output (CO-2).
- HTML reports uploaded per invocation (CO-9).

Both workflows: `concurrency` that cancels superseded **pull-request** runs only, never push runs (CO-3); `timeout-minutes` on every job (CO-4).

### 5.1 Naming convention (CO-10)

Rule: **workflow = domain; job display name = what it proves, then scope in parentheses; job IDs and the required name `ci` stay unchanged.** Required status is shown by GitHub itself, so names carry "advisory" only where a job can be red by design.

| Today (check name on a PR)                       | Proposed display name (`name:`)                    | Why                                                                 |
| ------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------- |
| `ci`                                             | `ci` (unchanged; add `name: ci` to pin it)         | Required context; renaming needs a protection change (§10)          |
| `ci-extended`                                    | `Baselines (advisory): size, coverage, provenance` | Says what it measures and that red is expected                      |
| `changes`                                        | `Classify changes`                                 | Matches the step and the script                                     |
| `track-a-browser-visual-a11y (ng)`               | `Playwright visual + a11y (ng)`                    | Says the tool and what it checks; framework stays the matrix suffix |
| `track-a-browser-visual-a11y` (skipped)          | `Playwright visual + a11y` (skipped)               | Readable when no framework changed                                  |
| `track-e-ssr-hydration (ng, playground-angular)` | `SSR hydration (ng)`                               | Drops the directory; name set with `matrix.framework`               |
| `Select mode` / `Version` / `Publish`            | unchanged                                          | Already clear                                                       |
| `stage1`                                         | `Perf Stage 1 measurement`                         | Manual only; clarity in the Actions tab                             |

Steps: keep every step name that an ADR or closeout cites as evidence (`Build`, `Typecheck`, `Test`, `Coverage measurement`, `Accessibility baseline validation`, the `G3-* … verification specs` and `differential accessibility validation` steps); rename only uncited ones, for example `Run Playwright projects (ng)` → `Playwright strict suite (ng: chromium, firefox, webkit)`, `Pack/install integrity (affected)` → `Pack/install integrity (affected packages)`. Earlier records keep their old names, as ADR-068 did for the moved jobs. Whether GitHub appends matrix values to a `name:` without a matrix expression, and how a skipped matrix job's name renders, is **[D]**-level knowledge not exercised here; the implementation must verify it on a real run before any closeout relies on it.

## 6. Change type × event matrix (proposed)

Legend: **R** run, **S** scoped (frameworks or packages from the classifier), **—** skipped, **A** all frameworks/packages. "Quick" = install, supply chain, Lint, Format, fast validators. "Core" = the 16 ADR-069-gated `ci` steps.

### 6.1 PR → `develop` (T-affected)

| Change type                                                                                                                        | Quick | Core | Pack/install        | `ci-extended` | Track-a  | SSR      |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----- | ---- | ------------------- | ------------- | -------- | -------- |
| Docs-only Markdown                                                                                                                 | R     | —    | —                   | — (CO-2)      | —        | — (CO-2) |
| Tool-read docs/data (`PROVENANCE.md`, `provenance/*.json`, `PERFORMANCE.md`, `SAST_BASELINE.md`, compatibility files, `AGENTS.md`) | R     | R    | A                   | R             | — (CO-1) | — (CO-1) |
| Accessibility baselines / preexisting lists                                                                                        | R     | R    | A                   | R             | A        | A        |
| One framework (package, core or app)                                                                                               | R     | R    | S (reverse closure) | R             | S        | S        |
| Shared UI (`uix-*`, `themes`)                                                                                                      | R     | R    | S                   | R             | A        | A        |
| Tooling package (`ai`, `cli`, `mcp`, `component-*`, `skills/`)                                                                     | R     | R    | S                   | R             | — (CO-1) | — (CO-1) |
| `scripts/` used only by `ci.yml`                                                                                                   | R     | R    | A                   | R             | — (CO-1) | — (CO-1) |
| `scripts/` used by `browser.yml`, `browser.yml`, `playwright*.config.ts`                                                           | R     | R    | A                   | R             | A        | A        |
| `ci.yml`, `release.yml`, `perf-stage1.yml`                                                                                         | R     | R    | A                   | R             | — (CO-1) | — (CO-1) |
| Root config, lockfile, `.husky/`, `.npmrc`                                                                                         | R     | R    | A                   | R             | A        | A        |
| `.changeset/*.md` only                                                                                                             | R     | —    | —                   | —             | —        | —        |
| Unknown path, empty diff, classifier error                                                                                         | R     | R    | A                   | R             | A        | A        |

Changes against today are marked with their decision ID; every other cell is today's ADR-069 behavior.

### 6.2 Other events

| Event                                            | Level      | Notes                                                                                                 |
| ------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------- |
| Local pre-commit                                 | staged     | unchanged                                                                                             |
| Local pre-push                                   | full B/T/T | unchanged; optional docs-only skip (CO-12)                                                            |
| Push `develop`                                   | **T-full** | unchanged (AO-6) except pack/install = all 17 packages (CO-6). Source of ADR-052 X-12 evidence        |
| PR → `main` (`release/*`, `hotfix/*`)            | **T-full** | new: no docs fast path, all frameworks (CO-5). Advisory on `main` until `ci` is required there        |
| Push `main` (merge of release/hotfix/Version PR) | **T-full** | unchanged except CO-6. Release evidence; `Release` still runs in parallel (MIGRATION §7.4, unchanged) |
| Version Packages PR (`GITHUB_TOKEN`)             | none       | GitHub starts no runs for it **[D]**; unchanged, S3 scope                                             |
| Back-merge PR `main` → `develop`                 | T-affected | its diff (version bumps, changelogs under `packages/`) classifies `full` with the touched frameworks  |

**Should a merge into `main` always validate the whole repository?** Yes, and it already does on the push (AO-6), with two holes: the push's diff-based package selection is empty (L-5, fixed by CO-6), and the PR into `main` can take the docs fast path (L-6, fixed by CO-5). Running T-full on the PR as well costs little, because release and hotfix PRs are rare, and it gives a pre-merge signal on the branch that publishes. It does not replace the missing required check on `main`, which stays blocked on the release token (S3).

## 7. Approaches compared

| ID  | Approach                                                                                  | Benefit                                                                                    | Cost / risk                                                                                                                                                                                                      | Runtime impact                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A0  | Keep ADR-069 as is                                                                        | No work, no new risk                                                                       | L-1 to L-10 remain                                                                                                                                                                                               | —                                                                                                                                                                       |
| A1  | **Refine scoping and hygiene:** CO-1 to CO-6, CO-9                                        | Removes the largest avoidable runs; closes L-5/L-6 fail-open holes; green `CI` on docs PRs | Classifier allowlist must be maintained: a new browser input not on the list still routes to "all" (fail-closed), but a listed path that later becomes a browser input would under-run until the list is updated | **[E]** 19% of PRs save ≈ 60 Browser runner-min and ≈ 18 min to all-green (§3.5); docs PRs drop from ≈ 9 to ≈ 1.5 runner-min (§3.1); push runs +33 s (measured, PR #46) |
| A2a | **Framework-filtered Storybook servers (CO-7)**                                           | Removes up to 6 Angular webpack starts from vue and react jobs; less CPU contention        | Config change mirrors the existing SSR filter; low risk                                                                                                                                                          | **[E]** vue −2 to −3 min, react −0.5 to −1 min, ng ≈ 0 (its own server dominates startup)                                                                               |
| A2b | **Shard ng and vue track-a into 3 suite groups (CO-8)**                                   | Critical path ≈ 26 → ≈ 11–12 min                                                           | +4 jobs per full run; artifact names must be unique per shard; X-12 evidence is read across more job names; a fan-in is not needed if each tranche stays whole in one shard                                      | **[E]** ng: 50 s setup + 47 s build + ≈ ⅓ of 1 462 s tests per shard ≈ 10–12 min; +≈ 10 runner-min per full run                                                         |
| A2c | One Playwright invocation per framework instead of 7                                      | Saves ≈ 3.4 min per ng/vue job (6 × 34 s, measured)                                        | The strict baseline validator would read tranche envelopes, which are evidence-listed, never baselined: requires separating envelope directories or filtering, i.e. touching the G3 differential contracts       | measured overhead 239 s (ng); not recommended now                                                                                                                       |
| A2d | More Playwright workers (4 instead of 2)                                                  | Possibly large test-time cut                                                               | Unmeasured; screenshot stability under load unknown; needs a measurement spike first                                                                                                                             | unknown                                                                                                                                                                 |
| A3  | Split required `ci` into parallel jobs behind an always-running aggregator job named `ci` | Required wall time ≈ 6–9 → ≈ 4–5 min                                                       | Aggregator must treat `skipped`/`cancelled` needs as failure unless the classifier skipped them (job-level `if:` on required paths is what ADR-069 forbids); more runner-minutes and builds                      | **[E]** critical path = setup + Build + Test ≈ 3.5–4.5 min; +≈ 5 runner-min                                                                                             |
| A4  | Package-level Build/Typecheck/Test (AO-3)                                                 | Saves part of Test on single-framework PRs                                                 | Highest correctness risk; dist closure still needs building                                                                                                                                                      | **[E]** ≤ 1.5 min (per-framework Test 68–85 s); deferred stays right                                                                                                    |
| A5  | Build cache tool (Turborepo/Nx remote cache)                                              | Reuses builds across jobs                                                                  | New tool and cache trust model; YAGNI at 42–63 s builds                                                                                                                                                          | **[E]** ≤ 1 min per job                                                                                                                                                 |
| A6  | Skip push runs for docs-only merges                                                       | ≈ 72 runner-min per docs merge                                                             | Reverses AO-6; runner minutes are free on this public repo, and push runs block no one                                                                                                                           | no wall-time benefit to developers                                                                                                                                      |

## 8. Recommended direction

1. **Adopt A1** (CO-1 to CO-6, CO-9). It is the biggest measured win per unit of risk, it closes two fail-open holes (L-5, L-6), and it keeps every ADR-069 safeguard: classifier-only decisions, fail-closed defaults, no path filters and no job-level `if:` on the required job.
2. **Then A2a** (CO-7), measure, and **adopt A2b** (CO-8) only if the critical path is still above ≈ 15 min.
3. **Defer** A3 and A2d until A1/A2 have run for a while; reconsider with fresh timings. **Keep** A4 deferred (AO-3). **Reject** A5 and A6.
4. **Naming (CO-10):** set display names on advisory jobs; keep `ci`.

What would stop running under this direction, and the coverage kept:

- On PRs: browser and SSR jobs for changes outside the browser closure (CO-1); `ci-extended` and SSR on docs-only PRs (CO-2). Every push run on `develop` and `main` still runs all of them, so X-12 evidence and ADR-053 AC-1/AC-4/AC-5 CI signals are unaffected.
- Nothing stops running on push events. CO-6 makes pack/install run more on pushes, not less.

## 9. Decisions requiring the user

| ID    | Decision                                      | Options                                                                                                                             | Recommendation                                                                                                                             |
| ----- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| CO-1  | Browser framework selection on PRs            | (a) explicit non-browser allowlist ⇒ none, everything else unchanged; (b) keep Spec R1's rule                                       | **(a)**. Fail-closed by construction: only listed paths narrow.                                                                            |
| CO-2  | Docs-only PRs: `ci-extended` and SSR          | (a) gate `ci-extended`'s Build/measure/validate steps on `scope != 'docs'` and scope SSR by `frameworks`; (b) unchanged             | **(a)**. Both are non-required; push runs keep them full.                                                                                  |
| CO-3  | Concurrency                                   | (a) per-workflow group keyed on PR number, `cancel-in-progress` only for `pull_request`; (b) none                                   | **(a)**. Push runs are evidence and are never cancelled.                                                                                   |
| CO-4  | Job timeouts                                  | (a) explicit `timeout-minutes` (e.g. `ci` 30, `ci-extended` 20, track-a 45 or 25 if sharded, SSR 15); (b) none                      | **(a)**. Values set at ≈ 3× today's maxima.                                                                                                |
| CO-5  | PRs into `main`                               | (a) classifier returns `full`, all frameworks, when the base is `main`; (b) unchanged                                               | **(a)**                                                                                                                                    |
| CO-6  | Pack/install integrity on push                | (a) all 17 packages on push; (b) diff against `github.event.before`; (c) unchanged (ADR-069 consequence)                            | **(a)**: simplest and fail-closed; +33 s measured. (b) breaks on force-push or new-branch events where `before` is missing or all zeros.   |
| CO-7  | Track-a Storybook servers                     | (a) start only the job's framework server, via an env filter like `TRACK_E_SSR_FRAMEWORK`; (b) unchanged                            | **(a)**                                                                                                                                    |
| CO-8  | Track-a sharding                              | (a) after CO-7, split ng and vue into 3 suite groups that keep each tranche whole; (b) not now                                      | **(b) now, revisit after CO-7 timings**. Decide on measured numbers.                                                                       |
| CO-9  | Playwright HTML report per tranche invocation | (a) separate `--output`/report directory and upload per invocation; (b) unchanged                                                   | **(a)**: restores failure diagnostics; no gate change.                                                                                     |
| CO-10 | Naming                                        | (a) display names per §5.1, `ci` unchanged; (b) also rename the required check, with a coordinated protection change; (c) unchanged | **(a)**. (b) needs a separately authorized branch-protection change and a window in which open PRs wait on a check that no longer reports. |
| CO-11 | Required `ci` parallelization (A3)            | (a) research after A1/A2; (b) now                                                                                                   | **(a)**                                                                                                                                    |
| CO-12 | Pre-push hook                                 | (a) skip Build/Typecheck/Test when the classifier says `docs` against `origin/develop`; (b) unchanged                               | **(b)** for now: it is a local convenience, and AO-7 already chose not to scope hooks. Listed so the choice is explicit.                   |
| CO-13 | Push runs after docs-only merges (A6)         | (a) keep full (AO-6); (b) skip                                                                                                      | **(a)**: no change to an accepted decision.                                                                                                |

**Decision state (2026-10-20).** The user approved every recommendation above as written, with these boundaries:

- CO-8 stays deferred until CO-7 is implemented and measured. Sharding is reconsidered only if the critical path is still above about 15 minutes.
- CO-11 stays research-only until the earlier stages have been evaluated.
- CO-12 leaves the hooks unchanged. CO-13 keeps full push runs.
- CO-10 uses option (a): the required check stays `ci`, with no branch-protection change.
- CO-1 must state how the browser-input classification stays correct as dependencies and indirect inputs change. Unknown or uncertain inputs run all frameworks.
- The runtime savings in §7 and §8 stay estimates until real CI runs verify them.

## 10. Conflicts with approved decisions

None of the recommendations reverses an accepted decision. These change rules that approved documents fixed, so each needs its own decision and an ADR-069 amendment or a successor ADR:

| Rule                                                                                  | Source                        | Affected by       | Evidence                                                                                                          |
| ------------------------------------------------------------------------------------- | ----------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| "Any other path adds all three" frameworks                                            | Spec R1                       | CO-1              | §3.5: 8/43 PRs ran all browsers with no browser input changed; package edges in §4 L-1                            |
| `ci-extended`'s content and the SSR jobs are unchanged                                | Spec §3 non-goals, R4         | CO-2              | Non-goals of that Spec, not prohibitions; §3.1 docs-PR cost                                                       |
| "Pack/install integrity checks no package on a push … not changed by" ADR-069         | ADR-069 Consequences, Spec A1 | CO-6              | The ADR itself says a change needs a separate decision; §4 L-5                                                    |
| `scope` ignores the base branch                                                       | Spec R1                       | CO-5              | §4 L-6                                                                                                            |
| Playwright jobs moved "unchanged"; X-12 reads named steps from the merge commit's run | ADR-068, ADR-052 X-12         | CO-7, CO-8, CO-10 | Step names cited by X-12 are kept (§5.1); CO-8 spreads them across more job names, which closeouts must then cite |
| The `ci` check name is stable (F-9) and is the required context                       | ADR-068, Gitflow research F-9 | CO-10 (b) only    | Option (a) keeps it                                                                                               |
| Hooks are not scoped                                                                  | AO-7                          | CO-12 (a) only    | Recommendation keeps AO-7                                                                                         |

Not conflicts, recorded for completeness:

- The `CI` workflow stays red on code PRs and pushes while `ci-extended` carries the two known failures; the `COMPLETION_REGISTER.md` closeout rule is untouched. CO-2 makes it green only on docs-only PRs, because those steps then do not run.
- The `Release` workflow, the `GITHUB_TOKEN` limitation and the missing required check on `main` (MIGRATION §7.4, deferred S3) are unchanged.

## 11. Suggested implementation breakdown (not a plan)

Each stage would need its own Spec, Plan and approvals.

1. **Stage 1, hygiene (YAML only):** CO-3 concurrency, CO-4 timeouts, CO-9 per-invocation reports, CO-10 (a) display names. Verify name rendering, including the skipped matrix row, on one real PR.
2. **Stage 2, classifier:** CO-1 allowlist, CO-5 `main` base rule, new outputs consumed by CO-2 (`ci-extended` gating, SSR matrix) and CO-6 (all packages on push), with `node --test` cases per new rule and the fail-closed cases kept; ADR-069 amendment or ADR-070.
3. **Stage 3, browser speed:** CO-7, then a measured comparison against §3.2; CO-8 only if then decided.
4. **Later, research only:** CO-11 (A3) and A2d (workers), each with fresh timings.

Acceptance evidence for each stage follows the ADR-069 pattern: a real PR in each relevant class (docs-only, tool-read data, tooling package, single framework, shared UI) and the following push run on `develop`.

## 12. Limits

- Timings come from 27 runs on one day; GitHub-hosted runner speed varies.
- §3.5 classifies first-parent merge diffs, which for pre-Gitflow merges into `main` equal the PR diff.
- The browser-input list in CO-1 comes from package manifests, `browser.yml` and `playwright.config.ts`; the implementing Spec must re-derive it, including any script the browser jobs call indirectly.
- All [E] numbers are estimates from measured segments; none of the proposed changes was run.

## 13. Addendum (2026-10-20): package-closure narrowing evidence (Spec Review SR-3)

The user asked whether narrowing by package closure can be made safe and useful, starting from ADR-069's own rationale.

### 13.1 What ADR-069 decided about packages

- **AO-2's rule** (Affected-Only research §7): a framework, its core or its app runs that framework; "a shared package, `themes`, a root or unknown path runs all three". The research's §4 names the shared packages: `uix-*`, `themes`, `component-schema`.
- **Tooling packages** (`ai`, `cli`, `mcp`, `component-metadata`) were not discussed. They reach "all three" through Spec R1's default ("any other path adds all three"), not through a finding that browser jobs use them.
- **ADR-069's binding constraints** apply to the required `ci` job and to fail-closed classification:
  - one tested classifier;
  - unknown, empty, push or error ⇒ everything;
  - no workflow path filters;
  - no job-level `if:` on required jobs.

  None of them forbids narrowing a non-required Browser job by package.

- **ADR-069's rule 2** (a framework root selects only that framework) already assumes that one framework's browser jobs do not read another framework's files. That assumption was not evidenced in 2026-10-19's research.

### 13.2 Evidence on the browser surface

The browser surface is the framework packages and cores, `uix-*`, `themes`, the three playgrounds, their Storybook configs, e2e specs and the Playwright config. Each row was checked against `ee8e0897` **[V]**.

| Check                                                                                         | Result                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ultimate/*` imports in the browser surface versus declared `dependencies`/`devDependencies` | 0 undeclared imports across all 15 projects                                                                                                                                                           |
| Relative imports that leave a project (`../../…`)                                             | Only `import type { PerfRow, PerfState }` from `scripts/perf/browser/harness`, in all three playgrounds' perf pages. No import into another package                                                   |
| Filesystem reads in e2e specs                                                                 | None. `accessibility-envelope.ts` only writes `test-results/`                                                                                                                                         |
| Storybook `stories` globs                                                                     | Own `../src/**` only                                                                                                                                                                                  |
| Storybook `staticDirs`                                                                        | ng and vue serve `tooling/prime-reference/fixtures`, outside every package                                                                                                                            |
| References to tooling packages                                                                | Only comments: the generated `*.api.mdx` headers and story comments naming `component-metadata` sources; `themes` cites a provenance file in a comment                                                |
| Closure shape                                                                                 | Outside the framework roots, every package is in **all three** closures (`uix-*`, `themes`) or in **none** (`ai`, `cli`, `mcp`, `component-metadata`, `component-schema`). No package is in only some |
| How often tooling work is isolated                                                            | 49 of the 73 commits on `develop` that touch a tooling package touch nothing else apart from Markdown. Open PR #38 (Workstream 2, deferred) changes only `packages/cli/` and one research record      |

### 13.3 Conclusions

1. **The closure is safe today.** No browser-surface code reads a package outside its framework's closure.
2. **The remaining failure mode.** A future undeclared read of a tooling package's files, by path, from Storybook, an e2e spec or an SSR harness would be missed by the closure model. The model sees only declared edges.
3. **Making that failure loud.** Delete the contents of every no-closure package in the browser jobs after their build step, on every run. A browser job that comes to depend on such a package then fails on every run. Its Playwright results can never pass while depending on one. Building those packages in track-a's whole-workspace build is not browser evidence; the required `ci` Build step covers it on every non-docs PR.
4. **Partial closures get no narrowing.** None exists today, so treating "in any closure" as "all three" loses nothing measurable. It also avoids extending the deletion to other frameworks, which track-a jobs still start until CO-7 (Stage 3).
5. **The rule is useful.** Tooling-only work is common (§13.2), and the next known PR of that kind (#38) would skip ≈ 60 Browser runner-minutes.
6. **Correction to Spec revision 2's list.** `scripts/perf/` must not be excluded. `apps/playground-angular` compiles `src/**/*.ts` (its `tsconfig.json` `include`), so `ng build` type-checks the perf page that imports `scripts/perf/browser/harness`. Deleting it before the build would likely break the Angular build in track-a and SSR.
7. **ADR-069 needs no change.** Its constraints still hold. ADR-070, which already amends ADR-069's framework rule, carries the refined package rule.

**Limits.** The surface scan is a point-in-time check. Item 3 is what keeps the rule safe afterwards. Whether pnpm's filtered `exec`/`run` commands still work once a package keeps only its `package.json` has not been run; the Stage 2 PR's browser jobs prove it (Spec AC2.6).
