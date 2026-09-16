# Phase 0 — Repository Foundation, Provenance & Baseline Verification

**Status:** Approved — implemented; `docs/architecture/ROADMAP.md` marks Phase 0 (Repository Foundation, Provenance & Baseline Verification) Complete.
**References:** `ULTIMATE_PLATFORM_BLUEPRINT.md` (architecture baseline, v0.1)

---

## Context

The Ultimate Platform repository currently contains only `ULTIMATE_PLATFORM_BLUEPRINT.md`. There is no Git repository, no GitHub remote, no package structure, and no implementation code.

The Blueprint establishes Ultimate as a company-owned, multi-framework UI platform (Angular, React, Vue) derived from MIT-licensed Prime ecosystem source. It names three baseline candidates for independent verification:

- PrimeNG `21.1.9`
- PrimeVue `4.5.5`
- PrimeReact `10.9.8`

This document is the Phase 0 specification: the exact, evidence-backed baseline decisions, provenance requirements, dependency closure, and repository/tooling foundation that must exist before any Prime-derived component migration begins (Phase 1+).

**This is a specification, not an implementation plan.** No code, packages, Git repository, or GitHub repository are created by this document.

**Provenance note on this investigation:** all facts below were verified directly against live sources (npm registry API, GitHub raw file content, GitHub API) during this session, including re-fetching primary `LICENSE.md` files by hand to resolve a conflict between two research passes. Every claim below traces to a URL or command actually executed in-session, not to training-data assumption.

---

## Objective

1. Exact, license-clean Prime source baselines for Angular, Vue, and React, each pinned to a specific commit.
2. A verified PrimeUIX baseline shared across frameworks where applicable.
3. A complete provenance and licensing record format for every incorporated source area.
4. A dependency closure classifying runtime vs. build vs. external vs. Ultimate-owned.
5. An approved monorepo structure, Git/GitHub strategy, and CI foundation — defined, not yet created.
6. A documented, reproducible mechanism for tracing any future Ultimate source back to its exact Prime origin.

---

## Scope

**In scope:** investigation and specification only — baseline selection, licensing/provenance, dependency closure, repository architecture, Git/GitHub strategy, CI foundation, reproducibility mechanism, upstream/security policy, AI/tooling architectural constraints.

**Out of scope (explicit non-goals, deferred to later phases):** component migration, source copying, package renaming, selector renaming, API redesign, theme implementation, CLI implementation, MCP implementation, Skills implementation, AI implementation, Storybook migration, production package publishing, broad refactoring of Prime source. Also out of scope for this task: initializing Git, creating a GitHub repository, cloning/forking Prime repos, modifying the Blueprint.

---

## Research Findings

### Finding 1 — All three primary baseline candidates are confirmed MIT at the blueprint's exact versions

Direct `LICENSE.md` inspection at each tag (not just the npm `license` field, which reads the non-standard string `SEE LICENSE IN LICENSE.md` for all three — this string alone is not evidence of non-MIT status and must not be treated as such by future automated tooling):

- **PrimeNG** ships a dual-license file: an MIT "COMMUNITY VERSIONS" section and a separate commercial CLA for versions carrying an `-lts` suffix. `21.1.9` carries no `-lts` suffix → the MIT section governs. Confirmed via `https://raw.githubusercontent.com/primefaces/primeng/21.1.9/LICENSE.md`.
- **PrimeVue** `4.5.5` — plain MIT, no dual structure. Confirmed via `https://raw.githubusercontent.com/primefaces/primevue/4.5.5/LICENSE.md`.
- **PrimeReact** `10.9.8`/`10.9.9` — plain MIT. Confirmed via `https://raw.githubusercontent.com/primefaces/primereact/10.9.8/LICENSE.md` (and registry manifest for `10.9.9`).

An earlier research pass (one of four parallel investigation forks) incorrectly concluded PrimeNG was non-MIT from 18.0.0 onward and invented a two-wave "ecosystem relicense" narrative. That claim is **rejected** — contradicted by direct primary-source verification performed in this session. It is recorded here only so the false claim is not silently reintroduced later.

### Finding 2 — PrimeReact: use 10.9.9, not 10.9.8; PrimeReact 11 is GA and commercial, not alpha

