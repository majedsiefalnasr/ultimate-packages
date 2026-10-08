# Prime-Parity Verification Playbook

**Status:** normative (approved by the user 2026-10-08, decisions P-1..P-7 in `docs/architecture/research/2026-10-08-prime-parity-verification-playbook-proposal.md` §11).
**Scope:** how Ultimate decides whether a component looks and behaves like its Prime counterpart. It answers one question:

> Does the Ultimate component actually look and behave like the corresponding Prime component across its important user-visible states and variants?

This document is the home of the verification process. It adds no ADR. The pinned Prime versions are defined by **ADR-048** (`DECISIONS.md`) and are not restated here. The existing port rules (D-G3-1..D-G3-9, ADR-052 X-1..X-12) still govern how CSS is ported; this Playbook governs how parity is verified.

---

## 1. Oracles

A parity question is answered against a rendered reference, chosen by framework:

| Evidence                                                    | Role                               | Used for                                        |
| ----------------------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| **PrimeNG rendered at the ADR-048 pinned version**          | **Oracle for Ultimate Angular**    | Visual and behavioral parity of `@ultimate/ng`  |
| **PrimeVue rendered at the ADR-048 pinned version**         | **Oracle for Ultimate Vue**        | Visual and behavioral parity of `@ultimate/vue` |
| Prime source (vendor tarballs, committed upstream fixtures) | Diagnostic evidence, not an oracle | Explaining and locating a difference            |
| Ultimate screenshot baselines                               | Regression evidence, not an oracle | Detecting that a verified state changed         |

- PrimeNG and PrimeVue share `@primeuix/styles` / `@primeuix/themes` 2.0.3. That is part of the diagnostic story; it does **not** prove they render identically.
- For any Angular-specific DOM, layout, host-element, interaction or runtime behavior, PrimeNG is authoritative.
- Whether a PrimeVue capture may stand in for Angular on a purely shared-styling case is **open** until the pilot (§12) reports. If the pilot shows identical renders for such cases, that fact is recorded per case. It never becomes a blanket rule for framework-specific behavior.
- Newer Prime releases are never rendered as a reference (ADR-048).
- React is outside this Playbook until a React parity scope is authorized.

## 2. The six claims

Name the claim; never say "parity done" without one.

| Claim                       | Meaning                                                                                     | Evidence                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Source parity**           | The applicable Prime source/rules were understood and ported.                               | Fidelity tests, reach tests (X-1), port records.                        |
| **Visual parity**           | Ultimate's rendering matches the framework's Prime oracle for the canonical cases.          | Capture + probe per case (§6).                                          |
| **State/variant coverage**  | The canonical cases were actually exercised on both sides.                                  | The case matrix (§5), each case marked compared, D, or not exercisable. |
| **Behavioral parity**       | Important interaction, positioning and state behavior matches the oracle.                   | The same scripted interaction run on the oracle and on Ultimate (§7).   |
| **Intentional differences** | B adaptations (fixed to the same result), C deliberate differences, D non-applicable scope. | One recorded row per difference (§8).                                   |
| **Open gaps**               | Real differences still to fix (A).                                                          | A GAP ID linked from the status row.                                    |

**Source parity is an input, never the verdict.** A component is parity-verified only when its canonical rendered cases have been compared against its framework's oracle.

## 3. Risk tiers

| Tier  | Criteria                                                                                      | Cases | Behavior              |
| ----- | --------------------------------------------------------------------------------------------- | ----- | --------------------- |
| **A** | Overlay or positioned surfaces, keyboard-navigable composites, several interacting state axes | ≤ 12  | Yes, where applicable |
| **B** | Moderate structure, a few variants or one interaction                                         | ≤ 6   | Only when interactive |
| **C** | Leaf, mostly static elements                                                                  | ≤ 3   | No                    |

The G3 assignment is in the status table (§11). Other components get a tier when first selected for verification. A tier is raised only by a recorded reason.

## 4. Evidence storage

- Reference and Ultimate captures are **not committed**. They are regenerated from the pinned Prime versions.
- Durable evidence: the measured commit, the case matrix, the probe results, the generated summary, and the tranche or verification closeout record. The status row (§11) links to the record.
- Committing reference images is a later decision, only if reproducibility or review experience proves insufficient.

## 5. Canonical case matrix

### 5.1 Source of cases

