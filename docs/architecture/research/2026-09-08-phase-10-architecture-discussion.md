# Phase 10 — Production Hardening: Architecture Discussion

**Status:** Draft for review
**Date:** 2026-09-08
**Scope:** Architecture Discussion only. No specification, no implementation plan, no source/CI changes, no branch, no commit.
**Baseline:** `main` at `ee2713f`. Builds on `docs/architecture/research/2026-09-08-phase-10-production-hardening.md` ("the Research doc"), which remains the evidence record — this document captures decisions, not re-derivation of evidence already gathered there.

---

## 1. Phase 10 architectural context

Blueprint §35 gives Phase 10 eight objectives with no internal breakdown: security, accessibility, performance, browser compatibility, SSR/hydration, package quality, release automation, migration tooling, operational documentation. The Research doc confirmed all eight are genuinely open on `main`, found one real unresolved tooling fork (DECISION-A), and found the eight objectives cluster into five natural groups (A–E) with different dependency shapes. This discussion resolves DECISION-A, the sequencing question, and five smaller scope ambiguities the Research doc flagged rather than guessed at.

Two additional Blueprint sections not previously read verbatim were pulled in for this discussion and materially inform the decisions below: **§19 (CLI Architecture)** and **§27 (Storybook and Documentation)**. Both are quoted where they bear on a decision.

---

## 2. DECISION-A — Visual Regression + Real-Browser Testing Tooling

### The fork

What tool(s) satisfy Blueprint §28's visual-regression requirement and §28/§31's real-browser/cross-browser requirement, and should one tool serve both.

### New evidence found in this discussion

Blueprint §27, read in full for this discussion:

> Storybook is a platform documentation/testing surface, not a separate design system. It should expose the Ultimate component experience consistently across frameworks where practical. Documentation should combine: component API, behavior, usage, accessibility, theming, examples, framework-specific notes, AI guidance where useful.

This is decisive for one part of the fork: **Storybook is not one option among several for documentation — it is named directly by the Blueprint** as the platform's documentation/testing surface. It is independently required by §27 whether or not it is also chosen for visual regression. This removes "Storybook vs. no Storybook" from the open question; the only real question left is whether Storybook is also the visual-regression mechanism, and what handles real-browser/cross-browser interaction testing.

### Option analysis

**(a) Storybook + screenshot/visual-diff addon**
- Advantages: satisfies §27 (documentation surface) and §28 (visual regression) from one investment; natural per-framework story authoring matches the 3-framework package shape; lowest-friction fit for a component-library monorepo's existing workflow (author a story once per component, get docs + visual coverage together).
- Disadvantages: does not provide real cross-browser *interaction* testing (keyboard nav, focus order, computed ARIA roles) — screenshot diffing catches pixel regressions, not behavioral ones; does not touch SSR/hydration at all (Storybook renders components in isolation, not through a real server-rendered page).
- Architectural consequence: adopting this alone leaves §28's "real-browser interaction testing" and §31's "SSR/hydration behavior" measurement requirement completely unaddressed — a second tool is still needed for those.

**(b) Playwright alone**
- Advantages: real browser engines (Chromium/Firefox/WebKit) — directly satisfies real-browser and cross-browser interaction testing; built-in `toHaveScreenshot()` can satisfy visual regression without a second tool; is the natural tool to drive a real served page for SSR/hydration verification once one exists (cluster E, §4 below).
- Disadvantages: no component-documentation surface — does not satisfy §27 at all, which independently names Storybook.
- Architectural consequence: choosing this alone means §27 remains unsatisfied and would need its own separate resolution later — not a clean single-tool answer given §27's explicit Storybook naming.

**(c) Storybook + Playwright**
- Advantages: covers every Phase-10-relevant testing requirement found in the Blueprint — §27 (documentation), §28 (visual regression, via Storybook or Playwright screenshots), §28/§31 (real-browser/cross-browser interaction, via Playwright), and gives Playwright a natural on-ramp to SSR/hydration testing (cluster E) once a real page exists to point it at.
- Disadvantages: highest setup and ongoing maintenance cost of the three — two tools, two framework-adapter surfaces (Storybook has Angular/React/Vue builders to keep current; Playwright is framework-agnostic at the browser layer but still needs per-framework test harnesses), two CI integrations.
- Architectural consequence: does not by itself resolve CI-cost/runtime concerns (§11 of the Research doc already flagged that a second, slower test tier likely needs its own CI job rather than folding into the existing 20-step linear job) — that is an implementation-plan-level concern, not resolved here, but the two-tool combination makes the eventual CI redesign larger than a single-tool choice would.

