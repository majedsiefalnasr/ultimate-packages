# GAP-098 Scoped Box Model Implementation Plan

> **For agentic workers:** Execute inline, test first. **Hard stops:**
>
> - Task 5 stops on any newly failing layout or behaviour assertion, any needed assertion edit, or a failure in the RTL half that has never run.
> - Task 7 stops for the owner's visual acceptance of the regenerated baselines.
>
> Do not merge before Task 7 acceptance.

**Status:** APPROVED (revision 3). Plan Review round 1 returned CHANGES REQUIRED; findings 1–13 are applied, and Spec Amendment A1 is recorded. Round 2 returned APPROVED WITH CHANGES; N1–N3 are applied (2026-10-15).

**Goal:** Implement ADR-063, Spec revision 4 and Amendment A1:

- each framework core registers a per-component `border-box` rule, scoped to that component's root, overlay, panel and mask classes taken from its style module;
- no page-wide reset;
- the Angular and Vue G3-D Drawer failures are fixed.

**Architecture:**

- `@ultimate/uix-styled` `stylesheet/box-model.ts`, following the `registerHiddenAccessible`/`registerIconSpin` pattern.
- Three core call sites.
- Plain-Vitest enumeration and reparenting checks in `packages/themes/test`.
- Core unit tests.
- e2e probes.
- Release and provenance records.

**Tech stack:**

- TypeScript.
- Vitest: `uix-styled`, `themes`, `vue-core` and `react-core`. `ng-core` runs under `@angular/build:unit-test`.
- Playwright 1.63.0 in `mcr.microsoft.com/playwright:v1.63.0-jammy`, arm64.
- Node 24.15.0.
- pnpm 9.6.0.

## Global constraints

- The [approved Specification](../specs/2026-10-15-gap-098-scoped-box-model-design.md) revision 4 and Amendment A1 govern.
- **New files:**
  - `packages/uix-styled/src/stylesheet/box-model.ts`;
  - `packages/uix-styled/test/box-model.test.ts`;
  - `packages/themes/test/box-model-roots.test.ts`;
  - `packages/themes/test/box-model-ng-reparenting.test.ts`;
  - `packages/{ng,vue,react}/e2e/box-model.spec.ts`.
- **Modified files:**
  - `packages/uix-styled/src/index.ts` and `test/exports.test.ts`;
  - the three cores' registration files and their specs (Task 3);
  - `docs/architecture/MIGRATION.md`;
  - `docs/architecture/PROVENANCE.md`;
  - `docs/architecture/provenance/uix-styled.json`;
  - screenshot baselines attributed to the change (Task 7);
  - ADR-063, the Spec, this Plan and the decided options document.
- **Must not change:**
  - component style modules;
  - templates;
  - existing e2e assertions;
  - the CI workflow.
- **Forbidden:**
  - any page-wide selector;
  - any `u-` attribute-prefix selector;
  - any Drawer-specific code.
- **Worktree:** `../ultimate-gap-098b`, branch `feature/gap-098-scoped-box-model` (`--no-track`). Rebase onto the current `origin/main` before the PR, keeping ADR-062 and ADR-063 both present.

## Task 0: Environment and recorded reference

1. Run `pnpm install --frozen-lockfile`.
2. Run the CI browser steps in Docker on an unchanged `main` export (scratch `full-suite.sh`: strict, G3-A to G3-E for ng/vue, and strict for react; `--retries=0`; JSON report per step).
3. **Record** every failure as the inherited reference. Nothing is asserted at this point. Task 5 compares against this record.

## Task 1: `uix-styled` box-model module (red → green)

**Tests** (`packages/uix-styled/test/box-model.test.ts`, following `test/icon-spin.test.ts`):

- `boxModelCss(["u-drawer", "u-drawer-mask"])`:
  - emits exactly the three-selector rule from Spec §2;
  - throws on `[]`, `["drawer"]` and `["u-a b"]`.
- `scopeRootsOf(classes)` (A1, internal `cn`, `Record<string, unknown>`):
  - selects the keys `root`, `overlay`, `panel` and `mask`, and keys ending in `Root`, `Overlay` or `Mask`;
  - resolves function values with `{}`;
  - takes the first `u-` token;
  - de-duplicates;
  - ignores `header` and `tabPanel`.
- `registerBoxModel(sheet, "drawer", roots)`:
  - adds `u-box-model:drawer` once, and is idempotent;
  - is a **no-op** for `componentName === ""` or `roots.length === 0` (A1).
