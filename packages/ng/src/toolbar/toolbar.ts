import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
  inject,
  input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
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
 *
 * Regions render only when their template exists, as in PrimeNG. The
 * deprecated `left`/`right` template aliases, `styleClass`, `getBlockableElement()`
 * and the `PrimeTemplate`/`pTemplate` mechanism are not offered (ADR-089).
 * `pt` reaches the root, start, center and end sections; `unstyled` and `dt`
 * come from `UBaseComponent`.
 */
@Component({
  standalone: true,
  selector: "u-toolbar",
  imports: [CommonModule, UBind],
  template: `
    <ng-content></ng-content>
    @if (startTemplate) {
      <div [uBind]="ptm('start')" [class]="cx('start')">
        <ng-container *ngTemplateOutlet="startTemplate"></ng-container>
      </div>
    }
    @if (centerTemplate) {
      <div [uBind]="ptm('center')" [class]="cx('center')">
        <ng-container *ngTemplateOutlet="centerTemplate"></ng-container>
      </div>
    }
    @if (endTemplate) {
      <div [uBind]="ptm('end')" [class]="cx('end')">
        <ng-container *ngTemplateOutlet="endTemplate"></ng-container>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UToolbar }],
  host: {
    "[class]": "cx('root')",
    role: "toolbar",
    "[attr.aria-labelledby]": "ariaLabelledBy()",
  },
  hostDirectives: [UBind],
})
export class UToolbar extends UBaseComponent {
  protected override readonly componentName = "toolbar";
  protected override readonly styleModule = toolbarStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Defines a string value that labels an interactive element. */
  ariaLabelledBy = input<string>();

  /** Custom start-slot content. */
  @ContentChild("start") startTemplate?: TemplateRef<void>;
  /** Custom center-slot content. */
  @ContentChild("center") centerTemplate?: TemplateRef<void>;
  /** Custom end-slot content. */
  @ContentChild("end") endTemplate?: TemplateRef<void>;

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
