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

/**
 * Recursive submenu renderer for `UMenubar`, adapted from real PrimeNG's
 * `MenubarSub` (`.vendor-extracted/ng/menubar/menubar.ts` lines 245-449) —
 * same recursive-self-reference shape (a `p-menubarSub` renders a nested
 * `p-menubarSub` for each item with `items`), scoped down to this task's
 * smaller surface (no template projection, no ARIA `aria-orientation`
 * toggle by level, no keyboard roving-focus machinery — click/hover-only
 * open/close, matching `UMenu`'s own established reduction pattern).
 */
@Component({
  standalone: true,
  selector: "u-menubar-sub",
  imports: [RouterModule, UMenubarSub],
  template: `
    <ul [class]="root ? cx('rootList') : cx('submenu')">
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
}
