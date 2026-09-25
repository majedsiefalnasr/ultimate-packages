# GAP-039 — Vue Tooltip Visibility Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Vue `v-tooltip` panel genuinely visible in a real browser by adding the one missing inline `display` style, and convert the existing Playwright regression from asserting the known failure to asserting correct behavior.

**Architecture:** No architecture change. Single-property addition to an existing inline-style object literal in `packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()`, mirroring real PrimeVue's own `create()` mechanism (verified in Spec §1.2). Existing Playwright e2e coverage is flipped from red-known-failure to green-regression, and its stale invisible-tooltip visual-regression baselines are regenerated.

**Tech Stack:** Vue 3 custom directive, Vitest (unit), Playwright (real-browser e2e).

**Spec:** `docs/superpowers/specs/2026-09-25-gap-039-vue-tooltip-visibility.md`

## Global Constraints

- Implementation files are limited to exactly: `packages/vue/src/tooltip/tooltip.ts`, `packages/vue/e2e/tooltip.spec.ts`, and the three committed PNG baselines under `packages/vue/e2e/tooltip.spec.ts-snapshots/` that this fix's own visibility change invalidates. No other file is touched.
- The implementation correction is exactly the inline `display: "inline-block"` property added to the tooltip panel's existing `style` object in `showTooltip()`. No other logic change.
- Do not modify `packages/uix-styles/src/tooltip/index.ts` or any other `uix-styles` file.
- Do not wire, remove, or otherwise change `packages/vue/src/tooltip/tooltip-style.ts` or its `classes.root` resolver.
- Do not touch Angular (`packages/ng/**`) or React (`packages/react/**`) Tooltip implementations, or any other component.
- Preserve all existing Tooltip behavior and e2e assertions outside the visibility-specific assertions (role, text/escape semantics, `aria-describedby` wiring, computed position, disabled short-circuit, accessibility scan).
- No new dependency, no new shared package/foundation, no architectural or public API change.
- The GAP-039 registry prose correction (`docs/architecture/BLUEPRINT_GAPS.md`) is a closeout documentation follow-up, not an implementation-file change under this plan.

## Review Focus

- **Stale visual-regression baseline masking the fix as a false failure:** the three committed Tooltip Default-story visual-regression PNGs (`packages/vue/e2e/tooltip.spec.ts-snapshots/Vue-Tooltip-Default-story-visual-regression-1-vue-{chromium,firefox,webkit}.png`) were captured while the tooltip was invisible (`display: none`). After the fix, the real screenshot content changes (a visible tooltip panel now appears), so the existing baselines will genuinely mismatch and must be regenerated — covered in Task 2.
- **Escape/content rendering regressing silently:** the inline-style object is edited by hand; a copy/paste slip could clobber the adjacent `width` or `position` properties. Task 1's step re-runs the full existing unit suite, which already covers `textContent`-vs-`innerHTML` and disabled short-circuit, to catch this.
- **`aria-describedby`/position assertions silently passing for the wrong reason:** once the panel is visible, `toBeVisible()`/`display` assertions could pass while an unrelated regression breaks position or a11y wiring. Task 2 keeps every other existing assertion in the same test unchanged, not rewritten, so any real regression there still fails on its own.
- **Disabled-story path accidentally gaining a `display` style:** `showTooltip()` short-circuits (`if (binding.disabled || !binding.value) return;`) before the panel object literal is constructed, so the disabled path is structurally unaffected — but Task 1 must add the property inside the existing object literal, not hoist any logic above the early return. The existing Disabled-story e2e test (unchanged, still asserting zero tooltip nodes) is the guard.
- **Firefox/WebKit-specific `display: inline-block` computed-value quirks:** some engines report `getComputedStyle().display` slightly differently for edge cases; the Spec's acceptance criterion is `not.toBe("none")`, not an exact match to `"inline-block"`, specifically to stay robust across engines — Task 2's assertion follows this exact wording.

---

### Task 1: Add the inline `display` style and verify existing unit coverage

**Files:**

