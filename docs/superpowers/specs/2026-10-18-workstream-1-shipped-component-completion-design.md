# Specification: Workstream 1 — Shipped-component completion (behaviour, visual parity, accessibility, React Aura tokens)

**Document:** `docs/superpowers/specs/2026-10-18-workstream-1-shipped-component-completion-design.md`
**Status:** DEFERRED — suspended indefinitely (user, 2026-10-19). No further implementation is authorized. Resuming needs a new explicit authorization; the work may be discontinued in the planned restructuring. Shipped: W1 (PR #39, merge 4a426b34; PR #40, merge 94807833). See COMPLETION_REGISTER "Deferred (suspended) work". (Previously: APPROVED (user, 2026-10-18), including decisions D1 and D2 as written. D1 is recorded as ADR-067. An independent Spec Review and its re-review (both "approve with changes") were applied first; see §11. This approval authorizes Plan authorship only. It does not authorize implementation, baseline changes, merges or dispatch.)
**Baseline:** `origin/main` at `c77173ef` (2026-10-18).
**Origin:** the 2026-10-17 remaining-work audit and the two-workstream consolidation the user accepted. Workstream 2 (release, CI and tooling) has its own Spec, [`2026-10-17-workstream-2-release-ci-tooling-design.md`](2026-10-17-workstream-2-release-ci-tooling-design.md).
**Register rows:** C05 (parity defects); C08 (accessibility for shipped components); the React part of GAP-064 (Aura tokens); C04 (provenance, coordinated here but not owned).

---

## 1. Intent

The first pre-1.0 publish (ruling S-1) needs every **already shipped** component to behave, look and announce itself as its Prime baseline does, under the Aura theme, in all three frameworks.

Three bodies of work touch the same components:

- the open defect gaps;
- the accessibility fixes and dispositions ADR-053 requires;
- React's missing Aura token consumption.

They share one verification method (the Parity Playbook, visual baselines and the axe baseline) and the same human visual acceptance. This Specification groups them into family waves, so each family is built, verified and accepted once.

## 2. Goals, non-goals, anti-goals

**Goals**

- **G1.** Every open C05 defect gap in §4 is fixed.
- **G2.** ADR-053's dispositions for shipped components are met:
  - the C08-required gaps (GAP-086, 100, 111, 112, 123) are fixed;
  - the gaps ADR-053 marks "fix" (GAP-114, 115, 122) are fixed;
  - the 19 critical axe rows are fixed: `label` ×10 on Checkbox and `aria-required-children` ×9 on Table;
  - the `svg-img-alt` ×7 and `scrollable-region-focusable` ×3 rows are fixed;
  - the `color-contrast` candidates are tested against AC-3a. Each is either fixed or given a publish-level exception that the user approves explicitly.

  Only GAP-103 and GAP-104 may instead take an approved exception. GAP-116 keeps its existing exception, EX-3.

- **G3.** Every React style module whose component has a module in Ultimate's Aura preset (`packages/themes/src/presets/aura`) consumes Aura tokens, subject to decision D1. Modules that already resolve are left alone.
- **G4.** Provenance stays truthful for every production file a wave changes, under ADR-052 X-12(2) as re-scoped by ADR-062, and GAP-094 §3.4.

**Non-goals**

- New components or catalogue expansion (C02, C06, C07; see §8).
- Package names (C03 / N-1).
- Release (Workstream 2).
- Stage 2 performance thresholds.
- High-contrast/RTL research (ADR-053 AC-8, §8).

**Anti-goals** (failures even if every check passes)

- Weakening any CI gate or baseline.
- Removing an axe baseline row by hand. A row goes only when a real scan no longer reports it.
- Re-baselining visual screenshots without the user's acceptance for that wave.
- Bundle optimisation driven by the P2 tree-shaking findings.

## 3. Binding inputs (cited, not restated)

| Source                                                                                                          | Relied on for                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`PARITY_PLAYBOOK.md`](../../architecture/PARITY_PLAYBOOK.md)                                                   | Per-component parity method and evidence                                                                                                                                                                                     |
| ADR-052 (X-1–X-6 port rules; X-12 tranche evidence) and ADR-062 (production scope)                              | Parity rules; changed-file provenance completeness                                                                                                                                                                           |
| ADR-053 (AC-1–AC-8; per-row dispositions; EX-3)                                                                 | Accessibility acceptance                                                                                                                                                                                                     |
| ADR-051 (style key equals preset key; React carve-out)                                                          | Token wiring; D1 extends it to React                                                                                                                                                                                         |
| `PROVENANCE.md` pinned sources (`vendor-snapshot.mjs`); ADR-064; ADR-065                                        | Admissible sources: `@primeuix/styles@2.0.3`, with no PrimeReact theme CSS (ADR-065)                                                                                                                                         |
| The GAP-094 Specification §3.4 and ADR-061                                                                      | Separate manifest-only batch PRs; `PROVENANCE.md` disclosure                                                                                                                                                                 |
| ADR-063                                                                                                         | Box model                                                                                                                                                                                                                    |
| Phase 10 Track B Spec, R6 "deliberately accepted size changes" (line 185)                                       | Intentional size growth                                                                                                                                                                                                      |
| The Workstream 2 drift contract (W2-B4-R3 A1)                                                                   | Metadata records follow public API changes                                                                                                                                                                                   |
| The user's Toolbar ruling, 2026-10-17 (Workstream consolidation: "React Toolbar: Option B is already approved") | React Toolbar is rewritten from the `@primeuix` structure with Aura tokens. This disposes of the `toolbar-style.ts` hold under GAP-094 (the `lara-light` combination). This Specification is the ruling's repository record. |

