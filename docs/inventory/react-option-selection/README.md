# React option selection — issue #117

Implements live [#117](https://github.com/majedsiefalnasr/ultimate-packages/issues/117)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `7845cf0f945bc5526061884f531fa9a01ba4757d`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of five families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/react-option-selection.json`, not generated details. The existing
pilot pipeline is reused unchanged. Families: autocomplete, select, multi-select,
cascade-select and listbox. Each record owns its component, props and event types, local
style module and index barrel. Specs and stories (ten files) are explicit
supporting-file exclusions; every other scoped file has an owner. No separately exported
hooks, base factories, forwardRef wrappers, portals or virtualization exist in these
roots; each component calls `useComponentBase` from `@ultimate/react-core`.

Root and secondary entries resolve to the same records; #106 family identities are
aliases (`package.ultimate.react.<family>`), never same-ticket pending entries. Pending
identities owned elsewhere: `react-core` base and styling (#149) and theme presets
(#151). Links are recorded only where source supports them. The Aura registry
(`packages/themes/src/presets/aura/index.ts`) has keys `autocomplete`, `select` and
`listbox`; the componentNames `multi-select` and `cascade-select` differ from the
registry keys `multiselect` and `cascadeselect`. No component-metadata record exists for
any of the five families, so no metadata relationship is recorded. No scoped component
imports icons, tooltip or the scroller, so none of those is linked.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-option-selection.json --out docs/inventory/react-option-selection
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/react-option-selection.test.mjs
pnpm exec prettier --check scripts/inventory/react-option-selection.json scripts/inventory/react-option-selection.test.mjs docs/inventory/react-option-selection
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through
a temporary symlink (not committed) because the worktree has no `node_modules`.

## Product check: not run

The bounded product check

```sh
pnpm --filter @ultimate/react exec vitest run src/autocomplete/ src/select/ src/multi-select/ src/cascade-select/ src/listbox/
```

was **not run**: the task forbade vitest, builds, Storybook and installs to limit local
load. No product assertions, rendering or accessibility tests were executed, so nothing is
claimed about runtime behavior; every observation below was read from source. Spec files
present are not pass evidence. CI enforcement is recorded as workflow configuration only
(`.github/workflows/ci.yml` root `pnpm run test`); no CI run was observed. No parity or
gap judgment is made.

## Source observations (recorded, not repaired)

Each item is recorded in the named record's surface, read from source and checked against
every emit or usage site of all five components:

- select, multi-select and listbox share a `moveFocus` do/while that stops early only when
  the next index equals the previous one, so it has a non-terminating edge when
  `focusedIndex` is -1 and every visible option is disabled (from -1, ArrowUp lands on
  length-2). autocomplete and cascade-select have no such loop. Not executed.
- No component is a forwardRef; none uses a portal, document listener, `aria-controls`,
  `useImperativeHandle` or virtualization. Overlays are absolutely positioned divs.
- autocomplete: the debounce timer is cleared only at the next input; ArrowDown on an empty
  suggestions list followed by Enter emits `onChange(undefined)`; a new `optionLabel`
  function identity re-sets the text; `u-autocomplete-disabled` and `u-autocomplete-filled`
  have no CSS rule; `aria-controls` and `aria-haspopup` are absent. Whether a mouse option
  click fires after the blur-hide was not executed.
- select, multi-select, cascade-select and listbox: option click does not check the
  `disabled` prop (only `optionDisabled` blocks); in the three overlay components
  (select, multi-select and cascade-select) an open overlay stays open when `disabled`
  becomes true and there is no outside-click or blur handler. autocomplete's option click
  also does not read `disabled`. listbox's filter input stays enabled while disabled.
- multi-select: no `inputId`, `aria-label` prop or `onSelect`; the "Select All" label is
  hard-coded and `toggleAll` and clear never call `onSelectionChange`.
- cascade-select: opening a nested group removes its own parent key from the active path;
  no in-tree keyboard navigation or Tab handling; `focused` is never passed, so
  `u-cascade-select-option-content-focused` is never emitted.
- listbox: single mode never emits null and re-emits on re-click; `aria-multiselectable`
  renders `false` in single mode; no `aria-activedescendant`.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies, English
artifacts, scoped staging. Spec: props, state, overlay composition, accessibility, style
modules and manifest subpaths were read from source and each conditional claim was checked
against every emit or usage site and every sibling component (the loop and absent-pattern
claims are asserted by the test across all five); byte-exact generation and preserved
authorship are tested. Owner review remains outstanding.
