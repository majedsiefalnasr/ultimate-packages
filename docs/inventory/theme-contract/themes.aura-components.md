# Aura component token modules

ID: themes.aura-components

Framework: shared; availability: internal

## Authored interpretation

Constituent per-component design-token modules registered by the Aura preset: 79 files, each exporting a token constant and, in 76 of them, a token interface.

## Framework surface

See [authored signatures and interpretation](README.md). Not independently reachable from the package root; each constant (for example button, checkbox, dialog, menu, tooltip, paginator) is imported only by presets/aura/index.ts and registered under a lower-case key, so the token interfaces (for example ButtonColorSchemeTokens, TooltipColorSchemeTokens) are not importable from @ultimate/themes. 25 modules import contract types; the others declare module-local shapes. progress-spinner, select-button and skeleton export no interface.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/themes/src/presets/aura/accordion.ts
packages/themes/src/presets/aura/autocomplete.ts
packages/themes/src/presets/aura/avatar.ts
packages/themes/src/presets/aura/badge.ts
packages/themes/src/presets/aura/block-ui.ts
packages/themes/src/presets/aura/breadcrumb.ts
packages/themes/src/presets/aura/button.ts
packages/themes/src/presets/aura/card.ts
packages/themes/src/presets/aura/carousel.ts
packages/themes/src/presets/aura/cascade-select.ts
packages/themes/src/presets/aura/checkbox.ts
packages/themes/src/presets/aura/chip.ts
packages/themes/src/presets/aura/color-picker.ts
packages/themes/src/presets/aura/confirm-dialog.ts
packages/themes/src/presets/aura/confirm-popup.ts
packages/themes/src/presets/aura/context-menu.ts
packages/themes/src/presets/aura/data-view.ts
packages/themes/src/presets/aura/date-picker.ts
packages/themes/src/presets/aura/dialog.ts
packages/themes/src/presets/aura/divider.ts
packages/themes/src/presets/aura/dock.ts
packages/themes/src/presets/aura/drawer.ts
packages/themes/src/presets/aura/fieldset.ts
packages/themes/src/presets/aura/file-upload.ts
packages/themes/src/presets/aura/float-label.ts
packages/themes/src/presets/aura/galleria.ts
packages/themes/src/presets/aura/icon-field.ts
packages/themes/src/presets/aura/ifta-label.ts
packages/themes/src/presets/aura/image-compare.ts
packages/themes/src/presets/aura/image.ts
packages/themes/src/presets/aura/inline-message.ts
packages/themes/src/presets/aura/inplace.ts
packages/themes/src/presets/aura/input-chips.ts
packages/themes/src/presets/aura/input-group.ts
packages/themes/src/presets/aura/input-number.ts
packages/themes/src/presets/aura/input-otp.ts
packages/themes/src/presets/aura/input-text.ts
packages/themes/src/presets/aura/knob.ts
packages/themes/src/presets/aura/listbox.ts
packages/themes/src/presets/aura/mega-menu.ts
packages/themes/src/presets/aura/menu.ts
packages/themes/src/presets/aura/menubar.ts
packages/themes/src/presets/aura/message.ts
packages/themes/src/presets/aura/meter-group.ts
packages/themes/src/presets/aura/multi-select.ts
packages/themes/src/presets/aura/order-list.ts
packages/themes/src/presets/aura/organization-chart.ts
packages/themes/src/presets/aura/overlay-badge.ts
packages/themes/src/presets/aura/paginator.ts
packages/themes/src/presets/aura/panel-menu.ts
packages/themes/src/presets/aura/panel.ts
packages/themes/src/presets/aura/password.ts
packages/themes/src/presets/aura/pick-list.ts
packages/themes/src/presets/aura/popover.ts
packages/themes/src/presets/aura/progress-bar.ts
packages/themes/src/presets/aura/progress-spinner.ts
packages/themes/src/presets/aura/radio-button.ts
packages/themes/src/presets/aura/rating.ts
packages/themes/src/presets/aura/scroll-panel.ts
packages/themes/src/presets/aura/select-button.ts
packages/themes/src/presets/aura/select.ts
packages/themes/src/presets/aura/skeleton.ts
packages/themes/src/presets/aura/slider.ts
packages/themes/src/presets/aura/speed-dial.ts
packages/themes/src/presets/aura/split-button.ts
packages/themes/src/presets/aura/splitter.ts
packages/themes/src/presets/aura/stepper.ts
packages/themes/src/presets/aura/steps.ts
packages/themes/src/presets/aura/tabs.ts
packages/themes/src/presets/aura/tag.ts
packages/themes/src/presets/aura/terminal.ts
packages/themes/src/presets/aura/textarea.ts
packages/themes/src/presets/aura/tiered-menu.ts
packages/themes/src/presets/aura/timeline.ts
packages/themes/src/presets/aura/toast.ts
packages/themes/src/presets/aura/toggle-button.ts
packages/themes/src/presets/aura/toggle-switch.ts
packages/themes/src/presets/aura/toolbar.ts
packages/themes/src/presets/aura/tooltip.ts

```text
packages/themes/src/presets/aura/button.ts: export const button: ComponentTokens<ButtonColorSchemeTokens> = {
packages/themes/src/presets/aura/checkbox.ts: export const checkbox: CheckboxComponentTokens = {
packages/themes/src/presets/aura/dialog.ts: export const dialog: DialogComponentTokens = {
packages/themes/src/presets/aura/menu.ts: export const menu: MenuComponentTokens = {
packages/themes/src/presets/aura/tooltip.ts: export const tooltip: ComponentTokens<TooltipColorSchemeTokens> = {
packages/themes/src/presets/aura/skeleton.ts: export const skeleton
```

## Relationships

themes.aura
themes.contract

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Aura component token modules is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/themes/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/theme-contract.json --out docs/inventory/theme-contract (run twice; authored README SHA-256 checked before and after)",
    "revision": "bced8db5905c1e1f38463c585063e110a93624ca",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 93 source files accounted for, 10 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/theme-contract/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