- `10.9.9` published 2026-08-27 (one day after the blueprint's `10.9.8` candidate), still MIT, is npm's `v10-stable` dist-tag. Recommend as the actual baseline — same line, newest MIT patch. Commit gitHead: `5abcd3cd22dd1f9307a1f79eab7a92ecb4107eea`.
- **The Blueprint's framing of PrimeReact 11 as "alpha" is stale.** npm dist-tags show `latest: 11.1.0`, a non-prerelease GA release (published 2026-08-05, preceded by `11.0.0` GA on 2026-07-15). Its `license` field is `SEE LICENSE IN LICENSE.md`, and — unlike PrimeNG's dual-license file — this is **not** a community/commercial split with an MIT option; it is PrimeTek's commercial "PrimeUI License" line. **Deviation from Blueprint §4/§37:** PrimeReact 11 must be treated as **architectural reference only** (its `@primereact/{core,headless}` package-split pattern is useful prior art for Ultimate's React package boundaries), never as an incorporable source, and the reason is licensing, not maturity.
- PrimeReact 10.x has **zero** `@primeuix/*` dependency (only `react-transition-group`) — confirmed via the published npm manifest. The PrimeUIX coupling is exclusively a PrimeReact 11 architecture change, irrelevant to what Ultimate actually incorporates from React's line.
- PrimeReact's repository root is its Next.js showcase/docs app, not the library — its `package.json` lists demo-only dependencies (`next`, `chart.js`, `docsearch`, `xlsx`, etc.) that must never be treated as library dependencies.

### Finding 3 — PrimeUIX: exact runtime baseline, independently re-derived

Verified directly via `primeng@21.1.9` and `primevue@4.5.5` published dependency manifests (not inferred):

- `primeng@21.1.9` depends on `@primeuix/{utils ^0.7.2, styled ^0.7.4, styles ^2.0.3, motion ^0.0.10}`.
- `primevue@4.5.5` depends on `@primeuix/{utils ^0.6.2, styled ^0.7.4, styles ^2.0.3}` — no `motion`, `forms`, `themes`, or `mcp`.

**License evidence, verified at the strongest available level (actual published npm tarball contents, downloaded and inspected in this session, independent of registry metadata and independent of git history):**

| Package@Version           | LICENSE file in tarball | Copyright line              |
| ------------------------- | ----------------------- | --------------------------- |
| `@primeuix/utils@0.7.2`   | `LICENSE` — MIT License | Copyright (c) 2026 PrimeTek |
| `@primeuix/styled@0.7.4`  | `LICENSE` — MIT License | Copyright (c) 2025 PrimeTek |
| `@primeuix/styles@2.0.3`  | `LICENSE` — MIT License | Copyright (c) 2025 PrimeTek |
| `@primeuix/motion@0.0.10` | `LICENSE` — MIT License | Copyright (c) 2025 PrimeTek |

Further corroborated by PrimeTek's own archived-repo README (`https://raw.githubusercontent.com/primefaces/primeuix/main/README.md`), fetched directly in this session: _"Existing MIT versions remain MIT, forever. Every release published under the MIT license stays exactly as it is."_ This is PrimeTek's own explicit, direct statement, not an inference.

**Commit SHA — confirmed provenance gap, not resolvable from the public repository as it stands.** The `primefaces/primeuix` GitHub repository has exactly one branch (`main`) and only 17 lightweight tags total, none per-package-prefixed, topping out at bare version `0.6.0`. Directly inspecting `packages/utils/package.json` at `main` shows it frozen at version `0.6.4` — the repository's own git history never reached `0.7.2`, `0.7.4`, `2.0.3`, or `0.0.10` on any public ref. Cross-checked against npm registry manifests for all four packages at these exact versions: `gitHead` is `null`/absent on every one of them. This means PrimeTek's CI published these versions from a commit that is not present on any public branch or tag of this repository today — the repo was archived mid-history. This is a genuine upstream provenance gap, verified by direct inspection, not a search failure on Ultimate's part.

**Practical resolution for Ultimate's provenance record:** pin by **exact npm tarball content**, not by git commit SHA, for these four packages. Record the npm tarball's shasum/integrity hash (available from the registry `dist.shasum`/`dist.integrity` fields) as the immutable identifier in place of a commit SHA, and note the git-history gap explicitly in `PROVENANCE.md` rather than fabricating or guessing a SHA. This is consistent with the reproducibility mechanism's own checksum-manifest approach (see Reproducibility Requirements) — it was already the fallback-grade evidence for exactly this scenario.

Per-package MIT ceiling, confirmed via full npm version history for each `@primeuix/*` package:

