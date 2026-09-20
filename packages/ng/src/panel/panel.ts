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
import { UButton } from "../button";
import { panelStyleModule } from "./panel-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Panel` component (see
 * `.vendor-extracted/ng/panel/panel.ts`). Confirmed against real source:
 * extends the bare `BaseComponent` tier (no CVA) — a container with header/
 * content/footer regions and an optional content-toggle feature, composing
 * `Button` for its toggle affordance (matching this batch's own `UButton` +
 * `UMenu` composition precedent from `USplitButton`).
 *
 * Deliberately excludes real source's header/icons/content/footer/
 * headericons `<ng-template>` overrides (only content projection is
 * offered for the body; `header`/`footer` are plain string inputs), its
 * `toggler: 'header'` mode (only the toggle-icon-button click toggles;
 * header-click-to-toggle is not implemented), and its
 * `@primeuix/motion`-driven collapse transition — this port toggles
 * visibility via a plain `@if`, no enter/leave animation. Same "smaller
 * surface than upstream" precedent as every sibling component.
 *
 * Note: `[attr.aria-label]`/`[attr.aria-controls]`/`[attr.aria-expanded]`
 * bound on `<u-button>` land on that custom element's own host, not
 * forwarded to its inner native `<button>` — `UButton` has no passthrough
 * mechanism for host-attribute forwarding (Option B, same posture as every
 * other `UButton` consumer in this codebase). Disclosed rather than
 * silently assumed to work.
 */
@Component({
  standalone: true,
  selector: "u-panel",
  imports: [UButton],
  template: `
    <div [class]="cx('root')" [attr.id]="id">
      @if (showHeader()) {
        <div [class]="cx('header', { toggleable: toggleable() })" [attr.id]="id + '-titlebar'">
          @if (header()) {
            <span [class]="cx('title')" [attr.id]="id + '_header'">{{ header() }}</span>
          }
          <ng-content select="[header]"></ng-content>
          <div [class]="cx('headerActions')">
            @if (toggleable()) {
              <u-button
                [attr.id]="id + '_toggle'"
                severity="secondary"
                [text]="true"
                [rounded]="true"
                type="button"
                [attr.aria-label]="header()"
                [attr.aria-controls]="id + '_content'"
                [attr.aria-expanded]="!isCollapsed()"
                [icon]="isCollapsed() ? 'pi pi-plus' : 'pi pi-minus'"
                (onClick)="toggle($event)"
              ></u-button>
            }
          </div>
        </div>
      }
      @if (!toggleable() || !isCollapsed()) {
        <div [class]="cx('contentContainer')" role="region" [attr.id]="id + '_content'" [attr.aria-labelledby]="id + '_header'">
          <div [class]="cx('content')">
            <ng-content></ng-content>
          </div>
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UPanel extends UBaseComponent {
  protected override readonly componentName = "panel";
  protected override readonly styleModule = panelStyleModule;

  /** Header text of the panel. */
  header = input<string>();
  /** Defines if content of panel can be expanded and collapsed. */
  toggleable = input(false, { transform: booleanAttribute });
  /** Defines the initial state of panel content. */
  collapsed = input(false, { transform: booleanAttribute });
  /** Specifies if header of panel can be displayed. */
  showHeader = input(true, { transform: booleanAttribute });

  /** Emitted when the collapsed state changes. */
  collapsedChange = output<boolean>();
  /** Callback to invoke before panel toggle. */
  onBeforeToggle = output<{ originalEvent: Event; collapsed: boolean }>();
  /** Callback to invoke after panel toggle. */
  onAfterToggle = output<{ originalEvent: Event; collapsed: boolean }>();

  protected readonly id = uuid("u_panel_");

  /**
   * Internal override of the `collapsed` input once the user has toggled at
   * least once — matching real source's own `_collapsed` field, which takes
   * over from the initial `collapsed` input value after the first toggle
   * (uncontrolled-with-initial-value pattern, not two-way-bound).
   */
  private readonly toggledCollapsed = signal<boolean | null>(null);

  protected readonly isCollapsed = computed(() => this.toggledCollapsed() ?? this.collapsed());

  protected toggle(event: Event): void {
    const wasCollapsed = this.isCollapsed();
    this.onBeforeToggle.emit({ originalEvent: event, collapsed: wasCollapsed });
    const next = !wasCollapsed;
    this.toggledCollapsed.set(next);
    this.collapsedChange.emit(next);
    this.onAfterToggle.emit({ originalEvent: event, collapsed: next });
  }
}
