import type { StyleModule } from "@ultimate/react-core";
import { style as floatLabelStyle } from "@ultimate/uix-styles/floatlabel";

/**
 * `useComponentBase`-shaped style module for `UFloatLabel`. The structural
 * CSS is the shared `@ultimate/uix-styles/floatlabel` module (ADR-082), so it
 * reads the Aura `floatlabel` tokens and matches Angular and Vue.
 */
const css = /*css*/ `
    ${floatLabelStyle}
`;

const classes = {
  root: (params: { variant?: "in" | "over" | "on" } = {}) => [
    "u-float-label",
    {
      "u-float-label-over": params.variant === "over",
      "u-float-label-on": params.variant === "on",
      "u-float-label-in": params.variant === "in",
    },
  ],
};

export const floatLabelStyleModule: StyleModule = { css, classes };
