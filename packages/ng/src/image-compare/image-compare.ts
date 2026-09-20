import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  input,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { imageCompareStyleModule } from "./image-compare-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ImageCompare` component (see
 * `.vendor-extracted/ng/imagecompare/imagecompare.ts`). Compares two
 * images side by side with a slider: a `left` content-projection slot
 * renders the base image, a `right` slot renders the overlay image
 * clipped by a native `<input type="range">` slider — matching real
 * source's own left/right template-slot + range-input structural shape.
 *
 * Deliberately excludes real source's RTL `MutationObserver` direction
 * auto-detection (`dir="rtl"` ancestor watching) — this port always
 * clips left-to-right, same "smaller surface than upstream" precedent as
 * every sibling component. Uses a `@ViewChild` reference to the "right"
 * wrapper element instead of real source's `event.target.previousElementSibling`
 * DOM traversal, since Angular's `ng-content` slot order isn't guaranteed
 * to place the clipped image as the slider's literal previous sibling.
 *
 * Real source relies entirely on PrimeNG's theme CSS for the absolute
 * positioning that makes the "right" image visually overlay the "left"
 * one — no such theme package exists here (ADR-004: no Prime runtime
 * dependency), so this port's own `imageCompareStyleModule` includes the
 * minimum layout CSS (`position: absolute` on the right-side wrapper)
 * needed for the compare effect to render correctly, authored locally
 * rather than a silent visual regression.
 */
@Component({
  standalone: true,
  selector: "u-image-compare",
  template: `
    <ng-content select="[left]"></ng-content>
    <span #right><ng-content select="[right]"></ng-content></span>
    <input
      type="range"
      min="0"
      max="100"
      value="50"
      [class]="cx('slider')"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      (input)="onSlide($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[attr.tabindex]": "tabindex()",
    "[attr.aria-labelledby]": "ariaLabelledby()",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class UImageCompare extends UBaseComponent {
  protected override readonly componentName = "image-compare";
  protected override readonly styleModule = imageCompareStyleModule;

  /** Index of the element in tabbing order. */
  tabindex = input<number>();
  /** Defines a string value that labels an interactive element. */
  ariaLabelledby = input<string>();
  /** Identifier of the underlying input element. */
  ariaLabel = input<string>();

  @ViewChild("right", { static: true }) private rightRef!: ElementRef<HTMLElement>;

  protected onSlide(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.rightRef.nativeElement.style.clipPath = `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)`;
  }
}
