import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
  output,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { menubarStyleModule } from "./menubar-style";

/** Selector for a level's own direct-child item trigger links (excludes nested submenu items). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-menubar-item-content > a";

/**
 * Recursive submenu renderer for `UMenubar`, adapted from real PrimeNG's
 * `MenubarSub` (`.vendor-extracted/ng/menubar/menubar.ts` lines 245-449) —
 * same recursive-self-reference shape (a `p-menubarSub` renders a nested
 * `p-menubarSub` for each item with `items`), scoped down to this task's
 * smaller surface (no template projection, no ARIA `aria-orientation`
 * toggle by level — matching `UMenu`'s own established reduction pattern).
 *
 * Carries real ARIA roles (`menubar`/`menu`/`menuitem`), matching the same
 * shape already established by this component's own siblings `UTieredMenu`
 * and `UMegaMenu` (GAP-054, Spec §5.3) — required for the roving-focus
 * keyboard navigation below to be meaningfully testable/correct at all.
 * ArrowRight/ArrowLeft move focus horizontally among the root level's own
 * items; ArrowDown/ArrowUp move focus vertically within a submenu level
 * (real PrimeNG's own axis-per-level convention). Enter/Space on an item
 * with children opens its submenu and moves focus to its first item.
 * Escape closes only the innermost open submenu and returns focus to that
 * submenu's own trigger. Disabled items are always skipped in roving focus
 * and excluded from the DOM tab order (`[attr.tabindex]="item.disabled ?
 * -1 : 0"`), the same pattern `UPanelMenu` already established.
 */
@Component({
  standalone: true,
  selector: "u-menubar-sub",
  imports: [RouterModule, UMenubarSub],
  template: `
    <ul
      [class]="root ? cx('rootList') : cx('submenu')"
      [attr.role]="root ? 'menubar' : 'menu'"
      (keydown)="onKeydown($event)"
    >
      @for (item of items; track $index) {
        @if (item.separator) {
          <li [class]="cx('separator')" role="separator"></li>
        } @else if (item.visible !== false) {
          <li
            [class]="cx('item', itemParams(item))"
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
                  <span [class]="cx('submenuIcon')" aria-hidden="true">{{ root ? "▾" : "▸" }}</span>
                }
              </a>
            </div>
            @if (hasItems(item)) {
              <u-menubar-sub
                [items]="item.items ?? []"
                [root]="false"
                (itemSelect)="itemSelect.emit($event)"
              ></u-menubar-sub>
            }
          </li>
        }
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMenubarSub extends UBaseComponent {
  protected override readonly componentName = "menubar";
  protected override readonly styleModule = menubarStyleModule;

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
   * `<a>`. This is deliberate: a nested `u-menubar-sub` rendering a deeper
   * level is a DOM *sibling* of its parent item's own `<a>` (both live
   * inside the same `<li>`), so a `keydown` fired on a deeper level's own
   * `<a>` never bubbles through an ancestor level's `<a>` — only through
   * that ancestor's own `<ul>`, which genuinely is a DOM ancestor of every
   * level nested within it. Binding here instead of on the `<a>` is what
   * makes an ancestor level's own Escape handling reachable at all once
   * focus has moved into a nested submenu.
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
   * Root level moves horizontally (ArrowRight/ArrowLeft); nested submenu
   * levels move vertically (ArrowDown/ArrowUp) — matching real PrimeNG's
   * own axis-per-level convention. Enter/Space on an item with children
   * opens its submenu and moves focus into it.
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

    const forwardKey = this.root ? "ArrowRight" : "ArrowDown";
    const backwardKey = this.root ? "ArrowLeft" : "ArrowUp";

    switch (event.code) {
      case forwardKey:
        event.preventDefault();
        this.moveFocus(item, 1);
        break;
      case backwardKey:
        event.preventDefault();
        this.moveFocus(item, -1);
        break;
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
    return index === -1 ? null : (this.items[index] ?? null);
  }

  /** Direct-child item trigger links for this level only (excludes nested submenus). */
  private getItemLinks(): HTMLAnchorElement[] {
    const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)) : [];
  }

  private moveFocus(current: UMenuItem, direction: 1 | -1): void {
    const enabled = this.items.filter((candidate) => !candidate.separator && candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = this.getItemLinks();
    const targetIndex = this.items.indexOf(nextItem);
    links[targetIndex]?.focus();
  }

  private focusFirstSubmenuItem(): void {
    setTimeout(() => {
      const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
      const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
      // The nested level's own <ul> is rendered inside a <u-menubar-sub>
      // child of openLi (not a direct <ul> child of openLi), since a
      // recursive sub-component — not a plain nested <ul> — is what
      // actually renders the next level down.
      const firstLink = openLi?.querySelector<HTMLAnchorElement>(
        ":scope > u-menubar-sub > ul > li > .u-menubar-item-content > a",
      );
      firstLink?.focus();
    });
  }

  private closeAndRefocus(item: UMenuItem): void {
    this.openItem = null;
    const links = this.getItemLinks();
    const targetIndex = this.items.indexOf(item);
    setTimeout(() => links[targetIndex]?.focus());
  }
}
