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
 *
 * ArrowDown/ArrowUp roving focus (GAP-054, Spec §5.3) is scoped to this
 * group's own flat leaf-item list, delegated on this component's own
 * `<ul role="menu">`, matching `UMenubarSub`'s established
 * delegate-on-the-ancestor-`<ul>` pattern. Disabled leaf items are skipped
 * (`[attr.tabindex]="item.disabled ? -1 : 0"`, already present below).
 * Escape is deliberately NOT handled here: this component never
 * `stopPropagation()`s on it, letting it bubble untouched up through the
 * overlay to `UMegaMenu`'s own root `<ul>`, which owns the single
 * `openItem` this hard-2-level structure ever needs to close.
 */
@Component({
  standalone: true,
  selector: "u-mega-menu-column-group",
  imports: [RouterModule],
  template: `
    <ul [class]="cx('submenu')" role="menu" (keydown)="onKeydown($event)">
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

  /** ArrowDown/ArrowUp roving focus among this group's own flat leaf items; Escape is intentionally left unhandled so it bubbles to `UMegaMenu`'s own root `<ul>`. */
  protected onKeydown(event: KeyboardEvent): void {
    const items = this.group.items ?? [];
    const links = this.getItemLinks();
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index === -1) return; // Not one of this group's own item links.

    const current = items[index];
    if (!current) return;

    switch (event.code) {
      case "ArrowDown":
        event.preventDefault();
        this.moveFocus(current, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveFocus(current, -1);
        break;
    }
  }

  private getItemLinks(): HTMLAnchorElement[] {
    const ul = (this.el.nativeElement as HTMLElement).querySelector("ul");
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(":scope > li > .u-megamenu-item-content > a")) : [];
  }

  private moveFocus(current: UMenuItem, direction: 1 | -1): void {
    const items = this.group.items ?? [];
    const enabled = items.filter((candidate) => candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = this.getItemLinks();
    const targetIndex = items.indexOf(nextItem);
    links[targetIndex]?.focus();
  }
}
