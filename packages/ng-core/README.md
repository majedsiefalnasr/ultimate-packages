# @ultimate/ng-core

Angular-specific foundation for the Ultimate Platform: base component hierarchy, overlay/focus-trap infrastructure, icons, and minimal config.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

`ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy is **Option B**: informed by PrimeNG's own `BaseComponent`/`BaseEditableHolder` pattern, but independently authored and deliberately scoped down. It covers DI wiring, lifecycle hooks, and `@ultimate/uix-styled`-backed style registration only.

PrimeNG's full passthrough (`pt`/`ptOptions`/`ptm`/`ptms`/`ptmo`) system, its full global-config surface, and its `$parentInstance` DI-token lookup are explicitly out of scope for this phase (deferred, needs architecture decision) — see `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/ng-core.json` for the full provenance record.

## Modules

- `basecomponent` — `UBaseComponent`, the abstract base every `ng` component/directive extends: DI wiring (`document`, `platformId`, `el`, `renderer`, `config`), the `dt`/`unstyled` input pair, a `cx()` class-name-slot resolver, and `ngOnInit` registration of the component's style module with `@ultimate/uix-styled`'s `StyleSheet` service (once per `componentName`). Registration is once per `componentName` per document, and server-rendered styles are adopted on hydration via the `data-u-ng-style` key attribute.
- `base-editable-holder` — `UBaseEditableHolder`, extends `UBaseComponent` and implements Angular's `ControlValueAccessor` contract for form-bindable components (e.g. `UCheckbox`). Uses a split-signal `disabled` pattern: `disabled` is a read-only `input()` reflecting a template binding; `setDisabledState` (the CVA method) writes instead to a separate writable `_disabled` signal; `$disabled` is a `computed()` combining both (`disabled() || _disabled()`) — the value every consumer should read, since `input()` has no `.set()`. Declares `writeValue` as abstract; does **not** provide `NG_VALUE_ACCESSOR` itself (DI providers on a base `@Directive` don't propagate to a derived `@Component`), so every leaf component must declare its own provider.
- `overlay` — `UOverlay` (`[uOverlay]`), moves its host element to `document.body` (or a given `HTMLElement` via `appendTo`) and assigns/clears a z-index (via `@ultimate/uix-utils/zindex`'s `ZIndex.set`/`.clear`, base `1000`, key `"overlay"`) when its `visible` input toggles, restoring the host to its original DOM position on hide. Does not orchestrate enter/leave motion itself — that's left to the consuming component (e.g. `UDialog`). All DOM manipulation is guarded behind `isPlatformBrowser()`.
- `focus-trap` — `UFocusTrap` (`[uFocusTrap]`), traps `Tab`/`Shift+Tab` within the host element's focusable descendants (resolved via `@ultimate/uix-utils/dom`'s `getFocusableElements`), wrapping from last back to first and vice versa. Disabled via the `uFocusTrapDisabled` input.
- `config` — `UltimateConfig`, a minimal `providedIn: 'root'` singleton with two signals: `unstyled` (CSS-free mode, default `false`) and `ripple` (ripple-effect toggle, default `true`). Not a port of PrimeNG's much larger config surface — that remains a deferred architecture decision.
- `bind` — `UBind` (`[uBind]`), applies dynamic attributes/properties/event-listeners from a bound `Record<string, unknown>` to its host element via `Renderer2`. Foundation infrastructure only in Phase 2 — no shipped component wires it in directly. No sanitization of keys/values is performed (inherited unchanged from PrimeNG's own `Bind`, an accepted risk documented in `bind.spec.ts`, not a defect).
- `icons` — `UBaseIcon` (shared `label`/`spin` inputs) plus four standalone icon components: `USpinnerIcon` (`u-spinner-icon`), `UTimesIcon` (`u-times-icon`), `UWindowMaximizeIcon` (`u-window-maximize-icon`), `UWindowMinimizeIcon` (`u-window-minimize-icon`). Each is an element-selector component (not an attribute directive like PrimeNG's `[data-p-icon]`) rendering its own inline `<svg role="img" [attr.aria-label]="label()">`, so every icon is accessible without the consumer wiring ARIA attributes themselves — a deliberate departure from PrimeNG's own icon shape, which leaves accessibility to the consumer.
- `api` — shared type definitions consumed by `@ultimate/ng` components: `UMenuItem` (an 8-field subset of PrimeNG's `MenuItem` — `label`, `icon`, `routerLink`, `command`, `items`, `separator`, `disabled`, `tooltip` — used by `UMenu`; `tooltip` is Ultimate-specific, opt-in per item, not present on PrimeNG's own `MenuItem`) and `UTooltipOptions` (a 3-field subset of PrimeNG's `TooltipOptions` — `value`, `position`, `disabled` — used by `UTooltip`).

## Usage

```typescript
import { UBaseComponent } from "@ultimate/ng-core";

@Component({
  standalone: true,
  selector: "u-example",
  template: `<div [class]="cx('root')"></div>`,
})
class ExampleComponent extends UBaseComponent {
  protected override readonly componentName = "example";
  protected override readonly styleModule = {
    css: ".u-example-root { }",
    classes: { root: () => "u-example-root" },
  };
}
```

## Dependencies

Depends on `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, `@ultimate/uix-styles` (workspace), and `tslib`. Peers on `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`, and `rxjs`.
