# Angular choice and range inputs — issue #113

Implements live [#113](https://github.com/majedsiefalnasr/ultimate-packages/issues/113)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `d2e8101bf77e8e440c7166211ad5eae0e0ac6df8`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/angular-choice-range.json`, not generated details. The existing
pilot pipeline and family-alias resolution are reused unchanged. Scope: checkbox,
radio-button, toggle-button, toggle-switch, select-button, rating, slider and knob under
`packages/ng/src`. Each family owns its index, component and style module. `spec.ts` and
`stories.ts` files, plus `checkbox.api.mdx`, are explicit supporting-file exclusions;
every scoped file has an owner or exclusion. `select-button` has no
`@ultimate/ng/select-button` manifest subpath (root entry only); the other seven do.
`USelectButton` composes `UToggleButton`, recorded as a relationship to the
`package.ultimate.ng.toggle-button` alias.

Family aliases (`package.ultimate.ng.<family>`) resolve to the eight records; none are
same-ticket pending. Identities owned by other tickets (ng-core base classes, themes
presets, uix-styles checkbox, component-metadata records) stay explicitly pending with
their owning ticket in validation; relationships here do not complete those tickets.
Theme links to the Aura registry keys were checked against
`packages/themes/src/presets/aura/index.ts`. Only checkbox has a component-metadata
record; the other seven records state that none exists.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-choice-range.json --out docs/inventory/angular-choice-range
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/angular-choice-range.test.mjs
pnpm exec prettier --check scripts/inventory/angular-choice-range.json scripts/inventory/angular-choice-range.test.mjs docs/inventory/angular-choice-range
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through
a temporary symlink (not committed) because the worktree has no `node_modules`.

## Product check: unavailable / not run

The bounded Angular suite (`pnpm --filter @ultimate/ng exec ng test ...`, see each
record's claim) was **not run**: the task limited local load (no `ng test`, build or
Storybook) and the worktree has no installed dependencies. No product assertions were
executed, so nothing is claimed about runtime behavior. Spec files present are not pass
evidence. CI enforcement is recorded as workflow configuration only; no CI run was
observed. No parity or gap judgment is made.

## Source observations (recorded, not repaired)

Facts are recorded in each record's surface and were read from source, not repaired:
checkbox declares `binary` but nothing reads it; `USelectButton` returns constant
`invalid: false, fluid: false` class parameters and emits a synthetic `Event`; the
`URating` `name` doc mentions a generated id but none is generated; the radio-button,
toggle-button and toggle-switch CSS contain `p-invalid` selectors that are not emitted,
and radio-button also `p-variant-filled`; `UKnob` emits no `p-disabled` class; `USlider`
and `UKnob` expose `role=slider` without an aria-label and neither has `ngOnDestroy`;
slider and knob export no ClassesParams interface.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies,
English artifacts, scoped staging. Spec: inputs, outputs, base tiers, accessor wiring,
composition, style helpers and manifest subpaths were read from source; byte-exact
generation and preserved authorship are tested. Owner review remains outstanding.
