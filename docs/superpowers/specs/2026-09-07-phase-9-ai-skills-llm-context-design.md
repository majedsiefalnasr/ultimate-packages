# Specification: Phase 9 — AI Skills and LLM Context

**Document:** `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md`
**Status:** Approved — implemented; `docs/architecture/ROADMAP.md` marks Phase 9 (AI Skills and LLM Context) Complete (see its footnote 5).
**Companion research:** `docs/architecture/research/2026-09-07-phase-9-ai-skills-llm-context.md`
**Baseline:** `main` at `033f147` (Phase 8 — MCP, closed)

This specification is implementation-ready but contains no implementation code. Every field and behavior below is justified by (1) a Blueprint/ADR requirement, (2) verified repository reality, or (3) an explicitly labeled architectural decision — each citation points at the research document section that established it.

---

## 1. Status / Purpose / Scope

**Purpose:** define the package/artifact boundaries, dependency direction, data contracts, and v1 capability set for Phase 9 — AI Skills and LLM Context, per Blueprint §35's objectives: "Skills architecture; generated LLM context; agent instruction conventions; compatibility between Skills and metadata; AI validation workflows."

**Scope of this document:** architecture and contracts only. No implementation code, no package scaffolding, no CI wiring, no commits. The next SKey gate after this document is formal specification review, followed by an implementation plan.

**Out of scope (see §12 for the full list):** project-aware context, a schema `examples` field, any MCP/CLI dependency edge, runtime services, AI-generated (LLM-authored) Skill content.

---

## 2. Architectural Baseline

Phase 6 (Component Metadata), Phase 7 (CLI), and Phase 8 (MCP) are closed. This spec extends, and does not modify, any of their contracts:

- `@ultimate/component-schema` / `@ultimate/component-metadata` (Phase 6) — 8-component proof set (Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip), `ComponentMetadata` type unchanged (research §3, §12/Fork 12).
- `@ultimate/cli` (Phase 7) — `compatibility-manifest.json` and `CompatibilityEntry` type unchanged; this spec does not populate `aiSkillsVersionRange` (already reserved, per research §3) as a v1 requirement.
- `@ultimate/mcp` (Phase 8) — unchanged; Phase 8 spec §9 already named the Phase 9 boundary this document formalizes from the AI/Skills side.

Governing dependency-direction rule (Blueprint §6, research §7):

```text
Component Source + Component Metadata + Documentation
        ↓
   (parallel siblings, no edges between them)
   CLI          MCP          @ultimate/ai  +  skills/
```

Prohibited (Blueprint §6, verbatim): `Ultimate Components → CLI → MCP → AI`. This spec establishes no dependency edge between `@ultimate/ai` and either `@ultimate/cli` or `@ultimate/mcp`, in either direction (§9).

---

## 3. Package and Artifact Boundaries

Two artifacts, per research §8/Fork 1 (user decision):

### 3.1 `@ultimate/ai` — generation and validation tooling (code package)

- Owns: code that reads `@ultimate/component-metadata` and produces Skill files and LLM-context artifacts; code that validates a Skill file's metadata references and a generated context artifact's reproducibility (§8).
- Does not own: component knowledge itself (remains in `@ultimate/component-metadata`); the Skill content it generates or checks lives in `skills/`, not inside `packages/ai/src`.
- Location: `packages/ai/` (already reserved as scaffolding, Phase 0, `AI_ARCHITECTURE.md`).

### 3.2 `skills/` — Skill content (repo-root content directory)

- Owns: one Skill file per component in `ALL_COMPONENTS` (§6.1 — exact v1 granularity, no alternative grouping in v1), hybrid hand-authored/metadata-referencing content per Blueprint §24.
- Not a TypeScript package; not published as an npm artifact by itself in v1. Consumed by AI coding agents directly as files, and/or bundled into `@ultimate/ai`'s generated LLM-context output.
- Location: repo-root `skills/` (already reserved as scaffolding, Phase 0).

### 3.3 Ownership summary

| Artifact                                   | Owns                       | Does not own                                |
| ------------------------------------------ | -------------------------- | ------------------------------------------- |
| `@ultimate/ai`                             | Generation/validation code | Component facts, Skill prose content itself |
| `skills/`                                  | Skill content files        | Generation logic, canonical component facts |
| `@ultimate/component-metadata` (unchanged) | Canonical component facts  | Skill prose, LLM-context output             |

---

## 4. Dependency Direction

- `@ultimate/ai` depends on `@ultimate/component-metadata` (workspace dependency), exactly as `@ultimate/mcp` and `@ultimate/cli` already do independently (research §7, mirroring Phase 8 spec §5.2).
- `@ultimate/ai` never imports `@ultimate/cli` or `@ultimate/mcp`. Neither `@ultimate/cli` nor `@ultimate/mcp` imports `@ultimate/ai`. No exceptions in v1.
- `packages/{ng,react,vue}*` never import `@ultimate/ai`. `@ultimate/ai` never imports any framework package.
- Where `@ultimate/ai` needs a fact also read by CLI/MCP (e.g., framework compatibility for a compatibility-aware Skill note), it reads `docs/architecture/compatibility-manifest.json` independently — the same repo-root, multi-reader-without-coupling pattern Phase 7 spec §6.4 designed and Phase 8 spec §5.2/§6 already reused for MCP. No shared extraction library is introduced for this (research §8/Fork 5 — YAGNI, two independent readers is not evidence a third exists).
- This dependency-direction rule is enforced by CI, not just documented (§10).

---

## 5. Input Knowledge Sources

`@ultimate/ai`'s generation and validation code reads, directly, and only:

1. `@ultimate/component-metadata`'s `ALL_COMPONENTS` export — identity, api, accessibility, style (pointer only), relationships, provenanceRef, guidance facets, exactly as Phase 6 defined them. No new fields, no reshaping at the source level.
2. `docs/architecture/compatibility-manifest.json` — read-only, for any compatibility-aware content (e.g., a Skill noting which framework versions a pattern applies to). Never written to by `@ultimate/ai` in v1.
3. Skill content files under `skills/` — read by the LLM-context generator as one of its own inputs (a generated `llms.txt`/`llms-full.txt` may incorporate Skill prose).

