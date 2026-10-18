# Workstream 1 — Shipped-component completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED. The user approved Plan Review on 2026-10-18. Each wave PR and batch PR still needs the user's merge authorization, and baseline changes need the user's visual acceptance.

**Goal:** fix the shipped components in six family waves. Each wave delivers the Spec §4 parity gaps, the ADR-053 accessibility items and React Aura token consumption, then a manifest-only provenance batch.

**Architecture:** each wave is one source PR covering ng, React and Vue for its family, followed by one manifest-only batch PR.

- The first time a wave's React work needs a capability that doesn't exist yet, that wave adds it to `react-core`: `additionalPresetKeys` in W6.
- Verification follows the G3 tranche pattern: per-framework Playwright specs (`packages/<fw>/e2e/w<N>-<family>.spec.ts`), plus one CI step per wave.

**Tech stack:** Node `24.15.0`, pnpm `9.6.0`, Angular 21, React 18, Vue 3.5, Vitest, Playwright `1.63.0` (Docker image `mcr.microsoft.com/playwright:v1.63.0-jammy`), axe-core 4.13, `@ultimate/uix-styled` `dt()`.

**Spec:** [`2026-10-18-workstream-1-shipped-component-completion-design.md`](../specs/2026-10-18-workstream-1-shipped-component-completion-design.md) (approved 2026-10-18, D1 and D2). Decisions: ADR-051, ADR-052, ADR-053, ADR-061, ADR-062, ADR-063, ADR-064, ADR-065, ADR-067.

## Global Constraints

- **Toolchain:** Node `24.15.0` and pnpm `9.6.0` on PATH (`export PATH=~/.nvm/versions/node/v24.15.0/bin:$PATH`).
- **No weakening:** no CI gate, threshold or baseline is weakened. No CI exception. R6 stays at 15% and R7 at 2 points.
- **Visual baselines:** regenerated only in Docker (`mcr.microsoft.com/playwright:v1.63.0-jammy`), and only after the user accepts the wave visually. Never hand-edited.
- **Axe baseline:** a row is removed only when a real scan no longer reports it (`pnpm run accessibility:validate`). Never removed by hand.
- **React tokens:** read through `dt('<presetkey>.<path>')`, with no colour fallbacks (ADR-067). Source is the pinned `@primeuix/styles@2.0.3`; never PrimeReact theme CSS (ADR-065).
- **Provenance:**
  - wave PRs add no manifest entries for GAP-094 backlog files;
  - files a wave creates get entries in the same PR;
  - incorporating Prime-derived source updates `PROVENANCE.md` (ADR-061);
  - a wave counts as closed only once its batch PR has merged and changed-file completeness is recorded (ADR-052 X-12(2)).
- **Metadata:** any public API change on button, checkbox, dialog, menu, paginator, scroller, table or tooltip updates the metadata record, its `metadataVersion` and the generated artifacts, so `drift:check` stays green.
- **Git:** every branch is created with `git worktree add --no-track -b <branch> <dir> origin/main` and pushed with `<branch>:<branch>`. Stage named files only, use Conventional Commits, and end each commit with the session attribution lines.
- **CI comparison:** by failure lines against the latest `main` run. `main` currently has two red steps, "Provenance validation" and the accepted `component-metadata` R6 regression.
- **Merges:** each wave PR and each batch PR needs the user's merge authorization. No workflow dispatch.

## Review Focus

1. **Dark colour scheme.** React components must follow Aura's dark tokens when the dark selector is active, exactly like ng/Vue. Each wave spec includes a dark-mode computed-style assertion (Tasks 1, 3–7).
2. **Mixed instances on one page.** A component registering an extra variables-only key must not drop another component's structural CSS. The InputMask + InputText page test is in Task 7.
3. **SSR and hydration.** React token CSS must produce no hydration mismatch. The existing `track-e-ssr-hydration` jobs stay green, and each wave PR's CI comparison checks them (Tasks 1, 3–7).
4. **Consumer overrides.** A consumer's `class`/`style` (and `pt`, where supported) still win over token styles. Each wave spec includes one override assertion per framework for a converted component.
5. **Scheme change after render.** With the default `darkModeSelector: "system"` (`packages/themes/src/apply-theme.ts`), switching the OS colour scheme after the first render updates React token values, the same as ng/Vue. Asserted in Task 1 for Toolbar.

