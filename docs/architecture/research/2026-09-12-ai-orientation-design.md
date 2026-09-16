# AI Orientation Design

**Document:** `docs/architecture/research/2026-09-12-ai-orientation-design.md`
**Purpose:** Design/recommendation only. Answers the scoped question the Project Reality and AI Operating Model Audit's §13.H left open (option 3): what should a fresh-agent orientation mechanism actually contain, and what mechanism (if any) should hold it. Does not create or modify any file this design recommends. Does not modify `README.md`, `ROADMAP.md`, `BLUEPRINT_GAPS.md`, the Blueprint, Skills, MCP, metadata, code, tests, CI, or package files. Makes no decision on the human's behalf.
**Audited HEAD:** `d391acf` (`main`). Unchanged by this task.
**Inputs:** `docs/architecture/research/2026-09-12-project-reality-and-ai-operating-model-audit.md` (the direct evidentiary basis for this design — every finding cited below traces to that document's own sections, referenced as `[Audit §N]`), `docs/architecture/research/2026-09-12-ai-knowledge-architecture-assessment.md` (the earlier, narrower assessment this design is consistent with), `docs/architecture/BLUEPRINT.md` §26 ("AI Context Layers").

> **Historical/superseded-for-conclusions (2026-09-16):** this document is the fourth in a 6-document 2026-09-12/13 reconciliation-audit chain, and the one whose recommendations were most directly acted on: its §8 minimal architecture recommendation was implemented as the repository's actual `AGENTS.md` (confirmed by `docs/architecture/research/2026-09-13-blueprint-closure-current-state-reconciliation.md` §3.4, which quotes `AGENTS.md` §2 as the shipped form of this design's §3 hierarchy almost verbatim). For the current, live version of the content this document designed, read `AGENTS.md` directly, not this document. This document retains unique value as the design rationale and rejected-alternatives record (§7 candidate-mechanisms table, §11 explicit non-goals) behind `AGENTS.md`'s shape — that reasoning is not restated in `AGENTS.md` itself.

---

## 1. Executive conclusion

Ultimate does not need a new subsystem. It needs approximately **200-400 lines of durable, narrowly-scoped orientation content**, most of which already exists correctly elsewhere and only needs an explicit index pointing to it, plus **one small, real correction** (`README.md`'s active staleness) and **one process commitment** (the orientation content's own upkeep is a mandatory step in specific, named workflow gates — not a "please remember to update this" hope).

The audit found the orientation problem is real but narrow: 6 of 10 fresh-agent orientation questions are already answerable from existing repository content [Audit §8]; the other 4 have no answer anywhere, not because the underlying facts don't exist, but because nothing states the hierarchy, the verification method, or the workflow expectation in a form a fresh reader can find without already knowing to look. This is an **indexing and statement problem, not a content-generation problem** — the recommended design reflects that directly: point at existing authoritative sources for everything that already has one, and write new content only for the small residue that has none.

