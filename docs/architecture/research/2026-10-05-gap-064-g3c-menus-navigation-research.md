# GAP-064 G3-C research — F2 Menus & Navigation

**Date:** 2026-10-05
**Evidence gathered at:** `main` `2c8ef45` (pushed; after G3-B), branch `feature/gap-064-g3c-menus-navigation`.
**Baseline (ADR-048):** `@primeuix/styles` 2.0.3, `@primeuix/themes` 2.0.3, PrimeNG 21.1.9, PrimeVue 4.5.5 — extracted fresh from the pinned tarballs in `.vendor-cache/`.
**Governing decisions:** ADR-051; D-G3-1..9 and the rulings in `2026-10-04-gap-064-g3-research.md` §11. G3-B decisions B-1..B-9 were tranche-scoped; where G3-C needs the same pattern, it is proposed again below for explicit approval.
**Status:** research record. §1–§8 are the Research + Architecture Decision Brief as presented; §9 records the user's decisions (2026-10-05). No Spec, no Plan, no implementation. GAP-064 stays PARTIAL. G3-B follow-ups (U1, U2, Vue BlockUI) and the pre-existing `ng.json` provenance gap are untouched.

**Markers:** ✅ = confirmed by evidence; 🔶 = to verify at Spec time or in the Docker "before" run.

## 1. Executive summary

- ✅ **Scope.** G3-C covers family F2, with 10 Aura keys: breadcrumb, contextmenu, dock, megamenu, menubar, panelmenu, stepper, steps, tabs and tieredmenu. That is 10 Angular and 10 Vue style modules. Each framework has one style module per key; the Stepper and Tabs sub-components share their key's module.
- ✅ **Upstream.** The 10 modules hold **267 rule groups**, with no keyframes. Every key has a registered Aura module.
- ✅ **Tokens.** Every `dt()` path resolves against the current preset except `menubar.submenu.color`, which is undefined upstream as well (the known E3 case). The only cross-key reference, `contextmenu` → `tieredmenu.submenu.mobile.indent`, sits only in mobile groups. Stepper also uses semantic `focus.ring.*` tokens, which resolve. No new tokens or modules are needed.
- ✅ **Key renames (ADR-051): 11 sites.**
  - Angular (7): `context-menu`, `mega-menu` ×2 (`mega-menu.ts`, `mega-menu-column.ts`), `panel-menu` ×2 (`panel-menu.ts`, `panel-menu-list.ts`), `tiered-menu` ×2 (`tiered-menu.ts`, `tiered-menu-sub.ts`).
  - Vue (4): `context-menu`, `mega-menu`, `panel-menu`, `tiered-menu`.
- ✅ **G3-C is harder than G3-B**, for five reasons:
  1. The upstream menu modules carry large mobile, orientation and column rule sets that Ultimate does not render.
  2. Upstream shows and hides submenus through **component inline styles**; Ultimate's hand-written CSS does it instead.
  3. PanelMenu's DOM differs structurally from upstream.
  4. Several upstream elements carry **two classes** where Ultimate emits one.
  5. Upstream state classes (`p-focus`, `p-*-item-active`, `p-disabled`) map to different Ultimate state classes, or are not emitted at all.
- ✅ **Coverage.** No F2 component has screenshot or accessibility coverage today. The only existing F2 e2e test is Vue Stepper's separator-layout test, `packages/vue/e2e/stepper.spec.ts`; it is a regression risk.

## 2. Inventory and registration

