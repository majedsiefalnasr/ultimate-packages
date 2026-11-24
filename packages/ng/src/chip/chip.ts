import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, UBind, UTimesIcon, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { chipStyleModule } from "./chip-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Chip` component (see
 * `.vendor-extracted/ng/chip/chip.ts`). Represents people/items using a
 * text `label`, an `icon`, or an `image`, with an optional removable
 * close control.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`. The root section is
 * bound through the `UBind` host directive, the component provides itself as
 * `U_PARENT_INSTANCE`, and each part (`image`, `icon`, `label`,
 * `removeIcon`) binds its own `pt` section. The remove glyph can be replaced
 * by a font class (`removeIcon`) or an `<ng-template #removeicon>`.
 *
 * Deliberately excludes real source's `chipProps` bulk-setter input and its
 * `TimesCircleIcon` default glyph (`UTimesIcon` is used instead); both are
 * recorded in ADR-098. A removed chip is hidden with `display: none` on the
 * host, as in PrimeNG, so no empty pill stays on screen.
 */
@Component({
  standalone: true,
  selector: "u-chip",
  imports: [UTimesIcon, UBind, NgTemplateOutlet],
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UChip }],
  template: `
    @if (visible()) {
      <ng-content></ng-content>
      @if (image()) {
        <img
          [uBind]="ptm('image')"
          [class]="cx('image')"
          [src]="image()"
          [alt]="alt()"
          (error)="handleImageError($event)"
        />
      } @else if (icon()) {
        <span [uBind]="ptm('icon')" [class]="joinClass(cx('icon'), icon())"></span>
      }
      @if (label()) {
        <div [uBind]="ptm('label')" [class]="cx('label')">{{ label() }}</div>
      }
      @if (removable()) {
        <span
          [uBind]="ptm('removeIcon')"
          [class]="joinClass(cx('removeIcon'), removeIcon())"
          role="button"
          [attr.tabindex]="disabled() ? -1 : 0"
          [attr.aria-label]="removeAriaLabel()"
          (click)="close($event)"
          (keydown)="onKeydown($event)"
        >
          @if (removeIconTemplate(); as template) {
            <ng-container [ngTemplateOutlet]="template"></ng-container>
          } @else if (!removeIcon()) {
            <u-times-icon />
          }
        </span>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { disabled: disabled() })",
    "[attr.aria-label]": "label()",
    "[attr.data-p]": "dataP()",
    "[style.display]": "visible() ? null : 'none'",
  },
  hostDirectives: [UBind],
})
export class UChip extends UBaseComponent {
  protected override readonly componentName = "chip";
  protected override readonly styleModule = chipStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

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
  /** Accessible label for the remove control. Defaults to the English "Remove". */
  removeAriaLabel = input<string>("Remove");
  /** Font icon class that replaces the default remove glyph. */
  removeIcon = input<string>();

  /** Template that replaces the remove glyph, written as `<ng-template #removeicon>`. */
  protected readonly removeIconTemplate = contentChild<TemplateRef<unknown>>("removeicon");

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

  protected readonly dataP = computed(() => (this.removable() ? "removable" : null));

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  protected joinClass(...names: Array<string | undefined>): string {
    return names.filter(Boolean).join(" ");
  }

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
