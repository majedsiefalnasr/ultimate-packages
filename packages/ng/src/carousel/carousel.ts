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
import { UBaseComponent } from "@ultimate/ng-core";
import { carouselStyleModule } from "./carousel-style";

/** Template context for `UCarousel`'s `#item` template. */
export interface UCarouselItemContext<T = unknown> {
  $implicit: T;
}

/** Emitted after the active page changes. */
export interface UCarouselPageEvent {
  page: number;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Carousel` component (see
 * `.vendor-extracted/ng/carousel/carousel.ts`). Confirmed against real
 * source: Carousel's real interaction structure is index/page-based
 * sliding via a CSS `transform: translate3d(...)` on an item-list
 * container, a `page`/`_page` state driving which slice of `value` is
 * visible, `numVisible`/`numScroll` window sizing, prev/next navigation
 * buttons, clickable indicator dots (one per page), and an optional
 * `autoplayInterval`-driven `setInterval` timer that advances `step(-1,
 * ...)` on each tick — real source additionally does DOM item-cloning
 * (`clonedItemsForStarting`/`clonedItemsForFinishing`) to fake a seamless
 * infinite-loop illusion during the CSS transition, dynamic per-instance
 * `<style>` injection for `responsiveOptions` breakpoints, and touch/swipe
 * gesture handling — none of these appear in this task's spec-mandated
 * surface (proof-by-exception: Carousel's real structure is genuinely more
 * complex than a flat display component, as anticipated, but resolves
 * within already-established patterns — reactive state + `setInterval`,
 * the same shape `UContextMenu`'s own internal timers/listeners already
 * use — not a new architectural pattern; item-cloning/dynamic-`<style>`/
 * touch-swipe are excluded as "smaller surface than upstream", the same
 * precedent as every sibling component). Circular wraparound is
 * implemented via index math (`(page + totalPages) % totalPages`) instead
 * of real source's clone-and-transform illusion — functionally equivalent
 * (wraps at both ends, matching real source's own `circular` contract) but
 * without the DOM-cloning implementation detail.
 */
@Component({
  standalone: true,
  selector: "u-carousel",
  imports: [CommonModule],
  template: `
    <div [class]="cx('content')">
      <div [class]="cx('contentInner')">
        @if (showNavigators()) {
          <button
            type="button"
            [class]="cx('prevButton')"
            [attr.aria-label]="'Previous'"
            [disabled]="isBackwardDisabled()"
            (click)="navBackward()"
          >
            ‹
          </button>
        }
        <div [class]="cx('viewport')">
          <div
            [class]="cx('itemList')"
            [style.transform]="translateStyle()"
          >
            @for (item of value(); track $index) {
              <div [class]="cx('item')" [style.flex]="itemFlexBasis()" role="group" [attr.aria-hidden]="!isItemVisible($index)">
                <ng-container *ngTemplateOutlet="itemTemplate ?? null; context: { $implicit: item }"></ng-container>
              </div>
            }
          </div>
        </div>
        @if (showNavigators()) {
          <button
            type="button"
            [class]="cx('nextButton')"
            [attr.aria-label]="'Next'"
            [disabled]="isForwardDisabled()"
            (click)="navForward()"
          >
            ›
          </button>
        }
      </div>
      @if (showIndicators()) {
        <ul [class]="cx('indicatorList')">
          @for (dot of totalDotsArray(); track $index) {
            <li [class]="cx('indicator', { active: $index === page() })" [attr.data-p-active]="$index === page()">
              <button
                type="button"
                [class]="cx('indicatorButton')"
                [attr.aria-label]="'Page ' + ($index + 1)"
                [attr.aria-current]="$index === page() ? 'page' : null"
                (click)="goToPage($index)"
              ></button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { vertical: isVertical() })",
    "[attr.role]": "'region'",
  },
})
export class UCarousel<T = unknown> extends UBaseComponent {
  protected override readonly componentName = "carousel";
  protected override readonly styleModule = carouselStyleModule;

  /** An array of objects to display. */
  value = input<T[]>([]);
  /** Number of items per page. */
  numVisible = input(1, { transform: numberAttribute });
  /** Number of items to scroll. */
  numScroll = input(1, { transform: numberAttribute });
  /** Defines if scrolling would be infinite. */
  circular = input(false, { transform: booleanAttribute });
  /** Whether to display indicator container. */
  showIndicators = input(true, { transform: booleanAttribute });
  /** Whether to display navigation buttons in container. */
  showNavigators = input(true, { transform: booleanAttribute });
  /** Time in milliseconds to scroll items automatically. Zero disables autoplay. */
  autoplayInterval = input(0, { transform: numberAttribute });
  /** Specifies the layout of the component. */
  orientation = input<"horizontal" | "vertical">("horizontal");

  /** Callback to invoke after scroll. */
  onPage = output<UCarouselPageEvent>();

  /** Consumer-supplied per-item template, rendered with `{ $implicit: item }` context. */
  @ContentChild("item", { descendants: false })
  protected itemTemplate?: TemplateRef<UCarouselItemContext<T>>;

  protected readonly page = signal(0);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  protected readonly isVertical = computed(() => this.orientation() === "vertical");

  protected readonly totalPages = computed(() => {
    const length = this.value().length;
    if (length === 0) return 0;
    return Math.ceil((length - this.numVisible()) / this.numScroll()) + 1;
  });

  protected readonly totalDotsArray = computed(() =>
    Array.from({ length: Math.max(this.totalPages(), 0) })
  );

  protected readonly itemFlexBasis = computed(() => `0 0 ${100 / this.numVisible()}%`);

  protected readonly translateStyle = computed(() => {
    const shift = this.page() * this.numScroll() * (100 / this.numVisible());
    return this.isVertical()
      ? `translate3d(0, -${shift}%, 0)`
      : `translate3d(-${shift}%, 0, 0)`;
  });

  protected isItemVisible(index: number): boolean {
    const first = this.page() * this.numScroll();
    const last = first + this.numVisible() - 1;
    return index >= first && index <= last;
  }

  protected isForwardDisabled(): boolean {
    return this.value().length === 0 || (this.page() >= this.totalPages() - 1 && !this.circular());
  }

  protected isBackwardDisabled(): boolean {
    return this.value().length === 0 || (this.page() <= 0 && !this.circular());
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

  /** Advances to the next page, wrapping to the first page when circular. */
  navForward(): void {
    const total = this.totalPages();
    if (total === 0) return;
    if (this.page() < total - 1) {
      this.goToPage(this.page() + 1);
    } else if (this.circular()) {
      this.goToPage(0);
    }
    this.stopAutoplay();
  }

  /** Returns to the previous page, wrapping to the last page when circular. */
  navBackward(): void {
    const total = this.totalPages();
    if (total === 0) return;
    if (this.page() > 0) {
      this.goToPage(this.page() - 1);
    } else if (this.circular()) {
      this.goToPage(total - 1);
    }
    this.stopAutoplay();
  }

  /** Jumps directly to the given page index. */
  goToPage(index: number): void {
    const total = this.totalPages();
    if (total === 0 || index < 0 || index >= total || index === this.page()) {
      return;
    }
    this.page.set(index);
    this.onPage.emit({ page: index });
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.intervalId = setInterval(() => {
      const total = this.totalPages();
      if (total === 0) return;
      const next = this.page() >= total - 1 ? 0 : this.page() + 1;
      this.goToPage(next);
    }, this.autoplayInterval());
  }

  private stopAutoplay(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
