# G3-E E-1 — decision proposal for E1-B1 and E1-V2

**Date:** 2026-10-08  
**Status:** Proposal for human decision; no disposition or next action approved by this document.

## 1. Decision scope

Choose how to carry the E1-B1 blocker and E1-V2 open finding forward. This is decision analysis only. The primary source is the [E-1 record](2026-10-08-gap-064-g3e-e1-record.md), especially its E1-B1 escalation/ruling, full visual review, and final E1-V2 ruling. This proposal does not amend that record, the approved [Spec](../../superpowers/specs/2026-10-08-gap-064-g3e-media-data-design.md), the approved [Plan](../../superpowers/plans/2026-10-08-gap-064-g3e-media-data.md), or any ADR.

Current state remains: E1-V1 **A / out of scope**, with no remediation or new GAP; E1-V2 **unresolved B / OPEN**; E1-B2 **CLOSED / VERIFIED**, with no further reach changes; E1-B1 **BLOCKED**; Task 6 **STOPPED / not complete**. The full authorized visual review is complete. Its 24 regression differences are accounted for by the approved mappings, inline-root capture limitation and existing gaps. Neither baseline acceptance nor parity/status promotion follows from that review.

## 2. Current evidence

**E1-B1:** Approved ImageCompare D1 group 7 uses `dt('imagecompare.handle.border.style')` in the Firefox `::-moz-range-thumb` border shorthand, without a fallback. The pinned `@primeuix/styles` 2.0.3 source contains that reference. Both the extracted Aura preset and Ultimate's faithful Aura preset define `borderWidth` and `borderColor`, but no `borderStyle`. The resulting `--u-imagecompare-handle-border-style` reference is undefined. The two existing Angular/Vue runtime assertions fail on that missing value. This is an upstream style/preset inconsistency, not evidence of an incorrect registration key or wrapper.

The user explicitly prohibited token addition, fallback, omission, declaration rewrite and assertion waiver/change. Those prohibitions remain binding. The record establishes the missing value, but not an authoritative replacement value or a general policy for repairing inconsistent upstream styles/presets. Recorded test results are historical evidence; none is rerun for this analysis.

**E1-V2:** Angular `imagecompare/root-style` has matching root probes but a visible internal vertical offset of approximately 3 px in the saved image. Pixel ratio and zero noise do not dismiss that visible difference. Root-only probes do not measure internal image positions. Ultimate's absolutely positioned right-image `<span>` is a plausible explanation recorded as a hypothesis, not established causation. Establishing the cause requires additional internal geometry evidence and may expose a need for a positioning rule outside the approved declarations. Neither investigation nor remediation is currently authorized.

## 3. E1-B1 alternatives

The fidelity question has two parts: exact upstream structural CSS and exact extracted Aura preset content. A repair can preserve one while departing from the other. Passing an adapted generator comparison would not establish unchanged upstream declaration fidelity.

| Candidate disposition | What would change | Exact upstream fidelity | Ultimate preset/theme contract | Ported declaration | Tests/assertions |
| --- | --- | --- | --- | --- | --- |
| **B1-0 — Preserve and defer** | No implementation change; retain the blocker and evidence | CSS and preset both preserved | Unchanged; missing value remains | Unchanged | Both failures retained, unchanged |
| **B1-1 — Separately decide preset completion** | Define the missing preset value, only after choosing and justifying it | CSS preserved; preset departs from extracted Aura | Adds a default/emitted token to Ultimate Aura; other presets are not thereby repaired | Unchanged | Keep the two assertions; later evidence must establish the effect. Any added coverage needs its own authorization |
| **B1-2 — Separately decide a CSS fallback** | Supply a fallback in the approved token reference, with its value separately justified | Preset preserved; CSS departs from the pinned declaration | Preset shape unchanged; effective missing-token behavior gains a default while retaining token override capability | Changed | The token remains undefined; a fallback is not established to satisfy the current assertions. Recognizing it could require a separately approved assertion-policy change; mapping/generator fidelity data also need an approved exception |
| **B1-3 — Separately decide a declaration rewrite** | Replace the missing-token term with a separately justified literal | Preset preserved; CSS departs from the pinned declaration | Preset shape unchanged; this declaration would cease consuming that token, changing its override behavior | Changed | Keep the runtime assertions; mapping/generator fidelity data would need an explicitly approved exception |

