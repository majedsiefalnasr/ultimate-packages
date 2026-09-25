# GAP-039 — Vue Tooltip Visibility Fix

**Status:** Draft for Spec Review
**Date:** 2026-09-25
**Scope:** Vue only (`packages/vue/src/tooltip/`). No other framework, package, or component is touched.

## 1. Problem

`packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` builds the tooltip panel correctly — right `role="tooltip"`, right text content (safe `textContent` by default, opt-in `innerHTML`), right `aria-describedby` wiring, and a correctly computed on-screen `left`/`top` position from the target's real `getBoundingClientRect()`. But the panel is never actually visible in a real browser: it stays `display: none` on every hover.

### 1.1 Direct evidence

- `packages/uix-styles/src/tooltip/index.ts:4` — the shared CSS's base rule: `.u-tooltip { position: absolute; display: none; ... }`. No rule in that file, or anywhere else in the Vue tooltip source, ever overrides `display` back to visible.
- `packages/vue/src/tooltip/tooltip.ts:70-79` (`showTooltip()`) — the panel's class list is `["u-tooltip", binding.class]` and its inline `style` object is `{ position: "absolute", width: ... }`. No position-modifier class is ever added, and `display` is never set inline.
- `packages/vue/src/tooltip/tooltip-style.ts` — defines a `classes.root` resolver that computes `["u-tooltip", { [`u-tooltip-${params.position ?? "right"}`]: true }]`, but `showTooltip()` never calls it. This class, even if applied, only carries `padding` in the shared CSS (`.u-tooltip-right, .u-tooltip-left { padding: 0 ... }` etc.) — it does not set `display` either.
- `packages/vue/e2e/tooltip.spec.ts:78-84` — existing real-browser Playwright coverage already proves the failure: `await expect(tooltip).toBeHidden(); expect(display).toBe("none");`. The surrounding assertions in that same test (role, text, `aria-describedby`, computed left/top position) already pass — only visibility is broken.

### 1.2 Root cause

This is a missing runtime visibility transition, not a CSS defect and not a positioning/DOM-structure defect. `uix-styles/tooltip`'s CSS (including its `display: none` base rule) is a byte-for-byte faithful port of real PrimeVue's own base stylesheet (`@primeuix/styles` tooltip module, verified against `.vendor-cache/primevue-4.5.5.tar.gz`) — that part of the port is correct and must not change.

Real PrimeVue's actual visibility mechanism, verified by extracting and reading the pinned `Tooltip.js` source (`.vendor-cache/primevue-4.5.5.tar.gz`, `create()` function): the tooltip container is constructed with an **inline style** `style: { display: 'inline-block', ... }` set directly on the element. An inline style has higher CSS specificity than the class-based `display: none` rule, which is exactly what makes real PrimeVue's tooltip visible despite its own stylesheet containing the same base rule. A separate `fadeIn()` utility (`@primeuix/utils/dom`, also extracted and read) only animates `opacity` toward `1` — a purely cosmetic layer, not the visibility mechanism, and out of scope here.

Ultimate's Vue port (`tooltip.ts`) never carried over this inline-style line. That is the entire defect.

### 1.3 Evidence correction to the GAP-039 registry entry

`docs/architecture/BLUEPRINT_GAPS.md` GAP-039's "Expected state" and "Recommended resolution direction" text currently claims:

1. Angular's `UTooltip` "does apply this modifier correctly" (citing `packages/ng/src/tooltip/tooltip.ts:140`, `renderer.addClass(container, u-tooltip-${position})`), and
2. the fix should be to wire the Vue `classes.root` position-modifier class the same way Angular does.

**Both claims are factually wrong, verified directly against Angular's own real-browser test.** Angular's `tooltip.ts` does call `renderer.addClass` with the position class — but that class only ever carries `padding` in the shared CSS, never `display`. Angular imports the identical `uix-styles/tooltip` CSS and has the identical missing-inline-style defect. Angular's own Playwright spec (`packages/ng/e2e/tooltip.spec.ts:60-67`) directly asserts `computedDisplay === "none"` in a real browser and documents this as a known, disclosed gap for Angular too — proving the position-class approach GAP-039 recommends does **not** fix visibility, because Angular already does exactly that and is still broken.

This Spec's fix therefore does **not** follow GAP-039's "recommended resolution direction" as currently written (wire the position-modifier class). It instead follows the verified real-PrimeVue mechanism (an inline `display` style). The GAP-039 registry entry's "Expected state," "Recommended resolution direction," and the Angular claim within "Framework scope" will need a follow-up documentation correction after this fix ships — tracked as part of this Spec's closeout, not as new implementation scope. Angular's own parallel gap is a separately disclosed fact, not something this workstream fixes.

## 2. Intended behavior

