import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `StepperSeparator` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). A purely visual connector
 * line rendered between consecutive `UStep`/`UStepPanel` entries.
 */
@Component({
  standalone: true,
  selector: "u-stepper-separator",
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepperSeparator')",
    "aria-hidden": "true",
  },
})
export class UStepperSeparator extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;
}
