# GAP-064 G3-D (F3 Overlays + F8 Composites) research

**Status:** research only, for review. It authorizes no Spec, Plan or implementation and changes no gap status, ADR or tooling. Branch `research/gap-064-g3d-overlays-composites`, from `main` at `b290919`.

**Evidence labels:**

- **[R]** repository evidence (Ultimate source, stories and tests at `b290919`, and observed rendering in local Storybook);
- **[U]** pinned upstream evidence (`@primeuix/styles` 2.0.3, PrimeNG 21.1.9, PrimeVue 4.5.5, from `.vendor-cache/` tarballs);
- **[D]** prior approved decisions (ADR-048, ADR-051, ADR-052, D-G3-1..9, B-2 and other tranche rulings);
- **[N]** new observations made in this research;
- **[Rec]** recommendations, not decisions.

The cross-tranche study (`2026-10-06-gap-064-cross-tranche-study.md`) is cited as supporting research only; ADR-052 is the normative record of the X-rules.

---

## A. Scope and component inventory

| Family | Aura key        | Angular style module / registered name                                            | Vue style module / registered name        | ADR-051 rename        |
| ------ | --------------- | --------------------------------------------------------------------------------- | ----------------------------------------- | --------------------- |
| F3     | `confirmdialog` | `confirm-dialog/confirm-dialog-style.ts`; `confirm-dialog.ts:81` `confirm-dialog` | `BaseConfirmDialog.ts:8` `confirm-dialog` | yes → `confirmdialog` |
| F3     | `confirmpopup`  | `confirm-popup.ts:70` `confirm-popup`                                             | `BaseConfirmPopup.ts:8` `confirm-popup`   | yes → `confirmpopup`  |
| F3     | `drawer`        | `drawer.ts:81` `drawer`                                                           | `BaseDrawer.ts:8` `drawer`                | no                    |
| F3     | `popover`       | `popover.ts:67` `popover`                                                         | `BasePopover.ts:8` `popover`              | no                    |
| F8     | `splitbutton`   | `split-button.ts:83` `split-button`                                               | `BaseSplitButton.ts:21` `split-button`    | yes → `splitbutton`   |
| F8     | `speeddial`     | `speed-dial.ts:72` `speed-dial`                                                   | `BaseSpeedDial.ts:13` `speed-dial`        | yes → `speeddial`     |

- 6 Angular and 6 Vue components; React is out of scope [D].
- **Rename sites [R][D]:** 8 (Angular 4, Vue 4), under ADR-051 and D-G3-1. All six Aura modules are registered in `auraPreset.components` (`packages/themes/src/presets/aura/`).
- **Current CSS [R]:** every style module is a short hand-written block with no `dt()` reference. ConfirmDialog 4 rules, ConfirmPopup 3, Drawer 10, Popover 2, SplitButton 3, SpeedDial 7, in each framework. The Angular and Vue modules are textually identical except for the class-map typing.
- **Provenance [R]:** none of the 12 component directories has any entry in `docs/architecture/provenance/{ng,vue}.json`. Under ADR-052 X-12 (changed-file completeness), every source file the tranche changes needs an entry, as G3-C2 did (`f3722bd`).
- **Existing tests [R]:**
  - unit specs exist for all 12 components;
  - only the Drawer specs assert a style class (`.u-drawer-position-right`, `drawer.spec.ts:44` ng, `:41` vue);
  - there are no Playwright e2e specs for any G3-D component, and `ACCESSIBILITY_BASELINE.md` has no G3-D rows.

## B. Pinned Prime source and provenance evidence

- **Structural CSS [U]:** `@primeuix/styles` 2.0.3 `dist/<key>/index.mjs` export `style`, split with the existing G3 parser (`packages/themes/test/utils/g3a-port.mjs` `parseGroups`). 77 groups per framework: confirmdialog 2, confirmpopup 13, drawer 33, popover 9, splitbutton 10, speeddial 10.
- **Class maps [U]:** PrimeVue 4.5.5 `src/<comp>/style/*Style.js` and PrimeNG 21.1.9 `src/<comp>/style/*style.ts`.
- **Upstream inline-style roles [U]:**
  - PrimeVue Drawer `inlineStyles.mask`: `position: fixed`, full size, `justifyContent`/`alignItems` by position, `pointerEvents: modal ? auto : none`;
  - PrimeNG/PrimeVue SpeedDial `inlineStyles.root` and `.list`: `flexDirection` by direction;
  - PrimeNG Popover `inlineStyles.root`: `position: absolute`.
