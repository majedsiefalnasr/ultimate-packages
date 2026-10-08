# Prime-parity verification-first Playbook — proposal

**Date:** 2026-10-08
**Evidence gathered at:** `main` = `origin/main` = `4c099a9` (after the G3-D merge), clean tree. Static reads of the repository, the pinned vendor tarballs in `.vendor-cache/` and the G3 research, Spec and closeout records. No browser run was made for this proposal.
**Status:** research record. §0–§10 are the proposal as presented, with §2.2 and §4.2 amended by the user's decisions; §11 records the decisions (2026-10-08). The normative result is `docs/architecture/PARITY_PLAYBOOK.md`. No code, CSS, test, story, baseline or CI change. G3-E is not started.

---

## 0. What "the Playbook" is today

No file in the repository is called a Playbook. The rules that make up the current parity method live in five places:

| Rule set                                      | Location                                                     |
| --------------------------------------------- | ------------------------------------------------------------ |
| Parity baseline (pinned last-MIT Prime)       | ADR-048, `docs/architecture/DECISIONS.md`                    |
| G3 port rules D-G3-1..D-G3-9                  | `research/2026-10-04-gap-064-g3-research.md` §11             |
| Cross-tranche conventions X-1..X-12 (ADR-052) | `research/2026-10-06-gap-064-cross-tranche-study.md` §10–§11 |
| Gate sequence and verification vocabulary     | `AGENTS.md` §3–§4                                            |
| Per-tranche Definition of Done (de facto)     | each tranche's Spec acceptance criteria and closeout record  |

This proposal adds one short document that holds the verification part, plus a status table. It changes none of the rule sets above. It adds no rule to them.

---

## 1. The current parity model and its weakness

### 1.1 What a tranche proves today

A G3 tranche is "complete" when these hold (G3-B..G3-D closeouts):

1. **Fidelity test.** Each style module's CSS equals the applicable `@primeuix/styles` 2.0.3 groups, with selectors mapped to Ultimate's DOM. Generated from a committed upstream fixture.
2. **Reach test (X-1).** Every shipped selector matches rendered Ultimate DOM, or is listed as conditional.
3. **Ultimate screenshots.** Before/after baselines, rendered in Linux Docker and reviewed by the user.
4. **Layout / computed-style checks** declared in the Spec (X-7).
5. Accessibility rows, size gate, named CI steps (X-8, X-10, X-12).

Each check compares Ultimate with one of two things: **upstream source text** (1, 2) or **Ultimate's own earlier rendering** (3, 4). None compares Ultimate with **Prime's rendering**. A user-reviewed screenshot shows whether a change is expected, but the reviewer judges it against memory or intuition, not against a rendered Prime reference.

So "complete" today means **source-port complete**. It does not show that the component looks or behaves like Prime.

### 1.2 Evidence that this gap is real

| Case                            | Source parity                                                   | Rendered result                                                           | Found by                         |
| ------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| GAP-097 Drawer `full`           | Faithful port of `height: 100vh !important` and the 1 px border | Drawer 1280 × 722 in a 720 px viewport; content overflows by its padding  | G3-D layout test, after the port |
| GAP-096 SpeedDial               | Upstream groups ported                                          | Closed dial still takes ~192 px of layout space                           | G3-D review                      |
| F-3b Angular TieredMenu/Menubar | Selectors ported                                                | Submenus never shown; Angular host elements break `>`                     | Cross-tranche reach audit        |
| C1 Dock                         | Ported                                                          | Change near-white on white and below tolerance; screenshots prove nothing | G3-C1 closeout                   |
| Tranche 1 RadioButton           | Key wired                                                       | 0 × 0 → 20 × 20 circle passed inside the default tolerance                | Tranche 1 review                 |

**GAP-097 points at a systemic cause, not a Drawer cause.** Prime's own base style (`@primeuix/styles` 2.0.3 `base/index.ts`) starts with `*, ::before, ::after { box-sizing: border-box; }`. Every Prime app loads it. Ultimate has a port of it (`packages/uix-styles/src/base/index.ts`), but no core, theme or component source imports it (static check at `4c099a9`; the G3-D browser run measured `box-sizing: content-box` on the Drawer). Every component whose upstream CSS combines a fixed width/height with padding or borders is therefore at risk, and no per-component fidelity test can see a missing global layer. A single rendered comparison against Prime would show it at once. This proposal does not fix it; §10 Step 3 routes it.

