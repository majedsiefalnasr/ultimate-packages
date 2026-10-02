/**
 * Ultimate Aura-derived inputotp component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inputotp module
 * (`.vendor-extracted/themes/src/presets/aura/inputotp/index.ts`). Top-level
 * sections `root`, `input` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's inputotp module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `InputOtpComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface InputOtpComponentTokens {
  root?: Record<string, unknown>;
  input?: Record<string, unknown>;
}

export const inputOtp: InputOtpComponentTokens = {
  root: {
    gap: "0.5rem",
  },
  input: {
    width: "2.5rem",
    sm: {
      width: "2rem",
    },
    lg: {
      width: "3rem",
    },
  },
};
