# Phase B — Knowledge Reconciliation

**Document type:** Reviewed research output (documentation/knowledge-authority audit). Not a spec, not an implementation plan, not a decision record.
**Repository:** `ultimate`
**Audited against:** `main`
**Compiled:** 2026-09-16
**Scope:** Audit of the repository's full documentation/knowledge surface — what an AI agent should trust as current instruction, what it should consult only as evidence, and what it must never treat as active guidance. Research only. No repository files modified during the audit itself. No spec, no plan, no implementation. Frozen input for a Phase B Spec/Plan after review.

**Migration framing:** this document is Phase B of a three-phase effort — **Phase A (Migration Inventory) → Phase B (Knowledge Reconciliation, this document) → Phase C (Actual Migration)**. Phase B determines what the repository's documentation/knowledge surface should mean to a future AI agent; it does not itself resolve open choices or reopen protected architectural decisions.

**Process note on this document's provenance:** this report was produced across two independent research passes (one covering `docs/architecture/research/` + `docs/superpowers/specs/`, one covering `docs/superpowers/plans/` + `skills/` + `packages/ai/context/` + all package/app READMEs), then independently reviewed, merged, corrected, and republished by the coordinating session before being treated as final. It represents the reviewed final report, not an earlier automatically-published draft.

**Legend used throughout:**
- `[AUTHORITATIVE]` — current architectural truth
- `[HISTORICAL]` — real, dated, not current instruction
- `[CONFLICT/STALE]` — contradicts current reality
- `[GENERATED]` — derived output, never a source

---

## 1. Executive Summary

> **The central finding: Ultimate already has a correct authority hierarchy, stated explicitly and well-designed. The problem is not the absence of a hierarchy — it's that the hierarchy is not self-enforcing, and several real documents inside it have quietly drifted out of sync with what it promises.**

`AGENTS.md` §2 (created 2026-09-13, itself the shipped output of a dedicated research→spec→plan gate sequence — `2026-09-12-ai-orientation-design.md` → `2026-09-12-agents-md-orientation-design.md` → its implementation plan) already defines an 8-tier source-of-truth model: real repo evidence > Blueprint > ADRs > approved specs/plans > current-state tracking docs > research > README > AI context/Skills. This model is sound and this report does not propose replacing it. What this audit adds is empirical: **does the repository's actual ~113-document surface behave the way that hierarchy assumes?** The answer is mostly yes, with nine concrete, evidenced exceptions found this pass across two independent research passes (research/specs corpus; plans/skills/AI-context/READMEs corpus):

1. **A real, unfixed bug has zero durable documentation trail.** `packages/vue/src/tooltip/tooltip.ts`'s floating panel never applies a position-modifier class, so the tooltip is created but stays `display: none` and is never visible in Vue. Found once, by accident, inside a research document about an unrelated topic (SSR ID determinism) on 2026-09-12. Never promoted to `BLUEPRINT_GAPS.md`. Confirmed still present in source as of this audit.
2. **A documented corrective action was specified but never executed.** The approved `vue-dialog-id-scope-amendment` plan's Task 1 explicitly calls for appending a cross-reference note to two named documents once its fix shipped. The fix shipped (verified in source: `Dialog.vue` now uses `useId()`). The cross-reference note was never added — the original spec (`ssr-safe-component-id-generation-design.md`) still reads **"No sixth instance exists,"** which is now false and directly contradicted by a sibling document in the same directory.
3. **19 of 25 specs, and 25 of 26 plans, never update their own status after implementation ships.** Both self-report "Draft for review"/0-checked-boxes indefinitely, including for phases `ROADMAP.md` marks fully Complete with shipped, tested, in-production code. The same drift pattern repeats at both workflow gates, at comparable scale.
4. **All three framework-package READMEs understate real component count, not just Angular's.** `packages/{ng,react,vue}/README.md` each still describe a "5-component proof set"; real current counts are 14/8/9 respectively (18/8/9 counting Angular's foundation-tier pieces separately, per Phase A's inventory).
5. **A real, currently-blocked implementation task is invisible to the gap registry.** Paginator's Task 15 (rows-per-page/jump-to-page dropdown) is explicitly marked blocked pending an Ultimate Select-equivalent component — confirmed still true by Phase A's own React/Vue inventory (no Select exists in any framework yet) — but has zero entry anywhere in `BLUEPRINT_GAPS.md`.

None of these findings are architecturally significant — none reopens a protected decision, none changes what's actually true. But each is exactly the shape of thing that could mislead a future AI agent operating without this report: each is discoverable by direct grep, looks authoritative on its face, and is wrong or incomplete. Full detail in §4.

### What Phase B is NOT proposing