### 1.3 Process cost

Each difference found late produced a new rule: X-1..X-12, PX-, R-, E3/E3a, accepted coverage gaps. The rules are individually sound, but the loop is "port → find a difference in Ultimate-only evidence → add a rule → repeat". The missing piece is an oracle that says early, per case, whether a difference exists at all.

---

## 2. Proposed model: verification-first

### 2.1 Six separate claims

| Claim                       | Meaning                                                                                                               | Evidence that proves it                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Source parity**           | The applicable Prime source/rules were understood and ported.                                                         | Fidelity test, reach test, port records (what exists today).           |
| **Visual parity**           | Ultimate's rendering matches Prime's rendering for the canonical cases.                                               | Prime-vs-Ultimate capture + probe per case (§4).                       |
| **State/variant coverage**  | The canonical cases were actually exercised on both sides.                                                            | The case matrix, with each case marked compared / not exercisable / D. |
| **Behavioral parity**       | Important interaction, positioning and state behavior matches Prime (Tier A, and interactive Tier B).                 | The same scripted interaction run on Prime and on Ultimate (§4.6).     |
| **Intentional differences** | Recorded framework/DOM adaptations (B, fixed to the same result) or deliberate Ultimate differences (C), and D scope. | A row per difference, with class and ruling (§5).                      |
| **Open gaps**               | Real differences still to fix (A).                                                                                    | A GAP ID, linked from the status row.                                  |

**Source parity is an input, never the verdict.** A component is parity-verified only by the rendered comparison.

### 2.2 Order of authority for a visual or behavior question

_Amended by user decision (§11):_

1. **PrimeNG rendered at the pinned ADR-048 version** — the oracle for Angular parity.
2. **PrimeVue rendered at the pinned ADR-048 version** — the oracle for Vue parity.
3. **Prime source** (the committed fixture, the vendor tarballs) — diagnostic evidence used to explain and locate a difference; not the rendered oracle.
4. **Ultimate screenshot baselines** — regression evidence only. They protect a state once it is verified; they are not the parity oracle.

ADR-048 is unchanged: the pinned versions stay authoritative, and newer Prime releases are never rendered as a reference.

---

## 3. Canonical case matrix

### 3.1 Where the cases come from

Prime's own showcase sections for the pinned version are the candidate list: `apps/showcase/doc/<component>/*Doc.vue` in `primevue-4.5.5.tar.gz`. They are the cases Prime itself considers worth showing, and they are versioned with the baseline.

- **Keep** sections that change appearance or behavior (Basic, Severity, Position, Size, Template, …).
- **Skip** Import, Accessibility, PT, Headless/Unstyled, Theming and pure-API sections.
- **Add** only the state axes that apply: hover, focus-visible, disabled, open, invalid, loading, RTL.

### 3.2 Rules that keep it small

- **One axis at a time.** Each case moves one axis from the default. No Cartesian product.
- **Combine only where Prime interacts.** A combined case is allowed only when the two axes visibly interact (Drawer position × RTL).
- **Variant strips.** All values of one appearance axis (severities, sizes) render side by side in one case and one capture.
- **Tier caps** (§7): Tier A ≤ 12 cases, Tier B ≤ 6, Tier C ≤ 3.
- **Unsupported case → class D.** If Ultimate does not support the case (no such prop), it is recorded as D, not built.
- **Ultimate side reuses existing stories.** Each case maps to a Storybook story id plus a state action (the existing X-6 helpers). A missing story is a coverage gap; a story is added only for a canonical case.

### 3.3 Examples

**Message (Tier B)** — showcase: Basic, Severity, Icon, Closable, Outlined, Simple, Sizes, Dynamic, Life, Forms.

| Case          | Source section | Note                                                                  |
| ------------- | -------------- | --------------------------------------------------------------------- |
| default       | Basic          |                                                                       |
| severities    | Severity       | one strip                                                             |
| icon          | Icon           |                                                                       |
| closable      | Closable       | also hover/focus on the close button                                  |
| outlined      | Outlined       | **D** if Ultimate has no `variant` — G3 omitted these groups (D-G3-3) |
| simple, sizes | Simple, Sizes  | **D** for the same reason                                             |