| Package            | Last stable MIT version                             | Currently `latest` (non-MIT) | Relicense date   |
| ------------------ | --------------------------------------------------- | ---------------------------- | ---------------- |
| `@primeuix/utils`  | `0.7.2`                                             | `0.8.1`                      | 2026-08-10       |
| `@primeuix/styled` | `0.7.4`                                             | `1.0.0`                      | 2026-07-15       |
| `@primeuix/styles` | `2.0.3`                                             | `3.0.0`                      | 2026-07-15       |
| `@primeuix/motion` | `0.1.1` (PrimeNG pins the older `0.0.10`, also MIT) | `1.0.0`                      | 2026-07-15       |
| `@primeuix/forms`  | `0.1.0` (only version ever published; still MIT)    | —                            | never relicensed |
| `@primeuix/themes` | `2.0.3`                                             | `3.0.0`                      | 2026-07-15       |
| `@primeuix/mcp`    | `1.0.1`                                             | `2.0.0`                      | 2026-07-15       |

The `@primeuix/*` family's newer versions carry a commercial "PrimeUI License" (community free tier under revenue/team-size caps, paid tier otherwise, license-key verification) — confirmed by fetching the actual `LICENSE.md` shipped inside `@primeuix/styled@1.0.0`'s package tarball. This is a hard version ceiling: Ultimate must never bump any `@primeuix/*` dependency past its last-MIT version without a fresh legal review.

`@primeuix/forms`, `@primeuix/themes`, `@primeuix/mcp` are **not runtime dependencies of either confirmed baseline** (PrimeNG 21.1.9 or PrimeVue 4.5.5). `@primeuix/mcp` in particular is confirmed to be a standalone Model Context Protocol server tool (depends on `zod` and `@modelcontextprotocol/sdk`), unrelated to UI component runtime — this confirms the Blueprint's implicit assumption. All three are excluded from the Phase 0 core baseline; `themes` may be revisited in Phase 5 (theme architecture) as a separate concern.

The upstream `primefaces/primeuix` GitHub repository is **archived** (`archived: true`, last push 2026-06-28). This is confirmed independently via the GitHub API. Practical implication: whatever Ultimate incorporates from PrimeUIX receives zero further upstream patches — Ultimate is the sole maintainer of any UIX-derived code from day one, not just eventually.

### Finding 4 — No NOTICE/third-party-attribution file exists upstream

None of the four investigated repositories (PrimeNG, PrimeVue, PrimeReact, PrimeUIX) carry a root-level `NOTICE` or `THIRD-PARTY-NOTICES` file at the relevant tags — each has only a single `LICENSE.md`. Any vendored/third-party code within specific source files is not centrally documented upstream and must be discovered per-file during actual Phase 1+ migration, not resolved in Phase 0.

---

## Baseline Selection

