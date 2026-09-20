import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { skeletonStyleModule } from "./skeleton-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Skeleton` component (see
 * `.vendor-extracted/ng/skeleton/skeleton.ts`). Confirmed against real
 * source: extends the bare `BaseComponent` tier (no CVA) — a pure
 * placeholder/display component with an empty template, sized via inline
 * `width`/`height`/`size`/`borderRadius` styles and an `animation`
 * (`"wave" | "none"`)/`shape` (`"rectangle" | "circle"`) class toggle.
 *
 * This port keeps that same shape/animation/sizing behavior. Deliberately
 * excludes real source's `styleClass` deprecated-input passthrough (this
 * port's `class` binding on the host element already covers that use case,
 * matching every sibling component's established precedent).
 */
@Component({
  standalone: true,
  selector: "u-skeleton",
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { shape: shape(), animation: animation() })",
    "[style]": "containerStyle()",
    "[attr.aria-hidden]": "true",
  },
})
export class USkeleton extends UBaseComponent {
  protected override readonly componentName = "skeleton";
  protected override readonly styleModule = skeletonStyleModule;

  /** Shape of the element: `"rectangle"` or `"circle"`. */
  shape = input<"rectangle" | "circle">("rectangle");
  /** Type of the animation: `"wave"` or `"none"`. */
  animation = input<"wave" | "none">("wave");
  /** Border radius of the element; defaults to the theme's own value when unset. */
  borderRadius = input<string>();
  /** When set, used for both width and height (produces a square/circle). */
  size = input<string>();
  /** Width of the element. */
  width = input<string>("100%");
  /** Height of the element. */
  height = input<string>("1rem");

  protected readonly containerStyle = computed(() => {
    const size = this.size();
    const borderRadius = this.borderRadius();
    if (size) {
      return { width: size, height: size, borderRadius };
    }
    return { width: this.width(), height: this.height(), borderRadius };
  });
}
