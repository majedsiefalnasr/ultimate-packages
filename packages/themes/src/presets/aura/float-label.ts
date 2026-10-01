/**
 * Ultimate Aura-derived floatlabel component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset floatlabel module
 * (`.vendor-extracted/themes/src/presets/aura/floatlabel/index.ts`). Top-level
 * sections `root`, `over`, `in`, `on` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's floatlabel module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `FloatLabelComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface FloatLabelComponentTokens {
  root?: Record<string, unknown>;
  over?: Record<string, unknown>;
  in?: Record<string, unknown>;
  on?: Record<string, unknown>;
}

export const floatLabel: FloatLabelComponentTokens = {
  root: {
    color: "{form.field.float.label.color}",
    focusColor: "{form.field.float.label.focus.color}",
    activeColor: "{form.field.float.label.active.color}",
    invalidColor: "{form.field.float.label.invalid.color}",
    transitionDuration: "0.2s",
    positionX: "{form.field.padding.x}",
    positionY: "{form.field.padding.y}",
    fontWeight: "500",
    active: {
      fontSize: "0.75rem",
      fontWeight: "400",
    },
  },
  over: {
    active: {
      top: "-1.25rem",
    },
  },
  in: {
    input: {
      paddingTop: "1.5rem",
      paddingBottom: "{form.field.padding.y}",
    },
    active: {
      top: "{form.field.padding.y}",
    },
  },
  on: {
    borderRadius: "{border.radius.xs}",
    active: {
      background: "{form.field.background}",
      padding: "0 0.125rem",
    },
  },
};
