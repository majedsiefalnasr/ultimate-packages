import {
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  Renderer2,
  effect,
  inject,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  addClass,
  getHeight,
  getOffset,
  getOuterHeight,
  getOuterWidth,
  getWidth,
  removeClass,
  remove as removeElement,
} from "@ultimate/uix-utils/dom";
import { UltimateConfig } from "@ultimate/ng-core";

/**
 * Ultimate-owned adaptation of PrimeNG's `Ripple` directive. Adds a
 * material-style ink ripple effect to its host element on `mousedown`,
 * matching `.vendor-extracted/ng/ripple/ripple.ts`'s own `mousedown`
 * listener (not `pointerdown`).
 *
 * Deliberately excludes PrimeNG's `RippleStyle`/`BaseComponent` styling
 * registration and `$unstyled()` gate — see `UBaseComponent`'s doc comment
 * for the same architectural exclusion pattern. The `.u-ink`/`.u-ink-active`
 * class names (renamed from upstream's `.p-ink`/`.p-ink-active`) are applied
 * unconditionally; a future consumer wanting unstyled mode can gate this at
 * a higher layer.
 */
@Directive({
  standalone: true,
  selector: "[uRipple]",
  host: {
    class: "u-ripple",
  },
})
export class URipple {
  private readonly document: Document = inject(DOCUMENT);
  private readonly platformId: object = inject(PLATFORM_ID);
  private readonly el: ElementRef = inject(ElementRef);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly zone: NgZone = inject(NgZone);
  private readonly config: UltimateConfig = inject(UltimateConfig);

  private animationListener?: () => void;
  private mouseDownListener?: () => void;
  private timeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        if (this.config.ripple()) {
          this.zone.runOutsideAngular(() => {
            this.create();
            this.mouseDownListener = this.renderer.listen(
              this.el.nativeElement,
              "mousedown",
              this.onMouseDown.bind(this)
            );
          });
        } else {
          this.remove();
        }
      }
    });
  }

  private onMouseDown(event: MouseEvent): void {
    const ink = this.getInk();
    if (!ink || this.document.defaultView?.getComputedStyle(ink, null).display === "none") {
      return;
    }

    removeClass(ink, "u-ink-active");
    ink.setAttribute("data-u-ink-active", "false");

    if (!getHeight(ink) && !getWidth(ink)) {
      const d = Math.max(
        getOuterWidth(this.el.nativeElement),
        getOuterHeight(this.el.nativeElement)
      );
      ink.style.height = d + "px";
      ink.style.width = d + "px";
    }

    const offset = getOffset(this.el.nativeElement) as { left: number; top: number };
    const x = event.pageX - offset.left + this.document.body.scrollTop - getWidth(ink) / 2;
    const y = event.pageY - offset.top + this.document.body.scrollLeft - getHeight(ink) / 2;

    this.renderer.setStyle(ink, "top", y + "px");
    this.renderer.setStyle(ink, "left", x + "px");

    addClass(ink, "u-ink-active");
    ink.setAttribute("data-u-ink-active", "true");

    this.timeout = setTimeout(() => {
      const activeInk = this.getInk();
      if (activeInk) {
        removeClass(activeInk, "u-ink-active");
        activeInk.setAttribute("data-u-ink-active", "false");
      }
    }, 401);
  }

  private getInk(): HTMLElement | null {
    const children = this.el.nativeElement.children;
    for (let i = 0; i < children.length; i++) {
      if (
        typeof children[i].className === "string" &&
        children[i].className.indexOf("u-ink") !== -1
      ) {
        return children[i];
      }
    }
    return null;
  }

  private onAnimationEnd(event: Event): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    const target = event.currentTarget as HTMLElement;
    removeClass(target, "u-ink-active");
    target.setAttribute("data-u-ink-active", "false");
  }

  private create(): void {
    const ink = this.renderer.createElement("span");
    this.renderer.addClass(ink, "u-ink");
    this.renderer.appendChild(this.el.nativeElement, ink);
    this.renderer.setAttribute(ink, "data-u-ink", "true");
    this.renderer.setAttribute(ink, "data-u-ink-active", "false");
    this.renderer.setAttribute(ink, "aria-hidden", "true");
    this.renderer.setAttribute(ink, "role", "presentation");

    if (!this.animationListener) {
      this.animationListener = this.renderer.listen(
        ink,
        "animationend",
        this.onAnimationEnd.bind(this)
      );
    }
  }

  private remove(): void {
    const ink = this.getInk();
    if (ink) {
      this.mouseDownListener?.();
      this.animationListener?.();
      this.mouseDownListener = undefined;
      this.animationListener = undefined;

      removeElement(ink);
    }
  }

  ngOnDestroy(): void {
    if (this.config.ripple()) {
      this.remove();
    }
  }
}
