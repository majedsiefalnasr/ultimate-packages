import { Directive, ElementRef, inject, input } from "@angular/core";
import { getFocusableElements } from "@ultimate/uix-utils/dom";

/**
 * Traps `Tab`/`Shift+Tab` keyboard focus within the host element's
 * focusable descendants, wrapping from the last back to the first (and
 * vice versa) so focus never escapes to the rest of the document.
 *
 * Focusable descendants are resolved via `@ultimate/uix-utils`'s
 * `getFocusableElements` DOM helper (`packages/uix-utils/src/dom/methods/
 * getFocusableElements.ts`) rather than a locally duplicated query, per
 * the Phase 2 policy of reusing existing framework-neutral utilities.
 *
 * Disable trapping entirely via the `uFocusTrapDisabled` input — used by
 * Task 15's `UDialog` to opt out of trapping for non-modal overlays.
 */
@Directive({
  selector: "[uFocusTrap]",
  standalone: true,
  host: {
    "(keydown.tab)": "onTab($event)",
    "(keydown.shift.tab)": "onShiftTab($event)",
  },
})
export class UFocusTrap {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);

  /** Disables focus trapping when `true`. */
  uFocusTrapDisabled = input(false);

  private getBoundaryElements(): { first: HTMLElement; last: HTMLElement } | undefined {
    const focusable = getFocusableElements(this.el.nativeElement) as HTMLElement[];
    if (focusable.length === 0) {
      return undefined;
    }
    return { first: focusable[0], last: focusable[focusable.length - 1] };
  }

  protected onTab(event: Event): void {
    if (this.uFocusTrapDisabled()) {
      return;
    }
    const boundary = this.getBoundaryElements();
    if (!boundary) {
      return;
    }
    if (document.activeElement === boundary.last) {
      event.preventDefault();
      boundary.first.focus();
    }
  }

  protected onShiftTab(event: Event): void {
    if (this.uFocusTrapDisabled()) {
      return;
    }
    const boundary = this.getBoundaryElements();
    if (!boundary) {
      return;
    }
    if (document.activeElement === boundary.first) {
      event.preventDefault();
      boundary.last.focus();
    }
  }
}
