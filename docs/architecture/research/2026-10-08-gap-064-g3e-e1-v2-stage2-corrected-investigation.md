# G3-E E-1 — E1-V2 Stage 2 corrected-hook diagnostic

**Date:** 2026-10-08  
**Result:** Single authorized corrected pass succeeded; both sides observed.  
**Conclusion:** **Cause established for this case: the second/right image's different containing-block and static-position relationship explains its +3 px displacement.**  
**Disposition:** E1-V2 remains **Class B / OPEN**. Task 6 remains **STOPPED / not complete**.

## 1. Authorization and original failure

The human explicitly authorized one minimum hook correction and exactly one diagnostic rerun after reviewing the [original Stage 2 failure](2026-10-08-gap-064-g3e-e1-v2-stage2-investigation.md). That failed attempt persisted no geometry and never observed Ultimate. It remains a diagnostic-hook failure, not product evidence. Its document and evidence are unchanged.

This corrected attempt supplements the unchanged [Stage 1 investigation](2026-10-08-gap-064-g3e-e1-v2-stage1-investigation.md) and [E-1 record](2026-10-08-gap-064-g3e-e1-record.md). No remediation, classification change, baseline acceptance, parity/status promotion, new GAP, Spec/Plan/ADR amendment or further browser iteration is authorized.

## 2. Scope and exact hook correction

Angular `imagecompare/root-style` only. One test, one worker, one observation per side, retries 0, repeatEach 1. No alternative case, browser, viewport, fixture, theme, synchronization, interaction or fix experiment.

The original `textRects()` passed all non-text child nodes to `identity()` as Elements. The copied diagnostic hook now distinguishes Elements before accessing element-only properties:

```ts
if (node.nodeType !== Node.TEXT_NODE) {
  if (node instanceof Element) return { type: "element", identity: identity(node) };
  return { type: "non-element", nodeType: node.nodeType };
}
```

The text-node Range branch and Element identity behavior are unchanged. The successful Prime observation records two non-element nodes with `nodeType: 8` (comments). No selectors or other hook logic changed. The original hook remains untouched; the exact one-hunk change is retained in `hook-correction.diff`.

The diagnostic driver/configuration were copied into the disposable container, never into permanent repository tooling. The retained hook is diagnostic-only and case-specific.

## 3. Environment and provenance

Evidence base: `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/`. Corrected attempt directory: `e1-v2-stage2-corrected/`; original attempt: `e1-v2-stage2/`.

| Item                    | Corrected attempt                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Branch / HEAD           | `feature/gap-064-g3e-media-data` / `7c49568b50ed1017e17334152a48fb231e7ec307`                                            |
| Product input           | Exact original Stage 2 `src.tar` reused, including prior approved dirty E-1 work; no refreshed or altered product inputs |
| Input archive SHA-256   | `60bc65d477ffcae50c653c4d738e2f086a8fcb61e3351eab5811c600e2ec90a4`                                                       |
| Original hook SHA-256   | `a12d2644d35d57436feb282378903ee5eb611b9b98b2fe3e72811ceb441058b7`                                                       |
| Corrected hook SHA-256  | `91823fc355292ae29c6ae2d79db14177acfd5a13f603825c867bfc69bd13aaf1`                                                       |
| Docker image            | `mcr.microsoft.com/playwright:v1.63.0-jammy`                                                                             |
| Verified local image ID | `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`                                                |
| Platform / Node         | Linux arm64 (`aarch64`) / v24.20.0                                                                                       |
| Playwright / project    | 1.63.0 / `prime-parity-chromium`                                                                                         |
| Runtime Chromium        | `153.0.8010.12`                                                                                                          |
| Viewport                | 1280×720, device pixel ratio 1                                                                                           |
| Run                     | Start `2026-10-08T14:40:49.815Z`; runner duration 20.024 seconds; 1 passed, 0 unexpected, 0 skipped, 0 flaky, retries 0  |

`commit.txt`, `git-status.txt` and `input-sha256.json` retain original archived-input provenance. `current-git-status.txt` and `pre-rerun-worktree-sha256.json` separately retain the current repository state before this rerun; they are not represented as contents of the reused archive. `hook-provenance.json` records both hook hashes and the archive hash. Runner and diagnostic configuration are byte-identical to the original attempt.

