import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { UBaseComponent } from "@ultimate/ng-core";
import { inplaceStyleModule } from "./inplace-style";

/** Template context handed to the `#content` template — matches real source's own `closeCallback` context shape. */
export interface UInplaceContentContext {
  closeCallback: (event?: Event) => void;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Inplace` component (see
 * `.vendor-extracted/ng/inplace/inplace.ts`). Provides easy editing/display
 * at the same time: clicking the display content activates and swaps in
 * the edit content — matching real source's own `active`/`disabled`/
 * `preventClick` structural shape and its `#content` template
 * `closeCallback` context.
 *
 * Deliberately excludes real source's deprecated `closable`/`closeIcon`
 * inputs and its built-in `p-button` close control — this port exposes
 * only the `closeCallback` context on the `#content` template (real
 * source's own documented replacement for `closable`, per its own
 * `@deprecated since v20.0.0, use closeCallback within content template`
 * doc comment), letting the consumer render their own close affordance.
 * Also excludes the separate `InplaceDisplay`/`InplaceContent` marker
 * components — this port uses plain `ng-content select` for the display
 * slot and a named `#content` template for the edit slot, same "smaller
 * surface than upstream" precedent as every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-inplace",
  imports: [CommonModule],
  template: `
    @if (!isActive()) {
      <div
        [class]="cx('display')"
        tabindex="0"
        role="button"
        [attr.data-p-disabled]="disabled()"
        (click)="onActivateClick($event)"
        (keydown)="onKeydown($event)"
      >
        <ng-content select="[displayContent]"></ng-content>
      </div>
    } @else {
      <div [class]="cx('content')">
        <ng-container
          *ngTemplateOutlet="contentTemplate ?? null; context: { closeCallback: onDeactivateClick.bind(this) }"
        ></ng-container>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[attr.aria-live]": "'polite'",
  },
})
export class UInplace extends UBaseComponent {
  protected override readonly componentName = "inplace";
  protected override readonly styleModule = inplaceStyleModule;

  /** Whether the content is displayed. */
  active = input(false, { transform: booleanAttribute });
  /** Whether the component is disabled. */
  disabled = input(false, { transform: booleanAttribute });
  /** Prevents activation/deactivation via click. */
  preventClick = input(false, { transform: booleanAttribute });

  /** Emitted when inplace is opened. */
  onActivate = output<Event | undefined>();
  /** Emitted when inplace is closed. */
  onDeactivate = output<Event | undefined>();

  @ContentChild("content", { descendants: false })
  protected contentTemplate?: TemplateRef<UInplaceContentContext>;

  private readonly internalActive = signal<boolean | null>(null);

  protected readonly isActive = computed(() => this.internalActive() ?? this.active());

  protected onActivateClick(event: Event): void {
    if (!this.preventClick()) this.activate(event);
  }

  protected onDeactivateClick(event?: Event): void {
    if (!this.preventClick()) this.deactivate(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.code === "Enter") {
      this.activate(event);
      event.preventDefault();
    }
  }

  private activate(event?: Event): void {
    if (this.disabled()) return;
    this.internalActive.set(true);
    this.onActivate.emit(event);
  }

  private deactivate(event?: Event): void {
    if (this.disabled()) return;
    this.internalActive.set(false);
    this.onDeactivate.emit(event);
  }
}
