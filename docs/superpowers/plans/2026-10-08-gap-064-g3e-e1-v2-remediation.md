# G3-E E-1 — E1-V2 Remediation Implementation Plan

> **Later human ruling (2026-10-08):** [Typography target accepted for this fixture; P1 approved for C1](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-typography-p1-ruling.md). This supersedes this plan's historical ungranted-P1/unselected-candidate statements only. P2/P3 and implementation remain unauthorized; all other constraints remain binding.

> **For agentic workers:** Use the Superpowers executing-plans skill only after Plan Review and explicit implementation authorization. Respect the human gates below; do not dispatch another CLI or infer execution permission from this plan.

**Status:** Plan creation authorized; draft for Plan Review. **Not execution-ready: P1/P2/P3 and explicit implementation authorization are outstanding.** No candidate is selected.

**Goal:** Remove the established Angular ImageCompare `imagecompare/root-style` displacement through one separately approved local adaptation, preserving existing DOM/template/runtime/API and behavior.

**Architecture:** Preserve the right-image span and component interaction model. Represent the selected local adaptation through the existing generated-style data and auditable provenance. No declaration, mapping entry or candidate is chosen by this plan.

**Tech stack:** Angular; Ultimate style modules; existing E-1 generator/fidelity architecture; pinned PrimeNG 21.1.9 / PrimeUIX 2.0.3; Playwright 1.63.0 in `mcr.microsoft.com/playwright:v1.63.0-jammy`, existing 1280×720 Chromium comparison.

## 1. Authority and global constraints

Primary planning authority: [approved E1-V2 remediation specification](../specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md), Spec Review **APPROVE — specification only**, followed by the human's separate PLAN-stage authorization. Its file's historical draft header is not rewritten. Supporting evidence: [corrected Stage 2 diagnostic](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-stage2-corrected-investigation.md) and [disposition proposal](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-disposition-proposal.md). Original G3-E documents and Playbook apply only through the specification's references; this plan amends none of them.

The cause is established: second/right blue image `landscape-2.png` sits at Prime root−3 versus Ultimate root→span 0 plus span→image 0. Root y19, first-image y16 and slider y18 agree; second-image y16 versus y19 produces +3 px. This does not establish a safe correction. E1-V2 remains B / OPEN; no C rationale exists.

Global constraints for every future task:

- Target Angular ImageCompare/root-style only; other existing Angular ImageCompare states are regression guards.
- Preserve DOM/template, right-image span, `onSlide()`, clipping mechanism, range semantics, sizing, focus, accessibility, RTL, public API and consumer setup.
- Preserve stories, fixtures, selectors, readiness, viewport, assertions, thresholds and unaffected approved E-1 mappings.
- E1-B1 remains BLOCKED / B1-0 Preserve and Defer, including its missing token, Firefox declaration, faithful preset and both failing assertions.
- E1-B2 CLOSED / VERIFIED; E1-V1 A / out of scope; E1-V2 B / OPEN; GAP-102/103/104/105 unchanged; Task 6 STOPPED / not complete.
- No global/shared rule, other component/framework, token/theme/preset, runtime/API/DOM/template or architectural-policy change.
- No baseline acceptance, status/classification promotion, GAP/ADR action, original Spec/Plan amendment, commit, merge or push.

Only this plan is created now. All checkboxes below describe future work, not actions authorized by PLAN-stage approval.

## 2. Preconditions and human gates

| Gate                             | Required explicit human approval                                                                                                                             | Current state                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| **P1 — candidate selection**     | Select exactly one C1, C2 or C3; record evidence-based justification and preservation argument                                                               | **NOT GRANTED**                           |
| **P2 — exact delta**             | Approve exact selector, CSS properties/declarations, before/after text, style/data location, generated/provenance representation and complete file allowlist | **NOT GRANTED**                           |
| **P3 — execution budget**        | Approve one selected candidate, one implementation, one verification campaign, retries 0, exact scoped checks and evidence destinations                      | **NOT GRANTED**                           |
| **P4 — escalation contract**     | Acknowledge the stop matrix in §9; no execution may cross those boundaries without another ruling                                                            | Binding boundary; no exception authorized |
| **Implementation authorization** | After Plan Review and P1–P3, explicitly authorize execution of the reviewed exact delta and campaign                                                         | **NOT GRANTED**                           |

