# GAP-064 Cross-Tranche Architecture Study

**Date:** 2026-10-06
**Evidence gathered at:** `main` = `origin/main` = `262cec8`, clean tree. Live Storybook dev servers (ng :6001, vue :6003), Playwright 1.63 (Chromium; Firefox and WebKit where stated), pinned vendor sources in `.vendor-cache/` / `.vendor-extracted/`, CI runs `37305871507` (`fe86fe4`), `37356681044` (`2c8ef45`), `37438428821` (`262cec8`).
**Status:** research record, accepted by the user as the current research result (2026-10-06). §1–§8 are the study as presented; §9 records the user's rulings on it. It is not the normative decision record: the exact convention wording goes through a separate cross-tranche decision gate. No source, CSS, test, story, baseline, CI, Spec or Plan change. GAP-064 stays PARTIAL.
**Method:** read-only Playwright scripts run against the live Storybooks. The scripts were disposable and are not part of the repository; §2.1 describes the method in enough detail to reproduce it.

**Classes used:**

- **A** — the selector does not reach rendered DOM under supported composition (false parity, dead selector).
- **B** — the selector reaches DOM but the behaviour is wrong.
- **C** — the selector reaches DOM and the behaviour is correct.
- **U** — conditional: the classes/attributes are emitted by a real source path, but no story or state exercised them. Static evidence only, no rendered evidence.

---

## 1. Current GAP-064 state

- **Status:** PARTIAL.
- **Completed:**
  - Batches 1–3 (76 modules) and Tranche 1 (79 modules, ADR-051).
  - G3-A (F5 + F4), G3-B (F1), G3-C1 (F2 Navigation).
  - All merged and pushed (`262cec8`). CI shows every G3-C1 step green.
- **Remaining:** about 18 Angular / 19 Vue components.

  | Tranche | Keys                                                                                                 | ng / vue |
  | ------- | ---------------------------------------------------------------------------------------------------- | -------- |
  | G3-C2   | tieredmenu, contextmenu, menubar, megamenu, panelmenu                                                | 5 / 5    |
  | G3-D    | confirmdialog, confirmpopup, drawer, popover, speeddial, splitbutton                                 | 6 / 6    |
  | G3-E    | carousel, galleria, image, imagecompare, dataview, orderlist, picklist, organizationchart (Vue only) | 7 / 8    |

- **No source drift:** C2 sources are unchanged since `2c8ef45`; D/E sources are unchanged since `fa5c150`.
- **Binding decisions:**
  - ADR-051; D-G3-1..9; C-1..C-11.
  - Fidelity model D1–D6.
  - Docker baselines with a review gate.
  - A tranche-scoped differential accessibility check, with earlier tooling frozen.
  - The 15% per-tranche size gate.
  - Precedents: the G3-A A2 Toast DOM exception; C1 PX-C1 (visual parity split from interaction parity).
- **Stale doc line:** the BLUEPRINT_GAPS GAP-064 `Status:` header still says "G3-C, G3-D, G3-E — 23 / 24".

## 2. Shipped-CSS selector-reach audit (G3-A, G3-B, G3-C1)

### 2.1 Method

1. Visit every Storybook story of the 29 shipped keys: 75 ng stories, 78 vue stories.
2. Read the shipped structural sheet (`style[data-u-ng-style=<key>]` / `style[data-u-style=<key>]`, never the variables sheet) through the CSSOM.
3. For every comma part of every selector, run `querySelectorAll` on the full selector and on a "structural" form that strips state pseudo-classes and pseudo-elements (hover, focus, `:dir()`, `::before`, …).
4. Aggregate per key across all stories.
5. For each never-matched selector, check whether every class or data attribute it needs is emitted by non-CSS component source.
6. Follow up suspicious cases with live state changes:
   - click Stepper step 2;
   - scroll the Tabs list to its end;
   - hover the Dock.
7. Sweep every attribute selector for the attribute values it actually matches (`"false"`, absent, presence-only).
8. Review every shipped `pointer-events` rule against component guards.

DOM reach does not depend on the engine (`:has()` and `:dir()` are supported in all three Playwright engines), so the reach pass ran in Chromium.

### 2.2 Totals

|                                                                  | Angular | Vue    |
| ---------------------------------------------------------------- | ------- | ------ |
| Selector parts in shipped G3 sheets                              | 332     | 348    |
| Reached structurally at rest                                     | 288     | 307    |
| … of which only in a state not present at rest (hover, focus, …) | 64      | 65     |
| Never matched in any story at rest                               | **44**  | **41** |

### 2.3 Classification of the never-matched selectors

