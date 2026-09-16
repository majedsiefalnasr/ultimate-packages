# @ultimate/ng

Ultimate Platform Angular components. See `docs/architecture/COMPONENT_INVENTORY.md` for the current component inventory.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

Every component extends `@ultimate/ng-core`'s `UBaseComponent`/`UBaseEditableHolder` base-class tier (Option B — see `packages/ng-core/README.md`). Each is `standalone: true`, uses `ChangeDetectionStrategy.OnPush`, and exposes a signal-based `input()`/`output()` API — no `NgModule`, no decorator-based `@Input()`/`@Output()`.

PrimeNG 21.1.9 is the design reference, not a runtime dependency (no `primeng` import anywhere in this package). Each component's prop surface is a deliberately scoped-down subset of its PrimeNG equivalent; see `docs/architecture/provenance/ng.json` for the exact per-file adaptation record, including every documented deviation from the original.

## Components

- **Button (`UButton`, `u-button`)** — native `<button>` host, disabled/loading state (renders a `USpinnerIcon` while loading), ripple effect via `URipple`.
- **Checkbox (`UCheckbox`, `u-checkbox`)** — binary (boolean) checkbox implementing `ControlValueAccessor`, works with both Reactive Forms and template-driven `ngModel`.
- **Dialog (`UDialog`, `u-dialog`)** — modal overlay wiring `UOverlay` (body-append + z-index) and `UFocusTrap` (Tab-cycling) together, with `@ultimate/uix-motion`-driven enter/leave animation, Escape-key dismissal, and focus-return-on-close.
- **Menu (`UMenu`, `u-menu`)** — flat, non-popup `role="menu"` list of `UMenuItem` entries with roving-tabindex keyboard navigation, `routerLink` navigation, and opt-in per-item `[uTooltip]` support via `UMenuItem.tooltip`.
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

## Component reference

Naming migration: every component's PrimeNG selector/class prefix (`p-*`) is renamed `u-*` (e.g. `p-button` → `u-button`, `.p-button-loading` → `.u-button-loading`), per the spec's Public API Strategy. This is a one-time global rename, not restated per component below.

### Button (`UButton`, `u-button`)

