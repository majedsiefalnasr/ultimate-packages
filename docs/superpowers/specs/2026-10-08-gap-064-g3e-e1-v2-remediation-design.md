# G3-E E-1 — E1-V2 Angular ImageCompare remediation specification

**Date:** 2026-10-08  
**Status:** Draft for specification review. Preparation authorized; remediation, implementation planning and verification are not authorized by this document.  
**Finding:** E1-V2 remains **Class B / OPEN**, cause established; Task 6 remains **STOPPED / not complete**.

## 1. Authority and problem

Primary evidence: [corrected Stage 2 investigation](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-stage2-corrected-investigation.md) and the human-approved [disposition proposal](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-disposition-proposal.md). The authorization approves only preparation of this separate specification. Historical [E-1 record](../../architecture/research/2026-10-08-gap-064-g3e-e1-record.md), Stage 1, original Stage 2 failure and corrected Stage 2 remain unchanged. Earlier uncertainty is historical; the technical cause is now established.

Angular `imagecompare/root-style` has a visible +3 px displacement of the **second/right image, `landscape-2.png`, blue in the clipped left region**. It is not the original first/left image.

| Element / relationship | PrimeNG | Ultimate |
| --- | ---: | ---: |
| Root y/top | 19 | 19 |
| First image y/top | 16 | 16 |
| Second/right image y/top | 16 | 19 |
| Slider y/top | 18 | 18 |
| Root → second image | −3 | 0 |
| Root → right-image span | Not present | 0 |
| Span → second image | Not present | 0 |

All values are CSS pixels from the single successful corrected diagnostic. PrimeNG positions the second image directly against the positioned inline root. Ultimate positions it inside an absolutely positioned span. The used containing-block/static-position chain accounts for the full displacement: `(19 + 0) − (19 − 3) = 3`. Root, first-image and slider rectangles match; second-image dimensions/horizontal position match. H2 is established; H1 supports that relationship; H3/H4 do not independently explain the difference.

Matching root probes do not eliminate a visible internal mismatch. Under [Parity Playbook §§6.4, 8–9](../../architecture/PARITY_PLAYBOOK.md), B expects the same rendered result. The cause does not establish a safe remedy or intentionality. There is no approved rationale for C; the difference remains B / OPEN.

## 2. Goal and scope

Determine a safe, bounded route to rendered parity for this displacement while retaining Ultimate's existing DOM, template, runtime and public API. This specification evaluates directions and defines acceptance gates; it selects no CSS declaration and is not an implementation plan.

The remediation target is exclusively Angular ImageCompare, `imagecompare/root-style`. Existing Angular ImageCompare states are regression guards, not additional remediation targets. No automatic expansion to Vue, React, other components, global/shared styling, new tokens, theme/preset changes or public API changes is permitted. Any cross-framework/shared effect is an escalation boundary.