- Modify: `packages/vue/src/tooltip/tooltip.ts:70-79` (the `createElement("div", { ... style: {...} ... })` call inside `showTooltip()`)
- Test: `packages/vue/src/tooltip/tooltip.spec.ts` (existing suite, run only — no new test added; jsdom cannot observe real `display`, per Spec §4)

**Interfaces:**

- Consumes: nothing new. Uses the existing `style` object literal already present in `showTooltip()`.
- Produces: the panel element now carries `style="position: absolute; display: inline-block; width: fit-content"` (or without `width` when `fitContent === false`) instead of lacking `display` entirely. No function signature, export, or type changes — `TooltipBindingValue` and `tooltipDirective`'s public shape are unchanged.

- [ ] **Step 1: Confirm current behavior via the existing unit suite (baseline read)**

Run: `cd packages/vue && npx vitest run src/tooltip/tooltip.spec.ts`
Expected: all existing tests PASS (this suite runs under jsdom and does not assert `display`, so it must be green both before and after Step 3 — this run is a baseline, not a red/green TDD step, since jsdom cannot observe the defect this fix addresses).

- [ ] **Step 2: Make the one-line change**

In `packages/vue/src/tooltip/tooltip.ts`, inside `showTooltip()`, change:

```typescript
  const panel = createElement(
    "div",
    {
      id: state.panelId,
      role: "tooltip",
      class: ["u-tooltip", binding.class],
      style: { position: "absolute", width: binding.fitContent === false ? undefined : "fit-content" },
    },
    text
  );
```

to:

```typescript
  const panel = createElement(
    "div",
    {
      id: state.panelId,
      role: "tooltip",
      class: ["u-tooltip", binding.class],
      style: {
        position: "absolute",
        display: "inline-block",
        width: binding.fitContent === false ? undefined : "fit-content",
      },
    },
    text
  );
```

No other line in the file changes.

- [ ] **Step 3: Re-run the existing unit suite to confirm no regression**

Run: `cd packages/vue && npx vitest run src/tooltip/tooltip.spec.ts`
Expected: identical PASS result to Step 1 — same test count, same outcomes. jsdom does not assert `display`, so this run proves the change didn't break anything jsdom *can* see (role, text/escape semantics, `aria-describedby`, disabled short-circuit), not that visibility itself is fixed (that's Task 2's job, in a real browser).

- [ ] **Step 4: Vue package typecheck**

Run: `cd packages/vue && npx vue-tsc --noEmit`
Expected: no new errors. `display: "inline-block"` is a valid `CSSProperties`/style-object value already compatible with the existing `style` object's typing (the object already carries `position`/`width` string values the same way).

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/tooltip/tooltip.ts
git commit -m "fix(vue): add missing inline display style to make v-tooltip panel visible (GAP-039)"
```

---

### Task 2: Convert the Playwright regression from known-failure to passing assertion, and regenerate stale visual baselines

**Files:**

- Modify: `packages/vue/e2e/tooltip.spec.ts` (comment block at lines 4-47, and the visibility assertions at lines 78-84 of the "Default story" test)
- Regenerate (binary, not hand-edited): `packages/vue/e2e/tooltip.spec.ts-snapshots/Vue-Tooltip-Default-story-visual-regression-1-vue-chromium.png`, `...-vue-firefox.png`, `...-vue-webkit.png`

**Interfaces:**

- Consumes: Task 1's shipped `display: "inline-block"` behavior — this task's assertions only pass because Task 1 is already committed.
- Produces: nothing consumed by later tasks (this is the final implementation task).

- [ ] **Step 1: Update the assertions in the Default-story test**

In `packages/vue/e2e/tooltip.spec.ts`, inside the `"Default story: real hover creates the tooltip node..."` test, change:

```typescript
    // Real, verified gap: despite the correct position, the base
    // `.u-tooltip { display: none }` rule is never overridden anywhere in
    // this codebase, so the panel stays genuinely invisible in a real
    // browser.
    await expect(tooltip).toBeHidden();
    const display = await tooltip.evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("none");
