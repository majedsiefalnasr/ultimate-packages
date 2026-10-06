# Specification — GAP-064 G3-C2: Menus (TieredMenu, ContextMenu, Menubar, MegaMenu, PanelMenu) Use Their Aura Tokens

**Date:** 2026-10-06
**Branch:** `feature/gap-064-g3c2-menus` (from `main` `3d0203d`)
**Status:** **Approved** (user, 2026-10-06), **amended by A1 (PR-7, §18)**. Spec Review decisions OI-1..OI-4 are recorded in §16. Implementation needs an approved Plan.
**Governing records:**

- ADR-052 (normative: X-1, X-2, X-3, X-3b, X-4, X-6, X-12), ADR-051, D-G3-1..9.
- G3-C decisions C-1..C-11 (`docs/architecture/research/2026-10-05-gap-064-g3c-menus-navigation-research.md` §9).
- G3-C2 research addendum and rulings D-C2-1..9 (`docs/architecture/research/2026-10-06-gap-064-g3c2-research-addendum.md`, §13).

**Baseline (ADR-048):** `@primeuix/styles` 2.0.3, `@primeuix/themes` 2.0.3, PrimeNG 21.1.9, PrimeVue 4.5.5, `@primeuix/utils` 0.7.2.

## 1. Purpose and scope

G3-C2 is the second G3-C sub-tranche (C-9). Each of the five Angular and five Vue menu style modules gets the applicable `@primeuix/styles` 2.0.3 structural CSS, mapped onto the existing Ultimate DOM, so the menus take their Aura tokens.

In scope:

1. **Fidelity port:** 100 of 177 upstream rule groups per framework (D1), with 77 recorded omissions (D2). See §5.
2. **Style-key renames (ADR-051, C-11):** 11 sites (§3.1).
3. **Runtime-role CSS (ADR-052 X-4, C-4):** roles 1, 2, 3 and 4 (§6.2). Role 1b is excluded under X-1 (§18 A1). No new JavaScript or runtime state.
4. **Pre-existing defect corrections, kept separate from the fidelity port (§7):** F-3a (PanelMenu renders nothing) and F-3b (Angular TieredMenu/Menubar submenus never show).
5. **Verification:** verification-only stories (D-C2-6), screenshots, layout and computed-style checks, the X-1 reach test, a G3-C2 differential accessibility validator, and the retry-aware evidence rule (§9).
6. **Provenance, `MIGRATION.md` and the size gate.**

Out of scope: see §13.

## 2. Decisions this specification implements

| Decision                                 | Applied as                                                                                                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ADR-052 X-1                              | Every emitted selector part is R, K or X per framework (§5, §9.4). The reach test runs inside the G3-C2 verification specs.                                                                                                    |
| ADR-052 X-2                              | No DOM, template, class or runtime change. Only CSS, stories, tests and documentation change.                                                                                                                                  |
| ADR-052 X-3 / D-C2-2                     | State is selected through emitted state classes (`.u-<key>-item-open`, `.u-<key>-item-disabled`, `.u-panelmenu-item-expanded`, `.u-contextmenu-item-focused`). No attribute selector is used where an equivalent class exists. |
| ADR-052 X-3b                             | Disabled appearance (D3) and interaction protection (existing JavaScript guards) are verified separately (§9.3).                                                                                                               |
| ADR-052 X-4 / C-4                        | Runtime roles 1–5 (§6.2). The overflow flip and popup anchoring are excluded (PX-M1, PX-M2).                                                                                                                                   |
| ADR-052 X-6                              | Open states are captured through real triggers with pointer parking and readiness checks (§9.2).                                                                                                                               |
| ADR-052 X-12                             | CI evidence set and changed-file provenance completeness (§10, §11).                                                                                                                                                           |
| C-1, C-2, C-5, C-6, C-7, C-8, C-10, C-11 | §4, §5, §6.                                                                                                                                                                                                                    |
| D-C2-1..9                                | Counts (§5), visibility via state classes (§6.2), `inset-inline-start` (PX-M1), popup K (§5.1), Menubar focus X (§5.3), verification stories (§9.1), candidates (§6.3), tooling (§12), MegaMenu separator X (§5.4).            |

## 3. Existing behaviour (verified at `3d0203d`; research addendum §2–§4)

### 3.1 Registration and renames

| Key         | Angular                                                                        | Vue                                                        |
| ----------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| tieredmenu  | `tiered-menu.ts:43`, `tiered-menu-sub.ts:92`: `tiered-menu` → **`tieredmenu`** | `BaseTieredMenu.ts:22`: `tiered-menu` → **`tieredmenu`**   |
| contextmenu | `context-menu.ts:108`: `context-menu` → **`contextmenu`**                      | `BaseContextMenu.ts:9`: `context-menu` → **`contextmenu`** |
| menubar     | `menubar.ts:39`, `menubar-sub.ts:95`: `menubar` (no change)                    | `BaseMenubar.ts:17`: `menubar` (no change)                 |
| megamenu    | `mega-menu.ts:113`, `mega-menu-column.ts:66`: `mega-menu` → **`megamenu`**     | `BaseMegaMenu.ts:18`: `mega-menu` → **`megamenu`**         |
| panelmenu   | `panel-menu.ts:52`, `panel-menu-list.ts:122`: `panel-menu` → **`panelmenu`**   | `BasePanelMenu.ts:18`: `panel-menu` → **`panelmenu`**      |

