import type { StyleModule } from "@ultimate/vue-core";
import { style as iftaLabelStyle } from "@ultimate/uix-styles/iftalabel";

/**
 * `createBaseComponent`-shaped style module for `UIftaLabel`. The structural
 * CSS is the shared `@ultimate/uix-styles/iftalabel` module (ADR-082), so it
 * reads the Aura `iftalabel` tokens and matches Angular.
 */
const css = /*css*/ `
    ${iftaLabelStyle}
`;

export const iftaLabelStyleModule: StyleModule = {
  css,
  classes: { root: "u-ifta-label" },
};
