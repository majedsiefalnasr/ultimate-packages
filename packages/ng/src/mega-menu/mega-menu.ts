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
 */
@Component({
  standalone: true,
  selector: "u-mega-menu",
  imports: [RouterModule, UMegaMenuColumnGroup],
  template: `
    <nav [class]="cx('root')" [attr.aria-label]="ariaLabel()">
      <ul [class]="cx('rootList')" role="menubar">
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
  protected override readonly componentName = "mega-menu";
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
}
