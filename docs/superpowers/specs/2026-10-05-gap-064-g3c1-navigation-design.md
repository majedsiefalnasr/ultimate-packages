# Specification — GAP-064 G3-C1: Navigation (Breadcrumb, Dock, Steps, Stepper, Tabs) Uses Its Aura Tokens

**Status:** Approved at Spec Review (2026-10-05) — decisions recorded in §15; Amendment A1 from Plan Review (2026-10-06) in §16.
**Date:** 2026-10-05
**Branch:** `feature/gap-064-g3c-menus-navigation` (from `main` `2c8ef45`)
**Origin:** GAP-064 (PARTIAL), G3-C sub-tranche C1. Research and decisions: `docs/architecture/research/2026-10-05-gap-064-g3c-menus-navigation-research.md` (commit `6721085`), §9 C-1..C-11. G3-wide decisions: ADR-051, D-G3-1..9 (`2026-10-04-gap-064-g3-research.md` §11). Parity baseline: ADR-048.

**Required sequence:** Decision (approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout. **This specification does not implement anything.** G3-C2 (Menus) is a separate gate (C-9).

---

## 1. Purpose and scope

Replace the hand-written CSS of the five C1 style modules with the applicable `@primeuix/styles` 2.0.3 structural CSS, mapped to the existing Ultimate DOM, so that Breadcrumb, Dock, Steps, Stepper and Tabs render with — and follow customisation of — their registered Aura tokens.

- **Keys (5):** `breadcrumb`, `dock`, `steps`, `stepper`, `tabs`.
- **Style files changed (10):** `packages/{ng,vue}/src/<dir>/<dir>-style.ts` for `breadcrumb`, `dock`, `steps`, `stepper`, `tabs`. Stepper and Tabs sub-components already share their key's module.
- **Style keys:** all 5 already register under their Aura key in both frameworks. **No ADR-051 rename falls in C1**; the 11 C-11 renames all belong to C2 components.
- **Not in C1:** TieredMenu, ContextMenu, Menubar, MegaMenu, PanelMenu (C2); everything listed in §12.

GAP-064 stays PARTIAL.

## 2. Decisions this specification implements

| Decision     | Applied in C1 as                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-051      | No C1 key changes (all five already match).                                                                                                                         |
| D-G3-1/2     | Selectors mapped to the existing DOM (§4); no DOM/class rename; mapping is explicit test data.                                                                      |
| D-G3-3       | Only groups for rendered DOM/features are ported; every omission is listed with its reason (§5).                                                                    |
| D-G3-5       | No unresolved reference falls in C1 (§7).                                                                                                                           |
| D-G3-7       | Linux Docker before/after; review gate before any baseline change (§9).                                                                                             |
| D-G3-8       | Literals → `dt()` only through ported upstream groups or the approved base role; retained literals are the §6.3 list.                                               |
| D-G3-9       | Angular/Vue differences handled per framework (§3.2).                                                                                                               |
| **C-1**      | `p-disabled` → the component's existing disabled class; `p-focus` and `p-readonly`/`p-stepper-readonly` have no emitted equivalent in C1 → groups omitted (§4, §5). |
| **C-2**      | No C1 group mixes rendered and unrendered selectors; pruning is not exercised in C1.                                                                                |
| **C-3**      | Tabs: `.p-tablist-viewport` → `.u-tablist-content`; `.p-tablist-nav-button` → `.u-tablist-prev-button, .u-tablist-next-button` (§4).                                |
| **C-4**      | No C1 component has an upstream JS-driven style role; not exercised in C1.                                                                                          |
| **C-5, C-6** | MegaMenu, PanelMenu — C2 only.                                                                                                                                      |
| **C-7**      | Component-local `.p-disabled` base-role rules for Breadcrumb, Dock, Stepper, Tabs; **not** for Steps, whose own upstream group cancels the base role (§6.1).        |
| **C-8**      | Retained Ultimate-only rules only with evidence: exactly the §6.3 list.                                                                                             |
| **C-9**      | C1 is its own gate: own Docker evidence, visual review, accessibility differential, size measurement.                                                               |
| **C-10**     | Interaction screenshots, layout/computed-style checks, mandatory `packages/vue/e2e/stepper.spec.ts`, new C1 accessibility validator (§9, §10).                      |
| **C-11**     | Confirmations are C2-only (`menubar.submenu.color`, renames).                                                                                                       |

## 3. Existing behaviour (verified at `6721085`)

### 3.1 Inventory

| Key        | Angular registration                                                                     | Vue registration                                                                                                 | Current CSS chars ng / vue |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| breadcrumb | `breadcrumb/breadcrumb.ts:139`                                                           | `breadcrumb/BaseBreadcrumb.ts:20`                                                                                | 461 / 461                  |
| dock       | `dock/dock.ts:81`                                                                        | `dock/BaseDock.ts:10`                                                                                            | 1385 / 1385                |
| steps      | `steps/steps.ts:78`                                                                      | `steps/BaseSteps.ts:10`                                                                                          | 662 / 662                  |
| stepper    | `stepper/{stepper,step-list,step-item,step,step-panels,step-panel,stepper-separator}.ts` | `stepper/BaseStepper.ts:9` (+ `Step`, `StepItem`, `StepList`, `StepPanel`, `StepPanels`, `StepperSeparator`.vue) | 875 / 1643                 |
| tabs       | `tabs/{tabs,tab-list,tab,tab-panels,tab-panel}.ts`                                       | `tabs/BaseTabs.ts:13` (+ `Tab`, `TabList`, `TabPanel`, `TabPanels`.vue)                                          | 862 / 862                  |

### 3.2 DOM facts the mapping relies on

- **Disabled state** is emitted as a component class in both frameworks: `u-breadcrumb-item-disabled`, `u-dock-item-disabled`, `u-steps-item-disabled`, `u-step-disabled`, `u-tab-disabled` (plus `data-u-disabled` attributes). Breadcrumb's home item has no disabled class (resolver `homeItem` takes no params) — pre-existing, unchanged.
- **Active state:** `u-steps-item-active`, `u-step-active`, `u-step-item-active`, `u-tab-active` — same names as upstream (after `p-`→`u-`), so no mapping. Dock emits `u-dock-item-active` and a link `data-u-active` from hover tracking (Ultimate magnification, §6.3).
- **Not emitted:** keyboard-focus class on Dock items (`p-focus`); readonly classes for Steps (`readonly` input exists) and Stepper (`linear` input exists).
- **Stepper names:** `u-step-list`, `u-step-item`(`-active`), `u-step-panels`, `u-step-panel`, `u-step-panel-content-wrapper`, `u-step-panel-content` (upstream: `p-steplist`, `p-stepitem`, `p-steppanels`, `p-steppanel`, `p-steppanel-content-wrapper`, `p-steppanel-content`).
- **Stepper framework differences:**
  - Vue `UStepPanel` renders `u-step-panel-content-wrapper` and `u-step-panel-content` for vertical (`UStepItem`) layouts and hides inactive panels with `v-show` (inline style).
  - Angular `UStepPanel` renders neither element (`stepPanelContent` is defined in the resolver but unused) and hides inactive panels with the `hidden` attribute (`step-panel.ts:31`).
  - Vue `UStep` renders `u-stepper-separator` inside the step (as upstream); Angular `UStep` does not (pre-existing, unchanged).
- **Tabs:** upstream's content element carries `p-tablist-content p-tablist-viewport` and each navigator `p-tablist-prev|next-button p-tablist-nav-button`; Ultimate emits only `u-tablist-content` and `u-tablist-prev-button` / `u-tablist-next-button` on the same elements (Angular `tab-list.ts:31-40`, Vue `TabList.vue:6-21`). Inactive tab panels: Angular `hidden` attribute, Vue `v-show`.
- **Dock:** position class `u-dock-${position}` (`top|bottom|left|right`); no mobile/breakpoint class.
- **Breadcrumb:** the separator is a text `li` (`›`), no separator icon element.

### 3.3 Coverage today

No C1 component has screenshot or accessibility coverage. The only C1 e2e test is `packages/vue/e2e/stepper.spec.ts` (GAP-077: Vue horizontal separators sit between consecutive headers on one row; no screenshot). No unit test asserts C1 style keys or CSS.

## 4. Selector mapping (D-G3-1, C-1, C-3)

Applied to selectors only, in order, before the generic `.p-` → `.u-` rule; declarations unchanged. "text" replaces one exact upstream selector (PX-C2 only); "class" replaces a whole class token (not followed by `[a-z0-9-]`); "expand" turns one selector part into a list.

| Key        | Mapping (identical for Angular and Vue)                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| breadcrumb | generic only                                                                                                                                                                                                                                                                                                                                     |
| dock       | generic only                                                                                                                                                                                                                                                                                                                                     |
| steps      | **text** `.p-steps-item-link:not(.p-disabled):focus-visible` → `.u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible` (PX-C2, §6.5); then `.p-disabled` → `.u-steps-item-disabled` (C-1)                                                                                                                                   |
| stepper    | `.p-steppanel-content-wrapper` → `.u-step-panel-content-wrapper`; `.p-steppanel-content` → `.u-step-panel-content`; `.p-steppanels` → `.u-step-panels`; `.p-steppanel` → `.u-step-panel`; `.p-stepitem-active` → `.u-step-item-active`; `.p-stepitem` → `.u-step-item`; `.p-steplist` → `.u-step-list`; `.p-disabled` → `.u-step-disabled` (C-1) |
| tabs       | `.p-tablist-viewport` → `.u-tablist-content` (C-3); **expand** `.p-tablist-nav-button` → `.u-tablist-prev-button`, `.u-tablist-next-button` (C-3); `.p-disabled` → `.u-tab-disabled` (C-1)                                                                                                                                                       |

Normative examples:

- Steps #9 (PX-C2, Plan Review amendment A1): `.u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible` — the disabled filter moves to the item, the element that carries the disabled class (§6.5). Upstream's `.p-steps-item-link:not(.p-disabled)` filter never excludes anything, because upstream also puts `p-disabled` on the item. Specificity 0,3,0 → 0,4,0; no other rule styles the link's focus.
- Tabs #7: `.u-tablist-prev-button, .u-tablist-next-button { all: unset; position: absolute !important; … }`; #8/#9 expand the same way with `:focus-visible` / `:hover`. Each expanded selector has the specificity of the upstream one.
- Tabs #3 and #6 both land on `.u-tablist-content` (the element carries both roles upstream).
- Stepper #24 (Vue): `.u-step-item .u-step-panel-content { … }`.

## 5. Upstream rule-group inventory (exact)

Numbers are upstream source order in `@primeuix/styles` 2.0.3. ✓ = ported (D1), ✗ = omitted (D2, feature exclusion), with the reason.

### 5.1 breadcrumb — 11 groups; ported 10 / 10

1 `.p-breadcrumb` ✓ · 2 `-list` ✓ · 3 `-separator` ✓ · **4 `.p-breadcrumb-separator-icon:dir(rtl)` ✗ FX-C1** — Ultimate's separator is a text `li` (`›`); no separator-icon element exists · 5 `.p-breadcrumb::-webkit-scrollbar` ✓ · 6 `-item-link` ✓ · 7 `-item-link:focus-visible` ✓ · 8 `-item-link:hover .p-breadcrumb-item-label` ✓ · 9 `-item-label` ✓ · 10 `-item-icon` ✓ · 11 `-item-link:hover .p-breadcrumb-item-icon` ✓.

### 5.2 dock — 17 groups; ported 11 / 11

1 `.p-dock` ✓ · 2 `-list-container` ✓ · 3 `-list` ✓ · 4 `-item` ✓ · **5 `.p-dock-item.p-focus` ✗ FX-C2** — Ultimate emits no keyboard-focus class on Dock items (C-1: no equivalent state → omit) · 6 `-item-link` ✓ · 7 `-top` ✓ · 8 `-bottom` ✓ · 9 `-right` ✓ · 10 `-right .p-dock-list` ✓ · 11 `-left` ✓ · 12 `-left .p-dock-list` ✓ · **13–17 `.p-dock-mobile …` ✗ FX-C3** (5 groups) — Ultimate renders no mobile/breakpoint mode or class.

### 5.3 steps — 15 groups; ported 14 / 14

1 `.p-steps` ✓ · 2 `-list` ✓ · 3 `-item` ✓ · 4 `.p-steps-item.p-disabled, .p-steps-item.p-disabled *` ✓ (mapped) · 5 `-item:before` ✓ · 6 `-item:first-child::before` ✓ · 7 `-item:last-child::before` ✓ · 8 `-item-link` ✓ · 9 `-item-link:not(.p-disabled):focus-visible` ✓ (adapted, PX-C2) · 10 `-item-label` ✓ · 11 `-item-number` ✓ · 12 `-item-number::after` ✓ · **13 `.p-steps:not(.p-readonly) .p-steps-item` ✗ FX-C4** — Ultimate emits no readonly class (approved exclusion "Steps/Stepper readonly classes"); its only declaration is `cursor: pointer`, and the item links are anchors with `href`, which already show a pointer · 14 `-item-active .p-steps-item-number` ✓ · 15 `-item-active .p-steps-item-label` ✓.

### 5.4 stepper — 28 groups; ported Angular 25 / Vue 27

1 `.p-steplist` ✓ · 2 `.p-step` ✓ · 3 `.p-step:last-of-type` ✓ · 4 `.p-step-header` ✓ · 5 `.p-step-header:focus-visible` ✓ · **6 `.p-stepper.p-stepper-readonly .p-step` ✗ FX-C5** (both) — no readonly class for `linear` (approved exclusion); note upstream itself emits `p-readonly`, not `p-stepper-readonly`, so this group is inert upstream as well · 7 `.p-step-title` ✓ · 8 `.p-step-number` ✓ · 9 `.p-step-number::after` ✓ · 10 `.p-step-active .p-step-header` ✓ · 11 `.p-step-active .p-step-number` ✓ · 12 `.p-step-active .p-step-title` ✓ · 13 `.p-step:not(.p-disabled):focus-visible` ✓ (mapped) · 14 `.p-step:has(~ .p-step-active) .p-stepper-separator` ✓ · 15 `.p-stepper-separator` ✓ · 16 `.p-steppanels` ✓ · 17 `.p-steppanel` ✓ · 18 `.p-stepper:has(.p-stepitem)` ✓ · 19 `.p-stepitem` ✓ · 20 `.p-stepitem.p-stepitem-active` ✓ · 21 `.p-stepitem .p-step` ✓ · 22 `.p-stepitem .p-steppanel` ✓ · **23 `.p-stepitem .p-steppanel-content-wrapper`** ✓ Vue / **✗ FX-C6 Angular** — Angular renders no content-wrapper element · **24 `.p-stepitem .p-steppanel-content`** ✓ Vue / **✗ FX-C6 Angular** — Angular renders no content element · 25 `.p-stepitem .p-stepper-separator` ✓ · 26 `.p-stepitem .p-stepper-separator:dir(rtl)` ✓ · 27 `.p-stepitem:has(~ .p-stepitem-active) .p-stepper-separator` ✓ · 28 `.p-stepitem:last-of-type .p-steppanel` ✓.

### 5.5 tabs — 19 groups; ported 19 / 19

All ported: 1 `.p-tabs` · 2 `.p-tablist` · 3 `.p-tablist-viewport` (mapped, C-3) · 4 `.p-tablist-viewport::-webkit-scrollbar` (mapped) · 5 `.p-tablist-tab-list` · 6 `.p-tablist-content` · 7 `.p-tablist-nav-button` (expanded, C-3) · 8 `…:focus-visible` (expanded) · 9 `…:hover` (expanded) · 10 `.p-tablist-prev-button` · 11 `.p-tablist-next-button` · 12 `prev/next:dir(rtl)` · 13 `.p-tab` · 14 `.p-tab:not(.p-disabled):focus-visible` (mapped) · 15 `.p-tab:not(.p-tab-active):not(.p-disabled):hover` (mapped) · 16 `.p-tab-active` · 17 `.p-tabpanels` · 18 `.p-tabpanel:focus-visible` · 19 `.p-tablist-active-bar`.

### 5.6 Totals

|         | Upstream | D1 ported | D2 omitted                                          |
| ------- | -------- | --------- | --------------------------------------------------- |
| Angular | 90       | 79        | 11 (FX-C1, FX-C2, FX-C3 ×5, FX-C4, FX-C5, FX-C6 ×2) |
| Vue     | 90       | 81        | 9 (FX-C1, FX-C2, FX-C3 ×5, FX-C4, FX-C5)            |

These counts were verified at Spec time by a dry run of the §8 data model against a fixture regenerated from the pinned tarball (0 problems).

## 6. Additions and retained rules

### 6.1 D3 — base-role disabled rules (C-7)

Upstream Breadcrumb, Dock, Step and Tab put `p-disabled` on the item and rely on `@primeuix/styles/base` (`.p-disabled, .p-disabled * { cursor: default; pointer-events: none; user-select: none }`, `.p-disabled { opacity: dt('disabled.opacity') }`). Exact text, both frameworks, first in the module:

```css
.u-breadcrumb-item-disabled,
.u-breadcrumb-item-disabled * {
  cursor: default;
  pointer-events: none;
  user-select: none;
}
.u-breadcrumb-item-disabled {
  opacity: dt("disabled.opacity");
}
```

and the same pair for `.u-dock-item-disabled` (dock), `.u-step-disabled` (stepper) and `.u-tab-disabled` (tabs). Declarations equal the upstream base groups exactly (no recorded difference).

**Not for Steps:** upstream steps group 4 (`.p-steps-item.p-disabled, .p-steps-item.p-disabled * { opacity: 1; pointer-events: auto; user-select: auto; cursor: auto }`) explicitly cancels the base role at higher specificity, so upstream disabled steps are not dimmed. Porting group 4 (mapped) reproduces that; a base-role rule would be inert. **Parity change PX-C1 (approved, SR-C1-1):** disabled Steps items are no longer dimmed (today `opacity: 0.6`, after the port `1`) — an intentional, documented parity change, not a regression. Click/keyboard activation remains blocked by Ultimate's existing JS guard (`isItemDisabled`) and `tabindex="-1"`, both unchanged.

**Dock disabled opacity (approved, SR-C1-4):** the current literal `0.5` becomes `dt('disabled.opacity')` (Aura `0.6`) through the dock D3 pair; the literal is not kept as an Ultimate-only exception.

### 6.2 D4 / D6

None in C1 (no JS-driven upstream role, no base-module exclusion is touched).

### 6.5 PX-C2 — Steps focus-ring exclusion moved to the item (Plan Review amendment A1)

Adapted D1 selector (steps group 9 only, both frameworks); a CSS selector adaptation only, with no new class, DOM change or runtime/JS behaviour.

|                                  | Selector                                                                     | Specificity |
| -------------------------------- | ---------------------------------------------------------------------------- | ----------- |
| Upstream (pinned 2.0.3, group 9) | `.p-steps-item-link:not(.p-disabled):focus-visible`                          | 0,3,0       |
| Plain C-1 mapping (rejected)     | `.u-steps-item-link:not(.u-steps-item-disabled):focus-visible`               | 0,3,0       |
| **PX-C2 (ported)**               | `.u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible` | 0,4,0       |

**Invariant:** a disabled Steps item stays excluded from the focus ring, even though PX-C1 removes its opacity dimming.

**Evidence (2026-10-06):**

1. **Upstream source.** PrimeVue `steps/style/StepsStyle.js` and PrimeNG `steps/style/stepsstyle.ts` both put `p-disabled` in the `item` classes and only `p-steps-item-link` on the link, so upstream's `:not(.p-disabled)` on the link never excludes anything (inert upstream, as Stepper group 6 is).
2. **Ultimate DOM** (Angular and Vue, rebuilt Storybook, `*-steps--default`): `u-steps-item-disabled` on items 1–2 and never on a link; link `tabindex` `0,-1,-1`. A second Tab never lands on a disabled link.
3. **Rendered behaviour** (Chromium, Firefox, WebKit × ng, vue; the would-be ported Steps CSS injected; transitions settled). Every enabled link reached by Tab is `:focus-visible` with `outline: solid 1px rgb(16, 185, 129)`, the token ring. A disabled link focused programmatically after keyboard use is also `:focus-visible`. With the plain mapping it gets the same token ring (6/6). With PX-C2 it gets no token ring: `outline-color: rgba(0, 0, 0, 0)`, `box-shadow: none` (6/6). The remaining `outline-style: auto` is the UA ring, made transparent by ported group 8's `outline-color: transparent`, so nothing is visible.

Recorded in provenance with PX-C1 for `steps` (Plan Task 7).

### 6.3 D5 — retained Ultimate-only rules (C-8, exact list)

| ID   | Rule (exact text)                                                                                                 | Frameworks  | No upstream role covers it                                                                                                                                                                                                    | Removing it causes a regression                                                                                                                                                                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-C1 | `.u-dock-item-link { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: bottom center; }` | ng, vue     | Upstream `@primeuix/styles` dock has no transform/scale rule; PrimeVue `DockSub.vue` tracks `currentIndex` on mouseenter but never scales. Upstream group 6 declares neither `transition` nor `transform-origin` on the link. | Ultimate's Dock documents a CSS-driven per-icon magnification-on-hover (`dock.ts` doc comment, Angular and Vue). Without R-C1/R-C2 the magnification disappears — a behavioural regression of a documented feature.                                                                                            |
| R-C2 | `.u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"] { transform: scale(1.5); }`                     | ng, vue     | As R-C1. `data-u-active` is the existing hover-index attribute on the link (`dock.ts:41,56`, `Dock.vue:13`).                                                                                                                  | As R-C1.                                                                                                                                                                                                                                                                                                       |
| R-C3 | `.u-step-panel[hidden] { display: none; }`                                                                        | **ng only** | Upstream hides panels through its own component mechanism; no stylesheet rule.                                                                                                                                                | Angular hides inactive panels with the `hidden` attribute; ported group 22 `.u-step-item .u-step-panel { display: grid }` (author origin) overrides the UA `[hidden] { display: none }`, so every inactive panel of a vertical Angular stepper would show. Vue uses `v-show` (inline style) and needs no rule. |

Order: appended last, R-C1, R-C2 (dock) / R-C3 (stepper). None redeclares a property of a ported group on the same selector (checked by the dry run). R-C3 intentionally wins over group 22 by source order at equal specificity.

### 6.4 Current Ultimate rules dropped (with reason)

| Current rule (both frameworks unless noted)                                                                                        | Reason it is not retained                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Breadcrumb `.u-breadcrumb-item-link { cursor: pointer; … gap: 0.5rem; text-decoration }`                                           | Replaced by group 6; links are anchors with `href` (pointer by default).                                                            |
| Breadcrumb `.u-breadcrumb-item[data-u-disabled="true"] .u-breadcrumb-item-link {…}`                                                | Replaced by D3. (Also inert today: `data-u-disabled` sits on the link, not the item.)                                               |
| Dock `.u-dock-list-container` / `.u-dock-item` / position literals                                                                 | Replaced by groups 2, 4, 7–12.                                                                                                      |
| Dock `.u-dock-item[data-u-disabled="true"] { pointer-events: none; opacity: 0.5 }`                                                 | Replaced by D3 (`opacity` becomes `disabled.opacity`).                                                                              |
| Dock link `cursor: pointer; text-decoration: none; width/height: 3rem`                                                             | Group 6 (`cursor: default`, `dock.item.size`); icon-only links show no underline.                                                   |
| Dock `.u-dock-item-link:hover ~ .u-dock-item-link, .u-dock-item[data-u-disabled="true"] .u-dock-item-link { transform: scale(1) }` | First part is inert (links are not siblings); second part is covered by D3 (`pointer-events: none` prevents hover and hover-index). |
| Steps disabled dimming and `cursor` rules                                                                                          | PX-C1 (upstream cancels dimming); links keep their pointer.                                                                         |
| Steps `.u-steps-item-number { border-radius: 50% }`, `.u-steps-item-label { text-align: center }`                                  | Replaced by groups 10–11 (token radius; link is a centred column).                                                                  |
| Stepper layout literals (both frameworks), Vue vertical-layout literals                                                            | Replaced by groups 1–28 (the vertical layout is upstream groups 18–28).                                                             |
| Vue `.u-step-panel[data-u-hidden="true"] { display: none }`                                                                        | `v-show` already hides via inline style.                                                                                            |
| Tabs `.u-tab { display: inline-flex; align-items: center; background: transparent; border: none }`                                 | Group 13 (tokens); tabs are flex items of `.u-tablist-tab-list`, so no display rule is needed (upstream has none).                  |
| Tabs `.u-tabpanel[hidden] { display: none }`                                                                                       | No ported group sets `display` on `.u-tabpanel`, so the UA `[hidden]` rule applies (Angular); Vue uses `v-show`.                    |
| Tabs prev/next, active-bar, content literals                                                                                       | Replaced by groups 3–12, 19.                                                                                                        |

## 7. Tokens

- Every `dt()` path in the five upstream modules resolves against the current preset (G3-C research probe via `Theme.getComponent` / `getCommon`; re-asserted at runtime by C2): breadcrumb 16, dock 12, steps 23, stepper 37, tabs 44 paths. Stepper also references the semantic `focus.ring.*` tokens, which resolve.
- D3 uses `disabled.opacity` (semantic, defined).
- **Unresolved upstream references in C1: none.**
- No new tokens, no new or changed preset modules, no `@ultimate/themes` source change.

## 8. Fidelity data model (D1–D6, as G3-B §5.9)

A dedicated G3-C1 data module (Plan decides the file name; it imports `parseGroups`/`norm` from the frozen `g3a-port.mjs` without modifying it) holds, as explicit test data:

- **D1** ported groups with the §4 mapping; **D2** omitted groups with their FX tag (§5); **D3** base-role text (§6.1); **D4** none; **D5** retained text (§6.3); **D6** none.
- Invariants: per framework D1 + D2 = 90 and disjoint (Angular 79 + 11, Vue 81 + 9); each emitted rule belongs to exactly one of D1, D3, D5; canonical order D3 → D1 (upstream order) → D5; D2 never emitted; no other rule; D5 never redeclares a D1 property on the same selector; D3 declarations equal the upstream base groups.
- The fixture is generated from the pinned tarball (5 keys + `base`), no hand edits.
- These data are never edited to make a check pass.

The categories map to the reader's distinction as: **upstream parity rules** = D1 unmapped; **approved adaptations** = D1 mapped (§4) + D3; **omitted upstream groups** = D2; **retained Ultimate-only rules** = D5; **verification-only behaviour** = §9/§10 tests and stories, which ship no CSS.

## 9. Verification

### 9.1 Acceptance criteria

1. **C1 — Keys:** each component registers exactly one structural element and one `<key>-variables` element under its (unchanged) Aura key.
2. **C2 — Variable resolution:** mounted in every ported state (disabled, active, vertical Stepper, Tabs with navigators), every `var(--u-…)` in the structural CSS is defined; the exception list is empty for all five keys (bidirectional); ported CSS contains at least one `var(--u-<key>-`.
3. **C3 — Fidelity and state selectors:** static exactness per §8; runtime state-selector rows prove each mapped selector matches the rendered element only in its state (disabled classes, active classes, Stepper vertical names, Tabs content/navigators).
4. **C4 — No DOM change:** in component files only the `css` block (plus one doc-comment line, G3 precedent) changes; templates, `classes` resolvers, inputs/props/emits unchanged; no new class, no restructuring, no runtime/JS change.
5. **C5 — Screenshots:** §9.2 story set, Linux Docker before/after, review gate before any baseline change.
6. **C6 — Layout/computed style (Chromium, Firefox, WebKit, both frameworks):** §9.3.
7. **C7 — Accessibility:** §10.
8. **C8 — Size:** §11, hard stop.
9. **C9 — Scope:** §12.
10. **C10 — Regression:** unit suites, typecheck, Angular SSR, every existing screenshot outside §9.2 unchanged, G3-A and G3-B visual/accessibility contracts still pass, **and `packages/vue/e2e/stepper.spec.ts` passes unchanged.**
11. **C11 — Provenance:** one `reference-derived` entry per changed style file (10) in `docs/architecture/provenance/{ng,vue}.json`.

### 9.2 Screenshot matrix (approved, SR-C1-3)

Existing stories (both frameworks): Breadcrumb Default, WithoutHome, WithDisabledItem; Dock Default, LeftPosition; Steps Default, NotReadonly; Stepper Default, Linear; Tabs Default — **10 per framework**.

Verification-only stories (both frameworks), each needed because its CSS is otherwise unexercised:

| Story                                                    | Exercises                        |
| -------------------------------------------------------- | -------------------------------- |
| Dock TopPosition                                         | groups 7 (`-top`)                |
| Dock RightPosition                                       | groups 9–10 (`-right`)           |
| Dock WithDisabledItem                                    | D3 dock                          |
| Steps WithDisabledItem                                   | group 4 (PX-C1), group 9 (PX-C2) |
| Stepper Vertical (`UStepItem`)                           | groups 18–28; Angular R-C3       |
| Tabs WithDisabledTab                                     | D3 tabs, groups 14–15 mapping    |
| Tabs WithNavigators (overflowing tabs, `showNavigators`) | groups 3–12 (C-3)                |

Total **17 stories per framework**. Interaction-state screenshot (no extra story): Dock Default with the pointer over an item (magnification, R-C1/R-C2), both frameworks.

### 9.3 Layout and computed-style checks

- **Breadcrumb:** disabled item `opacity` = resolved `disabled.opacity`, link `pointer-events: none`; hovered enabled label colour = `breadcrumb.item.hover.color`.
- **Dock:** for each of top/bottom/left/right the root box sits on that viewport edge; disabled item `opacity` = `disabled.opacity`; hovering an enabled link gives `transform` scale 1.5 (R-C2).
- **Steps:** active number colour = `steps.item.number.active.color`, inactive = `steps.item.number.color` (the Aura backgrounds are equal, so colour is the discriminating property); disabled item `opacity` = 1 (PX-C1); a keyboard-focused enabled link shows the token ring and a focused disabled item's link does not (PX-C2).
- **Stepper:** active number colour = `stepper.step.number.active.color`, inactive = `stepper.step.number.color`; disabled step `opacity` = `disabled.opacity`; **vertical: exactly one panel visible** (Angular R-C3, Vue `v-show`); separator before the active step = `stepper.separator.active.background` (Vue).
- **Tabs:** active tab colour = `tabs.tab.active.color`; disabled tab `opacity` = `disabled.opacity`; with navigators, prev/next buttons are visible, absolutely positioned at the inline-start/end edges inside the tablist box; active-bar `height` = `tabs.active.bar.height`.
- **Mandatory regression:** `packages/vue/e2e/stepper.spec.ts` unchanged and passing.

## 10. Accessibility (C1 differential contract)

- A **new, tranche-scoped validator** for C1 (same contract as G3-A/G3-B: completeness per story × 3 browsers, FAIL on violations in neither `ACCESSIBILITY_BASELINE.md` nor a C1 pre-existing evidence list, STALE informational, read-only), reusing the frozen fingerprint helpers. `validate-g3a-accessibility.mjs`, `validate-g3b-accessibility.mjs`, `validate-accessibility-baseline.mjs`, `g3a-port.mjs` and `g3b-port.mjs` stay byte-identical.
- Story identity: the 17 stories per framework (§9.2), titles containing a C1 tag (Plan fixes the exact tag, e.g. `G3-C1`), one scan per story.
- Pre-existing separation: fingerprints observed both before and after the port go to a dated C1 evidence file; introduced rows go to the review gate; only approved rows enter `ACCESSIBILITY_BASELINE.md`.
- **CI (approved, SR-C1-2 — G3-B model):** CI's strict scan currently selects `--grep-invert "G3-A|G3-B"`; without wiring, C1 e2e tests would enter it and fail on pre-existing rows. The Plan therefore (i) extends the strict selection to exclude `G3-C1` as well, and (ii) adds the dedicated C1 accessibility scan and validation step. G3-A/G3-B validators and tooling stay byte-identical; no CI change beyond what isolates and validates C1.

## 11. Size gate

Authoritative: direct comparison of the `index.mjs` gzip size of `packages/ng` and `packages/vue` built at the **pre-C1 baseline `2c8ef45`** (current `main`, the G3-C branch point) against the current build. Growth above **15%** for either package is a hard stop. `validate-bundle-size.mjs` may run as an additional check only (its Angular baseline is stale). Estimate: well below 1 KB gzip per framework for C1.

## 12. Scope and stop conditions

**Out of scope:** G3-C2 components; G3-D/G3-E; G3-B follow-ups U1, U2, Vue BlockUI; the `ng.json` `accordion.spec.ts` provenance gap; React; Ripple; nested ContextMenu submenus, MegaMenu modes, Steps/Stepper readonly classes (approved exclusions); Angular horizontal Stepper separators and Breadcrumb home-item disabled class (pre-existing, unchanged); new GAP IDs. GAP-064 stays PARTIAL.

**Stop and report (no workaround) if:** a ported group cannot match rendered DOM without a DOM/class/runtime change; any unresolved token appears; a count, mapping or order differs from this Spec; any unexpected visual change or introduced accessibility violation; size above 15%; `stepper.spec.ts` fails; making a check pass would require editing fidelity data, exceptions, evidence or tests; any change to G3-A/G3-B tooling.

## 13. Affected files (at implementation; none changed by this Spec)

10 style modules; the C1 fixture, data module and fidelity test under `packages/themes/test/`; per-framework runtime specs; verification stories in the five component story files; per-framework C1 e2e specs and snapshots; the C1 accessibility validator, its test and evidence file; provenance JSON (10 entries); `ACCESSIBILITY_BASELINE.md` only for approved rows; review record; `MIGRATION.md` (approved at Plan Review); the `@primeuix/styles` entry of `docs/architecture/PROVENANCE.md`, one sentence (approved at Plan Review); `.github/workflows/ci.yml` per SR-C1-2.

## 14. Open items for Spec Review (resolved — see §15)

1. **Steps parity change (PX-C1):** confirm that disabled Steps items follow upstream (not dimmed), rather than keeping Ultimate's dimming as a retained rule (which would fail C-8's "no upstream role covers it" test, since upstream group 4 covers it).
2. **CI wiring (§10):** (a) the Plan includes C1 CI wiring (strict `--grep-invert "G3-A|G3-B|G3-C1"` + C1 steps), as G3-B did — recommended, otherwise CI's strict scan fails on C1's pre-existing rows; or (b) no CI change in C1.
3. **Story matrix (§9.2):** approve the 7 verification stories and the Dock hover screenshot.
4. **Dock disabled opacity:** today 0.5 → `disabled.opacity` (Aura 0.6) via D3; confirm (follows C-7).
5. **`MIGRATION.md`:** decided at Plan Review.

