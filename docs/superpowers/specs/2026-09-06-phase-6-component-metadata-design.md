# Phase 6 — Component Metadata Specification

**Status:** Approved — implemented; `docs/architecture/ROADMAP.md` marks Phase 6 (Component Metadata) Complete (see its footnote 2).
**References:** `docs/architecture/BLUEPRINT.md` §17/§18/§34/§259, `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md` GAP-027, `docs/architecture/COMPONENT_INVENTORY.md`, `docs/architecture/provenance/{ng,react,vue,uix-styles}.json`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

**No architectural fork was encountered while preparing this spec.** Every design decision below either restates an already-approved Blueprint conclusion (§17/§18) or resolves an ordinary schema-detail question directly from real repository evidence gathered during the preceding research/reconciliation pass. Where evidence was insufficient to justify a field, that field is marked deferred rather than invented.

---

## 1. Status / Purpose / Scope

**Purpose:** Define the implementation-ready v1 schema and package responsibilities for Ultimate's component metadata system — the first-class, versioned platform artifact Blueprint §18 places upstream of Docs, Storybook, MCP, and AI Skills/LLM context.

**Scope:** The metadata *schema* and its *conceptual population* against the real, already-built proof set (Button, Checkbox, Dialog, Menu, Tooltip, Paginator, Scroller, Table — all three frameworks). This spec defines the contract; it does not author complete metadata for all ~115 inventoried components, generate any tooling, or build `packages/component-schema`/`packages/component-metadata`.

**Out of scope for this spec (explicitly, per the source directive):**
- Any Phase 7 (CLI), Phase 8 (MCP), or Phase 9 (AI Skills/LLM context) contract detail — those phases have no committed spec, and designing against their needs now would be speculative coupling.
- A runtime component wrapper, runtime registry, or universal cross-framework component API. This system is declarative and build-time only.
- Reopening or duplicating the existing provenance schema (`docs/architecture/provenance/*.json`) — component metadata references it, never replaces it.
- Full documentation/Storybook/example authoring — Phase 6's objective is metadata, not content generation.
- Migrating `COMPONENT_INVENTORY.md`'s full ~115-component backlog into the new schema.

---

## 2. Architectural Baseline

This spec inherits, without modification:

- **Phases 0–5**, `@ultimate/uix-data`, `UPaginator`, `UScroller`, the Scroller content-template extension, and `UTable` — all closed (`UTable` closed at `ede4174`). Not reopened by this spec.
- **Blueprint §17's candidate field list** — treated as a superset to select from, not a v1 mandate. GAP-027 itself frames the remaining decisions as "schema-detail-level, not fork-level."
- **The existing provenance convention** (`originalPath`/`ultimateDestination`/`modificationStatus`/`modificationDescription`, per-framework flat JSON arrays) — unchanged, unduplicated. Component metadata carries a *reference* into this system (§10), never a copy of its fields.
- **`COMPONENT_INVENTORY.md`'s 11-column table** — the existing, real, human-authored prior art GAP-027 names as a "strong head start." This spec's schema is designed to be capable of representing the same facts that table already captures, in machine-readable, versioned form — not to replace or redesign that table's own content.

This spec resolves, from the preceding research/reconciliation pass's direct source verification (not a new broad research pass):

- The genuine convergence/divergence boundary between prop declarations (converge in name/semantics, diverge in mechanism) and event wiring (converge in concept, diverge completely in wire-level naming) — confirmed directly against Button and Table source in all three frameworks.
- The absence of any version field in every existing schema in the repository (provenance JSON has none), despite Blueprint §17's explicit versioning mandate — this spec closes that gap for the new schema; it does not retrofit provenance JSON (out of scope, separate system).

---

## 3. Component Metadata Responsibilities

Per Blueprint §259 (Metadata Packages responsibilities) and §17/§18, confirmed against real repository evidence:

