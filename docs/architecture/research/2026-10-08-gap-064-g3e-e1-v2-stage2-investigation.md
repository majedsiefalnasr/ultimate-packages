# G3-E E-1 — E1-V2 Stage 2 diagnostic browser investigation

**Date:** 2026-10-08  
**Result:** Single authorized pass attempted; diagnostic hook failed before measurements were persisted.  
**Conclusion:** **Cause NOT established; evidence insufficient.**

## 1. Authorization

The user authorized exactly one diagnostic browser pass for Angular `imagecompare/root-style`, using the existing pinned E-1 Docker/Chromium environment and readiness behavior. Read-only, case-specific harness instrumentation was permitted. Remediation, classification/status change, baseline acceptance, Spec/Plan/ADR changes, GAP creation and another iteration were prohibited.

This document supplements the unchanged [Stage 1 investigation](2026-10-08-gap-064-g3e-e1-v2-stage1-investigation.md) and [existing E-1 record](2026-10-08-gap-064-g3e-e1-record.md). Neither is edited.

## 2. Scope

The diagnostic selected one test, one worker and retries 0. Its intended sequence was one PrimeNG observation followed by one Ultimate observation of the same case. The **PrimeNG observation failed inside the measurement hook**; Ultimate was not subsequently observed. There was no retry, second pass, alternate case, browser, framework, viewport, theme, fixture or fix experiment.

## 3. Environment/provenance

| Item                       | Retained provenance                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch / HEAD              | `feature/gap-064-g3e-media-data` / `7c49568b50ed1017e17334152a48fb231e7ec307`                                                                                                                                                   |
| Working input              | Current worktree, including earlier approved E-1 edits; exact starting status in `git-status.txt` and file hashes in `input-sha256.json`                                                                                        |
| Input archive SHA-256      | `60bc65d477ffcae50c653c4d738e2f086a8fcb61e3351eab5811c600e2ec90a4`                                                                                                                                                              |
| Docker image               | `mcr.microsoft.com/playwright:v1.63.0-jammy`                                                                                                                                                                                    |
| Image ID/digest            | `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`                                                                                                                                                       |
| Platform / Node            | Linux arm64 (`aarch64`) / Node v24.20.0                                                                                                                                                                                         |
| Playwright / browser       | Playwright 1.63.0; bundled Chromium via existing `prime-parity-chromium` project                                                                                                                                                |
| Browser version limitation | `browser.version()` was read into memory but the hook failed before the output bundle was written. The exact runtime Chromium version string is **not retained**; no version is inferred or additional browser launch performed |
| Viewport / readiness       | Existing `load()` uses 1280×720; existing font readiness, settling, pointer parking, empty case actions and image-loaded helper retained                                                                                        |
| Run result                 | 1 failed diagnostic, 0 skipped, 0 flaky, retries 0; start `2026-10-08T14:29:22.478Z`, total runner duration approximately 18.77 seconds                                                                                         |

Evidence directory: `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-stage2/`.

Created evidence files: `src.tar`, `src-sha256.txt`, `input-sha256.json`, `git-status.txt`, `commit.txt`, `docker-image.json`, `node-version.txt`, `architecture.txt`, `install.log`, `build.log`, `diagnostic.config.ts`, `diagnostic.spec.ts`, `run.sh`, `diagnostic.log`, `run-results.json`, `diagnostic-summary.json`, `playwright-results/.last-run.json`, and `playwright-results/e1-v2-stage2-diagnostic-E1-96c85-mpare-root-style-diagnostic-prime-parity-chromium/error-context.md`.

Install/build completed as existing Docker preparation, not as a new unit or visual-regression suite. No unit, reach, accessibility or baseline checks were run.

## 4. Exact case measured

**Attempted:** Angular `imagecompare/root-style`.

- PrimeNG reference: `http://localhost:6022/#/g3e/imagecompare/root-style`.
- Intended Ultimate target: `http://localhost:6001/iframe.html?id=ng-imagecompare--default&viewMode=story`; this target was **not reached** after the Prime-side failure.
- Existing case: root `width: 20rem`, the original two images, no actions, root-only original probe and container capture. Source/case definitions were not edited.

## 5. Elements/selectors and measurement hook

| Element                                 | PrimeNG selector                      | Intended Ultimate selector      |
| --------------------------------------- | ------------------------------------- | ------------------------------- |
| Root                                    | `.p-imagecompare`                     | `.u-image-compare`              |
| First image, original part-map `left`   | `.p-imagecompare > img:first-of-type` | `.u-image-compare > img`        |
| Second image, original part-map `right` | `.p-imagecompare img + img`           | `.u-image-compare > span > img` |
| Right-image wrapper                     | None                                  | `.u-image-compare > span`       |
| Slider                                  | `.p-imagecompare-slider`              | `.u-image-compare-slider`       |

**Identity clarification:** The blue image visible in the left portion of the initial comparison is the **second/right image** (`landscape-2.png`), clipped into that region; the first/left image is `landscape-1.png`. “Left/blue” in the earlier raster descriptions denotes the visible region, not the original part-map `left` element. The Stage 1 statement contrasting a left/blue displacement with the right wrapper must therefore not be treated as evidence excluding a direct wrapper relationship. This clarifies source identity only; it does not establish a layout cause or rewrite Stage 1 history.

The hook reused existing `load`, `environment`, `run`, `settled`, `probe`, `imagesLoaded` and `capture` helpers. It attempted rectangles, fragment rectangles, relevant computed styles, offset-parent ancestry, relative offsets, existing text-node ranges and detached-canvas font metrics. It added no page element, style or interaction. A native thumb is a pseudo-element without a DOM `getBoundingClientRect()`; the hook was designed to retain its computed-style query and explicitly mark its rectangle unavailable rather than invent a box.