## 15. Spec Review decisions (2026-10-05)

Spec approved with these decisions; wording in §3–§13 updated accordingly.

| ID      | Decision                                                                                                                                                                                                                        | Effect                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SR-C1-1 | **PX-C1 approved.** Disabled Steps items follow upstream and are not dimmed (upstream group 4 sets `opacity: 1`); keeping the dimming would violate C-8. Existing interaction protection (JS guard, `tabindex="-1"`) unchanged. | The `0.6` → `1` change is an intentional, documented parity change, reviewed as such at the visual gate; not a regression. No Steps D3, no Steps D5.                                                               |
| SR-C1-2 | **CI option (a).** C1 is wired into CI on the G3-B model: strict selection excludes `G3-C1` in addition to `G3-A` and `G3-B`; a dedicated C1 accessibility scan + validation step is added.                                     | G3-A/G3-B validators and tooling byte-identical; the CI diff is limited to isolating and validating C1.                                                                                                            |
| SR-C1-3 | **Story matrix approved:** the 7 verification stories and the Dock hover interaction screenshot (§9.2).                                                                                                                         | Stories stay verification-focused; no unrelated story changes. Coverage retained for Dock positions/disabled, Steps disabled, vertical Stepper, Tabs disabled, Tabs navigators/overflow, Dock hover magnification. |
| SR-C1-4 | **Dock disabled opacity approved:** literal `0.5` → `dt('disabled.opacity')` (`0.6`), a consequence of C-7.                                                                                                                     | The literal is not preserved as an Ultimate-only exception.                                                                                                                                                        |
| SR-C1-5 | **`MIGRATION.md`** left for Plan Review.                                                                                                                                                                                        | —                                                                                                                                                                                                                  |

