# G3-E E-1 — E1-V2 disposition proposal

**Date:** 2026-10-08  
**Status:** Proposal for human approval; no disposition, remediation or next step is applied by this document.

## 1. Decision scope

Decide how to carry forward Angular `imagecompare/root-style` now that E1-V2's cause is established. The finding remains **Class B / OPEN**. This document analyzes A (retain open), B (separate remediation workstream), and C (intentional difference). A and B can coexist: opening a separately gated workstream would not close the finding.

Sources: the [corrected Stage 2 investigation](2026-10-08-gap-064-g3e-e1-v2-stage2-corrected-investigation.md), [E-1 record](2026-10-08-gap-064-g3e-e1-record.md), [Stage 1](2026-10-08-gap-064-g3e-e1-v2-stage1-investigation.md), [original Stage 2 failure](2026-10-08-gap-064-g3e-e1-v2-stage2-investigation.md), [Parity Playbook §§8–10](../PARITY_PLAYBOOK.md), [approved Spec §§6.2–8, 10–12](../../superpowers/specs/2026-10-08-gap-064-g3e-media-data-design.md), and [approved Plan Tasks 6–7 and execution constraints](../../superpowers/plans/2026-10-08-gap-064-g3e-media-data.md). Later explicit user boundaries restrict the approved mapping to the recorded groups and require a separate ruling for further work. General permission for style-module B fixes does not supersede those boundaries.

Historical documents remain unchanged. The E-1 record's earlier “cause undetermined” statement describes that earlier evidence state; the corrected diagnostic supplies the subsequent causal finding without rewriting history.

## 2. Established technical evidence

The saved corrected diagnostic used one pass, zero retries, both sides, Playwright 1.63.0 Jammy / Chromium 153.0.8010.12, and 1280×720. No browser or verification run is performed for this proposal.

| Measured y/top, CSS px    | PrimeNG | Ultimate | Ultimate − Prime |
| ------------------------- | ------: | -------: | ---------------: |
| Root                      |      19 |       19 |                0 |
| First/original left image |      16 |       16 |                0 |
| Second/right image        |      16 |       19 |           **+3** |
| Slider                    |      18 |       18 |                0 |

The **second/right image is `landscape-2.png`, the blue image visible in the clipped left region**. PrimeNG places it directly against the inline root at root−3. Ultimate places it inside an absolute span: root→span = 0 and span→image = 0. The difference is therefore `(19 + 0) − (19 − 3) = 3 px`.

H2 (containing block/wrapper) is established; H1 (inline/static placement) supports the same relationship. H3 supplies no independent formatting/metric explanation; H4 (root box-model difference) does not explain this case. Root, first-image and slider rectangles match exactly; second-image dimensions and horizontal position match.

## 3. What the diagnostic proves

The displacement is a real internal rendering difference whose measured positioning chain explains the full magnitude in this unchanged case/environment. It is not eliminated by matching root probes. The wrapper changes the second image's containing block and static-position context; it does not move the root, first image or slider in this observation.

This supports consideration of a component adaptation remedy through a separate gate. Further investigation merely to establish this same causal relationship is unnecessary on the existing evidence.

## 4. What it does not prove

The diagnostic does not establish acceptability, intentionality, a particular safe code change, or that CSS-only remediation is sufficient. It does not establish the effect of changing the wrapper on other states or frameworks, that a DOM change would satisfy existing adaptation constraints, or that another Prime parity case would remain unchanged. No candidate change was tested. Exact line-box baseline construction was not directly measured; the recorded font descent is not independent proof of causation.

## 5. Option A — retain Class B / OPEN

**Known:** the technical adaptation and +3 px mechanism. **Unresolved:** whether and how to correct the rendering difference, or whether a separately justified human disposition should accept it. B expects the same rendered result under Playbook §8.2; understanding the mechanism does not satisfy that expectation or make the difference acceptable. No deliberate product/design rationale supports C.

This option preserves evidence and avoids an unassessed change, at the cost of retaining a material mismatch. A follow-up GAP is **optional tracking**, not required solely by this B finding: the Playbook's mandatory out-of-scope GAP rule concerns A. E1-V2 already supplies a durable identifier. A later workstream may receive separate tracking if explicitly authorized; no GAP is created here.

Task 6 cannot close under the current stop ruling. E1-V2 needs a separately approved resolution or disposition; E1-B1 independently needs its own ruling before any Task 6 progression. If remediation is chosen, its approved verification and review must establish the outcome. Deferral does not waive either blocker, accept baselines, or satisfy parity completion.

## 6. Option B — separately gated remediation workstream

**Viable to consider; insufficient evidence to select a fix.** The established mechanism justifies investigating how to remove the visible displacement while preserving Ultimate's existing DOM/runtime/API constraints.

### Established versus unknown

| Established                                                                | Not established                                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Full +3 px mechanism and exact direct-root versus nested-span relationship | Safest specific code change                                                  |
| Positioning/formatting is involved                                         | Whether CSS-only is sufficient                                               |
| The span contains/clips the right image                                    | Whether changing its positioning preserves all ImageCompare states           |
| DOM/template changes are prohibited by current E-1 scope                   | Whether a different DOM could be justified under a separately approved scope |
| The unchanged case's geometry is measured                                  | Whether another parity case would regress after a change                     |

**Potential layer and risk:** component-local CSS is a plausible layer to examine because used positioning explains the difference. This is a feasibility direction, not a correction design or evidence of sufficiency. The existing Angular template projects the right image into the span; `onSlide()` updates that span's clip-path. Changing its positioning relationship could alter overlay alignment, clipping or sizing during interaction, even without editing runtime code. Effects on sized, sliding, focus and RTL cases remain untested.

