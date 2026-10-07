# Specification — GAP-064 G3-D: Overlays and Composites (ConfirmDialog, ConfirmPopup, Drawer, Popover, SplitButton, SpeedDial) Use Their Aura Tokens

**Date:** 2026-10-07
**Branch:** `feature/gap-064-g3d-overlays-composites` (from `main` `c567039`, with the G3-D research `4eaceb3` merged)
**Status:** **Approved** (Spec Review, user, 2026-10-07; OI-D1..OI-D4 resolved in §16). Implementation needs an approved Plan.
**Governing records:**

- ADR-052 (normative: X-1, X-2, X-3, X-3b, X-4, X-6, X-12), ADR-051, ADR-048, D-G3-1..9 (D-G3-4 and D-G3-9 as corrected by the cross-tranche study §10).
- G3-B ruling B-2 (base-style roles in component-local CSS) and the G3-B ruling that PrimeNG-local CSS appended after the `@primeuix/styles` import is not baseline.
- G3-D research `docs/architecture/research/2026-10-07-gap-064-g3d-research.md` (`4eaceb3`) and the user's G3-D decisions D-D1..D-D7 (2026-10-07, §2).
- D-0 (`c567039`) is a **completed prerequisite**, not part of this Spec's scope.

**Baseline (ADR-048):** `@primeuix/styles` 2.0.3, `@primeuix/themes` 2.0.3, PrimeNG 21.1.9, PrimeVue 4.5.5.

## 1. Purpose and scope

G3-D is the fourth G3 tranche (D-G3-6: F3 Overlays + F8 Composites). Each of the six Angular and six Vue style modules gets the applicable `@primeuix/styles` 2.0.3 structural CSS, mapped onto the existing Ultimate DOM, so the components take their Aura tokens.

In scope:

1. **Fidelity port:** 34 of 77 upstream rule groups per framework (D1), with 43 recorded omissions (D2). See §5.
2. **Style-key renames (ADR-051, D-G3-1):** 8 sites (§3.1; Angular 4, Vue 4).
3. **Base-style roles (B-2), runtime-role CSS (ADR-052 X-4) and the approved adaptations (D-D2, D-D3a, D-D7):** §6. No new JavaScript or runtime state.
4. **Pre-existing defect corrections that the CSS port itself performs, kept separate from fidelity (§7).**
5. **Verification:** verification-only stories, screenshots, layout and computed-style checks, the X-1 reach test, a G3-D differential accessibility validator, and the retry-aware evidence rule (§9).
6. **Provenance, `MIGRATION.md` and the size gate.**

Out of scope: §13.

## 2. Decisions this specification implements

| Decision                               | Applied as                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ADR-052 X-1                            | Every emitted selector part is R, K or X per framework (§5, §9.4), with Angular hosts and interposed elements accounted for.                                                                                                                                                   |
| ADR-052 X-2                            | No DOM, template, class, input or runtime change. Only CSS, the registered key, stories, tests and documentation change.                                                                                                                                                       |
| ADR-052 X-3                            | State is selected through emitted classes or native states (`.u-speeddial-open`, `.u-drawer-position-<pos>`, `:disabled`). No attribute selector is used where an equivalent class exists.                                                                                     |
| ADR-052 X-3b                           | Disabled appearance (§6.1) and interaction protection (native `disabled`, existing guards) are verified separately (§9.3).                                                                                                                                                     |
| ADR-052 X-4                            | Runtime roles R-1..R-4 (§6.2).                                                                                                                                                                                                                                                 |
| ADR-052 X-6                            | Open states are captured through real triggers with pointer parking and readiness checks (§9.2).                                                                                                                                                                               |
| ADR-052 X-12                           | CI evidence set and changed-file provenance completeness (§10, §11).                                                                                                                                                                                                           |
| D-G3-1 / ADR-051                       | Renames (§3.1); selectors adapted to existing DOM (§4).                                                                                                                                                                                                                        |
| D-G3-3                                 | Unreachable groups are omitted with an FX tag (§5); never counted as ported.                                                                                                                                                                                                   |
| D-G3-4 (corrected, F-4a)               | No arrow; no JavaScript for runtime variables.                                                                                                                                                                                                                                 |
| D-G3-5 / D-G3-8                        | No new tokens; literals mapped only with same-role Aura evidence (§6.3, D-D3c).                                                                                                                                                                                                |
| D-G3-9                                 | Per-framework adaptation (SplitButton host, Drawer wrapper, Vue native ConfirmPopup/ConfirmDialog buttons).                                                                                                                                                                    |
| B-2                                    | Base `.p-overlay-mask` / `.p-disabled` declarations in component-local CSS where Ultimate's DOM expresses the state (§6.1).                                                                                                                                                    |
| **D-D1 = A**                           | Angular Popover/ConfirmPopup anchoring was fixed in D-0 (`c567039`). Not reopened; D-0's tests are regression checks (§9.5 AC10).                                                                                                                                              |
| **D-D2 = A**                           | ConfirmDialog group 1 reaches the rendered dialog through `.u-dialog-content:has(> .u-confirmdialog-message)` (§4). No DOM or runtime change.                                                                                                                                  |
| **D-D3a**                              | SpeedDial open state uses `:has(...)` (§4).                                                                                                                                                                                                                                    |
| **D-D3b = A**                          | SpeedDial circle-type group omitted (FX-D8); broken fan-out is a follow-up gap (§13).                                                                                                                                                                                          |
| **D-D3c = B conditionally → fallback** | Gate run at Spec time (§6.3): the Aura `button.*` tokens have the right roles but are **not defined** on SpeedDial pages, so the mapping is not supported. Existing Ultimate-only action styling is retained; the unstyled native trigger is accepted parity difference PX-D3. |
| **D-D4 = B**                           | No Drawer backdrop or modal semantics. SpeedDial's mask gets the B-2 overlay-mask role (§6.1).                                                                                                                                                                                 |
| **D-D5**                               | Popover/ConfirmPopup flipped and arrow groups omitted (FX-D1, FX-D2).                                                                                                                                                                                                          |
| **D-D6 = A**                           | SplitButton visual evidence is scoped to the SplitButton element; popup `UMenu` positioning stays Menu-owned.                                                                                                                                                                  |
| **D-D7**                               | Angular-only `[ufocustrap]` wrapper layout rule (§6.2 R-4).                                                                                                                                                                                                                    |