- Describe a component's **identity** (name, category, framework availability, package ownership) as a single, versioned, machine-readable record per component.
- Describe each framework implementation's **public API** (props/inputs, events/outputs) as *authoritative facts extracted from real source*, never invented or normalized away from the real per-framework mechanism.
- Describe **accessibility facts actually present in source** (role, aria-* attributes genuinely implemented) — not a target/aspirational taxonomy.
- Describe **style/theme identity** at the one point of genuine cross-framework convergence already proven (`componentName`).
- Describe coarse **relationships/dependencies** between components (e.g., Table depends on Paginator and Scroller), reusing `COMPONENT_INVENTORY.md`'s existing judgment rather than re-deriving it.
- Carry a **reference** to the component's provenance entries, not a duplicate of provenance data.
- Separate **generated facts** from **human-authored guidance** (Blueprint §18) as two distinct, independently-populated parts of the same record — never merged into one undifferentiated blob.

Component metadata is explicitly **not** responsible for: runtime component behavior, a universal cross-framework API, documentation prose/examples/Storybook content, or any Phase 7/8/9-specific query shape.

---

## 4. Public API by Package

### `@ultimate/component-schema`

Responsibility: the schema definition itself — TypeScript types (or equivalent declarative shape) plus a validator. Ships:

- `ComponentMetadata` type (the canonical shape, §6).
- `SCHEMA_VERSION` constant (§7).
- A validation function (or exported JSON Schema) capable of checking a candidate metadata record against the shape and the rules in §13.

No component-specific data lives here. This package is pure contract.

### `@ultimate/component-metadata`

Responsibility: the actual populated metadata records — one `ComponentMetadata` record per component, per the schema `@ultimate/component-schema` defines. Consumes `@ultimate/component-schema` as its only structural dependency. Ships no runtime component logic, no framework imports beyond what's needed to author/validate the data (build-time tooling only, never a runtime dependency of `packages/{ng,react,vue}`).

This mirrors Blueprint §34's already-named package split (`@ultimate/component-schema`, `@ultimate/component-metadata`) — no new package is introduced, none is deemed necessary by this spec.

---

## 5. Versioning Model

Blueprint §17 explicitly requires: "Metadata must be versioned. The schema itself must have an explicit version." No existing schema in the repository satisfies this (provenance JSON has neither field) — this is a real, evidence-confirmed gap this spec closes for the new schema, not something inherited from provenance.

**Two distinct version numbers, kept separate:**

1. **`schemaVersion`** (on the schema itself, exported as `SCHEMA_VERSION` from `@ultimate/component-schema`) — a single semver-shaped string describing the *shape* of `ComponentMetadata`. Bumped only when the schema's structure changes.
2. **`metadataVersion`** (a field *inside* each `ComponentMetadata` record) — see below for its precise, implementation-ready semantics.

### 5.1 `metadataVersion` — precise semantics

**What it versions.** `metadataVersion` versions exactly one thing: **the content of a single component's `ComponentMetadata` record as a whole** — identity, per-framework API facts, accessibility facts, style block, relationships, provenance reference, and guidance block, all together, as one unit. It does not version the schema (that's `schemaVersion`'s job, §5), and it does not track separate sub-versions for individual blocks within the record (see point 5 below).

**Format.** A single monotonically-increasing non-negative integer, starting at `1` for a component's first authored record (e.g. `metadataVersion: 1`, `2`, `3`, ...). Not a semver string — there is no meaningful "major/minor/patch" distinction at the level of one component's data (that distinction belongs to `schemaVersion`, which does track shape-compatibility tiers). A plain integer is the smallest format that satisfies Blueprint §17's versioning requirement without introducing a second semver system.

**What causes it to change.** `metadataVersion` is incremented by exactly `1` whenever a component's record is regenerated or re-authored with any change to its content — a prop added/removed/corrected, an event's `payloadDescription` updated, an accessibility fact added, a `guidance.usageNotes` edit, a corrected `relationships.dependsOn` entry, anything.