The candidate list is Prime's own showcase sections for the pinned version: `apps/showcase/doc/<component>/` in the ADR-048 tarballs: `*Doc.vue` in PrimeVue for Vue, `*-doc.ts` in PrimeNG for Angular.

- **Keep** sections that change appearance or behavior.
- **Skip** Import, Accessibility, PT, Headless/Unstyled, Theming and pure-API sections, and integration demos.
- **Add** only the applicable state axes: hover, focus-visible, disabled, open, invalid, loading, RTL.

### 5.2 Rules

1. **One axis at a time** from the default. No Cartesian product.
2. **Combine two axes only where Prime shows they interact** (for example Drawer position × RTL).
3. **Variant strips:** all values of one appearance axis (severities, sizes) render together in one case.
4. **Tier caps** (§3) are hard limits.
5. **Unsupported in Ultimate → D** (§8). Existing D-G3-3 / FX feature exclusions carry over as D rows.
6. **Ultimate side reuses existing stories**, each case mapped to a story id plus a state action (X-6 helpers). A missing story is a coverage gap; a story is added only for a canonical case, under authorized work.

The matrix is recorded per component in the record that verifies it, as a table: case id, source section, axis, Ultimate story id, state action, kind (visual / behavior), result.

## 6. Reference harness, capture and verdict

### 6.1 Architecture

One shared runner, thin per-framework reference apps:

- **Shared:** the Playwright runner and its own config (the root Playwright config is not changed), the environment probe, the part probe, the report generator, and a per-component **case definition** (case ids, state actions, and a part map keyed by framework: Prime selector ↔ Ultimate selector).
- **Per framework:** a minimal, private, never-published app that renders each case with that framework's pinned Prime. Only the case templates differ between them.
  - PrimeVue 4.5.5 + `@primeuix/themes` 2.0.3 Aura, styled mode, Prime defaults.
  - PrimeNG 21.1.9 with the same theme. Built at the pilot's minimum size; it grows only with the components being verified.
- **Prime as Prime ships:** each reference app loads Prime's base style and theme as a Prime app does.
- **Pins:** exact `primevue` / `primeng` / `@primeuix/themes` versions; transitive `@primeuix/*` frozen by the lockfile; a check fails if any resolved Prime package is outside ADR-048. No `packages/*` package depends on Prime (`validate-dependency-ceiling.mjs`).

### 6.2 Environment

Each run first compares an environment probe (computed `body` font-family, font-size, background, padding; viewport 1280 × 720) between each reference app and the matching Ultimate Storybook, and stops if they differ. Runs use Chromium in the Docker image `mcr.microsoft.com/playwright:v1.63.0-jammy`.

### 6.3 Capture and probe

For each case and framework: open the reference route and the Ultimate story, apply the state with the X-6 helpers, screenshot the component root (the viewport for overlays), and probe up to four named parts:

- **Geometry:** width, height, offset from the root (from the anchor, for overlays).
- **Computed values:** `color`, `background-color`, border widths and colors, `border-radius`, `padding`, `font-size`, `font-weight`, `line-height`, `box-shadow` (none / present), `opacity`, `display` / `visibility`, `box-sizing`.

Output: side-by-side and diff images, a JSON report, and a generated Markdown summary. The pixel-diff ratio is reported as advisory only.

### 6.4 Verdict

A case is a **Match** when geometry is within ±1 px, the probed values are equal, and the side-by-side review shows no visible difference. Otherwise it is a difference and is classified (§8). No CI gate is attached; CI gating is a later, separate decision.

## 7. Behavior

For Tier A, and interactive Tier B, a short list of observable assertions is run as the same script against the oracle and Ultimate through the part map. The oracle's result is the expected value. Typical assertions: the trigger opens the overlay at the same anchor offset (±2 px); focus moves to the same part; Esc closes and focus returns; arrow keys move the active item the same way; RTL mirrors the same way; the closed state takes the same layout space. No screenshots for behavior.

## 8. Difference classification

### 8.1 Before classifying

- **Harness artifact first.** A difference caused by the environment, a story decorator, a font or a fixture is fixed in the harness. It is not a product difference.
- **Material threshold.** Only material differences are classified: geometry off by more than 1 px on a probed part; a different probed color, border, radius, padding or font value; a missing or extra visible element; a state that looks different; or a behavior assertion with a different result. Anything else is a Match and is not recorded.

### 8.2 Classes

