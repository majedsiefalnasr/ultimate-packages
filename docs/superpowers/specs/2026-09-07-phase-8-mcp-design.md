# Phase 8 — MCP Specification

**Status:** Approved (formal Spec Review passed — §13)
**References:** `docs/architecture/BLUEPRINT.md` §5/§6/§18/§22/§23/§34/§35/§40, `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md` GAP-029, `docs/architecture/DECISIONS.md` ADR-010, `docs/architecture/AI_ARCHITECTURE.md`, `docs/architecture/research/2026-09-07-phase-8-mcp-architecture.md`, `packages/component-schema`, `packages/component-metadata`, `packages/cli` (real, closed Phase 7)

**This is a specification, not an implementation plan.** No code, package.json files, or MCP server behavior is created as a result of this document.

**No architectural fork required escalation while preparing this spec.** Every design decision below either restates an already-approved Blueprint conclusion (§5/§6/§18/§22/§23, ADR-010) or resolves an ordinary scoping question directly from the preceding research pass's evidence (`docs/architecture/research/2026-09-07-phase-8-mcp-architecture.md`, §7). Where evidence was insufficient to justify a v1 tool or capability, it is marked deferred rather than invented.

---

## 1. Status / Purpose / Scope

**Purpose:** Define the implementation-ready v1 responsibilities, tool surface, transport, and package structure for `@ultimate/mcp` — the MCP server Blueprint §23 places as a leaf consumer of platform metadata (§6's dependency direction), parallel to (never upstream or downstream of) `@ultimate/cli`.

**Scope:** The MCP server's v1 tool surface, its transport/invocation model, its use of `@ultimate/component-metadata` (real, closed since Phase 6), its relationship to `@ultimate/cli` (parallel siblings, no dependency either direction), and the package structure needed to ship it consistently with every other real Ultimate package. This spec defines the contract and boundary; it does not implement `packages/mcp`, does not write MCP tool handler code, and does not populate the reserved `mcpVersionRange` axis on `@ultimate/cli`'s compatibility manifest.

**Out of scope for this spec (explicitly, per the source directive):**
- Any Phase 9 (AI Skills/LLM context) contract detail — Skills authoring, `llms.txt`/`llms-full.txt` generation, agent-instruction-file conventions, and the AI Context Layers taxonomy (Blueprint §26) all remain entirely Phase 9's, undesigned here.
- Inventing an AI abstraction layer, a model-provider integration, or any LLM-calling code — `@ultimate/mcp` is a protocol server exposing data/tools; it does not itself call any LLM.
- Expanding `@ultimate/component-metadata`'s proof set (still exactly 8 components) or `@ultimate/component-schema`'s schema shape (no new fields) merely to give MCP more to expose.
- Introducing a runtime dependency from `@ultimate/{ng,react,vue}` on MCP, in either direction — prohibited by Blueprint §6 and not reconsidered here.
- Introducing a dependency edge from `@ultimate/mcp` onto `@ultimate/cli` (or vice versa) — resolved as prohibited by this spec (§5.2), not merely deferred.
- Populating the reserved `mcpVersionRange` axis on `@ultimate/cli`'s `compatibility-manifest.json`, or extending `matchCompatibility()` to read it — that is a `@ultimate/cli`-side change, out of this package's boundary.
- Any code, `package.json`, build config, or test file under `packages/mcp/`.
- HTTP/remote-hosted transport support — v1 is stdio-only (§5.1); a future remote deployment model is not designed here.

---

## 2. Architectural Baseline

This spec inherits, without modification:

- **ADR-010** — MCP must remain optional and must never be a runtime dependency. Not reopened; §5.1's stdio/opt-in-invocation model makes this concrete.
- **Blueprint §6's dependency direction** — `Component Source + Component Metadata + Documentation → CLI / MCP / AI / Skills / LLM outputs`, with the reverse (`Ultimate Components → CLI → MCP → AI`) explicitly prohibited. `@ultimate/mcp` consumes `@ultimate/component-metadata` directly; nothing in `packages/{ng,react,vue}` may depend on it, and (per §5.2 below) it does not depend on `@ultimate/cli` either.
- **Blueprint §18 / §22** — MCP is one of several parallel, independent consumers of the Ultimate Knowledge Model / Ultimate Metadata (siblings: Docs, Storybook, MCP, Skills — §18; MCP, Skills, LLM context — §22). MCP is not built on top of, nor does it feed, any of these siblings.
- **Blueprint §34's package naming** — exactly one package, `@ultimate/mcp`, already reserved at `packages/mcp` since Phase 0 (currently `.gitkeep` only).
- **Phases 0–7, including the closed Phase 6 metadata system and closed Phase 7 CLI** — unchanged, not reopened. This spec treats `ALL_COMPONENTS: ComponentMetadata[]` and `@ultimate/cli`'s own real command implementations/compatibility resolver as stable, already-built reference points, not something it redesigns.
- **`docs/architecture/compatibility-manifest.json`'s existing shape** (Phase 7) — unchanged. Its reserved `mcpVersionRange` field is noted (§6) but not populated or consumed by this spec.

This spec resolves, from the preceding research pass (not a new broad investigation):

- The transport/server model (stdio-only, `bin`-invoked) and why an HTTP model is not adopted in v1 (§5.1).
- That MCP and CLI are parallel siblings with no dependency edge between them in either direction, and how "project-aware queries" (§23) is scoped without one (§5.2).
- The v1 tool surface, grounded in which of Blueprint §23's "potential capabilities" have real backing data today versus which would require fabrication or schema expansion (§7).

---

## 3. MCP Responsibilities

Per Blueprint §23's responsibility list and §35's Phase 8 objectives, confirmed against research and scoped to what v1 concretely supports:

- **Component search** — given a free-text query or partial name, return matching components from `@ultimate/component-metadata`'s real 8-record `ALL_COMPONENTS` set, using `name`/`category`/`description`.
- **API lookup** — given a component name and (optionally) a framework, return that component's real `api.{ng,react,vue}.{props,events}` facts as recorded in metadata.
- **Framework-aware queries** — every lookup/search tool accepts an optional framework filter/scope, since every fact in `ComponentMetadata` is already keyed per-framework; this is direct filtering over existing structure, not new data.
- **AI-friendly component discovery** — the combination of search + API lookup, structured as MCP tools with typed JSON-schema input/output, is itself what makes discovery "AI-friendly" per §35's phrasing — no separate discovery mechanism beyond these tools is designed.
- **Project-aware queries (narrowly scoped)** — given a caller-supplied framework name and version (not MCP performing its own filesystem project detection), return a compatibility verdict against the real `docs/architecture/compatibility-manifest.json` file, read directly by `@ultimate/mcp` (§5.2) — not by depending on `@ultimate/cli`'s `detectFramework()`/`matchCompatibility()` code.
- **Read-through of accessibility/guidance facts** — where a given record happens to populate `accessibility.{verifiedRoles,verifiedAriaAttributes,guidance}` or `guidance.{usageNotes,antiPatterns,migrationNotes}`, component-lookup tools return them; v1 does not guarantee non-empty results for either facet, since neither is populated on every real record (§7.2).

Explicitly **not** v1 MCP responsibilities: usage-examples lookup and theme/token lookup (§7.3 — no backing schema field exists for either); CLI/tooling discovery beyond what §5.2 defines; any Skills, LLM-context-generation, or agent-instruction-convention responsibility (§9 — Phase 9's); calling or wrapping any LLM/model provider itself.

---

## 4. The "Structured Metadata Only, Never Runtime Source Parsing" Boundary Test

Per Blueprint §23's closing sentence ("MCP should read structured Ultimate metadata rather than depend on arbitrary source parsing at runtime"), restated as a concrete, checkable rule every tool definition in §7 must pass:

**An MCP tool is in-bounds (structured-metadata consumption) if it only needs to:**
1. Read, filter, or format facts already present in `@ultimate/component-metadata`'s exported `ALL_COMPONENTS` array, or
2. Read `docs/architecture/compatibility-manifest.json` directly (the same file `@ultimate/cli` reads, read independently — §5.2), or
3. Accept caller-supplied structured input (a framework name, a version string, a search query) and answer purely from (1) or (2) above.

**An MCP tool is out-of-bounds (runtime source parsing / fabrication) if it would require:**
1. Reading, parsing, or introspecting any `.ts`/`.tsx`/`.vue` file under `packages/{ng,react,vue}` at request time, or
2. Returning content for a schema facet (`examples`, theme/token values) that does not exist anywhere in `ComponentMetadata`'s real shape, or
3. Depending on `@ultimate/cli`'s code to answer a query `@ultimate/mcp` could instead answer by reading the same underlying data file directly (§5.2).

Every tool defined in §7 is checked against this test explicitly.

### 4.1 V1 Tool Error Semantics

Every tool defined in §7 follows one shared error contract — no tool invents its own ad hoc error shape. Five cases are distinguished:

1. **Invalid tool input** (input fails the tool's declared JSON-schema contract — wrong type, missing required field, unrecognized `framework` enum value) → a structured MCP tool error identifying which input field failed validation and why. Never silently coerced, defaulted, or partially processed.
2. **Unknown component** (`name` does not match any of the real 8 `ALL_COMPONENTS` records) → a structured not-found result naming the ceiling explicitly (mirroring `@ultimate/cli`'s own `generate` command's refusal-message pattern, §7.1's `get_component` row) — never a fabricated or partial-match fallback, and never silently treated as an empty-success result.
3. **Malformed or unreadable compatibility manifest** (`docs/architecture/compatibility-manifest.json` is missing, is not valid JSON, or does not parse into the shape `check_framework_compatibility` (§7.4) expects) → a structured server/tool error surfacing that the manifest could not be read or parsed. **Never** silently returned as an empty result or, worse, as a successful `{ compatible: true }`/`{ compatible: false }` verdict — a verdict must only ever be returned when the manifest was actually read and evaluated. This is the same "fail closed, never guess" discipline `@ultimate/cli`'s own `matchCompatibility()` already applies (it returns an explicit `{ matched: false, reason }` on every non-match path, never a bare guess).
4. **Missing optional metadata facet** (`accessibility`, `guidance`, `api.{framework}`, etc. absent on an otherwise-valid, found record) → an explicit, honest "not recorded for this component" result, distinguishable from both an error and from a populated-but-empty value — never a fabricated or default-filled-in fact standing in for real data. This is §7.2's existing per-tool contract, restated here as an instance of the shared rule, not a special case invented only for those two tools.
5. **Unexpected internal errors** (anything not covered by 1–4 — e.g., an unhandled exception in a tool handler) → a structured, generic tool error that never leaks a stack trace, an absolute or relative filesystem path, an internal module name, or any other implementation-internal detail into the response the calling host/agent sees. Where such detail is useful for local debugging, it goes to stderr (§5.1.1) — never into the MCP tool-error payload itself.

This taxonomy applies uniformly to every tool in §7; individual tool rows state only what is specific to that tool (e.g., `get_component`'s not-found message), not a restatement of this shared contract.

---

## 5. Public API by Package

### 5.1 `@ultimate/mcp` — transport and invocation model

Responsibility: the MCP server binary and its tool implementations. Ships:

- A stdio-transport MCP server, invoked via a `bin` entry point in `package.json` (mirroring `@ultimate/cli`'s own `bin: { ultimate: "./dist/bin.mjs" }` shape) — an AI coding tool spawns `@ultimate/mcp` as a local subprocess and communicates over stdin/stdout. No HTTP/remote-hosted transport is shipped in v1: no Blueprint text calls for one, the repository has zero hosting infrastructure of any kind, and ADR-010/§5/§6 frame MCP as strictly optional, locally-invoked tooling — a remote-server deployment model would be building infrastructure the Blueprint doesn't ask for (research doc §5, Fork 1).
- A tools-only primitive surface (§7) — no MCP resources (URI-addressable browsable documents) or prompts (reusable prompt templates) are exposed in v1. Every capability named in Blueprint §23 is query/action-shaped, which MCP tools model directly; resources/prompts have no named Blueprint requirement or current consumer need (research doc §7, Fork 3).
- Tool handlers that read `@ultimate/component-metadata`'s `ALL_COMPONENTS` export and (for the compatibility tool, §7) `docs/architecture/compatibility-manifest.json` directly — no other data source.

Depends on `@ultimate/component-metadata` (workspace dependency, the same pattern `@ultimate/cli` already established for the identical package). Depends on **no other Ultimate runtime package** as a code dependency — critically, and unlike a plausible-but-rejected alternative, `@ultimate/mcp` does **not** depend on `@ultimate/cli` (§5.2). It reads `docs/architecture/compatibility-manifest.json` as a plain JSON file, the same way `@ultimate/cli` itself does, rather than importing `@ultimate/cli`'s `matchCompatibility()`/`detectFramework()` functions.

#### 5.1.1 stdio channel discipline — explicit runtime/boundary requirement

A stdio-transport server's stdout is the MCP protocol wire itself: any byte written to stdout that is not a well-formed MCP protocol message corrupts the channel for the host client. This spec therefore states, as a normative runtime requirement (not an implementation detail left to author discretion):

- **stdout carries MCP protocol messages only.** No other content — human-readable text, banners, progress notices, or anything else — is ever written to stdout by the running server process.
- **All logs, diagnostics, warnings, debug output, and operational messages go to stderr**, never stdout. This includes startup/shutdown notices, request-handling diagnostics, and any internal error detail the server chooses to surface for local debugging.
- **The server must not emit `console.log` or any other human-readable diagnostic output to stdout outside MCP protocol responses**, at any point in its process lifetime — not just during steady-state tool handling. This rules out, for example, a `console.log("server started")` banner on boot the way `@ultimate/cli`'s commands freely use `console.log` for their own stdout-is-the-product output (`@ultimate/cli` is a human-facing CLI where stdout *is* the deliverable per command; `@ultimate/mcp` is a protocol server where stdout is a wire format that only the MCP SDK's own response-serialization path may write to).

This rule is checkable independent of any specific tool's contract (§7): it governs the server process as a whole, and every tool handler in §7 inherits it — no tool handler writes directly to stdout under any circumstance, success or failure.

### 5.2 Relationship to `@ultimate/cli` — parallel siblings, no dependency either direction

Blueprint §6's dependency-direction diagrams draw MCP and CLI as **parallel, independent consumers** of the same upstream (`Component Source + Component Metadata + Documentation`), never one downstream of the other. The prohibited-direction diagram (`Ultimate Components → CLI → MCP → AI`) names exactly the chain this spec avoids: it does not read as "CLI may feed MCP," it reads as "this whole chain, including CLI-feeding-MCP, is the prohibited pattern" (research doc §7, Fork 2).

Concretely, this spec resolves that:

- `@ultimate/mcp` never imports `@ultimate/cli`.
- `@ultimate/cli` never imports `@ultimate/mcp` (already true — Phase 7 shipped with no such import, and `ultimate ai`'s stub explicitly does not invoke any MCP capability).
- Where both packages need the same underlying fact (framework/version compatibility, per `compatibility-manifest.json`), each package reads that shared, plain-JSON data file **independently**. This is the same pattern the file's own Phase 7 design already established: it is a repository-root architecture artifact (`docs/architecture/`, not `packages/cli/`-internal) precisely so more than one consumer can read it without depending on each other (Phase 7 spec §6.4 already anticipated "a future Phase 8 MCP server... consuming it is plausible but not designed here" — this spec is that design).
- `@ultimate/mcp`'s compatibility-query tool (§7) therefore reimplements a narrow, independent read of `compatibility-manifest.json` — not a full port of `@ultimate/cli`'s `matchCompatibility()` axis-resolution logic, and not a shared extracted library in v1 (no second consumer beyond these two exists yet to justify extracting one, per the same YAGNI discipline ADR-018/024/032 already established repo-wide for base-class architecture). It accepts caller-supplied `framework`/`frameworkVersion` input (never performing its own filesystem project-detection the way `@ultimate/cli`'s `detectFramework()` does) and evaluates only the axes relevant to a single-framework compatibility question.

This dependency-direction rule is enforced by CI, not just documented (§8).

---

## 6. Compatibility Manifest — What Phase 8 Does and Does Not Do

`@ultimate/cli`'s real `compatibility-manifest.json` (Phase 7) already declares `mcpVersionRange?: string` as a reserved, optional field on `CompatibilityEntry` — confirmed present in `packages/cli/src/compatibility.ts`'s type and absent from every real entry in the manifest file, and confirmed never read by `matchCompatibility()`'s own logic.

This spec does **not**:

- Populate `mcpVersionRange` on any manifest entry.
- Extend `matchCompatibility()` (a `@ultimate/cli`-owned function) to evaluate an MCP-version axis.
- Change the manifest's file location, format, or ownership (Phase 7 spec §6.4's decisions stand unmodified).

This spec **does**:

- Have `@ultimate/mcp` read the same manifest file directly (§5.2) for its own narrow compatibility-query tool (§7), independent of whether `mcpVersionRange` is ever populated — the tool answers "is framework X version Y compatible," which only needs `frameworkVersionRange`/`ultimateFrameworkPackage.versionRange`, both already populated.

Populating `mcpVersionRange` (i.e., "which `@ultimate/mcp` versions is this compatibility entry valid for") is left as explicit future work belonging to whoever next revises `@ultimate/cli`'s compatibility resolver — plausibly a Phase 8 implementation-time task, but a `@ultimate/cli`-side change to that package's own resolver and manifest content, not an `@ultimate/mcp`-side architectural decision this spec makes unilaterally.

---

## 7. V1 Tool Surface

Blueprint §23's "potential capabilities" list is explicitly qualified "potential," not required. Per the research pass (§6/§7, research doc), v1 selects the subset with real, verified backing data in `@ultimate/component-metadata`'s closed 8-record proof set, satisfying all four of Blueprint §35's actual Phase 8 objectives ("expose metadata/docs/examples," "framework-aware queries," "project-aware queries," "AI-friendly component discovery") without fabricating unbacked content.

### 7.1 Component discovery and lookup — **In v1**

| Tool | Input contract | Output contract | Boundary-test pass (§4) |
|---|---|---|---|
| `search_components` | `{ query: string, framework?: "ng" \| "react" \| "vue" }` | A list of matching components (`{name, category, description}` per match). v1 matching is defined exactly as: **case-insensitive substring matching** of `query` against each component's `name`, `category`, and `description` fields (a match on any one of the three qualifies the component for inclusion) — and (if `framework` supplied) restricted to components whose `packages.{framework}` entry exists. Empty array, never an error, when nothing matches. Fuzzy matching and relevance ranking are explicitly **deferred, out of scope for v1** (§10) — v1 returns unranked matches in `ALL_COMPONENTS`'s own array order, not a scored/sorted list. | Reads `ALL_COMPONENTS` only — passes. |
| `get_component` | `{ name: string, framework?: "ng" \| "react" \| "vue" }` | Exactly one output rule, no ambiguity: **without `framework`**, return the complete metadata record unmodified — every facet present on that record (`{name, category, description, packages, api?, accessibility?, style?, relationships?, guidance?, provenanceRef?}`), across all frameworks the record covers. **With `framework`**, return the same framework-neutral facets in full (`name`, `category`, `description`, `accessibility?`, `style?`, `relationships?`, `guidance?`, `provenanceRef?` — none of these are framework-specific, so none are dropped or filtered) **plus** only that one framework's entries for the two facets that are structured per-framework: `packages` narrowed to `packages.{framework}` alone, and `api` narrowed to `api.{framework}` alone (omitted entirely if absent for that framework, per §4.1 case 4 — not returned as an empty object). No other narrowing occurs — the `framework` input scopes exactly `packages`/`api` and nothing else. Per §4.1 case 2: a structured not-found result naming the known-8-component list (mirroring `@ultimate/cli`'s own `generate` command's refusal-message pattern) for any `name` outside the real 8-component set — never a fabricated or partial-match fallback. | Reads `ALL_COMPONENTS` only — passes. |

### 7.2 API and accessibility lookup — **In v1, read-through only**

| Tool | Input contract | Output contract | Boundary-test pass (§4) |
|---|---|---|---|
| `get_component_api` | `{ name: string, framework: "ng" \| "react" \| "vue" }` | That component's `api.{framework}.{props, events}` array, exactly as recorded, with no reshaping or filtering. `events` is real, populated per-record data — non-empty with real `EventFact` entries for at least Checkbox, Dialog, Menu, Paginator, Scroller, and Table (verified against `packages/component-metadata/src/records/*.ts`); Button and Tooltip are the two records with `events: []` on every framework facet. The tool returns whatever is actually recorded for the requested component/framework — never assumes or implies a uniform "no events" shape across the proof set. A clear "no API recorded for this framework" result (not an error) when `packages.{framework}` or `api.{framework}` is absent for that component/framework pair. | Reads `ALL_COMPONENTS.api` only — passes. |
| `get_component_accessibility` | `{ name: string }` | That component's `accessibility.{verifiedRoles, verifiedAriaAttributes, guidance}` facet **if populated**, or an explicit "no accessibility facts recorded for this component" result (not a fabricated empty-but-implying-verified response) if the optional facet is absent on that record. This spec does not assert every one of the 8 records populates this facet — the tool's contract must degrade honestly per-record, not assume uniform coverage. | Reads `ALL_COMPONENTS.accessibility` only — passes. |

### 7.3 Explicitly deferred — no backing data exists

| Capability (from §23's "potential" list) | Why deferred |
|---|---|
| Usage examples | No `examples` field exists anywhere in `ComponentMetadata`'s real schema (`api.ts`/`component-metadata.ts` confirmed: exactly 6 optional facets, none named `examples`). Shipping a tool that always returns empty would misleadingly imply a capability with zero real backing; adding an `examples` field to the schema is explicitly out of scope (source directive: "Do not expand the component metadata proof set merely for MCP"). |
| Theme/token lookup | `style.{componentName, styleModuleRef}` identifies which style module a component maps to but carries no actual token values or CSS custom-property data — that lives entirely inside `@ultimate/themes`' own preset data, which `ComponentMetadata` does not reference structurally. Exposing real theme/token values would require a new dependency on `@ultimate/themes` and a new schema facet, neither justified by existing evidence or in this spec's scope. |
| CLI/tooling discovery | No structured, exported registry of "what CLI commands exist and what they do" exists anywhere — `@ultimate/cli`'s `KNOWN_COMMANDS` array (`cli.ts`) is CLI-internal, not exported as metadata, and per §5.2, `@ultimate/mcp` does not depend on `@ultimate/cli`'s internals to read it. |
| Migration assistance (beyond `guidance.migrationNotes` read-through) | `guidance.migrationNotes` is included in `get_component`'s output (§7.1) where populated, but no dedicated migration-assistance tool with richer logic (e.g., cross-framework migration diffing) is designed — no repository evidence or Blueprint text specifies what such a tool would concretely do beyond surfacing this one optional string field. |

### 7.4 Project/framework compatibility — **In v1, narrowly scoped**

| Tool | Input contract | Output contract | Boundary-test pass (§4) |
|---|---|---|---|
| `check_framework_compatibility` | `{ framework: "angular" \| "react" \| "vue", frameworkVersion: string }` — caller-supplied, never MCP-detected from a filesystem | A **framework-version compatibility result** (`{ compatible: boolean, reason?: string }`), evaluated by checking `frameworkVersion` against `docs/architecture/compatibility-manifest.json`'s real `frameworkVersionRange` entries for the given `framework` — and **only** that one axis. Per §4.1 case 3: if the manifest cannot be read or parsed, this tool returns a structured server/tool error, never a fabricated `compatible` value. | Reads `compatibility-manifest.json` directly, no filesystem project-detection, no `@ultimate/cli` dependency — passes. |

**Naming and contract precision:** this tool is deliberately **not** described as evaluating "compatibility" in the full sense `@ultimate/cli`'s own `matchCompatibility()` resolver uses that word (Phase 7 spec §6.5) — that resolver checks six axes (`frameworkVersionRange`, `ultimateFrameworkPackage.versionRange`, `uixVersionRange`, `themeVersionRange`, `metadataSchemaVersion` by exact match, `cliVersionRange`). `check_framework_compatibility`'s v1 input contract supplies exactly two facts — `framework` and `frameworkVersion` — and therefore has no basis to evaluate, and makes **no claim** about, the Ultimate framework package version, UltimateUIX version, theme version, metadata schema version, CLI version, or any other axis. A `{ compatible: true }` result from this tool means only "this framework/version pair matches a `frameworkVersionRange` entry in the manifest" — it is not, and must not be presented as, a substitute for `@ultimate/cli`'s own full multi-axis compatibility check, and no caller should infer a broader guarantee from it than that single axis.

This tool satisfies Blueprint §35's "project-aware queries" objective at the narrow, single-axis scope the evidence supports (research doc §7, Fork 2's resolution): it answers a framework-version compatibility question given caller-supplied facts, rather than performing its own project/filesystem introspection the way `@ultimate/cli`'s `detectFramework()` does, and rather than attempting the full multi-axis resolution only `@ultimate/cli` currently implements. A richer "point MCP at a project directory and it tells you everything, across every axis" tool is not designed here — no Blueprint text requires MCP to perform filesystem introspection or multi-axis resolution, and doing so would risk exactly the kind of MCP-depends-on-CLI's-resolution-logic coupling §5.2 rules out, or a duplicated, independently-maintained copy of `matchCompatibility()`'s/`detectFramework()`'s logic, neither of which this spec adopts without stronger evidence.

---

## 8. Package Structure and Conventions

`@ultimate/mcp` follows the same uniform shape already established by every other Ultimate package (`component-schema`, `component-metadata`, `cli`):

- `type: "module"`, ESM-only build via `tsup`, `.d.mts` types (matching `packages/cli/package.json`'s exact pattern, itself matching `component-metadata`'s).
- `workspace:*` dependency on `@ultimate/component-metadata`. No dependency on `@ultimate/cli`, `@ultimate/component-schema` directly (accessed transitively through `@ultimate/component-metadata`'s own re-exports where needed, mirroring how `@ultimate/cli` itself only directly depends on `@ultimate/component-metadata`), or `@ultimate/{ng,react,vue,themes}`.
- `vitest run --typecheck` for tests, `tsc --noEmit` for a separate `typecheck` script — matching the exact script names already uniform across the repo's packages.
- A `bin` field in `package.json` pointing at the compiled server entry (mirroring `@ultimate/cli`'s own `bin: { ultimate: "./dist/bin.mjs" }` shape), plus the MCP TypeScript SDK (`@modelcontextprotocol/sdk`, the de facto standard implementation surface for a Node/TypeScript MCP server per research doc §5's external-source evidence) as the one new external runtime dependency this package introduces — no repository precedent contradicts adding it, since it is protocol-implementation infrastructure analogous to how `ng-packagr`/`tsup` are build-time infrastructure elsewhere, not a runtime dependency of any framework package.

### 8.1 New CI boundary gate — `boundary:validate:mcp`

A new CI gate, modeled directly on Phase 7's `scripts/provenance/validate-cli-boundary.mjs` (already proven, already wired into `.github/workflows/ci.yml` as `boundary:validate:cli`), must prove bidirectionally:

- `packages/{ng,react,vue}*` never import or depend on `@ultimate/mcp` (mirrors the existing script's reverse-direction check).
- `@ultimate/mcp` never imports or depends on `@ultimate/cli` or `@ultimate/{ng,react,vue,themes}` (mirrors the existing script's forward-direction check, extended to also forbid the `@ultimate/cli` edge specifically, per §5.2's resolution).

This gate is a specification-level requirement (this spec mandates its existence and exact scope); writing the actual script is implementation-plan/implementation work, following the existing script's structure as a direct template.

---

## 9. What Phase 9 Owns Instead (Explicit Boundary)

Restated from research doc §8, as a specification-level non-goal list:

- **Skills** (`@ultimate/ai`, repo-root `skills/`) — operational AI guidance per §24, versioned and tied to metadata versions. `@ultimate/mcp` is a data/tool source an agent with Skills loaded may query; it does not author, package, or version Skills content itself.
- **Generated LLM context** (`llms.txt`, `llms-full.txt`, structured/framework-specific/project context, §25) — a static-file-generation deliverable explicitly named for Phase 9. `@ultimate/mcp` is a live query interface, not a file generator; the two are different mechanisms for related goals and are not merged or confused in this spec.
- **AI Context Layers taxonomy and agent-instruction-file conventions** (§26, named Phase 9 objective in §35) — Phase 8 exposes component-level facts through typed tools; it does not define the broader Platform/Framework/Component/Theme/Project/Task Knowledge taxonomy or any agent-instruction-file convention that taxonomy implies.
- **AI validation workflows** (§35 Phase 9 objective) — entirely out of Phase 8 scope.

---

## 10. Explicit Non-Goals / Deferrals

Consolidated:

- HTTP/remote-hosted MCP transport — v1 is stdio-only (§5.1); no named consumer or Blueprint text calls for a hosted deployment model.
- MCP resources and prompts (the two MCP primitive types beyond tools) — v1 is tools-only (§5.1); every §23 capability is query/action-shaped, and no Blueprint text calls for a browsable-resource or prompt-template model.
- Usage-examples lookup, theme/token lookup, CLI/tooling-discovery tools — no backing schema/data exists for any of the three (§7.3); shipping empty-always tools would misleadingly imply real capability.
- A dedicated, richer migration-assistance tool beyond `guidance.migrationNotes` read-through — no evidence specifies what such a tool would concretely do (§7.3).
- Any dependency edge from `@ultimate/mcp` onto `@ultimate/cli`, in either direction — resolved as prohibited (§5.2), enforced by a new CI gate (§8.1), not merely deferred.
- Populating or evaluating the reserved `mcpVersionRange`/`aiSkillsVersionRange` compatibility-manifest axes — remains `@ultimate/cli`'s own future work, out of this package's boundary (§6).
- Any Skills, LLM-context-generation, or agent-instruction-convention responsibility — entirely Phase 9's (§9).
- Expanding `@ultimate/component-metadata`'s 8-component proof set or `@ultimate/component-schema`'s schema shape merely to give MCP more surface — not done anywhere in this spec.
- Filesystem-based project/framework auto-detection performed by MCP itself — `check_framework_compatibility` (§7.4) accepts caller-supplied input only, deliberately not duplicating or depending on `@ultimate/cli`'s `detectFramework()`.
- Fuzzy matching and relevance ranking in `search_components` — v1 is case-insensitive substring matching only (§7.1); scored/ranked search is a plausible future enhancement with no current evidence justifying its shape.
- `check_framework_compatibility` evaluating any axis beyond `frameworkVersionRange` — it never claims to evaluate Ultimate framework package version, UIX version, theme version, metadata schema version, CLI version, or any other axis of `@ultimate/cli`'s six-axis resolver (§7.4); a multi-axis MCP compatibility tool is not designed here.
- HTTP/remote-hosted transport, and any server behavior that would write human-readable output to stdout outside MCP protocol messages — both ruled out as boundary/runtime requirements (§5.1/§5.1.1), not merely deferred features.

None of these are Blueprint §23/§35-mandated-for-Phase-8 items being incorrectly dropped — each is either addressed at v1-minimal, evidence-backed scope (§7) or is genuinely blocked on an unstarted phase (Phase 9), a schema-expansion decision explicitly out of scope, or a coupling this spec's own evidence-based reading of §6 rules out (MCP↔CLI).

---

## 11. Specification Quality Gate (self-check, re-run after correction pass)

1. **Can an implementation team implement Phase 8 v1 without making fundamental architectural decisions?** Yes — §7 defines the concrete tool subset with exact input/output contracts (now including `get_component`'s exact framework-narrowing rule and `search_components`'s exact matching algorithm); §4/§4.1/§5.1/§5.1.1/§5.2 give checkable rules for transport, stdio channel discipline, error semantics, primitive type, and dependency direction; §8 gives the exact package/CI conventions to follow.
2. **Does MCP remain a leaf, metadata-only consumer, never a runtime-parsing or fabrication layer?** Yes — §4's boundary test is applied to every §7 tool explicitly; §4.1's shared error taxonomy now makes "honest absence, never fabrication" a general rule (case 4), not just an ad hoc note on two tools; §7.3 explicitly refuses to fabricate tools for unbacked capabilities rather than shipping always-empty results.
3. **Does it preserve Blueprint §6's dependency direction, including the CLI/MCP sibling relationship?** Yes — §5.2 states and justifies the no-dependency-either-direction rule directly from §6's diagrams, and §8.1 makes it CI-enforced, not just documented. Unchanged by this correction pass.
4. **Does it use `@ultimate/component-metadata` without overclaiming coverage?** Yes — §7.1/§7.2 explicitly scope every tool to the real 8-component `ALL_COMPONENTS` set and require honest degradation (not fabricated non-empty results) when an optional facet is absent on a given record; `get_component`'s framework-narrowing rule (§7.1, corrected) is now exact about which facets are framework-neutral (never dropped) versus framework-scoped (narrowed).
5. **Does it avoid inventing capabilities Blueprint §23 only lists as "potential" but the evidence doesn't back?** Yes — §7.3 explicitly enumerates and justifies every deferred capability against the real schema shape; §7.1's `search_components` correction explicitly defers fuzzy ranking rather than silently implying it.
6. **Is the transport/primitive-type choice justified, not asserted?** Yes — §5.1 states the stdio/tools-only decision and cites the research doc's Fork 1/Fork 3 evidence; §5.1.1 (new) makes the stdio choice's operational consequence — stdout is the protocol wire, stderr is for everything else — an explicit, checkable runtime requirement rather than an implicit assumption.
7. **Does it avoid premature Phase 9 coupling?** Yes — §9 explicitly enumerates every Phase-9-owned responsibility and states MCP does not implement any of them. Unchanged by this correction pass.
8. **Is the `mcpVersionRange` reserved-axis question resolved, not left ambiguous?** Yes — §6 explicitly states this spec neither populates the field nor extends `@ultimate/cli`'s resolver to read it, and names whose future responsibility that is. Unchanged by this correction pass.
9. **Are all deferred areas explicitly identified?** Yes — §10 consolidates every deferral with its specific justification, now including fuzzy-search ranking and `check_framework_compatibility`'s explicit single-axis-only scope.
10. **Does any dependency direction remain ambiguous?** No — §5.1/§5.2 state the exact dependency graph (`mcp → component-metadata` only; no edge to/from `cli`, `ng`, `react`, `vue`, or `themes`), and §8.1 requires this be CI-enforced. Unchanged by this correction pass.
11. **Is every tool's error behavior fully specified, not left to implementation discretion?** Yes (new check) — §4.1 defines one shared five-case error taxonomy (invalid input, unknown component, malformed/unreadable manifest, missing optional facet, unexpected internal error) that every §7 tool inherits; case 3's "never silently return an empty or successful compatibility result" rule is stated explicitly for `check_framework_compatibility` (§7.4).
12. **Is `search_components`'s matching behavior concrete and unambiguous?** Yes (new check) — §7.1 now states case-insensitive substring matching against `name`/`category`/`description` as the exact v1 rule, with fuzzy/ranked search explicitly named as deferred (§10), removing the prior "substring/fuzzy" ambiguity.
13. **Is `get_component`'s framework-narrowed output shape unambiguous?** Yes (new check) — §7.1 states one exact rule: framework-neutral facets (`name`, `category`, `description`, `accessibility?`, `style?`, `relationships?`, `guidance?`, `provenanceRef?`) are always returned in full; only `packages`/`api` are narrowed to the requested framework when one is supplied. No other interpretation is left open.
14. **Is `check_framework_compatibility`'s scope accurately named, not overstated?** Yes (new check) — §7.4 no longer calls its result a "compatibility verdict" in the full multi-axis sense; it is explicitly named a framework-version-only result, with an explicit statement that it makes no claim about the other five axes `@ultimate/cli`'s own resolver evaluates.
15. **Did this correction pass introduce any new architectural fork?** No — every correction (stdio/stderr discipline, tool error taxonomy, `search_components`'s exact algorithm, `get_component`'s exact output rule, `check_framework_compatibility`'s corrected terminology) is a contract-tightening clarification of decisions already made in the original spec pass (stdio transport §5.1, tools-only primitive §5.1, MCP↔CLI non-dependency §5.2, the real 8-component metadata scope §7) — none required inventing new architecture, reopening a resolved fork, or escalating for a user decision.
16. **Did this correction pass change any dependency direction, transport, or primitive-type decision?** No — stdio-only transport, tools-only primitive surface, `@ultimate/component-metadata`-only direct dependency, and the MCP↔CLI non-dependency rule are all unchanged; every correction operates strictly inside those already-established boundaries.
17. **Does every specific, checkable factual claim about real source data actually match the source?** Re-verified after an independent formal review (§13) found one that didn't — `get_component_api`'s prior "`events: []` for all 8 real records" claim (§7.2) was false. Corrected and re-verified directly against `packages/component-metadata/src/records/*.ts`: `events: []` on every framework facet holds for exactly Button and Tooltip; Checkbox, Dialog, Menu, Paginator, Scroller, and Table all have real, non-empty `events` arrays. The `get_component_api` tool contract itself ("exactly as recorded") did not need to change — only the illustrative claim about the data was wrong, not the contract's behavior.

---

## 12. Consistency Check

- **Phases 0–7, `component-schema`, `component-metadata`, `cli`:** unchanged, not reopened. This spec makes zero claim on their implementation and treats `ALL_COMPONENTS` and the real `compatibility-manifest.json` as stable, already-built reference points. The eight-component ceiling is preserved throughout (§7.1/§7.2).
- **Blueprint §5/§6/§18/§22/§23/§34/§35/§40:** not contradicted — every requirement (MCP as a separate, optional, non-runtime-dependency package; structured-metadata-only consumption; parallel-sibling relationship to CLI/Docs/Storybook/Skills; single named package; the four Phase 8 objectives; "AI/MCP quality" as a conditional Definition-of-Done axis) is either satisfied at v1-minimal scope or explicitly and justifiably deferred, never silently dropped.
- **ADR-010:** not contradicted — made concrete via §5.1's stdio/locally-invoked model, not reopened or reinterpreted.
- **GAP-029:** this spec is the concrete resolution direction GAP-029's own dependency note anticipated ("MCP architecturally depends on GAP-027... building MCP before metadata exists would likely mean parsing source directly") — GAP-027 is now closed, and §7 is exactly the metadata-driven design that dependency unblocked. A future implementation-plan or implementation-time action updates GAP-029's status, per the same convention used for GAP-027/GAP-028 at their respective milestones.
- **`docs/architecture/compatibility-manifest.json` (Phase 7):** unchanged in shape, location, or ownership. Its reserved `mcpVersionRange` field is explicitly not populated by this spec (§6); `@ultimate/mcp` reads the file directly for its own narrow purpose (§5.2/§7.4) without depending on `@ultimate/cli`'s code.
- **Phase 9 (AI Skills, LLM context):** remains entirely deferred — no Skills contract, generated-context format, or agent-instruction convention was designed or resolved by this spec (§9).
- **Runtime dependency direction (Blueprint §6):** unchanged and newly CI-enforceable in both new directions — `@ultimate/mcp` depends on `@ultimate/component-metadata` only; no `packages/{ng,react,vue}` dependency on MCP, and no `@ultimate/mcp` ↔ `@ultimate/cli` dependency in either direction, is introduced or implied (§5.2, §8.1).

- **stdio channel discipline, tool error semantics, `search_components` matching, `get_component` output shape, `check_framework_compatibility` terminology:** all five now stated as exact, checkable contracts (§4.1, §5.1.1, §7.1, §7.4) rather than left implicit or ambiguously worded. None of these five corrections changed the transport (still stdio-only), the primitive type (still tools-only), the direct-dependency-on-`@ultimate/component-metadata`-only rule, or the MCP↔CLI non-dependency rule (§5.2) — each correction tightens a contract detail strictly inside those already-established boundaries.

No code was written or modified in this pass, or in the original pass. Only this specification document was corrected; the preceding research document is unchanged by this pass.

---

## 13. Formal Review Record

An independent formal review (a separate reviewing pass, not the spec author's own §11/§12 self-check) was performed against this document, the preceding research document, and the real, closed Phase 6/7 source (`packages/component-schema`, `packages/component-metadata`, `packages/cli`, `scripts/provenance/validate-cli-boundary.mjs`, `docs/architecture/compatibility-manifest.json`).

**Verdict:** REQUEST CHANGES (one BLOCKING finding), with the architectural reasoning assessed as sound.

**Findings and disposition:**

1. **BLOCKING — §7.2's `get_component_api` row falsely claimed `events: []` for all 8 real records.** Verified false by direct re-inspection: only Button and Tooltip have `events: []` on every framework facet; Checkbox, Dialog, Menu, Paginator, Scroller, and Table all have real, non-empty `events` arrays. The error was inherited uncritically from the research document, which sourced the claim only from Button's own header comment and over-generalized it. **Fixed** — §7.2 now states the real, verified per-record data; the tool's actual contract ("exactly as recorded") required no change (§11 check 17).
2. **MAJOR (conclusion correct, stated justification thinner than the strongest available argument) — the MCP↔CLI non-dependency reasoning (§5.2).** The reviewer independently re-derived the same conclusion this spec reaches, and found stronger support for it than §5.2 itself states: three independent Blueprint diagrams (§6's permitted-direction fan-out, §18's Component Knowledge Model, §22's AI Platform diagram) all draw MCP as a parallel leaf consumer and never draw a permitted CLI↔MCP edge anywhere; only the *prohibited*-direction diagram ever places CLI and MCP on the same arrow, and it draws them in series. §23's own text (MCP's exact-input-sources section) never names CLI as a permitted source either. This corroborates, rather than contradicts, §5.2's conclusion — no change to the spec's dependency-direction decision was required, since the review found the existing conclusion correct, only under-argued relative to the best available reading.
3. **MINOR — §10's citation of "§6" for both `mcpVersionRange` and `aiSkillsVersionRange`** is slightly imprecise (§6 discusses only the former in detail). Noted; does not affect any tool contract or architectural decision, left as-is rather than treated as blocking.
4. **NIT — §5.1's CLI-`console.log` contrast** could additionally note that CLI's real error paths already use `console.error`/stderr correctly, which would strengthen rather than weaken the analogy. Editorial; not applied as a text change since it does not affect the contract.

**Also explicitly checked and passed, per the review's mandate:** Blueprint fidelity (§5/§6/§18/§22/§23/§34/§35/§40 — every requirement has a defined contract, nothing contradicted); Phase 9 scope leakage (none found — every §7 tool reads only `ALL_COMPONENTS`/`compatibility-manifest.json`, no dependency on `packages/ai` or `skills/`); real-contract fidelity for every other tool (schema field names/shapes match `component-schema`/`component-metadata` exactly, including the non-obvious detail that `check_framework_compatibility` correctly uses CLI's `"angular"|"react"|"vue"` enum rather than metadata's `"ng"` key); internal consistency across §4.1/§5.1.1/§7/§5.2; completeness (no placeholder-shaped language or unresolved TBDs); and the §8.1 CI gate's correctness as a generalization of the real `validate-cli-boundary.mjs`. The five most-recent corrections (stdio boundary, tool error semantics, `search_components` matching, `get_component` output shape, `check_framework_compatibility` terminology) were each independently re-verified as genuinely resolved, not cosmetic rewording.

**No open architectural questions were raised by the review.** The one blocking finding was a factual correction to an illustrative claim about real data, not a design fork — resolving it did not reopen, narrow, or change any tool contract, dependency-direction decision, or transport/primitive-type choice.

---

**FORMAL PHASE 8 SPECIFICATION REVIEW: PASSED — APPROVED**
