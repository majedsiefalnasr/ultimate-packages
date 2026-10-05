# GAP-064 G3-B Visual and Accessibility Review Record (Plan Task 9, Steps 1–2)

**Status:** Decisions applied (user, 2026-10-05); 138 baselines accepted, U2 intentionally unaccepted. No `ACCESSIBILITY_BASELINE.md` change. See the final section "Task 9 decisions and final evidence".

**Branch / HEAD under review:** `feature/gap-064-g3b-containers` @ `56d003f` (regression run). The targeted G3-B "after" run is `fcbb65a` (Spec §14 Amendment A1); `56d003f` only adds the Task 8 validator, evidence file and CI wiring on top of it, and changes no style module, story or e2e spec.

## Artifact locations

- `SDD` = `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/` (git-ignored, persistent).
- `T` = `SDD/docker/after/test-results/` (Playwright output of the post-port G3-B run at `fcbb65a`).
- `R` = `SDD/review/` (durable copy for this gate): 139 first-attempt test directories, plus `g3b-aura-styles-Vue-Card-WithHeaderAndFooter-G3-B-visual-vue-webkit-retry1/` (see U2). 420 PNGs. Directory and file names are Playwright's own.
- Image path pattern, for every changed test in section 2 and each browser `<b>` in `chromium|firefox|webkit`:

  ```text
  <T or R>/g3b-aura-styles-<Ng|Vue>-<Story>-G3-B-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-B-visual-1-expected.png
  <T or R>/g3b-aura-styles-<Ng|Vue>-<Story>-G3-B-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-B-visual-1-actual.png
  <T or R>/g3b-aura-styles-<Ng|Vue>-<Story>-G3-B-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-B-visual-1-diff.png
  ```

  `<Story>` is the hyphenated name of section 2 (for example `Accordion-ActiveAndDisabled`, `ScrollPanel-Default-hover`). The `-retry1` / `-retry2` directories under `T` hold the retry attempts.

- History only: `SDD/docker/after-ee637c2/` is the first post-port run (HEAD `ee637c2`), superseded by Amendment A1. It is not evidence for this gate.

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
| `<beforeSha>`            | `411fd27` (Plan Task 2 pre-port run; baselines and `before/layout-evidence.txt`)                      |
| `<afterSha>`             | `fcbb65a` (post-port run after Amendment A1; `docker/g3b.log`, `docker/after/`)                       |
| Regression run           | `56d003f` (`git archive HEAD`), `docker/regression.log`, `docker/regression/`                         |
| Screenshot tolerance     | `playwright.config.ts`: `toHaveScreenshot.threshold = 0.2` (per-pixel YIQ), `maxDiffPixelRatio` unset |
| Runner                   | `SDD/docker/run.sh` modes `g3b` (after-run) and `regression`                                          |

---

## 2. Changed G3-B screenshots (Plan Task 8 Step 3, `fcbb65a`)

**Totals.** 156 visual tests (26 per project x 6 projects). **139 failed** on a `toHaveScreenshot` mismatch, all three attempts, no other error type; **17 passed**. 150 accessibility and 42 layout tests passed. Playwright summary: `139 failed, 209 passed (5.5m)`, 0 flaky.

**Per project.** ng-chromium 23 changed, ng-firefox 25, ng-webkit 25, vue-chromium 22, vue-firefox 22, vue-webkit 22.

**How it was reviewed.** For every changed story, the first-attempt expected and actual PNGs of all three browsers were placed side by side (a review aid only, not kept) and viewed. Where a story exists in both frameworks, the Ng and Vue images were compared programmatically: for Divider WithContent / WithContentVertical, Fieldset (all 3), Inplace (all 3), Panel Default / Toggleable / Collapsed and Toolbar, the Ng and Vue **expected and actual** images are pixel-identical in each browser, so one description covers both. Divider Horizontal: identical actual, different expected. All other shared stories differ between frameworks and were viewed separately.

**Pixel columns** are Playwright's "N pixels are different" for the first attempt (chromium / firefox / webkit), counted after the 0.2 per-pixel tolerance. Retries repeat the same final count, except Vue Card WithHeaderAndFooter webkit (U2). `-` means the test passed in that browser.

**Fonts.** Chromium in this image renders the stories in a serif fallback, firefox and webkit in a sans-serif; this is the same before and after and is not a G3-B change.

