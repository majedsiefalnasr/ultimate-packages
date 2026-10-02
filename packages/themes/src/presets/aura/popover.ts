/**
 * Ultimate Aura-derived popover component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset popover module
 * (`.vendor-extracted/themes/src/presets/aura/popover/index.ts`). Top-level
 * sections `root`, `content` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's popover module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `PopoverComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface PopoverComponentTokens {
  root?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export const popover: PopoverComponentTokens = {
  root: {
    background: "{overlay.popover.background}",
    borderColor: "{overlay.popover.border.color}",
    color: "{overlay.popover.color}",
    borderRadius: "{overlay.popover.border.radius}",
    shadow: "{overlay.popover.shadow}",
    gutter: "10px",
    arrowOffset: "1.25rem",
  },
  content: {
    padding: "{overlay.popover.padding}",
  },
};