| Selector(s)                                                                                                                                                                                | Tranche | ng            | vue               | Class                                                                                                                                                                              | Evidence                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.u-step:has(~ .u-step-active) .u-stepper-separator`                                                                                                                                       | C1      | ✗             | ✓ after state     | **ng: A**; vue: C                                                                                                                                                                  | Angular `UStep`'s template has no separator, and its only projection slot is inside the title span. Vue after clicking step 2: 1 match, background = `stepper.separator.active.background` `rgb(16,185,129)`.                            |
| `.u-stepper-separator`, `.u-step-item .u-stepper-separator`, `.u-step-item .u-stepper-separator:dir(rtl)`, `.u-step-item:has(~ .u-step-item-active) .u-stepper-separator`                  | C1      | ✗             | ✓ / ✓ after state | **ng: A under the component's own composition** (reachable only if a consumer hand-places the exported `<u-stepper-separator>` inside `<u-step-item>`; no story, test or doc does) | Angular renders 0 separators in the Default and Vertical stories, before and after the state change. The C1 Spec §5.4 marks groups 14, 15, 25, 26 and 27 "✓" (ported) for Angular, while §3.2 records that Angular renders no separator. |
| `.u-tablist-prev-button` (+ `:hover`, `:focus-visible`, `:dir(rtl)`)                                                                                                                       | C1      | ✓ after state | ✓ after state     | C                                                                                                                                                                                  | At scroll start only "next" exists. After scrolling to the end, "prev" exists, is `position: absolute` and sits at the tablist's inline-start edge (delta 0).                                                                            |
| `.u-dock-item-link[data-u-active="true"]`                                                                                                                                                  | C1      | hover         | hover             | C                                                                                                                                                                                  | `data-u-active` is the hover/focus state; C1's hover test asserts `scale(1.5)`.                                                                                                                                                          |
| `.u-tab-disabled *`                                                                                                                                                                        | C1      | –             | –                 | C (no descendants)                                                                                                                                                                 | The disabled tab has no element children. The rule is inert but harmless.                                                                                                                                                                |
| Toast `-top-left/-top-center/-center/-bottom-*` (6)                                                                                                                                        | A       | U             | U                 | U                                                                                                                                                                                  | Dynamic `u-toast-${position}`; the stories use only top-right.                                                                                                                                                                           |
| Message close button per severity (10), ng `.u-message-icon`                                                                                                                               | A       | U             | U                 | U                                                                                                                                                                                  | Needs `closable` + severity, or the ng `icon` input (`@if (icon())`); no story sets them.                                                                                                                                                |
| Avatar `-lg/-xl .u-avatar-icon`, `-circle img`; Chip image (2); Tag icon/rounded; Terminal command (2); MeterGroup label icon; InlineMessage contrast/secondary icon; Skeleton `[dir=rtl]` | A       | U             | U                 | U                                                                                                                                                                                  | Option-dependent paths exist in the templates; the stories' fixed templates do not exercise them (URL `args` have no effect).                                                                                                            |
| Splitter nested / `[data-resizing]`, ScrollPanel grabbed, Toolbar center, Vue Inplace disabled                                                                                             | B       | U             | U                 | U                                                                                                                                                                                  | Drag, slot or disabled states not present in the stories.                                                                                                                                                                                |

### 2.4 Behaviour sweep (class B)

- **Attribute selectors:** every value-qualified attribute selector that matches an element whose value is `"false"` is the negated form (`:not([data-p-disabled="true"])`, `:not([data-p-active="true"])`). That is correct behaviour.
- **Presence-only selectors:** the only presence-only selector is `.u-step-panel[hidden]`, which matches `hidden=""`. Correct.
- **`pointer-events: none` disabled rules:** these are in Accordion, Inplace, Breadcrumb, Dock, Stepper and Tabs. Every one of those components also has JS guards (1–4 per file) and native or ARIA disabled attributes, so no CSS-only interaction guard was found.
  - Steps carries `pointer-events: auto` (PX-C1) and is protected by its click guard (C1 Spec §17).
- **Result: no class-B defect in shipped G3-A/B/C1 CSS.**

### 2.5 Findings

- **F-1 (A, shipped in G3-C1).** Angular Stepper ships 5 separator rule groups (14, 15, 25, 26, 27) for an element Angular never renders.
  - It contradicts D-G3-3 ("port only groups that correspond to DOM Ultimate renders").
  - The C1 counts are overstated: Angular "79 ported" should be at most 74, plus a consumer-composition caveat.
  - Runtime harm: none (dead CSS, a few hundred bytes).
  - Parity claim: wrong.
  - **Does not block C2. Needs a separate corrective decision** (§8).
- **F-2 (U, G3-A/G3-B).**
  - About 29 G3-A and 4–5 G3-B selector parts per framework have static source evidence only.
  - They are probably correct, but no rendered evidence exists.
  - **Non-blocking.** Decide at GAP-064 closeout whether verification stories are required (§8).
- **G3-B audit result:** no A or B finding.

## 3. Cross-tranche conventions (proposed; not normative until approved)

| #                                                         | Proposed rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Evidence                                                                                                                                                                    | Normative for C2/D/E?                    | Changes an approved decision?                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| **X-1 Selector reachability**                             | Every emitted selector part must, per framework, either (a) match rendered DOM in at least one verification story with its state applied, or (b) appear in a Spec "conditional selectors" table with the emitting source path and why no story exercises it, or (c) be omitted as an FX exclusion. Static fidelity is not reach evidence. Every child combinator (`>`) in a ported Angular selector must be checked for interposed component host elements. Each tranche ships a tranche-scoped reach test (the §2.1 method) next to its fidelity test. | F-1; C1 E2 (old dimming selectors never matched); §4.1 F-3b (Angular hosts defeat `>`)                                                                                      | Yes                                      | Extends C3 and D-G3-3 enforcement. F-1 conflicts retroactively.                  |
| **X-2 DOM-change admissibility**                          | Default: no DOM, class or runtime change (C4). Order of preference: (1) wrapper-aware CSS selector mapping; (2) Ultimate-specific classification (D-G3-8, match ≤ ~15%); (3) a narrow DOM exception (Toast A2 precedent), only when the upstream rule cannot apply without a structural element, there is no non-invented CSS alternative, and there is no ARIA, role or API change — each by explicit user ruling.                                                                                                                                     | G3-A A2; C-6; F-3a/F-3b                                                                                                                                                     | Yes                                      | Codifies existing practice; no change.                                           |
| **X-3 State mapping, disabled and interaction**           | Map to the existing Ultimate state carriers. Use value-qualified attribute selectors only (`[data-u-x="true"]`), never presence-only, because both frameworks render the literal `"false"` (§4.1). The disabled base role uses `disabled.opacity` on the element that actually carries the state. Visual parity and interaction parity are verified separately: real pointer plus keyboard. `pointer-events` is never the only guard.                                                                                                                   | Attribute sweep (§2.4, §4.1); PX-C1; JS guards present in every C2 menu                                                                                                     | Yes                                      | Generalises C-1, C-7 and PX-C1; no change.                                       |
| **X-4 Upstream JS / inline roles**                        | Tranche research enumerates **every** upstream runtime styling responsibility from the pinned PrimeVue/PrimeNG source: `inlineStyles`, `nestedPosition`, `absolutePosition`, `addStyle`, runtime CSS variables. Each one is classified as (a) CSS keyed on existing state, (b) Ultimate's existing mechanism retained, or (c) an exclusion. Premises about Ultimate's mechanism must be verified in the browser.                                                                                                                                        | C-4 omitted `nestedPosition` (§4.1 F-4c); D-G3-4's premise is false (no Ultimate arrow exists, §4.2)                                                                        | Yes                                      | **C-4's list must be extended** (C2). **D-G3-4 needs a factual correction** (D). |
| **X-5 Overlay-mask base role**                            | Map `.p-overlay-mask` declarations (base module) onto each component's real mask element. Mask animations stay excluded (the FX-B8 precedent).                                                                                                                                                                                                                                                                                                                                                                                                          | Actual mask classes: Dialog/ConfirmDialog `u-dialog-mask u-overlay-mask`; Drawer `u-drawer-mask`; Image `u-image-preview-mask` + `u-image-mask`                             | Yes (D/E)                                | No change (extends PX-B2).                                                       |
| **X-6 Open-state determinism**                            | Open through the real trigger (both frameworks: hover opens, click toggles). Park the pointer at (0,0) before every at-rest screenshot. Wait for the state attribute **and** the computed `display`, then the motion settle. Fixed pointer coordinates for pointer-anchored overlays. Baselines per browser.                                                                                                                                                                                                                                            | §4.1: Firefox keeps pointer residue after navigation (menus open "at rest"); Vue ContextMenu placement is identical across 3×3 runs; heights differ by engine (54 vs 58 px) | Yes                                      | Refines C-10.                                                                    |
| **X-7 Evidence when a screenshot cannot show the change** | A computed-style assertion, declared in the Spec beforehand, is authoritative whenever the change is below tolerance or near-white on white.                                                                                                                                                                                                                                                                                                                                                                                                            | C1 Dock; Tranche 1 RadioButton; Aura's white overlay surfaces (D)                                                                                                           | Yes                                      | No change.                                                                       |
| **X-8 Accessibility**                                     | Keep per-row review. A row is _eligible_ as an upstream-Aura parity exception only when the rule is `color-contrast`, both colours equal resolved upstream Aura tokens, and the element has the same upstream role. Fix the shared `runAccessibilityScan` race before the first interaction-heavy tranche.                                                                                                                                                                                                                                              | C1: 18 rows (`primary.color` on white, 2.53:1); the post-merge "Axe is already running" race                                                                                | Policy: yes. Race fix: **user decision** | No change.                                                                       |
| **X-9 Tooling boundaries**                                | Keep copy-per-tranche plus frozen earlier tooling for C2/D/E (each about a 130-line validator, a 200–290-line port script, a fidelity test, 3 CI steps). Add the X-1 reach test per tranche. Consolidate only at GAP-064 closeout, through its own decision.                                                                                                                                                                                                                                                                                            | Validators differ only in constants (`validate-g3b` vs `validate-g3c1`)                                                                                                     | **User decision**                        | No change.                                                                       |
| **X-10 Size**                                             | C1 E1 is the standard: Angular = sum of per-file gzip over `packages/ng/dist/fesm2022/*.mjs`; Vue = `dist/index.mjs` gzip; both against the tranche's branch point; 15% hard stop. Refresh `PERFORMANCE.md` at closeout.                                                                                                                                                                                                                                                                                                                                | C1 E1 (the Angular barrel excludes style modules)                                                                                                                           | Yes                                      | Formalises E1.                                                                   |
| **X-11 Tokens**                                           | Exact, two-way E3 exception lists. A cross-key reference is ported only if it resolves. No invented tokens. Tranche 1's Ultimate-only token paths are dispositioned at closeout.                                                                                                                                                                                                                                                                                                                                                                        | D-G3-5; C1 "no unresolved references"                                                                                                                                       | Yes                                      | Codifies D-G3-5.                                                                 |
| **X-12 CI evidence**                                      | Per tranche, the authoritative set is listed in §5.3. A tranche is not "CI-verified" by an overall green run, and a red global run is not a failure, as long as the named steps hold.                                                                                                                                                                                                                                                                                                                                                                   | §5                                                                                                                                                                          | Yes                                      | New.                                                                             |

## 4. Targeted fact refresh

### 4.1 G3-C2

| Fact                                                                       | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Affects                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Open/close triggers                                                        | Both frameworks, TieredMenu/Menubar/MegaMenu: **hover sets `data-u-open="true"`; click toggles** (a click after hover closes, a second click opens); Escape closes. Outside click closes TieredMenu/MegaMenu; Vue Menubar stayed closed after Escape. PanelMenu: header click toggles `data-u-expanded`.                                                                                                                                                                                                                                         | X-6, the screenshot plan                                                      |
| **F-3a PanelMenu is invisible (pre-existing, both frameworks)**            | The root list is itself `ul.u-panelmenu-submenu`, and `.u-panelmenu-submenu { display: none }` hides the whole component. The Default story renders 0×0 and a blank screenshot in ng and vue.                                                                                                                                                                                                                                                                                                                                                    | C-6 cannot assume a working before-state; the before baselines would be blank |
| **F-3b Angular TieredMenu and Menubar submenus never show (pre-existing)** | Angular inserts `<u-tiered-menu-sub>` / `<u-menubar-sub>` between `li` and `ul`, so `.u-*-item[data-u-open="true"] > .u-*-submenu { display: block }` never matches. Hover sets `data-u-open="true"`, but the submenu stays `display: none` 0×0 in Chromium, Firefox and WebKit. Angular MegaMenu works; Vue TieredMenu, Menubar and MegaMenu work. Angular PanelMenu has the same host interposition (`u-panel-menu-list`) at every level.                                                                                                      | X-1 host check; the C-4 visibility rule must be wrapper-aware in Angular      |
| **F-3c Angular ContextMenu (pre-existing)**                                | (i) `position()` runs in a `queueMicrotask` before Angular renders the list, so `listRef` is undefined and the menu stays at CSS `top: 0; left: 0`. Seen in 3/3 runs × 3 engines (Global story). (ii) The Default story's non-global trigger listens only on the zero-width `<u-context-menu>` host, so right-clicking the target area never opens it. Vue: correct, deterministic placement at the pointer (`61,46`, inline `top`/`left`) in all engines.                                                                                       | This is a runtime defect, not CSS; C-4 forbids new JS. Needs a decision       |
| **F-3d Angular TieredMenu Popup story**                                    | It has no trigger, so the popup can never be opened from the story (it stays parked off-screen). Vue has no Popup story.                                                                                                                                                                                                                                                                                                                                                                                                                         | Popup open-state screenshots need a story change                              |
| Popup/submenu positioning                                                  | **F-4c:** upstream positions nested TieredMenu/ContextMenu submenus in JS (`nestedPosition()`, with an overflow flip); upstream CSS has no `top`/`left`. Ultimate uses CSS `top: 0; left: 100%`. Menubar's nested placement is in upstream CSS (`left: 100%; top: 0`). Vue submenu boxes are identical across runs; only height differs by engine.                                                                                                                                                                                               | C-4 needs a "nested submenu placement" role                                   |
| `display: block` → `display: flex`                                         | On an open Vue submenu, flex-column + gap only changes the height by the gap (37 → 39 px); widths and order are unchanged. If the `flex-direction: column` group were lost, the items would lay out in a row (192×19).                                                                                                                                                                                                                                                                                                                           | Low risk: port the direction-carrying group and assert `flex-direction`       |
| `data-u-disabled="false"`                                                  | Both frameworks render the literal `"false"` on every enabled item (ng TieredMenu 7, Menubar 8, …; vue similar). They also emit `u-*-item-disabled` only when disabled. Existing selectors are value-qualified, so this is safe.                                                                                                                                                                                                                                                                                                                 | X-3 (no presence-only selectors)                                              |
| JS disabled guards                                                         | Present in every C2 menu file (ng 2–4, vue 1–5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | X-3                                                                           |
| PanelMenu level adaptation                                                 | Vue: `.u-panelmenu > ul.u-panelmenu-submenu > li.u-panelmenu-item > (header-content, ul.u-panelmenu-submenu > li …)`. Angular: the same tree with `u-panel-menu-list` hosts before every `ul`. Header classes are the same at every level. **Feasible without a DOM change**, using level logic based on descendant/`:not()` (top level = `.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item)`), the same in both frameworks. Child-combinator chains would have to differ per framework. Top-level visibility must be redefined (F-3a). | C-6 Option A stands, with these mechanics                                     |
| 🔶 Observation                                                             | A Vue PanelMenu header with `url: '#'` navigated the story iframe when clicked repeatedly. Not verified further; check at C2 research time.                                                                                                                                                                                                                                                                                                                                                                                                      | X-6                                                                           |

### 4.2 G3-D

| Unknown                                        | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ng ConfirmDialog/ConfirmPopup NG0304 (G3 §8.1) | **Resolved:** both stories import `UButton`; no console errors when opened.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Arrow mechanism (D-G3-4)                       | **F-4a:** Ultimate renders **no arrow at all.** There are no `::before`/`::after` rules in either framework's Popover/ConfirmPopup CSS, and no arrow element. Upstream draws arrows with `.p-popover:before/:after` at `left: calc(arrow.offset + arrow.left)`, with `arrow.left` set at runtime. D-G3-4's premise ("Ultimate positions the arrow its own way") is false. Porting the arrow groups would _add_ an arrow that is wrong whenever the popover flips. Decide at D: arrow as a feature exclusion, or not. |
| Masks                                          | Dialog-based: `u-dialog-mask u-overlay-mask`. Drawer: `u-drawer-mask`. → X-5.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Vue Drawer ripple                              | The ripple element is present (1). Ripple stays excluded. ng buttons also contain `u-ripple`.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Story readiness (🔶)                           | Clicking the ng SplitButton raises `NG04002: Cannot match any routes`. The SpeedDial first button was not clickable by Playwright (likely off-viewport). Verify at D research.                                                                                                                                                                                                                                                                                                                                       |
| Angular host interposition                     | None found between upstream-paired elements in the D stories (only `u-button > u-ripple`). Re-check per X-1.                                                                                                                                                                                                                                                                                                                                                                                                         |

### 4.3 G3-E

| Unknown                                                      | Result                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OrderList/PickList Listbox divergence (G3 §3, §5 #9, D-G3-9) | **F-4b:** there is no divergence. Angular **and** Vue render `u-listbox` (OrderList 1, PickList 2), and Vue has used Listbox since `3d33cae`/`f3f15ef`, before `fa5c150`. The research statement was wrong; D-G3-9's "preserve the divergence" bullet is moot. |
| ImageCompare runtime variable                                | Both frameworks set `style.clipPath` directly in JS; no CSS variable. D-G3-4 "keep Ultimate's mechanism" applies; upstream `imagecompare.scope.x` stays unused.                                                                                                |
| Ultimate-specific components                                 | DataView: `u-data-view`, `-list`, `-item` only (no header/content/footer/paginator). Vue OrganizationChart: node, node-content, children. The story id is irregular (`panel-organizationchart--default`). Mapping evidence is deferred to E research.          |
| Story readiness (🔶)                                         | The ng DataView story throws `NG0950: Input is required but no value is available yet`.                                                                                                                                                                        |

## 5. CI signal hygiene

### 5.1 Steps that are red and can mask a new GAP-064 regression

| Step (job)                           | Red because (inherited)                                                                                                                                              | What it would hide                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Lint, Format check (`ci`)            | 60 lint problems, format debt                                                                                                                                        | Lint/format issues in tranche files                                                                 |
| Test (`ci`)                          | `pnpm -r test` bails on React `exports.test.ts` before the themes, ng and vue suites                                                                                 | Nothing that isn't caught elsewhere: **Coverage measurement runs every suite and is green**         |
| Coverage regression check (`ci`)     | React −12.0 and Vue about −11.4 points vs baseline (CI-only; local `coverage:validate` passes). Vue in CI: 81.1% (`fe86fe4`) → 80.8% (`2c8ef45`) → 80.7% (`262cec8`) | Any GAP-064 coverage drop in Vue or React. Angular (88.5%) and themes (99.4%) still pass and guard. |
| Provenance scripts self-tests (`ci`) | 3 tarball-extraction tests fail                                                                                                                                      | A broken new G3 validator self-test (status only; the pass count is visible: 131 → 139)             |
| Provenance validation (`ci`)         | Missing `ng.json` entry for `accordion.spec.ts`                                                                                                                      | A missing tranche provenance entry (status only; each missing file prints its own FAIL line)        |
| Run G3-B verification specs (vue)    | U2                                                                                                                                                                   | Any new Vue G3-B regression. The G3-A/G3-C1 steps are independent and unaffected.                   |
| SSR react / vue                      | Inherited                                                                                                                                                            | Vue SSR regressions from a tranche (ng SSR is green)                                                |
| SAST, dependency scan, Release       | Inherited                                                                                                                                                            | Not GAP-064 signals                                                                                 |

**Coverage drift, enough to decide:** the 11-point gap is environmental (CI vs local), and the run-over-run drift (−0.4 points over G3-B and C1) is small. Because the gate is already failing, it **cannot** detect a GAP-064 coverage regression for Vue. Whether G3 code contributes to the drift is undetermined; not pursued (out of scope).

### 5.2 Green steps that do guard GAP-064

Build; Typecheck; **Coverage measurement** (every unit suite, including the G3 fidelity/runtime tests: themes 20, ng 93, vue 98 files); Bundle-size regression check (weak, stale Angular baseline); the strict Playwright projects (ng, vue, react); accessibility baseline validation; the G3-A and G3-C1 steps (both frameworks); the G3-B step (ng); ng SSR.

### 5.3 Proposed authoritative evidence per future tranche (X-12)

1. **CI (named steps must be green on the merge commit):** Build, Typecheck, Coverage measurement, the strict Playwright run (all 3 frameworks), accessibility baseline validation, the new tranche's verification + differential accessibility steps (ng, vue), and the steps of all earlier tranches except the known vue G3-B (U2) step.
2. **Log-level checks (no status signal):**
   - Provenance validation lists **only** the `accordion.spec.ts` FAIL line.
   - The provenance self-test pass count rises by the new tests, with exactly 3 failures.
   - Lint on the tranche's changed files is clean (local `eslint <files>`).
3. **Local, recorded in the closeout:** `coverage:validate` for ng/vue/themes; the Docker tranche run plus the full regression run; the X-1 reach test; the X-10 size measurement.

## 6. Follow-up classification

| Item                                                                                                      | Class                                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **F-3a/b/c/d** (pre-existing C2 defects)                                                                  | **Blocks C2 as currently designed — user decision** (§8)                                                                |
| Axe "already running" race                                                                                | **Blocks future parity work** (interaction-heavy scans in C2/D) — user decision on a fix (X-8)                          |
| **F-4a/b/c** (research premises wrong or incomplete)                                                      | **User decision** (corrections to D-G3-4, D-G3-9, C-4)                                                                  |
| **F-1** (ng Stepper dead separator groups)                                                                | Separate corrective decision; non-blocking for C2                                                                       |
| U2 (Vue Card CDN)                                                                                         | Independent, but masks the Vue G3-B signal; recommended before the next implementation tranche (separate authorization) |
| `ng.json` `accordion.spec.ts` entry                                                                       | Independent, masks the provenance signal; recommended before the next implementation tranche (separate authorization)   |
| F-2 (unexercised conditional selectors)                                                                   | Before closeout only (decide whether verification stories are needed)                                                   |
| U1 ScrollPanel story; Vue BlockUI story; Tranche 1 #3 (IconField/InputGroup NG0304), #4 (FloatLabel)      | Before closeout only (verification-evidence gaps)                                                                       |
| Tranche 1 #1 (Ultimate-only token paths)                                                                  | Before closeout only (X-11)                                                                                             |
| Tranche 1 #2 (RadioButton tolerance), C1 Dock screenshots                                                 | Independent; feed X-7                                                                                                   |
| Tranche 1 #5/#7 (FileUpload Button/Message, Angular InputNumber parity, Ripple)                           | Independent                                                                                                             |
| Tranche 1 #8 (test observations)                                                                          | Maintenance                                                                                                             |
| Tranche 1 #6 (`PERFORMANCE.md`), #7 React docs, #9 `MIGRATION.md` wording, the BLUEPRINT `Status:` header | Documentation / maintenance                                                                                             |
| D/E story readiness (SplitButton NG04002, SpeedDial trigger, DataView NG0950)                             | Independent now; resolve at D/E research                                                                                |
| Angular Stepper renders no separators; Breadcrumb home item has no disabled class                         | Independent pre-existing feature gaps (outside GAP-064)                                                                 |
| Global CI debt (lint, format, React exports, SAST, SSR react/vue, Release, coverage env gap)              | Independent of GAP-064 (X-12 works around it)                                                                           |

## 7. Recommended execution sequence after this study

1. **User decisions** on X-1..X-12 and §8 items D-1..D-8.
2. **C2 readiness, separately authorized, only what D-3 decides.** Recommended split:
   - **CSS-level pre-existing defects (F-3a, F-3b):** fixed _inside_ the C2 port as recorded pre-existing-defect corrections. The wrapper-aware visibility mapping and PanelMenu top-level visibility are part of the port anyway, so there is no separate CSS pass. Before-baselines record the broken state as evidence, not as the acceptance target.
   - **Runtime/story defects (F-3c ContextMenu positioning and trigger, F-3d Popup story trigger):** a small, separately specified bug-fix step _before_ C2 implementation, because C-4 forbids new JS inside the port.
   - Optionally in the same window, each separately authorized: the Axe race fix, U2, the `ng.json` entry, and the F-1 correction.
3. **G3-C2:** a short research addendum applying the approved conventions (C-4 extension with nested placement and wrapper-aware rules; C-6 mechanics; X-6 screenshot plan), then Spec → Spec Review → Plan → Plan Review → implementation → verification → closeout.
4. **G3-D:** research (correct D-G3-4 per F-4a; X-5 masks; story readiness), then the full gate cycle.
5. **G3-E:** research (correct D-G3-9 per F-4b; Ultimate-specific mapping; DataView NG0950), then the full gate cycle.
6. **GAP-064 closeout:** F-2 decision; U1, BlockUI, Tranche 1 items; tooling consolidation (X-9); `PERFORMANCE.md`; full regression; RESOLVED decision.

The order C2 → D → E stands. No tranche depends on another, and D/E-specific decisions (X-5, F-4a, F-4b) can wait for their own research.

## 8. Findings that require a user decision

- **D-1 — Approve, amend or reject conventions X-1..X-12.**
- **D-2 — F-1:**
  - (a) a corrective change reclassifying the Angular Stepper separator groups as FX (removed from the ng CSS and fidelity data, counts corrected);
  - (b) keep them, recorded as "consumer-composable", with a verification story;
  - (c) leave them as-is and record only.
  - Recommendation: (a), in a small corrective step, any time before closeout.
- **D-3 — F-3 disposition (pre-existing C2 defects):**
  - (i) CSS-level fixes inside C2, runtime/story fixes as a separate pre-C2 step (recommended);
  - (ii) everything inside C2 (needs a C-4 / "no new JS" exception);
  - (iii) port the CSS over the broken behaviour and record exceptions (not recommended: the open-state evidence would be meaningless for Angular TieredMenu, Menubar, PanelMenu and ContextMenu).
- **D-4 — C-4 extension:** add "nested submenu placement" (upstream `nestedPosition`) and "Angular wrapper-aware visibility" to the approved C-4 roles. State whether overflow flipping is excluded (no new JS) or required.
- **D-5 — Axe race:** fix the shared `runAccessibilityScan` helper before C2 implementation (recommended), or accept retries.
- **D-6 — X-9 tooling:** keep copy-and-freeze through E and consolidate at closeout (recommended), or consolidate now.
- **D-7 — Research corrections for D/E** (can wait until their research, but should be acknowledged): F-4a (no Ultimate arrow; D-G3-4 premise), F-4b (no Listbox divergence; D-G3-9 bullet).
- **D-8 — CI hygiene:** adopt the §5.3 evidence policy (X-12); decide whether U2 and the `ng.json` entry are fixed before C2 implementation (recommended, each separately authorized).

## Gate — what must be decided before G3-C2 Spec work can begin?

1. **X-1** (selector reachability, including the Angular host check and the per-tranche reach test), **X-2**, **X-3**, **X-4**, **X-6** and **X-12**: approved or amended. The C2 Spec cannot define its acceptance criteria without them.
2. **D-3 (F-3 disposition):** where the PanelMenu visibility, Angular wrapper, ContextMenu positioning/trigger and Popup story defects are fixed. This decides whether the C2 Spec describes a port over working components or a port plus defect corrections.
3. **D-4 (C-4 extension):** the C2 Spec's inline-role section depends on it.
4. **D-5 (Axe race) and D-6 (tooling):** the C2 Plan depends on them; they must be decided before the Spec is approved, since the Spec names the accessibility contract and the tooling.

Not required before the C2 Spec: X-5, X-7 (adopt by default at D), X-8's row policy (already practised), X-10, X-11, D-2 (F-1), D-7 (F-4a/b), and U2 / `ng.json` (recommended, not required).

## 9. User rulings (2026-10-06)

The study was accepted as the current research result. The rulings below are recorded as given. The exact normative wording of each approved convention goes through a separate **cross-tranche decision gate**; none of these rulings authorizes implementation, a Spec or a Plan.

1. **X-1 (selector reachability): approved.**
   - Every shipped selector must (1) match rendered DOM in at least one verification story per framework, (2) be explicitly classified as conditional with a documented reason, or (3) be omitted or excluded.
   - Static fidelity to upstream selector text is not evidence of reachability.
   - The rule accounts for framework-generated host elements and combinator relationships.
2. **X-2: approved in principle.**
   - Ruling text: extend the generalized treatment of upstream inline-style roles to the remaining tranches, with the exact normative scope kept explicit in the next decision record.
   - It authorizes no new JavaScript behaviour.
   - **Numbering note (open):** this ruling's text matches the content of the study's X-4 (upstream JS/inline roles). The study's X-2 (DOM-change admissibility) received no explicit ruling. To be resolved at the decision gate.
3. **X-3 (value-qualified state selectors): approved.**
   - No presence-only attribute selectors where the component emits explicit boolean/string values whose semantics matter.
   - Use value-qualified selectors, or equivalent state mappings supported by the rendered DOM.
4. **X-4: approved as an extension of C-4.**
   - C-4 covers nested submenu positioning and Angular host-wrapper-aware submenu visibility.
   - No overflow-flipping behaviour unless separately supported by the pinned upstream behaviour and the Ultimate architecture. The overflow decision stays explicit in the C2 Spec / decision record.
5. **X-12 (CI signal hygiene): approved in principle.**
   - Known red global jobs must not hide new GAP-064 regressions.
   - The authoritative evidence is identified per tranche.
   - Unrelated CI debt is not fixed as part of this work.
6. **X-6: not approved.** Its exact proposed convention, evidence and impact on approved decisions go to a separate decision gate.
7. **X-5, X-7, X-8, X-9, X-10, X-11: no ruling yet.**
8. **F-3, pre-existing C2 defects.**
   - **(A) CSS-level** — F-3a PanelMenu root/submenu visibility, F-3b Angular TieredMenu/Menubar submenu visibility behind the host element:
     - they may be corrected within G3-C2 implementation, only if the C2 Spec identifies them explicitly as **pre-existing defect corrections**, separate from the Prime CSS fidelity port;
     - they are not a justification for DOM changes.
   - **(B) Runtime/story** — F-3c Angular ContextMenu positioning at 0,0, the Angular ContextMenu trigger/listening issue, F-3d the Angular TieredMenu Popup story without a trigger:
     - they require a separate, explicitly authorized corrective step before C2 implementation;
     - they are not solved by adding JavaScript inside the C2 CSS port;
     - C-4 stays in force until separately amended.
9. **F-1: not a C2 blocker.**
   - The five Angular Stepper separator groups (14, 15, 25, 26, 27) are no longer claimed as successfully ported.
   - They are to be recorded as excluded / dead upstream groups in a small corrective documentation decision:
     - Angular does not render the separator elements;
     - the shipped selectors therefore have no runtime reach;
     - this is a fidelity-accounting correction, not a runtime defect.
   - No CSS change unless a separate corrective implementation is authorized.
10. **Follow-ups:** U1, U2, Vue BlockUI, the `ng.json` provenance entry, the Axe race, F-1 and any G3-A/B/C1 correction stay subject to their own decision gates. None is fixed automatically.

**Next gate:** the cross-tranche decision gate (exact convention wording, X-6, the F-1 corrective scope, the F-3c/F-3d runtime-fix scope). Not implementation authorization.

## 10. Cross-tranche decision gate — normative rulings (2026-10-06, user)

These rulings are authoritative for G3-C2, G3-D and G3-E. They supersede the provisional wording in §3 and §9 where the two differ. In particular, §9's numbering note is resolved: the DOM-admissibility rule stays **X-2**, and the inline-style/runtime-role wording belongs under **X-4**. There is no X-13. Conventions without a ruling here (X-5, X-7, X-8, X-9, X-10, X-11) stay proposals until decided.

### X-1 — Selector reachability (approved)

For each tranche and each framework, every selector part a ported style module emits belongs to exactly one class. A selector part is a top-level comma part, read inside its at-rule.

- **R (reached):** matches at least one element in at least one named verification story, with that story's documented state applied.
- **K (conditional):** every class or attribute it needs is emitted by a cited source location under a named state that no story exercises. The tranche Spec lists it with the reason.
- **X (excluded):** not emitted, and recorded as an FX omission (D2).

State pseudo-classes and pseudo-elements are removed before matching. Combinators are evaluated against the actual rendered DOM, including framework-generated host elements such as Angular component hosts. A selector that matches only upstream markup and cannot match Ultimate's rendered DOM is not R evidence. Static textual fidelity to upstream selectors is never reachability evidence.

The tranche-scoped reach test runs inside that tranche's existing verification specs; there is no separate CI step.

### X-2 — DOM-admissibility gate (approved)

> A parity tranche must not introduce, remove, reorder, or structurally alter rendered DOM solely to make upstream CSS selectors match. Existing framework-generated host elements may be accounted for when evaluating selector reachability, but they must not be removed or bypassed by changing component structure. Any DOM change required for behavioral parity must be separately authorized as a runtime/component correction, with its own evidence and scope.

- CSS adaptation to the existing DOM is allowed within a parity tranche.
- A DOM or runtime change is not ordinary CSS parity work and needs separate authorization.

### X-3 — Value-qualified state selectors (approved)

- A selector addressing a state attribute uses the value the component emits, for example `[data-u-open="true"]`, or the corresponding negated value.
- A presence-only attribute selector is allowed only for an attribute the component actually adds or removes entirely, such as `hidden`, with rendered evidence for both states in both frameworks.
- Evidence: both frameworks render the literal `data-u-disabled="false"` on enabled menu items (§4.1).

### X-3b — Disabled appearance vs interaction guard (approved)

The visual disabled state and interaction protection are verified separately. `pointer-events` alone is never treated as the complete interaction guard.

### X-4 — C-4 extension: runtime styling and positioning roles (approved)

Each tranche's research lists every runtime styling or positioning responsibility in the pinned PrimeVue 4.5.5 / PrimeNG 21.1.9 source (`inlineStyles`, `nestedPosition`, `absolutePosition`, `addStyle`, runtime CSS variables). Each one is mapped to CSS keyed on state Ultimate already emits, kept as Ultimate's existing mechanism, or excluded. No new JavaScript or runtime state is introduced by a CSS port.

For **G3-C2**, C-4 covers:

1. submenu visibility;
2. the TieredMenu popup's initial off-screen placement;
3. ContextMenu root positioning;
4. nested submenu placement: upstream `nestedPosition()`'s default result (`inset-inline-start: 100%; top: 0`) expressed in CSS on the existing open state. Upstream's viewport-overflow flip is JavaScript-driven and is not introduced; the C2 Spec states the overflow decision explicitly;
5. Angular host-aware visibility adaptation.

Role 5 is **not** an exclusion or a PX. It is a CSS adaptation to Ultimate's existing rendered DOM, with no DOM change, no JavaScript change and no new runtime state. Where Angular inserts an existing component host between the item and the submenu, selectors account for that host, for example `.u-tieredmenu-item[data-u-open="true"] > u-tiered-menu-sub > .u-tieredmenu-submenu`. Vue keeps the direct-child form where its rendered DOM supports it.

The Angular F-3b corrections are **pre-existing defect corrections inside C2**, not fidelity omissions.

### X-6 — Deterministic open-state screenshots (approved; refines C-10 and D-G3-7, replaces neither)

Applies to every C2, D and E story whose verified CSS is visible only in an open or interaction state.

1. Open through the real trigger, using fixed coordinates where applicable.
2. Park the pointer at (0, 0) before capturing any resting state (this accounts for Firefox pointer residue).
3. Before a screenshot: verify the expected state attribute, verify a non-`none` computed `display` and a non-zero box, and wait for the existing motion-settle period.
4. Keep one baseline per engine × framework. Compare geometry within an engine, never across engines.

### X-12 — Per-tranche CI evidence (approved)

A tranche counts as CI-verified without the whole repository CI being green, when the merge commit's run shows:

- **Green by status:** Build, Typecheck, Coverage measurement; the strict Playwright projects (ng, vue, react) and the accessibility baseline validation; the new tranche's verification and differential accessibility steps (ng, vue); every earlier tranche's steps, except the named pre-existing failure (vue G3-B step, U2).
- **Checked in the logs:** Provenance validation reports no FAIL beyond the named pre-existing one (`accordion.spec.ts`); the provenance script self-tests add the new tests to the pass count, with exactly the 3 named pre-existing failures; Vue and React coverage percentages do not drop run over run by more than the gate threshold.
- **Recorded at closeout:** `coverage:validate`, lint on the changed files, the Docker tranche run, the full regression run, the X-1 reach test, and the size measurement.

Unrelated CI debt is not fixed under this rule. Any change to the named pre-existing failure lists needs a separate decision.

### Corrections and scoped steps

- **G3-C1 Errata E3 (approved, documentation only).** Angular is 74 effective + 5 dead groups (14, 15, 25, 26, 27), instead of 79 effective. Vue is 81 effective, 9 omitted. Recorded in G3-C1 Spec §18, the G3-C1 closeout addendum and `BLUEPRINT_GAPS.md`, together with the corrected GAP-064 `Status:` header. No CSS, `g3c1-port.mjs`, fidelity-data or D2 change. Removing or reclassifying the five groups is a separate implementation decision.
- **D-G3-4 factual correction (recorded, not implemented).** Ultimate renders no popover or confirm-popup arrow (§4.2). The premise "Ultimate positions the arrow its own way" is wrong. The underlying decision (no new JavaScript to reproduce runtime variables) stands. Applied at G3-D research.
- **D-G3-9 factual correction (recorded, not implemented).** There is no OrderList/PickList Listbox divergence: both frameworks render `u-listbox` (§4.3). The "preserve the divergence" statement is obsolete. Applied at G3-E research.
- **C2-0 (approved as a separate corrective step before G3-C2).** A small, separately reviewed Spec and Plan covering only:
  1. Angular ContextMenu positioning after the menu list has rendered, matching the verified PrimeNG 21.1.9 behaviour (`position()` on overlay enter);
  2. the Angular ContextMenu non-global trigger, **Option (b)**: correct the inaccurate doc comment (the promised `target` input does not exist) and the Default story so they use the supported global or host-based trigger. **No new public input or API**;
  3. the Angular TieredMenu Popup story: add a trigger button that calls the existing `toggle(event)`.

  No Vue changes and no CSS changes. F-3a and F-3b stay in the C2 parity work.

### Execution boundary

Not authorized by this gate: the C2 Spec or Plan, a C2 implementation branch, parity CSS changes, removal of the five Angular Stepper dead groups, E3 tooling or fidelity-data changes, and unrelated CI debt. Next: the C2-0 Spec and Plan. The C2 parity Spec begins only after the C2-0 scope and its evidence are settled.

## 11. Amendments from the C2-0 Spec Review (2026-10-06, user)

Append-only. These amend §10 where stated; nothing else in §10 changes.

### X-12 correction — provenance evidence

**Fact.** `scripts/provenance/validate-provenance.mjs` calls `process.exit(1)` on the first source file without a manifest entry. At `95f3c65`, 362 Angular and 473 Vue source files have no entry; `packages/ng/src/accordion/accordion.spec.ts` is only the first one the validator reaches. Its output cannot establish completeness for any file.

**Corrected X-12 provenance clause** (replaces "Provenance validation reports no FAIL beyond the named pre-existing one" in §10 X-12):

1. **Repository-wide provenance validation** (`provenance:validate`) is classified as **pre-existing debt**. It is red, it is expected to stay red, and its output is not tranche evidence. The tranche does not fix the validator or the missing entries.
2. **Tranche-level changed-file provenance completeness** is the authoritative provenance evidence: every source file the tranche changes has a matching `ultimateDestination` entry in `docs/architecture/provenance/{ng,vue}.json`. It is verified directly over the tranche's changed-file list (relative to the tranche's branch point) and recorded at closeout.

The repository-wide validator is never claimed to establish completeness.

### Pre-existing defect recorded (separate decision, Angular + Vue together)

**TieredMenu popup mode has no positioning, in Angular or Vue.**

- `toggle()` and `show()` take no event.
- `.u-tieredmenu-overlay { top: -9999px; left: -9999px }` is only an off-screen initial CSS position; no anchoring logic exists.
- Verified: after `toggle()`, the Angular popup renders at (−9999, −9999) in Chromium, Firefox and WebKit.
- A story-only trigger cannot make the popup visibly positioned.

Removed from C2-0 (OI-1 = (b)). Not implemented. A future decision treats both frameworks together.

### Known divergence recorded (follow-up)

**Angular ContextMenu placement is not scroll-aware.** PrimeNG 21.1.9's flip/fit uses `document.scrollingElement` scroll offsets. Ultimate compares `pageX`/`pageY` with `innerWidth`/`innerHeight` and clamps at 0. C2-0 is timing-only (OI-2) and keeps Ultimate's algorithm unchanged.

### G3-C research factual correction (OI-4)

The G3-C research statement (`2026-10-05-gap-064-g3c-menus-navigation-research.md` §3.1) that Ultimate positions the TieredMenu popup in JavaScript is false for both Angular and Vue. The current implementation uses the off-screen CSS position and contains no popup anchoring logic. Documentation correction only.

### E3 accounting revised (E3a)

Finding F-1 (§2.5) and the E3 correction (§10) classified Angular Stepper groups 14, 15, 25, 26 and 27 as dead. The C2-0 final review showed that the exported `UStepperSeparator` can be placed by consumers. G3-C1 Spec §18 **E3a** reconciles these groups with ADR-052 X-1: groups 15, 25, 26 and 27 are **K** (a consumer-placed `UStepperSeparator`), and group 14 is **X-shipped** (unreachable under supported composition). Only group 14 remains a removal candidate.
