import { ChangeDetectionStrategy, Component, HostListener, ViewEncapsulation, booleanAttribute, input, numberAttribute, output, signal } from "@angular/core";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { speedDialStyleModule } from "./speed-dial-style";

type SpeedDialDirection = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";
type SpeedDialType = "linear" | "circle" | "semi-circle" | "quarter-circle";

/**
 * Ultimate-owned adaptation of PrimeNG's `SpeedDial` component (see
 * `.vendor-extracted/ng/speeddial/speeddial.ts`). A floating action button
 * that expands into a list of secondary action items.
 *
 * Real PrimeNG's `SpeedDial` (`extends BaseComponent`, composes only
 * `ButtonModule`/`Ripple`/`TooltipModule`, no import of `primeng/menu` or
 * `primeng/tieredmenu`) is a standalone, independent component driven by a
 * flat `MenuItem[]` model. Expand/collapse is a single boolean `visible`
 * flag; the fan-out is pure CSS-transition + inline per-item
 * `transitionDelay`/positioning (`calculatePointStyle`/
 * `calculateTransitionDelay` in real source) — no external animation
 * library, no overlay/z-index primitive beyond an optional CSS mask
 * `<div>` — well within `UBaseComponent`'s existing `signal`-state +
 * computed-inline-style pattern, already established by this same
 * capability's `UTieredMenu`/`USplitButton` siblings. This adaptation
 * follows that same independent shape and mechanism.
 */
@Component({
  standalone: true,
  selector: "u-speed-dial",
  template: `
    <div [class]="cx('root', { direction: direction() })">
      <button
        type="button"
        [class]="cx('pcButton', { open: visible() })"
        [disabled]="disabled()"
        [attr.aria-expanded]="visible()"
        [attr.aria-haspopup]="true"
        [attr.aria-label]="ariaLabel()"
        (click)="onButtonClick($event)"
      >
        @if (icon()) {
          <span [class]="icon()"></span>
        }
      </button>
      <ul [class]="cx('list')" role="menu" [style]="listDirectionStyle()">
        @for (item of model(); track item.label; let i = $index) {
          <li [class]="cx('item', { hidden: item.visible === false })" role="none" [style]="getItemStyle(i)">
            <button
              type="button"
              [class]="cx('pcAction')"
              role="menuitem"
              [disabled]="item.disabled"
              [attr.aria-label]="item.label"
              [attr.tabindex]="item.disabled || !visible() ? -1 : 0"
              (click)="onItemClick($event, item)"
            >
              @if (item.icon) {
                <span [class]="[cx('actionIcon'), item.icon]"></span>
              }
            </button>
          </li>
        }
      </ul>
    </div>
    @if (mask() && visible()) {
      <div [class]="cx('mask')" (click)="hide()"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USpeedDial extends UBaseComponent {
  protected override readonly componentName = "speed-dial";
  protected override readonly styleModule = speedDialStyleModule;

  /** MenuModel instance to define the action items. */
  model = input<UMenuItem[]>([]);
  /** Icon of the toggle button. */
  icon = input<string>();
  /** Specifies the opening direction of actions. */
  direction = input<SpeedDialDirection>("up");
  /** Specifies the opening type of actions. */
  type = input<SpeedDialType>("linear");
  /** Radius for *circle types. */
  radius = input(0, { transform: numberAttribute });
  /** Transition delay step for each action item, in ms. */
  transitionDelay = input(30, { transform: numberAttribute });
  /** Whether to show a mask element behind the speed dial. */
  mask = input(false, { transform: booleanAttribute });
  /** Whether the component is disabled. */
  disabled = input(false, { transform: booleanAttribute });
  /** Whether the actions close when Escape is pressed. */
  closeOnEscape = input(true, { transform: booleanAttribute });
  /** Defines a string value that labels an interactive element. */
  ariaLabel = input<string>();

  /** Fired when the visibility of element changed. */
  onVisibleChange = output<boolean>();
  /** Fired when the button element is clicked. */
  onClick = output<MouseEvent>();
  /** Fired when the actions become visible. */
  onShow = output<void>();
  /** Fired when the actions are hidden. */
  onHide = output<void>();

  protected readonly visible = signal(false);

  protected listDirectionStyle() {
    const dir = this.direction();
    const flexDirection =
      dir === "up" ? "column-reverse" : dir === "down" ? "column" : dir === "left" ? "row-reverse" : dir === "right" ? "row" : undefined;
    return flexDirection ? { "flex-direction": flexDirection } : {};
  }

  protected getItemStyle(index: number): Record<string, string> {
    const length = this.model().length;
    const delay = (this.visible() ? index : length - index - 1) * this.transitionDelay();
    return { "transition-delay": `${delay}ms`, ...this.calculatePointStyle(index) };
  }

  private calculatePointStyle(index: number): Record<string, string> {
    const type = this.type();
    if (type === "linear") return {};

    const length = this.model().length;
    const radius = this.radius() || length * 20;

    if (type === "circle") {
      const step = (2 * Math.PI) / length;
      return { left: `${radius * Math.cos(step * index)}px`, top: `${radius * Math.sin(step * index)}px` };
    }

    const direction = this.direction();
    if (type === "semi-circle") {
      const step = Math.PI / (length - 1);
      const x = `${radius * Math.cos(step * index)}px`;
      const y = `${radius * Math.sin(step * index)}px`;
      if (direction === "up") return { left: x, bottom: y };
      if (direction === "down") return { left: x, top: y };
      if (direction === "left") return { right: y, top: x };
      if (direction === "right") return { left: y, top: x };
    }

    if (type === "quarter-circle") {
      const step = Math.PI / (2 * (length - 1));
      const x = `${radius * Math.cos(step * index)}px`;
      const y = `${radius * Math.sin(step * index)}px`;
      if (direction === "up-left") return { right: x, bottom: y };
      if (direction === "up-right") return { left: x, bottom: y };
      if (direction === "down-left") return { right: y, top: x };
      if (direction === "down-right") return { left: y, top: x };
    }

    return {};
  }

  protected onButtonClick(event: MouseEvent): void {
    this.visible() ? this.hide() : this.show();
    this.onClick.emit(event);
  }

  protected onItemClick(event: MouseEvent, item: UMenuItem): void {
    if (item.command) {
      item.command({ originalEvent: event, item });
    }
    this.hide();
  }

  /** Shows the action items. */
  show(): void {
    if (this.visible()) return;
    this.visible.set(true);
    this.onVisibleChange.emit(true);
    this.onShow.emit();
  }

  /** Hides the action items. */
  hide(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.onVisibleChange.emit(false);
    this.onHide.emit();
  }

  @HostListener("document:keydown.escape")
  protected onEscape(): void {
    if (this.closeOnEscape() && this.visible()) {
      this.hide();
    }
  }
}
