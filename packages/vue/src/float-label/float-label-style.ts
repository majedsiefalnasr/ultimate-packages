import type { StyleModule } from "@ultimate/vue-core";
import { style as floatLabelStyle } from "@ultimate/uix-styles/floatlabel";

/**
 * `createBaseComponent`-shaped style module for `UFloatLabel`. The structural
 * CSS is the shared `@ultimate/uix-styles/floatlabel` module (ADR-082), so it
 * reads the Aura `floatlabel` tokens and matches Angular and React.
 */
const css = /*css*/ `
    ${floatLabelStyle}
`;

const classes = {
  root: (params: { variant?: "in" | "over" | "on" } = {}) => {
    const { variant } = params;
    return [
      "u-float-label",
      {
        "u-float-label-over": variant === "over",
        "u-float-label-on": variant === "on",
        "u-float-label-in": variant === "in",
      },
    ];
  },
};

export const floatLabelStyleModule: StyleModule = { css, classes };