P2 approval must contain a concrete delta record with: selected candidate; exact destination selector; precise property/value additions/removals/replacements; original declaration text; source rule and affected upstream group or retained-local-rule identity; generator data path/field; style destination; provenance entry; rationale; diagnostic citation; affected files; preservation argument; and exact campaign/measurement integration described in §6. A local retained rule must be identified as local, not falsely attributed to an upstream group. No unapproved compensation value follows from the observed 3 px.

P2 must also approve the exact read-only, container-only validation/instrumentation content needed to scope existing checks. Approval must name those artifacts and their diff/content before execution; a vague instruction to “adjust positioning” or “add measurements” does not satisfy P2. Source-only preparation of that concrete approval packet is a separate human-controlled prerequisite, not an executable task hidden in this plan. If preparing it requires new rendered evidence, stop for separate diagnostic authorization.

This intentionally blocked candidate-specific section is not a placeholder for an agent to fill autonomously. Human selection and exact-delta approval are required inputs. Plan Review may approve the gate structure without authorizing candidate selection, filling in CSS, or implementation. After the exact packet is available, obtain review of its binding details before explicit execution authorization.

## 3. Candidate handling — none selected

| Candidate                                   | Intended mechanism / potential surface                                                                                              | Risks and required evidence                                                                                                                                | Stop conditions                                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **C1 — retained-span placement adaptation** | Existing span's placement relative to inline root; Angular style module and only its approved Angular generator-data representation | Clip box, sizing and overlay bounds may move; prove primary image/wrapper geometry and all existing affected states                                        | Needs a forbidden change, unsupported fixed compensation, new evidence, or fails preservation/parity     |
| **C2 — different span positioning context** | Existing span's formatting/positioning role and second image's containing block, within the same local style/data surfaces          | Clip reference box, percentage dimensions, flow and slider placement may change; prove containing block, clip and slide behavior, all five canonical cases | Requires replacing/removing span, runtime adjustment, new convention, or fails preservation/parity       |
| **C3 — right-image-only alignment**         | Existing second image within the unchanged positioned span, through approved component-local style/data representation              | Matching image top can still crop pixels or leave clip-origin mismatch; prove image plus clip-box geometry and visual/interaction results                  | Needs changing clipping mechanism, forbidden scope, unapproved diagnostics, or fails preservation/parity |

The complete §6 campaign applies to whichever candidate is selected. These descriptions are not executable CSS instructions. No exact property/value or mapping entry is invented. Exactly one isolated Task 1 below may be instantiated by the P1/P2 packet; no alternative branch executes after failure.

## 4. Generated style and provenance contract

Likely surfaces, **not a current modification allowlist**:

