import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { floatLabelStyleModule } from "./float-label-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `FloatLabel` (real source:
 * `floatlabel/floatlabel.ts`). FloatLabel visually integrates a label with
 * its form element, floating the label above the input once it has content
 * or focus — a label-position wrapper, not a form control itself.
 *
 * It extends `UBaseComponent` directly: `FloatLabel` has no value or
 * `ControlValueAccessor` surface, only a `variant` input and projected
 * content. `pt`, `unstyled` and `dt` come from the base; the root section
 * is bound through the `UBind` host directive, and the component provides
 * itself as `U_PARENT_INSTANCE`, as PrimeNG's `PARENT_INSTANCE` does.
 *
 * The label-float trigger itself is pure CSS (`:has()` pseudo-class
 * selectors against `p-filled`, `:focus` and `[placeholder]` on the
 * projected input, see `@ultimate/uix-styles/floatlabel`). No JS-side focus
 * or content tracking exists, as in PrimeNG. The `FLOATLABEL_INSTANCE`
 * token that PrimeNG injects for a nested FloatLabel has no consumer and is
 * not provided (ADR-090).
 */
@Component({
  standalone: true,
  selector: "u-float-label",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UFloatLabel }],
  host: {
    "[class]": "cx('root', { variant: variant() })",
  },
  hostDirectives: [UBind],
})
export class UFloatLabel extends UBaseComponent {
  protected override readonly componentName = "floatlabel";
  protected override readonly styleModule = floatLabelStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Defines the positioning of the label relative to the input. */
  variant = input<"in" | "over" | "on">("over");

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
