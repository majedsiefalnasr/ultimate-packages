/**
 * Ultimate Aura-derived dialog component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset dialog module
 * (`.vendor-extracted/themes/src/presets/aura/dialog/index.ts`, recovered in
 * Task 9). `root`, `header`, `title`, `content`, `footer` are transcribed
 * as-is from the extracted upstream source.
 *
 * Like checkbox and menu, upstream's dialog module has NO `colorScheme`
 * split — every color value references `{overlay.modal.*}` semantic
 * tokens instead, and mode-awareness flows transitively through those
 * references, which ARE mode-split in `base.ts`. This type is
 * intentionally a flat `Record<string, unknown>` shape rather than
 * `ComponentTokens<T>` (Task 8's contract type) — forcing a fake
 * `colorScheme` wrapper here would misrepresent upstream's real structure.
 */
export interface DialogComponentTokens {
  root?: Record<string, unknown>;
  header?: Record<string, unknown>;
  title?: Record<string, unknown>;
  content?: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export const dialog: DialogComponentTokens = {
  root: {
    background: "{overlay.modal.background}",
    borderColor: "{overlay.modal.border.color}",
    color: "{overlay.modal.color}",
    borderRadius: "{overlay.modal.border.radius}",
    shadow: "{overlay.modal.shadow}",
  },
  header: {
    padding: "{overlay.modal.padding}",
    gap: "0.5rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  content: {
    padding: "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}",
  },
  footer: {
    padding: "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}",
    gap: "0.5rem",
  },
};
