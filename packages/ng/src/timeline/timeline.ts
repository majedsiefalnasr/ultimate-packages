import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
  input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { UBaseComponent } from "@ultimate/ng-core";
import { timelineStyleModule } from "./timeline-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Timeline` component (see
 * `.vendor-extracted/ng/timeline/timeline.ts`). Confirmed against real
 * source: extends the bare `BaseComponent` tier (no CVA) — a display
 * component visualizing a series of chained events, never a form control.
 *
 * This port keeps real source's `value`/`align`/`layout` surface and its
 * three content-projection slots (opposite/marker/content), realized here
 * via three named `ng-template` `ContentChild` refs (`#opposite`,
 * `#marker`, `#content`) instead of real source's `PrimeTemplate`
 * type-scanning mechanism — same "framework-native, not verbatim"
 * adaptation precedent as every sibling component with template slots
 * (e.g. `UPanel`'s header/footer templates).
 */
@Component({
  standalone: true,
  selector: "u-timeline",
  imports: [CommonModule],
  template: `
    @for (event of value(); track $index; let last = $last) {
      <div [class]="cx('event')">
        <div [class]="cx('eventOpposite')">
          <ng-container *ngTemplateOutlet="oppositeTemplate ?? null; context: { $implicit: event }"></ng-container>
        </div>
        <div [class]="cx('eventSeparator')">
          @if (markerTemplate) {
            <ng-container *ngTemplateOutlet="markerTemplate; context: { $implicit: event }"></ng-container>
          } @else {
            <div [class]="cx('eventMarker')"></div>
          }
          @if (!last) {
            <div [class]="cx('eventConnector')"></div>
          }
        </div>
        <div [class]="cx('eventContent')">
          <ng-container *ngTemplateOutlet="contentTemplate ?? null; context: { $implicit: event }"></ng-container>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { layout: layout(), align: align() })",
  },
})
export class UTimeline<T = unknown> extends UBaseComponent {
  protected override readonly componentName = "timeline";
  protected override readonly styleModule = timelineStyleModule;

  /** An array of events to display. */
  value = input<T[]>([]);
  /** Position of the timeline bar relative to the content. */
  align = input<"left" | "right" | "top" | "bottom">("left");
  /** Orientation of the timeline. */
  layout = input<"vertical" | "horizontal">("vertical");

  /** Custom content template, receiving the event as its implicit context. */
  @ContentChild("content") contentTemplate?: TemplateRef<{ $implicit: T }>;
  /** Custom opposite-side template, receiving the event as its implicit context. */
  @ContentChild("opposite") oppositeTemplate?: TemplateRef<{ $implicit: T }>;
  /** Custom marker template, receiving the event as its implicit context. */
  @ContentChild("marker") markerTemplate?: TemplateRef<{ $implicit: T }>;
}
