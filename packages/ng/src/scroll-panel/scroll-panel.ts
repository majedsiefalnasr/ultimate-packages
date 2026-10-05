import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
  input,
  numberAttribute,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { UBaseComponent } from "@ultimate/ng-core";
import { uuid } from "@ultimate/uix-utils/uuid";
import { scrollPanelStyleModule } from "./scroll-panel-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ScrollPanel` component (see
 * `.vendor-extracted/ng/scrollpanel/scrollpanel.ts`). Confirmed against
 * real source (all 3 frameworks): extends the bare `BaseComponent` tier
 * (no CVA) — a cross-browser custom scrollbar. Real source's own mechanism
 * is faithfully ported: the native content `<div>` scrolls normally (with
 * its native scrollbar hidden via CSS), while two absolutely-positioned
 * "thumb" bars (`barX`/`barY`) mirror the native scroll position/ratio —
 * sized proportionally to `visibleWidth/totalWidth` (and the vertical
 * equivalent) and repositioned on every `scroll`/`resize`/`mouseenter`
 * event via `requestAnimationFrame`. Both thumbs support drag-to-scroll
 * (`mousedown` + document-level `mousemove`/`mouseup`) and keyboard
 * stepping (arrow keys while a thumb has focus, matching real source's own
 * `step` input and repeat-on-hold timer).
 *
 * Deliberately excludes real source's `content` `<ng-template>` override,
 * touch-drag support (mouse events only, matching this session's disclosed
 * "cut touch-drag if out of scope" allowance for ScrollPanel), and RTL
 * inset-mirroring nuance beyond plain `inset-inline-*` CSS logical
 * properties — same "smaller surface than upstream" precedent as every
 * sibling component. All native DOM listeners (scroll/resize/mouse) run
 * outside Angular's zone-triggered change detection entirely by nature
 * (native scroll/drag), so no CD-timing pitfall applies here beyond
 * `ngOnDestroy`-driven listener cleanup.
 */
