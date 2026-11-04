# Angular option selection — issue #116

Implements live [#116](https://github.com/majedsiefalnasr/ultimate-packages/issues/116)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `f8fc98fc26ad56886dfe9af8714fb6b6f66e78a7`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/angular-option-selection.json`, not generated details. The existing
pilot pipeline and family-alias resolution are reused unchanged. Scope: autocomplete,
select, multi-select, cascade-select and listbox under `packages/ng/src`. Each family owns
its index, component and style module. `spec.ts` and `stories.ts` files are explicit
supporting-file exclusions; every scoped file has an owner or exclusion. All five families
have an `@ultimate/ng/<family>` manifest subpath and a root barrel re-export.

Family aliases (`package.ultimate.ng.<family>`) resolve to the five records; none are
same-ticket pending. `package-coverage.json` already reserved these aliases for #116 and is
unchanged. Identities owned by other tickets (ng-core base classes and overlay, themes
presets) stay explicitly pending with their owning ticket in validation; relationships here
do not complete those tickets. The Aura registry keys were checked against
`packages/themes/src/presets/aura/index.ts`; `multiselect` and `cascadeselect` differ from
the folder and selector names. No component-metadata record exists for any of the five
families, and no `@ultimate/uix-styles` export exists for them, so neither relationship is
linked.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-option-selection.json --out docs/inventory/angular-option-selection
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/angular-option-selection.test.mjs
pnpm exec prettier --check scripts/inventory/angular-option-selection.json scripts/inventory/angular-option-selection.test.mjs docs/inventory/angular-option-selection
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

Each item is recorded in the named record's surface, read from source and not repaired:
autocomplete emits a synthetic `Event` from `onFocus` and `onBlur`, never emits
`p-invalid` or `u-autocomplete-option-selected`, and does not clear its pending search
timer outside the next input; select never passes `focused` or `invalid` to its root
classes and has an unused `optionGroup` class; multi-select option classes are not the
ones its CSS targets and `toggleAll` emits a synthetic `change` event; cascade-select
never emits its fluid or focused classes and its `onOptionMouseEnter` is a no-op;
listbox option classes are not the ones its CSS targets and `invalid` is the constant
`false`. select, multi-select and listbox `moveFocus` have an index `-1` edge case
described in those records; it was read from source, not executed. The full wording and conditions are
in the records.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies,
English artifacts, scoped staging. Spec: inputs, outputs, base tiers, accessor wiring,
overlay composition, style helpers and manifest subpaths were read from source and
conditional behaviour was checked against each emit or usage site; byte-exact generation
and preserved authorship are tested. Owner review remains outstanding.
