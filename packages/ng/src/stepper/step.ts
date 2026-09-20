import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UStepper } from "./stepper";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Step` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). A single step header
 * (number + title) inside `UStepList`; clicking it (when not disabled)
 * activates the matching `UStepPanel`. `linear` mode disables every
 * non-active step, matching real PrimeNG's own `isStepDisabled` on `Step`.
 */
@Component({
  standalone: true,
  selector: "u-step",
  template: `
    <button
      type="button"
      [class]="cx('stepHeader')"
      [disabled]="isStepDisabled()"
      [attr.tabindex]="isStepDisabled() ? -1 : undefined"
      (click)="onStepClick()"
    >
      <span [class]="cx('stepNumber')">{{ value() }}</span>
      <span [class]="cx('stepTitle')"><ng-content></ng-content></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepRoot', { active: active(), disabled: isStepDisabled() })",
    role: "presentation",
    "[attr.aria-current]": "active() ? 'step' : null",
    "[attr.data-u-active]": "active()",
    "[attr.data-u-disabled]": "isStepDisabled()",
  },
})
export class UStep extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;

  private readonly pcStepper = inject(UStepper);

  /** Value of this step — must match a `UStepPanel`'s own `value` to link them. */
  value = input.required<number>();
  /** Whether this step is explicitly disabled. */
  disabled = input(false, { transform: booleanAttribute });

  protected readonly active = computed(() => this.pcStepper.isStepActive(this.value()));
  protected readonly isStepDisabled = computed(() => !this.active() && (this.pcStepper.linear() || this.disabled()));

  protected onStepClick(): void {
    this.pcStepper.updateValue(this.value());
  }
}