Dynamic, Life and Forms are behavior/integration demos; they are skipped.

**Drawer (Tier A)** — showcase: Basic, Position, Size, FullScreen, Template.

| Case                   | Kind                                                      |
| ---------------------- | --------------------------------------------------------- |
| left (default) open    | visual + probe                                            |
| right / top / bottom   | visual + probe (3 cases)                                  |
| full                   | visual + probe — positive control for GAP-097             |
| left in RTL            | visual + probe (position × RTL interact)                  |
| header/footer template | visual + probe                                            |
| close-button focus     | visual                                                    |
| open / close           | behavior: mask, focus moves in, Esc closes, focus returns |
| closed footprint       | behavior: no layout space when closed                     |

---

## 4. Rendering Prime and comparing

### 4.1 The reference harness

A private, never-published workspace app: `tooling/prime-reference/` (the `tooling/` directory is empty today).

- **Stack.** Vite + Vue 3 + **PrimeVue 4.5.5** with the **Aura** preset from **`@primeuix/themes` 2.0.3**, styled mode, Prime defaults, no customization.
- **Versions.** Exact `primevue` and `@primeuix/themes` pins. The `@primeuix/*` transitive versions are whatever PrimeVue 4.5.5's published manifest resolves to, frozen by the lockfile. A check fails if any resolved Prime package is outside ADR-048 (no PrimeVue 5.x, no `@primeuix/*` 3.x).
- **Prime as Prime ships.** The harness loads Prime's base style and theme exactly as a Prime app does. That is the point: the oracle includes Prime's global layer.
- **Page environment matches the Ultimate Storybook canvas.** Same viewport (1280 × 720), background, body padding (Storybook "padded", 1 rem), root font size and font stack. Each run first compares an environment probe (computed `body` font-family, font-size, background, padding) between the harness and both Storybooks, and stops if they differ.
- **Cases.** One file per component, `tooling/prime-reference/cases/<component>.ts`, each case a small Vue template. Route `/#/<component>/<case>`. Files exist only for components that are being verified.
- **Policy.** PrimeVue 4.5.5 is MIT (ADR-048). It is a dev-only tool dependency. No `packages/*` package depends on it; the existing `validate-dependency-ceiling.mjs` already forbids that, and gets a small extension for the harness pins.

### 4.2 Why one Vue harness serves both Angular and Vue (proposed; **superseded by P-2**, §11)

_Superseded:_ PrimeNG is the oracle for Angular and PrimeVue for Vue. The shared styles stay diagnostic context only. The text below is kept as proposed.

PrimeNG 21.1.9 and PrimeVue 4.5.5 both consume `@primeuix/styles` 2.0.3 and `@primeuix/themes` 2.0.3 (their workspace catalogs). Their rendered appearance comes from the same CSS and tokens. One PrimeVue harness is therefore the visual oracle for Ultimate Angular and Ultimate Vue alike.

A PrimeNG harness is added only by decision, when an Angular-specific behavior is the question, or if the pilot shows PrimeNG and PrimeVue render a canonical case differently. Risk: PrimeNG host elements could change a layout that PrimeVue renders differently. This is decision **P-2**.

### 4.3 Capture

One Playwright spec with its own config, `tooling/prime-reference/playwright.config.ts`. The root config and its 12 projects stay unchanged. Chromium only, in the existing Docker image `mcr.microsoft.com/playwright:v1.63.0-jammy`. Cross-engine differences are already covered by Ultimate's own baselines.

For each case, three renders: Prime, Ultimate Angular, Ultimate Vue.

1. Open the route or story; apply the state with the shared X-6 helpers (real trigger, pointer parked, state attribute and computed `display`, motion settled).
2. Screenshot the component root, or the viewport for overlays.
3. Run the **probe** on up to four named parts.

### 4.4 The probe

A per-component part map, Prime selector ↔ Ultimate selector (for example `.p-drawer` ↔ `.u-drawer`, `.p-drawer-header` ↔ `.u-drawer-header`). The G3 port scripts already contain these mappings.

