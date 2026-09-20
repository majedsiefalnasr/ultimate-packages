import { EventBus } from "@ultimate/uix-utils/eventbus";

/**
 * Ultimate-owned adaptation of PrimeVue's own `TerminalService` (real
 * source: `packages/primevue/src/terminalservice/TerminalService.js`,
 * extracted this task via `extract-primevue-source.mjs`) — confirmed
 * against real source: `export default EventBus()`, a plain module-level
 * event-bus instance, not a Vue plugin/provide-inject service (unlike
 * `UConfirmationService`/`UDialogService`/`UToastService`, which are
 * genuinely multi-consumer and provide/inject-wired). `UTerminal` emits a
 * `"command"` event on Enter and listens for `"response"`/`"clear"`
 * events, matching real source's own `Terminal.vue` mechanism exactly.
 *
 * Kept local to `packages/vue/src/terminal/` (not `vue-core`) — Terminal
 * has exactly one consumer component, unlike Toast/Confirmation's genuine
 * multi-consumer need for a shared, injectable service tier.
 */
export const terminalEventBus = EventBus();

/** A single submitted command and its (eventually published) response. */
export interface UTerminalCommand {
  text: string;
  response?: string;
}
