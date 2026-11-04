# Vue choice and range — issue #115

Implements live [#115](https://github.com/majedsiefalnasr/ultimate-packages/issues/115)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `638b5a660b62be5b39a9402db09bccc2a9e9d2e4`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of eight families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/vue-choice-range.json`, not generated details. The existing
pilot pipeline is reused unchanged. Families: checkbox, radio-button, toggle-button,
toggle-switch, select-button, rating, slider and knob. Each record owns its SFC
component, its `createBase*` factory (a public export), and its local style module.
Specs and stories are explicit supporting-file exclusions, as is
`checkbox.api.mdx`; every other scoped file has an owner.

Root and secondary entries resolve to the same records; #115 family identities are
aliases, never same-ticket pending entries. `vue.select-button` links
`package.ultimate.vue.toggle-button`, an alias of the in-ticket `vue.toggle-button`
record it composes. Foundation (`vue-core` base and styling, plus icons for checkbox;
#150) and theme presets (#151) remain explicitly pending. Other pending targets are
linked only where source imports them: `uix-styles.checkbox` (#146, checkbox only),
`component-metadata.records` (#153, checkbox only, the only metadata record among
these families), `vue.ripple` (#142, toggle-button) and `uix-utils.object` (#144,
toggle-button). All eight families have Aura registry keys, but four differ from the
component names: `radiobutton`, `selectbutton`, `togglebutton` and `toggleswitch`
(registered style names match these keys).

Source facts recorded without repair include: checkbox declares `focus` and `blur` but
no template listener calls its handlers, so neither is emitted; radio-button never
reads the inherited `size`, `fluid` or `variant`; toggle-button treats only
`dValue === true` as active and renders a single space label when either label is
empty; toggle-switch has no `name` prop; select-button passes constant
`{ fluid: false }` so its fluid class is never applied, never passes `invalid`,
writes without an event and emits a synthetic `Event`; rating's blur handler has no
readonly or disabled guard and focus and blur emit synthetic `FocusEvent`s; slider
declares `ariaLabel` and `ariaLabelledby` but never binds them, keeps `tabindex="0"`
when disabled, has no ordering guard between range handles, computes NaN when value,
min and max are equal, and gives any orientation other than horizontal vertical
positioning while only "vertical" gets the vertical class; knob emits a bare clamped
number, uses `event.code`, steps PageUp and PageDown by a fixed 10, and divides in
`mapRange` without a guard for `max` equal to `min`.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-choice-range.json --out docs/inventory/vue-choice-range
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/vue-choice-range.test.mjs
pnpm exec prettier --check scripts/inventory/vue-choice-range.json scripts/inventory/vue-choice-range.test.mjs docs/inventory/vue-choice-range
```

## Executed product evidence

**Not run.** The bounded product check

```sh
pnpm --filter @ultimate/vue exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/toggle-switch/ src/select-button/ src/rating/ src/slider/ src/knob/
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
was checked against its source line; every discovered file is owned or excluded and
each public export is accounted for; generated views are byte-exact and tested. Owner
review remains outstanding.