| Story (`<Story>`)           | FW     | Pixels (c / f / w)            | Visible change                                                                                                                                                                                                                                              |
| --------------------------- | ------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion-ActiveAndDisabled | ng     | 1500 / 1564 / 1644            | Black text becomes Aura slate; each panel gets a bottom border line; header padding grows; active header text darker/semi-bold, inactive slate, disabled header lighter (opacity). Same in all browsers.                                                    |
| Accordion-Default           | ng     | 941 / 913 / 1071              | All collapsed: slate header text, bottom border per panel, taller headers; disabled Header III lighter.                                                                                                                                                     |
| Accordion-Multiple          | ng     | 941 / 913 / 1071              | Same as Ng Accordion-Default (identical before and after counts).                                                                                                                                                                                           |
| Accordion-Default           | vue    | 1500 / 1564 / 1644            | Same as Ng Accordion-ActiveAndDisabled (Vue's Default has Header I open and Header III disabled): slate text, panel border lines, larger header padding.                                                                                                    |
| Accordion-Multiple          | vue    | 609 / 594 / 698               | Two collapsed headers: slate text, bottom border per panel, taller headers.                                                                                                                                                                                 |
| BlockUI-Default             | ng     | 186006 / 185812 / 185911      | Before: no visible mask. After: a grey semi-opaque mask with rounded corners covers the dashed-border container (inside the 1px border, Amendment A1); text visible through it.                                                                             |
| BlockUI-Default             | vue    | 61500 / 65056 / 65152         | Same mask now covers the (borderless, about 50px tall) Vue container with rounded corners. Container height/border differ from Ng because the story's inline style does not reach the Vue container (Spec §14 follow-up observation, unchanged).            |
| BlockUI-FullScreen          | ng     | 20 / 16 / 20                  | Full-viewport mask unchanged except its four corners: 5px rounded corners now show white at the viewport corners (`border-radius: dt('blockui.border.radius')` also applies to the document mask, as upstream). See N1.                                     |
| BlockUI-FullScreen          | vue    | 20 / 16 / 20                  | Same as Ng.                                                                                                                                                                                                                                                 |
| Card-Default                | ng     | 887 / 1968 / 1706             | Card becomes a white rounded box with a soft shadow; title smaller and medium weight (was bold); body text wraps inside the card's padding.                                                                                                                 |
| Card-Default                | vue    | 557 / 1807 / 1386             | Same styling (shadow, rounded corners, medium-weight smaller title, tighter spacing); the Vue card is full width, no wrap.                                                                                                                                  |
| Card-WithHeaderAndFooter    | ng     | 2122 / 2599 / 2213            | Same card styling; title medium weight; content wraps; Cancel/Save buttons stay native. Header image is not visible before or after (external URL, see U2).                                                                                                 |
| Card-WithHeaderAndFooter    | vue    | 2122 / 2689 / 1644 (unstable) | Chromium/firefox: same card styling as Ng, full width. **Webkit attempt 1 captured a broken render** (blank tall card with a broken-image icon); retries 1–2 show the normal card (2157 px). See **U2**.                                                    |
| Divider-Horizontal          | ng     | 158 / 163 / 167               | Line unchanged; "Content below" moves up about 1px (Aura horizontal margin).                                                                                                                                                                                |
| Divider-Horizontal          | vue    | 158 / 163 / 167               | Same after image as Ng (pixel-identical).                                                                                                                                                                                                                   |
| Divider-Vertical            | ng     | 145 / 149 / 156               | A light vertical rule now appears between "Left" and "Right" (before: none). Vue already showed it, Vue test unchanged (section 3).                                                                                                                         |
| Divider-WithContent         | ng+vue | 227 / 227 / 275               | "Label" moves from the right end of the line to the centre (PX-B6 default centring); label colour Aura slate.                                                                                                                                               |
| Divider-WithContentVertical | ng+vue | 276 / 265 / 285               | "OR" moves from inline between Left/Right to the vertical centre of a visible vertical rule, slate colour.                                                                                                                                                  |
| Fieldset-Default            | ng+vue | 1160 / 1239 / 1333            | Legend and content shift by the Aura padding; legend semi-bold slate (was bold black); content slate.                                                                                                                                                       |
| Fieldset-Toggleable         | ng+vue | 1296 / 1401 / 1459            | Same as Default; toggle "−" glyph lighter slate; content block tighter to the legend.                                                                                                                                                                       |
| Fieldset-Collapsed          | ng+vue | 638 / 630 / 779               | Legend "+ Collapsed Fieldset" slate semi-bold; empty bordered body unchanged in shape.                                                                                                                                                                      |
| Inplace-Default             | ng+vue | 245 / 261 / 256               | "Click to Edit" moves right/down by the Aura display padding.                                                                                                                                                                                               |
| Inplace-Disabled            | ng+vue | 243 / 251 / 254               | Same padding shift, and the text is now greyed (disabled opacity; before it looked enabled).                                                                                                                                                                |
| Inplace-Active              | ng+vue | 200 / 186 / 131               | The 0.5rem gap between the input and the Close button disappears; the button now touches the input. See N2.                                                                                                                                                 |
| Panel-Default               | ng+vue | 583 / 589 / 590               | Header title slate semi-bold; header and content padding change (content lower); border colour lighter.                                                                                                                                                     |
| Panel-Toggleable            | ng+vue | 1060 / 1132 / 1199            | Same as Panel-Default; panel slightly shorter. No toggle icon is visible before or after (pre-existing; see section 6 `button-name`).                                                                                                                       |
| Panel-Collapsed             | ng+vue | 654 / 681 / 771               | Header-only panel: slate semi-bold title, slightly shorter header.                                                                                                                                                                                          |
| Panel-WithFooter            | vue    | 1368 / 1406 / 1460            | Same header/content change; the footer's top separator line is removed and the footer sits with Aura padding.                                                                                                                                               |
| ScrollPanel-Default         | ng     | - / 495 / 469                 | Firefox/webkit only: the 400px gradient moves up about 16px and one short faint 1px line moves from the top-left to the top-right edge of the viewport. Chromium unchanged. **The story never shows a 200x200 clipped panel, before or after.** See **U1**. |
| ScrollPanel-Default-hover   | ng     | - / 495 / 469                 | Identical to ScrollPanel-Default in the same browser: no scroll bars are visible on hover. See **U1**.                                                                                                                                                      |
| Splitter-Default            | ng     | 103 / 168 / 176               | Panel text slate; the gutter between the panels becomes a visible light-grey bar.                                                                                                                                                                           |
| Splitter-Default            | vue    | 103 / 168 / 176               | Same change; the Vue splitter is only one text line tall before and after (story height does not reach the Vue root; pre-existing).                                                                                                                         |
| Splitter-Vertical           | ng     | 130 / 175 / 169               | Horizontal gutter between Top and Bottom becomes a visible light-grey bar; text slate.                                                                                                                                                                      |
| Splitter-Vertical           | vue    | 130 / 175 / 169               | Same change on a short (two text lines) Vue splitter.                                                                                                                                                                                                       |
| Toolbar-Default             | ng+vue | 203 / 215 / 214               | Toolbar background changes from light grey to white; "Left"/"Right" text slate; border unchanged in shape.                                                                                                                                                  |

### Candidate concerns (for the user; not judged acceptable here)

- **U1 — Ng ScrollPanel Default and Default (hover), firefox + webkit (4 tests).** The Angular host `<u-scroll-panel>` is the `.u-scroll-panel` root and is an unstyled custom element (inline), so the story's `width: 200px; height: 200px; border: 1px solid #ccc` does not produce a 200x200 clipped box: the 400x400 gradient is fully visible and the border is drawn only as short 1px fragments. This is the same before and after (pre-existing; upstream does not set `display` on the root, and PrimeNG's local `display: block` is not part of the port, Spec §4.2). After the port, in firefox and webkit only, the content shifts up about 16px and a border fragment moves to the top-right of the viewport; chromium is unchanged. The hover screenshot shows no scroll bar in any browser, so it does not prove "bars visible" (Spec §8 C5 interaction state), although `Ng/ScrollPanel G3-B layout` passes (opacity 1, bars inside the root box, hidden bar `visibility: hidden`). Vue ScrollPanel screenshots are unchanged and likewise show no clipped panel and no bars.
- **U2 — Vue Card WithHeaderAndFooter webkit (1 test).** The story loads its header image from `https://primefaces.org/cdn/...`. In the first attempt the screenshot was unstable (2157, 1122, 1644 px) and the saved actual is a broken render: a tall blank card with a broken-image icon. Retries 1 and 2 are stable (2157 px) and show the normal Aura card (copied to `R/...-vue-webkit-retry1/`). The image is never visible in any browser, before or after. Accepting this baseline risks recording whichever network state the update run sees.