- Not proposing a new documentation subsystem. `docs/architecture/research/2026-09-12-ai-orientation-design.md` already reached and evidenced this conclusion for the adjacent orientation problem ("Ultimate does not need a new subsystem... an indexing and statement problem, not a content-generation problem") — this audit's own findings are consistent with, not contradictory to, that conclusion.
- Not proposing to reopen DECISION-B/C/D/E or any ADR.
- Not proposing to delete historical research — its evidentiary value is real (e.g. the SSR ID-determinism research is the entire reasoning trail behind 6 real commits). The proposal is to make staleness impossible to miss, not to erase history.

---

## 2. Current Knowledge/Documentation Surface

| Layer | Count |
|---|---|
| `docs/architecture/*.md` | 14 |
| `docs/architecture/research/` | 16 |
| `docs/superpowers/specs/` | 25 |
| `docs/superpowers/plans/` | 26 |
| Package `README.md`s | 14 |
| App `README.md`s | 3 |
| `skills/*.md` | 10 |
| Generated `llms*.txt` | 5 |

Plus root-level `AGENTS.md`, `README.md`, `CHANGELOG.md`, `SECURITY.md`. Total surface: **~113 markdown/text documents** that could influence an AI agent's understanding of architecture, decisions, scope, or migration state.

### Structural map

| Layer | Location | Role in the gated workflow (per `AGENTS.md` §3) |
|---|---|---|
| Governance baseline | `docs/architecture/BLUEPRINT.md` (1494 lines, 45 sections) | Architecture baseline — updated only for major decision/baseline/boundary/dependency/framework-strategy changes (§45, self-governing) |
| Binding decisions | `docs/architecture/DECISIONS.md` (47 ADRs) | Approved architectural decisions within Blueprint's scope |
| Approved scope | `docs/superpowers/specs/` (25), `docs/superpowers/plans/` (26) | Binding for their own scope once approved — output of Specification/Implementation-Plan gates |
| Current-state tracking | `BLUEPRINT_GAPS.md`, `ROADMAP.md`, `COMPONENT_INVENTORY.md`, `PERFORMANCE.md`, `MIGRATION.md`, `COMPATIBILITY.md`, `PROVENANCE.md`, `DEPENDENCIES.md`, `PACKAGE_ARCHITECTURE.md`, `ACCESSIBILITY_BASELINE.md`, `SAST_BASELINE.md`, `AI_ARCHITECTURE.md` | Output of the Research/Architecture-Discussion/Decision gates — "the layer most likely to be stale relative to reality" per `AGENTS.md`'s own admission |
| Dated evidence | `docs/architecture/research/*.md` (16) | Point-in-time research/audit snapshots feeding specs |
| Descriptive | root `README.md`, package/app `README.md`s (17), `CHANGELOG.md` | Onboarding/descriptive — not authoritative for current state |
| AI-facing generated/authored | `skills/*.md` (10), `packages/ai/context/*.txt` (5), `packages/ai/README.md` | One-directional consumers of everything above — mechanically generated from component metadata, or hand-authored prose validated against it |
| Orientation | `AGENTS.md` (119 lines) | The hierarchy statement itself, plus operating rules — deliberately narrow, points elsewhere rather than restating |

---

## 3. Authority Classification

Applying the outer task's 10 questions to each layer. Full per-document classification for the research/ and specs/ corpus (41 files) is large; this section gives the layer-level pattern, §4/§9 give the specific documents that deviate from their layer's expected pattern.

