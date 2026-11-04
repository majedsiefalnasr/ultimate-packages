# Angular overlays and notifications — issue #122

Implements live [#122](https://github.com/majedsiefalnasr/ultimate-packages/issues/122)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `02810e3a8a6ca5ccf75eb596a1ddccdb86257c9b`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/angular-overlays-notifications.json`, not generated details. The existing
pilot pipeline and family-alias resolution are reused unchanged. Scope: dialog, drawer,
popover, confirm-dialog, confirm-popup, dynamic-dialog, tooltip, toast, message and block-ui
under `packages/ng/src`. Each family owns its index, component and style module. `spec.ts`,
`stories.ts` and the generated `dialog.api.mdx` / `tooltip.api.mdx` files are explicit
supporting-file exclusions; every scoped file has an owner or exclusion.

Entry points differ by family, and each record states its own: tooltip, popover, toast,
message and block-ui have both a manifest subpath and a root barrel re-export; dialog,
drawer, confirm-dialog, confirm-popup and dynamic-dialog are re-exported by the root barrel
only, with no manifest subpath. The services these components consume (`UConfirmationService`,
`UDialogService`, `UToastService`) and the `uOverlay` / `uFocusTrap` directives live in
`packages/ng-core`; they are recorded as pending ticket 148 relationships, not as part of
this inventory.

Family aliases (`package.ultimate.ng.<family>`) resolve to the ten records; none are
same-ticket pending, and `package-coverage.json` already reserved them for #122 (tooltip
included) and is unchanged. Identities owned by other tickets stay explicitly pending with
their owning ticket in validation: ng-core (148), `ng.button` (107), themes presets (151),
`uix-styles.dialog` and `uix-styles.tooltip` (146), uix-utils escape, zindex and scroll-lock
(144) and dom (143), uix-motion config (147) and component-metadata records (153);
relationships here do not complete those tickets. Aura registry keys were checked against
`packages/themes/src/presets/aura/index.ts`: `blockui`, `confirmdialog` and `confirmpopup`
differ from the hyphenated folder names, and dynamic-dialog has no Aura registry key.
Component-metadata records exist only for dialog and tooltip, and only those two have an
`@ultimate/uix-styles` export; the other eight records state that and link no such
relationship.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-overlays-notifications.json --out docs/inventory/angular-overlays-notifications
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/angular-overlays-notifications.test.mjs
pnpm exec prettier --check scripts/inventory/angular-overlays-notifications.json scripts/inventory/angular-overlays-notifications.test.mjs docs/inventory/angular-overlays-notifications
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through
a temporary symlink (not committed) because the worktree has no `node_modules`.

## Product check: unavailable / not run

The bounded Angular suite (`pnpm --filter @ultimate/ng exec ng test ...`, see each
record's claim) was **not run**: the task limited local load (no `ng test`, build or
Storybook) and the worktree has no installed dependencies. No product assertions were
executed, so nothing is claimed about runtime behavior. Spec files present are not pass
evidence. CI enforcement is recorded as workflow configuration only; no CI run was
observed. No parity or gap judgment is made.

## Source observations (recorded, not repaired)

Each item was read from source and is recorded in the named record's surface, with its
conditions; nothing was repaired:

- dialog requires an application-provided `ComponentIdGenerator` (no `providedIn`), has
  no close button without a header, restores focus on close but does not move focus in, and
  has no mask-click dismissal.
- drawer has two Escape paths (the root `onKeyDown` and the escape registry); a second
  emission from one keypress was not established. It sets no `aria-modal`, and the focus
  trap is on regardless of `modal`.
- popover and confirm-popup each keep a class-private `instanceCount`, so their first
  instances share an escape-registry key at the OVERLAY_PANEL priority.
- popover's document click listener returns before resetting `selfClick` when
  `dismissable` is false; it sets `aria-modal` to its visibility.
- confirm-dialog closes from the dialog (Escape or close button) through `hide()` without calling
  `reject` and does not clear its `confirmation` signal on a null request; confirm-popup
  outside clicks and window resize call `hide()` without `reject`, while its Escape
  registration calls `onReject`.
- dynamic-dialog subscribes to `open$` with no unsubscribe, and does not read `config.data`.
- tooltip has no vertical clamp or flip, no delay and no Escape or touch handling.
- toast shares a module-level `nextId` across instances; message auto-close via `life`
  does not emit `onClose` and reads `life` once.
- block-ui's `ZIndex.set` applies only when the `maskRef` view child is already resolved
  when the effect runs; this was not established at runtime.

The full wording and conditions are in the records.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies,
English artifacts, scoped staging. Spec: inputs, outputs, services, overlay and escape
wiring, timers, cleanup, style helpers, barrel and manifest entry points were read from
source and sibling-wide traits were grepped across all ten components; byte-exact
generation and preserved authorship are tested. Owner review remains outstanding.
