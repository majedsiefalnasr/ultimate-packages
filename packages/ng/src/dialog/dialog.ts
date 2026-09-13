import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  ComponentIdGenerator,
  UBaseComponent,
  UFocusTrap,
  UOverlay,
  UTimesIcon,
} from "@ultimate/ng-core";
import { createMotion, type MotionInstance } from "@ultimate/uix-motion";
import { ESCAPE_PRIORITIES, displayOrderRegistry, escapeRegistry } from "@ultimate/uix-utils/escape";
import { UButton } from "../button/button";
import { dialogStyleModule } from "./dialog-style";

// Module-scoped display-order registry key, matching
// packages/vue-core/src/escape/create-display-order-mixin.ts's own
// established pattern exactly: this uid participates only in in-memory
// stacking-order comparisons inside displayOrderRegistry, is never rendered
// into DOM/markup, and therefore does not carry the SSR-hydration-mismatch
// risk the Track E ID-nondeterminism finding (2026-09-12) required fixing
// for aria-labelledby/aria-activedescendant-feeding ids specifically (see
// this class's own ariaLabelledBy field, which correctly uses the
// DI-scoped ComponentIdGenerator instead, for exactly that reason).
let dialogDisplayOrderUid = 0;

/**
 * Ultimate-owned adaptation of PrimeNG's `Dialog` component (see
 * `.vendor-extracted/ng/dialog/dialog.ts`). Renders content in a modal
 * (or non-modal) overlay window.
 *
 * BREAKING CHANGE — requires `ComponentIdGenerator`: this component injects
 * `ComponentIdGenerator` (from `@ultimate/ng-core`) to generate its
 * `aria-labelledby` id in an SSR-deterministic way. The consuming
 * application MUST provide `ComponentIdGenerator` at bootstrap (e.g. in
 * `bootstrapApplication(AppComponent, { providers: [...] })`'s providers
 * array, or an equivalent root-level `providers` array) — `UDialog` has no
 * default provider for it. An application that renders `UDialog` without
 * providing `ComponentIdGenerator` will throw `NullInjectorError` at
 * construction time.
 *
 * Deliberately excludes upstream's much larger prop/behavior surface —
 * `draggable`/`resizable`/drag-and-resize listener wiring, `breakpoints`/
 * dynamic `<style>` injection, `dismissableMask`, `position` (`top`/
 * `bottom`/`left`/`right`/corner variants), `maskStyle`/`maskStyleClass`/
 * `contentStyle`/`contentStyleClass`/`styleClass`, `blockScroll`/body-scroll
 * blocking, `keepInViewport`, content/footer/icon `TemplateRef` projection
 * slots, `rtl`, `maximizable`, and the `p-dialog[id]` breakpoint `<style>`
 * element — none of these appear in this task's Interfaces section, which
 * defines a smaller, spec-mandated signal-input surface: `visible`,
 * `header`, `closable`, `closeOnEscape`, `modal`. A future task can extend
 * this component's input surface for drag/resize/position/maximize support.
 *
 * DISCREPANCY (brief vs. working code): Step 5 instructs importing
 * `UTimesIcon`/`UWindowMaximizeIcon`/`UWindowMinimizeIcon` into `imports`.
 * Only `UTimesIcon` is imported here — `UWindowMaximizeIcon`/
 * `UWindowMinimizeIcon` are deliberately excluded because no `maximizable`
 * input exists in this task's Interfaces section to gate a maximize button
 * on, so neither icon can appear in the template. As with `UButton`'s own
 * documented Task 12 precedent, an Angular standalone component with an
 * `imports` entry no element in its template references fails compilation
 * with `NG8113` — confirmed here directly (build failed on this exact
 * error before removing the two unused imports). A future task adding
 * `maximizable`/`maximized` support can add these imports back.
 *
 * Overlay/focus-trap wiring: per the Phase 2 Overlay Architecture
 * responsibility split, `UOverlay` (Task 6) only moves the host element to
 * `document.body` and assigns/clears a z-index — it does not orchestrate
 * enter/leave motion. `UFocusTrap` (Task 6) only traps `Tab`/`Shift+Tab`
 * within the host's focusable descendants. `UDialog`, as the only overlay
 * component built in this phase, wires `UOverlay` + `UFocusTrap` +
 * `@ultimate/uix-motion`'s `createMotion` together directly in its own
 * class/template — this is the spec's explicit YAGNI call (no shared
 * "overlay orchestration service" abstraction, since there is exactly one
 * consumer this phase).
 *
 * `@ultimate/uix-motion`'s real, verified export is `createMotion(element,
 * options): MotionInstance` (`packages/uix-motion/src/config/index.ts`,
 * confirmed against its own `create-motion.test.ts`/`exports.test.ts`) —
 * not the `MotionModule`/`pMotion` structural directive PrimeNG's own
 * Angular-specific `@primeuix/motion` package exposes (used in the
 * extracted `dialog.ts` template as `[pMotion]="visible"`
 * `[pMotionName]="'p-dialog'"` etc.). `@ultimate/uix-motion` has no such
 * Angular directive, so enter/leave is driven imperatively here: an
 * `effect()` watching `visible()` calls `createMotion(rootEl, {name:
 * 'u-dialog', appear: true}).enter()`/`.leave()` on the dialog root element,
 * matching the CSS class names (`u-dialog-enter-active`/`u-dialog-leave-active`)
 * `@ultimate/uix-styles/dialog`'s `style` string already defines.
 *
 * Escape handling: upstream's `bindDocumentEscapeListener`
 * (`.vendor-extracted/ng/dialog/dialog.ts` lines 1051-1066) listens for
 * `keydown` on the document and additionally guards on the closing
 * dialog's z-index matching the *current* top-of-stack z-index (a
 * nested-dialogs-close-only-the-topmost-one safety check via
 * `ZIndexUtils.getCurrent()`). `@ultimate/uix-utils`'s own `ZIndex`
 * singleton does expose an equivalent `getCurrent(key)` — but `UOverlay`
 * hardcodes its registry key to `"overlay"` for every instance (a Minor
 * note carried from Task 6's review), so `getCurrent("overlay")` would
 * return the same top-of-stack value regardless of which open `UDialog`'s
 * Escape handler asked, making it useless as a per-instance guard without
 * `UOverlay` first assigning a genuinely distinct key/handle per instance —
 * a real architectural change to `UOverlay`'s registration API, out of
 * this fix's scope. A plain document-level `keydown.escape` host listener
 * (unconditional on stacking order, guarded only by `closeOnEscape()` and
 * `visible()`) is used instead, matching this task's brief/spec (Step 5,
 * Step 2's test). Known, accepted consequence: with two or more `UDialog`s
 * open simultaneously (not nested — independent siblings), a single Escape
 * press closes all of them, since each instance's listener guards only on
 * its own `visible()`/`closeOnEscape()`, not on stacking position. Fixing
 * this requires `UOverlay` to expose real per-instance stacking identity
 * first; deferred to whichever future phase needs multi-dialog support.
 *
 * Focus-return-on-close: PrimeNG's own extracted source has no logic
 * capturing/restoring `document.activeElement` around the visibility
 * transition — confirmed by reading `dialog.ts` in full (its `focus()`
 * method only moves focus *into* the dialog on show via
 * `focusOnShow`/`_focus()`; nothing moves it back out on hide). This
 * task's own spec test (`returns focus to the triggering element when
 * closed`) operationalizes that gap: `document.activeElement` is captured
 * in the same `effect()` when `visible()` transitions to `true`, and
 * restored via `.focus()` when it transitions to `false` — implemented
 * explicitly here to close the accessibility gap the Phase 2 spec flagged
 * as unverified in PrimeNG's own source.
 */
