import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { iftaLabelStyleModule } from "./ifta-label-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `IftaLabel` (see
 * `.vendor-extracted/ng/iftalabel/iftalabel.ts`, extracted this session via
 * `scripts/provenance/extract-primeng-source.mjs`). IftaLabel creates
 * infield top-aligned labels — a label-position wrapper similar in shape to
 * `UFloatLabel`, not a form control itself.
 *
 * Real source extends bare `BaseComponent<IftaLabelPassThrough>` — no
 * CVA/controlled-value concept and, unlike `FloatLabel`, no `variant` input
 * either: real `IftaLabel` has a single fixed infield-top-aligned label
 * position, only `<ng-content>` projection. The label-position trigger is
 * pure CSS (`:has()` selectors against the projected input's focus/invalid
 * state), matching `UFloatLabel`'s own precedent exactly.
 */
@Component({
  standalone: true,
  selector: "u-ifta-label",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
})
export class UIftaLabel extends UBaseComponent {
  protected override readonly componentName = "iftalabel";
  protected override readonly styleModule = iftaLabelStyleModule;
}
