# Blueprint Completion — Design Specification

**Document:** `docs/superpowers/specs/2026-09-13-blueprint-completion-design.md`
**Status:** Proposed. Awaiting spec review/approval before an implementation plan is written.
**Purpose:** Close the remaining confirmed, non-architectural gaps standing between the current repository state and a clean Blueprint Freeze, per the conclusions of `docs/architecture/research/2026-09-13-blueprint-closure-current-state-reconciliation.md` and the `2026-09-13-blueprint-completion` brainstorming session that followed it.
**Explicitly not in scope:** Any change to `docs/architecture/BLUEPRINT.md`. Any resolution of DECISION-B (external dependency policy), DECISION-C's narrowed remainder (Table/Data fuller filter vocabulary and the 4 unbuilt Data-family rows), or DECISION-E (package naming). Any reopening of DECISION-D (Tree-family, protected). Any work on GAP-017 (remaining ~90-component catalog) or GAP-008's fuller scope (real consumer app, tree-shaking re-measurement via a real build). The act of declaring the Blueprint frozen itself — that remains a separate, later, human-authorized step this workstream does not perform.

---

## 1. Background and evidence base

Phases 0-10 of `docs/architecture/BLUEPRINT.md` are complete (`docs/architecture/ROADMAP.md`). The 2026-09-13 Blueprint Closure audit found **zero BLUEPRINT BLOCKERS** — the Blueprint's architecture is reconciled with the repository as it stands. What remains is a small, closed set of implementation/documentation items that every prior audit in this session's history (the post-Phase-10 reconciliation audit, the Documentation Reconciliation pass, and the Blueprint Closure audit) independently classified as **IMPLEMENTATION BACKLOG** or **DOCUMENTATION DRIFT**, never as an open architecture question.

This spec consolidates exactly six of those items into one workstream, selected because each shares the same character: a pattern already proven elsewhere in the repository, or spec text that already needs to match validator behavior that already exists. None requires new architectural research. Two additional items (GAP-006, GAP-007) not originally named in the audit's gap list are included by explicit decision during brainstorming, because they share the same "small, isolated, pattern-proven" character as the rest.

Everything else — DECISION-B/C/D/E, GAP-017, GAP-008's fuller scope — is explicitly excluded, per direct instruction, and is not reopened, redesigned, or even re-audited by this spec.

---

## 2. Goals

1. Close GAP-009/GAP-023 (Angular has no per-component `exports`, unlike React/Vue).
2. Close GAP-010 (provenance manifest schema names a field the validator never checks) by amending the spec text that named it, not by retrofitting manifests.
3. Close GAP-036 (the `llms.txt`/`llms-full.txt` generator works but its output has never been committed) via a one-time generate-and-commit action, relocated to a non-gitignored path.
4. Close GAP-006 (Angular `UTooltip` has no `aria-describedby` wiring).
5. Close GAP-007 (Angular `UOverlay`/`UDialog` have no working multi-instance z-index/Escape stacking, unlike React's already-proven mechanism).
6. Update `docs/architecture/BLUEPRINT_GAPS.md` to reflect all six gap IDs above (GAP-006, GAP-007, GAP-009, GAP-010, GAP-023, GAP-036) as `RESOLVED`, with commit-level evidence, once the corresponding work lands.

## 3. Non-goals

- Redesigning any architecture. Every work package below applies an already-approved pattern from a sibling framework or an already-existing shared module.
- Touching `BLUEPRINT.md`, `DECISIONS.md`, or any protected/deferred decision.
- Expanding component coverage (GAP-017) or building a real consumer app (GAP-008).
- Automating `llms.txt` regeneration in CI. This is a one-time commit; wiring CI to regenerate-and-diff-check on every change is explicitly out of scope (it would be new tooling surface beyond what GAP-036 named, and was explicitly declined during brainstorming).
- Backfilling `sha256OfOriginal` into every provenance manifest. The spec text is corrected instead (see WP2).

---

## 4. Work packages

### WP1 — Angular per-component secondary entry points (GAP-009 / GAP-023)

**Problem:** `packages/ng/package.json` has no `exports` field — Angular ships a single barrel (`dist/fesm2022/ultimate-ng.mjs`). `packages/react/package.json` and `packages/vue/package.json` both declare a real `exports` map with a subpath per component (`.`, `./button`, `./checkbox`, `./dialog`, `./menu`, `./paginator`, `./scroller`, `./table`, `./tooltip`). `scripts/provenance/verify-tree-shaking.mjs` confirms importing only `UButton` currently pulls in `UDialog`-related code — the exact failure the Phase 2 spec's original 9-secondary-entry-point commitment was meant to prevent (ADR-023 follow-up 5).

**Outcome:** `@ultimate/ng` ships real secondary entry points via `ng-packagr`'s per-directory-`ng-package.json` mechanism (Angular's own convention for this — not a single config listing every entry the way `tsup` does for React/Vue), for the 8 component directories confirmed to have **zero cross-component source imports**: `autofocus`, `badge`, `checkbox`, `fluid`, `paginator`, `ripple`, `scroller`, `tooltip`. `packages/ng/package.json` gains an `exports` map mirroring React/Vue's shape for these 8 subpaths (plus `.`).

