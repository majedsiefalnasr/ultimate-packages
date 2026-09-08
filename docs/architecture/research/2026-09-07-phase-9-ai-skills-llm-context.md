# Research: Phase 9 — AI / Skills / LLM Context

**Document:** `docs/architecture/research/2026-09-07-phase-9-ai-skills-llm-context.md`
**Status:** Draft for review
**Scope:** Research + real-source verification only, per SKey gate. No implementation, no plan, no commits.
**Baseline:** `main` at `033f147` (Phase 8 — MCP, merged). Repository tree clean at time of research.

---

## 1. Scope

This document establishes the factual and architectural baseline for **Phase 9 — AI Skills and LLM Context**, the next unstarted phase per `docs/architecture/ROADMAP.md`. It answers what Phase 9 must provide, what already exists in the repository that Phase 9 can build on, what genuinely does not exist yet, and which of the 12 architectural forks named in the governing task are resolved by direct source citation versus requiring an explicit decision.

It does not design the implementation. The companion specification (`docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md`) is implementation-ready but still pre-code, per the SKey gate sequence: Research → Real-source verification → Architecture discussion → **Specification** → Spec Review → Implementation Plan → …

Throughout, findings are labeled:

- **Verified from source** — a direct quote or confirmed file/code fact.
- **Architectural inference** — a reasonable reading of verified sources, not itself a literal quote.
- **Recommendation** — this document's own judgment call, offered for the Spec Review gate, not asserted as already-decided.

---

## 2. Authoritative sources consulted

| Source | Path | What was checked |
|---|---|---|
| Blueprint | `docs/architecture/BLUEPRINT.md` | §6 (Dependency Direction), §18 (Component Knowledge Model), §19–21 (CLI/Compatibility/Versioning), §22 (AI Platform), §23 (MCP Architecture), §24 (Skills Architecture), §25 (LLM-Oriented Documentation), §26 (AI Context Layers), §35 Phase 8/9 objectives, §40 (Definition of Done) |
| ADRs | `docs/architecture/DECISIONS.md` | ADR-001 through ADR-043, in particular ADR-008/009/010/011/012 |
| Gap registry | `docs/architecture/BLUEPRINT_GAPS.md` | GAP-027 (metadata, resolved), GAP-029 (MCP, resolved), GAP-030 (AI Skills, the direct predecessor of this research) |
| Roadmap | `docs/architecture/ROADMAP.md` | Phase 9 status row |
| Phase 6 spec | `docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md` | Full — schema shape, versioning model, v1 classification, explicit deferrals |
| Phase 8 spec | `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` | Full — MCP tool surface, §5.2 (sibling-boundary precedent), §9 ("What Phase 9 Owns Instead"), §10 (non-goals) |
| Component schema (source) | `packages/component-schema/src/*.ts` | `component-metadata.ts`, `identity.ts`, `api.ts`, `accessibility.ts`, `style.ts`, `relationships.ts`, `provenance-ref.ts`, `guidance.ts`, `metadata-version.ts`, `version.ts`, `validate.ts`, `index.ts` |
| Component metadata (source) | `packages/component-metadata/src/records/*.ts`, `index.ts` | All 8 records (Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip); which facets are populated |
| CLI (source) | `packages/cli/src/*.ts` | `compatibility.ts` (manifest type, reserved fields), command surface |
| MCP (source) | `packages/mcp/src/tools/*.ts` | 5 real tools, their data sources |
| AI/Skills scaffolding | `packages/ai/`, `skills/`, `tooling/` | Confirmed `.gitkeep`-only |
| Boundary enforcement | `scripts/provenance/validate-cli-boundary.mjs`, `validate-mcp-boundary.mjs` | Existing CI-enforced sibling-independence pattern |
| CI | `.github/workflows/ci.yml` | Confirmed `boundary:validate`, `boundary:validate:cli`, `boundary:validate:mcp`, `ceiling:validate` steps wired |
| Compatibility manifest | `docs/architecture/compatibility-manifest.json` | 3 entries; confirmed no populated AI/Skills axis |

**Structural note:** the governing task referenced `docs/architecture/ultimate-platform-blueprint.md`, `docs/architecture/adr/`, and repo-root `ROADMAP.md`. The actual repository uses `docs/architecture/BLUEPRINT.md`, a single flat `docs/architecture/DECISIONS.md` (prose ADR entries, not one-file-per-ADR), and `docs/architecture/ROADMAP.md`. This research used the real paths.

---

## 3. Current repository state (Verified from source)

- `git log` at research time: `HEAD` is `033f147`, "Merge worktree-phase-8-mcp into main"; working tree clean.
- `docs/architecture/ROADMAP.md`: Phase 9 ("AI Skills and LLM Context") status — **Not started**.
- `packages/ai/` contains only `.gitkeep`. Repo-root `skills/` contains only `.gitkeep`. Repo-root `tooling/` also contains only `.gitkeep`.
- `packages/component-schema/` and `packages/component-metadata/` are fully implemented (Phase 6, closed). `packages/cli/` is fully implemented (Phase 7, closed). `packages/mcp/` is fully implemented (Phase 8, closed).
- `ALL_COMPONENTS` (`packages/component-metadata/src/index.ts`) exports exactly 8 `ComponentMetadata` records: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip.
- `ComponentMetadata` type (`packages/component-schema/src/component-metadata.ts`):

  ```ts
  export type ComponentMetadata = ComponentIdentity & {
    api?: ComponentApi;
    accessibility?: AccessibilityFacts;
    style?: StyleIdentity;
    relationships?: Relationships;
    provenanceRef?: ProvenanceRef;
    guidance?: Guidance;
  };
  ```

