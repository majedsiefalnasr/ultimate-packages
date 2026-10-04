# GAP-064 Tranche 1 — Visual and accessibility review record

Status: **user-approved; final baseline set of 134 Linux images regenerated in Docker and verified (Task 6 closeout, Sections 12-21).** Sections 1-11 are the original macOS review made before approval and are kept as written; Sections 12-21 record what was done after approval. No source, test, story, CSS or Playwright config file was modified.

Branch `feature/gap-064-aura-token-wiring` at `57f93a0`, Node 24.15.0, macOS (darwin). Date 2026-10-04.

## 1. How this was run

```bash
pnpm run build
npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit \
  --project=vue-chromium --project=vue-firefox --project=vue-webkit \
  --project=react-chromium --project=react-firefox --project=react-webkit \
  --reporter=list,html,json
```

(`--reporter=list,html,json` added only so the results could be analysed; the config default is `html`.)

Result: **807 test runs, 544 passed, 263 failed.** All 263 failures are `toHaveScreenshot` mismatches. There are no non-screenshot failures.

| Project        | Passed | Failed |
| -------------- | ------ | ------ |
| ng-chromium    | 67     | 36     |
| ng-firefox     | 67     | 36     |
| ng-webkit      | 67     | 36     |
| vue-chromium   | 61     | 33     |
| vue-firefox    | 58     | 36     |
| vue-webkit     | 58     | 36     |
| react-chromium | 56     | 16     |
| react-firefox  | 55     | 17     |
| react-webkit   | 55     | 17     |

### Important finding: the existing baselines are Linux renders, so 143 of the 263 failures are platform noise, not Tranche 1 changes

Commit `fb74a8b` regenerated all existing baselines under Linux (Docker) for CI, and `snapshotPathTemplate` has no platform component. On this macOS machine every existing text-bearing baseline therefore mismatches by font anti-aliasing, whatever the code is. To separate real Tranche 1 changes from this noise I created a temporary detached git worktree at `a33c219` (the commit before any Tranche 1 style change, with the Task 1 specs and baselines), built it, ran the same 9 projects, and compared pixel-for-pixel:

- Pre-change run on this machine: 625 passed, 182 failed (Task 1 baselines pass because Task 1 recorded them on this machine; the 182 are the Linux-baseline noise).
- For every one of the 263 post-change failures, the post-change screenshot was compared with the pre-change screenshot of the same test.
  - **120 runs (40 tests x 3 browsers) differ** — these are the real Tranche 1 changes (Sections 3 and 4).
  - **143 runs are bit-identical to the pre-change render** — they fail only because of the Linux-vs-macOS baseline mismatch (Section 5). They are not caused by Tranche 1.
- The temporary worktree was removed afterwards.