The single largest risk this design must design against is not "insufficient content" — it is **staleness**, per the audit's own repeated, evidenced finding that every tracking document in this repository's history that wasn't mechanically forced to stay current eventually didn't (`ROADMAP.md`, `BLUEPRINT_GAPS.md`'s top table — both went stale for an extended, multi-phase period before being caught) [Audit §6, Case 1]. Accordingly, this design treats "how does this stay true" as load-bearing, not an afterthought, for every artifact it proposes.

---

## 2. Fresh-agent minimum orientation model

Separated per the three tiers the task specifies.

### Must know immediately (before any work begins)
1. What Ultimate is and its ownership model (company-owned, framework-native, not a Prime-runtime-dependent wrapper).
2. That a gated workflow exists and discovering a task is not itself authorization to implement it.
3. The source-of-truth hierarchy (§3 below) — specifically, that the Blueprint is architectural authority, tracking documents can be stale, and real repository evidence outranks any document's claim about itself.
4. Where the "do not reopen without new evidence" markers live (currently DECISION-D, Tree-family) and that such markers exist as a category, even before knowing every current instance.

### Should know where to find (not memorized, but discoverable in one hop)
5. Current phase/track status → `ROADMAP.md` (post-reconciliation, `d391acf`).
6. Current open gaps/decisions → `BLUEPRINT_GAPS.md`.
7. Why a past architectural choice was made → `DECISIONS.md` (ADR index).
8. Deep evidence for a specific past finding → `docs/architecture/research/*.md` (dated artifacts).
9. Component-level facts (props, accessibility notes, test coverage) → `@ultimate/component-metadata`'s records, MCP tools, or direct source.
10. How to run verification for a given claim → §5 below and the relevant package's own `package.json` scripts / `.github/workflows/ci.yml`.

### Should discover only when relevant (not front-loaded, would bloat orientation content for the common case)
11. The exact text of every one of the ~37 gap entries — read `BLUEPRINT_GAPS.md` directly when a specific gap becomes relevant, not before.
12. Every ADR's full reasoning — read `DECISIONS.md` directly for the specific ADR that governs the area being touched.
13. Historical research-artifact detail (e.g., the exact SSR ID-nondeterminism defect's reproduction steps) — only needed if working in that specific area.
14. Framework-specific implementation minutiae (e.g., exactly how Vue's `useId()` scoping works) — belongs in source/tests, not orientation content.

**Design principle this tier structure implies:** the "must know immediately" tier should be small enough to read in under two minutes. Everything else is a pointer, not a payload. This directly avoids the "duplicated documentation layers" and "overly large AGENTS.md" risks the audit flagged as live, not hypothetical [Audit §12].

---

## 3. Proposed source-of-truth hierarchy

In order, highest to lowest authority, with an explicit tie-break rule:

1. **Real repository evidence** (actual source code, actual test results, actual CI output, actual git history) — **wins every disagreement**, always. This is not a stylistic preference; it is the literal mechanism every audit in this session's history used to catch every stale-document case it found [Audit §6, Cases 1-2; §10]. No document in this repository is authoritative over what the code and tests actually do.
2. **`docs/architecture/BLUEPRINT.md`** — architectural intent and governance (§45's own stated authority). Changes rarely, and only via the Blueprint's own governance process.
3. **`docs/architecture/DECISIONS.md`** (ADRs) — binding architectural decisions made *within* the Blueprint's scope. An ADR cannot contradict the Blueprint; if evidence suggests one should, that is itself a Blueprint-governance-level event (§45), not a silent ADR edit.
4. **Approved specifications and implementation plans** (`docs/superpowers/specs/`, `docs/superpowers/plans/`) — the argument for a specific piece of work, binding for that work's own scope, but subordinate to the ADR(s) and Blueprint sections they implement.
5. **`docs/architecture/BLUEPRINT_GAPS.md`, `docs/architecture/ROADMAP.md`, `docs/architecture/COMPONENT_INVENTORY.md`, `docs/architecture/PERFORMANCE.md`, `docs/architecture/MIGRATION.md`** — current-state tracking documents. **These are the layer most likely to be stale relative to reality** [Audit §6, Case 1] — treat any claim here as provisional until cross-checked against tier 1 if the claim is load-bearing for a decision about to be made. This is not a reason to distrust them by default (as of `d391acf` they are reconciled and accurate) — it is a reason to re-verify before *relying* on one for something consequential.
6. **`docs/architecture/research/*.md`** (dated audit/finding artifacts, this document included) — point-in-time evidence snapshots. Authoritative for *what was true when written*, explicitly not authoritative for *what is true now* unless independently re-confirmed. Every artifact in this directory already self-labels this correctly ("Status: Discovery snapshot... does not modify X") [Audit §10] — this convention should be preserved, not replaced.
7. **`README.md`** and other general/onboarding documentation — descriptive, human-onboarding-oriented, explicitly **not** authoritative for current project state. (This ranking is itself part of why `README.md`'s current staleness [Audit §8, §13.D] is lower-severity architecturally than it is practically — a reader who already knows this hierarchy would not trust it blindly, but a fresh agent who does not know the hierarchy yet has no way to know that, which is exactly the orientation gap this design closes.)
8. **AI context files / Skills / `llms.txt` / MCP tool responses** — generated or curated *consumer* outputs, one-directional consumers of tiers 2-5, per Blueprint §6's own dependency diagram. **Never authoritative for anything upstream of themselves.** If an MCP tool's answer disagrees with the metadata record it reads from, the metadata record wins; if the metadata record disagrees with the actual component source, the source wins.

**Tie-break rule, stated once for reuse:** when two sources disagree, the higher-numbered tier is more likely to be stale, not more likely to be wrong architecturally — always resolve toward tier 1 (real evidence) as the actual fact, then correct the higher-tier document if it's the one that's stale. Never resolve a disagreement by assuming the lower-authority-tier document must be correct because it's more specific or more recent-looking.

---

## 4. Workflow/approval orientation

The gated sequence (`Research → Verification → Architecture Discussion → Decision → Specification → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout`) is currently discoverable only via `BLUEPRINT.md` §36's abstract naming and the Superpowers plugin's own skill files, which **live outside this repository's tracked content** [Audit §8, row "What workflow must I follow?"] — a fresh agent using a different harness has no repository-internal way to discover this expectation exists at all.

**The critical statement that must be explicit, not implicit:** *discovering that a task exists, or that a gap is real, does not itself authorize implementation.* This session's own history demonstrates the gate holding correctly under real pressure (the SSR ID-nondeterminism defect was escalated through two full separate cycles rather than "just fixed" mid-task) [Audit §7] — but that discipline currently lives in the *coordinator's* own practice, reinforced by the Superpowers plugin when present, not in anything a fresh agent reading only this repository's files would be told.

**What the orientation mechanism should state about this (content, not a specific file):**
- The gate sequence exists, named plainly, without assuming the reader already has Superpowers loaded.
- Each gate's binding output artifact type (research → a `docs/architecture/research/*.md` finding; architecture decision → an ADR in `DECISIONS.md`; specification → `docs/superpowers/specs/*.md`; plan → `docs/superpowers/plans/*.md`) so a fresh agent recognizes what "done with this gate" looks like on disk.
- That **explicit human authorization is a distinct, separately-granted permission at each boundary** — finding a gap does not authorize research; research does not authorize a spec; an approved spec does not authorize skipping plan review; a prior "yes" does not carry forward to a new task. This is the single most consistently-enforced discipline observed in this session's own history and is exactly the kind of rule that is costly to lose and cheap to state explicitly.
- That protected/do-not-reopen markers (currently DECISION-D) must be checked before proposing work in an adjacent area, with a pointer to where such markers currently live (`BLUEPRINT_GAPS.md` §5), not a promise that no others exist elsewhere.

---

## 5. Verification orientation

The audit found **no standard, written-down verification method exists anywhere** — every one of this session's three prior audits independently reinvented the same approach (grep/find/direct source read, cross-checked against tracking documents) [Audit §8, row "How do I verify..."]. This is cheap to fix by *stating* the method once, not by building tooling.

**What must be verified, and by what:**
- **"Implemented" vs. "verified":** a claim that code exists is verified by reading the source file directly (`Read`/`grep`), not by trusting a tracking document's assertion. A claim that a behavior works is verified by running the actual test/command that exercises it, not by assuming a passing CI badge from an unrelated run still applies.
- **"Verified" vs. "CI-enforced":** verified once means someone ran a check and it passed at that moment; CI-enforced means a script exists in `.github/workflows/ci.yml` that will fail the build if the condition regresses. The reconciled `BLUEPRINT_GAPS.md` already models this distinction correctly for every resolved gap (e.g., GAP-032/033's bundle-size/coverage gates name the exact enforcing script and its regression threshold) — orientation content should point to this convention as the pattern to follow, not restate it.
- **Local verification vs. externally unexercisable verification:** some claims (e.g., "the release pipeline works") cannot be verified locally because they require a real npm publish, a real GitHub branch-protection setting, or a real security advisory to exist — `MIGRATION.md` already discloses this honestly for the release pipeline specifically ("no `@ultimate/*` package has ever had a real release") [Audit §2, "Release/migration" row]. Orientation content should name this category explicitly ("some things are built-and-ready but not yet provable under real conditions") so a fresh agent doesn't either (a) falsely claim something is production-proven because its infrastructure exists, or (b) waste effort trying to locally simulate something that is honestly, correctly disclosed as unexercisable pending a real external event.
- **Where verification evidence is recorded:** CI artifacts (ephemeral, `test-results/`), committed baseline documents (`SAST_BASELINE.md`, `ACCESSIBILITY_BASELINE.md`, `PERFORMANCE.md` — durable, committed), and dated research artifacts (`docs/architecture/research/*.md` — durable, point-in-time). Orientation content should name these three categories and their different durability, not attempt to unify them into one system (per §12 below, that unification is exactly the kind of premature infrastructure this design argues against).

---

## 6. Current-state strategy

**Does Ultimate need a dedicated current-state/orientation document? This design's answer: partially yes, but narrower and more index-shaped than the phrase "current-state document" usually implies.**

The audit's own §9 analysis is the direct basis for this: a *new* current-state document that duplicates `ROADMAP.md`'s phase table or `BLUEPRINT_GAPS.md`'s gap list would itself become the next staleness casualty [Audit §9] — introducing a fourth tracking surface without a keep-current mechanism does not reduce distribution, it adds to it. The right shape is **not** "summarize everything current," it is "state the 3 things that currently have no home at all, and point at everything else."

### What belongs in a dedicated artifact (if built)
- The source-of-truth hierarchy (§3 above) — this has no home today.
- The verification method (§5 above) — this has no home today.
- The workflow-gate statement (§4 above) — this has no home today, repository-internally.
- A single, short pointer table: "for X, read Y" (phase status → `ROADMAP.md`; open gaps → `BLUEPRINT_GAPS.md`; decisions → `DECISIONS.md`; deep evidence → `docs/architecture/research/`; component facts → metadata/MCP). This is an index, not a summary — it contains no phase numbers, no gap counts, no decision content that could itself go stale, only file paths and one-line descriptions of what each path is for.
- One explicit "protected, do not reopen without new evidence" pointer, naming that this category exists and where current instances live, without restating their content.

### What must NOT be duplicated there
- Phase-by-phase status (stays in `ROADMAP.md` only).
- The gap registry itself, its IDs, or their statuses (stays in `BLUEPRINT_GAPS.md` only).
- ADR content or numbering (stays in `DECISIONS.md` only).
- Component coverage counts (stays in `COMPONENT_INVENTORY.md` only).
- Any specific finding from a research artifact (stays in that artifact only, referenced by path).

**Why this split resists staleness better than a general current-state document would:** everything this design proposes putting in a new artifact is either (a) genuinely stable content that changes only when the *hierarchy itself* changes (rare — this is closer in nature to the Blueprint's own governance-gated stability than to a phase tracker), or (b) a bare file-path pointer, which breaks only if a file is renamed or deleted (a mechanically detectable event, unlike "this gap's status silently became wrong"). Nothing in the proposed content requires updating merely because a phase completed or a gap resolved — that is precisely the property that made `ROADMAP.md`/`BLUEPRINT_GAPS.md`'s own staleness possible, and precisely the property this design avoids reproducing.

**If the answer were "no" instead:** a fresh agent could still reconstruct current state today by reading `ROADMAP.md` → `BLUEPRINT_GAPS.md` → `DECISIONS.md` in that order, cross-checking anything load-bearing against real source — this is exactly the method this session's own audits used successfully, repeatedly. The cost of "no" is that every fresh agent re-derives the *hierarchy and method* from scratch (as three separate audits in this session did), not that current state becomes unreconstructable. This design's recommendation (§8) is that this repeated re-derivation cost is real and cheap enough to fix that "no" is not the better answer, but the case for "no" is not frivolous.

---

## 7. Candidate mechanisms considered

| Mechanism | What it would hold | Strength | Weakness | Verdict |
|---|---|---|---|---|
| **A small root-level orientation file** (name TBD by the human — could be `AGENTS.md`, could be something else) | §3 hierarchy, §4 workflow statement, §5 verification method, §6's index table, do-not-reopen pointer | Small, stable, addresses exactly the 3-4 genuinely unanswered questions [Audit §8]; a single, conventional first-read location many AI tools already look for | Requires the human to choose a name/format; risk of scope creep if not disciplined (see §12) | **Best fit for the content this audit found actually missing** |
| **A structured current-state document** (broader, phase/gap/decision summary) | Everything the index-only version holds, plus a live summary of phase status, gap counts, decision status | More "complete" at a glance | Directly reproduces the failure mode that already happened twice (`ROADMAP.md`, `BLUEPRINT_GAPS.md`'s top table) [Audit §6, Case 1; §9] — duplicated status content with no distinct upkeep mechanism from the originals it duplicates | **Rejected in this broader form** — the narrow, index-only version in §6 captures its genuine value without its staleness liability |
| **Generated AI context** (extend `llms.txt`/`renderFrameworkContext`) | Machine-generated summaries derived from metadata/source | Cannot go stale relative to its own inputs by construction (regenerated, not hand-maintained) | Cannot express things that have no structured source today — the hierarchy, the verification method, and the workflow-gate statement are not derivable from any existing structured data; they are project conventions a human states once | **Wrong tool for this specific content** — valuable for what it already does (component-level facts), not a substitute for orientation-layer prose |
| **Stronger conventions around existing documents only** (no new file; add a short header to `BLUEPRINT_GAPS.md`/`ROADMAP.md` stating the hierarchy) | Same content as the orientation-file option, distributed across existing files' own headers | Avoids creating a new file at all | Splits genuinely-related orientation content (hierarchy + workflow + verification) across multiple documents' front matter, working against the "must know immediately, read in under two minutes" goal (§2) — a fresh agent would need to open 3+ files to assemble what one small file could state together | **Weaker than the dedicated small file, for a small enough cost difference that this is a legitimate close second, not a bad option** |
| **Some combination** (small orientation file + a header note in `BLUEPRINT_GAPS.md`/`DECISIONS.md` pointing back to it) | The orientation file as primary; existing documents get a one-line "for the hierarchy this fits into, see [orientation file]" pointer | Best discoverability in both directions (whichever document a fresh agent opens first, it points to the other) | Slightly more surface area to keep consistent (two things instead of one) — but the "consistent" surface is a stable pointer, not status content, so the staleness risk is negligible | **This is the recommended combination — see §8** |

---

## 8. Recommended minimal architecture

**One small, root-level orientation file** (name and exact format left to the human — see §12's open questions) **containing only:**
1. A two-sentence "what is Ultimate" statement (already exists correctly in `BLUEPRINT.md` §1 — quote or closely paraphrase it, don't reinvent it).
2. The source-of-truth hierarchy (§3), stated once.
3. The workflow-gate statement (§4) — the sequence, the artifact-per-gate mapping, and the "discovery ≠ authorization" rule.
4. The verification-method statement (§5) — the implemented/verified/CI-enforced distinction, and the "some things are honestly unexercisable locally" category.
5. The index/pointer table (§6) — file paths only, no restated content.
6. A pointer to where "do not reopen" markers currently live, naming the category, not enumerating every instance.

**Plus one small, mechanical correction, independent of whether the orientation file is built:**
- `README.md`'s stale "Phase 0... no component source migrated" claim [Audit §8, §13.D] should be corrected to something that will not itself go stale the same way — the safest content is a pointer ("for current phase status, see `ROADMAP.md`") rather than a restated status claim, applying this same design's own §6 principle (pointers don't go stale; restated status does) to the one concrete pre-existing staleness case this audit found.

**Plus one small, native extension to already-existing infrastructure** (not a new subsystem, matching the already-committed AI Knowledge Architecture Assessment's own narrowest recommendation, independently reconfirmed by this session's later audit) [Audit §5, §12]:
- Expose `scripts/provenance/workspace-graph.mjs`'s already-real `getAllPackageNames()`/`getTransitiveClosure()` functions via one new MCP tool or CLI command, so the one genuinely-already-real graph in this repository becomes queryable rather than CI-internal-only.
- This is explicitly **optional relative to the orientation-file work above** — it addresses a different problem (package-dependency queryability) than fresh-agent orientation does, and should not be bundled into the same authorization if the human wants to decide them separately.

**What is deliberately excluded from "minimal":** a broader current-state document (§6, rejected in its broad form), any new relationship/provenance schema extension to `ComponentMetadata` (real but lower-priority than the orientation gap itself, per the audit's own ranking) [Audit §13.E], and anything resembling a knowledge graph, vector store, or symbol-level index (§12 below).

---

## 9. Staleness/synchronization strategy

This is the section the task explicitly marks mandatory, and the section every prior artifact in this session's history under-specified until asked directly — addressed per-artifact below, refusing the "humans will remember" default the task explicitly rules out.

### For the orientation file (§8, item 1-4 above: hierarchy, workflow, verification statements)
- **Who/what updates it:** A human, deliberately and rarely — this content is designed to be stable by construction (it describes *how the project is organized*, not *what state it is currently in*). It should change only when the actual hierarchy, workflow, or verification convention itself changes — an event on the same order of rarity as a Blueprint governance change (§45).
- **When it must be updated:** Only if (a) a new document type is introduced into the source-of-truth hierarchy, (b) the gate sequence itself changes, or (c) the verification-method categories themselves change (e.g., a new "externally unexercisable" category is discovered). Landing a phase, closing a gap, or resolving a decision should **never** require touching this file — if a future edit to this file is motivated by "we finished Phase 11," that is a sign the file has drifted from its intended narrow scope back toward the current-state-document failure mode this design explicitly avoided.
- **How staleness is detected:** Primarily by the same mechanism that caught every prior staleness case in this repository — a human-requested reconciliation audit, cross-checking the file's claims against real repository structure. This is not a fully-automated answer, and this design does not pretend otherwise. A partial mechanical check is possible and cheap: a CI step (or a pre-existing script extension) that verifies every file path named in the index/pointer table (§8, item 5) still exists — this catches the "renamed/deleted file" class of staleness immediately and cheaply, though it cannot catch "the hierarchy statement is conceptually wrong now."
- **Should CI validate anything:** **Yes, narrowly** — a link/path-existence check on the index table only (a few lines of script, analogous in spirit to `scripts/provenance/validate-provenance.mjs`'s existing pattern of checking required content exists). **No** broader content-freshness check is proposed, since verifying that prose is still *conceptually* accurate is not mechanically checkable the way a file's existence is.
- **Generated vs. manually maintained:** Manually maintained, deliberately — this content has no structured upstream source to generate it from (there is no schema for "our source-of-truth hierarchy"), and per §7's own analysis of the generated-AI-context option, forcing this into a generated form would either be impossible (nothing to generate it from) or would produce something too generic to be useful.

### For the index/pointer table specifically (§8, item 5)
- **Who/what updates it:** Whoever adds a genuinely new category of authoritative document to the repository (e.g., if a new `docs/architecture/OPERATIONS.md` were introduced) — this is rare and already naturally occurs at the same time as the new document's own creation, so it can be a checklist item on *that* work rather than a separately-remembered task.
- **When:** At the same commit that introduces the new document type, not retroactively.
- **How detected:** The CI path-check above catches removal/renaming; addition of a new authoritative document type with no corresponding index entry is not mechanically detectable and depends on the same discipline that already governs adding a new GAP ID or ADR number correctly (a real, working convention in this repository's history, per the audit's own finding that gap-ID discipline has held correctly throughout) [Audit §10, "Gap discoverability"].

### For the `README.md` correction
- **Who/what updates it:** A human, once, as a one-line fix (this task's own scope explicitly excludes making this change now — it is a recommendation, not an action taken here).
- **How it stays non-stale going forward:** By applying this same design's own principle — replace the restated status claim with a pointer to `ROADMAP.md`, so the *pointer* cannot go stale even if the phase status changes again. This is the single cheapest, most durable fix available and requires no new process.

### For the optional `workspace-graph.mjs` MCP/CLI exposure (§8, third item)
- **Who/what updates it:** Nothing needs to — it is a query interface over already-live `package.json` data, computed on demand (matching the script's own current, already-correct pattern of full recomputation rather than a persisted, potentially-stale cache) [Audit §5, Graphify pattern "Incremental knowledge updates... Not justified for Ultimate"].
- **Staleness risk:** None beyond the underlying `package.json` files' own currency, which is already the actual source of truth for this data — exposing it via a new query surface does not introduce a new copy of the data to go stale.

---

## 10. Relationship to existing AI/MCP/Skills infrastructure

Per the task's explicit instruction to state ownership boundaries clearly:

| System | Should own | Should NOT own |
|---|---|---|
| **`@ultimate/ai`** | Generating consumer-facing LLM context (`llms.txt`, `llms-full.txt`, framework-specific context) from `@ultimate/component-metadata`, per its already-correct, already-tested design | The fresh-agent orientation content this design proposes — that content has no metadata-schema source to render from, and `@ultimate/ai`'s own scope (Blueprint §25/§26) is downstream-consumer-facing, not Ultimate's-own-contributor-facing |
| **Generated `llms.txt`/`llms-full.txt`** | Machine-generated component/framework context for downstream consumers of Ultimate's packages | Anything about Ultimate's own internal development process, decision history, or contributor workflow — these are a different audience (a consumer app using `@ultimate/ng`, not a contributor building `@ultimate/ng` itself) |
| **Skills** (`skills/*.md`) | Per-component, metadata-derived operational guidance for using Ultimate's components correctly | Project-level orientation (goal, hierarchy, workflow) — Skills are already correctly scoped to component-level usage guidance, not project-level orientation, per their own existing content [Audit §2, "Skills" row] |
| **MCP** | Query/exposure layer over `@ultimate/component-metadata` (already its exact, correct current scope) and, if the optional extension in §8 is authorized, over `workspace-graph.mjs`'s package-dependency facts | The underlying index/data itself — MCP should remain a thin consumer, exactly matching Blueprint §6's dependency-direction diagram and this session's own repeated finding that Ultimate's AI layer is correctly designed as consumer-only, never as an independent knowledge store [Audit §1, "AI-development goal"; §4] |
| **Component metadata** (`@ultimate/component-metadata`/`@ultimate/component-schema`) | Structured, versioned, source-cited facts about the 8 (eventually more) built components | Project-level orientation content, gap/decision status, or workflow rules — these are categorically different kinds of knowledge (component facts vs. project-process facts) and mixing them into one schema would blur a distinction that is currently clean |
| **Workspace/package dependency graph** (`scripts/provenance/workspace-graph.mjs`) | Package-level dependency facts, already correct and real | Component-level relationships (`ComponentMetadata.Relationships`) — these are a different graph at a different granularity; conflating them was not found necessary by either this audit or the prior AI Knowledge Architecture Assessment |
| **The proposed orientation file (§8)** | Exactly the content in §8 — hierarchy, workflow, verification method, index pointers, do-not-reopen category pointer | Anything that already has a correct home elsewhere (phase status, gap list, ADR content, component facts) — its entire value proposition is being the *one place that points everywhere else*, not a second copy of anything |

**The unifying principle, stated once:** every AI-facing system in Ultimate today is correctly a *consumer* of upstream facts, never an independent source of truth (Blueprint §6's own diagram, validated repeatedly by this session's audits) [Audit §1, §4, §10]. The orientation file this design proposes is the one addition that is not itself a "consumer" in this sense — it is a *map of the consumer/source relationships themselves*, which is exactly the category of content missing today and exactly why it belongs in a new small file rather than being folded into any of the existing consumer-shaped systems above.

---

## 11. What should explicitly NOT be built

Carried forward directly from the audit's own §12 findings, restated here as binding scope exclusions for this design specifically:

- **A vector database or embedding-based search index** — no measured or reported performance problem justifies this at Ultimate's current corpus size (8 components, 17 packages) [Audit §12].
- **A full repository knowledge graph** (symbol-level, multi-modal) — no concrete gap in this design or either prior audit requires symbol-level call-graph analysis or multi-modal (PDF/image/video) extraction [Audit §5, §12].
- **A broad current-state document duplicating `ROADMAP.md`/`BLUEPRINT_GAPS.md`'s own status content** — rejected explicitly in §6/§7 above; the narrow index-only alternative captures the genuine value without the staleness liability.
- **An `EXTRACTED`/`INFERRED` confidence-tagging schema extension to `ComponentMetadata.Relationships`** — real and potentially useful per the prior assessment, but explicitly lower priority than the orientation gap this design addresses, and not part of this design's own recommended minimal architecture (§8) [Audit §5, §13.E ranks this below the orientation-layer items].
- **An overly large orientation file that re-hosts content already correct elsewhere** — the single most concrete complexity risk named for this exact deliverable [Audit §12, "An overly large AGENTS.md"]. The design in §8 is deliberately bounded to content with no existing home; any future edit that adds restated gap/phase/decision content to this file should be treated as scope creep, not enrichment.
- **Any mechanism that depends on a human remembering to update a document with no enforcement** — explicitly ruled out by the task's own instruction, and directly why §9 above specifies exactly what triggers an update and what (narrow) part of that is CI-checkable.
- **Committing to a specific file name/format (`AGENTS.md` vs. something else) as part of this design** — this design recommends the *content and shape*, not the literal filename, per §12's open questions below; naming is a small decision but still the human's to make, not implied by this document's own file-path examples.

---

## 12. Open questions requiring human decision

1. **Should the orientation file be named `AGENTS.md`** (a name several AI coding tools already look for by convention) **or something else** (e.g., a name under `docs/architecture/` matching this repository's own existing naming conventions)? This design takes no position — both are structurally equivalent for the content in §8; the tradeoff is tool-auto-discovery (`AGENTS.md`'s advantage) versus consistency with this repository's own existing `docs/architecture/*.md` convention (the alternative's advantage).
2. **Should the `workspace-graph.mjs` exposure (§8's optional third item) be authorized alongside the orientation file, or deferred as a separate decision?** This design recommends treating them as separable, but the human may prefer to bundle or explicitly defer the second item.
3. **Should the `README.md` correction happen as part of this same authorization, or as its own small, separately-tracked documentation task** (similar in shape to the earlier Documentation Reconciliation task, which explicitly did not include `README.md` in its own scope)? Either is consistent with this design; the choice is about task-sequencing convenience, not substance.
4. **Should the CI path-existence check for the index table (§9) be built now, alongside the file's initial creation, or added later once the file's actual shape has stabilized?** Building it later avoids designing a check against content that may still change once the human reviews the file's first draft; building it now guarantees the staleness-detection mechanism isn't itself deferred indefinitely.

---

## 13. Recommended next step

Consistent with this design's own §11 (nothing here should be built without explicit authorization) and the prior audit's §13.H option 3 (a scoped design pass, now delivered) — the next step is a **human decision on the four open questions in §12**, followed by (if authorized) a small, bounded implementation task: write the orientation file per §8's exact content list, apply the one-line `README.md` correction per §9, and — only if separately authorized per §12's question 2 — add the `workspace-graph.mjs` exposure as its own small, independent piece of work with its own review, not bundled silently into the orientation-file task.

This design does not authorize any of that work. It exists to make the shape of that future authorization concrete and small.

---

## Evidence-based findings vs. design recommendations vs. human decisions required

**Evidence-based findings** (established facts, not this document's own judgment):
- 6 of 10 fresh-agent orientation questions are answerable today from existing content; 3 have no answer anywhere; 1 (`README.md`) actively misleads [Audit §8].
- Every tracking document in this repository's history that wasn't mechanically checked eventually went stale for an extended period before being caught [Audit §6, Case 1; §9].
- Ultimate's existing AI-facing systems (`@ultimate/ai`, MCP, Skills) are already correctly scoped as one-directional consumers, never independent knowledge stores [Audit §1, §4, §10].
- No current gap or decision in this repository requires symbol-level, vector-indexed, or multi-modal knowledge infrastructure [Audit §5, §12].
- `scripts/provenance/workspace-graph.mjs` is a real, already-working, already-deterministic package-dependency graph with zero query surface outside CI [Audit §4, prior AI Knowledge Architecture Assessment].

**Design recommendations** (this document's own synthesis, not established fact):
- One small orientation file containing exactly the 6 items in §8, no more.
- The specific source-of-truth hierarchy and tie-break rule in §3.
- The narrow index-only shape for any current-state content, explicitly rejecting a broader duplicating document (§6-§7).
- The staleness-mitigation split between "rarely-changing stable content" and "mechanically-checkable pointers" (§9).
- Deferring the `workspace-graph.mjs` exposure as a separable, optional decision from the orientation-file work.

**Human decisions required** (this document takes no position, per §12):
- The orientation file's exact name/location.
- Whether to bundle or separate the `workspace-graph.mjs` exposure decision.
- Whether the `README.md` fix happens now or as its own tracked task.
- Whether to build the CI path-check immediately or after the file's shape stabilizes.
- **The overarching authorization question this document does not answer for the human:** whether to proceed with building any of §8's recommended architecture at all, versus proceeding directly to component/architecture work (the prior Next-Work Prioritization Audit's own candidates) and treating this design as background context only — exactly the same open choice the prior audit's own §13.H left unresolved, now with a concrete shape attached to option 3 rather than an abstract one.
