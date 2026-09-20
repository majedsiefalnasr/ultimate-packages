import type * as React from "react";
import { EventBus } from "@ultimate/uix-utils/eventbus";

/**
 * Ultimate-owned React infrastructure — genuinely new work, no prior
 * `react-core` equivalent (disclosed per this task's brief). Informed by
 * real PrimeReact's own `confirmDialog`/`confirmPopup` functions
 * (`components/lib/confirmdialog/ConfirmDialog.js`,
 * `components/lib/confirmpopup/ConfirmPopup.js`, both extracted this
 * session via `extract-primereact-source.mjs`) — confirmed real mechanism:
 * each is a plain module-level function that emits an event via
 * PrimeReact's own `OverlayService.emit('confirm-dialog'|'confirm-popup',
 * props)`, consumed by an always-mounted `<ConfirmDialog>`/`<ConfirmPopup>`
 * companion component subscribed via `OverlayService.on(...)` — not a React
 * Context/hook-based service.
 *
 * `react-core` has no `OverlayService` equivalent, so this module uses
 * `@ultimate/uix-utils`'s already-built `eventbus` module directly instead
 * — the same shared, already-built primitive this task's Vue infrastructure
 * (`vue-core`'s `UConfirmationService`) already uses for the identical
 * "service call → event → listening component renders" shape, avoiding a
 * second, redundant event-bus implementation.
 */
export const confirmationEventBus = EventBus();

/** Minimum request-options shape `confirmDialog()`/`confirmPopup()` need to dispatch — matching real PrimeReact's own `ConfirmDialog`/`ConfirmPopup` prop surface, scoped to this capability's spec-mandated fields. */
export interface UConfirmationOptions {
  message?: string;
  header?: string;
  icon?: React.ReactNode;
  accept?: () => void;
  reject?: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
  closeOnEscape?: boolean;
  /** The target element the popup should be positioned relative to (`confirmPopup` only). */
  target?: HTMLElement | null;
  /** Whether the dialog is displayed as modal (`confirmDialog` only). */
  modal?: boolean;
  visible?: boolean;
  /** Matches only the `UConfirmDialog`/`UConfirmPopup` instance carrying the same `group` (undefined matches undefined) — matching real PrimeReact's own `group` field, used when a component tree has multiple confirm dialogs/popups. */
  group?: string;
}

/**
 * Dispatches a confirmation-dialog request to any mounted
 * `UConfirmDialog` (`packages/react/src/confirm-dialog/`) — matching real
 * PrimeReact's own `confirmDialog(props)` function shape exactly.
 */
export function confirmDialog(options: UConfirmationOptions = {}): void {
  confirmationEventBus.emit("confirm-dialog", { ...options, visible: options.visible ?? true });
}

/**
 * Dispatches a confirmation-popup request to any mounted `UConfirmPopup`
 * (`packages/react/src/confirm-popup/`) — matching real PrimeReact's own
 * `confirmPopup(props)` function shape exactly.
 */
export function confirmPopup(options: UConfirmationOptions = {}): void {
  confirmationEventBus.emit("confirm-popup", { ...options, visible: options.visible ?? true });
}
