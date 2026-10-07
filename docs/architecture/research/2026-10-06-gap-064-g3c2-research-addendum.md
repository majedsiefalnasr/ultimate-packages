# GAP-064 G3-C2 (Menus) research addendum

**Date:** 2026-10-06
**Evidence gathered at:** `main` `3d0203d` (after C2-0), branch `feature/gap-064-g3c2-menus`. Live Angular and Vue Storybook dev servers; Playwright 1.63 Chromium. Pinned sources: `@primeuix/styles` 2.0.3 (`.vendor-extracted/uix-styles-full`), `@primeuix/utils` 0.7.2, PrimeNG 21.1.9 and PrimeVue 4.5.5 (`.vendor-cache/`). The built `@ultimate/themes` Aura preset.
**Governing records:** ADR-052 (normative: X-1, X-2, X-3, X-3b, X-4, X-6, X-12); G3-C research and decisions C-1..C-11 (`2026-10-05-gap-064-g3c-menus-navigation-research.md` §9); cross-tranche study (`2026-10-06-gap-064-cross-tranche-study.md`, evidence); C2-0 closeout (`2026-10-06-gap-064-c2-0-closeout.md`).
**Status:** research and evidence record, **approved by the user (2026-10-06); rulings in §13**. It contains no Spec, no Plan and no implementation, and it creates no new normative rule. It proposes decisions for the user (§11). GAP-064 stays PARTIAL. G3-D and G3-E are out of scope.

**Method.** Read-only scripts (disposable, not committed). Each step:

1. Parse the five upstream modules with the frozen G3-A parser (`parseGroups`, imported read-only).
2. Map every group's selector parts to the existing Ultimate DOM per framework, using C-1..C-6 and ADR-052 X-4 role 5.
3. Evaluate each mapped part in the live DOM with state pseudo-classes removed (ADR-052 X-1), across these states: rest, hover-open, nested hover-open, keyboard focus, context-menu open and hover, PanelMenu fully expanded, and the disabled-item stories.
4. Check source emission for every unreached part.
5. Resolve every `dt()` path against the built Aura preset.

**Classes:** **R** reached in a named story and state; **K** emitted by a cited source path under a state no story exercises; **X** not emitted (FX omission).

## 1. Summary

- **Scope is unchanged.** Five keys (tieredmenu, contextmenu, menubar, megamenu, panelmenu): 5 Angular and 5 Vue style modules. The only source change since the G3-C research is C2-0 (Angular ContextMenu).
- **Upstream:** 177 rule groups (tieredmenu 25, contextmenu 23, menubar 44, megamenu 56, panelmenu 29).
- **Proposed scope (§5):** **100 groups ported per framework (R or K), 77 excluded (X)**, identical in Angular and Vue.
- **Correction:** the G3-C research proposed Menubar Angular 24 / Vue 21. The re-verified figure is **21 / 21**, because Angular Menubar never emits a focus class (§3, finding RC-1).
- **Tokens:** every `dt()` path resolves except `menubar.submenu.color`, the known unresolved-token exception. The only cross-key reference (`contextmenu` → `tieredmenu.submenu.mobile.indent`) is in an excluded mobile group.
- **Key renames (ADR-051):** the 11 sites are re-confirmed (Angular 7, Vue 4).
- **No DOM change is needed (ADR-052 X-2).** PanelMenu's structural divergence and the Angular component hosts are handled by CSS adaptation to the existing DOM. Option A of C-6 is shown to be feasible: every structural PanelMenu role reaches in both frameworks.
- **Pre-existing defects split:**
  - corrected by C2-0: Angular ContextMenu timing and the host-trigger documentation and story;
  - correctable inside the C2 CSS port as recorded pre-existing defect corrections: PanelMenu invisibility (F-3a) and Angular TieredMenu/Menubar submenus never showing (F-3b);
  - outside C2: the TieredMenu popup has no positioning in either framework.
- **Size estimate:** about +1.6 KB gzip per framework (§10). Estimate only.

