import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { tieredMenuStyleModule } from "./tiered-menu-style";

/** Selector for a level's own direct-child item trigger links (excludes nested submenu items). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-tieredmenu-item-content > a";

/**
 * Recursive submenu renderer for `UTieredMenu`, adapted from real PrimeNG's
 * `TieredMenuSub` (`.vendor-extracted/ng/tieredmenu/tieredmenu.ts` lines
 * 48-490) — same recursive-self-reference shape (a `p-tieredMenuSub`
 * renders a nested `p-tieredMenuSub` for each item with `items`), scoped
 * down to this task's smaller surface (matching `UMenu`'s own established
 * reduction pattern).
 *
 * Keyboard navigation (GAP-054, Spec §5.3) uses a single ArrowDown/ArrowUp
 * axis to move between siblings at *every* level — root and submenu alike
 * — matching real PrimeNG's own `TieredMenuSub` convention
 * (`onArrowDownKey`/`onArrowUpKey` used unconditionally regardless of
 * level; confirmed at `tieredmenu.ts:935-993` in the vendored source).
 * This differs deliberately from `UMenubarSub`'s own root-horizontal
 * (ArrowRight/ArrowLeft) / submenu-vertical (ArrowDown/ArrowUp) split:
 * TieredMenu's root list is itself a vertical menu (`role="menu"`, not
 * `menubar`), so real Prime never switches axis by level for it.
 * ArrowRight (or Enter/Space) on a group item opens its submenu and moves
 * focus to its first item. Escape closes only the innermost open submenu
 * and returns focus to that submenu's own trigger.
 * Disabled items are always skipped in roving focus and excluded from the
 * DOM tab order (`[attr.tabindex]="item.disabled ? -1 : 0"`), the same
 * pattern `UPanelMenu` already established. The item's own focusable
 * target is its `<a>` (not the `<li>`, which carries `role="menuitem"`
 * for this component's own pre-existing ARIA shape) — the `<a>` needs a
 * real tabindex for roving focus to move a native, keyboard-reachable
 * element.
 */