## 4. Verified scope (at `c77173ef`)

Gap statuses come from `BLUEPRINT_GAPS.md`. The axe baseline and the React, ng and Vue styles are unchanged since the 2026-10-17 audit; since `f5a0f138` the source trees gained only generated `.api.mdx` pages. React token resolution was re-verified against the built Aura preset during Spec Review.

React registers tokens with `registerThemeVariables(componentName)`, which calls `Theme.getComponent(componentName)` with no key normalisation. A React module therefore resolves only if its `componentName` equals an Aura preset key.

### Waves

**Bold** gaps are required by C08 or marked "fix" by ADR-053.

#### W1 — Toolbar (pilot)

- **Gaps and accessibility:** none. This wave carries the Toolbar ruling.
- **React modules:** `toolbar` reads the wrong variable names (`--u-toolbar-bg` and `-border`, where Aura defines `-background` and `-border-color`).

#### W2 — Menus and navigation

- **Gaps:** 084, 085, **086**.
- **Accessibility:** `color-contrast` rows on ng/Vue Tabs, Steps and Stepper.
- **React modules:**
  - layout-only (no visual CSS yet): `menu`, `menubar`, `mega-menu`, `tiered-menu`, `context-menu`, `panel-menu`, `breadcrumb`, `steps`, `stepper`;
  - wrong variable names: `tabs` (reads `--u-tabview-*`);
  - hard-coded colours: `dock`.

#### W3 — Overlays and feedback

- **Gaps:** 096, 099, **100**, 101.
- **Accessibility:**
  - `svg-img-alt` on React/Vue Dialog;
  - `color-contrast` on ng Message and Vue InlineMessage.
- **React modules:**
  - layout-only: `dialog`, `drawer`, `popover`, `confirm-dialog`, `confirm-popup`, `tooltip`;
  - wrong names, partial (6 of 12 variables resolve): `toast`, `message`;
  - hard-coded colours: `block-ui`, `speed-dial`.

#### W4 — Media

- **Gaps:** 102–110, **111**, **112**, 113, **114**, **115**. GAP-116 stays under EX-3.
- **Accessibility:** none beyond the gaps.
- **React modules:**
  - wrong variable names: `galleria`;
  - already resolves: `carousel` (counted under §4 "Already resolve");
  - hard-coded colours: `image`.

#### W5 — Data and lists

- **Gaps:** 117–121, **122**, **123**, 124 (finish), 125–130.
- **Accessibility:**
  - `aria-required-children` ×9 on Table (ng/React/Vue × default, paginated and sorted);
  - `scrollable-region-focusable` ×3 on Scroller (ng/React/Vue).
- **React modules:**
  - layout-only: `order-list`, `pick-list`, `data-view`, `organization-chart`;
  - hard-coded colours: `listbox`;
  - wrong variable names: `timeline`.