| Artifact | Purpose | Class | AI should read? | Actionable decisions? | Superseded material risk? | Duplicates elsewhere? |
|---|---|---|---|---|---|---|
| `BLUEPRINT.md` | Architecture baseline, governance | `[AUTHORITATIVE]` | Yes, always | Yes (§43 DECIDED list) | Low — self-governs, updated only 0 times since Phase 0 per its own §45 rule (confirmed: 2026-09-13 audit found zero changes since ADR-045) | No — sole source for architectural principles |
| `DECISIONS.md` | 47 binding ADRs | `[AUTHORITATIVE]` | Yes, always | Yes, every entry | Low — each ADR cites specific file/line evidence per the 2026-09-13 audit's own spot-check | Partial overlap with `COMPONENT_INVENTORY.md`'s per-component narrowing notes (complementary, not contradictory) |
| `BLUEPRINT_GAPS.md` | Open gap/decision registry | `[AUTHORITATIVE]` (current-state tier) | Yes, re-verify before consequential use | Yes — this is where "protected decisions" live (§5) | **Medium** — confirmed to contain a duplicated, contradictory DECISION-B/C pair (§4 below); does not yet track the two Vue bugs found in §1 | No |
| `ROADMAP.md`, `COMPONENT_INVENTORY.md` | Phase status, per-component classification | `[AUTHORITATIVE]` (current-state tier) | Yes | Low — both mechanically re-verified as recently as this session's Phase A work | No | No |
| Specs (25), approved subset | Binding scope for their own phase | `[AUTHORITATIVE]` for scope / `[HISTORICAL]` for status | Yes for scope decisions; ignore self-reported `Status:` field, check `ROADMAP.md` instead | Yes, within scope | **High** — 19/25 self-report "Draft for review" despite shipped implementation (§4) | Partial — narrows/restates Blueprint sections |
| Plans (26) | Task-level execution record | `[HISTORICAL]` (execution record, not forward-looking instruction) | Conditionally — for understanding why code looks the way it does | No — describes what was done, not what should be done next | Low — plans are terminal artifacts by nature | No |
| Research (16) | Dated point-in-time snapshots | `[HISTORICAL]` | Conditionally — as evidence trail, never as current fact without re-confirmation | No directly — decisions only become actionable once promoted to an ADR/gap entry | **High** — at least 1 confirmed live contradiction, 1 confirmed unpromoted bug finding (§4) | **High** — 5-document 2026-09-12/13 audit chain substantially re-covers the same ground each time (§4) |
| Package/app READMEs (17) | Onboarding, package-level description | `[HISTORICAL]` (descriptive) | Optional | No | **Medium** — `packages/ng/README.md` confirmed stale (§4) | Yes — restates provenance/component counts already in `COMPONENT_INVENTORY.md`/`PROVENANCE.md` |
| `AI_ARCHITECTURE.md` | AI/tooling constraints, "restated from Blueprint" | `[GENERATED]`/derivative | Low value — Blueprint §14/§2.6/§2.7/§6 already say the same thing | No new decisions | **Medium** — still framed as "Phase 0 preserves... no implementation," but `cli`/`mcp`/`ai` are now real, shipped packages (§4) | Yes, fully — every line traces to a cited Blueprint section |
| Skills (`skills/*.md`) | AI operational guidance per component | `[GENERATED]` + hand-authored, mixed | Yes, by AI agents/tools consuming them — never upstream authority | No — consumes metadata, doesn't decide anything | Low — marker-delimited generated sections mechanically validated against metadata (`bin-validate.mjs`); hand-authored prose is the only unverified part, and is scoped narrow by design | By design — mirrors component-metadata |
| `llms*.txt` | Generated LLM-context snapshot | `[GENERATED]` | Optional, external-consumer-facing | No | Low — one-time committed snapshot, not CI-regenerated, disclosed as such (GAP-036, ROADMAP footnote 5) — not misleading because its non-live nature is already documented | Yes, by design — derived from metadata |

---

## 4. Conflicts, Duplicates, and Stale Artifacts

### 4.1 Confirmed live contradiction — sixth Dialog ID-counter instance

> **Side A** — `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md:25`: *"No sixth instance exists. Confirmed by a targeted grep... not re-run here since the origin document already establishes this as exhaustive."*
>
> **Side B** — `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md` (same day, later): found and source-verified a sixth instance in `packages/vue/src/dialog/Dialog.vue:84,124`.
>
> **Resolution status** — a separate, approved spec+plan (`2026-09-12-vue-dialog-id-scope-amendment.md` + its implementation plan) fixed it. **Verified directly in current source**: `packages/vue/src/dialog/Dialog.vue` now imports and calls `useId()`, with regression tests in `dialog.spec.ts`. The fix is real.
>
> **What's still broken**: the amendment plan's own Task 1 required appending a cross-reference note back to both Side A's document and the original research document. **That note was never added to either file** (confirmed by direct grep — zero occurrences of "sixth instance" or the amendment doc's filename in either target). A future agent reading the original spec in isolation will find a categorical, confident, false claim with no visible pointer to its own correction.

### 4.2 Confirmed unfixed, undocumented bug — Vue Tooltip never becomes visible

