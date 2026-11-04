# Vue actions and identity — issue #109

Implements live [#109](https://github.com/majedsiefalnasr/ultimate-packages/issues/109)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `37aa7ce8525c6f1622127eb1735ec41beb4096c5`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/vue-actions.json`, not generated details. The existing
pilot pipeline and #106 family-alias resolution are reused unchanged. `vue.button`
retains its pilot identity. Scope: button, button-group, split-button, avatar,
avatar-group, badge, overlay-badge, chip, tag and toolbar. Each family owns its
`.vue` component, `Base*` Options-API factory, style module and index. Spec, Storybook
and API-doc files are explicit supporting-file exclusions; every scoped file has an
owner or exclusion. `createBaseOverlayBadge` is source-only (not re-exported).
No scoped composables or directives are exported from these roots.

Family aliases (`package.ultimate.vue.<family>`) resolve to the records; none are
same-ticket pending. Foundation, icons, styling, theme, uix-styles, metadata, menu,
ripple and tooltip identities belonging to other tickets remain explicitly pending
with their owning ticket in validation; relationship interpretation here does not
complete those tickets.

Regenerate and validate from the checkout root under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-actions.json --out docs/inventory/vue-actions
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/vue-actions.test.mjs
pnpm exec prettier --check scripts/inventory/vue-actions.json scripts/inventory/vue-actions.test.mjs docs/inventory/vue-actions
```

## Executed product evidence

Node v24.15.0; `pnpm install --frozen-lockfile` completed with Husky prepare. At the
source revision, the bounded product check was run:

```sh
pnpm --filter @ultimate/vue exec vitest run src/button/ src/button-group/ src/split-button/ src/avatar/ src/avatar-group/ src/badge/ src/overlay-badge/ src/chip/ src/tag/ src/toolbar/
```

**Unavailable before assertions, exit 1.** Vitest 2.1.9 / Vite failed loading the
host ancestor `/Users/majedsiefalnasr/postcss.config.mjs` because `postcss-import`
could not be found. No scoped test assertions executed; this neither proves nor
disproves component behavior. No host, product or dependency repair was attempted.
Browser rendering, build, publication and accessibility were not exercised. Presence
of spec files is not pass evidence. No CI claim is made.

## Local review

Standards and Spec reviews were performed directly without spawning. Standards:
existing inventory API/schema reused, no pipeline or product changes, no new
dependencies, English artifacts, scoped staging (scratch `.issue109-author.py`
excluded). Spec: props, emits, slots, base factories, style helpers/types and
composition (split-button→button/menu, overlay-badge→badge, groups→children) read
from source; deterministic byte-exact generation and preserved authorship are tested.
Owner review remains outstanding.