```

to:

```typescript
    // Verified fix (GAP-039): showTooltip() now sets an inline
    // `display: inline-block` style on the panel, mirroring real
    // PrimeVue's own create() mechanism, so the panel is genuinely
    // visible in a real browser despite the base `.u-tooltip { display:
    // none }` CSS rule (an inline style outranks a class-based rule by
    // specificity). Asserting `not.toBe("none")` rather than an exact
    // value keeps this robust across Chromium/Firefox/WebKit computed-
    // style reporting differences.
    await expect(tooltip).toBeVisible();
    const display = await tooltip.evaluate((el) => getComputedStyle(el).display);
    expect(display).not.toBe("none");
```

Also rename the test's own title, since it no longer documents an unfixed gap. Change:

```typescript
  test("Default story: real hover creates the tooltip node with the right role/text/aria-describedby wiring and a correctly-computed position, though it is never actually displayed", async ({
    page,
  }) => {
```

to:

```typescript
  test("Default story: real hover creates a visible tooltip node with the right role/text/aria-describedby wiring and a correctly-computed position", async ({
    page,
  }) => {
```

- [ ] **Step 2: Rewrite the file's top-level comment block to describe fixed behavior**

Replace the entire comment block at lines 4-47 (from `/**` through the closing `*/` before `test.describe("Vue/Tooltip"...`) with:

```typescript
/**
 * Real-browser coverage for v-tooltip (Vue/Tooltip), Task 8 (original),
 * updated for the GAP-039 visibility fix.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/tooltip/tooltip.spec.ts):
 * no tooltip before hover, a role="tooltip" panel with the bound content
 * appearing on a synthetic mouseenter, textContent-only (never innerHTML)
 * rendering by default with an explicit escape:false opt-in, aria-
 * describedby wiring on show (additive to any pre-existing value) and
 * owned-id-only removal on hide. jsdom's `getBoundingClientRect`/computed
 * `display` is always zeroed/inert, so none of that Vitest coverage can
 * assert real computed layout/visibility.
 *
 * GAP-039 FIX (verified here, in a real browser): `showTooltip()`
 * (packages/vue/src/tooltip/tooltip.ts) now sets an inline `display:
 * inline-block` style on the panel when it is created, mirroring real
 * PrimeVue's own Tooltip.js `create()` mechanism (an inline style outranks
 * the shared `@ultimate/uix-styles/tooltip` base `.u-tooltip { display:
 * none }` CSS rule by specificity). The panel is now genuinely visible on
 * real hover, in addition to already having the correct `role="tooltip"`,
 * text content, aria-describedby wiring, and a correctly-computed on-
 * screen position from the target's real getBoundingClientRect() (unlike
 * React's Tooltip, whose real, verified finding in Task 7 is a
 * permanently-hardcoded off-screen position — Vue's positioning math was
 * always correct; only visibility was broken).
 *
 * This file proves the fixed, visible behavior directly, and confirms
 * `disabled` genuinely never even creates the node on hover (distinct from
 * the enabled case's node-exists-and-is-visible state).
 *
 * Vue's own stories (tooltip.stories.ts) expose only Default/Disabled —
 * there is no separate position-variant story, so this file has no
 * left-position test.
 */
```

- [ ] **Step 3: Run the Vue Tooltip Playwright spec across all three engines to confirm the text-assertion changes pass, before touching any baseline**

Run (from repository root): `npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit -g "Vue/Tooltip"`
Expected: the "Default story: real hover creates a visible tooltip node..." test PASSES on all three engines (visibility assertions now correct). The two "visual regression" tests (Default and Disabled story) are expected to FAIL at this point for the Default-story one only, with a screenshot-mismatch error — this is the anticipated, correct result of the fix itself (the tooltip is now visibly rendered in the screenshot, where the committed baseline shows it absent), not a bug. The Disabled-story visual-regression test must still PASS (that story's screenshot is unaffected by this fix, since disabled hover never creates a panel at all). All other tests (accessibility scans, Disabled-story node-count test) must PASS unchanged.

If the Default-story visual-regression test does *not* fail here, stop and investigate before Step 4 — it would mean the fix did not actually change what's rendered, contradicting Task 1's intent.

- [ ] **Step 4: Regenerate only the Default-story visual-regression baseline for all three engines**

Run (from repository root): `npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit -g "Default story: visual regression" --update-snapshots`
Expected: the three files under `packages/vue/e2e/tooltip.spec.ts-snapshots/` named `Vue-Tooltip-Default-story-visual-regression-1-vue-{chromium,firefox,webkit}.png` are rewritten (git will show them as modified binary files). The command's own output reports the snapshots as updated/passing.

Do **not** pass `-g` broadly enough to also touch the Disabled-story visual baseline — that baseline is correct and must stay byte-identical. Confirm via `git status --porcelain packages/vue/e2e/tooltip.spec.ts-snapshots/` that only the three `Default-story` PNGs show as modified, and no `Disabled-story` PNG appears in the diff.

- [ ] **Step 5: Full re-run to confirm everything is green together**

Run (from repository root): `npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit -g "Vue/Tooltip"`
Expected: all tests in `packages/vue/e2e/tooltip.spec.ts` PASS on all three engines — including both visual-regression tests, now against the regenerated Default-story baseline and the untouched Disabled-story baseline.

- [ ] **Step 6: Commit**

```bash
git add packages/vue/e2e/tooltip.spec.ts packages/vue/e2e/tooltip.spec.ts-snapshots/Vue-Tooltip-Default-story-visual-regression-1-vue-chromium.png packages/vue/e2e/tooltip.spec.ts-snapshots/Vue-Tooltip-Default-story-visual-regression-1-vue-firefox.png packages/vue/e2e/tooltip.spec.ts-snapshots/Vue-Tooltip-Default-story-visual-regression-1-vue-webkit.png
git commit -m "test(vue): convert tooltip e2e visibility assertions to green, regenerate visual baseline (GAP-039)"
```

Verify `git status --porcelain` shows no other file changed before committing — if anything outside this task's listed files appears, stop and investigate before committing.

---

## Final Verification (whole-branch, before Final Review)

Run in order, from repo root:

1. `cd packages/vue && npx vue-tsc --noEmit` — Expected: no errors.
2. `cd packages/vue && npx vitest run` — Expected: full Vue unit suite green, no regressions outside Tooltip.
3. `cd packages/vue && npm run build` — Expected: build succeeds (confirms no type/export regression reaches the package's public build output).
4. From repository root: `npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit -g "Vue/Tooltip"` — Expected: all green (repeat of Task 2 Step 5, as a final confirmation after both commits).
5. `pnpm run ceiling:validate` — Expected: passes unchanged (no dependency touched by this fix; run to confirm no incidental drift).
6. `pnpm run agents-md-pointers:validate` — Expected: passes unchanged (no AGENTS.md/doc-pointer file touched by implementation).
7. `git diff --stat main` (on the feature branch) — Expected: exactly the files named in Global Constraints appear (`packages/vue/src/tooltip/tooltip.ts`, `packages/vue/e2e/tooltip.spec.ts`, and the three regenerated Default-story PNGs). Any other file appearing is a scope violation — stop and investigate.

Do not run the full monorepo-wide `pnpm test`/`pnpm build` or the full 9-project Playwright matrix as a Plan requirement — this fix is Vue-Tooltip-scoped and the Spec's acceptance criteria are satisfied by the Vue-scoped commands above; the whole-branch code review (below) is what catches any unexpected cross-package effect, and none is anticipated given the file boundary.

## Final Review

After both tasks are complete and Final Verification passes, dispatch the final whole-branch code review per superpowers:executing-plans' Final Review process, on the most capable available model, providing: the review package (`BASE` = branch fork point from `main`, `HEAD` = current), this Plan's path, the Spec's path, and this Plan's Review Focus section verbatim.

After the final review is clean (or its fix pass is committed), proceed to superpowers:finishing-a-development-branch. Do not start the GAP-039 registry prose correction (`docs/architecture/BLUEPRINT_GAPS.md`) as part of this plan's Final Review fix pass — it is explicitly a separate closeout-documentation follow-up per the Spec and the Global Constraints above, not a finding to fix inside this implementation branch.
