# GAP-064 G3-C1 Visual and Accessibility Review Record (Plan Task 9, Steps 1–2)

**Status:** Decisions applied (user, 2026-10-06); 72 baselines accepted; 18 accessibility rows approved as Aura parity exceptions.

**Branch / HEAD under review:** `feature/gap-064-g3c-menus-navigation` @ `604d8bc` (regression run). The targeted G3-C1 "after" run is `d5e633a`; `604d8bc` only adds the Task 8 validator, evidence file and CI wiring on top of it, and changes no style module, story or e2e spec.

No baseline, snapshot or `ACCESSIBILITY_BASELINE.md` change has been made. This record states facts for the user's decision; it does not approve any screenshot or accessibility row.

## Artifact locations

- `SDD` = `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/` (git-ignored, persistent).
- `T` = `SDD/docker/after/test-results/` (Playwright output of the post-port G3-C1 run at `d5e633a`).
- `R` = `SDD/review/` (durable copy for this gate): the 72 first-attempt directories of the changed visual tests, 216 PNGs (expected, actual, diff) plus each test's `error-context.md`. Directory and file names are Playwright's own. Retry directories were not copied: every retry repeated the first attempt's pixel count exactly (section 2).
- Image path pattern, for every changed test in section 2 and each browser `<b>` in `chromium|firefox|webkit`:

  ```text
  <T or R>/g3c1-aura-styles-<Ng|Vue>-<Story>-G3-C1-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-C1-visual-1-expected.png
  <T or R>/g3c1-aura-styles-<Ng|Vue>-<Story>-G3-C1-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-C1-visual-1-actual.png
  <T or R>/g3c1-aura-styles-<Ng|Vue>-<Story>-G3-C1-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-C1-visual-1-diff.png
  ```

  `<Story>` is the hyphenated name of section 2 (for example `Steps-WithDisabledItem`). **One exception:** Playwright shortened the Vue Breadcrumb WithDisabledItem directory to `g3c1-aura-styles-Vue-Bread-31dc8-thDisabledItem-G3-C1-visual-vue-<b>/` (file names inside are unshortened). The `-retry1` / `-retry2` directories under `T` hold the retry attempts.

- Before-state: `SDD/docker/before/` and `SDD/docker/before/layout-evidence.txt` (run at `<beforeSha>`).
- Regression: `SDD/docker/regression.log`, `SDD/docker/regression-console.log`, `SDD/docker/regression-results.tar`, extracted to `SDD/docker/regression/`.

---

## 1. Environment

