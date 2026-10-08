# Prime-parity pilot report — Drawer, Message, Tag

**Date:** 2026-10-08
**Branch / commit measured:** `feature/prime-parity-pilot` at `f3f57a5` (harness commit on top of the Playbook branch `6e38021`). No Ultimate package source differs from `main` `4c099a9`.
**Status:** pilot record, **accepted** (user rulings 2026-10-08, §10). §1–§9 are the report as presented; §10 records the rulings and what was applied. No component CSS, runtime, story, baseline or CI change.

---

## 1. Setup

| Item             | Value                                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular oracle   | PrimeNG **21.1.9**, `@primeuix/themes` 2.0.3 (Aura), `@primeuix/styles` 2.0.3, `@primeuix/styled` 0.7.4, `@primeuix/utils` 0.7.2 and 0.6.4, `@primeuix/motion` 0.0.10                                     |
| Vue oracle       | PrimeVue **4.5.5**, `@primevue/core`/`icons` 4.5.5, `@primeuix/themes` 2.0.3 (Aura), `@primeuix/styles` 2.0.3, `@primeuix/styled` 0.7.4, `@primeuix/utils` 0.6.4                                          |
| Version check    | Resolved from the installed reference apps on every run and asserted against ADR-048 (exact `primeng`/`primevue`; `@primeuix/*` at or below the MIT ceilings). Passed.                                    |
| Ultimate         | Ultimate Storybooks (ng :6001, vue :6003), existing stories only                                                                                                                                          |
| Environment      | Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, arm64, Node 24.20.0, Chromium, 1280 × 720, `--retries=0`                                                                                             |
| Runs             | Two full runs from one install/build: 46/46 tests pass each time, 151 s and 148 s. **Run 1 and run 2 reports are identical** (0 of 45 rows differ, timings excluded). A macOS run gave the same findings. |
| Harness          | `tooling/prime-reference/` (README there). Report mode: a parity difference is recorded, never a test failure.                                                                                            |
| Evidence (local) | `.superpowers/sdd/2026-10-08-prime-parity-pilot/docker-run2/` (git-ignored): logs, `prime-parity-run{1,2}/report.json`, `summary.md`, 42 images per run (review images and Prime-only D captures)         |

Each case is compared **PrimeNG ↔ Ultimate Angular** and **PrimeVue ↔ Ultimate Vue**, plus a diagnostic **PrimeNG ↔ PrimeVue** comparison (§5). Each comparison loads both sides a second time to measure noise.

## 2. Canonical cases executed

| Component   | Compared (× ng, × vue)                                                                   | Behavior                                                    | Recorded without comparison                                                      |
| ----------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Drawer (A)  | left, right, top, bottom, full, left under RTL (6)                                       | closed footprint, mask, focus on open, Escape, close button | template/footer: coverage gap (no Angular story; Vue `WithFooter` is reach-only) |
| Message (B) | default, severities strip, closable, closable with focus-visible on the close button (4) | —                                                           | outlined, simple, sizes: **D**; icon: coverage gap                               |
| Tag (C)     | default, severities strip (2)                                                            | —                                                           | pill, icon: coverage gap (supported props, no story)                             |

12 visual cases × 2 frameworks = 24 comparisons, 12 PrimeNG-vs-PrimeVue diagnostics, 2 behavior runs, 7 recorded cases. All within the tier caps.

## 3. Results and classification

"Material" follows Playbook §8.1. Geometry is in CSS px (Prime → Ultimate).

### 3.1 Tag — negative control

| Case       | ng                                            | vue              |
| ---------- | --------------------------------------------- | ---------------- |
| default    | **Match** — 0 probe diffs, 0 differing pixels | **Match** — same |
| severities | **Match** — 0 probe diffs, 0 differing pixels | **Match** — same |

A genuine match: the review images are pixel-identical. The only probe difference is the explanatory `box-sizing` (§6.1).

### 3.2 Message