Unchanged by Spec Review: counts (Angular 90/79/11, Vue 90/81/9), FX-C1..FX-C6, D3 set, D5 = R-C1..R-C3, the 15% gate against `2c8ef45`, frozen G3-A/G3-B tooling, §12 scope.

## 16. Amendment A1 — Plan Review (2026-10-06)

Plan Review approved the Plan with `MIGRATION.md` (Task 11), the one-sentence `PROVENANCE.md` entry, browser-only checks for the Tabs navigators and the Stepper `:has()` groups, and subagent-driven execution. It re-confirmed PX-C1 (applies to explicitly disabled items and to every non-active item of a readonly Steps; items stay non-interactive). It required one amendment before implementation:

- **PX-C2 (§4, §5.3, §6.5):** the Steps group 9 focus selector is adapted so the disabled filter sits on the item. This was chosen by the user over keeping upstream's inert text, and verified against the upstream source, the Ultimate DOM and three browsers (§6.5).
- **§9.3** Steps/Stepper checks use the discriminating colour tokens (consistency with the Plan; the Aura active/inactive number backgrounds are equal), and Steps adds the PX-C2 focus check.

Unchanged: counts, FX-C1..FX-C6, D3, D5, PX-C1, the size gate, frozen tooling, scope. No CSS, component, story, baseline or CI change is made by this amendment.

