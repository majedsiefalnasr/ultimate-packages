# Next-Work Prioritization Audit

**Document:** `docs/architecture/research/2026-09-12-next-work-prioritization-audit.md`
**Purpose:** Decision-prioritization audit only. Establish a current, evidence-based ranking of remaining work after Phase 10 and Documentation Reconciliation, to inform (not make) the human's choice of next track.
**Status:** Research snapshot. Does not implement anything, does not create a specification or implementation plan, does not resolve any open architectural decision, does not modify any other document.
**Audited HEAD:** `d391acf` (`main`) — the Documentation Reconciliation commit.
**Method:** Direct repository inspection (file reads, `grep`/`find`) against the just-reconciled `docs/architecture/{BLUEPRINT_GAPS,ROADMAP,DECISIONS,COMPONENT_INVENTORY,PERFORMANCE,MIGRATION}.md`, cross-checked against real source (`packages/*/src/`, `packages/*/package.json`) and the two committed Phase 10 research artifacts (`2026-09-12-post-phase-10-blueprint-reconciliation-audit.md`, `2026-09-12-ai-knowledge-architecture-assessment.md`). Several claims below were independently re-verified against real repo state in this pass rather than trusted purely from the reconciled documents (see inline citations).

---

## 1. Current-state inventory

### Genuinely open architectural decisions (4)
- **DECISION-B** — external dependency approval process (Chart.js, Quill, future cases). Open.
- **DECISION-C** — Table/Data architecture, **narrowed scope** (Table/Scroller/Paginator's own composition question is answered by real shipped code; what remains is the fuller filter-operator vocabulary and 4 unbuilt Data-family rows). Open, narrower than before.
- **DECISION-D** — Tree-family shared contract. Open, but deliberately protected (do-not-open marker).
- **DECISION-E** — package naming finalization. Open, correctly deferred to pre-1.0.
- **DECISION-A** is **closed** (resolved by Track A/ADR-044) — not carried forward as open.

### Genuinely open Blueprint gaps (non-exhaustive, load-bearing subset)
- **GAP-006** — Angular Tooltip `aria-describedby` missing. Open, isolated.
- **GAP-007** — Angular overlay single z-index bucket, no Escape-priority stacking. Open, blocks future Angular overlay components.
- **GAP-009/GAP-023** — Angular has no `exports` map (confirmed this pass: `grep -c "exports" packages/ng/package.json` → 0, vs. React/Vue → 1 each). Open.
- **GAP-010** — provenance `sha256OfOriginal` field never enforced. Open, low severity.
- **GAP-013/DECISION-D** — Tree-family. Open, deliberately protected.
- **GAP-017** — remaining PrimeNG component-family backlog (count stale, corrected direction only — see §3). Open, largest single body of work.
- **GAP-018** — Angular `BaseModelHolder`/`BaseInput` foundation tier. Open (confirmed this pass: `find packages/ng-core/src -iname "*base-model*" -o -iname "*base-input*"` → empty), blocks ~20 Form components.
- **GAP-019/GAP-020** — Chart/Editor, blocked on DECISION-B. Open.
- **GAP-036** — `llms.txt`/`llms-full.txt` generator built and tested, but no output ever committed. **Re-confirmed this pass**: local `packages/ai/dist/context/llms*.txt` files exist in this working directory, but are gitignored build byproducts (`git check-ignore` confirms `dist/` is ignored; `git ls-files` confirms zero are tracked) — not a committed artifact. GAP-036's status is accurate as written. Open, trivial to close.
- **GAP-037** — `PERFORMANCE.md` lacks a dedicated Phase 3/4/5 narrative section (data itself already exists in the Phase 10 table). Open, cosmetic.

### Resolved (not carried forward as current work, listed only to confirm they're correctly retired)
GAP-003/003a, GAP-004, GAP-005, GAP-011 (partially), GAP-014, GAP-015, GAP-021, GAP-022, GAP-024, GAP-025, GAP-026 (deferred, not resolved), GAP-027, GAP-028, GAP-029, GAP-030 (with GAP-036 follow-up), GAP-031, GAP-032, GAP-033, GAP-034, GAP-035.

### Intentionally deferred (correctly, with evidence — do not treat as "open work to schedule")
GAP-013/DECISION-D (Tree), GAP-021 (config/passthrough, YAGNI), GAP-022 (overlay orchestration, YAGNI), GAP-026 (`@primevue/forms`, no Vue Form pressure yet), DECISION-E (package naming, pre-1.0 gate).

### Foundation/enabling work (ordinary implementation, unlocks a family)
GAP-018 (Form foundation, Angular), GAP-009/GAP-023 (Angular tree-shaking), GAP-007 (Angular overlay stacking), GAP-006 (Tooltip aria).

### Production-readiness limitations (built and CI-enforced, but never exercised under real conditions — not gaps in the traditional sense)
- No real npm release has ever been executed (all 17 packages at `0.1.0`; `MIGRATION.md` §7 documents the pipeline but discloses zero real runs).
- Security advisory-response process has never been exercised against a real advisory.
- Migration-guide *content* doesn't exist because no version-to-version migration has ever happened (`MIGRATION.md` §6/§7's own disclosure).

