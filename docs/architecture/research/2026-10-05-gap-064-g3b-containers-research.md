# GAP-064 G3-B research — F1 Containers & Panels

**Date:** 2026-10-05
**Evidence gathered at:** `main` `fe86fe4` (after G3-A merge), on branch `feature/gap-064-g3b-containers`.
**Baseline (ADR-048):** `@primeuix/styles` 2.0.3 (`dist/<key>/index.mjs`, export `style`), `@primeuix/themes` 2.0.3, PrimeNG 21.1.9, PrimeVue 4.5.5 — all extracted fresh from the pinned tarballs in `.vendor-cache/` for this research.
**Governing decisions:** ADR-051; D-G3-1..9 and the additional rulings in `2026-10-04-gap-064-g3-research.md` §11.
**Status:** research record.

- §1–§10 are the Research + Architecture Decision Brief as presented.
- §11 records the decisions the user took on it (2026-10-05).
- No Spec, no Plan, no implementation. GAP-064 stays PARTIAL.

**Markers:** ✅ = confirmed by evidence in this session; 🔶 = hypothesis to verify at Spec time / in the Docker "before" run.

## 1. Executive summary

- ✅ G3-B = family F1: **10 Aura keys**, **10 Angular components** and **10 Vue style modules** (13 Vue directories — `accordion`, `accordion-panel`, `accordion-header`, `accordion-content` share the `accordion` module).
- ✅ All 10 keys have an upstream structural module (89 rule groups in total, no keyframes) and a registered Aura preset module.
- ✅ Every `dt()` path resolves against the current preset, except the 2 known upstream typos `scrollpanel.barfocus.ring.width/offset` (E3, D-G3-5). One semantic reference: `splitter` → `border.radius.md`. No new tokens or modules.
- ✅ 4 registration sites need the ADR-051 key rename: `block-ui` → `blockui`, `scroll-panel` → `scrollpanel` (ng + vue). Their Aura variables are never defined today (`Theme.getComponent('block-ui'|'scroll-panel')` → empty).
- ✅ Proposed port: **76 of 89 groups per framework**; 13 omitted per framework as feature exclusions.
- ✅ No component is Ultimate-specific. Classification changes from the G3 research: card (ng), inplace and panel move from Direct to Adapted (§4).
- ✅ **Correction to G3 research §5 #4:** upstream ScrollPanel puts `p-scrollpanel-hidden` / `p-scrollpanel-grabbed` on the **bar** (and body), the same elements Ultimate uses. It is a rename, not a structural difference.
- ✅ No F1 component has screenshot or accessibility coverage today.
- Three things are new compared with G3-A and need a decision (§9): state expressed as `data-*` attributes, upstream **base-style** roles (`.p-disabled`, `.p-overlay-mask`), and upstream **inline-style** roles (Divider alignment).

## 2. Inventory

| Key           | Angular dir → registered key (site)                        | Vue dir(s) → registered key (site)                                                           | Raw `var()` refs that resolve today |
| ------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| `accordion`   | accordion → `accordion` (`accordion.ts:115`)               | accordion, accordion-panel, accordion-header, accordion-content → `accordion` (4 `Base*.ts`) | 2 / 2                               |
| `blockui`     | block-ui → **`block-ui`** ⚠ (`block-ui.ts:58`)             | block-ui → **`block-ui`** ⚠ (`BaseBlockUI.ts:12`)                                            | none (literal mask colour)          |
| `card`        | card → `card`                                              | card → `card`                                                                                | 4 / 4                               |
| `divider`     | divider → `divider`                                        | divider → `divider`                                                                          | 2 / 2                               |
| `fieldset`    | fieldset → `fieldset`                                      | fieldset → `fieldset`                                                                        | 1 / 1                               |
| `inplace`     | inplace → `inplace`                                        | inplace → `inplace`                                                                          | 1 / 0 (`--u-inplace-focus-ring`)    |
| `panel`       | panel → `panel`                                            | panel → `panel`                                                                              | 1 / 1                               |
| `scrollpanel` | scroll-panel → **`scroll-panel`** ⚠ (`scroll-panel.ts:89`) | scroll-panel → **`scroll-panel`** ⚠ (`BaseScrollPanel.ts:10`)                                | 1 / 0                               |
| `splitter`    | splitter → `splitter`                                      | splitter → `splitter`                                                                        | 3 / 0                               |
| `toolbar`     | toolbar → `toolbar`                                        | toolbar → `toolbar`                                                                          | 2 / 0                               |