### Notes (explained by the upstream CSS; listed so the user sees them)

- **N1 — BlockUI FullScreen rounded corners.** The ported `.u-blockui-mask{border-radius: dt('blockui.border.radius')}` (upstream group) applies to the document mask too, so the full-viewport mask has rounded corners. Upstream has the same rule on `.p-blockui-mask`.
- **N2 — Inplace Active spacing.** The hand-written `.u-inplace-content { display: inline-flex; gap: 0.5rem }` is replaced by upstream `.u-inplace-content{display: block;}`, so the projected input and Close button now touch (Angular strips the whitespace between them).

---

## 3. Unchanged G3-B screenshots

17 visual tests passed `toHaveScreenshot` at the default tolerance. Playwright writes no image for a passing test, so "identical" and "inside tolerance" cannot be told apart from the run output; they are recorded as **passed (identical or inside tolerance)**.

| Test                                        | Projects                              |
| ------------------------------------------- | ------------------------------------- |
| Ng/BlockUI Unblocked G3-B visual            | ng-chromium, ng-firefox, ng-webkit    |
| Ng/ScrollPanel Default G3-B visual          | ng-chromium                           |
| Ng/ScrollPanel Default (hover) G3-B visual  | ng-chromium                           |
| Vue/BlockUI Unblocked G3-B visual           | vue-chromium, vue-firefox, vue-webkit |
| Vue/Divider Vertical G3-B visual            | vue-chromium, vue-firefox, vue-webkit |
| Vue/ScrollPanel Default G3-B visual         | vue-chromium, vue-firefox, vue-webkit |
| Vue/ScrollPanel Default (hover) G3-B visual | vue-chromium, vue-firefox, vue-webkit |