| Key         | Angular registration(s)                                                                             | Vue registration                            | Current CSS (raw chars ng / vue) |
| ----------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------- |
| breadcrumb  | `breadcrumb.ts:138` `breadcrumb`                                                                    | `BaseBreadcrumb.ts:20` `breadcrumb`         | 461 / 461                        |
| contextmenu | `context-menu.ts:98` **`context-menu`** ⚠                                                           | `BaseContextMenu.ts:9` **`context-menu`** ⚠ | 562 / 562                        |
| dock        | `dock.ts:80` `dock`                                                                                 | `BaseDock.ts:10` `dock`                     | 1385 / 1385                      |
| megamenu    | `mega-menu.ts:113`, `mega-menu-column.ts:66` **`mega-menu`** ⚠                                      | `BaseMegaMenu.ts:18` **`mega-menu`** ⚠      | 938 / 919                        |
| menubar     | `menubar.ts:39`, `menubar-sub.ts:95` `menubar`                                                      | `BaseMenubar.ts:17` `menubar`               | 860 / 860                        |
| panelmenu   | `panel-menu.ts:52`, `panel-menu-list.ts:122` **`panel-menu`** ⚠                                     | `BasePanelMenu.ts:18` **`panel-menu`** ⚠    | 853 / 853                        |
| stepper     | 7 files (stepper, step-list, step-item, step, step-panels, step-panel, stepper-separator) `stepper` | `BaseStepper.ts:9` `stepper`                | 875 / 1643                       |
| steps       | `steps.ts:77` `steps`                                                                               | `BaseSteps.ts:10` `steps`                   | 662 / 662                        |
| tabs        | 5 files (tabs, tab-list, tab, tab-panels, tab-panel) `tabs`                                         | `BaseTabs.ts:13` `tabs`                     | 862 / 862                        |
| tieredmenu  | `tiered-menu.ts:43`, `tiered-menu-sub.ts:92` **`tiered-menu`** ⚠                                    | `BaseTieredMenu.ts:22` **`tiered-menu`** ⚠  | 832 / 832                        |

The Angular and Vue `classes` vocabularies are identical for 8 keys. Two differ:

- **Menubar:** Angular emits `u-focus` on the focused item; Vue does not.
- **Stepper:** Vue renders `u-step-panel-content-wrapper`; Angular does not.

## 3. Upstream structure and DOM differences

| Key         | Upstream groups | Main differences from Ultimate's DOM                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Proposed classification                                                                      |
| ----------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| breadcrumb  | 11              | No separator icon element (text separator) → `separator-icon:dir(rtl)` not rendered                                                                                                                                                                                                                                                                                                                                                                                                                             | Direct                                                                                       |
| contextmenu | 23              | **No nested submenus** in Ultimate (no `submenu`/`submenu-icon`), no `item-active`, no mobile; `p-focus` ↔ `u-contextmenu-item-focused`; group 2 is a selector list `root-list, submenu` of which only `root-list` renders                                                                                                                                                                                                                                                                                      | Adapted                                                                                      |
| dock        | 17              | `p-focus` (keyboard-focused item) not emitted; no mobile; position classes `u-dock-${position}` match                                                                                                                                                                                                                                                                                                                                                                                                           | Adapted                                                                                      |
| megamenu    | 56              | Horizontal only (no `orientation` input, no `-horizontal`/`-vertical` class); no `start`/`end` slots, no mobile button/breakpoint, no `p-megamenu-col-N` (Ultimate uses `u-megamenu-column`), no separator; `p-*-item-active` ↔ `u-megamenu-item-open`; `p-focus` not emitted                                                                                                                                                                                                                                   | Adapted                                                                                      |
| menubar     | 44              | No `start`/`end`, no mobile button/breakpoint; `p-*-item-active` ↔ `u-menubar-item-open`; `p-focus` ↔ Angular `u-focus`, not emitted in Vue. Upstream group 2 reads `.p-menubar-start, .p-megamenu-end` (an upstream typo)                                                                                                                                                                                                                                                                                      | Adapted                                                                                      |
| panelmenu   | 29              | **Structurally different.** Upstream: panels (`panel` > `header` > `header-content` > `header-link`, then `content-container` > `content-wrapper` > `submenu` > `item` > `item-content` > `item-link`). Ultimate: a single recursive tree — root > `submenu` > `item` > `header-content` > `header-link`, with the **header classes used at every level**. No `panel`, `header`, `item-content/link/label/icon`, `content-container/wrapper`. Expanded state is `u-panelmenu-item-expanded` / `data-u-expanded` | **Ultimate-specific** (decision C-6)                                                         |
| stepper     | 28              | Name differences only: `steplist`→`u-step-list`, `stepitem`→`u-step-item` (+`-active`), `steppanels`→`u-step-panels`, `steppanel`→`u-step-panel`, `steppanel-content(-wrapper)`→`u-step-panel-content(-wrapper)` (wrapper Vue only); no readonly class for `linear`                                                                                                                                                                                                                                             | Adapted                                                                                      |
| steps       | 15              | `p-disabled` ↔ `u-steps-item-disabled`; no readonly class (`readonly` input exists, defaults to readonly)                                                                                                                                                                                                                                                                                                                                                                                                       | Adapted                                                                                      |
| tabs        | 19              | Upstream's content element carries `p-tablist-content p-tablist-viewport`, and the navigators carry `p-tablist-prev                                                                                                                                                                                                                                                                                                                                                                                             | next-button p-tablist-nav-button`; Ultimate emits only `u-tablist-content`and`u-tablist-prev | next-button`. `p-disabled`↔`u-tab-disabled` | Adapted |
| tieredmenu  | 25              | `p-*-item-active` ↔ `u-tieredmenu-item-open`; `p-focus` not emitted; no mobile                                                                                                                                                                                                                                                                                                                                                                                                                                  | Adapted                                                                                      |