> **Finding source**: buried inside `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` §(tooltip aside), explicitly flagged there as *"unrelated to SSR determinism or hydration"* — a side-finding inside an unrelated document.
>
> **Verified directly in current source**: `packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` builds the floating panel's class list as `["u-tooltip", binding.class]` — no `u-tooltip-{position}` modifier class is ever added (grepped directly, zero matches). `packages/uix-styles/src/tooltip/index.ts`'s base `.u-tooltip` rule sets `display: none`; nothing ever sets it visible.
>
> **Tracking status**: absent from `BLUEPRINT_GAPS.md` entirely (grepped — the only Tooltip entry there is GAP-006, Angular's unrelated `aria-describedby` issue, already resolved). Vue-only; not reproduced in Angular or React per the finding's own scope note. **This is a real, live, user-facing defect with zero durable tracking anywhere outside one buried paragraph in a research document about a different topic.**

### 4.3 Systemic — spec self-reported status vs. real implementation status

| Spec's own `Status:` field | Count | Examples |
|---|---|---|
| Still says "Draft for review" / "Draft for Spec Review" | **19 of 25** | Phase 0, Phase 1, uix-data foundation, Paginator, Scroller, Table, Phase 6 (metadata), Phase 7 (CLI), Phase 9 (AI/Skills), all 6 Phase 10 track specs, SSR-safe-ID-generation, vue-dialog-id-scope-amendment, blueprint-completion — **despite `ROADMAP.md` marking every one of these phases "Complete"** and real, tested, shipped code existing for all of them |
| Updated to "Approved" or equivalent | 6 | Phase 2 (Angular), Phase 3 (React), Phase 4 (Vue), Phase 5 (Themes), Phase 8 (MCP), Angular base-input, Angular form-foundation |

This is not a functional problem today — `AGENTS.md` §2 already tells an agent to trust `ROADMAP.md` over a spec's own status claim for "is this phase done" questions, and the gate gap is closed by the existence of a corresponding plan document. But it is a real, mechanical pattern (76% of specs) that a naive reading would misinterpret, and it is trivially, cheaply fixable.

### 4.4 Duplicate/contradictory entries inside BLUEPRINT_GAPS.md itself

Already found and disclosed by the most recent research pass (`2026-09-13-blueprint-closure-current-state-reconciliation.md` §5.9, not re-derived here, cited for completeness): §5 of `BLUEPRINT_GAPS.md` contains a corrected DECISION-C entry, followed later in the same section by a stale, pre-correction copy of the same decision — an editing artifact, not two genuine positions. That audit explicitly declined to fix it (documentation-only, out of its own no-modify scope) and flagged it "for the next documentation-hygiene pass." **This report treats it as still open** — confirmed present, not yet cleaned up as of this audit.

### 4.5 Redundant research-document cluster (2026-09-12/13)

Six documents dated 2026-09-12/13 substantially re-cover the same ground in sequence, each explicitly building on/re-verifying the last: `post-phase-10-blueprint-reconciliation-audit` → `ai-knowledge-architecture-assessment` → `project-reality-and-ai-operating-model-audit` → `ai-orientation-design` → `next-work-prioritization-audit` → `blueprint-closure-current-state-reconciliation`. This chain is not wasted work — each pass narrowed genuine uncertainty and the final one (`blueprint-closure...`) explicitly re-verifies rather than re-derives the earlier ones' findings. But a future agent grepping for "is X resolved" could land on any of the 6 and get a slightly different-vintage answer; only the *last* one in the chain (2026-09-13) is the current word, and nothing marks the other 5 as superseded-for-their-conclusions (they remain valid as evidence, but a reader needs to already know the chain order to know which is current). `next-work-prioritization-audit.md` is the weakest link — cited by only 1 other document (itself, transitively, via the AGENTS.md implementation plan's "did not touch" disclaimer) — effectively orphaned once its own recommendations were superseded by the next phase actually starting.

### 4.6 Stale package READMEs — confirmed on all three framework packages, not just Angular