| Item                     | Value                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Image                    | `mcr.microsoft.com/playwright:v1.63.0-jammy`                                                          |
| Host                     | Docker 29.8.1, macOS arm64                                                                            |
| Architecture (container) | aarch64                                                                                               |
| Node (container)         | v24.20.0 (the image's Node; host commands use v24.15.0)                                               |
| pnpm                     | 9.6.0 (corepack)                                                                                      |
| `CI`                     | `true` (2 retries)                                                                                    |
| `<beforeSha>`            | `8d60720` (Plan Task 2 pre-port run; baselines and `before/layout-evidence.txt`)                      |
| `<afterSha>`             | `d5e633a` (Plan Task 8 post-port run; `docker/c1.log`, `docker/c1-console.log`, `docker/after/`)      |
| Regression run           | `604d8bc` (`git archive HEAD`), `docker/regression.log`, `docker/regression/`                         |
| Screenshot tolerance     | `playwright.config.ts`: `toHaveScreenshot.threshold = 0.2` (per-pixel YIQ), `maxDiffPixelRatio` unset |
| Runner                   | `SDD/docker/run.sh` modes `c1` (after-run) and `regression`                                           |

---

## 2. Changed G3-C1 screenshots (Plan Task 8 Step 3, `d5e633a`)

**Totals.** 108 visual tests (18 per project x 6 projects: 17 stories plus Dock Default (hover)). **72 failed** on a `toHaveScreenshot` mismatch, all three attempts, no other error type; **36 passed** (section 3). 33 layout and 102 accessibility tests passed. Playwright summary: `72 failed, 171 passed (3.0m)`, 0 flaky; `c1 exit 1`.

**Per project.** 12 changed in each of ng-chromium, ng-firefox, ng-webkit, vue-chromium, vue-firefox, vue-webkit; the same 12 stories in every project: Breadcrumb Default / WithDisabledItem / WithoutHome, Stepper Default / Linear / Vertical, Steps Default / NotReadonly / WithDisabledItem, Tabs Default / WithDisabledTab / WithNavigators.

**How it was reviewed.** For every changed story, framework and browser, the first-attempt expected and actual PNGs were cropped to the content area and viewed side by side (a review aid only, not kept); diff PNGs are in `R`. Ng and Vue were compared by hash: for Breadcrumb (all 3) and Steps (all 3), the Ng and Vue **expected and actual** images are byte-identical in each browser, so one description covers both. Stepper and Tabs differ between frameworks and were viewed separately.

**Pixel columns** are Playwright's "N pixels are different" for the first attempt (chromium / firefox / webkit), counted after the 0.2 per-pixel tolerance. Every retry repeated the first attempt's count exactly (72 tests x 2 retries), so no result is unstable.

**Fonts.** Chromium in this image renders most story text in a serif fallback, firefox and webkit in a sans-serif; this is the same before and after and is not a G3-C1 change. **Icons:** no icon font is loaded in Storybook, so `pi pi-*` icons (Breadcrumb home, Dock items) render nothing, before and after.

**Common to all changed stories.** Text that was black, or UA link blue `rgb(0, 0, 238)` for Steps and Breadcrumb links, becomes Aura slate (`text.muted.color` for inactive items); active items become the Aura primary emerald `#10b981` (`primary.color`), which is the colour axe reports in section 6.

| Story (`<Story>`)           | FW     | Pixels (c / f / w) | Visible change                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breadcrumb-Default          | ng+vue | 341 / 423 / 396    | Trail gains the Aura root padding (shifts right/down about 1rem) and 0.5rem gaps around the `›` separators; link labels go from UA blue to slate, separators lighter slate. The home item is empty before and after (icon font), so the trail starts with `›`. Same in all browsers.                                                                                                                                    |
| Breadcrumb-WithDisabledItem | ng+vue | 389 / 479 / 451    | Same padding, gaps and slate colours; the disabled "Disabled" item is now visibly dimmed (D3 `disabled.opacity`, 0.6). Before it was not dimmed: the pre-port rule keyed on `.u-breadcrumb-item[data-u-disabled="true"]`, an attribute the item never carries (before-state layout: opacity `1`).                                                                                                                       |
| Breadcrumb-WithoutHome      | ng+vue | 376 / 420 / 421    | "Category › Details": padding, separator gaps, slate colours, as Default; no leading separator.                                                                                                                                                                                                                                                                                                                         |
| Stepper-Default             | ng     | 1189 / 1196 / 1323 | Steps go from a compact inline row of plain "1 Personal 2 Payment 3 Confirmation" to three headers spread across the full width; each number becomes a 2rem bordered circle with a soft shadow; active step 1 number and title emerald, inactive slate; panel text slate and indented by the panel padding. No separator lines before or after (Angular `UStep` renders no separator element, Spec §3.2, pre-existing). |
| Stepper-Default             | vue    | 2982 / 2993 / 2234 | Same circles, emerald active / slate inactive, panel padding; the separators that already existed (dark grey lines) become light `#e2e8f0`-tone lines with spacing to the headers; the step row is taller.                                                                                                                                                                                                              |
| Stepper-Linear              | ng     | 864 / 1084 / 1184  | As Ng Default; the non-reachable steps 2–3 stay dimmed (now D3 `u-step-disabled` opacity 0.6, a little less faded than before).                                                                                                                                                                                                                                                                                         |
| Stepper-Linear              | vue    | 2958 / 3179 / 2180 | As Vue Default; steps 2–3 dimmed at 0.6 (less faded than before); the native "Next" button is unchanged but moves down with the panel padding.                                                                                                                                                                                                                                                                          |
| Stepper-Vertical            | ng     | 1203 / 1176 / 1340 | Before: "Personal details" sat on the same line as step 1's header. After: headers are bordered circles with slate/emerald titles and the active panel is placed below step 1's header, between step 1 and step 2 (upstream vertical groups 18–28; only one panel visible, R-C3).                                                                                                                                       |
| Stepper-Vertical            | vue    | 1243 / 1255 / 1347 | Circles and colours as above; the vertical separator under step 1 becomes a lighter line and the panel content is indented beside it, with more vertical spacing between steps.                                                                                                                                                                                                                                         |
| Steps-Default               | ng+vue | 785 / 918 / 841    | Numbers become 2rem bordered white circles joined by a light `#e2e8f0` connector line; labels sit under the numbers; active item 1 emerald, items 2–3 slate. Items 2–3 (disabled by `readonly`) are **not dimmed before or after** (PX-C1, see below). WebKit only: the connector is anti-aliased over 3 rows and shows a slightly darker short segment where two items' lines meet.                                    |
| Steps-NotReadonly           | ng+vue | 786 / 918 / 841    | Same styling with item 2 ("Payment") active in emerald; items 1 and 3 slate.                                                                                                                                                                                                                                                                                                                                            |
| Steps-WithDisabledItem      | ng+vue | 785 / 918 / 841    | **Pixel-identical to Steps-Default** in every browser (before and after): the explicitly disabled "Payment" is not dimmed (PX-C1).                                                                                                                                                                                                                                                                                      |
| Tabs-Default                | ng     | 1080 / 1213 / 1211 | Before: "Header 1Header 2Header 3" run together on one line. After: padded tabs (`1rem 1.125rem`), semi-bold; Header 1 emerald with an emerald active bar under it; Headers 2–3 slate; a 1px light border under the tab list; panel content padded.                                                                                                                                                                     |
| Tabs-Default                | vue    | 1122 / 1079 / 1282 | Before: native-button tabs with a black underline under Header 1. After: same Aura styling as Ng (emerald active tab and bar, slate inactive, list border, panel padding). Vue tabs keep the button font (sans-serif in chromium), Ng tabs the page font.                                                                                                                                                               |
| Tabs-WithDisabledTab        | ng     | 1069 / 1177 / 1184 | As Ng Tabs-Default; the disabled Header 2 was UA grey before and is now slate at `disabled.opacity` (D3), visibly lighter than Header 3.                                                                                                                                                                                                                                                                                |
| Tabs-WithDisabledTab        | vue    | 1098 / 1057 / 1252 | As Vue Tabs-Default; disabled Header 2 lighter (D3 opacity) instead of the native disabled-button grey.                                                                                                                                                                                                                                                                                                                 |
| Tabs-WithNavigators         | ng     | 1325 / 1373 / 1382 | Before: headers overflow in one unpadded line, a bare `›` at the right edge. After: padded tabs in a scrolled viewport; the next button `›` sits at the right edge over a white gradient that fades the clipped Header 3; emerald active bar under Header 1.                                                                                                                                                            |
| Tabs-WithNavigators         | vue    | 1281 / 1267 / 1351 | Same as Ng; before had a black underline under Header 1 and native-button tabs.                                                                                                                                                                                                                                                                                                                                         |

Checked by pixel sampling: the Tabs active bar is `rgb(16, 185, 129)` (`#10b981`) in all 18 Tabs images; the Steps connector is `rgb(226, 232, 240)` in chromium.

### Approved parity changes (flagged; described, not judged)

- **PX-C1 — disabled Steps items not dimmed (Spec §6.1, SR-C1-1, Spec §17).** Applies to Steps Default (readonly: every non-active item is disabled), WithDisabledItem (Payment disabled) and NotReadonly. After the port all items render at full opacity (layout test `Steps G3-C1 layout` asserts `opacity: 1` and passes in all 6 projects). **The change is not visible as a difference in these screenshots:** the pre-port dimming rule `.u-steps-item[data-u-disabled="true"] { opacity: 0.6 }` never matched, because neither framework emits `data-u-disabled` on the Steps item (verified in the `8d60720` templates). Disabled items were therefore already undimmed in the before baselines. The visible Steps differences are the token styling above. Interaction parity (Spec §17) is unchanged and pinned by the layout test (disabled link `pointer-events: auto`, click guard).
- **PX-C2 — Steps focus-ring exclusion.** Not visible at rest; no screenshot shows focus. Verified by the layout test (enabled link: token ring; disabled link: `outline-color: rgba(0, 0, 0, 0)`, `box-shadow: none`).
- **SR-C1-4 — Dock disabled `0.5` → `disabled.opacity` (0.6).** The Dock screenshots did not change (section 3), for two reasons. (1) The Dock WithDisabledItem story's items are icon-only (`pi pi-*`) and no icon font is loaded, so each item is empty and its opacity has nothing to show; the before baseline of WithDisabledItem is pixel-identical in colour histogram to Dock Default (only the list container is visible). (2) Like Breadcrumb and Steps, the pre-port rule keyed on `.u-dock-item[data-u-disabled="true"]`, which the item never carried (before-state layout: opacity `1`). The new opacity is verified by `Dock G3-C1 layout` (disabled item `opacity` = resolved `disabled.opacity`, link `pointer-events: none`), passing in all 6 projects.

---

## 3. Unchanged G3-C1 screenshots

36 visual tests passed `toHaveScreenshot` at the default tolerance, 6 per project. Playwright writes no image for a passing test, so "identical" and "inside tolerance" cannot be told apart from the run output; they are recorded as **passed (identical or inside tolerance)**.

| Test                                   | Projects                              |
| -------------------------------------- | ------------------------------------- |
| Ng/Dock Default G3-C1 visual           | ng-chromium, ng-firefox, ng-webkit    |
| Ng/Dock LeftPosition G3-C1 visual      | ng-chromium, ng-firefox, ng-webkit    |
| Ng/Dock TopPosition G3-C1 visual       | ng-chromium, ng-firefox, ng-webkit    |
| Ng/Dock RightPosition G3-C1 visual     | ng-chromium, ng-firefox, ng-webkit    |
| Ng/Dock WithDisabledItem G3-C1 visual  | ng-chromium, ng-firefox, ng-webkit    |
| Ng/Dock Default (hover) G3-C1 visual   | ng-chromium, ng-firefox, ng-webkit    |
| Vue/Dock Default G3-C1 visual          | vue-chromium, vue-firefox, vue-webkit |
| Vue/Dock LeftPosition G3-C1 visual     | vue-chromium, vue-firefox, vue-webkit |
| Vue/Dock TopPosition G3-C1 visual      | vue-chromium, vue-firefox, vue-webkit |
| Vue/Dock RightPosition G3-C1 visual    | vue-chromium, vue-firefox, vue-webkit |
| Vue/Dock WithDisabledItem G3-C1 visual | vue-chromium, vue-firefox, vue-webkit |
| Vue/Dock Default (hover) G3-C1 visual  | vue-chromium, vue-firefox, vue-webkit |

**D1 — Dock screenshots cannot show the Dock port (observation for the user).** The before baselines show only the pre-port list container: a `#f2f2f2` rounded box with a `#dadada` border, and empty items (icon font). The ported container uses the Aura dock tokens `dock.background` = `rgba(255, 255, 255, 0.1)` and `dock.border.color` = `rgba(255, 255, 255, 0.2)` (`packages/themes/src/presets/aura/dock.ts`), which on the white Storybook page composite to white. By the pixelmatch YIQ formula the per-pixel differences (13 levels for the fill, 37 for the border) are well below the `threshold: 0.2` limit, so a test passes even though the container is no longer visible. This is derived from the token values and the tolerance formula, not from an after image (none is written for a passing test). The Dock port is verified by `Dock G3-C1 layout` (each position on its viewport edge, disabled opacity, hover `transform` scale 1.5), which passes in all 6 projects; the hover test also asserts `matrix(1.5, 0, 0, 1.5, 0, 0)` before its screenshot.

---

## 4. Before-state evidence (Spec §9.3) and after results

Source: `SDD/docker/before/layout-evidence.txt` (run at `8d60720`), after results from `SDD/docker/c1.log` (`d5e633a`). Every before failure was identical on all 3 attempts; a layout test stops at its first failing assertion, so later assertions were not exercised before.

| Layout test           | Before (`8d60720`), first failing assertion                                                              | After (`d5e633a`) |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
| Ng/Breadcrumb         | FAIL x3: disabled item `opacity` `1`, expected `0.6`                                                     | PASS x3           |
| Vue/Breadcrumb        | FAIL x3: same                                                                                            | PASS x3           |
| Ng/Dock               | FAIL x3: disabled item `opacity` `1`, expected `0.6`                                                     | PASS x3           |
| Vue/Dock              | FAIL x3: same                                                                                            | PASS x3           |
| Ng/Steps              | FAIL x3: active number colour `rgb(0, 0, 238)`, expected `rgb(16, 185, 129)`                             | PASS x3           |
| Vue/Steps             | FAIL x3: same                                                                                            | PASS x3           |
| Ng/Stepper            | FAIL x3: active number colour `rgb(0, 0, 0)` (webkit `rgba(0, 0, 0, 0.8)`), expected `rgb(16, 185, 129)` | PASS x3           |
| Vue/Stepper           | FAIL x3: same                                                                                            | PASS x3           |
| Ng/Tabs               | FAIL x3: active tab colour `rgb(0, 0, 0)`, expected `rgb(16, 185, 129)`                                  | PASS x3           |
| Vue/Tabs              | FAIL x3: active tab colour `rgb(0, 0, 0)` (webkit `rgba(0, 0, 0, 0.8)`), expected `rgb(16, 185, 129)`    | PASS x3           |
| Vue/Stepper separator | FAIL x3: separator before the active step `rgb(0, 0, 0)`, expected `rgb(226, 232, 240)`                  | PASS x3           |

Before: 33 of 33 layout tests failed (none already passed). After: **33/33 passed** (ng 15 = 5 tests x 3 browsers; vue 18 = 6 tests x 3 browsers), including the Spec §17 Steps disabled-click check and the Stepper vertical header-edge / one-visible-panel check.

---

## 5. Regression run (Step 1, `604d8bc`)

`run.sh regression` at `604d8bc`: every spec except G3-C1 (`--grep-invert "G3-C1"`; G3-A, G3-B, React and `packages/vue/e2e/stepper.spec.ts` included) in the 9 Storybook projects plus the 3 SSR projects. Log: `SDD/docker/regression.log`; console: `SDD/docker/regression-console.log`; results: `SDD/docker/regression-results.tar`, extracted to `SDD/docker/regression/`.

- Result: **`regression exit 1`, 1579 tests: 1578 passed, 1 failed, 0 flaky** (7.2 min). The single failure is the known G3-B exception U2 (below); nothing else failed and no test needed a retry to pass.
- Per project (passed / failed): ng-chromium 224 / 0, ng-firefox 224 / 0, ng-webkit 224 / 0; vue-chromium 221 / 0, vue-firefox 221 / 0, **vue-webkit 220 / 1 (U2)**; react-chromium 72 / 0, react-firefox 72 / 0, react-webkit 72 / 0; ng-ssr-chromium 10 / 0, react-ssr-chromium 9 / 0, vue-ssr-chromium 9 / 0.
- **`packages/vue/e2e/stepper.spec.ts` (mandatory, GAP-077): PASS in vue-chromium, vue-firefox and vue-webkit** ("each separator lies between consecutive step headers on one row"), first attempt, spec unchanged.
- **U2 (known G3-B exception, recorded, not fixed):** `[vue-webkit] packages/vue/e2e/g3b-aura-styles.spec.ts:44 Vue/Card WithHeaderAndFooter G3-B visual`, screenshot mismatch of 2157 pixels on all three attempts. All three actual PNGs are byte-identical (sha256 prefix `add1faf83b6b`) to the G3-B reviewed stable render `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/review/g3b-aura-styles-Vue-Card-WithHeaderAndFooter-G3-B-visual-vue-webkit-retry1/`, the same result as the G3-B final evidence: the committed pre-port baseline is compared against the normal card. Cause: the story's external CDN image (`primefaces.org`); not a G3-C1 effect.
- No existing screenshot outside G3-C1 changed, and no regression baseline was updated. G3-A and G3-B visual, layout and accessibility tests pass apart from U2.

---

## 6. Accessibility (Plan Task 8 Step 4)

- G3-C1 accessibility tests: **102/102 passed** in the after-run (17 stories x 6 projects); every one wrote its envelope.
- Fingerprint comparison (`rule:story:target`, `SDD/docker/fingerprints.mjs`, `<beforeSha>` `8d60720` vs `<afterSha>` `d5e633a`, `SDD/docker/fingerprints.stderr`): **before 116, after 134, pre-existing 116, introduced 18, fixed 0.**
- Pre-existing rows: recorded in `docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md` (116 rows). No `color-contrast` violation exists in any before envelope.
- Validator (`scripts/provenance/validate-g3c1-accessibility.mjs`, Task 8) on the after envelopes: `ng` and `vue` each `FAIL: 0 missing report(s) of 51, 27 introduced violation node(s)` (9 fingerprints x 3 browsers), exactly the INTRODUCED rows below; no STALE rows.

### INTRODUCED rows (18 fingerprints, 54 nodes)

All 18 are rule **`color-contrast`** (axe 4.13.0, impact `serious`), present in **chromium, firefox and webkit** for every row. For every node axe reports **foreground `#10b981`, background `#ffffff`, contrast ratio 2.53, expected 4.5:1**, font weight normal.

| #   | Story ID                        | Target                                                                                          | Font size axe reports (c / f / w) |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | `ng-stepper--default`           | `.u-step-active > .u-step-header[type="button"] > .u-step-title`                                | 13.33px / 13.33px / 16px          |
| 2   | `ng-stepper--linear`            | `.u-step-active > .u-step-header[type="button"] > .u-step-title`                                | 13.33px / 13.33px / 16px          |
| 3   | `ng-stepper--vertical`          | `.u-step-active > .u-step-header[type="button"] > .u-step-title`                                | 13.33px / 13.33px / 16px          |
| 4   | `ng-steps--default`             | `.u-steps-item-active > .u-steps-item-link[target="undefined"][href="#"] > .u-steps-item-label` | 16px / 16px / 16px                |
| 5   | `ng-steps--not-readonly`        | `.u-steps-item-active > .u-steps-item-link[target="undefined"][href="#"] > .u-steps-item-label` | 16px / 16px / 16px                |
| 6   | `ng-steps--with-disabled-item`  | `.u-steps-item-active > .u-steps-item-link[target="undefined"][href="#"] > .u-steps-item-label` | 16px / 16px / 16px                |
| 7   | `ng-tabs--default`              | `.u-tab-active`                                                                                 | 16px / 16px / 16px                |
| 8   | `ng-tabs--with-disabled-tab`    | `.u-tab-active`                                                                                 | 16px / 16px / 16px                |
| 9   | `ng-tabs--with-navigators`      | `.u-tab-active`                                                                                 | 16px / 16px / 16px                |
| 10  | `vue-stepper--default`          | `.u-step-active > .u-step-header[type="button"][role="tab"] > .u-step-title`                    | 13.33px / 13.33px / 16px          |
| 11  | `vue-stepper--linear`           | `.u-step-active > .u-step-header[role="tab"][type="button"] > .u-step-title`                    | 13.33px / 13.33px / 16px          |
| 12  | `vue-stepper--vertical`         | `.u-step-active > .u-step-header[type="button"][role="tab"] > .u-step-title`                    | 13.33px / 13.33px / 16px          |
| 13  | `vue-steps--default`            | `.u-steps-item-active > .u-steps-item-link[href="#"] > .u-steps-item-label`                     | 16px / 16px / 16px                |
| 14  | `vue-steps--not-readonly`       | `.u-steps-item-active > .u-steps-item-link[href="#"] > .u-steps-item-label`                     | 16px / 16px / 16px                |
| 15  | `vue-steps--with-disabled-item` | `.u-steps-item-active > .u-steps-item-link[href="#"] > .u-steps-item-label`                     | 16px / 16px / 16px                |
| 16  | `vue-tabs--default`             | `.u-tab-active`                                                                                 | 13.33px / 13.33px / 16px          |
| 17  | `vue-tabs--with-disabled-tab`   | `.u-tab-active`                                                                                 | 13.33px / 13.33px / 16px          |
| 18  | `vue-tabs--with-navigators`     | `.u-tab-active`                                                                                 | 13.33px / 13.33px / 16px          |

**Token source (fact).** The colour comes from upstream Aura tokens, unchanged by G3-C1: the ported rules are `.u-step-active .u-step-title { color: dt('stepper.step.title.active.color') }`, `.u-steps-item-active .u-steps-item-label { color: dt('steps.item.label.active.color') }` and `.u-tab-active { … color: dt('tabs.tab.active.color') }`. In `packages/themes/src/presets/aura/` each of `stepper.stepTitle.activeColor`, `steps.itemLabel.activeColor` and `tabs.tab.activeColor` is `{primary.color}`, which in the light scheme is `{primary.500}` = `{emerald.500}` = `#10b981` (`base.ts`). The before state had no `color-contrast` row because the active items were black or UA link blue. axe does not report the emerald active **numbers** (Steps/Stepper) or the active bar as violations.

**FIXED rows: none.**

No accessibility row has been added to `ACCESSIBILITY_BASELINE.md`.

---

## 7. C5 coverage checklist (Spec §5, §6, §9.2)

D1 = ported upstream groups (Spec §5 numbering); D3 = base-role disabled rules (Spec §6.1); D5 = retained Ultimate-only rules R-C1..R-C3 (Spec §6.3). D2 groups are never emitted and need no story. "Screenshot" means the change is visible in a section 2 image; "layout" means it is asserted by the §9.3 browser check (section 4).

| Key        | D1 rule families and the stories that exercise them                                                                                                                                                                                                                                                                                                                                                                                                                | D3 / D5                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| breadcrumb | groups 1–3 root, list, separator; 5 scrollbar; 6 item link; 9 label; 10 icon: Default, WithoutHome, WithDisabledItem (screenshot). 7 focus-visible, 8/11 hover label/icon: not in a screenshot; hover label colour asserted by layout. Icon (10/11) renders nothing (no icon font).                                                                                                                                                                                | D3 breadcrumb: WithDisabledItem (screenshot: dimmed; layout: opacity, `pointer-events: none`). D5: none.                                                                              |
| dock       | groups 1–4 root, list container, list, item; 6 item link; 7 top; 8 bottom; 9–10 right; 11–12 left: Default (bottom), TopPosition, RightPosition, LeftPosition, WithDisabledItem. Screenshots unchanged within tolerance (section 3, D1 observation); positions asserted by layout (root on each viewport edge).                                                                                                                                                    | D3 dock: WithDisabledItem (layout only; items are empty). D5 R-C1/R-C2: Dock Default (hover) screenshot + layout/hover `transform` scale 1.5.                                         |
| steps      | groups 1–3 root, list, item; 4 disabled cancel (PX-C1); 5–7 connector `::before`; 8 link; 10 label; 11–12 number; 14–15 active number/label: Default, NotReadonly, WithDisabledItem (screenshot). 9 focus-visible (PX-C2): layout only.                                                                                                                                                                                                                            | D3: none for Steps (Spec §6.1). D5: none. PX-C1 opacity `1` and PX-C2 focus ring asserted by layout.                                                                                  |
| stepper    | groups 1–5, 7–12 step list, step, header, title, number, active states: Default, Linear (screenshot). 13 focus-visible: not in a screenshot. 14–15 separator / active separator: Vue Default, Linear, Vertical (Angular renders no separator). 16–17 panels/panel: all three. 18–28 vertical (`UStepItem`): Vertical; 23–24 Vue only (FX-C6 Angular).                                                                                                              | D3 stepper: Linear (steps 2–3 `u-step-disabled`, screenshot dimmed; layout opacity and `pointer-events: none`). D5 R-C3 (Ng only): Vertical (one panel visible, screenshot + layout). |
| tabs       | groups 1 root, 2 tablist, 5–6 tab list/content, 13 tab, 16 active tab, 17 panels, 19 active bar: Default, WithDisabledTab, WithNavigators (screenshot). 3–4 viewport and scrollbar, 7 nav buttons, 10–11 prev/next: WithNavigators (screenshot: next button with gradient; layout: absolute, inside the tablist box). 8–9 nav focus/hover, 12 rtl, 14 tab focus-visible, 18 panel focus-visible: not in a screenshot; 15 inactive hover colour asserted by layout. | D3 tabs: WithDisabledTab (screenshot: lighter; layout: opacity, `pointer-events: none`). D5: none.                                                                                    |

---

## 8. UNEXPECTED items with investigated causes

- **None.** The regression run has one failure, U2, the known G3-B exception (section 5), not UNEXPECTED. The G3-C1 after-run has no non-screenshot failure.
- Recorded for the user, not classed as UNEXPECTED: the 18 INTRODUCED `color-contrast` rows (section 6, upstream `primary.color` token) and observation D1 (section 3, Dock screenshots below tolerance).

---

## Decisions requested from the user (Plan Task 9 Step 3)

**(a) Screenshot baselines.** The 72 changed G3-C1 visual tests listed in section 2 (12 stories x 6 projects). No acceptance is proposed or applied by this record.

**(b) Accessibility rows.** The 18 INTRODUCED `color-contrast` fingerprints of section 6 (54 nodes over 3 browsers). Whether any of them enter `ACCESSIBILITY_BASELINE.md` is the user's decision; nothing has been added.

**Also for the user's attention:** observation D1 (section 3): the Dock screenshots pass while the ported Dock container composites to white, so they do not visually demonstrate the Dock port.

---

## Task 9 decisions and final evidence

Recorded after the user's explicit review decisions of 2026-10-06. Sections 1-8 above are the pre-decision evidence and are unchanged, except for the Status line.

### Decisions (user, 2026-10-06)

- **(a) Screenshots:** accept **all 72** changed G3-C1 screenshots listed in section 2 (12 stories x 6 projects: Breadcrumb Default, WithDisabledItem and WithoutHome; Stepper Default, Linear and Vertical; Steps Default, NotReadonly and WithDisabledItem; Tabs Default, WithDisabledTab and WithNavigators; ng and vue, each in chromium, firefox and webkit). No other snapshot may change.
- **(b) Accessibility:** approve the **18** INTRODUCED `color-contrast` fingerprints of section 6 into `docs/architecture/ACCESSIBILITY_BASELINE.md` as upstream Aura parity exceptions (`#10b981` on `#ffffff`, 2.53:1 versus 4.5:1, Aura `primary.color`; Aura colors intentionally unchanged).

### Baseline update (Docker, `update "G3-C1 visual"`, `--update-snapshots=changed`)

- Run inside `mcr.microsoft.com/playwright:v1.63.0-jammy` (aarch64, Node v24.20.0, pnpm 9.6.0) from an archive of `HEAD` `604d8bc`: `update exit 0`, 108 passed (the 108 G3-C1 visual tests); 72 reported "re-generated, writing actual".
- After extracting `snapshots.tar`, `git status --short` showed exactly **72 modified PNGs** under `packages/{ng,vue}/e2e/g3c1-aura-styles.spec.ts-snapshots/` (the 24 titles of decision (a) x 3 browsers), no other changed PNG; the Dock screenshots and every other visual snapshot are untouched.
- Accepted titles: **72** (36 ng, 36 vue).

### Accessibility baseline rows

18 rows were appended to the end of the table in `docs/architecture/ACCESSIBILITY_BASELINE.md`, grouped by framework then story, with the exact fingerprints of `SDD/docker/fingerprints.stderr` and the note `GAP-064 G3-C1 — upstream Aura parity exception (user-approved 2026-10-06). Aura colors intentionally unchanged.`:

- ng: `ng-stepper--default`, `ng-stepper--linear`, `ng-stepper--vertical`, `ng-steps--default`, `ng-steps--not-readonly`, `ng-steps--with-disabled-item`, `ng-tabs--default`, `ng-tabs--with-disabled-tab`, `ng-tabs--with-navigators` (9 rows).
- vue: `vue-stepper--default`, `vue-stepper--linear`, `vue-stepper--vertical`, `vue-steps--default`, `vue-steps--not-readonly`, `vue-steps--with-disabled-item`, `vue-tabs--default`, `vue-tabs--with-disabled-tab`, `vue-tabs--with-navigators` (9 rows).

The base file is not Prettier-clean (known pre-existing debt), so Prettier was not run on it; the rows follow the existing table style.

### Re-run on the staged tree (`c1`)

- The staged tree (72 PNGs, `ACCESSIBILITY_BASELINE.md`, this record) was archived with `git archive "$(git write-tree)"` and run with `run.sh c1`: **`c1 exit 0`, 243 passed, 0 failed, 0 flaky** (visual, layout and accessibility tests, six ng/vue projects).
- Validator against the new results (`c1-results.tar` extracted to `SDD/docker/after-final/`, copied into the empty `./test-results`, removed afterwards):
  - `node scripts/provenance/validate-g3c1-accessibility.mjs ng`: `OK: ng 51/51 reports, 0 introduced violations, 0 stale pre-existing row(s)`.
  - `node scripts/provenance/validate-g3c1-accessibility.mjs vue`: `OK: vue 51/51 reports, 0 introduced violations, 0 stale pre-existing row(s)`.

Observation D1 (Dock screenshots pass while the ported Dock container composites to white) is not part of the decisions and remains open for the user's attention.
