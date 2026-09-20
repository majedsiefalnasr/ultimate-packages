import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
  input,
  numberAttribute,
  signal,
} from "@angular/core";
import { UBaseComponent, UToastService } from "@ultimate/ng-core";
import type { UToastMessageOptions } from "@ultimate/ng-core";
import { toastStyleModule } from "./toast-style";

interface ToastEntry extends UToastMessageOptions {
  /** Stable per-message identity for dismissal/tracking, independent of message-content equality. */
  id: number;
}

let nextId = 0;

/**
 * Ultimate-owned adaptation of PrimeNG's `Toast` component (see
 * `.vendor-extracted/ng/toast/toast.ts`). Confirmed against real source:
 * extends the bare `BaseComponent` tier (no CVA) — a service-driven,
 * transient-notification-stack overlay (spec §3.0's own description),
 * injecting `MessageService` (this port's own `UToastService`,
 * `@ultimate/ng-core` — new for Angular this task, see that service's own
 * doc comment) and subscribing to `messageObserver`/`clearObserver`,
 * filtering on `key`, exactly matching real source's own mechanism.
 *
 * Each queued message gets its own auto-dismiss timer (`life`, default
 * 3000ms, `sticky` disables it) — real source delegates this per-message
 * timer to a nested `ToastItem` sub-component; this port folds that
 * responsibility into `UToast` itself (message-level `setTimeout`, keyed
 * by the message's own stable `id`) rather than introducing a second
 * component, since `ToastItem`'s only other real responsibility (its own
 * enter/leave `@primeuix/motion` transition) is deliberately excluded here
 * — same "smaller surface than upstream" precedent as every sibling
 * component (no enter/leave animation, matching `UMessage`'s own plain
 * signal-gated `@if` precedent).
 *
 * Deliberately excludes real source's `preventDuplicates`/
 * `preventOpenDuplicates` content-equality suppression, `breakpoints`
 * responsive `<style>` injection, and custom message/headless
 * `TemplateRef` overrides — same "smaller surface than upstream"
 * precedent.
 */
@Component({
  standalone: true,
  selector: "u-toast",
  template: `
    @for (message of messages(); track message.id) {
      <div [class]="cx('message', { severity: message.severity })" role="alert" aria-live="assertive" aria-atomic="true">
        <div [class]="cx('messageContent')">
          @if (message.summary) {
            <div [class]="cx('summary')">{{ message.summary }}</div>
          }
          @if (message.detail) {
            <div [class]="cx('detail')">{{ message.detail }}</div>
          }
        </div>
        @if (message.closable !== false) {
          <button
            type="button"
            [class]="cx('closeButton')"
            aria-label="Close"
            (click)="remove(message.id)"
          >
            &times;
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { position: position() })",
  },
})
export class UToast extends UBaseComponent {
  protected override readonly componentName = "toast";
  protected override readonly styleModule = toastStyleModule;

  /** Key of the message in case the message is targeted to a specific `UToast` instance. */
  key = input<string>();
  /** Position of the toast in the viewport. */
  position = input<
    "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center" | "center"
  >("top-right");
  /** The default time to display messages for, in milliseconds. */
  life = input(3000, { transform: numberAttribute });

  protected readonly messages = signal<ToastEntry[]>([]);

  private readonly toastService = inject(UToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    super();
    const messageSub = this.toastService.messageObserver.subscribe((incoming) => {
      const list = Array.isArray(incoming) ? incoming : [incoming];
      const accepted = list.filter((m) => m.key === this.key());
      accepted.forEach((m) => this.push(m));
    });
    const clearSub = this.toastService.clearObserver.subscribe((key) => {
      if (key === null || key === this.key()) {
        this.clearAll();
      }
    });
    this.destroyRef.onDestroy(() => {
      messageSub.unsubscribe();
      clearSub.unsubscribe();
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers.clear();
    });
  }

  private push(message: UToastMessageOptions): void {
    const id = nextId++;
    const entry: ToastEntry = { ...message, id };
    this.messages.update((list) => [...list, entry]);

    if (!entry.sticky) {
      const timer = setTimeout(() => this.remove(id), entry.life ?? this.life());
      this.timers.set(id, timer);
    }
  }

  protected remove(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private clearAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.messages.set([]);
  }
}
