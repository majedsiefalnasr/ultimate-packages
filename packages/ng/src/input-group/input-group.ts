import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind } from "@ultimate/ng-core";
import { inputGroupAddonStyleModule, inputGroupStyleModule } from "./input-group-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputGroup` (real source:
 * `inputgroup/inputgroup.ts`). InputGroup displays text, icon, buttons and
 * other content grouped next to an input — a layout wrapper, not a form
 * control itself.
 *
 * Real source extends bare `BaseComponent<InputGroupPassThrough>` — no
 * CVA/controlled-value concept, only `<ng-content>` projection. `pt`,
 * `unstyled` and `dt` come from `UBaseComponent`; the root is bound through
 * the `UBind` host directive, as PrimeNG's `ptms(['host', 'root'])` does.
 */
@Component({
  standalone: true,
  selector: "u-input-group",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
  hostDirectives: [UBind],
})
export class UInputGroup extends UBaseComponent {
  protected override readonly componentName = "inputgroup";
  protected override readonly styleModule = inputGroupStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}

/**
 * Ultimate-owned adaptation of PrimeNG's `InputGroupAddon` (real source:
 * `inputgroupaddon/inputgroupaddon.ts`). InputGroupAddon displays text, icon,
 * buttons and other content grouped next to an input, typically projected as
 * a `UInputGroup` child.
 *
 * Real source's own `style` input (`@HostBinding('style')`) is ported here as
 * an `inlineStyle` input bound to `[style]` directly, so it does not collide
 * with Angular's own `style` host-binding conventions.
 */
@Component({
  standalone: true,
  selector: "u-input-group-addon",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[style]": "inlineStyle()",
  },
  hostDirectives: [UBind],
})
export class UInputGroupAddon extends UBaseComponent {
  protected override readonly componentName = "inputgroupaddon";
  protected override readonly styleModule = inputGroupAddonStyleModule;

  /** Inline style of the element. */
  inlineStyle = input<Record<string, unknown> | null | undefined>(undefined);

  private readonly bindDirective = inject(UBind, { self: true });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