#### W6 — Forms and display

- **Gaps:** none.
- **Accessibility:**
  - `label` ×10 on Checkbox (ng ×1, React ×4, Vue ×5);
  - `svg-img-alt` on React/Vue Button (loading state) and React/Vue Checkbox;
  - `color-contrast` on ng Badge and ng/Vue Button.
- **React modules:**
  - **Hard-coded colours:** `autocomplete`, `cascade-select`, `color-picker`, `date-picker`, `file-upload`, `float-label`, `icon-field`, `input-chips`, `multi-select`, `password`, `rating`, `select`, `select-button`, `slider`.
  - **Wrong variable names:** `chip`, `inplace`, `meter-group`, `progress-bar`, `progress-spinner`, `scroll-panel`, `skeleton`, `splitter`, `tag`, `terminal`.
  - **Layout-only:** `avatar`, `button`, `checkbox`, `knob`, `radio-button`, `split-button`, `toggle-button`.
  - **Key fixes:** the module registers under a key Aura doesn't define. An additional key only registers variables; it never registers structural CSS or box-model roots. Those stay under the module's own key.

    | Module           | Registers as     | Fix                                                                                                        |
    | ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
    | `input-text`     | `input-text`     | Primary key `inputtext`                                                                                    |
    | `input-number`   | `input-number`   | Primary key `inputnumber`, plus a variables-only key `inputtext`                                           |
    | `input-mask`     | `input-mask`     | Keep `input-mask`, so it doesn't share structural CSS with InputText. Add a variables-only key `inputtext` |
    | `input-otp`      | `input-otp`      | Primary key `inputotp`, plus a variables-only key `inputtext`                                              |
    | `input-textarea` | `input-textarea` | Primary key `textarea`, and rename its `--u-inputtext-*` reads to `dt('textarea.*')`                       |
    | `input-switch`   | `input-switch`   | Primary key `toggleswitch`, plus a layout-only port, because it reads no variables yet                     |

The Plan may split a wave into several PRs if one PR would be too large to review. The wave scope and its single acceptance stop do not change.

### React modules outside the waves

React has 83 style modules.

- **Already resolve (7):** accordion, card, carousel, divider, fieldset, panel, paginator. No token change. Paginator composes `@ultimate/uix-styles/paginator`.
- **Resolves only conditionally:** `avatar-group` resolves only when a `UAvatar` on the same page has registered `avatar`.
- **D1(c) exceptions, no module in Ultimate's Aura preset (8):**
  - `mention`, `multi-state-checkbox`, `tri-state-checkbox`, `data-scroller`, `button-group`, `scroll-top`;
  - `scroller` and `table`, whose upstream `virtualscroller` and `datatable` modules were placed out of scope by an earlier GAP-064 decision.

  These keep their CSS and are listed as exceptions. The earlier out-of-scope decision is not reopened.

### ng/Vue GAP-064 residual (D2)

These style modules do not call `dt()`:

- **ng (16):** avatar-group, badge, button-group, button, checkbox, dialog, dynamic-dialog, input-mask, input-number, input-text, menu, paginator, scroll-top, scroller, table, tooltip. Most are proof-set modules composing `uix-styles`.
- **Vue (7):** avatar-group, button-group, dynamic-dialog, input-mask, scroll-top, scroller, style-class.

### GAP-064 recorded follow-ups (D2)

- Tranche 1 follow-ups 1–9 (`BLUEPRINT_GAPS.md` around line 1111);
- G3-B follow-ups U1, U2 and the Vue BlockUI story (around line 1138);
- G3-C1 follow-ups (around line 1164).

## 5. Requirements

- **W1-R1 — Waves.**
  - The waves run in order, W1 to W6.
  - Each wave covers its family's ng/Vue defect fixes, React token work and accessibility work.
  - Changed visual baselines are regenerated in the Docker CI environment of record.
  - Each wave stops for the **user's visual acceptance** before merge, as in G3 practice. Publish-level `color-contrast` exceptions are decided at that same stop.
  - W1, the pilot, must prove two things on one module before W2 starts: the React token pattern, and the handoff from source PR to manifest batch.
  - The Plan's first task classifies every §4 GAP-064 follow-up for D2.