| #   | Case(s)                       | fw      | Result                                                                                                                                                    | Class                                                                                                                                                                        |
| --- | ----------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | default, severities           | ng      | **Match** (0 probe diffs, 0 differing pixels)                                                                                                             | —                                                                                                                                                                            |
| M1  | default, severities, closable | vue     | Text starts at x = 54 instead of 28: Ultimate Vue renders a default severity icon slot (`pi pi-*`, 18 px plus gap) that PrimeVue does not render          | **A** (new). The Ultimate source comment says PrimeVue "auto-selects a default icon per severity"; the pinned PrimeVue 4.5.5 source renders an icon only when `icon` is set. |
| M2  | closable, closable-focus      | ng, vue | Probe matches (button box, focus outline), but the review image shows Prime's `TimesIcon` SVG versus Ultimate's text glyph `×` (0.12 % / 2.3 % of pixels) | **A** (new, minor). Found by the image, not the probe (§6.3).                                                                                                                |
| M3  | closable-focus (outline)      | ng, vue | Focus ring identical                                                                                                                                      | —                                                                                                                                                                            |
| M4  | outlined, simple, sizes       | —       | Ultimate Message has no `variant`/`size`; G3-A omitted these groups (D-G3-3). Prime renders captured for the record only                                  | **D** — no implementation                                                                                                                                                    |
| M5  | icon                          | —       | `icon` supported, no story                                                                                                                                | coverage gap                                                                                                                                                                 |

### 3.3 Drawer — positive control

| #   | Finding                                                                                                                                                                                                                                                                     | fw      | Class                                                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Sizing, all positions.** Drawer 320 × 720 → 324 × 726 (left/right/RTL), 160 → 164 tall (top/bottom); content 316 → 360 wide (left), 1274 → 1314 (top); RTL content at x = −39; **full 720 → 722 tall**. Explanatory: `box-sizing` border-box → content-box on every part. | ng, vue | **A**, existing: **GAP-097** (effect) / **GAP-098** (cause). Reproduced, not fixed.                                                                     |
| D2  | **No backdrop.** Mask `rgba(0,0,0,0.4)` → transparent (≈ 75 % of viewport pixels differ)                                                                                                                                                                                    | ng, vue | **C**, existing ruling: G3-D D-D4 = B / PX-D2 ("no Drawer backdrop or modal semantics"). Largest visible difference; the ruling stands until revisited. |
| D3  | **Close button, Angular.** No icon rendered; button 40 × 40 round → 26 × 18. `UButton` has no `<ng-content>`, so the projected `<u-times-icon>` is discarded. Header 80 → 67 tall follows.                                                                                  | ng      | **A** (new)                                                                                                                                             |
| D4  | **Close button, Vue.** Plain native `<button>` (grey background, 2 px black border, square, 13.3 px font) instead of Prime's rounded text button; 30 × 23. Header 80 → 67 follows.                                                                                          | vue     | **A** (new)                                                                                                                                             |
| D5  | **Full drawer border, Angular.** PrimeNG renders a 3 px border on the full drawer (content offset 3 px); Ultimate 1 px. PrimeNG ships its own `drawerstyle.ts` layer ("For PrimeNG") on top of `@primeuix/styles`; Ultimate Angular ports only the shared layer.            | ng      | **A** (new, minor)                                                                                                                                      |
| D6  | **Focus on open, Vue.** PrimeVue moves focus to the drawer; Ultimate Vue leaves it on the trigger                                                                                                                                                                           | vue     | **A** (new, behavior / accessibility)                                                                                                                   |
| D7  | Closed footprint (no layout space), mask present when open                                                                                                                                                                                                                  | ng, vue | Match                                                                                                                                                   |
| D8  | Escape / close button, Angular: with the stories' one-way `[visible]` binding, neither PrimeNG nor Ultimate closes (match). Canonical two-way `[(visible)]` use is not exercisable through the Angular stories.                                                             | ng      | Match; **coverage gap** for two-way use                                                                                                                 |
| D9  | Escape / close button, Vue: both close                                                                                                                                                                                                                                      | vue     | Match                                                                                                                                                   |

## 4. Probe and geometry

The full per-part tables are in `report.json`. Summary per comparison (Docker run 1):