## 3. Existing behaviour (verified at `c567039`; research §A, §D)

### 3.1 Registration and renames

| Key           | Angular                                                        | Vue                                                              |
| ------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| confirmdialog | `confirm-dialog.ts:81`: `confirm-dialog` → **`confirmdialog`** | `BaseConfirmDialog.ts:8`: `confirm-dialog` → **`confirmdialog`** |
| confirmpopup  | `confirm-popup.ts:72`: `confirm-popup` → **`confirmpopup`**    | `BaseConfirmPopup.ts:8`: `confirm-popup` → **`confirmpopup`**    |
| drawer        | `drawer.ts:81`: `drawer` (no change)                           | `BaseDrawer.ts:8`: `drawer` (no change)                          |
| popover       | `popover.ts:70`: `popover` (no change)                         | `BasePopover.ts:8`: `popover` (no change)                        |
| splitbutton   | `split-button.ts:83`: `split-button` → **`splitbutton`**       | `BaseSplitButton.ts:21`: `split-button` → **`splitbutton`**      |
| speeddial     | `speed-dial.ts:72`: `speed-dial` → **`speeddial`**             | `BaseSpeedDial.ts:13`: `speed-dial` → **`speeddial`**            |

(The Plan re-verifies exact line numbers at its branch point.)

### 3.2 DOM facts the mapping relies on

- **ConfirmDialog:** renders through `UDialog`, portaled to `body`: `.u-dialog-mask > .u-dialog > … > .u-dialog-content > (i.u-confirmdialog-icon?, span.u-confirmdialog-message)`. The root class `u-confirmdialog` never reaches the rendered dialog (Angular: stays on the in-story `<u-dialog>` host; Vue: dropped at the teleport, with a Vue warning). Footer buttons sit in `div.u-confirmdialog-footer` inside `.u-dialog-footer` (Angular `u-button`; Vue native `<button>`).
- **ConfirmPopup:** portaled `div.u-confirmpopup.u-component > (.u-confirmpopup-content > (i.u-confirmpopup-icon?, span.u-confirmpopup-message), .u-confirmpopup-footer > buttons)`; Angular buttons are `u-button > button`, Vue buttons are native. No flipped class; no arrow element.
- **Popover:** portaled `div.u-popover.u-component[role=dialog] > div.u-popover-content`. No flipped class; no arrow element. D-0 positions the container in Angular; Vue positions the container.
- **Drawer:** portaled `div.u-drawer-mask > div.u-drawer.u-component.u-drawer-position-<left|right|top|bottom|full>`; header/content/footer inside. **Angular** adds an unclassed `div[ufocustrap]` wrapper around header/content/footer (measured 41 px tall inside a 720 px drawer). No open, full-on-mask, modal or animation class is emitted.
- **SplitButton:** Vue `div.u-splitbutton > button.u-button.u-splitbutton-button + button.u-button.u-button-icon-only.u-splitbutton-dropdown`; Angular `div.u-splitbutton > u-button.u-splitbutton-button > button.u-button` (and the same for the dropdown). The popup `UMenu` is portaled to `body` in both frameworks. Root classes are static (`u-splitbutton u-component`).
- **SpeedDial:** `div.u-speeddial.u-speeddial-direction-<dir> > button.u-speeddial-button + ul.u-speeddial-list > li.u-speeddial-item > button.u-speeddial-action`; the mask `div.u-speeddial-mask` is rendered as a sibling of the root only when `mask` and open. **The open class `u-speeddial-open` is on the trigger button**, not the root. Hidden items carry `u-speeddial-item-hidden`. The list has inline `flex-direction`; items have inline `transition-delay` (and inline `left`/`top` for circle types). No type, rotate or root disabled class is emitted. Trigger and actions are native buttons.