- **W1-R2 — Defect fixes.**
  - Each gap is fixed to the "Expected state" recorded for it in `BLUEPRINT_GAPS.md`, using the Parity Playbook method and ADR-052's X-1–X-6 port rules.
  - If a fix needs a contract or behaviour decision that the gap text does not settle, the wave stops and reports it rather than choosing one.
- **W1-R3 — React tokens** (once D1 is decided).
  - React CSS reads tokens through `dt('<presetkey>.<path>')`, rendered by `renderCss` in `react-core`, the same mechanism React paginator and scroller already use.
  - **Layout-only modules:** port the visual CSS from the pinned `@primeuix/styles@2.0.3` component style. Use no PrimeReact theme CSS (ADR-065). New provenance entries are classified per ADR-064.
  - **Wrong-name and hard-coded-colour modules:** replace them with the `dt()` paths.
  - **Key fixes:**
    - register under the preset key;
    - multi-key modules also need a `react-core` equivalent of Vue's `additionalPresetKeys` (`vue-core/src/styling/vue-style-sheet.ts`), used for variables only.
  - **Fallbacks:** no colour fallbacks, so that missing tokens show up in tests.
  - Modules that already resolve, and D1(c) exceptions, are not changed.
- **W1-R4 — Accessibility.**
  - Each wave fixes its G2 items.
  - Baseline rows are removed only when a real scan no longer reports them.
  - Each required fix carries a dated manual assistive-technology check (ADR-053 AC-7).
- **W1-R5 — Provenance.**
  - **Wave PRs:** they add no manifest entries for files in the GAP-094 backlog. A wave that incorporates Prime-derived source updates `PROVENANCE.md` (ADR-061).
  - **Batch PRs:** after a wave merges, a separate **manifest-only batch PR** classifies that wave's backlog files against their fixed content (ADR-064/065).
  - **New files:** a file a wave creates gets its manifest entry in the same PR.
  - **Closure:** a wave counts as closed only once its batch PR has merged and changed-file completeness is recorded (ADR-052 X-12(2)).
- **W1-R6 — Metadata and size.**
  - Any public API change on a component with a metadata record (button, checkbox, dialog, menu, paginator, scroller, table, tooltip) updates the record, its `metadataVersion` and the generated artifacts, so the drift check stays green.
  - If the new React token CSS pushes a package past R6's 15% limit, the wave uses the Track B accepted-growth procedure. The gate itself is never changed.
- **W1-R7 — Closeout and tracking.** The tracking edits go in the wave's batch PR:
  - set each fixed gap RESOLVED, citing its PR and CI run;
  - update C05 and C08 in the register, and add GAP-085 to C05's list;
  - enter each approved AC-3a or GAP-103/104 exception as one row in `BLUEPRINT_GAPS.md` §10, the G14 exception register, as ADR-053 requires. The D1(c) exceptions are recorded in the D1 ADR;
  - for W1, correct ROADMAP footnote 1, which is stale now that paginator and scroller source from `uix-styles`.

  No separate closeout documents.

## 6. Acceptance

| ID  | Criterion                                                                                                                              | Evidence                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A1  | Every §4 gap is RESOLVED, except GAP-103 and GAP-104, which may instead hold an approved exception                                     | Implemented, Verified (Playbook evidence for each gap)       |
| A2  | All G2 axe items are fixed on a real scan, or hold a user-approved AC-3a exception; each required fix has an AC-7 manual check         | CI-enforced (accessibility baseline step); dated AC-7 record |
| A3  | Each in-scope React module renders Aura values through `dt()`, confirmed in a browser                                                  | Verified per wave; visual baselines CI-enforced              |
| A4  | The user accepted each wave before merge                                                                                               | Recorded acceptance                                          |
| A5  | Each wave's production files carry truthful manifest entries, and the GAP-094 missing count drops by exactly that wave's backlog files | CI (`provenance:validate`) and the X-12 record               |
| A6  | The drift check is green, and no CI gate or threshold is weakened                                                                      | CI-enforced                                                  |

## 7. Order and dependencies

```text
D1 + D2 decided ──► W1 (pilot) ──► W1 batch ──► W2 ──► W2 batch ──► … ──► W6 ──► W6 batch
```