@Component({
  standalone: true,
  selector: "u-tiered-menu-sub",
  imports: [RouterModule, UTieredMenuSub],
  template: `
    <ul [class]="root ? cx('rootList') : cx('submenu')" role="menu" (keydown)="onKeydown($event)">
      @for (item of items; track $index) {
        @if (item.separator) {
          <li [class]="cx('separator')" role="separator"></li>
        } @else if (item.visible !== false) {
          <li
            [class]="cx('item', itemParams(item))"
            role="menuitem"
            [attr.data-u-disabled]="!!item.disabled"
            [attr.data-u-open]="isOpen(item)"
            (mouseenter)="onMouseEnter(item)"
          >
            <div [class]="cx('itemContent')">
              <a
                [attr.href]="item.routerLink ? null : (item.url ?? '#')"
                [routerLink]="item.disabled ? null : (item.routerLink ?? null)"
                [class]="cx('itemLink')"
                [attr.aria-haspopup]="hasItems(item) ? 'menu' : null"
                [attr.aria-expanded]="hasItems(item) ? isOpen(item) : null"
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
                @if (hasItems(item)) {
                  <span [class]="cx('submenuIcon')" aria-hidden="true">▸</span>
                }
              </a>
            </div>
            @if (hasItems(item)) {
              <u-tiered-menu-sub
                [items]="item.items ?? []"
                [root]="false"
                (itemSelect)="itemSelect.emit($event)"
              ></u-tiered-menu-sub>
            }
          </li>
        }
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UTieredMenuSub extends UBaseComponent {
  protected override readonly componentName = "tiered-menu";
  protected override readonly styleModule = tieredMenuStyleModule;

  @Input() items: UMenuItem[] = [];
  @Input() root = false;

  itemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected openItem: UMenuItem | null = null;

  protected hasItems(item: UMenuItem): boolean {
    return !!item.items && item.items.length > 0;
  }

  protected isOpen(item: UMenuItem): boolean {
    return this.openItem === item;
  }

  protected itemParams(item: UMenuItem) {
    return { disabled: !!item.disabled, open: this.isOpen(item) };
  }

  protected onMouseEnter(item: UMenuItem): void {
    if (this.hasItems(item) && !item.disabled) {
      this.openItem = item;
    }
  }

  protected onItemClick(event: MouseEvent, item: UMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (this.hasItems(item)) {
      event.preventDefault();
      this.openItem = this.openItem === item ? null : item;
      return;
    }
    if (!item.url && !item.routerLink) {
      event.preventDefault();
    }
    item.command?.({ originalEvent: event, item });
    this.itemSelect.emit({ originalEvent: event, item });
  }

  /**
   * Delegated roving-focus keyboard handling for this level's own item
   * list, bound on this level's own `<ul>` rather than on each individual
   * `<a>`. This is deliberate: a nested `u-tiered-menu-sub` rendering a
   * deeper level is a DOM *sibling* of its parent item's own `<a>` (both
   * live inside the same `<li>`), so a `keydown` fired on a deeper level's
   * own `<a>` never bubbles through an ancestor level's `<a>` — only
   * through that ancestor's own `<ul>`, which genuinely is a DOM ancestor
   * of every level nested within it. Binding here instead of on the `<a>`
   * is what makes an ancestor level's own Escape handling reachable at all
   * once focus has moved into a nested submenu.
   *
   * Because this listener is now shared by every item `<a>` at this level
   * (delegation) and also receives bubbled events from every deeper-nested
   * level, movement/activation keys (Arrow keys, Enter, Space) first resolve
   * which item (if any) at *this* level the event's real target belongs
   * to, and no-op for anything that isn't a real direct-child `<a>` of this
   * level's own `<ul>` — letting that event keep bubbling toward whichever
   * ancestor level's own listener does own it as one of its own items.
   *
   * Escape is handled differently on purpose: it doesn't act on "whichever
   * item the target belongs to" (a nested-level item, e.g. Recent, has no
   * submenu of its own to close), it acts on *this level's own* `openItem`
   * — the item at this level whose submenu currently contains the focused
   * element. Since a keydown reaches this level's own `<ul>` (via bubbling)
   * before any shallower ancestor level's own `<ul>`, the first level in
   * the bubble path with a non-null `openItem` is always the correct,
   * innermost one to close; calling `stopPropagation()` there prevents any
   * shallower ancestor level from also reacting to the same keypress.
   *
   * ArrowDown/ArrowUp move focus between this level's own non-disabled
   * siblings (single axis at every level — see class doc comment).
   * ArrowRight (or Enter/Space) on a group item opens its submenu and
   * moves focus into it.
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
    if (!item) return; // Not this level's own item — let it keep bubbling.

    switch (event.code) {
      case "ArrowDown":
        event.preventDefault();
        this.moveFocus(item, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveFocus(item, -1);
        break;
      case "ArrowRight":
      case "Enter":
      case "Space":
        if (this.hasItems(item) && !item.disabled) {
          event.preventDefault();
          this.openItem = item;
          this.focusFirstSubmenuItem();
        }
        break;
    }
  }

  /**
   * Resolves the `UMenuItem` this event's target `<a>` belongs to, but only
   * if that `<a>` is a direct-child item link of *this* level's own `<ul>`
   * (not a descendant belonging to a deeper-nested level). Returns `null`
   * for any event this level does not own, so the caller can leave it
   * bubbling toward the ancestor level that does.
   */
  private resolveOwnItem(target: EventTarget | null): UMenuItem | null {
    const links = this.getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (this.renderedItems()[index] ?? null);
  }

  /** Direct-child item trigger links for this level only (excludes nested submenus). */
  private getItemLinks(): HTMLAnchorElement[] {
    const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)) : [];
  }

  /** Items that actually render their own direct-child `<a>` (excludes separators and hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
  private renderedItems(): UMenuItem[] {
    return this.items.filter((candidate) => !candidate.separator && candidate.visible !== false);
  }

  private moveFocus(current: UMenuItem, direction: 1 | -1): void {
    const enabled = this.items.filter((candidate) => !candidate.separator && candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = this.getItemLinks();
    const targetIndex = this.renderedItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  }

  private focusFirstSubmenuItem(): void {
    setTimeout(() => {
      const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
      const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
      // The nested level's own <ul> is rendered inside a <u-tiered-menu-sub>
      // child of openLi (not a direct <ul> child of openLi), since a
      // recursive sub-component — not a plain nested <ul> — is what
      // actually renders the next level down.
      const firstLink = openLi?.querySelector<HTMLAnchorElement>(
        ":scope > u-tiered-menu-sub > ul > li > .u-tieredmenu-item-content > a",
      );
      firstLink?.focus();
    });
  }

  private closeAndRefocus(item: UMenuItem): void {
    this.openItem = null;
    const links = this.getItemLinks();
    const targetIndex = this.renderedItems().indexOf(item);
    setTimeout(() => links[targetIndex]?.focus());
  }
}
