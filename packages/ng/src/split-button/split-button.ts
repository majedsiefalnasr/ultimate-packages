import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewEncapsulation,
  booleanAttribute,
  computed,
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
 * `UMenu` (read-only reference, already Built) exposes no output event for
 * item selection — it only ever invokes each `UMenuItem.command` callback
 * directly. `menuModel` below wraps every item's own `command` so the
 * popup closes after any item is chosen, without modifying `UMenu` itself.
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
        (onClick)="onDropdownButtonClick($event)"
      ></u-button>
      @if (expanded) {
        <div [class]="cx('menuContainer')">
          <u-menu [model]="menuModel()" [popup]="true"></u-menu>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USplitButton extends UBaseComponent {
  protected override readonly componentName = "split-button";
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

  protected expanded = false;

  /**
   * `model()` items wrapped so selecting any of them closes the popup —
   * `UMenu` itself has no selection output to hook (see class doc comment).
   */
  protected readonly menuModel = computed<UMenuItem[]>(() =>
    this.model().map((item) => ({
      ...item,
      command: (event: unknown) => {
        this.hide();
        item.command?.(event);
      },
    }))
  );

  protected onDefaultButtonClick(event: MouseEvent): void {
    if (this.expanded) {
      this.hide();
    }
    this.onClick.emit(event);
  }

  protected onDropdownButtonClick(_event: MouseEvent): void {
    this.expanded ? this.hide() : this.show();
  }

  private show(): void {
    this.expanded = true;
    this.onShow.emit();
  }

  private hide(): void {
    if (!this.expanded) return;
    this.expanded = false;
    this.onHide.emit();
  }

  @HostListener("document:keydown.escape")
  protected onEscape(): void {
    if (this.expanded) {
      this.hide();
    }
  }
}