`packages/ng/README.md:3` states *"Button, Checkbox, Dialog, Menu, Tooltip"* (5 components). Real current state: 14 real components in `packages/ng/src/` (Phase A's inventory: 18 counting foundation-tier pieces separately). **A second, independent pass over `docs/superpowers/plans/`, `skills/`, `packages/ai/context/`, and all 17 READMEs found the same drift is not Angular-specific**: `packages/react/README.md:3` also states 5 components against 8 real; `packages/vue/README.md:3` also states 5 against 9 real. All three framework-package READMEs — the first file anyone opens when starting work in a given package — currently understate real component count by roughly half to nearly 3×. Foundation-tier READMEs (`ng-core`/`react-core`/`vue-core`/`themes`/`uix-*`) make no component-count claims and were confirmed accurate; app playground READMEs are confirmed accurate and correctly self-aware ("not a playground, showcase, or demo application").

### 4.7 AI_ARCHITECTURE.md's stale framing

Still reads "Phase 0 preserves these constraints architecturally without implementing them" and "no implementation" for `cli`/`mcp`/`ai` — all three are now real, shipped packages (Phases 7/8/9, both Complete per `ROADMAP.md`). The underlying *constraints* it states (boundary rules, dependency direction) remain true and CI-enforced; only the "not yet implemented" framing is stale. Low risk (the constraint itself is still correct and independently stated in `BLUEPRINT.md` §2.6/§6), but a fresh reader skimming only this file would wrongly conclude these three packages don't exist yet. `packages/ai/README.md` and `packages/mcp/README.md` compound this: both still carry a bare "(Phase 8)"/"(Phase 9)" label and both have an empty "## Status" section with no content after the heading — a reader can't tell "is this shipped?" from the README alone, only by cross-referencing `ROADMAP.md`.

### 4.8 Plan documents never self-update after implementation ships

Across all 26 files in `docs/superpowers/plans/`, only one (`2026-09-13-blueprint-completion.md`, 34/52 boxes checked) shows any task-completion tracking. Every other plan sits at 0 checked boxes and an unchanged "Draft for review" header status, regardless of whether `ROADMAP.md` marks that phase fully Complete with shipped, tested code. This is the plan-tier mirror of §4.3's spec-status finding — **the same pattern exists one gate later in the workflow, at comparable scale (25 of 26 plans affected).** A plan's own self-reported status or checkbox state is not a reliable completion signal; `ROADMAP.md` (or real source) is the only reliable cross-reference, exactly as tier 5 of the hierarchy already prescribes — but nothing in the plan document itself points a reader there.

### 4.9 Real, current, unresolved blocker documented only inside a plan file — absent from the gap registry

`docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` Task 15 (rows-per-page/jump-to-page dropdown UI) carries its own explicit status marker: **"BLOCKED pending an Ultimate Select-equivalent component."** Confirmed still blocked: Phase A's own React/Vue inventory work (this session, prior turn) verified no Select component exists yet in any of the three frameworks. `BLUEPRINT_GAPS.md` has zero entry for this — grepped directly, the registry's Paginator-adjacent entries cover only the already-resolved Angular secondary-entry-point gaps. An agent relying on the gap registry as the single source for "what's still open" — exactly the trust `AGENTS.md` §2 tier 5 asks for — would never learn Paginator has a real, currently-blocked, unshipped task.

### 4.10 Skills' operational-guidance sections are ~80% unpopulated

Per Blueprint §24, a Skill "may contain" preferred patterns, anti-patterns, accessibility guidance, and related components — not merely an API reference. Direct read of all 8 per-component skill files found: the marker-delimited `allowed-apis` section is populated and accurate in all 8; `preferred-patterns`, `anti-patterns`, and "When to use" are empty in all 8; only `table.md` has any content in `accessibility-guidance` or `related-components`. This is not a staleness or authority risk — the marker-boundary design correctly prevents unvalidated prose from being mistaken for generated fact, and `skills/README.md`'s own rule ("never claim a fact... that isn't already backed by a marker-section's generated content") is honored throughout. It is a completeness gap: today's Skills function as auto-generated prop-reference sheets, not yet the fuller operational guidance Blueprint §24 envisions. Worth noting for Phase C planning, not a Phase B documentation-hygiene item.

### 4.11 AI context files (llms*.txt) have no regeneration guard against future drift

Confirmed: `llms*.txt` generation is wired into `packages/ai`'s own local `build` script, not into any `.github/workflows/*.yml` — zero CI references found. Today's committed snapshot is accurate against the real current 8-component proof set (spot-checked). But nothing mechanically forces regeneration when `component-metadata` grows — e.g. the moment Angular's real 14-component set (per Phase A) gets corresponding metadata records, `llms.txt` silently under-represents it until someone remembers to rebuild and recommit by hand. This compounds §10's existing finding that the snapshot is correctly disclosed as non-live (GAP-036) — the disclosure is honest today, but nothing prevents the gap between disclosure and reality from silently widening.

---

## 5. AI Misinterpretation Risks

Concrete failure scenarios a future agent could hit, ranked by how easy each is to fall into.

#### Risk 1 — Trusting a spec's own status field over ROADMAP.md (High likelihood, Low-Medium impact)

An agent asked "is Phase 9 approved?" that greps the spec directly (rather than consulting `ROADMAP.md` first, as `AGENTS.md` §2 actually instructs) finds "Draft for review" and could incorrectly conclude the phase is unapproved/blocked, when it shipped and is Complete. Mitigated today only by an agent already knowing to check the higher tier first — not by the document itself being self-correcting.

#### Risk 2 — Treating "No sixth instance exists" as current fact (Medium likelihood, Medium impact)

An agent researching the SSR ID-counter defect class, landing on the original spec rather than the amendment, would state a false negative about Dialog's status — potentially re-introducing the counter pattern elsewhere on the mistaken belief the class of bug was fully and finally enumerated.

#### Risk 3 — Never discovering the Vue Tooltip bug at all (Medium likelihood if searched for; near-zero if not)

No document whose title, gap-ID, or tracking-table entry would surface this under a "tooltip" or "accessibility" or "known issues" search. Only discoverable by reading the full text of an SSR-focused research document unrelated to the actual defect. An agent asked to "list known Vue component bugs" would very likely miss it via any reasonable search strategy.

#### Risk 4 — Mistaking a completed phase's spec Non-Goals for still-current platform-wide scope boundaries (Low-Medium likelihood, Low impact)

E.g. Phase 3's spec excludes `URipple` "in Phase 3" (ADR-031) — narrow, phase-scoped, and in fact Ripple was later built. A spec's own "Non-Goals" section, read without its date/phase context, could be mistaken for a permanent boundary. Mitigated by ADRs' own "Status: Accepted (Phase N spec...)" framing being explicit about scope, but only if the agent reads the ADR and not just the spec in isolation.

#### Risk 5 — Treating research-document findings as adopted decisions (Low likelihood given AGENTS.md §2's explicit tier language, but real)

Several research documents (e.g. `ai-knowledge-architecture-assessment.md`) explicitly self-label "any decision implied below is a candidate for human approval, not a resolution" — well-guarded. But not every research document is this careful, and nothing mechanically prevents a future document from omitting the caveat.

#### Risk 6 — Redundant re-research (Low impact, wastes effort not correctness)

An agent tasked with "assess whether the AI knowledge architecture is sound" today has no way to know 3 documents already did exactly this in the last 4 days without reading all 3 first. Not a correctness risk, but a real cost risk for exactly the kind of task Phase C will generate more of.

---

## 6. Proposed Knowledge Authority Hierarchy

**Recommendation: keep AGENTS.md §2's 8-tier model as the frozen baseline — do not redesign it.** It is already correct in structure. The findings in this report are about tier-5/tier-6 documents individually drifting out of compliance with the model, not about the model being wrong. Presented here restated with this audit's own evidence attached to each tier, plus the one structural addition this audit recommends.

**Tier 0 — new, recommended addition — Phase A/B/C frozen inventory & reconciliation reports themselves.** Once approved, this report and the Phase A inventory become their own tier — durable, dated, but explicitly superseding the research documents they synthesize for the specific questions they answer. Without this tier, a future agent has no way to know this reconciliation happened at all except by re-discovering the same drift independently.

**Tier 1 — unchanged — Real repository evidence.** Confirmed still correct as the top tier — every concrete finding in this report (the two Vue bugs, the spec-status drift) was only findable by going to tier 1 directly, exactly as the model prescribes.

**Tier 2 — unchanged — `BLUEPRINT.md`.** Confirmed self-governing and stable (zero changes since Phase 0 per the 2026-09-13 audit). No issue found.

**Tier 3 — unchanged — `DECISIONS.md` (ADRs).** Confirmed evidence-cited throughout, no drift found.

**Tier 4 — clarify, don't change — Approved specs/plans.** The model already says these are "binding for their own scope" — this audit's finding is that the documents' own self-reported `Status:` field is **not part of that binding scope** and should never be read as a currency signal. Recommend the hierarchy text gain one clarifying sentence: a spec's internal `Status:` field reflects its state at last edit, not current state — always cross-check `ROADMAP.md` for phase-level currency.

**Tier 5 — unchanged, but under-monitored — Current-state tracking docs.** `BLUEPRINT_GAPS.md`'s duplicate DECISION-C entry and its missing Vue-bug entries are exactly the "most likely to be stale" failure this tier already warns about — the warning is correct, but nothing currently forces re-verification on a cadence; it only happens when a workstream happens to touch that area.

**Tier 6 — unchanged — Research documents.** Confirmed genuinely valuable as evidence (the SSR ID-counter finding chain is the actual reasoning trail behind 6 real commits) and correctly non-authoritative. The redundancy in the 2026-09-12/13 cluster is a navigability problem, not an authority problem — the model already says "not for current truth without re-confirmation," which held up in every case checked this pass.

**Tier 7 — unchanged — READMEs.** Confirmed correctly non-authoritative in the model; the `packages/ng/README.md` drift is exactly the kind of staleness this tier's low authority is supposed to protect against — it worked as designed, in the sense that nothing downstream trusted the stale claim, but the file itself should still be fixed for human readers.

**Tier 8 — unchanged — AI context/Skills/llms.txt/MCP.** Confirmed well-architected: marker-delimited generated sections, mechanically validated, one-directional by construction. No issue found in this tier.

---

## 7. What Must Be Authoritative for Migration

For Phase C (Actual Migration) to proceed safely, an agent must be able to trust, without re-verification, exactly these documents for exactly these questions:

| Question Phase C will ask | Trust this document | Caveat |
|---|---|---|
| What architectural principles must every migrated component honor? | `BLUEPRINT.md` | None — stable, self-governing |
| Why was a specific architectural choice made for an already-built component? | `DECISIONS.md` | None — evidence-cited |
| What is a component's current build status (built/partial/not started)? | `docs/architecture/COMPONENT_INVENTORY.md` (Angular) + the Phase A report (React/Vue) | Phase A's React/Vue findings are not yet folded into a committed document — see §11 |
| Is a given gap/decision still open, or resolved? | `BLUEPRINT_GAPS.md` | Missing the 2 Vue bugs found in §4.1/§4.2 — must be added before Phase C starts touching Vue Dialog/Tooltip-adjacent work |
| What is currently protected from reopening? | `BLUEPRINT_GAPS.md` §5 | Contains one duplicate/stale entry (§4.4) — cosmetic but should be cleaned before relying on a first-read-only pass |
| What exactly was scoped/excluded for an already-shipped phase? | That phase's own approved spec, read alongside its governing ADR | Ignore the spec's own `Status:` field; the ADR is the durable record of what was decided |

---

## 8. What Should Remain Historical/Supporting

- **All 26 implementation plans** — genuine execution records, valuable for understanding why code looks the way it does, never forward-looking instruction. No changes recommended.
- **All 16 research documents** — genuine evidence trail. Recommend retaining all, with the single addition of a superseding-chain index (§11) so a reader can tell which of the 2026-09-12/13 cluster is current without reading all 6.
- **17 package/app READMEs** — legitimate onboarding value, correctly non-authoritative already. Fix the one confirmed-stale claim (`packages/ng/README.md`), no structural change needed.
- **19 "Draft for review"-labeled specs** — the content is not wrong, only the status field is stale. Retain the documents as-is; fix the field (§9/§11).

---

## 9. What Should Be Updated, Consolidated, Archived, or Deleted

Per the task's instruction, genuine choices are presented as alternatives, not decided here.

### Update (low-risk, mechanical, no architecture judgment required)

- 19 specs' `Status:` fields → change to reflect real state (e.g. `"Approved — implemented, see ROADMAP.md Phase N"`), matching the pattern the 6 already-updated specs use.
- `packages/ng/README.md` — replace "5-component proof set" with current count/reference to `COMPONENT_INVENTORY.md`.
- `AI_ARCHITECTURE.md` — update "Phase 0 preserves... no implementation" framing to reflect that `cli`/`mcp`/`ai` are now real, shipped packages (the underlying constraint text can stay, only the implementation-status framing is stale).
- `BLUEPRINT_GAPS.md` §5 — remove the duplicate, stale DECISION-B/C block (already identified and deferred by the 2026-09-13 audit; this report re-confirms it's still present).
- `BLUEPRINT_GAPS.md` — add two new gap entries for the Vue Tooltip visibility bug (§4.2, unfixed) and a documentation-completeness entry for the Dialog sixth-instance cross-reference (§4.1, code fixed, docs incomplete).
- `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md` and `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` — add the cross-reference note the approved amendment plan's Task 1 already specified but never executed.

### Genuine choices — present alternatives, do not decide here

**Choice A — the 6-document 2026-09-12/13 reconciliation-audit cluster.**
- *Option 1:* Leave all 6 as-is, add a short index note at the top of each pointing to the chain order and marking which is currently authoritative (2026-09-13's `blueprint-closure-current-state-reconciliation.md`). Lowest effort, preserves full evidence trail.
- *Option 2:* Consolidate the chain's still-relevant conclusions into a single new "Knowledge State as of [date]" document, explicitly marking the 6 source documents as archived/superseded-for-conclusions (not deleted). Higher effort, but removes the "which of 6 do I trust" navigation problem entirely.
- *Option 3:* Do nothing beyond what this Phase B report itself already provides — this report functionally is the consolidation, so a future agent finding it could treat it as sufficient without further doc changes.

**Choice B — `docs/architecture/research/2026-09-12-next-work-prioritization-audit.md` (the orphaned, 1-citation document).**
- *Option 1:* Leave in place as ordinary historical research — it did real work at the time (informed the AGENTS.md orientation workstream's prioritization) even though its specific recommendations were since superseded by that workstream actually completing.
- *Option 2:* Mark explicitly superseded in a one-line header note, since its core question ("what should we do next") has a different, later answer now (Phase A/B of this very migration effort).

**Choice C — whether "Update" tasks above (spec status fields, README counts, AI_ARCHITECTURE.md framing) get executed as small mechanical fixes now, or get folded into whatever Phase B Spec/Plan follows this report.**
- *Option 1:* Execute now, as pure documentation-hygiene, no architecture judgment involved (matches how GAP-037/§5.9's cleanup was already deferred to "the next documentation-hygiene pass" by a prior audit — this could be that pass).
- *Option 2:* Fold into the Phase B Spec/Plan explicitly, since the user's own instructions for this session forbid any repository file changes in this turn.

Given this session's explicit "do not modify repository files" constraint, Option 2 is the only one available *this turn* regardless — flagged here as a choice for the Phase B Spec, not a live option right now.

### Delete

**Nothing found in this audit warrants deletion.** Every document checked has either current authority, genuine historical/evidentiary value, or is a small, cheaply-fixable staleness case — not a candidate for removal. This is worth stating plainly since the task explicitly asked not to assume documents should be kept "simply because they contain useful historical information" — the recommendation here is retention on the stronger grounds of each document's specific, checked value, not a default.

---

## 10. AI-Facing Context and Skills Implications

- **Skills architecture is sound.** Marker-delimited generated sections (`preferred-patterns`, `allowed-apis`, `anti-patterns`, `accessibility-guidance`, `related-components`) are mechanically regenerated and validated (`bin-validate.mjs` checks marker structure and generated-section fidelity against real metadata) — hand-authored prose is explicitly, structurally isolated from anything metadata-backed, and `skills/README.md` states the rule plainly: "never claim a fact... that isn't already backed by a marker-section's generated content." This is a correctly-designed one-directional consumer, exactly matching Blueprint §2.7/§24's intent.
- **`llms*.txt` is correctly non-authoritative and correctly disclosed as non-live** (one-time committed snapshot, not CI-regenerated — confirmed via `.github/workflows/` grep, zero hits). No misinterpretation risk found, because the staleness is already disclosed at the tracking-doc level (GAP-036, ROADMAP footnote 5) rather than hidden.
- **MCP tool responses** read `@ultimate/component-metadata`'s real 8-component set directly at request time (per Phase 8's shipped implementation) — genuinely live, not a stale snapshot risk the way `llms.txt` is. This is a meaningfully different currency profile from the other tier-8 artifacts and could be worth a one-line distinction in `AGENTS.md`'s tier-8 description (currently lumps MCP responses in with the static `llms.txt` snapshot, when MCP is actually live).
- **No mechanism currently prevents a future document from omitting research documents' own self-caveating language** (§5, Risk 5) — this is a process/authoring-discipline gap, not a current live problem, since every research document checked this pass did include appropriate caveats.

---

## 11. Required Documentation Changes

Consolidated from §9, ordered by whether they require a decision (§12) or are purely mechanical.

#### Mechanical (no decision needed, low risk)

1. Fix 19 specs' `Status:` fields.
2. Fix 25 plans' status headers/checkboxes, or adopt a documented convention that plan headers are permanently frozen pre-implementation by design (a decision, not purely mechanical — see §12).
3. Fix `packages/{ng,react,vue}/README.md`'s stale component-count claims (all three, not just Angular).
4. Fix `packages/ai/README.md` and `packages/mcp/README.md`'s empty "## Status" sections.
5. Fix `AI_ARCHITECTURE.md`'s stale "not yet implemented" framing for `cli`/`mcp`/`ai`.
6. Remove `BLUEPRINT_GAPS.md` §5's duplicate DECISION-B/C block.
7. Add the cross-reference note the approved `vue-dialog-id-scope-amendment` plan's Task 1 already specified.

#### Requires a new gap entry, not yet decided how to phrase/scope (small architecture judgment, not a fork)

1. New `BLUEPRINT_GAPS.md` entry: Vue Tooltip position-modifier class never applied, tooltip never visible (§4.2). Recommend Angular-Tooltip-adjacent numbering (near GAP-006) given the topical relationship, but this is a documentation-organization choice, not evidence.
2. New `BLUEPRINT_GAPS.md` entry: Paginator Task 15 (rows-per-page/jump-to-page dropdown) blocked pending a Select-equivalent component, currently untracked outside its own plan file (§4.9).

#### Requires user choice among genuine alternatives (§9)

1. Choice A — how to handle the 6-document 2026-09-12/13 reconciliation cluster.
2. Choice B — whether to mark `next-work-prioritization-audit.md` explicitly superseded.
3. Choice C — execute mechanical fixes now vs. fold into Phase B's own Spec/Plan.

---

## 12. Open Decisions Requiring User Approval

1. **Choice A (§9)** — index-note vs. consolidate vs. rely-on-this-report for the 6-document reconciliation cluster.
2. **Choice B (§9)** — whether to mark `next-work-prioritization-audit.md` explicitly superseded or leave as ordinary historical research.
3. **Choice C (§9)** — timing: execute the 5 mechanical fixes as a standalone documentation-hygiene pass now, or fold them into the upcoming Phase B Spec/Plan.
4. **New — should `AGENTS.md` §2 gain the one-sentence clarification proposed in §6 Tier 4** (a spec's own `Status:` field is not a currency signal — cross-check `ROADMAP.md`)? This is a small, low-risk addition to an already-good document, but `AGENTS.md` itself is a governed artifact per its own creation process and shouldn't be silently touched.
5. **New — should tier 8 of the hierarchy distinguish live MCP responses from static `llms.txt` snapshots** (§10)? Currently lumped together; both are correctly non-authoritative, but their staleness risk profile genuinely differs.
6. **New — proposed Tier 0 addition (§6)**: should this Phase B report (and the Phase A inventory) become a tracked, durable artifact in the hierarchy once approved, or remain a one-off conversation deliverable? If tracked, where — a new `docs/architecture/knowledge/` directory, or folded into existing `research/`?
7. **New — plan-status convention (§4.8/§11)**: should all 25 affected implementation plans get a post-hoc status update pointing to `ROADMAP.md`, or should the repository instead adopt and document a permanent convention that plan headers freeze at pre-implementation status by design (making the current pattern intentional rather than drifted)? These are materially different fixes — one touches 25 files, the other touches one sentence in `AGENTS.md`'s workflow description.

---

*Phase B — Knowledge Reconciliation. Research/audit only. No repository files modified during the audit itself, no protected decision reopened, no spec or plan authored. Findings sourced from direct repository inspection (file reads, grep, source verification) — every claim in §4 was independently confirmed against real current source, not merely cited from a prior document. Frozen for review before a Phase B Spec/Plan is authored.*
