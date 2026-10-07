import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { UPanelMenuList } from "./panel-menu-list";
import { panelMenuStyleModule } from "./panel-menu-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `PanelMenu` component (see
 * `.vendor-extracted/ng/panelmenu/panelmenu.ts`, lines 950-1252 — the
 * `PanelMenu` class specifically; `PanelMenuSub`/`PanelMenuList` merged
 * into a single recursive `UPanelMenuList`, matching this task's smaller
 * surface). Renders an accordion-style nested menu: expandable panels,
 * each toggled in-place (indented nested list), not a popup overlay —
 * PanelMenu's genuinely different structural trait vs. Menubar/TieredMenu
 * (both of which open positioned popup submenus).
 *
 * Real PrimeNG's `PanelMenu` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component — it does NOT
 * compose or wrap `Menu`. This adaptation follows that same independent
 * shape, composing only its own recursive `UPanelMenuList` sub-component.
 *
 * Deliberately excludes upstream's passthrough system, header/submenu-icon
 * template projection, and keyboard roving-focus/search-by-typing
 * machinery — matching the same reduction `UMenu` already applied to real
 * PrimeNG's `Menu`.
 */
@Component({
  standalone: true,
  selector: "u-panel-menu",
  imports: [UPanelMenuList],
  template: `
    <div [class]="cx('root')">
      <u-panel-menu-list
        [items]="model()"
        [expandedItems]="expandedItems"
        [multiple]="multiple()"
        (itemSelect)="onItemSelect.emit($event)"
      ></u-panel-menu-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UPanelMenu extends UBaseComponent {
  protected override readonly componentName = "panelmenu";
  protected override readonly styleModule = panelMenuStyleModule;

  /** An array of menuitems. */
  model = input<UMenuItem[]>([]);
  /** Whether multiple tabs can be activated at the same time or not. */
  multiple = input(false, { transform: booleanAttribute });

  /** Fired when an item is selected. */
  onItemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected readonly expandedItems = signal<Set<UMenuItem>>(new Set());
}
