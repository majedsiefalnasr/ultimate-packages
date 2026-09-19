import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, UFocusTrap, UOverlay, UTimesIcon } from "@ultimate/ng-core";
import { ESCAPE_PRIORITIES, escapeRegistry } from "@ultimate/uix-utils/escape";
import { UButton } from "../button/button";
import { drawerStyleModule } from "./drawer-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Drawer` component (see
 * `.vendor-extracted/ng/drawer/drawer.ts` — real source names the selector
 * `p-drawer`, but its own doc comment still reads "Sidebar is a panel
 * component displayed as an overlay at the edges of the screen", confirming
 * Drawer/Sidebar are the same capability under PrimeNG's renamed selector,
 * matching this capability's cross-framework `Drawer`(Angular/Vue)/
 * `Sidebar`(React) naming note). Real source: a data-bound `visible`
 * input/`visibleChange` output pair (not imperative `show()`/`hide()` like
 * `Popover`), a modal mask appended to `body`, positioned at one of
 * `left`/`right`/`top`/`bottom`/`full`, dismissed on mask click, Escape, and
 * a close button.
 *
 * Composes `UOverlay` (body-append + z-index) and `UFocusTrap` the same way
 * `UDialog` already does. Deliberately excludes upstream's `blockScroll`
 * body-scroll-blocking, `breakpoints`-driven responsive `<style>`
 * injection, and header/footer/content `TemplateRef` projection beyond
 * plain `<ng-content>` — none of these appear in this capability's
 * spec-mandated surface (same "smaller surface than upstream" precedent as
 * every sibling component).
 */
@Component({
  standalone: true,
  selector: "u-drawer",
  imports: [UOverlay, UFocusTrap, UButton, UTimesIcon],
  template: `
    @if (renderMask()) {
      <div uOverlay [visible]="visible()" appendTo="body" [class]="cx('mask')" (mousedown)="onMaskMouseDown($event)" (mouseup)="onMaskMouseUp($event)">
        <div
          [class]="cx('root', classesParams())"
          role="complementary"
          (keydown)="onKeyDown($event)"
        >
          <div uFocusTrap>
            <div [class]="cx('header')">
              @if (header()) {
                <span [class]="cx('title')">{{ header() }}</span>
              }
              @if (closable()) {
                <u-button
                  [class]="cx('pcCloseButton')"
                  text
                  rounded
                  severity="secondary"
                  (onClick)="close()"
                >
                  <u-times-icon />
                </u-button>
              }
            </div>
            <div [class]="cx('content')">
              <ng-content></ng-content>
            </div>
            <div [class]="cx('footer')">
              <ng-content select="[drawerFooter]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UDrawer extends UBaseComponent {
  protected override readonly componentName = "drawer";
  protected override readonly styleModule = drawerStyleModule;

  /** Whether the drawer is visible. */
  visible = input(false);
  /** Title text of the drawer. */
  header = input<string>();
  /** Position of the drawer. */
  position = input<"left" | "right" | "top" | "bottom" | "full">("left");
  /** Whether an overlay mask is displayed behind the drawer. */
  modal = input(true, { transform: booleanAttribute });
  /** Whether to dismiss the drawer on click of the mask. */
  dismissible = input(true, { transform: booleanAttribute });
  /** Whether to display the close icon. */
  closable = input(true, { transform: booleanAttribute });
  /** Specifies if pressing escape key should hide the drawer. */
  closeOnEscape = input(true, { transform: booleanAttribute });

  /** Notifies changes in the visibility state of the component. */
  visibleChange = output<boolean>();
  /** Callback to invoke when drawer is shown. */
  onShow = output<void>();
  /** Callback to invoke when drawer is hidden. */
  onHide = output<void>();

  protected readonly renderMask = signal(false);
  private maskMouseDownTarget: EventTarget | null = null;
  private registeredEscape = false;
  private static instanceCount = 0;
  private readonly instanceUid = ++UDrawer.instanceCount;

  constructor() {
    super();
    // Signal inputs don't participate in ngOnChanges — visibility
    // transitions are driven by an explicit effect() instead, matching
    // UDialog's own established pattern (packages/ng/src/dialog/dialog.ts).
    effect(() => {
      this.applyVisible(this.visible());
    });
  }

  protected classesParams() {
    return { position: this.position() };
  }

  private applyVisible(visible: boolean): void {
    if (visible && !this.renderMask()) {
      this.renderMask.set(true);
      this.registerEscape();
      this.onShow.emit();
    } else if (!visible && this.renderMask()) {
      this.renderMask.set(false);
      this.unregisterEscape();
      this.onHide.emit();
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.code === "Escape" && this.closeOnEscape()) {
      this.close();
    }
  }

  protected onMaskMouseDown(event: Event): void {
    this.maskMouseDownTarget = event.target;
  }

  protected onMaskMouseUp(event: Event): void {
    // Mirrors UDialog's mask-click guard: both mousedown and mouseup must
    // land on the mask element itself, guarding against a drag-selection
    // gesture that starts inside the drawer content and releases over the
    // mask being misread as a mask click.
    if (
      this.dismissible() &&
      this.modal() &&
      event.target === event.currentTarget &&
      event.target === this.maskMouseDownTarget
    ) {
      this.close();
    }
  }

  /** Hides the drawer (emits `visibleChange(false)`). */
  close(): void {
    this.visibleChange.emit(false);
    this.applyVisible(false);
  }

  private registerEscape(): void {
    if (this.registeredEscape) {
      return;
    }
    this.registeredEscape = true;
    escapeRegistry.register(ESCAPE_PRIORITIES.SIDEBAR, this.instanceUid, () => {
      if (this.closeOnEscape()) {
        this.close();
      }
    });
  }

  private unregisterEscape(): void {
    if (!this.registeredEscape) {
      return;
    }
    escapeRegistry.unregister(ESCAPE_PRIORITIES.SIDEBAR, this.instanceUid);
    this.registeredEscape = false;
  }

  ngOnDestroy(): void {
    this.unregisterEscape();
  }
}
