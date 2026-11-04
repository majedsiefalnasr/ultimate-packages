# Vue overlays and notifications — issue #124

Implements live [#124](https://github.com/majedsiefalnasr/ultimate-packages/issues/124)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `ce6cb351653cbbb19cc0b0246942082dd0aff73d`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of eleven families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/vue-overlays-notifications.json`, not generated details. The
existing pilot pipeline is reused unchanged. Families: dialog, drawer, popover,
confirm-dialog, confirm-popup, dynamic-dialog, tooltip, toast, message, inline-message and
block-ui. Each record owns its component or directive, base factory, local style module and
index barrel (43 owned files). Specs, stories and the two generated API pages are 24
supporting files recorded as explicit exclusions; every other scoped file has an owner.
The families contain no composable (`useConfirm`, `useToast` and `useDialog` exist nowhere
in `packages/vue` or `packages/vue-core`), plugin install, provide or inject source: the
confirmation, dialog and toast services are Vue plugins and event buses owned by `vue-core`
(#150), and the family components talk to the event buses directly. Tooltip is a directive
without a component or base factory.

Root and secondary entries resolve to the same records; #106 family identities are aliases
(`package.ultimate.vue.<family>`), never same-ticket pending entries. confirm-dialog and
dynamic-dialog compose dialog, a same-ticket record, so that relationship resolves locally.
Pending identities owned elsewhere are linked only where a family imports the matching
helper: `vue-core` base, styling, overlay, escape, focus-trap, zindex, scroll-lock, motion,
icons, service and directive (#150); theme presets (#151); `vue.ripple` (#142) for dialog and
drawer; `uix-utils` dom (#143), escape and uuid (#144); `uix-styles` dialog and tooltip
(#146); and component-metadata records (#153). No family imports `uix-motion` or the Vue
button, so neither is linked. The Aura registry (`packages/themes/src/presets/aura/index.ts`)
has an entry for ten families; the registry keys blockui, confirmdialog, confirmpopup and
inlinemessage differ from the family directories block-ui, confirm-dialog, confirm-popup and
inline-message, and dynamic-dialog has no key. Metadata records exist for dialog, tooltip only.

Files outside the family roots that mention these families are shared or supporting and are
not owned here: the dialog and tooltip e2e specs with their snapshots, `packages/vue/test/exports.test.ts`
and the shared Aura style specs (`g3a`, `g3b`, `g3d`, `aura-token-wiring`).

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-overlays-notifications.json --out docs/inventory/vue-overlays-notifications
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/vue-overlays-notifications.test.mjs
pnpm exec prettier --check scripts/inventory/vue-overlays-notifications.json scripts/inventory/vue-overlays-notifications.test.mjs docs/inventory/vue-overlays-notifications
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through a
temporary symlink (not committed) because the worktree has no `node_modules`. No CI run
was observed.

## Product check: not run

The bounded product check

```sh
pnpm --filter @ultimate/vue exec vitest run src/dialog/ src/drawer/ src/popover/ src/confirm-dialog/ src/confirm-popup/ src/dynamic-dialog/ src/tooltip/ src/toast/ src/message/ src/inline-message/ src/block-ui/
```

was **not run**: the task forbade vitest, builds, Storybook and installs to limit local
load. No product assertions, rendering or accessibility tests were executed, so nothing is
claimed about runtime behavior from them; every observation below was read from source.
Spec files present are not pass evidence. CI enforcement is recorded as workflow
configuration only (`.github/workflows/ci.yml` root `pnpm run test`). No parity or gap
judgment is made.

## Source observations (recorded, not repaired)

Cross-family facts below are derived from the records in the JSON.

- rendered through UPortal: dialog, drawer, popover, confirm-popup.
- ZIndex entry not reverted on hide: drawer, popover, confirm-popup.
- module-level counters: toast, block-ui.
- inheritAttrs false without a $attrs binding: toast, message, inline-message, block-ui.
- declared emits: dialog, drawer, popover, message, block-ui.
- no Aura registry key: dynamic-dialog.
- metadata records exist for dialog, tooltip only; the dialog record cites Dialog.vue lines
  118, 177, 199 and 208 where the source has 117, 189, 211 and 220, and lists no
  `after-hide` event although the source declares and emits it; the tooltip record cites
  `tooltip.ts:150-161` where the hooks block starts at line 167.
- drawer reaches `close()` on Escape through two paths and reads `modal` only in the
  mask-click condition; popover pushes a new ZIndex entry on every align call.
- confirm-dialog hides without calling reject on Escape, mask or close-button dismissal;
  confirm-popup calls reject on Escape and does not on outside click or resize.
- tooltip `updated` rebinds on every update, `onEnter` does not clear the show timer, and
  the style module's classes are never read by the directive.
- block-ui uses the string `"modal"` as its z-index key and does not gate `clearZIndex`
  on `autoZIndex`.

Per-family detail (props, defaults, accessibility attributes, CSS rules) is in the
generated record pages.

## Local review

Standards review: AGENTS.md followed — English artifacts, scoped files only, worktree
created with `--no-track`, no push or merge, verification kinds kept distinct
(implemented from source, not-run product check, ci-enforced as configuration only).
The pilot, test layout and README structure match the accepted #121, #122 and #123
inventories; no source was repaired.

Spec review: #124 acceptance items — every scoped file is owned (43 owned files) or
excluded with a reason (24 supporting files); the eleven families record purpose, public
surface, availability and relationships; foundation, theme and metadata links follow
imports and files that exist, with external targets pending under their owning tickets;
implemented, verified and CI-enforced claims are distinct and none is marked verified;
Prime references are not linked as dependencies.
