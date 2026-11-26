# Vue numeric, date, color and file inputs — issue #121

Implements live [#121](https://github.com/majedsiefalnasr/ultimate-packages/issues/121)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `3143b1f248e72addb28087e65a31014466c5969d`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of four families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/vue-numeric-date-color-file.json`, not generated details. The
existing pilot pipeline is reused unchanged. Families: input-number, date-picker,
color-picker and file-upload. Each record owns its SFC component, its `createBase*`
factory (a public export) and its style module (color-picker's imports the shared
`@ultimate/uix-styles/colorpicker` CSS, not linked, as in the choice-range Knob record). Specs and stories are explicit
supporting-file exclusions; every other scoped file has an owner.

Root and secondary entries resolve to the same records; #121 family identities are
aliases, never same-ticket pending entries. Foundation (`vue-core` base and styling,
plus overlay for the two families that compose `UPortal`; #150), theme presets (#151)
and the `vue.progress-bar` record that file-upload imports (#142) remain explicitly
pending. No `component-metadata` record exists for these families, so none is linked.
Aura registry keys exist for all four families and differ from the hyphenated
names: `inputnumber`, `datepicker`, `colorpicker` and `fileupload`, which are also the
registered style names.

Source facts recorded without repair are in the generated detail files. Cross-family
summary, each checked against all four components: only date-picker has no outside-click
handling; only color-picker registers document listeners, and it removes them in `beforeUnmount`;
date-picker and color-picker compose `UPortal`, while input-number and file-upload
render inline; only input-number passes an additional preset key to
`registerComponentStyle`; file-upload has no model value; no component calls `.focus(`.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-numeric-date-color-file.json --out docs/inventory/vue-numeric-date-color-file
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/vue-numeric-date-color-file.test.mjs
pnpm exec prettier --check scripts/inventory/vue-numeric-date-color-file.json scripts/inventory/vue-numeric-date-color-file.test.mjs docs/inventory/vue-numeric-date-color-file
```

## Executed product evidence

**Not run.** The bounded product check

```sh
pnpm --filter @ultimate/vue exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/
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
was checked against the sibling components for the same pattern, with locale and
formatting claims replayed in plain node; every discovered file is owned or excluded
and each public export is accounted for; generated views are byte-exact and tested.
Owner review remains outstanding.