| Class | Meaning                                                                         | Action                                                                                       | Decided by                                |
| ----- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **A** | Real parity defect: Ultimate should match and does not.                         | Fix in the current work item if in scope; otherwise register a GAP. Status `open-gap`.       | Agent proposes; user confirms at the gate |
| **B** | Framework/DOM adaptation: different DOM/runtime, same rendered result expected. | Fix the adaptation (selector mapping, state carrier, wrapper-aware rule). X-2 still applies. | Agent, recorded                           |
| **C** | Intentional Ultimate difference, deliberate and justified.                      | Document; do not fix.                                                                        | **User ruling**                           |
| **D** | Non-applicable Prime behavior/feature, outside Ultimate's supported scope.      | Record in the case matrix; build nothing.                                                    | Agent, recorded                           |

**No code change before the classification is recorded.** A visual mismatch never becomes a code change, or a new CSS rule, by itself. Existing known gaps stay separate; a new mismatch that matches an existing GAP is linked to it, not re-registered.

### 8.3 Loop guards

1. Sub-threshold differences are never work items.
2. One comparison pass per component per work item, plus one re-run after fixes. A difference that first appears on the re-run is recorded; it is fixed in the same item only if it is class A on a canonical case.
3. No new convention from a single difference. A cause shared by many components is handled once, as its own cross-cutting item (GAP-098 is the first).
4. **Stop rule:** if a fix seems to need a new rule category, an ADR, or a second fix iteration on the same case, stop and ask.

## 9. Status model and Definition of Done

Two values per component × framework:

- **Source:** `ported` | `not ported` | `Ultimate-specific`.
- **Verification:**

  | Value                       | Meaning                                                             |
  | --------------------------- | ------------------------------------------------------------------- |
  | `pending`                   | No rendered comparison against the framework's oracle yet.          |
  | `partial`                   | Some canonical cases compared, the rest pending; no open A.         |
  | `verified`                  | Every canonical case for the tier is a Match, or a B that is fixed. |
  | `verified-with-differences` | As `verified`, plus at least one recorded C or D.                   |
  | `open-gap`                  | At least one A unresolved; the row links the GAP.                   |

**Definition of Done:** a component is parity-done for a framework when its Verification is `verified` or `verified-with-differences`, measured against that framework's oracle.

- A source-port tranche closeout reports both columns. "Tranche complete" means the source port only.
- Nothing is promoted retroactively. A row changes only with a comparison record at a named commit.

## 10. Process

1. **Select** a component or family under an authorized work item; confirm its tier.
2. **Matrix:** derive the canonical cases (§5).
3. **Compare** once per framework against its oracle (§6, §7).
4. **Classify** every material difference (§8) and record it before any code change.
5. **Fix** only A (in scope) and B; register out-of-scope A as GAPs; obtain rulings for C.
6. **Re-run once**, update the status row with the commit and record link.

G3 source-port work (G3-A..G3-D) is closed and is not reopened. Their verification is a backfill under this process, Tier A first. Future tranches (from G3-E) use this process for their Definition of Done.

## 11. Status table

All rows measured at `main` `4c099a9` (2026-10-08). No rendered Prime comparison exists yet for any component, so every Verification value is `pending`. "—" = no component in that framework.

