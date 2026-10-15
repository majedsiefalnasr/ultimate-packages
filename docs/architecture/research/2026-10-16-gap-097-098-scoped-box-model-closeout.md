# GAP-097/GAP-098 closeout — Ultimate-scoped border-box base layer

**Date:** 2026-10-16

**Authority:** Human-authorized GAP-097/GAP-098 closeout under [AGENTS.md §3](../../../AGENTS.md#3-workflow-and-approval-gates). [PR #23](https://github.com/majedsiefalnasr/ultimate-packages/pull/23) implemented [ADR-063](../DECISIONS.md#adr-063--ultimate-scoped-border-box-base-layer-registered-per-component-through-each-framework-core-gap-098) Option B under the approved [Spec](../../superpowers/specs/2026-10-15-gap-098-scoped-box-model-design.md) (revision 4, Amendments A1 and A2) and [Plan](../../superpowers/plans/2026-10-15-gap-098-scoped-box-model.md) (revision 3). The owner reviewed and accepted all 175 regenerated Angular and Vue screenshot baselines (2026-10-15, in the authorizing session) before merge; this record is the durable written trace of that acceptance. PR #23 merged head `d248446c984b5139a1be76ecd0f5c4f57adb0ef6` into `main` as merge commit `46ec6d936ed4e784190e091e57b4f0ddae348bc4` (parents `c9089b6b` and `d248446c`). Verified current `main` is `46ec6d93`.

## Result

- **GAP-098 is resolved.**
  - Each component registers one `box-sizing: border-box` rule scoped to its own scope roots: the keys `root`, `overlay`, `panel`, `mask` and `list`, and keys ending in `Root`, `Overlay` or `Mask`.
  - The rule's form is `:where(.u-root, .u-root *)` plus `::before`/`::after`. `:where()` gives it zero specificity.
  - It is registered through the existing stylesheet registration in `ng-core`, `vue-core` and `react-core`, immediately before the component CSS.
  - No page-wide selector is added, so the 2026-10-08 ruling against importing Prime's global `*, ::before, ::after` rule is kept.
- **GAP-097 is resolved** through that shared layer, not a Drawer-specific change.
  - The Drawer content and the full Drawer now fit their boxes. The full Drawer measured 722 px tall in a 720 px viewport before the change; the regenerated `Drawer-Full` baseline is 720 px.
  - The G3-D verification step passes without any change to `packages/{ng,vue}/e2e/g3d-aura-styles.spec.ts`. The merge does not touch either file.
- **Angular and Vue G3-D are unblocked on `main`.**

## Verification

### G3-D

[Pre-merge main CI 38772859680](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38772859680) at `c9089b6b`:

- "Run G3-D verification specs" failed for Angular and Vue.
- Each framework had 3 failed and 159 passed. The failing test was `Drawer full and RTL G3-D layout` in Chromium, Firefox and WebKit.

[Post-merge main CI 38805415026](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38805415026) at `46ec6d93`:

- Both steps passed with 162 passed each.
- The G3-D differential accessibility validation passed in both runs.
- Across all jobs, the only step whose conclusion changed is "Run G3-D verification specs" for Angular and Vue, from failure to success. Each browser job's "Post Setup Node.js" step also moved from skipped to success: `actions/setup-node` runs its post step only when the job succeeds, so it was skipped while the G3-D step failed.

### Other browser steps

In the post-merge run:

- G3-A, G3-B, G3-C1, G3-C2 and G3-E keep their pre-merge test counts.
- The strict Angular and Vue runs grow from 369 to 435 and from 321 to 396 tests. The difference is the new box-model probes (`packages/{ng,vue}/e2e/box-model.spec.ts`: 22 and 25 tests × 3 engines), and all of them pass. React's probes (`packages/react/e2e/box-model.spec.ts`) run in the React job, which also succeeds.
- The React browser job and all three SSR jobs succeed in both runs.

### Pre-merge verification

This was run locally in the CI Playwright image (`v1.63.0-jammy`, arm64) and is recorded in PR #23's description. PR #23's own CI run, [38797111723](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38797111723) at `d248446c`, failed only Provenance validation.

- The probes passed 3× with `--retries=0` in every engine and framework.
- All 15 accessibility validators reported no introduced or stale rows.
- SSR passed: Angular 10, React 9, Vue 9.
- After baseline regeneration, strict and G3-A…G3-D for Angular and Vue passed 3× with `--retries=0`.
- React had no changed baselines.

### Remaining failures

These are independent of GAP-097/GAP-098 and are unchanged by this merge.

- **CI.** The `ci` job's only failing step is **Provenance validation**, with the same 696 manifest problems in both runs: production files without evidence-backed provenance entries. This is [GAP-094](../BLUEPRINT_GAPS.md#gap-094--provenancevalidate-fails-on-a-missing-manifest-entry), and its backfill batches have not started.
- **Release.** [Release run 38805415081](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38805415081) at `46ec6d93` fails in **Select mode**, the same failing step and error as pre-merge [Release 38772859834](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38772859834): "This version of the Changesets action is designed to work with Changesets CLI v3. Changesets CLI v2 is not supported". This is the separate Changesets action/CLI mismatch noted under [GAP-087](../BLUEPRINT_GAPS.md#gap-087--release-workflow-runs-on-node-20-below-the-angular-21-toolchains-node-requirement) (itself resolved for the Node toolchain) and C12; it is not registered as its own gap. Version and Publish are skipped in both runs.

## Limits and follow-ups

These follow-ups were noted during implementation. Each is unregistered and needs its own authorization:

- The Vue AutoComplete list is teleported without an overlay wrapper; Amendment A2's `list` key covers it.
- `inheritAttrs` on ScrollTop, Card and BlockUI.
- Restoring the `u-component` marker.
- The Angular and React Card CDN references.

Probe coverage that does not run, as disclosed in the Spec:

- The TieredMenu popup in Angular and React, because the story has no trigger.
- The Menu popup in Vue and React, because those frameworks ship only a Default story.

Rendered pixel parity against the Prime reference harness was not re-measured at this closeout. Other Drawer differences remain open under GAP-099 and GAP-100.
