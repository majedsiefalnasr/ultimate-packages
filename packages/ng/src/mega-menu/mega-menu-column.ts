import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { megaMenuStyleModule } from "./mega-menu-style";
import type { UMegaMenuGroup } from "./mega-menu-item";

/**
 * Renders one submenu group within a MegaMenu overlay column — an optional
 * `submenuLabel` header followed by a flat list of leaf items. Adapted from
 * real PrimeNG's `MegaMenuSub` (`.vendor-extracted/ng/megamenu/megamenu.ts`
 * lines 41-234) applied to a single group (real MegaMenuSub also renders
 * the grid of columns for the root case — this task splits that root-grid
 * responsibility into `UMegaMenu` itself, keeping this component a flat,
 * non-recursive leaf-group renderer, since a MegaMenu overlay group is
 * itself not further nested per this task's own `UMegaMenuItem` shape).
 */
@Component({
  standalone: true,
  selector: "u-mega-menu-column-group",
  imports: [RouterModule],
  template: `
    <ul [class]="cx('submenu')" role="menu">
      @if (group.label) {
        <li [class]="cx('submenuLabel')" role="presentation">{{ group.label }}</li>
      }
      @for (item of group.items ?? []; track $index) {
        @if (item.visible !== false) {
          <li [class]="cx('item')" role="none">
            <div [class]="cx('itemContent')">
              <a
                role="menuitem"
                [attr.href]="item.routerLink ? null : (item.url ?? '#')"
                [routerLink]="item.disabled ? null : (item.routerLink ?? null)"
                [class]="cx('itemLink')"
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
              </a>
            </div>
          </li>
        }
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMegaMenuColumnGroup extends UBaseComponent {
  protected override readonly componentName = "mega-menu";
  protected override readonly styleModule = megaMenuStyleModule;

  @Input({ required: true }) group!: UMegaMenuGroup;

  itemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected onItemClick(event: MouseEvent, item: UMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (!item.url && !item.routerLink) {
      event.preventDefault();
    }
    item.command?.({ originalEvent: event, item });
    this.itemSelect.emit({ originalEvent: event, item });
  }
}
