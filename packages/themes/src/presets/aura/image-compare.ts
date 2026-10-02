/**
 * Ultimate Aura-derived imagecompare component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset imagecompare module
 * (`.vendor-extracted/themes/src/presets/aura/imagecompare/index.ts`). Top-level
 * sections `handle` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's imagecompare module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `ImageCompareComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface ImageCompareComponentTokens {
  handle?: Record<string, unknown>;
}

export const imageCompare: ImageCompareComponentTokens = {
  handle: {
    size: "15px",
    hoverSize: "30px",
    background: "rgba(255,255,255,0.3)",
    hoverBackground: "rgba(255,255,255,0.3)",
    borderColor: "unset",
    hoverBorderColor: "unset",
    borderWidth: "0",
    borderRadius: "50%",
    transitionDuration: "{transition.duration}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "rgba(255,255,255,0.3)",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
};
