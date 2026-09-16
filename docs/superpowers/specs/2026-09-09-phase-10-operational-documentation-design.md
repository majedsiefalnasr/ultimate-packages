# Specification: Phase 10 Track D — Operational Documentation

**Document:** `docs/superpowers/specs/2026-09-09-phase-10-operational-documentation-design.md`
**Status:** Draft for review
**Companion research:** `docs/architecture/research/2026-09-08-phase-10-production-hardening.md`
**Companion architecture discussion:** `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` (§8, §10, §11, §12)
**Related, already-implemented:** `docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md` (Track B — the security/quality process this document describes)
**Baseline:** `main` at `6428d01` (Track B — CI/Security/Quality Gates, merged)

**Status detail:** Draft for review. This document contains no implementation — no new files are created, no existing files are edited. It is implementation-ready only after Spec Review approves (or amends) the decisions in §4 and §9. Every requirement below is justified by (1) a Blueprint citation, (2) a verified repository fact, (3) an architecture-discussion decision (§8 in particular), or (4) an explicitly labeled specification-level decision.

---

## 1. Scope and Motivation

### Why Track D, why now

The post-merge assessment following Track B's completion (informal, not a committed artifact) found Track D independently startable with zero unresolved architectural forks and zero new-tooling weight, unlike Track A (Storybook + Playwright) or Track E (soft-blocked on Track A). The architecture discussion's own §3 sequencing decision and §12 "Items that must be resolved during Specification" list confirm Track D was always one of the three tracks (B, D, A) with no blocking dependency on another track — Track B happening to land first does not change Track D's readiness; Track D was never gated on Track B in the architecture discussion's dependency graph. It is gated on Track B only in the sense that Track D's SECURITY.md *content* now has a real, implemented process to describe (§29's scanning/advisory outputs did not exist as running CI gates until Track B shipped).

### Scope

Track D covers exactly what the architecture discussion's §8 decision scoped, no more:

1. `SECURITY.md` — a real security-disclosure document describing the process Blueprint §29 requires, now backed by Track B's actually-implemented mechanisms.
2. `CHANGELOG.md` — a real, populated changelog satisfying Blueprint §21's Changesets-driven release-automation requirement, to the extent achievable without implementing Track C's release wiring (see §6 non-goals).
3. A recorded decision on `CONTRIBUTING.md` — not automatic inclusion. §8's decision is binding: CONTRIBUTING.md is not a Blueprint requirement.
4. A bounded set of documentation-bookkeeping updates directly caused by Track B/Track D landing — not a general documentation cleanup pass (see §9).

### Non-goals (binding, repeated from the architecture discussion)

