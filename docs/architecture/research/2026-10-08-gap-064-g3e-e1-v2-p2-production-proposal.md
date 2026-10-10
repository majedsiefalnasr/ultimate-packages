# G3-E E-1 — E1-V2 P2 production delta proposal

**Date:** 2026-10-08  
**P2 status:** proposed — **P2 READY FOR HUMAN APPROVAL**  
**Candidate:** C1, human-approved. **Production delta approval:** pending. Implementation and P3 remain unauthorized.

## 1. Authority and proposed decision

Sources: [approved remediation Spec](../../superpowers/specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md), [approved Plan](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-remediation.md), [typography/P1 ruling](2026-10-08-gap-064-g3e-e1-v2-typography-p1-ruling.md), and [successful C1 experiment](2026-10-08-gap-064-g3e-e1-v2-c1-experiment-result.md). The earlier [blocked P2 assessment](2026-10-08-gap-064-g3e-e1-v2-p2-design.md) remains historical evidence of the pre-experiment shortfall; this proposal supplies the now-supported production representation without rewriting it.

**Proposed human decision:** approve the exact three experimental declarations as an Angular-only extension of the existing D5 retained span rule, represented through existing generator data and generated style output. Do not add an inline binding, template style, new rule category, token or generator policy. This document proposes that decision; the human has not yet approved it.

## 2. Exact CSS and generator delta

Destination selector: `.u-image-compare > span`.

Before:

```css
.u-image-compare > span { position: absolute; inset: 0; }
```

After:

```css
.u-image-compare > span { position: absolute; inset: 0; top: auto; bottom: auto; height: 100%; }
```

Retain the existing shorthand and append the three longhand declarations in this order. They override the shorthand's vertical edges while preserving horizontal zero insets and the absolute positioning role. No measured pixel compensation is encoded.

In `packages/themes/test/utils/g3e-port.mjs`, change **only** the string at `RETAINED.ng.imagecompare[0]` from:

```js
".u-image-compare > span { position: absolute; inset: 0; }"
```

to:

```js
".u-image-compare > span { position: absolute; inset: 0; top: auto; bottom: auto; height: 100%; }"
```

`expectedCss()` already appends `RETAINED[fw][key]` last and normalizes each rule. A later authorized implementation must obtain the CSS body from the existing `g3e-port.mjs ng imagecompare` generator entry point and place that output in the module's existing `/*css*/` block. The sole changed normalized rule will be:

```css
.u-image-compare > span{position: absolute;inset: 0;top: auto;bottom: auto;height: 100%;}
```

The generator prints CSS; it does not itself rewrite the destination module. Transfer only the generated CSS body, preserving the module's other content. No independent CSS hand edit, extra override group, selector rewrite or fidelity-expectation change is permitted. All 12 D1 groups, upstream/count literals and E1-B1 remain unchanged. D5 remains one existing rule with an amended declaration list.

`RETAINED.ng.imagecompare` and `RETAINED.vue.imagecompare` are separate arrays in the current source. Change the Angular string only. Do not touch `MAPPING`, its shared Angular/Vue aliases, other data, fixtures or generator functions. Vue/React output must not change.

## 3. Exact proposed affected files and provenance

The proposed future change set is limited to these four files; none is changed by preparing this proposal:

| File | Exact permitted delta |
| --- | --- |
| `packages/themes/test/utils/g3e-port.mjs` | The single Angular retained-rule string above |
| `packages/ng/src/image-compare/image-compare-style.ts` | Generated CSS body reflecting that single rule delta; no classes/module/template change |
| `docs/architecture/provenance/ng.json` | Append the single style-file entry specified below; preserve all existing entries |
| `docs/architecture/PROVENANCE.md` | Append the single sentence specified below to the existing `@primeuix/styles` modification-status paragraph |

The current Angular manifest has no entry for this style destination. Use its existing reference-derived style-entry convention, with this exact proposed object:

```json
{
  "originalPath": "@primeuix/styles@2.0.3 imagecompare",
  "ultimateDestination": "packages/ng/src/image-compare/image-compare-style.ts",
  "modificationStatus": "reference-derived",
  "modificationDescription": "GAP-064 G3-E E-1: 12 ImageCompare upstream groups ported with the approved selector mapping in packages/themes/test/utils/g3e-port.mjs. The final D5 retained span rule is Ultimate-authored, not an upstream declaration. E1-V2 C1 adapts that rule with top:auto, bottom:auto and height:100%, preserving the absolute span as image/clipping carrier; design and experiment evidence: docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-p2-production-proposal.md and docs/architecture/research/2026-10-08-gap-064-g3e-e1-v2-c1-experiment-result.md. The approved Firefox thumb declaration, undefined border-style token and E1-B1 assertions remain unchanged."
}
```

Proposed aggregate sentence:

> G3-E E-1 Angular ImageCompare has a reference-derived style module with an Ultimate-authored retained-span adaptation (E1-V2 C1); its exact declaration delta and supporting experiment are recorded in `research/2026-10-08-gap-064-g3e-e1-v2-p2-production-proposal.md`, with file-level provenance in `provenance/ng.json`.

The aggregate update follows existing provenance conventions: `scripts/provenance/validate-provenance.mjs` requires a `PROVENANCE.md` update for a compared change touching a watched Prime-derived package. No global manifest regeneration or unrelated provenance repair is included. The new entry honestly distinguishes upstream-derived groups from the local D5 adaptation; no upstream original hash is invented for the local rule.

