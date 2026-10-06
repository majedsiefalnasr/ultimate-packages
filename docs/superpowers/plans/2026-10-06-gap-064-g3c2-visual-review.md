# GAP-064 G3-C2 Visual and Accessibility Review Record (Plan Task 10)

**Status:** Task 10 Step 1 record, prepared for the Step 2 HARD USER STOP. No baseline, snapshot or `ACCESSIBILITY_BASELINE.md` change has been made, and nothing is staged or committed. This record states facts for the user's decision; it approves no screenshot or accessibility row.

**Branch / HEAD:** `feature/gap-064-g3c2-menus` @ `c2abcea` (clean). The after run is `0344039` (`git archive`); `c2abcea` adds only the validator, its test, the pre-existing evidence file and CI wiring, and changes no style module, story or e2e spec.

## Artifact locations

- `SDD` = `.superpowers/sdd/2026-10-06-gap-064-g3c2-menus/` (git-ignored); `$W` = `SDD/docker/`.
- **Before** images: the committed baselines `packages/{ng,vue}/e2e/g3c2-aura-styles.spec.ts-snapshots/` (81 files: ng 36, vue 45), recorded in Linux Docker at `<beforeSha>` `6ef9dd4` and committed in `6fb1738`; evidence `$W/before/before-evidence.txt`.
- **After** images: `$W/after/test-results/<test-dir>/<name>-1-{actual,expected,diff}.png` from the Docker `c2` run at `0344039`, `--retries=0`; log `$W/c2.log`. Missing-baseline cases have only `-actual.png`.
- **Review composites** (review aid, not kept in the repo): `<scratchpad>/vr/<Name>-<engine>.png`, a crop of before (top), after (middle) and Playwright diff (bottom). All 99 were checked pixel-exact against their source PNGs (before and after panels). Contact sheet with the chromium composites embedded: `<scratchpad>/g3c2-visual-review.html`. `<scratchpad>` = `/private/tmp/claude-501/-Users-majedsiefalnasr-Documents-Work-Ultimate-Solutions-EGY-ultimate/a5df1f68-4695-465f-9b5f-f0d0a0a502d4/scratchpad`.

---

## 1. Environment

| Item                 | Value                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Image                | `mcr.microsoft.com/playwright:v1.63.0-jammy`, aarch64 (Docker on macOS arm64)                                                          |
| `<beforeSha>`        | `6ef9dd4` (Plan Task 2 run 2; baselines committed `6fb1738`)                                                                           |
| `<afterSha>`         | `0344039` (Plan Task 9 c2 run 2, `$W/c2.log`, `$W/after/`)                                                                             |
| Retries              | `--retries=0` (AC12: first attempt only)                                                                                               |
| Screenshot tolerance | `playwright.config.ts`: `toHaveScreenshot.threshold = 0.2` (per-pixel YIQ), `maxDiffPixelRatio` unset; viewport 1280×720 = 921,600 px  |
| Summary              | `99 failed`, `150 passed`; all 99 failures are `toHaveScreenshot` (81 pixel diffs, 18 missing baselines); 0 failures of any other kind |

---

## 2. Category totals (99 screenshots)

Each screenshot has one primary category, assigned with the precedence unexpected > F-3a > F-3b > new baseline > expected; the secondary tag column keeps the other applicable labels.

| Category                                         | Count  | Screenshots                                                                                                                                                                                                                                              |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| expected token/structure change                  | 63     | TieredMenu Default/ItemStates (ng+vue), Vue TieredMenu open L1/L2, Menubar Default/ItemStates (ng+vue), Ng Menubar WithDisabledItem, Vue Menubar open L1/L2, MegaMenu Default/ItemStates/open (ng+vue), ContextMenu ItemStates open (ng+vue); x3 engines |
| F-3a correction                                  | 0      | none as primary: every PanelMenu screenshot shows the F-3a correction **and** U-1/U-2, so all are classed unexpected (tag "also: F-3a correction")                                                                                                       |
| F-3b correction                                  | 12     | Ng TieredMenu open L1/L2, Ng Menubar open L1/L2; x3 engines; all missing-baseline (tag "also: new baseline")                                                                                                                                             |
| new baseline for a before-unreachable open state | 0      | none as primary: the 18 missing baselines are the 12 F-3b rows above and the 6 PanelMenu expanded rows (unexpected)                                                                                                                                      |
| unexpected                                       | 24     | every PanelMenu screenshot: Default, ItemStates, Multiple, ItemStates expanded; ng+vue; x3 engines (U-1, U-2)                                                                                                                                            |
| **Total**                                        | **99** | 81 diffs + 18 missing baselines                                                                                                                                                                                                                          |

Pixel diffs vs missing baselines: 81 / 18. Missing baselines: ng Menubar open L1/L2, TieredMenu open L1/L2, PanelMenu expanded; vue PanelMenu expanded; each x3 engines.

---

## 3. UNEXPECTED items and observations

### Unexpected

- **U-1 — PanelMenu root list renders with UA list styling (all 24 PanelMenu screenshots, ng+vue, all engines).** A filled disc bullet marker sits left of every top-level panel; the panels are indented by the UA `ul` inline-start padding (left border at x=56 instead of the story origin x=16) and pushed down by the UA top margin (top border at y=32 instead of 16). The disabled Settings panel's bullet is dimmed with it. Cause (from the source): the Spec §4 C-6 mapping sends `.p-panelmenu-submenu` (which carries `margin:0; padding:…; list-style:none`) only to `.u-panelmenu-item .u-panelmenu-submenu` ("never the root list"), so the root `ul.u-panelmenu-submenu` gets no reset. Upstream has no root list (panels are `div.p-panelmenu-panel` children of `.p-panelmenu`), so upstream shows no bullets or indent. Nested lists are correct (no bullets).
- **U-2 — PanelMenu panels have no gap (same 24 screenshots).** Adjacent top-level panels touch: in every engine the column at x=600 shows two consecutive `#e2e8f0` border rows (chromium y=75–76 and 119–120), i.e. a 2 px line between panels, where upstream separates panels by `panelmenu.gap` (`0.5rem`). The ported rule `.u-panelmenu{display:flex;flex-direction:column;gap:dt('panelmenu.gap')}` has one child (the root `ul`), so the gap applies to nothing.
- **U-3 — MegaMenu disabled column item is not dimmed (pre-existing, unchanged; 6 MegaMenu ItemStates open screenshots).** Story item `Item A2` (`disabled: true`, inside a column) renders at `rgb(51,65,85)`, identical to the enabled `Item A1`/`Item B1`, in all engines and both frameworks, while disabled root items (Services, Contact) are dimmed to `rgb(132,140,152)`. Column items are rendered with `cx('item')` without the disabled param (`packages/vue/src/mega-menu/MegaMenuColumnGroup.vue:5`, `packages/ng/src/mega-menu/mega-menu-column.ts:38`) and carry neither `u-megamenu-item-disabled` nor `data-u-disabled`, so neither the pre-port rule nor D3 matches. Before was also undimmed, so it is not a pixel change; it is recorded because accepting these baselines records a disabled item that looks enabled. The screenshot rows keep their primary category (expected) with the flag.

### Observations (explained, recorded for the decision)

- **O-1 — Menubar and MegaMenu first-level overlays overlap the bar.** With R-M2 dropped the Menubar submenu is at its static position `[29,57,210,79]` (the G-1 measurement), and the MegaMenu overlay top is also y=57. The bar spans y=16–65, so each overlay covers the bar's bottom 9 px (padding and bottom border) for its width. This is what the user's R-M2 decision accepted (Spec §17 G-1); listed so the baseline is accepted knowingly.
- **O-2 — PanelMenu expanded baseline captures a hover state.** `Documents` (nested) shows the `#f1f5f9` hover background because the scenario's last click leaves the pointer on it. Same in all engines and both frameworks; a scenario property, not a CSS change.
- **O-3 — Spec §9.2 lists a ContextMenu Global right-click open state; the c2 suite has no such test** (only `ContextMenu ItemStates open`, both frameworks). Coverage gap, not a screenshot difference.
- **O-4 — Ng Menubar Default is offset 8 px right of Vue** because the Angular story gives File `icon: "pi pi-file"` (empty icon span + gap; no icon font in Storybook). Same before and after; story data.
- **O-5 — Fonts.** Chromium renders story text in a serif fallback, Firefox and WebKit in a sans-serif, before and after. Cross-engine differences are otherwise limited to text metrics (e.g. PanelMenu panel height 43 / 46 / 50 px in chromium / firefox / webkit); no structural cross-engine inconsistency was found in the composites viewed or in the after-image bounding boxes.
- **O-6 — X3B.** Before, disabled items' links were already dimmed by the old `[data-u-disabled="true"] .u-<key>-item-link { opacity: 0.6 }` rules while the item itself had opacity 1 (the X3B before failures). After, D3 puts `disabled.opacity` 0.6 on the item. The visual dimming is similar; the element carrying it changed, as intended.

---

## 4. Changed G3-C2 screenshots, by story

**How reviewed.** The chromium composite of every story x framework was viewed (Vue PanelMenu ItemStates / expanded are byte-identical to the Angular composites and Multiple is byte-identical to Default within each framework, verified by hash, so those were viewed once). Firefox/WebKit spot checks: Ng PanelMenu expanded (webkit), Ng TieredMenu open L2 (firefox), Vue Menubar open L2 (webkit), Ng MegaMenu open (webkit), Vue ContextMenu open (firefox); all consistent with chromium apart from fonts. Colours quoted are sampled from the after PNGs. After images are byte-identical between Angular and Vue for every ItemStates story (rest and open) in every engine.