Style modules: `packages/{ng,vue}/src/<dir>/<dir>-style.ts`. The ng and vue `css` blocks are textually identical for every key except accordion (different class names) and card (vue adds `.u-card-caption`, ng adds a subtitle `margin-top` hack).

## 3. Upstream-to-Ultimate class mapping (D-G3-1)

Unless listed, `p-X` → `u-X` by identical name.

| Key         | Angular                                                                                                                                                                                                                                                                                                                                      | Vue                                                                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accordion   | `p-accordionpanel` → `u-accordion-panel`; `-active` → `u-accordion-panel-active`; `.p-disabled` (on panel) → `.u-accordion-panel-disabled`; `p-accordionheader` → `u-accordion-header`; `-toggle-icon` → `u-accordion-toggle-icon`; `p-accordioncontent` → `u-accordion-content`; `p-accordioncontent-content` → `u-accordion-content-inner` | names match except `p-accordionheader-toggle-icon` → `u-accordionheader-toggleicon`. **No state classes:** `.p-accordionpanel-active` → `[data-p-active="true"]`, `.p-disabled` → `[data-p-disabled="true"]` (attributes already rendered on the panel) |
| blockui     | `p-blockui` → `u-blockui-container`; `p-blockui-mask`, `p-blockui-mask-document` identical; `p-overlay-mask` not rendered (§9 B-2)                                                                                                                                                                                                           | same                                                                                                                                                                                                                                                    |
| card        | identical; `p-card-caption` **not rendered** (title/subtitle sit directly in body)                                                                                                                                                                                                                                                           | identical                                                                                                                                                                                                                                               |
| divider     | identical; type (`solid/dashed/dotted`) and align classes not rendered                                                                                                                                                                                                                                                                       | same                                                                                                                                                                                                                                                    |
| fieldset    | identical; `p-fieldset-content-wrapper` not rendered                                                                                                                                                                                                                                                                                         | same                                                                                                                                                                                                                                                    |
| inplace     | identical; `.p-disabled` → `[data-p-disabled="true"]` (attribute already rendered on the display element)                                                                                                                                                                                                                                    | same                                                                                                                                                                                                                                                    |
| panel       | `.p-panel-toggleable .p-panel-header` → `.u-panel-header.u-panel-header-toggleable` (Ultimate marks the header, not the root; same specificity); wrapper and **`p-panel-footer` not rendered** (ng projects `[footer]` content with no wrapper)                                                                                              | same mapping; wrapper not rendered; footer rendered                                                                                                                                                                                                     |
| scrollpanel | `p-scrollpanel` → `u-scroll-panel` (prefix); `p-scrollpanel-hidden` → `u-scroll-panel-bar-hidden`; `p-scrollpanel-grabbed` → `u-scroll-panel-bar-grabbed` (same elements upstream: PrimeNG `scrollpanel.ts:232-247,377-395`, PrimeVue `ScrollPanel.vue:129-142`)                                                                             | same                                                                                                                                                                                                                                                    |
| splitter    | `p-splitterpanel` → `u-splitter-panel`; `-nested` not rendered; `.p-splitter-resizing` → `[data-resizing]` (host attribute set while dragging)                                                                                                                                                                                               | `p-splitterpanel` → `u-splitter-panel`; nested and resizing state not rendered                                                                                                                                                                          |
| toolbar     | identical                                                                                                                                                                                                                                                                                                                                    | identical                                                                                                                                                                                                                                               |

Structural checks done: every child combinator used upstream (`panel > header`, `fieldset > legend`, `splitter > gutter > handle`) holds in both frameworks' DOM; Vue Accordion panels are direct children of the root (`Accordion.vue` slot), so `:first-child` / `:last-child` match.

## 4. Rule groups: ported vs omitted (per framework)