**Amendment (Blueprint Completion implementation, 2026-09-13):** the original outcome above named all 12 component directories, including 4 composites — `button` (imports `../ripple`), `dialog` (imports `../button/button`), `menu` (imports `../ripple`, `../tooltip`), `table` (imports `../paginator/paginator`, `../scroller/scroller`). Attempting to add `ng-package.json` for all 12 surfaced a real, reproducible `ng-packagr@21.2.7` / `@angular/compiler-cli@21.2.22` defect (no newer 21.x patch exists): when one secondary entry point's TS program transitively imports a source file that is itself the entry root of a *different* secondary entry point, Angular's `ShimReferenceTagger` internal cache (`ext.originalReferencedFiles`/`ext.taggedReferenceFiles`, keyed by `SourceFile` identity, not by program) crashes with `Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined`. Confirmed via isolated minimal repro (`button` + `ripple` alone, all other `ng-package.json` files removed) that this is order-independent and specifically triggered by cross-entry-point source-graph overlap, not by the import specifier used (a direct-file import bypassing the barrel `index.ts` does not avoid it). Changing the import path does not fix it, since the underlying source file is still visited by both TS programs either way. Given no upstream fix is available and inlining private duplicate copies of shared directive logic (`URipple`, `UTooltip`, `UButton`, `UPaginator`, `UScroller`) inside each composite would introduce real, ongoing maintenance duplication, this work package's scope is narrowed to the 8 true leaf components. `button`, `dialog`, `menu`, and `table` remain reachable only via the primary `@ultimate/ng` entry point, same as before this work package — this is a real, permanent limitation of this dependency version for this repository's composite-component structure, not a temporary placeholder, and is documented as such in GAP-009/GAP-023's `BLUEPRINT_GAPS.md` resolution text (Task 6).

**Why it belongs here:** Directly named in the audit's gap list; the pattern is already proven twice (React, Vue) for leaf components; no new decision required for the 8 components it applies to. The 4-composite exclusion is a discovered implementation constraint, not a design choice requiring DECISION-track escalation — it does not touch Table/Data-family files or any protected decision.

**Necessary for freeze:** No single architecture question blocks it — it is implementation backlog the closure audit explicitly classified as non-blocking. Included in this workstream because it was named in the completion scope, not because Blueprint Freeze cannot occur without it.

**Dependencies:** None. Independent of every other work package.

**Verification:** `pnpm --filter @ultimate/ng build` succeeds and produces per-component `dist/<component>/` output for the 8 leaf components. `node scripts/provenance/verify-tree-shaking.mjs` is re-run against the new build; its result (pass, or a precisely-described remaining limitation) is recorded in `docs/architecture/PERFORMANCE.md`'s existing Phase 2 tree-shaking section — not silently dropped either way. Full existing Angular test suite (`pnpm --filter @ultimate/ng test`) remains green. `boundary:validate` and `size:validate`/`coverage:validate` CI gates remain green.

---

### WP2 — Provenance spec/validator reconciliation (GAP-010)