### 3.3 Coverage today

No G3 screenshot, layout or accessibility checks exist for these six keys, and `ACCESSIBILITY_BASELINE.md` has no rows for them. The only browser spec is D-0's `packages/ng/e2e/overlay-anchoring.spec.ts`, a mandatory regression check (§9.5 AC10). The Drawer unit specs assert `.u-drawer-position-right` (class, unchanged).

## 4. Selector mapping

- **Generic:** `.p-<key>-…` → `.u-<key>-…`.
- **Approved adaptations (exact):**

  | Upstream                                                       | Ultimate (both frameworks unless noted)                                               | Basis                                    |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------- |
  | `.p-confirmdialog .p-dialog-content`                           | `.u-dialog-content:has(> .u-confirmdialog-message)`                                   | D-D2                                     |
  | `.p-drawer-full .p-drawer`                                     | `.u-drawer.u-drawer-position-full`                                                    | D-G3-1 (position class is on the drawer) |
  | `.p-drawer-<pos> .p-drawer` (`pos` ∈ left, right, top, bottom) | `.u-drawer.u-drawer-position-<pos>`                                                   | D-G3-1                                   |
  | `.p-drawer-<pos> .p-drawer-content`                            | `.u-drawer.u-drawer-position-<pos> .u-drawer-content`                                 | D-G3-1                                   |
  | `.p-splitbutton-button.p-button`                               | Vue `.u-splitbutton-button.u-button`; Angular `.u-splitbutton-button > .u-button`     | D-G3-9, X-1 (host)                       |
  | `.p-splitbutton-dropdown.p-button`                             | Vue `.u-splitbutton-dropdown.u-button`; Angular `.u-splitbutton-dropdown > .u-button` | D-G3-9, X-1 (host)                       |
  | `.p-speeddial-open .p-speeddial-list`                          | `.u-speeddial:has(> .u-speeddial-button.u-speeddial-open) .u-speeddial-list`          | D-D3a                                    |
  | `.p-speeddial-open .p-speeddial-item`                          | `.u-speeddial:has(> .u-speeddial-button.u-speeddial-open) .u-speeddial-item`          | D-D3a                                    |

  Pseudo-classes in upstream selectors (`:focus-visible`, `:not(:disabled):hover`, `:not(:disabled):active`, `:dir(rtl)`) are kept on the mapped element.

## 5. Upstream rule-group inventory (exact; both frameworks)

Ported groups (R or K) form D1, in upstream order. Omitted groups (X) form D2 with an FX tag.

**FX tags:**

| Tag   | Excluded feature                                                                |
| ----- | ------------------------------------------------------------------------------- |
| FX-D1 | Popover/ConfirmPopup arrow (not rendered; D-D5)                                 |
| FX-D2 | Popover/ConfirmPopup flipped placement (class never emitted; D-D5)              |
| FX-D3 | Drawer enter/leave animation classes and keyframes (not rendered)               |
| FX-D4 | Drawer `-open` mask class (never emitted)                                       |
| FX-D5 | SplitButton popup menu inside the root (portaled to `body`)                     |
| FX-D6 | SplitButton fluid, rounded and raised variants (root classes not emitted)       |
| FX-D7 | SpeedDial rotate animation (class never emitted)                                |
| FX-D8 | SpeedDial circle, semi-circle and quarter-circle layouts (no type class; D-D3b) |

### 5.1 confirmdialog — 2 groups: ported 2 / omitted 0

- **D1:** 1 (mapped per §4, R through the `:has` form), 2 (R; becomes R through the `WithIcon` story).

### 5.2 confirmpopup — 13 groups: ported 6 / omitted 7

- **D1:** 1–6. Group 3 (`-icon`) becomes R through the `WithIcon` story. Groups 5–6 (`.u-confirmpopup-footer button`, `…:last-child`) reach the Angular inner `<button>` and the Vue native buttons.
- **D2:** 7 (FX-D2); 8–13 (FX-D1, 11–13 also FX-D2).