| Case                   | ng: material / explanatory / pixel ratio | vue: material / explanatory / pixel ratio |
| ---------------------- | ---------------------------------------- | ----------------------------------------- |
| drawer/left            | 13 / 3 / 0.754                           | 23 / 3 / 0.754                            |
| drawer/right           | 16 / 3 / 0.755                           | 26 / 3 / 0.755                            |
| drawer/top             | 11 / 3 / 0.781                           | 21 / 3 / 0.781                            |
| drawer/bottom          | 13 / 3 / 0.782                           | 23 / 3 / 0.782                            |
| drawer/full            | 19 / 3 / 0.012                           | 20 / 3 / 0.003                            |
| drawer/rtl             | 13 / 3 / 0.755                           | 23 / 3 / 0.756                            |
| message/default        | 0 / 3 / 0.000                            | 1 / 3 / 0.035                             |
| message/severities     | 0 / 3 / 0.000                            | 1 / 3 / 0.011                             |
| message/closable       | 0 / 3 / 0.001                            | 1 / 3 / 0.023                             |
| message/closable-focus | 0 / 1 / 0.001                            | 0 / 1 / 0.023                             |
| tag/default            | 0 / 2 / 0.000                            | 0 / 2 / 0.000                             |
| tag/severities         | 0 / 2 / 0.000                            | 0 / 2 / 0.000                             |

Drawer pixel ratios are dominated by D2 (the backdrop); the probe separates it from D1, D3 and D4.

## 5. PrimeNG vs PrimeVue — can PrimeVue stand in for Angular?

| Case                                                  | Probe                                                                                | Pixels    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ | --------- |
| tag/default, tag/severities                           | identical                                                                            | identical |
| message/default, severities, closable, closable-focus | identical                                                                            | identical |
| drawer/left, right, top, bottom, rtl                  | identical except close button `display: inline-flex` vs `flex` (button-host wrapper) | ≤ 0.06 %  |
| **drawer/full**                                       | **differs**: border 3 px vs 1 px, content offset 2 px, 14 values                     | 1.0 %     |

**Answer: per case only, and not by default.** For the purely shared-styling cases here (Tag, Message) the two Prime renders were identical, recorded as per-case observations. Drawer `full` shows that the shared `@primeuix/styles` version does not guarantee identical output: PrimeNG adds its own CSS layer. PrimeNG stays the Angular oracle (Playbook §1); this pilot gives no basis for any framework-wide substitution.

## 6. Noise, false positives, false negatives

1. **Noise: none measured.** Every comparison re-loaded both sides: 0 probe differences and 0 differing pixels in all 24 comparisons, in both Docker runs. Run 1 and run 2 are identical.
2. **Environment probe:** equal on every comparison (fonts, sizes, colours, body margin/padding/box-sizing, container position, viewport, DPR). It deliberately excludes values that Prime or Ultimate stylesheets set (so GAP-098 is not mistaken for environment).
3. **False positive found and handled — `box-sizing`.** GAP-098 makes `box-sizing` differ on every probed part, including cases that are pixel-identical (Tag). It is user-invisible by itself; its effect is already measured by geometry. The harness reports it in a separate "explanatory" column, outside the verdict. §8.1 of the Playbook does not list `box-sizing` as material, but §6.3 lists it among probed values: **wording to confirm** (decision R-2).
4. **Residual false positive — `display`.** PrimeNG vs PrimeVue close buttons differ in `display` (`inline-flex` vs `flex`) with identical geometry and pixels. Kept material for now (it can matter in other cases); seen only in the diagnostic comparison.
5. **False negative — icon glyph.** Message M2 matched the probe (the glyph is inside the probed button) but differs visibly. The review image and a non-zero pixel ratio exposed it. Conclusion: **a probe "match" with a pixel ratio above 0 still needs a look at the review image** (decision R-3).
6. **Harness defects found and fixed during the pilot** (none changed a verdict rule): a focus case pointed at a non-existent Prime route (now an explicit `prime` route field and a root-present guard); the close-button part needs framework-specific selectors (button host vs inner button); the PrimeNG reference must mirror the story's binding (one-way); macOS `tar` adds AppleDouble files that break Playwright in Docker (`COPYFILE_DISABLE=1`).

