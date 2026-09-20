import { EventBus } from "@ultimate/uix-utils/eventbus";

/**
 * Ultimate-owned adaptation of PrimeReact's own `TerminalService` (real
 * source: `components/lib/terminalservice/TerminalService.js`, extracted
 * this task via `extract-primereact-source.mjs`) — confirmed against real
 * source: it is a plain module-level `EventBus()` instance (`export const
 * TerminalService = EventBus()`), not a class/hook/context. `UTerminal`
 * emits a `"command"` event on Enter and listens for `"response"`/`"clear"`
 * events, matching real source's own `Terminal.js` mechanism exactly.
 *
 * Unlike Confirmation/Toast (shared across multiple components — a
 * `confirmDialog()`/`confirmPopup()` pair, or an arbitrary number of
 * `add()` calls from anywhere in the app), Terminal's event bus has
 * exactly one consumer component and one publisher contract (an
 * application wiring its own command handler), so this stays local to
 * `packages/react/src/terminal/` rather than `react-core` — no other
 * component needs it, so no `-core` extension is justified here (contrast
 * with `react-core/confirmation`'s genuine multi-consumer need).
 */
export const terminalEventBus = EventBus();

/** A single submitted command and its (eventually published) response. */
export interface UTerminalCommand {
  text: string;
  response?: string;
}
