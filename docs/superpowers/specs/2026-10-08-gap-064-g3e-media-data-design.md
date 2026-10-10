# Specification — GAP-064 G3-E: Media and Data (Carousel, Galleria, Image, ImageCompare, DataView, OrderList, OrganizationChart, PickList), verification-first

**Date:** 2026-10-08
**Branch:** `feature/gap-064-g3e-media-data` (from `main` `cad9f85`, with the G3-E research `ccb13f3` merged as `4951733`)
**Status:** **Approved** (Spec Review, user, 2026-10-08; OI-E1..OI-E5 ruled in §14). Implementation needs an approved Plan.
**Governing records:**

- `docs/architecture/PARITY_PLAYBOOK.md` (normative process; framework-specific oracles; classification; status model).
- ADR-048 (pinned baseline), ADR-051 (style keys), ADR-052 (X-1, X-2, X-3, X-3b, X-4, X-6, X-12), D-G3-1..9 as corrected by the cross-tranche study §10.
- G3-E research `docs/architecture/research/2026-10-08-gap-064-g3e-research.md` (`ccb13f3`) and the user's rulings G3E-1..G3E-7 (2026-10-08, §2).
- Existing GAPs: GAP-098 (box model), GAP-099..101 (pilot findings), the G3-D no-backdrop ruling (D-D4/PX-D2, Drawer only).

**Oracles:** PrimeNG 21.1.9 rendered → Ultimate Angular. PrimeVue 4.5.5 rendered → Ultimate Vue. Prime source (`@primeuix/styles` 2.0.3, PrimeNG/PrimeVue sources) is diagnostic. Ultimate screenshot baselines are regression evidence.

---

## 1. Purpose and scope

G3-E is the last G3 tranche (D-G3-6: F6 Media + F7 Data). It is the first tranche run under the Playbook. Its goal is rendered Prime parity for the canonical cases of eight Aura keys, measured against each framework's own Prime oracle. Porting `@primeuix/styles` CSS is a means, not the definition of done.

| Key               | Tier | Angular         | Vue                  | Batch |
| ----------------- | ---- | --------------- | -------------------- | ----- |
| image             | B    | `UImage`        | `UImage`             | E-1   |
| imagecompare      | B    | `UImageCompare` | `UImageCompare`      | E-1   |
| carousel          | A    | `UCarousel`     | `UCarousel`          | E-2   |
| galleria          | A    | `UGalleria`     | `UGalleria`          | E-2   |
| orderlist         | B    | `UOrderList`    | `UOrderList`         | E-3   |
| picklist          | B    | `UPickList`     | `UPickList`          | E-3   |
| dataview          | B    | `UDataView`     | `UDataView`          | E-4   |
| organizationchart | B    | — (DECISION-D)  | `UOrganizationChart` | E-4   |

E-0 (fixtures, verification stories, harness cases) precedes E-1. Batches run in that order and are verified independently (§3).

The Spec does not assume the existing or future source port is sufficient. **The rendered Prime comparison is the final parity evidence.**

## 2. Decisions this Spec implements (user, 2026-10-08)

| Ruling     | Content                                                                                                                                                                                                                                                                                                    | Where  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| G3E-1      | Same small local media fixtures for both reference apps and both Ultimate Storybooks, committed once; no Prime CDN assets in verification                                                                                                                                                                  | §5.1   |
| G3E-2      | Stories only when an approved canonical case needs one: reuse an existing story; add the minimum verification story when none is usable; D → no story; repair a broken story only when the cause is demonstrably story/setup                                                                               | §5.2   |
| G3E-3      | Classify the Angular DataView NG0950 and the Vue ImageCompare width before any change                                                                                                                                                                                                                      | §4     |
| G3E-4      | Playwright Clock freezes autoplay/transition timers where needed; harness-only; real component behavior still exercised                                                                                                                                                                                    | §5.3   |
| G3E-5      | Option (b): port applicable Prime CSS onto the existing DOM, render, classify, fix authorized defects; C only with an explicit, defensible reason. DOM difference alone is never a C reason. No DOM change only to make Prime selectors fit. Escalate if parity needs a significant DOM/runtime/API change | §3, §7 |
| G3E-6      | Batches E-0 → E-1 → E-2 → E-3 → E-4, each independently verifiable; no batch absorbs unrelated fixes                                                                                                                                                                                                       | §3     |
| G3E-7      | Vue DataView `loading` is recorded as **no Prime reference** (not verified, Match, D or defect)                                                                                                                                                                                                            | §6.7   |
| Additional | Framework-specific oracles kept for OrderList controls position, OrderList/PickList buttons, ImageCompare clipping and DataView loading. GAP-098 reused, never fixed by a global `*` rule. Research hypotheses are not pre-classified                                                                      | §6, §7 |

