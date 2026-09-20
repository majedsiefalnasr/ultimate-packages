import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { progressSpinnerStyleModule } from "./progress-spinner-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ProgressSpinner` component (see
 * `.vendor-extracted/ng/progressspinner/progressspinner.ts`). Confirmed
 * against real source (all 3 frameworks): extends the bare `BaseComponent`
 * tier (no CVA) — a purely visual, indeterminate SVG-circle spinner with a
 * configurable stroke width, fill, and animation duration. No
 * determinate/indeterminate mode distinction exists in real source (unlike
 * `ProgressBar`) — it is always an indeterminate busy indicator.
 */
@Component({
  standalone: true,
  selector: "u-progress-spinner",
  template: `
    <svg [class]="cx('spin')" viewBox="25 25 50 50" [style.animation-duration]="animationDuration()">
      <circle [class]="cx('circle')" cx="50" cy="50" r="20" [attr.fill]="fill()" [attr.stroke-width]="strokeWidth()" stroke-miterlimit="10" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[attr.aria-label]": "ariaLabel()",
    role: "progressbar",
    "[attr.aria-busy]": "true",
    "[class]": "cx('root')",
  },
})
export class UProgressSpinner extends UBaseComponent {
  protected override readonly componentName = "progress-spinner";
  protected override readonly styleModule = progressSpinnerStyleModule;

  /** Width of the circle stroke. */
  strokeWidth = input("2");
  /** Color for the background of the circle. */
  fill = input("none");
  /** Duration of the rotate animation. */
  animationDuration = input("2s");
  /** Accessible label for the current element. */
  ariaLabel = input<string>();
}
