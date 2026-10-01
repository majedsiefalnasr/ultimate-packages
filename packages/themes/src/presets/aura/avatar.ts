/**
 * Ultimate Aura-derived avatar component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset avatar module
 * (`.vendor-extracted/themes/src/presets/aura/avatar/index.ts`). Top-level
 * sections `root`, `icon`, `group`, `lg`, `xl` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's avatar module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `AvatarComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface AvatarComponentTokens {
  root?: Record<string, unknown>;
  icon?: Record<string, unknown>;
  group?: Record<string, unknown>;
  lg?: Record<string, unknown>;
  xl?: Record<string, unknown>;
}

export const avatar: AvatarComponentTokens = {
  root: {
    width: "2rem",
    height: "2rem",
    fontSize: "1rem",
    background: "{content.border.color}",
    color: "{content.color}",
    borderRadius: "{content.border.radius}",
  },
  icon: {
    size: "1rem",
  },
  group: {
    borderColor: "{content.background}",
    offset: "-0.75rem",
  },
  lg: {
    width: "3rem",
    height: "3rem",
    fontSize: "1.5rem",
    icon: {
      size: "1.5rem",
    },
    group: {
      offset: "-1rem",
    },
  },
  xl: {
    width: "4rem",
    height: "4rem",
    fontSize: "2rem",
    icon: {
      size: "2rem",
    },
    group: {
      offset: "-1.5rem",
    },
  },
};