**Problem:** The Phase 2 spec names `sha256OfOriginal` as a required field on every provenance manifest entry. Neither `docs/architecture/provenance/ng.json` nor `ng-core.json` (nor any other manifest, confirmed by grep) has ever had this field. `scripts/provenance/validate-provenance.mjs` — the actual CI-enforced gate — checks a completely different mechanism: a `REQUIRED_HEADINGS` array matched against `docs/architecture/PROVENANCE.md`'s own markdown section headings. The two were never reconciled.

**Outcome:** The Phase 2 spec's text is amended in place — the line naming `sha256OfOriginal` as required gets a note that it was superseded by the real, implemented, CI-enforced heading-based mechanism in `validate-provenance.mjs`, and was never carried into the actual per-manifest schema. No manifest JSON file is modified. No new field is added anywhere.

**Why it belongs here:** Named directly in the audit's gap list. The validator already works exactly as intended; the only actual defect is a stale sentence in a historical spec document contradicting current, correct, enforced behavior.

**Necessary for freeze:** No — implementation/documentation backlog only. `provenance:validate` already passes today and requires no code change.

**Dependencies:** None.

**Verification:** `pnpm run provenance:validate` (already passing) continues to pass, unchanged. The amended spec file no longer states a requirement the validator doesn't check.

---

### WP3 — Commit generated AI/LLM context output (GAP-036)

**Problem:** `packages/ai/src/context-files.ts` exports real, tested `renderLlmsTxt`/`renderLlmsFullTxt`/`generateContextFiles` functions. Running `pnpm --filter @ultimate/ai build` produces real output at `packages/ai/dist/context/{llms,llms-full,llms-ng,llms-react,llms-vue}.txt` — but `dist/` is gitignored repository-wide, so this output has never been committed. No CI step touches `packages/ai` at all today (confirmed: zero matches for `packages/ai` or `llms` in `.github/workflows/ci.yml`).

**Outcome:** The generator's output target moves from `packages/ai/dist/context/` to a new, committed, non-gitignored `packages/ai/context/` directory (sibling to `src/`, versioned alongside the generator that produces it — consistent with how `skills/` already lives at repo root as committed, generated-adjacent content). `packages/ai/package.json`'s `build` script is updated to write there instead of under `dist/`. The generator is run once against the current 8-component metadata proof set, and its real output is committed as-is — a one-time snapshot, not a live-synced artifact. This is a manual, one-time action; CI is not wired to regenerate or diff-check this output going forward (explicitly declined — see Non-goals).

**Why it belongs here:** Named directly in the audit's gap list. The tooling is proven to work; only the "run it and commit it" step was missing.

**Necessary for freeze:** No — implementation backlog. Blueprint §25's named deliverable simply hasn't been produced as a repository artifact yet; nothing architectural is blocked by its absence.

**Dependencies:** None.

**Verification:** `pnpm --filter @ultimate/ai build` produces output at the new `packages/ai/context/` path. `pnpm --filter @ultimate/ai run validate` (the existing `validateSkillFile`-based check) passes against the committed output. `git status` shows the new files as tracked, not ignored. `git check-ignore packages/ai/context/llms.txt` returns nothing (confirms it is not gitignored).

---

### WP4 — Angular `UTooltip` `aria-describedby` wiring (GAP-006)

**Problem:** `packages/ng/src/tooltip/tooltip.ts`'s floating container has `role="tooltip"` but nothing wires `aria-describedby` from the trigger element back to it (ADR-023 follow-up 4, confirmed by direct grep in the closure audit — zero occurrences of `aria-describedby`/`ariaDescribedBy`).

**Outcome:** The trigger element gets a real `aria-describedby` attribute pointing at the tooltip's own id, applied when the tooltip becomes visible and removed when it hides — matching the standard ARIA tooltip pattern, isolated to this one component.

**Why it belongs here:** Small, isolated, single-component, real accessibility gap with a well-understood, standard fix. Included by explicit decision during brainstorming for sharing the same "small, mechanical, no new decision" character as the rest.

**Necessary for freeze:** No — implementation backlog.

**Dependencies:** None. Fully independent of every other work package, including WP5 (different component, different concern — Tooltip's `aria-describedby` is unrelated to Dialog/Overlay's z-index stacking).

