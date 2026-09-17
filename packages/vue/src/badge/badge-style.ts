import type { StyleModule } from "@ultimate/vue-core";
import { style as badgeCss } from "@ultimate/uix-styles/badge";

/**
 * `@ultimate/uix-styles/badge` exports only a plain `style: string` (raw CSS
 * with `dt()` token references), no `classes` resolver map — matching the
 * same shape already confirmed for `packages/vue/src/button/button-style.ts`
 * and `packages/ng/src/badge/badge-style.ts`. The `classes` map below is
 * authored locally, ported from the real extracted PrimeVue
 * `BadgeStyle.js`'s own `classes.root` function
 * (`/tmp/pv-extract/badge/style/BadgeStyle.js`), with `.p-badge*` selectors
 * renamed to `.u-badge*` and the upstream `{ props, instance }`-wrapped
 * signature flattened to a plain params object, matching this package's
 * `createBaseComponent`'s `cx(key, params)` call contract (no passthrough/
 * instance wrapper layer, Option B).
 */
const css = /*css*/ `
    ${badgeCss}
`;

/** Params `UBadge` passes into `cx('root', params)` — see `createBaseComponent`'s `cx()`. */
export interface BadgeClassesParams {
  value?: string | number | null;
  hasDefaultSlot?: boolean;
  size?: "small" | "large" | "xlarge" | null;
  severity?: "secondary" | "info" | "success" | "warn" | "danger" | "contrast" | null;
}

const classes = {
  root: (params: BadgeClassesParams = {}) => {
    const { value, hasDefaultSlot, size, severity } = params;

    return [
      "u-badge",
      {
        "u-badge-circle": value != null && String(value).length === 1,
        "u-badge-dot": value == null && !hasDefaultSlot,
        "u-badge-sm": size === "small",
        "u-badge-lg": size === "large",
        "u-badge-xl": size === "xlarge",
        "u-badge-info": severity === "info",
        "u-badge-success": severity === "success",
        "u-badge-warn": severity === "warn",
        "u-badge-danger": severity === "danger",
        "u-badge-secondary": severity === "secondary",
        "u-badge-contrast": severity === "contrast",
      },
    ];
  },
};

/** `createBaseComponent`-shaped style module for `UBadge`. */
export const badgeStyleModule: StyleModule = { css, classes };
