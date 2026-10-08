import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from "@angular/core";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { UButton } from "../button";
import { UMenu } from "../menu";
import { splitButtonStyleModule } from "./split-button-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `SplitButton` component (see
 * `.vendor-extracted/ng/splitbutton/splitbutton.ts`). Renders a default
 * command button attached to a dropdown-toggle button, which opens a
 * popup `Menu` of secondary commands.
 *
 * Real PrimeNG's `SplitButton` composes `ButtonDirective` + `TieredMenu`
 * (verified this task's Step 1 — `.vendor-extracted/ng/splitbutton/
 * splitbutton.ts` imports `primeng/tieredmenu`, not `primeng/menu`), since
 * upstream's own secondary items may themselves have nested `items`. This
 * task's binding instruction (implementation-plan §5, Task Group C table)
 * is explicit: SplitButton "composes already-Built Button + Menu — no
 * dependency wait needed, both already exist" — so this adaptation
 * composes Ultimate's own already-Built `UButton` + `UMenu` (in `popup`
 * mode) directly, not `UTieredMenu` (itself one of this same batch's own
 * new capabilities, and not the plan's stated dependency). A future task
 * wanting nested secondary-item support could swap in `UTieredMenu`
 * without changing this component's own public API shape.
 *
 * The popup is `UMenu`'s own popup mode (GAP-067): the dropdown button
 * calls `menu.toggle($event)`, so anchoring, body-append (`UOverlay`),
 * z-index, outside-click/resize dismissal, close-after-item-command, and
 * Escape (via the shared `escapeRegistry` at `ESCAPE_PRIORITIES.MENU`,
 * arbitrated by open order across instances) all come from `UMenu`. This
 * component only forwards `UMenu`'s `onShow`/`onHide` and closes the popup
 * when the default command button is clicked.
 */
@Component({
  standalone: true,
  selector: "u-split-button",
  imports: [UButton, UMenu],
  template: `
    <div [class]="cx('root')">
      <u-button
        [class]="cx('pcButton')"
        [label]="label()"
        [icon]="icon()"
        [iconPos]="iconPos()"
        [severity]="severity()"
        [text]="text()"
        [outlined]="outlined()"
        [size]="size()"
        [disabled]="disabled()"
        (onClick)="onDefaultButtonClick($event)"
      ></u-button>
      <u-button
        [class]="cx('pcDropdown')"
        icon="pi pi-chevron-down"
        [severity]="severity()"
        [text]="text()"
        [outlined]="outlined()"
        [size]="size()"
        [disabled]="disabled()"
        (onClick)="menu.toggle($event)"
      ></u-button>
      <u-menu
        #menu
        [model]="model()"
        [popup]="true"
        (onShow)="onShow.emit()"
        (onHide)="onHide.emit()"
      ></u-menu>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USplitButton extends UBaseComponent {
  protected override readonly componentName = "splitbutton";
  protected override readonly styleModule = splitButtonStyleModule;

  /** MenuModel instance to define the overlay items. */
  model = input<UMenuItem[]>([]);
  /** Text of the button. */
  label = input<string>();
  /** Name of the icon. */
  icon = input<string>();
  /** Position of the icon. */
  iconPos = input<"left" | "right" | "top" | "bottom">("left");
  /** Defines the style of the button. */
  severity = input<string>();
  /** Add a textual class to the button without a background initially. */
  text = input(false, { transform: booleanAttribute });
  /** Add a border class without a background initially. */
  outlined = input(false, { transform: booleanAttribute });
  /** Defines the size of the button. */
  size = input<"small" | "large">();
  /** When present, it specifies that the component should be disabled. */
  disabled = input(false, { transform: booleanAttribute });

  /** Callback to execute when the default command button is clicked. */
  onClick = output<MouseEvent>();
  /** Callback to execute when the popup menu is shown. */
  onShow = output<void>();
  /** Callback to execute when the popup menu is hidden. */
  onHide = output<void>();

  @ViewChild("menu", { static: true }) private menu!: UMenu;

  protected onDefaultButtonClick(event: MouseEvent): void {
    this.menu.hide();
    this.onClick.emit(event);
  }
}
