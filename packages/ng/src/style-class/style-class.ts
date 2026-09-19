import { Directive, ElementRef, HostListener, OnDestroy, inject, input } from "@angular/core";

/**
 * Ultimate-owned adaptation of PrimeNG's `StyleClass` directive (see
 * `.vendor-extracted/ng/styleclass/styleclass.ts`). Confirmed against real
 * source: `StyleClass` is a standalone `@Directive({selector:
 * '[pStyleClass]'})` — a click-driven class-toggle/enter-leave-animation
 * behavior applied to a *trigger* element, acting on a separate *target*
 * element resolved via a `@next`/`@prev`/`@parent`/`@grandparent` selector
 * (or a plain CSS selector) — NOT a standalone visible component, matching
 * this task's brief to verify StyleClass's real shape before assuming a
 * standard component pattern. Same architectural category as `UKeyFilter`
 * (`packages/ng/src/key-filter/key-filter.ts`): a behavior-only directive
 * with no rendered template of its own.
 *
 * Ports real source's core algorithm: on click, resolve the target once,
 * then either toggle a single `toggleClass` or run an enter/leave
 * class-sequence (`enterFromClass` → `enterActiveClass` → `enterToClass`,
 * mirrored on leave) gated on the target's `animationend` event, plus
 * optional outside-click, Escape-key, and resize-triggered dismissal.
 *
 * Deliberately excludes real source's `slidedown`-specific max-height
 * pre-measurement branch (a CSS-animation-timing workaround specific to one
 * named animation preset, not a general behavior), Angular `NgZone`
 * zone-exit wrapping (this port has no zone-related test requirement), and
 * the `resizeSelector`/`ResizeObserver` element-resize variant (kept to the
 * simpler `window` resize case) — matching every sibling directive's
 * established "smaller surface than upstream" precedent.
 */
