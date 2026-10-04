import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { inputGroupAddonStyleModule, inputGroupStyleModule } from "./input-group-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputGroup` (see
 * `.vendor-extracted/ng/inputgroup/inputgroup.ts`, extracted this session
 * via `scripts/provenance/extract-primeng-source.mjs`). InputGroup displays
 * text, icon, buttons and other content grouped next to an input — a layout
 * wrapper, not a form control itself.
 *
 * Real source extends bare `BaseComponent<InputGroupPassThrough>` — no
 * CVA/controlled-value concept, only `<ng-content>` projection (its only
 * other input, `styleClass`, is the deprecated pre-`class`-binding
 * mechanism already excluded by every other Ultimate component's Option B
 * posture).
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
})
export class UInputGroup extends UBaseComponent {
  protected override readonly componentName = "inputgroup";
  protected override readonly styleModule = inputGroupStyleModule;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `InputGroupAddon` (see
 * `.vendor-extracted/ng/inputgroupaddon/inputgroupaddon.ts`).
 * InputGroupAddon displays text, icon, buttons and other content grouped
 * next to an input — typically projected as a `UInputGroup` child.
 *
 * Real source extends bare `BaseComponent<InputGroupAddonPassThrough>` — no
 * CVA/controlled-value concept. Real source's own `style` input
 * (`@HostBinding('style')`) is ported here as an `inlineStyle` input bound
 * to `[style]` directly (named to avoid colliding with Angular's own
 * `style` host-binding conventions elsewhere in this package).
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
})
export class UInputGroupAddon extends UBaseComponent {
  protected override readonly componentName = "input-group-addon";
  protected override readonly styleModule = inputGroupAddonStyleModule;

  /** Inline style of the element. */
  inlineStyle = input<Record<string, unknown> | null | undefined>(undefined);
}