---

## 2. Architectural decisions — direct verification

### DECISION-B — external dependency approval process
- **Current evidence, re-verified this pass:** `find packages -iname "*chart*" -o -iname "*editor*"` (excluding `node_modules`/`dist`) returns zero matches — no Chart or Editor work exists anywhere in the tree.
- **Classification: Still genuinely open.** No new evidence since Documentation Reconciliation. `BLUEPRINT_GAPS.md`'s own recommendation (option (a), extend the Phase 0 provenance/license process) remains a recommendation, not a resolution.
- **What would resolve it:** A human decision among the 3 already-enumerated options — this is a policy fork, not something further investigation alone settles. Blocks GAP-019 (Chart) and GAP-020 (Editor) independently, plus any future non-Prime dependency need generically.

### DECISION-C — remaining Table/Data architecture question
- **Current evidence:** As established during Documentation Reconciliation (`docs/superpowers/plans/2026-09-02-table-component-implementation.md` Tasks 5/13/19, directly read): Table/Scroller/Paginator's own framework-native composition question is answered by real, shipped, tested code across all 3 frameworks. The plan's own Acceptance Criteria section states the filter-operator resolution is "**Narrower than spec §9's full `FilterMatchMode` vocabulary**" — Angular got `contains`/`startsWith`/`equals`; React/Vue got `contains` only. Numeric/set/date/custom modes remain explicitly deferred (Task 5's own text: "not implemented, not stubbed, not silently no-op'd").
- **Classification: Still genuinely open, but narrower than its original framing.** This audit preserves that narrowed scope per instruction — it does **not** revert to "Table architecture, unstarted." The remaining open surface is exactly two things: (1) the fuller filter-operator vocabulary beyond string match modes, and (2) whether Table's now-proven composition pattern generalizes to TreeTable/OrderList/PickList/DataView, or whether each needs its own architecture pass.
- **What would resolve it:** For (1), real evidence would come from an actual consumer need for numeric/date/set filtering (the same "defer until real evidence" discipline that produced the current narrow shape). For (2), this is the cheapest possible next step in this entire audit — see §5, Candidate 2.

### DECISION-D — Tree-family shared contract (do-not-open marker)
- **Current evidence:** No Tree-family implementation work exists anywhere (confirmed via the component-count check in §1 — no `tree`/`treetable`/`treeselect` directories in any framework's `src/`).
- **Classification: Deferred intentionally, protected.** ADR-043 already answered this with real research: structurally incompatible (object-mutation vs. external key-maps) across frameworks, no forced contract. Per this decision's own binding recommendation, it should not be reopened without new evidence — and none has surfaced. **Not classified as "genuinely open" in the sense that invites action** — it is a settled non-decision, correctly left alone.

### DECISION-E — package naming finalization
- **Current evidence:** All 17 publishable packages confirmed still at `0.1.0` (verified during Documentation Reconciliation; not independently re-verified this pass since it's a low-risk, unlikely-to-have-changed fact in the time since).
- **Classification: Deferred intentionally, correctly.** Blueprint §34 explicitly gates this to "before the first stable public release" — no release has occurred, so this decision is correctly not yet due. No action needed until a release is imminent.

---

## 3. Remaining gaps — ranked

Ranked by the 6 stated criteria (architectural dependency impact, ability to unblock future component work, production/user value, risk of delaying, implementation complexity, evidence confidence), grouped into the 5 requested categories.

### Architectural blockers (require a decision, not just implementation)
| Rank | Item | Dependency impact | Unblocks | Value | Risk of delay | Complexity | Evidence confidence |
|---|---|---|---|---|---|---|---|
| 1 | **DECISION-B** | Medium (2 named components + generic future policy) | Chart, Editor, any future non-Prime dependency | Medium | Low (nothing currently waiting urgently) | Low (policy decision) | High — 3 options already enumerated with a weak recommendation |
| 2 | **DECISION-C (narrowed)** | Medium-high (4 unbuilt Data rows) | TreeTable, OrderList, PickList, DataView | High if resolved cheaply (see Candidate 2, §5) | Low | Very low for the verification half; Medium-high for a fresh architecture pass if verification says one is needed | High — real, cited evidence from the actual Table plan |
| 3 | **GAP-013/DECISION-D** | High in theory (4 components) but correctly non-actionable | Tree, TreeTable, TreeSelect, OrganizationChart | N/A — deliberately blocked | None (protected by design) | N/A | High — ADR-043's six-pass research is well-documented |

### Foundation/enabling work (ordinary implementation, no decision needed)
| Rank | Item | Dependency impact | Unblocks | Value | Risk of delay | Complexity | Evidence confidence |
|---|---|---|---|---|---|---|---|
| 1 | **GAP-018** (Angular Form foundation) | High — blocks ~20 components | Entire Angular native-input Form family | High | Low (pattern proven, no urgency pressure yet) | Low-Medium (ADR-018's `UBaseEditableHolder` pattern already proven) | High |
| 2 | **GAP-009/GAP-023** (Angular tree-shaking) | Medium (bundle-size confidence) | Nothing downstream architecturally; parity claim only | Medium | Low | Low (pattern proven by React/Vue's existing `exports` maps) | High — directly re-verified this pass (`grep -c exports` = 0 for `ng`) |
| 3 | **GAP-007** (Angular overlay z-index/Escape stacking) | Medium (every future Angular overlay component) | Popover, Drawer, ConfirmDialog, etc. (8+ components in eventual backlog) | Medium | Low (no second Angular overlay component exists yet to expose the bug) | Low (shared `uix-utils/escape`/`zindex` already exist, already consumed by React) | High |
| 4 | **GAP-006** (Tooltip aria-describedby) | Low (isolated) | Nothing | Low | Low | Very low | High |

### Production-hardening follow-ups (small, mechanical, disclosed)
| Rank | Item | Value | Complexity |
|---|---|---|---|
| 1 | **GAP-036** (generate + commit `llms.txt`) | Medium — completes a Blueprint-named Phase 9 deliverable chain | Very low — tooling already built and tested |
| 2 | **GAP-037** (PERFORMANCE.md Phase 3/4/5 section) | Low | Very low |
| 3 | **GAP-010** (provenance `sha256OfOriginal`) | Low | Very low (add the field everywhere, or formally drop the requirement) |
| 4 | **A first real release** (Track C's disclosed gap) | High (the single most credible "is this production-ready" signal) | Low engineering scope, but a genuine go/no-go **business** decision, not a technical task |

### Ordinary component/backlog work (large in aggregate, independently low-risk)
- **GAP-017** — remaining PrimeNG component-family expansion. The single largest body of work; count is stale (predates the 5→8 proof-set expansion) but the direction (still the majority of ~117 PrimeNG source areas) is unchanged. Proven pattern (8 components × 3 frameworks already independently verified against real Prime source). No architectural risk once GAP-018 (Form) or DECISION-B/C (Chart/Editor/fuller-Data) unblock their respective families.
- Framework-family expansion generally (Overlay, Navigation, Panel/Layout/Display) — unblocked now, no dependency.

### Documentation-only leftovers
- GAP-001 (empty `packages/uix` umbrella) — cosmetic.
- GAP-002 (stale README, not independently re-verified this pass or the prior audit).
- GAP-012 (CODEOWNERS stub) — organizational.

---

## 4. Dependency graph

```text
DECISION-B (external dependency policy — genuinely open)
    → blocks GAP-019 (Chart) and GAP-020 (Editor) independently
    → blocks any FUTURE non-Prime dependency need generically until resolved
    — resolving this requires a human policy choice among 3 already-enumerated
      options; further investigation alone does not settle it

DECISION-C, narrowed (Table/Data architecture — genuinely open, smaller than before)
    → blocks TreeTable/OrderList/PickList/DataView (4 of 8 original Data rows;
      Table/Scroller/Paginator's OWN architecture question is already answered)
    ← the cheapest possible next move is VERIFICATION, not new research:
      does Table's proven Paginator/Scroller/sort/selection/editing composition
      generalize to these 4, or does each need its own pass? This alone could
      retire most of the decision's remaining scope at near-zero cost.

GAP-013/DECISION-D (Tree-family — correctly protected, not actionable)
    → blocks Tree, TreeTable, TreeSelect, OrganizationChart (4 components)
    — TreeTable appears in BOTH this list and DECISION-C's list above; it is
      double-gated (needs DECISION-C's fuller-Data resolution AND is
      Tree-adjacent) — in practice, TreeTable is unlikely to proceed before
      DECISION-D's own Tree-family question is separately re-opened with real
      evidence, since TreeTable inherits Tree's hierarchical-identity problem

GAP-018 (Angular Form foundation — no decision needed, pure implementation)
    → blocks ~20 native-input Form components — Angular only
    → independent of every decision above; can start immediately

GAP-009/GAP-023 (Angular tree-shaking) + GAP-007 (Angular overlay stacking)
    → both independent of every other item; proven patterns exist in
      sibling frameworks; can start immediately, in parallel with GAP-018
      or with each other

GAP-017 (remaining component-family expansion, ~90+ areas)
    → the largest body of work; each family is independently startable
      EXCEPT where it needs GAP-018 (Form family specifically) or
      DECISION-B/C/D (Chart, Editor, fuller-Data, Tree-family specifically)
    → everything else (Overlay, Navigation, Panel/Layout/Display) is
      unblocked today

GAP-036/GAP-037/GAP-010 (small documentation/artifact backlog)
    → block nothing; independent of everything above

A first real release (Track C's disclosed gap)
    → blocked only by a deliberate business decision to cut one — not by
      any remaining engineering work; independent of every architectural
      item above
```

**Does any currently open decision block a substantial amount of implementation?** Yes, one: **DECISION-B** is the only open decision whose resolution is a pure precondition (not merely a narrowing exercise) for starting real implementation work — Chart and Editor cannot begin at all until it resolves. DECISION-C's remaining scope, by contrast, may resolve almost entirely via verification alone (see Candidate 2, §5) rather than requiring a fresh architecture investment. DECISION-D is correctly non-actionable. DECISION-E blocks nothing until a release is imminent.

---

## 5. Candidate next tracks

Five candidates, ranked.

### Candidate 1 — Angular Form foundation tier (GAP-018)
- **Objective:** Build `ng-core`'s `BaseModelHolder`/`BaseInput` tier, unlocking Angular's native-input Form family (InputText, InputNumber, Textarea, Password, Slider, ToggleSwitch, RadioButton, and more).
- **Exact current evidence:** `find packages/ng-core/src -iname "*base-model*" -o -iname "*base-input*"` returns nothing (re-confirmed this pass). ADR-018's `UBaseEditableHolder` pattern (already used elsewhere in `ng-core`) is the proven template to extend.
- **Dependencies:** None — fully unblockable today.
- **Likely scope:** Foundation-tier work in `ng-core` first, then the first 1-3 Form components in `ng` to prove the pattern end-to-end, mirroring how the original 5→8 proof set was built incrementally.
- **Architectural risk:** Low — pattern already proven in this exact codebase for a related concern.
- **Expected value:** High — unlocks the single largest named Angular-specific gap, ~20 components.
- **What it unlocks:** The entire Angular Form family; indirectly increases framework parity pressure to check whether React/Vue have an equivalent tier (currently genuinely unknown, not just unchecked, per the reconciled audit).
- **Requires a human architectural decision first?** No.

### Candidate 2 — DECISION-C narrowed-scope verification (not new research)
- **Objective:** Determine, with a small and cheap investigation, whether Table's proven Paginator/Scroller/sort/selection/row-editing composition pattern should be the template for TreeTable/OrderList/PickList/DataView, or whether each genuinely needs its own architecture pass.
- **Exact current evidence:** The Table plan (`docs/superpowers/plans/2026-09-02-table-component-implementation.md`) never mentions DECISION-C directly (confirmed during Documentation Reconciliation) — it was scoped only to GAP-014. No one has yet asked the generalization question directly.
- **Dependencies:** None — fully unblockable today; requires only reading, not new implementation.
- **Likely scope:** A focused architecture-research pass (not a plan, not code) examining whether OrderList/PickList (drag/keyboard reordering, dual-list transfer) and DataView (grid/list toggle) share enough structural shape with Table's already-solved primitives to reuse the pattern, or whether their real Prime source diverges enough to need fresh research (matching the same six-pass discipline that produced `@ultimate/uix-data`/ADR-043).
- **Architectural risk:** Very low for the verification step itself; unknown until performed for whichever sub-question it doesn't resolve.
- **Expected value:** High relative to cost — could retire most of an open architectural decision for the price of one research pass.
- **What it unlocks:** Up to 4 Data-family components, or at minimum a clear, evidence-backed narrowing of what's actually still unresolved.
- **Requires a human architectural decision first?** No — this is investigation that precedes a decision, not the decision itself.

### Candidate 3 — Generate and commit `llms.txt`/`llms-full.txt` (GAP-036)
- **Objective:** Run the already-built, already-tested generator and commit its real output, closing Phase 9's last disclosed follow-up.
- **Exact current evidence:** `packages/ai/src/context-files.ts` exports real `renderLlmsTxt`/`renderLlmsFullTxt`/`generateContextFiles`; re-confirmed this pass that no committed output exists (local `dist/` byproducts are gitignored, unrelated).
- **Dependencies:** None.
- **Likely scope:** Trivial — run the generator, review its output for correctness, commit.
- **Architectural risk:** None.
- **Expected value:** Medium — a Blueprint-named deliverable (§25/§26), currently the only remaining piece of Phase 9's own chain.
- **What it unlocks:** Nothing architecturally; closes a disclosed gap.
- **Requires a human architectural decision first?** No.

### Candidate 4 — DECISION-B resolution (external dependency policy)
- **Objective:** Resolve the policy question ADR-004 left open for non-Prime dependencies, unblocking Chart and Editor.
- **Exact current evidence:** Zero Chart/Editor work anywhere (re-confirmed this pass); 3 options already enumerated in `BLUEPRINT_GAPS.md` §5, with a weak lean toward option (a) (extend Phase 0's existing provenance/license process generically).
- **Dependencies:** None — but this is the one candidate here that is itself a decision, not implementation.
- **Likely scope:** If resolved toward option (a): define the generic external-dependency approval criteria once; if toward option (c): formally scope Chart/Editor out and update the Blueprint's own component list accordingly.
- **Architectural risk:** Low-medium — first real license/provenance evaluation of a non-Prime library, if option (a) or a Chart/Editor build follows.
- **Expected value:** Medium directly (2 components), but sets precedent for every future non-Prime dependency need.
- **What it unlocks:** Chart, Editor, and removes a standing generic-policy gap.
- **Requires a human architectural decision first?** **Yes — this candidate IS the decision.** It cannot be "implemented" without the human choosing among the 3 options first.

### Candidate 5 — Angular tree-shaking / secondary entry points (GAP-009/GAP-023)
- **Objective:** Add per-component `exports` map entries to `packages/ng`, matching React/Vue's already-working pattern, closing Angular's tree-shaking gap.
- **Exact current evidence:** Re-confirmed this pass (`grep -c "exports" packages/ng/package.json` → 0, vs. `packages/react/package.json`/`packages/vue/package.json` → 1 each).
- **Dependencies:** None architecturally; a full re-measurement of tree-shaking through the real Angular linker still depends on GAP-008's broader real-consumer-app scope (separate, larger, already-deferred backlog) — but the `exports` map itself can be added and unit-verified independently.
- **Likely scope:** Small, mechanical — restructure `ng-package.json`'s entry points, verify via the existing `verify-tree-shaking.mjs` script.
- **Architectural risk:** Low — pattern proven twice already.
- **Expected value:** Medium — closes a real, named parity gap between frameworks.
- **What it unlocks:** Genuine Angular bundle-size confidence; framework parity claim.
- **Requires a human architectural decision first?** No.

### Ranking (highest to lowest recommended priority, by the stated criteria)
1. **Candidate 2** (DECISION-C verification) — highest value-to-cost ratio in this entire list; near-zero cost, could retire most of an open decision.
2. **Candidate 1** (GAP-018, Angular Form foundation) — highest absolute value, proven pattern, no decision blocker, largest unlock.
3. **Candidate 3** (GAP-036, llms.txt) — trivial cost, closes a disclosed Phase 9 follow-up, no reason to leave it open.
4. **Candidate 5** (GAP-009/023, Angular tree-shaking) — proven pattern, independent, moderate value.
5. **Candidate 4** (DECISION-B resolution) — real value, but it is the one candidate that is itself a human decision rather than a track the human could hand to an agent to execute directly.

---

## 6. Human decision point

**Recommendation for the next human decision, not a decision made on the human's behalf:**

The evidence in this audit points toward **two different, non-competing kinds of next step**, and the human's choice is really about sequencing between them, not about which is "correct":

- **If the goal is maximum unlock-per-effort right now:** the best next step is **Candidate 2** (DECISION-C's narrowed verification) — it is cheap, evidence-only, and could retire most of an open architectural decision without any implementation risk. This is "perform focused research before deciding" in the terms of this audit's own framing, but the research itself is small enough that it could plausibly be done in the same session as a decision about it.
- **If the goal is the single highest-value implementation track:** the best next step is **Candidate 1** (GAP-018, Angular Form foundation) — it requires no decision, has a proven pattern, and unlocks the largest remaining named gap in the registry.
- **DECISION-B is the one item in this audit that is itself a required human choice**, not something an agent can proceed on without it. If the human's priority is Chart/Editor specifically, that decision must come first; if not, it can be deferred indefinitely with no cost, exactly as it has been.

In short: this audit does **not** find a single item that must be decided before all other work can proceed — DECISION-B only blocks 2 named components plus a generic future policy, and GAP-018/Candidate 2/Candidate 3/Candidate 5 are all independently startable without any decision. The real next-human-decision is a **sequencing choice** among independently-valid options, not a forced architectural fork.
