import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, UFocusTrap, UOverlay, UTimesIcon } from "@ultimate/ng-core";
import { galleriaStyleModule } from "./galleria-style";

/** Template context for `UGalleria`'s `#item` and `#thumbnail` templates. */
export interface UGalleriaItemContext<T = unknown> {
  $implicit: T;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Galleria` component (see
 * `.vendor-extracted/ng/galleria/galleria.ts`). Confirmed against real
 * source: real Galleria is genuinely a multi-component family
 * (`Galleria`/`GalleriaContent`/`GalleriaItemSlot`/`GalleriaItem`/
 * `GalleriaThumbnails`, ~1700 lines combined) with `responsiveOptions`-
 * driven dynamic `<style>` breakpoint injection, touch/swipe gesture
 * handling on the thumbnail strip, a separate indicator-dot facet distinct
 * from thumbnails, and a `p-portal`-teleported fullscreen mask with its
 * own enter/leave motion.
 *
 * Per this batch's established Carousel precedent (same "genuinely more
 * complex than a flat display component" finding, resolved the same way):
 * this port reduces the family to a single component with a main-item
 * viewport (prev/next navigation, matching `UCarousel`'s own index-math
 * circular-wraparound approach instead of real source's item-cloning
 * illusion), an optional click-to-select thumbnail strip, and an optional
 * `autoplayInterval`-driven `setInterval` timer — the same reactive-state
 * + `setInterval` shape `UCarousel`/`UContextMenu` already use, not a new
 * architectural pattern. Deliberately excludes: `responsiveOptions`/
 * dynamic `<style>` injection, touch/swipe gestures, separate indicator
 * dots (thumbnails serve as the sole position indicator here), and
 * per-item caption templates — same "smaller surface than upstream"
 * precedent as every sibling component (Carousel/Fieldset).
 *
 * Fullscreen mode composes `UOverlay`+`UFocusTrap` directly, mirroring
 * `UImage`'s own established overlay wiring in this same sub-batch —
 * simple `appendTo="body"` mask, no motion, no Escape-registry priority
 * (fullscreen toggle is a local boolean, not a stacked overlay requiring
 * cross-instance Escape-priority arbitration, unlike Dialog/Image's modal
 * preview).
 */
@Component({
  standalone: true,
  selector: "u-galleria",
  imports: [CommonModule, UOverlay, UFocusTrap, UTimesIcon],
  template: `
    @if (!(fullScreen() && fullScreenActive())) {
      <div [class]="cx('root')" role="region">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </div>
    }
    @if (fullScreen() && fullScreenActive()) {
      <div uOverlay [visible]="true" appendTo="body" [class]="cx('mask')" role="dialog">
        <div uFocusTrap style="width: 100%; height: 100%; display: flex; flex-direction: column;">
          <button type="button" [class]="cx('closeButton')" (click)="closeFullScreen()" aria-label="Close">
            <u-times-icon />
          </button>
          <ng-container *ngTemplateOutlet="content"></ng-container>
        </div>
      </div>
    }

