/**
 * Ultimate Aura-derived image component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset image module
 * (`.vendor-extracted/themes/src/presets/aura/image/index.ts`). Top-level
 * sections `root`, `preview`, `toolbar`, `action` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's image module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `ImageComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface ImageComponentTokens {
  root?: Record<string, unknown>;
  preview?: Record<string, unknown>;
  toolbar?: Record<string, unknown>;
  action?: Record<string, unknown>;
}

export const image: ImageComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  preview: {
    icon: {
      size: "1.5rem",
    },
    mask: {
      background: "{mask.background}",
      color: "{mask.color}",
    },
  },
  toolbar: {
    position: {
      left: "auto",
      right: "1rem",
      top: "1rem",
      bottom: "auto",
    },
    blur: "8px",
    background: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: "1px",
    borderRadius: "30px",
    padding: ".5rem",
    gap: "0.5rem",
  },
  action: {
    hoverBackground: "rgba(255,255,255,0.1)",
    color: "{surface.50}",
    hoverColor: "{surface.0}",
    size: "3rem",
    iconSize: "1.5rem",
    borderRadius: "50%",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
};