## 2. Inventory and registration (re-verified at `3d0203d`)

| Key         | Angular registrations                                        | Vue registration                        | Rename (ADR-051) |
| ----------- | ------------------------------------------------------------ | --------------------------------------- | ---------------- |
| tieredmenu  | `tiered-menu.ts:43`, `tiered-menu-sub.ts:92` (`tiered-menu`) | `BaseTieredMenu.ts:22` (`tiered-menu`)  | yes ×2 / ×1      |
| contextmenu | `context-menu.ts:108` (`context-menu`)                       | `BaseContextMenu.ts:9` (`context-menu`) | yes ×1 / ×1      |
| menubar     | `menubar.ts:39`, `menubar-sub.ts:95` (`menubar`)             | `BaseMenubar.ts:17` (`menubar`)         | no               |
| megamenu    | `mega-menu.ts:113`, `mega-menu-column.ts:66` (`mega-menu`)   | `BaseMegaMenu.ts:18` (`mega-menu`)      | yes ×2 / ×1      |
| panelmenu   | `panel-menu.ts:52`, `panel-menu-list.ts:122` (`panel-menu`)  | `BasePanelMenu.ts:18` (`panel-menu`)    | yes ×2 / ×1      |

- The rename sites total 11: Angular 7, Vue 4.
- **Source drift since `2c8ef45`:** none in the ten directories, apart from Angular ContextMenu (C2-0 `6727498` and `4f45109`; timing and comments/story only).
- **Class vocabulary (`cx()` keys actually used):**
  - TieredMenu and Menubar: root, rootList, submenu, item, itemContent, itemLink, itemIcon, itemLabel, submenuIcon, separator.
  - ContextMenu: the same set without submenu and submenuIcon.
  - MegaMenu: the base set plus overlay, grid, column, submenuLabel. It has **no separator**.
  - PanelMenu: root, item, headerContent, headerLink, headerIcon, headerLabel, submenu, submenuIcon.
  - **Pre-existing:** PanelMenu's `panel` class key exists but is never emitted, so the current `.u-panelmenu-panel + .u-panelmenu-panel` rule is dead (RC-3).

## 3. Re-verification of earlier C2 findings

| ID   | Earlier statement (G3-C research / study)                                               | Status at `3d0203d`                                                                                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RC-1 | "Menubar: Angular emits `u-focus` on the focused item; Vue does not" (G3-C research §2) | **False.** Angular `menubar-style.ts` accepts a `focused` parameter (`u-focus`), but `menubar-sub.ts` `itemParams()` passes only `disabled` and `open`. Nothing emits `u-focus`. Upstream Menubar focus groups 13–15 are therefore X in **both** frameworks. |
| RC-2 | "Ultimate positions the TieredMenu popup in JS" (G3-C research §3.1)                    | **False**, already corrected in study §11. CSS parks it at `top/left: -9999px`, and no anchoring exists in either framework.                                                                                                                                 |
| RC-3 | PanelMenu `u-panelmenu-panel`                                                           | Never emitted; the current sibling-margin rule is dead. Pre-existing.                                                                                                                                                                                        |
| RC-4 | MegaMenu separator                                                                      | Ultimate MegaMenu emits no separator (`cx` has no `separator` key). Upstream group 25 is X (feature exclusion).                                                                                                                                              |
| F-3a | PanelMenu renders nothing (study §4.1)                                                  | **Confirmed unchanged.** The root list is `ul.u-panelmenu-submenu`, which `.u-panelmenu-submenu { display: none }` hides.                                                                                                                                    |
| F-3b | Angular TieredMenu/Menubar submenus never show (study §4.1)                             | **Confirmed unchanged.** The `u-tiered-menu-sub` / `u-menubar-sub` hosts sit between `li` and `ul`, so `item[data-u-open="true"] > submenu` never matches. Angular MegaMenu is unaffected (its overlay is a direct child).                                   |
| F-3c | Angular ContextMenu at (0,0); non-global trigger                                        | **Corrected by C2-0.** It now positions after render (12/12 three-engine e2e; Linux CI `37456600014`). The Default story's host hit area is documented. Not part of G3-C2.                                                                                   |
| F-3d | TieredMenu popup story has no trigger; popup has no positioning                         | **Unchanged; outside C2** (study §11, separate Angular + Vue decision).                                                                                                                                                                                      |
| —    | Triggers (study §4.1)                                                                   | Unchanged in both frameworks: hover opens, click toggles. A real click on a Vue PanelMenu header (`href="#"`) expands it and does **not** navigate. The study's 🔶 observation came from a test artefact and is resolved.                                    |

