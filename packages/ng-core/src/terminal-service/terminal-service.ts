import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/**
 * Ultimate-owned adaptation of PrimeNG's own `TerminalService` (see
 * `.vendor-extracted/ng/terminal/terminalservice.ts`) — genuinely new
 * `ng-core` work, disclosed per this task's brief: real PrimeNG's
 * `Terminal` component injects this exact service, emitting a `command`
 * whenever Enter is pressed and subscribing to `responseHandler` to render
 * each command's eventual response (a pluggable command-handler contract —
 * the actual command interpretation happens entirely outside this service,
 * in whatever code the consuming application wires up via
 * `sendCommand$`/`sendResponse()`).
 *
 * Angular's `ng-core` had no equivalent before this task (React/Vue's real
 * upstream `TerminalService` is a plain module-level `EventBus()` instance
 * — verified via `extract-primereact-source.mjs`/`extract-primevue-source.mjs`
 * against `terminalservice/TerminalService.js` in both tarballs — so
 * neither framework needs a dedicated service file: React gets a small
 * local `EventBus()` instance in `packages/react/src/terminal/` (Terminal
 * is TerminalService's sole consumer, unlike Toast/Confirmation's
 * multi-consumer shared services), and Vue's `Terminal.vue` calls
 * `@ultimate/uix-utils/eventbus`'s `EventBus()` directly the same way).
 * Angular has no `eventbus` idiom of its own — RxJS `Subject`/`Observable`
 * (already a real `ng-core` dependency, used by `UInputText`/`UTextarea`
 * for debouncing, and by `UConfirmationService`/`UDialogService` for the
 * exact same "service call → Subject emit → subscribing component renders"
 * shape) is Angular's own idiomatic equivalent — same small,
 * source-justified `ng-core` extension precedent as
 * `UConfirmationService`.
 */
@Injectable({ providedIn: "root" })
export class UTerminalService {
  private readonly commandSource = new Subject<string>();
  private readonly responseSource = new Subject<string>();

  /** Emits whenever `sendCommand()` is called (from `UTerminal`'s own Enter-key handler). */
  readonly commandHandler = this.commandSource.asObservable();
  /** Emits whenever `sendResponse()` is called (by consuming application code, driving `UTerminal`'s response rendering). */
  readonly responseHandler = this.responseSource.asObservable();

  /** Publishes a submitted command. */
  sendCommand(command: string): void {
    if (command) {
      this.commandSource.next(command);
    }
  }

  /** Publishes a response to the most recently submitted command. */
  sendResponse(response: string): void {
    if (response) {
      this.responseSource.next(response);
    }
  }
}