- No Track A tooling (Storybook, Playwright, visual regression, axe-core).
- No Track C release automation (Changesets CI wiring, version-bump automation, npm publish).
- No SSR/hydration work (Track E).
- No new CI gates. No source-code changes. No package manifest changes. No lockfile changes.
- No security-tooling implementation — Track B already implemented `audit:validate`, `license:validate`, `sast:validate`, `install-script-policy:validate`; Track D documents them, it does not modify or extend them.
- No invented security contact, email address, SLA, or organizational process not supported by repository evidence (binding constraint from the task brief and from §8's own finding that Blueprint text is silent on exact contact mechanism).

---

## 2. Blueprint Traceability

| Blueprint section | Requirement | How Track D addresses it |
|---|---|---|
| §29 Security Strategy (`docs/architecture/BLUEPRINT.md:946-961`) | "Security process must include: dependency scanning, license scanning, SAST where appropriate, vulnerability monitoring, security advisories, patch releases, provenance tracking, malicious package/dependency review." | R1 (SECURITY.md) documents this process, cross-referencing each already-implemented Track B mechanism (§29's first three items) and describing the advisory/patch-release process itself (§29's remaining items) as a manual, GitHub-native mechanism — no automation exists or is being built for advisories/patches. |
| §21 Versioning (`docs/architecture/BLUEPRINT.md:761`) | "Use Changesets or an equivalent proven monorepo release mechanism." | R4 (CHANGELOG.md) documents the changelog contract for the already-configured `.changeset/config.json` (`changelog: "@changesets/cli/changelog"`), without implementing the release automation itself (Track C's scope). |
| §35 Phase Roadmap, Phase 10 objectives (`docs/architecture/BLUEPRINT.md:1211-1223`) | Lists "operational documentation" as a Phase 10 objective, undefined further. | Track D is the direct closure of this objective, scoped per §8's finding that the Blueprint does not enumerate specific filenames here. |
| §39 Documentation Artifacts (`docs/architecture/BLUEPRINT.md:1305-1330`) | Enumerates `BLUEPRINT.md`, `DECISIONS.md`, `PROVENANCE.md`, `DEPENDENCIES.md`, `COMPATIBILITY.md`, `PACKAGE_ARCHITECTURE.md`, `AI_ARCHITECTURE.md`, `ROADMAP.md` as "architecture documentation" — explicitly does not include SECURITY.md/CHANGELOG.md/CONTRIBUTING.md. | Confirms (per §8's discussion) that SECURITY.md/CHANGELOG.md are *operational*, not *architecture*, documentation — a distinct category §39 does not claim to enumerate. No conflict; no requirement to add these three files to §39's list. |
| §40 Definition of Done (`docs/architecture/BLUEPRINT.md:1333-1344`) | "security process" listed as a production-readiness requirement. | R1 directly closes the documentation half of this; the process itself (scanning, SAST) was already closed by Track B. |
| §38 Architecture Decision Records (`docs/architecture/BLUEPRINT.md:1277-1301`) | Lists ADR-001 through ADR-013 as "initial candidates," including no DECISION-A-equivalent entry (DECISION-A postdates this list). | R7 addresses whether DECISION-A (Track A's Storybook+Playwright tooling choice, resolved in the architecture discussion §2) should now be recorded as a formal ADR in `docs/architecture/DECISIONS.md`, per that section's own convention (ADR-001 through ADR-043 currently, one-paragraph "Status: Accepted" entries, no rigid template). |

No Blueprint section requires or even names `CONTRIBUTING.md`. This is confirmed, not merely repeated from the architecture discussion — direct re-grep of `docs/architecture/BLUEPRINT.md` for "contribut" (case-insensitive) during this Specification's own research returned zero matches anywhere in the document.

---

## 3. Current Repository State (Verified)

Re-verified directly against `main` at `6428d01` during this Specification's own research, not assumed from prior documents:

- **No `SECURITY.md`, `CONTRIBUTING.md`, or `CHANGELOG.md` exists anywhere in the repository** (repo root confirmed via directory listing; `.github/` confirmed to contain only `codeql/` and `workflows/` subdirectories, no template `.md` files). Matches `BLUEPRINT_GAPS.md` GAP-011's "Current evidence" exactly — GAP-011 has not changed state since Track B merged (Track B did not touch documentation files of this kind).
- **`.changeset/config.json` exists and is fully configured**: `changelog: "@changesets/cli/changelog"`, `access: "restricted"`, `baseBranch: "main"`, `commit: false`, `updateInternalDependencies: "patch"`. No changeset has ever been consumed; every package remains at `0.1.0`.
- **Root `package.json` has no `repository`, `bugs`, `author`, or top-level `license` field.** Only `LICENSE` (repo root file) and each package's own `license` field exist. There is no repository-registered contact channel, email address, or issue-tracker URL anywhere in the repository for this Specification to cite. This is the binding basis for R1's "contact mechanism remains a placeholder" requirement below — inventing one would violate the task's explicit constraint.
- **`README.md` (repo root) is itself stale**: its "Status" section reads "Phase 0 — Repository Foundation..." and its structure lists no security/changelog/contributing pointers. This is a pre-existing condition, not caused by Track B or Track D, but is in-scope to flag in §9 since Track D is precisely the work that would need to update README.md's future pointers to the new files.
- **Track B's ten gates are confirmed live** (re-verified via `package.json` script definitions and `.github/workflows/ci.yml`): `audit:validate` (`pnpm audit --audit-level high --prod`), `license:validate` (`license-checker-rseidelsohn --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;CC0-1.0" --excludePackagesStartingWith "@ultimate/" --excludePrivatePackages`), `sast:validate` (`node scripts/provenance/validate-sast-baseline.mjs`, backed by `.github/codeql/codeql-config.yml` + CodeQL Action + `docs/architecture/SAST_BASELINE.md`), `install-script-policy:validate` (`node scripts/provenance/validate-install-script-policy.mjs`), `size:validate`/`coverage:validate` (bundle-size/coverage regression gates), `integrity:pack-install`, `affected:packages`. These are the real, current names R1 must cite — not the task-brief's approximate descriptions.
- **`docs/architecture/SAST_BASELINE.md` already documents the malicious-package/install-script-policy relationship informally** (its own header prose explains CodeQL scope and the one-way-door grandfathering contract). R1 does not duplicate this content; R1 links to it.
- **DECISIONS.md's current highest entry is ADR-043**, one-paragraph "Status: Accepted (...)" format, no fixed subsection template beyond a title line and a prose paragraph. Any new ADR in R7 must follow this exact convention, not invent a new one.

---

## 4. Specification-Level Decisions (binding, made here)

These resolve the architecture discussion §12's "Items that must be resolved during Specification" for cluster D. Each is a decision this document makes, not an open question deferred further — per the task brief's requirement that every requirement be implementable and reviewable, not vague.

### D1 — SECURITY.md contact/disclosure mechanism

**Decision:** SECURITY.md's disclosure mechanism is GitHub's native private vulnerability reporting (Security Advisories → "Report a vulnerability" on the repository), not an email address or external channel. **Rationale:** no email/contact channel exists anywhere in repository evidence (§3); inventing one would violate the task's explicit constraint. GitHub private reporting is available on any GitHub repository with Security Advisories enabled and requires no new infrastructure, no new registered contact, and no organizational decision beyond "use the platform's own mechanism." **Residual open item:** whether GitHub Security Advisories is actually *enabled* on this repository's GitHub settings is outside this Specification's visibility (a GitHub repository-settings fact, not a repository-file fact) — flagged as Open Question OQ-1 in §12, not assumed either way. SECURITY.md's text must not claim advisories are enabled without that being separately confirmed; it documents the mechanism, and instructs a reporter to use it, without asserting a specific SLA or response-time commitment (none exists in repository evidence to cite).

### D2 — CHANGELOG.md population approach

**Decision:** Start fresh from Phase 10 forward. Do not backfill Phases 0–9 as changelog entries. **Rationale:** Changesets' own model is prospective (a changeset file per unreleased change, consumed into a changelog entry at release time) — retroactively synthesizing 9 phases of history into changelog-shaped entries would be fabricated content no changeset ever produced, contradicting `docs/architecture/DECISIONS.md`'s established practice of only recording verified, evidence-backed history. `ROADMAP.md` and `docs/architecture/research/` phase docs already serve as the historical record; CHANGELOG.md's job is forward-looking release tracking, not a duplicate history. **Consequence:** CHANGELOG.md is created with a header and an "Unreleased" scaffold section, not populated with retroactive entries. **Category-scheme note (verified during Spec Review):** the installed generator behind `.changeset/config.json`'s `"changelog": "@changesets/cli/changelog"` is `@changesets/changelog-git@0.2.1` (confirmed by reading `node_modules/.pnpm/@changesets+cli@2.31.1/node_modules/@changesets/cli/changelog/dist/changesets-cli-changelog.cjs.js`, which re-exports `@changesets/changelog-git`'s `getReleaseLine`/`getDependencyReleaseLine`). That generator emits flat `- <commit>: <summary>` bullet lines per version plus an "Updated dependencies" block — it has no category concept at all. Any Keep-a-Changelog-style category scheme (`Added`/`Changed`/`Fixed`/`Removed`/`Security`) is therefore a **manual, human-facing curation convention layered on top of this file**, not something the currently configured generator produces. See R2 item 2 for the corrected requirement text.

### D3 — CHANGELOG.md relationship to releases

**Decision:** CHANGELOG.md's real per-version entries remain empty (no version sections beyond the "Unreleased" scaffold) until Track C's release wiring actually cuts a release. Track D's deliverable is the *contract* (structure, category conventions, ownership rule) — not manufactured version history. This directly matches the architecture discussion §11's deferred item ("CHANGELOG.md exact content/template — cluster D Specification") and avoids Track D quietly absorbing Track C's release-automation scope, which §11 and the task's explicit non-goals both forbid.

### D4 — CONTRIBUTING.md

**Decision:** Not included in Track D's deliverables. Confirmed independently during this Specification's own research (§2 above — zero Blueprint mentions of "contribut" in any form) that the architecture discussion's §8 finding still holds: no Blueprint text supports it. **This is a decision to exclude, not an oversight.** Should a future phase or explicit user request want a CONTRIBUTING.md, it is a project-convention addition outside any current Blueprint traceability, and should be scoped by its own future decision, not silently folded into this Specification.

### D5 — Documentation ownership/lifecycle rule

**Decision:** SECURITY.md and CHANGELOG.md are operational documents (§39's distinction, confirmed in §2 above), not architecture documents — they do not live under `docs/architecture/`. Per near-universal convention (and matching this repository's own `LICENSE`/`README.md` root placement), both live at the repository root: `SECURITY.md`, `CHANGELOG.md`. **Rationale for root over `.github/`:** this repository's `.github/` directory currently contains only `codeql/` and `workflows/` — machine-consumed CI configuration, not human-facing documentation — establishing no existing convention for `.github/*.md` documentation files; root placement matches GitHub's own default discovery behavior for both SECURITY.md and CHANGELOG.md (GitHub surfaces a root or `.github/`-placed SECURITY.md identically in its Security tab, so this is a style choice, not a functional requirement) and matches this repo's existing `README.md`/`LICENSE` root placement precedent directly.

**Ownership going forward:** SECURITY.md is updated whenever Track B's gate set changes (a new gate added/removed, a threshold materially changed) — cross-referenced, not duplicated, from `docs/architecture/SAST_BASELINE.md` and `docs/architecture/PERFORMANCE.md`. CHANGELOG.md is updated exclusively via the Changesets flow once Track C implements it (a changeset file per change, consumed at release) — never hand-edited with unreleased-work entries outside that flow, to avoid drift between the file and actual `.changeset/*.md` pending files.

---

## 5. Deliverables

### R1 — `SECURITY.md`

**Requirement:** Create `/SECURITY.md` at repository root, covering exactly:

1. **Supported versions.** State plainly that the platform is pre-`1.0.0` (every package at `0.1.0`, verified in §3) and that no formal support-window policy exists yet — do not fabricate a version-support table with commitments this project cannot back.
2. **Reporting a vulnerability.** Instructs reporting via GitHub's private Security Advisory mechanism (per D1) — link format: `https://github.com/<org>/<repo>/security/advisories/new`, with `<org>/<repo>` left as a literal placeholder token (e.g., `<owner>/<repo>`) since no `repository` field exists in `package.json` to source a real URL from (§3) — do not invent one.
3. **What is in scope to report:** vulnerabilities in `@ultimate/*` package source code, in the CI/build tooling under `scripts/`, or in the CI pipeline itself (`.github/workflows/`).
4. **Relationship between automated detection and disclosure (three distinct concerns, must not be collapsed into one another):**
   - **Automated detection:** Track B gates (`audit:validate`, `sast:validate`, and the other security-related gates) continuously and automatically detect/validate known, publishable issue classes as part of CI. This is preventive scanning, not a disclosure channel.
   - **Disclosure:** SECURITY.md's "Reporting a Vulnerability" mechanism (item 2) remains open to **any** suspected vulnerability, including one that might also be caught by an automated Track B gate. The existence of automated detection must never be described as making a vulnerability non-reportable, out of scope, or "not treated as a report" — reporting is always welcome regardless of whether automation would eventually catch it too.
   - **Duplicate handling:** If a report turns out to correspond to an already-known, already-tracked finding (e.g., already listed in `docs/architecture/SAST_BASELINE.md`'s grandfathered table), it is acknowledged as a duplicate and the reporter is pointed to that existing tracking entry — it is still treated as a valid report that was received and triaged, not silently dropped or waved off as unreportable.
5. **Relationship to dependency scanning:** one paragraph describing `audit:validate` (`pnpm audit --audit-level high --prod`) as the automated first line of defense for known dependency CVEs, run in CI on every PR.
6. **Relationship to license scanning:** one paragraph describing `license:validate` (`license-checker-rseidelsohn`) as the automated check preventing unapproved dependency licenses, not a vulnerability mechanism per se — included because Blueprint §29 groups it under the same "Security process" heading.
7. **Relationship to SAST/CodeQL:** one paragraph describing `sast:validate`, CodeQL's `security-extended` query pack (`.github/codeql/codeql-config.yml`), and the one-way-door grandfathering contract already documented in `docs/architecture/SAST_BASELINE.md` — link to that file rather than re-explaining its content.
8. **Relationship to the malicious-install-script policy:** one paragraph describing `install-script-policy:validate` (`scripts/provenance/validate-install-script-policy.mjs`) as the mechanism satisfying Blueprint §29's "malicious package/dependency review" line item.
9. **Patch/advisory process:** states plainly (per D1) that no automated advisory-publication mechanism exists; a confirmed vulnerability is patched via a normal PR through the same Track B CI gates, with a note in CHANGELOG.md (once Track C exists) or, until then, in the PR/commit history itself.

**Non-requirement:** SECURITY.md must not state a response-time SLA, must not name a specific person/team/email as contact, and must not claim any automation this repository does not actually have (e.g., must not claim advisories are automatically published — no such mechanism exists).

### R2 — `CHANGELOG.md`

**Requirement:** Create `/CHANGELOG.md` at repository root with:

1. A header explaining the file's purpose and its Changesets-driven update mechanism (once Track C implements it), citing `.changeset/config.json`'s existing configuration as the mechanism this file's real entries will eventually come from.
2. A "Keep a Changelog"-style category convention (`Added`, `Changed`, `Fixed`, `Removed`, `Security`) as a **manual, human-facing readability convention** — explicitly documented as NOT the output shape of the currently configured Changesets generator (verified: `.changeset/config.json`'s `"changelog": "@changesets/cli/changelog"` resolves to the installed `@changesets/changelog-git@0.2.1`, which produces flat per-changeset bullet lines with no categories, not this five-category structure). The file must state plainly that reconciling this human-facing convention with the generator's real flat-bullet output — whether by manual curation at release time, swapping to a different changelog generator (e.g., `@changesets/changelog-github`), or writing a custom changelog function — is a **Track C decision**, out of Track D's scope. Track D does not implement, configure, or prescribe any such change to the Changesets generator.
3. Per D2/D3: no backfilled historical entries. An `## [Unreleased]` section header only, with no entries under it (nothing has shipped through Changesets yet — an empty section is factually accurate, a fabricated one is not).
4. An explicit note that entries below `## [Unreleased]` are populated exclusively by the Changesets release flow (Track C), never hand-written directly into this file outside that flow — this is the binding ownership rule from D5.

### R3 — CONTRIBUTING.md decision record

**Requirement:** No file is created. Per D4, this Specification itself is the decision record — no additional artifact is needed since D4 is documented here, in the one specification document this repository's convention (§36 Superpowers Workflow) treats as the authoritative record for a track's scope decisions. Track D's Implementation Plan (a separate future document, not part of this Specification) must not add a CONTRIBUTING.md task; if a future phase decides to add one, it requires its own scope decision, not a silent addition to Track D's plan.

### R4 — DECISION-A ADR recording

**Requirement:** Record DECISION-A (Track A's Storybook+Playwright tooling choice, architecture discussion §2) as a new entry in `docs/architecture/DECISIONS.md`, following the exact existing convention (§3 above: a `## ADR-NNN — <title>` heading, one prose paragraph, "Status: Accepted (...)" lead sentence — no new template).

- **ADR number:** `ADR-044` (next sequential number after the current highest, ADR-043, confirmed in §3).
- **Content source:** the architecture discussion §2's own "Proposed ADR wording (architectural level only)" subsection already drafted the substance — R4's job is to transcribe that into `DECISIONS.md`'s real format, not to re-derive new wording.
- **Ownership:** this ADR documents an architectural decision already made and approved (the architecture discussion itself, which is this repository's approved decision-making artifact per Blueprint §36/§37) — it is bookkeeping, not a new decision being made by Track D. It is included in Track D's deliverables (not "separate cleanup," see §9) because Track D is the first track whose Specification is being written after DECISION-A was reached, and per Blueprint §37's Architectural Deviation Protocol, "update the architecture decision record after approval" is a required step this Specification is positioned to close.

**Non-requirement:** R4 does not record every Phase 10 architecture-discussion decision (§3 sequencing, §4 migration-tooling scope, §5 SSR/GAP-008 scope, §6 package-quality boundary, §7 release-provenance boundary, §8 itself) as separate ADRs. Only DECISION-A is in scope, because it is the only one the architecture discussion itself pre-drafted ADR wording for, and the only one explicitly named in the task brief. Recording the remaining six as ADRs, if desired, is a separate future decision — flagged as Open Question OQ-2 in §12, not decided here.

---

## 6. Explicit Non-Goals

Restated precisely, each tied to why it is excluded:

- **Track A/C/E scope of any kind** — no Storybook, Playwright, axe-core, Changesets CI wiring, npm publish mechanism, or SSR harness. Track D documents; it does not implement any of these.
- **Modifying Track B's gates, scripts, or thresholds** — R1 only describes what already exists; it does not add, remove, or retune any `scripts/provenance/*.mjs` gate.
- **CHANGELOG.md real version history** — per D2/D3, explicitly deferred to Track C's actual release cadence.
- **CONTRIBUTING.md** — per D4, explicitly excluded from Track D's scope entirely, not merely deferred.
- **A general documentation-hygiene pass** — `ROADMAP.md`'s stale Phase 9/10 status, `README.md`'s stale "Phase 0" status, `BLUEPRINT_GAPS.md`'s stale GAP-031/032/033 statuses, and Track B's own spec/plan/research "Draft for review" headers are addressed narrowly in §9, not broadly rewritten here — see §9 for exactly which of these Track D's Implementation Plan may touch and which remain separate.
- **A formal response-time SLA, named contact, or organizational escalation process** — none exists in repository evidence; inventing one is explicitly forbidden by the task brief.
- **New CI gates, new npm scripts, new devDependencies, new source code of any kind.**

---

## 7. Documentation Ownership / Lifecycle Rules

(Restated compactly from §4/D5 for implementer reference.)

- `SECURITY.md`, `CHANGELOG.md` → repository root, operational documentation, not `docs/architecture/`.
- `SECURITY.md` is updated when Track B's gate set materially changes; cross-references `docs/architecture/SAST_BASELINE.md` and `docs/architecture/PERFORMANCE.md` rather than duplicating their content.
- `CHANGELOG.md`'s `## [Unreleased]` section and all versioned sections below it are populated exclusively through the Changesets flow (Track C) — never hand-authored outside that flow.
- `docs/architecture/DECISIONS.md` ADR-044 is a point-in-time record of DECISION-A; like every other ADR in that file, it is not edited after acceptance except to append a superseding ADR, matching the file's existing convention (observed directly: no existing ADR in the file shows in-place edits, only new ADRs referencing older ones).

---

## 8. Dependencies and Sequencing

- **Depends on:** nothing blocking. Track B's completion makes R1's content *accurate* (there is now a real process to describe) but Track D was never architecturally gated on Track B (§1, confirmed against architecture discussion §3/§12).
- **Soft-depends on (content only, not a blocker to writing this Specification or even to creating the files):** Track C, for CHANGELOG.md's real version entries (per D3) and for R1's "patch/advisory process" section's eventual cross-reference once release automation exists. Neither blocks R1/R2's file creation — both files are valid, honest artifacts even with an empty Unreleased section and a manual-process-only advisory description.
- **Unblocks:** GAP-011's full resolution (currently MISSING; R1+R2 close its SECURITY.md/CHANGELOG.md portion; its CONTRIBUTING.md portion is resolved by D4's explicit non-inclusion decision, not left dangling).
- **Sequencing relative to Track D's own Implementation Plan:** R1, R2, R4 have no ordering dependency on each other and may be implemented in any order or in parallel by separate tasks, per this repository's established subagent-driven-development pattern (as Track B's plan already demonstrated for its own independent tasks).

---

## 9. Required Repository-State/Bookkeeping Updates (separated from operational-document deliverables)

Per the task brief's explicit requirement to distinguish "which state updates are required for correct project bookkeeping," "which belong inside Track D," and "which should remain separate cleanup work" — this section makes that call explicitly, file by file. **None of these are implemented by this Specification document itself; this section defines what Track D's future Implementation Plan may vs. may not include.**

| File | Stale condition found | In Track D's Implementation Plan? | Rationale |
|---|---|---|---|
| `docs/architecture/DECISIONS.md` | Missing ADR-044 for DECISION-A | **Yes — R4** | Directly caused by this Specification identifying the gap; small, bounded, single-entry addition; explicitly named in the task brief. |
| `docs/architecture/BLUEPRINT_GAPS.md` GAP-011 | Still shows `Status: MISSING`, despite R1/R2 (once implemented) resolving its SECURITY.md/CHANGELOG.md portion | **Yes, but only as a status-field update to GAP-011 specifically** (e.g., `MISSING` → `PARTIALLY RESOLVED — SECURITY.md/CHANGELOG.md added by Track D; Blueprint §21's Changesets-driven release-automation expectation remains open, Track C; CONTRIBUTING.md explicitly excluded per DECISION-D4, not a Track D gap`), not a rewrite of the GAP's prose | GAP-011 is the one GAP this track directly closes; leaving it stale after Track D ships would misstate project state exactly the way Track B leaving GAP-031/032/033 stale did (per the post-merge assessment). Narrow, mechanical, low-risk. **Rationale for `PARTIALLY RESOLVED` (not `RESOLVED`):** GAP-011's own "Expected state" (line 215) cites Blueprint §21, which is about Changesets-driven *release automation*, not merely the existence of a CHANGELOG.md file — that automation is Track C's scope, not Track D's, and remains genuinely open after Track D ships. CONTRIBUTING.md's exclusion is a separate, already-closed matter (per D4) — it is not itself a reason for "partial" status, since it was never a real Blueprint requirement to begin with. **Known pre-existing registry discrepancy (not fixed here):** GAP-011's own title and "Recommended resolution direction" (`docs/architecture/BLUEPRINT_GAPS.md:210,221`) bundle CONTRIBUTING.md into what the GAP expects resolved, despite its own "Expected state" citing no Blueprint section that requires CONTRIBUTING.md — the same absence of Blueprint support this Specification's §2/D4 independently confirmed. This is a discrepancy in GAP-011's existing prose, not something Track B or Track D introduced. Track D's implementation must NOT rewrite GAP-011's title or "Recommended resolution direction" text to fix this — only the narrow `Status:` field update above is in scope. Flagged here so a future reader isn't confused by GAP-011 continuing to mention CONTRIBUTING.md in its untouched prose while Track D's status update explicitly excludes it. |
| `docs/architecture/BLUEPRINT_GAPS.md` GAP-031/032/033 (Track B's gaps) | Still show `MISSING`/`IMPLEMENTED-BUT-NOT-ENFORCED` despite Track B resolving them | **No — separate cleanup work**, not Track D's | These are Track B's gaps, not Track D's. Bundling them into Track D's plan would mix two tracks' bookkeeping into one deliverable, contradicting the task's explicit instruction not to silently reconcile unrelated staleness. Flagged here for visibility; assign to whoever does the next general doc-bookkeeping pass. |
| `docs/architecture/ROADMAP.md` | Shows Phase 9 and Phase 10 both "Not started" | **No — separate cleanup work** | This is phase-level (not track-level) bookkeeping spanning Phase 9 (unrelated to Track D entirely) and all of Phase 10 (five tracks, only one of which — Track D itself — this Specification concerns). A correct Phase 10 row cannot be written until it's clear whether Phase 10 gets sub-row/footnote treatment (matching Phases 5-8's footnote convention, per §3's confirmed repository evidence) — that call belongs to whoever writes it, informed by all five tracks' actual state, not just Track D's. |
| `README.md` | "Status" section says "Phase 0", no pointers to future SECURITY.md/CHANGELOG.md | **Partially — Track D's Implementation Plan may add a one-line pointer to the new SECURITY.md/CHANGELOG.md files under README's existing "Provenance"/"License" sections**, but must NOT attempt to fix the stale "Phase 0" Status line (out of scope — a project-wide status issue, same reasoning as ROADMAP.md above) | README's stale phase-status is pre-existing and unrelated to Track D; adding two link lines for files Track D itself creates is directly in scope and low-risk. |
| `docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md` header (`Status: Draft for review`) | Track B fully shipped; header still says Draft | **No — remains `Draft for review` by established repository convention** (see D6 below) | See D6 — this repository's own convention, confirmed by inspecting every existing spec file, is that `Status: Draft for review` is retained even after implementation; the *plan* document, not the spec header, is what's updated to reflect completion (via the SDD progress ledger, which is itself gitignored/ephemeral). Changing this convention is out of scope for a single track's Specification. |
| `docs/architecture/research/2026-09-08-phase-10-production-hardening.md` / `2026-09-08-phase-10-architecture-discussion.md` headers (`Status: Draft for review`) | Same pattern as above | **No — same reasoning as D6** | Not Track D's to unilaterally change; a cross-track documentation-status convention question, out of this Specification's scope. |

### D6 — Preserving the "Draft for review" header convention

**Decision:** Confirmed by direct inspection (§3) that this repository's specs (Phase 6 through Phase 10 Track B, five files checked) uniformly retain `**Status:** Draft for review` in their header even once approved and fully implemented — Track B's own spec header still reads exactly that, verified on `main` post-merge. This is the established convention, not an oversight this Specification should correct. Track D's own spec header (this document) follows the same convention: it will say `Draft for review` now, and per the established pattern, is expected to continue saying `Draft for review` even after approval and implementation — status tracking lives in the SDD progress ledger and commit history, not in a document-header edit. This Specification does not propose changing that convention, and Track D's Implementation Plan must not "fix" other tracks' spec headers under this rationale.

---

## 10. Acceptance Criteria

Objectively verifiable, file-by-file:

**R1 (SECURITY.md):**
- AC1.1: `/SECURITY.md` exists at repository root.
- AC1.2: Contains a "Reporting a Vulnerability" section linking to GitHub's private Security Advisory report mechanism (URL pattern `.../security/advisories/new`), with no email address or named individual anywhere in the file.
- AC1.3: Contains one distinct subsection each explicitly naming and describing `pnpm audit` (via `audit:validate`), `license-checker-rseidelsohn` (via `license:validate`), CodeQL (via `sast:validate`), and the install-script policy (via `install-script-policy:validate`) — each subsection's tool/script name is grep-verifiable against `package.json`'s real script definitions (i.e., the documented script name must exactly match what's actually in `package.json`).
- AC1.4: Does not contain any response-time/SLA commitment (verifiable by absence: no "within X days/hours" language).
- AC1.5: Does not contain a fabricated or placeholder-but-presented-as-real email address, org name substituted for a real one, or specific person's name.

**R2 (CHANGELOG.md):**
- AC2.1: `/CHANGELOG.md` exists at repository root.
- AC2.2: Contains exactly one `## [Unreleased]` section header with no dated version sections beneath or above it.
- AC2.3: Documents the five categories (`Added`, `Changed`, `Fixed`, `Removed`, `Security`) as a manual curation convention, explicitly states this does NOT match the installed `@changesets/changelog-git` generator's real flat-bullet output, and explicitly states entries are populated only via the Changesets flow.
- AC2.4: Contains no fabricated historical (Phase 0–9) entries.

**R3 (CONTRIBUTING.md decision):**
- AC3.1: No `CONTRIBUTING.md` file exists in the repository after Track D's implementation.
- AC3.2: This Specification (§4/D4) is the sole decision record; no additional file is created to record the decision.

**R4 (ADR-044):**
- AC4.1: `docs/architecture/DECISIONS.md` contains a new `## ADR-044 — <title>` entry, appended after the current final entry (ADR-043 at implementation time — re-verify the actual highest number immediately before implementing, since intervening work may add ADRs first).
- AC4.2: The entry's content is traceable word-for-word in substance to architecture discussion §2's "Proposed ADR wording" subsection (not new invented rationale).
- AC4.3: No other new ADR entries are added by this track (confirmed by diff — exactly one new `## ADR-` heading).

**Bookkeeping (§9):**
- AC5.1: `BLUEPRINT_GAPS.md` GAP-011's `Status:` field changes from `MISSING` to `PARTIALLY RESOLVED`, with rationale text distinguishing (a) Blueprint §21's Changesets release-automation expectation remaining open as Track C's scope, from (b) CONTRIBUTING.md's explicit, already-settled non-inclusion per D4 — not silence on either point. GAP-011's title and "Recommended resolution direction" prose are left untouched (see §9 rationale on the pre-existing registry discrepancy).
- AC5.2: No other GAP entry in `BLUEPRINT_GAPS.md` is modified by Track D's implementation.
- AC5.3: `README.md` gains at most two new lines (pointers to `SECURITY.md`/`CHANGELOG.md`); its existing "Status" section text is unchanged.
- AC5.4: `ROADMAP.md` is not modified by Track D's implementation.
- AC5.5: No spec/research document's `Status:` header line is modified by Track D's implementation (including this document's own header, which remains `Draft for review` even after approval per D6).

**Whole-track:**
- AC6.1: `pnpm run test` (or whatever the repository's full validation command is at implementation time) passes unchanged — Track D touches no source, no CI, no scripts.
- AC6.2: `git diff --stat` for Track D's implementation touches only: `SECURITY.md` (new), `CHANGELOG.md` (new), `docs/architecture/DECISIONS.md` (append), `docs/architecture/BLUEPRINT_GAPS.md` (GAP-011 only), `README.md` (≤2 lines). No file outside this list is touched.

---

## 11. Explicit Out-of-Scope (restated as a flat list for implementer scanning)

- CONTRIBUTING.md (any content, any location).
- Storybook, Playwright, axe-core, any Track A tooling.
- Changesets CI wiring, npm publish, any Track C automation.
- SSR/hydration harnesses, any Track E work.
- Modifying any `scripts/provenance/*.mjs` file or any Track B CI step.
- `ROADMAP.md` edits.
- `README.md`'s "Status" section content.
- Any other track's spec/plan/research document header.
- GAP-031/032/033 status updates (Track B's own bookkeeping debt).
- ADRs for architecture-discussion decisions other than DECISION-A.
- Any new npm script, devDependency, or CI workflow step.

---

## 12. Open Questions

Only items repository evidence cannot resolve — both are non-blocking to writing an Implementation Plan (each has a safe, documented default in this Specification already; resolving them can happen at Spec Review or even post-implementation without invalidating R1/R2/R4's structure):

- **OQ-1:** Is GitHub Security Advisories actually enabled on this repository's GitHub settings? This Specification's file-based research cannot observe GitHub repository settings. If disabled, R1's "Reporting a Vulnerability" link would 404 until enabled — a repository-configuration action outside this Specification's or any code change's ability to verify or fix. Recommend confirming (and enabling, if needed) at Spec Review or Implementation Plan time, external to this document.
- **OQ-2:** Should the architecture discussion's remaining six decisions (§3 sequencing, §4 migration-tooling scope, §5 SSR/GAP-008 scope, §6 package-quality boundary, §7 release-provenance boundary, §8 operational-documentation interpretation itself) also become formal ADRs in `DECISIONS.md`, matching DECISION-A's treatment in R4? Not decided here — R4 is scoped to DECISION-A only per the task brief's explicit naming of it. If the answer is yes for the others, that is a separate future decision (possibly at each track's own Specification gate, recording its own architecture-discussion section as an ADR when that track is specified) — not something Track D should unilaterally decide for tracks A/C/E.

---

## 13. Sources / Evidence

- `docs/architecture/BLUEPRINT.md` — §21 (Versioning, line 761), §29 (Security Strategy, lines 946-961), §35 (Phase Roadmap, Phase 10 objectives, lines 1211-1223), §36 (Superpowers Workflow), §37 (Architectural Deviation Protocol), §38 (Architecture Decision Records, lines 1277-1301), §39 (Documentation Artifacts, lines 1305-1330), §40 (Definition of Done, lines 1333-1344), §41 (Explicit Non-Goals, lines 1357-1372) — re-grepped directly for "contribut"/"changelog"/"security" during this Specification's own research, zero CONTRIBUTING.md hits confirmed.
- `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` — §8 (Operational-documentation interpretation, lines 250-271, the primary decision source), §9 (DECISION-A citation discrepancy), §10 (GAP impact/dependency map, GAP-011 row), §11 (Consequences and deferred items), §12 (Items that must be resolved during Specification, cluster D bullet), §2 (DECISION-A + its "Proposed ADR wording" subsection, source for R4).
- `docs/architecture/BLUEPRINT_GAPS.md` — GAP-011 (lines 210-223), re-verified current `Status: MISSING` against actual repo state (still accurate).
- `docs/architecture/DECISIONS.md` — full ADR list inspected for numbering convention and format; ADR-043 confirmed as current highest.
- `docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md` — header/status-line convention, requirement-ID scheme (`R1`-`R10`), confirmed still `Draft for review` on `main` post-implementation (source for D6).
- `docs/architecture/ROADMAP.md` — current phase-status table, confirmed stale (Phase 9/10 both "Not started"), quoted verbatim in §9.
- `README.md` — confirmed stale "Phase 0" status, quoted in §3.
- `package.json` (root) — confirmed absence of `repository`/`bugs`/`author`/top-level `license` fields; confirmed exact script names/commands for R1's citations.
- `.changeset/config.json` — confirmed configuration, source for D2/D3/R2.
- `pnpm-lock.yaml` + `node_modules/.pnpm/@changesets+cli@2.31.1/node_modules/@changesets/cli/changelog/dist/changesets-cli-changelog.cjs.js` + `node_modules/.pnpm/@changesets+changelog-git@0.2.1/node_modules/@changesets/changelog-git/dist/changesets-changelog-git.cjs.js` — installed generator confirmed as `@changesets/cli@2.31.1` re-exporting `@changesets/changelog-git@0.2.1`'s `getReleaseLine`/`getDependencyReleaseLine`, which emit flat per-changeset bullet lines with no category concept (Spec Review amendment, source for D2/R2's corrected category-scheme wording).
- `docs/architecture/SAST_BASELINE.md`, `docs/architecture/PERFORMANCE.md` — inspected for cross-reference targets and house documentation style.
- Direct repository listing (`ls` at root, `.github/`) — confirmed no existing SECURITY.md/CONTRIBUTING.md/CHANGELOG.md, no `.github/*.md` template files.