- **Upstream divergence, Drawer [U]:**
  - PrimeVue puts `p-drawer-<position>`, `p-drawer-open` and `p-drawer-full` on the mask, which is what the `@primeuix` selectors (`.p-drawer-left .p-drawer`) target.
  - PrimeNG puts `p-drawer-<position>` and `p-drawer-open` on the drawer root, and appends a PrimeNG-local `/** For PrimeNG **/` block (position, size and `.p-drawer-enter-left`-style animation classes).
  - Under the approved G3-B ruling [D] (G3-B Spec "Not part of the baseline: PrimeNG-local CSS appended after the `@primeuix/styles` import … It is not ported"), the PrimeNG-local block is not baseline. Other PrimeNG style files with such blocks were already handled this way (accordion, card, scrollpanel).
- **Base roles [U]:** `@primeuix/styles` `dist/base` defines `.p-overlay-mask` (fixed, full size, `mask.background`, `mask.color`) and `.p-disabled`. [R] Ultimate never loads that base stylesheet; nothing in `ng-core`, `vue-core`, `uix-styled` or the framework packages imports `@ultimate/uix-styles/base`. The `u-overlay-mask` class emitted by Dialog therefore carries no CSS (see J). The approved B-2 ruling [D] places the needed base declarations in component-local CSS.

## C. Per-component upstream rule-group accounting (proposed)

R = reaches the rendered Ultimate DOM as written (after the `.p-` → `.u-` rule); A = reaches only through an adapted selector (D-G3-1, ADR-052 X-1); X = cannot reach any rendered Ultimate state (omitted, recorded as a feature exclusion, D-G3-3).

| Key           | Groups | R / A (proposed port)                                                                                                                                                                                              | X (proposed omission)                                                                                                                                        | Counts (port / omit) |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| confirmdialog | 2      | 2 `.p-confirmdialog-icon` R (only when `confirmation.icon` is set); 1 `.p-confirmdialog .p-dialog-content` **unreachable as written in both frameworks** (see E)                                                   | depends on decision D-D2                                                                                                                                     | 2 / 0 or 1 / 1       |
| confirmpopup  | 13     | 1–6 R (5–6 `.p-confirmpopup-footer button` reach the Angular inner `<button>` and the Vue native buttons)                                                                                                          | 7 `-flipped`; 8–13 arrow (`:before`/`:after`, flipped arrow)                                                                                                 | 6 / 7                |
| drawer        | 33     | 1–5 R; 6 A (`.p-drawer-full .p-drawer` → same-element `.u-drawer.u-drawer-position-full`); 17–21 A (`.p-drawer-<pos> .p-drawer[-content]` → `.u-drawer.u-drawer-position-<pos>`); 23 R (`.u-drawer-mask:dir(rtl)`) | 7–16 enter/leave-active (no animation classes rendered); 22 `.p-drawer-open` (never emitted); 24–33 keyframes                                                | 12 / 21              |
| popover       | 9      | 1–2 R                                                                                                                                                                                                              | 3 `-flipped`; 4–9 arrow                                                                                                                                      | 2 / 7                |
| splitbutton   | 10     | 1 R; 2–5 Vue R (same element `button.u-button.u-splitbutton-button`), Angular A (host-aware: `u-button.u-splitbutton-button > .u-button`)                                                                          | 6 `.p-splitbutton .p-menu` (menu is portaled to `body` in both frameworks); 7 `-fluid`; 8–9 `-rounded`; 10 `-raised` (none of these root classes is emitted) | 5 / 5                |
| speeddial     | 10     | 1, 2, 4, 5, 7 R; 8–9 A (open class is on the trigger, not the root: e.g. `.u-speeddial:has(> .u-speeddial-button.u-speeddial-open) .u-speeddial-item`)                                                             | 3 and 10 `-rotate` (never emitted); 6 circle / semi-circle / quarter-circle (no type class on the root, decision D-D3b)                                      | 7 / 3                |

- **Total, proposed:** 34 ported / 43 omitted per framework, assuming D-D2 = A (otherwise 33 / 44). The exact counts are fixed in the Spec.
- Angular and Vue counts are the same. Only the selector adaptations differ: the SplitButton host and the Angular Drawer focus-trap wrapper (G).

## D. Ultimate DOM, state and interaction inventory (observed [R])

Observed in local Storybook (Chromium; Firefox for the positioning checks) with the X-8 story URL (`globals=a11y.manual:!true`).