| Key         | Upstream | ng ported | vue ported | Omitted (feature exclusions)                                       | Classification ng / vue (revised) |
| ----------- | -------- | --------- | ---------- | ------------------------------------------------------------------ | --------------------------------- |
| accordion   | 16       | 15        | 15         | `-content-wrapper`                                                 | Adapted / Adapted                 |
| blockui     | 4        | 4         | 4          | — (groups 3–4 adapted, §9 B-2)                                     | Adapted / Adapted                 |
| card        | 5        | 4         | 5          | ng: `-caption`                                                     | **Adapted** / Direct              |
| divider     | 14       | 7         | 7          | 6 type groups (`solid/dashed/dotted` × h/v), `left/right:dir(rtl)` | Adapted / Adapted                 |
| fieldset    | 12       | 11        | 11         | `-content-wrapper`                                                 | Direct / Direct                   |
| inplace     | 4        | 4         | 4          | —                                                                  | **Adapted** / **Adapted**         |
| panel       | 8        | 6         | 7          | `-content-wrapper`; ng: `-footer`                                  | **Adapted** / **Adapted**         |
| scrollpanel | 10       | 10        | 10         | —                                                                  | Adapted / Adapted                 |
| splitter    | 14       | 13        | 11         | `-nested`; vue: 2 `-resizing` groups                               | Adapted / Adapted                 |
| toolbar     | 2        | 2         | 2          | —                                                                  | Direct / Direct                   |
| **Total**   | **89**   | **76**    | **76**     | 13 / 13                                                            |                                   |

Not part of the baseline and not ported: PrimeNG-local additions appended after the `@primeuix/styles` import (accordion `icon-start` / `.p-ripple` / `.p-motion`, card and scrollpanel `display: block`). Upstream base-style enter/leave mask animations are excluded (Ultimate renders no animation classes).

## 5. Tokens

- ✅ 131 unique `dt()` paths across the 10 keys; all resolve against the current preset (runtime probe with `applyUltimateTheme()` + `Theme.getComponent` / `Theme.getCommon`), except `scrollpanel.barfocus.ring.width` and `.offset` (upstream typo, E3: ported as-is, D-G3-5).
- ✅ Cross-key reference: `splitter` → `border.radius.md` (semantic, defined).
- ✅ Base-style tokens that §9 B-2 would use are defined: `disabled.opacity`, `mask.background`, `mask.color`.
- Every invented raw name is removed by the port (`--u-scroll-panel-bar-bg`, `--u-splitter-*`, `--u-toolbar-*`, `--u-inplace-focus-ring`).

## 6. Structural findings (adaptation / parity exceptions)

1. ✅ **Vue state via attributes.** Vue AccordionPanel exposes active/disabled only as `data-p-active` / `data-p-disabled`; ng and vue Inplace expose disabled only as `data-p-disabled`. Upstream selects with classes. Adapting to attribute selectors keeps the DOM unchanged (D-G3-1). Ultimate CSS already uses this pattern today (`[data-u-disabled="true"]`, `[data-p-active="true"]`). 🔶 Verify that `false` renders as `"false"` (not absent) — `[…="true"]` is robust either way.
2. ✅ **Base-style roles.** Upstream relies on `@primeuix/styles/base` for `.p-disabled` (`opacity: dt('disabled.opacity')`, `pointer-events: none`, `cursor: default`) and `.p-overlay-mask` (fixed full-size box, `background: dt('mask.background')`, `color: dt('mask.color')`). Ultimate has no base stylesheet and renders neither class. Today Ultimate hard-codes `opacity: 0.6` (accordion) and `rgba(0, 0, 0, 0.4)` (BlockUI).
3. 🔶 **BlockUI non-fullscreen mask likely covers nothing today.** `.u-blockui-mask` has no position or size (only `-document` does), although the ng doc comment says the mask is "absolutely positioned over the host". Upstream gets geometry from `.p-overlay-mask` + `.p-blockui-mask.p-overlay-mask { position: absolute }`. To confirm in the Docker "before" screenshot.
4. 🔶 **ScrollPanel bar positioning.** Both frameworks' `moveBar()` copy upstream's `cssText` formulas (negative `bottom` / `inset-inline-end`), which assume upstream's `position: relative` bars after a `float: left` content container. Ultimate's bars are `position: absolute`, so the X bar is probably pushed outside the clipped root. Porting upstream CSS restores the mechanism the JS was written for. To confirm in the "before" run (bars are only visible on hover/focus).
5. ✅ **Divider alignment comes from upstream inline styles.** PrimeNG/PrimeVue `inlineStyles.root` set `justify-content` / `align-items` (default `center`). Ultimate documents "centered content only" but its CSS does not centre horizontal content.
6. ✅ **ng Card** renders no caption and always renders empty header and footer divs; with upstream `body.gap`, title→subtitle spacing becomes `body.gap` and the empty footer adds one trailing gap. Pre-existing structure; parity exception (D-G3-9).
7. ✅ **Accordion header** is a `div[role=button]` (upstream `<button>`). Upstream `all: unset` is safe on it; ng and vue glyph toggles (`▾/▸`) are Ultimate-specific content.
8. ✅ **ng Panel** uses `<u-button>` with `UButton` imported — no NG0304 risk in its stories.