BlockUI Unblocked is Review Focus 5 (no mask, no overlay); its unchanged screenshot is expected. For ScrollPanel, see U1.

---

## 4. Before-state evidence (Spec §4.3) and after results

Source: `SDD/docker/before/layout-evidence.txt` (run at `411fd27`), after results from `SDD/docker/g3b.log` (`fcbb65a`).

| Layout test                | Before (`411fd27`)                                                          | After (`fcbb65a`)            |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| Ng/BlockUI                 | FAIL x3: mask x offset 1 vs container (mask unpositioned)                   | PASS x3 (after Amendment A1) |
| Vue/BlockUI                | FAIL x3: mask y offset 66 / 69 / 69 (mask not overlaying the container)     | PASS x3                      |
| Ng/ScrollPanel             | FAIL x3: scroll bar bounding box `null`                                     | PASS x3                      |
| Vue/ScrollPanel            | FAIL x3: scroll bar bounding box `null`                                     | PASS x3                      |
| Ng/Divider                 | FAIL x3: content off-centre by 596.44 / 596.33 / 597.15 px                  | PASS x3                      |
| Vue/Divider                | FAIL x3: same offsets                                                       | PASS x3                      |
| Ng/Inplace                 | FAIL x3: hover background `rgba(0, 0, 0, 0)`, expected `rgb(241, 245, 249)` | PASS x3                      |
| Vue/Inplace                | FAIL x3: same                                                               | PASS x3                      |
| Ng/Splitter                | FAIL x3: host cursor while dragging `auto`, expected `col-resize`           | PASS x3                      |
| Vue/Splitter               | PASS x3 (already matched)                                                   | PASS x3                      |
| Ng+Vue Accordion, Fieldset | PASS (not part of the 27 before failures)                                   | PASS x3 each                 |

Layout after-run totals: 42/42 passed (7 per project).

**Amendment A1 (Spec §14, user-approved 2026-10-05).** The first after-run (`ee637c2`, `docker/after-ee637c2/`) failed `Ng/BlockUI G3-B layout` in all three browsers: the mask's `x` was 1px off the container. Cause: in Angular the host `<u-block-ui>` is the `.u-blockui-container` and the story gives it `border: 1px dashed`; the absolutely positioned mask is laid out against the padding box, inside the border, as upstream's would be. The check compared with the outer border box. Decision: both frameworks compare the mask with the container's inside-the-border box, tolerance unchanged at 0.5px, no CSS/story change. Commit `fcbb65a`; the rerun passes in all three browsers for both frameworks. Vue passed before the amendment because its container has no border (`inheritAttrs: false`).

---

## 5. Regression run (Step 1, `56d003f`)

`run.sh regression` at `56d003f`: every spec except G3-B (G3-A included) in the 9 Storybook projects plus the 3 SSR projects. Log: `SDD/docker/regression.log`; results: `SDD/docker/regression-results.tar`.

- Result: **`regression exit 0`, 1231 passed, 0 failed, 0 flaky** (no retry lines), 6.7 min.
- Per project (passed): ng-chromium 166, ng-firefox 166, ng-webkit 166; vue-chromium 163, vue-firefox 163, vue-webkit 163; react-chromium 72, react-firefox 72, react-webkit 72 (regression only); ng-ssr-chromium 10, react-ssr-chromium 9, vue-ssr-chromium 9.
- No existing screenshot changed, and no regression baseline was updated. G3-A's visual and accessibility tests are included and pass.

---

## 6. Accessibility (Plan Task 8 Step 4)

- G3-B accessibility tests: **150/150 passed** in the after-run (25 stories x 6 projects), every one wrote its envelope.
- Fingerprint comparison (`rule:story:target`, `SDD/docker/fingerprints.mjs`, `<beforeSha>` `411fd27` vs `<afterSha>` `fcbb65a`): **before 147, after 147, pre-existing 147, introduced 0, fixed 0.**
- Validator (`scripts/provenance/validate-g3b-accessibility.mjs`, Task 8): `ng 75/75 reports, 0 introduced violations, 0 stale pre-existing row(s)`; `vue 75/75 reports, 0 introduced violations, 0 stale pre-existing row(s)`.
- Pre-existing rows by rule (recorded in `docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md`): `landmark-one-main` 48, `page-has-heading-one` 48, `region` 39, `button-name` 4 (Panel toggle buttons), `aria-allowed-attr` 2 and `aria-required-attr` 2 (Ng Splitter gutter), `image-alt` 2 (Card header image), `label` 2 (Inplace Active input). No `color-contrast` row before or after.
- **INTRODUCED rows: none.** No rule, story, target, browser or contrast ratio to report.
- **FIXED rows: none.**
- Consequently **no `ACCESSIBILITY_BASELINE.md` row is proposed.**

