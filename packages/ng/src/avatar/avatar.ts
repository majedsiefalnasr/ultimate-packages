import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
  output,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { avatarStyleModule } from "./avatar-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Avatar` component (see
 * `.vendor-extracted/ng/avatar/avatar.ts`). Represents people using icons,
 * labels, or images. Like PrimeNG, projected content comes first, then the
 * `label`, else the `icon`, else the `image`; a failed image only emits
 * `onImageError` (ADR-087).
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`: the host and root
 * sections are bound through the `UBind` host directive, and the `label`,
 * `icon` and `image` sections on their elements. `styleClass` is not offered;
 * the host takes a normal `class`.
 */
@Component({
  standalone: true,
  selector: "u-avatar",
  imports: [UBind],
  template: `
    <ng-content></ng-content>
    @if (label()) {
      <span [uBind]="ptm('label')" [class]="cx('label')">{{ label() }}</span>
    } @else if (icon()) {
      <span [uBind]="ptm('icon')" [class]="iconClass()"></span>
    } @else if (image()) {
      <img
        [uBind]="ptm('image')"
        [src]="image()"
        (error)="onImgError($event)"
        [attr.aria-label]="ariaLabel()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UAvatar }],
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.aria-label]": "ariaLabel()",
  },
  hostDirectives: [UBind],
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

  private readonly bindDirective = inject(UBind, { self: true });

  protected classesParams() {
    return {
      hasImage: !!this.image(),
      shape: this.shape(),
      size: this.size(),
    };
  }

  protected iconClass(): string {
    return [this.icon(), this.cx("icon")].filter(Boolean).join(" ");
  }

  protected onImgError(event: Event): void {
    this.onImageError.emit(event);
  }

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
