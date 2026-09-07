# Phase 7 — CLI Specification

**Status:** Draft for review
**References:** `docs/architecture/BLUEPRINT.md` §6/§19/§20/§34/§40, `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md` GAP-028, `docs/architecture/DECISIONS.md` ADR-008, `docs/architecture/COMPATIBILITY.md`, `docs/architecture/research/2026-09-07-phase-7-cli-architecture.md`, `packages/component-schema`, `packages/component-metadata`

**This is a specification, not an implementation plan.** No code, package.json files, or CLI behavior is created as a result of this document.

**No architectural fork was encountered while preparing this spec.** Every design decision below either restates an already-approved Blueprint conclusion (§19/§20, ADR-008) or resolves an ordinary scoping question directly from the preceding research pass's evidence (`docs/architecture/research/2026-09-07-phase-7-cli-architecture.md`, §9). Where evidence was insufficient to justify a v1 command or feature, it is marked deferred rather than invented.

---

## 1. Status / Purpose / Scope

**Purpose:** Define the implementation-ready v1 responsibilities, command surface, and package structure for `@ultimate/cli` — the orchestrator Blueprint §19 places above framework-native build tooling and below nothing (it is a leaf consumer, per §6's dependency direction).

**Scope:** The CLI's v1 command surface, its relationship to official framework tooling, its use of `@ultimate/component-metadata` now that GAP-027 is closed, and the minimal compatibility-manifest shape needed to satisfy Blueprint §20 for axes that exist today. This spec defines the contract and boundary; it does not implement `packages/cli`, does not write the compatibility manifest's actual data file, and does not author the CLI's internal argument-parsing or subprocess-invocation code.

**Out of scope for this spec (explicitly, per the source directive):**
- Any Phase 8 (MCP) or Phase 9 (AI Skills/LLM context) contract detail. `ultimate ai` and any Skills-dependent behavior are stubbed/deferred only (§7.3), never designed.
- Resolving MCP-version or AI/Skills-version axes of the compatibility manifest — reserved as unpopulated fields only (§6.3).
- A runtime dependency from `packages/{ng,react,vue}` on the CLI, in either direction — prohibited by Blueprint §6 and not reconsidered here.
- Full authoring of `docs/architecture/COMPATIBILITY.md`'s Ultimate-axis data — this spec defines the manifest's shape, not its populated content for all packages/versions.
- Any code, `package.json`, build config, or test file under `packages/cli/`.
- Migrating the CLI beyond a v1 command subset — the full nine-command conceptual list (Blueprint §19) is intentionally not committed to in v1 (§7).

---

## 2. Architectural Baseline

This spec inherits, without modification:

- **ADR-008** — `@ultimate/cli` orchestrates but must not replace Angular CLI, Vite, or equivalent official framework tooling. Not reopened; §4 makes it concrete and checkable.
- **Blueprint §6's dependency direction** — `Component Source + Component Metadata + Documentation → CLI / MCP / AI / Skills / LLM outputs`, with the reverse direction explicitly prohibited. `@ultimate/cli` consumes `@ultimate/component-metadata` and (later) documentation; nothing in `packages/{ng,react,vue}` may depend on it.
- **Blueprint §34's package naming** — exactly one package, `@ultimate/cli`, already reserved at `packages/cli` since Phase 0 (currently `.gitkeep` only).
- **Phases 0–6, including the just-closed Phase 6 metadata system** (`@ultimate/component-schema`, `@ultimate/component-metadata`, 8-component proof set) — unchanged, not reopened. This spec treats `ALL_COMPONENTS: ComponentMetadata[]` as a stable, real, already-built dependency surface, not something it designs.
- **`docs/architecture/COMPATIBILITY.md`'s existing content** (Prime baseline/peer-range table) — unchanged. This spec adds a distinct, Ultimate-axis manifest concept (§6) alongside it; it does not rewrite or merge into the existing Prime-focused document's content.

This spec resolves, from the preceding research pass (not a new broad investigation):

- What "orchestrator, not build tool" means as a checkable rule, not an abstract phrase (§4).
- The v1 command subset, distinguishing metadata-independent core orchestration from metadata-aware and Skills-dependent features (§7).
- The minimal compatibility-manifest shape satisfying §20 for axes that exist today, with MCP/AI/Skills axes reserved, not designed (§6).

---

## 3. CLI Responsibilities

Per Blueprint §19's responsibility list, confirmed against research and scoped to what v1 concretely supports:

- **Detect/select framework** — identify whether the target project is Angular, React, or Vue (or ask, if ambiguous), so subsequent operations target the correct `@ultimate/{ng,react,vue}` package family.
- **Invoke official framework tooling** — shell out to `ng`, or the project's existing bundler/dev-server invocation, rather than reimplementing any part of their behavior (§4).
- **Install compatible Ultimate packages** — resolve which `@ultimate/*` package versions are compatible with the detected framework version (§6) and invoke the project's package manager to install them.
- **Resolve theme** — apply/configure an `@ultimate/themes` preset into the target project's existing build/style pipeline (writing config and imports, not compiling CSS itself — `@ultimate/themes`, Phase 5, already owns compilation).
- **Diagnose project state (metadata-lite)** — report which of `@ultimate/component-metadata`'s currently-populated components (the real 8-component proof set) are present/absent/outdated in the target project, using `ALL_COMPONENTS` as the source of truth for what "known" means today.
- **Validate compatibility** — check detected versions against the manifest (§6) before installing or generating anything, refusing (with a clear message) rather than silently proceeding on an unrecognized/incompatible combination.

Explicitly **not** v1 CLI responsibilities: compiling or bundling application code; generating full component scaffolds beyond what §7.2 defines; anything requiring an MCP server or AI Skills package (§7.3); authoring the compatibility manifest's full multi-package data set (that is an implementation-time content task, not a spec-level architectural decision).

---

## 4. The "Orchestrator, Not Build Tool" Boundary Test

Per ADR-008 and Blueprint §19's closing sentence ("must not become a replacement for official framework build systems"), restated as a concrete, checkable rule every command definition in §7 must pass:

**A CLI feature is in-bounds (orchestration) if it only needs to:**
1. Read or write configuration/dependency files the target ecosystem already understands (`package.json`, `angular.json`, theme config, import statements), or
2. Invoke an already-installed external tool as a subprocess (`ng generate ...`, the project's package manager, the project's existing build/dev command), or
3. Read `@ultimate/component-metadata` or `docs/architecture/COMPATIBILITY.md`-shaped data to make a decision or produce a report.

**A CLI feature is out-of-bounds (build-tool replacement) if it would require the CLI itself to:**
1. Parse, transform, or compile a framework's component syntax (Angular templates, JSX, Vue SFCs), or
2. Bundle, tree-shake, or otherwise perform what `ng build`/Vite/an equivalent already does, or
3. Run or manage a project's dev server / hot-reload loop itself.

Every command defined in §7 is checked against this test explicitly.

---

## 5. Public API by Package

### `@ultimate/cli`

Responsibility: the orchestrator binary and its command implementations. Ships:

- A CLI entry point (`bin` field in `package.json`) exposing the v1 command subset (§7).
- Framework-detection logic (reads target-project `package.json`/config to identify Angular/React/Vue).
- A compatibility-check module consuming the manifest shape defined in §6.
- A metadata-lite diagnostics module consuming `@ultimate/component-metadata`'s `ALL_COMPONENTS` export.
- Subprocess-invocation wrappers around the target project's package manager and framework CLI — never a reimplementation of what those tools do.

Depends on `@ultimate/component-metadata` (workspace dependency, mirroring how `@ultimate/component-metadata` itself depends on `@ultimate/component-schema`). Depends on no other Ultimate runtime package (`ng`/`react`/`vue`/`themes`) as a *code* dependency — it orchestrates their installation into a *target* project as an external effect, it does not import their runtime code into its own bundle. This preserves §6's prohibited-direction rule by construction: the dependency arrow is `cli → component-metadata`, never `ng/react/vue → cli`, and `cli` itself never imports `packages/{ng,react,vue}` source.

No second package is introduced. Blueprint §34 names exactly one CLI package; nothing in this spec's research found evidence justifying a split (e.g., a separate `create-ultimate` scaffolding package) beyond what `@ultimate/cli` alone can hold at v1 scope.

---

## 6. Compatibility Manifest (Blueprint §20) — v1 Minimal Shape

### 6.1 What exists today vs. what §20 asks for

`docs/architecture/COMPATIBILITY.md` today covers exactly one axis: Prime baseline versions/licenses/peer-ranges. Blueprint §20 asks for a manifest connecting eight axes: framework version, Ultimate framework package, UltimateUIX version, theme version, metadata schema version, CLI version, MCP version, AI/Skills version. Two of those eight axes (MCP version, AI/Skills version) have no committed spec upstream (Phase 8/9 not started) and are explicitly out of scope for this spec to design.

### 6.2 v1 manifest scope

The v1 compatibility manifest is a machine-readable record (conceptually one entry per supported framework major-version line, e.g. Angular `^21.0.7`) connecting exactly the axes that exist today:

```text
CompatibilityEntry: {
  framework: "angular" | "react" | "vue"
  frameworkVersionRange: string       // e.g. "^21.0.7" — mirrors COMPATIBILITY.md's existing peer-range convention
  ultimateFrameworkPackage: { name: string; versionRange: string }   // e.g. "@ultimate/ng", "^0.1.0"
  uixVersionRange: string             // @ultimate/uix-* shared layer compatibility
  themeVersionRange: string           // @ultimate/themes compatibility
  metadataSchemaVersion: string       // exact SCHEMA_VERSION value, not a range — see contract below
  cliVersionRange: string             // @ultimate/cli versions this entry is valid for
}
```

`metadataSchemaVersion` is not a semver range like its sibling fields — it stores the **exact `SCHEMA_VERSION` string value** exported by `@ultimate/component-schema` (per Phase 6's own versioning model, `docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md` §5), and v1 compatibility matching requires **exact string equality** against this field, never a range/compatibility check. This is deliberately distinct from `frameworkVersionRange`/`ultimateFrameworkPackage.versionRange`/`uixVersionRange`/`themeVersionRange`/`cliVersionRange`, which are all semver ranges evaluated with normal range-satisfaction logic (§6.5). The naming (`metadataSchemaVersion`, no `Range` suffix) is itself the signal distinguishing this field's exact-match contract from its range-typed siblings.

### 6.3 Reserved, not designed: MCP and AI/Skills axes

Two fields are named by Blueprint §20 but have no committed upstream spec:

```text
mcpVersionRange?: string       // reserved — populated only once Phase 8 has a committed spec
aiSkillsVersionRange?: string  // reserved — populated only once Phase 9 has a committed spec
```

These fields exist in the shape (so a future schema change is additive, not a breaking rename) but v1 leaves them optional and unpopulated. This mirrors the exact pattern already used repo-wide: `packages/mcp` and a future Skills package were reserved as empty scaffolding directories in Phase 0 before their phases began, and Phase 6's own `ComponentMetadata` schema deferred CLI/MCP/AI-specific sub-shapes rather than stubbing them speculatively. No CLI v1 behavior reads or depends on these two fields.

### 6.4 Ownership, location, and format

The v1 compatibility manifest is a single JSON file at `docs/architecture/compatibility-manifest.json`, sibling to the existing `docs/architecture/checksums.json` — the repository's own established convention for a machine-readable, versioned data artifact living alongside (not inside) the human-authored architecture documents it supports. This is a distinct file from `docs/architecture/COMPATIBILITY.md` (which remains Prime-baseline-only, human-authored, and unmodified by this spec); the two files serve different, non-overlapping axes (Prime baseline provenance vs. Ultimate's own cross-package compatibility) and are not merged.

- **Owner:** the Phase 7 CLI workstream authors and maintains this file's content going forward, the same way Phase 0 established and has maintained `checksums.json`. It is a repository-root architecture artifact, not a `packages/cli`-internal file, because — like `checksums.json` — it documents a fact about the whole platform's compatible combinations, not an implementation detail private to one package.
- **Location:** `docs/architecture/compatibility-manifest.json` (new file; not created by this spec — this spec defines its shape, per §6.2/§6.3, not its populated content).
- **Format:** a single JSON array of `CompatibilityEntry` objects (§6.2 shape), each with the two reserved-but-optional fields from §6.3. Plain JSON, no schema-validation package introduced for it in v1 — consistent with `checksums.json`'s own precedent of being plain, unvalidated-by-tooling JSON.
- **Consumer:** `@ultimate/cli` reads this file at runtime (bundled or fetched from the installed package's own distribution — an implementation-time packaging decision, not an architectural one) to perform the compatibility check defined in §6.5. No other package is expected to consume it in v1; a future Phase 8 MCP server or Phase 9 Skills package consuming it is plausible but not designed here.

No new package is introduced to hold this file — `docs/architecture/checksums.json`'s existing precedent is direct repository evidence that a plain JSON data file living in `docs/architecture/` is the established mechanism for exactly this kind of platform-wide machine-readable fact, and no Blueprint text or repository convention calls for a dedicated package instead.

### 6.5 Resolver behavior — v1 multi-axis matching rule

The v1 compatibility check is a single deterministic rule, evaluated across every axis defined in §6.2, not just framework version:

> A `CompatibilityEntry` matches only when every populated v1 compatibility axis applicable to the target project satisfies its declared constraint. If any required populated axis does not match, or no entry matches, the CLI refuses the operation with a clear diagnostic.

Concretely, for the axes defined in §6.2, this means checking all of:

- the target project's detected framework version against `frameworkVersionRange`;
- the `@ultimate/{ng,react,vue}` package version being installed/present against `ultimateFrameworkPackage.versionRange`;
- the resolved UltimateUIX version against `uixVersionRange`;
- the resolved theme package version against `themeVersionRange`;
- the installed `@ultimate/component-schema`'s `SCHEMA_VERSION` against `metadataSchemaVersion`, by **exact string equality** (§6.2), never a range check;
- the `@ultimate/cli` version performing the check against `cliVersionRange`.

Any command in §7 that installs, generates, or diagnoses (`init`, `add`, `theme`, `doctor`, `generate`) runs this full multi-axis check before proceeding, refusing with a clear diagnostic naming which specific axis failed — never silently proceeding on a partial match, and never falling back to a best-fit or fuzzy resolution across axes. This is exact-match-per-axis-or-refuse in v1, consistent with Phase 6's own minimal-versioning precedent; no sophisticated best-fit/fuzzy resolver is designed or implied. Per §6.3, `mcpVersionRange` and `aiSkillsVersionRange` remain reserved/unpopulated and are excluded from this v1 check entirely — they are never evaluated, matched, or required.

---

## 7. V1 Command Surface

Blueprint §19's own text states its nine-command list is conceptual and "not final." Per the research pass (§7, research doc), v1 selects a concrete subset with buildable value today, explicitly deferring what depends on unstarted phases.

### 7.1 Core orchestration (metadata-independent) — **In v1**

| Command | Responsibility | Boundary-test pass (§4) |
|---|---|---|
| `ultimate init` | Operates on an **existing, already-scaffolded** Angular/React/Vue project — never creates a new framework project. Detects/selects the framework; validates compatibility (§6.5); initializes/configures Ultimate package installation and theme integration into that existing project. | Reads/writes config only — passes. |
| `ultimate add <package>` | Install a specific `@ultimate/*` package via the target project's package manager, after a compatibility check. | Subprocess invocation of the project's package manager — passes. |
| `ultimate theme <preset>` | Configure an `@ultimate/themes` preset into the target project (write config/imports); does not compile CSS itself (`@ultimate/themes` already owns that, Phase 5). | Config write only — passes. |

`ultimate init`'s scope boundary is exact and non-overlapping with `create` (§7.2's deferral below): `init` requires a pre-existing, already-scaffolded Angular/React/Vue project to operate on (an `angular.json`, a `package.json` with a recognizable framework dependency, or equivalent already present) and fails with a clear diagnostic if none is found — it never runs `ng new`, `create-vite`, or any equivalent new-project scaffolding on the target's behalf. Creating a brand-new framework project from nothing remains entirely deferred to `ultimate create` (§7.2), which is not expanded into a v1 implementation by this correction.

### 7.2 Metadata-aware (now unblocked by GAP-027 closing) — **In v1, scoped to real proof-set coverage**

| Command | Responsibility | Boundary-test pass (§4) |
|---|---|---|
| `ultimate doctor` | Report, for each of `@ultimate/component-metadata`'s currently-populated 8 components: installed/missing, and (per §6.5) framework-compatibility status. Must not claim coverage or status for any of the ~107 not-yet-metadata-backed components in `COMPONENT_INVENTORY.md` — report exactly what `ALL_COMPONENTS` contains, nothing implied beyond it. | Reads metadata + config only — passes. |
| `ultimate generate <component>` | For a component present in `ALL_COMPONENTS`, **print to stdout** a minimal, copy-pasteable import statement and usage snippet for the target project's detected framework, built directly from that record's `packages.{framework}.packageName` (import source) and `api.{framework}.props` (a minimal required-props usage example). Refuses with a clear error (non-zero exit) for any component not yet in `ALL_COMPONENTS`, naming the 8-component ceiling. Never writes, creates, or modifies any file in the target project. | Reads metadata only, writes nothing — passes trivially; no source-editing/insertion-point logic exists to design or later replace. |

`ultimate create` (Blueprint's own conceptual "scaffold a brand-new project" command) is **deferred**, not because it depends on unstarted phases, but because it is a strict superset of `init` requiring project-template authoring decisions (which starter templates, for which frameworks) that have no repository precedent or Blueprint-mandated shape yet — an implementation-time content question, not an architectural one, and out of scope for a specification whose job is the CLI's structural contract.

### 7.3 Skills/AI-dependent — **Stubbed only, not designed**

| Command | v1 treatment |
|---|---|
| `ultimate ai` | Not implemented in v1. If invoked, must print a clear "not yet available — Phase 9 (AI Skills) is not started" message and exit non-zero. No Skills-package contract, no AI-context shape, is designed by this spec. |
| `ultimate migrate` | Deferred entirely in v1 — Blueprint's conceptual description does not specify enough for this spec to scope safely without inventing migration-tooling architecture (a real gap, not resolvable from existing evidence per the research pass). Not stubbed as a command at all in v1; left absent rather than a misleading stub, since "migrate" implies existing functionality that stub-text would misrepresent. |
| `ultimate update` | Deferred entirely in v1, same reasoning as `migrate` — updating installed Ultimate packages safely is coupled to the same not-yet-designed migration/compatibility-transition logic. |

---

## 8. Package Structure and Conventions

`@ultimate/cli` follows the same uniform shape already established by every other Ultimate package (`component-schema`, `component-metadata`, and prior phases):

- `type: "module"`, ESM-only build via `tsup`, `.d.mts` types (matching `packages/component-metadata/package.json`'s exact pattern).
- `workspace:*` dependency on `@ultimate/component-metadata`.
- `vitest run --typecheck` for tests, `tsc --noEmit` for a separate `typecheck` script — matching the exact script names already uniform across the repo's packages.
- Additionally (new, because this package ships an executable): a `bin` field in `package.json` pointing at the compiled CLI entry, per Node.js/npm's standard convention for shipping a CLI binary — no repository precedent contradicts this, and it is the minimal standard mechanism, not a novel one.

### 8.1 Package-manager scope — two distinct audiences, not a conflict

The monorepo's own dev tooling is pnpm-only (`packageManager: "pnpm@9.6.0"`, root `package.json`) — this governs how `@ultimate/cli` itself is built and tested inside this repository and is unchanged by this spec. Separately, Blueprint §19 requires the *shipped CLI binary* to "support common package managers where practical" when acting on a **consumer's** project (npm, yarn, or pnpm, detected from the consumer project's lockfile). These are different audiences and do not conflict; the specification states this explicitly so it is not later mistaken for an unresolved question.

---

## 9. Explicit Non-Goals / Deferrals

Restated as a single consolidated list:

- `ultimate ai` — stubbed with a clear not-yet-available message only; no Skills/AI contract designed (Phase 9 unstarted).
- `ultimate migrate` / `ultimate update` — deferred entirely, absent from v1's command surface (not even stubbed) pending a real migration/compatibility-transition design this spec's evidence cannot yet support.
- `ultimate create` — deferred; requires project-template content decisions out of this spec's structural scope.
- MCP-version and AI/Skills-version compatibility-manifest axes — reserved as optional, unpopulated fields only (§6.3); never resolved or checked by v1 CLI logic.
- Full authoring of the compatibility manifest's actual multi-package version data — this spec defines the shape (§6.2), not the populated content.
- Metadata coverage claims beyond the real 8-component proof set — `ultimate doctor`/`ultimate generate` must report exactly what `ALL_COMPONENTS` contains, never implying broader coverage.
- Any runtime dependency from `packages/{ng,react,vue}` on `@ultimate/cli` — prohibited by Blueprint §6, not reconsidered.
- Any change to `docs/architecture/COMPATIBILITY.md`'s existing Prime-baseline content — unmodified by this spec.

None of these are Blueprint §19/§20-mandated-for-Phase-7 items being incorrectly deferred — each is either addressed at v1-minimal, evidence-backed scope (§7.1/§7.2) or is genuinely blocked on an unstarted phase or an unresolvable content-authoring question outside this spec's structural mandate.

---

## 10. Specification Quality Gate (self-check, re-run after correction pass)

1. Can an implementation team implement Phase 7 v1 without making fundamental architectural decisions? **Yes** — §7 defines the concrete command subset (including `init`'s exact existing-project-only boundary and `generate`'s exact stdout-only mechanism), and §4/§6 give checkable rules for anything not explicitly listed.
2. Does the CLI remain an orchestrator, never a build-tool replacement? **Yes** — §4's boundary test is applied to every §7 command explicitly; `generate`'s stdout-only mechanism (§7.2) trivially passes with no source-editing logic to design.
3. Does it preserve Blueprint §6's dependency direction? **Yes** — §5 states the dependency arrow explicitly (`cli → component-metadata`, never the reverse); no `packages/{ng,react,vue}` change is proposed or required. Unchanged by this correction pass.
4. Does it use `@ultimate/component-metadata` now that GAP-027 is closed, without overclaiming coverage? **Yes** — §7.2 explicitly scopes `doctor`/`generate` to the real 8-component `ALL_COMPONENTS` set; `generate`'s refusal message (§7.2) explicitly names this ceiling. The eight-component ceiling is unchanged and remains explicit throughout.
5. Does it define a compatibility-manifest shape satisfying §20 for all eight axes named there? **Yes** — §6.1 now correctly counts eight axes; §6.2 models the six axes with committed upstream specs; §6.3 reserves the remaining two (MCP, AI/Skills) as unpopulated fields, matching §20's own full axis count without designing the two unstarted-phase axes.
6. Is the manifest's ownership, location, and format concretely resolved (not left open)? **Yes** — §6.4 now names one file (`docs/architecture/compatibility-manifest.json`), one owner (the Phase 7 CLI workstream, per the `checksums.json` precedent), one format (plain JSON array), and one v1 consumer (`@ultimate/cli`), with internal resolver module decomposition explicitly left to the implementation plan.
7. Is `metadataSchemaVersion`'s exact-match contract distinguished from the range-typed axes? **Yes** — §6.2's inline comment and the paragraph directly beneath it state the exact-string-equality rule and name every sibling range field it is distinct from.
8. Is the v1 multi-axis matching rule concrete and deterministic, not framework-version-only? **Yes** — §6.5 states the exact rule text required by this correction and enumerates all six evaluated axes explicitly, with MCP/AI-Skills axes explicitly excluded from evaluation.
9. Is `ultimate init` unambiguous against `create`? **Yes** — §7.1's `init` row and the paragraph beneath the table state the existing-project-only boundary explicitly, and §7.2's `create` deferral is unchanged (not expanded into a v1 implementation).
10. Does it avoid premature Phase 8/9 coupling? **Yes** — §7.3/§9, stubbed or absent, no Skills/MCP contract designed; unchanged by this correction pass.
11. Is package-manager support scope (dev-tooling vs. shipped-binary) disambiguated? **Yes** — §8.1, unchanged by this correction pass.
12. Are all deferred areas explicitly identified? **Yes** — §9, unchanged in substance by this correction pass (no command's scope was silently broadened).
13. Does any runtime dependency direction change as a result of these corrections? **No** — §5's `cli → component-metadata`-only dependency arrow is untouched; `generate`'s stdout-only mechanism (§7.2) if anything narrows, never widens, the CLI's write surface.
14. Did this correction pass introduce any new architectural fork? **No** — every requested correction (axis count, `init`/`create` boundary, manifest location, `metadataSchemaVersion` contract, multi-axis rule, `generate` determinism) was resolvable directly from Blueprint §20's own text, the `checksums.json` repository precedent, and this spec's own already-established §4/§6.3 patterns; none required inventing new architecture or escalating for a decision.

---

## 11. Consistency Check

- **Phases 0–6, `component-schema`, `component-metadata`**: unchanged, not reopened. This spec makes zero claim on their implementation and treats `ALL_COMPONENTS` as a stable, already-built dependency. The eight-component ceiling (§7.2) is unchanged by this correction pass.
- **Blueprint §6/§19/§20/§34/§40**: not contradicted — every requirement (orchestrator-only, compatibility resolver across all eight named axes, single named package, "CLI quality" as a Definition-of-Done axis) is either satisfied at v1-minimal scope or explicitly and justifiably deferred, never silently dropped. §20's eight-axis count is now correctly reflected (§6.1).
- **ADR-008**: not contradicted — made concrete via §4's boundary test, not reopened or reinterpreted. `generate`'s stdout-only mechanism (§7.2) is a direct, trivial pass of this test.
- **GAP-028**: this spec is the concrete resolution direction GAP-028's own dependency note anticipated ("could start with a minimal orchestration/scaffolding surface... then add metadata-aware features once GAP-027 resolves") — GAP-027 is now closed, and §7.2 is exactly that metadata-aware addition. A future implementation-plan or implementation-time action updates GAP-028's status, per the same convention used for GAP-014/GAP-027 at their respective milestones.
- **`docs/architecture/COMPATIBILITY.md`**: unchanged; a new, distinct Ultimate-axis manifest artifact is now concretely located at `docs/architecture/compatibility-manifest.json` (§6.4) alongside it, not merged into or replacing its existing Prime-baseline content.
- **Phase 8/9 (MCP, AI Skills)**: remain entirely deferred — no axis, command, or contract belonging to either phase was designed or resolved by this correction pass; `mcpVersionRange`/`aiSkillsVersionRange` (§6.3) remain reserved and unevaluated (§6.5).
- **Runtime dependency direction (Blueprint §6)**: unchanged — `@ultimate/cli` depends on `@ultimate/component-metadata` only; no `packages/{ng,react,vue}` dependency on the CLI is introduced or implied by any correction.

No code was written or modified. Only this specification document was corrected; the preceding research document is unchanged by this pass.

---

**READY FOR FORMAL PHASE 7 SPECIFICATION REVIEW**