`@ultimate/ai` does **not** read: component source code (any framework package's `.ts`/`.tsx`/`.vue` files), `@ultimate/cli` internals, `@ultimate/mcp` internals, or `@ultimate/themes`' actual token values (style facts remain pointer-only, per research §5 — the same boundary Phase 8 spec §7.3 already drew for MCP's theme/token-lookup non-goal, extended here for the same reason: no schema or dependency exists yet to carry real token values into component-metadata).

### 5.1 Documentation as a Blueprint §25 input — v1 resolution

Blueprint §25 names five inputs to generated LLM context: component metadata, API information, documentation, examples, human-authored AI guidance. §5's three sources above cover metadata, API information (via `api.{framework}`), and human-authored guidance (via `skills/`). Examples are explicitly out of scope (§6.2, §12). This subsection resolves the remaining input: **documentation**.

**Repository check performed for this correction (re-verified against the current tree, not merely research-doc recall):**

- `apps/docs/` contains only `.gitkeep` — no docs site, no MDX, no Storybook exists anywhere in the repository (also independently confirmed by `BLUEPRINT_GAPS.md` GAP-004: "zero Storybook, screenshot, or visual-regression tooling exists anywhere in the repository").
- No component package (`packages/{ng,react,vue,ng-core,react-core,vue-core}`) carries JSDoc-style `@description`/`@example` doc comments on any exported component (repo-wide grep for `@description`/`@example` across those packages returns zero matches).
- Package-level `README.md` files exist (`packages/{ng,react,vue,ng-core,react-core,vue-core,themes,mcp,...}/README.md`) but are package-level onboarding documents, not per-component structured documentation, and are not referenced anywhere by `@ultimate/component-metadata` or any schema field.
- The one structured, canonical, per-component prose field that does exist is `identity.description` (`packages/component-schema/src/identity.ts`), already covered by §5 item 1 and already the backing source for §7.1's `llms.txt` index and §6.2's "When to use" Skill section.

**Conclusion: no canonical, structured, per-component documentation source exists in the repository today**, beyond `identity.description` (already an input via §5 item 1) and `skills/` prose (already an input via §5 item 3, once authored).

**v1 decision:** documentation ingestion beyond `identity.description` and `skills/` content is **explicitly deferred**, not silently omitted. Phase 9 v1 does not invent a documentation system (a docs site, MDX corpus, or JSDoc-extraction pipeline) to satisfy this Blueprint §25 input — doing so would be exactly the kind of speculative infrastructure the governing constraints prohibit, and Storybook/docs-site tooling is itself an open, unresolved gap (GAP-004) with no committed design of its own. When a canonical structured documentation source is built (Storybook, a docs site, or an equivalent — GAP-004's own eventual resolution), `@ultimate/ai` gains a fourth input source at that time; this is future work belonging to whichever phase closes GAP-004, not invented here.

**What v1 generates without a dedicated documentation source:** `llms-full.txt` and the framework-specific variants (§7.1) are complete with respect to every field Phase 6 metadata + Skills actually populate — identity (including `description`), API, accessibility, relationships, guidance, and Skill prose. No section of the generated output is left as a placeholder for "documentation" that doesn't exist; the artifact honestly reflects what the platform currently has, per the same degrade-honestly rule §6.2 already establishes for Skills.

---

## 6. Skills Contract

### 6.1 Granularity

One Skill file per component currently present in `ALL_COMPONENTS` (8 in v1: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip). A Skill file is added when, and only when, its corresponding component exists in `@ultimate/component-metadata` — Skills never precede metadata for a component that doesn't yet exist there (mirrors the "leaf consumer" relationship, research §3/GAP-030).

### 6.2 Structure

Each Skill file's content sections map directly onto Blueprint §24's named components and their backing data source:

| §24 Skill component         | v1 backing source                                                                           | If source absent                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| When to use                 | `identity.description` (required, always present) + hand-authored elaboration               | N/A — always populated                                                                                                                                                                     |
| Preferred patterns          | `guidance.usageNotes` (optional) + hand-authored elaboration                                | Generated marker pair present, empty content (§6.3.3)                                                                                                                                      |
| Allowed/recommended APIs    | `api.{framework}.props` / `.events` (per framework, required where `api` exists)            | Generated marker pair present; a framework with no `api.{framework}` entry contributes nothing to the rendered content                                                                     |
| Anti-patterns               | `guidance.antiPatterns` (optional)                                                          | Generated marker pair present, empty content (§6.3.3)                                                                                                                                      |
| Accessibility guidance      | `accessibility.verifiedRoles` / `.verifiedAriaAttributes` / `.guidance` (optional)          | Generated marker pair present, empty content (§6.3.3)                                                                                                                                      |
| Examples                    | **Not included in v1** (research §8/Fork 9 — no `examples` field exists; not invented here) | No marker pair at all — the only §6.2 row with no corresponding §6.3.3 generated section                                                                                                   |
| Related components          | `relationships.*` (populated per-record)                                                    | Generated marker pair present, empty content (§6.3.3)                                                                                                                                      |
| Framework-specific guidance | `api.{framework}` presence/absence pattern, plus hand-authored per-framework notes          | The generated (API-presence) half follows "Allowed/recommended APIs"'s rule; the hand-authored narrative half is never marker-wrapped and is simply left blank by the author until written |

**Honesty rule (mirrors Phase 8 spec §7.1/§7.2's "degrade honestly, never fabricate" pattern):** a Skill file never presents generated content as populated when its backing metadata field is absent. An unpopulated optional field means the corresponding generated marker pair's content is empty (§6.3.3), never filled with placeholder or invented text — the marker pair itself still exists, per §6.3.3's deterministic-marker-count rule, which is distinct from and takes precedence over this table's earlier "omitted" phrasing.

### 6.3 Authoring model

Hybrid, per Blueprint §24 verbatim ("Skills may be human-authored but should reference canonical component metadata") and research §8/Fork 2:

- Prose (When to use, Preferred patterns narrative, Anti-patterns narrative, Framework-specific notes) is hand-authored, free text, and is never machine-validated for semantic accuracy (no LLM-based or heuristic semantic checking of prose — §10.2, §12).
- Every generated section (§6.2's table — Allowed/recommended APIs, Accessibility guidance, Related components, and the `usageNotes`/`antiPatterns` text itself) is rendered directly from `ComponentMetadata` fields, not hand-typed by the Skill author. This is what makes those sections machine-checkable: they are not prose claims to verify, they are direct field renderings — verifying them means verifying the renderer copied the field correctly, not verifying an arbitrary sentence.
- A Skill file's only free-form, author-controlled "factual" surface is §6.3.1's structured frontmatter reference block, below — not the prose body.

#### 6.3.1 Structured metadata-reference declaration (frontmatter)

Every Skill file opens with a structured, machine-parseable frontmatter block (YAML). This format is a **Phase 9 specification-defined contract**, not an existing repository convention — this repository's own spec documents (`docs/superpowers/specs/*.md`, including this one) use a bold-label header block (`**Status:**`, `**References:**`), not YAML frontmatter, and no repository Skill-file convention exists yet to cite. YAML is chosen here because it is a widely-understood, unambiguous, machine-parseable key/value format well suited to the small, flat declaration below — not because it matches prior art in this repository. The frontmatter block declares exactly what the file's generated sections are drawn from:

```yaml
---
component: Button # exact match to identity.name in ALL_COMPONENTS
metadataVersion: 3 # exact metadataVersion this Skill was authored/generated against (§6.3.2)
frameworks: [ng, react, vue] # subset of api.{framework} keys this Skill's generated sections cover
---
```

This frontmatter block is the entire "declared factual reference" surface a validator checks (§10.2). It does not, and is not intended to, verify the hand-authored prose body — only that:

- `component` names a real entry in `ALL_COMPONENTS`.
- `frameworks` is a subset of that component's actual populated `api.{framework}` keys (no framework claimed that the component doesn't have API facts for).
- `metadataVersion` matches that component's current `metadataVersion` (§6.3.2 defines the exact matching rule).

Any generated section (§6.2's table) is regenerated directly from the fields the frontmatter identifies — the generator, not the human author, is responsible for those sections' correctness, so there is nothing further for a validator to check beyond confirming the frontmatter's own three claims above are true.

#### 6.3.2 `metadataVersion` reference contract

- **Location and representation:** the `metadataVersion` field in each Skill file's frontmatter (§6.3.1), a single integer, matching `ComponentMetadata.metadataVersion`'s own type (`packages/component-schema/src/metadata-version.ts`).
- **Matching rule:** exact equality only. `metadataVersion: 3` in a Skill file is valid only while `ALL_COMPONENTS`'s `Button` record's `metadataVersion` is exactly `3`. No range, no "greater than or equal to" semantics — this mirrors Phase 6's own `nextMetadataVersion()` model, which treats `metadataVersion` as a precise content-change counter, not a compatibility range (contrast with `aiSkillsVersionRange`, §11, which is a range because it describes package compatibility, not per-record content freshness).
- **Mismatch behavior:** a mismatch is a **validation failure** (blocks CI, per §10.1's pattern of hard-enforced boundary gates), not a warning. Rationale: §24's requirement that Skills be "tied to compatible Ultimate metadata/component versions" is a correctness requirement — a stale reference means the generated sections were regenerated from a since-changed record without the Skill's hand-authored prose being reviewed against the change, which is exactly the drift Blueprint §25's "not the primary source of truth" principle exists to prevent.
- **Multiple components:** a v1 Skill file references exactly one component (§6.1's one-file-per-component granularity) and therefore declares exactly one `component`/`metadataVersion` pair. A Skill file never references multiple components' `metadataVersion`s in v1 — cross-component Skills are not part of this specification (would require a different granularity decision than §6.1's, not made here).
- **Update responsibility:** the generator, not validation, is responsible for updating `metadataVersion` in the frontmatter. When `@ultimate/ai` regenerates a Skill's generated sections (§6.3.3), it also rewrites the frontmatter's `metadataVersion` to match the current record. Validation (§10.2) only detects mismatch when a Skill file has been generated (or hand-edited) out of step with a metadata change — it never silently auto-corrects a mismatch it finds, since that would mask the exact drift it exists to catch (running the generator is the corrective action, not the validator).
- **Interaction with generated-section boundaries (§6.3.3):** `metadataVersion` and the generated-block markers are two parts of one freshness mechanism, not two independent ones. `metadataVersion` answers "was this file's generated content produced from the current record," while the markers (§6.3.3) answer "which bytes in this file are that generated content." The generator only ever rewrites bytes between markers and the frontmatter's `metadataVersion` field in the same regeneration pass — never one without the other. A Skill file where `metadataVersion` matches the current record but a generated block's content does not match what regeneration would produce (or vice versa) is malformed under §6.3.3/§10.2's fidelity check, not a state this contract allows to occur through normal generator operation.

### 6.3.3 Generated-section boundary contract

Every generated section named in §6.2's table is wrapped in an explicit start/end marker pair inside the Skill file's Markdown body (below the frontmatter, §6.3.1). This is the deterministic mechanism that lets both the generator and the validator distinguish generator-owned bytes from hand-authored bytes, without inferring intent from prose or headings.

**Marker syntax.** Each generated section is delimited by a single-line HTML comment pair, machine-greppable and inert in rendered Markdown:

```markdown
<!-- ultimate:generated:start section="preferred-patterns" -->

...generator-owned content, rendered from ComponentMetadata...
<!-- ultimate:generated:end section="preferred-patterns" -->
```

- The `section` attribute's value is one of the exact section keys in the table below (§6.3.3's "Section key" column) — never a free-form or author-chosen string.
- Marker lines are exact-match, single-line, no trailing content on the marker line itself beyond the comment. A generator or validator locates a section by regex/string match on these two exact lines, not by parsing Markdown structure (headings, indentation) — this is what makes marker detection deterministic and independent of how the surrounding hand-authored prose is formatted.
- Everything strictly between a matched `start`/`end` pair for a given `section` is generator-owned (§6.3.3's Ownership rule, below). Everything outside every marker pair — including the frontmatter block (governed separately by §6.3.1/§6.3.2) — is hand-authored and never touched by the generator.

**Exact generated section names and order.** v1 defines exactly five generated sections, corresponding to the five backed-by-metadata rows in §6.2's table (the two prose-narrative rows — "When to use," and the hand-authored halves of "Preferred patterns"/"Anti-patterns"/"Framework-specific guidance" — are never marker-wrapped; see Ownership below). In v1 file order:

| Section key              | §6.2 table row                      | Backing field(s)                                                                           |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `preferred-patterns`     | Preferred patterns (generated half) | `guidance.usageNotes`                                                                      |
| `allowed-apis`           | Allowed/recommended APIs            | `api.{framework}.props` / `.events`, for each framework in frontmatter's `frameworks` list |
| `anti-patterns`          | Anti-patterns                       | `guidance.antiPatterns`                                                                    |
| `accessibility-guidance` | Accessibility guidance              | `accessibility.verifiedRoles` / `.verifiedAriaAttributes` / `.guidance`                    |
| `related-components`     | Related components                  | `relationships.*`                                                                          |

A Skill file's five marker pairs appear in exactly this order in v1. `examples` has no marker (§6.2 — not included in v1); "When to use" and the prose halves of "Framework-specific guidance" have no marker (Ownership, below) — five is the complete v1 count, not a subset.

**A section whose backing field is absent (§6.2's "If source absent" column) still gets an empty marker pair** — `start`/`end` with nothing between them — never an omitted marker pair. This keeps marker presence deterministic (always exactly five pairs, always in order) independent of which optional metadata fields happen to be populated for a given component; §6.2's "omitted, not fabricated" rule governs the _content_ between the markers, not whether the markers themselves exist.

**Ownership.**

- **Generator-owned:** everything between a `start`/`end` marker pair, for all five sections above. The generator may freely rewrite this content on every regeneration; nothing inside a marker pair is ever hand-edited in the normal authoring workflow (see malformed-marker handling below for what happens if it is).
- **Hand-authored, never touched by the generator:** the entire frontmatter block (§6.3.1, governed by its own rules, not §6.3.3's markers) plus every byte of the Markdown body outside all five marker pairs — this includes the "When to use" section, the prose halves of "Preferred patterns," "Anti-patterns," and "Framework-specific guidance" (§6.2's table already splits each of these into a generated data half and a hand-authored narrative half; only the generated half is marker-wrapped), section headings, and any additional structure the author adds around the marker pairs.
- The generator never overwrites, reformats, or reorders content outside its own five marker pairs. A regeneration run touches only: (a) the frontmatter's `metadataVersion` field (§6.3.2), and (b) the exact byte ranges between each of the five `start`/`end` pairs. Everything else in the file — including marker placement itself, once a Skill file has been initially generated — is preserved verbatim.

**Malformed-marker validator behavior.** Validation (§10.2) treats the following as hard failures, each reported with the specific marker/section it found wrong (mirroring MCP's own structured-error, never-fabricate pattern, Phase 8 spec §4.1):

| Condition                                                                                                                                                                                       | Validator outcome                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A required section key (one of the five in the table above) has no marker pair at all                                                                                                           | **Validation failure** — "missing required generated section: `{key}`"                                                                                                                                  |
| A section key's marker pair appears more than once in the file                                                                                                                                  | **Validation failure** — "duplicate generated section: `{key}`"                                                                                                                                         |
| A `start` marker with no matching `end` marker for the same `section`, or vice versa                                                                                                            | **Validation failure** — "unmatched marker for section: `{key}`"                                                                                                                                        |
| A `start`/`end` pair for one `section` value nested inside another `section`'s `start`/`end` pair                                                                                               | **Validation failure** — "nested generated block: `{outer}` contains `{inner}`" — v1 markers are always flat, never nested, since each section maps to exactly one metadata source with no sub-sections |
| A marker line present but not an exact syntactic match to the §6.3.3 format (e.g., a typo in `ultimate:generated:start`, a missing `section` attribute, extra trailing text on the marker line) | **Validation failure** — "malformed generated marker" — treated the same as a missing marker, since a validator cannot safely assume a malformed line was intended as a real boundary                   |

None of these conditions are warnings in v1 — every one blocks the same way a `metadataVersion` mismatch does (§6.3.2), consistent with §10.1's pattern of hard-enforced, CI-blocking gates rather than advisory ones.

**Generator behavior on missing/existing blocks.** The generator (not the validator) is responsible for creating a Skill file's initial structure. Two distinct operations, kept separate:

- **First generation for a component** (no Skill file exists yet under `skills/` for that `component`): the generator creates the file with frontmatter (§6.3.1) plus all five marker pairs in order, each populated per §6.2/§6.3.3's content rules, plus placeholder hand-authored sections (e.g., an empty "When to use" heading) for a human author to subsequently fill in. This is scaffolding, not validation — a freshly generated file is expected to still need hand-authored prose before it is a complete Skill.
- **Regeneration of an existing Skill file:** the generator locates each of the five marker pairs by exact syntactic match (§6.3.3's marker syntax) and replaces only the content strictly between each matched pair, plus the frontmatter's `metadataVersion` (§6.3.2). It does not touch anything else in the file. **If regeneration is run against a Skill file that already fails one of the malformed-marker conditions above** (missing, duplicate, unmatched, nested, or malformed marker), the generator refuses to regenerate that file and reports the same structured error the validator would — the generator never silently "repairs" a malformed file by guessing where a missing marker should go, since that would risk destroying adjacent hand-authored content it cannot safely distinguish from a missing generated block.

**Validator fidelity — operational definition.** "Generated-section fidelity" (as referenced in §10.2) means, precisely: for each of the five marker-delimited sections in a Skill file, the content strictly between its `start`/`end` markers is byte-identical to what running the generator's rendering rule for that `section` key against the referenced component's _current_ metadata (per the frontmatter's `component`, matched against `ALL_COMPONENTS`) would produce. This is a deterministic, mechanical comparison — render the section from current metadata, compare bytes to what's checked in between the markers — never a semantic or heuristic judgment about whether the content "looks right." It is exactly analogous to §7.3's determinism check for LLM-context artifacts, applied per-section instead of per-file. Content outside all marker pairs (hand-authored prose) is never included in this comparison and is never fidelity-checked (§10.2, §12 — no semantic prose validation).

### 6.4 What a Skill must never contain

- Source-code-level implementation details not present in structured metadata (research §6/E, §12/Fork 12 — no runtime source parsing, no source-derived content).
- Claims about a framework the referenced component's `api.{framework}` does not cover.
- References to the `examples` field (does not exist in v1 — §6.2).
- References to actual theme/token values (style facts remain pointer-only — §5).

---

## 7. LLM Context Contract

### 7.1 Output shape

Static, generated files (research §8/Fork 3, Fork 7), per Blueprint §25's named potential outputs. v1 defines exactly five output files, all generated into a single deterministic directory relative to the `@ultimate/ai` package root, `dist/context/` (the generator package's own build output directory — no separate publish target is introduced in v1):

| File                          | Content                                                                                                                                                                                                                                                                                                                       | Framework scope                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `dist/context/llms.txt`       | Compact, framework-neutral index: one line per component (`name`, `category`, `identity.description`), drawn from `identity` only.                                                                                                                                                                                            | Neutral                                       |
| `dist/context/llms-full.txt`  | Full structured component context: for every component in `ALL_COMPONENTS`, every populated facet (identity, api for every framework the component has, accessibility, relationships, guidance) rendered as structured text, plus the corresponding `skills/` Skill's generated sections (§6.2) where that Skill file exists. | Neutral (all frameworks included, unfiltered) |
| `dist/context/llms-ng.txt`    | Same structure as `llms-full.txt`, narrowed to `api.ng` only — components with no `api.ng` entry are omitted from the `api` section but still listed via `identity` (mirrors MCP's own `get_component`-with-`framework`-input narrowing rule, Phase 8 spec §7.1).                                                             | Angular only                                  |
| `dist/context/llms-react.txt` | Same as above, narrowed to `api.react`.                                                                                                                                                                                                                                                                                       | React only                                    |
| `dist/context/llms-vue.txt`   | Same as above, narrowed to `api.vue`.                                                                                                                                                                                                                                                                                         | Vue only                                      |

File naming is fixed for v1 (no configurable output path, no alternative layout) — the exact five filenames above are the v1 contract. Their distribution and consumption model — where they live relative to _this repository's_ build output versus where a _consuming project_ actually finds them — is defined precisely in §7.1a, since `dist/` inside this repository is gitignored build output, not something a consuming project outside this monorepo can read directly. Project context (Blueprint §25's fourth named potential output) is **deferred**, not produced in v1 (research §8/Fork 8) — no sixth file is defined for it.

### 7.1a Distribution and consumption contract

**Repository fact, re-verified for this correction:** `.gitignore` contains a bare `dist/` entry, applying repo-wide — `dist/context/*.txt`, like every other package's `dist/` output (e.g., `packages/mcp/package.json`'s own `"files": ["dist", "README.md"]` — `dist/` is npm-publish payload, rebuilt per-install, never committed to the repository). This means §7.1's five files never exist in this repository's git history at any point, and a project outside this monorepo has no source-tree copy to read.

**The v1 distribution model is a normal npm package artifact, not a second mechanism:**

- The five files in §7.1's table are build artifacts **owned and generated by `@ultimate/ai`**, exactly as `@ultimate/mcp`'s compiled server code is a build artifact owned by `@ultimate/mcp` — no new distribution concept is introduced.
- `@ultimate/ai`'s `package.json` **must** declare a `files` field including `dist/context` (mirroring `@ultimate/mcp`'s existing `"files": ["dist", "README.md"]` pattern), so that `npm pack`/`npm publish` includes the five generated `.txt` files in the published tarball. Without this, `npm publish`'s default file-inclusion behavior cannot be assumed to carry non-code `.txt` output — this is a specification-level packaging requirement, not left implicit.
- A consuming project obtains the five files by installing `@ultimate/ai` as an npm dependency (or devDependency — the choice belongs to the consuming project, not specified here) and reading them from its own `node_modules/@ultimate/ai/dist/context/*.txt` — the same way any npm package's shipped non-code assets are consumed. This is the **only** v1 distribution path. No repository-hosted download, no CDN, no separate publish target, no runtime fetch — a plain installed-package file, consistent with §7.2's "generation, not service" rule.
- This does **not** require committing `dist/` to this repository. The gitignored status of `dist/` inside _this_ repository is orthogonal to whether the _published npm tarball_ contains those files — `npm publish` packages `dist/` from the local build output at publish time regardless of `.gitignore`, exactly as every other Ultimate package (`cli`, `mcp`, the framework packages) already does.
- **§8's agent-instruction convention must reference the installed-package location** — `node_modules/@ultimate/ai/dist/context/*.txt` relative to the consuming project's own root, or equivalently "the `dist/context/` directory of the installed `@ultimate/ai` package" — never `packages/ai/dist/context/` (a path meaningful only inside this monorepo's own source tree, not to an external consuming project). §8 is corrected accordingly, below.
- **Left to the implementation plan, not this specification:** the exact `files`/`exports` configuration syntax in `@ultimate/ai`'s `package.json`; a build/CI step that verifies the five files actually appear in a real `npm pack` tarball; and a real installed-consumer verification (installing the packed tarball into a scratch project and confirming the five files resolve at the documented `node_modules` path). These are packaging-mechanics verification steps belonging to implementation and its own testing requirements (§10.3's counterpart at implementation-plan time), not architectural decisions this specification needs to make further.

### 7.2 Generation, not service

`@ultimate/ai` is a build-time generator. It has no runtime server, no query API, no long-running process. This is the direct contrast with `@ultimate/mcp`'s explicit protocol-server design (Phase 8 spec §5.1) and satisfies the governing constraint that AI/Skills/LLM Context must not become a hidden runtime dependency of anything.

### 7.3 Determinism

Generation is deterministic: given the same `ALL_COMPONENTS` content, the same `skills/` content, and the same generator code version, output is byte-for-byte identical. This is an explicit architectural decision (research §6/F — Blueprint text does not state it directly, but it is required for the artifacts to be meaningfully regenerable and diffable, consistent with "generated outputs should not become the primary source of truth," Blueprint §25).

### 7.4 Source-of-truth boundary

Generated LLM-context files are never hand-edited. Any correction belongs upstream — in `@ultimate/component-metadata` (for a factual error) or in `skills/` (for a guidance error) — followed by regeneration. This is Blueprint §25's explicit rule, verbatim: "Generated outputs should not become the primary source of truth."

### 7.5 Framework-awareness

Yes — §7.1's three framework-specific variants, generated from the same per-framework `api.{ng,react,vue}` structure `@ultimate/component-metadata` already provides (research §8/Fork 6). No new per-framework data model is introduced.

### 7.6 Project-awareness

Not part of v1 (§12). No filesystem introspection, no per-project generated artifact, no project-supplied input contract of any kind in this phase.

---

## 8. Agent-Instruction-File Conventions

Blueprint §26 (verbatim): "The platform should provide conventions for agent instruction files and Skills, while avoiding dependence on one specific coding agent."

**v1 scope and location:** `skills/AGENT_CONVENTIONS.md` (repo-root, alongside the per-component Skill files, §3.2) is the one canonical convention document. It is content, not code, so it belongs in `skills/` (the content artifact, §3.2) rather than `packages/ai/` (the code artifact, §3.1) — consistent with §3's own ownership split: `@ultimate/ai` owns generation/validation logic, `skills/` owns everything a consuming project or agent actually reads. This document describes how a consuming project's agent-instruction file (e.g., a project's own `AGENTS.md`/`CLAUDE.md`-equivalent, tool-agnostic) should reference Ultimate's five generated context files and `skills/` Skill files. Per §7.1a's distribution contract, the convention document must point at the **installed-package** location — `node_modules/@ultimate/ai/dist/context/*.txt` relative to the consuming project's own root — never at `packages/ai/dist/context/`, which is a path internal to this monorepo's own source tree and meaningless to a project that only has `@ultimate/ai` installed as a dependency. This convention:

- Names no single coding agent or tool as required (Blueprint §26's explicit constraint).
- Describes how to reference the generated artifacts (§7) and Skills (§6), not how to configure any particular agent's proprietary settings format.
- Is itself a static document, not code, not a runtime capability.

This satisfies Blueprint §35's "agent instruction conventions" objective at the scope the evidence supports: a convention, not a per-tool integration (research §9).

---

## 9. Explicit Boundary — What Phase 9 Does Not Own

Restated and made bidirectional, extending Phase 8 spec §9's original statement of this same boundary from the MCP side:

- **MCP's live query capability** (Phase 8, closed) — `@ultimate/ai` does not call `@ultimate/mcp`'s tools, does not depend on the MCP protocol, and does not duplicate MCP's runtime-query role. An AI agent may use both Skills (loaded as static context) and MCP (queried live) in the same session — that is a consumer-side combination, not a Phase 9 architectural dependency.
- **CLI's orchestration role** (Phase 7, closed) — `@ultimate/ai` does not invoke `@ultimate/cli` commands, does not read `@ultimate/cli`'s internal `KNOWN_COMMANDS`, and does not become a CLI subcommand's implementation. The Blueprint-listed `ultimate ai` conceptual command (§19) remains CLI-owned scaffolding; if it is ever implemented, it would be CLI-side code that separately reads `@ultimate/ai`'s generated output files (a data dependency on `@ultimate/ai`'s output, not a code dependency on `@ultimate/ai`'s package) — not designed further here, since no Blueprint text commits to that command's implementation in Phase 9's scope.
- **Component knowledge ownership** — `@ultimate/component-metadata` (Phase 6, closed) remains the single canonical source. Phase 9 never redefines, reshapes, or duplicates a canonical fact; it only reads and re-presents.
- **Theme/token value ownership** — `@ultimate/themes` remains the owner of actual token values; Phase 9 never reads them directly (§5).

---

## 10. Validation, CI, and Boundary Enforcement

### 10.1 New CI boundary gate — `boundary:validate:ai`

Modeled directly on Phase 7/8's proven pattern (`validate-cli-boundary.mjs`, `validate-mcp-boundary.mjs`; research §8/Fork 11), a new script must prove bidirectionally:

- `packages/{ng,react,vue}*` never import or depend on `@ultimate/ai`.
- `@ultimate/ai` never imports or depends on `@ultimate/cli`, `@ultimate/mcp`, or `@ultimate/{ng,react,vue,themes}`.

This spec mandates the gate's existence and exact scope; writing the script is implementation-plan/implementation work, using the existing two scripts as a direct structural template.

### 10.2 Skill content validation ("AI validation workflows," Blueprint §35)

Validation is deterministic and checks **declared references and marker-delimited generated content, never prose** (§6.3–§6.3.3) — it never attempts to semantically verify hand-authored free text, and never uses an LLM to do so (§12). At minimum, v1 validation must check, in this order (a marker-structure failure is reported before fidelity is even attempted, since fidelity requires well-formed markers to compare against):

- **Frontmatter component reference:** every Skill file's `component` field (§6.3.1) names a real `identity.name` in `ALL_COMPONENTS`. Fails validation otherwise.
- **Frontmatter framework reference:** every Skill file's `frameworks` list (§6.3.1) is a subset of that component's actual populated `api.{framework}` keys. Fails validation if a listed framework has no corresponding `api.{framework}` entry.
- **Frontmatter `metadataVersion` reference:** exact-equality check against the referenced component's current `metadataVersion`, per §6.3.2's contract. Mismatch is a validation failure, not a warning (§6.3.2).
- **Marker structure:** all five required generated-section markers (§6.3.3's table) are present exactly once each, correctly paired, unmatched-free, and non-nested. Any of §6.3.3's malformed-marker conditions (missing/duplicate/unmatched/nested/malformed) is a validation failure, reported per §6.3.3's table — checked before fidelity, below.
- **Generated-section fidelity:** for a Skill file that passes the marker-structure check, the content between each of the five marker pairs is byte-identical to what regenerating that section from the referenced component's current metadata would produce, per §6.3.3's operational definition. This is the mechanical, per-section counterpart to §6.3.2's file-level `metadataVersion` check — a file can only pass fidelity if both the declared `metadataVersion` matches and every marked section's actual bytes match what that version's metadata would generate.
- Generated LLM-context artifacts (`llms.txt`/`llms-full.txt`/framework variants) are checked for reproducibility: regenerating from the same inputs must produce byte-identical output (§7.3).

This is a specification-level contract; the concrete validation script/test harness is implementation work, following the same "structured checks, no fabrication" discipline as MCP's own honesty rules (Phase 8 spec §7.1/§7.2, §6.4 above). No part of v1 validation attempts to verify arbitrary hand-authored prose (§6.3) — that surface is intentionally outside what this contract can or does check.

### 10.3 Testing requirements

- `@ultimate/ai`'s generation code: unit/integration tests verifying correct empty-marker-content behavior (§6.2's honesty rule, §6.3.3's marker-always-present invariant) for components with and without each optional facet populated — specifically: (a) for a component with the backing facet populated (Table, the one record with populated `guidance`), the corresponding marker pair's content is non-empty and matches the facet; (b) for a component with the backing facet absent (any of the other 7 records for `guidance`), the corresponding marker pair is still present in the generated file, with empty content between `start`/`end` — never a missing or omitted marker pair. `Examples` is excluded from this test category entirely, since it is the sole v1 section with no marker pair at all (no `examples` field exists in the v1 data model, §6.2, §6.3.3).
- Determinism test: two generation runs against identical input produce identical output (§7.3).
- Boundary test: the new `boundary:validate:ai` gate itself is exercised in CI (§10.1).

### 10.4 CI requirements

- `boundary:validate:ai` wired into `.github/workflows/ci.yml`, following the existing `boundary:validate:cli` / `boundary:validate:mcp` step pattern (confirmed at lines 63–67 of the current workflow).
- No new external runtime dependency is introduced into any framework package's dependency tree by this phase.
- Per §7.1a: CI must verify the packaging contract, not merely assume it — a step confirming `@ultimate/ai`'s `package.json` `files` field actually causes the five `dist/context/*.txt` files to appear in a real `npm pack` output, and (at minimum once, e.g. as an implementation-plan-time integration test) that installing the packed tarball into a scratch consumer resolves all five files at the documented `node_modules/@ultimate/ai/dist/context/` path. The exact script/test implementation is implementation-plan work; this specification mandates only that such verification exist, mirroring how §10.1 mandates the boundary gate's existence without prescribing its code.

### 10.5 Documentation requirements

- `packages/ai/README.md` documenting the generation/validation tooling's scope and the boundary in §9.
- `skills/README.md` (or equivalent) documenting the per-Skill structure (§6.2) and the authoring model (§6.3), so a future contributor authoring a new Skill by hand follows the same contract this spec defines.
- The agent-instruction-file convention document itself (§8).

---

## 11. Versioning

Per research §8/Fork 10 — no independent semver system for Skills/LLM-context artifacts. Instead:

- Each Skill file records which component and `metadataVersion` it references (§6.3.1–§6.3.2), the same fine-grained freshness mechanism Phase 6 already established for cross-record consistency (Phase 6 spec §5).
- `@ultimate/ai`'s own package version follows ordinary independent package versioning (Blueprint §21) like every other Ultimate package.

**`aiSkillsVersionRange` — ownership clarification (not a Phase 9 concern):**

- `aiSkillsVersionRange?: string` already exists today as a reserved, optional field on `CompatibilityEntry` (`packages/cli/src/compatibility.ts`, confirmed present, currently unpopulated on every real manifest entry). It was reserved by Phase 7, not introduced by this spec.
- Phase 9 v1 does not populate this field on any manifest entry, and does not read it.
- No change to `docs/architecture/compatibility-manifest.json`'s schema, `CompatibilityEntry`'s type, or `@ultimate/cli`'s `matchCompatibility()` resolver is required or made by this specification.
- Whether and when to populate `aiSkillsVersionRange` is a separate, future compatibility-policy decision belonging to whoever next revises `@ultimate/cli`'s compatibility resolver — exactly mirroring Phase 8 spec §6's identical treatment of `mcpVersionRange` as "CLI's own future work," not an MCP-side (there, Phase 8-side; here, Phase 9-side) architectural decision.

---

## 12. Explicit Non-Goals / Deferred Work

Consolidated, each tied to its research-document justification:

- **Project-aware context** — no filesystem introspection, no per-project generated artifact (research §8/Fork 8, user decision this session).
- **A schema `examples` field** — not added; Skills v1 ships without a populated "Examples" section (research §8/Fork 9/12, mirrors Phase 6 spec §7's own original deferral and Phase 8 spec §7.3's identical treatment for MCP).
- **Any dependency edge between `@ultimate/ai` and `@ultimate/cli` or `@ultimate/mcp`, in either direction** — prohibited, not merely deferred, enforced by a new CI gate (§9, §10.1).
- **Populating `aiSkillsVersionRange` on real compatibility manifest entries** — left as `@ultimate/cli`'s own future work (§11).
- **A runtime AI/Skills service or query API** — v1 is generation-only (§7.2); this is the direct contrast with MCP, not a partial implementation of one.
- **LLM-generated (AI-authored) Skill prose** — no Blueprint text calls for using an LLM at build time to author Skill content; v1's "generated" scope is limited to structurally deriving sections from metadata, never generating prose via an AI model (research §10, "AI tooling must support multiple agents and providers" — Blueprint §22 — is about the platform's own neutrality toward consumer AI tooling, not a license to make Phase 9's own build process AI-dependent).
- **Task Knowledge layer content** (Blueprint §26) — named but not elaborated anywhere in Blueprint text; nothing concrete to specify yet (research §10).
- **Theme/token value exposure** — style facts remain pointer-only, same boundary Phase 8 spec §7.3 drew for MCP (§5, §9).
- **A shared extracted knowledge-layer package between MCP and `@ultimate/ai`** — both read `@ultimate/component-metadata` independently; no third consumer justifies extraction (research §8/Fork 5).
- **Amending `docs/architecture/BLUEPRINT.md` itself** to resolve the §18-vs-§22 diagram reading tension — resolved in this spec's own text (§2, §7) instead, mirroring Phase 8's precedent of resolving its own analogous ambiguity without amending the Blueprint (research §11).
- **Building a documentation system (docs site, MDX corpus, or JSDoc-extraction pipeline) to satisfy Blueprint §25's "documentation" input** — deferred; no canonical structured documentation source exists in the repository today beyond `identity.description` and `skills/` content, both already in scope (§5.1). Building one is future work belonging to whichever phase resolves GAP-004 (Storybook/docs-site tooling), not invented here.
- **Semantic validation of hand-authored Skill prose** — v1 validation checks only the structured frontmatter reference block (§6.3.1) and generated-section fidelity (§10.2); it does not, and architecturally cannot, verify arbitrary free text for factual accuracy without an LLM-based semantic checker, which is itself out of scope (§10.2).

---

## 13. Specification Quality Gate (self-check)

- **Placeholder scan:** no "TBD"/"TODO" remains; every section states a concrete v1 rule or an explicit deferral, including the five exact artifact paths (§7.1), their distribution/consumption model (§7.1a), the frontmatter schema (§6.3.1), the `metadataVersion` matching rule (§6.3.2), and the generated-section marker syntax/ownership/validator-behavior contract (§6.3.3).
- **Internal consistency:** §3's ownership split, §4's dependency direction, §6/§7's contracts, and §9's boundary all agree — `@ultimate/ai` reads metadata directly, never through CLI/MCP, and owns generation/validation only, never canonical facts. §3.2 and §6.1 now state the same one-file-per-component granularity with no alternative wording. §6.2's "If source absent" column agrees with §6.3.3's rule that a generated marker pair always exists (with empty content when its backing field is absent), and §10.3's testing requirement now states that same invariant explicitly rather than the earlier, superseded "section-omission" phrasing. §7.1's artifact paths and §8's convention document now agree on which path a consuming project actually reads (installed-package `node_modules/@ultimate/ai/dist/context/`, §7.1a), rather than §8 pointing at a monorepo-internal path no external consumer can reach.
- **Scope check:** single phase, single implementation plan's worth of work (two new artifacts, one new CI gate, one new convention document) — no decomposition needed.
- **Ambiguity check:** the one genuine Blueprint-level ambiguity found (§18 vs §22 diagrams) is explicitly resolved in §2/§7 rather than left open; both v1-scope forks resolved by explicit user decision are cited by section number wherever they affect a later section; the formal review's five substantive findings (documentation input, validation mechanism, `metadataVersion` contract, artifact naming, granularity wording) are each resolved with a concrete, deterministic rule rather than left open (§5.1, §6.3.1–§6.3.2, §10.2, §7.1, §3.2/§6.1); the follow-up MAJOR finding (generated-section boundary contract) is resolved with an explicit marker syntax, ownership rule, and malformed-input behavior (§6.3.3); the third-round findings (fabricated frontmatter-convention citation, undefined artifact distribution model, stale §10.3 cross-reference) are each resolved with a corrected citation (§6.3.1), an explicit distribution contract (§7.1a), and a corrected testing requirement (§10.3), respectively.

---

## 14. Consistency Check

- **Blueprint ↔ research alignment:** every quoted Blueprint section in this spec (§6, §18, §22–§26, §35) matches the verbatim quotes recorded in the research document §4. §25's full five-input list (metadata, API information, documentation, examples, human-authored guidance) is now explicitly addressed item-by-item (§5, §5.1) rather than three of five being implicit.
- **ADR ↔ research alignment:** ADR-011/ADR-012 ("Deferred to Phase 9") are the two ADRs this spec closes; both are satisfied by §6/§7 respectively.
- **Research ↔ specification alignment:** all 12 forks in research §8 are reflected in this spec (§3/Fork 1, §6.3/Fork 2, §7.1–7.2/Fork 3, §4/Fork 4, §4/Fork 5, §7.1/§7.5/Fork 6, §7.2/Fork 7, §7.6/Fork 8, §6.2/Fork 9, §11/Fork 10, §10.1/Fork 11, §12/Fork 12).
- **Specification ↔ actual repository reality:** every field name cited (`identity`, `api`, `accessibility`, `style`, `relationships`, `provenanceRef`, `guidance`, `aiSkillsVersionRange`) is a real, verified field in the current `packages/component-schema/src/*.ts` and `packages/cli/src/compatibility.ts` (research §3). The documentation-source claim in §5.1 was independently re-verified against the current tree during this correction pass (`apps/docs/.gitkeep`-only, zero `@description`/`@example` JSDoc tags repo-wide) rather than only cited from the prior research pass. §6.3.1's frontmatter format is now stated as this specification's own decision, not attributed to a repository convention that does not exist (re-verified: no `docs/superpowers/specs/*.md` file, including this one, uses YAML frontmatter). §7.1a's `dist/` gitignore claim and `@ultimate/mcp`'s `files: ["dist", "README.md"]` packaging pattern were both independently re-verified against the current `.gitignore` and `packages/mcp/package.json` during this correction pass.
- **Dependency graph consistency:** §4's dependency direction introduces no edge contradicting §6's Blueprint diagram or Phase 8 spec §5.2's already-established MCP↔CLI precedent.
- **No accidental Phase 10 leakage:** no security/performance/production-hardening content appears in this spec; those remain Phase 10's scope per Blueprint §35.
- **No implementation details presented as requirements:** §10's validation/testing requirements state _what_ must be checked, not _how_ the checking code is written; §6.3.1's frontmatter schema, §6.3.3's marker syntax, and §7.1's file paths are architectural data contracts (what a consumer/validator can rely on), not implementation code — the marker regex/parsing logic itself is left to the implementation plan, only the exact marker text and matching semantics are specified here.
- **No invented metadata/data:** no new `ComponentMetadata` schema field is introduced (§12); every data reference in §6/§7 traces to an existing, verified field (research §3, §5). The Skill frontmatter block (§6.3.1) and the generated-section markers (§6.3.3) are new contracts, but both belong to the Skill-file format Phase 9 itself owns (`skills/`), not to `@ultimate/component-schema` — neither reopens Phase 6.
- **No contradiction with closed Phase 6/7/8 architecture:** §2 explicitly states this spec extends, not modifies, all three; §11's `aiSkillsVersionRange` clarification now explicitly disclaims any schema/resolver change.
- **No consumer-chain dependency:** §4, §9 explicitly rule out any `@ultimate/ai`↔`@ultimate/cli`/`@ultimate/mcp` edge in either direction.
- **No LLM-based build-time prose generation or semantic validation:** §10.2 and §12 both now explicitly state validation never uses an LLM and never attempts semantic verification of prose.
- **All v1 capabilities backed by real data or explicitly defined new contracts:** §6.2's table and §5/§5.1's source list trace every Skill section to a real field, a real absence (documentation), or an explicit omission rule; §7.1's table traces every output file to metadata + Skills content, both real, at a fixed, unambiguous path.

---

## Formal Review Record

- **Status:** Draft for review.
- **Review scope:** Architecture and data-contract specification for Phase 9 — AI Skills and LLM Context. No implementation, implementation plan, package code, CI configuration, or commit was produced alongside this document, in either the original draft or this correction pass.
- **Assumptions:** two forks (package/content-directory split, §3/§8-Fork-1; project-aware-context v1 exclusion, §7.6/§8-Fork-8) rest on explicit user decisions made during this session's brainstorming process, recorded with rationale in the companion research document §8. All other decisions in this spec are directly traceable to Blueprint/ADR text or verified repository state.
- **Known risks:** the Blueprint's own §18/§22 diagrams read in two subtly different ways regarding whether LLM context derives from Skills or independently from Metadata (research §4/§6-B); this spec resolves the tension in its own text (§2, §7) without amending `BLUEPRINT.md`, following Phase 8's precedent for an analogous ambiguity. A future formal-review pass may choose to instead correct the Blueprint diagrams directly — not done here, as out of this document's scope.
- **Unresolved questions:** carried from the research document §11 — (1) whether to eventually amend `BLUEPRINT.md`'s diagrams rather than resolve the tension only in this spec's text; (2) whether PrimeVue or a comparable prior-art project ships a Skills/LLM-context-equivalent package worth reviewing before implementation planning (not researched in this pass); (3) the exact minimum per-record content bar for v1 Skill authoring (all 8 components vs. a subset) is left to the implementation plan to schedule, not an architectural decision this spec makes.
- **Statement:** Implementation and implementation planning are intentionally deferred. This document is an input to the next SKey gate — formal specification re-review.

### Correction pass — 2026-09-07 (in response to formal review REQUEST CHANGES)

The first formal review returned **REQUEST CHANGES** with seven findings (1 blocking, 3 major, 3 minor). All seven are addressed in this revision:

1. **BLOCKING — Documentation input missing from LLM context contract.** Repository re-checked directly (`apps/docs/` confirmed `.gitkeep`-only; zero `@description`/`@example` JSDoc tags across all component packages; package-level `README.md` files confirmed to exist but are not structured per-component documentation). Finding: no canonical structured per-component documentation source exists beyond `identity.description` and `skills/` content, both already in scope. New §5.1 makes this explicit, states the v1 decision (defer documentation ingestion, do not invent a docs system), and ties the deferral to GAP-004 (Storybook/docs-site tooling), which is the actual prerequisite gap. No documentation system was invented.
2. **MAJOR — Unimplementable factual-claim validation.** New §6.3.1 (structured YAML frontmatter: `component`, `metadataVersion`, `frameworks`) defines the exact, deterministic surface a validator checks. §6.3 now explicitly states hand-authored prose is never semantically validated, and §10.2 was rewritten to check only frontmatter claims and generated-section fidelity — both mechanically checkable, no LLM-based semantic validation introduced.
3. **MAJOR — `metadataVersion` contract underspecified.** New §6.3.2 defines location/representation (integer in frontmatter), matching rule (exact equality), mismatch behavior (hard validation failure, not a warning), multi-component handling (v1 Skills reference exactly one component, per §6.1's granularity), and update responsibility (the generator rewrites it on regeneration; the validator only detects drift, never auto-corrects).
4. **MAJOR — LLM-context artifact naming undefined.** §7.1 rewritten with an exact five-file table, all under the single deterministic path `packages/ai/dist/context/`: `llms.txt`, `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`. No alternative layout remains.
5. **MINOR — Granularity contradiction.** §3.2 rewritten to state the same one-file-per-component rule as §6.1, with no "logical grouping" alternative wording.
6. **MINOR — Agent-instruction convention ownership ambiguous.** §8 rewritten to name the exact file, `skills/AGENT_CONVENTIONS.md`, and explain why it belongs in the content artifact (`skills/`) rather than the code artifact (`packages/ai/`), per §3's own ownership split.
7. **MINOR — `aiSkillsVersionRange` ownership unclear.** §11 rewritten with a dedicated subsection stating the field is Phase-7-reserved (not Phase-9-introduced), that Phase 9 v1 neither populates nor reads it, that no manifest/resolver schema change is made, and that future population is a separate compatibility-policy decision — mirroring Phase 8 spec §6's identical treatment of `mcpVersionRange`.

**Post-correction consistency re-check performed (§13, §14 updated accordingly):** Blueprint §6 dependency direction intact (§4 unchanged); §18/§22 ambiguity resolution unchanged (§2, §7); §24 Skills requirements fully represented including the frontmatter mechanism now backing §24's "versioned and tied to compatible... versions" requirement; §25's full five-input list now addressed item-by-item (§5, §5.1); §26 agent-instruction requirement addressed at a named, located artifact (§8); Phase 6/7/8 contracts unchanged (§2, §11); `@ultimate/ai` remains a parallel sibling with no CLI/MCP/framework dependency edge (§4, §9, §10.1); no runtime source parsing anywhere; no LLM-based build-time prose generation or semantic validation (§10.2, §12, explicitly stated in both places post-correction); no project-aware context in v1 (§7.6); no invented `examples` schema field (§6.2, §12); no new shared knowledge package (§12); no Phase 10 content introduced by any of the seven corrections.

**Files changed in this correction pass:** only this specification document. No research document change, no implementation, no plan, no package/CI change, no commit.

### Correction pass 2 — 2026-09-07 (in response to formal review REQUEST CHANGES, generated-section boundary finding)

A second formal review returned **REQUEST CHANGES** with one remaining MAJOR finding: the generated-section boundaries inside Skill files (hybrid hand-authored + generated content, per §6.3) were not defined with a deterministic marker contract the generator and validator could actually implement. Addressed as follows:

- **New §6.3.3 (Generated-section boundary contract):** defines the exact marker syntax (`<!-- ultimate:generated:start section="..." -->` / `<!-- ultimate:generated:end section="..." -->`, single-line HTML comments, inert in rendered Markdown, matched by exact string/regex rather than Markdown structure parsing); the exact five v1 generated section keys and their fixed file order (`preferred-patterns`, `allowed-apis`, `anti-patterns`, `accessibility-guidance`, `related-components`); the ownership rule (everything between a marker pair is generator-owned and freely rewritten on regeneration; everything outside every marker pair, including the frontmatter and all prose narrative halves, is hand-authored and never touched); the complete malformed-marker table (missing/duplicate/unmatched/nested/malformed, each a hard validation failure with a specific error message, none a warning); generator behavior for first-generation (scaffolds the file, all five markers plus placeholder hand-authored sections) versus regeneration (rewrites only marked bytes plus `metadataVersion`, refuses to touch an already-malformed file rather than guessing); and the operational, byte-comparison definition of "generated-section fidelity" used by §10.2.
- **§6.3.2 updated:** added an explicit "Interaction with generated-section boundaries" bullet clarifying that `metadataVersion` and the markers are two parts of one freshness mechanism (version says "was this produced from current metadata," markers say "which bytes are that production"), always rewritten together by the generator, never independently.
- **§10.2 rewritten:** validation now runs frontmatter checks, then marker-structure checks (§6.3.3's malformed-marker table), then generated-section fidelity (byte-identical comparison per section) — in that explicit order, since fidelity is meaningless against malformed markers. Still no semantic prose validation, still no LLM-based checking, both facts restated explicitly.
- **§6.2 corrected for internal consistency:** the "If source absent" column previously said a Skill section is "omitted" when its backing field is unpopulated — this was in tension with §6.3.3's rule that all five generated marker pairs always exist (empty, not absent, when the backing field is unpopulated). The table and the honesty-rule paragraph immediately below it were both corrected to say "marker pair present, empty content," with `Examples` called out as the one true no-marker case (it has no generated section at all, unlike the other five which always get an empty-but-present pair). This is a genuine correction to a pre-existing sentence, not new scope — it was caught only because defining §6.3.3 forced the marker-count invariant to be stated precisely enough to expose the contradiction.
- **§13/§14 self-checks and this record updated** to reflect the above.

**Kept unchanged, as instructed:** one Skill per component (§6.1); exactly the 8 current components; hybrid hand-authored + generated model (§6.3, now more precisely bounded, not altered in kind); no new `ComponentMetadata` schema fields (§12); documentation ingestion still deferred under GAP-004 (§5.1, untouched); `examples` still omitted in v1 (§6.2, §6.3.3); `aiSkillsVersionRange` still untouched by Phase 9 (§11, untouched); project context still deferred (§7.6, untouched); no semantic prose validation (§10.2, §12, reinforced rather than changed).

**Files changed in this correction pass:** only this specification document. No research document change, no implementation, no implementation plan, no package/CI change, no commit.

### Correction pass 3 — 2026-09-07 (in response to formal review REQUEST CHANGES, third round)

A third formal review returned **REQUEST CHANGES** with three findings, all CONFIRMED: (1) a fabricated repository-convention citation, (2) an undefined artifact distribution/consumption contract, (3) a stale cross-reference. Addressed as follows:

1. **Fabricated repository-convention claim (§6.3.1).** The claim that YAML frontmatter "matches the convention already used by this repository's own `docs/superpowers/specs/*.md` and skill files" was removed. Independently re-verified: every spec document in this repository, including this one, uses a bold-label header block (`**Status:**`, `**References:**`), never YAML frontmatter; no repository Skill-file convention exists to cite. §6.3.1 now states the YAML frontmatter format is a **Phase 9 specification-defined contract**, with a substantive (not fabricated) reason for the choice — a widely-understood, unambiguous, machine-parseable format for a small flat declaration — rather than a false claim of prior art. The frontmatter design itself (fields, schema, matching rules) is unchanged.
2. **Undefined artifact distribution/consumption contract (§7.1/§8).** New §7.1a defines the model precisely: the five files (unchanged filenames) are build artifacts owned by `@ultimate/ai`; `@ultimate/ai`'s `package.json` must declare a `files` field including `dist/context` (mirroring `@ultimate/mcp`'s existing, re-verified `"files": ["dist", "README.md"]` pattern) so `npm publish` includes them; consuming projects obtain them exclusively through the installed `@ultimate/ai` package at `node_modules/@ultimate/ai/dist/context/*.txt` — never from this repository's own (gitignored, re-verified) `dist/` directory; this requires no committed `dist/` content in this repository, since `npm publish` packages local build output independent of `.gitignore`. §8's convention document is corrected to point at the installed-package path rather than the monorepo-internal `packages/ai/dist/context/` path it previously implied. §10.4 gained one new CI requirement: verify the `files` contract against a real `npm pack` output and, at least once, a real installed-consumer resolution — with the concrete script left to the implementation plan, matching how §10.1 already handles the boundary-gate script. No second distribution mechanism, runtime service, or CDN was introduced — this is the plain npm-package-artifact model the review specified.
3. **Stale §10.3 cross-reference.** "Section-omission behavior (§6.2's honesty rule)" was rewritten to state the actual v1 contract explicitly: the five generated marker pairs are always present; an unpopulated backing facet means empty content between an existing marker pair, never a missing one; `Examples` is the sole section with no marker pair at all, because it has no v1 data model, not because its content happens to be empty. The test description was expanded to name the two concrete cases (populated-facet / non-empty content; absent-facet / present-but-empty content) and to exclude `Examples` from the category explicitly, so no future reader can misread this requirement as license to test for a missing marker.

**Post-correction consistency re-check performed (§13, §14 updated accordingly):** all constraints the correction was scoped to preserve remain unchanged — one Skill per component, 8 current components, hybrid model, deterministic marker contract, byte-level fidelity, exact-integer `metadataVersion` equality, GAP-004-deferred documentation ingestion, omitted examples, untouched `aiSkillsVersionRange`, deferred project context, no new metadata fields, no semantic prose validation. No Phase 10 content, no consumer-chain dependency, no new distribution mechanism beyond ordinary npm packaging was introduced by any of the three fixes.

**Files changed in this correction pass:** only this specification document. No research document change, no implementation, no implementation plan, no package/CI change, no commit.