### 5.3 drawer — 33 groups: ported 12 / omitted 21

- **D1:** 1–5 (R); 6, 17–21 (§4 mappings); 23 (`.u-drawer-mask:dir(rtl)`, R through the `Rtl` story).
- **D2:** 7–16 and 24–33 (FX-D3); 22 (FX-D4).

### 5.4 popover — 9 groups: ported 2 / omitted 7

- **D1:** 1–2.
- **D2:** 3 (FX-D2); 4–9 (FX-D1, 7–9 also FX-D2).

### 5.5 splitbutton — 10 groups: ported 5 / omitted 5

- **D1:** 1; 2–5 with the §4 host-aware form in Angular.
- **D2:** 6 (FX-D5); 7–10 (FX-D6).

### 5.6 speeddial — 10 groups: ported 7 / omitted 3

- **D1:** 1, 2, 4, 5, 7 (R; 7 through the `Mask` story); 8, 9 (§4 `:has` mappings).
- **D2:** 3, 10 (FX-D7); 6 (FX-D8).

### 5.7 Totals

| Key           | Upstream | Ported (D1) | Omitted (D2) |
| ------------- | -------- | ----------- | ------------ |
| confirmdialog | 2        | 2           | 0            |
| confirmpopup  | 13       | 6           | 7            |
| drawer        | 33       | 12          | 21           |
| popover       | 9        | 2           | 7            |
| splitbutton   | 10       | 5           | 5            |
| speeddial     | 10       | 7           | 3            |
| **Total**     | **77**   | **34**      | **43**       |

Every D1 group's `dt()` references resolve in Ultimate's Aura preset (research §F). The only unresolved upstream paths, `popover.arrow.left` and `confirmpopup.arrow.left`, occur only in D2 groups.

## 6. Additions, runtime roles and candidates

### 6.1 D3 — base-style roles (B-2; exact text)

Upstream relies on `@primeuix/styles/base`, which Ultimate never loads. Placed first in the module:

- **SpeedDial overlay mask** (upstream mask classes are always `p-speeddial-mask p-overlay-mask`):

  ```css
  .u-speeddial-mask {
    background: dt("mask.background");
    color: dt("mask.color");
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  ```

  D1 group 7 then sets `position: absolute; border-radius: dt('content.border.radius')`, as upstream's component CSS does after base (precedent: the G3-B BlockUI mask).

- **SpeedDial disabled** (upstream `p-disabled` on the root and on disabled items; Ultimate disables the native buttons):

  ```css
  .u-speeddial-button:disabled,
  .u-speeddial-button:disabled *,
  .u-speeddial-action:disabled,
  .u-speeddial-action:disabled * {
    cursor: default;
    pointer-events: none;
    user-select: none;
  }
  .u-speeddial-button:disabled,
  .u-speeddial-action:disabled {
    opacity: dt("disabled.opacity");
  }
  ```

- **Drawer:** no overlay-mask role (D-D4 = B; PX-D2).

### 6.2 D4 — runtime-role CSS (ADR-052 X-4; exact text)

Placed after D1, in this order:

| Role                              | Rule                                                                                                                                                                                                                                                                                                                                         | Reason                                                                                                                                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 Popover root                  | `.u-popover { position: absolute; }`                                                                                                                                                                                                                                                                                                         | PrimeNG `inlineStyles.root`; D-0/Vue set `top`/`left` after render. The current `top: 0; left: 0` is dropped (§6.4, C2 OI-2 precedent).                                                                                |
| R-2 Drawer placement              | `.u-drawer-mask { position: fixed; inset: 0; display: flex; }` `.u-drawer-position-right { margin-left: auto; }` `.u-drawer-position-bottom { margin-top: auto; }`                                                                                                                                                                           | Upstream mask inline style (fixed, full size, flex, `justify-content`/`align-items` by position). Ultimate's existing placement rules, retained with their current text (the rest of those rules is superseded, §6.5). |
| R-3 SpeedDial direction           | `.u-speeddial-direction-up { flex-direction: column-reverse; align-items: center; }` `.u-speeddial-direction-down { flex-direction: column; align-items: center; }` `.u-speeddial-direction-left { flex-direction: row-reverse; justify-content: center; }` `.u-speeddial-direction-right { flex-direction: row; justify-content: center; }` | Upstream `inlineStyles.root` (PX-B6 precedent: inline role → existing class). The list's inline `flex-direction` stays.                                                                                                |
| R-4 Angular Drawer wrapper (D-D7) | Angular only: `.u-drawer > [ufocustrap] { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }`                                                                                                                                                                                                                           | Upstream renders header/content/footer as direct flex children of the drawer; the Angular focus-trap wrapper interposes. Selector adaptation to rendered DOM (X-1); no DOM change.                                     |