**What does NOT cause it to change.** Re-running a generator/validator that produces byte-identical output does not bump `metadataVersion` — only an actual content change does. A `schemaVersion` bump alone (the shape changing, with this component's data migrated to fit but its actual facts unchanged) also does not, by itself, require a `metadataVersion` bump — though in practice a schema migration usually does touch content and would bump it as a side effect of that content change, not of the schema change itself.

**Generated facts and human-authored guidance share one version, not two.** A single `metadataVersion` covers the whole record, including both the generated-fact blocks (§9) and the human-authored guidance block (§6.7/§9). This spec deliberately does not introduce a second, independent version counter for guidance content — doing so would be a second versioning system, which §5's own constraint (minimal, no multiple independent version systems) rules out. A consumer that needs to know guidance content changed independently of facts can diff the record's guidance block directly; that is a consumer-side concern (out of scope, §11), not something the version field itself needs to distinguish.

**Equality vs. ordering.** Consumers should treat `metadataVersion` as **orderable, not merely comparable-for-equality** — a strictly increasing integer supports "is this the newest record I've seen for this component" logic (relevant to a future Phase 7/8 consumer caching or diffing records), not just "has anything changed." This is a natural consequence of the plain-integer format and requires no additional field.

**Relationship to the component's implementation/package version.** None, by design. `metadataVersion` tracks the metadata record's own revision history, not `@ultimate/ng`/`@ultimate/react`/`@ultimate/vue`'s package version, not the component's own semver, and not the Prime baseline version cited in provenance. A component's real implementation can ship a new package version with zero metadata change (metadataVersion unchanged), and a metadata-only correction (e.g., fixing a typo'd `description`) can bump `metadataVersion` with zero corresponding package release. These are independent axes; conflating them would be introducing exactly the "relationship to package-release versioning" this spec's own constraints rule out.

**Compatibility expectations (schema-level, unchanged from the prior draft):**

- A **schema-breaking change** is any change that removes a required field, changes a field's type incompatibly, or changes the meaning of an existing field. This requires a `schemaVersion` major bump (semver-style) and every existing `ComponentMetadata` record must be re-validated (and, where necessary, migrated) before it's considered valid again.
- A **metadata-only change** is adding, correcting, or refreshing a component's data without altering the schema shape — this bumps only that record's `metadataVersion`, never `schemaVersion`.
- Consumers (a future Phase 8 MCP reader, a future Phase 7 CLI generator) are expected to check `schemaVersion` compatibility before trusting a record's shape; this spec does not design that consumer-side check itself (Phase 7/8 are out of scope), only ensures the field exists for them to use.

This is intentionally the smallest versioning model that satisfies Blueprint §17's literal requirement — no package-release/publish versioning system, no migration-tooling design, no semver-range compatibility matrix, no second independent version counter for guidance, is introduced here (none is justified by current evidence).

---

## 6. Canonical Metadata Model (v1)

The `ComponentMetadata` shape, by block. Each block below states its v1 classification explicitly.

### 6.1 Identity block — **Required in v1**

```text
name: string                          // e.g. "Table"
category: string                      // e.g. "Data", "Primitive", "Overlay" — reuses COMPONENT_INVENTORY.md's existing category vocabulary
description: string                   // short, human-authored — see §6.1a for exact responsibility vs. guidance.*
schemaVersion: string                 // see §5
metadataVersion: number                // see §5.1 — a plain monotonically-increasing integer, not semver
packages: {
  ng?: { packageName: string; sourcePath: string }
  react?: { packageName: string; sourcePath: string }
  vue?: { packageName: string; sourcePath: string }
}
```

`packages` being a partial record (not all three frameworks required) directly represents genuine framework availability — Blueprint §17's "framework availability" field — without assuming every component ships in every framework.

### 6.1a `description` vs. `guidance.*` vs. `accessibility.guidance` — semantic boundary

Four human-authored prose fields exist across the schema (`description`, `accessibility.guidance`, `guidance.usageNotes`, `guidance.antiPatterns`/`guidance.migrationNotes`). Each has one, non-overlapping responsibility. An implementer populating a record must be able to answer "which field does this sentence belong in" without ambiguity — the test in each entry below is the practical disambiguator.

