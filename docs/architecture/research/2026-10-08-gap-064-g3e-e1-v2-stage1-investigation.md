# G3-E E-1 — E1-V2 Stage 1 artifact/source-only investigation

**Date:** 2026-10-08  
**Authorization:** One artifact/source-only pass; now concluded.  
**Conclusion:** **Cause NOT established; evidence insufficient.**

## 1. Scope

Angular `imagecompare/root-style` only: determine whether existing artifacts/source establish the cause of its approximately 3 px internal vertical offset. This is a **Stage 1 investigation artifact**, referencing the [existing E-1 record](2026-10-08-gap-064-g3e-e1-record.md), especially its full visual review and final E1-V2 ruling. That record is unchanged. The [decision proposal](2026-10-08-gap-064-g3e-e1-decision-proposal.md) remains a proposal/history of alternatives; the user's subsequent approval authorizes only the dispositions stated here.

## 2. Authorization boundary and E1-B1 disposition

The user approved **E1-B1 → B1-0 / Preserve and Defer**. E1-B1 remains **BLOCKED**: the upstream Firefox thumb declaration, missing `imagecompare.handle.border.style` value, faithful preset and both failing assertions remain unchanged. No newer upstream version, replacement value or general missing-token policy was investigated. B1-0 is documented here only; technical evidence and the existing record are not rewritten.

E1-V2 authorization permits one inspection/organization pass over relevant existing artifacts and source, with no browser run, remediation, candidate-fix experiment, tooling modification, scope expansion or second pass. No Spec/Plan/ADR amendment or GAP registration is authorized. Even an established cause would not authorize changing E1-V2's classification/status. This pass concludes at the evidence-shortfall boundary below.

## 3. Evidence inspected

The following paths identify the exact substantive evidence used. Archive contents were read in place, without extracting or changing repository inputs. Other cases were not investigated.

**Saved evidence base:** `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/`.

