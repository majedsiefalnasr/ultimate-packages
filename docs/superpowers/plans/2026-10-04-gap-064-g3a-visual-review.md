# GAP-064 G3-A Visual and Accessibility Review Record (Plan Task 8, Step 3)

**Status:** decisions (a)-(d) were taken by the user on 2026-10-04 and applied, apart from the held Toast items. The changes are staged and uncommitted, awaiting the user's review. Toast AllSeverities (U2) remains **blocked pending a Spec amendment**. Sections 1-7 and "Decisions requested" are the original pre-decision evidence. The outcome is in the final section, "Decisions taken and final verification".

**Branch / HEAD under review:** `feature/gap-064-g3a-display-feedback` @ `193fc33` (targeted and regression runs). The "pre-port" accessibility comparison run is `bdc0041`, the last commit before the CSS port.

**Evidence root:** `/tmp/g3a-docker` (ephemeral). Durable copies for the screenshots are in the git-ignored SDD workspace, see "Artifact locations".

## Artifact locations

- `T` = `/tmp/g3a-docker/g3a/test-results` (original, ephemeral).
- `A` = `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/.superpowers/sdd/2026-10-04-gap-064-g3a-display-feedback/task8-artifacts` (copy, git-ignored; 150 test directories, non-retry only).
- Review aid (not Playwright output): `.../task8-montages/<Ng|Vue>-<Story>.png` in the same SDD folder. Each is a chromium crop with the "before" (expected) image above the "after" (actual) image.
- Image path pattern, for every changed test in section 2 and for each browser `<b>` in `chromium|firefox|webkit`:

  ```text
  <T or A>/g3a-aura-styles-<Ng|Vue>-<Story>-G3-A-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-A-visual-1-expected.png
  <T or A>/g3a-aura-styles-<Ng|Vue>-<Story>-G3-A-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-A-visual-1-actual.png
  <T or A>/g3a-aura-styles-<Ng|Vue>-<Story>-G3-A-visual-<ng|vue>-<b>/<Ng|Vue>-<Story>-G3-A-visual-1-diff.png
  ```

  `<Story>` is the hyphenated name from the first column of section 2 (for example `Message-AllSeverities`). The `-retry1` and `-retry2` directories next to each hold the identical result of the retry attempts and are not copied.

---

## 1. Environment

| Item                            | Value                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Image                           | `mcr.microsoft.com/playwright:v1.63.0-jammy`                                                       |
| Architecture                    | aarch64                                                                                            |
| Node (in container)             | v24.20.0                                                                                           |
| pnpm                            | 9.6.0                                                                                              |
| `CI`                            | `true`                                                                                             |
| Source                          | `git archive HEAD` (193fc33) for both runs                                                         |
| Targeted G3-A run (Step 1a)     | log `g3a-193fc33.log`; container time 21:12:54-21:19:39; 5.2 min Playwright; 150 failed, 240 passed |
| Regression run (Step 1b)        | log `regression.log`; container time 21:19:39-21:25:30; 4.2 min Playwright; 835 passed             |
| Pre-port a11y run (`bdc0041`)   | log `g3a-bdc0041.log`; 390 passed (envelopes in `/tmp/g3a-docker/pre/test-results`)                |
| Screenshot tolerance            | `playwright.config.ts`: `expect.toHaveScreenshot.threshold = 0.2` (per-pixel YIQ), `maxDiffPixelRatio` unset |
| Validator Node (host)           | v24.15.0 (`$HOME/.nvm/versions/node/v24.15.0/bin`)                                                 |

---

## 2. Targeted G3-A run (Step 1a): changed screenshots

**Totals.** 390 tests = 195 visual + 195 accessibility. All 195 accessibility tests passed and wrote their envelope. Of the 195 visual tests, **150 failed and 45 passed**. Every one of the 150 failures is a `toHaveScreenshot` mismatch; there is no other kind of failure. Each failing test failed identically on all 3 attempts (retries 0, 1, 2): the pixel counts were recomputed from the saved images of every attempt and do not vary. No flake.

**Story x framework.** 65 stories (31 ng, 34 vue). **50 changed** (23 ng, 27 vue), each in **all three** browsers (3 x 50 = 150). **15 unchanged** (8 ng, 7 vue), unchanged in all three browsers (3 x 15 = 45 passed).

**Cross-framework observation.** For every story that exists in both frameworks, the ng "actual" and the vue "actual" images are **pixel-identical** in each browser, with one exception: Message (Default, Closable, AllSeverities). There Vue reserves an empty icon slot (about 26 px of left indent on info, success, warn and error; none on secondary and contrast), Angular does not. The "expected" images differ between frameworks (the pre-port state), so the differing pixel counts below reflect different "before" states, not different "after" states.

**How to read the pixel columns.** Numbers are Playwright's own "N pixels ... are different" from `g3a-193fc33.log` for chromium / firefox / webkit. They are counted after the 0.2 per-pixel tolerance, so low-contrast changes (light tint on white) are under-counted; see section 3.

Descriptions are of the chromium expected vs actual PNGs. Firefox and webkit were spot-checked (Toast in both, MeterGroup Vertical in webkit, Vue Terminal in firefox, Ng Message AllSeverities in webkit) and show the same change; the per-test pixel counts are of the same order across the three browsers. No browser-specific visible difference was found, but not every firefox and webkit image was individually viewed.

