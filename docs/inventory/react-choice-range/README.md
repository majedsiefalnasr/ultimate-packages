# React choice and range — issue #114

Implements live [#114](https://github.com/majedsiefalnasr/ultimate-packages/issues/114)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `8d8d52094058993d3ca29823d1c2cd922805570e`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of ten families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/react-choice-range.json`, not generated details. The existing
pilot pipeline is reused unchanged. Families: checkbox, radio-button, toggle-button,
input-switch, select-button, multi-state-checkbox, tri-state-checkbox, rating, slider
and knob. Each record owns its component, props and event types, local style module
and index barrel. Specs and stories (twenty files) and the generated
`checkbox.api.mdx` are explicit supporting-file exclusions; every other scoped file
has an owner. No separately exported hooks or base factories exist in these roots.

Root and secondary entries resolve to the same records; #106 family identities
are aliases, never same-ticket pending entries. Pending identities owned elsewhere:
`react.tooltip` (#123), `react-core` base, styling and icons (#149), theme presets
(#151) and component-metadata records (#153). Links are recorded only where source
supports them: the Aura registry has no inputswitch, multistatecheckbox or
tristatecheckbox key, so those three records do not link presets; the
radio-button, select-button and toggle-button componentNames differ from the
registry keys radiobutton, selectbutton and togglebutton. Only checkbox has a
metadata record (`CHECKBOX_METADATA`). select-button links to toggle-button and
checkbox links to the pending tooltip identity because source imports them.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-choice-range.json --out docs/inventory/react-choice-range
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/react-choice-range.test.mjs
pnpm exec prettier --check scripts/inventory/react-choice-range.json scripts/inventory/react-choice-range.test.mjs docs/inventory/react-choice-range
```

## Executed product evidence

**Not run.** The bounded product check

```sh
pnpm --filter @ultimate/react exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/input-switch/ src/select-button/ src/multi-state-checkbox/ src/tri-state-checkbox/ src/rating/ src/slider/ src/knob/
```

was not executed: the task forbade vitest, builds, Storybook and installs to limit
local load, and the worktree has no `node_modules` of its own. Only the inventory Node
tests ran. No browser rendering, build, publication or accessibility testing was done.

`.github/workflows/ci.yml` has a conditional root `pnpm run test` step when scope
is not docs; this is configuration evidence only, not observed CI execution.
The root `test:scripts` glob does not include inventory tests.

## Source observations (recorded, not repaired)

- checkbox, radio-button and input-switch merge `inputRef` but write an
  `internalInputRef` that is never read; no scoped component is a forwardRef.
- checkbox does not pass `value` to the DOM input; radio-button emits
  `checked: !checked` and renders no value attribute.
- input-switch has no `readOnly` prop; toggle-button calls preventDefault for
  Space but not Enter.
- select-button hard-codes `fluid: false` and never passes `invalid`, so the
  invalid and fluid classes defined for `SelectButtonClassesParams` are never emitted.
- multi-state-checkbox used to have a plain-string `classes.root` and an unused
  `icon` key. Its root now resolves the disabled, invalid and filled classes and
  its `icon` key wraps the option icon (#208). tri-state-checkbox used to have an
  unused `icon` key too; it is now applied to the default icons (#209).
- tri-state-checkbox keeps an aria-hidden native input beside a sibling
  `role="checkbox"` box. The input ignores pointer events and cycles the value
  when a label activates it, then hands focus to the box (#209).
- rating ships `data-testid` attributes in markup, every star is tabbable, and
  arrow keys change the value; clicking the active star clears it.
- slider and knob remove document listeners only on mouseup (no unmount cleanup),
  have no aria-label, and have no touch handling; slider drag callbacks capture
  the render-time value and slider `toPercent` evaluates 0 / 0 (NaN) when max equals min and the value equals min.
- knob `onChange` receives a bare number, PageUp and PageDown change by a fixed
  10, the root class ignores disabled and readOnly, and no change-event type is exported.

## Local review

Standards and Spec reviews were done directly, without spawning. Standards: existing
inventory schema reused, no pipeline or product changes, English artifacts, scoped
staging. Spec: props, refs and handlers were read from source; every discovered
file is owned or excluded and each public export is accounted for; generated views
are byte-exact and tested. Owner review remains outstanding.
