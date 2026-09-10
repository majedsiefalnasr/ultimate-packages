# Specification: Phase 10 Track A — Browser / Visual / Accessibility

**Document:** `docs/superpowers/specs/2026-09-10-phase-10-browser-visual-accessibility-design.md`
**Status:** Draft for review
**Companion research:** `docs/architecture/research/2026-09-08-phase-10-production-hardening.md`
**Companion architecture discussion:** `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` (§2, §3, §10, §11, §12)
**Related, already-recorded decision:** `docs/architecture/DECISIONS.md` ADR-044 (DECISION-A — Storybook + Playwright, distinct responsibilities)
**Related, already-implemented:** `docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md` (Track B — CI/Security/Quality Gates, merged `6428d01`); `docs/superpowers/specs/2026-09-09-phase-10-operational-documentation-design.md` (Track D — Operational Documentation, merged `2b671e4`)
**Baseline:** `main` at `2b671e4` (Track D merged)

**Status detail:** Draft for review. This document contains no implementation — no new files are created, no existing files are edited, no dependency is installed, no CI workflow is changed. It is implementation-ready only after Spec Review approves (or amends) the decisions in §7. Every requirement below is justified by (1) a Blueprint citation, (2) a verified repository fact, (3) an architecture-discussion decision (§2/§3/§12 in particular, already accepted as ADR-044 for the tooling fork), or (4) an explicitly labeled specification-level decision. DECISION-A itself is **not reopened** — this document only resolves the items its own §12 left for Specification.

**Amendment history:** Amended once, in response to a Spec Review verdict of "APPROVE WITH REQUIRED AMENDMENTS," resolving 2 Blockers (accessibility baseline/grandfathering contract, R4.5-R4.11; Angular-specific standalone coverage, §5/R1-R5) and 2 Important findings (axe ruleset precision, D3; CI framework parallelism/failure-isolation contract, D4/R6.1). D1, D2, and D5 are unchanged from the original draft — none of the four required amendments necessitated revisiting them. DECISION-A/ADR-044 was not reopened by this amendment pass.

---

## 1. Context / Problem Statement

Blueprint §35 lists eight Phase 10 objectives with no internal breakdown, including "accessibility" and "browser compatibility." The architecture discussion (`2026-09-08-phase-10-architecture-discussion.md` §1) clustered these into five sub-tracks (A–E); Track A is "testing/browser/visual/accessibility infrastructure." Tracks B and D are now merged (`6428d01`, `2b671e4`). Track A was found independently unblocked once DECISION-A resolved the one real architectural fork in its scope (§2 of that discussion) — **which tool(s) provide visual regression and real-browser/cross-browser interaction testing** — recorded as ADR-044.

Verified directly against `main` at `2b671e4` for this Specification's own research (not assumed from any prior document):

- Zero references to `storybook`, `@storybook/*`, `playwright`, `@playwright/*`, `axe-core`, `@axe-core/*`, `jest-axe`, `chromatic`, or `percy` anywhere in root `package.json` or any `packages/*/package.json` (`grep -riE` across all 17 package manifests, zero matches).
- No `.storybook/` directory, no `playwright.config.*`, no `*.stories.*` file anywhere in the repository.
- Every framework package's test environment is `jsdom` (confirmed directly in `packages/react-core/vitest.config.ts`: `environment: "jsdom"`), or Angular's `TestBed` (also a simulated DOM, not a real browser engine) — matches `BLUEPRINT_GAPS.md` GAP-035's own evidence exactly.
- `.github/workflows/ci.yml` is a single linear job (`ci:`) with 25 steps ending at "AI package boundary validation" — zero existing browser/UI-testing step.
- Root `package.json`: `"engines": { "node": ">=20.0.0" }`, `"packageManager": "pnpm@9.6.0"`.

This track's job is to close the gap between "zero real-browser/visual/accessibility tooling" and Blueprint §28/§30/§40's stated requirements, using the tooling ADR-044 already chose.

---

## 2. Existing Constraints and Architectural Decisions (not reopened)

### ADR-044 / DECISION-A (binding, quoted verbatim from `docs/architecture/DECISIONS.md:189-191`)

> **ADR-044 — Phase 10 testing/documentation tooling: Storybook + Playwright, distinct responsibilities**
> Status: Accepted (architecture discussion 2026-09-08-phase-10-architecture-discussion.md §2). Storybook is adopted as the platform's component documentation/testing surface (Blueprint §27) and as the mechanism for visual-regression coverage (§28). Playwright is adopted as the mechanism for real-browser and cross-browser interaction testing (§28/§31) and for SSR/hydration verification (§31) once a minimal servable harness exists (see the SSR/GAP-008 scope decision, §5). The two tools have non-overlapping primary responsibilities and both remain additive to the existing Vitest/jsdom/TestBed unit-and-component testing tier, which is unchanged. Specific screenshot-diff mechanism, CI job structure, and per-framework Storybook instance topology are deferred to Specification.

This Specification treats ADR-044's tool choice, the non-overlapping-responsibility split, and "additive not replacing" as fixed inputs. It resolves exactly the four items ADR-044's own text and the architecture discussion's §12 named as deferred to Specification:

1. Which screenshot-diff mechanism Storybook uses.
2. CI job structure/runtime budget for the new tiers.
3. Per-framework vs. unified Storybook instance topology.
4. axe-core (or equivalent) integration point for GAP-005.

### Blueprint sections this Specification is directly traceable to

