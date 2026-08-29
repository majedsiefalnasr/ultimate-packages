import { Directive, ElementRef, Renderer2, computed, effect, input, signal } from "@angular/core";
import { cn } from "@ultimate/uix-utils/classnames";
import { equals } from "@ultimate/uix-utils/object";

/**
 * Ultimate-owned adaptation of PrimeNG's `Bind` directive. Applies dynamic
 * attribute, property, and event-listener bindings to its host element from
 * an arbitrary `Record<string, unknown>`.
 *
 * Deliberately excludes PrimeNG's `pt`/passthrough machinery — see
 * `UBaseComponent`'s doc comment for the same architectural exclusion. This
 * directive is foundation infrastructure only in Phase 2: no Phase 2
 * component wires it in directly (PrimeNG's own usage of `Bind` in
 * Button/Dialog/Menu is exclusively through the `pt`/`ptm(...)` passthrough
 * call sites, which `UBaseComponent` excludes).
 */
@Directive({
  standalone: true,
  selector: "[uBind]",
  host: {
    "[style]": "styles()",
    "[class]": "classes()",
  },
})
export class UBind {
  /**
   * Dynamic attributes, properties, and event listeners to be applied to
   * the host element.
   */
  uBind = input<Record<string, unknown> | undefined>(undefined);

  private _attrs = signal<Record<string, unknown> | undefined>(undefined);
  private attrs = computed(() => this._attrs() || this.uBind());

  styles = computed(() => this.attrs()?.["style"]);
  classes = computed(() => cn(this.attrs()?.["class"]));

  private listeners: { eventName: string; unlisten: () => void }[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    effect(() => {
      const { style, class: className, ...rest } = this.attrs() || {};

      for (const [key, value] of Object.entries(rest)) {
        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.slice(2).toLowerCase();

          // add listener if not already added
          if (!this.listeners.some((l) => l.eventName === eventName)) {
            const unlisten = this.renderer.listen(
              this.el.nativeElement,
              eventName,
              value as (event: unknown) => void
            );
            this.listeners.push({ eventName, unlisten });
          }
        } else if (value === null || value === undefined) {
          // remove attr
          this.renderer.removeAttribute(this.el.nativeElement, key);
        } else {
          // attr & prop fallback
          this.renderer.setAttribute(this.el.nativeElement, key, String(value));
          if (key in this.el.nativeElement) {
            (this.el.nativeElement as Record<string, unknown>)[key] = value;
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.clearListeners();
  }

  public setAttrs(attrs: Record<string, unknown> | undefined): void {
    if (!equals(this._attrs(), attrs)) {
      this._attrs.set(attrs);
    }
  }

  private clearListeners(): void {
    this.listeners.forEach(({ unlisten }) => unlisten());
    this.listeners = [];
  }
}