| Component     | Rendered structure (open)                                                                                                                                                                                                                                                                                                                       | State expression                                                                                                                                                  | Notable                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ConfirmDialog | ng: `u-dialog.u-confirmdialog` host stays in the story root; the dialog is portaled to `body` as `div.u-dialog-mask.u-overlay-mask > div.u-dialog > … .u-dialog-content > span.u-confirmdialog-message`. Vue: the same portaled dialog; `u-confirmdialog` is absent (Vue warns "Extraneous non-props attributes (class) … teleport root nodes") | none                                                                                                                                                              | root class never reaches the dialog in either framework; footer has `u-confirmdialog-footer` inside `u-dialog-footer`                                                                                                                                                                                                                                                      |
| ConfirmPopup  | portaled `div.u-confirmpopup.u-component > .u-confirmpopup-content(+icon, message) + .u-confirmpopup-footer` (ng `u-button` hosts; Vue native `<button>`)                                                                                                                                                                                       | none (no flipped class)                                                                                                                                           | **ng renders at (0,0)**, trigger at (16,16); Vue at (16,37), anchored                                                                                                                                                                                                                                                                                                      |
| Drawer        | portaled `div.u-drawer-mask > div.u-drawer.u-component.u-drawer-position-<pos>`; ng adds an unclassed `div[ufocustrap]` wrapper around header/content/footer; Vue renders header/content (+footer only with the slot) directly                                                                                                                  | position class on the drawer, not the mask; no open, full or modal class; mask has no `u-overlay-mask`                                                            | mask is fixed but transparent in both frameworks; drawer width is content width (≈140 px), no 20rem                                                                                                                                                                                                                                                                        |
| Popover       | portaled `div.u-popover.u-component[role=dialog] > div.u-popover-content`                                                                                                                                                                                                                                                                       | none (no flipped class, no arrow element)                                                                                                                         | **ng renders at (0,0)** (Chromium and Firefox); Vue anchored at (16,37)                                                                                                                                                                                                                                                                                                    |
| SplitButton   | Vue: `div.u-splitbutton > button.u-button.u-splitbutton-button + button.u-button.u-button-icon-only.u-splitbutton-dropdown`; ng: `div.u-splitbutton > u-button.u-splitbutton-button > button.u-button` (host interposition), same for the dropdown; popup `UMenu` portaled to `body` in both                                                    | root classes static (`u-splitbutton u-component`); no raised, rounded or fluid                                                                                    | ng: menu inline style empty (`position: static`, full width); Vue: `top`/`inset-inline-start` set but `position: static`                                                                                                                                                                                                                                                   |
| SpeedDial     | `div.u-speeddial.u-speeddial-direction-<dir> > button.u-speeddial-button + ul.u-speeddial-list > li.u-speeddial-item > button.u-speeddial-action`; mask rendered as a sibling only when `mask` and open                                                                                                                                         | open class `u-speeddial-open` on the **trigger button**, not the root; `u-speeddial-item-hidden` + `data-u-hidden`; no type, rotate or disabled class on the root | closed items fully visible (opacity 1, no transform); trigger is an unstyled native button 16×6 px; the absolutely positioned list covers the trigger (`elementFromPoint` at the trigger centre returns `button.u-speeddial-action`), so a real pointer click on the trigger cannot land; Circle story's inline `left`/`top` have no effect (items are `position: static`) |

Upstream DOM differences that matter for mapping [U]:

- Upstream SplitButton (PrimeVue) composes `TieredMenu`, Ultimate composes `UMenu` [D] (D-G3-9 preserved).
- Upstream SpeedDial trigger and actions are `Button` components (`p-button-icon-only p-speeddial-button p-button-rounded`). Ultimate uses native buttons.
- Upstream ConfirmPopup buttons carry `p-confirmpopup-reject/accept-button`. Ultimate emits neither, and no CSS group depends on them.

## E. Selector reachability and mapping

