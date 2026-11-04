# Vue option selection — issue #118

Implements live [#118](https://github.com/majedsiefalnasr/ultimate-packages/issues/118)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `ba145d8cfc110bae18e4787a1242d51e38da9cd1`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of five families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/vue-option-selection.json`, not generated details. The existing
pilot pipeline is reused unchanged. Families: autocomplete, cascade-select, listbox,
multi-select and select. Each record owns its SFC component (cascade-select also owns
the internal `CascadeSelectSublist.vue`), its `createBase*` factory (a public export)
and its local style module. Specs and stories are explicit supporting-file exclusions;
every other scoped file has an owner.

Root and secondary entries resolve to the same records; #118 family identities are
aliases, never same-ticket pending entries. Foundation (`vue-core` base and styling,
plus overlay for the four families that compose `UPortal`; #150) and theme presets
(#151) remain explicitly pending. No `component-metadata` record exists for these
families, so none is linked. Aura registry keys exist for all five families; two
differ from the component names: `multiselect` (multi-select) and `cascadeselect`
(cascade-select), which are also the registered style names.

Source facts recorded without repair include: select, multi-select and listbox each
have a `moveFocus` do/while that does not terminate when the focused index is -1 and
every visible option is disabled; autocomplete, cascade-select and select declare `change`
and never emit it, while multi-select and listbox emit it; listbox is the
only family without `UPortal`, built on `createBaseEditableHolder` rather than
`createBaseInput`; only autocomplete and select bind `aria-activedescendant`, and no
family binds `aria-controls`; autocomplete's debounce timer is not cleared by hide or
blur, its overlay class is unused, and Enter on an empty suggestion list writes
`undefined`; cascade-select applies no fluid class, keys its items by `node.key`
(the others key by index), renders `role="tree"` at every depth, and its group click
logic prevents groups two or more levels deep from expanding visibly; the option
click handlers of all five families never read the component `disabled` prop.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-option-selection.json --out docs/inventory/vue-option-selection
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/vue-option-selection.test.mjs
pnpm exec prettier --check scripts/inventory/vue-option-selection.json scripts/inventory/vue-option-selection.test.mjs docs/inventory/vue-option-selection
```

## Executed product evidence

**Not run.** The bounded product check

```sh
pnpm --filter @ultimate/vue exec vitest run src/autocomplete/ src/cascade-select/ src/listbox/ src/multi-select/ src/select/
```

was not executed: the task forbade vitest, builds, Storybook and installs to limit
local load. Only the inventory Node tests ran. No browser rendering, build,
publication or accessibility testing was done.

`.github/workflows/ci.yml` has a conditional root `pnpm run test` step when scope
is not docs; this is configuration evidence only, not observed CI execution.
The root `test:scripts` glob does not include inventory tests.

## Local review

Standards and Spec reviews were done directly, without spawning. Standards: existing
inventory schema reused, no pipeline or product changes, English artifacts, scoped
staging. Spec: props, emits and handlers were read from source and each recorded fact
was checked against the sibling components for the same pattern; every discovered
file is owned or excluded and each public export is accounted for; generated views
are byte-exact and tested. Owner review remains outstanding.
