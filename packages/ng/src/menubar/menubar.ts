import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from "@angular/core";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { UMenubarSub } from "./menubar-sub";
import { menubarStyleModule } from "./menubar-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Menubar` component (see
 * `.vendor-extracted/ng/menubar/menubar.ts`, lines 450-1285 — the
 * `Menubar` class specifically, `MenubarSub` split into its own file,
 * `UMenubarSub`). Renders a horizontal bar of top-level items, each of
 * which may open a nested popup submenu (recursive `UMenubarSub`).
 *
 * Real PrimeNG's `Menubar` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component — it does NOT
 * compose or wrap `Menu`. This adaptation follows the same independent
 * shape, composing only its own recursive `UMenubarSub` sub-component (same
 * "recursive-Sub-component" DNA `UMenu`'s Vue sibling `Menuitem.vue`
 * established for a flat, non-recursive case).
 *
 * Deliberately excludes upstream's passthrough system, mobile-breakpoint
 * hamburger-menu collapse (`autoHide`/`breakpoint`/`mobileActive`),
 * keyboard roving-focus/search-by-typing, and template-projection slots —
 * none of these appear in this task's scoped-down surface, matching the
 * same reduction `UMenu` already applied to real PrimeNG's `Menu`.
 */
@Component({
  standalone: true,
  selector: "u-menubar",
  imports: [UMenubarSub],
  template: `
    <nav [class]="cx('root')" [attr.aria-label]="ariaLabel()">
      <u-menubar-sub [items]="model()" [root]="true" (itemSelect)="onItemSelect.emit($event)"></u-menubar-sub>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMenubar extends UBaseComponent {
  protected override readonly componentName = "menubar";
  protected override readonly styleModule = menubarStyleModule;

  /** An array of menuitems. */
  model = input<UMenuItem[]>([]);
  /** Defines a string value that labels an interactive element. */
  ariaLabel = input<string>();

  /** Fired when an item is selected. */
  onItemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();
}