- **`description`** (identity block, §6.1) — **what the component is.** A short, single-paragraph, definitional statement of the component's identity and purpose — the kind of sentence that would appear as the opening line of the component's own documentation page or a catalog listing. It answers "what is this" once, at the record's top level, and nothing else reads it as authoritative for behavior. *Test: if the sentence would still be true even if the component's props/behavior changed significantly (e.g. "Table renders tabular data with sorting, filtering, and selection"), it belongs here. If the sentence depends on a specific prop, event, or usage pattern, it does not belong here.*
- **`accessibility.guidance`** (§6.3) — **accessibility-specific caveats not expressible as a verified fact.** Scoped narrowly to accessibility behavior that `verifiedRoles`/`verifiedAriaAttributes` can't capture as a flat list — e.g., a limitation like "keyboard navigation only operates within the currently-rendered virtualized window, not the full logical dataset" (a real, already-documented Table limitation from the just-closed milestone). *Test: if the sentence is about accessibility/keyboard/screen-reader behavior specifically, and isn't a bare role/attribute name, it belongs here — nowhere else.*
- **`guidance.usageNotes`** (§6.7) — **how/when to use the component correctly**, general-purpose (not accessibility-specific). E.g., "prefer `virtualScrollerOptions` over `paginator` for datasets over ~500 rows." *Test: general usage advice, not an identity statement and not accessibility-specific.*
- **`guidance.antiPatterns`** (§6.7) — **known misuse to avoid**, stated as a discrete list of specific don'ts, not prose. E.g., "do not mutate `selection` directly in Vue; always emit through `update:selection`." *Test: a specific, nameable mistake — if it can't be phrased as "don't do X," it belongs in `usageNotes` instead.*
- **`guidance.migrationNotes`** (§6.7) — **upgrade/compatibility guidance tied to a version change** (either `metadataVersion` or the component's own real package version, distinctly — see §5.1's "relationship to package version"), e.g., "as of package v2.0, `editingRowKeys` replaced the deprecated `editingKeys` prop name." *Test: the sentence only makes sense in the context of "this changed between versions" — if it's evergreen advice with no version dimension, it belongs in `usageNotes` instead.*

**Why `description` sits at the identity-block level while the rest sit under `guidance`/`accessibility`:** `description` is not optional and not "guidance" in Blueprint §18's sense — it is a required, load-bearing identity fact every record must have (the same way `name`/`category` are required), read first by any consumer (a catalog listing, a search index) before anything else in the record is even inspected. The `guidance.*` fields, by contrast, are all optional in v1 (§6.7) precisely because they represent deeper, situational advice that not every component has authored yet — they supplement the identity established by `description`, never restate it. An implementer must never copy the same sentence into both `description` and `guidance.usageNotes`: if a sentence is true regardless of how the component is used, it belongs only in `description`; if it depends on a usage decision, prop combination, or version boundary, it belongs only in the relevant `guidance.*`/`accessibility.guidance` field, never duplicated back into `description`.

### 6.2 Per-framework API block — **Required in v1**

One sibling sub-record per framework the component ships in (`packages.ng`/`react`/`vue` presence gates which sub-records exist):

```text
api: {
  ng?:    { props: PropFact[]; events: EventFact[] }
  react?: { props: PropFact[]; events: EventFact[] }
  vue?:   { props: PropFact[]; events: EventFact[] }
}

PropFact: {
  name: string           // the real, framework-native prop/input name — never normalized across frameworks
  type: string            // a description of the type (string form is sufficient for v1 — see §13, not a full type-AST)
  default?: string        // stringified default, if any
  required: boolean
  description?: string    // human-authored, optional
}

EventFact: {
  semanticId: string       // a shared, cross-framework label for "this is the same underlying state-change concept" — e.g. "sort-changed" — NOT a claim that the wire name is shared
  frameworkName: string    // the real, framework-native event/output/callback name — e.g. ng: "sortFieldChange", react: "onSort", vue: "sort"
  mechanism: "output" | "callback-prop" | "emit"   // records which of the three real, already-proven-divergent wiring mechanisms this is — never unified
  payloadDescription?: string
}
```

This directly encodes the research's central, hardest-won finding: props converge on name+semantics and can be recorded once conceptually per framework without inventing a shared name; events converge only on `semanticId` (the underlying concept), never on `frameworkName` or `mechanism` — each framework's real event API is recorded as-is, side-by-side, never collapsed into one canonical event name.

### 6.3 Accessibility block — **Required in v1, minimal**