For each part:

- **Geometry:** width, height, and offset from the root (or from the anchor, for overlays).
- **About ten computed properties:** `color`, `background-color`, border widths and colors, `border-radius`, `padding`, `font-size`, `font-weight`, `line-height`, `box-shadow` (none / present), `opacity`, `display` / `visibility`, `box-sizing`.

### 4.5 Output and verdict

- `test-results/prime-parity/<component>/<case>.{prime,ng,vue,diff}.png`, a `report.json`, and a generated Markdown summary.
- **Match:** geometry within ±1 px, computed values equal, and the side-by-side review shows no visible difference.
- The pixel-diff ratio is reported but is advisory: different DOM and anti-aliasing make it noisy.
- **No CI gate at first.** The verdict is recorded in the status table with the commit it was measured at. Turning the probe JSON into a CI check later is a separate decision.

### 4.6 Behavior (Tier A, interactive Tier B)

A short list of observable assertions per component, run as the same script against Prime and Ultimate through the part map. For example:

- the trigger opens the overlay; the overlay is anchored at the same offset (±2 px);
- focus moves to the same part; Esc closes and focus returns;
- arrow keys move the active item the same way;
- RTL mirrors the same way;
- the closed state takes the same layout space.

Prime's result is the expected value. There are no screenshots for behavior.

### 4.7 Reference images

Proposed: the Prime captures are not committed at first. The pinned Prime render is deterministic, so it can be regenerated. The durable evidence is the status row plus a per-component summary in the tranche closeout. Committing the reference PNGs is decision **P-3**.

---

## 5. Difference classification

### 5.1 Before classifying

- **Harness artifact first.** If the environment probe, a story decorator, a font or a fixture causes the difference, fix the harness. It is not a product difference.
- **Material threshold.** A difference is classified only if it is material: geometry differs by more than 1 px on a probed part; a probed color, border, radius, padding or font differs; a visible element is missing or extra; a state looks different; or a behavior assertion gives a different result. Anything below the threshold is a **Match** and is not recorded.

### 5.2 Classes

| Class | Meaning                                                                                  | Action                                                                                                                 | Who decides                                                |
| ----- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **A** | Real parity defect. Ultimate should match and does not.                                  | Fix in the current tranche if in its scope; otherwise register a GAP. The status becomes `open-gap`.                   | Proposed by the agent, confirmed at the gate               |
| **B** | Framework/DOM adaptation. The DOM or runtime differs, but the result should be the same. | Fix the adaptation (selector mapping, state carrier, wrapper-aware rule). X-2 still applies: no DOM change by default. | Agent, recorded                                            |
| **C** | Intentional Ultimate difference, deliberate and justified.                               | Document; do not fix.                                                                                                  | **User ruling** required                                   |
| **D** | Non-applicable Prime behavior/feature, outside Ultimate's supported scope.               | Record in the case matrix; build nothing.                                                                              | Agent, recorded (existing FX/D-G3-3 exclusions carry over) |

**No code change before the classification is recorded.** A visual mismatch never turns into a code change by itself.

### 5.3 Guards against the loop

1. **Material threshold** (§5.1). Sub-threshold detail is never a work item.
2. **One comparison pass per component per tranche, plus one re-run after fixes.** A new difference that appears only in the re-run is recorded. It is fixed in the same tranche only if it is class A on a canonical case.
3. **No new convention from one difference.** A cause shared by many components (the base `border-box` layer is the first) is handled once, as its own cross-cutting item.
4. **Stop rule.** If a fix seems to need a new rule category, a new ADR or a second fix iteration on the same case, stop and ask.

---

## 6. Definition of Done and status model

### 6.1 Two columns per component × framework

**Source:** `ported` | `not ported` | `Ultimate-specific` (D-G3-8 structures).

**Verification:**

| Value                       | Meaning                                                             | The requested status it covers                            |
| --------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| `pending`                   | No rendered Prime comparison yet.                                   | "Source-port complete" + "Visual verification pending"    |
| `partial`                   | Some canonical cases compared, the rest pending; no open A.         | "Partially verified"                                      |
| `verified`                  | Every canonical case for the tier is a Match, or a B that is fixed. | "Parity verified"                                         |
| `verified-with-differences` | As `verified`, plus at least one recorded C or D.                   | "Parity verified with documented intentional differences" |
| `open-gap`                  | At least one A is unresolved; the row links the GAP.                | "Open parity gap"                                         |