DOM/template/runtime changes might prove necessary if preserving the current structure cannot meet the goal; the evidence neither establishes nor authorizes that necessity. Such a requirement would stop a DOM-preserving workstream and require a new scope decision. No shared/global rule, other component, Vue investigation, new token or API change is inferred.

**Authorization needed:** any new or rewritten adaptation declaration crosses the frozen E-1 mapping boundary; further verification crosses the exhausted iteration boundary. Even a CSS-only change therefore needs an explicit separate scope decision. Prepare and review a separate remediation specification first; then obtain authorization for an implementation plan and its review, followed by explicit implementation/verification authorization. The future approved documents must identify permitted files/layers, any relationship to the original mapping, acceptance criteria, and the exact run/iteration budget. No amendment to the existing Spec/Plan is made or authorized by this proposal. An architectural-rule or DOM/runtime/API requirement must be escalated rather than absorbed into the workstream.

**Verification if later approved:** the future plan should require comparison of the unchanged Angular root-style case against pinned PrimeNG, using internal geometry plus saved-image review; affected existing ImageCompare cases (default/sized, slide, focus, RTL); applicable Chromium/Firefox/WebKit regression screenshots; accessibility, fidelity, unit and selector-reach checks appropriate to the approved change. Existing environment/noise guards and assertions must remain effective. Reach coverage may be exercised without reopening the closed E1-B2 interaction. Any shared-framework impact requires an explicit expansion decision before work. Specify the confirmation budget in that future approval; no run is authorized here. Preserve both E1-B1 failures and report them as a separate blocker, never as waived assertions. Baseline acceptance and status promotion remain later human decisions.

## 7. Option C — intentional Ultimate difference

**Not currently supported.** Playbook §8.2 and Spec §7 require a deliberate, justified Ultimate difference and a human ruling. There is no approved user/product/design rationale for the 3 px displacement. A reason to retain a projection/clipping wrapper does not establish a reason to retain this visible displacement. Cause, framework structure and implementation convenience alone do not supply that rationale.

C must not be assigned, recommended as an evidence-based disposition, or inferred from this diagnostic. If the human later wishes to pursue intentional acceptance, an explicit defensible rationale and ruling are required; acceptance cannot be manufactured from the current source structure.

## 8. Scope and governance implications

The diagnostic authorization is exhausted. Discovery of the cause authorizes neither implementation nor another diagnostic iteration. Preserve the approved Firefox thumb group, preset, undefined token and both failing assertions; E1-B1 is outside this decision's remediation scope. Preserve E1-B2 closure, E1-V1's A/out-of-scope disposition and GAP-102/103/104/105 classifications. No general adaptation rule, ADR or GAP follows automatically from this case.

## 9. Parity accounting implications

Playbook §9 requires canonical cases to be Match or fixed B for `verified`; `verified-with-differences` additionally accounts for justified C/D. An open B does not qualify as fixed B or become C because its cause is known. The diagnostic's pass means measurement succeeded, not parity passed. Retain the case as a visible B/open difference; do not reinterpret the prior numerical harness totals or promote a status row. No alternate status label is assigned here.

The 24 regression differences remain reviewed evidence, not accepted baselines. Existing gaps and E1-V1 remain separate accounting items. Resolving E1-V2 alone would not resolve E1-B1 or complete Task 6/E-1.

## 10. Recommended disposition — proposal for human approval

**Retain Option A now and authorize only the preparation stage of Option B.** Keep E1-V2 **B / OPEN**, with cause established and parity disposition unresolved. A separate remediation specification is justified; direct implementation or another diagnostic is not justified by this approval alone. CSS feasibility and regression risks must be assessed within that separately approved workstream. If remediation is not a priority, Option A alone remains supportable without claiming acceptability or completion.

**C is unsupported. Task 6 should remain STOPPED.** This recommendation is not applied automatically.

## 11. Exact proposed next authorization

The human could approve the following bounded next step:

> Retain E1-V2 as Class B / OPEN, with cause established by the corrected Stage 2 evidence. Authorize preparation of a separate remediation specification only for Angular ImageCompare's `imagecompare/root-style` displacement, using existing evidence and relevant source. Its goal is rendered parity while preserving the existing Ultimate DOM, template, runtime and public API. Assess CSS-only feasibility without assuming sufficiency. Define scope, affected existing cases, risks, acceptance criteria, and proposed verification/iteration boundaries for review. No candidate fix, experiment, code/tooling/test change, browser or verification run is authorized. Do not amend the existing G3-E Spec/Plan/ADR or create a GAP. Stop and escalate if the goal requires DOM/template/runtime/API or shared/global-rule changes, another framework/component, or new rendered evidence. Present the specification for approval before implementation-plan work; implementation and verification each remain subject to their subsequent gates. Preserve E1-B1/B1-0, E1-B2, E1-V1, all classifications, baselines and status rows. Task 6 remains STOPPED. No commit, merge or push.

That language is a proposed authorization, **not a granted instruction**. If approved, only the separate specification-preparation stage begins. Any later implementation needs an approved scope/specification, reviewed and approved implementation plan, and explicit permission to proceed within its bounded verification budget.

**State after this proposal:** E1-B1 BLOCKED / B1-0; E1-B2 CLOSED / VERIFIED; E1-V1 A / out of scope; E1-V2 B / OPEN; Task 6 STOPPED / not complete. Only this proposal is created. No existing evidence is rewritten; no implementation, browser/verification run, baseline acceptance, status promotion, Spec/Plan/ADR change, GAP creation, commit, merge or push occurs.