Consequence for Step 5 (not performed): accepting group B baselines by running `--update-snapshots` on this Mac would replace the Linux baselines with macOS renders, which would then fail on Linux CI. The Task 1 (group A) baselines were also recorded on macOS, so they will also fail on Linux CI once the rendering differs. Decision needed from the user on how to regenerate (the project used Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` in `fb74a8b`).

## 2. Summary

| Group                                                                              | Tests | Browser runs (fail) | Notes                                                                                               |
| ---------------------------------------------------------------------------------- | ----- | ------------------- | --------------------------------------------------------------------------------------------------- |
| A — new Tranche 1 coverage (all expected)                                          | 27    | 81                  | 11 Angular + 16 Vue                                                                                 |
| B — expected changes to existing baselines                                         | 13    | 39                  | ng badge x3, ng paginator x2, vue paginator x3, react paginator x2, table `Paginated` x3 frameworks |
| C — UNEXPECTED visual changes                                                      | 0     | 0                   | none                                                                                                |
| Not caused by Tranche 1 (pre-existing platform noise, bit-identical to pre-change) | 49    | 143                 | Section 5                                                                                           |
| Total failing                                                                      | 89    | 263                 |                                                                                                     |

Expected-set checks:

- Task 1 specs: 27 of 34 tests changed (Angular 11/16, Vue 16/18). The 7 that did not change are listed in Section 6.
- Angular `badge`: all 3 stories changed. Angular `paginator`: both stories changed.
- Vue `paginator`: all 3 stories changed. React `paginator`: both stories changed.
- `table`: only the `Paginated` story changed in each framework (paginator in frame). `Default` and `Sorted` have no paginator and are unchanged by Tranche 1.
- Vue/React `button`: **no change** (no badge in frame); their failures are platform noise only.

Pixel counts quoted in group entries are versus the committed baseline (group B includes the Linux/macOS anti-aliasing noise on top of the real change).

## 3. Per-test change records

### Group A — new Tranche 1 coverage (aura-token-wiring.spec.ts)

#### Ng/CascadeSelect story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Select now has a border, rounded corners, padding, placeholder colour and a right-aligned chevron (was bare text with a black arrow).
- Pixels differing from committed baseline: chromium 467px, firefox 470px, webkit 450px
- Artifacts (original): `test-results/aura-token-wiring-Ng-CascadeSelect-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-CascadeSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-CascadeSelect-story-visual-regression-<project>/Ng-CascadeSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/ColorPicker story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Red swatch gains rounded corners (was a square).
- Pixels differing from committed baseline: chromium 20px, firefox 16px, webkit 12px
- Artifacts (original): `test-results/aura-token-wiring-Ng-ColorPicker-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-ColorPicker-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-ColorPicker-story-visual-regression-<project>/Ng-ColorPicker-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/FileUpload story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Buttons/drop area gain padding and offset (content moved right/down); Choose/Upload/Cancel still render as plain unstyled text, no button chrome.
- Pixels differing from committed baseline: chromium 1208px, firefox 1508px, webkit 1076px
- Artifacts (original): `test-results/aura-token-wiring-Ng-FileUpload-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-FileUpload-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-FileUpload-story-visual-regression-<project>/Ng-FileUpload-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/FloatLabel story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Input now has border, padding and muted colour; label still renders beside the input instead of floating over it.
- Pixels differing from committed baseline: chromium 309px, firefox 309px, webkit 278px
- Artifacts (original): `test-results/aura-token-wiring-Ng-FloatLabel-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-FloatLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-FloatLabel-story-visual-regression-<project>/Ng-FloatLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/IftaLabel story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Field becomes a bordered, padded box with the label inside at the top-left in small muted text.
- Pixels differing from committed baseline: chromium 635px, firefox 690px, webkit 259px
- Artifacts (original): `test-results/aura-token-wiring-Ng-IftaLabel-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-IftaLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-IftaLabel-story-visual-regression-<project>/Ng-IftaLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/InputOtp story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Boxes become narrower, evenly sized separate boxes (previous: wide joined boxes).
- Pixels differing from committed baseline: chromium 1114px, firefox 1363px, webkit 7px
- Artifacts (original): `test-results/aura-token-wiring-Ng-InputOtp-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-InputOtp-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-InputOtp-story-visual-regression-<project>/Ng-InputOtp-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/InputText story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Input gains border, rounded corners, padding and Aura font/colour (was bare text "Text" with no field chrome).
- Pixels differing from committed baseline: chromium 106px, firefox 107px, webkit 108px
- Artifacts (original): `test-results/aura-token-wiring-Ng-InputText-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-InputText-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-InputText-story-visual-regression-<project>/Ng-InputText-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/MultiSelect story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Select gains border, rounded corners, padding, muted placeholder and a muted chevron.
- Pixels differing from committed baseline: chromium 398px, firefox 401px, webkit 389px
- Artifacts (original): `test-results/aura-token-wiring-Ng-MultiSelect-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-MultiSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-MultiSelect-story-visual-regression-<project>/Ng-MultiSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/SelectButton story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Options become a padded, rounded, pale-grey segmented button group (was bare text OffMediumHigh).
- Pixels differing from committed baseline: chromium 544px, firefox 543px, webkit 526px
- Artifacts (original): `test-results/aura-token-wiring-Ng-SelectButton-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-SelectButton-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-SelectButton-story-visual-regression-<project>/Ng-SelectButton-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/ToggleButton story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: "No" becomes a padded, rounded, pale-grey toggle button (was bare text).
- Pixels differing from committed baseline: chromium 64px, firefox 63px, webkit 73px
- Artifacts (original): `test-results/aura-token-wiring-Ng-ToggleButton-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-ToggleButton-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-ToggleButton-story-visual-regression-<project>/Ng-ToggleButton-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Ng/ToggleSwitch story — ng / aura-token-wiring

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Switch renders as a rounded track with a white handle (was a bare dash).
- Pixels differing from committed baseline: chromium 60px, firefox 59px, webkit 59px
- Artifacts (original): `test-results/aura-token-wiring-Ng-ToggleSwitch-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-ToggleSwitch-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/aura-token-wiring-Ng-ToggleSwitch-story-visual-regression-<project>/Ng-ToggleSwitch-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/Badge story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Badge "5" becomes a green filled circle with white text (was bare text).
- Pixels differing from committed baseline: chromium 344px, firefox 340px, webkit 332px
- Artifacts (original): `test-results/aura-token-wiring-Vue-Badge-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-Badge-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-Badge-story-visual-regression-<project>/Vue-Badge-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/CascadeSelect story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: border, rounded corners, padding, chevron.
- Pixels differing from committed baseline: chromium 467px, firefox 470px, webkit 450px
- Artifacts (original): `test-results/aura-token-wiring-Vue-CascadeSelect-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-CascadeSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-CascadeSelect-story-visual-regression-<project>/Vue-CascadeSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/ColorPicker story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: swatch gains rounded corners.
- Pixels differing from committed baseline: chromium 20px, firefox 16px, webkit 12px
- Artifacts (original): `test-results/aura-token-wiring-Vue-ColorPicker-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-ColorPicker-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-ColorPicker-story-visual-regression-<project>/Vue-ColorPicker-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/FileUpload story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: padding/offset added; buttons still plain text.
- Pixels differing from committed baseline: chromium 1208px, firefox 1508px, webkit 1076px
- Artifacts (original): `test-results/aura-token-wiring-Vue-FileUpload-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-FileUpload-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-FileUpload-story-visual-regression-<project>/Vue-FileUpload-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/FloatLabel story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: input styled, label still beside the input (not floating).
- Pixels differing from committed baseline: chromium 309px, firefox 309px, webkit 278px
- Artifacts (original): `test-results/aura-token-wiring-Vue-FloatLabel-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-FloatLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-FloatLabel-story-visual-regression-<project>/Vue-FloatLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/IconField story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Search input gains border/colour change; icon text ("search") still overlaps the input as text and is clipped ("sea") in the crop; the icon still looks unstyled.
- Pixels differing from committed baseline: chromium 96px, firefox 92px, webkit 113px
- Artifacts (original): `test-results/aura-token-wiring-Vue-IconField-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-IconField-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-IconField-story-visual-regression-<project>/Vue-IconField-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/IftaLabel story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: bordered box with label inside top-left.
- Pixels differing from committed baseline: chromium 635px, firefox 690px, webkit 259px
- Artifacts (original): `test-results/aura-token-wiring-Vue-IftaLabel-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-IftaLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-IftaLabel-story-visual-regression-<project>/Vue-IftaLabel-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/InputChips story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Chips input gains border, rounded corners and padding (was bare text "Add a tag").
- Pixels differing from committed baseline: chromium 292px, firefox 272px, webkit 269px
- Artifacts (original): `test-results/aura-token-wiring-Vue-InputChips-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-InputChips-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-InputChips-story-visual-regression-<project>/Vue-InputChips-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/InputGroup story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: The "$" addon is now a bordered, padded cell attached to the input; the Amount input itself is still the raw browser-default input (no Aura input styling).
- Pixels differing from committed baseline: chromium 2771px, firefox 2711px, webkit 150px
- Artifacts (original): `test-results/aura-token-wiring-Vue-InputGroup-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-InputGroup-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-InputGroup-story-visual-regression-<project>/Vue-InputGroup-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/InputNumber story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Input gains border, rounded corners and padding (was bare text "1,234").
- Pixels differing from committed baseline: chromium 136px, firefox 136px, webkit 129px
- Artifacts (original): `test-results/aura-token-wiring-Vue-InputNumber-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-InputNumber-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-InputNumber-story-visual-regression-<project>/Vue-InputNumber-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/InputOtp story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: narrower, evenly sized separate boxes.
- Pixels differing from committed baseline: chromium 1114px, firefox 1363px, webkit 7px
- Artifacts (original): `test-results/aura-token-wiring-Vue-InputOtp-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-InputOtp-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-InputOtp-story-visual-regression-<project>/Vue-InputOtp-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/InputText story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: border, rounded corners, padding, Aura font/colour.
- Pixels differing from committed baseline: chromium 269px, firefox 243px, webkit 244px
- Artifacts (original): `test-results/aura-token-wiring-Vue-InputText-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-InputText-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-InputText-story-visual-regression-<project>/Vue-InputText-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/MultiSelect story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: border, rounded corners, padding, chevron.
- Pixels differing from committed baseline: chromium 395px, firefox 398px, webkit 382px
- Artifacts (original): `test-results/aura-token-wiring-Vue-MultiSelect-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-MultiSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-MultiSelect-story-visual-regression-<project>/Vue-MultiSelect-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/SelectButton story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: padded, rounded, pale-grey segmented group.
- Pixels differing from committed baseline: chromium 544px, firefox 543px, webkit 526px
- Artifacts (original): `test-results/aura-token-wiring-Vue-SelectButton-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-SelectButton-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-SelectButton-story-visual-regression-<project>/Vue-SelectButton-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/ToggleButton story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: padded, rounded, pale-grey toggle button.
- Pixels differing from committed baseline: chromium 64px, firefox 63px, webkit 73px
- Artifacts (original): `test-results/aura-token-wiring-Vue-ToggleButton-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-ToggleButton-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-ToggleButton-story-visual-regression-<project>/Vue-ToggleButton-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Vue/ToggleSwitch story — vue / aura-token-wiring

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Same as Ng: rounded track with white handle.
- Pixels differing from committed baseline: chromium 60px, firefox 59px, webkit 59px
- Artifacts (original): `test-results/aura-token-wiring-Vue-ToggleSwitch-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-ToggleSwitch-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/aura-token-wiring-Vue-ToggleSwitch-story-visual-regression-<project>/Vue-ToggleSwitch-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

### Group B — expected changes to existing baselines

#### Default story — ng / badge

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Badge "5" becomes a green filled circle with white text (was bare text).
- Pixels differing from committed baseline: chromium 337px, firefox 329px, webkit 321px
- Artifacts (original): `test-results/badge-Ng-Badge-Default-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-Badge-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/badge-Ng-Badge-Default-story-visual-regression-<project>/Ng-Badge-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Success story — ng / badge

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Badge "Active" becomes a green (success) rounded pill with white bold text (was bare text).
- Pixels differing from committed baseline: chromium 921px, firefox 943px, webkit 920px
- Artifacts (original): `test-results/badge-Ng-Badge-Success-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-Badge-Success-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/badge-Ng-Badge-Success-story-visual-regression-<project>/Ng-Badge-Success-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Large story — ng / badge

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Badge "99+" becomes a green rounded pill with white bold text (was bare text).
- Pixels differing from committed baseline: chromium 988px, firefox 990px, webkit 985px
- Artifacts (original): `test-results/badge-Ng-Badge-Large-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-Badge-Large-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/badge-Ng-Badge-Large-story-visual-regression-<project>/Ng-Badge-Large-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Default story — ng / paginator

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Page links 1-5 become round buttons spaced apart; current page 1 gets a pale-green circle with green text (was bare "12345").
- Pixels differing from committed baseline: chromium 136px, firefox 124px, webkit 148px
- Artifacts (original): `test-results/paginator-Ng-Paginator-Default-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-Paginator-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/paginator-Ng-Paginator-Default-story-visual-regression-<project>/Ng-Paginator-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Middle Page story — ng / paginator

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Pages 8-12 become spaced round buttons; current page 10 highlighted in a pale-green circle.
- Pixels differing from committed baseline: chromium 200px, firefox 198px, webkit 208px
- Artifacts (original): `test-results/paginator-Ng-Paginator-Middle-Page-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-Paginator-Middle-Page-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/paginator-Ng-Paginator-Middle-Page-story-visual-regression-<project>/Ng-Paginator-Middle-Page-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Paginated story — ng / table

- Projects failing (3): ng-chromium, ng-firefox, ng-webkit
- Visible change: Paginator below the table: pages 1-3 become spaced round buttons, page 1 highlighted (was bare "123").
- Pixels differing from committed baseline: chromium 303px, firefox 26651px, webkit 26621px
- Artifacts (original): `test-results/table-Ng-Table-Paginated-story-visual-regression-{ng-chromium,ng-firefox,ng-webkit}/Ng-Table-Paginated-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{ng-chromium,ng-firefox,ng-webkit}/table-Ng-Table-Paginated-story-visual-regression-<project>/Ng-Table-Paginated-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Default story — react / paginator

- Projects failing (3): react-chromium, react-firefox, react-webkit
- Visible change: Same as Angular paginator Default: spaced round page buttons, current page highlighted.
- Pixels differing from committed baseline: chromium 136px, firefox 124px, webkit 148px
- Artifacts (original): `test-results/paginator-React-Paginator-Default-story-visual-regression-{react-chromium,react-firefox,react-webkit}/React-Paginator-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{react-chromium,react-firefox,react-webkit}/paginator-React-Paginator-Default-story-visual-regression-<project>/React-Paginator-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Middle Page story — react / paginator

- Projects failing (3): react-chromium, react-firefox, react-webkit
- Visible change: Same as Angular paginator Middle Page.
- Pixels differing from committed baseline: chromium 198px, firefox 203px, webkit 210px
- Artifacts (original): `test-results/paginator-React-Paginator--c2d30-age-story-visual-regression-{react-chromium,react-firefox,react-webkit}/React-Paginator-Middle-Page-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{react-chromium,react-firefox,react-webkit}/paginator-React-Paginator--c2d30-age-story-visual-regression-<project>/React-Paginator-Middle-Page-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Paginated story — react / table

- Projects failing (3): react-chromium, react-firefox, react-webkit
- Visible change: Same as Angular table Paginated: styled paginator under the table.
- Pixels differing from committed baseline: chromium 303px, firefox 26655px, webkit 26620px
- Artifacts (original): `test-results/table-React-Table-Paginated-story-visual-regression-{react-chromium,react-firefox,react-webkit}/React-Table-Paginated-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{react-chromium,react-firefox,react-webkit}/table-React-Table-Paginated-story-visual-regression-<project>/React-Table-Paginated-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Default story — vue / paginator

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Spaced round page buttons with current page 1 highlighted; "1 of 10" report text now muted blue-grey and right-aligned (was bare "123451 of 10").
- Pixels differing from committed baseline: chromium 252px, firefox 258px, webkit 279px
- Artifacts (original): `test-results/paginator-Vue-Paginator-Default-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-Paginator-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/paginator-Vue-Paginator-Default-story-visual-regression-<project>/Vue-Paginator-Default-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Middle Page story — vue / paginator

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Spaced round page buttons, page 10 highlighted; "10 of 20" report text styled and right-aligned.
- Pixels differing from committed baseline: chromium 364px, firefox 363px, webkit 382px
- Artifacts (original): `test-results/paginator-Vue-Paginator-Middle-Page-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-Paginator-Middle-Page-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/paginator-Vue-Paginator-Middle-Page-story-visual-regression-<project>/Vue-Paginator-Middle-Page-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Empty story — vue / paginator

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Only the "1 of 0" report text changes: now muted blue-grey and right-aligned (no page links exist in this story).
- Pixels differing from committed baseline: chromium 87px, firefox 107px, webkit 113px
- Artifacts (original): `test-results/paginator-Vue-Paginator-Empty-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-Paginator-Empty-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/paginator-Vue-Paginator-Empty-story-visual-regression-<project>/Vue-Paginator-Empty-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

#### Paginated story — vue / table

- Projects failing (3): vue-chromium, vue-firefox, vue-webkit
- Visible change: Paginator below the table: styled page buttons, page 1 highlighted, "1 of 3" report text right-aligned.
- Pixels differing from committed baseline: chromium 375px, firefox 26777px, webkit 26704px
- Artifacts (original): `test-results/table-Vue-Table-Paginated-story-visual-regression-{vue-chromium,vue-firefox,vue-webkit}/Vue-Table-Paginated-story-visual-regression-1-{expected,actual,diff}.png`
- Artifacts (preserved copy): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/{vue-chromium,vue-firefox,vue-webkit}/table-Vue-Table-Paginated-story-visual-regression-<project>/Vue-Table-Paginated-story-visual-regression-1-{expected,actual,diff}.png`
- Before/after crop (chromium, left = before, right = after): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`

## 4. Group C — UNEXPECTED

None. Every screenshot whose rendering changed is in groups A or B.

## 5. Failures not caused by Tranche 1 (pre-existing macOS-vs-Linux baseline mismatch)

143 runs / 49 tests fail with small anti-aliasing diffs (typically 1–400 px, text edges only). Their post-change screenshot is bit-identical to the screenshot produced by the pre-change code (`a33c219`) on this machine, so they are unrelated to Tranche 1 and not UNEXPECTED visual changes. They would fail on this Mac with or without the branch. Their artifacts are preserved in `visual-review/<project>/` with the others, but should NOT be re-baselined from a Mac.

Affected tests (spec :: story, count of browser runs):

- ng/auto-focus :: Default (3 browser runs)
- ng/button :: Default (3 browser runs)
- ng/button :: Disabled (3 browser runs)
- ng/button :: Loading (3 browser runs)
- ng/button :: With Icon (3 browser runs)
- ng/checkbox :: Disabled (3 browser runs)
- ng/checkbox :: With Label (3 browser runs)
- ng/dialog :: Non Closable (3 browser runs)
- ng/dialog :: Open (3 browser runs)
- ng/fluid :: Default (3 browser runs)
- ng/menu :: Default (3 browser runs)
- ng/menu :: Popup (3 browser runs)
- ng/menu :: With Disabled Item (3 browser runs)
- ng/ripple :: Default (3 browser runs)
- ng/table :: Default (3 browser runs)
- ng/table :: Sorted (3 browser runs)
- ng/tooltip :: Default (3 browser runs)
- ng/tooltip :: Disabled (3 browser runs)
- ng/tooltip :: Right Position (3 browser runs)
- react/button :: Danger (3 browser runs)
- react/button :: Default (3 browser runs)
- react/button :: Disabled (3 browser runs)
- react/button :: Loading (3 browser runs)
- react/checkbox :: Checked (2 browser runs)
- react/dialog :: Default (3 browser runs)
- react/dialog :: Non Closable (3 browser runs)
- react/dialog :: Open (3 browser runs)
- react/menu :: Default (3 browser runs)
- react/table :: Default (3 browser runs)
- react/table :: Sorted (3 browser runs)
- react/tooltip :: Default (3 browser runs)
- react/tooltip :: Disabled (3 browser runs)
- react/tooltip :: Left Position (3 browser runs)
- vue/button :: Danger (3 browser runs)
- vue/button :: Default (3 browser runs)
- vue/button :: Loading (3 browser runs)
- vue/button :: With Icon (3 browser runs)
- vue/checkbox :: Checked (2 browser runs)
- vue/checkbox :: Indeterminate (2 browser runs)
- vue/checkbox :: Invalid (2 browser runs)
- vue/dialog :: Default (3 browser runs)
- vue/dialog :: Non Closable (3 browser runs)
- vue/dialog :: Open (3 browser runs)
- vue/menu :: Default (3 browser runs)
- vue/ripple :: Default (3 browser runs)
- vue/table :: Default (3 browser runs)
- vue/table :: Sorted (3 browser runs)
- vue/tooltip :: Default (3 browser runs)
- vue/tooltip :: Disabled (3 browser runs)

## 6. Task 1 tests that did NOT change (pass against their pre-change baseline)

| Test            | Projects | Observation                                                                                              |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| Ng/DatePicker   | ng x3    | Unchanged.                                                                                               |
| Ng/RadioButton  | ng x3    | Unchanged.                                                                                               |
| Ng/IconField    | ng x3    | Unchanged — still renders the icon name as text next to a native, unstyled input (see suspicious notes). |
| Ng/InputGroup   | ng x3    | Unchanged — still renders `$` as plain text beside a native, unstyled input.                             |
| Ng/InputNumber  | ng x3    | Unchanged — still a bare native input with no border/padding.                                            |
| Vue/DatePicker  | vue x3   | Unchanged.                                                                                               |
| Vue/RadioButton | vue x3   | Unchanged.                                                                                               |

DatePicker and RadioButton were presumably already registered under the correct key (so nothing to change). The three Angular components (IconField, InputGroup, InputNumber) are the same components that DO change in Vue; Angular's renamed keys changed nothing visible for them. Superseded in part by Section 16 (diagnosis: RadioButton did change). Cause not investigated at this stage beyond confirming that the component class `componentName` values were renamed (`icon-field` to `iconfield`, `input-group` to `inputgroup`, `input-number` to `inputnumber`) and that the rendered DOM stays unstyled. This is a point for the reviewer: either the Angular story markup bypasses those styles, or the key rename is not yet sufficient for these three.

## 7. Suspicious after-states (described, not fixed)

- **FloatLabel (Ng and Vue):** input is now styled but the label still sits beside the input as plain text instead of floating over it.
- **FileUpload (Ng and Vue):** layout/padding changed, but Choose / Upload / Cancel still render as plain text with no button chrome.
- **InputGroup (Vue):** the `$` addon is styled, but the adjacent input is still the raw browser-default input.
- **IconField (Vue):** the search input is styled but the icon (text "search") still renders as inline text overlapping the field.
- **Ng IconField / InputGroup / InputNumber:** completely unchanged and still unstyled (Section 6).
- **Ng/React Paginator stories** only show page links; no first/prev/next/last or dropdown controls render in those stories (same before and after), so those parts of the ported module are not exercised by screenshots.

## 8. Accessibility baseline check (Step 2)

The brief's command `pnpm run accessibility:validate` fails immediately because the script requires an envelope glob (`FAIL: missing required <glob> argument for --check`). It was therefore run the way CI does (`.github/workflows/ci.yml` line 198), once per framework, against the envelopes written by the browser run:

```bash
node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/<framework>/**/*.json"
```

| Framework | Result                                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| vue       | OK: scanned 219 violation node(s), zero new violations outside `ACCESSIBILITY_BASELINE.md` |
| react     | OK: scanned 198 violation node(s), zero new violations outside `ACCESSIBILITY_BASELINE.md` |
| ng        | **FAIL: 6 new accessibility violations not present in `ACCESSIBILITY_BASELINE.md`**        |

Verbatim Angular output (each line appears once per browser: chromium, firefox, webkit):

```
[validate-accessibility-baseline] NEW VIOLATION: color-contrast on ng-badge--large (u-badge) — not in docs/architecture/ACCESSIBILITY_BASELINE.md
[validate-accessibility-baseline] NEW VIOLATION: color-contrast on ng-badge--success (u-badge) — not in docs/architecture/ACCESSIBILITY_BASELINE.md
[validate-accessibility-baseline] FAIL: 6 new accessibility violation(s) not present in docs/architecture/ACCESSIBILITY_BASELINE.md
```

Detail (identical in all three browsers; envelopes under `test-results/accessibility/ng/<browser>/`):

- `ng-badge--success`: color-contrast, serious. White `#ffffff` text on `#22c55e`, ratio 2.27:1 (12px bold), expected 4.5:1. Target `u-badge`.
- `ng-badge--large`: color-contrast, serious. White `#ffffff` text on `#10b981`, ratio 2.53:1 (14px bold), expected 4.5:1. Target `u-badge`.
- `ng-badge--default`: no color-contrast violation.

Cause: the Aura badge module now styles the Angular badge (green filled background with white text), which was previously unstyled and therefore had no contrast problem. The same white-on-`#10b981` ratio (2.53:1) is already baselined for `UButton` (`ng-button--default`). No removed violations are reported by the tool (it only checks for new fingerprints). `ACCESSIBILITY_BASELINE.md` was not changed; a human decision is needed (baseline the 2 new fingerprints per browser, or fix the badge contrast).

## 9. Non-screenshot failures

None. All 263 failures are `toHaveScreenshot` mismatches; every interaction, role, focus-order and axe test passed in all nine projects.

## 10. Artifact locations

- Original: `test-results/<test-folder>/` (overwritten by the next Playwright run).
- Preserved copies (expected/actual/diff PNGs, folder names kept): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/<project>/<test-folder>/`
- HTML report copy: `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/playwright-report/` (open with `npx playwright show-report <that path>`).
- Before/after crops for the 40 changed chromium tests (pre-change render left, post-change render right): `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/visual-review/montages/`
- For group A the `-expected.png` is the macOS pre-change baseline committed in Task 1; for group B it is the committed Linux baseline.

## 11. Gate (historical)

At the time of the macOS review, Step 4 was a hard stop: no `--update-snapshots`, no baseline edits, no commit. The user subsequently approved the 40 changed tests, regeneration in Docker/Linux, and the Angular Badge accessibility exception; see Sections 12-18.

## 12. Docker baseline environment

Decision (user, binding): regenerate the approved baselines inside the Linux Playwright image, following the `fb74a8b` approach; never use macOS-rendered screenshots as baselines.

| Item            | Value                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image           | `mcr.microsoft.com/playwright:v1.63.0-jammy` (matches pinned `@playwright/test` 1.63.0)                                                                 |
| Arch            | linux/arm64 (`aarch64`), native on an Apple-silicon host, Docker Engine 29.8.1                                                                          |
| Node            | v24.20.0 (the image's Node; CI pins 24.15.0)                                                                                                            |
| pnpm            | 9.6.0 (`packageManager` in `package.json`, activated with `corepack enable` and `corepack prepare pnpm@9.6.0 --activate`)                               |
| Source          | `git archive 57f93a0` tar extracted to `/work` on the container filesystem (fresh install, no host `node_modules`); container started with `--ipc=host` |
| Env             | `CI=true` (so `retries: 2`, `forbidOnly`, `reuseExistingServer: false`)                                                                                 |
| Install         | `pnpm install --frozen-lockfile` (exit 0, 211 s)                                                                                                        |
| Build           | `pnpm run build` (exit 0, 47 s)                                                                                                                         |
| Selection check | `npx playwright test <spec files> --project=<fw>-chromium --project=<fw>-firefox --project=<fw>-webkit -g "<regex>" --list`                             |
| Update          | same command with `--update-snapshots=changed --reporter=list`: ng 63 s (51 runs), vue 67 s (60), react 32 s (9)                                        |

Selection regexes (each ran only against its own framework's spec files and projects; the describe/title text is part of every pattern, so nothing outside the 40 tests can match):

- ng, files `packages/ng/e2e/{aura-token-wiring,badge,paginator,table}.spec.ts`:
  `Ng/(CascadeSelect|ColorPicker|FileUpload|FloatLabel|IftaLabel|InputOtp|InputText|MultiSelect|SelectButton|ToggleButton|ToggleSwitch) story: visual regression|Ng/Badge.*(Default|Success|Large) story: visual regression|Ng/Paginator.*(Default|Middle Page) story: visual regression|Ng/Table.*Paginated story: visual regression`
- vue, files `packages/vue/e2e/{aura-token-wiring,paginator,table}.spec.ts`:
  `Vue/(Badge|CascadeSelect|ColorPicker|FileUpload|FloatLabel|IconField|IftaLabel|InputChips|InputGroup|InputNumber|InputOtp|InputText|MultiSelect|SelectButton|ToggleButton|ToggleSwitch) story: visual regression|Vue/Paginator.*(Default|Middle Page|Empty) story: visual regression|Vue/Table.*Paginated story: visual regression`
- react, files `packages/react/e2e/{paginator,table}.spec.tsx`:
  `React/Paginator.*(Default|Middle Page) story: visual regression|React/Table.*Paginated story: visual regression`

`--list` result: ng 51 runs (17 tests x 3), vue 60 (20 x 3), react 9 (3 x 3) = 120 runs = exactly 40 tests x 3 projects. The 7 unchanged Task 1 tests (Ng DatePicker, RadioButton, IconField, InputGroup, InputNumber; Vue DatePicker, RadioButton) were not selected.

Update result: 120 of 120 selected baselines were re-generated (120 "is re-generated, writing actual" messages: ng 51, vue 60, react 9) and every selected test passed in update mode. The number of PNGs under all `*-snapshots` directories stayed at 342 (nothing added or removed); an md5 comparison of all 342 files before and after showed exactly 120 changed.

## 13. The exact approved baseline set (40 tests, 120 PNGs)

Group A, 27 tests, from `aura-token-wiring.spec.ts`: Ng 11 (CascadeSelect, ColorPicker, FileUpload, FloatLabel, IftaLabel, InputOtp, InputText, MultiSelect, SelectButton, ToggleButton, ToggleSwitch) and Vue 16 (Badge, CascadeSelect, ColorPicker, FileUpload, FloatLabel, IconField, IftaLabel, InputChips, InputGroup, InputNumber, InputOtp, InputText, MultiSelect, SelectButton, ToggleButton, ToggleSwitch).

Group B, 13 tests: ng Badge Default/Success/Large, ng Paginator Default/Middle Page, vue Paginator Default/Middle Page/Empty, react Paginator Default/Middle Page, and `Paginated` in the ng, vue and react Table specs.

The first Docker pass copied back only these 120 files. Section 19 adds 14 more platform-only baselines, for a final set of 134 images. The 120 files of the first pass:

- `packages/ng/e2e/aura-token-wiring.spec.ts-snapshots/` (33)
  - `Ng-CascadeSelect-story-visual-regression-1-ng-chromium.png`
  - `Ng-CascadeSelect-story-visual-regression-1-ng-firefox.png`
  - `Ng-CascadeSelect-story-visual-regression-1-ng-webkit.png`
  - `Ng-ColorPicker-story-visual-regression-1-ng-chromium.png`
  - `Ng-ColorPicker-story-visual-regression-1-ng-firefox.png`
  - `Ng-ColorPicker-story-visual-regression-1-ng-webkit.png`
  - `Ng-FileUpload-story-visual-regression-1-ng-chromium.png`
  - `Ng-FileUpload-story-visual-regression-1-ng-firefox.png`
  - `Ng-FileUpload-story-visual-regression-1-ng-webkit.png`
  - `Ng-FloatLabel-story-visual-regression-1-ng-chromium.png`
  - `Ng-FloatLabel-story-visual-regression-1-ng-firefox.png`
  - `Ng-FloatLabel-story-visual-regression-1-ng-webkit.png`
  - `Ng-IftaLabel-story-visual-regression-1-ng-chromium.png`
  - `Ng-IftaLabel-story-visual-regression-1-ng-firefox.png`
  - `Ng-IftaLabel-story-visual-regression-1-ng-webkit.png`
  - `Ng-InputOtp-story-visual-regression-1-ng-chromium.png`
  - `Ng-InputOtp-story-visual-regression-1-ng-firefox.png`
  - `Ng-InputOtp-story-visual-regression-1-ng-webkit.png`
  - `Ng-InputText-story-visual-regression-1-ng-chromium.png`
  - `Ng-InputText-story-visual-regression-1-ng-firefox.png`
  - `Ng-InputText-story-visual-regression-1-ng-webkit.png`
  - `Ng-MultiSelect-story-visual-regression-1-ng-chromium.png`
  - `Ng-MultiSelect-story-visual-regression-1-ng-firefox.png`
  - `Ng-MultiSelect-story-visual-regression-1-ng-webkit.png`
  - `Ng-SelectButton-story-visual-regression-1-ng-chromium.png`
  - `Ng-SelectButton-story-visual-regression-1-ng-firefox.png`
  - `Ng-SelectButton-story-visual-regression-1-ng-webkit.png`
  - `Ng-ToggleButton-story-visual-regression-1-ng-chromium.png`
  - `Ng-ToggleButton-story-visual-regression-1-ng-firefox.png`
  - `Ng-ToggleButton-story-visual-regression-1-ng-webkit.png`
  - `Ng-ToggleSwitch-story-visual-regression-1-ng-chromium.png`
  - `Ng-ToggleSwitch-story-visual-regression-1-ng-firefox.png`
  - `Ng-ToggleSwitch-story-visual-regression-1-ng-webkit.png`
- `packages/ng/e2e/badge.spec.ts-snapshots/` (9)
  - `Ng-Badge-Default-story-visual-regression-1-ng-chromium.png`
  - `Ng-Badge-Default-story-visual-regression-1-ng-firefox.png`
  - `Ng-Badge-Default-story-visual-regression-1-ng-webkit.png`
  - `Ng-Badge-Large-story-visual-regression-1-ng-chromium.png`
  - `Ng-Badge-Large-story-visual-regression-1-ng-firefox.png`
  - `Ng-Badge-Large-story-visual-regression-1-ng-webkit.png`
  - `Ng-Badge-Success-story-visual-regression-1-ng-chromium.png`
  - `Ng-Badge-Success-story-visual-regression-1-ng-firefox.png`
  - `Ng-Badge-Success-story-visual-regression-1-ng-webkit.png`
- `packages/ng/e2e/paginator.spec.ts-snapshots/` (6)
  - `Ng-Paginator-Default-story-visual-regression-1-ng-chromium.png`
  - `Ng-Paginator-Default-story-visual-regression-1-ng-firefox.png`
  - `Ng-Paginator-Default-story-visual-regression-1-ng-webkit.png`
  - `Ng-Paginator-Middle-Page-story-visual-regression-1-ng-chromium.png`
  - `Ng-Paginator-Middle-Page-story-visual-regression-1-ng-firefox.png`
  - `Ng-Paginator-Middle-Page-story-visual-regression-1-ng-webkit.png`
- `packages/ng/e2e/table.spec.ts-snapshots/` (3)
  - `Ng-Table-Paginated-story-visual-regression-1-ng-chromium.png`
  - `Ng-Table-Paginated-story-visual-regression-1-ng-firefox.png`
  - `Ng-Table-Paginated-story-visual-regression-1-ng-webkit.png`
- `packages/react/e2e/paginator.spec.tsx-snapshots/` (6)
  - `React-Paginator-Default-story-visual-regression-1-react-chromium.png`
  - `React-Paginator-Default-story-visual-regression-1-react-firefox.png`
  - `React-Paginator-Default-story-visual-regression-1-react-webkit.png`
  - `React-Paginator-Middle-Page-story-visual-regression-1-react-chromium.png`
  - `React-Paginator-Middle-Page-story-visual-regression-1-react-firefox.png`
  - `React-Paginator-Middle-Page-story-visual-regression-1-react-webkit.png`
- `packages/react/e2e/table.spec.tsx-snapshots/` (3)
  - `React-Table-Paginated-story-visual-regression-1-react-chromium.png`
  - `React-Table-Paginated-story-visual-regression-1-react-firefox.png`
  - `React-Table-Paginated-story-visual-regression-1-react-webkit.png`
- `packages/vue/e2e/aura-token-wiring.spec.ts-snapshots/` (48)
  - `Vue-Badge-story-visual-regression-1-vue-chromium.png`
  - `Vue-Badge-story-visual-regression-1-vue-firefox.png`
  - `Vue-Badge-story-visual-regression-1-vue-webkit.png`
  - `Vue-CascadeSelect-story-visual-regression-1-vue-chromium.png`
  - `Vue-CascadeSelect-story-visual-regression-1-vue-firefox.png`
  - `Vue-CascadeSelect-story-visual-regression-1-vue-webkit.png`
  - `Vue-ColorPicker-story-visual-regression-1-vue-chromium.png`
  - `Vue-ColorPicker-story-visual-regression-1-vue-firefox.png`
  - `Vue-ColorPicker-story-visual-regression-1-vue-webkit.png`
  - `Vue-FileUpload-story-visual-regression-1-vue-chromium.png`
  - `Vue-FileUpload-story-visual-regression-1-vue-firefox.png`
  - `Vue-FileUpload-story-visual-regression-1-vue-webkit.png`
  - `Vue-FloatLabel-story-visual-regression-1-vue-chromium.png`
  - `Vue-FloatLabel-story-visual-regression-1-vue-firefox.png`
  - `Vue-FloatLabel-story-visual-regression-1-vue-webkit.png`
  - `Vue-IconField-story-visual-regression-1-vue-chromium.png`
  - `Vue-IconField-story-visual-regression-1-vue-firefox.png`
  - `Vue-IconField-story-visual-regression-1-vue-webkit.png`
  - `Vue-IftaLabel-story-visual-regression-1-vue-chromium.png`
  - `Vue-IftaLabel-story-visual-regression-1-vue-firefox.png`
  - `Vue-IftaLabel-story-visual-regression-1-vue-webkit.png`
  - `Vue-InputChips-story-visual-regression-1-vue-chromium.png`
  - `Vue-InputChips-story-visual-regression-1-vue-firefox.png`
  - `Vue-InputChips-story-visual-regression-1-vue-webkit.png`
  - `Vue-InputGroup-story-visual-regression-1-vue-chromium.png`
  - `Vue-InputGroup-story-visual-regression-1-vue-firefox.png`
  - `Vue-InputGroup-story-visual-regression-1-vue-webkit.png`
  - `Vue-InputNumber-story-visual-regression-1-vue-chromium.png`
  - `Vue-InputNumber-story-visual-regression-1-vue-firefox.png`
  - `Vue-InputNumber-story-visual-regression-1-vue-webkit.png`
  - `Vue-InputOtp-story-visual-regression-1-vue-chromium.png`
  - `Vue-InputOtp-story-visual-regression-1-vue-firefox.png`
  - `Vue-InputOtp-story-visual-regression-1-vue-webkit.png`
  - `Vue-InputText-story-visual-regression-1-vue-chromium.png`
  - `Vue-InputText-story-visual-regression-1-vue-firefox.png`
  - `Vue-InputText-story-visual-regression-1-vue-webkit.png`
  - `Vue-MultiSelect-story-visual-regression-1-vue-chromium.png`
  - `Vue-MultiSelect-story-visual-regression-1-vue-firefox.png`
  - `Vue-MultiSelect-story-visual-regression-1-vue-webkit.png`
  - `Vue-SelectButton-story-visual-regression-1-vue-chromium.png`
  - `Vue-SelectButton-story-visual-regression-1-vue-firefox.png`
  - `Vue-SelectButton-story-visual-regression-1-vue-webkit.png`
  - `Vue-ToggleButton-story-visual-regression-1-vue-chromium.png`
  - `Vue-ToggleButton-story-visual-regression-1-vue-firefox.png`
  - `Vue-ToggleButton-story-visual-regression-1-vue-webkit.png`
  - `Vue-ToggleSwitch-story-visual-regression-1-vue-chromium.png`
  - `Vue-ToggleSwitch-story-visual-regression-1-vue-firefox.png`
  - `Vue-ToggleSwitch-story-visual-regression-1-vue-webkit.png`
- `packages/vue/e2e/paginator.spec.ts-snapshots/` (9)
  - `Vue-Paginator-Default-story-visual-regression-1-vue-chromium.png`
  - `Vue-Paginator-Default-story-visual-regression-1-vue-firefox.png`
  - `Vue-Paginator-Default-story-visual-regression-1-vue-webkit.png`
  - `Vue-Paginator-Empty-story-visual-regression-1-vue-chromium.png`
  - `Vue-Paginator-Empty-story-visual-regression-1-vue-firefox.png`
  - `Vue-Paginator-Empty-story-visual-regression-1-vue-webkit.png`
  - `Vue-Paginator-Middle-Page-story-visual-regression-1-vue-chromium.png`
  - `Vue-Paginator-Middle-Page-story-visual-regression-1-vue-firefox.png`
  - `Vue-Paginator-Middle-Page-story-visual-regression-1-vue-webkit.png`
- `packages/vue/e2e/table.spec.ts-snapshots/` (3)
  - `Vue-Table-Paginated-story-visual-regression-1-vue-chromium.png`
  - `Vue-Table-Paginated-story-visual-regression-1-vue-firefox.png`
  - `Vue-Table-Paginated-story-visual-regression-1-vue-webkit.png`

## 14. macOS/Linux-only failures versus real visual changes

The 263 failures of the macOS run (Section 1) split into 120 real Tranche 1 changes (the 40 tests above) and 143 platform-noise runs (49 tests, Section 5). The 143 were not re-baselined: their committed baselines are already Linux renders from `fb74a8b`. The Docker verification runs (Sections 17 and 20) confirm they are noise: all 143 pass against the unchanged Linux baselines.

Unexpected Tranche 1 visual changes (group C): **0**. All 120 Tranche 1 screenshot changes are in groups A and B, and no existing Linux baseline outside the approved set changed or needed to change. The 14 additional baselines of Section 19 are platform-only (no Tranche 1 visual change): they were recorded on macOS in Task 1 and only differ by Linux text anti-aliasing.

## 15. Angular Badge accessibility exceptions (approved parity exception)

User decision 2026-10-04: the new Angular Badge colour-contrast violations are accepted as a parity exception (upstream Aura palette). Badge colours and implementation are unchanged.

| Fingerprint (as produced by the scan)      | Story             | Measured                                                                   | Browsers                  |
| ------------------------------------------ | ----------------- | -------------------------------------------------------------------------- | ------------------------- |
| `color-contrast:ng-badge--large:u-badge`   | ng-badge--large   | white `#ffffff` on `#10b981`, 14px bold, **2.53:1** (needs 4.5:1), serious | chromium, firefox, webkit |
| `color-contrast:ng-badge--success:u-badge` | ng-badge--success | white `#ffffff` on `#22c55e`, 12px bold, **2.27:1** (needs 4.5:1), serious | chromium, firefox, webkit |

`ng-badge--default` has no colour-contrast violation. Fingerprints do not include the browser, so the 6 violation nodes are covered by 2 rows, added to `docs/architecture/ACCESSIBILITY_BASELINE.md` directly after each story's existing `region` row. The note on both rows contains "GAP-064 Tranche 1 — upstream Aura badge palette parity exception (user-approved 2026-10-04)".

Validation per framework, run as CI does (`.github/workflows/ci.yml`) against the envelopes of the Docker verification run:

| Framework | Before baseline edit                                                                                       | After baseline edit                         |
| --------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| ng        | FAIL: 6 new violations, only color-contrast on `ng-badge--large` and `ng-badge--success` (3 browsers each) | OK: scanned 260 violation node(s), zero new |
| react     | OK: scanned 189 node(s)                                                                                    | OK: scanned 189 node(s)                     |
| vue       | OK: scanned 216 node(s)                                                                                    | OK: scanned 216 node(s)                     |

The react and vue node counts differ from the macOS run (198 and 219); not investigated, the result is the same (zero new violations). `node --test scripts/provenance/validate-accessibility-baseline.test.mjs` passes (12 of 12) with the edited file.

## 16. The seven unchanged Task 1 tests (diagnosis summary)

Source: `.superpowers/sdd/2026-10-04-gap-064-tranche-1-aura-key-wiring/task-6-diagnosis.md`. It was a read-only diagnosis against the post-change code: computed styles with and without each component's `<key>-variables` style element, plus a re-implementation of Playwright's pixel metric (threshold 0.2, so max YIQ delta about 1409).

Correction to Section 6: "unchanged" holds for only 5 of the 7. **Ng and Vue RadioButton DID change.** Before the key rename the radiobutton variables were undefined, so the control collapsed to a 0x0 box with no border. After it, the control is a 20x20 circle with a 1px `#cbd5e1` border on `#ffffff`. That is 193 differing pixels (bbox (15,16)-(36,39)) with max delta 991, below the tolerance of 1409, so `toHaveScreenshot()` passes under the default threshold. The test cannot see the change; this is a test-sensitivity issue, not a wiring issue.

| Test            | Post-change vs pre-change baseline     | Cause                                                                                                                                                                                                                                                                                                                            |
| --------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ng DatePicker   | 0 px                                   | The story renders only the closed state; no rendered element matches a rule that uses a `--u-datepicker-*` variable (trigger, panel and header rules target classes that are not in the DOM). The input carries `u-date-picker-input` only.                                                                                      |
| Vue DatePicker  | 0 px                                   | Same as Ng DatePicker. The rename took effect (`datepicker-variables` holds 149 tokens) but nothing on screen consumes them.                                                                                                                                                                                                     |
| Ng RadioButton  | 193 px, max delta 991 (tolerance 1409) | Real change, invisible to the test (above).                                                                                                                                                                                                                                                                                      |
| Vue RadioButton | 193 px, max delta 991 (tolerance 1409) | Same as Ng RadioButton.                                                                                                                                                                                                                                                                                                          |
| Ng IconField    | 0 px                                   | The story does not register `u-input-icon` (console `NG0304: 'u-input-icon' is not a known element`), so `.u-input-icon`, the only rule using `--u-iconfield-*`, never matches. The input is a plain `<input class="u-input-text">`, while InputText's structural CSS targets `.u-inputtext`, so the field stays a native input. |
| Ng InputGroup   | 0 px                                   | The story does not register `u-input-group-addon` (`NG0304`), so `.u-input-group-addon`, the only rule using the new `--u-inputgroup-addon-*` variables, never matches. The story input is plain `u-input-text` and not a `.u-component`.                                                                                        |
| Ng InputNumber  | 0 px                                   | `Default` is an empty story; every token-bearing rule targets spinner-button or clear-icon classes that are not rendered, and the inner `u-inputnumber-input` gets no InputText styling. This is the already-recorded, out-of-scope Angular InputNumber structural-parity finding.                                               |

Related recorded findings: the Angular IconField and InputGroup stories use a plain `u-input-text` input instead of a real `UInputText`; new detail from the diagnosis is that their child components (`UInputIcon`, `UInputGroupAddon`) are not registered in the stories (NG0304). None of this was fixed.

In Linux Docker (Section 17): the committed baselines of these 7 tests were recorded on macOS in Task 1. RadioButton (ng x3, vue x3) and Ng InputNumber webkit passed against them; the other 14 runs failed on text anti-aliasing only. Those 14 were subsequently regenerated under Linux by user decision (Section 19); RadioButton is a recorded follow-up (Section 20).

## 17. Docker verification results (fresh container, no update)

A fresh container of the same image on a new export: `git archive HEAD` (57f93a0) with the 120 regenerated PNGs overlaid, a fresh `pnpm install --frozen-lockfile` (281 s) and `pnpm run build` (33 s), then all 9 Storybook projects with `CI=true` and `--reporter=list,json`. The accessibility check in Section 15 used this run's envelopes.

| Run                        | Passed | Flaky | Failed | Duration |
| -------------------------- | ------ | ----- | ------ | -------- |
| 9 projects (807 test runs) | 792    | 1     | 14     | 10.4 min |

Per project (passed / flaky / failed): ng-chromium 99/0/4, ng-firefox 99/0/4, ng-webkit 100/0/3, vue-chromium 93/0/1, vue-firefox 93/0/1, vue-webkit 93/0/1, react-chromium 72/0/0, react-firefox 72/0/0, react-webkit 71/1/0.

- All 40 approved tests x 3 browsers (120 runs): passed.
- All 143 previously macOS-noise runs: passed (they are Linux baselines).
- 14 failures, all `toHaveScreenshot` mismatches, all in the unchanged Task 1 tests whose baselines were recorded on macOS (each failed after 2 retries):
  - Ng DatePicker: chromium 99 px, firefox 577 px, webkit 183 px
  - Ng IconField: chromium 128 px, firefox 801 px, webkit 314 px
  - Ng InputGroup: chromium 9 px, firefox 2662 px, webkit 153 px
  - Ng InputNumber: chromium 86 px, firefox 405 px (webkit passes)
  - Vue DatePicker: chromium 99 px, firefox 577 px, webkit 183 px
- Non-screenshot failures: none. One flaky test, which passed on retry: `[react-webkit] packages/react/e2e/dialog.spec.tsx:44:3 React/Dialog > Default story: accessibility scan`, error `frame.evaluate: Error: Axe is already running. Use await axe.run() to wait for the previous run to finish before starting a new run.` This is the same environment/load flake class recorded at `0608e6d` in the closeout, not a regression.

The 14 failures were not caused by Tranche 1. They would have failed on Linux CI while their macOS-recorded baselines stayed. This first verification run is historical: the user then approved regenerating exactly those 14 under Linux (Section 19), and the final verification is in Section 20. The `Axe is already running` flake above was classified by the user as unrelated infrastructure (Section 20); it was never converted into a baseline or source change.

## 18. State after the first Docker pass (historical)

After the first pass the working tree had the 120 modified PNGs of Section 13, the modified `docs/architecture/ACCESSIBILITY_BASELINE.md` (2 rows added) and this untracked record. The 14 failing runs of Section 17 were open at that point; they are closed by Section 19.

## 19. Additional platform-only baselines (user decision, binding)

The user approved regenerating, in Linux Docker, only the macOS-recorded baselines of five unchanged Task 1 tests, to prevent known Linux CI failures. They have no Tranche 1 visual change: the diagnosis (Section 16) shows 0 differing pixels against the pre-change render, and the Linux failures were text anti-aliasing against the macOS baseline.

Environment: identical to Section 12 (`mcr.microsoft.com/playwright:v1.63.0-jammy` linux/arm64, Node v24.20.0, pnpm 9.6.0, `CI=true`, `--ipc=host`), a fresh container on an export of the working tree's tracked files (including the 120 approved PNGs and the edited baseline document), fresh `pnpm install --frozen-lockfile` (223 s) and `pnpm run build` (43 s).

Selection (`--list` first; exactly 5 tests, 15 runs):

- `packages/ng/e2e/aura-token-wiring.spec.ts`, `-g "Ng/(DatePicker|IconField|InputGroup|InputNumber) story: visual regression"`, projects `ng-chromium`, `ng-firefox`, `ng-webkit`: 12 runs.
- `packages/vue/e2e/aura-token-wiring.spec.ts`, `-g "Vue/DatePicker story: visual regression"`, projects `vue-chromium`, `vue-firefox`, `vue-webkit`: 3 runs.

Command: the same selection with `--update-snapshots=changed --reporter=list`. Result: ng 12 passed (40 s), vue 3 passed (27 s). The md5 of all 342 snapshot PNGs before and after showed **exactly 14 changed**, none added or removed. Only those 14 were copied back:

- `packages/ng/e2e/aura-token-wiring.spec.ts-snapshots/` (11)
  - `Ng-DatePicker-story-visual-regression-1-ng-chromium.png`
  - `Ng-DatePicker-story-visual-regression-1-ng-firefox.png`
  - `Ng-DatePicker-story-visual-regression-1-ng-webkit.png`
  - `Ng-IconField-story-visual-regression-1-ng-chromium.png`
  - `Ng-IconField-story-visual-regression-1-ng-firefox.png`
  - `Ng-IconField-story-visual-regression-1-ng-webkit.png`
  - `Ng-InputGroup-story-visual-regression-1-ng-chromium.png`
  - `Ng-InputGroup-story-visual-regression-1-ng-firefox.png`
  - `Ng-InputGroup-story-visual-regression-1-ng-webkit.png`
  - `Ng-InputNumber-story-visual-regression-1-ng-chromium.png`
  - `Ng-InputNumber-story-visual-regression-1-ng-firefox.png`
- `packages/vue/e2e/aura-token-wiring.spec.ts-snapshots/` (3)
  - `Vue-DatePicker-story-visual-regression-1-vue-chromium.png`
  - `Vue-DatePicker-story-visual-regression-1-vue-firefox.png`
  - `Vue-DatePicker-story-visual-regression-1-vue-webkit.png`

`Ng-InputNumber-story-visual-regression-1-ng-webkit.png` was **not** rewritten: `--update-snapshots=changed` only rewrites images that fail, and that baseline already passed on Linux in the first verification run (Section 17).

Final baseline set: **134 images** = 120 (Section 13) + 14 (this section).

## 20. Final Docker verification and decisions

### Final Docker verification (fresh container, no update)

A fresh container of the same image on an export of the working tree's tracked files with all 134 PNGs and the edited `ACCESSIBILITY_BASELINE.md` (install 226 s, build 37 s). `CI=true`, no `--update-snapshots`, `--reporter=list,json`, all Playwright projects.

| Run                                  | Passed | Flaky | Failed | Duration              |
| ------------------------------------ | ------ | ----- | ------ | --------------------- |
| 9 Storybook projects (807 test runs) | 807    | 0     | 0      | part of the run below |
| 3 SSR projects (28 test runs)        | 28     | 0     | 0      | part of the run below |
| Whole run (835 test runs)            | 835    | 0     | 0      | 8.3 min (498.9 s)     |

Per Storybook project (all passed): ng-chromium 103, ng-firefox 103, ng-webkit 103, vue-chromium 94, vue-firefox 94, vue-webkit 94, react-chromium 72, react-firefox 72, react-webkit 72. SSR: ng-ssr-chromium 10, vue-ssr-chromium 9, react-ssr-chromium 9.

- Screenshot failures: **0**. The 120 approved runs, the 14 runs of Section 19, the 143 earlier platform-noise runs and RadioButton all pass.
- Unexpected Tranche 1 visual changes: **0**.
- The `Axe is already running` flake of Section 17 did not recur in this run.

### Accessibility (CI form, per framework, this run's envelopes)

`node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/<framework>/**/*.json"`:

| Framework | Result                                      |
| --------- | ------------------------------------------- |
| ng        | OK: scanned 259 violation node(s), zero new |
| react     | OK: scanned 185 violation node(s), zero new |
| vue       | OK: scanned 217 violation node(s), zero new |

The only change to `docs/architecture/ACCESSIBILITY_BASELINE.md` is the two approved Angular Badge entries of Section 15 (`color-contrast:ng-badge--large:u-badge`, `color-contrast:ng-badge--success:u-badge`). Node counts differ by a few between runs; the result is the same.

### User decisions (binding)

1. The 14 platform-only baselines of Section 19 are approved, to prevent known Linux CI failures. No other baseline was regenerated.
2. **RadioButton (Ng and Vue) is recorded only.** The observed real visual change (0x0 to a 20x20 bordered circle, 193 px, max delta 991) is within Playwright's default tolerance (about 1409), so its existing baselines pass unchanged. No implementation, tolerance or baseline change was made. Stricter tolerance or coverage for these stories is a future follow-up.
3. The React WebKit `Dialog > Default story: accessibility scan` `Axe is already running` flake is **unrelated infrastructure** (same class as `0608e6d`). It is never converted into a baseline or source change.

## 21. Final state

Committed state: 134 PNGs (120 + 14), `docs/architecture/ACCESSIBILITY_BASELINE.md` (2 Badge rows) and this record. Containers and exported source trees were removed. No source, test, story, CSS, Playwright config or screenshot tolerance change. Nothing pushed.
