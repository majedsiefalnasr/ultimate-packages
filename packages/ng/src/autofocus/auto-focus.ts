import { Directive, ElementRef, PLATFORM_ID, booleanAttribute, inject, input } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { getFocusableElements } from "@ultimate/uix-utils/dom";

/**
 * Ultimate-owned adaptation of PrimeNG's `AutoFocus` directive. Manages
 * focus on a focusable element on load, matching
 * `.vendor-extracted/ng/autofocus/autofocus.ts`'s own `AfterContentChecked`/
 * `AfterViewChecked` timing (`setTimeout`-deferred `focus()` call so it runs
 * after the current change-detection pass).
 */
@Directive({
  standalone: true,
  selector: "[uAutoFocus]",
})
export class UAutoFocus {
  private readonly platformId: object = inject(PLATFORM_ID);
  private readonly host: ElementRef = inject(ElementRef);

  /**
   * When present, it specifies that the component should automatically get
   * focus on load.
   */
  autofocus = input(false, { alias: "uAutoFocus", transform: booleanAttribute });

  private focused = false;

  ngAfterContentChecked(): void {
    // This sets the `attr.autofocus` which is different than the Input
    // `autofocus` attribute.
    if (this.autofocus() === false) {
      this.host.nativeElement.removeAttribute("autofocus");
    } else {
      this.host.nativeElement.setAttribute("autofocus", true);
    }

    if (!this.focused) {
      this.autoFocus();
    }
  }

  ngAfterViewChecked(): void {
    if (!this.focused) {
      this.autoFocus();
    }
  }

  private autoFocus(): void {
    if (isPlatformBrowser(this.platformId) && this.autofocus()) {
      setTimeout(() => {
        const focusableElements = getFocusableElements(this.host?.nativeElement);

        if (focusableElements.length === 0) {
          this.host.nativeElement.focus();
        }
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }

        this.focused = true;
      });
    }
  }
}
