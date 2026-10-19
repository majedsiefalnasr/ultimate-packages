# Workstream 2 — Release, CI and Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** DEFERRED — suspended indefinitely (user, 2026-10-19). No further implementation is authorized. Resuming needs a new explicit authorization; the work may be discontinued in the planned restructuring. Shipped: PRs #32–#36. See COMPLETION_REGISTER "Deferred (suspended) work". (Previously: APPROVED (Plan Review, 2026-10-17). Amendment A1 (2026-10-18) passed independent Plan Review (approve with changes, applied, re-reviewed). The ADR-066 R6 part awaits user confirmation before Task 1a merges. Execution: subagent-driven. No PR merge or perf-stage1.yml dispatch without explicit user approval.)

**Goal:** Implement Spec B1–B4: the release-path verification, CI record reconciliation, support-range and CLI evidence, and Stage 1 performance and documentation tooling.

**Architecture:** One PR per part (Spec §7). The parts run in this order:

- the docs PR first;
- B2, B3 and B4 independently of each other;
- B1 last, gated on PR #15's outcome.

New tooling follows the existing `scripts/provenance/*.mjs` + `node:test` pattern. Performance tooling lives in a new `scripts/perf/` directory, and the harness pages in the three playground apps (ADR-057).

**Tech stack:** Node `24.15.0`, pnpm `9.6.0`, `node:test`, Vitest, Playwright `1.63.0` (image `mcr.microsoft.com/playwright:v1.63.0-jammy`, runner `ubuntu-24.04-arm`), esbuild, TypeScript compiler API `5.9.3`, Storybook `10.6.0`.

**Spec:** [`2026-10-17-workstream-2-release-ci-tooling-design.md`](../specs/2026-10-17-workstream-2-release-ci-tooling-design.md). Decisions: ADR-057, ADR-058, ADR-059, ADR-060, ADR-061, ADR-066.

## Global Constraints

- **Toolchain:** Node `24.15.0`, pnpm `9.6.0`, `engine-strict=true` (ADR-059).
- **No weakening:** no CI step, threshold or baseline is weakened. No CI exception. The 2-point coverage threshold, the 0.05 integrity tolerance and the 15% bundle gate are unchanged.
- **Gap IDs:** no new gap for the Changesets action/CLI mismatch. GAP-087 stays RESOLVED.
- **Off limits:** no edit to PR #15, the primary checkout, or the uncommitted Phase 10 Spec/Plan edits.
- **Provenance:** no provenance manifest edit. A `PROVENANCE.md` change is made only when ADR-061's same-diff rule fires for a watched non-`src` package path, and then it is a truthful disclosure.
- **Evidence claims:** each acceptance claim is labelled Implemented, Verified, CI-enforced or Externally unexercisable. Pending external evidence is never written as passed.
- **Git:**
  - every branch from `origin/main` with `git worktree add --no-track -b <branch> <dir> origin/main`;
  - push with `git push -u origin <branch>:<branch>`;
  - stage named files only;
  - Conventional Commits with the session attribution lines.
- **CI comparison:** every PR's CI is compared with the latest `main` run by failure lines (`gh run view <id> --log-failed`), not by step colour. The expected red step is "Provenance validation", and its only failure lines are missing production entries.
- **Merges:** with `gh pr merge <N> --merge --match-head-commit <sha>`, each only after the user authorizes that merge.

## Review Focus

1. **A Release run that finds pending changesets.** If `.changeset/*.md` exists when B1 runs, the run must open or update a Version Packages PR and must not publish. Task 13 checks `.changeset/` first and records the actual path taken.
2. **The CLI/MCP compatibility boundary at `21.2.21`/`21.2.22`, and prereleases.** `21.2.21` is incompatible, `21.2.22` and `21.9.0` are compatible, and `22.0.0` is incompatible. `21.2.22-rc.0` follows the existing `satisfiesCaretRange` semantics, asserted as they are today and not changed. Tests are in Task 4.
3. **Re-baseline rounding.** The value written to `PERFORMANCE.md` must come from the same CI coverage summary the integrity check reproduces, to two decimals, so the 0.05 tolerance cannot fail on rounding. Task 1 takes it from the CI log of the PR head.
4. **Native passthrough attributes in the drift check.** React props that come from extended native interfaces (`ButtonHTMLAttributes`), and Angular outputs that only wrap native events, are not drift. The records already exclude them by convention. Tested in Task 11.
5. **Overlay timings with motion.** P7 is recorded both with motion and with `prefers-reduced-motion: reduce`. A missing reduced-motion variant is an error, not a silent omission. Tested in Task 8.

---

### Task 0: Deliver the Spec, ADR-060 and this Plan (B2-R1)

**Files:** already present on `docs/workstream-2-release-ci-tooling-spec` (uncommitted):

- `docs/superpowers/specs/2026-10-17-workstream-2-release-ci-tooling-design.md`
- `docs/superpowers/plans/2026-10-17-workstream-2-release-ci-tooling.md`
- `docs/architecture/DECISIONS.md` (ADR-060 only, 40 lines added)

**Steps:**

- [ ] **Step 1:** after Plan Review approval, set this Plan's status to "APPROVED (Plan Review, <date>)".
- [ ] **Step 2:** run `npx prettier --check` on the three files and `git diff --check`. Expected: clean. Confirm `git diff --numstat docs/architecture/DECISIONS.md` shows additions only.
- [ ] **Step 3:** commit the three files as `docs(workstream-2): record Spec, Plan and ADR-060`. Push. Open the PR.
- [ ] **Step 4:** compare CI with `main`. Expected: identical failure lines. The PR touches no watched package path, so the ADR-061 diff check passes without `PROVENANCE.md`.

### Task 1: React/Vue coverage re-baseline (B2-R2)

**Files:** Modify only `docs/architecture/PERFORMANCE.md`, the Phase 10 coverage table rows `react` (`89.69`) and `vue` (`92.13`), plus one sentence stating the ADR-060 scope and the measuring CI run.

**Interfaces:** Consumes ADR-060 on `main` (Task 0 merged).

**Steps:**

