# Specification — Root-Level `AGENTS.md` Orientation File

**Status:** Draft for Spec Review (amended once — see "Amendment Note" below).
**Date:** 2026-09-12
**Origin:** `docs/architecture/research/2026-09-12-ai-orientation-design.md` (the approved design this specification implements — every binding decision below traces to that document, referenced as `[Design §N]`). That design itself traces to `docs/architecture/research/2026-09-12-project-reality-and-ai-operating-model-audit.md` (referenced as `[Audit §N]`).
**Baseline:** `main` at `d391acf`.

**Amendment Note (this pass):** the human's own Spec Review feedback identified a missing dimension — the specification defined what a fresh agent must *know* about Ultimate but not how it is expected to *operate safely* inside the repository (git/branching, commit discipline, Superpowers usage, pre-work safety checks). This amendment adds §3.7 ("AI Operating Rules") to `AGENTS.md`'s required content and updates the section-count constraint from "exactly 6" to "exactly 7" accordingly (see §3's own updated framing and §11 for the full reasoning). No other section of this specification is altered by this amendment; §1-§10 (renumbered where a new subsection was inserted) retain their original substance.

**Amendment Note (post-implementation correction):** during Implementation (Task 1), the protected/do-not-reopen pointer originally specified below as foldable into §3.3 ("may be folded into §3.3's workflow section or kept separate — implementer's/Plan's choice") was instead separated into its own standalone section, since folding it collapsed the file's section *count* below the required 7 even though the *content* was present. This shifted every subsequent section's number by one in the final, merged `AGENTS.md`. This specification's own §3.5/§3.6 numbering below is corrected to match the as-built, as-merged file exactly: **Section 5 = Protected decisions, Section 6 = Where to find things, Section 7 = AI Operating Rules.** This is an implementation-time correction to this document's own internal section labels, not a change to any approved functional/content scope — every binding content requirement below is unchanged.
**Required sequence (this document is the Specification step):** Research (audit) ✅ → Architecture Discussion (design) ✅ → Decision (human, confirmed this task) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

This specification does not implement anything. It does not create `AGENTS.md`, does not modify `README.md`, does not modify CI, and does not create an implementation plan. It defines the exact, bounded content and constraints that a future, separately-gated Implementation Plan must satisfy.

---

## 1. Human decisions this specification implements (binding, not reopened here)

Per the user's own confirmed decisions:

1. **Orientation file:** a root-level `AGENTS.md`. Deliberately small and stable. An orientation/map artifact, not a current-state tracker. Scoped to the approved design; must not grow into a second README, ROADMAP, or Blueprint.
2. **Workspace graph exposure:** deferred. No MCP or CLI exposure of `scripts/provenance/workspace-graph.mjs` is part of this work item.
3. **README correction:** included in this work item. Replace the stale phase/status claim with a durable pointer, not a restated status claim.
4. **CI path check:** included in this work item. A narrow, path-existence-only validation of `AGENTS.md`'s pointer/index table. No conceptual/prose freshness automation.

---

## 2. What this specification covers — exactly, no more

- The exact content and section structure of a new root-level `AGENTS.md` file.
- The exact correction to `README.md`'s stale "Phase 0... No component source has been migrated yet" claim (line 8, confirmed by direct read this pass).
- The exact design and scope of a new, narrow CI validation step checking that every file path named in `AGENTS.md`'s pointer/index table exists on disk.

### 2.1 Implementation scope (binding, disambiguates any future Plan)

The actual file-touching scope this specification authorizes an eventual Implementation Plan to cover is strictly limited to:

- **Create:** `AGENTS.md` (repo root).
- **Modify:** `README.md` — exactly the "Status" section's stale claim (§6 below), nothing else in that file.
- **Modify:** `.github/workflows/ci.yml` — exactly one new, narrow validation step (§7 below), nothing else in that file.
- **Create (if the Plan judges it necessary as a small helper):** one small validation script, colocated with existing provenance/validation scripts (e.g., under `scripts/provenance/` or `scripts/`, matching this repository's own existing convention — the Plan's own implementer decides the exact location and whether a standalone script is warranted versus an inline CI step, per Blueprint precedent of small, single-purpose scripts).

**No other file may be added to the implementation scope.**

### 2.2 Explicitly excluded (binding, restated from the human's own instruction)

- Workspace graph MCP/CLI exposure (`scripts/provenance/workspace-graph.mjs` — read-only reference for this spec's own hierarchy language, never modified or exposed by this work item).
- Any change to `@ultimate/ai` (`packages/ai/`).
- Any change to Skills (`skills/*.md`).
- Any change to MCP (`packages/mcp/`).
- Any change to component metadata/schema (`packages/component-metadata/`, `packages/component-schema/`).
- Any change to the Blueprint (`docs/architecture/BLUEPRINT.md`).
- Any change to ADR content or numbering (`docs/architecture/DECISIONS.md`).
- Any change to `ROADMAP.md`'s phase-status content.
- Any change to `BLUEPRINT_GAPS.md`'s gap/decision content.
- Any broad current-state document (a phase/gap/decision status summary of any kind).
- Any vector database, knowledge graph, embedding index, or symbol-level index.
- Any general documentation link-checking subsystem (the CI check in §7 is scoped to exactly one file's one table, not a repository-wide link checker).
- Any automated attempt to determine whether `AGENTS.md`'s prose is conceptually current — that remains the existing reconciliation/audit process's responsibility, per `[Design §9]`.

---

## 3. `AGENTS.md` — exact content and section structure

Per `[Design §8]`, extended by this amendment's §3.7, `AGENTS.md` contains exactly the following 7 sections, no more. Each section's binding content is specified below; exact prose wording is left to the Implementation Plan/implementer, provided it satisfies the substance specified here.

### 3.1 Section: What Ultimate is

Two to three sentences, closely paraphrasing or quoting `docs/architecture/BLUEPRINT.md` §1's own stated goal — a company-owned, multi-framework UI platform (Angular/React/Vue, extensible), derived from MIT-licensed Prime ecosystem baselines, with no required runtime dependency on Prime packages. Must not restate any current phase/status information (that belongs in tracking documents, per the hierarchy in §4 below) — this section states what Ultimate permanently is, not what state it is currently in.

### 3.2 Section: Source-of-truth hierarchy

States the exact hierarchy from `[Design §3]`, preserved verbatim in order and substance:

1. Real repository evidence (source code, tests, CI output, git history) — wins every disagreement, always.
2. `docs/architecture/BLUEPRINT.md` — architectural intent and governance.
3. `docs/architecture/DECISIONS.md` (ADRs) — binding architectural decisions within the Blueprint's scope.
4. Approved specifications and implementation plans (`docs/superpowers/specs/`, `docs/superpowers/plans/`) — binding for their own scope.
5. `docs/architecture/{BLUEPRINT_GAPS,ROADMAP,COMPONENT_INVENTORY,PERFORMANCE,MIGRATION}.md` — current-state tracking documents; the layer most likely to be stale relative to reality, re-verify before relying on one for a consequential decision.
6. `docs/architecture/research/*.md` — dated, point-in-time evidence snapshots; authoritative for what was true when written, not for current truth without re-confirmation.
7. `README.md` and other general/onboarding documentation — descriptive, not authoritative for current project state.
8. AI context files / Skills / `llms.txt` / MCP tool responses — one-directional consumers of tiers 2-5; never authoritative for anything upstream of themselves.

Must include the tie-break rule stated once in `[Design §3]`: when two sources disagree, resolve toward the real-evidence tier as the actual fact, then correct whichever higher-tier-numbered (lower-authority) document was stale — never assume a lower-authority document is correct merely because it looks more specific or more recently edited.

### 3.3 Section: Workflow and approval gates

States, per `[Design §4]`:

- The gate sequence, named plainly: Research → Verification → Architecture Discussion → Decision → Specification → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.
- Each gate's binding output-artifact-type-to-location mapping: research finding → `docs/architecture/research/*.md`; architecture decision → an ADR in `DECISIONS.md`; specification → `docs/superpowers/specs/*.md`; implementation plan → `docs/superpowers/plans/*.md`.
- **The explicit rule, stated as its own clearly separated statement, not buried in prose:** discovering that a task, gap, or defect exists does not itself authorize implementation. Each gate boundary requires its own, separately granted human authorization — a prior "yes" for one task or one gate does not carry forward to a different task or a later gate.
- A pointer to the category of protected/do-not-reopen architectural decisions, naming that such markers exist and currently live in `docs/architecture/BLUEPRINT_GAPS.md` §5 (Open Architectural Decisions) — without enumerating or restating which specific decisions are currently so marked, since that content belongs in tier 5 of the hierarchy (§3.2), not duplicated here.

### 3.4 Section: Verification model

States, per `[Design §5]`:

- The distinction between **implemented** (code exists, confirmed by reading the source directly), **verified** (a check was run once and passed at that moment), **CI-enforced** (a script in `.github/workflows/ci.yml` will fail the build if the condition regresses), and **externally unexercisable** (the claim cannot be proven locally because it requires a real external event — e.g., an actual npm publish, an actual GitHub branch-protection setting, an actual security advisory — and is honestly disclosed as such rather than either falsely claimed proven or endlessly chased in simulation).
- That these four categories are not interchangeable, and a document's or agent's claim should name which one applies rather than using "done"/"working" ambiguously.
- Where verification evidence of each kind is typically recorded: CI artifacts (ephemeral, e.g. `test-results/`), committed baseline documents (e.g. `docs/architecture/SAST_BASELINE.md`, `docs/architecture/ACCESSIBILITY_BASELINE.md`, `docs/architecture/PERFORMANCE.md`), and dated research artifacts (`docs/architecture/research/*.md`).
- This section does not itself define a new verification *procedure* or tool — it names the existing conceptual categories and where their evidence already lives, consistent with `[Design §5]`'s own scope.

### 3.6 Section: Pointer/index table (as merged; see amendment note above — originally numbered §3.5)

A table (or equivalent list) containing **only file paths and a one-line description of each path's purpose** — no restated status content, no gap counts, no phase numbers, no decision outcomes. Minimum required entries, per `[Design §6]`:

| For... | See |
|---|---|
| Current phase/track status | `docs/architecture/ROADMAP.md` |
| Open gaps and architectural decisions | `docs/architecture/BLUEPRINT_GAPS.md` |
| Why a past architectural choice was made | `docs/architecture/DECISIONS.md` |
| Deep evidence for a specific past finding | `docs/architecture/research/` (dated files) |
| Component-level facts (props, accessibility, tests) | `@ultimate/component-metadata` records, or MCP tools, or direct component source |
| Current component coverage | `docs/architecture/COMPONENT_INVENTORY.md` |
| Performance/bundle-size baselines | `docs/architecture/PERFORMANCE.md` |
| Release/migration process | `docs/architecture/MIGRATION.md` |

The Implementation Plan may add further rows of the same shape (path + one-line purpose) if a genuinely missing pointer is identified during implementation, but must not add rows containing restated status/content — any such addition is a spec deviation requiring escalation, not a routine implementation choice.

### 3.5 Section: Protected/do-not-reopen category pointer (as merged; see amendment note above — originally numbered §3.6, folding language superseded)

A short, standalone statement naming that architectural decisions can be explicitly protected against reopening without new evidence, and pointing to `docs/architecture/BLUEPRINT_GAPS.md` §5 as where current instances of this marker live — without naming which decisions are currently so marked (that content is tier-5, tracking-document content, not orientation content, per the hierarchy in §3.2). As merged, this is its own standalone section (Section 5) rather than folded into §3.3, per the amendment note above.

### 3.7 Section: AI Operating Rules (added by this amendment)

A concise section stating **repository-level operating principles**, not procedures — the detailed how-to for each rule area remains owned by the sources named in each subsection below, per the human's own "keep `AGENTS.md` small" instruction. This section is the one place `AGENTS.md` tells an agent *how to behave safely*, distinct from §3.1-§3.6's *what-to-know* content (as merged: Sections 1-6).

#### 3.7.1 Git / branching

- Before beginning implementation work, inspect the current branch and working-tree state (`git status`, `git branch --show-current`) — do not assume the current branch is the correct one to work on.
- Unless the task's own context already establishes the correct working branch, ask the human whether to continue on the current branch or create/use a new task branch.
- Direct work on `main` requires explicit human authorization.
- Existing uncommitted changes (the user's own, or another agent's) must be preserved — never overwrite, `reset --hard`, `clean -f`, `checkout --`, or otherwise discard working-tree state that wasn't the current task's own creation, without first confirming it's safe to do so.
- Any destructive git operation (force-push, hard reset, branch deletion, history rewrite) requires explicit human authorization at the time it's needed — a prior authorization for a different operation does not carry forward.
- Pushing to a remote requires explicit human authorization unless the task's own surrounding context already explicitly grants it.
- **Branch naming:** no single authoritative naming convention currently exists across this repository's own history (confirmed by direct inspection this pass — prior track work used varying shapes, e.g. `phase-10-track-e-ssr-hydration`, `phase-6-component-metadata`, `worktree-uix-data-foundation`). This specification does not invent one. `AGENTS.md` should state this honestly (branch naming is an implementation-level choice, not a fixed convention) rather than assert a pattern the repository's own history doesn't actually establish.

#### 3.7.2 Superpowers usage

- The repository's gated workflow (§3.3) is intended to be executed using the appropriate Superpowers skill for each stage, when Superpowers is available in the active environment — this is a working expectation, not optional background reading.
- Point to (do not restate the contents of) the relevant skill category for each stage: brainstorming/problem exploration, specification creation and review, implementation planning, subagent-driven development where appropriate, verification, and final review/closeout — plus other Superpowers skills as appropriate to the task at hand.
- Use the skill appropriate to the current stage; do not invoke an unrelated skill merely to satisfy a checklist.
- Using a Superpowers skill never grants authorization to cross a human-approval gate on its own — the gate sequence and its approval requirements (§3.3) remain binding regardless of which skill executes a given stage.
- **If Superpowers is unavailable in the current environment, the workflow and its approval gates still apply.** The absence of the tool does not remove the gates — an agent without Superpowers loaded still owes the same research→spec→plan→implementation→review discipline and the same authorization boundaries.
- `AGENTS.md` names the expectation and the stage-to-skill-category mapping; it does not copy any skill's own detailed procedure — that procedural detail remains owned by the skills themselves.

#### 3.7.3 Git commits

- **Confirmed repository convention (not invented):** every commit in this repository's history follows Conventional Commits shape, `type(scope): short description` (confirmed directly this pass — 453 commits inspected, dominant types `feat`/`fix`/`docs`/`ci`, scope typically a package or track name, e.g. `feat(ng): ...`, `docs(architecture): ...`, `fix(track-e): ...`). `AGENTS.md` should point to this existing, real convention (e.g., "follow this repository's established Conventional Commits style — see recent `git log` for examples") rather than restate a long explanation of Conventional Commits itself.
- Do not commit merely because files changed — a commit must correspond to an authorized piece of work at an appropriate workflow gate.
- Review `git status`/`git diff` before staging or committing — never stage blindly.
- Never use `git add -A`/`git add .` as a default — stage only the files the current authorized task actually touched.
- Never include unrelated changes (the user's own in-progress edits, another agent's work) in a commit.
- Research, specification, and plan artifacts are not committed before their own applicable human-approval/tracking gate has been satisfied — matching this exact session's own established practice (e.g., research/audit artifacts in this project's own history were left uncommitted until the human explicitly approved committing them).
- Never push a commit unless the task's own context explicitly authorizes it.

#### 3.7.4 Pre-work repository safety

Before modifying any repository file, establish: the current branch, the current working-tree status, any existing relevant uncommitted changes, and the applicable task/spec/plan and its current approval state. This exists specifically to prevent an agent from mistaking an existing dirty working tree for its own work, or implementing against the wrong branch/state — restated here as its own explicit checklist item because it is the concrete, actionable form of §3.7.1's and §3.3's principles, not a new rule.

#### 3.7.5 Preserving the human-controlled model (restated, not new)

This subsection introduces no new principle — it restates, in the "how to operate" section specifically, constraints already established elsewhere in this specification (§3.3), because the human's own instruction asked for this restatement explicitly, and because operating rules are exactly the place an agent is most likely to look for this reminder in the moment it matters:
- Discovering a problem does not authorize fixing it.
- Finding a gap does not authorize implementing it.
- An approved specification does not authorize implementation before an implementation plan exists and is itself reviewed/approved.
- Approval for one task does not automatically authorize a different task.
- Surface ambiguity or conflicting evidence to the human rather than silently resolving an architectural question that belongs to them.

---

## 4. What `AGENTS.md` must NOT contain (binding negative scope, restated for implementer clarity)

- No phase-by-phase status (stays exclusively in `ROADMAP.md`).
- No gap registry content, IDs, or statuses (stays exclusively in `BLUEPRINT_GAPS.md`).
- No ADR content or numbering (stays exclusively in `DECISIONS.md`).
- No component coverage counts (stays exclusively in `COMPONENT_INVENTORY.md`).
- No content from any specific research artifact beyond a directory-level pointer.
- No enumeration of currently-protected decisions by name (only the category pointer, per §3.5 as merged — originally numbered §3.6).
- No detailed git manual (§3.7.1 states principles and one honest finding about branch naming, not a git tutorial).
- No copy of any Superpowers skill's own procedural content (§3.7.2 names the expectation and points to skill categories by purpose, not by reproducing their instructions).
- No restated Conventional Commits tutorial (§3.7.3 points to this repository's own real git history as the example, per the human's own instruction not to duplicate a long explanation when a convention already exists).

Any future edit to `AGENTS.md` motivated by "a phase completed" or "a gap closed" is itself evidence the file has drifted from this specification's intended scope, per `[Design §9]`'s own stated staleness-detection heuristic — an Implementation Plan or later maintainer discovering this pattern should treat it as a signal to revert the change and correct the tracking document instead, not as a normal update. The same applies if a future edit turns §3.7 into a detailed procedural manual — that is scope creep against this amendment's own "concise principles, not procedures" framing, not a normal enrichment.

---

## 5. Sizing and format constraints

- Target length: consistent with `[Design §1]`'s "approximately 200-400 lines" estimate for the full orientation content — this is a target, not a hard limit, but a draft substantially exceeding it should be treated as a sizing concern to flag at Spec Review or Plan Review, not silently accepted.
- The "what is Ultimate" section (§3.1) must be readable in well under two minutes together with the workflow/verification sections' own core statements, per `[Design §2]`'s "must-know-immediately" tier being small by design — the pointer table (§3.6 as merged, originally numbered §3.5) and any longer explanatory prose in the workflow/verification sections are expected to make up the majority of remaining length.
- Markdown format, consistent with every other root-level and `docs/architecture/` document in this repository. No new format convention introduced.
- File name and path: `AGENTS.md` at repository root — already decided by the human, not a remaining specification question.

---

## 6. `README.md` correction — exact scope

**Current stale content** (confirmed by direct read, `README.md` line 8):
```markdown
## Status

**Phase 0 — Repository Foundation, Provenance & Baseline Verification.** No component source has been migrated yet. See `docs/architecture/ROADMAP.md` for the full phase plan.
```

**Required correction, per the human's own instruction and `[Design §9]`'s durability principle:** replace the restated phase-number/status claim with a pointer-only statement that cannot itself go stale the same way, since a pointer's only failure mode is the target file being renamed or removed (mechanically detectable, §7 below), not the pointer's own content becoming factually wrong as phases progress.

**Binding constraint on the replacement text:** it must NOT state a specific phase number, a specific completion percentage, or any other status claim that could itself go stale again. It MUST retain the existing pointer to `docs/architecture/ROADMAP.md` (already correct) and MAY additionally point to the new `AGENTS.md` file, consistent with `AGENTS.md`'s own role as the map of where to find current state.

**Illustrative shape (not binding exact wording — the Implementation Plan/implementer drafts the final text within this constraint):**
```markdown
## Status

For current phase and track status, see `docs/architecture/ROADMAP.md`. For how to orient yourself in this repository — the source-of-truth hierarchy, the development workflow, and where to find current gaps and decisions — see `AGENTS.md`.
```

**Scope boundary:** this correction touches exactly the "## Status" section's own content. No other section of `README.md` (the opening description, "Repository structure," or any other existing section) is in scope for this specification.

---

## 7. CI path-existence validation — exact scope

Per `[Design §9]`'s own staleness-mitigation split (rarely-changing stable content vs. mechanically-checkable pointers), and the human's own explicit instruction to keep this narrow:

**What it checks:** that every file path referenced in `AGENTS.md`'s pointer/index table (§3.6 as merged, originally numbered §3.5) exists on disk at the commit being validated. Nothing else.

**What it does NOT check (binding exclusions):**
- Whether `AGENTS.md`'s prose (the "what is Ultimate," hierarchy, workflow, or verification-model sections) is conceptually accurate — this is explicitly out of scope, per the human's own instruction and `[Design §9]`'s own acknowledgment that conceptual freshness is not mechanically checkable.
- Any link within any other document in the repository (this is not a general-purpose link checker, per the explicit exclusion list in §2.2).
- Whether the pointer table itself is complete (i.e., it does not flag a *missing* pointer that should exist but doesn't) — it only flags pointers that exist but point at something that no longer does.
- Markdown syntax/lint concerns beyond path extraction.

**Mechanism (implementer's choice within this constraint, non-architectural):** either a small standalone script (matching this repository's existing `scripts/provenance/validate-*.mjs` convention) invoked as a new CI step, or an inline CI step using an existing, already-available tool (e.g., a markdown-link-checking utility scoped via CLI flags to exactly `AGENTS.md`) — the Implementation Plan decides which is simpler and more consistent with existing repository conventions, provided the resulting check satisfies exactly the scope stated above and no more.

**CI integration point:** one new step in `.github/workflows/ci.yml`'s existing main `ci` job (the same job that already runs `provenance:validate`/`boundary:validate`/`ceiling:validate` — this new step follows the same established pattern of a small, single-purpose validation script). Must not create a new job, must not duplicate Track A/B/E's own separate job structures (those solve different, unrelated concerns), and must not block on anything beyond `AGENTS.md`'s own path table.

**Failure behavior:** the check fails the CI run (non-zero exit) if any referenced path does not exist, with a clear message naming the specific missing path — matching the existing `validate-provenance.mjs`/`validate-bundle-size.mjs` family's own convention of specific, actionable failure messages rather than a generic "validation failed."

---

## 8. Staleness/synchronization requirements (binding, restated from the approved design)

Per the human's own explicit staleness requirement and `[Design §9]`:

- `AGENTS.md` must change only when: project governance changes, the source-of-truth hierarchy itself changes, the workflow/gate sequence itself changes, the verification-model categories themselves change, or the pointer/index table needs a new row (a new authoritative document type is introduced) or an existing row's target path changes.
- Completing a phase, closing a gap, resolving a decision, or landing a normal implementation/component-migration task must **NOT** require editing `AGENTS.md`. Any Implementation Plan or future task that finds itself editing `AGENTS.md` for one of these reasons has misunderstood this specification's scope and should stop and re-read this document rather than proceeding.
- The path-existence CI check (§7) is the only mechanically-enforced staleness guard this specification authorizes. Conceptual/prose currency remains the responsibility of the existing human-requested reconciliation/audit process (the same process that produced the Post-Phase-10 Blueprint Reconciliation Audit and Documentation Reconciliation), not a new automated mechanism.

---

## 9. Acceptance criteria

- **AC1:** `AGENTS.md` exists at repository root, containing exactly the 7 sections specified in §3, no additional sections, no restated tracking-document content (verified against §4's negative-scope list).
- **AC2:** `AGENTS.md`'s source-of-truth hierarchy section (§3.2) matches the 8-tier ordering and tie-break rule specified, without alteration.
- **AC3:** `AGENTS.md`'s workflow section (§3.3) states the full gate sequence, the artifact-per-gate mapping, and the "discovery does not equal implementation authorization" rule as its own clearly identifiable statement.
- **AC4:** `AGENTS.md`'s verification section (§3.4) defines all four categories (implemented / verified / CI-enforced / externally unexercisable) distinctly.
- **AC5:** `AGENTS.md`'s pointer table (§3.6 as merged, originally numbered §3.5) contains at minimum the 8 rows specified, each row containing only a path and a one-line purpose — no status content.
- **AC6:** `README.md`'s "## Status" section no longer states a specific phase number or completion claim; it points to `ROADMAP.md` (and, per §6's illustrative shape, may point to `AGENTS.md`).
- **AC6a:** `AGENTS.md`'s AI Operating Rules section (§3.7) states, at minimum: the git/branching principles of §3.7.1 (including the honest branch-naming disclosure, not an invented convention); the Superpowers stage-to-skill-category mapping and the "still applies if Superpowers is unavailable" statement of §3.7.2; a pointer to this repository's own real Conventional Commits convention (not a restated tutorial) plus the commit-discipline principles of §3.7.3; the pre-work safety checklist of §3.7.4; and the human-controlled-model restatement of §3.7.5 — verified against §3.7's own subsections, none omitted.
- **AC7:** A new CI step exists validating exactly the path-existence condition in §7 — verified by a deliberate temporary break (point one table row at a nonexistent path, confirm the check fails with a specific message naming that path, then revert) — proving the check has real detection power, not a vacuous pass.
- **AC8:** `git diff --stat` for the eventual implementation touches only the files named in §2.1 — `AGENTS.md` (new), `README.md` (the "## Status" section only), `.github/workflows/ci.yml` (exactly one new step), and, if used, exactly one new small validation script under `scripts/`.
- **AC9:** No file under `packages/ai/`, `packages/mcp/`, `packages/component-metadata/`, `packages/component-schema/`, `skills/`, `docs/architecture/BLUEPRINT.md`, `docs/architecture/DECISIONS.md`, `docs/architecture/ROADMAP.md` (beyond what §6 authorizes for `README.md` specifically — `ROADMAP.md` itself is not touched), or `docs/architecture/BLUEPRINT_GAPS.md` appears in the implementation's diff.
- **AC10:** No vector database, embedding index, symbol index, or general link-checking dependency is added to any `package.json`.

---

## 10. Open questions for Spec Review

None of the four items the approved design left open (`[Design §12]`) remain open — all four were resolved by the human's own confirmed decisions in this task's own instruction (AGENTS.md name/location; workspace-graph deferred; README correction included; CI check included and scoped narrowly). This specification surfaces no new open question of its own beyond the illustrative (non-binding) wording in §6, which is explicitly left to the Implementation Plan/implementer's judgment within the stated constraint, and the implementer's choice of CI-check mechanism in §7, which is explicitly non-architectural per this specification's own framing.

---

## 11. Section-structure decision (why 7, not 6 — added by this amendment)

The original specification constrained `AGENTS.md` to exactly 6 sections, matching `[Design §8]`'s own content list at the time the design was approved. The human's Spec Review feedback identified that "how to operate safely" (git/branching, commits, Superpowers usage, pre-work safety, restating the human-controlled model at the point of action) is a distinct concern from any of the original 6 sections' own subject matter:

- §3.1 (what Ultimate is), §3.2 (source-of-truth hierarchy), §3.4 (verification model), §3.5 (pointer table), and §3.6 (protected-decision pointer) are each about a specific *kind of fact* an agent needs to know. Operating rules are not a fact-category — they are behavioral constraints, and forcing them into any one of these sections would either dilute that section's own clear, single subject (violating the same "narrow, single-purpose section" discipline the original 6 sections themselves follow) or require scattering operating-rule fragments across multiple sections, which would work against the "readable in a few minutes" goal by breaking up related material.
- §3.3 (workflow and approval gates) is the closest existing fit by subject-matter adjacency (both concern process), and this amendment did consider folding the new content there. It was rejected because §3.3 is specifically about the *gate sequence and artifact types* — a structural, sequence-shaped statement — while the new content is a *behavioral checklist* (branching, commits, safety checks) that an agent consults at a different moment (continuously, while working) than §3.3 (at each gate transition). Merging them would make §3.3 do two distinct jobs and would obscure the "discovery ≠ authorization" rule (§3.3's own single clearest statement) inside a longer, mixed-purpose section.

A new, clearly-named 7th section (`AI Operating Rules`, §3.7) preserves each existing section's own narrow focus, keeps the new content discoverable under its own heading rather than buried inside an adjacent one, and matches the human's own suggested naming. The overall file remains compact: §3.7's own 5 subsections are each 3-6 short bullet points, consistent with the same terse, principle-not-procedure style already used throughout §3.1-§3.6 — this amendment's own estimate is that §3.7 adds proportionally to the file's length without changing the "readable in under a few minutes" target stated in §5, though the Implementation Plan/Spec Review should re-confirm this once a real draft exists, per §5's own "target, not hard limit" framing.

---

## Specification Gate

**SPECIFICATION — READY FOR REVIEW**

Not self-approved. This specification does not authorize implementation-plan writing to begin; Spec Review remains the next gate.
