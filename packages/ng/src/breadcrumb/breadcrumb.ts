import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { breadcrumbStyleModule } from "./breadcrumb-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Breadcrumb` component (see
 * `.vendor-extracted/ng/breadcrumb/breadcrumb.ts`). Renders a trail-of-links
 * `<nav><ol>` — an optional `home` item followed by `model` entries,
 * separated by a chevron `<li role="separator">` between each rendered
 * item. Real PrimeNG's `Breadcrumb` (`extends BaseComponent`, no import of
 * `primeng/menu`) is a standalone, independent component — it does NOT
 * compose or wrap `Menu`; this adaptation follows that same independent
 * shape, extending `UBaseComponent` directly (same tier `UMenu` itself
 * uses), not `UMenu`.
 *
 * Deliberately excludes upstream's passthrough (`pt`/`ptm`) system,
 * `styleClass`/`style` inline-style inputs, per-item `badge`/template
 * projection slots (`item`/`separator` custom templates), and HTML-label
 * (`innerHTML`) escaping toggle — none of these appear in this task's
 * scoped-down surface, matching the same reduction `UMenu` already applied
 * to real PrimeNG's `Menu`.
 *
 * `aria-current="page"` is applied to the last rendered item's link
 * whenever its `routerLink` matches the current location path, adapted
 * from real PrimeReact's `isCurrent()` helper (PrimeNG's own `Breadcrumb`
 * has no equivalent — this task's own test coverage requires it, and the
 * behavior is a reasonable, real-source-grounded cross-framework addition
 * matching what PrimeReact/PrimeVue's own Breadcrumb already do).
 */
@Component({
  standalone: true,
  selector: "u-breadcrumb",
  imports: [RouterModule, NgTemplateOutlet],
  template: `
    <nav [class]="cx('root')">
      <ol [class]="cx('list')">
        @if (home(); as homeItem) {
          @if (homeItem.visible !== false) {
            <li [class]="cx('homeItem')">
              @if (homeItem.routerLink && !homeItem.disabled) {
                <a
                  [routerLink]="homeItem.routerLink"
                  [class]="cx('itemLink')"
                  [attr.aria-label]="homeAriaLabel()"
                  [attr.aria-disabled]="homeItem.disabled || null"
                  [attr.tabindex]="homeItem.disabled ? -1 : 0"
                  (click)="onClick($event, homeItem)"
                >
                  <ng-container
                    [ngTemplateOutlet]="linkContent"
                    [ngTemplateOutletContext]="{ $implicit: homeItem }"
                  />
                </a>
              } @else {
                <a
                  [attr.href]="homeItem.url ?? '#'"
                  [class]="cx('itemLink')"
                  [attr.aria-label]="homeAriaLabel()"
                  [attr.aria-disabled]="homeItem.disabled || null"
                  [attr.tabindex]="homeItem.disabled ? -1 : 0"
                  (click)="onClick($event, homeItem)"
                >
                  <ng-container
                    [ngTemplateOutlet]="linkContent"
                    [ngTemplateOutletContext]="{ $implicit: homeItem }"
                  />
                </a>
              }
            </li>
          }
          @if (model().length > 0) {
            <li [class]="cx('separator')" role="separator">›</li>
          }
        }
        @for (item of model(); track $index; let last = $last) {
          @if (item.visible !== false) {
            <li [class]="cx('item', itemClassesParams(item))">
              @if (item.routerLink && !item.disabled) {
                <a
                  [routerLink]="item.routerLink"
                  [class]="cx('itemLink')"
                  [attr.aria-disabled]="item.disabled || null"
                  [attr.aria-current]="last && isCurrent(item) ? 'page' : null"
                  [attr.tabindex]="item.disabled ? -1 : 0"
                  [attr.data-u-disabled]="!!item.disabled"
                  (click)="onClick($event, item)"
                >
                  <ng-container
                    [ngTemplateOutlet]="linkContent"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              } @else {
                <a
                  [attr.href]="item.url ?? '#'"
                  [class]="cx('itemLink')"
                  [attr.aria-disabled]="item.disabled || null"
                  [attr.aria-current]="last && isCurrent(item) ? 'page' : null"
                  [attr.tabindex]="item.disabled ? -1 : 0"
                  [attr.data-u-disabled]="!!item.disabled"
                  (click)="onClick($event, item)"
                >
                  <ng-container
                    [ngTemplateOutlet]="linkContent"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              }
            </li>
            @if (!last) {
              <li [class]="cx('separator')" role="separator">›</li>
            }
          }
        }
      </ol>
    </nav>
    <ng-template #linkContent let-item>
      @if (item.icon) {
        <span [class]="item.icon + ' ' + cx('itemIcon')"></span>
      }
      @if (item.label) {
        <span [class]="cx('itemLabel')">{{ item.label }}</span>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UBreadcrumb extends UBaseComponent {
  protected override readonly componentName = "breadcrumb";
  protected override readonly styleModule = breadcrumbStyleModule;

  /** An array of menuitems. */
  model = input<UMenuItem[]>([]);
  /** MenuItem configuration for the home icon. */
  home = input<UMenuItem>();
  /** Defines a string that labels the home icon for accessibility. */
  homeAriaLabel = input<string>();

  /** Fired when an item is selected. */
  onItemClick = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  protected itemClassesParams(item: UMenuItem) {
    return { disabled: !!item.disabled };
  }

  protected isCurrent(item: UMenuItem): boolean {
    if (!item.routerLink) return false;
    const path = Array.isArray(item.routerLink) ? item.routerLink.join("/") : item.routerLink;
    return typeof window !== "undefined" && window.location.pathname.replace(/^\//, "") === path.replace(/^\//, "");
  }

  protected onClick(event: MouseEvent, item: UMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (!item.url && !item.routerLink) {
      event.preventDefault();
    }
    item.command?.({ originalEvent: event, item });
    this.onItemClick.emit({ originalEvent: event, item });
  }
}