### 3.2 DOM facts the mapping relies on

- **Class vocabulary:** research addendum §2. MegaMenu emits no separator. PanelMenu never emits `u-panelmenu-panel`.
- **State classes**, each emitted only in its state, in both frameworks: `u-<key>-item-open`, `u-<key>-item-disabled`, `u-panelmenu-item-expanded`, and `u-contextmenu-item-focused` (on mouseenter or focus).
  - **Angular Menubar never emits `u-focus`** (research addendum RC-1).
- **Angular hosts** sit between an item and its submenu: `u-tiered-menu-sub`, `u-menubar-sub`, `u-panel-menu-list`. Vue renders the submenu as a direct child.
- **PanelMenu tree:** `.u-panelmenu > [ng: u-panel-menu-list >] ul.u-panelmenu-submenu > li.u-panelmenu-item > (div.u-panelmenu-header-content > a.u-panelmenu-header-link, [ng: u-panel-menu-list >] ul.u-panelmenu-submenu …)`. The header classes are used at every level. The submenu icon is a static `▸` glyph.
- **Triggers:** TieredMenu, Menubar and MegaMenu open on hover and toggle on click; ContextMenu opens on right-click (C2-0 positioning after render); PanelMenu toggles on header click.

### 3.3 Coverage today

There are no G3 screenshot, layout or accessibility checks for these five keys. The only ContextMenu browser spec is C2-0's `packages/ng/e2e/context-menu.spec.ts`, which is a mandatory regression check (§9.5).

## 4. Selector mapping

- **Generic:** `.p-<key>-…` → `.u-<key>-…`.
- **C-1 state mapping (D-C2-2):**

  | Upstream                      | Ultimate                      |
  | ----------------------------- | ----------------------------- |
  | `.p-<key>-item-active`        | `.u-<key>-item-open`          |
  | `.p-disabled`                 | `.u-<key>-item-disabled`      |
  | `.p-focus` (ContextMenu only) | `.u-contextmenu-item-focused` |

  Every other `p-focus` group is X.

- **C-2:** ContextMenu group 2 keeps only `.u-contextmenu-root-list` (the `submenu` part is pruned). PanelMenu group 8 is mapped part by part.
- **C-5:** `.p-megamenu-horizontal` → `.u-megamenu`.
- **C-6 PanelMenu** (identical text in both frameworks except child-list selectors):
  - `TOP` = `.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item)`;
  - `NEST` = `.u-panelmenu-item .u-panelmenu-item`.

  | Upstream                                                                   | Ultimate                                                                                                                                        |
  | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
  | `.p-panelmenu-panel`                                                       | `TOP`                                                                                                                                           |
  | `.p-panelmenu-panel:first-child` / `:last-child`                           | `TOP:first-child` / `TOP:last-child`                                                                                                            |
  | `.p-panelmenu-header`, `.p-panelmenu-header-content`                       | `TOP > .u-panelmenu-header-content`                                                                                                             |
  | `.p-panelmenu-header-link`                                                 | `TOP > .u-panelmenu-header-content > .u-panelmenu-header-link`                                                                                  |
  | `.p-panelmenu-header-icon`                                                 | `TOP > .u-panelmenu-header-content .u-panelmenu-header-icon`                                                                                    |
  | `.p-panelmenu-item-icon`                                                   | `NEST > .u-panelmenu-header-content .u-panelmenu-header-icon`                                                                                   |
  | `.p-panelmenu-item-content` / `-item-link` / `-item-label`                 | `NEST > .u-panelmenu-header-content` / `… > .u-panelmenu-header-link` / `… .u-panelmenu-header-label`                                           |
  | `.p-panelmenu-submenu`                                                     | `.u-panelmenu-item .u-panelmenu-submenu` (never the root list)                                                                                  |
  | `.p-panelmenu-content-container`, `.p-panelmenu-content-wrapper`           | Vue `TOP > .u-panelmenu-submenu`; Angular `TOP > u-panel-menu-list > .u-panelmenu-submenu`                                                      |
  | `.p-panelmenu-header:not(.p-disabled):focus-visible …`                     | `TOP:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:has(.u-panelmenu-header-link:focus-visible) …`, **subject to gate G-2** (§8) |
  | `.p-panelmenu-header:not(.p-disabled) .p-panelmenu-header-content:hover …` | `TOP:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover …`                                                                     |

- **ADR-052 X-4 role 5 (Angular):** an item-to-submenu child combinator includes the host, for example Menubar group 25 → `.u-menubar-submenu > .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu`.

## 5. Upstream rule-group inventory (exact; both frameworks unless noted)

Ported groups (R or K) form D1, in upstream order. Omitted groups (X) form D2 with an FX tag.

**FX tags:**

| Tag   | Excluded feature                                          |
| ----- | --------------------------------------------------------- |
| FX-M1 | mobile mode                                               |
| FX-M2 | focus class not emitted                                   |
| FX-M3 | ContextMenu nested submenus and active state not rendered |
| FX-M4 | start/end slots and mobile button                         |
| FX-M5 | MegaMenu vertical orientation                             |
| FX-M6 | MegaMenu `col-N` columns                                  |
| FX-M7 | MegaMenu separator not rendered                           |