**Verification:** Existing Vitest/TestBed suite (`packages/ng/src/tooltip/tooltip.spec.ts`) extended with a test asserting the association exists while visible and is absent/cleared while hidden. The existing Track A `axe-core` Playwright accessibility spec for Tooltip is re-run and continues to pass (or improves — this fixes a real, previously-undetected-by-automation gap in the association, distinct from what axe-core's generic `role="tooltip"` check alone can catch).

---

### WP5 — Angular overlay z-index/Escape stacking (GAP-007)

**Problem:** `packages/ng-core/src/overlay/overlay.ts`'s `UOverlay` hardcodes a single `"overlay"` z-index bucket for every instance. `packages/ng/src/dialog/dialog.ts`'s `UDialog` Escape handling is a plain, unconditional `keydown.escape` host listener with no topmost-instance check (ADR-020). React already solved this exact problem class: `packages/react-core/src/escape/`'s `createEscapeRegistry`/`createDisplayOrderRegistry` (ADR-026/ADR-036) is a real, framework-neutral, already-shared module in `@ultimate/uix-utils/escape` and `/zindex` — confirmed to exist and be consumed by `react-core` today. Angular has simply never adopted it.

**Outcome:** `UOverlay`/`UDialog` are updated to register with and query the shared `@ultimate/uix-utils/escape` and `/zindex` registries, the same way `react-core` already does — replacing the single-bucket z-index assignment and the unconditional Escape listener with registry-backed, priority-ordered equivalents. This is Angular *adopting* an existing, proven, framework-neutral mechanism, not designing a new one.

**Why it belongs here:** Directly named in the audit's gap list (in the original closure audit's own explicit-revisit set). Included by explicit decision during brainstorming. The shared infrastructure already exists and is already proven by a sibling framework's real, shipped consumption of it — this is the one work package in the set that changes runtime component behavior, not only packaging/documentation, and is called out as the workstream's single highest-risk item for that reason (see §6).

**Necessary for freeze:** No — implementation backlog. Blocks every *future* Angular overlay component's correct nested-stacking behavior, but blocks nothing about the Blueprint's own completeness today (only one overlay component, `UDialog`, currently exists for Angular).

**Dependencies:** None on other work packages. Soft sequencing note: shares `packages/ng-core`/`packages/ng` with WP1 (different files — no merge conflict) — sequence after WP1 within the implementation plan so a single Angular build/test pass can validate both together, not because WP1 must complete first.

**Verification:** Existing `packages/ng-core/src/overlay/overlay.spec.ts` and `packages/ng/src/dialog/dialog.spec.ts` suites extended with a new multi-instance scenario: two `UDialog` instances open simultaneously, Escape closes only the topmost, z-index ordering reflects display order — mirroring the scenario React's own `useDisplayOrder` test suite already covers. The zoneless-`TestBed` change-detection pattern ADR-022 documents (`markForCheck()` + `detectChanges(false)` + `whenStable()` in place of a second bare `detectChanges()`) is followed for any test needing sequential state mutations, to avoid the known `NG0100` pitfall. Existing Track A Playwright/Storybook Dialog specs re-run and continue to pass.

---

### WP6 — Gap registry closure (bookkeeping)