Compared with G3 research §2, Breadcrumb stays Direct. Dock, Steps, Tabs and TieredMenu move from Direct to Adapted, and PanelMenu moves from Adapted to Ultimate-specific. The reasons are in the table.

### 3.1 Behaviour that upstream supplies outside its stylesheets

- ✅ **Submenu visibility.** PrimeVue `MenubarStyle.js` and `TieredMenuStyle.js` set `inlineStyles.submenu` to `display: flex` or `none`, depending on whether the item is active. The upstream CSS gives every `-submenu` `display: flex`.
- ✅ Ultimate **always renders nested submenus** (Angular `@if (hasItems(item))`, Vue `v-if="hasItems(item)"`) and hides closed ones with its own CSS. Examples:
  - `.u-tieredmenu-submenu { display: none }`;
  - `.u-tieredmenu-item[data-u-open="true"] > .u-tieredmenu-submenu { display: block }`;
  - Menubar has the same pair;
  - PanelMenu uses `data-u-expanded`.
- **A pure upstream port would show every submenu.** The visibility rule is the same kind of inline-style role that G3-B handled for Divider (B-3).
- ✅ **ContextMenu.** PrimeNG sets `inlineStyles.root` to `position: absolute`.
- ✅ **MegaMenu.** PrimeVue sets `rootList` to `max-height: scrollHeight; overflow: auto`. Ultimate has no `scrollHeight` input, so this is not needed.
- ✅ **TieredMenu popup.** Ultimate parks the popup off-screen with CSS (`.u-tieredmenu-overlay { position: absolute; top: -9999px; left: -9999px }`) and positions it in JS. Upstream gets its position from JS and inline styles.
- ✅ **Base-style `.p-disabled` role.** As in G3-B, upstream disabled items rely on the base stylesheet's `.p-disabled` (opacity, pointer-events). Ultimate does this with its own rules today, for example `.u-tieredmenu-item[data-u-disabled="true"] .u-tieredmenu-item-link { opacity: 0.6; pointer-events: none }`.

## 4. Rule groups: ported vs omitted (proposal; exact lists are fixed in the Spec)

| Key                             | Upstream | ng ported | vue ported | Main omissions                                                                     |
| ------------------------------- | -------- | --------- | ---------- | ---------------------------------------------------------------------------------- |
| breadcrumb                      | 11       | 10        | 10         | separator-icon RTL                                                                 |
| contextmenu                     | 23       | 12        | 12         | submenu, submenu-icon, item-active, mobile (no nested submenus)                    |
| dock                            | 17       | 11        | 11         | `p-focus` item, 5 mobile groups                                                    |
| megamenu                        | 56       | 23        | 23         | start/end, focus, separator, vertical (6), col-N (6), button + mobile (14)         |
| menubar                         | 44       | 24        | 21         | start/end, end (2), button (3), mobile (14); Vue also the 3 focus groups           |
| panelmenu                       | 29       | per C-6   | per C-6    | —                                                                                  |
| stepper                         | 28       | 26        | 27         | readonly (no `linear` class); Angular: `steppanel-content-wrapper`                 |
| steps                           | 15       | 14        | 14         | `:not(.p-readonly)` cursor group (no readonly class; links already show a pointer) |
| tabs                            | 19       | 19        | 19         | none, if C-3 is approved; otherwise 5 (viewport, nav-button)                       |
| tieredmenu                      | 25       | 18        | 18         | focus (3), mobile (4)                                                              |
| **Total (excluding panelmenu)** | **238**  | **157**   | **155**    |                                                                                    |