### 5.1 tieredmenu — 25 groups: ported 18 / omitted 7

- **D1:** 1–10, 14–21.
  - R: 1–7, 9, 10, 14, 16, 17, 19.
  - K: 8, 15, 18 (item icon; becomes R through `ItemStates`); 20 (separator; becomes R through `ItemStates`); **21 (`.u-tieredmenu-overlay`), K with computed-style evidence only (D-C2-4).**
- **D2:** 11–13 (FX-M2); 22–25 (FX-M1).

### 5.2 contextmenu — 23 groups: ported 12 / omitted 11

- **D1:** 1, 2 (root-list part only, C-2), 4–8, 11, 12, 14, 15, 20.
- **D2:** 3, 9, 10, 13, 16, 17, 18, 19 (FX-M3); 21–23 (FX-M1).

### 5.3 menubar — 44 groups: ported 21 / omitted 23

- **D1:** 1, 3–12, 16–25. Group 25 uses the Angular host form.
- **D2:** 2 (FX-M4; the upstream `.p-menubar-start, .p-megamenu-end` typo, C-11); 13–15 (FX-M2, **both frameworks**, D-C2-5); 26–30 (FX-M4); 31–44 (FX-M1).

### 5.4 megamenu — 56 groups: ported 23 / omitted 33

- **D1:** 1, 3–10, 14–24, 26, 27, 36.
- **D2:**
  - 2, 28, 29, 43–45 (FX-M4);
  - 11–13 (FX-M2);
  - 25 (FX-M7, D-C2-9);
  - 30–35 (FX-M5);
  - 37–42 (FX-M6);
  - 46–56 (FX-M1).

### 5.5 panelmenu — 29 groups: ported 26 / omitted 3

- **D1:** 1–21, 25–29, with the §4 C-6 mapping.
- **D2:** 22–24 (FX-M2).

### 5.6 Totals

| Key         | Upstream | Ported (D1) | Omitted (D2) |
| ----------- | -------- | ----------- | ------------ |
| tieredmenu  | 25       | 18          | 7            |
| contextmenu | 23       | 12          | 11           |
| menubar     | 44       | 21          | 23           |
| megamenu    | 56       | 23          | 33           |
| panelmenu   | 29       | 26          | 3            |
| **Total**   | **177**  | **100**     | **77**       |

## 6. Additions, runtime roles and candidates

### 6.1 D3 — base-role disabled rules (C-7)

Upstream puts `p-disabled` on the item and relies on `@primeuix/styles/base`: `.p-disabled, .p-disabled * { cursor: default; pointer-events: none; user-select: none }` and `.p-disabled { opacity: dt('disabled.opacity') }`.

For each key, both frameworks, first in the module, the declarations equal the base groups exactly:

```css
.u-<key > -item-disabled,
.u-<key > -item-disabled * {
  cursor: default;
  pointer-events: none;
  user-select: none;
}
.u-<key > -item-disabled {
  opacity: dt("disabled.opacity");
}
```

This applies to `<key>` ∈ {tieredmenu, contextmenu, menubar, megamenu, panelmenu}. The rules replace the current `[data-u-disabled="true"] … { opacity: 0.6; pointer-events: none }` rules. Interaction protection stays with the existing JavaScript guards (X-3b, §9.3).

### 6.2 D4 — runtime-role CSS (ADR-052 X-4, C-4; exact text)

Upstream applies role 1 as **inline styles**, which beat every stylesheet rule. Its CSS form is therefore placed **after D1**, with specificity at least that of the D1 rule it must override. §8 gives the order.

Role 1b (PanelMenu collapsed-list visibility) is **excluded under ADR-052 X-1** (§18, Amendment A1, PR-7).

| Role                                 | Rule (Vue form; the Angular form inserts the host shown in brackets)                                                | Overrides / reason                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 TieredMenu visibility              | `.u-tieredmenu-item:not(.u-tieredmenu-item-open) > [u-tiered-menu-sub >] .u-tieredmenu-submenu { display: none; }`  | Group 2 (`display: flex`, 0,1,0). An open submenu keeps group 2's `display: flex; flex-direction: column`.                                                   |
| 1 Menubar visibility                 | `.u-menubar .u-menubar-item-open > [u-menubar-sub >] .u-menubar-submenu { display: flex; flex-direction: column; }` | Group 22 (`display: none`) and group 25 (`display: block`, 0,3,0). Equal or higher specificity plus later order reproduce upstream's inline `display: flex`. |
| 2 TieredMenu popup initial placement | `.u-tieredmenu-overlay { position: absolute; top: -9999px; left: -9999px; }`                                        | C-4 role 2. Anchoring and `minWidth` are excluded (PX-M2).                                                                                                   |
| 3 ContextMenu root                   | `.u-contextmenu { position: absolute; }`                                                                            | PrimeNG `inlineStyles.root`. JavaScript positioning comes from C2-0 and is unchanged.                                                                        |
| 4 TieredMenu nested placement        | `.u-tieredmenu-submenu { inset-inline-start: 100%; top: 0; }`                                                       | `nestedPosition()` default result (D-C2-3). The overflow flip is excluded (PX-M1).                                                                           |

**PX list (recorded parity exceptions):**

