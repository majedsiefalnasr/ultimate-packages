/**
 * Ultimate Aura-derived timeline component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset timeline module
 * (`.vendor-extracted/themes/src/presets/aura/timeline/index.ts`). Top-level
 * sections `event`, `horizontal`, `vertical`, `eventMarker`, `eventConnector` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's timeline module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `TimelineComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface TimelineComponentTokens {
  event?: Record<string, unknown>;
  horizontal?: Record<string, unknown>;
  vertical?: Record<string, unknown>;
  eventMarker?: Record<string, unknown>;
  eventConnector?: Record<string, unknown>;
}

export const timeline: TimelineComponentTokens = {
  event: {
    minHeight: "5rem",
  },
  horizontal: {
    eventContent: {
      padding: "1rem 0",
    },
  },
  vertical: {
    eventContent: {
      padding: "0 1rem",
    },
  },
  eventMarker: {
    size: "1.125rem",
    borderRadius: "50%",
    borderWidth: "2px",
    background: "{content.background}",
    borderColor: "{content.border.color}",
    content: {
      borderRadius: "50%",
      size: "0.375rem",
      background: "{primary.color}",
      insetShadow: "0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)",
    },
  },
  eventConnector: {
    color: "{content.border.color}",
    size: "2px",
  },
};