### Decision

**Adopt option (c): Storybook + Playwright, as two separate tools with separate responsibilities — Storybook for the platform documentation/testing surface (§27) and visual regression (§28), Playwright for real-browser/cross-browser interaction testing (§28/§31) and, later, SSR/hydration verification (cluster E).**

**Why:** §27 independently and directly names Storybook — this is not a preference, it is the Blueprint stating what the documentation/testing surface should be. Once Storybook is a given, the remaining question narrows to what covers real-browser interaction and SSR — and Playwright is the only one of the three options that can do either, since Storybook's isolated rendering never exercises a real served page. Rejecting (a) alone leaves §27 satisfied but real-browser/SSR testing unaddressed; rejecting (b) alone leaves §27 unsatisfied entirely, in direct tension with an explicit Blueprint statement. (c) is the only option that does not leave a named Blueprint requirement unmet.

**Consequences:**
- Two new tools enter the stack, each with its own CI integration, framework-adapter maintenance, and version-currency burden across three frameworks.
- CI runtime and structure will need rework (separate job(s), likely conditional/scoped execution) — this is implementation-plan territory, flagged here as a known consequence, not solved.
- Vitest's ownership of Unit/Component/Integration testing (§28) is unchanged — Storybook and Playwright are additive tiers, not a replacement.

**What it enables:** a credible, evidence-backed path to closing GAP-004 (visual regression), GAP-035 (real-browser/cross-browser testing), §27's documentation-surface requirement, and — once cluster E's harness exists — GAP-034 (SSR/hydration verification), all from one architectural decision.

**What it intentionally does not solve:**
- Does not decide *which* screenshot-diff mechanism Storybook uses (a commercial service like Chromatic vs. a self-hosted pixel-diff addon) — that is a Specification-level tooling choice, not an architectural fork; nothing in the Blueprint or this discussion favors one over the other.
- Does not decide CI job structure/runtime budget — Specification/Implementation-Plan concern.
- Does not decide whether Storybook instances are per-framework or a single multi-framework instance — Specification-level detail.
- Does not by itself provide a real consumer app (GAP-008) — Playwright still needs *something* to point at for SSR verification; see §5 below for what that "something" is scoped to be.

### Proposed ADR wording (architectural level only)

> **ADR-XXX — Phase 10 testing/documentation tooling: Storybook + Playwright, distinct responsibilities**
> Storybook is adopted as the platform's component documentation/testing surface (Blueprint §27) and as the mechanism for visual-regression coverage (§28). Playwright is adopted as the mechanism for real-browser and cross-browser interaction testing (§28/§31) and for SSR/hydration verification (§31) once a minimal servable harness exists (see the SSR/GAP-008 scope decision, §5). The two tools have non-overlapping primary responsibilities and both remain additive to the existing Vitest/jsdom/TestBed unit-and-component testing tier, which is unchanged. Specific screenshot-diff mechanism, CI job structure, and per-framework Storybook instance topology are deferred to Specification.

---

## 3. Phase 10 sequencing decision

### The question

Whether Phase 10 is one spec/plan cycle, several independently gated sub-tracks, or another structure — and specifically whether clusters B (CI/security/quality gates) and D (operational documentation) can proceed independently of A (testing/browser/visual/accessibility infrastructure), since neither depends on DECISION-A.

### Discussion

The Research doc's cluster analysis holds up under this discussion's added evidence. Re-examined with DECISION-A now resolved:

- **Cluster A** (testing/browser/visual/accessibility) is now unblocked by the DECISION-A resolution above, but is still the largest and most implementation-heavy cluster — two new tools, CI restructuring, per-framework adapter work. It remains its own coherent unit.
- **Cluster B** (CI security/quality gates — dependency/license/SAST scanning, bundle-size CI enforcement, coverage-threshold enforcement) has no architectural dependency on A, C, D, or E. The Research doc's finding stands: these are pure additive CI work, "Architectural decision required: No" on every one of the four items, independently confirmed again in this discussion (no new evidence contradicts it).
- **Cluster C** (release engineering) depends on this discussion's migration-tooling-scope resolution (§4 below) before it can be scoped concretely, but does not depend on A, B, D, or E.
- **Cluster D** (operational documentation) has no architectural dependency on any other cluster, though its CHANGELOG.md content depends on cluster C's release-engineering wiring being live — the *file's existence and template* can be drafted independently; its *content generation* cannot ship meaningfully until C lands.
- **Cluster E** (SSR/hydration) depends on this discussion's GAP-008 scope resolution (§5) and, once that harness exists, on Playwright being available per the DECISION-A resolution above — so E has a soft dependency on A (needs Playwright) and a hard dependency on the GAP-008 scoping decision.