## 17. Amendment A2 — Task 6 stop (2026-10-06, user decision)

Task 6 stopped on the Plan stop rule "an existing spec asserts a removed literal": 7 GAP-063/GAP-077 tests in `packages/vue/src/stepper/stepper.spec.ts` pinned the old hand-written Vue Stepper CSS text, which §6.4 replaces with upstream groups. The user decided:

- **The 7 tests are kept and retargeted to the G3-C1 contract, not deleted.** They stay GAP-063/GAP-077 regression coverage with the same intent. Their `rule()` helper becomes whitespace-insensitive. The ported values are asserted, including the `dt()` forms; `-18px` and `2rem` are unchanged values now token-driven. The removed `[data-u-hidden]` ordering check becomes a behaviour check that inactive vertical panels keep v-show's inline `display: none`, which no stylesheet rule overrides. The vertical header left alignment, formerly an `align-items: flex-start` literal, is asserted in the browser.
- **PX-C1 is two explicit contracts.** _Visual parity:_ disabled Steps items are not dimmed (`opacity: 1`). _Interaction parity:_ disabled Steps items stay non-interactive. Since upstream group 4 restores `pointer-events: auto`, clicks now reach the link, and only the existing click guard (`onItemClick`: readonly or `item.disabled` → `preventDefault`, no `select`/`onSelect`, no `command`) blocks them. A click on a disabled item must not change the active step (`aria-current`) or navigate. This is pinned by unit tests in both frameworks and a real-pointer browser check. No new JS behaviour.