---

### Task 0: D2 classification of the GAP-064 follow-ups (docs)

**Branch:** delivered with this Plan, on `docs/workstream-1-component-completion-spec`.

**Files:** Create `docs/architecture/research/2026-10-18-w1-gap-064-followup-classification.md`.

**Steps:**

- [ ] **Step 1: List every follow-up** from `BLUEPRINT_GAPS.md` GAP-064:
  - Tranche 1 follow-ups 1–9 (around line 1111);
  - G3-B U1, U2 and the Vue BlockUI story (around line 1138);
  - G3-C1 follow-ups (around line 1164).
- [ ] **Step 2: Classify each** as one of:
  - **in wave W<N>**: name the wave and the requirement;
  - **exception**: give the reason, to be entered in BLUEPRINT_GAPS §10 if it is a publish-level exception;
  - **confirmed closed**: give the evidence (commit, test or CI run).

  Also list the Spec §4 ng (16) and Vue (7) residual modules, each marked "exception: proof-set `uix-styles` / no upstream style" or "in wave W<N>".

- [ ] **Step 3: Format check.** Run Prettier. Commit the record on this branch, after the approved Plan.

### Task 1: W1 — React Toolbar pilot (Option B)

**Branch:** `feat/w1-toolbar-pilot`.

**Files:**

- Modify: `packages/react/src/toolbar/toolbar-style.ts`.
- Create: `packages/react/e2e/w1-toolbar.spec.ts`, plus `packages/react/e2e/aura-tokens.ts` (shared token helper, beside `accessibility-envelope.ts`).
- Modify: `.github/workflows/ci.yml`, adding the step "Run W1 verification specs (react)".
- Modify: the React Toolbar visual baselines (regenerated).
- Modify: `docs/architecture/PROVENANCE.md`, if the port incorporates Prime-derived source.

**Interfaces:**

- Produces `packages/react/e2e/aura-tokens.ts`, which later waves reuse:
  - `expectAuraValue(locator: Locator, cssProperty: string, presetPath: string): Promise<void>`.
  - `@ultimate/themes` has no preset-value resolver, so the helper derives the expected value in the page:
    - it maps `presetPath` to its `dt()` variable (`toolbar.background` → `--u-toolbar-background`);
    - it gives a temporary probe element in the same document that property set to `var(--u-…)`;
    - it asserts the probe's computed value is non-empty and equals the target's.
  - The caller sets the scheme with `page.emulateMedia({ colorScheme })`, as `packages/vue/e2e/gap-124-contrast.spec.ts` does.

**Steps:**

- [ ] **Step 1: Write the failing tests** in `w1-toolbar.spec.ts`:
  - `toolbar root uses Aura tokens`: assert `background-color`, `border-color`, `border-radius`, `gap` and `padding` equal the Aura `toolbar.*` values, in light and dark schemes.
  - `consumer style wins`: `style={{ background: "rgb(1, 2, 3)" }}` gives that exact computed value.
  - `toolbar follows a scheme change after render`: load in light, switch to dark with `emulateMedia`, and assert `background-color` follows (Review Focus 5).
