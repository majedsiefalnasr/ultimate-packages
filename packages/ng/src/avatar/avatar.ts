import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { avatarStyleModule } from "./avatar-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Avatar` component (see
 * `.vendor-extracted/ng/avatar/avatar.ts`). Represents people using icons,
 * labels, or images — renders an image when `image` is set (falling back to
 * `label`/`icon` on load error, matching real source's own
 * `imageError`/label-icon-fallback branching), else a text `label`, else an
 * `icon`.
 *
 * Deliberately excludes PrimeNG's passthrough (`pt`/`ptm`/`Bind`) system,
 * `$pcAvatar`/`AVATAR_INSTANCE` parent-lookup injection (no attribute-
 * directive/nesting-aware variant here — same exclusion `UBadge` already
 * applied), and `styleClass`/`ariaLabelledBy` inputs — none of these appear
 * in this task's spec-mandated surface.
 */
@Component({
  standalone: true,
  selector: "u-avatar",
  template: `
    @if (image() && !imageFailed()) {
      <img [src]="image()" (error)="onImgError($event)" [attr.aria-label]="ariaLabel()" />
    } @else if (label()) {
      <span [class]="cx('label')">{{ label() }}</span>
    } @else if (icon()) {
      <span [class]="icon() + ' ' + cx('icon')"></span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class UAvatar extends UBaseComponent {
  protected override readonly componentName = "avatar";
  protected override readonly styleModule = avatarStyleModule;

  /** Defines the text to display. */
  label = input<string>();
  /** Defines the icon to display. */
  icon = input<string>();
  /** Defines the image to display. */
  image = input<string>();
  /** Size of the element. */
  size = input<"normal" | "large" | "xlarge">("normal");
  /** Shape of the element. */
  shape = input<"square" | "circle">("square");
  /** Establishes a string value that labels the component. */
  ariaLabel = input<string>();

  /** This event is triggered if an error occurs while loading an image file. */
  onImageError = output<Event>();

  protected readonly imageFailed = signal(false);

  protected classesParams() {
    return {
      hasImage: !!this.image(),
      imageFailed: this.imageFailed(),
      shape: this.shape(),
      size: this.size(),
    };
  }

  protected onImgError(event: Event): void {
    this.imageFailed.set(true);
    this.onImageError.emit(event);
  }
}
