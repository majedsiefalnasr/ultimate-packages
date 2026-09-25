# Implementation Plan: Phase 10 Track D — Operational Documentation

**Document:** `docs/superpowers/plans/2026-09-09-phase-10-operational-documentation-implementation.md`
**Status:** Complete — implemented and merged (Track D); Phase 10 marked Complete in `docs/architecture/ROADMAP.md` and GAP-011 PARTIALLY RESOLVED (SECURITY.md/CHANGELOG.md shipped) in `docs/architecture/BLUEPRINT_GAPS.md`.
**Approved specification:** `docs/superpowers/specs/2026-09-09-phase-10-operational-documentation-design.md` (Status: Draft for review per this repository's D6 convention — approved at Spec Review, header text unchanged; see spec §9/D6)
**Baseline:** `main` at `6428d01` (Track B — CI/Security/Quality Gates, merged)

**Status detail:** This document contains no implementation. It defines tasks only. All requirement IDs (R1-R4), decision IDs (D1-D6), and acceptance criteria (AC1.x-AC6.x) below refer to the approved specification and are not redefined here — this plan does not reopen or redesign any approved decision. Where a task's acceptance criteria are restated, they are restated verbatim from the specification for implementer convenience, not reinterpreted.

---

## 1. Task List Overview

| Task | Deliverable | Spec requirement | Depends on |
|---|---|---|---|
| Task 1 | `/SECURITY.md` | R1 | None |
| Task 2 | `/CHANGELOG.md` | R2 | None |
| Task 3 | `docs/architecture/DECISIONS.md` (ADR-044 append) | R4 | None |
| Task 4 | `docs/architecture/BLUEPRINT_GAPS.md` (GAP-011 status field only) | §9 bookkeeping row 2 | Soft: informed by Tasks 1-2 landing (see Task 4 note) |
| Task 5 | `README.md` (≤2 pointer lines) | §9 bookkeeping row 5 | Hard: Tasks 1 and 2 (files must exist before pointing to them) |
| Task 6 | Whole-track verification | AC6.1, AC6.2, all ACs | All of Tasks 1-5 |

Tasks 1, 2, and 3 have no ordering dependency on each other and may be implemented independently or in parallel (spec §8: "R1, R2, R4 have no ordering dependency on each other"). Task 4 is sequenced after Tasks 1-2 only so its status text can truthfully say the files exist — it does not modify or depend on their content. Task 5 hard-depends on Tasks 1-2 (it links to files that must exist first). Task 6 is strictly last.

No task in this plan creates a CONTRIBUTING.md, touches any Track A/B/C/E scope, modifies ROADMAP.md, modifies GAP-031/032/033, modifies any other spec/plan/research header, adds any dependency/script/CI step, or touches any source file — per spec §6/§11 (Non-Goals / Explicit Out-of-Scope), restated as binding constraints on every task below.

---

## Task 1 — Create `/SECURITY.md`

**Objective:** Satisfy R1 in full: a root-level operational document describing Track B's real, already-implemented security process, using GitHub's native private-advisory disclosure mechanism, with no invented contact/SLA/organization, and with the three-way distinction between automated detection, disclosure, and duplicate handling required by R1 item 4.

**Files to touch:** `/SECURITY.md` (new file, repository root only).

**Prerequisite:** None.

**Implementation steps:**
1. Re-verify immediately before writing (repository state may have shifted since spec approval — spec §3 facts must be re-confirmed, not assumed):
   - `package.json` (root) still has no `repository`, `bugs`, or `author` field (confirms D1's placeholder-URL basis still holds).
   - The four Track B script names are still exactly: `audit:validate`, `license:validate`, `sast:validate`, `install-script-policy:validate` (grep `package.json`'s `scripts` block).
   - `docs/architecture/SAST_BASELINE.md` still exists at that path (R1 item 7's cross-reference target).
2. Write `/SECURITY.md` with exactly the 9 sections R1 enumerates (spec §5, R1 items 1-9):
   1. Supported versions — states pre-`1.0.0`, all packages at `0.1.0`, no formal support-window policy. No fabricated version table.
   2. Reporting a Vulnerability — GitHub private Security Advisory mechanism per D1, URL pattern `https://github.com/<owner>/<repo>/security/advisories/new` with `<owner>/<repo>` as a literal placeholder token (not a real org/repo name — none exists in `package.json` to source it from).
   3. What is in scope — `@ultimate/*` package source, `scripts/` CI/build tooling, `.github/workflows/` CI pipeline itself.
   4. Automated detection vs. disclosure vs. duplicate handling — three distinct, clearly separated subsections exactly as amended in spec R1 item 4 (spec lines 106-109): automated detection is preventive scanning, not a disclosure channel; disclosure remains open to any suspected vulnerability regardless of what automation might also catch; duplicate handling acknowledges and links to an existing tracked finding but never states or implies non-reportability. Do not use "out of scope" or "not treated as a report" language for any vulnerability class.
   5. Relationship to dependency scanning — one paragraph on `audit:validate` (`pnpm audit --audit-level high --prod`).
   6. Relationship to license scanning — one paragraph on `license:validate` (`license-checker-rseidelsohn`), noted as grouped under Blueprint §29 but not itself a vulnerability mechanism.
   7. Relationship to SAST/CodeQL — one paragraph on `sast:validate`/CodeQL `security-extended`/`.github/codeql/codeql-config.yml`, linking to `docs/architecture/SAST_BASELINE.md` rather than re-explaining its grandfathering contract.
   8. Relationship to the malicious-install-script policy — one paragraph on `install-script-policy:validate` (`scripts/provenance/validate-install-script-policy.mjs`).
   9. Patch/advisory process — states plainly no automated advisory-publication mechanism exists; a confirmed vulnerability is patched via a normal PR through Track B's CI gates, noted in CHANGELOG.md once Track C exists, or in PR/commit history until then.
3. Apply R1's non-requirement constraint throughout drafting: no response-time/SLA language, no named person/team/email, no claimed automation that does not exist (e.g., do not claim advisories auto-publish).

**Verification:**
- `test -f SECURITY.md` (exists at root, not under `.github/` or `docs/`).
- `grep -c "^## " SECURITY.md` shows at least 9 top-level subsections matching the 9 items above.
- `grep -n "audit:validate\|license:validate\|sast:validate\|install-script-policy:validate" SECURITY.md` — all four appear, and each string is separately grep-verified to exist verbatim in `package.json`'s `scripts` block (`grep -n '"audit:validate"\|"license:validate"\|"sast:validate"\|"install-script-policy:validate"' package.json`) — confirms AC1.3's "grep-verifiable against `package.json`'s real script definitions."
- `grep -in "advisories/new" SECURITY.md` — confirms the correct URL pattern is present.
- `grep -inE "@[a-z0-9.]+\.[a-z]{2,}" SECURITY.md` — must return no matches (no email address anywhere) — confirms AC1.2/AC1.5.
- `grep -inE "within [0-9]+ (hour|day|business day)" SECURITY.md` — must return no matches — confirms AC1.4.
- `grep -in "out of scope\|not treated as a report" SECURITY.md` in the context of vulnerability classes — must not appear in a form that discourages reporting (manual read-check, since grep alone can't distinguish intent — read the "Automated detection vs. disclosure" section directly and confirm it matches spec R1 item 4's three-way structure).

**Acceptance criteria traceability:** AC1.1, AC1.2, AC1.3, AC1.4, AC1.5 (spec §10).

---

## Task 2 — Create `/CHANGELOG.md`

**Objective:** Satisfy R2 in full: a root-level, fresh-start (no backfilled history) changelog scaffold with an `## [Unreleased]` section, documenting the Keep-a-Changelog category convention as a manual human-facing layer explicitly distinct from the installed Changesets generator's real output shape, per D2's Spec-Review-verified correction.

**Files to touch:** `/CHANGELOG.md` (new file, repository root only).

**Prerequisite:** None.

**Implementation steps:**
1. Re-verify immediately before writing: `.changeset/config.json` still configures `"changelog": "@changesets/cli/changelog"`, and the installed package is still `@changesets/changelog-git` (re-check `pnpm-lock.yaml` for `@changesets/changelog-git@` — a version bump wouldn't change the flat-bullet-output finding, but confirm the package itself hasn't been swapped since spec approval).
2. Write `/CHANGELOG.md` with exactly the 4 elements R2 enumerates (spec §5, R2 items 1-4, as amended):
   1. Header explaining the file's purpose and its Changesets-driven update mechanism (once Track C implements it), citing `.changeset/config.json`'s existing configuration.
   2. The five Keep-a-Changelog categories (`Added`, `Changed`, `Fixed`, `Removed`, `Security`), explicitly labeled as a manual, human-facing readability convention — explicitly stating this is NOT the output shape of the installed `@changesets/changelog-git` generator (which emits flat per-changeset bullet lines with no categories), and explicitly stating that reconciling the two, or replacing/configuring a different generator, is a Track C decision outside Track D's scope.
   3. Exactly one `## [Unreleased]` section header, no entries beneath it, no dated version sections above or below it.
   4. An explicit ownership note: entries below `## [Unreleased]` are populated exclusively by the Changesets release flow (Track C) once it exists, never hand-written outside that flow.
3. Do not implement, configure, or invoke any Changesets release command as part of this task — this task only authors the static Markdown file.

**Verification:**
- `test -f CHANGELOG.md` (exists at root).
- `grep -c "^## \[Unreleased\]$" CHANGELOG.md` equals exactly 1.
- `grep -cE "^## \[[0-9]" CHANGELOG.md` equals 0 (no dated version sections).
- `grep -in "Phase [0-9]" CHANGELOG.md` — must return no matches referring to historical phase changes as changelog entries (confirms AC2.4's "no fabricated historical entries"; a passing mention in the header prose explaining the fresh-start rationale is acceptable, an actual `### Phase N` entry is not — manual read-check to disambiguate).
- `grep -in "changesets/changelog-git\|does not match\|not the output\|is NOT the output" CHANGELOG.md` — confirms the required disclaimer text is present (AC2.3's "explicitly states this does NOT match the installed... generator's real flat-bullet output").
- `grep -in "Track C" CHANGELOG.md` — confirms the ownership/reconciliation note references Track C, not Track D, as owning generator reconciliation and real version entries.

**Acceptance criteria traceability:** AC2.1, AC2.2, AC2.3, AC2.4 (spec §10).

---

## Task 3 — Append ADR-044 to `docs/architecture/DECISIONS.md`

**Objective:** Satisfy R4 in full: record DECISION-A (Track A's Storybook+Playwright tooling choice) as a new ADR entry, transcribing the architecture discussion's own pre-drafted wording, following the file's exact existing convention, without inventing new rationale and without adding any other ADR.

**Files to touch:** `docs/architecture/DECISIONS.md` (append only — no edits to any existing entry).

**Prerequisite:** None (independent of Tasks 1-2).

**Implementation steps:**
1. **Re-verify the highest existing ADR number immediately before writing** (spec R4's explicit instruction, since intervening work could theoretically add one after spec approval): `grep -n "^## ADR-" docs/architecture/DECISIONS.md | tail -1`. At time of spec authorship this was `ADR-043`; confirm it is still the highest before assigning `ADR-044`. If a higher ADR now exists, use the next sequential number after whatever is actually highest and note the renumbering in the task's own completion notes — do not silently assume `044`.
2. Read the architecture discussion's exact pre-drafted wording: `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md`, "Proposed ADR wording (architectural level only)" subsection (spec §5 R4 cites this as the sole content source):
   > **ADR-XXX — Phase 10 testing/documentation tooling: Storybook + Playwright, distinct responsibilities**
   > Storybook is adopted as the platform's component documentation/testing surface (Blueprint §27) and as the mechanism for visual-regression coverage (§28). Playwright is adopted as the mechanism for real-browser and cross-browser interaction testing (§28/§31) and for SSR/hydration verification (§31) once a minimal servable harness exists (see the SSR/GAP-008 scope decision, §5). The two tools have non-overlapping primary responsibilities and both remain additive to the existing Vitest/jsdom/TestBed unit-and-component testing tier, which is unchanged. Specific screenshot-diff mechanism, CI job structure, and per-framework Storybook instance topology are deferred to Specification.
3. Transcribe this into `DECISIONS.md`'s exact existing format (matching ADR-043's shape: `## ADR-NNN — <title>` heading, then a "Status: Accepted (...)" lead sentence, then prose) — replace `ADR-XXX` with the real number from step 1, and open with `Status: Accepted (architecture discussion 2026-09-08-phase-10-architecture-discussion.md §2).` before continuing with the transcribed paragraph. Do not add, remove, or rephrase substantive content beyond this minimal header adaptation — this is a transcription task, not new drafting.
4. Append after the current final entry. Do not edit any existing `## ADR-` entry.

**Verification:**
- `grep -n "^## ADR-" docs/architecture/DECISIONS.md` — exactly one new heading beyond the pre-task list, sequentially numbered.
- `git diff docs/architecture/DECISIONS.md` — confirms the diff is purely additive (no existing lines removed or altered), matching AC4.3's "confirmed by diff — exactly one new `## ADR-` heading."
- Manual side-by-side read against the architecture discussion's "Proposed ADR wording" block — confirms substance is transcribed, not re-derived (AC4.2).

**Acceptance criteria traceability:** AC4.1, AC4.2, AC4.3 (spec §10).

---

## Task 4 — Update GAP-011 status in `docs/architecture/BLUEPRINT_GAPS.md`

**Objective:** Satisfy spec §9's bookkeeping row for GAP-011: update only the `Status:` field from `MISSING` to `PARTIALLY RESOLVED`, with rationale distinguishing Track C's still-open Blueprint §21 release-automation expectation from D4's already-settled CONTRIBUTING.md exclusion — without rewriting GAP-011's existing title or "Recommended resolution direction" prose, and without touching any other GAP entry.

**Files to touch:** `docs/architecture/BLUEPRINT_GAPS.md` — GAP-011's `Status:` line only (currently line 211: `- **Status:** MISSING`), plus at most one short rationale addition immediately adjacent to that field (not a rewrite of "Current evidence," "Expected state," or "Recommended resolution direction," all of which stay as pre-existing text).

**Prerequisite:** Soft — sequenced after Tasks 1-2 so the status text can accurately state SECURITY.md/CHANGELOG.md now exist. Does not read or depend on their content, only their existence.

**Implementation steps:**
1. Re-read the exact current GAP-011 block (`docs/architecture/BLUEPRINT_GAPS.md:210-223`) immediately before editing, to confirm line numbers/content have not shifted since spec approval.
2. Change only the `- **Status:** MISSING` line to `- **Status:** PARTIALLY RESOLVED`.
3. Immediately below the `Status:` line (or as a clearly delimited addition within that same bullet, not replacing "Current evidence"/"Expected state"/"Recommended resolution direction"), add one short rationale note stating:
   - SECURITY.md and CHANGELOG.md now exist (Track D, R1/R2), resolving that portion.
   - Blueprint §21's Changesets-driven release-automation expectation remains open — Track C's scope, not resolved by Track D.
   - CONTRIBUTING.md is explicitly excluded per D4 (not a Blueprint requirement) — this is a settled, closed decision, not outstanding work.
4. Do NOT modify GAP-011's title (line 210), "Current evidence" (line 214), "Expected state" (line 215), "Why it matters" (line 216), "What it blocks" (line 217), "Dependencies" (line 218), "Existing reusable infrastructure" (line 220), "Recommended resolution direction" (line 221), "Source/evidence" (line 222), or "Architectural decision required" (line 223) — these remain exactly as they are, including the pre-existing CONTRIBUTING.md mentions in the title and "Recommended resolution direction," per spec §9's explicit instruction not to fix that discrepancy here.
5. Do NOT touch any other `#### GAP-` entry in the file (GAP-012 and all others remain byte-identical).

**Verification:**
- `git diff docs/architecture/BLUEPRINT_GAPS.md` — confirms changes are confined to GAP-011's status line plus the one rationale addition; no other GAP block appears in the diff.
- `grep -n "^#### GAP-" docs/architecture/BLUEPRINT_GAPS.md | wc -l` before and after — identical count (no GAP added/removed).
- `grep -A1 "GAP-011" docs/architecture/BLUEPRINT_GAPS.md | grep "Status:"` shows `PARTIALLY RESOLVED`.
- Manual read-check: GAP-011's title still literally contains "CONTRIBUTING.md" unchanged (confirms the pre-existing discrepancy was left alone, not silently fixed).
- `diff` against a pre-task snapshot of GAP-012 through the end of file — byte-identical (confirms AC5.2).

**Acceptance criteria traceability:** AC5.1, AC5.2 (spec §10).

---

## Task 5 — Add pointer lines to `README.md`

**Objective:** Satisfy spec §9's bookkeeping row for README.md: add at most two new lines pointing to the newly created SECURITY.md/CHANGELOG.md, without touching the pre-existing stale "Phase 0" Status section or any other README content.

**Files to touch:** `README.md` — additive only, under the existing `## Provenance`/`## License` sections (or as its own minimal addition adjacent to them) — no edits to the `## Status` section (lines 7-9) or any other existing section.

**Prerequisite:** Hard — Tasks 1 and 2 must be complete first (this task links to files that must actually exist).

**Implementation steps:**
1. Re-confirm `SECURITY.md` and `CHANGELOG.md` both exist at repo root (Tasks 1-2 complete).
2. Add exactly one line pointing to `SECURITY.md` and exactly one line pointing to `CHANGELOG.md` — placed near the existing `## Provenance`/`## License` sections (README.md:34-39) as the most natural existing home for root-document pointers, e.g. as two added lines (not a new `##` section header, to keep the change minimal — a single added line under each existing heading, or two lines grouped together immediately before `## Provenance`, whichever reads more naturally against the file's existing prose style once read in context).
3. Do not modify README.md's `## Status` section (lines 7-9, "Phase 0 — Repository Foundation...") — leave byte-identical.
4. Do not modify `## Repository structure` or `## Development` sections.

**Verification:**
- `git diff README.md` — confirms exactly ≤2 added lines, zero removed lines, zero lines changed elsewhere in the file.
- `grep -c "SECURITY.md\|CHANGELOG.md" README.md` — at least 2 (one mention each, minimum).
- `sed -n '7,9p' README.md` before and after — byte-identical (confirms the Status section is untouched).

**Acceptance criteria traceability:** AC5.3 (spec §10).

---

## Task 6 — Whole-Track Verification

**Objective:** Confirm Track D's implementation, taken as a whole, matches the approved specification exactly — no scope creep, no excluded file touched, no dependency/script/CI/source change introduced, full repository validation still green, and every acceptance criterion in spec §10 objectively satisfied.

**Files to touch:** None (verification only — read-only checks and one `git status`/`git diff` inspection; no edits).

**Prerequisite:** All of Tasks 1-5 complete.

**Implementation steps / checks:**

1. **Exact changed-file allowlist check (AC6.2):**
   ```bash
   git status --porcelain
   git diff --stat
   ```
   Confirm the complete set of touched files is exactly:
   - `SECURITY.md` (new)
   - `CHANGELOG.md` (new)
   - `docs/architecture/DECISIONS.md` (modified, append-only)
   - `docs/architecture/BLUEPRINT_GAPS.md` (modified, GAP-011 only)
   - `README.md` (modified, ≤2 lines)
   - `docs/superpowers/plans/2026-09-09-phase-10-operational-documentation-implementation.md` (this plan document itself, untracked/new — not part of the "Track D deliverable" allowlist per se, but expected to exist as the SDD artifact)

   Any file outside this list appearing in the diff is a hard failure — stop and investigate before proceeding.

2. **Confirmation no excluded file was modified (spec §11):**
   ```bash
   git diff --stat | grep -E "ROADMAP\.md|CONTRIBUTING\.md|\.github/workflows/|scripts/provenance/|package\.json|pnpm-lock\.yaml|\.changeset/"
   ```
   Must return no matches. Also explicitly confirm:
   - No `CONTRIBUTING.md` file exists (`test ! -f CONTRIBUTING.md`) — AC3.1.
   - `docs/architecture/ROADMAP.md` untouched (`git diff docs/architecture/ROADMAP.md` empty) — AC5.4.
   - No other GAP entry in `BLUEPRINT_GAPS.md` besides GAP-011 changed — AC5.2 (re-confirm from Task 4's own check).
   - No spec/research/plan document's `Status:` header line changed anywhere in the repo (`git diff -- '**/specs/*.md' '**/research/*.md' '**/plans/*.md' | grep "^-.*Status:"` — must return no matches, or only additions, never a removed `Status:` line) — AC5.5.

3. **Confirmation no new dependency/script/CI change introduced:**
   ```bash
   git diff package.json pnpm-lock.yaml .github/workflows/ci.yml .github/codeql/codeql-config.yml
   ```
   All four must show zero diff (empty output) — Track D touches none of them.

4. **Full repository validation still green (AC6.1):**
   ```bash
   source ~/.nvm/nvm.sh && nvm use v22.22.2
   pnpm run test
   ```
   Exit code 0, all package suites report passed — confirms Track D's purely-additive-documentation changes did not regress anything (expected trivially, since no source file changed, but must be confirmed empirically per this repository's established trust-but-verify discipline, not assumed).

5. **Documentation consistency checks:**
   - Re-read `SECURITY.md` and confirm every script name it cites (`audit:validate`, `license:validate`, `sast:validate`, `install-script-policy:validate`) still exactly matches `package.json`'s real script definitions at verification time (not just at Task 1's authoring time — re-verify, since this is the final gate).
   - Re-read `CHANGELOG.md` and confirm it still accurately describes the installed Changesets generator (`.changeset/config.json` + installed `@changesets/changelog-git` package) — re-check `pnpm-lock.yaml` has not changed the installed changelog package between Task 2 and this verification.
   - Re-read `docs/architecture/DECISIONS.md`'s new ADR entry and confirm its assigned number is still the correct "next sequential" one (no other ADR was added concurrently during Tasks 1-5 that would make the assigned number wrong).
   - Re-read `docs/architecture/BLUEPRINT_GAPS.md` GAP-011 and confirm the title/"Recommended resolution direction" text is still byte-identical to its pre-Track-D content (only `Status:` and the added rationale differ).
   - Confirm this plan document's own header still reads `Status: Draft for review` (per D6 — this repository's convention, not to be "fixed" post-implementation) and that no other track's spec/plan header was touched.

6. **Full acceptance-criteria sweep** — walk spec §10 top to bottom (AC1.1 through AC6.2) and confirm each is satisfied by the checks above or by the individual task's own verification section; record any exception found.

**Verification:** All six steps above pass with no unexpected diff, no regression, no excluded file touched, no acceptance criterion failed.

**Acceptance criteria traceability:** AC1.1-AC1.5, AC2.1-AC2.4, AC3.1-AC3.2, AC4.1-AC4.3, AC5.1-AC5.5, AC6.1-AC6.2 — the complete spec §10 list, closed out here as a final cross-task check (individual tasks already verify their own subset; this task re-confirms the whole).

---

## 2. Dependency / Sequencing Summary

```
Task 1 (SECURITY.md)   ─┐
Task 2 (CHANGELOG.md)  ─┼─ independent, parallelizable ─→ Task 4 (GAP-011 status) [soft-depends: files should exist]
Task 3 (ADR-044)       ─┘                                 Task 5 (README pointers) [hard-depends: Tasks 1+2]
                                                                    ↓
                                                            Task 6 (whole-track verification) — strictly last
```

Recommended implementation order for a subagent-driven pass: Tasks 1, 2, 3 in parallel (or any order — no shared file, no ordering dependency per spec §8) → Task 5 (needs 1+2) and Task 4 (best done after 1+2 for accurate status text, though not a hard file-level dependency) → Task 6 last, unconditionally.

## 3. Expected Changed-File Allowlist (final)

- `SECURITY.md` — new
- `CHANGELOG.md` — new
- `docs/architecture/DECISIONS.md` — modified (ADR-044 appended)
- `docs/architecture/BLUEPRINT_GAPS.md` — modified (GAP-011 status field + short rationale only)
- `README.md` — modified (≤2 added lines)
- `docs/superpowers/plans/2026-09-09-phase-10-operational-documentation-implementation.md` — this plan itself (SDD artifact)

No other file may appear in `git diff --stat` once Track D's implementation is complete.

## 4. Explicit Non-Goals (restated for implementer scanning, from spec §6/§11)

- No CONTRIBUTING.md (any form, any location).
- No Track A (Storybook/Playwright/axe-core), Track C (Changesets CI/npm publish/release automation), or Track E (SSR/hydration) work.
- No modification to any `scripts/provenance/*.mjs` file, any Track B CI step, or any Track B threshold.
- No `ROADMAP.md` edit.
- No edit to GAP-031/032/033 or any GAP other than GAP-011.
- No edit to any other track's spec/plan/research document header.
- No new npm script, devDependency, or CI workflow step.
- No source-code change of any kind.

---

## 5. Sources

- `docs/superpowers/specs/2026-09-09-phase-10-operational-documentation-design.md` — the sole authoritative scope/requirements source for this plan (§4 decisions D1-D6, §5 requirements R1-R4, §9 bookkeeping table, §10 acceptance criteria, §11 out-of-scope list, all referenced verbatim above, none reopened).
- `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` — §2's "Proposed ADR wording," the sole content source for Task 3.
- `docs/architecture/DECISIONS.md` — re-confirmed ADR-043 as current highest entry at plan-authoring time (`grep -n "^## ADR-" docs/architecture/DECISIONS.md | tail -3`); Task 3 requires a fresh re-check at implementation time per the spec's own instruction.
- `docs/architecture/BLUEPRINT_GAPS.md:210-223` — GAP-011's exact current text, re-read at plan-authoring time to confirm line numbers for Task 4.
- `README.md:34-39` — `## Provenance`/`## License` sections, confirmed as the natural insertion point for Task 5's pointer lines; `README.md:7-9` (`## Status`) confirmed as the section Task 5 must NOT touch.
