# Implementation Plan: Phase 10 Track C — Migration / Release / Provenance

**Document:** `docs/superpowers/plans/2026-09-10-phase-10-migration-release-provenance-implementation.md`
**Status:** Draft for review (implementation-ready)
**Approved specification:** `docs/superpowers/specs/2026-09-10-phase-10-migration-release-provenance-design.md` (Final Spec Review verdict: APPROVE)
**Baseline:** `main` at `02c60d7` (Track A — Browser/Visual/Accessibility Validation, merged)

**Binding decisions carried forward from the approved specification, not reopened by this plan:**
1. `@ultimate/*` packages are permanently private/restricted npm packages.
2. `.changeset/config.json` remains `access: "restricted"` — no task in this plan touches this file's value.
3. Release authentication is token-based, `NPM_TOKEN` only.
4. OIDC/Trusted Publishing is not part of Track C.
5. `id-token: write` is not required and must not appear in any workflow this plan produces.
6. `--provenance` is not used anywhere in this plan's deliverables.
7. Publish-time npm provenance is structurally foreclosed for this model (three independent, compounding reasons — see spec §7/C5) and is documented, not implemented, by this plan.
8. Migration strategy is documentation-only — no CLI automation.
9. `@ultimate/cli create`, `migrate`, `update` remain deferred, out of scope.
10. Changesets is not redesigned; the package manager (`pnpm@9.6.0`) is not upgraded.