## 7. Effort

| Item                           | Size                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared harness (one-time)      | ≈ 720 lines (runner 368, probe/compare/review image 294, config 54) plus two app shells (≈ 60 lines)                                                                                 |
| Tag (C)                        | 39 lines of case definition + ≈ 8 template lines per framework                                                                                                                       |
| Message (B)                    | 81 lines + ≈ 20 template lines per framework                                                                                                                                         |
| Drawer (A)                     | 56 lines + ≈ 15 template lines per framework + the behavior script (≈ 80 lines, reusable for overlays)                                                                               |
| Runtime per visual comparison  | 1.5–2.3 s (Docker), doubled by the noise re-load                                                                                                                                     |
| Runtime per component (Docker) | Tag ≈ 16 s, Message ≈ 37 s, Drawer ≈ 60 s visual + ≈ 15 s behavior (including the noise re-loads and the PrimeNG-vs-PrimeVue diagnostic)                                             |
| Full pilot run                 | ≈ 150 s for 46 tests; plus ≈ 8 min one-time install/build in Docker                                                                                                                  |
| Review                         | One image per comparison; Tag and the matching Message cases need seconds, Drawer a few minutes                                                                                      |
| Authoring time                 | Not measured precisely. Most of the effort went into the shared harness and its four defects (§6.6); adding a component is now case definitions, two small templates and a part map. |

Projected for the 48 G3 keys at the approved caps (≈ 280 cases): about 10–15 runner minutes per full pass; the main cost is human review of the differences, which is the intended cost.

## 8. Exit criteria (Playbook §12 / user rulings §5)

| #   | Criterion                                              | Result                       | Evidence                                                                    |
| --- | ------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------- |
| 1   | Environment probe stable and meaningful                | **Pass**                     | Equal on all 24 comparisons, both runs; excludes stylesheet-owned values    |
| 2   | Drawer reproduces the known sizing difference          | **Pass**                     | D1: full 720 → 722; 324 × 726; content overflow; GAP-097/098 stay visible   |
| 3   | At least one Tag case is a genuine Match               | **Pass**                     | 4/4 Tag comparisons: 0 material diffs, 0 differing pixels                   |
| 4   | Message D cases classified without implementation      | **Pass**                     | M4: outlined/simple/sizes recorded D; nothing built                         |
| 5   | Output useful for human review                         | **Pass**                     | Prime \| Ultimate \| diff images; caught M2, which the probe missed         |
| 6   | No excessive false positives from noise                | **Pass with one adjustment** | 0 noise; `box-sizing` moved to explanatory (R-2); `display` residual (§6.4) |
| 7   | Angular path validated against PrimeNG                 | **Pass**                     | PrimeNG app renders all cases; Drawer `full` shows PrimeNG ≠ PrimeVue       |
| 8   | Effort measured                                        | **Pass**                     | §7                                                                          |
| 9   | Method small enough to use on the remaining components | **Pass**                     | Per-component cost is case data; ≈ 1 min runtime per component              |

**Recommendation: the method passes.** It found the two known gaps, one prior ruling (D2), and six new real differences (M1, M2, D3, D4, D5, D6) that source-port review and Ultimate-only screenshots did not surface.

## 9. Decisions requested

- **R-1 — Accept the pilot** and the method as practical (the condition for authorizing G3-E).
- **R-2 — `box-sizing` as explanatory**, not material (Playbook §6.3 wording; its effect is measured by geometry).
- **R-3 — Image review rule:** a probe "match" with a pixel ratio above 0 is reviewed on its image before it counts as a Match.
- **R-4 — New GAPs** (proposed, not registered):
  - **GAP-099 Drawer close button and full border:** D3 (Angular close icon not rendered: `UButton` has no content projection), D4 (Vue native unstyled close button), D5 (PrimeNG-only full-drawer border).
  - **GAP-100 Drawer Vue focus on open:** D6.
  - **GAP-101 Message icon rendering:** M1 (Vue default severity icon slot) and M2 (close glyph `×` instead of `TimesIcon`, both frameworks).
  - Alternatively, one GAP per component (Drawer, Message).
