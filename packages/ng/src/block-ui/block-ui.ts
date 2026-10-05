import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  input,
  numberAttribute,
  output,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { blockUiStyleModule } from "./block-ui-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `BlockUI` component (see
 * `.vendor-extracted/ng/blockui/blockui.ts`). Confirmed against real
 * source: `blocked` is a plain visibility-toggle boolean (via a getter/
 * setter that calls `block()`/`unblock()`), not a form control — no
 * `ControlValueAccessor`/CVA participation of any kind in any of the 3 real
 * sources (real Angular's own `blocked` setter directly mutates DOM/appends
 * the mask element; it is architecturally a mask-overlay toggle, the same
 * shape as `UDrawer`'s `visible`, not an editable-holder input). Renders a
 * mask over its own projected content (`target` unset) — real source's
 * `target`-driven "block another element" mode is excluded here, same
 * "smaller surface than upstream" precedent as every sibling component;
 * this port always blocks its own content, matching real source's own
 * default/most common usage.
 *
 * When `fullScreen` is set, blocks the whole viewport (fixed position,
 * registers a body-scroll lock via the shared `scrollLockRegistry`, same
 * mechanism `UDialog`/`UDrawer` already use in Vue — reused here directly
 * from `@ultimate/uix-utils/scroll-lock`, matching `UContextMenu`'s own
 * precedent of importing `uix-utils` primitives directly rather than
 * through a framework-specific wrapper that doesn't exist for this need in
 * `ng-core`). Otherwise the mask is absolutely positioned over the host.
 */
@Component({
  standalone: true,
  selector: "u-block-ui",
  template: `
    <ng-content></ng-content>
    @if (blocked()) {
      <div #mask [class]="cx('mask', { fullScreen: fullScreen() })"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[attr.aria-busy]": "blocked()",
  },
})
export class UBlockUI extends UBaseComponent {
  protected override readonly componentName = "blockui";
  protected override readonly styleModule = blockUiStyleModule;

  /** Current blocked state as a boolean. */
  blocked = input(false, { transform: booleanAttribute });
  /** Whether to automatically manage layering. */
  autoZIndex = input(true, { transform: booleanAttribute });
  /** Base zIndex value to use in layering. */
  baseZIndex = input(0, { transform: numberAttribute });
  /** Whether the mask covers the full viewport rather than just this component's own content. */
  fullScreen = input(false, { transform: booleanAttribute });

  /** Callback to invoke when UI gets blocked. */
  onBlocked = output<void>();
  /** Callback to invoke when UI gets unblocked. */
  onUnblocked = output<void>();

  @ViewChild("mask") private maskRef?: ElementRef<HTMLElement>;

  private readonly lockId = `u-block-ui-${Math.random().toString(36).slice(2)}`;
  private wasBlocked = false;

  constructor() {
    super();
    // A signal `effect()` (not `ngAfterViewChecked`) reacts to `blocked()`
    // changes: an `ngAfterViewChecked` hook that calls `output().emit()`
    // synchronously re-enters the same change-detection pass that is
    // still being checked, tripping Angular's `NG0100`
    // `ExpressionChangedAfterItHasBeenCheckedError` dev-mode guard.
    // `effect()` schedules its side effects in a microtask outside the
    // current CD pass, avoiding that class of problem entirely — the
    // idiomatic Angular-signals mechanism for reacting to input-signal
    // changes with imperative side effects (DOM/registry mutations,
    // event emission), matching this component's own signal-based
    // architecture.
    effect(() => {
      const isBlocked = this.blocked();
      if (isBlocked === this.wasBlocked) {
        return;
      }
      this.wasBlocked = isBlocked;

      if (isBlocked) {
        if (this.fullScreen()) {
          scrollLockRegistry.register(this.lockId);
        }
        if (this.autoZIndex() && this.maskRef) {
          ZIndex.set("modal", this.maskRef.nativeElement, this.baseZIndex());
        }
        this.onBlocked.emit();
      } else {
        if (this.fullScreen()) {
          scrollLockRegistry.unregister(this.lockId);
        }
        this.onUnblocked.emit();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wasBlocked && this.fullScreen()) {
      scrollLockRegistry.unregister(this.lockId);
    }
  }
}