---

## 7. C5 coverage checklist

D1 = ported upstream component groups; D3 = B-2 base-role rules (PX-B1 accordion disabled, PX-B2 inplace disabled, PX-B3 blockui overlay mask); D4 = B-3 Divider inline-role centring (PX-B6); D5 = retained Ultimate-only rules (PX-B9: fieldset toggle button and icon, splitter gutter `touch-action`).

| Key         | D1 rule families and the stories that exercise them                                                                                                                                  | D3 / D4 / D5                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| accordion   | panel border, header, header active/hover, content: Ng Default, Multiple, ActiveAndDisabled; Vue Default, Multiple                                                                   | D3 PX-B1 disabled: Ng ActiveAndDisabled, Vue Default (Header III); layout test checks opacity and pointer-events |
| blockui     | container `position: relative`, mask radius, mask absolute, document mask fixed: Default, FullScreen, Unblocked (both)                                                               | D3 PX-B3 overlay-mask: Default, FullScreen (both); layout test checks box and background                         |
| card        | root, caption (Vue only; Ng omits it, FX-B2), body, title, subtitle: Default, WithHeaderAndFooter (both)                                                                             | none                                                                                                             |
| divider     | horizontal and vertical root, `:before` rule, content: Horizontal, Vertical, WithContent, WithContentVertical (both)                                                                 | D4 PX-B6 centring: WithContent, WithContentVertical (both); layout test checks centring                          |
| fieldset    | root, legend, toggleable legend and hover, toggle button, label, toggle icon, content: Default, Toggleable, Collapsed (both)                                                         | D5 toggle button/icon: Toggleable, Collapsed (both); layout test checks inherited font and colour                |
| inplace     | display, display hover, focus, content: Default, Disabled, Active (both)                                                                                                             | D3 PX-B2 disabled: Disabled (both); layout test checks hover background and disabled opacity                     |
| panel       | root, header, toggleable header, title, content container, content, footer (Vue only; FX-B5 in Ng): Default, Toggleable, Collapsed (both), WithFooter (Vue)                          | none                                                                                                             |
| scrollpanel | content container, content, bars, hover/active opacity, hidden bar: Default and Default (hover) (both); see U1 for what the screenshots actually show                                | none                                                                                                             |
| splitter    | root, vertical, gutter, gutter handle (both orientations), panel, nested descendant rule `.u-splitter-panel .u-splitter`, resizing (Ng only; FX-B7 in Vue): Default, Vertical (both) | D5 gutter `touch-action: none`: Default, Vertical (both); layout test checks it and the Ng drag cursor           |
| toolbar     | root, start/center/end: Default (both)                                                                                                                                               | none                                                                                                             |

The nested-splitter descendant rule (Review Focus 4) and the Vue `data-p-disabled="false"` case (Review Focus 1) are covered by the Task 4 unit/state specs, not by a screenshot.

---

## 8. UNEXPECTED items with investigated causes

- **Ng/BlockUI G3-B layout, first after-run (`ee637c2`).** Failed by 1px in all three browsers. Cause: the check compared with the container's outer border box (section 4). Resolved by user-approved Amendment A1 (Spec §14); no CSS or story change.
- **U1, U2** (section 2): candidate concerns for the user, not resolved here.
- Regression run: none.
- Accessibility: none (0 introduced).

---

## Decisions requested from the user

**(a) Screenshot baselines to accept.**

- Proposed for acceptance (134 tests): every changed G3-B visual test in section 2 **except** the flagged ones below. That is: Ng Accordion (3 stories), BlockUI Default and FullScreen, Card (2), Divider (4), Fieldset (3), Inplace (3), Panel (3), Splitter (2), Toolbar, each in chromium, firefox and webkit (69 Ng tests); Vue Accordion (2), BlockUI Default and FullScreen, Card Default, Card WithHeaderAndFooter in chromium and firefox only, Divider Horizontal, WithContent, WithContentVertical, Fieldset (3), Inplace (3), Panel (4), Splitter (2), Toolbar, each in chromium, firefox and webkit except as noted (65 Vue tests).
- Flagged, decision needed separately (5 tests):
  - U1: `Ng/ScrollPanel Default G3-B visual` and `Ng/ScrollPanel Default (hover) G3-B visual` in ng-firefox and ng-webkit (4 tests).
  - U2: `Vue/Card WithHeaderAndFooter G3-B visual` in vue-webkit (1 test).
