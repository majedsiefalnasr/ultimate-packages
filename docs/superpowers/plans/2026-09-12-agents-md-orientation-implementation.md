# Implementation Plan — Root-Level `AGENTS.md` Orientation File

**Document:** `docs/superpowers/plans/2026-09-12-agents-md-orientation-implementation.md`
**Status:** Draft for Plan Review.
**Approved specification:** `docs/superpowers/specs/2026-09-12-agents-md-orientation-design.md` (amended, 7-section structure including AI Operating Rules — Spec Gate: APPROVED).
**Baseline:** `main` at `d391acf`.
**Required sequence (this document is the Implementation Plan step):** Research ✅ → Architecture Discussion ✅ → Decision ✅ → Specification ✅ → Spec Review ✅ → **Implementation Plan (this document)** → Plan Review → Implementation → Verification → Final Review/Closeout.

**Amendment Note (this pass):** the human's own Plan Review feedback explicitly authorized the `package.json` change this plan's Task 3 already required as mechanical wiring, closing the one open question flagged in the prior draft. This amendment makes the resulting **5-file implementation scope** — `AGENTS.md`, `README.md`, `scripts/provenance/validate-agents-md-pointers.mjs`, `package.json`, `.github/workflows/ci.yml` — explicit and consistent everywhere this plan states a file count or list, replacing every prior "4 files" reference. The authorization is scoped narrowly and exactly as granted: `package.json` may gain exactly one new entry in its `scripts` block (`"agents-md-pointers:validate": "node scripts/provenance/validate-agents-md-pointers.mjs"`) — no dependency, version, build-configuration, or other script change of any kind. No other section's substance is altered by this amendment.

**Amendment Note (post-implementation correction):** during Implementation (Task 1), the protected/do-not-reopen pointer this plan's own Task 1 labeled "Section 6" was instead built as its own standalone section, since folding it into another section would have collapsed the file's section *count* below the required 7. This shifted every subsequent section's number by one in the final, merged `AGENTS.md`. Task 1's own numbering below is corrected to match the as-built file exactly: **Section 5 = Protected decisions, Section 6 = Where to find things, Section 7 = AI Operating Rules.** This is an implementation-time correction to this document's own internal section labels, not a change to any approved functional scope — every binding content requirement Task 1 specifies is unchanged.

This plan does not implement anything. It does not create `AGENTS.md`, does not modify `README.md`, does not modify `package.json`, does not modify CI, and does not create the validation script. It defines the exact tasks a future, separately-authorized Implementation step must execute.

---

## Pre-planning inspection performed (evidence this plan is grounded on)

- **Current git state:** branch `main`, HEAD `d391acf`, working tree contains only prior uncommitted research/spec artifacts (`docs/architecture/research/2026-09-12-{ai-orientation-design,next-work-prioritization-audit,project-reality-and-ai-operating-model-audit}.md`, `docs/superpowers/specs/2026-09-12-agents-md-orientation-design.md`) — none of which this plan's own implementation touches.
- **Existing validation-script convention, confirmed by direct inspection:** `scripts/provenance/` contains 20 files matching `validate-*.mjs` (plus their `.test.mjs` siblings), every one following the identical shape: `#!/usr/bin/env node` shebang, a header comment naming the file and its purpose, `fail(message)`/`pass(message)` helpers printing `[<name>:validate] FAIL:`/`[<name>:validate] OK:` (confirmed verbatim in `validate-provenance.mjs:25-32` and `validate-install-script-policy.mjs:31-38`), `process.exit(1)` on failure and `process.exit(0)` on success at the end. Each is wired into root `package.json`'s `scripts` block as `"<name>:validate": "node scripts/provenance/validate-<name>.mjs"` (confirmed: `provenance:validate`, `boundary:validate`, `install-script-policy:validate`, `ceiling:validate`, `sast:validate`, `accessibility:validate`, `size:validate`, `coverage:validate` — 8 direct examples read from `package.json` lines 19-36), then invoked as one named step in `.github/workflows/ci.yml`'s main `ci` job (e.g. `- name: Provenance validation` / `run: pnpm run provenance:validate -- --base-ref origin/main`, `ci.yml:110-111`).
- **Decision this evidence settles (Planning Requirement 6):** the CI validation must be implemented as **one small standalone script**, matching this established convention exactly — not an inline CI step. Every one of the 20 existing checks in this repository uses a standalone script; none use inline shell logic embedded in the workflow file. Departing from this pattern for one new, narrow check would be the actual deviation requiring justification, not the reverse.
- **Exact current `README.md` "## Status" content** (confirmed by direct read, lines 7-9):
  ```markdown
  ## Status

  **Phase 0 — Repository Foundation, Provenance & Baseline Verification.** No component source has been migrated yet. See `docs/architecture/ROADMAP.md` for the full phase plan.
  ```
