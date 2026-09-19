import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { avatarGroupStyleModule } from "./avatar-group-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `AvatarGroup` component (see
 * `.vendor-extracted/ng/avatargroup/avatargroup.ts`). A helper component
 * for `UAvatar` — a trivial content-projection wrapper with no props of
 * its own beyond `UBaseComponent`'s base surface; real source's own
 * `AvatarGroup` class carries only `styleClass`/`style` (both excluded
 * here, same "smaller surface than upstream" precedent as every sibling
 * component) and projects its content unchanged. The overlapping-avatars
 * visual is CSS-only (see `avatar-group-style.ts`).
 *
 * Depends on `UAvatar` (§5 of the migration spec: "Angular carries a soft,
 * same-batch dependency on Avatar") only in the sense that it is designed
 * to contain `UAvatar` instances — no direct import/composition exists
 * here, matching real source's own independence (`AvatarGroup` never
 * imports `Avatar`).
 */
@Component({
  standalone: true,
  selector: "u-avatar-group",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
})
export class UAvatarGroup extends UBaseComponent {
  protected override readonly componentName = "avatar-group";
  protected override readonly styleModule = avatarGroupStyleModule;
}
