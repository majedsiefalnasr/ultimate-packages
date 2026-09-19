import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { UBaseComponent, UDialogService, type UDynamicDialogOpenRequest } from "@ultimate/ng-core";
import { UDialog } from "../dialog/dialog";
import { dynamicDialogStyleModule } from "./dynamic-dialog-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `DynamicDialog` component (see
 * `.vendor-extracted/ng/dynamicdialog/dynamicdialog.ts`). Confirmed against
 * real source: `DynamicDialog` is the always-mounted companion component
 * `DialogService.open()` creates via `createComponent` + `ApplicationRef.
 * attachView` — it composes `p-dialog` and loads the caller's given
 * component into an insertion point (`DynamicDialogContent`'s
 * `viewContainerRef`) via `ViewContainerRef.createComponent`.
 *
 * This port keeps the same real "one dialog shell wrapping a dynamically-
 * loaded component" mechanism, but is itself declared once in a consuming
 * application's template (`<u-dynamic-dialog></u-dynamic-dialog>`) rather
 * than created imperatively by the service — `UDialogService`
 * (`@ultimate/ng-core`, new for Angular this task) instead dispatches an
 * `open$` request this component subscribes to, rendering one `UDialog` +
 * `NgComponentOutlet` pair per currently-open request (supporting multiple
 * simultaneously-open dynamic dialogs, matching Vue's own `DynamicDialog.vue`
 * `instanceMap` precedent read this session) — avoiding the
 * `ApplicationRef.attachView`-into-`document.body` imperative-bootstrap
 * mechanism real upstream uses, which has no established precedent
 * elsewhere in this package (see `UDialogService`'s own doc comment for the
 * full rationale).
 *
 * Deliberately excludes upstream's much larger surface — draggable,
 * resizable, maximizable, breakpoints — matching `UDialog`'s own
 * already-established exclusion of the same features.
 */
@Component({
  standalone: true,
  selector: "u-dynamic-dialog",
  imports: [UDialog, NgComponentOutlet],
  template: `
    @for (instance of instances(); track instance.ref) {
      <u-dialog
        [visible]="true"
        [header]="instance.config.header"
        [modal]="instance.config.modal ?? true"
        [closeOnEscape]="instance.config.closeOnEscape ?? true"
        [class]="cx('root')"
        (visibleChange)="onDialogVisibleChange(instance)"
      >
        <ng-container
          *ngComponentOutlet="instance.component; inputs: instance.config.inputValues"
        ></ng-container>
      </u-dialog>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UDynamicDialog extends UBaseComponent {
  protected override readonly componentName = "dynamic-dialog";
  protected override readonly styleModule = dynamicDialogStyleModule;

  private readonly dialogService = inject(UDialogService);

  protected readonly instances = signal<UDynamicDialogOpenRequest[]>([]);

  constructor() {
    super();
    this.dialogService.open$.subscribe((request) => {
      this.instances.update((list) => [...list, request]);
      const subscription = request.ref.requestClose$.subscribe(() => {
        this.instances.update((list) => list.filter((item) => item !== request));
        subscription.unsubscribe();
      });
    });
  }

  protected onDialogVisibleChange(instance: UDynamicDialogOpenRequest): void {
    instance.ref.close();
  }
}