### 6.2 Definition of Done

A component is parity-done when Verification is `verified` or `verified-with-differences`. A tranche closeout reports both columns. "Tranche complete" keeps its current meaning, the source port, and makes no parity claim.

Nothing is promoted retroactively. Every existing component starts at `pending` until a comparison is run.

### 6.3 Where the status lives

A table in the new Playbook document (§9), one row per component, with ng and vue cells, the measured commit, and links to the GAP or the C/D records. `COMPONENT_INVENTORY.md` is not touched; its 11-column tables serve a different purpose.

---

## 7. Risk tiers

### 7.1 Criteria

- **Tier A** — positioned or overlay surfaces, keyboard-navigable composites, or components with several state axes that interact. Up to 12 cases plus a behavior script.
- **Tier B** — moderate structure, a few variants or one interaction. Up to 6 cases; behavior only if interactive.
- **Tier C** — leaf, mostly static elements. Up to 3 cases (default plus one variant strip). More only if a difference is found.

### 7.2 Proposed assignment for the 48 G3 keys (decision P-4)

| Tier       | Keys                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A (16)** | accordion, tabs, stepper, tieredmenu, contextmenu, menubar, megamenu, panelmenu, drawer, popover, confirmpopup, toast, splitbutton, speeddial, carousel, galleria                                                  |
| **B (20)** | panel, fieldset, inplace, scrollpanel, splitter, breadcrumb, dock, steps, confirmdialog, message, inlinemessage, knob, metergroup, timeline, image, imagecompare, dataview, orderlist, picklist, organizationchart |
| **C (12)** | avatar, chip, tag, skeleton, overlaybadge, progressbar, progressspinner, terminal, card, divider, toolbar, blockui                                                                                                 |

Rough size: about 160 + 100 + 24 ≈ 280 cases, each rendered three times. That is why verification is scheduled per family (§10), not run in bulk. Components outside G3 (the proof set, Tranche 1 components) get a tier when they are first selected.

---

## 8. How the existing evidence maps to the new model

### 8.1 Per tranche

| Work                       | Genuinely closed (stays closed)                                      | Evidence type                                        | Prime-rendered evidence | Ultimate-only visual evidence               | Known gaps / follow-ups                                                                                 | New status              |
| -------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| Batches 1–3 (71 modules)   | Preset modules ported, CI fidelity against the upstream JSON fixture | Source (token data)                                  | None                    | n/a (tokens render only through components) | —                                                                                                       | Source parity only      |
| Tranche 1 (16 ng / 17 vue) | Key wiring (ADR-051), 3 module ports                                 | Source + Ultimate screenshots                        | None                    | 134 baselines                               | RadioButton under tolerance; IconField/InputGroup stories (NG0304); FloatLabel not floating; FileUpload | ported / `pending`      |
| G3-A (13 ng / 14 vue)      | F5 + F4 ported                                                       | Fidelity, Ultimate screenshots                       | None                    | 93 ng / 102 vue baselines                   | ~29 selector parts per framework have static evidence only (cross-tranche F-2, class U)                 | ported / `pending`      |
| G3-B (10 / 10)             | F1 ported                                                            | Fidelity, Ultimate screenshots, layout checks        | None                    | 138 accepted                                | U1 ScrollPanel story, U2 Card WebKit, BlockUI story                                                     | ported / `pending`      |
| G3-C1 (5 / 5)              | F2 navigation ported                                                 | Fidelity, Ultimate screenshots, layout checks        | None                    | 72 accepted                                 | Dock screenshots prove nothing; Angular Stepper groups unreachable (E3)                                 | ported / `pending`      |
| C2-0, D-0 runtime fixes    | ContextMenu, overlay-anchoring fixes                                 | Ultimate e2e (behavior)                              | None                    | none (layout assertions only)               | —                                                                                                       | Behavior: Ultimate-only |
| G3-C2 (5 / 5)              | F2 menus ported, X-4 runtime roles, reach tests                      | Fidelity, reach, Ultimate screenshots, layout checks | None                    | 105 accepted                                | GAP-084, GAP-085, GAP-086; accepted coverage gaps                                                       | ported / `pending`      |
| G3-D (6 / 6)               | F3 + F8 ported, F-D1..F-D3 fixes                                     | Fidelity, reach, Ultimate screenshots, layout checks | None                    | 102 updated                                 | GAP-096, GAP-097 (known red CI step)                                                                    | ported / `pending`      |