## 4. Defect classification for G3-C2

| Defect                                                                              | Category                             | Treatment                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Angular ContextMenu pre-render positioning; Default story trigger and documentation | Runtime/story, **corrected by C2-0** | None in C2                                                                                                                                                                                                         |
| F-3a PanelMenu root list hidden                                                     | CSS-level, pre-existing              | Inside C2 as a **pre-existing defect correction**, separate from the fidelity port. The root list carries no expansion state and stays visible; only lists nested under a collapsed item are hidden (§7, role 1b). |
| F-3b Angular TieredMenu/Menubar submenu visibility                                  | CSS-level, pre-existing              | Inside C2 as a **pre-existing defect correction**: host-aware visibility selectors (ADR-052 X-4 role 5). No DOM change.                                                                                            |
| RC-3 dead `u-panelmenu-panel` rule                                                  | CSS-level, pre-existing              | Disappears when the module's CSS is replaced by the port. Recorded, needs no separate action.                                                                                                                      |
| TieredMenu popup has no positioning (Angular and Vue)                               | Runtime, pre-existing                | **Outside C2.** Separate decision. In C2 the popup role is only the initial off-screen placement (role 2).                                                                                                         |
| Scroll-aware ContextMenu placement                                                  | Runtime divergence                   | Outside C2 (study §11).                                                                                                                                                                                            |

## 5. Rule-group scope per key (proposed; exact text is fixed in the Spec)

Group numbers refer to the `@primeuix/styles` 2.0.3 module order. R and K groups are ported (D1); X groups are omitted (D2). Results are the same in Angular and Vue unless noted.

### 5.1 tieredmenu — 25 groups: ported 18 / excluded 7

- **R:** 1, 2, 3, 4, 5, 6, 7, 9, 10, 14, 16, 17, 19.
- **K:**
  - 8, 15, 18 (item icon: `cx('itemIcon')` when `item.icon`; the stories have no icons);
  - 20 (separator: `cx('separator')` when `item.separator`; no story has one);
  - 21 (`.u-tieredmenu-overlay`: emitted when `popup` is set and the popup is shown. The story has no trigger, and the popup is off-screen even when open; see §7 role 2).
- **X:** 11–13 (focus: no emitter, C-1); 22–25 (mobile).

### 5.2 contextmenu — 23 groups: ported 12 / excluded 11

- **R:** 1, 2 (root-list part only; C-2 prunes the `submenu` part), 4, 5, 6, 7, 11, 14.
  - Groups 8, 12 and 15 (item icon) are R in Angular (the story has icons) and K in Vue (no icons in the story).
  - Focus maps to `u-contextmenu-item-focused`, set on mouseenter (R).
- **K:** 20 (separator).
- **X:** 3, 9, 10, 13, 16 (submenu and submenu icon: no nested submenus); 17–19 (`item-active`: no open state without submenus, C-1); 21–23 (mobile).

### 5.3 menubar — 44 groups: ported 21 / excluded 23 (was 24 / 21; RC-1)

- **R:** 1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 16, 18, 19, 21, 22, 24, 25.
  - Groups 10, 17 and 20 (item icon) are R in Angular and K in Vue.
  - Group 25 (`.submenu > .item-active > .submenu`, nested display and placement) needs the Angular host form `.u-menubar-submenu > .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu`.
