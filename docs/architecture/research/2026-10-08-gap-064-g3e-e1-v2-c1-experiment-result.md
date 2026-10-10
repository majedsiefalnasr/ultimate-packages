# G3-E E-1 — E1-V2 C1 experiment result

**Date:** 2026-10-08  
**Result:** Authorized bounded experiment succeeded for the five sampled cases. Evidence only; no implementation or gate approval follows.

## 1. Authorization and exact execution

The human explicitly authorized the single experiment in the [C1 authorization packet](2026-10-08-gap-064-g3e-e1-v2-c1-experiment-authorization.md). One candidate mutation, one campaign, five cases, one worker, retries 0; no second campaign, alternative value, repeated interaction or driver correction occurred.

Evidence directory: `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-c1-experiment/`. Before execution, `execution-packet.md` recorded the exact invocation and destination, `driver.diff` recorded changes from the corrected Stage 2 driver, and `prepared-sha256.json` recorded the runnable artifact hashes. `diagnostic.config.ts` and `run.sh` were byte-identical retained Stage 2 copies. The extended driver ran solely in the disposable container; its retained evidence copy is not permanent tooling.

Exact command:

```sh
docker run --name ultimate-e1-v2-c1-experiment --rm --platform linux/arm64 -v /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-c1-experiment:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh
```

Only the authorized inline overrides were applied together to Ultimate's existing `.u-image-compare > span`:

```css
top: auto;
bottom: auto;
height: 100%;
```

Each case used one Prime observation and one Ultimate page with unchanged/mutated observations. Existing actions occurred before mutation and were not repeated afterward. Existing readiness/settling/capture helpers were reused. No other CSS, image, DOM hierarchy, template, runtime, API or generator data was changed.

## 2. Environment and provenance

- Input branch/HEAD: `feature/gap-064-g3e-media-data` / `7c49568b50ed1017e17334152a48fb231e7ec307`; actual product input was the retained dirty Stage 2 archive, not HEAD alone.
- Archive SHA-256: `60bc65d477ffcae50c653c4d738e2f086a8fcb61e3351eab5811c600e2ec90a4`.
- Docker: `mcr.microsoft.com/playwright:v1.63.0-jammy`, verified image ID `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`, Linux arm64.
- Node v24.20.0; Playwright 1.63.0; Chromium 153.0.8010.12; project `prime-parity-chromium`.
- Pinned PrimeNG 21.1.9 / PrimeUIX 2.0.3 inputs; viewport 1280×720, DPR 1; original fixtures and accepted fixture typography, no Inter integration.
- Runner start: `2026-10-08T18:55:17.401Z`; duration 29.335 seconds; one test passed, zero unexpected/skipped/flaky, retries 0. The single test contains all five cases. Dependency installation/build were the unchanged retained runner's disposable preparation, not additional verification suites.

Original archive provenance and current worktree provenance are retained separately. `worktree-before.json` and `worktree-integrity.json` show no repository-file change during preparation/execution and evidence review, before creation of this result document.

## 3. Canonical root-style result

All positions below are CSS pixels. Prime values were observed again in this campaign, not inferred from the historical record.

| Element | Prime top/y | Ultimate before | Ultimate after | After−before |
| --- | ---: | ---: | ---: | ---: |
| Root | 19 | 19 | 19 | 0 |
| First image | 16 | 16 | 16 | 0 |
| Second/right blue image | 16 | 19 | 16 | −3 |
| Retained span | Absent | 19 | 16 | −3 |
| Slider | 18 | 18 | 18 | 0 |

The span remains absolute, with width 1257.5 and height 17 before and after. Second-image dimensions and horizontal placement remain unchanged. Ultimate root→span changes from 0 to −3; span→image remains 0. The clip-bearing span and image therefore move together to Prime's direct-image origin, rather than compensating the image independently. Root/first-image/slider full rectangles remain unchanged.

The mutated clip polygon occupies x16..644.75, y16..33, matching Prime's second-image clipping polygon. Root bounds remain y19..36; the retained root cropping relationship and the saved pixels match Prime. A matching image top alone was not used as the success criterion.

## 4. Regression observations and saved images

| Case | Prime / Ultimate after: root, first, second, slider y | Span width×height before/after | Observed mutation effect |
| --- | --- | --- | --- |
| `imagecompare/default` (Sized) | 16, 16, 16, 18 | 320×180 / 320×180 | No geometry or screenshot change |
| `imagecompare/slide` | 16, 16, 16, 18 | 320×180 / 320×180 | Existing 25% clip and slider value retained |
| `imagecompare/focus` | 16, 14, 14, 16 | 320×180 / 320×180 | Existing focus identity/state and screenshot retained |
| `imagecompare/rtl` | 16, 16, 16, 18 | 320×180 / 320×180 | Existing right-half clip and direction retained |

All four cases have zero before/after rectangle deltas for root, images, span and slider. Recorded clip polygon coordinates match Prime; initial 50%, slide 25% and RTL clipping remain correct in these observations. The focus row reports its actual captured state, not the canonical root-style coordinates.

Saved Prime/mutated screenshot pairs were visually inspected for all five cases. Their PNG SHA-256 hashes are identical per pair. For all four regression cases, Ultimate before/after PNG hashes also match exactly. Only root-style changes from its Ultimate before capture. Hashes and equality results are retained in `saved-image-comparison.json`; no baseline is accepted and no new pixel-diff threshold is introduced. No additional browser observation was used for image review.

## 5. Cleanup and retained artifacts

Every page restores its exact original span inline-style attribute in `finally`. Four originals/restorations are absent (`null`); Slide restores its original 25% clip-path attribute byte-for-byte. Each case's `cleanup.json` records exact equality. Pages were closed; the Docker `--rm` container was disposed. A post-run Docker container query returned no matching container.

Retained artifacts include:

- Archive, original/current commit/worktree provenance, Docker identity, starting hashes and integrity result.
- Exact driver/config/runner copies, driver diff, invocation/destination record and prepared hashes.
- Installation/build/diagnostic logs, runtime versions, `run-results.json` and Playwright result metadata.
- `campaign.json`; per-case `prime.json`, `ultimate.json`, `cleanup.json`, Prime-before/Ultimate-before/Ultimate-after screenshots; raw rectangles, computed styles, ancestry, offsets, clip polygons, focus identity, slider state and deltas.
- Saved-image hash comparisons and final evidence hashes. No prior evidence was overwritten.

## 6. Interpretation, limits and final gate

This experiment supports the exact C1 mutation as a candidate production delta for a subsequent human P2 decision: it removes the canonical displacement while preserving measured sizing/clipping and the four existing sampled states. It does not prove arbitrary interaction sequences, other viewports/fonts/browsers, accessibility, selector reach, unit/build fidelity or a safe generated/provenance implementation. No permanent verification suite was invoked; preparation builds are not remediation acceptance evidence.

The experimental overrides do not authorize a production hand edit. A later P2 packet still must specify exact generator/style/provenance representation, affected files and preservation argument. P3 and implementation require separate approval. No C2/C3 fallback is authorized.

**Stop: the single campaign budget is exhausted successfully.** P1 remains C1 approved; P2 is not approved and its historical blocked record is unchanged; P3 remains unapproved; implementation remains unauthorized. E1-V2 remains **B / OPEN** and Task 6 **STOPPED / not complete**. E1-B1/B2/V1 and GAP-102/103/104/105 remain unchanged. No baseline/status/classification promotion, Spec/Plan amendment, GAP/ADR action, commit, merge or push occurred.
