# @ultimate/ng

Ultimate Platform Angular components: Button, Checkbox, Dialog, Menu, Tooltip.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

Every component extends `@ultimate/ng-core`'s `UBaseComponent`/`UBaseEditableHolder` base-class tier (Option B — see `packages/ng-core/README.md`). Each is `standalone: true`, uses `ChangeDetectionStrategy.OnPush`, and exposes a signal-based `input()`/`output()`/`contentChild()` API — no `NgModule`, no decorator-based `@Input()`/`@Output()`.

PrimeNG 21.1.9 is the design reference, not a runtime dependency (no `primeng` import anywhere in this package). Each component's prop surface is a deliberately scoped-down subset of its PrimeNG equivalent; see `docs/architecture/provenance/ng.json` for the exact per-file adaptation record, including every documented deviation from the original.

## Components

- **Button (`UButton`, `u-button`)** — native `<button>` host, disabled/loading state (renders a `USpinnerIcon` while loading), ripple effect via `URipple`.
- **Checkbox (`UCheckbox`, `u-checkbox`)** — binary (boolean) checkbox implementing `ControlValueAccessor`, works with both Reactive Forms and template-driven `ngModel`.
- **Dialog (`UDialog`, `u-dialog`)** — modal overlay wiring `UOverlay` (body-append + z-index) and `UFocusTrap` (Tab-cycling) together, with `@ultimate/uix-motion`-driven enter/leave animation, Escape-key dismissal, and focus-return-on-close.
- **Menu (`UMenu`, `u-menu`)** — flat, non-popup `role="menu"` list of `UMenuItem` entries with roving-tabindex keyboard navigation, `routerLink` navigation, and per-item `[uTooltip]` support.
- **Tooltip (`UTooltip`, `[uTooltip]`)** — attribute directive showing a positioned `role="tooltip"` element on hover/focus.

Also exported (Angular-facing primitives consumed by the components above, not independently prioritized components):

- **Ripple (`URipple`, `[uRipple]`)** — ink-ripple effect on mousedown.
- **AutoFocus (`UAutoFocus`, `[uAutoFocus]`)** — defers `focus()` to the element on init.
- **Fluid (`UFluid`, `u-fluid`)** — full-width form-layout wrapper component.
- **Badge (`UBadge`, `u-badge`)** — small status/count indicator.

## Usage

```typescript
import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { UButton, UCheckbox, UDialog } from "@ultimate/ng";

@Component({
  standalone: true,
  imports: [UButton, UCheckbox, UDialog, ReactiveFormsModule],
  template: `
    <u-button label="Open" (onClick)="visible.set(true)" />
    <u-dialog [visible]="visible()" header="Example" (visibleChange)="visible.set($event)">
      <u-checkbox [formControl]="accepted" [binary]="true" label="Accept" />
    </u-dialog>
  `,
})
class ExampleComponent {
  visible = signal(false);
  accepted = new FormControl(false);
}
```

## Dependencies

Depends on `@ultimate/ng-core`, `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, `@ultimate/uix-styles` (workspace), and `tslib`. Peers on `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`, `@angular/router`, and `rxjs`.

`@angular/router` is a genuine (non-optional) peer dependency: `UMenu` directly imports `RouterModule` and binds `routerLink`/`routerLinkActive` in its template. `@angular/cdk` is not used anywhere in this package's dependency closure and is not a peer dependency.

## Provenance

See `docs/architecture/PROVENANCE.md` (PrimeNG entry) and `docs/architecture/provenance/ng.json` for the full file-level incorporation record, and `docs/architecture/COMPONENT_INVENTORY.md` for how this 5-component proof set fits into PrimeNG's full ~117-area source tree.