**Pixel column:** Playwright's "N pixels are different" (after the 0.2 tolerance), with the exact share of the 921,600-pixel page; Playwright prints every ratio as `0.01`. The counts understate the visible change: light colours such as the `#e2e8f0` borders and `#f1f5f9` backgrounds against white fall inside the 0.2 tolerance, so mostly text and glyph pixels are counted (for example, the PanelMenu panels that appear from a blank page count only 184–244 px).

**Path columns:** Before = `packages/<fw>/e2e/g3c2-aura-styles.spec.ts-snapshots/<file>`; After = `$W/after/test-results/<dir>/<file>` (the `-diff.png` sits beside it for pixel diffs).

### TieredMenu Default

- **ng** — category **expected token/structure change**. Before: unstyled "File ▸ / Edit ▸" in black at the page origin. After: an inline-block panel 202 px wide (R-M3; G-3 measured 202×113 with it), 1 px `#e2e8f0` border, rounded corners, list padding; items padded, labels slate, the `▸` glyph small, light slate and pushed to the right edge. Both items carry a submenu in the Angular story.
- **vue** — category **expected token/structure change**. Before: unstyled list, labels in UA link blue `rgb(0,0,238)`. After: identical panel geometry to Angular (border box x 16–218, y 16–92 in all engines). Story data differs from Angular: Vue `Edit` has no submenu, so it shows no glyph (pre-existing).

