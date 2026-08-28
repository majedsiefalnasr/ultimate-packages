# Phase 0 — Repository Foundation, Provenance & Baseline Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the empty Ultimate Platform directory into an initialized, license-clean, CI-validated monorepo scaffold with the four Prime baselines pinned and fully documented — with zero component code migrated.

**Architecture:** A single pnpm workspace monorepo (`packages/*`, `apps/*`, `skills/`, `tooling/`, `scripts/`, `docs/`) initialized as a private GitHub repo on `main`. Provenance, dependency, and compatibility facts from the approved spec are written into `docs/architecture/*.md` files verbatim. A GitHub Actions CI workflow runs install/build/test/lint/typecheck plus three custom validation scripts (provenance completeness, package-boundary, Prime-dependency-ceiling) using plain pnpm recursive scripts — no Turborepo/Nx.

**Tech Stack:** pnpm workspaces, Node.js, TypeScript, ESLint, Prettier, Changesets, GitHub Actions.

## Global Constraints

- Package manager: **pnpm** (workspaces). No Turborepo/Nx — plain `pnpm -r run <script>` for build orchestration (plan-level decision, since spec left this open).
- Default branch: **`main`**.
- Repository visibility: **private/internal**.
- Commit convention: **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`), with `chore(provenance):` for provenance-record changes.
- Hard dependency ceilings (never exceed without fresh license review):
  - PrimeNG: non-`-lts` tags only (baseline `21.1.9`).
  - PrimeReact: below `11.0.0` (baseline `10.9.9`).
  - `@primeuix/utils` ≤ `0.7.2`, `@primeuix/styled` ≤ `0.7.4`, `@primeuix/styles` ≤ `2.0.3`, `@primeuix/motion` ≤ `0.0.10`.
- No component migration, no source copying beyond provenance manifests, no package renaming, no theme/CLI/MCP/AI/Storybook implementation, no npm publishing. (Blueprint §41, spec Non-Goals.)
- No git repository exists yet at plan start — Task 1 creates it.

---

### Task 1: Initialize Git repository and root workspace files

**Files:**

- Create: `.gitignore`
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Test: manual verification via git/pnpm commands (no test framework exists yet)

**Interfaces:**

- Consumes: nothing (first task).
- Produces: an initialized git repo on branch `main`; a pnpm workspace root that all later tasks add packages/scripts into. Root `package.json` name: `ultimate-platform`, `"private": true`, `"packageManager": "pnpm@9.6.0"`.

- [ ] **Step 1: Initialize the git repository**

Run:

```bash
git init -b main
```

Expected output: `Initialized empty Git repository in <path>/.git/`

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules/
dist/
*.tsbuildinfo
.turbo/
.pnpm-store/
*.log
.DS_Store
.env
.env.local
```

- [ ] **Step 3: Create root `package.json`**

```json
{
  "name": "ultimate-platform",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.6.0",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "build": "pnpm -r --if-present run build",
    "test": "pnpm -r --if-present run test",
    "lint": "eslint .",
    "typecheck": "pnpm -r --if-present run typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "provenance:validate": "node scripts/provenance/validate-provenance.mjs",
    "boundary:validate": "node scripts/provenance/validate-boundaries.mjs",
    "ceiling:validate": "node scripts/provenance/validate-dependency-ceiling.mjs"
  },
  "devDependencies": {}
}
```

- [ ] **Step 4: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 5: Create `.npmrc`**

```ini
engine-strict=true
save-exact=true
```

- [ ] **Step 6: Verify pnpm recognizes the workspace**

Run: `pnpm install`
Expected: completes with no packages found yet, exits 0 (e.g. `Lockfile is up to date, resolution step is skipped` or `No projects matched the filters`), creates `pnpm-lock.yaml`.

- [ ] **Step 7: Commit**

```bash
git add .gitignore package.json pnpm-workspace.yaml .npmrc pnpm-lock.yaml
git commit -m "chore: initialize pnpm workspace root"
```

---

### Task 2: Create directory scaffold

**Files:**

- Create: `packages/.gitkeep` (and one per subdirectory below)
- Create: `apps/.gitkeep`
- Create: `skills/.gitkeep`
- Create: `tooling/.gitkeep`
- Create: `scripts/.gitkeep`
- Note: `docs/architecture/` is created as a directory (`mkdir -p`) but does NOT get a `.gitkeep` — Task 3 populates it with `PROVENANCE.md` immediately, so it is never empty long enough to need one.

**Interfaces:**

- Consumes: workspace root from Task 1.
- Produces: the full directory tree the spec's Repository Requirements section defines, ready for later tasks to populate. Git does not track empty directories, so each gets a `.gitkeep` placeholder that later tasks delete once real files land in that directory.

- [ ] **Step 1: Create the full directory tree with placeholders**

Run:

```bash
mkdir -p packages/uix packages/uix-utils packages/uix-styled packages/uix-styles packages/uix-motion
mkdir -p packages/ng-core packages/ng packages/react-core packages/react packages/vue-core packages/vue
mkdir -p packages/themes packages/component-schema packages/component-metadata
mkdir -p packages/cli packages/mcp packages/ai
mkdir -p apps/docs apps/showcase apps/playground-angular apps/playground-react apps/playground-vue
mkdir -p skills tooling scripts/provenance docs/architecture
for d in packages/uix packages/uix-utils packages/uix-styled packages/uix-styles packages/uix-motion \
  packages/ng-core packages/ng packages/react-core packages/react packages/vue-core packages/vue \
  packages/themes packages/component-schema packages/component-metadata \
  packages/cli packages/mcp packages/ai \
  apps/docs apps/showcase apps/playground-angular apps/playground-react apps/playground-vue \
  skills tooling scripts/provenance; do
  touch "$d/.gitkeep"
done
```

- [ ] **Step 2: Verify structure**

Run: `find packages apps skills tooling scripts -type d | sort`
Expected: lists all 24 directories created above (17 under `packages/`, 5 under `apps/`, plus `skills`, `tooling`, `scripts/provenance`).

- [ ] **Step 3: Commit**

```bash
git add packages apps skills tooling scripts docs/architecture
git commit -m "chore: scaffold monorepo directory structure"
```

---

### Task 3: Write PROVENANCE.md with the four baseline entries

**Files:**

- Create: `docs/architecture/PROVENANCE.md`
- Test: manual grep verification (no test framework — this is a documentation deliverable validated by Task 7's script)

**Interfaces:**

- Consumes: exact commit SHAs, versions, license evidence, copyright strings from the approved spec (`docs/superpowers/specs/2026-08-28-phase-0-repository-foundation-design.md`, Baseline Selection table).
- Produces: `docs/architecture/PROVENANCE.md`, the file Task 7's `validate-provenance.mjs` script parses. Each entry is a `##`-level heading matching the exact package name strings `PrimeNG`, `PrimeVue`, `PrimeReact`, `@primeuix/utils`, `@primeuix/styled`, `@primeuix/styles`, `@primeuix/motion` — Task 7 greps for these exact strings, so headings must match exactly. Also consumed by Task 6's vendor-snapshot script for the same 7 immutable identifiers.

- [ ] **Step 1: Write the file**

````markdown
# Provenance Record

This file records the exact origin of every Prime-derived source area incorporated into Ultimate Platform. Phase 0 populates baseline-level entries only; component-level entries are added during Phase 1+ migration.

Field template (per Blueprint §6/§8):

```text
Source repository       Source package         Source version
Source commit SHA       Source path             Original license
Copyright holder         Third-party notices     Ultimate destination
Modification status      Modification description  Date incorporated
```
````

---

## PrimeNG

- **Source repository:** https://github.com/primefaces/primeng
- **Source package:** `primeng`
- **Source version:** `21.1.9`
- **Source commit SHA:** `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`
- **Source path:** `packages/primeng` (monorepo subdirectory)
- **Original license:** MIT (community/non-`-lts` section of the dual-license `LICENSE.md`)
- **Copyright holder:** PrimeTek, 2016-2026
- **Third-party notices:** none found upstream (no root-level `NOTICE` file at this tag)
- **Ultimate destination:** `packages/ng`, `packages/ng-core` (Phase 2)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 2)

## PrimeVue

