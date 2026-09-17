import { EventBus } from "@ultimate/uix-utils/eventbus";
import { markRaw } from "vue";
import type { App, Component, InjectionKey, Plugin } from "vue";

/**
 * Ultimate-owned Vue infrastructure — genuinely new work, no Angular/React
 * equivalent (Plan §1.2, Spec §3.0/§7). Informed by real PrimeVue's
 * `DialogService` (extracted via
 * `extract-primevue-source.mjs <tarball> primevue dialogservice`,
 * `/tmp/pv-extract/dialogservice/DialogService.js`) — Ultimate's shape is
 * fixed by the Plan, not copied verbatim (Option B); real PrimeVue's
 * `app.config.globalProperties.$dialog` convenience is not carried here, for
 * the same reason stated in `confirmation-service.ts`.
 *
 * Dispatch mechanism: `@ultimate/uix-utils`'s existing `eventbus` module,
 * matching real PrimeVue's own `DynamicDialogEventBus`
 * (`/tmp/pv-extract/dynamicdialogeventbus/DynamicDialogEventBus.js`, same
 * `EventBus()` shape as `ConfirmationEventBus`).
 *
 * `open()`/`close()` only emit; DynamicDialog's own future Batch 1 task
 * subscribes to `dialogEventBus` and renders (not this task's job).
 */
export const dialogEventBus = EventBus();

/** Minimum open-options shape — DynamicDialog's own future task extends this with real PrimeVue's full `DynamicDialogOptions` surface (props/templates/data/onClose, verified against `/tmp/pv-extract/dynamicdialogoptions`), not invented here. */
export interface DynamicDialogOptions {
  data?: unknown;
  [key: string]: unknown;
}

/**
 * Handle returned by `open()` for lifecycle control on the specific instance
 * opened — matches real PrimeVue's `DynamicDialogInstance` shape
 * (`content`/`options`/`data`/`close(params)`,
 * `/tmp/pv-extract/dynamicdialogoptions`), grounded in what the dynamic
 * dialog mechanism needs (calling code must be able to close the exact
 * instance it opened, not just "the last dialog").
 */
export interface DynamicDialogRef {
  /** The component to render as the dialog's content (kept non-reactive via `markRaw`, matching upstream). */
  content: Component;
  /** Options passed to `open()`. */
  options: DynamicDialogOptions;
  /** Convenience alias for `options.data`, matching upstream. */
  data: unknown;
  /** Closes this specific dialog instance. */
  close(params?: unknown): void;
}

/** `UDialogService`'s public API — Plan §1.2, binding. */
export interface DialogServiceApi {
  /** Opens a dialog rendering `component`, returning a handle for lifecycle control (request/registration). */
  open(component: Component, options?: DynamicDialogOptions): DynamicDialogRef;
  /** Closes the dialog identified by the given ref. */
  close(ref: DynamicDialogRef): void;
}

export const UDialogServiceKey: InjectionKey<DialogServiceApi> = Symbol("UDialogService");

function createDialogServiceApi(): DialogServiceApi {
  return {
    open(component: Component, options: DynamicDialogOptions = {}) {
      const ref: DynamicDialogRef = {
        content: markRaw(component),
        options,
        data: options.data,
        close(params?: unknown) {
          dialogEventBus.emit("close", { ref, params });
        },
      };

      dialogEventBus.emit("open", { ref });

      return ref;
    },
    close(ref: DynamicDialogRef) {
      ref.close();
    },
  };
}

/**
 * `UDialogService` — installed as a Vue plugin: `app.use(UDialogService)`.
 * Matches Vue's own idiomatic plugin-object shape, per Plan §1.2.
 */
export const UDialogService: Plugin = {
  install(app: App) {
    app.provide(UDialogServiceKey, createDialogServiceApi());
  },
};
