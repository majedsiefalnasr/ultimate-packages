# React overlays and notifications — issue #123

Implements live [#123](https://github.com/majedsiefalnasr/ultimate-packages/issues/123)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `7b296258f469ba37ed2367cafbf3f2dbf95398f0`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of nine families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/react-overlays-notifications.json`, not generated details. The
existing pilot pipeline is reused unchanged. Families: dialog, drawer, popover,
confirm-dialog, confirm-popup, tooltip, toast, message and block-ui. Each record owns its
component, props, handle and option types, local style module and index barrel (27 owned
files). Specs, stories and the two generated API pages are 20 supporting files recorded as
explicit exclusions; every other scoped file has an owner. The families contain no hook,
context, provider or service source: toast is driven by an imperative ref handle and the
confirmation components by the `confirmationEventBus` owned by `react-core`.

Root and secondary entries resolve to the same records; #106 family identities are
aliases (`package.ultimate.react.<family>`), never same-ticket pending entries.
confirm-dialog also composes dialog, a same-ticket record, so that relationship resolves
locally. Pending identities owned elsewhere: `react-core` base, styling, overlay, escape,
focus-trap, zindex, scroll-lock, motion, confirmation, icons and hooks (#149), only where a
family imports the matching helper; theme presets (#151); `react.button` (#108) for
confirm-dialog and confirm-popup; and component-metadata records (#153) for dialog and
tooltip. Links are recorded only where source supports them. The Aura registry
(`packages/themes/src/presets/aura/index.ts`) has an entry for each family; the Aura registry keys blockui, confirmdialog and confirmpopup differ from the componentNames
`block-ui`, `confirm-dialog` and `confirm-popup`, and the other six match. Metadata
records exist for dialog, tooltip only. `@ultimate/uix-styles` has entries for dialog and
tooltip, but no family source imports `@ultimate/uix-styles`, `@ultimate/uix-utils` or
`@ultimate/uix-motion`, so no link to those packages is recorded.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-overlays-notifications.json --out docs/inventory/react-overlays-notifications
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/react-overlays-notifications.test.mjs
pnpm exec prettier --check scripts/inventory/react-overlays-notifications.json scripts/inventory/react-overlays-notifications.test.mjs docs/inventory/react-overlays-notifications
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through a
temporary symlink (not committed) because the worktree has no `node_modules`. No CI run
was observed.

## Product check: not run

The bounded product check

```sh
pnpm --filter @ultimate/react exec vitest run src/dialog/ src/drawer/ src/popover/ src/confirm-dialog/ src/confirm-popup/ src/tooltip/ src/toast/ src/message/ src/block-ui/
```

was **not run**: the task forbade vitest, builds, Storybook and installs to limit local
load. No product assertions, rendering or accessibility tests were executed, so nothing is
claimed about runtime behavior from them; every observation below was read from source. A
few lifecycle statements (portal ref timing, ZIndex stack changes) were also replayed in
plain Node with the real sources bundled under jsdom and React 18; those replays were
throwaway and are not committed. Spec files present are not pass evidence. CI enforcement
is recorded as workflow configuration only (`.github/workflows/ci.yml` root
`pnpm run test`). No parity or gap judgment is made.

## Source observations (recorded, not repaired)

Cross-family facts below are derived from the records in the JSON.

- forwardRef components: popover, toast, message, block-ui.
- rendered through Portal: dialog, drawer, popover, confirm-popup, tooltip.
- ZIndex entry never reverted when the element is removed: drawer, confirm-popup, tooltip, block-ui.
- unmount cleanup passes a detached ref to clearZIndex: dialog, drawer, tooltip.
- metadata records exist for dialog, tooltip only; the dialog record says `onHide` also
  fires when the leave motion completes, which `dialog.tsx` does not do.
- module-level mutable counters: toast, block-ui.
- popover sets no inline top, left or z-index in the replay because its panel ref is null
  when the effect runs; confirm-popup positions its panel only when a new confirmation
  replaces an open one.
- confirm-dialog and confirm-popup define an `icon` class in the style module but never
  call `cx("icon")`; confirm-popup also has no CSS rules for its icon or message classes.
- tooltip attaches listeners once on mount and no code assigns its top or left.
- block-ui has no CSS rule that positions the non-fullScreen mask.

Per-family detail (props, defaults, callbacks, accessibility attributes, CSS rules) is in
the generated record pages.

## Local review

Standards review: AGENTS.md followed — English artifacts, scoped files only, worktree
created with `--no-track`, no push or merge, verification kinds kept distinct
(implemented from source, not-run product check, ci-enforced as configuration only).
The pilot, test layout and README structure match the accepted #117, #120 and #122
inventories; no source was repaired.

Spec review: #123 acceptance items — every scoped file is owned (27) or excluded with a
reason (20 supporting files); the nine families record purpose, public surface,
availability and relationships; foundation, theme and metadata links follow imports and
files that exist, with external targets pending under their owning tickets; implemented,
verified and CI-enforced claims are distinct and none is marked verified; Prime
references are not linked as dependencies.
