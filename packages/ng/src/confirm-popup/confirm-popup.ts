import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { UBaseComponent, UConfirmationService, UOverlay, type UConfirmation } from "@ultimate/ng-core";
import { ESCAPE_PRIORITIES, escapeRegistry } from "@ultimate/uix-utils/escape";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { UButton } from "../button/button";
import { confirmPopupStyleModule } from "./confirm-popup-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ConfirmPopup` component (see
 * `.vendor-extracted/ng/confirmpopup/confirmpopup.ts`). Confirmed against
 * real source: same service-driven mechanism as `ConfirmDialog` — injects
 * `ConfirmationService`, subscribes to `requireConfirmation$`, and renders
 * a small overlay positioned relative to `confirmation.target` (the
 * triggering element, typically the button that called `confirm()`) rather
 * than a modal dialog.
 *
 * This port keeps that same real mechanism, using this task's own
 * `UConfirmationService`, composing `UOverlay` for the body-append + z-index
 * behavior, and positioning against `confirmation.target` the same
 * `getBoundingClientRect()`-based approach `UPopover` already established
 * (simpler than porting upstream's full `absolutePosition()`/flip
 * algorithm — KISS, matching every sibling component's precedent).
 * Dismissed on outside click, Escape, and window resize, matching real
 * upstream's own `bindDocumentClickListener`/`onEscapeKeydown`/
 * `onWindowResize`.
 *
 * Deliberately excludes upstream's much larger surface — breakpoints,
 * headless/content `TemplateRef` projection, arrow-flip positioning, and
 * RTL — none of these appear in this capability's spec-mandated surface.
 */
@Component({
  standalone: true,
  selector: "u-confirm-popup",
  imports: [UOverlay, UButton],
  template: `
    @if (render()) {
      <div uOverlay [visible]="visible()" appendTo="body" [class]="cx('root')" role="alertdialog">
        <div #content [class]="cx('content')">
          @if (confirmation()?.icon) {
            <i [class]="confirmation()?.icon + ' ' + cx('icon')"></i>
          }
          <span [class]="cx('message')">{{ confirmation()?.message }}</span>
        </div>
        <div [class]="cx('footer')">
          @if (confirmation()?.rejectVisible !== false) {
            <u-button [label]="rejectLabel()" severity="secondary" text (onClick)="onReject()"></u-button>
          }
          @if (confirmation()?.acceptVisible !== false) {
            <u-button [label]="acceptLabel()" (onClick)="onAccept()"></u-button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UConfirmPopup extends UBaseComponent {
  protected override readonly componentName = "confirm-popup";
  protected override readonly styleModule = confirmPopupStyleModule;

  /** Matches only `UConfirmation` requests carrying the same `key` (undefined matches undefined). */
  key = input<string>();

  private readonly confirmationService = inject(UConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild("content") private contentRef?: ElementRef<HTMLElement>;

  protected readonly visible = signal(false);
  protected readonly render = signal(false);
  protected readonly confirmation = signal<UConfirmation | null>(null);
  protected readonly acceptLabel = computed(() => this.confirmation()?.acceptLabel ?? "Yes");
  protected readonly rejectLabel = computed(() => this.confirmation()?.rejectLabel ?? "No");

  private documentClickListener: ((event: MouseEvent) => void) | null = null;
  private windowResizeListener: (() => void) | null = null;
  private registeredEscape = false;
  private static instanceCount = 0;
  private readonly instanceUid = ++UConfirmPopup.instanceCount;

  constructor() {
    super();
    const subscription = this.confirmationService.requireConfirmation$.subscribe((confirmation) => {
      if (!confirmation) {
        this.hide();
        return;
      }
      if (confirmation.key === this.key()) {
        this.confirmation.set(confirmation);
        this.show();
      }
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  private show(): void {
    this.visible.set(true);
    this.render.set(true);
    this.bindDismissListeners();
    this.registerEscape();
    queueMicrotask(() => this.align());
  }

  private hide(): void {
    this.visible.set(false);
    this.render.set(false);
    this.confirmation.set(null);
    this.unbindDismissListeners();
    this.unregisterEscape();
  }

  private align(): void {
    const content = this.contentRef?.nativeElement?.parentElement;
    const target = this.confirmation()?.target;
    if (!content || !target) {
      return;
    }
    const targetRect = target.getBoundingClientRect();
    content.style.top = `${targetRect.bottom + window.scrollY}px`;
    content.style.left = `${targetRect.left + window.scrollX}px`;
    ZIndex.set("overlay", content, 1000);
  }

  protected onAccept(): void {
    const confirmation = this.confirmation();
    confirmation?.accept?.();
    confirmation?.target?.focus();
    this.hide();
  }

  protected onReject(): void {
    const confirmation = this.confirmation();
    confirmation?.reject?.();
    confirmation?.target?.focus();
    this.hide();
  }

  private bindDismissListeners(): void {
    if (!this.documentClickListener) {
      this.documentClickListener = (event: MouseEvent) => {
        const container = this.contentRef?.nativeElement?.parentElement;
        const target = this.confirmation()?.target;
        const eventTarget = event.target as Node;
        if (
          container &&
          !container.contains(eventTarget) &&
          target !== eventTarget &&
          !target?.contains(eventTarget)
        ) {
          this.hide();
        }
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
    escapeRegistry.register(ESCAPE_PRIORITIES.OVERLAY_PANEL, this.instanceUid, () => this.onReject());
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
  }
}
