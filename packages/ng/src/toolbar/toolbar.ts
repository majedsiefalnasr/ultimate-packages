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
import { toolbarStyleModule } from "./toolbar-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Toolbar` component (see
 * `.vendor-extracted/ng/toolbar/toolbar.ts`). Confirmed against real
 * source: extends the bare `BaseComponent` tier (no CVA) — a grouping
 * layout component for buttons/content with `role="toolbar"`, never a form
 * control.
 *
 * This port keeps real source's `start`/`center`/`end` three-slot layout,
 * realized via three named `ng-template` `ContentChild` refs (matching
 * `UTimeline`'s own template-slot precedent from this same sub-batch)
 * plus plain `<ng-content>` for any un-slotted default content — same
 * dual-path convention as real source's own `<ng-content>` + template
 * fallback.
 */
@Component({
  standalone: true,
  selector: "u-toolbar",
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
    @if (startTemplate) {
      <div [class]="cx('start')">
        <ng-container *ngTemplateOutlet="startTemplate"></ng-container>
      </div>
    }
    @if (centerTemplate) {
      <div [class]="cx('center')">
        <ng-container *ngTemplateOutlet="centerTemplate"></ng-container>
      </div>
    }
    @if (endTemplate) {
      <div [class]="cx('end')">
        <ng-container *ngTemplateOutlet="endTemplate"></ng-container>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    role: "toolbar",
    "[attr.aria-labelledby]": "ariaLabelledBy()",
  },
})
export class UToolbar extends UBaseComponent {
  protected override readonly componentName = "toolbar";
  protected override readonly styleModule = toolbarStyleModule;

  /** Defines a string value that labels an interactive element. */
  ariaLabelledBy = input<string>();

  /** Custom start-slot content. */
  @ContentChild("start") startTemplate?: TemplateRef<void>;
  /** Custom center-slot content. */
  @ContentChild("center") centerTemplate?: TemplateRef<void>;
  /** Custom end-slot content. */
  @ContentChild("end") endTemplate?: TemplateRef<void>;
}