## 5. Size

🔶 The upstream raw CSS for the 10 keys is 40.7 KB (5.0 KB gzip). Ultimate's is 8.3 KB per framework (1.4–1.6 KB gzip). After the omissions, the increase is estimated at roughly +3 KB gzip per framework, about +4–5% of the Angular `index.mjs` and +2% of Vue. That is well inside the 15% gate, but about 4 times G3-B's increase. It is measured with the authoritative direct `fe86fe4`-style comparison against the G3-C base.

## 6. Coverage needed (proposal)

- **Existing stories (ng / vue):**
  - Breadcrumb: Default, WithoutHome, WithDisabledItem.
  - ContextMenu: Default, Global.
  - Dock: Default, LeftPosition.
  - MegaMenu: Default.
  - Menubar: Default, plus WithDisabledItem in Angular only.
  - PanelMenu: Default, Multiple.
  - Stepper: Default, Linear.
  - Steps: Default, NotReadonly.
  - Tabs: Default.
  - TieredMenu: Default, plus Popup in Angular only.
- **Interaction-state screenshots needed.** Menus are closed at rest, so the open-state styling is invisible without an interaction:
  - an open submenu in Menubar, TieredMenu and MegaMenu;
  - an open ContextMenu (right-click);
  - an open TieredMenu popup;
  - an expanded PanelMenu item.
- **Verification stories likely needed:**
  - disabled items (Menubar in Vue, TieredMenu, MegaMenu, PanelMenu, Dock);
  - Dock top/right positions;
  - Tabs with navigators (overflow);
  - Stepper vertical (`UStepItem`);
  - nested PanelMenu levels.
- **Layout/computed-style checks:**
  - closed submenus are hidden and open ones visible;
  - the open-state colour equals `*.item.active.*`;
  - disabled-item opacity;
  - Tabs navigator geometry;
  - the active-bar position;
  - stepper separators — the existing Vue `stepper.spec.ts` must keep passing.
- **Accessibility:** a G3-C differential check on the G3-A/G3-B model. A new tranche-scoped validator, with the G3-A and G3-B tooling frozen.

## 7. Decisions requested

- **C-1 — State mapping.** Map upstream state classes to the state classes Ultimate already emits:
  - `p-*-item-active` → `u-*-item-open` (menus);
  - `p-disabled` → `u-*-item-disabled`, `u-tab-disabled`, `u-step-disabled`;
  - `p-focus` → `u-contextmenu-item-focused` / Angular `u-focus`.

  Where Ultimate emits no state (keyboard focus in TieredMenu, MegaMenu, Dock and Vue Menubar), exclude those groups. _Recommend: approve._ This is the B-1 pattern applied to existing classes; there is no DOM change.

- **C-2 — Selector-list pruning.** Where an upstream group's selector list mixes rendered and unrendered parts (ContextMenu group 2 `root-list, submenu`; PanelMenu group 8 `header-icon, item-icon`), drop only the unrendered selectors and keep the group, with its declarations unchanged. _Recommend: approve_ (a new adaptation form; recorded per group).
- **C-3 — Class aliasing for dual-class upstream elements.** Map Tabs `.p-tablist-viewport` → `.u-tablist-content` (the same element), and `.p-tablist-nav-button` → `.u-tablist-prev-button, .u-tablist-next-button` (a selector-list expansion with equal specificity). _Recommend: approve._ The alternative is to exclude the 5 groups and keep Ultimate's literal navigator styling.
- **C-4 — Inline-role rules (B-3 pattern).** Express upstream's JS-driven behaviour as CSS keyed on Ultimate's existing state:
  - submenu visibility for Menubar and TieredMenu, for example `.u-tieredmenu-item:not(.u-tieredmenu-item-open) > .u-tieredmenu-submenu { display: none }`, so the upstream `display: flex` applies only when open;
  - the TieredMenu popup's initial off-screen placement;
  - ContextMenu root `position: absolute`.

  The exact text goes in the Spec. _Recommend: approve._