Verified 2026-10-06 on Storybooks built from the ported CSS, in Chromium, Firefox and WebKit × ng/vue (6/6): the disabled link has `pointer-events: auto`, `opacity: 1`. A forced real click leaves `aria-current` on the active item and the URL unchanged. The vertical header's left edge equals its step's left edge plus padding (Δ = 0), with exactly one panel visible. Test-only amendment; no CSS, component, story, baseline or CI change.

## 18. Errata (2026-10-06, final review)

Append-only corrections found by the final whole-branch review. No decision text above is edited and no decision changes. No CSS, component, story, baseline or CI change.

**E1 — Angular size metric (§11, Plan Global Constraints "Size (C8)").** §11 names `index.mjs` gzip as authoritative. For Angular that file (`packages/ng/dist/fesm2022/ultimate-ng.mjs`) is the package barrel and excludes the component style modules, which ng-packagr emits as secondary entries; it is blind to G3-C1. The corrected authoritative Angular size metric is the sum of per-file gzip of all `packages/ng/dist/fesm2022/*.mjs`: **320743 B → 323162 B, +0.75%, within the 15% gate.** Vue is unchanged: `packages/vue/dist/index.mjs`, +1.24%. The five C1 entries individually (information; the gate is per package): Breadcrumb +10.3%, Dock +2.7%, Stepper +19.2%, Steps +18.1%, Tabs +13.4%. Status: **pending user acknowledgement at closeout.**

