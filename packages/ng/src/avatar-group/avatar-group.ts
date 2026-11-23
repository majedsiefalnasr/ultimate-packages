import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { avatarGroupStyleModule } from "./avatar-group-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `AvatarGroup` component (see
 * `.vendor-extracted/ng/avatargroup/avatargroup.ts`). A helper component for
 * `UAvatar`: a content-projection wrapper whose overlapping layout is CSS-only
 * (the shared `@ultimate/uix-styles/avatar` module). `pt`, `unstyled` and `dt`
 * come from `UBaseComponent`, with the host and root sections bound through the
 * `UBind` host directive. `styleClass` and `style` are not offered; the host
 * takes a normal `class` and `style`.
 */
@Component({
  standalone: true,
  selector: "u-avatar-group",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UAvatarGroup }],
  host: {
    "[class]": "cx('root')",
  },
  hostDirectives: [UBind],
})
export class UAvatarGroup extends UBaseComponent {
  protected override readonly componentName = "avatar-group";
  protected override readonly styleModule = avatarGroupStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
