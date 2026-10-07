import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, UOverlay } from "@ultimate/ng-core";
import { ESCAPE_PRIORITIES, escapeRegistry } from "@ultimate/uix-utils/escape";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { popoverStyleModule } from "./popover-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Popover` component (see
 * `.vendor-extracted/ng/popover/popover.ts`). Real source: a
 * `@Component({selector: 'p-popover'})` that is shown/hidden imperatively
 * via `show(event, target)`/`hide()`/`toggle(event, target)` methods
 * (invoked by the consumer, e.g. a button's `(click)` handler with a
 * `#op` template-ref) rather than a data-bound `visible` input — the
 * overlay panel is absolutely positioned next to the `target` element via
 * `absolutePosition()`, appended to `body`, dismissed on outside click,
 * Escape, and window resize.
 *
 * This port keeps the same imperative `show`/`hide`/`toggle` public API
 * (matching real source's actual consumption pattern — templates call
 * `op.toggle($event)`), composes `UOverlay` for the body-append + z-index
 * behavior the same way `USelect`/`UDialog` already do, and positions the
 * panel with a `getBoundingClientRect()`-based placement (simpler than
 * porting `absolutePosition()`'s full viewport-flip algorithm — KISS,
 * matching every sibling component's "smaller surface than upstream"
 * precedent; flip-on-overflow is not ported).
 *
 * Deliberately excludes upstream's `breakpoints`-driven responsive
 * `<style>` injection, `ariaCloseLabel`, and content-template projection
 * beyond a plain `<ng-content>` — none of these appear in this capability's
 * spec-mandated surface.
 */
@Component({
  standalone: true,
  selector: "u-popover",
  imports: [UOverlay],
  template: `
    @if (render()) {
      <div
        uOverlay
        [visible]="visible()"
        appendTo="body"
        [class]="cx('root')"
        role="dialog"
        [attr.aria-modal]="visible()"
        (click)="onOverlayClick($event)"
      >
        <div #content [class]="cx('content')" (click)="onContentClick($event)">
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UPopover extends UBaseComponent {
  protected override readonly componentName = "popover";
  protected override readonly styleModule = popoverStyleModule;

  /** Whether clicking outside hides the overlay. */
  dismissable = input(true, { transform: booleanAttribute });

  /** Callback to invoke when the overlay becomes visible. */
  onShow = output<void>();
  /** Callback to invoke when the overlay is hidden. */
  onHide = output<void>();

  @ViewChild("content") private contentRef?: ElementRef<HTMLElement>;

  protected readonly visible = signal(false);
  protected readonly render = signal(false);

  private target: HTMLElement | null = null;
  private selfClick = false;
  private documentClickListener: ((event: MouseEvent) => void) | null = null;
  private windowResizeListener: (() => void) | null = null;
  private registeredEscape = false;
  private static instanceCount = 0;
  private readonly instanceUid = ++UPopover.instanceCount;
  private readonly injector = inject(Injector);

  /** Toggles the overlay open/closed, positioning it against `target` (or the click event's own target). */
  toggle(event: Event, target?: HTMLElement): void {
    this.visible() ? this.hide() : this.show(event, target);
  }

  /** Shows the overlay, positioned against `target` (or the click event's own current/target element). */
  show(event: Event, target?: HTMLElement): void {
    event.stopPropagation();
    this.target = target ?? (event.currentTarget as HTMLElement) ?? (event.target as HTMLElement);
    this.visible.set(true);
    this.render.set(true);
    this.bindDismissListeners();
    this.registerEscape();
    // The overlay only exists once Angular renders the @if (render()) block, so
    // align after the next render (PrimeNG aligns in its enter hook, once its
    // container exists; C2-0 precedent). align() still returns early if the
    // overlay was hidden before this runs.
    afterNextRender(() => this.align(), { injector: this.injector });
    this.onShow.emit();
  }

  /** Hides the overlay. */
  hide(): void {
    if (!this.visible()) {
      return;
    }
    this.visible.set(false);
    this.render.set(false);
    this.unbindDismissListeners();
    this.unregisterEscape();
    this.onHide.emit();
  }

  protected onOverlayClick(event: MouseEvent): void {
    this.selfClick = true;
    event.stopPropagation();
  }

  protected onContentClick(_event: MouseEvent): void {
    this.selfClick = true;
  }

  private align(): void {
    // Position the overlay container (the uOverlay root), as PrimeNG's
    // absolutePosition(this.container, …), UConfirmPopup and the Vue port do.
    const content = this.contentRef?.nativeElement?.parentElement;
    if (!content || !this.target) {
      return;
    }
    const targetRect = this.target.getBoundingClientRect();
    content.style.top = `${targetRect.bottom + window.scrollY}px`;
    content.style.left = `${targetRect.left + window.scrollX}px`;
    ZIndex.set("overlay", content, 1000);
  }

  private bindDismissListeners(): void {
    if (!this.documentClickListener) {
      this.documentClickListener = (event: MouseEvent) => {
        if (!this.dismissable()) {
          return;
        }
        const content = this.contentRef?.nativeElement;
        const eventTarget = event.target as Node;
        if (
          !this.selfClick &&
          content &&
          !content.contains(eventTarget) &&
          this.target !== eventTarget &&
          !this.target?.contains(eventTarget)
        ) {
          this.hide();
        }
        this.selfClick = false;
      };
      document.addEventListener("click", this.documentClickListener);
    }
    if (!this.windowResizeListener) {
      this.windowResizeListener = () => this.hide();
      window.addEventListener("resize", this.windowResizeListener);
    }
  }

  private unbindDismissListeners(): void {
    if (this.documentClickListener) {
      document.removeEventListener("click", this.documentClickListener);
      this.documentClickListener = null;
    }
    if (this.windowResizeListener) {
      window.removeEventListener("resize", this.windowResizeListener);
      this.windowResizeListener = null;
    }
  }

  private registerEscape(): void {
    if (this.registeredEscape) {
      return;
    }
    this.registeredEscape = true;
    escapeRegistry.register(ESCAPE_PRIORITIES.OVERLAY_PANEL, this.instanceUid, () => this.hide());
  }

  private unregisterEscape(): void {
    if (!this.registeredEscape) {
      return;
    }
    escapeRegistry.unregister(ESCAPE_PRIORITIES.OVERLAY_PANEL, this.instanceUid);
    this.registeredEscape = false;
  }

  ngOnDestroy(): void {
    this.unbindDismissListeners();
    this.unregisterEscape();
    const content = this.contentRef?.nativeElement?.parentElement;
    if (content) {
      ZIndex.clear(content);
    }
  }
}
