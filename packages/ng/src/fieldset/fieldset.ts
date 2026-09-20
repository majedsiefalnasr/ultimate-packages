import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { uuid } from "@ultimate/uix-utils/uuid";
import { fieldsetStyleModule } from "./fieldset-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Fieldset` component (see
 * `.vendor-extracted/ng/fieldset/fieldset.ts`). A grouping component with
 * an optional `legend` heading and an optional content-toggle feature —
 * matching real source's own `legend`/`toggleable`/`collapsed` structural
 * shape.
 *
 * Deliberately excludes real source's `p-header`/custom
 * header/expandicon/collapseicon/content `<ng-template>` overrides and its
 * `@primeuix/motion`-driven collapse transition — this port toggles
 * visibility via a plain `@if`, no enter/leave animation, same "smaller
 * surface than upstream" precedent as every sibling component. Real
 * source's expand/collapse glyphs (`PlusIcon`/`MinusIcon`) have no
 * `@ultimate/ng-core` equivalent yet — plain `+`/`−` text glyphs are used
 * instead, disclosed here rather than silently substituted.
 */
@Component({
  standalone: true,
  selector: "u-fieldset",
  template: `
    <fieldset [class]="cx('root', { toggleable: toggleable() })" [attr.id]="id">
      <legend [class]="cx('legend')">
        @if (toggleable()) {
          <button
            type="button"
            [attr.id]="id + '_header'"
            [attr.aria-controls]="id + '_content'"
            [attr.aria-expanded]="!isCollapsed()"
            [class]="cx('toggleButton')"
            (click)="toggle($event)"
            (keydown)="onKeyDown($event)"
          >
            <span [class]="cx('toggleIcon')" aria-hidden="true">{{ isCollapsed() ? "+" : "−" }}</span>
            <span [class]="cx('legendLabel')">{{ legend() }}</span>
          </button>
        } @else {
          <span [class]="cx('legendLabel')">{{ legend() }}</span>
        }
      </legend>
      @if (!toggleable() || !isCollapsed()) {
        <div [class]="cx('contentContainer')" role="region" [attr.id]="id + '_content'" [attr.aria-labelledby]="id + '_header'">
          <div [class]="cx('content')">
            <ng-content></ng-content>
          </div>
        </div>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UFieldset extends UBaseComponent {
  protected override readonly componentName = "fieldset";
  protected override readonly styleModule = fieldsetStyleModule;

  /** Header text of the fieldset. */
  legend = input<string>();
  /** When present, content can be toggled by clicking the legend. */
  toggleable = input(false, { transform: booleanAttribute });
  /** Defines the initial state of content. */
  collapsed = input(false, { transform: booleanAttribute });

  /** Emits when the collapsed state changes. */
  collapsedChange = output<boolean>();

  protected readonly id = uuid("u_fieldset_");

  /**
   * Internal override of the `collapsed` input once the user has toggled
   * at least once — matching real source's own `_collapsed` field, which
   * takes over from the initial `collapsed` input value after the first
   * toggle (uncontrolled-with-initial-value pattern, not two-way-bound).
   */
  private readonly toggledCollapsed = signal<boolean | null>(null);

  protected readonly isCollapsed = computed(() => this.toggledCollapsed() ?? this.collapsed());

  protected toggle(event: Event): void {
    const next = !this.isCollapsed();
    this.toggledCollapsed.set(next);
    this.collapsedChange.emit(next);
    event.preventDefault();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.code === "Enter" || event.code === "Space") {
      this.toggle(event);
    }
  }
}
