import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UStepper } from "./stepper";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `StepItem` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). Groups one `UStep` with its
 * corresponding `UStepPanel` for the vertical-orientation layout (a
 * `UStep`/`UStepPanel` pair rendered together per step, rather than all
 * headers in one `UStepList` and all panels in one `UStepPanels`).
 */
@Component({
  standalone: true,
  selector: "u-step-item",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepItemRoot', { active: isActive() })",
    "[attr.data-u-active]": "isActive()",
  },
})
export class UStepItem extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;

  private readonly pcStepper = inject(UStepper);

  /** Value of this step item. */
  value = input.required<number>();

  protected readonly isActive = computed(() => this.pcStepper.value() === this.value());
}
