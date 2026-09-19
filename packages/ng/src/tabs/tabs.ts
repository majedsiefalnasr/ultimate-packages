import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { tabsStyleModule } from "./tabs-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Tabs` component (see
 * `.vendor-extracted/ng/tabs/tabs.ts`). Container/state-owner for the Tabs
 * family — child directives (`UTabList` → `UTab`, `UTabPanels` →
 * `UTabPanel`) resolve their nearest ancestor `UTabs` via Angular DI
 * (`inject(UTabs)`), matching real PrimeNG's own `TABS_INSTANCE`
 * injection-token pattern, adapted to plain class injection (no new
 * shared-package export needed).
 *
 * Real PrimeNG's `tabs/` source directory is itself decomposed into 5
 * components — `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel` (verified
 * this task's Step 1, `.vendor-extracted/ng/tabs/{tabs,tablist,tab,
 * tabpanels,tabpanel}.ts`) — not the single directive this task's binding
 * description assumed. This adaptation follows the real, verified source
 * shape rather than the assumption, per this task's own "verify per
 * capability rather than assuming" instruction and the spec's proof-by-
 * exception posture (§3.3/§7): decomposition shape is implementation
 * detail, not a scope boundary, and the real shape governs.
 */
@Component({
  standalone: true,
  selector: "u-tabs",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('tabsRoot')",
  },
})
export class UTabs extends UBaseComponent {
  protected override readonly componentName = "tabs";
  protected override readonly styleModule = tabsStyleModule;

  /** Value of the active tab. */
  value = model<string | number | undefined>(undefined);
  /** When enabled, the focused tab is activated. */
  selectOnFocus = input(false, { transform: booleanAttribute });
  /** Tabindex of the tab buttons. */
  tabindex = input(0);
  /** Whether to display navigation buttons in container when scrollable is enabled. */
  showNavigators = input(true, { transform: booleanAttribute });

  /** Programmatically activates a tab by value — mirrors real PrimeNG's `updateValue`. */
  updateValue(newValue: string | number | undefined): void {
    this.value.set(newValue);
  }
}