- **Source repository:** https://github.com/primefaces/primevue
- **Source package:** `primevue`
- **Source version:** `4.5.5`
- **Source commit SHA:** `66dde6788220fc9e6822342919d1ceb0e3460ece`
- **Source path:** `packages/primevue` (monorepo subdirectory)
- **Original license:** MIT
- **Copyright holder:** PrimeTek, 2018-2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/vue`, `packages/vue-core` (Phase 4)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 4)

## PrimeReact

- **Source repository:** https://github.com/primefaces/primereact
- **Source package:** `primereact`
- **Source version:** `10.9.9`
- **Source commit SHA:** `d0f574e39122668292fc7a740f081bae1b93b1e9`
- **Source path:** `components/lib` (library source only — repo root is the Next.js showcase app and must never be treated as library source)
- **Original license:** MIT
- **Copyright holder:** PrimeTek, 2016-2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/react`, `packages/react-core` (Phase 3)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 3)
- **Architectural reference only (not incorporated):** PrimeReact `11.1.0` — commercial "PrimeUI License", not MIT. Its `@primereact/{core,headless}` package-split pattern is useful prior art for Ultimate's React package boundaries, but no source is incorporated from it.

## @primeuix/utils

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/utils`
- **Source version:** `0.7.2`
- **Source commit SHA:** none — confirmed provenance gap (repo's `main` branch history stops at `utils@0.6.4`; npm registry `gitHead` is `null` for this release). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `0ded7f74bddf191f0e16aea34b593a7fcffa94b5`
- **Tarball integrity:** `sha512-pmEbSfP0Phf9W9RweiM66zXnkn73ZeKyYINElbX3uZ2+stzzaba2svLAl3B1pHVcRw5t43O0VciaGe4ye2EXKw==`
- **Source path:** `packages/utils` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2026
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-utils` (Phase 1)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 1)

## @primeuix/styled

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/styled`
- **Source version:** `0.7.4`
- **Source commit SHA:** none — confirmed provenance gap (same cause as `@primeuix/utils` above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `d2108a7fad297dea60d549b2c10ed744dc0cbc0e`
- **Tarball integrity:** `sha512-QSO/NpOQg8e9BONWRBx9y8VGMCMYz0J/uKfNJEya/RGEu7ARx0oYW0ugI1N3/KB1AAvyGxzKBzGImbwg0KUiOQ==`
- **Source path:** `packages/styled` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-styled` (Phase 1)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 1)

## @primeuix/styles

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/styles`
- **Source version:** `2.0.3`
- **Source commit SHA:** none — confirmed provenance gap (same cause as above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `e42d14c138fe092683228d65a3f6de17de70d6a0`
- **Tarball integrity:** `sha512-2ykAB6BaHzR/6TwF8ShpJTsZrid6cVIEBVlookSdvOdmlWuevGu5vWOScgIwqWwlZcvkFYAGR/SUV3OHCTBMdw==`
- **Source path:** `packages/styles` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-styles` (Phase 1)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 1)

## @primeuix/motion

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/motion`
- **Source version:** `0.0.10`
- **Source commit SHA:** none — confirmed provenance gap (same cause as above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `9af4238226042d80518dd343c6481d03582e374a`
- **Tarball integrity:** `sha512-PsZwOPq79Scp7/ionshRcQ5xKVf9+zuLcyY5mf6onK8chHT5C9JGphmcIZ4CzcqxuGEpsm8AIbTGy+zS3RtzLA==`
- **Source path:** `packages/motion` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-motion` (Phase 1)
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 1)

---

**Excluded from Phase 0 core (not runtime dependencies of any confirmed baseline):** `@primeuix/forms`, `@primeuix/themes`, `@primeuix/mcp`. See `docs/architecture/DEPENDENCIES.md` for exclusion rationale.

**Upstream provenance gap note:** the `primefaces/primeuix` GitHub repository has exactly one branch (`main`) and 17 lightweight tags, none reaching past bare version `0.6.0`. All four `@primeuix/*` packages above were published to npm with `gitHead: null`. This is PrimeTek's own upstream gap (repo archived mid-history), not a verification failure — see spec Finding 3 for full detail.

````

- [ ] **Step 2: Verify the file has all 7 required headings**

Run: `grep -c '^## ' docs/architecture/PROVENANCE.md`
Expected: `7` (PrimeNG, PrimeVue, PrimeReact, and 4 `@primeuix/*` packages)

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/PROVENANCE.md
git commit -m "docs(provenance): record 4 Phase 0 baseline provenance entries"
````

---

### Task 4: Write DEPENDENCIES.md, COMPATIBILITY.md, and DECISIONS.md

**Files:**

- Create: `docs/architecture/DEPENDENCIES.md`
- Create: `docs/architecture/COMPATIBILITY.md`
- Create: `docs/architecture/DECISIONS.md`

**Interfaces:**

- Consumes: Dependency Requirements, Baseline Selection, and Blueprint §38 ADR list from the approved spec.
- Produces: three reference docs later tasks and future phases read; no other task depends on their exact internal structure (informational, not parsed by scripts).

- [ ] **Step 1: Write `docs/architecture/DEPENDENCIES.md`**

