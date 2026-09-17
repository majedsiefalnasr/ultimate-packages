import { EventBus } from "@ultimate/uix-utils/eventbus";
import type { App, InjectionKey, Plugin } from "vue";

/**
 * Ultimate-owned Vue infrastructure — genuinely new work, no Angular/React
 * equivalent (Plan §1.2, Spec §3.0/§7). Informed by real PrimeVue's
 * `ConfirmationService` (extracted via
 * `extract-primevue-source.mjs <tarball> primevue confirmationservice`,
 * `/tmp/pv-extract/confirmationservice/ConfirmationService.js`) — Ultimate's
 * shape is fixed by the Plan, not copied verbatim (Option B): real PrimeVue
 * additionally sets `app.config.globalProperties.$confirm`, a global-Options-
 * API-property convenience this project's scoped-down architecture does not
 * carry (no other Ultimate service/base tier assigns `globalProperties`
 * either); only the `app.provide(...)` half is reused here.
 *
 * Dispatch mechanism: `@ultimate/uix-utils`'s existing `eventbus` module
 * (`EventBus()`), matching real PrimeVue's own `ConfirmationEventBus`
 * (`import { EventBus } from '@primeuix/utils/eventbus'; export default
 * EventBus();` — `/tmp/pv-extract/confirmationeventbus/ConfirmationEventBus.js`),
 * which Ultimate's `uix-utils` eventbus module already matches in shape
 * (`on`/`off`/`emit`/`clear`). Matches the same "module-level singleton
 * `EventBus()` instance" pattern already established by
 * `packages/uix-styled/src/service/index.ts`'s `ThemeService`.
 *
 * `require()`/`close()` only emit; there is no listener yet (ConfirmDialog's
 * own future Batch 1 task subscribes to `confirmationEventBus` and renders —
 * not this task's job, per this task's brief).
 */
export const confirmationEventBus = EventBus();

/** Minimum request-options shape `require()` needs to dispatch — ConfirmDialog's own future task extends this with real PrimeVue's full `ConfirmationOptions` surface (accept/reject callbacks, header, message, etc., verified against `/tmp/pv-extract/confirmationoptions`), not invented here. */
export interface ConfirmationOptions {
  [key: string]: unknown;
}

/** `UConfirmationService`'s public API — Plan §1.2, binding. */
export interface ConfirmationServiceApi {
  /** Displays the confirmation dialog using the given options (request/registration). */
  require(options: ConfirmationOptions): void;
  /** Hides the dialog without invoking accept/reject callbacks. */
  close(): void;
}

export const UConfirmationServiceKey: InjectionKey<ConfirmationServiceApi> = Symbol("UConfirmationService");

function createConfirmationServiceApi(): ConfirmationServiceApi {
  return {
    require(options: ConfirmationOptions) {
      confirmationEventBus.emit("confirm", options);
    },
    close() {
      confirmationEventBus.emit("close");
    },
  };
}

/**
 * `UConfirmationService` — installed as a Vue plugin:
 * `app.use(UConfirmationService)`. Matches Vue's own idiomatic plugin-object
 * shape (`{ install(app) { app.provide(SYMBOL, api) } }`), per Plan §1.2 —
 * not PrimeVue's exact internal shape (Option B: reference, not verbatim).
 */
export const UConfirmationService: Plugin = {
  install(app: App) {
    app.provide(UConfirmationServiceKey, createConfirmationServiceApi());
  },
};