This proposal and the retained experiment result supply durable design/evidence references. Later execution outputs belong in the separately approved evidence destination; historical E-1, Stage 2 and experiment records must not be overwritten. No automatic historical record/status update is part of this four-file delta.

## 4. Semantic equivalence and preservation argument

The experiment applied normal-priority inline `top:auto`, `bottom:auto`, `height:100%` to the same span. The proposed final stylesheet rule assigns the same properties after `inset:0`, producing the same specified vertical edges and height under the inspected fixture cascade. Existing horizontal zero insets, absolute positioning, span clip-path and descendant image rules are unchanged. The source inspection found no competing ImageCompare span placement rule in the scoped Angular/theme sources. No corresponding inline placement/sizing value existed in the experiment; Slide's inline clip-path is unrelated and remains untouched.

Thus the representation is semantically equivalent for the inspected fixture inputs, without relying on inline specificity. It is not a claim about arbitrary consumer CSS overrides; actual generated/shipped stylesheet behavior still requires post-implementation verification. Stop if later source inspection or verification reveals a conflicting rule or changed inputs rather than adding specificity or `!important`.

Measured root-style results: root y19, first image y16 and slider y18 remain fixed; span and second image move y19→16 together; span→image remains 0; span dimensions remain 1257.5×17. Root→span becomes −3 through the tested layout relationship, not a hardcoded offset. The mutated clip polygon matches Prime. All five Prime/mutated screenshots are byte-identical; the four regression cases also have byte-identical Ultimate before/after screenshots and unchanged measured geometry.

DOM/template, projection slots, span/image hierarchy, range input, `onSlide()`, clip-path mechanism and public API are outside the change set. The experiment supports clipping/sizing preservation in the canonical case and the existing Sized, Slide, Focus and RTL states. Changing the declaration's storage from disposable overrides to generated component CSS does not intentionally alter those relationships; verifying that transfer is still mandatory. The experiment is evidence, **not production implementation**.

## 5. Risks and implementation boundary

Remaining risks include the real stylesheet cascade, percentage sizing in other layouts, other browser engines, and interactions after the rule is present from initial render. The experiment applied overrides after each existing action; it did not establish every subsequent interaction sequence. No new consumer layout, viewport, typography or state coverage is implied.

The target remains Angular `imagecompare/root-style`; the component-local rule also applies to the four existing regression guards. Preserve their behavior rather than creating a story-specific selector. No DOM/runtime/API, theme/token, shared/global CSS, generator-policy, other component/framework or new architectural rule is authorized. Stop for such a requirement. Preserve all prior dirty-worktree work; compare future changes with saved starting contents, not HEAD alone.

## 6. Required post-implementation verification and AC1–AC9

No check is run by this design gate. After separate P2/P3 and implementation authorization, the Plan's single bounded V1–V8 campaign must validate the actual generated stylesheet: pinned Chromium parity/internal geometry across the five cases, existing Angular Sized/Rtl regression screenshots across Chromium/Firefox/WebKit, scoped accessibility and selector reach, component unit, generated/shipped fidelity, build/type and provenance/integrity checks. Keep the Plan's exact selection validation, Angular-only server isolation, retries 0, unchanged thresholds/baselines and stop-on-failure rules.

| Criterion | Experiment contribution / outstanding production requirement |
| --- | --- |
| AC1 | Experiment removes +3 px and matches saved pixels; reproduce with generated stylesheet |
| AC2 | Root/first/slider unchanged experimentally; confirm actual production geometry |
| AC3 | Span/image sizing, offsets and clipping recorded; repeat against actual stylesheet |
| AC4 | Four existing sampled states preserved; run existing approved production actions/coverage |
| AC5 | Byte-identical experiment images exceed the existing ±1 px/no-visible-difference criterion; retain that criterion unchanged |
| AC6 | No baseline accepted; actual unchanged screenshot assertions still apply and any failure stops |
| AC7 | Reach/accessibility not established by experiment; execute the scoped approved checks |
| AC8 | Four-file source/provenance delta defined; verify generated equality, unchanged protected surfaces and auditable provenance |
| AC9 | Applicable production checks remain outstanding; preserve both E1-B1 assertion failures separately without waiver or overall-green claim |

Exact temporary validation/configuration/measurement artifacts required by Plan §2/§6 have not been created by this production-delta proposal. They still require concrete preparation, review and explicit approval before execution; experiment artifacts are not automatically approved for the implementation campaign. This proposal does not silently relax that prerequisite or authorize artifact preparation now.

## 7. Human gate and final state

**P2 READY FOR HUMAN APPROVAL** for the exact production delta and four-file provenance representation above. Approval is requested as a design decision, not claimed or applied. The successful experiment resolves the prior evidence shortfall sufficiently to propose this delta; it does not approve it.

**P3 may be prepared only after a separate human P2 approval and authorization for the next stage.** P3 is not prepared or approved here. All exact execution-packet prerequisites remain binding. No further experiment is authorized; its one-campaign budget is exhausted. C2/C3 remain deferred.

Current state: P1 C1 approved; P2 proposed/pending human approval; P3 unapproved; implementation unauthorized; E1-V2 **B / OPEN**; Task 6 **STOPPED / not complete**. E1-B1 remains **BLOCKED / B1-0**, E1-B2 **CLOSED / VERIFIED**, E1-V1 **A / out of scope**, and GAP-102/103/104/105 unchanged. No production/generator/provenance/test/baseline change, Spec/Plan amendment, browser execution, verification, status promotion, commit, merge or push occurs in this task.