- **Exact CI job structure and insertion point:** the main `ci` job (`.github/workflows/ci.yml`, the job simply named `ci:`) runs, in order: Checkout → Fetch base ref → Setup pnpm/Node → Install dependencies → Dependency vulnerability scan → License scan → Install-script policy check → Lint → Format check → Typecheck → Build → Validate generated artifacts → Test → Determine affected packages → Pack/install integrity → CodeQL init/analyze → Resolve SARIF path → SAST baseline validation → Bundle-size measurement/regression check → Coverage measurement/regression check → **Provenance scripts self-tests → Provenance validation → Package boundary validation → Prime dependency-ceiling validation → Compatibility manifest validation → CLI package boundary validation → MCP package boundary validation → AI package boundary validation** (the job's final 8 steps, all small, single-purpose validation scripts in the same family this plan's new step joins). This is a distinct job from `track-a-browser-visual-a11y`/`track-e-ssr-hydration` (separate jobs, lines 138+, unrelated concerns) — the new step belongs in the main `ci` job, appended after the existing validation-script cluster, not in either separate job.
- **Available Superpowers skills, confirmed present in this environment** (referenced by this plan's own §3.7.2 content, never modified): `brainstorming`, `writing-plans`, `subagent-driven-development`, `verification-before-completion`, `finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `dispatching-parallel-agents`, `using-superpowers`, `executing-plans`, `writing-skills` — the exact names `AGENTS.md`'s §3.7.2 should reference by category, not restate the contents of.
- **Branch-naming evidence** (already established at Spec Review, re-confirmed here): no single convention exists (`phase-10-track-e-ssr-hydration`, `phase-6-component-metadata`, `worktree-uix-data-foundation` — three different shapes across this repository's own history). This plan's own Task 0 (below) asks the human, per `AGENTS.md`'s own approved rule, rather than assuming one.

---

## Global constraints (binding on every task below, restated from the approved specification, extended by the human's own Plan Review authorization)

- Exactly 5 files may be touched by this implementation, no more: `AGENTS.md` (new), `README.md` (the "## Status" section only), `scripts/provenance/validate-agents-md-pointers.mjs` (new), `package.json` (exactly one new `scripts` entry, per the human's own explicit, narrowly-scoped Plan Review authorization — see the Amendment Note above), and `.github/workflows/ci.yml` (exactly one new step).
- The `package.json` authorization is strictly limited to adding the single entry `"agents-md-pointers:validate": "node scripts/provenance/validate-agents-md-pointers.mjs"` to the `scripts` block. No dependency, devDependency, package version, build configuration, or any other existing or new script may be added or changed. Any implementer finding a reason to touch anything else in `package.json` must stop and escalate — this authorization does not extend to it.
- No file under `packages/ai/`, `packages/mcp/`, `packages/component-metadata/`, `packages/component-schema/`, `skills/`, `docs/architecture/BLUEPRINT.md`, `docs/architecture/DECISIONS.md`, or `docs/architecture/BLUEPRINT_GAPS.md` is touched. `docs/architecture/ROADMAP.md` itself is not touched (only `README.md`'s pointer to it).
- No vector database, embedding index, symbol index, or general link-checking dependency is added to any `package.json`.
- `AGENTS.md` contains exactly the 7 sections specified (spec §3), no more, no restated tracking-document content (spec §4).
- This plan does not reinterpret any of the specification's binding content decisions (the 8-tier hierarchy, the 7-section structure, the README correction constraint, the CI-check scope) — every task below implements the specification as written, citing the exact spec section it satisfies.

---

## Task 0 — Pre-implementation git/working-tree check and branch decision

**This is not optional preamble — it is the first task, per `AGENTS.md`'s own §3.7.1/§3.7.4 rules this very work item is building, applied to itself.**

**What to do:**
1. Run `git status --short` and `git branch --show-current` and confirm: current branch, exact working-tree state, and that the only pending changes are the pre-existing uncommitted research/spec/plan artifacts already known to exist (3 research artifacts, the approved spec, and this plan's own file) — no other unexpected change.
2. Confirm HEAD matches `d391acf` (the baseline this plan and its approved specification were written against) — if HEAD has moved, stop and re-verify the specification's baseline assumptions still hold before proceeding.
3. **Ask the human** whether to implement this work item on the current branch (`main`) or on a new task branch — per the approved specification's own §3.7.1 rule (direct work on `main` requires explicit authorization; branch naming has no established repository convention, so if a new branch is chosen, propose a name and let the human confirm or adjust it rather than asserting one as fixed).
4. Do not proceed to Task 1 until this branch decision is confirmed.

**Verification:** the confirmed branch name (or explicit "proceed on `main`" authorization) is recorded in this plan's own execution notes (or the SDD ledger, if this plan is executed via subagent-driven-development) before Task 1 begins.

**Acceptance criteria covered:** none directly (this is a process gate, not a spec-content task) — it exists to satisfy the Planning Requirements' own "pre-implementation Git/working-tree checks" and "branch handling according to `AGENTS.md` rules" items, applied reflexively before the file that states those rules even exists yet.

---

## Task 1 — Create `AGENTS.md`

**Depends on:** Task 0 (branch decided).
**Exact file:** `AGENTS.md` (new, repository root).

**Intended change:** create the file with exactly 7 top-level sections, in this order, each satisfying the exact binding content specified in the approved specification's §3 (cited per-subsection below). Exact prose wording is the implementer's choice; the substance below is binding.

### Section 1 — What Ultimate is (spec §3.1)
- 2-3 sentences, closely paraphrasing `docs/architecture/BLUEPRINT.md` §1's own stated goal: a company-owned, multi-framework UI platform (Angular/React/Vue, extensible), derived from MIT-licensed Prime ecosystem baselines, no required runtime dependency on Prime packages.
- **Pattern to follow:** `README.md`'s own opening paragraph (line 3) already states this correctly and concisely — the implementer should read it directly and may closely mirror its wording, since both documents are describing the same permanent fact from the same authoritative source (`BLUEPRINT.md` §1).
- **Must not contain:** any phase number, completion status, or current-state claim (that belongs in Section 6's pointer table, not here).

### Section 2 — Source-of-truth hierarchy (spec §3.2)
- The exact 8-tier list, in the exact order, from spec §3.2:
  1. Real repository evidence (source, tests, CI output, git history) — wins every disagreement, always.
  2. `docs/architecture/BLUEPRINT.md`.
  3. `docs/architecture/DECISIONS.md` (ADRs).
  4. Approved specs/plans (`docs/superpowers/specs/`, `docs/superpowers/plans/`).
  5. `docs/architecture/{BLUEPRINT_GAPS,ROADMAP,COMPONENT_INVENTORY,PERFORMANCE,MIGRATION}.md` — flagged as most likely stale.
  6. `docs/architecture/research/*.md` — point-in-time snapshots.
  7. `README.md` and general documentation — not authoritative for current state.
  8. AI context files / Skills / `llms.txt` / MCP — one-directional consumers, never authoritative upstream.
- Plus the tie-break rule verbatim in substance: when two sources disagree, resolve toward real evidence as the fact, then correct whichever lower-authority document was stale.
- **No deviation from this ordering or substance is permitted** — this is the specification's single most load-bearing content item; an implementer finding a reason to reorder or omit a tier must stop and escalate to Plan Review, not silently adjust.

### Section 3 — Workflow and approval gates (spec §3.3)
- The gate sequence stated plainly: Research → Verification → Architecture Discussion → Decision → Specification → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.
- The artifact-per-gate mapping: research → `docs/architecture/research/*.md`; architecture decision → an ADR in `DECISIONS.md`; specification → `docs/superpowers/specs/*.md`; plan → `docs/superpowers/plans/*.md`.
- The explicit, standalone rule: **discovering a task/gap/defect does not itself authorize implementation** — each gate boundary needs its own, separately granted authorization; a prior "yes" does not carry forward.
- A pointer to the protected/do-not-reopen category, naming that such markers exist and currently live in `docs/architecture/BLUEPRINT_GAPS.md` §5, without naming specific current instances.

### Section 4 — Verification model (spec §3.4)
- Define, distinctly: **implemented** (code exists, confirmed by reading source), **verified** (a check ran once and passed at that moment), **CI-enforced** (a `.github/workflows/ci.yml` script will fail the build on regression), **externally unexercisable** (requires a real external event — e.g. an actual npm publish, an actual branch-protection setting, an actual security advisory — honestly disclosed as unproven rather than falsely claimed or endlessly simulated).
- State these four are not interchangeable.
- Name where evidence of each kind typically lives: CI artifacts (ephemeral, e.g. `test-results/`), committed baseline docs (e.g. `docs/architecture/SAST_BASELINE.md`, `ACCESSIBILITY_BASELINE.md`, `PERFORMANCE.md`), dated research artifacts (`docs/architecture/research/*.md`).

### Section 6 — Pointer/index table (spec §3.6 as merged, originally numbered §3.5 — see Amendment Note above)
- A table with **only** file paths and one-line purposes, at minimum the 8 rows specified in spec §3.5 (phase/track status → `ROADMAP.md`; open gaps/decisions → `BLUEPRINT_GAPS.md`; architectural reasoning → `DECISIONS.md`; deep evidence → `docs/architecture/research/`; component facts → metadata/MCP/source; component coverage → `COMPONENT_INVENTORY.md`; performance baselines → `PERFORMANCE.md`; release/migration → `MIGRATION.md`).
- **No additional rows containing restated status/content** — any implementer-added row must be path+one-line-purpose only, matching the existing 8 exactly in shape.

### Section 5 — Protected/do-not-reopen category pointer (spec §3.5 as merged, originally numbered §3.6 — see Amendment Note above)
- A short statement (may be folded into Section 3 or kept standalone — non-architectural implementer choice) naming that architectural decisions can be explicitly protected against reopening without new evidence, pointing to `docs/architecture/BLUEPRINT_GAPS.md` §5 — without naming which decisions are currently so marked.

### Section 7 — AI Operating Rules (spec §3.7, added by the Spec Review amendment)
Five subsections, each concise (3-6 bullet points, matching the terse style of Sections 1-6):

**7.1 Git / branching** (spec §3.7.1):
- Inspect current branch and working-tree state before starting work; do not assume the current branch is correct.
- Unless task context already establishes the branch, ask the human: continue on current branch, or create/use a new one.
- Direct work on `main` requires explicit human authorization.
- Preserve existing uncommitted changes (the user's own, or another agent's) — never `reset --hard`/`clean -f`/`checkout --`/overwrite without confirming safety first.
- Any destructive git operation (force-push, hard reset, branch deletion, history rewrite) requires explicit authorization at the time needed — no carry-forward from a prior, different authorization.
- Pushing to a remote requires explicit authorization unless the task's own context already grants it.
- **State honestly:** no single branch-naming convention exists in this repository's history — naming is an implementation-level choice, not a fixed pattern to invent or assume.

**7.2 Superpowers usage** (spec §3.7.2):
- The gated workflow (Section 3 above) is intended to be executed using the appropriate Superpowers skill for each stage, when available — a working expectation, not optional reading.
- Point to (do not restate) the relevant skill category per stage — the implementer should name real, currently-available skill categories by their actual purpose (e.g., problem exploration/brainstorming, specification and plan authorship, subagent-driven execution, pre-completion verification, closeout) rather than inventing hypothetical category names; use whatever skills are actually present in the environment as the concrete reference, without hardcoding specific plugin-internal file paths that could move.
- Use the skill appropriate to the current stage; never invoke an unrelated one merely to satisfy a checklist.
- Using a skill never grants authorization to cross a human-approval gate on its own.
- **State explicitly:** if Superpowers is unavailable in the current environment, the workflow and its gates still apply — absence of the tool does not remove the gates.

**7.3 Git commits** (spec §3.7.3):
- **State the confirmed, real convention:** this repository's commits follow Conventional Commits shape, `type(scope): short description` (point to `git log` as the live example — do not restate a Conventional Commits tutorial or invent a different format).
- Do not commit merely because files changed — a commit corresponds to authorized work at an appropriate gate.
- Review `git status`/`git diff` before staging; never stage blindly.
- Never use `git add -A`/`git add .` as a default — stage only the current task's own intended files.
- Never include unrelated changes (the user's own in-progress edits, another agent's work) in a commit.
- Research/specification/plan artifacts wait for their own applicable approval gate before being committed.
- Never push without explicit authorization from the task's own context.

**7.4 Pre-work repository safety** (spec §3.7.4):
- Before modifying any file, establish: current branch, current working-tree status, existing relevant uncommitted changes, and the applicable task/spec/plan's current approval state — to avoid mistaking an existing dirty tree for one's own work or implementing against the wrong branch/state.

**7.5 Preserving the human-controlled model** (spec §3.7.5, restated for immediacy):
- Discovering a problem does not authorize fixing it.
- Finding a gap does not authorize implementing it.
- An approved specification does not authorize implementation before an approved, reviewed implementation plan exists.
- Approval for one task does not automatically authorize a different task.
- Surface ambiguity or conflicting evidence to the human rather than silently resolving an architectural question that belongs to them.

**Relevant existing pattern to follow for overall file tone/format:** this repository's own `docs/architecture/research/*.md` artifacts' "Status:"/"Purpose:" front-matter convention (a short, labeled preamble before the first numbered section) is a reasonable, already-established stylistic precedent for `AGENTS.md`'s own opening, though `AGENTS.md` itself is not a research artifact and should not adopt that convention's "Discovery snapshot" framing — it is a stable, durable file, and its own front matter (if any) should say so.

**Verification method:**
1. Read the finished file in full; confirm exactly 7 top-level sections exist, each matching its spec-cited content above, no additional sections.
2. Check against spec §4's negative-scope list — no phase status, no gap IDs, no ADR content, no component counts, no research-artifact content beyond a directory pointer, no enumeration of currently-protected decisions, no detailed git manual, no copied Superpowers skill content, no restated Conventional Commits tutorial.
3. Check total length against spec §5's ~200-400 line target — flag (do not silently accept) a substantial overage at Plan Review's own eventual verification pass, or in this task's own self-review if executed via subagent-driven-development.
4. Confirm every file path named in the pointer table (Section 6) actually exists on disk at implementation time — this is the exact condition Task 3's CI check will also verify mechanically going forward, but the implementer should confirm it manually once, at creation time, rather than relying solely on CI to catch a typo introduced during initial authoring.

**Acceptance criteria covered:** AC1, AC2, AC3, AC4, AC5, AC6a.

---

## Task 2 — Correct `README.md`'s stale "## Status" section

**Depends on:** Task 1 (so the corrected text can reference `AGENTS.md` by name, since the file now exists).
**Exact file:** `README.md` — exactly the "## Status" section (lines 7-9 as currently written), nothing else in the file.

**Intended change:** replace the current text —
```markdown
## Status

**Phase 0 — Repository Foundation, Provenance & Baseline Verification.** No component source has been migrated yet. See `docs/architecture/ROADMAP.md` for the full phase plan.
```
— with a pointer-only statement per spec §6's binding constraint: no specific phase number, no completion percentage, no other status claim that could itself go stale. Must retain the existing `ROADMAP.md` pointer and may additionally point to `AGENTS.md`. Spec §6's own illustrative (non-binding) shape:
```markdown
## Status

For current phase and track status, see `docs/architecture/ROADMAP.md`. For how to orient yourself in this repository — the source-of-truth hierarchy, the development workflow, and where to find current gaps and decisions — see `AGENTS.md`.
```

**Relevant existing pattern to follow:** the rest of `README.md`'s own existing sections (e.g., "## Provenance," line 36) already use exactly this pointer style ("Every Prime-derived source area... is recorded in `docs/architecture/PROVENANCE.md`...") — the implementer should match that same terse, pointer-first tone rather than inventing a new style for this one section.

**Scope boundary:** do not touch any other section of `README.md` (the opening description, "Repository structure," "Development," "Provenance," "License" — all unchanged).

**Verification method:**
1. `git diff README.md` shows changes confined to exactly the "## Status" section's own lines — nothing else in the file differs.
2. Confirm the replacement text contains no digit-based phase number and no completion-percentage claim (a simple visual/grep check: no standalone "Phase N" pattern, no "%" character in the new text).
3. Confirm the `ROADMAP.md` pointer is retained.

**Acceptance criteria covered:** AC6.

---

## Task 3 — Create the CI path-existence validation script

**Depends on:** Task 1 (the script validates `AGENTS.md`'s actual pointer table, so the table's real shape must exist first).
**Exact file:** `scripts/provenance/validate-agents-md-pointers.mjs` (new).

**Intended change:** a script following the exact structural pattern of `scripts/provenance/validate-install-script-policy.mjs` (the smallest, simplest existing example in this family — used here as the direct template rather than the larger `validate-provenance.mjs`, since this new check's own scope is comparably narrow):

- `#!/usr/bin/env node` shebang, header comment naming the file and stating its narrow scope in the same disclosed style `validate-install-script-policy.mjs`'s own header uses (e.g., "deliberately narrow: verify every file path referenced in AGENTS.md's pointer/index table exists on disk — does not check prose accuracy, does not check any other document's links").
- `fail(message)` / `pass(message)` helpers, printing `[agents-md-pointers:validate] FAIL: ...` / `[agents-md-pointers:validate] OK: ...` (matching the exact bracketed-prefix convention every existing script in this family uses).
- Logic: read `AGENTS.md`, extract the Section 6 pointer table's referenced paths (parse the Markdown table rows, extracting the path from each row's "See" column — a small, targeted parse, not a general Markdown parser), and for each extracted path, confirm it exists on disk (`existsSync`) — a directory reference (e.g. `docs/architecture/research/`) is checked for directory existence, a file reference for file existence.
- On any missing path: `fail()` with a message naming the specific missing path (e.g., `AGENTS.md pointer table references "docs/architecture/FOO.md", which does not exist`), matching the existing family's convention of specific, actionable failure messages (`validate-provenance.mjs:35`, `:43`, `:69` are the direct examples to match in tone/specificity).
- On success: `pass()` naming how many paths were checked, then `process.exit(0)`.
- **Explicitly out of scope for this script** (per spec §7's own binding exclusions): no check of `AGENTS.md`'s prose accuracy, no check of any link outside `AGENTS.md`'s own Section 6 table, no check of pointer-table *completeness* (a missing row that should exist is not flagged, only an existing row's broken target), no Markdown lint beyond the table-parsing this script needs to do its own job.

**Relevant existing pattern to follow:** `validate-install-script-policy.mjs`'s own `readFileIfExists` helper (lines 40-43) and its overall single-file, no-external-dependency shape — this new script should be similarly self-contained (Node's built-in `node:fs` only, no new npm dependency), matching every existing script in this family.

**Root `package.json` addition (explicitly authorized by the human at Plan Review, scoped exactly as follows):** one new script entry, `"agents-md-pointers:validate": "node scripts/provenance/validate-agents-md-pointers.mjs"`, added to the same `scripts` block section (alongside the other `*:validate` entries, e.g. near `install-script-policy:validate`/`ceiling:validate`), matching the exact naming pattern (`<check-name>:validate`) every existing entry follows. This is the **only** change this task (or any task in this plan) makes to `package.json` — no dependency, devDependency, version, or other script is added, removed, or modified.

**Verification method (must be performed, not merely asserted, per the specification's own AC7):**
1. Run `node scripts/provenance/validate-agents-md-pointers.mjs` against the real, just-created `AGENTS.md` — confirm it passes (all real paths exist).
2. **Deliberately break it:** temporarily edit one row of `AGENTS.md`'s pointer table to reference a nonexistent path (e.g., `docs/architecture/DOES-NOT-EXIST.md`), re-run the script, confirm it fails with a message specifically naming that exact path — not a generic failure.
3. Revert the deliberate break, confirm `AGENTS.md` is back to its correct, real state (`git diff AGENTS.md` shows no residual change from this verification step), re-run the script, confirm it passes again.
4. This before/break/after sequence is the direct evidence for spec AC7 ("verified by a deliberate temporary break... proving the check has real detection power, not a vacuous pass") — the Implementation step's own report must include this exact evidence, not merely claim the check "should work."

**Acceptance criteria covered:** AC7 (script-level verification; CI-level wiring is Task 4), AC10 (no new dependency added — confirm `package.json`'s `dependencies`/`devDependencies` are unchanged by this task, only the explicitly-authorized `scripts` block entry is added).

---

## Task 4 — Wire the validation script into CI

**Depends on:** Task 3 (the script and its `package.json` entry must exist first).
**Exact file:** `.github/workflows/ci.yml` — exactly one new step in the main `ci` job, nothing else in the file.

**Intended change:** append one new step to the main `ci` job's existing step sequence, immediately after the last existing validation-script step (`AI package boundary validation`, currently the job's final step per this plan's own pre-planning inspection above) — placing the new step in the same cluster as the 8 existing small validation-script steps it structurally matches, rather than earlier in the job (before Build/Test) or in either of the two separate Track A/E jobs (which solve unrelated concerns).

```yaml
      - name: AGENTS.md pointer validation
        run: pnpm run agents-md-pointers:validate
```

**Relevant existing pattern to follow:** the immediately preceding step's own exact shape —
```yaml
      - name: AI package boundary validation
        run: pnpm run boundary:validate:ai
```
— a two-line `name:`/`run:` pair with no additional `env:`/`with:`/conditional logic, matching every other step in this job's own validation cluster (none of the 8 existing sibling steps use `--base-ref` or any other flag except `provenance:validate`, `size:validate`, and `coverage:validate`, which need git-diff context this new check does not — the new step should be the simplest possible shape, matching `boundary:validate`'s own zero-flag invocation, not the 3 checks that happen to need one).

**Scope boundary:** do not modify any existing step in `ci.yml`, do not create a new job, do not touch `track-a-browser-visual-a11y` or `track-e-ssr-hydration`'s job definitions.

**Verification method:**
1. `git diff .github/workflows/ci.yml` shows exactly one new step appended, no existing line altered or removed.
2. Confirm the new step's `run:` command exactly matches the `package.json` script name added in Task 3.
3. A full local dry-run of the command itself (`pnpm run agents-md-pointers:validate`) was already proven to pass/fail correctly in Task 3's own verification — this task does not need to re-run the break/revert sequence, only confirm the CI step invokes the same, already-verified command correctly.

**Acceptance criteria covered:** AC7 (CI-level wiring, completing what Task 3 began at the script level), AC8 (this is the last of the exactly-5 files the whole implementation touches).

---

## Task 5 — Whole-diff verification and final review

**Depends on:** Tasks 1-4 all complete.

**What to verify, in order:**
1. `git status --short` — confirm exactly 5 changed/new files, no more, no fewer: `AGENTS.md` (new), `README.md` (modified), `scripts/provenance/validate-agents-md-pointers.mjs` (new), `package.json` (modified — exactly the one new `scripts` entry authorized at Plan Review), `.github/workflows/ci.yml` (modified — exactly one new step).
2. `git diff --stat` — confirm no file outside this 5-file set appears.
3. `git diff package.json` specifically — confirm the only change is the single new `scripts` entry (`"agents-md-pointers:validate": ...`); confirm no `dependencies`/`devDependencies`/version/other-script line differs from the baseline. This is a distinct, explicit check because `package.json`'s authorization is narrower than the other 4 files' — the other 4 are authorized for their whole intended change, `package.json` is authorized for exactly one line.
4. Re-read `AGENTS.md` in full one more time against spec §3's 7-section structure and §4's negative-scope list, as a final self-review distinct from Task 1's own per-task verification.
5. Re-run the full break/revert sequence from Task 3 one final time against the final, fully-assembled state (all 5 files in place together) — not just Task 3's own isolated check — to confirm nothing about Task 2's or Task 4's own changes altered the validation script's behavior.
6. Confirm no file under any of the explicitly excluded paths (spec §2.2 / AC9) appears in the diff: `packages/ai/`, `packages/mcp/`, `packages/component-metadata/`, `packages/component-schema/`, `skills/`, `docs/architecture/BLUEPRINT.md`, `docs/architecture/DECISIONS.md`, `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md`.
7. Confirm no new dependency was added to any `package.json`'s `dependencies`/`devDependencies` (AC10) — only the one, explicitly-authorized new `scripts` entry.
8. Confirm the working tree still contains its own pre-existing, unrelated uncommitted files (the 3 research artifacts, the spec, this plan) exactly as they were before this Implementation step began — per `AGENTS.md`'s own §3.7.1/§3.7.4 rules (which this very file now states), this Implementation step must not disturb them.

**What NOT to do:**
- Do not commit at the end of this task. Per the approved specification's own AI Operating Rules content (which this plan's Task 1 creates) and this session's own established practice throughout every prior task in this work item's history, committing is its own separately authorized action, requested explicitly after the human reviews the finished, verified diff — never bundled automatically into "implementation complete."

**Acceptance criteria covered:** AC8, AC9, AC10 (final, whole-diff confirmation of all three).

---

## Commit-message convention for the eventual commit (informational — no commit is authorized by this plan)

Per this repository's own confirmed Conventional Commits convention (re-stated here for the record, matching what `AGENTS.md`'s own Task 1 §3.7.3 content will say), an eventual commit — **only once separately authorized** — should follow the shape `docs(agents-md): add root-level AGENTS.md orientation file` or equivalent, scoped as `docs` (this is a documentation/orientation artifact, matching the existing `docs(architecture): ...`/`docs(track-e): ...` pattern for prior similar work in this exact session's own history) with a scope naming the artifact (`agents-md`, matching the file's own name, mirroring how `docs(track-e):`/`docs(id-fix):` scope by subject rather than by directory).

---

## Dependencies and sequencing summary

- Task 0 → Task 1 (branch must be decided before any file is touched).
- Task 1 → Task 2 (README's replacement text references `AGENTS.md` by name).
- Task 1 → Task 3 (the validation script parses `AGENTS.md`'s real, finished pointer table).
- Task 3 → Task 4 (CI step needs the script and its `package.json` entry to exist first).
- Tasks 1-4 → Task 5 (whole-diff verification requires everything else complete).

No task is parallelizable with another in this plan — each genuinely depends on the previous, unlike Track E's own Tasks 1-4, which were independent. This is a small enough work item that sequential single-implementer execution (or a single subagent-driven-development pass with one implementer per task, run in strict order) is appropriate; parallel dispatch would not save meaningful time and would risk Task 2/3 being written against a not-yet-finalized `AGENTS.md`.

---

## Plan Review Gate

**IMPLEMENTATION PLAN — READY FOR REVIEW**

Not self-approved. This plan does not authorize implementation to begin; Plan Review remains the next gate.