### 8.2 Summary

- **Genuinely closed:** every source-port deliverable above, its fidelity and reach tests, the size and accessibility records, and the Ultimate baselines as regression guards. None of it is reopened.
- **Source/CSS parity work:** all of G3-A..G3-D and Tranche 1.
- **Prime-vs-Ultimate rendered evidence:** none, in any tranche. No research, Spec, Plan or closeout records a rendered Prime reference.
- **Ultimate-only visual evidence:** every tranche's baselines (672 G3 PNGs across ng and vue at `4c099a9`).
- **Unverified:** visual and behavioral parity for every component.
- **Known open gaps:** GAP-084..086, GAP-096, GAP-097; the U1/U2/BlockUI/IconField/InputGroup story items; the base `border-box` finding (§1.2, not yet registered).
- **To promote a component to verified:** run its tier's canonical matrix once and classify the differences. Existing GAPs become the A rows they already describe; existing FX/D-G3-3 exclusions become D rows.

---

## 9. Minimum tooling and documentation changes

| #   | Change                                                                                                    | Size                                     |
| --- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | `tooling/prime-reference/`: Vite + Vue app with PrimeVue 4.5.5 and Aura, pinned; per-component case files | Small app; case files grow per component |
| 2   | One Playwright spec + its own config (Chromium, Docker); capture, probe, side-by-side, `report.json`      | One spec plus a part map per component   |
| 3   | `validate-dependency-ceiling.mjs`: assert the harness's resolved Prime versions stay within ADR-048       | About 10 lines                           |
| 4   | `docs/architecture/PARITY_PLAYBOOK.md`: §2–§7 of this proposal in normative form, plus the status table   | One document                             |
| 5   | `AGENTS.md` §6: one row pointing to the Playbook                                                          | One line                                 |

**Not needed now:** a new CI job; a PrimeNG harness (P-2); committed reference images (P-3); a new ADR. ADR-048 could get a one-paragraph addendum saying a "parity verified" claim needs rendered-reference evidence (decision P-6); the Playbook alone is also enough.

**Unchanged:** the root Playwright config and its projects, the existing baselines and validators, X-1..X-12 and D-G3-1..9. Fidelity and reach tests keep their role as source-parity checks.

---

## 10. Migration path

1. **Approve this proposal** and decisions P-1..P-7 below.
2. **Playbook document** (docs-only branch): write `PARITY_PLAYBOOK.md` and seed the status table honestly. Every G3 and Tranche 1 component is `ported` / `pending`; nothing is marked verified.
3. **Pilot** (one small authorized work item): build the harness and run three components that test the method:
   - **Drawer (A)** — positive control: the method must reproduce GAP-097's `full` difference;
   - **Message (B)** — exercises D rows (outlined, simple, sizes);
   - **Tag (C)** — negative control: a simple component expected to match.

   Exit criteria: the environment probes are equal; the Drawer `full` difference is detected; one component matches; the time per case is measured. If the pilot fails these, the method is revised before anything else.

4. **Route the base-style finding.** After the pilot confirms it in the browser, register it as one cross-cutting GAP (decision P-7). Its fix is separate, authorized work, and probably changes many components at once, so it should come before backfilling.
5. **G3-E under the new Playbook.** Research includes the canonical matrix from the showcase. The CSS port remains the means; the Definition of Done is the Verification column.
6. **Backfill G3-A..G3-D,** Tier A first, one family per small authorized item. Findings are classified and fixes batched per family.
7. **Later, optional:** a CI check on the probe JSON for verified components. Separate decision.

---

## Decisions requested