## 3. Verification-first workflow (every batch)

1. **Finalize the canonical cases** of the batch from the research matrix (research §B), the reference apps and the rendered Ultimate DOM: case ids, story ids, state actions, part maps (finalized selectors replace the 🔶 entries of §6).
2. **Before-port comparison:** run the harness for the batch (Docker, `--retries=0`). Record the result per case.
3. **Classify** every material difference (Playbook §8): harness artifact, A, B, C (user ruling required), D, or no Prime reference. Record before changing anything.
4. **Authorized work only** (§7): the style-module port and mapping, the ADR-051 key rename, and fixes for A/B findings within the component's style module. Anything else is escalated (§12).
5. **Re-run once** (after-port comparison). A difference that first appears on the re-run is recorded; it is fixed in the batch only if it is A on a canonical case.
6. **Record** the batch: classification table, remaining differences, Playbook §11 status rows, regression evidence (§8).

**Re-run boundary:** one before-port run, one after-port run, plus at most one confirmation run after review fixes. A further iteration on the same case triggers the Playbook stop rule.

## 4. G3E-3 classifications (recorded before any change)

### 4.1 Angular DataView `NG0950` — story/setup problem

- **Evidence (2026-10-08, `cad9f85`):** `UDataView.itemTemplate` is `input.required<(item, layout) => string>()` (`data-view.ts:145`). The story `data-dataview--default` passes `value` and `itemTemplate` only as `args`, without a `render` template. In the browser, `value` reaches the component (two `li` rows render), but `itemTemplate` never does: both rows are empty and the template throws `NG0950` at `UDataView.inputValueFn [as itemTemplate]`. Storybook's args-only Angular render does not bind a function-valued arg as an input.
- **Valid usage works:** the unit spec sets both inputs with `componentRef.setInput` before the first change detection and renders the items (unit suite green).
- **Classification:** story/setup violates the component's existing required-input contract → **verification harness problem**. **Action (E-0):** repair the story only (explicit template binding `[itemTemplate]`). No product change, no GAP.

### 4.2 Vue ImageCompare width 57 px — product defect (GAP-102)

