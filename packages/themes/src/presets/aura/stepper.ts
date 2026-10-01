/**
 * Ultimate Aura-derived stepper component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset stepper module
 * (`.vendor-extracted/themes/src/presets/aura/stepper/index.ts`). Top-level
 * sections `root`, `separator`, `step`, `stepHeader`, `stepTitle`, `stepNumber`, `steppanels`, `steppanel` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's stepper module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `StepperComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface StepperComponentTokens {
  root?: Record<string, unknown>;
  separator?: Record<string, unknown>;
  step?: Record<string, unknown>;
  stepHeader?: Record<string, unknown>;
  stepTitle?: Record<string, unknown>;
  stepNumber?: Record<string, unknown>;
  steppanels?: Record<string, unknown>;
  steppanel?: Record<string, unknown>;
}

export const stepper: StepperComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  separator: {
    background: "{content.border.color}",
    activeBackground: "{primary.color}",
    margin: "0 0 0 1.625rem",
    size: "2px",
  },
  step: {
    padding: "0.5rem",
    gap: "1rem",
  },
  stepHeader: {
    padding: "0",
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
  stepTitle: {
    color: "{text.muted.color}",
    activeColor: "{primary.color}",
    fontWeight: "500",
  },
  stepNumber: {
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
  steppanels: {
    padding: "0.875rem 0.5rem 1.125rem 0.5rem",
  },
  steppanel: {
    background: "{content.background}",
    color: "{content.color}",
    padding: "0",
    indent: "1rem",
  },
};