- [ ] **Step 1:** branch `docs/gap-091-coverage-rebaseline`. Read React's and Vue's `total.lines.pct` from the "Coverage measurement" step of the latest `main` CI run (`gh run view <id> --log | grep -E 'react|vue'` within that step). Record the run ID and SHA.
- [ ] **Step 2:** write the two values to two decimals. The diff must be exactly `docs/architecture/PERFORMANCE.md`. Check with `git diff --name-only origin/main...HEAD`, which must print that path only.
- [ ] **Step 3:** commit as `docs(coverage): re-baseline React and Vue under ADR-060 scope`. Push. Open the PR.
- [ ] **Step 4:** in the PR's CI, "Coverage regression check" must take the integrity path for `react` and `vue` and pass. If CI's fresh value differs by more than 0.05, rewrite the values from the PR head's own CI summary and re-push (Review Focus 3). Report any other change in failure lines and stop.

### Task 2: GAP-091 and C01 closeout (B2-R3, B2-R4)

**Files:**

- Create: `docs/architecture/research/<date>-gap-091-c01-closeout.md`.
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-091 entry only).
- Modify: `docs/architecture/COMPLETION_REGISTER.md` (C01 section, register log row).

**Interfaces:** Consumes Task 1 merged (PR number, merge SHA) and the first `main` CI run after it.

**Steps:**

- [ ] **Step 1:** fetch that `main` run's failure lines (`gh run view <id> --log-failed`). Expected: only "Provenance validation", with only `missing manifest entry`-type lines plus the summary. Any other failing step or reason stops this task; report it.
- [ ] **Step 2:** write the closeout record:
  - PR #16, `65c2345c`, merge `bdc4dbcf`, ADR-060;
  - the Task 1 PR and its CI run;
  - the step list of the `main` run;
  - the failure-line evidence;
  - the statement that C01 closes with "Provenance validation" owned by C04, and that C12's passing-CI prerequisite stays open.
- [ ] **Step 3:** GAP-091 status becomes `RESOLVED (<date>; ADR-060; PR #16; PR #<task1>; closeout record)`. "Architectural decision required" becomes "Yes — decided, ADR-060". C01's status, gate and last-reviewed lines are updated; no other register row changes.
- [ ] **Step 4:** Prettier check. Commit as `docs(gap-091): record coverage closeout and C01 closeout`. PR. CI failure lines identical to `main`.

### Task 3: Status-line reconciliation (B2-R5)

**Files:** modify the status line only:

- `docs/superpowers/specs/2026-10-13-code-quality-local-developer-checks-design.md`
- `docs/superpowers/plans/2026-10-13-code-quality-local-developer-checks.md`
- `docs/superpowers/specs/2026-10-14-gap-087-node-workspace-release-policy-design.md`
- `docs/superpowers/plans/2026-10-14-gap-087-node-workspace-release-policy.md`
- `docs/superpowers/specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md`
- `docs/superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-remediation.md`
- `docs/superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-p3-execution.md`

Also `docs/architecture/ROADMAP.md`, footnote 4 only.

**Steps:**

- [ ] **Step 1:** replace each status line:
  - code-quality: "IMPLEMENTED — PR #9, merge `55a76296`; closeout `research/2026-10-13-gap-092-lint-format-hooks-closeout.md`".
  - GAP-087: "IMPLEMENTED — PR #14, merge `6bba3115`; closeout `research/2026-10-14-gap-087-node-policy-closeout.md`".
  - E1-V2 drafts: "SUPERSEDED — E1-V2 closed; see `research/2026-10-08-gap-064-g3e-closeout.md`". Before writing, confirm the E1-V2 disposition by reading that record.
