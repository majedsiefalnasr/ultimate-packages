import { Subject } from "rxjs";
import type { Observable } from "rxjs";

/**
 * Handle returned by `UDialogService.open()` for lifecycle control on the
 * specific dialog instance opened. Scoped subset of real PrimeNG's own
 * `DynamicDialogRef` (`.vendor-extracted/ng/dynamicdialog/dynamicdialog-ref.ts`)
 * — `close()`/`onClose` only; drag/resize/maximize-related methods and
 * events are dropped (no corresponding `UDynamicDialog` surface, matching
 * `UDialog`'s own already-established exclusion of drag/resize/maximize).
 *
 * `close()` emits on both `onClose` (for the opener to observe the result)
 * and the internal `requestClose$` subject (for `UDynamicDialog`,
 * `packages/ng/src/dynamic-dialog/`, to know to unmount this instance) —
 * mirroring real upstream's own `DynamicDialogRef.close()`, which similarly
 * drives both the public `onClose` observable and (via `DialogService`'s
 * own subscription to it) the component's actual removal from the DOM.
 */
export class UDynamicDialogRef<T = unknown> {
  private readonly onCloseSource = new Subject<T | undefined>();
  private readonly requestCloseSource = new Subject<void>();

  /** Emits the result passed to `close()` when this dialog instance closes. */
  readonly onClose: Observable<T | undefined> = this.onCloseSource.asObservable();
  /** Internal — `UDynamicDialog` subscribes to know when to unmount this instance. */
  readonly requestClose$: Observable<void> = this.requestCloseSource.asObservable();

  /** Closes this dialog instance, optionally passing a result to `onClose` subscribers. */
  close(result?: T): void {
    this.onCloseSource.next(result);
    this.onCloseSource.complete();
    this.requestCloseSource.next();
    this.requestCloseSource.complete();
  }
}