@Component({
  standalone: true,
  selector: "u-dialog",
  imports: [UOverlay, UFocusTrap, UButton, UTimesIcon],
  template: `
    @if (renderMask()) {
      <div uOverlay [visible]="visible()" appendTo="body" [class]="cx('mask', classesParams())">
        <div
          #root
          [class]="cx('root')"
          role="dialog"
          [attr.aria-modal]="modal()"
          [attr.aria-labelledby]="header() ? ariaLabelledBy : null"
        >
          <div uFocusTrap [uFocusTrapDisabled]="!modal()">
            @if (header()) {
              <div [class]="cx('header')">
                <span [id]="ariaLabelledBy" [class]="cx('title')">{{ header() }}</span>
                <div [class]="cx('headerActions')">
                  @if (closable()) {
                    <u-button
                      [class]="cx('pcCloseButton')"
                      text
                      rounded
                      severity="secondary"
                      (onClick)="close()"
                    >
                      <u-times-icon />
                    </u-button>
                  }
                </div>
              </div>
            }
            <div [class]="cx('content')">
              <ng-content></ng-content>
            </div>
            <div [class]="cx('footer')">
              <ng-content select="[dialogFooter]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UDialog extends UBaseComponent {
  protected override readonly componentName = "dialog";
  protected override readonly styleModule = dialogStyleModule;

  /** Specifies the visibility of the dialog. */
  visible = input(false);
  /** Title text of the dialog. */
  header = input<string>();
  /** Adds a close icon to the header to hide the dialog. */
  closable = input(true, { transform: booleanAttribute });
  /** Specifies if pressing escape key should hide the dialog. */
  closeOnEscape = input(true, { transform: booleanAttribute });
  /** Defines if background should be blocked when dialog is displayed. */
  modal = input(true, { transform: booleanAttribute });

  /** Notifies changes in the visibility state of the component. */
  visibleChange = output<boolean>();
  /** Callback to invoke when dialog is shown. */
  onShow = output<void>();
  /** Callback to invoke when dialog is hidden. */
  onHide = output<void>();

  @ViewChild("root") private rootRef?: ElementRef<HTMLElement>;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly idGenerator = inject(ComponentIdGenerator);
  private readonly displayOrderUid = ++dialogDisplayOrderUid;
  private registeredDisplayOrder: number | undefined;
  private destroyed = false;

  /**
   * Consumers must provide `ComponentIdGenerator` (from `@ultimate/ng-core`)
   * in their application's bootstrap providers for this component to
   * function — it has no default provider.
   */
  protected readonly ariaLabelledBy = `${this.idGenerator.next("u_dialog")}_header`;

  /**
   * Gates the mask/dialog DOM's presence in the template. Unlike a direct
   * mirror of `visible()`, this stays `true` through the leave animation:
   * flipping it to `false` immediately on `visible() → false` would tear
   * the element out of the DOM in the same tick `runLeaveMotion()` starts
   * the transition, giving `.leave()` no element left to animate (found
   * during review — `@ultimate/uix-motion`'s `.leave()` is a real `async`
   * transition, confirmed in `packages/uix-motion/src/config/index.ts`, not
   * instantaneous). Set `true` synchronously on open; set `false` only
   * after `runLeaveMotion()`'s promise resolves on close, matching
   * upstream's own `maskVisible`/`onMaskAfterLeave` tri-state intent without
   * porting its exact mechanism.
   */
  protected readonly renderMask = signal(false);

  /** The element focus should return to once the dialog closes. */
  private triggerElement: HTMLElement | null = null;
  private motion: MotionInstance | null = null;
  private wasVisible = false;

  constructor() {
    super();
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
    effect(() => {
      const visible = this.visible();
      if (!isPlatformBrowser(this.platformId)) {
        this.wasVisible = visible;
        this.renderMask.set(visible);
        return;
      }

      this.syncEscapeRegistration(visible);

      if (visible && !this.wasVisible) {
        this.triggerElement = (this.document.activeElement as HTMLElement) ?? null;
        this.renderMask.set(true);
        // #root only exists in the DOM once Angular has processed this
        // renderMask flip, so runEnterMotion (which reads @ViewChild("root"))
        // must wait for the next render, not run synchronously in this same
        // effect tick — found during review: without this, this.rootRef is
        // undefined here, this.motion never gets set, and runLeaveMotion's
        // "no motion instance" fallback always fires on close, undermining
        // both enter and leave animation, not just leave.
        afterNextRender(
          () => {
            this.runEnterMotion();
          },
          { injector: this.injector }
        );
      } else if (!visible && this.wasVisible) {
        this.runLeaveMotion();
        this.restoreFocus();
        this.onHide.emit();
      }

      this.wasVisible = visible;
    });
  }

  /**
   * Registers/unregisters this instance with the shared
   * `@ultimate/uix-utils/escape` registries as `visible` toggles, replacing
   * the previous unconditional `(document:keydown.escape)` host listener
   * (GAP-007 fix, Blueprint Completion 2026-09-13). Mirrors
   * `packages/react/src/dialog/dialog.tsx`'s own
   * `useDisplayOrder`/`useGlobalEscapeKey` composition: only the
   * numerically highest-priority (most-recently-displayed) registered
   * dialog's callback fires on a real Escape keydown, so two simultaneously
   * open dialogs no longer both close on one keypress.
   */
  private syncEscapeRegistration(visible: boolean): void {
    if (visible && this.registeredDisplayOrder === undefined) {
      this.registeredDisplayOrder = displayOrderRegistry.register(
        "dialog",
        this.displayOrderUid
      );
      escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder, () => {
        if (!this.closeOnEscape()) {
          return;
        }
        this.emitClose();
      });
    } else if (!visible && this.registeredDisplayOrder !== undefined) {
      escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder);
      displayOrderRegistry.unregister("dialog", this.displayOrderUid);
      this.registeredDisplayOrder = undefined;
    }
  }

  /**
   * Force-unregisters this instance from both shared registries if it is
   * destroyed while still visible and still registered (e.g. an
   * `@if`/`*ngIf`-gated dialog torn down directly, or a router navigation
   * destroying the component tree mid-dialog, without `visible` ever
   * transitioning to `false` first). Without this, `syncEscapeRegistration`'s
   * own unregister branch — which only runs from the `visible()` `effect()`
   * — would never fire, permanently leaking this instance's
   * `escapeRegistry`/`displayOrderRegistry` entries and silently swallowing
   * every future Escape keypress meant for any dialog opened afterward.
   */
  ngOnDestroy(): void {
    if (this.registeredDisplayOrder !== undefined) {
      escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder);
      displayOrderRegistry.unregister("dialog", this.displayOrderUid);
      this.registeredDisplayOrder = undefined;
    }
  }

  protected close(): void {
    this.emitClose();
  }

  protected classesParams() {
    return { modal: this.modal() };
  }

  private emitClose(): void {
    this.visibleChange.emit(false);
  }

  private runEnterMotion(): void {
    const el = this.rootRef?.nativeElement;
    if (!el) {
      this.onShow.emit();
      return;
    }
    this.motion = createMotion(el, { name: "u-dialog", appear: true });
    void this.motion.enter().then(() => {
      if (this.destroyed) {
        return;
      }
      this.onShow.emit();
    });
  }

  private runLeaveMotion(): void {
    const el = this.rootRef?.nativeElement;
    if (!el || !this.motion) {
      this.renderMask.set(false);
      return;
    }
    void this.motion.leave().then(() => {
      if (this.destroyed) {
        return;
      }
      this.renderMask.set(false);
    });
  }

  private restoreFocus(): void {
    this.triggerElement?.focus();
    this.triggerElement = null;
  }
}
