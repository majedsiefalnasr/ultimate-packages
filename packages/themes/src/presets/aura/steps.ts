/**
 * Ultimate Aura-derived steps component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset steps module
 * (`.vendor-extracted/themes/src/presets/aura/steps/index.ts`). Top-level
 * sections `root`, `separator`, `itemLink`, `itemLabel`, `itemNumber` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's steps module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `StepsComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface StepsComponentTokens {
  root?: Record<string, unknown>;
  separator?: Record<string, unknown>;
  itemLink?: Record<string, unknown>;
  itemLabel?: Record<string, unknown>;
  itemNumber?: Record<string, unknown>;
}

export const steps: StepsComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  separator: {
    background: "{content.border.color}",
  },
  itemLink: {
    borderRadius: "{content.border.radius}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
    gap: "0.5rem",
  },
  itemLabel: {
    color: "{text.muted.color}",
    activeColor: "{primary.color}",
    fontWeight: "500",
  },
  itemNumber: {
    background: "{content.background}",
    activeBackground: "{content.background}",
    borderColor: "{content.border.color}",
    activeBorderColor: "{content.border.color}",
    color: "{text.muted.color}",
    activeColor: "{primary.color}",
    size: "2rem",
    fontSize: "1.143rem",
    fontWeight: "500",
    borderRadius: "50%",
    shadow: "0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)",
  },
};
