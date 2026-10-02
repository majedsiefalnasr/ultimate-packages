import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UTabs } from "./tabs";
import { tabsStyleModule } from "./tabs-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `TabList` component (see
 * `.vendor-extracted/ng/tabs/tablist.ts`). Renders the horizontal strip of
 * `UTab` triggers plus an active-indicator bar, with optional
 * prev/next scroll navigators for overflow. Reads `tabindex`/
 * `showNavigators` from its nearest ancestor `UTabs` via
 * Angular DI, matching real PrimeNG's own `pcTabs = inject(...)` pattern.
 */
@Component({
  standalone: true,
  selector: "u-tab-list",
  template: `
    @if (showNavigators() && isPrevButtonEnabled()) {
      <button type="button" [class]="cx('tabListPrevButton')" (click)="onPrevButtonClick()" aria-label="Previous">‹</button>
    }
    <div #content [class]="cx('tabListContent')" (scroll)="onScroll()">
      <div #tabListEl [class]="cx('tabListTabList')" role="tablist">
        <ng-content></ng-content>
        <span #inkbar role="presentation" [class]="cx('tabListActiveBar')"></span>
      </div>
    </div>
    @if (showNavigators() && isNextButtonEnabled()) {
      <button type="button" [class]="cx('tabListNextButton')" (click)="onNextButtonClick()" aria-label="Next">›</button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('tabListRoot')",
  },
})
export class UTabList extends UBaseComponent implements AfterViewInit, OnDestroy {
  protected override readonly componentName = "tabs";
  protected override readonly styleModule = tabsStyleModule;

  private readonly pcTabs = inject(UTabs);

  @ViewChild("content") private contentRef?: ElementRef<HTMLDivElement>;
  @ViewChild("tabListEl") private tabListRef?: ElementRef<HTMLDivElement>;
  @ViewChild("inkbar") private inkbarRef?: ElementRef<HTMLSpanElement>;

  protected readonly showNavigators = computed(() => this.pcTabs.showNavigators());
  protected readonly isPrevButtonEnabled = signal(false);
  protected readonly isNextButtonEnabled = signal(false);

  private resizeObserver?: ResizeObserver;

  // Matches PrimeNG 21.1.9 tablist.ts:148-152 — compute navigator state once
  // the view exists, and keep it current on resize, in the browser only.
  ngAfterViewInit(): void {
    if (this.showNavigators() && isPlatformBrowser(this.platformId)) {
      this.updateButtonState();
      this.bindResizeObserver();
    }
  }

  ngOnDestroy(): void {
    this.unbindResizeObserver();
  }

  private bindResizeObserver(): void {
    this.unbindResizeObserver();
    this.resizeObserver = new ResizeObserver(() => this.updateButtonState());
    this.resizeObserver.observe(this.el.nativeElement);
  }

  private unbindResizeObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected onScroll(): void {
    if (this.showNavigators()) this.updateButtonState();
  }

  protected onPrevButtonClick(): void {
    const el = this.contentRef?.nativeElement;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft) - el.clientWidth;
    el.scrollLeft = pos <= 0 ? 0 : pos;
  }

  protected onNextButtonClick(): void {
    const el = this.contentRef?.nativeElement;
    if (!el) return;
    const pos = el.scrollLeft + el.clientWidth;
    const lastPos = el.scrollWidth - el.clientWidth;
    el.scrollLeft = pos >= lastPos ? lastPos : pos;
  }

  private updateButtonState(): void {
    const el = this.contentRef?.nativeElement;
    if (!el) return;
    const scrollLeft = Math.abs(el.scrollLeft);
    this.isPrevButtonEnabled.set(scrollLeft !== 0);
    this.isNextButtonEnabled.set(Math.abs(scrollLeft - (el.scrollWidth - el.clientWidth)) > 1);
  }

  /** Repositions/resizes the active-tab indicator bar under the active `UTab`. */
  updateInkBar(): void {
    const content = this.contentRef?.nativeElement;
    const tabList = this.tabListRef?.nativeElement;
    const inkbar = this.inkbarRef?.nativeElement;
    if (!content || !tabList || !inkbar) return;
    const activeTab = content.querySelector<HTMLElement>('[data-u-active="true"]');
    if (!activeTab) return;
    inkbar.style.width = `${activeTab.offsetWidth}px`;
    inkbar.style.left = `${activeTab.getBoundingClientRect().left - tabList.getBoundingClientRect().left}px`;
  }
}