| Story (`<Story>`)           | FW  | Pixels diff (chromium / firefox / webkit) | Visible change (chromium)                                                                                                                                          |
| --------------------------- | --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Avatar-Label                | ng  | 12 / 27 / 38                              | Bare "AB" text becomes a 2rem rounded-square chip, light slate background (#e2e8f0), slate text.                                                                    |
| Avatar-Label                | vue | 12 / 27 / 38                              | Same as ng.                                                                                                                                                         |
| Avatar-Circle               | ng  | 12 / 27 / 38                              | Bare "AB" becomes a 2rem circle, light slate background. Identical count to Label (the square-to-circle change is invisible to the gate, see section 3).             |
| Avatar-Circle               | vue | 12 / 27 / 38                              | Same as ng.                                                                                                                                                         |
| Avatar-Large                | ng  | 127 / 128 / 132                           | Bare "AB" becomes a 3rem circle with larger text.                                                                                                                   |
| Avatar-Large                | vue | 127 / 128 / 132                           | Same as ng.                                                                                                                                                         |
| Avatar-Xl                   | ng  | 205 / 215 / 244                           | Bare "AB" becomes a 4rem rounded square with much larger text.                                                                                                      |
| Avatar-Xl                   | vue | 205 / 215 / 244                           | Same as ng.                                                                                                                                                         |
| Chip-Default                | ng  | 148 / 158 / 173                           | Pill grows (more padding, taller, larger label).                                                                                                                    |
| Chip-Default                | vue | 148 / 158 / 173                           | Same as ng.                                                                                                                                                         |
| Chip-WithIcon               | ng  | 163 / 180 / 164                           | Pill grows; an empty gap remains left of "Apple" where the `pi pi-apple` glyph would be (the icon font is not loaded in the Storybook pages, so the icon is empty). |
| Chip-WithIcon               | vue | 163 / 180 / 164                           | Same as ng.                                                                                                                                                         |
| Chip-Removable              | ng  | 434 / 473 / 444                           | Pill grows; the remove "x" stays on the right.                                                                                                                      |
| Chip-Removable              | vue | 434 / 473 / 444                           | Same as ng.                                                                                                                                                         |
| Tag-Default                 | ng  | 731 / 745 / 779                           | Solid grey pill with white text becomes a soft pale-green pill with dark-green bold text, larger.                                                                    |
| Tag-Default                 | vue | 731 / 745 / 779                           | Same as ng.                                                                                                                                                         |
| Tag-Severity                | ng  | 1004 / 1146 / 1222                        | Solid green "Success" pill becomes a pale-green pill with dark-green text.                                                                                          |
| Tag-Severity                | vue | 1004 / 1146 / 1222                        | Same as ng.                                                                                                                                                         |
| Tag-AllSeverities           | ng  | 5978 / 6486 / 6469                        | Six solid saturated pills become soft tinted pills with coloured text; "Contrast" stays solid near-black. Text is larger.                                           |
| Tag-AllSeverities           | vue | 5978 / 6486 / 6469                        | Same as ng.                                                                                                                                                         |
| Skeleton-*                  | -   | (unchanged, see section 3)                |                                                                                                                                                                     |
| OverlayBadge-Default        | ng  | 759 / 719 / 714                           | The red "2" badge moves from the left of the (empty-looking) host to the far right edge of the 1280 px wide host (absolute top-right plus translate).               |
| OverlayBadge-Default        | vue | 759 / 719 / 714                           | Same as ng.                                                                                                                                                         |
| OverlayBadge-DotOnly        | ng  | 72 / 64 / 74                              | The green dot moves from the left to the far right edge of the host, as above.                                                                                      |
| OverlayBadge-DotOnly        | vue | 72 / 64 / 74                              | Same as ng.                                                                                                                                                         |
| ProgressBar-Determinate     | ng  | 3821 / 3081 / 2302                        | Thin blue bar with no track becomes a rounded light track with a green (#10b981) fill and a bold white "60%".                                                      |
| ProgressBar-Determinate     | vue | 3083 / 3088 / 3084                        | Blue fill on grey track becomes green fill on a slightly bluish track with a bold label. After-image equals the ng after-image.                                     |
| ProgressBar-Indeterminate   | ng  | (unchanged, see section 3)                |                                                                                                                                                                     |
| ProgressBar-Indeterminate   | vue | 29879 / 29883 / 29879                     | Full-width static blue bar becomes an empty light track: the moving segment starts at `-35%` and Playwright freezes the infinite animation at its first frame.     |
| ProgressSpinner-Default     | ng  | 543 / 541 / 543                           | Small thin blue static ring becomes a larger (about 100 px) red arc spinner, the animation's first frame (the colour keyframe starts red).                           |
| ProgressSpinner-Default     | vue | 543 / 541 / 543                           | Same as ng.                                                                                                                                                         |
| MeterGroup-Default          | ng  | 982 / 1116 / 1056                         | Track and segments unchanged; labels become larger with wider gaps; track tint slightly bluish.                                                                     |
| MeterGroup-Default          | vue | 982 / 1116 / 1056                         | Same as ng.                                                                                                                                                         |
| MeterGroup-Vertical         | ng  | 1277 / 1328 / 1300                        | **UNEXPECTED (U1).** The vertical track and coloured segments disappear; only the two labels remain.                                                                |
| MeterGroup-Vertical         | vue | 1277 / 1328 / 1300                        | **UNEXPECTED (U1).** Same as ng.                                                                                                                                    |
| Timeline-Default            | ng  | 760 / 928 / 844                           | Three stacked open rings become Aura markers (white ring with a green dot) joined by a vertical connector line, with the events spaced apart.                       |
| Timeline-Default            | vue | 760 / 928 / 844                           | Same as ng.                                                                                                                                                         |
| Timeline-Horizontal         | ng  | 812 / 941 / 865                           | Markers on a thin connector line now span the full width evenly, labels sit further below; markers become ring-and-dot.                                             |
| Timeline-Horizontal         | vue | 812 / 941 / 865                           | Same as ng.                                                                                                                                                         |
| Terminal-Default            | ng  | 1675 / 1706 / 1745                        | Two black rounded blocks and monospace text at the top-left become a full-width light bordered box (about 300 px tall) with larger text.                            |
| Terminal-Default            | vue | 86172 / 81097 / 86165                     | The full-width dark (#1e1e1e) terminal with dim slate text becomes a full-width light bordered box with dark text (large pixel count because the dark fill goes).  |
| Message-Default             | ng  | 868 / 972 / 958                           | **First styling of the Angular message** (the `super.ngOnInit` fix in 09a1deb): plain text becomes a full-width blue-tinted bordered bar with blue text.            |
| Message-Default             | vue | 632 / 769 / 716                           | Shrink-wrapped tinted pill becomes a full-width, lighter-tinted bordered bar with an indent for the empty icon slot.                                                |
| Message-Closable            | ng  | 634 / 774 / 774                           | Plain text plus a native grey button becomes a full-width yellow (warn) bar with a small "x" at the right.                                                          |
| Message-Closable            | vue | 469 / 578 / 519                           | Tinted pill becomes a full-width, lighter yellow bar; "x" at the far right.                                                                                         |
| Message-AllSeverities       | ng  | 45291 / 49656 / 49573                     | Six unstyled text lines become six stacked, full-width tinted bordered bars (success, info, warn, error, secondary), "Contrast" is a dark navy bar.                 |
| Message-AllSeverities       | vue | 48318 / 53218 / 53014                     | A row of six small pills becomes six stacked full-width bars. Four of them have the empty icon indent; secondary and contrast do not.                                |
| InlineMessage-Default       | vue | 460 / 550 / 507                           | Red-tinted pill ("Something went wrong.") becomes a lighter-tinted bordered pill with an empty icon indent.                                                         |
| InlineMessage-Success       | vue | 369 / 479 / 457                           | Same change on the green "Saved successfully." pill.                                                                                                                |
| InlineMessage-AllSeverities | vue | 3374 / 3938 / 3846                        | The four tinted pills get the lighter Aura tint plus border; "Secondary" and "Contrast", previously unstyled text, become a light slate pill and a dark navy pill.   |
| Toast-AllSeverities         | ng  | 30802 / 43698 / 40222                     | **UNEXPECTED (U2).** Saturated shadowed cards with bold stacked summary/detail become flat light bordered cards; summary and detail now sit on one row, and the close "x" overlaps the summary text. |
| Toast-AllSeverities         | vue | 30802 / 43698 / 40222                     | **UNEXPECTED (U2).** Same as ng (pixel-identical).                                                                                                                  |

Changed story x framework count: 23 ng + 27 vue = 50. The Skeleton-* and ng ProgressBar-Indeterminate rows above are pointers to section 3 and are not counted.

Cross-check of the ng list: Avatar x4 (Label, Circle, Large, Xl), Chip x3, Tag x3, OverlayBadge x2, ProgressBar-Determinate, ProgressSpinner, MeterGroup x2, Timeline x2, Terminal, Message x3, Toast = 23. Vue adds ProgressBar-Indeterminate and InlineMessage x3 (and has no extra others) = 27.

---

## 3. Unchanged G3-A screenshots

**All 15 are recorded as "identical or inside the default tolerance". They cannot be told apart from the available evidence.** Playwright keeps no "actual" image for a passing test, and Docker was not to be re-run, so there is no fresh render to compare with the committed baseline. A pixel-for-pixel statement is therefore not possible for these 15.

| Story                       | Frameworks | Browsers    | Baseline content (committed "before")                                  | Status                                      |
| --------------------------- | ---------- | ----------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| Avatar-Icon                 | ng, vue    | all three   | Entirely white 1280x720 (blank) in all three browsers                  | identical or inside the default tolerance (see masking note) |
| Avatar-LocalImage           | ng, vue    | all three   | 32x32 blue (#60a5fa) square at (16,16) in all three browsers          | identical or inside the default tolerance   |
| Skeleton-Default            | ng, vue    | all three   | 1248x16 grey (#e5e7eb) bar at (16,16) in all three browsers           | identical or inside the default tolerance   |
| Skeleton-Circle            | ng, vue    | all three   | 64x64 grey circle at (16,16)                                           | identical or inside the default tolerance   |
| Knob-Default                | ng, vue    | all three   | knob SVG                                                               | identical or inside the default tolerance   |
| Knob-NoValueText            | ng, vue    | all three   | knob SVG without text                                                  | identical or inside the default tolerance   |
| Knob-Readonly               | ng, vue    | all three   | knob SVG                                                               | identical or inside the default tolerance   |
| ProgressBar-Indeterminate   | ng         | all three   | Entirely white 1280x720 (blank) in all three browsers                  | identical or inside the default tolerance (see masking note) |

Count: ng 8 (Avatar-Icon, Avatar-LocalImage, Knob x3, ProgressBar-Indeterminate, Skeleton-Default, Skeleton-Circle), vue 7 (the same without ProgressBar-Indeterminate). 8 + 7 = 15 story x framework; 45 browser tests.

**Masking note (a gate blind spot, not a defect in the port).** Playwright's default pixel threshold (0.2) ignores a pixel whose YIQ delta is at or below about 1409. A `#e2e8f0` box on white (the Aura avatar and track colour, seen in the Avatar-Label "actual") has a delta of about 300. So a light box or a light track appears as "no change". Two proofs inside this very run:

1. Avatar-Label and Avatar-Circle report **identical** pixel counts (12 / 27 / 38) although one is a square and the other a circle, because only the text pixels register.
2. The DOM in the accessibility envelope shows `<u-avatar class="u-avatar"><span class="pi pi-user u-avatar-icon">` for Avatar-Icon after the port, the same element that gets the new box in Avatar-Label.

So for Avatar-Icon (ng, vue) and ng ProgressBar-Indeterminate, the baseline is fully blank, the test passes, and the most likely state of the "actual" is a faint light box or track that the gate cannot see. This is an inference; the actual was not saved. See the blank-baseline check below and decision (d).

### Blank-baseline check (the 9 baselines the review was asked to verify)

Checked on the committed baseline PNGs (non-white bounding box and colour histogram) and on this run's results.

| Baseline (ng and vue unless noted) | "Before" content in chromium                      | Same in firefox / webkit?          | Changed in this run? | Does "actual" render content?                                                                 | Verdict          |
| ---------------------------------- | ------------------------------------------------- | ---------------------------------- | -------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Avatar-Icon (ng)                   | Fully blank                                       | Yes, blank in all three            | No                   | Not observable (passes). DOM has the avatar and icon; light box expected but under tolerance. | Not the flagged case; blind spot |
| Avatar-Icon (vue)                  | Fully blank                                       | Yes, blank in all three            | No                   | As above.                                                                                     | Not the flagged case; blind spot |
| Avatar-LocalImage (ng)             | **Not blank**: 32x32 blue square                  | Yes                                | No                   | Same size square (inside tolerance or identical).                                             | Premise did not hold |
| Avatar-LocalImage (vue)            | **Not blank**: 32x32 blue square                  | Yes                                | No                   | As above.                                                                                     | Premise did not hold |
| Skeleton-Default (ng)              | **Not blank**: 1248x16 grey bar                   | Yes                                | No                   | Grey bar (inside tolerance or identical).                                                     | Premise did not hold |
| Skeleton-Default (vue)             | **Not blank**: 1248x16 grey bar                   | Yes                                | No                   | As above.                                                                                     | Premise did not hold |
| OverlayBadge-DotOnly (ng)          | Near blank: 8x8 green dot at the left             | Yes (dot in all three)             | **Yes**              | **Yes**: the dot renders at the far right edge (see section 2).                               | Content renders  |
| OverlayBadge-DotOnly (vue)         | Near blank: 8x8 green dot at the left             | Yes                                | **Yes**              | **Yes**, same.                                                                                | Content renders  |
| ProgressBar-Indeterminate (ng)     | Fully blank                                       | Yes, blank in all three            | No                   | Not observable. The vue story renders an empty light track after the port and ng "after" images match vue's in every other shared story, so a light track is likely; it is under tolerance. | Not the flagged case; blind spot |

**Result:** no case where chromium stays blank while firefox or webkit render. Where the baseline is blank (Avatar-Icon x2, ng ProgressBar-Indeterminate) it is blank in **all three** browsers, so the blankness is a story or font property, not a chromium issue. Only OverlayBadge-DotOnly changed. The two "unchanged but blank" categories hide a likely real change from the pixel gate; this is raised in decision (d), not flagged UNEXPECTED under the stated rule.

Why the baselines are blank or near blank: the Storybook pages in Docker load no `pi` icon font, so an `<span class="pi pi-user">` and similar icon-only content has no glyph. The same missing font explains the empty gaps beside icons in the Chip-WithIcon, Message and InlineMessage "actual" images.

---

## 4. Existing regression suite (Step 1b)

Command scope: all existing specs in 9 Storybook projects plus 3 SSR projects, `--grep-invert "G3-A"`. React is regression coverage only.

**Result: 835 passed, 0 failed, 0 flaky, 0 skipped (4.2 min).** There are no retried tests to record.

Per project (counted from the pass lines of `regression.log`; they sum to 835):

| Project              | Passed | Failed | Flaky |
| -------------------- | ------ | ------ | ----- |
| ng-chromium          | 103    | 0      | 0     |
| ng-firefox           | 103    | 0      | 0     |
| ng-webkit            | 103    | 0      | 0     |
| vue-chromium         | 94     | 0      | 0     |
| vue-firefox          | 94     | 0      | 0     |
| vue-webkit           | 94     | 0      | 0     |
| react-chromium       | 72     | 0      | 0     |
| react-firefox        | 72     | 0      | 0     |
| react-webkit         | 72     | 0      | 0     |
| ng-ssr-chromium      | 10     | 0      | 0     |
| react-ssr-chromium   | 9      | 0      | 0     |
| vue-ssr-chromium     | 9      | 0      | 0     |
| **Total**            | **835**| **0**  | **0** |

No existing baseline changed and React shows no change. Nothing UNEXPECTED here.

---

## 5. UNEXPECTED items

Both were found by reading the images, then the story, DOM (axe envelope `html`) and ported CSS. Neither was reproduced in a live browser; the causes below are from source reading and are marked accordingly.

### U1. MeterGroup-Vertical (ng and vue): the vertical meter disappears

- **Observed.** Before: a vertical grey track with blue and green segments left of the labels. After: only the two labels "Apps (25%)" and "Photos (15%)" remain; no track and no segments (all three browsers).
- **Cause (source evidence).** The ported upstream rule `.u-meter-group-vertical .u-meter-group-meters { flex-direction: column; width: dt('metergroup.meters.size'); height: 100%; }` (line 23 of `packages/ng/src/meter-group/meter-group-style.ts`, same in vue). The story renders `<u-meter-group [value]="value" orientation="vertical">` with no height on any ancestor, so `height: 100%` is indefinite. The segments are `height: 25%` and `height: 15%` of that indefinite height, which resolve to 0. Upstream documentation sets an explicit container height for its vertical demo; this verification story does not.
- **Nature.** Not a mis-port. The CSS is upstream-faithful; the verification story lacks a height. It is still visually worse than the "before" image, so it is raised here and not accepted silently.
- **Resolution.** Resolved by a story-only fix; see the final section.

### U2. Toast-AllSeverities (ng and vue): layout broken, close button overlaps the summary

- **Observed.** After: summary and detail are on a single row ("success summary success detail"), the summary lost its bold weight, no shadow, and the close "x" is drawn on top of the end of the summary text. Identical in ng and vue, identical in all three browsers.
- **Cause (source evidence).** Two structural differences between Ultimate's markup and upstream's, both by design (FX-A7, no text wrapper):
  1. `.u-toast-message-content` is `display: flex` (row) and contains the summary and detail `div`s directly. Upstream wraps them in `p-toast-message-text`, a column flex container, which Ultimate does not render.
  2. The close `<button>` is a **sibling** of the content div inside the grid `.u-toast-message` (`packages/ng/src/toast/toast.ts` template), not a child of the flex content as upstream. The ported `.u-toast-close-button` has `position: relative; margin: -25% 0 0 0; right: -25%;`, which assumes the upstream placement, so it is pulled up over the content row.
- **Nature.** Port exposes a markup difference. A fix would need either a markup change (out of G3-A scope per C4) or a retained-literal adaptation, which is a Spec decision.
- **Resolution.** Held. Its baselines are not updated, and the Spec amendment comes before any Toast work; see the final section.

### Not UNEXPECTED, recorded so they are not mistaken for defects

- **Angular Message styled for the first time** (09a1deb, user-approved `super.ngOnInit` fix): the large ng Message changes are expected. Message-AllSeverities has 45291 / 49656 / 49573 differing pixels.
- **OverlayBadge anchors to the far right of a full-width host.** The host is a block, and Aura positions the badge absolute top-right. The dot and the badge are fully visible (not clipped). The story wraps only an icon whose font is not loaded.
- **ProgressBar-Indeterminate (vue) shows an empty track.** Infinite animations are frozen at their first frame, where the moving segment is outside the track. ProgressSpinner (red arc) is the same effect.
- **Empty icon slots** (Chip-WithIcon, Vue Message, Vue InlineMessage) come from the missing `pi` icon font in Docker.
- **ng and vue Terminal** lose the dark theme; the Aura terminal is light.
- **Chromium, firefox and webkit agree** on the changed tests that were spot-checked, and the pixel counts are of the same order everywhere; no browser-specific rendering break was seen.

---

## 6. Accessibility results

### 6.1 Regression set (existing specs; ng, vue, react)

`node scripts/provenance/validate-accessibility-baseline.mjs --check "/tmp/g3a-docker/regression/test-results/accessibility/<fw>/**/*.json"`

| Framework | Result | Nodes scanned |
| --------- | ------ | ------------- |
| ng        | OK     | 261           |
| vue       | OK     | 219           |
| react     | OK     | 198           |

### 6.2 Targeted G3-A set (new G3-A stories; ng, vue)

`node scripts/provenance/validate-accessibility-baseline.mjs --check "/tmp/g3a-docker/g3a/test-results/accessibility/<ng|vue>/**/*.json"`

- All 195 G3-A accessibility tests passed and wrote an envelope (31 ng stories and 34 vue stories x 3 browsers).
- **ng: FAIL, 297 rows not in the baseline. vue: FAIL, 330 rows not in the baseline.** Browser envelopes repeat each row three times (chromium, firefox, webkit).
- Comparison method: unique `rule|story|target` rows in the pre-port run (`bdc0041`, 228 rows, `a11y-pre.txt`) and the post-port run (`193fc33`, 209 rows, `a11y-post.txt`).

| Set                             | Rows | Meaning                                                                                |
| ------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| Pre-port                        | 228  | before the CSS port                                                                    |
| Post-port                       | 209  | after the CSS port                                                                     |
| Pre-existing (in both)          | 200  | not caused by the port                                                                 |
| **Introduced by the port**      | **9**| all `color-contrast`                                                                   |
| Removed by the port             | 28   | all `color-contrast`                                                                   |

`200 + 9 = 209` and `200 + 28 = 228`.

#### Introduced rows (verbatim; each repeated in chromium, firefox and webkit)

| Rule           | Story                              | Target                                                        | Ratio | Foreground / background |
| -------------- | ---------------------------------- | ------------------------------------------------------------- | ----- | ----------------------- |
| color-contrast | ng-message--all-severities         | `.u-message-success > .u-message-content > .u-message-text`   | 3.15  | #16a34a on #f1fdf5      |
| color-contrast | ng-message--all-severities         | `.u-message-warn > .u-message-content > .u-message-text`      | 2.84  | #ca8a04 on #fefce9      |
| color-contrast | ng-message--all-severities         | `.u-message-error > .u-message-content > .u-message-text`     | 4.44  | #dc2626 on #fef3f3      |
| color-contrast | ng-message--closable               | `.u-message-text`                                             | 2.84  | #ca8a04 on #fefce9      |
| color-contrast | vue-inlinemessage--all-severities  | `.u-inline-message-success > .u-inline-message-text`          | 3.15  | #16a34a on #f1fdf5      |
| color-contrast | vue-inlinemessage--all-severities  | `.u-inline-message-warn > .u-inline-message-text`             | 2.84  | #ca8a04 on #fefce9      |
| color-contrast | vue-inlinemessage--all-severities  | `.u-inline-message-error > .u-inline-message-text`            | 4.44  | #dc2626 on #fef3f3      |
| color-contrast | vue-inlinemessage--default         | `.u-inline-message-text`                                      | 4.44  | #dc2626 on #fef3f3      |
| color-contrast | vue-inlinemessage--success         | `.u-inline-message-text`                                      | 3.15  | #16a34a on #f1fdf5      |

All nine are 16 px normal-weight text (4.5:1 required). The ng Message rows are new because the Angular message was previously unstyled black text (it passed).

#### Removed rows (color-contrast; ratio is the pre-port value; each x3 browsers)

| Story                      | Target                                                          | Pre-port ratio (fg on bg)            |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| ng-tag--all-severities     | `.u-tag-danger > .u-tag-label`                                  | 3.76 (#ffffff on #ef4444)            |
| ng-tag--all-severities     | `.u-tag-info > .u-tag-label`                                    | 3.67 (#ffffff on #3b82f6)            |
| ng-tag--all-severities     | `.u-tag-success > .u-tag-label`                                 | 2.27 (#ffffff on #22c55e)            |
| ng-tag--all-severities     | `.u-tag-warn > .u-tag-label`                                    | 2.14 (#ffffff on #f59e0b)            |
| ng-tag--severity           | `.u-tag-label`                                                  | 2.27 (#ffffff on #22c55e)            |
| ng-terminal--default       | `.u-terminal-prompt-label`                                      | 1.61 (#334155 on #1e1e1e)            |
| ng-terminal--default       | `.u-terminal-welcome-message`                                   | 1.61 (#334155 on #1e1e1e)            |
| ng-terminal--default       | `input`                                                         | 1.61 (#334155 on #1e1e1e)            |
| ng-toast--all-severities   | `.u-toast-message-error > .u-toast-message-content > .u-toast-detail`   | 3.95 (#dc2626 on #fee2e2)    |
| ng-toast--all-severities   | `.u-toast-message-info > .u-toast-message-content > .u-toast-detail`    | 4.23 (#2563eb on #dbeafe)    |
| ng-toast--all-severities   | `.u-toast-message-info > .u-toast-message-content > .u-toast-summary`   | 4.23 (#2563eb on #dbeafe)    |
| ng-toast--all-severities   | `.u-toast-message-success > .u-toast-message-content > .u-toast-detail` | 3 (#16a34a on #dcfce7)       |
| ng-toast--all-severities   | `.u-toast-message-warn > .u-toast-message-content > .u-toast-detail`    | 2.73 (#ca8a04 on #fef9c3)    |
| vue-message--all-severities| `.u-message-info > .u-message-content > .u-message-text`        | 4.23 (#2563eb on #dbeafe)            |
| vue-message--default       | `.u-message-text`                                               | 4.23 (#2563eb on #dbeafe)            |
| vue-tag--all-severities    | `.u-tag-danger > .u-tag-label`                                  | 3.76 (#ffffff on #ef4444)            |
| vue-tag--all-severities    | `.u-tag-info > .u-tag-label`                                    | 3.67 (#ffffff on #3b82f6)            |
| vue-tag--all-severities    | `.u-tag-success > .u-tag-label`                                 | 2.27 (#ffffff on #22c55e)            |
| vue-tag--all-severities    | `.u-tag-warn > .u-tag-label`                                    | 2.14 (#ffffff on #f59e0b)            |
| vue-tag--severity          | `.u-tag-label`                                                  | 2.27 (#ffffff on #22c55e)            |
| vue-terminal--default      | `.u-terminal-prompt-label`                                      | 1.61 (#334155 on #1e1e1e)            |
| vue-terminal--default      | `.u-terminal-welcome-message`                                   | 1.61 (#334155 on #1e1e1e)            |
| vue-terminal--default      | `input`                                                         | 1.61 (#334155 on #1e1e1e)            |
| vue-toast--all-severities  | `.u-toast-message-error > .u-toast-message-content > .u-toast-detail`   | 3.95 (#dc2626 on #fee2e2)    |
| vue-toast--all-severities  | `.u-toast-message-info > .u-toast-message-content > .u-toast-detail`    | 4.23 (#2563eb on #dbeafe)    |
| vue-toast--all-severities  | `.u-toast-message-info > .u-toast-message-content > .u-toast-summary`   | 4.23 (#2563eb on #dbeafe)    |
| vue-toast--all-severities  | `.u-toast-message-success > .u-toast-message-content > .u-toast-detail` | 3 (#16a34a on #dcfce7)       |
| vue-toast--all-severities  | `.u-toast-message-warn > .u-toast-message-content > .u-toast-detail`    | 2.73 (#ca8a04 on #fef9c3)    |

None of these 28 rows has an entry in `ACCESSIBILITY_BASELINE.md` (no tag, terminal, toast, message or progress-bar story is listed there), so nothing in the baseline goes stale.

#### Pre-existing rows whose ratio changed (same row key, so not "introduced")

The row key does not include the ratio, so a changed ratio on an existing row is invisible to the comparison. Worth knowing for decision (b) and (c):

| Story                                 | Target                                             | Pre-port | Post-port |
| ------------------------------------- | -------------------------------------------------- | -------- | --------- |
| ng-progressbar--determinate, vue-progressbar--determinate | `.u-progress-bar-label`        | 3.67 (#ffffff on #3b82f6) | **2.53** (#ffffff on #10b981) |
| ng-toast--all-severities, vue-toast--all-severities | `.u-toast-message-error > ... > .u-toast-summary` | 3.95 | 4.44 |
| ng-toast--all-severities, vue-toast--all-severities | `.u-toast-message-success > ... > .u-toast-summary` | 3 | 3.15 |
| ng-toast--all-severities, vue-toast--all-severities | `.u-toast-message-warn > ... > .u-toast-summary` | 2.73 | 2.84 |
| vue-message--all-severities | `.u-message-error / -success / -warn > ... > .u-message-text` | 3.95 / 3 / 2.73 | 4.44 / 3.15 / 2.84 |
| vue-message--closable      | `.u-message-text`                                | 2.73 | 2.84 |

The ProgressBar label ratio gets worse (3.67 to 2.53); the others improve slightly but stay below 4.5:1. (The same #10b981 white-on-green 2.53 value already has an approved parity exception for `ng-badge--large` in the baseline.)

#### The 200 pre-existing rows (not caused by the port)

| Rule                    | Unique rows | Kind                                                              |
| ----------------------- | ----------- | ----------------------------------------------------------------- |
| landmark-one-main       | 65          | page-level (one per story, target `html`)                         |
| page-has-heading-one    | 65          | page-level (one per story, target `html`)                         |
| region                  | 40          | page-level (`#storybook-root`)                                    |
| color-contrast          | 12          | CSS (ratios in the table above)                                   |
| aria-progressbar-name   | 6           | DOM                                                               |
| aria-meter-name         | 4           | DOM                                                               |
| aria-command-name       | 2           | DOM (chip remove icon)                                            |
| image-alt               | 2           | DOM                                                               |
| label                   | 2           | DOM                                                               |
| svg-img-alt             | 2           | DOM                                                               |

Apart from the 12 color-contrast rows, none is CSS-dependent: they are identical before and after the port.

---

## 7. C5 coverage checklist

"Ported / adapted / retained" are the Spec §5.2 families (ported = identical-name or renamed upstream group; adapted = parity exception PX-A1, PX-A2, PX-A3; retained = Ultimate-only literals PX-A4, PX-A5, PX-A6). Group listings come from `node packages/themes/test/utils/g3a-port.mjs <ng|vue> <key>`; ng and vue emit identical CSS for every shared key (only `inlinemessage` is Vue-only). Screenshots freeze infinite animations and render no icon-font glyphs, so those groups are only exercised structurally. A group marked "not exercised" has no screenshot story that triggers it; that is a coverage gap in the verification set, not a failure.

| Key             | Family (ported / adapted / retained)                                                                                                 | Story that exercises it                                                                                              | Not exercised by any story                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| avatar          | Ported: base `.u-avatar`, `-image`, `-circle` (+ `img`), `-icon`, `img`, `-lg` (+ icon), `-xl` (+ icon)                              | Avatar-Label (base, text), Avatar-Circle (`-circle`), Avatar-Large (`-lg`), Avatar-Xl (`-xl`), Avatar-Icon (`-icon`), Avatar-LocalImage (`-image`, `img`) | `.u-avatar-circle img`; `-lg .u-avatar-icon`, `-xl .u-avatar-icon` (Large and Xl use a label)               |
| chip            | Ported: base, `-icon`, `-image`, `:has(-remove-icon)`, `:has(-image)`, `-remove-icon` (+ focus-visible), `-label`. Retained: PX-A5 `.u-chip-label` | Chip-Default (base, label), Chip-WithIcon (`-icon`), Chip-Removable (`-remove-icon`, `:has(-remove-icon)`)           | `-image`, `:has(-image)`, `-remove-icon:focus-visible`                                                       |
| tag             | Ported: base, `-icon`, `-rounded`, six severities (success, info, warn, danger, secondary, contrast)                                | Tag-Default (base), Tag-Severity (success), Tag-AllSeverities (all six)                                              | `-icon`, `-rounded`                                                                                          |
| skeleton        | Ported: base, `-circle`. Adapted: PX-A3 (`.u-skeleton-wave::after`, its `[dir=rtl]` variant, 2 keyframes). Retained: PX-A6 `.u-skeleton { position: relative }` | Skeleton-Default (base, wave, PX-A6), Skeleton-Circle (`-circle`)                                                   | the wave animation itself (frozen), RTL variant                                                              |
| overlaybadge    | Ported: `.u-overlaybadge`, `.u-overlaybadge .u-badge`, its `:dir(rtl)` variant                                                      | OverlayBadge-Default (value badge), OverlayBadge-DotOnly (dot)                                                       | RTL variant                                                                                                  |
| knob            | Ported: `-range`, `-value`, `-text`, `svg`, `svg:focus-visible`, `u-knob-dash-frame` keyframe                                       | Knob-Default (range, value, text, svg), Knob-NoValueText, Knob-Readonly                                              | `svg:focus-visible`                                                                                          |
| progressbar     | Ported: base, `-value`, `-label`, indeterminate `::before` and `::after`, 4 keyframes. Adapted: PX-A1 (2 `:not(.u-progress-bar-indeterminate)` groups) | ProgressBar-Determinate (base, value, label, PX-A1), ProgressBar-Indeterminate (indeterminate groups, first frame)    | keyframe motion (frozen)                                                                                     |
| progressspinner | Ported: base, `::before`, `-spin`, `-circle`, 3 keyframes                                                                           | ProgressSpinner-Default (all groups, first frame)                                                                    | keyframe motion (frozen)                                                                                     |
| metergroup      | Ported: base, meters, label-list, label, label-marker, label-icon, vertical groups. Adapted: PX-A2 (5 `:not(.u-meter-group-vertical)` and `:not(...-label-list-vertical)` groups) | MeterGroup-Default (PX-A2 horizontal groups, meters, label-list, label, marker), MeterGroup-Vertical (vertical groups; see U1) | `-label-icon` (items carry no icon)                                                                         |
| timeline        | Ported: base, vertical event/separator/marker (+ `::before`/`::after`)/connector/content/opposite, `-horizontal` groups             | Timeline-Default (vertical), Timeline-Horizontal (horizontal)                                                        | `-event-opposite` (the stories supply no opposite template)                                                  |
| terminal        | Ported: base, `-prompt`, `-prompt-value`, `-prompt-label`, `-command-response`. Retained: PX-A5 `.u-terminal-welcome-message`, `.u-terminal-command` | Terminal-Default (base, prompt, prompt-value, prompt-label, welcome message)                                         | `-command-response`, `-command` (no command is run)                                                          |
| message         | Ported: base, `-content`, `-icon`, `-close-button` (+ focus-visible, per-severity hover and focus), six severities, `-text`          | Message-Default (info), Message-Closable (warn, `-close-button`), Message-AllSeverities (all six)                    | close-button hover and focus-visible; `-icon` is covered only structurally (Vue reserves the slot)           |
| inlinemessage (Vue) | Ported: base, `-text`, `-icon`, six severities (each with its icon rule)                                                         | InlineMessage-Default (error), InlineMessage-Success, InlineMessage-AllSeverities (all six)                          | `-icon` glyph (icon font not loaded)                                                                         |
| toast           | Ported: `.u-toast`, `-message`, `-message-content`, `-summary`, `-detail`, `-close-button` (+ rtl, focus-visible), six severities (+ detail, hover, focus), `-top-center`, `-bottom-center`, `-center` transforms. Retained: PX-A4 (fixed positioning and the 7 position rules) | Toast-AllSeverities (message, content, summary, detail, close button, six severities, default top-right position; see U2) | other positions (`-top-left`, `-bottom-*`, `-center` families), RTL, hover and focus-visible                 |

---

## Decisions requested

The user decides every item below. This record recommends nothing and applies nothing.

### (a) Baselines to update

All 50 changed story x framework items, each x3 browsers (150 baseline PNGs), listed in section 2. For reference, with the test-title form used by the Plan's `<grep>` (`Ng/<Name> G3-A visual`, `Vue/<Name> G3-A visual`):

- **Ng (23):** Avatar Label, Avatar Circle, Avatar Large, Avatar Xl, Chip Default, Chip WithIcon, Chip Removable, Tag Default, Tag Severity, Tag AllSeverities, OverlayBadge Default, OverlayBadge DotOnly, ProgressBar Determinate, ProgressSpinner Default, MeterGroup Default, MeterGroup Vertical, Timeline Default, Timeline Horizontal, Terminal Default, Message Default, Message Closable, Message AllSeverities, Toast AllSeverities.
- **Vue (27):** the same 23 names, plus ProgressBar Indeterminate, InlineMessage Default, InlineMessage Success and InlineMessage AllSeverities (23 + 4 = 27).

Two of the 50 are the UNEXPECTED items. The user decides, per item, whether to accept the current rendering as the new baseline, hold the baseline back, or ask for a story or markup change first:

- MeterGroup Vertical (ng, vue): U1.
- Toast AllSeverities (ng, vue): U2.

### (b) Accessibility rows: 9 introduced rows, as candidate "GAP-064 G3-A - upstream Aura parity exception" rows

If the user approves, these would be added to `docs/architecture/ACCESSIBILITY_BASELINE.md` in the existing row format (`color-contrast:<story>:<target>`), each with a reason of the form "upstream Aura palette parity exception (GAP-064 G3-A)". Each row stands for the framework-specific story and target shown in section 6.2:

1. `color-contrast:ng-message--all-severities` x3 targets (success 3.15, warn 2.84, error 4.44)
2. `color-contrast:ng-message--closable` (warn 2.84)
3. `color-contrast:vue-inlinemessage--all-severities` x3 targets (success 3.15, warn 2.84, error 4.44)
4. `color-contrast:vue-inlinemessage--default` (error 4.44)
5. `color-contrast:vue-inlinemessage--success` (success 3.15)

Related facts for the decision: the 12 pre-existing color-contrast rows have changed ratios (section 6.2); the ProgressBar label drops to 2.53, which is the same value as an already-approved parity exception (`ng-badge--large`); the 28 removed rows are not in the baseline, so no cleanup is needed.

### (c) Pre-existing page-level and DOM rows on the new G3-A stories

The 200 pre-existing rows (section 6.2) are not caused by the port. Without them in `ACCESSIBILITY_BASELINE.md`, the G3-A validator check stays red (ng: 297 rows, vue: 330 rows, repeated per browser). The user decides whether to:

- add all 200, or only a subset (page-level `landmark-one-main` / `page-has-heading-one` / `region` = 170 rows; DOM `aria-*-name`, `image-alt`, `label`, `svg-img-alt` = 18 rows; `color-contrast` = 12 rows, already covered by (b) only if their ratios are accepted), or
- leave them out and accept a red G3-A validator check.

### (d) Additional decision raised by this review (not in the original three)

The tolerance masks light-on-white changes (section 3). Avatar-Icon (ng, vue) and ng ProgressBar-Indeterminate have fully blank baselines and pass, although the new CSS very likely draws a light `#e2e8f0` box or track. Updating them requires forcing the update (a normal "changed only" update skips passing tests). The user decides whether to refresh these three baselines, to add a story that makes the change visible (for example a darker background), or to leave them.

---

## Decisions taken and final verification (2026-10-04)

### User decisions

| Item | Decision |
| ---- | -------- |
| (a) Baselines | Accept the 46 non-UNEXPECTED changed story x framework results. Hold MeterGroup Vertical (ng, vue) until a story-only fix is rerun and reviewed. Hold Toast AllSeverities (ng, vue). |
| U1 MeterGroup Vertical | Story-only fix: give the vertical meter a fixed-height container. No change to the component or its G3-A CSS. |
| U2 Toast AllSeverities | **Blocked pending a G3-A Spec amendment.** The amendment chooses either an Ultimate-specific structural CSS adaptation that keeps the DOM, or a markup change (needs a scope decision, since C4 forbids DOM changes). No CSS or markup workaround until then. The 6 Toast baselines (ng and vue x 3 browsers) stay at their pre-port state. |
| (b) 9 introduced rows | Approved as "GAP-064 G3-A — upstream Aura parity exception". The Aura colours are unchanged (Badge precedent). |
| (c) 200 pre-existing rows | **Not added** to `ACCESSIBILITY_BASELINE.md`. They are page-level or DOM accessibility debt that predates G3-A. They include the ProgressBar label row (3.67 → 2.53), which is not a baseline row. The authoritative G3-A check is the introduced-vs-pre-port comparison below. |
| (d) Tolerance masking | Keep the existing baselines. Avatar-Icon (ng, vue) and ng ProgressBar-Indeterminate are not force-refreshed. The masking note in section 3 stands as an explicit limitation of the screenshot gate. |

### Applied changes (staged, uncommitted)

- **MeterGroup Vertical story fix (U1):**
  - `packages/vue/src/meter-group/meter-group.stories.ts`: the vertical story renders inside `<div style="display: flex; height: 12rem">`.
  - `packages/ng/src/meter-group/meter-group.stories.ts`: same wrapper, **and** `style="display: flex"` on `<u-meter-group>`.
  - Angular finding, accepted by the user as a story-level layout requirement: the Angular host element is a block box. A fixed-height parent alone gives the inner `.u-meter-group` root no definite height, and `.u-meter-group-meters { height: 100% }` then collapses again. Making the host a flex container stretches the root to the definite height. Vue needs only the wrapper, because the component root is the flex item.
- **Accessibility baseline:** the 9 approved rows were added to `docs/architecture/ACCESSIBILITY_BASELINE.md`. The 4 ng rows sit at the end of the ng section and the 5 vue rows at the end of the vue section. Fingerprints are exact, and the ratios and colours come from section 6.2.
- **Screenshot baselines:**
  - Docker `run.sh update '^(?!.*Toast AllSeverities).*G3-A visual'` with `--update-snapshots=changed`, on the staged tree `7eea5b0`. Result: 189 passed.
  - **144 baseline PNGs updated**: 48 story x framework tests x 3 browsers, which is the 46 accepted plus MeterGroup Vertical ng and vue.
  - **6 Toast PNGs held.**
  - "changed only" left every passing test's baseline as it was, including Avatar-Icon, Avatar-LocalImage, Knob, Skeleton and ng ProgressBar-Indeterminate.
  - Avatar Label and Circle **were** updated. Their screenshots actually failed (the text changed), and they are among the 46 accepted. Only their light `#e2e8f0` background sits under the tolerance.
- **MeterGroup Vertical review:** the new ng and vue PNGs were inspected (chromium, firefox, webkit). Each shows the light track with the blue 25% and green 15% segments at the right proportions on the 12rem bar. U1 is resolved.

### Final verification (staged tree `f6b9627`, Docker, same image and environment as section 1)

| Run | Result |
| --- | ------ |
| Targeted G3-A (`run.sh g3a`, log `/tmp/g3a-docker/g3a-final.log`) | **384 passed, 6 failed (3.6 min).** The 6 failures are exactly the held `Ng/Toast AllSeverities` and `Vue/Toast AllSeverities` G3-A visual tests in chromium, firefox and webkit. Every failure is `toHaveScreenshot` (18 error lines including retries). All 195 G3-A accessibility tests passed. |
| Regression (`run.sh regression`, log `/tmp/g3a-docker/regression-final.log`) | **834 passed, 1 flaky, 0 failed (6.2 min).** Per project: ng 103/103/103, vue 94/94/94, react 72/72/71 + 1 flaky (webkit), ng-ssr 10, react-ssr 9, vue-ssr 9. |

**Flake:** `[react-webkit] packages/react/e2e/button.spec.tsx:92 › React/Button › Danger story: accessibility scan`. The first attempt failed with `Error: frame.evaluate: Error: Axe is already running. Use \`await axe.run()\` to wait for the previous run to finish before starting a new run.` (an axe-harness race in `packages/react/e2e/accessibility-envelope.ts:79`), and it passed on retry #1. React has no G3-A change. This flake is not caused by G3-A.

**Accessibility:**

| Check | Result |
| ----- | ------ |
| Regression ng | OK, 261 nodes, zero new violations |
| Regression vue | OK, 217 nodes, zero new violations |
| Regression react | OK, 197 nodes, zero new violations |
| G3-A introduced rows (final unique `rule\|story\|target` rows not in the baseline, minus pre-port `bdc0041` rows) | **0, PASS.** All 9 introduced rows are now accounted for by the approved parity exceptions. |
| G3-A pre-existing rows (informational, intentionally excluded) | 200 unique rows: landmark-one-main 65, page-has-heading-one 65, region 40, color-contrast 12 (ratios changed, including ProgressBar label 3.67 → 2.53), aria-progressbar-name 6, aria-meter-name 4, aria-command-name 2, image-alt 2, label 2, svg-img-alt 2. |
| G3-A removed rows | 28 relative to pre-port. None is in the baseline, so no cleanup is needed. |
| Raw aggregate validator on the G3-A envelopes | ng FAIL 285, vue FAIL 315. These are the 200 pre-existing rows repeated per browser, all excluded by decision (c). It is not the G3-A acceptance check. |

The regression node counts differ slightly from the first run (vue 219 → 217, react 198 → 197). Both are still OK with zero new violations.

### Open item

- **U2 Toast AllSeverities:** blocked. Next step is a G3-A Spec amendment, then a Plan/Spec Review update, before any Toast implementation. The 6 Toast screenshot tests fail by design until then.

### User acceptance of Task 8 (2026-10-04)

- The user accepted the Task 8 state as the final visual-review state:
  - 144 baselines accepted;
  - 6 Toast baselines held;
  - U1 resolved at story level, with the Angular `display: flex` requirement;
  - component CSS unchanged;
  - 9 contrast exceptions approved;
  - 200 pre-existing rows intentionally excluded;
  - the regression flake recorded as unrelated;
  - the Avatar tolerance limitation kept.
- **The strict validator is not green.** G3-A-introduced violations: **0 unaccounted**. The repository's strict validator (`validate-accessibility-baseline.mjs --check`) still reports the intentionally excluded pre-existing rows on the G3-A stories. The introduced-vs-pre-port comparison is the G3-A-specific acceptance evidence only. It **does not replace** the repository-wide strict validator.

### CI validation-contract issue (found 2026-10-04, unresolved, blocks closeout)

- `.github/workflows/ci.yml` job `track-a-browser-visual-a11y` (matrix ng/react/vue):
  - runs **every** Playwright spec of the framework's three browser projects, including `packages/{ng,vue}/e2e/g3a-aura-styles.spec.ts`;
  - then runs `validate-accessibility-baseline.mjs --check "test-results/accessibility/<fw>/**/*.json"`.
- The validator has exactly two modes, `--check` and `--report` (PD-11). `--check` fails on **any** fingerprint absent from `ACCESSIBILITY_BASELINE.md`. It has no notion of "introduced relative to a base ref".
- Consequence: once the G3-A specs land, the ng and vue `track-a-browser-visual-a11y` jobs fail on the 200 excluded pre-existing rows. The G3-A stories add new story IDs, so their page-level and DOM debt becomes visible to the check. The ng and vue jobs also fail on the 6 held Toast screenshots until U2 is resolved.
- The current CI contract cannot express "baseline only newly introduced violations". Per the user's ruling this is reported as a CI/validation-contract issue. No unrelated accessibility debt was added to the baseline, and no validator or CI change was made.

## Amendment A2: Toast review

**Status: awaiting the user's decision.** This section is the Task 15 review gate for Plan Addendum A2 (Toast markup alignment, Spec §15.6 D-A2-1..6). It records evidence only. No baseline PNG has been changed, no Docker run was made for this section, and nothing is committed by it. The 6 Toast baselines stay held until the user approves them explicitly.

### A2.1 Environment and commits

- **Environment:** Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, aarch64, node v24.20.0, pnpm 9.6.0, `CI=true`. Source commit: `75671c4`.
- **Implementation commits:**
  - `04713a6` docs (amendment A2 approved, CI verification recorded);
  - `fb8468f` RED tests (Toast structure and measured-layout tests);
  - `b1281be` the `.u-toast-message-text` CSS, a verbatim upstream port, `COUNTS.toast` `[37, 5]`;
  - `75671c4` the markup (ng `toast.ts`, vue `Toast.vue`, and the one `messageText` class entry in each `toast-style.ts`);
  - `98dcd5d` the evidence re-identification (6 Toast contrast rows).
- **Artifacts** (git-ignored SDD workspace; each directory holds `*-expected.png` (the held baseline), `*-actual.png` (post-A2) and `*-diff.png`): `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/.superpowers/sdd/2026-10-04-gap-064-g3a-display-feedback/a2-artifacts/`, 6 directories named `g3a-aura-styles-{Ng,Vue}-Toast-AllSeverities-G3-A-visual-{ng,vue}-{chromium,firefox,webkit}`.

### A2.2 RED evidence (Task 11)

- **Unit:** ng and vue each have 12 Toast tests. Only the 2 new ones failed. The failure was that the first content child was `u-toast-summary`, not `u-toast-message-text`.
- **Docker layout run on `fb8468f`:** 6/6 failed at `expect(message.locator(".u-toast-message-content .u-toast-close-button")).toHaveCount(1)`, Received 0. This is the containment assertion, because the old close button was outside the content row. The box assertions (stacking and close-button geometry) were **not reached** in RED.
- **Note on the plan's prediction:** the plan predicted a failure at a box assertion. That prediction was imprecise. The controller recorded a ruling accepting the containment failure as a valid RED. Earlier evidence of the stacking failure comes from the Task 8 pre-A2 screenshots (section 5, U2), where summary and detail sat on one row, not from this RED run.

### A2.3 GREEN evidence (Task 13)

- ng `toast.spec` 12/12; full ng 1033 pass.
- vue full 1048 pass.
- Both typechecks clean.
- Fidelity 99/99; runtime ng 81/81, vue 93/93.

### A2.4 Bounded-diff output (Task 13 Step 5)

- **Check 1** (`git diff -w -U0 fa5c150` on the Toast templates):
  - ng: `+<div [class]="cx('messageText')">`, `+<div>`, `+</div>`, `+</div>`.
  - vue: `+<div :class="cx('messageText')">`, `+<div v-if="message.closable !== false">`, `-v-if="message.closable !== false"`, `+</div>`, `+</div>`.
- **Check 2** (other G3-A components): empty.
- **Check 3** (Toast style modules): exactly `+  messageText: "u-toast-message-text",`, twice (one per framework).

### A2.5 Task 14 Docker run on `75671c4`

| Run | Result |
| --- | ------ |
| `g3a` | **390 passed, 6 failed.** The 6 failures are exactly the held `Ng/Toast AllSeverities G3-A visual` and `Vue/Toast AllSeverities G3-A visual` in chromium, firefox and webkit, all `toHaveScreenshot`. |
| `Ng/Toast AllSeverities G3-A layout`, `Vue/Toast AllSeverities G3-A layout` | **PASSED in all 3 browsers each (6/6).** |
| Regression | **835 passed, 0 failed, 0 flaky.** |

### A2.6 Layout proof (D-A2-5.2 and D-A2-5.3)

- **Stacking, the explicit proof:** the assertion `detail.y >= summary.y + summary.height - 0.5` passed for **all 6 messages in all 3 browsers, for each framework**. Summary and detail are vertically stacked without overlap.
- **Close-button assertions, also passed:**
  - the button is inside `.u-toast-message-content` (count 1);
  - `close.x >= text right edge - 0.5`;
  - `close.x >= max(summary right edge, detail right edge) - 0.5`;
  - the button's right edge is within the message;
  - `close.y >= message top - 0.5`.

### A2.7 Visual description (6 Toast screenshots)

Each PNG is 1280x720 with the 6 messages (success, info, warn, error, secondary, contrast) stacked in the top-right corner. Compared with the held expected PNG, every actual shows the summary above the detail, the close button at the top-right end of the row, and no overlap in any message.

| Framework | Browser | Actual (post-A2) |
| --------- | ------- | ---------------- |
| ng | chromium | Serif UI font (same as the held baseline). Light severity-tinted fill, thin same-hue border, small radius, faint shadow. Normal-weight coloured summary above a dark-grey detail, 68px cards on a 16px gap. Small "x" at the top-right in the severity colour. Contrast card is dark navy. |
| ng | firefox | Sans-serif font. Same light tinted fill and thin border. Summary above detail with a visible gap between them, 74px cards on a 16px gap. "x" at the top-right in the severity colour. Contrast card is dark navy. |
| ng | webkit | Sans-serif font, close glyph slightly larger than in firefox. Summary above detail, 73px cards on a 16px gap. "x" at the top-right. Contrast card is dark navy with a faint lighter edge on its corners. |
| vue | chromium | Pixel-for-pixel the same look as ng chromium. |
| vue | firefox | Same look as ng firefox. |
| vue | webkit | Same look as ng webkit. |

**Differences from the held baseline (expected PNG), as seen:**
- The held baseline has solid, saturated tinted fills, bold summaries, a coloured detail line, a soft drop shadow, no border, 58 to 64px cards on a tight 8px gap, and a near-black contrast card.
- The post-A2 render has pale tinted fills with a thin border, normal-weight summaries, a dark-grey neutral detail, taller cards on a 16px gap, and a navy contrast card.
- These differences come from the G3-A port (the Aura Toast rules), not from A2 alone. Summary and detail were already stacked in the held baseline. A2 removes the Task 8 defect (summary and detail on one row, close button overlapping the summary) that kept the Toast baselines held.

### A2.8 Accessibility identity mapping (D-A2-5.5)

The mapping script exited 0 with `re-identified 6 rows; 200 listed`. Each of the 6 mappings adds only the `.u-toast-message-text` path segment. They are listed in `docs/architecture/research/2026-10-04-gap-064-g3a-accessibility-preexisting.md` under "Identity mapping":

- `color-contrast:ng-toast--all-severities:.u-toast-message-error > .u-toast-message-content > .u-toast-summary` → `color-contrast:ng-toast--all-severities:.u-toast-message-error > .u-toast-message-content > .u-toast-message-text > .u-toast-summary`
- `color-contrast:ng-toast--all-severities:.u-toast-message-success > .u-toast-message-content > .u-toast-summary` → `color-contrast:ng-toast--all-severities:.u-toast-message-success > .u-toast-message-content > .u-toast-message-text > .u-toast-summary`
- `color-contrast:ng-toast--all-severities:.u-toast-message-warn > .u-toast-message-content > .u-toast-summary` → `color-contrast:ng-toast--all-severities:.u-toast-message-warn > .u-toast-message-content > .u-toast-message-text > .u-toast-summary`
- `color-contrast:vue-toast--all-severities:.u-toast-message-error > .u-toast-message-content > .u-toast-summary` → `color-contrast:vue-toast--all-severities:.u-toast-message-error > .u-toast-message-content > .u-toast-message-text > .u-toast-summary`
- `color-contrast:vue-toast--all-severities:.u-toast-message-success > .u-toast-message-content > .u-toast-summary` → `color-contrast:vue-toast--all-severities:.u-toast-message-success > .u-toast-message-content > .u-toast-message-text > .u-toast-summary`
- `color-contrast:vue-toast--all-severities:.u-toast-message-warn > .u-toast-message-content > .u-toast-summary` → `color-contrast:vue-toast--all-severities:.u-toast-message-warn > .u-toast-message-content > .u-toast-message-text > .u-toast-summary`

### A2.9 Validator results (D-A2-5.6; scripts unchanged)

- **G3-A differential:** ng OK 93/93, 0 introduced, 0 stale. vue OK 102/102, 0 introduced, 0 stale.
- **Strict validator:** ng OK 261, vue OK 219, react OK 198 nodes, zero new violations.
- No row was added to `ACCESSIBILITY_BASELINE.md`.

### A2.10 Review Focus item 3: RTL

RTL is **untested**, because no story covers it. The ported `:dir(rtl)` close-button rule is unchanged by A2.

### A2.11 Decision requested

Approve the **6 Toast baselines** (ng and vue, each in chromium, firefox and webkit), to be updated by Task 16 in Docker with the same image and environment as A2.1. No baseline changes until the user approves. This record states the evidence only and makes no recommendation.

### A2.12 User approval and final verification (2026-10-05)

- **Approved by the user:** the 6 Toast AllSeverities baselines (ng and vue × chromium, firefox, webkit).
- **Update:** `run.sh update "Toast AllSeverities G3-A visual"` on `98dcd5d` → 6 passed. Exactly the 6 Toast PNGs changed, and no other baseline.
- **Re-verification** on the staged tree `958dc40`, in Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` on arm64:
  - G3-A run: **396 passed, 0 failed**. That covers 195 visual, 195 accessibility and 6 layout tests; the 6 Toast screenshots now match.
  - Regression: **835 passed, 0 failed, 0 flaky**.
- **Accessibility** (unchanged validators):
  - G3-A differential: ng OK 93/93, vue OK 102/102, 0 introduced, 0 stale.
  - Strict: ng OK (261), vue OK (219), react OK (198), zero new violations.
- **U2 is resolved.** G3-A has no remaining visual failures.

## Verification (Task 9)

Run on 2026-10-05 at HEAD `ea5e039` (branch `feature/gap-064-g3a-display-feedback`, clean working tree) with Node 24.15.0. The comparison baseline is the immutable `fa5c150`; `origin/main` was not used.

### Step 1: suites, typecheck and SSR

| Check | Result |
| --- | --- |
| `pnpm --filter @ultimate/uix-styled test` | 6 files, 15 tests passed |
| `pnpm --filter @ultimate/themes test` | 18 files, 685 tests passed |
| `pnpm --filter @ultimate/vue-core test` | 20 files, 102 tests passed |
| `pnpm --filter @ultimate/vue test` | 96 files, 1048 tests passed |
| `pnpm --filter @ultimate/react test` | 87 files, 856 tests passed |
| `pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false` | 91 files, 1033 tests passed |
| `pnpm --filter @ultimate/ng-core exec ng test --project=ng-core --watch=false` | 15 files, 62 tests passed |
| `pnpm run typecheck` | exit 0 (all packages) |
| SSR (`ng-ssr-chromium`, `react-ssr-chromium`, `vue-ssr-chromium`) | 835 passed, 0 failed, 0 flaky (controller's Docker regression run on tree `958dc40`, same content as HEAD) |

Command forms. `pnpm --filter <pkg> test --watch=false` fails on pnpm 9.6.0 with `Unknown option: 'watch'`. It was confirmed for `@ultimate/ng-core` (first form tried) and was used as a known failure for `@ultimate/ng`. Both Angular packages therefore ran through `pnpm --filter <pkg> exec ng test --project=<name> --watch=false`. The host Playwright SSR command was not run: the visual baselines are Linux arm64 renders, so the SSR evidence is the Docker run above.

### Step 2: scope and DOM checks (C4, C8)

- `git diff fa5c150 --stat -- packages/react packages/react-core packages/uix-styled packages/uix-styles packages/themes/src packages/ng-core packages/vue-core` printed nothing.
- `git diff fa5c150 --name-only` lists 268 paths, all within the allowed set:
  - 27 style modules (13 ng, 14 vue);
  - 195 snapshot PNGs (93 ng, 102 vue);
  - the 9 key files and the other component sources named in the approved plan, plus the approved later additions (`packages/ng/src/message/message.ts`, the Toast markup files `toast.ts`, `Toast.vue` and `toast.spec.ts`);
  - stories (including `meter-group.stories.ts`), e2e and runtime specs;
  - `packages/themes/test/**` (fixture, `g3a-port.mjs`, fidelity test);
  - `docs/architecture/provenance/{ng,vue}.json`, `ACCESSIBILITY_BASELINE.md`, `.github/workflows/ci.yml`;
  - `scripts/provenance/validate-g3a-accessibility.mjs` and its `.test.mjs`;
  - the research, spec, plan and record docs.
- No path outside the allowed set.

### Step 3: size gate (C7)

`pnpm run build && pnpm run size:measure` succeeded, then `node scripts/provenance/validate-bundle-size.mjs --base-ref fa5c150` printed `all packages passed the bundle-size gate` (exit 0). No package is above 15%; no override was used and `PERFORMANCE.md` was not edited.

| Package | Baseline (fa5c150) | Now | Change |
| --- | --- | --- | --- |
| ng | 202.86 KB | 64.4 KB | -68.2% |
| vue | 132.3 KB | 136.2 KB | +2.9% |
| ng-core | 16.53 KB | 16.9 KB | +2.2% |
| vue-core | 8.66 KB | 8.8 KB | +2.1% |
| react | 87.16 KB | 87.2 KB | 0.0% |
| themes | 13.14 KB | 13.5 KB | +3.1% |
| uix-styled | 8.45 KB | 8.6 KB | +2.3% |

The ng figure is a stale baseline, not a G3-A reduction. `PERFORMANCE.md` at `fa5c150` records ng as 5281.3 KB total with 202.86 KB (4th column), while the current measure is 3152.2 KB with 64.42 KB. G3-A touches 13 ng style modules and five small ng component sources, none of which can remove 60% of the package.

### Pre-existing failures (recorded, not fixed)

- **`pnpm run provenance:validate`** exits 1. The 7 required baseline entries are present, then it fails first on `packages/ng/src/accordion/accordion-style.ts`: "has no entry in docs/architecture/provenance/ng.json". The file is not in the G3-A diff, so this predates G3-A.
- **`pnpm run lint`** (`eslint .`) exits 1 with 58533 problems. None are in a G3-A-touched file (a `comm` of the lint-failing files against the 268 touched paths found no tracked overlap). The failures are in:
  - 41 tracked source and test files across `ng/src`, `react/src`, `vue/src`, `themes/test`, `uix-styled/src`, `uix-utils/test`, `component-schema` and `mcp/src` (for example `packages/ng/src/popover/popover.ts`, `packages/react/src/select/select.tsx`, `packages/themes/test/contract.test.ts`), none touched by G3-A;
  - the git-ignored build output under `packages/{ng,react,vue}/storybook-static`, which `eslint .` lints because it is not excluded. This accounts for nearly all of the 58533 problems (minified bundles: `no-unused-expressions`, `no-undef` for `URL` and `location`, `no-unused-vars`).