- **K:** 23 (submenu separator).
- **X:** 2 (`.p-menubar-start, .p-megamenu-end`, the upstream typo; both unrendered, C-11); 13–15 (focus: no emitter in either framework, RC-1); 26–44 (end, button, mobile).

### 5.4 megamenu — 56 groups: ported 23 / excluded 33

- **R:** 1, 3, 4, 5, 6, 7, 8, 10, 14, 16, 17, 19, 20, 21, 22, 23, 24, 26, 27, 36.
  - Groups 26 and 27 map `.p-megamenu-horizontal` to the root (C-5).
  - Group 22 (`.root-list > .item-active > .overlay { display: block }`) is upstream **CSS-driven** visibility: a D1 port, not a runtime role.
- **K:** 9, 15, 18 (item icon).
- **X:** 2, 28, 29 (start/end); 11–13 (focus); 25 (separator, RC-4); 30–35 (vertical); 37–42 (`col-N`; Ultimate keeps `u-megamenu-column`, C-5); 43–56 (button, mobile).

### 5.5 panelmenu — 29 groups: ported 26 / excluded 3 (C-6 Option A)

- **R:** 1–7, 9, 10, 11, 13, 14, 16, 17–21, 25, 27, 28, 29.
- **K:** 8 (header icon in Vue; nested item icon in both), 12, 15, 26 (icons under focus/hover).
- **X:** 22–24 (`p-focus`: PanelMenu emits no focus class).

**Totals:** 100 ported and 77 excluded per framework, out of 177.

## 6. Selector mapping (proposed)

- **Generic:** `.p-<key>-…` → `.u-<key>-…`. Ultimate uses the compact upstream names for all five keys.
- **C-1 state mapping (satisfies ADR-052 X-3):**
  - `.p-<key>-item-active` → `.u-<key>-item-open`. This class is emitted only when the item is open, in both frameworks: `cx('item', { open })`.
  - `.p-disabled` → `.u-<key>-item-disabled`, emitted only when the item is disabled.
  - `.p-focus` → `.u-contextmenu-item-focused` (ContextMenu only). Elsewhere: X.
  - The existing `data-u-open` / `data-u-disabled` / `data-u-expanded` attributes render the literal `"true"`/`"false"`. Any attribute selector must be value-qualified (X-3).
- **C-2:** prune the unrendered part in ContextMenu group 2 (`submenu`). PanelMenu group 8 is mapped part by part (header icon at the top level, item icon at nested levels).
- **C-5:** `.p-megamenu-horizontal` → `.u-megamenu`.
- **C-6 PanelMenu level logic.** Level selectors are descendant/`:not()` based, so the selector text is the same in both frameworks; only child-list selectors need the Angular host.

  | Upstream role                                     | Ultimate selector                                                                                                                                                                |
  | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | panel                                             | `TOP` = `.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item)`                                                                                                             |
  | header, header-content                            | `TOP > .u-panelmenu-header-content` (two upstream elements collapse onto one)                                                                                                    |
  | header-link                                       | `TOP > … > .u-panelmenu-header-link`                                                                                                                                             |
  | item-content / item-link / item-label / item-icon | the same elements under `NEST` = `.u-panelmenu-item .u-panelmenu-item`                                                                                                           |
  | submenu                                           | `.u-panelmenu-item .u-panelmenu-submenu` (never the root list)                                                                                                                   |
  | content-container, content-wrapper                | the top-level item's child list (Vue `TOP > .u-panelmenu-submenu`; Angular `TOP > u-panel-menu-list > .u-panelmenu-submenu`)                                                     |
  | header `:focus-visible`                           | `TOP:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:has(.u-panelmenu-header-link:focus-visible)`. Upstream focuses the header element; Ultimate focuses the link. |

- **ADR-052 X-4 role 5 (Angular host-aware):** wherever an item-to-submenu child combinator is needed in Angular, the existing host is included: `u-tiered-menu-sub`, `u-menubar-sub`, `u-panel-menu-list`. Vue keeps the direct-child form.
- **Reach:** every mapped R part reached; no mapped selector failed to parse.