### 6.3 D-D3c gate result (recorded at Spec time)

- **Roles exist:** upstream SpeedDial composes `Button` with `{ rounded: true }` (trigger) and `{ severity: 'secondary', rounded: true, size: 'small' }` (actions). Aura `button` has `roundedBorderRadius` (2rem), `iconOnlyWidth` (2.5rem), `sm.iconOnlyWidth` (2rem), `primary.*` and `secondary.*`.
- **Not available at runtime:** on `ng-speeddial--default` and `vue-speeddial--default`, the page defines **0** `--u-button-*` variables (a Button story defines 175). Button variables register only when a `UButton` renders; SpeedDial uses native buttons. `dt('button.…')` in the speeddial module would therefore resolve to undefined variables (AC2).
- **Result:** the mapping is not supported. Per D-D3c, the existing Ultimate-only action rule is retained unchanged (D5 R-D1), and the unstyled native trigger is PX-D3.

### 6.4 D5 — Ultimate-only rules (retained or candidates)

| ID   | Rule                                                                                                                                                       | Status                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| R-D1 | `.u-speeddial-action { display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; width: 2.5rem; height: 2.5rem; }` | **Retained** (D-D3c fallback).                                                           |
| R-D2 | `.u-speeddial-item-hidden { visibility: hidden; }`                                                                                                         | Candidate, gate G-D1. Re-keyed from `[data-u-hidden="true"]` to the emitted class (X-3). |
| R-D3 | `.u-confirmdialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }`                                                                       | Candidate, gate G-D1 (Ultimate wraps the buttons in this element; upstream has none).    |
| R-D4 | `.u-confirmdialog-icon { flex-shrink: 0; }`, `.u-confirmdialog-message { flex-grow: 1; }`                                                                  | Candidate, gate G-D1.                                                                    |
| R-D5 | `.u-popover-content { position: relative; }`                                                                                                               | Candidate, gate G-D1.                                                                    |

Candidates are retained only if gate G-D1 shows both (i) no ported group covers the role and (ii) removing the rule causes a visible or behavioural difference.

### 6.5 Current Ultimate rules dropped (with reason)

| Current rule                                                                                                                                      | Reason                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `.u-confirmdialog .u-dialog-content { … }`                                                                                                        | Dead (root class never reaches the dialog); replaced by group 1 via D-D2.                                                               |
| ConfirmPopup `.u-confirmpopup { position; top; left }`, `-content`, `-footer`                                                                     | Superseded by groups 1, 2 and 4.                                                                                                        |
| Drawer `.u-drawer { display; flex-direction; pointer-events }`, header/content layout, per-position `top/left/right/bottom/width/height`          | Superseded by groups 1–3, 6, 17–21; placement kept as R-2. `pointer-events: auto` has no effect (the mask is always interactive, D-D4). |
| `.u-drawer-footer { }`                                                                                                                            | Empty rule.                                                                                                                             |
| `.u-popover { top: 0; left: 0 }`                                                                                                                  | Dropped (R-1).                                                                                                                          |
| SplitButton physical radius rules and `border-radius: 6px`                                                                                        | Superseded by groups 1–5 (logical properties, `splitbutton.border.radius`). Angular rules targeting the host had no effect.             |
| SpeedDial `.u-speeddial { position: relative; display: flex }`, `.u-speeddial-list { …; position: absolute }`, `.u-speeddial-item { transition }` | Superseded by groups 1, 4, 5 and R-3; the absolute list is what covered the trigger (F-D1).                                             |
| `.u-speeddial-action:disabled { cursor: default; opacity: 0.6 }`                                                                                  | Replaced by D3 (`disabled.opacity`).                                                                                                    |
| `.u-speeddial-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4) }`                                                                 | Replaced by D3 + group 7.                                                                                                               |

**PX list (recorded parity exceptions):**

| ID    | Exception                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------ |
| PX-D1 | Popover/ConfirmPopup render no arrow and never flip (D-D5).                                            |
| PX-D2 | Drawer has no backdrop and no modal/non-modal distinction (D-D4; follow-up).                           |
| PX-D3 | SpeedDial trigger is an unstyled native button; actions keep Ultimate-only styling (D-D3c gate, §6.3). |
| PX-D4 | SpeedDial circle-type layouts do not fan out (D-D3b; follow-up gap).                                   |
| PX-D5 | SplitButton's popup menu placement is Menu-owned and not part of G3-D evidence (D-D6).                 |
| PX-D6 | ConfirmDialog content is scoped by `:has(> .u-confirmdialog-message)` instead of a root class (D-D2).  |
| PX-D7 | Drawer open/close is not animated (FX-D3).                                                             |

