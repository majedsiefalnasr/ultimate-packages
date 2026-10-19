# S-5 — Accessibility acceptance criteria: research and recommendation (2026-10-11)

**Status:** research record, **uncommitted draft** for user review. Authorized by the user on 2026-10-11. It refines assessment revision 3 §6. The **required fixes** recorded by ruling S-5 are approved scope and are not re-litigated here. Everything else, including the acceptance policy, is a recommendation **[Rec]** pending a separate decision. No finding is treated as an accepted residual.

**Status note (2026-10-19):** committed, no longer an uncommitted draft; the proposals it left pending were decided as ADR-053; see `docs/architecture/DECISIONS.md`, the ADR-053 heading (line 391 as of `94807833`). The text below is the point-in-time record.

**Labels:** [R] repository evidence · [AX] axe-core 4.13.0 rule metadata (installed package) · [D] decision record · [A] assumption or inference · [X] not provable by repository checks · [Rec] recommendation.

**Baseline:** `main` == `99364dc`.

---

## 1. Ruled scope (not re-opened)

Required before the target publish [D, ruling S-5]:

- GAP-086, GAP-100, GAP-111, GAP-112, GAP-123;
- every critical-severity component-level baseline finding (19 rows today).

## 2. Inventory of existing findings

### 2.1 Critical baseline rows (required fixes): what "fix" means

| Rows                 | Rule [AX]                                       | Component | Recorded cause (baseline note) [R]                                                                                                                                                                           | Fix locus                                                   |
| -------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 9 (3 per framework)  | `aria-required-children` (critical, WCAG 1.3.1) | Table     | The root `div[role=table]` wraps a native `<table>`; the ARIA table role requires rowgroup/row children (`table.ts:42`, `table.tsx:832`)                                                                     | **Component template** in all three frameworks              |
| 1 ng, 4 react, 5 vue | `label` (critical, WCAG 4.1.2)                  | Checkbox  | Stories render an unlabeled checkbox. Angular has an `aria-label` binding and Vue has `ariaLabel`/`ariaLabelledby` props; **React `UCheckbox` exposes `inputId` but no `aria-label`/`aria-labelledby` prop** | Story usage (ng, vue); **component API plus story** (react) |

**Finding:** a row can be removed by changing only the story. For Checkbox that would hide the real React API gap. **[Rec] criterion AC-2a:** a critical row counts as fixed only when (i) the component supports an accessible name and (ii) the documented story provides one, confirmed by the row's fingerprint disappearing from a real scan. This follows the one-way-door contract in `ACCESSIBILITY_BASELINE.md`.

### 2.2 Serious component-level rows (44), disposition pending

| Rule [AX]                                        | Rows | Components [R]                                              | Root cause [R]                                                                                                                                                                                                                                                         |
| ------------------------------------------------ | ---- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-contrast` (serious, 1.4.3 AA)             | 34   | Badge, Button, Message, InlineMessage, Stepper, Steps, Tabs | Aura primary `#10b981` on white is 2.53:1. **29 rows are recorded as user-approved upstream Aura parity exceptions** (11 approved 2026-10-04 in G3-A, 18 approved 2026-10-06 in G3-C1); **5 Button rows** (ng 2, vue 3) cite the same theme colours without that label |
| `svg-img-alt` (serious, 1.1.1 A)                 | 7    | Button (loading), Checkbox, Dialog (react, vue)             | Core icon components render `<svg role="img">` with an optional label that callers never pass                                                                                                                                                                          |
| `scrollable-region-focusable` (serious, 2.1.1 A) | 3    | Scroller (all three)                                        | The disabled/unvirtualized root scrolls but has no `tabindex`                                                                                                                                                                                                          |

### 2.3 Environmental rows (246)

`region` 94, `landmark-one-main` 76, `page-has-heading-one` 76: all moderate, best-practice, from the Storybook iframe shell, not from components [R][AX].

### 2.4 Open accessibility and focus GAPs (11)

| GAP                     | Status under S-5     | Level [R] | Defect                                                                                 |
| ----------------------- | -------------------- | --------- | -------------------------------------------------------------------------------------- |
| 086, 100, 111, 112, 123 | **Required fix** [D] | MEDIUM    | ContextMenu keyboard; Vue Drawer focus; Vue Galleria Escape; Galleria axe; Listbox axe |
| 114, 115, 122           | Pending              | MEDIUM    | Carousel arrow keys; Angular Galleria Tab order; Angular PickList Tab order            |
| 103, 104                | Pending              | LOW       | Vue Image focus restore; Vue ImageCompare extra tab stop                               |
| 116                     | Pending              | LOW       | Angular Galleria returns focus to the invoker (PrimeNG does not); no recorded intent   |

### 2.5 §30 responsibilities with no current measurement

Blueprint §30 lists semantics, keyboard, focus, ARIA, screen reader, disabled/loading, high-contrast and RTL per component. Axe covers parts of semantics and ARIA. The G3 differential validators cover keyboard and focus for ported components. **Screen reader, high-contrast and RTL have no evidence in the repository** [R]. Screen-reader behavior cannot be proven by CI [X].

## 3. Policy options