## 7. Runtime styling and positioning roles (ADR-052 X-4 inventory)

| #   | Role                                  | Upstream mechanism (pinned source)                                                                                                                   | Ultimate today                                                                       | Proposed C2 treatment                                                                                                                                                                                                              |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TieredMenu/Menubar submenu visibility | `inlineStyles.submenu`: `display: flex` when the item is active, else `none` (PrimeVue `TieredMenuStyle.js` and `MenubarStyle.js`; PrimeNG the same) | CSS `display: none/block` on `[data-u-open="true"] >`. **Broken in Angular** (F-3b). | CSS keyed on `.u-<key>-item-open` (C-4 role 1). Closed lists hidden; open lists take upstream `display: flex`, with the direction-carrying group ported (study §4.1). Host-aware in Angular (role 5). Records the F-3b correction. |
| 1b  | PanelMenu content visibility          | PrimeVue `PanelMenuSub.vue`: `v-show="isItemActive"` on the content container, plus a `p-collapsible` transition                                     | `.u-panelmenu-submenu { display: none }` hides the root list too (F-3a)              | Hide only lists under a collapsed item (`[data-u-expanded="true"]` / `.u-panelmenu-item-expanded` exist in both frameworks); the root list stays visible. Records the F-3a correction. Transition excluded (motion).               |
| 2   | TieredMenu popup placement            | PrimeVue/PrimeNG: `addStyle(position: absolute; top: 0)`, `absolutePosition(container, target)`, `minWidth = getOuterWidth(target)`                  | CSS `top/left: -9999px` only; no anchoring                                           | Keep only the initial off-screen placement (C-4 role 2). Anchoring and `minWidth` excluded (popup defect, separate decision). Group 21 is K with computed-style evidence only.                                                     |
| 3   | ContextMenu root positioning          | PrimeNG `inlineStyles.root: { position: absolute }`; JS `position()` on enter                                                                        | CSS `position: absolute`; JS `position()` after render (C2-0)                        | Keep (C-4 role 3). Ultimate does not render nested ContextMenu submenus, so `nestedPosition` has no subject: excluded.                                                                                                             |
| 4   | TieredMenu nested placement           | `nestedPosition()`: `inset-inline-start: 100%; top: 0`, flipping to `-100%` / up at the viewport edge                                                | CSS `left: 100%; top: 0`                                                             | CSS on the open state (C-4 role 4). The overflow flip is **not introduced** (JavaScript) and is recorded as a PX. Logical versus physical property: see D-C2-3.                                                                    |
| 4b  | Menubar nested placement              | Upstream **CSS** group 25: `left: 100%; top: 0`                                                                                                      | CSS `.u-menubar-submenu .u-menubar-submenu { top: 0; left: 100% }`                   | Ported D1 with the Angular host form (not a runtime role).                                                                                                                                                                         |
| 5   | MegaMenu root-list max-height         | `inlineStyles.rootList`: `max-height: scrollHeight; overflow: auto`                                                                                  | No `scrollHeight` input                                                              | Excluded (no input).                                                                                                                                                                                                               |

**Ultimate-only rule candidates (C-8).** Each must be shown at Spec time to have no upstream role and to cause a visible regression without it:

- `.u-megamenu-column` layout (already approved as retained by C-5);
- the first-level Menubar submenu placement `top: 100%; left: 0`. Upstream sets `position: absolute` with no offsets, so the submenu sits at its static position. The equivalence needs a measurement;
- `.u-tieredmenu { display: inline-block }`.

## 8. Reconciliation with ADR-052