When a Vue `v-tooltip`-bound element is hovered (or focused) and the tooltip panel is shown, the panel must be genuinely visible in a real browser: `getComputedStyle(panel).display` must not be `"none"`, and the panel's bounding box must be non-zero. All currently-correct behavior (role, text/escape semantics, `aria-describedby` wiring, computed position, disabled short-circuit, hide-on-leave) must be preserved unchanged.

## 3. Minimal implementation correction

Add `display: "inline-block"` to the existing inline `style` object already constructed in `showTooltip()` (`packages/vue/src/tooltip/tooltip.ts`, the `createElement("div", { ... style: { position: "absolute", width: ... } ... })` call), mirroring real PrimeVue's `create()` exactly. This is a same-file, same-function, one-property addition to an object literal that already exists — no new function, no new module, no CSS change, no change to the class list, no change to `tooltip-style.ts`.

`tooltip-style.ts`'s `classes.root` resolver is left exactly as-is (unused). It is not wired into `showTooltip()` by this fix: doing so would not fix visibility (per §1.3) and would be an unrequired, unverified behavior change outside the smallest-correction constraint. Removing the currently-unused resolver is also not part of this fix — it is Vue-specific, and it computes real per-position padding classes that are structurally reused by Angular for a legitimate purpose (padding), so it is plausible future-relevant infrastructure, not dead code this fix is responsible for pruning. No action on it either way is in scope.

## 4. Regression coverage

Convert `packages/vue/e2e/tooltip.spec.ts`'s existing known-failure assertions (lines 78-84 of the "Default story" test) from asserting the bug to asserting correct behavior:

- Replace `await expect(tooltip).toBeHidden();` with `await expect(tooltip).toBeVisible();`
- Replace `expect(display).toBe("none");` with `expect(display).not.toBe("none");`
- Update the surrounding comment block (lines 16-38 of the file, and the inline comment at lines 78-81) to describe the now-fixed, now-verified-visible behavior instead of documenting a known gap. Remove the "REAL-BROWSER FINDING (documented here, not fixed...)" framing entirely — it no longer applies.
- All other assertions in that test (role, text, `aria-describedby`, computed left/top position, the Disabled-story test, the accessibility-scan and visual-regression tests) are preserved unchanged — they already pass and are not part of this defect.

No new unit/component test is required: `packages/vue/src/tooltip/tooltip.spec.ts` runs under jsdom, which never computes real CSS `display`/layout (confirmed in Phase 1 investigation), so it cannot meaningfully assert this fix either way — real-browser Playwright coverage is the only mechanism capable of proving or disproving tooltip visibility, and it already exists and will be converted per above.

## 5. Non-goals

- Angular's parallel, separately-disclosed visibility gap (`packages/ng/src/tooltip/tooltip.ts`, `packages/ng/e2e/tooltip.spec.ts`) — out of scope, not modified.
- React's Tooltip (a different, already-disclosed off-screen-positioning mechanism, not affected by this defect) — out of scope, not modified.
- Any CSS change to `packages/uix-styles/src/tooltip/index.ts` — the shared stylesheet is a correct port and is not touched.
- Wiring, changing, or removing `tooltip-style.ts`'s `classes.root` position-modifier resolver.
- Any Tooltip feature-parity expansion (new options, new positioning modes, new animation/fade behavior, arrow rendering, etc.) beyond restoring visibility of the already-shipped component.
- Any architectural or public-API change — `TooltipBindingValue`, the directive's registration contract, and all existing consumer-facing behavior are unchanged.
- Any new shared package, utility, or foundation.
- Updating the GAP-039 registry entry's prose itself is not part of implementation scope — see §1.3; the correction is a documentation follow-up at closeout, using the same evidence already established here, not new investigation.

## 6. Acceptance criteria

1. `showTooltip()` sets `display: "inline-block"` as an inline style on the tooltip panel when it is created.
2. `packages/vue/src/tooltip/tooltip.spec.ts` (existing unit/component suite) continues to pass unchanged — no existing assertion regresses.
3. `packages/vue/e2e/tooltip.spec.ts`'s Default-story test asserts the tooltip panel `toBeVisible()` and `getComputedStyle(...).display` is not `"none"` on real hover, and passes in a real Playwright browser run.
4. All other existing Vue Tooltip e2e assertions (Disabled story, accessibility scan, visual regression) continue to pass.
5. No file outside `packages/vue/src/tooltip/tooltip.ts` and `packages/vue/e2e/tooltip.spec.ts` is modified by the implementation.
6. Vue package typecheck and build succeed with no new errors.
7. No architectural or public API change is introduced (confirmed by diff review: the change is a single object-literal property addition plus a test-assertion update).

## 7. Architectural/API-change determination

None required. This is a behavioral bug fix within a single existing function, using a mechanism (inline style) already present in that same function for other properties (`position`, `width`). No ADR, no DECISION-track entry, no new foundation.
