# Specification — GAP-064 G3-B: Containers & Panels (F1) Use Their Aura Tokens

**Status:** Approved (Spec Review 2026-10-05); decisions in §13.
**Date:** 2026-10-05
**Branch:** `feature/gap-064-g3b-containers` (from `main` `fe86fe4`)
**Origin:** GAP-064 (PARTIAL), G3 tranche G3-B. Research and decisions: `docs/architecture/research/2026-10-05-gap-064-g3b-containers-research.md` (commit `f2698e3`), §11 B-1..B-9. G3-wide decisions: ADR-051, D-G3-1..9 and the rulings in `2026-10-04-gap-064-g3-research.md` §11. Parity baseline: ADR-048.

**Required sequence:** Decision (approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.** It changes no CI, component source/CSS, screenshot or baseline.

---

## 1. Purpose and Scope

Replace the hand-written CSS of the F1 components with the applicable upstream structural CSS from `@primeuix/styles` 2.0.3, so that they render with, and are customisable through, their already-registered Aura tokens.

- **Keys (10):** `accordion`, `blockui`, `card`, `divider`, `fieldset`, `inplace`, `panel`, `scrollpanel`, `splitter`, `toolbar`.
- **Framework components (20):** 10 Angular components and 10 Vue style modules. The Vue Accordion family has four directories (`accordion`, `accordion-panel`, `accordion-header`, `accordion-content`) that share one style module under the `accordion` key; it counts as one framework component.
- **Style files changed:** 20 (`packages/{ng,vue}/src/<dir>/<dir>-style.ts`).

The work has three parts:

1. **Port.** For each style file, port the upstream rule groups that match DOM Ultimate renders, with selectors mapped to existing Ultimate classes and attributes (D-G3-1, B-1). 76 of 89 groups per framework.
2. **Rename keys.** 4 registration sites move to the Aura key (ADR-051).
3. **Record.** Every omitted group is a feature exclusion; every adaptation, base-style role, inline-style role and retained rule is a parity exception.

One tranche (B-7). GAP-064 stays PARTIAL; G3-C..E remain.

## 2. Decisions This Specification Implements

| Decision    | Content (as approved; not reinterpreted)                                                                                                                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-051     | Upstream preset key is the canonical lookup key.                                                                                                                                                                                       |
| D-G3-1/2    | Selectors adapted to the existing Ultimate DOM; no DOM/class rename; explicit, testable mapping; no new public API or runtime abstraction.                                                                                             |
| D-G3-3      | Port only groups for rendered DOM/features; record omissions.                                                                                                                                                                          |
| D-G3-4      | Not applicable: no runtime-variable reference in the G3-B keys.                                                                                                                                                                        |
| D-G3-5      | `scrollpanel.barfocus.ring.width` / `.offset` ported as-is; exact exception list (§5.6).                                                                                                                                               |
| D-G3-7      | Linux Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` before/after; default tolerance; review gate before any baseline update.                                                                                                     |
| D-G3-8      | Literals → `dt()` only with same semantic role and upstream evidence; deviations recorded.                                                                                                                                             |
| D-G3-9      | Angular and Vue adapted independently where DOM differs.                                                                                                                                                                               |
| **B-1**     | Existing `data-*` state attributes are targeted where Ultimate represents state that way. No state classes, no DOM change.                                                                                                             |
| **B-2**     | Required `.p-disabled` / `.p-overlay-mask` roles in component-local CSS, using `disabled.opacity`, `mask.background`, `mask.color`. No shared base stylesheet, no new infrastructure.                                                  |
| **B-3**     | Divider centring expressed in CSS.                                                                                                                                                                                                     |
| **B-4**     | Retained Ultimate-only rules are exactly: Fieldset toggle-button `font/color: inherit`; Fieldset toggle-icon sizing; Splitter gutter `touch-action: none`. Everything else Ultimate-only, including the Toolbar group gap, is dropped. |
| **B-5**     | Upstream ScrollPanel bar-positioning CSS ported with Ultimate key/class renames only.                                                                                                                                                  |
| **B-6**     | Exclusions: Angular Card caption, Angular Panel footer, Vue Splitter resizing. Angular Splitter resizing targets `data-resizing`.                                                                                                      |
| **B-7**     | One tranche. 15% size gate is a hard stop.                                                                                                                                                                                             |
| **B-8**     | Accessibility differential extension designed here (§9); CI and the existing validator are not changed by this Spec.                                                                                                                   |
| **B-9**     | Research corrections (ScrollPanel state is a rename; Card ng / Inplace / Panel are Adapted) are carried as stated in research §11.9.                                                                                                   |
| Constraints | BlockUI/ScrollPanel before-state observations are evidence, not separate bug-fix scope. No runtime/DOM fix beyond the port.                                                                                                            |

## 3. Framework Applicability

- **Angular (`@ultimate/ng`):** 10 style files, 2 registration sites.
- **Vue (`@ultimate/vue`):** 10 style files, 2 registration sites.
- React, `@ultimate/themes` source, `@ultimate/uix-styled`, `@ultimate/uix-styles`, `@ultimate/ng-core`, `@ultimate/vue-core`: no change.

## 4. Existing Behavior (verified on `fe86fe4`)

### 4.1 Inventory and registration

| Key         | Angular style file / registration                                                            | Vue style file / registration                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| accordion   | `accordion/accordion-style.ts`; `accordion/accordion.ts:115` `accordion`                     | `accordion/accordion-style.ts`; `Base{Accordion,AccordionPanel,AccordionHeader,AccordionContent}.ts` `accordion` |
| blockui     | `block-ui/block-ui-style.ts`; `block-ui/block-ui.ts:58` **`block-ui`** ⚠                     | `block-ui/block-ui-style.ts`; `block-ui/BaseBlockUI.ts:12` **`block-ui`** ⚠                                      |
| card        | `card/card-style.ts`; `card`                                                                 | `card/card-style.ts`; `card`                                                                                     |
| divider     | `divider/divider-style.ts`; `divider`                                                        | `divider/divider-style.ts`; `divider`                                                                            |
| fieldset    | `fieldset/fieldset-style.ts`; `fieldset`                                                     | `fieldset/fieldset-style.ts`; `fieldset`                                                                         |
| inplace     | `inplace/inplace-style.ts`; `inplace`                                                        | `inplace/inplace-style.ts`; `inplace`                                                                            |
| panel       | `panel/panel-style.ts`; `panel`                                                              | `panel/panel-style.ts`; `panel`                                                                                  |
| scrollpanel | `scroll-panel/scroll-panel-style.ts`; `scroll-panel/scroll-panel.ts:89` **`scroll-panel`** ⚠ | `scroll-panel/scroll-panel-style.ts`; `scroll-panel/BaseScrollPanel.ts:10` **`scroll-panel`** ⚠                  |
| splitter    | `splitter/splitter-style.ts`; `splitter`                                                     | `splitter/splitter-style.ts`; `splitter`                                                                         |
| toolbar     | `toolbar/toolbar-style.ts`; `toolbar`                                                        | `toolbar/toolbar-style.ts`; `toolbar`                                                                            |

⚠ = the registered key differs from the Aura key; `Theme.getComponent('block-ui' | 'scroll-panel')` returns nothing today, so these components' Aura variables are never defined.

### 4.2 Upstream sources

- Structural CSS: `@primeuix/styles` 2.0.3 `dist/<key>/index.mjs` export `style` (pinned tarball `.vendor-cache/@primeuix__styles-2.0.3.tar.gz`).
- Base-style roles (B-2): `@primeuix/styles` 2.0.3 `dist/base/index.mjs` (`.p-disabled`, `.p-overlay-mask`).
- Inline-style roles (B-3): PrimeNG 21.1.9 `divider/style/dividerstyle.ts` and PrimeVue 4.5.5 `divider/style/DividerStyle.js` `inlineStyles.root`.
- Tokens: `@primeuix/themes` 2.0.3 Aura modules, already registered in `auraPreset`.
- Not part of the baseline: PrimeNG-local CSS appended after the `@primeuix/styles` import (accordion `icon-start` / `.p-ripple` / `.p-motion`; card and scrollpanel `display: block`). It is not ported.

### 4.3 Before-state observations (evidence, not scope)

- 🔶 **BlockUI:** the non-fullscreen `.u-blockui-mask` has no position or size, so it is expected to cover nothing.
- 🔶 **ScrollPanel:** both frameworks' `moveBar()` uses upstream's `cssText` formulas, which assume upstream's relative bars after a floated container; Ultimate's bars are absolute, so the horizontal bar is expected to sit outside the clipped root.

Both are recorded by the Docker "before" run (§8 C5) and the before-run of the layout checks (§8 C6). If the ported upstream CSS resolves them, that is G3-B parity. No runtime or DOM change is made for them.

### 4.4 Existing coverage

- Unit tests: none asserts style keys or CSS for F1.
- Screenshots and accessibility scans: none for any F1 story.
- Stories (identical names in both frameworks): Accordion Default/Multiple; BlockUI Default/Unblocked; Card Default/WithHeaderAndFooter; Divider Horizontal/Vertical; Fieldset Default/Toggleable; Inplace Default; Panel Default/Toggleable; ScrollPanel Default; Splitter Default; Toolbar Default. 16 per framework.
- Provenance: none of the 20 style files has an entry (pre-existing, broad condition).

## 5. Required Behavior

### 5.1 Style keys (ADR-051)

The 4 ⚠ sites register `blockui` and `scrollpanel`. Only the key literal changes. The other 16 keep their key.

### 5.2 Class and attribute mapping (D-G3-1, B-1, B-6)

Mapping is applied **to selectors only**; declarations are unchanged. Unless listed, `.p-X` → `.u-X` by identical name. Specific rows are applied before the generic rule, longest token first.

| Key         | Angular                                                                                                                                                                                                                                                                                                                                                                        | Vue                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accordion   | `.p-accordionpanel-active` → `.u-accordion-panel-active`; `.p-accordionpanel` → `.u-accordion-panel`; `.p-disabled` → `.u-accordion-panel-disabled`; `.p-accordionheader-toggle-icon` → `.u-accordion-toggle-icon`; `.p-accordionheader` → `.u-accordion-header`; `.p-accordioncontent-content` → `.u-accordion-content-inner`; `.p-accordioncontent` → `.u-accordion-content` | `.p-accordionpanel-active` → `[data-p-active="true"]`; `.p-disabled` → `[data-p-disabled="true"]`; `.p-accordionheader-toggle-icon` → `.u-accordionheader-toggleicon`; others identical |
| blockui     | `.p-blockui` → `.u-blockui-container`; `.p-blockui-mask.p-overlay-mask` → `.u-blockui-mask`; `.p-blockui-mask-document.p-overlay-mask` → `.u-blockui-mask.u-blockui-mask-document`                                                                                                                                                                                             | same                                                                                                                                                                                    |
| card        | identical                                                                                                                                                                                                                                                                                                                                                                      | identical                                                                                                                                                                               |
| divider     | identical                                                                                                                                                                                                                                                                                                                                                                      | identical                                                                                                                                                                               |
| fieldset    | identical                                                                                                                                                                                                                                                                                                                                                                      | identical                                                                                                                                                                               |
| inplace     | `.p-disabled` → `[data-p-disabled="true"]`                                                                                                                                                                                                                                                                                                                                     | same                                                                                                                                                                                    |
| panel       | `.p-panel-toggleable .p-panel-header` → `.u-panel-header.u-panel-header-toggleable`                                                                                                                                                                                                                                                                                            | same                                                                                                                                                                                    |
| scrollpanel | `.p-scrollpanel-hidden` → `.u-scroll-panel-bar-hidden`; `.p-scrollpanel-grabbed` → `.u-scroll-panel-bar-grabbed`; then prefix `.p-scrollpanel` → `.u-scroll-panel`                                                                                                                                                                                                             | same                                                                                                                                                                                    |
| splitter    | `.p-splitterpanel` → `.u-splitter-panel`; `.p-splitter-resizing` → `[data-resizing]`                                                                                                                                                                                                                                                                                           | `.p-splitterpanel` → `.u-splitter-panel`                                                                                                                                                |
| toolbar     | identical                                                                                                                                                                                                                                                                                                                                                                      | identical                                                                                                                                                                               |

Worked examples (normative):

- ng accordion group 10: `.u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header`
- vue accordion group 10: `.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader`
- inplace group 2: `.u-inplace-display:not([data-p-disabled="true"]):hover`
- ng splitter group 6: `.u-splitter-horizontal[data-resizing]`

**Specificity.** Every mapped selector has the same specificity as upstream (attribute selectors weigh as classes), except blockui group 3 (`.u-blockui-mask`, 0,1,0 instead of 0,2,0). That difference is recorded (PX-B4); the only earlier rule on that element is the B-2 base-role rule, which the group must override, and it does by source order.

**Structural preconditions** (verified; asserted by C3/C6): `panel > header` (accordion), `fieldset > legend`, `splitter > gutter > handle` child combinators hold in both frameworks; Vue Accordion panels are direct children of the root.

### 5.3 Rule groups: ported vs omitted

Upstream group numbering is the source order of each `@primeuix/styles` module (research §4).

| Key         | Upstream | ng ported | vue ported | Omitted (feature exclusions)                                  |
| ----------- | -------- | --------- | ---------- | ------------------------------------------------------------- |
| accordion   | 16       | 15        | 15         | #15 `-content-wrapper` (FX-B1)                                |
| blockui     | 4        | 4         | 4          | —                                                             |
| card        | 5        | 4         | 5          | ng #2 `-caption` (FX-B2)                                      |
| divider     | 14       | 7         | 7          | #8–#13 type groups (FX-B3); #14 `left/right:dir(rtl)` (FX-B4) |
| fieldset    | 12       | 11        | 11         | #11 `-content-wrapper` (FX-B1)                                |
| inplace     | 4        | 4         | 4          | —                                                             |
| panel       | 8        | 6         | 7          | #6 `-content-wrapper` (FX-B1); ng #8 `-footer` (FX-B5)        |
| scrollpanel | 10       | 10        | 10         | —                                                             |
| splitter    | 14       | 13        | 11         | #13 `-nested` (FX-B6); vue #6, #7 `-resizing` (FX-B7)         |
| toolbar     | 2        | 2         | 2          | —                                                             |
| **Total**   | **89**   | **76**    | **76**     | **13 / 13**                                                   |

Exact exclusion set — Angular (13): accordion #15; card #2; divider #8–#14 (7); fieldset #11; panel #6, #8; splitter #13. Vue (13): accordion #15; divider #8–#14 (7); fieldset #11; panel #6; splitter #6, #7, #13.

No upstream module in G3-B contains `@keyframes`.

### 5.4 Canonical content of each style module's `css`

In this order:

1. **Base-role rules (B-2)** — only where §5.5 lists them, exactly that text. They come first because upstream's base stylesheet precedes component styles in the cascade.
2. **Upstream-derived groups in upstream source order** — every ported group of §5.3, selectors rewritten per §5.2, declarations unchanged (every `dt('…')` and literal as written upstream).
3. **Inline-role rules (B-3)** — Divider only, exactly the §5.5 text.
4. **Retained Ultimate-only rules (B-4)** — exactly the §5.5 text, nothing else.

Constraints:

- Items 3 and 4 never redeclare a property that an item-2 rule declares on the same selector (verified for the §5.5 text).
- Item 1 intentionally precedes item 2; upstream groups override it where upstream's cascade does (blockui `position`).
- **Removed:** every other current hand-written rule, including every invented `var(--u-…, literal)` reference.
- **Unchanged:** `classes` resolvers, templates/DOM, inputs/props/emits.
- Location: each framework's own style module holds its own copy (G3-A precedent §13.1); no shared export.

### 5.5 Parity exceptions (exact text; both frameworks unless noted)

- **PX-B1 — Disabled role, Accordion (B-1, B-2).** From base `.p-disabled`.
  - Angular:
    ```css
    .u-accordion-panel-disabled,
    .u-accordion-panel-disabled * {
      cursor: default;
      pointer-events: none;
      user-select: none;
    }
    .u-accordion-panel-disabled {
      opacity: dt("disabled.opacity");
    }
    ```
  - Vue:
    ```css
    .u-accordionpanel[data-p-disabled="true"],
    .u-accordionpanel[data-p-disabled="true"] * {
      cursor: default;
      pointer-events: none;
      user-select: none;
    }
    .u-accordionpanel[data-p-disabled="true"] {
      opacity: dt("disabled.opacity");
    }
    ```
- **PX-B2 — Disabled role, Inplace (B-1, B-2).**
  ```css
  .u-inplace-display[data-p-disabled="true"],
  .u-inplace-display[data-p-disabled="true"] * {
    cursor: default;
    pointer-events: none;
    user-select: none;
  }
  .u-inplace-display[data-p-disabled="true"] {
    opacity: dt("disabled.opacity");
  }
  ```
- **PX-B3 — Overlay-mask role, BlockUI (B-2).** From base `.p-overlay-mask`; Ultimate's mask element always plays that role.
  ```css
  .u-blockui-mask {
    background: dt("mask.background");
    color: dt("mask.color");
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  ```
  Recorded differences: upstream writes `background: var(--px-mask-background, dt('mask.background'))`; the PrimeUIX `--px-mask-background` override hook is not ported (B-2 names `mask.background` only; see §12 item 3). The base enter/leave mask animations are excluded (FX-B8).
- **PX-B4 — BlockUI selector rewrites.** `.p-blockui-mask.p-overlay-mask` → `.u-blockui-mask` (specificity 0,1,0) and `.p-blockui-mask-document.p-overlay-mask` → `.u-blockui-mask.u-blockui-mask-document` (0,2,0). The root `.p-blockui` → `.u-blockui-container`.
- **PX-B5 — State attributes (B-1).** Vue Accordion active/disabled and Inplace disabled (both frameworks) use the `[data-p-*="true"]` selectors of §5.2.
- **PX-B6 — Divider centring (B-3).** Upstream supplies default centring through component inline styles (`justify-content` for horizontal, `align-items` for vertical; default alignment is centre). Appended exactly:
  ```css
  .u-divider-horizontal {
    justify-content: center;
  }
  .u-divider-vertical {
    align-items: center;
  }
  ```
- **PX-B7 — Panel toggleable marker.** Ultimate marks the header (`u-panel-header-toggleable`), not the root; selector per §5.2, same specificity.
- **PX-B8 — Angular Splitter resizing (B-6).** `.p-splitter-resizing` → `[data-resizing]` on the host.
- **PX-B9 — Retained Ultimate-only rules (B-4).** Appended exactly, in this order:
  ```css
  .u-fieldset-toggle-button {
    font: inherit;
    color: inherit;
  }
  .u-fieldset-toggle-icon {
    font-weight: 700;
    width: 1rem;
    display: inline-flex;
    justify-content: center;
  }
  .u-splitter-gutter {
    touch-action: none;
  }
  ```
- **PX-B10 — Angular Card structure (D-G3-9).** Angular renders no caption and always renders empty header and footer elements; title→subtitle spacing comes from `card.body.gap`, and the empty footer adds one trailing body gap. Recorded, not changed.
- **PX-B11 — Accordion header element.** Ultimate's header is `div[role=button]` (upstream `<button>`); upstream `all: unset` is ported unchanged. Toggle glyphs are Ultimate content.

### 5.6 Unresolved-token exception (D-G3-5)

Exactly two references, both in `scrollpanel` group 5 (`.u-scroll-panel-bar:focus-visible`), both frameworks: `dt('scrollpanel.barfocus.ring.width')` and `dt('scrollpanel.barfocus.ring.offset')`. They are upstream typos that resolve to nothing upstream as well. Ported as-is. No new token, no theme module, no substitution. Every other G3-B reference resolves (research §5).

### 5.7 Feature exclusions (recorded, not ported)

- **FX-B1:** content-wrapper groups (accordion, fieldset, panel) — Ultimate renders no wrapper; collapse is conditional rendering / `v-show`.
- **FX-B2:** Angular Card `-caption` (B-6).
- **FX-B3:** Divider `solid/dashed/dotted` type groups — no `type` input or class.
- **FX-B4:** Divider `left/right:dir(rtl)` — no align input or class.
- **FX-B5:** Angular Panel `-footer` (B-6) — footer content is projected without a wrapper.
- **FX-B6:** Splitter `-nested` — not rendered. The descendant rule `.u-splitter-panel .u-splitter` (#14) is ported.
- **FX-B7:** Vue Splitter `-resizing` (B-6) — no resizing state rendered.
- **FX-B8:** base mask enter/leave animations — no animation classes. **Not one of the 89 component rule groups**: it comes from the `base` module, the source of the B-2 roles, and is not counted in §5.3.
- PrimeNG-local extras (§4.2) are outside the baseline.

FX-B1..FX-B7 are exactly the 13 omitted component groups per framework of §5.3.

### 5.9 Fidelity data model (C3)

The G3-B data module keeps six categories as **separate, explicit data**. No category is derived from another, and none is counted inside another:

| #   | Category                            | Source                                           | Content                                                              | Counts                           |
| --- | ----------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------- |
| D1  | Ported component groups             | the 10 `@primeuix/styles` component modules      | the §5.3 ported groups, with the §5.2 selector mapping per framework | 76 per framework (of 89)         |
| D2  | Omitted component groups            | same modules                                     | upstream group numbers per key and framework, tagged FX-B1..FX-B7    | exactly 13 per framework (of 89) |
| D3  | B-2 base-role additions/adaptations | `base` module (`.p-disabled`, `.p-overlay-mask`) | the exact PX-B1, PX-B2, PX-B3 text, per framework                    | not part of the 89               |
| D4  | B-3 inline-role additions           | PrimeNG/PrimeVue Divider `inlineStyles`          | the exact PX-B6 text                                                 | not part of the 89               |
| D5  | Retained Ultimate-only rules (B-4)  | current Ultimate CSS                             | the exact PX-B9 text: 3 rules                                        | not part of the 89               |
| D6  | Base-module exclusions              | `base` module                                    | FX-B8 (mask enter/leave animations)                                  | not part of the 89               |

Invariants checked by C3:

- for each framework, D1 + D2 = 89 and the two sets are disjoint;
- D3–D6 are never counted toward 89, 76 or 13;
- every rule in a style module belongs to exactly one of D1, D3, D4, D5, in the §5.4 order, and no other rule exists;
- nothing from D2 or D6 is present;
- the §5.6 unresolved-token list is separate data (exactly two entries, ScrollPanel).

These data are never edited to make a check pass (§11 stop condition 6).

### 5.8 Provenance

Each of the 20 style files gets one entry in `docs/architecture/provenance/{ng,vue}.json`, G3-A wording: `modificationStatus: "reference-derived"`, description "Ported (Option B — reference, not verbatim copy) from @primeuix/styles@2.0.3 `<key>`, selectors adapted to Ultimate's DOM per the GAP-064 G3-B mapping (`<data module path>`); exceptions PX-B…/FX-B…". Other missing entries remain pre-existing and out of scope.

## 6. API Requirements

- No public API, signature, DOM, class or attribute change.
- Intended consumer-visible change: the 20 components render with Aura token values and follow theme customisation; ScrollPanel bars, BlockUI mask geometry and Divider centring follow upstream.
- Generated style keys change for BlockUI and ScrollPanel (ADR-051 runtime artifact).
- `MIGRATION.md` is decided at Plan Review (G3-A precedent).

## 7. Affected Files (at implementation; none changed by this Spec)

| File(s)                                                                               | Change                                                                                                                  |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 20 style modules (§4.1)                                                               | `css` per §5.4; `classes` unchanged                                                                                     |
| 4 ⚠ registration sites                                                                | key literal only                                                                                                        |
| `docs/architecture/provenance/{ng,vue}.json`                                          | 20 entries                                                                                                              |
| `packages/themes/test/fixtures/primeuix-styles-g3b.json` (new)                        | the 10 upstream modules plus `base` (for the B-2 source declarations), generated from the pinned tarball; no hand edits |
| G3-B mapping data module + `packages/themes/test/g3b-upstream-fidelity.test.ts` (new) | C3 static fidelity (§12 item 2)                                                                                         |
| `packages/{ng,vue}/src/g3b-aura-styles.spec.ts` (new)                                 | C1, C2, C3 state-selector checks                                                                                        |
| verification stories in `packages/{ng,vue}/src/<dir>/*.stories.ts`                    | §8 C5                                                                                                                   |
| `packages/{ng,vue}/e2e/g3b-aura-styles.spec.ts` + `*-snapshots/` (new)                | C5 visual, C6 layout/computed-style, C7 accessibility                                                                   |
| G3-B accessibility evidence + validator + CI steps                                    | §9; only after Plan Review                                                                                              |
| `ACCESSIBILITY_BASELINE.md`                                                           | only rows approved at the review gate                                                                                   |
| `BLUEPRINT_GAPS.md`, closeout record                                                  | at closeout; GAP-064 stays PARTIAL                                                                                      |

## 8. Acceptance Criteria

All are checked in both frameworks.

1. **C1 — Keys.** BlockUI and ScrollPanel, each mounted alone, produce one structural element and one `<key>-variables` element under `blockui` / `scrollpanel` and none under the hyphenated key. The other 18 keep their key.
2. **C2 — Variable resolution.** Each component is mounted in every state that §5.3/§5.5 ports (accordion active and disabled; blockui blocked, both modes; divider both layouts with content; fieldset toggleable, expanded and collapsed; inplace enabled, disabled, active; panel toggleable, expanded and collapsed, with footer in Vue; splitter both layouts). Every `var(--u-…)` in its structural CSS is defined by a registered element, except the §5.6 list.
   - Exception list asserted **bidirectionally**: exactly `{scrollpanel.barfocus.ring.width, scrollpanel.barfocus.ring.offset}` for ScrollPanel; empty for the other 18.
   - Own-token invariant: §5.4 item 2 of every module contains at least one `var(--u-<key>-` reference.
3. **C3 — Upstream fidelity and mapping exactness.**
   - Static (`g3b-upstream-fidelity.test.ts`), per style file: every §5.3 ported group is present after §5.2 mapping with identical declarations (whitespace-normalised); no omitted group is present; §5.5 rules are present with exactly the given text; **no other rule exists**; order is exactly §5.4; items 3/4 do not redeclare item-2 properties on the same selector.
   - Data, not convention: the mapping and the six §5.9 categories (D1–D6), plus the §5.6 exception list, are explicit test data. They are never edited to make a check pass.
   - State-selector coverage (runtime, `g3b-aura-styles.spec.ts`): for every mapped selector that depends on a state class or attribute, the component is mounted in that state and in its opposite, and the target element matches the selector (user-action pseudo-classes `:hover`, `:focus-visible`, `:active` removed for the match) only in that state. Covers: ng accordion active/disabled classes; vue accordion `data-p-active`/`data-p-disabled`; inplace `data-p-disabled`; panel `u-panel-header-toggleable`; ng splitter `data-resizing` (set while dragging); splitter `u-splitter-horizontal|vertical`; divider `u-divider-horizontal|vertical`; fieldset `u-fieldset-toggleable`; blockui `u-blockui-mask-document`; scrollpanel `u-scroll-panel-bar-hidden`.
4. **C4 — DOM unchanged.** In the affected component files, templates/DOM, `classes` resolvers and inputs/props/emits are unchanged; only `css` and the 4 key literals change. Checked by a scoped diff.
5. **C5 — Screenshots (D-G3-7).**
   - "Before" screenshots are recorded in Docker for every story in §8.1 below, in all three browsers per framework, **before any CSS change** (stories and e2e spec may be added first).
   - After the port, differences are reviewed at the visual gate before any baseline update. Changes inside the tolerance are recorded.
   - **8.1 Story set.** The 16 existing stories per framework (§4.4) plus these verification-only stories:
     - Angular only: Accordion with an active and a disabled panel.
     - Both: BlockUI FullScreen; Divider WithContent (horizontal) and WithContentVertical; Fieldset Collapsed; Inplace Disabled; Inplace Active; Panel Collapsed; Splitter Vertical.
     - Vue only: Panel WithFooter.
     - Totals: **25 Angular, 25 Vue** stories.
   - Interaction-state screenshot (no new story): ScrollPanel Default with the pointer over the panel (bars visible), both frameworks.
6. **C6 — Layout and computed-style checks** (Playwright, all three browsers per framework), for what screenshots do not prove:
   - Accordion: active header background equals the resolved `accordion.header.active.background`; disabled panel opacity equals resolved `disabled.opacity` and the header receives no pointer events; a hovered non-active enabled header's background equals the resolved `accordion.header.hover.background`.
   - BlockUI: the blocked mask's box equals the container's box (non-fullscreen) and the viewport (fullscreen); mask background equals resolved `mask.background`.
   - ScrollPanel: on hover both bars have `opacity: 1`; the horizontal bar's box lies within the root's box; a hidden bar has `visibility: hidden`.
   - Divider: content box centred within the root on the main axis (horizontal and vertical).
   - Inplace: a hovered enabled display's background equals the resolved `inplace.display.hover.background`; a hovered disabled display's background is unchanged from its rest state, and its opacity equals resolved `disabled.opacity`.
   - Splitter: Angular host while dragging has `cursor: col-resize` (horizontal) / `row-resize` (vertical); gutter `touch-action: none`.
   - Fieldset: toggle button inherits the legend's font family and colour.
   - The same checks run against the "before" state and their results are recorded as evidence (§4.3). Only the "after" results are acceptance criteria.
7. **C7 — Accessibility.** §9.
8. **C8 — Size (hard stop).** `node scripts/provenance/validate-bundle-size.mjs --base-ref fe86fe4` after implementation. If any package exceeds 15%, work stops and is reported. No split, no override, no after-the-fact rationalisation (B-7).
9. **C9 — Scope.** The diff touches no G3-A, G3-C..E file, no React, no `@ultimate/themes` source, no `uix-styled`/`uix-styles`, no core package, no Tranche 1/G3-A follow-up.
10. **C10 — Regression.** Unit suites pass for ng, ng-core, vue, vue-core, themes, uix-styled and react; typecheck passes; the Angular SSR harness passes; every existing screenshot outside §8.1 is unchanged; G3-A's visual and differential accessibility contracts still pass.
11. **C11 — Provenance.** §5.8 entries exist for exactly the 20 files.

## 9. Accessibility: G3-A differential extended to G3-B (design; B-8)

Nothing here is implemented by this Spec. CI and `validate-g3a-accessibility.mjs` stay unchanged until Plan Review approves the Plan.

1. **Story identity.** The G3-B story set is the `STORIES` table of `packages/<fw>/e2e/g3b-aura-styles.spec.ts`, exactly the §8.1 set: 25 Angular, 25 Vue story IDs (`ng-<component>--<story>`, `vue-<component>--<story>`). Every G3-B test title contains `G3-B` (`<Fw>/<Name> G3-B visual|layout|accessibility`); no other test title does. One accessibility scan per story ID; the ScrollPanel hover screenshot adds no scan.
2. **Framework/browser coverage.** Angular and Vue, each in `<fw>-chromium`, `<fw>-firefox`, `<fw>-webkit`: 75 + 75 = 150 reports. React has no G3-B spec.
3. **Pre-existing separation.** A new evidence file `docs/architecture/research/<date>-gap-064-g3b-accessibility-preexisting.md` (same table format, read by the shared parser) lists the fingerprints observed **both** in the pre-port Docker run (stories added, CSS unchanged) and the post-port run. It is evidence, not a baseline. Fingerprints observed only after the port are **introduced** and go to the review gate; only explicitly approved rows enter `ACCESSIBILITY_BASELINE.md`. Rows observed only before are fixed debt and are not listed.
4. **Failure semantics** (same as G3-A §14.10):

   | Case                                                                            | Result               |
   | ------------------------------------------------------------------------------- | -------------------- |
   | missing report (any story × browser)                                            | FAIL                 |
   | story table size ≠ 25                                                           | FAIL                 |
   | violation in neither `ACCESSIBILITY_BASELINE.md` nor the G3-B pre-existing list | FAIL                 |
   | violation in `ACCESSIBILITY_BASELINE.md` or the pre-existing list               | PASS                 |
   | pre-existing row no longer observed                                             | STALE, informational |

   Read-only: nothing writes either list. Identity stays `rule:story:target` (contrast-ratio changes are a known, accepted limitation).

5. **Validator.** A concrete requirement exists: the G3-A script hard-codes its spec path, story counts (31/34) and evidence file, and its contract is frozen by G3-A §14.10. G3-B therefore uses a **new, tranche-scoped** `scripts/provenance/validate-g3b-accessibility.mjs` that imports the same exports (`BASELINE_PATH`, `computeFingerprint`, `parseBaselineFingerprints`) as the G3-A script, with its own tests. `validate-g3a-accessibility.mjs` and `validate-accessibility-baseline.mjs` stay **unchanged** (§12 item 1 offers the alternative).
6. **CI design (applied only after Plan Review).** In `track-a-browser-visual-a11y`: the strict run's selection becomes `--grep-invert "G3-A|G3-B"` (otherwise G3-B scans would enter the strict check and fail on pre-existing rows); add G3-B steps mirroring G3-A for `ng` and `vue`: run the G3-B spec in the 3 projects, run the G3-B validator, upload `g3b-accessibility-reports-<fw>` including the validator output. The G3-A steps are unchanged.
7. **Evidence/artifacts.** Docker before/after envelopes are kept under `.superpowers/sdd/…` for the review (not `/tmp`, which is wiped between sessions); the pre-existing list's derivation (commits, counts per rule) is recorded in the G3-B review record; CI uploads the reports and validator output per framework.

## 10. Verification Approach

- TDD: C1–C3 tests first (red), then the port.
- Visual: stories + e2e spec first, Docker "before" baselines and before-state C6 evidence, then the port, Docker after-run, review gate.
- Fixture regenerated from the tarball and compared with `.vendor-extracted` locally.
- Size, scoped diff and accessibility derivation recorded in the review record.

## 11. Scope Boundaries and Stop Conditions

**Out of scope:** G3-A, G3-C..E; Ripple; React tokenization; Tranche 1 and G3-A follow-ups; new Aura modules or tokens; new GAPs; DOM/class/runtime changes; shared base stylesheet; pre-existing provenance gaps outside the 20 files; separate fixes for the §4.3 observations; unrelated CI failures.

**Stop and report (no silent workaround) if:**

1. any package exceeds the 15% size gate (C8);
2. a §5.3 ported group cannot be matched to rendered DOM without a DOM/class/runtime change;
3. any unresolved token appears beyond §5.6, or a §5.6 reference unexpectedly resolves;
4. an upstream count, mapping or ordering in this Spec is found wrong (correct by recorded amendment, as G3-A §13.9);
5. the visual review finds an unexpected change, or the accessibility check reports an introduced violation;
6. making a check pass would require editing fidelity data, exception lists or evidence files;
7. any change would touch CI or the existing validators outside an approved Plan.

## 12. Open Items for Spec Review

1. **Accessibility validator shape (B-8).** (a) **Recommended:** new tranche-scoped `validate-g3b-accessibility.mjs`; G3-A script unchanged. (b) Generalise the G3-A script with a tranche argument — modifies a frozen, verified script.
2. **Fidelity tooling.** (a) **Recommended:** new G3-B data module (mapping, exclusions, exceptions, retained text) that imports the exported `parseGroups`/`norm` helpers from `packages/themes/test/utils/g3a-port.mjs` without modifying it. (b) Self-contained copy of those helpers.
3. **`--px-mask-background` hook (B-2 consequence).** PX-B3 ports `dt('mask.background')` without upstream's `var(--px-mask-background, …)` wrapper, as B-2 names only the token. Confirm, or approve keeping the wrapper verbatim.
4. **BlockUI group-3 specificity (PX-B4).** Confirm the 0,1,0 rewrite (no competing rule) rather than an artificially doubled selector.
5. **Verification story set (§8.1).** Approve the 25/25 set and the ScrollPanel hover screenshot.
6. **C6 browser coverage.** All three browsers (recommended; cheap) vs Chromium only.
7. **Vue `false` attribute rendering** 🔶: selectors use `="true"`, so behaviour is correct whether `false` renders as `"false"` or is absent; C3 asserts it at runtime.
8. **MIGRATION.md:** decided at Plan Review.

## 13. Spec Review Decisions (2026-10-05)

1. **Accessibility validator (B-8): (a).** A new tranche-scoped `scripts/provenance/validate-g3b-accessibility.mjs` reuses the same fingerprint helpers. `validate-g3a-accessibility.mjs` and `validate-accessibility-baseline.mjs` stay unchanged. Any CI change happens only later, through the approved Plan/Implementation path.
2. **Fidelity tooling: (a).** A dedicated G3-B data module imports `parseGroups` and `norm` from `packages/themes/test/utils/g3a-port.mjs`; `g3a-port.mjs` is not modified. Mappings, exclusions, exceptions and retained-rule text are explicit test data (§5.9) and are not editable merely to make tests pass.
3. **`--px-mask-background`: current Spec approved.** The upstream `var(--px-mask-background, …)` wrapper is not retained; PX-B3 uses `dt('mask.background')` as B-2 specifies. No compatibility hook is introduced. The difference stays documented in PX-B3.
4. **BlockUI specificity: approved.** `.u-blockui-mask` stays at 0,1,0 (PX-B4); the selector is not artificially duplicated. Source order is the intended mechanism for overriding the B-2 base-role rule.
5. **Story set: approved.** 25 Angular + 25 Vue stories (§8 C5), plus the ScrollPanel hover screenshot in both frameworks. No further stories unless a concrete verification requirement emerges during implementation.
6. **C6 browser coverage: all three.** Chromium, Firefox and WebKit for both Angular and Vue; not reduced to Chromium only.
7. **Vue `false` attributes: no additional action.** The `="true"` selector strategy stays; the runtime C3 check verifies actual behaviour. No workaround or DOM change.
8. **MIGRATION.md:** deferred to Plan Review; no change at the Spec stage.
9. **Clarification applied before commit: fidelity data model.** §5.9 separates six categories: the 13 omitted component groups (D2, FX-B1..B7); B-2 base-role additions (D3); B-3 inline-role additions (D4); the three retained Ultimate-only rules (D5); and the base mask-animation exclusion FX-B8 (D6), which is not one of the 89 component groups. §5.7 marks FX-B8 accordingly. The 89 / 76 / 13 counts are unchanged.

**Next gate:** Implementation Plan — not started; requires separate authorization.