| ID    | Exception                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PX-M1 | TieredMenu nested submenus do not flip at the viewport edge. Upstream `nestedPosition()` flips in JavaScript; no JavaScript is introduced.                                                        |
| PX-M2 | The TieredMenu popup is not anchored to its trigger and gets no `minWidth`. Upstream uses `absolutePosition` and `getOuterWidth`. Pre-existing defect, separate Angular + Vue decision.           |
| PX-M3 | The PanelMenu header focus ring is keyed on the focused link (`:has(:focus-visible)`), because upstream focuses the header element and Ultimate focuses the link. Final text subject to gate G-2. |
| PX-M4 | PanelMenu expand/collapse is not animated (upstream `p-collapsible` transition).                                                                                                                  |
| PX-M5 | MegaMenu root list has no `max-height`/scrolling (upstream `scrollHeight` input; not present in Ultimate).                                                                                        |

### 6.3 D5 — Ultimate-only candidates (C-8; D-C2-7)

None is approved as retained until its gate evidence (§8) shows both conditions:

- (i) no upstream role covers it;
- (ii) removing it causes a visible or behavioural regression.

| ID                               | Candidate (current text)                                                                                                                                                                                                                               | Gate                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-M1                             | `.u-megamenu-column { display: flex; flex-direction: column; }`                                                                                                                                                                                        | C-5 approved keeping the column layout; Spec-time evidence still recorded (G-3).                                                                                                                                                                                                                                                                                                                                              |
| R-M2                             | Menubar first-level submenu `top: 100%; left: 0`                                                                                                                                                                                                       | G-1: measure upstream static position vs this rule in three engines.                                                                                                                                                                                                                                                                                                                                                          |
| R-M3                             | `.u-tieredmenu { display: inline-block; }`                                                                                                                                                                                                             | G-3: upstream group 1 sets no `display`; evidence of regression without it.                                                                                                                                                                                                                                                                                                                                                   |
| **R-M4** (candidate, OI-1 = (a)) | `.u-panelmenu-submenu-icon { transition: transform 0.2s; }` and `.u-panelmenu-item-expanded > .u-panelmenu-header-content .u-panelmenu-submenu-icon { transform: rotate(90deg); }` (current text is attribute-based; re-keyed to the class per D-C2-2) | Retention of Ultimate's existing mechanism under X-4: the static `▸` glyph plus CSS rotation. Upstream swaps icon components at runtime. No runtime icon swap, DOM, API or state change is introduced. G-3 must establish both (1) no upstream CSS/runtime role already covers this behaviour in Ultimate's existing DOM, and (2) removing R-M4 loses the visible expanded-state indicator. If either fails, R-M4 is dropped. |

### 6.4 Current Ultimate rules dropped (with reason)