**E2 — Pre-port disabled-state facts (no decision changes).** Verified at `2c8ef45`: `data-u-disabled` is emitted only on the Breadcrumb link (`<a>`), the Stepper `u-step` and the Tab (`u-tab`). Dock and Steps items never carry it. Consequently the old Dock (`opacity: 0.5`) and Steps (`opacity: 0.6`, `pointer-events: none`) dimming rules never matched, Breadcrumb's rule (attribute on the link, selector on the item) never matched either, and Tabs and the Stepper (step header only) were dimmed at 0.6. Statements affected:

- §3.2 "(plus `data-u-disabled` attributes)": only Breadcrumb (link), Stepper (`u-step`) and Tabs (`u-tab`) emit it; Dock and Steps items do not.
- §6.1 PX-C1 "today `opacity: 0.6`": the old Steps rule never matched, so disabled Steps items were already undimmed.
- §6.1 / §15 SR-C1-4 and §14.4 "today 0.5": the old Dock rule never matched, so Dock disabled items were already undimmed; the `disabled.opacity` change from D3 is the first dimming they receive.
- §6.4 Dock `[data-u-disabled]` row: inert, like the Breadcrumb row.
- §17 "clicks now reach the link": clicks always reached the link, because the old `pointer-events: none` rule never matched; the click guard was always the only protection.