- [ ] **Step 2: Confirm they fail.** Run `npx playwright test packages/react/e2e/w1-toolbar.spec.ts`. Expected: FAIL, because the computed values come from the literal fallbacks.
- [ ] **Step 3: Rewrite `toolbar-style.ts`.**
  - Mirror the structure of Ultimate's Vue Toolbar style (`packages/vue/src/toolbar/toolbar-style.ts`), which already uses `dt('toolbar.*')`, and the pinned `@primeuix/styles@2.0.3` toolbar style.
  - No colour fallbacks, and no PrimeReact theme CSS.
  - Keep `componentName: "toolbar"` (already the preset key).
  - Keep every class in `classes`.
- [ ] **Step 4: Run the checks.**
  - The spec passes.
  - `pnpm --filter @ultimate/react test` passes.
  - The React SSR e2e (`apps/playground-react/e2e`) passes.
  - The provenance diff check passes (`pnpm run provenance:validate -- --base-ref origin/main`).
- [ ] **Step 5: Visual acceptance stop (the user).**
  - Render the before/after Storybook screenshots for React Toolbar, all stories, in Docker. React baselines are regression-only: `tooling/prime-reference` has no React reference app.
  - Present them to the user.
  - On acceptance, regenerate only the affected React baselines in Docker with `--update-snapshots` limited to those tests, then re-run them three times with `--retries=0` (the GAP-098 Task 7 pattern).
- [ ] **Step 6: CI step.** Add "Run W1 verification specs (react)" to the browser job, following the pattern of the existing "Run G3-E verification specs" step.
- [ ] **Step 7: Commit and open the PR.**
  - Commit as `feat(react): Toolbar consumes Aura tokens (W1 pilot, Option B)`.
  - Open the PR. Compare its CI by failure lines.
  - Merge only with the user's authorization.

### Task 2: W1 manifest batch and tracking

**Branch:** `docs/w1-provenance-batch`, created after Task 1 merges.

**Files:**

- Modify: `docs/architecture/provenance/react.json`, adding entries only for `toolbar-style.ts` and any Task 1 backlog file.
- Create: a dated evidence table, `docs/architecture/research/<date>-gap-094-w1-batch.md`, in the GAP-094 batch format.
- Modify: `docs/architecture/BLUEPRINT_GAPS.md`:
  - record that GAP-094's `toolbar-style.ts` hold is resolved by Option B;
  - add GAP-064 progress.
- Modify: `docs/architecture/COMPLETION_REGISTER.md` (C05, adding GAP-085 to its list, and C04).
- Modify: `docs/architecture/ROADMAP.md` footnote 1.

**Steps:**

- [ ] **Step 1: Classify** `toolbar-style.ts` against its rewritten content (ADR-064/065, theme screening per the ADR-064 clarification). Record the evidence.
- [ ] **Step 2: Validator check.** Run the validator. The missing count must drop by exactly the batch's files, with no new missing file and the excluded set unchanged (GAP-094 Spec §4.6).
- [ ] **Step 3: Tracking edits.** Correct ROADMAP footnote 1: paginator and scroller source from `uix-styles`, and React consumes Aura tokens under ADR-067. Update the register.
- [ ] **Step 4: Commit and open the PR.**
  - Commit as `docs(gap-094): W1 Toolbar provenance batch and tracking`.
  - Open the PR. Merge only with the user's authorization.
  - After merge, record W1 as closed in the ledger, with changed-file completeness (X-12(2)).

### Tasks 3–7: Waves W2–W6 (one task per wave, same structure)

Each wave task is one source PR. Its scope is the Spec §4 row for that wave: gaps, accessibility items and React modules. Its batch PR follows the Task 2 pattern.

| Task | Wave                     | Branch                      | Extra deliverable                                                                                                                        |
| ---- | ------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 3    | W2 Menus and navigation  | `feat/w2-menus-navigation`  | —                                                                                                                                        |
| 4    | W3 Overlays and feedback | `feat/w3-overlays-feedback` | —                                                                                                                                        |
| 5    | W4 Media                 | `feat/w4-media`             | —                                                                                                                                        |
| 6    | W5 Data and lists        | `feat/w5-data-lists`        | Table and Scroller accessibility rows; Table and Paginator metadata records if their API changes                                         |
| 7    | W6 Forms and display     | `feat/w6-forms-display`     | `react-core` `additionalPresetKeys` (see the Interfaces below); Checkbox `label` rows; Button and Checkbox metadata if their API changes |