| Current rule                                                                                    | Reason                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[data-u-disabled="true"] .<key>-item-link { cursor; pointer-events; opacity: 0.6 }` (all five) | Replaced by D3 (`disabled.opacity` 0.6 on the item).                                                                                                                      |
| `[data-u-open="true"] > .<key>-submenu/-overlay { display: block }`                             | Replaced by D4 role 1 (class-based, host-aware) and MegaMenu group 22.                                                                                                    |
| `.u-<key>-submenu { …; display: none; min-width: 12rem; … }` literals                           | Replaced by D1 groups and D4.                                                                                                                                             |
| `.u-panelmenu-submenu { padding-left: 1.25rem; display: none }`                                 | Replaced by group 17 (`panelmenu.submenu.indent`); removing it corrects F-3a (§7, §18 A1).                                                                                |
| `.u-panelmenu-panel + .u-panelmenu-panel { margin-top: 2px }`                                   | Dead: `u-panelmenu-panel` is never emitted (RC-3).                                                                                                                        |
| `.u-contextmenu { top: 0; left: 0 }`                                                            | **Dropped** (OI-2). C2-0 positions the menu after render and before paint, and the upstream runtime role needs only `position: absolute` (D4 role 3). Not a D5 candidate. |
| Layout literals (`display: flex; align-items: center; gap: 0.5rem`, …)                          | Replaced by the corresponding D1 groups.                                                                                                                                  |

## 7. Pre-existing defect corrections (separate from the fidelity port)

| ID   | Defect (verified)                                                                                                                            | Correction                                                                                                                                                                                                                  | Evidence required                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| F-3a | PanelMenu renders nothing in either framework: the root list `ul.u-panelmenu-submenu` is hidden by `.u-panelmenu-submenu { display: none }`. | The port removes the old `.u-panelmenu-submenu { display: none }` rule (§6.4), so the root list renders. Nested lists are rendered only while their item is expanded (both frameworks), so no hide rule is needed (§18 A1). | Before: `.u-panelmenu` 0 px tall. After: top-level items visible (non-zero box) in both frameworks.     |
| F-3b | Angular TieredMenu/Menubar submenus never become visible: the host between `li` and `ul` defeats `item[data-u-open="true"] > submenu`.       | D4 role 1 host-aware selectors (ADR-052 X-4 role 5).                                                                                                                                                                        | Before: Angular open submenu `display: none`, 0×0. After: `display: flex`, non-zero box, three engines. |

These are reported as defect corrections in `MIGRATION.md` and the closeout, not as parity changes.

## 8. Module order and Spec-time gates

**Canonical order in each style module:** **D3 → D1 (upstream order) → D4 → D5.**

- D4 follows D1 so its inline-style emulation wins by order at equal specificity (§6.2). This order is specific to G3-C2's D4 runtime-role CSS (OI-3) and is not a cross-tranche rule.
- D5 comes last.
- No D4 or D5 rule redeclares a D1 property on the same selector, except where §6.2 states the override as intended.
- D2 is never emitted.

**Gates (each is run and recorded in the Plan's first verification task, before the dependent rule text is final):**

- **G-1 — Menubar first-level submenu placement.** In Chromium, Firefox and WebKit, in both frameworks, measure the open first-level submenu box with the ported D1 only (upstream static position) and with R-M2 added.
  - If they match within 1 px, R-M2 is dropped.
  - Otherwise R-M2 is retained, with the measurement as its evidence.
- **G-2 — PanelMenu focus ring.** With the ported CSS injected, Tab to a top-level header link in all three engines. The header-content must show the `panelmenu.item.focus.background` / focus treatment. A disabled header must show no focus treatment. The PX-M3 text is finalized from the result.
- **G-3 — R-M1, R-M3, R-M4.** For each candidate, with it removed versus present, record the computed difference.
  - A candidate with no visible or behavioural difference is dropped.
  - For R-M4, also record that no ported upstream group already produces an expanded-state indicator on Ultimate's static glyph. If one does, or if removing R-M4 loses nothing, R-M4 is dropped.

## 9. Verification

### 9.1 Verification-only stories (D-C2-6)

One `ItemStates` story per component per framework, ten in total. Each combines:

- a **disabled** item (X-3b, mandatory);
- items with **icons**;
- a **separator** (except MegaMenu, which renders none);
- for TieredMenu, Menubar and PanelMenu, **two nested levels**;
- for PanelMenu, a disabled top-level item and a disabled nested item, plus icons at both levels.

The stories add no component, input or runtime change. They are verification-only, as in C1. Existing stories are unchanged.

### 9.2 Screenshot matrix (X-6)

- **At rest:** each component's Default and `ItemStates`, plus Menubar WithDisabledItem (Angular) and PanelMenu Multiple.
  - TieredMenu Popup and the ContextMenu stories have no visible menu at rest, so they get no rest screenshot.
- **Open states** (real trigger, pointer parked at (0,0) first, state class present, computed `display` not `none`, non-zero box, motion settle):
  - TieredMenu `ItemStates` hover-open at the first and second levels;
  - Menubar `ItemStates` hover-open at the first and second levels;
  - MegaMenu `ItemStates` hover-open;
  - ContextMenu Global right-click at fixed coordinates, and ContextMenu `ItemStates` right-click;
  - PanelMenu `ItemStates` with all levels expanded by header clicks.
- **Baselines:** one per engine × framework, Linux Docker (`mcr.microsoft.com/playwright:v1.63.0-jammy`). Before baselines are recorded before any CSS change; the review gate comes before any baseline update. Before screenshots of PanelMenu (blank) and of Angular TieredMenu/Menubar open states (no submenu) are evidence of F-3a/F-3b.

### 9.3 Layout and computed-style checks (Chromium, Firefox, WebKit; both frameworks)

- **TieredMenu:**
  - a closed submenu is `display: none`; an open one is `display: flex; flex-direction: column`;
  - a nested submenu's inline-start edge equals its parent item's inline-end edge (`inset-inline-start: 100%`);
  - an open item's content background equals `tieredmenu.item.active.background`;
  - group 21: with `popup` set and the popup shown programmatically, the overlay is `position: absolute`, `top: -9999px`, and `box-shadow` equals the resolved `tieredmenu.shadow` (computed style only).
- **ContextMenu:**
  - opens at the pointer (the C2-0 spec stays green);
  - a hovered item gets `contextmenu.item.focus.background`;
  - the separator border equals `contextmenu.separator.border.color`.
- **Menubar:**
  - the first-level open submenu is `display: flex` and placed per gate G-1;
  - the second-level open submenu is `display: flex`, `left: 100%`, `top: 0`;
  - **Angular open submenu has a non-zero box (F-3b).**
- **MegaMenu:** overlay hidden when closed and `display: block` when open; grid/column layout per G-3.
- **PanelMenu:**
  - `.u-panelmenu` has a non-zero box (F-3a);
  - the root list renders (the component has a non-zero box);
  - expanding an item renders its nested list, which is visible and, at the top level, `display: grid` (group 28);
  - collapsing that item again removes the nested list from the rendered DOM. No assertion expects a CSS `display: none` on an already-rendered collapsed list (§18 A1);
  - the nested indent equals `panelmenu.submenu.indent`;
  - focus ring per gate G-2.
- **All five (X-3b):**
  - the disabled item has `opacity` equal to the resolved `disabled.opacity` and `pointer-events: none`;
  - **separately**, a real pointer click and keyboard activation on the disabled item emit no selection or command (JavaScript guards), in all three engines.

### 9.4 Selector reach test (ADR-052 X-1)

For each framework, the data module declares every emitted selector part as R (story and state), K (cited source and condition) or X (D2 FX tag). The test asserts:

- R ∪ K equals the emitted selectors;
- every R part matches at least one element in its declared story and state, with state pseudo-classes removed and combinators evaluated against the rendered DOM including Angular hosts;
- K parts cite their emitter.

Group 21's selector stays K.

### 9.5 Acceptance criteria

1. **AC1 — Keys:** each component registers one structural element and one `<key>-variables` element under its Aura key (§3.1).
2. **AC2 — Tokens:** in every verified state, each `var(--u-…)` in the structural CSS is defined, except exactly `menubar.submenu.color` (a two-way exception list, D-G3-5). Each module contains at least one `var(--u-<key>-`.
3. **AC3 — Fidelity:** static exactness of D1–D6 per §5 and §6, in the §8 order. D2 is never emitted. The data is never edited to make a check pass.
4. **AC4 — Reach:** §9.4 passes in both frameworks.
5. **AC5 — No DOM/runtime change:** in component files only the `css` block, the registered key and one doc-comment line change. Templates, `classes` resolvers, inputs, outputs and emits are unchanged. No new JavaScript.
6. **AC6 — Screenshots:** §9.2, with the review gate before any baseline change.
7. **AC7 — Layout/computed:** §9.3, including F-3a/F-3b and X-3b.
8. **AC8 — Accessibility:** a new tranche-scoped G3-C2 differential validator (stories tagged `G3-C2`, one scan per story; completeness × 3 engines). It FAILs on violations that are neither in `ACCESSIBILITY_BASELINE.md` nor in a G3-C2 pre-existing evidence file. Introduced rows go to the review gate. The G3-A, G3-B and G3-C1 tooling stays byte-identical.
9. **AC9 — Size:** C1 E1 method (Angular `fesm2022` per-file gzip sum; Vue `dist/index.mjs`) against the G3-C2 branch point. Growth above 15% in either package is a hard stop.
10. **AC10 — Regression:**
    - unit suites, typecheck and Angular SSR pass;
    - every screenshot outside §9.2 is unchanged;
    - the G3-A, G3-B and G3-C1 visual and accessibility contracts still pass;
    - `packages/ng/e2e/context-menu.spec.ts` (C2-0) and `packages/vue/e2e/stepper.spec.ts` pass unchanged.
11. **AC11 — Provenance:**
    - one `reference-derived` entry per changed style file (10);
    - an entry for every other changed source file (stories, specs), per ADR-052 X-12 changed-file completeness;
    - `provenance:validate` is not evidence.
12. **AC12 — Retry-aware browser evidence:** every G3-C2 browser result is reported as `passed_first_attempt`, `passed_after_retry` or `failed`. Local and Docker evidence runs use `--retries=0`. CI results are classified from the Playwright report (`flaky` = `passed_after_retry`). A test that only passes after a retry is reported as such and never presented as a stable first-attempt pass. The repository-wide retry policy is unchanged.

## 10. CI evidence (ADR-052 X-12)

- CI's strict scan selection becomes `--grep-invert "G3-A|G3-B|G3-C1|G3-C2"`.
- Three G3-C2 steps are added, mirroring C1: verification specs, differential accessibility validation, report upload.
- On the merge commit, these must be green by status:
  - Build, Typecheck and Coverage measurement;
  - the strict Playwright projects and the accessibility baseline validation;
  - the G3-C2 steps (ng, vue);
  - the earlier tranches' steps, except the named vue G3-B (U2) failure.
- AC12 applies to every CI browser result cited.

## 11. Documentation

`MIGRATION.md` §8 records, with the wording approved at Plan Review:

- the menus now use their Aura tokens;
- the style-key renames;
- F-3a (PanelMenu now renders) and F-3b (Angular TieredMenu/Menubar submenus now open visibly) as defect corrections;
- disabled dimming via `disabled.opacity`;
- the nested TieredMenu placement is now RTL-aware;
- PX-M1..PX-M5.

## 12. Tooling (D-C2-8)

New, tranche-scoped files, with names fixed in the Plan:

- a G3-C2 upstream fixture (5 keys + `base`, generated from the pinned tarball, no hand edits);
- a port/data module (D1–D6, mapping, R/K/X declarations), importing `parseGroups` and `norm` from the frozen `g3a-port.mjs` without modifying it;
- a fidelity test;
- a reach test;
- a differential accessibility validator and its self-test.

`g3a-port.mjs`, `g3b-port.mjs`, `g3c1-port.mjs` and the G3-A/B/C1 validators stay byte-identical. No repository-wide tooling remediation.

## 13. Out of scope

- TieredMenu popup anchoring and positioning (PX-M2; separate decision); scroll-aware ContextMenu placement.
- Any DOM, template, runtime or public API change.
- G3-D and G3-E; React; Ripple.
- Feature exclusions: ContextMenu nested submenus, MegaMenu vertical/start/end/mobile/`col-N`/separator, menu mobile modes.
- U1, U2, Vue BlockUI, the Axe race, E3a group 14 removal.
- Repository-wide CI, provenance, lint and format debt.
- Changing the repository-wide Playwright retry policy.

## 14. Stop conditions

Stop and report, with no workaround, if:

- a ported group cannot reach the rendered DOM without a DOM, class or runtime change;
- an unresolved token other than `menubar.submenu.color` appears;
- a count, mapping or order differs from this Spec;
- an unexpected visual change or an introduced accessibility violation appears;
- size grows above 15%;
- the C2-0 ContextMenu spec or the Vue stepper spec fails;
- making a check pass would require editing fidelity data, exceptions, evidence or tests;
- G3-A/B/C1 tooling would change;
- a gate result (G-1..G-3) contradicts this Spec's rule text in a way that needs a decision.

## 15. Open items for Spec Review

- **OI-1 — R-M4, PanelMenu submenu-icon rotation (new candidate).** Ultimate's only expanded-state indicator is the existing static `▸` glyph rotated by CSS. Upstream swaps icon components at runtime. Options:
  - (a) accept R-M4 as a fourth candidate under gate G-3, as the existing mechanism under X-4 (recommended);
  - (b) drop it and accept the loss of the expanded indicator;
  - (c) treat the icon swap as runtime work needing separate authorization.
- **OI-2 — `.u-contextmenu { top: 0; left: 0 }`.** Drop it (recommended; C2-0 positions before paint, and upstream sets only `position: absolute`), or keep it as a D5 candidate under G-3.
- **OI-3 — D4 position in the order.** This Spec places D4 between D1 and D5 (§8) to emulate upstream inline-style precedence. C1 had no D4. Confirm.
- **OI-4 — One combined `ItemStates` story per component**, rather than separate disabled, icon and separator stories. Fewer stories and screenshots, the same coverage. Confirm.

## 16. Spec Review decisions (2026-10-06, user)

The Spec is approved with these rulings:

1. **OI-1 = (a): R-M4 approved as the fourth Ultimate-only candidate under G-3.**
   - Ultimate's existing static `▸` glyph and CSS rotation are kept as the candidate retained mechanism (X-4).
   - No runtime icon swap, DOM, component API or runtime-state change.
   - G-3 must establish (1) that no upstream CSS/runtime role already covers the behaviour in Ultimate's existing DOM, and (2) that removing R-M4 visibly loses the expanded-state indicator. If either fails, R-M4 is dropped.
   - This is retention of an existing mechanism, not authorization for new runtime work.
2. **OI-2: drop `.u-contextmenu { top: 0; left: 0 }`.** Not a D5 candidate. Only `.u-contextmenu { position: absolute; }` (D4 role 3) remains.
3. **OI-3: canonical module order D3 → D1 → D4 → D5 confirmed.** D4 follows D1 because it represents upstream runtime-role/inline-style behaviour and overrides the corresponding D1 declarations where specified. D5 stays last. No cross-tranche rule is derived from this.
4. **OI-4: one combined `ItemStates` story per component per framework (10 stories)**, combining disabled items, icons, separators (not MegaMenu) and the applicable nested states. PanelMenu includes top-level and nested disabled and icon coverage. Verification-only, with no component or runtime change.

Unchanged boundaries: no DOM, template, runtime or public API changes; no TieredMenu popup anchoring; no nested-menu overflow flipping; no G3-D/G3-E; no React or Ripple; no repository-wide CI, provenance, lint or format remediation; no change to the repository-wide Playwright retry policy. AC12 stays mandatory.

## 18. Amendment A1 — PR-7: PanelMenu role 1b excluded under ADR-052 X-1 (user-approved 2026-10-06)

Found by the Plan self-review; a Spec and accounting correction only.

**Evidence (both frameworks, line by line):**

- Angular `packages/ng/src/panel-menu/panel-menu-list.ts:105`: `@if (hasItems(item) && isExpanded(item)) { <u-panel-menu-list …> }`.
- Vue `packages/vue/src/panel-menu/PanelMenuList.vue:26–27`: `<UPanelMenuList v-if="hasItems(item) && isExpanded(item, i)" …>`.
- At rest, only top-level items render (research addendum §3).

**Decision.** D4 role 1b (`.u-panelmenu .u-panelmenu-item:not(.u-panelmenu-item-expanded) > [u-panel-menu-list >] .u-panelmenu-submenu { display: none; }`) is removed from both frameworks and recorded as an explicit upstream exclusion under X-1:

> PanelMenu nested list is conditionally rendered only while its parent item is expanded; the collapsed-list state has no rendered DOM target in Ultimate, so the upstream collapsed-list visibility rule is unreachable and is excluded rather than ported.

- **No DOM or template change** to make the upstream behaviour reachable, and no replacement CSS mechanism.
- **F-3a stays corrected.** The port removes the old `.u-panelmenu-submenu { display: none }` rule, so the root list renders.
- **Accounting.** Role 1b is a runtime role (upstream `v-show`), not one of the 177 upstream rule groups, so D1/D2 stay **100 ported / 77 omitted** per framework. The PanelMenu D4 set goes from 1 rule to **0**. The other D4 rules (TieredMenu 3, ContextMenu 1, Menubar 1) are unchanged. PX-M4 (no collapsible transition) still applies. The fidelity data loses the PanelMenu D4 entry.
- **Verification (§9.3, updated in place):**
  - the PanelMenu root list renders;
  - expanding an item renders its nested list (visible; `display: grid` at the top level);
  - collapsing the item removes the nested list from the DOM;
  - no `display: none` assertion on a rendered collapsed list.

## 17. Gate results (Plan Task 7, 2026-10-06)

Run on the ported CSS (commits a0ab161, af4dd8a), Chromium/Firefox/WebKit × Angular/Vue, local Storybooks. Raw data: `.superpowers/sdd/2026-10-06-gap-064-g3c2-menus/gates.json`.

- **G-1 (R-M2):** dropped — user decision 2026-10-06: Spec §6.3 (ii) overrides the Plan's mechanical G-1 rule; with R-M2 the first-level submenu box is `[0,720,210,79]` (viewport bottom: no positioned ancestor, so `top: 100%` resolves against the viewport); without it `[29,57,210,79]`, the upstream static position, in all 6 combinations.
- **G-2 (PX-M3):** passed — header-content background equals `panelmenu.item.focus.background` on Tab in all 6 combinations; disabled headers are not focusable. PX-M3 text unchanged (gate read after a 600 ms wait for the 0.2 s background transition; user decision 2026-10-06 after a first run read mid-transition in Chromium/WebKit).
- **G-3:** R-M1 kept (kept per C-5; the evidence is a computed `display` difference only (flex vs block), with no box change, so condition (ii) is weak (user decision 2026-10-06)); R-M3 kept (`.u-tieredmenu` computes `inline-block` at 202×113 with it and `block` at 1248×113 without it, in all 6 combinations); R-M4 kept (the glyph computes `transform: matrix(0, 1, -1, 0, 0, 0)` with it and `transform: none` without it, in all 6 combinations, so no ported group already rotates the glyph).
- **Final D5:** R-M1, R-M3, R-M4. `KEPT` in `g3c2-port.mjs` equals this list.

## 19. Amendment A2 — Task 10 review decisions and R-M5 (user-approved 2026-10-06)

Found by the Task 10 visual review (`docs/superpowers/plans/2026-10-06-gap-064-g3c2-visual-review.md`).

**U-1 and U-2 (port regressions, PanelMenu, both frameworks).** Ultimate renders the PanelMenu top-level list as `ul.u-panelmenu-submenu` (`role="tree"`) directly under the root, where upstream places its panels directly in `.p-panelmenu`.

- U-1: the ported group 29 (`.u-panelmenu-item .u-panelmenu-submenu { …; list-style: none }`) resets nested lists only. The top-level list keeps the browser list styling (disc bullets, 40 px indent, 16 px top margin). The pre-port rule `.u-panelmenu-submenu { margin: 0; padding-left: …; list-style: none }` covered it.
- U-2: the panels are `li` children of that list, so the ported `.u-panelmenu { display: flex; flex-direction: column; gap: dt('panelmenu.gap') }` never spaces them, and their borders touch.

**Decision: add D5 candidate R-M5**, an Ultimate-only, CSS-only root-list layout rule. It restores the upstream root flex/column layout and gap on the existing DOM with the existing `panelmenu.gap` token:

| Framework | R-M5                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | `.u-panelmenu > u-panel-menu-list > .u-panelmenu-submenu { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: dt('panelmenu.gap'); }` |
| Vue       | `.u-panelmenu > .u-panelmenu-submenu { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: dt('panelmenu.gap'); }`                     |

- **Narrowest selector.** The child combinator from `.u-panelmenu` (through the Angular host `u-panel-menu-list`) matches only the top-level list. Nested lists are rendered conditionally inside an expanded `li.u-panelmenu-item` (§18 A1) and are never a child of the root, so R-M5 cannot target them.
- No DOM, template, class, runtime or API change; no new token. R-M5 is D5, so it is emitted last (§8 order).
- **Gate G-4 (root-list layout and gap).** With R-M5, in Chromium/Firefox/WebKit × Angular/Vue, the top-level list computes `list-style-type: none`, `margin` 0, `padding` 0, `display: flex`, `flex-direction: column`, and a `row-gap` equal to the resolved `panelmenu.gap`. The vertical distance between consecutive top-level panels equals that gap. No nested list matches the R-M5 selector, collapsed or expanded. Without R-M5 (neutralized), U-1/U-2 reappear. R-M5 is kept only if G-4 shows both §6.3 conditions; otherwise this amendment returns to the user.
- **Re-verification.** PanelMenu verification is re-run: root-list layout and gap, expansion, collapse (nested list removed from the DOM), the accessibility differential, and regression against the approved non-PanelMenu states. The 24 PanelMenu screenshots are re-captured and stay unaccepted until a fresh user review passes.

**Other Task 10 decisions.**

- The 75 non-PanelMenu screenshots (63 expected token/structure changes, 12 F-3b corrections) are approved as baselines. R-M2 stays dropped (§17); the resulting 9 px Menubar/MegaMenu overlay overlap does not override that ruling.
- The 16 introduced PanelMenu `region` fingerprints (ng 7, vue 9; exposed by the F-3a correction) are accepted as upstream Aura parity exceptions. They are recorded as rows in `docs/architecture/ACCESSIBILITY_BASELINE.md` following the established pattern, tagged `GAP-064 G3-C2 — upstream Aura parity exception (user-approved 2026-10-06)`. The row-level evidence stays in the review record. The G3-C2 validator is unchanged.
- U-3 (MegaMenu disabled column item not dimmed; pre-existing, the column item never receives `u-megamenu-item-disabled`) is recorded as a new, separately authorized gap and is not fixed in G3-C2.

No other scope expansion.