- **P-1** — Adopt the six-claim model, the two-column status, the A/B/C/D classification with the material threshold, and the loop guards (§2, §5, §6).
- **P-2** — One PrimeVue harness as the visual oracle for both Angular and Vue; a PrimeNG harness only by later decision (recommended). Alternative: build both now.
- **P-3** — Do not commit Prime reference images at first (recommended), or commit them for verified components.
- **P-4** — The tier criteria and the 16 / 20 / 12 assignment (§7).
- **P-5** — The pilot set (Drawer, Message, Tag), and the pilot runs **before** G3-E (recommended).
- **P-6** — No new ADR (recommended), or a one-paragraph ADR-048 addendum.
- **P-7** — Register the base `border-box` finding as a GAP after the pilot confirms it (recommended), or now on the static evidence.

---

## 11. User decisions (2026-10-08)

1. **P-1 — approved.** The six claims; source parity is an input/evidence category, never the verdict. The A/B/C/D classification, the material threshold, the loop guards, the two-column Source / Verification status and no retroactive promotion are approved. A component is fully parity-verified only when its canonical rendered cases have actually been compared against the appropriate Prime reference.
2. **P-2 — amended.**
   - PrimeVue rendered = authoritative reference for Ultimate Vue; PrimeNG rendered = authoritative reference for Ultimate Angular.
   - The shared `@primeuix/styles` / `@primeuix/themes` versions stay part of the diagnostic/source story; they do not prove identical rendered output.
   - Keep the PrimeVue reference harness. Design the harness so a PrimeNG reference is added with minimal duplication. Do not build a full duplicate PrimeNG system before the pilot.
   - The pilot includes enough Angular-vs-PrimeNG validation to establish whether a PrimeVue-as-shared-oracle assumption is safe. If shared-styling cases render identically, record that fact, but never as a blanket assumption for framework-specific behavior.
   - For Angular-specific DOM, layout, host-element, interaction or runtime behavior, PrimeNG is authoritative.
   - Avoid two large independent testing systems.
3. **P-3 — approved.** Prime reference PNGs are not committed at first; they are regenerated from the pinned versions. Durable evidence: the measured commit, case matrix, probe results, generated summary and closeout. Committing images remains a later decision.
4. **P-4 — approved.** The tiers, the caps (A ≤ 12 + behavior where applicable; B ≤ 6 + behavior when interactive; C ≤ 3) and the 16 / 20 / 12 assignment. No Cartesian combinations.
5. **P-5 — approved.** Pilot before G3-E: Drawer (Tier A, positive control), Message (Tier B, with D cases), Tag (Tier C, negative control). Required outcomes: stable environment probe; the Drawer sizing difference detected; at least one genuine match; output useful for human review; effort per case and per component measured; Angular reference handling validated against PrimeNG well enough to confirm the harness architecture. If the method misleads or costs too much, stop and revise it before G3-E. G3-E does not begin until the pilot passes its exit criteria.
6. **P-6 — approved.** No new ADR and no governance overhead. `PARITY_PLAYBOOK.md` is the normative home of the process. ADR-048 stays the authoritative baseline decision and is referenced directly.
7. **P-7 — amended.** Register the base `border-box` issue now as a cross-cutting GAP, on the existing static and Drawer browser evidence. The pilot validates that the method detects it; it does not decide whether the finding is real. Not fixed by the Playbook work or the pilot; remediation is a separate authorized item. Registered as **GAP-098**.
8. **Oracle wording.** §2.2 is made framework-aware (PrimeNG for Angular, PrimeVue for Vue, source diagnostic, baselines regression evidence), and this is explicit throughout the Playbook.
9. **Sequence approved:** (1) register the border-box GAP; (2) write `PARITY_PLAYBOOK.md`; (3) build the smallest viable reference harness architecture; (4) run the pilot; (5) review and adjust the method; (6) G3-E only after pilot approval; (7) backfill G3-A..G3-D, Tier A first, against actual Prime-rendered references; (8) CI gating later, separately.
10. **Scope guard.** No G3-E implementation; no change to component CSS, runtime behavior, stories, baselines or CI gates as part of this approval; G3-A..G3-D are not reopened (their source-port work stays closed; the new work is verification/backfill); known gaps stay separate; a new mismatch is classified first and never becomes a CSS rule automatically. Steps (1) and (2) proceed now as docs-only work; stop before the pilot implementation.
