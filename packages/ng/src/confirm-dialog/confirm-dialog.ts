import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { UBaseComponent, UConfirmationService, type UConfirmation } from "@ultimate/ng-core";
import { UButton } from "../button/button";
import { UDialog } from "../dialog/dialog";
import { confirmDialogStyleModule } from "./confirm-dialog-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ConfirmDialog` component (see
 * `.vendor-extracted/ng/confirmdialog/confirmdialog.ts`). Confirmed against
 * real source: `ConfirmDialog` is a service-driven overlay — it injects
 * `ConfirmationService` and subscribes to its `requireConfirmation$`
 * observable, rendering itself (via a composed `p-dialog`) whenever a
 * `Confirmation` matching its own `key` input arrives, and invoking the
 * confirmation's `accept`/`reject` callbacks from its own accept/reject
 * button handlers.
 *
 * This port keeps that same real mechanism, using this task's own
 * `UConfirmationService` (`@ultimate/ng-core` — new for Angular this task,
 * see that service's own doc comment) in place of real PrimeNG's
 * `ConfirmationService`, and composes the already-Built `UDialog` the same
 * way real upstream composes `p-dialog` (`role="alertdialog"`, header/
 * closable/modal/closeOnEscape all forwarded from the active
 * `UConfirmation`).
 *
 * Deliberately excludes upstream's much larger surface — draggable,
 * breakpoints-driven responsive `<style>`, headless/custom-icon/message
 * `TemplateRef` projection, and RTL — none of these appear in this
 * capability's spec-mandated surface (same "smaller surface than upstream"
 * precedent as every sibling component). A single always-mounted
 * `UConfirmDialog` per `key` is the expected usage, matching real
 * upstream's own single-instance-per-key convention.
 *
 * Real upstream renders its dialog with `role="alertdialog"` (a real,
 * accessibility-relevant deviation from a plain `role="dialog"`). `UDialog`
 * now exposes a `role` override input (GAP-049) defaulting to `"dialog"`,
 * and this composition passes `role="alertdialog"` on its `<u-dialog>`
 * element below — the gap previously disclosed here no longer exists.
 */
@Component({
  standalone: true,
  selector: "u-confirm-dialog",
  imports: [UDialog, UButton],
  template: `
    <u-dialog
      [visible]="visible()"
      [role]="'alertdialog'"
      [header]="confirmation()?.header"
      [closable]="true"
      [modal]="confirmation()?.modal ?? true"
      [closeOnEscape]="confirmation()?.closeOnEscape ?? true"
      [class]="cx('root')"
      (visibleChange)="onDialogVisibleChange($event)"
    >
      @if (confirmation()?.icon) {
        <i [class]="confirmation()?.icon + ' ' + cx('icon')"></i>
      }
      <span [class]="cx('message')">{{ confirmation()?.message }}</span>
      <div dialogFooter [class]="cx('footer')">
        @if (confirmation()?.rejectVisible !== false) {
          <u-button [label]="rejectLabel()" severity="secondary" text (onClick)="onReject()"></u-button>
        }
        @if (confirmation()?.acceptVisible !== false) {
          <u-button [label]="acceptLabel()" (onClick)="onAccept()"></u-button>
        }
      </div>
    </u-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UConfirmDialog extends UBaseComponent {
  protected override readonly componentName = "confirm-dialog";
  protected override readonly styleModule = confirmDialogStyleModule;

  /** Matches only `UConfirmation` requests carrying the same `key` (undefined matches undefined). */
  key = input<string>();

  private readonly confirmationService = inject(UConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly visible = signal(false);
  protected readonly confirmation = signal<UConfirmation | null>(null);
  protected readonly acceptLabel = computed(() => this.confirmation()?.acceptLabel ?? "Yes");
  protected readonly rejectLabel = computed(() => this.confirmation()?.rejectLabel ?? "No");

  constructor() {
    super();
    const subscription = this.confirmationService.requireConfirmation$.subscribe((confirmation) => {
      if (!confirmation) {
        this.visible.set(false);
        return;
      }
      if (confirmation.key === this.key()) {
        this.confirmation.set(confirmation);
        this.visible.set(true);
      }
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  protected onAccept(): void {
    this.confirmation()?.accept?.();
    this.hide();
  }

  protected onReject(): void {
    this.confirmation()?.reject?.();
    this.hide();
  }

  protected onDialogVisibleChange(value: boolean): void {
    if (!value) {
      this.hide();
    }
  }

  private hide(): void {
    this.visible.set(false);
    this.confirmation.set(null);
  }
}