## 7. Pre-existing defect corrections (performed by the CSS port; separate from fidelity)

| ID   | Defect (verified, research §J)                                                                                                                                | Correction                                                                                                                              | Evidence required                                                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-D1 | SpeedDial (both frameworks): closed action items are visible, and the absolutely positioned list covers the trigger, so a real pointer click cannot reach it. | Groups 1, 4, 5 (static root, list in flow with `pointer-events: none`, items `scale(0)`/`opacity: 0`), 8–9 (`:has` open state) and R-3. | Before: `elementFromPoint` at the trigger centre returns an action; real click times out. After: closed items have `opacity: 0`; a real click on the trigger opens the dial, three engines, both frameworks (gate G-D2). |
| F-D2 | ConfirmDialog (both frameworks): its content CSS never reaches the dialog.                                                                                    | Group 1 via D-D2.                                                                                                                       | After: `.u-dialog-content` of a ConfirmDialog is `display: flex`, gap = `confirmdialog.content.gap`.                                                                                                                     |
| F-D3 | Angular Drawer: content cannot grow (wrapper 41 px in a 720 px drawer).                                                                                       | R-4 (D-D7).                                                                                                                             | After: the Angular wrapper fills the drawer below nothing but header/footer; content height ≥ drawer height − header − footer (gate G-D3).                                                                               |

## 8. Module order and gates

**Canonical order in each style module:** **D3 → D1 (upstream order) → D4 → D5.** D2 is never emitted. No D4 or D5 rule redeclares a D1 property on the same selector unless §6 states it as intended.