- [ ] **Step 2:** correct footnote 4 to say MCP reads the compatibility manifest packaged in its own distribution (GAP-131, PR #3).
- [ ] **Step 3:** run `git diff --stat`. Expected: one line changed per Spec/Plan file and footnote 4 only. Prettier check. Commit as `docs: reconcile shipped Spec/Plan status lines`. PR. Compare CI.

### Task 4: Angular range alignment and peer-range enforcement (B3-R1, B3-R2)

**Files:**

- Modify: `docs/architecture/compatibility-manifest.json` (Angular `frameworkVersionRange` → `^21.2.22`).
- Modify: `docs/architecture/COMPATIBILITY.md:18`. New text: "Angular: `^21.2.22` (published `@ultimate/ng`/`@ultimate/ng-core` peer range; PrimeNG 21.1.9's `^21.0.7` is not claimed)".
- Modify: `docs/architecture/compatibility-manifest.test.mjs`.
- Modify: `packages/cli/test/compatibility.test.ts`.
- Modify: `packages/mcp/test/tools/check-framework-compatibility.test.ts`.
- Modify: `packages/cli/test/fixtures/init/angular-project/package.json` (`^21.0.7` → `^21.2.22`).
- Modify: `docs/architecture/MIGRATION.md` (one entry in its unreleased-changes area).
- Create: `docs/architecture/research/<date>-w2-b3-support-evidence.md` (React/Vue floor check).

**Interfaces:** Produces `findPeerRangeMismatches(manifest, peersByPackage) → Array<{ framework, manifestRange, peerRange }>`, exported from `compatibility-manifest.test.mjs`'s sibling helper `docs/architecture/compatibility-peer-ranges.mjs`.

- `peersByPackage` maps a package name to its `peerDependencies`.
- The framework key is `@angular/core` for angular, `react` for react and `vue` for vue.

**Steps:**

- [ ] **Step 1: failing tests.** Add `test("manifest framework ranges equal the framework package peer ranges")`. It reads the three framework packages' `package.json` and asserts `findPeerRangeMismatches(...)` deep-equals `[]`. Add `test("seeded mismatch is reported")`:

  ```js
  assert.deepEqual(
    findPeerRangeMismatches(
      [
        {
          framework: "angular",
          frameworkVersionRange: "^21.0.7",
          ultimateFrameworkPackage: { name: "@ultimate/ng" },
        },
      ],
      { "@ultimate/ng": { "@angular/core": "^21.2.22" } }
    ),
    [{ framework: "angular", manifestRange: "^21.0.7", peerRange: "^21.2.22" }]
  );
  ```

- [ ] **Step 2:** run `pnpm run compatibility-manifest:validate`. Expected: FAIL (helper missing, then Angular mismatch).
- [ ] **Step 3:** implement `findPeerRangeMismatches` as an exact string comparison. Change the manifest and `COMPATIBILITY.md`. Run again. Expected: PASS.
- [ ] **Step 4: CLI/MCP tests.**
  - Every `frameworkVersion: "21.0.7"` and `frameworkVersionRange: "^21.0.7"` in the two test files becomes `"21.2.22"` / `"^21.2.22"`.
  - Add `test("Angular 21.2.21 is incompatible with ^21.2.22")` to each file.
  - Add the Review Focus 2 cases to `packages/cli/test/compatibility.test.ts` (`21.9.0` compatible, `22.0.0` incompatible, `21.2.22-rc.0` asserting today's result).
  - Run `pnpm --filter @ultimate/cli test && pnpm --filter @ultimate/mcp test`. Expected: PASS.
- [ ] **Step 5: React/Vue floors.** From `pnpm-lock.yaml` and `scripts/provenance/installed-cli-mcp-smoke.mjs` `CONSUMERS`, record each framework's declared floor and the versions actually installed in the research file. Mark floors CI never installs (for example React 17) as "declared, unverified". Change no range (Spec B3-R1).
- [ ] **Step 6:**
  - Add the MIGRATION.md entry: "Compatibility manifest: Angular range corrected from `^21.0.7` to the published peer range `^21.2.22`; CLI and MCP report Angular below 21.2.22 as incompatible."
  - Run `pnpm run build && pnpm run smoke:installed`. Expected: `[installed-smoke] OK`, because the packaged manifest copy is rebuilt.
  - Commit. `packages/cli` and `packages/mcp` are outside ADR-061's watched prefixes (`packages/{uix,ng,react,vue}`), so no `PROVENANCE.md` change is needed. Confirm with `pnpm run provenance:validate -- --base-ref origin/main`: the diff check passes.
  - Open the B3 PR (Tasks 4–6 on branch `fix/w2-b3-support-cli-evidence`).

### Task 5: CLI-1–CLI-6 evidence map (B3-R3)

**Files:** Modify `docs/architecture/research/<date>-w2-b3-support-evidence.md`, adding a "CLI evidence" section.

**Steps:**

- [ ] **Step 1:** fill one row per bar, with columns Bar | Requirement (ADR-058 wording) | Evidence (file:line, CI step name, README/`--help` lines) | Status (Met / Missing / Exception EX-1/EX-2).
  - CLI-1: `packages/cli/test/commands/*.test.ts`, and each command's documented error exit.
  - CLI-2/CLI-3: the "Installed-package smoke (CLI/MCP)" step and `CONSUMERS`.
  - CLI-4: the Blueprint §19 duties against `packages/cli/src/commands/*`, EX-1 and EX-2.
  - CLI-5: the package managers used in `installed-cli-mcp-smoke.mjs`.
  - CLI-6: run `node packages/cli/dist/bin.mjs --help` and `<cmd> --help` for each command, against `packages/cli/README.md`.
- [ ] **Step 2:** list every row with status Missing. Task 6 runs only for the rows listed. If a Missing row is anything other than CLI-5, stop. Report it as a Plan amendment for Plan Review rather than implementing it.

### Task 6: npm in the installed-package smoke (B3-R4; only if Task 5 confirms CLI-5 Missing)

**Files:** Modify `scripts/provenance/installed-cli-mcp-smoke.mjs` and `scripts/provenance/installed-cli-mcp-smoke.test.mjs`.

**Interfaces:** Produces:

- `export const PACKAGE_MANAGERS = ["pnpm", "npm"]`;
- `export function installCommand(packageManager) → [cmd, args]`, returning `["pnpm", ["install"]]` or `["npm", ["install", "--no-audit", "--no-fund"]]`;
- `export function addCommand(packageManager, name) → [cmd, args]`, returning `["pnpm", ["add", name]]` or `["npm", ["install", name]]`;
- `createConsumer(parentDir, consumer, tarballByName, packageManager = "pnpm")`.

`runSmoke()` runs every consumer once per package manager.

**Steps:**

- [ ] **Step 1: failing tests.**
  - `test("installCommand maps both package managers")` asserts both tuples above.
  - `test("addCommand maps both package managers")` likewise.
  - `test("unknown package manager throws")` asserts that `installCommand("yarn")` throws `/unsupported package manager/`.
- [ ] **Step 2:** run `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** implement the functions. Replace the two hard-coded `pnpm` calls (`installed-cli-mcp-smoke.mjs:111`, `:127`). Each consumer directory is named `<framework>-<packageManager>`.
- [ ] **Step 4:** run the tests, then `pnpm run build && pnpm run smoke:installed`. Expected: PASS for 3 frameworks × 2 package managers.
- [ ] **Step 5:** commit. Push the B3 PR. Expected CI: "Installed-package smoke (CLI/MCP)" passes and logs both package managers; failure lines are otherwise identical to `main`.

### Task 7: Stage 1 statistics library and deterministic P1/P2 (B4-R1)

**Files:**

- Create: `scripts/perf/stage1-stats.mjs`, `scripts/perf/stage1-stats.test.mjs`.
- Create: `scripts/perf/measure-tree-shaking.mjs`, `scripts/perf/measure-tree-shaking.test.mjs`. This generalizes `scripts/provenance/verify-tree-shaking{,-react,-vue}.mjs`; the originals stay.
- Create: `scripts/perf/run-identity.mjs`.
- Modify: root `package.json` scripts: `"perf:stats:test": "node --test scripts/perf/*.test.mjs"`, `"perf:p2": "node scripts/perf/measure-tree-shaking.mjs"`.

**Interfaces:** Produces:

- `summarize(samples: number[]) → { n, median, p95, iqr, cv }`, nearest-rank p95, sample standard deviation over the mean for `cv`;
- `sameCommitDiff(runA: number[], runB: number[]) → { medianDelta, relativeDelta }`;
- `runIdentity() → { sha, date, node, pnpm, arch, runner, image, browser? }`;
- the JSON artifact shape `{ identity, protocol: { W, R, I }, category, results: Array<{ subject, metric, samples, summary }> }`, used by Tasks 8, 10 and 11.

**Steps:**

- [ ] **Step 1: failing tests.**
  - `summarize([1,2,3,4,5,6,7,8,9,10])` → `median 5.5`, `p95 10`, `iqr 5` (Q3 8 − Q1 3, the inclusive method stated in the file header), `n 10`.
  - `summarize([])` throws `/no samples/`.
  - `sameCommitDiff([10,10],[11,11])` → `{ medianDelta: 1, relativeDelta: 0.1 }`.
  - `measure-tree-shaking`'s pure `classifyBundle(metafile, componentName, otherComponentNames)` returns `{ bytes, foreignComponents: [] }` for a synthetic metafile, and lists a planted foreign module.
- [ ] **Step 2:** run `pnpm run perf:stats:test`. Expected: FAIL. Implement. Expected: PASS.
- [ ] **Step 3:** run `pnpm run build && pnpm run perf:p2 -- --out perf-results/p2.json`. Expected: one entry per exported component per framework, subpath and barrel. `foreignComponents` is empty for subpaths, or each entry is listed as a finding (not hidden). `perf-results/` is git-ignored (add it to `.gitignore`).
- [ ] **Step 4:** commit to branch `feat/w2-b4-perf-stage1`.

### Task 8: Browser harness P3–P7 and SSR P8 (B4-R1)

**Files:**

- Create a perf route in each playground:
  - `apps/playground-angular/src/app/perf/` (route `/perf/:subject`);
  - `apps/playground-react/src/perf/` (route `/perf/:subject`);
  - `apps/playground-vue/src/perf/` (route `/perf/:subject`).
- Create: `scripts/perf/stage1.perf.ts`, `playwright.perf.config.ts` (root, beside the existing `playwright.config.ts`; viewport 1280×720, no throttling).
- Create: `scripts/perf/run-stage1.mjs`.

**Interfaces:**

- **Consumes** Task 7's `summarize`, `runIdentity` and artifact shape.
- **Produces** perf pages that expose `window.__perf = { mount(), unmount(), update(kind), open(), close(), scroll(px) }`. Each method resolves after the next animation frame following the DOM change, the same settle rule in all three frameworks. Each page emits `performance.mark` names `u-perf:<subject>:<phase>:start|end`.

**Subjects (ADR-057 research §4, shipped components only; Tree is listed as "not built"):**

- P3: Button, InputText, Select, DatePicker, Dialog, Popover, Table (100 rows), Scroller.
- P4: Table (1000 rows), DataView, OrganizationChart (React/Vue; Angular not built).
- P5: Table sort, Table filter, Select value.
- P6: Scroller and virtual Table, 10,000 items.
- P7: Dialog, Popover, Drawer, Menu, Select panel, each with motion and with `prefers-reduced-motion: reduce`.
- P8: the existing SSR harness pages; server render time and time to hydrated, from server timing plus a client `u-perf:hydrated` mark; hydration-warning count from the console.

**Steps:**

- [ ] **Step 1: failing spec.** `scripts/perf/stage1.perf.ts` has `test("every subject page exposes __perf and emits marks")`, one per framework × subject. It asserts that `typeof window.__perf.mount === "function"` and that the marks exist after `mount()`. It also has `test("P7 records both motion variants")`, asserting two result sets per overlay subject (Review Focus 5). Run `npx playwright test -c playwright.perf.config.ts`. Expected: FAIL (routes missing).
- [ ] **Step 2:** implement the routes with fixed seeded data (seed `20261017`). Run again. Expected: PASS.
- [ ] **Step 3:** implement `run-stage1.mjs`. It takes `--categories P1..P8`, `--W 5 --R 10 --I 20`, and `--out perf-results/stage1-<sha>.json`. Each run R uses a fresh browser context, and the W warm-up iterations are discarded. P1 reuses `measure-package-size.mjs`'s output.
- [ ] **Step 4:** run a local Docker smoke with `--W 1 --R 2 --I 2`. Expected: a valid artifact for every category. A local run is never recorded as a baseline.
- [ ] **Step 5:** commit.

### Task 9: Stage 1 CI workflow (B4-R1)

**Files:** Create `.github/workflows/perf-stage1.yml`:

- `workflow_dispatch` with input `repeat` (default `2`);
- `runs-on: ubuntu-24.04-arm`, container `mcr.microsoft.com/playwright:v1.63.0-jammy`;
- Node `24.15.0`, frozen install, build, then `node scripts/perf/run-stage1.mjs` once per repeat;
- uploads `perf-results/` as an artifact.

It is non-gating and is not triggered on push or PR, so no existing workflow changes.

**Steps:**

- [ ] **Step 1:** run `actionlint .github/workflows/perf-stage1.yml`. Expected: no findings.
- [ ] **Step 2:** commit. Push the B4 performance PR. After the user authorizes a dispatch on the PR branch, run it with `repeat: 2`. Expected: two artifacts at one SHA (B4-A1).

### Task 10: Record Stage 1 baselines (B4-R2)

**Files:**

- Modify: `docs/architecture/PERFORMANCE.md`, a new section "Stage 1 baselines (ADR-057)" with one table per category. Columns: subject | metric | median | p95 | IQR | CV | same-commit Δ. Plus an identity block (SHA, run IDs, image, runner, Node, browser) and the statement "covers components shipped at `<sha>`; no timing gate; P1 15% gate unchanged".
- Create: `scripts/perf/render-baselines.mjs` and its test.

**Interfaces:**

- **Consumes** two Task 9 artifacts from the same SHA.
- **Produces** `renderBaselineTables(artifactA, artifactB) → string` (Markdown).

**Steps:**

- [ ] **Step 1: failing test.** For two synthetic artifacts, the output contains a row `| Button | mount ms | 1.5 | … |` and a same-commit Δ column computed by `sameCommitDiff`. It throws `/different commits/` when the SHAs differ.
- [ ] **Step 2:** implement. Generate the section from the merged PR's `main` SHA dispatch artifacts, after the PR merges and the user authorizes a `main` dispatch. Commit through its own docs PR, `docs(perf): record Stage 1 baselines`.

### Task 11: Metadata drift check and generated API reference (B4-R3)

**Files:**

- Create: `packages/component-metadata/scripts/check-api-drift.mjs` and `packages/component-metadata/test/check-api-drift.test.ts`.
- Create: `packages/component-metadata/scripts/source-map.json`, mapping each record to `{ ng, react, vue }` source paths. The values are copied from each record's "Ground truth" header comment.
- Create: `packages/component-metadata/scripts/generate-api-docs.mjs`, which writes `packages/<fw>/src/<dir>/<dir>.api.mdx` per record.
- Modify: `packages/{ng,react,vue}/.storybook/main.ts`, adding `@storybook/addon-docs` and the `*.api.mdx` stories glob.
- Modify: `packages/{ng,react,vue}/package.json`, devDependency `"@storybook/addon-docs": "10.6.0"`. This is a new dependency of an existing family. It is subject to the license, install-script and dependency scans already in CI, and is raised for Plan Review here.
- Modify: `packages/component-metadata/package.json` scripts: `"drift:check"`, `"docs:generate"`.
- Modify: `.github/workflows/ci.yml`, adding one step "Metadata API drift check" running `pnpm --filter @ultimate/component-metadata run drift:check` after "Validate generated artifacts".

**Interfaces:**

- `extractApi(framework: "ng"|"react"|"vue", sourcePath: string) → { props: string[], events: string[] }`, using the TypeScript compiler API:
  - **ng:** `input()`/`input.required()` fields; `output()` fields, excluding outputs that only wrap native events;
  - **react:** the component's own `*Props` interface members, excluding inherited native attributes;
  - **vue:** the keys of the `props` object, plus `emits`.
- `diffApi(record: ComponentMetadata, extracted: Record<framework, {props, events}>) → Array<{ framework, kind: "missing-in-record"|"missing-in-source", name }>`.

**Steps:**

- [ ] **Step 1: failing tests.**
  - The Button record against its real sources returns `[]`, including React's `ButtonHTMLAttributes` exclusion (Review Focus 4).
  - A seeded record with an extra prop `ghostProp` returns `[{ framework: "react", kind: "missing-in-source", name: "ghostProp" }]`.
  - A seeded source fixture with an unrecorded prop returns `missing-in-record`.
- [ ] **Step 2:** run `pnpm --filter @ultimate/component-metadata test`. Expected: FAIL. Implement. Expected: PASS. Run `drift:check` on all 8 records. Expected: exit 0. A real drift is reported as a finding to the user, not silently fixed in the record.
- [ ] **Step 3:** implement `generate-api-docs.mjs`. Run `pnpm run storybook:react -- --smoke-test` (and the ng/vue equivalents). Expected: each of the 8 records has a docs page per framework (B4-A4).
- [ ] **Step 4:** commit to branch `feat/w2-b4-doc-tooling`. The edits to `packages/{ng,react,vue}/.storybook/main.ts`, `package.json` and the generated `src/**/*.api.mdx` are watched paths under ADR-061. So this PR adds a truthful `PROVENANCE.md` note: "Storybook docs tooling and generated API pages from Ultimate metadata; no Prime-derived source incorporated". Confirm the diff check passes with `pnpm run provenance:validate -- --base-ref origin/main`.

### Task 12: Metadata coverage report (B4-R3, B4-R4)

**Files:**

- Create: `packages/component-metadata/scripts/coverage-report.mjs` and its test.
- Modify: `packages/component-metadata/package.json`, adding the script `"coverage:report"`.
- Modify: `.github/workflows/ci.yml`, one step "Metadata coverage report" running `pnpm --filter @ultimate/component-metadata run coverage:report`.

**Interfaces:** `shippedComponents(packageJson) → string[]`, derived from each framework package's `exports` subpaths, excluding `.`, `./package.json` and the non-component entries named in the script.

`coverageReport({ shipped, records, skills, stories }) → { missing: Array<{ component, framework, lacks: Array<"record"|"api"|"accessibility"|"guidance"|"skill"|"stories"> }> }`.

The CLI prints the report and exits 0 in report mode. With `--enforce` it exits 1 when `missing` is non-empty. `--enforce` is turned on only after C02, by a later authorized change. Drift stays enforced by Task 11's step from the start.

**Steps:**

- [ ] **Step 1: failing tests.**
  - With shipped `["button","badge"]` and a record for `button` only, the report lists `badge` lacking `record`, `skill` and `stories`.
  - In report mode the process exits 0; with `--enforce` it exits 1.
  - A record without `guidance` lists `guidance`.
- [ ] **Step 2:** implement, then run against the repository. Expected: exit 0. The listed count is recorded in the PR body.
- [ ] **Step 3:** commit. Push the B4 documentation PR. Expected CI: both new steps pass, and failure lines are otherwise identical to `main`.

### Task 13: Release-path verification (B1; starts only at the Spec B1 start gate)

**Gate check:** confirm PR #15's state with `gh pr view 15 --json state,mergeCommit`. Then:

- **Merged (B1-M):** continue to the steps below.
- **The user recorded that it will not merge (B1-R):** stop. The repair returns to Spec Review as an amendment (Spec W2-B1-R2), then to a Plan amendment and Plan Review.
- **Otherwise:** this task stays pending.

**Files:**

- Create: `docs/architecture/research/<date>-c12-first-release-run.md`.
- Modify: `docs/architecture/COMPLETION_REGISTER.md` (C12 section).
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-087: one cross-reference line; status unchanged).

**Steps:**

- [ ] **Step 1: static checks (B1-A1, B1-A2).**
  - `actionlint .github/workflows/release.yml` → clean.
  - `grep -nE 'changesets/action/[a-z-]+@v2'` → no match.
  - `grep -n 'node-version'` → `24.15.0` in every job.
  - `grep -nE 'id-token: write|--provenance'` → no match.
  - `grep -n 'secrets.NPM_TOKEN'` → present on publish.
- [ ] **Step 2:** list `.changeset/*.md` at the run's SHA (Review Focus 1). Identify the first Release run on `main` after the PR #15 merge (`gh run list --workflow release.yml --branch main`) and wait for it to finish. Record each job's conclusion and the path taken:
  - no changesets: `ci-gate` passes, version reports none, `publish-eligibility` is false, publish is skipped;
  - changesets present: a Version Packages PR is opened or updated, and publish is skipped.

  Any other outcome is a defect. Hand it to `superpowers:systematic-debugging`; it is not recorded as success.

- [ ] **Step 3:** write the record (B1-A3, Verified). List as Externally unexercisable: the Version Packages PR cycle, a real restricted publish, `NPM_TOKEN` validity, branch protection, and Actions approval settings (B1-A4). Update C12. Add the GAP-087 cross-reference. Prettier check, commit, PR, compare CI.

---

## Amendment A1 (2026-10-18, user rulings 1–6; Spec Amendment A1, ADR-066)

This section supersedes the text it names. Everything else above stands. It was revised after the independent Plan Review on 2026-10-18; see the Self-review list.

### Task 1a: Integrity check compares only changed rows (B2-R2a, ADR-066) — new

**Branch:** `fix/w2-coverage-integrity-rows` from `origin/main`, as its own PR.

- It must merge before Task 1 and Task 10.
- It merges as one PR, and only after the user confirms the R6 extension (ADR-066 Status). Task 1 and Task 10 cannot pass without the R6 part.
- If the user declines R6, Tasks 1, 2 and 10 stay blocked pending a new ruling. No part of Task 1a is split off to land alone.

**Files:**

- Modify: `scripts/provenance/baseline-lib.mjs`, `scripts/provenance/validate-coverage.mjs`, `scripts/provenance/validate-bundle-size.mjs`.
- Test: `scripts/provenance/baseline-lib.test.mjs`, `validate-coverage.test.mjs`, `validate-bundle-size.test.mjs`.
- Not touched: `PERFORMANCE.md`, any threshold or tolerance, `ci.yml`.

**Interfaces:**

- **`selectBaselinePath`.** `baseline-lib.mjs` exports `selectBaselinePath({ baselineOnly, mergeBaseValue, headValue }) → "integrity" | "regression" | "removed"`:
  - `"removed"` when `mergeBaseValue !== undefined && headValue === undefined`;
  - `"integrity"` when `baselineOnly && headValue !== mergeBaseValue`;
  - otherwise `"regression"`.
  - Values are the parsed numbers from the table Maps, so `89.70` and `89.7` count as unchanged.
- **Reading files at a ref.** `baseline-lib.mjs` also exports `readFileAtRefStrict(ref, path)`:
  - it returns the file text;
  - it returns `null` only when Git reports that the path does not exist at that ref;
  - it throws on every other Git error.

  Keep the existing `readFileAtRef` and its tests.

- **Fail closed.** Both validators use `readFileAtRefStrict` for `PERFORMANCE.md`, and fail when:
  - the file is unreadable at either ref;
  - the merge-base baseline table is empty or missing;
  - `selectBaselinePath` returns `"removed"`.
- **Parser bounds.** `parsePhase10CoverageTable` and `parsePhase10SizeTable` stop at the next heading (`/^#{2,3} /`) after their table starts, so later tables are never read.
- **`vitest.config.ts` (user ruling 1).** For every package, `validate-coverage.mjs` treats `packages/<name>/vitest.config.ts` as package-affecting, so it always takes the regression path.
  - React/Vue keep ADR-060's exact-diff rule.
  - ng and ng-core configure coverage in `angular.json`, which this rule does not cover. That is noted as a limitation.

**Steps:**

- [ ] **Step 1: failing tests.**
  - **Unit tests.**
    - `selectBaselinePath`: all three outcomes, including an added row, and `89.70` vs `89.7` → `"regression"` when baseline-only.
    - `readFileAtRefStrict`: a missing path → `null`; a bad ref → throws.
    - Bounded parsers: a Stage 1 table after Phase 10 with a row `| react | 12.3 | … |` is not read.
  - **Real-Git fixture tests.** Use a temporary repo with a committed merge-base and HEAD, and run the validator CLI with `--base-ref`. For R6 fixtures, commit `packages/<n>/package.json` and `dist/index.mjs` at the merge-base, and compute honest values with the exported `measurePackage`.
    1. The merge-base has `react 85.0` and `cli 86.9`. HEAD writes `react 90.0` (fresh 90.0) and leaves `cli 86.9` (fresh 86.3). → exit 0: react integrity OK, cli regression OK.
    2. Same, with react written `95.0` and fresh `90.0` → exit 1, react INTEGRITY FAIL.
    3. A realistic Stage 1 table, including package-named rows, is appended after Phase 10, with stale coverage and size rows left unchanged → exit 0, and no integrity line printed.
    4. `packages/react/vitest.config.ts` plus a react row change `85.0 → 82.0`, fresh `82.0` → exit 1, REGRESSION FAIL against `85.0`. This is the existing ADR-060 test, kept.
    5. **Inverted existing test.** `validate-coverage.test.mjs`'s "other package R7 keeps its existing per-package diff classification" becomes: `packages/uix-utils/vitest.config.ts` plus a `uix-utils` row change `85.0 → 82.0`, fresh `82.0` → exit 1, REGRESSION FAIL against `85.0`, with no baseline-only line.
    6. A row removed at HEAD → exit 1, "baseline removed".
    7. An unreadable merge-base ref, or a merge-base `PERFORMANCE.md` with no Phase 10 table → exit 1.
  - **R6 equivalents:** cases 1, 2, 3, 6 and 7 for `size:validate`, with a stale `ng` size row left unchanged → exit 0 in case 3.
  - Keep every other existing test.
- [ ] **Step 2:** run `node --test scripts/provenance/baseline-lib.test.mjs scripts/provenance/validate-coverage.test.mjs scripts/provenance/validate-bundle-size.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** implement. Run again: PASS. Run `pnpm run test:scripts`; there must be no new failures.
- [ ] **Step 4:** commit as `fix(baselines): integrity-check only PERFORMANCE.md rows the diff changes`. Open the PR. CI failure lines must be identical to `main`.

### Task 1 (re-baseline): amended

- **Prerequisites:** Task 0 and Task 1a are merged.
- **Diff:** exactly `docs/architecture/PERFORMANCE.md`. It changes only the `react` and `vue` coverage rows, plus, if the user confirms it, exactly one sentence describing those two rows: the measuring CI run, the SHA and the ADR-060 scope. The sentence is **proposed, pending the user's confirmation**. Without confirmation, the re-baseline PR changes only the two rows, and the provenance note goes in the Task 2 closeout record. No other row or section changes. This replaces the original "plus one sentence stating the ADR-060 scope" with that narrower, conditional sentence.
- **Step 4 expected result:**
  - `coverage:validate` prints integrity for react and vue and regression for the other 15;
  - `size:validate` prints no integrity line;
  - both pass.

### Task 6R: CLI-1, CLI-5 and CLI-6 remediation (B3-R4) — replaces Task 6

**Gate:** held until this Amendment passes Plan Review.

**Branch:** `fix/w2-b3-cli-remediation` from `origin/main`. It is a separate PR from #34.

**Files:**

- Modify: `packages/cli/src/cli.ts` (help routing), `packages/cli/README.md`, `scripts/provenance/installed-cli-mcp-smoke.mjs`.
- Create: `packages/cli/src/help.ts`.
- Test: `packages/cli/test/help.test.ts`, `packages/cli/test/commands/{doctor,add,theme}.test.ts`, `scripts/provenance/installed-cli-mcp-smoke.test.mjs`.

**Interfaces:**

- `EXIT_CODES` is a per-command table of `{ code: number | "package-manager exit code", meaning }`. It is the single source for both the help output and the README check. It covers:
  - each command's success, refusal and error exits;
  - missing-argument exits (`add`/`theme`/`generate` → 1);
  - no command → usage, exit 1;
  - unknown command → exit 1;
  - the install-failure pass-through (`add.ts:113`, `theme.ts:153`, `init.ts:130`).
- `renderHelp(command?: string): string`.
- `runCli` returns 0 after printing help for `--help` or `-h`, either globally or as `<cmd> --help` / `<cmd> -h`.

**Steps (TDD, each failing first):**

1. **CLI-1.** These pin existing behaviour; no exit code changes.
   - `doctor` exits 0 on a detected framework, both compatible and incompatible. Assert the incompatible rows in its output (`doctor.ts:157-158`).
   - `doctor` exits 1 when no framework is detected (`doctor.ts:111-117`).
   - `add` and `theme` with no detectable framework exit with their existing refusal code (`add.ts:81-87`, `theme.ts:122-128`), and each refusal message is asserted.
2. **CLI-6.**
   - `ultimate --help` and `-h` list every `KNOWN_COMMANDS` entry with its arguments and exit codes.
   - `ultimate <cmd> --help` and `-h` work for every command. EX-1 (`create`) and EX-2 (the `ai` stub) are shown as documented exceptions, not as implemented commands.
   - A test asserts that every `EXIT_CODES` row appears in both `renderHelp()` and `packages/cli/README.md`.
3. **CLI-5.** The former Task 6 functions (`PACKAGE_MANAGERS`, `installCommand`, `addCommand`, consumers × {pnpm, npm}) plus these npm-specific mechanics:
   - npm consumers get top-level `overrides` (npm ignores `pnpm.overrides`);
   - the lockfile assertion branches by package manager: `pnpm-lock.yaml` for pnpm, `package-lock.json` for npm, so the CLI's `detectPackageManager` really selects npm;
   - an npm OQ-2 probe checks that `npm install <bare @ultimate name>` resolves through `overrides` to the local tarball offline, and fails loudly if it does not.
   - **Stop rule:** if npm cannot resolve bare names offline, stop and report a Plan amendment. Do not add a workaround.
4. **Verification:**
   - `pnpm --filter @ultimate/cli test`;
   - `pnpm run build && pnpm run smoke:installed`, which must log both package managers;
   - `cli` coverage must not regress by more than 2 points against its merge-base row;
   - the research record's CLI table is updated to Met, citing the new tests;
   - commit, push, open the PR, compare CI.

No change to EX-1 or EX-2. No new command or behaviour beyond help output and documentation.

### Task 8b: P7 `openToVisible` ends at first visible (B4-R1 A1) — on PR #35

- **Predicate.** Replace `overlayVisible` in `scripts/perf/browser/harness.ts`. It is true when the overlay root exists and both of these hold:
  - `element.checkVisibility({ opacityProperty: true, visibilityProperty: true })` returns true, which catches ancestors at opacity 0 or with `display: none`;
  - `getBoundingClientRect()` has non-zero width and height.
- **Settle.** The predicate is re-checked on mutation and on every rAF. The settle rule (rAF + microtask) is unchanged, and `close()` is unchanged.
- Update the harness header to describe this.
- **Tests:**
  - **A test-only fixture page,** for example `scripts/perf/browser/fixtures/overlay-visibility.html`, served only by the perf spec. It is not in `stage1-subjects.mjs`, the P7 subjects or the artifacts.
    - `harness.ts` exports `isOverlayVisible(el)`. The spec bundles `harness.ts` with esbuild and injects it with `page.addScriptTag`, the same way for the `createPerfApi` used in the 500 ms case.
    - Each of `display:none`, `visibility:hidden`, `opacity:0` and a zero-size box is not visible.
    - A 500 ms opacity transition from `0.01` to `1` ends `openToVisible` in under 250 ms with `reducedMotion: "no-preference"`. Run it under `page.emulateMedia({ reducedMotion: "reduce" })` as well.
  - Keep `assertVariants`.
- Run the unit tests, the perf spec and a local smoke of `--categories P7`.

### Task 9b: unit-test gate in `perf-stage1.yml` — on PR #35

- Add a step "Perf unit tests" that runs `pnpm run perf:stats:test` after install and before every build or measurement step.
- Run `actionlint`.

### Task 10: amendment

- **Prerequisite:** Task 1a is merged. With the bounded parsers, the Stage 1 tables are never read as baselines, so they may sit after Phase 10.
- **The section must state:**
  - the frame-granularity limitation (about 16.7 ms), and that counts carry the signal;
  - that P2 tree-shaking results are findings, not targets;
  - that no timing threshold is introduced.

### Task 11b: drift classification and narrow exclusions (B4-R3 A1) — on PR #36

**Files:**

- Create:
  - `docs/architecture/research/2026-10-18-w2-b4-metadata-drift-classification.md`;
  - `packages/component-metadata/scripts/drift-exclusions.json`.
- Modify:
  - the affected `packages/component-metadata/src/records/*.ts`, bumping `metadataVersion` by one per changed record via `nextMetadataVersion` (Phase 6 Spec §5.1);
  - `check-api-drift.mjs` and its test.
- Regenerate:
  - `packages/*/src/**/*.api.mdx`, via `docs:generate`;
  - `skills/<component>.md` and `packages/ai/context/llms*.txt`, via `pnpm --filter @ultimate/ai run build`.

**Interfaces:**

- `diffApi` items gain `apiKind: "prop" | "event"`, alongside the existing `framework`, `kind` (`"missing-in-record"` / `"missing-in-source"`) and `name`.
- **Exclusion entry:** `{ component, framework: "ng"|"react"|"vue", apiKind: "prop"|"event", name, rationale, source }`.
  - Every field is required.
  - `source` cites a file:line or an ADR.
  - Wildcards are rejected.
- **`applyExclusions(problems, exclusions) → { remaining, stale, invalid }`** works on structured items, not strings. It suppresses only `kind: "missing-in-record"` items matching `(component, framework, apiKind, name)`. These are never suppressed:
  - `missing-in-source` items;
  - structural problems (a missing map entry, a missing source file, an orphan entry).
- `drift:check` exits 1 when any of the three lists is non-empty.

**Steps:**

- [ ] **Step 1: classify all 49 items** in the research record. For each item, give the source file:line and the record and documented-decision evidence, then a verdict:
  - **Stale record (add the fact):** includes Dialog `role` (ng/vue), the Menu ng `appendTo`/`baseZIndex`/`closeOnEscape`/`onShow`/`onHide`, and the Table GAP-042/044 additions.
  - **Deliberate, documented omission (exclude).** Each must cite an existing record header, ADR or gap that documents it.
  - **Undocumented omission.** Add the fact, unless a documented decision exists. **Stop rule:** any item that is neither a public API fact nor documented is listed for the user. Step 4 is not reached, and PR #36 stays red until the user rules.
- [ ] **Step 2: failing tests** for `applyExclusions`:
  - an exclusion suppresses exactly its item;
  - the same `name` under a different component, framework or `apiKind` is not suppressed;
  - a `missing-in-source` item is never suppressed;
  - a stale exclusion (no matching problem) fails;
  - an unknown component or framework, a missing field or a wildcard is invalid;
  - an unexcluded mismatch fails.
- [ ] **Step 3:** update the records and write the exclusions. Regenerate the pages and the Skills/`llms` artifacts. Run `pnpm run validate`.
- [ ] **Step 4: expected results:**
  - `drift:check` exits 0;
  - `docs:generate -- --check` is OK;
  - `pnpm run validate` passes;
  - `component-metadata` coverage is ≥ 93.85;
  - the provenance FAIL set is unchanged;
  - the PR #36 drift step is green.

  Commit, push, update the PR #36 body. PR #36 stays unmerged until its drift step is green under these rules.

### Task 12: amendment

No code change. The root-barrel denominator is retained. Before `--enforce` is ever enabled, a separate step reconciles the denominator with the C02 component list (Spec B4-R4 A1).

### PR #34 (Tasks 4–5): sequencing

- Marked ready for review on 2026-10-18. Its scope stays Tasks 4–5 only.
- It may merge only after this Amendment passes its review gates and PR #32 merges. Its CI failure lines must still match `main`.
- No other merge is authorized.

---

## Self-review (author)

- **Spec coverage:**
  - B1: Task 13.
  - B2-R1: Task 0. B2-R2a: Task 1a. B2-R2: Task 1. B2-R3/R4: Task 2. B2-R5: Task 3.
  - B3-R1/R2: Task 4. B3-R3: Task 5. B3-R4: Task 6R.
  - B4-R1: Tasks 7–9, plus 8b and 9b. B4-R2: Task 10. B4-R3: Tasks 11, 11b and 12. B4-R4: Task 12.
  - §7's PR list matches the task branches. §8's dependencies are respected: C02 gates `--enforce`, and Tree, Chart and Editor are excluded from the perf subjects.
- **Consistency:**
  - `summarize`, `sameCommitDiff`, `runIdentity` and the artifact shape (Task 7) are used unchanged in Tasks 8–10.
  - `findPeerRangeMismatches` is Task 4 only.
  - `selectBaselinePath` and `readFileAtRefStrict` are Task 1a only.
  - `applyExclusions` and `apiKind` are Task 11b.
  - `EXIT_CODES` and `renderHelp` are Task 6R.
- **A1 Plan Review fixes applied (2026-10-18):**
  - C-1: the `doctor` exit facts.
  - I-1: case 5 inverts an existing test.
  - I-2: strict reads and an empty-table failure.
  - I-4: `apiKind` matching.
  - I-5: Skills/`llms` regeneration and the `metadataVersion` bump.
  - I-6: the single re-baseline sentence.
  - I-8: npm mechanics and a stop rule.
  - I-9: the visibility fixture and the predicate tests.
  - I-10: bounded parsers.
  - Minors: numeric comparison, R6 fixtures, the `EXIT_CODES` shape, `-h`, and the classification stop rule.
- **Points for Plan Review:**
  1. Adding `@storybook/addon-docs@10.6.0` (Task 11; done).
  2. Two new CI steps (Tasks 11–12) and the `workflow_dispatch`-only workflow (Task 9). They add checks; none relaxes one.
  3. Task 11's `PROVENANCE.md` disclosure under ADR-061.
  4. ADR-066's R6 extension, proposed pending the user's confirmation (Task 1a merge gate).
  5. Task 6R's npm stop rule.
