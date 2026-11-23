import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { iftaLabelStyleModule } from "./ifta-label-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `IftaLabel` (real source:
 * `iftalabel/iftalabel.ts`). IftaLabel creates infield top-aligned labels —
 * a label-position wrapper similar in shape to `UFloatLabel`, not a form
 * control itself.
 *
 * Real source extends bare `BaseComponent<IftaLabelPassThrough>` — no
 * CVA/controlled-value concept and, unlike `FloatLabel`, no `variant` input
 * either: real `IftaLabel` has a single fixed infield-top-aligned label
 * position, only `<ng-content>` projection. The label-position trigger is
 * pure CSS (`:has()` selectors against the projected input's focus/invalid
 * state), matching `UFloatLabel`'s own precedent exactly.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`; the root section is
 * bound through the `UBind` host directive, and the component provides
 * itself as `U_PARENT_INSTANCE`, as PrimeNG's `PARENT_INSTANCE` does. The
 * `IFTALABEL_INSTANCE` token that PrimeNG injects for a nested IftaLabel has
 * no consumer and is not provided (ADR-092).
 */
@Component({
  standalone: true,
  selector: "u-ifta-label",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UIftaLabel }],
  host: {
    "[class]": "cx('root')",
  },
  hostDirectives: [UBind],
})
export class UIftaLabel extends UBaseComponent {
  protected override readonly componentName = "iftalabel";
  protected override readonly styleModule = iftaLabelStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