- Add the four new exports to `test/exports.test.ts`.

**Implementation:**

- The module comment cites `@primeuix/styles` 2.0.3 `base` and PrimeReact 10.9.9 `ComponentBase.js:259-263`.
- Export from `src/index.ts`.

## Task 2: Enumeration and reparenting checks (guards; they pass on the current tree)

These specs describe the current tree. They must pass on their first run, and each is proven able to fail.

1. **Roots enumeration** (`packages/themes/test/box-model-roots.test.ts`, plain Vitest):
   - Glob `../../{ng,vue,react}/src/*/*-style.ts` (eager) and collect every exported object that has `css` and `classes`.
   - For every `*-style.ts` file, assert:
     - it exports at least one such object;
     - every exported object yields at least one `u-` root through `scopeRootsOf`;
     - no root equals `u-scroll-panel-bar-grabbed`, `p-overflow-hidden` or `u-overflow-hidden`.
   - **Non-vacuity:** the glob keys must equal an `fs` listing of `packages/{ng,vue,react}/src/*/*-style.ts`. At the time of writing that is 83, 86 and 83 files, holding 85, 88 and 84 style objects, so each framework's count is non-zero.
   - **Proof it fails:** a test-local style object with only a `header` key yields `[]`, and the helper assertion rejects it.
2. **Angular reparenting static check** (`packages/themes/test/box-model-ng-reparenting.test.ts`):
   - Read `packages/ng/src/*/*.ts` with `node:fs`, which works under plain Vitest. Exclude `*.spec.ts` and `*.stories.ts`, because test host templates bind no `cx()`.
   - Parse only the `template:` backtick literal of each component. Comments and docs are ignored.
   - Match elements, including multi-line attribute lists, that carry `uOverlay` or `appendTo`.
   - Each must bind `cx('<scope key>')`. The scope keys follow the `scopeRootsOf` key rule.
   - **Named exception, asserted:** in `menu.ts` the `uOverlay` wrapper's child is `<ng-container [ngTemplateOutlet]="menuPanel">`. The test asserts that the `#menuPanel` template's first element binds `cx('root')`.
   - **Body-append allowlist:**
     - Every `appendChild(` call whose target mentions `body` in ng sources must be on the allowlist.
     - The one allowlisted case is `tooltip.ts`, and the test pins its class line, `this.renderer.setAttribute(container, "class", this.cx("root") ?? "")`, matched with a whitespace-tolerant pattern.
     - The append regex matches both `appendChild(<…body…>, …)` and `body.appendChild(`.
     - An unlisted body append fails.
   - **Non-vacuity:** the scan must find the known 17 template `uOverlay`/`appendTo` sites and the one Tooltip body append. Any change in those counts fails the test and needs review.
   - **Proof it fails:** a test-local copy of a template string with the binding removed must be reported.

## Task 3: Core registration (red → green)

**Tests first.** Give one fixture per core a real root, e.g. `classes: { root: "u-alpha" }`, so the key position is observable.

- **`ng-core` `base-component.spec.ts`:**
  - after init, the per-document sheet has `u-box-model:<name>` before the component key;
  - a second document gets its own registration;
  - an injected SSR document gets the rule in its head;
  - an empty `classes` fixture registers no box-model key.
- **`vue-core` `styling.spec.ts`:**
  - the key is registered on mount, before the component CSS;
  - it is also registered when the component key already exists, because the call sits before the early `has(componentName)` return.
- **`vue-core` `additional-preset-keys.spec.ts`:** update the exact arrays deliberately for the fixture that now has a root.
- **`vue-core` base-editable-holder:** the empty-name default does not throw and registers nothing.
- **`react-core` `styling.spec.ts`:** the same assertions, through `useComponentStyle`. Update the `afterFirst + 1` index arithmetic where the fixture gains a root.
- **Vue and React `ssr-contract` specs:** no `u-box-model:*` key is registered during server render.

**Implementation:** in each core, call `registerBoxModel(sheet, componentName, scopeRootsOf(styleModule.classes))` immediately before the component CSS `add`. In Vue, place the call before the early return.

**Then run:**

- the repository `test` and `typecheck`;
- `pnpm --filter @ultimate/themes test`;
- `pnpm --filter @ultimate/uix-styled test`.

## Task 4: Release and provenance records

