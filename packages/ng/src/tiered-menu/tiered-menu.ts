import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { UTieredMenuSub } from "./tiered-menu-sub";
import { tieredMenuStyleModule } from "./tiered-menu-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `TieredMenu` component (see
 * `.vendor-extracted/ng/tieredmenu/tieredmenu.ts`, lines 491-1377 — the
 * `TieredMenu` class specifically; `TieredMenuSub` split into
 * `UTieredMenuSub`). Renders nested popup submenus via a recursive
 * sub-component, either inline (`popup: false`, matching `UMenu`'s own
 * inline mode) or as a toggleable popup (`popup: true`).
 *
 * Real PrimeNG's `TieredMenu` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component — it does NOT
 * compose or wrap `Menu`. This adaptation follows that same independent
 * shape.
 */
@Component({
  standalone: true,
  selector: "u-tiered-menu",
  imports: [UTieredMenuSub],
  template: `
    @if (popup() ? visible() : true) {
      <div [class]="cx('root', classesParams())">
        <u-tiered-menu-sub [items]="model()" [root]="true" (itemSelect)="handleItemSelect($event)"></u-tiered-menu-sub>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UTieredMenu extends UBaseComponent {
  protected override readonly componentName = "tieredmenu";
  protected override readonly styleModule = tieredMenuStyleModule;

  /** An array of menuitems. */
  model = input<UMenuItem[]>([]);
  /** Defines if menu would displayed as a popup. */
  popup = input(false, { transform: booleanAttribute });

  /** Fired when an item is selected. */
  onItemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();
  /** Callback to invoke when the popup menu is shown. */
  onShow = output<void>();
  /** Callback to invoke when the popup menu is hidden. */
  onHide = output<void>();

  protected readonly visible = signal(false);

  protected classesParams() {
    return { popup: this.popup() };
  }

  protected handleItemSelect(event: { originalEvent: MouseEvent; item: UMenuItem }): void {
    this.onItemSelect.emit(event);
    if (this.popup()) {
      this.hide();
    }
  }

  /** Toggles the popup menu open/closed. */
  toggle(): void {
    this.visible() ? this.hide() : this.show();
  }

  /** Shows the popup menu. */
  show(): void {
    if (this.visible()) return;
    this.visible.set(true);
    this.onShow.emit();
  }

  /** Hides the popup menu. */
  hide(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.onHide.emit();
  }

  @HostListener("document:keydown.escape")
  protected onEscape(): void {
    if (this.popup() && this.visible()) {
      this.hide();
    }
  }
}