The existing `load`, `environment`, `run`, `settled`, `probe`, `imagesLoaded` and `capture` helpers were reused without change, including font readiness, settling, pointer parking and empty case actions. Both sides passed the existing environment equality guard: font, canvas padding, container origin/width and viewport agree. Installation/build were the unchanged Docker preparation, not additional verification suites. No unit, reach, accessibility or visual-regression suite ran.

## 4. Exact case and inspected source

- PrimeNG: `http://localhost:6022/#/g3e/imagecompare/root-style`, pinned PrimeNG 21.1.9 / PrimeUIX styles 2.0.3 reference.
- Ultimate: `http://localhost:6001/iframe.html?id=ng-imagecompare--default&viewMode=story`.
- Existing root inline style: `width: 20rem`; original probe parts `["root"]`; no case actions; existing container capture.
- First/original part-map `left`: `landscape-1.png`, 800×600.
- Second/original part-map `right`: `landscape-2.png`, 800×600. **This is the blue image visible in the left clipped region.** Visible region and source identity must not be conflated.

Source inspected to interpret the measurements: `tooling/prime-reference/cases-g3e.ts`, `tooling/prime-reference/e2e/probe.ts`, `tooling/prime-reference/playwright.config.ts`, `tooling/prime-reference/ng/src/g3e.ts`, `packages/ng/src/image-compare/image-compare.stories.ts`, `packages/ng/src/image-compare/image-compare.ts`, `packages/ng/src/image-compare/image-compare-style.ts`, the ImageCompare template/style import in `.vendor-extracted/ng/imagecompare/`, and the root/image positioning declarations in `.vendor-extracted/uix-styles-full/src/imagecompare/index.ts`. The earlier Stage 1/Stage 2 reports supply historical context. No E1-B1 investigation was undertaken.

## 5. Elements and selectors measured

| Element                 | PrimeNG                                                  | Ultimate                                                           |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| Root                    | `.p-imagecompare` → `p-imagecompare.p-imagecompare`      | `.u-image-compare` → `u-image-compare.u-component.u-image-compare` |
| First image             | `.p-imagecompare > img:first-of-type` → `img`            | `.u-image-compare > img` → `img`                                   |
| Second/right blue image | `.p-imagecompare img + img` → `img`                      | `.u-image-compare > span > img` → `img`                            |
| Right-image wrapper     | None                                                     | `.u-image-compare > span` → `span`                                 |
| Slider                  | `.p-imagecompare-slider` → `input.p-imagecompare-slider` | `.u-image-compare-slider` → `input.u-image-compare-slider`         |

Raw records retain element identity, current image URL/natural dimensions, bounding and fragment rectangles, offsetParent/offsetTop, dimensions, computed styles, bounded ancestry, existing child-node ranges and detached-canvas font metrics. The canvas adds no DOM/style. The slider's native thumb has no DOM Element rectangle; its computed-style query is retained, with `thumbRect: null` and an explicit limitation. No synthetic thumb geometry is inferred.

## 6. PrimeNG measurements

All coordinates and sizes are CSS pixels. Here `y = top` for every element.

| Element            |   x | y / top | bottom |  width | height |
| ------------------ | --: | ------: | -----: | -----: | -----: |
| Root               |  16 |      19 |     36 | 1257.5 |     17 |
| First image        |  16 |      16 |     33 | 1257.5 |     17 |
| Second/right image |  16 |      16 |     33 | 1257.5 |     17 |
| Slider             | 8.5 |      18 |     33 |   1263 |     15 |

Root: inline, relative, border-box; computed width 320px, height auto. Both images: block, absolute, border-box; used computed width/height 1257.5px/17px; computed top/bottom −3px/+3px, left/right 0px. Slider: inline-block, relative, border-box; 1263px/15px; computed insets 0px.

The image rules specify no top/bottom/left/right declarations; the recorded computed pixel insets describe the browser-used placement, not an authored `top: -3px` rule.

## 7. Ultimate measurements

| Element            |   x | y / top | bottom |  width | height |
| ------------------ | --: | ------: | -----: | -----: | -----: |
| Root               |  16 |      19 |     36 | 1257.5 |     17 |
| First image        |  16 |      16 |     33 | 1257.5 |     17 |
| Second/right image |  16 |      19 |     36 | 1257.5 |     17 |
| Right-image span   |  16 |      19 |     36 | 1257.5 |     17 |
| Slider             | 8.5 |      18 |     33 |   1263 |     15 |