- `Guidance` (`packages/component-schema/src/guidance.ts`):

  ```ts
  export interface Guidance {
    usageNotes?: string;
    antiPatterns?: string[];
    migrationNotes?: string;
  }
  ```

- `AccessibilityFacts` (`packages/component-schema/src/accessibility.ts`):

  ```ts
  export interface AccessibilityFacts {
    verifiedRoles?: string[];
    verifiedAriaAttributes?: string[];
    guidance?: string;
  }
  ```

- `guidance:` is populated on exactly **1 of 8** records — `packages/component-metadata/src/records/table.ts` (confirmed via `grep -l "guidance:" packages/component-metadata/src/records/*.ts`, single match). The other 7 records have the schema field available but unpopulated.
- No `examples` field exists anywhere in `packages/component-schema/src/*.ts` or any record in `packages/component-metadata/src/records/*.ts` (confirmed via repo-wide grep, zero hits).
- `packages/cli/src/compatibility.ts` (lines 6, 30, 32):

  ```ts
  /* `mcpVersionRange`/`aiSkillsVersionRange` (§6.3) are reserved/unpopulated */
  mcpVersionRange?: string;
  ...
  aiSkillsVersionRange?: string;
  ```

  Both fields are **already reserved** on `CompatibilityEntry` (optional, typed) but **unpopulated** on every real entry in `docs/architecture/compatibility-manifest.json` (3 entries, none carrying either field). This corrects an earlier assumption in this research pass's first draft — `aiSkillsVersionRange` is not merely absent, it is a named, reserved-but-empty field, mirroring `mcpVersionRange`'s own already-established treatment in Phase 7/8.
- `packages/mcp/src/tools/*.ts` exposes exactly 5 tools: `search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility` — all read `ALL_COMPONENTS` or `compatibility-manifest.json` directly; none depend on `@ultimate/cli`.
- `scripts/provenance/validate-cli-boundary.mjs` and `validate-mcp-boundary.mjs` both exist and are wired into `.github/workflows/ci.yml` as `boundary:validate:cli` / `boundary:validate:mcp` steps (confirmed at lines 63–67). Each proves, bidirectionally, that framework packages never import the tooling package and the tooling package never imports sibling tooling packages or framework packages.
- No ADR directory exists; ADRs live as numbered prose entries inside the single `docs/architecture/DECISIONS.md` file, currently ADR-001 through ADR-043.

---

## 4. Blueprint requirements (Verified from source, exact quotes)

### §6 — Dependency Direction

```text
Component Source
      +
Component Metadata
      +
Documentation
      ↓
CLI / MCP / AI / Skills / LLM outputs
```

Prohibited direction:

```text
Ultimate Components
        ↓
CLI
        ↓
MCP
        ↓
AI
```

**Verified from source.** CLI, MCP, AI/Skills/LLM-outputs are drawn as a single downstream tier, fed by the same upstream (source + metadata + docs) — not chained to each other. The explicitly prohibited diagram is exactly the consumer-chain pattern (`Components → CLI → MCP → AI`) this research and the companion spec must avoid reproducing.

### §18 — Component Knowledge Model

```text
Component Source
      +
Metadata
      +
Human-authored guidance
      ↓
Ultimate Knowledge Model
      │
 ┌────┼────────┬────────┐
 ↓    ↓        ↓        ↓
Docs  Storybook MCP    Skills
                 ↓
              LLM context
```

**Verified from source.** This diagram draws LLM context hanging off *Skills* specifically (Skills → LLM context), which — read too literally — could look like a chain where MCP fans out separately but Skills produces LLM context as a sub-step.

### §22 — AI Platform

```text
Ultimate Metadata
        │
 ┌──────┼─────────┐
 ↓      ↓         ↓
MCP   Skills   LLM context
```

**Verified from source.** Here MCP, Skills, and LLM context are three parallel siblings, all fed directly by Metadata — not a chain through Skills.

**Contradiction, flagged not silently resolved:** §18's tree shape and §22's parallel-siblings shape read differently for exactly one relationship — whether LLM context is a byproduct of Skills, or an independent parallel sibling of Skills. §6's textual dependency-direction statement is unambiguous prose (not a diagram susceptible to layout-reading ambiguity) and settles the *outer* question — AI/Skills/LLM-outputs are one downstream tier, never chained through MCP or CLI. It does not, however, settle the *inner* question of whether LLM context specifically derives from Skills content or independently from Metadata. Phase 8's own spec (§9) already resolved an analogous ambiguity from MCP's side ("`@ultimate/mcp` is a live query interface, not a file generator; the two are different mechanisms for related goals and are not merged or confused in this spec"). This research recommends the specification restate an equivalent resolution from the AI/Skills side: LLM context is generated directly from the same upstream knowledge (metadata + human-authored guidance), *may draw on* Skills content where it exists, but is not solely a Skills byproduct and does not require Skills to exist first. See Fork 5 (§8) below.

### §24 — Skills Architecture (verbatim)

> Skills are operational AI guidance, not merely documentation.

A skill may contain:

```text
When to use
Preferred patterns
Allowed/recommended APIs
Anti-patterns
Accessibility guidance
Examples
Related components
Framework-specific guidance
```

> Skills should be versioned and tied to compatible Ultimate metadata/component versions.
>
> Skills may be human-authored but should reference canonical component metadata.

### §25 — LLM-Oriented Documentation (verbatim)

> Ultimate should provide generated LLM-friendly documentation/context.

Potential outputs:

```text
llms.txt
llms-full.txt
structured component context
framework-specific context
project context
```

> These should be generated from: component metadata / API information / documentation / examples / human-authored AI guidance.
>
> Generated outputs should not become the primary source of truth.

### §26 — AI Context Layers (verbatim)

> AI knowledge should distinguish:

```text
Platform Knowledge
Framework Knowledge
Component Knowledge
Theme Knowledge
Project Knowledge
Task Knowledge
```

> Project-level instruction files may customize how Ultimate is used without changing Ultimate itself.
>
> The platform should provide conventions for agent instruction files and Skills, while avoiding dependence on one specific coding agent.

### §23 — MCP Architecture (relevant excerpt, for boundary contrast)

> MCP should read structured Ultimate metadata rather than depend on arbitrary source parsing at runtime.

### §35 — Phase 9 objectives (verbatim)

> - Skills architecture
> - generated LLM context
> - agent instruction conventions
> - compatibility between Skills and metadata
> - AI validation workflows

(For contrast, Phase 8's objectives, same section: "expose metadata/docs/examples; framework-aware queries; project-aware queries; AI-friendly component discovery" — a distinctly runtime-query-shaped list, versus Phase 9's distinctly generation/convention-shaped list.)

### ADR-011 (DECISIONS.md, verbatim)

> Status: Accepted (Blueprint §24). Skills are operational AI guidance, not merely documentation, versioned and tied to compatible component metadata versions. Deferred to Phase 9.

### ADR-012 (DECISIONS.md, verbatim)

> Status: Accepted (Blueprint §25/§26). Generated outputs (llms.txt etc.) should not become the primary source of truth. Deferred to Phase 9.

### ADR-010 (DECISIONS.md, verbatim, for MCP boundary contrast)

> Status: Accepted (Blueprint §2.6/§23). MCP must remain optional and never a runtime dependency. Reserved as scaffolding only in Phase 0 (`packages/mcp`).

### GAP-030 (BLUEPRINT_GAPS.md, verbatim)

> **GAP-030 — AI Skills package, LLM context generation, and agent-instruction conventions do not exist (Phase 9)**
> - Status: MISSING
> - Current evidence: `packages/ai` and repo-root `skills/` both contain only `.gitkeep`. `ROADMAP.md`: "Not started."
> - Expected state: Blueprint §24/§25/§26/ADR-011/ADR-012 — Skills as operational guidance (not just docs), versioned and tied to metadata versions; generated `llms.txt`/`llms-full.txt` outputs that are not the primary source of truth.
> - What it blocks: Nothing else architecturally — leaf consumer per §6's dependency diagram.
> - Dependencies: Depends on GAP-027 (metadata) per §24's own stated design ("Skills may be human-authored but should reference canonical component metadata").
> - Existing reusable infrastructure: This very document's Superpowers-workflow discipline (specs → plans → implementation → verification, all recorded in `docs/superpowers/`) is itself a working example of the "operational AI guidance" pattern Blueprint §24 describes — worth studying as a template when Phase 9 begins, though it is process tooling for building Ultimate, not a Skill about using Ultimate's own components.
> - Architectural decision required: No — Blueprint is directive; real prerequisite is GAP-027.

**Verified from source.** GAP-027 (Component Metadata, Phase 6) is closed. Phase 9's one stated prerequisite is therefore satisfied.

---

## 5. Real-source verification (capability → data reality)