- **Independence.** Workstream 1 depends on neither Workstream 2 nor C02, because it covers only shipped components.
- **CI comparison.** Wave PR CI is compared with `main` by failure lines. `main` currently carries two red steps (CI run 39114053334 at `c77173ef`):
  - "Provenance validation", the GAP-094 backlog;
  - the accepted `component-metadata` R6 regression, which clears when the Workstream 2 size-baseline PR lands.

## 8. Accounted for elsewhere

| Item                                                                                                                                                              | Next gate                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| C02 component list (GAP-017/040), including missing React/Vue counterparts: React Badge, Messages, SlideMenu; Vue Fluid, CheckboxGroup, RadioButtonGroup, TabMenu | Verification/research of the framework inventories                      |
| C06: Tree → TreeSelect → TreeTable → Angular OrganizationChart                                                                                                    | Tree Specification (ADR-054), after C02                                 |
| C07: Chart and Editor                                                                                                                                             | Optional-peer policy-enforcement Specification (ADR-055), after C02     |
| ADR-053 AC-8, high-contrast and RTL                                                                                                                               | Its research spike                                                      |
| GAP-094 batches for files no wave touches                                                                                                                         | The existing GAP-094 Specification; each batch is authorized separately |
| Doc gaps 001, 002 and 016; GAP-011; deferred 012, 021, 026; missing GAP-008                                                                                       | Unchanged                                                               |

## 9. Decisions required

- **D1 — React token consumption.**
  - **Why it is needed.** GAP-064 excludes React "unless that exception is revisited". ADR-051 says React is unaffected, and rejected key normalisation partly to keep React out.
  - **Proposed:**
    - (a) React consumes Aura tokens for every module that has a module in Ultimate's Aura preset (`packages/themes/src/presets/aura`).
    - (b) React registers under the preset key, with multi-key support in `react-core`.
    - (c) The eight modules listed in §4 keep their CSS as recorded exceptions.
    - (d) This is recorded as an ADR that amends ADR-051's React carve-out.
- **D2 — C05 exit criterion** (the register's open C05 decision).
  - **Proposed:** every §4 gap is contract-affecting for the first publish. GAP-064 exits when both hold:
    - each comparable ng/Vue/React style module consumes Aura tokens or is a recorded exception: the listed proof-set `uix-styles` modules, modules with no upstream style, and D1(c);
    - each recorded GAP-064 follow-up is in a wave, is a recorded exception, or is confirmed closed (W1-R1).

## 10. Next gate

**Decided 2026-10-18 (user):** D1 (recorded as ADR-067) and D2, as written in §9.

The user approves this Specification, including D1 and D2. An Implementation Plan follows via `superpowers:writing-plans`, then Plan Review.

## 11. Spec Review log

**2026-10-18, independent review: approve with changes.** Applied:

- **Critical-row ownership.** Checkbox `label` goes to W6 and Table `aria-required-children` to W5.
- **React resolution groups corrected.**
  - Verified against the built preset: `componentName` must equal the preset key.
  - Six key fixes added.
  - Paginator moved to "already resolves"; avatar-group marked conditional; data-scroller made a D1(c) exception.
  - All eight no-module exceptions listed.
- **ADR-053 dispositions assigned:** `svg-img-alt`, `scrollable-region-focusable`, the `color-contrast` AC-3a decisions, the AC-7 manual checks, and "fix" for GAP-114, 115 and 122. G2's exception wording narrowed. AC-8 listed in §8.
- **X-12(2) closure rule.** A wave closes only once its batch PR has merged.
- **Corrections.** Source-boundary citation; Toolbar ruling date and source; D1 premise (GAP-064 plus ADR-051, not ROADMAP footnote 1); `dt()` mechanism and `react-core` multi-key need; residual modules named; follow-ups added to D2.

**Re-review (approve with changes): applied.** The `input-mask` key is kept, with variables-only extra keys; `input-textarea` and `input-switch` gain renaming and porting notes; §10 exception-register entries are added; the double-counted carousel is marked; the A5 wording is fixed.

**Not reopened.** The `datatable`/`virtualscroller` ports stay out of scope under their earlier decision, and are recorded as D1(c) exceptions.
