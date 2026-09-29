import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
  type WritableSignal,
  output,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { panelMenuStyleModule } from "./panel-menu-style";

/**
 * Recursive, expand-in-place submenu renderer for `UPanelMenu`, adapted
 * from real PrimeNG's `PanelMenuSub`/`PanelMenuList`
 * (`.vendor-extracted/ng/panelmenu/panelmenu.ts` lines 223-949) — same
 * recursive-self-reference shape (each group item's own `items` render a
 * nested `u-panel-menu-list`), scoped down to this task's smaller surface
 * (click-driven expand/collapse only, no keyboard roving-focus/search-by-
 * typing machinery, matching `UMenu`'s own established reduction pattern).
 *
 * Unlike `UMenubarSub`/`UTieredMenuSub` (popup overlay submenus), this is
 * PanelMenu's real distinguishing structural trait: an accordion —
 * children expand in-place (indented, always in normal document flow)
 * rather than opening a positioned popup. Expand/collapse state lives in a
 * single `WritableSignal<Set<UMenuItem>>` owned by the root `UPanelMenu`
 * and threaded down by reference through every recursion level — read via
 * calling the signal (so `OnPush` change detection sees a live value at
 * every level once the root component's own signal write flows through
 * Angular's signal-read-tracks-dependency mechanism template-side) and
 * updated by replacing it with a new `Set` (never mutating one in place —
 * a mutated-in-place `Set` given to an `OnPush` component's `@Input` would
 * not trigger re-render, since the input's own object identity would be
 * unchanged), matching real PanelMenu's own `activeItem`/`multiple`
 * semantics (multiple concurrently-expanded branches, tracked by identity).
 *
 * Keyboard navigation (GAP-054, Spec §5.3) is scoped to this level's own
 * visible siblings only, matching Menubar/TieredMenu's own established
 * per-level restriction: ArrowDown/ArrowUp move focus between this level's
 * own non-disabled items (wrapping at the ends); Enter/Space on a group
 * item toggles its expand/collapse in place via the existing
 * `onHeaderClick`-equivalent logic, without moving focus off the trigger
 * (there is no popup/overlay to move focus into — expansion just reveals
 * this item's own nested `u-panel-menu-list`, which is this level's own
 * DOM sibling, not this level's own list). No Escape handling is added:
 * PanelMenu is an accordion with no overlay to escape from (confirmed by
 * this file and `panel-menu.ts` — no `@angular/cdk` overlay/portal usage
 * anywhere in this component), so "close the innermost open thing" has no
 * meaning here the way it does for Menubar/TieredMenu/MegaMenu's popups;
 * an expanded panel is simply toggled shut again via Enter/Space or a
 * click on its own header, like the rest of this component's own existing
 * behavior.
 *
 * The `(keydown)` handler is bound on this level's own `<ul role="tree">`
 * — never on an individual header `<a>` — for the same reason already
 * established while fixing GAP-054 for Menubar/TieredMenu/MegaMenu: a
 * nested `u-panel-menu-list` rendered for an expanded group item is a DOM
 * *sibling* of that item's own `<a>` (both live inside the same `<li>`,
 * see the template below), so a keydown fired from inside an expanded
 * nested list would never bubble through its parent's own `<a>` — only
 * through this level's own `<ul>`, which genuinely is a DOM ancestor of
 * every level nested within it. Because this listener also receives
 * bubbled events from deeper-nested levels, movement/toggle keys first
 * resolve which item (if any) at *this* level the event's real target
 * belongs to, and no-op (letting the event keep bubbling) for anything
 * that isn't a direct-child header `<a>` of this level's own `<ul>` — so a
 * deeper level's own listener (which sees the same bubbling event first,
 * being the nearer ancestor) always handles its own items, never this one.
 */