**Files (for every wave task):**

- Modify: the component sources and styles in `packages/{ng,react,vue}/src/<component>/` named in Spec §4 for the wave.
- Create: `packages/{ng,react,vue}/e2e/w<N>-<family>.spec.ts`. Specs that also run accessibility checks get a validator `scripts/provenance/validate-w<N>-accessibility.mjs` and its test, following the existing `validate-g3e-accessibility.mjs` pattern.
- Modify: `.github/workflows/ci.yml`, adding "Run W<N> verification specs (${{ matrix.framework }})".
- Modify: the visual baselines, after acceptance; `docs/architecture/ACCESSIBILITY_BASELINE.md`, removing rows only on scan evidence; `docs/architecture/research/<date>-w<N>-ac7-manual-checks.md` (AC-7 records).

**Interfaces (Task 7 only):**

- `useComponentStyle(componentName: string, styleModule: StyleModule, additionalPresetKeys: readonly string[] = []): void` in `packages/react-core/src/styling/use-component-style.ts`.
  - Each additional key calls `registerThemeVariables(reactCoreStyleSheet, key)` only.
  - Additional keys never register a structural sheet or a box model.
- `useComponentBase({ componentName, styleModule, additionalPresetKeys? })` passes the keys through.
- Test it in `packages/react-core/src/styling/additional-preset-keys.spec.tsx`, mirroring Vue's `additional-preset-keys.spec.ts`. The test asserts:
  - the variables exist for both keys;
  - no structural sheet exists under the extra key;
  - a page with `UInputText` and `UInputMask` keeps both components' structural CSS (Review Focus 2).

**Steps (for every wave task):**

- [ ] **Step 1: Reproduce each gap** in the wave with the Parity Playbook method, recording upstream versus Ultimate evidence. If a gap needs a contract decision its text does not settle, stop the wave and report it to the user (Spec W1-R2).
- [ ] **Step 2: Write failing tests per gap.** Each test's name is the gap ID plus a short phrase, for example `GAP-086 context menu arrow keys move focus`. Its assertions come straight from the gap's "Expected state" in `BLUEPRINT_GAPS.md`.
- [ ] **Step 3: Write failing token tests per React module** in the wave. For each module, assert one representative visual property per state with `expectAuraValue` (Task 1 helper), in light and dark schemes. Add one consumer-override assertion (Review Focus 4). Modules that already resolve, and the D1(c) exceptions, get no token test and no change.
- [ ] **Step 4: Capture failing accessibility evidence.**
  - Record the wave's G2 axe rows on a real scan before the fix (`node scripts/provenance/validate-accessibility-baseline.mjs --report <glob>`; the `accessibility:validate` script already passes `--check`).
  - Note the `color-contrast` rows that need an AC-3a test.
- [ ] **Step 5: Run the failing tests.** Run the new specs per framework. Expected: FAIL on each new assertion, and PASS on everything already existing.
- [ ] **Step 6: Implement the fixes.**
  - Gaps follow ADR-052 X-1–X-6.
  - React modules follow Spec W1-R3:
    - layout-only modules: port from `@primeuix/styles@2.0.3`;
    - wrong-name and hard-coded-colour modules: switch to `dt()` paths;
    - key fixes: use the Spec §4 key table, plus `additionalPresetKeys` in Task 7.
  - Accessibility fixes follow ADR-053.
  - Any metadata-record API change updates the record, its `metadataVersion` and the generated artifacts (`pnpm --filter @ultimate/component-metadata run docs:generate`; `pnpm --filter @ultimate/ai run build`).
