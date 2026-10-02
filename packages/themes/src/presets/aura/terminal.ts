/**
 * Ultimate Aura-derived terminal component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset terminal module
 * (`.vendor-extracted/themes/src/presets/aura/terminal/index.ts`). Top-level
 * sections `root`, `prompt`, `commandResponse` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's terminal module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `TerminalComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface TerminalComponentTokens {
  root?: Record<string, unknown>;
  prompt?: Record<string, unknown>;
  commandResponse?: Record<string, unknown>;
}

export const terminal: TerminalComponentTokens = {
  root: {
    background: "{form.field.background}",
    borderColor: "{form.field.border.color}",
    color: "{form.field.color}",
    height: "18rem",
    padding: "{form.field.padding.y} {form.field.padding.x}",
    borderRadius: "{form.field.border.radius}",
  },
  prompt: {
    gap: "0.25rem",
  },
  commandResponse: {
    margin: "2px 0",
  },
};
