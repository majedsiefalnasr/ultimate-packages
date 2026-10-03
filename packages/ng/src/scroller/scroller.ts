import { NgTemplateOutlet, isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";
import { scrollerStyleModule } from "./scroller-style";

/**
 * Context object dispatched to a consumer-supplied `#content` template via
 * `*ngTemplateOutlet`, mirroring real PrimeNG's own `getContentOptions()`
 * shape (`scroller.ts:1191-1210`/`1213-1224`).
 */
export interface UScrollerContentContext {
  $implicit: { index: number; value: unknown }[];
  options: {
    getItemOptions: (index: number) => {
      index: number;
      count: number;
      first: boolean;
      last: boolean;
      even: boolean;
      odd: boolean;
    };
    itemSize: number;
    loading: boolean;
  };
}

@Component({
  standalone: true,
  selector: "u-scroller",
  imports: [NgTemplateOutlet],
  template: `
    <div
      #element
      [class]="cx('root')"
      [attr.data-num-items-in-viewport]="numItemsInViewportComputed"
      [attr.data-last]="last"
      [attr.data-first]="first"
      [attr.aria-busy]="loading() ? 'true' : null"
      (scroll)="onScroll()"
    >
      @if (loading()) {
        <div [class]="cx('loader')">
          <span class="u-scroller-loading-icon"></span>
        </div>
      }
      <div
        data-u-scroller-content
        [class]="cx('content')"
        [style.height.px]="items().length * itemSize()"
      >
        @if (contentTemplate) {
          <ng-container
            *ngTemplateOutlet="
              contentTemplate;
              context: {
                $implicit: visibleItems(),
                options: {
                  getItemOptions: getItemOptions.bind(this),
                  itemSize: itemSize(),
                  loading: loading() ?? false,
                },
              }
            "
          ></ng-container>
        } @else {
          @for (item of visibleItems(); track item.index) {
            <div data-u-scroller-item [class]="cx('item')" [style.top.px]="item.index * itemSize()">
              {{ item.value }}
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UScroller extends UBaseComponent implements AfterViewInit, OnDestroy {
  protected override readonly componentName = "scroller";
  protected override readonly styleModule = scrollerStyleModule;

  items = input<unknown[]>([]);
  itemSize = input(0);
  numToleratedItems = input<number | undefined>(undefined);
  loading = input<boolean | undefined>(undefined);
  disabled = input(false);
  lazy = input(false);

  onLazyLoad = output<{ first: number; last: number }>();

  @ViewChild("element") private elementRef!: ElementRef<HTMLElement>;

  /**
   * Optional consumer-supplied content template (e.g. `UTable` supplying its
   * own `<table><tbody><tr><td>` markup instead of the built-in per-item
   * `<div>` rendering), mirroring real PrimeNG's own
   * `@ContentChild('content', {descendants: false})` + `ngTemplateOutlet`
   * composition mechanism exactly (scroller.ts:450). `descendants: false` is
   * load-bearing, not cosmetic: without it the query would match the first
   * `#content` template anywhere in the projected subtree, including one
   * belonging to a component a future consumer (e.g. `UTable`) nests inside
   * its own projected content — silently capturing the wrong template. When
   * absent, the built-in `@for` rendering runs unchanged.
   */
  @ContentChild("content", { descendants: false }) protected contentTemplate?: TemplateRef<UScrollerContentContext>;

  // Plain internal state per Global Constraints (no getter/setter, no
  // Change output). `_contentSize` is a signal rather than a bare field
  // specifically because this component is OnPush under Angular's
  // zoneless/signal-based change detection: a plain field mutated from the
  // ResizeObserver callback (an event outside Angular's tracked event/input
  // sources) would never cause the view to be re-checked — signals are the
  // documented mechanism (https://angular.dev/guide/zoneless) for notifying
  // an OnPush view of state changes that don't originate from a template
  // event or an @Input.
  private readonly _contentSize = signal(0);
  private _first = 0;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    // PrimeNG 21.1.9 scroller.ts:679-680 runs all view-init work only under
    // isPlatformBrowser; ngAfterViewInit also runs during server rendering,
    // where ResizeObserver and layout do not exist (GAP-080).
    if (!isPlatformBrowser(this.platformId)) return;
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeNG's elementViewChild.nativeElement.offsetHeight measurement
    // exactly (scroller.ts:854, pinned commit
    // c493b1c6d9f7cdffbe1c4dc195493dd73d733593), not the inner content
    // wrapper and not clientHeight.
    this._contentSize.set(this.elementRef.nativeElement.offsetHeight);
    this.resizeObserver = new ResizeObserver(() => {
      this._contentSize.set(this.elementRef.nativeElement.offsetHeight);
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  scrollTo(options: ScrollToOptions): void {
    this.elementRef.nativeElement.scrollTo(options);
  }

  scrollToIndex(index: number, behavior: ScrollBehavior = "auto"): void {
    this.scrollTo({ top: index * this.itemSize(), behavior });
  }

  protected onScroll(): void {
    const scrollTop = this.elementRef.nativeElement.scrollTop;
    const newFirst = Math.floor(scrollTop / (this.itemSize() || 1));
    if (newFirst !== this._first) {
      this._first = newFirst;
      if (this.lazy()) {
        const first = this._first;
        const last = this.last;
        Promise.resolve().then(() => {
          this.onLazyLoad.emit({ first, last });
        });
      }
    }
  }

  protected get first(): number {
    return this._first;
  }

  protected get numItemsInViewportComputed(): number {
    return calculateNumItemsInViewport(this._contentSize(), this.itemSize());
  }

  protected get resolvedNumToleratedItems(): number {
    const explicit = this.numToleratedItems();
    if (explicit !== undefined) {
      return explicit;
    }
    return Math.ceil(this.numItemsInViewportComputed / 2);
  }

  protected get last(): number {
    const rawLast = calculateLast(this._first, this.numItemsInViewportComputed, this.resolvedNumToleratedItems);
    return this.getLast(rawLast);
  }

  protected visibleItems(): { index: number; value: unknown }[] {
    const liveItems = this.items();
    if (this.disabled()) {
      return liveItems.map((value, index) => ({ index, value }));
    }
    const result: { index: number; value: unknown }[] = [];
    for (let i = this._first; i < this.last; i++) {
      result.push({ index: i, value: liveItems[i] });
    }
    return result;
  }

  /**
   * Per-item metadata dispatched to a consumer-supplied content template's
   * `options.getItemOptions(index)`, mirroring real PrimeNG's own
   * `getOptions(renderedIndex)` (`scroller.ts:1213-1224`). Real PrimeNG's
   * `index` accounts for the windowed offset (`this.first + renderedIndex`);
   * `visibleItems()` already returns absolute (not renderedIndex-relative)
   * indices, so `index` here is used directly with no offset arithmetic.
   */
  protected getItemOptions(index: number): {
    index: number;
    count: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
  } {
    const count = this.items().length;
    return {
      index,
      count,
      first: index === 0,
      last: index === count - 1,
      even: index % 2 === 0,
      odd: index % 2 !== 0,
    };
  }

  private getLast(last = 0, isCols = false): number {
    const liveItems = this.items();
    if (!liveItems) return 0;
    const liveLength = isCols ? liveItems.length : liveItems.length; // isCols branch unreachable in vertical-only scope (Global Constraints); kept for signature parity with the deferred horizontal/both follow-up
    return Math.min(liveLength, last);
  }
}
