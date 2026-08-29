import { Directive, booleanAttribute, input } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  getOuterHeight,
  getOuterWidth,
  getViewport,
  getWindowScrollLeft,
  getWindowScrollTop,
} from "@ultimate/uix-utils/dom";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { UBaseComponent } from "@ultimate/ng-core";
import { tooltipStyleModule } from "./tooltip-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Tooltip` directive (see
 * `.vendor-extracted/ng/tooltip/tooltip.ts`). Shows advisory content next to
 * its host element on hover/focus.
 *
 * Deliberately excludes upstream's much larger prop surface —
 * `tooltipEvent`/`positionStyle`/`tooltipStyleClass`/`tooltipZIndex`/
 * `escape`/`showDelay`/`hideDelay`/`life`/`positionTop`/`positionLeft`/
 * `autoHide`/`fitContent`/`hideOnEscape`/`showOnEllipsis`/`tooltipOptions`/
 * `appendTo`, its `TemplateRef` content type, its touch/click/document-escape/
 * scroll/resize listener wiring, its `ConnectedOverlayScrollHandler`, its
 * `p-dialog` ancestor special-case, and its ellipsis-detection gate — none of
 * these appear in this task's Interfaces section, which defines a smaller,
 * spec-mandated signal-input surface: `uTooltip` (text), `uTooltipPosition`,
 * `uTooltipDisabled`. A future task needing delay/appendTo/escape support
 * can extend this directive's input surface then.
 *
 * DISCREPANCY (brief vs. real extracted source): upstream's `align()` tries
 * up to 4 positions in a priority order (e.g. `top` falls back to
 * `bottom`/`right`/`left` if the first choice is out of viewport bounds, via
 * its own `isOutOfBounds()`/`getHostOffset()`/`preAlign()` helpers). This
 * task's brief (Step 5) only asks to "position it ... relative to the host
 * element per the input `uTooltipPosition`" — a single fixed position, no
 * fallback search — and `UTooltipOptions` (Task 10) only has a plain
 * `position` field with no fallback-order concept. Adapted to the brief's
 * simpler, explicit single-position contract rather than porting upstream's
 * 4-way fallback search. `getViewport()` is still used (per this task's
 * Interfaces section) for a horizontal clamp only — `align()` never lets the
 * tooltip render left of `0` or past the viewport's right edge. Vertical
 * clamping/repositioning (upstream's true out-of-bounds fallback, e.g.
 * flipping `top` to `bottom` when there's no room above the host) is NOT
 * implemented, since that reposition logic is inseparable from upstream's
 * fallback-search mechanism this task deliberately excludes.
 *
 * Z-index: upstream calls `ZIndexUtils.set('tooltip', this.container,
 * this.config.zIndex.tooltip)` (a global-config-driven base). This project's
 * `@ultimate/uix-utils` equivalent is the `ZIndex` singleton (`ZIndex.set(key,
 * element, baseZIndex)` / `ZIndex.clear(element)` — see
 * `packages/ng-core/src/overlay/overlay.ts` for the established call
 * pattern), used here with key `"tooltip"` and a literal base of `1100`
 * (above `UOverlay`'s `1000` overlay base, matching PrimeNG's own tokens.css
 * default stacking order where `--u-tooltip-z-index` sits above
 * `--u-overlay-z-index`) since `UltimateConfig` (Task 4's scoped-down
 * config) has no `zIndex` sub-config to read from.
 *
 * All DOM creation is guarded behind `isPlatformBrowser()` per the SSR
 * requirement (matching upstream's own `onAfterViewInit` guard and this
 * project's established `URipple`/`UOverlay` pattern).
 */
@Directive({
  selector: "[uTooltip]",
  standalone: true,
  host: {
    "(mouseenter)": "show()",
    "(mouseleave)": "hide()",
    "(focus)": "show()",
    "(blur)": "hide()",
  },
})
export class UTooltip extends UBaseComponent {
  protected override readonly componentName = "tooltip";
  protected override readonly styleModule = tooltipStyleModule;

  /** Content of the tooltip. */
  uTooltip = input<string>();
  /** Position of the tooltip. */
  uTooltipPosition = input<"top" | "bottom" | "left" | "right">("top");
  /** When present, it specifies that the tooltip should be disabled. */
  uTooltipDisabled = input(false, { transform: booleanAttribute });

  private container: HTMLElement | null = null;

  protected show(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const text = this.uTooltip();
    if (!text || this.uTooltipDisabled()) {
      return;
    }

    this.remove();
    this.container = this.create(text);
    this.renderer.appendChild(this.document.body, this.container);
    this.align(this.container);
    ZIndex.set("tooltip", this.container, 1100);
  }

  protected hide(): void {
    ZIndex.clear(this.container as HTMLElement);
    this.remove();
  }

  private create(text: string): HTMLElement {
    const container = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(container, "class", this.cx("root") ?? "");
    this.renderer.setAttribute(container, "role", "tooltip");

    const arrow = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(arrow, "class", this.cx("arrow") ?? "");
    this.renderer.appendChild(container, arrow);

    const textEl = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(textEl, "class", this.cx("text") ?? "");
    this.renderer.appendChild(textEl, this.renderer.createText(text));
    this.renderer.appendChild(container, textEl);

    this.renderer.addClass(container, `u-tooltip-${this.uTooltipPosition()}`);

    return container;
  }

  /**
   * Positions `container` relative to the host element per
   * `uTooltipPosition()`, matching upstream's own
   * `getHostOffset()`/`alignTop()`/`alignBottom()`/`alignLeft()`/
   * `alignRight()` offset math (single fixed position — see this
   * directive's doc comment for the fallback-search scope-down).
   */
  private align(container: HTMLElement): void {
    const hostEl = this.el.nativeElement as HTMLElement;
    const hostOffset = hostEl.getBoundingClientRect();
    const hostLeft = hostOffset.left + getWindowScrollLeft();
    const hostTop = hostOffset.top + getWindowScrollTop();

    const hostWidth = getOuterWidth(hostEl);
    const hostHeight = getOuterHeight(hostEl);
    const containerWidth = getOuterWidth(container);
    const containerHeight = getOuterHeight(container);

    let left = hostLeft;
    let top = hostTop;

    switch (this.uTooltipPosition()) {
      case "left":
        left = hostLeft - containerWidth;
        top = hostTop + (hostHeight - containerHeight) / 2;
        break;
      case "right":
        left = hostLeft + hostWidth;
        top = hostTop + (hostHeight - containerHeight) / 2;
        break;
      case "bottom":
        left = hostLeft + (hostWidth - containerWidth) / 2;
        top = hostTop + hostHeight;
        break;
      case "top":
      default:
        left = hostLeft + (hostWidth - containerWidth) / 2;
        top = hostTop - containerHeight;
        break;
    }

    // `getViewport()` is consulted per this task's Interfaces section, to
    // clamp the tooltip's horizontal position within the browser window
    // rather than letting it render fully off-screen.
    const viewport = getViewport();
    if (left + containerWidth > viewport.width) {
      left = viewport.width - containerWidth;
    }
    if (left < 0) {
      left = 0;
    }

    this.renderer.setStyle(container, "left", `${left}px`);
    this.renderer.setStyle(container, "top", `${top}px`);
  }

  private remove(): void {
    if (this.container) {
      this.renderer.removeChild(this.document.body, this.container);
      this.container = null;
    }
  }

  ngOnDestroy(): void {
    this.remove();
  }
}
