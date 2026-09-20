import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { floatLabelStyleModule } from "./float-label-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `FloatLabel` (see
 * `.vendor-extracted/ng/floatlabel/floatlabel.ts`, extracted this session via
 * `scripts/provenance/extract-primeng-source.mjs`). FloatLabel visually
 * integrates a label with its form element, floating the label above the
 * input once it has content or focus — a label-position wrapper, not a form
 * control itself.
 *
 * Real source extends bare `BaseComponent<FloatLabelPassThrough>` (no
 * `ControlValueAccessor`/model-holder tier at all) — confirmed: `FloatLabel`
 * has no `value`/`ngModel`/CVA surface of its own, only a `variant` input
 * and `<ng-content>` projection. This realization follows suit: extends
 * `UBaseComponent` directly (the bare wrapper tier), matching this
 * package's own `UBadge` precedent for a display-only/layout primitive.
 *
 * The label-float trigger itself is pure CSS (`:has()` pseudo-class
 * selectors against `.u-filled`/`:focus`/`[placeholder]` on the projected
 * input — see `float-label-style.ts`), matching real source exactly: no
 * JS-side focus/content tracking exists in real `FloatLabel` at all.
 *
 * Deliberately excludes PrimeNG's `Bind`/passthrough `hostDirectives` wiring
 * and `FLOATLABEL_INSTANCE`/`PARENT_INSTANCE` injection-token parent lookup
 * — see `UBaseComponent`'s doc comment for the same architectural exclusion
 * pattern (Option B).
 */
@Component({
  standalone: true,
  selector: "u-float-label",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { variant: variant() })",
  },
})
export class UFloatLabel extends UBaseComponent {
  protected override readonly componentName = "float-label";
  protected override readonly styleModule = floatLabelStyleModule;

  /** Defines the positioning of the label relative to the input. */
  variant = input<"in" | "over" | "on">("over");
}