- **`MIGRATION.md`** entry, following the GAP-124 form. Cover:
  - the per-component `border-box` scope, including wrapper subtrees (Fluid, Card, Panel, Dialog) and host directives such as `[uInputText]`;
  - reserved root class names;
  - the layered-CSS caveat and its override;
  - that `@ultimate/uix-styles/base` is not the supported fix.
- **`PROVENANCE.md`:** add a "GAP-098 box-model source disclosure" section, following the GAP-124 icon-spin section (`228e196d`). The `--base-ref` diff check requires it, because the PR touches `packages/uix*`/`*-core` `src`.
- **`provenance/uix-styled.json`:** add an entry for `packages/uix-styled/src/stylesheet/box-model.ts`:
  - `modificationStatus: "reference-derived"`;
  - `originalPath` naming both upstream sources;
  - a description following the hidden-accessible and icon-spin entries.
- **Verify** that each new `src` file has its manifest entry, using `jq` against `ultimateDestination`. The repository validator is still red under GAP-094 and does not prove this.
  - Expected new `src` files: `box-model.ts` only. The test files live under `test/` and `e2e/`, which are not watched.

## Task 5: CI-image verification and cross-framework assessment — HARD STOP

On a fresh export in Docker:

1. **G3-D:** run the ng and vue G3-D specs three times with `--retries=0`. `Drawer full and RTL` must pass in all six projects every time. **Stop** on any RTL-half failure.
2. **Full run:**
   - Run `full-suite.sh` against the **unchanged** baselines.
   - Diff the result against the Task 0 record.
   - Classify every new failure as a screenshot difference, a layout/behaviour assertion, or other.
   - **Stop** on any non-screenshot failure, any needed assertion edit, or any failure that cannot be attributed to the box model.
3. **Accessibility:** the G3 differential accessibility validators and `ACCESSIBILITY_BASELINE.md` validation pass unchanged.
4. **SSR:** the three SSR hydration projects pass.

## Task 6: Coverage and projected-content probes (red → green)

**Inventory first.** Extract every descendant selector in the ng, vue and react style CSS that targets an element without a `u-` class, such as `.u-avatar img`, `.u-knob svg` and `.u-image-toolbar > button`. Record it in the PR evidence.

**Probe:** `packages/{ng,vue,react}/e2e/box-model.spec.ts`, titles free of `G3-` tokens so the files run in the strict step.

- **Stories:**
  - Angular: the 14 reparenting components, plus Menu popup and Tooltip.
  - Vue and React: every component that uses `UPortal`/`Portal` or a direct body append (A1), plus the same 14 where a story exists.
  - Skipped stories are listed in the evidence. The known one is the Menu popup in Vue and React, which only have a Default story.
- **Assertions:**
  1. Open the overlay, panel or mask.
  2. Every element carrying a `u-` class that is inside `#storybook-root` **or is a direct child of `<body>` or descends from one** computes `box-sizing: border-box`. `html`, `body` and Storybook's own harness elements are excluded.
  3. Every inventoried unclassed descendant that is present computes `border-box`.
- **Projected-content probe:** application content inside an Angular and a Vue Dialog or Panel story computes `border-box`.

Run the probes three times in Docker. A failing element is a coverage hole: **stop** and analyse it. Never weaken a probe.

## Task 7: Baselines — HARD STOP for owner acceptance

1. In Docker, regenerate only the screenshots that Task 5 attributed to the box model, using `--update-snapshots` limited to those tests.
2. Re-run the affected steps three times with `--retries=0`. Everything must pass.
3. Build a before/after inventory per framework, with React listed separately as regression-only. For each changed baseline give the test, the engine and a one-line geometric reason, with the images linked in the PR.
4. **Hard stop:** the owner's visual acceptance is required before merge.

## Task 8: Review and PR

1. Run the repository `test`, `typecheck`, `lint` and `format:check`.
2. Get an independent code review and fix the in-scope findings.
3. Rebase onto the current `origin/main`, keeping both ADRs.
4. Push with `git push -u origin feature/gap-098-scoped-box-model:feature/gap-098-scoped-box-model` and verify the output does not show `-> main`.
5. The PR description contains:
   - the scope;
   - the Task 0 vs Task 5 comparison;
   - the descendant inventory;
   - the probe evidence, including skipped stories;
   - the baseline inventory;
   - a statement that merge is blocked on the owner's visual acceptance.
6. PR CI: both "Run G3-D verification specs" steps are green. Compare every other result against the current `main` baseline: no new failures, and name the inherited GAP-094 provenance failure.
