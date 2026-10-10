# G3-E E-1 — E1-V2 C1 experiment authorization packet

**Date:** 2026-10-08  
**Status:** READY FOR HUMAN EXPERIMENT AUTHORIZATION  
**Execution authorization:** NOT GRANTED. This document proposes one falsifiable mutation, not a proven remediation or an implementation packet.

## 1. Authority and hypothesis

Sources: [approved remediation Spec](../../superpowers/specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md), [approved Plan](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-remediation.md), [corrected Stage 2 evidence](2026-10-08-gap-064-g3e-e1-v2-stage2-corrected-investigation.md), [typography/P1 ruling](2026-10-08-gap-064-g3e-e1-v2-typography-p1-ruling.md), and [blocked P2 assessment](2026-10-08-gap-064-g3e-e1-v2-p2-design.md). P1 selects C1 only. P2 remains blocked because an exact safe production delta is not established.

| Existing canonical top/y (CSS px) | PrimeNG | Ultimate |
| --- | ---: | ---: |
| Root | 19 | 19 |
| First image | 16 | 16 |
| Second/right image | 16 | 19 |
| Slider | 18 | 18 |

Prime's second/right blue image is directly positioned at root−3. Ultimate's retained absolute span is at root+0 and its image at span+0. Hypothesis: allowing vertical static placement of that same absolute span, while explicitly retaining a containing-block-relative height, can align its image/clipping origin with Prime without disturbing the other geometry. The span remains the clip/sizing carrier and the image remains its child. This is not proof that the proposed declarations will produce that result.

## 2. Exact temporary mutation and rationale

Only the existing Ultimate `.u-image-compare > span` in each approved Angular case may receive these temporary inline overrides:

```css
top: auto;
bottom: auto;
height: 100%;
```

No other declaration may change. Preserve authored `position: absolute`, horizontal zero insets, clip-path, image rules and the existing hierarchy. Apply all three declarations once as one mutation; do not test subsets or alternative values.

This is a source-based experimental proposal: the retained rule currently supplies zero insets, whereas the directly positioned images have no authored vertical inset. `auto` tests whether releasing the span's explicit vertical anchoring recovers the relevant static origin. The explicit percentage height tests preservation of the root-relative overlay height after releasing both vertical constraints; existing images already use percentage sizing. Stage 2 records equal root/span/image heights in the unchanged canonical case. These facts justify testing this sizing relationship, but do not establish its used height or placement after mutation, particularly against an inline root. Those are the experiment's questions. Neither `100%` nor `auto` encodes the observed −3 px as compensation.

Before mutation, retain the span's complete original inline-style attribute, including absence if applicable, and the three properties' values/priorities. After measurements, restore the exact original attribute in `finally`, including the existing runtime clip-path state. Do not overwrite that state while applying overrides. If original inline values conflict with the assumed unchanged setup, stop before applying the mutation.

This permits no repository edit, generator execution, production stylesheet replacement, token, global/shared rule, Vue/React change, DOM/template/runtime/API change or clipping-mechanism change. Temporary style mutation is diagnostic-only, not a hand-edit bypass for later production provenance.

## 3. Exact case scope and proposed observation budget

| Case | Existing Ultimate story | Existing state/action |
| --- | --- | --- |
| `imagecompare/root-style` | `ng-imagecompare--default` | Primary inline-root case; no action |
| `imagecompare/default` | `ng-imagecompare--sized` | Sized initial 50% |
| `imagecompare/slide` | `ng-imagecompare--sized` | Existing slide-to-25% action |
| `imagecompare/focus` | `ng-imagecompare--sized` | Existing focus action |
| `imagecompare/rtl` | `ng-imagecompare--rtl` | Existing RTL case |

Recommend **one C1 mutation, one experimental run, zero retries**, one worker and no repeat. One invocation contains the five cases, each with one unchanged Prime observation and one Ultimate page observed before and after the same mutation. The before/after pair is explicitly part of this proposed budget, not a second attempt. No alternate mutation, value sweep, reload-to-confirm or second campaign is included. Stop at the first failure/ambiguity; mark later cases not observed.

Use existing case definitions, actions and part selectors. Capture the unchanged state after the existing action/readiness sequence, apply the mutation once, reuse existing settling, then capture the mutated state. Do not repeat the interaction after mutation or add new range/focus actions. This budget samples the existing states; it does not establish every possible interaction sequence or replace later implementation verification.

## 4. Fixed environment and execution boundary

Reuse the accepted Stage 2 archived product inputs (`src.tar` SHA-256 `60bc65d477ffcae50c653c4d738e2f086a8fcb61e3351eab5811c600e2ec90a4`) and environment:

- Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, recorded image ID `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`.
- Linux arm64, Node v24.20.0, Playwright 1.63.0, Chromium 153.0.8010.12, project `prime-parity-chromium`.
- Viewport 1280×720, DPR 1; unchanged fixtures, theme/preset, fonts and fixture-scoped typography ruling. No Inter integration or new font loading.
- Existing reference/Angular Storybook setup, readiness, font/image waits, settling, pointer handling and capture configuration. No new browser, viewport, asset, synchronization convention or server configuration.

