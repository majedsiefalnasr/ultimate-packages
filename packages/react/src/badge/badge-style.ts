import type { StyleModule } from "@ultimate/react-core";
import { style as badgeStyle } from "@ultimate/uix-styles/badge";

/**
 * `useComponentBase`-shaped style module for `UBadge`. The structural CSS is
 * the shared `@ultimate/uix-styles/badge` module (ADR-082), so it reads the
 * Aura `badge` tokens and matches Angular and Vue. The overlay wrapper CSS
 * (`.u-overlaybadge`) is not part of this module; React has no OverlayBadge
 * yet (ADR-088).
 */
const css = /*css*/ `
    ${badgeStyle}
`;

export type BadgeSeverity =
  "secondary" | "info" | "success" | "warn" | "warning" | "danger" | "contrast";

export interface BadgeClassesParams {
  value?: string | number | null;
  size?: "small" | "large" | "xlarge" | null;
  severity?: BadgeSeverity | null;
}

const classes = {
  root: (params: BadgeClassesParams = {}) => {
    const { value, size, severity } = params;
    const normalizedSeverity = severity === "warning" ? "warn" : severity;

    return [
      "u-badge u-component",
      {
        "u-badge-circle": value != null && String(value).length === 1,
        "u-badge-dot": value == null || value === "",
        "u-badge-sm": size === "small",
        "u-badge-lg": size === "large",
        "u-badge-xl": size === "xlarge",
        "u-badge-info": normalizedSeverity === "info",
        "u-badge-success": normalizedSeverity === "success",
        "u-badge-warn": normalizedSeverity === "warn",
        "u-badge-danger": normalizedSeverity === "danger",
        "u-badge-secondary": normalizedSeverity === "secondary",
        "u-badge-contrast": normalizedSeverity === "contrast",
      },
    ];
  },
};

export const badgeStyleModule: StyleModule = { css, classes };