```text
accessibility?: {
  verifiedRoles?: string[]         // e.g. ["row", "columnheader"] — only roles confirmed present in real source
  verifiedAriaAttributes?: string[] // e.g. ["aria-sort", "aria-selected"] — only attributes confirmed present in real source
  guidance?: string                 // human-authored, optional — e.g. "keyboard nav is windowed under virtualization"
}
```

`verifiedRoles`/`verifiedAriaAttributes` are **generated facts** (§9) — populated only from what real source actually implements (e.g., Table's real `role="row"`/`aria-sort`/`aria-selected`, confirmed during the just-closed milestone). `guidance` is the one **human-authored** field in this block. No aspirational accessibility taxonomy (e.g., a full WAI-ARIA pattern registry) is introduced.

### 6.4 Style/theme block — **Required in v1, minimal**

```text
style?: {
  componentName: string        // the real, already-proven-identical field across all 3 base-component layers
  styleModuleRef?: string       // e.g. "@ultimate/uix-styles/table" — a pointer, not a copy of the CSS/token content
}
```

This is the one field the research confirmed as genuinely, strongly convergent (byte-identical concept across Angular's `UBaseComponent`, React's `useComponentBase`, Vue's `createBaseComponent`) — the schema captures exactly that fact and nothing more. No new styling abstraction, no duplication of `uix-styles`' own token/CSS content.

### 6.5 Relationships block — **Required in v1, coarse only**

```text
relationships?: {
  dependsOn?: string[]   // component names, e.g. Table → ["Paginator", "Scroller"]
}
```

Directly reuses `COMPONENT_INVENTORY.md`'s existing "Dependencies" column judgment — this spec does not re-derive dependency information, only gives it a machine-readable home.

### 6.6 Provenance reference block — **Required in v1**

```text
provenanceRef?: {
  package: "ng" | "react" | "vue" | "uix-styles"
  // Path(s) into the existing docs/architecture/provenance/<package>.json array —
  // a pointer (e.g. matching ultimateDestination values), not a duplicate of
  // originalPath/modificationStatus/modificationDescription.
  ultimateDestinations: string[]
}
```

This is the explicit mechanism preserving "component metadata ≠ provenance": a reference by path into the existing, already-shipped provenance JSON, never a second copy of its fields.

### 6.7 Human-authored guidance block — **Optional in v1**

```text
guidance?: {
  usageNotes?: string
  antiPatterns?: string[]
  migrationNotes?: string
}
```

Explicitly separated from every generated-fact block above, per Blueprint §18's own required distinction. Optional in v1 because no component currently has authored guidance content to populate it with — the field exists so the shape is stable when content is added later, but v1 does not require every component to populate it.

### 6.8 Fields NOT in v1 (see §7 for full deferral list)

Slots/templates, variants, states, examples, and any CLI/MCP/AI-specific sub-shape are not part of the v1 `ComponentMetadata` shape at all — not present as optional fields, not stubbed. Adding them later is a schema-version-bump event (§5), not a silent extension.

---

## 7. V1 Classification Table

Per-category classification, restated precisely (required in v1 / optional in v1 / framework-specific extension / deferred / out of scope):

| Category | Classification |
|---|---|
| Component identity (name, category, description) | **Required in v1** |
| Package/framework ownership, framework availability | **Required in v1** |
| Schema version, metadata version | **Required in v1** |
| Props/inputs (per-framework facts: name, type, default, required, description) | **Required in v1** — framework-native representation (§6.2), not a unified prop model |
| Events/outputs (semantic id + per-framework name + mechanism + payload) | **Required in v1** — framework-native representation (§6.2), semantic id is the only shared field |
| Accessibility (verified roles/aria-attributes + optional guidance) | **Required in v1, minimal** — no taxonomy |
| Style/theme identity (`componentName` + style module pointer) | **Required in v1, minimal** |
| Relationships/dependencies (coarse, component-name list) | **Required in v1, coarse only** |
| Provenance reference (pointer into existing provenance JSON) | **Required in v1** |
| Human-authored guidance (usage notes, anti-patterns, migration notes) | **Optional in v1** — shape exists, content not required |
| Slots/templates | **Deferred** — insufficient cross-framework data points (only Table has real composition evidence) |
| Variants/states formal taxonomy | **Deferred** — no formal taxonomy exists anywhere in the repo yet beyond ad hoc prop values |
| Documentation content / examples / Storybook stories | **Deferred** — Phase 8/9-downstream, no committed spec to design against |
| CLI generation/query shape | **Deferred** — Phase 7 has no committed spec |
| MCP exposure shape | **Deferred** — Phase 8 has no committed spec |
| AI/LLM context shape | **Deferred** — Phase 9 has no committed spec |
| Full migration-system metadata | **Deferred** — `migrationNotes` exists as a free-text optional field only; no structured migration-classification schema (`COMPONENT_INVENTORY.md`'s own "Migration classification"/"Migration phase" columns are NOT re-modeled here — out of scope, that table remains the source of truth for planning-level migration tracking) |
| Runtime component wrapper/registry | **Out of scope** — this system is declarative/build-time only, never a runtime dependency of `packages/{ng,react,vue}` |
| Universal cross-framework event name | **Out of scope** — `frameworkName`/`mechanism` in §6.2 are recorded per-framework precisely because no universal name exists in real source |
| Universal framework API abstraction | **Out of scope** — explicitly excluded per this run's own constraints and unsupported by convergence evidence |

---

## 8. Framework-Native API Preservation

This spec makes no change to, and imposes no new constraint on, any framework's actual component implementation:

- Angular's `input()`/`output()` signal factories remain exactly as implemented; `PropFact`/`EventFact` records *describe* them, they do not wrap, re-export, or replace them.
- React's TS interface props and `onX` callback props remain exactly as implemented.
- Vue's `props: {type, default}` objects and `emits: [...]` arrays remain exactly as implemented.
- No metadata-consuming tool introduced by this spec (there are none — Phase 7/8/9 are out of scope) reads metadata *instead of* the real component at runtime; metadata is authored/generated from real source as a separate, parallel artifact.

---

## 9. Generated Facts vs. Human-Authored Guidance

Per Blueprint §18's explicit two-part model, restated precisely for this schema:

**Generated / authoritative facts** (populated from real source, never hand-invented): `api.*` (props, events), `accessibility.verifiedRoles`/`verifiedAriaAttributes`, `style.componentName`, `relationships.dependsOn` (derived from real import graphs or `COMPONENT_INVENTORY.md`'s existing judgment, not invented), `provenanceRef` (a direct pointer into existing provenance JSON).

**Human-authored guidance** (a person's judgment, not derivable from source alone): `description` (identity block), `accessibility.guidance`, `guidance.*` (usage notes, anti-patterns, migration notes).

These live in clearly separate blocks of the same `ComponentMetadata` record (§6), never merged into one undifferentiated text blob — an implementer or downstream consumer can always tell which fields are machine-checkable facts and which are human judgment.

---

## 10. Provenance Boundary

Explicit, restated: `docs/architecture/provenance/{ng,react,vue,uix-styles}.json` remains the sole owner of file-level source lineage (`originalPath`, `ultimateDestination`, `modificationStatus`, `modificationDescription`). Component metadata's `provenanceRef` block (§6.6) references into that existing system by `ultimateDestination` path — it never duplicates `originalPath`/`modificationStatus`/`modificationDescription` fields, and provenance JSON is not modified by this spec or by any future Phase 6 implementation.

---

## 11. Downstream Consumer Boundary

Blueprint §18 places Docs, Storybook, MCP, and Skills/LLM-context downstream of metadata. This spec:

- Confirms the `ComponentMetadata` shape (§6) is *structurally* sufficient to be a useful, authoritative source for those future consumers (identity, per-framework API, accessibility, style, relationships, provenance reference — everything a docs generator or an MCP query layer would need to start from).
- Does **not** define any Phase 7 (CLI generation), Phase 8 (MCP query/exposure), or Phase 9 (AI Skills/LLM context) consumer-specific contract, format, or query shape — none of those phases has a committed spec yet, and designing against unwritten requirements would be speculative coupling this spec explicitly avoids.

---

## 12. Ground Truth: Proof Set Validation (Conceptual)

This schema is validated conceptually (not by authoring full records) against the real, closed proof set: Button, Checkbox, Dialog, Menu, Tooltip, Paginator, Scroller, Table — across Angular, React, Vue.

- **Button** (simplest case): `packages.{ng,react,vue}` all present; `api.ng.props` includes `loading`/`disabled`/`raised`/`rounded`/`text`/`outlined` as real Angular `input()`s; `api.react.props` includes the same names from the real `UButtonProps` interface; `api.vue.props` includes the same names from the real `props: {}` object — same names, same semantics, three different `PropFact` sibling lists, exactly as §6.2 models it. No custom events (native click passthrough only) — `api.*.events` is empty for Button in all three, which the schema permits (`events: EventFact[]` may be `[]`).
- **Table** (richest case): `api.ng.events` includes a `PropFact`-sibling `EventFact` with `semanticId: "sort-changed"`, `frameworkName: "sortFieldChange"`, `mechanism: "output"`; `api.react.events` includes the same `semanticId: "sort-changed"` with `frameworkName: "onSort"`, `mechanism: "callback-prop"`; `api.vue.events` includes the same `semanticId: "sort-changed"` with `frameworkName: "sort"`, `mechanism: "emit"`. This is the schema's central test case, and it passes: the real, already-verified divergence (§6.2) is represented exactly as it exists, with no forced unification.
- **Paginator/Scroller**: `relationships.dependsOn` on Table's own record would read `["Paginator", "Scroller"]`, directly matching `COMPONENT_INVENTORY.md`'s existing "Dependencies" column judgment for Table — confirming §6.5's coarse relationships block needs no new derivation logic beyond what already exists in prose form.
- **Style block**: every one of the eight components' real base-component layer already exposes an identical `componentName`+`styleModule` pair (confirmed directly for Button and Table during research; Checkbox/Dialog/Menu/Tooltip/Paginator/Scroller follow the same `UBaseComponent`/`useComponentBase`/`createBaseComponent` convention established once and reused, per each framework's own foundation-phase closure) — `style.componentName` is populatable for all eight with zero schema strain.

The schema represents the real proof set without forcing artificial convergence anywhere it doesn't exist in source.

---

## 13. Validation Requirements

An eventual Phase 6 implementation's validator (living in `@ultimate/component-schema`, per §4) must check:

- **Schema validity**: a candidate record matches the `ComponentMetadata` TypeScript shape (or equivalent JSON Schema) — required fields present, types correct.
- **Version validity**: `schemaVersion` on the record is a version this validator's own compiled-in `SCHEMA_VERSION` recognizes as compatible (exact-match in v1 — no compatibility-range logic is introduced, matching §5's minimal versioning model); `metadataVersion` is present and is a non-negative integer (per §5.1's format), never a string, never `0` for anything but a genuinely never-yet-authored placeholder state (real records start at `1`).
- **Framework mapping validity**: every key present in `api` (`ng`/`react`/`vue`) has a corresponding entry in `packages` (a record can't claim an API for a framework it doesn't ship in, and vice versa isn't required — a component may ship in a framework with as-yet-unpopulated `api` facts, which is a metadata-completeness concern, not a structural validity failure).
- **Event mapping consistency**: within a single component record, every `semanticId` that appears in more than one framework's `events` list is checked for presence, not for a shared `frameworkName` (a shared `frameworkName` across frameworks would in fact be suspicious given the confirmed divergence, and is not itself an error, but the validator's job is only to confirm the `semanticId`/`frameworkName`/`mechanism` triple is well-formed per framework — not to enforce any cross-framework naming rule that doesn't exist).
- **Provenance reference validity**: `provenanceRef.ultimateDestinations` paths genuinely exist as `ultimateDestination` values in the referenced package's real `docs/architecture/provenance/<package>.json` file (a broken pointer is a validation failure).
- **Duplicate component identity**: no two records in `@ultimate/component-metadata` share the same `name` (case-sensitive exact match, matching how `COMPONENT_INVENTORY.md` already treats component names as unique keys).
- **Invalid relationship references**: every string in `relationships.dependsOn` must correspond to a `name` of some other real record in `@ultimate/component-metadata` (a dangling dependency reference is a validation failure).
- **Malformed metadata**: standard structural checks (no extra unrecognized top-level fields in v1 — strict-mode validation, so a future schema-version bump is a deliberate, visible act, not something that silently degrades into "the validator just ignored an extra field").

This list is scoped to what the v1 schema itself can meaningfully check — it does not design a full CI pipeline, a lint-rule severity model, or any Phase 7/8/9-specific validation (out of scope, per §11).

---

## 14. Explicit Non-Goals / Deferrals

Restated as a single consolidated list (cross-referenced against §7's table, not a new decision):

- Rich slot/template normalization — deferred, insufficient cross-framework data.
- Formal variant/state taxonomy — deferred, no existing taxonomy anywhere in the repo.
- Complete migration-classification system — deferred; only a free-text `guidance.migrationNotes` field exists in v1, `COMPONENT_INVENTORY.md`'s own migration columns remain the planning-level source of truth, un-re-modeled.
- Full AI guidance system — deferred, Phase 9 unstarted.
- MCP-specific metadata contracts — deferred, Phase 8 unstarted.
- CLI-specific generation/query contracts — deferred, Phase 7 unstarted.
- Runtime metadata registry — out of scope, this system is declarative/build-time only.
- Universal event naming — out of scope, contradicted directly by real source evidence (§6.2, §12).
- Universal framework API abstraction — out of scope, contradicted directly by real source evidence.

None of these are Blueprint §17-mandated-for-Phase-6 items being incorrectly deferred — every category Blueprint §17 lists as a candidate is either addressed at v1-minimal scope (§6/§7) or is genuinely downstream-phase territory per Blueprint §18's own architecture diagram.

---

## 15. Specification Quality Gate (self-check, per the gate's own required questions)

1. Can an implementation team implement Phase 6 without making fundamental schema decisions? **Yes** — §6 defines the concrete shape; remaining implementation work is populating records and writing the validator, not re-deciding structure.
2. Does the schema remain minimal? **Yes** — §7's table shows every Blueprint §17 candidate field is either scoped to a minimal required shape or explicitly deferred; no field was added merely because it's conceptually useful.
3. Does it preserve Angular/React/Vue framework-native APIs? **Yes** — §8, confirmed by construction (metadata describes, never wraps or replaces).
4. Does it distinguish metadata from provenance? **Yes** — §10, `provenanceRef` is a pointer, never a duplicate.
5. Does it explicitly version both schema and metadata? **Yes** — §5, two distinct fields with distinct bump rules.
6. Does it preserve generated facts vs. human-authored guidance? **Yes** — §9, distinct blocks within the same record.
7. Does it avoid premature Phase 7/8/9 coupling? **Yes** — §11/§14, explicitly deferred, no consumer-specific shape designed.
8. Can it represent the existing proof set? **Yes** — §12, validated conceptually against all eight components across all three frameworks, including the hardest case (Table's event divergence).
9. Are all deferred areas explicitly identified? **Yes** — §7 and §14.
10. Did the specification introduce any new architectural fork? **No.**

---

## 16. Consistency Check

- **Phases 0–5, `uix-data`, Paginator, Scroller, UTable**: unchanged, not reopened. This spec makes zero claim on their implementation.
- **Blueprint §17/§18/§259**: not contradicted — every requirement (versioning, generated-vs-guidance separation, candidate field superset, cross-consumer upstream role) is either satisfied at v1-minimal scope or explicitly and justifiably deferred, never silently dropped.
- **GAP-027**: this spec is the concrete resolution direction GAP-027 called for ("design the schema against the real, already-built 5×3 proof set as ground truth") — not changed by this spec itself; a future implementation-plan or implementation-time action updates GAP-027's status, per the same convention used for GAP-014 during the Table milestone.
- **`docs/architecture/provenance/*.json`**: unchanged, referenced only.
- **`COMPONENT_INVENTORY.md`**: unchanged, reused as the source of truth for category/dependency judgments this spec's schema gives a machine-readable home to.

No code was written or modified. Only this specification document was created.