Root: inline, relative, content-box; computed width 320px, height auto. First image: block, absolute, content-box; 1257.5px/17px; computed top/bottom −3px/+3px. Second image: block, absolute, content-box; same dimensions; computed top/bottom 0px/0px. Both images have left/right 0px. Span: block, absolute, content-box, all insets 0px; 1257.5px/17px; overflow visible. Slider: inline-block, relative, content-box; same geometry and computed insets as Prime.

Both sides have normal line-height, baseline vertical-align and the same 16px Times New Roman font. Image object-fit is fill and object-position 50% 50%. Roots/images/span have zero vertical padding, border widths and margins. Slider vertical margins are 2px on both sides. The second image is clipped at 50% directly in Prime; Ultimate applies that clipping to the span. Full inset, overflow, box-model, font and other collected values are retained in the JSON, not reduced to these summaries.

## 8. Delta table

Delta means Ultimate minus Prime. Full rectangle deltas are in `deltas.json`.

| Measurement                     |       Prime | Ultimate |          Delta |
| ------------------------------- | ----------: | -------: | -------------: |
| Root y / top                    |          19 |       19 |              0 |
| First image y / top             |          16 |       16 |              0 |
| Second/right blue image y / top |          16 |       19 |         **+3** |
| Wrapper y / top                 | Not present |       19 | Not applicable |
| Slider y / top                  |          18 |       18 |              0 |
| Root → first image              |          −3 |       −3 |              0 |
| Root → second image             |          −3 |        0 |         **+3** |
| Root → slider                   |          −1 |       −1 |              0 |
| Root → wrapper                  | Not present |        0 | Not applicable |
| Wrapper → second image          | Not present |        0 | Not applicable |

Root, first-image and slider rectangles are exactly equal across sides. The second image differs only in y/top/bottom, each +3; its width, height and horizontal position match. The saved corrected screenshots show the same downward displacement of the blue band.

## 9. Containing-block and ancestry findings

Prime's two absolute images are direct children of the positioned inline root; both report that root as offsetParent, offsetTop −3, top 16. Ultimate's first image retains that same relationship and measured position. Its second image instead reports the absolute span as offsetParent, offsetTop 0, top 19. The span reports the Ultimate root as offsetParent, offsetTop 0, top 19, matching its authored `position: absolute; inset: 0`.

Thus the source positioning context and browser-used offsets agree: the span establishes the second image's containing block, replacing direct placement against the inline root. It does not shift the root, first image or slider. Both image rules leave their insets unspecified; their auto/static placement occurs in different formatting contexts (directly in the inline root versus inside the blockified absolute span).

The remaining recorded ancestors up to body are static and have no transform, filter, perspective, containment or will-change establishing an alternative positioning context. Corresponding outer containers both start at (16,16), width 1248, height 21. The roots each have one inline fragment at y19, height17. No text-node rectangles exist in the measured root/span child lists; Prime has comments, not extra rendered text. Identical detached font metrics report ascent14/descent3. That numerical descent is compatible with the inline relationship but is **not a measured line-box baseline or proof that font descent alone causes the offset**.

## 10. Hypothesis evaluation

| Hypothesis                                   | Result and limits                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — inline/static-position behavior**     | **Supported as part of the measured chain.** Direct absolute images with unspecified insets sit at root−3 on both sides; the nested image sits at wrapper+0. Source plus used insets/offsetParents establish different static-placement contexts. Exact line-box baseline construction is not directly measured; the descent3 coincidence alone is not used as causation. |
| **H2 — containing-block/wrapper difference** | **Established for this displacement.** The blue image changes containing block from inline root to absolute span. The span starts at root+0, its image starts at span+0, while Prime's image starts at root−3. These measured relationships account for the full +3 px, with equal root/image sizes and unchanged direct first-image placement.                           |
| **H3 — descendant formatting / box metrics** | **No independent cross-side font, image-size, vertical-align or spacing difference explains the shift.** Normal line-height, font metrics, image dimensions, object-fit/position, zero image spacing and slider metrics agree. The changed formatting context is the wrapper relationship in H1/H2, not an established separate font/style discrepancy.                   |
| **H4 — root box-model difference**           | **Does not explain the measured vertical displacement in this case.** Border-box versus content-box remains recorded, but both root rectangles and zero root padding/borders agree; image dimensions and direct-image positions also agree. There is no root box-edge/dimension delta contributing 3 px. This is case-specific, not a general box-model ruling.           |