| Evidence                                                                                      | Inspected content                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-e1-corrected/parity-E-1-corrected-before/`                                            | Angular `imagecompare/root-style` row in `report.json`; `imagecompare--root-style.ng.png`, viewed at original resolution                                                                                  |
| `docker-e1-after/parity-E-1-after/`                                                           | Same Angular report row and triptych; original PNG pixels compared offline                                                                                                                                |
| `docker-e1-corrected/src.tar`, `docker-e1-after/src.tar`                                      | Case/part map, runner/probe/config, matching story/reference, Ultimate ImageCompare template/style, reference bootstrap/HTML/build setup, upstream ImageCompare CSS fixture and the two case image inputs |
| `docker-e1-corrected/commit.txt`, `docker-e1-after/commit.txt`                                | Input labels: `7c49568` plus corrected wrappers; then `7c49568` plus wrappers and approved E-1 CSS worktree                                                                                               |
| `docker-e1-corrected/run.sh`, `docker-e1-after/verify.sh`                                     | Existing Docker preparation/run configuration, read only; neither script executed                                                                                                                         |
| `docker-e1-corrected/parity-E-1-corrected-before.log`, `docker-e1-after/parity-E-1-after.log` | Existing successful Angular root-style harness entries; these are historical execution evidence, not reruns                                                                                               |
| `docker-e1-after/check-E-1-results.tar`                                                       | Member-name inspection for this diagnostic; no root-style artifact found                                                                                                                                  |

**Relevant source paths, including their archived forms where available:**

- `tooling/prime-reference/cases-g3e.ts`: ImageCompare part map and root-style case definition.
- `tooling/prime-reference/e2e/g3e.spec.ts`: observation, comparison and report serialization.
- `tooling/prime-reference/e2e/probe.ts`: environment/probe fields, comparison thresholds, capture target and triptych composition.
- `tooling/prime-reference/playwright.config.ts`: recorded Chromium configuration.
- `tooling/prime-reference/ng/src/g3e.ts`: the root-style reference branch.
- `tooling/prime-reference/ng/src/main.ts`: reference bootstrap and G3-E route host, relevant to page setup.
- `tooling/prime-reference/ng/src/index.html`, `tooling/prime-reference/ng/angular.json`, `tooling/prime-reference/ng/package.json`: reference canvas, asset serving and pinned PrimeNG 21.1.9 setup.
- `packages/ng/.storybook/preview.ts`: Ultimate Aura application and Storybook configuration.
- `packages/ng/src/image-compare/image-compare.stories.ts`: Default/root-style story.
- `packages/ng/src/image-compare/image-compare.ts`, `image-compare-style.ts`: projection structure and positioning declarations, including archived before/after forms.
- `.vendor-extracted/ng/imagecompare/imagecompare.ts`, `.vendor-extracted/ng/imagecompare/style/imagecomparestyle.ts`: pinned extracted PrimeNG projection structure and shared stylesheet import.
- `packages/themes/test/fixtures/primeuix-styles-g3e.json`: only `modules.imagecompare`, including its archived forms.
- Archived `tooling/prime-reference/fixtures/media/landscape-1.png` and `landscape-2.png`: the case's 800×600 inputs. SHA-256 values in both archives are respectively `fcb9f0eff74f7614d7e791c920253327872740df0ac0f8f053adca98cc39fc86` and `a2d5d4f160a5ece9b940c0c7ca1672f3de14f49fc8c43a4732a8e670ac920a2b`.

The archived case map, runner/probe/config, matching story/reference setup and bootstrap/preview agree with the current inspected files. The after-port Ultimate template also agrees. Its archived/current style difference is a restored documentation header; the CSS body is unchanged. Before-port CSS differs as expected from the approved port. This makes the archived styles, rather than assumptions about the current worktree, the historical source evidence.

## 4. Existing measured facts

- Corrected-before root differences: Prime → Ultimate `y` 19 → 16, width 1257.5 → 320, height 17 → 240, display inline → inline-block, line-height normal → 0px. This describes the old root mismatch, not the after-port internal cause.
- After-port report: `differences: []`; explanatory root box-sizing border-box → content-box; empty facts; verdict **review image**; pixel ratio approximately 0.27442; saved probe/Prime-pixel/Ultimate-pixel noise counts all 0.
- “Matching root probes” means no material difference under the existing comparator: geometry differs only when its rounded values differ by more than 1 px. It does not establish exact root-coordinate identity. The report does not serialize the raw probe snapshots.
- The case requests only `parts: ["root"]`, no actions, and a container screenshot. The existence of left/right/slider selectors in the broader part map does not mean those parts were measured for this case.
- The after triptych is 3768×43: three 1248-wide panels, two 12 px gaps, and a common 22 px header. At corresponding content x=100 in Prime and Ultimate, the blue-band rows are 33–38 versus 36–41: a 3 px displacement in the saved raster. This is an offline reading of existing pixels, not a new rendered measurement.
- The compositor copies both source images at y=22 without scaling; it pads unused image area white. Its source does not apply a panel-specific vertical shift. The approximately 3 px difference is not explained by the compositor's header/gaps.
- Both archived setups retain `width: 20rem` on the root, with the same two fixture URLs. The flex-wrapper adaptation applies elsewhere, not to this diagnostic. The case input bytes are unchanged.

## 5. Evidence-to-hypothesis table

| Measured fact / source evidence                                                                                                      | What it proves                                                                     | What it does not prove                                                                      | Competing explanation and remaining possibility                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Blue-band boundary differs by 3 px in corresponding saved panels                                                                     | A visible internal raster displacement exists                                      | Which element or formatting calculation caused it                                           | Internal image placement, static positioning or containing-block geometry remain possible                              |
| No material root differences; only root requested                                                                                    | The comparator did not find a material root mismatch                               | Exact raw root equality, image rectangles or wrapper/slider positions                       | Different internal geometry can coexist with matching root probes; possible                                            |
| Prime projects images directly; Ultimate puts only the right image in an absolute span                                               | A real structural adaptation exists                                                | That the right wrapper causes the observed left/blue-image displacement                     | Indirect formatting effects remain possible; direct attribution to the wrapper is unproven                             |
| Both shared image rules use absolute positioning with percentage width/height; Ultimate additionally positions the span with inset 0 | Relevant positioning declarations and a different containing-block structure exist | Used inset/static-position values, containing-block rectangles or the numerical 3 px result | Inline line-box/static-position behavior and nested containment remain competing possibilities                         |
| Root remains inline in this preserved diagnostic; slider remains in the content structure                                            | The case retains a collapsed inline-formatting context                             | Its actual baseline/line-box metrics and their effect on each image                         | Projection whitespace, inline slider metrics and inherited formatting remain possible; no particular cause established |
| Root box-sizing differs in the explanatory report                                                                                    | An existing box-model difference is recorded                                       | That it causes this vertical offset                                                         | Box-model effects remain a possibility, not a proven contribution; GAP-098 is not investigated or expanded             |
| Both image inputs are byte-identical between archives; fixture URLs/setup agree                                                      | No before/after change to the case fixture files or setup text                     | Runtime used image rectangles or the complete applied style cascade                         | Changed fixture bytes are unsupported; layout/cascade explanations remain possible                                     |
| Equal environment assertion and zero saved repeat noise; root-style has no actions                                                   | The saved run was stable under its existing comparisons                            | All descendant inherited styles, every timing effect or exact font/line-box metrics         | Random capture variation is unsupported by saved repeats; stable descendant formatting differences remain possible     |
| Both panels use the same unscaled compositor y origin                                                                                | No compositor-introduced vertical panel translation                                | The DOM source of displacement inside the original captures                                 | Different DOM/image positions remain possible; header/gap translation does not explain the offset                      |

## 6. Competing explanations

The strongest remaining categories are inline/static-position behavior, containing-block differences involving projection/wrapping, and unmeasured descendant formatting/box metrics. They may interact. In particular, the wrapper hypothesis must explain why the observed displacement is in the left/blue fixture even though the explicit span contains the right image. The source does not establish that indirect mechanism or its magnitude.

Changed fixture bytes and an intentional compositor panel translation are not supported by the inspected evidence. Stable pixel output does not distinguish among the remaining stable layout explanations. None is elevated to an established cause, and no CSS declaration or remediation is proposed.

## 7. What can be established

The visible displacement, its approximately 3 px magnitude in the existing raster, the direct-versus-wrapped projection difference, the positioning declarations, unchanged case inputs/setup text, and the limited measurement/report coverage are established at the stated artifact/source level. The saved comparison is not a Match merely because its root comparison is empty.

## 8. What cannot be established

The inspected evidence lacks case-specific raw internal rectangles, used image/wrapper/slider positions, complete descendant computed styles, line-box/baseline metrics and containing-block relationships. The runner held root probe snapshots in memory but serialized only differences, explanatory differences, facts and aggregate pixel/noise results. The retained comparison directory has triptychs/report/summary, not an internal-geometry dump; the inspected result archive has no root-style diagnostic entry.

Source establishes declarations and structure, not the complete browser-computed layout. The known before-port root y difference cannot be reused as proof of the after-port internal cause. No exact causal chain, single responsible declaration, safe fix or intentional-design rationale can be established from this evidence.

## 9. Is the offset cause established?

**Cause NOT established; evidence insufficient.** E1-V2 remains **unresolved Class B adaptation / OPEN**. It is not C or Match. Classification/status is not changed by this investigation.

## 10. Would further browser diagnostics be justified?

**Yes, if the human chooses to pursue causation.** The missing evidence is browser-used internal geometry/styles for the unchanged Angular root-style comparison; additional source-only reasoning cannot reconstruct those values reliably from the retained report. A separately authorized diagnostic could collect those measurements with provenance. No such run is authorized or performed here, and it would not authorize remediation. This conclusion is an evidence request, not a proposed fix or automatic next step.

## 11. Exact stop condition and final state

The single Stage 1 pass reached its stop when the retained case coverage/report schema and inspected artifacts proved insufficient to distinguish the remaining internal-layout hypotheses. The next causal step requires new rendered evidence, which is outside the approved artifact/source-only boundary. **Stop now; no second pass or browser diagnostic. Another explicit decision gate is required before further investigation.**

E1-B1 remains **BLOCKED / B1-0 Preserve and Defer**; E1-V2 remains **B / OPEN**; E1-B2 remains **CLOSED / VERIFIED**, with no reach changes; E1-V1 remains **A / out of scope**, with no new GAP. Task 6 remains **STOPPED / not complete**. Full visual review remains complete, with no baseline acceptance or parity/status promotion.

Only this new investigation document is created. The existing E-1 record and decision proposal are unchanged. **Browser/verification checks run: NO. Product/tooling code changed: NO.** No implementation, candidate-fix test, preset/mapping/assertion change, Spec/Plan/ADR amendment, GAP creation, commit, merge or push occurred.