    <ng-template #content>
      <div [class]="cx('itemWrapper')" data-u-galleria-content tabindex="-1" (keydown)="onContentKeyDown($event)">
        @if (showItemNavigators() && value().length > 1) {
          <button
            type="button"
            [class]="cx('prevButton')"
            [disabled]="isBackwardDisabled()"
            (click)="navBackward()"
            aria-label="Previous"
          >
            ‹
          </button>
        }
        <div [class]="cx('itemContainer')">
          @if (activeItem() !== undefined) {
            <ng-container *ngTemplateOutlet="itemTemplate ?? null; context: { $implicit: activeItem() }"></ng-container>
          }
        </div>
        @if (showItemNavigators() && value().length > 1) {
          <button
            type="button"
            [class]="cx('nextButton')"
            [disabled]="isForwardDisabled()"
            (click)="navForward()"
            aria-label="Next"
          >
            ›
          </button>
        }
      </div>
      @if (showThumbnails() && value().length > 1) {
        <ul [class]="cx('thumbnailList')">
          @for (item of value(); track $index) {
            <li
              [class]="cx('thumbnailItem', { active: $index === activeIndex() })"
              [attr.aria-current]="$index === activeIndex() ? 'true' : null"
              role="button"
              tabindex="0"
              (click)="goTo($index)"
              (keydown)="onThumbnailKeyDown($event, $index)"
            >
              <ng-container *ngTemplateOutlet="thumbnailTemplate ?? itemTemplate ?? null; context: { $implicit: item }"></ng-container>
            </li>
          }
        </ul>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UGalleria<T = unknown> extends UBaseComponent {
  protected override readonly componentName = "galleria";
  protected override readonly styleModule = galleriaStyleModule;

  /** An array of items to display. */
  value = input<T[]>([]);
  /** Index of the initial active item. */
  activeIndexInput = input(0, { alias: "activeIndex", transform: numberAttribute });
  /** Whether to display navigation buttons for the active item. */
  showItemNavigators = input(true, { transform: booleanAttribute });
  /** Whether to display the thumbnail strip. */
  showThumbnails = input(true, { transform: booleanAttribute });
  /** Defines if scrolling would be infinite. */
  circular = input(false, { transform: booleanAttribute });
  /** Time in milliseconds to scroll items automatically. Zero disables autoplay. */
  autoplayInterval = input(0, { transform: numberAttribute });
  /** When enabled, renders the Galleria as a fullscreen-toggleable overlay. */
  fullScreen = input(false, { transform: booleanAttribute });

  /** Emits when the active index changes. */
  activeIndexChange = output<number>();

  /** Consumer-supplied per-item template, rendered with `{ $implicit: item }` context. */
  @ContentChild("item", { descendants: false })
  protected itemTemplate?: TemplateRef<UGalleriaItemContext<T>>;

  /** Consumer-supplied thumbnail template. Falls back to `#item` when omitted. */
  @ContentChild("thumbnail", { descendants: false })
  protected thumbnailTemplate?: TemplateRef<UGalleriaItemContext<T>>;

  /** The currently active item index. Publicly readable for consumers/tests observing navigation state. */
  readonly activeIndex = signal(0);
  /** Whether the fullscreen overlay is currently open. Publicly readable for consumers/tests observing overlay state. */
  readonly fullScreenActive = signal(false);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  protected readonly activeItem = computed<T | undefined>(() => this.value()[this.activeIndex()]);

  protected isForwardDisabled(): boolean {
    return this.value().length === 0 || (this.activeIndex() >= this.value().length - 1 && !this.circular());
  }

  protected isBackwardDisabled(): boolean {
    return this.value().length === 0 || (this.activeIndex() <= 0 && !this.circular());
  }

  constructor() {
    super();
    this.activeIndex.set(this.activeIndexInput());
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.autoplayInterval() > 0) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  /** Advances to the next item, wrapping to the first when circular. */
  protected navForward(): void {
    const total = this.value().length;
    if (total === 0) return;
    if (this.activeIndex() < total - 1) {
      this.goTo(this.activeIndex() + 1);
    } else if (this.circular()) {
      this.goTo(0);
    }
    this.stopAutoplay();
  }

  /** Returns to the previous item, wrapping to the last when circular. */
  protected navBackward(): void {
    const total = this.value().length;
    if (total === 0) return;
    if (this.activeIndex() > 0) {
      this.goTo(this.activeIndex() - 1);
    } else if (this.circular()) {
      this.goTo(total - 1);
    }
    this.stopAutoplay();
  }

  /** Jumps directly to the given item index. */
  protected goTo(index: number): void {
    const total = this.value().length;
    if (total === 0 || index < 0 || index >= total || index === this.activeIndex()) {
      return;
    }
    this.activeIndex.set(index);
    this.activeIndexChange.emit(index);
  }

  /**
   * Handles keyboard navigation on the content viewport: `ArrowLeft`/`ArrowRight` move to the
   * previous/next item, `Home`/`End` jump to the first/last item, and `Escape` closes the
   * fullscreen overlay when active (no-op otherwise). Ignored when the event originates from a
   * focused editable descendant (e.g. an `<input>` inside a custom item template) so typing in
   * projected content never triggers gallery navigation.
   */
  protected onContentKeyDown(event: KeyboardEvent): void {
    if (this.isEditableTarget(event.target)) {
      return;
    }
    switch (event.code) {
      case "ArrowLeft":
        event.preventDefault();
        this.navBackward();
        break;
      case "ArrowRight":
        event.preventDefault();
        this.navForward();
        break;
      case "Home":
        event.preventDefault();
        this.goTo(0);
        break;
      case "End":
        event.preventDefault();
        this.goTo(this.value().length - 1);
        break;
      case "Escape":
        if (this.fullScreenActive()) {
          event.preventDefault();
          this.closeFullScreen();
        }
        break;
      default:
        break;
    }
  }

  /**
   * Handles Enter/Space on a focused thumbnail: activates it the same way the existing click
   * handler does (Spec §5.1, GAP-050 Task 7). No-op for any other key.
   */
  protected onThumbnailKeyDown(event: KeyboardEvent, index: number): void {
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      this.goTo(index);
    }
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    const tagName = target.tagName;
    return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
  }

  /** Opens the fullscreen overlay (only meaningful when `fullScreen` is true). */
  openFullScreen(): void {
    if (this.fullScreen()) this.fullScreenActive.set(true);
  }

  /** Closes the fullscreen overlay. */
  closeFullScreen(): void {
    this.fullScreenActive.set(false);
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.intervalId = setInterval(() => {
      const total = this.value().length;
      if (total === 0) return;
      const next = this.activeIndex() >= total - 1 ? 0 : this.activeIndex() + 1;
      this.goTo(next);
    }, this.autoplayInterval());
  }

  private stopAutoplay(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