This produces a real, evidence-backed dependency graph, not an arbitrary split:

```text
B (CI/security/quality gates)  ─── no dependencies, start immediately
D (operational documentation)  ─── no dependencies, start immediately
                                    (D's CHANGELOG content generation soft-depends on C)

A (testing/browser/visual/a11y) ─── unblocked now that DECISION-A is resolved

C (release engineering)        ─── depends on §4's migration-tooling-scope resolution

E (SSR/hydration)              ─── depends on §5's GAP-008 scope resolution
                                    + soft-depends on A (needs Playwright to exist)
```

### Decision

**Phase 10 is treated as five independently gated sub-tracks (A–E as defined), not one specification/implementation cycle. B and D may begin Specification immediately, in parallel, ahead of A — there is no architectural reason to sequence them after A, and the Research doc's own dependency analysis (independently re-confirmed here) supports starting the zero-dependency clusters first.**

**Why:** Blueprint §36's mandated workflow (Phase → Spec → Review → Plan → Implementation → Verification → Exit Review) does not say a "Phase" must be a single spec/plan cycle — Phase 9 itself is precedent for scoping a Blueprint-named phase narrower than its full theoretical objective list (Phase 9's spec explicitly deferred documentation-ingestion rather than solving GAP-004 inline). Forcing eight broad, weakly-related objectives into one specification would either produce an unreviewable document or force premature decisions on genuinely separable questions (DECISION-A's resolution here does not, for example, need to be bundled with a coverage-threshold percentage).

**Consequences:**
- Five separate Specification documents will exist for Phase 10 instead of one, each independently reviewable and independently gated.
- "Phase 10" as a ROADMAP.md row will not flip to "Complete" until all five sub-tracks close — this needs to be tracked (e.g., a Phase 10 tracking note in ROADMAP.md or a dedicated index), a documentation mechanic to work out at Specification time, not architecturally blocking.
- Sub-tracks B and D can run concurrently with each other and, once DECISION-A is resolved (done, §2), concurrently with A as well — only C and E have real gating dependencies.

**What it enables:** low-risk, immediately actionable work (B, D) does not wait on the higher-cost, higher-uncertainty work (A's two-tool CI integration, C's scope-dependent release engineering, E's SSR-harness scoping).

**What it intentionally does not solve:** the exact Specification-level ordering *within* each sub-track, whether sub-tracks get formal "Phase 10a/10b/..." labels or stay flat under one Phase 10 umbrella with staged specs (naming convention deferred to whoever writes the first Specification — not an architectural question), and which sub-track's Specification is written first among the unblocked set (B, D, and now A) — that is a project-sequencing choice for the user, not resolved by this discussion.

---

## 4. Migration-tooling scope decision

### The ambiguity

Blueprint §35 says "migration tooling"; §40 says "migration strategy." Phase 7 explicitly deferred `@ultimate/cli`'s `create`, `migrate`, `update` commands (confirmed again in this discussion: `packages/cli/src/commands/` contains only `add.ts`, `ai.ts`, `doctor.ts`, `generate.ts`, `init.ts`, `theme.ts` — no `create.ts`/`migrate.ts`/`update.ts`).

### New evidence found in this discussion

Blueprint §19, read in full for this discussion:

> `@ultimate/cli` is an orchestrator. Conceptual commands: `ultimate create`, `ultimate init`, `ultimate add`, `ultimate generate`, `ultimate theme`, `ultimate doctor`, `ultimate update`, `ultimate migrate`, `ultimate ai`. **Exact command names are not final.** The CLI must: detect/select framework, invoke official framework tooling, install compatible Ultimate packages, resolve theme, configure optional capabilities, validate compatibility, generate code/configuration, diagnose project state.

Two things follow directly from this text. First, `create`, `migrate`, and `update` are listed only as "conceptual commands" among nine total — the Blueprint does not mandate all nine exist by any specific phase, and explicitly says exact names/set are not final. Second, the CLI's *mandatory* responsibilities (the "must" list) do not include a `migrate` or `update` capability by name — they describe framework detection, package install, theme resolution, compatibility validation, code generation, and diagnosis, all of which are already substantially covered by the five real commands Phase 7 shipped (`init`, `add`, `theme`, `doctor`, `generate`).

### Decision

**Phase 10 satisfies the Blueprint's migration-tooling/migration-strategy requirement with a migration strategy/documentation layer, not by implementing `@ultimate/cli create`/`migrate`/`update`. Building those three CLI commands remains deferred, unchanged from Phase 7's own scope decision.**

**Why:** §40's exact phrase is "migration strategy" — a strategy is a documented approach, not necessarily shipped automation. §35's "migration tooling" is the only place suggesting built software, but §19's "conceptual... not final" framing means the Blueprint does not commit any specific phase to building `migrate`/`update` specifically. Building three nontrivial CLI commands (each requiring real per-framework upgrade-path logic) would substantially expand Phase 10's scope beyond what any Blueprint section concretely demands, in tension with this discussion's own instruction not to expand "package quality" (or by the same logic, any Phase 10 term) beyond what the Blueprint supports.

**Consequences:**
- Cluster C (release engineering) is scoped to: finishing changesets wiring, first real CHANGELOG.md generation, and a written migration-strategy document (e.g., how consumers should approach upgrading between Ultimate versions, framework-version compatibility notes referencing the existing compatibility-manifest/resolver from Phase 7). It is not scoped to include new CLI command implementation.
- `@ultimate/cli`'s `create`/`migrate`/`update` remain explicitly unimplemented, tracked as CLI backlog independent of Phase 10, revisitable whenever real evidence (e.g., an actual consumer needing to migrate across a breaking Ultimate release) makes building them concretely justified.

**What it enables:** cluster C stays a documentation-plus-release-tooling-wiring track, matching its already-modest existing scaffold (changesets config already present) rather than growing into new CLI feature work.

**What it intentionally does not solve:** whether `create`/`migrate`/`update` get built in some future phase, and if so which one — the Blueprint does not assign them to a phase, and this discussion does not invent that assignment.

---

## 5. SSR / GAP-008 scope decision

### The question

Whether Phase 10 needs full Angular/React/Vue playground apps, one minimal SSR-capable harness, framework-specific minimal harnesses, or another approach — while identifying which parts of GAP-008 are prerequisites versus merely useful infrastructure.

### Discussion

Blueprint §13/§14 (read in full for this discussion) both list SSR and hydration as compatibility responsibilities each framework package must "independently track" — alongside items like "TypeScript compatibility," "compiler behavior," "forms," "Angular CDK," "ecosystem compatibility." Neither section specifies *how* this tracking must be verified (no mention of a full consumer app, a playground, or any specific harness shape) — this is a genuine Blueprint silence, not an oversight to fill in with an assumption.

What *is* concretely needed, independent of any Blueprint wording, is something Playwright (per §2's DECISION-A resolution) can actually drive: a real server-rendered, then client-hydrated page. That is the minimum technical requirement for "SSR/hydration behavior" (§31) to be measurable at all — jsdom/TestBed cannot produce this regardless of tooling choice, confirmed already in the Research doc.

`apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, and `apps/showcase` were all scaffolded (directory + `.gitkeep`) at repository founding, presumably anticipating eventual full consumer/demo applications — but nothing in the Blueprint's Phase 10 text (§35) or Definition of Done (§40) requires a *full* playground/showcase experience. §40's relevant line is just "release automation," "migration strategy," "CLI quality" — no line item reads "consumer application" or "playground app." A full playground app is real, useful infrastructure (it would also help demo the CLI's `init`/`add`/`theme` commands, and would be a natural home for cluster A's Storybook/Playwright work) — but it is not a Phase 10 *requirement* by the Blueprint's own text.

### Decision

**Phase 10's SSR/hydration verification requirement is satisfied by one minimal, framework-specific SSR-capable harness per framework (Angular Universal / Next.js / Nuxt, or the framework's standard minimal SSR starter) — not full playground/showcase applications. Building out `apps/playground-*`/`apps/showcase` into real, feature-complete consumer applications is explicitly out of scope for Phase 10.**

**Why:** the Blueprint requires SSR/hydration to be *verified*, not a consumer-app experience to exist. A minimal harness — render one or two real Ultimate components through each framework's standard SSR pipeline and confirm hydration succeeds without console errors/mismatches — is the smallest artifact that makes §31's "SSR/hydration behavior" measurement possible and gives Playwright something real to drive. Anything beyond that (routing, multiple pages, a real design/demo experience) is GAP-008's *fuller* scope, useful but not required by any Phase 10 line item found in this discussion or the Research doc.

**Consequences:**
- Cluster E's scope is: three minimal SSR harnesses (one per framework), each rendering a small number of already-shipped components (the existing 8-component proof set is a natural, ready target — no new component work needed), plus Playwright specs that assert successful hydration.
- The existing `apps/playground-angular`/`apps/playground-react`/`apps/playground-vue` directories are reasonable homes for these harnesses, but their *scope* for Phase 10 purposes is the minimal SSR-verification harness, not a full playground. Whether that minimal harness later grows into the originally-scaffolded full playground is future work, not decided here.
- `apps/showcase` and `apps/docs` remain out of Phase 10 scope entirely — `apps/docs` is more naturally cluster A's eventual Storybook home (a Specification-level detail, not decided here) and `apps/showcase` has no Phase-10 driver at all.

**What it enables:** GAP-034 (SSR/hydration verification) becomes closeable within Phase 10 without Phase 10 quietly absorbing what would really be a full product-development phase.

**What it intentionally does not solve:** whether/when `apps/playground-*`/`apps/showcase` become real consumer-facing applications — that remains open, unassigned future work, explicitly not claimed by Phase 10.

---

## 6. Package-quality boundary

### The question

Blueprint §35 says "package quality" without a checklist. Using §28, §31, §40, determine the minimum defensible Phase 10 interpretation, separating what's already satisfied from what's genuinely missing.

### Discussion

Cross-referencing the three sections named in the task:

- **§28 Build/Package tier** names exactly: tree-shaking, package exports, ESM, "SSR where supported," bundle boundaries, "absence of unwanted AI/tooling runtime dependencies."
- **§31 Performance Strategy** names: bundle size, tree-shaking (again), and (indirectly, via "establish benchmarks") the need for those measurements to be real numbers, not assumptions.
- **§40 Definition of Done** names: "stable package boundaries," "performance benchmarks" — both already covered by the above two sections' more specific language.

No Blueprint section anywhere uses the literal phrase "package quality" outside §35's one-line objective list — so its content must be assembled entirely from §28/§31/§40's more specific vocabulary, which is exactly what this section does; nothing is invented beyond that vocabulary.

Cross-checked against current `main` (already established in the Research doc, re-confirmed here):

| Sub-requirement (from §28/§31/§40) | Current state |
|---|---|
| Package exports / ESM | Satisfied — confirmed working per-package `exports` maps (React/Vue have per-component subpaths; Angular ships one barrel — a pre-existing, out-of-Phase-10-scope Angular gap, GAP-009/GAP-023, not reopened here) |
| Tree-shaking | Proven for React/Vue; Angular's is flagged broken by a prior, unrelated gap (GAP-009) — not a Phase 10 finding, not reopened by this discussion |
| Bundle boundaries / absence of unwanted AI-tooling runtime deps | Satisfied and CI-enforced — the `boundary:validate`/`boundary:validate:cli`/`boundary:validate:mcp`/`boundary:validate:ai` gates built across Phases 7–9 directly implement this line item already |
| npm-pack/install integrity | **Partially satisfied** — Phase 9 built a real `pnpm pack`/`pnpm install` standalone-resolution test for `@ultimate/ai` only (Research doc §7). No equivalent exists for `ng`/`react`/`vue`/`themes`/`cli`/`mcp`/`component-schema`/`component-metadata`/`uix-*`. |
| Bundle-size budget/monitoring | **Missing** — measurement script exists, not CI-enforced, coverage stops at Phase 2 packages (GAP-032, confirmed still open) |
| SSR where supported | Covered by cluster E (§5 above), not duplicated here |
| Supported framework compatibility | Already covered by the existing `compatibility-manifest.json`/compatibility-resolver work from Phase 7 — no new Phase 10 gap identified here |

### Decision

**"Package quality" for Phase 10 purposes means exactly: (1) generalizing the Phase 9 npm-pack/install integrity test pattern to every publishable package, and (2) wiring the existing bundle-size measurement script into CI with an enforced budget or regression gate, extended to cover all packages that don't yet have a recorded baseline. Package exports/ESM/tree-shaking/boundary-enforcement/framework-compatibility are already satisfied by prior-phase work and are not reopened as Phase 10 deliverables.**

**Why:** every sub-requirement in §28/§31/§40's vocabulary maps to either already-shipped, CI-enforced infrastructure (exports, boundaries, compatibility) or one of exactly two genuinely open items (pack-integrity generalization, bundle-size CI enforcement). Nothing broader is supported by the cited sections' actual text.

**Consequences:** this folds cleanly into cluster B (CI/security/quality gates) — both remaining items are additive CI work with no architectural fork, consistent with cluster B's existing "no decision required" classification.

**What it enables:** a bounded, evidence-backed definition of "package quality" that a Specification can act on directly without re-litigating scope.

**What it intentionally does not solve:** Angular's tree-shaking/barrel-export gap (GAP-009/GAP-023) — that is real, pre-existing, out-of-Phase-10-scope work belonging to whichever track revisits Angular's package architecture; not claimed or absorbed here.

---

## 7. Release-provenance boundary

### The question

Whether §29's "provenance tracking" means the existing Prime-source provenance system, publish-time package provenance/attestation, or both.

### Discussion

§29's exact context: "Security process must include: ... provenance tracking ..." — listed alongside dependency scanning, license scanning, SAST, vulnerability monitoring, security advisories, patch releases, malicious package/dependency review. Every other item in that list is about *ongoing risk in what Ultimate depends on or ships*, not about *where Ultimate's own incorporated source came from* (that second concern is §2.3's "MIT-only Provenance" and §8's "Provenance and Licensing" — separate, already-resolved sections covering Prime-source lineage specifically, confirmed extensively implemented via `docs/architecture/PROVENANCE.md`/`provenance/*.json`/`scripts/provenance/*`).

Read in the context of its neighbors in §29's list, "provenance tracking" reads as belonging to the *security-process* concern (supply-chain integrity of what ships), not a restatement of the already-separately-covered Prime-lineage concern.

### Decision

**§29's "provenance tracking" is interpreted as publish-time package provenance/attestation (e.g., npm's provenance mechanism) — a distinct, currently-unaddressed responsibility from the existing Prime-source provenance system. Both exist as separate, non-overlapping responsibilities: Prime-source provenance (already complete, Phase 0's domain, unchanged) and publish-time package provenance (open, Phase 10 cluster B's domain).**

**Why:** §29's list is a security-process list about ongoing supply-chain risk; reading "provenance tracking" as merely restating the already-solved Prime-lineage problem would make that list item redundant with §2.3/§8, which the Blueprint's own structure (separate, dedicated sections for Prime-source provenance) argues against. The more coherent reading is that §29 is naming a second, publish-time provenance concern that Phase 0's work does not cover.

**Consequences:** cluster B's scope gains one more concrete item — publish-time provenance/attestation wiring — alongside dependency/license/SAST scanning. This is additive CI/release-tooling work, not an architectural fork (no competing options were found; npm's provenance mechanism is effectively the standard approach for this exact problem, not evaluated further here since no genuine alternative surfaced).

**What it intentionally does not solve:** exactly when in the release pipeline this gets wired (that depends on cluster C's release-engineering wiring existing first, since there is no publish step to attach provenance to yet) — a Specification/sequencing-within-cluster-B detail, not an architectural question.

---

## 8. Operational-documentation interpretation

### The question

Whether the Blueprint literally requires SECURITY.md/CONTRIBUTING.md/CHANGELOG.md, or whether these were inferred.

### Discussion

Confirmed again in this discussion: Blueprint §39's "Documentation Artifacts" list is `BLUEPRINT.md`, `DECISIONS.md`, `PROVENANCE.md`, `DEPENDENCIES.md`, `COMPATIBILITY.md`, plus (in the tree diagram) `PACKAGE_ARCHITECTURE.md` and `AI_ARCHITECTURE.md`. None of the three conventional filenames appear there. The only textual hooks are §35's unspecified "operational documentation" and §29's security-process list (which conventionally, but not explicitly, implies a published security-contact/disclosure document).

This is a genuine Blueprint silence on exact filenames, not a contradiction — §39's list is scoped to *architecture* documentation specifically (its own heading), while §35's "operational documentation" is a different, broader category §39 does not enumerate.

### Decision

**The Blueprint does not literally name SECURITY.md/CONTRIBUTING.md/CHANGELOG.md. It requires, by direct textual mandate: (1) a security process with a disclosure/advisory mechanism (§29, most naturally expressed as a SECURITY.md-equivalent, since §29 explicitly names "security advisories" as a required process output), and (2) release automation with generated changelogs (§35/§40, most naturally expressed as CHANGELOG.md, and already the exact output format `.changeset/cli`'s configured `@changesets/cli/changelog` generator produces). A CONTRIBUTING.md is not directly supported by any specific Blueprint text found in this discussion — its inclusion, if any, would be a project-convention choice at Specification time, not a Blueprint requirement.**

**Why:** SECURITY.md and CHANGELOG.md both trace to specific, named Blueprint requirements (§29's security-advisory process; §35/§40's release automation, already technically pointed at changesets' own changelog output). CONTRIBUTING.md traces to no specific Blueprint text — it is purely the "conventional GitHub-repo trio" the Research doc flagged as an inference, and this discussion does not convert it into a requirement.

**Consequences:** cluster D's Blueprint-mandated scope is SECURITY.md (documenting the §29 process once cluster B's scanning/advisory mechanisms exist) and CHANGELOG.md (populated once cluster C's release wiring lands). CONTRIBUTING.md may still be written as good practice, but is recorded here as a project-convention addition, not a Blueprint-driven Phase 10 deliverable — whoever writes cluster D's Specification should make that distinction explicit rather than presenting all three as equally Blueprint-mandated.

**What it intentionally does not solve:** exact content/template for SECURITY.md or CHANGELOG.md — Specification-level.

---

## 9. DECISION-A citation discrepancy

Recorded, not resolved by guessing: the Research doc found the old `BLUEPRINT_GAPS.md` registry cites ADR-023 as a visual-regression-deferral decision, while current `docs/architecture/DECISIONS.md` ADR-023 is titled "React styling gets a working `StyleSheet` DOM-injection adapter from day one..." — an unrelated topic.

**This discussion did not need the stale citation to resolve DECISION-A** — §2 above was resolved entirely from direct Blueprint text (§27, §28, §31) and direct repository evidence, with no dependency on identifying what the original deferral ADR was. The discrepancy is therefore recorded as a standing documentation-hygiene issue in `BLUEPRINT_GAPS.md`, left for whoever next does doc-maintenance work on that file — it did not block this discussion and is not resolved here (doc edits remain out of scope for this turn per the task's constraints).

---

## 10. GAP impact/dependency map

Re-classified using this discussion's decisions, not merely repeating the Research doc's findings:

| GAP | Research doc status | This discussion's classification | Basis |
|---|---|---|---|
| GAP-004 (no visual regression/Storybook) | MISSING | **Remains open; now has an architectural resolution path** | §2 decision (Storybook adopted) gives this gap a clear closure route via cluster A |
| GAP-005 (no automated a11y scanning) | MISSING | **Remains open, not directly resolved by any decision here** | No decision in this discussion specifically addressed axe-core-class tooling; belongs to cluster A's Specification, tooling-choice-only, no fork found |
| GAP-008 (no real consumer app) | MISSING | **Partially resolved in scope** — Phase 10 requires only minimal SSR harnesses, not full playground apps | §5 decision |
| GAP-011 (no SECURITY/CONTRIBUTING/CHANGELOG) | MISSING | **Remains open; scope narrowed** — SECURITY.md and CHANGELOG.md are Blueprint-driven (cluster D), CONTRIBUTING.md is optional/non-Blueprint | §8 decision |
| GAP-030 (Phase 9 AI Skills/LLM Context) | Stale documentation only (Phase 9 is actually complete) | **Confirmed stale-documentation-only, unrelated to Phase 10 architecture** — re-flagged, not fixed (doc-edit scope) | Research doc §12, re-confirmed, no new evidence changes this |
| GAP-031 (no dependency/license/SAST scanning) | MISSING | **Remains open, no architectural decision required** | Cluster B, tooling-choice-only per Research doc, not contested here |
| GAP-032 (bundle-size not CI-enforced) | IMPLEMENTED-BUT-NOT-ENFORCED | **Remains open; now explicitly scoped under "package quality"** | §6 decision |
| GAP-033 (coverage not CI-enforced) | IMPLEMENTED-BUT-NOT-ENFORCED | **Remains open, no architectural decision required** | Cluster B, tooling-choice-only |
| GAP-034 (no SSR/hydration verification) | IMPLEMENTED-BUT-UNVERIFIED | **Remains open; now has a bounded, architecturally-scoped closure path** | §5 decision (minimal harnesses) + §2 decision (Playwright as the verification tool) |
| GAP-035 (no browser-compat/real-browser testing) | MISSING | **Remains open; now has an architectural resolution path** | §2 decision (Playwright adopted) |

No GAP in this list is fully "resolved" by this discussion — architecture-level decisions were made, but nothing has been implemented. "Blocked by another decision" does not apply to any remaining Phase 10 GAP after this discussion; every one now either has a clear path (via a decision above) or is confirmed pure tooling-choice/additive-work with no fork (cluster B items).

---

## 11. Consequences and deferred items

Consequences already stated per-decision above (§2–§8). Consolidated list of what this discussion explicitly defers, none of which block Specification from starting on the unblocked sub-tracks (B, D, and now A):

- Screenshot-diff mechanism choice (commercial vs. self-hosted) — cluster A Specification.
- CI job structure/runtime budget for the new Storybook/Playwright tiers — cluster A Specification.
- Per-framework vs. unified Storybook instance topology — cluster A Specification.
- SECURITY.md/CHANGELOG.md exact content/template — cluster D Specification.
- Whether CONTRIBUTING.md is written at all (non-Blueprint-mandated) — cluster D Specification, project-convention call.
- Exact publish-time provenance mechanism sequencing relative to cluster C's release wiring — cluster B/C Specification.
- `create`/`migrate`/`update` CLI command implementation — explicitly out of Phase 10 entirely, unassigned to any future phase.
- `apps/playground-*`/`apps/showcase` growth into full consumer/demo applications — explicitly out of Phase 10 entirely, unassigned to any future phase.
- Angular tree-shaking/barrel-export gap (GAP-009/GAP-023) — pre-existing, unrelated to Phase 10, not reopened.
- Whether Phase 10's five sub-tracks get formal sub-phase numbering or stay flat — deferred to whoever writes the first Specification.

---

## 12. Items that must be resolved during Specification

For whichever sub-track's Specification is written first (B, D, or A, per §3's finding that none of these three has a blocking dependency):

- **Cluster B:** exact SAST/dependency/license-scanning tool selection; exact bundle-size budget numbers or regression-diff mechanism; exact coverage-threshold percentage; npm-pack/install integrity test generalization approach (reuse vs. adapt the Phase 9 `@ultimate/ai` pattern) across the remaining packages; publish-time provenance mechanism specifics.
- **Cluster D:** SECURITY.md contact/disclosure process specifics; CHANGELOG.md initial-population approach (backfill history vs. start fresh from Phase 10 forward); CONTRIBUTING.md go/no-go.
- **Cluster A:** screenshot-diff tool selection; CI job/runtime redesign; per-framework Storybook topology; axe-core (or equivalent) integration point for GAP-005.
- **Cluster C (once its migration-tooling-scope decision from §4 is accepted):** changesets CI wiring details; migration-strategy document scope/audience.
- **Cluster E (once its GAP-008 scope decision from §5 is accepted):** exact minimal-harness framework starters (Angular Universal vs. alternative; Next.js vs. a lighter React SSR setup; Nuxt vs. a lighter Vue SSR setup); which of the 8 proof-set components get exercised in each harness.

---

## 13. Sources / Evidence

- `docs/architecture/research/2026-09-08-phase-10-production-hardening.md` — the Research doc this discussion builds on; not re-derived, cited throughout
- `docs/architecture/BLUEPRINT.md` §13, §14, §19, §27 — read in full for this discussion (new evidence beyond the Research doc's scope)
- `docs/architecture/BLUEPRINT.md` §28, §29, §31, §35, §39, §40 — re-applied from the Research doc's prior verbatim reads, not re-quoted in full here except where directly decision-relevant
- `packages/cli/src/commands/` — directory listing re-confirmed this session (`add.ts`, `ai.ts`, `doctor.ts`, `generate.ts`, `init.ts`, `theme.ts`; no `create`/`migrate`/`update`)
- `docs/architecture/DECISIONS.md` — ADR-023 content re-confirmed (React styling, not a visual-regression deferral) for §9's discrepancy record