**Outcome:** Once WP1-5 are implemented and independently verified, `docs/architecture/BLUEPRINT_GAPS.md`'s GAP-006, GAP-007, GAP-009, GAP-010, GAP-023, and GAP-036 entries are each updated to `Status: RESOLVED`, following the exact evidence-citation style already established by this document's own prior resolved entries (e.g. GAP-003, GAP-004) — commit references, file paths, and a one-line summary of what changed. `ROADMAP.md` footnotes are updated only if their existing text is directly contradicted by the above (expected: footnote 5's `llms.txt` follow-up line needs updating; the others are unlikely to need changes, since they already disclose these exact gaps by name).

**Why it belongs here:** Every prior resolved gap in this document follows this same immediate-update convention (see `git log` on `d391acf`) — closing the loop in the same document that tracks the gap is how this repository has consistently avoided the stale-tracking-document drift multiple prior audits found and had to correct.

**Necessary for freeze:** This is the step that makes the freeze's own Definition of Done checkable — see §5.

**Dependencies:** Runs after WP1-5 are all implemented and verified. Blocks nothing else.

**Verification:** A direct read-through confirming each updated entry's evidence citation matches something real and checkable (a commit hash, a file path) — the same standard every prior resolution in this document already meets.

---

## 5. Blueprint Freeze Definition of Done

This workstream's completion is defined by all of the following holding simultaneously:

1. `packages/ng/package.json` has a per-component `exports` map matching React/Vue's shape (WP1).
2. `scripts/provenance/verify-tree-shaking.mjs`'s result against the new Angular build is documented in `PERFORMANCE.md`, whatever that result is (WP1).
3. The Phase 2 spec's provenance-field text no longer contradicts `validate-provenance.mjs`'s real, enforced behavior (WP2).
4. `packages/ai/context/{llms,llms-full,llms-ng,llms-react,llms-vue}.txt` exist as committed, non-gitignored repository files (WP3).
5. `UTooltip` (Angular) wires `aria-describedby`; the existing Track A accessibility gate continues to pass (WP4).
6. `UOverlay`/`UDialog` (Angular) use the shared escape/zindex registries; a real multi-instance stacking test exists and passes (WP5).
7. `BLUEPRINT_GAPS.md` reflects GAP-006, GAP-007, GAP-009, GAP-010, GAP-023, and GAP-036 as `RESOLVED` with commit-level evidence (WP6).
8. The full existing CI suite is green on the consolidated branch — format, lint, typecheck, unit/component tests (all frameworks), `boundary:validate`, `provenance:validate`, `size:validate`, `coverage:validate`, Track A (accessibility/visual/browser), Track E (SSR/hydration). No existing gate regresses.
9. `docs/architecture/BLUEPRINT.md` is byte-for-byte unmodified.
10. No protected decision (DECISION-D) or deferred decision (DECISION-B, DECISION-C's remainder, DECISION-E) is touched, reopened, or resolved.

Meeting all ten does not itself declare the Blueprint frozen — that remains a separate, later, explicitly human-authorized act (most likely a small documentation stamp on `BLUEPRINT.md`/`ROADMAP.md`), outside this workstream's own scope.

---

## 6. Risks

- **WP5 is qualitatively heavier than the other five packages** — it is a real behavioral code change to a shipped component (`UDialog`) plus new test scenarios, not a config/doc/generate-and-commit change. If it surfaces an unexpected interaction (for example, the zoneless-change-detection `NG0100` class of issue ADR-022 already documents once for this exact area), it has more capacity to stall than any other work package. Mitigation: the implementation plan sequences WP5 after WP1 and WP4 (the other Angular-package-touching, lower-risk items) precisely so a snag in WP5 does not block those from being independently verified and merged-in-spirit first, even though all six land as one consolidated PR/branch per the brainstorming decision to keep one plan/one implementation cycle.
- **`ng-packagr` secondary entry points (WP1) have no existing example in this repository to copy from** — React/Vue's `tsup`-based multi-entry pattern is a different mechanism (a single config object) than Angular's real convention (a `ng-package.json` per component directory). This is a known, standard Angular Package Format mechanism, not a novel design, but the implementation plan should budget for reading `ng-packagr`'s own documentation/schema rather than assuming a one-line change.
- **WP3's build-script change touches `packages/ai/package.json`'s `build` script**, which is also invoked by that package's own `validate` script chain — the plan should verify both scripts still compose correctly after the output path moves.

No risk identified here rises to a reason for further decomposition — each is a normal implementation-plan-level sequencing/research concern, not evidence the workstream is too large for one spec/plan.

---

## 7. Explicit scope boundary restated

This workstream does not, and must not:
- Modify `docs/architecture/BLUEPRINT.md`.
- Resolve, narrow, or advance DECISION-B, DECISION-C's remainder, or DECISION-E.
- Reopen DECISION-D.
- Add any new architectural decision, ADR, or gap not already named in §4.
- Wire CI to regenerate `llms.txt` automatically.
- Touch any Table/Data-family component or file.
- Declare the Blueprint frozen.
