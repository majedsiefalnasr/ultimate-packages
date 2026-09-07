# Phase 7 — CLI: Research

**Status:** Research, feeds `docs/superpowers/specs/2026-09-07-phase-7-cli-design.md`
**References:** `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md` GAP-028, `docs/architecture/BLUEPRINT.md` §6/§19/§20/§34/§40, `docs/architecture/DECISIONS.md` ADR-008, `docs/architecture/COMPATIBILITY.md`, `packages/component-schema`, `packages/component-metadata`, `packages/cli` (current: `.gitkeep` only)

---

## 1. Why this research exists

Phase 6 closed GAP-027 (`main` `056621c`). ROADMAP.md now marks Phase 7 — CLI as the next "Not started" milestone. `packages/cli` contains nothing but `.gitkeep` — no package.json, no source, no prior spec or plan. Per the same Superpowers gate every prior phase went through, a phase with zero committed spec requires research before specification, and specification before any implementation plan. This document is that research pass.

## 2. What the Blueprint already decides (not open questions)

These are restated, not re-derived — Phase 7 does not get to relitigate them:

- **ADR-008 (Accepted):** `@ultimate/cli` orchestrates but must not replace Angular CLI, Vite, or equivalent official framework tooling. Reserved as scaffolding only since Phase 0.
- **Blueprint §19 responsibilities:** detect/select framework; invoke official framework tooling; install compatible Ultimate packages; resolve theme; configure optional capabilities; validate compatibility; generate code/configuration; diagnose project state. Conceptual (non-final) command surface: `create`, `init`, `add`, `generate`, `theme`, `doctor`, `update`, `migrate`, `ai`.
- **Blueprint §20:** a compatibility resolver, backed by a machine-readable compatibility manifest connecting framework version / Ultimate framework package / UltimateUIX version / theme version / metadata schema / CLI version / MCP version / AI-Skills version. The CLI should use it to prevent incompatible combinations.
- **Blueprint §6 (Dependency Direction):** the AI/tooling direction is `Component Source + Component Metadata + Documentation → CLI / MCP / AI / Skills / LLM outputs`. The prohibited direction is `Ultimate Components → CLI → MCP → AI`. CLI is strictly a **consumer** of platform knowledge; nothing in `packages/{ng,react,vue}` may depend on the CLI.
- **Blueprint §34:** package name is `@ultimate/cli`, already reserved at `packages/cli`.
- **Blueprint §40 (Definition of Done):** "CLI quality" is a named, non-optional axis of platform production-readiness.
- **GAP-028's own dependency framing:** CLI's *core* orchestration (project init, package install, theme config) does not strictly require component metadata. Only its *diagnostic/AI-aware* features (`ultimate doctor`, `ultimate ai`) benefit from GAP-027, which is now closed. This means Phase 7 is not blocked on anything, but it does mean the spec must distinguish a metadata-independent core from a metadata-aware layer.

None of the above is an open architectural question. They are constraints this research works inside of.

## 3. What actually changed since GAP-028 was written: GAP-027 is closed

GAP-028's text (`docs/architecture/BLUEPRINT_GAPS.md:483`) was written when metadata did not exist. It is now real:

- `@ultimate/component-schema` — ships `ComponentMetadata` type, `SCHEMA_VERSION`, a `validate()` function, and sub-shapes (`identity`, `api`, `accessibility`, `style`, `relationships`, `provenance-ref`, `guidance`), per `docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md`.
- `@ultimate/component-metadata` — ships `ALL_COMPONENTS: ComponentMetadata[]`, a flat array of 8 populated records (Button, Checkbox, Dialog, Menu, Tooltip, Paginator, Scroller, Table), each with per-framework `packages`, per-framework `api.{ng,react,vue}.{props,events}`, `accessibility`, `style`, `relationships.dependsOn`, `provenanceRef`.
- Both packages build to ESM (`dist/index.mjs` + `.d.mts`) via `tsup`, are `workspace:*` dependents of each other, and follow the repo's uniform package shape (`type: module`, `sideEffects: false`, `exports` map, `tsup`/`vitest`/`tsc --noEmit` scripts).