| Section | Text (verbatim, `docs/architecture/BLUEPRINT.md`) | Relevance |
|---|---|---|
| §27 Storybook and Documentation (lines 871-888) | "Storybook is a platform documentation/testing surface, not a separate design system. It should expose the Ultimate component experience consistently across frameworks where practical. Documentation should combine: component API, behavior, usage, accessibility, theming, examples, framework-specific notes, AI guidance where useful." | R1 (Storybook integration), R7 (documentation contract) |
| §28 Testing Strategy — Visual Regression (lines 925-927) | "Use stable theme/component combinations." | R3 (visual regression contract) |
| §28 Testing Strategy — Accessibility subsection (lines 929-931) | "Automated checks plus targeted keyboard/screen-reader behavior tests." | R4 (accessibility automation contract) — note this explicitly does NOT replace existing hand-written keyboard/ARIA assertions, it adds automated scanning alongside them |
| §28 Testing Strategy — Cross-framework Contract Tests (lines 921-923) | "Where meaningful, shared component contracts should have equivalent test expectations across Angular, React, and Vue." | R5 coverage-parity requirement |
| §30 Accessibility Strategy (lines 965-980) | "Accessibility must be treated as a platform responsibility... Accessibility regressions are release blockers for affected components." | R4, R8 (failure/evidence semantics — a11y failures block, not warn) |
| §31 Performance Strategy — SSR/hydration line (line 996) | "SSR/hydration behavior" listed as a measurement | Explicitly OUT of this Specification (Track E's scope) — cited only to draw the boundary |
| §40 Definition of Done (lines 1343, 1346) | "accessibility validation," "visual regression coverage" | Both are Phase-10 production-readiness gates this track closes |

**No Blueprint section specifies a browser support matrix** (specific browser names/versions). Re-grepped `docs/architecture/BLUEPRINT.md` directly for "Chrome", "Firefox", "Safari", "WebKit", "Chromium" during this Specification's own research — zero matches anywhere in the document. §35's Phase 10 objective list names "browser compatibility" as a goal but does not enumerate which browsers. This Specification does not invent a matrix beyond what Playwright itself ships by default (§10).

### Non-goals inherited from the architecture discussion (binding, restated)

- Does not decide anything DECISION-A already decided (tool choice, responsibility split) — reopening that decision is out of scope per the task brief.
- Track E (SSR/hydration) — explicitly deferred; this Specification does not build any SSR harness, though R2's Playwright installation is the dependency Track E's own future Specification will build on (§9 of the architecture discussion: soft-dependency, not this track's job to resolve).
- Track C (release engineering), Track B (already merged) — no overlap, no re-litigation.
- CONTRIBUTING.md, ROADMAP.md edits, unrelated GAP bookkeeping — out of scope per this task's explicit constraints.

---

## 3. Goals

- G1: Give every Ultimate component a real Storybook documentation/testing surface, satisfying Blueprint §27.
- G2: Establish an automated, CI-enforced visual-regression tier using stable theme/component combinations, satisfying Blueprint §28.
- G3: Establish automated accessibility scanning (axe-core) as a new, additive tier alongside existing hand-written keyboard/ARIA assertions, satisfying Blueprint §28/§30 and closing GAP-005.
- G4: Establish real-browser, cross-browser interaction testing via Playwright, closing GAP-035.
- G5: Wire all of the above into CI as enforced gates (not merely locally runnable scripts), consistent with this repository's Track B precedent of CI-enforced quality gates.
- G6: Do this without duplicating, replacing, or destabilizing the existing Vitest/jsdom/TestBed unit-and-component tier, per ADR-044's explicit "additive" constraint.

## 4. Non-Goals

- Not building a component-documentation *content* authoring pass beyond what's needed to render each component in Storybook (deep usage-guide prose, migration guides, etc. — that is ongoing documentation work, not a one-time Track A deliverable).
- Not selecting or building a commercial visual-regression SaaS account (Chromatic, Percy, Applitools) — this Specification decides the *mechanism class* (§7, D1) but does not create or configure any third-party service account, which is outside a code-only Specification's authority.
- Not building any SSR harness or exercising hydration (Track E).
- Not achieving a specific WCAG conformance *level* certification — this Specification wires axe-core's default ruleset (§7, D3) but does not commission a manual WCAG audit.
- Not touching Track B's existing CI steps, thresholds, or scripts.
- Not modifying `package.json`, CI workflows, source code, tests, or any repository configuration — this document specifies; it does not implement.
- Not deciding whether Phase 10's five sub-tracks get formal numbering — unrelated bookkeeping, out of scope.

---

## 5. Component / Framework Coverage

Verified directly against `main` at `2b671e4` (not from `COMPONENT_INVENTORY.md`, which documents the PrimeNG *source* inventory, not Ultimate's current shipped component set):

| Framework | Components (verified file listing) | Count |
|---|---|---|
| `@ultimate/ng` | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip, Fluid, Badge, plus 2 directives (Ripple, AutoFocus) | 10 components + 2 directives |
| `@ultimate/react` | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip | 8 components |
| `@ultimate/vue` | Button, Checkbox, Dialog, Menu (+ Menuitem), Paginator, Scroller, Table, Tooltip | 8 components |

**Coverage contract (amended per Spec Review Blocker 2 — cross-framework parity and standalone coverage are two separate questions, not one):**

The **shared 8-component set present in all three frameworks** (Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip) is the **cross-framework parity baseline** — the set Blueprint §28's "Cross-framework Contract Tests" clause names as needing "equivalent test expectations across Angular, React, and Vue." R5's parity scenarios (identical interaction assertions implemented per framework, diffed for behavioral consistency) apply to this set only, since parity is meaningless without a counterpart to compare against.

Angular's two additional components (Fluid, Badge) and two directives (Ripple, AutoFocus) have no React/Vue equivalent, so they are correctly excluded from R5's *parity* scenarios — but Blueprint §40's Definition of Done lists "visual regression coverage" as a flat, platform-wide production-readiness item (`docs/architecture/BLUEPRINT.md:1343`, no framework-count qualifier anywhere in that line or its surrounding list), and these four items are real, currently-shipped `@ultimate/ng` UI, not scaffolding. Excluding them from visual-regression or interaction-testing coverage entirely would leave real shipped UI permanently unprotected by Track A, which nothing in the Blueprint justifies.

Therefore: **every component/directive Angular ships (all 10 components + 2 directives) gets full standalone Track A coverage** — Storybook (R1), visual regression (R3), accessibility (R4), and Playwright interaction testing (R2) — identically to the shared 8-component set. The only thing Fluid/Badge/Ripple/AutoFocus are excluded from is R5's cross-framework *parity comparison* specifically (there is no React/Vue counterpart to diff against, which is the one part of "coverage" that genuinely requires a counterpart). This is a narrower, more precise exclusion than the prior draft's blanket exclusion from R3/R2 — parity and standalone coverage are reconciled as two separate contracts, not conflated into one.

**Theme scope:** `packages/themes` ships exactly one preset (`aura`, verified via `packages/themes/src/presets/aura/`, covering `base`, `button`, `checkbox`, `dialog`, `menu`, `tooltip` token files). All visual-regression work in this Specification targets the Aura preset — there is no second theme to test against yet. This matches GAP-004's own "Existing reusable infrastructure" note citing "`packages/themes`' Aura preset... as a ready-made target surface."

---

## 6. Requirements

### R1 — Storybook integration (documentation/testing surface)

**Requirement:** Add a Storybook instance per framework package that ships components (`ng`, `react`, `vue`) — **not** a single unified multi-framework instance.

**Specification decision (resolves architecture discussion §12 item "per-framework vs. unified Storybook instance topology"):** see §7, D2.

Each instance must:
1. Render every component that framework ships (§5's amended coverage contract) — the shared 8-component set plus, for Angular, its framework-specific extras (Fluid, Badge, Ripple, AutoFocus). All of these get full R1/R2/R3/R4 coverage; only R5's parity comparison is scoped to the shared 8-component set (§5).
2. Author one story file per component, covering: default state, key documented prop variations (e.g., Button's severity/size variants, Checkbox's checked/indeterminate/disabled states — sourced from each component's own existing test file, which already exercises these states, not invented fresh), and at minimum one interactive state where applicable (e.g., Dialog open).
3. Surface accessibility metadata already present in `component-metadata` records (Blueprint §27's "accessibility" documentation requirement) via Storybook's own addon-a11y panel or equivalent — this is the *documentation display* of accessibility info, distinct from R4's *automated scanning*.
4. Build against the Aura theme preset (§5) — no theme-switcher is required by this Specification (no second theme exists to switch to).

**Framework-adapter note:** each framework has its own Storybook builder (`@storybook/angular`, `@storybook/react-vite` or `@storybook/react-webpack5`, `@storybook/vue3-vite`) — exact builder/bundler pairing is an implementation-plan-level detail (framework-idiomatic default, e.g. Vite-based builders to match this repo's existing Vite-based build tooling where applicable), not re-litigated here.

### R2 — Playwright integration (real-browser/cross-browser interaction testing)

**Requirement:** Install and configure Playwright as a new, separate test tier, distinct from Vitest.

1. Playwright drives real browser engines against each framework's Storybook instance (R1) — Playwright tests target rendered Storybook stories, not a separate hand-built test-harness app, avoiding duplicate component-mounting infrastructure. This reuses R1's investment directly (per ADR-044's own §2 option-(c) analysis: "gives Playwright a natural on-ramp... once a real page exists to point it at" — Storybook's dev-server-rendered pages are that "real page" for Track A's purposes; Track E's SSR-specific real page is a separate, later concern).
2. Default browser projects: Chromium, Firefox, WebKit — Playwright's own three built-in engines (§10, D5 records this as the specification-level default, since no Blueprint browser matrix exists to override it, per §1's confirmed zero-match grep).
3. Interaction assertions cover, per component (§5's amended coverage contract — every component a framework ships, not only the shared 8-component set): keyboard navigation/focus order, computed ARIA role/state via the accessibility tree (not just DOM attribute presence, which existing `TestBed`/`@testing-library`/`@vue/test-utils` tests already check), and any interaction Vitest/jsdom cannot faithfully simulate (e.g., real focus-visible behavior, real viewport-relative overlay positioning for Dialog/Tooltip/Menu).
4. Playwright tests must NOT duplicate assertions already covered by existing Vitest component tests (ADR-044's "additive tiers, not a replacement" constraint) — they add real-browser-only coverage, not a parallel copy of jsdom-passing assertions.

### R3 — Visual regression / screenshot-diff mechanism

**Requirement:** Establish automated visual-regression coverage using stable theme/component combinations (Blueprint §28 verbatim).

**Specification decision (resolves architecture discussion §12 item "screenshot-diff mechanism choice"):** see §7, D1.

1. Screenshot captures target every component's Storybook stories (R1 — §5's amended coverage contract: all components a framework ships, not only the shared 8-component set), across the states each story already defines (default + documented variants).
2. A screenshot diff that exceeds the chosen mechanism's default/configured threshold fails CI (R8 governs exact failure semantics).
3. Baseline images are versioned in the repository (mechanism-appropriate storage — exact path/format is an implementation-plan detail) and updated only via an explicit, reviewable change — never silently overwritten by a passing CI run.
4. Scope: every component (§5) × Aura preset (the only preset that exists) × each story's defined states. Not: every possible prop combination (unbounded) — story authors (R1) define which combinations are "stable" and worth diffing, per Blueprint §28's own "stable... combinations" phrasing. Angular's Fluid/Badge/Ripple/AutoFocus get their own standalone baseline entries, same as any other component — they are not compared against a React/Vue counterpart (R5 governs that separate, narrower exclusion).

### R4 — Accessibility automation (axe-core)

**Requirement:** Wire axe-core (or a maintained wrapper — see §7, D3) into the testing pipeline to close GAP-005.

**Specification decision (resolves architecture discussion §12 item "axe-core integration point for GAP-005"):** see §7, D3.

1. Automated axe scans run against every component's Storybook stories (R1 — all components, not only the shared 8-component set; see §5's amended coverage contract), reusing the same rendered surface R2's Playwright tests and R3's screenshots target — one render investment, three uses.
2. Scan ruleset: axe-core's own maintained default rule/tag configuration — this Specification does not invent a custom rule subset or a stricter/looser bar than the tool's own default. Exact tag behavior (which WCAG levels/versions the default configuration currently maps to) is verified against the pinned `axe-core`/`@axe-core/playwright` version at implementation time, not asserted here (no Blueprint section specifies a target WCAG conformance level — re-grepped `BLUEPRINT.md` for "WCAG," zero matches — so this Specification defers to whatever the chosen tool's maintainers currently ship as "default," rather than asserting a specific tag list this document cannot verify against an uninstalled package).
3. Per Blueprint §30 ("Accessibility regressions are release blockers"), a genuinely new axe violation is a CI failure (R8), not a warning. "New" is defined precisely by the accessibility baseline contract (R4.5-R4.11 below) — pre-existing, already-tracked violations do not fail CI merely by continuing to exist; introducing an *additional*, not-yet-tracked violation does.
4. This is explicitly **additive** to, not a replacement for, each framework's existing hand-written accessibility assertions (`TestBed`/`@testing-library`/`@vue/test-utils` tests already checking specific ARIA attributes, confirmed present per GAP-005's own "Existing reusable infrastructure" note) — those existing tests are untouched by this Specification.

**Accessibility baseline / grandfathering contract (resolves Spec Review Blocker 1):**

Adapted from, but not identical to, Track B's `docs/architecture/SAST_BASELINE.md` precedent — SAST's baseline is a one-time snapshot of a fixed, pre-existing codebase; Track A's Storybook stories are new artifacts this track itself creates incrementally, component by component, so the baseline must be able to grow as new stories are authored, not only be populated once. The one-way-door property (an entry is never removed except by fixing the underlying violation) is preserved; the "populated exactly once, then frozen" property is not, since it doesn't fit an incrementally-built surface.

5. **Storage:** A single committed file, `docs/architecture/ACCESSIBILITY_BASELINE.md`, in the same directory and following the same house format as `SAST_BASELINE.md` (a Markdown table: fingerprint / rule / component-story location / note), created by this track's own implementation (not by this Specification — this document only defines its required shape and semantics).
6. **Baseline-entry fingerprint:** `<axe rule ID>:<component-story identifier>:<CSS selector or target path axe reports for the violation>`, computed the same way `SAST_BASELINE.md`'s entries are computed from CodeQL's own fingerprinting concept, adapted to axe's actual violation-report shape (axe-core reports `id` (rule), `nodes[].target` (CSS selector path), and `nodes[].html` per violation — the fingerprint is derived from the first two, not the third, since rendered HTML can shift cosmetically without the violation itself changing).
7. **Grandfathering (pre-existing violations):** When a new Storybook story is first authored for a component (R1) and its first axe scan finds violations, every violation found on that **first scan** is recorded as a baseline entry and does not fail CI for that story going forward — this is the "previously-clean" concept's precise replacement: a component's baseline is established at the moment its story is first scanned, not asserted permanently clean before any scan ever ran.
8. **New-violation detection:** On every subsequent scan of an existing story, any violation whose fingerprint (R4.6) is **not** already present in `ACCESSIBILITY_BASELINE.md` is a genuinely new violation and fails CI (R8) — this is fully deterministic: a set-membership check against the committed baseline file, the same mechanical comparison `validate-sast-baseline.mjs` performs for SAST findings, adapted to axe's fingerprint shape.
9. **One-way-door / review control:** Per `SAST_BASELINE.md`'s own established contract, adding an entry to `ACCESSIBILITY_BASELINE.md` is a normal, reviewable PR change (visible in the diff, subject to the same PR review as any other change) — but unlike SAST's strict "never add after initial population" rule, Track A's baseline may grow over time as new stories are authored (R4.7), since new components enter Track A's coverage incrementally, not all at once. What remains one-way-door, matching SAST's principle exactly: an existing entry is **never removed** by anything other than fixing the underlying violation in the component's source (confirmed by the violation's fingerprint disappearing from a subsequent real scan, not by manually deleting the baseline row) — a baseline-only edit that removes an entry without a corresponding source fix is itself a defect for the review process to catch, exactly as `SAST_BASELINE.md`'s header comment already establishes for SAST findings. This same review-controlled addition mechanism also governs a later PR that introduces a genuinely new violation on an already-covered component/story: if the violation is consciously accepted rather than fixed, that PR may add the violation's fingerprint to `ACCESSIBILITY_BASELINE.md` in the same PR — subject to the identical normal-PR-review requirement as any other baseline addition (R4.9's first sentence), with the addition itself visible in the PR's diff, not a silent CI-side exemption; a PR that merely deletes or bypasses the check without adding a reviewed fingerprint entry does not satisfy this contract and remains a CI failure (R4.8).
10. **Fingerprint drift (an existing violation's identity changes):** If a component's source changes such that a previously-baselined violation's fingerprint no longer matches exactly (e.g., the CSS selector path shifts because of an unrelated markup restructuring, while the underlying accessibility defect is unchanged), the new scan reports a fingerprint CI has never seen — this is **treated as a new violation and fails CI** (R4.8's mechanical rule applies uniformly; this Specification does not attempt to detect "the same defect under a new fingerprint," which would require fuzzy matching this document does not specify). The correction is the same PR that caused the drift adding the new fingerprint to the baseline, with a note explaining the drift — an explicit, reviewable action, not silent baseline rot.
11. **Missing or malformed baseline file:** CI fails closed. If `ACCESSIBILITY_BASELINE.md` does not exist, or the check script cannot parse it, the accessibility gate fails outright rather than defaulting to "treat everything as new" (too permissive-by-accident is indistinguishable from a real regression under that framing) or "treat everything as grandfathered" (silently disables the gate) — this mirrors `validate-sast-baseline.mjs`'s own fail-closed posture on a missing/unreadable baseline.

### R5 — Cross-browser coverage / component-framework parity

**Requirement:** The shared 8-component set (§5) gets equivalent Playwright interaction-test *expectations* across all three frameworks, per Blueprint §28's Cross-framework Contract Tests clause. This requirement governs parity comparison specifically — it does not define or limit which components receive R2/R3/R4 coverage in the first place (§5's amended coverage contract governs that: every component a framework ships gets full standalone coverage).

1. A shared component's Playwright test scenarios (e.g., "Dialog: Escape key closes, focus returns to trigger") are defined once conceptually and implemented per-framework against that framework's own Storybook instance (R1) — not a single cross-framework test runner, since each framework's Storybook instance is a separate rendered surface.
2. Framework-specific components (Angular's Fluid, Badge, Ripple, AutoFocus) are **not required to have parity scenarios** under R5, since there is no React/Vue counterpart to diff against — this exclusion is scoped to R5's parity comparison only. It does not exclude them from R1 (Storybook), R2 (Playwright interaction testing, standalone), R3 (visual regression, standalone), or R4 (accessibility scanning) — each of those four applies to every component a framework ships, per §5's amended coverage contract, with no exception for framework-specific items.

### R6 — CI integration/topology

**Requirement:** Wire R1-R5 into `.github/workflows/ci.yml` as enforced gates.

**Specification decision (resolves architecture discussion §12 item "CI job structure/runtime budget"):** see §7, D4.

1. A new CI job for the Storybook/Playwright/axe tier, NOT folded into the existing single linear `ci:` job (confirmed 25 steps currently, per §1) — one workflow job at the GitHub Actions job level (D4 resolves and fixes this; R6.1 does not leave "job or jobs" open, it is one job, with framework-level parallelism inside it per D4's execution contract). This matches the architecture discussion's own flagged concern (§2, option (c) disadvantages: "does not by itself resolve CI-cost/runtime concerns... a second, slower test tier likely needs its own CI job rather than folding into the existing 20-step linear job").
2. This new job runs on every PR (matching Track B's existing gate cadence — no relaxed/optional cadence is introduced without a specific reason, since Blueprint §30 treats accessibility regressions as release blockers, not advisory).
3. Failure of any R2 (interaction)/R3 (visual)/R4 (accessibility) check, on any framework, fails the job, which fails the required-check gate on the PR — same enforcement model Track B established for its own gates (`audit:validate`, `sast:validate`, etc., all hard CI failures). D4's execution contract governs exactly how a single framework's failure propagates to the job's overall result without hiding the other two frameworks' outcomes.
4. This job must NOT modify, retune, or depend on any Track B script/gate — confirmed no shared file: Track B's 10 gates (`scripts/provenance/*.mjs`) and this track's new tier are entirely separate tool families.

### R7 — Documentation contract

**Requirement:** Storybook (R1) satisfies Blueprint §27's documentation requirement by combining, per component: API (sourced from `component-metadata` records, already generated per Track 6), behavior/usage (from the component's own existing prose/JSDoc where present), accessibility info (R4's ruleset results + any documented ARIA behavior), theming (Aura preset tokens), examples (the story's own rendered variants), and framework-specific notes (each framework's own Storybook instance is inherently framework-specific).

### R8 — Failure/evidence semantics

**Requirement:** Define what "pass" and "fail" mean for each new check type, since they are meaningfully different from Track B's pass/fail-only gates:

1. **Visual regression (R3):** fail = screenshot diff exceeds threshold. Evidence = the diff image itself, retained as a CI artifact for the PR author to review (not just a pass/fail line — a human needs to see *what* changed to judge if it's an intended change needing a baseline update, or a real regression).
2. **Accessibility (R4):** fail = a violation whose fingerprint is not already present in `docs/architecture/ACCESSIBILITY_BASELINE.md` (R4.5-R4.11's baseline contract governs precisely what counts as "new" — never a vague "previously-clean" judgment call). Evidence = axe's own violation report (rule ID, affected element, WCAG reference) surfaced in CI output/artifact — not just "accessibility check failed."
3. **Interaction (R2/R5):** fail = any Playwright assertion failure, same semantics as any test failure. Evidence = Playwright's own trace/screenshot-on-failure artifact (a Playwright-native capability, not something this Specification invents).
4. All three failure types block merge (R6.3) — none are advisory-only, consistent with Blueprint §30's "release blockers" language for accessibility and this repository's existing Track B precedent of hard-failing CI gates rather than warn-only checks.

---

## 7. Specification-Level Decisions (binding, made here)

These resolve the architecture discussion §12's four Cluster-A items. Each is a decision this document makes, not an open question deferred further.

### D1 — Screenshot-diff mechanism

**Decision:** Self-hosted pixel-diff, not a commercial SaaS (Chromatic/Percy/Applitools). **Rationale:** no Blueprint section names or requires a specific commercial tool; a self-hosted mechanism avoids introducing an external paid-service dependency and an account-provisioning decision this code-only Specification has no authority to make (§4 non-goal). Playwright itself ships a built-in `toHaveScreenshot()` pixel-diff assertion (cited directly in the architecture discussion §2, option (b): "built-in `toHaveScreenshot()` can satisfy visual regression without a second tool") — using Playwright's own built-in mechanism against Storybook-rendered pages (R2.1) avoids adding a *third* tool beyond the two ADR-044 already chose. **Residual open item:** the exact diff-threshold percentage/pixel-tolerance is an implementation-plan-level tuning value, not fixed here (see §10, OQ-1).

### D2 — Per-framework vs. unified Storybook topology

**Decision:** Per-framework instances (one Storybook for `ng`, one for `react`, one for `vue`), not a single unified multi-framework instance. **Rationale:** each framework already has its own dedicated package (`packages/ng`, `packages/react`, `packages/vue`) with its own build tooling and its own Storybook builder requirement (`@storybook/angular` vs. `@storybook/react-*` vs. `@storybook/vue3-*` — these are genuinely different packages, not configuration variants of one builder). A unified instance would require a cross-framework Storybook composition/multi-framework-addon setup with no existing precedent in this repository's build tooling, and no Blueprint text requires a single unified surface — §27 only says Storybook "should expose the Ultimate component experience consistently across frameworks where practical," which per-framework instances satisfy via consistent story-authoring conventions (R1.2), not necessarily one shared instance.

### D3 — axe-core integration point

**Decision:** `@axe-core/playwright` (the official Playwright-axe integration), run against Storybook-rendered stories (R1's surface), not a separate Vitest-based wrapper (`jest-axe`/`vitest-axe`) run against jsdom. **Rationale:** axe-core's DOM analysis is more representative when run against a real rendered browser DOM (Playwright, R2's tier) than jsdom's simulated DOM — jsdom does not fully implement computed accessibility-tree semantics, which is exactly the class of gap R2.3 already identifies Playwright as closing. Reusing R2's existing Playwright/Storybook investment (one render, three uses — R4.1) avoids a second, jsdom-based a11y-only tool with a narrower/less-representative DOM model. GAP-005's own "Recommended resolution direction" ("wire `axe-core` (or `jest-axe`/`vitest-axe` equivalent) into each framework's existing test harness") is satisfied by this choice — `@axe-core/playwright` is the "equivalent," adapted to the real-browser tier this Specification is building rather than the jsdom tier GAP-005's note was written before DECISION-A existed.

**Ruleset precision (resolves Spec Review Important-1):** This Specification requires axe-core's maintained default rule/tag configuration — it does not weaken this into an optional or unspecified scan, and it does not disable, narrow, or override any default-enabled rule. It also does not assert a specific WCAG version/level tag list (e.g., "2.0/2.1 A/AA") as fixed fact, since no axe-core version is pinned yet and this Specification has no installed package to verify that claim against (§1's own "not assumed from any prior document" discipline applies here too). The exact tag set the default configuration currently maps to is confirmed against the pinned `axe-core`/`@axe-core/playwright` version at implementation time and recorded in `ACCESSIBILITY_BASELINE.md`'s own header (matching `SAST_BASELINE.md`'s convention of recording the exact tool version/query-suite used at population time).

**Baseline/grandfathering (resolves Spec Review Blocker 1):** See R4.5-R4.11 for the full accessibility-baseline contract (storage location, fingerprint definition, grandfathering rule, new-violation detection, one-way-door review control, fingerprint-drift handling, and fail-closed behavior on a missing/malformed baseline).

### D4 — CI job structure

**Decision:** One new CI job at the GitHub Actions job level, distinct from Track B's existing `ci:` job, running Storybook build + Playwright (interaction, visual, accessibility) as a single pipeline per framework (build once, run all three check types against the same running Storybook instance for that framework) — not three separate jobs per check type. **Rationale:** minimizes redundant Storybook build/serve overhead (three check types sharing one running instance per framework, per D1/D3's own "one render, three uses" reasoning) while still isolating this slower, browser-dependent tier from Track B's existing fast CI job, matching the architecture discussion's own flagged runtime-budget concern (§2).

**Framework execution/failure-isolation contract (resolves Spec Review Important-2):** Within this one job, the three frameworks execute in parallel, not sequentially — implemented as a GitHub Actions matrix strategy (one job definition, three matrix entries: `ng`, `react`, `vue`), which is still "one CI job" in the sense this decision fixes (one job *definition*/workflow entry, covering the whole tier, as opposed to three independently-defined jobs) while giving each framework independent execution. This resolves the ambiguity precisely:
- **Parallel, not sequential:** a Vue-only regression does not delay or block Angular/React from running or reporting their own results in the same PR — matches this repository's own G6 goal ("without... destabilizing" existing work) and Track B's own precedent of fast, clear feedback per check.
- **One framework's failure does not prevent the others from running:** GitHub Actions matrix jobs are independent by default (no `fail-fast: true` is used here specifically, since that would abort React/Vue's still-running checks the moment Angular fails first — the opposite of independent attribution) — each matrix entry runs to completion regardless of the others' outcome.
- **Independent evidence per framework:** each matrix entry produces its own CI artifacts (R8's diff images / axe reports / Playwright traces), labeled by framework, not merged into one combined blob a reviewer has to disentangle.
- **How the job becomes "failed":** a GitHub Actions matrix job's overall status is failed if any matrix entry fails (this is the platform's own default behavior, not a custom aggregation this Specification invents) — satisfying R6.3's "failure of any check, on any framework, fails the job" requirement exactly, without needing bespoke result-aggregation logic.
- **Attributability:** because each matrix entry is a distinct GitHub Actions check run, a PR's checks list shows Angular/React/Vue's outcomes as separately visible entries (the platform's own matrix-job UI), not one opaque "browser tests: failed" line — satisfying AC-R6's "results remain attributable to Angular/React/Vue."

Exact YAML syntax (matrix definition, artifact-upload step names, etc.) remains an implementation-plan-level detail — this contract fixes the *behavior* (parallel, independently-failing, independently-evidenced, per-framework-attributable), not the file's exact text.

### D5 — Browser/version matrix

**Decision:** Playwright's own three default browser engines (Chromium, Firefox, WebKit), no Blueprint-mandated subset or superset. **Rationale:** confirmed no Blueprint section specifies a browser matrix (§2's grep). Using Playwright's own shipped defaults avoids inventing a requirement the Blueprint doesn't state, and avoids narrowing coverage below what the chosen tool provides by default at no extra integration cost.

---

## 8. Dependencies and Sequencing

- **Depends on:** ADR-044 (already accepted) — no other dependency. This track was never gated on Track B or Track D (architecture discussion §3, re-confirmed unaffected by Track D's completion in the prior session's own post-merge assessment).
- **Enables:** Track E (SSR/hydration) — Track E's own architecture-discussion scope (§5) soft-depends on Playwright existing (R2 here); this Specification does not build Track E's harness, but R2's Playwright installation is the prerequisite Track E's future Specification will assume.
- **No dependency on:** Track C (release engineering) — confirmed no shared file, script, or decision.
- **Internal sequencing:** R1 (Storybook) must land before R2/R3/R4 can target it (all three explicitly reuse R1's rendered surface, per D1/D3/D4's "one render, three uses" reasoning) — this is a real implementation-order constraint, not merely a documentation convenience, and should be reflected as a task dependency in the eventual Implementation Plan (not written here).

---

## 9. Gap Closure Mapping

| GAP | Current status (`BLUEPRINT_GAPS.md`) | How this Specification closes it |
|---|---|---|
| GAP-004 — No visual regression/Storybook/screenshot tooling | `MISSING`, "Architectural decision required: Yes — tooling choice, see Open Architectural Decisions §6" | R1 (Storybook) + R3 (visual regression) + D1/D2 close this. **Note:** GAP-004's "Architectural decision required" pointer is now stale — the decision it points to (DECISION-A, `BLUEPRINT_GAPS.md` §5) was resolved as ADR-044; this Specification does not edit that stale pointer (out of scope per task constraints), only flags it in §10 discrepancies. |
| GAP-005 — No automated accessibility scanning | `MISSING`, "Architectural decision required: No — clear Blueprint requirement, tooling choice is narrow" | R4 (axe-core) + D3 close this directly, including R4.5-R4.11's baseline/grandfathering contract, which GAP-005's own note did not anticipate needing (GAP-005 assumed a simple "wire it in" resolution; this Specification adds the deterministic new-vs-pre-existing enforcement model GAP-005 itself did not specify). |
| GAP-035 — No browser-compatibility testing (real-browser/cross-browser) | `MISSING`, "Dependencies: Likely bundled with GAP-004's visual-regression tooling choice... recommend deciding together" | R2 (Playwright, applied to every component per §5's amended coverage contract) + R5 (cross-browser parity, scoped to the shared 8-component set) close this — confirms the GAP's own prediction that it would be "bundled with GAP-004's" resolution (both close via the same DECISION-A/ADR-044 → this Specification path). |

No other GAP is affected. GAP-031/032/033 (Track B's own bookkeeping debt) and GAP-011 (Track D's own gap) are untouched and out of this Specification's scope.

---

## 10. Open Questions / Decisions Required

Only items repository evidence cannot resolve, or that are genuinely implementation-plan-level rather than architecture/specification-level — each has a stated default so an Implementation Plan is not blocked:

- **OQ-1:** Exact screenshot-diff pixel-tolerance/threshold value for D1's chosen mechanism. Not a Blueprint-derivable number ("stable... combinations" doesn't specify a percentage). Default recommendation: start at Playwright's own `toHaveScreenshot()` default threshold, tune during Implementation if real story renders prove noisy (e.g., font antialiasing differences across CI runners) — this is empirical, not decidable from repository evidence alone.
- **OQ-2:** Exact Storybook builder per framework (Vite-based vs. webpack-based for React specifically, since `@storybook/react-vite` and `@storybook/react-webpack5` both exist) — an implementation-plan-level choice matching each package's existing build tooling, not an architectural fork.
- **OQ-3:** Whether the new CI job runs on every PR unconditionally (R6.2's current decision — the job itself always runs), or whether *within* it, per-framework matrix entries (D4) should additionally be scoped to skip a framework whose source paths didn't change on a given PR (mirroring Track B's own `affected-packages.mjs` scoping pattern, `.github/workflows/ci.yml:63-66`, which narrows specific steps within its own always-running job). Not a contract-level ambiguity — R6.2 and D4 already fix job-level cadence and framework-level parallelism; this is a narrower runtime-optimization question, a real CI-cost consideration deferred to the Implementation Plan.
- **OQ-4 (external, not a specification gap):** Storybook/Playwright/axe-core exact package versions — this Specification deliberately does not pin versions (task constraint: "do not assume a specific Storybook/Playwright/axe version without repository/source verification," and none of these packages exist in the repository yet to verify a pinned version against). The Implementation Plan/implementation itself must resolve current stable versions at build time, following this repository's existing convention of pinning exact versions once chosen (matching Track B's `@vitest/coverage-v8` precedent).
- **OQ-5 (new, introduced by Amendment 1):** R4.6's fingerprint definition assumes axe-core's violation report exposes an `id` (rule) and `nodes[].target` (CSS selector path) per violation — this matches axe-core's long-standing, documented report shape, but was not independently re-verified against a real installed package (none exists in the repo yet, same constraint as OQ-4). If a pinned version's actual report shape differs in some way that affects fingerprint stability, the Implementation Plan must confirm R4.6's fingerprint formula against the real, installed tool's output before `ACCESSIBILITY_BASELINE.md` is first populated — this does not change R4.5-R4.11's contract, only the concrete field names the fingerprint formula reads.

---

## 11. Explicit Exclusions

- CONTRIBUTING.md, ROADMAP.md, or any unrelated GAP/bookkeeping edit — not touched by this Specification or its future implementation.
- Track B's scripts, thresholds, or CI steps — not modified.
- Track C (release engineering), Track E (SSR/hydration) — not started, not designed here beyond the acknowledged R2→Track-E dependency (§8).
- Any commercial visual-regression service account/subscription.
- A formal WCAG conformance-level certification or manual accessibility audit beyond axe-core's automated default ruleset.
- Any new npm script, dependency installation, or CI workflow edit — this document specifies; implementation is a separate future gate.
- Reopening DECISION-A/ADR-044.

---

## 12. Verification Expectations (for the eventual Implementation Plan, not performed here)

Restated as forward-looking acceptance criteria an Implementation Plan must translate into concrete tasks — none of these are executed by this Specification document itself:

- **AC-R1:** Each of `ng`/`react`/`vue` has a working Storybook instance; every component in that framework's shipped set (§5) has at least one story; `pnpm --filter <pkg> storybook` (or equivalent) builds and serves without error.
- **AC-R2:** Playwright is installed and configured; at least one interaction test exists per component (§5's amended coverage contract — every component a framework ships, including Angular's Fluid/Badge/Ripple/AutoFocus) per framework; tests target real browser engines (D5), not jsdom.
- **AC-R3:** A screenshot-diff run against the Aura preset's full set of component stories (every component, not only the shared 8-component set) produces a real baseline set; a deliberately mutated story (e.g., a changed CSS token) causes a visible, correctly-detected diff failure — mutation-tested, not merely "the script exits 0."
- **AC-R4:** `@axe-core/playwright` scans run against every component's story (not only the shared 8-component set); a deliberately introduced accessibility violation (e.g., removing an `aria-label`) on a component with no prior baseline entry is caught and fails — mutation-tested.
- **AC-R4b (accessibility baseline contract):** A component with a real, pre-existing axe violation, once baselined per R4.7, continues to pass CI on unrelated subsequent PRs (the violation does not re-fail merely by existing); a fingerprint present in `ACCESSIBILITY_BASELINE.md` but no longer produced by a real scan is confirmed fixed, not silently removed; deleting `ACCESSIBILITY_BASELINE.md` (or corrupting its format) causes the accessibility gate to fail closed, not pass open — each independently mutation-tested against the real check script.
- **AC-R5:** The same interaction scenario (e.g., "Escape closes Dialog") is verified as implemented and passing across all three frameworks' Playwright suites, for the shared 8-component set only (§5) — Angular's framework-specific items are correctly exempt from this specific criterion per R5.2, while still covered by AC-R2/AC-R3/AC-R4 above.
- **AC-R6:** The new CI job appears in `.github/workflows/ci.yml`, runs on PR, and a deliberately broken visual/accessibility/interaction check fails the job (not just a script exit code checked locally); per-framework results (Angular/React/Vue) remain independently attributable in CI output per the D4 execution contract (§7).
- **AC-R8:** CI failure output for each check type includes the evidence artifact described in R8 (diff image / axe report / Playwright trace), not just a pass/fail line.
- **Whole-track:** `pnpm run test` (existing Vitest suite) remains unaffected — zero existing test file modified, zero existing test behavior changed, confirming R2.4/G6's "additive, not replacing" constraint held.

---

## 13. Sources / Evidence

- `docs/architecture/BLUEPRINT.md` — §27 (lines 871-888), §28 (lines 892-943), §30 (lines 965-980), §31 (line 996), §35 (lines 1211-1223), §40 (lines 1333-1354), §41 (lines 1357-1372) — re-grepped directly for "Storybook"/"Playwright"/"axe"/"WCAG"/"Chrome"/"Firefox"/"Safari"/"WebKit"/"Chromium" during this Specification's own research; confirmed zero browser-matrix or WCAG-level text anywhere in the document.
- `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` — §2 (DECISION-A full reasoning, lines 18-72, including the "Proposed ADR wording" now recorded verbatim as ADR-044), §3 (sequencing, lines 75-120), §10 (GAP impact/dependency map, lines 282-299), §11 (deferred items, lines 303-317), §12 (Cluster A's four Specification-required items, lines 320-328).
- `docs/architecture/DECISIONS.md` — ADR-044 (lines 189-191), quoted verbatim in §2 above.
- `docs/architecture/BLUEPRINT_GAPS.md` — GAP-004 (lines 105-118), GAP-005 (lines 120-133), GAP-035 (lines 583-596), all read in full; "Open Architectural Decisions" §5 DECISION-A entry (lines 630-636) confirmed still stale (see discrepancy note below) — not edited, per task constraint.
- `docs/superpowers/specs/2026-09-08-phase-10-ci-security-quality-gates-design.md` — header/status-line convention (replicated in this document's own header); confirmed zero Track-A-scope overlap (lines 17, 38, 57, 317, 331 all explicitly name Storybook/Playwright as Track A's, not Track B's, responsibility); confirmed `.github/workflows/ci.yml`'s current 25-step single-job structure has no existing browser/UI-testing placeholder.
- `docs/superpowers/specs/2026-09-09-phase-10-operational-documentation-design.md` — header/section-numbering/requirement-ID(`R`)/decision-ID(`D`) convention, replicated identically in this document.
- Direct repository verification (this Specification's own research, `main` at `2b671e4`): root `package.json` and all 17 `packages/*/package.json` grepped for Storybook/Playwright/axe-core/jest-axe/chromatic/percy/vitest-axe tool names — zero matches; `engines.node` (`>=20.0.0`) and `packageManager` (`pnpm@9.6.0`) fields; `packages/react-core/vitest.config.ts` confirming `environment: "jsdom"`; `.github/workflows/ci.yml`'s exact 25-step job structure; exact component file listings for `packages/ng/src`, `packages/react/src`, `packages/vue/src` (§5's coverage table); `packages/themes/src/presets/aura/` confirming the single existing theme preset and its token-file scope (`base`, `button`, `checkbox`, `dialog`, `menu`, `tooltip`).

---

## 14. Discrepancies Found in Existing Phase 10 Materials (reported, not fixed — out of scope per task constraints)

- **`BLUEPRINT_GAPS.md` §5 "Open Architectural Decisions" → DECISION-A entry (lines 630-636)** still reads: *"Recommendation: Not made here — evidence doesn't yet strongly favor one option; this is a genuine tooling-preference fork, not an evidence-resolvable question."* This is now stale — DECISION-A was resolved by the architecture discussion and recorded as ADR-044. The architecture discussion's own §9 already flagged an adjacent, separate discrepancy in this same registry (a stale ADR-023 citation) and explicitly left both classes of staleness for "whoever next does doc-maintenance work on that file." This Specification does not edit `BLUEPRINT_GAPS.md`, per the task's explicit "Do NOT resolve unrelated stale GAP/ROADMAP/README issues discovered during assessment" constraint — flagged here for visibility only.
- **GAP-004's "Architectural decision required" field (line 118)** points to the now-stale DECISION-A entry above ("Yes — tooling choice, see Open Architectural Decisions §6" — also a section-number mismatch, since the actual section is §5, not §6, in the current file; not independently re-verified against every other GAP's citation, flagged only for this specific one encountered during Track A's own research). Not edited, same reasoning as above.
- No other discrepancy was found between the architecture discussion's Track-A-relevant claims and current repository state — every other cited fact (zero existing tooling, jsdom-only test environment, DECISION-A's exact wording, the GAP-004/005/035 mapping) was independently re-verified and matches.
