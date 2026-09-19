import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UTabs } from "./tabs";
import { tabsStyleModule } from "./tabs-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `TabPanel` component (see
 * `.vendor-extracted/ng/tabs/tabpanel.ts`). Content pane linked to a
 * `UTab` by matching `value`; hidden (via `[hidden]`) when its `value`
 * does not match the ancestor `UTabs`'s active `value`.
 */
@Component({
  standalone: true,
  selector: "u-tab-panel",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('tabPanelRoot')",
    role: "tabpanel",
    "[attr.data-u-active]": "active()",
    "[hidden]": "!active()",
  },
})
export class UTabPanel extends UBaseComponent {
  protected override readonly componentName = "tabs";
  protected override readonly styleModule = tabsStyleModule;

  private readonly pcTabs = inject(UTabs);

  /** Value of this panel — must match a `UTab`'s own `value` to link them. */
  value = input.required<string | number>();

  protected readonly active = computed(() => this.pcTabs.value() === this.value());
}
