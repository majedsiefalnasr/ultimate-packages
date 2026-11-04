# Vue text entry — issue #112

Implements live [#112](https://github.com/majedsiefalnasr/ultimate-packages/issues/112)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `849ec35cc57b459cf1a6fb24f83b24d4beff559a`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of ten families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/vue-text-entry.json`, not generated details. The existing
pilot pipeline is reused unchanged. Families: input-text, textarea, input-mask,
input-otp, password, input-chips, float-label, ifta-label, icon-field (UIconField and
UInputIcon) and input-group (UInputGroup and UInputGroupAddon). Each record owns its
SFC component, its `createBase*` factory (a public export), and its local style
module. Specs and stories are explicit supporting-file exclusions; every other scoped
file has an owner.

Root and secondary entries resolve to the same records; #112 family identities are
aliases, never same-ticket pending entries. Foundation (`vue-core` base, styling,
overlay; #150) and theme presets (#151) remain explicitly pending, linked only where
source imports or registry keys support it: the Aura registry has no inputmask key, so
`vue.input-mask` does not link presets; `vue.password` also links `vue-core` overlay
because it imports `Portal`. No metadata record exists for these families, and the
Vue style modules are hand-ported rather than imported from `uix-styles`, so neither
is linked.

Source facts recorded without repair include: textarea never passes `filled`
(`p-filled` is not applied); input-mask's template does not apply `u-input-text`,
its mask watcher does not re-sync the buffer, `partialPosition` is not declared in
`data()`, and `paste` is not emitted when readonly, disabled or maskless; input-otp
does not emit `keydown`, renders no per-input `aria-label`, and uses different
integer checks for keydown and paste; password has no `invalid` or `name` prop,
its toggle icons are not keyboard reachable, and the `clearIcon` class is unused;
input-chips extends `createBaseComponent` directly, drops fallthrough attributes,
emits `add` (full array) on paste, Enter, separator and blur-add, and does not enforce
`max` on paste; float-label, ifta-label and input-group CSS selectors target classes
(`u-filled`, `u-invalid`, `u-inputwrapper`, `u-component`) that the sibling inputs do
not render. Inherited `size` is never read by the input templates.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-text-entry.json --out docs/inventory/vue-text-entry
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/vue-text-entry.test.mjs
pnpm exec prettier --check scripts/inventory/vue-text-entry.json scripts/inventory/vue-text-entry.test.mjs docs/inventory/vue-text-entry
```

## Executed product evidence

**Not run.** The bounded product check

```sh
pnpm --filter @ultimate/vue exec vitest run src/input-text/ src/textarea/ src/input-mask/ src/input-otp/ src/password/ src/input-chips/ src/float-label/ src/ifta-label/ src/icon-field/ src/input-group/
```

was not executed: the task forbade vitest, builds, Storybook and installs to limit
local load, and the worktree has no `node_modules`. Only the inventory Node tests
ran. No browser rendering, build, publication or accessibility testing was done.

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