The only future diagnostic-driver extension is the enumerated case loop, retained corrected measurement hook, exact span overrides and cleanup above. It must exist solely in the disposable container. Preserve the retained Stage 2 configuration; do not edit permanent harness/tests/tooling. Before execution, human approval must identify the exact temporary driver text/diff, retained configuration/runner copies, command and evidence destination. **Those runnable artifacts have not been created by this packet.** Their concrete source-only preparation/review is a prerequisite; approval of the concept alone must not be treated as permission to improvise a driver. No new environment or instrumentation convention is permitted. If existing setup cannot support this procedure, stop for a ruling.

## 5. Measurements and evidence

Reuse the corrected hook's element identities: Prime root/direct images/slider and Ultimate root/direct first image/span/nested second image/slider. No broad DOM dump or new selector strategy.

For Prime unchanged, Ultimate before and Ultimate after, retain:

- Full rectangles, including top/y, x, bottom, width/height, for root, both images, span where present and slider.
- Root→first image, root→second image, root→span, span→second image and root→slider offsets; offsetParent and bounded ancestry.
- Relevant computed position/display/insets, width/height/min/max dimensions, box-sizing, padding/borders/margins, overflow, font/line-height/vertical-align, direction, object-fit/object-position and clip-path.
- Image source identity, intrinsic dimensions/readiness, slider value and focused-element identity for the existing focus state. Do not synthesize native-thumb rectangles.
- Before/after screenshots using existing capture behavior, available Prime comparisons, and calculated numeric deltas. Pixel ratios remain advisory. Save expected/observed clip boundaries calculated from the captured polygon and wrapper box where unambiguous; record any inability to resolve them rather than inferring correctness.

Distinguish **placement**, **wrapper/image sizing**, and **visible clipping/cropping** as independent outcomes. Rectangles alone cannot prove the absence of clipping artifacts.

## 6. Success criteria and risks

Apply the existing Spec AC1–AC9 without changing thresholds or granting overall acceptance. For the primary case, second-image top must agree with Prime's y16 within the existing ±1 px geometry tolerance, with no visible residual displacement. Root y19, first image y16 and slider y18 must remain correct. Preserve second-image horizontal geometry and dimensions; the retained span must remain a valid image-containing and clip-bearing box. A y16 image with collapsed/resized wrapper, cropped content or gaps fails.

For all existing regression cases, compare mutated geometry/clipping/state with the contemporaneous unchanged observation and Prime reference. No new material image-size, clipping/crop, slide-state, focus or RTL regression is acceptable. Existing recorded differences remain separately accounted for, not remediated or automatically waived. Unchanged selectors do not prove selector reachability; this experiment does not run the reach/a11y/unit/build suites and cannot claim those ACs verified. DOM/template/runtime/API, E1-B1 and all non-experimental declarations must remain unchanged.

Primary risks are percentage-height resolution against the inline containing block, span/static-origin placement, changed clipping reference geometry, and behavior differing in flex-sized/RTL states. Unchanged handler code alone does not prove behavior preservation. A successful experiment supports later P2 consideration only; it does not establish complete production acceptance.

## 7. Failure and STOP rules

Stop immediately for any required DOM/template/runtime/API change; another component/framework impact; global/shared/token rule; ambiguous clipping or image sizing; unreliable or nondeterministic measurement; environment/setup mismatch; missing/extra case; unexpected geometry/visual/state result; need for a second mutation/value/candidate/iteration; new architectural convention/ADR; driver defect; or cleanup failure. Retain evidence and report not-observed cases. No correction, timeout increase, retry, alternate hook or fallback follows.

No success claim is permitted if required preservation evidence is incomplete. Do not change baselines or thresholds to pass. C2/C3 remain deferred after either success or failure.

## 8. Artifact and cleanup contract

Retain the human authorization, archived input/hash provenance, current worktree identity, exact temporary driver/mutation diff and hash, configuration/runner copies and exact invocation, case/project/browser identities, Docker/platform/Node versions, raw before/after measurements, computed styles, screenshots, available diff images, calculated deltas, per-criterion results, stop reason and cleanup confirmation. Use a new ignored evidence directory under the existing G3-E evidence structure; do not overwrite Stage 2 or any historical evidence. Its exact path belongs in the reviewed execution packet.

Restore each page's original inline-style attribute and close disposable pages/context; retain restoration results and confirm no repository source/configuration/baseline change. Dispose of the experimental container after evidence retention. Cleanup is not permission for another observation campaign. No temporary override may be copied into production or generator data without later implementation approval.

## 9. Relationship to gates and final state

Preparing this packet does **not** unblock P2. Human approval can authorize only the exact bounded experiment and reviewed driver packet. Success supplies evidence for a later P2 decision, not P2 approval, P3 approval or implementation authorization. Failure authorizes neither another value nor C2/C3.

Current state remains: P1 **C1 approved**; P2 **BLOCKED**; P3 **not approved**; implementation **unauthorized**; E1-V2 **B / OPEN**; Task 6 **STOPPED / not complete**. E1-B1/B2/V1 and existing GAP classifications remain unchanged. No experiment is executed, no Spec/Plan or product/test/harness/tooling code is changed, and no baseline/status/classification change, commit, merge or push occurs in packet preparation.