| Surface                                                | Existing role / future restriction                                                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ng/src/image-compare/image-compare-style.ts` | Generated CSS destination; change only the approved local delta, retain unrelated groups byte-for-byte where generation permits                              |
| `packages/themes/test/utils/g3e-port.mjs`              | Existing `MAPPING`, `LOCAL_RULES`, `RETAINED`, `expectedCss()` and generator data; P2 must name the precise Angular-only data field, not invent a new policy |
| `docs/architecture/provenance/ng.json`                 | Existing Angular manifest; P2 must approve the exact changed-style entry/content, including any necessary new entry                                          |
| `docs/architecture/PROVENANCE.md`                      | Existing aggregate provenance document; modify only if specifically required and approved in P2, never as a general refresh                                  |
| `packages/themes/test/g3e-upstream-fidelity.test.ts`   | Existing fidelity assertions, read-only; no weakening, exemption, fixture/count change or new expected declaration merely to pass                            |

The current mapping includes shared array references between Angular/Vue. Do not mutate an aliased array in a way that changes Vue output. An Angular-only representation must use the existing architecture without changing its generation policy; if that cannot be achieved, stop. Both approved output and approved provenance must identify the selected adaptation honestly.

Before future implementation, retain the starting worktree hashes, original Angular generated/shipped CSS, protected Firefox group, relevant generator data and affected-file contents. Compare the delta against this **dirty-worktree starting state**, not HEAD alone: HEAD lacks earlier approved E-1 changes. Record source rule, exact adaptation, destination selector, upstream group/local-rule identity, provenance, rationale and evidence in the approved delta record. Unrelated mappings, fixtures, omissions/counts, Vue output and all E1-B1 inputs remain unchanged.

Generated output must equal shipped Angular ImageCompare CSS under the existing normalization/group comparison. No independent hand-edited declaration may bypass this comparison. Do not change the generator's functions, shared policy, fidelity expectations or source fixture to accommodate a candidate.

## 5. Task 1 — one local implementation, BLOCKED by P1/P2/P3 and execution authorization

**Files:** only the exact P2 allowlist, drawn from §4 where necessary. No test, story, template, runtime, preset, baseline or unrelated file is writable under this task.

**Consumes:** reviewed P1 selection, exact P2 packet, P3 campaign approval, explicit implementation authorization, starting-state hashes and established diagnostic evidence.

**Produces:** one selected local adaptation, generated Angular ImageCompare CSS, approved provenance delta, auditable diff, unchanged protected surfaces. No classification/status change.

- [ ] **Confirm all gates are explicitly satisfied.** If any are missing, do not edit or run checks. Confirm branch and dirty state, preserving prior approved/user changes.
- [ ] **Apply only the exact P2-approved generator-data delta.** No candidate substitution, inferred property/value, new rule category or declaration beyond that packet.
- [ ] **Generate the Angular ImageCompare CSS once from that data.** Existing generator entry point: `node packages/themes/test/utils/g3e-port.mjs ng imagecompare`. This is a future command; its output replaces only the style module's CSS body as approved, without rewriting unrelated source.
- [ ] **Apply only approved provenance text/entry changes.** The record must describe what actually changed, not claim an upstream declaration that does not exist.
- [ ] **Inspect the bounded diff against starting hashes.** Confirm DOM/template/runtime/API, span, clipping handler, E1-B1, Vue, tests/stories and unaffected mappings are unchanged. An unapproved or unexplained delta is a stop, not authority to clean up other work.

There is no second implementation task. Any deviation, wrong candidate or need to revise the approved delta stops for a human ruling. Task 1's mechanical steps become actionable only with exact P2 content; this plan supplies none of that unselected candidate's code.

## 6. Task 2 — one verification campaign, separately gated

**Files:** existing checks/source are read-only. Newly collected evidence and approved temporary read-only instrumentation belong in the ignored SDD evidence directory, proposed `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/`. Do not overwrite Stage 1/Stage 2, prior evidence, repository snapshots or documentation.

**Consumes:** the one approved implementation and exact reviewed campaign packet. **Produces:** raw measurements, screenshots, accessibility envelopes, reach/check outputs, provenance/fidelity comparisons, hashes and result accounting for human review.

### Campaign environment and preparation

Use the specified Docker image, Playwright 1.63.0, pinned PrimeNG 21.1.9 / PrimeUIX 2.0.3, 1280×720 and original fixture bytes. Record image ID/platform, browser versions, HEAD plus dirty input hashes, package lock/input archive, selected candidate and approval references. Readiness/font/image settling and pointer parking remain unchanged. Installation/preparation uses frozen inputs. Approve an exact needed dependency-build list at P2/P3; no root recursive build/test/typecheck or unrelated framework suite is implied.

Existing before evidence is the corrected Stage 2 case, not a new browser capture. No exploratory pre-pass, test-list browser launch or separate diagnostic run is included. Any required instrumentation is a reviewed container-only copy, not a permanent tooling edit. Collect the existing corrected-hook fields during the primary parity observation; do not load the case a second time merely to measure it. Preserve existing harness-required noise observations.

### Exact scoped run matrix

Each row below is part of the single campaign. Commands are future selections for P2/P3 review, not commands executed in plan creation. Container-only config/instrumentation must be approved concretely before use.

| Run                                        | Selection / invocation contract                                                                                                                                                                                                                                                                            | Evidence / required outcome                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **V1 — parity + internal geometry**        | One `prime-parity-chromium` run of `tooling/prime-reference/e2e/g3e.spec.ts`, batch E-1, grep `\bimagecompare/(root-style\|default\|slide\|focus\|rtl) \[ng\] PrimeNG 21\.1\.9 vs Ultimate$` interpreted as the alternation regex shown below; one worker, retries 0; approved Angular-only derived config | Exactly five Angular cases; root-style measurements from that observation; existing environment and zero-noise checks; saved comparison images/reports |
| **V2 — visual regression**                 | One invocation each for `ng-chromium`, `ng-firefox`, `ng-webkit` of `packages/ng/e2e/g3e-aura-styles.spec.ts`, grep `\bNg/ImageCompare (Sized\|Rtl) rest G3-E E-1 visual$` interpreted as alternation                                                                                                      | Two existing ImageCompare screenshot tests per engine, unchanged thresholds/snapshots, raw expected/actual/diff outputs retained                       |
| **V3 — accessibility**                     | One targeted set: existing Sized/Rtl accessibility tests in each of those three engines, exact regex below; one scoped read-only differential validation invocation approved at P2                                                                                                                         | Six new envelopes, all required reports present, no introduced violation under existing baseline/pre-existing fingerprint accounting                   |
| **V4 — selector reach**                    | One invocation of `packages/ng/e2e/g3e-aura-styles.spec.ts`, `ng-chromium`, exact grep `\bNg/imagecompare selector reach G3-E reach$`, retries 0                                                                                                                                                           | Existing Sized/Rtl reach runs, unchanged collector/validator and no new failure; do not run or edit Image's closed E1-B2 interaction                   |
| **V5 — component unit**                    | Once: `pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/image-compare/image-compare.spec.ts --watch=false`                                                                                                                                                                               | Existing projection, range and clip-path behavior assertions preserved and passing                                                                     |
| **V6 — generated-style fidelity**          | One approved scoped read-only comparison of Angular `imagecompare` using the existing `actualCssText`, `parseGroups`, `norm`, `expectedCss` logic and existing count literals                                                                                                                              | Generated and shipped groups equal, approved mapping delta only, exact protected Firefox declaration and counts preserved                              |
| **V7 — build/type**                        | Once each: `pnpm --filter @ultimate/ng run build` and `pnpm --filter @ultimate/ng run typecheck`, with required dependency artifacts prepared once per approved list                                                                                                                                       | No new attributable compile/type failure; no repair of unrelated debt                                                                                  |
| **V8 — changed-file provenance/integrity** | One scoped read-only check against the starting worktree manifest and P2 allowlist; inspect the exact changed-style provenance entry, generated/shipped equality and protected hashes                                                                                                                      | Every changed source file accounted for; no unrelated mapping/Vue/product/test/baseline/history change; E1-B1 preserved                                |

Playwright matches grep against the full test title, including project/file/ancestor context. These patterns match the exact leaf-title suffix at a word boundary rather than assuming the leaf starts the full title. Apply them only with the explicit file and Angular project selections in V1–V4; V3 uses the same file/project restrictions as V2. For clarity, the table escapes `|` only for Markdown rendering. The literal CLI grep strings are:

```text
V1: \bimagecompare/(root-style|default|slide|focus|rtl) \[ng\] PrimeNG 21\.1\.9 vs Ultimate$
V2: \bNg/ImageCompare (Sized|Rtl) rest G3-E E-1 visual$
V3: \bNg/ImageCompare (Sized|Rtl) G3-E E-1 accessibility$
V4: \bNg/imagecompare selector reach G3-E reach$
```

The future P2/P3-approved execution packet must specify selection validation before test bodies execute: V1 exactly five named Angular ImageCompare cases; V2 exactly two visual tests per selected engine; V3 exactly two accessibility tests per selected engine (six total); V4 exactly one ImageCompare reach test, whose existing body contains Sized/Rtl runs. Validate test identities, files and projects as well as counts. Zero tests, an unexpected count or any unexpected identity/file/project is a setup failure and **STOP** condition, not a passing or skipped campaign. Exact validation handling remains an approval prerequisite; no additional browser pass or campaign is authorized by this requirement.

V1 uses existing `tooling/prime-reference/playwright.config.ts` as the base, selects only Angular reference/Storybook servers, and integrates the retained corrected hook during `observe()` for root-style. P2 must approve the exact temporary config/hook diff, output locations and invocation before execution; no runnable integration is claimed to exist yet.

V2–V4 require a **temporary, container-only configuration approved under P2/P3 before execution**, preserving the selected existing Angular project settings and starting **only the required Angular Storybook server (`ng-storybook`)**. Do not start React Storybook, Vue Storybook or unrelated SSR servers. Selecting an Angular project alone is insufficient to isolate the root configuration's server array. The permanent/root Playwright configuration must remain unchanged. Exact temporary configuration/instrumentation content is not established here and remains an explicit approval prerequisite; do not invent or execute it from this prose. Retain `--retries=0`, one worker and no snapshot updates. Timeout/readiness conventions remain unchanged. Set stop-on-first-failure in the reviewed orchestration, including report-mode material mismatches; do not proceed to later invocations after a stop condition.

The primary measurement schema must retain identities/selectors, `getBoundingClientRect()` including x/y/top/bottom/width/height, computed positioning/formatting, width/height, box sizing, line-height/vertical-align, insets, object-fit/position, overflow/clipping, root→image/root→span/span→image offsets, bounded ancestry/offsetParent evidence and the slider relationship. Prime has no corresponding span; record absence, not fabricated geometry. Native thumb has no DOM rectangle; keep that limitation explicit. Blue visible left region remains the second/right image. Review saved pixels as well as numbers.

### Existing check-granularity constraints — must be resolved at P2/P3

The stock G3-E fidelity test loops through other ported keys and both frameworks; the stock accessibility validator requires all four E-1 stories across all three engines. Running them unchanged would broaden this campaign, while dropping required reports or editing their validators would weaken verification. Neither is permitted.

P2/P3 must approve exact **temporary, read-only scoped validation artifacts**, not a production policy change: V6 reproduces the existing generated/shipped equality for Angular ImageCompare only; V3 requires exactly the six ImageCompare envelopes and uses the existing `computeFingerprint`/`parseBaselineFingerprints` identity and both existing baseline/pre-existing sets to reject introduced violations. Do not change original validators, expected counts, assertions or baselines. Their unrun full-suite results must not be reported as passing. V8 inspects the exact changed-file entry rather than relying on a global validator whose git comparison ignores dirty worktree edits or includes unrelated debt. If scoped validation cannot preserve these contracts without new policy/tooling, **STOP** for a new ruling.

No such artifact is created now. Its exact approved contents are required before any campaign starts; the requirements here do not authorize an agent to improvise one during execution. Do not add coverage/stories or silently import historical envelopes as current scan results. Do not rerun B1's Angular/Vue failing assertions merely to broaden this scope; preserve both unchanged, retain their existing failure evidence and explicitly report them as still blocked/not rerun. If a future approval requires exercising either, obtain a separate exact selection/ruling first.

## 7. Acceptance criteria — AC1–AC9 carried forward

The following are the approved specification's criteria, without weakening:

| ID  | Required outcome after the separately authorized implementation                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 | The canonical second/right image's +3 px discrepancy is removed: its root-relative placement agrees with Prime within the existing ±1 px geometry tolerance, and saved-image review shows no residual visible displacement                                               |
| AC2 | Root, first-image and slider geometry remain correct against Prime and do not acquire unintended movement/resizing relative to the retained evidence; nominal pinned y targets remain 19, 16 and 18 respectively                                                         |
| AC3 | Second-image dimensions/horizontal position and retained span placement/clipping are documented; the internal relationship explains the matching pixels. Wrapper coordinates need not equal their old values if the approved candidate intentionally adapts that wrapper |
| AC4 | All existing affected cases in Spec §7 retain valid geometry, initial clipping, slide behavior, focus and RTL results; no new material difference attributable to the remediation is silently accepted                                                                   |
| AC5 | Parity obeys Playbook §6.4: geometry within ±1 px, equal material probes and no visible difference on review. Pixel-diff ratio remains advisory; no new ratio gate is invented                                                                                           |
| AC6 | Existing regression assertions retain their configured threshold (`threshold: 0.2` in the root Playwright configuration, no added ratio tolerance). Every changed screenshot is accounted for; an old-baseline mismatch is review evidence, not automatic acceptance     |
| AC7 | No new selector reach failure or introduced accessibility violation attributable to the remediation; existing gap classifications and validation strength remain unchanged                                                                                               |
| AC8 | Approved DOM/template/runtime/API and all unaffected E-1 declarations are preserved; the exact authorized adaptation delta is auditable and fidelity/provenance checks remain meaningful                                                                                 |
| AC9 | Applicable checks produce no new attributable failure. Both E1-B1 assertions and their blocker remain preserved, explicitly distinct from E1-V2 evidence; no overall-green or Task 6 completion claim follows                                                            |

Nominal pinned second-image y is 16, not a hardcoded CSS instruction. Wrapper position may change only as explicitly approved; preservation of rendered clipping still applies. Historical regression-baseline differences remain review evidence: unchanged prior mismatches are not newly passing tests. A failing invoked screenshot assertion stops the campaign even if its difference was previously reviewed; no baseline is accepted to make a run pass. Existing unaccepted ImageCompare baselines may therefore prevent completion of all campaign members. P3 must acknowledge that limitation; accounting for a prior difference does not grant permission to continue past a failing check.

## 8. Execution budget and stop handling

Exactly **one selected candidate → one implementation → one campaign**, retries **0**. V1 is one run over five cases; existing mandated noise observations stay inside that run. V2 has three engine invocations; V3 is one six-envelope set/validation; V4–V8 execute once per stated check. These are enumerated campaign members, not permission for repeated campaigns. No extra browser observation for primary measurements.

Prohibit alternate candidates, second implementations, automatic fix/rerun, timeout increases, diagnostic retries/hook correction, exploratory browser passes, snapshot updates and unrelated CI repairs. The earlier diagnostic budget remains exhausted. Future required primary measurements become authorized only through the explicit P2/P3 and implementation/verification ruling; any evidence outside that exact schema/case set needs separate authorization.

Stop on **any invoked verification check returning a failing status**, residual E1-V2 mismatch, unreliable measurements, setup differences or §9 escalation. This includes a screenshot assertion against an old unaccepted baseline: explaining the difference does not waive the assertion or authorize continuing. Existing B1 assertions are not invoked by this scoped campaign; preserve their historical failures separately, not as passing or waived checks. A report-mode parity process may exit zero while recording a material mismatch; that mismatch also triggers the stop. Capture available outputs, mark remaining campaign members not run and request a new human ruling. No correction, alternate hook or rerun follows automatically.

## 9. Escalation matrix

| Condition                                                                             | Action                                                                     |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Approved local CSS-only delta remains within constraints and checks succeed           | Continue only the remaining enumerated campaign members, then human review |
| DOM/template required                                                                 | STOP / human scope ruling                                                  |
| Runtime required                                                                      | STOP / human scope ruling                                                  |
| Public API required                                                                   | STOP / human scope ruling                                                  |
| Shared/global rule needed                                                             | STOP / human ruling                                                        |
| New token/theme/preset needed                                                         | STOP / human ruling                                                        |
| Generator-policy change needed                                                        | STOP / human ruling                                                        |
| Another framework/component affected                                                  | STOP / human ruling; do not investigate it                                 |
| New architectural rule/convention                                                     | STOP / human ruling; no ADR automatically                                  |
| New diagnostic evidence outside the approved campaign needed                          | STOP / separate diagnostic authorization                                   |
| Verification mismatch or any invoked check fails, including an old-baseline assertion | STOP / new ruling; no fix, waiver, continuation or rerun                   |
| E1-B1 declaration/token/assertion behavior changes                                    | STOP; preserve blocker; no remedial B1 edits                               |
| Gates incomplete or exact delta/instrumentation unavailable                           | Remain blocked before editing/running                                      |

## 10. Rollback and safety

Before implementation, preserve exact pre-change copies/hashes of the P2 files, approved hunk diff and all existing dirty worktree changes. A failure stops execution first; do not silently replace a candidate with a rollback/fix and rerun.

If the human explicitly authorizes rollback, reverse **only this remediation's approved hunks** against the saved starting contents, including its matching local generator/provenance delta. Verify by file inspection/hash comparison that prior E-1 changes and E1-B1 remain intact. Do not use HEAD as the restoration source, broad checkout/reset/clean, baseline replacement or whole-file overwrite over intervening edits. On overlapping human changes, stop and obtain a ruling. Retain diagnostic/failure evidence. Rollback changes no GAP, baseline, story, classification or status and carries no new verification budget.

## 11. Task 3 — final review/closeout gate

- [ ] Present candidate/delta approvals, exact file diff, source/provenance record, input/environment hashes, raw geometry/deltas, images and V1–V8 outputs.
- [ ] Account for AC1–AC9, preserved E1-B1 failures, all remaining uncertainty, prior unaccepted regression differences and any stop condition reached. Do not claim an unrun broad suite passed.
- [ ] **HARD HUMAN STOP.** No automatic E1-V2 closure/reclassification, Task 6 completion, baseline acceptance, parity/status promotion, commit, merge or push. Human final review decides disposition; any later authorized documentation records the new ruling without rewriting historical evidence.

Governance remains: approved specification → this plan → Plan Review (including exact prerequisite packet) → explicit implementation authorization → bounded Task 1 → bounded Task 2 → human Task 3. The present PLAN authorization stops after writing this document. P1–P3 are unsatisfied; all existing states remain unchanged.
