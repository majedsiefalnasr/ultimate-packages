import { Directive, booleanAttribute, inject, input } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  getOuterHeight,
  getOuterWidth,
  getViewport,
  getWindowScrollLeft,
  getWindowScrollTop,
} from "@ultimate/uix-utils/dom";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { ComponentIdGenerator, UBaseComponent } from "@ultimate/ng-core";
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
 *
 * BREAKING CHANGE — requires `ComponentIdGenerator`: this directive injects
 * `ComponentIdGenerator` (from `@ultimate/ng-core`) to generate its
 * floating container's `id` in an SSR-deterministic way (GAP-006 fix,
 * Blueprint Completion 2026-09-13). The consuming application MUST provide
 * `ComponentIdGenerator` at bootstrap — same requirement `UDialog` already
 * documents and enforces, see `packages/ng/src/dialog/dialog.ts`.
 * `aria-describedby` is set on the host element while the tooltip is
 * visible, merging with (not replacing) any pre-existing token list, and
 * restored to its exact pre-show value on hide (including on destroy while
 * still visible) — mirroring `packages/react/src/tooltip/tooltip.tsx`'s
 * already-shipped merge/restore behavior for the same problem.
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

  private readonly idGenerator = inject(ComponentIdGenerator);
  private container: HTMLElement | null = null;
  private describedById: string | null = null;

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
    this.attachDescribedBy(this.container.id);
  }

  protected hide(): void {
    if (this.container) {
      ZIndex.clear(this.container);
    }
    this.detachDescribedBy();
    this.remove();
  }

  private create(text: string): HTMLElement {
    const container = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(container, "id", this.idGenerator.next("u_tooltip"));
    this.renderer.setAttribute(container, "class", this.cx("root") ?? "");
    this.renderer.setAttribute(container, "role", "tooltip");
    // The shared `.u-tooltip` rule is `display: none`; an inline display
    // outranks it (GAP-066). Set at creation, before `align()` measures the
    // container, since a `display: none` element measures 0x0.
    this.renderer.setStyle(container, "display", "inline-block");

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

  /**
   * Merges `tooltipId` into the host's existing `aria-describedby` token
   * list rather than overwriting it, so a consumer-provided
   * `aria-describedby` (e.g. describing form-field validation text)
   * survives alongside this tooltip's own id — matching
   * `packages/react/src/tooltip/tooltip.tsx`'s already-shipped behavior for
   * the same problem.
   */
  private attachDescribedBy(tooltipId: string): void {
    const hostEl = this.el.nativeElement as HTMLElement;
    const existing = hostEl.getAttribute("aria-describedby");
    const ids = existing ? existing.split(" ").filter(Boolean) : [];
    if (!ids.includes(tooltipId)) {
      this.renderer.setAttribute(hostEl, "aria-describedby", [...ids, tooltipId].join(" "));
    }
    this.describedById = tooltipId;
  }

  /**
   * Removes only this tooltip's own id from the host's `aria-describedby`
   * token list, preserving any other ids that were present before this
   * tooltip attached its own — and removes the attribute entirely once no
   * tokens remain, rather than leaving an empty string.
   */
  private detachDescribedBy(): void {
    if (!this.describedById) {
      return;
    }
    const hostEl = this.el.nativeElement as HTMLElement;
    const existing = hostEl.getAttribute("aria-describedby");
    const remaining = existing
      ? existing.split(" ").filter((tokenId) => tokenId && tokenId !== this.describedById)
      : [];
    if (remaining.length > 0) {
      this.renderer.setAttribute(hostEl, "aria-describedby", remaining.join(" "));
    } else {
      this.renderer.removeAttribute(hostEl, "aria-describedby");
    }
    this.describedById = null;
  }

  private remove(): void {
    if (this.container) {
      this.renderer.removeChild(this.document.body, this.container);
      this.container = null;
    }
  }

  ngOnDestroy(): void {
    // Clears both the floating DOM element (pre-existing behavior) and the
    // host's aria-describedby token (GAP-006 fix, Blueprint Completion
    // 2026-09-13) — a tooltip destroyed while still visible (e.g. its host
    // is removed from an *ngIf-gated template without a prior
    // mouseleave/blur) must not leave a stale aria-describedby reference
    // pointing at an id no longer present anywhere in the DOM.
    this.detachDescribedBy();
    this.remove();
  }
}