@Component({
  standalone: true,
  selector: "u-scroll-panel",
  template: `
    <div [class]="cx('contentContainer')">
      <div #content [class]="cx('content')" (mouseenter)="moveBar()" (scroll)="onScroll($event)">
        <ng-content></ng-content>
      </div>
    </div>
    <div
      #xBar
      [class]="cx('barX')"
      tabindex="0"
      role="scrollbar"
      aria-orientation="horizontal"
      [attr.aria-valuenow]="lastScrollLeft"
      [attr.aria-controls]="contentId"
      (mousedown)="onXBarMouseDown($event)"
      (keydown)="onKeyDown($event)"
      (keyup)="onKeyUp()"
      (focus)="onFocus($event)"
      (blur)="onBlur()"
    ></div>
    <div
      #yBar
      [class]="cx('barY')"
      tabindex="0"
      role="scrollbar"
      aria-orientation="vertical"
      [attr.aria-valuenow]="lastScrollTop"
      [attr.aria-controls]="contentId"
      (mousedown)="onYBarMouseDown($event)"
      (keydown)="onKeyDown($event)"
      (keyup)="onKeyUp()"
      (focus)="onFocus($event)"
      (blur)="onBlur()"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
})
export class UScrollPanel extends UBaseComponent implements AfterViewInit, OnDestroy {
  protected override readonly componentName = "scrollpanel";
  protected override readonly styleModule = scrollPanelStyleModule;

  /** Step factor to scroll the content while pressing the arrow keys. */
  step = input(5, { transform: numberAttribute });

  @ViewChild("content") private contentRef!: ElementRef<HTMLElement>;
  @ViewChild("xBar") private xBarRef!: ElementRef<HTMLElement>;
  @ViewChild("yBar") private yBarRef!: ElementRef<HTMLElement>;

  protected readonly contentId = uuid("u_scroll_panel_") + "_content";
  protected lastScrollLeft = 0;
  protected lastScrollTop = 0;

  private readonly destroyRef = inject(DestroyRef);

  private scrollXRatio = 0;
  private scrollYRatio = 0;
  private orientation: "horizontal" | "vertical" = "vertical";
  private isXBarClicked = false;
  private isYBarClicked = false;
  private lastPageX = 0;
  private lastPageY = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private frame?: number;
  private windowResizeListener?: () => void;
  private documentMouseMoveListener?: (event: MouseEvent) => void;
  private documentMouseUpListener?: (event: MouseEvent) => void;

  ngAfterViewInit(): void {
    // Measuring (moveBar/calculateContainerHeight) and the resize listener
    // all need browser globals — skip the whole setup server-side.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.moveBar();
    this.calculateContainerHeight();

    const onResize = () => this.moveBar();
    window.addEventListener("resize", onResize);
    this.windowResizeListener = () => window.removeEventListener("resize", onResize);

    this.destroyRef.onDestroy(() => {
      this.windowResizeListener?.();
      this.unbindDocumentMouseListeners();
      if (this.frame) cancelAnimationFrame(this.frame);
      this.clearTimer();
    });
  }

  ngOnDestroy(): void {
    this.windowResizeListener?.();
    this.unbindDocumentMouseListeners();
  }

  private calculateContainerHeight(): void {
    const container = this.el.nativeElement as HTMLElement;
    const content = this.contentRef.nativeElement;
    const xBar = this.xBarRef.nativeElement;
    const containerStyles = window.getComputedStyle(container);
    const xBarStyles = window.getComputedStyle(xBar);
    const pureContainerHeight = container.offsetHeight - parseInt(xBarStyles.height, 10);

    if (containerStyles.maxHeight !== "none" && pureContainerHeight === 0) {
      if (content.offsetHeight + parseInt(xBarStyles.height, 10) > parseInt(containerStyles.maxHeight, 10)) {
        container.style.height = containerStyles.maxHeight;
      } else {
        container.style.height =
          content.offsetHeight +
          parseFloat(containerStyles.paddingTop) +
          parseFloat(containerStyles.paddingBottom) +
          parseFloat(containerStyles.borderTopWidth) +
          parseFloat(containerStyles.borderBottomWidth) +
          "px";
      }
    }
  }

  protected moveBar(): void {
    const container = this.el.nativeElement as HTMLElement;
    const content = this.contentRef.nativeElement;
    const xBar = this.xBarRef.nativeElement;
    const yBar = this.yBarRef.nativeElement;

    const totalWidth = content.scrollWidth;
    const ownWidth = content.clientWidth;
    const bottom = (container.clientHeight - xBar.clientHeight) * -1;
    this.scrollXRatio = ownWidth / totalWidth;

    const totalHeight = content.scrollHeight;
    const ownHeight = content.clientHeight;
    const right = (container.clientWidth - yBar.clientWidth) * -1;
    this.scrollYRatio = ownHeight / totalHeight;

    this.frame = requestAnimationFrame(() => {
      if (this.scrollXRatio >= 1) {
        xBar.classList.add("u-scroll-panel-bar-hidden");
      } else {
        xBar.classList.remove("u-scroll-panel-bar-hidden");
        const xBarWidth = Math.max(this.scrollXRatio * 100, 10);
        const xBarLeft = Math.abs((content.scrollLeft * (100 - xBarWidth)) / (totalWidth - ownWidth || 1));
        xBar.style.cssText = `width:${xBarWidth}%; inset-inline-start:${xBarLeft}%; bottom:${bottom}px;`;
      }

      if (this.scrollYRatio >= 1) {
        yBar.classList.add("u-scroll-panel-bar-hidden");
      } else {
        yBar.classList.remove("u-scroll-panel-bar-hidden");
        const yBarHeight = Math.max(this.scrollYRatio * 100, 10);
        const yBarTop = (content.scrollTop * (100 - yBarHeight)) / (totalHeight - ownHeight || 1);
        yBar.style.cssText = `height:${yBarHeight}%; top: calc(${yBarTop}% - ${xBar.clientHeight}px); inset-inline-end:${right}px;`;
      }
    });
  }

  protected onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.lastScrollLeft !== target.scrollLeft) {
      this.lastScrollLeft = target.scrollLeft;
      this.orientation = "horizontal";
    } else if (this.lastScrollTop !== target.scrollTop) {
      this.lastScrollTop = target.scrollTop;
      this.orientation = "vertical";
    }
    this.moveBar();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.orientation === "vertical") {
      switch (event.code) {
        case "ArrowDown":
          this.setTimer("scrollTop", this.step());
          event.preventDefault();
          break;
        case "ArrowUp":
          this.setTimer("scrollTop", this.step() * -1);
          event.preventDefault();
          break;
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          break;
      }
    } else {
      switch (event.code) {
        case "ArrowRight":
          this.setTimer("scrollLeft", this.step());
          event.preventDefault();
          break;
        case "ArrowLeft":
          this.setTimer("scrollLeft", this.step() * -1);
          event.preventDefault();
          break;
        case "ArrowDown":
        case "ArrowUp":
          event.preventDefault();
          break;
      }
    }
  }

  protected onKeyUp(): void {
    this.clearTimer();
  }

  private repeat(bar: "scrollTop" | "scrollLeft", step: number): void {
    const content = this.contentRef.nativeElement;
    content[bar] += step;
    this.moveBar();
  }

  private setTimer(bar: "scrollTop" | "scrollLeft", step: number): void {
    this.clearTimer();
    this.timer = setTimeout(() => this.repeat(bar, step), 40);
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private bindDocumentMouseListeners(): void {
    if (!this.documentMouseMoveListener) {
      this.documentMouseMoveListener = (e) => this.onDocumentMouseMove(e);
      document.addEventListener("mousemove", this.documentMouseMoveListener);
    }
    if (!this.documentMouseUpListener) {
      this.documentMouseUpListener = (e) => this.onDocumentMouseUp(e);
      document.addEventListener("mouseup", this.documentMouseUpListener);
    }
  }

  private unbindDocumentMouseListeners(): void {
    if (this.documentMouseMoveListener) {
      document.removeEventListener("mousemove", this.documentMouseMoveListener);
      this.documentMouseMoveListener = undefined;
    }
    if (this.documentMouseUpListener) {
      document.removeEventListener("mouseup", this.documentMouseUpListener);
      this.documentMouseUpListener = undefined;
    }
  }

  protected onYBarMouseDown(event: MouseEvent): void {
    this.isYBarClicked = true;
    this.yBarRef.nativeElement.focus();
    this.lastPageY = event.pageY;
    this.yBarRef.nativeElement.classList.add("u-scroll-panel-bar-grabbed");
    document.body.classList.add("u-scroll-panel-bar-grabbed");
    this.bindDocumentMouseListeners();
    event.preventDefault();
  }

  protected onXBarMouseDown(event: MouseEvent): void {
    this.isXBarClicked = true;
    this.xBarRef.nativeElement.focus();
    this.lastPageX = event.pageX;
    this.xBarRef.nativeElement.classList.add("u-scroll-panel-bar-grabbed");
    document.body.classList.add("u-scroll-panel-bar-grabbed");
    this.bindDocumentMouseListeners();
    event.preventDefault();
  }

  private onDocumentMouseMove(event: MouseEvent): void {
    if (this.isXBarClicked) {
      this.onMouseMoveForXBar(event);
    } else if (this.isYBarClicked) {
      this.onMouseMoveForYBar(event);
    }
  }

  private onMouseMoveForXBar(event: MouseEvent): void {
    const deltaX = event.pageX - this.lastPageX;
    this.lastPageX = event.pageX;
    this.frame = requestAnimationFrame(() => {
      this.contentRef.nativeElement.scrollLeft += deltaX / (this.scrollXRatio || 1);
    });
  }

  private onMouseMoveForYBar(event: MouseEvent): void {
    const deltaY = event.pageY - this.lastPageY;
    this.lastPageY = event.pageY;
    this.frame = requestAnimationFrame(() => {
      this.contentRef.nativeElement.scrollTop += deltaY / (this.scrollYRatio || 1);
    });
  }

  protected onFocus(event: FocusEvent): void {
    if (this.xBarRef.nativeElement.isSameNode(event.target as Node)) {
      this.orientation = "horizontal";
    } else if (this.yBarRef.nativeElement.isSameNode(event.target as Node)) {
      this.orientation = "vertical";
    }
  }

  protected onBlur(): void {
    if (this.orientation === "horizontal") {
      this.orientation = "vertical";
    }
  }

  private onDocumentMouseUp(_event: Event): void {
    this.yBarRef.nativeElement.classList.remove("u-scroll-panel-bar-grabbed");
    this.xBarRef.nativeElement.classList.remove("u-scroll-panel-bar-grabbed");
    document.body.classList.remove("u-scroll-panel-bar-grabbed");
    this.unbindDocumentMouseListeners();
    this.isXBarClicked = false;
    this.isYBarClicked = false;
  }

  /** Scrolls the content to the given top offset, clamped within range. */
  scrollTop(scrollTop: number): void {
    const content = this.contentRef.nativeElement;
    const scrollableHeight = content.scrollHeight - content.clientHeight;
    content.scrollTop = scrollTop > scrollableHeight ? scrollableHeight : Math.max(scrollTop, 0);
  }

  /** Refreshes the position and size of the scrollbar thumbs. */
  refresh(): void {
    this.moveBar();
  }
}
