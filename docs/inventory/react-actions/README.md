# React actions and identity — issue #108

Implements live [#108](https://github.com/majedsiefalnasr/ultimate-packages/issues/108)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `c7a8d706e9ebfb22ebf6cc6635a77819cce95576`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/react-actions.json`, not generated details. The existing
pilot pipeline and #107 family-alias resolution are reused unchanged. `react.button`
retains its pilot identity. Each component owns its props type, forwarded ref,
local style module and private rendering/state helpers; toolbar's named content
props and wrapper children are composition, not folder-derived extra components.
All scoped files have an owner or explicit supporting-file exclusion. There are
no separately exported custom hooks or base factories within these roots.

Root and secondary entry aliases resolve to the same records. #106 reconciled
family identities are aliases, never same-ticket pending entries. Foundation,
icons, styling, theme, metadata, menu and tooltip details belonging to other
tickets remain explicitly pending with links in validation; source relationship
interpretation here does not complete those tickets. Historical style comments
claiming missing shared modules are not used as current availability evidence.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-actions.json --out docs/inventory/react-actions
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/react-actions.test.mjs
pnpm exec prettier --check scripts/inventory/react-actions.json scripts/inventory/react-actions.test.mjs docs/inventory/react-actions
```

## Executed product evidence

Node v24.15.0; `pnpm install` completed and ran Husky prepare in this worktree.
At the source revision above, the existing bounded product check was attempted:

```sh
pnpm --filter @ultimate/react exec vitest run src/button/ src/button-group/ src/split-button/ src/avatar/ src/avatar-group/ src/chip/ src/tag/ src/toolbar/
```

**Unavailable before assertions, process exit 1.** Vitest 2.1.9 started, then Vite
failed loading the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs` because
`postcss-import` could not be found. No scoped test assertions executed. This
neither proves nor disproves component behavior; no host configuration, product
source or dependency repair was attempted. Browser rendering, package build,
publication and complete accessibility coverage were not exercised.

`.github/workflows/ci.yml` has a conditional root `pnpm run test` step when scope
is not docs. This is configuration evidence only, not observed CI execution or
merge protection. The root `test:scripts` command does not include inventory's
Node test glob. No new CI claim or workflow modification is made.

## Local review

Standards and Spec reviews are performed directly, without spawning, per the
explicit request. Standards: existing inventory API/schema reused, no pipeline
or product changes, no new dependencies, English artifacts and scoped staging.
Spec: actual props and refs read directly; native attribute inheritance is
button-only; icon contracts, toolbar composition, local versus token styles,
metadata absence and splitbutton theme naming are explicit. Each discovered
file is owned or excluded and each public runtime/type alias accounted for.
Deterministic byte-exact generation and preserved authorship are tested. Product
runner failure is disclosed, not promoted to passing evidence. Owner review is
separate and remains outstanding.
