/**
 * Represents a confirmation dialog/popup request — the request-shape
 * `UConfirmationService.confirm()` dispatches. Subset of real PrimeNG's own
 * `Confirmation` interface (`.vendor-extracted/ng/api/confirmation.ts`),
 * scoped to the fields `UConfirmDialog`/`UConfirmPopup`'s own
 * spec-mandated surface actually needs — no drag/resize/maximize-adjacent
 * fields, no `EventEmitter`-typed accept/reject-event fields (this port's
 * `UConfirmationService` dispatches accept/reject via a plain callback
 * pair instead of upstream's per-call-site `EventEmitter`, since Angular's
 * signal-first architecture this project already uses elsewhere has no
 * established precedent for constructing a fresh `EventEmitter` per
 * confirmation call).
 */
export interface UConfirmation {
  /** The message to be displayed in the confirmation dialog/popup. */
  message?: string;
  /** A unique key to identify which `UConfirmDialog`/`UConfirmPopup` instance should respond (for multi-instance apps). */
  key?: string;
  /** The name of the icon to be displayed. */
  icon?: string;
  /** The header text of the confirmation dialog. */
  header?: string;
  /** The callback function to be executed when the accept button is clicked. */
  accept?: () => void;
  /** The callback function to be executed when the reject button is clicked. */
  reject?: () => void;
  /** The label text for the accept button. */
  acceptLabel?: string;
  /** The label text for the reject button. */
  rejectLabel?: string;
  /** Specifies whether the accept button should be visible. */
  acceptVisible?: boolean;
  /** Specifies whether the reject button should be visible. */
  rejectVisible?: boolean;
  /** Specifies whether the confirmation should be closed when the escape key is pressed. */
  closeOnEscape?: boolean;
  /** The target element the confirmation popup should be positioned relative to (`UConfirmPopup` only). */
  target?: HTMLElement;
  /** Whether the dialog is displayed as modal (`UConfirmDialog` only). */
  modal?: boolean;
}
