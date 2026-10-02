import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived tabs component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset tabs module
 * (`.vendor-extracted/themes/src/presets/aura/tabs/index.ts`). Top-level
 * sections `root`, `tablist`, `tab`, `tabpanel`, `navButton`, `activeBar` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's tabs module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `TabsComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `tablist`, `tab`, `tabpanel`, `navButton`, `activeBar` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface TabsComponentTokens extends ComponentTokens {
  tablist?: Record<string, unknown>;
  tab?: Record<string, unknown>;
  tabpanel?: Record<string, unknown>;
  navButton?: Record<string, unknown>;
  activeBar?: Record<string, unknown>;
}

export const tabs: TabsComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  tablist: {
    borderWidth: "0 0 1px 0",
    background: "{content.background}",
    borderColor: "{content.border.color}",
  },
  tab: {
    background: "transparent",
    hoverBackground: "transparent",
    activeBackground: "transparent",
    borderWidth: "0 0 1px 0",
    borderColor: "{content.border.color}",
    hoverBorderColor: "{content.border.color}",
    activeBorderColor: "{primary.color}",
    color: "{text.muted.color}",
    hoverColor: "{text.color}",
    activeColor: "{primary.color}",
    padding: "1rem 1.125rem",
    fontWeight: "600",
    margin: "0 0 -1px 0",
    gap: "0.5rem",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "-1px",
      shadow: "{focus.ring.shadow}",
    },
  },
  tabpanel: {
    background: "{content.background}",
    color: "{content.color}",
    padding: "0.875rem 1.125rem 1.125rem 1.125rem",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "inset {focus.ring.shadow}",
    },
  },
  navButton: {
    background: "{content.background}",
    color: "{text.muted.color}",
    hoverColor: "{text.color}",
    width: "2.5rem",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "-1px",
      shadow: "{focus.ring.shadow}",
    },
  },
  activeBar: {
    height: "1px",
    bottom: "-1px",
    background: "{primary.color}",
  },
  colorScheme: {
    light: {
      navButton: {
        shadow: "0px 0px 10px 50px rgba(255, 255, 255, 0.6)",
      },
    },
    dark: {
      navButton: {
        shadow: "0px 0px 10px 50px color-mix(in srgb, {content.background}, transparent 50%)",
      },
    },
  },
};
