import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { accordionStyleModule } from "./accordion-style";

/** A single panel definition rendered by `UAccordion`. */
export interface UAccordionPanel {
  /** Unique key identifying this panel — drives active-state comparison. */
  value: string | number;
  /** Header text for this panel. */
  header?: string;
  /** Disables this panel's header interaction when true. */
  disabled?: boolean;
}

/** Custom tab open/close event. */
export interface UAccordionTabEvent {
  originalEvent?: Event;
  index: string | number;
}

/** Template context for `UAccordion`'s `#panelContent` template. */
export interface UAccordionContentContext {
  $implicit: UAccordionPanel;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Accordion`/`AccordionPanel`/
 * `AccordionHeader`/`AccordionContent` component family (see
 * `.vendor-extracted/ng/accordion/accordion.ts`). Real PrimeNG's own
 * Angular Accordion is itself a 4-component family (`Accordion` +
 * `AccordionPanel` + `AccordionHeader` + `AccordionContent`, each wired via
 * DI-injected parent lookups) — this task's brief directs a single-
 * component reduction for Angular (matching this project's own established
 * "data-model-driven reduction" precedent already proven by `UPanelMenu`,
 * which reduces PrimeNG's own recursive `PanelMenuSub`/`PanelMenuList` the
 * same way). `UAccordion` accepts a `panels: UAccordionPanel[]` model plus
 * a single consumer-supplied `#panelContent` template — rendered once per
 * active panel via `NgTemplateOutlet` with `{ $implicit: panel }` context —
 * mirroring `UScroller`'s own already-proven `@ContentChild('content',
 * {descendants: false})` + `ngTemplateOutlet` composition mechanism
 * (`packages/ng/src/scroller/scroller.ts`), and real PrimeNG Carousel's own
 * `itemTemplate` context-outlet shape, rather than Prime Accordion's own
 * child-component-scanning/content-projection mechanism.
 *
 * Active-panel tracking uses `value` (string | number) equality, matching
 * real source's own `value`-keyed (not object-identity-keyed) activation
 * model exactly — `multiple` toggles between a single active value and an
 * array of active values, mirroring real `Accordion.updateValue()`.
 *
 * Deliberately excludes real source's passthrough (`pt`/`ptm`/`Bind`)
 * system, `expandIcon`/`collapseIcon` custom-icon inputs (a plain triangle
 * glyph is used instead), `motionOptions`/`transitionOptions` animation
 * timing, and the roving `ArrowUp`/`ArrowDown`/`Home`/`End` keyboard
 * navigation across headers — Enter/Space toggling and native Tab order
 * are retained, same "smaller surface than upstream" precedent as every
 * sibling component.
 */
@Component({
  standalone: true,
  selector: "u-accordion",
  imports: [CommonModule],
  template: `
    <div [class]="cx('root')">
      @for (panel of panels(); track panel.value) {
        <div
          [class]="cx('panel', panelParams(panel))"
          [attr.data-u-disabled]="!!panel.disabled"
          [attr.data-u-active]="isActive(panel.value)"
        >
          <div
            [class]="cx('header', panelParams(panel))"
            role="button"
            [attr.tabindex]="panel.disabled ? -1 : 0"
            [attr.aria-expanded]="isActive(panel.value)"
            [attr.aria-disabled]="panel.disabled || null"
            [attr.data-u-disabled]="!!panel.disabled"
            [attr.data-u-active]="isActive(panel.value)"
            (click)="onHeaderClick($event, panel)"
            (keydown.enter)="onHeaderClick($event, panel)"
            (keydown.space)="onHeaderClick($event, panel)"
          >
            <span>{{ panel.header }}</span>
            <span [class]="cx('toggleIcon')" aria-hidden="true">{{
              isActive(panel.value) ? "▾" : "▸"
            }}</span>
          </div>
          @if (isActive(panel.value)) {
            <div [class]="cx('content')" role="region">
              <div [class]="cx('contentInner')">
                <ng-container
                  *ngTemplateOutlet="panelContent ?? null; context: { $implicit: panel }"
                ></ng-container>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UAccordion extends UBaseComponent {
  protected override readonly componentName = "accordion";
  protected override readonly styleModule = accordionStyleModule;

  /** The panels to render. */
  panels = input<UAccordionPanel[]>([]);
  /** When enabled, multiple tabs can be activated at the same time. */
  multiple = input(false, { transform: booleanAttribute });
  /** Value of the active panel(s). Single value in single mode, array in multiple mode. */
  value = input<string | number | (string | number)[] | undefined>(undefined);

  /** Emitted when the active value changes (single or array, mirroring `value`'s own shape). */
  valueChange = output<string | number | (string | number)[] | undefined>();
  /** Callback to invoke when a panel gets expanded. */
  onOpen = output<UAccordionTabEvent>();
  /** Callback to invoke when an active panel is collapsed. */
  onClose = output<UAccordionTabEvent>();

  /** Consumer-supplied content template, rendered per active panel with `{ $implicit: panel }` context. */
  @ContentChild("panelContent", { descendants: false })
  protected panelContent?: TemplateRef<UAccordionContentContext>;

  private readonly internalValue = signal<string | number | (string | number)[] | undefined>(
    undefined
  );

  protected isActive(value: string | number): boolean {
    const current = this.value() ?? this.internalValue();
    if (Array.isArray(current)) {
      return current.includes(value);
    }
    return current === value;
  }

  protected panelParams(panel: UAccordionPanel) {
    return { active: this.isActive(panel.value), disabled: !!panel.disabled };
  }

  protected onHeaderClick(event: Event, panel: UAccordionPanel): void {
    if (panel.disabled) {
      return;
    }
    event.preventDefault();
    const wasActive = this.isActive(panel.value);
    const current = this.value() ?? this.internalValue();

    let next: string | number | (string | number)[] | undefined;
    if (this.multiple()) {
      const currentArray = Array.isArray(current) ? [...current] : [];
      const index = currentArray.indexOf(panel.value);
      if (index !== -1) {
        currentArray.splice(index, 1);
      } else {
        currentArray.push(panel.value);
      }
      next = currentArray;
    } else {
      next = current === panel.value ? undefined : panel.value;
    }

    this.internalValue.set(next);
    this.valueChange.emit(next);

    if (!wasActive) {
      this.onOpen.emit({ originalEvent: event, index: panel.value });
    } else {
      this.onClose.emit({ originalEvent: event, index: panel.value });
    }
  }
}
