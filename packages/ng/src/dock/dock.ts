import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output, signal } from "@angular/core";
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
  template: `
    <div [class]="cx('root', { position: position() })">
      <div [class]="cx('listContainer')">
        <ul [class]="cx('list')" role="menu" [attr.aria-label]="ariaLabel()">
          @for (item of model(); track item.label; let i = $index) {
            @if (item.visible !== false) {
              <li [class]="cx('item', itemParams(item, i))" role="none">
                <a
                  [href]="item.url || '#'"
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
                  @if (item.icon) {
                    <span [class]="[cx('itemIcon'), item.icon]"></span>
                  }
                </a>
              </li>
            }
          }
        </ul>
      </div>
    </div>
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
}
