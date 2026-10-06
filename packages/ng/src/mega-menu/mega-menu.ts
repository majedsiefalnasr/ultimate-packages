import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { UMegaMenuColumnGroup } from "./mega-menu-column";
import { megaMenuStyleModule } from "./mega-menu-style";
import type { UMegaMenuItem } from "./mega-menu-item";

/**
 * Ultimate-owned adaptation of PrimeNG's `MegaMenu` component (see
 * `.vendor-extracted/ng/megamenu/megamenu.ts`, lines 445-1300 — the
 * `MegaMenu` class specifically; the root-level column-grid rendering
 * `MegaMenuSub` handles for `root: true` is inlined here directly, and its
 * per-group leaf rendering is `UMegaMenuColumnGroup`).
 *
 * Renders a horizontal bar of top-level items; a root item with `items`
 * (a `UMegaMenuItem[][]` — see `mega-menu-item.ts`) opens a multi-column
 * overlay grid on click/hover, each column stacking one or more labeled
 * groups (`UMegaMenuColumnGroup`) of flat leaf items — MegaMenu's genuinely
 * distinguishing structural trait vs. Menubar/TieredMenu's single-column
 * nested popups.
 *
 * Real PrimeNG's `MegaMenu` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component — it does NOT
 * compose or wrap `Menu`.
 *
 * Carries real ARIA roles (`menubar`/`menu`/`menuitem`) and roving-focus
 * keyboard navigation (GAP-054, Spec §5.3), matching the same shape already
 * established by this component's own siblings `UMenubar`/`UTieredMenu`.
 * Unlike those two, MegaMenu is a genuine hard 2-level structure (confirmed
 * by `UMegaMenuColumnGroup`'s own doc comment: a column group's leaf items
 * are flat, "not further nested") — so its Escape handling needs only a
 * single `openItem` check at this root level, not a recursive per-level
 * chain. ArrowRight/ArrowLeft move focus horizontally among root items;
 * Enter/Space on a column-having item opens its overlay and moves focus to
 * the overlay's first leaf item; Escape closes the open overlay (wherever
 * focus currently is inside it) and returns focus to its own root trigger.
 * Disabled items are always skipped in roving focus (`[attr.tabindex]=
 * "item.disabled ? -1 : 0"`, the same pattern `UPanelMenu` already
 * established).
 *
 * The `(keydown)` handler is bound on this root `<ul>` — not on each root
 * item's own `<a>` — for the same reason established while fixing GAP-054
 * for Menubar/TieredMenu: a root item's own overlay content (rendered by
 * `u-mega-menu-column-group`) is a DOM *sibling* of that item's own `<a>`
 * (both live inside the same `<li>`), so a keydown fired from inside the
 * overlay could never bubble through the `<a>` to reach a root-level
 * listener bound there. Binding on the root `<ul>` — a genuine DOM ancestor
 * of the entire overlay — lets Escape (and any other key) reach this
 * handler via bubbling regardless of how deep inside the overlay focus is.
 */