This is a real, load-bearing fact for Phase 7 scope: a metadata-aware CLI feature (e.g., `ultimate doctor` reporting "8 of ~115 components have metadata coverage," or a generator that reads `ALL_COMPONENTS` to scaffold a component usage snippet) is no longer speculative — the data exists, in a real package, with a real flat-array shape, today. Phase 7 can *reference* this package as a concrete dependency rather than deferring metadata integration as unspecifiable.

It remains true, however, that Phase 8 (MCP) and Phase 9 (AI Skills/LLM context) have no committed spec. Any CLI behavior that would require an MCP server or a Skills package to exist is still out of reach and stays deferred — GAP-027 closing does not close GAP-029/GAP-030.

## 4. What "orchestrator, not build tool" concretely means here

ADR-008's phrase is the load-bearing constraint on Phase 7's entire scope, so it is worth making concrete rather than restating abstractly.

Confirmed by reading the actual per-framework package scaffolding conventions already in the repo (Phases 1-4, unchanged by this research):

- Angular components are consumed via a real Angular workspace (`ng generate`, Angular CLI's own build pipeline, `angular.json`). Ultimate does not ship its own Angular compiler integration or override `ng build`.
- React/Vue components are consumed through whatever bundler the host app already uses (Vite is Blueprint's and the repo's own precedent, per `packages/react`/`packages/vue`'s own dev tooling) — Ultimate does not ship a bundler.
- Theme resolution (Phase 5, `@ultimate/themes`) is a CSS custom-property / design-token resolution layer, not a build step requiring a dedicated compiler.

Concretely, "orchestrate, don't replace" means the CLI's job is: **shell out to and configure existing tools, and write/modify configuration and dependency files that those tools already understand** — `package.json`, `angular.json`, theme config files, import statements — never to intercept, wrap, or reimplement what `ng build`, `vite build`, `tsc`, or the frameworks' own dev servers already do. A concrete boundary test: if a proposed CLI feature would require the CLI to understand a component's runtime rendering, JSX/template compilation, or bundling — refuse it; that is framework/bundler territory. If it only requires reading/writing config, running an existing framework-CLI or package-manager command as a subprocess, or reading metadata — it is orchestration and is in-bounds.

## 5. Compatibility resolver (§20) — genuine current gap, not a fork

`docs/architecture/COMPATIBILITY.md` exists today, but confirmed by direct reading: it is scoped entirely to **Prime baseline provenance** (PrimeNG/PrimeVue/PrimeReact pinned versions, peer ranges, rejected relicensed versions). It has zero entries for Ultimate's own package versions, CLI version, metadata schema version, MCP version, or AI/Skills version — the axis Blueprint §20 actually asks the compatibility manifest to cover.

This is a real, evidence-confirmed gap (matching GAP-028's own note that COMPATIBILITY.md is only a "partial seed"). It is not an architectural fork — Blueprint §20 is directive about *what* the manifest must connect; it does not mandate a specific file format, storage location, or resolution algorithm. The specification (not this research) must decide the minimal concrete shape needed to satisfy §20 for what Phase 7 actually ships in v1, without designing a full multi-axis semver-range resolution engine speculatively ahead of MCP/AI/Skills existing.

## 6. Package manager scope — no conflict, two different audiences

The repository's own dev tooling is pnpm-only (`packageManager: "pnpm@9.6.0"` in root `package.json`, every script assumes `pnpm -r`). Blueprint §19 separately states the CLI itself "should support common package managers where practical" for **end-user consuming projects** (a developer running `ultimate init` in their own Angular/React/Vue app, which may use npm, yarn, or pnpm). These are different audiences and not in tension: the monorepo's own build tooling choice does not constrain what package managers a shipped `@ultimate/cli` binary must be able to invoke on a consumer's behalf. The specification should state this explicitly so it is not mistaken for an unresolved question.

## 7. Command surface — Blueprint's own list is explicitly non-final

Blueprint §19 states "Exact command names are not final" directly beneath the conceptual list. This gives Phase 7 spec latitude to select a v1 subset rather than committing to all nine conceptual commands at once — consistent with Phase 6's own pattern of scoping v1 to a minimal, evidence-backed subset (its proof set of 8 components) rather than the full ~115-component backlog. Research does not itself select the v1 subset (that is a specification-level scoping decision), but confirms the Blueprint permits scoping down.

Two of the nine conceptual commands (`ultimate ai`, and the AI-aware portion of `ultimate migrate`/`ultimate doctor`) are explicitly named by GAP-028 as depending on Skills/AI-setup flows that do not exist yet (Phase 9, unstarted). These cannot be more than stubs or explicitly deferred in v1 without inventing Phase 9 scope — which this task's constraints forbid ("do not resolve deferred Phase 8/9 work").

## 8. What downstream consumption looks like today, concretely

To ground "metadata integration" rather than leave it abstract: a v1 `ultimate doctor` or `ultimate generate` reading metadata would import `ALL_COMPONENTS` from `@ultimate/component-metadata` (already a real, buildable ESM export) and could, for example, report which of the 8 metadata-backed components are installed in a target project, or scaffold an import statement using a record's `packages.{ng,react,vue}.packageName`/`sourcePath` facts. This is a concrete, buildable integration, not speculative — but it operates over exactly 8 components today (Phase 6's closed proof set), not the full inventory. The specification must not imply broader metadata coverage than exists.

## 9. Candidate architectural forks considered, and their resolution

Each candidate fork below was evaluated against direct Blueprint text and repository evidence; none required an escalation to the user for a decision.

1. **"Does the CLI need MCP or AI Skills to exist for its v1 core to be useful?"** — No. GAP-028 states core orchestration (init, package install, theme config) does not strictly require metadata, let alone MCP/Skills. Resolved directly by GAP-028's own text; not a fork.
2. **"Should the compatibility manifest (§20) be designed as a full N-axis semver resolution engine now, given MCP/AI/Skills don't exist yet?"** — No. Designing resolution logic for axes (MCP version, AI/Skills version) that have no committed spec would be exactly the "architecture beyond what research demonstrates is necessary" this task explicitly forbids. Resolved by scoping the manifest to the axes that exist today (framework version, Ultimate framework package, UltimateUIX version, theme version, metadata schema version, CLI version) and leaving MCP/AI/Skills axes as reserved-but-unpopulated fields, mirroring exactly how `packages/cli`, `packages/mcp`, and metadata packages themselves were reserved as empty scaffolding in Phase 0 before their phases began. Not a fork requiring a stop — it is the same "reserve, don't invent" pattern already established repo-wide.
3. **"Should Phase 7 v1 implement all nine conceptual commands, or a subset?"** — Blueprint explicitly permits a subset ("not final"); Phase 6's own precedent (schema in full, but records for a proof subset only) supports scoping v1 down to the commands with concrete, buildable value today (init/add/theme/doctor-lite) and explicitly deferring or stubbing the two Skills/AI-dependent ones. This is a specification-level scoping decision, not an architectural fork — no Blueprint text is contradicted either way.
4. **"Should the CLI be a single package or split (e.g., a separate `create-ultimate` package, common in the ecosystem, vs. `@ultimate/cli` alone)?"** — Blueprint §34 names exactly one package (`@ultimate/cli`), already reserved at `packages/cli`. No repository evidence or Blueprint text calls for a second package. Not a fork — single package is the only option consistent with what is already reserved and named.

No candidate rose to the level of requiring a stop for a user decision. All are resolved directly from Blueprint text, ADR-008, GAP-028, or direct confirmation of the real, closed Phase 6 artifacts.

## 10. Summary handoff to specification

The specification must:

- Define a v1 command subset (from Blueprint §19's non-final list) with concrete, buildable scope — framework detection/selection, Ultimate package installation, theme resolution, and a metadata-lite `doctor` reading `@ultimate/component-metadata`'s real 8-component `ALL_COMPONENTS` export — while explicitly stubbing or deferring anything requiring Phase 8/9.
- Define the minimal compatibility-manifest shape needed to satisfy §20 for the axes that exist today, explicitly reserving (not designing) MCP/AI/Skills axes.
- State the "orchestrate, don't replace" boundary test from §4 as an explicit, checkable rule the spec's own command definitions must each pass.
- Follow the same package-shape conventions already uniform across `packages/component-schema`/`packages/component-metadata` (ESM, `tsup`, `vitest --typecheck`, `workspace:*` deps) for `@ultimate/cli` itself, while distinguishing the CLI's own dev-time tooling (this repo, pnpm-only) from what it must support at runtime for consumer projects (§19, "common package managers").
- Explicitly restate, per §6, that nothing in `packages/{ng,react,vue}` may ever depend on `@ultimate/cli` — the CLI depends on metadata/docs, never the reverse.

No architectural fork requires a user decision before specification proceeds.
