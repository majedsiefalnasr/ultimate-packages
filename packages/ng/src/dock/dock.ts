import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output, signal } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { dockStyleModule } from "./dock-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Dock` component (see
 * `.vendor-extracted/ng/dock/dock.ts`). Renders a macOS-dock-style bar of
 * menuitems; the per-icon magnification-on-hover effect is CSS-driven
 * (`dock-style.ts`'s doc comment), matching real PrimeNG 21.1.9's own
 * `Dock`, which tracks a hover index (`currentIndex`) purely for
 * mouseenter/mouseleave bookkeeping and never reads it for scale/transform
 * styling — confirmed identical across all 3 pinned Prime tarballs
 * (PrimeNG, PrimeReact, PrimeVue) for this task's own pinned versions.
 *
 * Real PrimeNG's `Dock` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component driven by a flat
 * `MenuItem[]` model, not a composition of `Menu`. This adaptation follows
 * that same independent shape.
 */
@Component({
  standalone: true,
  selector: "u-dock",
  imports: [NgTemplateOutlet, RouterModule],
  template: `
    <div [class]="cx('root', { position: position() })">
      <div [class]="cx('listContainer')">
        <ul [class]="cx('list')" role="menu" [attr.aria-label]="ariaLabel()" (keydown)="onKeydown($event)">
          @for (item of model(); track item.label; let i = $index) {
            @if (item.visible !== false) {
              <li [class]="cx('item', itemParams(item, i))" role="none">
                @if (item.routerLink && !item.disabled) {
                  <a
                    [routerLink]="item.routerLink"
                    [target]="item.target"
                    [class]="cx('itemLink')"
                    role="menuitem"
                    [attr.aria-label]="item.label"
                    [attr.aria-disabled]="isDisabled(item)"
                    [attr.data-u-active]="hoveredIndex() === i"
                    (click)="onItemClick($event, item)"
                    (mouseenter)="onItemMouseEnter(i)"
                    (mouseleave)="onListMouseLeave()"
                  >
                    <ng-container [ngTemplateOutlet]="itemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
                  </a>
                } @else {
                  <a
                    [attr.href]="item.url ?? '#'"
                    [target]="item.target"
                    [class]="cx('itemLink')"
                    role="menuitem"
                    [attr.aria-label]="item.label"
                    [attr.aria-disabled]="isDisabled(item)"
                    [attr.data-u-active]="hoveredIndex() === i"
                    (click)="onItemClick($event, item)"
                    (mouseenter)="onItemMouseEnter(i)"
                    (mouseleave)="onListMouseLeave()"
                  >
                    <ng-container [ngTemplateOutlet]="itemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
                  </a>
                }
              </li>
            }
          }
        </ul>
      </div>
    </div>
    <ng-template #itemContent let-item>
      @if (item.icon) {
        <span [class]="[cx('itemIcon'), item.icon]"></span>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UDock extends UBaseComponent {
  protected override readonly componentName = "dock";
  protected override readonly styleModule = dockStyleModule;

  /** MenuModel instance to define the action items. */
  model = input<UMenuItem[]>([]);
  /** Position of element. */
  position = input<"bottom" | "top" | "left" | "right">("bottom");
  /** Defines a string that labels the input for accessibility. */
  ariaLabel = input<string>();

  /** Fired when an item is clicked. */
  onItemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected readonly hoveredIndex = signal(-3);

  protected itemParams(item: UMenuItem, index: number) {
    return { active: this.hoveredIndex() === index, disabled: this.isDisabled(item) };
  }

  protected isDisabled(item: UMenuItem): boolean {
    return !!item.disabled;
  }

  protected onItemMouseEnter(index: number): void {
    this.hoveredIndex.set(index);
  }

  protected onListMouseLeave(): void {
    this.hoveredIndex.set(-3);
  }

  protected onItemClick(event: MouseEvent, item: UMenuItem): void {
    if (this.isDisabled(item)) {
      event.preventDefault();
      return;
    }
    this.onItemSelect.emit({ originalEvent: event, item });
    if (item.command) {
      item.command({ originalEvent: event, item });
    }
    if (!item.url) {
      event.preventDefault();
    }
  }

  /**
   * Roving focus among rendered dock items (Spec §5.4, GAP-055), bound on
   * the `<ul role="menu">` itself — never on an individual item `<a>` —
   * matching the ancestor-binding requirement already established while
   * fixing GAP-054 (a keydown handler on a trigger element never observes
   * events from sibling items). Axis follows `position()`: ArrowRight/
   * ArrowLeft move focus for a top/bottom-positioned dock, ArrowUp/
   * ArrowDown for a left/right-positioned one (real Prime's own axis-
   * follows-orientation convention). Home/End jump to the first/last item
   * regardless of orientation. Disabled items are skipped.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const item = this.resolveOwnItem(event.target);
    if (!item) return;

    const horizontal = this.position() === "top" || this.position() === "bottom";
    const nextCode = horizontal ? "ArrowRight" : "ArrowDown";
    const prevCode = horizontal ? "ArrowLeft" : "ArrowUp";

    switch (event.code) {
      case nextCode:
        event.preventDefault();
        this.moveFocus(item, 1);
        break;
      case prevCode:
        event.preventDefault();
        this.moveFocus(item, -1);
        break;
      case "Home":
        event.preventDefault();
        this.focusEdge("first");
        break;
      case "End":
        event.preventDefault();
        this.focusEdge("last");
        break;
    }
  }

  /**
   * Resolves the `UMenuItem` this event's target `<a>` belongs to, indexing
   * into the same rendered-items subset `getItemLinks()` draws its DOM
   * nodes from (never the full, possibly-longer `model()` array) — applying
   * GAP-054's own index-mapping lesson proactively for Dock's `visible:
   * false` support.
   */
  private resolveOwnItem(target: EventTarget | null): UMenuItem | null {
    const links = this.getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (this.renderedItems()[index] ?? null);
  }

  /** This dock's own rendered item links, in DOM order. */
  private getItemLinks(): HTMLAnchorElement[] {
    const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(":scope > li > a")) : [];
  }

  /** Items that actually render their own `<a>` (excludes hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
  private renderedItems(): UMenuItem[] {
    return this.model().filter((candidate) => candidate.visible !== false);
  }

  private moveFocus(current: UMenuItem, direction: 1 | -1): void {
    const enabled = this.renderedItems().filter((candidate) => !this.isDisabled(candidate));
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = this.getItemLinks();
    const targetIndex = this.renderedItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  }

  private focusEdge(edge: "first" | "last"): void {
    const enabled = this.renderedItems().filter((candidate) => !this.isDisabled(candidate));
    if (enabled.length === 0) return;
    const targetItem = edge === "first" ? enabled[0] : enabled[enabled.length - 1];
    const links = this.getItemLinks();
    const targetIndex = this.renderedItems().indexOf(targetItem);
    links[targetIndex]?.focus();
  }
}