- **C-5 — MegaMenu orientation and columns.**
  - Ultimate's MegaMenu is horizontal-only, so map `.p-megamenu-horizontal` → `.u-megamenu` (always horizontal).
  - Exclude the vertical, `col-N`, separator, start/end and mobile groups.
  - Keep Ultimate's own `u-megamenu-column` layout rule as a retained Ultimate-only rule.

  _Recommend: approve._

- **C-6 — PanelMenu structural divergence.**
  - (A) Structural adaptation: map upstream panel/header groups to Ultimate's top-level items (`.u-panelmenu > .u-panelmenu-submenu > .u-panelmenu-item …`), and the item groups to nested levels (`.u-panelmenu-submenu .u-panelmenu-submenu …`). Upstream tokens apply per level; no DOM change.
  - (B) Treat it as Ultimate-specific (D-G3-8): map literals to `dt()` only where an Aura token has the same role, and keep the rest.
  - (C) Defer PanelMenu to a follow-up and port the other 9 keys.

  _Recommend: A_ — closest to parity without a DOM change, at the cost of more complex selectors that must be proven per level in tests.

- **C-7 — Base-role disabled rules (B-2 pattern).** Add component-local rules for the `.p-disabled` role, using `dt('disabled.opacity')`, wherever upstream relies on the base style: menu items, Breadcrumb, Steps, Tabs and Stepper. _Recommend: approve._ Without them, disabled items lose today's dimming.
- **C-8 — Ultimate-only retained rules.** Use the G3-B rule: retain only rules with no upstream role and visible breakage without them. Exact list at the Spec (expected candidates: `u-megamenu-column`, PanelMenu indentation, glyph sizing). _Recommend: approve the rule;_ the list is fixed in the Spec.
- **C-9 — Tranche shape.**
  - (A) One G3-C tranche, as in D-G3-6.
  - (B) Two sequential sub-tranches inside G3-C: **C1 Navigation** (Breadcrumb, Dock, Steps, Stepper, Tabs) and then **C2 Menus** (TieredMenu, ContextMenu, Menubar, MegaMenu, PanelMenu). Each would have its own Docker baselines, review gate and size measurement.

  _Recommend: B_ — the menu half carries most of the risk (submenus, PanelMenu, interaction screenshots), and the review gate stays manageable. The family order and scope are unchanged.

- **C-10 — Verification approach.** Interaction-state screenshots for open menus, plus layout/computed-style checks for submenu visibility, open and disabled state colours, and Tabs navigator geometry. The existing Vue `stepper.spec.ts` stays as a regression check. A G3-C differential accessibility check is a new tranche-scoped validator with the G3-A/G3-B tooling frozen. _Recommend: approve in principle;_ details are designed in the Spec.
- **C-11 — Confirmations.**
  - ADR-051 renames at the 11 sites above.
  - `menubar.submenu.color` stays an unresolved-token exception, ported as-is (D-G3-5).
  - Upstream's `.p-menubar-start, .p-megamenu-end` typo is moot, because both selectors are unrendered.

  _Recommend: confirm._

## 8. Outside G3-C

- G3-D and G3-E.
- The G3-B follow-ups U1, U2 and the Vue BlockUI observation.
- The pre-existing `ng.json` `accordion.spec.ts` provenance gap.
- React; Ripple.
- Feature gaps: ContextMenu nested submenus, MegaMenu vertical orientation and start/end slots, menu mobile modes, Steps/Stepper readonly classes. These are recorded as exclusions, not built.
- No new GAP IDs; GAP-064 stays PARTIAL.

## 9. Decisions (2026-10-05, user)

1. **C-1 = approve (state mapping).** The mapping targets Ultimate's existing state classes:
   - `p-*-item-active` → the existing `u-*-item-open` classes;
   - `p-disabled` → the existing component disabled classes;
   - `p-focus` → `u-contextmenu-item-focused` or Angular `u-focus`, only where actually emitted.

   Where Ultimate emits no equivalent state, the upstream group is omitted. No DOM or runtime class additions are authorized.

