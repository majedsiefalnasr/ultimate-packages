import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { meterGroupStyleModule } from "./meter-group-style";

/** A single segment of a `UMeterGroup`. */
export interface UMeterItem {
  label?: string;
  color?: string;
  value: number;
  icon?: string;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `MeterGroup` component (see
 * `.vendor-extracted/ng/metergroup/metergroup.ts`). Confirmed against real
 * source: extends the bare `BaseComponent` tier (no CVA) — a display
 * component rendering a segmented bar of weighted `value` items within a
 * `min`/`max` range, plus an optional legend list of labels. Real source's
 * `value` shape (`{ label, color, value, icon }[]`) is reused verbatim as
 * `UMeterItem`.
 *
 * Deliberately excludes real source's `p-meterGroupLabel` as a separate
 * sub-component (folded into this single file, matching the "reduce a
 * decomposed family to one component" precedent already established by
 * `UAccordion`/`UPanelMenu`), its per-slot template-override system
 * (label/meter/start/end/icon templates), and `labelPosition: 'start'`
 * (only `'end'`, the default, is implemented) — same "smaller surface than
 * upstream" precedent as every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-meter-group",
  template: `
    <div [class]="cx('root', { orientation: orientation() })" role="meter" [attr.aria-valuemin]="min()" [attr.aria-valuemax]="max()" [attr.aria-valuenow]="totalPercent()">
      <div [class]="cx('meters')">
        @for (item of value(); track $index) {
          @if (item.value > 0) {
            <span [class]="cx('meter')" [style.width]="orientation() === 'horizontal' ? percentValue(item.value) : null" [style.height]="orientation() === 'vertical' ? percentValue(item.value) : null" [style.background]="item.color"></span>
          }
        }
      </div>
      <ol [class]="cx('labelList', { orientation: orientation() })">
        @for (item of value(); track $index) {
          <li [class]="cx('label')">
            @if (item.icon) {
              <i [class]="cx('labelIcon') + ' ' + item.icon" [style.color]="item.color"></i>
            } @else {
              <span [class]="cx('labelMarker')" [style.backgroundColor]="item.color"></span>
            }
            <span [class]="cx('labelText')">{{ item.label }} ({{ percentValue(item.value) }})</span>
          </li>
        }
      </ol>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMeterGroup extends UBaseComponent {
  protected override readonly componentName = "metergroup";
  protected override readonly styleModule = meterGroupStyleModule;

  /** Current value of the metergroup. */
  value = input<UMeterItem[]>([]);
  /** Minimum boundary value. */
  min = input(0);
  /** Maximum boundary value. */
  max = input(100);
  /** Specifies the layout of the component. */
  orientation = input<"horizontal" | "vertical">("horizontal");

  protected percent(meter = 0): number {
    const min = this.min();
    const max = this.max();
    if (max === min) return 100;
    const percentOfItem = ((meter - min) / (max - min)) * 100;
    return Math.round(Math.max(0, Math.min(100, percentOfItem)));
  }

  protected percentValue(meter: number): string {
    return `${this.percent(meter)}%`;
  }

  protected readonly totalPercent = computed(() =>
    this.percent(this.value().reduce((total, item) => total + (item.value || 0), 0))
  );
}