```markdown
# Dependency Inventory

Classification model and direct-dependency facts established in Phase 0. Full transitive closure is deferred to CI/implementation as lockfiles are installed per package.

## Runtime — retained, legitimate framework ecosystem (never vendor)

| Package                                                                 | Version range                       | Framework line                                      |
| ----------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| `@angular/core`, `common`, `forms`, `cdk`, `router`, `platform-browser` | `^21.x`                             | Angular (per PrimeNG 21.1.9 peer range)             |
| `rxjs`                                                                  | per Angular 21 peer range           | Angular                                             |
| `tslib`                                                                 | per Angular 21 peer range           | Angular                                             |
| Vue 3.x                                                                 | `^3.5.0` line                       | Vue (per PrimeVue 4.5.5 peer range)                 |
| `react`, `react-dom`                                                    | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` | React                                               |
| `react-transition-group`                                                | per PrimeReact 10.9.9               | React (PrimeReact's only non-framework runtime dep) |

## UIX — candidates for Ultimate-owned adaptation (seed for `UltimateUIX`, not permanent external deps)

| Package            | Pinned version | Ceiling (never exceed without license review) |
| ------------------ | -------------- | --------------------------------------------- |
| `@primeuix/utils`  | `0.7.2`        | `0.7.2`                                       |
| `@primeuix/styled` | `0.7.4`        | `0.7.4`                                       |
| `@primeuix/styles` | `2.0.3`        | `2.0.3`                                       |
| `@primeuix/motion` | `0.0.10`       | `0.0.10`                                      |

## Build-time only — not shipped

- `ng-packagr`, `@angular/cli` (Angular line)
- PrimeVue's pnpm-based build chain
- PrimeReact's `rollup` + `gulp` build

## Must remain external — never vendor

`@angular/*`, `react`, `vue`, `rxjs`, `tslib` — the no-Prime-runtime-dependency rule targets Prime/PrimeUIX packages specifically, not the underlying frameworks.

## Excluded — out of scope for Phase 0 core

`@primeuix/forms` (not a runtime dep of PrimeNG 21.1.9 or PrimeVue 4.5.5), `@primeuix/themes` (theme layer is a separate Phase 5 concern), `@primeuix/mcp` (standalone MCP server tool — depends on `zod` and `@modelcontextprotocol/sdk`, unrelated to UI component runtime).

## Flagged exclusion — copy-paste risk

PrimeReact's repository root is its Next.js showcase app. Its dependencies (`next`, `chart.js`, `docsearch`, `xlsx`, `primeflex`, `quill`, `jspdf`, etc.) belong to the demo site, not the library, and must never be pulled into Ultimate's dependency tree during Phase 3 migration. Migrate only the library source directory (`components/lib`), never the showcase app's `package.json`.
```

- [ ] **Step 2: Write `docs/architecture/COMPATIBILITY.md`**

```markdown
# Compatibility / Baseline Manifest

Pinned Phase 0 baselines. Re-verify immediately before Phase 1 kickoff per the spec's Risks section (Prime relicensing volatility observed during Phase 0 investigation itself).

| Framework          | Status                       | Version  | Commit / Identifier                                       | License              |
| ------------------ | ---------------------------- | -------- | --------------------------------------------------------- | -------------------- |
| PrimeNG            | Production Baseline          | `21.1.9` | `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`                | MIT                  |
| PrimeVue           | Production Baseline          | `4.5.5`  | `66dde6788220fc9e6822342919d1ceb0e3460ece`                | MIT                  |
| PrimeReact         | Production Baseline          | `10.9.9` | `d0f574e39122668292fc7a740f081bae1b93b1e9`                | MIT                  |
| PrimeReact 11      | Architectural Reference only | `11.1.0` | not pinned, not incorporated                              | Non-MIT (commercial) |
| `@primeuix/utils`  | Production Baseline          | `0.7.2`  | tarball shasum `0ded7f74bddf191f0e16aea34b593a7fcffa94b5` | MIT                  |
| `@primeuix/styled` | Production Baseline          | `0.7.4`  | tarball shasum `d2108a7fad297dea60d549b2c10ed744dc0cbc0e` | MIT                  |
| `@primeuix/styles` | Production Baseline          | `2.0.3`  | tarball shasum `e42d14c138fe092683228d65a3f6de17de70d6a0` | MIT                  |
| `@primeuix/motion` | Production Baseline          | `0.0.10` | tarball shasum `9af4238226042d80518dd343c6481d03582e374a` | MIT                  |

## Peer/framework compatibility

- Angular: `^21.0.7` and up (PrimeNG 21.1.9 peer range)
- Vue: `^3.5.0` line (PrimeVue 4.5.5 peer range)
- React: `^17.0.0 || ^18.0.0 || ^19.0.0` (PrimeReact 10.9.9 peer range)

## Rejected candidates

PrimeNG `-lts` tags (commercial CLA); PrimeReact `>= 11.0.0` (commercial); any `@primeuix/*` package at or above its relicense version (`utils >= 0.8.0`, `styled >= 1.0.0`, `styles >= 3.0.0`, `motion >= 1.0.0`).
```

- [ ] **Step 3: Write `docs/architecture/DECISIONS.md`**

```markdown
# Architecture Decision Records

## ADR-001 — Ultimate is a company-owned platform

Status: Accepted (Blueprint §1). Ultimate owns the resulting source, public API, package architecture, roadmap, maintenance, tooling, metadata, and AI integration. Prime is a historical technical foundation only.

## ADR-002 — Monorepo architecture

Status: Accepted (Blueprint §4). One monorepo is the source of truth for platform source, shared infrastructure, framework packages, themes, metadata, tooling, documentation, tests, and release configuration. Packages remain independently publishable.

## ADR-003 — Independent package versioning

Status: Accepted (Blueprint §21). No shared version number across packages; a compatibility matrix (`COMPATIBILITY.md`) provides the platform-level relationship.

## ADR-004 — No Prime runtime dependency

Status: Accepted (Blueprint §2.1). Ultimate must ultimately own the runtime implementation of its UI framework packages. No required runtime dependency on PrimeNG, PrimeVue, PrimeReact, or current PrimeUIX packages. Enforced by CI (see `scripts/provenance/validate-dependency-ceiling.mjs`).

## ADR-005 — MIT baseline/provenance strategy

Status: Accepted (Blueprint §2.3, refined by Phase 0 spec). Only MIT-licensed source revisions may be incorporated. Phase 0 verified PrimeNG 21.1.9, PrimeVue 4.5.5, PrimeReact 10.9.9, and 4 `@primeuix/*` packages as MIT via direct primary-source inspection (LICENSE.md at exact commit, or extracted npm tarball content where no commit SHA is publicly resolvable). See `docs/architecture/PROVENANCE.md`.

## ADR-006 — Framework-native implementations

Status: Accepted (Blueprint §2.4). Angular, React, and Vue implementations remain native to their respective frameworks; no forced single rendering implementation across frameworks.

## ADR-007 — Independent theme layer

Status: Accepted (Blueprint §2.5). Themes/presets are a separate layer from component implementations, deferred to Phase 5.

## ADR-008 — CLI as orchestrator

Status: Accepted (Blueprint §19). `@ultimate/cli` orchestrates but must not replace Angular CLI, Vite, or equivalent official framework tooling. Reserved as scaffolding only in Phase 0 (`packages/cli`).

## ADR-009 — Component metadata as source-of-truth

Status: Accepted (Blueprint §17/§18). Component metadata is a first-class, versioned platform artifact. Reserved as scaffolding only in Phase 0 (`packages/component-schema`, `packages/component-metadata`).

## ADR-010 — MCP as optional tooling

Status: Accepted (Blueprint §2.6/§23). MCP must remain optional and never a runtime dependency. Reserved as scaffolding only in Phase 0 (`packages/mcp`).

## ADR-011 — Skills as AI-operational knowledge

Status: Accepted (Blueprint §24). Skills are operational AI guidance, not merely documentation, versioned and tied to compatible component metadata versions. Deferred to Phase 9.

## ADR-012 — LLM context generated from platform knowledge

Status: Accepted (Blueprint §25/§26). Generated outputs (llms.txt etc.) should not become the primary source of truth. Deferred to Phase 9.

## ADR-013 — Security tracking without continuous Prime sync

Status: Accepted (Blueprint §12/§13, confirmed applicable by Phase 0 findings). No automatic Prime synchronization. Security advisories tracked and evaluated case-by-case. Ultimate has no ongoing access to Prime's non-MIT patch stream (PrimeNG `-lts`, PrimeReact 11+) — advisories affecting frozen MIT baselines must be manually evaluated and back-ported.

## ADR-014 — PrimeReact 11 reclassified from "alpha" to "architectural reference, commercially licensed"

Status: Accepted (Phase 0 spec Finding 2, deviation from Blueprint §4's original framing). The Blueprint described PrimeReact 11 as "alpha" and a candidate for architectural reference. Phase 0 investigation found PrimeReact 11 is GA (`11.1.0`, published 2026-08-05) and commercially licensed (PrimeUI License, not MIT) — not merely immature. Confirmed and recorded per the Architectural Deviation Protocol (Blueprint §37): treated as architectural reference only (package-split pattern), never as incorporable source, and the reason is licensing, not maturity.

## ADR-015 — Build orchestration: plain pnpm scripts (no Turborepo/Nx) for Phase 0

Status: Accepted (plan-level decision; spec left this open). Phase 0 has no packages with real cross-package build dependencies yet, so `pnpm -r run <script>` is sufficient. Revisit once Phase 1+ packages create real build-caching needs.
```

- [ ] **Step 4: Verify all three files exist and are non-empty**

Run: `wc -l docs/architecture/DEPENDENCIES.md docs/architecture/COMPATIBILITY.md docs/architecture/DECISIONS.md`
Expected: each file reports a line count greater than 0.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/DEPENDENCIES.md docs/architecture/COMPATIBILITY.md docs/architecture/DECISIONS.md
git commit -m "docs(architecture): add dependency inventory, compatibility manifest, and ADR-001 through ADR-015"
```

---

### Task 5: Copy the Blueprint into `docs/architecture/` and write remaining architecture stub docs

**Files:**

- Create: `docs/architecture/BLUEPRINT.md`
- Create: `docs/architecture/PACKAGE_ARCHITECTURE.md`
- Create: `docs/architecture/AI_ARCHITECTURE.md`
- Create: `docs/architecture/ROADMAP.md`

**Interfaces:**

- Consumes: root `ULTIMATE_PLATFORM_BLUEPRINT.md` (unmodified — the spec's Non-Goals prohibit modifying it; this task copies it, it does not edit the original).
- Produces: reference docs for future phases; no script depends on these.

- [ ] **Step 1: Copy the blueprint (not modify the original)**

Run: `cp ULTIMATE_PLATFORM_BLUEPRINT.md docs/architecture/BLUEPRINT.md`

- [ ] **Step 2: Write `docs/architecture/PACKAGE_ARCHITECTURE.md`**

````markdown
# Package Architecture

Records the approved Phase 0 monorepo package boundaries (Blueprint §4/§5, validated by Phase 0 spec Repository Requirements).

## Runtime dependency direction (Blueprint §6)

```text
Framework Components
        down to
Framework Core
        down to
UltimateUIX
```

## Package boundaries

- **Shared UIX packages** (`packages/uix*`): utilities, styling runtime, style resolution, motion, shared theme infrastructure. Must not contain framework-specific rendering logic — enforced by CI (`scripts/provenance/validate-boundaries.mjs`).
- **Framework core packages** (`packages/{ng,react,vue}-core`): base component behavior, framework lifecycle integration, framework-native event/input mechanisms.
- **Framework component packages** (`packages/{ng,react,vue}`): actual components, public framework APIs, component-specific tests.
- **Theme packages** (`packages/themes`): tokens, semantic values, variants, light/dark modes. Deferred to Phase 5.
- **Metadata packages** (`packages/component-schema`, `packages/component-metadata`): schema, component metadata, API information. Deferred to Phase 6.
- **CLI** (`packages/cli`): orchestration only, never replaces official framework tooling. Deferred to Phase 7.
- **MCP** (`packages/mcp`): optional, never a runtime dependency. Deferred to Phase 8.
- **AI** (`packages/ai`): AI-oriented context generation, Skills packaging. Deferred to Phase 9.

All package names remain provisional per Blueprint §34 until npm availability, internal conventions, and long-term clarity are validated — not finalized by Phase 0.
````

- [ ] **Step 3: Write `docs/architecture/AI_ARCHITECTURE.md`**

````markdown
# AI/Tooling Architecture Constraints

Restated from Blueprint §14/§2.6/§2.7/§6. Phase 0 preserves these constraints architecturally without implementing them.

## Constraints

- `packages/cli`, `packages/mcp`, `packages/ai` are reserved as directory scaffolding only in Phase 0 — no implementation.
- These packages must never become a runtime dependency of `packages/{uix,ng,react,vue}*` — enforced by CI package-boundary check.
- Component metadata (Phase 6+) is expected to live in `packages/component-schema` and `packages/component-metadata`, consumed by `cli`/`mcp`/`ai`/`skills`.

## AI/tooling dependency direction (Blueprint §6)

```text
Component Source
      +
Component Metadata
      +
Documentation
      down to
CLI / MCP / AI / Skills / LLM outputs
```

Prohibited direction: `Ultimate Components -> CLI -> MCP -> AI`. AI and developer tooling must consume platform knowledge; runtime components must not depend on those tools.

## Prior art noted for later phases

PrimeVue 4.5.5 already ships its own `mcp` and `metadata` sibling packages — useful prior art to review during Phase 6/8 planning. No action taken in Phase 0.
````

- [ ] **Step 4: Write `docs/architecture/ROADMAP.md`**

```markdown
# Phase Roadmap

Restated from Blueprint §35. See individual phase specs (`docs/superpowers/specs/`) for implementation-ready detail as each phase begins.

| Phase | Name                                                      | Status                  |
| ----- | --------------------------------------------------------- | ----------------------- |
| 0     | Repository Foundation, Provenance & Baseline Verification | In progress (this plan) |
| 1     | UltimateUIX Foundation                                    | Not started             |
| 2     | UltimateNG                                                | Not started             |
| 3     | UltimateReact                                             | Not started             |
| 4     | UltimateVue                                               | Not started             |
| 5     | Themes                                                    | Not started             |
| 6     | Component Metadata                                        | Not started             |
| 7     | CLI                                                       | Not started             |
| 8     | MCP                                                       | Not started             |
| 9     | AI Skills and LLM Context                                 | Not started             |
| 10    | Production Hardening                                      | Not started             |
```

- [ ] **Step 5: Verify all four files exist**

Run: `ls -la docs/architecture/BLUEPRINT.md docs/architecture/PACKAGE_ARCHITECTURE.md docs/architecture/AI_ARCHITECTURE.md docs/architecture/ROADMAP.md`
Expected: all four files listed, no "No such file" errors.

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/BLUEPRINT.md docs/architecture/PACKAGE_ARCHITECTURE.md docs/architecture/AI_ARCHITECTURE.md docs/architecture/ROADMAP.md
git commit -m "docs(architecture): add blueprint copy, package architecture, AI architecture, and roadmap docs"
```

---

### Task 6: Write the vendor-snapshot import/checksum script

**Files:**

- Create: `scripts/provenance/vendor-snapshot.mjs`
- Create: `docs/architecture/checksums.json` (generated by running the script)

**Interfaces:**

- Consumes: the 7 immutable identifiers from `docs/architecture/PROVENANCE.md` (Task 3) — 3 git commit SHAs (PrimeNG, PrimeVue, PrimeReact) and 4 npm tarball shasums (`@primeuix/*`).
- Produces: `node scripts/provenance/vendor-snapshot.mjs`, an idempotent, re-runnable script (per spec Reproducibility Requirements: "Import scripts: idempotent, re-runnable"). Downloads each pinned source (git archive at the exact commit for PrimeNG/PrimeVue/PrimeReact; npm tarball for the 4 `@primeuix/*` packages), computes a SHA-256 checksum of each downloaded artifact, and writes `docs/architecture/checksums.json`. Does **not** extract or copy source into `packages/*` — that is component migration, out of scope for Phase 0 per the spec's Non-Goals ("do not copy Prime source... beyond what the reproducibility mechanism's vendor snapshot requires"). Downloaded artifacts are written to a git-ignored `.vendor-cache/` directory, not committed — only the checksum manifest is committed, matching the spec's "checksum manifest, not a live Git submodule" recommendation.

- [ ] **Step 1: Add `.vendor-cache/` to `.gitignore`**

Edit `.gitignore` (from Task 1) to add:

```
.vendor-cache/
```

- [ ] **Step 2: Write the script**

```javascript
#!/usr/bin/env node
// scripts/provenance/vendor-snapshot.mjs
//
// Fetches each pinned Phase 0 baseline source artifact (git archive by
// exact commit SHA, or npm tarball where no public commit exists) into
// a local, git-ignored cache, computes its SHA-256 checksum, and writes
// docs/architecture/checksums.json. Idempotent: re-running with the same
// pinned identifiers reproduces the same checksums every time.
//
// This script does NOT extract or copy source into packages/* — that is
// Phase 1+ component migration work, out of scope here.

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";

const CACHE_DIR = ".vendor-cache";
const OUTPUT_PATH = "docs/architecture/checksums.json";

const TARGETS = [
  {
    name: "PrimeNG",
    package: "primeng",
    version: "21.1.9",
    url: "https://codeload.github.com/primefaces/primeng/tar.gz/c493b1c6d9f7cdffbe1c4dc195493dd73d733593",
    identifierType: "git-commit",
    identifier: "c493b1c6d9f7cdffbe1c4dc195493dd73d733593",
  },
  {
    name: "PrimeVue",
    package: "primevue",
    version: "4.5.5",
    url: "https://codeload.github.com/primefaces/primevue/tar.gz/66dde6788220fc9e6822342919d1ceb0e3460ece",
    identifierType: "git-commit",
    identifier: "66dde6788220fc9e6822342919d1ceb0e3460ece",
  },
  {
    name: "PrimeReact",
    package: "primereact",
    version: "10.9.9",
    url: "https://codeload.github.com/primefaces/primereact/tar.gz/d0f574e39122668292fc7a740f081bae1b93b1e9",
    identifierType: "git-commit",
    identifier: "d0f574e39122668292fc7a740f081bae1b93b1e9",
  },
  {
    name: "@primeuix/utils",
    package: "@primeuix/utils",
    version: "0.7.2",
    url: "https://registry.npmjs.org/@primeuix/utils/-/utils-0.7.2.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "0ded7f74bddf191f0e16aea34b593a7fcffa94b5",
  },
  {
    name: "@primeuix/styled",
    package: "@primeuix/styled",
    version: "0.7.4",
    url: "https://registry.npmjs.org/@primeuix/styled/-/styled-0.7.4.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "d2108a7fad297dea60d549b2c10ed744dc0cbc0e",
  },
  {
    name: "@primeuix/styles",
    package: "@primeuix/styles",
    version: "2.0.3",
    url: "https://registry.npmjs.org/@primeuix/styles/-/styles-2.0.3.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "e42d14c138fe092683228d65a3f6de17de70d6a0",
  },
  {
    name: "@primeuix/motion",
    package: "@primeuix/motion",
    version: "0.0.10",
    url: "https://registry.npmjs.org/@primeuix/motion/-/motion-0.0.10.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "9af4238226042d80518dd343c6481d03582e374a",
  },
];

async function downloadAndHash(target) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const destPath = `${CACHE_DIR}/${target.package.replace("/", "__")}-${target.version}.tar.gz`;

  const response = await fetch(target.url);
  if (!response.ok) {
    throw new Error(`download failed for ${target.name}: HTTP ${response.status}`);
  }
  await pipeline(response.body, createWriteStream(destPath));

  const { readFileSync } = await import("node:fs");
  const buffer = readFileSync(destPath);
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  return { destPath, sha256 };
}

async function main() {
  const results = [];
  for (const target of TARGETS) {
    process.stdout.write(`[vendor-snapshot] fetching ${target.name}@${target.version}... `);
    const { destPath, sha256 } = await downloadAndHash(target);
    console.log(`OK (sha256: ${sha256.slice(0, 12)}...)`);
    results.push({
      name: target.name,
      package: target.package,
      version: target.version,
      sourceUrl: target.url,
      identifierType: target.identifierType,
      identifier: target.identifier,
      cachedAt: destPath,
      sha256,
    });
  }

  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), artifacts: results }, null, 2) + "\n"
  );
  console.log(`[vendor-snapshot] wrote ${OUTPUT_PATH} with ${results.length} artifacts`);
}

main().catch((err) => {
  console.error(`[vendor-snapshot] FAILED: ${err.message}`);
  process.exit(1);
});
```

- [ ] **Step 3: Remove the scripts/provenance .gitkeep**

Run: `rm -f scripts/provenance/.gitkeep`

- [ ] **Step 4: Run the script**

Run: `node scripts/provenance/vendor-snapshot.mjs`
Expected output: 7 lines of `[vendor-snapshot] fetching <name>@<version>... OK (sha256: ...)`, followed by `[vendor-snapshot] wrote docs/architecture/checksums.json with 7 artifacts`.

- [ ] **Step 5: Verify `checksums.json` content**

Run: `cat docs/architecture/checksums.json | python3 -m json.tool | head -20`
Expected: valid JSON with a `generatedAt` timestamp and an `artifacts` array of 7 objects, each containing `name`, `package`, `version`, `sourceUrl`, `identifierType`, `identifier`, `cachedAt`, `sha256`.

- [ ] **Step 6: Verify idempotency — re-run and confirm identical checksums**

Run:

```bash
cp docs/architecture/checksums.json /tmp/checksums-run1.json
node scripts/provenance/vendor-snapshot.mjs
diff <(python3 -c "import json; print(json.dumps([a['sha256'] for a in json.load(open('/tmp/checksums-run1.json'))['artifacts']]))") \
     <(python3 -c "import json; print(json.dumps([a['sha256'] for a in json.load(open('docs/architecture/checksums.json'))['artifacts']]))")
echo "diff exit code: $?"
```

Expected: no diff output, `diff exit code: 0` (same 7 sha256 values both runs — confirms idempotency).

- [ ] **Step 7: Clean up temp file**

Run: `rm /tmp/checksums-run1.json`

- [ ] **Step 8: Commit (checksums.json only — `.vendor-cache/` is git-ignored)**

```bash
git add .gitignore scripts/provenance/vendor-snapshot.mjs docs/architecture/checksums.json
git commit -m "feat(provenance): add vendor-snapshot import/checksum script and generate checksums.json"
```

---

### Task 7: Write the provenance validation script

**Files:**

- Create: `scripts/provenance/validate-provenance.mjs`
- Test: run the script directly against the real `PROVENANCE.md` from Task 3

**Interfaces:**

- Consumes: `docs/architecture/PROVENANCE.md` (Task 3), reads `packages/{uix,ng,react,vue}*/**` file paths via `git diff` against a base ref.
- Produces: a Node script invoked as `node scripts/provenance/validate-provenance.mjs [--base-ref <ref>]`, exit code 0 on pass / 1 on fail, consumed by Task 13's CI workflow as `pnpm run provenance:validate`.

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// scripts/provenance/validate-provenance.mjs
//
// Validates that docs/architecture/PROVENANCE.md exists and contains an
// entry for each package area that carries Prime-derived source. In CI,
// also checks that any PR touching packages/{uix,ng,react,vue}* includes
// a PROVENANCE.md update in the same diff.

import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const PROVENANCE_PATH = "docs/architecture/PROVENANCE.md";
const REQUIRED_HEADINGS = [
  "PrimeNG",
  "PrimeVue",
  "PrimeReact",
  "@primeuix/utils",
  "@primeuix/styled",
  "@primeuix/styles",
  "@primeuix/motion",
];
const WATCHED_PATH_PREFIXES = ["packages/uix", "packages/ng", "packages/react", "packages/vue"];

function fail(message) {
  console.error(`[provenance:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[provenance:validate] OK: ${message}`);
}

if (!existsSync(PROVENANCE_PATH)) {
  fail(`${PROVENANCE_PATH} does not exist`);
}

const content = readFileSync(PROVENANCE_PATH, "utf8");
const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

for (const required of REQUIRED_HEADINGS) {
  if (!headings.includes(required)) {
    fail(`missing required PROVENANCE.md entry: "${required}"`);
  }
}
pass(`all ${REQUIRED_HEADINGS.length} required baseline entries present`);

const baseRefIndex = process.argv.indexOf("--base-ref");
const baseRef = baseRefIndex !== -1 ? process.argv[baseRefIndex + 1] : null;

if (baseRef) {
  let changedFiles = [];
  try {
    changedFiles = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch (err) {
    fail(`could not compute git diff against ${baseRef}: ${err.message}`);
  }

  const touchesWatchedPath = changedFiles.some((f) =>
    WATCHED_PATH_PREFIXES.some((prefix) => f.startsWith(prefix))
  );
  const touchesProvenance = changedFiles.includes(PROVENANCE_PATH);

  if (touchesWatchedPath && !touchesProvenance) {
    fail(`diff touches a Prime-derived package path but does not update ${PROVENANCE_PATH}`);
  }
  pass(`diff check against ${baseRef} passed`);
}

console.log("[provenance:validate] all checks passed");
process.exit(0);
```

- [ ] **Step 2: Run the script against the real PROVENANCE.md from Task 3**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected output:

```
[provenance:validate] OK: all 7 required baseline entries present
[provenance:validate] all checks passed
```

Expected exit code: `0`

- [ ] **Step 3: Verify it fails correctly on a missing entry**

Run:

```bash
cp docs/architecture/PROVENANCE.md /tmp/provenance-backup.md
sed -i.bak '/^## PrimeNG$/d' docs/architecture/PROVENANCE.md
node scripts/provenance/validate-provenance.mjs; echo "exit code: $?"
```

Expected output: `[provenance:validate] FAIL: missing required PROVENANCE.md entry: "PrimeNG"` and `exit code: 1`

- [ ] **Step 4: Restore the real file**

Run:

```bash
cp /tmp/provenance-backup.md docs/architecture/PROVENANCE.md
rm docs/architecture/PROVENANCE.md.bak /tmp/provenance-backup.md
node scripts/provenance/validate-provenance.mjs; echo "exit code: $?"
```

Expected: passes again, `exit code: 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/provenance/validate-provenance.mjs
git commit -m "feat(ci): add provenance completeness validation script"
```

---

### Task 8: Write the package-boundary validation script

**Files:**

- Create: `scripts/provenance/validate-boundaries.mjs`
- Test: run directly against the current (empty) `packages/uix*` directories, then against a deliberately-violating fixture

**Interfaces:**

- Consumes: file contents under `packages/uix*/**/*.{ts,tsx,js,jsx}`.
- Produces: `node scripts/provenance/validate-boundaries.mjs`, exit 0/1, consumed by CI as `pnpm run boundary:validate`.

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// scripts/provenance/validate-boundaries.mjs
//
// Fails if any file under packages/uix* imports a framework-specific
// package (Angular, React, or Vue). UIX packages must remain
// framework-neutral per Blueprint §5 (Shared UIX Packages) and
// spec Repository Requirements.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const UIX_PREFIX = "packages/uix";
const FRAMEWORK_IMPORT_PATTERNS = [
  /from\s+["']@angular\//,
  /from\s+["']react["']/,
  /from\s+["']react-dom["']/,
  /from\s+["']vue["']/,
  /require\(["']@angular\//,
  /require\(["']react["']\)/,
  /require\(["']vue["']\)/,
];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function fail(message) {
  console.error(`[boundary:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[boundary:validate] OK: ${message}`);
}

function findUixDirs(root = "packages") {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  return readdirSync(root)
    .filter((name) => name.startsWith("uix"))
    .map((name) => join(root, name));
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const uixDirs = findUixDirs();
if (uixDirs.length === 0) {
  pass("no packages/uix* directories exist yet — nothing to validate");
  process.exit(0);
}

let violations = 0;
for (const dir of uixDirs) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    for (const pattern of FRAMEWORK_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        console.error(
          `[boundary:validate] VIOLATION: ${file} imports a framework-specific package (matched ${pattern})`
        );
        violations++;
      }
    }
  }
}

if (violations > 0) {
  fail(`${violations} framework-specific import(s) found in packages/uix*`);
}

pass(`scanned ${uixDirs.length} uix package(s), zero framework-specific imports found`);
process.exit(0);
```

- [ ] **Step 2: Run against the current empty scaffold**

Run: `node scripts/provenance/validate-boundaries.mjs`
Expected output: `[boundary:validate] OK: no packages/uix* directories exist yet — nothing to validate` (since Task 2's `packages/uix*` dirs only contain `.gitkeep`), exit code `0`.

- [ ] **Step 3: Verify it fails correctly on a violating fixture**

Run:

```bash
mkdir -p packages/uix/src
echo 'import { Component } from "@angular/core";' > packages/uix/src/bad.ts
node scripts/provenance/validate-boundaries.mjs; echo "exit code: $?"
```

Expected output includes: `[boundary:validate] VIOLATION: packages/uix/src/bad.ts imports a framework-specific package` and `[boundary:validate] FAIL: 1 framework-specific import(s) found in packages/uix*`, `exit code: 1`.

- [ ] **Step 4: Remove the fixture**

Run: `rm -rf packages/uix/src`

- [ ] **Step 5: Re-run to confirm clean pass**

Run: `node scripts/provenance/validate-boundaries.mjs; echo "exit code: $?"`
Expected: `exit code: 0`.

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/validate-boundaries.mjs
git commit -m "feat(ci): add UIX package-boundary validation script"
```

---

### Task 9: Write the Prime-dependency-ceiling validation script

**Files:**

- Create: `scripts/provenance/validate-dependency-ceiling.mjs`
- Test: run directly against current (no `package.json` files yet), then against a fixture violating the ceiling

**Interfaces:**

- Consumes: `packages/{ng,react,vue}*/package.json` `dependencies` fields (when they exist).
- Produces: `node scripts/provenance/validate-dependency-ceiling.mjs`, exit 0/1, consumed by CI as `pnpm run ceiling:validate`. Hard-codes the ceiling versions from the spec's Global Constraints — this is the single source of truth other tasks should read the ceiling values from, not re-derive.

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// scripts/provenance/validate-dependency-ceiling.mjs
//
// Fails if any packages/{ng,react,vue}* package.json declares a
// dependency on primeng/primevue/primereact directly, or on any
// @primeuix/* package above its pinned MIT ceiling. Ceilings match
// docs/architecture/DEPENDENCIES.md and PROVENANCE.md exactly.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CEILINGS = {
  "@primeuix/utils": "0.7.2",
  "@primeuix/styled": "0.7.4",
  "@primeuix/styles": "2.0.3",
  "@primeuix/motion": "0.0.10",
};
const FORBIDDEN_DIRECT_DEPS = ["primeng", "primevue", "primereact"];
const WATCHED_PREFIXES = ["ng", "react", "vue"];

function fail(message) {
  console.error(`[ceiling:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[ceiling:validate] OK: ${message}`);
}

function parseVersion(v) {
  const match = v.replace(/^[\^~]/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function exceedsCeiling(actual, ceiling) {
  const a = parseVersion(actual);
  const c = parseVersion(ceiling);
  if (!a || !c) return false;
  for (let i = 0; i < 3; i++) {
    if (a[i] > c[i]) return true;
    if (a[i] < c[i]) return false;
  }
  return false;
}

function findWatchedPackageJsons(root = "packages") {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  const results = [];
  for (const name of readdirSync(root)) {
    if (!WATCHED_PREFIXES.some((prefix) => name.startsWith(prefix))) continue;
    const pkgJsonPath = join(root, name, "package.json");
    if (statSync(pkgJsonPath, { throwIfNoEntry: false })) {
      results.push(pkgJsonPath);
    }
  }
  return results;
}

const pkgJsonPaths = findWatchedPackageJsons();
if (pkgJsonPaths.length === 0) {
  pass("no packages/{ng,react,vue}*/package.json files exist yet — nothing to validate");
  process.exit(0);
}

let violations = 0;
for (const path of pkgJsonPaths) {
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies };

  for (const forbidden of FORBIDDEN_DIRECT_DEPS) {
    if (deps[forbidden]) {
      console.error(
        `[ceiling:validate] VIOLATION: ${path} declares forbidden runtime dependency "${forbidden}"`
      );
      violations++;
    }
  }

  for (const [pkgName, ceiling] of Object.entries(CEILINGS)) {
    const declared = deps[pkgName];
    if (declared && exceedsCeiling(declared, ceiling)) {
      console.error(
        `[ceiling:validate] VIOLATION: ${path} declares ${pkgName}@${declared}, exceeds MIT ceiling ${ceiling}`
      );
      violations++;
    }
  }
}

if (violations > 0) {
  fail(`${violations} dependency-ceiling violation(s) found`);
}

pass(`scanned ${pkgJsonPaths.length} package.json file(s), zero violations`);
process.exit(0);
```

- [ ] **Step 2: Run against the current empty scaffold**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected output: `[ceiling:validate] OK: no packages/{ng,react,vue}*/package.json files exist yet — nothing to validate`, exit code `0`.

- [ ] **Step 3: Verify it fails correctly on a violating fixture**

Run:

```bash
cat > packages/ng/package.json << 'EOF'
{
  "name": "@ultimate/ng",
  "version": "0.0.0",
  "dependencies": {
    "@primeuix/utils": "^0.8.0"
  }
}
EOF
node scripts/provenance/validate-dependency-ceiling.mjs; echo "exit code: $?"
```

Expected output includes: `[ceiling:validate] VIOLATION: packages/ng/package.json declares @primeuix/utils@^0.8.0, exceeds MIT ceiling 0.7.2` and `exit code: 1`.

- [ ] **Step 4: Verify it also catches a forbidden direct dependency**

Run:

```bash
cat > packages/ng/package.json << 'EOF'
{
  "name": "@ultimate/ng",
  "version": "0.0.0",
  "dependencies": {
    "primeng": "^21.1.9"
  }
}
EOF
node scripts/provenance/validate-dependency-ceiling.mjs; echo "exit code: $?"
```

Expected output includes: `[ceiling:validate] VIOLATION: packages/ng/package.json declares forbidden runtime dependency "primeng"` and `exit code: 1`.

- [ ] **Step 5: Remove the fixture**

Run: `rm packages/ng/package.json && touch packages/ng/.gitkeep`

- [ ] **Step 6: Re-run to confirm clean pass**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs; echo "exit code: $?"`
Expected: `exit code: 0`.

- [ ] **Step 7: Commit**

```bash
git add scripts/provenance/validate-dependency-ceiling.mjs packages/ng/.gitkeep
git commit -m "feat(ci): add Prime dependency-ceiling validation script"
```

---

### Task 10: Configure root ESLint, Prettier, and TypeScript base config

**Files:**

- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `tsconfig.base.json`
- Modify: `package.json` (root) — add devDependencies

**Interfaces:**

- Consumes: root `package.json` from Task 1.
- Produces: `eslint .` and `prettier --check .` runnable from repo root; `tsconfig.base.json` for later per-package `tsconfig.json` files to `extends`. Task 13's CI workflow calls these via `pnpm run lint` / `pnpm run format:check`.

- [ ] **Step 1: Add devDependencies to root `package.json`**

Edit the `devDependencies` object in `package.json` (from Task 1) to:

```json
{
  "devDependencies": {
    "eslint": "^9.15.0",
    "@eslint/js": "^9.15.0",
    "typescript-eslint": "^8.15.0",
    "prettier": "^3.3.3",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Write `eslint.config.mjs`**

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ["**/dist/**", "**/node_modules/**", "**/*.gitkeep"],
});
```

- [ ] **Step 3: Write `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 4: Write `.prettierignore`**

```
pnpm-lock.yaml
dist/
node_modules/
*.gitkeep
```

- [ ] **Step 5: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: installs eslint, prettier, typescript, and their plugins with no errors, exit code 0.

- [ ] **Step 7: Verify lint runs clean**

Run: `pnpm run lint`
Expected: exits `0` with no errors (only `.mjs` config files and scripts exist so far, all valid JS).

- [ ] **Step 8: Verify format check runs clean**

Run: `pnpm run format:check`
Expected: exits `0`, reports all matched files use Prettier code style (or the config files just written pass as-is — if not, run `pnpm run format` once and re-check).

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml eslint.config.mjs .prettierrc.json .prettierignore tsconfig.base.json
git commit -m "chore: configure root ESLint, Prettier, and base TypeScript config"
```

---

### Task 11: Configure Changesets

**Files:**

- Create: `.changeset/config.json`
- Create: `.changeset/README.md` (generated by `changeset init`, verify content)
- Modify: `package.json` (root) — add `@changesets/cli` devDependency

**Interfaces:**

- Consumes: root workspace from Task 1.
- Produces: `.changeset/` directory ready for independent per-package versioning once real packages exist (Phase 1+). No other Phase 0 task depends on this directly — it's a Deliverable from the spec (Blueprint §21, spec Repository Requirements "Release strategy: Changesets").

- [ ] **Step 1: Add `@changesets/cli` to root `package.json` devDependencies**

Edit `package.json`'s `devDependencies` to add: `"@changesets/cli": "^2.27.0"`

- [ ] **Step 2: Install and initialize**

Run:

```bash
pnpm install
pnpm exec changeset init
```

Expected: creates `.changeset/config.json` and `.changeset/README.md`, exits 0.

- [ ] **Step 3: Verify `.changeset/config.json` content**

Run: `cat .changeset/config.json`
Expected: valid JSON containing `"$schema": "https://unpkg.com/@changesets/config@.../schema.json"` and an `"access": "restricted"` field (default) — edit the file to set `"access": "restricted"` explicitly if the generated default differs, since Ultimate packages are not yet meant to publish.

- [ ] **Step 4: Verify changeset status runs without error on the empty workspace**

Run: `pnpm exec changeset status`
Expected: exits `0` (may report "No packages found" or similar since no packages have `package.json` files with a `name`+`version` yet — that's expected and correct for Phase 0).

- [ ] **Step 5: Commit**

```bash
git add .changeset package.json pnpm-lock.yaml
git commit -m "chore: configure Changesets for independent package versioning"
```

---

### Task 12: Write THIRD-PARTY-NOTICES.md stubs

**Files:**

- Create: `packages/uix-utils/THIRD-PARTY-NOTICES.md`
- Create: `packages/uix-styled/THIRD-PARTY-NOTICES.md`
- Create: `packages/uix-styles/THIRD-PARTY-NOTICES.md`
- Create: `packages/uix-motion/THIRD-PARTY-NOTICES.md`
- Create: `packages/ng/THIRD-PARTY-NOTICES.md`
- Create: `packages/react/THIRD-PARTY-NOTICES.md`
- Create: `packages/vue/THIRD-PARTY-NOTICES.md`

**Interfaces:**

- Consumes: copyright/license strings from `docs/architecture/PROVENANCE.md` (Task 3).
- Produces: one stub file per package destined to incorporate Prime-derived source (per spec's "Deliverables" section: "per-package THIRD-PARTY-NOTICES.md stubs"). Populated fully once actual source is incorporated in Phase 1+ — Phase 0 records the template and the correct license text only.

- [ ] **Step 1: Write `packages/uix-utils/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `@primeuix/utils@0.7.2`.

## @primeuix/utils

MIT License

Copyright (c) 2026 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See `docs/architecture/PROVENANCE.md` for full provenance detail (tarball shasum, integrity hash, and the confirmed absence of a public git commit for this release).
```

- [ ] **Step 2: Write `packages/uix-styled/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `@primeuix/styled@0.7.4`.

## @primeuix/styled

MIT License

Copyright (c) 2025 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See `docs/architecture/PROVENANCE.md` for full provenance detail.
```

- [ ] **Step 3: Write `packages/uix-styles/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `@primeuix/styles@2.0.3`.

## @primeuix/styles

MIT License

Copyright (c) 2025 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See `docs/architecture/PROVENANCE.md` for full provenance detail.
```

- [ ] **Step 4: Write `packages/uix-motion/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `@primeuix/motion@0.0.10`.

## @primeuix/motion

MIT License

Copyright (c) 2025 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See `docs/architecture/PROVENANCE.md` for full provenance detail.
```

- [ ] **Step 5: Write `packages/ng/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `primeng@21.1.9`.

## PrimeNG

MIT License (PrimeNG Community Versions License section)

Copyright (c) 2016-2026 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**Important:** PrimeNG ships a dual-license `LICENSE.md`. Only the Community Versions (MIT) section applies to the pinned baseline `21.1.9` (no `-lts` suffix). Any future PrimeNG version bump MUST re-verify the absence of an `-lts` suffix before assuming MIT applies — see `docs/architecture/PROVENANCE.md`.

See `docs/architecture/PROVENANCE.md` for full provenance detail.
```

- [ ] **Step 6: Write `packages/react/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `primereact@10.9.9` (library source only, `components/lib` — never the repository's Next.js showcase app).

## PrimeReact

MIT License

Copyright (c) 2016-2025 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**Note:** PrimeReact 11 (`11.1.0`) is architectural reference only — commercially licensed, not incorporated. Only PrimeReact 10.9.9 source may be incorporated here.

See `docs/architecture/PROVENANCE.md` for full provenance detail.
```

- [ ] **Step 7: Write `packages/vue/THIRD-PARTY-NOTICES.md`**

```markdown
# Third-Party Notices

This package will incorporate source derived from `primevue@4.5.5`.

## PrimeVue

MIT License

Copyright (c) 2018-2025 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

See `docs/architecture/PROVENANCE.md` for full provenance detail.
```

- [ ] **Step 8: Remove now-redundant .gitkeep files in these 7 directories**

Run:

```bash
rm -f packages/uix-utils/.gitkeep packages/uix-styled/.gitkeep packages/uix-styles/.gitkeep packages/uix-motion/.gitkeep packages/ng/.gitkeep packages/react/.gitkeep packages/vue/.gitkeep
```

- [ ] **Step 9: Verify all 7 files exist**

Run: `find packages -name THIRD-PARTY-NOTICES.md | wc -l`
Expected: `7`

- [ ] **Step 10: Commit**

```bash
git add packages/uix-utils packages/uix-styled packages/uix-styles packages/uix-motion packages/ng packages/react packages/vue
git commit -m "docs(provenance): add THIRD-PARTY-NOTICES.md stubs for 7 Prime-derived package destinations"
```

---

### Task 13: Write the CI workflow

**Files:**

- Create: `.github/workflows/ci.yml`
- Test: cannot run GitHub Actions locally without a runner — validated by YAML-syntax check and by dry-running each step's underlying command locally

**Interfaces:**

- Consumes: `pnpm run {lint,typecheck,build,test,format:check,provenance:validate,boundary:validate,ceiling:validate}` scripts (Tasks 1, 7, 8, 9, 10).
- Produces: `.github/workflows/ci.yml`, triggered on push/PR to `main`. This is the CI foundation the spec's Acceptance Criteria and Phase Exit Criteria require to "pass on an empty scaffold."

- [ ] **Step 1: Create the `.github/workflows` directory**

Run: `mkdir -p .github/workflows`

- [ ] **Step 2: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Format check
        run: pnpm run format:check

      - name: Typecheck
        run: pnpm run typecheck

      - name: Build
        run: pnpm run build

      - name: Test
        run: pnpm run test

      - name: Provenance validation
        run: pnpm run provenance:validate -- --base-ref origin/main

      - name: Package boundary validation
        run: pnpm run boundary:validate

      - name: Prime dependency-ceiling validation
        run: pnpm run ceiling:validate
```

- [ ] **Step 3: Validate YAML syntax**

Run: `node -e "require('node:fs').readFileSync('.github/workflows/ci.yml', 'utf8')" && python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/ci.yml')); print('valid YAML')"`
Expected output: `valid YAML`
(If `python3`/`yaml` module unavailable, alternately run `pnpm dlx js-yaml .github/workflows/ci.yml > /dev/null && echo "valid YAML"`.)

- [ ] **Step 4: Dry-run each underlying command locally to confirm they all exit 0 on the current scaffold**

Run:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run build
pnpm run test
pnpm run provenance:validate
pnpm run boundary:validate
pnpm run ceiling:validate
echo "all commands exited 0"
```

Expected: every command exits 0 (note: `typecheck`, `build`, and `test` scripts currently resolve via `pnpm -r --if-present run <script>`, which is a no-op success since no packages define these scripts yet — this is expected and correct for Phase 0's empty scaffold), final line prints `all commands exited 0`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add install/lint/format/typecheck/build/test/provenance/boundary/ceiling workflow"
```

---

### Task 14: Write CODEOWNERS stub, README, and finalize repository metadata

**Files:**

- Create: `CODEOWNERS`
- Create: `README.md` (root)
- Create: `LICENSE` (root — Ultimate's own license for Ultimate-authored code, distinct from the per-package THIRD-PARTY-NOTICES)

**Interfaces:**

- Consumes: nothing new.
- Produces: the remaining Deliverables from the spec's Deliverables section not yet covered: "CODEOWNERS (stub)", "README.md (root)".

- [ ] **Step 1: Write `CODEOWNERS`**

```
# CODEOWNERS
#
# Phase 0: no packages or team ownership assignments exist yet.
# This stub is populated once package ownership is decided
# (spec: Git/GitHub Requirements, "CODEOWNERS: deferred").
#
# Example format for future reference:
# /packages/uix-*/  @ultimate-platform/uix-team
# /packages/ng*/    @ultimate-platform/angular-team
# /packages/react*/ @ultimate-platform/react-team
# /packages/vue*/   @ultimate-platform/vue-team
```

- [ ] **Step 2: Write root `README.md`**

````markdown
# Ultimate Platform

A company-owned, multi-framework UI platform derived from selected MIT-licensed Prime ecosystem source baselines. Targets Angular, React, and Vue, with an architecture that remains extensible to additional frameworks.

See `ULTIMATE_PLATFORM_BLUEPRINT.md` for the full architecture baseline, and `docs/architecture/` for provenance, dependency, compatibility, and decision records.

## Status

**Phase 0 — Repository Foundation, Provenance & Baseline Verification.** No component source has been migrated yet. See `docs/architecture/ROADMAP.md` for the full phase plan.

## Repository structure

```text
packages/   Ultimate framework and shared infrastructure packages
apps/       Documentation site, showcase, and framework playgrounds
skills/     AI-operational guidance (Phase 9+)
tooling/    Shared build/lint/test tooling
scripts/    Provenance and validation scripts
docs/       Architecture records, specs, and implementation plans
```
````

## Development

This is a pnpm workspace monorepo.

```bash
pnpm install
pnpm run lint
pnpm run format:check
pnpm run build
pnpm run test
```

## Provenance

Every Prime-derived source area incorporated into this repository is recorded in `docs/architecture/PROVENANCE.md`, including exact source version, commit SHA (or tarball integrity hash where no public commit exists), original license, and copyright holder. See that file before incorporating any new Prime-derived source.

## License

Ultimate-authored code is licensed under the terms in `LICENSE`. Prime-derived source areas retain their original MIT license and copyright notice — see the `THIRD-PARTY-NOTICES.md` file in each package that incorporates such source.

````

- [ ] **Step 3: Write root `LICENSE`**

```text
MIT License

Copyright (c) 2026 Ultimate Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

> **Note for the human reviewer, not an implementation step:** this LICENSE assumes Ultimate-authored code is itself MIT-licensed, which is consistent with using MIT-derived Prime source but is a real licensing choice for the company to make, not something implied by the spec. If the company wants a different license for Ultimate-original code, replace this file's text before Phase 0 exit — flag to the user rather than silently proceeding if unsure.

- [ ] **Step 4: Verify all three files exist**

Run: `ls -la CODEOWNERS README.md LICENSE`
Expected: all three listed, no errors.

- [ ] **Step 5: Commit**

```bash
git add CODEOWNERS README.md LICENSE
git commit -m "docs: add CODEOWNERS stub, root README, and Ultimate LICENSE"
```

---

### Task 15: Full CI dry-run and Phase 0 exit verification

**Files:**

- No new files — this task verifies the accumulated state of the repository against the spec's Acceptance Criteria and Phase Exit Criteria.

**Interfaces:**

- Consumes: everything from Tasks 1-14.
- Produces: a verified, Phase-1-ready repository state. This is the final task — no later task depends on it.

- [ ] **Step 1: Run the full CI command sequence end-to-end**

Run:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run build
pnpm run test
pnpm run provenance:validate
pnpm run boundary:validate
pnpm run ceiling:validate
echo "PHASE 0 CI: ALL CHECKS PASSED"
```

Expected: every command exits 0, final line prints `PHASE 0 CI: ALL CHECKS PASSED`.

- [ ] **Step 2: Verify every Deliverable from the spec exists**

Run:

```bash
test -d .git && echo "git repo: OK"
test -f pnpm-workspace.yaml && echo "pnpm-workspace.yaml: OK"
test -f package.json && echo "root package.json: OK"
test -f .changeset/config.json && echo ".changeset/config.json: OK"
test -f docs/architecture/PROVENANCE.md && echo "PROVENANCE.md: OK"
test -d scripts/provenance && echo "scripts/provenance: OK"
test -f docs/architecture/checksums.json && echo "checksums.json: OK"
test -f docs/architecture/DEPENDENCIES.md && echo "DEPENDENCIES.md: OK"
test -f docs/architecture/COMPATIBILITY.md && echo "COMPATIBILITY.md: OK"
test -f docs/architecture/DECISIONS.md && echo "DECISIONS.md: OK"
test -f docs/architecture/PACKAGE_ARCHITECTURE.md && echo "PACKAGE_ARCHITECTURE.md: OK"
test -f docs/architecture/AI_ARCHITECTURE.md && echo "AI_ARCHITECTURE.md: OK"
test -f docs/architecture/ROADMAP.md && echo "ROADMAP.md: OK"
test -f docs/architecture/BLUEPRINT.md && echo "BLUEPRINT.md: OK"
test -f .github/workflows/ci.yml && echo "ci.yml: OK"
test -f CODEOWNERS && echo "CODEOWNERS: OK"
test -f README.md && echo "README.md: OK"
```

Expected: 17 lines, each ending in `: OK`.

- [ ] **Step 3: Verify branch is `main` and working tree is clean**

Run: `git branch --show-current && git status --porcelain`
Expected: first line prints `main`; second command produces no output (clean working tree — everything committed).

- [ ] **Step 4: Verify no component source was migrated (Non-Goals check)**

Run: `find packages -name '*.ts' -o -name '*.tsx' -o -name '*.vue' | grep -v node_modules`
Expected: no output (zero component source files exist — only `.gitkeep`, `package.json`, and `THIRD-PARTY-NOTICES.md` files under `packages/`, consistent with the spec's explicit Non-Goal "do not migrate any component").

- [ ] **Step 5: Final commit if Step 2-4 required any fixes**

If all checks in Steps 1-4 passed with no fixes needed, this step is a no-op — Phase 0 is complete. If any fix was required, commit it:

```bash
git add -A
git commit -m "chore: final Phase 0 exit verification fixes"
```

---

## Post-plan note

This plan intentionally stops at Phase 0 Exit Criteria (spec's Phase Exit Criteria items 1-4). Two items remain outside any single task's scope because they are not implementation work:

- **Phase Exit Criterion 5** ("fresh re-verification of all pinned baseline licenses/commits immediately before Phase 1 kickoff") — a re-verification step to perform at the start of Phase 1 planning, not part of Phase 0 implementation.
- **Phase Exit Criterion 6** ("LEGAL REVIEW REQUIRED item formally routed") — an organizational action for the user/company legal function, not an engineering task.

Both should be raised to the user explicitly before Phase 1 begins.