**Tooling-compatibility check performed before writing this plan (per the task's explicit instruction to stop and report rather than silently amend the spec):** every requirement in the approved specification was re-checked against the currently-installed CLI surfaces before scheduling a task for it. `npx changeset --help`, `npx changeset publish --help`, `npx changeset version --help`, and `npx changeset status --help` were re-run directly against this repository's installed `@changesets/cli` this session. Confirmed subcommand/flag surface: `add [--empty] [--open] [--since <branch>] [--message <text>]`, `version [--ignore] [--snapshot <?name>] [--snapshot-prerelease-template <template>]`, `publish [--tag <name>] [--otp <code>] [--no-git-tag]`, `status [--since <branch>] [--verbose] [--output JSON_FILE.json]`. **No task below requires any flag, behavior, or forwarding path beyond this confirmed surface.** No conflict was found between the approved specification and the currently-pinned tooling — every requirement in §5/§6 of the specification is implementable exactly as written with `@changesets/cli` as installed, `pnpm@9.6.0` as pinned, and no additional flags or undocumented behavior. This plan does not stop or report a blocker on this point.

**Plan Review amendment note (this pass — corrects four blockers found in the first-draft plan, none of which touch the approved specification):**
1. **Cross-workflow `needs:` was not valid GitHub Actions syntax** — `needs:` only references jobs within the same workflow file; it cannot reference a job in a separate workflow file. The release flow is now redesigned as **one workflow file, two conditional jobs, gated by a `select-mode` job's output via same-file `needs:`+`if:`** — the exact pattern the Changesets project's own maintainers use in their own production repository (`changesets/action`'s own `.github/workflows/publish.yml`, fetched and read directly this session via `gh api`). Track B's `ci` gate is enforced by GitHub branch protection (a required status check on `main`), not by any in-workflow cross-file dependency — see the corrected Task 4 and §3 below for the exact, evidence-based reasoning.
2. **"Version Packages PR merge" detection was previously left ambiguous** (paths/commit-message/generic-output language) — corrected to the real, deterministic, tool-native mechanism: Changesets' own `select-mode` sub-action decides `"version"` vs. `"publish"` vs. `"none"` purely from repository/registry state (do pending changesets exist? are there unpublished package versions?) — verbatim from its own README, fetched directly this session — never from parsing a commit message or PR title.
3. **Whole-flow review performed** (corrected Task 4, new §3) — every transition now states trigger, prerequisite, authentication, human-approval boundary, failure behavior, and local-vs-external verifiability, per the maintainers' own real `publish.yml`/`ci.yml` composition.
4. **`NODE_AUTH_TOKEN`/`NPM_TOKEN` mechanism re-verified against pnpm 9.6.0 specifically** — `actions/setup-node`'s `registry-url` input is not pnpm-specific in its own README, but pnpm's own official npmrc documentation (fetched directly this session) confirms compatibility via the `NPM_CONFIG_USERCONFIG` bridge. Given this repository's pin predates pnpm's later (v11.5.3+/v11.6+) `.npmrc`-expansion security changes, this plan now specifies the more direct, version-safe, pnpm-native mechanism instead: `pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"` as an explicit workflow step immediately before `changeset publish` — avoiding any dependency on `.npmrc` environment-variable-expansion behavior that differs across pnpm major versions. See corrected Task 4.

None of the four corrections above touch, reopen, or contradict any binding decision from the approved specification (§5 of the task, restated at the top of this document) — they correct this plan's own prior implementation-mechanism choices, which were never part of the specification itself (the specification deliberately deferred exact GitHub Actions composition to this plan).

---

## 1. Task List Overview

| # | Task | Depends on | Parallelizable with |
|---|---|---|---|
| 1 | Add `changeset`/`changeset:version`/`changeset:publish` npm scripts | none | 2, 6 |
| 2 | Create `docs/architecture/MIGRATION.md` | none | 1, 6 |
| 3 | Create `.github/workflows/release.yml` — `select-mode` + `version` jobs | 1 | — |
| 4 | Extend `.github/workflows/release.yml` — `publish` job | 3 | — |
| 5 | Add "Releasing" documentation section (provenance-gap disclosure, whole-flow description, branch-protection prerequisite) | 2, 4 | — |
| 6 | Whole-track verification (local, static, throwaway-changeset, mutation-proof) | 1, 2, 3, 4, 5 | — |

Task 6 is the terminal task; every other task feeds into it. Tasks 1, 2 have no dependency on each other or on any other task and may be done in parallel by separate subagents, per this repository's established subagent-driven-development pattern (Tracks A/B/D precedent). Tasks 3 and 4 are sequential (4 adds the third job to the same workflow file 3 creates, and 4's `publish` job's `if:` condition depends on 3's `select-mode` job's output existing first) and both depend on Task 1 (the workflow references the npm scripts Task 1 defines). Task 5 depends on both 2 (the file it's appended to, or its sibling) and 4 (it must accurately describe the real, implemented workflow, not a planned one).

---

## Task 1 — Changesets contributor workflow: npm scripts

**Specification traceability:** R1 (`changeset`/`version`/`release` npm scripts), C1 (Changesets workflow shape).

**What to create/modify:** add exactly three scripts to root `package.json`'s `"scripts"` block:
```json
"changeset": "changeset",
"changeset:version": "changeset version",
"changeset:publish": "changeset publish"
```

**Placement:** alphabetically/logically grouped near the existing `provenance:validate`/`compatibility-manifest:validate` scripts (matching this repository's existing script-organization convention — grouped by concern, not alphabetically strict, confirmed by reading the current script block's actual ordering before insertion).

**What NOT to do:**
- Do not add a `"release"` script that bundles `version` + `publish` into one command — the specification's C3 requires these as two distinct, separately-triggered steps (version-PR generation vs. publish), never one combined local command that could accidentally publish.
- Do not add any script invoking `npm publish`/`pnpm publish` directly — all publishing goes through `changeset publish` (C1, confirmed compatible with the pinned tooling per this plan's own header).
- Do not add a `--dry-run`-named script — confirmed (this plan's header, and the original spec's §4 evidence) that no such flag exists on `changeset publish`; `changeset status` is the real non-publishing verification command, already covered by existing tooling, not a new script.

**Acceptance criteria:**
- AC1.1: `pnpm run changeset -- --help` succeeds and prints the real `@changesets/cli` help text (proves the script wraps the CLI correctly).
- AC1.2: `pnpm run changeset:version -- --help` and `pnpm run changeset:publish -- --help` each succeed identically.
- AC1.3: No script named `release`, `changeset:dry-run`, or any name implying a combined/simulated publish exists.
- AC1.4: `git diff --stat` for this task touches only `package.json`.

---

## Task 2 — Migration-strategy document

**Specification traceability:** R7 (Migration-strategy document), §2 (Migration strategy contract).

**What to create:** `docs/architecture/MIGRATION.md`, containing exactly these sections, per the specification's §2/R7 contract:

1. **Purpose statement** — one paragraph: this document is the migration-strategy artifact satisfying Blueprint §35/§40's "migration strategy" objective; migration is a documentation-only strategy, not automated tooling.
2. **How to migrate between Ultimate versions** — read the relevant `CHANGELOG.md` version section(s); apply any breaking-change notes a `major`-bump changeset entry carries. States plainly this process is manual today because no real version has ever been released (all 17 packages remain at `0.1.0`, verified this session).
3. **Pre-`1.0.0` SemVer caveat** — explicit paragraph: every `@ultimate/*` package is currently pre-`1.0.0`; per SemVer's own specification, minor releases below `1.0.0` may introduce breaking changes; do not assume the normal "minor never breaks" guarantee applies yet.
4. **Relationship to `compatibility-manifest.json`** — one paragraph, cross-referencing (not duplicating) `docs/architecture/compatibility-manifest.json` and `docs/architecture/COMPATIBILITY.md` (both confirmed existing this session, confirmed to track *framework-version* compatibility — which Angular/React/Vue versions each package supports — a distinct concern from *Ultimate-version-to-Ultimate-version* migration, which this document covers instead).
5. **Explicit CLI migration-tooling non-goals** — one paragraph, restating decision §2/binding-decision-8 above for this document's own reader: `@ultimate/cli create`, `migrate`, `update` do not exist and are out of scope; no automated codemod or migration command is planned by this document.
6. **Initial state** — states plainly, per the specification's D3-mirroring decision for `CHANGELOG.md`: this document's initial version is a template/contract; no per-version migration-guide entries are fabricated, since none exist yet; real entries are added only as real breaking-change releases occur.

**Cross-reference discipline (binding, per the specification's traceability rule):** this document cites `CHANGELOG.md` and `compatibility-manifest.json`/`COMPATIBILITY.md` by reference; it does not restate their content, matching the discipline Track D's `SECURITY.md`/`CHANGELOG.md` already established.

**Acceptance criteria:**
- AC2.1: `/docs/architecture/MIGRATION.md` exists.
- AC2.2: Grep-verifiable for the exact pre-`1.0.0` SemVer caveat language.
- AC2.3: Grep-verifiable for a cross-reference to `compatibility-manifest.json` or `COMPATIBILITY.md`, containing no duplicated framework-compatibility table content.
- AC2.4: Grep-verifiable for an explicit statement that `create`/`migrate`/`update` do not exist and are out of scope.
- AC2.5: Contains zero fabricated per-version migration entries (no `## v0.x.x` or similar section headers naming a version that has never been released).
- AC2.6: `git diff --stat` for this task touches only this one new file.

---

## Task 3 — Release workflow: `select-mode` + `version` jobs (corrected)

**Specification traceability:** C3 (Release automation trigger and flow, concerns 1–3), R4 items 1–3 (Release PR / version-bump flow).

**Corrected mechanism, evidence-based (Plan Review finding, resolving Blocker 1 and Blocker 2):** this task no longer proposes a "phase" concept spanning two later-triggered workflows. It creates **one workflow file with a `select-mode` job whose output gates a `version` job — the exact pattern `changesets/action`'s own maintainers use in their own production repository**, fetched and read directly this session via `gh api repos/changesets/action/contents/.github/workflows/publish.yml`. `select-mode`'s own README (fetched directly this session) states its decision logic verbatim: `"version"`: changesets are found → version + PR; `"publish"`: no changesets are found **and** there are publishable (unpublished) packages → publish; `"none"`: neither → do nothing. This is **deterministic, tool-native, repository/registry-state-based** — never a commit-message or PR-title parse (resolving Blocker 2's ambiguity concern directly).

**What to create:** `.github/workflows/release.yml`, containing:

1. **Workflow-level trigger:** `on: push: branches: [main]`.
2. **`select-mode` job** (first, gates the others):
   - Checks out the repo, installs dependencies (`pnpm install --frozen-lockfile`).
   - Runs the `changesets/action/select-mode` sub-action (or an equivalent local invocation reproducing its exact documented logic, if the composable sub-action is not used directly — this task's own composition choice) to determine `mode`.
   - Exposes `mode` as a job `output`.
   - **Permissions:** `contents: read` only — `select-mode`'s own README states its permission requirement as "_none_" beyond repo checkout; this plan uses `contents: read` for the checkout step itself, which is the minimum GitHub Actions permission model allows short of `{}`.
3. **`version` job:**
   - `needs: select-mode`; `if: needs.select-mode.outputs.mode == 'version'` — **same-workflow `needs:`, the technically valid form** (resolving Blocker 1; cross-workflow `needs:` was never attempted here).
   - Runs `pnpm run changeset:version` (Task 1's script) — bumps affected packages' versions, regenerates `CHANGELOG.md` entries via the already-configured `@changesets/changelog-git` generator, deletes consumed changeset files.
   - Commits the result to a dedicated branch (Changesets' own default convention: `changeset-release/<base-branch>`, i.e. `changeset-release/main`) and opens or updates a pull request titled `"Version Packages"` (Changesets' own documented default `pr-title`) targeting `main`.
   - **Permissions:** exactly `contents: write` (commit the version-bump branch) and `pull-requests: write` (open/update the PR) — matching `changesets/action/version`'s own documented requirement exactly, fetched directly this session. **No `id-token: write`** (binding decision 5) — this job never touches npm authentication.
4. **Human review boundary (binding, unchanged from the specification's C3 item 3):** this workflow **never merges its own PR**. Merging the "Version Packages" PR is a human action performed through GitHub's normal PR-review UI — no auto-merge step, no `gh pr merge` invocation, anywhere in this workflow. This remains the one and only human-approval point in the entire release flow.
5. **Relationship to Track B's `ci` job (corrected, resolving Blocker 1's core question):** `ci.yml`'s `pull_request` trigger already runs Track B's full gate set on the "Version Packages" PR the moment `select-mode`+`version` open/update it — this is automatic, requires no wiring in `release.yml` at all, and is **enforced by GitHub branch protection** (a required-status-check rule on `main` requiring the `ci` job to pass before any PR, including this one, can merge) — a repository *setting*, external to this plan's file content, restated precisely in the corrected §3 below and in External Prerequisites (§8).

**What NOT to do (binding, restated from the task's explicit constraints):**
- Do not add `id-token: write` to the `select-mode` or `version` job's permissions.
- Do not reference `secrets.NPM_TOKEN` in either job — neither ever authenticates to npm.
- Do not attempt a cross-workflow `needs:` referencing `ci.yml`'s `ci` job by name — confirmed this session (GitHub's own documented `needs:` semantics) that this is not valid syntax; `needs:` only resolves job IDs within the same workflow file.
- Do not merge the "Version Packages" PR automatically under any condition.

**Acceptance criteria:**
- AC3.1: `.github/workflows/release.yml` exists and passes `actionlint` (the same tool Track B's own implementation used, confirmed available this session's tooling).
- AC3.2: `select-mode` and `version` are two distinct job IDs in the same file; `version`'s job definition contains `needs: select-mode` (or a list including it) and an `if:` expression referencing `needs.select-mode.outputs.mode`.
- AC3.3: The `version` job's `permissions:` block contains exactly `contents: write` and `pull-requests: write` — grep-verifiable absence of `id-token: write` anywhere in the file at this point in the plan (Task 4 adds the third job with its own permissions — re-checked for the whole-file state in Task 4's own acceptance criteria).
- AC3.4: The workflow references `pnpm run changeset:version` (Task 1's script), not a raw `changeset version` or `npx changeset version` invocation, keeping the workflow and local contributor-facing commands consistent.
- AC3.5: No step in either job merges a pull request (grep-verifiable absence of `gh pr merge`, `pulls.merge`, or equivalent GitHub API auto-merge calls).
- AC3.6: `grep -c "needs: ci\b\|needs: \[.*\bci\b" .github/workflows/release.yml` returns `0` — no attempted cross-workflow job reference by the `ci.yml` job's name.

---

## Task 4 — Release workflow: `publish` job (corrected)

**Specification traceability:** C3 (concerns 4–6), C4 (Publish trigger, registry target, package access), C5 (Provenance/attestation — the negative/absence requirements), R4 item 4, R5 (Publish contract), R6 (Provenance limitation — documented, not implemented).

**Corrected mechanism (resolving Blocker 1, Blocker 2, Blocker 4):** adds the third job to the same `.github/workflows/release.yml` from Task 3, gated by the same `select-mode` job's output — no separate workflow, no cross-workflow dependency, no commit-message parsing.

1. **`publish` job:**
   - `needs: select-mode`; `if: needs.select-mode.outputs.mode == 'publish'` — again, same-workflow `needs:`. `select-mode`'s own documented logic (Task 3) only returns `"publish"` when **no pending changesets remain and unpublished package versions exist** — i.e., precisely the state that exists immediately after the "Version Packages" PR has been merged (its merge is what consumes/deletes the pending changesets and commits the bumped-but-not-yet-published versions) and never in any other repository state, including a normal, unrelated feature-branch merge to `main` (which changes neither changeset presence nor package-version-vs-registry state) — this is the deterministic identification Blocker 2 required, sourced from the tool's own documented behavior, not invented.
   - **Authentication (corrected, resolving Blocker 4):** rather than relying on `actions/setup-node`'s `registry-url`/`NODE_AUTH_TOKEN` mechanism (confirmed this session: `actions/setup-node`'s own README documents this feature for npm/yarn only, with an explicit "pnpm may warn" caveat in its v7 changelog — not a clean, positively-documented pnpm guarantee), this job runs pnpm's own first-party, version-safe mechanism as an explicit step immediately before publishing:
     ```
     pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
     ```
     confirmed directly against pnpm's own official npmrc documentation this session as the recommended CI pattern, writing the token to pnpm's own global config at runtime rather than depending on any `.npmrc` environment-variable-expansion behavior (which changed across pnpm major versions post-9.6.0, per pnpm's own docs — this mechanism predates and is unaffected by that later change). `NPM_TOKEN` is read from `secrets.NPM_TOKEN` via the step's `env:` block.
   - **Publish step:** `pnpm run changeset:publish` (Task 1's script) — runs immediately after the auth-config step above, in the same job.
   - **Permissions:** `contents: write` (for `changeset publish`'s own documented `git push --follow-tags` behavior) — **and nothing else.** No `id-token: write` (binding decision 5) — this repository's model is token-based, not OIDC, per every binding decision above.
2. **Fail-closed relationship to Track B (corrected, resolving Blocker 1's core question — restated precisely, distinguishing repository-content-enforced from repository-setting-enforced):**
   - **Enforced by repository content (verifiable from this file alone):** none, directly — `release.yml` itself contains no job that re-runs or waits on `ci.yml`'s `ci` job, because (per Blocker 1's finding) that cross-workflow dependency is not expressible via `needs:`.
   - **Enforced by GitHub repository settings (external, not verifiable from repository content — see §8):** a required-status-check branch-protection rule on `main`, requiring the `ci` job to have passed, before the "Version Packages" PR (Task 3) can be merged at all. Since the `publish` job's own trigger condition (item 1 above) only fires in the specific state that exists *after* that PR's merge, and that merge cannot happen without `ci` having passed (given the branch-protection rule), the fail-closed guarantee holds **transitively, through the merge gate, not through an in-workflow check** — exactly the pattern the specification's own §9 anticipated as an acceptable alternative to an in-workflow gate ("relying on required branch protection/status checks before the Version Packages PR can merge, combined with a deterministic post-merge publish trigger" — the task's own suggested mechanism, now selected and confirmed valid).
   - **This plan explicitly states, per the task's own instruction, that this portion of the specification's fail-closed contract cannot be guaranteed by repository content alone** — it depends on a GitHub repository setting (branch protection) that this plan cannot create, verify, or enforce from within the repository. Recorded as an External Prerequisite (§8) and an Open Item for whoever configures the real repository, not silently assumed to already be true.
3. **Binding negative requirements, restated explicitly as build-time contract, not merely documentation:**
   - The publish step's command line must never include `--provenance` (binding decision 6).
   - The publish step must never pass `--access public` — neither as a CLI flag nor via any `.changeset/config.json` edit (binding decisions 1, 2, 10). `.changeset/config.json`'s existing `access: "restricted"` governs the publish call as-is; this workflow does not override it.
   - The workflow file, in its entirety (all three jobs), must contain zero occurrences of `id-token`, `--provenance`, or `--access public`.
4. **No accidental-publish path:** the `publish` job's `if:` condition (item 1) — sourced from `select-mode`'s own deterministic, state-based logic — is the *only* path that can invoke `pnpm run changeset:publish` in CI. No other job, no manually-dispatchable `workflow_dispatch` trigger with a default/accidental-publish behavior, is added by this task. If a manual trigger is added at all (optional, this task's own choice), it must require explicit confirmation input, never a bare `workflow_dispatch` with no gating input, and must still route through the same `select-mode`-gated `if:` condition rather than bypassing it.

**What NOT to do:**
- Do not add any step that could publish outside the `select-mode`-gated `if:` condition.
- Do not add `id-token: write` anywhere in this file.
- Do not pass `--provenance`, `--access public`, or any flag not in the confirmed real flag surface (`--tag`, `--otp`, `--no-git-tag` for `publish`) to any `changeset` invocation.
- Do not attempt to re-implement Track B's `ci` job's checks inside `release.yml` as a workaround for the cross-workflow `needs:` limitation — that would duplicate Track B's gate logic in two places (a maintenance/drift risk this plan explicitly avoids) rather than relying on the merge-gate mechanism above.

**Acceptance criteria:**
- AC4.1: `.github/workflows/release.yml` (whole file, all three jobs) passes `actionlint`.
- AC4.2: `grep -c "id-token" .github/workflows/release.yml` returns `0`.
- AC4.3: `grep -c "provenance" .github/workflows/release.yml` returns `0` (the workflow itself never mentions provenance — the *documentation*, Task 5, is where the gap is disclosed, not the workflow).
- AC4.4: `grep -c "access public\|access: public\|access=public" .github/workflows/release.yml` returns `0`.
- AC4.5: The `publish` job's definition contains `needs: select-mode` and `if: needs.select-mode.outputs.mode == 'publish'` — verifiable by reading the job graph in the YAML. (This replaces the prior draft's invalid `needs: ci` claim — see Task 3/4's corrected mechanism above for why this is the deterministic, valid gate.)
- AC4.6: The `publish` job's `permissions:` block contains exactly `contents: write` — no additional scopes beyond what `changeset publish`'s own documented git-tag-push behavior requires.
- AC4.7: `secrets.NPM_TOKEN` is referenced exactly once, in the `publish` job only, never in `select-mode` or `version` (Task 3).
- AC4.8: The `publish` job contains a step running `pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"` (or byte-equivalent) immediately before the `pnpm run changeset:publish` step — grep-verifiable ordering.
- AC4.9: `grep -c "registry-url" .github/workflows/release.yml` returns `0` — confirms this task did not fall back to the not-positively-pnpm-documented `actions/setup-node` mechanism this Plan Review specifically moved away from.

---

## Task 5 — Documentation: provenance-gap disclosure and "Releasing" instructions

**Specification traceability:** R6 item 1 (document the gap), §10 (Documentation Outputs), OQ-2 (exact location deferred to this plan).

**What to create/modify:** one new "Releasing" section, appended to `docs/architecture/MIGRATION.md` (Task 2's file) — this plan's own resolution of the specification's OQ-2 (a bounded, non-architectural choice with no wrong answer, per the specification's own framing; appending to `MIGRATION.md` rather than creating a separate `RELEASING.md` avoids a second small file for a closely related concern).

**Required content, exactly:**

1. **How a release actually happens (corrected — three-job model, not two phases)** — a short, accurate description of the real, implemented flow: contributor changesets → `select-mode`/`version` job opens or updates the "Version Packages" PR → human review and merge → `select-mode`/`publish` job runs automatically, gated by the merge having already happened. Cross-references `.github/workflows/release.yml` by name rather than restating its YAML.
2. **The complete whole-flow transition table (required, resolving Blocker 3):**

   | Step | Trigger | Prerequisite | Authentication | Human approval boundary | Failure behavior | Verifiability |
   |---|---|---|---|---|---|---|
   | 1. Contributor creates a changeset | Manual, local (`pnpm changeset add`) | None | None | None (any contributor) | N/A — a local file write, no CI involvement | Local |
   | 2. Normal PR merges to `main` | Human merges a reviewed feature PR | Track B's `ci` job passed on the PR (branch protection) | GitHub's own PR-merge mechanism, unrelated to npm | The feature PR's own normal review | If `ci` fails, branch protection blocks merge (Track B's existing, unmodified gate) | External (real GitHub Actions run + branch protection) |
   | 3. `select-mode` runs, decides `version` | Push to `main` (from step 2) | Pending `.changeset/*.md` files exist on `main` | None | None (automatic) | If the job itself fails (e.g. checkout error), no PR is opened/updated — safe failure, not a false publish | External for real trigger; static YAML shape is local |
   | 4. `version` job opens/updates "Version Packages" PR | `needs: select-mode` + `if: mode == 'version'` | Step 3's mode output | None | None (automatic PR creation, not merge) | If `changeset:version` fails, no PR update occurs — no partial/corrupt PR state per Changesets' own atomic-commit behavior | External for real trigger; local for script correctness |
   | 5. Track B's `ci` job runs on the "Version Packages" PR | Automatic — `ci.yml`'s existing `on: pull_request` trigger, unmodified | None beyond the PR existing | None | None | Existing Track B behavior, unmodified by this plan | External (real GitHub Actions run) |
   | 6. Human reviews/merges "Version Packages" PR | Manual, human action via GitHub's PR UI | `ci` job passed (branch protection required-status-check) | GitHub's own PR-merge mechanism | **This is the one human-approval point in the entire flow** | If a human declines to merge, nothing further happens — the PR simply stays open, `select-mode` keeps returning `version` on next push, updating it | External (requires branch protection configured, §8) |
   | 7. `select-mode` runs again, decides `publish` | Push to `main` (the merge commit from step 6) | Zero pending changesets AND unpublished package versions exist — the exact post-merge state, per `select-mode`'s own documented logic | None (this job only decides mode) | None (automatic) | Same safe-failure shape as step 3 | External for real trigger; static YAML shape is local |
   | 8. `publish` job authenticates and publishes | `needs: select-mode` + `if: mode == 'publish'` | Step 7's mode output | `pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"` then `pnpm run changeset:publish`, restricted/private access (`.changeset/config.json` unchanged), no `--provenance`, no `id-token: write` | None (fully automatic once reached — by design, since the human approval already happened at step 6) | If `NPM_TOKEN` is invalid/missing, publish fails loudly (npm/pnpm's own real auth error) — no silent partial publish | External (requires a real `NPM_TOKEN` and registry, §8) — **cannot be executed in this environment** |

3. **The provenance limitation, disclosed in full** — this is the binding, required content item the specification's R6 item 1 mandates, not optional:
   - Publish-time npm provenance is not implemented and is not currently achievable for this repository's packages.
   - Three independent, compounding reasons, stated plainly: (a) `@changesets/cli`'s `publish` command has no code path to forward a `--provenance` flag; (b) this repository's pinned `pnpm@9.6.0` predates pnpm's own OIDC/provenance support; (c) `@ultimate/*` packages are permanently restricted/private, and both real provenance mechanisms (token-based and OIDC Trusted Publishing) require the published package itself to be public — a decision-level incompatibility independent of either tooling gap.
   - A future reader must not assume provenance exists once this release automation ships.
4. **What upgrading tooling alone would not fix** — one sentence, explicit: even a hypothetical future `@changesets/cli`/pnpm upgrade would not produce provenance while the restricted/private access decision stands; achieving provenance would require *both* a tooling change *and* a separate future decision to revisit that access commitment (mirroring the specification's own OQ-4).
5. **The branch-protection dependency, disclosed explicitly (new, required per Plan Review):** the fail-closed guarantee that publish never happens on a red `ci` run depends on a GitHub repository setting (a required-status-check branch-protection rule on `main` requiring the `ci` job) that this repository's content cannot itself enforce or verify — stated plainly so a future maintainer configuring the real GitHub repository knows this setting is a load-bearing part of the release flow's safety, not an optional nice-to-have.

**Acceptance criteria:**
- AC5.1: `docs/architecture/MIGRATION.md` contains a "Releasing" section (or equivalent heading) after this task.
- AC5.2: Grep-verifiable for all three compounding provenance reasons listed above, not merely a vague "provenance not supported" statement.
- AC5.3: Does not claim any provenance capability exists, partially exists, or is planned for a specific future date.
- AC5.4: Contains the complete 8-row transition table (or equivalent content covering all eight steps' trigger/prerequisite/authentication/human-boundary/failure-behavior/verifiability).
- AC5.5: Explicitly states the branch-protection dependency for fail-closed publish gating, naming it as a required GitHub repository setting, not merely implying it.
- AC5.6: `git diff --stat` for this task touches only `docs/architecture/MIGRATION.md` (an edit to Task 2's file, not a new file).

---

## 2. Dependency / Order Graph

```text
Task 1 (npm scripts)          ─┐
Task 2 (MIGRATION.md)          ├─ no dependency on each other; parallelizable
                                │
Task 1 ──> Task 3 (release.yml: select-mode + version jobs)
Task 3 ──> Task 4 (release.yml: adds publish job, same select-mode gate)
Task 2 ──> Task 5 (Releasing section) <── Task 4
                                │
Tasks 1,2,3,4,5 ──> Task 6 (whole-track verification, terminal)
```

Tasks 1 and 2 have zero dependency on each other or on anything else — assignable to two separate subagents/implementers in parallel, per this repository's established pattern (Tracks A/B/D). Tasks 3 and 4 are strictly sequential (same file, same `select-mode` job; Task 4's `publish` job's `if:` condition depends on Task 3's `select-mode` job existing first). Task 5 depends on both 2 (the file) and 4 (must describe the real, already-implemented three-job workflow accurately — describing a not-yet-built workflow would risk drift). Task 6 is terminal and depends on all five.

---

## 3. External Prerequisites (explicit, none provisioned by this plan)

Per the task's explicit instruction to identify everything that must exist outside the repository, and to state exactly which portion of the specification's fail-closed contract depends on GitHub repository settings rather than repository content (Plan Review requirement):

1. **A configured git remote.** Confirmed absent this session (`git remote -v` returns empty, consistent with every prior Track A/B/D finding this session). Without one, Tasks 3/4's workflow cannot be triggered by a real push/PR-merge event, and cannot be verified end-to-end.
2. **GitHub Actions execution capability** on that remote (requires the remote to exist first).
3. **A valid `NPM_TOKEN`** — an npm access token with publish rights to the `@ultimate` scope, stored as a GitHub Actions repository secret. Confirmed absent from all repository-visible configuration this session (no workflow references it yet, since Task 4 is the first to add that reference — and even after Task 4, the *secret's value* is never something this plan or its implementation can provision).
4. **An npm organization/scope with restricted/private-package capacity for `@ultimate`.** `access: "restricted"` (binding decision 2) requires the npm organization backing the `@ultimate` scope to support private packages (a paid or otherwise-provisioned tier) — this plan does not verify whether such an organization exists or has that capacity; it is an out-of-repository, npmjs.com-account-level fact.
5. **Branch protection / required status checks on `main`, requiring the `ci` job — load-bearing, not optional (corrected per Plan Review Blocker 1):** unlike the prior draft's claim, **no portion of Track B's `ci`-passing gate can be enforced from `release.yml`'s own content** — `needs:` cannot cross workflow files (confirmed this session against GitHub's own documented semantics), so there is no in-workflow substitute. The entire fail-closed guarantee ("publish never happens on a red `ci` run") depends **exclusively** on this external, GitHub-repository-setting-level branch-protection rule existing on `main`, requiring the `ci` job to pass before the "Version Packages" PR can merge. **This is not verifiable from repository content alone** (no `CODEOWNERS`/ruleset file exists, confirmed this session, matching the specification's own OQ-1 finding) — it must be configured by whoever administers the real GitHub repository, and this plan cannot confirm it is done. Task 4's `publish` job's `if: mode == 'publish'` condition is deterministic *given* that this setting holds (§4.6 below) — it is not itself the fail-closed mechanism, only the correctly-gated consumer of the state that mechanism produces.

None of these five prerequisites are provisioned, invented, or assumed to already exist by this plan or by any task within it — they are recorded as explicit blockers to *real, end-to-end release execution*, distinct from *whether the workflow itself is correctly implemented* (the distinction the task's own instructions require this plan to maintain throughout). **Prerequisite 5 specifically is the one portion of the approved specification's fail-closed contract (§9) that cannot be guaranteed by this plan's repository content alone** — restated here precisely per the task's explicit instruction to state exactly which portion depends on GitHub repository settings.

---

## 4. Verification Strategy (strictly separated by category, per the task's explicit instruction)

### 4.1 Local-only verification (no remote, no registry, performable entirely on this machine)
- Task 1's scripts invoke the real CLI (`--help` smoke checks).
- Task 2's `MIGRATION.md` content (grep checks for required caveats/cross-references).
- A throwaway changeset can be authored via `pnpm changeset add` and reported by `pnpm run changeset -- status` without being committed or consumed — proves the CLI wiring works without touching any real package version (see §5 below, Mutation-Proof Test 4).

### 4.2 Static workflow verification (file-content checks, no execution)
- `.github/workflows/release.yml` passes `actionlint` (all three jobs, Tasks 3+4).
- Grep-verifiable absence of `id-token`, `--provenance`, `--access public` anywhere in the file (AC4.2–AC4.4).
- Grep-verifiable presence of `secrets.NPM_TOKEN` exactly once, in the `publish` job only (AC4.7).
- Grep-verifiable `needs: select-mode` + `if: needs.select-mode.outputs.mode == 'publish'` structure on the `publish` job (AC4.5) — **this proves the `publish` job is correctly gated by `select-mode`'s deterministic output; it does not, and cannot, prove the `ci`-passing guarantee by itself** (§3 prerequisite 5 — that guarantee is external, branch-protection-enforced, not repository-content-verifiable).
- Grep-verifiable presence of the `pnpm config set //registry.npmjs.org/:_authToken` step immediately before `pnpm run changeset:publish` (AC4.8), and absence of `registry-url` (AC4.9).

### 4.3 Changesets validation (local CLI behavior, no remote)
- `pnpm run changeset -- status --since main` runs without error against the real, current `.changeset/` state.
- A throwaway changeset file's presence is correctly reported, then removed without being committed (zero net repository change, matching this session's own Track A Task 11a precedent for "prove the mechanism, then revert cleanly").

### 4.4 Restricted-publishing configuration validation (local, static — confirms configuration intent, not live registry behavior)
- `.changeset/config.json`'s `access: "restricted"` value is unchanged (byte-for-byte diff against the pre-task state) — proves this plan's implementation did not silently alter it.
- No package's `package.json` gained a `publishConfig` field overriding the repo-wide restricted setting (grep sweep across all 17 packages, matching the specification's own C6/§4 evidence-gathering method).

### 4.5 Non-publishing release-flow tests (local simulation of the flow's logic, still no real publish)
- Manually walk `changeset version`'s logic against the throwaway changeset from §4.3 in a disposable environment (e.g., a scratch git worktree or container, matching this session's own Track A precedent for isolated experimentation) to confirm it produces the expected version bump and changelog diff shape — then discard the scratch environment entirely, never merging or pushing its result. This proves the *version-bump logic* works without touching real package versions or requiring any remote.

### 4.6 Remote-only verification (requires the external prerequisites in §3; cannot be performed now)
- Whether `select-mode` actually triggers on a real push to `main` and correctly resolves `mode`.
- Whether the "Version Packages" PR actually opens/updates correctly on GitHub.
- Whether the branch-protection rule (§3 prerequisite 5) actually blocks the "Version Packages" PR from merging while `ci` is red — **this is the real test of the fail-closed guarantee, and it is exclusively a remote/GitHub-repository-setting test; no repository-content check (§4.2) can substitute for it.**
- Whether the `publish` job actually triggers correctly upon that PR's real merge, per `select-mode`'s real post-merge state evaluation.

### 4.7 Registry-only verification (requires a valid `NPM_TOKEN` in addition to a remote; cannot be performed now)
- Whether `pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"` (Task 4's corrected mechanism) actually authenticates successfully against the real npm registry.
- Whether a real publish attempt for a restricted `@ultimate/*` package actually succeeds and is installable by an authorized consumer.
- Whether `access: "restricted"` behaves as expected on the real registry for a first-time publish (npm's own real enforcement, not merely this repository's configured intent).

**Binding distinction, restated per the task's explicit instruction:** completing Tasks 1–6 and passing every check in §4.1–§4.5 establishes that **"the workflow is correctly implemented."** It does **not** establish that **"a real release was successfully executed"** — that claim requires §4.6 and §4.7, both of which remain externally blocked (§3) in this environment, exactly as Track A's own Task 11b remained blocked for the identical reason (no configured remote). This plan's Task 6 (whole-track verification) explicitly reports only the §4.1–§4.5 categories as complete; §4.6/§4.7 are reported as pending external prerequisites, not as failures of this plan's own work.

---

## 5. Mutation-Proof / Safety Verification (Task 6's core content)

Following this session's own established pattern (Track A's Task 11a: prove each safety mechanism fails/behaves correctly, then fully revert, leaving zero net repository change) — Task 6 must perform and report on each of the following, all locally, all reverted:

1. **No accidental public access:** attempt (in a scratch/dry context, never actually executed against a real registry) to construct a `changeset publish` invocation that would pass `--access public` — confirm the actual implemented workflow (Task 4) contains no code path that could produce this, by re-reading the finished YAML rather than executing it. This is a static-inspection proof, not a live-registry test (no registry credentials exist to test against safely).
2. **No accidental publish:** confirm, by reading the finished workflow's `select-mode` gating logic (Task 3/4), that no push to `main` other than the specific post-"Version Packages"-merge state could resolve `mode` to `publish` — walk through at least three counter-example scenarios: (a) a normal feature-branch merge with no pending changesets and no unpublished versions (`select-mode` resolves `none`); (b) a normal feature-branch merge that happens to introduce a new changeset file (`select-mode` resolves `version`, opening/updating the PR, never publishing); (c) a push to `main` that is *not* the "Version Packages" PR's merge but coincidentally has zero pending changesets (only possible if every package is already fully published — the exact, narrow condition `select-mode`'s own documented logic requires, meaning this scenario and "the PR was just merged" are the same state by construction, not two states requiring separate detection). Confirm none of these reach `changeset publish` except the one true post-merge state.
3. **No provenance/OIDC configuration:** re-run the exact grep checks from AC4.2–AC4.4 as an independent Task 6 re-verification (not merely trusting Task 4's own self-reported acceptance criteria) — zero occurrences of `id-token`, `--provenance`, `--access public` in the finished `.github/workflows/release.yml`.
4. **Release workflow remains gated, correctly distinguishing what this proves from what it cannot prove:** re-verify AC4.5's `needs: select-mode` + `if:` structure independently, confirming the `publish` job's real YAML-level dependency on `select-mode`'s output, not merely a comment claiming it. **This step proves the `publish` job cannot run except when `select-mode` says `publish` — it does NOT and cannot prove that `main` never receives a red-`ci` commit**, since that guarantee is entirely external (branch protection, §3 prerequisite 5). Task 6's report must state this distinction explicitly, not conflate "the job is correctly gated by mode" with "the release can never happen on broken code" — the latter also requires the external setting to actually be configured.
5. **Changesets versioning works on throwaway data without polluting real package versions:** author one real throwaway changeset (e.g., `--empty` flag, or a trivial `patch` bump named against a low-risk package) via `pnpm changeset add`, confirm `pnpm run changeset -- status` reports it correctly, then delete the changeset file directly (never running `changeset version` against it for real) — confirm via `git status`/`git diff` that zero package `package.json` version fields or `CHANGELOG.md` content changed as a result. This proves the authoring half of the mechanism works without ever risking a real version mutation.

**Task 6's own acceptance criterion:** all five checks above pass, and the final `git status`/`git diff` for the entire implementation shows exactly the expected changed-file set (§6 below) — nothing more, nothing reverted-but-still-showing-as-dirty, nothing left over from any scratch/throwaway step.

---

## 6. Expected Changed-File Allowlist (final, whole-track)

- `package.json` (root) — Task 1, three new scripts only.
- `docs/architecture/MIGRATION.md` (new) — Tasks 2 and 5.
- `.github/workflows/release.yml` (new) — Tasks 3 and 4.

**Explicitly NOT touched by this plan, matching the specification's own non-goals and this task's out-of-scope-protection requirement:**
- `.changeset/config.json` — unchanged, `access: "restricted"` preserved byte-for-byte.
- `package.json`'s `packageManager` field — unchanged, `pnpm@9.6.0` preserved.
- `.github/workflows/ci.yml` — unchanged; Track B's existing job is referenced (via `needs:`), never modified.
- `CHANGELOG.md`, `SECURITY.md` — unchanged (Track D's outputs; Task 5 cross-references, never edits, either).
- `docs/architecture/COMPATIBILITY.md`, `docs/architecture/compatibility-manifest.json` — unchanged; Task 2 cross-references, never edits, either.
- `packages/cli/src/commands/` — unchanged; no `create.ts`/`migrate.ts`/`update.ts` added (binding decision 9).
- Any `packages/*/package.json` version field or `publishConfig` field — unchanged by this plan itself (only ever changed by a real, future `changeset version` run during an actual release, which this plan does not execute).
- `docs/architecture/BLUEPRINT_GAPS.md`, `docs/architecture/ROADMAP.md`, `docs/architecture/DECISIONS.md` — unchanged, per this plan's own scope constraints (no bookkeeping updates authorized here).
- Anything under `apps/playground-*`, `apps/showcase` (Track E scope) — untouched.

---

## 7. Explicit Out-of-Scope Protection (restated as a flat list for implementer scanning)

- `@ultimate/cli create`, `migrate`, `update` — not implemented, not stubbed, not scaffolded.
- Any `pnpm` version upgrade or `packageManager` field edit.
- Any change to `access: "restricted"` or introduction of `publishConfig: { access: "public" }` on any package.
- Any `id-token: write` permission, anywhere.
- Any `--provenance` flag, anywhere.
- Any Track E (SSR/hydration) file, harness, or Playwright spec.
- Any Track B CI gate modification (`audit:validate`, `license:validate`, `sast:validate`, `install-script-policy:validate`, `size:validate`, `coverage:validate`, `integrity:pack-install`, `boundary:validate*`, `provenance:validate`) — `.github/workflows/ci.yml` is never edited by this plan. Per the corrected model (Task 3/4), `release.yml` does not and cannot reference the `ci` job directly (cross-workflow `needs:` is not valid GitHub Actions syntax); Track B's gate is relied upon exclusively through the external branch-protection setting (§3 prerequisite 5), not through any in-file reference.
- Any new package manager, lockfile format, or workspace-glob change.

---

## 8. Sources

- `docs/superpowers/specs/2026-09-10-phase-10-migration-release-provenance-design.md` — the approved specification this plan implements in full; every task above cites its exact section.
- `.changeset/config.json`, `.changeset/README.md` — re-read this session, confirmed unchanged since the specification's own findings.
- `package.json` (root) — re-read this session, confirmed `packageManager: "pnpm@9.6.0"`, `private: true`, `@changesets/cli: ^2.27.0`, zero existing changeset-invoking scripts.
- `packages/*/package.json` (all 17) — re-enumerated this session, confirmed all at `0.1.0`, zero `publishConfig` fields.
- `.github/workflows/ci.yml` — re-read this session, confirmed exactly two jobs (`ci`, `track-a-browser-visual-a11y`), confirmed the `ci` job's own `permissions:` block precedent (`contents: read`, `security-events: write`) informing this plan's own minimal-permissions approach.
- `CHANGELOG.md`, `SECURITY.md` — re-read this session, confirmed Track D's existing content and ownership-rule text, cross-referenced (not duplicated) by Tasks 2/5.
- `docs/architecture/COMPATIBILITY.md`, `docs/architecture/compatibility-manifest.json` — re-read this session, confirmed scope (framework-version compatibility, Phase 7's domain) distinct from Task 2's Ultimate-version migration content.
- `packages/cli/src/commands/` — re-listed this session, confirmed exactly `add.ts`/`ai.ts`/`doctor.ts`/`generate.ts`/`init.ts`/`theme.ts`, no `create`/`migrate`/`update`.
- Direct CLI probes this session: `npx changeset --help`, `npx changeset publish --help`, `npx changeset version --help`, `npx changeset status --help` — confirmed the exact flag surface this plan's tasks depend on, re-verified immediately before writing this plan per the task's own explicit instruction.
- `pnpm publish --help` (this repository's installed pnpm 9.6.0) — re-confirmed real flag surface (`--tag`, `--access`, `--dry-run`, `--force`, `--ignore-scripts`, `--json`, `--no-git-checks`, `--otp`, `--publish-branch`, `-r`/`--recursive`, `--report-summary`) during Plan Review; noted `--dry-run` exists on `pnpm publish` itself (though not forwarded by `changeset publish`, per the approved specification's own prior finding, unaffected by this note).
- `git remote -v` — re-confirmed empty this session, the basis for §3's external-prerequisites list.
- **Plan Review (this pass) — GitHub Actions documentation and search results:** confirmed `needs:` job dependencies resolve only within the same workflow file; cross-workflow orchestration requires `workflow_run` or reusable-workflow patterns, neither of which this plan uses, since the corrected model needs neither (single workflow, single self-contained `select-mode` gate).
- **Plan Review (this pass) — `changesets/action`'s own repository, fetched directly via `gh api repos/changesets/action/contents/...`:** `README.md` (top-level action, confirming `id-token: write` is documented as needed only "if using trusted publishing" — not this repository's model); `select-mode/README.md` (the exact, verbatim `"version"`/`"publish"`/`"none"` decision logic this plan's Task 3/4 implement); `version/README.md` and `publish/README.md` (confirming each sub-action's own minimal permission requirements, `contents: write`+`pull-requests: write` for `version`, `id-token: write`-only-if-trusted-publishing for `publish`); `.github/workflows/publish.yml`, `.github/workflows/release-pr.yml`, `.github/workflows/ci.yml` (the maintainers' own real, production composition of `select-mode`→`version`/`publish` jobs via same-file `needs:`+`if:`, and their own separate `pull_request`/`merge_group`-triggered CI workflow — directly informing this plan's corrected Task 3/4 and the branch-protection-based CI-gating conclusion in §3).
- **Plan Review (this pass) — `changesets.dev/guide/automating`:** the official example workflow showing the single-job, self-determining `changesets/action` composition pattern, `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` as the documented token-injection convention.
- **Plan Review (this pass) — `pnpm.io/npmrc`:** pnpm's own official authentication documentation, confirming (a) `NPM_CONFIG_USERCONFIG` is honored as a fallback, making `actions/setup-node`'s `registry-url` mechanism pnpm-compatible in practice despite `actions/setup-node`'s own README not naming pnpm explicitly; (b) the version-safe, pnpm-native alternative this plan selects instead: `pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"`; (c) that project-level `.npmrc` environment-variable expansion was disabled for security starting pnpm v11.5.3, a change this repository's pinned 9.6.0 predates — motivating this plan's choice of the config-set mechanism over any `.npmrc`-file-editing approach, to avoid depending on version-specific expansion behavior either way.
- **Plan Review (this pass) — `actions/setup-node`'s own README:** confirmed its `registry-url`/`NODE_AUTH_TOKEN` feature is documented for npm/yarn specifically, with an explicit "pnpm may warn" caveat in its v7 breaking-changes notes — the basis for this plan not relying on that action's own documentation as sufficient authority for pnpm compatibility, instead citing pnpm's own docs (above) as the authoritative source.