| FW  | Engine   | Pixels                                   | Category                        | Before                                                   | After                                                                                                                |
| --- | -------- | ---------------------------------------- | ------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 218 px (0.0237%; Playwright prints 0.01) | expected token/structure change | `Ng-TieredMenu-Default-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-TieredMenu-Default-G3-C2-visual-ng-chromium/Ng-TieredMenu-Default-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 300 px (0.0326%; Playwright prints 0.01) | expected token/structure change | `Ng-TieredMenu-Default-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-TieredMenu-Default-G3-C2-visual-ng-firefox/Ng-TieredMenu-Default-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 278 px (0.0302%; Playwright prints 0.01) | expected token/structure change | `Ng-TieredMenu-Default-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-TieredMenu-Default-G3-C2-visual-ng-webkit/Ng-TieredMenu-Default-G3-C2-visual-1-actual.png`      |
| vue | chromium | 202 px (0.0219%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-Default-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-TieredMenu-Default-G3-C2-visual-vue-chromium/Vue-TieredMenu-Default-G3-C2-visual-1-actual.png` |
| vue | firefox  | 288 px (0.0312%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-Default-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-TieredMenu-Default-G3-C2-visual-vue-firefox/Vue-TieredMenu-Default-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 265 px (0.0288%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-Default-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-TieredMenu-Default-G3-C2-visual-vue-webkit/Vue-TieredMenu-Default-G3-C2-visual-1-actual.png`   |

### TieredMenu ItemStates

- **ng** — category **expected token/structure change**. After (byte-identical to Vue): File `rgb(30,41,59)`; disabled Edit (with `▸`) and Archived at `disabled.opacity` 0.6 (darkest text pixel `rgb(132,140,152)`); a 1 px separator line between Edit and Archived (not visible before). Before, Edit/Archived were already grey: the old link-level rule dimmed the link while the item kept opacity 1 (X3B).
- **vue** — category **expected token/structure change**. As Angular. Before: blue links, disabled ones lighter blue (old link-level dimming); after identical to Angular.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                      | After                                                                                                                      |
| --- | -------- | ---------------------------------------- | ------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 382 px (0.0414%; Playwright prints 0.01) | expected token/structure change | `Ng-TieredMenu-ItemStates-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-G3-C2-visual-ng-chromium/Ng-TieredMenu-ItemStates-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 495 px (0.0537%; Playwright prints 0.01) | expected token/structure change | `Ng-TieredMenu-ItemStates-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-G3-C2-visual-ng-firefox/Ng-TieredMenu-ItemStates-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 496 px (0.0538%; Playwright prints 0.01) | expected token/structure change | `Ng-TieredMenu-ItemStates-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-G3-C2-visual-ng-webkit/Ng-TieredMenu-ItemStates-G3-C2-visual-1-actual.png`      |
| vue | chromium | 382 px (0.0414%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-TieredMenu-ItemStates-G3-C2-visual-vue-chromium/Vue-TieredMenu-ItemStates-G3-C2-visual-1-actual.png` |
| vue | firefox  | 492 px (0.0534%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-TieredMenu-ItemStates-G3-C2-visual-vue-firefox/Vue-TieredMenu-ItemStates-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 498 px (0.0540%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-TieredMenu-ItemStates-G3-C2-visual-vue-webkit/Vue-TieredMenu-ItemStates-G3-C2-visual-1-actual.png`   |

### TieredMenu ItemStates open L1

- **ng** — category **F-3b correction** (also: new baseline (no before; the open state was unreachable)). No before image (F-3b: the Angular submenu never became visible, so the open scenario failed before). After: File item has the `#f1f5f9` focus background; the level-1 submenu is a bordered, shadowed panel starting at the root's right edge, top aligned with the File row (`inset-inline-start:100%; top:0`). Identical to Vue after.
- **vue** — category **expected token/structure change**. Before: the submenu showed as unstyled blue text ("New / Open ▸") beside the root list. After: byte-identical to Angular L1.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                            | After                                                                                                                                 |
| --- | -------- | ---------------------------------------- | ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                        | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-open-L1-G3-C2-open-ng-chromium/Ng-TieredMenu-ItemStates-open-L1-G3-C2-open-1-actual.png`   |
| ng  | firefox  | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                        | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-open-L1-G3-C2-open-ng-firefox/Ng-TieredMenu-ItemStates-open-L1-G3-C2-open-1-actual.png`    |
| ng  | webkit   | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                        | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-open-L1-G3-C2-open-ng-webkit/Ng-TieredMenu-ItemStates-open-L1-G3-C2-open-1-actual.png`     |
| vue | chromium | 648 px (0.0703%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-open-L1-G3-C2-open-1-vue-chromium.png` | `g3c2-aura-styles-Vue-Tiere-36499-emStates-open-L1-G3-C2-open-vue-chromium/Vue-TieredMenu-ItemStates-open-L1-G3-C2-open-1-actual.png` |
| vue | firefox  | 808 px (0.0877%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-open-L1-G3-C2-open-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-Tiere-36499-emStates-open-L1-G3-C2-open-vue-firefox/Vue-TieredMenu-ItemStates-open-L1-G3-C2-open-1-actual.png`  |
| vue | webkit   | 783 px (0.0850%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-open-L1-G3-C2-open-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-Tiere-36499-emStates-open-L1-G3-C2-open-vue-webkit/Vue-TieredMenu-ItemStates-open-L1-G3-C2-open-1-actual.png`   |

### TieredMenu ItemStates open L2

- **ng** — category **F-3b correction** (also: new baseline (no before)). No before image (F-3b). After: as L1 plus Open highlighted and a second panel ("Recent") at the level-1 panel's right edge, top aligned with Open. Identical to Vue after.
- **vue** — category **expected token/structure change**. Before: unstyled text "New / Open ▸ … Recent". After: byte-identical to Angular L2.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                            | After                                                                                                                                 |
| --- | -------- | ---------------------------------------- | ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                        | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-open-L2-G3-C2-open-ng-chromium/Ng-TieredMenu-ItemStates-open-L2-G3-C2-open-1-actual.png`   |
| ng  | firefox  | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                        | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-open-L2-G3-C2-open-ng-firefox/Ng-TieredMenu-ItemStates-open-L2-G3-C2-open-1-actual.png`    |
| ng  | webkit   | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                        | `g3c2-aura-styles-Ng-TieredMenu-ItemStates-open-L2-G3-C2-open-ng-webkit/Ng-TieredMenu-ItemStates-open-L2-G3-C2-open-1-actual.png`     |
| vue | chromium | 789 px (0.0856%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-open-L2-G3-C2-open-1-vue-chromium.png` | `g3c2-aura-styles-Vue-Tiere-1e34a-emStates-open-L2-G3-C2-open-vue-chromium/Vue-TieredMenu-ItemStates-open-L2-G3-C2-open-1-actual.png` |
| vue | firefox  | 992 px (0.1076%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-open-L2-G3-C2-open-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-Tiere-1e34a-emStates-open-L2-G3-C2-open-vue-firefox/Vue-TieredMenu-ItemStates-open-L2-G3-C2-open-1-actual.png`  |
| vue | webkit   | 941 px (0.1021%; Playwright prints 0.01) | expected token/structure change | `Vue-TieredMenu-ItemStates-open-L2-G3-C2-open-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-Tiere-1e34a-emStates-open-L2-G3-C2-open-vue-webkit/Vue-TieredMenu-ItemStates-open-L2-G3-C2-open-1-actual.png`   |

### Menubar Default

- **ng** — category **expected token/structure change**. Before: "File ▾Edit ▾Help" run together. After: full-width bar, 1 px `#e2e8f0` border, rounded, padded; items spaced, labels slate, `▾` light slate. Angular items sit 8 px further right than Vue's because the Angular Default story gives File `icon: "pi pi-file"` (empty icon span plus 0.5rem gap; no icon font is loaded). Same offset before; story data, not the port.
- **vue** — category **expected token/structure change**. As Angular, without the empty icon offset (Vue Default has no icon).

| FW  | Engine   | Pixels                                   | Category                        | Before                                                | After                                                                                                          |
| --- | -------- | ---------------------------------------- | ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 356 px (0.0386%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-Default-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-Menubar-Default-G3-C2-visual-ng-chromium/Ng-Menubar-Default-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 439 px (0.0476%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-Default-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-Menubar-Default-G3-C2-visual-ng-firefox/Ng-Menubar-Default-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 406 px (0.0441%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-Default-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-Menubar-Default-G3-C2-visual-ng-webkit/Ng-Menubar-Default-G3-C2-visual-1-actual.png`      |
| vue | chromium | 358 px (0.0388%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-Default-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-Menubar-Default-G3-C2-visual-vue-chromium/Vue-Menubar-Default-G3-C2-visual-1-actual.png` |
| vue | firefox  | 440 px (0.0477%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-Default-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-Menubar-Default-G3-C2-visual-vue-firefox/Vue-Menubar-Default-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 406 px (0.0441%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-Default-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-Menubar-Default-G3-C2-visual-vue-webkit/Vue-Menubar-Default-G3-C2-visual-1-actual.png`   |

### Menubar ItemStates

- **ng** — category **expected token/structure change**. After byte-identical to Vue: File, disabled Edit (with `▾`) and disabled Archived at `disabled.opacity`.
- **vue** — category **expected token/structure change**. As Angular; before used blue links.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                   | After                                                                                                                |
| --- | -------- | ---------------------------------------- | ------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 396 px (0.0430%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-ItemStates-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-Menubar-ItemStates-G3-C2-visual-ng-chromium/Ng-Menubar-ItemStates-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 506 px (0.0549%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-ItemStates-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-Menubar-ItemStates-G3-C2-visual-ng-firefox/Ng-Menubar-ItemStates-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 484 px (0.0525%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-ItemStates-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-Menubar-ItemStates-G3-C2-visual-ng-webkit/Ng-Menubar-ItemStates-G3-C2-visual-1-actual.png`      |
| vue | chromium | 396 px (0.0430%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-Menubar-ItemStates-G3-C2-visual-vue-chromium/Vue-Menubar-ItemStates-G3-C2-visual-1-actual.png` |
| vue | firefox  | 504 px (0.0547%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-Menubar-ItemStates-G3-C2-visual-vue-firefox/Vue-Menubar-ItemStates-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 482 px (0.0523%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-Menubar-ItemStates-G3-C2-visual-vue-webkit/Vue-Menubar-ItemStates-G3-C2-visual-1-actual.png`   |

### Menubar WithDisabledItem

- **ng** — category **expected token/structure change**. Before: "File ▾Disabled" with Disabled grey (old link rule). After: Aura bar, Disabled at `disabled.opacity` 0.6 on the item (D3).

| FW  | Engine   | Pixels                                   | Category                        | Before                                                       | After                                                                                                                         |
| --- | -------- | ---------------------------------------- | ------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 325 px (0.0353%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-WithDisabledItem-G3-C2-visual-1-ng-chromium.png` | `g3c2-aura-styles-Ng-Menubar-WithDisabledItem-G3-C2-visual-ng-chromium/Ng-Menubar-WithDisabledItem-G3-C2-visual-1-actual.png` |
| ng  | firefox  | 421 px (0.0457%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-WithDisabledItem-G3-C2-visual-1-ng-firefox.png`  | `g3c2-aura-styles-Ng-Menubar-WithDisabledItem-G3-C2-visual-ng-firefox/Ng-Menubar-WithDisabledItem-G3-C2-visual-1-actual.png`  |
| ng  | webkit   | 405 px (0.0439%; Playwright prints 0.01) | expected token/structure change | `Ng-Menubar-WithDisabledItem-G3-C2-visual-1-ng-webkit.png`   | `g3c2-aura-styles-Ng-Menubar-WithDisabledItem-G3-C2-visual-ng-webkit/Ng-Menubar-WithDisabledItem-G3-C2-visual-1-actual.png`   |

### Menubar ItemStates open L1

- **ng** — category **F-3b correction** (also: new baseline (no before)). No before image (F-3b). After: File highlighted; submenu panel (New / separator / Open ▸) at x=29, y=57, 210×79 (the G-1 "without R-M2" box). The panel's top edge (y=57) sits inside the bar, whose bottom border is at y=65, so it covers the bar's padding and bottom border for its width (observation O-1). Identical to Vue after.
- **vue** — category **expected token/structure change**. Before: unstyled "New / Open ▸" stacked under the bar text. After: byte-identical to Angular L1 (including O-1 overlap).

| FW  | Engine   | Pixels                                   | Category                        | Before                                                         | After                                                                                                                            |
| --- | -------- | ---------------------------------------- | ------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                     | `g3c2-aura-styles-Ng-Menubar-ItemStates-open-L1-G3-C2-open-ng-chromium/Ng-Menubar-ItemStates-open-L1-G3-C2-open-1-actual.png`    |
| ng  | firefox  | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                     | `g3c2-aura-styles-Ng-Menubar-ItemStates-open-L1-G3-C2-open-ng-firefox/Ng-Menubar-ItemStates-open-L1-G3-C2-open-1-actual.png`     |
| ng  | webkit   | missing baseline                         | F-3b correction                 | — (none: missing baseline)                                     | `g3c2-aura-styles-Ng-Menubar-ItemStates-open-L1-G3-C2-open-ng-webkit/Ng-Menubar-ItemStates-open-L1-G3-C2-open-1-actual.png`      |
| vue | chromium | 680 px (0.0738%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-open-L1-G3-C2-open-1-vue-chromium.png` | `g3c2-aura-styles-Vue-Menubar-ItemStates-open-L1-G3-C2-open-vue-chromium/Vue-Menubar-ItemStates-open-L1-G3-C2-open-1-actual.png` |
| vue | firefox  | 872 px (0.0946%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-open-L1-G3-C2-open-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-Menubar-ItemStates-open-L1-G3-C2-open-vue-firefox/Vue-Menubar-ItemStates-open-L1-G3-C2-open-1-actual.png`  |
| vue | webkit   | 806 px (0.0875%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-open-L1-G3-C2-open-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-Menubar-ItemStates-open-L1-G3-C2-open-vue-webkit/Vue-Menubar-ItemStates-open-L1-G3-C2-open-1-actual.png`   |

### Menubar ItemStates open L2

- **ng** — category **F-3b correction** (also: new baseline (no before)). No before image (F-3b). After: as L1 plus Open highlighted and a level-2 panel at the level-1 panel's right edge. Identical to Vue after.
- **vue** — category **expected token/structure change**. Before: unstyled text with "Recent" floating right. After: byte-identical to Angular L2.

| FW  | Engine   | Pixels                                    | Category                        | Before                                                         | After                                                                                                                            |
| --- | -------- | ----------------------------------------- | ------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | missing baseline                          | F-3b correction                 | — (none: missing baseline)                                     | `g3c2-aura-styles-Ng-Menubar-ItemStates-open-L2-G3-C2-open-ng-chromium/Ng-Menubar-ItemStates-open-L2-G3-C2-open-1-actual.png`    |
| ng  | firefox  | missing baseline                          | F-3b correction                 | — (none: missing baseline)                                     | `g3c2-aura-styles-Ng-Menubar-ItemStates-open-L2-G3-C2-open-ng-firefox/Ng-Menubar-ItemStates-open-L2-G3-C2-open-1-actual.png`     |
| ng  | webkit   | missing baseline                          | F-3b correction                 | — (none: missing baseline)                                     | `g3c2-aura-styles-Ng-Menubar-ItemStates-open-L2-G3-C2-open-ng-webkit/Ng-Menubar-ItemStates-open-L2-G3-C2-open-1-actual.png`      |
| vue | chromium | 835 px (0.0906%; Playwright prints 0.01)  | expected token/structure change | `Vue-Menubar-ItemStates-open-L2-G3-C2-open-1-vue-chromium.png` | `g3c2-aura-styles-Vue-Menubar-ItemStates-open-L2-G3-C2-open-vue-chromium/Vue-Menubar-ItemStates-open-L2-G3-C2-open-1-actual.png` |
| vue | firefox  | 1078 px (0.1170%; Playwright prints 0.01) | expected token/structure change | `Vue-Menubar-ItemStates-open-L2-G3-C2-open-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-Menubar-ItemStates-open-L2-G3-C2-open-vue-firefox/Vue-Menubar-ItemStates-open-L2-G3-C2-open-1-actual.png`  |
| vue | webkit   | 974 px (0.1057%; Playwright prints 0.01)  | expected token/structure change | `Vue-Menubar-ItemStates-open-L2-G3-C2-open-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-Menubar-ItemStates-open-L2-G3-C2-open-vue-webkit/Vue-Menubar-ItemStates-open-L2-G3-C2-open-1-actual.png`   |

### MegaMenu Default

- **ng** — category **expected token/structure change**. Before: run-together text. After: bordered full-width bar, padded items, slate labels, light slate `▾`.
- **vue** — category **expected token/structure change**. As Angular; Vue's Default story also has a disabled `Contact` item (story data), dimmed at 0.6 after.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                 | After                                                                                                            |
| --- | -------- | ---------------------------------------- | ------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 384 px (0.0417%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-Default-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-MegaMenu-Default-G3-C2-visual-ng-chromium/Ng-MegaMenu-Default-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 357 px (0.0387%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-Default-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-MegaMenu-Default-G3-C2-visual-ng-firefox/Ng-MegaMenu-Default-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 378 px (0.0410%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-Default-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-MegaMenu-Default-G3-C2-visual-ng-webkit/Ng-MegaMenu-Default-G3-C2-visual-1-actual.png`      |
| vue | chromium | 511 px (0.0554%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-Default-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-MegaMenu-Default-G3-C2-visual-vue-chromium/Vue-MegaMenu-Default-G3-C2-visual-1-actual.png` |
| vue | firefox  | 495 px (0.0537%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-Default-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-MegaMenu-Default-G3-C2-visual-vue-firefox/Vue-MegaMenu-Default-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 504 px (0.0547%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-Default-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-MegaMenu-Default-G3-C2-visual-vue-webkit/Vue-MegaMenu-Default-G3-C2-visual-1-actual.png`   |

### MegaMenu ItemStates

- **ng** — category **expected token/structure change**. After byte-identical to Vue: Products (empty icon offset), Services (disabled, `▾`) and Contact (disabled) dimmed to `rgb(132,140,152)`.
- **vue** — category **expected token/structure change**. As Angular; before used blue links.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                    | After                                                                                                                  |
| --- | -------- | ---------------------------------------- | ------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 542 px (0.0588%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-ItemStates-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-MegaMenu-ItemStates-G3-C2-visual-ng-chromium/Ng-MegaMenu-ItemStates-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 580 px (0.0629%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-ItemStates-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-MegaMenu-ItemStates-G3-C2-visual-ng-firefox/Ng-MegaMenu-ItemStates-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 558 px (0.0605%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-ItemStates-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-MegaMenu-ItemStates-G3-C2-visual-ng-webkit/Ng-MegaMenu-ItemStates-G3-C2-visual-1-actual.png`      |
| vue | chromium | 541 px (0.0587%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-ItemStates-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-MegaMenu-ItemStates-G3-C2-visual-vue-chromium/Vue-MegaMenu-ItemStates-G3-C2-visual-1-actual.png` |
| vue | firefox  | 577 px (0.0626%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-ItemStates-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-MegaMenu-ItemStates-G3-C2-visual-vue-firefox/Vue-MegaMenu-ItemStates-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 555 px (0.0602%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-ItemStates-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-MegaMenu-ItemStates-G3-C2-visual-vue-webkit/Vue-MegaMenu-ItemStates-G3-C2-visual-1-actual.png`   |

### MegaMenu ItemStates open

- **ng** — category **expected token/structure change** (flag U-3 (pre-existing, unchanged)). Before: column text overlapping ("CategoryCategory / A B / Item A1 Item B1 / Item A2"). After (byte-identical to Vue): Products highlighted; a bordered, shadowed overlay panel spanning the bar width directly under it (top y=57, inside the bar's bottom 9 px, O-1); columns "Category A" and "Category B" with muted semi-bold headers (`rgb(100,116,139)`), items Item A1 (8 px icon offset), Item A2, Item B1. **Item A2 is disabled in the story but renders at full colour `rgb(51,65,85)`, identical to the enabled A1/B1 (U-3).**
- **vue** — category **expected token/structure change** (flag U-3 (pre-existing, unchanged)). As Angular.

| FW  | Engine   | Pixels                                    | Category                        | Before                                                       | After                                                                                                                        |
| --- | -------- | ----------------------------------------- | ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 1773 px (0.1924%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-ItemStates-open-G3-C2-open-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-MegaMenu-ItemStates-open-G3-C2-open-ng-chromium/Ng-MegaMenu-ItemStates-open-G3-C2-open-1-actual.png`    |
| ng  | firefox  | 1956 px (0.2122%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-ItemStates-open-G3-C2-open-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-MegaMenu-ItemStates-open-G3-C2-open-ng-firefox/Ng-MegaMenu-ItemStates-open-G3-C2-open-1-actual.png`     |
| ng  | webkit   | 2139 px (0.2321%; Playwright prints 0.01) | expected token/structure change | `Ng-MegaMenu-ItemStates-open-G3-C2-open-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-MegaMenu-ItemStates-open-G3-C2-open-ng-webkit/Ng-MegaMenu-ItemStates-open-G3-C2-open-1-actual.png`      |
| vue | chromium | 1772 px (0.1923%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-ItemStates-open-G3-C2-open-1-vue-chromium.png` | `g3c2-aura-styles-Vue-MegaMenu-ItemStates-open-G3-C2-open-vue-chromium/Vue-MegaMenu-ItemStates-open-G3-C2-open-1-actual.png` |
| vue | firefox  | 1955 px (0.2121%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-ItemStates-open-G3-C2-open-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-MegaMenu-ItemStates-open-G3-C2-open-vue-firefox/Vue-MegaMenu-ItemStates-open-G3-C2-open-1-actual.png`  |
| vue | webkit   | 2135 px (0.2317%; Playwright prints 0.01) | expected token/structure change | `Vue-MegaMenu-ItemStates-open-G3-C2-open-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-MegaMenu-ItemStates-open-G3-C2-open-vue-webkit/Vue-MegaMenu-ItemStates-open-G3-C2-open-1-actual.png`   |

### ContextMenu ItemStates open

- **ng** — category **expected token/structure change**. Before: blue link text Copy / Paste / Delete inside the dashed box, no background. After: white panel with 1 px border, rounded corners and shadow at the same C2-0 position, items Copy, Paste, separator, Delete (disabled, dimmed). The panel is taller and extends below the dashed box.
- **vue** — category **expected token/structure change**. Before: transparent list text drawn over the story's "Right-click here." label. After: same panel as Angular; the label is hidden under the opaque panel except its first letter.

| FW  | Engine   | Pixels                                   | Category                        | Before                                                          | After                                                                                                                              |
| --- | -------- | ---------------------------------------- | ------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 527 px (0.0572%; Playwright prints 0.01) | expected token/structure change | `Ng-ContextMenu-ItemStates-open-G3-C2-open-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-ContextMenu-ItemStates-open-G3-C2-open-ng-chromium/Ng-ContextMenu-ItemStates-open-G3-C2-open-1-actual.png`    |
| ng  | firefox  | 516 px (0.0560%; Playwright prints 0.01) | expected token/structure change | `Ng-ContextMenu-ItemStates-open-G3-C2-open-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-ContextMenu-ItemStates-open-G3-C2-open-ng-firefox/Ng-ContextMenu-ItemStates-open-G3-C2-open-1-actual.png`     |
| ng  | webkit   | 521 px (0.0565%; Playwright prints 0.01) | expected token/structure change | `Ng-ContextMenu-ItemStates-open-G3-C2-open-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-ContextMenu-ItemStates-open-G3-C2-open-ng-webkit/Ng-ContextMenu-ItemStates-open-G3-C2-open-1-actual.png`      |
| vue | chromium | 744 px (0.0807%; Playwright prints 0.01) | expected token/structure change | `Vue-ContextMenu-ItemStates-open-G3-C2-open-1-vue-chromium.png` | `g3c2-aura-styles-Vue-ContextMenu-ItemStates-open-G3-C2-open-vue-chromium/Vue-ContextMenu-ItemStates-open-G3-C2-open-1-actual.png` |
| vue | firefox  | 775 px (0.0841%; Playwright prints 0.01) | expected token/structure change | `Vue-ContextMenu-ItemStates-open-G3-C2-open-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-ContextMenu-ItemStates-open-G3-C2-open-vue-firefox/Vue-ContextMenu-ItemStates-open-G3-C2-open-1-actual.png`  |
| vue | webkit   | 755 px (0.0819%; Playwright prints 0.01) | expected token/structure change | `Vue-ContextMenu-ItemStates-open-G3-C2-open-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-ContextMenu-ItemStates-open-G3-C2-open-vue-webkit/Vue-ContextMenu-ItemStates-open-G3-C2-open-1-actual.png`   |

### PanelMenu Default

- **ng** — category **unexpected** (also: F-3a correction (root list now visible)). Before: blank (root list hidden, 0 px tall, F-3a). After: two top-level panels "▸ Files" and "Settings" with 1 px border, rounded corners and slate labels. **Not explained by the port: U-1 (UA list bullets, 40 px indent, 16 px margin on the root list) and U-2 (no 0.5rem gap between panels; adjacent borders form a 2 px line).** Panels start at x=56, y=32 instead of the story origin (16,16).
- **vue** — category **unexpected** (also: F-3a correction). As Angular with the Vue story's three items. **U-1 (UA list bullets, 40 px indent, 16 px margin on the root list) and U-2 (no 0.5rem gap between panels; adjacent borders form a 2 px line).**

| FW  | Engine   | Pixels                                   | Category   | Before                                                  | After                                                                                                              |
| --- | -------- | ---------------------------------------- | ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ng  | chromium | 184 px (0.0200%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-Default-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-chromium/Ng-PanelMenu-Default-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 239 px (0.0259%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-Default-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-firefox/Ng-PanelMenu-Default-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 233 px (0.0253%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-Default-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-webkit/Ng-PanelMenu-Default-G3-C2-visual-1-actual.png`      |
| vue | chromium | 213 px (0.0231%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-Default-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-chromium/Vue-PanelMenu-Default-G3-C2-visual-1-actual.png` |
| vue | firefox  | 241 px (0.0262%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-Default-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-firefox/Vue-PanelMenu-Default-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 244 px (0.0265%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-Default-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-webkit/Vue-PanelMenu-Default-G3-C2-visual-1-actual.png`   |

### PanelMenu ItemStates

- **ng** — category **unexpected** (also: F-3a correction). After byte-identical to Vue. Settings is dimmed at 0.6 including its bullet marker. **U-1 (UA list bullets, 40 px indent, 16 px margin on the root list) and U-2 (no 0.5rem gap between panels; adjacent borders form a 2 px line).**
- **vue** — category **unexpected** (also: F-3a correction). As Angular.

| FW  | Engine   | Pixels                                   | Category   | Before                                                     | After                                                                                                                    |
| --- | -------- | ---------------------------------------- | ---------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| ng  | chromium | 272 px (0.0295%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-ItemStates-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-chromium/Ng-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 312 px (0.0339%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-ItemStates-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-firefox/Ng-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 304 px (0.0330%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-ItemStates-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-webkit/Ng-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`      |
| vue | chromium | 272 px (0.0295%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-ItemStates-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-chromium/Vue-PanelMenu-ItemStates-G3-C2-visual-1-actual.png` |
| vue | firefox  | 312 px (0.0339%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-ItemStates-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-firefox/Vue-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 304 px (0.0330%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-ItemStates-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-webkit/Vue-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`   |

### PanelMenu Multiple

- **ng** — category **unexpected** (also: F-3a correction). Composite is byte-identical to Angular Default (multiple mode is not visible at rest). **U-1 (UA list bullets, 40 px indent, 16 px margin on the root list) and U-2 (no 0.5rem gap between panels; adjacent borders form a 2 px line).**
- **vue** — category **unexpected** (also: F-3a correction). Composite byte-identical to Vue Default. **U-1 (UA list bullets, 40 px indent, 16 px margin on the root list) and U-2 (no 0.5rem gap between panels; adjacent borders form a 2 px line).**

| FW  | Engine   | Pixels                                   | Category   | Before                                                   | After                                                                                                                |
| --- | -------- | ---------------------------------------- | ---------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | 184 px (0.0200%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-Multiple-G3-C2-visual-1-ng-chromium.png`   | `g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-chromium/Ng-PanelMenu-Multiple-G3-C2-visual-1-actual.png`    |
| ng  | firefox  | 239 px (0.0259%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-Multiple-G3-C2-visual-1-ng-firefox.png`    | `g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-firefox/Ng-PanelMenu-Multiple-G3-C2-visual-1-actual.png`     |
| ng  | webkit   | 233 px (0.0253%; Playwright prints 0.01) | unexpected | `Ng-PanelMenu-Multiple-G3-C2-visual-1-ng-webkit.png`     | `g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-webkit/Ng-PanelMenu-Multiple-G3-C2-visual-1-actual.png`      |
| vue | chromium | 213 px (0.0231%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-Multiple-G3-C2-visual-1-vue-chromium.png` | `g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-chromium/Vue-PanelMenu-Multiple-G3-C2-visual-1-actual.png` |
| vue | firefox  | 241 px (0.0262%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-Multiple-G3-C2-visual-1-vue-firefox.png`  | `g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-firefox/Vue-PanelMenu-Multiple-G3-C2-visual-1-actual.png`  |
| vue | webkit   | 244 px (0.0265%; Playwright prints 0.01) | unexpected | `Vue-PanelMenu-Multiple-G3-C2-visual-1-vue-webkit.png`   | `g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-webkit/Vue-PanelMenu-Multiple-G3-C2-visual-1-actual.png`   |

### PanelMenu ItemStates expanded

- **ng** — category **unexpected** (also: new baseline (no before; F-3a made it unreachable)). No before image (F-3a: no header was visible to click). After (byte-identical to Vue): Files `▾` (R-M4 rotation) with nested Documents `▾`, its children Work and Old (disabled, dimmed), then Photos `▸` (disabled, dimmed); Settings (disabled) and Help panels below. Nested lists have no bullets (group 17 `list-style:none`). Documents carries the `#f1f5f9` hover background because the pointer stays on the last clicked header (observation O-2). **U-1 (UA list bullets, 40 px indent, 16 px margin on the root list) and U-2 (no 0.5rem gap between panels; adjacent borders form a 2 px line).**
- **vue** — category **unexpected** (also: new baseline (no before)). As Angular.

| FW  | Engine   | Pixels           | Category   | Before                     | After                                                                                                                                 |
| --- | -------- | ---------------- | ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ng  | chromium | missing baseline | unexpected | — (none: missing baseline) | `g3c2-aura-styles-Ng-PanelMenu-ItemStates-expanded-G3-C2-open-ng-chromium/Ng-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`   |
| ng  | firefox  | missing baseline | unexpected | — (none: missing baseline) | `g3c2-aura-styles-Ng-PanelMenu-ItemStates-expanded-G3-C2-open-ng-firefox/Ng-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`    |
| ng  | webkit   | missing baseline | unexpected | — (none: missing baseline) | `g3c2-aura-styles-Ng-PanelMenu-ItemStates-expanded-G3-C2-open-ng-webkit/Ng-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`     |
| vue | chromium | missing baseline | unexpected | — (none: missing baseline) | `g3c2-aura-styles-Vue-Panel-2e456-mStates-expanded-G3-C2-open-vue-chromium/Vue-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png` |
| vue | firefox  | missing baseline | unexpected | — (none: missing baseline) | `g3c2-aura-styles-Vue-Panel-2e456-mStates-expanded-G3-C2-open-vue-firefox/Vue-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`  |
| vue | webkit   | missing baseline | unexpected | — (none: missing baseline) | `g3c2-aura-styles-Vue-Panel-2e456-mStates-expanded-G3-C2-open-vue-webkit/Vue-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`   |

---

## 5. Accessibility (Plan Task 9, after run `0344039`)

- G3-C2 accessibility tests: **57/57 passed first attempt** (ng 10 stories, vue 9, x3 engines); every one wrote its envelope (validator: 0 missing reports of 30 / 27).
- Fingerprints (`rule:story:target`, `$W/fingerprints.mjs`, `6ef9dd4` vs `0344039`): **before 85, after 101, pre-existing 85, introduced 16, fixed 0.** Pre-existing rows: `docs/architecture/research/2026-10-06-gap-064-g3c2-accessibility-preexisting.md` (85 rows, committed `c2abcea`).
- Validator `scripts/provenance/validate-g3c2-accessibility.mjs` on the after envelopes: ng `FAIL: 0 missing report(s) of 30, 21 introduced violation node(s)` (7 fingerprints x 3 engines); vue `FAIL: 0 missing report(s) of 27, 27 introduced violation node(s)` (9 x 3).

### INTRODUCED rows (16 fingerprints, 48 nodes)

All 16 are rule **`region`** (axe 4.13.0, impact **`moderate`**, help "All page content should be contained by landmarks", failure summary "Fix any of the following: Some page content is not contained by landmarks"), present in **chromium, firefox and webkit** for every row, all on PanelMenu stories. `region` is not a colour rule: axe reports **no foreground/background colours** for these nodes. Verbatim fingerprints:

```text
region:ng-panelmenu--default:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label
region:ng-panelmenu--default:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2)
region:ng-panelmenu--item-states:.u-panelmenu-item-disabled > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label
region:ng-panelmenu--item-states:.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label
region:ng-panelmenu--item-states:.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(3)
region:ng-panelmenu--multiple:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label
region:ng-panelmenu--multiple:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2)
region:vue-panelmenu--default:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label
region:vue-panelmenu--default:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label
region:vue-panelmenu--default:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(3)
region:vue-panelmenu--item-states:.u-panelmenu-item-disabled > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label
region:vue-panelmenu--item-states:.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label
region:vue-panelmenu--item-states:.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(3)
region:vue-panelmenu--multiple:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label
region:vue-panelmenu--multiple:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label
region:vue-panelmenu--multiple:.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(3)
```

| #   | Story                        | Target                                                                                                                                                                    | Node HTML (axe, truncated)                                                                                                 |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | `ng-panelmenu--default`      | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label`           | `<span class="u-panelmenu-header-label">Files</span>`                                                                      |
| 2   | `ng-panelmenu--default`      | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2)`                                                                                                | `<li role="treeitem" class="u-panelmenu-item" data-u-disabled="false" data-u-expanded="false">`                            |
| 3   | `ng-panelmenu--item-states`  | `.u-panelmenu-item-disabled > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label`                                                         | `<span class="u-panelmenu-header-label">Settings</span>`                                                                   |
| 4   | `ng-panelmenu--item-states`  | `.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label`           | `<span class="u-panelmenu-header-label">Files</span>`                                                                      |
| 5   | `ng-panelmenu--item-states`  | `.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(3)`                                                                                                | `<li role="treeitem" class="u-panelmenu-item" data-u-disabled="false" data-u-expanded="false">`                            |
| 6   | `ng-panelmenu--multiple`     | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link > .u-panelmenu-header-label`           | `<span class="u-panelmenu-header-label">Files</span>`                                                                      |
| 7   | `ng-panelmenu--multiple`     | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2)`                                                                                                | `<li role="treeitem" class="u-panelmenu-item" data-u-disabled="false" data-u-expanded="false">`                            |
| 8   | `vue-panelmenu--default`     | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label` | `<span class="u-panelmenu-header-label">File</span>`                                                                       |
| 9   | `vue-panelmenu--default`     | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label` | `<span class="u-panelmenu-header-label">Edit</span>`                                                                       |
| 10  | `vue-panelmenu--default`     | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(3)`                                                                                                | `<li class="u-panelmenu-item" role="treeitem" data-u-disabled="false" data-u-expanded="false"><div class="u-panelmenu-hea` |
| 11  | `vue-panelmenu--item-states` | `.u-panelmenu-item-disabled > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label`                                               | `<span class="u-panelmenu-header-label">Settings</span>`                                                                   |
| 12  | `vue-panelmenu--item-states` | `.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label` | `<span class="u-panelmenu-header-label">Files</span>`                                                                      |
| 13  | `vue-panelmenu--item-states` | `.u-panelmenu-item[data-u-disabled="false"][role="treeitem"]:nth-child(3)`                                                                                                | `<li class="u-panelmenu-item" role="treeitem" data-u-disabled="false" data-u-expanded="false">`                            |
| 14  | `vue-panelmenu--multiple`    | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(1) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label` | `<span class="u-panelmenu-header-label">File</span>`                                                                       |
| 15  | `vue-panelmenu--multiple`    | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(2) > .u-panelmenu-header-content > .u-panelmenu-header-link[href="#"] > .u-panelmenu-header-label` | `<span class="u-panelmenu-header-label">Edit</span>`                                                                       |
| 16  | `vue-panelmenu--multiple`    | `.u-panelmenu-item[role="treeitem"][data-u-disabled="false"]:nth-child(3)`                                                                                                | `<li class="u-panelmenu-item" role="treeitem" data-u-disabled="false" data-u-expanded="false"><div class="u-panelmenu-hea` |

**Notes (fact).**

- These nodes were never scanned before: the PanelMenu baselines were 0 px tall (root list hidden, F-3a), so the content did not exist for axe. They appear because F-3a made the PanelMenu visible, not because a style rule changed an existing node.
- `region` is already pre-existing on TieredMenu Default and ItemStates (5 ng + 5 vue rows) for the same reason (story content outside any landmark).
- `landmark-one-main` and `page-has-heading-one` (target `html`) are pre-existing on every G3-C2 story (10 ng + 9 vue rows each), including the three PanelMenu stories.
- Angular has 7 fingerprints and Vue 9 because of story data: the Angular Default and Multiple stories have 2 top-level items, the Vue ones 3; ItemStates gives 3 rows in both. In every story the last top-level item is reported as the whole `li` and the earlier ones by their header label.
- **FIXED rows: none.** No accessibility row has been added to `ACCESSIBILITY_BASELINE.md`.

---

## 6. Task 7 gate summary (Spec §8, §17; commit `90aa59a`)

| Gate                                                       | Result                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-1 (R-M2, Menubar first-level submenu `top:100%; left:0`) | First run: KEPT by the mechanical rule, flagged: with R-M2 the submenu box is `[0,720,210,79]` (viewport bottom; no positioned ancestor), without it `[29,57,210,79]`, all 6 combinations. **User decision 2026-10-06: R-M2 dropped** (Spec §6.3 (ii)).                                                 |
| G-2 (PanelMenu focus, PX-M3)                               | First run FAILED 4/6 (chromium ng/vue, webkit ng/vue read mid-transition). Rerun with a 600 ms wait after Tab (user-approved gate-script change): **PASS 6/6**, header-content background = `panelmenu.item.focus.background` `rgb(241,245,249)`; disabled headers not focusable. PX-M3 text unchanged. |
| G-3 (R-M1, R-M3, R-M4)                                     | **All kept.** R-M1: `display` flex vs block, same box (kept per C-5; condition (ii) weak, user decision). R-M3: `.u-tieredmenu` inline-block 202×113 vs block 1248×113. R-M4: glyph `matrix(0,1,-1,0,0,0)` vs `none`. All 6 combinations.                                                               |
| Final D5                                                   | **R-M1, R-M3, R-M4** (`KEPT` in `g3c2-port.mjs`).                                                                                                                                                                                                                                                       |
| Step 5 suites                                              | CLI check: ng menubar body = CLI output (3326 chars), vue (3294 chars); themes vitest g3c2-upstream-fidelity 54 passed; ng g3c2-aura-styles 25 passed; vue 25 passed.                                                                                                                                   |

---

## 7. AC12 table (Docker `c2`, `0344039`, `--retries=0`)

Every G3-C2 test in the run: **249 results, 150 `passed_first_attempt`, 99 `failed`, 0 flaky, 0 skipped.** Every failure is a `G3-C2 visual` / `G3-C2 open` screenshot listed in section 4. Layout 33/33, x3b 30/30, reach 30/30 and accessibility 57/57 are all `passed_first_attempt`.

| Test                                                                       | chromium             | firefox              | webkit               |
| -------------------------------------------------------------------------- | -------------------- | -------------------- | -------------------- |
| Ng/ContextMenu ItemStates open G3-C2 open                                  | failed               | failed               | failed               |
| Ng/ContextMenu disabled item guard G3-C2 x3b                               | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/ContextMenu focus and separator G3-C2 layout                            | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/MegaMenu Default G3-C2 accessibility                                    | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/MegaMenu Default G3-C2 visual                                           | failed               | failed               | failed               |
| Ng/MegaMenu ItemStates G3-C2 accessibility                                 | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/MegaMenu ItemStates G3-C2 visual                                        | failed               | failed               | failed               |
| Ng/MegaMenu ItemStates open G3-C2 open                                     | failed               | failed               | failed               |
| Ng/MegaMenu overlay visibility G3-C2 layout                                | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/Menubar Default G3-C2 accessibility                                     | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/Menubar Default G3-C2 visual                                            | failed               | failed               | failed               |
| Ng/Menubar ItemStates G3-C2 accessibility                                  | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/Menubar ItemStates G3-C2 visual                                         | failed               | failed               | failed               |
| Ng/Menubar ItemStates open L1 G3-C2 open                                   | failed               | failed               | failed               |
| Ng/Menubar ItemStates open L2 G3-C2 open                                   | failed               | failed               | failed               |
| Ng/Menubar WithDisabledItem G3-C2 accessibility                            | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/Menubar WithDisabledItem G3-C2 visual                                   | failed               | failed               | failed               |
| Ng/Menubar open submenus (F-3b) G3-C2 layout                               | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/PanelMenu Default G3-C2 accessibility                                   | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/PanelMenu Default G3-C2 visual                                          | failed               | failed               | failed               |
| Ng/PanelMenu ItemStates G3-C2 accessibility                                | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/PanelMenu ItemStates G3-C2 visual                                       | failed               | failed               | failed               |
| Ng/PanelMenu ItemStates expanded G3-C2 open                                | failed               | failed               | failed               |
| Ng/PanelMenu Multiple G3-C2 accessibility                                  | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/PanelMenu Multiple G3-C2 visual                                         | failed               | failed               | failed               |
| Ng/PanelMenu render, expand and collapse (F-3a, Spec §18 A1) G3-C2 layout  | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/TieredMenu Default G3-C2 accessibility                                  | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/TieredMenu Default G3-C2 visual                                         | failed               | failed               | failed               |
| Ng/TieredMenu ItemStates G3-C2 accessibility                               | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/TieredMenu ItemStates G3-C2 visual                                      | failed               | failed               | failed               |
| Ng/TieredMenu ItemStates open L1 G3-C2 open                                | failed               | failed               | failed               |
| Ng/TieredMenu ItemStates open L2 G3-C2 open                                | failed               | failed               | failed               |
| Ng/TieredMenu popup overlay (group 21, computed only) G3-C2 layout         | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/TieredMenu visibility and nested placement G3-C2 layout                 | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/contextmenu selector reach G3-C2 reach                                  | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/megamenu disabled appearance and guards G3-C2 x3b                       | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/megamenu selector reach G3-C2 reach                                     | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/menubar disabled appearance and guards G3-C2 x3b                        | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/menubar selector reach G3-C2 reach                                      | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/panelmenu disabled appearance and guards G3-C2 x3b                      | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/panelmenu selector reach G3-C2 reach                                    | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/tieredmenu disabled appearance and guards G3-C2 x3b                     | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Ng/tieredmenu selector reach G3-C2 reach                                   | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/ContextMenu ItemStates open G3-C2 open                                 | failed               | failed               | failed               |
| Vue/ContextMenu disabled item guard G3-C2 x3b                              | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/ContextMenu focus and separator G3-C2 layout                           | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/MegaMenu Default G3-C2 accessibility                                   | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/MegaMenu Default G3-C2 visual                                          | failed               | failed               | failed               |
| Vue/MegaMenu ItemStates G3-C2 accessibility                                | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/MegaMenu ItemStates G3-C2 visual                                       | failed               | failed               | failed               |
| Vue/MegaMenu ItemStates open G3-C2 open                                    | failed               | failed               | failed               |
| Vue/MegaMenu overlay visibility G3-C2 layout                               | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/Menubar Default G3-C2 accessibility                                    | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/Menubar Default G3-C2 visual                                           | failed               | failed               | failed               |
| Vue/Menubar ItemStates G3-C2 accessibility                                 | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/Menubar ItemStates G3-C2 visual                                        | failed               | failed               | failed               |
| Vue/Menubar ItemStates open L1 G3-C2 open                                  | failed               | failed               | failed               |
| Vue/Menubar ItemStates open L2 G3-C2 open                                  | failed               | failed               | failed               |
| Vue/Menubar open submenus (F-3b) G3-C2 layout                              | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/PanelMenu Default G3-C2 accessibility                                  | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/PanelMenu Default G3-C2 visual                                         | failed               | failed               | failed               |
| Vue/PanelMenu ItemStates G3-C2 accessibility                               | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/PanelMenu ItemStates G3-C2 visual                                      | failed               | failed               | failed               |
| Vue/PanelMenu ItemStates expanded G3-C2 open                               | failed               | failed               | failed               |
| Vue/PanelMenu Multiple G3-C2 accessibility                                 | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/PanelMenu Multiple G3-C2 visual                                        | failed               | failed               | failed               |
| Vue/PanelMenu render, expand and collapse (F-3a, Spec §18 A1) G3-C2 layout | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/TieredMenu Default G3-C2 accessibility                                 | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/TieredMenu Default G3-C2 visual                                        | failed               | failed               | failed               |
| Vue/TieredMenu ItemStates G3-C2 accessibility                              | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/TieredMenu ItemStates G3-C2 visual                                     | failed               | failed               | failed               |
| Vue/TieredMenu ItemStates open L1 G3-C2 open                               | failed               | failed               | failed               |
| Vue/TieredMenu ItemStates open L2 G3-C2 open                               | failed               | failed               | failed               |
| Vue/TieredMenu visibility and nested placement G3-C2 layout                | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/contextmenu selector reach G3-C2 reach                                 | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/megamenu disabled appearance and guards G3-C2 x3b                      | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/megamenu selector reach G3-C2 reach                                    | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/menubar disabled appearance and guards G3-C2 x3b                       | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/menubar selector reach G3-C2 reach                                     | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/panelmenu disabled appearance and guards G3-C2 x3b                     | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/panelmenu selector reach G3-C2 reach                                   | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/tieredmenu disabled appearance and guards G3-C2 x3b                    | passed_first_attempt | passed_first_attempt | passed_first_attempt |
| Vue/tieredmenu selector reach G3-C2 reach                                  | passed_first_attempt | passed_first_attempt | passed_first_attempt |

Per project (passed_first_attempt / total): visual ng 0/10, vue 0/9; open 0/7 each; layout ng 6/6, vue 5/5; x3b 5/5; reach 5/5; accessibility ng 10/10, vue 9/9 (each engine).

---

## Decisions requested from the user (Task 10 Step 2)

1. U-1 and U-2 (PanelMenu root-list UA styling and missing panel gap): accept the 24 PanelMenu baselines as they are, or treat as a defect to fix before baselines are recorded.
2. U-3 (MegaMenu disabled column item undimmed, pre-existing): accept the 6 MegaMenu open baselines with it recorded, or handle separately.
3. The 63 expected and 12 F-3b screenshots: approve for baseline update.
4. The 16 introduced `region` rows: approve (or not) as accessibility baseline exceptions under the X-8 criteria.
5. O-3: whether the missing ContextMenu Global open-state screenshot needs adding.

---

## User decisions (2026-10-06)

Recorded at the Task 10 gate (ledger `progress.md`, "USER DECISIONS (2026-10-06, Task 10 gate)"; Spec §19):

1. **U-1 and U-2:** add R-M5 (CSS-only, Ultimate-only PanelMenu root-list layout rule with the upstream root flex/column and `panelmenu.gap`, on the existing DOM, narrowest selector matching only the top-level list). No DOM, template or runtime change. Add an explicit gate (G-4) for root-list layout and gap, re-run the PanelMenu verification and re-capture the 24 PanelMenu screenshots. They stay unaccepted until a fresh re-review passes (root-list layout and gap, expansion, collapse, regression against the approved states). PanelMenu stays in G3-C2.
2. **Approve the 75 non-PanelMenu baselines** (63 expected token/structure changes + 12 F-3b corrections). R-M2 stays dropped; the 9 px Menubar/MegaMenu overlay overlap does not override that ruling.
3. **Accept the 16 PanelMenu `region` rows** as upstream Aura parity exceptions. **Correction to decision 3 (as ruled):** the rows go into `docs/architecture/ACCESSIBILITY_BASELINE.md` in the established pattern, tagged `GAP-064 G3-C2 — upstream Aura parity exception (user-approved 2026-10-06)`; the row-level evidence also stays in this record (section 5); there is no third source and the G3-C2 validator is unchanged.
4. **U-3 (MegaMenu disabled column item not dimmed):** record as a new, separately authorized gap; not fixed in G3-C2.

No other scope expansion. Applied in Task 10c: decisions 2 and 3 (baselines and `ACCESSIBILITY_BASELINE.md` rows, one commit); decision 1 was implemented in Task 10b (`ed9edff`) and its re-review is below; decision 4 is carried to the closeout.

---

## PanelMenu re-review (R-M5) — pending user approval

**Status:** the 24 PanelMenu screenshots were re-captured at `ed9edff` (R-M5) and are **not** baselined or committed. This section states facts for the user's decision; it approves nothing. Review page: `<scratchpad>/g3c2-panelmenu-rereview.html` (composites `<scratchpad>/vr2/<Name>-<engine>.png`: old placeholder | new actual | diff).

### U-1 / U-2 status

- **U-1 fixed.** No bullets; the top-level panels start at x=16, y=16 (the story origin) instead of x=56, y=32. Checked in all 24 images (non-background bounding box starts at 16, 16).
- **U-2 fixed.** 8 px between panels (`panelmenu.gap`) in every engine and story; borders no longer touch. Chromium panel borders at y=59 and 68, 111 and 120 (8 rows between each pair); firefox/webkit 62 and 71, 117 and 126. Expanded story: chromium 191 and 200, 243 and 252; firefox/webkit 200 and 209, 255 and 264.
- **Nothing else unexpected.** Nested lists have no bullets and indent 16 px per level. Story-data effects only: the empty icon span (no icon font) shifts labels of items with an `icon` about 8 px right (as O-4), the expanded screenshot keeps the hover background on Documents (O-2), and panel height differs per engine (43 px chromium, 46 px firefox/webkit) because of text metrics (O-5).

### Results of this run (Docker `c2`, tree `git write-tree` with the 75 staged baselines, `--retries=0`)

- Layout 39/39 first attempt, including the two new R-M5 tests ("PanelMenu root list layout and gap (R-M5, G-4)", ng and vue, x3 engines) and the existing "PanelMenu render, expand and collapse" test (expansion renders the nested list, collapse removes it from the DOM). x3b 30/30, reach 30/30, accessibility 57/57, all first attempt.
- All 75 approved non-PanelMenu visual/open tests passed first attempt against the updated baselines (regression: none).
- 24 PanelMenu screenshot tests failed as intended: 18 pixel diffs against the old blank placeholder baselines and 6 missing baselines (expanded). No other failure. 231 passed, 24 failed, 255 total.
- Accessibility: the G3-C2 validator on these runs reported exactly the 16 recorded `region` fingerprints as introduced (ng 21 nodes = 7 x 3, vue 27 nodes = 9 x 3; identical to section 5). After the 16 rows were added to `ACCESSIBILITY_BASELINE.md`: `OK: ng 30/30`, `OK: vue 27/27`, 0 introduced violations.
- G-4 (Spec §19.1): with R-M5 the top-level list computes `list-style-type: none`, margin 0, padding 0, `display: flex`, column, `row-gap: 8px`, panel distance 8 px; without it disc, 16 px, 40 px, block, normal, 0 px; the selector matches exactly one element collapsed and expanded; all 6 combinations.

### The 24 screenshots

Paths: After = `$W/after2/test-results/<dir>/<name>-1-actual.png`, Diff = `…-1-diff.png` beside it, Before = the committed placeholder `packages/<fw>/e2e/g3c2-aura-styles.spec.ts-snapshots/<name>-1-<project>.png`. All 24 are failing-by-design in c2 until approved.

| FW  | Story                         | Engine   | Diff vs placeholder | After (actual)                                                                                                                          | Diff image                                                                                                               | Description                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------- | -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ng  | PanelMenu Default             | chromium | 166 px              | `…/g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-chromium/Ng-PanelMenu-Default-G3-C2-visual-1-actual.png`                       | `…/g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-chromium/Ng-PanelMenu-Default-G3-C2-visual-1-diff.png`          | Two top-level panels, Files (collapsed chevron) and Settings, at the story origin (x=16, y=16), full width, no bullets, 8 px between panels.                                                                                                                                                                                      |
| ng  | PanelMenu Default             | firefox  | 213 px              | `…/g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-firefox/Ng-PanelMenu-Default-G3-C2-visual-1-actual.png`                        | `…/g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-firefox/Ng-PanelMenu-Default-G3-C2-visual-1-diff.png`           | Two top-level panels, Files (collapsed chevron) and Settings, at the story origin (x=16, y=16), full width, no bullets, 8 px between panels.                                                                                                                                                                                      |
| ng  | PanelMenu Default             | webkit   | 203 px              | `…/g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-webkit/Ng-PanelMenu-Default-G3-C2-visual-1-actual.png`                         | `…/g3c2-aura-styles-Ng-PanelMenu-Default-G3-C2-visual-ng-webkit/Ng-PanelMenu-Default-G3-C2-visual-1-diff.png`            | Two top-level panels, Files (collapsed chevron) and Settings, at the story origin (x=16, y=16), full width, no bullets, 8 px between panels.                                                                                                                                                                                      |
| ng  | PanelMenu ItemStates          | chromium | 245 px              | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-chromium/Ng-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`                 | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-chromium/Ng-PanelMenu-ItemStates-G3-C2-visual-1-diff.png`    | Files, Settings (disabled, dimmed 0.6) and Help (plain item, no chevron) at x=16, y=16, no bullets, 8 px between panels. Byte-identical to Vue in every engine.                                                                                                                                                                   |
| ng  | PanelMenu ItemStates          | firefox  | 273 px              | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-firefox/Ng-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`                  | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-firefox/Ng-PanelMenu-ItemStates-G3-C2-visual-1-diff.png`     | Files, Settings (disabled, dimmed 0.6) and Help (plain item, no chevron) at x=16, y=16, no bullets, 8 px between panels. Byte-identical to Vue in every engine.                                                                                                                                                                   |
| ng  | PanelMenu ItemStates          | webkit   | 260 px              | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-webkit/Ng-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`                   | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-G3-C2-visual-ng-webkit/Ng-PanelMenu-ItemStates-G3-C2-visual-1-diff.png`      | Files, Settings (disabled, dimmed 0.6) and Help (plain item, no chevron) at x=16, y=16, no bullets, 8 px between panels. Byte-identical to Vue in every engine.                                                                                                                                                                   |
| ng  | PanelMenu Multiple            | chromium | 166 px              | `…/g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-chromium/Ng-PanelMenu-Multiple-G3-C2-visual-1-actual.png`                     | `…/g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-chromium/Ng-PanelMenu-Multiple-G3-C2-visual-1-diff.png`        | Byte-identical to Ng Default (multiple mode is not visible at rest).                                                                                                                                                                                                                                                              |
| ng  | PanelMenu Multiple            | firefox  | 213 px              | `…/g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-firefox/Ng-PanelMenu-Multiple-G3-C2-visual-1-actual.png`                      | `…/g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-firefox/Ng-PanelMenu-Multiple-G3-C2-visual-1-diff.png`         | Byte-identical to Ng Default (multiple mode is not visible at rest).                                                                                                                                                                                                                                                              |
| ng  | PanelMenu Multiple            | webkit   | 203 px              | `…/g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-webkit/Ng-PanelMenu-Multiple-G3-C2-visual-1-actual.png`                       | `…/g3c2-aura-styles-Ng-PanelMenu-Multiple-G3-C2-visual-ng-webkit/Ng-PanelMenu-Multiple-G3-C2-visual-1-diff.png`          | Byte-identical to Ng Default (multiple mode is not visible at rest).                                                                                                                                                                                                                                                              |
| ng  | PanelMenu ItemStates expanded | chromium | missing baseline    | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-expanded-G3-C2-open-ng-chromium/Ng-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`   | none (no baseline)                                                                                                       | New baseline (no old image). Files expanded with nested Documents (expanded, hover background, O-2), Work, Old (disabled, dimmed), Photos (disabled, dimmed); Settings (disabled) and Help below. No nested bullets, 16 px indent per level, 8 px between panels (chromium borders y 191/200 and 243/252). Byte-identical to Vue. |
| ng  | PanelMenu ItemStates expanded | firefox  | missing baseline    | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-expanded-G3-C2-open-ng-firefox/Ng-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`    | none (no baseline)                                                                                                       | New baseline (no old image). Files expanded with nested Documents (expanded, hover background, O-2), Work, Old (disabled, dimmed), Photos (disabled, dimmed); Settings (disabled) and Help below. No nested bullets, 16 px indent per level, 8 px between panels (chromium borders y 191/200 and 243/252). Byte-identical to Vue. |
| ng  | PanelMenu ItemStates expanded | webkit   | missing baseline    | `…/g3c2-aura-styles-Ng-PanelMenu-ItemStates-expanded-G3-C2-open-ng-webkit/Ng-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`     | none (no baseline)                                                                                                       | New baseline (no old image). Files expanded with nested Documents (expanded, hover background, O-2), Work, Old (disabled, dimmed), Photos (disabled, dimmed); Settings (disabled) and Help below. No nested bullets, 16 px indent per level, 8 px between panels (chromium borders y 191/200 and 243/252). Byte-identical to Vue. |
| vue | PanelMenu Default             | chromium | 186 px              | `…/g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-chromium/Vue-PanelMenu-Default-G3-C2-visual-1-actual.png`                    | `…/g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-chromium/Vue-PanelMenu-Default-G3-C2-visual-1-diff.png`       | Three top-level panels, File, Edit (collapsed chevron) and Help, at x=16, y=16, no bullets, 8 px between panels.                                                                                                                                                                                                                  |
| vue | PanelMenu Default             | firefox  | 202 px              | `…/g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-firefox/Vue-PanelMenu-Default-G3-C2-visual-1-actual.png`                     | `…/g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-firefox/Vue-PanelMenu-Default-G3-C2-visual-1-diff.png`        | Three top-level panels, File, Edit (collapsed chevron) and Help, at x=16, y=16, no bullets, 8 px between panels.                                                                                                                                                                                                                  |
| vue | PanelMenu Default             | webkit   | 199 px              | `…/g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-webkit/Vue-PanelMenu-Default-G3-C2-visual-1-actual.png`                      | `…/g3c2-aura-styles-Vue-PanelMenu-Default-G3-C2-visual-vue-webkit/Vue-PanelMenu-Default-G3-C2-visual-1-diff.png`         | Three top-level panels, File, Edit (collapsed chevron) and Help, at x=16, y=16, no bullets, 8 px between panels.                                                                                                                                                                                                                  |
| vue | PanelMenu ItemStates          | chromium | 245 px              | `…/g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-chromium/Vue-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`              | `…/g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-chromium/Vue-PanelMenu-ItemStates-G3-C2-visual-1-diff.png` | Byte-identical to Ng ItemStates in every engine.                                                                                                                                                                                                                                                                                  |
| vue | PanelMenu ItemStates          | firefox  | 273 px              | `…/g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-firefox/Vue-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`               | `…/g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-firefox/Vue-PanelMenu-ItemStates-G3-C2-visual-1-diff.png`  | Byte-identical to Ng ItemStates in every engine.                                                                                                                                                                                                                                                                                  |
| vue | PanelMenu ItemStates          | webkit   | 260 px              | `…/g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-webkit/Vue-PanelMenu-ItemStates-G3-C2-visual-1-actual.png`                | `…/g3c2-aura-styles-Vue-PanelMenu-ItemStates-G3-C2-visual-vue-webkit/Vue-PanelMenu-ItemStates-G3-C2-visual-1-diff.png`   | Byte-identical to Ng ItemStates in every engine.                                                                                                                                                                                                                                                                                  |
| vue | PanelMenu Multiple            | chromium | 186 px              | `…/g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-chromium/Vue-PanelMenu-Multiple-G3-C2-visual-1-actual.png`                  | `…/g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-chromium/Vue-PanelMenu-Multiple-G3-C2-visual-1-diff.png`     | Byte-identical to Vue Default.                                                                                                                                                                                                                                                                                                    |
| vue | PanelMenu Multiple            | firefox  | 202 px              | `…/g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-firefox/Vue-PanelMenu-Multiple-G3-C2-visual-1-actual.png`                   | `…/g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-firefox/Vue-PanelMenu-Multiple-G3-C2-visual-1-diff.png`      | Byte-identical to Vue Default.                                                                                                                                                                                                                                                                                                    |
| vue | PanelMenu Multiple            | webkit   | 199 px              | `…/g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-webkit/Vue-PanelMenu-Multiple-G3-C2-visual-1-actual.png`                    | `…/g3c2-aura-styles-Vue-PanelMenu-Multiple-G3-C2-visual-vue-webkit/Vue-PanelMenu-Multiple-G3-C2-visual-1-diff.png`       | Byte-identical to Vue Default.                                                                                                                                                                                                                                                                                                    |
| vue | PanelMenu ItemStates expanded | chromium | missing baseline    | `…/g3c2-aura-styles-Vue-Panel-2e456-mStates-expanded-G3-C2-open-vue-chromium/Vue-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png` | none (no baseline)                                                                                                       | Byte-identical to Ng expanded in every engine.                                                                                                                                                                                                                                                                                    |
| vue | PanelMenu ItemStates expanded | firefox  | missing baseline    | `…/g3c2-aura-styles-Vue-Panel-2e456-mStates-expanded-G3-C2-open-vue-firefox/Vue-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`  | none (no baseline)                                                                                                       | Byte-identical to Ng expanded in every engine.                                                                                                                                                                                                                                                                                    |
| vue | PanelMenu ItemStates expanded | webkit   | missing baseline    | `…/g3c2-aura-styles-Vue-Panel-2e456-mStates-expanded-G3-C2-open-vue-webkit/Vue-PanelMenu-ItemStates-expanded-G3-C2-open-1-actual.png`   | none (no baseline)                                                                                                       | Byte-identical to Ng expanded in every engine.                                                                                                                                                                                                                                                                                    |

### Decision requested

Approve the 24 PanelMenu screenshots as baselines (18 re-captured, 6 new expanded), or name what to change. Nothing else is pending: decisions 2 and 3 are applied in the Task 10c commit and U-3 is carried to the closeout.