**Rule, scope and risk implications:**

- **B1-0:** Needs no new architectural/theme rule or GAP. It is the only option compatible with the current E-1 approvals. It preserves auditability but cannot satisfy the failing assertions or complete Task 6. Deferral is not a waiver, and does not authorize moving to another task. The existing finding is sufficient tracking unless the human separately requests a GAP.
- **B1-1:** Requires a separate theme decision because Spec §11 excludes new tokens/Aura modules. At minimum, approve a named, component-specific exception to faithful preset content; it need not become a global repair policy. Risks include an unjustified default, a new downstream theming expectation, and unresolved behavior with custom presets that still omit the token. The record is insufficient to choose the value or prove compatibility. This cannot be implemented inside the currently approved E-1 scope; integration would require explicitly approved scope/spec/plan changes after that decision.
- **B1-2:** Requires a separate missing-token/fidelity exception. A general fallback policy would be a broader architectural/theme rule and is not justified by this one finding. Risks include concealing future missing tokens and selecting a default unsupported by the pinned preset. A usable CSS fallback and a defined custom property are different conditions: this option cannot be represented as resolving both assertion failures on the existing evidence. Any change to recognize fallbacks in the assertions remains explicitly blocked unless separately decided; no waiver is implied. No fallback value is recommended from the present evidence. Any later E-1 integration requires an explicitly revised mapping and approved scope/spec/plan; current permission for CSS adaptation is insufficient.
- **B1-3:** Requires a separate declaration-fidelity and token-consumption decision. Risks include losing token customization, hard-coding an unsupported value, and divergence from the pinned source. It cannot be silently treated as a faithful port. Like B1-2, it needs explicit mapping and scope/spec/plan approval before implementation. A component-specific decision need not establish a general rewrite rule.

**Not supported as remedies by the existing evidence:** Omitting the Firefox thumb group has no demonstrated non-applicability basis; the supported Firefox surface and approved mapping remain. Waiving/changing the assertions would suppress a real missing value rather than resolve it. Neither is a recommended alternative. Either would require reversing explicit rulings and relaxing existing requirements; a test waiver is not a product repair. No newer upstream version, upstream fix, or safe replacement value has been established here.

## 4. E1-V2 alternatives

### A. Leave unresolved and defer

Retain **B / OPEN**, the saved image and the undetermined-cause statement. No implementation, investigation, browser run or new GAP is needed. Risk: uncertainty remains and the case cannot become Match. Deferral alone does not close Task 6 or promote status. This is supported by the evidence and current ruling.

### B. Authorize investigation only

A bounded investigation is supportable, but its outcome cannot be predicted. Suggested authorization has two separately gated stages:

1. **Artifact/source inspection only:** One pass limited to Angular `imagecompare/root-style`. Inspect the existing corrected-before and after triptychs/reports, their archived inputs and runner configuration, the existing part map, the matching story/reference setup, the pinned Angular ImageCompare source/CSS, and the corresponding Ultimate template/CSS. Collect an evidence-to-hypothesis table identifying measured facts, missing internal measurements and competing explanations. Source inspection may constrain hypotheses; it cannot by itself establish the rendered cause when the saved measurements cover only the root. Stop with a written finding or an explicit evidence shortfall. No browser run is included.
2. **Only if separately authorized after stage 1:** One diagnostic browser pass against the unchanged Angular Ultimate and pinned PrimeNG root-style case in the recorded Docker/Chromium environment. Collect internal image/root/wrapper/slider rectangles, relative vertical positions and relevant computed positioning, line-height and box-model values, with setup/version provenance. Preserve the original case and capture context. A new run is likely necessary if existing archives contain no internal geometry, but that necessity is not established by this proposal. Any temporary measurement driver or output location must be explicitly included in that authorization; no persistent verification-tooling edits are implied.