- Also for the user's attention, proposed for acceptance: N1 (BlockUI FullScreen rounded corners) and N2 (Inplace Active button touching the input).

**(b) Accessibility rows to add to `ACCESSIBILITY_BASELINE.md`:** none proposed. There are 0 INTRODUCED rows.

---

## Task 9 decisions and final evidence

### User decisions (2026-10-05)

- **(a)** Accept the 134 proposed baselines (every changed G3-B visual test except U1 and U2), including N1 and N2.
- **U1, option (a):** also accept the 4 tests `Ng/ScrollPanel Default G3-B visual` and `Ng/ScrollPanel Default (hover) G3-B visual` in ng-firefox and ng-webkit as they currently render. No story change.
- **U2:** conditional acceptance of `Vue/Card WithHeaderAndFooter G3-B visual` in vue-webkit, only if the update run captured the normal, stable card. Outcome: both update attempts (the first update run and the single user-approved retry) captured the broken render (tall blank card with a broken-image icon; identical sha256 `60eeac78...fd750`). The user then ruled Option 1: leave U2 unaccepted. The broken render was not accepted; the pre-port baseline stays committed.
- **(b)** Zero changes to `docs/architecture/ACCESSIBILITY_BASELINE.md`. Confirmed unchanged.

**Final G3-B visual acceptance: 138 accepted screenshot changes + 1 intentionally unaccepted U2 WebKit test.**

The 138 accepted baselines are 73 Ng (69 + the 4 U1 tests) and 65 Vue, committed under `packages/{ng,vue}/e2e/g3b-aura-styles.spec.ts-snapshots/`. The 17 unchanged G3-B visual tests were not touched.

### U2 (known failing test)

- One known failing G3-B visual test: `Vue/Card WithHeaderAndFooter G3-B visual` in vue-webkit.
- Cause: the story's external CDN image (`primefaces.org`) makes the screenshot network-dependent.
- Normal rendering is demonstrated by the earlier stable retry evidence (`review/g3b-aura-styles-Vue-Card-WithHeaderAndFooter-G3-B-visual-vue-webkit-retry1`) and by the pre-port baseline. In the final targeted run all three attempts rendered the normal card (identical sha256 to that retry1 actual) and differ from the pre-port baseline by 2157 pixels, the same count as the reviewed stable retries.
- The baseline is intentionally not accepted and the pre-port PNG remains committed. The working-tree copy of the update run's broken PNG stays modified and unstaged and is not part of the commit.
- A follow-up to make the story deterministic is required, outside G3-B scope.

### Evidence

- Update run (`56d003f` tree, `--update-snapshots=changed`, group "G3-B visual"): exit 0, 156 passed; the modified PNG set equalled the 139 expected changed tests exactly, with no untracked PNGs.
- U2 single retry (approved baselines supplied, only U2 run): exit 0, 3 passed, nothing written; the extracted PNG had the same sha256 as the broken baseline, so the broken render was reproduced.
- Final targeted run (`run.sh g3b` on the staged tree, in which U2 is the committed pre-port baseline): 347 passed, 1 failed. The single failure is `Vue/Card WithHeaderAndFooter G3-B visual` in vue-webkit, a screenshot mismatch on all three attempts. Everything else passed: 155 of 156 visual, 42 of 42 layout, 150 of 150 accessibility.
- Validator on the final envelopes: `validate-g3b-accessibility.mjs ng`: OK, 75/75 reports, 0 introduced violations, 0 stale pre-existing rows. `vue`: OK, 75/75 reports, 0 introduced violations, 0 stale pre-existing rows.
- `docs/architecture/ACCESSIBILITY_BASELINE.md`: unchanged.

### Follow-ups (recorded, not G3-B scope)

- **U1:** the Angular ScrollPanel story does not create the intended 200x200 clipped panel because the `<u-scroll-panel>` custom-element root is inline and unstyled, so the hover screenshots do not visually demonstrate scroll-bar visibility. This is pre-existing story behaviour, not a G3-B regression. The browser layout checks remain the authoritative verification of bar visibility, position and hidden state. No G3-B CSS change is required or authorized.
- **U2:** the Vue Card WithHeaderAndFooter story loads its header image from an external CDN (`primefaces.org`), which makes its screenshot network-dependent (unstable first attempt in webkit; both baseline-update attempts captured the broken render). A follow-up is needed to make the story deterministic, with no story change in G3-B.
- **Spec §14 observation:** the Vue BlockUI stories' inline `height` and `border` do not reach the rendered BlockUI container because of the existing `inheritAttrs: false` in `BlockUI.vue`. Not G3-B scope, not an acceptance criterion, never a reason for a baseline change; the Vue story is not modified in G3-B.

## Verification (Plan Task 10)

