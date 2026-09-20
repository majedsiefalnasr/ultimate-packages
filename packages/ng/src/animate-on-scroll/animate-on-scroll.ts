import { Directive, ElementRef, Renderer2, inject, input, numberAttribute, booleanAttribute, DestroyRef } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { PLATFORM_ID } from "@angular/core";

/**
 * Ultimate-owned adaptation of PrimeNG's `AnimateOnScroll` directive (see
 * `.vendor-extracted/ng/animateonscroll/animateonscroll.ts`). Confirmed
 * against real source: a standalone `@Directive` (matching Vue's own real
 * `AnimateOnScroll.js`, a custom directive via `BaseDirective.extend` —
 * both frameworks realize this capability as a directive, not a wrapper
 * component, per this task's own expectation).
 *
 * Real mechanism kept faithfully: an `IntersectionObserver` toggles
 * `enterClass`/`leaveClass` on the host element as it crosses the
 * viewport, guarded against re-triggering mid-animation via an
 * `animationState` flag, with a second "reset" `IntersectionObserver`
 * (threshold 0) that clears the applied class once the element fully
 * leaves the viewport from above (so it can animate again on a future
 * re-entry) — this exact 2-observer shape is real source's own mechanism,
 * not invented. `once` stops re-observing after the first `enter()`.
 *
 * Uses signals/`effect()`-free plain `IntersectionObserver` callbacks
 * (not Angular change-detection-triggered) per this session's Angular
 * IntersectionObserver/scroll-driven guidance — DOM class mutation is
 * applied directly via `Renderer2`, not through a template binding, so no
 * signal/`effect()` is needed here (there is no Angular-rendered state to
 * keep in sync, unlike `UScrollTop`'s `visible` signal).
 */
@Directive({
  selector: "[uAnimateOnScroll]",
  standalone: true,
})
export class UAnimateOnScroll {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** CSS class applied when the element enters the viewport. */
  enterClass = input<string>();
  /** CSS class applied when the element leaves the viewport. */
  leaveClass = input<string>();
  /** `IntersectionObserver` `root` option. */
  root = input<HTMLElement | null>(null);
  /** `IntersectionObserver` `rootMargin` option. */
  rootMargin = input<string>();
  /** `IntersectionObserver` `threshold` option. */
  threshold = input(0.5, { transform: numberAttribute });
  /** Whether to stop observing after the first enter animation. */
  once = input(false, { transform: booleanAttribute });

  private observer?: IntersectionObserver;
  private resetObserver?: IntersectionObserver;
  private isObserverActive = false;
  private animationState?: "enter" | "leave";
  private animationEndListener?: () => void;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const el = this.el.nativeElement;
    this.renderer.setStyle(el, "opacity", this.enterClass() ? "0" : "");
    // Deferred to a macrotask matching real source's own `setTimeout(() =>
    // observer.observe(...), 0)` — avoids observing before the element has
    // its final layout position on first paint.
    setTimeout(() => this.bindIntersectionObserver(), 0);
    this.destroyRef.onDestroy(() => {
      this.unbindAnimationEvents();
      this.unbindIntersectionObserver();
    });
  }

  private get options(): IntersectionObserverInit {
    return { root: this.root(), rootMargin: this.rootMargin(), threshold: this.threshold() || 0.5 };
  }

  private bindIntersectionObserver(): void {
    const el = this.el.nativeElement;

    this.observer = new IntersectionObserver(([entry]) => {
      if (this.isObserverActive) {
        if (entry.boundingClientRect.top > 0) {
          entry.isIntersecting ? this.enter() : this.leave();
        }
      } else if (entry.isIntersecting) {
        this.enter();
      }
      this.isObserverActive = true;
    }, this.options);
    this.observer.observe(el);

    this.resetObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.boundingClientRect.top > 0 && !entry.isIntersecting) {
          this.renderer.setStyle(el, "opacity", this.enterClass() ? "0" : "");
          this.removeClasses();
          this.resetObserver?.unobserve(el);
        }
        this.animationState = undefined;
      },
      { ...this.options, threshold: 0 }
    );
  }

  private enter(): void {
    if (this.animationState !== "enter" && this.enterClass()) {
      const el = this.el.nativeElement;
      this.renderer.setStyle(el, "opacity", "");
      this.removeClass(this.leaveClass());
      this.addClass(this.enterClass());

      if (this.once()) {
        this.unbindIntersectionObserver();
      }
      this.bindAnimationEvents();
      this.animationState = "enter";
    }
  }

  private leave(): void {
    if (this.animationState !== "leave" && this.leaveClass()) {
      const el = this.el.nativeElement;
      this.renderer.setStyle(el, "opacity", this.enterClass() ? "0" : "");
      this.removeClass(this.enterClass());
      this.addClass(this.leaveClass());
      this.bindAnimationEvents();
      this.animationState = "leave";
    }
  }

  private bindAnimationEvents(): void {
    if (this.animationEndListener) {
      return;
    }
    this.animationEndListener = this.renderer.listen(this.el.nativeElement, "animationend", () => {
      this.removeClasses();
      if (!this.once()) {
        this.resetObserver?.observe(this.el.nativeElement);
      }
      this.unbindAnimationEvents();
    });
  }

  private unbindAnimationEvents(): void {
    this.animationEndListener?.();
    this.animationEndListener = undefined;
  }

  private unbindIntersectionObserver(): void {
    const el = this.el.nativeElement;
    this.observer?.unobserve(el);
    this.resetObserver?.unobserve(el);
    this.isObserverActive = false;
  }

  private addClass(className: string | undefined): void {
    if (className) this.renderer.addClass(this.el.nativeElement, className);
  }

  private removeClass(className: string | undefined): void {
    if (className) this.renderer.removeClass(this.el.nativeElement, className);
  }

  private removeClasses(): void {
    this.removeClass(this.enterClass());
    this.removeClass(this.leaveClass());
  }
}