- **X-1:** every ported group has a named story and state (R) or a cited emitter and condition (K) (§5). K groups need verification stories to become R (§9). The reach test runs inside the tranche's verification specs.
- **X-2:** no DOM, template or runtime change is needed. PanelMenu, the Angular hosts and F-3a/F-3b are all CSS adaptations to the existing DOM.
- **X-3:** state is carried by state classes that are emitted only in their state, or by value-qualified attributes. No presence-only selector is needed.
- **X-3b:** every menu has JavaScript disabled guards (study §4.1). The disabled base role (C-7, `disabled.opacity` on `.u-<key>-item-disabled`) needs **disabled-item verification stories**: today only Angular `menubar--with-disabled-item` and Vue `megamenu--default` contain a disabled item.
- **X-4:** fully inventoried (§7). No new JavaScript or runtime state.
- **X-6:** open states are reachable through real triggers in both frameworks:
  - TieredMenu, Menubar and MegaMenu: hover;
  - ContextMenu: right-click (Global story, fixed coordinates; the Angular Default story now has a host hit area);
  - PanelMenu: header click.

  Pointer parking is needed (Firefox residue). The TieredMenu popup is the one open state that cannot be visually evidenced (role 2).

- **X-12:** new G3-C2 verification and differential accessibility steps; the strict run's `--grep-invert` gains the C2 tag; changed-file provenance completeness for the 10 style files.

## 9. Verification coverage needed (for the Spec)

**Existing stories:** TieredMenu Default and Popup (Angular), Default (Vue); ContextMenu Default and Global; Menubar Default (both) and WithDisabledItem (Angular); MegaMenu Default; PanelMenu Default and Multiple.

**Gaps to convert K to R, or to satisfy X-3b:**

- disabled items: TieredMenu, ContextMenu, PanelMenu, Vue Menubar, Angular MegaMenu;
- item icons: TieredMenu, MegaMenu, Vue ContextMenu, Vue Menubar, nested PanelMenu items;
- separators: TieredMenu, ContextMenu, Menubar;
- nested open states: TieredMenu and Menubar second level;
- PanelMenu expanded nested levels.

**Open-state screenshots (X-6):** hover-open TieredMenu, Menubar and MegaMenu; right-click ContextMenu; expanded PanelMenu.

## 10. Size (estimate only)