Consequence: the PX-C1 and SR-C1-4 decisions stand. The visible pre/post difference is: Breadcrumb and Dock disabled items are now dimmed; Steps disabled items were and remain undimmed.

**E3 — Angular Stepper separator groups have no runtime reach (fidelity-accounting correction; user-approved 2026-10-06).** Found by the cross-tranche selector-reach audit (`docs/architecture/research/2026-10-06-gap-064-cross-tranche-study.md` §2, finding F-1).

- **Fact.** Angular `UStep` and `UStepItem` render no separator element. `UStepperSeparator` is exported but never placed by the component, and `UStep`'s only projection slot sits inside the step title. In every Angular Stepper story, before and after activating step 2, `.u-stepper-separator` matches 0 elements.
- **Affected groups (§5.4).** 14 `.p-step:has(~ .p-step-active) .p-stepper-separator`, 15 `.p-stepper-separator`, 25 `.p-stepitem .p-stepper-separator`, 26 `.p-stepitem .p-stepper-separator:dir(rtl)` and 27 `.p-stepitem:has(~ .p-stepitem-active) .p-stepper-separator` are marked "✓" for Angular. They ship in the Angular CSS but have **no runtime reach**.
- **Corrected accounting.** Angular: **74 effective groups + 5 dead groups** of the 79 shipped (11 omitted, unchanged), instead of 79 effective. Vue is unchanged: **81 effective, 9 omitted** (the separators render, and group 14 was verified after activating step 2).
- **Classification.** A fidelity-accounting correction, not a runtime defect: the dead rules match nothing and change no behaviour.
- **Unchanged by E3.** The Angular CSS, `packages/themes/test/utils/g3c1-port.mjs`, the fidelity data and counts (the five groups stay in D1, because the fidelity test requires the data to equal the shipped CSS), `docs/architecture/provenance/ng.json` and the tests. Removing the five groups from the Angular CSS and moving them to D2 is a separate implementation decision.
- **Related, pre-existing and unchanged.** "Angular renders no Stepper separators" (§12) remains a pre-existing feature gap outside G3-C1.