`diagnostic.config.ts` derives from the existing parity configuration, selects only the diagnostic file, redirects output to the evidence mount, and includes only the two Angular servers. The driver/config were copied into the disposable container's `/work`, not into repository tooling. The read-only hook and configuration remain in the ignored evidence directory for audit; existing tooling/configuration is unchanged.

## 6. PrimeNG measurements

**No usable numeric/computed-style bundle was persisted.** The page loaded and the hook reached its internal collection, but its text-range traversal failed before `page.evaluate()` returned. Earlier values held in that evaluation or the test process are not recoverable from the retained output and are not reported as measured facts.

The hook I wrote incorrectly sent every non-text child node through an element identity function using `tagName.toLowerCase()`. A non-element node has no `tagName`; Angular comment nodes are consistent with this failure. The exact node type was not separately retained. This is a **diagnostic-hook defect**, not evidence of a product/layout defect or a new synchronization convention.

Retained error:

```text
page.evaluate: TypeError: Cannot read properties of undefined (reading 'toLowerCase')
at identity
at textRects
```

The existing cross-side environment equality guard was placed after both observations and was **not reached**. No claim of a successful fresh environment comparison is made.

## 7. Ultimate measurements

**Not collected.** The loop stopped on the Prime-side exception before opening the Ultimate target. No Ultimate raw rectangles, computed styles, ancestry, offsets or screenshots were saved by this pass.

## 8. Delta table

| Required comparison                 | PrimeNG                 | Ultimate     | New delta   |
| ----------------------------------- | ----------------------- | ------------ | ----------- |
| Root y/top                          | Not persisted           | Not observed | Unavailable |
| First/left image y/top              | Not persisted           | Not observed | Unavailable |
| Second/right blue image y/top       | Not persisted           | Not observed | Unavailable |
| Wrapper y/top                       | Not applicable to Prime | Not observed | Unavailable |
| Slider y/top                        | Not persisted           | Not observed | Unavailable |
| Root → first image                  | Not persisted           | Not observed | Unavailable |
| Root → second image                 | Not persisted           | Not observed | Unavailable |
| Wrapper → second image              | Not applicable to Prime | Not observed | Unavailable |
| Internal computed formatting values | Not persisted           | Not observed | Unavailable |

The approximately 3 px saved-raster offset remains **prior evidence**, not a delta newly established by this pass. `prime.json`, `ultimate.json`, `measurements.json`, `prime.png` and `ultimate.png` were not produced. Missing measurements are not interpreted as zero or equality.

## 9. Containing-block/ancestry findings

No new browser-used containing-block, baseline, line-box or ancestry values survived the failed evaluation. Existing source still establishes the extra Ultimate right-image span and positioning declarations. The corrected image identity makes a direct wrapper relationship possible, but does not quantify or prove one. No browser causal relationship can be inferred from the hook's failure.

## 10. Hypothesis evaluation

| Hypothesis                                   | Result after this pass                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — inline/static-position behavior**     | Unresolved. No retained used positions, text-range/line-box metrics or relative offsets establish its contribution                 |
| **H2 — containing-block/wrapper difference** | Unresolved. The span exists in source and contains the blue image, but no retained browser geometry proves a resulting 3 px offset |
| **H3 — descendant formatting/box metrics**   | Unresolved. Requested computed values and image dimensions were not persisted; no quantitative contribution established            |
| **H4 — root box-model difference**           | Unresolved. The prior explanatory box-sizing difference remains evidence, but this pass supplies no quantitative causal link       |

None is selected, eliminated by the failed measurement, or promoted to causation.

## 11. Causal conclusion

**Cause NOT established; evidence insufficient.** This diagnostic failed to deliver the new internal evidence required to distinguish the hypotheses. E1-V2 remains **unresolved Class B / OPEN**, not C or Match.

## 12. What remains uncertain

All requested cross-side internal geometry and its causal interpretation remain unestablished. The runtime browser version string also was not retained. A successful hook would require a changed diagnostic variant and another pass; both are outside this authorization. No correction or second run was attempted.

## 13. Would remediation be justified?

The previously reviewed visible difference remains real evidence of an unresolved adaptation. **This failed diagnostic does not justify choosing a remediation**: it establishes no responsible layout mechanism or safe change. No product, CSS, wrapper, runtime or assertion fix is inferred or recommended.

## 14. Required next decision gate

Stop condition reached: **the requested internal geometry could not be collected reliably within the single authorized pass; another pass would be needed**. Any correction of the measurement hook and another diagnostic run require a new explicit ruling. The retained hook is not revised after failure. No remediation would be authorized merely by permission for another diagnostic.

## 15. Exact final state and file changes

The only new research document is this file; all other newly created files are listed in §3 under the ignored diagnostic evidence directory. Existing repository files match the starting input hashes. The existing E-1 record, Stage 1 document, decision proposal, product files, tests, presets, mappings and permanent verification tooling are unchanged. Temporary harness-only diagnostic code was created as explicitly permitted and preserved with its failure evidence.

- E1-B1: **BLOCKED / B1-0 Preserve and Defer**, untouched.
- E1-B2: **CLOSED / VERIFIED**, no reach changes.
- E1-V1: **Class A / out of scope**, unchanged.
- E1-V2: **unresolved Class B / OPEN**, unchanged.
- Task 6: **STOPPED / not complete**.

Exactly one diagnostic attempt ran, with no retries or second iteration. No remediation, baseline acceptance, parity/status/classification change, Spec/Plan/ADR amendment, GAP creation, commit, merge or push occurred.