- **Evidence:** the story renders `<UImageCompare style="width: 20rem;">`. The Ultimate root is 57 px wide. `ImageCompare.vue` declares `inheritAttrs: false` and binds no `$attrs` on its root, so consumer `class`/`style` never reach it.
- **Prime reference:** PrimeVue's root binds `v-bind="ptmi('root')"`; `ptmi` merges `$attrs` into the root (`BaseComponent.vue` `ptmi`, comment "inheritAttrs:true"). PrimeVue's own canonical cases rely on it (`BasicDoc.vue` `class="shadow-lg rounded-2xl"`, `ResponsiveDoc.vue` `class="sm:!w-96 …"`).
- **Classification:** the configuration is valid (standard Vue fall-through attributes, honoured by the oracle); the component ignores it → **product defect, class A**. Registered as **GAP-102** (this Spec's commit). Not fixed by the story.
- **Verification consequence:** E-1 compares ImageCompare inside a sized wrapper for the clipping cases (§6.2), and keeps one case (`imagecompare/root-style`) that shows GAP-102 against PrimeVue. The fix itself is a separate authorized remediation.
- **Observation, not registered:** the G3-B Vue BlockUI story follow-up has the same `inheritAttrs: false` pattern. Other components were not assessed; GAP-102 is scoped to ImageCompare.

## 5. E-0 — fixtures, verification stories and harness cases

### 5.1 Media fixtures (G3E-1)

- **Files:** four self-generated images (no third-party content): 800 × 600 landscape images with distinct, high-contrast content (for Galleria, Image, ImageCompare left/right) and reuse of the same files as thumbnails. PNG or JPEG, each ≤ 40 KB. Generated once by a committed script or committed directly; their license is the repository's.
- **Location:** `tooling/prime-reference/fixtures/media/` (one copy).
- **Served to:** both reference apps (Vite `publicDir` / Angular `assets`) and both Ultimate Storybooks under the same URL path (`/media/<file>`; Plan Review PR-1), through each Storybook's `staticDirs`. This is the only Storybook configuration change (see OI-E2).
- **Rule:** no verification case or G3-E story uses `primefaces.org` or any network URL.

### 5.2 Verification stories (G3E-2)

Only for approved canonical cases. Existing stories are reused where usable; the media stories switch to the fixtures.

| Component         | Story change (ids)                                                                                                                                             | Reason                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| image             | `*-image--default`, `*-image--with-preview`: fixture `src`                                                                                                     | G3E-1                                                                                                 |
| imagecompare      | `*-imagecompare--default`: fixture images; **new** `*-imagecompare--sized` (fixed-width wrapper, both frameworks); **new** `*-imagecompare--rtl`               | Default story cannot render today; GAP-102 must stay visible in `--default`; upstream has an RTL rule |
| carousel          | **new** `*-carousel--vertical`; **new** `*-carousel--rtl`                                                                                                      | Orientation is a main variant (Tier A); upstream RTL rules                                            |
| galleria          | `*-galleria--default`: fixture images; **new** `*-galleria--without-thumbnails`; **new** `*-galleria--full-screen`                                             | Canonical cases; full screen is an overlay                                                            |
| dataview          | `data-dataview--default`: **repair** (Angular, §4.1); **new** `data-dataview--grid`, `--paginator`, `--empty`; **new** `data-dataview--loading` (Angular only) | Main variants; Angular loading has a PrimeNG oracle                                                   |
| orderlist         | **new** `data-orderlist--filter` (Angular only)                                                                                                                | PrimeNG canonical case; Angular supports `filterBy`                                                   |
| picklist          | **new** `data-picklist--filter` (Angular only)                                                                                                                 | Same                                                                                                  |
| organizationchart | **new** `panel-organizationchart--single-selection`, `--multiple-selection`, `--collapsible` (Vue)                                                             | Main states                                                                                           |

New stories carry a "G3-E verification story" comment, render the same content as the matching reference case, and change no existing story's rendered output except the image source (G3E-1) and the §4.1 repair. The Angular Galleria story keeps `max-width` on the component as it is today (Plan Review PR-5); each reference case mirrors its framework's story setup, so the rendered effect of that setup is part of the comparison, not hidden by a wrapper.

### 5.3 Harness (G3E-4)

- Per batch, add the batch's cases to `tooling/prime-reference/cases.ts` and the two reference apps (§6). Each reference case mirrors the matching story's content and wiring per framework.
- **Clock:** cases with autoplay or timed transitions install `page.clock` before navigation and advance it explicitly (Carousel circular, Galleria). The component's own timers run; only time is controlled.
- **Behavior scripts** for interactive cases (§6), as in the pilot's Drawer script.
- No root Playwright config, CI job or committed image changes from the harness (Playbook §4).

## 6. Per-component specification

Part maps are initial (from class maps and the rendered Ultimate DOM); entries marked 🔶 are finalized in step 1 of the batch (§3). "PrimeNG-local" means CSS PrimeNG appends after the `@primeuix/styles` import (OI-E1).

### 6.1 Image (E-1, Tier B)

- **Cases:** `image/default`, `image/preview-hover`, `image/preview-open`, `image/preview-zoom` (Bh), `image/preview-close` (Bh). Stories: `*-image--default`, `*-image--with-preview`.
- **Part map:** root `.p-image` ↔ `.u-image`; image `.p-image > img` ↔ `.u-image > img`; preview mask `.p-image-preview-mask` ↔ `.u-image-preview-mask`; overlay mask `.p-image-mask` ↔ `.u-image-mask`; toolbar `.p-image-toolbar` ↔ `.u-image-toolbar`; original `.p-image-original` ↔ `.u-image-original`.
- **Behavior:** preview opens on click; zoom-in enables zoom-out and scales the original; Escape and the close button close it; focus returns to the preview button.
- **D:** template slots; PrimeNG `previewImageSrc` (Angular).
- **Known GAPs/rulings:** GAP-098; overlay-mask role (X-5) applies — the image mask is expected to dim (no ruling removes it).
- **Style scope:** `@primeuix/styles/image` (≈ 14 groups) mapped to the Ultimate DOM; the base `.p-overlay-mask` role on `u-image-mask` (B-2/X-5).

### 6.2 ImageCompare (E-1, Tier B)

- **Cases:** `imagecompare/default` (story `--sized`), `imagecompare/slide` (Bh, slider to 25 %), `imagecompare/focus`, `imagecompare/rtl`, `imagecompare/root-style` (story `--default`; shows GAP-102 in Vue; Angular compares the host's sizing against PrimeNG).
- **Part map:** root `.p-imagecompare` ↔ `.u-image-compare`; left `.p-imagecompare > img:first-of-type` ↔ `.u-image-compare > img`; right `.p-imagecompare img + img` ↔ `.u-image-compare > span > img` 🔶; slider `.p-imagecompare-slider` ↔ `.u-image-compare-slider`.
- **Framework-specific oracle:** PrimeNG clips with inline `clip-path` set in `onSlide` (RTL handled in JS); PrimeVue sets the `imagecompare.scope.x` variable and lets the shared CSS clip. Each Ultimate framework is compared against its own; neither mechanism is assumed for the other.
- **D:** responsive demo (Tailwind sizing only).
- **Known GAPs:** GAP-102 (Vue root attributes), GAP-098. The Ultimate `span` wrapper around the right image means upstream `img + img` cannot match as written (X-1); the mapping, not the DOM, adapts.

### 6.3 Carousel (E-2, Tier A)

- **Cases:** `carousel/default`, `carousel/next` (Bh+V), `carousel/indicator` (Bh), `carousel/nav-focus`, `carousel/circular` (clock-frozen), `carousel/vertical`, `carousel/rtl`.
- **Part map:** root `.p-carousel` ↔ `.u-carousel`; viewport `.p-carousel-viewport` ↔ `.u-carousel-viewport`; first item `.p-carousel-item` ↔ `.u-carousel-item`; prev ng `.p-carousel-prev-button .p-button` 🔶 / vue `.p-carousel-prev-button` ↔ `.u-carousel-prev-button`; next likewise; active indicator `.p-carousel-indicator-active button` ↔ `.u-carousel-indicator-active button`.
- **Behavior:** Next moves one item and updates the active indicator; prev disabled at the start (not circular); indicator click changes page.
- **D:** responsive options, header/footer facets.
- **Hypotheses to verify, not pre-classified:** Ultimate nav buttons (native 20 × 21) vs Prime Button component.
- **Known GAPs:** GAP-098; GAP-051 resolved (aria-live).

### 6.4 Galleria (E-2, Tier A)

- **Cases:** `galleria/item-thumbnails`, `galleria/no-thumbnails`, `galleria/next` (Bh+V), `galleria/thumbnail-select` (Bh), `galleria/nav-focus`, `galleria/fullscreen`, `galleria/fullscreen-close` (Bh). Prime cases set `showItemNavigators` explicitly (Prime default `false`, Ultimate `true`); the default difference is recorded as an observation.
- **Part map:** root `.p-galleria` ↔ `.u-galleria`; item `.p-galleria-item` ↔ `.u-galleria-item-container` 🔶; prev/next `.p-galleria-prev-button`/`-next-button` ↔ `.u-galleria-prev-button`/`-next-button`; thumbnails `.p-galleria-thumbnail-items` ↔ `.u-galleria-thumbnail-list` 🔶; active thumbnail `.p-galleria-thumbnail-item-current` ↔ `.u-galleria-thumbnail-item-active` 🔶; mask `.p-galleria-mask` ↔ `.u-galleria-mask`.
- **Behavior:** item navigation, thumbnail selection, full-screen open/close, focus return.
- **D:** indicators (all variants), `thumbnailsPosition`, responsive options, caption, hover navigators, custom full-screen content, advanced.
- **Structural difference (G3E-5):** Prime's thumbnails are a carousel with its own navigation; Ultimate's are a plain list. Port the applicable thumbnail CSS onto the list, compare, classify. If parity requires a thumbnail carousel (new DOM/runtime), **stop and escalate**.
- **Known GAPs:** GAP-098; GAP-050 resolved; overlay-mask role (X-5) on the full-screen mask.

### 6.5 OrderList (E-3, Tier B; Angular 6 cases, Vue 4)

- **Cases:** `orderlist/default`, `orderlist/selected`, `orderlist/move` (Bh), `orderlist/focus`; Angular only: `orderlist/filter`, `orderlist/dragdrop` (Bh).
- **Part map:** root `.p-orderlist` ↔ `.u-order-list`; controls `.p-orderlist-controls` ↔ `.u-order-list-controls`; first control button 🔶; list `.p-listbox` ↔ ng `.u-listbox` / vue `.u-order-list-list .u-listbox`; first option `.p-listbox-option` ↔ `.u-listbox-option`.
- **Framework-specific oracle:** PrimeNG uses `<button pButton>` controls and PrimeNG-local CSS for `controlsPosition`; PrimeVue uses `<Button>` components.
- **D:** PrimeNG `controlsPosition` (no Ultimate input), item template.
- **Hypotheses to verify:** Ultimate text "Move …" controls vs Prime icon-only controls; Vue options' visible checkbox inputs; Vue narrow list column.
- **Composition:** differences inside the composed Listbox are classified against Listbox and recorded, not fixed in G3-E unless the cause is in the OrderList module.
- **Known GAPs:** GAP-098; D-G3-9 Listbox divergence.

### 6.6 PickList (E-3, Tier B; Angular 5 cases, Vue 4)

- **Cases:** `picklist/default`, `picklist/selected`, `picklist/transfer` (Bh), `picklist/focus`; Angular only: `picklist/filter`.
- **Part map:** root `.p-picklist` ↔ `.u-pick-list`; source list container `.p-picklist-source-list-container` ↔ `.u-pick-list-source .u-pick-list-list` 🔶; transfer controls `.p-picklist-transfer-controls` ↔ `.u-pick-list > .u-pick-list-controls` 🔶; target list container ↔ `.u-pick-list-target .u-pick-list-list` 🔶.
- **Framework-specific oracle:** as OrderList (`pButton` vs `<Button>`).
- **D:** item templates; responsive stacking below `breakpoint` (not canonical at 1280 × 720).
- **Hypotheses to verify:** control placement (Angular renders transfer controls after the target section), text controls, Vue checkbox inputs.
- **Known GAPs:** GAP-098; D-G3-9.

### 6.7 DataView (E-4, Tier B; Angular 5 cases, Vue 4)

- **Cases:** `dataview/list`, `dataview/grid`, `dataview/paginator`, `dataview/empty`; Angular: `dataview/loading` (PrimeNG overlay); **Vue `dataview/loading`: no Prime reference (G3E-7)** — recorded, not compared.
- **Part map:** root `.p-dataview` ↔ `.u-data-view`; content `.p-dataview-content` ↔ `.u-data-view-list` 🔶; paginator `.p-paginator` ↔ `.u-paginator`; empty message `.p-dataview-empty-message` ↔ (Angular `li`, Vue `div` inside the list) 🔶; loading overlay (Angular) `.p-dataview-loading-overlay` ↔ 🔶.
- **Content rule:** Prime renders no item wrappers (the consumer template does). The reference case template produces the same visible item markup as Ultimate's wrapper + item content; differences in the wrapper itself are classified, not assumed.
- **D:** sorting demo header, header/footer facets.
- **Structural difference (G3E-5):** Ultimate item wrappers (`ul/li` in Angular, `div` in Vue). Port, compare, classify; escalate if parity needs a DOM/API change.
- **Known GAPs:** GAP-098.

### 6.8 OrganizationChart (E-4, Tier B; Vue only)

- **Cases:** `organizationchart/basic` (three levels), `organizationchart/select`, `organizationchart/multi`, `organizationchart/toggle` (Bh+V).
- **Part map:** root `.p-organizationchart` ↔ `.u-organization-chart`; node `.p-organizationchart-node` ↔ `.u-organization-chart-node-content` 🔶; children `.p-organizationchart-node-children` ↔ `.u-organization-chart-children` 🔶; connector `.p-organizationchart-connector-down` ↔ (none today) 🔶.
- **D:** colored nodes and custom node templates (no Ultimate slot). Angular: out of scope (DECISION-D).
- **Structural difference (G3E-5):** Prime uses a table layout with connector lines; Ultimate uses flex `div`s without connectors. Port, compare, classify. Connector lines that need new elements are a DOM change → **stop and escalate**, do not add DOM inside G3-E.
- **Known GAPs:** GAP-098; DECISION-D (protected).

## 7. Authorized product changes and their limits

Within each batch, only:

1. **Style-module CSS:** the applicable `@primeuix/styles` 2.0.3 rule groups for the key, mapped onto the existing Ultimate DOM (D-G3-1/2), D-G3-3 omissions recorded as D rows, X-4 runtime roles, X-5 overlay-mask roles, X-3/X-3b state rules. For Angular, PrimeNG-local CSS where Ultimate has the feature, subject to OI-E1.
2. **ADR-051 key renames:** `image-compare` → `imagecompare`, `data-view` → `dataview`, `order-list` → `orderlist`, `pick-list` → `picklist`, `organization-chart` → `organizationchart` (both frameworks where present).
3. **Fixes for classified A/B differences that live in the component's style module.**

Not authorized in G3-E (escalate per §12): DOM, template, runtime or public-API changes; changes to composed components (Listbox, Paginator, Button); GAP-098 or any global/base rule (no `*, ::before, ::after` rule); GAP-099..102 remediation; React.

A difference is classified C only with an explicit, defensible reason recorded and a user ruling. A DOM difference is never by itself that reason (G3E-5).

## 8. Regression evidence and size

- **Rendered parity evidence:** the harness before/after runs per batch (Docker, Chromium), reports kept in `.superpowers/sdd/<batch>/` (not committed), summarized in the batch record.
- **Ultimate regression evidence** (as in G3-D): Docker screenshot baselines for the G3-E verification stories in Chromium, Firefox and WebKit, reviewed by the user before acceptance; X-1 reach test; accessibility scans with pre-existing/introduced rows; fidelity test of the port. See OI-E3 for the CI step.
- **Size:** X-10 per batch against the batch's branch point; 15 % hard stop; `PERFORMANCE.md` refreshed at closeout.

## 9. Status recording

After each batch, the Playbook §11 rows of its keys move from `pending` to the measured value (`partial`, `verified`, `verified-with-differences` or `open-gap`) with the commit and record link. Coverage gaps and the no-Prime-reference item (Vue DataView loading) are listed in the row notes. Nothing is promoted without a comparison record.

## 10. Acceptance criteria (per batch and overall)

| #   | Criterion                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 | Every approved canonical case of the batch ran against its framework's Prime oracle, before and after the port, in Docker, with no harness error |
| AC2 | Every material difference has a recorded classification; every C has a user ruling; every out-of-scope A is linked to a GAP                      |
| AC3 | No product change outside §7                                                                                                                     |
| AC4 | Environment probe equal and noise re-load 0 on every comparison                                                                                  |
| AC5 | Regression evidence of §8 recorded; size within the 15 % gate                                                                                    |
| AC6 | Playbook status rows updated with commit and record link                                                                                         |
| AC7 | Existing tranche checks (G3-A..G3-D CI steps, strict runs) unchanged except known failures (U2, GAP-097)                                         |

## 11. Out of scope

G3-A..G3-D (their verification is a separate backfill); GAP-098..102 remediation; Listbox, Paginator and Button changes; Angular OrganizationChart; React; new tokens or Aura modules; CI gating on the parity harness.

## 12. Stop conditions (escalate to the user)

- Parity for a canonical case needs a DOM, template, runtime or API change (G3E-5), including a Galleria thumbnail carousel, OrganizationChart connectors or DataView wrapper changes.
- A fix seems to need a new rule category, an ADR, or a second iteration on the same case (Playbook §8.3).
- A story repair turns out to need a product change, or a product defect could only be hidden by a story change (G3E-3).
- The size gate is exceeded, or an existing tranche check regresses.

## 13. Open items for Spec Review

- **OI-E1 — PrimeNG-local CSS.** The G3-B Spec (§4.2) excluded "PrimeNG-local CSS appended after the `@primeuix/styles` import" from the baseline (e.g. card and scrollpanel host `display: block`). Under the Playbook, PrimeNG's rendered output, including that CSS, is the Angular oracle. Recommended: for G3-E, include PrimeNG-local CSS in the Angular port where Ultimate has the corresponding feature or host element; record the G3-B exclusion as superseded for G3-E only, and leave G3-A..G3-D to the backfill.
- **OI-E2 — Fixture serving.** Serving the fixtures to both Storybooks needs one `staticDirs` entry in each `.storybook/main.ts`. Recommended: approve as part of G3E-1's fixture infrastructure.
- **OI-E3 — CI step (X-12).** Previous tranches added a CI step running their verification specs. Recommended: add the G3-E Ultimate regression specs the same way (regression evidence, not a parity gate); the parity harness stays out of CI.
- **OI-E4 — GAP-102.** Registered with this Spec per G3E-3 (§4.2). Confirm the registration and its scope (ImageCompare only).
- **OI-E5 — Galleria default.** Ultimate `showItemNavigators` defaults to `true`, Prime to `false`. Cases set it explicitly. Recommended: record as an observation in the E-2 record; any change of default is an API decision outside G3-E.

## 14. Spec Review decisions (2026-10-08, user)

1. **OI-E1 — PrimeNG-local CSS: approved.** Included in G3-E's Angular port where Ultimate has the corresponding feature or host. G3-E only; it supersedes the G3-B exclusion for this tranche only and does not change G3-A..G3-D. Resulting differences are evidence to classify, not automatic defects. No DOM or runtime change is authorized by this ruling.
2. **OI-E2 — Fixture serving: approved.** One `staticDirs` entry in each Ultimate Storybook, as part of G3E-1. No further Storybook infrastructure.
3. **OI-E3 — G3-E regression CI: approved.** A G3-E Ultimate regression CI step following the G3-A..G3-D pattern. Regression evidence only, not a parity gate. The Prime comparison harness stays out of CI. No unrelated CI-health work.
4. **OI-E4 — GAP-102: confirmed.** Vue ImageCompare root `class`/`style` fall-through only. Not fixed in G3-E.
5. **OI-E5 — Galleria default: approved.** Ultimate `showItemNavigators = true` vs Prime `false` is recorded as an observation; cases set the value explicitly; no API/default change in G3-E.
6. **G3E-3 classifications approved:** Angular DataView `NG0950` = story/setup, repaired in E-0 only (no product change, no GAP); Vue ImageCompare 57 px = product defect A → GAP-102, with one canonical case exposing it.
7. **Additional ruling — Vue fall-through pattern.** The observation that other Ultimate Vue components may drop `class`/`style` the same way does not expand G3-E: no audit, no broadening of GAP-102, no shared/base-component fix, no `inheritAttrs`/`$attrs`/DOM/runtime/API change. It is recorded only as a research observation and future investigation candidate; a broader investigation needs its own research/GAP scope.
8. **Plan constraints:** keep the verification-first flow (before-port → classify → authorized work → after-port) and the one-iteration stop boundary; no implementation, CSS, story, baseline or CI change before the Plan is approved; the Plan does not expand scope from newly discovered patterns.
