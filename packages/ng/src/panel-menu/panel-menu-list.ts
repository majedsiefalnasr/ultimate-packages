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
 */
@Component({
  standalone: true,
  selector: "u-panel-menu-list",
  imports: [RouterModule, UPanelMenuList],
  template: `
    <ul [class]="cx('submenu')" role="tree">
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
      return;
    }
    if (!item.url && !item.routerLink) {
      event.preventDefault();
    }
    item.command?.({ originalEvent: event, item });
    this.itemSelect.emit({ originalEvent: event, item });
  }
}