**Gates (run and recorded in the Plan's first verification task):**

- **G-D1 — candidates R-D2..R-D5.** For each, with the rule removed versus present, in three engines and both frameworks, record the computed difference. A candidate with no visible or behavioural difference is dropped.
- **G-D2 — SpeedDial trigger reachability (F-D1).** With the ported CSS, a real pointer click on the trigger opens the dial and a second click closes it, three engines, both frameworks. If not, stop.
- **G-D3 — Angular Drawer wrapper (R-4).** Content fills the remaining drawer height in three engines. If not, stop.

## 9. Verification

### 9.1 Verification-only stories (both frameworks unless noted)

- ConfirmDialog `WithIcon`, ConfirmPopup `WithIcon` (an icon in the confirmation).
- Drawer `Positions` coverage: `Top`, `Bottom`, `Full` (and `Left`/`Right` from existing stories), and `Rtl` (left drawer under `dir="rtl"`).
- SplitButton `Disabled` (Vue only; Angular has one).
- SpeedDial `Directions` (up, down, left, right instances; one model with a disabled item) and `Mask`.

The stories add no component, input or runtime change. Existing stories are unchanged.

### 9.2 Screenshot matrix (X-6)

- **At rest:** SplitButton Default and Disabled; SpeedDial Default and `Directions` (closed).
- **Open states** (real trigger, pointer parked at (0,0) first, overlay visible with a non-zero box, transitions settled with `expect.poll` on computed values):
  - Popover Default; ConfirmPopup Default and `WithIcon`;
  - ConfirmDialog Default and `WithIcon` — screenshot scoped to the `.u-dialog` element (the Angular `UDialog` mask defect is Dialog-owned and out of scope);
  - Drawer: Angular `Open`, `RightPosition`, `Top`, `Bottom`, `Full`; Vue the same set opened by click — screenshot scoped to `.u-drawer`;
  - SpeedDial Default and `Directions` open (real click; F-D1), `Mask` open;
  - SplitButton: no open-state screenshot (D-D6).
- **Baselines:** one per engine × framework, Linux Docker (`mcr.microsoft.com/playwright:v1.63.0-jammy`). Before baselines are recorded before any CSS change (SpeedDial open states before the port are reached with a dispatched click, recorded as F-D1 evidence). The review gate comes before any baseline update.

### 9.3 Layout and computed-style checks (Chromium, Firefox, WebKit; both frameworks)

- **Popover / ConfirmPopup:** container background, border colour, radius and shadow equal the resolved `popover.*` / `confirmpopup.*`; `margin-block-start` equals `*.gutter`; the container's left equals the trigger's left (D-0 regression); content padding per token; ConfirmPopup icon size per `confirmpopup.icon.size`.
- **ConfirmDialog:** F-D2 (content `display: flex`, gap = `confirmdialog.content.gap`); icon size/colour in `WithIcon`.
- **Drawer:** left/right drawer width 20rem, top/bottom height 10rem, `full` 100vw × 100vh; background and border colour per `drawer.*`; header/content/footer padding per tokens; right drawer at the inline end (R-2); RTL story mask `flex-direction: row-reverse`; F-D3 (Angular).
- **SplitButton:** the main button's end corners and the dropdown's start corners are square, the shared edge has no double border; `focus-visible` raises `z-index: 1`; disabled appearance comes from the Button module (unchanged).
- **SpeedDial:** F-D1 (closed: items `opacity: 0`, list `pointer-events: none`; open: items `opacity: 1`, `transform: none`/`scale(1)`, list `pointer-events: auto`); direction layouts (R-3); gap = `speeddial.gap`; `Mask` story mask background = `mask.background`, `position: absolute`.
- **X-3b:** disabled SpeedDial action and disabled trigger have `opacity` = `disabled.opacity` and `pointer-events: none`; **separately**, a real click and keyboard activation on them emit no command, three engines.

### 9.4 Selector reach test (ADR-052 X-1)

As in G3-C2: per framework, every emitted selector part is declared R (story and state), K (cited emitter and condition) or X (D2 FX tag). R ∪ K equals the emitted selectors; each R part matches at least one element in its declared story and state, with pseudo-classes removed and combinators evaluated against the rendered DOM including Angular hosts and the `[ufocustrap]` wrapper.

### 9.5 Acceptance criteria

1. **AC1 — Keys:** each component registers one structural element and one `<key>-variables` element under its Aura key (§3.1).
2. **AC2 — Tokens:** in every verified state, each `var(--u-…)` in the structural CSS is defined (no exceptions). Each module contains at least one `var(--u-<key>-`.
3. **AC3 — Fidelity:** static exactness of D1, D3, D4, D5 per §5–§6, in the §8 order. D2 is never emitted. The data is never edited to make a check pass.
4. **AC4 — Reach:** §9.4 passes in both frameworks.
5. **AC5 — No DOM/runtime change:** in component files only the `css` block, the registered key and one doc-comment line change. Templates, `classes` resolvers, inputs, outputs and emits are unchanged. No new JavaScript.
6. **AC6 — Screenshots:** §9.2, with the review gate before any baseline change.
7. **AC7 — Layout/computed:** §9.3, including F-D1..F-D3 and X-3b.
8. **AC8 — Accessibility:** a new tranche-scoped G3-D differential validator (tests tagged `G3-D`, one scan per story and open state; completeness × 3 engines). It FAILs on violations that are neither in `ACCESSIBILITY_BASELINE.md` nor in a G3-D pre-existing evidence file. The pre-change violations (research §I) are recorded in that file before any CSS change. Introduced rows go to the review gate. No row policy beyond existing per-row practice is introduced (X-8 row policy remains undecided). The G3-A..G3-C2 tooling stays byte-identical.
9. **AC9 — Size:** C1 E1 method (Angular `fesm2022` per-file gzip sum; Vue `dist/index.mjs`) against the G3-D branch point. Growth above 15% in either package is a hard stop.
10. **AC10 — Regression:**
    - unit suites, typecheck and Angular SSR pass;
    - every screenshot outside §9.2 is unchanged;
    - the G3-A, G3-B, G3-C1 and G3-C2 visual and accessibility contracts still pass;
    - `packages/ng/e2e/overlay-anchoring.spec.ts` (D-0) and `packages/ng/e2e/context-menu.spec.ts` (C2-0) pass unchanged.
11. **AC11 — Provenance:** one `reference-derived` entry per changed style file (12), and an entry for every other changed source file (component files, stories, specs), per ADR-052 X-12 changed-file completeness. `provenance:validate` is not evidence (it exits at its first failure).
12. **AC12 — Retry-aware browser evidence:** every G3-D browser result is reported as `passed_first_attempt`, `passed_after_retry` or `failed`. Local and Docker evidence runs use `--retries=0`. The repository-wide retry policy is unchanged.

## 10. CI evidence (ADR-052 X-12)

- CI's strict scan selection becomes `--grep-invert "G3-A|G3-B|G3-C1|G3-C2|G3-D"`.
- Three G3-D steps are added, mirroring G3-C2: verification specs, differential accessibility validation, report upload.
- On the merge commit, green by status: Build, Typecheck, Coverage measurement; the strict Playwright projects and the accessibility baseline validation; the G3-D steps (ng, vue); the earlier tranches' steps, except the named vue G3-B (U2) failure. AC12 applies to every CI browser result cited.

## 11. Documentation

`MIGRATION.md` §8 records, with wording approved at Plan Review: the six components now use their Aura tokens; the style-key renames; F-D1..F-D3 as defect corrections; SpeedDial disabled dimming via `disabled.opacity`; PX-D1..PX-D7.

## 12. Tooling

New, tranche-scoped files, names fixed in the Plan: a G3-D upstream fixture (6 keys + `base`, generated from the pinned tarball, no hand edits); a port/data module (D1–D5, mapping, R/K/X declarations), importing `parseGroups` and `norm` from the frozen `g3a-port.mjs` without modifying it; a fidelity test; a reach test; a differential accessibility validator and its self-test. `g3a-port.mjs` … `g3c2-port.mjs` and the G3-A..G3-C2 validators stay byte-identical.

## 13. Out of scope (scope lock, user 2026-10-07)

- D-0 (completed prerequisite; not reopened).
- Angular `UDialog` mask positioning; shared `u-overlay-mask` infrastructure.
- SplitButton/`UMenu` popup positioning.
- SpeedDial circle-layout runtime support (follow-up gap).
- Drawer modal semantics, backdrop and runtime behaviour (follow-up).
- The Angular `provideRouter([])` / NG04002 story-harness defect.
- GAP-084..086, GAP-087..094 (including the broader provenance-manifest debt), X-8 row policy, ADR-053.
- Any DOM, template, runtime or public API change; React; Ripple; G3-E.
- Repository-wide CI, provenance, lint and format debt; the repository-wide Playwright retry policy.

## 14. Stop conditions

Stop and report, with no workaround, if:

- a ported group cannot reach the rendered DOM without a DOM, class or runtime change;
- any unresolved token appears in an emitted group;
- a count, mapping or order differs from this Spec;
- an unexpected visual change or an introduced accessibility violation appears;
- size grows above 15%;
- the D-0 or C2-0 browser specs fail;
- gate G-D2 or G-D3 fails, or G-D1 contradicts this Spec's rule text in a way that needs a decision;
- making a check pass would require editing fidelity data, exceptions, evidence or tests;
- G3-A..G3-C2 tooling would change.

## 15. Open items for Spec Review

- **OI-D1 — Popover `top: 0; left: 0`.** Drop, keeping only `position: absolute` (R-1), as C2 OI-2 did for ContextMenu (D-0 positions after render). Confirm.
- **OI-D2 — SpeedDial disabled mapping (§6.1).** Upstream `p-disabled` is on the root and on items; this Spec maps the base role to the native `:disabled` trigger and actions (the only elements Ultimate disables). Confirm.
- **OI-D3 — Drawer group 23 (`:dir(rtl)`).** Port it with an `Rtl` verification story (this Spec), or omit it as untested. Recommended: port.
- **OI-D4 — Screenshot scoping.** ConfirmDialog to `.u-dialog` and Drawer to `.u-drawer`, so out-of-scope mask defects do not enter the baselines. Confirm.

## 16. Spec Review decisions (2026-10-07, user)

- **OI-D1 — approved.** Popover `top: 0; left: 0` is dropped; only `.u-popover { position: absolute; }` remains (R-1). D-0 owns runtime `top`/`left` anchoring; the port must not reintroduce static `top`/`left`.
- **OI-D2 — approved.** SpeedDial disabled appearance maps to the native `:disabled` trigger and action buttons (§6.1). Disabled appearance and interaction protection stay separate (X-3b).
- **OI-D3 — approved.** Drawer group 23 (`:dir(rtl)`) is ported, with the `Rtl` verification story. The existing physical Drawer placement rules (R-2: `margin-left: auto`, `margin-top: auto`) are preserved exactly and are not converted to logical properties.
- **OI-D4 — approved.** ConfirmDialog screenshots are scoped to `.u-dialog`, Drawer screenshots to `.u-drawer`. The out-of-scope Dialog mask and Drawer backdrop defects must not affect G3-D baselines.
- **Implementation lock.** The SpeedDial mask keeps the exact D3 → D1 → D4 → D5 cascade (§6.1, §8): the B-2 base mask role is not simplified or removed because D1 group 7 overrides one of its declarations.
- **Confirmed unchanged:** 34/77 ported and 43/77 omitted; FX-D1..FX-D8; D-D2 and D-D3a `:has` forms; D-D3b; D-D3c fallback and PX-D3; D-D4; D-D5; D-D6; D-D7; F-D1..F-D3 as CSS-port defect corrections; D-0 as a completed prerequisite; no DOM/runtime/public API change; X-8 row policy undecided; ADR-053, GAP-094 and repository-wide provenance debt out of scope; GAP-084..086 and GAP-087..094 untouched; G3-A..G3-C2 tooling frozen.
