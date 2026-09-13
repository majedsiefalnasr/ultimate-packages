import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { ZIndex } from "@ultimate/uix-utils/zindex";

/**
 * Moves the host element to `document.body` (or a given `HTMLElement`) and
 * assigns it a z-index once `visible` becomes `true`, restoring it to its
 * original DOM position and clearing the z-index once `visible` becomes
 * `false`.
 *
 * Z-indexes are assigned via `@ultimate/uix-utils`'s `ZIndex` handler
 * (`packages/uix-utils/src/zindex/index.ts`'s exported `ZIndex` object —
 * `ZIndex.set(key, element, baseZIndex)` / `ZIndex.clear(element)`), the
 * same stacking-context registry PrimeNG itself uses, rather than a
 * locally invented counter.
 *
 * Deliberately does *not* orchestrate enter/leave motion itself — the
 * `visibleChange` output and DOM move are the full extent of this
 * directive's responsibility. Per the Phase 2 Overlay Architecture
 * responsibility split, motion orchestration (wiring `@ultimate/uix-motion`'s
 * `createMotion`) belongs to the consuming component (e.g. Task 15's
 * `UDialog`), not to `UOverlay`.
 *
 * All DOM manipulation is guarded behind `isPlatformBrowser()` per the
 * SSR requirement — this directive is a no-op on the server.
 */
@Directive({
  selector: "[uOverlay]",
  standalone: true,
})
export class UOverlay {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly platformId: object = inject(PLATFORM_ID);
  private readonly document: Document = inject(DOCUMENT);

  /** Whether the overlay is currently shown. */
  visible = input(false);
  visibleChange = output<boolean>();

  /** Where to move the host element to when shown: "body" or a given element. */
  appendTo = input<"body" | HTMLElement>("body");

  private originalParent: Node | null = null;
  private originalNextSibling: Node | null = null;
  private appended = false;

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (visible) {
        this.append();
      } else {
        this.restore();
      }
    });
  }

  private append(): void {
    if (this.appended) {
      return;
    }
    const hostEl = this.el.nativeElement;
    this.originalParent = hostEl.parentNode;
    this.originalNextSibling = hostEl.nextSibling;

    const appendTo = this.appendTo();
    const target = appendTo === "body" ? this.document.body : appendTo;
    this.renderer.appendChild(target, hostEl);
    ZIndex.set("overlay", hostEl, 1000);
    this.appended = true;
  }

  private restore(): void {
    if (!this.appended) {
      return;
    }
    const hostEl = this.el.nativeElement;
    ZIndex.clear(hostEl);
    if (this.originalParent) {
      this.renderer.insertBefore(this.originalParent, hostEl, this.originalNextSibling);
    }
    this.originalParent = null;
    this.originalNextSibling = null;
    this.appended = false;
  }

  /**
   * Removes the host element from wherever `append()` moved it
   * (`document.body` or a custom `appendTo` target) if this directive is
   * destroyed while still `appended` — e.g. a consumer (`UDialog`) torn
   * down by a parent `@if`/`*ngIf` while `visible` is still `true`, never
   * transitioning to `false` first. Deliberately does NOT call `restore()`:
   * `restore()` reinserts the host element back at `originalParent`, which
   * is the correct behavior for a normal hide-while-still-alive transition,
   * but is wrong here — on destroy, the original parent's own view is being
   * torn down too, so the moved node should simply be removed from the DOM,
   * not resurrected into a parent Angular is no longer tracking. Mirrors
   * `UTooltip`'s own `remove()`-in-`ngOnDestroy` pattern for the same class
   * of "this directive moved a node outside its own view, so ordinary view
   * teardown won't clean it up" problem (packages/ng/src/tooltip/tooltip.ts).
   */
  ngOnDestroy(): void {
    if (!this.appended) {
      return;
    }
    const hostEl = this.el.nativeElement;
    ZIndex.clear(hostEl);
    const parent = hostEl.parentNode;
    if (parent) {
      this.renderer.removeChild(parent, hostEl);
    }
    this.originalParent = null;
    this.originalNextSibling = null;
    this.appended = false;
  }
}