1. **ConfirmDialog group 1 is unreachable as written in both frameworks** [N]. The Angular root class is on the in-story `<u-dialog>` host while the dialog is portaled. In Vue the class attribute is dropped at the teleport. The existing Ultimate rule `.u-confirmdialog .u-dialog-content` is already dead today. Options are in K (D-D2).
2. **Popover/ConfirmPopup flipped and arrow groups are X** [R][D]: Ultimate never flips and never emits `-flipped`. The D-G3-4 correction (F-4a, applied here) confirms that Ultimate renders no arrow. The arrow groups need `arrow.left`, a runtime-set value (it does not resolve in Ultimate's preset, F). Porting them would add a mis-positioned arrow.
3. **Drawer position, full and content groups are A** [N]. Upstream selects the drawer through a position class on the mask (PrimeVue). Ultimate puts `u-drawer-position-<pos>` on the drawer itself in both frameworks. The adaptation rewrites `.p-drawer-<pos> .p-drawer` to the same-element compound `.u-drawer.u-drawer-position-<pos>`. This is a selector adaptation to existing DOM [D] (D-G3-1), with no DOM change (ADR-052 X-2).
4. **SplitButton compound selectors (2–5) need an Angular host-aware form** [N]. `pcButton`/`pcDropdown` classes land on the `<u-button>` host while `u-button` is on the inner `<button>`. Correction to the cross-tranche study §4.2 ("Angular host interposition: none found between upstream-paired elements … only `u-button > u-ripple`"): the study missed this same-element pair split by the host. ADR-052 X-1 already requires host elements to be accounted for. Vue renders the pair on one element.
5. **SplitButton group 6 is X** [R]: the menu is portaled to `body` in both frameworks, so `.u-splitbutton .u-menu` cannot match. (Upstream's popup `TieredMenu` is also appended to `body` by default.)
6. **SpeedDial open-state groups 8–9 are A** [N]: Ultimate's open class is on the trigger button, a sibling of the list. Candidate forms are `.u-speeddial:has(> .u-speeddial-button.u-speeddial-open) …` (`:has`, precedent PX-M3 / G3-C2 A3) or `.u-speeddial-button.u-speeddial-open ~ .u-speeddial-list …`. The Spec fixes the form.
7. **SpeedDial group 6 (circle types) is X** [N]: the root never carries a type class, although the `type` input exists and computes inline `left`/`top`. Those inline values do nothing because no rule positions the items absolutely. The circle, semi-circle and quarter-circle layouts are therefore broken today, a pre-existing defect. A CSS adaptation has no rendered hook, and adding one is a DOM/runtime change (X-2). See D-D3b.
8. **Dead upstream selectors are never counted as ported** [D]: every X group above is an explicit omission.

## F. Token and reference mapping [R][U]

- All 41 distinct upstream `dt()` paths across the six keys resolve against Ultimate's built `auraPreset`, except `popover.arrow.left` and `confirmpopup.arrow.left`. Upstream sets those at runtime, and only the excluded arrow groups use them. The resolver was checked against two invented paths, which it reported as unresolved.
- Paths by key:
  - confirmdialog: `content.gap`, `icon.color`, `icon.size`;
  - confirmpopup: `gutter`, `background`, `color`, `border.color`, `border.radius`, `shadow`, `content.padding`, `content.gap`, `icon.size`, `icon.color`, `footer.gap`, `footer.padding`, `arrow.offset`, `arrow.left`;
  - drawer: `background`, `color`, `border.color`, `shadow`, `content.padding`, `header.padding`, `footer.padding`, `title.font.weight`, `title.font.size`;
  - popover: `gutter`, `background`, `color`, `border.color`, `border.radius`, `shadow`, `content.padding`, `arrow.offset`, `arrow.left`;
  - splitbutton: `border.radius`, `rounded.border.radius`, `raised.shadow`;
  - speeddial: `gap`, `transition.duration`, and semantic `content.border.radius`.
- Base-role tokens for B-2 (`mask.background`, `mask.color`, `disabled.opacity`) exist [D] (verified at G3-B).
- No new tokens are needed [D] (D-G3-5, D-G3-8).

## G. Runtime styling and positioning roles (ADR-052 X-4)

| Role                             | Upstream [U]                                                                                                                 | Ultimate today [R]                                                                                                                                                                                                                                                   | Proposed handling [Rec]                                                                                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popover / ConfirmPopup anchoring | `absolutePosition()` sets `top`/`left`, toggles `-flipped`, sets the `arrow.left` variable                                   | Vue: `getBoundingClientRect` `top`/`left` (works). **ng: never applied** — `align()` runs via `queueMicrotask` before the `@if (render())` content exists (Popover reads `contentRef`, ConfirmPopup reads `contentRef.parentElement`), so the overlay stays at (0,0) | Retain `position: absolute; top: 0; left: 0` as the X-4 root role (precedent: G3-C2 ContextMenu root). The ng anchoring defect is a runtime defect outside a CSS port (D-D1)                                                                                                            |
| Overlay z-index                  | ZIndex utility                                                                                                               | ZIndex utility, inline (ng 1001; Vue 1000)                                                                                                                                                                                                                           | unchanged                                                                                                                                                                                                                                                                               |
| Drawer mask                      | inline `position: fixed`, full size, justify/align by position, `pointerEvents` by `modal`; `p-overlay-mask` only when modal | `.u-drawer-mask { position: fixed; inset: 0; display: flex }`; placement via per-position margins on the drawer; mask always rendered and interactive; no modal class                                                                                                | retain the mask role as Ultimate-only X-4 CSS; the backdrop (`overlay-mask` role) depends on D-D4                                                                                                                                                                                       |
| Drawer enter/leave               | `.p-drawer-enter-active` / leave classes + keyframes                                                                         | none rendered                                                                                                                                                                                                                                                        | omit (G3-B precedent: no animation classes)                                                                                                                                                                                                                                             |
| SpeedDial direction              | inline `flexDirection` on root and list                                                                                      | inline `flex-direction` on the list only; direction class `u-speeddial-direction-<dir>` on the root                                                                                                                                                                  | adapt the root `flex-direction`/alignment from the existing direction class (precedent PX-B6, inline-role to class-based CSS)                                                                                                                                                           |
| SpeedDial item placement         | `calculatePointStyle` absolute `left`/`top` for circle types; inline `transitionDelay`                                       | inline `transition-delay` (works); inline `left`/`top` for circle types (no effect)                                                                                                                                                                                  | linear: covered by ported groups; circle types: D-D3b                                                                                                                                                                                                                                   |
| SpeedDial open                   | `p-speeddial-open` on root                                                                                                   | `u-speeddial-open` on trigger                                                                                                                                                                                                                                        | adapted selectors (E6)                                                                                                                                                                                                                                                                  |
| Angular Drawer focus trap        | `pFocusTrap` on the drawer root                                                                                              | `div[ufocustrap]` wrapper between `.u-drawer` and header/content/footer                                                                                                                                                                                              | the wrapper becomes the drawer's only flex item, so `flex-grow` on the content cannot take effect in ng. Candidate Angular-only adaptation `.u-drawer > [ufocustrap] { display: flex; flex-direction: column; … }` (X-1 accounts for interposed elements; no DOM change). Spec decision |

No new JavaScript is proposed [D] (D-G3-4: no JavaScript only to reproduce Prime runtime variables).

## H. Ultimate-only rules and exclusions [Rec]

| Rule (both frameworks unless noted)                                                                                                                                                                                    | Classification                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ConfirmDialog `.u-confirmdialog .u-dialog-content { align-items: flex-start; gap: 1rem }`, `-icon { flex-shrink: 0 }`, `-message { flex-grow: 1 }`, `-footer { display: flex; justify-content: flex-end; gap: .5rem }` | first is dead today and superseded by group 1 (omit); `-message`/`-footer` have no upstream group → retain or omit: Spec decision (footer layout is otherwise provided by Dialog's footer) |
| ConfirmPopup `.u-confirmpopup { position: absolute; top: 0; left: 0 }`                                                                                                                                                 | superseded by group 1, which has the same declarations (omit)                                                                                                                              |
| ConfirmPopup `-content { align-items: flex-start; gap }`, `-footer { …; margin-top: .5rem }`                                                                                                                           | superseded by groups 2 and 4 (omit)                                                                                                                                                        |
| Drawer `.u-drawer-mask { position: fixed; inset: 0; display: flex }`                                                                                                                                                   | retain (X-4 mask role)                                                                                                                                                                     |
| Drawer `.u-drawer { …; pointer-events: auto }` and per-position placement (`margin-left: auto`, `margin-top: auto`, `top/left/right/bottom`, `width/height: 100%`)                                                     | placement margins retain (X-4 justify role); sizes superseded by groups 17–21 (omit)                                                                                                       |
| Drawer header/content layout                                                                                                                                                                                           | superseded by groups 2–3 (omit)                                                                                                                                                            |
| Popover `.u-popover { position: absolute; top: 0; left: 0 }`                                                                                                                                                           | retain (X-4 root role)                                                                                                                                                                     |
| Popover `.u-popover-content { position: relative }`                                                                                                                                                                    | requires a Spec decision (no upstream counterpart; harmless)                                                                                                                               |
| SplitButton physical-radius rules and `border-radius: 6px` literal                                                                                                                                                     | superseded by groups 1–5 (omit)                                                                                                                                                            |
| SpeedDial `.u-speeddial { position: relative }`, `.u-speeddial-list { …; position: absolute }`                                                                                                                         | **conflict:** upstream root is `position: static` and the list flows in the flex layout; the absolute list is what covers the trigger today → omit (upstream replaces)                     |
| SpeedDial `.u-speeddial-item { transition … }`, `[data-u-hidden="true"] { visibility: hidden }`                                                                                                                        | transition superseded by group 5 (omit); hidden-item rule retain (Ultimate-only state, upstream uses `p-hidden`)                                                                           |
| SpeedDial `.u-speeddial-action { 2.5rem circle … }`, `:disabled { opacity: .6 }`                                                                                                                                       | depends on D-D3c (upstream styles actions through `Button`); disabled → B-2/C-7 role with `dt('disabled.opacity')`                                                                         |
| SpeedDial `.u-speeddial-mask { position: fixed; inset: 0; background: rgba(0,0,0,.4) }`                                                                                                                                | conflicts with group 7 (`position: absolute; border-radius`) and the B-2 overlay-mask role; Spec decision with D-D4                                                                        |

## I. Accessibility and deterministic verification

**Pre-change scan [N]** with our controlled `AxeBuilder` (addon scan disabled, X-8), closed and open states, Chromium:

| Story         | Angular open-state violations                                     | Vue open-state violations                 |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| ConfirmDialog | `button-name` (close button), `color-contrast` (2, button labels) | `svg-img-alt` (close icon)                |
| ConfirmPopup  | `aria-dialog-name`, `color-contrast` (2)                          | `aria-dialog-name`                        |
| Drawer        | `button-name` (close button)                                      | `svg-img-alt`                             |
| Popover       | `aria-dialog-name`                                                | `aria-dialog-name`                        |
| SplitButton   | `button-name` (dropdown), `color-contrast`, `region` (menu items) | `button-name`, `color-contrast`, `region` |
| SpeedDial     | `button-name` (trigger), `region`                                 | `button-name`, `region`                   |

(Page-level `landmark-one-main`/`page-has-heading-one` also appear in closed states, as in every Storybook iframe.)

- All of these exist before any G3-D change. None is in `ACCESSIBILITY_BASELINE.md`, because no Playwright accessibility spec covers these components yet.
- The tranche's differential accessibility validator will meet them first. Following the G3-B/C1/C2 practice, they would be recorded in a `…-g3d-accessibility-preexisting.md` record, and any row the port introduces goes to per-row user review.
- The X-8 row policy is still undecided [D] (ADR-052 "Not decided here"; ADR-053 not created). This research does not invent one, and no retry policy is introduced.

**Deterministic interaction and open states (ADR-052 X-6) [Rec]**, with the pointer parked at (0,0) before each screenshot:

- Popover, ConfirmPopup and ConfirmDialog: click the trigger. Angular anchored-position evidence depends on D-D1.
- Drawer: the ng `Open`/`RightPosition` stories render open on load. The Vue stories open on click. The ng `Default` story has no trigger.
- SplitButton: open the dropdown. The menu is `UMenu`-owned and mis-positioned (J), so screenshots should be scoped to the SplitButton element unless D-D6 says otherwise.
- SpeedDial: before the port, a real click cannot reach the trigger, so before-baselines need a dispatched click. After the port, the closed list gets `pointer-events: none` (group 4) and a real click should work; the Spec must verify this.
- Waits: SpeedDial item transition (200 ms plus inline delays up to 90 ms) needs `expect.poll` on computed opacity/transform (precedent R-17). Drawer group 1 adds `transition: transform 0.3s`, but no transform changes, since there are no animation classes.

**Verification-only stories needed [Rec]** (precedent D-C2-6):

- ConfirmDialog and ConfirmPopup with an icon (groups `-icon`);
- Drawer `top`, `bottom` and `full` positions;
- a Vue SplitButton `Disabled` story (ng has one);
- SpeedDial open, disabled item, `mask` and the four linear directions;
- an RTL Drawer for group 23 if it is ported.

## J. Story readiness and pre-existing defects [N]

1. **Angular SplitButton NG04002, re-verified:** the error is not caused by clicking. It is logged on story load by every Angular story that uses `provideRouter([])`: SplitButton `Default`/`Disabled`, and the already-shipped Menu, Menubar and Breadcrumb stories. The router's initial navigation fails on the `iframe.html` segment and rewrites the iframe URL to `/`. This is a pre-existing story-harness issue, independent of G3-D. Earlier tranches verified with it present, and tests must not rely on reloading the URL.
2. **SpeedDial first-button interaction, re-verified (both frameworks):** the cause is not "off-viewport". The closed action list is absolutely positioned at the root's origin and fully visible, so it covers the 16×6 px trigger. Ported upstream groups 1, 4 and 5 (static root, `pointer-events: none` list, `scale(0)`/`opacity: 0` items) would correct this as a recorded pre-existing-defect correction within the CSS port (precedent: F-3a/F-3b corrections inside G3-C2).
3. **ConfirmDialog/ConfirmPopup NG0304, re-verified:** not reproducible. No console errors on load or open, and both stories render their `u-button`s.
4. **Angular Popover and ConfirmPopup render at (0,0)** (Chromium and Firefox). This is a runtime defect: anchoring never runs (G). It is the same defect class as F-3c (Angular ContextMenu at 0,0), which was fixed in a separate, authorized C2-0 step before C2 [D].
5. **ConfirmDialog root class never reaches the rendered dialog** (both frameworks; E1).
6. **SpeedDial circle types never fan out** (both frameworks; E7).
7. **Angular Drawer content cannot grow** because of the focus-trap wrapper (G).
8. **Outside G3-D, observed because G3-D composes them:**
   - (a) Angular `UDialog` mask has no positioning CSS (computes `static`, the dialog spans the page width). Vue adds `.u-dialog-mask { position: fixed; … }` locally.
   - (b) `u-overlay-mask` has no CSS in either framework, because the base stylesheet is never loaded, so Dialog backdrops are transparent.
   - (c) Popup `UMenu` used by SplitButton is unanchored in Angular (no inline position) and `position: static` in Vue.

   These belong to Dialog and Menu (the original proof set), not to the G3-D families.

## K. Decisions required before a G3-D Spec

- **D-D1 — Angular Popover/ConfirmPopup anchoring (J4).**
  - (A) a separate, authorized runtime-fix step before G3-D implementation (C2-0 precedent);
  - (B) proceed with G3-D CSS only, and scope ng open-state screenshots to the element, recording the defect as a follow-up gap;
  - (C) other.

  [Rec] A.

- **D-D2 — ConfirmDialog scope (E1).**
  - (A) CSS-only adaptation that identifies the ConfirmDialog content through rendered DOM, e.g. `.u-dialog-content:has(> .u-confirmdialog-message)`;
  - (B) a separate runtime correction that puts the root class on the rendered dialog (X-2, separately authorized);
  - (C) omit group 1 as a feature exclusion.

  [Rec] A (no DOM change; `:has` precedent PX-M3).

- **D-D3 — SpeedDial.**
  - (a) Confirm the open-state adaptation form (`:has` vs sibling). [Rec] `:has`, for symmetry with G3-C2.
  - (b) Circle types: (A) omit group 6 and register the broken fan-out as a follow-up gap; (B) a separate runtime correction emitting a type class. [Rec] A.
  - (c) Trigger and action appearance (upstream `Button`): (A) keep Ultimate-only action rules, and record the unstyled trigger as a parity exception; (B) Ultimate-only rules mapped to existing `button.*` Aura tokens under D-G3-8 evidence; (C) compose `UButton` (DOM change, separately authorized). [Rec] B if the token-role evidence holds at Spec time, else A.
- **D-D4 — Overlay-mask role.** B-2 [D] covers base roles in component CSS.
  - SpeedDial's mask is always an overlay mask upstream, so B-2 applies directly.
  - The Drawer mask is an overlay mask upstream only when `modal`, but Ultimate's DOM does not express `modal` (X-3 needs a value-qualified state). Options: (A) apply the role to `.u-drawer-mask` unconditionally, with a recorded exception for `modal: false`; (B) no backdrop for the Drawer, recorded as a parity exception; (C) a separate runtime correction emitting a modal class.

  [Rec] B for G3-D with a follow-up, or A if non-modal use is judged negligible.

- **D-D5 — Popover/ConfirmPopup arrow and flip.** Confirm the arrow groups (popover 4–9, confirmpopup 8–13) and flipped groups (popover 3, confirmpopup 7) as feature exclusions, per the D-G3-4 correction (F-4a). [Rec] confirm.
- **D-D6 — SplitButton open-state evidence.** The popup `UMenu` defects (J8c) are Menu-owned. Options: (A) scope SplitButton screenshots to the SplitButton element and register the Menu popup positioning as a follow-up; (B) include a Menu fix (outside the families; not recommended). [Rec] A.
- **D-D7 — Angular Drawer wrapper adaptation (G).** Include the Angular-only `.u-drawer > [ufocustrap]` layout rule (X-1 interposed-element accounting, no DOM change), or record the non-growing content as a parity exception. [Rec] include.

Not decisions (covered by existing rulings) [D]: ADR-051 renames (D-G3-1); selector adaptation to existing DOM (D-G3-1); omission of unreachable groups (D-G3-3); no new tokens (D-G3-5, D-G3-8); per-framework adaptation (D-G3-9); PrimeNG-local CSS not baseline (G3-B Spec); base roles in component CSS (B-2); X-12 evidence set.

## L. Recommended tranche boundaries and order [Rec]

1. If D-D1 = A: a small **D-0 runtime step** (Angular Popover/ConfirmPopup anchoring only), separately specified and authorized, as with C2-0.
2. **G3-D as one tranche**, covering all six components. 77 upstream groups per framework (34 proposed ported) is less than half of G3-C2's 177. A split (D1 Overlays: Popover, ConfirmPopup, ConfirmDialog, Drawer; D2 Composites: SplitButton, SpeedDial) is possible if the user prefers a smaller visual-review gate. SpeedDial carries the most change, because its port also corrects the closed-state overlap.
3. G3-E stays after G3-D [D] (D-G3-6).

## M. Findings for separate follow-up gaps (not part of G3-D) [Rec]

- Angular `UDialog` mask positioning (J8a).
- `u-overlay-mask` has no CSS, so modal backdrops are transparent (J8b).
- Popup `UMenu` positioning when composed by SplitButton (J8c).
- Angular `provideRouter([])` stories log NG04002 and rewrite the URL (J1).
- SpeedDial circle-type fan-out, if D-D3b = A (E7).
- Drawer non-modal semantics (mask always interactive), if D-D4 = B.
- Pre-existing accessibility violations in I (`aria-dialog-name`, `button-name`, `svg-img-alt`, `region`, `color-contrast`) beyond what the tranche's per-row review decides.

GAP-084..086 and GAP-087..094 are untouched and independent of G3-D [D] (CI-health study).

## N. Evidence and reproduction

Workspace (git-ignored): `.superpowers/sdd/2026-10-07-gap-064-g3d-research/`.

```bash
# upstream groups (77 per framework) and token resolution
tar -xzf .vendor-cache/@primeuix__styles-2.0.3.tar.gz -C <ws>/up-styles
node <ws>/tools/upstream.mjs <ws>/up-styles/package/dist "$PWD" > <ws>/upstream.json
node <ws>/tools/tokens.mjs "$PWD" <ws>/upstream.json
# upstream sources
tar -xzf .vendor-cache/primevue-4.5.5.tar.gz -C <dir> <root>/packages/primevue/src/{confirmdialog,confirmpopup,drawer,popover,splitbutton,speeddial}
tar -xzf .vendor-cache/primeng-21.1.9.tar.gz -C <dir> <root>/packages/primeng/src/{confirmdialog,confirmpopup,drawer,popover,splitbutton,speeddial}
# Storybooks for DOM checks
pnpm --filter @ultimate/ng exec ng run ng:storybook --port=6001 --compodoc=false
pnpm --filter @ultimate/vue exec storybook dev -p 6003 --ci --no-open
# Angular router stories (J1)
node <ws>/tools/errs.mjs "$PWD/packages/ng" ng-splitbutton--default ng-menu--default ng-menubar--default ng-breadcrumb--default
```

- DOM, position, interaction and axe observations (D, E, I, J) were made with Playwright 1.63 scripts against those Storybooks. Each script opened stories through the X-8 story URL, clicked the trigger, and recorded classes, ancestors, computed styles, bounding boxes, `elementFromPoint` hits and `AxeBuilder` violations.
- Key source locations:
  - `packages/ng/src/popover/popover.ts:96-137` (show/align);
  - `packages/ng/src/confirm-popup/confirm-popup.ts:120-135`;
  - `packages/ng/src/drawer/drawer.ts:42-77` (template with `uFocusTrap`);
  - `packages/{ng,vue}/src/speed-dial/*` (open class on trigger);
  - `packages/ng/src/split-button/split-button.ts:52-82`;
  - `packages/vue/src/confirm-dialog/ConfirmDialog.vue:2-10`;
  - `packages/ng/src/dialog/dialog-style.ts` (no mask rule);
  - `packages/vue/src/dialog/dialog-style.ts:35-45`.