## 7. Ultimate-only rules (current CSS with no upstream counterpart)

Rule used in G3-A (§5.2): a retained rule must not redeclare a property of an upstream-derived rule on the same selector. Candidates and recommendation:

| Rule (both fw unless noted)                                                                                   | Recommendation | Reason                                                                   |
| ------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `.u-fieldset-toggle-button { font: inherit; color: inherit }`                                                 | **Retain**     | Native `<button>` otherwise renders UA font/colour; no upstream property |
| `.u-fieldset-toggle-icon { font-weight; width: 1rem; display: inline-flex; justify-content }`                 | **Retain**     | Sizes Ultimate's text glyph (`+`/`−`); upstream uses an SVG icon         |
| `.u-splitter-gutter { touch-action: none }`                                                                   | **Retain**     | Behavioural: touch drag; no upstream CSS role                            |
| `.u-toolbar-start/-center/-end { gap: 0.5rem }`                                                               | Decide (B-4)   | No upstream property; spacing between grouped children                   |
| accordion root `gap: 2px`; toggle-icon `margin-left`                                                          | Drop           | Upstream separates panels with panel borders                             |
| card `-content { padding: 0 }`, `-footer { padding-top }`, ng `-subtitle { margin-top: -0.25rem }`            | Drop           | Covered by upstream body/caption gap                                     |
| panel `-header-actions { display: flex }`, `-header-toggleable { cursor: pointer }`, `-footer { border-top }` | Drop           | No upstream role; header itself is not clickable                         |
| scroll-panel root `{ position: relative; overflow: hidden }`, bar `position: absolute` and offsets            | Drop           | Conflicts with upstream bar mechanism (§6 #4)                            |
| inplace `-content { inline-flex; gap }`                                                                       | Drop           | Redeclares upstream `display: block`                                     |
| blockui mask flex centring                                                                                    | Drop           | Mask has no children                                                     |
| splitter root `overflow: hidden`, panel `flex-shrink/overflow: auto`, gutter `user-select`                    | Drop           | Redeclare or contradict upstream                                         |

## 8. Tranche, coverage and size

**Tranche.** One tranche (D-G3-6: G3-B = F1). Alternative split if smaller review units are wanted: B1 = card, toolbar, fieldset, panel, inplace, divider (low risk); B2 = accordion, blockui, scrollpanel, splitter (behaviour-adjacent).

**Screenshots (Linux Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, before + after; D-G3-7).** Existing stories (ng = vue names): Accordion Default/Multiple, BlockUI Default/Unblocked, Card Default/WithHeaderAndFooter, Divider Horizontal/Vertical, Fieldset Default/Toggleable, Inplace Default, Panel Default/Toggleable, ScrollPanel Default, Splitter Default, Toolbar Default. Verification stories needed because the changed CSS is otherwise not exercised:

- ng Accordion with an active + a disabled panel (ng Default has none active);
- BlockUI FullScreen;
- Divider with content (horizontal and vertical);
- Fieldset and Panel collapsed;
- Inplace disabled and active;
- vue Panel with footer;
- Splitter vertical;
- ScrollPanel with bars visible (hover/focus state screenshot).

Interaction states (hover / focus-visible) are better asserted by computed-style unit checks than screenshots, except ScrollPanel, whose bars are invisible at rest.

**Accessibility.** No F1 story is scanned today. G3-A's differential contract (`validate-g3a-accessibility.mjs` + pre-existing evidence file) is the model; extending or cloning it touches CI and is a Spec/Plan decision.

**Size.** 🔶 Upstream raw CSS for the 10 keys is 13.6 KB (2.2 KB gzip) vs 5.4 KB (1.4 KB gzip) per framework today; after omissions the increase is ≈ +0.8 KB gzip per framework. Expected well inside the 15% gate; measured after implementation against base ref `fe86fe4`.

## 9. Decisions requested

- **B-1 State via existing attributes.** Map upstream state classes to existing `data-*` attributes where Ultimate renders no state class (vue Accordion active/disabled; ng+vue Inplace disabled). _Recommend: approve._ Alternative (add state classes) is a DOM change, excluded by D-G3-1.
- **B-2 Upstream base-style roles.** (A) adapt the `.p-disabled` / `.p-overlay-mask` declarations into the owning component's module, with `dt('disabled.opacity')`, `dt('mask.background')`, `dt('mask.color')` (D-G3-8 evidence: `@primeuix/styles/base`), giving the BlockUI mask its upstream geometry; (B) keep Ultimate's literals (0.6, `rgba(0,0,0,0.4)`) and current mask geometry; (C) a shared base stylesheet — new infrastructure, rejected. _Recommend: A._
- **B-3 Upstream inline-style roles.** Express Divider's default centring as CSS (`.u-divider-horizontal { justify-content: center }`, `.u-divider-vertical { align-items: center }`), matching the PX-A4/PX-A6 precedent and Ultimate's documented contract. _Recommend: approve._
- **B-4 Ultimate-only rules.** Approve the §7 keep/drop list; decide the toolbar group gap. _Recommend: retain the 3 listed rules; drop the toolbar gap (no upstream role, consumer spacing)._
- **B-5 ScrollPanel mechanism.** Adopt upstream bar CSS (relative bars, floated container, `visibility: hidden` hidden state) as a rename-only port. _Recommend: approve;_ the "before" run documents the current behaviour.
- **B-6 Framework-specific exclusions.** ng Card caption, ng Panel footer, vue Splitter resizing — excluded, no DOM change (D-G3-9). ng Splitter resizing → `[data-resizing]`. Nested-splitter rule ported. _Recommend: approve._
- **B-7 Tranche shape.** One G3-B tranche vs B1/B2 split. _Recommend: one tranche._
- **B-8 Accessibility contract.** Extend G3-A's differential a11y mechanism to G3-B stories (a CI change, designed in the Spec). _Recommend: approve in principle._
- **B-9 Record corrections** to the G3 research: §5 #4 (ScrollPanel state is a rename) and the card/inplace/panel classification changes.

## 10. Outside G3-B

- G3-C..E families; Ripple; Tranche 1 / G3-A follow-ups; React.
- No new GAP IDs; GAP-064 stays PARTIAL.
- Pre-existing defects surfaced here (BlockUI mask geometry, ScrollPanel bar position) are fixed only insofar as the approved port fixes them; they are recorded, not separately worked.

## 11. Decisions (2026-10-05, user)

1. **B-1 = approve.** Where Ultimate already represents state as a `data-*` attribute, the ported selectors target that attribute (vue Accordion `[data-p-active="true"]` / `[data-p-disabled="true"]`; ng and vue Inplace `[data-p-disabled="true"]`). No state classes are added and the DOM does not change.
2. **B-2 = Option A.** The required upstream base-style declarations (`.p-disabled`, `.p-overlay-mask`) are placed in the affected component-local CSS, using the existing `dt('disabled.opacity')`, `dt('mask.background')` and `dt('mask.color')` tokens. No shared base stylesheet and no new infrastructure.
3. **B-3 = approve.** Divider centring is expressed in CSS instead of upstream's inline JavaScript styles, preserving the documented/current "centred content" behaviour.
4. **B-4 = approve, with this exact retained set.** Only these Ultimate-only rules are retained:
   - Fieldset toggle button `font: inherit; color: inherit`;
   - Fieldset toggle-icon sizing (`font-weight`, `width`, `display`, `justify-content`);
   - Splitter gutter `touch-action: none`.

   The Toolbar group gap and every other Ultimate-only rule not listed here are dropped.

5. **B-5 = approve.** The upstream ScrollPanel bar-positioning CSS is ported with the required Ultimate key/class renames only (§3).
6. **B-6 = approve, exactly as proposed.** Framework-specific exclusions: Angular Card caption, Angular Panel footer, Vue Splitter resizing. Angular Splitter resizing targets the existing `data-resizing` host attribute; no state class is added. The nested-splitter descendant rule is ported.
7. **B-7 = one G3-B tranche.** The 15% bundle-size gate is a hard stop: if the tranche exceeds it, work stops and is reported. The tranche is not split, and the excess is not rationalised after the fact.
8. **B-8 = approved in principle.**
   - The Spec designs the extension of the G3-A accessibility differential to G3-B.
   - The Spec must define: G3-B story identity; framework/browser coverage; separation of pre-existing violations; failure semantics; evidence/artifact handling.
   - CI is not modified at this stage.
   - The existing validator (`scripts/provenance/validate-g3a-accessibility.mjs`) is not assumed to need modification. It stays unchanged unless the Spec establishes a concrete requirement.
9. **B-9 = approve.** Corrections recorded with traceability:

   | Earlier statement                                                                                                                              | Correction                                                                                                                                                                                                                                                              | Evidence                                                                                                                                                                            |
   | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | G3 research §5 #4: ScrollPanel `.p-scrollpanel-hidden/grabbed` sit "on the container" while Ultimate's sit "on the bar"; structural adaptation | Upstream adds both classes to the **bar** elements (and `grabbed` also to `body`), the same elements Ultimate uses. The difference is the class name only: `p-scrollpanel-hidden` → `u-scroll-panel-bar-hidden`, `p-scrollpanel-grabbed` → `u-scroll-panel-bar-grabbed` | PrimeNG 21.1.9 `scrollpanel/scrollpanel.ts:232-247, 377-395`; PrimeVue 4.5.5 `scrollpanel/ScrollPanel.vue:129-142`; Ultimate `ng/src/scroll-panel/scroll-panel.ts:186-197, 296-307` |
   | G3 research §2/§4: Card = Direct / Direct                                                                                                      | Card = **Adapted** (ng) / Direct (vue): the ng template renders no `u-card-caption`                                                                                                                                                                                     | `ng/src/card/card.ts:24-42` vs `vue/src/card/Card.vue:7`                                                                                                                            |
   | G3 research §2/§4: Inplace = Direct / Direct                                                                                                   | Inplace = **Adapted** / **Adapted**: disabled state is the `data-p-disabled` attribute, not upstream's `p-disabled` class                                                                                                                                               | `ng/src/inplace/inplace.ts:51`; `vue/src/inplace/Inplace.vue:8`                                                                                                                     |
   | G3 research §2/§4: Panel = Direct / Direct                                                                                                     | Panel = **Adapted** / **Adapted**: the toggleable marker is on the header (`u-panel-header-toggleable`), not the root; ng renders no footer wrapper                                                                                                                     | `ng/src/panel/panel.ts:47, 75`; `vue/src/panel/Panel.vue:3`                                                                                                                         |

   The G3 research document itself is not edited; this table is the correction of record.

10. **Additional constraints.**
    - **BlockUI and ScrollPanel "before" observations are evidence, not separate bug-fix scope** (§6 #3, #4). If the ported upstream structural CSS fixes them, that is part of G3-B parity. No unrelated runtime or DOM fix is added.
    - **`scrollpanel.barfocus.ring.width` / `.offset`** remain the known upstream unresolved-token exception (E3 pattern, D-G3-5). They are ported as-is; no new tokens or theme modules are added.

**Next gate:** G3-B Specification — not started; requires separate authorization.