| Key               | Tier | Tranche | Source ng / vue         | Verification ng / vue | Known gaps / notes                                       |
| ----------------- | ---- | ------- | ----------------------- | --------------------- | -------------------------------------------------------- |
| accordion         | A    | G3-B    | ported / ported         | pending / pending     |                                                          |
| blockui           | C    | G3-B    | ported / ported         | pending / pending     | Vue story `inheritAttrs` (G3-B follow-up)                |
| card              | C    | G3-B    | ported / ported         | pending / pending     | U2 Vue WebKit screenshot                                 |
| divider           | C    | G3-B    | ported / ported         | pending / pending     |                                                          |
| fieldset          | B    | G3-B    | ported / ported         | pending / pending     |                                                          |
| inplace           | B    | G3-B    | ported / ported         | pending / pending     |                                                          |
| panel             | B    | G3-B    | ported / ported         | pending / pending     |                                                          |
| scrollpanel       | B    | G3-B    | ported / ported         | pending / pending     | U1 Angular story                                         |
| splitter          | B    | G3-B    | ported / ported         | pending / pending     |                                                          |
| toolbar           | C    | G3-B    | ported / ported         | pending / pending     |                                                          |
| breadcrumb        | B    | G3-C1   | ported / ported         | pending / pending     |                                                          |
| dock              | B    | G3-C1   | ported / ported         | pending / pending     | Screenshots below tolerance (C1 follow-up)               |
| stepper           | A    | G3-C1   | ported / ported         | pending / pending     | Angular separator groups unreachable (cross-tranche F-1) |
| steps             | B    | G3-C1   | ported / ported         | pending / pending     |                                                          |
| tabs              | A    | G3-C1   | ported / ported         | pending / pending     |                                                          |
| contextmenu       | A    | G3-C2   | ported / ported         | pending / pending     | GAP-086                                                  |
| megamenu          | A    | G3-C2   | ported / ported         | pending / pending     | GAP-084 (Vue), GAP-085                                   |
| menubar           | A    | G3-C2   | ported / ported         | pending / pending     | GAP-084 (Vue)                                            |
| panelmenu         | A    | G3-C2   | ported / ported         | pending / pending     |                                                          |
| tieredmenu        | A    | G3-C2   | ported / ported         | pending / pending     | GAP-084 (Vue)                                            |
| confirmdialog     | B    | G3-D    | ported / ported         | pending / pending     |                                                          |
| confirmpopup      | A    | G3-D    | ported / ported         | pending / pending     |                                                          |
| drawer            | A    | G3-D    | ported / ported         | pending / pending     | GAP-097, GAP-098; pilot component                        |
| popover           | A    | G3-D    | ported / ported         | pending / pending     |                                                          |
| inlinemessage     | B    | G3-A    | — / ported              | — / pending           |                                                          |
| message           | B    | G3-A    | ported / ported         | pending / pending     | Pilot component                                          |
| toast             | A    | G3-A    | ported / ported         | pending / pending     |                                                          |
| avatar            | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| chip              | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| knob              | B    | G3-A    | ported / ported         | pending / pending     |                                                          |
| metergroup        | B    | G3-A    | ported / ported         | pending / pending     |                                                          |
| overlaybadge      | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| progressbar       | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| progressspinner   | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| skeleton          | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| tag               | C    | G3-A    | ported / ported         | pending / pending     | Pilot component                                          |
| terminal          | C    | G3-A    | ported / ported         | pending / pending     |                                                          |
| timeline          | B    | G3-A    | ported / ported         | pending / pending     |                                                          |
| splitbutton       | A    | G3-D    | ported / ported         | pending / pending     | SplitButton → `UMenu` (D-G3-9)                           |
| speeddial         | A    | G3-D    | ported / ported         | pending / pending     | GAP-096                                                  |
| carousel          | A    | G3-E    | not ported / not ported | pending / pending     | G3-E not started                                         |
| galleria          | A    | G3-E    | not ported / not ported | pending / pending     | G3-E; Ultimate-specific structure (G3 research)          |
| image             | B    | G3-E    | not ported / not ported | pending / pending     | G3-E                                                     |
| imagecompare      | B    | G3-E    | not ported / not ported | pending / pending     | G3-E                                                     |
| dataview          | B    | G3-E    | not ported / not ported | pending / pending     | G3-E; Ultimate-specific structure (G3 research)          |
| orderlist         | B    | G3-E    | not ported / not ported | pending / pending     | G3-E; ng/vue Listbox divergence (D-G3-9)                 |
| organizationchart | B    | G3-E    | — / not ported          | — / pending           | G3-E; Ultimate-specific structure (G3 research)          |
| picklist          | B    | G3-E    | not ported / not ported | pending / pending     | G3-E; ng/vue Listbox divergence (D-G3-9)                 |

Tiers: A 16, B 20, C 12. GAP-098 (global base box model) potentially affects every row.

## 12. Current state

- **Pilot (approved, not started):** Drawer (Tier A, positive control for GAP-097 / GAP-098), Message (Tier B, with D cases), Tag (Tier C, negative control). It builds the shared runner, the PrimeVue reference app, and a minimal PrimeNG reference app for the same cases. Exit criteria: stable environment probe; the Drawer sizing difference detected; at least one genuine match; output useful for human review; effort per case and per component measured; Angular reference handling validated against PrimeNG well enough to confirm the harness architecture and to settle §1's open item. If the method misleads or costs too much, it is revised before G3-E.
- **G3-E** starts only after the pilot passes and is approved.
- **Backfill** of G3-A..G3-D follows, Tier A first.