**E3a — Reconciliation of the five Angular Stepper separator groups with ADR-052 X-1 (supersedes E3's "dead" classification; user-directed 2026-10-06).** The C2-0 final whole-branch review noted that `UStepperSeparator` is exported and can be placed by a consumer. Reviewed against the exported API and the rendered DOM:

- **Exported API.** `UStepperSeparator` (`packages/ng/src/stepper/stepper-separator.ts`) is exported from the public `@ultimate/ng/stepper` entry (`packages/ng/src/stepper/index.ts:7`; `package.json` export `./stepper`). It is standalone, its host binding emits the `u-stepper-separator` class (`"[class]": "cx('stepperSeparator')"`, `aria-hidden="true"`), and its own doc comment defines it as "a purely visual connector line rendered between consecutive `UStep`/`UStepPanel` entries". No Ultimate component places it, so consumer placement is the only way it renders.
- **Projection paths.** `UStepItem`, `UStepList` and `UStepPanel` project arbitrary content (`<ng-content>`). A consumer-placed `<u-stepper-separator>` inside `<u-step-item>` (directly, or inside its `<u-step-panel>`, which is where PrimeNG 21.1.9 renders the vertical separator) is a descendant of `.u-step-item`. `UStep`'s only projection slot is the title span inside its header `<button>`.
- **PrimeNG 21.1.9 reference.** `p-step` renders `<p-stepper-separator />` as a sibling after its header `<button>`, inside the step; `p-step-panel` renders it inside its content wrapper.
- **Rendered DOM.** No story or test renders a separator in Angular: 0 matches before and after activating step 2 (cross-tranche study §2.3). Consumer placement is therefore an unexercised state.

**Classification (ADR-052 X-1):**

| Group | Selector (Ultimate)                                            | Class                                                    | Condition / evidence                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | -------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15    | `.u-stepper-separator`                                         | **K**                                                    | Emitted by `UStepperSeparator`'s host binding whenever a consumer places `<u-stepper-separator>`; no story exercises it.                                                                                                                                                                                                                                                                                              |
| 25    | `.u-step-item .u-stepper-separator`                            | **K**                                                    | Consumer places `<u-stepper-separator>` inside `<u-step-item>` (directly or inside `<u-step-panel>`), via `UStepItem`/`UStepPanel` content projection.                                                                                                                                                                                                                                                                |
| 26    | `.u-step-item .u-stepper-separator:dir(rtl)`                   | **K**                                                    | As 25, in a right-to-left document.                                                                                                                                                                                                                                                                                                                                                                                   |
| 27    | `.u-step-item:has(~ .u-step-item-active) .u-stepper-separator` | **K**                                                    | As 25, in a step item that precedes the active step item.                                                                                                                                                                                                                                                                                                                                                             |
| 14    | `.u-step:has(~ .u-step-active) .u-stepper-separator`           | **X** (shipped, unreachable under supported composition) | A match needs the separator inside `.u-step`. `UStep`'s only projection slot is the title span inside the header `<button>`, so the separator would become part of the button's label content. That contradicts the separator's documented role (a connector _between_ entries) and PrimeNG's placement (a sibling after the header button, which `UStep`'s template cannot host). It is not a supported composition. |

- **Corrected Angular accounting:** 79 groups shipped = the **74** groups as previously classified + **4 K** (15, 25, 26, 27; condition: a consumer-placed `UStepperSeparator`) + **1 X-shipped** (14), with 11 omitted (unchanged). Vue is unchanged: 81 ported, 9 omitted.
- **Consequence for the deferred removal decision:** only group 14 is a removal candidate. Removing 15, 25, 26 or 27 would unstyle separators that consumers place.
- **Unchanged by E3a:** no CSS change, no `g3c1-port.mjs` or fidelity-data change, nothing moved to D2. The five groups stay in D1 because the shipped CSS still contains them.
