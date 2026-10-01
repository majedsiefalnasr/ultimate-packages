/**
 * Ultimate Aura-derived metergroup component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset metergroup module
 * (`.vendor-extracted/themes/src/presets/aura/metergroup/index.ts`). Top-level
 * sections `root`, `meters`, `label`, `labelMarker`, `labelIcon`, `labelList` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's metergroup module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `MeterGroupComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface MeterGroupComponentTokens {
  root?: Record<string, unknown>;
  meters?: Record<string, unknown>;
  label?: Record<string, unknown>;
  labelMarker?: Record<string, unknown>;
  labelIcon?: Record<string, unknown>;
  labelList?: Record<string, unknown>;
}

export const meterGroup: MeterGroupComponentTokens = {
  root: {
    borderRadius: "{content.border.radius}",
    gap: "1rem",
  },
  meters: {
    background: "{content.border.color}",
    size: "0.5rem",
  },
  label: {
    gap: "0.5rem",
  },
  labelMarker: {
    size: "0.5rem",
  },
  labelIcon: {
    size: "1rem",
  },
  labelList: {
    verticalGap: "0.5rem",
    horizontalGap: "1rem",
  },
};
