import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, UTimesIcon } from "@ultimate/ng-core";
import { chipStyleModule } from "./chip-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Chip` component (see
 * `.vendor-extracted/ng/chip/chip.ts`). Represents people/items using a
 * text `label`, an `icon`, or an `image`, with an optional removable
 * close control — matching real source's own label/icon/image/removable
 * structural shape.
 *
 * Deliberately excludes real source's `chipProps` bulk-setter input, its
 * `p-header`/custom `removeicon` `<ng-template>` override, and its
 * `TimesCircleIcon` remove glyph (no such icon exists yet in
 * `@ultimate/ng-core`'s icon set — `UTimesIcon` is used instead, same
 * "smaller surface than upstream" precedent as every sibling component).
 * `visible`/remove-on-click is implemented as a signal-driven `*ngIf`
 * matching real source's own boolean field, not exposed as a bindable
 * input (real source doesn't expose it as one either).
 */
@Component({
  standalone: true,
  selector: "u-chip",
  imports: [UTimesIcon],
  template: `
    @if (visible()) {
      <ng-content></ng-content>
      @if (image()) {
        <img [class]="cx('image')" [src]="image()" [alt]="alt()" (error)="handleImageError($event)" />
      } @else if (icon()) {
        <span [class]="cx('icon') + ' ' + icon()"></span>
      }
      @if (label()) {
        <div [class]="cx('label')">{{ label() }}</div>
      }
      @if (removable()) {
        <span
          [class]="cx('removeIcon')"
          role="button"
          [attr.tabindex]="disabled() ? -1 : 0"
          [attr.aria-label]="removeAriaLabel()"
          (click)="close($event)"
          (keydown)="onKeydown($event)"
        >
          <u-times-icon />
        </span>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[attr.aria-label]": "label()",
  },
})
export class UChip extends UBaseComponent {
  protected override readonly componentName = "chip";
  protected override readonly styleModule = chipStyleModule;

  /** Text to display. */
  label = input<string>();
  /** Icon class to display. */
  icon = input<string>();
  /** Image source to display. */
  image = input<string>();
  /** Alt attribute of the image. */
  alt = input<string>();
  /** Whether the chip is disabled. */
  disabled = input(false, { transform: booleanAttribute });
  /** Whether a remove icon is displayed. */
  removable = input(false, { transform: booleanAttribute });
  /** Accessible label for the remove control. */
  removeAriaLabel = input<string>();

  /** Emitted when the chip is removed. */
  onRemove = output<MouseEvent>();
  /** Emitted when the image fails to load. */
  onImageError = output<Event>();

  /**
   * Internal display flag. Not exposed as an input/output pair — matching
   * real source's own non-bindable `visible: boolean` field, which a
   * removed chip never re-shows.
   */
  protected readonly visible = signal(true);

  protected close(event: MouseEvent): void {
    if (this.disabled()) return;
    this.visible.set(false);
    this.onRemove.emit(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === "Backspace") {
      this.close(event as unknown as MouseEvent);
    }
  }

  protected handleImageError(event: Event): void {
    this.onImageError.emit(event);
  }
}
