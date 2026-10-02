import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  inject,
  numberAttribute,
  output,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { stepsStyleModule } from "./steps-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Steps` component (see
 * `.vendor-extracted/ng/steps/steps.ts`). Renders a linear, read-only-by-
 * default step *indicator* for a wizard workflow — distinct from
 * `UStepper`, which is an interactive, content-switching component.
 *
 * Real PrimeNG's `Steps` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component driven by a flat
 * `MenuItem[]` model and an `activeIndex`, not a composition of `Menu`.
 * This adaptation follows that same independent shape.
 */
@Component({
  standalone: true,
  selector: "u-steps",
  imports: [NgTemplateOutlet, RouterModule],
  template: `
    <nav [class]="cx('root')">
      <ol [class]="cx('list')" (keydown)="onKeydown($event)">
        @for (item of model(); track item.label; let i = $index) {
          @if (item.visible !== false) {
            <li [class]="cx('item', itemParams(item, i))" [attr.aria-current]="i === activeIndex() ? 'step' : null">
              @if (item.routerLink && !readonly() && !item.disabled) {
                <a
                  [routerLink]="item.routerLink"
                  [target]="item.target"
                  [class]="cx('itemLink')"
                  [attr.tabindex]="isItemDisabled(item, i) ? -1 : 0"
                  [attr.aria-disabled]="isItemDisabled(item, i)"
                  (click)="onItemClick($event, item, i)"
                >
                  <ng-container [ngTemplateOutlet]="linkContent" [ngTemplateOutletContext]="{ $implicit: item, i }" />
                </a>
              } @else {
                <a
                  [attr.href]="item.url ?? '#'"
                  [target]="item.target"
                  [class]="cx('itemLink')"
                  [attr.tabindex]="isItemDisabled(item, i) ? -1 : 0"
                  [attr.aria-disabled]="isItemDisabled(item, i)"
                  (click)="onItemClick($event, item, i)"
                >
                  <ng-container [ngTemplateOutlet]="linkContent" [ngTemplateOutletContext]="{ $implicit: item, i }" />
                </a>
              }
            </li>
          }
        }
      </ol>
    </nav>
    <ng-template #linkContent let-item let-i="i">
      <span [class]="cx('itemNumber')">{{ i + 1 }}</span>
      @if (item.label) {
        <span [class]="cx('itemLabel')">{{ item.label }}</span>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USteps extends UBaseComponent {
  protected override readonly componentName = "steps";
  protected override readonly styleModule = stepsStyleModule;

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** An array of menu items. */
  model = input<UMenuItem[]>([]);
  /** Index of the active item. */
  activeIndex = input(0, { transform: numberAttribute });
  /** Whether the items are clickable or not. */
  readonly = input(true, { transform: booleanAttribute });

  /** Callback to invoke when the new step is selected. */
  onSelect = output<{ originalEvent: MouseEvent; item: UMenuItem; index: number }>();

  protected itemParams(item: UMenuItem, index: number) {
    return { active: index === this.activeIndex(), disabled: this.isItemDisabled(item, index) };
  }

  protected isItemDisabled(item: UMenuItem, index: number): boolean {
    return !!item.disabled || (this.readonly() && index !== this.activeIndex());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const links = Array.from<HTMLElement>(this.elementRef.nativeElement.querySelectorAll("a"));
    if (links.length === 0) {
      return;
    }
    // `links` holds rendered items only; pair each with its model index so
    // `isItemDisabled` (which compares against `activeIndex`) stays correct.
    const rendered = this.model()
      .map((item, modelIndex) => ({ item, modelIndex }))
      .filter(({ item }) => item.visible !== false);
    const isEnabled = (index: number) => !this.isItemDisabled(rendered[index].item, rendered[index].modelIndex);
    const currentIndex = links.indexOf(document.activeElement as HTMLElement);

    let targetIndex: number | undefined;
    switch (event.code) {
      case "ArrowRight":
        for (let i = currentIndex + 1; i < links.length; i++) {
          if (isEnabled(i)) {
            targetIndex = i;
            break;
          }
        }
        break;
      case "ArrowLeft":
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (isEnabled(i)) {
            targetIndex = i;
            break;
          }
        }
        break;
      case "Home":
        targetIndex = links.findIndex((_, i) => isEnabled(i));
        break;
      case "End":
        for (let i = links.length - 1; i >= 0; i--) {
          if (isEnabled(i)) {
            targetIndex = i;
            break;
          }
        }
        break;
      default:
        return;
    }

    event.preventDefault();
    if (targetIndex !== undefined && targetIndex >= 0) {
      links[targetIndex].focus();
    }
  }

  protected onItemClick(event: MouseEvent, item: UMenuItem, index: number): void {
    if (this.readonly() || item.disabled) {
      event.preventDefault();
      return;
    }
    this.onSelect.emit({ originalEvent: event, item, index });
    if (item.command) {
      item.command({ originalEvent: event, item, index });
    }
    if (!item.url) {
      event.preventDefault();
    }
  }
}
