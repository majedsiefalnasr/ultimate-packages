/**
 * Ultimate Aura-derived iftalabel component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset iftalabel module
 * (`.vendor-extracted/themes/src/presets/aura/iftalabel/index.ts`). Top-level
 * sections `root`, `input` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's iftalabel module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `IftaLabelComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface IftaLabelComponentTokens {
  root?: Record<string, unknown>;
  input?: Record<string, unknown>;
}

export const iftaLabel: IftaLabelComponentTokens = {
  root: {
    color: "{form.field.float.label.color}",
    focusColor: "{form.field.float.label.focus.color}",
    invalidColor: "{form.field.float.label.invalid.color}",
    transitionDuration: "0.2s",
    positionX: "{form.field.padding.x}",
    top: "{form.field.padding.y}",
    fontSize: "0.75rem",
    fontWeight: "400",
  },
  input: {
    paddingTop: "1.5rem",
    paddingBottom: "{form.field.padding.y}",
  },
};
