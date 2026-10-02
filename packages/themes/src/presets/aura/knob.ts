/**
 * Ultimate Aura-derived knob component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset knob module
 * (`.vendor-extracted/themes/src/presets/aura/knob/index.ts`). Top-level
 * sections `root`, `value`, `range`, `text` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's knob module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `KnobComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface KnobComponentTokens {
  root?: Record<string, unknown>;
  value?: Record<string, unknown>;
  range?: Record<string, unknown>;
  text?: Record<string, unknown>;
}

export const knob: KnobComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  value: {
    background: "{primary.color}",
  },
  range: {
    background: "{content.border.color}",
  },
  text: {
    color: "{text.muted.color}",
  },
};