The plausible product layer is [Angular ImageCompare's style module](../../../packages/ng/src/image-compare/image-compare-style.ts). No product-file modification is authorized now. A later approved plan must identify the exact local rule delta, selector, rationale, provenance and affected files before implementation. Because the stylesheet is generated from the E-1 mapping, an unexplained hand edit or silent generator/mapping change is unacceptable. The plan must explicitly obtain approval for how a local adaptation is represented without altering unrelated approved groups; needing shared generation-policy changes triggers escalation.

## 3. Preservation constraints

Any accepted candidate must preserve:

- Current element hierarchy, projection slots, right-image span, range input, template and public inputs.
- Runtime input handling, range model, initial value, clipping mechanism and interaction behavior.
- Image sizing/overlay behavior, keyboard focus and accessibility behavior.
- Existing stories, fixtures, reference setup, case actions, selectors and comparison thresholds.
- Approved E-1 declarations/mappings outside an explicitly reviewed remediation delta.
- E1-B1 exactly, including Firefox thumb declaration, faithful preset, missing token and both failing assertions.

A CSS-only code change can still change behavior. Preserving runtime source alone is insufficient: clipping, sizing, focus and slide results must also remain valid. No magic compensation value follows from observing 3 px in one font/environment. No particular `top`, `inset`, positioning mode, transform, image-position or clipping change is prescribed here.

## 4. Candidate directions

All three directions concern the existing Angular style module and existing elements only. They preserve DOM/template/runtime/API **as code surfaces**, but preservation of rendered/interactive behavior remains unverified. Each would need explicit approval of its precise adaptation delta beyond the frozen E-1 mapping. None is already authorized or established sufficient.

### C1 — component-local placement adaptation of the retained absolute span

**Affected element/layer:** right-image span and its component-local positioning relationship to the inline root; existing hierarchy and absolute wrapper retained.

**Mechanism and expected outcome:** examine whether span placement can follow the same effective vertical origin as Prime's directly positioned image, so the second image aligns with Prime without moving the root, first image or slider. Its target is the measured image alignment, not a predetermined wrapper inset or numeric correction.

**Risks/states:** moving the clip-bearing wrapper could change which image pixels are exposed, overlay bounds, percentage sizing or overflow. Default/root-style, Sized at 50%, slide at 25%, focus and RTL must remain valid. The measured offset in an inline root cannot be assumed to occur in the flex-sized variants.

**Validation evidence:** image and wrapper rectangles/relative positions, clipping screenshots before/after interaction, stable root/first-image/slider geometry, and the full affected-state matrix in §7. A rule that only happens to compensate this font's 3 px without a supported layout relationship is insufficient.

### C2 — different span positioning context while retaining the DOM

**Affected element/layer:** span positioning/formatting role and the second image's resulting containing-block relationship, solely within component-local CSS.

**Mechanism and expected outcome:** assess whether the existing span can retain projection/clipping responsibility while permitting image placement equivalent to direct-root static positioning. This direction changes how the existing elements participate in layout; it does not remove or replace the span.

**Risks/states:** changing the wrapper's formatting role may alter its clipping reference box, percentage dimensions, normal-flow contribution, or root/slider placement. Slide handling still writes clip-path to this same span, so retaining the handler does not prove the result remains correct. All five canonical cases and all three existing stories are affected-state guards.

**Validation evidence:** actual containing block, image/wrapper boxes, clip region and runtime slide result, plus proof that root/slider/first-image geometry remains correct. If clipping or interaction requires a template/runtime change, stop rather than extend this candidate.

### C3 — right-image-only CSS alignment inside the retained span

**Affected element/layer:** second/right image's component-local placement or formatting inside the unchanged positioned span; root and wrapper positioning retained.

**Mechanism and expected outcome:** assess whether image-level alignment can remove the image displacement without changing the containing span's position. A supported rule would need to reproduce Prime's rendered content alignment rather than merely alter a bounding rectangle.

**Risks/states:** the span still owns clipping at its existing origin. Moving or formatting only its image could crop content, expose gaps or preserve a clip-region mismatch even if image top matches. Percentage sizing, initial overlay, sliding and RTL can regress; focus/slider must remain unchanged. A content translation alone is not evidence of safe parity.

**Validation evidence:** both image and clip-box geometry, rendered pixels and overlay boundaries throughout existing states, not image top alone. No exact correction value or property is selected from the diagnostic.

### Candidate assessment and selection gate

CSS-only, DOM-preserving remediation **appears plausible, not proven feasible**. C1 addresses the clip-bearing placement directly; C2 has broader formatting risk; C3 separates image placement from its clipping box and may be insufficient. This comparison does not select C1 or reject the others without evidence.

Before implementation, specification/plan review must select **one** candidate and approve its exact bounded declaration/mapping delta with a source-based preservation argument. This draft alone is insufficient implementation authority. If safe selection needs new rendered evidence or experiments, stop and request a separately scoped diagnostic authorization; no candidate carousel or exploratory browser work is implicit. Failure to prove a CSS-only route from current evidence is not proof that DOM preservation is impossible.

## 5. Span and existing behavior

[The current component](../../../packages/ng/src/image-compare/image-compare.ts) projects the right image into the span and updates that span's clip-path in `onSlide()`. Existing CSS gives the span absolute positioning and zero insets; images are absolute with percentage width/height. These relationships bind placement, sizing and clipping together.

| Existing state | Preservation requirement / risk from span changes |
| --- | --- |
| Default story / root-style | Remove the internal displacement while preserving the inline host, consumer style, first image and slider; do not repair the case by changing its wrapper |
| Sized / initial 50% | Preserve the existing flex-sized 16:9 overlay and correct initial clip; do not carry an inline-only correction into this context without validation |
| Slide / 25% | Preserve range interaction and span-owned clip update; no new event/state carrier or runtime calculation |
| Focus | Preserve keyboard focus, focus-visible styling and handle visibility/position |
| RTL | Preserve the existing RTL styling and recorded runtime behavior; do not introduce new direction detection or fix a separate RTL discrepancy |

These cover the existing Angular stories; no additional story, fixture, viewport or interaction variant is introduced by this specification.

## 6. DOM-preservation gate

| Route | What falls within a possible later local-CSS authorization | What requires stopping and a new decision |
| --- | --- | --- |
| Existing elements | Only placement/formatting adaptations whose geometry, clipping and interaction satisfy this specification | Adding/removing/reordering the span, images or input; changing projection/template |
| Runtime | Existing range handler and clipping state unchanged | Changing `onSlide()`, event handling, direction logic, state or clip-path mechanism |
| API | Existing inputs/attributes and consumer usage unchanged | Adding/changing inputs, slots, required consumer configuration or public semantics |
| Architecture | Existing component-local style adaptation category | New shared/global convention, generator policy, theme rule, token or another framework/component |

No route is currently proven to meet all requirements. If the selected route cannot satisfy them while retaining DOM/template/runtime/API, mark preservation infeasible **for that assessed route**, document the evidence and stop. A claim of overall infeasibility needs supporting evidence, not a failed single candidate. Any proposed relaxation belongs to a separate explicit scope decision; no prohibited change follows automatically.

## 7. Future verification strategy

This section defines proposed evidence requirements, not permission to run them. Later plan review must bind them to exact run selections and the budget in §9.

### Primary canonical case

Use unchanged Angular `imagecompare/root-style`, pinned PrimeNG 21.1.9 / PrimeUIX 2.0.3, original fixture bytes, 1280×720, Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` / Playwright 1.63.0 Chromium. Preserve existing readiness, font settling, image readiness and pointer parking. Verify environment equality and prescribed noise checks. Record actual runtime browser/version and input commit/worktree provenance.

Collect and retain both sides' root, first-image, second-image, retained span and slider rectangles; root→image, root→span and span→image offsets; relevant computed positioning/formatting, clipping and containing-block evidence; and saved comparison images. Reuse the corrected read-only measurement approach within the authorized campaign. The plan must explicitly authorize any harness adaptation needed to integrate it; no persistent tooling convention or threshold change is implied. Native thumb geometry must not be fabricated where no DOM rectangle exists.

### Existing affected Angular coverage

| Case | Existing Ultimate story | Evidence required |
| --- | --- | --- |
| `imagecompare/root-style` | `ng-imagecompare--default` | Primary internal geometry and image comparison |
| `imagecompare/default` | `ng-imagecompare--sized` | Sized initial 50% overlay, both images and slider |
| `imagecompare/slide` | `ng-imagecompare--sized` | Existing range-to-25% action and resulting clipping |
| `imagecompare/focus` | `ng-imagecompare--sized` | Existing Tab state and focus-visible result |
| `imagecompare/rtl` | `ng-imagecompare--rtl` | Existing RTL initial clip and geometry |

The case/story distinction matters: the Default story is the root-style case, while the default canonical comparison uses Sized. Sources: [case map](../../../tooling/prime-reference/cases-g3e.ts) and [stories](../../../packages/ng/src/image-compare/image-compare.stories.ts). Do not alter their geometry or actions to make a candidate pass.

### Regression dimensions

The future approval should include existing Angular ImageCompare Sized/Rtl regression screenshots in Chromium, Firefox and WebKit; existing accessibility scans/accounting; ImageCompare selector reach using the unchanged collector/validator; applicable Angular component/unit checks, theme fidelity checks, build and type checks for the approved delta. Root-style parity/internal measurement remains the pinned Chromium oracle comparison; no new cross-browser parity matrix or missing-story coverage is silently added.

Any requested additional coverage or inability to select these checks without broadening scope requires a plan-review ruling. No tests, stories, assertions, reach interaction or tooling are changed now. Preserve the closed E1-B2 Image interaction. The two existing E1-B1 assertions remain unchanged and their failures remain separately reported; they are neither exempted nor treated as passing.

## 8. Acceptance criteria

| ID | Required outcome after a separately authorized implementation |
| --- | --- |
| AC1 | The canonical second/right image's +3 px discrepancy is removed: its root-relative placement agrees with Prime within the existing ±1 px geometry tolerance, and saved-image review shows no residual visible displacement |
| AC2 | Root, first-image and slider geometry remain correct against Prime and do not acquire unintended movement/resizing relative to the retained evidence; nominal pinned y targets remain 19, 16 and 18 respectively |
| AC3 | Second-image dimensions/horizontal position and retained span placement/clipping are documented; the internal relationship explains the matching pixels. Wrapper coordinates need not equal their old values if the approved candidate intentionally adapts that wrapper |
| AC4 | All existing affected cases in §7 retain valid geometry, initial clipping, slide behavior, focus and RTL results; no new material difference attributable to the remediation is silently accepted |
| AC5 | Parity obeys Playbook §6.4: geometry within ±1 px, equal material probes and no visible difference on review. Pixel-diff ratio remains advisory; no new ratio gate is invented |
| AC6 | Existing regression assertions retain their configured threshold (`threshold: 0.2` in the root Playwright configuration, no added ratio tolerance). Every changed screenshot is accounted for; an old-baseline mismatch is review evidence, not automatic acceptance |
| AC7 | No new selector reach failure or introduced accessibility violation attributable to the remediation; existing gap classifications and validation strength remain unchanged |
| AC8 | Approved DOM/template/runtime/API and all unaffected E-1 declarations are preserved; the exact authorized adaptation delta is auditable and fidelity/provenance checks remain meaningful |
| AC9 | Applicable checks produce no new attributable failure. Both E1-B1 assertions and their blocker remain preserved, explicitly distinct from E1-V2 evidence; no overall-green or Task 6 completion claim follows |

These are evidence criteria, not a baseline/status/classification authorization. Human final review remains required even if all E1-V2 criteria are met.

## 9. Proposed implementation and verification budget

**Future budget for review: one selected candidate, one bounded implementation, one verification campaign, retries 0.** Existing corrected diagnostic evidence supplies the before state; no new before-pass or exploratory diagnostic is included.

The campaign contains exactly one Chromium parity run over the five Angular cases in §7, with primary internal measurements collected in that run; one invocation per existing Angular ImageCompare regression browser project (Chromium, Firefox, WebKit); one targeted accessibility scan/validation set; one ImageCompare reach run; and one invocation of each applicable unit/fidelity/build/type check enumerated in the approved plan. Existing harness-prescribed noise observations are part of the parity run, not authority for another campaign. The plan must specify exact selections and prevent incidental other-component/framework suites. No automatic baseline update is included.

No automatic second fix, alternate candidate, confirmation campaign, retry, timeout increase or diagnostic-hook correction is budgeted. Stop on setup/readiness mismatch, unreliable required measurements, an unexpected/new attributable failure, or residual E1-V2 mismatch. Known preserved E1-B1 failures are recorded separately and do not authorize investigation or assertion changes. A failed campaign requires another explicit ruling before any correction/rerun. Successful evidence also ends the execution budget and proceeds to human review.

Stop immediately if work needs a new architectural convention/rule, DOM/template/runtime/API change, shared-framework change, broadened component/framework scope or unrelated CI work. No convention is derived from this single case. The earlier exhausted G3-E iteration budget is not reset by drafting this specification: the proposed separate budget must itself receive explicit human approval before any execution.

## 10. Relationship to G3-E and final state

This is a separate remediation specification requiring its own review/approval. It does **not** amend the [original G3-E Spec](2026-10-08-gap-064-g3e-media-data-design.md) or [original G3-E Plan](../plans/2026-10-08-gap-064-g3e-media-data.md). All E-1 mappings remain frozen except an exact remediation delta separately authorized later. No current product or tooling change is granted.

- E1-B1: **BLOCKED / B1-0 Preserve and Defer**, untouched.
- E1-B2: **CLOSED / VERIFIED**, no interaction changes.
- E1-V1: **A / out of scope**, no remediation/new GAP.
- E1-V2: **B / OPEN**, cause established, difference not accepted as intentional.
- GAP-102/103/104/105: unchanged; no investigation/remediation expansion.
- Task 6: **STOPPED / not complete**. E1-V2 resolution alone cannot close it while E1-B1 remains blocked.

No baseline acceptance, parity/status promotion, classification change, GAP/ADR creation or amendment, commit, merge or push is authorized. Historical review of the 24 regression differences remains complete and does not imply baseline acceptance.

## 11. Governance sequence and review decisions

1. **Remediation specification:** this draft; candidate evaluation only.
2. **Specification review:** approve/revise preservation constraints, candidate-selection gate, acceptance criteria and proposed budget. Approval does not authorize implementation.
3. **Implementation plan:** only after separate authorization; identify one candidate, exact local declaration/mapping/provenance delta, evidence basis, file/check selections and escalation points.
4. **Plan review:** approve those exact details; unresolved safe-candidate selection or required diagnostics must be ruled on before proceeding.
5. **Explicit implementation authorization:** separately grant the bounded product delta and verification campaign; none is granted now.
6. **Bounded implementation:** one approved candidate, no scope expansion.
7. **Bounded verification:** §9 budget, no unapproved iteration.
8. **Final review/closeout:** human evaluates the evidence and separately rules on E1-V2 disposition, any baseline/status action and the continuing Task 6 stop. No automatic closure.

**Issues to resolve before implementation:** which candidate can safely preserve the constraints; its exact component-local CSS/mapping/provenance representation; the exact future run selections and separate iteration authorization. Current evidence does not prove a need for DOM/runtime/API changes. If any become necessary, this workstream stops for a new scope ruling rather than relaxing its constraints.

Only this specification is created in the preparation task. No implementation plan, code/test/assertion/baseline/tooling change, browser/verification run, experiment or modification of existing evidence is performed.