**PrimeNG foundation:** adapted from `Button` in PrimeNG's `button/button.ts` (the `Button` class only — not the same file's `ButtonDirective`/`ButtonLabel`/`ButtonIcon`, which are out of scope for this package). Renders a native `<button>`, matching upstream's own template shape (not a `<div>` with an ARIA role). Excludes upstream's passthrough (`pt`/`ptm`) system, `buttonProps` bulk-props input, `badge`/`type`/`style`/`styleClass`/`tabindex`/`variant`/`link`/`plain`/`autofocus` inputs, and content-template projection — none are in this package's scoped-down signal-input surface. `URipple`/`UAutoFocus`/`UFluid`/`UBadge` are not all wired into `UButton`'s `imports`: only `URipple`/`USpinnerIcon` are used, since `UButton` has no `autofocus`/`fluid`-wrapper/`badge` input to drive the other three (an unused `imports` entry fails Angular's `NG8113` compile check).

**Ultimate behavior:** a native `<button>` with an ink-ripple effect (`uRipple`), an optional leading/positioned icon (`icon`/`iconPos`), an optional text `label`, and a loading state that swaps the icon for a spinning `<u-spinner-icon>` and disables the button.

**Public API:**

| Member     | Type                                     | Kind   | Notes                                                          |
| ---------- | ---------------------------------------- | ------ | -------------------------------------------------------------- |
| `label`    | `string`                                 | input  | button text                                                    |
| `icon`     | `string`                                 | input  | icon class name, rendered as `<span [class]="icon">`           |
| `iconPos`  | `"left" \| "right" \| "top" \| "bottom"` | input  | default `"left"`                                               |
| `loading`  | `boolean`                                | input  | default `false`; renders `<u-spinner-icon>` in place of `icon` |
| `disabled` | `boolean`                                | input  | default `false`                                                |
| `severity` | `string`                                 | input  | maps to `u-button-{severity}`                                  |
| `raised`   | `boolean`                                | input  | default `false`                                                |
| `rounded`  | `boolean`                                | input  | default `false`                                                |
| `text`     | `boolean`                                | input  | default `false`                                                |
| `outlined` | `boolean`                                | input  | default `false`                                                |
| `size`     | `"small" \| "large"`                     | input  | maps to `u-button-sm`/`u-button-lg`                            |
| `fluid`    | `boolean`                                | input  | default `false`; full-width                                    |
| `onClick`  | `MouseEvent`                             | output | not emitted when `disabled`/`loading`                          |
| `onFocus`  | `FocusEvent`                             | output |                                                                |
| `onBlur`   | `FocusEvent`                             | output |                                                                |

**Styling:** consumes `style` from `@ultimate/uix-styles/button`; class-name slots (`root`, `loadingIcon`, `icon`, `label`) are resolved locally in `button-style.ts`.

**Accessibility:** renders a real `<button type="button">`, so native disabled/focus/keyboard-activation semantics apply for free. No explicit `aria-label` is set — `button.spec.ts`'s own test asserts the accessible name falls back to the button's text content when no `ariaLabel` input exists (there is none on `UButton`). The loading spinner carries `aria-hidden="true"`.

### Checkbox (`UCheckbox`, `u-checkbox`)

**PrimeNG foundation:** adapted from `Checkbox` in PrimeNG's `checkbox/checkbox.ts`, extending `UBaseEditableHolder` (see `@ultimate/ng-core`) for the `ControlValueAccessor` contract. Implements only upstream's boolean/binary mode — `value`/`trueValue`/`falseValue` (multi-value/group-checkbox mode), `indeterminate` state, and the check/minus icon template-override system are excluded. `providers: [NG_VALUE_ACCESSOR]` is declared directly on `UCheckbox` (not inherited from the base class — DI providers on a base `@Directive` don't propagate to a derived `@Component`), matching upstream's own pattern of redeclaring `CHECKBOX_VALUE_ACCESSOR` per leaf component. The template binds native `[disabled]` to the base class's combined `$disabled()` signal, not the raw `disabled()` input, so both a template binding and CVA's `setDisabledState` correctly disable the control.

**Ultimate behavior:** a native `<input type="checkbox">` inside a `.u-checkbox-box` wrapper, toggled by click or Space, with an optional text `label`. Works with both `ReactiveFormsModule` (`[formControl]`) and CVA-driven disabling.

**Public API:**

| Member     | Type                   | Kind              | Notes                                                                                                                                               |
| ---------- | ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `binary`   | `boolean`              | input             | default `false`; boolean/binary mode only                                                                                                           |
| `label`    | `string`               | input             | rendered next to the checkbox, also reflected as the input's `aria-label`                                                                           |
| `disabled` | `boolean \| undefined` | input (inherited) | from `UBaseEditableHolder`                                                                                                                          |
| —          | —                      | —                 | no `UCheckbox`-specific outputs beyond the `ControlValueAccessor` contract (`registerOnChange`/`registerOnTouched`/`writeValue`/`setDisabledState`) |

**Styling:** consumes `style` from `@ultimate/uix-styles/checkbox`; class-name slots (`root`, `box`, `input`, `icon`, `label`) are resolved locally in `checkbox-style.ts`. `root`'s `p-highlight`/`p-disabled` modifier classes are deliberately left unrenamed (not `u-highlight`/`u-disabled`) because `@ultimate/uix-styles/checkbox`'s own CSS selectors reference those literal PrimeNG-wide shared class names.

**Accessibility:** native `<input type="checkbox">` semantics (`checkbox.spec.ts` asserts the rendered element is a real `input[type="checkbox"]`), so checked/disabled/keyboard-activation state is exposed to assistive tech for free; `label()` is also reflected as `[attr.aria-label]` on the input. Space toggles the control (`(keydown.space)`, with `preventDefault()` to stop page scroll) in addition to native click activation.

### Dialog (`UDialog`, `u-dialog`)

**PrimeNG foundation:** adapted from `Dialog` in PrimeNG's `dialog/dialog.ts`. Excludes upstream's draggable/resizable wiring, breakpoints, `dismissableMask`, `position` variants, inline-style inputs, `blockScroll`, `maximizable`, and content-template projection slots — the input surface is scoped to `visible`/`header`/`closable`/`closeOnEscape`/`modal`. Two behaviors were added beyond a literal port, both because PrimeNG's own extracted source doesn't implement them: (1) an `afterNextRender`-deferred enter-motion call — `UDialog`'s `@ViewChild("root")` isn't in the DOM until Angular processes the `renderMask` signal flip, so the enter motion is scheduled via `afterNextRender` rather than run synchronously inside the same `effect()` tick (a real bug found and fixed during development: without it, the motion instance is never created and the leave-motion fallback always fires); (2) focus-return-on-close — PrimeNG's own `Dialog` only moves focus _into_ the dialog on show, never restores it on hide, so `UDialog` captures `document.activeElement` when opening and calls `.focus()` on it when closing, closing an accessibility gap upstream leaves open. `@ultimate/uix-motion`'s `createMotion(el, options)` drives enter/leave imperatively (no `pMotion` structural directive exists in this stack).

**Ultimate behavior:** a modal (or non-modal) overlay rendered via `UOverlay` (moves the host to `document.body`, assigns a z-index) and `UFocusTrap` (Tab-cycling within the dialog), with a `header`/close-button region, a content `<ng-content>`, and a `[dialogFooter]`-selected footer slot. Enter/leave is animated via `@ultimate/uix-motion`. Escape dismisses the dialog when `closeOnEscape` is true (a document-level `keydown.escape` host listener, unconditional on any z-index stacking order — this project has only one overlay stacking bucket in Phase 2, so nested-dialog stacking isn't a real scenario yet).

**Public API:**

| Member          | Type      | Kind   | Notes                                                                 |
| --------------- | --------- | ------ | --------------------------------------------------------------------- |
| `visible`       | `boolean` | input  | default `false`                                                       |
| `header`        | `string`  | input  | title text; also drives `aria-labelledby`                             |
| `closable`      | `boolean` | input  | default `true`; shows the close button                                |
| `closeOnEscape` | `boolean` | input  | default `true`                                                        |
| `modal`         | `boolean` | input  | default `true`; gates `aria-modal` and whether `UFocusTrap` is active |
| `visibleChange` | `boolean` | output | two-way-bindable with `visible` (`[(visible)]`)                       |
| `onShow`        | `void`    | output | fires after the enter motion resolves                                 |
| `onHide`        | `void`    | output | fires alongside `visibleChange(false)`                                |

**Styling:** consumes `style` from `@ultimate/uix-styles/dialog`; class-name slots (`mask`, `root`, `header`, `title`, `headerActions`, `pcCloseButton`, `content`, `footer`, …) are resolved locally in `dialog-style.ts`.

**Accessibility:** root element has `role="dialog"`, `[attr.aria-modal]="modal()"`, and `[attr.aria-labelledby]` pointing at the header `<span>`'s `id` — only set when `header()` is non-empty, avoiding a dangling id reference (`dialog.spec.ts` asserts both the positive and the no-header case). Focus is trapped inside the dialog via `uFocusTrap` while `modal()` is true, Escape closes the dialog when `closeOnEscape()` is true, and focus returns to the element that had focus before the dialog opened once it closes (`dialog.spec.ts`'s "returns focus to the triggering element when closed" test).

### Menu (`UMenu`, `u-menu`)

**PrimeNG foundation:** adapted from `Menu` in PrimeNG's `menu/menu.ts`, rendering a flat, non-popup `role="menu"` list — no submenu nesting, popup-overlay positioning, or the `Home`/`End`/`Enter`/`Space`/`Tab` key handlers upstream's `onListKeyDown()` also implements. The most significant deviation: real PrimeNG's `Menu` does not move native DOM focus between items at all — it keeps native focus on the root `<ul>` and tracks a `focusedOptionIndex` signal published via `aria-activedescendant` (a virtual-focus pattern). `UMenu` instead implements a literal roving-tabindex pattern — moving `tabindex="0"`/`"-1"` between `<a>` elements and calling `.focus()` directly — because this package's own spec test asserts `document.activeElement` actually moves on ArrowDown, an explicit, different resolution documented in `docs/architecture/provenance/ng.json`. `[uTooltip]`/`[routerLink]` are applied directly on `UMenu`'s own `<a>` (real PrimeNG applies them via a separate `MenuItemContent` child component it doesn't have here). Unlike real PrimeNG (which gates its tooltip behind `showOnEllipsis` truncation-detection — out of `UTooltip`'s scope), `UMenu` exposes an Ultimate-specific, opt-in `UMenuItem.tooltip` field instead of binding `[uTooltip]` to `item.label` unconditionally.

**Ultimate behavior:** renders `model()` (an array of `UMenuItem`, from `@ultimate/ng-core`) as `<li role="none"><a role="menuitem">` entries, or `<li role="separator">` for `{ separator: true }` entries. Initial `tabindex="0"` is seeded on the first non-separator item (not literally model index 0, since a leading separator renders no anchor). ArrowDown/ArrowUp move focus between enabled items, skipping disabled ones and wrapping at the ends. Items with a `routerLink` navigate via `RouterModule`, except when `disabled` (routerLink is suppressed so a disabled item is never a real navigable link); items with a `tooltip` field show a `[uTooltip]` on hover/focus (opt-in — not derived from `label`). `disabled` items get `aria-disabled` and don't fire `command()`.

**Public API:**

| Member  | Type          | Kind  | Notes                                                                                                                                           |
| ------- | ------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `model` | `UMenuItem[]` | input | default `[]`; see `UMenuItem` in `@ultimate/ng-core`                                                                                            |
| `popup` | `boolean`     | input | default `false`; currently only toggles the `u-menu-overlay` style class — no popup-overlay component exists yet in this package to render into |

**Styling:** consumes `style` from `@ultimate/uix-styles/menu`; class-name slots (`root`, `list`, `separator`, `item`, `itemLink`, `itemIcon`, `itemLabel`, …) are resolved locally in `menu-style.ts`.

**Accessibility:** root list has `role="menu"`; each non-separator item is `<li role="none"><a role="menuitem">`; separators are `<li role="separator">`. Keyboard navigation is a literal roving-tabindex implementation: exactly one anchor has `tabindex="0"` at a time, ArrowDown/ArrowUp move it (and native focus) to the next/previous enabled item, wrapping around, and disabled items (`aria-disabled="true"`) are skipped (`menu.spec.ts`'s "moves focus to the next menuitem on ArrowDown" and "skips disabled items" tests assert this against `document.activeElement` directly).

### Tooltip (`UTooltip`, `[uTooltip]`)

**PrimeNG foundation:** adapted from the `Tooltip` directive in PrimeNG's `tooltip/tooltip.ts`. Excludes upstream's much larger prop surface (`tooltipEvent`, delay/`life` timers, `appendTo`, `hideOnEscape`, `showOnEllipsis`, `TemplateRef` content, and its 4-way viewport-fallback positioning search via `isOutOfBounds()`/`preAlign()`). `UTooltip` implements a single fixed position per `uTooltipPosition` (matching `UTooltipOptions`' plain `position` field, which has no fallback-order concept), with a horizontal-only viewport clamp via `getViewport()` — vertical repositioning (flipping `top` to `bottom` when there's no room above) is not implemented, since that's inseparable from the excluded fallback-search mechanism. Z-index uses a literal base of `1100` via `@ultimate/uix-utils`'s `ZIndex` singleton (above `UOverlay`'s `1000` base), since `UltimateConfig` has no `zIndex` sub-config to read from the way upstream's global PrimeNG config does.

**Ultimate behavior:** an attribute directive (`[uTooltip]="text"`) that creates and appends a positioned tooltip element to `document.body` on `mouseenter`/`focus`, and removes it on `mouseleave`/`blur`. Position is one of `top`/`bottom`/`left`/`right` (default `top`) via `uTooltipPosition`; `uTooltipDisabled` suppresses showing entirely.

**Public API:**

| Member             | Type                                     | Kind  | Notes                        |
| ------------------ | ---------------------------------------- | ----- | ---------------------------- |
| `uTooltip`         | `string`                                 | input | tooltip text; selector alias |
| `uTooltipPosition` | `"top" \| "bottom" \| "left" \| "right"` | input | default `"top"`              |
| `uTooltipDisabled` | `boolean`                                | input | default `false`              |

**Styling:** consumes `style` from `@ultimate/uix-styles/tooltip`; class-name slots (`root`, `arrow`, `text`, all plain strings) are resolved locally in `tooltip-style.ts`.

**Accessibility:** the created container has `role="tooltip"` and a position-specific class (`u-tooltip-{position}`); it appears on both mouse hover (`mouseenter`/`mouseleave`) and keyboard focus (`focus`/`blur`), so keyboard-only users can trigger it, not just mouse users (`tooltip.spec.ts` covers the hover path directly; the directive's `host` bindings wire `focus`/`blur` to the same `show()`/`hide()` handlers).

## Dependencies

Depends on `@ultimate/ng-core`, `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, `@ultimate/uix-styles` (workspace), and `tslib`. Peers on `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`, `@angular/router`, and `rxjs`.

`@angular/router` is a genuine (non-optional) peer dependency: `UMenu` directly imports `RouterModule` and binds `routerLink` in its template. `@angular/cdk` is not used anywhere in this package's dependency closure and is not a peer dependency.

## Provenance

See `docs/architecture/PROVENANCE.md` (PrimeNG entry) and `docs/architecture/provenance/ng.json` for the full file-level incorporation record, and `docs/architecture/COMPONENT_INVENTORY.md` for how this component set fits into PrimeNG's full ~117-area source tree.