2. **C-2 = approve (selector-list pruning).** Where an upstream group mixes rendered and unrendered selectors:
   - keep the rendered selectors;
   - remove only the selectors for features or elements Ultimate does not render;
   - keep the declarations unchanged;
   - record each adaptation explicitly in the Spec and fidelity data.

   This is never a reason to restructure the Ultimate DOM.

3. **C-3 = approve (Tabs).** `.p-tablist-viewport` → `.u-tablist-content`; `.p-tablist-nav-button` → `.u-tablist-prev-button, .u-tablist-next-button`. Specificity and behaviour stay equivalent. No DOM or class changes.
4. **C-4 = approve (JS-driven upstream roles as CSS).** The upstream inline-style responsibilities are translated into CSS driven by Ultimate's existing state:
   - submenu visibility;
   - TieredMenu popup initial off-screen placement;
   - ContextMenu root positioning.

   Ultimate's existing runtime positioning and state behaviour must be preserved. No new JavaScript is added just to reproduce upstream CSS roles.

5. **C-5 = approve (MegaMenu).** Ultimate MegaMenu is horizontal-only:
   - the horizontal role maps to the existing Ultimate root;
   - the vertical orientation, `col-N`, separator, start/end and mobile groups are excluded;
   - the existing `u-megamenu-column` layout rule is kept as an explicitly retained Ultimate-only rule.

   No new orientation or column API, and no new DOM structure.

6. **C-6 = Option A (PanelMenu structural adaptation).** Against Ultimate's existing recursive tree:
   - upstream panel/header roles map to the appropriate tree levels;
   - item roles map to nested levels;
   - the existing DOM is preserved;
   - each selector level is verified explicitly.

   PanelMenu is neither deferred nor reclassified as merely Ultimate-specific. The Spec must give exact selector mappings and verification coverage for each tree level.

7. **C-7 = approve (disabled base roles).** Component-local disabled rules are added wherever upstream styling relies on `.p-disabled`, using the existing `disabled.opacity` token and Ultimate's existing disabled-state selectors. This is a local parity adaptation, not shared styling infrastructure.
8. **C-8 = approve the rule, not a list.** An Ultimate-only rule is retained only when:
   - no equivalent upstream role covers it; and
   - removing it would cause a visible or behavioural regression.

   The exact retained-rule list must be established and evidenced in the Spec and fidelity data before implementation. No new Ultimate-only rules are introduced merely for convenience.

9. **C-9 = Option B (two sequential sub-tranches).**
   - **C1 Navigation:** Breadcrumb, Dock, Steps, Stepper, Tabs.
   - **C2 Menus:** TieredMenu, ContextMenu, Menubar, MegaMenu, PanelMenu.

   Each sub-tranche gets its own Spec/Plan execution gate as applicable, Docker before/after verification, visual baseline review, accessibility differential review and authoritative size measurement. C1 and C2 are never combined into one implementation gate.

10. **C-10 = approve in principle (verification).**
    - Interaction-state screenshots for open menu and navigation states.
    - Layout and computed-style checks for submenu visibility, open and disabled states, Tabs navigator geometry and other component-specific invariants.
    - The existing Vue `stepper.spec.ts` as a mandatory regression check.
    - A new G3-C accessibility differential validator.

    G3-A and G3-B tooling stay frozen. The exact screenshot matrix and accessibility contract are finalised in the Spec and Plan, not assumed from this brief.

11. **C-11 = confirm.**
    - The 11 ADR-051 key renames in §1 are applied.
    - `menubar.submenu.color` stays the known unresolved-token exception and is ported as-is.
    - The upstream `.p-menubar-start, .p-megamenu-end` typo stays irrelevant, because Ultimate renders neither selector.

**Additional constraints (user).** These stay unchanged and outside G3-C:

- G3-B follow-ups U1, U2 and Vue BlockUI.
- The pre-existing `ng.json` `accordion.spec.ts` provenance gap.
- React and Ripple.
- The documented feature exclusions: nested ContextMenu submenus, MegaMenu vertical/start/end/mobile modes, and Steps/Stepper readonly classes.

No new GAP IDs; GAP-064 stays PARTIAL.

**Next gate:** G3-C1 (Navigation) Specification — not started; requires separate authorization.