| Option                                             | Rule                                                                                                                                                                                                                                                              | Consequence                                                                                                                                                                     | Assessment                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| P-A Zero WCAG A/AA                                 | Every component-level A/AA finding and every accessibility GAP fixed                                                                                                                                                                                              | All 34 contrast rows need theme-token changes, which conflicts with the user-approved Aura parity exceptions (2026-10-04 and 2026-10-06; "Aura colors intentionally unchanged") | Strongest; requires reversing a recorded user approval (K-S5-C1) |
| **P-B Severity-tiered with documented exceptions** | Critical: zero (ruled). Serious A/AA: fixed, or an explicitly approved exception per row under a stated eligibility test. Keyboard/focus defects: MEDIUM fixed; LOW fixed or an approved exception. Environmental best-practice: a documented environmental class | Fits ruling D-40 ("exception only if explicitly documented and approved") and the existing one-way-door baseline                                                                | **[Rec]**                                                        |
| P-C Regression-only                                | Only §30's "regressions are release blockers"; all existing findings become exceptions                                                                                                                                                                            | Already narrower than ruling S-5; inconsistent with D-40's per-item approval                                                                                                    | Not recommended                                                  |

## 4. Recommended measurable criteria [Rec] (refines A1–A7)

| ID    | Criterion                                                                                                                                                                                                                                                             | Measurable evidence                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | No new violations (§30 regressions)                                                                                                                                                                                                                                   | The existing baseline gate green in CI, extended to every S-2 component story                                                                                                               |
| AC-2  | Zero critical component-level rows (**already ruled**) + AC-2a fix definition (§2.1)                                                                                                                                                                                  | No `label`/`aria-required-children` (or any other critical-impact) row in `ACCESSIBILITY_BASELINE.md`; removals proven by real scans                                                        |
| AC-3  | Serious WCAG A/AA rows: zero, except rows individually approved as exceptions under an eligibility test                                                                                                                                                               | The baseline holds no serious row without an exception ID in the register (assessment G14)                                                                                                  |
| AC-3a | Contrast eligibility test (the existing X-8 proposal, wording unchanged): a row is eligible as an upstream-Aura parity exception only when the rule is `color-contrast`, both colours equal resolved upstream Aura tokens, and the element has the same upstream role | Per-row check recorded with the exception. **The X-8 (a) row policy is still undecided**; adopting AC-3a decides it                                                                         |
| AC-4  | Keyboard operability: every in-scope interactive component's primary interactions work by keyboard per its WAI-ARIA APG pattern                                                                                                                                       | A committed keyboard e2e test per component family (the G3 validators are the existing harness), green in CI                                                                                |
| AC-5  | Focus management: modal/overlay components move focus in, contain it while modal, and restore it on close                                                                                                                                                             | A committed e2e assertion per overlay family, green in CI                                                                                                                                   |
| AC-6  | Environmental rows are a documented environmental class, approved once as a class, not per row                                                                                                                                                                        | One register entry citing the 246 rows' fingerprints; any non-shell row in these rules is treated as a component finding                                                                    |
| AC-7  | Assistive-technology smoke check for the required fixes and each new S-2 family                                                                                                                                                                                       | A dated manual record (screen reader and browser named) per family [X: manual]                                                                                                              |
| AC-8  | High-contrast and RTL (§30)                                                                                                                                                                                                                                           | **No recommendation without evidence.** Smallest step: a research spike measuring current behavior (forced-colors and `dir=rtl` story runs). Until then this is an open §40 item under D-40 |

## 5. Recommended disposition of the other findings [Rec]

| Finding                              | Recommended                                                             | Reason                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 29 Aura-parity `color-contrast` rows | Exception candidates under AC-3a, re-approved for the publish           | Already user-approved as parity exceptions in G3; D-40 needs explicit publish-level approval                               |
| 5 Button `color-contrast` rows       | Apply AC-3a per row; if eligible, an exception candidate; otherwise fix | Same root cause; their labelling differs only for historical reasons [A]                                                   |
| 7 `svg-img-alt` rows                 | **Fix**                                                                 | A shared icon-component change, small (pass or derive the label)                                                           |
| 3 `scrollable-region-focusable` rows | **Fix**                                                                 | Adding a `tabindex` to Scroller's scrollable root is small                                                                 |
| GAP-114, 115, 122 (MEDIUM)           | **Fix**                                                                 | Keyboard/Tab-order defects under AC-4                                                                                      |
| GAP-103, 104 (LOW)                   | Fix (small) or exception                                                | Focus polish                                                                                                               |
| GAP-116 (LOW)                        | Exception as an intended divergence, if the user agrees                 | Returning focus to the invoker is generally recommended practice; Ultimate's behavior is arguably better than upstream [A] |
| 246 environmental rows               | AC-6 class exception                                                    | Harness artifacts                                                                                                          |

## 6. Conflicts and decisions

- **K-S5-C1:** P-A or any contrast fix conflicts with the user-approved Aura parity exceptions (2026-10-04, 2026-10-06). Smallest gate: a user decision; no ADR records it [D].
- **K-S5-C2:** adopting AC-3a decides the X-8 (a) row policy, which is recorded as an open proposal (cross-tranche study §3; ADR-052 line 383). Deciding it is the normal next step for an open proposal, not a reopening.
- **S5-D1:** adopt P-B with AC-1 to AC-7, or modify them.
- **S5-D2:** approve the §5 dispositions (each exception still needs its register row).
- **S5-D3:** authorize the AC-8 high-contrast/RTL research spike, or rule otherwise.

## 7. Next required approval gate

- **Policy:** a **Decision** on S5-D1 to S5-D3 (recording the X-8 (a) outcome).
- **Required fixes (already approved scope):** Spec(s) for the five GAPs and the 19 critical rows. This record supplies their research input; Spec authorship needs separate authorization.
