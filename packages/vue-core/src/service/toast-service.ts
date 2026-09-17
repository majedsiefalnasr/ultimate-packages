import { EventBus } from "@ultimate/uix-utils/eventbus";
import type { App, InjectionKey, Plugin } from "vue";

/**
 * Ultimate-owned Vue infrastructure — genuinely new work, no Angular/React
 * equivalent (Plan §1.2, Spec §3.0/§7). Informed by real PrimeVue's
 * `ToastService` (extracted via
 * `extract-primevue-source.mjs <tarball> primevue toastservice`,
 * `/tmp/pv-extract/toastservice/ToastService.js`) — Ultimate's shape is
 * fixed by the Plan, not copied verbatim (Option B); real PrimeVue's
 * `app.config.globalProperties.$toast` convenience is not carried here, for
 * the same reason stated in `confirmation-service.ts`.
 *
 * Toast is explicitly a "transient notification stack," not a single-
 * instance overlay (Spec §3.0) — confirmed against real PrimeVue's own
 * `Toast.vue`, which renders `messages` as an array populated by repeated
 * `add` events, one push per call, never replacing prior entries. `add()`
 * therefore supports being called multiple times to produce a queued/
 * stacked set of notifications by construction: each call emits its own
 * independent `add` event: the listening Toast component (this task's own
 * future consumer, not this task's job) is responsible for accumulating
 * them into a list, exactly as it already does for real PrimeVue.
 *
 * Naming note (non-blocking deviation, reported per this task's instructions
 * rather than silently applied): real PrimeVue's `ToastService` exposes
 * `removeGroup(group)` and `removeAllGroups()`, not a single `removeAll()`
 * (`/tmp/pv-extract/toastservice/ToastService.d.ts`). The Plan's §1.2 API
 * surface explicitly binds this service to `add`/`remove`/`removeAll` — that
 * binding is followed exactly as written (a "clear everything" method,
 * simplified from upstream's two-method group-scoped pair into one), not
 * reinterpreted or extended with `removeGroup`/`removeAllGroups`, since the
 * Plan's API list is this task's binding spec, not a suggestion.
 *
 * Dispatch mechanism: `@ultimate/uix-utils`'s existing `eventbus` module,
 * matching real PrimeVue's own `ToastEventBus`
 * (`/tmp/pv-extract/toasteventbus/ToastEventBus.js`, same `EventBus()`
 * shape as `ConfirmationEventBus`/`DynamicDialogEventBus`).
 *
 * `add()`/`remove()`/`removeAll()` only emit; Toast's own future Batch 1
 * task subscribes to `toastEventBus` and renders (not this task's job).
 */
export const toastEventBus = EventBus();

/** Minimum message shape — Toast's own future task extends this with real PrimeVue's full `ToastMessageOptions` surface (severity/summary/detail/closable/life/group, verified against `/tmp/pv-extract/toast/Toast.d.ts`), not invented here. */
export interface ToastMessageOptions {
  [key: string]: unknown;
}

/** `UToastService`'s public API — Plan §1.2, binding. */
export interface ToastServiceApi {
  /** Queues a toast notification (request/registration) — safe to call repeatedly for a stacked set of notifications. */
  add(message: ToastMessageOptions): void;
  /** Removes a single queued/displayed message. */
  remove(message: ToastMessageOptions): void;
  /** Removes every queued/displayed message. */
  removeAll(): void;
}

export const UToastServiceKey: InjectionKey<ToastServiceApi> = Symbol("UToastService");

function createToastServiceApi(): ToastServiceApi {
  return {
    add(message: ToastMessageOptions) {
      toastEventBus.emit("add", message);
    },
    remove(message: ToastMessageOptions) {
      toastEventBus.emit("remove", message);
    },
    removeAll() {
      toastEventBus.emit("remove-all");
    },
  };
}

/**
 * `UToastService` — installed as a Vue plugin: `app.use(UToastService)`.
 * Matches Vue's own idiomatic plugin-object shape, per Plan §1.2.
 */
export const UToastService: Plugin = {
  install(app: App) {
    app.provide(UToastServiceKey, createToastServiceApi());
  },
};