- **R-5 — D2 (no Drawer backdrop):** keep as C under D-D4/PX-D2, or reopen it as a separate decision.
- **R-6 — Status rows** after the decisions above:

  | Key     | ng                                                             | vue                              |
  | ------- | -------------------------------------------------------------- | -------------------------------- |
  | tag     | `partial` (2 of 3 canonical cases match; pill not exercisable) | same                             |
  | message | `open-gap` (M2)                                                | `open-gap` (M1, M2)              |
  | drawer  | `open-gap` (GAP-097/098, D3, D5)                               | `open-gap` (GAP-097/098, D4, D6) |

  Tag reaches `verified` only if a pill story is added under authorized work, or the pill case is dropped from its matrix by ruling.

- **R-7 — Coverage gaps** (no stories for Tag pill/icon, Message icon, Drawer template, Angular two-way Drawer): record only, or authorize the missing stories as part of backfill.

Nothing in §9 is applied. GAP-097 and GAP-098 remain open and unchanged.

---

## 10. User rulings (2026-10-08) and what was applied

1. **R-1 — pilot accepted.** All nine exit criteria are satisfied. G3-E is authorized under the Playbook, with the framework-specific oracle model (PrimeNG for Angular, PrimeVue for Vue; PrimeVue stands in for Angular only on a specific shared-styling case with evidence of equivalence for that case, never as a blanket rule). G3-E is not implemented on the pilot branch; it starts once the integration state of the Playbook and pilot branches is established.
2. **R-2 — `box-sizing` is explanatory.** Measured and reported separately, used to explain geometry, never failing a case by itself; the geometry it causes stays material. GAP-098 stays open and separate and is not remediated by parity verification. _Applied:_ PARITY_PLAYBOOK.md §6.3 (the harness already did this).
3. **R-3 — a probe match does not override visible image differences.** Inspect the image, decide noise / below threshold / real / intentional, and classify before declaring a Match. Pixel diff stays advisory, not a numeric gate. _Applied:_ PARITY_PLAYBOOK.md §6.4; the runner now labels such cases "review image" instead of "match".
4. **R-4 — GAP-099, GAP-100, GAP-101 registered** as proposed in §9, with each distinct defect kept as its own numbered item, framework and cause (GAP-099: D3 Angular close icon, D4 Vue native close button, D5 Angular full border; GAP-100: D6 Vue focus; GAP-101: M1 Vue default icon slot, M2 close glyph). Not fixed here; each is a separate authorized remediation. _Applied:_ BLUEPRINT_GAPS.md; GAP-097 and GAP-098 gained the pilot's rendered evidence and GAP-098 the "no blind global import" ruling.
5. **R-5 — Drawer no-backdrop decision kept.** D2 is the existing intentional difference (G3-D D-D4 = B / PX-D2), class C; no new GAP.
6. **R-6 — status rows:** Tag `partial` (pill/icon cannot be verified without stories, which are not added for this purpose); Message `open-gap` (GAP-101; outlined/simple/sizes stay D); Drawer `open-gap` (GAP-097, GAP-098, GAP-099, GAP-100; no-backdrop documented separately). _Applied:_ PARITY_PLAYBOOK.md §11.
7. **R-7 — coverage gaps recorded only:** Tag icon, Tag pill/rounded, Message icon, Drawer template, Angular Drawer two-way `visible`. No story work; a future parity scope may authorize a story for a case it requires. _Applied:_ PARITY_PLAYBOOK.md §11–§12.
8. **PrimeNG-specific CSS.** PrimeNG adds framework-specific CSS beyond the shared `@primeuix/styles`; PrimeNG stays the Angular oracle, shared PrimeUIX versions are not sufficient to reproduce it, and a visual difference triggers a look at the framework-specific Prime source first. _Applied:_ PARITY_PLAYBOOK.md §1.
9. **Harness corrections** (§6.6, including the macOS `tar` AppleDouble issue) are accepted as harness corrections, not product remediation; no GAPs.
10. **Scope guard:** no Ultimate component change in this milestone; no new ADR, governance layer or CI gate; merge and push are separate decisions.
