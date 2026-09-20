import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import type { UConfirmation } from "./confirmation";

/**
 * Ultimate-owned adaptation of PrimeNG's own `ConfirmationService` (see
 * `.vendor-extracted/ng/api/confirmationservice.ts`) — genuinely new
 * `ng-core` work, disclosed per this task's brief: real PrimeNG's
 * `ConfirmDialog`/`ConfirmPopup` are both driven by injecting this exact
 * service and subscribing to its `requireConfirmation$` observable
 * (confirmed by reading both real sources this session); Angular's `ng-core`
 * had no equivalent before this task (unlike Vue, which already has
 * `UConfirmationService` built as part of the Batch 1 infrastructure
 * prefix, §3.0). This is the same small, source-justified `ng-core`
 * extension precedent already set by `ng-core/src/api/types.ts`
 * (`UMenuItem`/`UTooltipOptions`) for an earlier sub-batch — a minimal
 * service shape mirroring real upstream's own `confirm()`/`close()` API,
 * not a new architectural pattern (RxJS `Subject`/`Observable` is already a
 * real `ng-core` dependency, used by `UInputText`/`UTextarea` for
 * debouncing).
 *
 * `UConfirmDialog`/`UConfirmPopup` both inject this service and subscribe
 * to `requireConfirmation$`, filtering on `confirmation.key` — the same
 * "service call → Subject emit → subscribing component renders" shape real
 * PrimeNG's own `ConfirmationService` establishes, adapted to this
 * package's own `UConfirmation` type (Option B: reference, not verbatim).
 */
@Injectable({ providedIn: "root" })
export class UConfirmationService {
  private readonly requireConfirmationSource = new Subject<UConfirmation | null>();

  /** Emits a `UConfirmation` request when `confirm()` is called, or `null` when `close()` is called. */
  readonly requireConfirmation$ = this.requireConfirmationSource.asObservable();

  /** Requests a confirmation dialog/popup be shown with the given options. */
  confirm(confirmation: UConfirmation): this {
    this.requireConfirmationSource.next(confirmation);
    return this;
  }

  /** Requests the confirmation dialog/popup be closed without invoking accept/reject. */
  close(): this {
    this.requireConfirmationSource.next(null);
    return this;
  }
}