@Component({
  standalone: true,
  selector: "u-mega-menu",
  imports: [RouterModule, UMegaMenuColumnGroup],
  template: `
    <nav [class]="cx('root')" [attr.aria-label]="ariaLabel()">
      <ul [class]="cx('rootList')" role="menubar" (keydown)="onKeydown($event)">
        @for (item of model(); track $index) {
          @if (item.visible !== false) {
            <li
              [class]="cx('item', itemParams(item))"
              role="none"
              [attr.data-u-disabled]="!!item.disabled"
              [attr.data-u-open]="isOpen(item)"
              (mouseenter)="onMouseEnter(item)"
            >
              <div [class]="cx('itemContent')">
                <a
                  role="menuitem"
                  [attr.href]="item.routerLink ? null : (item.url ?? '#')"
                  [routerLink]="item.disabled ? null : (item.routerLink ?? null)"
                  [class]="cx('itemLink')"
                  [attr.aria-haspopup]="hasColumns(item) ? 'menu' : null"
                  [attr.aria-expanded]="hasColumns(item) ? isOpen(item) : null"
                  [attr.aria-disabled]="item.disabled || null"
                  [attr.tabindex]="item.disabled ? -1 : 0"
                  (click)="onItemClick($event, item)"
                >
                  @if (item.icon) {
                    <span [class]="item.icon + ' ' + cx('itemIcon')"></span>
                  }
                  @if (item.label) {
                    <span [class]="cx('itemLabel')">{{ item.label }}</span>
                  }
                  @if (hasColumns(item)) {
                    <span [class]="cx('submenuIcon')" aria-hidden="true">▾</span>
                  }
                </a>
              </div>
              @if (hasColumns(item)) {
                <div [class]="cx('overlay')">
                  <div [class]="cx('grid')">
                    @for (column of item.items; track $index) {
                      <div [class]="cx('column')">
                        @for (group of column; track $index) {
                          <u-mega-menu-column-group [group]="group" (itemSelect)="handleItemSelect($event)" />
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </li>
          }
        }
      </ul>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMegaMenu extends UBaseComponent {
  protected override readonly componentName = "megamenu";
  protected override readonly styleModule = megaMenuStyleModule;

  /** An array of menuitems, each root item's own `items` a 2D column grid. */
  model = input<UMegaMenuItem[]>([]);
  /** Defines a string value that labels an interactive element. */
  ariaLabel = input<string>();

  /** Fired when a leaf item is selected. */
  onItemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected openItem: UMegaMenuItem | null = null;

  protected hasColumns(item: UMegaMenuItem): boolean {
    return !!item.items && item.items.length > 0;
  }

  protected isOpen(item: UMegaMenuItem): boolean {
    return this.openItem === item;
  }

  protected itemParams(item: UMegaMenuItem) {
    return { disabled: !!item.disabled, open: this.isOpen(item) };
  }

  protected onMouseEnter(item: UMegaMenuItem): void {
    if (this.hasColumns(item) && !item.disabled) {
      this.openItem = item;
    }
  }

  protected onItemClick(event: MouseEvent, item: UMegaMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (this.hasColumns(item)) {
      event.preventDefault();
      this.openItem = this.openItem === item ? null : item;
      return;
    }
    if (!item.url && !item.routerLink) {
      event.preventDefault();
    }
    // Reached only for a leaf root item (hasColumns(item) is false, per the
    // guard above), so `item.items` is empty/absent here — safe to widen to
    // UMenuItem's own flat `items` shape for the public onItemSelect event.
    const leafItem = item as UMenuItem;
    item.command?.({ originalEvent: event, item: leafItem });
    this.onItemSelect.emit({ originalEvent: event, item: leafItem });
  }

  protected handleItemSelect(event: { originalEvent: MouseEvent; item: UMenuItem }): void {
    this.openItem = null;
    this.onItemSelect.emit(event);
  }

  /**
   * Root-level keydown handling, delegated on the root `<ul>` (see the
   * class doc comment for why). Escape is handled unconditionally here —
   * regardless of whether the event target is a root item's own `<a>` or a
   * leaf item deep inside the open overlay — since MegaMenu's hard 2-level
   * structure means this root level's own `openItem` is always the single,
   * innermost thing to close; there is no further-up level beyond it.
   * ArrowRight/ArrowLeft and Enter/Space only act when the event target
   * resolves to one of this root list's own item `<a>`s (not a leaf item
   * inside an overlay, which is handled by `UMegaMenuColumnGroup` itself).
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.code === "Escape") {
      if (this.openItem) {
        event.preventDefault();
        event.stopPropagation();
        this.closeAndRefocus(this.openItem);
      }
      return;
    }

    const item = this.resolveOwnItem(event.target);
    if (!item) return; // Not a root item's own trigger — nothing else to do at this level.

    switch (event.code) {
      case "ArrowRight":
        event.preventDefault();
        this.moveFocus(item, 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.moveFocus(item, -1);
        break;
      case "Enter":
      case "Space":
        if (this.hasColumns(item) && !item.disabled) {
          event.preventDefault();
          this.openItem = item;
          this.focusFirstOverlayItem();
        }
        break;
    }
  }

  /** Resolves the root `UMegaMenuItem` this event's target `<a>` belongs to, or `null` if it isn't one of this root list's own direct-child item links. */
  private resolveOwnItem(target: EventTarget | null): UMegaMenuItem | null {
    const links = this.getRootLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (this.renderedRootItems()[index] ?? null);
  }

  private getRootLinks(): HTMLAnchorElement[] {
    const rootList = (this.el.nativeElement as HTMLElement).querySelector('ul[role="menubar"]');
    return rootList
      ? Array.from(rootList.querySelectorAll<HTMLAnchorElement>(":scope > li > .u-megamenu-item-content > a"))
      : [];
  }

  /** Root items that actually render their own direct-child `<a>` (excludes hidden items), in the same order `getRootLinks()` returns their DOM nodes. */
  private renderedRootItems(): UMegaMenuItem[] {
    return this.model().filter((candidate) => candidate.visible !== false);
  }

  private moveFocus(current: UMegaMenuItem, direction: 1 | -1): void {
    const enabled = this.model().filter((candidate) => candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = this.getRootLinks();
    const targetIndex = this.renderedRootItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  }

  private focusFirstOverlayItem(): void {
    setTimeout(() => {
      const rootList = (this.el.nativeElement as HTMLElement).querySelector('ul[role="menubar"]');
      const openLi = rootList?.querySelector(':scope > li[data-u-open="true"]');
      const firstLeafLink = openLi?.querySelector<HTMLAnchorElement>(".u-megamenu-submenu a");
      firstLeafLink?.focus();
    });
  }

  private closeAndRefocus(item: UMegaMenuItem): void {
    this.openItem = null;
    const links = this.getRootLinks();
    const targetIndex = this.renderedRootItems().indexOf(item);
    setTimeout(() => links[targetIndex]?.focus());
  }
}
