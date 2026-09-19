import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `StepList` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). Pure content-projection
 * wrapper for a horizontal row of `UStep` (or `UStepItem`) children — no
 * state of its own.
 */
@Component({
  standalone: true,
  selector: "u-step-list",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepListRoot')",
  },
})
export class UStepList extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;
}