## 11. Causal conclusion

**Cause established for the observed displacement.** Prime's second/right blue image is directly auto-positioned at y16 against an inline root at y19. Ultimate introduces an absolute span pinned at that root's y19; the same blue image is auto-positioned at the span's y19. Consequently `(19 + 0) − (19 − 3) = 3 px`. The actual offsetParent chain, used image insets, equal dimensions, unchanged direct first-image geometry and source declarations explain the saved blue-region displacement together; this conclusion is not based merely on the presence of a CSS rule.

This establishes the responsible layout relationship, not an intentional-design rationale, a tested counterfactual or a safe remediation. E1-V2 remains **B / OPEN**, not C or Match.

## 12. Remaining uncertainty

The diagnostic does not expose a direct browser line-box baseline API or independently isolate every detail of Chromium's inline static-position calculation. It does not establish that a particular font metric alone is responsible, behavior in other cases/environments, or the consequences of any possible change. Native-thumb rectangle geometry remains unavailable. No candidate fix or modified-layout experiment was performed or is inferred necessary to this measured containing-block conclusion.

## 13. Remediation implications

The evidence is sufficient to support a separate human decision about this now-explained adaptation. **No remediation is selected, recommended, tested or authorized here.** Establishing the cause neither expands the approved E-1 declarations nor authorizes changing the wrapper, template, runtime, mapping, assertions or classification.

## 14. Stop condition and next gate

The single authorized corrected diagnostic completed, both observations were persisted, the existing environment guard passed, and the measured chain explains the 3 px displacement. **The one-pass authorization is exhausted; stop.** No further browser pass or verification suite ran. Any further investigation, remediation, classification/disposition change or Task 6 progression requires a separate explicit human ruling through the applicable gate.

## 15. Files and exact final state

Only this new research document and files under the new ignored `e1-v2-stage2-corrected/` evidence directory were created. No existing repository file was changed. The new directory contains:

- Copied original provenance/input: `src.tar`, `src-sha256.txt`, `input-sha256.json`, `commit.txt`, `git-status.txt`, `docker-image.json`.
- Diagnostic: corrected `diagnostic.spec.ts`, unchanged copies `diagnostic.config.ts`, `run.sh`, plus `hook-correction.diff` and `hook-provenance.json`.
- Current worktree provenance: `current-git-status.txt`, `pre-rerun-worktree-sha256.json`, `worktree-integrity.json`.
- Execution: `node-version.txt`, `architecture.txt`, `install.log`, `build.log`, `diagnostic.log`, `run-results.json`, `playwright-results/.last-run.json`.
- Corrected-attempt observations: `prime.json`, `ultimate.json`, `measurements.json`, `prime.png`, `ultimate.png`, calculated `deltas.json`, `diagnostic-summary.json`, and `files-sha256.json` (evidence hashes excluding itself).

Raw measurements and all computed values are in the side JSONs and `measurements.json`; original failure measurements are not fabricated or overwritten. Existing-file hashes were compared against the pre-rerun manifest; results are in `worktree-integrity.json`. Product, presets, mappings, tests/assertions, permanent tooling, Stage 1, original Stage 2, primary E-1 record and Spec/Plan/ADR files remain unchanged.

- E1-B1: **BLOCKED / B1-0 Preserve and Defer**, untouched, both failing assertions preserved without rerun.
- E1-B2: **CLOSED / VERIFIED**, unchanged.
- E1-V1: **Class A / out of scope**, unchanged.
- E1-V2: **Class B / OPEN**, unchanged despite established cause.
- Task 6: **STOPPED / not complete**.

No remediation, baseline acceptance, parity/status/classification promotion, GAP creation, Spec/Plan/ADR amendment, commit, merge or push occurred. No product or permanent tooling code changed. The only code change is the explicitly authorized guard in the retained diagnostic-only hook copy.
