# GAP-098 (→ GAP-097) — Ultimate box-model base layer: evidence and decision options

**Date:** 2026-10-15
**Status:** DECIDED — the user approved Option B on 2026-10-15, recorded as ADR-063. The GAP-098 Specification fixes the scoping selector.
**Scope:** the inherited "Run G3-D verification specs" failures (Angular and Vue) traced to [GAP-097](../BLUEPRINT_GAPS.md#gap-097--drawer-sizing-under-content-box-content-overflow-and-a-full-drawer-taller-than-the-viewport) and its cause [GAP-098](../BLUEPRINT_GAPS.md#gap-098--primes-global-base-style-box-sizing-border-box-is-not-applied-in-ultimate). GAP-098 records "Architectural decision required: Yes, at remediation time: where and how the base layer is applied".

## 1. Verified failure

- [CI run 38730856573](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38730856573) at `bdc4dbcf`: `Ng/Drawer full and RTL G3-D layout` fails in ng-chromium, ng-firefox and ng-webkit, and `Vue/Drawer full and RTL G3-D layout` in all three Vue projects (159 passed / 3 failed per job). Every failure is `expect(|height − viewport|) ≤ 1`, received 2.
- The assertion (`packages/{ng,vue}/e2e/g3d-aura-styles.spec.ts:366`) encodes Prime's rendered result. The 2026-10-08 parity pilot measured PrimeNG and PrimeVue at 720 px and Ultimate at 722 px for the full Drawer, plus 324 × 726 vs 320 × 720 and content overflow in the other positions (pilot report §3.3 D1).
- Mechanism: `.u-drawer-full { height: 100vh !important }` with a 1 px border renders 722 px under `content-box`. Prime's base style begins with `*, ::before, ::after { box-sizing: border-box }`. Ultimate has a port (`packages/uix-styles/src/base/index.ts`, `@ultimate/uix-styles/base`), but nothing imports or registers it.
- Current local precedent: only scroll-panel and carousel (all three frameworks) and React select, multi-select and listbox set `box-sizing` themselves.
- Standing ruling (user, 2026-10-08): do **not** import Prime's global `*` rule as-is, because it would change application content outside Ultimate components. The test assertions stay unchanged (user decision recorded in GAP-097).

Fixing only the Drawer (option A below) turns this CI step green. Every other component whose upstream CSS assumes `border-box` keeps rendering differently from Prime, and per-component source-parity checks cannot detect that (GAP-098 "Why it matters").

## 2. Options

### Option A — Per-component `box-sizing` (Drawer now, others as found)

- Add `box-sizing: border-box` to the Drawer's ported style (root, parts and pseudo-elements) in ng and vue, the same way scroll-panel and carousel already do. Later components follow as rendered-parity checks (PARITY_PLAYBOOK) find them.
- **Pros:** smallest change; nothing else moves; no screenshot churn outside the Drawer; makes this G3-D step green.
- **Cons:** an Ultimate-authored divergence from the ported CSS in each component; GAP-098 stays open as a list of unknown size; parity holds component by component only.

### Option B — Ultimate-scoped base layer, registered once per framework core

- Register a base style through each core's existing `StyleSheet` registration (the GAP-074/GAP-078 shared-registration and SSR contracts), scoped to Ultimate component subtrees and inside the existing CSS layer at zero specificity. Sketch: `:where(<Ultimate root selector>), :where(<Ultimate root selector>) *, ::before, ::after { box-sizing: border-box }`.
- The Spec must choose the root marker: a shared root class or attribute added to every component root, or the list of component root classes generated from component metadata.
- **Pros:** one place; matches Prime's model for component subtrees; fixes GAP-097 and every not-yet-found case together; zero specificity and the layer let application CSS still win; leaves page content outside Ultimate components alone, which respects the 2026-10-08 ruling.
- **Cons:**
  - Application content projected into components (slots, `ng-content`) also becomes `border-box`, as it does under Prime.
  - A shared root marker touches every component root, a cross-framework API surface.
  - Screenshots can change across many components at once. The tranche baselines (G3-A…G3-E) need a reviewed regeneration.
  - Largest verification cost.

### Option C — Opt-in consumer base style

- Publish the scoped (or the Prime-identical) base rule as an explicit import, e.g. `@ultimate/uix-styles/base`. Consumers and Ultimate's Storybooks and test apps include it.
- **Pros:** no forced change for consumers; the CI step goes green because Storybook includes it.
- **Cons:** the default consumer rendering still differs from Prime; tests would verify a configuration consumers may not use; a documentation and support burden.

### Option D — Prime's global rule as-is

Excluded by the 2026-10-08 user ruling. Listed for completeness only.

## 3. Recommendation

**Option B**, with the root-marker choice and a baseline-regeneration plan decided in its Spec. It is the only option that closes GAP-098 rather than one effect of it, and it respects the ruling against page-wide rules.

If the screenshot churn and the cross-framework marker are too large for now, use **Option A for the Drawer only** as an interim fix. It turns the G3-D step green, and an ADR records that GAP-098 remains open with B as the target.

## 4. Next gate after the decision

1. ADR (Option B, or Option A as interim with B as target).
2. Specification: scope, marker or selector, layer placement, SSR/registration contract, the affected-baseline inventory, and the parity re-verification set from `tooling/prime-reference`.
3. Spec Review, then Plan and Plan Review, then implementation with reviewed baselines.

Related but independent: GAP-099 (Drawer close button, full-drawer border), which has no architectural decision and is not required for the G3-D step.
