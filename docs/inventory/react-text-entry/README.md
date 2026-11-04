# React text entry — issue #111

Implements live [#111](https://github.com/majedsiefalnasr/ultimate-packages/issues/111)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `c49aa4e6906a9d72a1893b3fc006fce55489d0b7`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of nine families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/react-text-entry.json`, not generated details. The existing
pilot pipeline is reused unchanged. Families: input-text, input-textarea, input-mask,
input-otp, password, float-label, icon-field (UIconField and UInputIcon), input-chips
and mention. Each record owns its component, props and event types, local style
module and private helpers. Specs and stories are explicit supporting-file
exclusions; every other scoped file has an owner. No separately exported hooks or
base factories exist in these roots.

Root and secondary entries resolve to the same records; #106 family identities
are aliases, never same-ticket pending entries. Foundation (`react-core`
base, styling, icons, escape; #149) and theme presets (#151) remain explicitly
pending, linked only where source imports or registry keys support it: the
Aura registry has no inputmask, mention or inputicon key, so those records do
not link presets. No metadata record exists for these families.

Source facts recorded without repair include: `filled` class params never passed
(input-text, input-textarea, password); `clearIcon` class unused; input-chips
`onAdd` not emitted on paste; mention lacks `aria-controls`, is not a forwardRef
and its debounce timer is not cleared; input-mask accepts no native attributes;
float-label and icon-field CSS selectors do not match the class names the
sibling inputs render; password toggle icons are not keyboard reachable.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-text-entry.json --out docs/inventory/react-text-entry
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/react-text-entry.test.mjs
pnpm exec prettier --check scripts/inventory/react-text-entry.json scripts/inventory/react-text-entry.test.mjs docs/inventory/react-text-entry
```

## Executed product evidence

**Not run.** The bounded product check

```sh
pnpm --filter @ultimate/react exec vitest run src/input-text/ src/input-textarea/ src/input-mask/ src/input-otp/ src/password/ src/float-label/ src/icon-field/ src/input-chips/ src/mention/
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
staging. Spec: props, refs and handlers were read from source; every discovered
file is owned or excluded and each public export is accounted for; generated views
are byte-exact and tested. Owner review remains outstanding.