Gzip of the kept upstream groups per module, summed, is about 3.2 KB, against about 1.6 KB for the current CSS: **roughly +1.6 KB gzip per framework**. The authoritative measurement is made after implementation (C1 E1 method: Angular `fesm2022` per-file sum, Vue `dist/index.mjs`, against the tranche's branch point; 15% gate).

## 11. Proposed decisions for the user

- **D-C2-1 — Scope and counts.** Adopt §5: 100 ported and 77 excluded per framework (TieredMenu 18/7, ContextMenu 12/11, Menubar 21/23, MegaMenu 23/33, PanelMenu 26/3). This corrects the G3-C research §4 proposal (RC-1).
- **D-C2-2 — Visibility mechanism for the F-3a/F-3b corrections.**
  - (a) state classes (`.u-<key>-item-open`, `.u-panelmenu-item-expanded`), consistent with the C-1 `item-active` mapping;
  - (b) value-qualified attributes (`[data-u-open="true"]`, `[data-u-expanded="true"]`), as the current CSS uses.

  Both satisfy X-3. **Recommend (a).**

- **D-C2-3 — Nested TieredMenu placement property.**
  - (a) the upstream logical `inset-inline-start: 100%` (`nestedPosition`'s output; correct in RTL);
  - (b) keep the physical `left: 100%`.

  Either way the overflow flip is a recorded PX. **Recommend (a).**

- **D-C2-4 — TieredMenu popup.** Group 21 is K with computed-style evidence only; no open-popup screenshot; no story change in C2. The popup positioning defect stays a separate decision. **Recommend confirm.**
- **D-C2-5 — Menubar focus groups.** Groups 13–15 are X in both frameworks (RC-1). **Recommend confirm.**
- **D-C2-6 — Verification stories.** Add the §9 verification-only stories. Disabled stories are needed for X-3b; icons, separators and nested states turn K into R. **Recommend adding all §9 stories**, the same approach as C1's verification-only stories.
- **D-C2-7 — Ultimate-only rule candidates.** Evidence the §7 candidate list at Spec time under C-8. **Recommend confirm the approach.**
- **D-C2-8 — Tooling.** G3-C2 gets its own tranche-scoped port data, fidelity test, differential accessibility validator and X-1 reach test, with earlier tranches' tooling frozen (the established pattern; X-9 itself is still undecided). **Recommend confirm.**
- **D-C2-9 — MegaMenu separator (group 25).** X as a feature exclusion (RC-4). **Recommend confirm.**

## 12. Open questions for Spec time (not blocking research)

1. Whether the first-level Menubar submenu at its static position (upstream) matches `top: 100%; left: 0` (Ultimate) in all three engines (C-8 evidence).
2. The PanelMenu header focus ring: upstream focuses the header element, Ultimate focuses the link. Is the `:has(:focus-visible)` mapping visually equivalent? Verify in a browser (X-6).
3. The exact ordering of D3 (base-role) → D1 → D5, and the PX text for roles 2 and 4.

## 13. Decisions (2026-10-06, user)

The addendum is approved. Rulings on §11:

1. **D-C2-1 — Scope and counts: approved.** 100 upstream rule groups ported per framework and 77 excluded, using the per-key accounting in §5.
2. **D-C2-2 — F-3a/F-3b visibility: approved.** Prefer the emitted state classes `.u-<key>-item-open` and `.u-panelmenu-item-expanded`. Do not use attribute selectors when an equivalent emitted state class exists. Value-qualified attributes stay permissible only where genuinely required.
3. **D-C2-3 — Nested TieredMenu placement: approved.** Use `inset-inline-start: 100%` (RTL-correct). No overflow flipping and no new JavaScript; the overflow flip is recorded as a PX (excluded runtime behaviour).
4. **D-C2-4 — TieredMenu popup: approved.** Group 21 stays K, verified through computed-style evidence only. No popup screenshot and no new popup story in C2. Popup anchoring and positioning stay outside G3-C2, as a separate decision.
5. **D-C2-5 — Menubar focus: approved.** Groups 13–15 are X in Angular and Vue and are not ported.
6. **D-C2-6 — Verification stories: approved.** Add the §9 verification-only coverage: disabled items, item icons, separators, nested open states and expanded PanelMenu levels. Disabled-item coverage is mandatory for X-3b; the other stories convert K evidence to R where applicable.
7. **D-C2-7 — Ultimate-only candidates: approved as candidates.** MegaMenu column layout, first-level Menubar submenu placement and TieredMenu `display: inline-block` stay candidates for Spec-time evidence. None is an approved retained rule until the evidence is established.
8. **D-C2-8 — G3-C2 tooling: approved.** G3-C2 gets its own port/fidelity data, fidelity test, differential accessibility validator and X-1 reach test. Earlier tranches' tooling is frozen. No repository-wide tooling remediation.
9. **D-C2-9 — MegaMenu separator: approved.** Group 25 is X, a feature exclusion (Ultimate MegaMenu renders no separator).

**Spec-time verification gates (open, not research blockers):**

- Measure upstream vs Ultimate first-level Menubar submenu positioning in Chromium, Firefox and WebKit before deciding whether the Ultimate-only `top: 100%; left: 0` rule is retained.
- Verify the PanelMenu focus-ring mapping in a browser before finalizing the `:has(:focus-visible)` adaptation.
- Define the exact D3 → D1 → D5 source order and the PX wording in the Spec.

**CI and flakiness evidence rule (G3-C2 verification and acceptance contract):**

> A green CI result after automatic browser retries is not, by itself, sufficient evidence that a browser test is non-flaky.

G3-C2 browser evidence distinguishes `passed_first_attempt`, `passed_after_retry` and `failed`. A test that passes only after a retry stays green for CI purposes, but is reported explicitly as having needed a retry and is never presented as a clean first-attempt pass. The repository-wide retry policy is not changed unless separately authorized.

**Next gate:** the G3-C2 Spec. CSS or runtime implementation, the Plan, G3-D/E and inherited-debt remediation are not authorized.