Run on branch `feature/gap-064-g3b-containers`, tested at `cb6ec1b` (2026-10-05), Node 24.15.0 on the host. Raw logs live under `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/` (`local-test-results/t10-*.log`, `docker/ci-*.log`, `task-10-*.log`). The working tree held exactly one modified, unstaged file throughout: the rejected U2 capture `packages/vue/e2e/g3b-aura-styles.spec.ts-snapshots/Vue-Card-WithHeaderAndFooter-G3-B-visual-1-vue-webkit.png`. It was not staged, committed or reverted. Docker used `git archive HEAD`, so the CI simulation saw the committed pre-port U2 baseline.

### Step 1: suites, typecheck, SSR (host)

| Check                                                 | Result                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `@ultimate/uix-styled test`                           | 6 files, 15 tests passed                                      |
| `@ultimate/themes test` (includes G3-B fidelity test) | 19 files, 783 tests passed                                    |
| `@ultimate/vue-core test`                             | 20 files, 102 tests passed                                    |
| `@ultimate/vue test`                                  | 97 files, 1097 tests passed                                   |
| `@ultimate/react test`                                | 87 files, 856 tests passed                                    |
| `@ultimate/ng test`                                   | 92 files, 1083 tests passed                                   |
| `@ultimate/ng-core test`                              | 15 files, 62 tests passed                                     |
| `pnpm run test:scripts`                               | 134 tests, 134 pass, 0 fail (includes G3-B validator test)    |
| `pnpm run typecheck`                                  | exit 0 (ng, vue, react and all other packages)                |
| `playground-angular` build + `ng-ssr-chromium`        | build exit 0; 10 of 10 passed (SSR/hydration, GAP-078 styles) |

Note: the plan's `pnpm --filter @ultimate/ng test --watch=false` is rejected by pnpm (`Unknown option: 'watch'`). The ng and ng-core suites were therefore run as `pnpm --filter ... test -- --watch=false`. The SSR step ran on the host without needing anything unavailable.

### Step 2: CI simulation (Spec §9.6), Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, native arm64

| Framework | Step         | Exit | Detail                                                              |
| --------- | ------------ | ---- | ------------------------------------------------------------------- |
| ng        | strict run   | 0    | 308 passed, 1 flaky (passed on retry)                               |
| ng        | strict check | 0    | zero new violations outside `ACCESSIBILITY_BASELINE.md` (260 nodes) |
| ng        | G3-A run     | 0    | 189 passed                                                          |
| ng        | G3-A check   | 0    | OK, 93/93 reports, 0 introduced, 0 stale                            |
| ng        | G3-B run     | 0    | 174 passed                                                          |
| ng        | G3-B check   | 0    | OK, 75/75 reports, 0 introduced, 0 stale                            |
| vue       | strict run   | 0    | 281 passed, 1 flaky (passed on retry)                               |
| vue       | strict check | 0    | zero new violations outside `ACCESSIBILITY_BASELINE.md` (211 nodes) |
| vue       | G3-A run     | 0    | 207 passed                                                          |
| vue       | G3-A check   | 0    | OK, 102/102 reports, 0 introduced, 0 stale                          |
| vue       | G3-B run     | 1    | 173 passed, 1 failed: the U2 exception below, nothing else          |
| vue       | G3-B check   | 0    | OK, 75/75 reports, 0 introduced, 0 stale                            |
| react     | strict run   | 0    | 216 passed                                                          |
| react     | strict check | 0    | zero new violations outside `ACCESSIBILITY_BASELINE.md` (198 nodes) |

**Single expected exception (user ruling U2, 2026-10-05):** `[vue-webkit] packages/vue/e2e/g3b-aura-styles.spec.ts:44 Vue/Card WithHeaderAndFooter G3-B visual`. Screenshot mismatch of 2157 pixels on all three attempts, the same pixel count as the reviewed stable retries in "Task 9 decisions and final evidence". Cause: the story's external CDN image (`primefaces.org`). Its baseline was intentionally not accepted, so the committed pre-port baseline is compared against the post-port render. The test was not weakened, skipped or altered. No other test failed in the G3-B runs: all layout and accessibility tests passed in all three browsers per framework.

Flaky tests in the strict runs (both passed on a retry, runs exit 0, none in G3-A/G3-B scope): `[ng-webkit] button.spec.ts:69 Ng/Button Disabled story: accessibility scan` and `[vue-firefox] menu.spec.ts:100 Vue/Menu Default story: accessibility scan`.

### Step 3: scope and DOM (C4, C9), committed state `git diff fe86fe4 HEAD`