@Directive({
  standalone: true,
  selector: "[uStyleClass]",
})
export class UStyleClass implements OnDestroy {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);

  /** Selector to define the target element: '@next', '@prev', '@parent', '@grandparent', or a CSS selector. */
  selector = input<string | undefined>(undefined, { alias: "uStyleClass" });
  /** Style class to add when item begins to get displayed. */
  enterFromClass = input<string>();
  /** Style class to add during enter animation. */
  enterActiveClass = input<string>();
  /** Style class to add when item finishes entering. */
  enterToClass = input<string>();
  /** Style class to add when item begins to get hidden. */
  leaveFromClass = input<string>();
  /** Style class to add during leave animation. */
  leaveActiveClass = input<string>();
  /** Style class to add when leave animation is completed. */
  leaveToClass = input<string>();
  /** Adds or removes a class when no enter-leave animation is required. */
  toggleClass = input<string>();
  /** Whether to trigger leave animation when outside of the element is clicked. */
  hideOnOutsideClick = input(false);
  /** Whether to trigger leave animation when Escape is pressed. */
  hideOnEscape = input(false);
  /** Whether to trigger leave animation when the window is resized. */
  hideOnResize = input(false);

  private target: HTMLElement | null = null;
  private animating = false;
  private enterListener: (() => void) | null = null;
  private leaveListener: (() => void) | null = null;
  private documentClickListener: ((event: MouseEvent) => void) | null = null;
  private documentKeydownListener: ((event: KeyboardEvent) => void) | null = null;
  private windowResizeListener: (() => void) | null = null;

  @HostListener("click")
  protected onClick(): void {
    this.target ??= this.resolveTarget();
    if (!this.target) {
      return;
    }

    if (this.toggleClass()) {
      this.toggle();
    } else if (this.target.offsetParent === null) {
      this.enter();
    } else {
      this.leave();
    }
  }

  private resolveTarget(): HTMLElement | null {
    const selector = this.selector();
    const hostEl = this.el.nativeElement;
    switch (selector) {
      case "@next":
        return hostEl.nextElementSibling as HTMLElement | null;
      case "@prev":
        return hostEl.previousElementSibling as HTMLElement | null;
      case "@parent":
        return hostEl.parentElement;
      case "@grandparent":
        return hostEl.parentElement?.parentElement ?? null;
      default:
        return selector ? document.querySelector<HTMLElement>(selector) : null;
    }
  }

  private toggle(): void {
    const target = this.target;
    const toggleClass = this.toggleClass();
    if (!target || !toggleClass) {
      return;
    }
    target.classList.contains(toggleClass)
      ? target.classList.remove(toggleClass)
      : target.classList.add(toggleClass);
  }

  private enter(): void {
    const target = this.target;
    if (!target) {
      return;
    }
    const enterActiveClass = this.enterActiveClass();
    if (enterActiveClass) {
      if (!this.animating) {
        this.animating = true;
        target.classList.add(enterActiveClass);
        const enterFromClass = this.enterFromClass();
        if (enterFromClass) {
          target.classList.remove(enterFromClass);
        }
        const onAnimationEnd = () => {
          target.classList.remove(enterActiveClass);
          const enterToClass = this.enterToClass();
          if (enterToClass) {
            target.classList.add(enterToClass);
          }
          target.removeEventListener("animationend", onAnimationEnd);
          this.enterListener = null;
          this.animating = false;
        };
        this.enterListener = onAnimationEnd;
        target.addEventListener("animationend", onAnimationEnd);
      }
    } else {
      const enterFromClass = this.enterFromClass();
      if (enterFromClass) {
        target.classList.remove(enterFromClass);
      }
      const enterToClass = this.enterToClass();
      if (enterToClass) {
        target.classList.add(enterToClass);
      }
    }

    if (this.hideOnOutsideClick()) {
      this.bindDocumentClickListener();
    }
    if (this.hideOnEscape()) {
      this.bindDocumentKeydownListener();
    }
    if (this.hideOnResize()) {
      this.bindWindowResizeListener();
    }
  }

  private leave(): void {
    const target = this.target;
    if (!target) {
      return;
    }
    const leaveActiveClass = this.leaveActiveClass();
    if (leaveActiveClass) {
      if (!this.animating) {
        this.animating = true;
        target.classList.add(leaveActiveClass);
        const leaveFromClass = this.leaveFromClass();
        if (leaveFromClass) {
          target.classList.remove(leaveFromClass);
        }
        const onAnimationEnd = () => {
          target.classList.remove(leaveActiveClass);
          const leaveToClass = this.leaveToClass();
          if (leaveToClass) {
            target.classList.add(leaveToClass);
          }
          target.removeEventListener("animationend", onAnimationEnd);
          this.leaveListener = null;
          this.animating = false;
        };
        this.leaveListener = onAnimationEnd;
        target.addEventListener("animationend", onAnimationEnd);
      }
    } else {
      const leaveFromClass = this.leaveFromClass();
      if (leaveFromClass) {
        target.classList.remove(leaveFromClass);
      }
      const leaveToClass = this.leaveToClass();
      if (leaveToClass) {
        target.classList.add(leaveToClass);
      }
    }

    if (this.hideOnOutsideClick()) {
      this.unbindDocumentClickListener();
    }
    if (this.hideOnEscape()) {
      this.unbindDocumentKeydownListener();
    }
    if (this.hideOnResize()) {
      this.unbindWindowResizeListener();
    }
  }

  private isVisible(): boolean {
    return this.target?.offsetParent !== null;
  }

  private isOutsideClick(event: MouseEvent): boolean {
    const hostEl = this.el.nativeElement;
    const eventTarget = event.target as Node;
    return (
      !hostEl.isSameNode(eventTarget) &&
      !hostEl.contains(eventTarget) &&
      !this.target?.contains(eventTarget)
    );
  }

  private bindDocumentClickListener(): void {
    if (this.documentClickListener) {
      return;
    }
    this.documentClickListener = (event: MouseEvent) => {
      if (!this.isVisible()) {
        this.unbindDocumentClickListener();
      } else if (this.isOutsideClick(event)) {
        this.leave();
      }
    };
    document.addEventListener("click", this.documentClickListener);
  }

  private unbindDocumentClickListener(): void {
    if (this.documentClickListener) {
      document.removeEventListener("click", this.documentClickListener);
      this.documentClickListener = null;
    }
  }

  private bindDocumentKeydownListener(): void {
    if (this.documentKeydownListener) {
      return;
    }
    this.documentKeydownListener = (event: KeyboardEvent) => {
      if (!this.isVisible()) {
        this.unbindDocumentKeydownListener();
      } else if (event.key === "Escape") {
        this.leave();
      }
    };
    document.addEventListener("keydown", this.documentKeydownListener);
  }

  private unbindDocumentKeydownListener(): void {
    if (this.documentKeydownListener) {
      document.removeEventListener("keydown", this.documentKeydownListener);
      this.documentKeydownListener = null;
    }
  }

  private bindWindowResizeListener(): void {
    if (this.windowResizeListener) {
      return;
    }
    this.windowResizeListener = () => {
      if (!this.isVisible()) {
        this.unbindWindowResizeListener();
      } else {
        this.leave();
      }
    };
    window.addEventListener("resize", this.windowResizeListener);
  }

  private unbindWindowResizeListener(): void {
    if (this.windowResizeListener) {
      window.removeEventListener("resize", this.windowResizeListener);
      this.windowResizeListener = null;
    }
  }

  ngOnDestroy(): void {
    this.target = null;
    this.unbindDocumentClickListener();
    this.unbindDocumentKeydownListener();
    this.unbindWindowResizeListener();
  }
}
