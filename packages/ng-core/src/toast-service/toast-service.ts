import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/** Minimum message shape — mirrors real PrimeNG's own `ToastMessageOptions` core fields (`severity`/`summary`/`detail`/`life`/`closable`/`sticky`/`key`), scoped to this capability's spec-mandated surface, not the full upstream surface (no `styleClass`/`contentStyleClass`/icon-template fields). */
export interface UToastMessageOptions {
  severity?: "success" | "info" | "warn" | "error" | "secondary" | "contrast";
  summary?: string;
  detail?: string;
  /** Milliseconds before auto-dismissal; ignored when `sticky` is true. Defaults to the consuming `UToast`'s own `life` input (3000ms) when unset. */
  life?: number;
  /** When true, the message never auto-dismisses. */
  sticky?: boolean;
  /** Whether the message shows a manual close button. Defaults to true. */
  closable?: boolean;
  /** Matches only the `UToast` instance carrying the same `key` (undefined matches undefined). */
  key?: string;
  [extra: string]: unknown;
}

/**
 * Ultimate-owned adaptation of PrimeNG's own `MessageService` (see
 * `.vendor-extracted/ng/api/messageservice.ts`) — genuinely new `ng-core`
 * work, disclosed per this task's brief: real PrimeNG's `Toast` component
 * injects this exact service (aliased `MessageService`, shared with the
 * separate `Messages` capability, out of this batch's scope) and
 * subscribes to `messageObserver`/`clearObserver`, matching the identical
 * "service call → Subject emit → subscribing component renders" shape
 * already established by `UConfirmationService`/`UDialogService`/
 * `UTerminalService` in this same `ng-core` package (same small,
 * source-justified extension precedent, RxJS `Subject`/`Observable`
 * already a real `ng-core` dependency).
 *
 * Named `UToastService` rather than a `UMessageService` shared with the
 * excluded `Messages` capability (spec §1/§8 — `Messages` is out of this
 * batch's scope) — this keeps the new service scoped exactly to `Toast`'s
 * own real need, not speculatively widened to cover an unbuilt sibling.
 */
@Injectable({ providedIn: "root" })
export class UToastService {
  private readonly messageSource = new Subject<UToastMessageOptions | UToastMessageOptions[]>();
  private readonly clearSource = new Subject<string | null>();

  /** Emits whenever `add()`/`addAll()` is called. */
  readonly messageObserver = this.messageSource.asObservable();
  /** Emits whenever `clear()` is called (the key to clear, or `null` for "clear everything"). */
  readonly clearObserver = this.clearSource.asObservable();

  /** Queues a single toast notification (request/registration) — safe to call repeatedly for a stacked set of notifications. */
  add(message: UToastMessageOptions): void {
    if (message) {
      this.messageSource.next(message);
    }
  }

  /** Queues multiple toast notifications at once. */
  addAll(messages: UToastMessageOptions[]): void {
    if (messages && messages.length) {
      this.messageSource.next(messages);
    }
  }

  /** Clears messages matching `key` (or every message, when `key` is omitted). */
  clear(key?: string): void {
    this.clearSource.next(key ?? null);
  }
}