| Capability named in §22–26 | Data exists in repo today? | Where | Classification |
|---|---|---|---|
| Component identity/API/accessibility/style/relationships facts | **Real data**, all 8 records | `packages/component-metadata/src/records/*.ts` | Directly reusable |
| "Preferred patterns" / "Anti-patterns" (§24) | **Real data, sparse** — schema field exists on all 8 records, populated on 1/8 (Table) | `guidance.usageNotes` / `guidance.antiPatterns` | Real but thin |
| "Accessibility guidance" (§24) | **Real data, optional, unverified population count for all 8** — schema field exists (`accessibility.guidance: string`) | `packages/component-schema/src/accessibility.ts` | Field real; per-record population not exhaustively re-audited in this pass beyond confirming the field's existence and type |
| "Examples" (§24) / "examples" input to LLM context (§25) | **Does not exist — no placeholder even** | N/A | Schema-level absence, not a content gap |
| "Related components" (§24) | **Real data** — `Relationships` block | `packages/component-schema/src/relationships.ts`, populated per-record | Real |
| "Framework-specific guidance" (§24) | **Real data** — `api.{ng,react,vue}` structure already exists per-record | `packages/component-schema/src/api.ts` | Real, reusable as the framework-specific axis |
| Migration guidance (§25's implicit "documentation" source) | **Real but minimal** — `guidance.migrationNotes: string`, free text, optional | `guidance.ts` | Thin; no structured migration-classification schema exists (Phase 6 spec §14 explicitly excluded one) |
| "Theme/token lookup" style facts | **Placeholder-only** — `style.componentName`/`style.styleModuleRef` are pointers to a style module, not actual token values | `packages/component-schema/src/style.ts` | Actual token values live in `@ultimate/themes`, structurally unreferenced by component-metadata |
| CLI info / command discovery | **Real, but CLI-internal** — `KNOWN_COMMANDS` not exported | `packages/cli/src/cli.ts` (per Phase 8 spec §7.3, already confirmed not exported) | Not consumable without a new export |
| Compatibility info | **Real** — 3 entries in the manifest; `aiSkillsVersionRange` reserved-but-unpopulated | `docs/architecture/compatibility-manifest.json`, `packages/cli/src/compatibility.ts` | Real structure, empty content for the AI axis |
| Existing AI/Skills/LLM-context artifacts | **None** | `packages/ai/.gitkeep`, `skills/.gitkeep` | Confirmed empty |
| Agent-instruction-file convention (Ultimate-authored, for consumers of Ultimate) | **None found** | — | Not to be confused with this repo's own internal `docs/superpowers/` workflow (GAP-030 explicitly names this as a template to study, not a shipped artifact for Phase 9 to reuse as-is) |
| MCP tool surface (cross-reference only, not a Phase 9 input) | **Real** | `packages/mcp/src/tools/*.ts`, 5 tools | Confirmed boundary-isolated from CLI |

---

## 6. Research questions A–G

### A. AI/Skills/LLM Context role

- **Verified from source (§35):** Phase 9 provides "Skills architecture; generated LLM context; agent instruction conventions; compatibility between Skills and metadata; AI validation workflows."
- **Verified from source (§6, §18, §22):** AI/Skills/LLM-outputs sit in the same downstream tier as CLI and MCP, never upstream of component source/metadata/docs.
- **Verified from source (Phase 8 spec §9):** MCP is explicitly framed as "a live query interface, not a file generator." Phase 9's own objectives (§35) are generation/convention-shaped ("generated LLM context," "agent instruction conventions"), not query-shaped — **architectural inference**: Phase 9 is a generation + human-authored-guidance layer, not a runtime query service, by contrast with MCP's explicitly runtime, protocol-server design (Phase 8 spec §5.1).
- **Verified from source (§25):** "Generated outputs should not become the primary source of truth" — component metadata remains canonical; Phase 9's artifacts are derived, not authoritative.
- **Consumers — architectural inference:** external AI coding agents / LLMs reading generated context files and Skill files; not internal platform packages (GAP-030: "leaf consumer... nothing else architecturally" depends on it).
- **What it must NOT own — verified/inference combined:** component knowledge itself (canonical facts stay in `@ultimate/component-metadata`, unchanged, per the "no redesign of Phase 6 metadata" constraint and Phase 6 spec's own closed scope); MCP's live-query capability; CLI's orchestration role.

### B. Dependency direction

- **Verified from source (§6):** `Component Source + Component Metadata + Documentation → CLI / MCP / AI / Skills / LLM outputs` — single downstream tier, explicit prohibition on `Ultimate Components → CLI → MCP → AI`.
- **Risk, flagged (§18 vs §22):** see the contradiction noted in §4 above. Resolution recommended: Phase 9 reads directly from metadata/documentation, exactly mirroring how Phase 8 reads directly from metadata rather than through CLI. Phase 9 does not require MCP or Skills to exist as an intermediate step to produce LLM context, even where it may reference Skills content once Skills exist.
- **Recommendation:** the exact architecture is "parallel sibling," reusing the same pattern Phase 8 spec §5.2 already established and proved with a CI boundary gate for MCP↔CLI. Phase 9 needs the equivalent gate for `@ultimate/ai`↔`@ultimate/cli`/`@ultimate/mcp` (Fork 11, below).

### C. Relationship with Phase 6 metadata

- **Verified from source:** `guidance` block (`usageNotes`/`antiPatterns`/`migrationNotes`) already exists on the schema, optional, populated on 1/8 records. This is the single most directly Skills-shaped field already present — it maps almost one-to-one onto §24's "Preferred patterns"/"Anti-patterns"/(partially) "Migration" components.
- **Verified from source:** `accessibility.guidance` (free-text) exists and maps onto §24's "Accessibility guidance" component.
- **Verified from source:** `relationships` block exists and maps onto §24's "Related components" component.
- **Verified from source:** per-framework `api` block exists and maps onto §24's "Framework-specific guidance" component (at least for API-shaped guidance; prose framework guidance beyond raw API facts would be new human-authored content, not a schema gap).
- **Is more metadata required? Recommendation: No proven need.** Everything Phase 9 v1 structurally needs (identity, api, accessibility, style pointer, relationships, guidance) already exists in the closed Phase 6 schema. The sole schema-level absence is `examples` (§24's "Examples" component) — and Phase 6 spec §7 already, explicitly, by design, deferred this ("Documentation content / examples / Storybook stories... Deferred — Phase 8/9-downstream, no committed spec to design against"). This is not an oversight Phase 9 discovered; it is Phase 6's own anticipated boundary.
- **What's absent:** `examples` field (schema-level, zero placeholder). Populated `guidance` content on 7/8 records (content-authoring gap, not a schema/architecture gap).

### D. Relationship with Phase 8 MCP

- **Verified from source:** MCP's real 5 tools (`search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility`) all read `ALL_COMPONENTS` or `compatibility-manifest.json` directly — no intermediate layer.
- **Verified from source (Phase 8 spec §9):**
  > "Skills (`@ultimate/ai`, repo-root `skills/`) — operational AI guidance per §24... `@ultimate/mcp` is a data/tool source an agent with Skills loaded may query; it does not author, package, or version Skills content itself."
  > "Generated LLM context... `@ultimate/mcp` is a live query interface, not a file generator; the two are different mechanisms for related goals and are not merged or confused in this spec."
- **Should Phase 9 consume MCP:** **No basis found.** Phase 8 spec §9 already frames MCP as something an agent *with Skills loaded* may separately query at runtime — a complementary, not a feeding, relationship. Generation-time tooling reading metadata directly is simpler and matches the "structured metadata, not runtime parsing" discipline already established for MCP itself (§23).
- **Dependency direction between them:** **Neither direction.** No Blueprint text names an MCP↔AI dependency edge; §6/§22 draw them as siblings; Phase 8 spec's own CI-enforced boundary work for MCP↔CLI (§5.2, §8.1) is the direct template Phase 9 should mirror for itself relative to both CLI and MCP.
- **Acceptable duplication:** each package (MCP, AI/Skills) independently reading the same `ALL_COMPONENTS` export and `compatibility-manifest.json` file — this is the exact precedent Phase 8 spec §5.2 already established between MCP and CLI ("each package reads that shared, plain-JSON data file independently... not a shared extracted library in v1, no second consumer beyond these two exists yet to justify extracting one").

### E. Skills

- **Verified from source (§24):** static, versioned, tied to metadata versions; "may be human-authored but should reference canonical component metadata" — explicitly not required to be fully generated.
- **Where they belong — verified ambiguity, resolved by user decision this session:** §4's repo shape (not independently re-read in full this pass, but corroborated by `packages/ai/.gitkeep` and repo-root `skills/.gitkeep` both existing) reserves *two* separate locations with no split rule stated in Blueprint text. **User decision (this session, Fork 1):** `packages/ai` (`@ultimate/ai`) is the generation tooling/code package; repo-root `skills/` holds the actual Skill content (generated and/or hand-authored files). See §8 Fork 1.
- **Consumers:** external AI coding agents, same audience as generated LLM context.
- **Framework-specific:** yes — "Framework-specific guidance" is a named §24 component.
- **Generated vs hand-authored:** hybrid per the verbatim text — "may be human-authored" (permissive) but "should reference canonical component metadata" (must be metadata-anchored). **Architectural inference:** hand-authored prose, generated/validated references into metadata (a Skill cites `guidance.usageNotes`/`accessibility.guidance` rather than restating facts by hand).
- **Source-code knowledge or structured/documented knowledge only:** **Verified inference from §23's own MCP-boundary rule** ("MCP should read structured Ultimate metadata rather than depend on arbitrary source parsing at runtime") plus the governing task's own critical constraints ("do not parse component source code at runtime merely to provide AI context") — the same discipline applies to Phase 9: structured metadata/documentation only, never source parsing.

### F. LLM Context

- **Verified from source (§25):** potential outputs are literally named as files — `llms.txt`, `llms-full.txt`, structured component context, framework-specific context, project context. Sources: metadata, API info, documentation, examples, human-authored AI guidance. "Generated outputs should not become the primary source of truth."
- **Package/generated-artifact/index/retrieval-layer/API — verified inference:** §25 frames these as **generated files** (`.txt` outputs named explicitly), not a runtime API or retrieval service — no server, no query interface, no "layer" language anywhere in §25/§26 text. Contrast with MCP's explicit protocol-server design in §23/Phase 8 spec §5.1.
- **Deterministic — architectural inference, not explicit Blueprint text.** No sentence in §25/§26 states "deterministic." Inferred from: (a) "generated outputs should not become the primary source of truth" implies regenerability, which in turn implies reproducibility; (b) the platform's own Superpowers-workflow discipline (deterministic, reproducible artifacts, evidenced throughout `docs/superpowers/`) as house style; (c) Phase 6's `metadataVersion` model already establishes deterministic, content-hash-equivalent versioning as the repo's norm. **This is inference, not a verified requirement — flagged for the spec's explicit decision.**
- **Framework-aware:** yes, explicit ("framework-specific context" named).
- **Project-aware:** named as a potential output ("project context"), but §26 separately states "Project-level instruction files may customize how Ultimate is used without changing Ultimate itself" — project-awareness, where it exists, must not mean Ultimate's own generated artifacts embed a specific consumer project's state. **User decision (this session, Fork 8):** deferred from v1. See §8.
- **Intended consumers:** external AI systems primarily (the `llms.txt` convention is a known cross-industry pattern for LLM-readable site/library context) — not internal agents specifically, not MCP.

### G. Existing gaps (classified)

| Gap | Classification |
|---|---|
| `packages/ai` has zero content | **Required for Phase 9 v1** — it is the phase's namesake deliverable |
| `skills/` (repo root) has zero content | **Required for Phase 9 v1**, once Fork 1's split is adopted |
| No `examples` metadata field | **Explicitly deferred by Phase 6's own spec (§7)** — not a Phase 9 v1 blocker; Skills' "Examples" component ships without it in v1, or is scoped to `guidance.usageNotes` prose |
| `guidance` populated on only 1/8 records | **Not a Phase 9 architecture blocker** — content-authoring backlog, schema already supports it |
| No agent-instruction-file convention (Ultimate-authored, for consumers) | **Required for Phase 9 v1** per §26 ("provide conventions for agent instruction files") |
| `aiSkillsVersionRange` reserved but unpopulated in compatibility manifest | **Useful but deferred** — mirrors Phase 8 spec §6's own explicit treatment of `mcpVersionRange` as "CLI's own future work" |
| "AI validation workflows" (§35 objective) | **Required for v1 at minimum as a defined contract** (what makes a Skill/LLM-context artifact valid) — implementing tooling can be scoped minimally |

---

## 7. Dependency architecture (resolution)

**Recommendation, directly supported by §6/§18/§22 and the Phase 8 precedent:**

```text
Component Source + Component Metadata + Documentation
        ↓
   (parallel siblings, no edges between them)
   CLI          MCP          @ultimate/ai (+ skills/)
```

- `@ultimate/ai` reads `@ultimate/component-metadata` directly (via `ALL_COMPONENTS`), exactly as `@ultimate/mcp` and `@ultimate/cli` already do independently.
- `@ultimate/ai` never imports `@ultimate/cli` or `@ultimate/mcp`, and neither of those imports `@ultimate/ai`, in either direction.
- Where `@ultimate/ai` needs the same underlying fact CLI/MCP also read (e.g., framework compatibility), it reads `compatibility-manifest.json` independently — the same pattern Phase 8 spec §5.2/§6 already established for MCP relative to CLI, itself citing Phase 7 spec §6.4's original design intent that the manifest live at repo-root precisely so multiple consumers can read it without depending on each other.
- This mirrors, rather than reinvents, the exact CI-enforced sibling-independence pattern already proven twice (`validate-cli-boundary.mjs`, `validate-mcp-boundary.mjs`).

---

## 8. Architectural forks

### Fork 1 — AI/Skills package location and package name

- **Options:** (a) `packages/ai` only; (b) `skills/` (repo root) only; (c) both, with a defined split.
- **Authoritative source:** Blueprint reserves both `packages/ai` and repo-root `skills/` (confirmed via `.gitkeep` in both) with no explicit split rule stated anywhere in §24/§25/§26.
- **Repo reality:** both exist, both empty.
- **User decision (this session):** **(c)** — `packages/ai` (`@ultimate/ai`) is the generation-tooling/validation code package; repo-root `skills/` holds the Skill content itself (files consumed by AI agents). This matches Blueprint's dual reservation and the repo's established code-package vs. content-directory separation pattern (e.g., `docs/architecture/` holds architecture artifacts consumed by multiple packages, not owned by any one package's `src/`).
- **Why alternatives rejected:** (a) alone would bury static content files inside a `src/`-shaped TypeScript package, awkward for content that should be directly browsable/referenceable by an AI agent without a build step. (b) alone would leave the *generation* of LLM context (§25's explicit "generated" framing) with no code home.

### Fork 2 — Generated or hand-authored Skills

- **Options:** fully generated; fully hand-authored; hybrid.
- **Authoritative source:** §24, verbatim: "Skills may be human-authored but should reference canonical component metadata."
- **Repo reality:** no Skills content exists yet either way.
- **Recommendation: hybrid.** Hand-authored prose content (When to use / Preferred patterns / Anti-patterns narrative), with generated or validated references into metadata (a Skill file cites `guidance.usageNotes`/`accessibility.guidance` rather than restating facts by hand, and is checked against the referenced component's current `metadataVersion`). Directly supported by Blueprint text, not invented.
- **Why alternatives rejected:** fully generated Skills would contradict "may be human-authored." Fully hand-authored with no metadata reference would contradict "should reference canonical component metadata" and risk drift from the single source of truth.

### Fork 3 — LLM Context generated or served dynamically

- **Options:** generated static file(s); runtime-served dynamic API.
- **Authoritative source:** §25 names concrete file outputs (`llms.txt`, `llms-full.txt`) — file-shaped nouns, not an API/service verb; contrast with §23's explicit protocol-server framing for MCP.
- **Recommendation: generated static artifact.** Matches §25's literal naming and the "should not become the primary source of truth" caveat, which reads naturally for a checked-in/regenerable file and awkwardly for a live service (a live service wouldn't need that same caveat the same way).
- **Why alternative rejected:** a runtime service duplicates MCP's already-defined role (Phase 8 spec §5.1) and risks exactly the kind of mechanism-merging Phase 8 spec §9 already ruled out from MCP's side.

### Fork 4 — Consumes metadata directly or through MCP/CLI

- **Options:** direct read of `@ultimate/component-metadata`; indirect via `@ultimate/mcp` tool calls; indirect via `@ultimate/cli`.
- **Authoritative source:** §6's dependency diagram draws CLI/MCP/AI/Skills/LLM-outputs as parallel downstream consumers of the same upstream, never chained.
- **Recommendation: directly.** Mirrors the MCP↔CLI independent-read precedent (Phase 8 spec §5.2).
- **Why alternatives rejected:** routing through MCP or CLI would create exactly the prohibited consumer-chain shape (§6's explicit prohibition), and would make MCP or CLI a de facto knowledge owner/gatekeeper for AI — contradicting the governing constraint that neither package become "the knowledge owner."

### Fork 5 — MCP and AI/Skills share a common knowledge layer

- **Options:** a new shared extracted package; both read `@ultimate/component-metadata` independently; no relationship at all.
- **Authoritative source:** both already share `@ultimate/component-metadata`/`@ultimate/component-schema` as their one real upstream; no separate "knowledge layer" package is named anywhere in Blueprint text or the existing package set.
- **Recommendation:** they share the **existing** `@ultimate/component-metadata`/`@ultimate/component-schema` packages as the knowledge layer — no new shared package needed or evidenced. This is also the resolution to the §18-vs-§22 diagram tension (§4/§6 above): both MCP and AI/Skills/LLM-context read Metadata in parallel; LLM context is not gated behind Skills existing first, even though it may draw on Skills content once authored.
- **Why alternative rejected:** extracting a new shared package with exactly two consumers, no third consumer in sight, and no demonstrated duplicate-pattern pressure, would violate the same YAGNI discipline the repo has already applied convergently at least four times (ADR-018/024/032 for base-class architecture; Phase 8 spec §5.2 for the manifest-read pattern itself).

### Fork 6 — Framework-neutral vs framework-specific context

- **Options:** framework-neutral only; framework-specific only; both.
- **Authoritative source:** §25 explicitly lists "framework-specific context" as a named output type, alongside a neutral "structured component context."
- **Recommendation: both.** Matches metadata's own per-framework `api.{ng,react,vue}` structure directly — no invention needed, direct reuse of existing per-framework structure.

### Fork 7 — Static artifacts vs runtime services

- **Options:** build-time generated static files; a running service/process.
- **Authoritative source:** §25's file-shaped output names, contrasted against MCP's explicit runtime-server design (§23, Phase 8 spec §5.1).
- **Recommendation: static artifacts for v1.** No Blueprint text asks for an AI/Skills runtime process; the governing critical constraint ("AI/Skills/LLM Context must not become a hidden runtime dependency of Ultimate components") favors build-time generation that ships no runtime footprint into consuming projects at all.

### Fork 8 — Project-aware context part of v1

- **Options:** include a narrow project-aware contract now; defer entirely.
- **Authoritative source:** §25 lists "project context" as one of four named potential outputs; §26 separately warns project-level customization must happen "without changing Ultimate itself."
- **Repo reality:** no project-detection mechanism exists in AI/Skills scope; CLI's `detectFramework()` is CLI-internal (confirmed by Phase 8 spec §7.4, which deliberately kept MCP from depending on it for the same reason).
- **User decision (this session):** **defer to a later phase.** v1 scopes to Platform/Framework/Component-level context only (§26's taxonomy, minus Project/Task Knowledge for now).
- **Why deferral is the right call, not just the easy one:** GAP-030 rates Phase 9 blocking level "MEDIUM" and states no architectural decision is required beyond satisfying its one real prerequisite (metadata, already closed) — nothing forces project-awareness into v1. Project-aware context would require either filesystem introspection (no precedent, arguably outside "structured metadata only" bounds) or a template/convention a consuming project fills in locally (a plausible later-phase design, not yet specified anywhere). This mirrors Phase 8's own precedent of narrowly scoping "project-aware queries" to caller-supplied input only (§7.4), never live filesystem detection.

### Fork 9 — Examples required for v1 given the metadata gap

- **Verified:** `examples` field does not exist in the schema at all (confirmed by grep). Phase 6 spec §7 explicitly deferred it: "Documentation content / examples / Storybook stories... Deferred — Phase 8/9-downstream, no committed spec to design against."
- **Governing constraint:** "Do not redesign Phase 6 metadata unless the research proves a concrete Phase 9 requirement that cannot otherwise be satisfied."
- **Recommendation: Examples are NOT required for Phase 9 v1.** Skills v1 ships without a dedicated "Examples" component (§24), or scopes any example-like content to whatever prose already exists in `guidance.usageNotes`. Adding a schema field would reopen closed Phase 6 scope, which is out of bounds absent proof of necessity — and no such proof exists; deferring is the evidence-backed path, consistent with how Phase 8 spec §7.3 handled the identical absence for MCP's "usage examples" capability.

### Fork 10 — Versioning strategy for generated context/skills artifacts

- **Authoritative source:** §24, "Skills should be versioned and tied to compatible Ultimate metadata/component versions"; Phase 6 spec §5 already defines `schemaVersion` + per-record `metadataVersion` as the precedent versioning pattern.
- **Recommendation:** mirror Phase 6's exact precedent — a Skills/LLM-context artifact records which `metadataVersion`(s) of the source records it was generated from or is compatible with, not an independent semver system of its own. Consistent with Phase 6 spec §5.1's "no second independent version system" rule.
- **Why alternative (independent semver) rejected:** would create a second, parallel versioning axis with no clear reconciliation rule against `metadataVersion`, and no Blueprint text calls for one — §20's compatibility model already names `AI/Skills version` as one axis of the broader compatibility manifest (mirrored by the already-reserved `aiSkillsVersionRange` field), which is the correct place for a coarse package-level version; per-artifact freshness against source metadata is a separate, finer-grained concern best solved by metadata-version references, not a new versioning scheme.

### Fork 11 — Validation and boundary enforcement

- **Verified real precedent:** `scripts/provenance/validate-cli-boundary.mjs` and `validate-mcp-boundary.mjs`, both CI-wired (`.github/workflows/ci.yml` lines 63–67), both proving bidirectional non-dependency between sibling tooling packages and framework packages.
- **Recommendation:** Phase 9 needs a structurally identical `validate-ai-boundary.mjs`, proving: (a) `packages/{ng,react,vue}*` never depend on `@ultimate/ai`; (b) `@ultimate/ai` never depends on `@ultimate/cli`, `@ultimate/mcp`, or any framework package. Not a new invention — applying an already-established, CI-proven repo pattern a third time.

### Fork 12 — New schema/metadata fields genuinely required

- **Per the governing constraint and Fork 9's finding:** **no new field is provably required for Phase 9 v1.** Everything Phase 9 needs structurally (identity, api, accessibility, style, relationships, guidance) already exists in the closed Phase 6 schema. The one gap (`examples`) is correctly, already deferred rather than requiring a schema reopening.

---

## 9. Explicit v1 boundaries

In scope for Phase 9 v1 (per §35's objectives, resolved forks above, and real-source verification):

- `@ultimate/ai` package: generation/validation tooling that reads `@ultimate/component-metadata` directly and produces Skill files and LLM-context artifacts.
- `skills/` (repo root): Skill content, one file per component (or per logical grouping), hybrid hand-authored/metadata-referencing, versioned against the metadata it references.
- Generated LLM context: `llms.txt`/`llms-full.txt`-shaped static artifacts, framework-neutral and framework-specific variants, generated deterministically from metadata + guidance + Skills content.
- Agent-instruction-file convention: Ultimate-authored guidance for how a consuming project's AI agent should reference Ultimate (not itself a runtime-detected, per-project artifact).
- Compatibility: Phase 9 may populate `aiSkillsVersionRange` on compatibility manifest entries as its own future work (mirroring how Phase 8 left `mcpVersionRange` for its own phase to decide whether/when to populate) — an implementation-time decision, not a v1-blocking architectural one.
- A CI boundary gate (`validate-ai-boundary.mjs`) proving sibling independence from CLI/MCP/frameworks.
- "AI validation workflows" (§35): at minimum, a defined contract for what makes a generated Skill/LLM-context artifact valid (e.g., every metadata reference in a Skill resolves to a real component/field; every generated context file is reproducible from its declared source `metadataVersion`s).

---

## 10. Deferred capabilities

- Project-aware context (Fork 8) — no filesystem introspection, no per-project generated artifacts in v1.
- Task Knowledge layer (§26) — no concrete Blueprint elaboration exists beyond the name; nothing to specify yet.
- Populating `aiSkillsVersionRange` on real manifest entries — mechanically possible but not required to satisfy any v1 capability; left as implementation-time follow-up, exactly mirroring Phase 8 spec §6's treatment of `mcpVersionRange`.
- A dedicated schema `examples` field (Fork 9/12) — deferred, matching Phase 6's own original deferral.
- Any MCP↔AI or CLI↔AI dependency edge in either direction — not merely deferred, actively prohibited per §6 and the governing constraints.
- Fuzzy/ranked retrieval, embeddings, or any AI-generation-of-generation (e.g., using an LLM at build time to author Skill prose) — no Blueprint text calls for this; out of scope, not evidenced.

---

## 11. Unresolved questions

1. Whether the Phase 9 specification (or a later formal-review step) should register the §18-vs-§22 Blueprint diagram inconsistency (§4/§6 above) as a documentation correction to `BLUEPRINT.md` itself, or leave it as a research-doc-flagged reading resolved by this spec's own text (as Phase 8 did for its own analogous ambiguity, without amending the Blueprint). **Recommendation:** leave `BLUEPRINT.md` unmodified and resolve it in the spec's own text, consistent with Phase 8's precedent — but this is a process call for the Spec Review gate, not decided here.
2. Whether `AI_ARCHITECTURE.md`'s note that PrimeVue ships sibling `mcp`/`metadata` packages as prior art (flagged in Phase 0 "for later phases") extends to a Skills/LLM-context-equivalent package worth reviewing as external prior art — **not independently checked in this research pass**; if the user wants this before Spec Review, it would need a separate, scoped research task (not performed here, per this turn's Research + Specification instruction and time-boxing).
3. Exact per-record population target for `guidance`/`accessibility.guidance` content in v1 (all 8 records vs. a subset) is a content-authoring decision, not an architectural one — left to the specification's validation/testing requirements to define a minimum bar (e.g., "every Skill file references at least the `identity`/`api` facets; `guidance`-derived sections are omitted, not fabricated, where the underlying field is unpopulated" — mirroring MCP's own "degrade honestly, never fabricate" pattern, Phase 8 spec §7.2).

---

## Formal Review Record

- **Status:** Draft for review.
- **Review scope:** Research and real-source verification only, for Phase 9 — AI Skills and LLM Context. No implementation, implementation plan, package scaffolding, CI changes, or commits were made in the production of this document.
- **Assumptions:** Two architectural forks (package/content-directory split; project-aware-context v1 inclusion) were resolved by explicit user decision within this session rather than derived purely from Blueprint text, since Blueprint text left them genuinely open. Both decisions and their rationale are recorded in §8 (Forks 1 and 8).
- **Known risks:** The §18-vs-§22 Blueprint diagram inconsistency (§4) is real and unresolved at the Blueprint-document level; this research and the companion specification resolve it only for the purpose of Phase 9's own design, following the same non-amending precedent Phase 8 set for its own analogous ambiguity.
- **Unresolved questions:** see §11.
- **Statement:** Implementation and implementation planning are intentionally deferred. This document and its companion specification are inputs to the next SKey gate — formal specification review — not to implementation.