Both stages prohibit fixes, injected CSS, style/DOM edits, alternate wrappers, runtime changes, assertion changes, baseline changes, and changing the page to test a candidate remedy. Stop on insufficient evidence, a setup mismatch requiring repair, a need to broaden beyond this case, a new rule/DOM/runtime/API requirement, or any need for another pass. At most document a cause supported by observations; otherwise retain **B / OPEN**. A successful investigation grants no remediation authority.

### C. Intentional/framework difference

**Not supported.** Under [Playbook §8](../PARITY_PLAYBOOK.md), C requires a deliberate, justified Ultimate difference and a user ruling; a DOM difference alone is insufficient (Spec §7). The record establishes neither causation nor an intentional design benefit for this offset. Calling an unresolved B adaptation “framework-specific” does not make it C. Neither matching root probes nor a low pixel ratio supplies the missing rationale. Do not recommend or assign C from this evidence.

## 5. Scope and iteration implications

[ADR-052 X-2](../DECISIONS.md#adr-052--gap-064-cross-tranche-parity-rules-for-the-remaining-g3-tranches-selector-reachability-dom-admissibility-state-selectors-runtime-roles-open-state-screenshots-tranche-ci-evidence) permits CSS adaptation to existing DOM, but does not override the approved 24-group mapping or authorize a new rule. ADR-051 key alignment does not define a missing preset value. Spec §§3/11/12 and Plan Tasks 6–7 retain their scope and iteration gates; prior E1-B2 exceptions authorize no further investigation or run.

Any B1 repair requires a separate normative decision; a GAP is tracking, not implementation permission. A later investigation/implementation proposal must identify required governance artifacts without creating or amending them under this analysis. A V2 diagnostic run requires an explicit additional-iteration exception naming its purpose, case and one-pass limit. Neither finding can be closed merely by recording a proposal, deferring it, or completing the visual review.

## 6. Recommended options for human approval

- **E1-B1:** Recommend **B1-0 now**. Evidence is sufficient to identify the inconsistency but insufficient to recommend a particular replacement value or choose preset extension over CSS deviation. If exact CSS fidelity is the human's priority, B1-1 is the candidate to consider separately; if exact preset content is the priority, B1-2/B1-3 expose the necessary CSS-contract tradeoff. None is approved here.
- **E1-V2:** **A** is the option consistent with the current no-investigation ruling. If the human wants progress toward establishing cause, recommend only **B stage 1**, with a stop before any new browser run. Do not recommend C or a particular fix.

These recommendations are submitted for selection, not applied decisions. Task 6 remains stopped whichever documentation-only option is selected.

## 7. Exact authorization required next

The human may choose independently for each finding. Suggested narrow approval language:

> **Preserve/defer:** Keep E1-B1 BLOCKED and E1-V2 B / OPEN. Authorize documentation of these dispositions only. Keep Task 6 STOPPED; authorize no investigation, implementation, checks, baseline acceptance or status promotion.

> **B1 decision preparation, if desired:** Select B1-1, B1-2 or B1-3 for a separate, component-specific theme/fidelity decision proposal. Authorize documentation of the exact intended value/contract and required governance changes only; do not implement, alter tests or amend the existing Spec/Plan yet. If the evidence cannot justify the value, stop and request a separately scoped evidence-gathering ruling. No general missing-token rule is implied.

> **V2 artifact-only investigation, if desired:** Authorize exactly one artifact/source-only pass described in §4B stage 1, limited to Angular imagecompare/root-style, with findings in a separate document. Do not run a browser, modify any code/tooling, test a fix or change classification/status automatically. Stop when the pass ends or further evidence is needed. Any diagnostic browser run requires another explicit ruling.

No next action is taken until its authorization is granted. This proposal creates no GAP, amends no existing record/spec/plan, accepts no baseline, promotes no status, and authorizes no checks, commit, merge or push.