- Every changed path is in the allowed set: the 20 style modules; the 4 key files; the stories (13 files, 232 insertions, 0 deletions); the two G3-B e2e specs and their 156 snapshots; `packages/themes/test/{fixtures/primeuix-styles-g3b.json, utils/g3b-port.mjs, g3b-upstream-fidelity.test.ts}`; the two runtime specs; `docs/architecture/provenance/{ng,vue}.json`; `scripts/provenance/validate-g3b-accessibility.mjs` and its test; `.github/workflows/ci.yml`; the research docs, spec, plan (with Amendment A1) and this record. `MIGRATION.md` is not changed (Task 11 follows). `ACCESSIBILITY_BASELINE.md` and `PERFORMANCE.md` are unchanged.
- Component files: the only non-style, non-story source changes are the 4 key literals (`block-ui`→`blockui`, `scroll-panel`→`scrollpanel` in `packages/ng/src/block-ui/block-ui.ts`, `packages/ng/src/scroll-panel/scroll-panel.ts`, `packages/vue/src/block-ui/BaseBlockUI.ts`, `packages/vue/src/scroll-panel/BaseScrollPanel.ts`). Each is a one-line diff of the literal. No template, `classes`, input/prop/emit change.
- `git diff fe86fe4 HEAD --stat -- packages/react packages/react-core packages/uix-styled packages/uix-styles packages/themes/src packages/ng-core packages/vue-core`: empty.
- G3-A tooling (`validate-g3a-accessibility.mjs`, `validate-accessibility-baseline.mjs`, `g3a-port.mjs`, both G3-A e2e specs): `G3-A tooling unchanged`.

### Step 4: size gate (C8, B-7)

**Authoritative (Plan Review decision 2): direct build comparison.** `fe86fe4` built in a git worktree (`pnpm install --frozen-lockfile && pnpm run build`) and measured with `measure-package-size.mjs`, against the current build (HEAD `cb6ec1b`). The worktree was removed afterwards.

| Package        | `index.mjs` gzip, `fe86fe4` | `index.mjs` gzip, current | Growth           | dist/ size `fe86fe4` → current |
| -------------- | --------------------------- | ------------------------- | ---------------- | ------------------------------ |
| `packages/ng`  | 64.42 KB                    | 64.54 KB                  | +0.12 KB, +0.19% | 3152.2 KB → 3170.8 KB (+0.59%) |
| `packages/vue` | 136.15 KB                   | 137.09 KB                 | +0.94 KB, +0.69% | 5809.2 KB → 5861.4 KB (+0.90%) |

Both are far below the 15% hard stop.

**Additional check only: `validate-bundle-size.mjs --base-ref fe86fe4`** (exit 0, "all packages passed the bundle-size gate"). Rows: `ng: OK (202.86 KB -> 64.5 KB, -68.2%)` (the recorded Angular baseline in `PERFORMANCE.md` is stale, so this row is not meaningful as growth; known G3-A deferred limitation), `vue: OK (132.3 KB -> 137.1 KB, 3.6%)`, `ng-core: 2.2%`, `themes: 3.1%`, `uix-styled: 2.3%`, `vue-core: 2.1%`, `cli: 5.5%` (0.05 KB absolute), all other packages at or below 0.3%. No package is above 15%.

`pnpm run size:measure` and the build did not modify any tracked file (`git status --short` still shows only the U2 PNG). `PERFORMANCE.md` was not edited.

### Pre-existing failures (recorded, not fixed)

- **`pnpm run provenance:validate`: exit 1.** `[provenance:validate] FAIL: packages/ng/src/accordion/accordion.spec.ts has no entry in docs/architecture/provenance/ng.json`. The validator requires an entry for every ng/vue source file and reports a spec file that has no entry; this gap predates G3-B (the plan lists "missing ng/vue entries" as known on `main`). G3-B added its entries only for the 20 style modules (Task 7).
- **`pnpm run lint`: exit 1.** 58534 problems, dominated by generated output (`packages/{ng,react,vue}/storybook-static`, minified bundles) and lint debt in untouched source (`no-unused-expressions`, `no-unused-vars`). Linting only the files changed between `fe86fe4` and `HEAD` yields one error: `packages/ng/src/scroll-panel/scroll-panel.ts:350:29 '_event' is defined but never used`. It is on a line G3-B did not touch (the only change in that file is the key literal at line 89), and the same error is reported for the `fe86fe4` version of the file.
- **`pnpm run format:check`: exit 1** with Prettier debt across many files, including `BLUEPRINT_GAPS.md`, `DECISIONS.md`, `ACCESSIBILITY_BASELINE.md`, `PERFORMANCE.md` (documented debt) and, among files G3-B changed, `packages/ng/src/scroll-panel/scroll-panel.ts` and `packages/vue/src/scroll-panel/BaseScrollPanel.ts`, which fail Prettier at `fe86fe4` as well. All other G3-B-changed `.ts`, `.mjs`, `.json`, `.yml` and `.md` files pass Prettier.

### Result

All Task 10 checks pass, with the single user-ruled U2 exception (`Vue/Card WithHeaderAndFooter G3-B visual`, vue-webkit). No hard stop was triggered.