- [ ] **Step 7: Run the checks.**
  - **Tests:** the new specs pass, and every package's tests pass.
  - **Accessibility:** the scan shows the wave's G2 rows gone, and `accessibility:validate` passes with those rows removed.
  - **Health checks:** `drift:check` passes; the SSR jobs pass; the provenance diff check passes.
  - **Size:** run `size:measure`/`size:validate`. If a package grows past 15%, flag it for the Track B accepted-growth procedure, without changing the gate.
- [ ] **Step 8: AC-7 manual checks.** Run and date a manual assistive-technology check for each required fix (VoiceOver with Safari, or NVDA with Firefox). Record the result per fix in the wave's AC-7 record.
- [ ] **Step 9: Visual acceptance stop (the user).**
  - Present before/after screenshots for every changed story in all three frameworks, plus the AC-3a contrast results with each row's proposed fix or exception.
  - On acceptance, regenerate only the affected baselines in Docker with `--update-snapshots` limited to those tests, then re-run them three times with `--retries=0`.
  - Enter each approved exception as one row in `BLUEPRINT_GAPS.md` §10.
- [ ] **Step 10: Commit and open the PR.**
  - Add the wave's CI verification step.
  - Commit as `feat(w<N>): <family> parity, accessibility and Aura tokens`.
  - Open the PR. Compare its CI by failure lines.
  - Merge only with the user's authorization.
- [ ] **Step 11: Batch PR.** Follow Task 2's steps for the wave's backlog files and tracking. Set each fixed gap RESOLVED with its PR and CI run, and update C05/C08. The wave closes when the batch PR has merged and changed-file completeness is recorded.

**Wave-specific notes:**

- **Task 6 (W5):** GAP-124 is finished, not restarted (it is PARTIAL); read its existing record first. The Angular OrganizationChart port belongs to C06 and is not in this task.
- **Task 7 (W6):**
  - Land the `additionalPresetKeys` step before the key-fix modules.
  - `input-textarea` also renames its reads to `dt('textarea.*')`.
  - `input-switch` also gets a layout-only port.
- **Any wave:** the Plan may split a wave into several PRs when one would be too large to review (Spec §4). The scope and the single acceptance stop stay the same.

---

## Self-review (author)

- **Spec coverage:**
  - W1-R1 (waves and acceptance): Tasks 1–7 and Step 9.
  - W1-R2: Steps 1, 2 and 6.
  - W1-R3: Task 1, Steps 3 and 6, and Task 7's `additionalPresetKeys`.
  - W1-R4: Steps 4, 7 and 8.
  - W1-R5: Task 2, Step 11 and the Global Constraints.
  - W1-R6: Step 6, Step 7's size check and the Global Constraints.
  - W1-R7: Task 2 and Step 11.
  - D2: Task 0.
  - Acceptance rows A1–A6: Steps 7, 9 and 11.
- **Consistency:** `expectAuraValue` (Task 1) is reused in Tasks 3–7. `additionalPresetKeys` is defined only in Task 7, which is its first consumer.
- **Verified against the repository** by the author on 2026-10-18. The independent AI check stopped on a usage limit before reporting. Checked:
  - the e2e file layout and helper location;
  - the dark-scheme mechanism (`emulateMedia`);
  - the accessibility validator flags;
  - `provenance:validate --base-ref`;
  - the `apps/playground-*/e2e` SSR suites;
  - the `useComponentStyle`/`useComponentBase` signatures;
  - the location of Vue's `additionalPresetKeys`;
  - that Vue Toolbar is already `dt('toolbar.*')`-based;
  - the Docker baseline-update pattern.
- **Points for Plan Review:**
  1. One CI verification step per wave, following the G3 tranche pattern (ADR-052 tranche CI evidence).
  2. AC-7 manual checks are performed by the implementer or the user. Assistive-technology runs need a human-operable machine, which the user must schedule.
  3. Each wave has two PRs (source and batch), and each merge needs authorization.