| Framework                                | Status                                                         | Version  | Immutable identifier                                                                                                                                                                                                                                                 | License evidence                                                                       | Copyright          |
| ---------------------------------------- | -------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Angular (PrimeNG)                        | **Production Baseline**                                        | `21.1.9` | Git commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` (tag `21.1.9`)                                                                                                                                                                                                 | `LICENSE.md` fetched directly at this commit, community/non-`-lts` MIT section applies | 2016-2026 PrimeTek |
| Vue (PrimeVue)                           | **Production Baseline**                                        | `4.5.5`  | Git commit `66dde6788220fc9e6822342919d1ceb0e3460ece` (tag `4.5.5`)                                                                                                                                                                                                  | `LICENSE.md` fetched directly at this commit, plain MIT                                | 2018-2025 PrimeTek |
| React (PrimeReact)                       | **Production Baseline**                                        | `10.9.9` | Git commit `d0f574e39122668292fc7a740f081bae1b93b1e9` (tag `10.9.9`, confirmed via `GET /repos/primefaces/primereact/git/refs/tags/10.9.9`)                                                                                                                          | `LICENSE.md` fetched directly at this exact commit SHA, plain MIT                      | 2016-2025 PrimeTek |
| React (PrimeReact 11)                    | **Architectural Reference only**                               | `11.1.0` | n/a — not pinned, not incorporated                                                                                                                                                                                                                                   | `license: "SEE LICENSE IN LICENSE.md"`, commercial PrimeUI License, not MIT            | PrimeTek           |
| PrimeUIX — utils                         | **Production Baseline**                                        | `0.7.2`  | **No public git commit exists for this release** (confirmed gap — see Finding 3). Pin by npm tarball `shasum 0ded7f74bddf191f0e16aea34b593a7fcffa94b5` / `integrity sha512-pmEbSfP0Phf9W9RweiM66zXnkn73ZeKyYINElbX3uZ2+stzzaba2svLAl3B1pHVcRw5t43O0VciaGe4ye2EXKw==` | Actual `LICENSE` file extracted from the published tarball, MIT                        | 2026 PrimeTek      |
| PrimeUIX — styled                        | **Production Baseline**                                        | `0.7.4`  | **No public git commit exists for this release.** Pin by npm tarball `shasum d2108a7fad297dea60d549b2c10ed744dc0cbc0e` / `integrity sha512-QSO/NpOQg8e9BONWRBx9y8VGMCMYz0J/uKfNJEya/RGEu7ARx0oYW0ugI1N3/KB1AAvyGxzKBzGImbwg0KUiOQ==`                                 | Actual `LICENSE` file extracted from the published tarball, MIT                        | 2025 PrimeTek      |
| PrimeUIX — styles                        | **Production Baseline**                                        | `2.0.3`  | **No public git commit exists for this release.** Pin by npm tarball `shasum e42d14c138fe092683228d65a3f6de17de70d6a0` / `integrity sha512-2ykAB6BaHzR/6TwF8ShpJTsZrid6cVIEBVlookSdvOdmlWuevGu5vWOScgIwqWwlZcvkFYAGR/SUV3OHCTBMdw==`                                 | Actual `LICENSE` file extracted from the published tarball, MIT                        | 2025 PrimeTek      |
| PrimeUIX — motion                        | **Production Baseline**                                        | `0.0.10` | **No public git commit exists for this release.** Pin by npm tarball `shasum 9af4238226042d80518dd343c6481d03582e374a` / `integrity sha512-PsZwOPq79Scp7/ionshRcQ5xKVf9+zuLcyY5mf6onK8chHT5C9JGphmcIZ4CzcqxuGEpsm8AIbTGy+zS3RtzLA==`                                 | Actual `LICENSE` file extracted from the published tarball, MIT                        | 2025 PrimeTek      |
| PrimeNG `-lts` tags                      | **Rejected Candidate**                                         | —        | —                                                                                                                                                                                                                                                                    | Non-MIT (commercial CLA)                                                               | —                  |
| PrimeReact ≥11.0.0                       | **Rejected Candidate**                                         | —        | —                                                                                                                                                                                                                                                                    | Non-MIT                                                                                | —                  |
| `@primeuix/*` at/above relicense version | **Rejected Candidate**                                         | —        | —                                                                                                                                                                                                                                                                    | Non-MIT                                                                                | —                  |
| `@primeuix/forms`, `themes`, `mcp`       | **Rejected for Phase 0 core** (out of scope, not runtime deps) | —        | —                                                                                                                                                                                                                                                                    | MIT / Non-MIT respectively                                                             | —                  |

**On the PrimeUIX commit-SHA gap:** the `primefaces/primeuix` repository has exactly one branch (`main`, at commit `b9467bc448d3...`) and 17 lightweight tags, none reaching past bare version `0.6.0`. `packages/utils/package.json` at `main` is frozen at version `0.6.4`. All four target versions (`utils@0.7.2`, `styled@0.7.4`, `styles@2.0.3`, `motion@0.0.10`) were published to npm with `gitHead: null` — confirmed absent, not merely unchecked. This is PrimeTek's own upstream gap (the repo was archived mid-history), not a verification failure on Ultimate's part. Tarball shasum/integrity hashes above are the strongest available immutable identifier and are treated as equivalent-grade provenance evidence for these four packages specifically.

---

## Licensing/Provenance Requirements

Every Prime-derived source area incorporated in Phase 1+ must have a provenance record with, at minimum:

```text
Source repository       Source package         Source version
Source commit SHA       Source path             Original license
Copyright holder         Third-party notices     Ultimate destination
Modification status      Modification description  Date incorporated
```

**Phase 0 requirement:** define the record format and storage location; populate only the baseline-level entries above (not component-level — that begins in Phase 1).

**Record format:** `docs/architecture/PROVENANCE.md`, human-readable, one entry per incorporated source area using the field list above as a fixed template. A machine-readable companion (`docs/architecture/provenance.json`) is recommended so CI can validate completeness — exact schema deferred to the implementation plan.

**Notice preservation:** each Ultimate package incorporating Prime-derived source retains a `THIRD-PARTY-NOTICES.md` (original MIT text + PrimeTek copyright) alongside Ultimate's own license file. Exact mechanism (root-level vs. per-package) deferred to the implementation plan.

**Hard version ceilings — CI-enforced, never bump without fresh license review:**

- PrimeNG: non-`-lts` tags only.
- PrimeReact: below `11.0.0`.
- `@primeuix/utils` ≤ `0.7.2`, `styled` ≤ `0.7.4`, `styles` ≤ `2.0.3`, `motion` ≤ `0.0.10`.

**Explicit exclusions from incorporation:**

- PrimeNG `-lts` tags (commercial CLA).
- PrimeReact ≥ `11.0.0` (commercial).
- Any `@primeuix/*` package at or above its relicense version (Finding 3 table).
- `@primeuix/forms`, `@primeuix/themes`, `@primeuix/mcp` (out of scope for Phase 0 core — not runtime deps of confirmed baselines).

**LEGAL REVIEW REQUIRED:** whether re-publishing MIT-derived source under Ultimate's own copyright/branding, at company scale, requires formal legal sign-off beyond the MIT license's own terms (trademark use of "Prime" in documentation, patent grant scope, notice-preservation sufficiency). Not resolved here — flagged for the user/company legal function before Phase 1 component migration begins; not a blocker for Phase 0 exit.

---

## Dependency Requirements

Full transitive closure is an implementation-plan deliverable (requires installing actual lockfiles). Phase 0 establishes the classification model and the direct-dependency facts already gathered:

**Runtime (retained, legitimate framework ecosystem — not vendored):**

- Angular: `@angular/{core,common,forms,cdk,router,platform-browser}` (^21.x per PrimeNG 21.1.9 peer range), `rxjs`, `tslib`.
- Vue: Vue 3.5.x line per PrimeVue 4.5.5 peer requirements.
- React: `react`/`react-dom` `^17.0.0 || ^18.0.0 || ^19.0.0`, `react-transition-group` (PrimeReact's only non-framework runtime dep).

**UIX (candidates for Ultimate-owned adaptation — seed for `UltimateUIX`, not a permanent external dependency):** `@primeuix/{utils@0.7.2, styled@0.7.4, styles@2.0.3, motion@0.0.10}`.

**Must remain external, never vendor:** `@angular/*`, `react`, `vue`, `rxjs`, `tslib` — the no-Prime-runtime-dependency rule targets Prime/PrimeUIX packages specifically, not the underlying frameworks.

**Build-time only, not shipped:** `ng-packagr`, `@angular/cli` (Angular line); PrimeVue's pnpm-based build chain; PrimeReact's `rollup` + `gulp` build.

**Flagged exclusion — copy-paste risk:** PrimeReact's repository root is its Next.js showcase app; its dependencies (`next`, `chart.js`, `docsearch`, `xlsx`, `primeflex`, `quill`, `jspdf`, etc.) belong to the demo site, not the library, and must never be pulled into Ultimate's dependency tree. Migrate only the library source directory, never the showcase app's `package.json`.

---

## Repository Requirements

**Workspace technology / package manager:** pnpm workspaces. Matches PrimeVue's own tooling (the most architecturally modern of the three verified baselines) and pairs cleanly with Changesets (already specified by the Blueprint for release management).

**Monorepo shape:** the Blueprint's proposed structure (§4) is validated as directionally correct and adopted as-is:

```text
ultimate/
├── packages/
│   ├── uix/ uix-utils/ uix-styled/ uix-styles/ uix-motion/
│   ├── ng-core/ ng/
│   ├── react-core/ react/
│   ├── vue-core/ vue/
│   ├── themes/
│   ├── component-schema/ component-metadata/
│   ├── cli/ mcp/ ai/
├── apps/
│   ├── docs/ showcase/ playground-angular/ playground-react/ playground-vue/
├── skills/
├── tooling/
├── scripts/
├── docs/
│   └── architecture/
│       ├── BLUEPRINT.md DECISIONS.md PROVENANCE.md DEPENDENCIES.md
│       ├── COMPATIBILITY.md PACKAGE_ARCHITECTURE.md AI_ARCHITECTURE.md ROADMAP.md
└── .changeset/
```

Names remain provisional per Blueprint §34 — not finalized by this spec. Note for implementation: PrimeReact's own repo is not a monorepo (single npm package + separate Next.js docs app), so Ultimate's extraction tooling cannot assume uniform upstream conventions across all three source repos.

**Test/lint/format/TypeScript:** shared root-level ESLint, Prettier, and TypeScript base config, with per-package overrides where framework tooling requires it (e.g., Angular's own ESLint plugin family). Exact configs are an implementation-plan deliverable.

**Release strategy:** Changesets, independent per-package versioning, no shared version number (Blueprint §21, unchanged).

---

## Git/GitHub Requirements

(Defined here; not executed — no repository is initialized by this document.)

- **Initialization:** `git init`, default branch `main`.
- **Visibility:** private/internal — company-owned platform per Blueprint §1; revisit only if/when a public release strategy is explicitly decided.
- **Branch naming:** `feature/<phase>-<short-description>`, `fix/<short-description>`.
- **Commit conventions:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`), with a dedicated `provenance:`/`chore(provenance):` scope for provenance-record changes so they remain greppable in history.
- **Protected branch strategy:** `main` protected, PR required, at least one review once the team exceeds a single contributor. Exact policy is a repository-settings implementation detail.
- **CODEOWNERS:** deferred — no packages or ownership assignments exist yet in Phase 0.
- **PR expectations:** any PR touching `packages/{uix,ng,react,vue}*` that incorporates Prime-derived source must update `docs/architecture/PROVENANCE.md` in the same PR — CI-enforceable (see CI Requirements).
- **Issue strategy:** GitHub Issues for bug/feature tracking; not mandatory for Phase 0 itself.
- **Release/tag strategy:** Changesets-driven, `@ultimate/<package>@<version>` tag format.

---

## CI Requirements

Minimum CI foundation before Phase 1 begins:

```text
Install        — pnpm install, frozen lockfile
Build          — workspace build orchestration (tool TBD: Turborepo / Nx / plain pnpm — implementation-plan decision)
Test           — workspace test orchestration
Lint           — ESLint across workspace
Typecheck      — TypeScript project references or equivalent
Provenance validation      — PR touching packages/{uix,ng,react,vue}* under a path marked Prime-derived must have a matching PROVENANCE.md entry
Package boundary validation — packages/uix* must contain zero framework-specific (Angular/React/Vue) imports
Prime-runtime-dependency check — no package.json under packages/{ng,react,vue}* may declare a dependency on primeng/primevue/primereact, or any @primeuix/* package above its pinned MIT ceiling
```

Exact CI platform (GitHub Actions assumed, given GitHub hosting) and exact tool choices for build orchestration / dependency-boundary enforcement are implementation-plan decisions, not fixed here.

---

## Reproducibility Requirements

- **Upstream commit SHAs:** recorded in `docs/architecture/PROVENANCE.md` per source area.
- **Recommended mechanism: import script + checksum manifest, not a live Git submodule.** Submodules risk silent upstream mutation or repository deletion — a concrete risk here, since `primeuix` is already archived.
- **Checksums:** SHA-256 of each vendored source tarball, recorded alongside the commit SHA in the provenance record.
- **Import scripts:** idempotent, re-runnable, checked into `scripts/provenance/`, producing the same vendor snapshot from the same pinned commit every time.

Exact script implementation is an implementation-plan deliverable, not written here.

---

## Upstream Strategy

No automatic Prime synchronization (Blueprint §12/§13, unchanged). Security advisories: Prime advisory → Ultimate security review → patch/reject/document, case-by-case. Framework compatibility maintained independently. Historical Prime source bugs fixed within Ultimate when appropriate.

Given the findings above, Ultimate has **no ongoing access to Prime's non-MIT patch stream** — this includes PrimeNG's `-lts` line and PrimeReact 11+. Security advisories affecting the frozen MIT baselines must be manually evaluated and back-ported by Ultimate; they cannot be pulled from upstream.

---

## AI/Tooling Constraints

Restated from Blueprint §14/§2.6/§2.7/§6 — preserved architecturally, not implemented in Phase 0:

- `packages/{cli,mcp,ai}` reserved as directory scaffolding only (empty or placeholder `package.json`).
- These packages must never become a runtime dependency of `packages/{uix,ng,react,vue}*` — enforced by the CI package-boundary check above.
- `component-schema`/`component-metadata` directories reserved for Phase 6+; schema not defined here.
- PrimeVue already ships its own `mcp` and `metadata` packages — useful prior art for Ultimate's later AI Platform phases (6/8); noted for awareness only, no action in Phase 0.

---

## Deliverables

```text
Repository foundation:
  .git/ (main branch), pnpm-workspace.yaml, root package.json,
  .changeset/config.json, directory scaffold (packages/*, apps/*, skills/, tooling/, scripts/, docs/)

Provenance records:
  docs/architecture/PROVENANCE.md (4 baseline-level entries: PrimeNG, PrimeVue, PrimeReact, PrimeUIX-4-packages)
  scripts/provenance/ (import/checksum scripts)
  checksum manifest (format TBD in implementation plan)

Dependency inventory:  docs/architecture/DEPENDENCIES.md
License inventory:     per-package THIRD-PARTY-NOTICES.md stubs
Baseline manifest:     docs/architecture/COMPATIBILITY.md

Architecture records:
  docs/architecture/DECISIONS.md (ADR-001 through ADR-013 per Blueprint §38)
  docs/architecture/PACKAGE_ARCHITECTURE.md
  docs/architecture/AI_ARCHITECTURE.md
  docs/architecture/ROADMAP.md
  docs/architecture/BLUEPRINT.md (copy/reference of root Blueprint)

CI foundation:  .github/workflows/ci.yml (install/build/test/lint/typecheck/provenance/boundary checks)

Git/GitHub configuration:
  Branch protection settings on main (implementation notes, not files)
  CODEOWNERS (stub)

Documentation foundation:  README.md (root)
```

---

## Acceptance Criteria

- [x] PrimeNG (21.1.9), PrimeVue (4.5.5), PrimeReact (10.9.9) baselines approved with exact, directly-verified commit SHAs (all three confirmed via GitHub tag refs and direct `LICENSE.md` fetch at the exact commit in this spec)
- [x] PrimeUIX baseline mapping verified (Finding 3) with direct tarball-content license verification for all 4 packages; commit SHA confirmed **not publicly resolvable** (upstream gap, documented) — pinned instead by npm tarball shasum/integrity hash, treated as equivalent-grade immutable identifier
- [ ] Licensing/provenance documented (`PROVENANCE.md` populated with 4 baseline entries)
- [ ] Dependency closure documented at direct-dependency level (done); full transitive closure is a CI/implementation-plan deliverable
- [ ] Runtime vs. build dependencies classified (done)
- [ ] Repository structure approved (done)
- [ ] Git/GitHub strategy defined (done)
- [ ] CI requirements defined (done)
- [ ] Reproducibility strategy defined (done)
- [ ] Upstream/security strategy defined (done)
- [ ] Unresolved risks explicitly documented (see Risks)
- [ ] Phase 1 prerequisites satisfied: repository exists, provenance tooling exists, CI passes on empty scaffold, `docs/architecture/*` files exist

---

## Risks

| Risk                                                                                                                              | Impact                                                                                              | Likelihood                                                              | Mitigation                                                                                                                                                                   | Decision point                          |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Further Prime relicensing before Phase 1 starts (PrimeReact 10.9.9 shipped one day before this investigation)                     | Medium — pinned baselines could need re-verification                                                | Medium — demonstrated volatility within the investigation window itself | Re-verify all pinned licenses/commits immediately before Phase 1 kickoff, not just at Phase 0 exit                                                                           | Phase 1 kickoff, mandatory gate         |
| Accidental `@primeuix/*` dependency bump past MIT ceiling in a future PR                                                          | High if it happens — commercial licensing code enters a company-owned OSS-derived platform          | Low if CI check implemented, High otherwise                             | CI dependency-ceiling check (specified above) must block any `@primeuix/*` dependency above its pinned MIT version                                                           | Phase 0 CI implementation               |
| Legal exposure from re-publishing MIT-derived source at company scale                                                             | Unknown — could block public release                                                                | Unknown                                                                 | LEGAL REVIEW REQUIRED (flagged); do not treat MIT compliance as fully resolved by this spec                                                                                  | Before any external/public distribution |
| PrimeReact showcase-app dependencies (CDN-fetched `xlsx`, etc.) accidentally copied into Ultimate's tree during migration         | Medium — supply-chain risk from an unreviewed CDN artifact                                          | Low if flagged, Medium if not                                           | Explicit implementation-plan call-out: migrate only the library source directory, never the showcase app's `package.json`                                                    | Phase 3 (UltimateReact) implementation  |
| No NOTICE/THIRD-PARTY file exists upstream in any of the 4 repos — vendored third-party code, if any, is undiscovered             | Medium — unknown unknowns in licensing                                                              | Unknown                                                                 | Per-file license/attribution scan required during actual Phase 1-4 component migration                                                                                       | Phase 1-4 implementation                |
| `primeuix` repo archived — zero future upstream patches for any UIX-derived code                                                  | Medium — Ultimate is sole maintainer from day one, earlier than expected                            | Confirmed                                                               | Treat as a known constraint in Phase 1 planning, not a blocker                                                                                                               | Phase 1 planning                        |
| No public git commit exists for the 4 pinned PrimeUIX package versions (repo's `main` branch history stops before these releases) | Low-Medium — provenance record for these 4 packages relies on tarball shasum rather than commit SHA | Confirmed                                                               | Vendor snapshot for Phase 1 must be taken from the npm tarball directly (verified by shasum), not from a git checkout; record this explicitly in `PROVENANCE.md` per package | Phase 1 vendoring implementation        |
| Package manager (pnpm) diverges from PrimeNG/PrimeReact's own tooling                                                             | Low — tooling friction only                                                                         | Low                                                                     | Standard `pnpm import` or manual lockfile translation when vendoring source                                                                                                  | Phase 0 implementation                  |
| Build-orchestration tool (Turborepo / Nx / plain pnpm) left undecided                                                             | Low-Medium — affects CI implementation shape                                                        | N/A, deliberately deferred                                              | Resolve in implementation plan, not spec                                                                                                                                     | Phase 0 implementation plan             |

---

## Decisions vs Open Questions

### Confirmed decisions (from Blueprint, unchanged)

Company-owned standalone platform; monorepo; independent packages; framework-native implementations; no required Prime runtime dependency; MIT-only provenance; independent theme layer; CLI as orchestrator; MCP as optional tooling; component metadata as first-class; AI/Skills/LLM context as part of platform architecture; independent package versioning; Changesets; no continuous Prime sync.

### Phase 0 decisions (made in this spec, approved by user)

- PrimeNG baseline: `21.1.9`, confirmed as-is (blueprint candidate holds).
- PrimeVue baseline: `4.5.5`, confirmed as-is.
- PrimeReact baseline: `10.9.9` (minor upgrade from blueprint's `10.9.8` candidate — same line, newer MIT patch); `11.1.0` as Architectural Reference only, reclassified from "alpha" to "GA/commercial" per verified evidence.
- PrimeUIX baseline: `@primeuix/{utils@0.7.2, styled@0.7.4, styles@2.0.3, motion@0.0.10}`; `forms`/`themes`/`mcp` excluded from Phase 0 core.
- Package manager / workspace technology: pnpm workspaces.
- Repository visibility: private/internal.

### Open architectural questions (requiring resolution during implementation)

- Exact build-orchestration tool (Turborepo / Nx / plain pnpm scripts).
- Exact machine-readable provenance schema (JSON companion to `PROVENANCE.md`).
- Exact CODEOWNERS assignment (depends on team structure, not yet known).
- LEGAL REVIEW REQUIRED item (re-publishing MIT-derived source at company scale) — not resolvable by this spec.

### Deferred decisions (explicitly postponed to later phases, per Blueprint)

Final corporate themes; advanced AI behavior; additional frameworks; full automated migration system; advanced design-token authoring tools; public ecosystem strategy; exact package names (npm availability check deferred); exact selector prefix; exact CLI command names; exact metadata schema; exact compatibility manifest format.

---

## Phase Exit Criteria

Phase 0 is exited and Phase 1 (UltimateUIX Foundation) may begin when:

1. All items in Acceptance Criteria are checked.
2. The repository is initialized (`git init`, `main` branch, pnpm workspace scaffold, empty `packages/*` directories per the approved structure).
3. `docs/architecture/PROVENANCE.md`, `DECISIONS.md`, `DEPENDENCIES.md`, `COMPATIBILITY.md` exist and contain the baseline-level entries from this spec.
4. CI runs successfully on the empty scaffold (install/build/test/lint/typecheck pass trivially; provenance and boundary checks are present even if trivially satisfied).
5. A fresh re-verification of all pinned baseline licenses/commits has been performed immediately before Phase 1 kickoff and confirms no change.
6. The LEGAL REVIEW REQUIRED item has at minimum been formally routed to the appropriate function, even if not yet resolved.

---

## Non-Goals (restated for implementation-plan authors)

Do not, in Phase 0 implementation:

- Migrate any component.
- Copy Prime source into `packages/*` beyond what the reproducibility mechanism's vendor snapshot requires.
- Rename packages, selectors, or APIs.
- Implement themes, CLI, MCP, Skills, AI, Storybook.
- Publish any package to npm.
- Broadly refactor Prime source.