@Component({
  standalone: true,
  selector: "u-panel-menu-list",
  imports: [RouterModule, UPanelMenuList],
  template: `
    <ul [class]="cx('submenu')" role="tree" (keydown)="onKeydown($event)">
      @for (item of items; track $index) {
        @if (item.visible !== false) {
          <li
            [class]="cx('item', itemParams(item))"
            role="treeitem"
            [attr.data-u-disabled]="!!item.disabled"
            [attr.data-u-expanded]="isExpanded(item)"
            [attr.aria-expanded]="hasItems(item) ? isExpanded(item) : null"
          >
            <div [class]="cx('headerContent')">
              <a
                [attr.href]="item.routerLink ? null : (item.url ?? '#')"
                [routerLink]="item.disabled ? null : (item.routerLink ?? null)"
                [class]="cx('headerLink')"
                [attr.aria-disabled]="item.disabled || null"
                [attr.tabindex]="item.disabled ? -1 : 0"
                (click)="onHeaderClick($event, item)"
              >
                @if (hasItems(item)) {
                  <span [class]="cx('submenuIcon')" aria-hidden="true">▸</span>
                }
                @if (item.icon) {
                  <span [class]="item.icon + ' ' + cx('headerIcon')"></span>
                }
                @if (item.label) {
                  <span [class]="cx('headerLabel')">{{ item.label }}</span>
                }
              </a>
            </div>
            @if (hasItems(item) && isExpanded(item)) {
              <u-panel-menu-list
                [items]="item.items ?? []"
                [expandedItems]="expandedItems"
                [multiple]="multiple"
                (itemSelect)="itemSelect.emit($event)"
              ></u-panel-menu-list>
            }
          </li>
        }
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UPanelMenuList extends UBaseComponent {
  protected override readonly componentName = "panel-menu";
  protected override readonly styleModule = panelMenuStyleModule;

  @Input() items: UMenuItem[] = [];
  @Input({ required: true }) expandedItems!: WritableSignal<Set<UMenuItem>>;
  @Input() multiple = false;

  itemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected hasItems(item: UMenuItem): boolean {
    return !!item.items && item.items.length > 0;
  }

  protected isExpanded(item: UMenuItem): boolean {
    return this.expandedItems().has(item);
  }

  protected itemParams(item: UMenuItem) {
    return { disabled: !!item.disabled, expanded: this.isExpanded(item) };
  }

  protected onHeaderClick(event: MouseEvent, item: UMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (this.hasItems(item)) {
      event.preventDefault();
      this.toggleExpanded(item);
      return;
    }
    if (!item.url && !item.routerLink) {
      event.preventDefault();
    }
    item.command?.({ originalEvent: event, item });
    this.itemSelect.emit({ originalEvent: event, item });
  }

  /** Shared expand/collapse toggle used by both header click and Enter/Space keydown, preserving the existing per-level sibling-exclusivity `Set` mechanism (KEEP CURRENT BEHAVIOR). */
  private toggleExpanded(item: UMenuItem): void {
    const current = this.expandedItems();
    const next = new Set(current);
    if (next.has(item)) {
      next.delete(item);
    } else {
      if (!this.multiple) {
        for (const sibling of this.items) {
          next.delete(sibling);
        }
      }
      next.add(item);
    }
    this.expandedItems.set(next);
  }

  /**
   * Delegated roving-focus keyboard handling for this level's own visible
   * items, bound on this level's own `<ul>` (see the class doc comment for
   * why). ArrowDown/ArrowUp move focus between this level's own
   * non-disabled siblings (wrapping at the ends). Enter/Space on a group
   * item toggles its expand/collapse in place, reusing the same
   * `toggleExpanded` the existing click handler already uses. No Escape
   * handling: there is no overlay/popup at any level of this accordion to
   * close (see class doc comment).
   */
  protected onKeydown(event: KeyboardEvent): void {
    const item = this.resolveOwnItem(event.target);
    if (!item) return; // Not this level's own header link — let it keep bubbling.

    switch (event.code) {
      case "ArrowDown":
        event.preventDefault();
        this.moveFocus(item, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveFocus(item, -1);
        break;
      case "Enter":
      case "Space":
        if (this.hasItems(item) && !item.disabled) {
          event.preventDefault();
          this.toggleExpanded(item);
        }
        break;
    }
  }

  /**
   * Resolves the `UMenuItem` this event's target `<a>` belongs to, but only
   * if that `<a>` is a direct-child header link of *this* level's own
   * `<ul>` (not a descendant belonging to a deeper-nested level). Returns
   * `null` for any event this level does not own, so the caller can leave
   * it bubbling toward the ancestor level that does — though in practice a
   * deeper-nested level's own listener always claims a bubbled event first
   * (it is the nearer ancestor in the bubble path).
   */
  private resolveOwnItem(target: EventTarget | null): UMenuItem | null {
    const links = this.getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (this.items[index] ?? null);
  }

  /** Direct-child header links for this level only (excludes nested levels' own headers). */
  private getItemLinks(): HTMLAnchorElement[] {
    const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
    return ul
      ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(":scope > li > .u-panelmenu-header-content > a"))
      : [];
  }

  private moveFocus(current: UMenuItem, direction: 1 | -1): void {
    const enabled = this.items.filter((candidate) => candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = this.getItemLinks();
    const targetIndex = this.items.indexOf(nextItem);
    links[targetIndex]?.focus();
  }
}
